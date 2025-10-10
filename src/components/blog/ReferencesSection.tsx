/**
 * ReferencesSection Component
 *
 * Renders the References/Bibliography section at the bottom of blog posts
 * Optimized for SEO with proper semantic HTML and accessibility
 */

import type { Citation } from '@/lib/schema/generators/citation-schema'
import CitationRenderer from './CitationRenderer'

interface ReferencesSectionProps {
  references: Citation[]
}

export default function ReferencesSection({ references }: ReferencesSectionProps) {
  // Don't render if no references
  if (!references || references.length === 0) {
    return null
  }

  return (
    <section
      className="references mt-16 pt-8 border-t border-foreground/10"
      id="references"
      aria-label="References and Citations"
    >
      {/* H2 heading for SEO */}
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        References
      </h2>

      {/* Ordered list for structured data */}
      <ol className="citation-list space-y-2 list-none">
        {references.map((citation, index) => (
          <CitationRenderer
            key={citation._key || index}
            citation={citation}
            index={index + 1}
          />
        ))}
      </ol>

      {/* Optional: Citation count for transparency */}
      <div className="mt-6 text-xs text-foreground/50">
        {references.length} {references.length === 1 ? 'reference' : 'references'} cited
      </div>
    </section>
  )
}
