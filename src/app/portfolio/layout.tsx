import type { ReactNode } from 'react';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Portfolio & Case Studies — Client Websites & Portals',
  description:
    'Case studies featuring headless Next.js rebuilds, member portals, custom booking workflows, and high-availability systems for local businesses and enterprises.',
  path: '/portfolio',
});

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return children;
}

