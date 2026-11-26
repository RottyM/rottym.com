'use client';

import { useSyncExternalStore } from 'react';
import { useLang } from './ThemeProvider';

const emptySubscribe = () => () => {};

export default function SkipToContentLink() {
  const { lang } = useLang();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isEs = (mounted ? lang : 'en') === 'es';

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-foreground font-bold text-sm"
    >
      {isEs ? 'Ir al contenido principal' : 'Skip to main content'}
    </a>
  );
}
