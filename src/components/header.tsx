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
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm transition-all px-6">
      <div className="max-w-7xl mx-auto py-3.5 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center group pl-1.5 sm:pl-2" aria-label="Rottman M. Mendez Home">
          <RottyMLogo
            variant="full"
            size={46}
            animated={true}
          />
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

        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-muted transition-colors text-foreground/80"
          >
            {mounted && (resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
          </button>
          <button
            className="text-foreground focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden glass border-b border-border shadow-2xl animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col py-6 px-6 space-y-4 text-lg font-medium text-center">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent">Home</Link>
            <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent">Services</Link>
            <Link href="/packages" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent">Packages</Link>
            <Link href="/portfolio" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent">Portfolio</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent">About</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-accent font-bold">Contact</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
