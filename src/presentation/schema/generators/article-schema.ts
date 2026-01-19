/**
 * Simple Article Schema.org Generator
 * 
 * Generates basic Article schema markup using schema-dts and DataManager's PostWithReferences data.
 * Uses @graph structure with proper TypeScript types from schema-dts.
 */

import type { PostWithReferences, SupportedLanguage } from '../../../application/data-manager/types'
import type { Graph, Person, Organization, BlogPosting, Thing } from 'schema-dts'
import {
  generateCanonicalUrl,
  generateSchemaId,
  generatePersonId,
  generateOrganizationId
} from '../url-utils'
import {
  generateAllCitationSchemas,
  type Citation
} from './citation-schema'

/**
 * Configuration options for article schema generation
 */
export interface ArticleSchemaOptions {
  /** Base URL from organization data */
  baseUrl: string
  /** Language for URL generation and content marking */
  language: SupportedLanguage
}

/**
 * Generate basic article schema markup using @graph structure
 */
export function generateArticleSchema(
  postWithReferences: PostWithReferences,
  options: ArticleSchemaOptions
): Graph {
  const { baseUrl, language } = options
  
  // Validate we have the required data
  if (!postWithReferences.post) {
    throw new Error('Post data is required')
  }
  if (!postWithReferences.author) {
    throw new Error('Author data is required')
  }
  if (!postWithReferences.organization) {
    throw new Error('Organization data is required')
  }

  const { post, author, organization, primaryCategory } = postWithReferences
  
  // Generate URLs and IDs
  const articleUrl = generateCanonicalUrl({
    baseUrl,
    language,
    slug: post.slug.current,
    type: 'post'
  })
  
  const articleId = generateSchemaId(baseUrl, language, post.slug.current, 'post', 'article')
  const authorId = generatePersonId(baseUrl, language, author.slug.current)
  const organizationId = generateOrganizationId(baseUrl)

  // Build Article schema
  const articleSchema: BlogPosting = {
    '@type': 'BlogPosting',
    '@id': articleId,
    headline: post.title,
    name: post.title,
    description: post.excerpt,
    articleSection: primaryCategory?.title || undefined,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt,
    author: { '@id': authorId },
    publisher: { '@id': organizationId },
    url: articleUrl,
    inLanguage: language
  }
  
  // Add word count if available
  if (post.wordCount) {
    articleSchema.wordCount = post.wordCount
  }
  
  // Add reading time if available
  if (post.readingTime) {
    articleSchema.timeRequired = `PT${post.readingTime}M` // ISO 8601 duration format
  }

  // Add cover image if present
  if (post.coverImage?.asset?.url) {
    articleSchema.image = post.coverImage.asset.url
  }

  // Add citations if present
  if (post.references && post.references.length > 0) {
    // Link to citation schemas by their IDs
    articleSchema.citation = post.references.map((_, index) => ({
      '@id': `#citation-${index + 1}`
    }))
  }

  // Build Author schema
  const authorUrl = generateCanonicalUrl({
    baseUrl,
    language,
    slug: author.slug.current,
    type: 'author'
  })
  
  const authorSchema: Person = {
    '@type': 'Person',
    '@id': authorId,
    name: author.name,
    url: authorUrl
  }

  // Add author bio if present
  if (author.bio) {
    authorSchema.description = author.bio
  }

  // Add author job title if present
  if (author.jobTitle) {
    authorSchema.jobTitle = author.jobTitle
  }

  // Add author image if present
  if (author.avatar?.asset?.url) {
    authorSchema.image = author.avatar.asset.url
  }
  
  // Add author credentials for E-E-A-T if available
  if (author.credentials && author.credentials.length > 0) {
    authorSchema.hasCredential = author.credentials.map(cred => ({
      '@type': 'EducationalOccupationalCredential',
      name: cred.name,
      credentialCategory: cred.issuingOrganization,
      url: cred.url || undefined
    }))
  }

  // Build Organization schema
  // Ensure organization URL has proper protocol
  let orgUrl = organization.url
  if (!orgUrl.startsWith('http://') && !orgUrl.startsWith('https://')) {
    if (orgUrl.startsWith('https:')) {
      orgUrl = orgUrl.replace('https:', 'https://')
    } else if (orgUrl.startsWith('http:')) {
      orgUrl = orgUrl.replace('http:', 'http://')
    } else {
      orgUrl = `https://${orgUrl}`
    }
  }
  
  const organizationSchema: Organization = {
    '@type': 'Organization',
    '@id': organizationId,
    name: organization.name,
    url: orgUrl
  }

  // Add organization description if present
  if (organization.description) {
    organizationSchema.description = organization.description
  }

  // Add organization logo if present
  if (organization.logo?.asset?.url) {
    organizationSchema.logo = organization.logo.asset.url
  }

  // Generate citation schemas if references exist
  const graphItems: Thing[] = [
    articleSchema,
    authorSchema,
    organizationSchema
  ]

  // Add citation schemas to the graph
  if (post.references && post.references.length > 0) {
    // Cast references to Citation type (they match the structure from Sanity)
    const citations = post.references as unknown as Citation[]
    const { citationSchemas, authorSchemas } = generateAllCitationSchemas(citations)

    // Add citation schemas
    graphItems.push(...citationSchemas)

    // Add citation author schemas
    graphItems.push(...authorSchemas)
  }

  // Return the complete schema graph
  return {
    '@context': 'https://schema.org',
    '@graph': graphItems
  }
} 