// src/app/services/page.tsx
import Link from 'next/link';

const services = [
  {
    title: "WordPress → Modern Stack Migration",
    desc: "Upgrade slow WP sites to Next.js + AWS. Faster loads, scalable microservices.",
    tech: ["Next.js", "AWS Lambda", "Docker"],
  },
  {
    title: "E-Commerce Storefronts",
    desc: "Custom headless shops with Stripe, inventory sync, abandoned cart recovery.",
    tech: ["Stripe", "Medusa.js", "React"],
  },
  {
    title: "Subscription Platforms",
    desc: "Member portals, billing, role-based access, analytics dashboards.",
    tech: ["Stripe Billing", "Auth0", "PostgreSQL"],
  },
  {
    title: "Social & Community Portals",
    desc: "User profiles, real-time chat, posts, moderation tools.",
    tech: ["Socket.io", "Supabase", "GraphQL"],
  },
  {
    title: "Digital Marketing & Social Management",
    desc: "Campaigns on Meta/Google, content calendars, ROI tracking, promotions.",
    tech: ["Adobe Analytics", "Google Ads", "Buffer API"],
  },
];

export default function Services() {
  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Services</h1>
        <p className="text-xl text-slate-600 mb-16">End-to-end solutions that scale with your business.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 border border-slate-100"
            >
              <h3 className="text-2xl font-bold mb-3 text-slate-900">{service.title}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{service.desc}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {service.tech.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 bg-sky-100 text-sky-700 text-sm rounded-full font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <Link
                href="/contact"
                className="inline-block w-full bg-sky-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-sky-700 transition"
              >
                Get Quote
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}