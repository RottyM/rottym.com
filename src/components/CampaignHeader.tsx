'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { Phone, Sun, Moon } from 'lucide-react';
import RottyMLogo from './RottyMLogo';
import { useTheme } from './ThemeProvider';
import { trackEvent } from '@/lib/analytics';

const emptySubscribe = () => () => {};

export default function CampaignHeader({ maxWidth = 'max-w-7xl' }: { maxWidth?: string }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm transition-all">
      <div className={`${maxWidth} mx-auto py-2.5 sm:py-3.5 px-4 sm:px-6 flex justify-between items-center gap-2 sm:gap-3`}>
        <Link href="/" className="inline-flex items-center group shrink-0" aria-label="Rottman M. Mendez Home">
          <div className="sm:hidden" aria-hidden="true">
            <RottyMLogo variant="compact" size={38} animated={true} />
          </div>
          <div className="hidden sm:inline-flex" aria-hidden="true">
            <RottyMLogo variant="full" size={54} animated={true} />
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:2028540954"
            onClick={() =>
              trackEvent({
                action: 'phone_click',
                category: 'campaign_header',
                label: pathname || 'campaign',
                params: { page_path: pathname || undefined },
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent dark:text-[#00F2FE] border border-accent/30 font-mono text-xs sm:text-sm font-bold transition-all whitespace-nowrap"
            aria-label="Call (202) 854-0954"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>(202) 854-0954</span>
          </a>

          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground/80"
            aria-label={mounted ? `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
          >
            {mounted && (resolvedTheme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
      <div className="laser-divider opacity-75" />
    </header>
  );
}
