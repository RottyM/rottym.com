// src/app/about/page.tsx
import AboutContent from '@/components/AboutContent';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'About Rotty — Web Engineer in Reston, VA',
  description:
    "Meet Rottman 'Rotty' Mendez, a Reston, VA software engineer (ex-Disney Streaming, FEMA & FAA) building fast, fixed-price business websites you own 100%.",
  path: '/about',
});

export default function About() {
  return <AboutContent />;
}
