import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { opsGetDoc, opsListCollection, ensureOpsSeeded } from './firestore-rest';
import { DEFAULT_OWNER_EMAILS } from './seed';
import type { ClientWorkspace } from './types';

const PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  'rottym-com-vibe';

interface CertCache {
  certs: Record<string, string>;
  expiresAt: number;
}

let certCache: CertCache | null = null;

function decodeBase64Url(input: string): Buffer {
  const pad = (4 - (input.length % 4)) % 4;
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
  return Buffer.from(base64, 'base64');
}

async function getFirebaseAuthCerts(): Promise<Record<string, string>> {
  if (certCache && Date.now() < certCache.expiresAt) {
    return certCache.certs;
  }
  const res = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
    { cache: 'no-store' }
  );
  if (!res.ok) {
    throw new Error(`Unable to fetch Firebase Auth certs (${res.status})`);
  }
  const certs = (await res.json()) as Record<string, string>;
  const cc = res.headers.get('cache-control') || '';
  const maxAgeMatch = cc.match(/max-age=(\d+)/i);
  const ttlMs = maxAgeMatch ? Number(maxAgeMatch[1]) * 1000 : 3600 * 1000;
  certCache = { certs, expiresAt: Date.now() + ttlMs };
  return certs;
}

export interface VerifiedOpsUser {
  uid: string;
  email: string;
  name: string;
  isOwner: boolean;
}

export function getOwnerEmailSet(): Set<string> {
  const raw = process.env.OPS_OWNER_EMAILS?.trim();
  const list = raw
    ? raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : DEFAULT_OWNER_EMAILS;
  return new Set(list);
}

export async function verifyFirebaseIdToken(token: string): Promise<VerifiedOpsUser | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;

  let header: { alg?: string; kid?: string };
  let payload: {
    iss?: string;
    aud?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };

  try {
    header = JSON.parse(decodeBase64Url(headerB64).toString('utf8'));
    payload = JSON.parse(decodeBase64Url(payloadB64).toString('utf8'));
  } catch {
    return null;
  }

  if (header.alg !== 'RS256' || !header.kid) return null;
  const certs = await getFirebaseAuthCerts();
  const certPem = certs[header.kid];
  if (!certPem) return null;

  const isValid = crypto.verify(
    'RSA-SHA256',
    Buffer.from(`${headerB64}.${payloadB64}`),
    certPem,
    decodeBase64Url(sigB64)
  );
  if (!isValid) return null;

  const nowS = Math.floor(Date.now() / 1000);
  if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) return null;
  if (payload.aud !== PROJECT_ID) return null;
  if (!payload.sub || !payload.exp || payload.exp <= nowS) return null;
  if (!payload.email || payload.email_verified !== true) return null;

  const email = payload.email.trim().toLowerCase();
  return {
    uid: payload.sub,
    email,
    name: (payload.name || email.split('@')[0] || 'Operator').slice(0, 48),
    isOwner: getOwnerEmailSet().has(email),
  };
}

export async function authorizeOpsUser(request: Request): Promise<VerifiedOpsUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  return verifyFirebaseIdToken(token);
}

export async function getAuthorizedClientsForUser(user: VerifiedOpsUser): Promise<ClientWorkspace[]> {
  await ensureOpsSeeded();
  const all = await opsListCollection<ClientWorkspace>('ops_clients');
  const visible = user.isOwner
    ? all
    : all.filter((c) => Array.isArray(c.memberEmails) && c.memberEmails.map((e) => e.toLowerCase()).includes(user.email));
  return visible.sort((a, b) => (a.id === 'rottym' ? -1 : b.id === 'rottym' ? 1 : a.name.localeCompare(b.name)));
}

export async function canUserAccessClient(user: VerifiedOpsUser, clientId: string): Promise<boolean> {
  if (user.isOwner) return true;
  await ensureOpsSeeded();
  const client = await opsGetDoc<ClientWorkspace>('ops_clients', clientId);
  if (!client || !Array.isArray(client.memberEmails)) return false;
  return client.memberEmails.map((e) => e.toLowerCase()).includes(user.email);
}

function timingSafeMatch(provided: string, expected: string): boolean {
  const hashA = crypto.createHash('sha256').update(provided).digest();
  const hashB = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export interface BotActor {
  kind: 'bot' | 'user';
  actorName: string;
  scopedClientId: string | null; // null => owner/global token, may access any clientId
  user?: VerifiedOpsUser;
}

const CANONICAL_CREW_NAMES: Record<string, string> = {
  antigravity: 'Antigravity',
  bastion: 'Bastion',
  cheatcode: 'Cheat Code',
  cheatcodes: 'Cheat Code',
  cortex: 'Cortex',
  gemini: 'Gemini',
  glitch: 'Glitch',
  marley: 'Marley',
  pixel: 'Pixel',
  sovereign: 'Sovereign',
  splicer: 'Splicer',
};

export function canonicalCrewDisplayName(raw: string): string {
  const clean = raw.trim().replace(/[^\w\s.-]/g, '').slice(0, 32);
  if (!clean) return '';
  const compact = clean.toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (CANONICAL_CREW_NAMES[compact]) {
    return CANONICAL_CREW_NAMES[compact];
  }
  return clean;
}

function formatBotKeyName(rawKey: string): string {
  const formatted = rawKey
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
  return canonicalCrewDisplayName(formatted) || formatted;
}

/**
 * Authorizes either:
 * 1) A per-bot token (`WEBHOOK_SECRET_BOT_<BOT>` or `WEBHOOK_SECRET_<CLIENT>_BOT_<BOT>`),
 * 2) A shared bot token (`WEBHOOK_SECRET` or `WEBHOOK_SECRET_<CLIENT_ID>`) + `X-Bot-Name`, OR
 * 3) An authenticated Firebase user calling from /ops.
 */
export async function authorizeBotOrOpsUser(
  request: Request,
  fallbackBotName = 'Bot'
): Promise<BotActor | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const provided = authHeader.slice(7).trim();
  if (!provided) return null;

  const botName =
    canonicalCrewDisplayName(request.headers.get('x-bot-name') || fallbackBotName) ||
    fallbackBotName;

  for (const [key, val] of Object.entries(process.env)) {
    if (!val?.trim()) continue;
    if (key.startsWith('WEBHOOK_SECRET_BOT_')) {
      if (timingSafeMatch(provided, val.trim())) {
        const mapped = formatBotKeyName(key.slice('WEBHOOK_SECRET_BOT_'.length));
        return { kind: 'bot', actorName: mapped || botName, scopedClientId: null };
      }
    } else if (key.startsWith('WEBHOOK_SECRET_') && key.includes('_BOT_')) {
      const idx = key.indexOf('_BOT_');
      const clientPart = key.slice('WEBHOOK_SECRET_'.length, idx);
      const botPart = key.slice(idx + '_BOT_'.length);
      if (clientPart && botPart && timingSafeMatch(provided, val.trim())) {
        return {
          kind: 'bot',
          actorName: formatBotKeyName(botPart) || botName,
          scopedClientId: clientPart.toLowerCase().replace(/_/g, '-'),
        };
      }
    }
  }

  const globalSecret = process.env.WEBHOOK_SECRET?.trim();
  if (globalSecret && timingSafeMatch(provided, globalSecret)) {
    return { kind: 'bot', actorName: botName, scopedClientId: null };
  }

  for (const [key, val] of Object.entries(process.env)) {
    if (!key.startsWith('WEBHOOK_SECRET_') || key.includes('_BOT_') || !val?.trim()) continue;
    if (timingSafeMatch(provided, val.trim())) {
      const clientSlug = key.slice('WEBHOOK_SECRET_'.length).toLowerCase().replace(/_/g, '-');
      return { kind: 'bot', actorName: botName, scopedClientId: clientSlug };
    }
  }

  const user = await verifyFirebaseIdToken(provided);
  if (user) {
    return {
      kind: 'user',
      actorName: user.name,
      scopedClientId: user.isOwner ? null : '__check_membership__',
      user,
    };
  }

  return null;
}

export function isBotJobOwner(
  actor: BotActor,
  card: { agentId?: string; source?: string; contentType?: string }
): boolean {
  if (actor.user) return true;
  const norm = (v?: string) => (v || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const caller = norm(actor.actorName);
  if (!caller || caller === 'bot') return false;
  const cardAgent = norm(card.agentId);
  const cardSource = norm(card.source);
  if (cardAgent === 'drivebridge' || cardSource.startsWith('drive')) return true;
  if (card.contentType === 'image' && caller === 'pixel') return true;
  return caller === cardAgent || caller === cardSource;
}

export function resolveBotTargetClientId(actor: BotActor, requestedClientId?: string | null): string | null {
  const cleanRequested = requestedClientId?.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || '';
  if (actor.scopedClientId && actor.scopedClientId !== '__check_membership__') {
    if (cleanRequested && cleanRequested !== actor.scopedClientId) return null;
    return actor.scopedClientId;
  }
  return cleanRequested || 'rottym';
}

export function unauthorizedResponse(message = 'Authentication required') {
  return NextResponse.json(
    { error: message },
    { status: 401, headers: { 'Cache-Control': 'no-store' } }
  );
}

export function forbiddenResponse(message = 'Access denied for this client workspace') {
  return NextResponse.json(
    { error: message },
    { status: 403, headers: { 'Cache-Control': 'no-store' } }
  );
}
