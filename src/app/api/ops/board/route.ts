import { NextResponse } from 'next/server';
import {
  authorizeOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import {
  applyJobAssetPatch,
  cleanBotStringList,
  extractChatMentions,
  FIELD_MAX_LENGTHS,
  getCardAssets,
  getCardCompleteness,
  laneToChannel,
  normalizeAssignedTo,
  normalizeLane,
  normalizePhotoStatus,
  normalizePlatformList,
  normalizePostFormat,
  parseAdminPasteBlock,
  parseConnectorAlert,
  parseMultiItemDeskList,
  parseNewJobAssetInput,
  refreshStaleCardNote,
  resolveEffectivePhotoStatus,
  sanitizeAvatarUrl,
  sanitizeWebOrBlobUrl,
  syncCardWithAssets,
  syncVisualArtifactsNeeded,
  validateStringLength,
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
  OpsRequest,
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
    let nextConnectorAlert = existing.connectorAlert;
    if (body.connectorAlert !== undefined) {
      const alertCheck = parseConnectorAlert(body.connectorAlert, now);
      if (!alertCheck.ok) {
        return NextResponse.json({ error: alertCheck.error }, { status: 400 });
      }
      nextConnectorAlert = alertCheck.value;
    }

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
      connectorAlert: nextConnectorAlert,
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
    const titleCheck = validateStringLength('title', body.title, FIELD_MAX_LENGTHS.title);
    if (!titleCheck.ok || !titleCheck.value) {
      return NextResponse.json(
        { error: !titleCheck.ok ? titleCheck.error : 'title is required' },
        { status: 400 }
      );
    }
    const title = titleCheck.value;
    const lane: PipelineLane = VALID_LANES.has(body.lane as PipelineLane) ? (body.lane as PipelineLane) : 'x';
    const stage: PipelineStage = VALID_STAGES.has(body.stage as PipelineStage) ? (body.stage as PipelineStage) : 'pulled';
    const contentType: ContentKind =
      body.contentType === 'article' || body.contentType === 'image' || body.contentType === 'pull'
        ? body.contentType
        : lane === 'article'
          ? 'article'
          : 'post';

    let assetFile: string | undefined;
    if (body.assetFile !== undefined && body.assetFile !== null) {
      const check = validateStringLength('assetFile', body.assetFile, FIELD_MAX_LENGTHS.assetFile);
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
      assetFile = check.value || undefined;
    }
    const assetUrlCheck = sanitizeWebOrBlobUrl(body.assetUrl, FIELD_MAX_LENGTHS.assetUrl);
    if (!assetUrlCheck.ok) return NextResponse.json({ error: `assetUrl: ${assetUrlCheck.error}` }, { status: 400 });
    const assetUrl = assetUrlCheck.value;

    let assetSpec: string | undefined;
    if (body.assetSpec !== undefined && body.assetSpec !== null) {
      const check = validateStringLength('assetSpec', body.assetSpec, FIELD_MAX_LENGTHS.assetSpec);
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
      assetSpec = check.value || undefined;
    }

    const sourceUrlCheck = sanitizeWebOrBlobUrl(body.sourceUrl, FIELD_MAX_LENGTHS.sourceUrl);
    if (!sourceUrlCheck.ok) return NextResponse.json({ error: `sourceUrl: ${sourceUrlCheck.error}` }, { status: 400 });

    let note: string | undefined;
    if (body.note !== undefined && body.note !== null) {
      const check = validateStringLength('note', body.note, FIELD_MAX_LENGTHS.note);
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
      note = check.value || undefined;
    }

    let draftCopy = '';
    if (body.draftCopy !== undefined && body.draftCopy !== null) {
      const check = validateStringLength('draftCopy', body.draftCopy, FIELD_MAX_LENGTHS.draftCopy);
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
      draftCopy = typeof body.draftCopy === 'string' ? body.draftCopy : '';
    }

    if (typeof body.photoStatus === 'string' && body.photoStatus.trim() && !normalizePhotoStatus(body.photoStatus)) {
      return NextResponse.json({ error: 'Invalid photoStatus' }, { status: 400 });
    }
    const photoStatus = resolveEffectivePhotoStatus({
      explicit: body.photoStatus,
      assetFile,
      assetUrl,
      assetSpec,
    });

    const initialAssets =
      assetFile || assetUrl || assetSpec
        ? [
            {
              id: `ast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              url: assetUrl,
              file: assetFile,
              kind: 'image' as const,
              platform: 'all' as const,
              order: 0,
              spec: assetSpec,
              status: (assetUrl || assetFile ? 'delivered' : 'needed') as 'delivered' | 'needed',
              addedBy: user.name,
              createdAt: now,
              updatedAt: now,
            },
          ]
        : [];
    const syncedCreate = syncCardWithAssets({}, initialAssets);

    const wantsReady = stage === 'approved' && body.readyForRotty === true;
    const completeness = getCardCompleteness({
      draftCopy,
      assets: syncedCreate.assets,
      assetFile: syncedCreate.assetFile,
      assetUrl: syncedCreate.assetUrl,
      photoStatus,
    });
    if (wantsReady && !completeness.canApproveReady) {
      return NextResponse.json(
        {
          error: `Cannot Mark Ready for Rotty: ${completeness.detail}`,
          reason: completeness.lockReason,
        },
        { status: 400 }
      );
    }

    const card: PipelineCard = {
      id: `${clientId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      clientId,
      title,
      lane,
      channel: laneToChannel(lane),
      contentType,
      stage,
      agentId: (typeof body.agentId === 'string' && body.agentId.trim().slice(0, 40)) || 'marley',
      assignedTo: normalizeAssignedTo(body.assignedTo),
      targetPlatforms: normalizePlatformList(body.targetPlatforms),
      source: (typeof body.source === 'string' && body.source.trim().slice(0, 120)) || 'Manual entry',
      sourceUrl: sourceUrlCheck.value,
      assets: syncedCreate.assets,
      assetFile: syncedCreate.assetFile,
      assetUrl: syncedCreate.assetUrl,
      assetSpec: syncedCreate.assetSpec,
      photoStatus,
      noImageNeededBy: photoStatus === 'not_needed' && !assetFile && !assetUrl ? user.name : undefined,
      noImageNeededAt: photoStatus === 'not_needed' && !assetFile && !assetUrl ? now : undefined,
      note,
      draftCopy,
      postFormat: normalizePostFormat(body.postFormat),
      marleyStatus: stage === 'approved' || stage === 'posted' ? 'approved' : 'pending',
      readyForRotty: wantsReady,
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

    let nextTitle = existing.title;
    if (body.title !== undefined) {
      const check = validateStringLength('title', body.title, FIELD_MAX_LENGTHS.title);
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
      if (!check.value) return NextResponse.json({ error: 'title cannot be empty' }, { status: 400 });
      nextTitle = check.value;
    }

    let nextSource = existing.source;
    if (body.source !== undefined && body.source !== null) {
      const check = validateStringLength('source', body.source, FIELD_MAX_LENGTHS.source);
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
      if (check.value) nextSource = check.value;
    }

    let nextSourceUrl = existing.sourceUrl;
    if (body.sourceUrl !== undefined) {
      const check = sanitizeWebOrBlobUrl(body.sourceUrl, FIELD_MAX_LENGTHS.sourceUrl);
      if (!check.ok) return NextResponse.json({ error: `sourceUrl: ${check.error}` }, { status: 400 });
      nextSourceUrl = check.value;
    }

    let nextNote = existing.note;
    if (body.note !== undefined) {
      if (body.note === null || body.note === '') {
        nextNote = undefined;
      } else {
        const check = validateStringLength('note', body.note, FIELD_MAX_LENGTHS.note);
        if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
        nextNote = check.value || undefined;
      }
    }

    let nextDraftCopy = existing.draftCopy;
    if (body.draftCopy !== undefined) {
      const check = validateStringLength('draftCopy', body.draftCopy, FIELD_MAX_LENGTHS.draftCopy);
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
      nextDraftCopy = typeof body.draftCopy === 'string' ? body.draftCopy : '';
    }

    let nextAssetFile = existing.assetFile;
    if (body.assetFile !== undefined) {
      if (body.assetFile === null || body.assetFile === '') {
        nextAssetFile = undefined;
      } else {
        const check = validateStringLength('assetFile', body.assetFile, FIELD_MAX_LENGTHS.assetFile);
        if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
        nextAssetFile = check.value || undefined;
      }
    }

    let nextAssetUrl = existing.assetUrl;
    if (body.assetUrl !== undefined) {
      const check = sanitizeWebOrBlobUrl(body.assetUrl, FIELD_MAX_LENGTHS.assetUrl);
      if (!check.ok) return NextResponse.json({ error: `assetUrl: ${check.error}` }, { status: 400 });
      nextAssetUrl = check.value;
    }

    let nextAssetSpec = existing.assetSpec;
    if (body.assetSpec !== undefined) {
      if (body.assetSpec === null || body.assetSpec === '') {
        nextAssetSpec = undefined;
      } else {
        const check = validateStringLength('assetSpec', body.assetSpec, FIELD_MAX_LENGTHS.assetSpec);
        if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
        nextAssetSpec = check.value || undefined;
      }
    }

    let nextAssets = getCardAssets(existing);
    if (body.assets !== undefined) {
      if (!Array.isArray(body.assets)) {
        return NextResponse.json({ error: 'assets must be an array' }, { status: 400 });
      }
      const existingMap = new Map(nextAssets.map((a) => [a.id, a]));
      const rebuilt: typeof nextAssets = [];
      for (let i = 0; i < body.assets.length; i++) {
        const rawA = body.assets[i];
        if (!rawA || typeof rawA !== 'object' || Array.isArray(rawA)) {
          return NextResponse.json({ error: 'Each asset must be an object' }, { status: 400 });
        }
        const aObj = rawA as Record<string, unknown>;
        const prevAsset = typeof aObj.id === 'string' ? existingMap.get(aObj.id) : undefined;
        if (prevAsset) {
          const pCopy = { ...aObj };
          delete pCopy.id;
          delete pCopy.addedBy;
          delete pCopy.createdAt;
          delete pCopy.updatedAt;
          delete pCopy.reviewedBy;
          delete pCopy.reviewedAt;
          const patched = applyJobAssetPatch(prevAsset, pCopy, {
            actorName: user.name,
            canReviewAsset: true,
            now,
          });
          if (!patched.ok) {
            return NextResponse.json({ error: patched.error }, { status: patched.status });
          }
          rebuilt.push(patched.asset);
        } else {
          const parsed = parseNewJobAssetInput(aObj, {
            addedBy: user.name,
            defaultOrder: i,
            canReviewAsset: true,
            now,
          });
          if (!parsed.ok) {
            return NextResponse.json({ error: parsed.error }, { status: parsed.status });
          }
          rebuilt.push(parsed.asset);
        }
      }
      nextAssets = rebuilt;
    } else if (body.assetUrl !== undefined || body.assetFile !== undefined || body.assetSpec !== undefined) {
      if (nextAssets.length > 0) {
        nextAssets = nextAssets.map((a, idx) =>
          idx === 0
            ? {
                ...a,
                url: body.assetUrl !== undefined ? nextAssetUrl : a.url,
                file: body.assetFile !== undefined ? nextAssetFile : a.file,
                spec: body.assetSpec !== undefined ? nextAssetSpec : a.spec,
                status:
                  (nextAssetUrl || nextAssetFile) && (a.status === 'needed' || a.status === 'in_progress')
                    ? 'delivered'
                    : a.status,
                updatedAt: now,
              }
            : a
        );
      } else if (nextAssetUrl || nextAssetFile || nextAssetSpec) {
        nextAssets = [
          {
            id: `ast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            url: nextAssetUrl,
            file: nextAssetFile,
            kind: 'image',
            platform: 'all',
            order: 0,
            spec: nextAssetSpec,
            status: nextAssetUrl || nextAssetFile ? 'delivered' : 'needed',
            addedBy: user.name,
            createdAt: now,
            updatedAt: now,
          },
        ];
      }
    }

    const syncedUpdateAssets = syncCardWithAssets({}, nextAssets);
    const effectiveAssetFile = syncedUpdateAssets.assetFile;
    const effectiveAssetUrl = syncedUpdateAssets.assetUrl;
    const effectiveAssetSpec = syncedUpdateAssets.assetSpec;

    if (
      typeof body.photoStatus === 'string' &&
      body.photoStatus.trim() &&
      !normalizePhotoStatus(body.photoStatus)
    ) {
      return NextResponse.json({ error: 'Invalid photoStatus' }, { status: 400 });
    }

    const explicitPhotoInput =
      body.photoStatus === null || body.photoStatus === ''
        ? 'missing'
        : body.photoStatus;
    const nextPhotoStatus = resolveEffectivePhotoStatus({
      explicit: explicitPhotoInput,
      existing: existing.photoStatus,
      assetFile: effectiveAssetFile,
      assetUrl: effectiveAssetUrl,
      assetSpec: effectiveAssetSpec,
    });

    const completeness = getCardCompleteness({
      ...existing,
      draftCopy: nextDraftCopy,
      assets: syncedUpdateAssets.assets,
      assetFile: effectiveAssetFile,
      assetUrl: effectiveAssetUrl,
      assetSpec: effectiveAssetSpec,
      photoStatus: nextPhotoStatus,
    });

    const explicitlyRequestedReady = body.readyForRotty === true;
    if (explicitlyRequestedReady && nextStage !== 'approved') {
      return NextResponse.json(
        { error: 'Job must be Approved first before marking Ready for Rotty.' },
        { status: 409 }
      );
    }
    if (explicitlyRequestedReady && !completeness.canApproveReady) {
      return NextResponse.json(
        {
          error: `Cannot Mark Ready for Rotty: ${completeness.detail}`,
          reason: completeness.lockReason,
        },
        { status: 400 }
      );
    }

    // Separate Rotty approval (stage: 'approved') from crew completion (readyForRotty: true).
    let readyForRotty =
      typeof body.readyForRotty === 'boolean'
        ? body.readyForRotty
        : nextStage === 'posted' || nextStage === 'archived' || nextStage !== 'approved'
          ? false
          : existing.readyForRotty;

    // Completeness invariant: Ready for Rotty may never hold a card missing copy or approved asset (unless explicit not_needed).
    let demotedReady = false;
    if (readyForRotty && nextStage !== 'posted' && nextStage !== 'archived') {
      if (!completeness.canApproveReady || nextStage !== 'approved') {
        readyForRotty = false;
        demotedReady = true;
      }
    }

    const linksInput = (body.links && typeof body.links === 'object' ? body.links : {}) as PipelineLinks;
    const mergedLinks: PipelineLinks = {
      ...(existing.links || {}),
      ...(linksInput.fb !== undefined ? { fb: sanitizeUrl(linksInput.fb) } : {}),
      ...(linksInput.ig !== undefined ? { ig: sanitizeUrl(linksInput.ig) } : {}),
      ...(linksInput.linkedin !== undefined ? { linkedin: sanitizeUrl(linksInput.linkedin) } : {}),
      ...(linksInput.x !== undefined ? { x: sanitizeUrl(linksInput.x) } : {}),
    };

    const isNoImageException =
      nextPhotoStatus === 'not_needed' && syncedUpdateAssets.assets.length === 0 && !effectiveAssetFile && !effectiveAssetUrl;

    const explicitArtifacts =
      body.artifactsNeeded !== undefined ? cleanBotStringList(body.artifactsNeeded) : undefined;

    const nextPostFormat =
      body.postFormat === null || body.postFormat === ''
        ? undefined
        : body.postFormat !== undefined
          ? normalizePostFormat(body.postFormat)
          : existing.postFormat;

    const updated: PipelineCard = {
      ...existing,
      title: nextTitle,
      lane: nextLane,
      channel: laneToChannel(nextLane),
      postFormat: nextPostFormat,
      stage: nextStage,
      assignedTo:
        body.assignedTo !== undefined ? normalizeAssignedTo(body.assignedTo) : existing.assignedTo,
      targetPlatforms:
        body.targetPlatforms !== undefined
          ? normalizePlatformList(body.targetPlatforms)
          : existing.targetPlatforms,
      source: nextSource,
      sourceUrl: nextSourceUrl,
      assets: syncedUpdateAssets.assets,
      assetFile: effectiveAssetFile,
      assetUrl: effectiveAssetUrl,
      assetSpec: effectiveAssetSpec,
      photoStatus: nextPhotoStatus,
      noImageNeededBy: isNoImageException ? existing.noImageNeededBy || user.name : undefined,
      noImageNeededAt: isNoImageException ? existing.noImageNeededAt || now : undefined,
      artifactsNeeded: syncVisualArtifactsNeeded(
        existing.artifactsNeeded,
        explicitArtifacts,
        effectiveAssetSpec,
        Boolean(effectiveAssetFile || effectiveAssetUrl || isNoImageException)
      ),
      note: refreshStaleCardNote(nextNote, nextStage),
      draftCopy: nextDraftCopy,
      marleyStatus:
        body.marleyStatus === 'pending' ||
        body.marleyStatus === 'approved' ||
        body.marleyStatus === 'rejected'
          ? body.marleyStatus
          : nextStage === 'approved' || nextStage === 'posted'
            ? 'approved'
            : existing.marleyStatus,
      readyForRotty,
      postIt:
        nextStage === 'posted' || nextStage === 'archived' || (!readyForRotty && nextStage !== 'approved')
          ? false
          : existing.postIt,
      postItAt:
        nextStage === 'archived' || (!readyForRotty && nextStage !== 'approved' && nextStage !== 'posted')
          ? undefined
          : existing.postItAt,
      postItBy:
        nextStage === 'archived' || (!readyForRotty && nextStage !== 'approved' && nextStage !== 'posted')
          ? undefined
          : existing.postItBy,
      approvedBy:
        nextStage === 'approved' || readyForRotty
          ? existing.approvedBy || user.name
          : existing.approvedBy,
      links: Object.values(mergedLinks).some(Boolean) ? mergedLinks : undefined,
      updatedAt: now,
    };

    await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
    const assignmentChanged = Boolean(updated.assignedTo && updated.assignedTo !== existing.assignedTo);
    if (updated.assignedTo && (body.notifyAssigned === true || assignmentChanged)) {
      const targetId = updated.assignedTo;
      const targetCrew = await opsGetDoc<CrewMember>('ops_crew', `${clientId}__${targetId}`);
      const handle = targetCrew?.name ? targetCrew.name.replace(/\s+/g, '') : targetId;
      const pingMsg: ChatMessage = {
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        clientId,
        senderId: 'rotty',
        senderName: 'Rotty',
        senderKind: 'operator',
        text: `@${handle} Assigned "${updated.title}" (${updated.stage}) to you.`,
        mentions: [targetId],
        jobId: updated.id,
        jobTitle: updated.title,
        createdAt: now,
      };
      await opsSetDoc('ops_chat', pingMsg.id, pingMsg as unknown as Record<string, unknown>);
    }
    const logAction = demotedReady
      ? `returned to Approved crew queue (${completeness.buttonReason || 'incomplete'})`
      : readyForRotty && !existing.readyForRotty
        ? 'marked Ready for Rotty'
        : nextStage === 'approved' && existing.stage !== 'approved'
          ? 'approved (sent to crew queue)'
          : nextStage === 'posted' && existing.stage !== 'posted'
            ? 'marked posted'
            : isNoImageException && existing.photoStatus !== 'not_needed'
              ? 'marked no image needed'
              : assignmentChanged
                ? `assigned to ${updated.assignedTo}`
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
          photoStatus: 'missing',
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
      const safeDropStage: PipelineStage =
        d.stage === 'approved' || d.stage === 'posted' ? 'drafted' : d.stage;
      const card: PipelineCard = {
        id: `${clientId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        clientId,
        title: d.title,
        lane: d.lane,
        channel: d.channel,
        contentType: d.contentType,
        stage: safeDropStage,
        agentId: d.agentId,
        source: d.source,
        sourceUrl: d.sourceUrl,
        draftCopy: d.draftCopy,
        flaggedNotes: d.flaggedNotes,
        marleyStatus: d.marleyStatus,
        readyForRotty: false,
        assetFile: d.assetFile,
        assetSpec: d.assetSpec,
        photoStatus: resolveEffectivePhotoStatus({
          assetFile: d.assetFile,
          assetSpec: d.assetSpec,
        }),
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

  if (action === 'post_it' || action === 'cancel_post_it') {
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const existing = id ? await opsGetDoc<PipelineCard>('ops_pipeline', id) : null;
    if (!existing || existing.clientId !== clientId) {
      return NextResponse.json({ error: 'Pipeline card not found' }, { status: 404 });
    }

    const assigned = normalizeAssignedTo(existing.assignedTo);
    const ownerAgentId = assigned || (existing.lane === 'x' ? 'sovereign' : 'marley');
    const handleMap: Record<string, string> = {
      sovereign: '@Sovereign',
      marley: '@Marley',
      pixel: '@Pixel',
      'cheat-code': '@CheatCode',
      bastion: '@Bastion',
      cortex: '@Cortex',
      glitch: '@Glitch',
      splicer: '@Splicer',
      gemini: '@Gemini',
      antigravity: '@Antigravity',
    };
    const ownerHandle = handleMap[ownerAgentId] || `@${ownerAgentId}`;

    if (action === 'post_it') {
      if (existing.stage === 'posted' || existing.stage === 'archived') {
        return NextResponse.json(
          { error: 'Card is already posted or archived.' },
          { status: 400 }
        );
      }
      if (existing.stage !== 'approved' || !existing.readyForRotty) {
        return NextResponse.json(
          { error: 'Post it is only available on Ready for Rotty cards (crew must Mark Ready first).' },
          { status: 400 }
        );
      }
      const postCompleteness = getCardCompleteness(existing);
      if (!postCompleteness.canApproveReady) {
        return NextResponse.json(
          {
            error: `Cannot Post it — card is incomplete: ${postCompleteness.detail}`,
            reason: postCompleteness.lockReason,
          },
          { status: 400 }
        );
      }
      if (existing.postIt) {
        return NextResponse.json({ ok: true, card: existing, alreadyTriggered: true }, { status: 200 });
      }

      const updated: PipelineCard = {
        ...existing,
        stage: 'approved',
        readyForRotty: true,
        postIt: true,
        postItAt: now,
        postItBy: user.name,
        updatedAt: now,
      };
      await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);

      const chatMsg: ChatMessage = {
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        clientId,
        senderId: 'rotty',
        senderName: 'Rotty',
        senderKind: 'operator',
        text: `${ownerHandle} Post it: "${existing.title}" (${existing.lane}) — cleared to publish. File POST /api/bots/jobs/${existing.id}/post-result with the live URL.`,
        mentions: [ownerAgentId],
        jobId: existing.id,
        jobTitle: existing.title,
        createdAt: now,
      };
      await opsSetDoc('ops_chat', chatMsg.id, chatMsg as unknown as Record<string, unknown>);
      await appendOpsActivity(clientId, user.name, `triggered Post it (${ownerHandle})`, existing.title);
      return NextResponse.json({ ok: true, card: updated, chatMessage: chatMsg }, { status: 200 });
    }

    // cancel_post_it
    if (existing.stage === 'posted') {
      return NextResponse.json({ error: 'Already posted — cannot cancel Post it.' }, { status: 409 });
    }
    const nowMs = Date.now();
    const hasActiveClaim = Boolean(
      existing.claimedBy &&
      (!existing.leaseExpiresAt || new Date(existing.leaseExpiresAt).getTime() > nowMs)
    );
    if (hasActiveClaim) {
      return NextResponse.json(
        { error: `Already claimed by ${existing.claimedBy} — cannot cancel Post it.` },
        { status: 409 }
      );
    }
    if (!existing.postIt) {
      return NextResponse.json({ ok: true, card: existing }, { status: 200 });
    }

    const updated: PipelineCard = {
      ...existing,
      postIt: false,
      postItAt: undefined,
      postItBy: undefined,
      updatedAt: now,
    };
    await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);

    const cancelMsg: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      clientId,
      senderId: 'rotty',
      senderName: 'Rotty',
      senderKind: 'operator',
      text: `${ownerHandle} Cancel Post it: "${existing.title}" — misclick cancelled, hold on publishing.`,
      mentions: [ownerAgentId],
      jobId: existing.id,
      jobTitle: existing.title,
      createdAt: now,
    };
    await opsSetDoc('ops_chat', cancelMsg.id, cancelMsg as unknown as Record<string, unknown>);
    await appendOpsActivity(clientId, user.name, 'cancelled Post it', existing.title);
    return NextResponse.json({ ok: true, card: updated, chatMessage: cancelMsg }, { status: 200 });
  }

  if (action === 'decide_request') {
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const decision = typeof body.decision === 'string' ? body.decision.trim() : '';
    const existing = id ? await opsGetDoc<OpsRequest>('ops_requests', id) : null;
    if (!existing || existing.clientId !== clientId) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    if (!decision) {
      return NextResponse.json({ error: 'decision is required' }, { status: 400 });
    }
    if (existing.status === 'done' || existing.status === 'dismissed') {
      return NextResponse.json(
        { error: `Request is already ${existing.status}.` },
        { status: 409 }
      );
    }

    const isBuiltInClose = decision === 'already_handled' || decision === 'dismiss';
    const matchedAction = (existing.actions || []).find((a) => a.id === decision);
    if (!isBuiltInClose && !matchedAction) {
      return NextResponse.json(
        { error: `Unknown decision '${decision}' for this request.` },
        { status: 400 }
      );
    }
    if (!isBuiltInClose && existing.status !== 'pending') {
      return NextResponse.json(
        { error: `Request already decided (${existing.decisionLabel || existing.decision}).` },
        { status: 409 }
      );
    }

    const handleMap: Record<string, string> = {
      sovereign: '@Sovereign',
      marley: '@Marley',
      pixel: '@Pixel',
      'cheat-code': '@CheatCode',
      bastion: '@Bastion',
      cortex: '@Cortex',
      glitch: '@Glitch',
      splicer: '@Splicer',
      gemini: '@Gemini',
      antigravity: '@Antigravity',
    };
    const ownerId = normalizeAssignedTo(existing.raisedBy) || existing.raisedBy;
    const ownerHandle = handleMap[ownerId] || `@${existing.raisedByName || ownerId}`;

    const decisionLabel =
      decision === 'already_handled'
        ? 'Already handled'
        : decision === 'dismiss'
          ? 'Dismissed'
          : matchedAction!.label;

    const updated: OpsRequest =
      decision === 'already_handled'
        ? {
            ...existing,
            status: 'done',
            decision,
            decisionLabel,
            decidedBy: user.name,
            decidedAt: existing.decidedAt || now,
            outcomeNote: 'Marked already handled by Rotty.',
            completedBy: user.name,
            completedAt: now,
            updatedAt: now,
          }
        : decision === 'dismiss'
          ? {
              ...existing,
              status: 'dismissed',
              decision,
              decisionLabel,
              decidedBy: user.name,
              decidedAt: existing.decidedAt || now,
              updatedAt: now,
            }
          : {
              ...existing,
              status: 'decided',
              decision,
              decisionLabel,
              decidedBy: user.name,
              decidedAt: now,
              updatedAt: now,
            };

    await opsSetDoc('ops_requests', id, updated as unknown as Record<string, unknown>);

    let chatMessage: ChatMessage | undefined;
    if (decision !== 'dismiss') {
      chatMessage = {
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        clientId,
        senderId: 'rotty',
        senderName: 'Rotty',
        senderKind: 'operator',
        text:
          decision === 'already_handled'
            ? `${ownerHandle} Request "${existing.title}" marked Already handled — no action needed.`
            : `${ownerHandle} Decision on "${existing.title}": ${decisionLabel}. Execute and file POST /api/bots/requests/${existing.id}/outcome with the result.`,
        mentions: [ownerId],
        jobId: existing.jobId,
        jobTitle: existing.jobTitle || existing.title,
        createdAt: now,
      };
      await opsSetDoc('ops_chat', chatMessage.id, chatMessage as unknown as Record<string, unknown>);
    }

    await appendOpsActivity(
      clientId,
      user.name,
      `decided request (${decisionLabel})`,
      existing.title
    );

    return NextResponse.json({ ok: true, request: updated, chatMessage }, { status: 200 });
  }

  if (action === 'delete_request') {
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const existing = id ? await opsGetDoc<OpsRequest>('ops_requests', id) : null;
    if (!existing || existing.clientId !== clientId) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    await opsDeleteDoc('ops_requests', id);
    await appendOpsActivity(clientId, user.name, 'removed request', existing.title);
    return NextResponse.json({ ok: true, id }, { status: 200 });
  }

  if (action === 'asset_update' || action === 'asset_delete' || action === 'asset_reorder' || action === 'asset_add') {
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const existing = id ? await opsGetDoc<PipelineCard>('ops_pipeline', id) : null;
    if (!existing || existing.clientId !== clientId) {
      return NextResponse.json({ error: 'Pipeline card not found' }, { status: 404 });
    }

    let assets = getCardAssets(existing);
    let activityAction = 'updated assets';

    let assignedToOnAdd = existing.assignedTo;
    let addedAssetForPing: typeof assets[number] | null = null;

    if (action === 'asset_add') {
      const assetObj = (body.asset && typeof body.asset === 'object' ? body.asset : {}) as Record<string, unknown>;
      const parsed = parseNewJobAssetInput(assetObj, {
        addedBy: user.name,
        defaultOrder: assets.length,
        canReviewAsset: true,
        now,
      });
      if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
      assets = [...assets, parsed.asset];
      addedAssetForPing = parsed.asset;
      if (!assignedToOnAdd && parsed.asset.assignedTo) {
        assignedToOnAdd = parsed.asset.assignedTo;
      }
      activityAction = parsed.asset.assignedTo
        ? `assigned ${parsed.asset.kind} task to ${parsed.asset.assignedTo}`
        : `added asset (${parsed.asset.kind})`;
    } else if (action === 'asset_update') {
      const assetId = typeof body.assetId === 'string' ? body.assetId.trim() : '';
      const idx = assets.findIndex((a) => a.id === assetId);
      if (idx === -1) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      const patch = (body.patch && typeof body.patch === 'object' ? body.patch : {}) as Record<string, unknown>;
      const patched = applyJobAssetPatch(assets[idx], patch, {
        actorName: user.name,
        canReviewAsset: true,
        now,
      });
      if (!patched.ok) return NextResponse.json({ error: patched.error }, { status: patched.status });
      assets = assets.map((a, i) => (i === idx ? patched.asset : a));
      activityAction =
        patched.asset.status !== assets[idx].status &&
        (patched.asset.status === 'approved' || patched.asset.status === 'rejected')
          ? `${patched.asset.status} asset (${patched.asset.kind})`
          : `updated asset (${patched.asset.kind})`;
    } else if (action === 'asset_delete') {
      const assetId = typeof body.assetId === 'string' ? body.assetId.trim() : '';
      if (!assets.some((a) => a.id === assetId)) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }
      assets = assets.filter((a) => a.id !== assetId);
      activityAction = 'removed asset';
    } else if (action === 'asset_reorder') {
      const assetIds = Array.isArray(body.assetIds) ? (body.assetIds as string[]) : [];
      const byId = new Map(assets.map((a) => [a.id, a]));
      const seen = new Set<string>();
      const reordered: typeof assets = [];
      for (const aid of assetIds) {
        const a = byId.get(aid);
        if (a && !seen.has(aid)) {
          seen.add(aid);
          reordered.push({ ...a, order: reordered.length, updatedAt: now });
        }
      }
      for (const a of assets) {
        if (!seen.has(a.id)) reordered.push({ ...a, order: reordered.length });
      }
      assets = reordered;
      activityAction = 'reordered assets';
    }

    const synced = syncCardWithAssets(existing, assets);
    const nextPhotoStatus = resolveEffectivePhotoStatus({
      existing: existing.photoStatus,
      assetFile: synced.assetFile,
      assetUrl: synced.assetUrl,
      assetSpec: synced.assetSpec,
    });

    const nextStage = existing.stage;
    let nextReady = existing.readyForRotty;
    let nextPostIt = Boolean(existing.postIt);
    let nextPostItAt = existing.postItAt;
    let nextPostItBy = existing.postItBy;
    if (nextReady && nextStage !== 'posted' && nextStage !== 'archived') {
      const comp = getCardCompleteness({ ...synced, photoStatus: nextPhotoStatus });
      if (!comp.canApproveReady) {
        nextReady = false;
        nextPostIt = false;
        nextPostItAt = undefined;
        nextPostItBy = undefined;
      }
    }

    const updated: PipelineCard = {
      ...synced,
      assignedTo: assignedToOnAdd,
      stage: nextStage,
      readyForRotty: nextReady,
      postIt: nextPostIt,
      postItAt: nextPostItAt,
      postItBy: nextPostItBy,
      photoStatus: nextPhotoStatus,
      noImageNeededBy: assets.length > 0 ? undefined : existing.noImageNeededBy,
      noImageNeededAt: assets.length > 0 ? undefined : existing.noImageNeededAt,
      updatedAt: now,
    };

    await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
    if (addedAssetForPing?.assignedTo) {
      const targetId = addedAssetForPing.assignedTo;
      const targetCrew = await opsGetDoc<CrewMember>('ops_crew', `${clientId}__${targetId}`);
      const handle = targetCrew?.name ? targetCrew.name.replace(/\s+/g, '') : targetId;
      const specBit = addedAssetForPing.spec ? ` [${addedAssetForPing.spec}]` : '';
      const pingMsg: ChatMessage = {
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        clientId,
        senderId: 'rotty',
        senderName: 'Rotty',
        senderKind: 'operator',
        text: `@${handle} Assigned ${addedAssetForPing.kind.replace('_', ' ')} (${addedAssetForPing.platform.toUpperCase()})${specBit} for "${updated.title}".`,
        mentions: [targetId],
        jobId: updated.id,
        jobTitle: updated.title,
        createdAt: now,
      };
      await opsSetDoc('ops_chat', pingMsg.id, pingMsg as unknown as Record<string, unknown>);
    }
    await appendOpsActivity(clientId, user.name, activityAction, updated.title);
    return NextResponse.json({ ok: true, card: updated }, { status: 200 });
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
