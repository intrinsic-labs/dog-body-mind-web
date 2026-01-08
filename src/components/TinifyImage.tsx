'use client';

/**
 * TinifyImage - Client Component wrapper for Next.js Image with Tinify CDN loader
 *
 * This component wraps Next.js Image and automatically applies the Tinify loader.
 * It's a client component so the loader function can be passed properly.
 */

import Image, { ImageProps } from 'next/image';
import { tinifyLoader } from '@/lib/tinify-loader';

export default function TinifyImage(props: ImageProps) {
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} loader={tinifyLoader} unoptimized={true} />;
}