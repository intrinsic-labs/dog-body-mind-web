import { PostWithReferences } from "../data-manager";
import { DisplayPost } from "@/components/blog/presenter-models/DisplayPost";
import { PortableTextBlock } from "@portabletext/types";
import { Citation } from '@presentation/schema/generators/citation-schema'

/**
 * Transform DataManager PostWithReferences to DisplayPost for components
 */
export function transformPostForDisplay(
  postWithReferences: PostWithReferences,
): DisplayPost {
  const { post, author, categories } = postWithReferences;

  // Validate required data
  if (!post) {
    throw new Error("Post data is required for display transformation");
  }
  if (!author) {
    throw new Error("Author data is required for display transformation");
  }
  if (!post.slug?.current) {
    throw new Error("Post slug is required for display transformation");
  }
  if (!author.slug?.current) {
    throw new Error("Author slug is required for display transformation");
  }

  return {
    _id: post._id,
    title: post.title,
    slug: post.slug.current,
    excerpt: post.excerpt,
    content: (post.content || []) as PortableTextBlock[],
    coverImageUrl: post.coverImage?.asset?.url || null,
    coverImageAlt: post.coverImageAlt || post.coverImage?.alt || "",
    author: {
      _id: author._id,
      name: author.name,
      slug: author.slug.current,
    },
    categories: categories
      .filter((cat) => cat !== null && cat.slug !== null && cat.slug.current)
      .map((cat) => ({
        _id: cat!._id,
        title: cat!.title || "Untitled Category",
        slug: cat!.slug!.current,
      })),
    tags: post.tags || [],
    publishedAt: post.publishedAt,
    formattedDate: new Date(post.publishedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    readingTime: post.readingTime
      ? `${post.readingTime} min read`
      : "Quick read",
    featured: post.featured || false,
    featuredCategory: post.featuredCategory || false,
    references: post.references
      ? (post.references as unknown as Citation[])
      : undefined,
  };
}
