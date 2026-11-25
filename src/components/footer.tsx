// src/components/footer.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { Mail, MapPin, ArrowRight, ShieldCheck, LockOpen, CalendarCheck } from 'lucide-react';
import RottyMLogo from './RottyMLogo';
import { useLang } from './ThemeProvider';

const emptySubscribe = () => () => {};
const CAMPAIGN_ROUTES = ['/audit', '/wordpress-rebuild', '/start'];

export default function Footer() {
  const pathname = usePathname();
  const { lang } = useLang();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isEs = (mounted ? lang : 'en') === 'es';
  const currentYear = new Date().getFullYear();

  if (CAMPAIGN_ROUTES.some((route) => pathname === route || pathname?.startsWith(`${route}/`))) {
    return (
      <footer className="border-t border-border/60 bg-muted/20 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {currentYear} Rottman M. Mendez · Reston, VA</p>
          <div className="flex flex-wrap items-center justify-center gap-5 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />{' '}
              {isEs ? 'Todo es 100% tuyo' : 'You own 100% of it'}
            </span>
            <span className="flex items-center gap-1.5">
              <LockOpen className="w-3.5 h-3.5 text-accent" />{' '}
              {isEs ? 'Sin contratos forzosos' : 'No lock-in'}
            </span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white dark:bg-card text-foreground border-t border-slate-200 dark:border-border mt-24 transition-colors">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand & Positioning Column (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center group" aria-label={isEs ? 'Inicio RottyM' : 'RottyM Home'}>
              <RottyMLogo variant="full" size={46} animated={true} />
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm font-medium">
              {isEs
                ? 'Diseñamos sitios rápidos en Next.js, portales para clientes y migraciones desde WordPress para negocios en Reston y el Norte de Virginia.'
                : 'Building high-performance Next.js sites, custom client portals, and WordPress escape rebuilds for growing businesses in Reston and Northern Virginia.'}
            </p>

            <div className="space-y-2 text-xs">
              <div className="inline-flex items-center gap-2 glass px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-lg shadow-sm border border-border max-w-full">
                <CalendarCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">
                  {isEs ? 'DISPONIBILIDAD' : 'AVAILABILITY'}
                </span>
                <span className="text-border" aria-hidden="true">|</span>
                <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap">
                  {isEs ? 'ACEPTANDO PROYECTOS' : 'ACCEPTING PROJECTS'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground pt-1">
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>
                  {isEs
                    ? 'Reston, VA · Norte de Virginia y clientes remotos'
                    : 'Reston, VA · Serving Northern Virginia & Remote Clients'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4 md:pt-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
              {isEs ? 'Navegación' : 'Navigation'}
            </h3>
            <ul className="space-y-1 text-sm font-medium">
              <li>
                <Link href="/" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  {isEs ? 'Inicio' : 'Home'}
                </Link>
              </li>
              <li>
                <Link href="/services" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  {isEs ? 'Servicios' : 'Services'}
                </Link>
              </li>
              <li>
                <Link href="/packages" className="inline-flex items-center gap-1.5 min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  {isEs ? 'Paquetes y Precios' : 'Packages & Pricing'}
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-accent/10 text-accent rounded">
                    {isEs ? 'Nuevo' : 'New'}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  {isEs ? 'Casos de Éxito' : 'Selected Work'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  {isEs ? 'Sobre Rottman' : 'About Rottman'}
                </Link>
              </li>
              <li>
                <Link href="/resume" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  {isEs ? 'Currículum (EN)' : 'Resume'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  {isEs ? 'Llamada gratis de 30 min' : 'Book a free 30-minute call'}
                </Link>
              </li>
            </ul>
          </div>

          {/* SEO Solutions & Packages Links */}
          <div className="space-y-4 md:pt-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
              {isEs ? 'Soluciones' : 'Solutions'}
            </h3>
            <ul className="space-y-1 text-sm font-medium">
              <li>
                <Link href="/packages#local-launchpad" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  {isEs ? 'Lanzamiento Local ($2.5k–$3.5k)' : 'Local Launchpad ($2.5k–$3.5k)'}
                </Link>
              </li>
              <li>
                <Link href="/packages#booking-intake" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  {isEs ? 'Citas y Registro de Clientes' : 'Booking & Client Intake'}
                </Link>
              </li>
              <li>
                <Link href="/packages#performance-rebuild" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  {isEs ? 'Migración desde WordPress' : 'WordPress Escape Rebuild'}
                </Link>
              </li>
              <li>
                <Link href="/services" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  {isEs ? 'Portales de Clientes y Miembros' : 'Client Portals & Member Hubs'}
                </Link>
              </li>
              <li>
                <Link href="/packages#ongoing-care" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  {isEs ? 'Mantenimiento y Nube' : 'Ongoing Care & Cloud Hosting'}
                </Link>
              </li>
              <li>
                <Link href="/services" className="inline-flex items-center min-h-[26px] py-0.5 text-muted-foreground hover:text-accent transition-colors">
                  {isEs ? 'Integraciones IA y Automatización' : 'AI Integrations & Automation'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Service Areas Column */}
          <div className="space-y-4 md:pt-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
              {isEs ? 'Contacto' : 'Get In Touch'}
            </h3>
            <div className="space-y-3 text-sm">
              <a
                href="mailto:rmendez@rottym.com"
                className="inline-flex items-center gap-2 text-foreground font-semibold hover:text-accent transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <span>rmendez@rottym.com</span>
              </a>

              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                {isEs
                  ? '¿Tienes un proyecto o migración en mente? Hablemos de alcance y precio fijo.'
                  : "Have a project or migration in mind? Let's talk scope and fixed pricing."}
              </p>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg text-xs font-bold hover:scale-105 transition-all shadow-md mt-2"
              >
                {isEs ? 'Agenda 30 min gratis' : 'Book a free 30-minute call'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                {isEs ? 'Área de Servicio Local' : 'Local Service Areas'}
              </p>
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                Reston · Fairfax · Tysons · Herndon · Ashburn · Arlington · Alexandria · Washington, D.C.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Guarantees */}
      <div className="border-t border-border/60 bg-muted/20 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {currentYear} Rottman M. Mendez. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />{' '}
              {isEs ? 'Eres dueño al 100%' : 'You own 100% of it'}
            </span>
            <span className="flex items-center gap-1.5">
              <LockOpen className="w-3.5 h-3.5 text-accent" />{' '}
              {isEs ? 'Sin contratos ni ataduras' : 'No lock-in'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
