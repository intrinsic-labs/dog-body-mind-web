"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface YouTubeEmbedSanityProps {
  value: {
    url: string;
    title?: string;
  };
}

const YouTubeEmbedSanity = ({ value }: YouTubeEmbedSanityProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { url, title } = value;

  console.log('YouTubeEmbedSanity received value:', value); // Debug logging
  console.log('URL:', url, 'Title:', title); // Debug logging

  // Extract video ID from various YouTube URL formats
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const videoId = getYouTubeId(url);
  console.log('Extracted video ID:', videoId);

  // Try multiple thumbnail URLs in order of preference
  const getThumbnailUrl = () => {
    if (!thumbnailError) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const thumbnailUrl = videoId ? getThumbnailUrl() : '';
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : '';

  console.log('Current thumbnail URL:', thumbnailUrl);
  console.log('Thumbnail error state:', thumbnailError);
  console.log('Image loaded state:', imageLoaded);

  useEffect(() => {
    if (!videoId) return;
    
    console.log('YouTubeEmbedSanity mounted for video ID:', videoId);
    
    // Test if the thumbnail URL is accessible
    const testImage = document.createElement('img');
    testImage.onload = () => {
      console.log('Thumbnail test load SUCCESS for:', thumbnailUrl);
    };
    testImage.onerror = () => {
      console.log('Thumbnail test load FAILED for:', thumbnailUrl);
    };
    testImage.src = thumbnailUrl;
  }, [videoId, thumbnailUrl]);

  if (!url) return null;

  if (!videoId) {
    return (
      <div className="my-8 p-4 bg-neutral-100 border border-neutral-300 rounded">
        <p className="text-neutral-600">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="my-8 w-full">
      {title && (
        <h4 className="mb-3 text-lg font-medium text-primary">{title}</h4>
      )}
      <div className="relative w-full h-0 pb-[56.25%] bg-neutral-900 rounded-lg overflow-hidden">
        {!isLoaded ? (
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={() => setIsLoaded(true)}
          >
            <Image
              src={thumbnailUrl}
              alt={title || 'YouTube video thumbnail'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              onLoad={() => {
                console.log('Next.js Image onLoad triggered for:', thumbnailUrl);
                setImageLoaded(true);
              }}
              onError={(e) => {
                console.log('Next.js Image onError triggered for:', thumbnailUrl);
                console.log('Error details:', e);
                if (!thumbnailError) {
                  console.log('Setting thumbnailError to true, will retry with fallback');
                  setThumbnailError(true);
                }
              }}
              unoptimized={thumbnailError} // Use unoptimized for fallback image
            />
            {/* Removed the black overlay - let's see what's underneath */}
            {/* Play button overlay - lighter and only visible on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 bg-red-600 bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg 
                  className="w-8 h-8 text-white ml-1" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            {/* Debug overlay */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs p-1 rounded">
              ID: {videoId} | Loaded: {imageLoaded ? 'Yes' : 'No'} | Error: {thumbnailError ? 'Yes' : 'No'}
            </div>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            title={title || 'YouTube video player'}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

export default YouTubeEmbedSanity; 