// src/app/estimate/layout.tsx
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Interactive Scope Estimator & AI Solutions Architect',
  description:
    'Configure your Next.js website, WordPress escape, member portal, or custom AI workflow in real time. Get an instant fixed-scope estimate, 4-phase roadmap, and grounded AI architectural review.',
  path: '/estimate',
  ogTitle: 'RottyM AI Studio · Scope Estimator & Solutions Architect',
  ogDescription:
    'Transparent fixed-scope ranges ($2,500–$9,500+), interactive cloud & AI stack builder, and grounded AI architectural analysis — 100% code ownership.',
});

export default function EstimateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
