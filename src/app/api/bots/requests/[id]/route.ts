import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import {
  FIELD_MAX_LENGTHS,
  findUnknownFields,
  getEffectiveRequestStatus,
  inferAgentId,
  normalizeRelevantUntil,
  normalizeRequestActions,
  normalizeRequestUrgency,
  sanitizeWebOrBlobUrl,
} from '@/lib/ops/drop-parser';
import { appendOpsActivity, opsDeleteDoc, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { OpsRequest } from '@/lib/ops/types';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

const ALLOWED_REQUEST_PATCH_FIELDS = new Set([
  'clientId',
  'title',
  'context',
  'reason',
  'why',
  'preparedText',
  'draftText',
  'preparedUrl',
  'link',
  'url',
  'imageUrl',
  'assetUrl',
  'mediaUrl',
  'slideUrl',
  'preparedFile',
  'file',
  'assetFile',
  'relevantUntil',
  'expiresAt',
  'urgency',
  'actions',
]);

function sanitizeUrl(raw: unknown): string | undefined {
  const checked = sanitizeWebOrBlobUrl(raw, FIELD_MAX_LENGTHS.assetUrl);
  return checked.ok ? checked.value : undefined;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  const { id } = await context.params;
  const existing = await opsGetDoc<OpsRequest>('ops_requests', id);
  if (!existing) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404, headers: NO_STORE_HEADERS });
  }

  const scopedClientId = resolveBotTargetClientId(actor, existing.clientId);
  if (!scopedClientId || scopedClientId !== existing.clientId) return forbiddenResponse();
  if (actor.user && !(await canUserAccessClient(actor.user, existing.clientId))) {
    return forbiddenResponse();
  }

  return NextResponse.json(
    {
      ok: true,
      request: {
        ...existing,
        status: getEffectiveRequestStatus(existing),
        autoExecuteAllowed: false,
      },
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

async function handleUpdateRequest(
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
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const unknown = findUnknownFields(body, ALLOWED_REQUEST_PATCH_FIELDS);
  if (unknown.length > 0) {
    return NextResponse.json(
      {
        error: `Unknown field(s): ${unknown.join(', ')}`,
        unknownFields: unknown,
        allowedFields: Array.from(ALLOWED_REQUEST_PATCH_FIELDS),
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const existing = await opsGetDoc<OpsRequest>('ops_requests', id);
  if (!existing) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404, headers: NO_STORE_HEADERS });
  }

  const scopedClientId = resolveBotTargetClientId(
    actor,
    typeof body.clientId === 'string' ? body.clientId : existing.clientId
  );
  if (!scopedClientId || scopedClientId !== existing.clientId) return forbiddenResponse();
  if (actor.user && !(await canUserAccessClient(actor.user, existing.clientId))) {
    return forbiddenResponse();
  }

  if (existing.status !== 'pending') {
    return NextResponse.json(
      { error: `Request is already ${existing.status}; use POST /outcome to report execution results.` },
      { status: 409, headers: NO_STORE_HEADERS }
    );
  }

  const rawRelevantUntil = body.relevantUntil !== undefined ? body.relevantUntil : body.expiresAt;
  const nextRelevantUntil =
    rawRelevantUntil === null || rawRelevantUntil === ''
      ? undefined
      : rawRelevantUntil !== undefined
        ? normalizeRelevantUntil(rawRelevantUntil)
        : existing.relevantUntil;
  if (typeof rawRelevantUntil === 'string' && rawRelevantUntil.trim() && !nextRelevantUntil) {
    return NextResponse.json(
      { error: 'Invalid relevantUntil format. Expected YYYY-MM-DD or ISO-8601 timestamp.' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const nextActions =
    body.actions !== undefined ? normalizeRequestActions(body.actions) : existing.actions;
  if (body.actions !== undefined && nextActions.length === 0) {
    return NextResponse.json(
      { error: 'actions must include at least 1 custom labeled action.' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const rawContext =
    typeof body.context === 'string'
      ? body.context
      : typeof body.reason === 'string'
        ? body.reason
        : typeof body.why === 'string'
          ? body.why
          : undefined;

  const updated: OpsRequest = {
    ...existing,
    title:
      typeof body.title === 'string' && body.title.trim()
        ? body.title.trim().slice(0, 120)
        : existing.title,
    context:
      rawContext !== undefined && rawContext.trim()
        ? rawContext.trim().slice(0, 240)
        : existing.context,
    preparedText:
      body.preparedText !== undefined || body.draftText !== undefined
        ? String(body.preparedText ?? body.draftText ?? '').trim().slice(0, 2400) || undefined
        : existing.preparedText,
    preparedUrl:
      body.preparedUrl !== undefined ||
      body.link !== undefined ||
      body.imageUrl !== undefined ||
      body.assetUrl !== undefined ||
      body.slideUrl !== undefined ||
      body.mediaUrl !== undefined ||
      body.url !== undefined
        ? sanitizeUrl(
            body.preparedUrl ??
              body.link ??
              body.imageUrl ??
              body.assetUrl ??
              body.slideUrl ??
              body.mediaUrl ??
              body.url
          )
        : existing.preparedUrl,
    preparedFile:
      body.preparedFile !== undefined || body.assetFile !== undefined || body.file !== undefined
        ? String(body.preparedFile ?? body.assetFile ?? body.file ?? '').trim().slice(0, 180) || undefined
        : existing.preparedFile,
    relevantUntil: nextRelevantUntil,
    urgency:
      body.urgency !== undefined
        ? normalizeRequestUrgency(body.urgency) || existing.urgency
        : existing.urgency,
    actions: nextActions,
    updatedAt: new Date().toISOString(),
  };

  await opsSetDoc('ops_requests', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(existing.clientId, actor.actorName, 'updated request', updated.title);

  return NextResponse.json(
    { ok: true, request: { ...updated, autoExecuteAllowed: false } },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

export const PATCH = handleUpdateRequest;
export const PUT = handleUpdateRequest;

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  const { id } = await context.params;
  const existing = await opsGetDoc<OpsRequest>('ops_requests', id);
  if (!existing) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404, headers: NO_STORE_HEADERS });
  }

  const scopedClientId = resolveBotTargetClientId(actor, existing.clientId);
  if (!scopedClientId || scopedClientId !== existing.clientId) return forbiddenResponse();
  if (actor.user && !(await canUserAccessClient(actor.user, existing.clientId))) {
    return forbiddenResponse();
  }

  const callerId = inferAgentId(actor.actorName);
  if (!actor.user && callerId !== existing.raisedBy) {
    return NextResponse.json(
      { error: 'Only the raising bot or an operator can delete this request.' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }
  if (!actor.user && existing.status !== 'pending') {
    return NextResponse.json(
      { error: 'Only pending requests can be deleted by bots.' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  await opsDeleteDoc('ops_requests', id);
  await appendOpsActivity(existing.clientId, actor.actorName, 'deleted request', existing.title);

  return NextResponse.json({ ok: true, deletedId: id }, { status: 200, headers: NO_STORE_HEADERS });
}
