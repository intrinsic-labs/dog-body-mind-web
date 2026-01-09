import { defineQuery } from "groq";
import { client } from "@/sanity/client";
import { sanityTagsForDoc } from "@/lib/sanity/cache-tags";

// Default query options for caching
const DEFAULT_OPTIONS = { next: { revalidate: 3600 } }; // Cache for 1 hour

// Get home page settings (singleton)
export const homePageSettingsQuery = defineQuery(`
  *[_type == "homePageSettings"][0] {
    _id,
    _type,
    title,
    subtitle,
    youtubeUrl
  }
`);

export async function getHomePageSettings() {
  const tags = sanityTagsForDoc({ _type: "homePageSettings" });

  return client.fetch(
    homePageSettingsQuery,
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
