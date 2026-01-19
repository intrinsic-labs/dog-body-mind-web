import { Metadata } from "next";
import React, { Suspense } from "react";

import { Locale } from "@/domain/locale";
import {
  loadBlogListingData,
  generateBlogListingMetadata,
} from "@/application/blog-listing";
import FilterableBlogList from "@/components/blog/FilterableBlogList";

/**
 * Generate metadata for the blog listing page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateBlogListingMetadata(locale);
}

/**
 * Blog listing page component
 *
 * Displays all blog posts with filtering capabilities by category.
 * All data fetching is delegated to the application layer for clean separation of concerns.
 */
export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  // Load all blog listing data from the application layer
  const { displayPosts, categories, blogPageContent } =
    await loadBlogListingData(locale);

  return (
    <main>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title and Subtitle */}
        {blogPageContent && (
          <div className="mb-8 max-w-3xl">
            <h1 className="text-left mb-3">{blogPageContent.title}</h1>
            <p className="text-left text-xl text-foreground/70">
              {blogPageContent.subtitle}
            </p>
          </div>
        )}

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
