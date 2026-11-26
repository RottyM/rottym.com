// src/app/services/page.tsx
'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Rocket,
  Cpu,
  Globe,
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
  Boxes,
} from 'lucide-react';
import { useLang } from '@/components/ThemeProvider';

const SERVICES = [
  {
    title: { en: 'Websites & Digital Platforms', es: 'Sitios Web y Plataformas Digitales' },
    sla: { en: 'SLA: 60 FPS • 100 Core Web Vitals', es: 'SLA: 60 FPS • 100 Core Web Vitals' },
    desc: {
      en: 'High-performance sites and modern web applications engineered for speed, reliability, and long-term maintainability. Built with architecture chosen specifically to match your operational needs, not rigid templates.',
      es: 'Sitios de alto rendimiento y aplicaciones web diseñadas para máxima velocidad, estabilidad y fácil mantenimiento. Construidos con la arquitectura ideal para tu operación, sin plantillas rígidas.',
    },
    icon: <Rocket className="w-6 h-6" />,
    accent: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-500/10',
    features: {
      en: ['Bespoke Architecture', 'High Concurrency', 'Long-Term Ownership'],
      es: ['Arquitectura a la Medida', 'Alta Concurrencia', 'Propiedad a Largo Plazo'],
    },
    telemetry: { en: 'Global Edge & Distributed Cache', es: 'Red Global y Caché Distribuida' },
    packageNote: { en: 'Start with Local Launchpad — view package', es: 'Empieza con Lanzamiento Local — ver paquete' },
    packageHref: '/packages#local-launchpad',
  },
  {
    title: {
      en: 'Client Portals, Membership Systems & Internal Tools',
      es: 'Portales de Clientes, Membresías y Herramientas Internas',
    },
    sla: { en: 'Security: SOC-2 Hardened • Role RBAC', es: 'Seguridad: Control por Roles RBAC' },
    desc: {
      en: 'Custom portals for client intake, member management, document sharing, and workflow automation. Designed for teams that have outgrown basic forms or off-the-shelf tools.',
      es: 'Portales personalizados para registro de clientes, gestión de miembros, documentos y automatización de flujos. Pensado para equipos que superaron los formularios básicos o herramientas genéricas.',
    },
    icon: <Users className="w-6 h-6" />,
    accent: 'text-pink-700 dark:text-pink-400',
    bg: 'bg-pink-500/10',
    features: {
      en: ['Role-Based Access', 'Automated Workflows', 'Client Portals'],
      es: ['Accesos por Rol', 'Flujos Automatizados', 'Portales de Clientes'],
    },
    telemetry: { en: 'Row-Level Security Vaults', es: 'Seguridad por Nivel de Registro' },
    packageNote: { en: 'Available with Booking & Intake packages — view details', es: 'Disponible en Agenda y Registro — ver detalles' },
    packageHref: '/packages#booking-intake',
  },
  {
    title: { en: 'Full-Stack Development', es: 'Desarrollo Full-Stack' },
    sla: { en: 'Architecture: Zero-Downtime Event Mesh', es: 'Arquitectura: Cero Caídas en Producción' },
    desc: {
      en: 'Next.js, React, and cloud-backed applications (Vercel, Firebase, AWS, GCP) with attention to performance, security, and maintainability. Includes work on subscription systems, e-commerce, and AI-assisted features where they create real value.',
      es: 'Aplicaciones en Next.js, React y nube (Vercel, Firebase, AWS, GCP) enfocadas en rendimiento, seguridad y escalabilidad. Incluye suscripciones, comercio en línea y funciones con IA donde realmente aportan valor.',
    },
    icon: <Cpu className="w-6 h-6" />,
    accent: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    features: {
      en: ['Cloud Native', 'Tailored Stacks', 'Modern API Architecture'],
      es: ['Nativo en la Nube', 'Stack a la Medida', 'APIs Modernas'],
    },
    telemetry: { en: 'Distributed Data & Vector Stores', es: 'Datos Distribuidos y Búsqueda Vectorial' },
    packageNote: { en: 'Compare all Reston & NoVA website packages', es: 'Comparar paquetes para Reston y NoVA' },
    packageHref: '/packages',
  },
  {
    title: { en: 'Cloud & Deployment', es: 'Nube e Infraestructura' },
    sla: { en: 'Uptime: 99.99% • Multi-Region Edge', es: 'Disponibilidad: 99.99% • Edge Multirregión' },
    desc: {
      en: 'Multi-cloud deployment, secure automated CI/CD pipelines, and proactive observability so your platforms remain fast, secure, and resilient at every stage.',
      es: 'Despliegue multi-nube, pipelines CI/CD seguros y monitoreo proactivo para que tus plataformas sigan rápidas, protegidas y estables en todo momento.',
    },
    icon: <Globe className="w-6 h-6" />,
    accent: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    features: {
      en: ['Multi-Cloud Infrastructure', 'Zero-Downtime CI/CD', 'Automated Security'],
      es: ['Infraestructura Multi-Nube', 'Despliegues Sin Caídas', 'Seguridad Automatizada'],
    },
    telemetry: { en: 'Automated SSL & DDoS Shield', es: 'SSL Automático y Escudo DDoS' },
    packageNote: { en: 'Included in Ongoing Care maintenance — view add-on', es: 'Incluido en Mantenimiento Continuo — ver plan' },
    packageHref: '/packages#ongoing-care',
  },
];

export default function Services() {
  const { lang } = useLang();
  const isEs = lang === 'es';

  return (
    <section className="relative pt-10 pb-24 min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-gradient-to-b from-accent/10 via-sky-500/5 to-transparent dark:from-accent/15 dark:via-emerald-500/10 dark:to-transparent blur-[140px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-[850px] -right-40 w-[600px] h-[600px] bg-accent/5 blur-[160px] rounded-full -z-10" />
      <div className="pointer-events-none absolute bottom-[400px] -left-32 w-[650px] h-[650px] bg-accent/4 dark:bg-emerald-500/5 blur-[180px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        {/* SECTION 1: HERO INTRO & TELEMETRY STRIP */}
        <div>
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 max-w-3xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-1.5 sm:gap-2 glass px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-sm backdrop-blur-md border border-border max-w-full">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent shrink-0" />
              <span className="font-mono text-[9px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">
                {isEs ? 'INGENIERÍA DE ALTO RENDIMIENTO' : 'HIGH-PERFORMANCE ENGINEERING'}
              </span>
              <span className="text-border" aria-hidden="true">|</span>
              <span className="font-mono text-[9px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap hidden sm:inline">
                {isEs ? 'RESTON, NOVA Y GLOBAL' : 'RESTON, NOVA & GLOBAL'}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground uppercase whitespace-nowrap sm:hidden">RESTON, VA</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
              {isEs ? 'Servicios de ' : 'Premium '}
              <span className="tech-gradient-text">{isEs ? 'Ingeniería Web' : 'Services'}</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              {isEs
                ? 'Software de alto rendimiento, aplicaciones web a la medida y plataformas sólidas para negocios en Reston y el Norte de Virginia que exigen velocidad y calidad real.'
                : 'Engineering high-performance software, bespoke web applications, and resilient platforms for Reston & Northern Virginia businesses that demand speed, scale, and uncompromising quality.'}
            </p>
          </motion.div>

          {/* High-Density Telemetry Ticker Strip */}
          <div className="w-full max-w-5xl mx-auto stitch-card rounded-lg p-2.5 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between gap-3 text-left border border-border/50">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase font-bold">
                      {isEs ? 'DISPONIBILIDAD ACTUAL' : 'AVAILABILITY RUNTIME'}
                    </div>
                    <div className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {isEs ? 'ACEPTANDO NUEVOS PROYECTOS' : 'NOW ACCEPTING NEW PROJECTS'}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground px-2 py-0.5 bg-muted rounded border border-border/80">Q2–Q4 &apos;26</span>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg flex items-center gap-3 text-left border border-border/50">
                <Layers className="w-5 h-5 text-accent shrink-0" />
                <div className="min-w-0">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase font-bold">
                    {isEs ? 'PRINCIPIO DE ARQUITECTURA' : 'ARCHITECTURE PRINCIPLE'}
                  </div>
                  <div className="font-mono text-xs font-bold text-accent leading-snug">
                    {isEs ? 'LA HERRAMIENTA EXACTA SIN ATADURAS' : 'POLYGLOT & STACK-AGNOSTIC'}
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg flex items-center gap-3 text-left border border-border/50">
                <Zap className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase font-bold">
                    {isEs ? 'GARANTÍA DE VELOCIDAD' : 'PERFORMANCE GUARANTEE'}
                  </div>
                  <div className="font-mono text-xs font-bold text-foreground leading-snug">
                    {isEs ? 'TTFB < 100MS Y CORE WEB 100/100' : 'SUB-100MS TTFB & 100/100 CORE'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: 4 CORE SERVICES */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="font-mono text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2 font-bold">
                <Boxes className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                {isEs ? 'MATRIZ DE CAPACIDADES' : 'CORE CAPABILITIES MATRIX'}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
                {isEs ? 'Soluciones por Arquitectura' : 'Architectural Engagements'}
              </h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-md font-medium leading-relaxed">
              {isEs
                ? 'Código limpio en producción, construido para velocidad, estabilidad a largo plazo e independencia total de agencias.'
                : 'Clean production codebases engineered for speed, extreme long-term resilience, and total independence from agency locks.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.title.en}
                initial={false}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="stitch-card p-5 sm:p-8 md:p-10 rounded-lg flex flex-col justify-between group shadow-md hover:shadow-xl relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent"
              >
                <div className="pointer-events-none absolute -right-14 -top-14 w-40 h-40 bg-accent/10 dark:bg-accent/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                <div className="flex flex-col relative z-10">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-5 sm:mb-6">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg ${s.bg} ${s.accent} flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm shrink-0`}>
                      {s.icon}
                    </div>
                    <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-2.5 sm:px-3 py-1 rounded-lg bg-background/55 dark:bg-slate-950/50 backdrop-blur-md text-accent border border-white/20 dark:border-white/10 shadow-sm leading-snug">
                      {s.sla[lang]}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 sm:mb-3 text-foreground group-hover:text-accent transition-colors">
                    {s.title[lang]}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base md:text-lg mb-5 sm:mb-6 font-medium">
                    {s.desc[lang]}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                    {s.features[lang].map((f) => (
                      <span key={f} className="inline-flex items-center gap-1.5 font-mono text-[11px] sm:text-xs font-semibold text-foreground/90 bg-muted/70 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-border/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-5 sm:pt-6 -mx-5 -mb-5 sm:-mx-8 sm:-mb-8 md:-mx-10 md:-mb-10 p-5 sm:p-8 border-t border-border/60 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-b-lg relative z-10">
                  <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-accent"></span>
                    <span>{s.telemetry[lang]}</span>
                  </div>
                  <Link
                    href={s.packageHref}
                    className="inline-flex items-center gap-1.5 font-bold text-xs text-accent hover:underline group/link"
                  >
                    <span>{s.packageNote[lang]}</span>
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="laser-divider my-10 sm:my-12" />

        {/* SECTION 3: ENGINEERING PRINCIPLES */}
        <div className="stitch-card rounded-lg p-5 sm:p-8 lg:p-12 shadow-xl relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent">
          <div className="pointer-events-none absolute -top-24 right-1/4 w-96 h-48 bg-accent/10 rounded-full blur-3xl" />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6 relative z-10">
            <div>
              <span className="font-mono text-xs text-accent uppercase tracking-wider block mb-2 font-bold">
                {isEs ? 'LA HERRAMIENTA INDICADA' : 'THE RIGHT TOOL FOR THE JOB'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {isEs ? 'Principios de Ingeniería y Arquitectura' : 'Engineering Principles & Architecture Philosophy'}
              </h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg font-medium leading-relaxed">
              {isEs
                ? 'Rechazo dogmas rígidos y ataduras a plantillas. Construyo software alrededor de tus metas operativas reales, tiempos de respuesta y presupuesto.'
                : "I reject rigid dogmas and template lock-in. I build software around your team's real operational constraints, latency targets, and scalability demands."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
            <div className="bg-muted/40 p-8 rounded-lg flex flex-col justify-between border border-border/80 hover:border-accent/40 transition-colors shadow-sm">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-accent font-bold bg-accent/10 px-2.5 py-1 rounded-md">
                    01 // FIT-FIRST
                  </span>
                  <Sliders className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-3">
                  {isEs ? 'Enfocado en Resultados, Sin Dogmas' : 'Stack Agnostic & Outcome-Driven'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                  {isEs
                    ? 'Cada negocio tiene requisitos únicos. Evalúo rendimiento, facilidad de uso para tu equipo y costo operativo para elegir el runtime y base de datos óptimos.'
                    : 'Every business problem has unique constraints. I evaluate performance, team skillset, and operational cost to deploy the optimal language, runtime, and database.'}
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-muted-foreground font-mono text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{isEs ? 'Sin frameworks impuestos a la fuerza' : 'No forced framework lock-in'}</span>
              </div>
            </div>

            <div className="bg-muted/60 p-8 rounded-lg flex flex-col justify-between border border-border/80 hover:border-emerald-500/40 transition-colors shadow-sm">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md">
                    02 // LEAN SURFACE
                  </span>
                  <ShieldCheck className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-3">
                  {isEs ? 'Cero Peso Innecesario' : 'Zero Bloat & Minimal Surface'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                  {isEs
                    ? 'Código limpio y mantenible sin telarañas de dependencias frágiles, candados propietarios ni capas innecesarias.'
                    : 'I engineer lean, maintainable codebases without brittle dependency webs, proprietary handcuffs, or unnecessary abstraction layers.'}
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-muted-foreground font-mono text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{isEs ? 'Superficie mínima de dependencias' : 'Minimal dependency footprint'}</span>
              </div>
            </div>

            <div className="bg-muted/40 p-8 rounded-lg flex flex-col justify-between border border-border/80 hover:border-accent/40 transition-colors shadow-sm">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-accent font-bold bg-muted px-2.5 py-1 rounded-md border border-border/80">
                    03 // SOVEREIGN IP
                  </span>
                  <Key className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-3">
                  {isEs ? 'Propiedad Total de Código e Infraestructura' : 'Total IP & Infrastructure Ownership'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                  {isEs
                    ? 'Repositorios limpios, scripts de despliegue automatizados y documentación completa entregados a tu nombre desde el día uno.'
                    : 'Clean repositories, automated provisioning scripts, and complete documentation handed directly to you from day one.'}
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-muted-foreground font-mono text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{isEs ? '100% Propiedad del Cliente' : '100% Client Code & Config IP'}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/70 p-6 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs border border-border/80 relative z-10">
            <div className="flex items-center gap-3 text-foreground font-sans">
              <Layers className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="font-bold">{isEs ? 'Arquitectura Lista:' : 'Architectural Readiness:'}</span>
              <span className="text-muted-foreground font-mono">
                {isEs ? 'Serverless, Edge, Contenedores o Microservicios' : 'Serverless, Edge, Distributed Containers, or Bare-Metal Microservices'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-sans font-bold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>{isEs ? 'Portabilidad Nivel Empresarial' : 'Enterprise-Grade Portability'}</span>
            </div>
          </div>
        </div>

        <div className="laser-divider my-12" />

        {/* SECTION 4: CTA BANNER */}
        <motion.div
          initial={false}
          whileInView={{ opacity: 1 }}
          className="relative stitch-card rounded-lg p-8 md:p-14 text-center overflow-hidden shadow-2xl before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-accent/15 blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-2xl mx-auto flex flex-col items-center relative z-10">
            <span className="font-mono text-xs text-accent uppercase tracking-widest mb-3 inline-block font-bold">
              {isEs ? 'INTEGRACIONES Y ALCANCE A LA MEDIDA' : 'BESPOKE INTEGRATIONS & SCOPES'}
            </span>

            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">
              {isEs ? '¿Necesitas una solución técnica a la medida?' : 'Need a custom stack solution?'}
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed font-medium">
              {isEs
                ? 'Me especializo en integraciones personalizadas y requisitos técnicos específicos. Conversemos sobre tu proyecto.'
                : "I specialize in custom integrations and unique technical requirements. Let's talk about your vision."}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 w-full sm:w-auto">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] dark:hover:text-accent-foreground font-bold text-sm sm:text-base rounded-lg transition-all shadow-xl shadow-black/10 dark:shadow-accent/20 flex items-center justify-center gap-2 border border-[#090D16] dark:border-transparent hover:scale-105"
              >
                <span>{isEs ? 'Iniciar Conversación' : 'Start the Conversation'}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#00D8F6] dark:text-current" />
              </Link>
              <a
                href="mailto:rmendez@rottym.com"
                className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300/80 shadow-sm dark:bg-card dark:text-foreground dark:border-border dark:hover:bg-muted/80 dark:hover:border-accent/40 font-semibold text-sm sm:text-base rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span>rmendez@rottym.com</span>
              </a>
            </div>

            <div className="flex flex-col items-center gap-2 mb-8">
              <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                {isEs ? 'ÁREAS DE SERVICIO LOCAL' : 'LOCAL SERVICE AREAS'}
              </span>
              <p className="text-xs sm:text-sm text-foreground/80 font-mono text-center">
                Reston · Fairfax · Tysons · Herndon · Ashburn · Arlington · Alexandria · Washington, D.C.
              </p>
            </div>

            <div className="bg-muted/80 border border-border/80 px-6 py-3 rounded-lg flex flex-wrap items-center justify-center gap-6 text-foreground/80 font-mono text-xs uppercase font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEs ? '100% Propiedad del Código' : '100% Code Ownership'}</span>
              </div>
              <span className="text-border hidden sm:inline" aria-hidden="true">•</span>
              <div className="flex items-center gap-1.5 text-accent">
                <LockOpen className="w-4 h-4" />
                <span>{isEs ? 'Sin Ataduras ni Contratos' : 'Zero Vendor Lock-in'}</span>
              </div>
              <span className="text-border hidden sm:inline" aria-hidden="true">•</span>
              <div className="flex items-center gap-1.5 text-foreground">
                <Terminal className="w-4 h-4" />
                <span>{isEs ? 'Stack Moderno Empresarial' : 'Enterprise Modern Stack'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
