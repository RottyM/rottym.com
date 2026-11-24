// src/app/estimate/page.tsx
import EnterpriseTrustBar from '@/components/EnterpriseTrustBar';
import ScopeEstimatorStudio from '@/components/estimator/ScopeEstimatorStudio';

export default function EstimatePage() {
  return (
    <div className="relative min-h-screen pt-8 sm:pt-12 pb-24 overflow-hidden">
      {/* Architectural Radial Dot-Grid Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-dot-grid opacity-65 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)] pointer-events-none -z-10"
      />

      {/* Ambient Studio Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[780px] h-[460px] bg-gradient-to-tr from-accent/10 via-sky-500/5 to-transparent dark:from-accent/15 dark:via-emerald-500/10 dark:to-transparent blur-[130px] rounded-full -z-10"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-14 relative z-10">
        {/* AI Studio Telemetry Hero */}
        <header className="space-y-5 max-w-4xl">
          <div className="inline-flex flex-wrap items-center gap-2 glass px-3 sm:px-4 py-1.5 rounded-lg shadow-sm backdrop-blur-md border border-border">
            <span
              className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] sm:text-xs text-accent tracking-widest uppercase font-bold">
              {'// ROTTYM AI STUDIO · LIVE ARCHITECTURAL TELEMETRY'}
            </span>
            <span className="text-border hidden sm:inline" aria-hidden="true">
              |
            </span>
            <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold hidden sm:inline">
              RESTON, VA · 100% CODE OWNERSHIP
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
            Interactive Scope Estimator &amp;{' '}
            <span className="tech-gradient-text">AI Solutions Architect</span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground font-medium max-w-3xl leading-relaxed">
            <strong className="text-foreground font-semibold">
              AI can generate a website. It can&apos;t run your business.
            </strong>{' '}
            Configure your fixed-scope Next.js, portal, or AI workflow architecture below—then hand your live spec directly to our grounded AI Solutions Architect.
          </p>
        </header>

        {/* Enterprise Engineering Pedigree Strip */}
        <EnterpriseTrustBar />

        {/* Interactive Estimator + Grounded AI Console */}
        <ScopeEstimatorStudio />
      </div>
    </div>
  );
}
