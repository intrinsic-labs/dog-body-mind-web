import { Metadata } from "next";
import React, { Suspense } from "react";

import { DataManager } from "@/lib/data-manager";
import { generateArticleListingMetadata } from "@/lib/metadata/article-metadata";
import { transformPostForDisplay } from "@/lib/blog-types";
import FilterableBlogList from "@/components/blog/FilterableBlogList";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Locale } from "@/lib/locale";
import {
  getNewsletterContent,
  getBlogPageContent,
} from "@/lib/site-settings-utils";
import { getAllCategories } from "@/lib/queries/category-queries";

type CategoryLike = {
  _id?: unknown;
  title?: unknown;
  slug?: unknown;
};

async function loadBlogPageData(locale: Locale) {
  // All data fetching happens at build time / server
  const dataManager = new DataManager(locale);
  await dataManager.initialize();

  const posts = await dataManager.getAllPosts();

  const displayPosts = await Promise.all(
    posts.map(async (post) => {
      const postWithReferences = await dataManager.getPost(post.slug.current);
      return transformPostForDisplay(postWithReferences);
    }),
  );

  const newsletterContent = await getNewsletterContent(locale);
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
    newsletterContent,
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
  const { displayPosts, categories, newsletterContent, blogPageContent } =
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
            newsletterContent={newsletterContent}
          />
        </Suspense>
      </div>
    </main>
  );
}
