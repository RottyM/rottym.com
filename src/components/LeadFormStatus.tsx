'use client';

import { useLang } from './ThemeProvider';

interface LeadFormStatusProps {
  status: string;
  isSuccess: boolean;
}

export default function LeadFormStatus({ status, isSuccess }: LeadFormStatusProps) {
  const { lang } = useLang();
  const isEs = lang === 'es';

  if (!status) return null;

  const isError = status.includes('Error');

  return (
    <div
      role="status"
      aria-live="polite"
      className={`p-4 rounded-lg border text-center space-y-2 ${
        isError
          ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
          : isSuccess
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
            : 'bg-accent/10 border-accent/20 text-foreground'
      }`}
    >
      <p className="font-bold text-sm">{status}</p>
      {isError && (
        <div>
          <a
            href="mailto:rmendez@rottym.com?subject=Website%20Audit%20Request"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            {isEs ? 'Escribir directo a rmendez@rottym.com' : 'Email rmendez@rottym.com Directly'}{' '}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      )}
    </div>
  );
}
