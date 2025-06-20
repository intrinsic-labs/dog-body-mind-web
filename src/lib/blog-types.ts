import { PortableTextBlock } from '@portabletext/types';
import type { Image } from '@sanity/types';

// Sanity reference type
export interface SanityReference {
  _id: string;
  _type: string;
  _ref?: string;
}

// Enhanced Author type with E-E-A-T fields
export interface Author {
  _id: string;
  name: string;
  slug: string;
  avatar?: Image;
  bio?: string;
  jobTitle?: string;
  credentials?: Credential[];
  education?: Education[];
  experience?: Experience[];
  specialties?: string[];
  yearsExperience?: number;
  email?: string;
  website?: string;
  socialLinks?: SocialLinks;
  sameAs?: string[];
  worksFor?: string;
  memberOf?: string[];
}

// Supporting types for Author
export interface Credential {
  name: string;
  issuingOrganization: string;
  url?: string;
  dateIssued?: string;
  expires?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  graduationYear?: number;
  url?: string;
}

export interface Experience {
  position: string;
  organization: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  website?: string;
}

// Enhanced Category type
export interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  metaDescription?: string;
  featuredImage?: Image;
  parent?: SanityReference;
  color?: {
    hex: string;
  };
  language?: string;
}

// FAQ and HowTo types
export interface FAQ {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
  image?: Image;
  url?: string;
}

export interface HowTo {
  totalTime?: string;
  supply?: string[];
  tool?: string[];
  steps?: HowToStep[];
}

// Organization type
export interface Organization {
  _id: string;
  name: string;
  legalName?: string;
  description: string;
  logo: Image;
  url: string;
  contactInfo?: {
    email?: string;
    telephone?: string;
    address?: {
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry?: string;
    };
  };
  socialProfiles?: string[];
  foundingDate?: string;
  organizationType?: string;
}

// Enhanced BlogPost type with all new schema fields
export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  content: PortableTextBlock[];
  coverImage: Image;
  coverImageAlt: string;
  author: Author;
  categories: Category[];
  tags?: string[];
  publishedAt: string;
  lastModified?: string;
  readingTime?: number;
  
  // SEO fields
  metaTitle?: string;
  meta?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  
  // Schema markup fields
  articleType?: string;
  articleSection?: Category;
  wordCount?: number;
  
  // E-E-A-T fields
  medicallyReviewed?: boolean;
  medicalReviewer?: Author;
  reviewDate?: string;
  nextReviewDate?: string;
  
  // Structured content
  faqs?: FAQ[];
  howTo?: HowTo;
  targetAudience?: string[];
  
  // Advanced settings
  featured?: boolean;
  featuredCategory?: boolean;
  noIndex?: boolean;
  canonicalUrl?: string;
  
  // International
  language?: string;
}

// Transformed post for display (with processed URLs, dates, etc.)
export interface DisplayPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: PortableTextBlock[];
  coverImageUrl: string;
  coverImageAlt: string;
  author: {
    name: string;
    avatarUrl?: string;
    jobTitle?: string;
    credentials?: Credential[];
    specialties?: string[];
  };
  publishedAt: string;
  formattedDate: string;
  readingTime: string;
  
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  articleType?: string;
  articleSection?: Category;
  
  // E-E-A-T
  medicallyReviewed?: boolean;
  medicalReviewer?: {
    name: string;
    jobTitle?: string;
  };
  
  // Content
  categories: Category[];
  tags: string[];
  targetAudience?: string[];
  faqs?: FAQ[];
  howTo?: HowTo;
  
  // Settings
  featured: boolean;
  featuredCategory: boolean;
  language?: string;
}

// Enhanced types for inline content
export interface InlineImage {
  _type: 'inlineImage';
  _key: string;
  asset: Image;
  alt: string;
  caption?: string;
  enableOverflow?: boolean;
  loading?: 'lazy' | 'eager';
  size?: 'full' | 'large' | 'medium' | 'small';
}

export interface YouTubeEmbed {
  _type: 'youtubeEmbed';
  _key: string;
  url: string;
  title?: string; // Optional title override
  description?: string;
  transcript?: string;
  keyMoments?: KeyMoment[];
}

export interface KeyMoment {
  time: number;
  title: string;
  description?: string;
} 