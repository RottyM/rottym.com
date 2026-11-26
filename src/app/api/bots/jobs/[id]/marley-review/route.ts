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
  findUnknownFields,
  laneToChannel,
  normalizeEventDate,
  normalizeLane,
  normalizeVerdictTag,
  resolveEffectivePhotoStatus,
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
  'discrepancies',
  'artifactsNeeded',
  'unverifiedClaims',
  'photoStatus',
  'eventDate',
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

  const nextEventDate =
    body.eventDate !== undefined ? normalizeEventDate(body.eventDate) : existing.eventDate;
  if (typeof body.eventDate === 'string' && body.eventDate.trim() && !nextEventDate) {
    return NextResponse.json(
      { error: 'Invalid eventDate format. Expected YYYY-MM-DD.' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
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

  const updated: PipelineCard = {
    ...existing,
    stage: nextStage,
    lane: nextLane,
    channel: laneToChannel(nextLane),
    marleyReviewedBy: reviewer,
    verdictTag: finalVerdict,
    draftCopy:
      typeof body.revisedCopy === 'string' && body.revisedCopy.trim()
        ? body.revisedCopy.trim().slice(0, 2400)
        : existing.draftCopy,
    marleyStatus: isValidated ? 'approved' : 'rejected',
    marleyNote:
      typeof body.notes === 'string' && body.notes.trim()
        ? body.notes.trim().slice(0, 300)
        : isValidated && !hasBlockers
          ? `Cleared (${finalVerdict}) by ${reviewer} — awaiting Rotty approval`
          : `Flagged (${finalVerdict}) by ${reviewer} for crew resolution`,
    discrepancies,
    unverifiedClaims: unverifiedClaims && unverifiedClaims.length > 0 ? unverifiedClaims : undefined,
    artifactsNeeded,
    photoStatus: resolveEffectivePhotoStatus({
      explicit: body.photoStatus,
      existing: existing.photoStatus,
      assetFile: existing.assetFile,
      assetUrl: existing.assetUrl,
      assetSpec: existing.assetSpec,
    }),
    eventDate: nextEventDate,
    flaggedNotes: applyEventDatePastFlag(existing.flaggedNotes, nextEventDate, nextStage),
    readyForRotty: false, // Bot clearance NEVER marks readyForRotty or triggers publish
    claimedBy: undefined,
    leaseExpiresAt: undefined,
    updatedAt: new Date().toISOString(),
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
