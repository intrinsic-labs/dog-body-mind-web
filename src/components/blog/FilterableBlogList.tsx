'use client';

import { useState, useMemo } from 'react';
import { DisplayPost } from '@/lib/blog-types';
import { Locale } from '@/lib/locale';
import { NewsletterContent } from '@/lib/site-settings-utils';
import CategoryFilter from './CategoryFilter';
import BlogCard from './BlogCard';
import NewsletterSignup from '@/components/NewsletterSignup';

interface Category {
  _id: string;
  title: string;
  slug: string;
}

interface FilterableBlogListProps {
  posts: DisplayPost[];
  categories: Category[];
  currentLocale: Locale;
  newsletterContent?: NewsletterContent | null;
}

export default function FilterableBlogList({
  posts,
  categories,
  currentLocale,
  newsletterContent
}: FilterableBlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter and sort posts based on selected category
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by category if one is selected
    if (selectedCategory) {
      filtered = posts.filter(post =>
        post.categories.some(cat => cat._id === selectedCategory)
      );
    }

    // Sort: featuredCategory posts first within the selected category
    return filtered.sort((a, b) => {
      // If filtering by category, prioritize featuredCategory posts
      if (selectedCategory) {
        if (a.featuredCategory && !b.featuredCategory) return -1;
        if (!a.featuredCategory && b.featuredCategory) return 1;
      }
      // Otherwise maintain original order (by publishedAt from query)
      return 0;
    });
  }, [posts, selectedCategory]);

  // Find featured post (always from full list, not filtered)
  const featuredPost = posts.find(post => post.featured) || posts[0];
  const remainingPosts = filteredPosts.filter(post => post._id !== featuredPost._id);

  if (posts.length === 0) {
    return (
      <section>
        <div className="text-center py-16">
          <p className="text-foreground/60 text-lg">No posts found.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Featured + First 2 Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Featured Post - Large on left, full width on mobile */}
        <div className="lg:row-span-2">
          <BlogCard
            key={featuredPost._id}
            post={featuredPost}
            currentLocale={currentLocale}
            variant="featured"
          />
        </div>

        {/* First 2 compact posts - Right side */}
        {remainingPosts.slice(0, 2).map(post => (
          <BlogCard
            key={post._id}
            post={post}
            currentLocale={currentLocale}
            variant="compact"
          />
        ))}
      </div>

      {/* Newsletter Signup */}
      {newsletterContent && (
        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen mb-8">
          <NewsletterSignup content={newsletterContent} />
        </div>
      )}

      {/* Next 2 Posts */}
      {remainingPosts.length > 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {remainingPosts.slice(2, 4).map(post => (
            <BlogCard
              key={post._id}
              post={post}
              currentLocale={currentLocale}
              variant="compact"
            />
          ))}
        </div>
      )}

      {/* Additional Posts - Regular Grid */}
      {remainingPosts.length > 4 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {remainingPosts.slice(4).map(post => (
            <BlogCard
              key={post._id}
              post={post}
              currentLocale={currentLocale}
            />
          ))}
        </div>
      )}

      {/* Newsletter Signup - Full Width (Bottom) */}
      {newsletterContent && (
        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
          <NewsletterSignup content={newsletterContent} />
        </div>
      )}
    </section>
  );
}
