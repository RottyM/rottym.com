import type { ReactNode } from 'react';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Contact & Book a Call — Reston, VA',
  description:
    'Book a free 30-minute discovery call or message RottyM about a modern website, WordPress rebuild, or custom workflow for your Northern Virginia business.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}

