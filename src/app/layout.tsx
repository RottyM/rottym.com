import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rottman M. Mendez | Full-Stack Developer & UX Designer',
  description: 'Experienced in Java, React, AWS. WordPress migrations, e-commerce, subscriptions, social portals, digital marketing. Disney, FAA, USA Today.',
  // From your resume
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}