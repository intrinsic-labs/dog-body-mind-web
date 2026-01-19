"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DisplayPost } from '@/components/blog/presenter-models/DisplayPost';
import { Locale } from "@domain/locale";
import CategoryFilter from "./CategoryFilter";
import { HiOutlineSearch } from "react-icons/hi";
import { toDisplayPost } from "./listing/searchPostMapper";
import {
  buildCategoryRows,
  type ListingCategory,
} from "./listing/categoryRowsBuilder";
import CategoryRowsComponent from "./listing/CategoryRows";
import SearchResultsGrid from "./listing/SearchResultsGrid";

interface FilterableBlogListProps {
  posts: DisplayPost[];
  categories: ListingCategory[];
  currentLocale: Locale;
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

  // Build category rows for carousel view.
  const carouselRows = useMemo(() => {
    const filteredPosts = selectedCategory
      ? posts.filter((post) =>
          post.categories.some((cat) => cat._id === selectedCategory),
        )
      : posts;

    return buildCategoryRows(filteredPosts, categories, {
      sortByMostPosts: true,
      uncategorizedTitle: "More",
      appendUncategorizedRow: true,
    });
  }, [posts, categories, selectedCategory]);

  const postsToRender = isSearchMode ? searchResults || [] : posts;

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

      {/* Search mode: show simple grid */}
      {isSearchMode ? (
        <SearchResultsGrid
          posts={postsToRender}
          currentLocale={currentLocale}
          isSearching={isSearching}
          query={urlQuery}
        />
      ) : (
        <CategoryRowsComponent
          rows={carouselRows}
          currentLocale={currentLocale}
          headerOffsetPx={64}
        />
      )}
    </section>
  );
}
