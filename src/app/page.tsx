// src/app/page.tsx
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Rocket, Zap, Globe, Cpu, Sparkles, Users, Braces, CalendarCheck, Workflow, Boxes, Layers, Compass, Phone } from 'lucide-react';
import { HeroQuoteDeck, ClientProofSpotlight } from '@/components/TestimonialShowcases';

export default function Home() {
  /* Disabled first-visit Strategic Consultation pop-up for now (keep for later reuse)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!localStorage.getItem('audit-shown')) {
        const popup = document.createElement('div');
        popup.innerHTML = `
          <div style="position:fixed;bottom:24px;right:24px;background:var(--card);color:var(--foreground);padding:28px;border-radius:24px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);max-width:340px;z-index:9999;border:1px solid var(--border);backdrop-filter:blur(12px);">
            <div style="position:absolute;top:12px;right:12px;">
              <button onclick="this.parentElement.parentElement.remove();localStorage.setItem('audit-shown','true')" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--muted-foreground);opacity:0.6;transition:opacity 0.2s;">×</button>
            </div>
            <h3 style="margin:0 0 10px;font-size:1.4rem;font-weight:900;tracking-tight;color:var(--accent);">Strategic Consultation</h3>
            <p style="margin:0 0 20px;font-size:0.95rem;line-height:1.6;color:var(--muted-foreground);font-weight:500;">Schedule a focused 15-minute consultation to review your platform architecture and project requirements.</p>
            <a href="/contact" style="display:block;background:var(--accent);color:var(--accent-foreground);padding:14px 24px;border-radius:14px;text-decoration:none;font-weight:800;text-align:center;font-size:1rem;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);transition:transform 0.2s;">Claim Your Consult →</a>
          </div>
        `;
        document.body.appendChild(popup);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  */

  const clientLogos = [
    {
      name: 'Disney',
      whiteSrc: '/images/logos/clients/disney-white.svg',
      stdSrc: '/images/logos/clients/disney.svg',
      heightClass: 'h-7 sm:h-8 md:h-9',
      maxWidth: 'max-w-[110px] sm:max-w-[130px]'
    },
    {
      name: 'FEMA',
      whiteSrc: '/images/logos/clients/fema-dark.svg',
      stdSrc: '/images/logos/clients/fema.svg',
      heightClass: 'h-8 sm:h-9 md:h-10',
      maxWidth: 'max-w-[115px] sm:max-w-[135px]'
    },
    {
      name: 'BAE Systems',
      whiteSrc: '/images/logos/clients/bae-systems-white.svg',
      stdSrc: '/images/logos/clients/bae-systems.svg',
      heightClass: 'h-5 sm:h-6 md:h-7',
      maxWidth: 'max-w-[130px] sm:max-w-[155px]'
    },
    {
      name: 'FAA',
      whiteSrc: '/images/logos/clients/faa-dark.svg',
      stdSrc: '/images/logos/clients/faa.svg',
      heightClass: 'h-8 sm:h-9 md:h-10',
      maxWidth: 'max-w-[115px] sm:max-w-[135px]'
    },
    {
      name: 'Leidos',
      whiteSrc: '/images/logos/clients/leidos-white.svg',
      stdSrc: '/images/logos/clients/leidos.svg',
      heightClass: 'h-6 sm:h-7 md:h-8',
      maxWidth: 'max-w-[115px] sm:max-w-[135px]'
    },
    {
      name: 'USA Today',
      whiteSrc: '/images/logos/clients/usa-today-white.svg',
      stdSrc: '/images/logos/clients/usa-today.svg',
      heightClass: 'h-5 sm:h-6 md:h-7',
      maxWidth: 'max-w-[130px] sm:max-w-[155px]'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-10 pb-6 sm:pb-8 md:pb-10 overflow-hidden">
        {/* Architectural / Console Dot-Grid Texture */}
        <div className="absolute inset-0 bg-dot-grid opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -z-10 w-2/3 h-full bg-gradient-to-l from-accent/15 via-blue-500/10 to-transparent blur-3xl opacity-60 transition-colors" />
        <div className="absolute -top-24 -left-24 -z-10 w-[28rem] h-[28rem] bg-gradient-to-br from-sky-500/10 dark:from-emerald-500/10 via-accent/5 to-transparent rounded-full blur-3xl animate-pulse-soft transition-colors" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8 lg:gap-14 items-start w-full">
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4 sm:space-y-5"
          >
            <div className="inline-flex items-center gap-1.5 sm:gap-2 glass px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-sm backdrop-blur-md border border-border max-w-full">
              <span className="font-mono text-[9px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">
                Serving Northern Virginia and Beyond
              </span>
              <span className="text-border hidden sm:inline" aria-hidden="true">·</span>
              <span className="font-mono text-[9px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap hidden sm:inline">
                Reston, VA
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-[1.12] tracking-tight drop-shadow-sm">
              A fast website that turns local searches into{" "}
              <span className="tech-gradient-text">new customers.</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">
              AI can generate a website. It can&apos;t run your business.
            </p>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl font-medium">
              I build fast, modern websites for any Northern Virginia business that needs one — restaurants, contractors, authors, shops, nonprofits, you name it — with online booking, quote forms, and custom workflows included.{" "}
              <strong className="text-foreground font-bold">From $2,500, and you own 100% of it.</strong>
            </p>

            {/* Trust Quote Switcher */}
            <HeroQuoteDeck />

            {/* CTAs Row */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 w-full">
              <Link
                href="/contact"
                className="group flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] dark:hover:text-accent-foreground px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg font-bold font-mono text-xs sm:text-sm hover:scale-[1.02] transition-all shadow-md shadow-black/10 dark:shadow-accent/20 border border-[#090D16] dark:border-transparent"
              >
                <span>Book a free 30-minute call</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D8F6] dark:text-current group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:2028540954"
                className="flex items-center justify-center gap-2.5 bg-accent/15 hover:bg-accent/25 text-foreground border border-accent dark:border-accent/70 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg font-mono text-xs sm:text-sm font-bold transition-all shadow-sm group"
                aria-label="Call (202) 854-0954"
              >
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <div className="text-left leading-tight">
                  <div className="font-bold text-accent dark:text-[#00F2FE]">(202) 854-0954</div>
                  <div className="text-[9px] sm:text-[10px] text-slate-700 dark:text-slate-300 font-sans font-medium tracking-normal">
                    Direct line · Tap to call
                  </div>
                </div>
              </a>
            </div>

            {/* Note below CTAs */}
            <p className="font-mono text-xs sm:text-[12.5px] text-muted-foreground pt-1 leading-relaxed">
              <strong className="text-foreground font-bold">From $2,500</strong> · No runaway hourly billing
              <span className="hidden sm:inline">
                {" "}· <strong className="text-accent font-bold">Prefer to talk?</strong> Call directly via the button above.
              </span>
            </p>
          </motion.div>

          <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
            {/* Ambient Corner Glow */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent/20 dark:bg-accent/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Browser Frame */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1424]">
              {/* Browser Window Bar */}
              <div
                aria-hidden="true"
                className="flex items-center justify-between px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800"
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex items-center justify-center flex-1 max-w-[220px] sm:max-w-[260px] mx-auto px-3 py-0.5 rounded-md bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-inner">
                  <span className="font-mono text-[10px] sm:text-[11px] text-muted-foreground truncate">
                    rottym.com/portfolio
                  </span>
                </div>
                <div className="w-10 shrink-0" />
              </div>

              {/* Portfolio Showcase Header */}
              <div className="p-4 sm:p-5 pb-2 sm:pb-3 space-y-1 bg-gradient-to-b from-slate-50/50 to-white dark:from-[#0d1627] dark:to-[#0a111e]">
                <p className="font-mono text-[10.5px] font-bold tracking-wider uppercase text-accent dark:text-[#00F2FE]">
                  Real work · Real businesses
                </p>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  Websites for <span className="text-accent dark:text-[#00F2FE]">every kind</span> of business.
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-normal">
                  Authors, archives, a writers club, a storefront, a motorcycle platform — if it needs a website, it belongs here.
                </p>
              </div>

              {/* Work List */}
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 space-y-2 bg-white dark:bg-[#0c1424]">
                {[
                  {
                    monogram: 'NV',
                    bg: 'bg-[#0e7a4f]',
                    title: 'Northern Virginia Writers Club',
                    subtitle: 'Nonprofit / membership platform',
                    href: '/portfolio/northern-virginia-writers',
                  },
                  {
                    monogram: 'FA',
                    bg: 'bg-[#28536b]',
                    title: 'Found Archives',
                    subtitle: 'Archives & research business',
                    href: '/portfolio/found-archives',
                  },
                  {
                    monogram: 'RC',
                    bg: 'bg-[#1a6bb5]',
                    title: "Rebecca's Cleaning",
                    subtitle: 'Local service landing site',
                    href: '/portfolio/rebeccas-cleaning',
                  },
                  {
                    monogram: 'MT',
                    bg: 'bg-[#132238] ring-1 ring-white/15',
                    title: 'Men Talking LLC',
                    subtitle: 'Coaching & Emotional Wellness',
                    href: '/portfolio/men-talking',
                    desktopOnly: true,
                  },
                ].map((item) => {
                  const cardClasses = `items-center gap-3 p-2 sm:p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 transition-all ${item.href ? 'hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:border-accent/40 group' : ''
                    } ${item.desktopOnly ? 'hidden sm:flex' : 'flex'}`;

                  const cardBody = (
                    <>
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${item.bg} flex items-center justify-center font-black text-white text-xs sm:text-sm shrink-0 shadow-sm`}
                      >
                        {item.monogram}
                      </div>
                      <div className="min-w-0 flex-1">
                        <b
                          className={`text-xs sm:text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight block truncate ${item.href ? 'group-hover:text-accent transition-colors' : ''
                            }`}
                        >
                          {item.title}
                        </b>
                        <span className="text-[10.5px] sm:text-[11.5px] text-slate-500 dark:text-slate-400 leading-tight block truncate mt-0.5">
                          {item.subtitle}
                        </span>
                      </div>
                      {item.href ? (
                        <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      ) : (
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700/70 shrink-0">
                          {item.statusLabel}
                        </span>
                      )}
                    </>
                  );

                  return item.href ? (
                    <Link key={item.title} href={item.href} className={cardClasses}>
                      {cardBody}
                    </Link>
                  ) : (
                    <div key={item.title} className={cardClasses}>
                      {cardBody}
                    </div>
                  );
                })}
              </div>

              {/* Bottom CTA Button */}
              <div className="px-3 sm:px-4 pt-1 pb-3.5 sm:pb-4 bg-white dark:bg-[#0c1424]">
                <Link
                  href="/portfolio"
                  className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 rounded-lg bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] dark:hover:text-accent-foreground font-mono font-bold text-xs sm:text-sm tracking-wider uppercase shadow-md hover:scale-[1.01] transition-all group border border-[#090D16] dark:border-transparent"
                >
                  <span>See the full portfolio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00D8F6] dark:text-inherit group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* Client Testimonial Spotlight */}
      <ClientProofSpotlight />

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* Trust Section */}
      <section className="py-20 bg-muted/40 dark:bg-muted/30 transition-colors relative overflow-hidden border-y border-border">
        <div className="absolute inset-0 bg-dot-grid opacity-60 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <p className="text-xs font-bold tracking-widest uppercase text-slate-600 dark:text-muted-foreground mb-10 font-mono">Engineering experience across</p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-10 md:gap-14 lg:gap-16">
            {clientLogos.map((client) => (
              <div
                key={client.name}
                className="flex items-center justify-center opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-105"
                title={client.name}
              >
                {/* Dark mode: white SVG */}
                <img
                  src={client.whiteSrc}
                  alt={client.name}
                  className={`hidden dark:block w-auto ${client.heightClass} ${client.maxWidth} object-contain`}
                />
                {/* Light mode: standard SVG */}
                <img
                  src={client.stdSrc}
                  alt={client.name}
                  className={`block dark:hidden w-auto ${client.heightClass} ${client.maxWidth} object-contain`}
                />
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs sm:text-sm font-medium text-slate-600 dark:text-muted-foreground max-w-2xl mx-auto">
            Engineering experience across Disney, FEMA, BAE Systems, FAA, Leidos, and USA Today — now applied to practical sites and high-performance platforms for growing businesses.
          </p>
        </div>
      </section>

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* Services Section */}
      <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-20 text-balance">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">Modern websites with <span className="tech-gradient-text">real workflows</span></h2>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Bookings that land on your calendar, quote forms that reach you, and client intake that saves the back-and-forth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                title: 'Websites & Digital Platforms',
                desc: 'High-performance sites and applications for service businesses, non-profits, and organizations moving off WordPress or template platforms. Built with modern stacks for speed, reliability, and easier long-term ownership.',
                icon: <Rocket className="w-6 h-6" />,
                accent: 'text-orange-700 dark:text-orange-400',
                bg: 'bg-orange-500/10'
              },
              {
                title: 'Client Portals, Membership Systems & Internal Tools',
                desc: 'Custom portals for client intake, member management, document sharing, and workflow automation. Designed for teams that have outgrown basic forms or off-the-shelf tools.',
                icon: <Users className="w-6 h-6" />,
                accent: 'text-pink-700 dark:text-pink-400',
                bg: 'bg-pink-500/10'
              },
              {
                title: 'Full-Stack Development',
                desc: 'Next.js, React, and cloud-backed applications (Vercel, Firebase, AWS, GCP) with attention to performance, security, and maintainability. Includes work on subscription systems, e-commerce, and AI-assisted features where they create real value.',
                icon: <Cpu className="w-6 h-6" />,
                accent: 'text-blue-700 dark:text-blue-400',
                bg: 'bg-blue-500/10'
              },
              {
                title: 'Cloud & Deployment',
                desc: 'Secure, managed hosting and deployment so platforms stay fast and stable after launch.',
                icon: <Globe className="w-6 h-6" />,
                accent: 'text-emerald-700 dark:text-emerald-400',
                bg: 'bg-emerald-500/10'
              }
            ].map((service, idx) => (
              <motion.div
                key={service.title}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-6 sm:p-8 rounded-lg border border-slate-200/90 dark:border-border/80 hover:border-accent/50 bg-white dark:bg-card/90 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 overflow-hidden"
              >
                {/* Ambient Chromatic Corner Light */}
                <div className="absolute -right-12 -top-12 w-36 h-36 bg-accent/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                <div className={`w-12 h-12 rounded-lg ${service.bg} flex items-center justify-center ${service.accent} mb-6 group-hover:scale-110 transition-transform relative z-10`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 relative z-10">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* How We Work Section */}
      <section className="py-16 sm:py-24 bg-background transition-colors relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-6 space-y-10 sm:space-y-16 relative z-10">
          <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 glass px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-md backdrop-blur-md border border-border max-w-full">
              <Workflow className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">THE PROCESS</span>
              <span className="text-border" aria-hidden="true">|</span>
              <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap">HOW PROJECTS WORK</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
              How a Project <span className="tech-gradient-text">Works</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-medium">
              A clear, predictable roadmap from first conversation to live deployment.
            </p>
          </div>

          <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Discovery Call",
                time: "30 min",
                desc: "I clarify your main business goals, must-have features, audience, and technical constraints."
              },
              {
                step: "02",
                title: "Fixed Proposal",
                time: "Clear Scope",
                desc: "You receive an exact price, fixed timeline, and clear deliverables. No runaway hourly billing."
              },
              {
                step: "03",
                title: "Build & Review",
                time: "Modern Stack",
                desc: "Built on Next.js, React, and cloud infra with regular check-ins. You own 100% of the code and stack."
              },
              {
                step: "04",
                title: "Launch & Handoff",
                time: "Live Site",
                desc: "Production release, full performance checks, and handoff documentation. Optional ongoing support available."
              }
            ].map((p) => (
              <li
                key={p.step}
                className="group relative p-6 sm:p-8 rounded-lg border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card/90 backdrop-blur-sm hover:border-accent/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
              >
                {/* Ambient Corner Light */}
                <div className="absolute -right-10 -top-10 w-28 h-28 bg-accent/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-2xl font-black font-mono text-accent">
                      <span className="sr-only">Step </span>
                      {p.step}
                      <span className="sr-only">, </span>
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-muted-foreground bg-slate-100 dark:bg-muted/60 px-2.5 py-1 rounded-md">
                      {p.time}
                    </p>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-foreground mb-3 group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="p-6 sm:p-10 rounded-lg border border-accent/25 bg-sky-50/70 dark:bg-accent/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left shadow-sm">
            <div className="space-y-1">
              <p className="text-base md:text-lg font-bold text-slate-900 dark:text-foreground">
                Most projects land in the <span className="text-accent font-black">$2,500–$6,500</span> range.
              </p>
              <p className="text-sm text-slate-600 dark:text-muted-foreground">
                Full-stack apps, membership portals, and custom AI workflows are scoped higher after discovery.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] dark:hover:text-accent-foreground px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-lg font-bold text-sm hover:scale-105 transition-all shadow-md shrink-0 w-full sm:w-auto border border-[#090D16] dark:border-transparent font-mono uppercase tracking-wider text-xs"
            >
              <span>Book a free 30-minute call</span> <ArrowRight className="w-4 h-4 text-[#00D8F6] dark:text-current" />
            </Link>
          </div>
        </div>
      </section>

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* Local Packages / Start Here Teaser */}
      <section className="py-16 sm:py-24 bg-muted/20 transition-colors relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-16">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 glass px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-md backdrop-blur-md border border-border max-w-full">
                <Boxes className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">FIXED-SCOPE PACKAGES</span>
                <span className="text-border" aria-hidden="true">|</span>
                <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap">RESTON &amp; NOVA</span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
                Local Packages &amp; <span className="tech-gradient-text">Pricing</span>
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl font-medium">
                High-performance modern stacks with transparent starting ranges. Exact price fixed after a 30-min call.
              </p>
            </div>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 min-h-[28px] py-1 text-accent font-black text-sm sm:text-base hover:gap-3 transition-all group"
            >
              Explore All Packages &amp; Add-Ons <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "Local Launchpad",
                badge: "Most Common",
                price: "$2,500 – $3,500",
                desc: "5–8 page high-performance site, mobile-first speed, quote forms, and local NoVA SEO setup.",
                best: "Restaurants, home services, independent pros",
                href: "/packages#local-launchpad",
              },
              {
                title: "Booking & Intake",
                badge: "Client Workflows",
                price: "$4,200 – $5,800",
                desc: "Full build plus online booking or structured intake workflows to cut admin back-and-forth.",
                best: "Dental, clinics, salons, home services",
                featured: true,
                href: "/packages#booking-intake",
              },
              {
                title: "Performance Rebuild",
                badge: "WordPress Escape",
                price: "$3,800 – $6,500",
                desc: "Migrate off slow, bloated WordPress to modern serverless stack (Vercel + headless CMS).",
                best: "Established businesses escaping plugin bloat",
                href: "/packages#performance-rebuild",
              }
            ].map((pkg) => (
              <div
                key={pkg.title}
                className={`group relative p-6 sm:p-8 rounded-lg border backdrop-blur-sm flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden ${pkg.featured
                  ? 'bg-[#151b2a] text-white border-[#00D8F6]/40 shadow-xl shadow-sky-950/25 ring-1 ring-[#00D8F6]/30'
                  : 'bg-white dark:bg-card/90 text-foreground border-slate-200/90 dark:border-border/80 hover:border-accent/40 hover:shadow-accent/5'
                  }`}
              >
                {/* Ambient Chromatic Corner Light */}
                <div
                  className={`absolute -right-12 -top-12 w-36 h-36 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none ${pkg.featured ? 'bg-[#00D8F6]/20' : 'bg-accent/10'
                    }`}
                />
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg font-mono ${pkg.featured
                        ? 'bg-[#001f26] text-[#4cd7f6] border border-[#00D8F6]/40'
                        : 'text-accent bg-accent/10'
                        }`}
                    >
                      {pkg.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${pkg.featured ? 'text-white' : 'text-slate-900 dark:text-foreground'}`}>
                      {pkg.title}
                    </h3>
                    <p className={`text-2xl font-black mt-2 whitespace-nowrap ${pkg.featured ? 'text-white' : 'text-slate-900 dark:text-foreground'}`}>
                      {pkg.price}
                    </p>
                  </div>
                  <p className={`text-sm leading-relaxed ${pkg.featured ? 'text-slate-300' : 'text-slate-600 dark:text-muted-foreground'}`}>
                    {pkg.desc}
                  </p>
                  <p className={`text-xs font-medium ${pkg.featured ? 'text-slate-300' : 'text-slate-500 dark:text-muted-foreground/80'}`}>
                    <span className={`font-bold ${pkg.featured ? 'text-white' : 'text-slate-900 dark:text-foreground'}`}>Best for:</span> {pkg.best}
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href={pkg.href}
                    aria-label={`View Package Details — ${pkg.title}`}
                    className={`w-full py-3 px-4 rounded-lg text-center font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${pkg.featured
                      ? 'bg-[#00D8F6] hover:bg-[#38bdf8] text-[#090D16] font-black shadow-md shadow-[#00D8F6]/20'
                      : 'bg-slate-100 hover:bg-[#090D16] hover:text-[#00D8F6] text-slate-900 dark:bg-muted dark:hover:bg-accent dark:hover:text-accent-foreground dark:text-foreground'
                      }`}
                  >
                    View Package Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* Selected Work & Projects Section */}
      <section id="examples" className="py-16 sm:py-24 md:py-32 bg-accent/[0.03] transition-colors relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-12 sm:mb-20">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 glass px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-md backdrop-blur-md border border-border max-w-full">
                <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">SELECTED PLATFORMS</span>
                <span className="text-border" aria-hidden="true">|</span>
                <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap hidden sm:inline">CLIENT WORK &amp; APPS</span>
                <span className="font-mono text-[10px] text-muted-foreground uppercase whitespace-nowrap sm:hidden">CLIENT WORK</span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">Selected Work &amp; <span className="tech-gradient-text">Projects</span>.</h2>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl font-medium">
                A mix of client platforms and self-initiated systems that demonstrate full-stack development, product thinking, and modern deployment practices.
              </p>
            </div>
            <Link href="/portfolio" className="hidden md:flex items-center gap-2 text-foreground font-black hover:text-accent transition-colors group">
              View All Work <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                slug: "throttlelife",
                name: "ThrottleLife",
                desc: "A custom operating system concept for motorcycle riders — built as a high-performance Next.js application with real-time data handling, user accounts, and cloud-backed features. Focused on clean architecture and mobile-first interaction.",
                image: "/images/portfolio/throttlelife-homepage.png",
                badge: "Next.js Application",
                icon: <Zap className="w-5 h-5" />
              },
              {
                slug: "found-archives",
                name: "Found Archives",
                desc: "Replaced a slow 28-plugin WordPress site with a rebuilt one that scores 99/100 on Google's Lighthouse speed test and starts responding in under a third of a second.",
                image: "/images/portfolio/found-archives-homepage.png",
                badge: "WordPress Escape Case Study",
                icon: <Globe className="w-5 h-5" />
              },
              {
                slug: "northern-virginia-writers",
                name: "Northern Virginia Writers Club",
                desc: "Handles the club's membership site and collaboration portal: member roles, a member database, and recurring dues through PayPal. Knowing WordPress this well is why I can move sites off it without breaking anything.",
                image: "/images/portfolio/northernvirginiawriters-home.png",
                badge: "WordPress Mastery & Portals",
                icon: <Users className="w-5 h-5" />
              }
            ].map((app, idx) => (
              <motion.div
                key={app.name}
                initial={false}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="group relative flex flex-col"
              >
                <Link
                  href={`/portfolio/${app.slug}`}
                  className="relative aspect-[16/11] bg-card/80 dark:bg-card/90 backdrop-blur-sm rounded-lg border border-border/80 overflow-hidden shadow-xl hover:shadow-2xl hover:border-accent/50 hover:-translate-y-1 transition-all duration-300 block"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Atmospheric Glass App Header Overlay */}
                  <div className="absolute top-4 left-4 right-4 z-20 p-3 sm:p-3.5 rounded-lg bg-background/85 dark:bg-slate-950/85 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent border border-accent/25 flex items-center justify-center shadow-sm shrink-0">
                      {app.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-[17px] font-black text-foreground group-hover:text-accent transition-colors tracking-tight leading-snug">
                        {app.name}
                      </h3>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent leading-snug mt-0.5">
                        {app.badge}
                      </p>
                    </div>
                  </div>

                  {/* App Screen Mockup with breathing room */}
                  <div className="absolute -bottom-8 left-5 right-5 top-[6.25rem] sm:top-[5.75rem] rounded-lg border border-border/80 shadow-2xl overflow-hidden bg-background">
                    <img
                      src={app.image}
                      alt={app.name}
                      className="w-full h-full object-cover object-top grayscale-[10%] group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                </Link>
                <div className="mt-6 px-2 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">{app.desc}</p>
                  <Link
                    href={`/portfolio/${app.slug}`}
                    aria-label={`View Case Study & Architecture — ${app.name}`}
                    className="inline-flex items-center gap-1.5 min-h-[28px] py-1 text-xs font-bold text-accent hover:underline group-hover:gap-2 transition-all"
                  >
                    View Case Study &amp; Architecture <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaser CTA */}
      <section className="py-12 mb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="py-10 sm:py-16 md:py-20 px-5 sm:px-10 md:px-12 bg-[#090D16] text-white dark:bg-accent dark:text-accent-foreground rounded-lg overflow-hidden relative shadow-2xl border border-slate-800 dark:border-transparent">
            {/* Fine Hairline Blueprint Grid */}
            <div className="absolute inset-0 bg-dot-grid opacity-15 pointer-events-none" />
            <div className="max-w-4xl mx-auto text-center space-y-5 sm:space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 dark:bg-black/20 border border-white/20 dark:border-black/20 text-xs font-mono font-bold uppercase tracking-wider text-[#00D8F6] dark:text-accent-foreground">
                <Compass className="w-3.5 h-3.5 text-[#00D8F6] dark:text-accent-foreground shrink-0" />
                <span>DIRECT ENGINEER DISCOVERY</span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Have a project in mind? <span className="text-[#00D8F6] dark:text-inherit">Let&apos;s build it.</span>
              </h2>
              <p className="text-sm sm:text-lg md:text-xl font-medium opacity-90 max-w-2xl mx-auto text-slate-300 dark:text-inherit">
                Now booking new projects. Let&apos;s discuss your organization&apos;s goals and how to build a reliable, high-performance platform.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3.5 w-full sm:w-auto pt-2">
                <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-[#00D8F6] hover:bg-[#00F2FE] text-[#090D16] dark:bg-accent-foreground dark:text-accent dark:hover:bg-[#151D2F] dark:hover:text-accent px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-lg font-bold font-mono text-xs sm:text-sm hover:scale-105 transition-transform shadow-xl">
                  <span>Book a free 30-minute call</span> <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/packages" className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/55 dark:bg-accent-foreground/10 dark:hover:bg-accent-foreground/20 dark:text-accent-foreground dark:border-accent-foreground/60 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-lg font-bold font-mono text-xs sm:text-sm transition-all">
                  See Packages &amp; Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}