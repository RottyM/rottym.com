// src/app/page.tsx
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Rocket,
  Zap,
  Globe,
  Cpu,
  Users,
  Workflow,
  Boxes,
  Layers,
  Compass,
  Phone,
} from 'lucide-react';
import { HeroQuoteDeck, ClientProofSpotlight } from '@/components/TestimonialShowcases';
import { useLang } from '@/components/ThemeProvider';

export default function Home() {
  const { lang } = useLang();
  const isEs = lang === 'es';

  const clientLogos = [
    {
      name: 'Disney',
      whiteSrc: '/images/logos/clients/disney-white.svg',
      stdSrc: '/images/logos/clients/disney.svg',
      heightClass: 'h-7 sm:h-8 md:h-9',
      maxWidth: 'max-w-[110px] sm:max-w-[130px]',
    },
    {
      name: 'FEMA',
      whiteSrc: '/images/logos/clients/fema-dark.svg',
      stdSrc: '/images/logos/clients/fema.svg',
      heightClass: 'h-8 sm:h-9 md:h-10',
      maxWidth: 'max-w-[115px] sm:max-w-[135px]',
    },
    {
      name: 'BAE Systems',
      whiteSrc: '/images/logos/clients/bae-systems-white.svg',
      stdSrc: '/images/logos/clients/bae-systems.svg',
      heightClass: 'h-5 sm:h-6 md:h-7',
      maxWidth: 'max-w-[130px] sm:max-w-[155px]',
    },
    {
      name: 'FAA',
      whiteSrc: '/images/logos/clients/faa-dark.svg',
      stdSrc: '/images/logos/clients/faa.svg',
      heightClass: 'h-8 sm:h-9 md:h-10',
      maxWidth: 'max-w-[115px] sm:max-w-[135px]',
    },
    {
      name: 'Leidos',
      whiteSrc: '/images/logos/clients/leidos-white.svg',
      stdSrc: '/images/logos/clients/leidos.svg',
      heightClass: 'h-6 sm:h-7 md:h-8',
      maxWidth: 'max-w-[115px] sm:max-w-[135px]',
    },
    {
      name: 'USA Today',
      whiteSrc: '/images/logos/clients/usa-today-white.svg',
      stdSrc: '/images/logos/clients/usa-today.svg',
      heightClass: 'h-5 sm:h-6 md:h-7',
      maxWidth: 'max-w-[130px] sm:max-w-[155px]',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-10 pb-6 sm:pb-8 md:pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
        <div className="absolute top-0 right-0 -z-10 w-2/3 h-full bg-gradient-to-l from-accent/15 via-blue-500/10 to-transparent blur-3xl opacity-60 transition-colors" />
        <div className="absolute -top-24 -left-24 -z-10 w-[28rem] h-[28rem] bg-gradient-to-br from-sky-500/10 dark:from-emerald-500/10 via-accent/5 to-transparent rounded-full blur-3xl animate-pulse-soft transition-colors" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-14 items-start w-full">
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="min-w-0 space-y-4 sm:space-y-5"
          >
            <div className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 sm:gap-2 glass px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-sm backdrop-blur-md border border-border max-w-full">
              <span className="font-mono text-[9px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold">
                {isEs ? 'Al servicio del Norte de Virginia y más allá' : 'Serving Northern Virginia and Beyond'}
              </span>
              <span className="text-border hidden sm:inline" aria-hidden="true">·</span>
              <span className="font-mono text-[9px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap hidden sm:inline">
                Reston, VA
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-[1.12] tracking-tight drop-shadow-sm">
              {isEs
                ? 'Un sitio web rápido que convierte búsquedas locales en '
                : 'A fast website that turns local searches into '}
              <span className="tech-gradient-text">
                {isEs ? 'nuevos clientes.' : 'new customers.'}
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">
              {isEs
                ? 'La IA puede generar un sitio web. No puede dirigir tu negocio.'
                : "AI can generate a website. It can't run your business."}
            </p>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl font-medium">
              {isEs
                ? 'Construyo sitios web rápidos y modernos para cualquier negocio del Norte de Virginia que lo necesite — restaurantes, contratistas, autores, tiendas y organizaciones — con reservas en línea, cotizaciones y flujos a la medida. '
                : 'I build fast, modern websites for any Northern Virginia business that needs one — restaurants, contractors, authors, shops, nonprofits, you name it — with online booking, quote forms, and custom workflows included. '}
              <strong className="text-foreground font-bold">
                {isEs ? 'Desde $2,500, y eres dueño al 100%.' : 'From $2,500, and you own 100% of it.'}
              </strong>
            </p>

            <HeroQuoteDeck />

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 w-full">
              <Link
                href="/contact"
                className="group flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] dark:hover:text-accent-foreground px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg font-bold font-mono text-xs sm:text-sm hover:scale-[1.02] transition-all shadow-md shadow-black/10 dark:shadow-accent/20 border border-[#090D16] dark:border-transparent"
              >
                <span>{isEs ? 'Agenda 30 min gratis' : 'Book a free 30-minute call'}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D8F6] dark:text-current group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:2028540954"
                className="flex items-center justify-center gap-2.5 bg-accent/15 hover:bg-accent/25 text-foreground border border-accent dark:border-accent/70 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg font-mono text-xs sm:text-sm font-bold transition-all shadow-sm group"
                aria-label={isEs ? 'Llamar al (202) 854-0954' : 'Call (202) 854-0954'}
              >
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <div className="text-left leading-tight">
                  <div className="font-bold text-accent dark:text-[#00F2FE]">(202) 854-0954</div>
                  <div className="text-[9px] sm:text-[10px] text-slate-700 dark:text-slate-300 font-sans font-medium tracking-normal">
                    {isEs ? 'Línea directa · Toca para llamar' : 'Direct line · Tap to call'}
                  </div>
                </div>
              </a>
            </div>

            <p className="font-mono text-xs sm:text-[12.5px] text-muted-foreground pt-1 leading-relaxed">
              <strong className="text-foreground font-bold">
                {isEs ? 'Desde $2,500' : 'From $2,500'}
              </strong>{' '}
              · {isEs ? 'Sin facturación por hora fuera de control' : 'No runaway hourly billing'}
              <span className="hidden sm:inline">
                {' '}
                · <strong className="text-accent font-bold">{isEs ? '¿Prefieres conversar?' : 'Prefer to talk?'}</strong>{' '}
                {isEs ? 'Llama directo con el botón de arriba.' : 'Call directly via the button above.'}
              </span>
            </p>
          </motion.div>

          <div className="min-w-0 relative w-full max-w-lg mx-auto lg:max-w-none">
            <div className="absolute -top-10 right-0 lg:-right-10 w-48 h-48 bg-accent/20 dark:bg-accent/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Browser Frame */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1424]">
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

              <div className="p-4 sm:p-5 pb-2 sm:pb-3 space-y-1 bg-gradient-to-b from-slate-50/50 to-white dark:from-[#0d1627] dark:to-[#0a111e]">
                <p className="font-mono text-[10.5px] font-bold tracking-wider uppercase text-accent dark:text-[#00F2FE]">
                  {isEs ? 'Trabajo real · Negocios reales' : 'Real work · Real businesses'}
                </p>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  {isEs ? 'Sitios web para ' : 'Websites for '}
                  <span className="text-accent dark:text-[#00F2FE]">
                    {isEs ? 'todo tipo' : 'every kind'}
                  </span>
                  {isEs ? ' de negocio.' : ' of business.'}
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-normal">
                  {isEs
                    ? 'Autores, archivos históricos, un club de escritores, un negocio local o una plataforma de motos — si necesita web, pertenece aquí.'
                    : 'Authors, archives, a writers club, a storefront, a motorcycle platform — if it needs a website, it belongs here.'}
                </p>
              </div>

              <div className="px-3 sm:px-4 py-1.5 sm:py-2 space-y-2 bg-white dark:bg-[#0c1424]">
                {[
                  {
                    monogram: 'NV',
                    bg: 'bg-[#0e7a4f]',
                    title: 'Northern Virginia Writers Club',
                    subtitle: isEs ? 'Membresías y portal colaborativo' : 'Nonprofit / membership platform',
                    href: '/portfolio/northern-virginia-writers',
                  },
                  {
                    monogram: 'FA',
                    bg: 'bg-[#28536b]',
                    title: 'Found Archives',
                    subtitle: isEs ? 'Archivo histórico y curaduría' : 'Archives & research business',
                    href: '/portfolio/found-archives',
                  },
                  {
                    monogram: 'RC',
                    bg: 'bg-[#1a6bb5]',
                    title: "Rebecca's Cleaning",
                    subtitle: isEs ? 'Sitio local con cotizador fijo' : 'Local service landing site',
                    href: '/portfolio/rebeccas-cleaning',
                  },
                  {
                    monogram: 'MT',
                    bg: 'bg-[#132238] ring-1 ring-white/15',
                    title: 'Men Talking LLC',
                    subtitle: isEs ? 'Coaching y bienestar emocional' : 'Coaching & Emotional Wellness',
                    href: '/portfolio/men-talking',
                    desktopOnly: true,
                  },
                ].map((item) => {
                  const cardClasses = `items-center gap-3 p-2 sm:p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 transition-all ${
                    item.href ? 'hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:border-accent/40 group' : ''
                  } ${item.desktopOnly ? 'hidden sm:flex' : 'flex'}`;

                  return (
                    <Link key={item.title} href={item.href} className={cardClasses}>
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${item.bg} flex items-center justify-center font-black text-white text-xs sm:text-sm shrink-0 shadow-sm`}
                      >
                        {item.monogram}
                      </div>
                      <div className="min-w-0 flex-1">
                        <b className="text-xs sm:text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight block truncate group-hover:text-accent transition-colors">
                          {item.title}
                        </b>
                        <span className="text-[10.5px] sm:text-[11.5px] text-slate-500 dark:text-slate-400 leading-tight block truncate mt-0.5">
                          {item.subtitle}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  );
                })}
              </div>

              <div className="px-3 sm:px-4 pt-1 pb-3.5 sm:pb-4 bg-white dark:bg-[#0c1424]">
                <Link
                  href="/portfolio"
                  className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 rounded-lg bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] dark:hover:text-accent-foreground font-mono font-bold text-xs sm:text-sm tracking-wider uppercase shadow-md hover:scale-[1.01] transition-all group border border-[#090D16] dark:border-transparent"
                >
                  <span>{isEs ? 'Ver portafolio completo' : 'See the full portfolio'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00D8F6] dark:text-inherit group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="laser-divider" />

      {/* Client Testimonial Spotlight */}
      <ClientProofSpotlight />

      <div className="laser-divider" />

      {/* Trust Section */}
      <section className="py-20 bg-muted/40 dark:bg-muted/30 transition-colors relative overflow-hidden border-y border-border">
        <div className="absolute inset-0 bg-dot-grid opacity-60 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <p className="text-xs font-bold tracking-widest uppercase text-slate-600 dark:text-muted-foreground mb-10 font-mono">
            {isEs ? 'Experiencia comprobada en ingeniería con' : 'Engineering experience across'}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-10 md:gap-14 lg:gap-16">
            {clientLogos.map((client) => (
              <div
                key={client.name}
                className="flex items-center justify-center opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-105"
                title={client.name}
              >
                <img
                  src={client.whiteSrc}
                  alt={client.name}
                  className={`hidden dark:block w-auto ${client.heightClass} ${client.maxWidth} object-contain`}
                />
                <img
                  src={client.stdSrc}
                  alt={client.name}
                  className={`block dark:hidden w-auto ${client.heightClass} ${client.maxWidth} object-contain`}
                />
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs sm:text-sm font-medium text-slate-600 dark:text-muted-foreground max-w-2xl mx-auto">
            {isEs
              ? 'Experiencia técnica en Disney, FEMA, BAE Systems, FAA, Leidos y USA Today — aplicada ahora a sitios prácticos y plataformas rápidas para negocios locales.'
              : 'Engineering experience across Disney, FEMA, BAE Systems, FAA, Leidos, and USA Today — now applied to practical sites and high-performance platforms for growing businesses.'}
          </p>
        </div>
      </section>

      <div className="laser-divider" />

      {/* Services Section */}
      <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-20 text-balance">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              {isEs ? 'Sitios web modernos con ' : 'Modern websites with '}
              <span className="tech-gradient-text">
                {isEs ? 'flujos de trabajo reales' : 'real workflows'}
              </span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium">
              {isEs
                ? 'Citas que llegan directas a tu calendario, cotizaciones ordenadas y formularios que evitan idas y vueltas innecesarias.'
                : 'Bookings that land on your calendar, quote forms that reach you, and client intake that saves the back-and-forth.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                title: isEs ? 'Sitios Web y Plataformas Digitales' : 'Websites & Digital Platforms',
                desc: isEs
                  ? 'Sitios de alto rendimiento para negocios locales y organizaciones que buscan dejar WordPress o plantillas pesadas. Hechos para durar, cargar rápido y ser 100% tuyos.'
                  : 'High-performance sites and applications for service businesses, non-profits, and organizations moving off WordPress or template platforms. Built with modern stacks for speed, reliability, and easier long-term ownership.',
                icon: <Rocket className="w-6 h-6" />,
                accent: 'text-orange-700 dark:text-orange-400',
                bg: 'bg-orange-500/10',
              },
              {
                title: isEs
                  ? 'Portales de Clientes, Membresías y Herramientas'
                  : 'Client Portals, Membership Systems & Internal Tools',
                desc: isEs
                  ? 'Portales a la medida para registro de clientes, gestión de miembros, documentos y procesos internos cuando los formularios simples ya no alcanzan.'
                  : 'Custom portals for client intake, member management, document sharing, and workflow automation. Designed for teams that have outgrown basic forms or off-the-shelf tools.',
                icon: <Users className="w-6 h-6" />,
                accent: 'text-pink-700 dark:text-pink-400',
                bg: 'bg-pink-500/10',
              },
              {
                title: isEs ? 'Desarrollo Full-Stack' : 'Full-Stack Development',
                desc: isEs
                  ? 'Aplicaciones en Next.js, React y nube (Vercel, Firebase, AWS, GCP) con enfoque en seguridad y mantenimiento. Incluye suscripciones, pagos e IA práctica donde aporta valor real.'
                  : 'Next.js, React, and cloud-backed applications (Vercel, Firebase, AWS, GCP) with attention to performance, security, and maintainability. Includes work on subscription systems, e-commerce, and AI-assisted features where they create real value.',
                icon: <Cpu className="w-6 h-6" />,
                accent: 'text-blue-700 dark:text-blue-400',
                bg: 'bg-blue-500/10',
              },
              {
                title: isEs ? 'Nube y Despliegue Seguro' : 'Cloud & Deployment',
                desc: isEs
                  ? 'Alojamiento seguro, monitoreo y actualizaciones para que tu plataforma siga rápida y estable después del lanzamiento.'
                  : 'Secure, managed hosting and deployment so platforms stay fast and stable after launch.',
                icon: <Globe className="w-6 h-6" />,
                accent: 'text-emerald-700 dark:text-emerald-400',
                bg: 'bg-emerald-500/10',
              },
            ].map((service, idx) => (
              <motion.div
                key={idx}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-6 sm:p-8 rounded-lg border border-slate-200/90 dark:border-border/80 hover:border-accent/50 bg-white dark:bg-card/90 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute right-0 lg:-right-12 -top-12 w-36 h-36 bg-accent/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                <div className={`w-12 h-12 rounded-lg ${service.bg} flex items-center justify-center ${service.accent} mb-6 group-hover:scale-110 transition-transform relative z-10`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 relative z-10">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed relative z-10">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="laser-divider" />

      {/* How We Work Section */}
      <section className="py-16 sm:py-24 bg-background transition-colors relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-6 space-y-10 sm:space-y-16 relative z-10">
          <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 glass px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-md backdrop-blur-md border border-border max-w-full">
              <Workflow className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">
                {isEs ? 'EL PROCESO' : 'THE PROCESS'}
              </span>
              <span className="text-border" aria-hidden="true">|</span>
              <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap">
                {isEs ? 'CÓMO TRABAJAMOS' : 'HOW PROJECTS WORK'}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
              {isEs ? 'Cómo Funciona Un ' : 'How a Project '}
              <span className="tech-gradient-text">{isEs ? 'Proyecto' : 'Works'}</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-medium">
              {isEs
                ? 'Un camino claro y predecible desde la primera llamada hasta el lanzamiento.'
                : 'A clear, predictable roadmap from first conversation to live deployment.'}
            </p>
          </div>

          <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: isEs ? 'Llamada Inicial' : 'Discovery Call',
                time: '30 min',
                desc: isEs
                  ? 'Aclaramos tus metas del negocio, funciones clave, clientes ideales y requisitos técnicos.'
                  : 'I clarify your main business goals, must-have features, audience, and technical constraints.',
              },
              {
                step: '02',
                title: isEs ? 'Propuesta Fija' : 'Fixed Proposal',
                time: isEs ? 'Alcance Claro' : 'Clear Scope',
                desc: isEs
                  ? 'Recibes un precio exacto, fecha de entrega y entregables por escrito. Sin cobros por hora.'
                  : 'You receive an exact price, fixed timeline, and clear deliverables. No runaway hourly billing.',
              },
              {
                step: '03',
                title: isEs ? 'Construcción y Avances' : 'Build & Review',
                time: isEs ? 'Stack Moderno' : 'Modern Stack',
                desc: isEs
                  ? 'Desarrollado con tecnología moderna y revisiones constantes. Tú conservas el 100% del código.'
                  : 'Built on Next.js, React, and cloud infra with regular check-ins. You own 100% of the code and stack.',
              },
              {
                step: '04',
                title: isEs ? 'Lanzamiento y Entrega' : 'Launch & Handoff',
                time: isEs ? 'Sitio En Vivo' : 'Live Site',
                desc: isEs
                  ? 'Publicación en producción, pruebas completas de velocidad y entrega documentada. Soporte continuo opcional.'
                  : 'Production release, full performance checks, and handoff documentation. Optional ongoing support available.',
              },
            ].map((p) => (
              <li
                key={p.step}
                className="group relative p-6 sm:p-8 rounded-lg border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card/90 backdrop-blur-sm hover:border-accent/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-28 h-28 bg-accent/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-2xl font-black font-mono text-accent">
                      <span className="sr-only">{isEs ? 'Paso ' : 'Step '}</span>
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
                  <p className="text-sm text-slate-600 dark:text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="p-6 sm:p-10 rounded-lg border border-accent/25 bg-sky-50/70 dark:bg-accent/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left shadow-sm">
            <div className="space-y-1">
              <p className="text-base md:text-lg font-bold text-slate-900 dark:text-foreground">
                {isEs ? 'La mayoría de proyectos están en el rango de ' : 'Most projects land in the '}
                <span className="text-accent font-black">$2,500–$6,500</span>
                {isEs ? '.' : ' range.'}
              </p>
              <p className="text-sm text-slate-600 dark:text-muted-foreground">
                {isEs
                  ? 'Aplicaciones completas, portales de membresía y flujos con IA se cotizan aparte tras la llamada inicial.'
                  : 'Full-stack apps, membership portals, and custom AI workflows are scoped higher after discovery.'}
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] dark:hover:text-accent-foreground px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-lg font-bold text-sm hover:scale-105 transition-all shadow-md shrink-0 w-full sm:w-auto border border-[#090D16] dark:border-transparent font-mono uppercase tracking-wider text-xs"
            >
              <span>{isEs ? 'Agenda 30 min gratis' : 'Book a free 30-minute call'}</span>{' '}
              <ArrowRight className="w-4 h-4 text-[#00D8F6] dark:text-current" />
            </Link>
          </div>
        </div>
      </section>

      <div className="laser-divider" />

      {/* Local Packages Teaser */}
      <section className="py-16 sm:py-24 bg-muted/20 transition-colors relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-16">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 glass px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-md backdrop-blur-md border border-border max-w-full">
                <Boxes className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">
                  {isEs ? 'PAQUETES DE ALCANCE FIJO' : 'FIXED-SCOPE PACKAGES'}
                </span>
                <span className="text-border" aria-hidden="true">|</span>
                <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap">
                  RESTON &amp; NOVA
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
                {isEs ? 'Paquetes Locales y ' : 'Local Packages & '}
                <span className="tech-gradient-text">{isEs ? 'Precios' : 'Pricing'}</span>
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl font-medium">
                {isEs
                  ? 'Sitios modernos con rangos transparentes. Fijamos tu precio exacto después de una llamada de 30 min.'
                  : 'High-performance modern stacks with transparent starting ranges. Exact price fixed after a 30-min call.'}
              </p>
            </div>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 min-h-[28px] py-1 text-accent font-black text-sm sm:text-base hover:gap-3 transition-all group"
            >
              {isEs ? 'Ver todos los paquetes y extras' : 'Explore All Packages & Add-Ons'}{' '}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: isEs ? 'Lanzamiento Local' : 'Local Launchpad',
                badge: isEs ? 'Más Solicitado' : 'Most Common',
                price: '$2,500 – $3,500',
                desc: isEs
                  ? 'Sitio rápido de 5–8 páginas, optimizado para celular, formularios de cotización y SEO local en NoVA.'
                  : '5–8 page high-performance site, mobile-first speed, quote forms, and local NoVA SEO setup.',
                best: isEs
                  ? 'Restaurantes, servicios del hogar, profesionales independientes'
                  : 'Restaurants, home services, independent pros',
                href: '/packages#local-launchpad',
              },
              {
                title: isEs ? 'Agenda y Registro' : 'Booking & Intake',
                badge: isEs ? 'Flujos de Clientes' : 'Client Workflows',
                price: '$4,200 – $5,800',
                desc: isEs
                  ? 'Todo lo del sitio base más reservas en línea y flujos de registro para reducir llamadas y mensajes.'
                  : 'Full build plus online booking or structured intake workflows to cut admin back-and-forth.',
                best: isEs
                  ? 'Clínicas dentales, consultorios, salones y servicios locales'
                  : 'Dental, clinics, salons, home services',
                featured: true,
                href: '/packages#booking-intake',
              },
              {
                title: isEs ? 'Migración de Alto Rendimiento' : 'Performance Rebuild',
                badge: isEs ? 'Adiós WordPress' : 'WordPress Escape',
                price: '$3,800 – $6,500',
                desc: isEs
                  ? 'Migra desde un WordPress lento o pesado hacia una arquitectura moderna en la nube.'
                  : 'Migrate off slow, bloated WordPress to modern serverless stack (Vercel + headless CMS).',
                best: isEs
                  ? 'Negocios establecidos cansados de plugins rotos y cargas lentas'
                  : 'Established businesses escaping plugin bloat',
                href: '/packages#performance-rebuild',
              },
            ].map((pkg, idx) => (
              <div
                key={idx}
                className={`group relative p-6 sm:p-8 rounded-lg border backdrop-blur-sm flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
                  pkg.featured
                    ? 'bg-[#151b2a] text-white border-[#00D8F6]/40 shadow-xl shadow-sky-950/25 ring-1 ring-[#00D8F6]/30'
                    : 'bg-white dark:bg-card/90 text-foreground border-slate-200/90 dark:border-border/80 hover:border-accent/40 hover:shadow-accent/5'
                }`}
              >
                <div
                  className={`absolute right-0 lg:-right-12 -top-12 w-36 h-36 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none ${
                    pkg.featured ? 'bg-[#00D8F6]/20' : 'bg-accent/10'
                  }`}
                />
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg font-mono ${
                        pkg.featured
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
                    <span className={`font-bold ${pkg.featured ? 'text-white' : 'text-slate-900 dark:text-foreground'}`}>
                      {isEs ? 'Ideal para:' : 'Best for:'}
                    </span>{' '}
                    {pkg.best}
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href={pkg.href}
                    aria-label={`${isEs ? 'Ver detalles' : 'View Package Details'} — ${pkg.title}`}
                    className={`w-full py-3 px-4 rounded-lg text-center font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      pkg.featured
                        ? 'bg-[#00D8F6] hover:bg-[#38bdf8] text-[#090D16] font-black shadow-md shadow-[#00D8F6]/20'
                        : 'bg-slate-100 hover:bg-[#090D16] hover:text-[#00D8F6] text-slate-900 dark:bg-muted dark:hover:bg-accent dark:hover:text-accent-foreground dark:text-foreground'
                    }`}
                  >
                    {isEs ? 'Ver Detalles del Paquete' : 'View Package Details'} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="laser-divider" />

      {/* Selected Work & Projects Section */}
      <section id="examples" className="py-16 sm:py-24 md:py-32 bg-accent/[0.03] transition-colors relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-12 sm:mb-20">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 glass px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-md backdrop-blur-md border border-border max-w-full">
                <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">
                  {isEs ? 'PLATAFORMAS DESTACADAS' : 'SELECTED PLATFORMS'}
                </span>
                <span className="text-border" aria-hidden="true">|</span>
                <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap hidden sm:inline">
                  {isEs ? 'CLIENTES Y SISTEMAS' : 'CLIENT WORK & APPS'}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground uppercase whitespace-nowrap sm:hidden">
                  {isEs ? 'CLIENTES' : 'CLIENT WORK'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
                {isEs ? 'Proyectos y ' : 'Selected Work & '}
                <span className="tech-gradient-text">{isEs ? 'Casos Reales' : 'Projects'}</span>.
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl font-medium">
                {isEs
                  ? 'Una selección de plataformas de clientes y sistemas propios que demuestran arquitectura sólida, visión de producto y velocidad real.'
                  : 'A mix of client platforms and self-initiated systems that demonstrate full-stack development, product thinking, and modern deployment practices.'}
              </p>
            </div>
            <Link href="/portfolio" className="hidden md:flex items-center gap-2 text-foreground font-black hover:text-accent transition-colors group">
              {isEs ? 'Ver Todo el Portafolio' : 'View All Work'}{' '}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                slug: 'throttlelife',
                name: 'ThrottleLife',
                desc: isEs
                  ? 'Plataforma digital de alto rendimiento para motociclistas construida en Next.js con manejo de datos en tiempo real, cuentas de usuario y diseño optimizado para móviles.'
                  : 'A custom operating system concept for motorcycle riders — built as a high-performance Next.js application with real-time data handling, user accounts, and cloud-backed features. Focused on clean architecture and mobile-first interaction.',
                image: '/images/portfolio/throttlelife-homepage.png',
                badge: isEs ? 'Aplicación Next.js' : 'Next.js Application',
                icon: <Zap className="w-5 h-5" />,
              },
              {
                slug: 'found-archives',
                name: 'Found Archives',
                desc: isEs
                  ? 'Reemplazamos un WordPress lento con 28 plugins por un sitio que obtiene 99/100 en Google Lighthouse y responde en menos de un tercio de segundo.'
                  : "Replaced a slow 28-plugin WordPress site with a rebuilt one that scores 99/100 on Google's Lighthouse speed test and starts responding in under a third of a second.",
                image: '/images/portfolio/found-archives-homepage.png',
                badge: isEs ? 'Caso de Migración WordPress' : 'WordPress Escape Case Study',
                icon: <Globe className="w-5 h-5" />,
              },
              {
                slug: 'northern-virginia-writers',
                name: 'Northern Virginia Writers Club',
                desc: isEs
                  ? 'Portal colaborativo y membresía continua del club: roles de miembros, directorio de autores y cobros automáticos con PayPal sin perder datos.'
                  : "Handles the club's membership site and collaboration portal: member roles, a member database, and recurring dues through PayPal. Knowing WordPress this well is why I can move sites off it without breaking anything.",
                image: '/images/portfolio/northernvirginiawriters-home.png',
                badge: isEs ? 'Plataforma de Membresía' : 'WordPress Mastery & Portals',
                icon: <Users className="w-5 h-5" />,
              },
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
                    aria-label={`${isEs ? 'Ver caso de éxito y arquitectura' : 'View Case Study & Architecture'} — ${app.name}`}
                    className="inline-flex items-center gap-1.5 min-h-[28px] py-1 text-xs font-bold text-accent hover:underline group-hover:gap-2 transition-all"
                  >
                    {isEs ? 'Ver Caso de Éxito y Arquitectura' : 'View Case Study & Architecture'}{' '}
                    <span aria-hidden="true">→</span>
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
            <div className="absolute inset-0 bg-dot-grid opacity-15 pointer-events-none" />
            <div className="max-w-4xl mx-auto text-center space-y-5 sm:space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 dark:bg-black/20 border border-white/20 dark:border-black/20 text-xs font-mono font-bold uppercase tracking-wider text-[#00D8F6] dark:text-accent-foreground">
                <Compass className="w-3.5 h-3.5 text-[#00D8F6] dark:text-accent-foreground shrink-0" />
                <span>{isEs ? 'LLAMADA DIRECTA CON EL INGENIERO' : 'DIRECT ENGINEER DISCOVERY'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {isEs ? '¿Tienes un proyecto en mente? ' : 'Have a project in mind? '}
                <span className="text-[#00D8F6] dark:text-inherit">
                  {isEs ? 'Construyámoslo.' : "Let's build it."}
                </span>
              </h2>
              <p className="text-sm sm:text-lg md:text-xl font-medium opacity-90 max-w-2xl mx-auto text-slate-300 dark:text-inherit">
                {isEs
                  ? 'Agenda abierta para nuevos proyectos. Conversemos sobre tus objetivos y cómo construir una plataforma rápida y confiable.'
                  : "Now booking new projects. Let's discuss your organization's goals and how to build a reliable, high-performance platform."}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3.5 w-full sm:w-auto pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-[#00D8F6] hover:bg-[#00F2FE] text-[#090D16] dark:bg-accent-foreground dark:text-accent dark:hover:bg-[#151D2F] dark:hover:text-accent px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-lg font-bold font-mono text-xs sm:text-sm hover:scale-105 transition-transform shadow-xl"
                >
                  <span>{isEs ? 'Agenda 30 min gratis' : 'Book a free 30-minute call'}</span>{' '}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/packages"
                  className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/55 dark:bg-accent-foreground/10 dark:hover:bg-accent-foreground/20 dark:text-accent-foreground dark:border-accent-foreground/60 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-lg font-bold font-mono text-xs sm:text-sm transition-all"
                >
                  {isEs ? 'Ver Paquetes y Precios' : 'See Packages & Pricing'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
