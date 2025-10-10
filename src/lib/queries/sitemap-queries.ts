import { defineQuery } from 'groq';
import { client } from "@/sanity/client";

// Default query options for caching
const DEFAULT_OPTIONS = { next: { revalidate: 3600 } }; // Cache for 1 hour

// ===== SITEMAP QUERIES =====

/**
 * Get all published posts for sitemap generation
 * Excludes:
 * - Posts with noIndex: true
 * - Posts without published date
 * - Draft posts
 */
export const sitemapPostsQuery = defineQuery(`
  *[
    _type == "post"
    && defined(slug.current)
    && defined(publishedAt)
    && publishedAt <= now()
    && (!defined(noIndex) || noIndex == false)
    && (!defined(language) || language == $language)
  ] | order(publishedAt desc) {
    _id,
    _updatedAt,
    slug,
    publishedAt,
    lastModified,
    language
  }
`);

/**
 * Get count of posts per language for sitemap index
 */
export const sitemapPostCountQuery = defineQuery(`
  count(*[
    _type == "post"
    && defined(slug.current)
    && defined(publishedAt)
    && publishedAt <= now()
    && (!defined(noIndex) || noIndex == false)
    && (!defined(language) || language == $language)
  ])
`);

// ===== QUERY EXECUTION FUNCTIONS =====

/**
 * Fetch all posts for sitemap generation for a specific language
 */
export async function getSitemapPosts(language: string) {
  return client.fetch(sitemapPostsQuery, { language }, DEFAULT_OPTIONS);
}

/**
 * Get count of posts for a language
 */
export async function getSitemapPostCount(language: string) {
  return client.fetch(sitemapPostCountQuery, { language }, DEFAULT_OPTIONS);
}

// ===== TYPE DEFINITIONS =====

export interface SitemapPost {
  _id: string;
  _updatedAt: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  lastModified?: string | null;
  language?: string | null;
}
