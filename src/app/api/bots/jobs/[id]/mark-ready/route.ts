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
  normalizePhotoStatus,
  refreshStaleCardNote,
  validateBotNoImageOverride,
} from '@/lib/ops/drop-parser';
import { appendOpsActivity, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { PipelineCard } from '@/lib/ops/types';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  const { id } = await context.params;
  let body: Record<string, unknown> = {};
  try {
    const rawText = await request.text();
    if (rawText.trim()) {
      const parsed = JSON.parse(rawText);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        body = parsed as Record<string, unknown>;
      }
    }
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

  if (existing.stage === 'posted' || existing.stage === 'archived') {
    return NextResponse.json(
      { error: `Cannot Mark Ready on a ${existing.stage} job.` },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  if (existing.stage !== 'approved') {
    return NextResponse.json(
      {
        error: `Job must be approved by Rotty first before marking Ready for Rotty (current stage: ${existing.stage}).`,
      },
      { status: 409, headers: NO_STORE_HEADERS }
    );
  }

  const wantsNotNeeded =
    body.textOnly === true || normalizePhotoStatus(body.photoStatus) === 'not_needed';
  const assets = getCardAssets(existing);
  const overrideCheck = validateBotNoImageOverride({
    isUser: Boolean(actor.user),
    lane: existing.lane,
    requestedNotNeeded: wantsNotNeeded,
    hasAssetsOrSpecs: Boolean(
      assets.length > 0 ||
        existing.assetUrl ||
        existing.assetFile ||
        existing.assetSpec ||
        existing.artifactsNeeded?.length
    ),
  });
  if (!overrideCheck.ok) {
    return NextResponse.json(
      { error: overrideCheck.error },
      { status: overrideCheck.status, headers: NO_STORE_HEADERS }
    );
  }

  const now = new Date().toISOString();
  const effectivePhotoStatus = wantsNotNeeded ? ('not_needed' as const) : existing.photoStatus;
  const candidateCard: PipelineCard = wantsNotNeeded
    ? {
        ...existing,
        photoStatus: 'not_needed',
        noImageNeededBy: actor.actorName,
        noImageNeededAt: now,
      }
    : existing;

  const completeness = getCardCompleteness(candidateCard);
  if (!completeness.canApproveReady) {
    return NextResponse.json(
      {
        error: `Cannot Mark Ready for Rotty: ${completeness.detail}`,
        reason: completeness.lockReason,
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const updated: PipelineCard = {
    ...candidateCard,
    photoStatus: effectivePhotoStatus,
    note: refreshStaleCardNote(candidateCard.note, 'approved'),
    stage: 'approved',
    readyForRotty: true,
    updatedAt: now,
  };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(existing.clientId, actor.actorName, 'marked Ready for Rotty', updated.title);

  return NextResponse.json(
    {
      ok: true,
      ...(completeness.warning ? { warning: completeness.warning } : {}),
      job: { ...updated, autoPostAllowed: false },
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
