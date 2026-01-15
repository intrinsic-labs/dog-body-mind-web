import { MetadataRoute } from 'next';
import { Locale, locales, getDomainForLocale, localeToLanguageTag } from './locale';
import type { SitemapPost } from '../infrastructure/sanity/queries/sitemap-queries';

/**
 * Generate the base URL for a given locale
 * Uses production domains, not development
 */
export function getBaseUrl(locale: Locale): string {
  const domain = getDomainForLocale(locale, false); // false = production domains
  return `https://${domain}`;
}

/**
 * Generate a full URL for a post
 */
export function getPostUrl(locale: Locale, slug: string): string {
  const baseUrl = getBaseUrl(locale);
  return `${baseUrl}/blog/${slug}`;
}

/**
 * Generate a full URL for the blog listing page
 */
export function getBlogListingUrl(locale: Locale): string {
  const baseUrl = getBaseUrl(locale);
  return `${baseUrl}/blog`;
}

/**
 * Generate a full URL for the landing page
 */
export function getLandingPageUrl(locale: Locale): string {
  return getBaseUrl(locale);
}

/**
 * Get the most recent modification date from a post
 * Prefers lastModified, falls back to _updatedAt, then publishedAt
 */
export function getLastModifiedDate(post: SitemapPost): Date {
  if (post.lastModified) {
    return new Date(post.lastModified);
  }
  if (post._updatedAt) {
    return new Date(post._updatedAt);
  }
  return new Date(post.publishedAt);
}

/**
 * Generate hreflang alternate links for a given path
 * Returns array of objects with locale and URL for each language version
 */
export function generateHreflangAlternates(path: string): Array<{
  locale: string;
  url: string;
}> {
  return locales.map((locale) => ({
    locale: localeToLanguageTag[locale],
    url: `${getBaseUrl(locale)}${path}`,
  }));
}

/**
 * Convert a SitemapPost to a sitemap entry with proper metadata
 */
export function postToSitemapEntry(
  post: SitemapPost,
  locale: Locale,
): MetadataRoute.Sitemap[0] {
  const url = getPostUrl(locale, post.slug.current);
  const lastModified = getLastModifiedDate(post);

  return {
    url,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
    alternates: {
      languages: Object.fromEntries(
        generateHreflangAlternates(`/blog/${post.slug.current}`).map((alt) => [
          alt.locale,
          alt.url,
        ]),
      ),
    },
  };
}

/**
 * Create sitemap entry for the blog listing page
 */
export function createBlogListingEntry(locale: Locale): MetadataRoute.Sitemap[0] {
  return {
    url: getBlogListingUrl(locale),
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
    alternates: {
      languages: Object.fromEntries(
        generateHreflangAlternates('/blog').map((alt) => [alt.locale, alt.url]),
      ),
    },
  };
}

/**
 * Create sitemap entry for the landing page
 */
export function createLandingPageEntry(locale: Locale): MetadataRoute.Sitemap[0] {
  return {
    url: getLandingPageUrl(locale),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
    alternates: {
      languages: Object.fromEntries(
        generateHreflangAlternates('').map((alt) => [alt.locale, alt.url]),
      ),
    },
  };
}
