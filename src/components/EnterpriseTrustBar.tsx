import { ShieldCheck } from 'lucide-react';

const ENTERPRISE_CLIENTS = ['Disney', 'FEMA', 'BAE Systems', 'FAA', 'Leidos', 'USA Today'];

export default function EnterpriseTrustBar() {
  return (
    <section aria-label="Enterprise engineering background" className="space-y-3">
      <p className="font-mono text-[11px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground text-center sm:text-left">
        BUILT BY ROTTMAN M. MENDEZ — ENTERPRISE ENGINEERING BACKGROUND:{' '}
        <span className="text-foreground">
          {ENTERPRISE_CLIENTS.join(' · ')}
        </span>
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {ENTERPRISE_CLIENTS.map((name) => (
          <div
            key={name}
            className="stitch-card px-3 py-2.5 rounded-lg flex items-center justify-between gap-2"
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground truncate">
              {name}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}
