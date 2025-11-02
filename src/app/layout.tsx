// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rottman M. Mendez | Full-Stack Developer & UX Designer',
  description: 'Scalable web platforms, WordPress migrations, e-commerce, subscription portals, and digital marketing. Based in Virginia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-sky-600">Rottman M. Mendez</Link>
            <nav className="hidden md:flex gap-8 text-sm font-medium">
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
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 shadow-lg">
            <nav className="flex flex-col py-4 px-6 space-y-4 text-lg font-medium text-center">
              <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-sky-600">Services</Link>
              <Link href="/portfolio" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-sky-600">Portfolio</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-sky-600">About</Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-sky-600">Contact</Link>
            </nav>
          </div>
        )}

        <main>{children}</main>

        <footer className="bg-slate-900 text-white py-12 mt-20">
          <div className="max-w-7xl mx-auto px-6 text-center text-sm">
            <p>© {new Date().getFullYear()} Rottman M. Mendez. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}