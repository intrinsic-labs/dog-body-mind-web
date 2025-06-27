import { client } from '../../sanity/client'
import { 
  AuthorBySlugQueryResult,
  CategoryBySlugQueryResult 
} from '../sanity.types'
import { 
  allAuthorsQuery 
} from '../author-queries'
import { 
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

    // Batch fetch missing references using full queries for complete data
    const fetchPromises: Promise<void>[] = []

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
      let data: AuthorBySlugQueryResult | CategoryBySlugQueryResult | null = null

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
   * Uses the full allAuthorsQuery to get complete author data with resolved assets
   */
  private async fetchMissingAuthors(ids: string[]): Promise<void> {
    try {
      // Get all authors and filter to the ones we need
      // This is more efficient than multiple individual queries
      const allAuthors = await client.fetch<AuthorBySlugQueryResult[]>(
        allAuthorsQuery, 
        { language: this.language }
      )

      // Filter to only the authors we need
      const neededAuthors = allAuthors.filter(author => 
        author && author._id && ids.includes(author._id)
      )

      // Cache the fetched authors
      this.cache.setMultipleAuthors(neededAuthors)

      // Verify we got all requested authors
      const fetchedIds = new Set(neededAuthors.map(author => author && author._id).filter(Boolean))
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
   * Uses the full allCategoriesQuery to get complete category data with resolved assets
   */
  private async fetchMissingCategories(ids: string[]): Promise<void> {
    try {
      // Get all categories and filter to the ones we need
      const allCategories = await client.fetch<CategoryBySlugQueryResult[]>(
        allCategoriesQuery, 
        { language: this.language }
      )

      // Filter to only the categories we need
      const neededCategories = allCategories.filter(category => 
        category && category._id && ids.includes(category._id)
      )

      // Cache the fetched categories
      this.cache.setMultipleCategories(neededCategories)

      // Verify we got all requested categories
      const fetchedIds = new Set(neededCategories.map(category => category && category._id).filter(Boolean))
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
  async resolveAuthor(authorId: string): Promise<AuthorBySlugQueryResult> {
    const resolved = await this.resolveReferences([
      { id: authorId, type: 'author' }
    ])
    return resolved[0].data as AuthorBySlugQueryResult
  }

  /**
   * Helper method to resolve a single category reference
   */
  async resolveCategory(categoryId: string): Promise<CategoryBySlugQueryResult> {
    const resolved = await this.resolveReferences([
      { id: categoryId, type: 'category' }
    ])
    return resolved[0].data as CategoryBySlugQueryResult
  }
} 