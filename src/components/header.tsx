// src/components/Header.tsx
'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Sparkles } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group transition-all" aria-label="Rottman M. Mendez Home">
          {/* Logo: RM Monogram - Geometric & Gradient */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-105 transition-transform duration-500">
            <path d="M8 10H16C20.4183 10 24 13.5817 24 18V24H18V18C18 16.8954 17.1046 16 16 16H14V34H8V10Z" fill="url(#paint0_linear)" />
            <path d="M22 20L32 34H25L18 24H24V20H22Z" fill="url(#paint1_linear)" />
            <path d="M26 10L30 16L34 10" stroke="url(#paint2_linear)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="paint0_linear" x1="8" y1="10" x2="24" y2="34" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--accent)" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="paint1_linear" x1="18" y1="20" x2="32" y2="34" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="var(--accent)" />
              </linearGradient>
              <linearGradient id="paint2_linear" x1="26" y1="10" x2="34" y2="10" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10b981" />
                <stop offset="1" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col justify-center">
            <span className="text-xl font-black tracking-tight text-foreground leading-none group-hover:text-accent transition-colors">RottyM</span>
            <span className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground leading-none uppercase">Vibe Engineer</span>
          </div>
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium items-center">
          <Link href="/" className="text-foreground/80 hover:text-accent transition-colors">Home</Link>
          <Link href="/services" className="text-foreground/80 hover:text-accent transition-colors">Services</Link>
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
            <Link href="/portfolio" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent">Portfolio</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-accent">About</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-accent font-bold">Contact</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
