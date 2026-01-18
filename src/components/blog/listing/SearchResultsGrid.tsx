"use client";

import { DisplayPost } from "@/lib/blog-types";
import { Locale } from "@/lib/locale";
import { ListingGridCard } from "./ListingCards";

type Props = {
  posts: DisplayPost[];
  currentLocale: Locale;
  isSearching?: boolean;
  query?: string;
};

export default function SearchResultsGrid({
  posts,
  currentLocale,
  isSearching = false,
  query,
}: Props) {
  if (isSearching) {
    return (
      <div className="text-center py-16">
        <p className="text-foreground/60 text-lg">Searching…</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-foreground/60 text-lg">
          No posts found{query ? ` for “${query}”` : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {posts.map((post) => (
        <ListingGridCard
          key={post._id}
          post={post}
          currentLocale={currentLocale}
        />
      ))}
    </div>
  );
}
