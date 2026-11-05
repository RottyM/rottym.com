// src/app/portfolio/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, CheckCircle2, Monitor } from 'lucide-react';
import { projects, Project } from '@/lib/projects';

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const modernProjects = projects.filter((p) => p.section === 'modern');
  const enterpriseProjects = projects.filter((p) => p.section === 'enterprise');

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'nextjs') return project.tech.some((t) => t.includes('Next.js') || t.includes('React'));
    if (activeFilter === 'wordpress') return project.tech.some((t) => t.includes('WordPress') || t.includes('BuddyBoss') || t.includes('CMS'));
    if (activeFilter === 'enterprise') return project.section === 'enterprise';
    return true;
  });

  const renderCard = (project: Project) => (
    <div
      key={project.slug}
      className="group flex flex-col rounded-[2.25rem] bg-card border border-border hover:border-accent/40 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail Image Container */}
      <Link
        href={`/portfolio/${project.slug}`}
        className="relative aspect-[16/10] bg-muted/50 overflow-hidden block select-none border-b border-border/50"
        title={`View ${project.title} Case Study`}
      >
        <Image
          src={project.img}
          alt={project.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-20 group-hover:opacity-0 transition-opacity" />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="h-5 inline-flex items-center px-2 rounded-md text-[9px] font-black uppercase tracking-wider bg-card/90 text-foreground border border-border/80 backdrop-blur-md shadow-sm">
            {project.tag}
          </span>
          <span className="h-5 inline-flex items-center gap-1 px-2 rounded-md text-[9px] font-bold uppercase tracking-wider bg-card/90 text-muted-foreground border border-border/80 backdrop-blur-md shadow-sm">
            <Monitor className="w-2.5 h-2.5 text-accent shrink-0" />
            <span>{project.role}</span>
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-7 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-accent">
              {project.category}
            </span>
          </div>

          <h3 className="text-2xl font-black text-foreground group-hover:text-accent transition-colors leading-tight">
            <Link href={`/portfolio/${project.slug}`}>
              {project.title}
            </Link>
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            {project.summary}
          </p>

          {/* Before / After Callout for Migrations */}
          {project.beforeAfter && (
            <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/15 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Outcome Highlight:</span>
              </div>
              <p className="text-foreground/80 font-medium">
                {project.beforeAfter.result}
              </p>
            </div>
          )}

          {/* Highlight Metric Pill */}
          {!project.beforeAfter && project.highlightMetric && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 rounded-xl text-xs font-semibold text-foreground/80 border border-border/60">
              <Zap className="w-3 h-3 text-accent shrink-0" />
              <span>{project.highlightMetric}</span>
            </div>
          )}
        </div>

        {/* Footer: Tech Stack & Link */}
        <div className="space-y-4 pt-4 border-t border-border/60">
          <div className="flex flex-wrap gap-1.5">
            {project.tech.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-muted-foreground"
              >
                {t}
              </span>
            ))}
            {project.tech.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                +{project.tech.length - 3}
              </span>
            )}
          </div>

          <Link
            href={`/portfolio/${project.slug}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-accent group-hover:gap-3 transition-all"
          >
            View Architecture &amp; Details <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <section className="pt-10 pb-24 px-4 md:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-accent shadow-sm text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Production Systems &amp; Case Studies
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
            Selected Work &amp; Case Studies
          </h1>
          <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed">
            A crawlable archive of custom web platforms, WordPress-to-Next.js headless migrations, and enterprise systems built for speed, reliability, and scale.
          </p>
        </div>

        {/* Quick-Skim Proof Bar for Recruiters & Clients */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm text-center">
          <div className="p-3">
            <p className="text-xl md:text-2xl font-black text-accent">100M+</p>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">Subscribers Supported (Disney Streaming)</p>
          </div>
          <div className="p-3">
            <p className="text-xl md:text-2xl font-black text-accent">$3B+</p>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">Grants Processed (FEMA Modernization)</p>
          </div>
          <div className="p-3">
            <p className="text-xl md:text-2xl font-black text-accent">99/100</p>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">Lighthouse Score on Headless Rebuilds</p>
          </div>
          <div className="p-3">
            <p className="text-xl md:text-2xl font-black text-accent">&lt;350ms</p>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">Average TTFB on Vercel Serverless Deployments</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { id: 'all', label: `All Projects (${projects.length})` },
            { id: 'nextjs', label: 'Next.js & Cloud Platforms' },
            { id: 'wordpress', label: 'WordPress Internals & Migrations' },
            { id: 'enterprise', label: 'Enterprise & Scale' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-accent text-accent-foreground shadow-md shadow-accent/20'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Section(s) */}
        {activeFilter === 'all' ? (
          <div className="space-y-16">
            {/* Top Section: Modern Web Platforms & Client Systems */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/80 pb-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                    Modern Web Platforms &amp; Client Systems
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium mt-1">
                    Recent headless Next.js platforms, client portals, and WordPress migration architectures.
                  </p>
                </div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider shrink-0">
                  {modernProjects.length} Projects
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {modernProjects.map(renderCard)}
              </div>
            </div>

            {/* Section Divider: Enterprise & Earlier Career Work */}
            <div className="pt-10 space-y-6">
              <div className="p-8 md:p-10 rounded-[2.5rem] bg-muted/40 border border-border space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-accent shadow-sm text-xs font-bold tracking-wide uppercase">
                  Enterprise &amp; Earlier Career Work
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                  Enterprise &amp; Large-Scale Systems
                </h2>
                <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed max-w-3xl">
                  High-traffic publishing, government compliance, and e-commerce platforms engineered throughout my enterprise contracts and earlier career.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {enterpriseProjects.map(renderCard)}
              </div>
            </div>
          </div>
        ) : (
          /* Filtered View: Single Unified Grid */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <h2 className="text-xl md:text-2xl font-black text-foreground capitalize">
                Showing {filteredProjects.length} Result{filteredProjects.length !== 1 ? 's' : ''}
              </h2>
              <button
                onClick={() => setActiveFilter('all')}
                className="text-xs font-bold text-accent hover:underline cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map(renderCard)}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="p-10 md:p-14 rounded-[3rem] glass border border-accent/20 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Have a project or migration in mind? Let&apos;s talk scope.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium text-base">
            Fixed pricing after a 15-minute discovery call. We build high-performance platforms with zero runaway hourly surprises.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-2xl font-black text-base hover:scale-105 transition-transform shadow-lg shadow-accent/20"
            >
              Book a Discovery Call <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 glass px-8 py-4 rounded-2xl font-bold text-base hover:bg-muted transition-all text-foreground"
            >
              View Fixed Packages &amp; Pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
