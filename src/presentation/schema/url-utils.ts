/**
 * URL Utility Functions for Schema.org Generation
 * 
 * Simplified version with only essential utilities for basic schema generation.
 */

import type { SupportedLanguage } from '../../application/data-manager/types'

/**
 * Options for generating URLs
 */
interface URLGenerationOptions {
  baseUrl: string
  language: SupportedLanguage
  slug: string
  type: 'post' | 'author' | 'category' | 'page'
}

/**
 * Generate a canonical URL for a specific content type and slug
 */
export function generateCanonicalUrl(options: URLGenerationOptions): string {
  const { baseUrl, language, slug, type } = options
  
  // Ensure baseUrl has proper protocol
  let cleanBaseUrl = baseUrl.replace(/\/$/, '')
  if (!cleanBaseUrl.startsWith('http://') && !cleanBaseUrl.startsWith('https://')) {
    // Handle common case where protocol separator is missing
    if (cleanBaseUrl.startsWith('https:')) {
      cleanBaseUrl = cleanBaseUrl.replace('https:', 'https://')
    } else if (cleanBaseUrl.startsWith('http:')) {
      cleanBaseUrl = cleanBaseUrl.replace('http:', 'http://')
    } else {
      // Default to https if no protocol specified
      cleanBaseUrl = `https://${cleanBaseUrl}`
    }
  }
  
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