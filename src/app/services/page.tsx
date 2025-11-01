// src/app/services/page.tsx
import Link from 'next/link';

const services = [
  { title: "WordPress to Modern Stack Migration", desc: "Upgrade slow WP sites to Next.js + AWS.", tech: ["Next.js", "AWS", "Docker"] },
  { title: "E-Commerce Storefronts", desc: "Headless shops with Stripe, inventory sync.", tech: ["Stripe", "Medusa.js", "React"] },
  { title: "Subscription Platforms", desc: "Member portals, billing, analytics.", tech: ["Stripe Billing", "Auth0", "PostgreSQL"] },
  { title: "Social & Community Portals", desc: "Profiles, chat, moderation.", tech: ["Socket.io", "Supabase", "GraphQL"] },
  { title: "Digital Marketing", desc: "Campaigns, ROI tracking, promotions.", tech: ["Google Ads", "Meta", "Buffer"] },
];

export default function Services() {
  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto text-center">
        <img src="/images/stock/wp-slow.jpg" alt="Slow WordPress" className="rounded-lg shadow-md" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Services</h1>
        <p className="text-xl text-slate-600 mb-16">End-to-end solutions that scale.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition border border-slate-100">
              <h3 className="text-2xl font-bold mb-3 text-slate-900">{s.title}</h3>
              <p className="text-slate-600 mb-6">{s.desc}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {s.tech.map(t => (
                  <span key={t} className="px-3 py-1 bg-sky-100 text-sky-700 text-sm rounded-full font-medium">{t}</span>
                ))}
              </div>
              <Link href="/contact" className="block w-full bg-sky-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-sky-700 transition">
                Get Quote
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}