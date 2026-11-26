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
  applyJobAssetPatch,
  cleanBotStringList,
  ensureCardAssetsMigrated,
  FIELD_MAX_LENGTHS,
  findUnknownFields,
  getCardAssets,
  getCardCompleteness,
  inferAgentId,
  laneToChannel,
  normalizeAssignedTo,
  normalizeEventDate,
  normalizeLane,
  normalizePhotoStatus,
  normalizePlatformList,
  normalizePostFormat,
  normalizeVerdictTag,
  parseNewJobAssetInput,
  refreshStaleCardNote,
  resolveEffectivePhotoStatus,
  sanitizeWebOrBlobUrl,
  syncCardWithAssets,
  syncVisualArtifactsNeeded,
  validateBotNoImageOverride,
  validateStringLength,
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
  'assignedTo',
  'assignee',
  'targetPlatforms',
  'platforms',
  'sourceUrl',
  'url',
  'note',
  'draftCopy',
  'assetFile',
  'assetUrl',
  'driveUrl',
  'assetLink',
  'imageUrl',
  'assetSpec',
  'altText',
  'alt',
  'alt_text',
  'imageAlt',
  'credit',
  'sourceCredit',
  'photoCredit',
  'attribution',
  'assets',
  'artifactsNeeded',
  'discrepancies',
  'unverifiedClaims',
  'photoStatus',
  'textOnly',
  'postFormat',
  'format',
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
    { ok: true, job: { ...ensureCardAssetsMigrated(existing), autoPostAllowed: false } },
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

  const wantsMarkReady = body.readyForRotty === true;
  if (requestedStage === 'approved' && existing.stage !== 'approved' && !actor.user && existing.marleyStatus !== 'approved') {
    return NextResponse.json(
      { error: 'Moving a draft to approved requires Rotty or Marley approval first.' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }
  if (wantsMarkReady && existing.stage !== 'approved' && requestedStage !== 'approved') {
    return NextResponse.json(
      { error: 'Job must be Approved by Rotty before marking Ready for Rotty.' },
      { status: 409, headers: NO_STORE_HEADERS }
    );
  }

  const nextLane =
    typeof body.lane === 'string' || typeof body.channel === 'string'
      ? normalizeLane(typeof body.lane === 'string' ? body.lane : (body.channel as string))
      : existing.lane;
  const rawAssignedInput =
    body.assignedTo !== undefined ? body.assignedTo : body.assignee;
  const nextAssignedTo =
    rawAssignedInput !== undefined ? normalizeAssignedTo(rawAssignedInput) : existing.assignedTo;
  const rawPlatformsInput =
    body.targetPlatforms !== undefined ? body.targetPlatforms : body.platforms;
  const nextTargetPlatforms =
    rawPlatformsInput !== undefined
      ? normalizePlatformList(rawPlatformsInput)
      : existing.targetPlatforms;

  const now = new Date().toISOString();
  const canReviewAsset = Boolean(actor.user || inferAgentId(actor.actorName) === 'marley');

  let nextTitle = existing.title;
  if (body.title !== undefined) {
    const check = validateStringLength('title', body.title, FIELD_MAX_LENGTHS.title);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400, headers: NO_STORE_HEADERS });
    }
    if (!check.value) {
      return NextResponse.json({ error: 'title cannot be empty.' }, { status: 400, headers: NO_STORE_HEADERS });
    }
    nextTitle = check.value;
  }

  let nextNote = existing.note;
  if (body.note !== undefined) {
    if (body.note === null || body.note === '') {
      nextNote = undefined;
    } else {
      const check = validateStringLength('note', body.note, FIELD_MAX_LENGTHS.note);
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400, headers: NO_STORE_HEADERS });
      }
      nextNote = check.value || undefined;
    }
  }

  let nextDraftCopy = existing.draftCopy;
  if (body.draftCopy !== undefined) {
    const check = validateStringLength('draftCopy', body.draftCopy, FIELD_MAX_LENGTHS.draftCopy);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400, headers: NO_STORE_HEADERS });
    }
    nextDraftCopy = typeof body.draftCopy === 'string' ? body.draftCopy : '';
  }

  let nextAssetFile = existing.assetFile;
  if (body.assetFile !== undefined) {
    if (body.assetFile === null || body.assetFile === '') {
      nextAssetFile = undefined;
    } else {
      const check = validateStringLength('assetFile', body.assetFile, FIELD_MAX_LENGTHS.assetFile);
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400, headers: NO_STORE_HEADERS });
      }
      nextAssetFile = check.value || undefined;
    }
  }

  const rawAssetUrlInput =
    body.assetUrl !== undefined
      ? body.assetUrl
      : body.driveUrl !== undefined
        ? body.driveUrl
        : body.assetLink !== undefined
          ? body.assetLink
          : body.imageUrl;
  let nextAssetUrl = existing.assetUrl;
  if (rawAssetUrlInput !== undefined) {
    const urlCheck = sanitizeWebOrBlobUrl(rawAssetUrlInput, FIELD_MAX_LENGTHS.assetUrl);
    if (!urlCheck.ok) {
      return NextResponse.json(
        { error: `assetUrl: ${urlCheck.error}` },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    nextAssetUrl = urlCheck.value;
  }

  let nextAssetSpec = existing.assetSpec;
  if (body.assetSpec !== undefined) {
    if (body.assetSpec === null || body.assetSpec === '') {
      nextAssetSpec = undefined;
    } else {
      const check = validateStringLength('assetSpec', body.assetSpec, FIELD_MAX_LENGTHS.assetSpec);
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400, headers: NO_STORE_HEADERS });
      }
      nextAssetSpec = check.value || undefined;
    }
  }

  const rawSourceUrlInput = body.sourceUrl !== undefined ? body.sourceUrl : body.url;
  let nextSourceUrl = existing.sourceUrl;
  if (rawSourceUrlInput !== undefined) {
    const srcCheck = sanitizeWebOrBlobUrl(rawSourceUrlInput, FIELD_MAX_LENGTHS.sourceUrl);
    if (!srcCheck.ok) {
      return NextResponse.json(
        { error: `sourceUrl: ${srcCheck.error}` },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    nextSourceUrl = srcCheck.value;
  }

  const rawTopAlt =
    body.altText !== undefined
      ? body.altText
      : body.alt !== undefined
        ? body.alt
        : body.alt_text !== undefined
          ? body.alt_text
          : body.imageAlt;
  let nextTopAltText: string | null | undefined;
  if (rawTopAlt !== undefined) {
    if (rawTopAlt === null || rawTopAlt === '') {
      nextTopAltText = null;
    } else {
      const check = validateStringLength('altText', rawTopAlt, FIELD_MAX_LENGTHS.altText);
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400, headers: NO_STORE_HEADERS });
      }
      nextTopAltText = check.value || undefined;
    }
  }

  const rawTopCredit =
    body.credit !== undefined
      ? body.credit
      : body.sourceCredit !== undefined
        ? body.sourceCredit
        : body.photoCredit !== undefined
          ? body.photoCredit
          : body.attribution;
  let nextTopCredit: string | null | undefined;
  if (rawTopCredit !== undefined) {
    if (rawTopCredit === null || rawTopCredit === '') {
      nextTopCredit = null;
    } else {
      const check = validateStringLength('credit', rawTopCredit, FIELD_MAX_LENGTHS.credit);
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400, headers: NO_STORE_HEADERS });
      }
      nextTopCredit = check.value || undefined;
    }
  }

  let nextAssets = getCardAssets(existing);
  const existingAssetMap = new Map(nextAssets.map((a) => [a.id, a]));
  if (body.assets !== undefined) {
    if (!Array.isArray(body.assets)) {
      return NextResponse.json(
        { error: 'assets must be an array.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const rebuilt: typeof nextAssets = [];
    for (let i = 0; i < body.assets.length; i++) {
      const rawItem = body.assets[i];
      if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
        return NextResponse.json(
          { error: 'Each asset in assets must be a JSON object.' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      const itemObj = rawItem as Record<string, unknown>;
      const existingAsset =
        typeof itemObj.id === 'string' ? existingAssetMap.get(itemObj.id) : undefined;
      if (existingAsset) {
        const patchCopy = { ...itemObj };
        delete patchCopy.id;
        delete patchCopy.addedBy;
        delete patchCopy.createdAt;
        delete patchCopy.updatedAt;
        delete patchCopy.reviewedBy;
        delete patchCopy.reviewedAt;
        const patched = applyJobAssetPatch(existingAsset, patchCopy, {
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
        rebuilt.push(patched.asset);
      } else {
        const parsed = parseNewJobAssetInput(itemObj, {
          addedBy: actor.actorName,
          defaultOrder: i,
          canReviewAsset,
          now,
        });
        if (!parsed.ok) {
          return NextResponse.json(
            { error: parsed.error },
            { status: parsed.status, headers: NO_STORE_HEADERS }
          );
        }
        rebuilt.push(parsed.asset);
      }
    }
    nextAssets = rebuilt;
  } else if (
    rawAssetUrlInput !== undefined ||
    body.assetFile !== undefined ||
    body.assetSpec !== undefined ||
    nextTopAltText !== undefined ||
    nextTopCredit !== undefined
  ) {
    if (nextAssets.length > 0) {
      nextAssets = nextAssets.map((a, idx) =>
        idx === 0
          ? {
              ...a,
              url: rawAssetUrlInput !== undefined ? nextAssetUrl : a.url,
              file: body.assetFile !== undefined ? nextAssetFile : a.file,
              spec: body.assetSpec !== undefined ? nextAssetSpec : a.spec,
              altText: nextTopAltText === null ? undefined : (nextTopAltText ?? a.altText),
              credit: nextTopCredit === null ? undefined : (nextTopCredit ?? a.credit),
              status:
                (nextAssetUrl || nextAssetFile) && (a.status === 'needed' || a.status === 'in_progress')
                  ? 'delivered'
                  : a.status,
              updatedAt: now,
            }
          : a
      );
    } else if (nextAssetUrl || nextAssetFile || nextAssetSpec) {
      nextAssets = [
        {
          id: `ast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: nextAssetUrl,
          file: nextAssetFile,
          kind: 'image',
          platform: 'all',
          order: 0,
          spec: nextAssetSpec,
          altText: nextTopAltText ?? undefined,
          credit: nextTopCredit ?? undefined,
          status: nextAssetUrl || nextAssetFile ? 'delivered' : 'needed',
          addedBy: actor.actorName,
          createdAt: now,
          updatedAt: now,
        },
      ];
    }
  }

  const syncedAssetsPartial = syncCardWithAssets({}, nextAssets);
  const effectiveAssetFile = syncedAssetsPartial.assetFile;
  const effectiveAssetUrl = syncedAssetsPartial.assetUrl;
  const effectiveAssetSpec = syncedAssetsPartial.assetSpec;

  const explicitPhotoInput =
    body.textOnly === true ? 'not_needed' : body.photoStatus;
  const requestedNotNeeded =
    body.textOnly === true || normalizePhotoStatus(body.photoStatus) === 'not_needed';
  const overrideCheck = validateBotNoImageOverride({
    isUser: Boolean(actor.user),
    lane: nextLane,
    requestedNotNeeded,
    hasAssetsOrSpecs: Boolean(
      syncedAssetsPartial.assets.length > 0 ||
        effectiveAssetUrl ||
        effectiveAssetFile ||
        effectiveAssetSpec ||
        (body.artifactsNeeded !== undefined
          ? cleanBotStringList(body.artifactsNeeded)?.length
          : existing.artifactsNeeded?.length)
    ),
  });
  if (!overrideCheck.ok) {
    return NextResponse.json(
      { error: overrideCheck.error },
      { status: overrideCheck.status, headers: NO_STORE_HEADERS }
    );
  }

  const nextPhotoStatus = resolveEffectivePhotoStatus({
    explicit: explicitPhotoInput,
    existing: existing.photoStatus,
    assetFile: effectiveAssetFile,
    assetUrl: effectiveAssetUrl,
    assetSpec: effectiveAssetSpec,
  });
  const completeness = getCardCompleteness({
    ...existing,
    draftCopy: nextDraftCopy,
    assets: syncedAssetsPartial.assets,
    assetFile: effectiveAssetFile,
    assetUrl: effectiveAssetUrl,
    assetSpec: effectiveAssetSpec,
    photoStatus: nextPhotoStatus,
  });

  if (wantsMarkReady && !completeness.canApproveReady) {
    return NextResponse.json(
      {
        error: `Cannot Mark Ready for Rotty: ${completeness.detail}`,
        reason: completeness.lockReason,
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  let nextStage: PipelineStage = existing.stage;
  let nextReady = existing.readyForRotty;
  let nextPostIt = Boolean(existing.postIt);
  let nextPostItAt = existing.postItAt;
  let nextPostItBy = existing.postItBy;

  if (existing.stage === 'posted') {
    nextStage = 'posted';
  } else if (requestedStage && VALID_BOT_EDIT_STAGES.has(requestedStage)) {
    nextStage = requestedStage;
    if (requestedStage === 'archived' || requestedStage !== 'approved') {
      nextReady = false;
      nextPostIt = false;
      nextPostItAt = undefined;
      nextPostItBy = undefined;
    }
  }

  if (wantsMarkReady && nextStage === 'approved' && completeness.canApproveReady) {
    nextReady = true;
  }

  if (body.readyForRotty === false) {
    nextReady = false;
    nextPostIt = false;
    nextPostItAt = undefined;
    nextPostItBy = undefined;
  }

  if (nextReady && nextStage !== 'posted' && nextStage !== 'archived') {
    if (!completeness.canApproveReady || nextStage !== 'approved') {
      nextReady = false;
      nextPostIt = false;
      nextPostItAt = undefined;
      nextPostItBy = undefined;
    }
  }

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

  const rawPostFormat = body.postFormat !== undefined ? body.postFormat : body.format;
  const nextPostFormat =
    rawPostFormat === null || rawPostFormat === ''
      ? undefined
      : rawPostFormat !== undefined
        ? normalizePostFormat(rawPostFormat)
        : existing.postFormat;
  if (typeof rawPostFormat === 'string' && rawPostFormat.trim() && !nextPostFormat) {
    return NextResponse.json(
      {
        error:
          'Invalid postFormat. Allowed: article, article_linkedin, post_no_photo, post_photo, reply, reel, fb_ig, fb_only, ig_only.',
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const baseFlags = (existing.flaggedNotes || []).filter(
    (flag) => !(nextSourceUrl || nextStage === 'posted') || !flag.startsWith('FLAG: Missing verified source URL')
  );

  const updated: PipelineCard = {
    ...existing,
    title: nextTitle,
    lane: nextLane,
    channel: laneToChannel(nextLane),
    postFormat: nextPostFormat,
    stage: nextStage,
    readyForRotty: nextReady,
    postIt: nextPostIt,
    postItAt: nextPostItAt,
    postItBy: nextPostItBy,
    assignedTo: nextAssignedTo,
    targetPlatforms: nextTargetPlatforms,
    sourceUrl: nextSourceUrl,
    note: refreshStaleCardNote(nextNote, nextStage),
    draftCopy: nextDraftCopy,
    assets: syncedAssetsPartial.assets,
    assetFile: effectiveAssetFile,
    assetUrl: effectiveAssetUrl,
    assetSpec: effectiveAssetSpec,
    verdictTag: nextVerdictTag,
    eventDate: nextEventDate,
    photoStatus: nextPhotoStatus,
    noImageNeededBy:
      nextPhotoStatus === 'not_needed' && !effectiveAssetFile && !effectiveAssetUrl
        ? requestedNotNeeded
          ? actor.actorName
          : existing.noImageNeededBy || actor.actorName
        : undefined,
    noImageNeededAt:
      nextPhotoStatus === 'not_needed' && !effectiveAssetFile && !effectiveAssetUrl
        ? requestedNotNeeded
          ? now
          : existing.noImageNeededAt || now
        : undefined,
    unverifiedClaims:
      body.unverifiedClaims !== undefined
        ? cleanBotStringList(body.unverifiedClaims)
        : existing.unverifiedClaims,
    flaggedNotes: applyEventDatePastFlag(baseFlags, nextEventDate, nextStage),
    artifactsNeeded: syncVisualArtifactsNeeded(
      existing.artifactsNeeded,
      body.artifactsNeeded !== undefined ? cleanBotStringList(body.artifactsNeeded) : undefined,
      effectiveAssetSpec,
      Boolean(effectiveAssetFile || effectiveAssetUrl || nextPhotoStatus === 'not_needed')
    ),
    discrepancies:
      body.discrepancies !== undefined ? cleanBotStringList(body.discrepancies) : existing.discrepancies,
    updatedAt: now,
  };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(
    existing.clientId,
    actor.actorName,
    nextStage === 'archived'
      ? 'archived job'
      : wantsMarkReady && nextReady
        ? 'marked Ready for Rotty'
        : nextAssignedTo && nextAssignedTo !== existing.assignedTo
          ? `assigned to ${nextAssignedTo}`
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
