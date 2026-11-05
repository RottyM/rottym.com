// src/app/portfolio/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Layers, ShieldCheck, Cpu, Zap } from 'lucide-react';
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
    <div className="py-16 md:py-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Top Breadcrumb & Tag */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-accent transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Selected Work
          </Link>
          <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-card text-foreground border border-border shadow-sm">
            {project.tag}
          </span>
        </div>

        {/* Hero Header (Centered to match /services and /packages) */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> {project.category} · {project.role}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-foreground">
            {project.title}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            {project.summary}
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/70 border border-border/80 rounded-xl text-xs sm:text-sm font-semibold text-foreground/90 shadow-sm">
              <Zap className="w-4 h-4 text-accent shrink-0" />
              <span>{project.highlightMetric}</span>
            </div>
          </div>
        </div>

        {/* Hero Image Showcase */}
        <div className="relative aspect-[16/10] max-w-5xl mx-auto bg-card rounded-[2.5rem] md:rounded-[3rem] border border-border/80 shadow-2xl overflow-hidden">
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
          <section className="max-w-5xl mx-auto p-8 md:p-12 rounded-[2.5rem] bg-card border border-border shadow-xl space-y-6">
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

        {/* The Challenge & The Solution Grid (Matches /services cards) */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-stretch">
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
        <div className="max-w-5xl mx-auto p-8 md:p-10 rounded-[2.5rem] bg-card border border-border shadow-sm space-y-4">
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

        {/* Next / Previous Project Pagination */}
        <div className="max-w-5xl mx-auto flex items-center justify-between border-t border-border pt-8">
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

        {/* Signature Call to Action */}
        <div className="max-w-5xl mx-auto p-10 md:p-14 rounded-[3rem] glass border border-accent/20 text-center space-y-6">
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
      </div>
    </div>
  );
}
