'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Gauge, MousePointerClick, ListChecks, ShieldCheck, Globe, Mail } from 'lucide-react';
import CampaignHeader from '@/components/CampaignHeader';
import LeadFormStatus from '@/components/LeadFormStatus';
import { useLeadForm } from '@/hooks/useLeadForm';
import { useLang } from '@/components/ThemeProvider';

const AUDIT_CARDS = [
  {
    index: '01',
    title: { en: 'Real Speed & Mobile Check', es: 'Velocidad Real en Teléfonos' },
    tag: { en: 'Vitals & FCP', es: 'Carga Móvil' },
    description: {
      en: 'Throttled 4G mobile testing to pinpoint render-blocking scripts, oversized hero images, and layout shifts hurting your Google visibility.',
      es: 'Probamos tu sitio en conexión 4G real para detectar archivos pesados, fotos sin optimizar y saltos visuales que afectan tu visibilidad en Google.',
    },
    footer: { en: 'LCP, CLS, INP & payload breakdown', es: 'LCP, CLS, INP y peso de página' },
    icon: Gauge,
  },
  {
    index: '02',
    title: { en: 'Conversion Leak Scan', es: 'Dónde Se Pierden Clientes' },
    tag: { en: 'Tap & Flow', es: 'Botones y Flujo' },
    description: {
      en: 'A real walkthrough of your mobile navigation, quote buttons, and forms to catch broken tap targets and confusing next steps.',
      es: 'Recorremos tu menú en el teléfono, botones de cotización y formularios para encontrar enlaces difíciles de tocar o pasos confusos.',
    },
    footer: { en: 'Mobile funnel & CTA friction check', es: 'Revisión de menú y llamadas a la acción' },
    icon: MousePointerClick,
  },
  {
    index: '03',
    title: { en: 'Plain-English Fix List', es: 'Lista Clara de Soluciones' },
    tag: { en: 'Action Plan', es: 'Plan de Acción' },
    description: {
      en: 'No jargon or 40-page PDF. You get a prioritized checklist of what to fix first — whether you handle it in-house or ask me to quote it.',
      es: 'Sin tecnicismos ni reportes eternos de 40 páginas. Te entregamos prioridades claras: qué resolver primero y cuánto costaría si quieres que lo hagamos.',
    },
    footer: { en: '3-minute video + clear next steps', es: 'Video de 3 minutos + pasos concretos' },
    icon: ListChecks,
  },
];

const PRICING_ROWS = [
  {
    name: { en: 'Local Launchpad', es: 'Lanzamiento Local' },
    range: '$2,500–$3,500',
    note: {
      en: '5–8 page fast modern site with quote forms & local SEO setup',
      es: 'Sitio moderno de 5–8 páginas con cotizaciones y SEO local configurado',
    },
    href: '/packages#local-launchpad',
  },
  {
    name: { en: 'Performance Rebuild', es: 'Migración de Alto Rendimiento' },
    range: '$3,800–$6,500',
    note: {
      en: 'Escape slow WordPress with a custom sub-second rebuild you own 100%',
      es: 'Deja atrás un WordPress lento con un sitio a la medida 100% tuyo',
    },
    href: '/packages#performance-rebuild',
  },
  {
    name: { en: 'Booking & Intake', es: 'Agenda y Registro' },
    range: '$4,200–$5,800',
    note: {
      en: 'Online scheduling, automated confirmations & structured client intake',
      es: 'Reservas en línea, confirmaciones automáticas y registro ordenado de clientes',
    },
    href: '/packages#booking-intake',
  },
];

export default function AuditPage() {
  const { lang } = useLang();
  const isEs = lang === 'es';
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [email, setEmail] = useState('');
  const { status, isSubmitting, isSuccess, submitLead } = useLeadForm({
    formId: 'audit_form',
    serviceLabel: 'Free 3-Minute Site Speed & Leak Audit (/audit)',
    gaCategory: 'audit_landing_page',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitLead({ email, websiteUrl });
    if (ok) {
      setWebsiteUrl('');
      setEmail('');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-full max-w-[720px] h-[480px] bg-gradient-to-tr from-accent/10 via-sky-500/5 to-transparent dark:from-accent/15 dark:via-emerald-500/10 dark:to-transparent blur-[130px] rounded-full -z-10" />

      <CampaignHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">
        {/* Hero + Inline 2-Field Form */}
        <section className="space-y-5">
          <div className="inline-flex items-center glass px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-sm border border-border">
            <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider uppercase font-bold">
              {isEs ? 'Auditoría Gratuita en Video · 3 Minutos' : 'Free 3-Minute Video Audit'}
            </span>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-6 space-y-5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-[1.12] tracking-tight">
                {isEs ? 'Descubre por qué tu sitio web ' : 'Find out why your website is '}
                <span className="tech-gradient-text">
                  {isEs ? 'pierde clientes desde el celular.' : 'losing mobile visitors.'}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                {isEs
                  ? 'Envíame tu enlace web. Grabaré un video claro de 3 minutos explicando qué frena tu página, dónde abandonan tus visitantes y cómo arreglarlo.'
                  : "Send me your URL. I'll record a plain-English 3-minute breakdown showing what's slowing your site down, where visitors drop off, and how to fix it."}
              </p>

              {/* Simulated 4G Telemetry Bar */}
              <div className="stitch-card p-4 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                    {isEs ? 'Cuello de Botella Típico en Móvil' : 'Typical Mobile Bottleneck'}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-red-600 dark:text-red-400">
                    {isEs ? 'Dónde se Pierde Velocidad' : 'Where Mobile Speed Leaks'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden flex" aria-hidden="true">
                  <div className="bg-emerald-500 h-full w-1/4" />
                  <div className="bg-amber-400 h-full w-1/5" />
                  <div className="bg-red-500 h-full w-[55%]" />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>{isEs ? 'Render Base' : 'Core Render'}</span>
                  <span>{isEs ? 'Scripts Extra' : 'Bloat Scripts'}</span>
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    {isEs ? 'Archivos que Bloquean' : 'Render-Blocking Assets'}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <form
                onSubmit={handleSubmit}
                className="stitch-card p-5 sm:p-8 rounded-lg shadow-xl space-y-5 relative before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="audit-url"
                    className="block text-[11px] sm:text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground font-mono"
                  >
                    {isEs ? 'Tu Sitio Web (URL)' : 'Your Website URL'}
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      id="audit-url"
                      name="websiteUrl"
                      type="url"
                      required
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder={isEs ? 'https://tunegocio.com' : 'https://yourbusiness.com'}
                      className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-[#0B111E] border border-slate-500 dark:border-slate-500 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-slate-600 dark:placeholder:text-slate-400 font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="audit-email"
                    className="block text-[11px] sm:text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground font-mono"
                  >
                    {isEs ? '¿A dónde envío el video?' : 'Where should I send the audit?'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      id="audit-email"
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
                      ? 'Enviar Mi Auditoría Gratis'
                      : 'Send My Free Audit'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#00D8F6] dark:text-current group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </button>

                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium text-center">
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                  <span>
                    {isEs
                      ? 'Entrega en 1 día hábil. Sin spam ni presentaciones de venta.'
                      : 'Delivered within 1 business day. No spam, no pitch deck.'}
                  </span>
                </p>

                <LeadFormStatus status={status} isSuccess={isSuccess} />
              </form>
            </div>
          </div>
        </section>

        <div className="laser-divider" />

        {/* 3-Card Grid */}
        <section className="space-y-6">
          <div className="space-y-1.5">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
              {isEs ? 'Qué Incluye' : "What's Included"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {isEs ? 'Qué Cubre Tu Auditoría de 3 Minutos' : 'What Your 3-Minute Audit Covers'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {AUDIT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.index} className="stitch-card p-5 sm:p-6 rounded-lg flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent font-mono text-xs font-bold">
                        {card.index}
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-muted text-muted-foreground">
                        {card.tag[lang]}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-foreground">{card.title[lang]}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.description[lang]}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-border/60 font-mono text-xs font-semibold text-foreground">
                    <Icon className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                    <span>{card.footer[lang]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Compact Upfront Pricing Rows */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
                {isEs ? 'Precios Fijos y Claros' : 'Transparent Fixed Pricing'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {isEs ? 'Si quieres que lo arreglemos por ti' : 'If you want me to fix it for you'}
              </h2>
            </div>
            <Link
              href="/packages"
              className="inline-flex items-center gap-1 font-mono text-xs font-bold text-accent hover:underline"
            >
              {isEs ? 'Ver paquetes completos' : 'View full packages'} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="stitch-card rounded-lg divide-y divide-border overflow-hidden">
            {PRICING_ROWS.map((row) => (
              <Link
                key={row.name.en}
                href={row.href}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-4 sm:p-5 hover:bg-muted/40 transition-colors group"
              >
                <div className="space-y-0.5">
                  <h3 className="text-base sm:text-lg font-black text-foreground group-hover:text-accent transition-colors">
                    {row.name[lang]}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{row.note[lang]}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-base sm:text-lg font-extrabold text-foreground">
                    {row.range}
                  </span>
                  <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
