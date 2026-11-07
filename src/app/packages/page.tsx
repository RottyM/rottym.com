// src/app/packages/page.tsx
'use client';
import Link from 'next/link';
import { 
  Rocket, 
  CalendarCheck, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Languages, 
  Bot, 
  Users,
  Clock,
  Check,
  Boxes
} from 'lucide-react';

const packages = [
  {
    id: "local-launchpad",
    name: "Local Launchpad",
    subtitle: "Entry & Most Common",
    price: "$2,500 – $3,500",
    priceNote: "Starting range · Fixed after 15-min call",
    desc: "A clean, fast site built for local service businesses that need to show up and get inquiries.",
    icon: <Rocket className="w-7 h-7" />,
    accent: "text-orange-500",
    accentBg: "bg-orange-500/10",
    borderHover: "hover:border-orange-500/40",
    featured: false,
    included: [
      "5–8 page high-performance site (modern stack or clean WordPress escape)",
      "Mobile-first design and sub-second load times",
      "Contact and quote forms that actually work",
      "Service-area pages for Reston, Fairfax, and surrounding NoVA",
      "Basic local SEO setup and Google Business Profile optimization notes",
      "Short post-launch support window"
    ],
    bestFor: "Restaurants, home services, dental, auto shops, independent professionals.",
    cta: "Start with Local Launchpad",
    href: "/contact?service=local-launchpad"
  },
  {
    id: "booking-intake",
    name: "Booking & Intake",
    subtitle: "Booking & Client Workflows",
    price: "$4,200 – $5,800",
    priceNote: "Starting range · Fixed after 15-min call",
    desc: "Everything in Local Launchpad, plus the tools that reduce back-and-forth and capture more of the work you’re already getting.",
    icon: <CalendarCheck className="w-7 h-7" />,
    accent: "text-accent",
    accentBg: "bg-accent/10",
    borderHover: "hover:border-accent/60",
    featured: true,
    badge: "Most Popular",
    included: [
      "Full Local Launchpad build included",
      "Online booking or structured intake forms",
      "Optional simple client portal or document upload",
      "Cleaner client workflows so your team spends less time on admin",
      "Automated confirmation & notification routing",
      "Priority post-launch support window"
    ],
    bestFor: "Dental offices, salons, home service companies, and professional practices with appointment or form volume.",
    cta: "Add Booking & Intake",
    href: "/contact?service=booking-intake"
  },
  {
    id: "performance-rebuild",
    name: "Performance Rebuild",
    subtitle: "WordPress Escape",
    price: "$3,800 – $6,500",
    priceNote: "Scales with size · Fixed after 15-min call",
    desc: "Move off a slow or bloated WordPress site to a modern stack that loads faster, breaks less, and is easier to maintain.",
    icon: <RefreshCw className="w-7 h-7" />,
    accent: "text-blue-500",
    accentBg: "bg-blue-500/10",
    borderHover: "hover:border-blue-500/40",
    featured: false,
    included: [
      "Full migration from WordPress (or template builder) to modern stack (Vercel + headless CMS)",
      "Complete content, asset, and SEO structure migration",
      "Speed, security, and maintainability focus (95–100 Lighthouse)",
      "Cleaner ownership — you own the code and stack outright",
      "Zero brittle plugins or security vulnerabilities",
      "Dedicated transition and post-launch verification"
    ],
    bestFor: "Businesses that have outgrown their current site and are tired of plugin conflicts, security alerts, and slow mobile performance.",
    cta: "Start a Performance Rebuild",
    href: "/contact?service=performance-rebuild"
  }
];

export default function PackagesPage() {
  return (
    <div className="relative min-h-screen pt-10 pb-24 px-4 md:px-6 overflow-hidden">
      {/* Background Dot-Grid Texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

      {/* Atmospheric Radial Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-accent/15 via-emerald-500/10 to-transparent blur-[130px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-1/2 -left-32 w-[420px] h-[420px] bg-accent/5 rounded-full blur-[110px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-20 relative z-10">

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2.5 glass px-4 py-1.5 rounded-full shadow-md backdrop-blur-md border border-border">
            <Boxes className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="font-mono text-xs text-accent tracking-widest uppercase font-bold">FIXED-SCOPE PACKAGES</span>
            <span className="text-border">|</span>
            <span className="font-mono text-xs text-muted-foreground uppercase">RESTON &amp; NORTHERN VIRGINIA</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
            Local Packages for{" "}
            <span className="tech-gradient-text inline-block pr-2.5">
              Reston &amp; NoVA
            </span>{" "}
            Businesses
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
            High-performance sites and custom tools that actually get used.
          </p>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border inline-block">
            <p className="text-sm md:text-base text-foreground font-semibold">
              Most local projects land between <span className="text-accent font-black">$2,500–$6,500</span>. Price is fixed after a short call.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-accent/20"
            >
              Book a 15-Minute Call <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Intro Manifesto */}
        <div className="max-w-4xl mx-auto glass p-8 md:p-12 rounded-[2.5rem] border border-border space-y-4 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-black text-foreground">
            You don’t need another bloated WordPress site that breaks every time you update a plugin.
          </h2>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
            These packages are built for local businesses that want something faster, cleaner, and easier to own — whether that’s a modern rebuild, online booking, or a straightforward high-performance site that ranks and converts.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-sm font-bold text-foreground">
            <span className="flex items-center gap-2 text-emerald-500">
              <Check className="w-4 h-4" /> 100% Code Ownership
            </span>
            <span className="flex items-center gap-2 text-emerald-500">
              <Check className="w-4 h-4" /> Zero Lock-in
            </span>
            <span className="flex items-center gap-2 text-emerald-500">
              <Check className="w-4 h-4" /> No Surprise Invoices
            </span>
          </div>
        </div>

        {/* 3 Core Packages Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch pt-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              id={pkg.id}
              className={`stitch-card relative !overflow-visible rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-2xl ${pkg.borderHover} ${
                pkg.featured 
                  ? 'border-accent shadow-accent/10 ring-2 ring-accent/20 scale-[1.02] lg:-translate-y-2' 
                  : 'border-border'
              }`}
            >
              {/* Inner Aura with overflow-hidden and border matching rounded corners */}
              <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                <div className="pointer-events-none absolute -right-14 -top-14 w-40 h-40 bg-accent/10 dark:bg-accent/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              </div>

              {pkg.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-accent text-accent-foreground font-mono text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-accent/25 border border-white/20 z-20 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{pkg.badge}</span>
                </div>
              )}

              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-2xl ${pkg.accentBg} ${pkg.accent} flex items-center justify-center shadow-sm`}>
                    {pkg.icon}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground font-mono">
                    {pkg.subtitle}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-foreground">{pkg.name}</h3>
                  <div className="mt-3">
                    <span className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{pkg.price}</span>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{pkg.priceNote}</p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {pkg.desc}
                </p>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground">
                  <strong className="text-foreground font-bold">Best for: </strong>
                  {pkg.bestFor}
                </div>

                <div className="border-t border-border/60 pt-6 space-y-3">
                  <p className="text-xs font-black uppercase tracking-wider text-foreground/80">What&apos;s Included:</p>
                  <ul className="space-y-2.5">
                    {pkg.included.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-foreground/90 leading-snug">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={pkg.href}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all ${
                    pkg.featured
                      ? 'bg-accent text-accent-foreground hover:scale-105 shadow-xl shadow-accent/20'
                      : 'bg-muted hover:bg-accent hover:text-accent-foreground text-foreground'
                  }`}
                >
                  {pkg.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Laser Divider */}
        <div className="laser-divider my-8" />

        {/* Ongoing Care & Optional Add-ons Row */}
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Ongoing Care */}
          <div id="ongoing-care" className="stitch-card p-8 md:p-10 rounded-[2.5rem] shadow-lg flex flex-col justify-between h-full group hover:border-accent/40 transition-all duration-300 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent">
            {/* Chromatic Corner Aura */}
            <div className="pointer-events-none absolute -right-14 -top-14 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-black uppercase tracking-widest font-mono">
                  Optional Add-on
                </span>
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl font-black text-foreground">Ongoing Care</h3>
                <div className="mt-2">
                  <span className="text-3xl font-extrabold text-foreground">$99 – $250</span>
                  <span className="text-muted-foreground font-medium text-sm"> / month</span>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Hosting, monitoring, security, and small updates so the site stays fast and doesn’t become someone else’s problem later.
              </p>

              <ul className="space-y-2.5 border-t border-border/60 pt-6">
                {[
                  "Managed hosting + 24/7 uptime monitoring",
                  "Automated security & platform dependency updates",
                  "Small monthly content, copy, or form updates",
                  "Quarterly performance and SEO audit check",
                  "Optional light AI-assisted content or form optimization",
                  "Can be added to any package above. Cancel anytime."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-foreground/90 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 relative z-10">
              <Link
                href="/contact?service=ongoing-care"
                className="w-full py-4 px-6 rounded-2xl font-black text-base bg-muted hover:bg-accent hover:text-accent-foreground text-foreground flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                Add Ongoing Care <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Optional Add-Ons */}
          <div className="stitch-card p-8 md:p-10 rounded-[2.5rem] shadow-lg flex flex-col justify-between h-full group hover:border-accent/40 transition-all duration-300 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent">
            {/* Chromatic Corner Aura */}
            <div className="pointer-events-none absolute -right-14 -top-14 w-40 h-40 bg-accent/10 dark:bg-accent/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-black uppercase tracking-widest font-mono">
                  Custom Modules
                </span>
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl font-black text-foreground">Optional Add-Ons</h3>
                <p className="text-muted-foreground text-sm mt-1">Layer these onto any package above to fit your exact operational needs.</p>
              </div>

              <div className="space-y-4 border-t border-border/60 pt-6">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent shrink-0">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-sm">Bilingual (Spanish) Key Pages &amp; Forms</h4>
                      <span className="text-xs font-black text-accent ml-2">+$500 – $950</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Native Spanish translation and localized intake forms for Northern Virginia&apos;s diverse audience.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-sm">Custom AI Workflow or Automation</h4>
                      <span className="text-xs font-black text-purple-500 ml-2">Scoped After Call</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automated lead routing, LLM customer triage, or internal workflow automation connected to your inbox or CRM.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-sm">Membership or Community Features</h4>
                      <span className="text-xs font-black text-pink-500 ml-2">Scoped Separately</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Gated member portals, subscription access, or community tools derived from established club platforms.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/contact"
                className="w-full py-4 px-6 rounded-2xl font-black text-base bg-muted hover:bg-accent hover:text-accent-foreground text-foreground flex items-center justify-center gap-2 transition-all"
              >
                Discuss Custom Modules <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Laser Divider */}
        <div className="laser-divider my-16" />

        {/* Bottom Note & Final Call to Action */}
        <div className="p-10 md:p-14 rounded-[3rem] bg-accent text-accent-foreground relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Ready to see what fits?
            </h2>
            <p className="text-xl md:text-2xl font-bold opacity-95">
              Most Reston and Northern Virginia projects land between $2,500 and $6,500.
            </p>
            <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
              The number you get after a short discovery call is the exact number you’re billed. No ranges that turn into surprise invoices.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-accent-foreground text-accent px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-2xl"
              >
                Book a 15-Minute Call <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact?intent=secure-spot"
                className="inline-flex items-center gap-2 bg-accent/20 hover:bg-accent/30 text-accent-foreground border border-accent-foreground/30 px-8 py-5 rounded-2xl font-bold text-lg transition-all"
              >
                Secure Your Spot
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

