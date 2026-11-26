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
import type { PipelineCard, PipelineStage } from '@/lib/ops/types';

const VALID_BOT_STAGES = new Set<PipelineStage>(['pulled', 'clearance', 'drafted']);

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

function cleanList(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    .map((entry) => entry.trim().slice(0, 140))
    .slice(0, 8);
}

export async function PATCH(
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
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const existing = await opsGetDoc<PipelineCard>('ops_pipeline', id);
  if (!existing) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const scopedClientId = resolveBotTargetClientId(
    actor,
    typeof body.clientId === 'string' ? body.clientId : existing.clientId
  );
  if (!scopedClientId || scopedClientId !== existing.clientId) return forbiddenResponse();
  if (actor.user && !(await canUserAccessClient(actor.user, existing.clientId))) {
    return forbiddenResponse();
  }

  const nextLane =
    typeof body.lane === 'string' || typeof body.channel === 'string'
      ? normalizeLane(typeof body.lane === 'string' ? body.lane : (body.channel as string))
      : existing.lane;

  const requestedStage = body.stage as PipelineStage | undefined;
  const nextStage: PipelineStage =
    requestedStage && VALID_BOT_STAGES.has(requestedStage) ? requestedStage : existing.stage;

  const updated: PipelineCard = {
    ...existing,
    title:
      typeof body.title === 'string' && body.title.trim()
        ? body.title.trim().slice(0, 120)
        : existing.title,
    lane: nextLane,
    channel: laneToChannel(nextLane),
    stage: nextStage,
    sourceUrl: body.sourceUrl !== undefined ? sanitizeUrl(body.sourceUrl) : existing.sourceUrl,
    note:
      typeof body.note === 'string'
        ? body.note.trim().slice(0, 300) || undefined
        : existing.note,
    draftCopy:
      typeof body.draftCopy === 'string' ? body.draftCopy.slice(0, 2400) : existing.draftCopy,
    assetFile:
      typeof body.assetFile === 'string'
        ? body.assetFile.trim().slice(0, 160) || undefined
        : existing.assetFile,
    assetSpec:
      typeof body.assetSpec === 'string'
        ? body.assetSpec.trim().slice(0, 60) || undefined
        : existing.assetSpec,
    artifactsNeeded:
      body.artifactsNeeded !== undefined ? cleanList(body.artifactsNeeded) : existing.artifactsNeeded,
    discrepancies:
      body.discrepancies !== undefined ? cleanList(body.discrepancies) : existing.discrepancies,
    updatedAt: new Date().toISOString(),
  };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(existing.clientId, actor.actorName, 'updated job details', updated.title);

  return NextResponse.json({ ok: true, job: updated }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
