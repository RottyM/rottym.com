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
  getCardAssetState,
  getCardAssets,
  getCardCompleteness,
  getPendingPlatforms,
  inferAgentId,
  laneToChannel,
  normalizeAssignedTo,
  normalizeEventDate,
  normalizeLane,
  normalizePhotoStatus,
  normalizePlatformList,
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
import {
  appendOpsActivity,
  ensureOpsSeeded,
  opsQueryByClient,
  opsSetDoc,
} from '@/lib/ops/firestore-rest';
import type { ContentKind, PipelineCard, PipelineLane, PipelineLinks, PipelineStage } from '@/lib/ops/types';

const ALLOWED_JOB_ITEM_FIELDS = new Set([
  'id',
  'clientId',
  'title',
  'lane',
  'channel',
  'contentType',
  'stage',
  'assignedTo',
  'targetPlatforms',
  'platforms',
  'sourceUrl',
  'url',
  'sourceFile',
  'assetFile',
  'assetUrl',
  'driveUrl',
  'assetLink',
  'imageUrl',
  'assetSpec',
  'assets',
  'artifactsNeeded',
  'discrepancies',
  'unverifiedClaims',
  'photoStatus',
  'textOnly',
  'eventDate',
  'verdictTag',
  'note',
  'draftCopy',
  'agentId',
  'source',
  'jobDate',
  'links',
  'externalPostUrl',
  'readyForRotty',
  'allowDuplicate',
]);

const ALLOWED_JOB_WRAPPER_FIELDS = new Set(['clientId', 'jobs']);

const VALID_STAGES = new Set<PipelineStage>([
  'pulled',
  'clearance',
  'drafted',
  'approved',
  'posted',
  'archived',
]);

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

const STAGE_RANK: Record<PipelineStage, number> = {
  archived: -1,
  pulled: 0,
  clearance: 1,
  drafted: 2,
  approved: 3,
  posted: 4,
};

function normalizeTitleKey(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function mergeLinks(
  existing?: PipelineLinks,
  incoming?: PipelineLinks
): PipelineLinks | undefined {
  if (!existing && !incoming) return undefined;
  const merged: PipelineLinks = {
    fb: incoming?.fb || existing?.fb,
    ig: incoming?.ig || existing?.ig,
    linkedin: incoming?.linkedin || existing?.linkedin,
    x: incoming?.x || existing?.x,
  };
  return Object.values(merged).some(Boolean) ? merged : undefined;
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

function sanitizeLinks(raw: unknown): PipelineLinks | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const src = raw as Record<string, unknown>;
  const links: PipelineLinks = {
    fb: sanitizeUrl(src.fb),
    ig: sanitizeUrl(src.ig),
    linkedin: sanitizeUrl(src.linkedin),
    x: sanitizeUrl(src.x),
  };
  return Object.values(links).some(Boolean) ? links : undefined;
}

export async function GET(request: Request) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const clientId = resolveBotTargetClientId(actor, searchParams.get('clientId'));
  if (!clientId) return forbiddenResponse('Bot token is not scoped to requested clientId.');
  if (actor.user && !(await canUserAccessClient(actor.user, clientId))) {
    return forbiddenResponse();
  }

  await ensureOpsSeeded();
  const stage = searchParams.get('stage');
  const includeArchived = searchParams.get('includeArchived') === 'true';
  const lane = searchParams.get('lane');
  const channel = searchParams.get('channel');
  const date = searchParams.get('date');
  const marleyStatus = searchParams.get('marleyStatus');
  const readyForRotty = searchParams.get('readyForRotty');
  const postItParam = searchParams.get('postIt');
  const needsWork = searchParams.get('needsWork');
  const mineParam = searchParams.get('mine') === 'true';
  const rawAssignedParam = searchParams.get('assignedTo')?.trim() || '';

  let assignedFilterMode: 'none' | 'unassigned' | 'agent' = 'none';
  let assignedFilterAgent: string | undefined;
  if (mineParam || rawAssignedParam.toLowerCase() === 'me') {
    if (!actor.user && actor.actorName.toLowerCase() === 'bot') {
      return NextResponse.json(
        { error: 'assignedTo=me requires a per-bot token or X-Bot-Name header.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const resolvedSelf = normalizeAssignedTo(actor.user ? actor.user.name : actor.actorName);
    if (!resolvedSelf) {
      return NextResponse.json(
        { error: 'Unable to resolve bot identity for assignedTo=me.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    assignedFilterMode = 'agent';
    assignedFilterAgent = resolvedSelf;
  } else if (rawAssignedParam) {
    const cleanParam = rawAssignedParam.toLowerCase();
    if (cleanParam === 'unassigned' || cleanParam === 'none' || cleanParam === 'null') {
      assignedFilterMode = 'unassigned';
    } else {
      assignedFilterMode = 'agent';
      assignedFilterAgent = normalizeAssignedTo(rawAssignedParam);
    }
  }

  const all = await opsQueryByClient<PipelineCard>('ops_pipeline', clientId);
  const nowMs = Date.now();

  const jobs = all
    .filter((item) => {
      if (!stage && !includeArchived && item.stage === 'archived') return false;
      if (stage && item.stage !== stage) return false;
      if (lane && item.lane !== lane) return false;
      if (channel && item.channel !== channel) return false;
      if (date && item.jobDate !== date) return false;
      if (marleyStatus && item.marleyStatus !== marleyStatus) return false;
      if (readyForRotty === 'true' && !item.readyForRotty) return false;
      if (readyForRotty === 'false' && item.readyForRotty) return false;
      if (postItParam === 'true' && !item.postIt) return false;
      if (postItParam === 'false' && item.postIt) return false;
      if (assignedFilterMode === 'unassigned' && normalizeAssignedTo(item.assignedTo)) return false;
      if (assignedFilterMode === 'agent') {
        const cardAssigned = normalizeAssignedTo(item.assignedTo) === assignedFilterAgent;
        const assetAssigned = item.assets?.some(
          (a) => normalizeAssignedTo(a.assignedTo) === assignedFilterAgent && a.status !== 'approved'
        );
        if (!cardAssigned && !assetAssigned) {
          return false;
        }
      }
      if (needsWork === 'true') {
        const hasDisc = Boolean(item.discrepancies?.length);
        const hasArt = Boolean(item.artifactsNeeded?.length);
        const hasClaims = Boolean(item.unverifiedClaims?.length);
        const needsPhoto =
          item.photoStatus === 'needed' ||
          item.photoStatus === 'missing' ||
          Boolean(item.assetSpec && !item.assetFile && !item.assetUrl);
        if (!hasDisc && !hasArt && !hasClaims && !needsPhoto) return false;
      }
      return true;
    })
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .map((item) => {
      const migrated = ensureCardAssetsMigrated(item);
      return {
        ...migrated,
        assetState: getCardAssetState(migrated),
        autoPostAllowed: false,
        leaseActive: Boolean(
          migrated.claimedBy &&
            migrated.leaseExpiresAt &&
            new Date(migrated.leaseExpiresAt).getTime() > nowMs
        ),
      };
    });

  return NextResponse.json(
    { clientId, count: jobs.length, jobs },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

export async function POST(request: Request) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const clientId = resolveBotTargetClientId(
    actor,
    typeof body.clientId === 'string' ? body.clientId : null
  );
  if (!clientId) return forbiddenResponse('Bot token is not scoped to requested clientId.');
  if (actor.user && !(await canUserAccessClient(actor.user, clientId))) {
    return forbiddenResponse();
  }

  if (Array.isArray(body.jobs)) {
    const wrapperUnknown = findUnknownFields(body, ALLOWED_JOB_WRAPPER_FIELDS);
    if (wrapperUnknown.length > 0) {
      return NextResponse.json(
        {
          error: `Unknown wrapper field(s): ${wrapperUnknown.join(', ')}`,
          unknownFields: wrapperUnknown,
          allowedFields: Array.from(ALLOWED_JOB_WRAPPER_FIELDS),
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
  }

  const inputs = Array.isArray(body.jobs) ? (body.jobs as Array<Record<string, unknown>>) : [body];
  if (inputs.length === 0 || inputs.length > 25) {
    return NextResponse.json({ error: 'Provide 1 to 25 job items' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  for (const itemInput of inputs) {
    if (!itemInput || typeof itemInput !== 'object' || Array.isArray(itemInput)) {
      return NextResponse.json({ error: 'Each job item must be a JSON object' }, { status: 400, headers: NO_STORE_HEADERS });
    }
    const unknown = findUnknownFields(itemInput, ALLOWED_JOB_ITEM_FIELDS);
    if (unknown.length > 0) {
      return NextResponse.json(
        {
          error: `Unknown field(s): ${unknown.join(', ')}${unknown.includes('url') ? ' (use "sourceUrl" instead of "url")' : ''}`,
          unknownFields: unknown,
          allowedFields: Array.from(ALLOWED_JOB_ITEM_FIELDS),
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    if (!actor.user && normalizePhotoStatus(itemInput.photoStatus) === 'not_needed') {
      const earlyLane = normalizeLane(
        typeof itemInput.lane === 'string'
          ? itemInput.lane
          : typeof itemInput.channel === 'string'
            ? itemInput.channel
            : undefined
      );
      if (earlyLane !== 'x' && earlyLane !== 'linkedin' && itemInput.id === undefined) {
        // Defer full check until existing card's lane/assets are resolved below.
      }
    }
  }

  await ensureOpsSeeded();
  const existingCards = await opsQueryByClient<PipelineCard>('ops_pipeline', clientId);
  const now = new Date().toISOString();
  const results: PipelineCard[] = [];
  const created: PipelineCard[] = [];
  const deduplicated: PipelineCard[] = [];

  const canReviewAsset = Boolean(actor.user || inferAgentId(actor.actorName) === 'marley');

  for (const itemInput of inputs) {
    const titleCheck = validateStringLength('title', itemInput.title, FIELD_MAX_LENGTHS.title);
    if (!titleCheck.ok || !titleCheck.value) {
      return NextResponse.json(
        { error: !titleCheck.ok ? titleCheck.error : 'title is required on every job' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const title = titleCheck.value;

    const lane: PipelineLane = normalizeLane(
      typeof itemInput.lane === 'string'
        ? itemInput.lane
        : typeof itemInput.channel === 'string'
          ? itemInput.channel
          : undefined
    );
    const rawStage = typeof itemInput.stage === 'string' ? itemInput.stage.trim().toLowerCase() : '';
    const normalizedStage =
      rawStage === 'cancelled' || rawStage === 'canceled' ? 'archived' : rawStage;
    const requestedStage: PipelineStage = VALID_STAGES.has(normalizedStage as PipelineStage)
      ? (normalizedStage as PipelineStage)
      : 'pulled';

    const links = sanitizeLinks(itemInput.links);
    const externalPostUrl = sanitizeUrl(itemInput.externalPostUrl);
    const hasLivePostLink = Boolean(externalPostUrl || (links && Object.values(links).some(Boolean)));

    // Bots can log an already-live quick blast directly as 'posted' if they include the live post URL,
    // and can move Marley-approved cards into 'approved' (Ready for Rotty) during an update,
    // but new cards cannot self-set 'approved' or 'posted' without live evidence.
    const safeStage: PipelineStage =
      requestedStage === 'posted' && hasLivePostLink
        ? 'posted'
        : requestedStage === 'approved' || requestedStage === 'posted'
          ? 'drafted'
          : requestedStage;

    const mergedLinks: PipelineLinks | undefined =
      links ||
      (externalPostUrl
        ? lane === 'linkedin' || lane === 'article'
          ? { linkedin: externalPostUrl }
          : lane === 'x'
            ? { x: externalPostUrl }
            : externalPostUrl.includes('instagram.com')
              ? { ig: externalPostUrl }
              : { fb: externalPostUrl }
        : undefined);

    const rawSourceUrl =
      itemInput.sourceUrl !== undefined ? itemInput.sourceUrl : itemInput.url;
    const sourceUrlCheck = sanitizeWebOrBlobUrl(rawSourceUrl, FIELD_MAX_LENGTHS.sourceUrl);
    if (!sourceUrlCheck.ok) {
      return NextResponse.json(
        { error: `sourceUrl: ${sourceUrlCheck.error}` },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const sourceUrl = sourceUrlCheck.value;

    let sourceFile: string | undefined;
    if (itemInput.sourceFile !== undefined && itemInput.sourceFile !== null) {
      const sfCheck = validateStringLength('sourceFile', itemInput.sourceFile, FIELD_MAX_LENGTHS.assetFile);
      if (!sfCheck.ok) return NextResponse.json({ error: sfCheck.error }, { status: 400, headers: NO_STORE_HEADERS });
      sourceFile = sfCheck.value || undefined;
    }

    let assetFile: string | undefined;
    if (itemInput.assetFile !== undefined && itemInput.assetFile !== null) {
      const afCheck = validateStringLength('assetFile', itemInput.assetFile, FIELD_MAX_LENGTHS.assetFile);
      if (!afCheck.ok) return NextResponse.json({ error: afCheck.error }, { status: 400, headers: NO_STORE_HEADERS });
      assetFile = afCheck.value || undefined;
    }

    const rawAssetUrl =
      itemInput.assetUrl ?? itemInput.driveUrl ?? itemInput.assetLink ?? itemInput.imageUrl;
    const assetUrlCheck = sanitizeWebOrBlobUrl(rawAssetUrl, FIELD_MAX_LENGTHS.assetUrl);
    if (!assetUrlCheck.ok) {
      return NextResponse.json(
        { error: `assetUrl: ${assetUrlCheck.error}` },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const assetUrl = assetUrlCheck.value;

    let assetSpec: string | undefined;
    if (itemInput.assetSpec !== undefined && itemInput.assetSpec !== null) {
      const spCheck = validateStringLength('assetSpec', itemInput.assetSpec, FIELD_MAX_LENGTHS.assetSpec);
      if (!spCheck.ok) return NextResponse.json({ error: spCheck.error }, { status: 400, headers: NO_STORE_HEADERS });
      assetSpec = spCheck.value || undefined;
    }

    const explicitArtifacts =
      itemInput.artifactsNeeded !== undefined
        ? cleanBotStringList(itemInput.artifactsNeeded)
        : undefined;
    const explicitDiscrepancies =
      itemInput.discrepancies !== undefined
        ? cleanBotStringList(itemInput.discrepancies)
        : undefined;
    const explicitClaims =
      itemInput.unverifiedClaims !== undefined
        ? cleanBotStringList(itemInput.unverifiedClaims)
        : undefined;
    const eventDate =
      itemInput.eventDate !== undefined ? normalizeEventDate(itemInput.eventDate) : undefined;
    if (typeof itemInput.eventDate === 'string' && itemInput.eventDate.trim() && !eventDate) {
      return NextResponse.json(
        { error: 'Invalid eventDate format. Expected YYYY-MM-DD.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const verdictTag =
      itemInput.verdictTag !== undefined ? normalizeVerdictTag(itemInput.verdictTag) : undefined;
    if (typeof itemInput.verdictTag === 'string' && itemInput.verdictTag.trim() && !verdictTag) {
      return NextResponse.json(
        { error: 'Invalid verdictTag. Allowed: NEW, FOLLOW-UP, REPEAT, SKIP, HOLD, REJECTED.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    let note: string | undefined;
    if (itemInput.note !== undefined && itemInput.note !== null) {
      const noteCheck = validateStringLength('note', itemInput.note, FIELD_MAX_LENGTHS.note);
      if (!noteCheck.ok) return NextResponse.json({ error: noteCheck.error }, { status: 400, headers: NO_STORE_HEADERS });
      note = noteCheck.value || undefined;
    }

    let draftCopy = '';
    if (itemInput.draftCopy !== undefined && itemInput.draftCopy !== null) {
      const dcCheck = validateStringLength('draftCopy', itemInput.draftCopy, FIELD_MAX_LENGTHS.draftCopy);
      if (!dcCheck.ok) return NextResponse.json({ error: dcCheck.error }, { status: 400, headers: NO_STORE_HEADERS });
      draftCopy = typeof itemInput.draftCopy === 'string' ? itemInput.draftCopy : '';
    }
    if (
      itemInput.assignedTo !== undefined &&
      itemInput.assignedTo !== null &&
      typeof itemInput.assignedTo !== 'string'
    ) {
      return NextResponse.json(
        { error: 'assignedTo must be a string or null.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const incomingAssignedTo =
      itemInput.assignedTo !== undefined ? normalizeAssignedTo(itemInput.assignedTo) : undefined;
    const hasTargetPlatformsInput =
      itemInput.targetPlatforms !== undefined || itemInput.platforms !== undefined;
    const incomingTargetPlatforms = hasTargetPlatformsInput
      ? normalizePlatformList(itemInput.targetPlatforms ?? itemInput.platforms)
      : undefined;

    const allowDuplicate = itemInput.allowDuplicate === true;
    const explicitId = typeof itemInput.id === 'string' ? itemInput.id.trim() : '';
    const titleKey = normalizeTitleKey(title);
    const matchedIndex = existingCards.findIndex((c) => {
      if (explicitId && c.id === explicitId) return true;
      if (allowDuplicate) return false;
      return c.stage !== 'archived' && titleKey.length > 0 && normalizeTitleKey(c.title) === titleKey;
    });

    if (matchedIndex >= 0) {
      const existing = existingCards[matchedIndex];
      if (safeStage === 'archived' && existing.stage !== 'posted' && !isBotJobOwner(actor, existing)) {
        return NextResponse.json(
          { error: 'Only the creating bot or an operator can archive this job.' },
          { status: 403, headers: NO_STORE_HEADERS }
        );
      }

      const combinedLinks = mergeLinks(existing.links, mergedLinks);
      const effectiveTargetPlatforms = hasTargetPlatformsInput
        ? incomingTargetPlatforms
        : existing.targetPlatforms;
      const pendingOnMerge = getPendingPlatforms(effectiveTargetPlatforms, combinedLinks);
      const effectiveSourceUrl = sourceUrl || existing.sourceUrl;
      let nextAssets = getCardAssets(existing);
      if (itemInput.assets !== undefined) {
        if (!Array.isArray(itemInput.assets)) {
          return NextResponse.json(
            { error: 'assets must be an array.' },
            { status: 400, headers: NO_STORE_HEADERS }
          );
        }
        const byId = new Map(nextAssets.map((a) => [a.id, a]));
        const rebuilt: typeof nextAssets = [];
        for (let i = 0; i < itemInput.assets.length; i++) {
          const rawA = itemInput.assets[i];
          if (!rawA || typeof rawA !== 'object' || Array.isArray(rawA)) {
            return NextResponse.json(
              { error: 'Each asset in assets must be a JSON object.' },
              { status: 400, headers: NO_STORE_HEADERS }
            );
          }
          const aObj = rawA as Record<string, unknown>;
          const prevAsset = typeof aObj.id === 'string' ? byId.get(aObj.id) : undefined;
          if (prevAsset) {
            const pCopy = { ...aObj };
            delete pCopy.id;
            const patched = applyJobAssetPatch(prevAsset, pCopy, {
              actorName: actor.actorName,
              canReviewAsset,
              now,
            });
            if (!patched.ok) {
              return NextResponse.json({ error: patched.error }, { status: patched.status, headers: NO_STORE_HEADERS });
            }
            rebuilt.push(patched.asset);
          } else {
            const parsed = parseNewJobAssetInput(aObj, {
              addedBy: actor.actorName,
              defaultOrder: i,
              canReviewAsset,
              now,
            });
            if (!parsed.ok) {
              return NextResponse.json({ error: parsed.error }, { status: parsed.status, headers: NO_STORE_HEADERS });
            }
            rebuilt.push(parsed.asset);
          }
        }
        nextAssets = rebuilt;
      } else if (assetFile || assetUrl || assetSpec) {
        if (nextAssets.length > 0) {
          nextAssets = nextAssets.map((a, idx) =>
            idx === 0
              ? {
                  ...a,
                  url: assetUrl || a.url,
                  file: assetFile || a.file,
                  spec: assetSpec || a.spec,
                  status: (assetUrl || assetFile) && (a.status === 'needed' || a.status === 'in_progress') ? 'delivered' : a.status,
                  updatedAt: now,
                }
              : a
          );
        } else {
          nextAssets = [
            {
              id: `ast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              url: assetUrl,
              file: assetFile,
              kind: 'image',
              platform: 'all',
              order: 0,
              spec: assetSpec,
              status: assetUrl || assetFile ? 'delivered' : 'needed',
              addedBy: actor.actorName,
              createdAt: now,
              updatedAt: now,
            },
          ];
        }
      }

      const syncedMergedAssets = syncCardWithAssets({}, nextAssets);
      const effectiveAssetFile = syncedMergedAssets.assetFile;
      const effectiveAssetUrl = syncedMergedAssets.assetUrl;
      const effectiveAssetSpec = syncedMergedAssets.assetSpec;
      const effectiveEventDate = eventDate || existing.eventDate;
      const effectiveDraftCopy = draftCopy.trim() ? draftCopy : existing.draftCopy;
      const requestedNotNeededMerge =
        itemInput.textOnly === true || normalizePhotoStatus(itemInput.photoStatus) === 'not_needed';
      const mergeOverrideCheck = validateBotNoImageOverride({
        isUser: Boolean(actor.user),
        lane: existing.lane || lane,
        requestedNotNeeded: requestedNotNeededMerge,
        hasAssetsOrSpecs: Boolean(
          syncedMergedAssets.assets.length > 0 ||
            effectiveAssetUrl ||
            effectiveAssetFile ||
            effectiveAssetSpec ||
            (explicitArtifacts !== undefined ? explicitArtifacts.length : existing.artifactsNeeded?.length)
        ),
      });
      if (!mergeOverrideCheck.ok) {
        return NextResponse.json(
          { error: mergeOverrideCheck.error },
          { status: mergeOverrideCheck.status, headers: NO_STORE_HEADERS }
        );
      }

      const nextPhotoStatus = resolveEffectivePhotoStatus({
        explicit: itemInput.textOnly === true ? 'not_needed' : itemInput.photoStatus,
        existing: existing.photoStatus,
        assetFile: effectiveAssetFile,
        assetUrl: effectiveAssetUrl,
        assetSpec: effectiveAssetSpec,
      });
      const completeness = getCardCompleteness({
        ...existing,
        draftCopy: effectiveDraftCopy,
        assets: syncedMergedAssets.assets,
        assetFile: effectiveAssetFile,
        assetUrl: effectiveAssetUrl,
        assetSpec: effectiveAssetSpec,
        photoStatus: nextPhotoStatus,
      });
      const wantsMarkReady = itemInput.readyForRotty === true;

      if (wantsMarkReady && (existing.stage === 'approved' || requestedStage === 'approved') && !completeness.canApproveReady) {
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

      if (safeStage === 'posted' && pendingOnMerge.length === 0) {
        nextStage = 'posted';
      } else if (existing.stage === 'posted') {
        nextStage = 'posted';
      } else if (safeStage === 'archived') {
        nextStage = 'archived';
        nextReady = false;
      } else if (STAGE_RANK[safeStage] > STAGE_RANK[existing.stage] && safeStage !== 'posted') {
        nextStage = safeStage;
      }

      if (wantsMarkReady && nextStage === 'approved' && completeness.canApproveReady) {
        nextReady = true;
      }

      if (itemInput.readyForRotty === false) {
        nextReady = false;
      }

      if (nextReady && nextStage !== 'posted' && nextStage !== 'archived') {
        if (!completeness.canApproveReady || nextStage !== 'approved') {
          nextReady = false;
        }
      }

      const cleanedFlags = (existing.flaggedNotes || []).filter(
        (flag) => !(effectiveSourceUrl || nextStage === 'posted') || !flag.startsWith('FLAG: Missing verified source URL')
      );
      if (!effectiveSourceUrl && nextStage !== 'posted' && nextStage !== 'archived' && cleanedFlags.length === 0) {
        cleanedFlags.push('FLAG: Missing verified source URL — required before clearance.');
      }

      const updated: PipelineCard = {
        ...existing,
        stage: nextStage,
        readyForRotty: nextReady,
        postIt:
          nextStage === 'posted' || nextStage === 'archived' || !nextReady
            ? false
            : existing.postIt,
        postItAt:
          nextStage === 'archived' || (!nextReady && nextStage !== 'posted')
            ? undefined
            : existing.postItAt,
        postItBy:
          nextStage === 'archived' || (!nextReady && nextStage !== 'posted')
            ? undefined
            : existing.postItBy,
        assignedTo:
          itemInput.assignedTo !== undefined ? incomingAssignedTo : existing.assignedTo,
        targetPlatforms: effectiveTargetPlatforms,
        sourceUrl: effectiveSourceUrl,
        sourceFile: sourceFile || existing.sourceFile,
        assets: syncedMergedAssets.assets,
        assetFile: effectiveAssetFile,
        assetUrl: effectiveAssetUrl,
        assetSpec: effectiveAssetSpec,
        verdictTag: verdictTag || existing.verdictTag,
        eventDate: effectiveEventDate,
        photoStatus: nextPhotoStatus,
        noImageNeededBy:
          nextPhotoStatus === 'not_needed' && !effectiveAssetFile && !effectiveAssetUrl
            ? requestedNotNeededMerge
              ? actor.actorName
              : existing.noImageNeededBy || actor.actorName
            : undefined,
        noImageNeededAt:
          nextPhotoStatus === 'not_needed' && !effectiveAssetFile && !effectiveAssetUrl
            ? requestedNotNeededMerge
              ? now
              : existing.noImageNeededAt || now
            : undefined,
        unverifiedClaims:
          explicitClaims !== undefined ? explicitClaims : existing.unverifiedClaims,
        artifactsNeeded: syncVisualArtifactsNeeded(
          existing.artifactsNeeded,
          explicitArtifacts,
          effectiveAssetSpec,
          Boolean(effectiveAssetFile || effectiveAssetUrl || nextPhotoStatus === 'not_needed')
        ),
        discrepancies:
          explicitDiscrepancies !== undefined ? explicitDiscrepancies : existing.discrepancies,
        note: refreshStaleCardNote(note || existing.note, nextStage),
        draftCopy: effectiveDraftCopy,
        links: combinedLinks,
        flaggedNotes: applyEventDatePastFlag(cleanedFlags, effectiveEventDate, nextStage),
        marleyStatus: nextStage === 'posted' ? 'approved' : existing.marleyStatus,
        approvedBy: nextStage === 'posted' ? existing.approvedBy || 'Rotty' : existing.approvedBy,
        updatedAt: now,
      };

      await opsSetDoc('ops_pipeline', updated.id, updated as unknown as Record<string, unknown>);
      existingCards[matchedIndex] = updated;
      deduplicated.push(updated);
      results.push(updated);
      continue;
    }

    const baseFlags: string[] = [];
    if (!sourceUrl && safeStage !== 'posted' && safeStage !== 'archived') {
      baseFlags.push('FLAG: Missing verified source URL — required before clearance.');
    }

    const contentType: ContentKind =
      itemInput.contentType === 'article' ||
      itemInput.contentType === 'image' ||
      itemInput.contentType === 'pull'
        ? itemInput.contentType
        : lane === 'article'
          ? 'article'
          : 'post';

    const pendingOnCreate = getPendingPlatforms(incomingTargetPlatforms, mergedLinks);
    const finalCreateStage: PipelineStage =
      safeStage === 'posted' && pendingOnCreate.length > 0 ? 'drafted' : safeStage;

    let createdAssets: ReturnType<typeof getCardAssets> = [];
    if (itemInput.assets !== undefined) {
      if (!Array.isArray(itemInput.assets)) {
        return NextResponse.json(
          { error: 'assets must be an array.' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      for (let i = 0; i < itemInput.assets.length; i++) {
        const rawA = itemInput.assets[i];
        if (!rawA || typeof rawA !== 'object' || Array.isArray(rawA)) {
          return NextResponse.json(
            { error: 'Each asset in assets must be a JSON object.' },
            { status: 400, headers: NO_STORE_HEADERS }
          );
        }
        const parsed = parseNewJobAssetInput(rawA as Record<string, unknown>, {
          addedBy: actor.actorName,
          defaultOrder: i,
          canReviewAsset,
          now,
        });
        if (!parsed.ok) {
          return NextResponse.json({ error: parsed.error }, { status: parsed.status, headers: NO_STORE_HEADERS });
        }
        createdAssets.push(parsed.asset);
      }
    } else if (assetFile || assetUrl || assetSpec) {
      createdAssets = [
        {
          id: `ast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: assetUrl,
          file: assetFile,
          kind: 'image',
          platform: 'all',
          order: 0,
          spec: assetSpec,
          status: assetUrl || assetFile ? 'delivered' : 'needed',
          addedBy: actor.actorName,
          createdAt: now,
          updatedAt: now,
        },
      ];
    }
    const syncedNewAssets = syncCardWithAssets({}, createdAssets);
    const requestedNotNeededCreate =
      itemInput.textOnly === true || normalizePhotoStatus(itemInput.photoStatus) === 'not_needed';
    const createOverrideCheck = validateBotNoImageOverride({
      isUser: Boolean(actor.user),
      lane,
      requestedNotNeeded: requestedNotNeededCreate,
      hasAssetsOrSpecs: Boolean(
        syncedNewAssets.assets.length > 0 ||
          syncedNewAssets.assetUrl ||
          syncedNewAssets.assetFile ||
          syncedNewAssets.assetSpec ||
          explicitArtifacts?.length
      ),
    });
    if (!createOverrideCheck.ok) {
      return NextResponse.json(
        { error: createOverrideCheck.error },
        { status: createOverrideCheck.status, headers: NO_STORE_HEADERS }
      );
    }
    const createdPhotoStatus = resolveEffectivePhotoStatus({
      explicit: itemInput.textOnly === true ? 'not_needed' : itemInput.photoStatus,
      assetFile: syncedNewAssets.assetFile,
      assetUrl: syncedNewAssets.assetUrl,
      assetSpec: syncedNewAssets.assetSpec,
    });

    const job: PipelineCard = {
      id: explicitId || `${clientId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      clientId,
      title,
      lane,
      channel: laneToChannel(lane),
      contentType,
      stage: finalCreateStage,
      agentId:
        (typeof itemInput.agentId === 'string' && itemInput.agentId.trim().slice(0, 40)) ||
        actor.actorName.toLowerCase(),
      assignedTo: incomingAssignedTo,
      targetPlatforms: incomingTargetPlatforms,
      source:
        (typeof itemInput.source === 'string' && itemInput.source.trim().slice(0, 80)) ||
        actor.actorName,
      sourceUrl,
      note: refreshStaleCardNote(note, finalCreateStage),
      draftCopy,
      flaggedNotes: applyEventDatePastFlag(baseFlags, eventDate, finalCreateStage),
      artifactsNeeded: syncVisualArtifactsNeeded(
        undefined,
        explicitArtifacts,
        syncedNewAssets.assetSpec,
        Boolean(syncedNewAssets.assetFile || syncedNewAssets.assetUrl)
      ),
      discrepancies: explicitDiscrepancies,
      unverifiedClaims: explicitClaims,
      verdictTag,
      eventDate,
      photoStatus: createdPhotoStatus,
      noImageNeededBy:
        createdPhotoStatus === 'not_needed' ? actor.actorName : undefined,
      noImageNeededAt:
        createdPhotoStatus === 'not_needed' ? now : undefined,
      marleyStatus: finalCreateStage === 'posted' ? 'approved' : 'pending',
      readyForRotty: false,
      approvedBy: finalCreateStage === 'posted' ? 'Rotty' : undefined,
      jobDate:
        typeof itemInput.jobDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(itemInput.jobDate.trim())
          ? itemInput.jobDate.trim()
          : now.slice(0, 10),
      sourceFile,
      assets: syncedNewAssets.assets,
      assetFile: syncedNewAssets.assetFile,
      assetUrl: syncedNewAssets.assetUrl,
      assetSpec: syncedNewAssets.assetSpec,
      links: mergedLinks,
      createdAt: now,
      updatedAt: now,
    };

    await opsSetDoc('ops_pipeline', job.id, job as unknown as Record<string, unknown>);
    existingCards.push(job);
    created.push(job);
    results.push(job);
  }

  const activityAction =
    results.length > 1
      ? `processed ${results.length} jobs (${created.length} new, ${deduplicated.length} merged)`
      : deduplicated.length === 1
        ? `merged update into existing card`
        : results[0].stage === 'posted'
          ? 'logged live quick-blast post'
          : `queued ${results[0].lane} job (${results[0].stage})`;

  await appendOpsActivity(
    clientId,
    actor.actorName,
    activityAction,
    results.length > 1 ? results.map((c) => c.title).slice(0, 2).join(', ') : results[0].title
  );

  const safeResults = results.map((item) => ({ ...item, autoPostAllowed: false as const }));

  if (safeResults.length === 1) {
    const isMerged = deduplicated.length === 1;
    return NextResponse.json(
      isMerged
        ? { ok: true, deduplicated: true, job: safeResults[0] }
        : { ok: true, job: safeResults[0] },
      { status: isMerged ? 200 : 201, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      count: safeResults.length,
      createdCount: created.length,
      deduplicatedCount: deduplicated.length,
      jobs: safeResults,
    },
    { status: created.length > 0 ? 201 : 200, headers: NO_STORE_HEADERS }
  );
}
