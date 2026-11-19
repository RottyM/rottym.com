// src/lib/analytics.ts

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-C0XCJ5TP2M';

type GtagFn = (...args: unknown[]) => void;

const getGtag = (): GtagFn | undefined => {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { gtag?: GtagFn }).gtag;
};

// Track pageviews
export const pageview = (url: string) => {
  const gtag = getGtag();
  if (gtag && GA_TRACKING_ID) {
    gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track conversion and custom engagement events
export const trackEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}) => {
  const gtag = getGtag();
  if (gtag) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

