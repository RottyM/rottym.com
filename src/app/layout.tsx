// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/header';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rottman M. Mendez | Full-Stack Developer & UX Designer',
  description: 'Scalable web platforms, WordPress migrations, e-commerce, subscription portals, and digital marketing. Based in Virginia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <Header />
          <div className="min-h-screen transition-colors duration-300">
            {children}
          </div>
          <footer className="bg-card text-foreground border-t border-border py-12 mt-20 transition-all">
            <div className="max-w-7xl mx-auto px-6 text-center text-sm">
              <p className="text-muted-foreground">© {new Date().getFullYear()} Rottman M. Mendez. All rights reserved.</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}