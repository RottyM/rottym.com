import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { extractChatMentions, inferAgentId } from '@/lib/ops/drop-parser';
import {
  ensureOpsSeeded,
  opsDeleteDoc,
  opsGetDoc,
  opsQueryByClient,
  opsSetDoc,
} from '@/lib/ops/firestore-rest';
import type { ChatMessage, PipelineCard } from '@/lib/ops/types';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

function normalizeMentionKey(raw: string): string {
  const clean = raw.toLowerCase().replace(/[^a-z0-9_-]+/g, '').trim();
  if (clean === 'cheatcode' || clean === 'cheatcodes') return 'cheat-code';
  return clean;
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
  const since = searchParams.get('since')?.trim() || '';
  const mention = searchParams.get('mention')?.trim() || '';
  const jobId = searchParams.get('jobId')?.trim() || '';
  const rawLimit = Number(searchParams.get('limit') || '50');
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(100, Math.round(rawLimit))) : 50;

  const all = await opsQueryByClient<ChatMessage>('ops_chat', clientId);
  const mentionKey = mention ? normalizeMentionKey(mention) : '';

  const filtered = all
    .filter((msg) => {
      if (since && msg.createdAt <= since) return false;
      if (jobId && msg.jobId !== jobId) return false;
      if (mentionKey) {
        const msgMentions = msg.mentions || [];
        if (!msgMentions.includes(mentionKey) && !msgMentions.includes('all')) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

  const messages = filtered.slice(-limit);

  return NextResponse.json(
    { clientId, count: messages.length, messages },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

export async function POST(request: Request) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  let body: {
    clientId?: string;
    text?: string;
    message?: string;
    to?: string | string[];
    mentions?: string | string[];
    jobId?: string;
    replyToId?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const clientId = resolveBotTargetClientId(actor, body.clientId);
  if (!clientId) return forbiddenResponse('Bot token is not scoped to requested clientId.');
  if (actor.user && !(await canUserAccessClient(actor.user, clientId))) {
    return forbiddenResponse();
  }

  const rawText = typeof body.text === 'string' ? body.text : typeof body.message === 'string' ? body.message : '';
  const text = rawText.trim().slice(0, 1200);
  if (!text) {
    return NextResponse.json({ error: 'text is required' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  await ensureOpsSeeded();

  const jobId = typeof body.jobId === 'string' && body.jobId.trim() ? body.jobId.trim().slice(0, 120) : undefined;
  let jobTitle: string | undefined;
  if (jobId) {
    const job = await opsGetDoc<PipelineCard>('ops_pipeline', jobId);
    if (job && job.clientId === clientId) {
      jobTitle = job.title;
    }
  }

  const senderId = actor.user ? 'rotty' : inferAgentId(actor.actorName);
  const mentions = extractChatMentions(text, body.to ?? body.mentions);
  const replyToId =
    typeof body.replyToId === 'string' && body.replyToId.trim()
      ? body.replyToId.trim().slice(0, 120)
      : undefined;

  const entry: ChatMessage = {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    clientId,
    senderId,
    senderName: actor.user ? 'Rotty' : actor.actorName,
    senderKind: actor.user ? 'operator' : 'bot',
    text,
    mentions,
    jobId,
    jobTitle,
    replyToId,
    createdAt: new Date().toISOString(),
  };

  await opsSetDoc('ops_chat', entry.id, entry as unknown as Record<string, unknown>);

  return NextResponse.json({ ok: true, message: entry }, { status: 201, headers: NO_STORE_HEADERS });
}

export async function DELETE(request: Request) {
  const actor = await authorizeBotOrOpsUser(request, 'Bot');
  if (!actor) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  let id = searchParams.get('id')?.trim() || '';
  if (!id) {
    try {
      const body = (await request.json()) as { id?: string };
      id = typeof body.id === 'string' ? body.id.trim() : '';
    } catch {
      id = '';
    }
  }
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const existing = await opsGetDoc<ChatMessage>('ops_chat', id);
  if (!existing) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404, headers: NO_STORE_HEADERS });
  }

  const scopedClientId = resolveBotTargetClientId(actor, existing.clientId);
  if (!scopedClientId || scopedClientId !== existing.clientId) return forbiddenResponse();
  if (actor.user && !(await canUserAccessClient(actor.user, existing.clientId))) {
    return forbiddenResponse();
  }

  const callerId = actor.user ? 'rotty' : inferAgentId(actor.actorName);
  if (!actor.user && existing.senderId !== callerId) {
    return NextResponse.json(
      { error: 'Only the sender or an operator can delete this chat message.' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  await opsDeleteDoc('ops_chat', id);
  return NextResponse.json({ ok: true, deletedId: id }, { status: 200, headers: NO_STORE_HEADERS });
}
