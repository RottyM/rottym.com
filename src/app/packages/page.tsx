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
    <div className="relative min-h-screen pt-10 pb-24 overflow-hidden">
      {/* Background Dot-Grid Texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

      {/* Atmospheric Radial Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-accent/15 via-emerald-500/10 to-transparent blur-[130px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-1/2 -left-32 w-[420px] h-[420px] bg-accent/5 rounded-full blur-[110px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 space-y-20 relative z-10">

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 glass px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-sm backdrop-blur-md border border-border max-w-full">
            <Boxes className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent shrink-0" />
            <span className="font-mono text-[9px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">FIXED-SCOPE PACKAGES</span>
            <span className="text-border">|</span>
            <span className="font-mono text-[9px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap hidden sm:inline">RESTON &amp; NORTHERN VIRGINIA</span>
            <span className="font-mono text-[9px] text-muted-foreground uppercase whitespace-nowrap sm:hidden">RESTON &amp; NOVA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
            Local Packages for{" "}
            <span className="tech-gradient-text inline-block pr-2.5">
              Reston &amp; NoVA
            </span>{" "}
            Businesses
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
            High-performance sites and custom tools that actually get used.
          </p>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/40 border border-border inline-block">
            <p className="text-xs sm:text-base text-foreground font-semibold">
              Most local projects land between <span className="text-accent font-black">$2,500–$6,500</span>. Price is fixed after a short call.
            </p>
          </div>

          <div className="pt-1">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-bold font-mono text-xs sm:text-sm hover:scale-[1.02] transition-all shadow-md shadow-black/10 dark:shadow-accent/20 w-full sm:w-auto border border-[#090D16] dark:border-transparent"
            >
              <span>Book a 15-Minute Call</span> <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D8F6] dark:text-current" />
            </Link>
          </div>
        </div>

        {/* Intro Manifesto */}
        <div className="max-w-4xl mx-auto glass p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2.5rem] border border-border space-y-4 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-black text-foreground">
            You don’t need another bloated WordPress site that breaks every time you update a plugin.
          </h2>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
            These packages are built for local businesses that want something faster, cleaner, and easier to own — whether that’s a modern rebuild, online booking, or a straightforward high-performance site that ranks and converts.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-sm font-bold text-foreground">
            <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 100% Code Ownership
            </span>
            <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Zero Lock-in
            </span>
            <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> No Surprise Invoices
            </span>
          </div>
        </div>

        {/* 3 Core Packages Grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              id={pkg.id}
              className={`stitch-card relative !overflow-visible rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-2xl ${pkg.borderHover} ${
                pkg.featured 
                  ? 'border-accent shadow-accent/10 ring-2 ring-accent/20 scale-[1.01] lg:-translate-y-2' 
                  : 'border-border'
              }`}
            >
              {/* Inner Aura with overflow-hidden and border matching rounded corners */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-[2.5rem] overflow-hidden pointer-events-none">
                <div className="pointer-events-none absolute -right-14 -top-14 w-40 h-40 bg-accent/10 dark:bg-accent/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              </div>

              {pkg.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 rounded-full bg-accent text-accent-foreground font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest shadow-md shadow-accent/25 border border-white/20 z-20 whitespace-nowrap">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{pkg.badge}</span>
                </div>
              )}

              <div className="space-y-5 sm:space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${pkg.accentBg} ${pkg.accent} flex items-center justify-center shadow-sm`}>
                    {pkg.icon}
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground font-mono">
                    {pkg.subtitle}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground">{pkg.name}</h3>
                  <div className="mt-2 sm:mt-3">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{pkg.price}</span>
                    <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-1">{pkg.priceNote}</p>
                  </div>
                </div>

                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {pkg.desc}
                </p>

                <div className="p-3 sm:p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground">
                  <strong className="text-foreground font-bold">Best for: </strong>
                  {pkg.bestFor}
                </div>

                <div className="border-t border-border/60 pt-5 sm:pt-6 space-y-3">
                  <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-foreground/80">What&apos;s Included:</p>
                  <ul className="space-y-2 sm:space-y-2.5">
                    {pkg.included.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-2.5 text-xs md:text-sm text-foreground/90 leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 sm:pt-8 relative z-10">
                <Link
                  href={pkg.href}
                  className={`w-full py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold font-mono text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    pkg.featured
                      ? 'bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground hover:scale-[1.02] shadow-md shadow-black/10 dark:shadow-accent/20 border border-[#090D16] dark:border-transparent'
                      : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-sm dark:glass dark:text-foreground dark:border-border dark:hover:bg-muted'
                  }`}
                >
                  <span>{pkg.cta}</span> <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D8F6] dark:text-current" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Laser Divider */}
        <div className="laser-divider my-8" />

        {/* Ongoing Care & Optional Add-ons Row */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* Ongoing Care */}
          <div id="ongoing-care" className="stitch-card p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-md flex flex-col justify-between h-full group hover:border-accent/40 transition-all duration-300 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent">
            {/* Chromatic Corner Aura */}
            <div className="pointer-events-none absolute -right-14 -top-14 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="space-y-5 sm:space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="px-2.5 sm:px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest font-mono">
                  Optional Add-on
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground">Ongoing Care</h3>
                <div className="mt-1 sm:mt-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-foreground">$99 – $250</span>
                  <span className="text-muted-foreground font-medium text-xs sm:text-sm"> / month</span>
                </div>
              </div>

              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Hosting, monitoring, security, and small updates so the site stays fast and doesn’t become someone else’s problem later.
              </p>

              <ul className="space-y-2 sm:space-y-2.5 border-t border-border/60 pt-5 sm:pt-6">
                {[
                  "Managed hosting + 24/7 uptime monitoring",
                  "Automated security & platform dependency updates",
                  "Small monthly content, copy, or form updates",
                  "Quarterly performance and SEO audit check",
                  "Optional light AI-assisted content or form optimization",
                  "Can be added to any package above. Cancel anytime."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 sm:gap-2.5 text-xs md:text-sm text-foreground/90 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 sm:pt-8 relative z-10">
              <Link
                href="/contact?service=ongoing-care"
                className="w-full py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold font-mono text-xs sm:text-sm bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-sm dark:glass dark:text-foreground dark:border-border dark:hover:bg-muted flex items-center justify-center gap-2 transition-all"
              >
                <span>Add Ongoing Care</span> <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D8F6] dark:text-current" />
              </Link>
            </div>
          </div>

          {/* Optional Add-Ons */}
          <div className="stitch-card p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-md flex flex-col justify-between h-full group hover:border-accent/40 transition-all duration-300 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent">
            {/* Chromatic Corner Aura */}
            <div className="pointer-events-none absolute -right-14 -top-14 w-40 h-40 bg-accent/10 dark:bg-accent/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="space-y-5 sm:space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="px-2.5 sm:px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest font-mono">
                  Custom Modules
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground">Optional Add-Ons</h3>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">Layer these onto any package above to fit your exact operational needs.</p>
              </div>

              <div className="space-y-3 sm:space-y-4 border-t border-border/60 pt-5 sm:pt-6">
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-accent/10 text-accent shrink-0">
                    <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-xs sm:text-sm">Bilingual (Spanish) Key Pages &amp; Forms</h4>
                      <span className="text-[11px] sm:text-xs font-black text-accent ml-2">+$500 – $950</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                      Native Spanish translation and localized intake forms for Northern Virginia&apos;s diverse audience.
                    </p>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-xs sm:text-sm">Custom AI Workflow or Automation</h4>
                      <span className="text-[11px] sm:text-xs font-black text-purple-500 ml-2">Scoped After Call</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                      Automated lead routing, LLM customer triage, or internal workflow automation connected to your inbox or CRM.
                    </p>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-pink-500/10 text-pink-500 shrink-0">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-xs sm:text-sm">Membership or Community Features</h4>
                      <span className="text-[11px] sm:text-xs font-black text-pink-500 ml-2">Scoped Separately</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                      Gated member portals, subscription access, or community tools derived from established club platforms.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 sm:pt-8 relative z-10">
              <Link
                href="/contact"
                className="w-full py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold font-mono text-xs sm:text-sm bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-sm dark:glass dark:text-foreground dark:border-border dark:hover:bg-muted flex items-center justify-center gap-2 transition-all"
              >
                <span>Discuss Custom Modules</span> <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D8F6] dark:text-current" />
              </Link>
            </div>
          </div>

        </div>

        {/* Laser Divider */}
        <div className="laser-divider my-10 sm:my-16" />

        {/* Bottom Note & Final Call to Action */}
        <div className="p-6 sm:p-10 md:p-14 rounded-2xl sm:rounded-[3rem] bg-[#090D16] text-white dark:bg-accent dark:text-accent-foreground relative overflow-hidden shadow-2xl border border-slate-800 dark:border-transparent">
          <div className="absolute inset-0 bg-dot-grid opacity-15 pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center space-y-5 sm:space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-black/20 border border-white/20 dark:border-black/20 text-xs font-mono font-bold uppercase tracking-wider text-[#00D8F6] dark:text-accent-foreground">
              <span className="w-2 h-2 rounded-full bg-[#00D8F6] dark:bg-accent-foreground animate-ping" />
              DIRECT SCOPING &amp; PROPOSAL
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Ready to see what fits?
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl font-bold opacity-95 text-[#00D8F6] dark:text-inherit">
              Most Reston and Northern Virginia projects land between $2,500 and $6,500.
            </p>
            <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl mx-auto leading-relaxed text-slate-300 dark:text-inherit">
              The number you get after a short discovery call is the exact number you’re billed. No ranges that turn into surprise invoices.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[#00D8F6] hover:bg-[#00F2FE] text-[#090D16] dark:bg-accent-foreground dark:text-accent px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-bold font-mono text-xs sm:text-sm hover:scale-105 transition-transform shadow-xl"
              >
                <span>Book a 15-Minute Call</span> <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact?intent=secure-spot"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 dark:bg-accent/20 dark:hover:bg-accent/30 dark:text-accent-foreground dark:border-accent-foreground/30 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-bold font-mono text-xs sm:text-sm transition-all"
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

