import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { ensureOpsSeeded, opsQueryByClient } from '@/lib/ops/firestore-rest';
import { getCardAssetState, getPendingPlatforms } from '@/lib/ops/drop-parser';
import type { OpsRequest, OpsSignalPayload, PipelineCard } from '@/lib/ops/types';

function toSignalPayload(item: PipelineCard): OpsSignalPayload | null {
  let signal: OpsSignalPayload['signal'] | null = null;
  if (item.stage === 'posted') signal = 'posted';
  else if (item.postIt && (item.readyForRotty || item.stage === 'approved')) signal = 'post-it';
  else if (item.readyForRotty || item.stage === 'approved') signal = 'ready-for-rotty';
  else if (item.marleyStatus === 'rejected') signal = 'marley-rejected';
  else if (
    (item.marleyStatus === 'approved' && item.stage === 'clearance') ||
    Boolean(item.verdictTag)
  ) {
    signal = item.verdictTag === 'SKIP' || item.verdictTag === 'REPEAT' || item.verdictTag === 'REJECTED'
      ? 'marley-rejected'
      : 'marley-approved';
  }

  if (!signal) return null;

  return {
    id: item.id,
    kind: 'job',
    clientId: item.clientId,
    signal,
    title: item.title,
    lane: item.lane,
    channel: item.channel,
    stage: item.stage,
    sourceFile: item.sourceFile || null,
    sourceUrl: item.sourceUrl || null,
    assetFile: item.assetFile || null,
    assetUrl: item.assetUrl || null,
    readyForRotty: Boolean(item.readyForRotty),
    postIt: Boolean(item.postIt),
    postItAt: item.postItAt || null,
    postItBy: item.postItBy || null,
    autoPostAllowed: false,
    marleyStatus: item.marleyStatus,
    marleyNote: item.marleyNote || null,
    verdictTag: item.verdictTag || null,
    photoStatus: item.photoStatus || null,
    assetState: getCardAssetState(item),
    eventDate: item.eventDate || null,
    unverifiedClaims: item.unverifiedClaims || [],
    approvedBy: item.approvedBy || null,
    assignedTo: item.assignedTo || null,
    targetPlatforms: item.targetPlatforms || [],
    pendingPlatforms: getPendingPlatforms(item.targetPlatforms, item.links),
    draftCopy: item.draftCopy,
    links: item.links || null,
    updatedAt: item.updatedAt,
  };
}

function requestToSignalPayload(req: OpsRequest): OpsSignalPayload | null {
  if (req.status !== 'decided' && req.status !== 'done') return null;
  return {
    id: req.id,
    kind: 'request',
    clientId: req.clientId,
    signal: req.status === 'decided' ? 'request-decided' : 'request-done',
    title: req.title,
    lane: 'x',
    channel: 'x',
    stage: req.status === 'done' ? 'posted' : 'approved',
    sourceFile: req.preparedFile || null,
    sourceUrl: req.preparedUrl || null,
    assetFile: null,
    assetUrl: req.outcomeUrl || null,
    readyForRotty: req.status === 'decided',
    postIt: req.status === 'decided',
    postItAt: req.decidedAt || null,
    postItBy: req.decidedBy || null,
    autoPostAllowed: false,
    marleyStatus: 'approved',
    marleyNote: req.outcomeNote || req.context || null,
    verdictTag: null,
    photoStatus: null,
    assetState: 'not_needed',
    eventDate: null,
    unverifiedClaims: [],
    approvedBy: req.decidedBy || null,
    assignedTo: req.raisedBy,
    targetPlatforms: [],
    pendingPlatforms: [],
    draftCopy: req.preparedText || req.context,
    links: null,
    request: req,
    updatedAt: req.updatedAt,
  };
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
  const dateFilter = searchParams.get('date');
  const format = searchParams.get('format');
  const [items, requests] = await Promise.all([
    opsQueryByClient<PipelineCard>('ops_pipeline', clientId),
    opsQueryByClient<OpsRequest>('ops_requests', clientId),
  ]);

  const jobSignals = items
    .filter((i) => !dateFilter || i.jobDate === dateFilter)
    .map(toSignalPayload)
    .filter((s): s is OpsSignalPayload => Boolean(s));

  const requestSignals = requests
    .filter((r) => !dateFilter || (r.raisedAt || '').slice(0, 10) === dateFilter)
    .map(requestToSignalPayload)
    .filter((s): s is OpsSignalPayload => Boolean(s));

  const signals = [...jobSignals, ...requestSignals].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );

  if (format === 'md') {
    const postItQueue = signals.filter((s) => s.signal === 'post-it');
    const ready = signals.filter((s) => s.signal === 'ready-for-rotty');
    const decidedRequests = signals.filter((s) => s.signal === 'request-decided');
    const lines = [
      `# Command Center — Publish & Ready Queue (${clientId})`,
      '',
      '> Approval in Command Center marks an item **Ready for Rotty**. Only items stamped **Post it** (`postIt: true`) are cleared to publish externally.',
      '',
      '## Post it (Cleared to Publish by Rotty)',
      ...(postItQueue.length === 0
        ? ['_No items currently stamped Post it._']
        : postItQueue.map(
            (s) =>
              `- **${s.title}** (\`${s.lane}\` · id: \`${s.id}\` · owner: \`${s.assignedTo || (s.lane === 'x' ? 'sovereign' : 'marley')}\`) — stamped at ${s.postItAt || s.updatedAt}${s.sourceUrl ? ` · source: ${s.sourceUrl}` : ''}`
          )),
      '',
      '## Decided Requests (Awaiting Bot Execution & Outcome)',
      ...(decidedRequests.length === 0
        ? ['_No decided requests awaiting execution._']
        : decidedRequests.map(
            (s) =>
              `- **${s.title}** (id: \`${s.id}\` · raisedBy: \`${s.request?.raisedBy || s.assignedTo}\` · decision: **${s.request?.decisionLabel || s.request?.decision}**) — decided at ${s.request?.decidedAt || s.updatedAt}`
          )),
      '',
      '## Ready for Rotty (Awaiting Post it click)',
      ...(ready.length === 0
        ? ['_No items currently waiting in Ready for Rotty._']
        : ready.map(
            (s) =>
              `- **${s.title}** (\`${s.lane}\` · id: \`${s.id}\`) — approved by ${s.approvedBy || 'Rotty'}${s.sourceUrl ? ` · source: ${s.sourceUrl}` : ''}`
          )),
    ];
    return new NextResponse(lines.join('\n'), {
      status: 200,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  return NextResponse.json(
    { clientId, count: signals.length, signals },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
