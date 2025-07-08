import { defineQuery } from 'next-sanity'

// Get all authors with language-specific field extraction
export const allAuthorsQuery = defineQuery(`
  *[_type == "author"] | order(name asc) {
    // Core document fields
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    
    // Basic info fields
    name,
    slug,
    avatar {
      asset-> {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          },
          lqip,
          blurHash,
          hasAlpha,
          isOpaque
        }
      },
      hotspot,
      crop,
      alt
    },
    
    // Internationalized fields (language-specific extraction)
    "bio": bio[_key == $language][0].value,
    "jobTitle": jobTitle[_key == $language][0].value,
    "specialties": specialties[_key == $language][0].value,
    
    // Credentials & E-E-A-T fields
    credentials[] {
      name,
      issuingOrganization,
      url,
      dateIssued,
      expires,
      _key
    },
    education[] {
      institution,
      degree,
      field,
      graduationYear,
      url,
      _key
    },
    experience[] {
      position,
      organization,
      startDate,
      endDate,
      description,
      _key
    },
    yearsExperience,
    
    // Social & contact fields
    email,
    socialLinks {
      linkedin,
      twitter,
      instagram,
      facebook,
      youtube,
      website
    },
    
    // Schema-specific fields
    sameAs,
    worksFor,
    memberOf
  }
`)

// Get single author by slug with language-specific field extraction
export const authorBySlugQuery = defineQuery(`
  *[_type == "author" && slug.current == $slug][0] {
    // Core document fields
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    
    // Basic info fields
    name,
    slug,
    avatar {
      asset-> {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          },
          lqip,
          blurHash,
          hasAlpha,
          isOpaque
        }
      },
      hotspot,
      crop,
      alt
    },
    
    // Internationalized fields (language-specific extraction)
    "bio": bio[_key == $language][0].value,
    "jobTitle": jobTitle[_key == $language][0].value,
    "specialties": specialties[_key == $language][0].value,
    
    // Credentials & E-E-A-T fields
    credentials[] {
      name,
      issuingOrganization,
      url,
      dateIssued,
      expires,
      _key
    },
    education[] {
      institution,
      degree,
      field,
      graduationYear,
      url,
      _key
    },
    experience[] {
      position,
      organization,
      startDate,
      endDate,
      description,
      _key
    },
    yearsExperience,
    
    // Social & contact fields
    email,
    socialLinks {
      linkedin,
      twitter,
      instagram,
      facebook,
      youtube,
      website
    },
    
    // Schema-specific fields
    sameAs,
    worksFor,
    memberOf
  }
`)

// Get author references only (for reference resolution)
export const authorReferencesQuery = defineQuery(`
  *[_type == "author" && _id in $ids] {
    _id,
    name,
    slug,
    "jobTitle": jobTitle[_key == $language][0].value
  }
`) 