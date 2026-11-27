import type {
  AgentStatus,
  CardAssetState,
  ChannelId,
  ConnectorAlert,
  ConnectorAlertStatus,
  ContentKind,
  GateState,
  JobAsset,
  JobAssetKind,
  JobAssetPlatform,
  JobAssetStatus,
  MarleyVerdictTag,
  OpsRequest,
  PhotoStatus,
  PipelineCard,
  PipelineLane,
  PipelineLinks,
  PipelineStage,
  PlatformKey,
  PostFormat,
  RequestActionOption,
  RequestStatus,
  RequestUrgency,
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
  note?: string;
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
  if (v.startsWith('bassline') || v === 'bassline') return 'bassline';
  if (v.startsWith('turbo') || v === 'turbo') return 'turbo';
  if (v.startsWith('glitch') || v === 'glitch') return 'glitch';
  if (v.startsWith('bastion') || v === 'bastion') return 'bastion';
  if (v.startsWith('cortex') || v === 'cortex') return 'cortex';
  if (v.startsWith('gemini') || v === 'gemini-watch') return 'gemini-watch';
  if (v.startsWith('splicer') || v === 'splicer') return 'splicer';
  if (v.startsWith('antigravity') || v === 'antigravity') return 'antigravity';
  if (!v) return 'cheat-code';
  const slug = v
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]+/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || 'cheat-code';
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
    .replace(/^(Sovereign|Marley|CheatCode|Cheat-Code|Bassline|Turbo|Glitch|Pixel|Bastion|Cortex|Gemini|Splicer|Antigravity)-/i, '')
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
          notes = v.slice(0, 1200);
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

export function parseAdminPasteBlock(
  raw: string,
  clientId = 'rottym',
  defaultLane?: PipelineLane
): ParsedPasteCommand {
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

  const multiItems = parseMultiItemDeskList(text, clientId, defaultLane);
  const categoryCardCount = (text.match(/^\s*(?:[-*•]\s+)?Category\s*:\s*\S+/gim) || []).length;
  if (
    multiItems.length > 1 ||
    (multiItems.length === 1 &&
      (/^\s*(?:\d+[.)]|#{1,4}\s+)/m.test(text) || categoryCardCount >= 1))
  ) {
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

export function cleanDeskUrl(rawUrl: string): string | undefined {
  const trimmed = rawUrl.trim().replace(/[.,;:!?)'"\]]+$/, '');
  if (!trimmed) return undefined;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return undefined;
    if (u.hostname.toLowerCase() === 'images.openai.com') return undefined;
    if (u.searchParams.get('utm_source') === 'chatgpt.com') {
      u.searchParams.delete('utm_source');
    }
    return u.toString().slice(0, FIELD_MAX_LENGTHS.sourceUrl);
  } catch {
    return undefined;
  }
}

function isCarouselOrBadgeNoise(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (/^\d{1,3}$/.test(t)) return true;
  if (/^[↗↘↗️•|]+$/.test(t)) return true;
  if (/^!\[[^\]]*\]\(https?:\/\/[^)]+\)$/i.test(t)) return true;
  if (/^\[[^\]]+\]\(https?:\/\/images\.openai\.com\/[^)]+\)$/i.test(t)) return true;
  if (/^\[[^\]]+\]\(https?:\/\/[^)]*[?&]purpose=inline[^)]*\)$/i.test(t)) return true;
  return false;
}

function extractFirstValidDeskLink(raw: string): { label?: string; url?: string } {
  const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = mdRegex.exec(raw)) !== null) {
    const url = cleanDeskUrl(m[2]);
    if (url) {
      return {
        label: m[1].replace(/\s*↗\s*/g, '').trim(),
        url,
      };
    }
  }
  const urlRegex = /https?:\/\/[^\s)>"',]+/gi;
  while ((m = urlRegex.exec(raw)) !== null) {
    const url = cleanDeskUrl(m[0]);
    if (url) return { url };
  }
  return {};
}

function stripMarkdownLinksToText(raw: string): string {
  return raw
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi, '$1')
    .replace(/https?:\/\/[^\s)>"',]+/gi, '')
    .replace(/\s*↗\s*/g, ' ')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isMetadataDebrisTitle(title: string): boolean {
  const clean = title.trim();
  if (!clean) return true;
  if (/^\d{1,3}$/.test(clean)) return true;
  if (/^(?:date|source|published|updated|category|topic|link|url|credit|tags?|note|summary|angle|why)\s*:/i.test(clean)) {
    return true;
  }
  return false;
}

function parseCategoryCardDeskList(
  lines: string[],
  clientId: string,
  defaultLane?: PipelineLane
): ParsedDropDocument[] {
  const nonEmpty = lines.map((l) => l.trim()).filter(Boolean);
  const catIndices: number[] = [];
  for (let i = 0; i < nonEmpty.length; i++) {
    if (/^(?:[-*•]\s+)?category\s*:\s*\S+/i.test(nonEmpty[i])) {
      catIndices.push(i);
    }
  }
  if (catIndices.length === 0) return [];

  const isBadgeLine = (s: string) =>
    /^\d{1,2}\s*[·•-]\s+[A-Za-z]/.test(s) && s.split(/\s+/).length <= 8;
  const isTrailingEditorialStop = (s: string) =>
    /^(?:my\s+editorial\s+recommendation|editorial\s+recommendation|editorial\s+pillar|one\s+strategic\s+suggestion\s*:|these\s+are\s+my\s+strongest)/i.test(
      s
    );
  const isChipDuplicate = (chip: string, sourceLabel: string) => {
    const cleanChip = stripMarkdownLinksToText(chip)
      .toLowerCase()
      .replace(/[….\s]+$/g, '')
      .replace(/[^a-z0-9]+/g, '');
    const cleanSrc = sourceLabel.toLowerCase().replace(/[^a-z0-9]+/g, '');
    if (!cleanChip || chip.length > 48) return false;
    if (cleanSrc && (cleanSrc.startsWith(cleanChip) || cleanChip.startsWith(cleanSrc.slice(0, 6)))) {
      return true;
    }
    return false;
  };

  // Locate each card's start index (optional badge + headline right above Category:)
  const cardBounds = catIndices.map((catIdx, cardPos) => {
    const minSearch = cardPos === 0 ? 0 : catIndices[cardPos - 1] + 1;
    let titleIdx = catIdx - 1;
    while (titleIdx >= minSearch && isBadgeLine(nonEmpty[titleIdx])) {
      titleIdx -= 1;
    }
    if (titleIdx < minSearch) titleIdx = catIdx - 1;
    let startIdx = titleIdx;
    let badgeNote = '';
    if (titleIdx - 1 >= minSearch && isBadgeLine(nonEmpty[titleIdx - 1])) {
      badgeNote = nonEmpty[titleIdx - 1];
      startIdx = titleIdx - 1;
    }
    return { startIdx: Math.max(0, startIdx), titleIdx: Math.max(0, titleIdx), catIdx, badgeNote };
  });

  const today = todayDateTag();
  const results: ParsedDropDocument[] = [];

  for (let k = 0; k < cardBounds.length; k++) {
    const { titleIdx, catIdx, badgeNote } = cardBounds[k];
    const nextStartIdx = k + 1 < cardBounds.length ? cardBounds[k + 1].startIdx : nonEmpty.length;

    const rawTitle = nonEmpty[titleIdx] || `Desk Item ${k + 1}`;
    const headerLink = extractFirstValidDeskLink(rawTitle);
    const cleanedTitle = stripMarkdownLinksToText(rawTitle)
      .replace(/^\d+[.)]\s+/, '')
      .replace(/\s+[—–-]\s*$/, '')
      .slice(0, 120);
    if (!cleanedTitle || isMetadataDebrisTitle(cleanedTitle)) continue;

    const category = nonEmpty[catIdx].replace(/^(?:[-*•]\s+)?category\s*:\s*/i, '').trim().slice(0, 80);

    let dateText = '';
    let sourceLabel = '';
    let sourceUrl = headerLink.url;
    const summaryLines: string[] = [];
    let sawSource = false;

    for (let j = catIdx + 1; j < nextStartIdx; j++) {
      const cleanLine = nonEmpty[j].replace(/^\s*[-*•]\s+/, '').trim();
      if (!cleanLine) continue;
      if (isTrailingEditorialStop(cleanLine)) break;

      if (sawSource) {
        const chipLink = extractFirstValidDeskLink(cleanLine);
        if (chipLink.url && !sourceUrl) {
          sourceUrl = chipLink.url;
          if (!sourceLabel && chipLink.label && !/[…]$/.test(chipLink.label)) {
            sourceLabel = chipLink.label.slice(0, FIELD_MAX_LENGTHS.source);
          }
          continue;
        }
        if (isChipDuplicate(cleanLine, sourceLabel) || (chipLink.url && cleanLine.length <= 48)) {
          continue;
        }
        // Any remaining prose after the last card's source pill belongs to trailing commentary
        if (k === cardBounds.length - 1) break;
      }

      const dateMatch = cleanLine.match(/^(?:date|published)\s*:\s*(.+)$/i);
      if (dateMatch) {
        dateText = stripMarkdownLinksToText(dateMatch[1]).slice(0, 80);
        continue;
      }

      const sourceMatch = cleanLine.match(/^source\s*:\s*(.+)$/i);
      if (sourceMatch) {
        sawSource = true;
        const srcLink = extractFirstValidDeskLink(sourceMatch[1]);
        if (srcLink.url) sourceUrl = srcLink.url;
        const rawSrcText = stripMarkdownLinksToText(sourceMatch[1]).replace(/[·.\s]+$/g, '').trim();
        const parts = rawSrcText.split(/\s*·\s*/).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2 && !parts[0].startsWith('http')) {
          sourceLabel = parts[0].slice(0, FIELD_MAX_LENGTHS.source);
          if (!dateText) dateText = parts.slice(1).join(' · ').slice(0, 80);
        } else {
          const lbl = (srcLink.label || rawSrcText).replace(/[.\s]+$/, '').trim();
          if (lbl) sourceLabel = lbl.slice(0, FIELD_MAX_LENGTHS.source);
        }
        continue;
      }

      const lineLink = extractFirstValidDeskLink(cleanLine);
      if (!sourceUrl && lineLink.url) sourceUrl = lineLink.url;
      const cleanedSummary = cleanLine
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi, '$1')
        .replace(/\s*↗\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanedSummary) summaryLines.push(cleanedSummary);
    }

    const noteParts = [
      category ? `Category: ${category}` : '',
      dateText ? `Date: ${dateText}` : '',
      badgeNote ? `Tag: ${badgeNote}` : '',
    ].filter(Boolean);
    const note = noteParts.length > 0 ? noteParts.join(' · ').slice(0, FIELD_MAX_LENGTHS.note) : undefined;
    const draftCopy = (summaryLines.join(' ').replace(/\s+/g, ' ').trim() || cleanedTitle).slice(0, 2400);
    const lane = defaultLane || normalizeLane(`${category}\n${cleanedTitle}\n${draftCopy}`);
    const cardIdx = results.length + 1;

    results.push({
      clientId,
      title: cleanedTitle,
      lane,
      channel: laneToChannel(lane),
      contentType: 'pull',
      stage: 'pulled',
      agentId: 'marley',
      source: sourceLabel || 'Desk quick-paste list',
      sourceUrl,
      sourceUrlMissing: !sourceUrl,
      note,
      statusTag: 'pending',
      marleyStatus: 'pending',
      readyForRotty: false,
      draftCopy,
      flaggedNotes: sourceUrl
        ? []
        : ['FLAG: Missing verified source URL — required before clearance.'],
      jobDate: today,
      sourceFile: `desk-list-${today}-${cardIdx}.md`,
    });
  }

  return results;
}

/**
 * Splits a raw numbered or bulleted list pasted from Gemini, Grok, ChatGPT, or any chat window
 * into individual pulled items ready for Marley clearance, keeping sub-bullets (`Date:`,
 * summary sentences, `Source:`) nested under each headline and ignoring section headers
 * or image-carousel noise.
 */
export function parseMultiItemDeskList(
  raw: string,
  clientId = 'rottym',
  defaultLane?: PipelineLane
): ParsedDropDocument[] {
  const rawLines = raw.replace(/\r\n/g, '\n').split('\n');
  const lines = rawLines.filter((l) => !isCarouselOrBadgeNoise(l));

  const numberedLineCount = lines.filter((l) => /^\s*\d+[.)]\s+\S+/.test(l)).length;
  const hasNumberedHierarchy = numberedLineCount >= 2;
  const categoryLineCount = lines.filter((l) =>
    /^\s*(?:[-*•]\s+)?Category\s*:\s*\S+/i.test(l)
  ).length;
  if (!hasNumberedHierarchy && categoryLineCount >= 2) {
    const cardResults = parseCategoryCardDeskList(lines, clientId, defaultLane);
    if (cardResults.length > 0) return cardResults;
  }
  const isMetadataLine = (line: string) =>
    /^\s*(?:[-*•]\s+)?(?:date|source|published|updated|category|summary|why|note|angle|link|url)\s*:/i.test(
      line
    );

  interface RawDeskBlock {
    kind: 'heading' | 'item';
    numStr?: string;
    numVal?: number;
    headerText: string;
    bodyLines: string[];
  }

  const blocks: RawDeskBlock[] = [];
  let activeItem: RawDeskBlock | null = null;

  const pushActive = () => {
    if (activeItem) {
      blocks.push(activeItem);
      activeItem = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const mdHeading = trimmed.match(/^#{1,4}\s+(.+)$/);
    if (mdHeading) {
      pushActive();
      const headingClean = mdHeading[1].replace(/^\d+[.)]\s+/, '').replace(/\*\*/g, '').trim();
      if (headingClean) {
        blocks.push({ kind: 'heading', headerText: headingClean, bodyLines: [] });
      }
      continue;
    }

    const numberedMatch = line.match(/^\s*(\d+)[.)]\s+(.+)$/);
    if (numberedMatch) {
      pushActive();
      activeItem = {
        kind: 'item',
        numStr: numberedMatch[1],
        numVal: Number(numberedMatch[1]),
        headerText: numberedMatch[2].trim(),
        bodyLines: [],
      };
      continue;
    }

    if (!hasNumberedHierarchy) {
      const bulletMatch = line.match(/^\s*[-*•]\s+(.+)$/);
      if (bulletMatch && !isMetadataLine(line)) {
        pushActive();
        activeItem = {
          kind: 'item',
          headerText: bulletMatch[1].trim(),
          bodyLines: [],
        };
        continue;
      }
    }

    if (activeItem) {
      const prevEndedWithSource =
        activeItem.bodyLines.length > 0 &&
        /^\s*(?:[-*•]\s+)?source\s*:/i.test(activeItem.bodyLines[activeItem.bodyLines.length - 1]);
      const looksLikePlainCategoryHeading =
        prevEndedWithSource &&
        !isMetadataLine(trimmed) &&
        !cleanDeskUrl(trimmed) &&
        !/[.!?]$/.test(trimmed) &&
        trimmed.split(/\s+/).length <= 5;
      if (looksLikePlainCategoryHeading) {
        pushActive();
        const headingClean = trimmed.replace(/\*\*/g, '').replace(/^\d+[.)]\s+/, '').trim();
        if (headingClean) {
          blocks.push({ kind: 'heading', headerText: headingClean, bodyLines: [] });
        }
      } else {
        activeItem.bodyLines.push(trimmed);
      }
    } else {
      // Top-level plain header before first numbered item (e.g., "Motorcycles" or "**Tattoos**")
      const plainHeading = trimmed.replace(/\*\*/g, '').replace(/^\d+[.)]\s+/, '').trim();
      if (plainHeading && plainHeading.split(/\s+/).length <= 6 && !cleanDeskUrl(plainHeading)) {
        blocks.push({ kind: 'heading', headerText: plainHeading, bodyLines: [] });
      }
    }
  }
  pushActive();

  const anyBlockHasBodyOrUrl = blocks.some(
    (b) =>
      b.kind === 'item' &&
      (b.bodyLines.length > 0 || Boolean(extractFirstValidDeskLink(b.headerText).url))
  );

  // Convert category headings (`01. Motorcycles` followed by `1. ...` or empty short labels)
  const itemBlocks = blocks.filter((b) => b.kind === 'item');
  const today = todayDateTag();
  let currentCategory = '';
  const results: ParsedDropDocument[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.kind === 'heading') {
      currentCategory = block.headerText.slice(0, 60);
      continue;
    }

    const nextItem = blocks.slice(i + 1).find((b) => b.kind === 'item');
    const headerLink = extractFirstValidDeskLink(block.headerText);
    const wordCount = stripMarkdownLinksToText(block.headerText).split(/\s+/).filter(Boolean).length;
    const isZeroPaddedHeader = Boolean(block.numStr && /^0\d+$/.test(block.numStr));
    const listResetsAfter = Boolean(
      nextItem &&
        block.numVal !== undefined &&
        nextItem.numVal !== undefined &&
        nextItem.numVal <= block.numVal
    );
    const hasStructuredMetadataInBody = block.bodyLines.some(
      (bl) =>
        isMetadataLine(bl) ||
        Boolean(extractFirstValidDeskLink(bl).url)
    );
    const looksLikeSectionHeader =
      !headerLink.url &&
      !hasStructuredMetadataInBody &&
      wordCount <= 6 &&
      ((block.bodyLines.length === 0 &&
        (isZeroPaddedHeader ||
          listResetsAfter ||
          (anyBlockHasBodyOrUrl && wordCount <= 5 && itemBlocks.length > 2))) ||
        ((isZeroPaddedHeader || listResetsAfter) && wordCount <= 5));

    if (looksLikeSectionHeader) {
      currentCategory = stripMarkdownLinksToText(block.headerText).slice(0, 60);
      continue;
    }

    const cleanedTitle = stripMarkdownLinksToText(block.headerText)
      .replace(/\s+[—–-]\s*$/, '')
      .slice(0, 120);

    if (isMetadataDebrisTitle(cleanedTitle)) {
      continue;
    }
    if (anyBlockHasBodyOrUrl && block.bodyLines.length === 0 && !headerLink.url && wordCount <= 2) {
      continue;
    }

    let dateText = '';
    let sourceLabel = '';
    let sourceUrl = headerLink.url;
    const summaryLines: string[] = [];

    for (const rawLine of block.bodyLines) {
      const cleanLine = rawLine.replace(/^\s*[-*•]\s+/, '').trim();
      if (!cleanLine) continue;

      const dateMatch = cleanLine.match(/^(?:date|published)\s*:\s*(.+)$/i);
      if (dateMatch) {
        dateText = stripMarkdownLinksToText(dateMatch[1]).slice(0, 80);
        continue;
      }

      const sourceMatch = cleanLine.match(/^source\s*:\s*(.+)$/i);
      if (sourceMatch) {
        const srcLink = extractFirstValidDeskLink(sourceMatch[1]);
        if (srcLink.url) sourceUrl = srcLink.url;
        const lbl = (srcLink.label || stripMarkdownLinksToText(sourceMatch[1]))
          .replace(/[.\s]+$/, '')
          .trim();
        if (lbl) sourceLabel = lbl.slice(0, FIELD_MAX_LENGTHS.source);
        continue;
      }

      const summaryMatch = cleanLine.match(/^(?:summary|note|why|angle)\s*:\s*(.+)$/i);
      const lineBody = summaryMatch ? summaryMatch[1].trim() : cleanLine;
      const lineLink = extractFirstValidDeskLink(lineBody);
      if (!sourceUrl && lineLink.url) sourceUrl = lineLink.url;
      const cleanedSummary = lineBody
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi, '$1')
        .replace(/\s*↗\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanedSummary) summaryLines.push(cleanedSummary);
    }

    const noteParts = [
      currentCategory ? `Category: ${currentCategory}` : '',
      dateText ? `Date: ${dateText}` : '',
    ].filter(Boolean);
    const note = noteParts.length > 0 ? noteParts.join(' · ').slice(0, FIELD_MAX_LENGTHS.note) : undefined;
    const draftCopy = (summaryLines.join('\n').trim() || cleanedTitle).slice(0, 2400);
    const lane = defaultLane || normalizeLane(`${currentCategory}\n${cleanedTitle}\n${draftCopy}`);
    const cardIdx = results.length + 1;

    results.push({
      clientId,
      title: cleanedTitle || `Desk Item ${cardIdx}`,
      lane,
      channel: laneToChannel(lane),
      contentType: 'pull',
      stage: 'pulled',
      agentId: 'marley',
      source: sourceLabel || 'Desk quick-paste list',
      sourceUrl,
      sourceUrlMissing: !sourceUrl,
      note,
      statusTag: 'pending',
      marleyStatus: 'pending',
      readyForRotty: false,
      draftCopy,
      flaggedNotes: sourceUrl
        ? []
        : ['FLAG: Missing verified source URL — required before clearance.'],
      jobDate: today,
      sourceFile: `desk-list-${today}-${cardIdx}.md`,
    });
  }

  return results;
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

export const FIELD_MAX_LENGTHS = {
  title: 160,
  note: 1200,
  draftCopy: 4000,
  source: 120,
  sourceUrl: 500,
  assetUrl: 500,
  assetFile: 240,
  assetSpec: 400,
  altText: 500,
  caption: 2400,
  credit: 200,
  label: 80,
  rejectionReason: 300,
  context: 300,
  preparedText: 4000,
  outcomeNote: 800,
} as const;

export function validateStringLength(
  field: string,
  value: unknown,
  maxLen: number
): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== 'string') {
    return { ok: false, error: `${field} must be a string.` };
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLen) {
    return {
      ok: false,
      error: `${field} is too long (${trimmed.length} chars; max ${maxLen}).`,
    };
  }
  return { ok: true, value: trimmed };
}

export function sanitizeWebOrBlobUrl(
  raw: unknown,
  maxLen = 500
): { ok: true; value: string | undefined } | { ok: false; error: string } {
  if (raw === null || raw === undefined) return { ok: true, value: undefined };
  if (typeof raw !== 'string') return { ok: false, error: 'URL must be a string.' };
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: undefined };
  if (trimmed.length > maxLen) {
    return { ok: false, error: `URL is too long (${trimmed.length} chars; max ${maxLen}).` };
  }
  if (trimmed.startsWith('/api/ops/asset-blob/')) {
    return { ok: true, value: trimmed };
  }
  try {
    const u = new URL(trimmed);
    if (u.protocol === 'https:' || u.protocol === 'http:') {
      return { ok: true, value: u.toString() };
    }
  } catch {
    return { ok: false, error: `Invalid URL: ${trimmed.slice(0, 60)}` };
  }
  return { ok: false, error: 'URL must use http(s):// or /api/ops/asset-blob/.' };
}

export function cleanBotStringList(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    .map((entry) => entry.trim().slice(0, 140))
    .slice(0, 12);
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

export function extractDriveFileId(raw?: string, allowBareId = false): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\//i.test(trimmed)) {
    return undefined;
  }
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/i);
  if (driveFileMatch) return driveFileMatch[1];
  const driveOpenMatch = trimmed.match(
    /(?:drive\.google\.com\/(?:open|uc|thumbnail)|drive\.usercontent\.google\.com\/download)\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/i
  );
  if (driveOpenMatch) return driveOpenMatch[1];
  const lh3Match = trimmed.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i);
  if (lh3Match) return lh3Match[1];
  if (allowBareId && /^[a-zA-Z0-9_-]{25,64}$/.test(trimmed)) {
    return trimmed;
  }
  return undefined;
}

export function resolveVisualPreviewUrl(raw?: string, maxWidth = 1200): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\//i.test(trimmed)) {
    return undefined;
  }
  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${maxWidth}`;
  }
  return trimmed;
}

export function resolveAvatarRenderUrl(raw?: string): string | undefined {
  return resolveVisualPreviewUrl(raw, 256);
}

export function extractChatMentions(text: string, explicit?: unknown): string[] | undefined {
  const found = new Set<string>();
  const addMention = (raw: string) => {
    const clean = raw.toLowerCase().replace(/[^a-z0-9_-]+/g, '').trim();
    if (!clean) return;
    if (clean === 'cheatcode' || clean === 'cheatcodes') {
      found.add('cheat-code');
      return;
    }
    found.add(clean);
  };

  for (const match of text.matchAll(/@([a-zA-Z0-9_-]{2,32})/g)) {
    addMention(match[1]);
  }
  if (typeof explicit === 'string') {
    for (const part of explicit.split(',')) addMention(part);
  } else if (Array.isArray(explicit)) {
    for (const item of explicit) {
      if (typeof item === 'string') addMention(item);
    }
  }
  return found.size > 0 ? Array.from(found).slice(0, 12) : undefined;
}

export function syncVisualArtifactsNeeded(
  baseArtifacts: string[] | undefined,
  explicitArtifacts: string[] | undefined,
  _assetSpec: string | undefined,
  hasVisualAsset: boolean
): string[] | undefined {
  if (explicitArtifacts !== undefined) {
    return explicitArtifacts;
  }
  if (baseArtifacts === undefined) {
    return undefined;
  }
  if (hasVisualAsset) {
    return baseArtifacts.filter(
      (entry) =>
        !/^Visual needed\b/i.test(entry) &&
        !/^Awaiting Pixel\b/i.test(entry) &&
        !/^(Photo missing|Photo needed|Image needed)\b/i.test(entry)
    );
  }
  return baseArtifacts;
}

export function refreshStaleCardNote(
  note: string | undefined,
  nextStage: PipelineStage
): string | undefined {
  if (!note) return undefined;
  if (nextStage !== 'approved' && nextStage !== 'posted') return note;
  let cleaned = note
    .replace(/\bNot posted,\s*not Ready\.?/gi, '')
    .replace(/\bNot posted\.?/gi, '')
    .replace(/\bnot Ready\.?/gi, '');
  if (nextStage === 'posted') {
    cleaned = cleaned.replace(/\bNeeds Marley review\.?/gi, '');
  }
  cleaned = cleaned.replace(/\s{2,}/g, ' ').replace(/^[·.\s-]+|[·\s-]+$/g, '').trim();
  return cleaned || undefined;
}

export function validateBotNoImageOverride(opts: {
  isUser: boolean;
  lane: PipelineLane;
  requestedNotNeeded: boolean;
  hasAssetsOrSpecs: boolean;
}): { ok: true } | { ok: false; status: number; error: string } {
  if (!opts.requestedNotNeeded) return { ok: true };
  if (opts.hasAssetsOrSpecs) {
    return {
      ok: false,
      status: 400,
      error: 'Cannot mark text-only ("No image needed") when assets, assetSpec, or artifactsNeeded are present.',
    };
  }
  if (!opts.isUser && opts.lane !== 'x' && opts.lane !== 'linkedin') {
    return {
      ok: false,
      status: 403,
      error: 'Only Rotty (authenticated /ops operator) can set "no image needed" on photo lanes (FB/IG, Articles).',
    };
  }
  return { ok: true };
}

const VALID_VERDICT_TAGS = new Set<MarleyVerdictTag>([
  'NEW',
  'FOLLOW-UP',
  'REPEAT',
  'SKIP',
  'HOLD',
  'REJECTED',
]);

const VALID_PHOTO_STATUSES = new Set<PhotoStatus>([
  'needed',
  'missing',
  'attached',
  'verified',
  'not_needed',
]);

export function findUnknownFields(
  obj: Record<string, unknown>,
  allowed: Set<string>
): string[] {
  return Object.keys(obj).filter((k) => !allowed.has(k));
}

export const POST_FORMAT_LABELS: Record<PostFormat, string> = {
  article: 'Article',
  article_linkedin: 'Article + LinkedIn',
  post_no_photo: 'Post (No Photo)',
  post_photo: 'Post + Photo',
  reply: 'Reply',
  reel: 'Reel',
  fb_ig: 'FB / IG',
  fb_only: 'FB Only',
  ig_only: 'IG Only',
};

export function normalizePostFormat(raw: unknown): PostFormat | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const clean = raw
    .trim()
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (clean === 'article') return 'article';
  if (clean === 'article_plus_linkedin' || clean === 'article_linkedin') return 'article_linkedin';
  if (clean === 'post_no_photo' || clean === 'no_photo' || clean === 'text_only' || clean === 'post_text') {
    return 'post_no_photo';
  }
  if (clean === 'post_plus_photo' || clean === 'post_photo' || clean === 'photo_post') {
    return 'post_photo';
  }
  if (clean === 'reply' || clean === 'x_reply') return 'reply';
  if (clean === 'reel' || clean === 'reels' || clean === 'video_reel') return 'reel';
  if (clean === 'fb_ig' || clean === 'fb_and_ig' || clean === 'meta') return 'fb_ig';
  if (clean === 'fb_only' || clean === 'fb' || clean === 'facebook_only') return 'fb_only';
  if (clean === 'ig_only' || clean === 'ig' || clean === 'instagram_only') return 'ig_only';
  return undefined;
}

export function getCardFormatBadges(
  card: Partial<PipelineCard>
): { primary: string; secondary?: string; inferred: boolean } {
  const assets = getCardAssets(card);
  const isNoPhoto =
    card.photoStatus === 'not_needed' &&
    assets.length === 0 &&
    !card.assetUrl?.trim() &&
    !card.assetFile?.trim();
  const isReel =
    assets.some((a) => a.kind === 'video') ||
    /\breel\b|9:16/i.test(`${card.assetSpec || ''} ${card.note || ''}`);

  if (card.postFormat && POST_FORMAT_LABELS[card.postFormat]) {
    const label = POST_FORMAT_LABELS[card.postFormat];
    const alreadyPhotoSpecific =
      card.postFormat === 'post_no_photo' ||
      card.postFormat === 'post_photo' ||
      card.postFormat === 'reel';
    return {
      primary: label,
      secondary: alreadyPhotoSpecific ? undefined : isNoPhoto ? 'No Photo' : '+ Photo',
      inferred: false,
    };
  }

  const title = card.title || '';
  const note = card.note || '';
  const tps = card.targetPlatforms || [];

  if (/^reply\s+to\b/i.test(title) || /\breply\b/i.test(note)) {
    return {
      primary: 'Reply',
      secondary: isNoPhoto ? 'No Photo' : '+ Photo',
      inferred: true,
    };
  }

  if (isReel) {
    const platPrefix =
      tps.length === 1 && tps[0] === 'ig'
        ? 'IG · '
        : tps.length === 1 && tps[0] === 'fb'
          ? 'FB · '
          : '';
    return {
      primary: `${platPrefix}Reel`,
      inferred: true,
    };
  }

  if (card.lane === 'article' || card.contentType === 'article') {
    const hasLi =
      tps.includes('linkedin') || /\b(article\s*\+\s*linkedin|\+\s*linkedin)\b/i.test(note);
    return {
      primary: hasLi ? 'Article + LinkedIn' : 'Article',
      secondary: isNoPhoto ? 'No Photo' : '+ Photo',
      inferred: true,
    };
  }

  if (tps.includes('fb') && tps.includes('ig')) {
    return { primary: 'FB / IG', secondary: isNoPhoto ? 'No Photo' : '+ Photo', inferred: true };
  }
  if (tps.length === 1 && tps[0] === 'fb') {
    return { primary: 'FB Only', secondary: isNoPhoto ? 'No Photo' : '+ Photo', inferred: true };
  }
  if (tps.length === 1 && tps[0] === 'ig') {
    return { primary: 'IG Only', secondary: isNoPhoto ? 'No Photo' : '+ Photo', inferred: true };
  }
  if (card.lane === 'fb-ig') {
    return { primary: 'FB / IG', secondary: isNoPhoto ? 'No Photo' : '+ Photo', inferred: true };
  }
  if (card.lane === 'linkedin') {
    return { primary: isNoPhoto ? 'Post (No Photo)' : 'Post + Photo', inferred: true };
  }

  return {
    primary: isNoPhoto ? 'Post (No Photo)' : 'Post + Photo',
    inferred: true,
  };
}

export function normalizeVerdictTag(raw: unknown): MarleyVerdictTag | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const upper = raw.trim().toUpperCase().replace(/\s+/g, '-');
  if (upper === 'FOLLOWUP') return 'FOLLOW-UP';
  return VALID_VERDICT_TAGS.has(upper as MarleyVerdictTag)
    ? (upper as MarleyVerdictTag)
    : undefined;
}

export function normalizeAssignedTo(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const clean = raw
    .trim()
    .replace(/^@+/, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]+/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  if (!clean || clean === 'none' || clean === 'unassigned' || clean === 'null') {
    return undefined;
  }
  if (clean === 'cheatcode' || clean === 'cheatcodes' || clean === 'cheat_code') {
    return 'cheat-code';
  }
  return clean;
}

export function normalizePlatformKey(raw: unknown): PlatformKey | undefined {
  if (typeof raw !== 'string') return undefined;
  const clean = raw.trim().toLowerCase();
  if (clean === 'fb' || clean === 'facebook') return 'fb';
  if (clean === 'ig' || clean === 'instagram') return 'ig';
  if (clean === 'linkedin' || clean === 'li') return 'linkedin';
  if (clean === 'x' || clean === 'twitter') return 'x';
  return undefined;
}

export function normalizePlatformList(raw: unknown): PlatformKey[] | undefined {
  const parts: string[] = [];
  if (typeof raw === 'string') {
    parts.push(...raw.split(/[,/+\s]+/));
  } else if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string') parts.push(...item.split(/[,/+\s]+/));
    }
  } else {
    return undefined;
  }

  const found = new Set<PlatformKey>();
  for (const part of parts) {
    const clean = part.trim().toLowerCase();
    if (!clean) continue;
    if (clean === 'fb-ig' || clean === 'meta') {
      found.add('fb');
      found.add('ig');
      continue;
    }
    const key = normalizePlatformKey(clean);
    if (key) found.add(key);
  }
  return found.size > 0 ? Array.from(found) : undefined;
}

export function getPendingPlatforms(
  targetPlatforms: PlatformKey[] | undefined,
  links: PipelineLinks | undefined
): PlatformKey[] {
  if (!targetPlatforms || targetPlatforms.length === 0) return [];
  return targetPlatforms.filter((p) => !links?.[p]);
}

export function formatPlatformShortLabel(platform: PlatformKey): string {
  return platform === 'linkedin' ? 'LI' : platform.toUpperCase();
}

export function formatCardPlatformBadge(
  card: Pick<PipelineCard, 'lane' | 'targetPlatforms'>
): string {
  if (card.targetPlatforms && card.targetPlatforms.length > 0) {
    if (
      card.targetPlatforms.length === 2 &&
      card.targetPlatforms.includes('fb') &&
      card.targetPlatforms.includes('ig')
    ) {
      return 'FB-IG';
    }
    return card.targetPlatforms.map(formatPlatformShortLabel).join(' + ');
  }
  return card.lane.toUpperCase();
}

export function normalizePhotoStatus(raw: unknown): PhotoStatus | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const clean = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (clean === 'none' || clean === 'na') return 'not_needed';
  return VALID_PHOTO_STATUSES.has(clean as PhotoStatus)
    ? (clean as PhotoStatus)
    : undefined;
}

export function normalizeEventDate(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const m = raw.trim().match(/^(\d{4}-\d{2}-\d{2})$/);
  return m ? m[1] : undefined;
}

export function todayEasternYmd(nowMs = Date.now()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date(nowMs));
  } catch {
    return new Date(nowMs).toISOString().slice(0, 10);
  }
}

export const IG_DAILY_CAUTION_THRESHOLD = 15;

export function getTodayPublishedCounts(
  pipeline: Array<Pick<PipelineCard, 'links' | 'linkPostedAt' | 'updatedAt'>>,
  nowMs = Date.now()
): Record<PlatformKey, number> {
  const today = todayEasternYmd(nowMs);
  const counts: Record<PlatformKey, number> = { fb: 0, ig: 0, linkedin: 0, x: 0 };
  const keys: PlatformKey[] = ['fb', 'ig', 'linkedin', 'x'];
  for (const card of pipeline) {
    if (!card.links) continue;
    for (const k of keys) {
      if (!card.links[k]) continue;
      const rawTs = card.linkPostedAt?.[k] || card.updatedAt;
      if (!rawTs) continue;
      const parsedMs = Date.parse(rawTs);
      const ymd = Number.isFinite(parsedMs) ? todayEasternYmd(parsedMs) : rawTs.slice(0, 10);
      if (ymd === today) counts[k] += 1;
    }
  }
  return counts;
}

export function isRateLimitErrorMessage(raw: string): boolean {
  return /(?:rate.?limit|daily.?(?:limit|cap|quota)|publishing.?limit|post.?limit|tweet.?limit|usage.?cap|quota.?exceeded|limit\s*(?:reached|hit|exceeded)|cap\s*(?:hit|reached)|too\s+many\s+requests|\b429\b)/i.test(
    raw
  );
}

export function normalizeRelevantUntil(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const ms = Date.parse(trimmed);
  if (!Number.isFinite(ms)) return undefined;
  return new Date(ms).toISOString();
}

export function isRequestExpired(
  req: Pick<OpsRequest, 'status' | 'relevantUntil'>,
  nowMs = Date.now()
): boolean {
  if (req.status === 'expired') return true;
  if (req.status !== 'pending') return false;
  if (!req.relevantUntil) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(req.relevantUntil)) {
    return todayEasternYmd(nowMs) > req.relevantUntil;
  }
  const ms = Date.parse(req.relevantUntil);
  return Number.isFinite(ms) ? nowMs > ms : false;
}

export function getEffectiveRequestStatus(
  req: Pick<OpsRequest, 'status' | 'relevantUntil'>,
  nowMs = Date.now()
): RequestStatus {
  if (isRequestExpired(req, nowMs)) return 'expired';
  return req.status;
}

export function normalizeRequestUrgency(raw: unknown): RequestUrgency | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const clean = raw.trim().toLowerCase();
  if (clean === 'urgent' || clean === 'high' || clean === 'normal') return clean;
  return undefined;
}

export function normalizeRequestActions(raw: unknown): RequestActionOption[] {
  if (!Array.isArray(raw)) return [];
  const seenIds = new Set<string>();
  const out: RequestActionOption[] = [];

  for (const entry of raw) {
    if (out.length >= 6) break;
    let label = '';
    let rawId = '';
    let tone: RequestActionOption['tone'];

    if (typeof entry === 'string') {
      label = entry.trim().slice(0, 48);
    } else if (entry && typeof entry === 'object') {
      const obj = entry as Record<string, unknown>;
      if (typeof obj.label === 'string') label = obj.label.trim().slice(0, 48);
      if (typeof obj.id === 'string') rawId = obj.id.trim();
      if (obj.tone === 'primary' || obj.tone === 'secondary' || obj.tone === 'danger') {
        tone = obj.tone;
      }
    }

    if (!label) continue;
    const baseId = (rawId || label)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || `action_${out.length + 1}`;
    if (baseId === 'already_handled' || baseId === 'dismiss') continue;

    let uniqueId = baseId;
    let suffix = 2;
    while (seenIds.has(uniqueId)) {
      uniqueId = `${baseId.slice(0, 35)}_${suffix++}`;
    }
    seenIds.add(uniqueId);

    out.push({
      id: uniqueId,
      label,
      tone: tone || (out.length === 0 ? 'primary' : 'secondary'),
    });
  }

  return out;
}

export function resolveEffectivePhotoStatus(opts: {
  explicit?: unknown;
  existing?: PhotoStatus;
  assetFile?: string;
  assetUrl?: string;
  assetSpec?: string;
}): PhotoStatus {
  const hasAsset = Boolean(opts.assetFile?.trim() || opts.assetUrl?.trim());
  const parsed = normalizePhotoStatus(opts.explicit);
  if (hasAsset) {
    if (parsed === 'verified') return 'verified';
    if (parsed === 'attached') return 'attached';
    return opts.existing === 'verified' ? 'verified' : 'attached';
  }
  if (parsed) {
    return parsed === 'attached' || parsed === 'verified' ? 'missing' : parsed;
  }
  if (opts.existing === 'attached' || opts.existing === 'verified') {
    return 'missing';
  }
  if (opts.existing) return opts.existing;
  if (opts.assetSpec?.trim()) return 'needed';
  return 'missing';
}

export function normalizeJobAssetKind(raw: unknown): JobAssetKind | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const clean = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (clean === 'image' || clean === 'photo') return 'image';
  if (clean === 'video') return 'video';
  if (clean === 'carousel_slide' || clean === 'slide' || clean === 'carousel') return 'carousel_slide';
  if (clean === 'flyer') return 'flyer';
  if (clean === 'video_frame' || clean === 'frame') return 'video_frame';
  if (clean === 'meme') return 'meme';
  return undefined;
}

export function normalizeJobAssetPlatform(raw: unknown): JobAssetPlatform | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const clean = raw.trim().toLowerCase();
  if (clean === 'all') return 'all';
  return normalizePlatformKey(clean);
}

export function normalizeJobAssetStatus(raw: unknown): JobAssetStatus | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const clean = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (
    clean === 'needed' ||
    clean === 'in_progress' ||
    clean === 'delivered' ||
    clean === 'approved' ||
    clean === 'rejected'
  ) {
    return clean;
  }
  return undefined;
}

export function getCardAssets(
  card: Partial<
    Pick<
      PipelineCard,
      'id' | 'assets' | 'assetUrl' | 'assetFile' | 'assetSpec' | 'photoStatus' | 'agentId' | 'createdAt' | 'updatedAt'
    >
  >
): JobAsset[] {
  if (Array.isArray(card.assets)) {
    return [...card.assets].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  if (card.assetUrl?.trim() || card.assetFile?.trim() || card.assetSpec?.trim()) {
    const hasMedia = Boolean(card.assetUrl?.trim() || card.assetFile?.trim());
    const status: JobAssetStatus =
      card.photoStatus === 'verified'
        ? 'approved'
        : hasMedia
          ? 'delivered'
          : 'needed';
    const nowFallback = card.updatedAt || card.createdAt || new Date().toISOString();
    return [
      {
        id: `ast-legacy-${card.id || '0'}`,
        url: card.assetUrl?.trim() || undefined,
        file: card.assetFile?.trim() || undefined,
        kind: 'image',
        platform: 'all',
        order: 0,
        spec: card.assetSpec?.trim() || undefined,
        status,
        addedBy: card.agentId || 'marley',
        createdAt: card.createdAt || nowFallback,
        updatedAt: nowFallback,
      },
    ];
  }
  return [];
}

export function syncCardWithAssets<T extends Partial<PipelineCard>>(
  card: T,
  assets: JobAsset[]
): T & { assets: JobAsset[]; assetUrl?: string; assetFile?: string; assetSpec?: string } {
  const normalized = [...assets]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((a, idx) => ({ ...a, order: idx }));
  const firstWithUrl = normalized.find((a) => Boolean(a.url?.trim()));
  const firstWithFile = normalized.find((a) => Boolean(a.file?.trim()));
  const first = normalized[0];
  return {
    ...card,
    assets: normalized,
    assetUrl: first?.url?.trim() || firstWithUrl?.url?.trim() || undefined,
    assetFile: first?.file?.trim() || firstWithFile?.file?.trim() || undefined,
    assetSpec: first?.spec?.trim() || undefined,
  };
}

export function ensureCardAssetsMigrated(card: PipelineCard): PipelineCard {
  const assets = getCardAssets(card);
  return syncCardWithAssets(card, assets);
}

export function hasCardAsset(
  card: Partial<
    Pick<PipelineCard, 'id' | 'assets' | 'assetUrl' | 'assetFile' | 'assetSpec' | 'photoStatus' | 'agentId' | 'createdAt' | 'updatedAt'>
  >
): boolean {
  const assets = getCardAssets(card);
  if (assets.some((a) => Boolean(a.url?.trim() || a.file?.trim()))) return true;
  return Boolean(card.assetUrl?.trim() || card.assetFile?.trim());
}

export function getCardAssetState(
  card: Partial<
    Pick<PipelineCard, 'id' | 'assets' | 'assetUrl' | 'assetFile' | 'assetSpec' | 'photoStatus' | 'agentId' | 'createdAt' | 'updatedAt'>
  >
): CardAssetState {
  if (hasCardAsset(card)) return 'attached';
  if (card.photoStatus === 'not_needed') return 'not_needed';
  return 'missing';
}

export function isPhotoRequiredLane(lane: PipelineLane): boolean {
  return lane === 'fb-ig' || lane === 'article';
}

export function resolveCardAssetPreviewSource(
  card: Pick<PipelineCard, 'id' | 'assets' | 'assetUrl' | 'assetFile' | 'assetSpec' | 'photoStatus' | 'agentId' | 'createdAt' | 'updatedAt'>
): string | undefined {
  const assets = getCardAssets(card);
  const firstUrl = assets.find((a) => a.url?.trim())?.url?.trim() || card.assetUrl?.trim();
  if (firstUrl) return firstUrl;
  const file = assets.find((a) => a.file?.trim())?.file?.trim() || card.assetFile?.trim();
  if (file && (/^https?:\/\//i.test(file) || file.startsWith('/'))) {
    return file;
  }
  return undefined;
}

export interface LivePostLink {
  platform: PlatformKey | 'post';
  label: string;
  shortLabel: string;
  href: string;
}

function inferPlatformFromUrl(url: string): PlatformKey | 'post' {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes('facebook.com') || host.includes('fb.watch')) return 'fb';
    if (host.includes('instagram.com')) return 'ig';
    if (host.includes('linkedin.com')) return 'linkedin';
    if (host.includes('x.com') || host.includes('twitter.com')) return 'x';
  } catch {
    return 'post';
  }
  return 'post';
}

const PLATFORM_LINK_META: Record<PlatformKey | 'post', { label: string; shortLabel: string }> = {
  fb: { label: 'Facebook', shortLabel: 'FB' },
  ig: { label: 'Instagram', shortLabel: 'IG' },
  linkedin: { label: 'LinkedIn', shortLabel: 'LI' },
  x: { label: 'X', shortLabel: 'X' },
  post: { label: 'Live Post', shortLabel: 'Post' },
};

export function splitTextWithUrls(
  text: string
): Array<{ type: 'text' | 'url'; value: string; trailing?: string }> {
  if (!text) return [];
  const out: Array<{ type: 'text' | 'url'; value: string; trailing?: string }> = [];
  const regex = /https?:\/\/[^\s<>"`]+/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      out.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    let rawUrl = match[0];
    let trailing = '';
    while (rawUrl.length > 0 && /[.,;:!?)'"\]]$/.test(rawUrl)) {
      const lastChar = rawUrl[rawUrl.length - 1];
      if (lastChar === ')') {
        const opens = (rawUrl.match(/\(/g) || []).length;
        const closes = (rawUrl.match(/\)/g) || []).length;
        if (closes <= opens) break;
      }
      trailing = lastChar + trailing;
      rawUrl = rawUrl.slice(0, -1);
    }
    if (rawUrl) {
      out.push({ type: 'url', value: rawUrl });
    }
    if (trailing) {
      out.push({ type: 'text', value: trailing });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    out.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return out;
}

export function getCardPublishedLinks(
  card: Pick<PipelineCard, 'links' | 'note' | 'stage'>
): LivePostLink[] {
  const results: LivePostLink[] = [];
  const seen = new Set<string>();
  const addLink = (platform: PlatformKey | 'post', href?: string) => {
    const clean = href?.trim();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    const meta = PLATFORM_LINK_META[platform];
    results.push({ platform, label: meta.label, shortLabel: meta.shortLabel, href: clean });
  };

  addLink('fb', card.links?.fb);
  addLink('ig', card.links?.ig);
  addLink('linkedin', card.links?.linkedin);
  addLink('x', card.links?.x);

  if (results.length === 0 && card.stage === 'posted' && card.note) {
    for (const part of splitTextWithUrls(card.note)) {
      if (part.type === 'url') {
        addLink(inferPlatformFromUrl(part.value), part.value);
      }
    }
  }

  return results;
}

export interface CardCompletenessResult {
  assetState: CardAssetState;
  hasAsset: boolean;
  hasCopy: boolean;
  noImageNeeded: boolean;
  canApproveReady: boolean;
  assetCount: number;
  lockReason:
    | 'needs_photo'
    | 'needs_copy'
    | 'needs_copy_and_photo'
    | 'asset_rejected'
    | 'needs_asset_approval'
    | 'needs_alt_text'
    | 'needs_credit'
    | null;
  buttonReason: string | null;
  detail: string | null;
  warning: string | null;
  missingCreditCount: number;
}

/**
 * Evaluates whether a pipeline card satisfies the completeness gate to enter Ready for Rotty.
 * Requires final copy AND either:
 * - Rotty's explicit "No image needed" exception (photoStatus === 'not_needed' with 0 assets), OR
 * - At least one asset where EVERY asset is delivered+approved and has altText.
 * Missing credit emits a non-blocking warning (allowed for official maker/press material
 * or story art when origin is noted on the card; still required when a photographer is named).
 */
export function getCardCompleteness(
  card: Partial<
    Pick<
      PipelineCard,
      'id' | 'draftCopy' | 'assets' | 'assetUrl' | 'assetFile' | 'assetSpec' | 'photoStatus' | 'agentId' | 'createdAt' | 'updatedAt'
    >
  >
): CardCompletenessResult {
  const assets = getCardAssets(card);
  const hasAsset = hasCardAsset(card);
  const noImageNeeded = assets.length === 0 && !hasAsset && card.photoStatus === 'not_needed';
  const assetState: CardAssetState = hasAsset ? 'attached' : noImageNeeded ? 'not_needed' : 'missing';
  const hasCopy = Boolean(card.draftCopy?.trim());
  const missingCreditCount = assets.filter((a) => !a.credit?.trim()).length;
  const creditWarning =
    missingCreditCount > 0
      ? `${missingCreditCount} asset${missingCreditCount === 1 ? '' : 's'} missing credit — allowed for official/maker/art if origin is noted on the card; required if a photographer is named.`
      : null;

  if (!hasCopy && assets.length === 0 && !noImageNeeded) {
    return {
      assetState,
      hasAsset,
      hasCopy,
      noImageNeeded,
      canApproveReady: false,
      assetCount: 0,
      lockReason: 'needs_copy_and_photo',
      buttonReason: 'Needs copy & photo',
      detail: 'Final draft copy and an approved asset with alt text (or explicit "No image needed") are required.',
      warning: null,
      missingCreditCount: 0,
    };
  }

  if (assets.length === 0 && !noImageNeeded) {
    return {
      assetState,
      hasAsset,
      hasCopy,
      noImageNeeded,
      canApproveReady: false,
      assetCount: 0,
      lockReason: 'needs_photo',
      buttonReason: 'Needs photo',
      detail: 'Attach and approve at least one asset with alt text or explicitly set "No image needed".',
      warning: null,
      missingCreditCount: 0,
    };
  }

  if (assets.length > 0) {
    const rejected = assets.filter((a) => a.status === 'rejected');
    if (rejected.length > 0) {
      return {
        assetState,
        hasAsset,
        hasCopy,
        noImageNeeded,
        canApproveReady: false,
        assetCount: assets.length,
        lockReason: 'asset_rejected',
        buttonReason: 'Asset rejected',
        detail: `${rejected.length} asset${rejected.length === 1 ? ' is' : 's are'} rejected — replace or remove before Ready for Rotty.`,
        warning: creditWarning,
        missingCreditCount,
      };
    }

    const undelivered = assets.filter(
      (a) => a.status === 'needed' || a.status === 'in_progress' || (!a.url?.trim() && !a.file?.trim())
    );
    if (undelivered.length > 0) {
      return {
        assetState,
        hasAsset,
        hasCopy,
        noImageNeeded,
        canApproveReady: false,
        assetCount: assets.length,
        lockReason: 'needs_photo',
        buttonReason: 'Needs photo',
        detail: `${undelivered.length} asset${undelivered.length === 1 ? ' is' : 's are'} still pending delivery.`,
        warning: creditWarning,
        missingCreditCount,
      };
    }

    const unapproved = assets.filter((a) => a.status !== 'approved');
    if (unapproved.length > 0) {
      return {
        assetState,
        hasAsset,
        hasCopy,
        noImageNeeded,
        canApproveReady: false,
        assetCount: assets.length,
        lockReason: 'needs_asset_approval',
        buttonReason: 'Needs asset approval',
        detail: `${unapproved.length} asset${unapproved.length === 1 ? '' : 's'} awaiting Marley/Rotty approval.`,
        warning: creditWarning,
        missingCreditCount,
      };
    }

    const missingAlt = assets.filter((a) => !a.altText?.trim());
    if (missingAlt.length > 0) {
      return {
        assetState,
        hasAsset,
        hasCopy,
        noImageNeeded,
        canApproveReady: false,
        assetCount: assets.length,
        lockReason: 'needs_alt_text',
        buttonReason: 'Needs alt text',
        detail: `${missingAlt.length} asset${missingAlt.length === 1 ? '' : 's'} missing required alt text.`,
        warning: creditWarning,
        missingCreditCount,
      };
    }
  }

  if (!hasCopy) {
    return {
      assetState,
      hasAsset,
      hasCopy,
      noImageNeeded,
      canApproveReady: false,
      assetCount: assets.length,
      lockReason: 'needs_copy',
      buttonReason: 'Needs copy',
      detail: 'Final draft copy is required before marking Ready for Rotty.',
      warning: creditWarning,
      missingCreditCount,
    };
  }

  return {
    assetState,
    hasAsset,
    hasCopy,
    noImageNeeded,
    canApproveReady: true,
    assetCount: assets.length,
    lockReason: null,
    buttonReason: null,
    detail: null,
    warning: creditWarning,
    missingCreditCount,
  };
}

export const ALLOWED_ASSET_FIELDS = new Set([
  'id',
  'url',
  'driveUrl',
  'assetLink',
  'imageUrl',
  'file',
  'kind',
  'platform',
  'order',
  'spec',
  'altText',
  'alt',
  'alt_text',
  'imageAlt',
  'caption',
  'credit',
  'sourceCredit',
  'photoCredit',
  'attribution',
  'sourceUrl',
  'label',
  'assignedTo',
  'assignee',
  'status',
  'rejectionReason',
]);

export function parseNewJobAssetInput(
  input: Record<string, unknown>,
  opts: {
    addedBy: string;
    defaultOrder: number;
    canReviewAsset: boolean;
    now?: string;
  }
): { ok: true; asset: JobAsset } | { ok: false; status: number; error: string } {
  const unknown = findUnknownFields(input, ALLOWED_ASSET_FIELDS);
  if (unknown.length > 0) {
    return {
      ok: false,
      status: 400,
      error: `Unknown asset field(s): ${unknown.join(', ')}`,
    };
  }

  const now = opts.now || new Date().toISOString();
  const rawUrl = input.url ?? input.driveUrl ?? input.assetLink ?? input.imageUrl;
  const urlCheck = sanitizeWebOrBlobUrl(rawUrl, FIELD_MAX_LENGTHS.assetUrl);
  if (!urlCheck.ok) return { ok: false, status: 400, error: `url: ${urlCheck.error}` };

  const sourceUrlCheck = sanitizeWebOrBlobUrl(input.sourceUrl, FIELD_MAX_LENGTHS.sourceUrl);
  if (!sourceUrlCheck.ok) {
    return { ok: false, status: 400, error: `sourceUrl: ${sourceUrlCheck.error}` };
  }

  let file: string | undefined;
  if (input.file !== undefined && input.file !== null) {
    const check = validateStringLength('file', input.file, FIELD_MAX_LENGTHS.assetFile);
    if (!check.ok) return { ok: false, status: 400, error: check.error };
    file = check.value || undefined;
  }

  let spec: string | undefined;
  if (input.spec !== undefined && input.spec !== null) {
    const check = validateStringLength('spec', input.spec, FIELD_MAX_LENGTHS.assetSpec);
    if (!check.ok) return { ok: false, status: 400, error: check.error };
    spec = check.value || undefined;
  }

  const rawAltText =
    input.altText !== undefined
      ? input.altText
      : input.alt !== undefined
        ? input.alt
        : input.alt_text !== undefined
          ? input.alt_text
          : input.imageAlt;
  let altText: string | undefined;
  if (rawAltText !== undefined && rawAltText !== null) {
    const check = validateStringLength('altText', rawAltText, FIELD_MAX_LENGTHS.altText);
    if (!check.ok) return { ok: false, status: 400, error: check.error };
    altText = check.value || undefined;
  }

  let caption: string | undefined;
  if (input.caption !== undefined && input.caption !== null) {
    const check = validateStringLength('caption', input.caption, FIELD_MAX_LENGTHS.caption);
    if (!check.ok) return { ok: false, status: 400, error: check.error };
    caption = check.value || undefined;
  }

  const rawCredit =
    input.credit !== undefined
      ? input.credit
      : input.sourceCredit !== undefined
        ? input.sourceCredit
        : input.photoCredit !== undefined
          ? input.photoCredit
          : input.attribution;
  let credit: string | undefined;
  if (rawCredit !== undefined && rawCredit !== null) {
    const check = validateStringLength('credit', rawCredit, FIELD_MAX_LENGTHS.credit);
    if (!check.ok) return { ok: false, status: 400, error: check.error };
    credit = check.value || undefined;
  }

  let label: string | undefined;
  if (input.label !== undefined && input.label !== null) {
    const check = validateStringLength('label', input.label, FIELD_MAX_LENGTHS.label);
    if (!check.ok) return { ok: false, status: 400, error: check.error };
    label = check.value || undefined;
  }

  let rejectionReason: string | undefined;
  if (input.rejectionReason !== undefined && input.rejectionReason !== null) {
    const check = validateStringLength(
      'rejectionReason',
      input.rejectionReason,
      FIELD_MAX_LENGTHS.rejectionReason
    );
    if (!check.ok) return { ok: false, status: 400, error: check.error };
    rejectionReason = check.value || undefined;
  }

  let kind: JobAssetKind = 'image';
  if (input.kind !== undefined && input.kind !== null && String(input.kind).trim() !== '') {
    const parsedKind = normalizeJobAssetKind(input.kind);
    if (!parsedKind) {
      return {
        ok: false,
        status: 400,
        error: 'Invalid kind. Allowed: image, video, carousel_slide, flyer, video_frame, meme.',
      };
    }
    kind = parsedKind;
  }

  let platform: JobAssetPlatform = 'all';
  if (
    input.platform !== undefined &&
    input.platform !== null &&
    String(input.platform).trim() !== ''
  ) {
    const parsedPlatform = normalizeJobAssetPlatform(input.platform);
    if (!parsedPlatform) {
      return {
        ok: false,
        status: 400,
        error: 'Invalid platform. Allowed: x, linkedin, fb, ig, all.',
      };
    }
    platform = parsedPlatform;
  }

  const hasMedia = Boolean(urlCheck.value || file);
  let status: JobAssetStatus = hasMedia ? 'delivered' : 'needed';
  if (input.status !== undefined && input.status !== null && String(input.status).trim() !== '') {
    const parsedStatus = normalizeJobAssetStatus(input.status);
    if (!parsedStatus) {
      return {
        ok: false,
        status: 400,
        error: 'Invalid status. Allowed: needed, in_progress, delivered, approved, rejected.',
      };
    }
    if ((parsedStatus === 'approved' || parsedStatus === 'rejected') && !opts.canReviewAsset) {
      return {
        ok: false,
        status: 403,
        error: 'Only Marley or an authenticated /ops operator can approve or reject assets.',
      };
    }
    status = parsedStatus;
  }

  let id = `ast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  if (input.id !== undefined && input.id !== null && String(input.id).trim() !== '') {
    const idCheck = validateStringLength('id', input.id, 120);
    if (!idCheck.ok) return { ok: false, status: 400, error: idCheck.error };
    id = idCheck.value.replace(/[^a-zA-Z0-9_-]/g, '-');
  }

  const order =
    typeof input.order === 'number' && Number.isFinite(input.order) && input.order >= 0
      ? Math.round(input.order)
      : opts.defaultOrder;

  const rawAssigned = input.assignedTo !== undefined ? input.assignedTo : input.assignee;
  const assignedTo =
    rawAssigned !== undefined ? normalizeAssignedTo(rawAssigned) : undefined;

  const isReviewed = status === 'approved' || status === 'rejected';
  return {
    ok: true,
    asset: {
      id,
      url: urlCheck.value,
      file,
      kind,
      platform,
      order,
      spec,
      altText,
      caption,
      credit,
      sourceUrl: sourceUrlCheck.value,
      label,
      assignedTo,
      status,
      rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      reviewedBy: isReviewed ? opts.addedBy : undefined,
      reviewedAt: isReviewed ? now : undefined,
      addedBy: opts.addedBy,
      createdAt: now,
      updatedAt: now,
    },
  };
}

export function applyJobAssetPatch(
  existing: JobAsset,
  patch: Record<string, unknown>,
  opts: {
    actorName: string;
    canReviewAsset: boolean;
    now?: string;
  }
): { ok: true; asset: JobAsset } | { ok: false; status: number; error: string } {
  const allowedPatchFields = new Set(ALLOWED_ASSET_FIELDS);
  allowedPatchFields.delete('id');
  const unknown = findUnknownFields(patch, allowedPatchFields);
  if (unknown.length > 0) {
    return {
      ok: false,
      status: 400,
      error: `Unknown asset field(s): ${unknown.join(', ')}`,
    };
  }

  const now = opts.now || new Date().toISOString();
  const next: JobAsset = { ...existing, updatedAt: now };

  const rawUrl =
    patch.url !== undefined
      ? patch.url
      : patch.driveUrl !== undefined
        ? patch.driveUrl
        : patch.assetLink !== undefined
          ? patch.assetLink
          : patch.imageUrl;
  if (rawUrl !== undefined) {
    const urlCheck = sanitizeWebOrBlobUrl(rawUrl, FIELD_MAX_LENGTHS.assetUrl);
    if (!urlCheck.ok) return { ok: false, status: 400, error: `url: ${urlCheck.error}` };
    next.url = urlCheck.value;
  }

  if (patch.sourceUrl !== undefined) {
    const sourceCheck = sanitizeWebOrBlobUrl(patch.sourceUrl, FIELD_MAX_LENGTHS.sourceUrl);
    if (!sourceCheck.ok) {
      return { ok: false, status: 400, error: `sourceUrl: ${sourceCheck.error}` };
    }
    next.sourceUrl = sourceCheck.value;
  }

  const normalizedPatch: Record<string, unknown> = { ...patch };
  if (normalizedPatch.altText === undefined) {
    const altAlias =
      normalizedPatch.alt !== undefined
        ? normalizedPatch.alt
        : normalizedPatch.alt_text !== undefined
          ? normalizedPatch.alt_text
          : normalizedPatch.imageAlt;
    if (altAlias !== undefined) normalizedPatch.altText = altAlias;
  }
  if (normalizedPatch.credit === undefined) {
    const creditAlias =
      normalizedPatch.sourceCredit !== undefined
        ? normalizedPatch.sourceCredit
        : normalizedPatch.photoCredit !== undefined
          ? normalizedPatch.photoCredit
          : normalizedPatch.attribution;
    if (creditAlias !== undefined) normalizedPatch.credit = creditAlias;
  }

  const textFields: Array<[keyof JobAsset, keyof typeof FIELD_MAX_LENGTHS]> = [
    ['file', 'assetFile'],
    ['spec', 'assetSpec'],
    ['altText', 'altText'],
    ['caption', 'caption'],
    ['credit', 'credit'],
    ['label', 'label'],
    ['rejectionReason', 'rejectionReason'],
  ];

  for (const [field, maxKey] of textFields) {
    const val = normalizedPatch[field];
    if (val === undefined) continue;
    if (val === null || val === '') {
      (next as unknown as Record<string, unknown>)[field] = undefined;
      continue;
    }
    const check = validateStringLength(field, val, FIELD_MAX_LENGTHS[maxKey]);
    if (!check.ok) return { ok: false, status: 400, error: check.error };
    (next as unknown as Record<string, unknown>)[field] = check.value || undefined;
  }

  if (patch.kind !== undefined) {
    const parsedKind = normalizeJobAssetKind(patch.kind);
    if (!parsedKind) {
      return {
        ok: false,
        status: 400,
        error: 'Invalid kind. Allowed: image, video, carousel_slide, flyer, video_frame, meme.',
      };
    }
    next.kind = parsedKind;
  }

  if (patch.platform !== undefined) {
    const parsedPlatform = normalizeJobAssetPlatform(patch.platform);
    if (!parsedPlatform) {
      return {
        ok: false,
        status: 400,
        error: 'Invalid platform. Allowed: x, linkedin, fb, ig, all.',
      };
    }
    next.platform = parsedPlatform;
  }

  if (patch.order !== undefined) {
    if (typeof patch.order !== 'number' || !Number.isFinite(patch.order) || patch.order < 0) {
      return { ok: false, status: 400, error: 'order must be a non-negative number.' };
    }
    next.order = Math.round(patch.order);
  }

  const rawPatchAssigned = patch.assignedTo !== undefined ? patch.assignedTo : patch.assignee;
  if (rawPatchAssigned !== undefined) {
    next.assignedTo =
      rawPatchAssigned === null || rawPatchAssigned === ''
        ? undefined
        : normalizeAssignedTo(rawPatchAssigned);
  }

  if (patch.status !== undefined) {
    const parsedStatus = normalizeJobAssetStatus(patch.status);
    if (!parsedStatus) {
      return {
        ok: false,
        status: 400,
        error: 'Invalid status. Allowed: needed, in_progress, delivered, approved, rejected.',
      };
    }
    if ((parsedStatus === 'approved' || parsedStatus === 'rejected') && !opts.canReviewAsset) {
      return {
        ok: false,
        status: 403,
        error: 'Only Marley or an authenticated /ops operator can approve or reject assets.',
      };
    }
    next.status = parsedStatus;
    if (parsedStatus === 'approved' || parsedStatus === 'rejected') {
      next.reviewedBy = opts.actorName;
      next.reviewedAt = now;
      if (parsedStatus === 'approved') next.rejectionReason = undefined;
    }
  } else if ((rawUrl !== undefined || patch.file !== undefined) && (next.url || next.file)) {
    if (existing.status === 'needed' || existing.status === 'in_progress' || existing.status === 'rejected') {
      next.status = 'delivered';
      next.rejectionReason = undefined;
    }
  }

  return { ok: true, asset: next };
}

const EVENT_CARD_HINT_RE =
  /\b(?:ride|rally|coat drive|toy run|charity run|poker run|bike night|swap meet|open house|track day|expo|festival|concert|tour|meet|meetup|grand prix|race weekend|gp weekend|conference|summit|webinar|workshop|clinic|championship|premiere)\b|\b(?:mon|tue|wed|thu|fri|sat|sun)\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b|\bKSU\b/i;

export function isEventCard(
  card?: Partial<Pick<PipelineCard, 'isEvent' | 'title' | 'note' | 'marleyNote'>> | null
): boolean {
  if (!card) return false;
  if (typeof card.isEvent === 'boolean') return card.isEvent;
  const hay = `${card.title || ''} ${card.note || ''} ${card.marleyNote || ''}`;
  return EVENT_CARD_HINT_RE.test(hay);
}

export function applyEventDatePastFlag(
  existingFlags: string[] | undefined,
  eventDate: string | undefined,
  stage: PipelineStage,
  eventContext?: Partial<Pick<PipelineCard, 'isEvent' | 'title' | 'note' | 'marleyNote'>> | null
): string[] | undefined {
  const cleaned = (existingFlags || []).filter(
    (flag) => !flag.startsWith('FLAG: Past event date (')
  );
  if (
    eventDate &&
    stage !== 'posted' &&
    stage !== 'archived' &&
    isEventCard(eventContext) &&
    eventDate < todayEasternYmd()
  ) {
    cleaned.push(`FLAG: Past event date (${eventDate}) — verify before publishing.`);
  }
  return cleaned.length > 0 ? cleaned : undefined;
}

export function parseConnectorAlert(
  raw: unknown,
  now: string
): { ok: true; value: ConnectorAlert | undefined } | { ok: false; error: string } {
  if (raw === null || raw === '' || raw === false) {
    return { ok: true, value: undefined };
  }
  if (typeof raw === 'string') {
    const msgCheck = validateStringLength('connectorAlert', raw, 300);
    if (!msgCheck.ok) return msgCheck;
    const msg = msgCheck.value;
    if (!msg) return { ok: true, value: undefined };
    const lower = msg.toLowerCase();
    if (lower === 'ok' || lower === 'clear' || lower === 'cleared' || lower === 'connected') {
      return { ok: true, value: undefined };
    }
    const status: ConnectorAlertStatus = lower.includes('wrong')
      ? 'wrong_account'
      : lower.includes('disconnect') || lower.includes('logged out') || lower.includes('dropped')
        ? 'disconnected'
        : isRateLimitErrorMessage(lower)
          ? 'rate_limit'
          : lower.includes('caution') || lower.includes('near limit')
            ? 'caution'
            : 'error';
    return {
      ok: true,
      value: { status, message: msg, updatedAt: now },
    };
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      ok: false,
      error:
        'connectorAlert must be null, a message string, or { status, platform?, account?, expectedAccount?, count?, limit?, resetAt?, message }.',
    };
  }

  const obj = raw as Record<string, unknown>;
  const rawStatus = typeof obj.status === 'string' ? obj.status.trim().toLowerCase().replace(/[\s-]+/g, '_') : '';
  if (rawStatus === 'ok' || rawStatus === 'clear' || rawStatus === 'cleared' || rawStatus === 'connected') {
    return { ok: true, value: undefined };
  }
  const status: ConnectorAlertStatus =
    rawStatus === 'wrong_account' ||
    rawStatus === 'disconnected' ||
    rawStatus === 'error' ||
    rawStatus === 'rate_limit' ||
    rawStatus === 'caution'
      ? rawStatus
      : rawStatus === 'rate_limited' ||
          rawStatus === 'daily_limit' ||
          rawStatus === 'limit' ||
          rawStatus === 'cap' ||
          rawStatus === 'quota' ||
          rawStatus === '429'
        ? 'rate_limit'
        : rawStatus === 'near_limit' || rawStatus === 'warning'
          ? 'caution'
          : rawStatus
            ? 'error'
            : 'disconnected';

  let platform: string | undefined;
  if (obj.platform !== undefined && obj.platform !== null && obj.platform !== '') {
    const pCheck = validateStringLength('connectorAlert.platform', obj.platform, 40);
    if (!pCheck.ok) return pCheck;
    platform = pCheck.value || undefined;
  }
  let account: string | undefined;
  if (obj.account !== undefined && obj.account !== null && obj.account !== '') {
    const aCheck = validateStringLength('connectorAlert.account', obj.account, 80);
    if (!aCheck.ok) return aCheck;
    account = aCheck.value || undefined;
  }
  let expectedAccount: string | undefined;
  if (obj.expectedAccount !== undefined && obj.expectedAccount !== null && obj.expectedAccount !== '') {
    const eCheck = validateStringLength('connectorAlert.expectedAccount', obj.expectedAccount, 80);
    if (!eCheck.ok) return eCheck;
    expectedAccount = eCheck.value || undefined;
  }
  let count: number | undefined;
  if (typeof obj.count === 'number' && Number.isFinite(obj.count) && obj.count >= 0) {
    count = Math.round(obj.count);
  }
  let limit: number | undefined;
  if (typeof obj.limit === 'number' && Number.isFinite(obj.limit) && obj.limit > 0) {
    limit = Math.round(obj.limit);
  }
  let resetAt: string | undefined;
  if (obj.resetAt !== undefined && obj.resetAt !== null && obj.resetAt !== '') {
    const rCheck = validateStringLength('connectorAlert.resetAt', obj.resetAt, 80);
    if (!rCheck.ok) return rCheck;
    resetAt = rCheck.value || undefined;
  }

  let message = '';
  if (obj.message !== undefined && obj.message !== null) {
    const mCheck = validateStringLength('connectorAlert.message', obj.message, 300);
    if (!mCheck.ok) return mCheck;
    message = mCheck.value;
  }
  if (!message) {
    const target = platform ? platform.toUpperCase() : 'Connector';
    const ratio =
      count !== undefined && limit !== undefined
        ? ` (${count}/${limit})`
        : count !== undefined
          ? ` (count: ${count})`
          : '';
    message =
      status === 'wrong_account'
        ? `${target} landed on wrong account${account ? ` (${account})` : ''}${expectedAccount ? ` — expected ${expectedAccount}` : ''}`
        : status === 'disconnected'
          ? `${target} disconnected — reconnect required`
          : status === 'rate_limit'
            ? `${target} daily limit reached${ratio}${resetAt ? ` — resets ${resetAt}` : ''}`
            : status === 'caution'
              ? `${target} approaching daily cap${ratio}${resetAt ? ` — holding until ${resetAt}` : ''}`
              : `${target} connection error`;
  }

  return {
    ok: true,
    value: {
      status,
      platform,
      account,
      expectedAccount,
      count,
      limit,
      resetAt,
      message,
      updatedAt: now,
    },
  };
}

export type UpdateAlertKind = 'new' | 'updated';

export interface UpdateAlertMeta {
  kind: UpdateAlertKind;
  label: string;
  cardBorderCls: string;
  tabBorderCls: string;
  badgeCls: string;
  dotCls: string;
}

/** Shared class tokens for temporary update borders/pills (cyan = new, violet = updated). */
export function getUpdateAlertMeta(kind?: UpdateAlertKind): UpdateAlertMeta | null {
  if (!kind) return null;
  if (kind === 'new') {
    return {
      kind,
      label: 'NEW',
      cardBorderCls: 'ops-alert-card-new',
      tabBorderCls: 'ops-alert-tab-new',
      badgeCls:
        'border-cyan-500/50 bg-cyan-500/15 text-cyan-800 dark:text-cyan-200 font-medium',
      dotCls: 'ops-ping-dot-new',
    };
  }
  return {
    kind,
    label: 'UPDATED',
    cardBorderCls: 'ops-alert-card-updated',
    tabBorderCls: 'ops-alert-tab-updated',
    badgeCls:
      'border-violet-500/50 bg-violet-500/15 text-violet-800 dark:text-violet-200 font-medium',
    dotCls: 'ops-ping-dot-updated',
  };
}
