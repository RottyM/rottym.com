// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rottman M. Mendez | Full-Stack Developer & UX Designer',
  description: 'Scalable web platforms, WordPress migrations, e-commerce, subscription portals, and digital marketing. Based in Virginia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
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