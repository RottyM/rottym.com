import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { storeAssetBlobFromInput, type StoredAssetBlob } from '@/lib/ops/asset-blob';

export type { StoredAssetBlob };

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

  const stored = await storeAssetBlobFromInput({
    clientId,
    uploadedBy: actor.actorName,
    dataUrl: body.dataUrl,
    base64: body.base64,
    mimeType: body.mimeType,
    filename: body.filename,
  });
  if (!stored.ok) {
    return NextResponse.json({ error: stored.error }, { status: stored.status });
  }

  return NextResponse.json(
    {
      ok: true,
      blobId: stored.blob.id,
      url: stored.url,
      mimeType: stored.blob.mimeType,
      byteSize: stored.blob.byteSize,
    },
    { status: 201 }
  );
}
