'use client';

import { useEffect, useState } from 'react';
import {
  X,
  Check,
  Trash2,
  Send,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  Image as ImageIcon,
  Lock,
  Plus,
  ArrowUp,
  ArrowDown,
  Upload,
} from 'lucide-react';
import {
  getCardAssets,
  getCardCompleteness,
  getCardPublishedLinks,
  resolveAvatarRenderUrl,
  syncCardWithAssets,
} from '@/lib/ops/drop-parser';
import type {
  AgentStatus,
  CrewMember,
  CrewSet,
  EngineFamily,
  JobAsset,
  JobAssetKind,
  JobAssetPlatform,
  JobAssetStatus,
  PipelineCard,
  PipelineLane,
  PipelineStage,
  PlatformKey,
} from '@/lib/ops/types';
import { OpsAssetThumb, assetStatusBadge, uploadHostedAssetImage } from './OpsAssetThumb';

const INPUT_CLS =
  'w-full px-3 py-2 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent';

const LABEL_CLS = 'block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1';

const LANE_OPTIONS: Array<{ value: PipelineLane; label: string }> = [
  { value: 'fb-ig', label: 'FB / IG' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X (@CausingPanic1)' },
  { value: 'article', label: 'Articles' },
];

const STAGE_OPTIONS: Array<{ value: PipelineStage; label: string }> = [
  { value: 'pulled', label: 'Pulled' },
  { value: 'clearance', label: 'Clearance' },
  { value: 'drafted', label: 'Drafted' },
  { value: 'approved', label: 'Approved (Crew Queue)' },
  { value: 'posted', label: 'Posted' },
  { value: 'archived', label: 'Archived' },
];

const CREW_STATUS_OPTIONS: Array<{ value: AgentStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'stand_down', label: 'Stand-down' },
  { value: 'on_hold', label: 'Hold' },
  { value: 'on_call', label: 'On Call' },
  { value: 'out', label: 'Out' },
];

const ASSET_KIND_OPTIONS: Array<{ value: JobAssetKind; label: string }> = [
  { value: 'image', label: 'Image' },
  { value: 'carousel_slide', label: 'Carousel slide' },
  { value: 'flyer', label: 'Flyer' },
  { value: 'video', label: 'Video' },
  { value: 'video_frame', label: 'Video frame' },
  { value: 'meme', label: 'Meme' },
];

const ASSET_PLATFORM_OPTIONS: Array<{ value: JobAssetPlatform; label: string }> = [
  { value: 'all', label: 'All platforms' },
  { value: 'fb', label: 'FB' },
  { value: 'ig', label: 'IG' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X' },
];

const ASSET_STATUS_OPTIONS: Array<{ value: JobAssetStatus; label: string }> = [
  { value: 'needed', label: 'Needed' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export type OpsModalState =
  | { type: 'closed' }
  | { type: 'card'; card: PipelineCard }
  | { type: 'crew'; member: CrewMember }
  | { type: 'create_crew'; defaultSet: CrewSet }
  | { type: 'desk_paste' };

export function OpsModalHost({
  state,
  clientId = 'rottym',
  crew = [],
  busy,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onPostIt,
  onCancelPostIt,
  onUpdateCrew,
  onCreateCrew,
  onDeleteCrew,
  onDeskPaste,
}: {
  state: OpsModalState;
  clientId?: string;
  crew?: CrewMember[];
  busy: boolean;
  onClose: () => void;
  onUpdateCard: (id: string, patch: Record<string, unknown>) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
  onPostIt?: (card: PipelineCard) => Promise<void>;
  onCancelPostIt?: (card: PipelineCard) => Promise<void>;
  onUpdateCrew: (agentId: string, patch: Record<string, unknown>) => Promise<void>;
  onCreateCrew: (payload: Record<string, unknown>) => Promise<void>;
  onDeleteCrew: (agentId: string) => Promise<void>;
  onDeskPaste: (raw: string, defaultLane?: PipelineLane) => Promise<void>;
}) {
  useEffect(() => {
    if (state.type === 'closed') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.type, onClose]);

  if (state.type === 'closed') return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden my-auto">
        <div className="px-4 sm:px-5 py-3.5 border-b border-border flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold tracking-tight text-foreground truncate">
            {state.type === 'card'
              ? state.card.title
              : state.type === 'crew'
                ? `Crew: ${state.member.name}`
                : state.type === 'create_crew'
                  ? 'Add Crew Member'
                  : 'Desk Quick-Paste / Blast Intake'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 max-h-[82vh] overflow-y-auto ops-scroll">
          {state.type === 'card' && (
            <CardEditorForm
              key={state.card.id}
              card={state.card}
              clientId={clientId}
              crew={crew}
              busy={busy}
              onSave={(patch) => onUpdateCard(state.card.id, patch)}
              onDelete={() => onDeleteCard(state.card.id)}
              onPostIt={onPostIt ? () => onPostIt(state.card) : undefined}
              onCancelPostIt={onCancelPostIt ? () => onCancelPostIt(state.card) : undefined}
            />
          )}
          {state.type === 'crew' && (
            <CrewEditorForm
              key={state.member.id}
              member={state.member}
              busy={busy}
              onSave={(patch) => onUpdateCrew(state.member.agentId, patch)}
              onDelete={() => onDeleteCrew(state.member.agentId)}
            />
          )}
          {state.type === 'create_crew' && (
            <CrewEditorForm
              key={`create-${state.defaultSet}`}
              defaultSet={state.defaultSet}
              busy={busy}
              onSave={onCreateCrew}
            />
          )}
          {state.type === 'desk_paste' && (
            <DeskPasteForm busy={busy} onSubmit={onDeskPaste} />
          )}
        </div>
      </div>
    </div>
  );
}

function CardEditorForm({
  card,
  clientId,
  crew,
  busy,
  onSave,
  onDelete,
  onPostIt,
  onCancelPostIt,
}: {
  card: PipelineCard;
  clientId: string;
  crew: CrewMember[];
  busy: boolean;
  onSave: (patch: Record<string, unknown>) => Promise<void>;
  onDelete: () => Promise<void>;
  onPostIt?: () => Promise<void>;
  onCancelPostIt?: () => Promise<void>;
}) {
  const initialAssets = getCardAssets(card);
  const [title, setTitle] = useState(card.title);
  const [lane, setLane] = useState<PipelineLane>(card.lane);
  const [stage, setStage] = useState<PipelineStage>(card.stage);
  const [assignedTo, setAssignedTo] = useState(card.assignedTo || '');
  const [source, setSource] = useState(card.source);
  const [sourceUrl, setSourceUrl] = useState(card.sourceUrl || '');
  const [assets, setAssets] = useState<JobAsset[]>(initialAssets);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAssets[0]?.id || '');
  const [uploadingAssetId, setUploadingAssetId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [artifactsNeededText, setArtifactsNeededText] = useState((card.artifactsNeeded || []).join('\n'));
  const [noImageNeeded, setNoImageNeeded] = useState(
    card.photoStatus === 'not_needed' && initialAssets.length === 0
  );
  const [note, setNote] = useState(card.note || '');
  const [draftCopy, setDraftCopy] = useState(card.draftCopy || '');
  const [targetPlatforms, setTargetPlatforms] = useState<PlatformKey[]>(card.targetPlatforms || []);
  const [fbLink, setFbLink] = useState(card.links?.fb || '');
  const [igLink, setIgLink] = useState(card.links?.ig || '');
  const [liLink, setLiLink] = useState(card.links?.linkedin || '');
  const [xLink, setXLink] = useState(card.links?.x || '');

  const hasFormAsset = assets.length > 0;
  const effectivePhotoStatus = hasFormAsset
    ? assets.every((a) => a.status === 'approved')
      ? 'verified'
      : 'attached'
    : noImageNeeded
      ? 'not_needed'
      : 'missing';
  const completeness = getCardCompleteness({
    draftCopy,
    assets,
    photoStatus: effectivePhotoStatus,
  });

  const activeAsset = assets.find((a) => a.id === selectedAssetId) || assets[0] || null;

  const updateAsset = (assetId: string, patch: Partial<JobAsset>) => {
    const now = new Date().toISOString();
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, ...patch, updatedAt: now } : a))
    );
  };

  const addAsset = () => {
    const now = new Date().toISOString();
    const id = `ast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const next: JobAsset = {
      id,
      kind: 'image',
      platform: 'all',
      order: assets.length,
      status: 'delivered',
      addedBy: 'rotty',
      createdAt: now,
      updatedAt: now,
    };
    setAssets((prev) => [...prev, next]);
    setSelectedAssetId(id);
    setNoImageNeeded(false);
  };

  const removeAsset = (assetId: string) => {
    setAssets((prev) => {
      const next = prev
        .filter((a) => a.id !== assetId)
        .map((a, idx) => ({ ...a, order: idx }));
      if (selectedAssetId === assetId) {
        setSelectedAssetId(next[0]?.id || '');
      }
      return next;
    });
  };

  const moveAsset = (assetId: string, dir: -1 | 1) => {
    setAssets((prev) => {
      const idx = prev.findIndex((a) => a.id === assetId);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(target, 0, item);
      return copy.map((a, order) => ({ ...a, order }));
    });
  };

  const handleUploadHosted = async (assetId: string, file: File) => {
    setUploadError(null);
    setUploadingAssetId(assetId);
    try {
      const uploaded = await uploadHostedAssetImage(file, clientId);
      updateAsset(assetId, {
        url: uploaded.url,
        file: assets.find((a) => a.id === assetId)?.file || uploaded.filename,
      });
      setNoImageNeeded(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload hosted image');
    } finally {
      setUploadingAssetId(null);
    }
  };

  const livePublishedLinks = getCardPublishedLinks({
    stage,
    note,
    links: { fb: fbLink, ig: igLink, linkedin: liLink, x: xLink },
  });

  const togglePlatform = (platform: PlatformKey) => {
    setTargetPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const buildPayload = (overrideStage?: PipelineStage, overrideReady?: boolean) => {
    const orderedAssets = assets.map((a, idx) => ({ ...a, order: idx }));
    const synced = syncCardWithAssets(card, orderedAssets);
    const artifactsNeeded = artifactsNeededText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      title,
      lane,
      stage: overrideStage ?? stage,
      assignedTo: assignedTo || null,
      targetPlatforms,
      readyForRotty: overrideReady,
      source,
      sourceUrl,
      assets: orderedAssets,
      assetFile: synced.assetFile || '',
      assetUrl: synced.assetUrl || '',
      assetSpec: synced.assetSpec || '',
      artifactsNeeded,
      photoStatus: effectivePhotoStatus,
      note,
      draftCopy,
      links: { fb: fbLink, ig: igLink, linkedin: liLink, x: xLink },
    };
  };

  return (
    <div className="space-y-4">
      {livePublishedLinks.length > 0 && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Live Published Post
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {livePublishedLinks.map((l) => (
              <a
                key={`modal-live-${l.platform}-${l.href}`}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
              >
                Preview {l.label} <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}

      {(card.discrepancies?.length || card.unverifiedClaims?.length || card.artifactsNeeded?.length || card.flaggedNotes?.length) ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs space-y-1">
          <div className="font-semibold text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Flags &amp; Requirements
          </div>
          {card.discrepancies?.map((d, i) => (
            <p key={`d-${i}`} className="text-foreground/90">• Discrepancy: {d}</p>
          ))}
          {card.unverifiedClaims?.map((c, i) => (
            <p key={`c-${i}`} className="text-foreground/90">• Unverified claim: {c}</p>
          ))}
          {card.artifactsNeeded?.map((a, i) => (
            <p key={`a-${i}`} className="text-foreground/90">• Artifact needed: {a}</p>
          ))}
          {card.flaggedNotes?.map((f, i) => (
            <p key={`f-${i}`} className="text-foreground/90">• {f}</p>
          ))}
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-background/70 overflow-hidden">
        <div className="px-3 py-1.5 border-b border-border/70 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <ImageIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="font-semibold text-foreground">
              Assets ({assets.length})
            </span>
            <span
              className={`px-1.5 py-0 rounded border uppercase ${
                completeness.canApproveReady
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : completeness.assetState === 'not_needed'
                    ? 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300'
                    : 'border-amber-500/45 bg-amber-500/15 text-amber-700 dark:text-amber-300'
              }`}
            >
              {completeness.canApproveReady
                ? 'Complete · Ready-eligible'
                : completeness.buttonReason || 'Incomplete'}
            </span>
          </div>
          <button
            type="button"
            onClick={addAsset}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border bg-card text-foreground hover:border-accent text-[11px] font-mono"
          >
            <Plus className="w-3 h-3" /> Add asset
          </button>
        </div>

        {assets.length > 0 ? (
          <div className="p-2.5 space-y-2.5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 ops-scroll">
              {assets.map((asset, idx) => {
                const selected = activeAsset?.id === asset.id;
                const badge = assetStatusBadge(asset.status);
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`relative shrink-0 w-16 h-16 rounded-lg border overflow-hidden transition-all ${
                      selected
                        ? 'border-accent ring-2 ring-accent/40'
                        : 'border-border hover:border-accent/60'
                    }`}
                    title={`#${idx + 1} · ${asset.file || asset.label || asset.kind} (${asset.platform})`}
                  >
                    <OpsAssetThumb asset={asset} size="thumb" className="w-full h-full" />
                    <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-black/75 text-white text-[9px] font-mono">
                      {idx + 1}·{asset.platform.toUpperCase()}
                    </span>
                    <span
                      className={`absolute top-0.5 right-0.5 px-1 rounded text-[8px] font-mono border ${badge.cls}`}
                    >
                      {badge.label.slice(0, 3)}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeAsset && (
              <div className="rounded-lg border border-border bg-muted/20 p-2 flex flex-col sm:flex-row gap-3 items-center">
                <div className="w-full sm:w-44 h-36 rounded-lg border border-border bg-background overflow-hidden shrink-0">
                  <OpsAssetThumb asset={activeAsset} size="medium" className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5 text-xs w-full">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground">
                      {activeAsset.kind}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground uppercase">
                      {activeAsset.platform}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                        assetStatusBadge(activeAsset.status).cls
                      }`}
                    >
                      {assetStatusBadge(activeAsset.status).label}
                    </span>
                    {activeAsset.label && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                        {activeAsset.label}
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground truncate">
                    {activeAsset.file || activeAsset.url || 'No file/URL yet'}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveAsset(activeAsset.id, -1)}
                      disabled={assets[0]?.id === activeAsset.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border bg-background text-[11px] font-mono disabled:opacity-40"
                    >
                      <ArrowUp className="w-3 h-3" /> Earlier
                    </button>
                    <button
                      type="button"
                      onClick={() => moveAsset(activeAsset.id, 1)}
                      disabled={assets[assets.length - 1]?.id === activeAsset.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border bg-background text-[11px] font-mono disabled:opacity-40"
                    >
                      <ArrowDown className="w-3 h-3" /> Later
                    </button>
                    {activeAsset.url && (
                      <a
                        href={activeAsset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border bg-background text-accent hover:underline text-[11px] font-mono"
                      >
                        Open link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAsset(activeAsset.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-[11px] font-mono ml-auto"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : noImageNeeded ? (
          <div className="px-3 py-3 text-xs text-sky-700 dark:text-sky-300 text-center bg-sky-500/5">
            Text-only post — &ldquo;No image needed&rdquo; selected.
          </div>
        ) : (
          <div className="px-3 py-4 text-xs text-amber-700 dark:text-amber-300 text-center bg-amber-500/5">
            {completeness.detail || 'No assets attached yet — click "Add asset" above or check "No image needed" below.'}
          </div>
        )}
      </div>

      <div>
        <label className={LABEL_CLS}>Title</label>
        <input className={INPUT_CLS} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={LABEL_CLS}>Lane</label>
          <select className={INPUT_CLS} value={lane} onChange={(e) => setLane(e.target.value as PipelineLane)}>
            {LANE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Stage</label>
          <select className={INPUT_CLS} value={stage} onChange={(e) => setStage(e.target.value as PipelineStage)}>
            {STAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Assigned To</label>
          <select className={INPUT_CLS} value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            <option value="">Unassigned</option>
            {crew.map((c) => (
              <option key={c.agentId} value={c.agentId}>
                {c.name} ({c.agentId})
              </option>
            ))}
            {assignedTo && !crew.some((c) => c.agentId === assignedTo) && (
              <option value={assignedTo}>{assignedTo}</option>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Source Label</label>
          <input className={INPUT_CLS} value={source} onChange={(e) => setSource(e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLS}>Source URL (Verification Link)</label>
          <div className="flex gap-1.5">
            <input
              className={INPUT_CLS}
              value={sourceUrl}
              placeholder="https://..."
              onChange={(e) => setSourceUrl(e.target.value)}
            />
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open source URL"
                className="px-2.5 flex items-center rounded-lg border border-border hover:border-accent text-muted-foreground hover:text-accent"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {activeAsset && (
        <div className="rounded-lg border border-border bg-background/60 p-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-foreground font-semibold">
              Editing Asset #{assets.findIndex((a) => a.id === activeAsset.id) + 1} · {activeAsset.id}
            </span>
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-card hover:border-accent text-xs font-mono cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              {uploadingAssetId === activeAsset.id ? 'Uploading...' : 'Upload hosted copy (<=700 KB)'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingAssetId === activeAsset.id}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUploadHosted(activeAsset.id, file);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          {uploadError && (
            <div className="text-xs text-red-600 dark:text-red-400">{uploadError}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className={LABEL_CLS}>Kind</label>
              <select
                className={INPUT_CLS}
                value={activeAsset.kind}
                onChange={(e) => updateAsset(activeAsset.id, { kind: e.target.value as JobAssetKind })}
              >
                {ASSET_KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Platform</label>
              <select
                className={INPUT_CLS}
                value={activeAsset.platform}
                onChange={(e) => updateAsset(activeAsset.id, { platform: e.target.value as JobAssetPlatform })}
              >
                {ASSET_PLATFORM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Status</label>
              <select
                className={INPUT_CLS}
                value={activeAsset.status}
                onChange={(e) => updateAsset(activeAsset.id, { status: e.target.value as JobAssetStatus })}
              >
                {ASSET_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className={LABEL_CLS}>File / Drive ID</label>
              <input
                className={INPUT_CLS}
                value={activeAsset.file || ''}
                placeholder="e.g., slide-1.png"
                onChange={(e) => updateAsset(activeAsset.id, { file: e.target.value })}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Spec</label>
              <input
                className={INPUT_CLS}
                value={activeAsset.spec || ''}
                placeholder="e.g., 1080x1350"
                onChange={(e) => updateAsset(activeAsset.id, { spec: e.target.value })}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Label</label>
              <input
                className={INPUT_CLS}
                value={activeAsset.label || ''}
                placeholder="e.g., Illustration"
                onChange={(e) => updateAsset(activeAsset.id, { label: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className={LABEL_CLS}>Asset URL (Drive / Hosted)</label>
              <input
                className={INPUT_CLS}
                value={activeAsset.url || ''}
                placeholder="https://drive.google.com/... or /api/ops/asset-blob/..."
                onChange={(e) => updateAsset(activeAsset.id, { url: e.target.value })}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Credit (Required for Ready)</label>
              <input
                className={INPUT_CLS}
                value={activeAsset.credit || ''}
                placeholder="e.g., Official Triumph Press / Photo by..."
                onChange={(e) => updateAsset(activeAsset.id, { credit: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className={LABEL_CLS}>Alt Text (Required for Ready)</label>
              <input
                className={INPUT_CLS}
                value={activeAsset.altText || ''}
                placeholder="Accessible description of image"
                onChange={(e) => updateAsset(activeAsset.id, { altText: e.target.value })}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Asset Source URL</label>
              <input
                className={INPUT_CLS}
                value={activeAsset.sourceUrl || ''}
                placeholder="Original provenance page"
                onChange={(e) => updateAsset(activeAsset.id, { sourceUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className={LABEL_CLS}>Caption (Optional)</label>
              <input
                className={INPUT_CLS}
                value={activeAsset.caption || ''}
                onChange={(e) => updateAsset(activeAsset.id, { caption: e.target.value })}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Rejection Reason (If rejected)</label>
              <input
                className={INPUT_CLS}
                value={activeAsset.rejectionReason || ''}
                onChange={(e) => updateAsset(activeAsset.id, { rejectionReason: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className={LABEL_CLS}>Artifacts Needed (one per line — clears when emptied)</label>
        <textarea
          className={`${INPUT_CLS} min-h-[54px] font-mono text-xs`}
          value={artifactsNeededText}
          placeholder="Optional visual deliverables still pending"
          onChange={(e) => setArtifactsNeededText(e.target.value)}
        />
      </div>

      <div className="rounded-lg border border-border bg-background/60 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <label
          className={`inline-flex items-center gap-2 text-xs ${
            hasFormAsset ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground cursor-pointer'
          }`}
        >
          <input
            type="checkbox"
            disabled={hasFormAsset}
            checked={noImageNeeded}
            onChange={(e) => setNoImageNeeded(e.target.checked)}
          />
          <span>No image needed (explicit text-only post, e.g. breaking local news)</span>
        </label>
        {hasFormAsset && (
          <span className="text-[11px] font-mono text-muted-foreground">
            Remove attached assets to mark text-only
          </span>
        )}
      </div>

      <div>
        <label className={LABEL_CLS}>Target Platforms (stays open until all selected land)</label>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'fb', label: 'Facebook' },
              { id: 'ig', label: 'Instagram' },
              { id: 'linkedin', label: 'LinkedIn' },
              { id: 'x', label: 'X' },
            ] as Array<{ id: PlatformKey; label: string }>
          ).map((p) => {
            const active = targetPlatforms.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlatform(p.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                  active
                    ? 'border-accent bg-accent/15 text-foreground font-semibold'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                {active ? '✓ ' : ''}
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={LABEL_CLS}>Operator Note</label>
        <input className={INPUT_CLS} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Status / photo note" />
      </div>

      <div>
        <label className={LABEL_CLS}>Draft / Summary</label>
        <textarea
          className={`${INPUT_CLS} min-h-[110px] font-sans`}
          value={draftCopy}
          onChange={(e) => setDraftCopy(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Facebook URL</label>
          <div className="flex gap-1.5">
            <input className={INPUT_CLS} value={fbLink} onChange={(e) => setFbLink(e.target.value)} placeholder="https://facebook.com/..." />
            {fbLink.trim() && (
              <a
                href={fbLink.trim()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Facebook URL"
                className="px-2.5 flex items-center rounded-lg border border-border hover:border-accent text-muted-foreground hover:text-accent"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>Instagram URL</label>
          <div className="flex gap-1.5">
            <input className={INPUT_CLS} value={igLink} onChange={(e) => setIgLink(e.target.value)} placeholder="https://instagram.com/..." />
            {igLink.trim() && (
              <a
                href={igLink.trim()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Instagram URL"
                className="px-2.5 flex items-center rounded-lg border border-border hover:border-accent text-muted-foreground hover:text-accent"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>LinkedIn URL</label>
          <div className="flex gap-1.5">
            <input className={INPUT_CLS} value={liLink} onChange={(e) => setLiLink(e.target.value)} placeholder="https://linkedin.com/..." />
            {liLink.trim() && (
              <a
                href={liLink.trim()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open LinkedIn URL"
                className="px-2.5 flex items-center rounded-lg border border-border hover:border-accent text-muted-foreground hover:text-accent"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>X URL</label>
          <div className="flex gap-1.5">
            <input className={INPUT_CLS} value={xLink} onChange={(e) => setXLink(e.target.value)} placeholder="https://x.com/..." />
            {xLink.trim() && (
              <a
                href={xLink.trim()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open X URL"
                className="px-2.5 flex items-center rounded-lg border border-border hover:border-accent text-muted-foreground hover:text-accent"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {card.stage === 'approved' &&
            Boolean(card.readyForRotty) &&
            completeness.canApproveReady &&
            (!card.postIt ? (
              onPostIt && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={onPostIt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post it
                </button>
              )
            ) : (
              onCancelPostIt && (
                <button
                  type="button"
                  disabled={busy || Boolean(card.claimedBy)}
                  title={
                    card.claimedBy
                      ? `Claimed by ${card.claimedBy} — cannot cancel`
                      : 'Undo Post it trigger before a bot claims it'
                  }
                  onClick={onCancelPostIt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-500/45 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                >
                  {card.claimedBy ? `Claimed (${card.claimedBy})` : 'Cancel Post it'}
                </button>
              )
            ))}
          {card.stage !== 'approved' && card.stage !== 'posted' && card.stage !== 'archived' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onSave(buildPayload('approved', false))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-500/20 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Approve
            </button>
          )}
          {card.stage === 'approved' && !card.readyForRotty && (
            completeness.canApproveReady ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => onSave(buildPayload('approved', true))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                Mark Ready for Rotty
              </button>
            ) : (
              <button
                type="button"
                disabled
                title={completeness.detail || 'Complete copy and assets before Mark Ready'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-500/45 bg-amber-500/10 text-amber-700 dark:text-amber-300 opacity-85 cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5" />
                Mark Ready · {completeness.buttonReason}
              </button>
            )
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => onSave(buildPayload('posted', false))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Mark Posted
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSave(buildPayload())}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const ENGINE_OPTIONS: Array<{ value: Exclude<EngineFamily, 'all'>; label: string }> = [
  { value: 'grok', label: 'Grok' },
  { value: 'llama', label: 'Meta / Llama' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'claude', label: 'Claude' },
];

const CREW_SET_OPTIONS: Array<{ value: CrewSet; label: string }> = [
  { value: 'original', label: 'Original Set' },
  { value: 'new', label: 'New Set' },
];

function CrewEditorForm({
  member,
  defaultSet = 'new',
  busy,
  onSave,
  onDelete,
}: {
  member?: CrewMember;
  defaultSet?: CrewSet;
  busy: boolean;
  onSave: (patch: Record<string, unknown>) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const isCreate = !member;
  const [name, setName] = useState(member?.name || '');
  const [role, setRole] = useState(member?.role || '');
  const [model, setModel] = useState(member?.model || 'Grok');
  const [engine, setEngine] = useState<Exclude<EngineFamily, 'all'>>(member?.engine || 'grok');
  const [setGroup, setSetGroup] = useState<CrewSet>(member?.set || defaultSet);
  const [bio, setBio] = useState(member?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(member?.avatarUrl || '');
  const [status, setStatus] = useState<AgentStatus>(member?.status || 'active');
  const [statusNote, setStatusNote] = useState(member?.statusNote || '');
  const [usagePct, setUsagePct] = useState(member?.usagePct !== undefined ? String(member.usagePct) : '');
  const [resetNote, setResetNote] = useState(member?.resetNote || '');
  const [confirmRemove, setConfirmRemove] = useState(false);

  const previewAvatarSrc = resolveAvatarRenderUrl(avatarUrl);
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || '?';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 rounded-full border border-border bg-accent/15 text-accent font-mono text-xs font-bold flex items-center justify-center shrink-0 overflow-hidden">
          <span>{initials}</span>
          {previewAvatarSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewAvatarSrc}
              alt={name || 'Crew avatar'}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
        <div className="text-[11px] text-muted-foreground min-w-0">
          {member ? (
            <div className="font-mono">
              Agent ID: <span className="text-foreground">{member.agentId}</span>
            </div>
          ) : (
            <div>New crew profile card</div>
          )}
          <div className="truncate">Bots can update their own photo &amp; bio via /api/bots/crew.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Crew Name</label>
          <input
            className={INPUT_CLS}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Sovereign or Backup Grok 1"
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Role</label>
          <input
            className={INPUT_CLS}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g., LinkedIn drafts & research"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Bio / Tagline</label>
          <input
            className={INPUT_CLS}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="e.g., Clearance hawk. Zero unverified claims."
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Avatar Photo URL (HTTPS or Drive link)</label>
          <input
            className={INPUT_CLS}
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={LABEL_CLS}>Model Label</label>
          <input
            className={INPUT_CLS}
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g., Grok, Meta Muse, Gemini"
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Engine Family</label>
          <select
            className={INPUT_CLS}
            value={engine}
            onChange={(e) => setEngine(e.target.value as Exclude<EngineFamily, 'all'>)}
          >
            {ENGINE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Crew Set</label>
          <select
            className={INPUT_CLS}
            value={setGroup}
            onChange={(e) => setSetGroup(e.target.value as CrewSet)}
          >
            {CREW_SET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL_CLS}>Status</label>
        <select className={INPUT_CLS} value={status} onChange={(e) => setStatus(e.target.value as AgentStatus)}>
          {CREW_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={LABEL_CLS}>Status Note</label>
        <input
          className={INPUT_CLS}
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
          placeholder="e.g., Noon clearance done"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Usage % (Optional)</label>
          <input
            className={INPUT_CLS}
            type="number"
            min={0}
            max={100}
            value={usagePct}
            onChange={(e) => setUsagePct(e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Reset Note (Optional)</label>
          <input
            className={INPUT_CLS}
            value={resetNote}
            onChange={(e) => setResetNote(e.target.value)}
            placeholder="e.g., Resets Thu 11 PM ET"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
        {!isCreate && onDelete ? (
          confirmRemove ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm Remove
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmRemove(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmRemove(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          )
        ) : (
          <span />
        )}

        <button
          type="button"
          disabled={busy || !name.trim()}
          onClick={() =>
            onSave({
              name: name.trim(),
              role: role.trim(),
              bio: bio.trim(),
              avatarUrl: avatarUrl.trim(),
              model: model.trim(),
              engine,
              set: setGroup,
              status,
              statusNote,
              usagePct: usagePct !== '' ? Number(usagePct) : null,
              resetNote,
            })
          }
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isCreate ? 'Add Crew Member' : 'Save Crew Changes'}
        </button>
      </div>
    </div>
  );
}

function DeskPasteForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (raw: string, defaultLane?: PipelineLane) => Promise<void>;
}) {
  const [raw, setRaw] = useState('');
  const [defaultLane, setDefaultLane] = useState<PipelineLane>('fb-ig');

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Paste any numbered/bulleted list from Gemini, Grok, or another chat tab—or paste a YAML drop or Marley clearance block. Multi-item lists split automatically into cards queued for Marley clearance.
      </p>

      <div>
        <label className={LABEL_CLS}>Default Lane for Raw Lists</label>
        <select
          className={INPUT_CLS}
          value={defaultLane}
          onChange={(e) => setDefaultLane(e.target.value as PipelineLane)}
        >
          {LANE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={LABEL_CLS}>Paste List / Drop / Clearance</label>
        <textarea
          className={`${INPUT_CLS} min-h-[190px] font-mono text-xs`}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={`1. Story headline - https://example.com/news\n2. Second idea - https://example.com/release`}
        />
      </div>

      <div className="flex justify-end pt-2 border-t border-border">
        <button
          type="button"
          disabled={busy || !raw.trim()}
          onClick={() => onSubmit(raw, defaultLane)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Parse &amp; Land on Board
        </button>
      </div>
    </div>
  );
}
