import { 
  AuthorBySlugQueryResult,
  CategoryBySlugQueryResult, 
  OrganizationQueryResult 
} from '@infrastructure/sanity/types/sanity.types'
import { DataManagerCache } from './types'

export class DataManagerCacheManager {
  private cache: DataManagerCache = {
    authors: {},
    categories: {},
    organization: null
  }

  // Author cache operations
  getAuthor(id: string): AuthorBySlugQueryResult | null {
    return this.cache.authors[id] || null
  }

  setAuthor(id: string, author: AuthorBySlugQueryResult): void {
    this.cache.authors[id] = author
  }

  setMultipleAuthors(authors: AuthorBySlugQueryResult[]): void {
    authors.forEach(author => {
      if (author && author._id) {
        this.cache.authors[author._id] = author
      }
    })
  }

  // Category cache operations
  getCategory(id: string): CategoryBySlugQueryResult | null {
    return this.cache.categories[id] || null
  }

  setCategory(id: string, category: CategoryBySlugQueryResult): void {
    this.cache.categories[id] = category
  }

  setMultipleCategories(categories: CategoryBySlugQueryResult[]): void {
    categories.forEach(category => {
      if (category && category._id) {
        this.cache.categories[category._id] = category
      }
    })
  }

  // Organization cache operations
  getOrganization(): OrganizationQueryResult | null {
    return this.cache.organization
  }

  setOrganization(organization: OrganizationQueryResult): void {
    this.cache.organization = organization
  }

  // Utility methods
  hasAuthor(id: string): boolean {
    return id in this.cache.authors
  }

  hasCategory(id: string): boolean {
    return id in this.cache.categories
  }

  hasOrganization(): boolean {
    return this.cache.organization !== null
  }

  // Get missing IDs for batch queries
  getMissingAuthorIds(ids: string[]): string[] {
    return ids.filter(id => !this.hasAuthor(id))
  }

  getMissingCategoryIds(ids: string[]): string[] {
    return ids.filter(id => !this.hasCategory(id))
  }

  // Debug methods
  getCacheStats() {
    return {
      authors: Object.keys(this.cache.authors).length,
      categories: Object.keys(this.cache.categories).length,
      hasOrganization: this.hasOrganization()
    }
  }

  clear(): void {
    this.cache = {
      authors: {},
      categories: {},
      organization: null
    }
  }
} 