// src/components/Header.tsx
'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Sparkles } from 'lucide-react';
import RottyMLogo from './RottyMLogo';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const getFocusable = (): HTMLElement[] => {
      const items: HTMLElement[] = [];
      if (menuButtonRef.current) items.push(menuButtonRef.current);
      if (drawerRef.current) {
        const nodes = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm transition-all">
      <div className="max-w-7xl mx-auto py-2.5 sm:py-3.5 px-4 sm:px-6 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center group" aria-label="Rottman M. Mendez Home">
          <div className="sm:hidden" aria-hidden="true">
            <RottyMLogo
              variant="full"
              size={42}
              animated={true}
            />
          </div>
          <div className="hidden sm:inline-flex" aria-hidden="true">
            <RottyMLogo
              variant="full"
              size={54}
              animated={true}
            />
          </div>
        </Link>
        <nav aria-label="Primary navigation" className="hidden md:flex gap-4 lg:gap-6 xl:gap-7 text-sm font-medium items-center">
          <Link href="/" className="text-slate-600 hover:text-slate-950 dark:text-foreground/80 dark:hover:text-accent transition-colors whitespace-nowrap">Home</Link>
          <Link href="/services" className="text-slate-600 hover:text-slate-950 dark:text-foreground/80 dark:hover:text-accent transition-colors whitespace-nowrap">Services</Link>
          <Link href="/packages" className="text-slate-600 hover:text-slate-950 dark:text-foreground/80 dark:hover:text-accent transition-colors whitespace-nowrap">Packages</Link>
          <Link href="/portfolio" className="text-slate-600 hover:text-slate-950 dark:text-foreground/80 dark:hover:text-accent transition-colors whitespace-nowrap">Portfolio</Link>
          <Link href="/about" className="text-slate-600 hover:text-slate-950 dark:text-foreground/80 dark:hover:text-accent transition-colors whitespace-nowrap">About</Link>
          <Link href="/resume" className="text-slate-600 hover:text-slate-950 dark:text-foreground/80 dark:hover:text-accent transition-colors whitespace-nowrap">Resume</Link>
          <Link href="/contact" className="inline-flex items-center justify-center px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] dark:hover:text-accent-foreground rounded-lg hover:scale-105 transition-all shadow-sm font-semibold font-mono text-xs uppercase tracking-wider whitespace-nowrap">
            Book a call
          </Link>

          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground/80"
            aria-label={mounted ? `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
          >
            {mounted && (resolvedTheme === 'dark' ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />)}
          </button>
        </nav>

        <div className="flex md:hidden items-center">
          <button
            ref={menuButtonRef}
            className="p-2 -mr-1.5 text-foreground rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu-navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-menu-navigation"
          ref={drawerRef}
          className="md:hidden glass border-b border-border shadow-2xl animate-in slide-in-from-top duration-300 max-h-[calc(100dvh-4.5rem)] overflow-y-auto"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col py-5 px-6 space-y-3.5 text-base font-semibold text-center">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">Home</Link>
            <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">Services</Link>
            <Link href="/packages" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">Packages</Link>
            <Link href="/portfolio" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">Portfolio</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">About</Link>
            <Link href="/resume" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">Resume</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="px-5 py-2.5 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] dark:hover:text-accent-foreground rounded-lg font-bold font-mono text-xs uppercase tracking-wider text-center inline-flex items-center justify-center shadow-md">
              Book a call
            </Link>

            {/* Dedicated Theme Switcher inside Mobile Menu */}
            <div className="pt-4 mt-2 border-t border-border flex items-center justify-between px-2">
              <span className="text-xs uppercase tracking-wider font-mono font-bold text-muted-foreground">Theme</span>
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-muted border border-border text-xs font-bold text-foreground hover:border-accent transition-all shadow-sm"
                aria-label="Toggle dark/light theme"
              >
                {mounted && (resolvedTheme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-500" />
                    <span>Dark Mode</span>
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
