import type { BlogListingPostsQueryResult } from "@/infrastructure/sanity/types/sanity.types";
import type { DisplayPost } from "@/components/blog/presenter-models/DisplayPost";

/**
 * Maps a single blog listing post from Sanity query result to DisplayPost model.
 *
 * This mapper handles the transformation of the optimized listing query result
 * (which includes dereferenced author and categories) into the DisplayPost shape
 * expected by UI components.
 *
 * @param post - A single post from BlogListingPostsQueryResult
 * @returns DisplayPost model ready for presentation
 * @throws Error if required fields are missing
 */
function mapBlogListingPostToDisplayPost(
  post: BlogListingPostsQueryResult[0]
): DisplayPost {
  // Validate required fields
  if (!post.slug) {
    throw new Error(`Post slug is required for blog listing post: ${post._id}`);
  }

  if (!post.author) {
    throw new Error(
      `Author is required for blog listing post: ${post.slug}`
    );
  }

  if (!post.author.slug) {
    throw new Error(
      `Author slug is required for blog listing post: ${post.slug}`
    );
  }

  // Use published date or fallback to current date
  const publishedAt = post.publishedAt || new Date().toISOString();

  // Format reading time
  const readingTime =
    typeof post.readingTime === "number"
      ? `${post.readingTime} min read`
      : "Quick read";

  // Map categories, filtering out any malformed entries
  const categories = Array.isArray(post.categories)
    ? post.categories
        .filter((cat) => cat && cat._id && cat.title && cat.slug)
        .map((cat) => ({
          _id: cat._id,
          title: typeof cat.title === "string" ? cat.title : String(cat.title),
          slug: cat.slug!,
        }))
    : [];

  // Map tags
  const tags = Array.isArray(post.tags) ? post.tags : [];

  return {
    _id: post._id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    content: [], // Listing doesn't include full content
    coverImageUrl: post.coverImage?.asset?.url || null,
    coverImageAlt:
      post.coverImageAlt || post.coverImage?.alt || post.title,
    author: {
      _id: post.author._id,
      name: post.author.name,
      slug: post.author.slug,
    },
    categories,
    tags,
    publishedAt,
    formattedDate: new Date(publishedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    readingTime,
    featured: Boolean(post.featured),
    featuredCategory: Boolean(post.featuredCategory),
    references: undefined, // Listing doesn't include references
  };
}

/**
 * Maps an array of blog listing posts to DisplayPost models.
 *
 * @param posts - Array of posts from BlogListingPostsQueryResult
 * @returns Array of DisplayPost models
 */
export function mapBlogListingPostsToDisplayPosts(
  posts: BlogListingPostsQueryResult
): DisplayPost[] {
  return posts.map(mapBlogListingPostToDisplayPost);
}
