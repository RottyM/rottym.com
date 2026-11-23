import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Replace Slow, Dated, or Rented Websites | Performance Rebuild',
  description:
    'Replace your slow WordPress, Squarespace, Wix, GoDaddy, Weebly, Joomla/Drupal, or dated custom site with a fast custom build you own 100%.',
};

export default function WordpressRebuildLayout({ children }: { children: React.ReactNode }) {
  return children;
}
