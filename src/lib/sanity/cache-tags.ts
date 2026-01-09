/**
 * Helpers for generating Next.js cache tags for Sanity-powered data.
 *
 * These tags are intended to be used with:
 *   client.fetch(query, params, { next: { tags: [...] } })
 *
 * And invalidated on-demand via:
 *   revalidateTag('sanity', 'max')
 *   revalidateTag(`sanity:type:${_type}`, 'max')
 *   revalidateTag(`sanity:id:${_id}`, 'max')
 */

export type SanityDocRef = {
  _id?: string;
  _type?: string;
};

/**
 * Global tag for "anything Sanity".
 * Useful as a broad fallback if you want to invalidate all Sanity data.
 */
export const SANITY_GLOBAL_TAG = "sanity";

/**
 * Builds stable cache tags for a specific Sanity document and/or document type.
 *
 * - Always includes "sanity"
 * - Includes `sanity:type:<type>` if type is provided
 * - Includes `sanity:id:<id>` if id is provided
 */
export function sanityTagsForDoc(ref?: SanityDocRef | null): string[] {
  const tags: string[] = [SANITY_GLOBAL_TAG];

  const type = ref?._type?.trim();
  const id = ref?._id?.trim();

  if (type) tags.push(`sanity:type:${type}`);
  if (id) tags.push(`sanity:id:${id}`);

  return unique(tags);
}

/**
 * Builds tags for a "collection" style query (eg all posts, all categories).
 * Prefer using both:
 * - a collection tag (easy broad invalidation)
 * - plus type/id tags when fetching specific documents
 */
export function sanityCollectionTags(collection: string): string[] {
  const c = (collection || "").trim();
  if (!c) return [SANITY_GLOBAL_TAG];
  return unique([SANITY_GLOBAL_TAG, `sanity:collection:${c}`]);
}

/**
 * Convenience for adding locale-specific tags when you want to invalidate per-locale.
 * (Optional; only use if it maps to how your content is modeled.)
 */
export function withLocaleTags(tags: string[], locale?: string | null): string[] {
  const l = (locale || "").trim();
  if (!l) return unique(tags);
  return unique([...tags, `sanity:locale:${l}`]);
}

function unique(tags: string[]): string[] {
  return Array.from(new Set(tags.filter(Boolean)));
}
