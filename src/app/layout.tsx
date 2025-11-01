// src/app/layout.tsx
// update to force change //
import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rottman Mendez | Full-Stack Developer',
  description: 'Java, React, AWS, WordPress to Modern Apps',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-sky-600">Rottman Mendez</Link>
            <nav className="hidden md:flex gap-8 text-sm font-medium">
              <Link href="/" className="text-slate-700 hover:text-sky-600">Home</Link>
              <Link href="/services" className="text-slate-700 hover:text-sky-600">Services</Link>
              <Link href="/portfolio" className="text-slate-700 hover:text-sky-600">Portfolio</Link>
              <Link href="/about" className="text-slate-700 hover:text-sky-600">About</Link>
              <Link href="/contact" className="text-slate-700 hover:text-sky-600">Contact</Link>
            </nav>
            <button className="md:hidden text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <main>{children}</main>

        <footer className="bg-slate-900 text-white py-12 mt-20">
          <div className="max-w-7xl mx-auto px-6 text-center text-sm">
            <p>© {new Date().getFullYear()} Rottman Mendez. All rights reserved.</p>
            <p className="mt-2">
              <a href="mailto:rottym@gmail.com" className="hover:text-sky-400">rottym@gmail.com</a> · 
              <a href="tel:+17034775169" className="ml-2 hover:text-sky-400">703.477.5169</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}