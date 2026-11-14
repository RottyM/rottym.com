// src/lib/metadata.ts
import type { Metadata } from 'next';

export const SITE_URL = 'https://www.rottym.com';
export const SITE_NAME = 'RottyM · Fast, Modern Websites for Northern Virginia';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

type TitleInput =
  | { title: string; absoluteTitle?: never }
  | { title?: never; absoluteTitle: string };

type PageMetadataInput = TitleInput & {
  description: string;
  /** Route path starting with `/` (e.g. `'/about'`), or `'/'` for the homepage. */
  path: `/${string}`;
  ogTitle?: string;
  ogDescription?: string;
  image?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
};

/**
 * Builds per-route Next.js metadata with canonical URLs, Open Graph tags, and
 * Twitter cards so subpages override root defaults cleanly without dropping images.
 */
export function createPageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  ogTitle,
  ogDescription,
  image,
}: PageMetadataInput): Metadata {
  const canonicalUrl = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
  const resolvedTitle = absoluteTitle ? { absolute: absoluteTitle } : title;
  const socialTitle = ogTitle ?? absoluteTitle ?? `${title} | RottyM`;
  const socialDescription = ogDescription ?? description;
  const rawImageUrl = image?.url ?? DEFAULT_OG_IMAGE;
  const socialImageUrl = rawImageUrl.startsWith('http')
    ? rawImageUrl
    : `${SITE_URL}${rawImageUrl.startsWith('/') ? '' : '/'}${rawImageUrl}`;

  return {
    title: resolvedTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: socialImageUrl,
          width: image?.width ?? 1200,
          height: image?.height ?? 627,
          alt: image?.alt ?? socialTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: socialDescription,
      images: [socialImageUrl],
    },
  };
}

