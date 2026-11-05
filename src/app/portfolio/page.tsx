// src/app/portfolio/page.tsx
'use client';
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, Monitor } from 'lucide-react';

const projects = [
  { title: "ThrottleLife", img: "/images/apps/throttlelife.png", role: "Concept & Architecture", tech: "Next.js, Real-Time Data Handling, Cloud-Backed Features", category: "Platform OS" },
  { title: "Family OS", img: "/images/apps/familyos.png", role: "Full-Stack Application", tech: "Next.js, Multi-User Roles, Workflow Automation", category: "Command Center" },
  { title: "Northern Virginia Writers Club", img: "/images/portfolio/northernvirginiawriters-home.png", role: "Web Manager", tech: "WP Buddy Boss", category: "Community Portal" },
  { title: "Found Archives", img: "/images/portfolio/found-archives-homepage.png", role: "Web Developer", tech: "Next.js, Sanity, Vercel", category: "Historical Focus" },
  { title: "Lori Eaton Writer", img: "/images/portfolio/lori-eaton-writer-homepage.png", role: "Web Developer", tech: "Next.js, Sanity, Vercel", category: "Author Platform" },
  { title: "USA Today – The Point", img: "/images/portfolio/usa-today-thepoint.jpg", role: "Lead Front-End", tech: "React, Redux, AWS", category: "High Scale" },
  { title: "Detroit Free Press", img: "/images/portfolio/detroit-freepress.jpg", role: "UX Developer", tech: "HTML5, CSS3, JS", category: "Premium UI" },
  { title: "WWF Gift Center", img: "/images/portfolio/wwf-giftcenter.jpg", role: "UX Developer", tech: "E-commerce UX", category: "Conversion Focus" },
  { title: "Reverb Networks", img: "/images/portfolio/reverb-performa.jpg", role: "UX Designer", tech: "Wireframes, Figma", category: "User First" },
  { title: "Local Business Dev", img: "/images/portfolio/brevic.jpg", role: "Strategic Partner", tech: "Modern Next.js Stack", category: "Rapid Launch" },
  { title: "Custom CMS Platforms", img: "/images/portfolio/gov-sites.jpg", role: "Full Stack Engineer", tech: "Cloud Native", category: "Secure Infrastructure" },
  { title: "Enterprise Subscriptions", img: "/images/portfolio/club-sites.jpg", role: "Cloud Architect", tech: "Firebase, Stripe", category: "Revenue Driven" },
  { title: "Brand Identity Systems", img: "/images/portfolio/logos.jpg", role: "Creative Lead", tech: "Strategy, Design", category: "Identity & Branding" },
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
    <section className="pt-8 pb-16 md:pt-12 md:pb-20 px-4 md:px-6 min-h-screen flex flex-col items-center">
      <div className="max-w-7xl mx-auto w-full space-y-8 md:space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Platforms & Applications
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">Selected Work & Projects</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto font-medium">
            A mix of client platforms and self-initiated systems that demonstrate full-stack development, product thinking, and modern deployment practices.
          </p>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          {/* Main Slide Card - Image Only with Pure Overlay Navigation Arrows (No Background) */}
          <div className="relative aspect-[16/10] bg-card rounded-[2rem] border border-border/50 shadow-2xl overflow-hidden group mb-6 select-none">
            {projects.map((project, idx) => (
              <div
                key={project.title}
                className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
                  idx === currentIndex ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <div className="relative w-full h-full overflow-hidden shadow-sm">
                  <Image
                    src={project.img}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 896px"
                    className="object-cover object-top"
                    priority={idx === 0}
                  />
                </div>
              </div>
            ))}

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-20" />

            {/* Fading Navigation Arrows on Image - Pure Arrows (No Background) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/75 hover:text-white hover:scale-110 active:scale-90 transition-all duration-300 opacity-90 md:opacity-0 md:group-hover:opacity-100 cursor-pointer drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] focus:outline-none"
              aria-label="Previous Slide"
              title="Previous Slide"
            >
              <ChevronLeft className="w-10 h-10 md:w-14 md:h-14 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/75 hover:text-white hover:scale-110 active:scale-90 transition-all duration-300 opacity-90 md:opacity-0 md:group-hover:opacity-100 cursor-pointer drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] focus:outline-none"
              aria-label="Next Slide"
              title="Next Slide"
            >
              <ChevronRight className="w-10 h-10 md:w-14 md:h-14 stroke-[2.5]" />
            </button>
          </div>

          {/* Details & Controls Section */}
          <div className="bg-card rounded-[2.5rem] border border-border/50 p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Project Details */}
            <div className="space-y-2 flex-1 text-center md:text-left transition-all duration-200">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                <span className="px-3 py-1 bg-accent/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-accent border border-accent/20">
                  {projects[currentIndex].category}
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
            </div>

            {/* Navigation Controls - Compact */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  prevSlide();
                }}
                className="group flex items-center justify-center w-12 h-12 rounded-xl border border-border bg-background hover:bg-muted transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Previous Slide"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              <div className="font-mono text-sm font-bold text-muted-foreground w-16 text-center bg-muted/50 py-3 rounded-xl select-none">
                {currentIndex + 1} / {projects.length}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  nextSlide();
                }}
                className="group flex items-center justify-center w-12 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95 shadow-lg shadow-foreground/20 cursor-pointer"
                title="Next Slide"
                aria-label="Next Slide"
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
