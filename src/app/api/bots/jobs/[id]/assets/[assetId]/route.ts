import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { resolveInlineAssetBlobUpload } from '@/lib/ops/asset-blob';
import {
  applyJobAssetPatch,
  getCardAssets,
  getCardCompleteness,
  inferAgentId,
  resolveEffectivePhotoStatus,
  syncCardWithAssets,
  syncVisualArtifactsNeeded,
} from '@/lib/ops/drop-parser';
import { appendOpsActivity, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { PipelineCard } from '@/lib/ops/types';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

function isSameBotOwner(actorName: string, addedBy?: string): boolean {
  const norm = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const a = norm(actorName);
  const b = norm(addedBy);
  if (!a || a === 'bot') return false;
  return a === b;
}

async function handlePatchAsset(
  request: Request,
  context: { params: Promise<{ id: string; assetId: string }> }
) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  const { id, assetId } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400, headers: NO_STORE_HEADERS });
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

  const assets = getCardAssets(existing);
  const idx = assets.findIndex((a) => a.id === assetId);
  if (idx === -1) {
    return NextResponse.json({ error: `Asset '${assetId}' not found on job` }, { status: 404, headers: NO_STORE_HEADERS });
  }

  const patch = { ...body };
  delete patch.clientId;
  const blobResolved = await resolveInlineAssetBlobUpload(patch, {
    clientId: existing.clientId,
    uploadedBy: actor.actorName,
  });
  if (!blobResolved.ok) {
    return NextResponse.json(
      { error: blobResolved.error },
      { status: blobResolved.status, headers: NO_STORE_HEADERS }
    );
  }
  const canReviewAsset = Boolean(actor.user || inferAgentId(actor.actorName) === 'marley');
  const now = new Date().toISOString();

  const patched = applyJobAssetPatch(assets[idx], blobResolved.item, {
    actorName: actor.actorName,
    canReviewAsset,
    now,
  });
  if (!patched.ok) {
    return NextResponse.json(
      { error: patched.error },
      { status: patched.status, headers: NO_STORE_HEADERS }
    );
  }

  const nextAssets = assets.map((a, i) => (i === idx ? patched.asset : a));
  const synced = syncCardWithAssets(existing, nextAssets);
  const nextPhotoStatus = resolveEffectivePhotoStatus({
    existing: existing.photoStatus,
    assetFile: synced.assetFile,
    assetUrl: synced.assetUrl,
    assetSpec: synced.assetSpec,
  });

  const nextStage = existing.stage;
  let nextReady = existing.readyForRotty;
  let nextPostIt = Boolean(existing.postIt);
  let nextPostItAt = existing.postItAt;
  let nextPostItBy = existing.postItBy;

  if (nextReady && nextStage !== 'posted' && nextStage !== 'archived') {
    const comp = getCardCompleteness({ ...synced, photoStatus: nextPhotoStatus });
    if (!comp.canApproveReady) {
      nextReady = false;
      nextPostIt = false;
      nextPostItAt = undefined;
      nextPostItBy = undefined;
    }
  }

  const updated: PipelineCard = {
    ...synced,
    stage: nextStage,
    readyForRotty: nextReady,
    postIt: nextPostIt,
    postItAt: nextPostItAt,
    postItBy: nextPostItBy,
    photoStatus: nextPhotoStatus,
    artifactsNeeded: syncVisualArtifactsNeeded(
      existing.artifactsNeeded,
      undefined,
      synced.assetSpec,
      Boolean(synced.assetFile || synced.assetUrl || nextPhotoStatus === 'not_needed')
    ),
    updatedAt: now,
  };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(
    existing.clientId,
    actor.actorName,
    patched.asset.status !== assets[idx].status &&
      (patched.asset.status === 'approved' || patched.asset.status === 'rejected')
      ? `${patched.asset.status} asset (${patched.asset.kind})`
      : `updated asset (${patched.asset.kind})`,
    existing.title
  );

  return NextResponse.json(
    {
      ok: true,
      asset: patched.asset,
      assets: updated.assets,
      job: { ...updated, autoPostAllowed: false },
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

export const PATCH = handlePatchAsset;
export const PUT = handlePatchAsset;

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; assetId: string }> }
) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  const { id, assetId } = await context.params;
  const existing = await opsGetDoc<PipelineCard>('ops_pipeline', id);
  if (!existing) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404, headers: NO_STORE_HEADERS });
  }

  const scopedClientId = resolveBotTargetClientId(actor, existing.clientId);
  if (!scopedClientId || scopedClientId !== existing.clientId) return forbiddenResponse();
  if (actor.user && !(await canUserAccessClient(actor.user, existing.clientId))) {
    return forbiddenResponse();
  }

  const assets = getCardAssets(existing);
  const target = assets.find((a) => a.id === assetId);
  if (!target) {
    return NextResponse.json({ error: `Asset '${assetId}' not found on job` }, { status: 404, headers: NO_STORE_HEADERS });
  }

  if (!actor.user && !isSameBotOwner(actor.actorName, target.addedBy)) {
    return NextResponse.json(
      { error: `Only the bot that added this asset (${target.addedBy}) or Rotty can remove it.` },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const now = new Date().toISOString();
  const remaining = assets.filter((a) => a.id !== assetId);
  const synced = syncCardWithAssets(existing, remaining);
  const nextPhotoStatus = resolveEffectivePhotoStatus({
    existing: existing.photoStatus,
    assetFile: synced.assetFile,
    assetUrl: synced.assetUrl,
    assetSpec: synced.assetSpec,
  });

  const nextStage = existing.stage;
  let nextReady = existing.readyForRotty;
  let nextPostIt = Boolean(existing.postIt);
  let nextPostItAt = existing.postItAt;
  let nextPostItBy = existing.postItBy;
  if (nextReady && nextStage !== 'posted' && nextStage !== 'archived') {
    const comp = getCardCompleteness({ ...synced, photoStatus: nextPhotoStatus });
    if (!comp.canApproveReady) {
      nextReady = false;
      nextPostIt = false;
      nextPostItAt = undefined;
      nextPostItBy = undefined;
    }
  }

  const updated: PipelineCard = {
    ...synced,
    stage: nextStage,
    readyForRotty: nextReady,
    postIt: nextPostIt,
    postItAt: nextPostItAt,
    postItBy: nextPostItBy,
    photoStatus: nextPhotoStatus,
    artifactsNeeded: syncVisualArtifactsNeeded(
      existing.artifactsNeeded,
      undefined,
      synced.assetSpec,
      Boolean(synced.assetFile || synced.assetUrl || nextPhotoStatus === 'not_needed')
    ),
    updatedAt: now,
  };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(existing.clientId, actor.actorName, `removed asset (${target.kind})`, existing.title);

  return NextResponse.json(
    {
      ok: true,
      deletedAssetId: assetId,
      assets: updated.assets,
      job: { ...updated, autoPostAllowed: false },
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
