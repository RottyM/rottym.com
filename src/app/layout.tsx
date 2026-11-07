// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Script from 'next/script';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://rottym.com'),
  title: {
    default: 'Rottman M. Mendez | Full-Stack & AI Software Engineer · Reston, VA',
    template: '%s | RottyM · Full-Stack & AI Software Engineer',
  },
  description:
    'High-performance Next.js web applications, AI-augmented cloud platforms, and custom portals for businesses and technical teams in Reston and Northern Virginia. Enterprise full-stack engineering with fixed pricing.',
  keywords: [
    'Full-Stack & AI Software Engineer',
    'AI software engineer Virginia',
    'Reston software engineer',
    'NoVA full stack developer',
    'Next.js developer Virginia',
    'LLM & RAG integration',
    'UI/UX Architecture',
    'WordPress migration specialist',
    'client portal development',
    'custom web applications Reston',
    'React developer DC metro',
    'RottyM',
  ],
  authors: [{ name: 'Rottman M. Mendez', url: 'https://rottym.com' }],
  creator: 'Rottman M. Mendez',
  publisher: 'Rottman M. Mendez',
  openGraph: {
    title: 'Rottman M. Mendez | Full-Stack & AI Software Engineer · Reston, VA',
    description:
      'Building high-performance web applications, custom portals, and AI-augmented platforms with deep UI/UX architecture expertise for Reston & Northern Virginia businesses.',
    url: 'https://rottym.com',
    siteName: 'RottyM · Full Stack & AI Software Engineer',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/portfolio/rottman-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Rottman M. Mendez - Full-Stack & AI Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rottman M. Mendez | Full-Stack & AI Software Engineer · Reston, VA',
    description:
      'Building high-performance web applications, custom portals, and AI-augmented platforms with deep UI/UX architecture expertise for Reston & Northern Virginia businesses.',
    images: ['/images/portfolio/rottman-hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://rottym.com',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'RottyM - Full-Stack & AI Software Engineer',
  image: 'https://rottym.com/images/portfolio/rottman-hero.jpg',
  '@id': 'https://rottym.com',
  url: 'https://rottym.com',
  email: 'rmendez@rottym.com',
  priceRange: '$2,500 - $8,000',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Reston',
    addressRegion: 'VA',
    postalCode: '20190',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 38.9586,
    longitude: -77.357,
  },
  areaServed: [
    { '@type': 'City', name: 'Reston' },
    { '@type': 'City', name: 'Fairfax' },
    { '@type': 'AdministrativeArea', name: 'Northern Virginia' },
    { '@type': 'City', name: 'Tysons' },
    { '@type': 'City', name: 'Herndon' },
    { '@type': 'City', name: 'Ashburn' },
    { '@type': 'City', name: 'Washington DC' },
  ],
  founder: {
    '@type': 'Person',
    name: 'Rottman M. Mendez',
    jobTitle: 'Full-Stack & AI Software Engineer',
    url: 'https://rottym.com',
  },
  knowsAbout: [
    'AI Systems & LLM Orchestration',
    'Next.js',
    'React',
    'TypeScript',
    'UI/UX Architecture',
    'Cloud Architecture (GCP, AWS, Firebase)',
    'WordPress Migration',
    'Client Portals',
    'Full-Stack Web Development',
  ],
  description:
    'High-performance web development, custom client portals, and AI-augmented cloud platforms for businesses in Reston and Northern Virginia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-C0XCJ5TP2M';

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
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-foreground font-bold text-sm"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="min-h-screen transition-colors duration-300">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
