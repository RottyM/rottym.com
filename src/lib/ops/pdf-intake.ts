import { cleanDeskUrl } from './drop-parser';

export interface PdfTextToken {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfLinkRegion {
  url: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ExtractedPdfImage {
  id: string;
  page: number;
  width: number;
  height: number;
  file: File;
  previewUrl: string;
  filename: string;
}

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
  linkCount: number;
  images: ExtractedPdfImage[];
}

const MIN_EXTRACTED_IMAGE_PX = 64;
const MAX_CANVAS_SIDE_PX = 1400;
const MAX_UPLOAD_BYTES = 640 * 1024;

function findLinkForToken(token: PdfTextToken, links: PdfLinkRegion[]): string | undefined {
  if (!token.str.trim() || links.length === 0) return undefined;
  const cx = token.x + Math.max(1, token.width) / 2;
  const cy = token.y + Math.max(4, token.height) * 0.45;
  for (const link of links) {
    if (
      cx >= link.x1 - 3 &&
      cx <= link.x2 + 3 &&
      cy >= link.y1 - 4 &&
      cy <= link.y2 + 4
    ) {
      return link.url;
    }
  }
  return undefined;
}

/** Reconstructs ordered Markdown-friendly text lines from positioned PDF tokens and link rects. */
export function reconstructPdfPageLines(
  tokens: PdfTextToken[],
  rawLinks: PdfLinkRegion[]
): { lines: string[]; linkCount: number } {
  const validLinks: PdfLinkRegion[] = [];
  for (const l of rawLinks) {
    const cleaned = cleanDeskUrl(l.url);
    if (!cleaned) continue;
    validLinks.push({
      url: cleaned,
      x1: Math.min(l.x1, l.x2),
      y1: Math.min(l.y1, l.y2),
      x2: Math.max(l.x1, l.x2),
      y2: Math.max(l.y1, l.y2),
    });
  }

  const sorted = [...tokens]
    .filter((t) => Boolean(t.str))
    .sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > Math.max(3, Math.min(a.height || 10, b.height || 10) * 0.45)) {
        return yDiff;
      }
      return a.x - b.x;
    });

  const rows: Array<{ y: number; height: number; items: PdfTextToken[] }> = [];
  for (const tok of sorted) {
    const last = rows[rows.length - 1];
    const tol = Math.max(3, Math.max(tok.height || 10, last?.height || 10) * 0.45);
    if (last && Math.abs(last.y - tok.y) <= tol) {
      last.items.push(tok);
      last.y = (last.y + tok.y) / 2;
    } else {
      rows.push({ y: tok.y, height: tok.height || 10, items: [tok] });
    }
  }

  const seenUrls = new Set<string>();
  const lines: string[] = [];

  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x);

    type Segment = { text: string; url?: string; xStart: number; xEnd: number; height: number };
    const segments: Segment[] = [];

    for (const item of row.items) {
      const cleanGlyphs = item.str.replace(/\u2197/g, '').replace(/\u00a0/g, ' ');
      if (!cleanGlyphs) continue;
      const url = findLinkForToken(item, validLinks);
      const prev = segments[segments.length - 1];
      const itemEnd = item.x + Math.max(0, item.width);

      if (prev && prev.url === url) {
        const gap = item.x - prev.xEnd;
        const needsSpace =
          gap > Math.max(1.5, Math.min(prev.height, item.height || 10) * 0.22) &&
          !/\s$/.test(prev.text) &&
          !/^\s/.test(cleanGlyphs);
        prev.text += (needsSpace ? ' ' : '') + cleanGlyphs;
        prev.xEnd = Math.max(prev.xEnd, itemEnd);
      } else {
        segments.push({
          text: cleanGlyphs,
          url,
          xStart: item.x,
          xEnd: itemEnd,
          height: item.height || 10,
        });
      }
    }

    let line = '';
    let prevEnd = 0;
    for (const seg of segments) {
      const trimmed = seg.text.replace(/\s+/g, ' ').trim();
      if (!trimmed) continue;
      if (line && seg.xStart - prevEnd > Math.max(1.5, seg.height * 0.22) && !/\s$/.test(line)) {
        line += ' ';
      } else if (line && !/\s$/.test(line) && !/^[.,;:!?)]/.test(trimmed)) {
        line += ' ';
      }

      if (seg.url) {
        seenUrls.add(seg.url);
        line += `[${trimmed}](${seg.url})`;
      } else {
        line += trimmed;
      }
      prevEnd = seg.xEnd;
    }

    const normalized = line.replace(/\s+/g, ' ').trim();
    if (normalized) {
      lines.push(normalized);
    }
  }

  return { lines, linkCount: seenUrls.size };
}

interface RawPdfImageData {
  width?: number;
  height?: number;
  kind?: number;
  data?: Uint8Array | Uint8ClampedArray;
  bitmap?: ImageBitmap;
}

function drawPdfImageToCanvas(raw: RawPdfImageData): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const w = raw.width || raw.bitmap?.width || 0;
  const h = raw.height || raw.bitmap?.height || 0;
  if (w < MIN_EXTRACTED_IMAGE_PX || h < MIN_EXTRACTED_IMAGE_PX) return null;

  const scale = Math.min(1, MAX_CANVAS_SIDE_PX / Math.max(w, h));
  const targetW = Math.max(1, Math.round(w * scale));
  const targetH = Math.max(1, Math.round(h * scale));

  const outCanvas = document.createElement('canvas');
  outCanvas.width = targetW;
  outCanvas.height = targetH;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return null;

  if (raw.bitmap) {
    outCtx.drawImage(raw.bitmap, 0, 0, targetW, targetH);
    return outCanvas;
  }

  if (!raw.data || !w || !h) return null;

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = w;
  srcCanvas.height = h;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return null;

  const rgba = new Uint8ClampedArray(w * h * 4);
  const src = raw.data;

  if (src.length === w * h * 4) {
    rgba.set(src);
  } else if (src.length === w * h * 3) {
    for (let i = 0, j = 0; i < src.length; i += 3, j += 4) {
      rgba[j] = src[i];
      rgba[j + 1] = src[i + 1];
      rgba[j + 2] = src[i + 2];
      rgba[j + 3] = 255;
    }
  } else if (src.length === w * h) {
    for (let i = 0, j = 0; i < src.length; i += 1, j += 4) {
      const v = src[i];
      rgba[j] = v;
      rgba[j + 1] = v;
      rgba[j + 2] = v;
      rgba[j + 3] = 255;
    }
  } else if (raw.kind === 1) {
    const rowBytes = Math.ceil(w / 8);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const byteVal = src[y * rowBytes + (x >> 3)] ?? 0;
        const bit = (byteVal >> (7 - (x & 7))) & 1;
        const lum = bit ? 255 : 0;
        const j = (y * w + x) * 4;
        rgba[j] = lum;
        rgba[j + 1] = lum;
        rgba[j + 2] = lum;
        rgba[j + 3] = 255;
      }
    }
  } else {
    return null;
  }

  srcCtx.putImageData(new ImageData(rgba, w, h), 0, 0);
  outCtx.drawImage(srcCanvas, 0, 0, targetW, targetH);
  return outCanvas;
}

async function canvasToJpegFile(
  canvas: HTMLCanvasElement,
  filename: string
): Promise<{ file: File; previewUrl: string } | null> {
  const qualities = [0.86, 0.72, 0.56];
  for (const q of qualities) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', q)
    );
    if (!blob) continue;
    if (blob.size <= MAX_UPLOAD_BYTES || q === qualities[qualities.length - 1]) {
      const file = new File([blob], filename, { type: 'image/jpeg' });
      const previewUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
      if (!previewUrl) return null;
      return { file, previewUrl };
    }
  }
  return null;
}

function resolvePageObj(
  store: { get: (id: string, cb?: (v: unknown) => void, errCb?: (e: unknown) => void) => unknown },
  objId: string,
  timeoutMs = 2500
): Promise<RawPdfImageData | null> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, timeoutMs);

    try {
      store.get(
        objId,
        (val) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve((val as RawPdfImageData) || null);
        },
        () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(null);
        }
      );
    } catch {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(null);
      }
    }
  });
}

/** Browser-only extractor that pulls structured text lines, clickable links, and embedded photos from a PDF. */
export async function extractPdfForDesk(file: File): Promise<ExtractedPdfResult> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const doc = await loadingTask.promise;

  const pageTexts: string[] = [];
  const images: ExtractedPdfImage[] = [];
  const seenImageSigs = new Set<string>();
  let totalLinks = 0;

  try {
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);

      const annotations = (await page.getAnnotations().catch(() => [])) as Array<{
        subtype?: string;
        url?: string;
        unsafeUrl?: string;
        rect?: number[];
      }>;

      const links: PdfLinkRegion[] = [];
      for (const ann of annotations) {
        const url = ann.url || ann.unsafeUrl;
        if (!url || !Array.isArray(ann.rect) || ann.rect.length < 4) continue;
        links.push({
          url,
          x1: ann.rect[0],
          y1: ann.rect[1],
          x2: ann.rect[2],
          y2: ann.rect[3],
        });
      }

      const textContent = await page.getTextContent();
      const tokens: PdfTextToken[] = [];
      for (const rawItem of textContent.items) {
        if (!('str' in rawItem) || !Array.isArray(rawItem.transform)) continue;
        tokens.push({
          str: rawItem.str,
          x: rawItem.transform[4] ?? 0,
          y: rawItem.transform[5] ?? 0,
          width: rawItem.width ?? 0,
          height: rawItem.height || Math.abs(rawItem.transform[3] ?? 10) || 10,
        });
      }

      const reconstructed = reconstructPdfPageLines(tokens, links);
      totalLinks += reconstructed.linkCount;
      if (reconstructed.lines.length > 0) {
        pageTexts.push(reconstructed.lines.join('\n'));
      }

      const opList = await page.getOperatorList().catch(() => null);
      if (opList) {
        const { OPS } = pdfjs;
        const pageSeenObjIds = new Set<string>();
        const candidates: RawPdfImageData[] = [];

        for (let i = 0; i < opList.fnArray.length; i++) {
          const fn = opList.fnArray[i];
          const args = opList.argsArray[i];
          if (fn === OPS.paintImageXObject || fn === OPS.paintImageXObjectRepeat) {
            const objId = typeof args?.[0] === 'string' ? args[0] : '';
            if (!objId || pageSeenObjIds.has(objId)) continue;
            pageSeenObjIds.add(objId);
            const store = objId.startsWith('g_') && page.commonObjs.has(objId)
              ? page.commonObjs
              : page.objs;
            const resolved = await resolvePageObj(store, objId);
            if (resolved) candidates.push(resolved);
          } else if (fn === OPS.paintInlineImageXObject && args?.[0]) {
            candidates.push(args[0] as RawPdfImageData);
          }
        }

        let pageImgIdx = 0;
        for (const rawImg of candidates) {
          const canvas = drawPdfImageToCanvas(rawImg);
          if (!canvas) continue;
          pageImgIdx += 1;
          const filename = `pdf-p${pageNum}-img${pageImgIdx}.jpg`;
          const encoded = await canvasToJpegFile(canvas, filename);
          if (!encoded) continue;

          const sig = `${canvas.width}x${canvas.height}:${encoded.previewUrl.length}:${encoded.previewUrl.slice(0, 96)}`;
          if (seenImageSigs.has(sig)) continue;
          seenImageSigs.add(sig);

          images.push({
            id: `pdf-img-${pageNum}-${pageImgIdx}-${images.length + 1}`,
            page: pageNum,
            width: canvas.width,
            height: canvas.height,
            file: encoded.file,
            previewUrl: encoded.previewUrl,
            filename,
          });
        }
      }

      page.cleanup();
    }
  } finally {
    await loadingTask.destroy().catch(() => {});
  }

  return {
    text: pageTexts.join('\n'),
    pageCount: doc.numPages,
    linkCount: totalLinks,
    images,
  };
}
