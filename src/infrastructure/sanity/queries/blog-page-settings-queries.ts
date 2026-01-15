import { defineQuery } from "groq";
import { client } from "@/infrastructure/sanity/client";

// Default query options for caching
const DEFAULT_OPTIONS = { next: { revalidate: 3600 } }; // Cache for 1 hour

// Get blog page settings (singleton)
export const blogPageSettingsQuery = defineQuery(`
  *[_type == "blogPageSettings"][0] {
    _id,
    _type,
    title,
    subtitle
  }
`);

export async function getBlogPageSettings() {
  return client.fetch(blogPageSettingsQuery, {}, DEFAULT_OPTIONS);
}
