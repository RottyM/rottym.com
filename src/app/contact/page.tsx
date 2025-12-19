// src/app/contact/page.tsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, Sparkles, Phone } from 'lucide-react';


export default function Contact() {
  // TODO: Create a Google App Password for 'no-reply@rottym.com' and set it as SMTP_PASS in your deployment vars.
  const [status, setStatus] = useState('');
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        setStatus('Vibes received! Expect a reply within 24h.');
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
  if (status.includes('Vibes received!')) {
    return (
      <section className="py-24 px-6 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-2xl"
        >
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black tracking-tight">Transmission Received!</h2>
          <p className="text-xl text-muted-foreground">Thanks for reaching out. I'll analyze the vibe and get back to you within 24 hours.</p>
          <a href="/" className="inline-block mt-8 text-accent font-bold hover:underline">Return to HQ</a>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-12"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Connect with Vibe
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1]">Let&apos;s Build Something <span className="text-accent">Legendary</span>.</h1>
            <p className="text-xl text-muted-foreground max-w-md font-medium leading-relaxed">
              Accepting high-impact projects for early 2026. Whether it&apos;s a strategic launch or a complex cloud app, I&apos;ve got the vibe and the code.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Direct Access</p>
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
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Direct Line</p>
                {phoneRevealed ? (
                  <a href="tel:2028540954" className="text-lg font-bold hover:text-accent transition-colors">(202) 854-0954</a>
                ) : (
                  <button
                    onClick={() => setPhoneRevealed(true)}
                    className="text-lg font-bold text-foreground/50 border-b border-dashed border-foreground/30 hover:text-accent hover:border-accent transition-all text-left"
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
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">HQ Location</p>
                <p className="text-lg font-bold">Virginia, USA · Global Delivery</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full -z-10" />
          <form onSubmit={handleSubmit} className="p-10 rounded-[3rem] bg-card border border-border shadow-2xl space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Full Name</label>
                <input id="name" name="name" placeholder="John Wick" required className="w-full p-5 bg-muted/50 border border-border rounded-2xl focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all placeholder:text-muted-foreground/50 font-medium" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Email Address</label>
                <input id="email" name="email" type="email" placeholder="john@continental.com" required className="w-full p-5 bg-muted/50 border border-border rounded-2xl focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all placeholder:text-muted-foreground/50 font-medium" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="service" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Service Selection</label>
              <select id="service" name="service" className="w-full p-5 bg-muted/50 border border-border rounded-2xl focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all font-medium appearance-none">
                <option>Strategic Launchpad</option>
                <option>Full-Stack Cloud App</option>
                <option>Hosting & Infrastructure</option>
                <option>AI Vibe Engineering</option>
                <option>Something Else</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Project Vision</label>
              <textarea id="message" name="message" rows={4} placeholder="Tell me about the vibe..." required className="w-full p-5 bg-muted/50 border border-border rounded-2xl focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all placeholder:text-muted-foreground/50 font-medium resize-none" />
            </div>

            <button type="submit" disabled={isSubmitting} className="group w-full flex items-center justify-center gap-3 bg-accent text-accent-foreground py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl shadow-accent/20 disabled:opacity-50 disabled:hover:scale-100">
              {isSubmitting ? 'Transmitting...' : 'Send Transmission'} <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>

            {status && (
              <p className={`text-center p-3 rounded-xl border font-bold ${status.includes('Error') ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'}`}>
                {status}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
