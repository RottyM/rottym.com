// src/app/portfolio/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Monitor, Layers, ShieldCheck, Cpu } from 'lucide-react';
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

  return (
    <article className="py-16 md:py-24 px-6 max-w-5xl mx-auto space-y-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between border-b border-border/80 pb-6">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-accent transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to All Work
        </Link>
        <div className="flex items-center gap-2">
          {project.isLegacy ? (
            <span className="text-[11px] font-bold px-3 py-1 bg-muted text-muted-foreground rounded-full border border-border">
              Legacy / Early Career
            </span>
          ) : (
            <span className="text-[11px] font-bold px-3 py-1 bg-accent/10 text-accent rounded-full border border-accent/20">
              {project.tag}
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span className="px-3 py-1 bg-muted rounded-md text-foreground">{project.category}</span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-accent">
            <Monitor className="w-3.5 h-3.5" /> {project.role}
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
          {project.title}
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
          {project.summary}
        </p>

        {/* Highlight Metric Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold text-sm">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{project.highlightMetric}</span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-[16/10] bg-card rounded-[2.5rem] border border-border/80 shadow-2xl overflow-hidden">
        <Image
          src={project.img}
          alt={project.title}
          fill
          unoptimized
          priority
          className="object-cover object-top"
        />
      </div>

      {/* Before / After Section (if available) */}
      {project.beforeAfter && (
        <section className="p-8 md:p-10 rounded-[2.5rem] bg-card border border-border shadow-xl space-y-6">
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

      {/* Challenge & Solution Grid */}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {project.challenge && (
          <div className="p-8 rounded-[2rem] bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" /> The Challenge
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-medium">
              {project.challenge}
            </p>
          </div>
        )}

        {project.solution && (
          <div className="p-8 rounded-[2rem] bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              <Cpu className="w-5 h-5 text-accent" /> The Solution &amp; Architecture
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-medium">
              {project.solution}
            </p>
          </div>
        )}
      </div>

      {/* Tech Stack Arsenal */}
      <div className="space-y-4 p-8 rounded-[2rem] bg-muted/30 border border-border">
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
          Technologies &amp; Architecture Applied
        </h3>
        <div className="flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span
              key={t}
              className="px-3.5 py-1.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed pt-2">
          {project.details}
        </p>
      </div>

      {/* Next / Previous Project Pagination */}
      <div className="flex items-center justify-between border-t border-border pt-8">
        {prevProject ? (
          <Link
            href={`/portfolio/${prevProject.slug}`}
            className="flex flex-col items-start gap-1 text-sm font-bold text-foreground hover:text-accent transition-colors group"
          >
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
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
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              Next Project <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
            <span>{nextProject.title}</span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Call to Action */}
      <div className="p-10 md:p-12 rounded-[2.5rem] glass border border-accent/20 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-black text-foreground">
          Ready to build or modernize your platform?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto font-medium text-base">
          Whether you need to escape a slow WordPress setup or architect a custom portal with enterprise reliability, let&apos;s talk scope.
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
            View Packages &amp; Pricing
          </Link>
        </div>
      </div>
    </article>
  );
}
