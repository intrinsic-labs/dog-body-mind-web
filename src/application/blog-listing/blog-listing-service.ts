import { Locale } from "@/domain/locale";
import { getBlogListingPosts } from "@/infrastructure/sanity/queries/post-queries";
import { getAllCategories } from "@/infrastructure/sanity/queries/category-queries";
import { getBlogPageContent } from "@/application/site-settings/site-settings-utils";
import { mapBlogListingPostsToDisplayPosts } from "./blog-listing-mapper";
import type { DisplayPost } from "@/components/blog/presenter-models/DisplayPost";

/**
 * Category data shape for the blog listing page
 */
export interface BlogListingCategory {
  _id: string;
  title: string;
  slug: string;
}

/**
 * Complete data needed to render the blog listing page
 */
export interface BlogListingData {
  displayPosts: DisplayPost[];
  categories: BlogListingCategory[];
  blogPageContent: {
    title: string;
    subtitle: string;
  } | null;
}

/**
 * Fetches and prepares all data needed for the blog listing page.
 *
 * This service orchestrates multiple data fetching operations:
 * - Blog posts optimized for listing (with dereferenced author/categories)
 * - All available categories for filtering
 * - Blog page content settings
 *
 * All data fetching happens at build time on the server.
 *
 * @param locale - The current locale for internationalized content
 * @returns Complete blog listing page data
 * @throws Error if data fetching fails or required data is missing
 */
export async function loadBlogListingData(
  locale: Locale,
): Promise<BlogListingData> {
  // Fetch all required data in parallel for optimal performance
  const [posts, allCategories, blogPageContent] = await Promise.all([
    getBlogListingPosts(locale),
    getAllCategories(locale),
    getBlogPageContent(locale),
  ]);

  // Transform Sanity query results to DisplayPost models
  const displayPosts = mapBlogListingPostsToDisplayPosts(posts);

  // Transform categories to a simpler shape for the UI
  // Filter out any malformed category entries
  const categories: BlogListingCategory[] = allCategories
    .filter((cat) => {
      if (!cat || typeof cat !== "object") return false;
      return Boolean(cat.title && cat.slug);
    })
    .map((cat) => {
      let slugString: string;

      if (!cat.slug) {
        // Should not happen due to filter, but TypeScript needs this
        slugString = "";
      } else if (typeof cat.slug === "object" && "current" in cat.slug) {
        slugString = (cat.slug as { current: string }).current;
      } else {
        slugString = String(cat.slug);
      }

      return {
        _id: cat._id,
        title: cat.title as string,
        slug: slugString,
      };
    });

  return {
    displayPosts,
    categories,
    blogPageContent,
  };
}
