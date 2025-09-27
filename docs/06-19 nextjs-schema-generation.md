// ===== SCHEMA GENERATION UTILITIES =====
// utils/schema.ts

import { Post, Author, Organization, Category } from '@/types/sanity'

interface SchemaMarkup {
  '@context': string
  '@type': string | string[]
  [key: string]: any
}

export function generateBlogPostSchema(
  post: Post, 
  author: Author, 
  organization: Organization,
  baseUrl: string
): SchemaMarkup {
  const postUrl = `${baseUrl}/blog/${post.slug.current}`
  const authorUrl = `${baseUrl}/authors/${author.slug.current}`
  
  // Base Article Schema
  const articleSchema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': post.articleType || 'BlogPosting',
    '@id': `${postUrl}#article`,
    headline: post.title,
    name: post.title,
    description: post.excerpt,
    
    // Content & Publishing
    articleBody: extractTextFromBlocks(post.content),
    articleSection: post.articleSection,
    wordCount: post.wordCount || calculateWordCount(post.content),
    
    // Dates
    datePublished: post.publishedAt,
    dateModified: post.lastModified || post.publishedAt,
    
    // Author Information
    author: generateAuthorSchema(author, authorUrl),
    
    // Publisher Information  
    publisher: generatePublisherSchema(organization, baseUrl),
    
    // Image
    image: generateImageSchema(post.coverImage, baseUrl),
    
    // URLs
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl
    },
    
    // Keywords & Topics
    keywords: [
      ...(post.tags || []),
      ...(post.secondaryKeywords || []),
      ...(post.focusKeyword ? [post.focusKeyword] : [])
    ].join(', '),
    
    // Categories/Topics
    about: post.categories?.map(cat => ({
      '@type': 'Thing',
      name: cat.title,
      url: `${baseUrl}/categories/${cat.slug.current}`
    })),
    
    // Audience
    audience: post.targetAudience?.map(audience => ({
      '@type': 'Audience',
      audienceType: audience
    })),
    
    // Reading Time
    timeRequired: post.readingTime ? `PT${post.readingTime}M` : undefined,
    
    // Language
    inLanguage: post.language || 'en'
  }

  // Add medical review information if applicable
  if (post.medicallyReviewed && post.medicalReviewer) {
    articleSchema.reviewedBy = {
      '@type': 'Person',
      name: post.medicalReviewer.name,
      jobTitle: post.medicalReviewer.jobTitle,
      url: `${baseUrl}/authors/${post.medicalReviewer.slug.current}`
    }
    
    if (post.reviewDate) {
      articleSchema.dateReviewed = post.reviewDate
    }
  }

  return articleSchema
}

export function generateAuthorSchema(author: Author, authorUrl: string): SchemaMarkup {
  const schema: SchemaMarkup = {
    '@type': 'Person',
    '@id': `${authorUrl}#person`,
    name: author.name,
    url: authorUrl,
    jobTitle: author.jobTitle,
    description: author.bio,
    
    // Image
    image: author.avatar ? {
      '@type': 'ImageObject',
      url: author.avatar.asset.url,
      caption: author.avatar.alt || author.name
    } : undefined,
    
    // Experience & Expertise
    knowsAbout: author.specialties || [],
    
    // Professional Info
    worksFor: author.worksFor ? {
      '@type': 'Organization',
      name: author.worksFor
    } : undefined,
    
    // Social Profiles
    sameAs: [
      ...(author.sameAs || []),
      ...(author.socialProfiles ? Object.values(author.socialProfiles).filter(Boolean) : [])
    ],
    
    // Contact
    email: author.email,
    url: author.website || authorUrl
  }

  // Add credentials
  if (author.credentials?.length) {
    schema.hasCredential = author.credentials.map(cred => ({
      '@type': 'EducationalOccupationalCredential',
      name: cred.name,
      credentialCategory: 'Professional Certification',
      recognizedBy: {
        '@type': 'Organization',
        name: cred.issuingOrganization,
        url: cred.url
      },
      dateCreated: cred.dateIssued,
      expires: cred.expires
    }))
  }

  // Add education
  if (author.education?.length) {
    schema.alumniOf = author.education.map(edu => ({
      '@type': 'EducationalOrganization',
      name: edu.institution,
      url: edu.url
    }))
    
    schema.hasCredential = [
      ...(schema.hasCredential || []),
      ...author.education.map(edu => ({
        '@type': 'EducationalOccupationalCredential',
        name: edu.degree,
        educationalLevel: 'Graduate',
        about: edu.field,
        recognizedBy: {
          '@type': 'EducationalOrganization',
          name: edu.institution
        }
      }))
    ]
  }

  // Add professional memberships
  if (author.memberOf?.length) {
    schema.memberOf = author.memberOf.map(org => ({
      '@type': 'Organization',
      name: org
    }))
  }

  return schema
}

export function generatePublisherSchema(org: Organization, baseUrl: string): SchemaMarkup {
  return {
    '@type': org.organizationType || 'EducationalOrganization',
    '@id': `${baseUrl}#organization`,
    name: org.name,
    legalName: org.legalName || org.name,
    description: org.description,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: org.logo.asset.url,
      width: org.logo.asset.metadata?.dimensions?.width,
      height: org.logo.asset.metadata?.dimensions?.height
    },
    foundingDate: org.foundingDate,
    contactPoint: org.contactInfo ? {
      '@type': 'ContactPoint',
      email: org.contactInfo.email,
      telephone: org.contactInfo.telephone,
      contactType: 'Customer Service'
    } : undefined,
    address: org.contactInfo?.address ? {
      '@type': 'PostalAddress',
      streetAddress: org.contactInfo.address.streetAddress,
      addressLocality: org.contactInfo.address.addressLocality,
      addressRegion: org.contactInfo.address.addressRegion,
      postalCode: org.contactInfo.address.postalCode,
      addressCountry: org.contactInfo.address.addressCountry
    } : undefined,
    sameAs: org.socialProfiles || []
  }
}

export function generateImageSchema(image: any, baseUrl: string): SchemaMarkup {
  if (!image) return undefined
  
  return {
    '@type': 'ImageObject',
    url: image.asset.url,
    width: image.asset.metadata?.dimensions?.width,
    height: image.asset.metadata?.dimensions?.height,
    caption: image.caption || image.alt,
    description: image.alt
  }
}

export function generateFAQSchema(faqs: any[]): SchemaMarkup | undefined {
  if (!faqs?.length) return undefined
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

export function generateHowToSchema(howTo: any, baseUrl: string): SchemaMarkup | undefined {
  if (!howTo?.steps?.length) return undefined
  
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name || 'How-To Guide',
    description: howTo.description,
    totalTime: howTo.totalTime,
    supply: howTo.supply?.map((item: string) => ({
      '@type': 'HowToSupply',
      name: item
    })),
    tool: howTo.tool?.map((item: string) => ({
      '@type': 'HowToTool',
      name: item
    })),
    step: howTo.steps.map((step: any, index: number) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image ? generateImageSchema(step.image, baseUrl) : undefined,
      url: step.url
    }))
  }
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  }
}

export function generateWebPageSchema(
  title: string,
  description: string,
  url: string,
  organization: Organization,
  baseUrl: string
): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    name: title,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${baseUrl}#website`,
      name: organization.name,
      description: organization.description,
      url: baseUrl,
      publisher: generatePublisherSchema(organization, baseUrl)
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
}

// ===== UTILITY FUNCTIONS =====
function extractTextFromBlocks(blocks: any[]): string {
  if (!blocks) return ''
  
  return blocks
    .filter(block => block._type === 'block')
    .map(block => 
      block.children
        ?.filter((child: any) => child._type === 'span')
        ?.map((span: any) => span.text)
        ?.join('')
    )
    .join(' ')
}

function calculateWordCount(blocks: any[]): number {
  const text = extractTextFromBlocks(blocks)
  return text.split(/\s+/).filter(word => word.length > 0).length
}

// ===== MULTI-SCHEMA GENERATION =====
export function generateMultiSchema(
  post: Post,
  author: Author,
  organization: Organization,
  baseUrl: string
): SchemaMarkup {
  const schemas: SchemaMarkup[] = []
  const postUrl = `${baseUrl}/blog/${post.slug.current}`
  
  // Main Article Schema
  schemas.push(generateBlogPostSchema(post, author, organization, baseUrl))
  
  // FAQ Schema
  if (post.faqs?.length) {
    schemas.push(generateFAQSchema(post.faqs))
  }
  
  // How-To Schema
  if (post.howTo?.steps?.length) {
    schemas.push(generateHowToSchema(post.howTo, baseUrl))
  }
  
  // Breadcrumb Schema
  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: 'Blog', url: `${baseUrl}/blog` }
  ]
  
  if (post.categories?.[0]) {
    breadcrumbs.push({
      name: post.categories[0].title,
      url: `${baseUrl}/categories/${post.categories[0].slug.current}`
    })
  }
  
  breadcrumbs.push({ name: post.title, url: postUrl })
  schemas.push(generateBreadcrumbSchema(breadcrumbs))
  
  // WebPage Schema
  schemas.push(generateWebPageSchema(
    post.metaTitle || post.title,
    post.metaDescription || post.excerpt,
    postUrl,
    organization,
    baseUrl
  ))
  
  // Return as @graph for multiple schemas
  return {
    '@context': 'https://schema.org',
    '@graph': schemas
  }
}

// ===== NEXT.JS COMPONENT INTEGRATION =====
// components/SEOHead.tsx

import Head from 'next/head'
import { Post, Author, Organization } from '@/types/sanity'
import { generateMultiSchema } from '@/utils/schema'

interface SEOHeadProps {
  post?: Post
  author?: Author
  organization: Organization
  baseUrl: string
  
  // Page-specific overrides
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  noIndex?: boolean
  canonicalUrl?: string
  
  // Multilingual
  hreflangUrls?: Record<string, string>
}

export default function SEOHead({
  post,
  author,
  organization,
  baseUrl,
  title,
  description,
  image,
  url,
  type = 'website',
  noIndex = false,
  canonicalUrl,
  hreflangUrls
}: SEOHeadProps) {
  // Determine final values
  const finalTitle = post?.metaTitle || post?.title || title || organization.name
  const finalDescription = post?.metaDescription || post?.excerpt || description || organization.description
  const finalImage = post?.coverImage?.asset?.url || image || organization.logo?.asset?.url
  const finalUrl = url || baseUrl
  const finalCanonical = post?.canonicalUrl || canonicalUrl || finalUrl
  
  // Generate schema markup
  const schemaMarkup = post && author 
    ? generateMultiSchema(post, author, organization, baseUrl)
    : null

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <link rel="canonical" href={finalCanonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:site_name" content={organization.name} />
      {finalImage && <meta property="og:image" content={finalImage} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {finalImage && <meta name="twitter:image" content={finalImage} />}
      
      {/* Article-specific meta */}
      {post && (
        <>
          <meta property="article:published_time" content={post.publishedAt} />
          <meta property="article:modified_time" content={post.lastModified || post.publishedAt} />
          <meta property="article:author" content={author?.name} />
          <meta property="article:section" content={post.articleSection} />
          {post.tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Hreflang for International SEO */}
      {hreflangUrls && Object.entries(hreflangUrls).map(([lang, langUrl]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={langUrl} />
      ))}
      
      {/* Schema.org JSON-LD */}
      {schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaMarkup)
          }}
        />
      )}
      
      {/* Additional SEO enhancements */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Language" content={post?.language || 'en'} />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://cdn.sanity.io" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      
      {/* RSS Feed */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${organization.name} RSS Feed`}
        href={`${baseUrl}/feed.xml`}
      />
    </Head>
  )
}

// ===== USAGE EXAMPLE =====
// pages/blog/[slug].tsx

import { GetStaticProps, GetStaticPaths } from 'next'
import SEOHead from '@/components/SEOHead'
import { generateMultiSchema } from '@/utils/schema'

export default function BlogPost({ post, author, organization, baseUrl }: any) {
  const hreflangUrls = {
    'en': `${baseUrl}/blog/${post.slug.current}`,
    'en-GB': `${baseUrl}/en-gb/blog/${post.slug.current}`,
    'de': `${baseUrl}/de/blog/${post.slug.current}`,
    'fr': `${baseUrl}/fr/blog/${post.slug.current}`,
    'es': `${baseUrl}/es/blog/${post.slug.current}`,
    'it': `${baseUrl}/it/blog/${post.slug.current}`,
    'x-default': `${baseUrl}/blog/${post.slug.current}`
  }

  return (
    <>
      <SEOHead
        post={post}
        author={author}
        organization={organization}
        baseUrl={baseUrl}
        type="article"
        noIndex={post.noIndex}
        hreflangUrls={hreflangUrls}
      />
      
      {/* Your blog post content */}
      <article>
        <h1>{post.title}</h1>
        {/* Rest of your content */}
      </article>
    </>
  )
}

// ===== SANITY QUERY UPDATES =====
// lib/sanity/queries.ts

export const blogPostQuery = `
  *[_type == "post" && slug.current == $slug][0] {
    title,
    metaTitle,
    slug,
    excerpt,
    metaDescription,
    content,
    coverImage {
      asset->{
        url,
        metadata {
          dimensions
        }
      },
      alt,
      caption
    },
    author->{
      name,
      slug,
      jobTitle,
      bio,
      avatar {
        asset->{url},
        alt
      },
      credentials,
      education,
      specialties,
      yearsExperience,
      email,
      website,
      socialProfiles,
      sameAs,
      worksFor,
      memberOf
    },
    publishedAt,
    lastModified,
    readingTime,
    wordCount,
    articleType,
    articleSection,
    categories[]->{
      title,
      slug
    },
    tags,
    focusKeyword,
    secondaryKeywords,
    targetAudience,
    medicallyReviewed,
    medicalReviewer->{
      name,
      slug,
      jobTitle
    },
    reviewDate,
    faqs,
    howTo,
    featured,
    noIndex,
    canonicalUrl,
    language
  }
`