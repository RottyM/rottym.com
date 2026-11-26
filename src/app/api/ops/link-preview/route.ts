import dns from 'node:dns/promises';
import net from 'node:net';
import { NextResponse } from 'next/server';
import { authorizeOpsUser, unauthorizedResponse } from '@/lib/ops/auth';

export interface LinkPreviewData {
  ok: true;
  url: string;
  finalUrl: string;
  domain: string;
  siteName?: string;
  title?: string;
  description?: string;
  image?: string;
  cardType: 'summary_large_image' | 'summary';
}

interface CacheEntry {
  data: LinkPreviewData;
  expiresAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_SIZE = 120;
const MAX_HTML_BYTES = 512 * 1024;
const previewCache = new Map<string, CacheEntry>();

function isPrivateIp(ip: string): boolean {
  if (!net.isIP(ip)) return true;
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return true;
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
  }
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('::ffff:')) {
    return isPrivateIp(normalized.slice(7));
  }
  if (/^(fe80|fc|fd)/i.test(normalized)) return true;
  return false;
}

async function assertSafeExternalUrl(rawUrl: string): Promise<URL> {
  const parsed = new URL(rawUrl);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http/https URLs are supported');
  }
  if (parsed.username || parsed.password) {
    throw new Error('Credentialed URLs are not allowed');
  }
  const host = parsed.hostname.toLowerCase();
  if (
    !host ||
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.localhost')
  ) {
    throw new Error('Local/internal hosts are blocked');
  }
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new Error('Private IP addresses are blocked');
    return parsed;
  }
  const resolved = await dns.lookup(host, { all: true }).catch(() => []);
  if (resolved.length === 0) {
    throw new Error('Unable to resolve target domain');
  }
  if (resolved.some((r) => isPrivateIp(r.address))) {
    throw new Error('Target domain resolves to a private network');
  }
  return parsed;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, num) => {
      const code = Number(num);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : '';
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : '';
    })
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMetaTags(html: string): Map<string, string> {
  const map = new Map<string, string>();
  const metaRegex = /<meta\b([^>]*?)>/gi;
  let m: RegExpExecArray | null;
  while ((m = metaRegex.exec(html)) !== null) {
    const attrs = m[1];
    const keyMatch = attrs.match(/(?:property|name)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);
    const valMatch = attrs.match(/content\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);
    const rawKey = (keyMatch?.[1] ?? keyMatch?.[2] ?? keyMatch?.[3] ?? '').trim().toLowerCase();
    const rawVal = valMatch?.[1] ?? valMatch?.[2] ?? valMatch?.[3];
    if (rawKey && rawVal !== undefined && !map.has(rawKey)) {
      const decoded = decodeHtmlEntities(rawVal);
      if (decoded) map.set(rawKey, decoded);
    }
  }
  return map;
}

function extractTitleTag(html: string): string | undefined {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m?.[1]) return undefined;
  const clean = decodeHtmlEntities(m[1].replace(/<[^>]+>/g, ''));
  return clean || undefined;
}

async function readHtmlPrefix(res: Response): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (total < MAX_HTML_BYTES) {
      const { value, done } = await reader.read();
      if (done || !value) break;
      const slice =
        total + value.byteLength > MAX_HTML_BYTES
          ? value.subarray(0, MAX_HTML_BYTES - total)
          : value;
      chunks.push(slice);
      total += slice.byteLength;
      if (total >= MAX_HTML_BYTES) break;
    }
  } finally {
    void reader.cancel().catch(() => {});
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(merged);
}

export async function GET(request: Request) {
  const user = await authorizeOpsUser(request);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url')?.trim() || '';
  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let currentUrl: URL;
  try {
    currentUrl = await assertSafeExternalUrl(rawUrl);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid target URL' },
      { status: 400 }
    );
  }

  const cacheKey = currentUrl.toString();
  const cached = previewCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data, {
      status: 200,
      headers: { 'Cache-Control': 'private, max-age=1800' },
    });
  }

  try {
    let res: Response | null = null;
    for (let hop = 0; hop < 4; hop++) {
      res = await fetch(currentUrl.toString(), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; RottyMPreview/1.0; +https://www.rottym.com)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'manual',
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (!location) break;
        const nextUrl = new URL(location, currentUrl);
        currentUrl = await assertSafeExternalUrl(nextUrl.toString());
        continue;
      }
      break;
    }

    if (!res || !res.ok) {
      return NextResponse.json(
        { error: `Target returned HTTP ${res?.status || 502}` },
        { status: 502 }
      );
    }

    const ct = (res.headers.get('content-type') || '').toLowerCase();
    const finalUrl = currentUrl.toString();
    const domain = currentUrl.hostname.replace(/^www\./i, '');

    if (ct.startsWith('image/')) {
      const payload: LinkPreviewData = {
        ok: true,
        url: rawUrl,
        finalUrl,
        domain,
        title: currentUrl.pathname.split('/').filter(Boolean).pop() || domain,
        image: finalUrl,
        cardType: 'summary_large_image',
      };
      return NextResponse.json(payload, {
        status: 200,
        headers: { 'Cache-Control': 'private, max-age=1800' },
      });
    }

    const html = await readHtmlPrefix(res);
    const meta = extractMetaTags(html);

    const rawTitle = meta.get('og:title') || meta.get('twitter:title') || extractTitleTag(html);
    const rawDesc =
      meta.get('og:description') || meta.get('twitter:description') || meta.get('description');
    const rawImage =
      meta.get('og:image:secure_url') ||
      meta.get('og:image') ||
      meta.get('twitter:image') ||
      meta.get('twitter:image:src');
    const siteName = meta.get('og:site_name') || domain;
    const twitterCardRaw = (meta.get('twitter:card') || '').toLowerCase();

    let resolvedImage: string | undefined;
    if (rawImage) {
      try {
        const imgUrl = new URL(rawImage, finalUrl);
        if (imgUrl.protocol === 'http:' || imgUrl.protocol === 'https:') {
          resolvedImage = imgUrl.toString();
        }
      } catch {
        // ignore invalid og:image
      }
    }

    const payload: LinkPreviewData = {
      ok: true,
      url: rawUrl,
      finalUrl,
      domain,
      siteName: siteName.slice(0, 80),
      title: rawTitle?.slice(0, 220),
      description: rawDesc?.slice(0, 320),
      image: resolvedImage,
      cardType:
        twitterCardRaw === 'summary' && !resolvedImage
          ? 'summary'
          : 'summary_large_image',
    };

    if (previewCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = previewCache.keys().next().value;
      if (oldestKey) previewCache.delete(oldestKey);
    }
    previewCache.set(cacheKey, { data: payload, expiresAt: Date.now() + CACHE_TTL_MS });

    return NextResponse.json(payload, {
      status: 200,
      headers: { 'Cache-Control': 'private, max-age=1800' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unable to resolve article metadata' },
      { status: 502 }
    );
  }
}
