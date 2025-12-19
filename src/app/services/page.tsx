// src/app/services/page.tsx
'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Rocket, Cpu, Globe, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const services = [
  {
    title: "Strategic Launchpads",
    desc: "Rapid-deployment landing pages and digital foundations. Perfect for escaping legacy WordPress setups and moving to the cloud.",
    icon: <Rocket className="w-6 h-6" />,
    features: ["WP Escape Plans", "Conversion Focused", "SEO Strategy"]
  },
  {
    title: "Full-Stack Cloud Apps",
    desc: "Custom, scalable applications built with Next.js, React, and robust backend logic. E-commerce and subscription experts.",
    icon: <Cpu className="w-6 h-6" />,
    features: ["Next.js/React", "Stripe Integration", "Scale-Ready"]
  },
  {
    title: "Cloud & Hosting Solutions",
    desc: "Managed deployment on Firebase, AWS, or GCP. High-availability infrastructure for mission-critical apps.",
    icon: <Globe className="w-6 h-6" />,
    features: ["Firebase/AWS", "Edge Deployment", "Security First"]
  },
  {
    title: "AI Vibe Engineering",
    desc: "Building custom AI-integrated tools and workflows. Leveraging the absolute latest in AI vibes to ship faster.",
    icon: <Sparkles className="w-6 h-6" />,
    features: ["Custom AI Tools", "Vibe Coding", "Automation"]
  }
];

export default function Services() {
  return (
    <section className="py-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
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
              initial={{ opacity: 0, scale: 0.95 }}
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

              <div className="flex flex-wrap gap-4 mt-auto">
                {s.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {f}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
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