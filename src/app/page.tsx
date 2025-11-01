// src/app/page.tsx
'use client';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!localStorage.getItem('audit-shown')) {
        const popup = document.createElement('div');
        popup.innerHTML = `
          <div style="position:fixed;bottom:20px;right:20px;background:white;padding:24px;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.1);max-width:320px;z-index:9999;border:1px solid #e2e8f0;">
            <h3 style="margin:0 0 8px;font-size:1.25rem;font-weight:bold;">Free WordPress Audit</h3>
            <p style="margin:0 0 16px;font-size:0.875rem;color:#475569;">Get a 5-point speed, security & SEO report in 24h.</p>
            <a href="/contact" style="display:inline-block;background:#0ea5e9;color:white;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:600;">Claim Audit →</a>
            <button onclick="this.parentElement.parentElement.remove();localStorage.setItem('audit-shown','true')" style="position:absolute;top:8px;right:8px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#94a3b8;">×</button>
          </div>
        `;
        document.body.appendChild(popup);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="min-h-screen flex items-center px-6 bg-gradient-to-br from-slate-50 via-sky-50 to-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block px-4 py-1 bg-sky-100 text-sky-700 text-sm font-semibold rounded-full">
              Available for Consulting · Virginia-Based
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              From <span className="text-amber-500">WordPress</span> to <span className="text-sky-600">Scalable Apps</span>
            </h1>
            <p className="text-xl text-slate-600">
              I help businesses escape slow WordPress sites and build fast, secure, modern platforms with e-commerce, subscriptions, and digital marketing.
            </p>
            <div className="flex gap-4">
              <Link href="/contact" className="inline-flex items-center bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg">
                Start Your Project
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/portfolio" className="border-2 border-sky-600 text-sky-600 hover:bg-sky-50 font-bold py-3 px-6 rounded-lg transition">
                View Portfolio
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 pt-6">
              {['Java', 'React', 'AWS', 'Next.js', 'Docker', 'PostgreSQL'].map(skill => (
                <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-full overflow-hidden shadow-2xl w-80 h-80 mx-auto border-8 border-white">
              <img 
                src="/images/portfolio/rottman-hero.jpg" 
                alt="Rottman Mendez" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-sky-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              10+ Years @ Disney, FAA, USA Today
            </div>
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600 mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center gap-12 text-2xl font-bold text-slate-800 opacity-70">
            {['Disney', 'FAA', 'FEMA', 'USA Today', 'Booz Allen', 'Leidos'].map(c => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}