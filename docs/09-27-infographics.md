# Infographic Download Feature Implementation

## Overview

This document outlines the implementation of a downloadable infographic feature for our internationalized Sanity blog. The feature allows users to download PDF versions of infographics with embedded links back to the blog post, supporting all six languages (EN, UK, DE, FR, ES, IT).

## What We've Implemented

### 1. New Infographic Schema (`infographicType.ts`)

Created a comprehensive schema for managing infographics with field-level internationalization:

**Key Features:**
- **Internationalized arrays** for all content fields (title, description, altText, slug)
- **Language-specific images** - one image per language per infographic
- **Validation** ensures English content is always required as base language
- **No duplicate languages** allowed within each field
- **Smart slug generation** from corresponding language titles
- **Consistent preview system** showing English first, then falling back to first available

**Structure:**
```typescript
{
  title: [
    { language: 'en', value: 'Dog Nutrition Guide' },
    { language: 'de', value: 'Hundeernährungsleitfaden' },
    // ... other languages
  ],
  slug: [
    { language: 'en', current: 'dog-nutrition-guide' },
    { language: 'de', current: 'hundeernährungsleitfaden' },
    // ... other languages  
  ],
  description: [...],
  image: [...],
  altText: [...]
}
```

### 2. Enhanced BlockContent Integration

Updated `blockContent.tsx` to include infographic references alongside existing inline images:

**Key Features:**
- **Backward compatibility** - kept existing inline image functionality
- **Language-aware filtering** - only shows infographics with content in the current document's language
- **Fallback behavior** - shows English infographics if document has no language set
- **Clean integration** - fits naturally into existing portable text structure

**Benefits:**
- Editors can continue using existing inline images during transition
- New infographic references provide enhanced functionality
- Easy migration path once all content is upgraded

## Future Implementation Steps

### Phase 1: Content Management Enhancement (Week 1-2)

#### A. Additional Schema Fields
Add optional fields to enhance PDF generation:

```typescript
// Add to infographicType.ts
downloadFilename: [
  { language: 'en', value: 'dog-nutrition-guide-2024' },
  { language: 'de', value: 'hundeernährung-leitfaden-2024' }
],
pdfMetadata: [
  { 
    language: 'en', 
    title: 'Dog Nutrition Guide 2024',
    keywords: 'dog nutrition, pet health, feeding guide',
    author: 'Dog Body Mind'
  }
]
```

#### B. Studio Experience Improvements
- **Custom preview components** showing language availability
- **Validation warnings** for missing translations
- **Upload workflow** guidance for consistent image sizing
- **Bulk upload tools** for multiple language versions

### Phase 2: Dynamic PDF Generation (Week 3-4)

#### A. API Route Implementation
Create Next.js API routes for PDF generation:

```typescript
// /api/download/infographic/[id].ts
export default async function handler(req, res) {
  const { id } = req.query;
  const { lang = 'en', format = 'pdf' } = req.query;
  
  // 1. Query Sanity for infographic data in specified language
  const infographic = await getInfographicById(id, lang);
  
  // 2. Generate PDF with embedded links
  const pdf = await generateInfographicPDF(infographic, lang);
  
  // 3. Return PDF with proper headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${infographic.filename}"`);
  res.send(pdf);
}
```

#### B. PDF Generation Service
Using `@react-pdf/renderer` or `puppeteer`:

**PDF Template Structure:**
1. **Header** - Site branding and logo
2. **Infographic image** - High resolution version
3. **Title and description** - Localized content
4. **Clickable blog URL** - Direct link back to content
5. **QR code** - For mobile sharing
6. **Footer** - Copyright and attribution
7. **Embedded metadata** - SEO-optimized PDF properties

### Phase 3: Frontend Integration (Week 5-6)

#### A. React Components

```typescript
// InfographicEmbed.tsx
interface InfographicEmbedProps {
  infographic: InfographicReference;
  language: string;
  blogPostUrl?: string;
}

export function InfographicEmbed({ infographic, language, blogPostUrl }: InfographicEmbedProps) {
  const [downloading, setDownloading] = useState(false);
  
  const handleDownload = async () => {
    setDownloading(true);
    // Track analytics
    trackEvent('infographic_download', { id: infographic._id, language });
    
    // Generate download URL
    const downloadUrl = `/api/download/infographic/${infographic._id}?lang=${language}&source=${blogPostUrl}`;
    
    // Trigger download
    window.location.href = downloadUrl;
    setDownloading(false);
  };
  
  return (
    <div className="infographic-embed">
      <img src={getLocalizedImage(infographic, language)} alt={getLocalizedAltText(infographic, language)} />
      <div className="infographic-actions">
        <button onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
        <SocialShareButtons infographic={infographic} />
      </div>
    </div>
  );
}
```

#### B. Sanity Queries
Language-aware GROQ queries:

```groq
// Get infographic with specific language content
*[_type == "infographic" && _id == $id][0]{
  _id,
  "title": title[language == $lang][0].value,
  "description": description[language == $lang][0].value,
  "image": image[language == $lang][0].asset,
  "altText": altText[language == $lang][0].value,
  "slug": slug[language == $lang][0].current,
  
  // Fallback to English if target language missing
  "titleFallback": title[language == "en"][0].value,
  "descriptionFallback": description[language == "en"][0].value,
  // ... other fallbacks
}
```

### Phase 4: Advanced Features (Week 7-8)

#### A. Analytics and Tracking
- **Download analytics** - Track popular infographics by language
- **Engagement metrics** - Monitor download-to-share ratios
- **Performance monitoring** - PDF generation times and success rates
- **A/B testing** - Different download button designs and placements

#### B. SEO and Social Optimization
- **PDF SEO metadata** - Proper title, author, keywords, description
- **Social media cards** - Open Graph images for PDF previews  
- **Sitemap inclusion** - Add major infographics to XML sitemap
- **Schema.org markup** - CreativeWork and DigitalDocument schemas

#### C. Content Strategy Features
- **Related content suggestions** - Show related infographics in PDFs
- **Email capture integration** - Optional email signup for premium downloads
- **Usage analytics dashboard** - Content performance insights
- **Automated social posting** - Share new infographics across platforms

## Technical Considerations

### Storage Strategy
- **Dynamic generation recommended** - 5GB Sanity storage limit makes pre-generation impractical
- **Image optimization** - Store web and print versions if needed later
- **Caching strategy** - Cache generated PDFs temporarily for performance

### Internationalization Approach
- **Field-level i18n** chosen over document-level to avoid 2000 document limit
- **Graceful fallbacks** - Always show English if target language unavailable
- **Consistent validation** - English required for all core fields

### Migration Path
- **Backward compatibility** maintained with existing inline images
- **Gradual migration** - Update existing documents progressively  
- **Remove old fields** only after all content migrated

### Performance Optimization
- **API route caching** - Cache PDF generation for popular downloads
- **Image optimization** - Proper sizing and format for web/print
- **CDN integration** - Serve generated PDFs from CDN when possible

## Benefits

### Content Strategy
- **Enhanced user experience** - Professional downloadable resources
- **SEO advantages** - PDFs become discoverable content assets
- **Social sharing** - Infographics become viral content pieces
- **Lead generation** - Email capture opportunities
- **Brand authority** - Professional presentation builds trust

### Technical Benefits
- **Scalable architecture** - Handles growth in infographic volume
- **Maintainable codebase** - Clear separation of concerns
- **International support** - Built-in multi-language capabilities
- **Analytics-driven** - Data to guide content decisions
- **Future-proof** - Extensible to other downloadable content types

This implementation provides a solid foundation for infographic downloads while maintaining the flexibility to enhance and expand the feature set as content needs grow.