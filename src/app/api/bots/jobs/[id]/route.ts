import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  isBotJobOwner,
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
  syncVisualArtifactsNeeded,
} from '@/lib/ops/drop-parser';
import { appendOpsActivity, opsDeleteDoc, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { PipelineCard, PipelineStage } from '@/lib/ops/types';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

const ALLOWED_JOB_PATCH_FIELDS = new Set([
  'clientId',
  'title',
  'lane',
  'channel',
  'stage',
  'readyForRotty',
  'sourceUrl',
  'note',
  'draftCopy',
  'assetFile',
  'assetUrl',
  'driveUrl',
  'assetLink',
  'imageUrl',
  'assetSpec',
  'artifactsNeeded',
  'discrepancies',
  'unverifiedClaims',
  'photoStatus',
  'eventDate',
  'verdictTag',
]);

const VALID_BOT_EDIT_STAGES = new Set<PipelineStage>([
  'pulled',
  'clearance',
  'drafted',
  'archived',
]);

function normalizeRequestedStage(raw: unknown): PipelineStage | undefined {
  if (typeof raw !== 'string') return undefined;
  const clean = raw.trim().toLowerCase();
  if (clean === 'cancelled' || clean === 'canceled') return 'archived';
  if (
    clean === 'pulled' ||
    clean === 'clearance' ||
    clean === 'drafted' ||
    clean === 'approved' ||
    clean === 'posted' ||
    clean === 'archived'
  ) {
    return clean;
  }
  return undefined;
}

function sanitizeUrl(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  try {
    const u = new URL(raw.trim());
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.toString().slice(0, 400);
  } catch {
    return undefined;
  }
  return undefined;
}

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

  return NextResponse.json(
    { ok: true, job: { ...existing, autoPostAllowed: false } },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

async function handleUpsertJobById(
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

  const unknown = findUnknownFields(body, ALLOWED_JOB_PATCH_FIELDS);
  if (unknown.length > 0) {
    return NextResponse.json(
      {
        error: `Unknown field(s): ${unknown.join(', ')}${unknown.includes('url') ? ' (use "sourceUrl" instead of "url")' : ''}`,
        unknownFields: unknown,
        allowedFields: Array.from(ALLOWED_JOB_PATCH_FIELDS),
      },
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

  const requestedStage = normalizeRequestedStage(body.stage);
  if (requestedStage === 'posted' && !actor.user) {
    return NextResponse.json(
      { error: 'Marking a job posted requires a live URL via POST /post-result.' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  if (requestedStage === 'archived' && existing.stage !== 'posted' && !isBotJobOwner(actor, existing)) {
    return NextResponse.json(
      { error: 'Only the creating bot or an operator can archive this job.' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const wantsReadyForRotty = body.readyForRotty === true || requestedStage === 'approved';
  if (wantsReadyForRotty && existing.marleyStatus !== 'approved') {
    return NextResponse.json(
      { error: 'readyForRotty requires Marley approval first (marleyStatus must be approved).' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const nextLane =
    typeof body.lane === 'string' || typeof body.channel === 'string'
      ? normalizeLane(typeof body.lane === 'string' ? body.lane : (body.channel as string))
      : existing.lane;

  let nextStage: PipelineStage = existing.stage;
  let nextReady = existing.readyForRotty;

  if (existing.stage === 'posted') {
    nextStage = 'posted';
  } else if (wantsReadyForRotty && existing.marleyStatus === 'approved') {
    nextStage = 'approved';
    nextReady = true;
  } else if (requestedStage && VALID_BOT_EDIT_STAGES.has(requestedStage)) {
    nextStage = requestedStage;
    if (requestedStage === 'archived') {
      nextReady = false;
    }
  }

  if (body.readyForRotty === false) {
    nextReady = false;
  }

  const nextAssetFile =
    typeof body.assetFile === 'string'
      ? body.assetFile.trim().slice(0, 160) || undefined
      : existing.assetFile;
  const rawAssetUrlInput =
    body.assetUrl !== undefined
      ? body.assetUrl
      : body.driveUrl !== undefined
        ? body.driveUrl
        : body.assetLink !== undefined
          ? body.assetLink
          : body.imageUrl;
  const nextAssetUrl = rawAssetUrlInput !== undefined ? sanitizeUrl(rawAssetUrlInput) : existing.assetUrl;
  const nextAssetSpec =
    typeof body.assetSpec === 'string'
      ? body.assetSpec.trim().slice(0, 60) || undefined
      : existing.assetSpec;

  const nextEventDate =
    body.eventDate !== undefined ? normalizeEventDate(body.eventDate) : existing.eventDate;
  if (typeof body.eventDate === 'string' && body.eventDate.trim() && !nextEventDate) {
    return NextResponse.json(
      { error: 'Invalid eventDate format. Expected YYYY-MM-DD.' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
  const nextVerdictTag =
    body.verdictTag !== undefined ? normalizeVerdictTag(body.verdictTag) : existing.verdictTag;
  if (typeof body.verdictTag === 'string' && body.verdictTag.trim() && !nextVerdictTag) {
    return NextResponse.json(
      { error: 'Invalid verdictTag. Allowed: NEW, FOLLOW-UP, REPEAT, SKIP, HOLD, REJECTED.' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const nextSourceUrl = body.sourceUrl !== undefined ? sanitizeUrl(body.sourceUrl) : existing.sourceUrl;
  const baseFlags = (existing.flaggedNotes || []).filter(
    (flag) => !(nextSourceUrl || nextStage === 'posted') || !flag.startsWith('FLAG: Missing verified source URL')
  );

  const updated: PipelineCard = {
    ...existing,
    title:
      typeof body.title === 'string' && body.title.trim()
        ? body.title.trim().slice(0, 120)
        : existing.title,
    lane: nextLane,
    channel: laneToChannel(nextLane),
    stage: nextStage,
    readyForRotty: nextReady,
    sourceUrl: nextSourceUrl,
    note:
      typeof body.note === 'string'
        ? body.note.trim().slice(0, 300) || undefined
        : existing.note,
    draftCopy:
      typeof body.draftCopy === 'string' ? body.draftCopy.slice(0, 2400) : existing.draftCopy,
    assetFile: nextAssetFile,
    assetUrl: nextAssetUrl,
    assetSpec: nextAssetSpec,
    verdictTag: nextVerdictTag,
    eventDate: nextEventDate,
    photoStatus: resolveEffectivePhotoStatus({
      explicit: body.photoStatus,
      existing: existing.photoStatus,
      assetFile: nextAssetFile,
      assetUrl: nextAssetUrl,
      assetSpec: nextAssetSpec,
    }),
    unverifiedClaims:
      body.unverifiedClaims !== undefined
        ? cleanBotStringList(body.unverifiedClaims)
        : existing.unverifiedClaims,
    flaggedNotes: applyEventDatePastFlag(baseFlags, nextEventDate, nextStage),
    artifactsNeeded: syncVisualArtifactsNeeded(
      existing.artifactsNeeded,
      body.artifactsNeeded !== undefined ? cleanBotStringList(body.artifactsNeeded) : undefined,
      nextAssetSpec,
      Boolean(nextAssetFile || nextAssetUrl)
    ),
    discrepancies:
      body.discrepancies !== undefined ? cleanBotStringList(body.discrepancies) : existing.discrepancies,
    updatedAt: new Date().toISOString(),
  };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(
    existing.clientId,
    actor.actorName,
    nextStage === 'archived'
      ? 'archived job'
      : wantsReadyForRotty && nextReady
        ? 'queued Ready for Rotty'
        : 'updated job details',
    updated.title
  );

  return NextResponse.json(
    { ok: true, job: { ...updated, autoPostAllowed: false } },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

export const PATCH = handleUpsertJobById;
export const PUT = handleUpsertJobById;

export async function DELETE(
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

  if (existing.stage === 'posted' && !actor.user) {
    return NextResponse.json(
      { error: 'Posted jobs cannot be deleted by bots.' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  if (!isBotJobOwner(actor, existing)) {
    return NextResponse.json(
      { error: 'Only the creating bot or an operator can delete this job.' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  await opsDeleteDoc('ops_pipeline', id);
  await appendOpsActivity(existing.clientId, actor.actorName, 'deleted job', existing.title);

  return NextResponse.json(
    { ok: true, deletedId: id },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
