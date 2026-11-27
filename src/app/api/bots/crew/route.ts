import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import {
  findUnknownFields,
  inferAgentId,
  parseConnectorAlert,
  parseDailyCountsPatch,
  sanitizeAvatarUrl,
} from '@/lib/ops/drop-parser';
import {
  appendOpsActivity,
  ensureOpsSeeded,
  opsGetDoc,
  opsQueryByClient,
  opsSetDoc,
} from '@/lib/ops/firestore-rest';
import type { AgentStatus, CrewMember } from '@/lib/ops/types';

const VALID_STATUSES = new Set<AgentStatus>(['active', 'stand_down', 'on_hold', 'out', 'on_call']);
const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};
const ALLOWED_CREW_FIELDS = new Set([
  'clientId',
  'agentId',
  'name',
  'role',
  'model',
  'bio',
  'avatarUrl',
  'photoUrl',
  'imageUrl',
  'avatar',
  'status',
  'statusNote',
  'connectorAlert',
  'dailyCounts',
  'usagePct',
  'resetNote',
]);

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
  const crew = (await opsQueryByClient<CrewMember>('ops_crew', clientId)).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return NextResponse.json(
    { clientId, count: crew.length, crew },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

async function handleCrewUpdate(request: Request) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  let body: {
    clientId?: string;
    agentId?: string;
    name?: string;
    role?: string;
    model?: string;
    bio?: string;
    avatarUrl?: string;
    photoUrl?: string;
    imageUrl?: string;
    avatar?: string;
    status?: AgentStatus;
    statusNote?: string;
    connectorAlert?: unknown;
    dailyCounts?: Record<string, unknown> | null;
    usagePct?: number | null;
    resetNote?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const unknown = findUnknownFields(body as Record<string, unknown>, ALLOWED_CREW_FIELDS);
  if (unknown.length > 0) {
    return NextResponse.json(
      {
        error: `Unknown field(s): ${unknown.join(', ')}`,
        unknownFields: unknown,
        allowedFields: Array.from(ALLOWED_CREW_FIELDS),
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const clientId = resolveBotTargetClientId(actor, body.clientId);
  if (!clientId) return forbiddenResponse('Bot token is not scoped to requested clientId.');
  if (actor.user && !(await canUserAccessClient(actor.user, clientId))) {
    return forbiddenResponse();
  }

  await ensureOpsSeeded();
  const agentId = inferAgentId(body.agentId || actor.actorName);
  const callerAgentId = inferAgentId(actor.actorName);
  const docId = `${clientId}__${agentId}`;
  const existing = await opsGetDoc<CrewMember>('ops_crew', docId);
  if (!existing) {
    return NextResponse.json(
      { error: `Crew member ${agentId} not found for ${clientId}` },
      { status: 404, headers: NO_STORE_HEADERS }
    );
  }

  const rawAvatarInput =
    body.avatarUrl !== undefined
      ? body.avatarUrl
      : body.photoUrl !== undefined
        ? body.photoUrl
        : body.imageUrl !== undefined
          ? body.imageUrl
          : body.avatar;

  const editsProfileFields =
    body.name !== undefined ||
    body.role !== undefined ||
    body.model !== undefined ||
    body.bio !== undefined ||
    rawAvatarInput !== undefined;

  const canEditProfile =
    Boolean(actor.user) || callerAgentId === agentId || callerAgentId === 'marley';

  if (editsProfileFields && !canEditProfile) {
    return NextResponse.json(
      { error: 'Bots can only edit their own profile fields (name, role, model, bio, avatarUrl).' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const nextStatus = VALID_STATUSES.has(body.status as AgentStatus)
    ? (body.status as AgentStatus)
    : existing.status;

  let nextAvatarUrl = existing.avatarUrl;
  if (rawAvatarInput !== undefined) {
    if (typeof rawAvatarInput === 'string' && !rawAvatarInput.trim()) {
      nextAvatarUrl = undefined;
    } else {
      const sanitized = sanitizeAvatarUrl(rawAvatarInput);
      if (!sanitized) {
        return NextResponse.json(
          { error: 'Invalid avatarUrl: provide an http(s) URL or a raster base64 data URI (<= 64 KB).' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      nextAvatarUrl = sanitized;
    }
  }

  const now = new Date().toISOString();
  let nextConnectorAlert = existing.connectorAlert;
  if (body.connectorAlert !== undefined) {
    const alertCheck = parseConnectorAlert(body.connectorAlert, now);
    if (!alertCheck.ok) {
      return NextResponse.json({ error: alertCheck.error }, { status: 400, headers: NO_STORE_HEADERS });
    }
    nextConnectorAlert = alertCheck.value;
  }

  let nextDailyCounts = existing.dailyCounts;
  if (body.dailyCounts !== undefined) {
    const countsCheck = parseDailyCountsPatch(body.dailyCounts, existing.dailyCounts, now);
    if (!countsCheck.ok) {
      return NextResponse.json({ error: countsCheck.error }, { status: 400, headers: NO_STORE_HEADERS });
    }
    nextDailyCounts = countsCheck.value;
  }

  const updated: CrewMember = {
    ...existing,
    name:
      typeof body.name === 'string' && body.name.trim()
        ? body.name.trim().slice(0, 60)
        : existing.name,
    role:
      typeof body.role === 'string' && body.role.trim()
        ? body.role.trim().slice(0, 100)
        : existing.role,
    model:
      typeof body.model === 'string' && body.model.trim()
        ? body.model.trim().slice(0, 60)
        : existing.model,
    bio:
      typeof body.bio === 'string'
        ? body.bio.trim().slice(0, 160) || undefined
        : existing.bio,
    avatarUrl: nextAvatarUrl,
    status: nextStatus,
    statusNote:
      typeof body.statusNote === 'string'
        ? body.statusNote.trim().slice(0, 180) || undefined
        : existing.statusNote,
    connectorAlert: nextConnectorAlert,
    dailyCounts: nextDailyCounts,
    usagePct:
      body.usagePct === null
        ? undefined
        : typeof body.usagePct === 'number' && Number.isFinite(body.usagePct)
          ? Math.max(0, Math.min(100, Math.round(body.usagePct)))
          : existing.usagePct,
    resetNote:
      typeof body.resetNote === 'string'
        ? body.resetNote.trim().slice(0, 80) || undefined
        : existing.resetNote,
    updatedAt: now,
    updatedBy: actor.actorName,
  };

  await opsSetDoc('ops_crew', docId, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(
    clientId,
    actor.actorName,
    body.connectorAlert !== undefined
      ? updated.connectorAlert
        ? `connector alert (${updated.connectorAlert.platform || 'connector'}) -> ${updated.connectorAlert.status}`
        : 'cleared connector alert'
      : editsProfileFields
        ? `updated profile -> ${updated.name}`
        : `updated status -> ${updated.status}`,
    updated.connectorAlert?.message || updated.statusNote || updated.bio || updated.name
  );

  return NextResponse.json({ ok: true, crew: updated }, { status: 200, headers: NO_STORE_HEADERS });
}

export const POST = handleCrewUpdate;
export const PATCH = handleCrewUpdate;
export const PUT = handleCrewUpdate;
