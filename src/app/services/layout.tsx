import type { ReactNode } from 'react';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Services — Modern Websites, Booking & Custom Workflows',
  description:
    'Custom Next.js websites, online booking, WordPress migrations, and full-stack cloud engineering for Northern Virginia businesses. Fixed pricing; 100% ownership.',
  path: '/services',
});

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return children;
}

