# Blog Component System

A comprehensive, SEO-optimized blog system built for Dog Body Mind with advanced schema markup support.

## Overview

This system provides a clean, maintainable blog architecture with strong separation of concerns:

- **Data Layer**: Pure queries, transformations, and service functions
- **Component Layer**: Reusable UI components with semantic HTML  
- **Schema Layer**: Enhanced Sanity schemas with SEO and E-E-A-T support

## Components

### Core Components

- **`BlogList.tsx`** - Collection of blog post previews
- **`BlogCard.tsx`** - Individual post preview card
- **`BlogPost.tsx`** - Full post display with schema markup
- **`PortableTextRenderer.tsx`** - Enhanced content renderer with media support

### Enhanced Inline Content Support

#### Inline Images (`inlineImage`)
**SEO Features:**
- **Required alt text** (10-125 characters for optimal SEO)
- **Optional captions** (up to 200 characters)
- **Loading optimization** (`lazy` by default, `eager` for above-fold images)
- **Responsive sizing** (full, large, medium, small)
- **Overflow scrolling** for wide images that maintain natural size

**Usage in Content:**
```typescript
{
  _type: 'inlineImage',
  asset: {...}, // Sanity image asset
  alt: 'Dog playing in the park on a sunny day',
  caption: 'Regular exercise is essential for your dog\'s mental health',
  loading: 'lazy', // or 'eager' for above-fold
  size: 'full', // 'full' | 'large' | 'medium' | 'small'
  enableOverflow: false // true for wide images
}
```

#### YouTube Embeds (`youtubeEmbed`)
**SEO Features:**
- **VideoObject schema** support with structured data
- **Video transcripts** for accessibility and SEO
- **Key moments/chapters** for enhanced user experience
- **Video descriptions** for search engines
- **Duration tracking** in ISO 8601 format

**Usage in Content:**
```typescript
{
  _type: 'youtubeEmbed',
  url: 'https://youtube.com/watch?v=...',
  title: 'How to Train Your Dog: Basic Commands',
  description: 'Learn essential dog training commands every owner should know',
  duration: 'PT8M30S', // 8 minutes 30 seconds
  transcript: 'Full video transcript for accessibility...',
  keyMoments: [
    {
      time: 120, // 2:00
      title: 'Teaching "Sit" Command',
      description: 'Step-by-step sit training'
    }
  ]
}
```

## Data Layer Architecture

### Files Structure
```
src/lib/
├── blog-types.ts      # TypeScript interfaces
├── blog-queries.ts    # Sanity GROQ queries  
├── blog-transforms.ts # Data transformation utilities
└── blog-service.ts    # Main API combining queries + transforms
```

### Enhanced Schema Support

#### SEO Fields
- `metaTitle`, `meta` (description)
- `focusKeyword`, `secondaryKeywords`
- `articleType` (Article, NewsArticle, BlogPosting, etc.)
- `articleSection` (primary category reference)

#### E-E-A-T Signals
- `medicallyReviewed`, `medicalReviewer`, `reviewDate`
- Author credentials, education, experience
- Organization information for publisher markup

#### Structured Content
- **FAQ Schema**: Question/answer pairs for PAA boxes
- **HowTo Schema**: Step-by-step instructions with supplies/tools
- **Target Audience**: Categorization for personalized content

## Content Editor Guidelines

### Images Best Practices
1. **Always add descriptive alt text** (10-125 characters)
2. **Use captions** to provide context and improve engagement
3. **Choose appropriate sizing**:
   - `full`: Hero images, main illustrations
   - `large`: Important supporting images  
   - `medium`: Secondary illustrations
   - `small`: Icons, small diagrams
4. **Set loading priority**:
   - `eager`: Above-the-fold images (first 2-3 images)
   - `lazy`: Below-the-fold images (default)

### Video Best Practices
1. **Add video descriptions** for search engines
2. **Include transcripts** for accessibility and SEO boost
3. **Set up key moments** for better user experience
4. **Use proper duration format**: `PT5M30S` (5 min 30 sec)

### SEO Optimization
1. **Focus keywords**: Target one primary keyword per post
2. **Meta descriptions**: Use excerpt or create custom (120-158 chars)
3. **Article sections**: Choose primary category for schema markup
4. **Structured content**: Add FAQs and HowTo when relevant

## Implementation Notes

### Image Handling
- Uses Next.js `Image` component with optimization
- Sanity image transformations via `urlFor()`
- Responsive classes with Tailwind CSS
- Semantic `<figure>` and `<figcaption>` elements

### Video Handling  
- Responsive iframe containers with aspect ratio
- Accessible navigation with keyboard support
- Chapter timestamps linked to YouTube
- Collapsible transcripts for better UX

### Performance
- Lazy loading by default for images
- Efficient GROQ queries with minimal data fetching
- Server-side rendering with Next.js 13+ app router
- Optimized image transformations

## Future Enhancements

### Planned Features
- [ ] Image gallery components for multiple images
- [ ] Audio embed support with transcript
- [ ] Interactive infographic embeds
- [ ] Social media embed components
- [ ] Advanced image annotations

### Schema Markup Expansion
- [ ] Recipe schema for dog treat recipes
- [ ] Product schema for dog product reviews
- [ ] Event schema for dog training events
- [ ] Local business schema for vet recommendations

## Usage Examples

### Server Component (Page)
```typescript
import { getBlogPosts } from '@/lib/blog-service';
import BlogList from '@/components/blog/BlogList';

export default async function BlogPage() {
  const posts = await getBlogPosts({ limit: 10 });
  return <BlogList posts={posts} />;
}
```

### Individual Post
```typescript
import { getBlogPost } from '@/lib/blog-service';
import BlogPost from '@/components/blog/BlogPost';

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) return <div>Post not found</div>;
  return <BlogPost post={post} />;
}
```

This system provides a solid foundation for SEO-optimized content creation while maintaining clean, accessible code architecture. 