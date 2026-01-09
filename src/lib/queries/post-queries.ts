import { defineQuery } from "groq";
import { client } from "@/sanity/client";
import {
  sanityCollectionTags,
  sanityTagsForDoc,
  withLocaleTags,
} from "@/lib/sanity/cache-tags";

// Default query options for caching
const DEFAULT_OPTIONS = { next: { revalidate: 30 } };

// ===== COMPREHENSIVE POST QUERIES =====

// Get single post by slug with ALL fields (for schema generation)
export const postBySlugQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug && language == $language][0] {
    // Core document fields
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,

    // Basic content fields
    title,
    slug,
    excerpt,
    content,

    // Media fields
    coverImage {
      asset-> {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          },
          lqip,
          blurHash,
          hasAlpha,
          isOpaque
        }
      },
      hotspot,
      crop,
      alt,
      caption
    },
    coverImageAlt,

    // Author & publication (references only)
    author,
    publishedAt,
    lastModified,
    readingTime,

    // SEO & Schema fields
    metaTitle,
    meta,
    focusKeyword,
    secondaryKeywords,
    articleType,
    articleSection,
    wordCount,

    // Citations & References
    references[] {
      _key,
      citationType,
      title,
      authors,
      publicationYear,
      publisher,
      url,
      doi,
      isbn,
      issn,
      volume,
      issue,
      pages,
      edition,
      accessDate,
      seoWeight,
      keywordRelevance,
      internalNote
    },

    // E-E-A-T signals
    medicallyReviewed,
    medicalReviewer,
    reviewDate,
    nextReviewDate,

    // Content classification
    categories,
    tags,
    // targetAudience,

    // FAQ schema support
    faqs[] {
      question,
      answer
    },

    // How-To schema support
    howTo {
      totalTime,
      supply,
      tool,
      steps[] {
        name,
        text,
        image {
          asset-> {
            _id,
            url,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              }
            }
          },
          hotspot,
          crop,
          alt,
          caption
        },
        url
      }
    },

    // Advanced features
    featured,
    featuredCategory,
    noIndex,
    canonicalUrl,

    // International
    language
  }
`);

// Get all posts with ALL fields (for listings that need schema generation)
export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current) && language == $language] | order(publishedAt desc) {
    // Core document fields
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,

    // Basic content fields
    title,
    slug,
    excerpt,
    content,

    // Media fields
    coverImage {
      asset-> {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          },
          lqip,
          blurHash
        }
      },
      hotspot,
      crop,
      alt,
      caption
    },
    coverImageAlt,

    // Author & publication (references only)
    author,
    publishedAt,
    lastModified,
    readingTime,

    // SEO & Schema fields
    metaTitle,
    meta,
    focusKeyword,
    secondaryKeywords,
    articleType,
    articleSection,
    wordCount,

    // Citations & References
    references[] {
      _key,
      citationType,
      title,
      authors,
      publicationYear,
      publisher,
      url,
      doi,
      isbn,
      issn,
      volume,
      issue,
      pages,
      edition,
      accessDate,
      seoWeight,
      keywordRelevance,
      internalNote
    },

    // E-E-A-T signals
    medicallyReviewed,
    medicalReviewer,
    reviewDate,
    nextReviewDate,

    // Content classification
    categories,
    tags,
    // targetAudience,

    // FAQ schema support
    faqs[] {
      question,
      answer
    },

    // How-To schema support
    howTo {
      totalTime,
      supply,
      tool,
      steps[] {
        name,
        text,
        image {
          asset-> {
            _id,
            url,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              }
            }
          },
          hotspot,
          crop,
          alt,
          caption
        },
        url
      }
    },

    // Advanced features
    featured,
    featuredCategory,
    noIndex,
    canonicalUrl,

    // International
    language
  }
`);

// Get featured posts with ALL fields
export const featuredPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current) && featured == true && language == $language] | order(publishedAt desc) {
    // Core document fields
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,

    // Basic content fields
    title,
    slug,
    excerpt,
    content,

    // Media fields
    coverImage {
      asset-> {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          },
          lqip,
          blurHash
        }
      },
      hotspot,
      crop,
      alt,
      caption
    },
    coverImageAlt,

    // Author & publication (references only)
    author,
    publishedAt,
    lastModified,
    readingTime,

    // SEO & Schema fields
    metaTitle,
    meta,
    focusKeyword,
    secondaryKeywords,
    articleType,
    articleSection,
    wordCount,

    // Citations & References
    references[] {
      _key,
      citationType,
      title,
      authors,
      publicationYear,
      publisher,
      url,
      doi,
      isbn,
      issn,
      volume,
      issue,
      pages,
      edition,
      accessDate,
      seoWeight,
      keywordRelevance,
      internalNote
    },

    // E-E-A-T signals
    medicallyReviewed,
    medicalReviewer,
    reviewDate,
    nextReviewDate,

    // Content classification
    categories,
    tags,
    // targetAudience,

    // FAQ schema support
    faqs[] {
      question,
      answer
    },

    // How-To schema support
    howTo {
      totalTime,
      supply,
      tool,
      steps[] {
        name,
        text,
        image {
          asset-> {
            _id,
            url,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              }
            }
          },
          hotspot,
          crop,
          alt,
          caption
        },
        url
      }
    },

    // Advanced features
    featured,
    featuredCategory,
    noIndex,
    canonicalUrl,

    // International
    language
  }
`);

// ===== LISTING-READY SEARCH QUERY =====
//
// Searches title, excerpt, and Portable Text body content.
// Returns only the fields needed to render blog listing cards, with author/categories dereferenced
// to avoid N+1 reference resolution.
//
// IMPORTANT: Sanity requires that any referenced GROQ params are provided.
// So we avoid `defined($categoryId)` and instead use `coalesce($categoryId, "")`.
export const searchPostsQuery = defineQuery(`
  *[
    _type == "post"
    && defined(slug.current)
    && language == $language
    && (
      title match $pattern
      || excerpt match $pattern
      || pt::text(content) match $pattern
    )
    && (
      coalesce($categoryId, "") == ""
      || $categoryId in categories[]._ref
    )
  ]
  | score(
      title match $pattern,
      excerpt match $pattern,
      pt::text(content) match $pattern
    )
  | order(_score desc, publishedAt desc)
  [0...$limit] {
    _id,
    title,
    slug,
    excerpt,

    coverImage {
      asset-> {
        _id,
        url
      },
      alt,
      caption
    },
    coverImageAlt,

    author->{
      _id,
      name,
      slug
    },

    categories[]->{
      _id,
      title,
      slug
    },

    tags,
    publishedAt,
    readingTime,
    featured,
    featuredCategory
  }
`);

// ===== QUERY EXECUTION FUNCTIONS =====

export async function getPostBySlug(slug: string, language?: string) {
  // This query returns `_id` and `_type`, but we don't know `_id` until after fetch.
  // Tag by type + collection + locale so edits to posts can be revalidated reliably.
  const tags = withLocaleTags(
    Array.from(
      new Set([
        ...sanityCollectionTags("posts"),
        ...sanityTagsForDoc({ _type: "post" }),
      ]),
    ),
    language ?? null,
  );

  return client.fetch(
    postBySlugQuery,
    { slug, language },
    {
      ...DEFAULT_OPTIONS,
      next: {
        ...DEFAULT_OPTIONS.next,
        tags,
      },
    },
  );
}

export async function getAllPosts(language?: string) {
  const tags = withLocaleTags(
    Array.from(
      new Set([
        ...sanityCollectionTags("posts"),
        ...sanityTagsForDoc({ _type: "post" }),
      ]),
    ),
    language ?? null,
  );

  return client.fetch(
    allPostsQuery,
    { language },
    {
      ...DEFAULT_OPTIONS,
      next: {
        ...DEFAULT_OPTIONS.next,
        tags,
      },
    },
  );
}

export async function getFeaturedPosts(language?: string) {
  const tags = withLocaleTags(
    Array.from(
      new Set([
        ...sanityCollectionTags("posts"),
        ...sanityCollectionTags("featured-posts"),
        ...sanityTagsForDoc({ _type: "post" }),
      ]),
    ),
    language ?? null,
  );

  return client.fetch(
    featuredPostsQuery,
    { language },
    {
      ...DEFAULT_OPTIONS,
      next: {
        ...DEFAULT_OPTIONS.next,
        tags,
      },
    },
  );
}

export async function searchPosts(params: {
  q: string;
  language: string;
  categoryId?: string;
  limit?: number;
}) {
  const { q, language, categoryId, limit = 50 } = params;

  const trimmed = q.trim();
  const safe = trimmed.slice(0, 200);

  // GROQ match uses wildcards, so wrap in *...*
  const pattern = `*${safe}*`;

  // IMPORTANT: always provide categoryId, even when unset, because the GROQ query references it.
  // We use "" (empty string) as the "no category filter" sentinel.
  const categoryIdParam = categoryId ? categoryId : "";

  // Search should generally not be cached at the edge like SSG data
  return client.fetch(
    searchPostsQuery,
    { language, pattern, categoryId: categoryIdParam, limit },
    { cache: "no-store" },
  );
}
