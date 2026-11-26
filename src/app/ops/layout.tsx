import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RottyM Command Center',
  description: 'Private operations board for RottyM AI crew and content pipeline.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
