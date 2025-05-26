"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/client';

interface ScrollableImageProps {
  value: {
    asset: {
      _ref: string;
      _type: string;
    };
    alt?: string;
    caption?: string;
    enableOverflow?: boolean;
    hotspot?: { x: number; y: number; height: number; width: number };
  };
}

const ScrollableImage = ({ value }: ScrollableImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const { alt = '', caption, enableOverflow = false } = value;

  // Get image URL from Sanity
  const imageUrl = urlFor(value).url();

  // Load image to get dimensions
  useEffect(() => {
    if (imageUrl && typeof window !== 'undefined') {
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setImageLoaded(true);
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  if (!imageUrl) return null;

  return (
    <div className="my-8">
      {enableOverflow ? (
        <div className="overflow-x-auto">
          <div
            className="relative"
            style={{
              width: imageLoaded ? `${Math.max(imageDimensions.width, 800)}px` : 'auto',
              minWidth: '100%'
            }}
          >
            <Image
              src={imageUrl}
              alt={alt}
              width={imageDimensions.width || 800}
              height={imageDimensions.height || 600}
              className="block"
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        <div className="relative">
          <Image
            src={imageUrl}
            alt={alt}
            width={imageDimensions.width || 800}
            height={imageDimensions.height || 600}
            className="w-full h-auto"
            loading="lazy"
          />
        </div>
      )}
      
      {caption && (
        <p className="text-center text-neutral-400 mt-3 text-sm italic">
          {caption}
        </p>
      )}
      
      {enableOverflow && (
        <p className="text-center text-neutral-500 mt-2 text-xs">
          ← Scroll to explore →
        </p>
      )}
    </div>
  );
};

export default ScrollableImage; 