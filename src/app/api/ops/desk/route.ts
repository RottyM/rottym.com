import { NextResponse } from 'next/server';
import {
  buildBoundarySystemPrompt,
  getAvailableAiModels,
  runDeskModel,
  type AiProviderId,
} from '@/lib/ops/ai-desk';
import {
  authorizeOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import { laneToChannel, normalizeLane } from '@/lib/ops/drop-parser';
import {
  appendOpsActivity,
  ensureOpsSeeded,
  opsGetDoc,
  opsSetDoc,
} from '@/lib/ops/firestore-rest';
import type { ClientWorkspace, PipelineCard } from '@/lib/ops/types';

export async function GET(request: Request) {
  const user = await authorizeOpsUser(request);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const clientId = (searchParams.get('clientId') || 'rottym').trim().toLowerCase();
  if (!(await canUserAccessClient(user, clientId))) {
    return forbiddenResponse();
  }

  await ensureOpsSeeded();
  return NextResponse.json(
    {
      clientId,
      models: getAvailableAiModels(),
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: Request) {
  const user = await authorizeOpsUser(request);
  if (!user) return unauthorizedResponse();

  await ensureOpsSeeded();

  let body: {
    clientId?: string;
    provider?: AiProviderId;
    lane?: string;
    prompt?: string;
    sourceUrl?: string;
    title?: string;
    saveToBoard?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const clientId = (body.clientId || 'rottym').trim().toLowerCase();
  if (!(await canUserAccessClient(user, clientId))) {
    return forbiddenResponse();
  }

  const lane = normalizeLane(body.lane);
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const client = await opsGetDoc<ClientWorkspace>('ops_clients', clientId);
  const systemPrompt = buildBoundarySystemPrompt({
    lane,
    clientName: client?.name || clientId,
  });

  const userPrompt = [
    body.sourceUrl ? `Verified Source URL: ${body.sourceUrl.trim()}` : '',
    `Task:\n${prompt}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const provider: AiProviderId = body.provider || 'gemini';
  let result: { output: string; modelUsed: string };
  try {
    result = await runDeskModel({ provider, systemPrompt, userPrompt });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Model execution failed' },
      { status: 502 }
    );
  }

  let savedCard: PipelineCard | null = null;
  if (body.saveToBoard) {
    const now = new Date().toISOString();
    const cleanTitle = (
      typeof body.title === 'string' && body.title.trim()
        ? body.title.trim()
        : prompt.split('\n')[0] || 'AI Desk Draft'
    ).slice(0, 120);

    let validUrl: string | undefined;
    if (typeof body.sourceUrl === 'string' && body.sourceUrl.trim()) {
      try {
        const u = new URL(body.sourceUrl.trim());
        if (u.protocol === 'https:' || u.protocol === 'http:') validUrl = u.toString().slice(0, 400);
      } catch {
        validUrl = undefined;
      }
    }

    savedCard = {
      id: `${clientId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      clientId,
      title: cleanTitle,
      lane,
      channel: laneToChannel(lane),
      contentType: lane === 'article' ? 'article' : 'post',
      stage: 'pulled',
      agentId:
        provider === 'grok'
          ? 'sovereign'
          : provider === 'claude'
            ? 'cheat-code'
            : provider === 'llama'
              ? 'marley'
              : 'gemini-watch',
      source: `AI Desk · ${result.modelUsed}`,
      sourceUrl: validUrl,
      draftCopy: result.output.slice(0, 2400),
      flaggedNotes: validUrl
        ? undefined
        : ['FLAG: Missing verified source URL — required before clearance.'],
      marleyStatus: 'pending',
      readyForRotty: false,
      jobDate: now.slice(0, 10),
      createdAt: now,
      updatedAt: now,
    };
    await opsSetDoc('ops_pipeline', savedCard.id, savedCard as unknown as Record<string, unknown>);
  }

  await appendOpsActivity(
    clientId,
    user.name,
    `ran AI Desk (${lane} · ${result.modelUsed})`,
    savedCard ? savedCard.title : prompt.slice(0, 80)
  );

  return NextResponse.json(
    {
      ok: true,
      modelUsed: result.modelUsed,
      output: result.output,
      savedCard,
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
