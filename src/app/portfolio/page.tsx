// src/app/portfolio/page.tsx
'use client';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, Monitor, ArrowRight } from 'lucide-react';

const projects = [
  { title: "USA Today – The Point", img: "/images/portfolio/usa-today-thepoint.jpg", role: "Lead Front-End", tech: "React, Redux, AWS", vibe: "High Scale" },
  { title: "Detroit Free Press", img: "/images/portfolio/detroit-freepress.jpg", role: "UX Developer", tech: "HTML5, CSS3, JS", vibe: "Premium UI" },
  { title: "WWF Gift Center", img: "/images/portfolio/wwf-giftcenter.jpg", role: "UX Developer", tech: "E-commerce UX", vibe: "Conversion Focus" },
  { title: "Reverb Networks", img: "/images/portfolio/reverb-performa.jpg", role: "UX Designer", tech: "Wireframes, Figma", vibe: "User First" },
  { title: "Local Business Dev", img: "/images/portfolio/brevic.jpg", role: "Strategic Partner", tech: "Modern Next.js Stack", vibe: "Rapid Launch" },
  { title: "Custom CMS Platforms", img: "/images/portfolio/gov-sites.jpg", role: "Full Stack Engineer", tech: "Cloud Native", vibe: "Secure Infrastructure" },
  { title: "Enterprise Subscriptions", img: "/images/portfolio/club-sites.jpg", role: "Cloud Architect", tech: "Firebase, Stripe", vibe: "Revenue Driven" },
  { title: "Brand Identity Systems", img: "/images/portfolio/logos.jpg", role: "Creative Lead", tech: "Strategy, Design", vibe: "Marketing Magic" },
];

export default function Portfolio() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <section className="py-24 px-6 min-h-screen flex flex-col items-center">
      <div className="max-w-7xl mx-auto w-full space-y-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Presentation Mode
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Selected Experience</h1>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Main Slide Card - Image Only - Reduced aspect ratio slightly and container max-width */}
          <div className="relative aspect-[16/10] bg-card rounded-[2rem] border border-border/50 shadow-2xl overflow-hidden group mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 p-6"
              >
                <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden shadow-sm">
                  <Image
                    src={projects[currentIndex].img}
                    alt={projects[currentIndex].title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" />
          </div>

          {/* Details & Controls Section - More Compact */}
          <div className="bg-card rounded-[2.5rem] border border-border/50 p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Project Details */}
            <motion.div
              key={currentIndex + "-text"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2 flex-1 text-center md:text-left"
            >
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                <span className="px-3 py-1 bg-accent/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-accent border border-accent/20">
                  {projects[currentIndex].vibe}
                </span>
                <div className="h-px w-8 bg-border hidden md:block" />
                <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase tracking-widest">
                  <Monitor className="w-3 h-3" />
                  {projects[currentIndex].role}
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-foreground">
                {projects[currentIndex].title}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground font-medium">
                {projects[currentIndex].tech}
              </p>
            </motion.div>

            {/* Navigation Controls - Compact */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-center">
              <button
                onClick={prevSlide}
                className="group flex items-center justify-center w-12 h-12 rounded-xl border border-border bg-background hover:bg-muted transition-all active:scale-95"
                title="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              <div className="font-mono text-sm font-bold text-muted-foreground w-16 text-center bg-muted/50 py-3 rounded-xl">
                {currentIndex + 1} / {projects.length}
              </div>

              <button
                onClick={nextSlide}
                className="group flex items-center justify-center w-12 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95 shadow-lg shadow-foreground/20"
                title="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}