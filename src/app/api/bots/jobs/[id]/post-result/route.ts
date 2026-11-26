import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { appendOpsActivity, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { PipelineCard, PipelineLinks } from '@/lib/ops/types';

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

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await authorizeBotOrOpsUser(request, 'Posting Bot');
  if (!actor) return unauthorizedResponse();

  const { id } = await context.params;
  let body: {
    clientId?: string;
    botName?: string;
    status?: 'posted' | 'failed';
    externalPostUrl?: string;
    links?: PipelineLinks;
    error?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (body.status !== 'posted' && body.status !== 'failed') {
    return NextResponse.json({ error: 'status must be posted or failed' }, { status: 400 });
  }

  const existing = await opsGetDoc<PipelineCard>('ops_pipeline', id);
  if (!existing) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const scopedClientId = resolveBotTargetClientId(actor, body.clientId || existing.clientId);
  if (!scopedClientId || scopedClientId !== existing.clientId) return forbiddenResponse();
  if (actor.user && !(await canUserAccessClient(actor.user, existing.clientId))) {
    return forbiddenResponse();
  }

  const botName =
    typeof body.botName === 'string' && body.botName.trim()
      ? body.botName.trim().slice(0, 32)
      : actor.actorName;
  const ok = body.status === 'posted';

  const singleUrl = sanitizeUrl(body.externalPostUrl);
  const nextLinks: PipelineLinks = { ...(existing.links || {}) };
  if (body.links && typeof body.links === 'object') {
    if (body.links.fb) nextLinks.fb = sanitizeUrl(body.links.fb) || nextLinks.fb;
    if (body.links.ig) nextLinks.ig = sanitizeUrl(body.links.ig) || nextLinks.ig;
    if (body.links.linkedin) nextLinks.linkedin = sanitizeUrl(body.links.linkedin) || nextLinks.linkedin;
    if (body.links.x) nextLinks.x = sanitizeUrl(body.links.x) || nextLinks.x;
  }
  if (singleUrl) {
    if (existing.channel === 'linkedin') nextLinks.linkedin = nextLinks.linkedin || singleUrl;
    else if (existing.channel === 'x') nextLinks.x = nextLinks.x || singleUrl;
    else if (singleUrl.includes('instagram.com')) nextLinks.ig = nextLinks.ig || singleUrl;
    else nextLinks.fb = nextLinks.fb || singleUrl;
  }

  const updated: PipelineCard = {
    ...existing,
    stage: ok ? 'posted' : 'drafted',
    readyForRotty: false,
    claimedBy: undefined,
    leaseExpiresAt: undefined,
    links: Object.values(nextLinks).some(Boolean) ? nextLinks : undefined,
    note: ok
      ? singleUrl
        ? `Posted by ${botName} (${singleUrl})`
        : `Posted by ${botName}`
      : `Post failed (${botName}): ${(body.error || 'unknown error').slice(0, 140)}`,
    updatedAt: new Date().toISOString(),
  };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(
    existing.clientId,
    botName,
    ok ? 'reported post live' : 'reported post failure',
    updated.title
  );

  return NextResponse.json({ ok: true, job: updated }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
