import React from 'react';
import { 
  SchemaBundle, 
  generateSchemaForPost,
  generateSchemaForPage
} from '@/lib/schemaGen';
import { BlogPost, Author, Organization } from '@/lib/blog-types';

interface SEOHeadProps {
  // Content data
  post?: BlogPost;
  author?: Author;
  organization: Organization;
  baseUrl: string;
  locale: string;
  
  // Page-specific overrides
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  canonicalUrl?: string;
  
  // International SEO
  hreflangUrls?: Record<string, string>;
  
  // Schema options
  includeSchemas?: boolean;
}

/**
 * SEO Head component with comprehensive metadata and schema generation
 */
export default async function SEOHead({
  post,
  author,
  organization,
  baseUrl,
  locale,
  title,
  description,
  image,
  url,
  type = 'website',
  noIndex = false,
  canonicalUrl,
  hreflangUrls,
  includeSchemas = true
}: SEOHeadProps) {
  // Determine final values
  const finalTitle = post?.metaTitle || post?.title || title || organization.name;
  const finalDescription = post?.metaDescription || post?.excerpt || description || organization.description;
  const finalImage = post?.coverImage?.asset?.url || image || organization.logo?.asset?.url;
  const finalUrl = url || baseUrl;
  const finalCanonical = post?.canonicalUrl || canonicalUrl || finalUrl;
  
  // Generate schema markup
  let schemaMarkup: SchemaBundle | null = null;
  
  if (includeSchemas) {
    try {
      if (post && author) {
        schemaMarkup = await generateSchemaForPost({
          post,
          author,
          organization,
          baseUrl,
          locale
        });
      } else {
        schemaMarkup = await generateSchemaForPage(
          finalTitle,
          finalDescription,
          finalUrl,
          organization,
          baseUrl
        );
      }
    } catch (error) {
      console.warn('Failed to generate schema markup:', error);
    }
  }

  return (
    <>
      {/* Title */}
      <title>{finalTitle}</title>
      
      {/* Basic Meta Tags */}
      <meta name="description" content={finalDescription} />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <link rel="canonical" href={finalCanonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:site_name" content={organization.name} />
      <meta property="og:locale" content={locale} />
      {finalImage && <meta property="og:image" content={finalImage} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {finalImage && <meta name="twitter:image" content={finalImage} />}
      
      {/* Article-specific meta */}
      {post && type === 'article' && (
        <>
          <meta property="article:published_time" content={post.publishedAt} />
          <meta property="article:modified_time" content={post.lastModified || post.publishedAt} />
          {author && <meta property="article:author" content={author.name} />}
          {post.articleSection && <meta property="article:section" content={post.articleSection.title} />}
          {post.tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Hreflang for International SEO */}
      {hreflangUrls && Object.entries(hreflangUrls).map(([lang, langUrl]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={langUrl} />
      ))}
      
      {/* Language meta */}
      <meta httpEquiv="Content-Language" content={locale} />
      
      {/* Additional SEO enhancements */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://cdn.sanity.io" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      
      {/* RSS Feed */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${organization.name} RSS Feed`}
        href={`${baseUrl}/feed.xml`}
      />
      
      {/* Schema.org JSON-LD */}
      {schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaMarkup, null, 0)
              .replace(/</g, '\\u003c') // XSS protection
              .replace(/>/g, '\\u003e')
              .replace(/&/g, '\\u0026')
          }}
        />
      )}
    </>
  );
}

/**
 * Helper function to generate hreflang URLs for a post
 */
export function generateHreflangUrls(
  slug: string,
  baseUrl: string,
  locales: string[] = ['en', 'uk', 'de', 'fr', 'es', 'it']
): Record<string, string> {
  const hreflangUrls: Record<string, string> = {};
  
  // Add each locale
  locales.forEach(locale => {
    const path = locale === 'en' ? `/blog/${slug}` : `/${locale}/blog/${slug}`;
    hreflangUrls[locale === 'uk' ? 'en-GB' : locale] = `${baseUrl}${path}`;
  });
  
  // Add x-default (typically English)
  hreflangUrls['x-default'] = `${baseUrl}/blog/${slug}`;
  
  return hreflangUrls;
}

/**
 * Helper function to generate page-specific hreflang URLs
 */
export function generatePageHreflangUrls(
  path: string,
  baseUrl: string,
  locales: string[] = ['en', 'uk', 'de', 'fr', 'es', 'it']
): Record<string, string> {
  const hreflangUrls: Record<string, string> = {};
  
  locales.forEach(locale => {
    const localePath = locale === 'en' ? path : `/${locale}${path}`;
    hreflangUrls[locale === 'uk' ? 'en-GB' : locale] = `${baseUrl}${localePath}`;
  });
  
  hreflangUrls['x-default'] = `${baseUrl}${path}`;
  
  return hreflangUrls;
} 