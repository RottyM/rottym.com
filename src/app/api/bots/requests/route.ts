import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  canonicalCrewDisplayName,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import {
  FIELD_MAX_LENGTHS,
  findUnknownFields,
  getEffectiveRequestStatus,
  inferAgentId,
  normalizeAssignedTo,
  normalizeRelevantUntil,
  normalizeRequestActions,
  normalizeRequestUrgency,
  sanitizeWebOrBlobUrl,
} from '@/lib/ops/drop-parser';
import {
  appendOpsActivity,
  ensureOpsSeeded,
  opsGetDoc,
  opsQueryByClient,
  opsSetDoc,
} from '@/lib/ops/firestore-rest';
import type { OpsRequest, PipelineCard, RequestStatus } from '@/lib/ops/types';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

const ALLOWED_REQUEST_WRAPPER_FIELDS = new Set(['clientId', 'requests']);

const ALLOWED_REQUEST_ITEM_FIELDS = new Set([
  'id',
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
  'jobId',
  'raisedBy',
  'relevantUntil',
  'expiresAt',
  'urgency',
  'actions',
]);

function sanitizeUrl(raw: unknown): string | undefined {
  const checked = sanitizeWebOrBlobUrl(raw, FIELD_MAX_LENGTHS.assetUrl);
  return checked.ok ? checked.value : undefined;
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
  const statusParam = (searchParams.get('status') || '').trim().toLowerCase();
  const includeExpired = searchParams.get('includeExpired') === 'true';
  const mineParam = searchParams.get('mine') === 'true';
  const rawRaisedBy = searchParams.get('raisedBy')?.trim() || '';

  let raisedByFilter: string | undefined;
  if (mineParam || rawRaisedBy.toLowerCase() === 'me') {
    if (!actor.user && actor.actorName.toLowerCase() === 'bot') {
      return NextResponse.json(
        { error: 'raisedBy=me requires a per-bot token or X-Bot-Name header.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    raisedByFilter = normalizeAssignedTo(actor.user ? actor.user.name : actor.actorName);
  } else if (rawRaisedBy) {
    raisedByFilter = normalizeAssignedTo(rawRaisedBy);
  }

  const all = await opsQueryByClient<OpsRequest>('ops_requests', clientId);
  const nowMs = Date.now();

  const requests = all
    .map((req) => ({
      ...req,
      status: getEffectiveRequestStatus(req, nowMs) as RequestStatus,
      autoExecuteAllowed: false as const,
    }))
    .filter((req) => {
      if (raisedByFilter && normalizeAssignedTo(req.raisedBy) !== raisedByFilter) return false;
      if (statusParam === 'open') {
        return req.status === 'pending' || req.status === 'decided';
      }
      if (statusParam === 'closed') {
        return req.status === 'done' || req.status === 'dismissed' || req.status === 'expired';
      }
      if (statusParam && statusParam !== 'all') {
        return req.status === statusParam;
      }
      if (!includeExpired && !statusParam && req.status === 'expired') {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const rank = (r: OpsRequest) =>
        r.urgency === 'urgent' ? 0 : r.urgency === 'high' ? 1 : 2;
      const rDiff = rank(a) - rank(b);
      if (rDiff !== 0) return rDiff;
      return (b.updatedAt || b.raisedAt || '').localeCompare(a.updatedAt || a.raisedAt || '');
    });

  return NextResponse.json(
    { clientId, count: requests.length, requests },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

export async function POST(request: Request) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const clientId = resolveBotTargetClientId(
    actor,
    typeof body.clientId === 'string' ? body.clientId : null
  );
  if (!clientId) return forbiddenResponse('Bot token is not scoped to requested clientId.');
  if (actor.user && !(await canUserAccessClient(actor.user, clientId))) {
    return forbiddenResponse();
  }

  if (Array.isArray(body.requests)) {
    const wrapperUnknown = findUnknownFields(body, ALLOWED_REQUEST_WRAPPER_FIELDS);
    if (wrapperUnknown.length > 0) {
      return NextResponse.json(
        {
          error: `Unknown wrapper field(s): ${wrapperUnknown.join(', ')}`,
          unknownFields: wrapperUnknown,
          allowedFields: Array.from(ALLOWED_REQUEST_WRAPPER_FIELDS),
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
  }

  const inputs = Array.isArray(body.requests)
    ? (body.requests as Array<Record<string, unknown>>)
    : [body];
  if (inputs.length === 0 || inputs.length > 25) {
    return NextResponse.json(
      { error: 'Provide 1 to 25 request items' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  for (const item of inputs) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return NextResponse.json(
        { error: 'Each request item must be a JSON object' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const unknown = findUnknownFields(item, ALLOWED_REQUEST_ITEM_FIELDS);
    if (unknown.length > 0) {
      return NextResponse.json(
        {
          error: `Unknown field(s): ${unknown.join(', ')}${unknown.includes('decision') || unknown.includes('status') ? ' (decisions are operator-only)' : ''}`,
          unknownFields: unknown,
          allowedFields: Array.from(ALLOWED_REQUEST_ITEM_FIELDS),
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
  }

  await ensureOpsSeeded();
  const now = new Date().toISOString();
  const created: OpsRequest[] = [];
  const updated: OpsRequest[] = [];

  for (const item of inputs) {
    const title = typeof item.title === 'string' ? item.title.trim().slice(0, 120) : '';
    if (!title) {
      return NextResponse.json(
        { error: 'title is required on every request' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const rawContext =
      typeof item.context === 'string'
        ? item.context
        : typeof item.reason === 'string'
          ? item.reason
          : typeof item.why === 'string'
            ? item.why
            : '';
    const context = rawContext.trim().slice(0, 240);
    if (!context) {
      return NextResponse.json(
        { error: 'context (one-line reason why it needs Rotty) is required on every request' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const actions = normalizeRequestActions(item.actions);
    if (actions.length === 0) {
      return NextResponse.json(
        {
          error:
            'actions must include at least 1 custom labeled action (e.g. ["Send decline", "Archive it"]).',
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const rawRelevantUntil = item.relevantUntil !== undefined ? item.relevantUntil : item.expiresAt;
    const relevantUntil =
      rawRelevantUntil !== undefined ? normalizeRelevantUntil(rawRelevantUntil) : undefined;
    if (typeof rawRelevantUntil === 'string' && rawRelevantUntil.trim() && !relevantUntil) {
      return NextResponse.json(
        { error: 'Invalid relevantUntil format. Expected YYYY-MM-DD or ISO-8601 timestamp.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const urgency = normalizeRequestUrgency(item.urgency) || 'normal';
    const preparedText =
      typeof item.preparedText === 'string'
        ? item.preparedText.trim().slice(0, 2400) || undefined
        : typeof item.draftText === 'string'
          ? item.draftText.trim().slice(0, 2400) || undefined
          : undefined;
    const preparedUrl = sanitizeUrl(
      item.preparedUrl ?? item.link ?? item.imageUrl ?? item.assetUrl ?? item.slideUrl ?? item.mediaUrl ?? item.url
    );
    const preparedFile =
      typeof item.preparedFile === 'string'
        ? item.preparedFile.trim().slice(0, 180) || undefined
        : typeof item.assetFile === 'string'
          ? item.assetFile.trim().slice(0, 180) || undefined
          : typeof item.file === 'string'
            ? item.file.trim().slice(0, 180) || undefined
            : undefined;

    const jobId =
      typeof item.jobId === 'string' && item.jobId.trim() ? item.jobId.trim().slice(0, 120) : undefined;
    let jobTitle: string | undefined;
    if (jobId) {
      const linkedJob = await opsGetDoc<PipelineCard>('ops_pipeline', jobId);
      if (linkedJob && linkedJob.clientId === clientId) {
        jobTitle = linkedJob.title;
      }
    }

    const explicitId = typeof item.id === 'string' ? item.id.trim().slice(0, 120) : '';
    const existing = explicitId ? await opsGetDoc<OpsRequest>('ops_requests', explicitId) : null;
    if (existing && existing.clientId !== clientId) {
      return forbiddenResponse();
    }

    if (existing) {
      if (existing.status !== 'pending') {
        return NextResponse.json(
          { error: `Request '${existing.id}' is already ${existing.status} and cannot be overwritten.` },
          { status: 409, headers: NO_STORE_HEADERS }
        );
      }
      const nextReq: OpsRequest = {
        ...existing,
        title,
        context,
        preparedText: preparedText !== undefined ? preparedText : existing.preparedText,
        preparedUrl: preparedUrl !== undefined ? preparedUrl : existing.preparedUrl,
        preparedFile: preparedFile !== undefined ? preparedFile : existing.preparedFile,
        jobId: jobId ?? existing.jobId,
        jobTitle: jobTitle ?? existing.jobTitle,
        relevantUntil: relevantUntil !== undefined ? relevantUntil : existing.relevantUntil,
        urgency,
        actions,
        updatedAt: now,
      };
      await opsSetDoc('ops_requests', nextReq.id, nextReq as unknown as Record<string, unknown>);
      updated.push(nextReq);
      continue;
    }

    const rawRaisedByName =
      typeof item.raisedBy === 'string' && item.raisedBy.trim()
        ? item.raisedBy.trim().slice(0, 40)
        : actor.actorName;
    const raisedByName = canonicalCrewDisplayName(rawRaisedByName) || rawRaisedByName;
    const raisedBy = inferAgentId(raisedByName);

    const reqDoc: OpsRequest = {
      id: explicitId || `req-${clientId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      clientId,
      title,
      context,
      preparedText,
      preparedUrl,
      preparedFile,
      jobId,
      jobTitle,
      raisedBy,
      raisedByName,
      raisedAt: now,
      relevantUntil,
      urgency,
      actions,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    await opsSetDoc('ops_requests', reqDoc.id, reqDoc as unknown as Record<string, unknown>);
    created.push(reqDoc);
  }

  const allSaved = [...created, ...updated];
  await appendOpsActivity(
    clientId,
    actor.actorName,
    created.length > 0
      ? `raised ${created.length} request${created.length === 1 ? '' : 's'}`
      : `updated ${updated.length} request${updated.length === 1 ? '' : 's'}`,
    allSaved.map((r) => r.title).slice(0, 2).join(', ')
  );

  const safeResults = allSaved.map((r) => ({ ...r, autoExecuteAllowed: false as const }));
  if (safeResults.length === 1) {
    const wasUpdated = updated.length === 1;
    return NextResponse.json(
      { ok: true, request: safeResults[0] },
      { status: wasUpdated ? 200 : 201, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      count: safeResults.length,
      createdCount: created.length,
      updatedCount: updated.length,
      requests: safeResults,
    },
    { status: created.length > 0 ? 201 : 200, headers: NO_STORE_HEADERS }
  );
}
