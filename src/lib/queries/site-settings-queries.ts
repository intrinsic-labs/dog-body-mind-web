import { defineQuery } from 'groq';
import { client } from "@/sanity/client";

// Default query options for caching
const DEFAULT_OPTIONS = { next: { revalidate: 3600 } }; // Cache for 1 hour

// Get site settings (singleton)
export const siteSettingsQuery = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    _id,
    _type,
    newsletter {
      heading,
      subheading,
      placeholder,
      buttonText,
      successMessage,
      errorMessage
    },
    socialLinks[] {
      platform,
      url,
      label
    },
    siteName,
    maintenanceMode
  }
`);

export async function getSiteSettings() {
  return client.fetch(siteSettingsQuery, {}, DEFAULT_OPTIONS);
}
