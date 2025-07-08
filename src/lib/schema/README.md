# Schema.org Generation System

A TypeScript-first schema generation system using `schema-dts` and DataManager's resolved data.

## Overview

This system generates Schema.org markup for articles/blog posts using:
- **schema-dts**: Google's official TypeScript types for Schema.org
- **@graph structure**: JSON-LD graphs with proper entity references
- **DataManager integration**: Uses resolved post data with references
- **Static generation**: Optimized for Next.js build-time generation

## Usage

### Basic Article Schema Generation

```typescript
import { generateArticleSchema } from '@/lib/schema/generators/article-schema'
import { DataManager } from '@/lib/data-manager'

// In a Next.js page or component
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const dataManager = new DataManager('en')
  await dataManager.initialize()
  
  const postWithReferences = await dataManager.getPost(params.slug)
  
  const schema = generateArticleSchema(postWithReferences, {
    baseUrl: postWithReferences.organization.url,
    language: 'en'
  })
  
  return {
    other: {
      'application/ld+json': JSON.stringify(schema)
    }
  }
}
```

### Generated Schema Structure

The system generates a JSON-LD graph with:

1. **BlogPosting** - Main article with essential fields
2. **Person** - Author information with credentials
3. **Organization** - Publisher information

### Schema Features

✅ **Currently Implemented:**
- Basic article metadata (title, description, dates)
- Author information with bio and job title
- Organization/publisher details
- Proper @id references for entity linking
- Cover images and author avatars
- Article categories
- Multi-language support

⏭️ **Future Enhancements:**
- ImageObject schemas for detailed image metadata
- WebPage and WebSite schemas
- FAQ and HowTo structured data
- E-E-A-T signals for medical content
- Word count and reading time
- Review and rating schemas

## Architecture

### TypeScript-First Design
Uses `schema-dts` for compile-time type safety and autocompletion.

### Reference Resolution
Entities use `@id` references instead of embedding, following best practices:
```json
{
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": "https://example.com/en/blog/article#article",
      "author": { "@id": "https://example.com/en/authors/author#person" }
    },
    {
      "@type": "Person", 
      "@id": "https://example.com/en/authors/author#person",
      "name": "Author Name"
    }
  ]
}
```

### URL Generation
Consistent URL patterns using utility functions:
- Articles: `/{language}/blog/{slug}`
- Authors: `/{language}/authors/{slug}`
- Schema IDs: `{canonical-url}#{fragment}`

## Error Handling

The system throws clear errors for missing required data:
- Missing post data
- Missing author data  
- Missing organization data

This ensures schema markup is only generated with complete, valid data. 