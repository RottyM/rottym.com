import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { authorizeOpsUser, unauthorizedResponse } from '@/lib/ops/auth';
import { extractDriveFileId } from '@/lib/ops/drop-parser';

const driveAuth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

function detectImageMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'image/png';
  }
  if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return 'image/gif';
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  return null;
}

async function toImagePayload(res: Response): Promise<{ buf: ArrayBuffer; contentType: string } | null> {
  const rawCt = (res.headers.get('content-type') || '').toLowerCase();
  if (rawCt.startsWith('image/')) {
    return { buf: await res.arrayBuffer(), contentType: rawCt };
  }
  if (rawCt.includes('octet-stream') || rawCt === '') {
    const buf = await res.arrayBuffer();
    const detected = detectImageMime(new Uint8Array(buf.slice(0, 16)));
    if (detected) return { buf, contentType: detected };
  }
  return null;
}

async function fetchDriveWithBearer(
  fileId: string,
  token: string,
  sz: number
): Promise<{
  payload: { buf: ArrayBuffer; contentType: string } | null;
  authStatus?: number;
  driveError?: string;
}> {
  let authStatus: number | undefined;
  let driveError: string | undefined;

  // 1) Try media download directly
  const mediaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    }
  );
  if (mediaRes.ok) {
    const payload = await toImagePayload(mediaRes);
    if (payload) return { payload };
  } else {
    authStatus = mediaRes.status;
    const errBody = (await mediaRes.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    driveError = errBody?.error?.message || `HTTP ${mediaRes.status}`;
  }

  // 2) Fallback: ask Drive API for thumbnailLink (handles PDFs / non-direct images / view-only previews)
  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=thumbnailLink,mimeType&supportsAllDrives=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    }
  );
  if (metaRes.ok) {
    const meta = (await metaRes.json().catch(() => ({}))) as {
      thumbnailLink?: string;
      mimeType?: string;
    };
    if (meta.thumbnailLink) {
      const scaledUrl =
        sz > 240 && /=s\d+$/.test(meta.thumbnailLink)
          ? meta.thumbnailLink.replace(/=s\d+$/, `=s${sz}`)
          : null;
      const thumbUrls = Array.from(
        new Set([scaledUrl, meta.thumbnailLink].filter((u): u is string => Boolean(u)))
      );
      for (const thumbUrl of thumbUrls) {
        for (const headers of [{ Authorization: `Bearer ${token}` }, undefined]) {
          const thumbRes = await fetch(thumbUrl, {
            headers,
            cache: 'no-store',
            signal: AbortSignal.timeout(10000),
          });
          if (thumbRes.ok) {
            const payload = await toImagePayload(thumbRes);
            if (payload) return { payload };
          }
        }
      }
      driveError = `Thumbnail fetch failed (${meta.mimeType || 'unknown type'})`;
    } else {
      driveError = `No Drive thumbnail (${meta.mimeType || 'no thumbnailLink'})`;
    }
  } else {
    if (!authStatus || metaRes.status === 401 || metaRes.status === 403) {
      authStatus = metaRes.status;
    }
    const errBody = (await metaRes.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    if (errBody?.error?.message) {
      driveError = `${metaRes.status}: ${errBody.error.message}`;
    } else if (!driveError) {
      driveError = `HTTP ${metaRes.status}`;
    }
  }

  return { payload: null, authStatus, driveError };
}

export async function GET(request: Request) {
  const user = await authorizeOpsUser(request);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url')?.trim() || '';
  const explicitId = searchParams.get('fileId')?.trim() || '';
  const sz = Math.max(120, Math.min(1600, Number(searchParams.get('sz') || '800') || 800));
  const fileId = explicitId || extractDriveFileId(rawUrl);

  if (!fileId) {
    return NextResponse.json({ error: 'Missing Drive fileId or valid Drive URL.' }, { status: 400 });
  }

  const userGoogleToken = request.headers.get('x-google-access-token')?.trim();
  let driveAuthStatus: number | undefined;
  let driveDiagnostic: string | undefined;

  // 1) Signed-in user's Google OAuth token (e.g. rmendez with drive.readonly scope)
  if (userGoogleToken) {
    try {
      const result = await fetchDriveWithBearer(fileId, userGoogleToken, sz);
      if (result.payload) {
        return new NextResponse(result.payload.buf, {
          status: 200,
          headers: {
            'Content-Type': result.payload.contentType,
            'Cache-Control': 'private, max-age=300',
          },
        });
      }
      driveAuthStatus = result.authStatus;
      driveDiagnostic = result.driveError;
    } catch (err) {
      driveDiagnostic = err instanceof Error ? err.message : 'Drive fetch failed';
    }
  }

  // 2) Server GoogleAuth (service account if granted Shared Drive read access)
  try {
    const client = await driveAuth.getClient();
    const tokenResp = await client.getAccessToken();
    const serverToken = typeof tokenResp === 'string' ? tokenResp : tokenResp?.token;
    if (serverToken) {
      const result = await fetchDriveWithBearer(fileId, serverToken, sz);
      if (result.payload) {
        return new NextResponse(result.payload.buf, {
          status: 200,
          headers: {
            'Content-Type': result.payload.contentType,
            'Cache-Control': 'private, max-age=300',
          },
        });
      }
    }
  } catch {
    // Fall through to public thumbnail URL
  }

  // 3) Public Drive thumbnail fallback
  const publicUrls = [
    `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${sz}`,
    `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w${sz}`,
  ];
  for (const pubUrl of publicUrls) {
    try {
      const pubRes = await fetch(pubUrl, {
        cache: 'no-store',
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      });
      const ct = pubRes.headers.get('content-type') || '';
      if (pubRes.ok && ct.startsWith('image/')) {
        const buf = await pubRes.arrayBuffer();
        return new NextResponse(buf, {
          status: 200,
          headers: {
            'Content-Type': ct,
            'Cache-Control': 'private, max-age=300',
          },
        });
      }
    } catch {
      // Try next public URL
    }
  }

  const driveAuthRejected = Boolean(userGoogleToken && (driveAuthStatus === 401 || driveAuthStatus === 403));
  const needsAccountSwitch = Boolean(userGoogleToken && driveAuthStatus === 404);
  return NextResponse.json(
    {
      error: driveAuthRejected
        ? 'Google Drive token expired or missing Drive read scope. Reconnect Drive and check Drive permission.'
        : needsAccountSwitch
          ? 'Drive file not found (404) for connected Google account — switch account or upload a hosted copy.'
          : 'Drive thumbnail unavailable. Connect Google Drive or upload a hosted copy to the asset.',
      needsDriveAuth: !userGoogleToken || driveAuthRejected,
      driveAuthRejected,
      ...(driveAuthStatus ? { driveAuthStatus } : {}),
      ...(driveDiagnostic ? { diagnostic: driveDiagnostic } : {}),
    },
    { status: 404 }
  );
}
