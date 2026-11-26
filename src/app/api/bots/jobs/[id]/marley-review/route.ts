import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { laneToChannel, normalizeLane } from '@/lib/ops/drop-parser';
import { appendOpsActivity, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { PipelineCard } from '@/lib/ops/types';

function cleanList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    .map((entry) => entry.trim().slice(0, 140))
    .slice(0, 8);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await authorizeBotOrOpsUser(request, 'Marley');
  if (!actor) return unauthorizedResponse();

  const { id } = await context.params;
  let body: {
    clientId?: string;
    validated?: boolean;
    approved?: boolean;
    reviewer?: string;
    notes?: string;
    revisedCopy?: string;
    lane?: string;
    channel?: string;
    discrepancies?: string[];
    artifactsNeeded?: string[];
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const existing = await opsGetDoc<PipelineCard>('ops_pipeline', id);
  if (!existing) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const scopedClientId = resolveBotTargetClientId(actor, body.clientId || existing.clientId);
  if (!scopedClientId || scopedClientId !== existing.clientId) return forbiddenResponse();
  if (actor.user && !(await canUserAccessClient(actor.user, existing.clientId))) {
    return forbiddenResponse();
  }

  const isValidated =
    typeof body.validated === 'boolean'
      ? body.validated
      : typeof body.approved === 'boolean'
        ? body.approved
        : null;

  if (isValidated === null) {
    return NextResponse.json({ error: 'validated (or approved) boolean is required' }, { status: 400 });
  }

  const reviewer =
    typeof body.reviewer === 'string' && body.reviewer.trim()
      ? body.reviewer.trim().slice(0, 32)
      : 'Marley';
  const discrepancies = cleanList(body.discrepancies);
  const artifactsNeeded = cleanList(body.artifactsNeeded);
  const hasBlockers = discrepancies.length > 0 || artifactsNeeded.length > 0;

  const nextLane = body.lane || body.channel ? normalizeLane(body.lane || body.channel) : existing.lane;
  const updated: PipelineCard = {
    ...existing,
    stage: isValidated ? 'clearance' : 'pulled',
    lane: nextLane,
    channel: laneToChannel(nextLane),
    agentId: 'marley',
    draftCopy:
      typeof body.revisedCopy === 'string' && body.revisedCopy.trim()
        ? body.revisedCopy.trim().slice(0, 2400)
        : existing.draftCopy,
    marleyStatus: isValidated ? 'approved' : 'rejected',
    marleyNote:
      typeof body.notes === 'string' && body.notes.trim()
        ? body.notes.trim().slice(0, 300)
        : isValidated && !hasBlockers
          ? `Cleared by ${reviewer} — awaiting Rotty approval`
          : `Flagged by ${reviewer} for crew resolution`,
    discrepancies,
    artifactsNeeded,
    readyForRotty: false, // Bot clearance NEVER marks readyForRotty or triggers publish
    claimedBy: undefined,
    leaseExpiresAt: undefined,
    updatedAt: new Date().toISOString(),
  };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(
    existing.clientId,
    reviewer,
    isValidated && !hasBlockers ? 'cleared item' : 'flagged discrepancies/artifacts',
    updated.title
  );

  return NextResponse.json({ ok: true, job: updated }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
