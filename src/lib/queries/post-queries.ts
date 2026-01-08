import { defineQuery } from "groq";
import { client } from "@/sanity/client";

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

// ===== QUERY EXECUTION FUNCTIONS =====

export async function getPostBySlug(slug: string, language?: string) {
  return client.fetch(postBySlugQuery, { slug, language }, DEFAULT_OPTIONS);
}

export async function getAllPosts(language?: string) {
  return client.fetch(allPostsQuery, { language }, DEFAULT_OPTIONS);
}

export async function getFeaturedPosts(language?: string) {
  return client.fetch(featuredPostsQuery, { language }, DEFAULT_OPTIONS);
}
