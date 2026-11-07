// src/app/portfolio/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, CheckCircle2, Monitor, Layers, Server } from 'lucide-react';
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

  const formatRolePill = (role: string) => {
    if (role.includes('Lead Full Stack Engineer')) return 'Lead Architect';
    if (role.includes('Lead Front-End Engineer')) return 'Lead Front-End';
    if (role.includes('Full-Stack Web Developer')) return 'Full-Stack';
    if (role.includes('Full-Stack Engineer')) return 'Full-Stack';
    if (role.includes('Web Developer & Designer')) return 'Designer & Dev';
    if (role.includes('UX Designer & Prototyper')) return 'UX Designer';
    if (role.includes('Concept & Architecture')) return 'Architecture';
    return role;
  };

  const renderCard = (project: Project) => (
    <div
      key={project.slug}
      className="stitch-card group flex flex-col rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative border border-border before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent"
    >
      {/* Chromatic Corner Aura */}
      <div className="pointer-events-none absolute -right-12 -top-12 w-36 h-36 bg-accent/10 dark:bg-accent/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

      {/* Thumbnail Image Container */}
      <Link
        href={`/portfolio/${project.slug}`}
        className="relative aspect-[16/10] bg-muted/50 overflow-hidden block select-none border-b border-border/60 group/img rounded-t-[2.5rem]"
        title={`View ${project.title} Case Study`}
      >
        <Image
          src={project.img}
          alt={project.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-top group-hover/img:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/30 opacity-30 group-hover/img:opacity-10 transition-opacity" />

        {/* Top Atmospheric Glass Badges Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none z-10">
          <span className="h-7 inline-flex items-center px-3 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-background/80 dark:bg-slate-950/70 backdrop-blur-md text-foreground/90 border border-white/30 dark:border-white/15 shadow-md truncate max-w-[55%]">
            {project.tag}
          </span>
          <span className="h-7 inline-flex items-center gap-1.5 px-3 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-background/80 dark:bg-slate-950/70 backdrop-blur-md text-foreground/90 dark:text-foreground/90 border border-white/30 dark:border-white/15 shadow-md shrink-0">
            <Monitor className="w-2.5 h-2.5 text-accent shrink-0" />
            <span className="truncate max-w-[130px]">{formatRolePill(project.role)}</span>
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between space-y-5 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent">
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
            <div className="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Outcome Highlight:</span>
              </div>
              <p className="text-foreground/90 font-medium">
                {project.beforeAfter.result}
              </p>
            </div>
          )}

          {/* Highlight Metric Pill */}
          {!project.beforeAfter && project.highlightMetric && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/80 rounded-xl text-xs font-mono font-semibold text-foreground/90 border border-border/80">
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
                className="px-2 py-0.5 rounded-md bg-muted/80 border border-border/60 text-[10px] font-mono font-semibold text-muted-foreground"
              >
                {t}
              </span>
            ))}
            {project.tech.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md bg-muted/80 border border-border/60 text-[10px] font-mono font-semibold text-muted-foreground">
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
    <section className="relative pt-10 pb-24 min-h-screen overflow-hidden">
      {/* Background Dot-Grid Texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

      {/* Atmospheric Radial Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-accent/15 via-emerald-500/10 to-transparent blur-[130px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-1/3 -left-32 w-[420px] h-[420px] bg-accent/5 rounded-full blur-[110px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 w-full space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2.5 glass px-4 py-1.5 rounded-full shadow-md backdrop-blur-md border border-border">
            <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="font-mono text-xs text-accent tracking-widest uppercase font-bold">PRODUCTION SYSTEMS &amp; ARCHITECTURE</span>
            <span className="text-border">|</span>
            <span className="font-mono text-xs text-muted-foreground uppercase">CASE STUDIES</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
            Selected Work &amp; <span className="tech-gradient-text">Case Studies</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            A crawlable archive of custom web platforms, WordPress-to-Next.js headless migrations, and enterprise systems built for speed, reliability, and scale.
          </p>
        </div>

        {/* Quick-Skim Proof Bar for Recruiters & Clients */}
        <div className="stitch-card grid grid-cols-2 md:grid-cols-4 gap-4 p-5 md:p-6 rounded-2xl shadow-sm text-center relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent">
          <div className="p-2 md:border-r md:border-border/60">
            <p className="text-2xl md:text-3xl font-black font-mono text-accent">100M+</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">Subscribers Supported (Disney Streaming)</p>
          </div>
          <div className="p-2 md:border-r md:border-border/60">
            <p className="text-2xl md:text-3xl font-black font-mono text-accent">$3B+</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">Grants Processed (FEMA Modernization)</p>
          </div>
          <div className="p-2 md:border-r md:border-border/60">
            <p className="text-2xl md:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">99/100</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">Lighthouse Score on Headless Rebuilds</p>
          </div>
          <div className="p-2">
            <p className="text-2xl md:text-3xl font-black font-mono text-accent">&lt;350ms</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">Average TTFB on Vercel Deployments</p>
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
                  : 'stitch-card text-muted-foreground hover:text-foreground hover:border-accent/40'
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
                <div className="inline-flex items-center gap-2.5 glass px-4 py-1.5 rounded-full shadow-md backdrop-blur-md border border-border">
                  <Server className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="font-mono text-xs text-accent tracking-widest uppercase font-bold">ENTERPRISE SYSTEMS</span>
                  <span className="text-border">|</span>
                  <span className="font-mono text-xs text-muted-foreground uppercase">LARGE-SCALE PLATFORMS</span>
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

        {/* Laser Divider */}
        <div className="laser-divider my-10" />

        {/* Bottom CTA */}
        <div className="p-10 md:p-14 rounded-[3rem] glass border border-accent/20 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-accent/15 rounded-full blur-3xl" />
          <h2 className="text-3xl md:text-4xl font-black text-foreground relative z-10">
            Have a project or migration in mind? Let&apos;s talk scope.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium text-base md:text-lg relative z-10 leading-relaxed">
            Fixed pricing after a 15-minute discovery call. We build high-performance platforms with zero runaway hourly surprises.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10 pt-2">
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
