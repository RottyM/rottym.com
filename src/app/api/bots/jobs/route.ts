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
  'sourceUrl',
  'sourceFile',
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
  const needsWork = searchParams.get('needsWork');

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
    .map((item) => ({
      ...item,
      autoPostAllowed: false,
      leaseActive: Boolean(
        item.claimedBy && item.leaseExpiresAt && new Date(item.leaseExpiresAt).getTime() > nowMs
      ),
    }));

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
  }

  await ensureOpsSeeded();
  const existingCards = await opsQueryByClient<PipelineCard>('ops_pipeline', clientId);
  const now = new Date().toISOString();
  const results: PipelineCard[] = [];
  const created: PipelineCard[] = [];
  const deduplicated: PipelineCard[] = [];

  for (const itemInput of inputs) {
    const title = typeof itemInput.title === 'string' ? itemInput.title.trim().slice(0, 120) : '';
    if (!title) {
      return NextResponse.json({ error: 'title is required on every job' }, { status: 400, headers: NO_STORE_HEADERS });
    }

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

    const sourceUrl = sanitizeUrl(itemInput.sourceUrl);
    const sourceFile =
      typeof itemInput.sourceFile === 'string' ? itemInput.sourceFile.trim().slice(0, 140) || undefined : undefined;
    const assetFile =
      typeof itemInput.assetFile === 'string' ? itemInput.assetFile.trim().slice(0, 140) || undefined : undefined;
    const assetUrl = sanitizeUrl(
      itemInput.assetUrl || itemInput.driveUrl || itemInput.assetLink || itemInput.imageUrl
    );
    const assetSpec =
      typeof itemInput.assetSpec === 'string' ? itemInput.assetSpec.trim().slice(0, 60) || undefined : undefined;
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

    const note =
      typeof itemInput.note === 'string' ? itemInput.note.trim().slice(0, 300) || undefined : undefined;
    const draftCopy = typeof itemInput.draftCopy === 'string' ? itemInput.draftCopy.slice(0, 2400) : '';

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
      const effectiveSourceUrl = sourceUrl || existing.sourceUrl;
      const effectiveAssetFile = assetFile || existing.assetFile;
      const effectiveAssetUrl = assetUrl || existing.assetUrl;
      const effectiveAssetSpec = assetSpec || existing.assetSpec;
      const effectiveEventDate = eventDate || existing.eventDate;
      const wantsReady = itemInput.readyForRotty === true || requestedStage === 'approved';

      let nextStage: PipelineStage = existing.stage;
      let nextReady = existing.readyForRotty;

      if (safeStage === 'posted') {
        nextStage = 'posted';
      } else if (existing.stage === 'posted') {
        nextStage = 'posted';
      } else if (safeStage === 'archived') {
        nextStage = 'archived';
        nextReady = false;
      } else if (wantsReady && existing.marleyStatus === 'approved') {
        nextStage = 'approved';
        nextReady = true;
      } else if (STAGE_RANK[safeStage] > STAGE_RANK[existing.stage]) {
        nextStage = safeStage;
      }

      if (itemInput.readyForRotty === false) {
        nextReady = false;
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
        sourceUrl: effectiveSourceUrl,
        sourceFile: sourceFile || existing.sourceFile,
        assetFile: effectiveAssetFile,
        assetUrl: effectiveAssetUrl,
        assetSpec: effectiveAssetSpec,
        verdictTag: verdictTag || existing.verdictTag,
        eventDate: effectiveEventDate,
        photoStatus: resolveEffectivePhotoStatus({
          explicit: itemInput.photoStatus,
          existing: existing.photoStatus,
          assetFile: effectiveAssetFile,
          assetUrl: effectiveAssetUrl,
          assetSpec: effectiveAssetSpec,
        }),
        unverifiedClaims:
          explicitClaims !== undefined ? explicitClaims : existing.unverifiedClaims,
        artifactsNeeded: syncVisualArtifactsNeeded(
          existing.artifactsNeeded,
          explicitArtifacts,
          effectiveAssetSpec,
          Boolean(effectiveAssetFile || effectiveAssetUrl)
        ),
        discrepancies:
          explicitDiscrepancies !== undefined ? explicitDiscrepancies : existing.discrepancies,
        note: note || existing.note,
        draftCopy: draftCopy.trim() ? draftCopy : existing.draftCopy,
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

    const job: PipelineCard = {
      id: explicitId || `${clientId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      clientId,
      title,
      lane,
      channel: laneToChannel(lane),
      contentType,
      stage: safeStage,
      agentId:
        (typeof itemInput.agentId === 'string' && itemInput.agentId.trim().slice(0, 40)) ||
        actor.actorName.toLowerCase(),
      source:
        (typeof itemInput.source === 'string' && itemInput.source.trim().slice(0, 80)) ||
        actor.actorName,
      sourceUrl,
      note,
      draftCopy,
      flaggedNotes: applyEventDatePastFlag(baseFlags, eventDate, safeStage),
      artifactsNeeded: syncVisualArtifactsNeeded(
        undefined,
        explicitArtifacts,
        assetSpec,
        Boolean(assetFile || assetUrl)
      ),
      discrepancies: explicitDiscrepancies,
      unverifiedClaims: explicitClaims,
      verdictTag,
      eventDate,
      photoStatus: resolveEffectivePhotoStatus({
        explicit: itemInput.photoStatus,
        assetFile,
        assetUrl,
        assetSpec,
      }),
      marleyStatus: safeStage === 'posted' ? 'approved' : 'pending',
      readyForRotty: false,
      approvedBy: safeStage === 'posted' ? 'Rotty' : undefined,
      jobDate:
        typeof itemInput.jobDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(itemInput.jobDate.trim())
          ? itemInput.jobDate.trim()
          : now.slice(0, 10),
      sourceFile,
      assetFile,
      assetUrl,
      assetSpec,
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
