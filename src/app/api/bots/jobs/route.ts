import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { laneToChannel, normalizeLane } from '@/lib/ops/drop-parser';
import {
  appendOpsActivity,
  ensureOpsSeeded,
  opsQueryByClient,
  opsSetDoc,
} from '@/lib/ops/firestore-rest';
import type { ContentKind, PipelineCard, PipelineLane, PipelineLinks, PipelineStage } from '@/lib/ops/types';

const VALID_STAGES = new Set<PipelineStage>(['pulled', 'clearance', 'drafted', 'approved', 'posted']);

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
        if (!hasDisc && !hasArt) return false;
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
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
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

  const inputs = Array.isArray(body.jobs) ? (body.jobs as Array<Record<string, unknown>>) : [body];
  if (inputs.length === 0 || inputs.length > 25) {
    return NextResponse.json({ error: 'Provide 1 to 25 job items' }, { status: 400 });
  }

  await ensureOpsSeeded();
  const now = new Date().toISOString();
  const created: PipelineCard[] = [];

  for (const itemInput of inputs) {
    const title = typeof itemInput.title === 'string' ? itemInput.title.trim().slice(0, 120) : '';
    if (!title) {
      return NextResponse.json({ error: 'title is required on every job' }, { status: 400 });
    }

    const lane: PipelineLane = normalizeLane(
      typeof itemInput.lane === 'string'
        ? itemInput.lane
        : typeof itemInput.channel === 'string'
          ? itemInput.channel
          : undefined
    );
    const requestedStage: PipelineStage = VALID_STAGES.has(itemInput.stage as PipelineStage)
      ? (itemInput.stage as PipelineStage)
      : 'pulled';

    const links = sanitizeLinks(itemInput.links);
    const externalPostUrl = sanitizeUrl(itemInput.externalPostUrl);
    const hasLivePostLink = Boolean(externalPostUrl || (links && Object.values(links).some(Boolean)));

    // Bots can log an already-live quick blast directly as 'posted' if they include the live post URL,
    // but cannot self-set 'approved' / readyForRotty without Rotty.
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

    const sourceUrl = sanitizeUrl(itemInput.sourceUrl || itemInput.url);
    const flaggedNotes: string[] = [];
    if (!sourceUrl && safeStage !== 'posted') {
      flaggedNotes.push('FLAG: Missing verified source URL — required before clearance.');
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
      id: `${clientId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
      note: typeof itemInput.note === 'string' ? itemInput.note.trim().slice(0, 300) || undefined : undefined,
      draftCopy: typeof itemInput.draftCopy === 'string' ? itemInput.draftCopy.slice(0, 2400) : '',
      flaggedNotes: flaggedNotes.length > 0 ? flaggedNotes : undefined,
      marleyStatus: safeStage === 'posted' ? 'approved' : 'pending',
      readyForRotty: false,
      approvedBy: safeStage === 'posted' ? 'Rotty' : undefined,
      jobDate:
        typeof itemInput.jobDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(itemInput.jobDate.trim())
          ? itemInput.jobDate.trim()
          : now.slice(0, 10),
      sourceFile:
        typeof itemInput.sourceFile === 'string' ? itemInput.sourceFile.trim().slice(0, 140) : undefined,
      assetFile:
        typeof itemInput.assetFile === 'string' ? itemInput.assetFile.trim().slice(0, 140) : undefined,
      assetSpec:
        typeof itemInput.assetSpec === 'string' ? itemInput.assetSpec.trim().slice(0, 60) : undefined,
      links: mergedLinks,
      createdAt: now,
      updatedAt: now,
    };

    await opsSetDoc('ops_pipeline', job.id, job as unknown as Record<string, unknown>);
    created.push(job);
  }

  await appendOpsActivity(
    clientId,
    actor.actorName,
    created.length > 1
      ? `queued ${created.length} jobs`
      : created[0].stage === 'posted'
        ? 'logged live quick-blast post'
        : `queued ${created[0].lane} job (${created[0].stage})`,
    created.length > 1 ? created.map((c) => c.title).slice(0, 2).join(', ') : created[0].title
  );

  return NextResponse.json(
    created.length === 1 ? { ok: true, job: created[0] } : { ok: true, count: created.length, jobs: created },
    { status: 201, headers: { 'Cache-Control': 'no-store' } }
  );
}
