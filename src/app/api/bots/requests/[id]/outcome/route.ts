import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { findUnknownFields } from '@/lib/ops/drop-parser';
import { appendOpsActivity, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { OpsRequest } from '@/lib/ops/types';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

const ALLOWED_OUTCOME_FIELDS = new Set([
  'clientId',
  'status',
  'outcomeNote',
  'note',
  'outcomeUrl',
  'liveUrl',
  'externalPostUrl',
  'completedBy',
]);

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
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const unknown = findUnknownFields(body, ALLOWED_OUTCOME_FIELDS);
  if (unknown.length > 0) {
    return NextResponse.json(
      {
        error: `Unknown field(s): ${unknown.join(', ')}`,
        unknownFields: unknown,
        allowedFields: Array.from(ALLOWED_OUTCOME_FIELDS),
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

  if (existing.status !== 'decided') {
    return NextResponse.json(
      {
        error:
          existing.status === 'pending'
            ? 'Cannot file outcome before Rotty has decided this request.'
            : `Request is already ${existing.status}.`,
      },
      { status: 409, headers: NO_STORE_HEADERS }
    );
  }

  const rawNote =
    typeof body.outcomeNote === 'string'
      ? body.outcomeNote
      : typeof body.note === 'string'
        ? body.note
        : '';
  const outcomeNote = rawNote.trim().slice(0, 600);
  if (!outcomeNote) {
    return NextResponse.json(
      { error: 'outcomeNote (sent confirmation / done note) is required.' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const outcomeUrl = sanitizeUrl(body.outcomeUrl ?? body.liveUrl ?? body.externalPostUrl);
  const reportedStatus = body.status === 'failed' ? 'failed' : 'done';
  const completedBy =
    typeof body.completedBy === 'string' && body.completedBy.trim()
      ? body.completedBy.trim().slice(0, 40)
      : actor.actorName;
  const now = new Date().toISOString();

  const updated: OpsRequest = {
    ...existing,
    status: reportedStatus === 'failed' ? 'decided' : 'done',
    outcomeNote:
      reportedStatus === 'failed' ? `Execution failed (${completedBy}): ${outcomeNote}` : outcomeNote,
    outcomeUrl: outcomeUrl || existing.outcomeUrl,
    completedBy: reportedStatus === 'failed' ? existing.completedBy : completedBy,
    completedAt: reportedStatus === 'failed' ? existing.completedAt : now,
    updatedAt: now,
  };

  await opsSetDoc('ops_requests', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(
    existing.clientId,
    completedBy,
    reportedStatus === 'failed'
      ? `reported request failure (${existing.decisionLabel || existing.decision})`
      : `completed request (${existing.decisionLabel || existing.decision})`,
    updated.title
  );

  return NextResponse.json(
    { ok: true, request: { ...updated, autoExecuteAllowed: false } },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
