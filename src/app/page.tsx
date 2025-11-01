// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="min-h-screen flex items-center px-6 bg-gradient-to-br from-slate-50 to-sky-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block px-4 py-1 bg-sky-100 text-sky-700 text-sm font-semibold rounded-full">
              Full-Stack + UX | Virginia-Based
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              Scalable Web Solutions<br />
              <span className="text-amber-500">From WP to Microservices</span>
            </h1>
            <p className="text-xl text-slate-600">
              Java, React, AWS expert. E-commerce, subscriptions, social portals + marketing. 
              10+ years @ Disney, FAA, FEMA.
            </p>
            <div className="flex gap-4">
              <Link href="/contact" className="inline-flex items-center bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-md">
                Start Project
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/portfolio" className="border-2 border-sky-600 text-sky-600 hover:bg-sky-50 font-bold py-3 px-6 rounded-lg transition">
                Portfolio
              </Link>
            </div>
          </div>
          <div>
            <img src="/images/portfolio/rottman-hero.jpg" alt="Rottman Mendez" className="rounded-3xl shadow-2xl w-full max-w-md mx-auto" />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-8 text-slate-800">Trusted By</h2>
          <div className="flex flex-wrap justify-center gap-8 text-xl font-semibold text-slate-700">
            {['Disney', 'FAA', 'FEMA', 'USA Today', 'Booz Allen', 'Leidos'].map(c => <span key={c}>{c}</span>)}
          </div>
        </div>
      </section>
    </>
  );
}