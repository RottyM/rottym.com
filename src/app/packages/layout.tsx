import type { ReactNode } from 'react';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Website Packages & Pricing — From $2,500',
  description:
    'Fixed-scope websites for Reston and Northern Virginia businesses. Most projects run $2,500–$6,500 with booking, quote forms, and workflows you own 100%.',
  path: '/packages',
});

export default function PackagesLayout({ children }: { children: ReactNode }) {
  return children;
}

