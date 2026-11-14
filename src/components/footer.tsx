// src/components/footer.tsx
import Link from 'next/link';
import { Mail, MapPin, ArrowRight, ShieldCheck, LockOpen, CheckCircle2, CalendarCheck } from 'lucide-react';
import RottyMLogo from './RottyMLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-card text-foreground border-t border-slate-200 dark:border-border mt-24 transition-colors">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* Brand & Positioning Column (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center group" aria-label="RottyM Home">
              <RottyMLogo
                variant="full"
                size={46}
                animated={true}
              />
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm font-medium">
              Building high-performance Next.js sites, custom client portals, and WordPress escape rebuilds for growing businesses in Reston and Northern Virginia.
            </p>

            <div className="space-y-2 text-xs">
              <div className="inline-flex items-center gap-2 glass px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-lg shadow-sm border border-border max-w-full">
                <CalendarCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">AVAILABILITY</span>
                <span className="text-border" aria-hidden="true">|</span>
                <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap">ACCEPTING PROJECTS</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground pt-1">
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Reston, VA · Serving Northern Virginia &amp; Remote Clients</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4 md:pt-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Navigation</h3>
            <ul className="space-y-1 text-sm font-medium">
              <li>
                <Link href="/" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/services" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">Services</Link>
              </li>
              <li>
                <Link href="/packages" className="inline-flex items-center gap-1.5 min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  Packages &amp; Pricing
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-accent/10 text-accent rounded">New</span>
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">Selected Work</Link>
              </li>
              <li>
                <Link href="/about" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">About Rottman</Link>
              </li>
              <li>
                <Link href="/resume" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">Resume</Link>
              </li>
              <li>
                <Link href="/contact" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">Book a free 30-minute call</Link>
              </li>
            </ul>
          </div>

          {/* SEO Solutions & Packages Links */}
          <div className="space-y-4 md:pt-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Solutions</h3>
            <ul className="space-y-1 text-sm font-medium">
              <li>
                <Link href="/packages#local-launchpad" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  Local Launchpad ($2.5k–$3.5k)
                </Link>
              </li>
              <li>
                <Link href="/packages#booking-intake" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  Booking &amp; Client Intake
                </Link>
              </li>
              <li>
                <Link href="/packages#performance-rebuild" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  WordPress Escape Rebuild
                </Link>
              </li>
              <li>
                <Link href="/services" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  Client Portals &amp; Member Hubs
                </Link>
              </li>
              <li>
                <Link href="/packages#ongoing-care" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  Ongoing Care &amp; Cloud Hosting
                </Link>
              </li>
              <li>
                <Link href="/services" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  AI Integrations &amp; Automation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Service Areas Column */}
          <div className="space-y-4 md:pt-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Get In Touch</h3>
            <div className="space-y-3 text-sm">
              <a 
                href="mailto:rmendez@rottym.com" 
                className="inline-flex items-center gap-2 text-foreground font-semibold hover:text-accent transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <span>rmendez@rottym.com</span>
              </a>

              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                Have a project or migration in mind? Let&apos;s talk scope and fixed pricing.
              </p>

              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg text-xs font-bold hover:scale-105 transition-all shadow-md mt-2"
              >
                Book a free 30-minute call <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Local Service Areas</p>
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                Reston · Fairfax · Tysons · Herndon · Ashburn · Arlington · Alexandria · Washington, D.C.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar: Copyright & Guarantees */}
      <div className="border-t border-border/60 bg-muted/20 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} Rottman M. Mendez. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" /> You own 100% of it
            </span>
            <span className="flex items-center gap-1.5">
              <LockOpen className="w-3.5 h-3.5 text-accent" /> No lock-in
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

