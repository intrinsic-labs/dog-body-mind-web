import TinifyImage from "@/components/TinifyImage";
import Link from "next/link";
import { PortableTextBlock } from "@portabletext/types";
import { DisplayPost } from '@/components/blog/presenter-models/DisplayPost';
import { Locale, getCanonicalUrl } from "@domain/locale";
import PortableTextRenderer from "./PortableTextRenderer";
import ReferencesSection from "./ReferencesSection";

interface BlogPostProps {
  post: DisplayPost;
  currentLocale: Locale;
}

function extractHeadings(content: PortableTextBlock[]) {
  const headings: Array<{ text: string; level: number; id: string }> = [];

  content.forEach((block) => {
    if (
      block._type === "block" &&
      block.style &&
      ["h1", "h2", "h3", "h4"].includes(block.style)
    ) {
      const text =
        block.children
          ?.map((child) => (child as { text?: string }).text || "")
          .join("") || "";

      const level = parseInt(block.style.replace("h", ""));
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();

      headings.push({ text, level, id });
    }
  });

  return headings;
}

// Table of Contents component
function TableOfContents({
  headings,
}: {
  headings: Array<{ text: string; level: number; id: string }>;
}) {
  if (headings.length === 0) return null;

  return (
    <nav className="mb-12 max-w-2xl w-full border-b border-foreground/10 pb-4">
      <h3 className="text-lg font-medium mb-4 text-foreground">
        In This Article We Will Cover:
      </h3>
      <ul className="space-y-2">
        {headings.map((heading, index) => (
          <li key={index}>
            <a
              href={`#${heading.id}`}
              className="hover:text-blue transition-colors leading-relaxed block py-1"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function BlogPost({ post, currentLocale }: BlogPostProps) {
  const headings = extractHeadings(post.content);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
      <header className="mb-12 flex flex-col items-center">
        {/* Categories */}
        {post.categories.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {post.categories.map(
                (category: { _id: string; title: string; slug: string }) => (
                  <Link
                    key={category._id}
                    href={`/${currentLocale}/blog/category/${category.slug}`}
                    className="inline-block px-3 py-1 text-sm bg-blue/10 text-blue rounded-full hover:bg-blue/20 transition-colors"
                  >
                    {category.title}
                  </Link>
                ),
              )}
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="mb-6 max-w-2xl text-center">{post.title}</h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70 mb-8">
          <span className="font-medium">{post.author.name}</span>
          <span className="hidden sm:inline">•</span>
          <time dateTime={post.publishedAt}>{post.formattedDate}</time>
          <span className="hidden sm:inline">•</span>
          <span>{post.readingTime}</span>
        </div>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="mb-8 rounded-sm overflow-hidden w-full">
            <TinifyImage
              src={post.coverImageUrl}
              alt={post.coverImageAlt}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <div className="text-lg text-foreground/80 leading-relaxed border-l-4 border-blue pl-6 py-4 bg-blue/5 max-w-2xl rounded-r-sm">
            <p>{post.excerpt}</p>
          </div>
        )}
      </header>

      {/* Table of Contents */}
      <TableOfContents headings={headings} />

      {/* Content */}
      <div className="prose prose-lg max-w-2xl">
        <PortableTextRenderer
          content={post.content}
          language={currentLocale}
          blogPostUrl={getCanonicalUrl(`blog/${post.slug}`, currentLocale)}
        />
      </div>

      {/* References Section */}
      {post.references && post.references.length > 0 && (
        <div className="max-w-2xl w-full">
          <ReferencesSection references={post.references} />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-foreground/10">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/${currentLocale}/blog/tag/${encodeURIComponent(tag)}`}
                  className="inline-block px-3 py-1 text-sm bg-foreground/5 text-foreground/70 rounded-full hover:bg-foreground/10 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author info - add soon */}
        {/* <div className="bg-gradient-to-br from-background to-foreground/5 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange/20 rounded-full flex items-center justify-center">
              <span className="text-orange font-bold text-xl">
                {post.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-lg">Written by {post.author.name}</h4>
              <Link
                href={`/${currentLocale}/blog/author/${post.author.slug}`}
                className="text-orange hover:text-orange/80 transition-colors"
              >
                View all posts by {post.author.name} →
              </Link>
            </div>
          </div>
        </div> */}
      </footer>
    </article>
  );
}
