import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { Image } from '@sanity/types';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'; // Use a recent API version date
//const token = process.env.SANITY_API_READ_TOKEN; // Read the server-side token

if (!projectId || !dataset) {
  throw new Error('Missing Sanity project ID or dataset. Check your .env.local file.');
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion, 
  useCdn: process.env.NODE_ENV === 'production', // Use CDN in production for faster responses
  //token, // Include the API token for authenticated requests
  ignoreBrowserTokenWarning: true // Add this if using token in non-server environments (less relevant here but good practice)
});

// Helper function for generating image URLs with the asset reference
const builder = imageUrlBuilder(client);

// Basic image URL builder - flexible for any transformations
export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}

// Opinionated image URL builder with sensible defaults
export function urlForImage(source: Image) {
  if (!source?.asset?._ref) {
    return null;
  }
  
  // Hotspot/crop is automatically respected when the source includes this data
  return builder.image(source).auto('format').fit('max').url();
} 