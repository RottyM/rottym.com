import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Start Here | Rottman M. Mendez — RottyM',
  description:
    'Bridging Disney, FEMA, FAA, BAE Systems, Leidos, and USA Today engineering with plain-English, fast small-business websites in Reston, VA.',
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
