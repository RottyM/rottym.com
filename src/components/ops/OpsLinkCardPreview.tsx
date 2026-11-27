'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Globe, Link2 } from 'lucide-react';
import { splitTextWithUrls } from '@/lib/ops/drop-parser';
import { getOpsAuth } from '@/lib/ops/firebase-client';
import type { PipelineCard } from '@/lib/ops/types';

export interface ResolvedLinkPreview {
  url: string;
  finalUrl: string;
  domain: string;
  siteName?: string;
  title?: string;
  description?: string;
  image?: string;
  cardType: 'summary_large_image' | 'summary';
}

const clientPreviewCache = new Map<string, Promise<ResolvedLinkPreview | null>>();

function isSkippablePreviewUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (lower.startsWith('/')) return true;
  if (lower.includes('x.com/intent/') || lower.includes('twitter.com/intent/')) return true;
  if (lower.includes('drive.google.com/') || lower.includes('docs.google.com/')) return true;
  return false;
}

/** Picks the primary external article URL X / Facebook / LinkedIn will unfurl for a card. */
export function extractPrimaryArticleUrl(
  card: Pick<PipelineCard, 'draftCopy' | 'sourceUrl'>
): string | null {
  if (card.draftCopy?.trim()) {
    for (const seg of splitTextWithUrls(card.draftCopy)) {
      if (seg.type === 'url' && !isSkippablePreviewUrl(seg.value)) {
        return seg.value;
      }
    }
  }
  const src = card.sourceUrl?.trim();
  if (src && /^https?:\/\//i.test(src) && !isSkippablePreviewUrl(src)) {
    return src;
  }
  return null;
}

async function fetchLinkPreview(url: string): Promise<ResolvedLinkPreview | null> {
  const existing = clientPreviewCache.get(url);
  if (existing) return existing;

  const promise = (async (): Promise<ResolvedLinkPreview | null> => {
    try {
      const user = getOpsAuth().currentUser;
      const idToken = user ? await user.getIdToken() : '';
      const headers: Record<string, string> = {};
      if (idToken) headers.Authorization = `Bearer ${idToken}`;
      const res = await fetch(`/api/ops/link-preview?url=${encodeURIComponent(url)}`, {
        headers,
        cache: 'force-cache',
      });
      if (!res.ok) return null;
      const data = (await res.json().catch(() => null)) as
        | (ResolvedLinkPreview & { ok?: boolean })
        | null;
      if (!data?.ok) return null;
      return data;
    } catch {
      return null;
    }
  })();

  clientPreviewCache.set(url, promise);
  return promise;
}

export function OpsLinkCardPreview({
  url,
  variant = 'card',
  compact = false,
  className = '',
}: {
  url: string;
  variant?: 'card' | 'horizontal' | 'thumb';
  compact?: boolean;
  className?: string;
}) {
  const [loaded, setLoaded] = useState<{ url: string; data: ResolvedLinkPreview | null } | null>(
    null
  );
  const [brokenImageUrl, setBrokenImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchLinkPreview(url).then((data) => {
      if (!cancelled) setLoaded({ url, data });
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const isLoading = !loaded || loaded.url !== url;
  const preview = loaded?.url === url ? loaded.data : null;
  const domainFallback = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./i, '');
    } catch {
      return 'Article link';
    }
  })();
  const imageSrc =
    preview?.image && brokenImageUrl !== preview.image ? preview.image : null;

  if (variant === 'thumb') {
    if (imageSrc) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={preview?.title || domainFallback}
          className={className}
          referrerPolicy="no-referrer"
          onError={() => setBrokenImageUrl(imageSrc)}
        />
      );
    }
    return (
      <div
        className={`flex flex-col items-center justify-center bg-sky-500/10 text-sky-700 dark:text-sky-300 p-1 ${className}`}
        title={preview?.title || url}
      >
        <Globe className="w-3.5 h-3.5 shrink-0" />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-col sm:flex-row items-stretch rounded-lg border border-border bg-card overflow-hidden hover:border-accent/60 transition-colors group ${className}`}
      >
        {imageSrc && (
          <div className="w-full h-28 sm:w-40 sm:h-auto sm:min-h-[84px] sm:max-h-24 shrink-0 overflow-hidden bg-muted/40 border-b sm:border-b-0 sm:border-r border-border/70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={preview?.title || domainFallback}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
              onError={() => setBrokenImageUrl(imageSrc)}
            />
          </div>
        )}
        <div className="flex-1 min-w-0 p-2.5 flex flex-col justify-center gap-1">
          <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
            <span className="inline-flex items-center gap-1 truncate">
              <Link2 className="w-3 h-3 shrink-0 text-sky-600 dark:text-sky-400" />
              <span className="truncate">
                {preview?.siteName || preview?.domain || domainFallback}
              </span>
            </span>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover:text-accent" />
          </div>
          <div className="text-xs font-medium text-foreground line-clamp-1 leading-snug">
            {isLoading
              ? `Resolving link card (${domainFallback})...`
              : preview?.title || url}
          </div>
          {preview?.description && (
            <div className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
              {preview.description}
            </div>
          )}
        </div>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-xl border border-border bg-card overflow-hidden hover:border-accent/60 transition-colors group ${className}`}
    >
      {imageSrc && (
        <div className={`w-full overflow-hidden bg-muted/40 border-b border-border/70 ${compact ? 'aspect-[2/1] max-h-28' : 'aspect-[1.91/1] max-h-52'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={preview?.title || domainFallback}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform"
            onError={() => setBrokenImageUrl(imageSrc)}
          />
        </div>
      )}
      <div className={compact ? 'p-2 space-y-0.5' : 'p-2.5 space-y-1'}>
        <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
          <span className="inline-flex items-center gap-1 truncate">
            <Link2 className="w-3 h-3 shrink-0 text-sky-600 dark:text-sky-400" />
            <span className="truncate">
              {preview?.siteName || preview?.domain || domainFallback}
            </span>
          </span>
          <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover:text-accent" />
        </div>
        <div className={`${compact ? 'text-[11px]' : 'text-xs'} font-medium text-foreground line-clamp-2 leading-snug`}>
          {isLoading
            ? `Resolving link card (${domainFallback})...`
            : preview?.title || url}
        </div>
        {!compact && preview?.description && (
          <div className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
            {preview.description}
          </div>
        )}
      </div>
    </a>
  );
}
