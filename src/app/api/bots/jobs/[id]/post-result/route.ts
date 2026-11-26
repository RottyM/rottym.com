import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import {
  getCardAssets,
  getPendingPlatforms,
  normalizePlatformKey,
  normalizePlatformList,
} from '@/lib/ops/drop-parser';
import { appendOpsActivity, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type { PipelineCard, PipelineLinks, PlatformKey } from '@/lib/ops/types';

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

function inferPlatformFromUrl(url: string): PlatformKey | undefined {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes('x.com') || host.includes('twitter.com')) return 'x';
    if (host.includes('linkedin.com')) return 'linkedin';
    if (host.includes('instagram.com')) return 'ig';
    if (host.includes('facebook.com') || host.includes('fb.watch')) return 'fb';
  } catch {
    return undefined;
  }
  return undefined;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await authorizeBotOrOpsUser(request, 'Posting Bot');
  if (!actor) return unauthorizedResponse();

  const { id } = await context.params;
  let body: {
    clientId?: string;
    botName?: string;
    status?: 'posted' | 'failed';
    externalPostUrl?: string;
    platform?: string;
    targetPlatforms?: string[] | string;
    platforms?: string[] | string;
    partial?: boolean;
    links?: PipelineLinks;
    postedAssets?: Partial<Record<PlatformKey, string[]>>;
    assetIds?: string[];
    error?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (body.status !== 'posted' && body.status !== 'failed') {
    return NextResponse.json({ error: 'status must be posted or failed' }, { status: 400 });
  }

  const existing = await opsGetDoc<PipelineCard>('ops_pipeline', id);
  if (!existing) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const scopedClientId = resolveBotTargetClientId(actor, body.clientId || existing.clientId);
  if (!scopedClientId || scopedClientId !== existing.clientId) return forbiddenResponse();
  if (actor.user && !(await canUserAccessClient(actor.user, existing.clientId))) {
    return forbiddenResponse();
  }

  const botName =
    typeof body.botName === 'string' && body.botName.trim()
      ? body.botName.trim().slice(0, 32)
      : actor.actorName;
  const ok = body.status === 'posted';

  const singleUrl = sanitizeUrl(body.externalPostUrl);
  const nextLinks: PipelineLinks = { ...(existing.links || {}) };
  if (body.links && typeof body.links === 'object') {
    if (body.links.fb) nextLinks.fb = sanitizeUrl(body.links.fb) || nextLinks.fb;
    if (body.links.ig) nextLinks.ig = sanitizeUrl(body.links.ig) || nextLinks.ig;
    if (body.links.linkedin) nextLinks.linkedin = sanitizeUrl(body.links.linkedin) || nextLinks.linkedin;
    if (body.links.x) nextLinks.x = sanitizeUrl(body.links.x) || nextLinks.x;
  }

  const explicitPlatform = normalizePlatformKey(body.platform);
  const touchedPlatforms = new Set<PlatformKey>();
  if (body.links && typeof body.links === 'object') {
    if (body.links.fb) touchedPlatforms.add('fb');
    if (body.links.ig) touchedPlatforms.add('ig');
    if (body.links.linkedin) touchedPlatforms.add('linkedin');
    if (body.links.x) touchedPlatforms.add('x');
  }
  if (singleUrl) {
    const inferred = explicitPlatform || inferPlatformFromUrl(singleUrl);
    if (inferred === 'x') {
      nextLinks.x = nextLinks.x || singleUrl;
      touchedPlatforms.add('x');
    } else if (inferred === 'linkedin') {
      nextLinks.linkedin = nextLinks.linkedin || singleUrl;
      touchedPlatforms.add('linkedin');
    } else if (inferred === 'ig') {
      nextLinks.ig = nextLinks.ig || singleUrl;
      touchedPlatforms.add('ig');
    } else if (inferred === 'fb') {
      nextLinks.fb = nextLinks.fb || singleUrl;
      touchedPlatforms.add('fb');
    } else if (existing.channel === 'linkedin') {
      nextLinks.linkedin = nextLinks.linkedin || singleUrl;
      touchedPlatforms.add('linkedin');
    } else if (existing.channel === 'x') {
      nextLinks.x = nextLinks.x || singleUrl;
      touchedPlatforms.add('x');
    } else {
      nextLinks.fb = nextLinks.fb || singleUrl;
      touchedPlatforms.add('fb');
    }
  } else if (explicitPlatform) {
    touchedPlatforms.add(explicitPlatform);
  }

  const jobAssets = getCardAssets(existing);
  const validAssetIds = new Set(jobAssets.map((a) => a.id));
  const nextPostedAssets: Partial<Record<PlatformKey, string[]>> = {
    ...(existing.postedAssets || {}),
  };

  if (body.postedAssets && typeof body.postedAssets === 'object') {
    for (const [rawPlat, rawIds] of Object.entries(body.postedAssets)) {
      const plat = normalizePlatformKey(rawPlat);
      if (!plat || !Array.isArray(rawIds)) continue;
      const cleanIds = rawIds.filter((idVal): idVal is string => typeof idVal === 'string' && idVal.trim().length > 0);
      const unknownAsset = cleanIds.find((aid) => validAssetIds.size > 0 && !validAssetIds.has(aid));
      if (unknownAsset) {
        return NextResponse.json(
          { error: `Unknown asset id '${unknownAsset}' in postedAssets.${plat}.` },
          { status: 400 }
        );
      }
      nextPostedAssets[plat] = cleanIds;
    }
  } else if (Array.isArray(body.assetIds)) {
    const cleanIds = body.assetIds.filter((idVal): idVal is string => typeof idVal === 'string' && idVal.trim().length > 0);
    const unknownAsset = cleanIds.find((aid) => validAssetIds.size > 0 && !validAssetIds.has(aid));
    if (unknownAsset) {
      return NextResponse.json(
        { error: `Unknown asset id '${unknownAsset}' in assetIds.` },
        { status: 400 }
      );
    }
    const targetPlats =
      touchedPlatforms.size > 0
        ? Array.from(touchedPlatforms)
        : existing.channel === 'linkedin'
          ? (['linkedin'] as PlatformKey[])
          : existing.channel === 'x'
            ? (['x'] as PlatformKey[])
            : (['fb', 'ig'] as PlatformKey[]);
    for (const plat of targetPlats) {
      nextPostedAssets[plat] = cleanIds;
    }
  } else if (ok && jobAssets.length > 0 && touchedPlatforms.size > 0) {
    for (const plat of touchedPlatforms) {
      if (!nextPostedAssets[plat]) {
        const matchingIds = jobAssets
          .filter((a) => a.platform === 'all' || a.platform === plat)
          .map((a) => a.id);
        if (matchingIds.length > 0) nextPostedAssets[plat] = matchingIds;
      }
    }
  }

  const effectiveTargetPlatforms =
    body.targetPlatforms !== undefined || body.platforms !== undefined
      ? normalizePlatformList(body.targetPlatforms ?? body.platforms)
      : existing.targetPlatforms;

  const pendingPlatforms = getPendingPlatforms(effectiveTargetPlatforms, nextLinks);
  const waitingOnMorePlatforms =
    ok && (body.partial === true || pendingPlatforms.length > 0);

  const nextStage = !ok
    ? 'drafted'
    : waitingOnMorePlatforms
      ? existing.stage === 'posted'
        ? 'posted'
        : existing.stage === 'approved' || existing.readyForRotty
          ? 'approved'
          : existing.stage
      : 'posted';

  const landedSummary = Object.entries(nextLinks)
    .filter(([, url]) => Boolean(url))
    .map(([k]) => k.toUpperCase())
    .join(', ');

  const updated: PipelineCard = {
    ...existing,
    targetPlatforms: effectiveTargetPlatforms,
    stage: nextStage,
    readyForRotty: !ok ? false : waitingOnMorePlatforms ? existing.readyForRotty : false,
    postIt: !ok ? false : waitingOnMorePlatforms ? existing.postIt : false,
    claimedBy: undefined,
    leaseExpiresAt: undefined,
    links: Object.values(nextLinks).some(Boolean) ? nextLinks : undefined,
    postedAssets: Object.keys(nextPostedAssets).length > 0 ? nextPostedAssets : undefined,
    note: !ok
      ? `Post failed (${botName}): ${(body.error || 'unknown error').slice(0, 140)}`
      : waitingOnMorePlatforms
        ? `Posted ${landedSummary || 'partial'} by ${botName}; awaiting: ${pendingPlatforms.join(', ')}`
        : singleUrl
          ? `Posted by ${botName} (${singleUrl})`
          : `Posted by ${botName}`,
    updatedAt: new Date().toISOString(),
  };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);
  await appendOpsActivity(
    existing.clientId,
    botName,
    !ok
      ? 'reported post failure'
      : waitingOnMorePlatforms
        ? `posted ${landedSummary || 'partial'} (awaiting ${pendingPlatforms.join(', ')})`
        : 'reported post live',
    updated.title
  );

  return NextResponse.json(
    {
      ok: true,
      partial: waitingOnMorePlatforms,
      pendingPlatforms,
      job: updated,
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
