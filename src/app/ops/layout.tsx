import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

const opsSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ops-sans',
});

const opsMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ops-mono',
});

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
  return (
    <div
      className={`${opsSans.variable} ${opsMono.variable} ops-shell min-h-screen bg-background text-foreground`}
    >
      {children}
    </div>
  );
}
