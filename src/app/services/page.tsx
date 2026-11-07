// src/app/services/page.tsx
'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Rocket, 
  Cpu, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Terminal, 
  CalendarCheck, 
  Layers, 
  Zap, 
  Sliders, 
  ShieldCheck, 
  Key, 
  Mail, 
  LockOpen,
  Activity,
  Boxes
} from 'lucide-react';

const services = [
  {
    title: "Websites & Digital Platforms",
    sla: "SLA: 60 FPS • 100 Core Web Vitals",
    desc: "High-performance sites and modern web applications engineered for speed, reliability, and long-term maintainability. Built with architecture chosen specifically to match your operational needs, not rigid templates.",
    icon: <Rocket className="w-6 h-6" />,
    accent: "text-orange-500",
    bg: "bg-orange-500/10",
    features: ["Bespoke Architecture", "High Concurrency", "Long-Term Ownership"],
    telemetry: "Global Edge & Distributed Cache",
    packageNote: "Most Reston & NoVA projects start here — view packages",
    packageHref: "/packages#local-launchpad"
  },
  {
    title: "Client Portals, Membership Systems & Internal Tools",
    sla: "Security: SOC-2 Hardened • Role RBAC",
    desc: "Custom portals for client intake, member management, document sharing, and workflow automation. Designed for teams that have outgrown basic forms or off-the-shelf tools.",
    icon: <Users className="w-6 h-6" />,
    accent: "text-pink-500",
    bg: "bg-pink-500/10",
    features: ["Role-Based Access", "Automated Workflows", "Client Portals"],
    telemetry: "Row-Level Security Vaults",
    packageNote: "Available with Booking & Intake packages — view details",
    packageHref: "/packages#booking-intake"
  },
  {
    title: "Full-Stack Development",
    sla: "Architecture: Zero-Downtime Event Mesh",
    desc: "Next.js, React, and cloud-backed applications (Vercel, Firebase, AWS, GCP) with attention to performance, security, and maintainability. Includes work on subscription systems, e-commerce, and AI-assisted features where they create real value.",
    icon: <Cpu className="w-6 h-6" />,
    accent: "text-blue-500",
    bg: "bg-blue-500/10",
    features: ["Cloud Native", "Tailored Stacks", "Modern API Architecture"],
    telemetry: "Distributed Data & Vector Stores",
    packageNote: "Most Reston & NoVA projects start here — view packages",
    packageHref: "/packages"
  },
  {
    title: "Cloud & Deployment",
    sla: "Uptime: 99.99% • Multi-Region Edge",
    desc: "Multi-cloud deployment, secure automated CI/CD pipelines, and proactive observability so your platforms remain fast, secure, and resilient at every stage.",
    icon: <Globe className="w-6 h-6" />,
    accent: "text-emerald-500",
    bg: "bg-emerald-500/10",
    features: ["Multi-Cloud Infrastructure", "Zero-Downtime CI/CD", "Automated Security"],
    telemetry: "Automated SSL & DDoS Shield",
    packageNote: "Included in Ongoing Care maintenance — view add-on",
    packageHref: "/packages#ongoing-care"
  }
];

export default function Services() {
  return (
    <section className="relative pt-10 pb-24 min-h-screen overflow-hidden">
      {/* Background Dot-Grid Texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

      {/* Atmospheric Radial Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-gradient-to-b from-accent/15 via-emerald-500/10 to-transparent blur-[140px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-[850px] -right-40 w-[600px] h-[600px] bg-accent/5 blur-[160px] rounded-full -z-10" />
      <div className="pointer-events-none absolute bottom-[400px] -left-32 w-[650px] h-[650px] bg-emerald-500/5 blur-[180px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        
        {/* SECTION 1: HERO INTRO & TELEMETRY STRIP */}
        <div>
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 max-w-3xl mx-auto mb-12"
          >
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2.5 glass px-4 py-1.5 rounded-full shadow-md backdrop-blur-md border border-border">
              <Activity className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="font-mono text-xs text-accent tracking-widest uppercase font-bold">HIGH-PERFORMANCE ENGINEERING</span>
              <span className="text-border">|</span>
              <span className="font-mono text-xs text-muted-foreground uppercase">RESTON, NOVA &amp; GLOBAL</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
              Premium <span className="tech-gradient-text">Services</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Engineering high-performance software, bespoke web applications, and resilient platforms for Reston &amp; Northern Virginia businesses that demand speed, scale, and uncompromising quality.
            </p>
          </motion.div>

          {/* High-Density Telemetry Ticker Strip */}
          <div className="w-full max-w-5xl mx-auto stitch-card rounded-2xl p-2.5 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Telemetry Slot 1 */}
              <div className="bg-muted/50 p-4 rounded-xl flex items-center justify-between gap-3 text-left border border-border/50">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase font-bold">AVAILABILITY RUNTIME</div>
                    <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">NOW ACCEPTING NEW PROJECTS</div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground px-2 py-0.5 bg-muted rounded border border-border/80">Q2–Q4 &apos;26</span>
              </div>

              {/* Telemetry Slot 2 */}
              <div className="bg-muted/50 p-4 rounded-xl flex items-center gap-3 text-left border border-border/50">
                <Layers className="w-5 h-5 text-accent shrink-0" />
                <div className="min-w-0">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase font-bold">ARCHITECTURE PRINCIPLE</div>
                  <div className="font-mono text-xs font-bold text-accent truncate">POLYGLOT &amp; STACK-AGNOSTIC</div>
                </div>
              </div>

              {/* Telemetry Slot 3 */}
              <div className="bg-muted/50 p-4 rounded-xl flex items-center gap-3 text-left border border-border/50">
                <Zap className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase font-bold">PERFORMANCE GUARANTEE</div>
                  <div className="font-mono text-xs font-bold text-foreground truncate">SUB-100MS TTFB &amp; 100/100 CORE</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: 4 CORE HIGH-CONVERTING SERVICES (CHROMATIC CARDS) */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2 font-bold">
                <Boxes className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                CORE CAPABILITIES MATRIX
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Architectural Engagements
              </h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-md font-medium leading-relaxed">
              Clean production codebases engineered for speed, extreme long-term resilience, and total independence from agency locks.
            </p>
          </div>

          {/* 2x2 Bento Grid Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={false}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="stitch-card p-8 md:p-10 rounded-[2.5rem] flex flex-col justify-between group shadow-xl relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent"
              >
                {/* Chromatic Corner Aura */}
                <div className="pointer-events-none absolute -right-14 -top-14 w-40 h-40 bg-accent/10 dark:bg-accent/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                <div className="flex flex-col relative z-10">
                  {/* Card Header & Badge */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.accent} flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm shrink-0`}>
                      {s.icon}
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-background/55 dark:bg-slate-950/50 backdrop-blur-md text-accent border border-white/20 dark:border-white/10 shadow-sm">
                      {s.sla}
                    </span>
                  </div>

                  {/* Title & Copy */}
                  <h3 className="text-2xl sm:text-3xl font-black mb-3 text-foreground group-hover:text-accent transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base sm:text-lg mb-6 font-medium">
                    {s.desc}
                  </p>

                  {/* Core Value Pills */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {s.features.map(f => (
                      <span key={f} className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground/90 bg-muted/70 px-3 py-1.5 rounded-lg border border-border/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Technical Telemetry & Footer Anchor Link */}
                <div className="pt-6 -mx-8 -mb-8 p-8 border-t border-border/60 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-b-[2.5rem] relative z-10">
                  <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-accent"></span>
                    <span>{s.telemetry}</span>
                  </div>
                  <Link
                    href={s.packageHref}
                    className="inline-flex items-center gap-1.5 font-bold text-xs text-accent hover:underline group/link"
                  >
                    <span>{s.packageNote}</span>
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Laser Divider */}
        <div className="laser-divider my-12" />

        {/* SECTION 3: ENGINEERING PRINCIPLES & ARCHITECTURE PHILOSOPHY */}
        <div className="stitch-card rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-24 right-1/4 w-96 h-48 bg-accent/10 rounded-full blur-3xl" />

          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6 relative z-10">
            <div>
              <span className="font-mono text-xs text-accent uppercase tracking-wider block mb-2 font-bold">
                THE RIGHT TOOL FOR THE JOB
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                Engineering Principles &amp; Architecture Philosophy
              </h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg font-medium leading-relaxed">
              We reject rigid dogmas and template lock-in. We build software around your team&apos;s real operational constraints, latency targets, and scalability demands.
            </p>
          </div>

          {/* 3 Column Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
            {/* Pillar 1 */}
            <div className="bg-muted/40 p-8 rounded-2xl flex flex-col justify-between border border-border/80 hover:border-accent/40 transition-colors shadow-sm">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-accent font-bold bg-accent/10 px-2.5 py-1 rounded-md">
                    01 // FIT-FIRST
                  </span>
                  <Sliders className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-3">
                  Stack Agnostic &amp; Outcome-Driven
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                  Every business problem has unique constraints. We evaluate performance, team skillset, and operational cost to deploy the optimal language, runtime, and database.
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-muted-foreground font-mono text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>No forced framework lock-in</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-muted/60 p-8 rounded-2xl flex flex-col justify-between border border-border/80 hover:border-emerald-500/40 transition-colors shadow-sm">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md">
                    02 // LEAN SURFACE
                  </span>
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-3">
                  Zero Bloat &amp; Minimal Surface
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                  We engineer lean, maintainable codebases without brittle dependency webs, proprietary handcuffs, or unnecessary abstraction layers.
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-muted-foreground font-mono text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Minimal dependency footprint</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-muted/40 p-8 rounded-2xl flex flex-col justify-between border border-border/80 hover:border-accent/40 transition-colors shadow-sm">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-accent font-bold bg-muted px-2.5 py-1 rounded-md border border-border/80">
                    03 // SOVEREIGN IP
                  </span>
                  <Key className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-3">
                  Total IP &amp; Infrastructure Ownership
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                  Clean repositories, automated provisioning scripts, and complete documentation handed directly to you from day one.
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-muted-foreground font-mono text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>100% Client Code &amp; Config IP</span>
              </div>
            </div>
          </div>

          {/* Engineering Ledger Summary Banner */}
          <div className="bg-muted/70 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs border border-border/80 relative z-10">
            <div className="flex items-center gap-3 text-foreground font-sans">
              <Layers className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="font-bold">Architectural Readiness:</span>
              <span className="text-muted-foreground font-mono">Serverless, Edge, Distributed Containers, or Bare-Metal Microservices</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-sans font-bold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Enterprise-Grade Portability</span>
            </div>
          </div>
        </div>

        {/* Laser Divider */}
        <div className="laser-divider my-12" />

        {/* SECTION 4: CALLOUT BANNER: "NEED A CUSTOM STACK SOLUTION?" */}
        <motion.div
          initial={false}
          whileInView={{ opacity: 1 }}
          className="relative stitch-card rounded-[3rem] p-8 md:p-14 text-center overflow-hidden shadow-2xl before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent"
        >
          {/* Accent Top Radial Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-accent/15 blur-3xl pointer-events-none rounded-full" />
          
          <div className="max-w-2xl mx-auto flex flex-col items-center relative z-10">
            <span className="font-mono text-xs text-accent uppercase tracking-widest mb-3 inline-block font-bold">
              BESPOKE INTEGRATIONS &amp; SCOPES
            </span>

            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">
              Need a custom stack solution?
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed font-medium">
              I specialize in custom integrations and unique technical requirements. Let&apos;s talk about your vision.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 w-full sm:w-auto">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-accent hover:scale-105 text-accent-foreground font-bold text-base rounded-2xl transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2"
              >
                <span>Start the Conversation</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="mailto:rmendez@rottym.com"
                className="w-full sm:w-auto px-6 py-4 glass hover:bg-muted text-foreground font-semibold text-base rounded-2xl transition-colors flex items-center justify-center gap-2 border border-border"
              >
                <Mail className="w-5 h-5 text-accent" />
                <span>rmendez@rottym.com</span>
              </a>
            </div>

            {/* Regional Footprint Label */}
            <div className="flex flex-col items-center gap-2 mb-8">
              <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                LOCAL SERVICE AREAS
              </span>
              <p className="text-xs sm:text-sm text-foreground/80 font-mono text-center">
                Reston · Fairfax · Tysons · Herndon · Ashburn · Arlington · Alexandria · Washington, D.C.
              </p>
            </div>

            {/* Micro Trust Badges Strip */}
            <div className="bg-muted/80 border border-border/80 px-6 py-3 rounded-full flex flex-wrap items-center justify-center gap-6 text-foreground/80 font-mono text-xs uppercase font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Code Ownership</span>
              </div>
              <span className="text-border hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 text-accent">
                <LockOpen className="w-4 h-4" />
                <span>Zero Vendor Lock-in</span>
              </div>
              <span className="text-border hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 text-foreground">
                <Terminal className="w-4 h-4" />
                <span>Enterprise Modern Stack</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
