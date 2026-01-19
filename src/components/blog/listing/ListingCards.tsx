"use client";

import Link from "next/link";
import TinifyImage from "@/components/TinifyImage";
import { DisplayPost } from "../presenter-models/DisplayPost";
import { Locale } from "@domain/locale";

type BaseProps = {
  post: DisplayPost;
  currentLocale: Locale;
  className?: string;
};

function postUrl(currentLocale: Locale, slug: string) {
  return `/${currentLocale}/blog/${slug}`;
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Netflix-style carousel card:
 * - Collapsed: vertical-ish card with image + title
 * - Hover/focus-within: widens and reveals excerpt + meta overlay tinted with site blue
 */
export function ListingCarouselCard({
  post,
  currentLocale,
  className,
}: BaseProps) {
  return (
    <article
      className={cx(
        "relative snap-start shrink-0 w-[220px] sm:w-[240px] md:w-[260px] group",
        // Expand on hover/focus to a landscape-ish card
        "focus-within:w-[520px] hover:w-[520px] transition-[width] duration-300 ease-out",
        className,
      )}
    >
      <Link
        href={postUrl(currentLocale, post.slug)}
        className={cx(
          "block h-[320px] sm:h-[340px] md:h-[360px]",
          "rounded-xl bg-white border border-foreground/10 overflow-hidden shadow-sm",
          "hover:border-blue/30 focus:outline-none focus:ring-2 focus:ring-blue/30",
        )}
      >
        <div className="h-full w-full grid grid-rows-[1fr_auto]">
          <div className="relative overflow-hidden bg-foreground/5">
            {post.coverImageUrl ? (
              <TinifyImage
                src={post.coverImageUrl}
                alt={post.coverImageAlt}
                width={900}
                height={900}
                className={cx(
                  "w-full h-full object-cover",
                  "transition-transform duration-500",
                  "group-hover:scale-[1.03] group-focus-within:scale-[1.03]",
                )}
              />
            ) : (
              <div className="w-full h-full" />
            )}

            {/* Hover/focus overlay with excerpt + meta */}
            <div
              className={cx(
                "absolute inset-0 opacity-0",
                "group-hover:opacity-100 group-focus-within:opacity-100",
                "transition-opacity duration-300",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-blue/95 via-blue/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
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

/**
 * Grid card used in:
 * - Expanded "See all" category view
 * - Search results grid
 */
export function ListingGridCard({ post, currentLocale, className }: BaseProps) {
  return (
    <article className={cx("group", className)}>
      <Link
        href={postUrl(currentLocale, post.slug)}
        className={cx(
          "block rounded-xl bg-white border border-foreground/10 overflow-hidden shadow-sm",
          "hover:border-blue/30 focus:outline-none focus:ring-2 focus:ring-blue/30",
        )}
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

          {post.excerpt ? (
            <p className="mt-2 text-sm text-foreground/70 line-clamp-2">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-3 flex items-center gap-2 text-xs text-foreground/60">
            <span>{post.formattedDate}</span>
            <span>•</span>
            <span>{post.readingTime}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
