import { client } from '../sanity/client'
import { Author, Category } from '../sanity.types'
import { 
  authorReferencesQuery, 
  allAuthorsQuery 
} from '../author-queries'
import { 
  categoryReferencesQuery, 
  allCategoriesQuery 
} from '../category-queries'
import { 
  ReferenceRequest, 
  ResolvedReference, 
  DataManagerError,
  SupportedLanguage 
} from './types'
import { DataManagerCacheManager } from './cache'

export class ReferenceResolver {
  constructor(
    private language: SupportedLanguage,
    private cache: DataManagerCacheManager
  ) {}

  /**
   * Resolve multiple references in batched queries
   */
  async resolveReferences(requests: ReferenceRequest[]): Promise<ResolvedReference[]> {
    // Group requests by type
    const authorIds = requests
      .filter(req => req.type === 'author')
      .map(req => req.id)
    
    const categoryIds = requests
      .filter(req => req.type === 'category')
      .map(req => req.id)

    // Find missing references (not in cache)
    const missingAuthorIds = this.cache.getMissingAuthorIds(authorIds)
    const missingCategoryIds = this.cache.getMissingCategoryIds(categoryIds)

    // Batch fetch missing references
    const fetchPromises: Promise<any>[] = []

    if (missingAuthorIds.length > 0) {
      fetchPromises.push(this.fetchMissingAuthors(missingAuthorIds))
    }

    if (missingCategoryIds.length > 0) {
      fetchPromises.push(this.fetchMissingCategories(missingCategoryIds))
    }

    // Wait for all batch fetches to complete
    await Promise.all(fetchPromises)

    // Build resolved references
    const resolved: ResolvedReference[] = []

    for (const request of requests) {
      let data: Author | Category | null = null

      switch (request.type) {
        case 'author':
          data = this.cache.getAuthor(request.id)
          break
        case 'category':
          data = this.cache.getCategory(request.id)
          break
      }

      // Fail fast if reference is missing
      if (!data) {
        throw new DataManagerError(
          `Missing ${request.type} reference: ${request.id}`,
          'MISSING_REFERENCE',
          { type: request.type, id: request.id }
        )
      }

      resolved.push({
        id: request.id,
        type: request.type,
        data
      })
    }

    return resolved
  }

  /**
   * Fetch missing authors and cache them
   */
  private async fetchMissingAuthors(ids: string[]): Promise<void> {
    try {
      const authors = await client.fetch<Author[]>(
        authorReferencesQuery, 
        { ids, language: this.language }
      )

      // Cache the fetched authors
      this.cache.setMultipleAuthors(authors)

      // Verify we got all requested authors
      const fetchedIds = new Set(authors.map(author => author._id).filter(Boolean))
      const missingIds = ids.filter(id => !fetchedIds.has(id))

      if (missingIds.length > 0) {
        throw new DataManagerError(
          `Authors not found: ${missingIds.join(', ')}`,
          'MISSING_REFERENCE',
          { missingIds }
        )
      }
    } catch (error) {
      if (error instanceof DataManagerError) {
        throw error
      }
      throw new DataManagerError(
        `Failed to fetch authors: ${error}`,
        'QUERY_FAILED',
        { originalError: error, ids }
      )
    }
  }

  /**
   * Fetch missing categories and cache them
   */
  private async fetchMissingCategories(ids: string[]): Promise<void> {
    try {
      const categories = await client.fetch<Category[]>(
        categoryReferencesQuery, 
        { ids, language: this.language }
      )

      // Cache the fetched categories
      this.cache.setMultipleCategories(categories)

      // Verify we got all requested categories
      const fetchedIds = new Set(categories.map(category => category._id).filter(Boolean))
      const missingIds = ids.filter(id => !fetchedIds.has(id))

      if (missingIds.length > 0) {
        throw new DataManagerError(
          `Categories not found: ${missingIds.join(', ')}`,
          'MISSING_REFERENCE',
          { missingIds }
        )
      }
    } catch (error) {
      if (error instanceof DataManagerError) {
        throw error
      }
      throw new DataManagerError(
        `Failed to fetch categories: ${error}`,
        'QUERY_FAILED',
        { originalError: error, ids }
      )
    }
  }

  /**
   * Helper method to resolve a single author reference
   */
  async resolveAuthor(authorId: string): Promise<Author> {
    const resolved = await this.resolveReferences([
      { id: authorId, type: 'author' }
    ])
    return resolved[0].data as Author
  }

  /**
   * Helper method to resolve a single category reference
   */
  async resolveCategory(categoryId: string): Promise<Category> {
    const resolved = await this.resolveReferences([
      { id: categoryId, type: 'category' }
    ])
    return resolved[0].data as Category
  }
} 