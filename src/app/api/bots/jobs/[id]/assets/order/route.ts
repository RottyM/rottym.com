import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { findUnknownFields, getCardAssets, syncCardWithAssets } from '@/lib/ops/drop-parser';
import { appendOpsActivity, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { PipelineCard } from '@/lib/ops/types';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

const ALLOWED_ORDER_FIELDS = new Set(['clientId', 'assetIds', 'order']);

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const unknown = findUnknownFields(body, ALLOWED_ORDER_FIELDS);
  if (unknown.length > 0) {
    return NextResponse.json(
      { error: `Unknown field(s): ${unknown.join(', ')}` },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const existing = await opsGetDoc<PipelineCard>('ops_pipeline', id);
  if (!existing) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404, headers: NO_STORE_HEADERS });
  }

  const scopedClientId = resolveBotTargetClientId(
    actor,
    typeof body.clientId === 'string' ? body.clientId : existing.clientId
  );
  if (!scopedClientId || scopedClientId !== existing.clientId) return forbiddenResponse();
  if (actor.user && !(await canUserAccessClient(actor.user, existing.clientId))) {
    return forbiddenResponse();
  }

  const rawIds = Array.isArray(body.assetIds)
    ? body.assetIds
    : Array.isArray(body.order)
      ? body.order
      : null;
  if (!rawIds || rawIds.some((x) => typeof x !== 'string')) {
    return NextResponse.json(
      { error: 'assetIds (string[]) is required.' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const assets = getCardAssets(existing);
  const byId = new Map(assets.map((a) => [a.id, a]));
  const seen = new Set<string>();
  const now = new Date().toISOString();
  const reordered: typeof assets = [];

  for (const rawId of rawIds as string[]) {
    const asset = byId.get(rawId);
    if (!asset) {
      return NextResponse.json(
        { error: `Unknown asset id '${rawId}' on this job.` },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    if (!seen.has(rawId)) {
      seen.add(rawId);
      reordered.push({ ...asset, order: reordered.length, updatedAt: now });
    }
  }
  for (const a of assets) {
    if (!seen.has(a.id)) {
      reordered.push({ ...a, order: reordered.length });
    }
  }

  const synced = syncCardWithAssets(existing, reordered);
  const updated: PipelineCard = { ...synced, updatedAt: now };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(existing.clientId, actor.actorName, 'reordered carousel assets', existing.title);

  return NextResponse.json(
    { ok: true, assets: updated.assets, job: { ...updated, autoPostAllowed: false } },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
