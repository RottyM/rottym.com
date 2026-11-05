// src/components/footer.tsx
import Link from 'next/link';
import { Mail, MapPin, ArrowRight, ShieldCheck, Sparkles, Code2, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card text-foreground border-t border-border mt-24 transition-colors">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* Brand & Positioning Column (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3.5 group" aria-label="RottyM Home">
              {/* Logo: RM Monogram */}
              <svg viewBox="6.5 8 30.5 27" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-11 w-auto shrink-0 group-hover:scale-105 transition-transform duration-500">
                <path d="M8 10H16C20.4183 10 24 13.5817 24 18V24H18V18C18 16.8954 17.1046 16 16 16H14V34H8V10Z" fill="url(#footer_paint0)" />
                <path d="M22 20L32 34H25L18 24H24V20H22Z" fill="url(#footer_paint1)" />
                <path d="M26 10L30 16L34 10" stroke="url(#footer_paint2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="footer_paint0" x1="8" y1="10" x2="24" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="var(--accent)" />
                    <stop offset="1" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="footer_paint1" x1="18" y1="20" x2="32" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="var(--accent)" />
                  </linearGradient>
                  <linearGradient id="footer_paint2" x1="26" y1="10" x2="34" y2="10" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10b981" />
                    <stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col justify-center">
                <span className="text-2xl font-black tracking-tight text-foreground leading-none group-hover:text-accent transition-colors">RottyM</span>
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mt-1.5 leading-none">Full Stack &amp; AI Software Engineer</span>
              </div>
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm font-medium">
              Building high-performance Next.js sites, custom client portals, and WordPress escape rebuilds for growing businesses in Reston and Northern Virginia.
            </p>

            <div className="space-y-2 text-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/70 rounded-full text-foreground/80 font-semibold border border-border/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Booking 2026 projects and beyond</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground pt-1">
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Reston, VA · Serving Northern Virginia &amp; Remote Clients</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Navigation</h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-accent transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-accent transition-colors">Services</Link>
              </li>
              <li>
                <Link href="/packages" className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5">
                  Packages &amp; Pricing
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-accent/10 text-accent rounded">New</span>
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-muted-foreground hover:text-accent transition-colors">Selected Work</Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-accent transition-colors">About Rottman</Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-accent transition-colors">Book a Discovery Call</Link>
              </li>
            </ul>
          </div>

          {/* SEO Solutions & Packages Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Solutions</h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/packages#local-launchpad" className="text-muted-foreground hover:text-accent transition-colors">
                  Local Launchpad ($2.5k–$3.5k)
                </Link>
              </li>
              <li>
                <Link href="/packages#booking-intake" className="text-muted-foreground hover:text-accent transition-colors">
                  Booking &amp; Client Intake
                </Link>
              </li>
              <li>
                <Link href="/packages#performance-rebuild" className="text-muted-foreground hover:text-accent transition-colors">
                  WordPress Escape Rebuild
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-accent transition-colors">
                  Client Portals &amp; Member Hubs
                </Link>
              </li>
              <li>
                <Link href="/packages#ongoing-care" className="text-muted-foreground hover:text-accent transition-colors">
                  Ongoing Care &amp; Cloud Hosting
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-accent transition-colors">
                  AI Integrations &amp; Automation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Service Areas Column */}
          <div className="space-y-4">
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
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-xs font-bold hover:scale-105 transition-all shadow-md mt-2"
              >
                Schedule Discovery Call <ArrowRight className="w-3.5 h-3.5" />
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
              <ShieldCheck className="w-3.5 h-3.5 text-accent" /> 100% Code Ownership
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> Zero Vendor Lock-in
            </span>
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-accent" /> Enterprise Modern Stack
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

