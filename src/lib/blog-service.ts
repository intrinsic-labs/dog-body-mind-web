import * as queries from './blog-queries';
import { transformPost, transformPosts } from './blog-transforms';
import { DisplayPost, Category, BlogPost } from './blog-types';

// Main service functions that combine queries + transforms
export async function getAllBlogPosts(language?: string): Promise<DisplayPost[]> {
  const posts = await queries.getAllPosts(language);
  return transformPosts(posts as unknown as BlogPost[]);
}

export async function getBlogPost(slug: string, language?: string): Promise<DisplayPost | null> {
  const post = await queries.getPost(slug, language);
  if (!post) return null;
  return transformPost(post as unknown as BlogPost);
}

export async function getFeaturedBlogPosts(language?: string): Promise<DisplayPost[]> {
  const posts = await queries.getFeaturedPosts(language);
  return transformPosts(posts as unknown as BlogPost[]);
}

export async function getBlogPostsByCategory(categorySlug: string, language?: string): Promise<DisplayPost[]> {
  const posts = await queries.getPostsByCategory(categorySlug, language);
  return transformPosts(posts as unknown as BlogPost[]);
}

export async function getRelatedBlogPosts(slug: string, limit: number = 3, language?: string): Promise<DisplayPost[]> {
  const posts = await queries.getRelatedPosts(slug, limit, language);
  return transformPosts(posts as unknown as BlogPost[]);
}

export async function searchBlogPosts(searchTerm: string, language?: string): Promise<DisplayPost[]> {
  const posts = await queries.searchPosts(searchTerm, language);
  return transformPosts(posts as unknown as BlogPost[]);
}

export async function getBlogCategories(language?: string): Promise<Category[]> {
  const categories = await queries.getAllCategories(language);
  return categories as unknown as Category[];
}

// Re-export types for convenience
export type { DisplayPost, Category, BlogPost } from './blog-types'; 