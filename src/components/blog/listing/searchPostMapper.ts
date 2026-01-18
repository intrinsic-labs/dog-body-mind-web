import { DisplayPost } from "@/lib/blog-types";

export type SearchApiPost = {
  _id: string;
  title: unknown;
  slug: { current?: unknown } | string;
  excerpt: unknown;
  coverImage?: { asset?: { url?: unknown }; alt?: unknown } | null;
  coverImageAlt?: unknown;
  author?: {
    _id: unknown;
    name: unknown;
    slug?: { current?: unknown } | string;
  } | null;
  categories?: Array<{
    _id: unknown;
    title?: unknown;
    slug?: { current?: unknown } | string;
  }> | null;
  tags?: unknown;
  publishedAt: unknown;
  readingTime?: unknown;
  featured?: unknown;
  featuredCategory?: unknown;
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toSlugString(
  value: { current?: unknown } | string | undefined | null,
): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return asString(value.current, "");
  return "";
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.map((t) => asString(t, "")).filter((t) => t.length > 0);
}

function normalizeTitleOrExcerpt(value: unknown): string {
  // Prevent React from trying to render objects like {_key,_type,value}
  return typeof value === "string" ? value : "";
}

function safeDateString(value: unknown): string {
  return asString(value, "");
}

export function toDisplayPost(post: SearchApiPost): DisplayPost {
  const slug = toSlugString(post.slug);

  const authorId = asString(post.author?._id, "");
  const authorName = asString(post.author?.name, "");
  const authorSlug = toSlugString(post.author?.slug);

  const publishedAt = safeDateString(post.publishedAt);

  const coverImageUrl = asString(post.coverImage?.asset?.url, "");
  const coverImageAlt =
    asString(post.coverImageAlt, "") || asString(post.coverImage?.alt, "");

  const categories = Array.isArray(post.categories)
    ? post.categories
        .filter((c) => c && typeof c === "object")
        .map((c) => {
          const id = asString(c._id, "");
          const title = asString(c.title, "Untitled Category");
          const slug = toSlugString(c.slug);
          return { _id: id, title, slug };
        })
        .filter((c) => c._id)
    : [];

  const readingTimeNumber =
    typeof post.readingTime === "number" && Number.isFinite(post.readingTime)
      ? post.readingTime
      : null;

  return {
    _id: asString(post._id, ""),
    title: normalizeTitleOrExcerpt(post.title),
    slug,
    excerpt: normalizeTitleOrExcerpt(post.excerpt),
    content: [], // not needed for listing cards
    coverImageUrl: coverImageUrl || null,
    coverImageAlt,
    author: {
      _id: authorId,
      name: authorName,
      slug: authorSlug,
    },
    categories,
    tags: normalizeTags(post.tags),
    publishedAt,
    formattedDate: publishedAt
      ? new Date(publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "",
    readingTime: readingTimeNumber
      ? `${readingTimeNumber} min read`
      : "Quick read",
    featured: Boolean(post.featured),
    featuredCategory: Boolean(post.featuredCategory),
    references: undefined,
  };
}
