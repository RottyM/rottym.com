// src/components/estimator/TrackSelector.tsx
'use client';

import {
  Rocket,
  CalendarCheck,
  RefreshCw,
  Cpu,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  PROJECT_TRACKS,
  formatCurrency,
  type TrackId,
} from '@/lib/estimator-config';

interface TrackSelectorProps {
  selectedTrackId: TrackId;
  onSelectTrack: (trackId: TrackId) => void;
}

const TRACK_ICONS: Record<TrackId, React.ReactNode> = {
  'local-launchpad': <Rocket className="w-5 h-5" aria-hidden="true" />,
  'booking-intake': <CalendarCheck className="w-5 h-5" aria-hidden="true" />,
  'wordpress-escape': <RefreshCw className="w-5 h-5" aria-hidden="true" />,
  'fullstack-ai': <Cpu className="w-5 h-5" aria-hidden="true" />,
};

export default function TrackSelector({
  selectedTrackId,
  onSelectTrack,
}: TrackSelectorProps) {
  return (
    <section aria-labelledby="estimator-track-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/25 font-mono text-[11px] font-bold uppercase tracking-widest text-accent">
            01 // FOUNDATIONAL TRACK
          </span>
          <h2
            id="estimator-track-heading"
            className="text-xl sm:text-2xl font-black tracking-tight text-foreground"
          >
            Select Core Architectural Scope
          </h2>
        </div>
        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
          SINGLE-SELECTION ENGINE
        </span>
      </div>

      <div
        role="radiogroup"
        aria-labelledby="estimator-track-heading"
        className="grid sm:grid-cols-2 gap-4"
      >
        {PROJECT_TRACKS.map((track) => {
          const isSelected = track.id === selectedTrackId;
          return (
            <button
              key={track.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectTrack(track.id)}
              className={`group relative text-left p-5 sm:p-6 rounded-lg transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                isSelected
                  ? 'bg-card border-2 border-accent shadow-lg shadow-accent/10 dark:shadow-[0_0_24px_rgba(0,242,254,0.12)]'
                  : 'stitch-card hover:border-accent/50'
              }`}
            >
              {/* Top laser hairline when selected */}
              {isSelected && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent via-sky-400 to-emerald-400"
                />
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted text-muted-foreground group-hover:text-accent'
                      }`}
                    >
                      {TRACK_ICONS[track.id]}
                    </span>
                    <div>
                      <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {track.code}
                      </span>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                            aria-hidden="true"
                          />
                          SELECTED ARCHITECTURE
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">
                          {track.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Calibrated Radio Indicator */}
                  <span
                    aria-hidden="true"
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-accent bg-accent/15'
                        : 'border-border group-hover:border-accent/60'
                    }`}
                  >
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                    )}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                    {track.name}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {track.summary}
                  </p>
                </div>

                <ul className="space-y-1.5 pt-1">
                  {track.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-foreground/85"
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          isSelected
                            ? 'text-accent'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                <span
                  className={`font-mono text-sm sm:text-base font-extrabold tracking-tight ${
                    isSelected ? 'text-accent' : 'text-foreground'
                  }`}
                >
                  {formatCurrency(track.minPrice)} – {formatCurrency(track.maxPrice)}
                  {track.openEndedMax ? '+' : ''}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-muted-foreground bg-muted/70 px-2.5 py-1 rounded-lg border border-border/60">
                  <Clock className="w-3 h-3 text-accent" aria-hidden="true" />
                  {track.minWeeks}–{track.maxWeeks} wks
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
