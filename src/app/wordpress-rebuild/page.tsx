'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  User,
  Mail,
  Globe,
  RefreshCw,
} from 'lucide-react';
import CampaignHeader from '@/components/CampaignHeader';
import LeadFormStatus from '@/components/LeadFormStatus';
import { useLeadForm } from '@/hooks/useLeadForm';
import { useLang } from '@/components/ThemeProvider';

const LEGACY_PAIN = [
  {
    en: 'Slow mobile load times on cellular connections',
    es: 'Cargas lentas en teléfonos celulares y datos móviles',
  },
  {
    en: 'Plugin conflicts, rigid templates, or dated layouts that hurt trust',
    es: 'Conflictos de plugins, plantillas rígidas o diseños antiguos que restan confianza',
  },
  {
    en: 'Rented platforms (Wix, Squarespace, GoDaddy, Facebook) you do not truly own',
    es: 'Plataformas alquiladas (Wix, Squarespace, GoDaddy, Facebook) que nunca son tuyas',
  },
  {
    en: 'Ongoing security patches, surprise fees, or agency lock-in',
    es: 'Parches constantes, cobros sorpresa o contratos forzosos con agencias',
  },
];

const CUSTOM_BUILD_WINS = [
  {
    en: 'Instant, mobile-first pages served from a global edge CDN',
    es: 'Páginas ultrarrápidas optimizadas para celular desde la nube global',
  },
  {
    en: 'Clean, modern design built around your actual quote and booking flow',
    es: 'Diseño moderno pensado en tus cotizaciones y citas reales',
  },
  {
    en: 'Zero plugin attack surfaces or fragile third-party builder lock-in',
    es: 'Sin vulnerabilidades de plugins ni constructores frágiles de terceros',
  },
  {
    en: '100% code and domain ownership — no recurring platform ransom',
    es: 'Propiedad 100% del código y dominio — sin pagar rescates mensuales',
  },
];

const SELECTED_CLIENTS = [
  {
    title: 'Men Talking LLC',
    category: { en: 'Coaching & Wellness', es: 'Coaching y Bienestar' },
    metric: {
      en: 'Launch-ready brand site · Ahead-of-deadline delivery',
      es: 'Sitio de lanzamiento · Entregado antes de la fecha límite',
    },
    summary: {
      en: 'Calm, typography-led coaching site with clear conversation CTAs, structured program navigation, and ongoing care.',
      es: 'Sitio sereno y moderno de coaching con llamados claros a agendar llamada, navegación estructurada y soporte continuo.',
    },
    href: '/portfolio/men-talking',
  },
  {
    title: "Rebecca's Cleaning",
    category: { en: 'Local Service Business', es: 'Negocio de Servicios Locales' },
    metric: {
      en: 'Flat-rate quote flow · Mobile-first booking',
      es: 'Cotizador de tarifa fija · Reservas desde el móvil',
    },
    summary: {
      en: 'Conversion-focused DMV service site with transparent flat-rate packages and a guided quote request flow.',
      es: 'Sitio enfocado en conversión para el área DMV con paquetes de precio fijo y solicitud guiada de cotización.',
    },
    href: '/portfolio/rebeccas-cleaning',
  },
  {
    title: 'Northern Virginia Writers Club',
    category: { en: 'Community & Membership', es: 'Comunidad y Membresías' },
    metric: {
      en: 'Membership nearly doubled · 90% auto-renewal opt-in',
      es: 'Membresía casi duplicada · 90% de renovación automática',
    },
    summary: {
      en: 'Modernized collaboration portal and 12-month rolling subscription system that freed volunteer officers to focus on creative programming.',
      es: 'Portal modernizado y sistema de suscripción anual continua que liberó a los voluntarios para enfocarse en su comunidad.',
    },
    href: '/portfolio/northern-virginia-writers',
  },
];

export default function WordpressRebuildPage() {
  const { lang } = useLang();
  const isEs = lang === 'es';
  const [archMode, setArchMode] = useState<'legacy' | 'nextjs'>('nextjs');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const { status, isSubmitting, isSuccess, submitLead } = useLeadForm({
    formId: 'wordpress_rebuild_form',
    serviceLabel: 'Performance Rebuild Review (/wordpress-rebuild)',
    gaCategory: 'wordpress_rebuild_landing_page',
    successMessage: isEs
      ? '¡Solicitud recibida! Te enviaremos tu estimado de precio fijo en 1 día hábil.'
      : 'Request received! Expect your fixed-price rebuild estimate within 1 business day.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitLead({ name, email, websiteUrl });
    if (ok) {
      setName('');
      setEmail('');
      setWebsiteUrl('');
    }
  };

  const isNext = archMode === 'nextjs';

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-full max-w-[720px] h-[480px] bg-gradient-to-tr from-accent/10 via-sky-500/5 to-transparent dark:from-accent/15 dark:via-emerald-500/10 dark:to-transparent blur-[130px] rounded-full -z-10" />

      <CampaignHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <section className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 glass px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-sm border border-border">
            <RefreshCw className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider uppercase font-bold">
              {isEs
                ? 'Migración de Alto Rendimiento · Sin Plataformas Alquiladas'
                : 'Performance Rebuild · Legacy & Rented Site Escape'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-[1.12] tracking-tight">
            {isEs
              ? 'Reemplaza tu sitio lento, antiguo o alquilado por una '
              : 'Replace your slow, dated, or rented website with a '}
            <span className="tech-gradient-text">
              {isEs ? 'construcción a la medida 100% tuya.' : 'custom build you own 100%.'}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
            {isEs
              ? 'Ya sea que estés en WordPress, Squarespace, Wix, GoDaddy, Weebly, Joomla/Drupal, un sitio viejo o solo una página de Facebook: conserva tu dominio y contenido mientras subes de nivel a un sitio veloz que funciona perfecto en cada teléfono.'
              : "Whether you're stuck on WordPress, Squarespace, Wix, GoDaddy builder, Weebly, Joomla/Drupal, a dated custom site, or just a Facebook page — keep your domain and content while upgrading to a fast site that works on every phone."}
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="#rebuild-review-form"
              className="group inline-flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] px-5 py-3 rounded-lg font-bold font-mono text-xs sm:text-sm hover:scale-[1.02] transition-all shadow-md"
            >
              <span>
                {isEs ? 'Solicitar Revisión Gratuita de Migración' : 'Request Your Free Rebuild Review'}
              </span>
              <ArrowRight className="w-4 h-4 text-[#00D8F6] dark:text-current group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* Side-by-Side Comparison Card + Interactive Architecture Toggle */}
        <section className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Typical Legacy / Rented Setup */}
            <div className="stitch-card p-5 sm:p-7 rounded-lg space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400">
                  {isEs ? 'Plataformas Antiguas / Alquiladas' : 'Legacy & Rented Platforms'}
                </span>
                <span className="font-mono text-xs text-muted-foreground uppercase">WP · Wix · Squarespace</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                {isEs ? 'Configuración Tradicional Típica' : 'Typical Legacy or Rented Setup'}
              </h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {LEGACY_PAIN.map((item) => (
                  <li key={item.en} className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* RottyM Custom Build */}
            <div className="p-5 sm:p-7 rounded-lg space-y-4 bg-gradient-to-br from-[#090D16] via-[#0D1524] to-[#090D16] text-white border border-[#00D8F6]/30 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#00D8F6]/15 text-[#4cd7f6] border border-[#00D8F6]/30">
                  {isEs ? 'Arquitectura Moderna' : 'Modern Architecture'}
                </span>
                <span className="font-mono text-xs text-[#4cd7f6] uppercase font-bold">
                  {isEs ? '100% Tuyo' : '100% Owned'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isEs ? 'Construcción a la Medida RottyM' : 'RottyM Custom Build'}
              </h2>
              <ul className="space-y-3 text-sm text-slate-200">
                {CUSTOM_BUILD_WINS.map((item) => (
                  <li key={item.en} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00f5a0] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Architecture Comparison Toggle */}
          <div className="stitch-card p-5 sm:p-6 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                {isEs ? 'Comparativa de Arquitectura' : 'Architecture Comparison'}
              </span>
              <div className="inline-grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setArchMode('legacy')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
                    !isNext ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isEs ? 'Constructor / WP' : 'Legacy / Builder'}
                </button>
                <button
                  type="button"
                  onClick={() => setArchMode('nextjs')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
                    isNext ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isEs ? 'Sistema RottyM' : 'RottyM Custom Build'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                  isNext
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}
              >
                {isNext ? (
                  <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="w-6 h-6" aria-hidden="true" />
                )}
              </div>
              <div>
                <p className="text-base sm:text-lg font-black text-foreground">
                  {isNext
                    ? isEs
                      ? 'Entrega Global en Caché Edge'
                      : 'Edge-Cached Static Delivery'
                    : isEs
                    ? 'Carga Pesada de Plugins y Plantillas'
                    : 'Plugin, Theme & Platform Overhead'}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {isNext
                    ? isEs
                      ? 'Carga móvil veloz · Cero mantenimiento de plugins · Código 100% tuyo'
                      : 'Fast mobile load · Zero plugin maintenance · Full code ownership'
                    : isEs
                    ? 'Scripts pesados en celular · Plantillas rígidas · Dependencia mensual'
                    : 'Heavy scripts on phones · Rigid templates · Rented platform lock-in'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="laser-divider" />

        {/* 3 Selected Client Cards */}
        <section className="space-y-6">
          <div className="space-y-1.5">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
              {isEs ? 'Resultados Comprobados' : 'Proven Production Outcomes'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {isEs ? 'Proyectos Seleccionados' : 'Selected Client Work'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {SELECTED_CLIENTS.map((client) => (
              <Link
                key={client.title}
                href={client.href}
                className="stitch-card p-5 sm:p-6 rounded-lg flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2.5">
                  <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-accent/10 text-accent">
                    {client.category[lang]}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-foreground group-hover:text-accent transition-colors">
                    {client.title}
                  </h3>
                  <p className="font-mono text-xs font-bold text-foreground/90">{client.metric[lang]}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{client.summary[lang]}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-accent pt-2 border-t border-border/60">
                  <span>{isEs ? 'Ver caso de éxito' : 'View case study'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Pricing Summary + 3-Field Review Request Form */}
        <section id="rebuild-review-form" className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
              {isEs ? 'Alcance y Soporte Claros' : 'Upfront Scope & Care'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {isEs ? 'Precios Fijos y Transparentes' : 'Clear Fixed Pricing'}
            </h2>

            <div className="stitch-card p-5 rounded-lg space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-black text-foreground">
                  {isEs ? 'Migración de Alto Rendimiento' : 'Performance Rebuild'}
                </h3>
                <span className="font-mono text-lg font-extrabold text-accent">$3,800–$6,500</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isEs
                  ? 'Migración completa desde WordPress, Wix, Squarespace, GoDaddy, Weebly, Joomla/Drupal o un sitio viejo a una plataforma moderna — el stack exacto para tu caso, con redirecciones SEO y 100% de propiedad.'
                  : 'Full migration off WordPress, Wix, Squarespace, GoDaddy, Weebly, Joomla/Drupal, or a dated site to a modern custom build — the right stack for the job, with SEO redirect mapping and 100% ownership.'}
              </p>
            </div>

            <div className="stitch-card p-5 rounded-lg space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-black text-foreground">
                  {isEs ? 'Mantenimiento Continuo' : 'Ongoing Care'}
                </h3>
                <span className="font-mono text-lg font-extrabold text-foreground">
                  {isEs ? '$99–$250/mes' : '$99–$250/mo'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isEs
                  ? 'Hosting en la nube opcional, monitoreo de disponibilidad, actualizaciones y ajustes mensuales de contenido o funciones — sin contratos a largo plazo.'
                  : 'Optional cloud hosting, uptime monitoring, dependency updates, and monthly content or feature tweaks — no long-term lock-in.'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="stitch-card p-5 sm:p-8 rounded-lg shadow-xl space-y-5 relative before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent"
            >
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  {isEs ? 'Solicita Tu Revisión de Migración Gratis' : 'Request Your Free Rebuild Review'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isEs
                    ? 'Comparte tu URL actual (WordPress, Wix, Squarespace, GoDaddy, Facebook o sitio propio) y te responderé con un estimado fijo en 1 día hábil.'
                    : "Share your current URL (WordPress, Wix, Squarespace, GoDaddy, Facebook page, or custom site) and I'll reply with a fixed-price rebuild estimate within 1 business day."}
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="wp-name"
                  className="block text-[11px] sm:text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground font-mono"
                >
                  {isEs ? 'Nombre' : 'Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="wp-name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isEs ? 'Tu nombre' : 'Your name'}
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-[#0B111E] border border-slate-500 dark:border-slate-500 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-slate-600 dark:placeholder:text-slate-400 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="wp-email"
                  className="block text-[11px] sm:text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground font-mono"
                >
                  {isEs ? 'Correo electrónico' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="wp-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isEs ? 'tu@negocio.com' : 'you@yourbusiness.com'}
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-[#0B111E] border border-slate-500 dark:border-slate-500 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-slate-600 dark:placeholder:text-slate-400 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="wp-url"
                  className="block text-[11px] sm:text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground font-mono"
                >
                  {isEs ? 'URL Actual de Tu Sitio' : 'Current Website URL'}
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="wp-url"
                    name="websiteUrl"
                    type="url"
                    required
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder={isEs ? 'https://tusitioactual.com' : 'https://yourcurrentsite.com'}
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-[#0B111E] border border-slate-500 dark:border-slate-500 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-slate-600 dark:placeholder:text-slate-400 font-medium text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground dark:hover:bg-[#38bdf8] py-3.5 px-6 rounded-lg font-bold font-mono text-xs sm:text-sm hover:scale-[1.01] transition-all shadow-md shadow-black/10 dark:shadow-accent/20 border border-[#090D16] dark:border-transparent disabled:opacity-50"
              >
                <span>
                  {isSubmitting
                    ? isEs
                      ? 'Enviando...'
                      : 'Sending...'
                    : isEs
                    ? 'Solicitar Revisión Gratuita'
                    : 'Request Your Free Rebuild Review'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#00D8F6] dark:text-current group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium text-center">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <span>
                  {isEs
                    ? 'Cotización fija en 1 día hábil. Cero compromiso.'
                    : 'Fixed quote within 1 business day. Zero obligation.'}
                </span>
              </p>

              <LeadFormStatus status={status} isSuccess={isSuccess} />
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
