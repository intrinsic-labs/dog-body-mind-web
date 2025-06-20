import { PortableTextBlock } from '@portabletext/types';
import { YouTubeEmbed, InlineImage } from './blog-types';
import { getYouTubeId, fetchYouTubeMetadata, generateVideoSchema } from './youtube-utils';

// Extract all YouTube embeds from Portable Text content
export function extractYouTubeEmbeds(content: PortableTextBlock[]): YouTubeEmbed[] {
  const embeds: YouTubeEmbed[] = [];
  
  function traverse(blocks: any[]) {
    for (const block of blocks) {
      if (block._type === 'youtubeEmbed') {
        embeds.push(block as YouTubeEmbed);
      }
      // Recursively check nested content
      if (block.children) {
        traverse(block.children);
      }
      if (Array.isArray(block)) {
        traverse(block);
      }
    }
  }
  
  traverse(content);
  return embeds;
}

// Extract all inline images from Portable Text content
export function extractInlineImages(content: PortableTextBlock[]): InlineImage[] {
  const images: InlineImage[] = [];
  
  function traverse(blocks: any[]) {
    for (const block of blocks) {
      if (block._type === 'inlineImage' || block._type === 'image') {
        images.push(block as InlineImage);
      }
      if (block.children) {
        traverse(block.children);
      }
      if (Array.isArray(block)) {
        traverse(block);
      }
    }
  }
  
  traverse(content);
  return images;
}

// Generate schema markup for all embedded content
export async function generateEmbeddedContentSchema(content: PortableTextBlock[]) {
  const schemas: any[] = [];
  
  // Process YouTube embeds
  const youtubeEmbeds = extractYouTubeEmbeds(content);
  for (const embed of youtubeEmbeds) {
    const videoId = getYouTubeId(embed.url);
    if (videoId) {
      try {
        const metadata = await fetchYouTubeMetadata(embed.url);
        if (!metadata.error) {
          const videoSchema = generateVideoSchema(videoId, metadata, {
            title: embed.title,
            description: embed.description,
            transcript: embed.transcript,
            keyMoments: embed.keyMoments
          });
          schemas.push(videoSchema);
        }
      } catch (error) {
        console.warn('Failed to generate schema for YouTube embed:', embed.url);
      }
    }
  }
  
  // Process inline images (for ImageObject schema if needed)
  const inlineImages = extractInlineImages(content);
  for (const image of inlineImages) {
    if (image.asset) {
      // You could generate ImageObject schema here if needed
      // schemas.push(generateImageSchema(image));
    }
  }
  
  return schemas;
}

// Extract plain text from Portable Text for word count and schema descriptions
export function extractTextFromPortableText(content: PortableTextBlock[]): string {
  let text = '';
  
  function traverse(blocks: any[]) {
    for (const block of blocks) {
      if (block._type === 'block' && block.children) {
        for (const child of block.children) {
          if (child._type === 'span' && child.text) {
            text += child.text + ' ';
          }
        }
      }
      if (block.children && Array.isArray(block.children)) {
        traverse(block.children);
      }
    }
  }
  
  traverse(content);
  return text.trim();
}

// Calculate word count from Portable Text
export function calculateWordCount(content: PortableTextBlock[]): number {
  const text = extractTextFromPortableText(content);
  return text.split(/\s+/).filter(word => word.length > 0).length;
} 