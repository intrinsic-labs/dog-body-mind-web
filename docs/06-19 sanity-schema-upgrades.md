// ===== ENHANCED POST TYPE WITH ADVANCED SEO FIELDS =====
import {defineField, defineType} from 'sanity'
import {isUniquePerLanguage} from '../lib/isUniquePerLanguage'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Content',
      default: true
    },
    {
      name: 'seo',
      title: 'SEO & Schema'
    },
    {
      name: 'advanced',
      title: 'Advanced Settings'
    }
  ],
  fields: [
    // ===== BASIC CONTENT FIELDS =====
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: Rule => Rule.required().min(10).max(60).warning('Titles should be 10-60 characters for optimal SEO')
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        isUnique: isUniquePerLanguage
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'Brief description of the post (120-158 characters for meta description)',
      validation: Rule => Rule.required().min(120).max(158)
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
      group: 'content',
      validation: Rule => Rule.required()
    }),
    
    // ===== ENHANCED MEDIA FIELDS =====
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Describe the image for accessibility and SEO',
          validation: Rule => Rule.required()
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
          description: 'Optional caption displayed below image'
        }
      ],
      validation: Rule => Rule.required()
    }),
    
    // ===== AUTHOR & PUBLICATION INFO =====
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'content',
      to: [{type: 'author'}],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'content',
      description: 'When the post was published',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'lastModified',
      title: 'Last Modified',
      type: 'datetime',
      group: 'content',
      description: 'Track content freshness for SEO - auto-updates on save',
      readOnly: true
    }),
    
    // ===== ENHANCED SEO & SCHEMA FIELDS =====
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      group: 'seo',
      description: 'Custom title for search engines (50-60 characters). If empty, uses main title.',
      validation: Rule => Rule.max(60)
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      group: 'seo',
      rows: 3,
      description: 'Custom meta description for SEO (120-158 characters). If empty, uses excerpt.',
      validation: Rule => Rule.min(120).max(158)
    }),
    defineField({
      name: 'focusKeyword',
      title: 'Focus Keyword',
      type: 'string',
      group: 'seo',
      description: 'Primary keyword this article targets'
    }),
    defineField({
      name: 'secondaryKeywords',
      title: 'Secondary Keywords',
      type: 'array',
      group: 'seo',
      of: [{type: 'string'}],
      description: 'Additional keywords this article targets',
      options: {layout: 'tags'}
    }),
    
    // ===== ARTICLE SCHEMA FIELDS =====
    defineField({
      name: 'articleType',
      title: 'Article Type',
      type: 'string',
      group: 'seo',
      options: {
        list: [
          {title: 'Article (General)', value: 'Article'},
          {title: 'News Article', value: 'NewsArticle'},
          {title: 'Blog Posting', value: 'BlogPosting'},
          {title: 'Technical Article', value: 'TechnicalArticle'},
          {title: 'Medical Article', value: 'MedicalScholarlyArticle'}
        ]
      },
      initialValue: 'BlogPosting',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'articleSection',
      title: 'Article Section',
      type: 'string',
      group: 'seo',
      description: 'What section of the site this belongs to (Training, Health, Nutrition, etc.)',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'wordCount',
      title: 'Word Count',
      type: 'number',
      group: 'seo',
      description: 'Approximate word count - can be auto-calculated',
      readOnly: true
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
      group: 'seo',
      description: 'Estimated reading time - auto-calculated or manual override'
    }),
    
    // ===== E-E-A-T SIGNALS =====
    defineField({
      name: 'medicallyReviewed',
      title: 'Medically Reviewed',
      type: 'boolean',
      group: 'seo',
      description: 'Has this content been reviewed by a veterinary professional?',
      initialValue: false
    }),
    defineField({
      name: 'medicalReviewer',
      title: 'Medical Reviewer',
      type: 'reference',
      group: 'seo',
      to: [{type: 'author'}],
      description: 'Veterinarian who reviewed this content',
      hidden: ({document}) => !document?.medicallyReviewed
    }),
    defineField({
      name: 'reviewDate',
      title: 'Review Date',
      type: 'date',
      group: 'seo',
      description: 'When this content was last reviewed',
      hidden: ({document}) => !document?.medicallyReviewed
    }),
    defineField({
      name: 'nextReviewDate',
      title: 'Next Review Due',
      type: 'date',
      group: 'seo',
      description: 'When this content should be reviewed again',
      hidden: ({document}) => !document?.medicallyReviewed
    }),
    
    // ===== CONTENT CLASSIFICATION =====
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'content',
      of: [{
        type: 'reference',
        to: [{type: 'category'}]
      }],
      validation: Rule => Rule.required().min(1).max(3).error('Please select 1-3 categories')
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'content',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      validation: Rule => Rule.max(10)
    }),
    defineField({
      name: 'targetAudience',
      title: 'Target Audience',
      type: 'array',
      group: 'seo',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'New Dog Owners', value: 'new-owners'},
          {title: 'Experienced Dog Owners', value: 'experienced-owners'},
          {title: 'Puppy Parents', value: 'puppy-parents'},
          {title: 'Senior Dog Owners', value: 'senior-dog-owners'},
          {title: 'Professional Trainers', value: 'trainers'},
          {title: 'Veterinarians', value: 'vets'},
          {title: 'Breed Specific', value: 'breed-specific'},
          {title: 'General Pet Lovers', value: 'general'}
        ]
      }
    }),
    
    // ===== FAQ SCHEMA SUPPORT =====
    defineField({
      name: 'faqs',
      title: 'Frequently Asked Questions',
      type: 'array',
      group: 'seo',
      of: [{
        type: 'object',
        name: 'faq',
        title: 'FAQ Item',
        fields: [
          {
            name: 'question',
            title: 'Question',
            type: 'string',
            validation: Rule => Rule.required()
          },
          {
            name: 'answer',
            title: 'Answer',
            type: 'text',
            rows: 4,
            validation: Rule => Rule.required()
          }
        ],
        preview: {
          select: {
            title: 'question',
            subtitle: 'answer'
          }
        }
      }],
      description: 'Add FAQs to potentially appear in PAA boxes and rich results'
    }),
    
    // ===== HOW-TO SCHEMA SUPPORT =====
    defineField({
      name: 'howTo',
      title: 'How-To Instructions',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'totalTime',
          title: 'Total Time',
          type: 'string',
          description: 'Total time needed (e.g., "30 minutes", "1 hour")'
        },
        {
          name: 'supply',
          title: 'Supplies Needed',
          type: 'array',
          of: [{type: 'string'}],
          description: 'List of supplies/tools needed'
        },
        {
          name: 'tool',
          title: 'Tools Required',
          type: 'array',
          of: [{type: 'string'}],
          description: 'List of tools required'
        },
        {
          name: 'steps',
          title: 'Instructions',
          type: 'array',
          of: [{
            type: 'object',
            name: 'step',
            fields: [
              {
                name: 'name',
                title: 'Step Title',
                type: 'string',
                validation: Rule => Rule.required()
              },
              {
                name: 'text',
                title: 'Step Instructions',
                type: 'text',
                rows: 3,
                validation: Rule => Rule.required()
              },
              {
                name: 'image',
                title: 'Step Image',
                type: 'image',
                options: {hotspot: true}
              },
              {
                name: 'url',
                title: 'Step URL',
                type: 'url',
                description: 'Link to detailed instructions for this step'
              }
            ],
            preview: {
              select: {
                title: 'name',
                subtitle: 'text',
                media: 'image'
              }
            }
          }]
        }
      ],
      description: 'Add step-by-step instructions for How-To schema markup'
    }),
    
    // ===== ADVANCED FEATURES =====
    defineField({
      name: 'featured',
      title: 'Sitewide Featured Post',
      type: 'boolean',
      group: 'advanced',
      initialValue: false,
      description: 'Feature this post across the site'
    }),
    defineField({
      name: 'featuredCategory',
      title: 'Featured in Category',
      type: 'boolean',
      group: 'advanced',
      initialValue: false,
      description: 'Feature this post at the top of its first category'
    }),
    defineField({
      name: 'noIndex',
      title: 'No Index',
      type: 'boolean',
      group: 'advanced',
      description: 'Prevent search engines from indexing this page',
      initialValue: false
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      group: 'advanced',
      description: 'Custom canonical URL if this content exists elsewhere'
    }),
    
    // ===== INTERNATIONAL =====
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      readOnly: true,
      hidden: true
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'excerpt',
      media: 'coverImage',
      authorName: 'author.name',
      categories: 'categories',
      language: 'language'
    },
    prepare({title, subtitle, media, authorName, categories, language}) {
      const categoryTitles = categories?.map((cat: any) => cat.title).filter(Boolean) || []
      const categoryString = categoryTitles.length > 0 ? `[${categoryTitles.join(', ')}] ` : ''
      
      return {
        title: `${title} ${language ? `(${language.toUpperCase()})` : ''}`,
        subtitle: `${categoryString}${authorName ? `By ${authorName}` : ''} - ${subtitle}`,
        media,
      }
    },
  },
})

// ===== ENHANCED AUTHOR TYPE WITH E-E-A-T SIGNALS =====
export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  groups: [
    {
      name: 'basic',
      title: 'Basic Info',
      default: true
    },
    {
      name: 'credentials',
      title: 'Credentials & E-E-A-T'
    },
    {
      name: 'social',
      title: 'Social & Contact'
    }
  ],
  fields: [
    // ===== BASIC INFO =====
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'basic',
      description: "Author's full name",
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basic',
      options: {source: 'name'},
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      group: 'basic',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          validation: Rule => Rule.required()
        }
      ]
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      group: 'basic',
      rows: 4,
      description: 'Author biography for display'
    }),
    defineField({
      name: 'jobTitle',
      title: 'Job Title',
      type: 'string',
      group: 'basic',
      description: 'Current professional title',
      validation: Rule => Rule.required()
    }),
    
    // ===== CREDENTIALS & E-E-A-T =====
    defineField({
      name: 'credentials',
      title: 'Professional Credentials',
      type: 'array',
      group: 'credentials',
      of: [{
        type: 'object',
        name: 'credential',
        fields: [
          {
            name: 'name',
            title: 'Credential Name',
            type: 'string',
            description: 'e.g., "Doctor of Veterinary Medicine", "CCPDT-KA"',
            validation: Rule => Rule.required()
          },
          {
            name: 'issuingOrganization',
            title: 'Issuing Organization',
            type: 'string',
            description: 'Organization that issued this credential',
            validation: Rule => Rule.required()
          },
          {
            name: 'url',
            title: 'Verification URL',
            type: 'url',
            description: 'Link to verify this credential'
          },
          {
            name: 'dateIssued',
            title: 'Date Issued',
            type: 'date'
          },
          {
            name: 'expires',
            title: 'Expiration Date',
            type: 'date'
          }
        ],
        preview: {
          select: {
            title: 'name',
            subtitle: 'issuingOrganization'
          }
        }
      }],
      description: 'Professional certifications and qualifications for E-E-A-T'
    }),
    defineField({
      name: 'education',
      title: 'Education',
      type: 'array',
      group: 'credentials',
      of: [{
        type: 'object',
        name: 'education',
        fields: [
          {
            name: 'institution',
            title: 'Institution',
            type: 'string',
            validation: Rule => Rule.required()
          },
          {
            name: 'degree',
            title: 'Degree',
            type: 'string',
            validation: Rule => Rule.required()
          },
          {
            name: 'field',
            title: 'Field of Study',
            type: 'string'
          },
          {
            name: 'graduationYear',
            title: 'Graduation Year',
            type: 'number'
          },
          {
            name: 'url',
            title: 'Institution URL',
            type: 'url'
          }
        ],
        preview: {
          select: {
            title: 'degree',
            subtitle: 'institution'
          }
        }
      }]
    }),
    defineField({
      name: 'experience',
      title: 'Professional Experience',
      type: 'array',
      group: 'credentials',
      of: [{
        type: 'object',
        name: 'experience',
        fields: [
          {
            name: 'position',
            title: 'Position',
            type: 'string',
            validation: Rule => Rule.required()
          },
          {
            name: 'organization',
            title: 'Organization',
            type: 'string',
            validation: Rule => Rule.required()
          },
          {
            name: 'startDate',
            title: 'Start Date',
            type: 'date'
          },
          {
            name: 'endDate',
            title: 'End Date',
            type: 'date',
            description: 'Leave empty if current position'
          },
          {
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3
          }
        ],
        preview: {
          select: {
            title: 'position',
            subtitle: 'organization'
          }
        }
      }]
    }),
    defineField({
      name: 'specialties',
      title: 'Areas of Expertise',
      type: 'array',
      group: 'credentials',
      of: [{type: 'string'}],
      description: 'Specific areas of expertise for knowsAbout schema',
      options: {layout: 'tags'}
    }),
    defineField({
      name: 'yearsExperience',
      title: 'Years of Experience',
      type: 'number',
      group: 'credentials',
      description: 'Total years of professional experience'
    }),
    
    // ===== SOCIAL & CONTACT =====
    defineField({
      name: 'email',
      title: 'Email',
      type: 'email',
      group: 'social',
      description: 'Professional email address'
    }),
    defineField({
      name: 'website',
      title: 'Personal Website',
      type: 'url',
      group: 'social'
    }),
    defineField({
      name: 'socialProfiles',
      title: 'Social Profiles',
      type: 'object',
      group: 'social',
      fields: [
        {
          name: 'linkedin',
          type: 'url',
          title: 'LinkedIn Profile'
        },
        {
          name: 'twitter',
          type: 'url',
          title: 'Twitter/X Profile'
        },
        {
          name: 'instagram',
          type: 'url',
          title: 'Instagram Profile'
        },
        {
          name: 'facebook',
          type: 'url',
          title: 'Facebook Profile'
        },
        {
          name: 'youtube',
          type: 'url',
          title: 'YouTube Channel'
        }
      ]
    }),
    
    // ===== SCHEMA-SPECIFIC FIELDS =====
    defineField({
      name: 'sameAs',
      title: 'Same As URLs',
      type: 'array',
      group: 'social',
      of: [{type: 'url'}],
      description: 'URLs that represent the same person (social profiles, professional directories, etc.)'
    }),
    defineField({
      name: 'worksFor',
      title: 'Works For',
      type: 'string',
      group: 'credentials',
      description: 'Organization this person works for'
    }),
    defineField({
      name: 'memberOf',
      title: 'Member Of',
      type: 'array',
      group: 'credentials',
      of: [{type: 'string'}],
      description: 'Professional organizations this person belongs to'
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'jobTitle',
      media: 'avatar'
    }
  }
})

// ===== ENHANCED CATEGORY TYPE =====
export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        isUnique: isUniquePerLanguage
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'SEO-optimized description of this category'
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 2,
      description: 'Custom meta description for category pages',
      validation: Rule => Rule.max(158)
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          validation: Rule => Rule.required()
        }
      ]
    }),
    defineField({
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'Creates hierarchical category structure'
    }),
    defineField({
      name: 'color',
      title: 'Brand Color',
      type: 'color',
      description: 'Color for category badges and UI elements'
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      readOnly: true,
      hidden: true
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'featuredImage',
      language: 'language'
    },
    prepare({title, subtitle, media, language}) {
      return {
        title: `${title} ${language ? `(${language.toUpperCase()})` : ''}`,
        subtitle,
        media
      }
    }
  }
})

// ===== ORGANIZATION SCHEMA TYPE =====
export const organizationType = defineType({
  name: 'organization',
  title: 'Organization',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Organization Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'legalName',
      title: 'Legal Name',
      type: 'string',
      description: 'Official legal name if different from display name'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'url',
      title: 'Website URL',
      type: 'url',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'contactInfo',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {
          name: 'email',
          title: 'Email',
          type: 'email'
        },
        {
          name: 'telephone',
          title: 'Phone',
          type: 'string'
        },
        {
          name: 'address',
          title: 'Address',
          type: 'object',
          fields: [
            {name: 'streetAddress', title: 'Street Address', type: 'string'},
            {name: 'addressLocality', title: 'City', type: 'string'},
            {name: 'addressRegion', title: 'State/Region', type: 'string'},
            {name: 'postalCode', title: 'Postal Code', type: 'string'},
            {name: 'addressCountry', title: 'Country', type: 'string'}
          ]
        }
      ]
    }),
    defineField({
      name: 'socialProfiles',
      title: 'Social Media Profiles',
      type: 'array',
      of: [{type: 'url'}],
      description: 'Social media and other official profiles'
    }),
    defineField({
      name: 'foundingDate',
      title: 'Founding Date',
      type: 'date'
    }),
    defineField({
      name: 'organizationType',
      title: 'Organization Type',
      type: 'string',
      options: {
        list: [
          {title: 'Educational Organization', value: 'EducationalOrganization'},
          {title: 'Corporation', value: 'Corporation'},
          {title: 'Non-Profit', value: 'NGO'},
          {title: 'Local Business', value: 'LocalBusiness'},
          {title: 'Professional Service', value: 'ProfessionalService'}
        ]
      },
      initialValue: 'EducationalOrganization'
    })
  ]
})