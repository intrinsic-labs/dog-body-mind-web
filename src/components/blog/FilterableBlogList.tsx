"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DisplayPost } from "@/lib/blog-types";
import { Locale } from "@/lib/locale";
import { NewsletterContent } from "@/lib/site-settings-utils";
import CategoryFilter from "./CategoryFilter";
import BlogCard from "./BlogCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import { HiOutlineSearch } from "react-icons/hi";

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

type SearchApiPost = {
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
  const s = asString(value, "");
  return s;
}

function toDisplayPost(post: SearchApiPost): DisplayPost {
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

function updateSearchParams(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  updates: Record<string, string | null>,
) {
  const next = new URLSearchParams(searchParams.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  }
  const qs = next.toString();
  router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
}

export default function FilterableBlogList({
  posts,
  categories,
  currentLocale,
  newsletterContent,
}: FilterableBlogListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = (searchParams.get("q") || "").trim();
  const urlCategoryId = (searchParams.get("category") || "").trim();

  const [searchInput, setSearchInput] = useState<string>(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    urlCategoryId || null,
  );

  const [searchResults, setSearchResults] = useState<DisplayPost[] | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);

  const isSearchMode = urlQuery.length > 0;

  // Keep local input in sync when navigating back/forward or external changes.
  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  // Keep category state in sync with the URL.
  useEffect(() => {
    setSelectedCategory(urlCategoryId || null);
  }, [urlCategoryId]);

  // Debounced URL updates for search input.
  useEffect(() => {
    const handle = setTimeout(() => {
      const nextQ = searchInput.trim();
      if (nextQ === urlQuery) return;
      updateSearchParams(router, pathname, searchParams, { q: nextQ || null });
    }, 250);

    return () => clearTimeout(handle);
  }, [searchInput, urlQuery, router, pathname, searchParams]);

  // Fetch search results when q/category changes.
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!isSearchMode) {
        setSearchResults(null);
        setIsSearching(false);
        return;
      }

      if (urlQuery.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const sp = new URLSearchParams();
        sp.set("q", urlQuery);
        sp.set("locale", currentLocale);
        if (selectedCategory) sp.set("categoryId", selectedCategory);

        const res = await fetch(`/api/blog/search?${sp.toString()}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          if (cancelled) return;
          setSearchResults([]);
          return;
        }

        const json = await res.json();
        const mapped: DisplayPost[] = Array.isArray(json?.results)
          ? json.results.map(toDisplayPost)
          : [];

        if (!cancelled) setSearchResults(mapped);
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [isSearchMode, urlQuery, selectedCategory, currentLocale]);

  // When not searching, use the original category-filtered list.
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    if (selectedCategory) {
      filtered = posts.filter((post) =>
        post.categories.some((cat) => cat._id === selectedCategory),
      );
    }

    return filtered.sort((a, b) => {
      if (selectedCategory) {
        if (a.featuredCategory && !b.featuredCategory) return -1;
        if (!a.featuredCategory && b.featuredCategory) return 1;
      }
      return 0;
    });
  }, [posts, selectedCategory]);

  const postsToRender = isSearchMode ? searchResults || [] : filteredPosts;

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
      {/* Search + Category Filter Toolbar */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
          <div className="flex-1">
            <label className="sr-only" htmlFor="blog-search">
              Search blog posts
            </label>

            <div className="relative">
              <HiOutlineSearch
                className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/50"
                aria-hidden="true"
              />
              <input
                id="blog-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search articles..."
                className="w-full rounded-full border-2 border-foreground/10 bg-white/70 py-3 pl-12 pr-6 text-foreground placeholder:text-foreground/50 transition hover:border-blue/30 focus:border-blue/40 focus:outline-none focus:ring-2 focus:ring-blue/30"
              />
            </div>

            <div className="mt-2 text-sm text-foreground/60">
              {isSearching
                ? "Searching…"
                : isSearchMode
                  ? `${postsToRender.length} result(s)`
                  : null}
            </div>
          </div>

          <div className="w-full md:w-72">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={(next) => {
                const nextVal = next || null;
                setSelectedCategory(nextVal);
                updateSearchParams(router, pathname, searchParams, {
                  category: nextVal,
                });
              }}
            />
          </div>
        </div>
      </div>

      {/* Search mode: hide featured layout and show a regular grid */}
      {isSearchMode ? (
        <>
          {postsToRender.length === 0 && !isSearching ? (
            <div className="text-center py-16">
              <p className="text-foreground/60 text-lg">
                No posts found{urlQuery ? ` for “${urlQuery}”` : ""}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {postsToRender.map((post) => (
                <BlogCard
                  key={post._id}
                  post={post}
                  currentLocale={currentLocale}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Find featured post (always from full list, not filtered) */}
          {(() => {
            const featuredPost =
              posts.find((post) => post.featured) || posts[0];
            const remainingPosts = filteredPosts.filter(
              (post) => post._id !== featuredPost._id,
            );

            return (
              <>
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
                  {remainingPosts.slice(0, 2).map((post) => (
                    <BlogCard
                      key={post._id}
                      post={post}
                      currentLocale={currentLocale}
                      variant="compact"
                    />
                  ))}
                </div>

                {/* Newsletter Signup */}
                {/*{newsletterContent && (
                  <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen mb-8">
                    <NewsletterSignup content={newsletterContent} />
                  </div>
                )}*/}

                {/* Next 2 Posts */}
                {remainingPosts.length > 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {remainingPosts.slice(2, 4).map((post) => (
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
                    {remainingPosts.slice(4).map((post) => (
                      <BlogCard
                        key={post._id}
                        post={post}
                        currentLocale={currentLocale}
                      />
                    ))}
                  </div>
                )}

                {/* Newsletter Signup - Full Width (Bottom) */}
                {/*{newsletterContent && (
                  <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
                    <NewsletterSignup content={newsletterContent} />
                  </div>
                )}*/}
              </>
            );
          })()}
        </>
      )}
    </section>
  );
}
