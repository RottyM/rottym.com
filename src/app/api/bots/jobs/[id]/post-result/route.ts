import { NextResponse } from 'next/server';
import {
  authorizeBotOrOpsUser,
  canUserAccessClient,
  forbiddenResponse,
  resolveBotTargetClientId,
  unauthorizedResponse,
} from '@/lib/ops/auth';
import {
  findUnknownFields,
  formatPlatformShortLabel,
  getCardAssets,
  getPendingPlatforms,
  inferAgentId,
  isRateLimitErrorMessage,
  normalizePlatformKey,
  normalizePlatformList,
} from '@/lib/ops/drop-parser';
import { appendOpsActivity, opsGetDoc, opsSetDoc } from '@/lib/ops/firestore-rest';
import type {
  ChatMessage,
  ConnectorAlert,
  CrewMember,
  PipelineCard,
  PipelineLinks,
  PlatformKey,
} from '@/lib/ops/types';

const ALLOWED_POST_RESULT_FIELDS = new Set([
  'clientId',
  'botName',
  'status',
  'externalPostUrl',
  'external_post_url',
  'externalUrl',
  'external_url',
  'postUrl',
  'post_url',
  'liveUrl',
  'live_url',
  'url',
  'link',
  'permalink',
  'platform',
  'targetPlatforms',
  'platforms',
  'partial',
  'links',
  'postedAssets',
  'assetIds',
  'error',
  'rateLimited',
  'caution',
  'dailyCount',
  'dailyLimit',
  'resetAt',
]);

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
    external_post_url?: string;
    externalUrl?: string;
    external_url?: string;
    postUrl?: string;
    post_url?: string;
    liveUrl?: string;
    live_url?: string;
    url?: string;
    link?: string;
    permalink?: string;
    platform?: string;
    targetPlatforms?: string[] | string;
    platforms?: string[] | string;
    partial?: boolean;
    links?: Record<string, unknown>;
    postedAssets?: Partial<Record<PlatformKey, string[]>>;
    assetIds?: string[];
    error?: string;
    rateLimited?: boolean;
    caution?: boolean;
    dailyCount?: number;
    dailyLimit?: number;
    resetAt?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'JSON object payload is required' }, { status: 400 });
  }
  const unknown = findUnknownFields(body as Record<string, unknown>, ALLOWED_POST_RESULT_FIELDS);
  if (unknown.length > 0) {
    return NextResponse.json(
      {
        error: `Unknown field(s): ${unknown.join(', ')}`,
        unknownFields: unknown,
        allowedFields: Array.from(ALLOWED_POST_RESULT_FIELDS),
      },
      { status: 400 }
    );
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

  const rawSingleUrl =
    body.externalPostUrl ??
    body.external_post_url ??
    body.postUrl ??
    body.post_url ??
    body.liveUrl ??
    body.live_url ??
    body.externalUrl ??
    body.external_url ??
    body.url ??
    body.link ??
    body.permalink;
  const now = new Date().toISOString();
  const singleUrl = sanitizeUrl(rawSingleUrl);
  const nextLinks: PipelineLinks = { ...(existing.links || {}) };
  const nextLinkPostedAt: Partial<Record<PlatformKey, string>> = {
    ...(existing.linkPostedAt || {}),
  };
  const touchedPlatforms = new Set<PlatformKey>();

  if (body.links && typeof body.links === 'object' && !Array.isArray(body.links)) {
    for (const [rawPlat, rawHref] of Object.entries(body.links)) {
      const plat = normalizePlatformKey(rawPlat);
      if (!plat) continue;
      const cleanHref = sanitizeUrl(rawHref);
      if (cleanHref) {
        if (nextLinks[plat] !== cleanHref || !nextLinkPostedAt[plat]) {
          nextLinkPostedAt[plat] = now;
        }
        nextLinks[plat] = cleanHref;
        touchedPlatforms.add(plat);
      }
    }
  }

  const explicitPlatform = normalizePlatformKey(body.platform);
  if (singleUrl) {
    const inferred = explicitPlatform || inferPlatformFromUrl(singleUrl);
    const resolvedPlat: PlatformKey =
      inferred ||
      (existing.channel === 'linkedin'
        ? 'linkedin'
        : existing.channel === 'x'
          ? 'x'
          : 'fb');
    if (nextLinks[resolvedPlat] !== singleUrl || !nextLinkPostedAt[resolvedPlat]) {
      nextLinkPostedAt[resolvedPlat] = now;
    }
    nextLinks[resolvedPlat] = singleUrl;
    touchedPlatforms.add(resolvedPlat);
  } else if (explicitPlatform) {
    touchedPlatforms.add(explicitPlatform);
  }

  if (ok && !Object.values(nextLinks).some(Boolean)) {
    return NextResponse.json(
      {
        error:
          'At least one valid http(s) live post URL is required when status is "posted" (pass externalPostUrl/url or links.{fb,ig,linkedin,x}).',
      },
      { status: 400 }
    );
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
  const errorText = typeof body.error === 'string' ? body.error.trim() : '';
  const isRateLimited =
    body.rateLimited === true || (!ok && isRateLimitErrorMessage(errorText));
  const dailyCount =
    typeof body.dailyCount === 'number' && Number.isFinite(body.dailyCount) && body.dailyCount >= 0
      ? Math.round(body.dailyCount)
      : undefined;
  const dailyLimit =
    typeof body.dailyLimit === 'number' && Number.isFinite(body.dailyLimit) && body.dailyLimit > 0
      ? Math.round(body.dailyLimit)
      : undefined;
  const resetAt =
    typeof body.resetAt === 'string' && body.resetAt.trim()
      ? body.resetAt.trim().slice(0, 80)
      : undefined;
  const isCaution =
    ok &&
    !isRateLimited &&
    (body.caution === true ||
      (dailyCount !== undefined && dailyLimit !== undefined && dailyCount >= dailyLimit));

  const nextStage = !ok
    ? isRateLimited
      ? existing.stage
      : 'drafted'
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
    readyForRotty: !ok
      ? isRateLimited
        ? existing.readyForRotty
        : false
      : waitingOnMorePlatforms
        ? existing.readyForRotty
        : false,
    postIt: !ok ? false : waitingOnMorePlatforms ? existing.postIt : false,
    claimedBy: undefined,
    leaseExpiresAt: undefined,
    links: Object.values(nextLinks).some(Boolean) ? nextLinks : undefined,
    linkPostedAt: Object.keys(nextLinkPostedAt).length > 0 ? nextLinkPostedAt : undefined,
    postedAssets: Object.keys(nextPostedAssets).length > 0 ? nextPostedAssets : undefined,
    note: !ok
      ? isRateLimited
        ? `Daily limit hit (${botName}): ${(errorText || 'rate limit reached').slice(0, 140)}${resetAt ? ` · queued for ${resetAt}` : ''}`
        : `Post failed (${botName}): ${(errorText || 'unknown error').slice(0, 140)}`
      : waitingOnMorePlatforms
        ? `Posted ${landedSummary || 'partial'} by ${botName}; awaiting: ${pendingPlatforms.join(', ')}`
        : singleUrl
          ? `Posted by ${botName} (${singleUrl})`
          : landedSummary
            ? `Posted ${landedSummary} by ${botName}`
            : `Posted by ${botName}`,
    updatedAt: now,
  };

  await opsSetDoc('ops_pipeline', id, updated as unknown as Record<string, unknown>);

  let limitAlert: ConnectorAlert | undefined;
  if (isRateLimited || isCaution) {
    const inferredAlertPlat =
      explicitPlatform ||
      (pendingPlatforms.length === 1
        ? pendingPlatforms[0]
        : existing.channel === 'linkedin'
          ? 'linkedin'
          : existing.channel === 'x'
            ? 'x'
            : existing.lane === 'fb-ig'
              ? 'ig'
              : 'fb');
    const platLabel = formatPlatformShortLabel(inferredAlertPlat);
    const ratio =
      dailyCount !== undefined && dailyLimit !== undefined
        ? ` (${dailyCount}/${dailyLimit})`
        : dailyCount !== undefined
          ? ` (${dailyCount} today)`
          : '';
    const alertMsg =
      errorText && isRateLimited
        ? errorText.slice(0, 300)
        : isRateLimited
          ? `${platLabel} daily limit hit${ratio}${resetAt ? ` — queued remaining for ${resetAt}` : ''}`
          : `${platLabel} caution line reached${ratio}${resetAt ? ` — holding ${platLabel} until ${resetAt}` : ' — holding remaining as pending'}`;
    limitAlert = {
      status: isRateLimited ? 'rate_limit' : 'caution',
      platform: inferredAlertPlat,
      count: dailyCount,
      limit: dailyLimit,
      resetAt,
      message: alertMsg,
      updatedAt: now,
    };

    const botAgentId = inferAgentId(botName);
    const crewDoc = await opsGetDoc<CrewMember>('ops_crew', `${existing.clientId}__${botAgentId}`);
    if (crewDoc) {
      await opsSetDoc('ops_crew', crewDoc.id, {
        ...crewDoc,
        connectorAlert: limitAlert,
        updatedAt: now,
        updatedBy: botName,
      } as unknown as Record<string, unknown>);
    }

    const chatAlert: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      clientId: existing.clientId,
      senderId: botAgentId,
      senderName: botName,
      senderKind: 'bot',
      text: `@Rotty ${isRateLimited ? 'DAILY LIMIT' : 'CAP CAUTION'} (${platLabel}): ${alertMsg} — on "${updated.title}".`,
      mentions: ['rotty'],
      jobId: updated.id,
      jobTitle: updated.title,
      createdAt: now,
    };
    await opsSetDoc('ops_chat', chatAlert.id, chatAlert as unknown as Record<string, unknown>);
  }

  await appendOpsActivity(
    existing.clientId,
    botName,
    !ok
      ? isRateLimited
        ? 'hit daily API limit'
        : 'reported post failure'
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
      rateLimited: isRateLimited,
      caution: isCaution,
      limitAlert,
      job: updated,
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
