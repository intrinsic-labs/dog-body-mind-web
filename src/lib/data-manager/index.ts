import { client } from '../../sanity/client'
import { 
  PostBySlugQueryResult,
  AllPostsQueryResult,
  AuthorBySlugQueryResult,
  AllAuthorsQueryResult,
  CategoryBySlugQueryResult,
  AllCategoriesQueryResult,
  ChildCategoriesQueryResult,
  OrganizationQueryResult
} from '../sanity.types'
import { 
  allPostsQuery, 
  postBySlugQuery 
} from '../queries/post-queries'
import { 
  allAuthorsQuery
} from '../queries/author-queries'
import { 
  allCategoriesQuery, 
  childCategoriesQuery 
} from '../queries/category-queries'
import { 
  organizationQuery,
  organizationDebugQuery 
} from '../queries/organization-queries'
import {
  IDataManager,
  PostWithReferences,
  CategoryWithParent,
  ReferenceRequest,
  ResolvedReference,
  DataManagerError,
  SupportedLanguage
} from './types'
import { DataManagerCacheManager } from './cache'
import { ReferenceResolver } from './reference-resolver'

export class DataManager implements IDataManager {
  private cache: DataManagerCacheManager
  private referenceResolver: ReferenceResolver
  private initialized = false

  constructor(private language: SupportedLanguage) {
    this.cache = new DataManagerCacheManager()
    this.referenceResolver = new ReferenceResolver(language, this.cache)
  }

  /**
   * Initialize the DataManager with commonly needed data
   */
  async initialize(): Promise<void> {
    console.log(`🔍 DataManager: Initializing for language: ${this.language}`)
    try {
      // Eagerly load organization (always needed for schema.org)
      console.log('📡 DataManager: Fetching organization...')
      
      const organization = await client.fetch<OrganizationQueryResult>(
        organizationQuery, 
        { language: this.language }
      )
    
      
      // If organization not found with language filtering, try debug query
      if (!organization) {
        console.log('🐛 DataManager: Trying debug query without language filtering...')
        const debugOrg = await client.fetch(organizationDebugQuery)
        console.log('🐛 DataManager: Debug organization result:', debugOrg)
      }
      
      if (!organization) {
        throw new DataManagerError(
          'Organization not found',
          'MISSING_REFERENCE',
          { language: this.language }
        )
      }
      
      this.cache.setOrganization(organization)
      
      // Eagerly load all categories (commonly needed for navigation)
      const categories = await client.fetch<AllCategoriesQueryResult>(
        allCategoriesQuery, 
        { language: this.language }
      )
      
      this.cache.setMultipleCategories(categories)
      
      this.initialized = true
    } catch (error) {
      if (error instanceof DataManagerError) {
        throw error
      }
      throw new DataManagerError(
        `Failed to initialize DataManager: ${error}`,
        'QUERY_FAILED',
        { originalError: error, language: this.language }
      )
    }
  }

  /**
   * Get a single post with all document references resolved
   * Assets and language fields are already resolved by the query
   */
  async getPost(slug: string): Promise<PostWithReferences> {
    this.ensureInitialized()
    
    try {
      // Fetch the post - this already has resolved assets and extracted language fields
      const post = await client.fetch<PostBySlugQueryResult>(
        postBySlugQuery, 
        { slug, language: this.language }
      )

      if (!post) {
        throw new DataManagerError(
          `Post not found: ${slug}`,
          'MISSING_REFERENCE',
          { slug, language: this.language }
        )
      }

      // Resolve document references only (assets are already resolved by query)
      if (!post.author?._ref) {
        throw new DataManagerError(
          `Post missing author reference: ${slug}`,
          'MISSING_REFERENCE',
          { slug, language: this.language }
        )
      }
      
      const author = await this.getPostAuthor(post.author._ref)
      
      // Resolve all categories in order (first one is primary)
      const categories: CategoryBySlugQueryResult[] = []
      if (post.categories && post.categories.length > 0) {
        const categoryRequests = post.categories.map(cat => ({
          id: cat._ref,
          type: 'category' as const
        }))
        const resolvedCategories = await this.getMultipleReferences(categoryRequests)
        
        // Maintain the original order from post.categories
        for (const postCat of post.categories) {
          const resolved = resolvedCategories.find(r => r.id === postCat._ref)
          if (resolved && resolved.data) {
            categories.push(resolved.data as CategoryBySlugQueryResult)
          }
        }
      }
      
      const primaryCategory = categories.length > 0 ? categories[0] : null
      const organization = await this.getOrganization()

      return {
        post,
        author,
        primaryCategory,
        categories,
        organization
      }
    } catch (error) {
      if (error instanceof DataManagerError) {
        throw error
      }
      throw new DataManagerError(
        `Failed to get post: ${error}`,
        'QUERY_FAILED',
        { originalError: error, slug, language: this.language }
      )
    }
  }

  /**
   * Get all posts (for static generation)
   */
  async getAllPosts(): Promise<AllPostsQueryResult> {
    this.ensureInitialized()
    
    try {
      const posts = await client.fetch<AllPostsQueryResult>(
        allPostsQuery, 
        { language: this.language }
      )
      return posts
    } catch (error) {
      throw new DataManagerError(
        `Failed to get all posts: ${error}`,
        'QUERY_FAILED',
        { originalError: error, language: this.language }
      )
    }
  }

  /**
   * Get a post's author, with caching
   */
  async getPostAuthor(authorId: string): Promise<AuthorBySlugQueryResult> {
    this.ensureInitialized()
    
    // Check cache first
    const cached = this.cache.getAuthor(authorId)
    if (cached) {
      return cached
    }

    // Resolve via reference resolver
    return await this.referenceResolver.resolveAuthor(authorId)
  }

  /**
   * Get all authors
   */
  async getAllAuthors(): Promise<AllAuthorsQueryResult> {
    this.ensureInitialized()
    
    try {
      const authors = await client.fetch<AllAuthorsQueryResult>(
        allAuthorsQuery, 
        { language: this.language }
      )
      
      // Cache the authors
      this.cache.setMultipleAuthors(authors)
      
      return authors
    } catch (error) {
      throw new DataManagerError(
        `Failed to get all authors: ${error}`,
        'QUERY_FAILED',
        { originalError: error, language: this.language }
      )
    }
  }

  /**
   * Get a post's category, with caching
   */
  async getPostCategory(categoryId: string): Promise<CategoryBySlugQueryResult> {
    this.ensureInitialized()
    
    // Check cache first
    const cached = this.cache.getCategory(categoryId)
    if (cached) {
      return cached
    }

    // Resolve via reference resolver
    return await this.referenceResolver.resolveCategory(categoryId)
  }

  /**
   * Get a category with its parent resolved
   */
  async getCategoryWithParent(categoryId: string): Promise<CategoryWithParent> {
    this.ensureInitialized()
    
    // Get the category first
    const category = await this.getPostCategory(categoryId)
    
    // Resolve parent if it exists
    let parent: CategoryBySlugQueryResult | null = null
    if (category && category.parent?._ref) {
      parent = await this.getPostCategory(category.parent._ref)
    }
    
    return {
      category,
      parent
    }
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<AllCategoriesQueryResult> {
    this.ensureInitialized()
    
    try {
      const categories = await client.fetch<AllCategoriesQueryResult>(
        allCategoriesQuery, 
        { language: this.language }
      )
      
      // Update cache
      this.cache.setMultipleCategories(categories)
      
      return categories
    } catch (error) {
      throw new DataManagerError(
        `Failed to get all categories: ${error}`,
        'QUERY_FAILED',
        { originalError: error, language: this.language }
      )
    }
  }

  /**
   * Get child categories for hierarchical navigation
   * Note: Returns lightweight category data, not full category objects
   * 
   * What is the point of this? It should return the full category object.
   */
  async getCategoryChildren(parentId: string): Promise<CategoryBySlugQueryResult[]> {
    this.ensureInitialized()
    
    try {
      // Get minimal child category data
      const childrenData = await client.fetch<ChildCategoriesQueryResult>(
        childCategoriesQuery, 
        { parentId, language: this.language }
      )
      
      // Convert to CategoryBySlugQueryResult format by filling missing fields
      const children: CategoryBySlugQueryResult[] = childrenData.map(child => ({
        ...child,
        _type: 'category' as const,
        _createdAt: '',
        _updatedAt: '', 
        _rev: '',
        metaDescription: null,
        featuredImage: null,
        parent: null,
        //language: this.language
        language: null
      }))
      
      return children
    } catch (error) {
      throw new DataManagerError(
        `Failed to get category children: ${error}`,
        'QUERY_FAILED',
        { originalError: error, parentId, language: this.language }
      )
    }
  }

  /**
   * Get the organization (cached during initialization)
   */
  async getOrganization(): Promise<OrganizationQueryResult> {
    this.ensureInitialized()
    
    const organization = this.cache.getOrganization()
    if (!organization) {
      throw new DataManagerError(
        'Organization not found in cache - initialization may have failed',
        'MISSING_REFERENCE',
        { language: this.language }
      )
    }
    
    return organization
  }

  /**
   * Batch resolve multiple references
   */
  async getMultipleReferences(requests: ReferenceRequest[]): Promise<ResolvedReference[]> {
    this.ensureInitialized()
    return await this.referenceResolver.resolveReferences(requests)
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    return this.cache.getCacheStats()
  }

  /**
   * Ensure DataManager has been initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new DataManagerError(
        'DataManager not initialized. Call initialize() first.',
        'QUERY_FAILED'
      )
    }
  }
}

// Export types and error class for external use
export * from './types'
export { DataManagerCacheManager } from './cache'
export { ReferenceResolver } from './reference-resolver' 