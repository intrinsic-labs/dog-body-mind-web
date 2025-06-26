# DataManager

A comprehensive data management system for the Dog Body Mind CMS that provides language-specific data fetching, intelligent caching, and batched reference resolution.

## Features

- 🌍 **Language-specific data extraction** from internationalized Sanity fields
- 🚀 **Intelligent caching** to avoid duplicate queries during build time
- 🔗 **Batched reference resolution** for optimal database performance
- ❌ **Fail-fast error handling** to catch data integrity issues at build time
- 📊 **Complete schema.org support** with resolved references

## Basic Usage

```typescript
import { DataManager } from '@/lib/data-manager'

// Initialize for a specific language
const dataManager = new DataManager('en')
await dataManager.initialize()

// Get a single post with all references resolved
const resolvedPost = await dataManager.getPost('my-blog-post')
// Returns: { post, author, category, organization }

// Get all posts (for static generation)
const allPosts = await dataManager.getAllPosts()

// Get cached organization
const organization = await dataManager.getOrganization()
```

## Static Generation Usage

```typescript
// app/[locale]/blog/[slug]/page.tsx
export async function generateStaticParams({ params }) {
  const dataManager = new DataManager(params.locale)
  await dataManager.initialize()
  
  const posts = await dataManager.getAllPosts()
  
  return posts.map(post => ({
    locale: params.locale,
    slug: post.slug?.current
  }))
}

export default async function BlogPost({ params }) {
  const dataManager = new DataManager(params.locale)
  await dataManager.initialize()
  
  // Get complete post data with resolved references
  const { post, author, category, organization } = await dataManager.getPost(params.slug)
  
  // Generate schema.org markup
  const schemas = SchemaGenerator.generatePostSchemas({
    post, author, category, organization
  })
  
  return (
    <article>
      <script type="application/ld+json">
        {JSON.stringify(schemas)}
      </script>
      {/* Render post content */}
    </article>
  )
}
```

## API Reference

### Core Methods

- `initialize()` - Load commonly needed data (organization, categories)
- `getPost(slug)` - Get post with all references resolved
- `getAllPosts()` - Get all posts for a language
- `getPostAuthor(id)` - Get author (cached)
- `getPostCategory(id)` - Get category (cached)
- `getOrganization()` - Get organization (cached)

### Batch Operations

- `getMultipleReferences(requests)` - Resolve multiple references in batched queries

### Utility Methods

- `getCacheStats()` - Debug cache statistics

## Error Handling

The DataManager uses typed errors for different failure scenarios:

```typescript
try {
  const post = await dataManager.getPost('missing-post')
} catch (error) {
  if (error instanceof DataManagerError) {
    switch (error.type) {
      case 'MISSING_REFERENCE':
        // Handle missing data
        break
      case 'QUERY_FAILED':
        // Handle query errors
        break
      case 'INVALID_LANGUAGE':
        // Handle language errors
        break
    }
  }
}
```

## Architecture

- **DataManager** - Main class, implements IDataManager interface
- **ReferenceResolver** - Handles batched reference resolution
- **DataManagerCacheManager** - In-memory caching for instance lifecycle
- **Types** - TypeScript contracts and interfaces

## Language Support

Supported languages: `'en' | 'uk' | 'de' | 'fr' | 'es' | 'it'`

Each DataManager instance handles one language and extracts the appropriate language-specific values from internationalized Sanity fields. 