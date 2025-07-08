import { 
  PostBySlugQueryResult,
  AllPostsQueryResult,
  AuthorBySlugQueryResult,
  AllAuthorsQueryResult,
  CategoryBySlugQueryResult,
  AllCategoriesQueryResult,
  OrganizationQueryResult
} from '../sanity.types'

// Resolved data types (what DataManager methods return)
// These contain query result types with document references resolved
export interface PostWithReferences {
  post: PostBySlugQueryResult;
  author: AuthorBySlugQueryResult;
  primaryCategory: CategoryBySlugQueryResult | null; // First category = primary
  categories: CategoryBySlugQueryResult[]; // All categories resolved
  organization: OrganizationQueryResult;
}

export interface AuthorWithReferences {
  author: AuthorBySlugQueryResult;
  // Future: could include resolved references if authors reference other entities
  // for something like an Author detail page
}

export interface CategoryWithParent {
  category: CategoryBySlugQueryResult;
  parent: CategoryBySlugQueryResult | null; // Parent category if it exists
}

// Reference resolution types
export interface ReferenceRequest {
  id: string;
  type: 'author' | 'category' | 'organization';
}

export interface ResolvedReference {
  id: string;
  type: 'author' | 'category' | 'organization';
  data: AuthorBySlugQueryResult | CategoryBySlugQueryResult | OrganizationQueryResult | null;
}

// Cache types - now stores query result types for consistency
export interface DataManagerCache {
  authors: Record<string, AuthorBySlugQueryResult>;
  categories: Record<string, CategoryBySlugQueryResult>;
  organization: OrganizationQueryResult | null;
}

// Note: CacheEntry is not used in the current implementation.
// For future use when TTL is set up if needed
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// DataManager interface contract
export interface IDataManager {
  // Core initialization
  initialize(): Promise<void>;
  
  // Post operations
  getPost(slug: string): Promise<PostWithReferences>;
  getAllPosts(): Promise<AllPostsQueryResult>;
  
  // Author operations
  getPostAuthor(authorId: string): Promise<AuthorBySlugQueryResult>;
  getAllAuthors(): Promise<AllAuthorsQueryResult>;
  
  // Category operations  
  getPostCategory(categoryId: string): Promise<CategoryBySlugQueryResult>;
  getCategoryWithParent(categoryId: string): Promise<CategoryWithParent>;
  getAllCategories(): Promise<AllCategoriesQueryResult>;
  getCategoryChildren(parentId: string): Promise<CategoryBySlugQueryResult[]>;
  
  // Organization operations
  getOrganization(): Promise<OrganizationQueryResult>;
  
  // Batch operations
  getMultipleReferences(requests: ReferenceRequest[]): Promise<ResolvedReference[]>;
}

// Error types
export class DataManagerError extends Error {
  constructor(
    message: string,
    public readonly type: 'MISSING_REFERENCE' | 'QUERY_FAILED' | 'INVALID_LANGUAGE',
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DataManagerError';
  }
}

// Language type
export type SupportedLanguage = 'en' | 'uk' | 'de' | 'fr' | 'es' | 'it'; 

// Helper types for extracting single items from array query results
export type PostItem = AllPostsQueryResult[0];
export type AuthorItem = AllAuthorsQueryResult[0];
export type CategoryItem = AllCategoriesQueryResult[0]; 