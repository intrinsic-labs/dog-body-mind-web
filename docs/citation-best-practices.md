# Citation and Reference SEO Best Practices for Sanity.io

## 1. Schema.org Implementation Strategy

### Core Citation Schema Types

* **ScholarlyArticle**: For peer-reviewed sources with DOIs
* **Book**: For published books and monographs
* **GovernmentDocument**: For official government sources
* **Dataset**: For research data and statistics
* **WebPage**: For authoritative web sources

### Implementation in Next.js

```jsx
// In your blog post component
const schemas = generateAllCitationSchemas(post)

schemas.forEach((schema, index) => (
  <script
    key={index}
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
))
```

---

## 2. E-A-T Optimization Through Citations

### Expertise Indicators

* **Author Credentials**: Include degrees, certifications, professional affiliations
* **Specialized Knowledge**: Reference field-specific terminology and concepts
* **Original Research**: Cite primary sources rather than secondary summaries
* **Current Information**: Prioritize sources from last 2–5 years

### Authority Signals

* **High-Authority Domains**: `.edu`, `.gov`, established journals
* **DOI Links**: Direct links to peer-reviewed research
* **Citation Count**: Reference well-cited, influential papers
* **Institutional Affiliations**: Authors from respected organizations

### Trustworthiness Factors

* **Transparent Sourcing**: Every claim backed by verifiable source
* **Conflict of Interest**: Disclose any potential biases
* **Update Timestamps**: Show when content was last reviewed
* **Correction Policy**: Clear process for handling errors

---

## 3. Citation Quality Scoring System

**Scoring Criteria (100 points total)**

| Category             | Criteria                        | Points |
| -------------------- | ------------------------------- | ------ |
| **Source Authority** | Peer-reviewed journal with DOI  | 40     |
|                      | Government/official source      | 35     |
|                      | Academic institution (.edu)     | 30     |
|                      | Established organization (.org) | 25     |
|                      | Commercial source (.com)        | 15     |
| **Recency**          | 0–2 years old                   | 20     |
|                      | 2–5 years old                   | 15     |
|                      | 5–10 years old                  | 10     |
|                      | 10+ years old                   | 5      |
| **Completeness**     | All fields complete             | 20     |
|                      | Missing 1–2 fields              | 15     |
|                      | Missing 3+ fields               | 10     |
| **Relevance**        | Directly supports claim         | 20     |
|                      | Tangentially related            | 10     |
|                      | Background context              | 5      |

---

## 4. SEO-Optimized Citation Formats

### APA Style (Recommended for SEO)

**Benefits for SEO:**

* Clean, scannable format
* Consistent structure for parsing
* Direct links to authoritative sources
* Date prominence for freshness signals

**Example:**

```
Author, A. A. (Year). Title of work. Title of Publication, Volume(Issue), pages. https://doi.org/xx.xxx/yyyy
```

---

## 5. Technical Implementation

### Sanity.io Schema Optimization

```javascript
// Enhanced citation with SEO fields
{
  name: 'citation',
  fields: [
    // ... existing fields
    {
      name: 'seoWeight',
      title: 'SEO Weight',
      type: 'number',
      validation: Rule => Rule.min(1).max(5),
      description: '1-5 rating of source authority for SEO'
    },
    {
      name: 'keywordRelevance',
      title: 'Target Keywords',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Keywords this citation supports'
    },
    {
      name: 'linkEquity',
      title: 'Link Equity Score',
      type: 'number',
      description: 'Estimated authority of the linked domain'
    }
  ]
}
```

### In-Text Citation Optimization

```jsx
// SEO-friendly in-text citations
<sup>
  <a
    href={`#citation-${citationId}`}
    title={`Reference: ${citationTitle}`}
    aria-label={`Jump to reference ${citationId}: ${citationTitle}`}
  >
    [{citationId}]
  </a>
</sup>
```

---

## 6. Reference Section Best Practices

**Structure for Maximum SEO Impact**

1. **Heading Optimization**: Use `H2` for “References” section
2. **Numbered List**: Use `<ol>` for better structure
3. **Anchor Links**: Each citation has unique ID for deep linking
4. **Rich Snippets**: Include schema markup for each reference
5. **External Link Quality**: Use `rel="noopener"` for external links

### Example Implementation

```jsx
<section className="references" id="references">
  <h2>References</h2>
  <ol className="citation-list">
    {citations.map((citation, index) => (
      <li key={citation.id} id={`citation-${citation.id}`}>
        <CitationFormatter citation={citation} />
        {citation.doi && (
          <a
            href={`https://doi.org/${citation.doi}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            DOI: {citation.doi}
          </a>
        )}
      </li>
    ))}
  </ol>
</section>
```

---

## 7. Citation Validation Checklist

### Pre-Publication Review

* [ ] All citations have complete metadata
* [ ] URLs are working and archived
* [ ] DOIs resolve correctly
* [ ] Author names are spelled correctly
* [ ] Publication dates are accurate
* [ ] No duplicate citations
* [ ] Citations match in-text references

### SEO Health Check

* [ ] At least 5 high-authority sources
* [ ] 70%+ of sources less than 5 years old
* [ ] Mix of source types (journal, book, web)
* [ ] All external links use appropriate `rel` attributes
* [ ] Schema markup validates without errors
* [ ] Citation quality score above 75/100

---

## 8. Advanced SEO Features

* **Citation Networks**: Link related articles through shared citations to create topic authority clusters.
* **Trending Citations**: Track which sources are being cited frequently to identify trending topics.
* **Citation Freshness**: Implement alerts when cited sources become outdated or retracted.
* **Impact Tracking**: Monitor which citations generate the most clicks and engagement.

---

## 9. Measurement and Analytics

### Key Metrics to Track

* **Citation Click-Through Rate**: % of users clicking references
* **Source Authority Distribution**: Mix of high/medium/low authority sources
* **Citation Freshness Score**: Average age of cited sources
* **External Link Performance**: Traffic sent to authoritative sources
* **Schema Markup Validation**: Zero errors in structured data testing

### Google Search Console Monitoring

* Rich snippets appearance rates
* FAQ schema eligibility
* Article schema recognition
* Citation-related search queries

---

## 10. Common Pitfalls to Avoid

### SEO Mistakes

* **Citation Farms**: Don’t cite low-quality sources just for quantity
* **Broken Links**: Regularly audit and fix broken citation links
* **Over-Optimization**: Don’t keyword-stuff citation descriptions
* **Duplicate Content**: Don’t copy-paste citation lists across articles
* **Missing Dates**: Always include publication dates when available

### Technical Issues

* **Schema Errors**: Validate all structured data before publishing
* **Mobile Responsiveness**: Ensure citations display well on mobile
* **Page Speed**: Optimize citation formatting to minimize load time
* **Accessibility**: Include proper ARIA labels for citation links

---

## Implementation Timeline

**Phase 1: Foundation (Week 1–2)**

* Set up enhanced Sanity schemas
* Implement basic citation components
* Add schema.org markup

**Phase 2: Enhancement (Week 3–4)**

* Add citation quality scoring
* Implement citation manager
* Create validation workflows

**Phase 3: Optimization (Week 5–6)**

* Add advanced schema types
* Implement citation analytics
* Optimize for Core Web Vitals

**Phase 4: Monitoring (Ongoing)**

* Track citation performance
* Monitor schema markup health
* Regular citation freshness audits
