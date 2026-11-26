import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { opsSetDoc } from '@/lib/ops/firestore-rest';

const MAX_HOSTED_IMAGE_BYTES = 700 * 1024;
const ALLOWED_IMAGE_MIME = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);

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

export async function POST(request: Request) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  let body: {
    clientId?: string;
    dataUrl?: string;
    base64?: string;
    mimeType?: string;
    filename?: string;
  } = {};

  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('multipart/form-data')) {
    try {
      const form = await request.formData();
      const fileEntry = form.get('file');
      if (!(fileEntry instanceof File)) {
        return NextResponse.json({ error: 'Missing file field in form data.' }, { status: 400 });
      }
      const arrBuf = await fileEntry.arrayBuffer();
      body = {
        clientId: typeof form.get('clientId') === 'string' ? (form.get('clientId') as string) : undefined,
        mimeType: fileEntry.type || (typeof form.get('mimeType') === 'string' ? (form.get('mimeType') as string) : 'image/png'),
        base64: Buffer.from(arrBuf).toString('base64'),
        filename:
          (typeof form.get('filename') === 'string' ? (form.get('filename') as string) : '') ||
          fileEntry.name ||
          undefined,
      };
    } catch {
      return NextResponse.json({ error: 'Invalid multipart/form-data payload.' }, { status: 400 });
    }
  } else {
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
  }

  const clientId = resolveBotTargetClientId(actor, body.clientId);
  if (!clientId) return forbiddenResponse('Token is not scoped to requested clientId.');
  if (actor.user && !(await canUserAccessClient(actor.user, clientId))) {
    return forbiddenResponse();
  }

  let mimeType = typeof body.mimeType === 'string' ? body.mimeType.trim().toLowerCase() : '';
  let base64 = typeof body.base64 === 'string' ? body.base64.trim() : '';

  if (typeof body.dataUrl === 'string' && body.dataUrl.trim()) {
    const match = body.dataUrl.trim().match(/^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i);
    if (!match) {
      return NextResponse.json({ error: 'Invalid dataUrl image format.' }, { status: 400 });
    }
    mimeType = match[1].toLowerCase();
    base64 = match[2].replace(/\s+/g, '');
  }

  if (!ALLOWED_IMAGE_MIME.has(mimeType)) {
    return NextResponse.json(
      { error: 'Unsupported image type. Allowed: png, jpeg, webp, gif.' },
      { status: 400 }
    );
  }
  if (!base64 || !/^[A-Za-z0-9+/=]+$/.test(base64)) {
    return NextResponse.json({ error: 'Invalid base64 image data.' }, { status: 400 });
  }

  const buf = Buffer.from(base64, 'base64');
  if (buf.byteLength === 0 || buf.byteLength > MAX_HOSTED_IMAGE_BYTES) {
    return NextResponse.json(
      {
        error: `Hosted image copy must be between 1 byte and ${Math.round(MAX_HOSTED_IMAGE_BYTES / 1024)} KB (got ${Math.round(buf.byteLength / 1024)} KB).`,
      },
      { status: 400 }
    );
  }

  const blobId = `blob-${clientId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const doc: StoredAssetBlob = {
    id: blobId,
    clientId,
    mimeType: mimeType === 'image/jpg' ? 'image/jpeg' : mimeType,
    filename: typeof body.filename === 'string' ? body.filename.trim().slice(0, 140) || undefined : undefined,
    base64,
    byteSize: buf.byteLength,
    uploadedBy: actor.actorName,
    createdAt: new Date().toISOString(),
  };

  await opsSetDoc('ops_asset_blobs', blobId, doc as unknown as Record<string, unknown>);

  return NextResponse.json(
    {
      ok: true,
      blobId,
      url: `/api/ops/asset-blob/${blobId}`,
      mimeType: doc.mimeType,
      byteSize: doc.byteSize,
    },
    { status: 201 }
  );
}
