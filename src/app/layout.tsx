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
  metadataBase: new URL('https://www.rottym.com'),
  title: {
    default: 'Fast, Modern Websites for Northern Virginia Businesses | RottyM',
    template: '%s | RottyM',
  },
  description:
    'Modern websites with real workflows for Northern Virginia — built by an engineer with Disney Streaming, FEMA & FAA experience. From $2,500; you own 100%.',
  keywords: [
    'Northern Virginia small business websites',
    'Reston VA web design',
    'modern websites with workflows',
    'online booking and quote form websites',
    'WordPress migration specialist',
    'client portal development',
    'Next.js developer Virginia',
    'custom web applications Reston',
    'NoVA business websites',
    'RottyM',
  ],
  authors: [{ name: 'Rottman M. Mendez', url: 'https://www.rottym.com' }],
  creator: 'Rottman M. Mendez',
  publisher: 'Rottman M. Mendez',
  openGraph: {
    title: 'RottyM | Fast, Modern Websites for Northern Virginia',
    description:
      'AI can generate a website. It can’t run your business. Fast Next.js sites, booking systems, and client portals for NoVA businesses.',
    url: 'https://www.rottym.com',
    siteName: 'RottyM · Fast, Modern Websites for Northern Virginia',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.rottym.com/og-image.png',
        width: 1200,
        height: 627,
        alt: 'RottyM | Fast, Modern Websites for Northern Virginia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RottyM | Fast, Modern Websites for Northern Virginia',
    description:
      'AI can generate a website. It can’t run your business. Fast Next.js sites, booking systems, and client portals for NoVA businesses.',
    images: ['https://www.rottym.com/og-image.png'],
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
    canonical: 'https://www.rottym.com',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'RottyM — Modern Websites & Real Workflows',
  image: 'https://www.rottym.com/og-image.png',
  '@id': 'https://www.rottym.com',
  url: 'https://www.rottym.com',
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
    url: 'https://www.rottym.com',
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
    'Fast, modern websites with real workflows, online booking, quote forms, and client portals for businesses in Reston and Northern Virginia. Fixed pricing from $2,500.',
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
          <main id="main-content" tabIndex={-1} className="min-h-screen transition-colors duration-300 focus:outline-none">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
