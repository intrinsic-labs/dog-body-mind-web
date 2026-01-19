import { defineQuery } from "groq";
import { client } from "@/infrastructure/sanity/client";
import {
  sanityTagsForDoc,
  withLocaleTags,
} from "@/infrastructure/sanity/cache-tags";

// Default query options for caching
const DEFAULT_OPTIONS = { next: { revalidate: 3600 } }; // Cache for 1 hour

// Get landing page settings by language (document-level internationalization)
export const landingPageSettingsQuery = defineQuery(`
  *[_type == "landingPageSettings" && language == $language][0] {
    _id,
    _type,
    title,
    subtitle,
    youtubeUrl,
    content,
    language
  }
`);

export async function getLandingPageSettings(language: string) {
  const tags = withLocaleTags(
    sanityTagsForDoc({ _type: "landingPageSettings" }),
    language ?? null,
  );

  return client.fetch(
    landingPageSettingsQuery,
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
