import { defineQuery } from 'groq';
import { client } from "@/sanity/client";

// Default query options for caching
const DEFAULT_OPTIONS = { next: { revalidate: 3600 } }; // Cache for 1 hour

// Get single legal page by slug
export const legalPageBySlugQuery = defineQuery(`
  *[_type == "legalPage" && slug.current == $slug && (!defined(language) || language == $language)][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    title,
    slug,
    content,
    excerpt,
    lastUpdated,
    metaTitle,
    metaDescription,
    noIndex,
    language
  }
`);

// Get all legal pages for a language (for generating static params)
export const allLegalPagesQuery = defineQuery(`
  *[_type == "legalPage" && defined(slug.current) && (!defined(language) || language == $language)] | order(title asc) {
    _id,
    title,
    slug,
    language
  }
`);

export async function getLegalPageBySlug(slug: string, language?: string) {
  return client.fetch(legalPageBySlugQuery, { slug, language }, DEFAULT_OPTIONS);
}

export async function getAllLegalPages(language?: string) {
  return client.fetch(allLegalPagesQuery, { language }, DEFAULT_OPTIONS);
}
