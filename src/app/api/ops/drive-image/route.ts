import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { authorizeOpsUser, unauthorizedResponse } from '@/lib/ops/auth';
import { extractDriveFileId } from '@/lib/ops/drop-parser';

const driveAuth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

async function fetchDriveWithBearer(fileId: string, token: string): Promise<Response | null> {
  // 1) Try media download directly
  const mediaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    }
  );
  if (mediaRes.ok && (mediaRes.headers.get('content-type') || '').startsWith('image/')) {
    return mediaRes;
  }

  // 2) Fallback: ask Drive API for thumbnailLink
  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=thumbnailLink,mimeType&supportsAllDrives=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    }
  );
  if (metaRes.ok) {
    const meta = (await metaRes.json().catch(() => ({}))) as { thumbnailLink?: string };
    if (meta.thumbnailLink) {
      const thumbRes = await fetch(meta.thumbnailLink, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      });
      if (thumbRes.ok) return thumbRes;
    }
  }
  return null;
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

  // 1) Signed-in user's Google OAuth token (e.g. rmendez with drive.readonly scope)
  if (userGoogleToken) {
    try {
      const res = await fetchDriveWithBearer(fileId, userGoogleToken);
      if (res) {
        const buf = await res.arrayBuffer();
        return new NextResponse(buf, {
          status: 200,
          headers: {
            'Content-Type': res.headers.get('content-type') || 'image/jpeg',
            'Cache-Control': 'private, max-age=300',
          },
        });
      }
    } catch {
      // Fall through to service account or public thumbnail
    }
  }

  // 2) Server GoogleAuth (service account if granted Shared Drive read access)
  try {
    const client = await driveAuth.getClient();
    const tokenResp = await client.getAccessToken();
    const serverToken = typeof tokenResp === 'string' ? tokenResp : tokenResp?.token;
    if (serverToken) {
      const res = await fetchDriveWithBearer(fileId, serverToken);
      if (res) {
        const buf = await res.arrayBuffer();
        return new NextResponse(buf, {
          status: 200,
          headers: {
            'Content-Type': res.headers.get('content-type') || 'image/jpeg',
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

  return NextResponse.json(
    {
      error:
        'Drive thumbnail unavailable. Sign in with Google Drive access or upload a hosted copy to the asset.',
      needsDriveAuth: !userGoogleToken,
    },
    { status: 404 }
  );
}
