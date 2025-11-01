import Link from 'next/link';
import { Button } from '@/components/ui/button';  // We'll create this
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Code2, Globe, ShoppingCart, Users, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <>
      <section className="min-h-screen flex items-center px-6 bg-gradient-to-br from-slate-50 to-sky-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-sky-100 text-sky-700">Full-Stack + UX | Virginia-Based</Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              Scalable Web Solutions<br />
              <span className="text-amber-500">From WP to Microservices</span>
            </h1>
            <p className="text-xl text-slate-600">
              Java, React/Redux, AWS expert. E-commerce, subscriptions, social portals + marketing. 10+ years @ Disney, FAA, FEMA.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-sky-600">
                <Link href="/contact">Start Project <ArrowRight className="ml-2" /></Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/portfolio">Portfolio</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 text-sm text-slate-600">
              {[
                { icon: Code2, label: 'Java · React · AWS' },
                { icon: Globe, label: 'Scalable Platforms' },
                { icon: ShoppingCart, label: 'E-Commerce' },
                { icon: Users, label: 'Social Portals' },
                { icon: BarChart3, label: 'Marketing' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-sky-600" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden md:block">
            <img src="/hero-mockup.jpg" alt="Dashboard Mockup" className="rounded-3xl shadow-2xl" width={500} height={300} />
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-8">Trusted By</h2>
          <div className="flex flex-wrap justify-center gap-8 text-xl font-semibold text-slate-700">
            {['Disney', 'FAA', 'FEMA', 'USA Today', 'Booz Allen', 'Leidos'].map((client) => (
              <span key={client}>{client}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}