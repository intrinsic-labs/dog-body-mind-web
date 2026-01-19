import { Metadata } from "next";
import React, { Suspense } from "react";

import { DataManager } from "@/application/data-manager";
import { generateArticleListingMetadata } from "@presentation/metadata/article-metadata";
import FilterableBlogList from "@/components/blog/FilterableBlogList";
import { DisplayPost } from "@/components/blog/presenter-models/DisplayPost";
import { Locale } from "@/domain/locale";
import {
  getBlogPageContent,
} from "@/application/site-settings/site-settings-utils";
import { getAllCategories } from "@/infrastructure/sanity/queries/category-queries";
import { getBlogListingPosts } from "@/infrastructure/sanity/queries/post-queries";

type CategoryLike = {
  _id?: unknown;
  title?: unknown;
  slug?: unknown;
};

type ListingAuthor = { _id: string; name: string; slug?: string };
type ListingCategory = { _id: string; title: string; slug?: string };
type ListingPost = {
  _id: string;
  title: string;
  slug?: string;
  excerpt?: string | null;
  coverImage?: {
    asset?: { url?: string | null } | null;
    alt?: string | null;
  } | null;
  coverImageAlt?: string | null;
  author?: ListingAuthor | null;
  categories?: ListingCategory[] | null;
  tags?: string[] | null;
  publishedAt?: string | null;
  readingTime?: number | null;
  featured?: boolean | null;
  featuredCategory?: boolean | null;
};

async function loadBlogPageData(locale: Locale) {
  // All data fetching happens at build time / server
  // NOTE: We still use DataManager for organization + shared initialization work,
  // but we avoid N+1 post fetching on the listing page.
  const dataManager = new DataManager(locale);
  await dataManager.initialize();

  // Fetch listing-ready posts in a single query (author/categories already dereferenced)
  const posts = (await getBlogListingPosts(locale)) as unknown as ListingPost[];

  // Adapt listing results into the existing DisplayPost shape expected by UI components.
  // We intentionally do NOT fetch full post bodies here.
  const displayPosts: DisplayPost[] = posts.map((post: ListingPost) => {
    const slugCurrent = post.slug;

    if (!slugCurrent) {
      throw new Error("Post slug is required for blog listing");
    }

    const author = post.author;
    if (!author) {
      throw new Error(
        `Author is required for blog listing post: ${slugCurrent}`,
      );
    }

    const authorSlug = author.slug;
    if (!authorSlug) {
      throw new Error(
        `Author slug is required for blog listing post: ${slugCurrent}`,
      );
    }

    const publishedAt = post.publishedAt || new Date().toISOString();

    return {
      _id: post._id,
      title: post.title,
      slug: slugCurrent,
      excerpt: post.excerpt || "",
      content: [],
      coverImageUrl: post.coverImage?.asset?.url || null,
      coverImageAlt: post.coverImageAlt || post.coverImage?.alt || "",
      author: {
        _id: author._id,
        name: author.name,
        slug: authorSlug,
      },
      categories: Array.isArray(post.categories)
        ? post.categories
            .filter((c) => c && c._id && c.title && c.slug)
            .map((c) => ({
              _id: c._id,
              title: c.title,
              slug: c.slug!,
            }))
        : [],
      tags: Array.isArray(post.tags) ? post.tags : [],
      publishedAt,
      formattedDate: new Date(publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      readingTime:
        typeof post.readingTime === "number"
          ? `${post.readingTime} min read`
          : "Quick read",
      featured: Boolean(post.featured),
      featuredCategory: Boolean(post.featuredCategory),
      references: undefined,
    };
  });

  const blogPageContent = await getBlogPageContent(locale);
  const allCategories = await getAllCategories(locale);

  const categories = allCategories
    .filter((cat: unknown): cat is CategoryLike => {
      if (!cat || typeof cat !== "object") return false;
      const c = cat as CategoryLike;

      return (
        typeof c.title === "string" &&
        !!c.slug &&
        typeof c.slug === "object" &&
        typeof (c.slug as { current?: unknown }).current === "string"
      );
    })
    .map((cat: CategoryLike) => ({
      _id: cat._id as string,
      title: cat.title as string,
      slug: (cat.slug as { current: string }).current,
    }));

  return {
    displayPosts,
    categories,
    blogPageContent,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;

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
      locale,
    );
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blog | Dog Body Mind",
      description:
        "Latest articles and insights about dog health, behavior, and well-being.",
    };
  }
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  // Do not construct JSX inside try/catch. Keep error handling in the data layer.
  const { displayPosts, categories, blogPageContent } =
    await loadBlogPageData(locale);

  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title and Subtitle */}
        {blogPageContent && (
          <div className="mb-8 max-w-3xl">
            <h1 className="text-left mb-3">{blogPageContent.title}</h1>
            <p className="text-left text-xl text-foreground/70">
              {blogPageContent.subtitle}
            </p>
          </div>
        )}

        {/* Newsletter Signup - Above the Fold */}
        {/*{newsletterContent && (
          <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen mb-12">
            <NewsletterSignup content={newsletterContent} variant="compact" />
          </div>
        )}*/}

        <Suspense
          fallback={
            <section>
              <div className="text-center py-16">
                <p className="text-foreground/60 text-lg">Loading…</p>
              </div>
            </section>
          }
        >
          <FilterableBlogList
            posts={displayPosts}
            categories={categories}
            currentLocale={locale}
          />
        </Suspense>
      </div>
    </main>
  );
}
