// src/components/Header.tsx
'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Sparkles } from 'lucide-react';
import RottyMLogo from './RottyMLogo';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm transition-all">
      <div className="max-w-7xl mx-auto py-2.5 sm:py-3.5 px-4 sm:px-6 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center group" aria-label="Rottman M. Mendez Home">
          <div className="sm:hidden">
            <RottyMLogo
              variant="full"
              size={42}
              animated={true}
            />
          </div>
          <div className="hidden sm:inline-flex">
            <RottyMLogo
              variant="full"
              size={54}
              animated={true}
            />
          </div>
        </Link>
        <nav className="hidden md:flex gap-7 text-sm font-medium items-center">
          <Link href="/" className="text-foreground/80 hover:text-accent transition-colors">Home</Link>
          <Link href="/services" className="text-foreground/80 hover:text-accent transition-colors">Services</Link>
          <Link href="/packages" className="text-foreground/80 hover:text-accent transition-colors">Packages</Link>
          <Link href="/portfolio" className="text-foreground/80 hover:text-accent transition-colors">Portfolio</Link>
          <Link href="/about" className="text-foreground/80 hover:text-accent transition-colors">About</Link>
          <Link href="/contact" className="px-4 py-2 bg-accent text-accent-foreground rounded-full hover:scale-105 transition-transform shadow-md font-semibold">Contact</Link>

          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-muted transition-colors text-foreground/80"
            aria-label="Toggle theme"
          >
            {mounted && (resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
          </button>
        </nav>

        <div className="flex md:hidden items-center">
          <button
            className="p-2 -mr-1.5 text-foreground focus:outline-none rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden glass border-b border-border shadow-2xl animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col py-5 px-6 space-y-3.5 text-base font-semibold text-center">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">Home</Link>
            <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">Services</Link>
            <Link href="/packages" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">Packages</Link>
            <Link href="/portfolio" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">Portfolio</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent py-1 transition-colors">About</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="px-5 py-2.5 bg-accent text-accent-foreground rounded-xl font-bold text-center inline-block shadow-md">Contact</Link>

            {/* Dedicated Theme Switcher inside Mobile Menu */}
            <div className="pt-4 mt-2 border-t border-border flex items-center justify-between px-2">
              <span className="text-xs uppercase tracking-wider font-mono font-bold text-muted-foreground">Theme</span>
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted border border-border text-xs font-bold text-foreground hover:border-accent transition-all shadow-sm"
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
