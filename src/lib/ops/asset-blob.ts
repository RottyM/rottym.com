import { opsSetDoc } from '@/lib/ops/firestore-rest';

export const MAX_HOSTED_IMAGE_BYTES = 700 * 1024;
const ALLOWED_IMAGE_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

export interface StoredAssetBlob {
  id: string;
  clientId: string;
  mimeType: string;
  filename?: string;
  base64: string;
  byteSize: number;
  uploadedBy: string;
  createdAt: string;
}

/** Validates and stores an image blob (dataUrl or raw base64 + mimeType) in Firestore `ops_asset_blobs`. */
export async function storeAssetBlobFromInput(input: {
  clientId: string;
  uploadedBy: string;
  dataUrl?: unknown;
  base64?: unknown;
  mimeType?: unknown;
  filename?: unknown;
}): Promise<
  | { ok: true; blob: StoredAssetBlob; url: string }
  | { ok: false; status: number; error: string }
> {
  let mimeType = typeof input.mimeType === 'string' ? input.mimeType.trim().toLowerCase() : '';
  let base64 = typeof input.base64 === 'string' ? input.base64.trim() : '';

  if (typeof input.dataUrl === 'string' && input.dataUrl.trim()) {
    const match = input.dataUrl
      .trim()
      .match(/^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i);
    if (!match) {
      return { ok: false, status: 400, error: 'Invalid dataUrl image format.' };
    }
    mimeType = match[1].toLowerCase();
    base64 = match[2].replace(/\s+/g, '');
  } else if (base64) {
    base64 = base64.replace(/\s+/g, '');
    if (!mimeType && typeof input.filename === 'string') {
      const lower = input.filename.trim().toLowerCase();
      if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) mimeType = 'image/jpeg';
      else if (lower.endsWith('.webp')) mimeType = 'image/webp';
      else if (lower.endsWith('.gif')) mimeType = 'image/gif';
      else if (lower.endsWith('.png')) mimeType = 'image/png';
    }
    if (!mimeType) mimeType = 'image/png';
  }

  if (!ALLOWED_IMAGE_MIME.has(mimeType)) {
    return {
      ok: false,
      status: 400,
      error: 'Unsupported image type. Allowed: png, jpeg, webp, gif.',
    };
  }
  if (!base64 || !/^[A-Za-z0-9+/=]+$/.test(base64)) {
    return { ok: false, status: 400, error: 'Invalid base64 image data.' };
  }

  const buf = Buffer.from(base64, 'base64');
  if (buf.byteLength === 0 || buf.byteLength > MAX_HOSTED_IMAGE_BYTES) {
    return {
      ok: false,
      status: 400,
      error: `Hosted image copy must be between 1 byte and ${Math.round(MAX_HOSTED_IMAGE_BYTES / 1024)} KB (got ${Math.round(buf.byteLength / 1024)} KB).`,
    };
  }

  const blobId = `blob-${input.clientId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const doc: StoredAssetBlob = {
    id: blobId,
    clientId: input.clientId,
    mimeType: mimeType === 'image/jpg' ? 'image/jpeg' : mimeType,
    filename:
      typeof input.filename === 'string'
        ? input.filename.trim().slice(0, 140) || undefined
        : undefined,
    base64,
    byteSize: buf.byteLength,
    uploadedBy: input.uploadedBy,
    createdAt: new Date().toISOString(),
  };

  await opsSetDoc('ops_asset_blobs', blobId, doc as unknown as Record<string, unknown>);
  return { ok: true, blob: doc, url: `/api/ops/asset-blob/${blobId}` };
}

/** Resolves inline `dataUrl` or `base64`/`imageBase64` fields on an asset payload into a hosted blob URL. */
export async function resolveInlineAssetBlobUpload(
  rawItem: Record<string, unknown>,
  opts: { clientId: string; uploadedBy: string }
): Promise<{ ok: true; item: Record<string, unknown> } | { ok: false; status: number; error: string }> {
  const inlineDataUrl = rawItem.dataUrl;
  const inlineBase64 = rawItem.imageBase64 !== undefined ? rawItem.imageBase64 : rawItem.base64;
  const hasInline =
    (typeof inlineDataUrl === 'string' && inlineDataUrl.trim().length > 0) ||
    (typeof inlineBase64 === 'string' && inlineBase64.trim().length > 0);

  const sanitized: Record<string, unknown> = { ...rawItem };
  delete sanitized.dataUrl;
  delete sanitized.base64;
  delete sanitized.imageBase64;
  delete sanitized.mimeType;

  if (!hasInline) {
    return { ok: true, item: sanitized };
  }

  const stored = await storeAssetBlobFromInput({
    clientId: opts.clientId,
    uploadedBy: opts.uploadedBy,
    dataUrl: inlineDataUrl,
    base64: inlineBase64,
    mimeType: rawItem.mimeType,
    filename: typeof rawItem.file === 'string' ? rawItem.file : undefined,
  });
  if (!stored.ok) return stored;

  // Preserve original URL as sourceUrl if caller also included e.g. a Drive link alongside the uploaded image.
  const existingUrl =
    typeof sanitized.url === 'string' && sanitized.url.trim()
      ? sanitized.url.trim()
      : typeof sanitized.driveUrl === 'string' && sanitized.driveUrl.trim()
        ? sanitized.driveUrl.trim()
        : undefined;
  if (existingUrl && !sanitized.sourceUrl) {
    sanitized.sourceUrl = existingUrl;
  }
  delete sanitized.driveUrl;
  delete sanitized.assetLink;
  delete sanitized.imageUrl;
  sanitized.url = stored.url;
  return { ok: true, item: sanitized };
}
