// src/app/services/page.tsx
'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Rocket, Cpu, Globe, Sparkles, ArrowRight, CheckCircle2, Users } from 'lucide-react';

const services = [
  {
    title: "Websites & Digital Platforms",
    desc: "High-performance sites and applications for service businesses, non-profits, and organizations moving off WordPress or template platforms. Built with modern stacks for speed, reliability, and easier long-term ownership.",
    icon: <Rocket className="w-6 h-6" />,
    features: ["WP Escape Plans", "Speed & Reliability", "Long-Term Ownership"],
    packageNote: "Most Reston & NoVA projects start here — view packages →",
    packageHref: "/packages#local-launchpad"
  },
  {
    title: "Client Portals, Membership Systems & Internal Tools",
    desc: "Custom portals for client intake, member management, document sharing, and workflow automation. Designed for teams that have outgrown basic forms or off-the-shelf tools.",
    icon: <Users className="w-6 h-6" />,
    features: ["Client Intake & Portals", "Member Management", "Workflow Automation"],
    packageNote: "Available with Booking & Intake packages — view details →",
    packageHref: "/packages#booking-intake"
  },
  {
    title: "Full-Stack Development",
    desc: "Next.js, React, and cloud-backed applications (Vercel, Firebase, AWS, GCP) with attention to performance, security, and maintainability. Includes work on subscription systems, e-commerce, and AI-assisted features where they create real value.",
    icon: <Cpu className="w-6 h-6" />,
    features: ["Next.js & React", "Cloud Backend Integration", "Subscriptions & E-Commerce"],
    packageNote: "Most Reston & NoVA projects start here — view packages →",
    packageHref: "/packages"
  },
  {
    title: "Cloud & Deployment",
    desc: "Secure, managed hosting and deployment so platforms stay fast and stable after launch.",
    icon: <Globe className="w-6 h-6" />,
    features: ["Managed Hosting", "High Availability", "Continuous Deployment"],
    packageNote: "Included in Ongoing Care maintenance — view add-on →",
    packageHref: "/packages#ongoing-care"
  }
];

export default function Services() {
  return (
    <section className="relative py-20 md:py-24 px-6 min-h-screen overflow-hidden">
      {/* Background Dot-Grid Texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

      {/* Atmospheric Radial Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-accent/15 via-emerald-500/10 to-transparent blur-[130px] rounded-full -z-10" />
      <div className="pointer-events-none absolute bottom-24 -right-32 w-[420px] h-[420px] bg-accent/5 rounded-full blur-[110px] -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-accent shadow-sm text-xs font-bold tracking-wide uppercase border border-border">
            <Sparkles className="w-3.5 h-3.5" /> High-Performance Engineering
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-foreground">
            Premium Services &amp; <span className="tech-gradient-text">Architectural Systems</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Engineering high-performance sites and platforms for Reston &amp; Northern Virginia businesses that have outgrown templates or bloated WordPress.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={false}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="stitch-card p-8 md:p-10 rounded-[2.5rem] flex flex-col justify-between group shadow-sm hover:shadow-xl relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent"
            >
              {/* Chromatic Corner Aura */}
              <div className="pointer-events-none absolute -right-14 -top-14 w-40 h-40 bg-accent/10 dark:bg-accent/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 dark:bg-accent/15 flex items-center justify-center text-accent group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                  {s.icon}
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all" />
              </div>

              <div className="relative z-10 mb-6">
                <h3 className="text-2xl sm:text-3xl font-black mb-3 text-foreground group-hover:text-accent transition-colors">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">{s.desc}</p>
              </div>

              <div className="flex flex-wrap gap-3.5 mt-auto mb-6 relative z-10">
                {s.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {s.packageNote && (
                <div className="pt-4 border-t border-border/60 relative z-10">
                  <Link
                    href={s.packageHref}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline group-hover:translate-x-1 transition-transform"
                  >
                    {s.packageNote}
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Laser Divider */}
        <div className="mt-20 mb-8 laser-divider" />

        <motion.div
          initial={false}
          whileInView={{ opacity: 1 }}
          className="p-10 md:p-14 rounded-[3rem] glass border border-accent/20 text-center space-y-6 shadow-xl relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-accent/15 rounded-full blur-3xl" />
          <h2 className="text-3xl md:text-4xl font-black text-foreground relative z-10">Need a custom stack solution?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium text-base md:text-lg relative z-10 leading-relaxed">
            I specialize in custom integrations and unique technical requirements. Let&apos;s talk about your vision.
          </p>
          <div className="pt-2 relative z-10">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg hover:scale-105 transition-transform shadow-lg shadow-accent/20">
              Start the Conversation <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}