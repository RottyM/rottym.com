// src/app/portfolio/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  ShieldCheck,
  Cpu,
  Zap,
  ExternalLink,
  AlertTriangle,
  FileText,
  Users,
  CreditCard,
  RefreshCw,
  Lock,
  BookOpen,
  Star,
  Terminal,
  Activity,
  Check,
  X,
  Clock,
  Quote,
  FileCode2
} from 'lucide-react';
import { projects, getProjectBySlug } from '@/lib/projects';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found | RottyM',
    };
  }

  return {
    title: `${project.title} · Case Study & Platform Architecture`,
    description: project.summary,
    openGraph: {
      title: `${project.title} | Rottman M. Mendez Portfolio`,
      description: project.summary,
      images: [
        {
          url: project.img,
          width: 1200,
          height: 675,
          alt: project.title,
        },
      ],
    },
  };
}

export default async function ProjectCaseStudy({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  const cs = project.caseStudy;

  return (
    <div className="relative pt-10 pb-24 min-h-screen overflow-hidden">
      {/* Background Dot-Grid Texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

      {/* Atmospheric Radial Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-accent/10 via-sky-500/5 to-transparent dark:from-accent/15 dark:via-emerald-500/10 dark:to-transparent blur-[130px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-1/2 -right-32 w-[420px] h-[420px] bg-accent/5 rounded-full blur-[110px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 space-y-16 relative z-10">
        {/* Top Breadcrumb & Tag */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-accent transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Selected Work
          </Link>

          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-background/55 dark:bg-slate-950/50 backdrop-blur-md text-foreground/90 border border-white/20 dark:border-white/10 shadow-sm">
            {project.tag}
          </span>
        </div>

        {/* Hero Header (Centered to match /services, /packages, and site layout) */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 glass px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md backdrop-blur-md border border-border max-w-full">
            <FileCode2 className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">{project.category}</span>
            <span className="text-border">|</span>
            <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap">{project.role}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
            {project.title}
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            {cs ? cs.heroHeadline : project.summary}
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/80 border border-border/80 rounded-xl text-xs sm:text-sm font-mono font-semibold text-foreground/90 shadow-sm">
              <Zap className="w-4 h-4 text-accent shrink-0" />
              <span>{project.highlightMetric}</span>
            </div>
          </div>
        </div>

        {/* Hero Image Showcase (Using our snapshot of the NVWC website) */}
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="relative aspect-[16/10] w-full bg-card rounded-[2.5rem] md:rounded-[3rem] border border-border/80 shadow-2xl overflow-hidden">
            <Image
              src={project.img}
              alt={project.title}
              fill
              unoptimized
              priority
              className="object-cover object-top"
            />
          </div>

          {/* Proof Overlay Bar attached to snapshot */}
          {cs?.proofBar && (
            <div className="stitch-card p-5 md:p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground">{cs.proofBar.title}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {cs.proofBar.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 relative z-10">
                {cs.proofBar.chips.map((chip) => (
                  <span
                    key={chip}
                    className="px-2.5 py-1 rounded-md bg-muted text-[11px] font-mono font-semibold text-muted-foreground border border-border/60"
                  >
                    {chip}
                  </span>
                ))}
                {cs.liveUrl && (
                  <a
                    href={cs.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-md bg-accent text-accent-foreground text-xs font-black hover:scale-105 transition-transform shadow-md shadow-accent/20"
                  >
                    <span>{cs.liveUrlLabel || 'Live Site'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ----------------- RICH CASE STUDY BODY ----------------- */}
        {cs ? (
          <div className="max-w-5xl mx-auto space-y-16">
            {/* High-Visibility Metadata & Spec Grid */}
            <div className="stitch-card p-6 md:p-10 rounded-[2.5rem] shadow-xl space-y-8 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent">
              {/* 4-Column Top Data Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-8 border-b border-border/80 relative z-10">
                {cs.metrics.map((m, idx) => (
                  <div key={m.label} className="space-y-1">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      {m.label}
                    </div>
                    <div
                      className={`text-3xl md:text-4xl font-black tracking-tight ${
                        idx === 0
                          ? 'text-accent'
                          : idx === 2
                          ? 'text-emerald-500 dark:text-emerald-400'
                          : 'text-foreground'
                      }`}
                    >
                      {m.value}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{m.subtext}</div>
                  </div>
                ))}
              </div>

              {/* Specification Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cs.specs.map((spec) => (
                  <div key={spec.label} className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      {spec.label}
                    </span>
                    <p className="text-sm font-bold text-foreground">{spec.value}</p>
                    {spec.subtext && (
                      <p className="text-xs text-muted-foreground font-medium">{spec.subtext}</p>
                    )}
                    {spec.chips && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {spec.chips.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded bg-muted text-[10px] font-mono font-medium text-foreground border border-border/60"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* The Administrative Crisis (The Challenge) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column Narrative */}
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-accent shadow-sm text-xs font-bold tracking-wide uppercase">
                  <span>{cs.crisis.eyebrow}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
                  {cs.crisis.heading}
                </h2>
                {cs.crisis.description.map((p, idx) => (
                  <p key={idx} className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
                    {p}
                  </p>
                ))}

                {/* The High-Stakes Threat Callout */}
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">The High-Stakes Threat</span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/85 font-medium leading-relaxed">
                    {cs.crisis.threat}
                  </p>
                </div>
              </div>

              {/* Right Column: Pre-Architecture Workflow */}
              <div className="lg:col-span-7 bg-card rounded-[2.5rem] p-6 md:p-8 space-y-5 border border-border shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-border/70">
                  <span className="text-base font-black text-foreground">
                    Pre-Architecture Workflow: Before RottyM
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-500 dark:text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Legacy Pain Points
                  </span>
                </div>

                <div className="space-y-4">
                  {cs.crisis.painPoints.map((pain, idx) => (
                    <div
                      key={pain.title}
                      className="flex items-start gap-3.5 p-4 rounded-xl bg-muted/40 border border-border/70"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                        {idx === 0 ? (
                          <FileText className="w-4 h-4" />
                        ) : idx === 1 ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Activity className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-foreground">{pain.title}</h3>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                          {pain.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* The Solution: 6 Core Engineering Pillars Bento Grid */}
            <section className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-accent shadow-sm text-xs font-bold tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5" /> ENGINEERED ARCHITECTURE
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                  {cs.pillarsHeading}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
                  {cs.pillarsSubheading}
                </p>
              </div>

              {/* 6 Card Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cs.pillars.map((pillar, idx) => {
                  const icons = [
                    <Users key={0} className="w-5 h-5 text-accent" />,
                    <CreditCard key={1} className="w-5 h-5 text-accent" />,
                    <RefreshCw key={2} className="w-5 h-5 text-accent" />,
                    <Clock key={3} className="w-5 h-5 text-accent" />,
                    <BookOpen key={4} className="w-5 h-5 text-accent" />,
                    <FileText key={5} className="w-5 h-5 text-accent" />,
                  ];

                  return (
                    <div
                      key={pillar.title}
                      className="group bg-card rounded-[2rem] p-6 md:p-8 flex flex-col justify-between border border-border/80 hover:border-accent/40 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
                            {pillar.index}
                          </span>
                          <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center border border-border">
                            {icons[idx % icons.length]}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
                            {pillar.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                            {pillar.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-5 mt-5 border-t border-border/60 space-y-2">
                        {pillar.bullets.map((bullet) => (
                          <div
                            key={bullet}
                            className="flex items-center gap-2 text-xs font-semibold text-foreground/80"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Interactive Data Flow Architecture (System Topology) */}
            {cs.topology && (
              <section className="rounded-[2.5rem] bg-muted/30 border border-border p-6 md:p-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-bold">
                      {cs.topology.eyebrow}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-foreground">
                      {cs.topology.heading}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                      {cs.topology.subtext}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 font-mono text-xs text-accent font-semibold self-start md:self-auto">
                    <Activity className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{cs.topology.pulseBadge}</span>
                  </div>
                </div>

                {/* 4 Step Topology Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cs.topology.steps.map((step) => (
                    <div
                      key={step.step}
                      className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-2.5 relative flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider">
                          {step.step}
                        </span>
                        <h4 className="text-sm font-bold text-foreground">{step.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                          {step.description}
                        </p>
                      </div>
                      <span className="inline-block px-2 py-1 rounded bg-muted/80 font-mono text-[10px] font-semibold text-accent border border-border self-start">
                        {step.code}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Before vs After Comparison & Impact Analysis */}
            {cs.comparison && (
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Before Matrix Card */}
                <div className="bg-card rounded-[2.5rem] p-6 md:p-8 space-y-6 border border-border shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-border/80">
                    <div className="flex items-center gap-2 text-red-500">
                      <X className="w-5 h-5" />
                      <span className="text-lg font-black text-foreground">
                        {cs.comparison.beforeTitle}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
                      {cs.comparison.beforeSubtitle}
                    </span>
                  </div>

                  <ul className="space-y-3.5">
                    {cs.comparison.beforeItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* After Matrix Card */}
                <div className="bg-card rounded-[2.5rem] p-6 md:p-8 space-y-6 border border-accent/30 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between pb-3 border-b border-border/80">
                    <div className="flex items-center gap-2 text-accent">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                      <span className="text-lg font-black text-foreground">
                        {cs.comparison.afterTitle}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-accent uppercase font-bold tracking-wider">
                      {cs.comparison.afterSubtitle}
                    </span>
                  </div>

                  <ul className="space-y-3.5">
                    {cs.comparison.afterItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground leading-relaxed font-medium">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Verified Testimonial Quote */}
            {cs.testimonial && (
              <section className="relative rounded-[2.5rem] bg-card p-8 md:p-12 border border-border shadow-2xl overflow-hidden">
                <div className="absolute top-4 right-6 text-foreground/5 select-none pointer-events-none">
                  <Quote className="w-32 h-32" />
                </div>
                <div className="relative max-w-3xl space-y-5">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground ml-2">
                      VERIFIED CLIENT IMPACT
                    </span>
                  </div>

                  <blockquote className="text-base sm:text-lg md:text-xl text-foreground font-semibold leading-relaxed">
                    &ldquo;{cs.testimonial.quote}&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent text-sm">
                      {cs.testimonial.avatarText}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">
                        {cs.testimonial.author}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {cs.testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Technical Guarantees Strip */}
            {cs.guarantees && (
              <div className="p-6 rounded-2xl bg-muted/40 border border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-foreground">
                {cs.guarantees.map((g, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ----------------- BASELINE CASE STUDY LAYOUT ----------------- */
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Before / After Section */}
            {project.beforeAfter && (
              <section className="p-8 md:p-12 rounded-[2.5rem] bg-card border border-border shadow-xl space-y-6">
                <div className="flex items-center gap-2.5 text-accent">
                  <Layers className="w-5 h-5" />
                  <h2 className="text-2xl font-black text-foreground">Before &amp; After Transformation</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                      Legacy Baseline (Before)
                    </span>
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                      {project.beforeAfter.before}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      Modern Architecture (After)
                    </span>
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                      {project.beforeAfter.after}
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-accent/5 border border-accent/20 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-accent block mb-1">
                      Measured Result
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {project.beforeAfter.result}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* The Challenge & The Solution Grid */}
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {project.challenge && (
                <div className="p-8 md:p-10 rounded-[2.5rem] bg-card border border-border shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground">The Challenge</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-medium">
                      {project.challenge}
                    </p>
                  </div>
                </div>
              )}

              {project.solution && (
                <div className="p-8 md:p-10 rounded-[2.5rem] bg-card border border-border shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground">The Solution &amp; Architecture</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-medium">
                      {project.solution}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tech Stack Arsenal */}
            <div className="p-8 md:p-10 rounded-[2.5rem] bg-card border border-border shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
                Technologies &amp; Architecture Applied
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-3.5 py-1.5 rounded-xl bg-muted border border-border text-xs font-bold text-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                {project.details}
              </p>
            </div>
          </div>
        )}

        {/* Next / Previous Project Pagination */}
        <div className="max-w-5xl mx-auto flex items-center justify-between border-t border-border pt-8">
          {prevProject ? (
            <Link
              href={`/portfolio/${prevProject.slug}`}
              className="flex flex-col items-start gap-1 text-sm font-bold text-foreground hover:text-accent transition-colors group"
            >
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1 font-mono">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Previous Project
              </span>
              <span>{prevProject.title}</span>
            </Link>
          ) : (
            <div />
          )}

          {nextProject ? (
            <Link
              href={`/portfolio/${nextProject.slug}`}
              className="flex flex-col items-end gap-1 text-sm font-bold text-foreground hover:text-accent transition-colors group text-right"
            >
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1 font-mono">
                Next Project <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
              <span>{nextProject.title}</span>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Laser Divider */}
        <div className="max-w-5xl mx-auto laser-divider my-8" />

        {/* Signature Call to Action (Matching site layout) */}
        <div className="max-w-5xl mx-auto p-10 md:p-14 rounded-[3rem] glass border border-accent/20 text-center space-y-6 relative overflow-hidden shadow-xl">
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
    </div>
  );
}
