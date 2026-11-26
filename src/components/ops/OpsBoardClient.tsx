'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import {
  Activity,
  AlertTriangle,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Layers,
  Lock,
  LogOut,
  Moon,
  Plus,
  RefreshCw,
  Send,
  Settings,
  ShieldAlert,
  Sparkles,
  Sun,
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
  ClientWorkspace,
  CrewMember,
  GateItem,
  GateState,
  MetricsSnapshot,
  PipelineCard,
  PipelineLane,
  PipelineStage,
} from '@/lib/ops/types';
import OpsBrandMark from './OpsBrandMark';
import OpsDeskPanel from './OpsDeskPanel';
import { OpsModalHost, type OpsModalState } from './OpsModals';

const STAGE_COLUMNS: Array<{ id: PipelineStage; label: string }> = [
  { id: 'pulled', label: 'Pulled' },
  { id: 'clearance', label: 'Clearance' },
  { id: 'drafted', label: 'Drafted' },
  { id: 'approved', label: 'Ready for Rotty' },
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
  const [gates, setGates] = useState<GateItem[]>([]);
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  const [syncLive, setSyncLive] = useState(false);
  const [laneFilter, setLaneFilter] = useState<PipelineLane | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all');
  const [modal, setModal] = useState<OpsModalState>({ type: 'closed' });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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
        gates: GateItem[];
        metrics: MetricsSnapshot | null;
        activity: ActivityEntry[];
      };
      setCrew(data.crew || []);
      setPipeline(data.pipeline || []);
      setGates(data.gates || []);
      setMetrics(data.metrics || null);
      setActivity(data.activity || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to load board');
    }
  }, [fbUser, activeClientId, accessDeniedMsg, authorizedFetch, showToast]);

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
            gates: GateItem[];
            metrics: MetricsSnapshot | null;
            activity: ActivityEntry[];
          };
          setCrew(data.crew || []);
          setPipeline(data.pipeline || []);
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
            setCrew(snap.docs.map((d) => d.data() as CrewMember));
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
            setPipeline(list);
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
  }, [fbUser, clients.length, activeClientId, accessDeniedMsg, authorizedFetch, syncLive]);

  const activeClient = useMemo(
    () => clients.find((c) => c.id === activeClientId) || clients[0] || null,
    [clients, activeClientId]
  );

  const originalCrew = useMemo(() => crew.filter((c) => c.set === 'original'), [crew]);
  const newCrew = useMemo(() => crew.filter((c) => c.set === 'new'), [crew]);

  const filteredPipeline = useMemo(
    () =>
      pipeline.filter((p) => {
        if (laneFilter !== 'all' && p.lane !== laneFilter) return false;
        if (stageFilter !== 'all' && p.stage !== stageFilter) return false;
        return true;
      }),
    [pipeline, laneFilter, stageFilter]
  );

  const postAction = async (payload: Record<string, unknown>, successMsg: string) => {
    setBusy(true);
    try {
      await authorizedFetch('/api/ops/board', {
        method: 'POST',
        body: JSON.stringify({ clientId: activeClientId, ...payload }),
      });
      await loadBoardViaApi();
      showToast(successMsg);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Action failed');
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
        <div className="max-w-[1440px] mx-auto px-3 sm:px-5 pt-3">
          <div className="rounded-lg border border-accent/40 bg-accent/10 px-3.5 py-2 text-xs font-medium text-foreground">
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
          onPostAction={postAction}
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
        <main className="max-w-[1440px] mx-auto px-3 sm:px-5 pt-4 space-y-5">
          {/* Crew Panels */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CrewGroupCard
              title="Crew — Original Set"
              members={originalCrew}
              onSelect={(member) => setModal({ type: 'crew', member })}
            />
            <CrewGroupCard
              title="Crew — New Set"
              members={newCrew}
              onSelect={(member) => setModal({ type: 'crew', member })}
            />
          </section>

          {/* Lanes Bar */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {(activeClient?.lanes || []).map((lane) => {
              const active = laneFilter === lane.id;
              const count = pipeline.filter((p) => p.lane === lane.id && p.stage !== 'posted').length;
              return (
                <button
                  key={lane.id}
                  type="button"
                  onClick={() => setLaneFilter(active ? 'all' : lane.id)}
                  className={`text-left rounded-xl border p-3 transition-colors ${
                    active
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-card hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground truncate">{lane.label}</span>
                    <span className="text-[11px] font-mono text-accent">{count} open</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{lane.scheduleNote}</div>
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
                  const count = pipeline.filter((p) => p.stage === col.id).length;
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
              </div>

              <div className="text-[11px] font-mono text-muted-foreground">
                Approve queues as Ready for Rotty · never auto-posts
              </div>
            </div>

            {stageFilter === 'all' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                {STAGE_COLUMNS.map((col) => {
                  const cards = filteredPipeline.filter((p) => p.stage === col.id);
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
                              onEdit={() => setModal({ type: 'card', card })}
                              onReadyForRotty={() =>
                                postAction(
                                  { action: 'update_card', id: card.id, stage: 'approved', readyForRotty: true },
                                  `Queued Ready for Rotty: ${card.title}`
                                )
                              }
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
                    onEdit={() => setModal({ type: 'card', card })}
                    onReadyForRotty={() =>
                      postAction(
                        { action: 'update_card', id: card.id, stage: 'approved', readyForRotty: true },
                        `Queued Ready for Rotty: ${card.title}`
                      )
                    }
                  />
                ))}
              </div>
            )}
          </section>

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
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {activity.map((ev) => (
                  <div key={ev.id} className="text-xs border-b border-border/60 pb-2 last:border-0">
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
                      <span className="font-semibold text-accent">{ev.actor}</span>
                      <span>{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-foreground/90 mt-0.5">{ev.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      <OpsModalHost
        state={modal}
        busy={busy}
        onClose={() => setModal({ type: 'closed' })}
        onUpdateCard={async (id, patch) => {
          await postAction({ action: 'update_card', id, ...patch }, 'Updated pipeline card');
          setModal({ type: 'closed' });
        }}
        onDeleteCard={async (id) => {
          await postAction({ action: 'delete_card', id }, 'Removed pipeline card');
          setModal({ type: 'closed' });
        }}
        onUpdateCrew={async (agentId, patch) => {
          await postAction({ action: 'update_crew', agentId, ...patch }, 'Updated crew member');
          setModal({ type: 'closed' });
        }}
        onDeskPaste={async (raw, defaultLane) => {
          await postAction({ action: 'paste', raw, defaultLane }, 'Parsed and landed on board');
          setModal({ type: 'closed' });
        }}
      />
    </div>
  );
}

function CrewGroupCard({
  title,
  members,
  onSelect,
}: {
  title: string;
  members: CrewMember[];
  onSelect: (m: CrewMember) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">{title}</h2>
        <span className="text-[11px] font-mono text-muted-foreground">{members.length}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {members.map((m) => {
          const badge = AGENT_BADGE[m.status] || AGENT_BADGE.active;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m)}
              className="text-left rounded-lg border border-border bg-background/60 hover:border-accent/60 p-2.5 transition-colors space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground truncate">{m.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border shrink-0 ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {m.role} · {m.model}
              </div>
              {m.statusNote && (
                <div className="text-[11px] text-foreground/80 truncate">{m.statusNote}</div>
              )}
              {typeof m.usagePct === 'number' && (
                <div className="pt-1">
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${m.usagePct >= 85 ? 'bg-amber-500' : 'bg-accent'}`}
                      style={{ width: `${m.usagePct}%` }}
                    />
                  </div>
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
  onEdit,
  onReadyForRotty,
}: {
  card: PipelineCard;
  onEdit: () => void;
  onReadyForRotty: () => void;
}) {
  const linkList = [
    card.links?.fb ? { label: 'FB', href: card.links.fb } : null,
    card.links?.ig ? { label: 'IG', href: card.links.ig } : null,
    card.links?.linkedin ? { label: 'LI', href: card.links.linkedin } : null,
    card.links?.x ? { label: 'X', href: card.links.x } : null,
  ].filter((x): x is { label: string; href: string } => Boolean(x));

  return (
    <div className="rounded-lg border border-border bg-background p-2.5 space-y-2 hover:border-accent/50 transition-colors">
      <div className="flex items-center justify-between gap-1.5 text-[10px] font-mono">
        <span className="px-1.5 py-0.5 rounded bg-muted text-foreground uppercase">{card.lane}</span>
        {card.readyForRotty && card.stage !== 'posted' ? (
          <span className="px-1.5 py-0.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
            Ready for Rotty
          </span>
        ) : (
          <span className="text-muted-foreground truncate">{card.agentId}</span>
        )}
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

      {(card.discrepancies?.length || card.artifactsNeeded?.length) ? (
        <div className="text-[10px] text-amber-600 dark:text-amber-300 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {card.artifactsNeeded?.[0] || card.discrepancies?.[0]}
          </span>
        </div>
      ) : null}

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
          {linkList.map((l) => (
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

        {card.stage !== 'posted' && !card.readyForRotty && (
          <button
            type="button"
            onClick={onReadyForRotty}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border border-cyan-500/35 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10"
          >
            <Check className="w-2.5 h-2.5" />
            Ready
          </button>
        )}
      </div>
    </div>
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
              <option value="approved">Ready for Rotty</option>
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
