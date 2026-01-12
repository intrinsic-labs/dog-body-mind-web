import { defineQuery } from "groq";
import { client } from "@/sanity/client";
import { sanityTagsForDoc } from "@/lib/sanity/cache-tags";

// Default query options for caching
const DEFAULT_OPTIONS = { next: { revalidate: 3600 } }; // Cache for 1 hour

// Get landing page settings (singleton)
export const landingPageSettingsQuery = defineQuery(`
  *[_type == "landingPageSettings"][0] {
    _id,
    _type,
    title,
    subtitle,
    youtubeUrl
  }
`);

export async function getLandingPageSettings() {
  const tags = sanityTagsForDoc({ _type: "landingPageSettings" });

  return client.fetch(
    landingPageSettingsQuery,
    {},
    {
      ...DEFAULT_OPTIONS,
      next: {
        ...DEFAULT_OPTIONS.next,
        tags,
      },
    },
  );
}
