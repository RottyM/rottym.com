import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import {
  applyEventDatePastFlag,
  cleanBotStringList,
  FIELD_MAX_LENGTHS,
  findUnknownFields,
  getCardAssets,
  laneToChannel,
  normalizeAssignedTo,
  normalizeEventDate,
  normalizeJobAssetStatus,
  normalizeLane,
  normalizePhotoStatus,
  normalizePlatformList,
  normalizeVerdictTag,
  resolveEffectivePhotoStatus,
  syncCardWithAssets,
  validateStringLength,
} from '@/lib/ops/drop-parser';
import { appendOpsActivity, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { PipelineCard } from '@/lib/ops/types';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

const ALLOWED_REVIEW_FIELDS = new Set([
  'clientId',
  'validated',
  'approved',
  'reviewer',
  'notes',
  'revisedCopy',
  'lane',
  'channel',
  'assignedTo',
  'targetPlatforms',
  'platforms',
  'discrepancies',
  'artifactsNeeded',
  'unverifiedClaims',
  'photoStatus',
  'assetReviews',
  'eventDate',
  'isEvent',
  'verdictTag',
  'verdict',
]);

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await authorizeBotOrOpsUser(request, 'Marley');
  if (!actor) return unauthorizedResponse();

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const unknown = findUnknownFields(body, ALLOWED_REVIEW_FIELDS);
  if (unknown.length > 0) {
    return NextResponse.json(
      {
        error: `Unknown field(s): ${unknown.join(', ')}`,
        unknownFields: unknown,
        allowedFields: Array.from(ALLOWED_REVIEW_FIELDS),
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const existing = await opsGetDoc<PipelineCard>('ops_pipeline', id);
  if (!existing) return NextResponse.json({ error: 'Job not found' }, { status: 404, headers: NO_STORE_HEADERS });

  if (!actor.user && normalizePhotoStatus(body.photoStatus) === 'not_needed') {
    return NextResponse.json(
      {
        error:
          'Only Rotty (authenticated /ops operator) can set "no image needed" (photoStatus: not_needed).',
      },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const scopedClientId = resolveBotTargetClientId(
    actor,
    (typeof body.clientId === 'string' ? body.clientId : undefined) || existing.clientId
  );
  if (!scopedClientId || scopedClientId !== existing.clientId) return forbiddenResponse();
  if (actor.user && !(await canUserAccessClient(actor.user, existing.clientId))) {
    return forbiddenResponse();
  }

  const rawVerdict = body.verdictTag !== undefined ? body.verdictTag : body.verdict;
  const verdictTag = rawVerdict !== undefined ? normalizeVerdictTag(rawVerdict) : existing.verdictTag;
  if (rawVerdict !== undefined && !verdictTag) {
    return NextResponse.json(
      { error: 'Invalid verdictTag. Allowed: NEW, FOLLOW-UP, REPEAT, SKIP, HOLD, REJECTED.' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const inferredNegativeVerdict =
    verdictTag === 'SKIP' || verdictTag === 'REPEAT' || verdictTag === 'REJECTED' || verdictTag === 'HOLD';

  const isValidated =
    typeof body.validated === 'boolean'
      ? body.validated
      : typeof body.approved === 'boolean'
        ? body.approved
        : inferredNegativeVerdict
          ? false
          : null;

  if (isValidated === null) {
    return NextResponse.json(
      { error: 'validated (or approved) boolean is required' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const reviewer =
    typeof body.reviewer === 'string' && body.reviewer.trim()
      ? body.reviewer.trim().slice(0, 32)
      : 'Marley';
  const discrepancies = cleanBotStringList(body.discrepancies) || [];
  const artifactsNeeded = cleanBotStringList(body.artifactsNeeded) || [];
  const unverifiedClaims =
    body.unverifiedClaims !== undefined
      ? cleanBotStringList(body.unverifiedClaims)
      : existing.unverifiedClaims;

  let nextEventDate = existing.eventDate;
  if (body.eventDate !== undefined) {
    if (body.eventDate === null || body.eventDate === '') {
      nextEventDate = undefined;
    } else if (typeof body.eventDate === 'string') {
      const parsedDate = normalizeEventDate(body.eventDate);
      if (!parsedDate) {
        return NextResponse.json(
          { error: 'Invalid eventDate format. Expected YYYY-MM-DD or null to clear.' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      nextEventDate = parsedDate;
    } else {
      return NextResponse.json(
        { error: 'eventDate must be YYYY-MM-DD, empty string, or null.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
  }
  let nextIsEvent = existing.isEvent;
  if (body.isEvent !== undefined) {
    if (body.isEvent === null) {
      nextIsEvent = undefined;
    } else if (typeof body.isEvent === 'boolean') {
      nextIsEvent = body.isEvent;
    } else {
      return NextResponse.json(
        { error: 'isEvent must be a boolean or null.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
  }

  const nextStage = isValidated ? 'clearance' : 'pulled';
  const hasBlockers =
    discrepancies.length > 0 ||
    artifactsNeeded.length > 0 ||
    Boolean(unverifiedClaims && unverifiedClaims.length > 0);

  const nextLane =
    typeof body.lane === 'string' || typeof body.channel === 'string'
      ? normalizeLane((body.lane as string) || (body.channel as string))
      : existing.lane;

  const finalVerdict: PipelineCard['verdictTag'] =
    verdictTag || (isValidated ? existing.verdictTag || 'NEW' : 'REJECTED');

  if (body.assignedTo !== undefined && body.assignedTo !== null && typeof body.assignedTo !== 'string') {
    return NextResponse.json(
      { error: 'assignedTo must be a string or null.' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
  const nextAssignedTo =
    body.assignedTo !== undefined ? normalizeAssignedTo(body.assignedTo) : existing.assignedTo;
  const nextTargetPlatforms =
    body.targetPlatforms !== undefined || body.platforms !== undefined
      ? normalizePlatformList(body.targetPlatforms ?? body.platforms)
      : existing.targetPlatforms;

  let nextRevisedCopy = existing.draftCopy;
  if (typeof body.revisedCopy === 'string' && body.revisedCopy.trim()) {
    const check = validateStringLength('revisedCopy', body.revisedCopy, FIELD_MAX_LENGTHS.draftCopy);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400, headers: NO_STORE_HEADERS });
    }
    nextRevisedCopy = check.value;
  }

  let explicitMarleyNote: string | undefined;
  if (typeof body.notes === 'string' && body.notes.trim()) {
    const check = validateStringLength('notes', body.notes, FIELD_MAX_LENGTHS.note);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400, headers: NO_STORE_HEADERS });
    }
    explicitMarleyNote = check.value;
  }

  const now = new Date().toISOString();
  let nextAssets = getCardAssets(existing);
  if (body.assetReviews !== undefined) {
    if (!Array.isArray(body.assetReviews)) {
      return NextResponse.json(
        { error: 'assetReviews must be an array.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const reviewMap = new Map<string, { status: 'approved' | 'rejected'; reason?: string }>();
    for (const r of body.assetReviews) {
      if (!r || typeof r !== 'object' || Array.isArray(r)) {
        return NextResponse.json(
          { error: 'Each assetReview must be an object { assetId, status, reason? }.' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      const rev = r as Record<string, unknown>;
      const assetId = typeof rev.assetId === 'string' ? rev.assetId.trim() : '';
      const status = normalizeJobAssetStatus(rev.status);
      if (!assetId || (status !== 'approved' && status !== 'rejected')) {
        return NextResponse.json(
          { error: 'Each assetReview requires assetId and status ("approved" or "rejected").' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      let reason: string | undefined;
      if (typeof rev.reason === 'string' && rev.reason.trim()) {
        const rc = validateStringLength('reason', rev.reason, FIELD_MAX_LENGTHS.rejectionReason);
        if (!rc.ok) return NextResponse.json({ error: rc.error }, { status: 400, headers: NO_STORE_HEADERS });
        reason = rc.value;
      }
      reviewMap.set(assetId, { status, reason });
    }
    nextAssets = nextAssets.map((a) => {
      const rv = reviewMap.get(a.id);
      if (!rv) return a;
      return {
        ...a,
        status: rv.status,
        rejectionReason: rv.status === 'rejected' ? rv.reason : undefined,
        reviewedBy: reviewer,
        reviewedAt: now,
        updatedAt: now,
      };
    });
  }

  const syncedAssets = syncCardWithAssets({}, nextAssets);

  const updated: PipelineCard = {
    ...existing,
    stage: nextStage,
    lane: nextLane,
    channel: laneToChannel(nextLane),
    assignedTo: nextAssignedTo,
    targetPlatforms: nextTargetPlatforms,
    marleyReviewedBy: reviewer,
    verdictTag: finalVerdict,
    draftCopy: nextRevisedCopy,
    assets: syncedAssets.assets,
    assetFile: syncedAssets.assetFile,
    assetUrl: syncedAssets.assetUrl,
    assetSpec: syncedAssets.assetSpec,
    marleyStatus: isValidated ? 'approved' : 'rejected',
    marleyNote:
      explicitMarleyNote ||
      (isValidated && !hasBlockers
        ? `Cleared (${finalVerdict}) by ${reviewer} — awaiting Rotty approval`
        : `Flagged (${finalVerdict}) by ${reviewer} for crew resolution`),
    discrepancies,
    unverifiedClaims:
      body.unverifiedClaims !== undefined
        ? unverifiedClaims || []
        : existing.unverifiedClaims,
    artifactsNeeded:
      body.artifactsNeeded !== undefined
        ? artifactsNeeded
        : existing.artifactsNeeded,
    photoStatus: resolveEffectivePhotoStatus({
      explicit: body.photoStatus,
      existing: existing.photoStatus,
      assetFile: syncedAssets.assetFile,
      assetUrl: syncedAssets.assetUrl,
      assetSpec: syncedAssets.assetSpec,
    }),
    eventDate: nextEventDate,
    isEvent: nextIsEvent,
    flaggedNotes: applyEventDatePastFlag(existing.flaggedNotes, nextEventDate, nextStage, {
      isEvent: nextIsEvent,
      title: existing.title,
      note: existing.note,
      marleyNote: explicitMarleyNote || existing.marleyNote,
    }),
    readyForRotty: false, // Bot clearance NEVER marks readyForRotty or triggers publish
    postIt: false,
    postItAt: undefined,
    postItBy: undefined,
    claimedBy: undefined,
    leaseExpiresAt: undefined,
    updatedAt: now,
  };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(
    existing.clientId,
    reviewer,
    isValidated && !hasBlockers ? `cleared (${finalVerdict})` : `flagged (${finalVerdict})`,
    updated.title
  );

  return NextResponse.json(
    { ok: true, job: { ...updated, autoPostAllowed: false } },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
