import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getLocaleFromDomain, Locale } from '@/lib/locale';
import { getSitemapPosts, type SitemapPost } from '@/lib/queries/sitemap-queries';
import {
  postToSitemapEntry,
  createBlogListingEntry,
  createLandingPageEntry as createLandingPageEntry,
} from '@/lib/sitemap-utils';

/**
 * Generate domain-specific sitemap
 *
 * This sitemap detects the domain from the request and generates
 * the appropriate locale-specific sitemap:
 * - dogbodymind.com/sitemap.xml → English content
 * - dogbodymind.de/sitemap.xml → German content
 * - dogbodymind.fr/sitemap.xml → French content
 * - etc.
 *
 * Each sitemap includes:
 * - Landing page
 * - Blog listing page
 * - All published blog posts (excluding noIndex posts)
 *
 * Each URL includes hreflang alternates pointing to the same content
 * on other language domains for proper international SEO.
 *
 * SEO Best Practices Implemented:
 * - Only published posts (publishedAt <= now)
 * - Excludes posts with noIndex: true
 * - Uses lastModified for accurate change tracking
 * - Proper priority values (1.0 for landing page, 0.8 for listing, 0.7 for posts)
 * - Appropriate changeFrequency values
 * - Complete hreflang alternates for all locales
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Detect the domain from the request
  const headersList = await headers();
  const hostname = headersList.get('host') || '';

  // Determine which locale's sitemap to generate based on the domain
  const locale: Locale = getLocaleFromDomain(hostname);

  console.log(`[SITEMAP] Generating sitemap for domain: ${hostname}, locale: ${locale}`);

  try {
    // Fetch all published posts for this locale
    const posts: SitemapPost[] = await getSitemapPosts(locale);

    console.log(`[SITEMAP] Found ${posts.length} posts for locale ${locale}`);

    // Build sitemap entries
    const sitemapEntries: MetadataRoute.Sitemap = [
      // Landing page - highest priority
      createLandingPageEntry(locale),

      // Blog listing page - high priority, changes frequently
      createBlogListingEntry(locale),

      // Individual blog posts - standard priority
      ...posts.map((post) => postToSitemapEntry(post, locale)),
    ];

    return sitemapEntries;
  } catch (error) {
    console.error(`[SITEMAP] Error generating sitemap for locale ${locale}:`, error);

    // Return minimal sitemap on error to prevent sitemap from failing completely
    return [
      createLandingPageEntry(locale),
      createBlogListingEntry(locale),
    ];
  }
}

// Force dynamic rendering since we need to read the hostname from headers
export const dynamic = 'force-dynamic';
