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
    <section className="py-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground">Premium Services</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Engineering digital excellence from first code to global scale.
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
              className="p-10 rounded-[3rem] border border-border bg-card hover:border-accent/40 transition-all shadow-sm hover:shadow-2xl group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </div>

              <h3 className="text-3xl font-black mb-4 text-foreground">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-8 text-lg">{s.desc}</p>

              <div className="flex flex-wrap gap-4 mt-auto mb-6">
                {s.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {f}
                  </div>
                ))}
              </div>

              {s.packageNote && (
                <div className="pt-4 border-t border-border/50">
                  <Link
                    href={s.packageHref}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                  >
                    {s.packageNote}
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={false}
          whileInView={{ opacity: 1 }}
          className="mt-24 p-12 rounded-[3.5rem] glass border border-accent/20 text-center space-y-8"
        >
          <h2 className="text-3xl font-black">Need a custom stack solution?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            I specialize in custom integrations and unique technical requirements. Let&apos;s talk about your vision.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-transform">
            Start the Conversation <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}