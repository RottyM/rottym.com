// src/app/about/page.tsx
import {
  ArrowRight,
  Compass,
  FileCheck2,
  LockOpen,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Workflow,
} from 'lucide-react';
import Link from 'next/link';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'About Rotty — Web Engineer in Reston, VA',
  description:
    "Meet Rottman 'Rotty' Mendez, a Reston, VA software engineer (ex-Disney Streaming, FEMA & FAA) building fast, fixed-price business websites you own 100%.",
  path: '/about',
});

const workPrinciples = [
  {
    icon: <MessageSquare className="w-5 h-5 text-accent" />,
    title: 'Direct with the person building it',
    desc: 'No account managers or handoffs to junior contractors. When you call or email, you talk straight to me.',
  },
  {
    icon: <FileCheck2 className="w-5 h-5 text-accent" />,
    title: 'Fixed price before any work starts',
    desc: 'Every project starts with a free 30-minute call and turns into a written scope, fixed quote, and clear timeline.',
  },
  {
    icon: <LockOpen className="w-5 h-5 text-accent" />,
    title: 'You own 100% of everything',
    desc: 'Your domain, hosting accounts, content, and code live in your name from day one. No retainers required just to stay online.',
  },
];

const processSteps = [
  {
    step: '01',
    label: '30 min · Free',
    title: 'Quick Conversation',
    desc: 'We talk through what your business needs, what is slowing down your current site, and what would save you time.',
  },
  {
    step: '02',
    label: 'Fixed Scope',
    title: 'Written Plan & Price',
    desc: 'You get a clear price, timeline, and feature list in plain English before making any commitment.',
  },
  {
    step: '03',
    label: 'Weekly Check-Ins',
    title: 'Built Around Your Workflow',
    desc: 'I design and build your site with live preview links along the way so bookings, forms, and messaging feel right.',
  },
  {
    step: '04',
    label: 'Full Handoff',
    title: 'Launch & Ownership',
    desc: 'We launch cleanly, test every form and mobile view, and hand over full control of your site and accounts.',
  },
];

export default function About() {
  return (
    <section className="relative pt-10 pb-24 min-h-screen overflow-hidden">
      {/* Background Dot-Grid Texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

      {/* Atmospheric Radial Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-accent/10 via-sky-500/5 to-transparent dark:from-accent/15 dark:via-emerald-500/10 dark:to-transparent blur-[130px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-1/2 -right-32 w-[420px] h-[420px] bg-accent/5 rounded-full blur-[110px] -z-10" />

      <div className="max-w-5xl mx-auto px-6 space-y-16 relative z-10">
        {/* Owner-Friendly Intro Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 glass px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-sm backdrop-blur-md border border-border max-w-full">
            <UserCheck className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">
              ABOUT ROTTY
            </span>
            <span className="text-border" aria-hidden="true">|</span>
            <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap">
              RESTON, VA
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
            Modern websites built with{' '}
            <span className="tech-gradient-text">engineering discipline.</span>
          </h1>
        </div>

        {/* Bio & Identity Card */}
        <div className="stitch-card p-6 sm:p-10 rounded-lg relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent">
          <div className="grid md:grid-cols-[240px_1fr] gap-8 items-center">
            {/* Clean Portrait Placeholder / Identity Tile */}
            <div className="rounded-lg border border-slate-200/90 dark:border-border/80 bg-slate-50/90 dark:bg-muted/40 p-6 flex flex-col items-center text-center space-y-3">
              <div className="w-24 h-24 rounded-lg bg-[#090D16] dark:bg-accent/15 border border-slate-800 dark:border-accent/30 flex items-center justify-center shadow-md">
                <span className="font-mono text-3xl font-black tracking-tight text-[#00D8F6] dark:text-accent">
                  RM
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-foreground">
                  Rottman &ldquo;Rotty&rdquo; Mendez
                </p>
                <p className="text-xs font-mono uppercase tracking-wider text-accent font-bold">
                  Founder &amp; Builder
                </p>
                <p className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground pt-1">
                  <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Reston, Virginia</span>
                </p>
              </div>
            </div>

            {/* Plain-English Bio */}
            <div className="space-y-4">
              <p className="text-base sm:text-lg text-foreground font-semibold leading-relaxed">
                Hi, I&apos;m Rotty, a software engineer in Reston, VA. I spent years building systems for Disney Streaming, FEMA, and the FAA — the kind of software that can&apos;t go down.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
                Now I build modern websites with real workflows for Northern Virginia businesses: bookings that land on your calendar, quote forms that reach you, client intake that saves you the back-and-forth. Fixed price, and you own all of it.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] dark:hover:text-accent-foreground px-5 py-2.5 rounded-lg font-bold font-mono text-xs sm:text-sm transition-all shadow-md"
                >
                  <span>Book a free 30-minute call</span>
                  <ArrowRight className="w-4 h-4 text-[#00D8F6] dark:text-current" />
                </Link>
                <a
                  href="tel:+12028540954"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-border bg-white hover:bg-slate-50 dark:bg-card dark:hover:bg-muted text-slate-900 dark:text-foreground font-mono font-bold text-xs sm:text-sm transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-accent" />
                  <span>(202) 854-0954</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Core Working Principles */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              What working together feels like
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Straight answers, predictable scope, and zero agency overhead.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {workPrinciples.map((item) => (
              <div
                key={item.title}
                className="stitch-card p-6 rounded-lg space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-lg font-black text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Laser Divider */}
        <div className="laser-divider" />

        {/* How I Work Steps */}
        <div className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-lg border border-border">
              <Workflow className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider uppercase font-bold">
                HOW I WORK
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
              From first call to live site
            </h2>
          </div>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {processSteps.map((p) => (
              <li
                key={p.step}
                className="p-6 rounded-lg border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card/90 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xl font-black font-mono text-accent">
                    <span className="sr-only">Step </span>
                    {p.step}
                    <span className="sr-only">, </span>
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-muted-foreground bg-slate-100 dark:bg-muted/60 px-2.5 py-1 rounded-lg">
                    {p.label}
                  </p>
                </div>
                <h3 className="text-lg font-black text-foreground">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Bottom CTA */}
        <div className="py-10 sm:py-14 px-6 sm:px-10 bg-[#090D16] text-white dark:bg-accent dark:text-accent-foreground rounded-lg overflow-hidden relative shadow-2xl border border-slate-800 dark:border-transparent text-center space-y-5">
          <div className="absolute inset-0 bg-dot-grid opacity-15 pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 dark:bg-black/20 border border-white/20 dark:border-black/20 text-xs font-mono font-bold uppercase tracking-wider text-[#00D8F6] dark:text-accent-foreground">
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>RESTON &amp; NORTHERN VIRGINIA</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Let&apos;s see what a better site could do for your business.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 dark:text-inherit opacity-90 font-medium">
              Book a free 30-minute call — no hard pitch, just straight answers on scope, timeline, and fixed pricing.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[#00D8F6] hover:bg-[#00F2FE] text-[#090D16] dark:bg-accent-foreground dark:text-accent dark:hover:bg-[#151D2F] dark:hover:text-accent px-6 py-3 rounded-lg font-bold font-mono text-xs sm:text-sm transition-transform hover:scale-[1.02] shadow-lg w-full sm:w-auto"
              >
                <span>Book a free 30-minute call</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/packages"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 dark:bg-accent/20 dark:hover:bg-accent/30 dark:text-accent-foreground dark:border-accent-foreground/30 px-6 py-3 rounded-lg font-bold font-mono text-xs sm:text-sm transition-colors w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>See Packages &amp; Pricing</span>
              </Link>
            </div>
            <div className="pt-4 border-t border-white/10 dark:border-black/15 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-300 dark:text-accent-foreground/80">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00D8F6] dark:text-accent-foreground" />
                Most builds $2,500–$6,500 fixed
              </span>
              <Link href="/resume" className="underline underline-offset-4 hover:text-[#00D8F6] dark:hover:text-accent-foreground transition-colors">
                Technical team or recruiter? View full engineering resume <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
