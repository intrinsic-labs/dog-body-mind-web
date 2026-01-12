# Dynamic Sitemap Implementation

**Status**: ✅ Production Ready
**Date**: 2025-10-10
**Branch**: `feature/dynamic-sitemap`

## Overview

Implemented a dynamic, domain-aware sitemap that automatically generates locale-specific sitemaps based on the requesting domain. This aligns perfectly with the multi-domain ccTLD architecture.

## Architecture

### Domain-Based Detection

The sitemap uses Next.js's `headers()` API to detect the requesting domain and generates the appropriate locale-specific sitemap:

- `dogbodymind.com/sitemap.xml` → English content
- `dogbodymind.de/sitemap.xml` → German content
- `dogbodymind.fr/sitemap.xml` → French content
- `dogbodymind.es/sitemap.xml` → Spanish content
- `dogbodymind.it/sitemap.xml` → Italian content
- `dogbodymind.co.uk/sitemap.xml` → English (UK) content

### File Structure

```
src/
├── app/
│   └── sitemap.ts                      # Root sitemap (domain-aware)
├── lib/
│   ├── queries/
│   │   └── sitemap-queries.ts          # GROQ queries for sitemap data
│   └── sitemap-utils.ts                # Helper functions for URL generation
```

## Implementation Details

### 1. Sitemap Route (`src/app/sitemap.ts`)

Located at the root of the app directory, this file:
- Uses `headers()` to detect the requesting domain
- Calls `getLocaleFromDomain()` to determine the locale
- Fetches posts for that locale
- Generates sitemap entries with proper SEO metadata
- Uses `dynamic = 'force-dynamic'` to ensure fresh domain detection

### 2. Queries (`src/lib/queries/sitemap-queries.ts`)

GROQ queries that:
- Fetch only published posts (with `publishedAt <= now()`)
- Exclude posts with `noIndex: true`
- Filter by language
- Return minimal fields needed for sitemap (slug, dates, language)

### 3. Utilities (`src/lib/sitemap-utils.ts`)

Helper functions for:
- URL generation per locale
- Hreflang alternate generation (all 6 locales)
- SEO metadata (priority, changeFrequency, lastModified)
- Post transformation for sitemap entries

## SEO Best Practices

### Priority Values
- **0.9** - Landing page (highest priority - using 0.9 instead of 1.0 for validator compatibility)
- **0.8** - Blog listing page
- **0.7** - Individual blog posts

### Change Frequency
- **daily** - Blog listing (new posts appear here)
- **weekly** - Landing page and blog posts

### Last Modified
Uses the most recent date from:
1. `post.lastModified` (if set)
2. `post._updatedAt` (Sanity's update tracking)
3. `post.publishedAt` (fallback)

### Hreflang Alternates

Every URL includes `<xhtml:link>` elements for all 6 language versions:

```xml
<url>
  <loc>https://dogbodymind.com/blog/example</loc>
  <xhtml:link rel="alternate" hreflang="en-US" href="https://dogbodymind.com/blog/example" />
  <xhtml:link rel="alternate" hreflang="en-GB" href="https://dogbodymind.co.uk/blog/example" />
  <xhtml:link rel="alternate" hreflang="de-DE" href="https://dogbodymind.de/blog/example" />
  <xhtml:link rel="alternate" hreflang="fr-FR" href="https://dogbodymind.fr/blog/example" />
  <xhtml:link rel="alternate" hreflang="es-ES" href="https://dogbodymind.es/blog/example" />
  <xhtml:link rel="alternate" hreflang="it-IT" href="https://dogbodymind.it/blog/example" />
  <lastmod>2025-07-30T21:10:25.000Z</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
```

This tells search engines:
- This content is available in 6 languages
- Each language lives on its canonical domain
- Search engines should show users the appropriate language version

## Content Filtering

The sitemap **includes**:
- Landing page
- Blog listing page
- All published blog posts

The sitemap **excludes**:
- Draft posts
- Posts with `noIndex: true`
- Posts with future publish dates
- Category pages (not yet implemented)
- Author pages (not yet implemented)

## Testing

### Local Development

Test the sitemap locally:
```bash
npm run dev
```

Then visit:
- `http://localhost:3000/sitemap.xml` - English sitemap (default)

### Production Domains

In production, each domain serves its own sitemap:
```bash
curl https://dogbodymind.com/sitemap.xml    # English
curl https://dogbodymind.de/sitemap.xml     # German
curl https://dogbodymind.fr/sitemap.xml     # French
curl https://dogbodymind.es/sitemap.xml     # Spanish
curl https://dogbodymind.it/sitemap.xml     # Italian
curl https://dogbodymind.co.uk/sitemap.xml  # English (UK)
```

### Verification Checklist

- ✅ XML structure is valid
- ✅ All URLs use HTTPS
- ✅ All URLs use production domains
- ✅ Hreflang alternates present for all entries
- ✅ Priority values correct (0.9, 0.8, 0.7)
- ✅ changeFrequency values appropriate
- ✅ lastModified dates accurate
- ✅ Only published posts included
- ✅ noIndex posts excluded

## Google Search Console Setup

After deployment:

1. **Submit to Google Search Console**
   - Log into GSC for each domain
   - Navigate to Sitemaps
   - Submit: `https://[domain]/sitemap.xml`

2. **Verify per Domain**
   - dogbodymind.com/sitemap.xml
   - dogbodymind.de/sitemap.xml
   - dogbodymind.fr/sitemap.xml
   - dogbodymind.es/sitemap.xml
   - dogbodymind.it/sitemap.xml
   - dogbodymind.co.uk/sitemap.xml

3. **Monitor Coverage**
   - Check indexing status regularly
   - Watch for errors or warnings
   - Verify hreflang implementation

## Future Enhancements

Potential additions:
- [ ] Category pages (when implemented)
- [ ] Author pages (when implemented)
- [ ] Image sitemaps for blog post images
- [ ] Video sitemaps (if video content added)
- [ ] News sitemap (if news content added)
- [ ] Sitemap index for large content libraries (50k+ URLs)

## Performance

- **Generation**: Dynamic per request (detects domain)
- **Caching**: Queries use 1-hour revalidation
- **Size**: Currently ~14 URLs per locale, minimal overhead
- **Scalability**: Will handle 50k+ URLs efficiently

## Troubleshooting

### Sitemap not generating
- Check that Sanity connection is working
- Verify environment variables are set
- Check console for error messages

### Wrong locale content
- Verify domain detection in middleware
- Check `getLocaleFromDomain()` mapping
- Review middleware logs

### Missing hreflang alternates
- Verify `sitemap-utils.ts` is imported correctly
- Check that all 6 locales are in `locales` array
- Review XML output structure

## Related Files

- `src/middleware.ts` - Domain detection and routing
- `src/lib/locale.ts` - Locale utilities and mappings
- `src/lib/queries/post-queries.ts` - Post data fetching
- `src/lib/metadata/article-metadata.ts` - Metadata generation

## References

- [Next.js Sitemap Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Sanity Sitemap Guide](https://www.sanity.io/learn/course/seo-optimization/building-a-dynamic-sitemap)
- [Google Sitemap Guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Hreflang Implementation](https://developers.google.com/search/docs/specialty/international/localized-versions)
