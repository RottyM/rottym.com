// src/components/Header.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import RottyMLogo from './RottyMLogo';
import LangToggle from './LangToggle';

const emptySubscribe = () => () => {};
const CAMPAIGN_ROUTES = ['/audit', '/wordpress-rebuild', '/start'];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme, lang } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const activeLang = mounted ? lang : 'en';
  const isEs = activeLang === 'es';
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isCampaignRoute = CAMPAIGN_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`)
  );
  const hideLangToggle = pathname === '/resume' || pathname?.startsWith('/resume/');

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const getFocusable = (): HTMLElement[] => {
      const items: HTMLElement[] = [];
      if (menuButtonRef.current) items.push(menuButtonRef.current);
      if (drawerRef.current) {
        const nodes = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        );
        items.push(...Array.from(nodes));
      }
      return items;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileMenuOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }
      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (active === first || !focusable.includes(active as HTMLElement)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || !focusable.includes(active as HTMLElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  if (isCampaignRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm transition-all">
      <div className="max-w-7xl mx-auto py-2.5 sm:py-3.5 px-4 sm:px-6 flex justify-between items-center gap-2">
        <Link href="/" className="inline-flex items-center group" aria-label={isEs ? 'Inicio Rottman M. Mendez' : 'Rottman M. Mendez Home'}>
          <div className="sm:hidden" aria-hidden="true">
            <RottyMLogo variant="full" size={40} animated={true} />
          </div>
          <div className="hidden sm:inline-flex" aria-hidden="true">
            <RottyMLogo variant="full" size={54} animated={true} />
          </div>
        </Link>

        <nav aria-label={isEs ? 'Navegación principal' : 'Primary navigation'} className="hidden lg:flex gap-4 lg:gap-5 xl:gap-6 text-sm font-medium items-center">
          <Link href="/" className="text-slate-600 hover:text-slate-950 dark:text-foreground/80 dark:hover:text-accent transition-colors whitespace-nowrap">
            {isEs ? 'Inicio' : 'Home'}
          </Link>
          <Link href="/services" className="text-slate-600 hover:text-slate-950 dark:text-foreground/80 dark:hover:text-accent transition-colors whitespace-nowrap">
            {isEs ? 'Servicios' : 'Services'}
          </Link>
          <Link href="/packages" className="text-slate-600 hover:text-slate-950 dark:text-foreground/80 dark:hover:text-accent transition-colors whitespace-nowrap">
            {isEs ? 'Paquetes' : 'Packages'}
          </Link>
          <Link href="/portfolio" className="text-slate-600 hover:text-slate-950 dark:text-foreground/80 dark:hover:text-accent transition-colors whitespace-nowrap">
            {isEs ? 'Portafolio' : 'Portfolio'}
          </Link>
          <Link href="/about" className="text-slate-600 hover:text-slate-950 dark:text-foreground/80 dark:hover:text-accent transition-colors whitespace-nowrap">
            {isEs ? 'Acerca' : 'About'}
          </Link>
          <Link href="/resume" className="text-slate-600 hover:text-slate-950 dark:text-foreground/80 dark:hover:text-accent transition-colors whitespace-nowrap">
            {isEs ? 'Currículum' : 'Resume'}
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] dark:hover:text-accent-foreground rounded-lg hover:scale-105 transition-all shadow-sm font-semibold font-mono text-xs uppercase tracking-wider whitespace-nowrap"
          >
            {isEs ? 'Agenda una llamada' : 'Book a call'}
          </Link>

          <div className="inline-flex items-center rounded-lg border border-border bg-card/90 p-1 gap-1 shadow-xs">
            {!hideLangToggle && (
              <>
                <LangToggle embedded />
                <div className="h-4 w-px bg-border" aria-hidden="true" />
              </>
            )}
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
        </nav>

        <div className="flex lg:hidden items-center gap-2 shrink-0">
          {!hideLangToggle && <LangToggle compact />}
          <button
            ref={menuButtonRef}
            className="p-2 -mr-1.5 text-foreground rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={
              mobileMenuOpen
                ? isEs ? 'Cerrar menú' : 'Close menu'
                : isEs ? 'Abrir menú' : 'Open menu'
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu-navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-menu-navigation"
          ref={drawerRef}
          className="lg:hidden glass border-b border-border shadow-2xl animate-in slide-in-from-top duration-300 max-h-[calc(100dvh-4.5rem)] overflow-y-auto"
        >
          <nav aria-label={isEs ? 'Navegación móvil' : 'Mobile navigation'} className="flex flex-col py-5 px-6 space-y-3.5 text-base font-semibold text-center">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">
              {isEs ? 'Inicio' : 'Home'}
            </Link>
            <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">
              {isEs ? 'Servicios' : 'Services'}
            </Link>
            <Link href="/packages" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">
              {isEs ? 'Paquetes' : 'Packages'}
            </Link>
            <Link href="/portfolio" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">
              {isEs ? 'Portafolio' : 'Portfolio'}
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">
              {isEs ? 'Acerca' : 'About'}
            </Link>
            <Link href="/resume" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">
              {isEs ? 'Currículum' : 'Resume'}
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-5 py-2.5 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] dark:hover:text-accent-foreground rounded-lg font-bold font-mono text-xs uppercase tracking-wider text-center inline-flex items-center justify-center shadow-md"
            >
              {isEs ? 'Agenda una llamada' : 'Book a call'}
            </Link>

            <div className="pt-4 mt-2 border-t border-border flex items-center justify-between px-2">
              <span className="text-xs uppercase tracking-wider font-mono font-bold text-muted-foreground">
                {isEs ? 'Tema' : 'Theme'}
              </span>
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-muted border border-border text-xs font-bold text-foreground hover:border-accent transition-all shadow-sm"
                aria-label={isEs ? 'Cambiar tema claro u oscuro' : 'Toggle dark/light theme'}
              >
                {mounted && (resolvedTheme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>{isEs ? 'Modo claro' : 'Light Mode'}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-500" />
                    <span>{isEs ? 'Modo oscuro' : 'Dark Mode'}</span>
                  </>
                ))}
              </button>
            </div>
          </nav>
        </div>
      )}
      <div className="laser-divider opacity-75" />
    </header>
  );
}
