import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { inferAgentId } from '@/lib/ops/drop-parser';
import { appendOpsActivity, ensureOpsSeeded, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { AgentStatus, CrewMember } from '@/lib/ops/types';

const VALID_STATUSES = new Set<AgentStatus>(['active', 'stand_down', 'on_hold', 'out', 'on_call']);

export async function POST(request: Request) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  let body: {
    clientId?: string;
    agentId?: string;
    status?: AgentStatus;
    statusNote?: string;
    usagePct?: number;
    resetNote?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const clientId = resolveBotTargetClientId(actor, body.clientId);
  if (!clientId) return forbiddenResponse('Bot token is not scoped to requested clientId.');
  if (actor.user && !(await canUserAccessClient(actor.user, clientId))) {
    return forbiddenResponse();
  }

  await ensureOpsSeeded();
  const agentId = inferAgentId(body.agentId || actor.actorName);
  const docId = `${clientId}__${agentId}`;
  const existing = await opsGetDoc<CrewMember>('ops_crew', docId);
  if (!existing) {
    return NextResponse.json({ error: `Crew member ${agentId} not found for ${clientId}` }, { status: 404 });
  }

  const nextStatus = VALID_STATUSES.has(body.status as AgentStatus)
    ? (body.status as AgentStatus)
    : existing.status;

  const updated: CrewMember = {
    ...existing,
    status: nextStatus,
    statusNote:
      typeof body.statusNote === 'string'
        ? body.statusNote.trim().slice(0, 180) || undefined
        : existing.statusNote,
    usagePct:
      typeof body.usagePct === 'number' && Number.isFinite(body.usagePct)
        ? Math.max(0, Math.min(100, Math.round(body.usagePct)))
        : existing.usagePct,
    resetNote:
      typeof body.resetNote === 'string'
        ? body.resetNote.trim().slice(0, 80) || undefined
        : existing.resetNote,
    updatedAt: new Date().toISOString(),
    updatedBy: actor.actorName,
  };

  await opsSetDoc('ops_crew', docId, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(
    clientId,
    actor.actorName,
    `updated status -> ${updated.status}`,
    updated.statusNote || updated.name
  );

  return NextResponse.json({ ok: true, crew: updated }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
