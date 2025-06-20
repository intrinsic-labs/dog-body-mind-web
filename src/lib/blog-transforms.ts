import { urlForImage } from "@/sanity/client";
import { BlogPost, DisplayPost } from "./blog-types";
import { PortableTextBlock } from '@portabletext/types';

// Helper to calculate reading time from content blocks
function calculateReadingTime(content: PortableTextBlock[]): string {
  let textContent = '';
  
  content.forEach(block => {
    if (block._type !== 'block') return;
    
    if (block.children) {
      block.children.forEach((child) => {
        if ('text' in child && typeof child.text === 'string') {
          textContent += child.text + ' ';
        }
      });
    }
  });
  
  const wordCount = textContent.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  return `${readingTime} min read`;
}

// Helper to format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

// Transform raw Sanity post to display post
export function transformPost(post: BlogPost): DisplayPost {
  return {
    _id: post._id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: urlForImage(post.coverImage) || '',
    coverImageAlt: post.coverImageAlt,
    author: {
      name: post.author.name,
      avatarUrl: post.author.avatar ? urlForImage(post.author.avatar) || undefined : undefined,
      jobTitle: post.author.jobTitle,
      credentials: post.author.credentials,
      specialties: post.author.specialties,
    },
    publishedAt: post.publishedAt,
    formattedDate: formatDate(post.publishedAt),
    readingTime: post.readingTime ? `${post.readingTime} min read` : calculateReadingTime(post.content),
    
    // SEO fields
    metaTitle: post.metaTitle,
    metaDescription: post.meta,
    focusKeyword: post.focusKeyword,
    secondaryKeywords: post.secondaryKeywords,
    articleType: post.articleType,
    articleSection: post.articleSection,
    
    // E-E-A-T
    medicallyReviewed: post.medicallyReviewed,
    medicalReviewer: post.medicalReviewer ? {
      name: post.medicalReviewer.name,
      jobTitle: post.medicalReviewer.jobTitle,
    } : undefined,
    
    // Content
    categories: post.categories,
    tags: post.tags || [],
    targetAudience: post.targetAudience,
    faqs: post.faqs,
    howTo: post.howTo,
    
    // Settings
    featured: post.featured,
    featuredCategory: post.featuredCategory,
    language: post.language,
  };
}

// Transform array of posts
export function transformPosts(posts: BlogPost[]): DisplayPost[] {
  return posts.map(transformPost);
} 