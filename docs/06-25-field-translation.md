# Field Translation

This document outlines the field translation strategy for the project, specifically looking at the sanity files in `dbm-sanity/schemaTypes/`.

| Schema | Field Name | Translate |
|--------|------------|-----------|
| **Author** | name | ❌ |
| | slug | ❌ |
| | avatar | ❌ |
| | bio | ✅ |
| | jobTitle | ✅ |
| | credentials | ❌ |
| | education | ❌ |
| | experience | ❌ |
| | specialties | ✅ |
| | yearsExperience | ❌ |
| | email | ❌ |
| | socialLinks | ❌ |
| | sameAs | ❌ |
| | worksFor | ❌ |
| | memberOf | ❌ |
| **Category** | title | ✅ |
| | slug | ✅ |
| | description | ✅ |
| | metaDescription | ✅ |
| | featuredImage.alt | ✅ |
| | parent | ❌ |
| | language | ❌ |
| **Organization** | name | ❌ |
| | legalName | ❌ |
| | description | ✅ |
| | logo | ❌ |
| | logo.alt | ✅ |
| | url | ❌ |
| | contactInfo | ❌ |
| | socialProfiles | ❌ |
| | foundingDate | ❌ |
| | organizationType | ❌ |

**Key reasoning:**
- **Author**: Only user-facing content (bio, job title, specialties) needs translation
- **Category**: All user-facing content must be translated for proper localized navigation
- **Organization**: Only marketing description and image alt text need translation

---

# Schema Generation & SSR Integration Outline

## **Data Flow Architecture**

### **1. Content Fetching Layer**
- **Sanity queries** must request both universal fields and all language variants for internationalized fields
- **Language detection** happens at request time (URL path, headers, cookies)
- **Fallback logic** retrieves default language (English) when target language unavailable
- **Single query** pulls author with `bio.en`, `bio.de`, etc. rather than separate author documents

### **2. Schema Generation Logic**
- **Language-aware schema builders** accept current language as parameter
- **Field resolution** checks if field is internationalized, then extracts appropriate language variant
- **Fallback handling** uses default language when specific translation missing
- **Universal field passthrough** for non-internationalized data (credentials, dates, URLs)

### **3. SEO Integration Points**

#### **Meta Tag Generation**
- **Page titles** use localized category names, author job titles
- **Meta descriptions** pull from localized content descriptions
- **Open Graph tags** reference localized image alt text and descriptions
- **Article tags** use localized category titles for `article:section`

#### **Structured Data Output**
- **Person schema** combines universal credentials with localized bio/job title
- **Organization schema** merges legal info with localized descriptions
- **Article schema** references localized category names and author information
- **Breadcrumb schema** uses fully localized navigation path

### **4. URL Structure & Routing**
- **Language prefixed URLs** (`/de/blog/hundetraining` vs `/blog/dog-training`)
- **Category slug localization** requires language-specific routing logic
- **Author page URLs** can stay universal (`/authors/dr-wilson`) since names don't translate
- **Hreflang generation** maps equivalent content across language versions

### **5. SSR Rendering Pipeline**
- **Server-side language detection** before schema generation
- **Static generation** pre-builds all language variants for categories
- **Dynamic generation** for author pages (universal) and blog posts (per language)
- **Cache segmentation** by language to prevent cross-language content bleeding

### **6. Content Relationships**
- **Author references** work universally across all language versions of posts
- **Category references** require language-matched relationships (German post → German category)
- **Cross-language canonical URLs** for equivalent content pieces
- **Internal linking** respects language boundaries in automated link generation

### **7. Search Engine Optimization**
- **Sitemap generation** includes all language variants with proper hreflang annotations
- **Robots.txt** considerations for language-specific crawling directives
- **Schema validation** ensures all required localized fields present before page render
- **Performance optimization** caches schema output by language to reduce generation overhead

### **8. Error Handling & Fallbacks**
- **Missing translation detection** at build/render time
- **Graceful degradation** to default language when translations incomplete
- **Content editor warnings** for incomplete localizations
- **SEO impact minimization** through consistent fallback patterns

This architecture ensures that your international SEO signals remain strong while maintaining the flexibility of field-level translations where they matter most for user experience and local search rankings.