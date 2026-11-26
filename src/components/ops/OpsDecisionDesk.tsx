'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import {
  AlertTriangle,
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Inbox,
  Pencil,
  Send,
} from 'lucide-react';
import {
  extractDriveFileId,
  getCardAssets,
  getCardCompleteness,
  getCardFormatBadges,
  getCardPublishedLinks,
  getEffectiveRequestStatus,
  getUpdateAlertMeta,
  POST_FORMAT_LABELS,
  resolveVisualPreviewUrl,
  splitTextWithUrls,
  type UpdateAlertKind,
} from '@/lib/ops/drop-parser';
import {
  DRIVE_TOKEN_EVENT,
  getGoogleDriveAccessToken,
  signInOpsWithGoogle,
} from '@/lib/ops/firebase-client';
import {
  assetPlatformLabel,
  assetStatusBadge,
  OpsAssetThumb,
} from './OpsAssetThumb';
import {
  extractPrimaryArticleUrl,
  OpsLinkCardPreview,
} from './OpsLinkCardPreview';
import type {
  CardAssetState,
  ClientLaneConfig,
  CrewMember,
  JobAsset,
  JobAssetKind,
  JobAssetPlatform,
  OpsRequest,
  PipelineCard,
  PipelineLane,
  PostFormat,
  RequestStatus,
} from '@/lib/ops/types';

type DeskTab = 'action' | 'approved' | 'ready' | 'requests' | 'drops' | 'posted' | 'all';

function subscribeDriveToken(cb: () => void) {
  window.addEventListener(DRIVE_TOKEN_EVENT, cb);
  return () => window.removeEventListener(DRIVE_TOKEN_EVENT, cb);
}

const getDriveTokenSnapshot = () => Boolean(getGoogleDriveAccessToken());
const getDriveTokenServerSnapshot = () => false;

type DeskItem =
  | { kind: 'post'; key: string; card: PipelineCard }
  | { kind: 'request'; key: string; request: OpsRequest };

function isReadyItem(card: PipelineCard): boolean {
  if (card.stage !== 'approved' || !card.readyForRotty) return false;
  const comp = getCardCompleteness(card);
  if (comp.canApproveReady) return true;
  return Boolean(
    card.postIt && (comp.lockReason === 'needs_alt_text' || comp.lockReason === 'needs_credit')
  );
}

function isApprovedCrewItem(card: PipelineCard): boolean {
  return card.stage === 'approved' && !isReadyItem(card);
}

function isActionItem(card: PipelineCard): boolean {
  return card.stage === 'drafted';
}

function stageBadge(card: PipelineCard): { label: string; cls: string } {
  if (card.stage === 'posted') {
    return {
      label: 'Posted',
      cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    };
  }
  if (card.postIt && isReadyItem(card)) {
    return {
      label: 'Post it Armed',
      cls: 'border-emerald-500/55 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold',
    };
  }
  if (isReadyItem(card)) {
    return {
      label: 'Ready for Rotty',
      cls: 'border-cyan-500/45 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    };
  }
  if (card.stage === 'approved') {
    return {
      label: 'Approved',
      cls: 'border-violet-500/45 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    };
  }
  if (card.stage === 'drafted') {
    return {
      label: 'Drafted',
      cls: 'border-accent/40 bg-accent/10 text-accent',
    };
  }
  if (card.stage === 'clearance') {
    return {
      label: 'Clearance',
      cls: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    };
  }
  return {
    label: 'Pulled',
    cls: 'border-border bg-muted text-muted-foreground',
  };
}

function renderLinkifiedText(text: string) {
  return splitTextWithUrls(text).map((seg, i) =>
    seg.type === 'url' ? (
      <a
        key={`url-${i}`}
        href={seg.value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline underline-offset-2 hover:opacity-85 break-all"
      >
        {seg.value}
      </a>
    ) : (
      <span key={`txt-${i}`}>{seg.value}</span>
    )
  );
}

function assetStateBadge(state: CardAssetState): { label: string; cls: string } {
  if (state === 'attached') {
    return {
      label: 'Asset attached',
      cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    };
  }
  if (state === 'not_needed') {
    return {
      label: 'No image needed',
      cls: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    };
  }
  return {
    label: 'Asset missing',
    cls: 'border-amber-500/45 bg-amber-500/15 text-amber-700 dark:text-amber-300',
  };
}

function requestStatusBadge(status: RequestStatus): { label: string; cls: string } {
  if (status === 'done') {
    return {
      label: 'Done',
      cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    };
  }
  if (status === 'decided') {
    return {
      label: 'Decided · Awaiting Bot',
      cls: 'border-cyan-500/45 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    };
  }
  if (status === 'dismissed') {
    return {
      label: 'Dismissed',
      cls: 'border-border bg-muted text-muted-foreground',
    };
  }
  if (status === 'expired') {
    return {
      label: 'Expired',
      cls: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    };
  }
  return {
    label: 'Needs Decision',
    cls: 'border-violet-500/45 bg-violet-500/15 text-violet-700 dark:text-violet-300 font-semibold',
  };
}

function isDropItem(card: PipelineCard): boolean {
  return (card.stage === 'pulled' || card.stage === 'clearance') && !card.readyForRotty;
}

export default function OpsDecisionDesk({
  pipeline,
  requests,
  crew = [],
  lanes,
  nowMs,
  busy,
  highlightKinds,
  unseenIds,
  onMarkSeen,
  onMarkAllSeen,
  onEditCard,
  onAssignCard,
  onAssignAssetTask,
  onSetPostFormat,
  onApproveReady,
  onMarkReady,
  onSetNoImageNeeded,
  onUpdateAsset,
  onReorderAssets,
  onPreviewAsset,
  onPostIt,
  onCancelPostIt,
  onKillCard,
  onDecideRequest,
  onToast,
}: {
  pipeline: PipelineCard[];
  requests: OpsRequest[];
  crew?: CrewMember[];
  lanes: ClientLaneConfig[];
  nowMs: number;
  busy: boolean;
  highlightKinds: Map<string, UpdateAlertKind>;
  unseenIds?: Set<string>;
  onMarkSeen?: (id: string) => void;
  onMarkAllSeen?: () => void;
  onEditCard: (card: PipelineCard) => void;
  onAssignCard?: (card: PipelineCard, assignedTo: string) => Promise<void>;
  onAssignAssetTask?: (
    card: PipelineCard,
    asset: { assignedTo: string; kind: JobAssetKind; platform: JobAssetPlatform; spec?: string }
  ) => Promise<void>;
  onSetPostFormat?: (card: PipelineCard, postFormat: PostFormat | null) => Promise<void>;
  onApproveReady: (card: PipelineCard) => Promise<void>;
  onMarkReady?: (card: PipelineCard) => Promise<void>;
  onSetNoImageNeeded: (card: PipelineCard, enabled: boolean) => Promise<void>;
  onUpdateAsset: (card: PipelineCard, assetId: string, patch: Record<string, unknown>) => Promise<void>;
  onReorderAssets: (card: PipelineCard, assetIds: string[]) => Promise<void>;
  onPreviewAsset: (asset: JobAsset) => void;
  onPostIt: (card: PipelineCard) => Promise<void>;
  onCancelPostIt: (card: PipelineCard) => Promise<void>;
  onKillCard: (card: PipelineCard) => Promise<void>;
  onDecideRequest: (req: OpsRequest, decision: string, label: string) => Promise<void>;
  onToast: (msg: string) => void;
}) {
  const [tab, setTab] = useState<DeskTab>('action');
  const [laneFilter, setLaneFilter] = useState<PipelineLane | 'all'>('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [focusedAssetId, setFocusedAssetId] = useState<string | null>(null);
  const [dragAssetId, setDragAssetId] = useState<string | null>(null);
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string | null>(null);
  const [assignAssetOpen, setAssignAssetOpen] = useState(false);
  const [assignAssetBot, setAssignAssetBot] = useState('');
  const [assignAssetKind, setAssignAssetKind] = useState<JobAssetKind>('image');
  const [assignAssetPlatform, setAssignAssetPlatform] = useState<JobAssetPlatform>('all');
  const [assignAssetSpec, setAssignAssetSpec] = useState('');
  const [metaEditAssetId, setMetaEditAssetId] = useState<string | null>(null);
  const [metaEditAlt, setMetaEditAlt] = useState('');
  const [metaEditCredit, setMetaEditCredit] = useState('');
  const openAssetMetaEditor = (asset: JobAsset) => {
    setFocusedAssetId(asset.id);
    setMetaEditAssetId(asset.id);
    setMetaEditAlt(asset.altText || '');
    setMetaEditCredit(asset.credit || '');
  };
  const effectiveAssignBot =
    assignAssetBot ||
    crew.find((c) => c.agentId === 'pixel')?.agentId ||
    crew[0]?.agentId ||
    'pixel';
  const hasDriveToken = useSyncExternalStore(
    subscribeDriveToken,
    getDriveTokenSnapshot,
    getDriveTokenServerSnapshot
  );

  const counts = useMemo(() => {
    const active = pipeline.filter((c) => c.stage !== 'archived');
    const openReqs = requests.filter((r) => {
      const st = getEffectiveRequestStatus(r, nowMs);
      return st === 'pending' || st === 'decided';
    });
    return {
      action: active.filter(isActionItem).length + openReqs.length,
      approved: active.filter(isApprovedCrewItem).length,
      ready: active.filter(isReadyItem).length,
      requests: requests.length,
      drops: active.filter(isDropItem).length,
      posted: active.filter((c) => c.stage === 'posted').length,
      all: active.length + requests.length,
    };
  }, [pipeline, requests, nowMs]);

  const items = useMemo<DeskItem[]>(() => {
    const postItems: DeskItem[] =
      tab === 'requests'
        ? []
        : pipeline
            .filter((card) => {
              if (card.stage === 'archived') return false;
              if (laneFilter !== 'all' && card.lane !== laneFilter) return false;
              if (tab === 'action') return isActionItem(card);
              if (tab === 'approved') return isApprovedCrewItem(card);
              if (tab === 'ready') return isReadyItem(card);
              if (tab === 'drops') return isDropItem(card);
              if (tab === 'posted') return card.stage === 'posted';
              return true;
            })
            .map((card) => ({ kind: 'post', key: `post:${card.id}`, card }));

    const requestItems: DeskItem[] =
      tab === 'approved' || tab === 'ready' || tab === 'drops' || tab === 'posted' || laneFilter !== 'all'
        ? []
        : requests
            .filter((req) => {
              const st = getEffectiveRequestStatus(req, nowMs);
              if (tab === 'action') return st === 'pending' || st === 'decided';
              return true;
            })
            .map((request) => ({ kind: 'request', key: `req:${request.id}`, request }));

    const rankItem = (item: DeskItem): number => {
      if (item.kind === 'request') {
        const st = getEffectiveRequestStatus(item.request, nowMs);
        if (st === 'pending') {
          if (item.request.urgency === 'urgent') return 0;
          if (item.request.urgency === 'high') return 1;
          return 2;
        }
        if (st === 'decided') return 3;
        return 6;
      }
      const c = item.card;
      if (isReadyItem(c)) return c.postIt ? 1 : 0;
      if (c.stage === 'approved') return 2;
      if (c.stage === 'drafted') return 3;
      if (c.stage === 'clearance') return 4;
      if (c.stage === 'pulled') return 5;
      return 6;
    };

    const stampOf = (item: DeskItem): string =>
      item.kind === 'request'
        ? item.request.updatedAt || item.request.raisedAt || ''
        : item.card.updatedAt || '';

    return [...postItems, ...requestItems].sort((a, b) => {
      const rDiff = rankItem(a) - rankItem(b);
      if (rDiff !== 0) return rDiff;
      return stampOf(b).localeCompare(stampOf(a));
    });
  }, [pipeline, requests, tab, laneFilter, nowMs]);

  const selectedIndex = useMemo(() => {
    if (items.length === 0) return -1;
    if (!selectedKey) return 0;
    const idx = items.findIndex((i) => i.key === selectedKey);
    return idx >= 0 ? idx : 0;
  }, [items, selectedKey]);

  const selectedItem = selectedIndex >= 0 ? items[selectedIndex] : null;
  const selectedCard = selectedItem?.kind === 'post' ? selectedItem.card : null;
  const selectedRequest = selectedItem?.kind === 'request' ? selectedItem.request : null;

  const selectedCompleteness = selectedCard ? getCardCompleteness(selectedCard) : null;
  const selectedCardAssets = selectedCard ? getCardAssets(selectedCard) : [];
  const focusedAsset =
    selectedCardAssets.find((a) => a.id === focusedAssetId) || selectedCardAssets[0] || null;
  const rawPreviewSource = selectedRequest?.preparedUrl?.trim() || undefined;
  const previewUrl = rawPreviewSource ? resolveVisualPreviewUrl(rawPreviewSource, 1200) : undefined;
  const hasPreviewError = Boolean(previewUrl && failedPreviewUrl === previewUrl);

  const selectedIsReady = selectedCard ? isReadyItem(selectedCard) : false;
  const selectedActiveClaim = Boolean(
    selectedCard?.claimedBy &&
      (!selectedCard.leaseExpiresAt || new Date(selectedCard.leaseExpiresAt).getTime() > nowMs)
  );

  const linkList = selectedCard
    ? [
        selectedCard.links?.fb ? { label: 'FB', href: selectedCard.links.fb } : null,
        selectedCard.links?.ig ? { label: 'IG', href: selectedCard.links.ig } : null,
        selectedCard.links?.linkedin ? { label: 'LI', href: selectedCard.links.linkedin } : null,
        selectedCard.links?.x ? { label: 'X', href: selectedCard.links.x } : null,
      ].filter((x): x is { label: string; href: string } => Boolean(x))
    : [];
  const selectedPublishedLinks = selectedCard ? getCardPublishedLinks(selectedCard) : [];
  const selectedRequestStatus = selectedRequest ? getEffectiveRequestStatus(selectedRequest, nowMs) : null;
  const selectedLinkedCard = selectedRequest?.jobId
    ? pipeline.find((c) => c.id === selectedRequest.jobId) || null
    : null;

  const nextItemKeyAfter = (actedKey: string): string | null => {
    const remaining = items.filter((item) => {
      if (item.key === actedKey) return false;
      if (tab === 'ready' && item.kind === 'post') return !item.card.postIt;
      return true;
    });
    const pool = remaining.length > 0 ? remaining : items.filter((i) => i.key !== actedKey);
    if (pool.length === 0) return null;
    const afterCurrent = pool.find((candidate) => {
      const idx = items.findIndex((i) => i.key === candidate.key);
      return idx > selectedIndex;
    });
    return (afterCurrent || pool[0]).key;
  };

  const tabs: Array<{ id: DeskTab; label: string; count: number }> = [
    { id: 'action', label: 'Needs You', count: counts.action },
    { id: 'approved', label: 'Approved', count: counts.approved },
    { id: 'ready', label: 'Ready to Post', count: counts.ready },
    { id: 'requests', label: 'Requests', count: counts.requests },
    { id: 'drops', label: 'Drops', count: counts.drops },
    { id: 'posted', label: 'Posted', count: counts.posted },
    { id: 'all', label: 'All', count: counts.all },
  ];

  const tabAlerts = useMemo<Record<DeskTab, { live?: UpdateAlertKind; unseenCount: number }>>(() => {
    const inspect = (matchCards: PipelineCard[], matchReqs: OpsRequest[]) => {
      let live: UpdateAlertKind | undefined;
      let unseenCount = 0;
      for (const c of matchCards) {
        const k = highlightKinds.get(c.id);
        if (k === 'new') live = 'new';
        else if (k === 'updated' && !live) live = 'updated';
        if (unseenIds?.has(c.id)) unseenCount += 1;
      }
      for (const r of matchReqs) {
        const k = highlightKinds.get(r.id);
        if (k === 'new') live = 'new';
        else if (k === 'updated' && !live) live = 'updated';
        if (unseenIds?.has(r.id)) unseenCount += 1;
      }
      return { live, unseenCount };
    };

    const active = pipeline.filter((c) => c.stage !== 'archived');
    const openReqs = requests.filter((r) => {
      const st = getEffectiveRequestStatus(r, nowMs);
      return st === 'pending' || st === 'decided';
    });

    return {
      action: inspect(active.filter(isActionItem), openReqs),
      approved: inspect(active.filter(isApprovedCrewItem), []),
      ready: inspect(active.filter(isReadyItem), []),
      requests: inspect([], requests),
      drops: inspect(active.filter(isDropItem), []),
      posted: inspect(active.filter((c) => c.stage === 'posted'), []),
      all: inspect(active, requests),
    };
  }, [pipeline, requests, nowMs, highlightKinds, unseenIds]);

  return (
    <section className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2.5 lg:h-[620px] overflow-hidden [overflow-anchor:none]">
      {/* Compact Dynamic Queue Header (auto-advances after each decision) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/70 shrink-0">
        <div className="flex flex-wrap items-center gap-1">
          {tabs.map((t) => {
            const active = tab === t.id;
            const tState = tabAlerts[t.id];
            const alertMeta = getUpdateAlertMeta(tState?.live);
            const hasUnseen = (tState?.unseenCount || 0) > 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setSelectedKey(null);
                  setFocusedAssetId(null);
                }}
                title={hasUnseen ? `${tState.unseenCount} unseen update(s) in ${t.label}` : undefined}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  alertMeta && !active
                    ? alertMeta.tabBorderCls
                    : active && alertMeta
                      ? `${alertMeta.tabBorderCls} font-semibold ring-1 ring-current/25`
                      : hasUnseen && !active
                        ? 'border-amber-500/60 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                        : active
                          ? 'border-accent bg-accent/15 text-foreground font-semibold'
                          : 'border-border bg-background hover:border-accent/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {alertMeta ? (
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${alertMeta.dotCls}`} />
                ) : hasUnseen ? (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-400" />
                ) : null}
                <span>
                  {t.label}{' '}
                  <span className="font-mono text-[11px] opacity-80">({t.count})</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {unseenIds && unseenIds.size > 0 && onMarkAllSeen && (
            <button
              type="button"
              onClick={onMarkAllSeen}
              title="Clear persistent unseen update markers"
              className="px-2 py-1 rounded-lg text-[10px] font-mono border border-amber-500/45 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20"
            >
              Mark seen ({unseenIds.size})
            </button>
          )}
          <select
            aria-label="Filter by lane"
            value={laneFilter}
            onChange={(e) => {
              setLaneFilter(e.target.value as PipelineLane | 'all');
              setSelectedKey(null);
            }}
            className="px-2 py-1 rounded-md text-[11px] font-mono border border-border bg-background text-foreground focus:outline-none focus:border-accent"
          >
            <option value="all">All Lanes</option>
            {lanes.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Master-Detail Desk Body */}
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 rounded-lg border border-dashed border-border bg-background/40 space-y-2.5">
          <Inbox className="w-7 h-7 text-accent/70" />
          <div className="text-sm font-semibold text-foreground">
            {tab === 'action'
              ? 'All caught up — nothing waiting on your decision'
              : 'No items in this view'}
          </div>
          <p className="text-xs text-muted-foreground max-w-md">
            {tab === 'action'
              ? counts.drops > 0
                ? `${counts.drops} item${counts.drops === 1 ? ' is' : 's are'} in Drops & Clearance with the crew right now.`
                : 'As bots pull stories, clear facts, and draft copy, finished items surface here automatically.'
              : 'Try switching tabs or clearing the lane filter.'}
          </p>
          {tab === 'action' && counts.drops > 0 && (
            <button
              type="button"
              onClick={() => setTab('drops')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:border-accent text-foreground"
            >
              View Drops &amp; Clearance ({counts.drops})
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)] gap-3">
          {/* Inbox List */}
          <div className="min-h-0 overflow-y-auto overscroll-contain [overflow-anchor:none] ops-scroll pr-1 space-y-1.5 max-h-64 lg:max-h-none">
            {items.map((item) => {
              const selected = selectedItem?.key === item.key;

              if (item.kind === 'request') {
                const req = item.request;
                const reqStatus = getEffectiveRequestStatus(req, nowMs);
                const badge = requestStatusBadge(reqStatus);
                const reqAlert = getUpdateAlertMeta(highlightKinds.get(req.id));
                const reqUnseen = Boolean(unseenIds?.has(req.id));

                return (
                  <div
                    key={item.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedKey(item.key);
                      onMarkSeen?.(req.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedKey(item.key);
                        onMarkSeen?.(req.id);
                      }
                    }}
                    className={`w-full text-left rounded-lg border p-2.5 transition-all duration-300 space-y-1 cursor-pointer ${
                      reqAlert
                        ? reqAlert.cardBorderCls
                        : selected
                          ? 'border-accent bg-accent/10'
                          : reqUnseen
                            ? 'border-amber-500/45 border-l-4 border-l-amber-400 bg-amber-500/[0.04] hover:border-accent/50'
                            : 'border-border bg-background/60 hover:border-accent/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono">
                      <div className="flex flex-wrap items-center gap-1 min-w-0">
                        {reqAlert ? (
                          <span className={`px-1 py-0 rounded border shrink-0 text-[9px] ${reqAlert.badgeCls}`}>
                            {reqAlert.label}
                          </span>
                        ) : reqUnseen ? (
                          <span className="px-1 py-0 rounded border border-amber-500/45 bg-amber-500/15 text-amber-800 dark:text-amber-300 shrink-0 text-[9px] font-semibold">
                            NEW
                          </span>
                        ) : null}
                        <span className="px-1.5 py-0.2 rounded bg-violet-500/15 text-violet-700 dark:text-violet-300 uppercase shrink-0 font-semibold">
                          Request
                        </span>
                        <span className={`px-1.5 py-0.2 rounded border shrink-0 ${badge.cls}`}>
                          {badge.label}
                        </span>
                        {req.urgency && req.urgency !== 'normal' && (
                          <span className="px-1 py-0.2 rounded border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300 uppercase shrink-0">
                            {req.urgency}
                          </span>
                        )}
                      </div>
                      <span className="text-accent truncate">{req.raisedByName}</span>
                    </div>

                    <div className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                      {req.title}
                    </div>

                    <div className="text-[11px] text-muted-foreground line-clamp-1">{req.context}</div>

                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
                      <span className="truncate">
                        {req.actions.map((a) => a.label).slice(0, 2).join(' · ')}
                      </span>
                      <span className="shrink-0">
                        {req.relevantUntil ? `Until ${req.relevantUntil.slice(0, 10)}` : req.raisedAt?.slice(11, 16) || ''}
                      </span>
                    </div>
                  </div>
                );
              }

              const card = item.card;
              const badge = stageBadge(card);
              const cardAlert = getUpdateAlertMeta(highlightKinds.get(card.id));
              const cardUnseen = Boolean(unseenIds?.has(card.id));
              const completeness = getCardCompleteness(card);
              const cardAssets = getCardAssets(card);
              const cardLiveLinks = getCardPublishedLinks(card);
              const fmt = getCardFormatBadges(card);
              const hasDelivered = cardAssets.some((a) => a.status === 'delivered');
              const hasRejected = cardAssets.some((a) => a.status === 'rejected');
              const hasNeeded = cardAssets.some(
                (a) => a.status === 'needed' || a.status === 'in_progress'
              );
              const thumbAsset =
                cardAssets.find((a) => Boolean(a.url?.trim() || a.file?.trim())) || null;
              const listArticleUrl = !thumbAsset ? extractPrimaryArticleUrl(card) : null;

              return (
                <div
                  key={item.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedKey(item.key);
                    onMarkSeen?.(card.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedKey(item.key);
                      onMarkSeen?.(card.id);
                    }
                  }}
                  className={`w-full text-left rounded-lg border p-2.5 transition-all duration-300 space-y-1 cursor-pointer ${
                    cardAlert
                      ? cardAlert.cardBorderCls
                      : selected
                        ? 'border-accent bg-accent/10'
                        : cardUnseen
                          ? 'border-amber-500/45 border-l-4 border-l-amber-400 bg-amber-500/[0.04] hover:border-accent/50'
                          : 'border-border bg-background/60 hover:border-accent/50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono">
                    <div className="flex flex-wrap items-center gap-1 min-w-0">
                      {cardAlert ? (
                        <span className={`px-1 py-0 rounded border shrink-0 text-[9px] ${cardAlert.badgeCls}`}>
                          {cardAlert.label}
                        </span>
                      ) : cardUnseen ? (
                        <span className="px-1 py-0 rounded border border-amber-500/45 bg-amber-500/15 text-amber-800 dark:text-amber-300 shrink-0 text-[9px] font-semibold">
                          UPDATED
                        </span>
                      ) : null}
                      <span className="px-1.5 py-0.2 rounded bg-muted text-foreground uppercase shrink-0">
                        {card.lane}
                      </span>
                      <span className="px-1.5 py-0.2 rounded border border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold shrink-0">
                        {fmt.primary}{fmt.secondary ? ` · ${fmt.secondary}` : ''}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded border shrink-0 ${badge.cls}`}>
                        {badge.label}
                      </span>
                      {Boolean(card.artifactsNeeded?.length) && (
                        <span title={`Artifacts needed: ${card.artifactsNeeded?.join(', ')}`}>
                          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                        </span>
                      )}
                    </div>
                    {card.assignedTo && (
                      <span className="text-accent truncate shrink-0">→ {card.assignedTo}</span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                        {card.title}
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
                        <span className="inline-flex items-center gap-1 truncate">
                          {cardAssets.length > 0 ? (
                            <span
                              className={`inline-flex items-center gap-1 ${
                                hasRejected
                                  ? 'text-red-600 dark:text-red-400 font-semibold'
                                  : hasDelivered
                                    ? 'text-amber-700 dark:text-amber-300 font-semibold'
                                    : completeness.canApproveReady
                                      ? 'text-emerald-700 dark:text-emerald-300'
                                      : hasNeeded
                                        ? 'text-amber-700 dark:text-amber-300'
                                        : 'text-cyan-700 dark:text-cyan-300'
                              }`}
                            >
                              <ImageIcon className="w-2.5 h-2.5 shrink-0" />
                              {hasRejected
                                ? 'Asset rejected'
                                : hasDelivered
                                  ? `Review (${cardAssets.filter((a) => a.status === 'delivered').length})`
                                  : completeness.canApproveReady
                                    ? `Assets ready (${cardAssets.length})`
                                    : hasNeeded
                                      ? 'Asset needed'
                                      : `${cardAssets.length} ${cardAssets.length === 1 ? 'asset' : 'assets'}`}
                            </span>
                          ) : completeness.assetState === 'not_needed' ? (
                            <span className="text-sky-700 dark:text-sky-300">
                              {listArticleUrl ? 'Link card · No photo' : 'No image needed'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-amber-700 dark:text-amber-300">
                              <AlertTriangle className="w-2.5 h-2.5" /> Asset missing
                            </span>
                          )}
                        </span>
                        <span className="truncate">
                          {card.agentId} · {card.updatedAt?.slice(11, 16) || card.jobDate || ''}
                        </span>
                      </div>
                    </div>

                    {(thumbAsset || listArticleUrl) && (
                      <div className="w-12 h-12 rounded-md border border-border overflow-hidden bg-muted/30 shrink-0">
                        {thumbAsset ? (
                          <OpsAssetThumb asset={thumbAsset} size="thumb" className="w-full h-full object-cover" />
                        ) : listArticleUrl ? (
                          <OpsLinkCardPreview url={listArticleUrl} variant="thumb" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                    )}
                  </div>

                  {cardLiveLinks.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      {cardLiveLinks.map((l) => (
                        <a
                          key={`${l.platform}-${l.href}`}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={`Preview ${l.label} post: ${l.href}`}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 hover:underline"
                        >
                          {l.shortLabel} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                      {card.postedAssets && Object.keys(card.postedAssets).length > 0 && (
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                          · Sent assets:{' '}
                          {Object.entries(card.postedAssets)
                            .map(([p, ids]) => `${p.toUpperCase()}(${ids?.length || 0})`)
                            .join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Full Draft Decision Reader */}
          {selectedCard && selectedCompleteness && (() => {
            const readerAlert = getUpdateAlertMeta(highlightKinds.get(selectedCard.id));
            return (
            <div
              className={`min-h-0 flex flex-col rounded-lg border overflow-hidden transition-all duration-300 ${
                readerAlert ? readerAlert.cardBorderCls : 'border-border bg-background/70'
              }`}
            >
              {/* Reader Header + Navigation */}
              <div className="px-3.5 py-2.5 border-b border-border/80 flex flex-wrap items-start justify-between gap-2 bg-card/50 shrink-0">
                <div className="min-w-0 flex-1 space-y-1">
                  {(() => {
                    const fmt = getCardFormatBadges(selectedCard);
                    return (
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                        {readerAlert && (
                          <span className={`px-1.5 py-0.5 rounded border ${readerAlert.badgeCls}`}>
                            {readerAlert.label}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-muted text-foreground uppercase">
                          {selectedCard.lane}
                        </span>
                        {onSetPostFormat && selectedCard.stage !== 'posted' && selectedCard.stage !== 'archived' ? (
                          <select
                            aria-label="Deliverable type / format"
                            value={selectedCard.postFormat || ''}
                            disabled={busy}
                            onChange={(e) => {
                              const v = e.target.value;
                              void onSetPostFormat(selectedCard, v ? (v as PostFormat) : null);
                            }}
                            title="Deliverable format (auto-detected if left on Auto)"
                            className="px-1.5 py-0.5 rounded border border-indigo-500/45 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px] focus:outline-none focus:border-accent disabled:opacity-50"
                          >
                            <option value="">
                              Type: {fmt.primary}{fmt.secondary ? ` · ${fmt.secondary}` : ''} (Auto)
                            </option>
                            {(Object.entries(POST_FORMAT_LABELS) as Array<[PostFormat, string]>).map(([k, lbl]) => (
                              <option key={`fmt-${k}`} value={k}>
                                {lbl}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded border border-indigo-500/45 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold">
                            {fmt.primary}{fmt.secondary ? ` · ${fmt.secondary}` : ''}
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded border ${stageBadge(selectedCard).cls}`}>
                          {stageBadge(selectedCard).label}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded border ${
                            assetStateBadge(selectedCompleteness.assetState).cls
                          }`}
                        >
                          {assetStateBadge(selectedCompleteness.assetState).label}
                        </span>
                        {selectedCard.verdictTag && (
                          <span className="px-1.5 py-0.5 rounded border border-border bg-card text-foreground uppercase">
                            {selectedCard.verdictTag}
                          </span>
                        )}
                        <span className="text-muted-foreground font-mono">
                          By {selectedCard.agentId}
                        </span>
                        {selectedCard.marleyReviewedBy && (
                          <span className="text-muted-foreground font-mono">
                            · Cleared by {selectedCard.marleyReviewedBy}
                          </span>
                        )}
                        {selectedCard.assignedTo && (
                          <span className="px-1.5 py-0.5 rounded border border-accent/35 bg-accent/10 text-accent">
                            → {selectedCard.assignedTo}
                          </span>
                        )}
                        {selectedCard.stage === 'posted' &&
                          Boolean(selectedCard.note && /\b(needs marley review|not posted|not ready)\b/i.test(selectedCard.note)) && (
                            <span
                              className="px-1.5 py-0.5 rounded border border-amber-500/45 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                              title="Card note still has pre-post draft text"
                            >
                              Stale note
                            </span>
                          )}
                        {selectedCard.eventDate && (
                          <span className="text-muted-foreground">Event: {selectedCard.eventDate}</span>
                        )}
                      </div>
                    );
                  })()}
                  <h3 className="text-sm font-bold text-foreground leading-snug">
                    {selectedCard.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-mono text-muted-foreground mr-1">
                    {selectedIndex + 1}/{items.length}
                  </span>
                  <button
                    type="button"
                    aria-label="Previous item"
                    disabled={selectedIndex <= 0}
                    onClick={() => setSelectedKey(items[selectedIndex - 1]?.key || null)}
                    className="p-1 rounded border border-border bg-background hover:border-accent disabled:opacity-35"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next item"
                    disabled={selectedIndex >= items.length - 1}
                    onClick={() => setSelectedKey(items[selectedIndex + 1]?.key || null)}
                    className="p-1 rounded border border-border bg-background hover:border-accent disabled:opacity-35"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Full Draft + Image + Source */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [overflow-anchor:none] ops-scroll p-3.5 space-y-3.5">
                {/* Published Post Live Links (prominent at top of details) */}
                {(selectedCard.stage === 'posted' || selectedPublishedLinks.length > 0) && (
                  <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      {selectedPublishedLinks.length > 0 ? 'Live Published Post' : 'Published'}
                    </span>
                    {selectedPublishedLinks.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {selectedPublishedLinks.map((l) => (
                          <a
                            key={`${l.platform}-${l.href}`}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={l.href}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                          >
                            Preview {l.label} <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        No live post URL saved on this card — click Edit to add one.
                      </span>
                    )}
                  </div>
                )}

                {/* Multi-Asset Preview & Carousel Strip */}
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-border/70 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span className="font-semibold text-foreground">
                        Assets ({selectedCardAssets.length})
                      </span>
                      <span
                        className={`px-1.5 py-0 rounded border ${
                          assetStateBadge(selectedCompleteness.assetState).cls
                        }`}
                      >
                        {assetStateBadge(selectedCompleteness.assetState).label}
                      </span>
                      {!selectedCompleteness.canApproveReady && selectedCompleteness.buttonReason && (
                        <span className="px-1.5 py-0 rounded border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                          {selectedCompleteness.buttonReason}
                        </span>
                      )}
                      {selectedCard.assignedTo && (
                        <span className="px-1.5 py-0 rounded border border-accent/35 bg-accent/10 text-accent">
                          Assigned → {selectedCard.assignedTo}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {selectedCardAssets.some((a) => Boolean(extractDriveFileId(a.url) || extractDriveFileId(a.file, true))) && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={async () => {
                              try {
                                await signInOpsWithGoogle({ requireDriveToken: true });
                                onToast('Google Drive connected — reloading previews');
                              } catch (err) {
                                onToast(err instanceof Error ? err.message : 'Unable to connect Google Drive');
                              }
                            }}
                            title={
                              hasDriveToken
                                ? 'Refresh or switch Google Drive account for private Drive previews'
                                : 'Grant temporary Google Drive read access so private Drive images render inline'
                            }
                            className="px-2 py-0.5 rounded border border-cyan-500/45 bg-cyan-500/10 hover:bg-cyan-500/20 text-[10px] font-mono text-cyan-700 dark:text-cyan-300 disabled:opacity-50"
                          >
                            {hasDriveToken ? 'Reconnect Drive' : 'Connect Drive'}
                          </button>
                        )}
                      {focusedAsset?.url && (
                        <a
                          href={focusedAsset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-accent hover:underline"
                        >
                          Open Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {selectedCard.stage !== 'posted' && selectedCard.stage !== 'archived' && (
                        <>
                          {onAssignAssetTask && (selectedCardAssets.length > 0 || selectedCompleteness.noImageNeeded) && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => setAssignAssetOpen((v) => !v)}
                              className="px-2 py-0.5 rounded border border-accent/40 bg-accent/10 hover:bg-accent/20 text-[10px] text-accent disabled:opacity-50"
                            >
                              {assignAssetOpen ? 'Hide assign' : '+ Assign asset bot'}
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onEditCard(selectedCard)}
                            className="px-2 py-0.5 rounded border border-border bg-background hover:border-accent text-[10px] text-foreground disabled:opacity-50"
                          >
                            {selectedCardAssets.length > 0 ? 'Manage assets' : 'Attach asset'}
                          </button>
                          {selectedCardAssets.length === 0 &&
                            (selectedCompleteness.noImageNeeded ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => onSetNoImageNeeded(selectedCard, false)}
                                className="px-2 py-0.5 rounded border border-border bg-background hover:border-amber-500/60 text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-50"
                              >
                                Require photo
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => onSetNoImageNeeded(selectedCard, true)}
                                title="Explicit operator exception for text-only posts (e.g. breaking local news)"
                                className="px-2 py-0.5 rounded border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-[10px] text-sky-700 dark:text-sky-300 disabled:opacity-50"
                              >
                                No image needed
                              </button>
                            ))}
                        </>
                      )}
                    </div>
                  </div>

                  {selectedCardAssets.length > 0 ? (
                    <div className="space-y-0">
                      {/* Draggable Thumbnail Strip */}
                      <div className="px-2.5 py-2 border-b border-border/60 bg-muted/15 flex flex-wrap items-center gap-2">
                        {selectedCardAssets.map((asset, idx) => {
                          const isFocused = focusedAsset?.id === asset.id;
                          const st = assetStatusBadge(asset.status);
                          return (
                            <div
                              key={asset.id}
                              draggable={selectedCardAssets.length > 1 && !busy}
                              onDragStart={() => setDragAssetId(asset.id)}
                              onDragOver={(e) => {
                                if (dragAssetId && dragAssetId !== asset.id) e.preventDefault();
                              }}
                              onDrop={async (e) => {
                                e.preventDefault();
                                if (!dragAssetId || dragAssetId === asset.id) return;
                                const ids = selectedCardAssets.map((a) => a.id);
                                const fromIdx = ids.indexOf(dragAssetId);
                                const toIdx = ids.indexOf(asset.id);
                                if (fromIdx < 0 || toIdx < 0) return;
                                ids.splice(fromIdx, 1);
                                ids.splice(toIdx, 0, dragAssetId);
                                setDragAssetId(null);
                                await onReorderAssets(selectedCard, ids);
                              }}
                              onDragEnd={() => setDragAssetId(null)}
                              onClick={() => setFocusedAssetId(asset.id)}
                              title={`${asset.kind.replace('_', ' ')} (${assetPlatformLabel(asset.platform)}) · ${st.label}${selectedCardAssets.length > 1 ? ' — drag to reorder' : ''}`}
                              className={`group relative w-16 h-16 rounded-md border overflow-hidden cursor-pointer transition-all shrink-0 ${
                                isFocused
                                  ? 'border-accent ring-2 ring-accent/40'
                                  : 'border-border hover:border-accent/60'
                              }`}
                            >
                              <OpsAssetThumb asset={asset} size="thumb" className="w-full h-full object-cover" />
                              <span className="absolute top-0.5 left-0.5 px-1 py-0 rounded bg-black/75 text-white text-[9px] font-mono leading-tight">
                                {assetPlatformLabel(asset.platform)}
                              </span>
                              <span
                                className={`absolute bottom-0.5 right-0.5 px-1 py-0 rounded text-[9px] font-mono leading-tight border ${st.cls}`}
                              >
                                {asset.status === 'approved'
                                  ? '✓'
                                  : asset.status === 'rejected'
                                    ? '✕'
                                    : `#${idx + 1}`}
                              </span>
                            </div>
                          );
                        })}
                        {selectedCardAssets.length > 1 && (
                          <span className="text-[10px] font-mono text-muted-foreground ml-1">
                            Drag thumbnails to reorder
                          </span>
                        )}
                      </div>

                      {/* Focused Asset Preview + Metadata + Per-Asset Review */}
                      {focusedAsset && (
                        <div className="p-2.5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-start bg-muted/10">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => onPreviewAsset(focusedAsset)}
                            onKeyDown={(e) => {
                              if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
                                e.preventDefault();
                                onPreviewAsset(focusedAsset);
                              }
                            }}
                            title="Click to open full-size preview"
                            className="sm:col-span-5 block w-full rounded-lg border border-border overflow-hidden bg-background/80 hover:border-accent transition-colors cursor-pointer"
                          >
                            <OpsAssetThumb
                              asset={focusedAsset}
                              size="medium"
                              className="w-full max-h-52 object-contain mx-auto"
                            />
                          </div>

                          <div className="sm:col-span-7 space-y-1.5 text-[11px]">
                            <div className="flex flex-wrap items-center gap-1.5 font-mono">
                              <span className="px-1.5 py-0.5 rounded bg-muted text-foreground uppercase text-[10px]">
                                {focusedAsset.kind.replace('_', ' ')}
                              </span>
                              <span className="px-1.5 py-0.5 rounded border border-accent/35 bg-accent/10 text-accent text-[10px]">
                                {assetPlatformLabel(focusedAsset.platform)}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded border text-[10px] ${
                                  assetStatusBadge(focusedAsset.status).cls
                                }`}
                              >
                                {assetStatusBadge(focusedAsset.status).label}
                              </span>
                              {focusedAsset.label && (
                                <span className="px-1.5 py-0.5 rounded border border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-[10px]">
                                  {focusedAsset.label}
                                </span>
                              )}
                              {focusedAsset.spec && (
                                <span className="text-muted-foreground text-[10px]">
                                  {focusedAsset.spec}
                                </span>
                              )}
                              {focusedAsset.assignedTo && (
                                <span className="px-1.5 py-0.5 rounded border border-accent/35 bg-accent/10 text-accent text-[10px]">
                                  → {focusedAsset.assignedTo}
                                </span>
                              )}
                            </div>

                            {focusedAsset.file && (
                              <div className="text-muted-foreground font-mono truncate">
                                File: <span className="text-foreground">{focusedAsset.file}</span>
                              </div>
                            )}

                            <div>
                              <span className="font-mono text-[10px] uppercase text-muted-foreground mr-1">
                                Alt text:
                              </span>
                              <span
                                className={
                                  focusedAsset.altText
                                    ? 'text-foreground'
                                    : 'text-amber-600 dark:text-amber-300'
                                }
                              >
                                {focusedAsset.altText || 'Missing (required for Ready)'}
                              </span>
                            </div>

                            <div>
                              <span className="font-mono text-[10px] uppercase text-muted-foreground mr-1">
                                Credit:
                              </span>
                              <span
                                className={
                                  focusedAsset.credit
                                    ? 'text-foreground'
                                    : 'text-amber-600 dark:text-amber-300'
                                }
                              >
                                {focusedAsset.credit || 'Missing (required for Ready)'}
                              </span>
                              {focusedAsset.sourceUrl && (
                                <>
                                  {' · '}
                                  <a
                                    href={focusedAsset.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent hover:underline font-mono text-[10px]"
                                  >
                                    Asset Source ↗
                                  </a>
                                </>
                              )}
                            </div>

                            {focusedAsset.caption && (
                              <div className="text-foreground/90 line-clamp-2">
                                <span className="font-mono text-[10px] uppercase text-muted-foreground mr-1">
                                  Caption:
                                </span>
                                {focusedAsset.caption}
                              </div>
                            )}

                            {focusedAsset.rejectionReason && (
                              <div className="text-red-600 dark:text-red-400">
                                Rejection note: {focusedAsset.rejectionReason}
                              </div>
                            )}

                            {metaEditAssetId === focusedAsset.id &&
                              selectedCard.stage !== 'posted' &&
                              selectedCard.stage !== 'archived' && (
                                <div className="rounded-lg border border-accent/40 bg-background/85 p-2 space-y-1.5">
                                  <input
                                    type="text"
                                    value={metaEditAlt}
                                    onChange={(e) => setMetaEditAlt(e.target.value)}
                                    placeholder="Alt text description (for accessibility / Ready gate)"
                                    className="w-full px-2 py-1 rounded text-[11px] bg-card border border-border text-foreground focus:outline-none focus:border-accent"
                                  />
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={metaEditCredit}
                                      onChange={(e) => setMetaEditCredit(e.target.value)}
                                      placeholder="Credit (e.g. Photo: Coinkite)"
                                      className="flex-1 min-w-[140px] px-2 py-1 rounded text-[11px] bg-card border border-border text-foreground focus:outline-none focus:border-accent"
                                    />
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={async () => {
                                        await onUpdateAsset(selectedCard, focusedAsset.id, {
                                          altText: metaEditAlt.trim(),
                                          credit: metaEditCredit.trim(),
                                        });
                                        setMetaEditAssetId(null);
                                      }}
                                      className="px-2.5 py-1 rounded text-[10px] font-semibold bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
                                    >
                                      Save Alt/Credit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setMetaEditAssetId(null)}
                                      className="px-2 py-1 rounded text-[10px] border border-border text-muted-foreground hover:text-foreground"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}

                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => onPreviewAsset(focusedAsset)}
                                className="px-2 py-0.5 rounded border border-border bg-background hover:border-accent text-[10px] font-mono text-foreground"
                              >
                                Full size
                              </button>
                              {selectedCard.stage !== 'posted' && selectedCard.stage !== 'archived' && (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    metaEditAssetId === focusedAsset.id
                                      ? setMetaEditAssetId(null)
                                      : openAssetMetaEditor(focusedAsset)
                                  }
                                  className="px-2 py-0.5 rounded border border-border bg-background hover:border-accent text-[10px] font-mono text-foreground disabled:opacity-50"
                                >
                                  {!focusedAsset.altText || !focusedAsset.credit
                                    ? 'Add Alt / Credit'
                                    : 'Edit Alt / Credit'}
                                </button>
                              )}
                              {selectedCard.stage !== 'posted' && selectedCard.stage !== 'archived' && (
                                <>
                                  {focusedAsset.status !== 'approved' && (
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() =>
                                        onUpdateAsset(selectedCard, focusedAsset.id, { status: 'approved' })
                                      }
                                      className="px-2 py-0.5 rounded border border-emerald-500/45 bg-emerald-500/15 hover:bg-emerald-500/25 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 disabled:opacity-50"
                                    >
                                      Approve asset
                                    </button>
                                  )}
                                  {focusedAsset.status !== 'rejected' && (
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() =>
                                        onUpdateAsset(selectedCard, focusedAsset.id, { status: 'rejected' })
                                      }
                                      className="px-2 py-0.5 rounded border border-red-500/45 bg-red-500/10 hover:bg-red-500/20 text-[10px] font-mono text-red-700 dark:text-red-300 disabled:opacity-50"
                                    >
                                      Reject asset
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : selectedCompleteness.noImageNeeded ? (
                    <div className="p-3 bg-sky-500/5 space-y-2.5">
                      <div className="text-xs text-sky-700 dark:text-sky-300 text-center">
                        <span className="font-semibold">Text-only post (no image)</span>
                        {selectedCard.noImageNeededBy ? ` — marked by ${selectedCard.noImageNeededBy}` : ''}.{' '}
                        {selectedCard.stage !== 'posted' && selectedCard.stage !== 'archived' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onSetNoImageNeeded(selectedCard, false)}
                            className="underline font-mono ml-1 hover:opacity-80 disabled:opacity-50"
                          >
                            Require photo instead
                          </button>
                        )}
                      </div>
                      {(() => {
                        const articleUrl = extractPrimaryArticleUrl(selectedCard);
                        return articleUrl ? (
                          <div className="space-y-1 max-w-lg mx-auto">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                              Article Card Preview (as unfurled on X / FB / LinkedIn)
                            </div>
                            <OpsLinkCardPreview url={articleUrl} variant="card" />
                          </div>
                        ) : null;
                      })()}
                    </div>
                  ) : (
                    <div className="px-3 py-3 text-xs text-amber-700 dark:text-amber-300 bg-amber-500/5 space-y-2.5">
                      <div className="text-center">
                        Asset missing{selectedCard.assetSpec ? ` (${selectedCard.assetSpec})` : ''} — assign a bot below, attach an asset, or set &ldquo;No image needed&rdquo;.
                      </div>
                      {(() => {
                        const articleUrl = extractPrimaryArticleUrl(selectedCard);
                        return articleUrl ? (
                          <div className="space-y-1 max-w-lg mx-auto text-left">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                              Article Card Preview (from link)
                            </div>
                            <OpsLinkCardPreview url={articleUrl} variant="card" />
                          </div>
                        ) : null;
                      })()}
                      {onAssignAssetTask && selectedCard.stage !== 'posted' && selectedCard.stage !== 'archived' && (
                        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 border-t border-amber-500/20 text-[11px] font-mono">
                          <span className="text-foreground/80">Assign asset →</span>
                          <select
                            aria-label="Assign asset to bot"
                            value={effectiveAssignBot}
                            disabled={busy}
                            onChange={(e) => setAssignAssetBot(e.target.value)}
                            className="px-2 py-1 rounded border border-border bg-background text-foreground text-[11px]"
                          >
                            {crew.map((c) => (
                              <option key={`miss-bot-${c.agentId}`} value={c.agentId}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <select
                            aria-label="Asset kind"
                            value={assignAssetKind}
                            disabled={busy}
                            onChange={(e) => setAssignAssetKind(e.target.value as JobAssetKind)}
                            className="px-2 py-1 rounded border border-border bg-background text-foreground text-[11px]"
                          >
                            <option value="image">Image</option>
                            <option value="carousel_slide">Carousel slide</option>
                            <option value="flyer">Flyer</option>
                            <option value="video">Video</option>
                            <option value="video_frame">Video frame</option>
                            <option value="meme">Meme</option>
                          </select>
                          <select
                            aria-label="Asset platform"
                            value={assignAssetPlatform}
                            disabled={busy}
                            onChange={(e) => setAssignAssetPlatform(e.target.value as JobAssetPlatform)}
                            className="px-2 py-1 rounded border border-border bg-background text-foreground text-[11px]"
                          >
                            <option value="all">ALL</option>
                            <option value="fb">FB</option>
                            <option value="ig">IG</option>
                            <option value="linkedin">LI</option>
                            <option value="x">X</option>
                          </select>
                          <input
                            type="text"
                            value={assignAssetSpec}
                            disabled={busy}
                            placeholder="Spec / note (optional)"
                            onChange={(e) => setAssignAssetSpec(e.target.value)}
                            className="px-2 py-1 rounded border border-border bg-background text-foreground text-[11px] w-36"
                          />
                          <button
                            type="button"
                            disabled={busy}
                            onClick={async () => {
                              await onAssignAssetTask(selectedCard, {
                                assignedTo: effectiveAssignBot,
                                kind: assignAssetKind,
                                platform: assignAssetPlatform,
                                spec: assignAssetSpec.trim() || undefined,
                              });
                              setAssignAssetSpec('');
                            }}
                            className="px-2.5 py-1 rounded bg-amber-600 text-white hover:bg-amber-500 font-semibold disabled:opacity-50"
                          >
                            Assign Asset
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {onAssignAssetTask &&
                    assignAssetOpen &&
                    (selectedCardAssets.length > 0 || selectedCompleteness.noImageNeeded) &&
                    selectedCard.stage !== 'posted' &&
                    selectedCard.stage !== 'archived' && (
                      <div className="px-3 py-2 border-t border-border/70 bg-muted/20 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                        <span className="text-foreground/80">Assign extra asset →</span>
                        <select
                          aria-label="Assign extra asset to bot"
                          value={effectiveAssignBot}
                          disabled={busy}
                          onChange={(e) => setAssignAssetBot(e.target.value)}
                          className="px-2 py-1 rounded border border-border bg-background text-foreground text-[11px]"
                        >
                          {crew.map((c) => (
                            <option key={`extra-bot-${c.agentId}`} value={c.agentId}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <select
                          aria-label="Extra asset kind"
                          value={assignAssetKind}
                          disabled={busy}
                          onChange={(e) => setAssignAssetKind(e.target.value as JobAssetKind)}
                          className="px-2 py-1 rounded border border-border bg-background text-foreground text-[11px]"
                        >
                          <option value="image">Image</option>
                          <option value="carousel_slide">Carousel slide</option>
                          <option value="flyer">Flyer</option>
                          <option value="video">Video</option>
                          <option value="video_frame">Video frame</option>
                          <option value="meme">Meme</option>
                        </select>
                        <select
                          aria-label="Extra asset platform"
                          value={assignAssetPlatform}
                          disabled={busy}
                          onChange={(e) => setAssignAssetPlatform(e.target.value as JobAssetPlatform)}
                          className="px-2 py-1 rounded border border-border bg-background text-foreground text-[11px]"
                        >
                          <option value="all">ALL</option>
                          <option value="fb">FB</option>
                          <option value="ig">IG</option>
                          <option value="linkedin">LI</option>
                          <option value="x">X</option>
                        </select>
                        <input
                          type="text"
                          value={assignAssetSpec}
                          disabled={busy}
                          placeholder="Spec / note (optional)"
                          onChange={(e) => setAssignAssetSpec(e.target.value)}
                          className="px-2 py-1 rounded border border-border bg-background text-foreground text-[11px] w-36"
                        />
                        <button
                          type="button"
                          disabled={busy}
                          onClick={async () => {
                            await onAssignAssetTask(selectedCard, {
                              assignedTo: effectiveAssignBot,
                              kind: assignAssetKind,
                              platform: assignAssetPlatform,
                              spec: assignAssetSpec.trim() || undefined,
                            });
                            setAssignAssetSpec('');
                            setAssignAssetOpen(false);
                          }}
                          className="px-2.5 py-1 rounded bg-accent text-accent-foreground hover:opacity-90 font-semibold disabled:opacity-50"
                        >
                          Assign Asset
                        </button>
                      </div>
                    )}
                </div>

                {/* Complete Draft Copy */}
                <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      Full Draft Copy
                    </span>
                    {selectedCard.draftCopy && (
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(selectedCard.draftCopy);
                          onToast('Copied full draft to clipboard');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border border-border hover:border-accent text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    )}
                  </div>
                  <div className="text-xs sm:text-[13px] text-foreground whitespace-pre-wrap break-words leading-relaxed select-text">
                    {selectedCard.draftCopy?.trim()
                      ? renderLinkifiedText(selectedCard.draftCopy)
                      : renderLinkifiedText(selectedCard.note || selectedCard.marleyNote || 'No draft copy written yet.')}
                  </div>
                </div>

                {/* Source, Clearance Notes & Flags */}
                <div className="space-y-2 text-xs">
                  {(selectedCard.sourceUrl || selectedCard.source || selectedCard.sourceFile) && (
                    <div className="rounded-lg border border-border bg-card/60 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0 text-[11px] text-muted-foreground truncate">
                        <span className="font-mono uppercase text-[10px] mr-1.5">Source:</span>
                        <span className="text-foreground">{selectedCard.source}</span>
                        {selectedCard.sourceFile ? ` · ${selectedCard.sourceFile}` : ''}
                      </div>
                      {selectedCard.sourceUrl && (
                        <a
                          href={selectedCard.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-accent hover:underline shrink-0"
                        >
                          Verify Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {selectedCard.marleyNote && (
                    <div className="rounded-lg border border-border bg-card/60 px-3 py-2 text-[11px] text-foreground/90">
                      <span className="font-mono uppercase text-[10px] text-accent mr-1.5">
                        Marley Clearance:
                      </span>
                      {renderLinkifiedText(selectedCard.marleyNote)}
                    </div>
                  )}

                  {selectedCard.note && selectedCard.note !== selectedCard.marleyNote && (
                    <div className="rounded-lg border border-border bg-card/60 px-3 py-2 text-[11px] text-foreground/90">
                      <span className="font-mono uppercase text-[10px] text-muted-foreground mr-1.5">
                        Note:
                      </span>
                      {renderLinkifiedText(selectedCard.note)}
                    </div>
                  )}

                  {(selectedCard.discrepancies?.length ||
                    selectedCard.unverifiedClaims?.length ||
                    selectedCard.artifactsNeeded?.length ||
                    selectedCard.flaggedNotes?.length) ? (
                    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-[11px] space-y-1">
                      <div className="font-semibold text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Flags &amp; Requirements
                      </div>
                      {selectedCard.discrepancies?.map((d, i) => (
                        <p key={`d-${i}`}>• Discrepancy: {d}</p>
                      ))}
                      {selectedCard.unverifiedClaims?.map((c, i) => (
                        <p key={`c-${i}`}>• Unverified claim: {c}</p>
                      ))}
                      {selectedCard.artifactsNeeded?.map((a, i) => (
                        <p key={`a-${i}`}>• Artifact needed: {a}</p>
                      ))}
                      {selectedCard.flaggedNotes?.map((f, i) => (
                        <p key={`f-${i}`}>• {f}</p>
                      ))}
                    </div>
                  ) : null}

                  {(selectedCard.targetPlatforms?.length || linkList.length > 0) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {selectedCard.targetPlatforms && selectedCard.targetPlatforms.length > 0 && (
                        <>
                          <span className="text-[10px] font-mono uppercase text-muted-foreground">
                            Platforms:
                          </span>
                          {selectedCard.targetPlatforms.map((p) => {
                            const url = selectedCard.links?.[p];
                            const label = p === 'linkedin' ? 'LI' : p.toUpperCase();
                            return url ? (
                              <a
                                key={p}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 hover:underline"
                              >
                                {label} ✓ <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span
                                key={p}
                                className="px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-[11px] font-mono text-amber-700 dark:text-amber-300"
                              >
                                {label} pending
                              </span>
                            );
                          })}
                        </>
                      )}
                      {linkList
                        .filter(
                          (l) =>
                            !selectedCard.targetPlatforms?.includes(
                              l.label === 'LI' ? 'linkedin' : (l.label.toLowerCase() as 'fb' | 'ig' | 'x')
                            )
                        )
                        .map((l) => (
                          <a
                            key={l.label}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 hover:underline"
                          >
                            {l.label} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      {selectedCard.postedAssets && Object.keys(selectedCard.postedAssets).length > 0 && (
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                          · Sent assets:{' '}
                          {Object.entries(selectedCard.postedAssets)
                            .map(([p, ids]) => `${p.toUpperCase()}(${ids?.length || 0})`)
                            .join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky Decision Action Bar */}
              <div className="px-3.5 py-2.5 border-t border-border bg-card/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onEditCard(selectedCard)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:border-accent text-foreground disabled:opacity-50"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  {onAssignCard && selectedCard.stage !== 'posted' && selectedCard.stage !== 'archived' && (
                    <select
                      aria-label="Assign card to bot"
                      value={selectedCard.assignedTo || ''}
                      disabled={busy}
                      onChange={(e) => onAssignCard(selectedCard, e.target.value)}
                      className="px-2 py-1.5 rounded-lg text-xs font-mono border border-border bg-background text-foreground hover:border-accent focus:outline-none focus:border-accent disabled:opacity-50"
                    >
                      <option value="">Assign → Unassigned</option>
                      {crew.map((c) => (
                        <option key={`card-assign-${c.agentId}`} value={c.agentId}>
                          Assign → {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {selectedCard.stage !== 'posted' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        const nextKey = nextItemKeyAfter(`post:${selectedCard.id}`);
                        await onKillCard(selectedCard);
                        setSelectedKey(nextKey);
                        setFocusedAssetId(null);
                      }}
                      title="Kill / archive this item from the queue"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-500/35 text-red-600 dark:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Kill
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedCard.stage === 'posted' ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                        Published
                      </span>
                      {selectedPublishedLinks.map((l) => (
                        <a
                          key={`footer-${l.platform}-${l.href}`}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={l.href}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                        >
                          {selectedPublishedLinks.length === 1
                            ? `Preview ${l.label}`
                            : `${l.shortLabel} Live`}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                      {selectedCard.postedAssets && Object.keys(selectedCard.postedAssets).length > 0 && (
                        <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                          · Sent assets:{' '}
                          {Object.entries(selectedCard.postedAssets)
                            .map(([p, ids]) => `${p.toUpperCase()}(${ids?.length || 0})`)
                            .join(', ')}
                        </span>
                      )}
                    </div>
                  ) : selectedIsReady ? (
                    !selectedCard.postIt ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {selectedCompleteness.noImageNeeded && (
                          <span className="px-2 py-1 rounded-md border border-sky-500/40 bg-sky-500/10 text-[11px] font-mono text-sky-700 dark:text-sky-300">
                            Text-only{selectedCard.noImageNeededBy ? ` (${selectedCard.noImageNeededBy})` : ''}
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={async () => {
                            const nextKey = nextItemKeyAfter(`post:${selectedCard.id}`);
                            await onPostIt(selectedCard);
                            setSelectedKey(nextKey);
                            setFocusedAssetId(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Post it
                        </button>
                      </div>
                    ) : selectedActiveClaim ? (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-mono border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        Claimed · {selectedCard.claimedBy}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onCancelPostIt(selectedCard)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-500/45 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                      >
                        Cancel Post it
                      </button>
                    )
                  ) : selectedCard.stage === 'approved' ? (
                    selectedCompleteness.canApproveReady ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {onMarkReady && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={async () => {
                              const nextKey = nextItemKeyAfter(`post:${selectedCard.id}`);
                              await onMarkReady(selectedCard);
                              setSelectedKey(nextKey);
                              setFocusedAssetId(null);
                            }}
                            title="Move to Ready for Rotty queue without firing Post it yet"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-cyan-500/45 bg-cyan-500/15 text-cyan-800 dark:text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Mark Ready
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={async () => {
                            const nextKey = nextItemKeyAfter(`post:${selectedCard.id}`);
                            await onPostIt(selectedCard);
                            setSelectedKey(nextKey);
                            setFocusedAssetId(null);
                          }}
                          title="Mark Ready and arm Post it right away"
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Post it
                        </button>
                      </div>
                    ) : selectedCompleteness.lockReason === 'needs_asset_approval' ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {(() => {
                          const pendingAssets = selectedCardAssets.filter(
                            (a) => a.status !== 'approved' && Boolean(a.url?.trim() || a.file?.trim())
                          );
                          return (
                            pendingAssets.length > 0 && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={async () => {
                                  for (const a of pendingAssets) {
                                    await onUpdateAsset(selectedCard, a.id, { status: 'approved' });
                                  }
                                }}
                                title="Approve delivered visual asset(s) so this card moves to Ready for Post it"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-cyan-500/45 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                {pendingAssets.length === 1
                                  ? 'Approve asset'
                                  : `Approve assets (${pendingAssets.length})`}
                              </button>
                            )
                          );
                        })()}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={async () => {
                            const nextKey = nextItemKeyAfter(`post:${selectedCard.id}`);
                            await onPostIt(selectedCard);
                            setSelectedKey(nextKey);
                            setFocusedAssetId(null);
                          }}
                          title="Approve delivered asset(s) and arm Post it immediately"
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Post it
                        </button>
                      </div>
                    ) : (selectedCompleteness.lockReason === 'needs_alt_text' ||
                        selectedCompleteness.lockReason === 'needs_credit') ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {(() => {
                          const targetAsset =
                            selectedCardAssets.find((a) => !a.altText?.trim() || !a.credit?.trim()) ||
                            focusedAsset;
                          return (
                            targetAsset && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => openAssetMetaEditor(targetAsset)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-amber-500/45 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                              >
                                Fix Alt / Credit
                              </button>
                            )
                          );
                        })()}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={async () => {
                            const nextKey = nextItemKeyAfter(`post:${selectedCard.id}`);
                            await onPostIt(selectedCard);
                            setSelectedKey(nextKey);
                            setFocusedAssetId(null);
                          }}
                          title="Copy and approved visual are ready — fire Post it now without waiting for alt text/credit"
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Post it
                        </button>
                      </div>
                    ) : (
                      <span
                        title={selectedCompleteness.detail || 'Crew completing asset & prep'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      >
                        Approved · Crew queue
                        {selectedCompleteness.buttonReason ? ` (${selectedCompleteness.buttonReason})` : ''}
                      </span>
                    )
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        const nextKey = nextItemKeyAfter(`post:${selectedCard.id}`);
                        await onApproveReady(selectedCard);
                        setSelectedKey(nextKey);
                        setFocusedAssetId(null);
                      }}
                      title="Approve draft and move to Crew Queue (no image required yet)"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
            );
          })()}

          {/* Request Decision Reader */}
          {selectedRequest && selectedRequestStatus && (() => {
            const reqReaderAlert = getUpdateAlertMeta(highlightKinds.get(selectedRequest.id));
            return (
            <div
              className={`min-h-0 flex flex-col rounded-lg border overflow-hidden transition-all duration-300 ${
                reqReaderAlert ? reqReaderAlert.cardBorderCls : 'border-border bg-background/70'
              }`}
            >
              {/* Reader Header + Navigation */}
              <div className="px-3.5 py-2.5 border-b border-border/80 flex flex-wrap items-start justify-between gap-2 bg-card/50 shrink-0">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                    {reqReaderAlert && (
                      <span className={`px-1.5 py-0.5 rounded border ${reqReaderAlert.badgeCls}`}>
                        {reqReaderAlert.label}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-700 dark:text-violet-300 uppercase font-semibold">
                      Request
                    </span>
                    <span className={`px-1.5 py-0.5 rounded border ${requestStatusBadge(selectedRequestStatus).cls}`}>
                      {requestStatusBadge(selectedRequestStatus).label}
                    </span>
                    {selectedRequest.urgency && selectedRequest.urgency !== 'normal' && (
                      <span className="px-1.5 py-0.5 rounded border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300 uppercase">
                        {selectedRequest.urgency}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded border border-accent/35 bg-accent/10 text-accent">
                      From {selectedRequest.raisedByName}
                    </span>
                    {selectedRequest.relevantUntil && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Relevant until {selectedRequest.relevantUntil.slice(0, 10)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-foreground leading-snug">
                    {selectedRequest.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-mono text-muted-foreground mr-1">
                    {selectedIndex + 1}/{items.length}
                  </span>
                  <button
                    type="button"
                    aria-label="Previous item"
                    disabled={selectedIndex <= 0}
                    onClick={() => setSelectedKey(items[selectedIndex - 1]?.key || null)}
                    className="p-1 rounded border border-border bg-background hover:border-accent disabled:opacity-35"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next item"
                    disabled={selectedIndex >= items.length - 1}
                    onClick={() => setSelectedKey(items[selectedIndex + 1]?.key || null)}
                    className="p-1 rounded border border-border bg-background hover:border-accent disabled:opacity-35"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Request Context, Prepared Work & Full History */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [overflow-anchor:none] ops-scroll p-3.5 space-y-3.5">
                {/* One-line Context */}
                <div className="rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 py-2 text-xs text-foreground">
                  <span className="font-mono uppercase text-[10px] text-violet-700 dark:text-violet-300 mr-1.5 font-semibold">
                    Why it needs you:
                  </span>
                  {renderLinkifiedText(selectedRequest.context)}
                </div>

                {/* Linked Job Card (if any) */}
                {selectedLinkedCard && (
                  <div className="rounded-lg border border-border bg-card/60 px-3 py-2 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground truncate">
                        <span className="font-mono uppercase text-[10px] mr-1.5">Linked Post:</span>
                        <span className="text-foreground font-medium">{selectedLinkedCard.title}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onEditCard(selectedLinkedCard)}
                        className="text-[11px] font-mono text-accent hover:underline shrink-0"
                      >
                        Open Card
                      </button>
                    </div>
                    {getCardAssets(selectedLinkedCard).length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 ops-scroll">
                        {getCardAssets(selectedLinkedCard).map((asset) => (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => onPreviewAsset(asset)}
                            title={`${asset.kind} (${assetPlatformLabel(asset.platform)}) · Click to inspect`}
                            className="relative shrink-0 w-12 h-12 rounded border border-border hover:border-accent overflow-hidden"
                          >
                            <OpsAssetThumb asset={asset} size="thumb" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Prepared Work Attached (link / file / draft text) */}
                {(selectedRequest.preparedUrl || selectedRequest.preparedFile || selectedRequest.preparedText) && (
                  <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-border/70 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="font-semibold text-foreground">Prepared Work</span>
                        {selectedRequest.preparedFile && (
                          <span className="px-1.5 py-0 rounded bg-muted text-muted-foreground truncate max-w-[240px]">
                            {selectedRequest.preparedFile}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {selectedRequest.preparedUrl && (
                          <a
                            href={selectedRequest.preparedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-accent hover:underline"
                          >
                            Open Link <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {selectedRequest.preparedText && (
                          <button
                            type="button"
                            onClick={async () => {
                              await navigator.clipboard.writeText(selectedRequest.preparedText || '');
                              onToast('Copied prepared draft to clipboard');
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border border-border hover:border-accent text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                        )}
                      </div>
                    </div>

                    {(extractDriveFileId(selectedRequest.preparedUrl) ||
                      extractDriveFileId(selectedRequest.preparedFile, true) ||
                      Boolean(selectedRequest.preparedUrl?.startsWith('/api/ops/asset-blob/'))) ? (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          onPreviewAsset({
                            id: `req-${selectedRequest.id}`,
                            url: selectedRequest.preparedUrl,
                            file: selectedRequest.preparedFile,
                            kind: 'image',
                            platform: 'all',
                            order: 0,
                            label: selectedRequest.title,
                            status: 'delivered',
                            addedBy: selectedRequest.raisedByName,
                            createdAt: selectedRequest.raisedAt,
                            updatedAt: selectedRequest.updatedAt,
                          })
                        }
                        onKeyDown={(e) => {
                          if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
                            e.preventDefault();
                            onPreviewAsset({
                              id: `req-${selectedRequest.id}`,
                              url: selectedRequest.preparedUrl,
                              file: selectedRequest.preparedFile,
                              kind: 'image',
                              platform: 'all',
                              order: 0,
                              label: selectedRequest.title,
                              status: 'delivered',
                              addedBy: selectedRequest.raisedByName,
                              createdAt: selectedRequest.raisedAt,
                              updatedAt: selectedRequest.updatedAt,
                            });
                          }
                        }}
                        title="Click to inspect full-size preview"
                        className="block w-full bg-muted/25 p-2 text-center border-b border-border/60 hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        <OpsAssetThumb
                          asset={{
                            url: selectedRequest.preparedUrl,
                            file: selectedRequest.preparedFile,
                            kind: 'image',
                            label: selectedRequest.title,
                          }}
                          size="medium"
                          className="max-h-60 w-auto max-w-full rounded object-contain mx-auto"
                        />
                      </div>
                    ) : previewUrl && !hasPreviewError ? (
                      <a
                        href={selectedRequest.preparedUrl || previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-muted/25 p-2 text-center border-b border-border/60"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt={selectedRequest.title}
                          referrerPolicy="no-referrer"
                          className="max-h-60 w-auto max-w-full rounded object-contain mx-auto"
                          onError={() => setFailedPreviewUrl(previewUrl)}
                        />
                      </a>
                    ) : null}

                    {selectedRequest.preparedText && (
                      <div className="p-3 text-xs sm:text-[13px] text-foreground whitespace-pre-wrap break-words leading-relaxed select-text">
                        {renderLinkifiedText(selectedRequest.preparedText)}
                      </div>
                    )}
                  </div>
                )}

                {/* Full Audit History (who asked, what was decided, what happened) */}
                <div className="rounded-lg border border-border bg-card/60 p-3 space-y-2 text-[11px]">
                  <div className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground">
                    Request History
                  </div>
                  <div className="space-y-1.5 text-foreground/90">
                    <div>
                      <span className="font-mono text-muted-foreground mr-1.5">1. Raised:</span>
                      <span className="font-semibold text-foreground">{selectedRequest.raisedByName}</span>
                      <span className="text-muted-foreground">
                        {' '}· {new Date(selectedRequest.raisedAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedRequest.decidedAt && (
                      <div>
                        <span className="font-mono text-muted-foreground mr-1.5">2. Decision:</span>
                        <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                          {selectedRequest.decisionLabel || selectedRequest.decision}
                        </span>
                        <span className="text-muted-foreground">
                          {' '}by {selectedRequest.decidedBy || 'Rotty'} ·{' '}
                          {new Date(selectedRequest.decidedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {(selectedRequest.outcomeNote || selectedRequest.completedAt || selectedRequest.outcomeUrl) && (
                      <div className="space-y-1">
                        <div>
                          <span className="font-mono text-muted-foreground mr-1.5">3. Outcome:</span>
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                            {selectedRequest.outcomeNote || 'Completed'}
                          </span>
                          {selectedRequest.completedAt && (
                            <span className="text-muted-foreground">
                              {' '}({selectedRequest.completedBy || selectedRequest.raisedByName} ·{' '}
                              {new Date(selectedRequest.completedAt).toLocaleString()})
                            </span>
                          )}
                        </div>
                        {selectedRequest.outcomeUrl && (
                          <div>
                            <a
                              href={selectedRequest.outcomeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[11px] hover:bg-emerald-500"
                            >
                              Open Result <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    {selectedRequestStatus === 'expired' && !selectedRequest.decidedAt && (
                      <div className="text-amber-700 dark:text-amber-300">
                        Expired after {selectedRequest.relevantUntil} without a decision.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky Request Action Bar */}
              <div className="px-3.5 py-2.5 border-t border-border bg-card/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(selectedRequestStatus === 'pending' || selectedRequestStatus === 'decided') && (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          const nextKey = nextItemKeyAfter(`req:${selectedRequest.id}`);
                          await onDecideRequest(selectedRequest, 'already_handled', 'Already handled');
                          setSelectedKey(nextKey);
                          setFocusedAssetId(null);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:border-accent text-foreground disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Already handled
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          const nextKey = nextItemKeyAfter(`req:${selectedRequest.id}`);
                          await onDecideRequest(selectedRequest, 'dismiss', 'Dismissed');
                          setSelectedKey(nextKey);
                          setFocusedAssetId(null);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:border-red-500/50 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedRequestStatus === 'pending' ? (
                    selectedRequest.actions.map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          const nextKey = nextItemKeyAfter(`req:${selectedRequest.id}`);
                          await onDecideRequest(selectedRequest, act.id, act.label);
                          setSelectedKey(nextKey);
                          setFocusedAssetId(null);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                          act.tone === 'danger'
                            ? 'border border-red-500/45 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/20'
                            : act.tone === 'primary'
                              ? 'bg-accent text-accent-foreground hover:opacity-90'
                              : 'border border-border bg-background hover:border-accent text-foreground'
                        }`}
                      >
                        {act.label}
                      </button>
                    ))
                  ) : selectedRequestStatus === 'decided' ? (
                    <span className="text-xs font-mono text-cyan-700 dark:text-cyan-300">
                      Stamped: {selectedRequest.decisionLabel || selectedRequest.decision} · awaiting{' '}
                      {selectedRequest.raisedByName}
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-muted-foreground">
                      {requestStatusBadge(selectedRequestStatus).label}
                    </span>
                  )}
                </div>
              </div>
            </div>
            );
          })()}
        </div>
      )}
    </section>
  );
}
