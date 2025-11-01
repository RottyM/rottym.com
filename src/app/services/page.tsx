import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';  // Create simple UI

const services = [
  {
    title: 'WordPress → Modern Stack Migration',
    desc: 'Upgrade slow WP sites to Next.js + AWS. Faster loads, scalable microservices.',
    tech: ['Next.js', 'AWS Lambda', 'Docker'],
    fromResume: 'Freelance WP + Disney microservices'
  },
  {
    title: 'E-Commerce Storefronts',
    desc: 'Custom headless shops with Stripe, inventory sync, abandoned cart recovery.',
    tech: ['Stripe', 'Medusa.js', 'React'],
    fromResume: 'WWF Gift Center redesign'
  },
  {
    title: 'Subscription Platforms',
    desc: 'Member portals, billing, role-based access, analytics dashboards.',
    tech: ['Stripe Billing', 'Auth0', 'PostgreSQL'],
    fromResume: 'Asurion cost center apps'
  },
  {
    title: 'Social & Community Portals',
    desc: 'User profiles, real-time chat, posts, moderation tools.',
    tech: ['Socket.io', 'Supabase', 'GraphQL'],
    fromResume: 'USA Today The Point interactive portal'
  },
  {
    title: 'Digital Marketing & Social Management',
    desc: 'Campaigns on Meta/Google, content calendars, ROI tracking, promotions.',
    tech: ['Adobe Analytics', 'Google Ads', 'Buffer API'],
    fromResume: 'Freelance social media + Adobe API integration @ Disney'
  },
];

export default function Services() {
  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Services</h1>
          <p className="text-xl text-slate-600">Tailored for businesses ready to scale.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{service.desc}</p>
                <p className="text-sm text-slate-500 italic">From experience: {service.fromResume}</p>
                <div className="flex flex-wrap gap-2">
                  {service.tech.map((t) => (
                    <span key={t} className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-sm">{t}</span>
                  ))}
                </div>
                <Button asChild>
                  <Link href="/contact">Get Quote</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}