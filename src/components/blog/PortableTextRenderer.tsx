"use client";

import { PortableText, PortableTextComponents } from "@portabletext/react";
import { PortableTextBlock } from "@portabletext/types";
import TinifyImage from "@/components/TinifyImage";
import { urlFor } from "@/sanity/client";
import { InlineImage, YouTubeEmbed } from "@/lib/blog-types";
import { getYouTubeId } from "@/lib/youtube-utils";
import { Locale } from "@/lib/locale";
import InfographicReference from "../infographic/InfographicReference";
import { blockquoteStyles } from "../../../shared/blockquote-styles";
import { parseMarkdownTable } from "@/lib/markdown-table-parser";

interface PortableTextRendererProps {
  content: PortableTextBlock[];
  language: Locale;
  blogPostUrl?: string;
}

// Simplified YouTube embed component for display only
function YouTubeEmbedComponent({ value }: { value: YouTubeEmbed }) {
  const videoId = getYouTubeId(value.url);

  if (!videoId) {
    return <p>Invalid YouTube URL</p>;
  }

  // Use override title if provided
  const displayTitle = value.title;

  return (
    <div className="my-12">
      {displayTitle && (
        <h4 className="mb-6 font-medium text-xl">{displayTitle}</h4>
      )}

      {value.description && (
        <p className="mb-6 text-foreground/70 leading-relaxed">
          {value.description}
        </p>
      )}

      <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={displayTitle || "YouTube video"}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Key moments navigation */}
      {value.keyMoments && value.keyMoments.length > 0 && (
        <div className="mt-6">
          <h5 className="font-medium mb-4 text-lg">Video Chapters:</h5>
          <ul className="space-y-3 bg-foreground/5 rounded-xl p-4">
            {value.keyMoments.map((moment, index) => {
              const minutes = Math.floor(moment.time / 60);
              const seconds = moment.time % 60;
              const timestamp = `${minutes}:${seconds.toString().padStart(2, "0")}`;

              return (
                <li
                  key={index}
                  className="border-b border-foreground/10 last:border-0 pb-3 last:pb-0"
                >
                  <a
                    href={`${value.url}&t=${moment.time}s`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue hover:text-blue/80 font-medium block transition-colors"
                  >
                    {timestamp} - {moment.title}
                  </a>
                  {moment.description && (
                    <p className="text-foreground/60 mt-1 text-sm leading-relaxed">
                      {moment.description}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Transcript for accessibility and SEO */}
      {value.transcript && (
        <details className="mt-6">
          <summary className="cursor-pointer font-medium text-lg mb-4 hover:text-orange transition-colors">
            Video Transcript
          </summary>
          <div className="mt-4 p-6 bg-foreground/5 rounded-xl text-sm whitespace-pre-wrap leading-relaxed">
            {value.transcript}
          </div>
        </details>
      )}
    </div>
  );
}

// Enhanced inline image component with SEO features
function InlineImageComponent({ value }: { value: InlineImage }) {
  const imageUrl = urlFor(value.asset).url();

  if (!imageUrl) return null;

  // Size class mapping
  const sizeClasses = {
    full: "w-full",
    large: "w-3/4 mx-auto",
    medium: "w-1/2 mx-auto",
    small: "w-1/4 mx-auto",
  };

  const sizeClass = sizeClasses[value.size || "full"];
  const loading = value.loading || "lazy";

  // Build style object conditionally to avoid undefined values
  const imageStyle = value.enableOverflow
    ? { minWidth: "max-content" as const }
    : undefined;

  return (
    <figure className={`my-8 ${sizeClass}`}>
      <div
        className={`${value.enableOverflow ? "overflow-x-auto" : ""} rounded-2xl overflow-hidden`}
      >
        <TinifyImage
          src={imageUrl}
          alt={value.alt}
          width={800}
          height={600}
          loading={loading}
          className="w-full h-auto object-cover"
          {...(imageStyle && { style: imageStyle })}
        />
      </div>
      {value.caption && (
        <figcaption className="mt-4 text-sm text-foreground/60 text-center italic leading-relaxed">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}

// Table component for markdown tables
interface TableValue {
  markdown: string;
  caption?: string;
}

function TableComponent({ value }: { value: TableValue }) {
  const tableData = parseMarkdownTable(value.markdown);

  if (!tableData) {
    return <p className="text-foreground/60 italic">Invalid table format</p>;
  }

  return (
    <figure className="my-8 overflow-x-auto">
      <div className="rounded-2xl border border-foreground/10 overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-orange/10 border-b-2 border-orange/30">
              {tableData.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left font-semibold border-r border-foreground/10 last:border-r-0"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-foreground/10 last:border-b-0 hover:bg-foreground/5 transition-colors"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 border-r border-foreground/10 last:border-r-0"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {value.caption && (
        <figcaption className="mt-4 text-sm text-foreground/60 text-center italic">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function PortableTextRenderer({
  content,
  language,
  blogPostUrl,
}: PortableTextRendererProps) {
  const components: PortableTextComponents = {
    types: {
      image: ({ value }) => (
        <InlineImageComponent value={value as InlineImage} />
      ),
      inlineImage: ({ value }) => (
        <InlineImageComponent value={value as InlineImage} />
      ),
      youtubeEmbed: ({ value }) => (
        <YouTubeEmbedComponent value={value as YouTubeEmbed} />
      ),
      infographicReference: ({ value }) => {
        // Handle infographic references specifically
        if (value._ref) {
          return (
            <InfographicReference
              referenceId={value._ref}
              language={language}
              blogPostUrl={blogPostUrl}
            />
          );
        }
        return null;
      },
      table: ({ value }) => <TableComponent value={value as TableValue} />,
    },
    block: {
      h1: ({ children, value }) => {
        const text =
          value.children
            ?.map((child) => (child as { text?: string }).text || "")
            .join("") || "";
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim();
        return (
          <h1 id={id} className="mt-12 mb-6 first:mt-0">
            {children}
          </h1>
        );
      },
      h2: ({ children, value }) => {
        const text =
          value.children
            ?.map((child) => (child as { text?: string }).text || "")
            .join("") || "";
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim();
        return (
          <h2 id={id} className="mt-10 mb-5 first:mt-0">
            {children}
          </h2>
        );
      },
      h3: ({ children, value }) => {
        const text =
          value.children
            ?.map((child) => (child as { text?: string }).text || "")
            .join("") || "";
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim();
        return (
          <h3 id={id} className="mt-8 mb-4 first:mt-0">
            {children}
          </h3>
        );
      },
      h4: ({ children, value }) => {
        const text =
          value.children
            ?.map((child) => (child as { text?: string }).text || "")
            .join("") || "";
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim();
        return (
          <h4 id={id} className="mt-6 mb-3 first:mt-0">
            {children}
          </h4>
        );
      },
      normal: ({ children }) => (
        <p className="mb-6 leading-relaxed">{children}</p>
      ),
      blockquote: ({ children }) => (
        <blockquote className="my-8 pl-6 border-l-4 border-orange bg-orange/5 py-4 rounded-r-xl">
          {children}
        </blockquote>
      ),
      // Custom blockquote styles with emojis
      pushpin: ({ children }) => (
        <blockquote
          className="my-8 pl-6 border-l-4 py-4 rounded-r-xl flex items-start gap-3"
          style={{
            borderColor: blockquoteStyles.pushpin.borderColor,
            backgroundColor: blockquoteStyles.pushpin.backgroundColor,
          }}
        >
          <span className="text-2xl flex-shrink-0">{blockquoteStyles.pushpin.emoji}</span>
          <div className="flex-1">{children}</div>
        </blockquote>
      ),
      warning: ({ children }) => (
        <blockquote
          className="my-8 pl-6 border-l-4 py-4 rounded-r-xl flex items-start gap-3"
          style={{
            borderColor: blockquoteStyles.warning.borderColor,
            backgroundColor: blockquoteStyles.warning.backgroundColor,
          }}
        >
          <span className="text-2xl flex-shrink-0">{blockquoteStyles.warning.emoji}</span>
          <div className="flex-1">{children}</div>
        </blockquote>
      ),
      danger: ({ children }) => (
        <blockquote
          className="my-8 pl-6 border-l-4 py-4 rounded-r-xl flex items-start gap-3"
          style={{
            borderColor: blockquoteStyles.danger.borderColor,
            backgroundColor: blockquoteStyles.danger.backgroundColor,
          }}
        >
          <span className="text-2xl flex-shrink-0">{blockquoteStyles.danger.emoji}</span>
          <div className="flex-1">{children}</div>
        </blockquote>
      ),
      announcement: ({ children }) => (
        <blockquote
          className="my-8 pl-6 border-l-4 py-4 rounded-r-xl flex items-start gap-3"
          style={{
            borderColor: blockquoteStyles.announcement.borderColor,
            backgroundColor: blockquoteStyles.announcement.backgroundColor,
          }}
        >
          <span className="text-2xl flex-shrink-0">{blockquoteStyles.announcement.emoji}</span>
          <div className="flex-1">{children}</div>
        </blockquote>
      ),
    },
    marks: {
      link: ({ children, value }) => {
        // how do we hyperlink between blog posts and still
        // respect the current locale of the browser?

        return (
          <a
            href={value?.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue hover:text-blue/80 underline decoration-blue/30 hover:decoration-blue/60 transition-colors underline-offset-2"
          >
            {children}
          </a>
        );
      },
      citation: ({ value }) => {
        // In-text citation as superscript link to references section
        const citationNumber = value?.citationIndex || 1;
        return (
          <sup>
            <a
              href={`#citation-${citationNumber}`}
              title={`Jump to reference ${citationNumber}`}
              aria-label={`Jump to reference ${citationNumber}`}
              className="text-orange hover:text-orange/80 transition-colors font-normal no-underline"
            >
              [{citationNumber}]
            </a>
          </sup>
        );
      },
      strong: ({ children }) => (
        <strong className="font-semibold">{children}</strong>
      ),
      em: ({ children }) => <em className="italic">{children}</em>,
      code: ({ children }) => (
        <code className="px-2 py-1 bg-foreground/10 rounded-md text-sm font-mono">
          {children}
        </code>
      ),
      underline: ({ children }) => (
        <u className="underline decoration-foreground/50">{children}</u>
      ),
      "strike-through": ({ children }) => (
        <s className="line-through decoration-foreground/50">{children}</s>
      ),
      super: ({ children }) => <sup>{children}</sup>,
      sub: ({ children }) => <sub>{children}</sub>,
    },
    list: {
      bullet: ({ children }) => (
        <ul className="my-6 space-y-2 ml-6 list-disc">{children}</ul>
      ),
      number: ({ children }) => (
        <ol className="my-6 space-y-2 ml-6 list-decimal">{children}</ol>
      ),
    },
    listItem: {
      bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
      number: ({ children }) => <li className="leading-relaxed">{children}</li>,
    },
  };

  return <PortableText value={content} components={components} />;
}
