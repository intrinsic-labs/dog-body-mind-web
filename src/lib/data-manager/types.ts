import { Post, Author, Category, Organization } from '../sanity.types'

// Resolved data types (what DataManager methods return)
export interface ResolvedPost {
  post: Post;
  author: Author;
  category: Category | null; // Category is optional on posts
  organization: Organization;
}

export interface ResolvedAuthor {
  author: Author;
  // Future: could include resolved references if authors reference other entities
}

export interface ResolvedCategory {
  category: Category;
  parent: Category | null; // Parent category if it exists
}

// Reference resolution types
export interface ReferenceRequest {
  id: string;
  type: 'author' | 'category' | 'organization';
}

export interface ResolvedReference {
  id: string;
  type: 'author' | 'category' | 'organization';
  data: Author | Category | Organization | null;
}

// Cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface DataManagerCache {
  authors: Record<string, Author>;
  categories: Record<string, Category>;
  organization: Organization | null;
}

// DataManager interface contract
export interface IDataManager {
  // Core initialization
  initialize(): Promise<void>;
  
  // Post operations
  getPost(slug: string): Promise<ResolvedPost>;
  getAllPosts(): Promise<Post[]>;
  
  // Author operations
  getPostAuthor(authorId: string): Promise<Author>;
  getAllAuthors(): Promise<Author[]>;
  
  // Category operations  
  getPostCategory(categoryId: string): Promise<Category>;
  getAllCategories(): Promise<Category[]>;
  getCategoryChildren(parentId: string): Promise<Category[]>;
  
  // Organization operations
  getOrganization(): Promise<Organization>;
  
  // Batch operations
  getMultipleReferences(requests: ReferenceRequest[]): Promise<ResolvedReference[]>;
}

// Error types
export class DataManagerError extends Error {
  constructor(
    message: string,
    public readonly type: 'MISSING_REFERENCE' | 'QUERY_FAILED' | 'INVALID_LANGUAGE',
    public readonly details?: any
  ) {
    super(message);
    this.name = 'DataManagerError';
  }
}

// Language type
export type SupportedLanguage = 'en' | 'uk' | 'de' | 'fr' | 'es' | 'it'; 