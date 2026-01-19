
import type { Citation } from '@/presentation/schema/generators/citation-schema'
import { PortableTextBlock } from "@portabletext/types"

export interface DisplayPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: PortableTextBlock[] // Portable text content
  coverImageUrl: string | null
  coverImageAlt: string
  author: {
    _id: string
    name: string
    slug: string
  }
  categories: Array<{
    _id: string
    title: string
    slug: string
  }>
  tags: string[]
  publishedAt: string
  formattedDate: string
  readingTime: string
  featured?: boolean
  featuredCategory?: boolean
  references?: Citation[]
}