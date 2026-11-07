// src/app/contact/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, Sparkles, Phone, ArrowRight, Radio } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';


export default function Contact() {
  // TODO: Create a Google App Password for 'no-reply@rottym.com' and set it as SMTP_PASS in your deployment vars.
  const [status, setStatus] = useState('');
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState('Local Launchpad ($2,500 – $3,500)');
  const [attribution, setAttribution] = useState<{ source?: string; campaign?: string; ref?: string }>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source') || sessionStorage.getItem('utm_source') || '';
      const utmCampaign = params.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || '';
      const ref = params.get('ref') || sessionStorage.getItem('ref') || '';
      
      if (params.get('utm_source')) sessionStorage.setItem('utm_source', params.get('utm_source')!);
      if (params.get('utm_campaign')) sessionStorage.setItem('utm_campaign', params.get('utm_campaign')!);
      if (params.get('ref')) sessionStorage.setItem('ref', params.get('ref')!);

      if (utmSource || utmCampaign || ref) {
        setAttribution({ source: utmSource, campaign: utmCampaign, ref });
      }

      const serviceParam = params.get('service');
      if (serviceParam === 'local-launchpad') {
        setSelectedService('Local Launchpad ($2,500 – $3,500)');
      } else if (serviceParam === 'booking-intake') {
        setSelectedService('Booking & Intake ($4,200 – $5,800)');
      } else if (serviceParam === 'performance-rebuild') {
        setSelectedService('Performance Rebuild ($3,800 – $6,500)');
      } else if (serviceParam === 'ongoing-care') {
        setSelectedService('Ongoing Care ($99 – $250/mo)');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('Transmitting credentials...');

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      service: formData.get('service'),
      message: formData.get('message'),
      attribution,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        trackEvent({
          action: 'generate_lead',
          category: 'contact_form',
          label: String(data.service || 'general'),
        });
        setStatus('Message received! Expect a reply within 24h.');
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus(`Error — ${result.message}`);
      }
    } catch (error) {
      setStatus('Error — connection failed. Email rmendez@rottym.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom success state handling if needed, or stick with the inline logic
  if (status.includes('Message received!')) {
    return (
      <section className="py-24 px-6 min-h-screen flex items-center justify-center">
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-2xl"
        >
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black tracking-tight">Message Received!</h2>
          <p className="text-xl text-muted-foreground">Thanks for reaching out. I'll review your project requirements and get back to you within 24 hours.</p>
          <a href="/" className="inline-block mt-8 text-accent font-bold hover:underline">Return to Home</a>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative pt-10 pb-24 min-h-screen overflow-hidden">
      {/* Background Dot-Grid Texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none -z-10" />

      {/* Atmospheric Radial Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-accent/10 via-sky-500/5 to-transparent dark:from-accent/15 dark:via-emerald-500/10 dark:to-transparent blur-[130px] rounded-full -z-10" />
      <div className="pointer-events-none absolute bottom-1/4 -right-32 w-[420px] h-[420px] bg-accent/5 rounded-full blur-[110px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 relative z-10">
        <motion.div
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 glass px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md backdrop-blur-md border border-border max-w-full">
              <Radio className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="font-mono text-[10px] sm:text-xs text-accent tracking-wider sm:tracking-widest uppercase font-bold whitespace-nowrap">DIRECT ENGAGEMENT</span>
              <span className="text-border">|</span>
              <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase whitespace-nowrap">START A PROJECT</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]">Let&apos;s Build Something <span className="tech-gradient-text">Exceptional</span>.</h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-md font-medium leading-relaxed">
              Accepting new projects. Whether it&apos;s a modern website, client portal, or full-stack cloud application, let&apos;s build a reliable system together.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground font-mono">Direct Access</p>
                <p className="text-lg font-bold">rmendez@rottym.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div
                onClick={() => setPhoneRevealed(true)}
                className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-all cursor-pointer"
              >
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground font-mono">Direct Line</p>
                {phoneRevealed ? (
                  <a href="tel:2028540954" className="text-lg font-bold hover:text-accent transition-colors font-mono">(202) 854-0954</a>
                ) : (
                  <button
                    onClick={() => setPhoneRevealed(true)}
                    className="text-lg font-bold text-foreground/50 border-b border-dashed border-foreground/30 hover:text-accent hover:border-accent transition-all text-left cursor-pointer"
                    aria-label="Click to reveal direct phone number"
                  >
                    Click to Reveal
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground font-mono">HQ Location</p>
                <p className="text-lg font-bold">Virginia, USA · Global Delivery</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full -z-10" />
          
          <div className="mb-4 flex items-center justify-between px-2">
            <span className="text-xs text-muted-foreground font-medium">Not sure where to start?</span>
            <Link href="/packages" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
              See local packages &amp; pricing →
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="stitch-card p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[3rem] shadow-xl space-y-4 sm:space-y-6 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="name" className="text-[11px] sm:text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground font-mono">Full Name</label>
                <input id="name" name="name" placeholder="John Wick" required className="w-full p-3.5 sm:p-4 bg-muted/50 border border-border rounded-xl sm:rounded-2xl focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all placeholder:text-muted-foreground/50 font-medium text-sm" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="email" className="text-[11px] sm:text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground font-mono">Email Address</label>
                <input id="email" name="email" type="email" placeholder="john@continental.com" required className="w-full p-3.5 sm:p-4 bg-muted/50 border border-border rounded-xl sm:rounded-2xl focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all placeholder:text-muted-foreground/50 font-medium text-sm" />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="service" className="text-[11px] sm:text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground font-mono">Service or Package Selection</label>
              <select 
                id="service" 
                name="service" 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full p-3.5 sm:p-4 bg-muted/50 border border-border rounded-xl sm:rounded-2xl focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all font-medium text-sm"
              >
                <optgroup label="Fixed-Scope Local Packages">
                  <option value="Local Launchpad ($2,500 – $3,500)">Local Launchpad ($2,500 – $3,500)</option>
                  <option value="Booking & Intake ($4,200 – $5,800)">Booking &amp; Intake ($4,200 – $5,800)</option>
                  <option value="Performance Rebuild ($3,800 – $6,500)">Performance Rebuild ($3,800 – $6,500)</option>
                  <option value="Ongoing Care ($99 – $250/mo)">Ongoing Care ($99 – $250/mo)</option>
                </optgroup>
                <optgroup label="Custom & Full-Stack Capabilities">
                  <option value="Websites & Digital Platforms">Websites &amp; Digital Platforms</option>
                  <option value="Client Portals, Membership Systems & Internal Tools">Client Portals, Membership Systems &amp; Internal Tools</option>
                  <option value="Full-Stack Development">Full-Stack Development</option>
                  <option value="Cloud & Deployment">Cloud &amp; Deployment</option>
                  <option value="Custom / Something Else">Custom / Something Else</option>
                </optgroup>
              </select>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="message" className="text-[11px] sm:text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground font-mono">Project Details</label>
              <textarea id="message" name="message" rows={4} placeholder="Tell me about your project, goals, and timeline..." required className="w-full p-3.5 sm:p-4 bg-muted/50 border border-border rounded-xl sm:rounded-2xl focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all placeholder:text-muted-foreground/50 font-medium text-sm resize-none" />
            </div>

            <button type="submit" disabled={isSubmitting} className="group w-full flex items-center justify-center gap-2 bg-[#090D16] hover:bg-[#151D2F] text-white dark:bg-accent dark:text-accent-foreground py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold font-mono text-xs sm:text-sm hover:scale-[1.02] transition-all shadow-md shadow-black/10 dark:shadow-accent/20 border border-[#090D16] dark:border-transparent disabled:opacity-50 disabled:hover:scale-100">
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span> <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D8F6] dark:text-current group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>

            {status && (
              <div
                role="status"
                aria-live="polite"
                className={`p-4 rounded-2xl border text-center space-y-2 ${status.includes('Error') ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'}`}
              >
                <p className="font-bold text-sm sm:text-base">{status}</p>
                {status.includes('Error') && (
                  <div>
                    <a
                      href="mailto:rmendez@rottym.com?subject=Project%20Inquiry%20via%20RottyM.com"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                    >
                      Email rmendez@rottym.com Directly →
                    </a>
                  </div>
                )}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
