/**
 * Tinify CDN Image Loader for Next.js
 *
 * This loader integrates Tinify CDN with Next.js Image optimization.
 * Tinify pulls images from Sanity CDN and serves optimized versions.
 */

import { ImageLoaderProps } from 'next/image';

const TINIFY_CDN_URL = process.env.NEXT_PUBLIC_TINIFY_CDN_URL;

/**
 * Custom image loader for Tinify CDN
 * Falls back to original src if Tinify CDN URL is not configured
 */
export function tinifyLoader({ src, width, quality }: ImageLoaderProps): string {
  // If no Tinify CDN URL is configured, return original src
  if (!TINIFY_CDN_URL) {
    console.warn('NEXT_PUBLIC_TINIFY_CDN_URL not configured, using original image URL');
    return src;
  }

  // Remove leading slash if present
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src;

  // Build Tinify CDN URL with optimization parameters
  const params = new URLSearchParams();
  params.set('w', width.toString());
  params.set('q', (quality || 75).toString());

  return `${TINIFY_CDN_URL}/${cleanSrc}?${params.toString()}`;
}

/**
 * Helper to check if Tinify CDN is configured
 */
export function isTinifyCDNEnabled(): boolean {
  return !!TINIFY_CDN_URL;
}