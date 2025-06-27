/**
 * Article Schema.org Generator
 * 
 * Generates comprehensive Article schema markup from DataManager's ResolvedPost data.
 * Includes ArticleSchema with supporting Person, Organization, and ImageObject schemas.
 */

import type { ResolvedPost, SupportedLanguage } from '../../data-manager/types'
import type { 
  ArticleSchema, 
  PersonSchema, 
  OrganizationSchema, 
  ImageObjectSchema,
  // WebPageReferenceSchema, // TODO: Use when implementing WebPage schema
  MultiSchemaMarkup,
  ThingSchema
} from '../types'
import { SchemaGenerationError } from '../types'
import {
  generateCanonicalUrl,
  generateSchemaId,
  generateWebPageId,
  generateOrganizationId,
  generatePersonId,
  generateImageId,
  generateWebSiteId,
  validateUrl
} from '../url-utils'

/**
 * Configuration options for article schema generation
 */
export interface ArticleSchemaOptions {
  /** Base URL from organization data */
  baseUrl: string
  /** Language for URL generation and content marking */
  language: SupportedLanguage
  /** Override article type (defaults to 'BlogPosting') */
  articleType?: 'Article' | 'BlogPosting' | 'NewsArticle' | 'TechnicalArticle' | 'MedicalScholarlyArticle'
  /** Include word count calculation */
  includeWordCount?: boolean
  /** Include reading time estimation */
  includeReadingTime?: boolean
  /** Include E-E-A-T signals for medical/health content */
  includeMedicalSignals?: boolean
}

/**
 * Generate comprehensive article schema markup using @graph structure
 */
export function generateArticleSchema(
  resolvedPost: ResolvedPost,
  options: ArticleSchemaOptions
): MultiSchemaMarkup {
  const { baseUrl, language, articleType = 'BlogPosting' } = options
  
  // Validate required data
  validateResolvedPost(resolvedPost)
  validateOptions(options)
  
  const { post, author, organization } = resolvedPost
  
  // Generate URLs
  const articleUrl = generateCanonicalUrl({
    baseUrl,
    language,
    slug: post.slug.current,
    type: 'post'
  })
  
  const articleId = generateSchemaId(baseUrl, language, post.slug.current, 'post', 'article')
  const webPageId = generateWebPageId(baseUrl, language, post.slug.current, 'post')
  
  // Build schema components
  const schemas: (ArticleSchema | PersonSchema | OrganizationSchema | ImageObjectSchema)[] = []
  
  // 1. Main Article Schema
  const articleSchema = buildArticleSchema(
    resolvedPost,
    options,
    articleUrl,
    articleId,
    webPageId
  )
  schemas.push(articleSchema)
  
  // 2. Author Person Schema
  const authorSchema = buildAuthorSchema(author, baseUrl, language)
  schemas.push(authorSchema)
  
  // 3. Organization Schema (Publisher)
  const organizationSchema = buildOrganizationSchema(organization, baseUrl)
  schemas.push(organizationSchema)
  
  // 4. Cover Image Schema (if present)
  if (post.coverImage?.asset?.url) {
    const coverImageSchema = buildImageSchema(
      post.coverImage.asset.url,
      baseUrl,
      language,
      {
        alt: post.coverImageAlt,
        caption: post.coverImage.caption, // From the coverImage object
        context: 'cover',
        representativeOfPage: true,
        metadata: post.coverImage.asset.metadata
      }
    )
    schemas.push(coverImageSchema)
  }
  
  // 5. Author Image Schema (if present)
  if (author.avatar?.asset?.url) {
    const authorImageSchema = buildImageSchema(
      author.avatar.asset.url,
      baseUrl,
      language,
      {
        alt: author.avatar.alt,
        context: 'author',
        representativeOfPage: false,
        metadata: author.avatar.asset.metadata
      }
    )
    schemas.push(authorImageSchema)
  }
  
  return {
    '@context': 'https://schema.org',
    '@graph': schemas
  }
}

/**
 * Build the main Article schema
 */
function buildArticleSchema(
  resolvedPost: ResolvedPost,
  options: ArticleSchemaOptions,
  articleUrl: string,
  articleId: string,
  webPageId: string
): ArticleSchema {
  const { post, author, primaryCategory, categories, organization } = resolvedPost
  const { baseUrl, language, articleType = 'BlogPosting' } = options
  
  // Generate supporting URLs
  const authorId = generatePersonId(baseUrl, language, author.slug)
  const organizationId = generateOrganizationId(baseUrl)
  
  // Build base article schema
  const articleSchema: ArticleSchema = {
    '@context': 'https://schema.org',
    '@type': articleType,
    '@id': articleId,
    headline: post.title,
    name: post.title,
    description: post.excerpt || post.metaDescription || '',
    articleSection: primaryCategory.title,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt,
    author: authorId,
    publisher: organizationId,
    url: articleUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': webPageId
    },
    inLanguage: language,
    // Convert body to plain text for articleBody
    articleBody: extractTextFromPortableText(post.body)
  }
  
  // Add cover image if present
  if (post.coverImage?.asset?.url) {
    const coverImageId = generateImageId(baseUrl, post.coverImage.asset.url, 'cover')
    articleSchema.image = coverImageId
  }
  
  // Add optional word count
  if (options.includeWordCount) {
    articleSchema.wordCount = calculateWordCount(post.body)
  }
  
  // Add reading time estimation
  if (options.includeReadingTime) {
    const wordCount = calculateWordCount(post.body)
    const readingTimeMinutes = Math.ceil(wordCount / 200) // Assuming 200 words per minute
    articleSchema.timeRequired = `PT${readingTimeMinutes}M`
  }
  
  // Add keywords from categories
  if (categories.length > 0) {
    articleSchema.keywords = categories.map(cat => cat.title).join(', ')
  }
  
  // Add "about" topics from categories
  if (categories.length > 0) {
    articleSchema.about = categories.map(category => ({
      '@type': 'Thing',
      name: category.title,
      ...(category.description && { description: category.description })
    } as ThingSchema))
  }
  
  // Add medical/health-specific E-E-A-T signals
  if (options.includeMedicalSignals) {
    // Check if content appears to be health/medical related
    const isMedicalContent = isHealthOrMedicalContent(post, categories)
    if (isMedicalContent) {
      articleSchema['@type'] = 'MedicalScholarlyArticle'
      articleSchema.medicallyReviewed = true
      // Add review date (using publication date as fallback)
      articleSchema.dateReviewed = post._updatedAt
    }
  }
  
  return articleSchema
}

/**
 * Build Author Person schema
 */
function buildAuthorSchema(
  author: ResolvedPost['author'],
  baseUrl: string,
  language: SupportedLanguage
): PersonSchema {
  const authorId = generatePersonId(baseUrl, language, author.slug)
  const organizationId = generateOrganizationId(baseUrl)
  
  const personSchema: PersonSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': authorId,
    name: author.name,
    ...(author.bio && { description: author.bio }),
    ...(author.jobTitle && { jobTitle: author.jobTitle }),
    worksFor: organizationId
  }
  
  // Add author image if present
  if (author.image?.asset?.url) {
    const authorImageId = generateImageId(baseUrl, author.image.asset.url, 'author')
    personSchema.image = authorImageId
  }
  
  // Add specialties as knowsAbout
  if (author.specialties && author.specialties.length > 0) {
    personSchema.knowsAbout = author.specialties
  }
  
  // Add author URL if we have a slug
  if (author.slug) {
    personSchema.url = generateCanonicalUrl({
      baseUrl,
      language,
      slug: author.slug,
      type: 'author'
    })
  }
  
  // Add social media links if available
  if (author.socialMedia && author.socialMedia.length > 0) {
    personSchema.sameAs = author.socialMedia
      .filter(social => social.url && validateUrl(social.url))
      .map(social => social.url)
  }
  
  return personSchema
}

/**
 * Build Organization schema
 */
function buildOrganizationSchema(
  organization: ResolvedPost['organization'],
  baseUrl: string
): OrganizationSchema {
  const organizationId = generateOrganizationId(baseUrl)
  
  const orgSchema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId,
    name: organization.name,
    url: baseUrl,
    ...(organization.description && { description: organization.description })
  }
  
  // Add logo
  if (organization.logo?.asset?.url) {
    const logoImageId = generateImageId(baseUrl, organization.logo.asset.url, 'logo')
    orgSchema.logo = {
      '@type': 'ImageObject',
      '@id': logoImageId,
      url: organization.logo.asset.url,
      contentUrl: organization.logo.asset.url
    }
  }
  
  return orgSchema
}

/**
 * Build Image schema
 */
interface ImageSchemaOptions {
  alt?: string
  caption?: string
  context: string
  representativeOfPage: boolean
  metadata?: {
    dimensions?: {
      width?: number
      height?: number
    }
  }
}

function buildImageSchema(
  imageUrl: string,
  baseUrl: string,
  language: SupportedLanguage,
  options: ImageSchemaOptions
): ImageObjectSchema {
  const imageId = generateImageId(baseUrl, imageUrl, options.context)
  
  const imageSchema: ImageObjectSchema = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    '@id': imageId,
    url: imageUrl,
    contentUrl: imageUrl,
    inLanguage: language,
    representativeOfPage: options.representativeOfPage
  }
  
  // Add dimensions if available
  if (options.metadata?.dimensions) {
    if (options.metadata.dimensions.width) {
      imageSchema.width = options.metadata.dimensions.width
    }
    if (options.metadata.dimensions.height) {
      imageSchema.height = options.metadata.dimensions.height
    }
  }
  
  // Add caption/alt text
  if (options.caption || options.alt) {
    imageSchema.caption = options.caption || options.alt
  }
  
  return imageSchema
}

/**
 * Validation functions
 */
function validateResolvedPost(resolvedPost: ResolvedPost): void {
  if (!resolvedPost.post) {
    throw new SchemaGenerationError('Missing post data', 'ArticleSchema')
  }
  
  if (!resolvedPost.author) {
    throw new SchemaGenerationError('Missing author data', 'ArticleSchema')
  }
  
  if (!resolvedPost.organization) {
    throw new SchemaGenerationError('Missing organization data', 'ArticleSchema')
  }
  
  if (!resolvedPost.post.title) {
    throw new SchemaGenerationError('Missing post title', 'ArticleSchema')
  }
  
  if (!resolvedPost.post.publishedAt) {
    throw new SchemaGenerationError('Missing post publication date', 'ArticleSchema')
  }
}

function validateOptions(options: ArticleSchemaOptions): void {
  if (!options.baseUrl) {
    throw new SchemaGenerationError('Missing baseUrl in options', 'ArticleSchema')
  }
  
  if (!validateUrl(options.baseUrl)) {
    throw new SchemaGenerationError('Invalid baseUrl format', 'ArticleSchema', { baseUrl: options.baseUrl })
  }
  
  if (!options.language) {
    throw new SchemaGenerationError('Missing language in options', 'ArticleSchema')
  }
}

/**
 * Utility functions
 */

/**
 * Extract plain text from Portable Text blocks for articleBody
 */
function extractTextFromPortableText(body: unknown): string {
  if (!body || !Array.isArray(body)) {
    return ''
  }
  
  return body
    .filter(block => block._type === 'block' && block.children)
    .map(block => 
      block.children
        .filter((child: { _type: string }) => child._type === 'span')
        .map((child: { text: string }) => child.text)
        .join('')
    )
    .join(' ')
    .trim()
}

/**
 * Calculate word count from Portable Text
 */
function calculateWordCount(body: unknown): number {
  const text = extractTextFromPortableText(body)
  return text.split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Check if content is health/medical related based on categories and content
 */
function isHealthOrMedicalContent(
  post: ResolvedPost['post'], 
  categories: ResolvedPost['categories']
): boolean {
  const healthKeywords = [
    'health', 'medical', 'wellness', 'nutrition', 'fitness', 
    'diet', 'exercise', 'mental health', 'therapy', 'treatment'
  ]
  
  // Check categories
  const categoryTitles = categories.map(cat => cat.title.toLowerCase())
  const hasHealthCategory = categoryTitles.some(title => 
    healthKeywords.some(keyword => title.includes(keyword))
  )
  
  // Check title and excerpt
  const postContent = `${post.title} ${post.excerpt || ''}`.toLowerCase()
  const hasHealthContent = healthKeywords.some(keyword => 
    postContent.includes(keyword)
  )
  
  return hasHealthCategory || hasHealthContent
} 