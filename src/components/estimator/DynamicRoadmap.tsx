// src/components/estimator/DynamicRoadmap.tsx
'use client';

import { CheckCircle2 } from 'lucide-react';
import type { RoadmapPhase } from '@/lib/estimator-config';

interface DynamicRoadmapProps {
  phases: RoadmapPhase[];
}

export default function DynamicRoadmap({ phases }: DynamicRoadmapProps) {
  return (
    <section aria-labelledby="estimator-roadmap-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/25 font-mono text-[11px] font-bold uppercase tracking-widest text-accent">
            04 // EXECUTION PROTOCOL
          </span>
          <h2
            id="estimator-roadmap-heading"
            className="text-xl sm:text-2xl font-black tracking-tight text-foreground"
          >
            Dynamic 4-Phase Delivery Roadmap
          </h2>
        </div>
        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
          ZERO-DRIFT COMMITMENTS
        </span>
      </div>

      <div className="stitch-card p-5 sm:p-6 rounded-lg">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {phases.map((phase, idx) => {
            const isHighlight = idx === 0 || idx === phases.length - 1;
            return (
              <div
                key={phase.step}
                className="relative flex flex-col justify-between p-4 rounded-lg bg-muted/40 dark:bg-background/60 border border-border/80 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-mono text-xs font-black ${
                        idx === phases.length - 1
                          ? 'bg-emerald-500 text-slate-950'
                          : isHighlight
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-card border border-border text-foreground'
                      }`}
                    >
                      {phase.step}
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
                      {phase.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-foreground">
                      {phase.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {phase.description}
                    </p>
                  </div>

                  <ul className="space-y-1.5 pt-1">
                    {phase.deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-1.5 text-[11px] text-foreground/85 leading-snug"
                      >
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2.5 border-t border-border/60 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    CADENCE
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    {phase.durationLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
