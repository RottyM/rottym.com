'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Columns3,
  Copy,
  ExternalLink,
  Inbox,
  Layers,
  Lock,
  LogOut,
  MessageSquare,
  Moon,
  Plus,
  RefreshCw,
  Send,
  Settings,
  ShieldAlert,
  Sparkles,
  Sun,
  Trash2,
  Users,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import {
  getOpsAuth,
  getOpsFirestore,
  hasFirebaseClientConfig,
  signInOpsWithEmail,
  signInOpsWithGoogle,
  signOutOps,
} from '@/lib/ops/firebase-client';
import type {
  ActivityEntry,
  AgentStatus,
  ChatMessage,
  ClientWorkspace,
  CrewMember,
  GateItem,
  GateState,
  JobAsset,
  MetricsSnapshot,
  OpsRequest,
  PipelineCard,
  PipelineLane,
  PipelineStage,
} from '@/lib/ops/types';
import {
  getCardAssets,
  getCardCompleteness,
  getCardFormatBadges,
  getCardPublishedLinks,
  getEffectiveRequestStatus,
  getUpdateAlertMeta,
  resolveAvatarRenderUrl,
  splitTextWithUrls,
  type UpdateAlertKind,
} from '@/lib/ops/drop-parser';
import { OpsAssetLightbox, OpsAssetThumb, assetPlatformLabel } from './OpsAssetThumb';
import OpsBrandMark from './OpsBrandMark';
import OpsDecisionDesk from './OpsDecisionDesk';
import OpsDeskPanel from './OpsDeskPanel';
import { extractPrimaryArticleUrl, OpsLinkCardPreview } from './OpsLinkCardPreview';
import { OpsModalHost, type OpsModalState } from './OpsModals';

const CREW_EXPANDED_KEY = 'rottym_ops_crew_expanded';
const CREW_EXPANDED_EVENT = 'ops-crew-expanded-changed';

function subscribeCrewExpanded(cb: () => void) {
  window.addEventListener(CREW_EXPANDED_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(CREW_EXPANDED_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

function getCrewExpandedSnapshot(): boolean {
  try {
    return window.localStorage.getItem(CREW_EXPANDED_KEY) === '1';
  } catch {
    return false;
  }
}

const getCrewExpandedServerSnapshot = () => false;

type BoardColumnId = PipelineStage | 'ready';

function isCardReady(c: PipelineCard): boolean {
  if (c.stage !== 'approved' || !c.readyForRotty) return false;
  const comp = getCardCompleteness(c);
  if (comp.canApproveReady) return true;
  return Boolean(
    c.postIt && (comp.lockReason === 'needs_alt_text' || comp.lockReason === 'needs_credit')
  );
}

const STAGE_COLUMNS: Array<{ id: BoardColumnId; label: string }> = [
  { id: 'pulled', label: 'Pulled' },
  { id: 'clearance', label: 'Clearance' },
  { id: 'drafted', label: 'Drafted' },
  { id: 'approved', label: 'Approved' },
  { id: 'ready', label: 'Ready for Rotty' },
  { id: 'posted', label: 'Posted' },
];

const AGENT_BADGE: Record<AgentStatus, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' },
  stand_down: { label: 'Stand-down', cls: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300' },
  on_hold: { label: 'Hold', cls: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300' },
  on_call: { label: 'On Call', cls: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300' },
  out: { label: 'Out', cls: 'border-border bg-muted text-muted-foreground' },
};

const GATE_BADGE: Record<GateState, { label: string; cls: string }> = {
  hold: { label: 'HOLD', cls: 'border-amber-500/45 bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  blocked: { label: 'BLOCKED', cls: 'border-red-500/45 bg-red-500/15 text-red-700 dark:text-red-300' },
  awaiting: { label: 'AWAITING', cls: 'border-cyan-500/45 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300' },
  resolved: { label: 'RESOLVED', cls: 'border-emerald-500/45 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
};

function useEasternClock(): string {
  const [clock, setClock] = useState('');
  useEffect(() => {
    const update = () => {
      try {
        const fmt = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        setClock(`${fmt.format(new Date())} ET`);
      } catch {
        setClock('ET');
      }
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);
  return clock;
}

export default function OpsBoardClient({ mode }: { mode: 'board' | 'admin' | 'desk' }) {
  const { resolvedTheme, setTheme } = useTheme();
  const etClock = useEasternClock();

  const [fbUser, setFbUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(() => !hasFirebaseClientConfig());
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(() =>
    hasFirebaseClientConfig() ? null : 'Firebase client environment variables are missing.'
  );

  const [isOwner, setIsOwner] = useState(false);
  const [clients, setClients] = useState<ClientWorkspace[]>([]);
  const [activeClientId, setActiveClientId] = useState<string>('rottym');
  const [accessDeniedMsg, setAccessDeniedMsg] = useState<string | null>(null);

  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [pipeline, setPipeline] = useState<PipelineCard[]>([]);
  const [requests, setRequests] = useState<OpsRequest[]>([]);
  const [gates, setGates] = useState<GateItem[]>([]);
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);

  const [syncLive, setSyncLive] = useState(false);
  const [opsView, setOpsView] = useState<'desk' | 'board'>('desk');
  const [deckCollapsed, setDeckCollapsed] = useState(false);
  const crewExpanded = useSyncExternalStore(
    subscribeCrewExpanded,
    getCrewExpandedSnapshot,
    getCrewExpandedServerSnapshot
  );
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [laneFilter, setLaneFilter] = useState<PipelineLane | 'all'>('all');

  const toggleCrewExpanded = useCallback(() => {
    const next = !getCrewExpandedSnapshot();
    try {
      window.localStorage.setItem(CREW_EXPANDED_KEY, next ? '1' : '0');
    } catch {
      // ignore storage errors
    }
    window.dispatchEvent(new Event(CREW_EXPANDED_EVENT));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);
  const [stageFilter, setStageFilter] = useState<BoardColumnId | 'all'>('all');
  const [modal, setModal] = useState<OpsModalState>({ type: 'closed' });
  const [lightboxAsset, setLightboxAsset] = useState<JobAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [highlightKinds, setHighlightKinds] = useState<Map<string, UpdateAlertKind>>(() => new Map());
  const [unseenIds, setUnseenIds] = useState<Set<string>>(() => new Set());
  const seenStampsRef = useRef<{ clientId: string; map: Map<string, string> }>({
    clientId: '',
    map: new Map(),
  });
  const stampSnapshotRef = useRef<{
    clientId: string;
    initialized: { crew: boolean; pipeline: boolean; chat: boolean; requests: boolean };
    stamps: {
      crew: Map<string, string>;
      pipeline: Map<string, string>;
      chat: Map<string, string>;
      requests: Map<string, string>;
    };
  }>({
    clientId: 'rottym',
    initialized: { crew: false, pipeline: false, chat: false, requests: false },
    stamps: { crew: new Map(), pipeline: new Map(), chat: new Map(), requests: new Map() },
  });
  const highlightExpiryRef = useRef<Map<string, { expiresAt: number; kind: UpdateAlertKind }>>(new Map());

  const persistSeenMap = useCallback((clientScope: string, map: Map<string, string>) => {
    try {
      const obj: Record<string, string> = {};
      for (const [k, v] of map.entries()) obj[k] = v;
      window.localStorage.setItem(`rottym_ops_seen_${clientScope}`, JSON.stringify(obj));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const markItemSeen = useCallback(
    (id: string) => {
      const store = stampSnapshotRef.current;
      const clientScope = store.clientId || 'rottym';
      const stamp = store.stamps.pipeline.get(id) ?? store.stamps.requests.get(id) ?? '';
      if (seenStampsRef.current.clientId !== clientScope) {
        seenStampsRef.current = { clientId: clientScope, map: new Map() };
      }
      seenStampsRef.current.map.set(id, stamp);
      persistSeenMap(clientScope, seenStampsRef.current.map);
      setUnseenIds((prev) => {
        if (!prev.has(id)) return prev;
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
    },
    [persistSeenMap]
  );

  const markAllSeen = useCallback(() => {
    const store = stampSnapshotRef.current;
    const clientScope = store.clientId || 'rottym';
    const nextMap = new Map<string, string>();
    for (const [k, v] of store.stamps.pipeline.entries()) nextMap.set(k, v);
    for (const [k, v] of store.stamps.requests.entries()) nextMap.set(k, v);
    seenStampsRef.current = { clientId: clientScope, map: nextMap };
    persistSeenMap(clientScope, nextMap);
    setUnseenIds(new Set());
  }, [persistSeenMap]);

  const applyTrackedUpdate = useCallback(
    <T extends { id: string; updatedAt?: string; createdAt?: string }>(
      kind: 'crew' | 'pipeline' | 'chat' | 'requests',
      clientScope: string,
      nextList: T[],
      setter: (items: T[]) => void
    ) => {
      const store = stampSnapshotRef.current;
      if (store.clientId !== clientScope) {
        store.clientId = clientScope;
        store.initialized = { crew: false, pipeline: false, chat: false, requests: false };
        store.stamps = {
          crew: new Map(),
          pipeline: new Map(),
          chat: new Map(),
          requests: new Map(),
        };
        highlightExpiryRef.current.clear();
        setHighlightKinds((prev) => (prev.size > 0 ? new Map() : prev));
        setUnseenIds(new Set());
      }

      const prevMap = store.stamps[kind];
      const changed: Array<{ id: string; alertKind: UpdateAlertKind }> = [];
      if (store.initialized[kind]) {
        for (const item of nextList) {
          const nextStamp = item.updatedAt || item.createdAt || '';
          if (!prevMap.has(item.id)) {
            changed.push({ id: item.id, alertKind: 'new' });
          } else if (prevMap.get(item.id) !== nextStamp) {
            changed.push({ id: item.id, alertKind: 'updated' });
          }
        }
      }

      const nextMap = new Map<string, string>();
      for (const item of nextList) {
        nextMap.set(item.id, item.updatedAt || item.createdAt || '');
      }
      store.stamps[kind] = nextMap;
      const wasInitialized = store.initialized[kind];
      store.initialized[kind] = true;

      if (kind === 'pipeline' || kind === 'requests') {
        let seenDirty = false;
        if (seenStampsRef.current.clientId !== clientScope) {
          const loaded = new Map<string, string>();
          let hadSaved = false;
          try {
            const raw = window.localStorage.getItem(`rottym_ops_seen_${clientScope}`);
            if (raw) {
              hadSaved = true;
              const parsed = JSON.parse(raw) as Record<string, string>;
              for (const [k, v] of Object.entries(parsed)) {
                if (typeof v === 'string') loaded.set(k, v);
              }
            }
          } catch {
            // Ignore corrupt storage
          }
          seenStampsRef.current = { clientId: clientScope, map: loaded };
          if (!hadSaved) {
            for (const item of nextList) {
              loaded.set(item.id, item.updatedAt || item.createdAt || '');
            }
            seenDirty = true;
          }
        } else if (!wasInitialized && seenStampsRef.current.map.size === 0) {
          for (const item of nextList) {
            seenStampsRef.current.map.set(item.id, item.updatedAt || item.createdAt || '');
          }
          seenDirty = true;
        }
        if (seenDirty) {
          persistSeenMap(clientScope, seenStampsRef.current.map);
        }

        setUnseenIds((prev) => {
          const copy = new Set(prev);
          const seenMap = seenStampsRef.current.map;
          let mutated = false;
          for (const item of nextList) {
            const stamp = item.updatedAt || item.createdAt || '';
            const seenStamp = seenMap.get(item.id);
            if (seenStamp !== stamp) {
              if (!copy.has(item.id)) {
                copy.add(item.id);
                mutated = true;
              }
            } else if (copy.has(item.id)) {
              copy.delete(item.id);
              mutated = true;
            }
          }
          return mutated ? copy : prev;
        });
      }

      if (changed.length > 0) {
        const HIGHLIGHT_MS = 20_000;
        const expiresAt = Date.now() + HIGHLIGHT_MS;
        for (const { id, alertKind } of changed) {
          const existingMeta = highlightExpiryRef.current.get(id);
          const mergedKind: UpdateAlertKind =
            existingMeta?.kind === 'new' || alertKind === 'new' ? 'new' : 'updated';
          highlightExpiryRef.current.set(id, { expiresAt, kind: mergedKind });
        }
        setHighlightKinds((prev) => {
          const copy = new Map(prev);
          for (const { id, alertKind } of changed) {
            const cur = copy.get(id);
            copy.set(id, cur === 'new' || alertKind === 'new' ? 'new' : 'updated');
          }
          return copy;
        });
        setTimeout(() => {
          const nowMs = Date.now();
          setHighlightKinds((prev) => {
            const copy = new Map(prev);
            let mutated = false;
            for (const { id } of changed) {
              const meta = highlightExpiryRef.current.get(id);
              if (meta && nowMs >= meta.expiresAt - 50) {
                copy.delete(id);
                highlightExpiryRef.current.delete(id);
                mutated = true;
              }
            }
            return mutated ? copy : prev;
          });
        }, HIGHLIGHT_MS);
      }

      setter(nextList);
    },
    [persistSeenMap]
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 4000);
  }, []);

  const authorizedFetch = useCallback(
    async (url: string, init?: RequestInit) => {
      const user = getOpsAuth().currentUser;
      if (!user) throw new Error('Not signed in');
      const token = await user.getIdToken();
      const res = await fetch(url, {
        ...init,
        headers: {
          ...(init?.headers || {}),
          Authorization: `Bearer ${token}`,
          ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
      }
      return data;
    },
    []
  );

  // 1. Firebase Auth listener
  useEffect(() => {
    if (!hasFirebaseClientConfig()) return;
    const auth = getOpsAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
      setAuthReady(true);
      if (!user) {
        setClients([]);
        setCrew([]);
        setPipeline([]);
        setRequests([]);
        setGates([]);
        setMetrics(null);
        setActivity([]);
        setAccessDeniedMsg(null);
      }
    });
    return () => unsub();
  }, []);

  // 2. Bootstrap authorized workspaces once signed in
  const refreshBootstrap = useCallback(async () => {
    if (!fbUser) return;
    try {
      const data = (await authorizedFetch('/api/ops/bootstrap')) as {
        user: { isOwner: boolean };
        clients: ClientWorkspace[];
      };
      setAccessDeniedMsg(null);
      setIsOwner(Boolean(data.user?.isOwner));
      setClients(data.clients || []);
      if (data.clients?.length && !data.clients.some((c) => c.id === activeClientId)) {
        setActiveClientId(data.clients[0].id);
      }
    } catch (err) {
      setAccessDeniedMsg(err instanceof Error ? err.message : 'Access denied');
    }
  }, [fbUser, authorizedFetch, activeClientId]);

  useEffect(() => {
    if (!fbUser) return;
    let cancelled = false;
    authorizedFetch('/api/ops/bootstrap')
      .then((raw) => {
        if (cancelled) return;
        const data = raw as { user: { isOwner: boolean }; clients: ClientWorkspace[] };
        setAccessDeniedMsg(null);
        setIsOwner(Boolean(data.user?.isOwner));
        setClients(data.clients || []);
        if (data.clients?.length && !data.clients.some((c) => c.id === activeClientId)) {
          setActiveClientId(data.clients[0].id);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAccessDeniedMsg(err instanceof Error ? err.message : 'Access denied');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fbUser, authorizedFetch, activeClientId]);

  // 3. Initial snapshot + real-time Firestore listeners scoped to activeClientId
  const loadBoardViaApi = useCallback(async () => {
    if (!fbUser || !activeClientId || accessDeniedMsg) return;
    try {
      const data = (await authorizedFetch(`/api/ops/board?clientId=${encodeURIComponent(activeClientId)}`)) as {
        crew: CrewMember[];
        pipeline: PipelineCard[];
        requests?: OpsRequest[];
        gates: GateItem[];
        metrics: MetricsSnapshot | null;
        activity: ActivityEntry[];
        chat?: ChatMessage[];
      };
      applyTrackedUpdate('crew', activeClientId, data.crew || [], setCrew);
      applyTrackedUpdate('pipeline', activeClientId, data.pipeline || [], setPipeline);
      applyTrackedUpdate('requests', activeClientId, data.requests || [], setRequests);
      applyTrackedUpdate('chat', activeClientId, data.chat || [], setChat);
      setGates(data.gates || []);
      setMetrics(data.metrics || null);
      setActivity(data.activity || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to load board');
    }
  }, [fbUser, activeClientId, accessDeniedMsg, authorizedFetch, showToast, applyTrackedUpdate]);

  useEffect(() => {
    if (!fbUser || clients.length === 0 || !activeClientId || accessDeniedMsg) return;
    let cancelled = false;

    const pullLatest = () => {
      authorizedFetch(`/api/ops/board?clientId=${encodeURIComponent(activeClientId)}`)
        .then((raw) => {
          if (cancelled) return;
          const data = raw as {
            crew: CrewMember[];
            pipeline: PipelineCard[];
            requests?: OpsRequest[];
            gates: GateItem[];
            metrics: MetricsSnapshot | null;
            activity: ActivityEntry[];
            chat?: ChatMessage[];
          };
          applyTrackedUpdate('crew', activeClientId, data.crew || [], setCrew);
          applyTrackedUpdate('pipeline', activeClientId, data.pipeline || [], setPipeline);
          applyTrackedUpdate('requests', activeClientId, data.requests || [], setRequests);
          applyTrackedUpdate('chat', activeClientId, data.chat || [], setChat);
          setGates(data.gates || []);
          setMetrics(data.metrics || null);
          setActivity(data.activity || []);
        })
        .catch(() => {
          // Keep current state if background poll transiently fails
        });
    };

    pullLatest();

    const db = getOpsFirestore();
    const unsubs: Array<() => void> = [];

    try {
      unsubs.push(
        onSnapshot(
          query(collection(db, 'ops_crew'), where('clientId', '==', activeClientId)),
          (snap) => {
            setSyncLive(true);
            applyTrackedUpdate(
              'crew',
              activeClientId,
              snap.docs.map((d) => d.data() as CrewMember),
              setCrew
            );
          },
          () => setSyncLive(false)
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'ops_pipeline'), where('clientId', '==', activeClientId)),
          (snap) => {
            setSyncLive(true);
            const list = snap.docs.map((d) => d.data() as PipelineCard);
            list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
            applyTrackedUpdate('pipeline', activeClientId, list, setPipeline);
          },
          () => setSyncLive(false)
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'ops_gates'), where('clientId', '==', activeClientId)),
          (snap) => setGates(snap.docs.map((d) => d.data() as GateItem))
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'ops_metrics'), where('clientId', '==', activeClientId)),
          (snap) => {
            const first = snap.docs[0]?.data() as MetricsSnapshot | undefined;
            if (first) setMetrics(first);
          }
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'ops_activity'), where('clientId', '==', activeClientId)),
          (snap) => {
            const list = snap.docs.map((d) => d.data() as ActivityEntry);
            list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
            setActivity(list.slice(0, 25));
          }
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'ops_chat'), where('clientId', '==', activeClientId)),
          (snap) => {
            setSyncLive(true);
            const list = snap.docs.map((d) => d.data() as ChatMessage);
            list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
            applyTrackedUpdate('chat', activeClientId, list.slice(-60), setChat);
          }
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'ops_requests'), where('clientId', '==', activeClientId)),
          (snap) => {
            setSyncLive(true);
            const list = snap.docs.map((d) => d.data() as OpsRequest);
            list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
            applyTrackedUpdate('requests', activeClientId, list, setRequests);
          }
        )
      );
    } catch {
      // Snapshot listener unavailable; 4s auto-poll remains active
    }

    // Background polling safety net: updates every 4s if WebChannel is blocked (e.g. Brave Shields),
    // or every 15s even when Firestore snapshot is active, plus immediate sync on window focus.
    const intervalMs = syncLive ? 15000 : 4000;
    const pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        pullLatest();
      }
    }, intervalMs);

    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        pullLatest();
      }
    };
    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);

    return () => {
      cancelled = true;
      clearInterval(pollTimer);
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
      unsubs.forEach((u) => u());
    };
  }, [fbUser, clients.length, activeClientId, accessDeniedMsg, authorizedFetch, syncLive, applyTrackedUpdate]);

  const activeClient = useMemo(
    () => clients.find((c) => c.id === activeClientId) || clients[0] || null,
    [clients, activeClientId]
  );

  const sortedCrew = useMemo(() => {
    const priority: Record<AgentStatus, number> = {
      active: 0,
      on_call: 1,
      stand_down: 2,
      on_hold: 3,
      out: 4,
    };
    return [...crew].sort((a, b) => {
      const pDiff = (priority[a.status] ?? 9) - (priority[b.status] ?? 9);
      if (pDiff !== 0) return pDiff;
      return a.name.localeCompare(b.name);
    });
  }, [crew]);

  const activeCrewCount = useMemo(
    () => crew.filter((c) => c.status === 'active' || c.status === 'on_call').length,
    [crew]
  );

  const needsYouCount = useMemo(() => {
    const postCount = pipeline.filter((c) => c.stage === 'drafted').length;
    const reqCount = requests.filter((r) => {
      const st = getEffectiveRequestStatus(r, nowMs);
      return st === 'pending' || st === 'decided';
    }).length;
    return postCount + reqCount;
  }, [pipeline, requests, nowMs]);

  const rosterSummaryStats = useMemo(() => {
    let inFlight = 0;
    let needsAsset = 0;
    for (const p of pipeline) {
      if (p.stage === 'posted' || p.stage === 'archived') continue;
      inFlight += 1;
      const lock = getCardCompleteness(p).lockReason;
      if (
        lock === 'needs_photo' ||
        lock === 'needs_copy_and_photo' ||
        lock === 'asset_rejected' ||
        lock === 'needs_asset_approval'
      ) {
        needsAsset += 1;
      }
    }
    const openGates = gates.filter((g) => g.state !== 'resolved').length;
    const crewAlerts = crew.filter((c) => c.connectorAlert && c.connectorAlert.status !== 'ok').length;
    return {
      inFlight,
      needsAsset,
      blocked: openGates + crewAlerts,
      hasCrewAlert: crewAlerts > 0,
    };
  }, [pipeline, gates, crew]);

  const filteredPipeline = useMemo(
    () =>
      pipeline.filter((p) => {
        if (laneFilter !== 'all' && p.lane !== laneFilter) return false;
        if (stageFilter === 'all') {
          return p.stage !== 'archived';
        }
        if (stageFilter === 'ready') {
          return isCardReady(p);
        }
        if (stageFilter === 'approved') {
          return p.stage === 'approved' && !isCardReady(p);
        }
        return p.stage === stageFilter;
      }),
    [pipeline, laneFilter, stageFilter]
  );

  const postAction = async (payload: Record<string, unknown>, successMsg: string): Promise<boolean> => {
    setBusy(true);
    try {
      await authorizedFetch('/api/ops/board', {
        method: 'POST',
        body: JSON.stringify({ clientId: activeClientId, ...payload }),
      });
      await loadBoardViaApi();
      showToast(successMsg);
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Action failed');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleCopyPendingForMarley = async () => {
    const pending = pipeline.filter((p) => p.stage === 'pulled' || p.marleyStatus === 'pending');
    const text =
      pending.length === 0
        ? 'No pending pulled items right now.'
        : [
            `Marley clearance batch (${activeClient?.name || activeClientId}):`,
            ...pending.map(
              (p, i) =>
                `${i + 1}. ${p.title} | lane: ${p.lane} | id: ${p.id}${p.sourceUrl ? ` | url: ${p.sourceUrl}` : ''}`
            ),
          ].join('\n');
    await navigator.clipboard.writeText(text);
    showToast(`Copied ${pending.length} pending items for Marley`);
  };

  // --- Auth & Guard Screens ---
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-sm text-muted-foreground">
        Checking operator session...
      </div>
    );
  }

  if (!fbUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-dot-grid">
        <div className="w-full max-w-md stitch-card rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-3">
            <OpsBrandMark size={36} />
            <div>
              <h1 className="text-base font-bold text-foreground">RottyM Command Center</h1>
              <p className="text-xs text-muted-foreground">Private AI crew &amp; pipeline operations</p>
            </div>
          </div>

          {authError && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-300">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={async () => {
              setAuthError(null);
              try {
                await signInOpsWithGoogle();
              } catch (err) {
                setAuthError(err instanceof Error ? err.message : 'Google sign-in failed');
              }
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Sign in with Google
          </button>

          <form
            className="space-y-3 pt-3 border-t border-border"
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthError(null);
              try {
                await signInOpsWithEmail(emailInput, passwordInput);
              } catch (err) {
                setAuthError(err instanceof Error ? err.message : 'Email sign-in failed');
              }
            }}
          >
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Or sign in with email
            </div>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="rmendez@rottym.com"
              className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border text-foreground"
            />
            <input
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border text-foreground"
            />
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg border border-border text-xs font-semibold hover:border-accent text-foreground transition-colors"
            >
              Sign in with Email
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (accessDeniedMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md stitch-card rounded-2xl p-6 space-y-4 text-center">
          <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
          <h1 className="text-base font-bold text-foreground">Access Restricted</h1>
          <p className="text-xs text-muted-foreground">{accessDeniedMsg}</p>
          <p className="text-xs font-mono text-muted-foreground">{fbUser.email}</p>
          <button
            type="button"
            onClick={() => signOutOps()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:border-accent"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 overflow-x-clip">
      {/* Top Ops Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/ops" className="flex items-center gap-2.5 min-w-0">
              <OpsBrandMark size={30} />
              <div className="min-w-0">
                <div className="text-sm font-bold tracking-tight truncate">
                  {activeClient?.name || 'RottyM Command Center'}
                </div>
                <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2 truncate">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-accent" />
                    {etClock || 'ET'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className={syncLive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                    {syncLive ? 'Live Firestore Sync' : 'Auto-Sync (4s)'}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {clients.length > 0 && (
              <label className="inline-flex items-center gap-1.5 text-xs">
                <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                <select
                  aria-label="Select client workspace"
                  value={activeClientId}
                  onChange={(e) => setActiveClientId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-foreground max-w-[190px]"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button
              type="button"
              onClick={() => setModal({ type: 'desk_paste' })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:opacity-90"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Desk Paste
            </button>

            <button
              type="button"
              onClick={handleCopyPendingForMarley}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:border-accent"
            >
              <Copy className="w-3.5 h-3.5 text-accent" />
              Copy for Marley
            </button>

            <Link
              href={mode === 'desk' ? '/ops' : '/ops/desk'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:border-accent"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              {mode === 'desk' ? 'Board' : 'AI Desk'}
            </Link>

            <Link
              href={mode === 'admin' ? '/ops' : '/ops/admin'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:border-accent"
            >
              <Settings className="w-3.5 h-3.5 text-accent" />
              {mode === 'admin' ? 'Board' : 'Admin'}
            </Link>

            <button
              type="button"
              aria-label="Refresh board now"
              onClick={() => loadBoardViaApi()}
              className="p-1.5 rounded-lg border border-border bg-card hover:border-accent text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg border border-border bg-card hover:border-accent"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              aria-label="Sign out"
              onClick={() => signOutOps()}
              className="p-1.5 rounded-lg border border-border bg-card hover:border-red-500/50 text-muted-foreground hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md pointer-events-none px-3 sm:px-0">
          <div className="rounded-lg border border-accent/50 bg-card/95 backdrop-blur-md shadow-lg px-3.5 py-2 text-xs font-medium text-foreground">
            {toast}
          </div>
        </div>
      )}

      {mode === 'desk' ? (
        <OpsDeskPanel
          activeClient={activeClient}
          authorizedFetch={authorizedFetch}
          onToast={showToast}
          onCardSaved={loadBoardViaApi}
        />
      ) : mode === 'admin' ? (
        <OpsAdminPanel
          activeClient={activeClient}
          isOwner={isOwner}
          crew={crew}
          metrics={metrics}
          busy={busy}
          onPostAction={async (payload, msg) => {
            await postAction(payload, msg);
          }}
          onCreateClient={async (payload) => {
            setBusy(true);
            try {
              const res = (await authorizedFetch('/api/ops/bootstrap', {
                method: 'POST',
                body: JSON.stringify(payload),
              })) as { client: ClientWorkspace };
              await refreshBootstrap();
              setActiveClientId(res.client.id);
              showToast(`Created client workspace: ${res.client.name}`);
            } catch (err) {
              showToast(err instanceof Error ? err.message : 'Unable to create client');
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : (
        <main className="max-w-[1440px] mx-auto px-3 sm:px-5 pt-3 space-y-3">
          {/* View Switcher (Decision Desk vs Audit Board) + Inline Crew Strip */}
          <section className="rounded-xl border border-border bg-card px-3 py-2 flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setOpsView('desk')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-accent text-accent-foreground"
              >
                <Inbox className="w-3.5 h-3.5" />
                Decision Desk
                {needsYouCount > 0 && (
                  <span className="px-1.5 py-0 rounded-lg text-[10px] font-mono bg-background/20 text-accent-foreground">
                    {needsYouCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                onClick={() => setOpsView('board')}
                className="hidden"
              >
                <Columns3 className="w-3.5 h-3.5" />
                Board
              </button>
            </div>

            {opsView === 'desk' ? (
              <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1 justify-end">
                <button
                  type="button"
                  aria-expanded={crewExpanded}
                  onClick={toggleCrewExpanded}
                  title={crewExpanded ? 'Collapse crew roster pills' : 'Expand full crew roster pills'}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors shrink-0 ${
                    rosterSummaryStats.hasCrewAlert
                      ? 'border-red-500/60 bg-red-500/15 text-red-700 dark:text-red-300'
                      : crewExpanded
                        ? 'border-accent/55 bg-accent/10 text-foreground'
                        : 'border-border bg-background/70 hover:border-accent/60 text-foreground'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      rosterSummaryStats.hasCrewAlert
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span>Crew</span>
                  <span className="px-1.5 py-0 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/35 text-[10px] font-semibold">
                    {activeCrewCount}/{crew.length}
                  </span>
                  {crewExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>

                {crewExpanded && (
                  <>
                    {sortedCrew.map((m) => {
                      const dotCls = STATUS_DOT[m.status] || STATUS_DOT.active;
                      const crewAlert = getUpdateAlertMeta(highlightKinds.get(m.id));
                      const hasConnAlert = Boolean(m.connectorAlert && m.connectorAlert.status !== 'ok');
                      const avatarSrc = resolveAvatarRenderUrl(m.avatarUrl);
                      const tip = [
                        m.name,
                        `${m.role} · ${m.model}`,
                        hasConnAlert ? `ALERT: ${m.connectorAlert?.message}` : m.statusNote,
                      ]
                        .filter(Boolean)
                        .join(' — ');
                      return (
                        <button
                          key={m.id}
                          type="button"
                          title={tip}
                          onClick={() => setModal({ type: 'crew', member: m })}
                          className={`inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-lg border text-[11px] font-medium transition-all duration-500 ${
                            hasConnAlert
                              ? 'border-red-500/70 bg-red-500/15 text-red-700 dark:text-red-300'
                              : crewAlert
                                ? crewAlert.cardBorderCls
                                : 'border-border bg-background/70 hover:border-accent/60'
                          }`}
                        >
                          <CrewPillAvatar
                            name={m.name}
                            src={avatarSrc}
                            dotCls={hasConnAlert ? 'bg-red-500 animate-pulse' : dotCls}
                          />
                          <span className="truncate max-w-[90px]">{m.name}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setModal({ type: 'create_crew', defaultSet: 'new' })}
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg border border-border bg-background hover:border-accent text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </>
                )}

                <div className="hidden sm:flex items-center gap-2 pl-2 ml-0.5 border-l border-border/80 text-[11px] font-mono text-muted-foreground shrink-0">
                  <span>
                    In Flight:{' '}
                    <span className="text-foreground font-semibold">{rosterSummaryStats.inFlight}</span>
                  </span>
                  <span className="text-border">·</span>
                  <span>
                    Needs Asset:{' '}
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      {rosterSummaryStats.needsAsset}
                    </span>
                  </span>
                  <span className="text-border">·</span>
                  <span>
                    Blocked:{' '}
                    <span
                      className={`font-semibold ${
                        rosterSummaryStats.blocked > 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-foreground'
                      }`}
                    >
                      {rosterSummaryStats.blocked}
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] font-mono text-muted-foreground">
                Shared crew audit board · {activeCrewCount}/{crew.length} crew active
              </div>
            )}
          </section>

          {crew
            .filter((m) => m.connectorAlert && m.connectorAlert.status !== 'ok')
            .map((m) => {
              const alert = m.connectorAlert!;
              const statusLabel =
                alert.status === 'wrong_account'
                  ? 'WRONG ACCOUNT'
                  : alert.status === 'disconnected'
                    ? 'DISCONNECTED'
                    : 'CONNECTOR ERROR';
              return (
                <section
                  key={`conn-alert-${m.id}`}
                  role="alert"
                  className="rounded-xl border border-red-500/60 bg-red-500/15 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-red-900 dark:text-red-100"
                >
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold uppercase">
                      {statusLabel}
                    </span>
                    {alert.platform && (
                      <span className="px-1.5 py-0.5 rounded border border-red-500/40 bg-red-500/10 font-mono text-[10px] uppercase">
                        {alert.platform}
                      </span>
                    )}
                    <span className="font-semibold">{m.name}:</span>
                    <span className="break-words">{alert.message}</span>
                    {(alert.account || alert.expectedAccount) && (
                      <span className="font-mono text-[11px] opacity-85">
                        ({alert.account ? `seen: ${alert.account}` : ''}
                        {alert.account && alert.expectedAccount ? ' · ' : ''}
                        {alert.expectedAccount ? `expected: ${alert.expectedAccount}` : ''})
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      postAction(
                        { action: 'update_crew', agentId: m.agentId, connectorAlert: null },
                        `Cleared connector alert for ${m.name}`
                      )
                    }
                    className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border border-red-500/50 bg-background/80 hover:bg-background text-red-700 dark:text-red-300 disabled:opacity-50 shrink-0"
                  >
                    Clear Alert
                  </button>
                </section>
              );
            })}

          {opsView === 'desk' ? (
            <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_355px] gap-3 items-stretch">
              <div className="min-w-0">
                <OpsDecisionDesk
                  pipeline={pipeline}
                  requests={requests}
                  crew={crew}
                  lanes={activeClient?.lanes || []}
                  nowMs={nowMs}
                  busy={busy}
                  highlightKinds={highlightKinds}
                  unseenIds={unseenIds}
                  onMarkSeen={markItemSeen}
                  onMarkAllSeen={markAllSeen}
                  onEditCard={(card) => setModal({ type: 'card', card })}
                  onAssignCard={async (card, assignedTo) => {
                    const label = crew.find((c) => c.agentId === assignedTo)?.name || assignedTo || 'Unassigned';
                    await postAction(
                      {
                        action: 'update_card',
                        id: card.id,
                        assignedTo: assignedTo || null,
                        notifyAssigned: Boolean(assignedTo),
                      },
                      assignedTo ? `Assigned to ${label}: ${card.title}` : `Cleared assignment: ${card.title}`
                    );
                  }}
                  onAssignAssetTask={async (card, assetPayload) => {
                    const label =
                      crew.find((c) => c.agentId === assetPayload.assignedTo)?.name || assetPayload.assignedTo;
                    await postAction(
                      {
                        action: 'asset_add',
                        id: card.id,
                        asset: {
                          ...assetPayload,
                          status: 'needed',
                        },
                      },
                      `Assigned ${assetPayload.kind.replace('_', ' ')} to ${label}: ${card.title}`
                    );
                  }}
                  onSetPostFormat={async (card, postFormat) => {
                    await postAction(
                      { action: 'update_card', id: card.id, postFormat: postFormat ?? '' },
                      postFormat
                        ? `Updated type to ${postFormat.replace(/_/g, ' ')}: ${card.title}`
                        : `Reset type to auto-detect: ${card.title}`
                    );
                  }}
                  onDecideRequest={async (req, decision, label) => {
                    await postAction(
                      { action: 'decide_request', id: req.id, decision },
                      `${label}: ${req.title}`
                    );
                  }}
                  onApproveReady={async (card) => {
                    await postAction(
                      { action: 'update_card', id: card.id, stage: 'approved', readyForRotty: false },
                      `Approved (sent to crew queue): ${card.title}`
                    );
                  }}
                  onMarkReady={async (card) => {
                    await postAction(
                      { action: 'update_card', id: card.id, stage: 'approved', readyForRotty: true },
                      `Marked Ready for Rotty: ${card.title}`
                    );
                  }}
                  onSetNoImageNeeded={async (card, enabled) => {
                    await postAction(
                      {
                        action: 'update_card',
                        id: card.id,
                        photoStatus: enabled ? 'not_needed' : 'missing',
                      },
                      enabled
                        ? `Marked "no image needed": ${card.title}`
                        : `Cleared "no image needed": ${card.title}`
                    );
                  }}
                  onPostIt={async (card) => {
                    await postAction(
                      { action: 'post_it', id: card.id },
                      `Post it sent for: ${card.title}`
                    );
                  }}
                  onCancelPostIt={async (card) => {
                    await postAction(
                      { action: 'cancel_post_it', id: card.id },
                      `Cancelled Post it: ${card.title}`
                    );
                  }}
                  onKillCard={async (card) => {
                    await postAction(
                      { action: 'update_card', id: card.id, stage: 'archived', readyForRotty: false },
                      `Killed (archived): ${card.title}`
                    );
                  }}
                  onUpdateAsset={async (card, assetId, patch) => {
                    await postAction(
                      { action: 'asset_update', id: card.id, assetId, patch },
                      patch.status === 'approved'
                        ? `Approved asset on: ${card.title}`
                        : patch.status === 'rejected'
                          ? `Rejected asset on: ${card.title}`
                          : `Updated asset on: ${card.title}`
                    );
                  }}
                  onReorderAssets={async (card, assetIds) => {
                    await postAction(
                      { action: 'asset_reorder', id: card.id, assetIds },
                      `Reordered assets on: ${card.title}`
                    );
                  }}
                  onPreviewAsset={(asset) => setLightboxAsset(asset)}
                  onToast={showToast}
                />
              </div>
              <div className="min-w-0">
                <CrewChatPanel
                  tall
                  messages={chat}
                  crew={crew}
                  pipeline={pipeline}
                  highlightKinds={highlightKinds}
                  busy={busy}
                  onOpenJob={(card) => setModal({ type: 'card', card })}
                  onSend={async (text, to) => {
                    await postAction(
                      { action: 'post_chat', text, ...(to ? { to } : {}) },
                      'Sent message to Crew Chat'
                    );
                  }}
                  onDelete={async (id) => {
                    await postAction({ action: 'delete_chat', id }, 'Removed chat message');
                  }}
                />
              </div>
            </section>
          ) : (
            <>
              {/* Top Command Deck: Unified Compact Crew + Compact Crew Chatboard */}
              {deckCollapsed ? (
                <section className="rounded-xl border border-border bg-card px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono">
                      <Users className="w-3.5 h-3.5 text-accent" />
                      <span className="font-bold uppercase tracking-wider text-foreground">Crew</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {activeCrewCount}/{crew.length} active
                      </span>
                    </div>
                    <span className="text-border hidden sm:inline">|</span>
                    <div className="inline-flex items-center gap-1.5 text-xs min-w-0">
                      <MessageSquare className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="font-mono text-muted-foreground shrink-0">{chat.length} msgs</span>
                      {chat[chat.length - 1] && (
                        <span className="text-muted-foreground truncate max-w-[360px] hidden md:inline">
                          · <strong className="text-foreground">{chat[chat.length - 1].senderName}:</strong>{' '}
                          {chat[chat.length - 1].text}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeckCollapsed(false)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border border-border bg-background hover:border-accent text-foreground transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-accent" />
                    Show Crew &amp; Chat
                  </button>
                </section>
              ) : (
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
                  <div className="lg:col-span-7 min-w-0">
                    <UnifiedCrewPanel
                      members={sortedCrew}
                      activeCount={activeCrewCount}
                      highlightKinds={highlightKinds}
                      onSelect={(member) => setModal({ type: 'crew', member })}
                      onAdd={() => setModal({ type: 'create_crew', defaultSet: 'new' })}
                      onCollapse={() => setDeckCollapsed(true)}
                    />
                  </div>
                  <div className="lg:col-span-5 min-w-0">
                    <CrewChatPanel
                      messages={chat}
                      crew={crew}
                      pipeline={pipeline}
                      highlightKinds={highlightKinds}
                      busy={busy}
                      onOpenJob={(card) => setModal({ type: 'card', card })}
                      onSend={async (text, to) => {
                        await postAction(
                          { action: 'post_chat', text, ...(to ? { to } : {}) },
                          'Sent message to Crew Chat'
                        );
                      }}
                      onDelete={async (id) => {
                        await postAction({ action: 'delete_chat', id }, 'Removed chat message');
                      }}
                    />
                  </div>
                </section>
              )}

              {/* Lanes Bar */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {(activeClient?.lanes || []).map((lane) => {
                  const active = laneFilter === lane.id;
                  const count = pipeline.filter((p) => p.lane === lane.id && p.stage !== 'posted' && p.stage !== 'archived').length;
                  return (
                    <button
                      key={lane.id}
                      type="button"
                      onClick={() => setLaneFilter(active ? 'all' : lane.id)}
                      className={`text-left rounded-lg border px-2.5 py-1.5 transition-colors flex items-center justify-between gap-2 ${
                        active
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-card hover:border-accent/50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">{lane.label}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{lane.scheduleNote}</div>
                      </div>
                      <span className="text-[11px] font-mono text-accent shrink-0">{count} open</span>
                    </button>
                  );
                })}
              </section>

              {/* Content Pipeline */}
              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStageFilter('all')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                        stageFilter === 'all'
                          ? 'border-accent bg-accent/15 text-foreground'
                          : 'border-border bg-card text-muted-foreground'
                      }`}
                    >
                      All ({pipeline.length})
                    </button>
                    {STAGE_COLUMNS.map((col) => {
                      const count = pipeline.filter((p) =>
                        col.id === 'ready'
                          ? isCardReady(p)
                          : col.id === 'approved'
                            ? p.stage === 'approved' && !isCardReady(p)
                            : p.stage === col.id
                      ).length;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => setStageFilter(stageFilter === col.id ? 'all' : col.id)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                            stageFilter === col.id
                              ? 'border-accent bg-accent/15 text-foreground'
                              : 'border-border bg-card text-muted-foreground'
                          }`}
                        >
                          {col.label} ({count})
                        </button>
                      );
                    })}
                    {pipeline.some((p) => p.stage === 'archived') && (
                      <button
                        type="button"
                        onClick={() => setStageFilter(stageFilter === 'archived' ? 'all' : 'archived')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                          stageFilter === 'archived'
                            ? 'border-accent bg-accent/15 text-foreground'
                            : 'border-border bg-card text-muted-foreground'
                        }`}
                      >
                        Archived ({pipeline.filter((p) => p.stage === 'archived').length})
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-muted-foreground">
                    Approve moves drafts to Crew Queue · Bots Mark Ready when complete · Click Post it on Ready cards
                  </div>
                </div>

                {stageFilter === 'all' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
                    {STAGE_COLUMNS.map((col) => {
                      const cards = filteredPipeline.filter((p) =>
                        col.id === 'ready'
                          ? isCardReady(p)
                          : col.id === 'approved'
                            ? p.stage === 'approved' && !isCardReady(p)
                            : p.stage === col.id
                      );
                      return (
                        <div key={col.id} className="rounded-xl border border-border bg-card/60 p-2.5 space-y-2.5">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                              {col.label}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">{cards.length}</span>
                          </div>
                          <div className="space-y-2">
                            {cards.length === 0 ? (
                              <div className="text-[11px] text-muted-foreground/70 px-1 py-3">Empty</div>
                            ) : (
                              cards.map((card) => (
                                <PipelineCardTile
                                  key={card.id}
                                  card={card}
                                  nowMs={nowMs}
                                  busy={busy}
                                  highlightKind={highlightKinds.get(card.id)}
                                  onEdit={() => setModal({ type: 'card', card })}
                                  onReadyForRotty={() =>
                                    postAction(
                                      { action: 'update_card', id: card.id, stage: 'approved', readyForRotty: false },
                                      `Approved (sent to crew queue): ${card.title}`
                                    )
                                  }
                                  onPostIt={() =>
                                    postAction(
                                      { action: 'post_it', id: card.id },
                                      `Post it sent for: ${card.title}`
                                    )
                                  }
                                  onCancelPostIt={() =>
                                    postAction(
                                      { action: 'cancel_post_it', id: card.id },
                                      `Cancelled Post it: ${card.title}`
                                    )
                                  }
                                  onPreviewAsset={(asset) => setLightboxAsset(asset)}
                                  onReorderAssets={async (assetIds) => {
                                    await postAction(
                                      { action: 'asset_reorder', id: card.id, assetIds },
                                      `Reordered assets on: ${card.title}`
                                    );
                                  }}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredPipeline.map((card) => (
                      <PipelineCardTile
                        key={card.id}
                        card={card}
                        nowMs={nowMs}
                        busy={busy}
                        highlightKind={highlightKinds.get(card.id)}
                        onEdit={() => setModal({ type: 'card', card })}
                        onReadyForRotty={() =>
                          postAction(
                            { action: 'update_card', id: card.id, stage: 'approved', readyForRotty: false },
                            `Approved (sent to crew queue): ${card.title}`
                          )
                        }
                        onPostIt={() =>
                          postAction(
                            { action: 'post_it', id: card.id },
                            `Post it sent for: ${card.title}`
                          )
                        }
                        onCancelPostIt={() =>
                          postAction(
                            { action: 'cancel_post_it', id: card.id },
                            `Cancelled Post it: ${card.title}`
                          )
                        }
                        onPreviewAsset={(asset) => setLightboxAsset(asset)}
                        onReorderAssets={async (assetIds) => {
                          await postAction(
                            { action: 'asset_reorder', id: card.id, assetIds },
                            `Reordered assets on: ${card.title}`
                          );
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* Bottom Grid: Gates, Manual Funnel + Showroom, Activity Feed */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Gates & Holds */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                  Gates &amp; Holds
                </h2>
                <span className="text-[11px] font-mono text-muted-foreground">{gates.length} items</span>
              </div>
              <div className="space-y-2">
                {gates.map((g) => {
                  const badge = GATE_BADGE[g.state] || GATE_BADGE.hold;
                  return (
                    <div key={g.id} className="rounded-lg border border-border bg-background/60 p-2.5 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground">{g.label}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{g.detail}</p>
                      <div className="text-[10px] font-mono text-muted-foreground/80">Since: {g.since}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Funnel Metrics + Showroom Status */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                  Funnel (Manual)
                </h2>
                <span className="text-[10px] font-mono text-accent">
                  As of {metrics?.asOf || '—'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-border bg-background/60 p-2.5">
                  <div className="text-[10px] font-mono text-muted-foreground">Sessions</div>
                  <div className="text-lg font-bold text-foreground">
                    {metrics?.sessions ?? '—'}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {metrics?.sessionsPeriod || 'Manual'}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-2.5">
                  <div className="text-[10px] font-mono text-muted-foreground">Leads</div>
                  <div className="text-lg font-bold text-foreground">
                    {metrics?.generateLead ?? '—'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">generate_lead</div>
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-2.5">
                  <div className="text-[10px] font-mono text-muted-foreground">X Followers</div>
                  <div className="text-lg font-bold text-foreground">
                    {metrics?.xFollowers?.toLocaleString() ?? '—'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">@CausingPanic1</div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background/60 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Showroom Build
                  </span>
                  <span className="text-[11px] font-semibold text-accent">
                    {metrics?.showroomPhase || 'Unset'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.showroomNote || 'Update manually in /ops/admin.'}
                </p>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-accent" />
                  Activity Feed
                </h2>
                <span className="text-[11px] font-mono text-muted-foreground">Latest {activity.length}</span>
              </div>
              <div className="space-y-2 max-h-[260px] overflow-y-auto ops-scroll pr-1">
                {activity.map((ev) => (
                  <div key={ev.id} className="text-xs border-b border-border/60 pb-2 last:border-0">
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
                      <span className="font-semibold text-accent">{ev.actor}</span>
                      <span>{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-foreground/90 mt-0.5 break-words">
                      {renderLinkifiedText(ev.text)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      <OpsModalHost
        state={modal}
        clientId={activeClientId}
        crew={crew}
        busy={busy}
        onClose={() => setModal({ type: 'closed' })}
        onUpdateCard={async (id, patch) => {
          const ok = await postAction({ action: 'update_card', id, ...patch }, 'Updated pipeline card');
          if (ok) setModal({ type: 'closed' });
        }}
        onDeleteCard={async (id) => {
          const ok = await postAction({ action: 'delete_card', id }, 'Removed pipeline card');
          if (ok) setModal({ type: 'closed' });
        }}
        onPostIt={async (card) => {
          const ok = await postAction({ action: 'post_it', id: card.id }, `Post it sent for: ${card.title}`);
          if (ok) setModal({ type: 'closed' });
        }}
        onCancelPostIt={async (card) => {
          const ok = await postAction({ action: 'cancel_post_it', id: card.id }, `Cancelled Post it: ${card.title}`);
          if (ok) setModal({ type: 'closed' });
        }}
        onUpdateCrew={async (agentId, patch) => {
          await postAction({ action: 'update_crew', agentId, ...patch }, 'Updated crew member');
          setModal({ type: 'closed' });
        }}
        onCreateCrew={async (payload) => {
          await postAction({ action: 'create_crew', ...payload }, 'Added crew member');
          setModal({ type: 'closed' });
        }}
        onDeleteCrew={async (agentId) => {
          await postAction({ action: 'delete_crew', agentId }, 'Removed crew member');
          setModal({ type: 'closed' });
        }}
        onDeskPaste={async (raw, defaultLane) => {
          const ok = await postAction({ action: 'paste', raw, defaultLane }, 'Parsed and landed on board');
          if (ok) setModal({ type: 'closed' });
        }}
      />

      <OpsAssetLightbox asset={lightboxAsset} onClose={() => setLightboxAsset(null)} />
    </div>
  );
}

/** Compact circular avatar with status dot and initial-letter fallback for top crew pills. */
function CrewPillAvatar({
  name,
  src,
  dotCls,
}: {
  name: string;
  src?: string;
  dotCls: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const initials =
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || '?';
  const showImage = Boolean(src && failedSrc !== src);

  return (
    <span className="relative w-[18px] h-[18px] rounded-full border border-border/80 bg-accent/15 text-accent font-mono text-[8px] font-bold inline-flex items-center justify-center shrink-0">
      <span className="overflow-hidden w-full h-full rounded-full flex items-center justify-center relative">
        <span>{initials}</span>
        {showImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setFailedSrc(src ?? null)}
          />
        )}
      </span>
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ring-[1.5px] ring-background ${dotCls}`}
      />
    </span>
  );
}

const STATUS_DOT: Record<AgentStatus, string> = {
  active: 'bg-emerald-500',
  on_call: 'bg-cyan-500',
  stand_down: 'bg-amber-500',
  on_hold: 'bg-amber-500',
  out: 'bg-muted-foreground/60',
};

function UnifiedCrewPanel({
  members,
  activeCount,
  highlightKinds,
  onSelect,
  onAdd,
  onCollapse,
}: {
  members: CrewMember[];
  activeCount: number;
  highlightKinds: Map<string, UpdateAlertKind>;
  onSelect: (m: CrewMember) => void;
  onAdd?: () => void;
  onCollapse?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Users className="w-3.5 h-3.5 text-accent shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
            Crew
          </h2>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            {activeCount}/{members.length} active
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border border-border bg-background hover:border-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          )}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              title="Collapse Crew & Chat to focus on cards"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border border-border bg-background hover:border-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronUp className="w-3 h-3" />
              <span className="hidden sm:inline">Focus Cards</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-1.5 max-h-[212px] overflow-y-auto ops-scroll pr-0.5">
        {members.map((m) => {
          const badge = AGENT_BADGE[m.status] || AGENT_BADGE.active;
          const dotCls = STATUS_DOT[m.status] || STATUS_DOT.active;
          const crewAlert = getUpdateAlertMeta(highlightKinds.get(m.id));
          const avatarSrc = resolveAvatarRenderUrl(m.avatarUrl);
          const initials =
            m.name
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() || '')
              .join('') || '?';
          const subtitle = m.statusNote || `${m.role} · ${m.model}`;
          const tooltip = [m.name, `${m.role} · ${m.model}`, m.bio, m.statusNote]
            .filter(Boolean)
            .join('\n');

          return (
            <button
              key={m.id}
              type="button"
              title={tooltip}
              onClick={() => onSelect(m)}
              className={`relative text-left rounded-lg border bg-background/60 px-2 py-1.5 transition-all duration-500 overflow-hidden ${
                crewAlert ? crewAlert.cardBorderCls : 'border-border hover:border-accent/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative w-6 h-6 rounded-full border border-border bg-accent/15 text-accent font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                  <span className="overflow-hidden w-full h-full rounded-full flex items-center justify-center relative">
                    <span>{initials}</span>
                    {avatarSrc && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarSrc}
                        alt={m.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </span>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-background ${dotCls}`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-foreground truncate leading-tight">
                      {m.name}
                    </span>
                    <span className={`px-1 py-0 rounded text-[9px] font-mono border shrink-0 leading-tight ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                    {subtitle}
                  </div>
                </div>
              </div>

              {typeof m.usagePct === 'number' && (
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-muted/80">
                  <div
                    className={`h-full ${m.usagePct >= 85 ? 'bg-amber-500' : 'bg-accent'}`}
                    style={{ width: `${m.usagePct}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PipelineCardTile({
  card,
  nowMs,
  busy,
  highlightKind,
  onEdit,
  onReadyForRotty,
  onPostIt,
  onCancelPostIt,
  onPreviewAsset,
  onReorderAssets,
}: {
  card: PipelineCard;
  nowMs: number;
  busy: boolean;
  highlightKind?: UpdateAlertKind;
  onEdit: () => void;
  onReadyForRotty: () => void;
  onPostIt: () => void;
  onCancelPostIt: () => void;
  onPreviewAsset?: (asset: JobAsset) => void;
  onReorderAssets?: (assetIds: string[]) => Promise<void> | void;
}) {
  const [dragAssetId, setDragAssetId] = useState<string | null>(null);
  const linkList = [
    card.links?.fb ? { label: 'FB', href: card.links.fb } : null,
    card.links?.ig ? { label: 'IG', href: card.links.ig } : null,
    card.links?.linkedin ? { label: 'LI', href: card.links.linkedin } : null,
    card.links?.x ? { label: 'X', href: card.links.x } : null,
  ].filter((x): x is { label: string; href: string } => Boolean(x));

  const cardAssets = getCardAssets(card);
  const completeness = getCardCompleteness(card);
  const isReady =
    card.stage === 'approved' &&
    Boolean(card.readyForRotty) &&
    completeness.canApproveReady;
  const isApprovedQueue = card.stage === 'approved' && !isReady;
  const hasActiveClaim = Boolean(
    card.claimedBy && (!card.leaseExpiresAt || new Date(card.leaseExpiresAt).getTime() > nowMs)
  );

  const handleDropAsset = (targetId: string) => {
    if (!dragAssetId || dragAssetId === targetId || !onReorderAssets) {
      setDragAssetId(null);
      return;
    }
    const ids = cardAssets.map((a) => a.id);
    const fromIdx = ids.indexOf(dragAssetId);
    const toIdx = ids.indexOf(targetId);
    setDragAssetId(null);
    if (fromIdx < 0 || toIdx < 0) return;
    const reordered = [...ids];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    void onReorderAssets(reordered);
  };

  const tileAlert = getUpdateAlertMeta(highlightKind);

  return (
    <div
      className={`rounded-lg border bg-background p-2.5 space-y-1.5 transition-all duration-500 ${
        tileAlert
          ? tileAlert.cardBorderCls
          : card.postIt && isReady
            ? 'border-emerald-500/60 ring-1 ring-emerald-500/25'
            : 'border-border hover:border-accent/50'
      }`}
    >
      <div className="flex items-center justify-between gap-1.5 text-[10px] font-mono">
        <div className="flex items-center gap-1 min-w-0">
          <span className="px-1.5 py-0.5 rounded bg-muted text-foreground uppercase">{card.lane}</span>
          {card.verdictTag && (
            <span className="px-1.5 py-0.5 rounded border border-border bg-card text-foreground/90 uppercase">
              {card.verdictTag}
            </span>
          )}
          {card.eventDate && (
            <span className="text-muted-foreground truncate">{card.eventDate}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {card.assignedTo && (
            <span
              className="px-1.5 py-0.5 rounded border border-accent/35 bg-accent/10 text-accent truncate max-w-[90px]"
              title={`Assigned to ${card.assignedTo}`}
            >
              → {card.assignedTo}
            </span>
          )}
          {card.postIt && isReady ? (
            <span
              className="px-1.5 py-0.5 rounded border border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold shrink-0"
              title={card.postItAt ? `Post it clicked at ${card.postItAt}` : 'Post it armed'}
            >
              Post it Armed
            </span>
          ) : isReady ? (
            <span className="px-1.5 py-0.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shrink-0">
              Ready for Rotty
            </span>
          ) : isApprovedQueue ? (
            <span
              className={`px-1.5 py-0.5 rounded border shrink-0 ${
                completeness.canApproveReady
                  ? 'border-violet-500/45 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                  : 'border-amber-500/45 bg-amber-500/15 text-amber-700 dark:text-amber-300'
              }`}
              title={completeness.canApproveReady ? 'Awaiting crew Mark Ready' : completeness.detail || undefined}
            >
              {completeness.canApproveReady ? 'Approved' : `Approved · ${completeness.buttonReason}`}
            </span>
          ) : !card.assignedTo ? (
            <span className="text-muted-foreground truncate max-w-[90px]">{card.agentId}</span>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="text-left block w-full text-xs font-semibold text-foreground hover:text-accent leading-snug"
      >
        {card.title}
      </button>

      {(card.note || card.marleyNote) && (
        <p className="text-[11px] text-muted-foreground line-clamp-2">{card.note || card.marleyNote}</p>
      )}

      {card.artifactsNeeded && card.artifactsNeeded.length > 0 && (
        <div className="rounded border border-amber-500/45 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-700 dark:text-amber-300 flex items-start gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
          <span className="leading-snug">
            Needs {card.artifactsNeeded.length}: {card.artifactsNeeded.join(' · ')}
          </span>
        </div>
      )}

      {(card.discrepancies?.length || card.unverifiedClaims?.length || card.flaggedNotes?.some((f) => f.startsWith('FLAG: Past event'))) ? (
        <div className="text-[10px] text-amber-600 dark:text-amber-300 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {card.unverifiedClaims?.[0] ||
              card.discrepancies?.[0] ||
              card.flaggedNotes?.find((f) => f.startsWith('FLAG: Past event'))}
          </span>
        </div>
      ) : null}

      {cardAssets.length > 0 && (
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>
              {cardAssets.length} {cardAssets.length === 1 ? 'asset' : 'assets'}
            </span>
            {cardAssets.length > 1 && <span>Drag to reorder</span>}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 ops-scroll">
            {cardAssets.map((asset) => {
              const pLabel = assetPlatformLabel(asset.platform);
              const isDragging = dragAssetId === asset.id;
              return (
                <div
                  key={asset.id}
                  draggable={cardAssets.length > 1 && Boolean(onReorderAssets) && !busy}
                  onDragStart={() => setDragAssetId(asset.id)}
                  onDragEnd={() => setDragAssetId(null)}
                  onDragOver={(e) => {
                    if (cardAssets.length > 1 && onReorderAssets) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDropAsset(asset.id);
                  }}
                  onClick={() => onPreviewAsset?.(asset)}
                  title={`${asset.file || asset.label || asset.kind} (${pLabel}) · Click to inspect`}
                  className={`relative shrink-0 w-12 h-12 rounded-md border overflow-hidden cursor-pointer transition-all ${
                    isDragging
                      ? 'opacity-45 border-accent'
                      : asset.status === 'rejected'
                        ? 'border-red-500/60'
                        : asset.status === 'approved'
                          ? 'border-emerald-500/50'
                          : 'border-border hover:border-accent/60'
                  }`}
                >
                  <OpsAssetThumb asset={asset} size="thumb" className="w-full h-full" />
                  <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-black/75 text-white text-[8px] font-mono leading-tight">
                    {pLabel}
                  </span>
                  <span
                    className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full border border-black/40 ${
                      asset.status === 'approved'
                        ? 'bg-emerald-400'
                        : asset.status === 'rejected'
                          ? 'bg-red-400'
                          : 'bg-amber-400'
                    }`}
                    title={`Status: ${asset.status}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {cardAssets.length === 0 && (() => {
        const articleUrl = extractPrimaryArticleUrl(card);
        return articleUrl ? (
          <div className="pt-0.5">
            <OpsLinkCardPreview url={articleUrl} variant="card" compact />
          </div>
        ) : null;
      })()}

      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-border/60">
        <div className="flex flex-wrap items-center gap-1.5">
          {card.sourceUrl && (
            <a
              href={card.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-[10px] font-mono text-accent hover:underline"
            >
              Source <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
          {cardAssets.length === 0 &&
            (completeness.assetState === 'not_needed' ? (
              <span className="px-1.5 py-0.5 rounded border border-sky-500/35 bg-sky-500/10 text-[10px] font-mono text-sky-700 dark:text-sky-300">
                No image needed
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded border border-amber-500/35 bg-amber-500/10 text-[10px] font-mono text-amber-700 dark:text-amber-300">
                Asset missing
              </span>
            ))}
          {card.targetPlatforms?.map((p) => {
            const label = p === 'linkedin' ? 'LI' : p.toUpperCase();
            const href = card.links?.[p];
            return href ? (
              <a
                key={`tp-${p}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-1.5 py-0.5 rounded border border-emerald-500/35 bg-emerald-500/10 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                {label} ✓
              </a>
            ) : (
              <span
                key={`tp-${p}`}
                className="px-1.5 py-0.5 rounded border border-amber-500/35 bg-amber-500/10 text-[10px] font-mono text-amber-700 dark:text-amber-300"
              >
                {label} ○
              </span>
            );
          })}
          {linkList
            .filter(
              (l) =>
                !card.targetPlatforms?.includes(
                  l.label === 'LI' ? 'linkedin' : (l.label.toLowerCase() as 'fb' | 'ig' | 'x')
                )
            )
            .map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-1.5 py-0.5 rounded border border-emerald-500/35 bg-emerald-500/10 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                {l.label}
              </a>
            ))}
        </div>

        {isReady ? (
          !card.postIt ? (
            <button
              type="button"
              disabled={busy}
              onClick={onPostIt}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              <Send className="w-2.5 h-2.5" />
              Post it
            </button>
          ) : hasActiveClaim ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              Claimed · {card.claimedBy}
            </span>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={onCancelPostIt}
              title="Un-click Post it (available until a bot claims it)"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border border-amber-500/45 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 disabled:opacity-50 transition-colors"
            >
              Cancel Post it
            </button>
          )
        ) : isApprovedQueue ? (
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-violet-500/35 bg-violet-500/10 text-violet-700 dark:text-violet-300"
            title={completeness.detail || 'Crew completing assets and Mark Ready'}
          >
            {completeness.canApproveReady ? 'Crew Mark Ready' : 'Crew finishing'}
          </span>
        ) : (
          card.stage !== 'posted' &&
          card.stage !== 'archived' && (
            <button
              type="button"
              disabled={busy}
              onClick={onReadyForRotty}
              title="Approve draft and send to Crew Queue"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border border-accent/40 text-accent hover:bg-accent/10 disabled:opacity-50"
            >
              <Check className="w-2.5 h-2.5" />
              Approve
            </button>
          )
        )}
      </div>
    </div>
  );
}

const CHAT_TARGET_CHIPS = [
  {
    key: 'all',
    label: '@All',
    mentionToken: '',
    dotCls: 'bg-cyan-400',
    tagCls: 'text-cyan-700 dark:text-cyan-300',
    accentBorderL: 'border-l-cyan-500/80',
    accentBorderR: 'border-r-cyan-500/70',
    accentText: 'text-cyan-700 dark:text-cyan-300',
  },
  {
    key: 'marley',
    label: '@Marley',
    mentionToken: '@Marley',
    dotCls: 'bg-teal-400',
    tagCls: 'text-teal-700 dark:text-teal-300',
    accentBorderL: 'border-l-teal-500/80',
    accentBorderR: 'border-r-teal-500/70',
    accentText: 'text-teal-700 dark:text-teal-300',
  },
  {
    key: 'sovereign',
    label: '@Sovereign',
    mentionToken: '@Sovereign',
    dotCls: 'bg-indigo-400',
    tagCls: 'text-indigo-700 dark:text-indigo-300',
    accentBorderL: 'border-l-indigo-500/80',
    accentBorderR: 'border-r-indigo-500/70',
    accentText: 'text-indigo-700 dark:text-indigo-300',
  },
  {
    key: 'pixel',
    label: '@Pixel',
    mentionToken: '@Pixel',
    dotCls: 'bg-amber-400',
    tagCls: 'text-amber-700 dark:text-amber-300',
    accentBorderL: 'border-l-amber-500/80',
    accentBorderR: 'border-r-amber-500/70',
    accentText: 'text-amber-700 dark:text-amber-300',
  },
  {
    key: 'cheat-code',
    label: '@CheatCode',
    mentionToken: '@CheatCode',
    dotCls: 'bg-violet-400',
    tagCls: 'text-violet-700 dark:text-violet-300',
    accentBorderL: 'border-l-violet-500/80',
    accentBorderR: 'border-r-violet-500/70',
    accentText: 'text-violet-700 dark:text-violet-300',
  },
];

function normalizeChatHandle(raw?: string): string {
  return (raw || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

const EXTRA_CHIP_ACCENTS = [
  {
    dotCls: 'bg-sky-400',
    tagCls: 'text-sky-700 dark:text-sky-300',
    accentBorderL: 'border-l-sky-500/80',
    accentBorderR: 'border-r-sky-500/70',
    accentText: 'text-sky-700 dark:text-sky-300',
  },
  {
    dotCls: 'bg-rose-400',
    tagCls: 'text-rose-700 dark:text-rose-300',
    accentBorderL: 'border-l-rose-500/80',
    accentBorderR: 'border-r-rose-500/70',
    accentText: 'text-rose-700 dark:text-rose-300',
  },
  {
    dotCls: 'bg-emerald-400',
    tagCls: 'text-emerald-700 dark:text-emerald-300',
    accentBorderL: 'border-l-emerald-500/80',
    accentBorderR: 'border-r-emerald-500/70',
    accentText: 'text-emerald-700 dark:text-emerald-300',
  },
];

function getChatAccentByHandle(handle?: string) {
  const norm = normalizeChatHandle(handle);
  const preset = CHAT_TARGET_CHIPS.find((c) => c.key !== 'all' && normalizeChatHandle(c.key) === norm);
  if (preset) return preset;
  if (!norm) return CHAT_TARGET_CHIPS[0];
  let hash = 0;
  for (let i = 0; i < norm.length; i++) hash = (hash * 31 + norm.charCodeAt(i)) >>> 0;
  return { ...CHAT_TARGET_CHIPS[0], ...EXTRA_CHIP_ACCENTS[hash % EXTRA_CHIP_ACCENTS.length] };
}

const CHAT_MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatChatDateDivider(dateKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return dateKey;
  const year = Number(match[1]);
  const monthIdx = Number(match[2]) - 1;
  const dayNum = Number(match[3]);
  const shortLabel = `${dayNum} ${CHAT_MONTHS[monthIdx] || match[2]}`;
  const now = new Date();
  const todayUtc = now.toISOString().slice(0, 10);
  const yesterdayUtc = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  if (dateKey === todayUtc) return `Today • ${shortLabel}`;
  if (dateKey === yesterdayUtc) return `Yesterday • ${shortLabel}`;
  const currentYear = Number(todayUtc.slice(0, 4));
  return year !== currentYear ? `${shortLabel} ${year}` : shortLabel;
}

function getChatCardMeta(card: PipelineCard) {
  const completeness = getCardCompleteness(card);
  const isReady = card.stage === 'approved' && Boolean(card.readyForRotty) && completeness.canApproveReady;
  const liveLinks = getCardPublishedLinks(card);
  let statusLabel = 'Clearance';
  let statusCls = 'border-cyan-500/35 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300';
  let footerDot = 'bg-cyan-400';
  let footerNote = 'In desk queue';

  if (card.stage === 'posted') {
    statusLabel = 'Posted';
    statusCls = 'border-emerald-500/35 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    footerDot = 'bg-emerald-400';
    footerNote = liveLinks.length > 0 ? `${liveLinks.length} live link${liveLinks.length > 1 ? 's' : ''}` : 'Published';
  } else if (card.stage === 'archived') {
    statusLabel = 'Archived';
    statusCls = 'border-border bg-muted text-muted-foreground';
    footerDot = 'bg-muted-foreground';
    footerNote = 'Archived';
  } else if (card.postIt && isReady) {
    statusLabel = 'Post it Armed';
    statusCls = 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    footerDot = 'bg-emerald-400';
    footerNote = card.claimedBy ? `Claimed · ${card.claimedBy}` : 'Armed for publisher';
  } else if (isReady) {
    statusLabel = 'Ready';
    statusCls = 'border-cyan-500/40 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300';
    footerDot = 'bg-cyan-400';
    footerNote = 'Ready for Rotty';
  } else if (completeness.assetState === 'missing') {
    statusLabel = 'Asset Missing';
    statusCls = 'border-amber-500/35 bg-amber-500/15 text-amber-700 dark:text-amber-300';
    footerDot = 'bg-amber-400';
    footerNote = card.assignedTo ? `Awaiting @${card.assignedTo}` : 'Awaiting asset link';
  } else if (card.stage === 'approved') {
    statusLabel = 'Approved';
    statusCls = 'border-emerald-500/35 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    footerDot = 'bg-emerald-400';
    footerNote = card.assignedTo ? `Assigned → ${card.assignedTo}` : 'Approved crew queue';
  } else if (card.stage === 'pulled') {
    statusLabel = 'Drop';
    statusCls = 'border-border bg-muted/70 text-foreground/85';
    footerDot = 'bg-cyan-400';
    footerNote = 'Pulled drop';
  } else if (card.stage === 'drafted') {
    statusLabel = 'Drafted';
    statusCls = 'border-sky-500/35 bg-sky-500/15 text-sky-700 dark:text-sky-300';
    footerDot = 'bg-sky-400';
    footerNote = 'Draft ready for review';
  }

  let sourceDomain = '';
  if (card.sourceUrl) {
    try {
      sourceDomain = new URL(card.sourceUrl).hostname.replace(/^www\./, '');
    } catch {
      sourceDomain = '';
    }
  }

  const formatBadges = getCardFormatBadges(card);
  const primaryFormat = formatBadges.secondary
    ? `${formatBadges.primary} · ${formatBadges.secondary}`
    : formatBadges.primary;
  const assetLabel =
    completeness.assetState === 'missing'
      ? 'Needs Photo'
      : completeness.assetState === 'not_needed'
        ? 'No Photo Needed'
        : 'Asset Ready';

  return {
    completeness,
    liveLinks,
    statusLabel,
    statusCls,
    footerDot,
    footerNote,
    sourceDomain,
    primaryFormat,
    assetLabel,
  };
}

function CrewChatAvatar({
  name,
  src,
  isOperator = false,
  badgeDotCls,
}: {
  name: string;
  src?: string;
  isOperator?: boolean;
  badgeDotCls?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const initials =
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || '?';
  const showImage = Boolean(src && failedSrc !== src);

  return (
    <div
      className={`relative w-7 h-7 rounded-full border font-mono text-[10px] font-bold flex items-center justify-center shrink-0 ${
        isOperator
          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-700 dark:text-cyan-300 shadow-[0_0_12px_-3px_rgba(6,182,212,0.35)]'
          : 'bg-accent/15 border-border text-accent'
      }`}
    >
      <span className="overflow-hidden w-full h-full rounded-full flex items-center justify-center relative">
        <span>{initials}</span>
        {showImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setFailedSrc(src ?? null)}
          />
        )}
      </span>
      {badgeDotCls && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-background ${badgeDotCls}`}
        />
      )}
    </div>
  );
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

function CrewChatPanel({
  messages,
  crew,
  pipeline = [],
  highlightKinds,
  busy,
  tall = false,
  onOpenJob,
  onSend,
  onDelete,
}: {
  messages: ChatMessage[];
  crew: CrewMember[];
  pipeline?: PipelineCard[];
  highlightKinds: Map<string, UpdateAlertKind>;
  busy: boolean;
  tall?: boolean;
  onOpenJob?: (card: PipelineCard) => void;
  onSend: (text: string, to?: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState('');
  const [targetMention, setTargetMention] = useState<string>('all');
  const [showJumpLatest, setShowJumpLatest] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const initializedScrollRef = useRef(false);
  const stickToBottomRef = useRef(true);
  const forceScrollRef = useRef(false);

  const filteredMessages = useMemo(() => {
    if (targetMention === 'all') return messages;
    const targetNorm = normalizeChatHandle(targetMention);
    return messages.filter((m) => {
      if (normalizeChatHandle(m.senderId) === targetNorm) return true;
      if (normalizeChatHandle(m.senderName) === targetNorm) return true;
      if (m.mentions?.some((tag) => normalizeChatHandle(tag) === targetNorm)) return true;
      return false;
    });
  }, [messages, targetMention]);

  const lastMessageId = filteredMessages[filteredMessages.length - 1]?.id || '';

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || filteredMessages.length === 0) return;

    if (!initializedScrollRef.current) {
      el.scrollTop = el.scrollHeight;
      initializedScrollRef.current = true;
      stickToBottomRef.current = true;
      return;
    }

    if (forceScrollRef.current || stickToBottomRef.current) {
      forceScrollRef.current = false;
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
      setShowJumpLatest(false);
    } else {
      setShowJumpLatest(true);
    }
  }, [lastMessageId, filteredMessages.length]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < 64;
    stickToBottomRef.current = nearBottom;
    if (nearBottom) {
      setShowJumpLatest(false);
    }
  };

  const cardById = useMemo(() => {
    const map = new Map<string, PipelineCard>();
    for (const c of pipeline) map.set(c.id, c);
    return map;
  }, [pipeline]);

  const crewInfoByHandle = useMemo(() => {
    const map = new Map<string, { avatar?: string; dotCls: string; statusLabel?: string }>();
    for (const c of crew) {
      const resolved = resolveAvatarRenderUrl(c.avatarUrl);
      const dotCls = STATUS_DOT[c.status] || STATUS_DOT.active;
      const entry = { avatar: resolved, dotCls, statusLabel: AGENT_BADGE[c.status]?.label };
      map.set(normalizeChatHandle(c.agentId), entry);
      map.set(normalizeChatHandle(c.name), entry);
    }
    return map;
  }, [crew]);

  const chatTargetChips = useMemo(() => {
    const base = [...CHAT_TARGET_CHIPS];
    const seen = new Set(base.map((c) => normalizeChatHandle(c.key)));
    const activeChatHandles = new Set<string>();
    for (const m of messages) {
      activeChatHandles.add(normalizeChatHandle(m.senderId));
      for (const t of m.mentions || []) activeChatHandles.add(normalizeChatHandle(t));
    }
    for (const m of crew) {
      const id = m.agentId;
      const norm = normalizeChatHandle(id);
      if (!norm || norm === 'rotty' || seen.has(norm)) continue;
      if (m.status !== 'active' && m.status !== 'on_call' && !activeChatHandles.has(norm)) continue;
      seen.add(norm);
      const token = `@${m.name.replace(/\s+/g, '')}`;
      const accent = getChatAccentByHandle(id);
      base.push({
        key: id,
        label: token,
        mentionToken: token,
        dotCls: accent.dotCls,
        tagCls: accent.tagCls,
        accentBorderL: accent.accentBorderL,
        accentBorderR: accent.accentBorderR,
        accentText: accent.accentText,
      });
    }
    return base;
  }, [crew, messages]);

  const activeChipLabel =
    chatTargetChips.find((c) => c.key === targetMention)?.label || '@All';

  const chatAlerts = useMemo(() => {
    const channelAlert = new Map<string, UpdateAlertKind>();
    let overallKind: UpdateAlertKind | undefined;
    let activeCount = 0;
    for (const m of messages) {
      const k = highlightKinds.get(m.id);
      if (!k) continue;
      activeCount += 1;
      overallKind = overallKind === 'new' || k === 'new' ? 'new' : 'updated';
      const handles = new Set<string>([
        normalizeChatHandle(m.senderId),
        normalizeChatHandle(m.senderName),
        ...(m.mentions || []).map((t) => normalizeChatHandle(t)),
      ]);
      for (const chip of chatTargetChips) {
        if (chip.key === 'all') continue;
        if (handles.has(normalizeChatHandle(chip.key))) {
          const prev = channelAlert.get(chip.key);
          channelAlert.set(chip.key, prev === 'new' || k === 'new' ? 'new' : 'updated');
        }
      }
    }
    if (overallKind) channelAlert.set('all', overallKind);
    return { channelAlert, overallKind, activeCount };
  }, [messages, highlightKinds, chatTargetChips]);

  const headerAlertMeta = getUpdateAlertMeta(chatAlerts.overallKind);

  const appendMentionTag = (mentionToken: string) => {
    if (!mentionToken) return;
    setDraft((prev) => {
      if (new RegExp(`(^|\\s)${mentionToken}\\b`, 'i').test(prev)) return prev;
      const sep = prev.length === 0 || /\s$/.test(prev) ? '' : ' ';
      return `${prev}${sep}${mentionToken} `;
    });
    inputRef.current?.focus();
  };

  return (
    <section
      className={`rounded-xl border border-border bg-card flex flex-col overflow-hidden [overflow-anchor:none] ${
        tall ? 'h-[480px] lg:h-[620px]' : 'h-[264px] lg:h-[296px]'
      }`}
    >
      {/* Top Bar: Header + Filter/Target Pills */}
      <div className="px-2.5 pt-2 pb-1.5 border-b border-border/80 bg-card/95 backdrop-blur-sm space-y-1.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="w-3.5 h-3.5 text-accent shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
              Crew Chat
            </h2>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            {headerAlertMeta && (
              <span className={`px-1.5 py-0 rounded border text-[9px] font-mono ${headerAlertMeta.badgeCls}`}>
                {chatAlerts.activeCount} {headerAlertMeta.label}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {targetMention === 'all'
              ? `${messages.length} msgs`
              : `${filteredMessages.length}/${messages.length} in ${activeChipLabel}`}
          </span>
        </div>

        <nav aria-label="Crew chat filters" className="flex items-center gap-1 overflow-x-auto ops-scroll pb-0.5">
          {chatTargetChips.map((chip) => {
            const active = targetMention === chip.key;
            const chipAlert = getUpdateAlertMeta(chatAlerts.channelAlert.get(chip.key));
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => {
                  stickToBottomRef.current = true;
                  setTargetMention((prev) =>
                    chip.key === 'all' ? 'all' : prev === chip.key ? 'all' : chip.key
                  );
                }}
                title={
                  chip.key === 'all'
                    ? 'Show all crew messages & broadcast to @All'
                    : `Filter & target ${chip.label} (click again for @All)`
                }
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border whitespace-nowrap transition-all ${
                  chipAlert && !active
                    ? chipAlert.tabBorderCls
                    : active && chipAlert
                      ? `${chipAlert.tabBorderCls} font-semibold`
                      : active
                        ? 'bg-cyan-500/15 border-cyan-500/45 text-cyan-800 dark:text-cyan-200 shadow-sm'
                        : 'bg-background/70 border-border text-muted-foreground hover:text-foreground hover:border-accent/50'
                }`}
              >
                {chip.key === 'all' ? (
                  <>
                    {chipAlert && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${chipAlert.dotCls}`} />}
                    <span>{chip.label}</span>
                    <span className="px-1 rounded text-[9px] font-mono bg-cyan-500/25 text-cyan-900 dark:text-cyan-100">
                      {messages.length}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${chipAlert ? chipAlert.dotCls : chip.dotCls}`}
                    />
                    <span>{chip.label}</span>
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Chat Feed Area */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto overscroll-contain [overflow-anchor:none] scroll-auto ops-scroll px-2.5 py-2 space-y-2"
        >
          {filteredMessages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background/40 px-3 py-5 text-xs text-muted-foreground text-center">
              {messages.length === 0 ? (
                <>
                  No messages yet — bots can talk via <span className="font-mono text-foreground">/api/bots/chat</span> or ping them below (defaults to <span className="font-mono text-accent">@All</span>).
                </>
              ) : (
                <>
                  No messages in <span className="font-mono text-foreground">{activeChipLabel}</span> yet.{' '}
                  <button
                    type="button"
                    onClick={() => setTargetMention('all')}
                    className="text-accent hover:underline font-mono"
                  >
                    Show @All
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredMessages.map((m, idx) => {
              const dateKey = m.createdAt?.slice(0, 10) || '';
              const prevDateKey = idx > 0 ? filteredMessages[idx - 1]?.createdAt?.slice(0, 10) || '' : '';
              const showDateDivider = Boolean(dateKey && dateKey !== prevDateKey);

              const msgAlert = getUpdateAlertMeta(highlightKinds.get(m.id));
              const isOp = m.senderKind === 'operator';
              const senderInfo =
                crewInfoByHandle.get(normalizeChatHandle(m.senderId)) ||
                crewInfoByHandle.get(normalizeChatHandle(m.senderName));
              const linkedCard = m.jobId ? cardById.get(m.jobId) : undefined;
              const cardMeta = linkedCard ? getChatCardMeta(linkedCard) : null;
              const liveLinks = cardMeta?.liveLinks || [];

              const primaryTargetHandle =
                m.mentions?.find((tag) => normalizeChatHandle(tag) !== 'rotty') || m.mentions?.[0];
              const targetAccent = getChatAccentByHandle(primaryTargetHandle || m.senderId);
              const senderAccent = getChatAccentByHandle(m.senderId || m.senderName);
              const timeStr = m.createdAt?.slice(11, 16) || '';

              const isOperatorDispatch = isOp || Boolean(linkedCard || m.jobTitle);
              const isCompactReply = !isOp && !linkedCard && !m.jobTitle && m.text.length < 220;

              const operatorBorderL =
                cardMeta?.completeness.assetState === 'missing'
                  ? 'border-l-amber-500/80'
                  : targetAccent.accentBorderL;

              return (
                <div key={m.id} className="space-y-2.5">
                  {showDateDivider && (
                    <div className="flex items-center justify-center my-1">
                      <div className="h-px bg-border/80 flex-1" />
                      <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-wider uppercase text-muted-foreground bg-muted/60 dark:bg-card border border-border rounded-lg mx-2">
                        {formatChatDateDivider(dateKey)}
                      </span>
                      <div className="h-px bg-border/80 flex-1" />
                    </div>
                  )}

                  {isCompactReply ? (
                    /* Compact Crew Reply Card */
                    <article
                      className={`group rounded-xl border bg-background/75 p-2.5 ml-3 border-r-2 transition-all duration-500 ${
                        msgAlert ? msgAlert.cardBorderCls : `border-border ${senderAccent.accentBorderR}`
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <CrewChatAvatar
                            name={m.senderName}
                            src={senderInfo?.avatar}
                            badgeDotCls={senderInfo?.dotCls}
                          />
                          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                            <span className={`text-xs font-bold truncate ${senderAccent.accentText}`}>
                              {m.senderName}
                            </span>
                            {msgAlert && (
                              <span className={`px-1 py-0 rounded border text-[8px] font-mono ${msgAlert.badgeCls}`}>
                                {msgAlert.label}
                              </span>
                            )}
                            {m.mentions && m.mentions.length > 0 && (
                              <span className="text-[10px] font-mono text-accent truncate">
                                {m.mentions.map((tag) => `@${tag}`).join(' ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-mono text-muted-foreground">{timeStr}</span>
                          <button
                            type="button"
                            aria-label="Delete chat message"
                            disabled={busy}
                            onClick={() => onDelete(m.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-red-500 transition-opacity disabled:opacity-40"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-foreground/95 pl-9 whitespace-pre-wrap break-words leading-relaxed">
                        {renderLinkifiedText(m.text)}
                      </p>
                      {liveLinks.length > 0 && (
                        <div className="pl-9 mt-1.5 flex flex-wrap items-center gap-1.5">
                          {liveLinks.map((l) => (
                            <a
                              key={`chat-${m.id}-${l.platform}`}
                              href={l.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 hover:underline"
                            >
                              {l.shortLabel} Live <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      )}
                    </article>
                  ) : isOperatorDispatch && isOp ? (
                    /* Operator Dispatch / Assignment Card */
                    <article
                      className={`group rounded-xl border border-l-4 bg-background/75 p-2.5 transition-all duration-500 ${
                        msgAlert ? msgAlert.cardBorderCls : `border-border ${operatorBorderL}`
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <CrewChatAvatar name={m.senderName} src={senderInfo?.avatar} isOperator />
                          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                            <span className="text-xs font-bold text-foreground">{m.senderName}</span>
                            {msgAlert && (
                              <span className={`px-1 py-0 rounded border text-[8px] font-mono ${msgAlert.badgeCls}`}>
                                {msgAlert.label}
                              </span>
                            )}
                            <span className="px-1.5 py-0 rounded text-[9px] font-mono font-semibold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/35">
                              Operator
                            </span>
                            {m.mentions && m.mentions.length > 0 && (
                              <span className={`text-[11px] font-semibold truncate ${targetAccent.accentText}`}>
                                {m.mentions.map((tag) => `@${tag}`).join(' ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-mono text-muted-foreground">{timeStr}</span>
                          <button
                            type="button"
                            aria-label="Delete chat message"
                            disabled={busy}
                            onClick={() => onDelete(m.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-red-500 transition-opacity disabled:opacity-40"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="rounded-lg p-2.5 border border-border/80 bg-muted/40 dark:bg-card/70 space-y-1.5">
                        {(m.jobTitle || cardMeta) && (
                          <div className="flex items-start justify-between gap-2">
                            {linkedCard && onOpenJob ? (
                              <button
                                type="button"
                                onClick={() => onOpenJob(linkedCard)}
                                title={`Open card: ${m.jobTitle || linkedCard.title}`}
                                className={`text-left text-[10px] font-mono uppercase tracking-wide hover:underline truncate ${
                                  cardMeta?.completeness.assetState === 'missing'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : targetAccent.accentText
                                }`}
                              >
                                Re: {m.jobTitle || linkedCard.title}
                              </button>
                            ) : (
                              <span className="text-[10px] font-mono text-accent uppercase tracking-wide truncate">
                                Re: {m.jobTitle}
                              </span>
                            )}
                            {cardMeta && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border shrink-0 leading-none ${cardMeta.statusCls}`}
                              >
                                {cardMeta.statusLabel}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-foreground/95 whitespace-pre-wrap break-words leading-snug">
                          {renderLinkifiedText(m.text)}
                        </p>

                        {cardMeta && (
                          <div className="pt-1.5 border-t border-border/70 text-[10px] font-mono text-muted-foreground flex flex-wrap items-center gap-1.5">
                            <span
                              className={
                                cardMeta.completeness.assetState === 'missing'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }
                            >
                              {cardMeta.assetLabel}
                            </span>
                            {cardMeta.primaryFormat && (
                              <>
                                <span>•</span>
                                <span>{cardMeta.primaryFormat}</span>
                              </>
                            )}
                            {cardMeta.sourceDomain && (
                              <>
                                <span>•</span>
                                <span className="text-accent truncate max-w-[140px]">
                                  {cardMeta.sourceDomain}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {(linkedCard || liveLinks.length > 0) && (
                        <div className="flex items-center justify-between gap-2 mt-2 pt-0.5 text-[11px]">
                          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                            {liveLinks.length > 0 ? (
                              liveLinks.map((l) => (
                                <a
                                  key={`chat-${m.id}-${l.platform}`}
                                  href={l.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 hover:underline"
                                >
                                  {l.shortLabel} Live <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ))
                            ) : cardMeta ? (
                              <span className="text-muted-foreground inline-flex items-center gap-1.5 truncate">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cardMeta.footerDot}`} />
                                <span className="truncate">{cardMeta.footerNote}</span>
                              </span>
                            ) : null}
                          </div>
                          {linkedCard && onOpenJob && (
                            <button
                              type="button"
                              onClick={() => onOpenJob(linkedCard)}
                              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded shrink-0 transition-colors"
                            >
                              <span>Open Card</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  ) : (
                    /* Bot Structured Report Card */
                    <article
                      className={`group rounded-xl border bg-background/75 p-2.5 transition-all duration-500 ${
                        msgAlert ? msgAlert.cardBorderCls : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/70 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CrewChatAvatar
                            name={m.senderName}
                            src={senderInfo?.avatar}
                            badgeDotCls={senderInfo?.dotCls}
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 leading-tight">
                              <span className="text-xs font-bold text-foreground truncate">
                                {m.senderName}
                              </span>
                              {msgAlert && (
                                <span className={`px-1 py-0 rounded border text-[8px] font-mono ${msgAlert.badgeCls}`}>
                                  {msgAlert.label}
                                </span>
                              )}
                              {/\bverified\b|\blive\b/i.test(m.text) ? (
                                <span className="px-1.5 py-0 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                                  VERIFIED
                                </span>
                              ) : senderInfo?.statusLabel ? (
                                <span className="px-1.5 py-0 rounded text-[9px] font-mono bg-muted text-muted-foreground border border-border">
                                  {senderInfo.statusLabel}
                                </span>
                              ) : null}
                            </div>
                            {m.mentions && m.mentions.length > 0 && (
                              <span className="text-[10px] text-muted-foreground block truncate">
                                Target:{' '}
                                <span className="text-accent font-mono">
                                  {m.mentions.map((tag) => `@${tag}`).join(' ')}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-mono text-muted-foreground">{timeStr}</span>
                          <button
                            type="button"
                            aria-label="Delete chat message"
                            disabled={busy}
                            onClick={() => onDelete(m.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-red-500 transition-opacity disabled:opacity-40"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="rounded-lg p-2 border border-border/80 bg-muted/35 dark:bg-card/70 space-y-1">
                        {m.jobTitle && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <span className="text-amber-500 dark:text-amber-400 shrink-0">★</span>
                            {linkedCard && onOpenJob ? (
                              <button
                                type="button"
                                onClick={() => onOpenJob(linkedCard)}
                                className="text-left hover:text-accent hover:underline truncate"
                                title={`Open card: ${m.jobTitle}`}
                              >
                                {m.jobTitle}
                              </button>
                            ) : (
                              <span className="truncate">{m.jobTitle}</span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-foreground/95 whitespace-pre-wrap break-words leading-relaxed">
                          {renderLinkifiedText(m.text)}
                        </p>
                      </div>

                      {(cardMeta || liveLinks.length > 0) && (
                        <>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {cardMeta && (
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border font-mono ${cardMeta.statusCls}`}
                              >
                                {cardMeta.statusLabel}
                              </span>
                            )}
                            {cardMeta?.primaryFormat && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted/60 text-foreground/90 border border-border font-mono">
                                {cardMeta.primaryFormat}
                              </span>
                            )}
                            {cardMeta?.completeness.assetState === 'missing' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 font-mono">
                                {cardMeta.assetLabel}
                              </span>
                            )}
                            {liveLinks.map((l) => (
                              <a
                                key={`chat-${m.id}-${l.platform}`}
                                href={l.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Preview ${l.label} post: ${l.href}`}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 hover:underline"
                              >
                                {l.shortLabel} Live <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                          </div>

                          {linkedCard && onOpenJob && (
                            <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-border/70 text-xs">
                              <span className="text-[10px] font-mono text-muted-foreground truncate">
                                {cardMeta?.footerNote}
                              </span>
                              <button
                                type="button"
                                onClick={() => onOpenJob(linkedCard)}
                                className="text-[11px] font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded inline-flex items-center gap-0.5 shrink-0 transition-colors"
                              >
                                <span>View Card</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </article>
                  )}
                </div>
              );
            })
          )}
        </div>

        {showJumpLatest && (
          <button
            type="button"
            onClick={() => {
              const el = scrollContainerRef.current;
              if (!el) return;
              stickToBottomRef.current = true;
              setShowJumpLatest(false);
              el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
            }}
            className="absolute bottom-2 right-3 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-accent text-accent-foreground shadow-md hover:opacity-90 transition-opacity"
          >
            ↓ Latest
          </button>
        )}
      </div>

      {/* Quick-Mention Dock + Input Composer */}
      <div className="border-t border-border/80 bg-card/95 px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto ops-scroll">
          <span className="text-[10px] font-mono text-muted-foreground uppercase shrink-0">Tags:</span>
          {chatTargetChips.filter((c) => c.key !== 'all').map((chip) => (
            <button
              key={`tag-${chip.key}`}
              type="button"
              onClick={() => appendMentionTag(chip.mentionToken)}
              className={`px-2 py-0.5 rounded-lg border border-border bg-background/80 hover:border-accent/60 text-[10px] font-medium whitespace-nowrap transition-colors ${chip.tagCls}`}
            >
              + {chip.mentionToken}
            </button>
          ))}
        </div>
      </div>

      <form
        className="flex items-center gap-2 px-3 pb-2.5 pt-1.5 bg-card border-t border-border/70 shrink-0"
        onSubmit={async (e) => {
          e.preventDefault();
          const trimmed = draft.trim();
          if (!trimmed || busy) return;
          const hasExplicitMention = /@[a-zA-Z0-9_-]{2,32}/.test(trimmed);
          const to = hasExplicitMention && targetMention === 'all' ? undefined : [targetMention];
          forceScrollRef.current = true;
          stickToBottomRef.current = true;
          setDraft('');
          await onSend(trimmed, to);
        }}
      >
        <div className="relative flex-1 min-w-0">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${activeChipLabel} as Rotty...`}
            className="w-full pl-3 pr-7 py-2 rounded-xl text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground border border-border rounded px-1 pointer-events-none">
            @
          </span>
        </div>
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="h-8 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 shrink-0 transition-all"
        >
          <span className="hidden sm:inline">Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </section>
  );
}

function OpsAdminPanel({
  activeClient,
  isOwner,
  crew,
  metrics,
  busy,
  onPostAction,
  onCreateClient,
}: {
  activeClient: ClientWorkspace | null;
  isOwner: boolean;
  crew: CrewMember[];
  metrics: MetricsSnapshot | null;
  busy: boolean;
  onPostAction: (payload: Record<string, unknown>, msg: string) => Promise<void>;
  onCreateClient: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [pasteText, setPasteText] = useState('');
  const [defaultLane, setDefaultLane] = useState<PipelineLane>('fb-ig');

  const [newTitle, setNewTitle] = useState('');
  const [newLane, setNewLane] = useState<PipelineLane>('fb-ig');
  const [newStage, setNewStage] = useState<PipelineStage>('pulled');
  const [newUrl, setNewUrl] = useState('');
  const [newNote, setNewNote] = useState('');

  const [gateLabel, setGateLabel] = useState('');
  const [gateState, setGateState] = useState<GateState>('hold');
  const [gateDetail, setGateDetail] = useState('');
  const [gateSince, setGateSince] = useState(new Date().toISOString().slice(0, 10));

  const [sessions, setSessions] = useState(metrics?.sessions?.toString() || '');
  const [sessionsPeriod, setSessionsPeriod] = useState(metrics?.sessionsPeriod || '');
  const [leads, setLeads] = useState(metrics?.generateLead?.toString() || '');
  const [followers, setFollowers] = useState(metrics?.xFollowers?.toString() || '');
  const [asOf, setAsOf] = useState(metrics?.asOf || new Date().toISOString().slice(0, 10));
  const [showroomPhase, setShowroomPhase] = useState(metrics?.showroomPhase || '');
  const [showroomNote, setShowroomNote] = useState(metrics?.showroomNote || '');

  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientDomain, setClientDomain] = useState('');
  const [clientEmails, setClientEmails] = useState('');

  const [crewAgentId, setCrewAgentId] = useState(crew[0]?.agentId || 'marley');
  const [crewStatus, setCrewStatus] = useState<AgentStatus>('active');
  const [crewNote, setCrewNote] = useState('');

  return (
    <main className="max-w-[1200px] mx-auto px-3 sm:px-5 pt-5 space-y-5">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-sm font-bold text-foreground">Quick Paste Box — {activeClient?.name}</h1>
            <p className="text-xs text-muted-foreground">
              Paste a Gemini/Grok raw list, a Drive drop with frontmatter, Marley batch clearance markdown, or a YAML crew/gate/metrics snippet.
            </p>
          </div>
          <select
            value={defaultLane}
            onChange={(e) => setDefaultLane(e.target.value as PipelineLane)}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-background border border-border"
          >
            <option value="fb-ig">Raw List Default: FB / IG</option>
            <option value="linkedin">Raw List Default: LinkedIn</option>
            <option value="x">Raw List Default: X</option>
            <option value="article">Raw List Default: Articles</option>
          </select>
        </div>

        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste raw list, YAML block, or Marley batch clearance here..."
          className="w-full min-h-[150px] p-3 rounded-lg text-xs font-mono bg-background border border-border text-foreground"
        />
        <div className="flex justify-end">
          <button
            type="button"
            disabled={busy || !pasteText.trim()}
            onClick={async () => {
              await onPostAction({ action: 'paste', raw: pasteText, defaultLane }, 'Paste applied to board');
              setPasteText('');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Apply Paste
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* New Pipeline Card */}
        <form
          className="rounded-xl border border-border bg-card p-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await onPostAction(
              {
                action: 'create_card',
                title: newTitle,
                lane: newLane,
                stage: newStage,
                sourceUrl: newUrl,
                note: newNote,
              },
              'Added pipeline card'
            );
            setNewTitle('');
            setNewUrl('');
            setNewNote('');
          }}
        >
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
            Add Pipeline Card
          </h2>
          <input
            required
            placeholder="Card title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border"
          />
          <div className="grid grid-cols-2 gap-2">
            <select value={newLane} onChange={(e) => setNewLane(e.target.value as PipelineLane)} className="px-3 py-2 rounded-lg text-xs bg-background border border-border">
              <option value="fb-ig">FB / IG</option>
              <option value="linkedin">LinkedIn</option>
              <option value="x">X</option>
              <option value="article">Articles</option>
            </select>
            <select value={newStage} onChange={(e) => setNewStage(e.target.value as PipelineStage)} className="px-3 py-2 rounded-lg text-xs bg-background border border-border">
              <option value="pulled">Pulled</option>
              <option value="clearance">Clearance</option>
              <option value="drafted">Drafted</option>
              <option value="approved">Approved (Crew Queue)</option>
              <option value="posted">Posted</option>
            </select>
          </div>
          <input
            placeholder="Source URL (https://...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border"
          />
          <input
            placeholder="Note (optional)"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border"
          />
          <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-accent text-accent-foreground">
            <Plus className="w-3.5 h-3.5" /> Add Card
          </button>
        </form>

        {/* Crew Status + Gates */}
        <div className="space-y-4">
          <form
            className="rounded-xl border border-border bg-card p-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await onPostAction(
                { action: 'update_crew', agentId: crewAgentId, status: crewStatus, statusNote: crewNote },
                'Updated crew member'
              );
              setCrewNote('');
            }}
          >
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">Update Crew Status</h2>
            <div className="grid grid-cols-2 gap-2">
              <select value={crewAgentId} onChange={(e) => setCrewAgentId(e.target.value)} className="px-3 py-2 rounded-lg text-xs bg-background border border-border">
                {crew.map((c) => (
                  <option key={c.id} value={c.agentId}>{c.name}</option>
                ))}
              </select>
              <select value={crewStatus} onChange={(e) => setCrewStatus(e.target.value as AgentStatus)} className="px-3 py-2 rounded-lg text-xs bg-background border border-border">
                <option value="active">Active</option>
                <option value="stand_down">Stand-down</option>
                <option value="on_hold">Hold</option>
                <option value="on_call">On Call</option>
                <option value="out">Out</option>
              </select>
            </div>
            <input
              placeholder="Status note"
              value={crewNote}
              onChange={(e) => setCrewNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border"
            />
            <button type="submit" disabled={busy} className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-accent text-accent-foreground">
              Save Crew
            </button>
          </form>

          <form
            className="rounded-xl border border-border bg-card p-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await onPostAction(
                { action: 'upsert_gate', label: gateLabel, state: gateState, detail: gateDetail, since: gateSince },
                'Saved gate'
              );
              setGateLabel('');
              setGateDetail('');
            }}
          >
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">Add / Update Gate</h2>
            <div className="grid grid-cols-2 gap-2">
              <input required placeholder="Gate label" value={gateLabel} onChange={(e) => setGateLabel(e.target.value)} className="px-3 py-2 rounded-lg text-xs bg-background border border-border" />
              <select value={gateState} onChange={(e) => setGateState(e.target.value as GateState)} className="px-3 py-2 rounded-lg text-xs bg-background border border-border">
                <option value="hold">HOLD</option>
                <option value="blocked">BLOCKED</option>
                <option value="awaiting">AWAITING</option>
                <option value="resolved">RESOLVED</option>
              </select>
            </div>
            <input placeholder="Detail" value={gateDetail} onChange={(e) => setGateDetail(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border" />
            <input placeholder="Since (e.g. Nov 25, 2026)" value={gateSince} onChange={(e) => setGateSince(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border" />
            <button type="submit" disabled={busy} className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-accent text-accent-foreground">
              Save Gate
            </button>
          </form>
        </div>

        {/* Manual Funnel Metrics */}
        <form
          className="rounded-xl border border-border bg-card p-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await onPostAction(
              {
                action: 'update_metrics',
                sessions: sessions === '' ? null : Number(sessions),
                sessionsPeriod,
                generateLead: leads === '' ? null : Number(leads),
                xFollowers: followers === '' ? null : Number(followers),
                asOf,
                showroomPhase,
                showroomNote,
              },
              'Updated manual metrics'
            );
          }}
        >
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
            Manual Metrics &amp; Showroom Status
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Sessions" value={sessions} onChange={(e) => setSessions(e.target.value)} className="px-3 py-2 rounded-lg text-xs bg-background border border-border" />
            <input placeholder="Period (Oct 27–Nov 23)" value={sessionsPeriod} onChange={(e) => setSessionsPeriod(e.target.value)} className="px-3 py-2 rounded-lg text-xs bg-background border border-border" />
            <input type="number" placeholder="generate_lead" value={leads} onChange={(e) => setLeads(e.target.value)} className="px-3 py-2 rounded-lg text-xs bg-background border border-border" />
            <input type="number" placeholder="X followers" value={followers} onChange={(e) => setFollowers(e.target.value)} className="px-3 py-2 rounded-lg text-xs bg-background border border-border" />
          </div>
          <input required placeholder="As of date (YYYY-MM-DD)" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border" />
          <input placeholder="Showroom phase" value={showroomPhase} onChange={(e) => setShowroomPhase(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border" />
          <input placeholder="Showroom note" value={showroomNote} onChange={(e) => setShowroomNote(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border" />
          <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-accent text-accent-foreground">
            <Send className="w-3.5 h-3.5" /> Save Metrics
          </button>
        </form>

        {/* Owner-Only Multi-Client Provisioner */}
        {isOwner && (
          <form
            className="rounded-xl border border-border bg-card p-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await onCreateClient({
                id: clientId || undefined,
                name: clientName,
                domain: clientDomain || undefined,
                memberEmails: clientEmails
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              });
              setClientName('');
              setClientId('');
              setClientDomain('');
              setClientEmails('');
            }}
          >
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
              Provision New Client Workspace
            </h2>
            <input required placeholder="Client Display Name" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border" />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Slug ID (e.g. client-two)" value={clientId} onChange={(e) => setClientId(e.target.value)} className="px-3 py-2 rounded-lg text-xs bg-background border border-border" />
              <input placeholder="Domain" value={clientDomain} onChange={(e) => setClientDomain(e.target.value)} className="px-3 py-2 rounded-lg text-xs bg-background border border-border" />
            </div>
            <input placeholder="Allowed client emails (comma-separated)" value={clientEmails} onChange={(e) => setClientEmails(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border" />
            <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-accent text-accent-foreground">
              <Plus className="w-3.5 h-3.5" /> Create Client Board
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
