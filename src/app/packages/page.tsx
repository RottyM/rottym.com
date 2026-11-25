// src/app/packages/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  Check,
  Boxes,
  FileText,
  Star,
  Quote,
  LockOpen,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  XCircle,
} from 'lucide-react';
import { clientTestimonials } from '@/lib/testimonials';
import { useLang } from '@/components/ThemeProvider';

const PACKAGES = [
  {
    id: 'local-launchpad',
    name: { en: 'Local Launchpad', es: 'Lanzamiento Local' },
    subtitle: { en: 'Entry & Most Common', es: 'Inicial y Más Solicitado' },
    price: '$2,500 – $3,500',
    priceNote: {
      en: 'Starting range · Fixed after 30-min call',
      es: 'Rango inicial · Precio fijo tras llamada de 30 min',
    },
    desc: {
      en: 'A clean, fast site built for local service businesses that need to show up and get inquiries.',
      es: 'Un sitio rápido y profesional para negocios locales que necesitan destacar en Google y recibir prospectos diarios.',
    },
    icon: <Rocket className="w-7 h-7" />,
    accent: 'text-orange-500',
    accentBg: 'bg-orange-500/10',
    borderHover: 'hover:border-orange-500/40',
    featured: false,
    pickThisIf: {
      en: 'You need a fast, professional site that brings in inquiries — no booking, no portal, just a site that works.',
      es: 'Necesitas un sitio veloz y confiable que genere clientes — sin agenda ni portal complejo, solo una web que funcione.',
    },
    bestFor: {
      en: 'Restaurants, home services, dental, auto shops, independent professionals.',
      es: 'Restaurantes, servicios del hogar, clínicas dentales, talleres y profesionales independientes.',
    },
    whyTheRange: {
      en: 'A 5-page site with standard quote forms lands near $2,500. Additional custom service pages or expanded local SEO sections push it toward $3,500.',
      es: 'Un sitio de 5 páginas con formularios estándar ronda los $2,500. Más páginas de servicio o secciones SEO locales ampliadas lo acercan a $3,500.',
    },
    included: {
      en: [
        '5–8 page high-performance site (modern stack or clean WordPress escape)',
        'Mobile-first design and sub-second load times',
        'Contact and quote forms that actually work',
        'Service-area pages for Reston, Fairfax, and surrounding NoVA',
        'Basic local SEO setup and Google Business Profile optimization notes',
        'Short post-launch support window',
      ],
      es: [
        'Sitio ultrarrápido de 5 a 8 páginas (stack moderno o migración limpia)',
        'Diseño pensado para celulares y carga en menos de un segundo',
        'Formularios de contacto y cotización que llegan directo a tu correo',
        'Páginas optimizadas para Reston, Fairfax y el Norte de Virginia',
        'Configuración base de SEO local y guía para Google Business Profile',
        'Ventana inicial de soporte posterior al lanzamiento',
      ],
    },
    cta: { en: 'Start with Local Launchpad', es: 'Elegir Lanzamiento Local' },
    href: '/contact?service=local-launchpad',
  },
  {
    id: 'booking-intake',
    name: { en: 'Booking & Intake', es: 'Agenda y Registro' },
    subtitle: { en: 'Booking & Client Workflows', es: 'Reservas y Flujo de Clientes' },
    price: '$4,200 – $5,800',
    priceNote: {
      en: 'Fixed after 30-min call',
      es: 'Precio fijo tras llamada de 30 min',
    },
    desc: {
      en: "Everything in Local Launchpad, plus online booking and intake that cut the phone tag and capture more of the work you're already getting.",
      es: 'Todo lo del Lanzamiento Local más citas en línea y formularios inteligentes para dejar de perder llamadas y captar más trabajo.',
    },
    icon: <CalendarCheck className="w-7 h-7" />,
    accent: 'text-accent',
    accentBg: 'bg-accent/10',
    borderHover: 'hover:border-accent/60',
    featured: true,
    badge: { en: 'Most Popular', es: 'Más Popular' },
    pickThisIf: {
      en: 'your front desk spends its day on appointment calls, reschedules, and chasing forms — and you want that handled online instead.',
      es: 'tu equipo pasa el día confirmando citas por teléfono, reprogramando y pidiendo datos — y quieres automatizarlo en línea.',
    },
    bestFor: {
      en: 'Dental offices, salons, home service companies, and professional practices with appointment or form volume.',
      es: 'Clínicas dentales, consultorios, salones, servicios del hogar y despachos con alto volumen de citas.',
    },
    whyTheRange: {
      en: 'A single service with one booking calendar lands near $4,200. Multiple services, staff calendars, or a client portal push it toward $5,800. Your exact number is fixed after the 30-min call — no surprise invoices.',
      es: 'Un solo servicio con un calendario ronda los $4,200. Múltiples servicios, agendas por empleado o un portal privado lo acercan a $5,800. Cerramos el precio exacto tras la llamada — cero cobros sorpresa.',
    },
    included: {
      en: [
        'Full Local Launchpad build included',
        'Online booking or structured intake forms',
        'Automated confirmation & notification routing',
        'Cleaner client workflows so your team spends less time on admin',
        'Optional simple client portal or document upload',
        'Priority post-launch support window',
      ],
      es: [
        'Todo el paquete Lanzamiento Local incluido',
        'Agenda en línea o formularios guiados de registro',
        'Confirmaciones automáticas y alertas directas a tu equipo',
        'Flujos más ordenados para ahorrar horas de trabajo administrativo',
        'Portal sencillo o carga segura de documentos opcional',
        'Soporte prioritario tras el lanzamiento',
      ],
    },
    cta: { en: 'Add Booking & Intake', es: 'Elegir Agenda y Registro' },
    href: '/contact?service=booking-intake',
  },
  {
    id: 'performance-rebuild',
    name: { en: 'Performance Rebuild', es: 'Migración de Alto Rendimiento' },
    subtitle: { en: 'WordPress Escape', es: 'Adiós WordPress' },
    price: '$3,800 – $6,500',
    priceNote: {
      en: 'Scales with size · Fixed after 30-min call',
      es: 'Según tamaño · Precio fijo tras llamada de 30 min',
    },
    desc: {
      en: 'Move off a slow or bloated WordPress site to a modern stack that loads faster, breaks less, and is easier to maintain.',
      es: 'Sal de un WordPress lento o pesado hacia una plataforma moderna que carga al instante, no se rompe al actualizar y cuesta menos mantener.',
    },
    icon: <RefreshCw className="w-7 h-7" />,
    accent: 'text-blue-500',
    accentBg: 'bg-blue-500/10',
    borderHover: 'hover:border-blue-500/40',
    featured: false,
    pickThisIf: {
      en: 'Your current WordPress site is slow, breaks on updates, or keeps throwing security alerts.',
      es: 'Tu WordPress actual tarda en abrir, se daña con cada actualización de plugins o vive con alertas de seguridad.',
    },
    bestFor: {
      en: 'Businesses that have outgrown their current site and are tired of plugin conflicts, security alerts, and slow mobile performance.',
      es: 'Negocios cansados de conflictos de plugins, vulnerabilidades y pésima velocidad en teléfonos celulares.',
    },
    whyTheRange: {
      en: 'Smaller brochure sites land near $3,800. Complex sites with large blog archives, WooCommerce, or custom databases scale toward $6,500.',
      es: 'Sitios informativos pequeños rondan $3,800. Sitios con cientos de artículos, tienda o bases de datos a medida se acercan a $6,500.',
    },
    included: {
      en: [
        'Full migration from WordPress (or template builder) to modern stack (Vercel + headless CMS)',
        'Complete content, asset, and SEO structure migration',
        'Speed, security, and maintainability focus (95–100 Lighthouse)',
        'Cleaner ownership — you own the code and stack outright',
        'Zero brittle plugins or security vulnerabilities',
        'Dedicated transition and post-launch verification',
      ],
      es: [
        'Migración completa de WordPress o constructor visual a arquitectura moderna',
        'Traslado íntegro de textos, fotos, enlaces y estructura SEO',
        'Enfoque en velocidad, seguridad y calificación 95–100 en Lighthouse',
        'Propiedad total — el código y dominio quedan 100% a tu nombre',
        'Cero plugins frágiles ni brechas de seguridad',
        'Verificación completa durante el cambio sin perder posicionamiento',
      ],
    },
    cta: { en: 'Start a Performance Rebuild', es: 'Iniciar Migración Moderna' },
    href: '/contact?service=performance-rebuild',
  },
];

export default function PackagesPage() {
  const { lang } = useLang();
  const isEs = lang === 'es';
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isTestimonialPaused, setIsTestimonialPaused] = useState(false);
  const [userControlledTestimonial, setUserControlledTestimonial] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const totalTestimonials = clientTestimonials.length;
  const currentTestimonial = clientTestimonials[activeTestimonial];

  useEffect(() => {
    if (isTestimonialPaused || userControlledTestimonial || prefersReducedMotion || totalTestimonials <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % totalTestimonials);
    }, 6500);
    return () => clearInterval(timer);
  }, [isTestimonialPaused, userControlledTestimonial, prefersReducedMotion, totalTestimonials]);

  const handleSelectTestimonial = (nextIndex: number) => {
    setUserControlledTestimonial(true);
    setActiveTestimonial((nextIndex + totalTestimonials) % totalTestimonials);
  };

  return (
    <div className="relative min-h-screen pt-10 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-accent/10 via-sky-500/5 to-transparent dark:from-accent/15 dark:via-emerald-500/10 dark:to-transparent blur-[130px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-1/2 -left-32 w-[420px] h-[420px] bg-accent/5 rounded-full blur-[110px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 space-y-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 glass px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-sm backdrop-blur-md border border-border max-w-full">
            <Boxes className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent shrink-0" />
            <span className="font-mono text-[9px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">
              {isEs ? 'PAQUETES DE ALCANCE FIJO' : 'FIXED-SCOPE PACKAGES'}
            </span>
            <span className="text-border" aria-hidden="true">|</span>
            <span className="font-mono text-[9px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap hidden sm:inline">
              {isEs ? 'RESTON Y NORTE DE VIRGINIA' : 'RESTON & NORTHERN VIRGINIA'}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground uppercase whitespace-nowrap sm:hidden">RESTON &amp; NOVA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
            {isEs ? 'Paquetes Locales para Negocios en ' : 'Local Packages for '}
            <span className="tech-gradient-text inline-block pr-2.5">
              Reston &amp; NoVA
            </span>
            {!isEs && ' Businesses'}
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
            {isEs
              ? 'Sitios rápidos y herramientas a la medida que tu equipo sí usa.'
              : 'High-performance sites and custom tools that actually get used.'}
          </p>

          <div className="p-3.5 sm:p-4 rounded-lg bg-muted/40 border border-border inline-block">
            <p className="text-xs sm:text-base text-foreground font-semibold">
              {isEs ? 'La mayoría de proyectos locales están entre ' : 'Most local projects land between '}
              <span className="text-accent font-black">$2,500–$6,500</span>
              {isEs
                ? '. Cerramos el precio exacto tras una llamada breve.'
                : '. Price is fixed after a short call.'}
            </p>
          </div>

          <div className="pt-1">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] dark:hover:text-accent-foreground px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-lg font-bold font-mono text-xs sm:text-sm hover:scale-[1.02] transition-all shadow-md shadow-black/10 dark:shadow-accent/20 w-full sm:w-auto border border-[#090D16] dark:border-transparent"
            >
              <span>{isEs ? 'Agenda 30 min gratis' : 'Book a free 30-minute call'}</span>{' '}
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D8F6] dark:text-current" />
            </Link>
          </div>
        </div>

        {/* Intro Manifesto */}
        <div className="max-w-4xl mx-auto glass p-5 sm:p-8 md:p-12 rounded-lg border border-border space-y-4 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-black text-foreground">
            {isEs
              ? 'No necesitas otro WordPress pesado que se cae cada vez que actualizas un plugin.'
              : 'You don’t need another bloated WordPress site that breaks every time you update a plugin.'}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
            {isEs
              ? 'Estos paquetes están diseñados para negocios locales que buscan algo más rápido, limpio y fácil de operar — ya sea una migración moderna, citas en línea o un sitio sólido que posicione y genere clientes.'
              : 'These packages are built for local businesses that want something faster, cleaner, and easier to own — whether that’s a modern rebuild, online booking, or a straightforward high-performance site that ranks and converts.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-sm font-bold text-foreground">
            <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />{' '}
              {isEs ? '100% Propiedad del Código' : '100% Code Ownership'}
            </span>
            <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <LockOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />{' '}
              {isEs ? 'Sin Contratos Forzosos' : 'Zero Lock-in'}
            </span>
            <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />{' '}
              {isEs ? 'Cero Facturas Sorpresa' : 'No Surprise Invoices'}
            </span>
          </div>
        </div>

        {/* 3 Core Packages Grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-4">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              id={pkg.id}
              className={`relative !overflow-visible rounded-lg p-5 sm:p-8 md:p-10 flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-2xl ${
                pkg.featured
                  ? 'bg-[#151b2a] text-white border border-[#00D8F6]/40 shadow-2xl shadow-sky-950/25 ring-1 ring-[#00D8F6]/30 scale-[1.01] lg:-translate-y-2'
                  : `stitch-card border-border ${pkg.borderHover}`
              }`}
            >
              <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                <div
                  className={`pointer-events-none absolute -right-14 -top-14 w-44 h-44 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 ${
                    pkg.featured ? 'bg-[#00D8F6]/20' : 'bg-accent/10 dark:bg-accent/15'
                  }`}
                />
                <div
                  className={`absolute inset-x-0 top-0 h-[1px] ${
                    pkg.featured
                      ? 'bg-gradient-to-r from-transparent via-[#00D8F6]/50 to-transparent'
                      : 'bg-gradient-to-r from-transparent via-accent/30 to-transparent'
                  }`}
                />
              </div>

              {pkg.badge && (
                <div
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1 rounded-lg font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest shadow-md z-20 whitespace-nowrap ${
                    pkg.featured
                      ? 'bg-[#001f26] text-[#4cd7f6] border border-[#00D8F6]/50 shadow-[#00D8F6]/20'
                      : 'bg-accent text-accent-foreground shadow-accent/25 border border-white/20'
                  }`}
                >
                  <Sparkles className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${pkg.featured ? 'text-[#4cd7f6]' : 'text-current'}`} />
                  <span>{pkg.badge[lang]}</span>
                </div>
              )}

              <div className="space-y-5 sm:space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shadow-sm ${
                      pkg.featured ? 'bg-white/10 text-[#00D8F6]' : `${pkg.accentBg} ${pkg.accent}`
                    }`}
                  >
                    {pkg.icon}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-black uppercase tracking-widest font-mono ${
                      pkg.featured ? 'text-[#4cd7f6]' : 'text-muted-foreground'
                    }`}
                  >
                    {pkg.subtitle[lang]}
                  </span>
                </div>

                <div>
                  <h3 className={`text-xl sm:text-2xl md:text-3xl font-black ${pkg.featured ? 'text-white' : 'text-foreground'}`}>
                    {pkg.name[lang]}
                  </h3>

                  {pkg.featured ? (
                    <div className="mt-3 p-3 sm:p-3.5 rounded-lg bg-white/10 border border-white/10">
                      <span className="text-xl sm:text-2xl lg:text-[1.65rem] xl:text-3xl font-extrabold text-white tracking-tight whitespace-nowrap block">
                        {pkg.price}
                      </span>
                      <p className="text-[11px] sm:text-xs text-[#4cd7f6] font-mono font-medium mt-1">
                        {pkg.priceNote[lang]}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 sm:mt-3">
                      <span className="text-xl sm:text-2xl lg:text-[1.65rem] xl:text-3xl font-extrabold text-foreground tracking-tight whitespace-nowrap block">
                        {pkg.price}
                      </span>
                      <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-1">
                        {pkg.priceNote[lang]}
                      </p>
                    </div>
                  )}
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed ${pkg.featured ? 'text-slate-300' : 'text-muted-foreground'}`}>
                  {pkg.desc[lang]}
                </p>

                <div
                  className={`p-3 sm:p-3.5 rounded-lg text-xs leading-relaxed ${
                    pkg.featured
                      ? 'bg-[#00D8F6]/10 border border-[#00D8F6]/25 text-slate-200'
                      : 'bg-accent/5 border border-accent/20 text-foreground'
                  }`}
                >
                  <strong className={pkg.featured ? 'text-[#4cd7f6] font-bold' : 'text-accent font-bold'}>
                    {isEs ? 'Elige este si: ' : 'Pick this if: '}
                  </strong>
                  <span>{pkg.pickThisIf[lang]}</span>
                </div>

                <div
                  className={`p-3 sm:p-3.5 rounded-lg text-xs ${
                    pkg.featured
                      ? 'bg-white/5 border border-white/10 text-slate-300'
                      : 'bg-muted/40 border border-border/50 text-muted-foreground'
                  }`}
                >
                  <strong className={`font-bold ${pkg.featured ? 'text-white' : 'text-foreground'}`}>
                    {isEs ? 'Ideal para: ' : 'Best for: '}
                  </strong>
                  {pkg.bestFor[lang]}
                </div>

                <div className={`pt-5 sm:pt-6 space-y-3 ${pkg.featured ? 'border-t border-white/10' : 'border-t border-border/60'}`}>
                  <p className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${pkg.featured ? 'text-slate-200' : 'text-foreground/80'}`}>
                    {isEs ? 'Qué Incluye:' : "What's Included:"}
                  </p>
                  <ul className="space-y-2 sm:space-y-2.5">
                    {pkg.included[lang].map((item, idx) => (
                      <li key={idx} className={`flex items-start gap-2 sm:gap-2.5 text-xs md:text-sm leading-snug ${pkg.featured ? 'text-slate-100' : 'text-foreground/90'}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 mt-0.5 ${pkg.featured ? 'text-[#4cd7f6]' : 'text-emerald-500'}`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`p-3 sm:p-3.5 rounded-lg text-xs leading-relaxed ${
                    pkg.featured
                      ? 'bg-white/5 border border-white/10 text-slate-300'
                      : 'bg-muted/30 border border-border/50 text-muted-foreground'
                  }`}
                >
                  <strong className={`font-bold block mb-1 ${pkg.featured ? 'text-[#4cd7f6]' : 'text-accent'}`}>
                    {isEs ? '¿Por qué este rango?' : 'Why the range?'}
                  </strong>
                  <span>{pkg.whyTheRange[lang]}</span>
                </div>
              </div>

              <div className="pt-6 sm:pt-8 relative z-10">
                <Link
                  href={pkg.href}
                  className={`w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-bold font-mono text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    pkg.featured
                      ? 'bg-[#00D8F6] hover:bg-[#38bdf8] text-[#090D16] font-black hover:scale-[1.02] shadow-lg shadow-[#00D8F6]/25 border border-[#00D8F6] active:scale-[0.99]'
                      : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-sm dark:bg-card dark:text-foreground dark:border-border dark:hover:bg-muted/80 dark:hover:border-accent/40'
                  }`}
                >
                  <span>{pkg.cta[lang]}</span>{' '}
                  <ArrowRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${pkg.featured ? 'text-[#090D16]' : 'text-[#00D8F6] dark:text-current'}`} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Client Testimonials Spotlight */}
        <section aria-label={isEs ? 'Opiniones de clientes' : 'Client Feedback'} className="pt-2 sm:pt-4">
          <div className="max-w-5xl mx-auto">
            <div
              onMouseEnter={() => setIsTestimonialPaused(true)}
              onMouseLeave={() => setIsTestimonialPaused(false)}
              onFocusCapture={() => setIsTestimonialPaused(true)}
              onBlurCapture={() => setIsTestimonialPaused(false)}
              className="relative rounded-lg p-6 sm:p-10 md:p-12 overflow-hidden border border-border/80 shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-slate-50/80 to-sky-50/30 dark:from-[#111928] dark:via-[#0e1624] dark:to-[#0a121f] dark:border-slate-800/80 dark:shadow-2xl before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#00F2FE]/70 before:to-[#00F5A0]/70"
            >
              <div className="pointer-events-none absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-accent/5 dark:bg-[#00F2FE]/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 -top-20 w-64 h-64 rounded-full bg-emerald-500/5 dark:bg-[#00F5A0]/10 blur-3xl" />

              <div className="absolute top-6 right-8 text-slate-200/60 dark:text-white/[0.04] select-none pointer-events-none">
                <Quote className="w-24 h-24 sm:w-32 sm:h-32" aria-hidden="true" />
              </div>

              <div className="relative z-10 space-y-5 sm:space-y-6" aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-700 text-amber-700 dark:fill-amber-400 dark:text-amber-400"
                        aria-hidden="true"
                      />
                    ))}
                    <span className="ml-2 font-mono text-[10px] sm:text-xs font-black tracking-wider text-slate-700 dark:text-slate-300 uppercase">
                      5.0 · {isEs ? 'Reseña de cliente' : 'Client review'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-600 dark:text-slate-300 mr-1">
                      {String(activeTestimonial + 1).padStart(2, '0')} / {String(totalTestimonials).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectTestimonial(activeTestimonial - 1)}
                      aria-label={isEs ? 'Reseña anterior' : 'Previous client review'}
                      className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-900/90 hover:border-accent/60 hover:text-accent text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectTestimonial(activeTestimonial + 1)}
                      aria-label={isEs ? 'Siguiente reseña' : 'Next client review'}
                      className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-900/90 hover:border-accent/60 hover:text-accent text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="grid">
                  {clientTestimonials.map((item) => (
                    <p
                      key={`packages-sizer-${item.id}`}
                      aria-hidden="true"
                      className="col-start-1 row-start-1 invisible pointer-events-none select-none text-base sm:text-lg md:text-xl lg:text-[1.3rem] font-medium leading-relaxed"
                    >
                      &ldquo;{isEs ? item.quoteEs : item.quote}&rdquo;
                    </p>
                  ))}

                  <div className="col-start-1 row-start-1 flex items-center">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.blockquote
                        key={currentTestimonial.id}
                        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.22 }}
                        className="text-base sm:text-lg md:text-xl lg:text-[1.3rem] font-medium leading-relaxed text-slate-800 dark:text-slate-100"
                      >
                        &ldquo;{isEs ? currentTestimonial.quoteEs : currentTestimonial.quote}&rdquo;
                      </motion.blockquote>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/70 dark:border-slate-800/80">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00F2FE]/20 to-[#00F5A0]/20 border border-[#00F2FE]/30 dark:border-[#00F2FE]/40 flex items-center justify-center font-bold text-accent dark:text-[#00F2FE] text-base tracking-tight shadow-sm shrink-0">
                      {currentTestimonial.initials}
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-black text-foreground">{currentTestimonial.author}</div>
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                        {isEs ? currentTestimonial.roleEs : currentTestimonial.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {isEs ? currentTestimonial.categoryEs : currentTestimonial.category}
                    </span>
                    {currentTestimonial.caseStudyHref && (
                      <Link
                        href={currentTestimonial.caseStudyHref}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wide uppercase bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors"
                      >
                        <span>
                          {isEs
                            ? currentTestimonial.caseStudyLabelEs ?? 'Ver caso de éxito'
                            : currentTestimonial.caseStudyLabel ?? 'View case study'}
                        </span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="laser-divider my-8" />

        {/* Ongoing Care & Optional Add-ons Row */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          <div id="ongoing-care" className="stitch-card p-5 sm:p-8 md:p-10 rounded-lg shadow-md flex flex-col justify-between h-full group hover:border-accent/40 transition-all duration-300 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent">
            <div className="pointer-events-none absolute -right-14 -top-14 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

            <div className="space-y-5 sm:space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="px-2.5 sm:px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest font-mono">
                  {isEs ? 'Extra Opcional' : 'Optional Add-on'}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground">
                  {isEs ? 'Mantenimiento Continuo' : 'Ongoing Care'}
                </h3>
                <div className="mt-1 sm:mt-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-foreground">$99 – $250</span>
                  <span className="text-muted-foreground font-medium text-xs sm:text-sm">
                    {isEs ? ' / mes' : ' / month'}
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                {isEs
                  ? 'Hosting administrado, monitoreo, seguridad y ajustes pequeños para que tu sitio siga rápido y no se convierta en un problema después.'
                  : 'Hosting, monitoring, security, and small updates so the site stays fast and doesn’t become someone else’s problem later.'}
              </p>

              <ul className="space-y-2 sm:space-y-2.5 border-t border-border/60 pt-5 sm:pt-6">
                {(isEs
                  ? [
                      'Hosting administrado + monitoreo de disponibilidad 24/7',
                      'Actualizaciones automáticas de seguridad y dependencias',
                      'Cambios mensuales menores de textos, fotos o formularios',
                      'Revisión trimestral de velocidad y SEO técnico',
                      'Ajustes ligeros con asistencia de IA en formularios o textos',
                      'Se puede sumar a cualquier paquete. Cancela cuando quieras.',
                    ]
                  : [
                      'Managed hosting + 24/7 uptime monitoring',
                      'Automated security & platform dependency updates',
                      'Small monthly content, copy, or form updates',
                      'Quarterly performance and SEO audit check',
                      'Optional light AI-assisted content or form optimization',
                      'Can be added to any package above. Cancel anytime.',
                    ]
                ).map((item, idx) => (
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
                className="w-full py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-lg font-bold font-mono text-xs sm:text-sm bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-sm dark:bg-card dark:text-foreground dark:border-border dark:hover:bg-muted/80 dark:hover:border-accent/40 flex items-center justify-center gap-2 transition-all"
              >
                <span>{isEs ? 'Agregar Mantenimiento' : 'Add Ongoing Care'}</span>{' '}
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D8F6] dark:text-current" />
              </Link>
            </div>
          </div>

          <div className="stitch-card p-5 sm:p-8 md:p-10 rounded-lg shadow-md flex flex-col justify-between h-full group hover:border-accent/40 transition-all duration-300 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent">
            <div className="pointer-events-none absolute -right-14 -top-14 w-40 h-40 bg-accent/10 dark:bg-accent/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

            <div className="space-y-5 sm:space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="px-2.5 sm:px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest font-mono">
                  {isEs ? 'Módulos a la Medida' : 'Custom Modules'}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground">
                  {isEs ? 'Extras Opcionales' : 'Optional Add-Ons'}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                  {isEs
                    ? 'Añade cualquiera de estos módulos según lo que necesite tu operación.'
                    : 'Layer these onto any package above to fit your exact operational needs.'}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 border-t border-border/60 pt-5 sm:pt-6">
                <div className="p-3 sm:p-4 rounded-lg bg-muted/40 border border-border/60 flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-accent/10 text-accent shrink-0">
                    <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-xs sm:text-sm">
                        {isEs ? 'Sitio y Formularios Bilingües (Inglés / Español)' : 'Bilingual (Spanish) Key Pages & Forms'}
                      </h4>
                      <span className="text-[11px] sm:text-xs font-black text-accent ml-2">+$500 – $950</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                      {isEs
                        ? 'Español natural y formularios adaptados para atender a toda la comunidad hispana y angloparlante del Norte de Virginia.'
                        : "Native Spanish translation and localized intake forms for Northern Virginia's diverse audience."}
                    </p>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-lg bg-muted/40 border border-border/60 flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 shrink-0">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-xs sm:text-sm">
                        {isEs ? 'Automatizaciones o Asistentes con IA' : 'Custom AI Workflow or Automation'}
                      </h4>
                      <span className="text-[11px] sm:text-xs font-black text-purple-700 dark:text-purple-400 ml-2">
                        {isEs ? 'Tras Llamada' : 'Scoped After Call'}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                      {isEs
                        ? 'Clasificación automática de prospectos, asistentes conectados a tus datos reales o flujos ligados a tu correo y CRM.'
                        : 'Automated lead routing, LLM customer triage, or internal workflow automation connected to your inbox or CRM.'}
                    </p>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50 flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-pink-500/10 text-pink-700 dark:text-pink-400 shrink-0">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-xs sm:text-sm">
                        {isEs ? 'Membresías o Portal de Comunidad' : 'Membership or Community Features'}
                      </h4>
                      <span className="text-[11px] sm:text-xs font-black text-pink-700 dark:text-pink-400 ml-2">
                        {isEs ? 'Cotizado Aparte' : 'Scoped Separately'}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                      {isEs
                        ? 'Portales privados para socios, cobros de suscripción recurrente y directorios probados en clubes reales.'
                        : 'Gated member portals, subscription access, or community tools derived from established club platforms.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 sm:pt-8 relative z-10">
              <Link
                href="/contact"
                className="w-full py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-lg font-bold font-mono text-xs sm:text-sm bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-sm dark:bg-card dark:text-foreground dark:border-border dark:hover:bg-muted/80 dark:hover:border-accent/40 flex items-center justify-center gap-2 transition-all"
              >
                <span>{isEs ? 'Cotizar Módulos Extra' : 'Discuss Custom Modules'}</span>{' '}
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D8F6] dark:text-current" />
              </Link>
            </div>
          </div>
        </div>

        {/* Content Engine Add-On */}
        <div id="content-engine" className="mt-6 sm:mt-8 stitch-card p-5 sm:p-8 md:p-10 rounded-lg shadow-md flex flex-col justify-between group hover:border-accent/40 transition-all duration-300 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent">
          <div className="pointer-events-none absolute -right-14 -top-14 w-40 h-40 bg-accent/10 dark:bg-accent/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

          <div className="space-y-6 sm:space-y-8 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <Megaphone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="px-2.5 sm:px-3 py-1 bg-accent/10 text-accent rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest font-mono">
                  {isEs ? 'Plan Mensual para Clientes RottyM' : 'Monthly Add-On for RottyM Clients'}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground">Content Engine</h3>
                <p className="text-foreground font-semibold text-sm sm:text-base mt-1.5">
                  {isEs
                    ? 'Pongo tu negocio frente a clientes todos los días y los llevo directo a tu sitio web.'
                    : 'I put your business in front of people every day and send them to your site.'}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mt-2">
                  {isEs
                    ? 'Es el mismo motor que uso a diario para RottyM en LinkedIn, X y Facebook — ahora disponible como servicio mensual para tu negocio.'
                    : 'This is the same engine I run for RottyM — daily LinkedIn, X, and Facebook — now as a monthly add-on for your business.'}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 border-t border-border/60 pt-5 sm:pt-6">
              <div className="p-4 sm:p-5 rounded-lg bg-muted/40 border border-border/60 space-y-4">
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-foreground">Content Engine</h4>
                  <div className="mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground">$595</span>
                    <span className="text-muted-foreground font-medium text-xs sm:text-sm">
                      {isEs ? ' / mes' : ' / month'}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider font-mono text-muted-foreground">
                  {isEs ? 'Qué incluye:' : 'What you get:'}
                </p>
                <ul className="space-y-2 sm:space-y-2.5">
                  {(isEs
                    ? [
                        '4 publicaciones semanales (16 al mes) en LinkedIn y Facebook — donde tus clientes locales sí te ven',
                        'Escrito para tu negocio: tus servicios, tu historia y tu ciudad — nada genérico',
                        'Cada publicación enlaza a tu sitio web para convertir visibilidad en visitas',
                        'Apruebas cada texto e imagen antes de publicar — cero sorpresas',
                        'Calendario mensual planeado por adelantado para que sepas qué viene',
                        'Reporte mensual con datos reales: impresiones, clics a tu sitio y visitas al perfil',
                      ]
                    : [
                        '4 posts a week (16 a month) across LinkedIn and Facebook — the two channels where local customers actually see you',
                        'Written for your business: your services, your story, your town — not generic filler',
                        'Every post links back to your website, so the attention turns into visits',
                        'You approve every post before it goes live — exact text and image, no surprises',
                        "A content calendar planned a month ahead, so you always know what's coming",
                        'A monthly report with the real numbers: impressions, clicks to your site, profile visits',
                      ]
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-2.5 text-xs md:text-sm text-foreground/90 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 sm:p-5 rounded-lg bg-muted/40 border border-accent/40 space-y-4">
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-foreground">Content Engine Plus</h4>
                  <div className="mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground">$895</span>
                    <span className="text-muted-foreground font-medium text-xs sm:text-sm">
                      {isEs ? ' / mes' : ' / month'}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider font-mono text-accent">
                  {isEs ? 'Todo lo de Content Engine, más:' : 'Everything in Content Engine, plus:'}
                </p>
                <ul className="space-y-2 sm:space-y-2.5">
                  {(isEs
                    ? [
                        'Publicaciones diarias entre semana (20 al mes)',
                        '1 artículo corto al mes publicado directo en tu sitio web',
                        'Instagram incluido',
                        'Llamada mensual de 30 minutos para planear el siguiente mes',
                      ]
                    : [
                        'Daily weekday posts (20 a month)',
                        '1 short article a month published on your own site',
                        'Instagram included',
                        "A 30-minute call each month to plan what's next",
                      ]
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-2.5 text-xs md:text-sm text-foreground/90 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 border-t border-border/60 pt-5 sm:pt-6">
              <div className="space-y-3">
                <h4 className="text-sm sm:text-base font-black text-foreground">
                  {isEs ? 'Lo que sí prometo' : 'What I promise'}
                </h4>
                <ul className="space-y-2">
                  {(isEs
                    ? [
                        { label: 'Constancia.', text: 'Sale cada semana según calendario. Ahí está la clave.' },
                        { label: 'Aprobación.', text: 'Nada se publica sin tu visto bueno. Nunca.' },
                        { label: 'Autenticidad.', text: 'Cero seguidores comprados, cero inventos sobre tu negocio.' },
                        { label: 'Transparencia.', text: 'Reporte mensual con números reales — buenos o por mejorar.' },
                        { label: 'Tu propia voz.', text: 'Suena a ti, no a plantilla robótica.' },
                      ]
                    : [
                        { label: 'Consistency.', text: "Posts go out on schedule, every week. That's the whole game." },
                        { label: 'Approval.', text: 'Nothing posts without your sign-off. Ever.' },
                        { label: 'Real.', text: 'No bought followers, no fake engagement, no invented claims about your business.' },
                        { label: 'Transparent.', text: 'A monthly report with the actual numbers — good or bad.' },
                        { label: 'Your voice.', text: 'Posts sound like you, not like a robot.' },
                      ]
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-foreground">{item.label}</strong> {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm sm:text-base font-black text-foreground">
                  {isEs ? 'Lo que NO prometo' : "What I don't promise"}
                </h4>
                <ul className="space-y-2">
                  {(isEs
                    ? [
                        'Un número mágico garantizado de ventas o seguidores. Nadie honesto puede prometerlo.',
                        'Posicionamiento inmediato en Google. El SEO es otro trabajo y toma meses.',
                        'Publicaciones virales. Esperar a hacerse viral no es una estrategia de negocio.',
                      ]
                    : [
                        'A specific number of leads, sales, or followers. Nobody honest can promise that.',
                        "Google rankings. That's SEO — a different service, and it takes months.",
                        "Viral posts. Virality isn't a strategy.",
                      ]
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                      <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 border-t border-border/60 pt-5 sm:pt-6">
              <div className="space-y-3">
                <h4 className="text-sm sm:text-base font-black text-foreground">
                  {isEs ? 'Cómo funciona' : 'How it works'}
                </h4>
                <ol className="space-y-2">
                  {(isEs
                    ? [
                        'Conversamos una vez sobre tu negocio, tus clientes y lo que quieres comunicar.',
                        'Redacto los posts del mes. Tú apruebas cada uno antes de programar.',
                        'Se publican en tus horarios y al cierre del mes recibes tu reporte.',
                        'Ajustamos la estrategia según lo que generó mejores resultados.',
                      ]
                    : [
                        'We talk once about your business, your customers, and what you want people to know.',
                        "I write the month's posts. You approve each one before it goes out.",
                        'Posts go live on your schedule. The report lands at the end of the month.',
                        'We adjust based on what actually worked.',
                      ]
                  ).map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-foreground/90">
                      <span className="font-mono font-bold text-accent shrink-0">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm sm:text-base font-black text-foreground">
                    {isEs ? 'Resultados reales' : 'Proof it works'}
                  </h4>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {isEs
                      ? 'Es el mismo sistema que utilizo para mi propia marca. En una semana mis impresiones en LinkedIn subieron de 1,903 a 6,253 y las visitas al perfil de 19 a 109. Una sola historia sobre migrar de WordPress a Next.js alcanzó 2,718 impresiones y 14 comentarios, casi todos de personas nuevas.'
                      : "This is what I run for my own business. In one week, my LinkedIn post impressions went from 1,903 to 6,253, and profile viewers went from 19 to 109. One post — a WordPress-to-Next.js rebuild story — hit 2,718 impressions and 14 comments, mostly from people who'd never seen my page before."}
                  </p>
                  <p className="text-xs md:text-sm font-semibold text-foreground">
                    {isEs ? 'El mismo motor. Para tu negocio.' : 'Same engine. Your business.'}
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="text-sm sm:text-base font-black text-foreground">
                    {isEs ? 'Condiciones' : 'Terms'}
                  </h4>
                  <ul className="space-y-1.5 text-xs md:text-sm text-muted-foreground">
                    {(isEs
                      ? [
                          'Complemento para sitios RottyM. Se combina con Mantenimiento Continuo ($99–$250/mes) para operar tu sitio.',
                          'Inicio mínimo de 3 meses — el contenido da resultados con semanas de constancia — luego mes a mes y cancelas cuando quieras.',
                          'Eres dueño de todo: cada texto, imagen y publicación.',
                        ]
                      : [
                          'Add-on to a RottyM website. Pairs with Ongoing Care ($99–$250/mo), which keeps the site itself running.',
                          '3-month start — content compounds over weeks, not days — then month-to-month, cancel anytime.',
                          'You own everything: every post, every image, every word.',
                        ]
                    ).map((term, idx) => (
                      <li key={idx}>{term}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 relative z-10">
            <Link
              href="/contact"
              className="w-full py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-lg font-bold font-mono text-xs sm:text-sm bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-sm dark:bg-card dark:text-foreground dark:border-border dark:hover:bg-muted/80 dark:hover:border-accent/40 flex items-center justify-center gap-2 transition-all"
            >
              <span>{isEs ? 'Agregar Content Engine' : 'Add Content Engine'}</span>{' '}
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D8F6] dark:text-current" />
            </Link>
          </div>
        </div>

        <div className="laser-divider my-10 sm:my-16" />

        {/* Bottom CTA */}
        <div className="p-6 sm:p-10 md:p-14 rounded-lg bg-[#090D16] text-white dark:bg-accent dark:text-accent-foreground relative overflow-hidden shadow-2xl border border-slate-800 dark:border-transparent">
          <div className="absolute inset-0 bg-dot-grid opacity-15 pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center space-y-5 sm:space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 dark:bg-black/20 border border-white/20 dark:border-black/20 text-xs font-mono font-bold uppercase tracking-wider text-[#00D8F6] dark:text-accent-foreground">
              <FileText className="w-3.5 h-3.5 text-[#00D8F6] dark:text-accent-foreground shrink-0" />
              <span>{isEs ? 'ALCANCE Y PROPUESTA DIRECTA' : 'DIRECT SCOPING & PROPOSAL'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight">
              {isEs ? '¿Listo para elegir el paquete ideal?' : 'Ready to see what fits?'}
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl font-bold opacity-95 text-[#00D8F6] dark:text-inherit">
              {isEs
                ? 'La mayoría de proyectos en Reston y Norte de Virginia están entre $2,500 y $6,500.'
                : 'Most Reston and Northern Virginia projects land between $2,500 and $6,500.'}
            </p>
            <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl mx-auto leading-relaxed text-slate-300 dark:text-inherit">
              {isEs
                ? 'La cifra que acordamos tras la llamada gratis de 30 minutos es exactamente lo que pagas. Sin rangos que luego se inflan en la factura.'
                : 'The number you get after a free 30-minute call is the exact number you’re billed. No ranges that turn into surprise invoices.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[#00D8F6] hover:bg-[#00F2FE] text-[#090D16] dark:bg-accent-foreground dark:text-accent dark:hover:bg-[#151D2F] dark:hover:text-accent px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-lg font-bold font-mono text-xs sm:text-sm hover:scale-105 transition-transform shadow-xl"
              >
                <span>{isEs ? 'Agenda 30 min gratis' : 'Book a free 30-minute call'}</span>{' '}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact?intent=secure-spot"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 dark:bg-accent/20 dark:hover:bg-accent/30 dark:text-accent-foreground dark:border-accent-foreground/30 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-lg font-bold font-mono text-xs sm:text-sm transition-all"
              >
                {isEs ? 'Apartar Tu Lugar' : 'Secure Your Spot'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
