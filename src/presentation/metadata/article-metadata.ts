/**
 * Article Metadata Generator for OpenGraph, Twitter Cards, and Page Metadata
 * 
 * Generates social media sharing metadata and page metadata for blog posts.
 * Separate from Schema.org generation for better maintainability.
 */

import type { Metadata } from 'next'
import type { PostWithReferences, SupportedLanguage } from '../../application/data-manager/types'

/**
 * Configuration options for article metadata generation
 */
export interface ArticleMetadataOptions {
  language: SupportedLanguage
}

/**
 * Generate complete metadata for article pages including OpenGraph and Twitter Cards
 */
export function generateArticleMetadata(
  postWithReferences: PostWithReferences,
  options: ArticleMetadataOptions
): Metadata {
  const { post, author, organization, primaryCategory } = postWithReferences
  const { language } = options
  
  // Validate required data
  if (!post) {
    throw new Error('Post data is required for metadata generation')
  }
  if (!organization) {
    throw new Error('Organization data is required for metadata generation')
  }
  
  // Generate basic page metadata
  const title = post.metaTitle || `${post.title} | ${organization.name}`
  const description = post.meta || post.excerpt
  
  // Generate image metadata
  const imageUrl = post.coverImage?.asset?.url
  const imageAlt = post.coverImageAlt || post.coverImage?.alt || ''
  const imageWidth = post.coverImage?.asset?.metadata?.dimensions?.width || 1200
  const imageHeight = post.coverImage?.asset?.metadata?.dimensions?.height || 630
  
  return {
    title,
    description,
    
    // OpenGraph metadata for Facebook, LinkedIn, etc.
    openGraph: {
      title: post.title,
      description,
      images: imageUrl ? [{
        url: imageUrl,
        width: imageWidth,
        height: imageHeight,
        alt: imageAlt
      }] : [],
      locale: language,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post._updatedAt,
      authors: author ? [author.name] : [],
      section: primaryCategory?.title,
      tags: post.tags || []
    },
    
    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: imageUrl ? [imageUrl] : [],
      creator: author?.socialLinks?.twitter ? `@${author.socialLinks.twitter.replace(/^@/, '')}` : undefined
    },
    
    // Additional metadata
    keywords: [
      post.focusKeyword,
      ...(post.secondaryKeywords || []),
      ...(post.tags || [])
    ].filter(Boolean).join(', ') || undefined,
    
    // Canonical URL (handled by Next.js automatically, but can be overridden)
    alternates: post.canonicalUrl ? {
      canonical: post.canonicalUrl
    } : undefined,
    
    // Robots directive
    robots: post.noIndex ? 'noindex, nofollow' : 'index, follow'
  }
}

/**
 * Generate metadata for article listing pages (blog index, category pages, etc.)
 */
export function generateArticleListingMetadata(
  title: string,
  description: string,
  organization: NonNullable<PostWithReferences['organization']>,
  language: SupportedLanguage,
  featuredImage?: string
): Metadata {
  return {
    title: `${title} | ${organization.name}`,
    description,
    
    openGraph: {
      title,
      description,
      images: featuredImage ? [{
        url: featuredImage,
        width: 1200,
        height: 630,
        alt: title
      }] : organization.logo?.asset?.url ? [{
        url: organization.logo.asset.url,
        width: organization.logo.asset.metadata?.dimensions?.width || 400,
        height: organization.logo.asset.metadata?.dimensions?.height || 400,
        alt: organization.logo.alt || organization.name
      }] : [],
      locale: language,
      type: 'website'
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: featuredImage ? [featuredImage] : organization.logo?.asset?.url ? [organization.logo.asset.url] : []
    },
    
    robots: 'index, follow'
  }
} 