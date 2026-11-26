import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import {
  inferAgentId,
  isClearanceFilename,
  parseBatchClearanceMarkdown,
  parseDropMarkdown,
  resolveEffectivePhotoStatus,
} from '@/lib/ops/drop-parser';
import {
  appendOpsActivity,
  ensureOpsSeeded,
  opsQueryByClient,
  opsSetDoc,
} from '@/lib/ops/firestore-rest';
import type { PipelineCard } from '@/lib/ops/types';

export async function POST(request: Request) {
  const actor = await authorizeBotOrOpsUser(request, 'Drive Bridge');
  if (!actor) return unauthorizedResponse();

  let body: {
    clientId?: string;
    filename?: string;
    content?: string;
    jobDate?: string;
    assetFile?: string;
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

  const filename = typeof body.filename === 'string' && body.filename.trim() ? body.filename.trim() : '';
  const content = typeof body.content === 'string' ? body.content : '';
  if (!filename || !content.trim()) {
    return NextResponse.json({ error: 'filename and content are required' }, { status: 400 });
  }

  await ensureOpsSeeded();
  const now = new Date().toISOString();
  const existingCards = await opsQueryByClient<PipelineCard>('ops_pipeline', clientId);

  if (isClearanceFilename(filename)) {
    const verdicts = parseBatchClearanceMarkdown(content, filename);
    let updatedCount = 0;
    let createdCount = 0;

    for (const v of verdicts) {
      const match = existingCards.find(
        (c) =>
          c.title.toLowerCase() === v.title.toLowerCase() ||
          c.title.toLowerCase().includes(v.title.toLowerCase()) ||
          v.title.toLowerCase().includes(c.title.toLowerCase())
      );

      if (match) {
        const nextCard: PipelineCard = {
          ...match,
          stage: v.verdict === 'approved' ? 'clearance' : v.verdict === 'rejected' ? 'pulled' : match.stage,
          marleyStatus: v.verdict,
          marleyNote: v.notes,
          discrepancies: v.discrepancies,
          artifactsNeeded: v.artifactsNeeded,
          sourceUrl: v.sourceUrl || match.sourceUrl,
          readyForRotty: false,
          updatedAt: now,
        };
        await opsSetDoc('ops_pipeline', match.id, nextCard as unknown as Record<string, unknown>);
        updatedCount++;
      } else {
        const card: PipelineCard = {
          id: `${clientId}-clr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          clientId,
          title: v.title,
          lane: v.lane,
          channel: v.channel,
          contentType: v.lane === 'article' ? 'article' : 'post',
          stage: v.verdict === 'approved' ? 'clearance' : 'pulled',
          agentId: inferAgentId(v.clearsFile || filename),
          source: v.clearsFile || filename,
          sourceUrl: v.sourceUrl,
          note: `${v.tag} · ${v.notes}`.slice(0, 300),
          draftCopy: v.notes,
          marleyStatus: v.verdict,
          marleyNote: v.notes,
          discrepancies: v.discrepancies,
          artifactsNeeded: v.artifactsNeeded,
          readyForRotty: false,
          jobDate: body.jobDate || now.slice(0, 10),
          sourceFile: `${body.jobDate || now.slice(0, 10)}/${filename}`,
          createdAt: now,
          updatedAt: now,
        };
        await opsSetDoc('ops_pipeline', card.id, card as unknown as Record<string, unknown>);
        createdCount++;
      }
    }

    await appendOpsActivity(
      clientId,
      actor.actorName,
      `ingested batch clearance (${updatedCount} updated, ${createdCount} new)`,
      filename
    );

    return NextResponse.json(
      { ok: true, kind: 'clearance', parsed: verdicts.length, updatedCount, createdCount },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const parsed = parseDropMarkdown(content, {
    filename,
    clientId,
    jobDate: body.jobDate,
  });

  const relSourceFile = `${parsed.jobDate}/${filename}`;
  const duplicate = existingCards.find(
    (c) =>
      (c.sourceFile && c.sourceFile.toLowerCase() === relSourceFile.toLowerCase()) ||
      c.title.toLowerCase() === parsed.title.toLowerCase()
  );

  const nextAssetFile = body.assetFile || parsed.assetFile || duplicate?.assetFile;
  const nextAssetSpec = parsed.assetSpec || duplicate?.assetSpec;
  const nextPhotoStatus = resolveEffectivePhotoStatus({
    existing: duplicate?.photoStatus,
    assetFile: nextAssetFile,
    assetUrl: duplicate?.assetUrl,
    assetSpec: nextAssetSpec,
  });

  const card: PipelineCard = duplicate
    ? {
        ...duplicate,
        lane: parsed.lane,
        channel: parsed.channel,
        sourceUrl: parsed.sourceUrl || duplicate.sourceUrl,
        draftCopy: parsed.draftCopy || duplicate.draftCopy,
        flaggedNotes: parsed.flaggedNotes.length > 0 ? parsed.flaggedNotes : duplicate.flaggedNotes,
        assetFile: nextAssetFile,
        assetSpec: nextAssetSpec,
        photoStatus: nextPhotoStatus,
        updatedAt: now,
      }
    : {
        id: `${clientId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        clientId: parsed.clientId,
        title: parsed.title,
        lane: parsed.lane,
        channel: parsed.channel,
        contentType: parsed.contentType,
        stage: parsed.stage === 'approved' || parsed.stage === 'posted' ? 'drafted' : parsed.stage,
        agentId: parsed.agentId,
        source: parsed.source,
        sourceUrl: parsed.sourceUrl,
        draftCopy: parsed.draftCopy,
        flaggedNotes: parsed.flaggedNotes.length > 0 ? parsed.flaggedNotes : undefined,
        marleyStatus: parsed.marleyStatus,
        readyForRotty: false,
        jobDate: parsed.jobDate,
        sourceFile: relSourceFile,
        assetFile: nextAssetFile,
        assetSpec: nextAssetSpec,
        photoStatus: nextPhotoStatus,
        createdAt: now,
        updatedAt: now,
      };

  await opsSetDoc('ops_pipeline', card.id, card as unknown as Record<string, unknown>);
  await appendOpsActivity(
    clientId,
    actor.actorName,
    duplicate ? 'updated drop' : 'ingested drop',
    card.title
  );

  return NextResponse.json(
    { ok: true, kind: 'drop', deduplicated: Boolean(duplicate), job: card },
    { status: duplicate ? 200 : 201, headers: { 'Cache-Control': 'no-store' } }
  );
}
