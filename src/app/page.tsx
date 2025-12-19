// src/app/page.tsx
'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Rocket, Zap, Globe, Cpu, Sparkles } from 'lucide-react';

export default function Home() {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!localStorage.getItem('audit-shown')) {
        const popup = document.createElement('div');
        popup.innerHTML = `
          <div style="position:fixed;bottom:20px;right:20px;background:var(--card);color:var(--foreground);padding:24px;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.1);max-width:320px;z-index:9999;border:1px solid var(--border);">
            <h3 style="margin:0 0 8px;font-size:1.25rem;font-weight:bold;">Digital Strategy Audit</h3>
            <p style="margin:0 0 16px;font-size:0.875rem;color:var(--muted-foreground);">Get a free 15-min speed, security & scalability vibe check.</p>
            <a href="/contact" style="display:inline-block;background:var(--accent);color:var(--accent-foreground);padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:600;">Book Free Consult →</a>
            <button onclick="this.parentElement.parentElement.remove();localStorage.setItem('audit-shown','true')" style="position:absolute;top:8px;right:8px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--muted-foreground);">×</button>
          </div>
        `;
        document.body.appendChild(popup);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-6 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-accent/10 to-transparent blur-3xl opacity-50 transition-colors" />
        <div className="absolute -top-24 -left-24 -z-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-soft transition-colors" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-accent shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-sm font-semibold tracking-wide uppercase">AI Vibe Coding · Early 2026 Apps</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight">
              Building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-indigo-500">Future</span> with Vibe
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              I specialize in high-energy, full-stack cloud solutions. From **strategic launchpads** to scalable **custom apps**, I build with the speed of AI and the precision of a decade at Disney and USA Today.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="group flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-accent/20">
                Launch Your Project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/portfolio" className="flex items-center gap-2 glass px-8 py-4 rounded-2xl font-bold text-lg hover:bg-muted transition-all text-foreground">
                View Proof of Vibe
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 text-muted-foreground">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                    {['NY', 'SF', 'DC', 'LD'][i - 1]}
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium italic">
                Teasing public apps coming in early 2026...
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border group bg-card">
              <img
                src="/images/portfolio/rottman-hero.jpg"
                alt="Rottman Mendez"
                className="w-full h-auto object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
            </div>

          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 border-y border-border bg-muted/30 transition-colors">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-12">Trusted by engineering teams at</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Disney', 'FAA', 'FEMA', 'USA Today', 'Booz Allen', 'Leidos'].map(c => (
              <span key={c} className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20 text-balance">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">Everything you need to <span className="text-accent underline decoration-accent/30 underline-offset-8">scale</span></h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">
              I don&apos;t just build websites. I engineer high-performance digital ecosystems using the most modern stacks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Strategic Launchpads',
                desc: 'Landing pages and quick-start presences designed to convert. WordPress escape plans included.',
                icon: <Rocket className="w-6 h-6" />,
                accent: 'text-orange-500',
                bg: 'bg-orange-500/10'
              },
              {
                title: 'Full-Stack Apps',
                desc: 'Scalable Next.js and React platforms with robust cloud logic, e-commerce, and subscription systems.',
                icon: <Cpu className="w-6 h-6" />,
                accent: 'text-blue-500',
                bg: 'bg-blue-500/10'
              },
              {
                title: 'Cloud & Hosting',
                desc: 'Enterprise-grade solutions on Firebase, AWS, and GCP. Secure, fast, and fully managed deployment.',
                icon: <Globe className="w-6 h-6" />,
                accent: 'text-emerald-500',
                bg: 'bg-emerald-500/10'
              },
              {
                title: 'AI Vibe Engineering',
                desc: 'Custom AI integration, vibe coding workflows, and intelligent automation for forward-thinking teams.',
                icon: <Sparkles className="w-6 h-6" />,
                accent: 'text-purple-500',
                bg: 'bg-purple-500/10'
              }
            ].map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 rounded-3xl border border-border hover:border-accent/40 hover:bg-card transition-all shadow-sm hover:shadow-xl"
              >
                <div className={`w-12 h-12 rounded-2xl ${service.bg} flex items-center justify-center ${service.accent} mb-6 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* From the Lab Section */}
      <section className="py-32 px-6 bg-accent/[0.03] transition-colors relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Coming Early 2026
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">From the <span className="text-accent italic">Lab</span>.</h2>
              <p className="text-muted-foreground text-xl max-w-xl font-medium">
                A sneak peek at the custom-built platforms I'm releasing for public distribution. Sleek, proprietary, and powered by Vibe Engineering.
              </p>
            </div>
            <Link href="/contact" className="hidden md:flex items-center gap-2 text-foreground font-black hover:text-accent transition-colors group">
              Early Access Inquiry <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                name: "ThrottleLife",
                tagline: "The Modern Rider's Operating System",
                image: "/images/apps/throttlelife.png",
                vibe: "High Octane"
              },
              {
                name: "Family OS",
                tagline: "Your Family's Digital Command Center",
                image: "/images/apps/familyos.png",
                vibe: "Seamless Living"
              }
            ].map((app, idx) => (
              <motion.div
                key={app.name}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="group relative"
              >
                <div className="relative aspect-[16/10] bg-card rounded-[3rem] border border-border overflow-hidden shadow-2xl group-hover:border-accent/30 transition-all duration-500">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* App Screen Mockup */}
                  <div className="absolute -bottom-8 left-6 right-6 top-24 rounded-[2rem] border border-border shadow-2xl overflow-hidden bg-background">
                    <img
                      src={app.image}
                      alt={app.name}
                      className="w-full h-full object-cover object-top grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>

                  {/* App Info Overlay */}
                  <div className="absolute top-8 left-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-accent-foreground shadow-lg">
                      {idx === 0 ? <Zap className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-foreground">{app.name}</h3>
                      <p className="text-xs font-black uppercase tracking-widest text-accent">{app.vibe}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 px-4">
                  <p className="text-sm font-bold text-muted-foreground">{app.tagline}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaser CTA */}
      <section className="py-24 px-6 bg-accent text-accent-foreground rounded-[3rem] mx-6 mb-24 overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Got a vibe? Let&apos;s build it.</h2>
          <p className="text-xl font-medium opacity-90">
            Currently accepting new projects for Q1 2026. Be the first to launch with the next wave of AI-driven tech.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-accent-foreground text-accent px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-2xl">
            Secure Your Spot <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </>
  );
}