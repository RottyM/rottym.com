import { NextResponse } from 'next/server';
import {
  authorizeOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import {
  extractChatMentions,
  laneToChannel,
  normalizeLane,
  parseAdminPasteBlock,
  parseMultiItemDeskList,
  sanitizeAvatarUrl,
} from '@/lib/ops/drop-parser';
import {
  appendOpsActivity,
  ensureOpsSeeded,
  loadClientBoardSnapshot,
  opsDeleteDoc,
  opsGetDoc,
  opsQueryByClient,
  opsSetDoc,
} from '@/lib/ops/firestore-rest';
import type {
  AgentStatus,
  ChatMessage,
  ContentKind,
  CrewMember,
  CrewSet,
  EngineFamily,
  GateItem,
  GateState,
  MetricsSnapshot,
  PipelineCard,
  PipelineLane,
  PipelineLinks,
  PipelineStage,
} from '@/lib/ops/types';

const VALID_STAGES = new Set<PipelineStage>(['pulled', 'clearance', 'drafted', 'approved', 'posted', 'archived']);
const VALID_LANES = new Set<PipelineLane>(['linkedin', 'fb-ig', 'x', 'article']);
const VALID_AGENT_STATUSES = new Set<AgentStatus>(['active', 'stand_down', 'on_hold', 'out', 'on_call']);
const VALID_GATE_STATES = new Set<GateState>(['hold', 'blocked', 'awaiting', 'resolved']);
const VALID_CREW_SETS = new Set<CrewSet>(['original', 'new']);
const VALID_ENGINES = new Set<Exclude<EngineFamily, 'all'>>(['grok', 'llama', 'gemini', 'claude']);

function slugifyAgentId(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

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

export async function GET(request: Request) {
  const user = await authorizeOpsUser(request);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const clientId = (searchParams.get('clientId') || 'rottym').trim().toLowerCase();
  if (!(await canUserAccessClient(user, clientId))) {
    return forbiddenResponse();
  }

  const snapshot = await loadClientBoardSnapshot(clientId);
  return NextResponse.json(
    { clientId, ...snapshot },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: Request) {
  const user = await authorizeOpsUser(request);
  if (!user) return unauthorizedResponse();

  await ensureOpsSeeded();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const clientId =
    typeof body.clientId === 'string' && body.clientId.trim()
      ? body.clientId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
      : 'rottym';

  if (!(await canUserAccessClient(user, clientId))) {
    return forbiddenResponse();
  }

  const action = typeof body.action === 'string' ? body.action : '';
  const now = new Date().toISOString();

  if (action === 'update_crew') {
    const agentId = typeof body.agentId === 'string' ? body.agentId.trim().toLowerCase() : '';
    const docId = `${clientId}__${agentId}`;
    const existing = await opsGetDoc<CrewMember>('ops_crew', docId);
    if (!existing) {
      return NextResponse.json({ error: 'Crew member not found for this client' }, { status: 404 });
    }
    const nextStatus = VALID_AGENT_STATUSES.has(body.status as AgentStatus)
      ? (body.status as AgentStatus)
      : existing.status;
    const nextName =
      typeof body.name === 'string' && body.name.trim() ? body.name.trim().slice(0, 60) : existing.name;
    const nextRole =
      typeof body.role === 'string' && body.role.trim() ? body.role.trim().slice(0, 100) : existing.role;
    const nextModel =
      typeof body.model === 'string' && body.model.trim() ? body.model.trim().slice(0, 60) : existing.model;
    const nextEngine = VALID_ENGINES.has(body.engine as Exclude<EngineFamily, 'all'>)
      ? (body.engine as Exclude<EngineFamily, 'all'>)
      : existing.engine;
    const nextSet = VALID_CREW_SETS.has(body.set as CrewSet) ? (body.set as CrewSet) : existing.set;
    const nextAvatarUrl =
      body.avatarUrl !== undefined
        ? sanitizeAvatarUrl(body.avatarUrl)
        : existing.avatarUrl;
    const nextBio =
      typeof body.bio === 'string' ? body.bio.trim().slice(0, 160) || undefined : existing.bio;

    const updated: CrewMember = {
      ...existing,
      name: nextName,
      role: nextRole,
      model: nextModel,
      engine: nextEngine,
      set: nextSet,
      avatarUrl: nextAvatarUrl,
      bio: nextBio,
      status: nextStatus,
      statusNote:
        typeof body.statusNote === 'string'
          ? body.statusNote.trim().slice(0, 180) || undefined
          : existing.statusNote,
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
      updatedBy: user.name,
    };

    await opsSetDoc('ops_crew', docId, updated as unknown as Record<string, unknown>);
    await appendOpsActivity(
      clientId,
      user.name,
      `updated crew ${updated.name} -> ${updated.status}`,
      updated.statusNote || `${updated.model} (${updated.set} set)`
    );
    return NextResponse.json({ ok: true, crew: updated }, { status: 200 });
  }

  if (action === 'create_crew') {
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 60) : '';
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    const rawAgentId = typeof body.agentId === 'string' && body.agentId.trim() ? body.agentId : name;
    const agentId = slugifyAgentId(rawAgentId) || `crew-${Date.now().toString(36)}`;
    const docId = `${clientId}__${agentId}`;
    const existing = await opsGetDoc<CrewMember>('ops_crew', docId);
    if (existing) {
      return NextResponse.json(
        { error: `Crew member '${agentId}' already exists for this client` },
        { status: 409 }
      );
    }

    const member: CrewMember = {
      id: docId,
      clientId,
      agentId,
      name,
      set: VALID_CREW_SETS.has(body.set as CrewSet) ? (body.set as CrewSet) : 'new',
      model: typeof body.model === 'string' && body.model.trim() ? body.model.trim().slice(0, 60) : 'Grok',
      engine: VALID_ENGINES.has(body.engine as Exclude<EngineFamily, 'all'>)
        ? (body.engine as Exclude<EngineFamily, 'all'>)
        : 'grok',
      role:
        typeof body.role === 'string' && body.role.trim()
          ? body.role.trim().slice(0, 100)
          : 'Content agent',
      avatarUrl: sanitizeAvatarUrl(body.avatarUrl),
      bio: typeof body.bio === 'string' ? body.bio.trim().slice(0, 160) || undefined : undefined,
      status: VALID_AGENT_STATUSES.has(body.status as AgentStatus)
        ? (body.status as AgentStatus)
        : 'active',
      statusNote:
        typeof body.statusNote === 'string' ? body.statusNote.trim().slice(0, 180) || undefined : undefined,
      usagePct:
        typeof body.usagePct === 'number' && Number.isFinite(body.usagePct)
          ? Math.max(0, Math.min(100, Math.round(body.usagePct)))
          : undefined,
      resetNote:
        typeof body.resetNote === 'string' ? body.resetNote.trim().slice(0, 80) || undefined : undefined,
      updatedAt: now,
      updatedBy: user.name,
    };

    await opsSetDoc('ops_crew', docId, member as unknown as Record<string, unknown>);
    await appendOpsActivity(
      clientId,
      user.name,
      `added crew ${member.name}`,
      `${member.model} · ${member.set} set`
    );
    return NextResponse.json({ ok: true, crew: member }, { status: 201 });
  }

  if (action === 'delete_crew') {
    const agentId = typeof body.agentId === 'string' ? body.agentId.trim().toLowerCase() : '';
    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }
    const docId = `${clientId}__${agentId}`;
    const existing = await opsGetDoc<CrewMember>('ops_crew', docId);
    if (!existing) {
      return NextResponse.json({ error: 'Crew member not found for this client' }, { status: 404 });
    }
    await opsDeleteDoc('ops_crew', docId);
    await appendOpsActivity(clientId, user.name, `removed crew ${existing.name}`, existing.role);
    return NextResponse.json({ ok: true, deletedAgentId: agentId }, { status: 200 });
  }

  if (action === 'create_card') {
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : '';
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });
    const lane: PipelineLane = VALID_LANES.has(body.lane as PipelineLane) ? (body.lane as PipelineLane) : 'x';
    const stage: PipelineStage = VALID_STAGES.has(body.stage as PipelineStage) ? (body.stage as PipelineStage) : 'pulled';
    const contentType: ContentKind =
      body.contentType === 'article' || body.contentType === 'image' || body.contentType === 'pull'
        ? body.contentType
        : lane === 'article'
          ? 'article'
          : 'post';

    const card: PipelineCard = {
      id: `${clientId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      clientId,
      title,
      lane,
      channel: laneToChannel(lane),
      contentType,
      stage,
      agentId: (typeof body.agentId === 'string' && body.agentId.trim().slice(0, 40)) || 'marley',
      source: (typeof body.source === 'string' && body.source.trim().slice(0, 80)) || 'Manual entry',
      sourceUrl: sanitizeUrl(body.sourceUrl),
      note: typeof body.note === 'string' ? body.note.trim().slice(0, 300) || undefined : undefined,
      draftCopy: typeof body.draftCopy === 'string' ? body.draftCopy.slice(0, 2400) : '',
      marleyStatus: stage === 'approved' || stage === 'posted' ? 'approved' : 'pending',
      readyForRotty: stage === 'approved',
      approvedBy: stage === 'approved' || stage === 'posted' ? user.name : undefined,
      jobDate: now.slice(0, 10),
      createdAt: now,
      updatedAt: now,
    };

    await opsSetDoc('ops_pipeline', card.id, card as unknown as Record<string, unknown>);
    await appendOpsActivity(clientId, user.name, `added ${card.lane} card (${card.stage})`, card.title);
    return NextResponse.json({ ok: true, card }, { status: 201 });
  }

  if (action === 'update_card') {
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const existing = id ? await opsGetDoc<PipelineCard>('ops_pipeline', id) : null;
    if (!existing || existing.clientId !== clientId) {
      return NextResponse.json({ error: 'Pipeline card not found' }, { status: 404 });
    }

    const nextLane: PipelineLane = VALID_LANES.has(body.lane as PipelineLane)
      ? (body.lane as PipelineLane)
      : existing.lane;
    const nextStage: PipelineStage = VALID_STAGES.has(body.stage as PipelineStage)
      ? (body.stage as PipelineStage)
      : existing.stage;

    // Sovereign & Pixel rule: Approving queues as Ready for Rotty; only explicit "posted" moves out of readyForRotty
    const readyForRotty =
      typeof body.readyForRotty === 'boolean'
        ? body.readyForRotty
        : nextStage === 'approved'
          ? true
          : nextStage === 'posted'
            ? false
            : existing.readyForRotty;

    const linksInput = (body.links && typeof body.links === 'object' ? body.links : {}) as PipelineLinks;
    const mergedLinks: PipelineLinks = {
      ...(existing.links || {}),
      ...(linksInput.fb !== undefined ? { fb: sanitizeUrl(linksInput.fb) } : {}),
      ...(linksInput.ig !== undefined ? { ig: sanitizeUrl(linksInput.ig) } : {}),
      ...(linksInput.linkedin !== undefined ? { linkedin: sanitizeUrl(linksInput.linkedin) } : {}),
      ...(linksInput.x !== undefined ? { x: sanitizeUrl(linksInput.x) } : {}),
    };

    const updated: PipelineCard = {
      ...existing,
      title:
        typeof body.title === 'string' && body.title.trim()
          ? body.title.trim().slice(0, 120)
          : existing.title,
      lane: nextLane,
      channel: laneToChannel(nextLane),
      stage: nextStage,
      source:
        typeof body.source === 'string' && body.source.trim()
          ? body.source.trim().slice(0, 80)
          : existing.source,
      sourceUrl: body.sourceUrl !== undefined ? sanitizeUrl(body.sourceUrl) : existing.sourceUrl,
      assetFile:
        typeof body.assetFile === 'string'
          ? body.assetFile.trim().slice(0, 160) || undefined
          : existing.assetFile,
      assetUrl: body.assetUrl !== undefined ? sanitizeUrl(body.assetUrl) : existing.assetUrl,
      assetSpec:
        typeof body.assetSpec === 'string'
          ? body.assetSpec.trim().slice(0, 60) || undefined
          : existing.assetSpec,
      note: typeof body.note === 'string' ? body.note.trim().slice(0, 300) || undefined : existing.note,
      draftCopy: typeof body.draftCopy === 'string' ? body.draftCopy.slice(0, 2400) : existing.draftCopy,
      marleyStatus:
        body.marleyStatus === 'pending' ||
        body.marleyStatus === 'approved' ||
        body.marleyStatus === 'rejected'
          ? body.marleyStatus
          : nextStage === 'approved' || nextStage === 'posted'
            ? 'approved'
            : existing.marleyStatus,
      readyForRotty,
      approvedBy:
        nextStage === 'approved' || readyForRotty
          ? existing.approvedBy || user.name
          : existing.approvedBy,
      links: Object.values(mergedLinks).some(Boolean) ? mergedLinks : undefined,
      updatedAt: now,
    };

    await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
    const logAction =
      nextStage === 'approved' && existing.stage !== 'approved'
        ? 'marked Ready for Rotty'
        : nextStage === 'posted' && existing.stage !== 'posted'
          ? 'marked posted'
          : `updated card (${updated.stage})`;
    await appendOpsActivity(clientId, user.name, logAction, updated.title);
    return NextResponse.json({ ok: true, card: updated }, { status: 200 });
  }

  if (action === 'delete_card') {
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const existing = id ? await opsGetDoc<PipelineCard>('ops_pipeline', id) : null;
    if (!existing || existing.clientId !== clientId) {
      return NextResponse.json({ error: 'Pipeline card not found' }, { status: 404 });
    }
    await opsDeleteDoc('ops_pipeline', id);
    await appendOpsActivity(clientId, user.name, 'removed card', existing.title);
    return NextResponse.json({ ok: true, id }, { status: 200 });
  }

  if (action === 'upsert_gate') {
    const id =
      typeof body.id === 'string' && body.id.trim()
        ? body.id.trim()
        : `${clientId}-gate-${Date.now()}`;
    const label = typeof body.label === 'string' ? body.label.trim().slice(0, 120) : '';
    if (!label) return NextResponse.json({ error: 'Gate label is required' }, { status: 400 });

    const existing = await opsGetDoc<GateItem>('ops_gates', id);
    if (existing && existing.clientId !== clientId) return forbiddenResponse();

    const state: GateState = VALID_GATE_STATES.has(body.state as GateState)
      ? (body.state as GateState)
      : existing?.state || 'hold';

    const gate: GateItem = {
      id,
      clientId,
      label,
      state,
      detail: typeof body.detail === 'string' ? body.detail.trim().slice(0, 300) : existing?.detail || '',
      since: typeof body.since === 'string' && body.since.trim() ? body.since.trim().slice(0, 40) : existing?.since || now.slice(0, 10),
      updatedAt: now,
    };

    await opsSetDoc('ops_gates', id, gate as unknown as Record<string, unknown>);
    await appendOpsActivity(clientId, user.name, `set gate (${gate.state})`, gate.label);
    return NextResponse.json({ ok: true, gate }, { status: 200 });
  }

  if (action === 'update_metrics') {
    const existing = await opsGetDoc<MetricsSnapshot>('ops_metrics', clientId);
    const numOrKeep = (v: unknown, prev: number | null | undefined): number | null => {
      if (v === null || v === '') return null;
      if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v);
      return prev ?? null;
    };

    const nextMetrics: MetricsSnapshot = {
      id: clientId,
      clientId,
      sessions: body.sessions !== undefined ? numOrKeep(body.sessions, existing?.sessions) : existing?.sessions ?? null,
      sessionsPeriod:
        typeof body.sessionsPeriod === 'string'
          ? body.sessionsPeriod.trim().slice(0, 60)
          : existing?.sessionsPeriod || 'Not entered',
      generateLead:
        body.generateLead !== undefined
          ? numOrKeep(body.generateLead, existing?.generateLead)
          : existing?.generateLead ?? null,
      xFollowers:
        body.xFollowers !== undefined
          ? numOrKeep(body.xFollowers, existing?.xFollowers)
          : existing?.xFollowers ?? null,
      asOf:
        typeof body.asOf === 'string' && body.asOf.trim()
          ? body.asOf.trim().slice(0, 32)
          : now.slice(0, 10),
      showroomPhase:
        typeof body.showroomPhase === 'string'
          ? body.showroomPhase.trim().slice(0, 80)
          : existing?.showroomPhase || '',
      showroomNote:
        typeof body.showroomNote === 'string'
          ? body.showroomNote.trim().slice(0, 240)
          : existing?.showroomNote || '',
      updatedAt: now,
      updatedBy: user.name,
    };

    await opsSetDoc('ops_metrics', clientId, nextMetrics as unknown as Record<string, unknown>);
    await appendOpsActivity(clientId, user.name, `updated metrics (as of ${nextMetrics.asOf})`, clientId);
    return NextResponse.json({ ok: true, metrics: nextMetrics }, { status: 200 });
  }

  if (action === 'paste') {
    const raw = typeof body.raw === 'string' ? body.raw : '';
    if (!raw.trim()) return NextResponse.json({ error: 'Paste text is empty' }, { status: 400 });

    const parsed = parseAdminPasteBlock(raw, clientId);

    if (parsed.kind === 'crew' && parsed.crewUpdate) {
      const docId = `${clientId}__${parsed.crewUpdate.agentId}`;
      const existing = await opsGetDoc<CrewMember>('ops_crew', docId);
      if (!existing) {
        return NextResponse.json({ error: `Crew member ${parsed.crewUpdate.agentId} not found` }, { status: 404 });
      }
      const updated: CrewMember = {
        ...existing,
        status: parsed.crewUpdate.status || existing.status,
        statusNote: parsed.crewUpdate.statusNote ?? existing.statusNote,
        usagePct: parsed.crewUpdate.usagePct ?? existing.usagePct,
        resetNote: parsed.crewUpdate.resetNote ?? existing.resetNote,
        updatedAt: now,
        updatedBy: user.name,
      };
      await opsSetDoc('ops_crew', docId, updated as unknown as Record<string, unknown>);
      await appendOpsActivity(clientId, user.name, `pasted crew status (${updated.status})`, updated.name);
      return NextResponse.json({ ok: true, kind: 'crew', crew: updated }, { status: 200 });
    }

    if (parsed.kind === 'gate' && parsed.gateUpdate) {
      const gateId = `${clientId}-gate-${parsed.gateUpdate.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32)}`;
      const gate: GateItem = {
        id: gateId,
        clientId,
        label: parsed.gateUpdate.label,
        state: parsed.gateUpdate.state,
        detail: parsed.gateUpdate.detail,
        since: parsed.gateUpdate.since,
        updatedAt: now,
      };
      await opsSetDoc('ops_gates', gateId, gate as unknown as Record<string, unknown>);
      await appendOpsActivity(clientId, user.name, `pasted gate (${gate.state})`, gate.label);
      return NextResponse.json({ ok: true, kind: 'gate', gate }, { status: 200 });
    }

    if (parsed.kind === 'metrics' && parsed.metricsUpdate) {
      const existing = await opsGetDoc<MetricsSnapshot>('ops_metrics', clientId);
      const nextMetrics: MetricsSnapshot = {
        id: clientId,
        clientId,
        sessions: parsed.metricsUpdate.sessions ?? existing?.sessions ?? null,
        sessionsPeriod: parsed.metricsUpdate.sessionsPeriod || existing?.sessionsPeriod || 'Not entered',
        generateLead: parsed.metricsUpdate.generateLead ?? existing?.generateLead ?? null,
        xFollowers: parsed.metricsUpdate.xFollowers ?? existing?.xFollowers ?? null,
        asOf: parsed.metricsUpdate.asOf || now.slice(0, 10),
        showroomPhase: parsed.metricsUpdate.showroomPhase || existing?.showroomPhase || '',
        showroomNote: parsed.metricsUpdate.showroomNote || existing?.showroomNote || '',
        updatedAt: now,
        updatedBy: user.name,
      };
      await opsSetDoc('ops_metrics', clientId, nextMetrics as unknown as Record<string, unknown>);
      await appendOpsActivity(clientId, user.name, `pasted metrics (as of ${nextMetrics.asOf})`, clientId);
      return NextResponse.json({ ok: true, kind: 'metrics', metrics: nextMetrics }, { status: 200 });
    }

    if (parsed.kind === 'clearance' && parsed.clearance) {
      const existingCards = await opsQueryByClient<PipelineCard>('ops_pipeline', clientId);
      let applied = 0;
      for (const v of parsed.clearance) {
        const match = existingCards.find(
          (c) => c.title.toLowerCase() === v.title.toLowerCase() || c.title.toLowerCase().includes(v.title.toLowerCase())
        );
        if (match) {
          const updated: PipelineCard = {
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
          await opsSetDoc('ops_pipeline', match.id, updated as unknown as Record<string, unknown>);
        } else {
          const card: PipelineCard = {
            id: `${clientId}-clr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            clientId,
            title: v.title,
            lane: v.lane,
            channel: v.channel,
            contentType: v.lane === 'article' ? 'article' : 'post',
            stage: v.verdict === 'approved' ? 'clearance' : 'pulled',
            agentId: 'marley',
            source: v.clearsFile || 'Marley batch clearance',
            sourceUrl: v.sourceUrl,
            note: `${v.tag} · ${v.notes}`.slice(0, 300),
            draftCopy: v.notes,
            marleyStatus: v.verdict,
            marleyNote: v.notes,
            discrepancies: v.discrepancies,
            artifactsNeeded: v.artifactsNeeded,
            readyForRotty: false,
            jobDate: now.slice(0, 10),
            createdAt: now,
            updatedAt: now,
          };
          await opsSetDoc('ops_pipeline', card.id, card as unknown as Record<string, unknown>);
        }
        applied++;
      }
      await appendOpsActivity(clientId, user.name, `applied batch clearance (${applied} items)`, 'Paste box');
      return NextResponse.json({ ok: true, kind: 'clearance', applied }, { status: 200 });
    }

    if (parsed.kind === 'desk_list' && parsed.deskList) {
      const defaultLane = typeof body.defaultLane === 'string' ? normalizeLane(body.defaultLane) : undefined;
      const items = defaultLane
        ? parseMultiItemDeskList(raw, clientId, defaultLane)
        : parsed.deskList;
      const createdCards: PipelineCard[] = [];
      for (const d of items) {
        const card: PipelineCard = {
          id: `${clientId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          clientId,
          title: d.title,
          lane: d.lane,
          channel: d.channel,
          contentType: d.contentType,
          stage: 'pulled',
          agentId: d.agentId,
          source: d.source,
          sourceUrl: d.sourceUrl,
          draftCopy: d.draftCopy,
          flaggedNotes: d.flaggedNotes,
          marleyStatus: 'pending',
          readyForRotty: false,
          jobDate: d.jobDate,
          sourceFile: d.sourceFile,
          createdAt: now,
          updatedAt: now,
        };
        await opsSetDoc('ops_pipeline', card.id, card as unknown as Record<string, unknown>);
        createdCards.push(card);
      }
      await appendOpsActivity(
        clientId,
        user.name,
        `pasted desk list (${createdCards.length} items for Marley)`,
        createdCards[0]?.title || 'Desk intake'
      );
      return NextResponse.json(
        { ok: true, kind: 'desk_list', count: createdCards.length, cards: createdCards },
        { status: 201 }
      );
    }

    if (parsed.drop) {
      const d = parsed.drop;
      const card: PipelineCard = {
        id: `${clientId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        clientId,
        title: d.title,
        lane: d.lane,
        channel: d.channel,
        contentType: d.contentType,
        stage: d.stage,
        agentId: d.agentId,
        source: d.source,
        sourceUrl: d.sourceUrl,
        draftCopy: d.draftCopy,
        flaggedNotes: d.flaggedNotes,
        marleyStatus: d.marleyStatus,
        readyForRotty: false,
        assetFile: d.assetFile,
        assetSpec: d.assetSpec,
        jobDate: d.jobDate,
        sourceFile: d.sourceFile,
        createdAt: now,
        updatedAt: now,
      };
      await opsSetDoc('ops_pipeline', card.id, card as unknown as Record<string, unknown>);
      await appendOpsActivity(clientId, user.name, `pasted drop (${card.lane})`, card.title);
      return NextResponse.json({ ok: true, kind: 'drop', card }, { status: 201 });
    }
  }

  if (action === 'post_chat') {
    const rawText = typeof body.text === 'string' ? body.text : '';
    const text = rawText.trim().slice(0, 1200);
    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    const jobId = typeof body.jobId === 'string' && body.jobId.trim() ? body.jobId.trim().slice(0, 120) : undefined;
    let jobTitle: string | undefined;
    if (jobId) {
      const job = await opsGetDoc<PipelineCard>('ops_pipeline', jobId);
      if (job && job.clientId === clientId) jobTitle = job.title;
    }
    const msg: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      clientId,
      senderId: 'rotty',
      senderName: 'Rotty',
      senderKind: 'operator',
      text,
      mentions: extractChatMentions(text, body.to ?? body.mentions),
      jobId,
      jobTitle,
      replyToId:
        typeof body.replyToId === 'string' && body.replyToId.trim()
          ? body.replyToId.trim().slice(0, 120)
          : undefined,
      createdAt: now,
    };
    await opsSetDoc('ops_chat', msg.id, msg as unknown as Record<string, unknown>);
    return NextResponse.json({ ok: true, message: msg }, { status: 201 });
  }

  if (action === 'delete_chat') {
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const existing = id ? await opsGetDoc<ChatMessage>('ops_chat', id) : null;
    if (!existing || existing.clientId !== clientId) {
      return NextResponse.json({ error: 'Chat message not found' }, { status: 404 });
    }
    await opsDeleteDoc('ops_chat', id);
    return NextResponse.json({ ok: true, deletedId: id }, { status: 200 });
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
