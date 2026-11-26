'use client';

import { useEffect, useState } from 'react';
import { Copy, Play, Sparkles } from 'lucide-react';
import type { AiModelOption, AiProviderId } from '@/lib/ops/ai-desk';
import type { ClientWorkspace, PipelineLane } from '@/lib/ops/types';

export default function OpsDeskPanel({
  activeClient,
  authorizedFetch,
  onToast,
  onCardSaved,
}: {
  activeClient: ClientWorkspace | null;
  authorizedFetch: (url: string, init?: RequestInit) => Promise<unknown>;
  onToast: (msg: string) => void;
  onCardSaved: () => Promise<void>;
}) {
  const clientId = activeClient?.id || 'rottym';
  const [models, setModels] = useState<AiModelOption[]>([]);

  const [provider, setProvider] = useState<AiProviderId>('gemini');
  const [lane, setLane] = useState<PipelineLane>('fb-ig');
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [saveToBoard, setSaveToBoard] = useState(true);

  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [modelUsed, setModelUsed] = useState('');

  useEffect(() => {
    let cancelled = false;
    authorizedFetch(`/api/ops/desk?clientId=${encodeURIComponent(clientId)}`)
      .then((raw) => {
        if (cancelled) return;
        const data = raw as { models: AiModelOption[] };
        setModels(data.models || []);
        const firstConfigured = (data.models || []).find((m) => m.configured);
        if (firstConfigured) setProvider(firstConfigured.id);
      })
      .catch(() => {
        // handled gracefully in UI
      });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, clientId]);

  const selectedModel = models.find((m) => m.id === provider);

  const copyBoundaryPrompt = async () => {
    const full = [
      `BOUNDARIES (${lane}): Truth only (never invent numbers, quotes, dates, or URLs). Flag uncertainties [UNVERIFIED]. No engagement-bait. X = no politics/entertainment, defang scam domains. Output draft for Marley clearance + Rotty sign-off.`,
      sourceUrl ? `Source URL: ${sourceUrl}` : '',
      `Task:\n${prompt || '[Write request here]'}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    await navigator.clipboard.writeText(full);
    onToast('Copied boundary-wrapped prompt for web chat');
  };

  const runLive = async () => {
    setRunning(true);
    try {
      const res = (await authorizedFetch('/api/ops/desk', {
        method: 'POST',
        body: JSON.stringify({
          clientId,
          provider,
          lane,
          title,
          sourceUrl,
          prompt,
          saveToBoard,
        }),
      })) as { output: string; modelUsed: string; savedCard?: { title: string } | null };

      setOutput(res.output);
      setModelUsed(res.modelUsed);
      if (res.savedCard) {
        await onCardSaved();
        onToast(`Generated with ${res.modelUsed} and queued for Marley clearance`);
      } else {
        onToast(`Generated with ${res.modelUsed}`);
      }
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Desk run failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="max-w-[1200px] mx-auto px-3 sm:px-5 pt-5 space-y-5">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-sm font-medium text-foreground">
              AI Desk — Multi-Model Post Drafting ({activeClient?.name})
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Switch between connected AI models to draft posts within your truth and channel boundaries, then land them on the board for Marley clearance.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {models.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setProvider(m.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                  provider === m.id
                    ? 'border-accent bg-accent/15 text-foreground'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {m.id} · {m.configured ? 'API Ready' : 'Web Paste'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase text-muted-foreground mb-1">
              Model Account
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as AiProviderId)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} — {m.defaultModel} ({m.configured ? 'Connected' : `Needs ${m.envVar}`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-muted-foreground mb-1">
              Target Lane
            </label>
            <select
              value={lane}
              onChange={(e) => setLane(e.target.value as PipelineLane)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground"
            >
              <option value="fb-ig">FB / IG (Marley point)</option>
              <option value="linkedin">LinkedIn</option>
              <option value="x">X (@CausingPanic1)</option>
              <option value="article">Articles</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder="Optional Card Title (if landing on board)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground"
          />
          <input
            placeholder="Verified Source URL (https://...)"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground"
          />
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste raw notes, story links, or draft instructions here..."
          className="w-full min-h-[140px] p-3 rounded-lg text-xs font-mono bg-background border border-border text-foreground"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={saveToBoard}
              onChange={(e) => setSaveToBoard(e.target.checked)}
            />
            <span>Land draft on board in Pulled for Marley clearance</span>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyBoundaryPrompt}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border bg-background hover:border-accent"
            >
              <Copy className="w-3.5 h-3.5 text-accent" />
              Copy Prompt w/ Boundaries
            </button>

            <button
              type="button"
              disabled={running || !prompt.trim() || !selectedModel?.configured}
              onClick={runLive}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              {running
                ? 'Running...'
                : selectedModel?.configured
                  ? `Run ${selectedModel.id}`
                  : `Add ${selectedModel?.envVar || 'API key'} to run`}
            </button>
          </div>
        </div>
      </div>

      {output && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Output — {modelUsed}
            </span>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(output);
                onToast('Copied output to clipboard');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] border border-border hover:border-accent"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-xs font-sans text-foreground/90 bg-background border border-border rounded-lg p-3">
            {output}
          </pre>
        </div>
      )}
    </main>
  );
}
