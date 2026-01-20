import { defineQuery } from "groq";
import { client } from "@/infrastructure/sanity/client";

// Default query options for caching
const DEFAULT_OPTIONS = { next: { revalidate: 3600 } }; // Cache for 1 hour

// Get blog page settings (singleton)
export const blogPageSettingsQuery = defineQuery(`
  *[_type == "blogPageSettings"][0] {
    _id,
    _type,
    "title": title[_key == $language][0].value,
    "subtitle": subtitle[_key == $language][0].value
  }
`);

export async function getBlogPageSettings(language: string) {
  return client.fetch(blogPageSettingsQuery, { language }, DEFAULT_OPTIONS);
}
