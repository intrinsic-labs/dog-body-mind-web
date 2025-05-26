"use client";

import { useState } from 'react';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

const YouTubeEmbed = ({ url, title }: YouTubeEmbedProps) => {
  const [isLoading, setIsLoading] = useState(true);

  // Extract video ID from various YouTube URL formats
  const getVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = getVideoId(url);

  if (!videoId) {
    // Fallback to a regular link if we can't extract video ID
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:text-pink underline transition-colors duration-300"
      >
        {title || url}
      </a>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="my-4">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 animate-pulse">
            <div className="text-neutral-600">Loading video...</div>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title || `YouTube video ${videoId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
          onLoad={() => setIsLoading(false)}
        />
      </div>
      {title && (
        <p className="text-center text-neutral-400 mt-2 text-sm">{title}</p>
      )}
    </div>
  );
};

export default YouTubeEmbed; 