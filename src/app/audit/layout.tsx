import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free 3-Minute Site Speed & Leak Audit',
  description:
    'Send your URL for a plain-English 3-minute breakdown showing what is slowing your mobile site down, where visitors drop off, and how to fix it.',
};

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return children;
}
