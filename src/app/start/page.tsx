'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Gauge,
  Boxes,
  CalendarCheck,
  Briefcase,
  Globe,
  Mail,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import CampaignHeader from '@/components/CampaignHeader';
import LeadFormStatus from '@/components/LeadFormStatus';
import { useLeadForm } from '@/hooks/useLeadForm';
import { trackEvent } from '@/lib/analytics';

const ACTION_CARDS = [
  {
    badge: 'Free Video Breakdown',
    title: 'Free 3-Minute Website Audit',
    subtitle: 'Send your URL and get a plain-English recording of speed bottlenecks and mobile leaks.',
    href: '/audit',
    icon: Gauge,
    highlight: true,
  },
  {
    badge: 'Transparent Rates',
    title: 'Packages & Upfront Pricing',
    subtitle: 'Fixed-scope builds from $2,500 — Local Launchpad, Booking & Intake, and Performance Rebuild.',
    href: '/packages',
    icon: Boxes,
    highlight: false,
  },
  {
    badge: 'Direct Calendar',
    title: 'Book a Free 30-Minute Call',
    subtitle: 'Zero sales pressure. Talk scope, timelines, and fixed pricing directly with Rottman.',
    href: '/contact',
    icon: CalendarCheck,
    highlight: false,
  },
  {
    badge: 'Proven Outcomes',
    title: 'Case Studies & Client Portals',
    subtitle: "See live work for Men Talking LLC, Rebecca's Cleaning, and Northern Virginia Writers Club.",
    href: '/portfolio',
    icon: Briefcase,
    highlight: false,
  },
];

export default function StartPage() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [email, setEmail] = useState('');

  const { status, isSubmitting, isSuccess, submitLead } = useLeadForm({
    formId: 'start_quick_audit_form',
    serviceLabel: 'Quick-Audit Request (/start)',
    gaCategory: 'start_bridge_page',
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
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-full max-w-[640px] h-[420px] bg-gradient-to-tr from-accent/10 via-sky-500/5 to-transparent dark:from-accent/15 dark:via-emerald-500/10 dark:to-transparent blur-[130px] rounded-full -z-10" />

      <CampaignHeader maxWidth="max-w-2xl" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Profile Bridge Card */}
        <section className="stitch-card p-5 sm:p-7 rounded-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-accent">
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Reston, VA · Northern Virginia
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              Accepting Projects
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
              Rottman M. Mendez
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
              I build fast, modern websites for Northern Virginia businesses — restaurants, contractors, authors, shops, nonprofits, you name it — with online booking, quote forms, and custom workflows built in.{' '}
              <strong className="text-foreground font-semibold">From $2,500, and you own 100% of it.</strong>
            </p>
          </div>
        </section>

        {/* Stacked High-Contrast Action Cards */}
        <nav aria-label="Primary actions" className="space-y-3">
          {ACTION_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                onClick={() =>
                  trackEvent({
                    action: 'select_content',
                    category: 'start_bridge_page',
                    label: card.title,
                    params: { destination: card.href, page_path: '/start' },
                  })
                }
                className={`group flex items-center justify-between gap-4 p-4 sm:p-5 rounded-lg transition-all ${
                  card.highlight
                    ? 'bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] shadow-lg'
                    : 'stitch-card'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      card.highlight
                        ? 'bg-white/10 text-[#00D8F6] dark:bg-black/15 dark:text-accent-foreground'
                        : 'bg-accent/10 text-accent'
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <span
                      className={`block font-mono text-[10px] font-bold uppercase tracking-widest ${
                        card.highlight
                          ? 'text-[#00D8F6] dark:text-accent-foreground/80'
                          : 'text-accent'
                      }`}
                    >
                      {card.badge}
                    </span>
                    <h2
                      className={`text-base sm:text-lg font-black tracking-tight ${
                        card.highlight
                          ? 'text-white dark:text-accent-foreground'
                          : 'text-foreground group-hover:text-accent transition-colors'
                      }`}
                    >
                      {card.title}
                    </h2>
                    <p
                      className={`text-xs sm:text-sm leading-snug ${
                        card.highlight
                          ? 'text-slate-300 dark:text-accent-foreground/85'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {card.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className={`w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform ${
                    card.highlight
                      ? 'text-[#00D8F6] dark:text-accent-foreground'
                      : 'text-accent'
                  }`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        {/* Inline 2-Field Quick-Audit Form */}
        <section id="quick-audit" className="pt-2">
          <form
            onSubmit={handleSubmit}
            className="stitch-card p-5 sm:p-6 rounded-lg shadow-xl space-y-4 relative before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent"
          >
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
                Quick-Audit Intake
              </span>
              <h2 className="text-lg sm:text-xl font-black text-foreground">
                Request Your Free 3-Minute Audit
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Drop your URL and email — I&apos;ll send a personalized video breakdown within 1 business day.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label
                  htmlFor="start-url"
                  className="block text-[11px] font-black uppercase tracking-widest ml-1 text-muted-foreground font-mono"
                >
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="start-url"
                    name="websiteUrl"
                    type="url"
                    required
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yoursite.com"
                    className="w-full pl-9 pr-3 py-3 bg-white dark:bg-[#0B111E] border border-slate-500 dark:border-slate-500 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-slate-600 dark:placeholder:text-slate-400 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="start-email"
                  className="block text-[11px] font-black uppercase tracking-widest ml-1 text-muted-foreground font-mono"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="start-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-9 pr-3 py-3 bg-white dark:bg-[#0B111E] border border-slate-500 dark:border-slate-500 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-slate-600 dark:placeholder:text-slate-400 font-medium text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] py-3 px-5 rounded-lg font-bold font-mono text-xs sm:text-sm hover:scale-[1.01] transition-all shadow-md disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Sending...' : 'Send My Free Audit'}</span>
              <ArrowRight className="w-4 h-4 text-[#00D8F6] dark:text-current group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
              <span>Delivered within 1 business day. No spam, no pitch deck.</span>
            </p>

            <LeadFormStatus status={status} isSuccess={isSuccess} />
          </form>
        </section>
      </div>
    </div>
  );
}
