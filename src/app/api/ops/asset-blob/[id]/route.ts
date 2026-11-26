import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { opsGetDoc } from '@/lib/ops/firestore-rest';
import type { StoredAssetBlob } from '../route';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  const { id } = await context.params;
  const blob = await opsGetDoc<StoredAssetBlob>('ops_asset_blobs', id);
  if (!blob) {
    return NextResponse.json({ error: 'Asset blob not found' }, { status: 404 });
  }

  const scopedClientId = resolveBotTargetClientId(actor, blob.clientId);
  if (!scopedClientId || scopedClientId !== blob.clientId) return forbiddenResponse();
  if (actor.user && !(await canUserAccessClient(actor.user, blob.clientId))) {
    return forbiddenResponse();
  }

  const bytes = Buffer.from(blob.base64, 'base64');
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': blob.mimeType || 'image/png',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
