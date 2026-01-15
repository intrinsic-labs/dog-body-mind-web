import { defineQuery } from 'next-sanity'

// Get organization with language-specific field extraction
// Note: There should only be one organization document
export const organizationQuery = defineQuery(`
  *[_type == "organization"][0] {
    // Core document fields
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    
    // Basic organization info
    name,
    legalName,
    url,
    foundingDate,
    organizationType,
    
    // Internationalized fields (language-specific extraction)
    "description": description[_key == $language][0].value,
    
    // Logo with internationalized alt text
    logo {
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
      "alt": alt[_key == $language][0].value
    },
    
    // Contact information (nested object)
    contactInfo {
      email,
      telephone,
      address {
        streetAddress,
        addressLocality,
        addressRegion,
        postalCode,
        addressCountry
      }
    },
    
    // Social profiles array
    socialProfiles
  }
`)

// Get organization reference only (for reference resolution)
export const organizationReferenceQuery = defineQuery(`
  *[_type == "organization"][0] {
    _id,
    name,
    url,
    "description": description[_key == $language][0].value
  }
`)

// Debug query - get organization without language filtering
export const organizationDebugQuery = defineQuery(`
  *[_type == "organization"][0] {
    _id,
    name,
    url,
    description,
    logo {
      asset-> {
        url
      },
      alt
    }
  }
`) 