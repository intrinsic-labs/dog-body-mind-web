/**
 * Scroll an element into view, accounting for a fixed/sticky header offset.
 *
 * Typical usage:
 * - You toggle an expanded section
 * - After layout updates, call this to ensure the section isn't hidden under the header.
 */
export type ScrollToWithOffsetOptions = {
  /**
   * Fixed header offset in pixels (e.g. 16).
   */
  offsetPx: number;

  /**
   * Scroll behavior. Defaults to "smooth".
   */
  behavior?: ScrollBehavior;

  /**
   * Additional offset applied on top of `offsetPx`.
   * Useful if you want a bit of breathing room.
   */
  extraPx?: number;
};

export function scrollToWithOffset(
  el: HTMLElement | null | undefined,
  { offsetPx, behavior = "smooth", extraPx = 0 }: ScrollToWithOffsetOptions,
) {
  if (!el) return;

  // Compute element top relative to the document, then subtract the header offset.
  const rect = el.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  const targetTop = Math.max(absoluteTop - offsetPx - extraPx, 0);

  window.scrollTo({ top: targetTop, behavior });
}
