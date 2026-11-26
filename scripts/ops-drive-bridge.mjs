#!/usr/bin/env node
/**
 * RottyM Command Center — Google Drive <-> Hosted API Bridge
 *
 * Usage:
 *   OPS_BASE_URL=https://www.rottym.com WEBHOOK_SECRET=... node scripts/ops-drive-bridge.mjs
 *   OPS_BASE_URL=http://localhost:3000 WEBHOOK_SECRET=... node scripts/ops-drive-bridge.mjs --watch
 *
 * Scans G:\Shared drives\RottyM_Content\RottyM Content Drafts\YYYY-MM-DD (or SHARED_JOBS_DIR):
 *   1) Pushes new/updated .md/.txt drops & Marley batch clearance docs to /api/bots/ingest-drop
 *   2) Pairs Pixel's image files with companion .md notes when present
 *   3) Pulls /api/bots/signals and writes visible signals/ JSON files (NEVER dot-prefixed)
 *      plus CommandCenter-YYYY-MM-DD-approved-queue.md for Ready for Rotty items.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_GDRIVE_ROOT = 'G:\\Shared drives\\RottyM_Content\\RottyM Content Drafts';
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const SKIP_TOKENS = ['duties', 'x-analytics', 'x-watch', 'reply-targets', 'operating-costs', 'showroom-plan', 'fact-check', 'posted-log', 'creator-academy-playbook', 'command-center-'];

const baseUrl = (process.env.OPS_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const webhookSecret = process.env.WEBHOOK_SECRET?.trim() || '';
const clientId = (process.env.OPS_CLIENT_ID || 'rottym').trim().toLowerCase();
const watchMode = process.argv.includes('--watch');
const dateArg = process.argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));

function resolveRoot() {
  if (process.env.SHARED_JOBS_DIR?.trim()) return path.resolve(process.env.SHARED_JOBS_DIR.trim());
  if (existsSync(DEFAULT_GDRIVE_ROOT)) return DEFAULT_GDRIVE_ROOT;
  return path.resolve(process.cwd(), 'shared-queue');
}

async function apiFetch(pathname, init = {}) {
  const res = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${webhookSecret}`,
      'X-Bot-Name': 'DriveBridge',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) throw new Error(`${pathname} HTTP ${res.status}: ${json.error || text}`);
  return json;
}

const seenSignatures = new Map();

async function syncOnce() {
  if (!webhookSecret) {
    throw new Error('WEBHOOK_SECRET environment variable is required.');
  }
  const root = resolveRoot();
  const dateTag = dateArg || new Date().toISOString().slice(0, 10);
  const dateDir = path.join(root, dateTag);
  await fs.mkdir(dateDir, { recursive: true });

  const entries = await fs.readdir(dateDir, { withFileTypes: true });
  const imageByStem = new Map();
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (IMAGE_EXTS.has(ext)) {
      imageByStem.set(entry.name.slice(0, -ext.length).toLowerCase(), `${dateTag}/${entry.name}`);
    }
  }

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
    const lower = entry.name.toLowerCase();
    const ext = path.extname(entry.name).toLowerCase();
    if (!['.md', '.txt'].includes(ext)) continue;
    if (SKIP_TOKENS.some((tok) => lower.includes(tok))) continue;

    const fullPath = path.join(dateDir, entry.name);
    const stat = await fs.stat(fullPath);
    const sig = `${stat.mtimeMs}:${stat.size}`;
    if (seenSignatures.get(fullPath) === sig) continue;

    const content = await fs.readFile(fullPath, 'utf8');
    const stem = entry.name.slice(0, -ext.length).toLowerCase();
    const companionImage = imageByStem.get(stem);

    await apiFetch('/api/bots/ingest-drop', {
      method: 'POST',
      body: JSON.stringify({
        clientId,
        filename: entry.name,
        content,
        jobDate: dateTag,
        assetFile: companionImage,
      }),
    });

    seenSignatures.set(fullPath, sig);
    console.log(`[ingest] ${entry.name}${companionImage ? ` (+ ${companionImage})` : ''}`);
  }

  // Write visible signals/ folder + human-readable approved queue
  const signalsResp = await apiFetch(`/api/bots/signals?clientId=${encodeURIComponent(clientId)}&date=${dateTag}`);
  const signalsDir = path.join(dateDir, 'signals');
  await fs.mkdir(signalsDir, { recursive: true });

  for (const sig of signalsResp.signals || []) {
    const safeId = String(sig.id).replace(/[^a-zA-Z0-9_-]/g, '');
    const target = path.join(signalsDir, `${safeId}.${sig.signal}.json`);
    const tmp = path.join(signalsDir, `tmp-${safeId}-${Date.now()}.json`);
    await fs.writeFile(tmp, JSON.stringify(sig, null, 2), 'utf8');
    await fs.rename(tmp, target);
  }

  const mdQueue = await fetch(
    `${baseUrl}/api/bots/signals?clientId=${encodeURIComponent(clientId)}&date=${dateTag}&format=md`,
    { headers: { Authorization: `Bearer ${webhookSecret}`, 'X-Bot-Name': 'DriveBridge' } }
  ).then((r) => r.text());

  const queuePath = path.join(dateDir, `CommandCenter-${dateTag}-approved-queue.md`);
  const tmpQueue = path.join(dateDir, `tmp-approved-queue-${Date.now()}.md`);
  await fs.writeFile(tmpQueue, mdQueue, 'utf8');
  await fs.rename(tmpQueue, queuePath);
  console.log(`[signals] ${signalsResp.count || 0} signal(s) synced -> ${signalsDir}`);
}

await syncOnce();
if (watchMode) {
  console.log('Watching Drive folder every 15s...');
  setInterval(() => {
    syncOnce().catch((err) => console.error('[watch error]', err.message));
  }, 15000);
}
