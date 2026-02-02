import { defineQuery } from "groq";
import { client } from "@/infrastructure/sanity/client";
import {
  sanityTagsForDoc,
  withLocaleTags,
} from "@/infrastructure/sanity/cache-tags";

// Default query options for caching
const DEFAULT_OPTIONS = { next: { revalidate: 3600 } }; // Cache for 1 hour

// Get about page by language (document-level internationalization)
export const aboutPageQuery = defineQuery(`
  *[_type == "aboutPage" && language == $language][0] {
    _id,
    _type,
    title,
    subtitle,
    content,
    metaTitle,
    metaDescription,
    language
  }
`);

export async function getAboutPage(language: string) {
  const tags = withLocaleTags(
    sanityTagsForDoc({ _type: "aboutPage" }),
    language ?? null,
  );

  return client.fetch(
    aboutPageQuery,
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
