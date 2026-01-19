import { defineQuery } from "next-sanity";
import { client } from "@/infrastructure/sanity/client";
import { Locale } from "@domain/locale";
import {
  sanityCollectionTags,
  sanityTagsForDoc,
  withLocaleTags,
} from "@/infrastructure/sanity/cache-tags";

// Default query options for caching
const DEFAULT_OPTIONS = { next: { revalidate: 3600 } }; // Cache for 1 hour

// Get all categories with language-specific field extraction
export const allCategoriesQuery = defineQuery(`
  *[_type == "category"] | order(title[_key == $language][0].value asc) {
    // Core document fields
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,

    // Internationalized fields (language-specific extraction)
    "title": title[_key == $language][0].value,
    "slug": slug[_key == $language][0].value,
    "description": description[_key == $language][0].value,
    "metaDescription": metaDescription[_key == $language][0].value,

    // Featured image with internationalized alt text
    featuredImage {
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
      "alt": alt[_key == $language][0].value
    },

    // Parent category reference (kept as reference for separate resolution)
    parent {
      _ref,
      _type
    },

    // Language field (managed by internationalization plugin)
    language
  }
`);

// Get single category by slug with language-specific field extraction
export const categoryBySlugQuery = defineQuery(`
  *[_type == "category" && slug[_key == $language][0].value.current == $slug][0] {
    // Core document fields
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,

    // Internationalized fields (language-specific extraction)
    "title": title[_key == $language][0].value,
    "slug": slug[_key == $language][0].value,
    "description": description[_key == $language][0].value,
    "metaDescription": metaDescription[_key == $language][0].value,

    // Featured image with internationalized alt text
    featuredImage {
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
      "alt": alt[_key == $language][0].value
    },

    // Parent category reference (kept as reference for separate resolution)
    parent {
      _ref,
      _type
    },

    // Language field (managed by internationalization plugin)
    language
  }
`);

// Get category references only (for reference resolution)
export const categoryReferencesQuery = defineQuery(`
  *[_type == "category" && _id in $ids] {
    _id,
    "title": title[_key == $language][0].value,
    "slug": slug[_key == $language][0].value
  }
`);

// Get child categories for hierarchical navigation
export const childCategoriesQuery = defineQuery(`
  *[_type == "category" && parent._ref == $parentId] | order(title[_key == $language][0].value asc) {
    _id,
    "title": title[_key == $language][0].value,
    "slug": slug[_key == $language][0].value,
    "description": description[_key == $language][0].value
  }
`);

// Helper function to fetch all categories
export async function getAllCategories(locale: Locale) {
  const tags = withLocaleTags(
    Array.from(
      new Set([
        ...sanityCollectionTags("categories"),
        ...sanityTagsForDoc({ _type: "category" }),
      ]),
    ),
    locale,
  );

  return client.fetch(
    allCategoriesQuery,
    { language: locale },
    {
      ...DEFAULT_OPTIONS,
      next: {
        ...DEFAULT_OPTIONS.next,
        tags,
      },
    },
  );
}
