/**
 * Schema.org TypeScript Interfaces
 * 
 * These interfaces define the structure for Schema.org markup generation.
 * All schema generators should use these types for consistency and type safety.
 */

// Base interface that all schema markup should extend
export interface SchemaMarkup {
  '@context': 'https://schema.org'
  '@type': string | string[]
  '@id'?: string
  [key: string]: unknown
}

// Core schema types for articles and content
export interface ArticleSchema extends SchemaMarkup {
  '@type': 'Article' | 'BlogPosting' | 'NewsArticle' | 'TechnicalArticle' | 'MedicalScholarlyArticle'
  '@id': string
  headline: string
  name: string
  description: string
  articleBody: string
  articleSection: string
  wordCount?: number
  datePublished: string
  dateModified: string
  author: PersonSchema | PersonSchema[]
  publisher: OrganizationSchema
  image: ImageObjectSchema | ImageObjectSchema[]
  url: string
  mainEntityOfPage: WebPageReferenceSchema
  keywords?: string
  about?: ThingSchema[]
  audience?: AudienceSchema[]
  timeRequired?: string
  inLanguage: string
  // E-E-A-T signals
  reviewedBy?: PersonSchema
  dateReviewed?: string
  // Medical article specific
  medicallyReviewed?: boolean
}

// Person schema for authors and reviewers
export interface PersonSchema extends SchemaMarkup {
  '@type': 'Person'
  '@id': string
  name: string
  url?: string
  jobTitle?: string
  description?: string
  image?: ImageObjectSchema
  knowsAbout?: string[]
  worksFor?: OrganizationSchema
  sameAs?: string[]
  email?: string
  hasCredential?: EducationalOccupationalCredentialSchema[]
  alumniOf?: EducationalOrganizationSchema[]
  memberOf?: OrganizationSchema[]
  yearsExperience?: number
}

// Organization schema for publishers and affiliations
export interface OrganizationSchema extends SchemaMarkup {
  '@type': 'Organization' | 'EducationalOrganization' | 'Corporation' | 'NGO' | 'LocalBusiness' | 'ProfessionalService'
  '@id': string
  name: string
  legalName?: string
  description?: string
  url: string
  logo: ImageObjectSchema
  foundingDate?: string
  contactPoint?: ContactPointSchema
  address?: PostalAddressSchema
  sameAs?: string[]
}

// Image schema for all images
export interface ImageObjectSchema extends SchemaMarkup {
  '@type': 'ImageObject'
  '@id': string
  url: string
  contentUrl: string
  width?: number
  height?: number
  caption?: string
  inLanguage?: string
  representativeOfPage?: boolean
}

// FAQ schema for rich snippets
export interface FAQPageSchema extends SchemaMarkup {
  '@type': 'FAQPage'
  mainEntity: QuestionSchema[]
}

export interface QuestionSchema extends SchemaMarkup {
  '@type': 'Question'
  name: string
  acceptedAnswer: AnswerSchema
}

export interface AnswerSchema extends SchemaMarkup {
  '@type': 'Answer'
  text: string
}

// HowTo schema for instructional content
export interface HowToSchema extends SchemaMarkup {
  '@type': 'HowTo'
  name: string
  description?: string
  totalTime?: string
  supply?: HowToSupplySchema[]
  tool?: HowToToolSchema[]
  step: HowToStepSchema[]
}

export interface HowToStepSchema extends SchemaMarkup {
  '@type': 'HowToStep'
  position: number
  name: string
  text: string
  image?: ImageObjectSchema
  url?: string
}

export interface HowToSupplySchema extends SchemaMarkup {
  '@type': 'HowToSupply'
  name: string
}

export interface HowToToolSchema extends SchemaMarkup {
  '@type': 'HowToTool'
  name: string
}

// Breadcrumb schema for navigation
export interface BreadcrumbListSchema extends SchemaMarkup {
  '@type': 'BreadcrumbList'
  itemListElement: ListItemSchema[]
}

export interface ListItemSchema extends SchemaMarkup {
  '@type': 'ListItem'
  position: number
  name: string
  item: string
}

// WebPage and WebSite schemas
export interface WebPageSchema extends SchemaMarkup {
  '@type': 'WebPage'
  '@id': string
  name: string
  description: string
  url: string
  isPartOf: WebSiteSchema
  potentialAction?: SearchActionSchema
  primaryImageOfPage?: ImageObjectSchema
}

export interface WebSiteSchema extends SchemaMarkup {
  '@type': 'WebSite'
  '@id': string
  name: string
  description: string
  url: string
  publisher: OrganizationSchema
}

export interface SearchActionSchema extends SchemaMarkup {
  '@type': 'SearchAction'
  target: string
  'query-input': string
}

// Supporting schemas
export interface ThingSchema extends SchemaMarkup {
  '@type': 'Thing'
  name: string
  url?: string
  sameAs?: string
}

export interface AudienceSchema extends SchemaMarkup {
  '@type': 'Audience'
  audienceType: string
}

export interface EducationalOccupationalCredentialSchema extends SchemaMarkup {
  '@type': 'EducationalOccupationalCredential'
  name: string
  credentialCategory?: string
  recognizedBy?: OrganizationSchema | EducationalOrganizationSchema
  dateCreated?: string
  expires?: string
  educationalLevel?: string
  about?: string
}

export interface EducationalOrganizationSchema extends SchemaMarkup {
  '@type': 'EducationalOrganization'
  name: string
  url?: string
}

export interface ContactPointSchema extends SchemaMarkup {
  '@type': 'ContactPoint'
  email?: string
  telephone?: string
  contactType: string
}

export interface PostalAddressSchema extends SchemaMarkup {
  '@type': 'PostalAddress'
  streetAddress?: string
  addressLocality?: string
  addressRegion?: string
  postalCode?: string
  addressCountry?: string
}

export interface WebPageReferenceSchema extends SchemaMarkup {
  '@type': 'WebPage'
  '@id': string
}

// Multi-schema wrapper using @graph notation
export interface MultiSchemaMarkup extends SchemaMarkup {
  '@graph': SchemaMarkup[]
}

// Utility types for URL generation
export interface URLGenerationOptions {
  baseUrl: string
  language: string
  slug: string
  type: 'post' | 'author' | 'category' | 'page'
}

// Error types for schema generation
export class SchemaGenerationError extends Error {
  constructor(
    message: string,
    public readonly schemaType: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SchemaGenerationError';
  }
} 