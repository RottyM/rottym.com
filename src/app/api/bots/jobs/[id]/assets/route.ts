import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import {
  getCardAssets,
  getCardCompleteness,
  inferAgentId,
  parseNewJobAssetInput,
  resolveEffectivePhotoStatus,
  syncCardWithAssets,
  syncVisualArtifactsNeeded,
} from '@/lib/ops/drop-parser';
import { appendOpsActivity, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { PipelineCard } from '@/lib/ops/types';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  const { id } = await context.params;
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
  return NextResponse.json(
    { ok: true, jobId: existing.id, count: assets.length, assets },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

export async function POST(
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

  let inputs: Array<Record<string, unknown>>;
  if (Array.isArray(body.assets)) {
    inputs = body.assets as Array<Record<string, unknown>>;
  } else if (body.asset && typeof body.asset === 'object' && !Array.isArray(body.asset)) {
    inputs = [body.asset as Record<string, unknown>];
  } else {
    const single = { ...body };
    delete single.clientId;
    inputs = [single];
  }

  if (inputs.length === 0 || inputs.length > 20) {
    return NextResponse.json(
      { error: 'Provide 1 to 20 assets.' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const currentAssets = getCardAssets(existing);
  const canReviewAsset = Boolean(actor.user || inferAgentId(actor.actorName) === 'marley');
  const now = new Date().toISOString();
  const added: typeof currentAssets = [];
  const seenIds = new Set(currentAssets.map((a) => a.id));

  const nextAssets = [...currentAssets];
  const actorAgentId = inferAgentId(actor.actorName);
  const replacedPlaceholderIndices = new Set<number>();

  for (let i = 0; i < inputs.length; i++) {
    const rawItem = inputs[i];
    if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
      return NextResponse.json(
        { error: 'Each asset must be a JSON object.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const parsed = parseNewJobAssetInput(rawItem, {
      addedBy: actor.actorName,
      defaultOrder: nextAssets.length,
      canReviewAsset,
      now,
    });
    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status, headers: NO_STORE_HEADERS }
      );
    }

    const hasExplicitId = rawItem.id !== undefined && rawItem.id !== null && String(rawItem.id).trim() !== '';
    const hasDeliveredMedia = Boolean(parsed.asset.url || parsed.asset.file);
    let fulfilledIdx = -1;
    if (!hasExplicitId && hasDeliveredMedia) {
      // Fulfill matching open placeholder (e.g. from Assign -> Pixel) instead of stranding an empty needed item.
      const matchPriority = [
        (p: (typeof nextAssets)[number], idx: number) =>
          !replacedPlaceholderIndices.has(idx) &&
          (p.status === 'needed' || p.status === 'in_progress') &&
          !p.url &&
          !p.file &&
          inferAgentId(p.assignedTo || '') === actorAgentId &&
          (p.platform === parsed.asset.platform || p.platform === 'all' || parsed.asset.platform === 'all'),
        (p: (typeof nextAssets)[number], idx: number) =>
          !replacedPlaceholderIndices.has(idx) &&
          (p.status === 'needed' || p.status === 'in_progress') &&
          !p.url &&
          !p.file &&
          (p.platform === parsed.asset.platform || p.platform === 'all' || parsed.asset.platform === 'all'),
      ];
      for (const pred of matchPriority) {
        const found = nextAssets.findIndex((p, idx) => pred(p, idx));
        if (found >= 0) {
          fulfilledIdx = found;
          break;
        }
      }
    }

    if (fulfilledIdx >= 0) {
      const target = nextAssets[fulfilledIdx];
      const replacement = {
        ...parsed.asset,
        id: target.id,
        order: target.order,
        assignedTo: parsed.asset.assignedTo ?? target.assignedTo,
      };
      nextAssets[fulfilledIdx] = replacement;
      replacedPlaceholderIndices.add(fulfilledIdx);
      added.push(replacement);
      continue;
    }

    if (seenIds.has(parsed.asset.id)) {
      return NextResponse.json(
        { error: `Duplicate asset id '${parsed.asset.id}'.` },
        { status: 409, headers: NO_STORE_HEADERS }
      );
    }
    seenIds.add(parsed.asset.id);
    nextAssets.push(parsed.asset);
    added.push(parsed.asset);
  }

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
    noImageNeededBy: undefined,
    noImageNeededAt: undefined,
    updatedAt: now,
  };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(
    existing.clientId,
    actor.actorName,
    `added ${added.length} asset${added.length === 1 ? '' : 's'}`,
    existing.title
  );

  return NextResponse.json(
    {
      ok: true,
      addedCount: added.length,
      added,
      assets: updated.assets,
      job: { ...updated, autoPostAllowed: false },
    },
    { status: 201, headers: NO_STORE_HEADERS }
  );
}
