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
    default: 'Rottman M. Mendez | Full-Stack Web Developer & UX Designer · Reston, VA',
    template: '%s | RottyM · Reston, VA',
  },
  description:
    'High-performance Next.js websites, custom client portals, and WordPress migrations for businesses in Reston, Fairfax, and Northern Virginia. Enterprise-grade full-stack engineering with fixed pricing.',
  keywords: [
    'Reston web developer',
    'Northern Virginia web development',
    'NoVA full stack developer',
    'WordPress migration specialist',
    'Next.js developer Virginia',
    'client portal development',
    'custom web applications Reston',
    'React developer DC metro',
    'local business website design NoVA',
    'RottyM',
  ],
  authors: [{ name: 'Rottman M. Mendez', url: 'https://rottym.com' }],
  creator: 'Rottman M. Mendez',
  publisher: 'Rottman M. Mendez',
  openGraph: {
    title: 'Rottman M. Mendez | Full-Stack Web Developer & UX Designer · Reston, VA',
    description:
      'Building fast, modern sites that replace slow WordPress. Fixed-price web development and custom client portals for Reston & Northern Virginia businesses.',
    url: 'https://rottym.com',
    siteName: 'RottyM · Full Stack & AI Software Engineer',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/portfolio/rottman-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Rottman M. Mendez - Full-Stack Developer & UX Designer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rottman M. Mendez | Full-Stack Web Developer · Reston, VA',
    description:
      'Building fast, modern sites that replace slow WordPress. Fixed-price web development and client portals for Reston & Northern Virginia businesses.',
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
  name: 'RottyM - Full-Stack Developer & UX Designer',
  image: 'https://rottym.com/images/portfolio/rottman-hero.jpg',
  '@id': 'https://rottym.com',
  url: 'https://rottym.com',
  email: 'rmendez@rottym.com',
  priceRange: '$3,500 - $15,000',
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
    jobTitle: 'Full-Stack Software Engineer & UX Designer',
    url: 'https://rottym.com',
  },
  knowsAbout: [
    'Next.js',
    'React',
    'TypeScript',
    'WordPress Migration',
    'Client Portals',
    'Cloud Architecture',
    'UX Design',
    'Full-Stack Web Development',
  ],
  description:
    'High-performance web development, custom client portals, and WordPress escape rebuilds for businesses in Reston and Northern Virginia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

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
          <Header />
          <div className="min-h-screen transition-colors duration-300">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
