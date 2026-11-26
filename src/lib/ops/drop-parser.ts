import type {
  AgentStatus,
  ChannelId,
  ContentKind,
  GateState,
  PipelineLane,
  PipelineStage,
} from './types';

export interface ParsedDropDocument {
  clientId: string;
  title: string;
  lane: PipelineLane;
  channel: ChannelId;
  contentType: ContentKind;
  stage: PipelineStage;
  agentId: string;
  source: string;
  sourceUrl?: string;
  sourceUrlMissing: boolean;
  statusTag: string;
  marleyStatus: 'pending' | 'approved' | 'rejected';
  readyForRotty: boolean;
  draftCopy: string;
  flaggedNotes: string[];
  assetFile?: string;
  assetSpec?: string;
  jobDate: string;
  sourceFile: string;
}

export interface ParsedClearanceVerdict {
  title: string;
  lane: PipelineLane;
  channel: ChannelId;
  verdict: 'approved' | 'rejected' | 'pending';
  tag: 'NEW' | 'FOLLOW-UP' | 'HOLD' | 'REJECTED';
  notes: string;
  discrepancies: string[];
  artifactsNeeded: string[];
  sourceUrl?: string;
  clearsFile?: string;
}

export interface ParsedPasteCommand {
  kind: 'drop' | 'desk_list' | 'clearance' | 'crew' | 'gate' | 'metrics';
  drop?: ParsedDropDocument;
  deskList?: ParsedDropDocument[];
  clearance?: ParsedClearanceVerdict[];
  crewUpdate?: {
    agentId: string;
    status?: AgentStatus;
    statusNote?: string;
    usagePct?: number;
    resetNote?: string;
  };
  gateUpdate?: {
    label: string;
    state: GateState;
    detail: string;
    since: string;
  };
  metricsUpdate?: {
    sessions?: number | null;
    sessionsPeriod?: string;
    generateLead?: number | null;
    xFollowers?: number | null;
    asOf?: string;
    showroomPhase?: string;
    showroomNote?: string;
  };
}

function todayDateTag(): string {
  return new Date().toISOString().slice(0, 10);
}

export function laneToChannel(lane: PipelineLane): ChannelId {
  if (lane === 'fb-ig') return 'meta';
  if (lane === 'x') return 'x';
  return 'linkedin';
}

export function normalizeLane(raw: string | undefined, filename = ''): PipelineLane {
  const combined = `${raw || ''} ${filename}`.toLowerCase();
  if (combined.includes('article') || combined.includes('longform')) return 'article';
  if (
    combined.includes('fb-ig') ||
    combined.includes('fb/ig') ||
    combined.includes('facebook') ||
    combined.includes('instagram') ||
    combined.includes('meta') ||
    combined.includes('fb + ig')
  ) {
    return 'fb-ig';
  }
  if (combined.includes('linkedin')) return 'linkedin';
  if (
    combined === 'x' ||
    combined.includes(' x ') ||
    combined.includes('x lane') ||
    combined.includes('twitter') ||
    combined.includes('alert-') ||
    combined.includes('-x-') ||
    combined.includes('virginia wire') ||
    combined.includes('dmv')
  ) {
    return 'x';
  }
  return 'x';
}

export function inferAgentId(raw: string | undefined, filename = ''): string {
  const v = (raw || filename).trim().toLowerCase();
  if (v.startsWith('sovereign') || v === 'sovereign') return 'sovereign';
  if (v.startsWith('marley') || v === 'marley') return 'marley';
  if (v.startsWith('cheatcode') || v.startsWith('cheat-code') || v.includes('cheat')) return 'cheat-code';
  if (v.startsWith('pixel') || v === 'pixel') return 'pixel';
  if (v.startsWith('glitch') || v === 'glitch') return 'glitch';
  if (v.startsWith('bastion') || v === 'bastion') return 'bastion';
  if (v.startsWith('cortex') || v === 'cortex') return 'cortex';
  if (v.startsWith('gemini') || v === 'gemini-watch') return 'gemini-watch';
  if (v.startsWith('splicer') || v === 'splicer') return 'splicer';
  if (v.startsWith('antigravity') || v === 'antigravity') return 'antigravity';
  return 'cheat-code';
}

function normalizeStage(raw: string | undefined, filename: string, body: string): PipelineStage {
  const s = (raw || '').trim().toLowerCase();
  if (s === 'pulled' || s === 'pull' || s === 'menu') return 'pulled';
  if (s === 'clearance') return 'clearance';
  if (s === 'drafted' || s === 'draft') return 'drafted';
  if (s === 'approved' || s === 'ready' || s === 'ready-for-rotty') return 'approved';
  if (s === 'posted' || s === 'published') return 'posted';

  const lower = filename.toLowerCase();
  if (lower.includes('-menu') || lower.includes('-pull')) return 'pulled';
  if (lower.includes('-final') || lower.includes('clearance')) return 'clearance';
  if (lower.includes('-draft') || lower.includes('-alert-') || body.toLowerCase().includes('status: draft')) {
    return 'drafted';
  }
  return 'pulled';
}

function extractFirstUrl(raw: string): string | undefined {
  const match = raw.match(/https?:\/\/[^\s)>"',]+/i);
  if (!match?.[0]) return undefined;
  try {
    const u = new URL(match[0]);
    if (u.protocol === 'https:' || u.protocol === 'http:') {
      return u.toString().slice(0, 400);
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function humanizeFilename(filename: string): string {
  const stem = filename.replace(/^.*[\\/]/, '').replace(/\.[^.]+$/, '');
  const cleaned = stem
    .replace(/^(Sovereign|Marley|CheatCode|Cheat-Code|Glitch|Pixel|Bastion|Cortex|Gemini|Splicer|Antigravity)-/i, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  if (!cleaned) return stem.slice(0, 120) || 'Untitled Drop';
  return cleaned.replace(/\b([a-z])/g, (_, ch: string) => ch.toUpperCase()).slice(0, 120);
}

function parseYamlFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const normalized = raw.replace(/\r\n/g, '\n').trim();
  const meta: Record<string, string> = {};
  if (!normalized.startsWith('---\n')) {
    return { meta, body: normalized };
  }
  const endIdx = normalized.indexOf('\n---\n', 4);
  if (endIdx === -1) {
    return { meta, body: normalized };
  }
  const block = normalized.slice(4, endIdx);
  const body = normalized.slice(endIdx + 5).trim();
  for (const line of block.split('\n')) {
    const colon = line.indexOf(':');
    if (colon <= 0) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    if (key && val) meta[key] = val;
  }
  return { meta, body };
}

function extractFlags(body: string): string[] {
  const flags: string[] = [];
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    if (/^(-\s*)?(\*\*)?(FLAG|Flags?|Note|UPDATE|WORDING)(\*\*)?:/i.test(trimmed) || trimmed.includes('[UNVERIFIED]')) {
      const cleaned = trimmed.replace(/^-\s*/, '').replace(/\*\*/g, '').trim().slice(0, 200);
      if (cleaned) flags.push(cleaned);
    }
    if (flags.length >= 6) break;
  }
  return flags;
}

export function isClearanceFilename(filename: string): boolean {
  const lower = filename.toLowerCase();
  return lower.includes('clearance') && !lower.includes('command-center');
}

export function parseDropMarkdown(
  raw: string,
  options?: { filename?: string; clientId?: string; jobDate?: string }
): ParsedDropDocument {
  const filename = options?.filename?.trim() || 'drop.md';
  const { meta, body: initialBody } = parseYamlFrontmatter(raw);
  let body = initialBody;

  let headingTitle = '';
  const headingMatch = body.match(/^#\s+(.+)$/m);
  if (headingMatch?.[1]) {
    headingTitle = headingMatch[1].trim();
    body = body.replace(/^#\s+.+\n?/, '').trim();
  }

  const clientId = (meta.client || meta.clientid || options?.clientId || 'rottym')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '') || 'rottym';

  const lane = normalizeLane(meta.lane || meta.channel, filename);
  const channel = laneToChannel(lane);
  const stage = normalizeStage(meta.stage, filename, body);
  const agentId = inferAgentId(meta.agent || meta.bot, filename);
  const title = (meta.title || headingTitle || humanizeFilename(filename)).slice(0, 120);

  const candidateUrl = meta.url || meta.source_url || meta.sourceurl || meta.link;
  const sourceUrl = candidateUrl ? extractFirstUrl(candidateUrl) : extractFirstUrl(body);
  const flaggedNotes = extractFlags(body);
  const sourceUrlMissing = !sourceUrl;
  if (sourceUrlMissing) {
    flaggedNotes.unshift('FLAG: Missing verified source URL — required before clearance.');
  }

  const lower = filename.toLowerCase();
  const contentType: ContentKind =
    meta.type === 'image' || lower.match(/\.(png|jpe?g|webp|gif)$/)
      ? 'image'
      : meta.type === 'article' || lane === 'article' || lower.includes('article')
        ? 'article'
        : meta.type === 'pull' || stage === 'pulled' || lower.includes('-menu') || lower.includes('-pull')
          ? 'pull'
          : 'post';

  const statusTag = (meta.status || (stage === 'drafted' ? 'draft' : 'pending')).toLowerCase();
  const marleyStatus: 'pending' | 'approved' | 'rejected' =
    statusTag === 'verified' || statusTag === 'cleared' || statusTag === 'approved'
      ? 'approved'
      : statusTag === 'rejected' || statusTag === 'flagged'
        ? 'rejected'
        : 'pending';

  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  const jobDate = meta.date || options?.jobDate || dateMatch?.[1] || todayDateTag();

  return {
    clientId,
    title,
    lane,
    channel,
    contentType,
    stage,
    agentId,
    source: (meta.source || filename.split('-')[0] || 'Drive Drop').slice(0, 80),
    sourceUrl,
    sourceUrlMissing,
    statusTag,
    marleyStatus,
    readyForRotty: false, // Never auto-ready from a bot drop; Rotty's explicit approval sets this
    draftCopy: body.replace(/^---$/gm, '').trim().slice(0, 2400),
    flaggedNotes: flaggedNotes.slice(0, 6),
    assetFile: meta.asset_file || meta.assetfile || meta.image,
    assetSpec: meta.asset || meta.asset_spec || meta.format,
    jobDate,
    sourceFile: filename,
  };
}

/**
 * Parses Marley's batch clearance files:
 * 1) Supports an optional fixed top verdict block (`<!-- VERDICTS ... -->` or `## Verdicts` / YAML verdicts)
 * 2) Falls back seamlessly to Marley's live prose sections (`### 1. Title — NEW · VERIFIED`).
 */
export function parseBatchClearanceMarkdown(raw: string, filename = 'clearance.md'): ParsedClearanceVerdict[] {
  const normalized = raw.replace(/\r\n/g, '\n').trim();
  const { meta, body } = parseYamlFrontmatter(normalized);
  const clearsFile = meta.clears || (body.match(/^Clears:\s*([^\s(]+)/m)?.[1] ?? undefined);

  const verdicts: ParsedClearanceVerdict[] = [];

  // 1. Check optional compact top verdict block:
  // Format: `- [VERIFIED|NEW] Title | lane: x | url: https://... | flags: ...`
  const verdictBlockMatch = body.match(/```verdicts\s*\n([\s\S]*?)```/i);
  if (verdictBlockMatch?.[1]) {
    for (const line of verdictBlockMatch[1].split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('-')) continue;
      const parts = trimmed.slice(1).split('|').map((p) => p.trim());
      const head = parts[0] || '';
      const tagMatch = head.match(/^\[(VERIFIED|NEW|FOLLOW-UP|HOLD|REJECTED|FLAGGED)(?:\/([A-Z-]+))?\]\s*(.+)$/i);
      const rawStatus = (tagMatch?.[1] || 'NEW').toUpperCase();
      const rawTag = (tagMatch?.[2] || rawStatus).toUpperCase();
      const title = (tagMatch?.[3] || head).slice(0, 120);

      let lane: PipelineLane = 'x';
      let sourceUrl: string | undefined;
      const discrepancies: string[] = [];
      const artifactsNeeded: string[] = [];
      let notes = '';

      for (const part of parts.slice(1)) {
        const idx = part.indexOf(':');
        if (idx <= 0) continue;
        const k = part.slice(0, idx).trim().toLowerCase();
        const v = part.slice(idx + 1).trim();
        if (k === 'lane' || k === 'channel') lane = normalizeLane(v);
        else if (k === 'url' || k === 'source') sourceUrl = extractFirstUrl(v);
        else if (k === 'flags' || k === 'discrepancies') {
          if (v && v.toLowerCase() !== 'none') discrepancies.push(v.slice(0, 160));
        } else if (k === 'artifacts') {
          if (v && v.toLowerCase() !== 'none') artifactsNeeded.push(v.slice(0, 160));
        } else if (k === 'note' || k === 'notes') {
          notes = v.slice(0, 300);
        }
      }

      const verdict: 'approved' | 'rejected' | 'pending' =
        rawStatus === 'REJECTED'
          ? 'rejected'
          : rawStatus === 'HOLD' || rawStatus === 'FLAGGED'
            ? 'pending'
            : 'approved';

      const tag: ParsedClearanceVerdict['tag'] =
        rawTag === 'FOLLOW-UP'
          ? 'FOLLOW-UP'
          : rawTag === 'HOLD'
            ? 'HOLD'
            : rawTag === 'REJECTED'
              ? 'REJECTED'
              : 'NEW';

      verdicts.push({
        title,
        lane,
        channel: laneToChannel(lane),
        verdict,
        tag,
        notes: notes || `Marley verdict from ${filename}`,
        discrepancies,
        artifactsNeeded,
        sourceUrl,
        clearsFile,
      });
    }
    if (verdicts.length > 0) return verdicts;
  }

  // 2. Parse Marley's standard batch markdown (`## Lane` + `### N. Title — TAG · VERIFIED`)
  const lines = body.split('\n');
  let currentLane: PipelineLane = 'x';
  let currentItem: ParsedClearanceVerdict | null = null;
  const bodyBuffer: string[] = [];

  const flush = () => {
    if (!currentItem) return;
    const summary = bodyBuffer.join(' ').replace(/\s+/g, ' ').trim();
    if (!currentItem.notes && summary) {
      currentItem.notes = summary.slice(0, 280);
    }
    if (!currentItem.sourceUrl) {
      currentItem.sourceUrl = extractFirstUrl(summary);
    }
    verdicts.push(currentItem);
    currentItem = null;
    bodyBuffer.length = 0;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      flush();
      const heading = trimmed.slice(3);
      if (/facebook|instagram|fb\s*\/\s*ig|meta/i.test(heading)) currentLane = 'fb-ig';
      else if (/linkedin/i.test(heading) && !/x\s*\/\s*linkedin/i.test(heading)) currentLane = 'linkedin';
      else if (/article/i.test(heading)) currentLane = 'article';
      else currentLane = 'x';
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flush();
      const rawHeader = trimmed.slice(4).trim();
      const withoutNum = rawHeader.replace(/^\d+\.\s*/, '');
      const [rawTitle, rawMeta = ''] = withoutNum.split(/\s+[—–-]\s+/, 2);
      const title = rawTitle.trim().slice(0, 120);
      const upperMeta = rawMeta.toUpperCase();

      const tag: ParsedClearanceVerdict['tag'] = upperMeta.includes('FOLLOW-UP')
        ? 'FOLLOW-UP'
        : upperMeta.includes('REJECT')
          ? 'REJECTED'
          : upperMeta.includes('HOLD')
            ? 'HOLD'
            : 'NEW';

      const verdict: ParsedClearanceVerdict['verdict'] = upperMeta.includes('REJECT')
        ? 'rejected'
        : upperMeta.includes('VERIFIED') || upperMeta.includes('CLEARED') || upperMeta.includes('APPROVED')
          ? 'approved'
          : 'pending';

      currentItem = {
        title,
        lane: currentLane,
        channel: laneToChannel(currentLane),
        verdict,
        tag,
        notes: '',
        discrepancies: [],
        artifactsNeeded: [],
        clearsFile,
      };
      continue;
    }

    if (!currentItem || !trimmed || trimmed === '---') continue;

    if (/^-\s*(FLAG|UPDATE|WORDING|NOTE)\b/i.test(trimmed)) {
      const cleaned = trimmed.replace(/^-\s*/, '').trim().slice(0, 180);
      if (/photo|image|cover|screenshot/i.test(cleaned) && /needed|missing|required|pending|awaiting/i.test(cleaned)) {
        currentItem.artifactsNeeded.push(cleaned);
      } else {
        currentItem.discrepancies.push(cleaned);
      }
    } else {
      bodyBuffer.push(trimmed);
    }
  }

  flush();
  return verdicts;
}

export function parseAdminPasteBlock(raw: string, clientId = 'rottym'): ParsedPasteCommand {
  const text = raw.replace(/\r\n/g, '\n').trim();
  const { meta, body } = parseYamlFrontmatter(text);

  const kindHint = (meta.kind || meta.type || '').toLowerCase();
  if (kindHint === 'crew' || (!text.startsWith('#') && /\bagent\s*:/.test(text) && /\bstatus\s*:/.test(text) && !/\btitle\s*:/.test(text))) {
    const kv = Object.keys(meta).length > 0 ? meta : parseKeyValueLines(text);
    const statusRaw = (kv.status || 'active').toLowerCase();
    const status: AgentStatus =
      statusRaw === 'stand_down' || statusRaw === 'stand-down'
        ? 'stand_down'
        : statusRaw === 'on_hold' || statusRaw === 'hold'
          ? 'on_hold'
          : statusRaw === 'out' || statusRaw === 'offline'
            ? 'out'
            : statusRaw === 'on_call' || statusRaw === 'on-call'
              ? 'on_call'
              : 'active';
    const pct = kv.usage || kv.usagepct ? Number(kv.usage || kv.usagepct) : undefined;
    return {
      kind: 'crew',
      crewUpdate: {
        agentId: inferAgentId(kv.agent || kv.bot || kv.id),
        status,
        statusNote: kv.note || kv.statusnote || kv.status_note,
        usagePct: Number.isFinite(pct) ? pct : undefined,
        resetNote: kv.reset || kv.resetnote || kv.reset_note,
      },
    };
  }

  if (kindHint === 'gate' || (/\bgate\s*:/.test(text.toLowerCase()) && /\bstate\s*:/.test(text.toLowerCase()))) {
    const kv = Object.keys(meta).length > 0 ? meta : parseKeyValueLines(text);
    const stateRaw = (kv.state || 'hold').toLowerCase();
    const state: GateState =
      stateRaw === 'blocked'
        ? 'blocked'
        : stateRaw === 'awaiting'
          ? 'awaiting'
          : stateRaw === 'resolved'
            ? 'resolved'
            : 'hold';
    return {
      kind: 'gate',
      gateUpdate: {
        label: (kv.gate || kv.label || kv.title || 'Operational Gate').slice(0, 120),
        state,
        detail: (kv.detail || kv.note || body || '').slice(0, 300),
        since: (kv.since || todayDateTag()).slice(0, 40),
      },
    };
  }

  if (kindHint === 'metrics' || /\bsessions\s*:/.test(text.toLowerCase()) || /\bx_followers\s*:/.test(text.toLowerCase())) {
    const kv = Object.keys(meta).length > 0 ? meta : parseKeyValueLines(text);
    const toNum = (v?: string) => (v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : undefined);
    return {
      kind: 'metrics',
      metricsUpdate: {
        sessions: toNum(kv.sessions),
        sessionsPeriod: kv.sessions_period || kv.period,
        generateLead: toNum(kv.generate_lead || kv.leads),
        xFollowers: toNum(kv.x_followers || kv.followers),
        asOf: kv.as_of || kv.asof || todayDateTag(),
        showroomPhase: kv.showroom_phase,
        showroomNote: kv.showroom_note,
      },
    };
  }

  if (
    /```verdicts/i.test(text) ||
    /###\s+\d+\.\s+.+[—–-]\s+(NEW|FOLLOW-UP|VERIFIED|HOLD|REJECTED)/i.test(text) ||
    /^#\s+Marley\s+[—–-]\s+.*Clearance/im.test(text)
  ) {
    return {
      kind: 'clearance',
      clearance: parseBatchClearanceMarkdown(text, 'pasted-clearance.md'),
    };
  }

  const multiItems = parseMultiItemDeskList(text, clientId);
  if (multiItems.length > 1) {
    return {
      kind: 'desk_list',
      deskList: multiItems,
    };
  }

  return {
    kind: 'drop',
    drop: parseDropMarkdown(text, { filename: meta.filename || 'pasted-drop.md', clientId }),
  };
}

/**
 * Splits a raw numbered or bulleted list pasted from Gemini, Grok, or any chat window
 * into individual pulled items ready for Marley clearance.
 */
export function parseMultiItemDeskList(
  raw: string,
  clientId = 'rottym',
  defaultLane?: PipelineLane
): ParsedDropDocument[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const chunks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const isItemStart = /^\s*(?:\d+[.)]|[-*•])\s+\S+/.test(line);
    if (isItemStart && current.length > 0) {
      chunks.push(current.join('\n').trim());
      current = [line];
    } else if (line.trim() || current.length > 0) {
      current.push(line);
    }
  }
  if (current.length > 0) {
    const tail = current.join('\n').trim();
    if (tail) chunks.push(tail);
  }

  if (chunks.length <= 1) return [];

  const today = todayDateTag();
  return chunks.map((chunk, idx) => {
    const stripped = chunk.replace(/^\s*(?:\d+[.)]|[-*•])\s+/, '').trim();
    const firstLine = stripped.split('\n')[0] || `Item ${idx + 1}`;
    const url = extractFirstUrl(stripped);
    const titlePart = firstLine
      .replace(/https?:\/\/[^\s)>"',]+/gi, '')
      .replace(/^\*\*|\*\*$/g, '')
      .replace(/\s+[—–-]\s*$/, '')
      .trim()
      .slice(0, 120);

    const lane = defaultLane || normalizeLane(stripped);
    return {
      clientId,
      title: titlePart || `Desk Item ${idx + 1}`,
      lane,
      channel: laneToChannel(lane),
      contentType: 'pull',
      stage: 'pulled',
      agentId: 'marley',
      source: 'Desk quick-paste list',
      sourceUrl: url,
      sourceUrlMissing: !url,
      statusTag: 'pending',
      marleyStatus: 'pending',
      readyForRotty: false,
      draftCopy: stripped.slice(0, 2400),
      flaggedNotes: url ? [] : ['FLAG: Missing verified source URL — required before clearance.'],
      jobDate: today,
      sourceFile: `desk-list-${today}-${idx + 1}.md`,
    };
  });
}

function parseKeyValueLines(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const k = line.slice(0, idx).trim().toLowerCase();
    const v = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (k && v) out[k] = v;
  }
  return out;
}

export function cleanBotStringList(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    .map((entry) => entry.trim().slice(0, 140))
    .slice(0, 8);
}

export function sanitizeAvatarUrl(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const trimmed = raw.trim();
  if (/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed.length <= 65536 ? trimmed : undefined;
  }
  try {
    const u = new URL(trimmed);
    if (u.protocol === 'https:' || u.protocol === 'http:') {
      return u.toString().slice(0, 600);
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function resolveAvatarRenderUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveFileMatch) {
    return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w256`;
  }
  const driveOpenMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/i);
  if (driveOpenMatch) {
    return `https://drive.google.com/thumbnail?id=${driveOpenMatch[1]}&sz=w256`;
  }
  return trimmed;
}

export function syncVisualArtifactsNeeded(
  baseArtifacts: string[] | undefined,
  explicitArtifacts: string[] | undefined,
  assetSpec: string | undefined,
  hasVisualAsset: boolean
): string[] | undefined {
  if (explicitArtifacts !== undefined) {
    return explicitArtifacts.length > 0 ? explicitArtifacts : undefined;
  }
  const current = baseArtifacts || [];
  if (hasVisualAsset) {
    const cleaned = current.filter(
      (entry) => !/^Visual needed\b/i.test(entry) && !/^Awaiting Pixel\b/i.test(entry)
    );
    return cleaned.length > 0 ? cleaned : undefined;
  }
  if (!assetSpec) {
    return current.length > 0 ? current : undefined;
  }
  const alreadyListed = current.some(
    (entry) =>
      entry.toLowerCase().includes(assetSpec.toLowerCase()) ||
      /\b(visual|cover|image|graphic)\b/i.test(entry)
  );
  if (alreadyListed) return current;
  return [...current, `Visual needed (${assetSpec})`];
}
