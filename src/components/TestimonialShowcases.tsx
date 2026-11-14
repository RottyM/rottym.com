'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
} from 'lucide-react';
import { clientTestimonials } from '@/lib/testimonials';

/**
 * Compact above-the-fold quote switcher for the homepage hero.
 * Starts on Isabelle Deeme so it never duplicates the lower spotlight's default client.
 */
export function HeroQuoteDeck() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userControlled, setUserControlled] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const total = clientTestimonials.length;
  const active = clientTestimonials[activeIndex];

  useEffect(() => {
    if (isPaused || userControlled || prefersReducedMotion || total <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, userControlled, prefersReducedMotion, total]);

  const handleSelect = (nextIndex: number) => {
    setUserControlled(true);
    setActiveIndex((nextIndex + total) % total);
  };

  return (
    <div
      className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-lg border border-slate-200/90 dark:border-slate-800/90 bg-white/75 dark:bg-card/75 backdrop-blur-md border-l-4 border-l-accent shadow-sm max-w-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-label="Client quote highlights"
    >
      {/* Top control strip */}
      <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="flex items-center gap-2">
          <Quote className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
          <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-300">
            Client Note · {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <a
            href="#testimonials"
            className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent hover:underline inline-flex items-center min-h-[28px] px-2 py-1 rounded-lg mr-1"
          >
            All {total}<span className="sr-only"> client testimonials</span> <span aria-hidden="true">↓</span>
          </a>
          <button
            type="button"
            onClick={() => handleSelect(activeIndex - 1)}
            aria-label="Previous client quote"
            className="w-7 h-7 rounded-lg border border-slate-500 dark:border-slate-500 bg-white dark:bg-slate-900/90 hover:border-accent/60 hover:text-accent text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => handleSelect(activeIndex + 1)}
            aria-label="Next client quote"
            className="w-7 h-7 rounded-lg border border-slate-500 dark:border-slate-500 bg-white dark:bg-slate-900/90 hover:border-accent/60 hover:text-accent text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Auto-sized grid locks to the tallest quote (Carolyn's) with zero wasted height */}
      <div className="grid py-0.5">
        {clientTestimonials.map((item) => (
          <div
            key={`hero-sizer-${item.id}`}
            aria-hidden="true"
            className="col-start-1 row-start-1 invisible pointer-events-none select-none space-y-2.5"
          >
            <p className="text-sm sm:text-[15px] font-normal italic leading-snug">
              &ldquo;{item.heroQuote}&rdquo;
            </p>
            <p className="text-xs font-medium">
              — {item.author}, {item.role}
            </p>
          </div>
        ))}

        <div className="col-start-1 row-start-1 flex items-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -5 }}
              transition={{ duration: 0.22 }}
              className="space-y-2.5 w-full"
            >
              <p className="text-sm sm:text-[15px] font-normal text-slate-800 dark:text-slate-100 italic leading-snug">
                &ldquo;{active.heroQuote}&rdquo;
              </p>
              <p className="text-xs text-slate-600 dark:text-muted-foreground font-medium">
                — {active.author}, {active.role}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * Full client testimonial section with an interactive tab bar so visitors
 * immediately see multiple verified organizations and can switch full quotes cleanly.
 */
export function ClientProofSpotlight() {
  // Default to index 1 (John F. Crownover) so initial view pairs with Isabelle in the Hero without repetition.
  const [activeIndex, setActiveIndex] = useState(clientTestimonials.length > 1 ? 1 : 0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();
  const active = clientTestimonials[activeIndex];

  const selectTab = (nextIndex: number) => {
    setActiveIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  const tabGridClass =
    clientTestimonials.length >= 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 md:grid-cols-3';

  return (
    <section
      id="testimonials"
      aria-label="Client Feedback"
      className="pt-4 sm:pt-6 pb-12 sm:pb-16 relative overflow-hidden scroll-mt-24"
    >
      <div className="max-w-5xl mx-auto px-6 space-y-4">
        {/* Interactive Client Switcher Tabs */}
        <div
          role="tablist"
          aria-label="Select a client review"
          className={`grid ${tabGridClass} gap-2.5 p-1.5 rounded-lg border border-border/80 bg-slate-100/80 dark:bg-slate-900/70 backdrop-blur-sm`}
        >
          {clientTestimonials.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                id={`review-tab-${item.id}`}
                type="button"
                role="tab"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                aria-controls={`review-panel-${item.id}`}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectTab((index + 1) % clientTestimonials.length);
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectTab((index - 1 + clientTestimonials.length) % clientTestimonials.length);
                  } else if (e.key === 'Home') {
                    e.preventDefault();
                    selectTab(0);
                  } else if (e.key === 'End') {
                    e.preventDefault();
                    selectTab(clientTestimonials.length - 1);
                  }
                }}
                className="relative flex items-center gap-3 p-2.5 sm:p-3 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {isActive && (
                  <motion.div
                    layoutId="testimonial-tab-highlight"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 380, damping: 32 }
                    }
                    className="absolute inset-0 rounded-lg bg-white dark:bg-[#111928] border border-accent/50 shadow-sm"
                  />
                )}
                <div
                  className={`relative z-10 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isActive
                      ? 'bg-gradient-to-br from-[#00F2FE]/25 to-[#00F5A0]/25 border border-[#00F2FE]/40 text-accent dark:text-[#00F2FE]'
                      : 'bg-white/70 dark:bg-slate-800/80 border border-border text-muted-foreground'
                  }`}
                >
                  {item.initials}
                </div>
                <div className="relative z-10 min-w-0 flex-1">
                  <div
                    className={`text-xs sm:text-sm font-bold leading-snug transition-colors ${
                      isActive ? 'text-foreground' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.author}
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-snug">
                    {item.role}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Full Review Card */}
        <div className="relative rounded-lg p-5 sm:p-7 md:p-8 overflow-hidden border border-border/80 shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-slate-50/80 to-sky-50/30 dark:from-[#111928] dark:via-[#0e1624] dark:to-[#0a121f] dark:border-slate-800/80 dark:shadow-2xl before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#00F2FE]/70 before:to-[#00F5A0]/70">
          {/* Ambient Corner Auras */}
          <div className="pointer-events-none absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-accent/5 dark:bg-[#00F2FE]/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -top-20 w-64 h-64 rounded-full bg-emerald-500/5 dark:bg-[#00F5A0]/10 blur-3xl" />

          {/* Decorative Watermark Quote Icon */}
          <div className="absolute top-5 right-6 text-slate-200/60 dark:text-white/[0.04] select-none pointer-events-none">
            <Quote className="w-20 h-20 sm:w-28 sm:h-28" aria-hidden="true" />
          </div>

          <div
            className="relative z-10 space-y-5"
            role="tabpanel"
            id={`review-panel-${active.id}`}
            aria-labelledby={`review-tab-${active.id}`}
            aria-live="polite"
          >
            {/* Rating Row */}
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              {[...Array(active.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-700 text-amber-700 dark:fill-amber-400 dark:text-amber-400"
                  aria-hidden="true"
                />
              ))}
              <span className="ml-2 font-mono text-[10px] sm:text-xs font-black tracking-wider text-slate-700 dark:text-slate-300 uppercase">
                5.0 · Client review
              </span>
            </div>

            {/* Auto-sized quote track locks height to the longest review (Carolyn's) */}
            <div className="grid">
              {clientTestimonials.map((item) => (
                <p
                  key={`spotlight-sizer-${item.id}`}
                  aria-hidden="true"
                  className="col-start-1 row-start-1 invisible pointer-events-none select-none text-base sm:text-lg md:text-xl font-normal leading-relaxed"
                >
                  &ldquo;{item.quote}&rdquo;
                </p>
              ))}

              <div className="col-start-1 row-start-1 flex items-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.blockquote
                    key={active.id}
                    initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    className="text-base sm:text-lg md:text-xl font-normal leading-relaxed text-slate-800 dark:text-slate-100"
                  >
                    &ldquo;{active.quote}&rdquo;
                  </motion.blockquote>
                </AnimatePresence>
              </div>
            </div>

            {/* Author Attribution & Category Pill Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/70 dark:border-slate-800/80">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#00F2FE]/20 to-[#00F5A0]/20 border border-[#00F2FE]/30 dark:border-[#00F2FE]/40 flex items-center justify-center font-bold text-accent dark:text-[#00F2FE] text-sm tracking-tight shadow-sm shrink-0">
                  {active.initials}
                </div>
                <div>
                  <div className="text-base sm:text-lg font-black text-foreground">
                    {active.author}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {active.role}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  {active.category}
                </span>
                {active.caseStudyHref && (
                  <Link
                    href={active.caseStudyHref}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wide uppercase bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors"
                  >
                    <span>{active.caseStudyLabel ?? 'View case study'}</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
