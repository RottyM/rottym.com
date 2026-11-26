'use client';

import { useEffect, useState } from 'react';
import { X, Check, Trash2, Send, Sparkles, ExternalLink, AlertTriangle } from 'lucide-react';
import type {
  AgentStatus,
  CrewMember,
  PipelineCard,
  PipelineLane,
  PipelineStage,
} from '@/lib/ops/types';

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
  { value: 'approved', label: 'Ready for Rotty' },
  { value: 'posted', label: 'Posted' },
];

const CREW_STATUS_OPTIONS: Array<{ value: AgentStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'stand_down', label: 'Stand-down' },
  { value: 'on_hold', label: 'Hold' },
  { value: 'on_call', label: 'On Call' },
  { value: 'out', label: 'Out' },
];

export type OpsModalState =
  | { type: 'closed' }
  | { type: 'card'; card: PipelineCard }
  | { type: 'crew'; member: CrewMember }
  | { type: 'desk_paste' };

export function OpsModalHost({
  state,
  busy,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onUpdateCrew,
  onDeskPaste,
}: {
  state: OpsModalState;
  busy: boolean;
  onClose: () => void;
  onUpdateCard: (id: string, patch: Record<string, unknown>) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
  onUpdateCrew: (agentId: string, patch: Record<string, unknown>) => Promise<void>;
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

        <div className="p-4 sm:p-5 max-h-[82vh] overflow-y-auto">
          {state.type === 'card' && (
            <CardEditorForm
              key={state.card.id}
              card={state.card}
              busy={busy}
              onSave={(patch) => onUpdateCard(state.card.id, patch)}
              onDelete={() => onDeleteCard(state.card.id)}
            />
          )}
          {state.type === 'crew' && (
            <CrewEditorForm
              key={state.member.id}
              member={state.member}
              busy={busy}
              onSave={(patch) => onUpdateCrew(state.member.agentId, patch)}
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
  busy,
  onSave,
  onDelete,
}: {
  card: PipelineCard;
  busy: boolean;
  onSave: (patch: Record<string, unknown>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [title, setTitle] = useState(card.title);
  const [lane, setLane] = useState<PipelineLane>(card.lane);
  const [stage, setStage] = useState<PipelineStage>(card.stage);
  const [source, setSource] = useState(card.source);
  const [sourceUrl, setSourceUrl] = useState(card.sourceUrl || '');
  const [note, setNote] = useState(card.note || '');
  const [draftCopy, setDraftCopy] = useState(card.draftCopy || '');
  const [fbLink, setFbLink] = useState(card.links?.fb || '');
  const [igLink, setIgLink] = useState(card.links?.ig || '');
  const [liLink, setLiLink] = useState(card.links?.linkedin || '');
  const [xLink, setXLink] = useState(card.links?.x || '');

  const buildPayload = (overrideStage?: PipelineStage, overrideReady?: boolean) => ({
    title,
    lane,
    stage: overrideStage ?? stage,
    readyForRotty: overrideReady,
    source,
    sourceUrl,
    note,
    draftCopy,
    links: { fb: fbLink, ig: igLink, linkedin: liLink, x: xLink },
  });

  return (
    <div className="space-y-4">
      {(card.discrepancies?.length || card.artifactsNeeded?.length || card.flaggedNotes?.length) ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs space-y-1">
          <div className="font-semibold text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Flags &amp; Requirements
          </div>
          {card.discrepancies?.map((d, i) => (
            <p key={`d-${i}`} className="text-foreground/90">• Discrepancy: {d}</p>
          ))}
          {card.artifactsNeeded?.map((a, i) => (
            <p key={`a-${i}`} className="text-foreground/90">• Artifact needed: {a}</p>
          ))}
          {card.flaggedNotes?.map((f, i) => (
            <p key={`f-${i}`} className="text-foreground/90">• {f}</p>
          ))}
        </div>
      ) : null}

      <div>
        <label className={LABEL_CLS}>Title</label>
        <input className={INPUT_CLS} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
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
          <input className={INPUT_CLS} value={fbLink} onChange={(e) => setFbLink(e.target.value)} placeholder="https://facebook.com/..." />
        </div>
        <div>
          <label className={LABEL_CLS}>Instagram URL</label>
          <input className={INPUT_CLS} value={igLink} onChange={(e) => setIgLink(e.target.value)} placeholder="https://instagram.com/..." />
        </div>
        <div>
          <label className={LABEL_CLS}>LinkedIn URL</label>
          <input className={INPUT_CLS} value={liLink} onChange={(e) => setLiLink(e.target.value)} placeholder="https://linkedin.com/..." />
        </div>
        <div>
          <label className={LABEL_CLS}>X URL</label>
          <input className={INPUT_CLS} value={xLink} onChange={(e) => setXLink(e.target.value)} placeholder="https://x.com/..." />
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
          <button
            type="button"
            disabled={busy}
            onClick={() => onSave(buildPayload('approved', true))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            Queue Ready for Rotty
          </button>
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

function CrewEditorForm({
  member,
  busy,
  onSave,
}: {
  member: CrewMember;
  busy: boolean;
  onSave: (patch: Record<string, unknown>) => Promise<void>;
}) {
  const [status, setStatus] = useState<AgentStatus>(member.status);
  const [statusNote, setStatusNote] = useState(member.statusNote || '');
  const [usagePct, setUsagePct] = useState(member.usagePct !== undefined ? String(member.usagePct) : '');
  const [resetNote, setResetNote] = useState(member.resetNote || '');

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        {member.role} · Engine: <span className="font-mono text-foreground">{member.model}</span> ({member.set} set)
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

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            onSave({
              status,
              statusNote,
              usagePct: usagePct !== '' ? Number(usagePct) : undefined,
              resetNote,
            })
          }
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          Update Crew Status
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
