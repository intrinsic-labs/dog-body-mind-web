"use client";

import { useRef, useState } from "react";
import { Locale } from "@domain/locale";
import { CarouselCategoryRow } from "./categoryRowsBuilder";
import { ListingCarouselCard, ListingGridCard } from "./ListingCards";
import { scrollToWithOffset } from "./scrollToWithOffset";

type Props = {
  rows: CarouselCategoryRow[];
  currentLocale: Locale;
  /**
   * Fixed header height in pixels (e.g. 64 for a sticky nav).
   */
  headerOffsetPx?: number;
};

export default function CategoryRows({
  rows,
  currentLocale,
  headerOffsetPx = 64,
}: Props) {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    null,
  );

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-foreground/60 text-lg">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {rows.map((row) => {
        const expansionKey = row.categoryId ?? row.key;
        const isExpandable =
          row.categoryId !== null || row.key === "uncategorized";
        const isExpanded = isExpandable && expandedCategoryId === expansionKey;

        return (
          <section
            key={row.key}
            ref={(el) => {
              sectionRefs.current[expansionKey] = el;
            }}
          >
            <div className="flex items-baseline justify-between gap-4 mb-3">
              <h2 className="text-xl font-semibold">{row.title}</h2>

              {isExpandable && (
                <button
                  type="button"
                  onClick={() => {
                    const nextExpanded = isExpanded ? null : expansionKey;
                    setExpandedCategoryId(nextExpanded);

                    // If expanding, scroll that section into view after layout updates.
                    if (!isExpanded) {
                      requestAnimationFrame(() => {
                        scrollToWithOffset(sectionRefs.current[expansionKey], {
                          offsetPx: headerOffsetPx,
                          extraPx: 8,
                        });
                      });
                    }
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
                  <ListingGridCard
                    key={post._id}
                    post={post}
                    currentLocale={currentLocale}
                  />
                ))}
              </div>
            ) : (
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory [scrollbar-width:thin]">
                  {row.posts.map((post) => (
                    <ListingCarouselCard
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
    </div>
  );
}
