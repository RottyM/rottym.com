// src/app/page.tsx
'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Rocket, Zap, Globe, Cpu, Sparkles, Users, Braces, CalendarCheck, Workflow, Boxes, Layers } from 'lucide-react';

export default function Home() {
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % 2);
    }, 4500);
    return () => clearInterval(interval);
  }, []);
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

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-10 sm:pt-12 md:pt-14 pb-16 md:pb-24 overflow-hidden">
        {/* Architectural / Console Dot-Grid Texture */}
        <div className="absolute inset-0 bg-dot-grid opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -z-10 w-2/3 h-full bg-gradient-to-l from-accent/15 via-blue-500/10 to-transparent blur-3xl opacity-60 transition-colors" />
        <div className="absolute -top-24 -left-24 -z-10 w-[28rem] h-[28rem] bg-gradient-to-br from-emerald-500/10 via-accent/5 to-transparent rounded-full blur-3xl animate-pulse-soft transition-colors" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8 lg:gap-14 items-start w-full">
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4 sm:space-y-5"
          >
            <div className="inline-flex items-center gap-2.5 glass px-4 py-1.5 rounded-full shadow-md backdrop-blur-md border border-border">
              <Braces className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="font-mono text-xs text-accent tracking-widest uppercase font-bold">FULL-STACK DEVELOPMENT</span>
              <span className="text-border">|</span>
              <span className="font-mono text-xs text-muted-foreground uppercase">RESTON, VA &amp; GLOBAL</span>
            </div>

            {/* Zero-shift layout-locked rotating headline */}
            <div className="grid grid-cols-1 grid-rows-1 items-start">
              {/* Ghost 1: keeps grid row sized to headline 0 */}
              <h1
                aria-hidden="true"
                className="col-start-1 row-start-1 invisible select-none pointer-events-none text-4xl sm:text-5xl md:text-6xl font-black leading-[1.12] tracking-tight"
              >
                Building fast, modern sites that replace slow WordPress
              </h1>

              {/* Ghost 2: keeps grid row sized to headline 1 */}
              <h1
                aria-hidden="true"
                className="col-start-1 row-start-1 invisible select-none pointer-events-none text-4xl sm:text-5xl md:text-6xl font-black leading-[1.12] tracking-tight"
              >
                Custom web platforms, client portals, and modern applications
              </h1>

              {/* Active visible animated headline */}
              <div className="col-start-1 row-start-1 w-full">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={headlineIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground leading-[1.12] tracking-tight"
                  >
                    {headlineIndex === 0 ? (
                      <>
                        Building fast, modern sites that{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-500 to-indigo-500">
                          replace slow WordPress
                        </span>
                      </>
                    ) : (
                      <>
                        Custom web platforms,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-500 to-indigo-500">
                          client portals
                        </span>
                        , and modern applications
                      </>
                    )}
                  </motion.h1>
                </AnimatePresence>
              </div>
            </div>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl font-medium">
              Reston-based Full-Stack &amp; AI Software Engineer with deep UI/UX architecture expertise. I build high-performance web platforms, custom portals, and AI-augmented applications with the precision of enterprise work at Disney, FEMA, and BAE Systems.
            </p>

            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-200/90 dark:border-white/10 bg-slate-100/90 dark:bg-slate-900/60 backdrop-blur-md shadow-sm text-xs font-medium">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-slate-800 dark:text-slate-200">
                Fixed pricing after a short discovery call <span className="text-muted-foreground/60">·</span> <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">Booking 2026 projects and beyond</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-3.5">
              <Link href="/contact" className="group flex items-center gap-2 bg-accent text-accent-foreground px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-base hover:scale-105 transition-all shadow-xl shadow-accent/20">
                Book a Discovery Call
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/packages" className="flex items-center gap-2 glass px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-base hover:bg-muted transition-all text-foreground">
                View Packages &amp; Pricing
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-1 text-muted-foreground">
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-bold">
                    {['NY', 'SF', 'DC', 'LD'][i - 1]}
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm font-medium">
                Serving local organizations and technical teams
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative w-full max-w-lg mx-auto lg:max-w-none lg:pt-[50px]"
          >
            <Link 
              href="/portfolio" 
              className="block group focus:outline-none"
              title="View Portfolio"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border group-hover:border-accent/50 group-hover:shadow-accent/15 transition-all duration-500 bg-card">
                {/* Ambient Chromatic Corner Light */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none z-10" />
                <img
                  src="/images/portfolio/rottman-hero.jpg"
                  alt="Rottman Mendez - Full-Stack & AI Software Engineer Portfolio"
                  className="w-full h-auto object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-40 group-hover:opacity-10 transition-opacity" />
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* Trust Section */}
      <section className="py-24 bg-muted/30 transition-colors relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-12 font-mono">Previously engineered for</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Disney', 'FEMA', 'BAE Systems', 'FAA', 'Leidos', 'USA Today'].map(c => (
              <span key={c} className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">{c}</span>
            ))}
          </div>
          <p className="mt-8 text-sm md:text-base font-medium text-muted-foreground max-w-2xl mx-auto">
            Previously engineered systems for Disney, FEMA, BAE Systems, FAA, Leidos, and USA Today — now applied to practical sites and high-performance platforms for growing businesses.
          </p>
        </div>
      </section>

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* Services Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-4 mb-20 text-balance">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">Everything you need to <span className="tech-gradient-text">scale</span></h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">
              I don&apos;t just build websites. I engineer high-performance digital ecosystems using the most modern stacks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Websites & Digital Platforms',
                desc: 'High-performance sites and applications for service businesses, non-profits, and organizations moving off WordPress or template platforms. Built with modern stacks for speed, reliability, and easier long-term ownership.',
                icon: <Rocket className="w-6 h-6" />,
                accent: 'text-orange-500',
                bg: 'bg-orange-500/10'
              },
              {
                title: 'Client Portals, Membership Systems & Internal Tools',
                desc: 'Custom portals for client intake, member management, document sharing, and workflow automation. Designed for teams that have outgrown basic forms or off-the-shelf tools.',
                icon: <Users className="w-6 h-6" />,
                accent: 'text-pink-500',
                bg: 'bg-pink-500/10'
              },
              {
                title: 'Full-Stack Development',
                desc: 'Next.js, React, and cloud-backed applications (Vercel, Firebase, AWS, GCP) with attention to performance, security, and maintainability. Includes work on subscription systems, e-commerce, and AI-assisted features where they create real value.',
                icon: <Cpu className="w-6 h-6" />,
                accent: 'text-blue-500',
                bg: 'bg-blue-500/10'
              },
              {
                title: 'Cloud & Deployment',
                desc: 'Secure, managed hosting and deployment so platforms stay fast and stable after launch.',
                icon: <Globe className="w-6 h-6" />,
                accent: 'text-emerald-500',
                bg: 'bg-emerald-500/10'
              }
            ].map((service, idx) => (
              <motion.div
                key={service.title}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-8 rounded-3xl border border-border/80 hover:border-accent/50 bg-card/70 dark:bg-card/90 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 overflow-hidden"
              >
                {/* Ambient Chromatic Corner Light */}
                <div className="absolute -right-12 -top-12 w-36 h-36 bg-accent/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                <div className={`w-12 h-12 rounded-2xl ${service.bg} flex items-center justify-center ${service.accent} mb-6 group-hover:scale-110 transition-transform relative z-10`}>
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
      <section className="py-24 bg-background transition-colors relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-6 space-y-16 relative z-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2.5 glass px-4 py-1.5 rounded-full shadow-md backdrop-blur-md border border-border">
              <Workflow className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="font-mono text-xs text-accent tracking-widest uppercase font-bold">THE PROCESS</span>
              <span className="text-border">|</span>
              <span className="font-mono text-xs text-muted-foreground uppercase">HOW PROJECTS WORK</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              How a Project <span className="tech-gradient-text">Works</span>
            </h2>
            <p className="text-muted-foreground text-lg font-medium">
              A clear, predictable roadmap from first conversation to live deployment. No open-ended hourly surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Discovery Call",
                time: "30 min",
                desc: "We clarify your primary business goals, must-have features, audience, and technical constraints."
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
              <div
                key={p.step}
                className="group relative p-8 rounded-[2rem] border border-border/80 bg-card/70 dark:bg-card/90 backdrop-blur-sm hover:border-accent/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
              >
                {/* Ambient Corner Light */}
                <div className="absolute -right-10 -top-10 w-28 h-28 bg-accent/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black font-mono text-accent">
                      {p.step}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md">
                      {p.time}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-3 group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 md:p-10 rounded-[2.5rem] border border-accent/20 bg-accent/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-1">
              <p className="text-base md:text-lg font-bold text-foreground">
                Most Strategic Launchpads land in the <span className="text-accent font-black">$2,500–$6,500</span> range.
              </p>
              <p className="text-sm text-muted-foreground">
                Full-stack apps, membership portals, and custom AI workflows are scoped higher after discovery.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3.5 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shrink-0"
            >
              Book a Discovery Call <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* Local Packages / Start Here Teaser */}
      <section className="py-24 bg-muted/20 transition-colors relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 glass px-4 py-1.5 rounded-full shadow-md backdrop-blur-md border border-border">
                <Boxes className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="font-mono text-xs text-accent tracking-widest uppercase font-bold">FIXED-SCOPE PACKAGES</span>
                <span className="text-border">|</span>
                <span className="font-mono text-xs text-muted-foreground uppercase">RESTON &amp; NOVA</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                Local Packages &amp; <span className="tech-gradient-text">Pricing</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl font-medium">
                High-performance modern stacks with transparent starting ranges. Exact price fixed after a 15-min call.
              </p>
            </div>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 text-accent font-black text-base hover:gap-3 transition-all group"
            >
              Explore All Packages &amp; Add-Ons <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Local Launchpad",
                badge: "Most Common",
                price: "$2,500 – $3,500",
                desc: "5–8 page high-performance site, mobile-first speed, quote forms, and local NoVA SEO setup.",
                best: "Restaurants, home services, independent pros",
              },
              {
                title: "Booking & Intake",
                badge: "Client Workflows",
                price: "$4,200 – $5,800",
                desc: "Full build plus online booking or structured intake workflows to cut admin back-and-forth.",
                best: "Dental, clinics, salons, home services",
                featured: true,
              },
              {
                title: "Performance Rebuild",
                badge: "WordPress Escape",
                price: "$3,800 – $6,500",
                desc: "Migrate off slow, bloated WordPress to modern serverless stack (Vercel + headless CMS).",
                best: "Established businesses escaping plugin bloat",
              }
            ].map((pkg) => (
              <div
                key={pkg.title}
                className={`group relative p-8 rounded-[2.5rem] border bg-card/70 dark:bg-card/90 backdrop-blur-sm flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
                  pkg.featured
                    ? 'border-accent shadow-accent/10 ring-1 ring-accent/30'
                    : 'border-border/80 hover:border-accent/40 hover:shadow-accent/5'
                }`}
              >
                {/* Ambient Chromatic Corner Light */}
                <div className="absolute -right-12 -top-12 w-36 h-36 bg-accent/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
                      {pkg.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground">{pkg.title}</h3>
                    <p className="text-2xl font-black text-foreground mt-2">{pkg.price}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pkg.desc}</p>
                  <p className="text-xs text-muted-foreground/80 font-medium">
                    <span className="font-bold text-foreground">Best for:</span> {pkg.best}
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href="/packages"
                    className="w-full py-3 px-4 rounded-xl text-center font-bold text-sm bg-muted hover:bg-accent hover:text-accent-foreground text-foreground flex items-center justify-center gap-2 transition-all"
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
      <section className="py-32 bg-accent/[0.03] transition-colors relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2.5 glass px-4 py-1.5 rounded-full shadow-md backdrop-blur-md border border-border">
                <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="font-mono text-xs text-accent tracking-widest uppercase font-bold">SELECTED PLATFORMS</span>
                <span className="text-border">|</span>
                <span className="font-mono text-xs text-muted-foreground uppercase">CLIENT WORK &amp; APPS</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">Selected Work &amp; <span className="tech-gradient-text">Projects</span>.</h2>
              <p className="text-muted-foreground text-xl max-w-2xl font-medium">
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
                image: "/images/apps/throttlelife.png",
                badge: "Next.js Application",
                icon: <Zap className="w-5 h-5" />
              },
              {
                slug: "found-archives",
                name: "Found Archives",
                desc: "WordPress Escape Case Study: Replaced a slow, 28-plugin monolithic WordPress installation with a modern decoupled Next.js App Router and Sanity CMS setup on Vercel. Result: 99/100 Lighthouse performance and sub-350ms TTFB.",
                image: "/images/portfolio/found-archives-homepage.png",
                badge: "WordPress Escape Case Study",
                icon: <Globe className="w-5 h-5" />
              },
              {
                slug: "northern-virginia-writers",
                name: "Northern Virginia Writers Club",
                desc: "Proof of deep WordPress & BuddyBoss internals: managing custom user roles, membership databases, and recurring Stripe subscriptions. This deep CMS mastery is what makes our headless migrations seamless and risk-free.",
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
                  className="relative aspect-[16/11] bg-card/80 dark:bg-card/90 backdrop-blur-sm rounded-[2.5rem] border border-border/80 overflow-hidden shadow-xl hover:shadow-2xl hover:border-accent/50 hover:-translate-y-1 transition-all duration-300 block"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Atmospheric Glass App Header Overlay */}
                  <div className="absolute top-4 left-4 right-4 z-20 p-3 sm:p-3.5 rounded-2xl bg-background/65 dark:bg-slate-950/65 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent border border-accent/25 flex items-center justify-center shadow-sm shrink-0">
                      {app.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-[17px] font-black text-foreground group-hover:text-accent transition-colors tracking-tight truncate leading-snug">
                        {app.name}
                      </h3>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent/90 truncate mt-0.5">
                        {app.badge}
                      </p>
                    </div>
                  </div>

                  {/* App Screen Mockup with breathing room */}
                  <div className="absolute -bottom-8 left-5 right-5 top-[5.25rem] sm:top-[5.5rem] rounded-[1.75rem] border border-border/80 shadow-2xl overflow-hidden bg-background">
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
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline group-hover:gap-2 transition-all"
                  >
                    View Case Study &amp; Architecture →
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
          <div className="py-20 px-8 sm:px-12 bg-accent text-accent-foreground rounded-[3rem] overflow-hidden relative shadow-2xl">
            <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">Have a project in mind? Let&apos;s build it.</h2>
              <p className="text-xl font-medium opacity-90 max-w-2xl mx-auto">
                Booking 2026 projects and beyond. Let&apos;s discuss your organization&apos;s goals and how to build a reliable, high-performance platform.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-accent-foreground text-accent px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-2xl">
                  Book a Discovery Call <ArrowRight className="w-6 h-6" />
                </Link>
                <Link href="/packages" className="inline-flex items-center gap-2 bg-accent/20 hover:bg-accent/30 text-accent-foreground border border-accent-foreground/30 px-8 py-5 rounded-2xl font-black text-xl transition-all">
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