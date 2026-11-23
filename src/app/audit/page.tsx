'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Gauge, MousePointerClick, ListChecks, ShieldCheck, Globe, Mail } from 'lucide-react';
import CampaignHeader from '@/components/CampaignHeader';
import LeadFormStatus from '@/components/LeadFormStatus';
import { useLeadForm } from '@/hooks/useLeadForm';

const AUDIT_CARDS = [
  {
    index: '01',
    title: 'Real Speed & Mobile Check',
    tag: 'Vitals & FCP',
    description:
      'Throttled 4G mobile testing to pinpoint render-blocking scripts, oversized hero images, and layout shifts hurting your Google visibility.',
    footer: 'LCP, CLS, INP & payload breakdown',
    icon: Gauge,
  },
  {
    index: '02',
    title: 'Conversion Leak Scan',
    tag: 'Tap & Flow',
    description:
      'A real walkthrough of your mobile navigation, quote buttons, and forms to catch broken tap targets and confusing next steps.',
    footer: 'Mobile funnel & CTA friction check',
    icon: MousePointerClick,
  },
  {
    index: '03',
    title: 'Plain-English Fix List',
    tag: 'Action Plan',
    description:
      'No jargon or 40-page PDF. You get a prioritized checklist of what to fix first — whether you handle it in-house or ask me to quote it.',
    footer: '3-minute video + clear next steps',
    icon: ListChecks,
  },
];

const PRICING_ROWS = [
  {
    name: 'Launchpad',
    range: '$2,500–$3,500',
    note: '5–8 page fast modern site with quote forms & local SEO setup',
    href: '/packages#local-launchpad',
  },
  {
    name: 'Performance Rebuild',
    range: '$3,800–$6,500',
    note: 'Escape slow WordPress with a custom sub-second rebuild you own 100%',
    href: '/packages#performance-rebuild',
  },
  {
    name: 'Booking & Intake',
    range: '$4,200–$5,800',
    note: 'Online scheduling, automated confirmations & structured client intake',
    href: '/packages#booking-intake',
  },
];

export default function AuditPage() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [email, setEmail] = useState('');
  const { status, isSubmitting, isSuccess, submitLead } = useLeadForm({
    formId: 'audit_form',
    serviceLabel: 'Free 3-Minute Site Speed & Leak Audit (/audit)',
    gaCategory: 'audit_landing_page',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitLead({ email, websiteUrl });
    if (ok) {
      setWebsiteUrl('');
      setEmail('');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-full max-w-[720px] h-[480px] bg-gradient-to-tr from-accent/10 via-sky-500/5 to-transparent dark:from-accent/15 dark:via-emerald-500/10 dark:to-transparent blur-[130px] rounded-full -z-10" />

      <CampaignHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">
        {/* Hero + Inline 2-Field Form */}
        <section className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 glass px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-sm border border-border">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider uppercase font-bold">
                Free 3-Minute Video Audit
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-[1.12] tracking-tight">
              Find out why your website is{' '}
              <span className="tech-gradient-text">losing mobile visitors.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
              Send me your URL. I&apos;ll record a plain-English 3-minute breakdown showing what&apos;s slowing your site down, where visitors drop off, and how to fix it.
            </p>

            {/* Simulated 4G Telemetry Bar (Labels Only) */}
            <div className="stitch-card p-4 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                  Typical Mobile Bottleneck
                </span>
                <span className="font-mono text-[11px] font-bold text-red-600 dark:text-red-400">
                  Where Mobile Speed Leaks
                </span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden flex" aria-hidden="true">
                <div className="bg-emerald-500 h-full w-1/4" />
                <div className="bg-amber-400 h-full w-1/5" />
                <div className="bg-red-500 h-full w-[55%]" />
              </div>
              <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>Core Render</span>
                <span>Bloat Scripts</span>
                <span className="text-red-600 dark:text-red-400 font-semibold">Render-Blocking Assets</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <form
              onSubmit={handleSubmit}
              className="stitch-card p-5 sm:p-8 rounded-lg shadow-xl space-y-5 relative before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="audit-url"
                  className="block text-[11px] sm:text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground font-mono"
                >
                  Your Website URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="audit-url"
                    name="websiteUrl"
                    type="url"
                    required
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourbusiness.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-[#0B111E] border border-slate-500 dark:border-slate-500 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-slate-600 dark:placeholder:text-slate-400 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="audit-email"
                  className="block text-[11px] sm:text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground font-mono"
                >
                  Where should I send the audit?
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="audit-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourbusiness.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-[#0B111E] border border-slate-500 dark:border-slate-500 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-slate-600 dark:placeholder:text-slate-400 font-medium text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] py-3.5 px-6 rounded-lg font-bold font-mono text-xs sm:text-sm hover:scale-[1.01] transition-all shadow-md shadow-black/10 dark:shadow-accent/20 border border-[#090D16] dark:border-transparent disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Sending...' : 'Send My Free Audit'}</span>
                <ArrowRight className="w-4 h-4 text-[#00D8F6] dark:text-current group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium text-center">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <span>Delivered within 1 business day. No spam, no pitch deck.</span>
              </p>

              <LeadFormStatus status={status} isSuccess={isSuccess} />
            </form>
          </div>
        </section>

        <div className="laser-divider" />

        {/* 3-Card Grid */}
        <section className="space-y-6">
          <div className="space-y-1.5">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
              What&apos;s Included
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              What Your 3-Minute Audit Covers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {AUDIT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.index} className="stitch-card p-5 sm:p-6 rounded-lg flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent font-mono text-xs font-bold">
                        {card.index}
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-muted text-muted-foreground">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-foreground">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-border/60 font-mono text-xs font-semibold text-foreground">
                    <Icon className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                    <span>{card.footer}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Compact Upfront Pricing Rows */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
                Transparent Fixed Pricing
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                If you want me to fix it for you
              </h2>
            </div>
            <Link
              href="/packages"
              className="inline-flex items-center gap-1 font-mono text-xs font-bold text-accent hover:underline"
            >
              View full packages <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="stitch-card rounded-lg divide-y divide-border overflow-hidden">
            {PRICING_ROWS.map((row) => (
              <Link
                key={row.name}
                href={row.href}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-4 sm:p-5 hover:bg-muted/40 transition-colors group"
              >
                <div className="space-y-0.5">
                  <h3 className="text-base sm:text-lg font-black text-foreground group-hover:text-accent transition-colors">
                    {row.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{row.note}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-base sm:text-lg font-extrabold text-foreground">
                    {row.range}
                  </span>
                  <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
