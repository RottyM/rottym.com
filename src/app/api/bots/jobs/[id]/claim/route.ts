import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { appendOpsActivity, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { PipelineCard } from '@/lib/ops/types';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  const { id } = await context.params;
  let body: { clientId?: string; botName?: string; leaseSeconds?: number } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // defaults
  }

  const item = await opsGetDoc<PipelineCard>('ops_pipeline', id);
  if (!item) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const scopedClientId = resolveBotTargetClientId(actor, body.clientId || item.clientId);
  if (!scopedClientId || scopedClientId !== item.clientId) return forbiddenResponse();
  if (actor.user && !(await canUserAccessClient(actor.user, item.clientId))) {
    return forbiddenResponse();
  }

  const claimant =
    typeof body.botName === 'string' && body.botName.trim()
      ? body.botName.trim().slice(0, 32)
      : actor.actorName;
  const leaseSeconds =
    typeof body.leaseSeconds === 'number' && Number.isFinite(body.leaseSeconds)
      ? Math.max(30, Math.min(1800, Math.round(body.leaseSeconds)))
      : 300;

  const now = Date.now();
  const activeLease =
    item.claimedBy &&
    item.leaseExpiresAt &&
    new Date(item.leaseExpiresAt).getTime() > now &&
    item.claimedBy !== claimant;

  if (activeLease) {
    return NextResponse.json(
      {
        error: `Job already claimed by ${item.claimedBy}`,
        claimedBy: item.claimedBy,
        leaseExpiresAt: item.leaseExpiresAt,
      },
      { status: 409, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const updated: PipelineCard = {
    ...item,
    claimedBy: claimant,
    leaseExpiresAt: new Date(now + leaseSeconds * 1000).toISOString(),
    updatedAt: new Date(now).toISOString(),
  };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(item.clientId, claimant, 'claimed job lease', item.title);

  return NextResponse.json({ ok: true, job: updated }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
