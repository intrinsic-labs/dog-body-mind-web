import { defineQuery } from "groq";
import { client } from "@/infrastructure/sanity/client";
import { sanityTagsForDoc } from "@/infrastructure/sanity/cache-tags";

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
    blogCta {
      heading,
      subheading,
      buttonText
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
  const tags = sanityTagsForDoc({ _type: "siteSettings", _id: "siteSettings" });

  return client.fetch(
    siteSettingsQuery,
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
