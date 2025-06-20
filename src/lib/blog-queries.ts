import { client } from "@/sanity/client";
import { type SanityDocument } from "next-sanity";

// Base query fragments for reusability
const POST_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  content,
  coverImage,
  coverImageAlt,
  "author": author->{
    _id,
    name,
    "slug": slug.current,
    avatar,
    bio,
    jobTitle,
    credentials,
    specialties,
    yearsExperience,
    email,
    website,
    socialLinks,
    worksFor
  },
  publishedAt,
  lastModified,
  readingTime,
  
  // SEO & Schema fields
  metaTitle,
  meta,
  focusKeyword,
  secondaryKeywords,
  articleType,
  "articleSection": articleSection->{
    _id,
    title,
    "slug": slug.current
  },
  wordCount,
  
  // E-E-A-T fields
  medicallyReviewed,
  medicalReviewer->{
    _id,
    name,
    jobTitle
  },
  reviewDate,
  
  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current,
    description,
    metaDescription,
    featuredImage,
    color
  },
  tags,
  targetAudience,
  
  // Structured content
  faqs,
  howTo,
  
  // Advanced fields
  featured,
  featuredCategory,
  noIndex,
  canonicalUrl,
  language
`;

// Query options for caching
const DEFAULT_OPTIONS = { next: { revalidate: 30 } };

// Get all posts with optional language filter
export async function getAllPosts(language?: string) {
  const languageFilter = language ? `&& language == "${language}"` : '';
  
  const query = `*[
    _type == "post" 
    && defined(slug.current)
    ${languageFilter}
  ] | order(publishedAt desc) {
    ${POST_FIELDS}
  }`;
  
  return client.fetch<SanityDocument[]>(query, {}, DEFAULT_OPTIONS);
}

// Get single post by slug
export async function getPost(slug: string, language?: string) {
  const languageFilter = language ? `&& language == "${language}"` : '';
  
  const query = `*[
    _type == "post" 
    && slug.current == $slug
    ${languageFilter}
  ][0] {
    ${POST_FIELDS}
  }`;
  
  return client.fetch<SanityDocument>(query, { slug }, DEFAULT_OPTIONS);
}

// Get featured posts
export async function getFeaturedPosts(language?: string) {
  const languageFilter = language ? `&& language == "${language}"` : '';
  
  const query = `*[
    _type == "post" 
    && defined(slug.current)
    && featured == true
    ${languageFilter}
  ] | order(publishedAt desc) {
    ${POST_FIELDS}
  }`;
  
  return client.fetch<SanityDocument[]>(query, {}, DEFAULT_OPTIONS);
}

// Get posts by category
export async function getPostsByCategory(categorySlug: string, language?: string) {
  const languageFilter = language ? `&& language == "${language}"` : '';
  
  const query = `*[
    _type == "post" 
    && defined(slug.current)
    && count(categories[slug.current == "${categorySlug}"]) > 0
    ${languageFilter}
  ] | order(publishedAt desc) {
    ${POST_FIELDS}
  }`;
  
  return client.fetch<SanityDocument[]>(query, {}, DEFAULT_OPTIONS);
}

// Get related posts (same categories, excluding current post)
export async function getRelatedPosts(slug: string, limit: number = 3, language?: string) {
  const languageFilter = language ? `&& language == "${language}"` : '';
  
  const query = `*[
    _type == "post" 
    && defined(slug.current)
    && slug.current != $slug
    && count(categories[@._ref in *[_type == "post" && slug.current == $slug][0].categories[]._ref]) > 0
    ${languageFilter}
  ] | order(publishedAt desc) [0...${limit}] {
    ${POST_FIELDS}
  }`;
  
  return client.fetch<SanityDocument[]>(query, { slug }, DEFAULT_OPTIONS);
}

// Get all categories
export async function getAllCategories(language?: string) {
  const languageFilter = language ? `&& language == "${language}"` : '';
  
  const query = `*[
    _type == "category"
    ${languageFilter}
  ] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    metaDescription,
    featuredImage,
    parent,
    color,
    language
  }`;
  
  return client.fetch<SanityDocument[]>(query, {}, DEFAULT_OPTIONS);
}

// Search posts
export async function searchPosts(searchTerm: string, language?: string) {
  const languageFilter = language ? `&& language == "${language}"` : '';
  
  const query = `*[
    _type == "post" 
    && defined(slug.current)
    && (
      title match $searchTerm + "*" ||
      excerpt match $searchTerm + "*" ||
      $searchTerm in tags
    )
    ${languageFilter}
  ] | order(publishedAt desc) {
    ${POST_FIELDS}
  }`;
  
  return client.fetch<SanityDocument[]>(query, { searchTerm }, DEFAULT_OPTIONS);
}

// Get organization for schema markup
export async function getOrganization() {
  const query = `*[_type == "organization"][0] {
    _id,
    name,
    legalName,
    description,
    logo,
    url,
    contactInfo,
    socialProfiles,
    foundingDate,
    organizationType
  }`;
  
  return client.fetch<SanityDocument>(query, {}, DEFAULT_OPTIONS);
} 