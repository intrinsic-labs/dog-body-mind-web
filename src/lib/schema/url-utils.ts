/**
 * URL Utility Functions for Schema.org Generation
 * 
 * These utilities generate consistent URLs for all schema markup.
 * Base URL is sourced from the organization data via DataManager.
 */

import type { SupportedLanguage } from '../data-manager/types'
import type { URLGenerationOptions } from './types'

/**
 * Generate a canonical URL for a specific content type and slug
 */
export function generateCanonicalUrl(options: URLGenerationOptions): string {
  const { baseUrl, language, slug, type } = options
  
  // Remove trailing slash from base URL if present
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  
  // Generate the path based on content type
  let path: string
  
  switch (type) {
    case 'post':
      path = `/${language}/blog/${slug}`
      break
    case 'author':
      path = `/${language}/authors/${slug}`
      break
    case 'category':
      path = `/${language}/categories/${slug}`
      break
    case 'page':
      path = `/${language}/${slug}`
      break
    default:
      throw new Error(`Unsupported URL type: ${type}`)
  }
  
  return `${cleanBaseUrl}${path}`
}

/**
 * Generate a schema.org @id URL for content identification
 * Uses # fragment for schema identification as per best practices
 */
export function generateSchemaId(
  baseUrl: string,
  language: SupportedLanguage,
  slug: string,
  type: 'post' | 'author' | 'category' | 'page',
  fragment?: string
): string {
  const canonicalUrl = generateCanonicalUrl({
    baseUrl,
    language,
    slug,
    type
  })
  
  // Add fragment for specific schema identification
  const schemaFragment = fragment || type
  return `${canonicalUrl}#${schemaFragment}`
}

/**
 * Generate a WebPage @id URL for mainEntityOfPage references
 */
export function generateWebPageId(
  baseUrl: string,
  language: SupportedLanguage,
  slug: string,
  type: 'post' | 'author' | 'category' | 'page'
): string {
  return generateSchemaId(baseUrl, language, slug, type, 'webpage')
}

/**
 * Generate organization @id URL - consistent across all pages
 */
export function generateOrganizationId(baseUrl: string): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  return `${cleanBaseUrl}#organization`
}

/**
 * Generate person @id URL for authors
 */
export function generatePersonId(
  baseUrl: string,
  language: SupportedLanguage,
  authorSlug: string
): string {
  return generateSchemaId(baseUrl, language, authorSlug, 'author', 'person')
}

/**
 * Generate image @id URL for images
 */
export function generateImageId(
  baseUrl: string,
  imageUrl: string,
  context?: string
): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  
  // Extract a meaningful identifier from the Sanity image URL
  // Sanity URLs look like: https://cdn.sanity.io/images/{projectId}/{dataset}/filename-hash.extension
  const urlParts = imageUrl.split('/')
  const filename = urlParts[urlParts.length - 1]
  const imageId = filename.split('.')[0] // Remove extension
  
  // Include context if provided (e.g., 'cover', 'author-photo')
  const contextSuffix = context ? `-${context}` : ''
  return `${cleanBaseUrl}#image-${imageId}${contextSuffix}`
}

/**
 * Generate WebSite @id URL - consistent across all pages
 */
export function generateWebSiteId(baseUrl: string): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  return `${cleanBaseUrl}#website`
}

/**
 * Validate that a URL is properly formatted
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Extract the domain from a URL for sameAs and other cross-references
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    throw new Error(`Invalid URL provided: ${url}`)
  }
}

/**
 * Generate search action target URL for WebSite schema
 */
export function generateSearchActionTarget(
  baseUrl: string,
  language: SupportedLanguage
): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  return `${cleanBaseUrl}/${language}/search?q={search_term_string}`
} 