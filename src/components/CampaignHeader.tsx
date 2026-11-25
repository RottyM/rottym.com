'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { Phone, Sun, Moon } from 'lucide-react';
import RottyMLogo from './RottyMLogo';
import LangToggle from './LangToggle';
import { useTheme } from './ThemeProvider';
import { trackEvent } from '@/lib/analytics';

const emptySubscribe = () => () => {};

export default function CampaignHeader({ maxWidth = 'max-w-7xl' }: { maxWidth?: string }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme, lang } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isEs = (mounted ? lang : 'en') === 'es';

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm transition-all">
      <div className={`${maxWidth} mx-auto py-2.5 sm:py-3.5 px-4 sm:px-6 flex justify-between items-center gap-2 sm:gap-3`}>
        <Link href="/" className="inline-flex items-center group shrink-0" aria-label={isEs ? 'Inicio Rottman M. Mendez' : 'Rottman M. Mendez Home'}>
          <div className="sm:hidden" aria-hidden="true">
            <RottyMLogo variant="compact" size={38} animated={true} />
          </div>
          <div className="hidden sm:inline-flex" aria-hidden="true">
            <RottyMLogo variant="full" size={54} animated={true} />
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent dark:text-[#00F2FE] border border-accent/30 font-mono text-xs sm:text-sm font-bold transition-all whitespace-nowrap"
            aria-label={isEs ? 'Llamar al (202) 854-0954' : 'Call (202) 854-0954'}
          >
            <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>(202) 854-0954</span>
          </a>

          <div className="hidden sm:inline-flex items-center rounded-lg border border-border bg-card/90 p-1 gap-1 shadow-xs">
            <LangToggle embedded />
            <div className="h-4 w-px bg-border" aria-hidden="true" />
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-md hover:bg-muted transition-colors text-foreground/80"
              aria-label={
                mounted
                  ? isEs
                    ? `Cambiar a modo ${resolvedTheme === 'dark' ? 'claro' : 'oscuro'}`
                    : `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`
                  : 'Toggle theme'
              }
            >
              {mounted && (resolvedTheme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />)}
            </button>
          </div>
        </div>
      </div>

      {/* Compact mobile utility bar prevents button bunching on narrow screens */}
      <div className="sm:hidden border-t border-border/60 bg-muted/40 px-4 py-1.5 flex items-center justify-between gap-2">
        <LangToggle compact />
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-card/90 font-mono text-[10px] font-bold text-foreground/85 hover:border-accent/50 transition-colors"
          aria-label={
            mounted
              ? isEs
                ? `Cambiar a modo ${resolvedTheme === 'dark' ? 'claro' : 'oscuro'}`
                : `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`
              : 'Toggle theme'
          }
        >
          {mounted && (resolvedTheme === 'dark' ? <Sun className="w-3.5 h-3.5" aria-hidden="true" /> : <Moon className="w-3.5 h-3.5" aria-hidden="true" />)}
          <span>{mounted ? (resolvedTheme === 'dark' ? (isEs ? 'Claro' : 'Light') : (isEs ? 'Oscuro' : 'Dark')) : 'Theme'}</span>
        </button>
      </div>
      <div className="laser-divider opacity-75" />
    </header>
  );
}
