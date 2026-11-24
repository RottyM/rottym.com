// src/components/estimator/ScopeSummaryLedger.tsx
'use client';

import {
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Terminal,
  CalendarCheck,
  RotateCcw,
  Zap,
} from 'lucide-react';
import {
  formatCurrency,
  type CalculatedEstimate,
} from '@/lib/estimator-config';

interface ScopeSummaryLedgerProps {
  estimate: CalculatedEstimate;
  isAnalyzing: boolean;
  onAnalyzeWithAI: () => void;
  onStageDiscovery: () => void;
  onBookCall: () => void;
  onReset: () => void;
}

export default function ScopeSummaryLedger({
  estimate,
  isAnalyzing,
  onAnalyzeWithAI,
  onStageDiscovery,
  onBookCall,
  onReset,
}: ScopeSummaryLedgerProps) {
  const {
    track,
    selectedTech,
    selectedCapabilities,
    pace,
    formattedPriceRange,
    formattedTimeline,
    pacePremiumRange,
  } = estimate;

  return (
    <aside
      aria-label="Live architectural scope ledger"
      className="lg:sticky lg:top-24 space-y-4"
    >
      <div className="relative rounded-lg bg-card border border-accent/40 dark:border-accent/35 shadow-xl shadow-slate-900/5 dark:shadow-[0_16px_48px_rgba(0,0,0,0.65)] overflow-hidden">
        {/* Top calibrated laser glow */}
        <div
          aria-hidden="true"
          className="h-1 w-full bg-gradient-to-r from-accent via-sky-400 to-emerald-400"
        />

        <div className="p-5 sm:p-6 space-y-5">
          {/* Telemetry Status Ribbon */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                aria-hidden="true"
              />
              <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-foreground">
                {'// LIVE ESTIMATE LEDGER'}
              </span>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors cursor-pointer"
              title="Reset to default AI Studio configuration"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              Reset
            </button>
          </div>

          {/* Primary Tabular Price & Timeline Readout */}
          <div
            aria-live="polite"
            className="p-4 rounded-lg bg-muted/60 dark:bg-background/80 border border-border space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                PROJECTED INVESTMENT
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                FIXED-SCOPE RANGE
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-black tracking-tight text-foreground tabular-nums">
              {formattedPriceRange}
            </p>

            <div className="pt-2 border-t border-border/70 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground font-medium">
                <Clock className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                Target Completion:
              </span>
              <span className="font-mono font-bold text-foreground">
                {formattedTimeline}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>100% CODE OWNERSHIP · ZERO VENDOR LOCK-IN</span>
            </div>
          </div>

          {/* Active Specification Breakdown */}
          <div className="space-y-2.5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              ACTIVE SPECIFICATION BREAKDOWN
            </p>

            <ul className="space-y-2 text-xs">
              <li className="flex items-start justify-between gap-2 py-1 border-b border-border/50">
                <span className="font-bold text-foreground">
                  • {track.name}
                </span>
                <span className="font-mono text-muted-foreground whitespace-nowrap">
                  {formatCurrency(track.minPrice)}–{formatCurrency(track.maxPrice)}
                  {track.openEndedMax ? '+' : ''}
                </span>
              </li>

              {selectedTech.map((t) => (
                <li
                  key={t.id}
                  className="flex items-start justify-between gap-2 text-foreground/90"
                >
                  <span className="truncate">↳ {t.shortLabel}</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                    +{formatCurrency(t.minPrice)}–{formatCurrency(t.maxPrice)}
                  </span>
                </li>
              ))}

              {selectedCapabilities.map((c) => (
                <li
                  key={c.id}
                  className="flex items-start justify-between gap-2 text-foreground/90"
                >
                  <span className="truncate">↳ {c.shortLabel}</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                    +{formatCurrency(c.minPrice)}–{formatCurrency(c.maxPrice)}
                  </span>
                </li>
              ))}

              {pace === 'accelerated' && pacePremiumRange && (
                <li className="flex items-center justify-between gap-2 pt-1 text-accent font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <Zap className="w-3 h-3" aria-hidden="true" />
                    Accelerated Sprint (+16.5%)
                  </span>
                  <span className="font-mono whitespace-nowrap">
                    +{formatCurrency(pacePremiumRange.min)}–{formatCurrency(pacePremiumRange.max)}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Architectural Spec Tags */}
          <div className="pt-2 border-t border-border/70 space-y-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              ARCHITECTURAL SPECS INCLUDED
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-muted border border-border font-mono text-[10px] font-semibold text-foreground">
                Next.js 16
              </span>
              <span className="px-2 py-0.5 rounded bg-muted border border-border font-mono text-[10px] font-semibold text-foreground">
                TypeScript 5
              </span>
              {(selectedTech.some((t) => t.aiFocused) ||
                selectedCapabilities.some((c) => c.aiFocused) ||
                track.id === 'fullstack-ai') && (
                <span className="px-2 py-0.5 rounded bg-accent/15 border border-accent/30 font-mono text-[10px] font-bold text-accent">
                  Grounded AI
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                Git Repo Handoff
              </span>
            </div>
          </div>

          {/* Primary & Secondary Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={onAnalyzeWithAI}
              disabled={isAnalyzing}
              className="group w-full inline-flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] px-5 py-3.5 rounded-lg font-bold font-mono text-xs sm:text-sm uppercase tracking-wider hover:scale-[1.01] transition-all shadow-md shadow-black/10 dark:shadow-accent/25 border border-[#090D16] dark:border-transparent cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 text-[#00D8F6] dark:text-current shrink-0" aria-hidden="true" />
              <span>
                {isAnalyzing ? 'Synthesizing Scope...' : 'Analyze Scope with AI'}
              </span>
              <ArrowRight className="w-4 h-4 text-[#00D8F6] dark:text-current group-hover:translate-x-0.5 transition-transform shrink-0" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onStageDiscovery}
              className="w-full inline-flex items-center justify-center gap-2 bg-muted/70 hover:bg-muted text-foreground border border-border hover:border-accent px-4 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
              <span>Stage Discovery Request</span>
            </button>

            <button
              type="button"
              onClick={onBookCall}
              className="w-full inline-flex items-center justify-center gap-2 text-xs font-mono font-bold text-accent hover:underline py-1.5 cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Book 30-Min Call (Prefill Inquiry)</span>
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed border-t border-border/60 pt-3">
            Directly architected by <strong className="text-foreground">Rottman M. Mendez</strong> in Reston, VA. Exact fixed price locked after a 30-minute call.
          </p>
        </div>
      </div>
    </aside>
  );
}
