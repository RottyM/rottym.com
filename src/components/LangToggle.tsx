'use client';

import { useId, useSyncExternalStore } from 'react';
import { useLang, type SiteLang } from './ThemeProvider';
import { trackEvent } from '@/lib/analytics';

const emptySubscribe = () => () => {};

const OPTIONS: Array<{ value: SiteLang; label: string; ariaLabel: string }> = [
  { value: 'en', label: 'EN', ariaLabel: 'English' },
  { value: 'es', label: 'ES', ariaLabel: 'Español (Spanish)' },
];

export default function LangToggle({
  embedded = false,
  compact = false,
  disabled = false,
}: {
  embedded?: boolean;
  compact?: boolean;
  disabled?: boolean;
}) {
  const { lang, setLang } = useLang();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const groupId = useId();
  const activeLang: SiteLang = mounted ? lang : 'en';

  return (
    <fieldset
      disabled={disabled}
      className={
        embedded
          ? 'inline-flex items-center gap-0.5 shrink-0'
          : 'inline-flex items-center rounded-lg border border-border bg-card/95 p-0.5 gap-0.5 shrink-0 shadow-xs'
      }
      aria-label="Language / Idioma"
    >
      <legend className="sr-only">Language / Idioma</legend>
      {OPTIONS.map((opt) => {
        const checked = activeLang === opt.value;
        return (
          <label
            key={opt.value}
            className={`cursor-pointer select-none rounded-md font-mono font-bold transition-colors focus-within:ring-2 focus-within:ring-accent ${
              compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
            } ${
              checked
                ? 'bg-[#090D16] text-white dark:bg-accent dark:text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <input
              type="radio"
              name={`site-lang-${groupId}`}
              value={opt.value}
              checked={checked}
              tabIndex={disabled ? -1 : undefined}
              aria-label={opt.ariaLabel}
              onChange={() => {
                if (opt.value === activeLang) return;
                setLang(opt.value);
                trackEvent({
                  action: 'lang_switch',
                  category: 'i18n',
                  label: `${activeLang}->${opt.value}`,
                });
              }}
              className="sr-only"
            />
            <span>{opt.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
