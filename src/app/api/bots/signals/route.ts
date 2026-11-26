import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { ensureOpsSeeded, opsQueryByClient } from '@/lib/ops/firestore-rest';
import type { OpsSignalPayload, PipelineCard } from '@/lib/ops/types';

function toSignalPayload(item: PipelineCard): OpsSignalPayload | null {
  let signal: OpsSignalPayload['signal'] | null = null;
  if (item.stage === 'posted') signal = 'posted';
  else if (item.readyForRotty || item.stage === 'approved') signal = 'ready-for-rotty';
  else if (item.marleyStatus === 'rejected') signal = 'marley-rejected';
  else if (item.marleyStatus === 'approved' && item.stage === 'clearance') signal = 'marley-approved';

  if (!signal) return null;

  return {
    id: item.id,
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
    autoPostAllowed: false,
    marleyStatus: item.marleyStatus,
    marleyNote: item.marleyNote || null,
    approvedBy: item.approvedBy || null,
    draftCopy: item.draftCopy,
    links: item.links || null,
    updatedAt: item.updatedAt,
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
  const items = await opsQueryByClient<PipelineCard>('ops_pipeline', clientId);

  const signals = items
    .filter((i) => !dateFilter || i.jobDate === dateFilter)
    .map(toSignalPayload)
    .filter((s): s is OpsSignalPayload => Boolean(s))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (format === 'md') {
    const ready = signals.filter((s) => s.signal === 'ready-for-rotty');
    const lines = [
      `# Command Center — Ready for Rotty Queue (${clientId})`,
      '',
      '> Approval in Command Center queues an item as **Ready for Rotty**. Never auto-post without Rotty\'s explicit "post it" command.',
      '',
      ...(ready.length === 0
        ? ['_No items currently queued as Ready for Rotty._']
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
