// src/app/portfolio/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { projects, getProjectsSorted, getProjectBySlug } from '@/lib/projects';
import { createPageMetadata } from '@/lib/metadata';
import ProjectCaseStudyClient from '@/components/ProjectCaseStudyClient';

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
      title: 'Project Not Found',
      robots: { index: false, follow: false },
    };
  }

  return createPageMetadata({
    title: `${project.title} · Case Study & Platform Architecture`,
    description: project.summary,
    path: `/portfolio/${slug}`,
    ogTitle: `${project.title} | Rottman M. Mendez Portfolio`,
    image: {
      url: project.img,
      width: 1200,
      height: 675,
      alt: project.title,
    },
  });
}

export default async function ProjectCaseStudy({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const sorted = getProjectsSorted();
  const currentIndex = sorted.findIndex((p) => p.slug === slug);
  const prevProject = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const nextProject = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;

  return <ProjectCaseStudyClient rawProject={project} rawPrev={prevProject} rawNext={nextProject} />;
}
