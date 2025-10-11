import { defineQuery } from 'groq';
import { client } from "@/sanity/client";

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
  return client.fetch(homePageSettingsQuery, {}, DEFAULT_OPTIONS);
}
