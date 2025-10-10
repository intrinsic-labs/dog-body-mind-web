/**
 * Citation Schema.org Generator
 *
 * Generates schema.org markup for citations based on citation type.
 * Supports: ScholarlyArticle, Book, WebPage, GovernmentDocument, Dataset
 */

import type {
  ScholarlyArticle,
  Book,
  WebPage,
  Dataset,
  Person
} from 'schema-dts'

// Helper type for schema objects with @id
type WithId<T> = T & { '@id': string }

// Helper type for ScholarlyArticle with additional properties not in schema-dts
type ExtendedScholarlyArticle = ScholarlyArticle & {
  volumeNumber?: string
  issueNumber?: string
  pagination?: string
}

/**
 * Citation object structure from Sanity
 */
export interface Citation {
  _key?: string
  citationType: 'scholarlyArticle' | 'book' | 'webPage' | 'governmentDocument' | 'dataset'
  title: string
  authors: string[]
  publicationYear: number
  publisher?: string
  url?: string
  doi?: string
  isbn?: string
  issn?: string
  volume?: string
  issue?: string
  pages?: string
  edition?: string
  accessDate?: string
  seoWeight?: number
  keywordRelevance?: string[]
  internalNote?: string
}

/**
 * Generate schema.org Person entities for authors
 */
function generateAuthorSchemas(authors: string[], citationIndex: number): WithId<Person>[] {
  return authors.map((author, index) => ({
    '@type': 'Person',
    '@id': `#citation-${citationIndex}-author-${index}`,
    name: author
  }))
}

/**
 * Generate ScholarlyArticle schema for peer-reviewed papers
 */
export function generateScholarlyArticleSchema(
  citation: Citation,
  citationIndex: number
): ScholarlyArticle {
  const authorSchemas = generateAuthorSchemas(citation.authors, citationIndex)

  const schema: ExtendedScholarlyArticle = {
    '@type': 'ScholarlyArticle',
    '@id': `#citation-${citationIndex}`,
    headline: citation.title,
    name: citation.title,
    author: authorSchemas.map(a => ({ '@id': a['@id'] })),
    datePublished: citation.publicationYear.toString()
  }

  // Add optional fields
  if (citation.publisher) {
    schema.publisher = {
      '@type': 'Organization',
      name: citation.publisher
    }
  }

  if (citation.url) {
    schema.url = citation.url
  }

  if (citation.doi) {
    schema.identifier = [
      {
        '@type': 'PropertyValue',
        propertyID: 'DOI',
        value: citation.doi
      }
    ]
    // DOI URLs are canonical
    if (!schema.url) {
      schema.url = `https://doi.org/${citation.doi}`
    }
  }

  if (citation.issn) {
    if (!schema.identifier) {
      schema.identifier = []
    }
    if (Array.isArray(schema.identifier)) {
      schema.identifier.push({
        '@type': 'PropertyValue',
        propertyID: 'ISSN',
        value: citation.issn
      })
    }
  }

  if (citation.volume) {
    schema.volumeNumber = citation.volume
  }

  if (citation.issue) {
    schema.issueNumber = citation.issue
  }

  if (citation.pages) {
    schema.pagination = citation.pages
  }

  return schema
}

/**
 * Generate Book schema
 */
export function generateBookSchema(
  citation: Citation,
  citationIndex: number
): Book {
  const authorSchemas = generateAuthorSchemas(citation.authors, citationIndex)

  const schema: Book = {
    '@type': 'Book',
    '@id': `#citation-${citationIndex}`,
    name: citation.title,
    author: authorSchemas.map(a => ({ '@id': a['@id'] })),
    datePublished: citation.publicationYear.toString()
  }

  if (citation.publisher) {
    schema.publisher = {
      '@type': 'Organization',
      name: citation.publisher
    }
  }

  if (citation.url) {
    schema.url = citation.url
  }

  if (citation.isbn) {
    schema.isbn = citation.isbn
  }

  if (citation.edition) {
    schema.bookEdition = citation.edition
  }

  return schema
}

/**
 * Generate WebPage schema (for websites, blogs, etc.)
 */
export function generateWebPageSchema(
  citation: Citation,
  citationIndex: number
): WebPage {
  const authorSchemas = generateAuthorSchemas(citation.authors, citationIndex)

  const schema: WebPage = {
    '@type': 'WebPage',
    '@id': `#citation-${citationIndex}`,
    name: citation.title,
    author: authorSchemas.map(a => ({ '@id': a['@id'] })),
    datePublished: citation.publicationYear.toString()
  }

  if (citation.url) {
    schema.url = citation.url
  }

  if (citation.publisher) {
    schema.publisher = {
      '@type': 'Organization',
      name: citation.publisher
    }
  }

  return schema
}

/**
 * Generate Dataset schema (for research data, statistics)
 */
export function generateDatasetSchema(
  citation: Citation,
  citationIndex: number
): Dataset {
  const authorSchemas = generateAuthorSchemas(citation.authors, citationIndex)

  const schema: Dataset = {
    '@type': 'Dataset',
    '@id': `#citation-${citationIndex}`,
    name: citation.title,
    creator: authorSchemas.map(a => ({ '@id': a['@id'] })),
    datePublished: citation.publicationYear.toString()
  }

  if (citation.url) {
    schema.url = citation.url
  }

  if (citation.publisher) {
    schema.publisher = {
      '@type': 'Organization',
      name: citation.publisher
    }
  }

  if (citation.doi) {
    schema.identifier = {
      '@type': 'PropertyValue',
      propertyID: 'DOI',
      value: citation.doi
    }
  }

  return schema
}

/**
 * Main function: Generate appropriate schema based on citation type
 */
export function generateCitationSchema(
  citation: Citation,
  citationIndex: number
): ScholarlyArticle | Book | WebPage | Dataset {
  switch (citation.citationType) {
    case 'scholarlyArticle':
      return generateScholarlyArticleSchema(citation, citationIndex)

    case 'book':
      return generateBookSchema(citation, citationIndex)

    case 'webPage':
      return generateWebPageSchema(citation, citationIndex)

    case 'governmentDocument':
      // Government documents are treated as WebPage with special publisher
      return generateWebPageSchema(citation, citationIndex)

    case 'dataset':
      return generateDatasetSchema(citation, citationIndex)

    default:
      // Fallback to WebPage
      return generateWebPageSchema(citation, citationIndex)
  }
}

/**
 * Generate all citation schemas and author schemas for a post
 * Returns both the citation schemas and the author person schemas
 */
export function generateAllCitationSchemas(citations: Citation[]): {
  citationSchemas: Array<ScholarlyArticle | Book | WebPage | Dataset>
  authorSchemas: WithId<Person>[]
} {
  const citationSchemas: Array<ScholarlyArticle | Book | WebPage | Dataset> = []
  const authorSchemas: WithId<Person>[] = []

  citations.forEach((citation, index) => {
    // Generate citation schema (1-indexed for display)
    const citationSchema = generateCitationSchema(citation, index + 1)
    citationSchemas.push(citationSchema)

    // Generate author schemas
    const citationAuthorSchemas = generateAuthorSchemas(citation.authors, index + 1)
    authorSchemas.push(...citationAuthorSchemas)
  })

  return {
    citationSchemas,
    authorSchemas
  }
}

/**
 * Calculate citation quality score (0-100)
 * Based on: authority (40), recency (20), completeness (20), relevance (20)
 */
export function calculateCitationQualityScore(citation: Citation): number {
  let score = 0

  // 1. Source Authority (40 points max)
  if (citation.doi) {
    score += 40 // Peer-reviewed with DOI
  } else if (citation.url?.includes('.gov')) {
    score += 35 // Government source
  } else if (citation.url?.includes('.edu')) {
    score += 30 // Academic institution
  } else if (citation.url?.includes('.org')) {
    score += 25 // Organization
  } else {
    score += 15 // Commercial or other
  }

  // 2. Recency (20 points max)
  const currentYear = new Date().getFullYear()
  const age = currentYear - citation.publicationYear

  if (age <= 2) {
    score += 20
  } else if (age <= 5) {
    score += 15
  } else if (age <= 10) {
    score += 10
  } else {
    score += 5
  }

  // 3. Completeness (20 points max)
  let completenessFields = 0
  const requiredFields = ['title', 'authors', 'publicationYear']
  const optionalFields = ['publisher', 'url', 'doi', 'isbn', 'issn', 'volume', 'issue', 'pages']

  // Check required fields (these should always be present due to validation)
  requiredFields.forEach(field => {
    if (citation[field as keyof Citation]) completenessFields++
  })

  // Check optional fields
  optionalFields.forEach(field => {
    if (citation[field as keyof Citation]) completenessFields++
  })

  // Score based on completeness (more fields = better)
  if (completenessFields >= 8) {
    score += 20 // All or most fields complete
  } else if (completenessFields >= 6) {
    score += 15
  } else {
    score += 10
  }

  // 4. Relevance (20 points max) - based on keyword relevance and manual SEO weight
  if (citation.seoWeight) {
    // Convert 1-5 scale to points (0-10)
    score += citation.seoWeight * 2
  }

  if (citation.keywordRelevance && citation.keywordRelevance.length > 0) {
    score += 10 // Has keyword relevance defined
  }

  return Math.min(score, 100) // Cap at 100
}
