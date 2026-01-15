"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DisplayPost } from "@/lib/blog-types";
import { Locale } from "@/lib/locale";
import CategoryFilter from "./CategoryFilter";
import TinifyImage from "@/components/TinifyImage";

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

type CarouselCategoryRow = {
  key: string;
  title: string;
  categoryId: string | null;
  posts: DisplayPost[];
};

function BlogCarouselCard({
  post,
  currentLocale,
}: {
  post: DisplayPost;
  currentLocale: Locale;
}) {
  const postUrl = `/${currentLocale}/blog/${post.slug}`;

  return (
    <article className="relative snap-start shrink-0 w-[220px] sm:w-[240px] md:w-[260px] group focus-within:w-[520px] hover:w-[520px] transition-[width] duration-300 ease-out">
      <Link
        href={postUrl}
        className="block h-[320px] sm:h-[340px] md:h-[360px] rounded-xl bg-white border border-foreground/10 overflow-hidden shadow-sm hover:border-blue/30 focus:outline-none focus:ring-2 focus:ring-blue/30"
      >
        <div className="h-full w-full grid grid-rows-[1fr_auto]">
          <div className="relative overflow-hidden bg-foreground/5">
            {post.coverImageUrl ? (
              <TinifyImage
                src={post.coverImageUrl}
                alt={post.coverImageAlt}
                width={900}
                height={900}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full" />
            )}

            {/* Hover overlay with excerpt/meta */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-blue/95 via-blue/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="hidden group-hover:block group-focus-within:block">
                  <p className="text-white/90 text-sm leading-snug line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
                    <span>{post.formattedDate}</span>
                    <span>•</span>
                    <span>{post.readingTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-base sm:text-[15px] font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-blue transition-colors">
              {post.title}
            </h3>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function FilterableBlogList({
  posts,
  categories,
  currentLocale,
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

  // When set, that category row expands into a full responsive grid (and pushes content down).
  // NOTE: This is intentionally independent from `selectedCategory` so you can expand one row
  // while still seeing other category rows below it.
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    null,
  );

  const isSearchMode = urlQuery.length > 0;

  // Keep local input in sync when navigating back/forward or external changes.
  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  // Keep category state in sync with the URL.
  useEffect(() => {
    setSelectedCategory(urlCategoryId || null);
  }, [urlCategoryId]);

  // Expansion is a purely-UI affordance. Don't automatically mirror the URL filter into it,
  // otherwise selecting a category would hide all other rows.
  useEffect(() => {
    // If the user clears the category filter, also clear any expanded row.
    if (!urlCategoryId) setExpandedCategoryId(null);
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

  const postsToRender = isSearchMode ? searchResults || [] : posts;

  const carouselRows: CarouselCategoryRow[] = useMemo(() => {
    const byCategoryId = new Map<string, DisplayPost[]>();

    for (const p of posts) {
      for (const c of p.categories) {
        if (!c?._id) continue;
        const list = byCategoryId.get(c._id) || [];
        list.push(p);
        byCategoryId.set(c._id, list);
      }
    }

    const rows: CarouselCategoryRow[] = [];

    // If a category filter is selected, still show all rows,
    // but prioritize that category first and filter each row's posts to the selected category.
    // (Net effect: you still see the other category headers/sections, but only the selected
    // category will have posts; others will be empty and get skipped below.)
    if (selectedCategory) {
      const selectedCat = categories.find((c) => c._id === selectedCategory);
      const selectedList = (byCategoryId.get(selectedCategory) || [])
        .slice()
        .sort((a, b) => {
          if (a.featuredCategory && !b.featuredCategory) return -1;
          if (!a.featuredCategory && b.featuredCategory) return 1;
          return 0;
        });

      if (selectedCat && selectedList.length > 0) {
        rows.push({
          key: selectedCat._id,
          title: selectedCat.title,
          categoryId: selectedCat._id,
          posts: selectedList,
        });
      }

      // Continue building the rest of the rows as normal (most-posts-first),
      // but we'll skip empty rows below.
    }

    // Build rows, sorted by "most posts first". If a category is selected, that category
    // will already have been unshifted above (and we skip duplicates here).
    const categoriesWithCounts = categories
      .map((cat) => ({
        cat,
        count: (byCategoryId.get(cat._id) || []).length,
      }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count);

    for (const { cat } of categoriesWithCounts) {
      if (selectedCategory && cat._id === selectedCategory) continue;

      const list = (byCategoryId.get(cat._id) || []).slice();
      if (list.length === 0) continue;

      list.sort((a, b) => {
        if (a.featuredCategory && !b.featuredCategory) return -1;
        if (!a.featuredCategory && b.featuredCategory) return 1;
        return 0;
      });

      rows.push({
        key: cat._id,
        title: cat.title,
        categoryId: cat._id,
        posts: list,
      });
    }

    // Catch-all row for posts without categories
    const uncategorized = posts.filter(
      (p) => (p.categories || []).length === 0,
    );
    if (uncategorized.length > 0) {
      rows.push({
        key: "uncategorized",
        title: "More",
        categoryId: null,
        posts: uncategorized,
      });
    }

    return rows;
  }, [posts, categories, selectedCategory]);

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

      {/* Search mode: show simple grid (don’t group into carousels) */}
      {isSearchMode ? (
        <>
          {postsToRender.length === 0 && !isSearching ? (
            <div className="text-center py-16">
              <p className="text-foreground/60 text-lg">
                No posts found{urlQuery ? ` for “${urlQuery}”` : ""}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {postsToRender.map((post) => (
                <article key={post._id} className="group">
                  <Link
                    href={`/${currentLocale}/blog/${post.slug}`}
                    className="block rounded-xl bg-white border border-foreground/10 overflow-hidden shadow-sm hover:border-blue/30 focus:outline-none focus:ring-2 focus:ring-blue/30"
                  >
                    {post.coverImageUrl && (
                      <div className="aspect-[16/10] overflow-hidden bg-foreground/5">
                        <TinifyImage
                          src={post.coverImageUrl}
                          alt={post.coverImageAlt}
                          width={700}
                          height={450}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold leading-snug line-clamp-2 group-hover:text-blue transition-colors">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm text-foreground/70 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-foreground/60">
                        <span>{post.formattedDate}</span>
                        <span>•</span>
                        <span>{post.readingTime}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-10">
          {carouselRows.map((row) => {
            // Allow expansion for both categorized rows (categoryId) and the uncategorized row (null).
            // For uncategorized, we key expansion off the row.key.
            const expansionKey = row.categoryId ?? row.key;
            const isExpandable =
              row.categoryId !== null || row.key === "uncategorized";
            const isExpanded =
              isExpandable && expandedCategoryId === expansionKey;

            return (
              <section key={row.key}>
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <h2 className="text-xl font-semibold">{row.title}</h2>

                  {isExpandable && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextExpanded = isExpanded ? null : expansionKey;

                        // Expand/collapse is purely visual; do NOT set the category filter,
                        // otherwise we'd hide all other category rows.
                        setExpandedCategoryId(nextExpanded);
                      }}
                      className="text-sm text-blue hover:underline"
                    >
                      {isExpanded ? "Collapse" : "See all"}
                    </button>
                  )}
                </div>

                {isExpanded ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {row.posts.map((post) => (
                      <article key={post._id} className="group">
                        <Link
                          href={`/${currentLocale}/blog/${post.slug}`}
                          className="block rounded-xl bg-white border border-foreground/10 overflow-hidden shadow-sm hover:border-blue/30 focus:outline-none focus:ring-2 focus:ring-blue/30"
                        >
                          {post.coverImageUrl && (
                            <div className="aspect-[16/10] overflow-hidden bg-foreground/5">
                              <TinifyImage
                                src={post.coverImageUrl}
                                alt={post.coverImageAlt}
                                width={700}
                                height={450}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="text-lg font-semibold leading-snug line-clamp-2 group-hover:text-blue transition-colors">
                              {post.title}
                            </h3>
                            <p className="mt-2 text-sm text-foreground/70 line-clamp-2">
                              {post.excerpt}
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-foreground/60">
                              <span>{post.formattedDate}</span>
                              <span>•</span>
                              <span>{post.readingTime}</span>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory [scrollbar-width:thin]">
                      {row.posts.map((post) => (
                        <BlogCarouselCard
                          key={post._id}
                          post={post}
                          currentLocale={currentLocale}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}

          {/* Newsletter Signup (kept disabled as before) */}
          {/*{newsletterContent && (
            <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
              <NewsletterSignup content={newsletterContent} />
            </div>
          )}*/}
        </div>
      )}
    </section>
  );
}
