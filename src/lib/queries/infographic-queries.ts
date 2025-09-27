import { defineQuery } from "groq";
import { client } from "@/sanity/client";

// Default query options for caching
const DEFAULT_OPTIONS = { next: { revalidate: 30 } };

// ===== INFOGRAPHIC QUERIES =====

// Get single infographic by ID with language-specific fields for PDF generation
export const infographicByIdQuery = defineQuery(`
  *[_type == "infographic" && _id == $id][0] {
    // Core document fields
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,

    // Language-specific content (with fallbacks)
    "title": coalesce(
      title[language == $language][0].value,
      title[language == "en"][0].value,
      title[0].value
    ),
    "description": coalesce(
      description[language == $language][0].value,
      description[language == "en"][0].value,
      description[0].value
    ),
    "altText": coalesce(
      altText[language == $language][0].value,
      altText[language == "en"][0].value,
      altText[0].value
    ),
    "slug": coalesce(
      slug[language == $language][0].current,
      slug[language == "en"][0].current,
      slug[0].current
    ),

    // Language-specific image with flexible asset resolution
    "image": coalesce(
      image[language == $language][0].asset.asset->,
      image[language == "en"][0].asset.asset->,
      image[0].asset.asset->
    ) {
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

    // PDF-specific fields (with fallbacks)
    "downloadFilename": coalesce(
      downloadFilename[language == $language][0].value,
      downloadFilename[language == "en"][0].value,
      downloadFilename[0].value
    ),
    "pdfMetadata": coalesce(
      pdfMetadata[language == $language][0],
      pdfMetadata[language == "en"][0],
      pdfMetadata[0]
    ) {
      title,
      keywords,
      author,
      subject
    }
  }
`);

// Get multiple infographics by IDs (batch query)
export const infographicsByIdsQuery = defineQuery(`
  *[_type == "infographic" && _id in $ids] {
    // Core document fields
    _id,
    _type,

    // Language-specific content (with fallbacks)
    "title": coalesce(
      title[language == $language][0].value,
      title[language == "en"][0].value,
      title[0].value
    ),
    "slug": coalesce(
      slug[language == $language][0].current,
      slug[language == "en"][0].current,
      slug[0].current
    ),

    // Language-specific image for preview
    "image": coalesce(
      image[language == $language][0].asset.asset,
      image[language == "en"][0].asset.asset,
      image[0].asset.asset
    ) -> {
      _id,
      url,
      metadata {
        dimensions {
          width,
          height,
          aspectRatio
        },
        lqip
      }
    }
  }
`);

// Check if infographic has content in specific language
export const infographicLanguageAvailabilityQuery = defineQuery(`
  *[_type == "infographic" && _id == $id][0] {
    _id,
    "availableLanguages": array::unique([
      ...title[].language,
      ...image[].language,
      ...description[].language
    ]),
    "hasLanguage": count(title[language == $language]) > 0
  }
`);

// ===== QUERY EXECUTION FUNCTIONS =====

export async function getInfographicById(id: string, language: string = "en") {
  return client.fetch(infographicByIdQuery, { id, language }, DEFAULT_OPTIONS);
}

export async function getInfographicsByIds(
  ids: string[],
  language: string = "en",
) {
  return client.fetch(
    infographicsByIdsQuery,
    { ids, language },
    DEFAULT_OPTIONS,
  );
}

export async function checkInfographicLanguageAvailability(
  id: string,
  language: string,
) {
  return client.fetch(
    infographicLanguageAvailabilityQuery,
    { id, language },
    DEFAULT_OPTIONS,
  );
}

// Helper function to get fallback filename if custom one isn't provided
export function generateFallbackFilename(
  title: string,
  language: string,
): string {
  if (!title) return `infographic-${language}`;

  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50) + `-${language}`
  );
}

// Helper function to validate language availability
export async function validateInfographicLanguage(
  id: string,
  language: string,
): Promise<boolean> {
  const availability = await checkInfographicLanguageAvailability(id, language);
  return availability?.hasLanguage || false;
}
