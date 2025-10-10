/**
 * CitationRenderer Component
 *
 * Renders individual citations in APA format with proper schema.org markup
 * Includes DOI links, accessibility features, and SEO optimization
 */

import type { Citation } from '@/lib/schema/generators/citation-schema'

interface CitationRendererProps {
  citation: Citation
  index: number // 1-indexed citation number
}

/**
 * Format author names in APA style
 * Example: ["Smith, J.", "Doe, A."] -> "Smith, J., & Doe, A."
 */
function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return ''
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`

  // 3+ authors: "Author1, Author2, & Author3"
  const lastAuthor = authors[authors.length - 1]
  const otherAuthors = authors.slice(0, -1).join(', ')
  return `${otherAuthors}, & ${lastAuthor}`
}

/**
 * Format citation in APA style based on type
 */
function formatCitation(citation: Citation): {
  formattedText: string
  link?: string
  linkText?: string
} {
  const authors = formatAuthors(citation.authors)
  const year = citation.publicationYear

  switch (citation.citationType) {
    case 'scholarlyArticle': {
      // Format: Author, A. A. (Year). Title. Journal, Volume(Issue), pages. DOI
      let formatted = `${authors} (${year}). ${citation.title}`

      if (citation.publisher) {
        formatted += `. ${citation.publisher}`
      }

      if (citation.volume && citation.issue) {
        formatted += `, ${citation.volume}(${citation.issue})`
      } else if (citation.volume) {
        formatted += `, ${citation.volume}`
      }

      if (citation.pages) {
        formatted += `, ${citation.pages}`
      }

      formatted += '.'

      // Return with DOI or URL link
      if (citation.doi) {
        return {
          formattedText: formatted,
          link: `https://doi.org/${citation.doi}`,
          linkText: `https://doi.org/${citation.doi}`
        }
      } else if (citation.url) {
        return {
          formattedText: formatted,
          link: citation.url,
          linkText: citation.url
        }
      }

      return { formattedText: formatted }
    }

    case 'book': {
      // Format: Author, A. A. (Year). Title (Edition). Publisher.
      let formatted = `${authors} (${year}). ${citation.title}`

      if (citation.edition) {
        formatted += ` (${citation.edition})`
      }

      if (citation.publisher) {
        formatted += `. ${citation.publisher}`
      }

      formatted += '.'

      if (citation.url) {
        return {
          formattedText: formatted,
          link: citation.url,
          linkText: citation.url
        }
      }

      return { formattedText: formatted }
    }

    case 'webPage':
    case 'governmentDocument': {
      // Format: Author, A. A. (Year). Title. Publisher/Website. URL
      let formatted = `${authors} (${year}). ${citation.title}`

      if (citation.publisher) {
        formatted += `. ${citation.publisher}`
      }

      formatted += '.'

      if (citation.url) {
        return {
          formattedText: formatted,
          link: citation.url,
          linkText: citation.url
        }
      }

      return { formattedText: formatted }
    }

    case 'dataset': {
      // Format: Author, A. A. (Year). Title [Data set]. Publisher. DOI or URL
      let formatted = `${authors} (${year}). ${citation.title} [Data set]`

      if (citation.publisher) {
        formatted += `. ${citation.publisher}`
      }

      formatted += '.'

      if (citation.doi) {
        return {
          formattedText: formatted,
          link: `https://doi.org/${citation.doi}`,
          linkText: `https://doi.org/${citation.doi}`
        }
      } else if (citation.url) {
        return {
          formattedText: formatted,
          link: citation.url,
          linkText: citation.url
        }
      }

      return { formattedText: formatted }
    }

    default:
      return {
        formattedText: `${authors} (${year}). ${citation.title}.`
      }
  }
}

/**
 * Get icon/emoji for citation type
 */
function getCitationIcon(citationType: Citation['citationType']): string {
  const icons = {
    scholarlyArticle: '📄',
    book: '📚',
    webPage: '🌐',
    governmentDocument: '🏛️',
    dataset: '📊'
  }
  return icons[citationType] || '📎'
}

export default function CitationRenderer({ citation, index }: CitationRendererProps) {
  const { formattedText, link, linkText } = formatCitation(citation)
  const icon = getCitationIcon(citation.citationType)

  return (
    <li
      id={`citation-${index}`}
      className="mb-4 pl-2 text-sm leading-relaxed break-words"
    >
      <div className="flex gap-2">
        {/* Citation number and icon */}
        <span className="text-foreground/50 font-medium shrink-0">
          {icon} [{index}]
        </span>

        {/* Citation text and link */}
        <div className="flex-1">
          <span className="text-foreground/80">{formattedText}</span>

          {/* Link (DOI or URL) */}
          {link && (
            <>
              {' '}
              <a
                href={link}
                rel="noopener noreferrer"
                target="_blank"
                className="text-orange hover:text-orange/80 underline transition-colors break-all"
                aria-label={`View source: ${citation.title}`}
              >
                {linkText}
              </a>
            </>
          )}

          {/* Quality indicator (optional visual cue for high-authority sources) */}
          {citation.seoWeight && citation.seoWeight >= 4 && (
            <span
              className="ml-2 text-xs text-green-600 dark:text-green-400"
              title="High-authority source"
              aria-label="High-authority source"
            >
              ✓
            </span>
          )}
        </div>
      </div>
    </li>
  )
}
