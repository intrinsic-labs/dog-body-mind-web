import { DisplayPost } from "@/lib/blog-types";

export type ListingCategory = {
  _id: string;
  title: string;
  slug: string;
};

export type CarouselCategoryRow = {
  key: string;
  title: string;
  /**
   * `categoryId` is null for the uncategorized row.
   */
  categoryId: string | null;
  posts: DisplayPost[];
};

type Options = {
  /**
   * When true, category rows are sorted by "most posts first" (descending).
   * When false, the incoming `categories` array order is used.
   */
  sortByMostPosts?: boolean;

  /**
   * Title to use for the uncategorized row, if any uncategorized posts exist.
   */
  uncategorizedTitle?: string;

  /**
   * If true, keep an uncategorized row (when needed) at the end. Default: true.
   */
  appendUncategorizedRow?: boolean;
};

function stableSortMostPostsFirst(
  cats: ListingCategory[],
  countsById: Map<string, number>,
): ListingCategory[] {
  return cats
    .map((cat, idx) => ({
      cat,
      idx,
      count: countsById.get(cat._id) ?? 0,
    }))
    .filter((x) => x.count > 0)
    .sort((a, b) => {
      // Primary: most posts first
      const byCount = b.count - a.count;
      if (byCount !== 0) return byCount;
      // Secondary: preserve incoming order
      return a.idx - b.idx;
    })
    .map((x) => x.cat);
}

export function buildCategoryRows(
  posts: DisplayPost[],
  categories: ListingCategory[],
  options: Options = {},
): CarouselCategoryRow[] {
  const {
    sortByMostPosts = true,
    uncategorizedTitle = "More",
    appendUncategorizedRow = true,
  } = options;

  const byCategoryId = new Map<string, DisplayPost[]>();
  const countsById = new Map<string, number>();

  for (const post of posts) {
    for (const cat of post.categories ?? []) {
      const id = cat?._id;
      if (!id) continue;

      const list = byCategoryId.get(id) ?? [];
      list.push(post);
      byCategoryId.set(id, list);

      countsById.set(id, (countsById.get(id) ?? 0) + 1);
    }
  }

  const orderedCategories = sortByMostPosts
    ? stableSortMostPostsFirst(categories, countsById)
    : categories;

  const rows: CarouselCategoryRow[] = [];

  for (const cat of orderedCategories) {
    const list = (byCategoryId.get(cat._id) ?? []).slice();
    if (list.length === 0) continue;

    // Keep "featuredCategory" posts first within each row.
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

  const uncategorized = posts.filter((p) => (p.categories ?? []).length === 0);
  if (appendUncategorizedRow && uncategorized.length > 0) {
    rows.push({
      key: "uncategorized",
      title: uncategorizedTitle,
      categoryId: null,
      posts: uncategorized,
    });
  }

  return rows;
}
