import { Metadata } from "next";
import { Locale } from "@/domain/locale";
import { DataManager } from "@/application/data-manager";
import { generateArticleListingMetadata } from "@/presentation/metadata/article-metadata";

/**
 * Generates metadata for the blog listing page.
 *
 * This function fetches the organization data and generates proper
 * OpenGraph, Twitter Card, and page metadata for the blog index page.
 *
 * @param locale - The current locale for internationalized content
 * @returns Next.js Metadata object
 */
export async function generateBlogListingMetadata(
  locale: Locale
): Promise<Metadata> {
  try {
    const dataManager = new DataManager(locale);
    await dataManager.initialize();
    const organization = await dataManager.getOrganization();

    if (!organization) {
      throw new Error("Missing organization data");
    }

    return generateArticleListingMetadata(
      "Blog",
      organization.description ||
        "Latest articles and insights about dog health, behavior, and well-being.",
      organization,
      locale
    );
  } catch (error) {
    console.error("Error generating blog listing metadata:", error);

    // Fallback metadata if something goes wrong
    return {
      title: "Blog | Dog Body Mind",
      description:
        "Latest articles and insights about dog health, behavior, and well-being.",
    };
  }
}
