import { Author, Category, Organization } from '../sanity.types'
import { DataManagerCache } from './types'

export class DataManagerCacheManager {
  private cache: DataManagerCache = {
    authors: {},
    categories: {},
    organization: null
  }

  // Author cache operations
  getAuthor(id: string): Author | null {
    return this.cache.authors[id] || null
  }

  setAuthor(id: string, author: Author): void {
    this.cache.authors[id] = author
  }

  setMultipleAuthors(authors: Author[]): void {
    authors.forEach(author => {
      if (author._id) {
        this.cache.authors[author._id] = author
      }
    })
  }

  // Category cache operations
  getCategory(id: string): Category | null {
    return this.cache.categories[id] || null
  }

  setCategory(id: string, category: Category): void {
    this.cache.categories[id] = category
  }

  setMultipleCategories(categories: Category[]): void {
    categories.forEach(category => {
      if (category._id) {
        this.cache.categories[category._id] = category
      }
    })
  }

  // Organization cache operations
  getOrganization(): Organization | null {
    return this.cache.organization
  }

  setOrganization(organization: Organization): void {
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