import { client, urlForImage } from "@/sanity/client";
import { type SanityDocument as NextSanityDocument } from "next-sanity";
import { PortableTextBlock } from '@portabletext/types';

// Types for blog data
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: PortableTextBlock[];
  coverImage: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readingTime: string;
  category: string;
  tags: string[];
  featured?: boolean;
}

// Interface for BlogHero data
export interface BlogHeroData {
  title: string;
  description: string;
  announcement?: string;
  announcementLink?: string;
}

// Helper function to calculate reading time from PortableText blocks
function calculateReadingTime(blocks: PortableTextBlock[]): string {
  // Extract text content from blocks
  let textContent = '';
  blocks.forEach(block => {
    // Skip non-text blocks
    if (block._type !== 'block') return;
    
    // Process text spans
    if (block.children) {
      block.children.forEach(child => {
        if (typeof child.text === 'string') {
          textContent += child.text + ' ';
        }
      });
    }
  });
  
  // Calculate reading time based on average reading speed (200 words per minute)
  const wordCount = textContent.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  return `${readingTime} min read`;
}

// Get all blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const POSTS_QUERY = `*[
    _type == "post"
    && defined(slug.current)
  ]|order(publishedAt desc){
    _id,
    title,
    excerpt,
    content,
    "slug": slug.current,
    coverImage,
    "author": {
      "name": author->name,
      "avatar": author->avatar
    },
    publishedAt,
    readingTime,
    category,
    tags,
    featured
  }`;

  const options = { next: { revalidate: 30 } };
  
  const sanityPosts = await client.fetch<NextSanityDocument[]>(POSTS_QUERY, {}, options);
  
  // Transform Sanity documents to our BlogPost type
  const posts: BlogPost[] = sanityPosts.map(post => ({
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: urlForImage(post.coverImage) ?? '',
    author: {
      name: post.author.name,
      avatar: urlForImage(post.author.avatar) ?? ''
    },
    date: new Date(post.publishedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    readingTime: post.readingTime || calculateReadingTime(post.content),
    category: post.category,
    tags: post.tags,
    featured: post.featured || false
  }));
  
  return posts;
}

// Get featured blog posts
export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  const FEATURED_POSTS_QUERY = `*[
    _type == "post"
    && defined(slug.current)
    && featured == true
  ]|order(publishedAt desc){
    _id,
    title,
    excerpt,
    content,
    "slug": slug.current,
    coverImage,
    "author": {
      "name": author->name,
      "avatar": author->avatar
    },
    publishedAt,
    readingTime,
    category,
    tags,
    featured
  }`;

  const options = { next: { revalidate: 30 } };
  
  const sanityPosts = await client.fetch<NextSanityDocument[]>(FEATURED_POSTS_QUERY, {}, options);
  
  // Transform Sanity documents to our BlogPost type
  const posts: BlogPost[] = sanityPosts.map(post => ({
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: urlForImage(post.coverImage) ?? '',
    author: {
      name: post.author.name,
      avatar: urlForImage(post.author.avatar) ?? ''
    },
    date: new Date(post.publishedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    readingTime: post.readingTime || calculateReadingTime(post.content),
    category: post.category,
    tags: post.tags,
    featured: post.featured || false
  }));
  
  return posts;
}

// Get a single blog post by slug
export async function getBlogPost(slug: string): Promise<BlogPost> {
  const SINGLE_POST_QUERY = `*[
    _type == "post"
    && slug.current == $slug
  ][0]{
    _id,
    title,
    excerpt,
    content,
    "slug": slug.current,
    coverImage,
    "author": {
      "name": author->name,
      "avatar": author->avatar
    },
    publishedAt,
    readingTime,
    category,
    tags,
    featured
  }`;

  const options = { next: { revalidate: 30 } };
  
  const post = await client.fetch<NextSanityDocument>(SINGLE_POST_QUERY, { slug }, options);
  
  if (!post) {
    throw new Error(`Blog post with slug "${slug}" not found`);
  }
  
  return {
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: urlForImage(post.coverImage) ?? '',
    author: {
      name: post.author.name,
      avatar: urlForImage(post.author.avatar) ?? ''
    },
    date: new Date(post.publishedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    readingTime: post.readingTime || calculateReadingTime(post.content),
    category: post.category,
    tags: post.tags,
    featured: post.featured || false
  };
}

// Get related blog posts
export async function getRelatedPosts(slug: string, limit: number = 3): Promise<BlogPost[]> {
  const currentPost = await getBlogPost(slug);
  
  // Create a query for related posts by category or matching tags
  const RELATED_POSTS_QUERY = `*[
    _type == "post"
    && slug.current != $slug
    && (category == $category || count((tags)[@ in $tags]) > 0)
  ]|order(publishedAt desc)[0...3]{
    _id,
    title,
    excerpt,
    content,
    "slug": slug.current,
    coverImage,
    "author": {
      "name": author->name,
      "avatar": author->avatar
    },
    publishedAt,
    readingTime,
    category,
    tags,
    featured
  }`;

  const options = { next: { revalidate: 30 } };
  
  const relatedPosts = await client.fetch<NextSanityDocument[]>(
    RELATED_POSTS_QUERY, 
    { 
      slug: slug,
      category: currentPost.category, 
      tags: currentPost.tags
    }, 
    options
  );
  
  // Transform Sanity documents to our BlogPost type
  const posts: BlogPost[] = relatedPosts.map(post => ({
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: urlForImage(post.coverImage) ?? '',
    author: {
      name: post.author.name,
      avatar: urlForImage(post.author.avatar) ?? ''
    },
    date: new Date(post.publishedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    readingTime: post.readingTime || calculateReadingTime(post.content),
    category: post.category,
    tags: post.tags,
    featured: post.featured || false
  }));
  
  // If we don't have enough related posts, add recent posts
  if (posts.length < limit) {
    // Get the IDs of posts we already have
    const existingIds = posts.map(post => post.id);
    
    // For remaining count, use a hardcoded limit
    // This isn't ideal but avoids template literal issues
    const RECENT_POSTS_QUERY = `*[
      _type == "post"
      && slug.current != $slug
      && !(_id in $existingIds)
    ]|order(publishedAt desc)[0...3]{
      _id,
      title,
      excerpt,
      content,
      "slug": slug.current,
      coverImage,
      "author": {
        "name": author->name,
        "avatar": author->avatar
      },
      publishedAt,
      readingTime,
      category,
      tags,
      featured
    }`;
    
    const recentPosts = await client.fetch<NextSanityDocument[]>(
      RECENT_POSTS_QUERY, 
      { 
        slug: slug,
        existingIds: existingIds
      }, 
      options
    );
    
    const recentPostsMapped = recentPosts.map(post => ({
      id: post._id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: urlForImage(post.coverImage) ?? '',
      author: {
        name: post.author.name,
        avatar: urlForImage(post.author.avatar) ?? ''
      },
      date: new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      readingTime: post.readingTime || calculateReadingTime(post.content),
      category: post.category,
      tags: post.tags,
      featured: post.featured || false
    }));
    
    // Only take what we need to reach the limit
    return [...posts, ...recentPostsMapped.slice(0, limit - posts.length)];
  }
  
  // Slice to ensure we only return the requested number
  return posts.slice(0, limit);
}

// Get blog posts by category
export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  const CATEGORY_POSTS_QUERY = `*[
    _type == "post"
    && defined(slug.current)
    && category == $category
  ]|order(publishedAt desc){
    _id,
    title,
    excerpt,
    content,
    "slug": slug.current,
    coverImage,
    "author": {
      "name": author->name,
      "avatar": author->avatar
    },
    publishedAt,
    readingTime,
    category,
    tags,
    featured
  }`;

  const options = { next: { revalidate: 30 } };
  
  const sanityPosts = await client.fetch<NextSanityDocument[]>(CATEGORY_POSTS_QUERY, { category }, options);
  
  // Transform Sanity documents to our BlogPost type
  const posts: BlogPost[] = sanityPosts.map(post => ({
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: urlForImage(post.coverImage) ?? '',
    author: {
      name: post.author.name,
      avatar: urlForImage(post.author.avatar) ?? ''
    },
    date: new Date(post.publishedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    readingTime: post.readingTime || calculateReadingTime(post.content),
    category: post.category,
    tags: post.tags,
    featured: post.featured || false
  }));
  
  return posts;
}

// Get blog posts by tag
export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  const TAG_POSTS_QUERY = `*[
    _type == "post"
    && defined(slug.current)
    && $tagName in tags
  ]|order(publishedAt desc){
    _id,
    title,
    excerpt,
    content,
    "slug": slug.current,
    coverImage,
    "author": {
      "name": author->name,
      "avatar": author->avatar
    },
    publishedAt,
    readingTime,
    category,
    tags,
    featured
  }`;

  const options = { next: { revalidate: 30 } };
  
  const sanityPosts = await client.fetch<NextSanityDocument[]>(
    TAG_POSTS_QUERY, 
    { tagName: tag },
    options
  );
  
  // Transform Sanity documents to our BlogPost type
  const posts: BlogPost[] = sanityPosts.map(post => ({
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: urlForImage(post.coverImage) ?? '',
    author: {
      name: post.author.name,
      avatar: urlForImage(post.author.avatar) ?? ''
    },
    date: new Date(post.publishedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    readingTime: post.readingTime || calculateReadingTime(post.content),
    category: post.category,
    tags: post.tags,
    featured: post.featured || false
  }));
  
  return posts;
}

// Get all categories
export async function getAllCategories(): Promise<string[]> {
  const CATEGORIES_QUERY = `array::unique(*[
    _type == "post" 
    && defined(category)
  ].category)`;

  const options = { next: { revalidate: 30 } };
  
  const categories = await client.fetch<string[]>(CATEGORIES_QUERY, {}, options);
  return categories;
}

// Get all tags
export async function getAllTags(): Promise<string[]> {
  const TAGS_QUERY = `array::unique(*[
    _type == "post" 
    && defined(tags)
  ].tags[])`; 

  const options = { next: { revalidate: 30 } };
  
  const tags = await client.fetch<string[]>(TAGS_QUERY, {}, options);
  return tags;
}

// Search blog posts
export async function searchBlogPosts(query: string): Promise<BlogPost[]> {
  // Create a GROQ query with proper parameter usage
  const SEARCH_QUERY = `*[
    _type == "post"
    && defined(slug.current)
    && (
      title match $searchPattern ||
      excerpt match $searchPattern ||
      content match $searchPattern ||
      category match $searchPattern
    )
  ]|order(publishedAt desc){
    _id,
    title,
    excerpt,
    content,
    "slug": slug.current,
    coverImage,
    "author": {
      "name": author->name,
      "avatar": author->avatar
    },
    publishedAt,
    readingTime,
    category,
    tags,
    featured
  }`;

  const options = { next: { revalidate: 30 } };
  const searchPattern = `*${query.toLowerCase()}*`;
  
  // Pass the parameters as an object
  const sanityPosts = await client.fetch<NextSanityDocument[]>(
    SEARCH_QUERY, 
    { searchPattern }, 
    options
  );
  
  // Transform Sanity documents to our BlogPost type
  const posts: BlogPost[] = sanityPosts.map(post => ({
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: urlForImage(post.coverImage) ?? '',
    author: {
      name: post.author.name,
      avatar: urlForImage(post.author.avatar) ?? ''
    },
    date: new Date(post.publishedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    readingTime: post.readingTime || calculateReadingTime(post.content),
    category: post.category,
    tags: post.tags,
    featured: post.featured || false
  }));
  
  return posts;
}

// Get blog hero data
export async function getBlogHero(): Promise<BlogHeroData | null> {
  const BLOG_HERO_QUERY = `*[_type == "blogHero"][0]{
    title,
    description,
    announcement,
    announcementLink
  }`;

  const options = { next: { revalidate: 30 } };
  
  try {
    const blogHero = await client.fetch<NextSanityDocument>(BLOG_HERO_QUERY, {}, options);
    
    if (!blogHero) {
      return null;
    }
    
    return {
      title: blogHero.title,
      description: blogHero.description,
      announcement: blogHero.announcement || undefined,
      announcementLink: blogHero.announcementLink || undefined
    };
  } catch (error) {
    console.error('Error fetching blog hero data:', error);
    return null;
  }
} 