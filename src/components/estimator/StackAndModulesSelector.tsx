// src/components/estimator/StackAndModulesSelector.tsx
'use client';

import {
  Lock,
  Check,
  Sparkles,
  Zap,
  Gauge,
  Layers,
} from 'lucide-react';
import {
  BASELINE_STACK,
  TECH_STACK_ADDONS,
  CAPABILITY_ADDONS,
  PROJECT_TRACKS,
  formatCurrency,
  type TrackId,
  type TechAddonId,
  type CapabilityAddonId,
  type DeliveryPace,
} from '@/lib/estimator-config';

interface StackAndModulesSelectorProps {
  selectedTrackId: TrackId;
  selectedTech: TechAddonId[];
  selectedCapabilities: CapabilityAddonId[];
  pace: DeliveryPace;
  onToggleTech: (id: TechAddonId) => void;
  onToggleCapability: (id: CapabilityAddonId) => void;
  onChangePace: (pace: DeliveryPace) => void;
}

export default function StackAndModulesSelector({
  selectedTrackId,
  selectedTech,
  selectedCapabilities,
  pace,
  onToggleTech,
  onToggleCapability,
  onChangePace,
}: StackAndModulesSelectorProps) {
  const activeTrack =
    PROJECT_TRACKS.find((t) => t.id === selectedTrackId) ?? PROJECT_TRACKS[0];
  const includedSet = new Set(activeTrack.baselineIncludedIds ?? []);

  return (
    <div className="space-y-10">
      {/* Section 02: Tech Stack & Cloud/AI Matrix */}
      <section aria-labelledby="estimator-stack-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/25 font-mono text-[11px] font-bold uppercase tracking-widest text-accent">
              02 // STACK &amp; INFRASTRUCTURE
            </span>
            <h2
              id="estimator-stack-heading"
              className="text-xl sm:text-2xl font-black tracking-tight text-foreground"
            >
              Cloud &amp; Intelligence Matrix
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            MODERN EDGE STACK
          </span>
        </div>

        {/* Locked Baseline Core Stack */}
        <div className="stitch-card p-4 sm:p-5 rounded-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              NON-NEGOTIABLE CORE STACK (INCLUDED IN ALL BUILDS)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Lock className="w-3 h-3" aria-hidden="true" />
              LOCKED &amp; VERIFIED
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {BASELINE_STACK.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/80 border border-border font-mono text-xs font-semibold text-foreground"
              >
                <Check
                  className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                  aria-hidden="true"
                />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Toggleable Cloud & AI Add-on Modules */}
        <div className="grid sm:grid-cols-2 gap-3.5">
          {TECH_STACK_ADDONS.map((addon, idx) => {
            const isChecked = selectedTech.includes(addon.id);
            const isBaselineIncluded = includedSet.has(addon.id);
            const isFullSpan = idx === TECH_STACK_ADDONS.length - 1;

            return (
              <button
                key={addon.id}
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => onToggleTech(addon.id)}
                className={`group text-left p-4 sm:p-5 rounded-lg transition-all flex items-start gap-3.5 cursor-pointer ${
                  isFullSpan ? 'sm:col-span-2' : ''
                } ${
                  isChecked
                    ? 'bg-card border-2 border-accent shadow-md shadow-accent/10 dark:shadow-[0_0_18px_rgba(0,242,254,0.1)]'
                    : 'stitch-card hover:border-accent/50'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-accent border-accent text-accent-foreground'
                      : 'bg-muted/60 border-border group-hover:border-accent'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-foreground">
                        {addon.name}
                      </span>
                      {addon.aiFocused && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent/15 border border-accent/30 font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                          <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                          AI STUDIO
                        </span>
                      )}
                      {isBaselineIncluded && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          Core Included · Expand Scope
                        </span>
                      )}
                    </div>

                    <span
                      className={`font-mono text-xs sm:text-sm font-extrabold whitespace-nowrap ${
                        isChecked
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-foreground/90'
                      }`}
                    >
                      +{formatCurrency(addon.minPrice)}–{formatCurrency(addon.maxPrice)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {addon.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 03: Delivery Pace & Capability Add-Ons */}
      <section aria-labelledby="estimator-capabilities-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/25 font-mono text-[11px] font-bold uppercase tracking-widest text-accent">
              03 // PACE &amp; CAPABILITIES
            </span>
            <h2
              id="estimator-capabilities-heading"
              className="text-xl sm:text-2xl font-black tracking-tight text-foreground"
            >
              Delivery Cadence &amp; Workflow Add-Ons
            </h2>
          </div>
        </div>

        {/* Delivery Pace Segmented Control */}
        <div className="stitch-card p-4 sm:p-5 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-accent" aria-hidden="true" />
              <span className="font-bold text-sm sm:text-base text-foreground">
                Engineering Delivery Pace
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Select standard milestone sprints or an expedited build schedule.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Delivery pace options"
            className="grid sm:grid-cols-2 gap-2.5 lg:min-w-[420px]"
          >
            <button
              type="button"
              role="radio"
              aria-checked={pace === 'standard'}
              onClick={() => onChangePace('standard')}
              className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                pace === 'standard'
                  ? 'bg-accent/10 border-accent text-foreground shadow-sm'
                  : 'bg-muted/40 border-border text-muted-foreground hover:border-accent/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs sm:text-sm text-foreground">
                  Standard Pace
                </span>
                <span className="font-mono text-[11px] font-bold text-muted-foreground">
                  1.0x
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Weekly staging milestones &amp; async demos
              </p>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={pace === 'accelerated'}
              onClick={() => onChangePace('accelerated')}
              className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                pace === 'accelerated'
                  ? 'bg-accent/10 border-accent text-foreground shadow-sm'
                  : 'bg-muted/40 border-border text-muted-foreground hover:border-accent/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 font-bold text-xs sm:text-sm text-foreground">
                  <Zap className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                  Accelerated Sprint
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-extrabold">
                  +16.5%
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                Priority sprint allocation · ~28% faster
              </p>
            </button>
          </div>
        </div>

        {/* 7 Workflow & Capability Add-On Cards */}
        <div className="grid sm:grid-cols-2 gap-3.5">
          {CAPABILITY_ADDONS.map((cap) => {
            const isChecked = selectedCapabilities.includes(cap.id);
            const isBaselineIncluded = includedSet.has(cap.id);

            return (
              <button
                key={cap.id}
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => onToggleCapability(cap.id)}
                className={`group text-left p-4 rounded-lg transition-all flex items-start gap-3 cursor-pointer ${
                  isChecked
                    ? 'bg-card border-2 border-accent shadow-md shadow-accent/10 dark:shadow-[0_0_18px_rgba(0,242,254,0.1)]'
                    : 'stitch-card hover:border-accent/50'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-accent border-accent text-accent-foreground'
                      : 'bg-muted/60 border-border group-hover:border-accent'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="block font-bold text-xs sm:text-sm text-foreground leading-snug">
                        {cap.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {cap.aiFocused && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/15 border border-accent/30 font-mono text-[9px] font-bold uppercase tracking-wider text-accent">
                            AI MODULE
                          </span>
                        )}
                        {isBaselineIncluded && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Baseline in {activeTrack.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`block font-mono text-xs font-extrabold ${
                          isChecked
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-foreground'
                        }`}
                      >
                        +{formatCurrency(cap.minPrice)}–{formatCurrency(cap.maxPrice)}
                      </span>
                      <span className="block font-mono text-[10px] text-muted-foreground">
                        +{cap.weeksImpact} {cap.weeksImpact === 1 ? 'wk' : 'wks'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
