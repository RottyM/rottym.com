'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
export type SiteLang = 'en' | 'es';

const LANG_STORAGE_KEY = 'rm-lang';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  lang: SiteLang;
  setLang: (lang: SiteLang) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLangState] = useState<SiteLang>('en');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      queueMicrotask(() => setThemeState(savedTheme));
    }
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
    if (savedLang === 'en' || savedLang === 'es') {
      queueMicrotask(() => setLangState(savedLang));
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const activeTheme: 'light' | 'dark' =
        theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme;

      root.setAttribute('data-theme', activeTheme);
      root.classList.toggle('dark', activeTheme === 'dark');
      setResolvedTheme(activeTheme);

      if (theme !== 'system') {
        localStorage.setItem('theme', theme);
      } else {
        localStorage.removeItem('theme');
      }
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  useEffect(() => {
    window.document.documentElement.lang = lang;
  }, [lang]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const setLang = (newLang: SiteLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch {
      // Ignore storage failures in private contexts
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, lang, setLang }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useLang = () => {
  const { lang, setLang } = useTheme();
  return { lang, setLang };
};
