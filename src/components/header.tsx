// src/components/Header.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-sky-600">Rottman M. Mendez</Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="/" className="text-slate-700 hover:text-sky-600">Home</Link>
          <Link href="/services" className="text-slate-700 hover:text-sky-600">Services</Link>
          <Link href="/portfolio" className="text-slate-700 hover:text-sky-600">Portfolio</Link>
          <Link href="/about" className="text-slate-700 hover:text-sky-600">About</Link>
          <Link href="/contact" className="text-slate-700 hover:text-sky-600">Contact</Link>
        </nav>
        <button 
          className="md:hidden text-slate-700 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-lg">
          <nav className="flex flex-col py-4 px-6 space-y-4 text-lg font-medium text-center">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-sky-600">Home</Link>
            <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-sky-600">Services</Link>
            <Link href="/portfolio" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-sky-600">Portfolio</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-sky-600">About</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-sky-600">Contact</Link>
          </nav>
        </div>
      )}
    </header>
  );
}