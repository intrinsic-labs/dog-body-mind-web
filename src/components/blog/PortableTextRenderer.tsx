'use client';

import { PortableText, PortableTextComponents } from '@portabletext/react';
import { PortableTextBlock } from '@portabletext/types';
import Image from 'next/image';
import { urlFor } from '@/sanity/client';
import { InlineImage, YouTubeEmbed } from '@/lib/blog-types';
import { getYouTubeId } from '@/lib/youtube-utils';

interface PortableTextRendererProps {
  content: PortableTextBlock[];
}

// Simplified YouTube embed component for display only
function YouTubeEmbedComponent({ value }: { value: YouTubeEmbed }) {
  const videoId = getYouTubeId(value.url);
  
  if (!videoId) {
    return <p>Invalid YouTube URL</p>;
  }

  // Use override title if provided
  const displayTitle = value.title;

  return (
    <div className="my-8">
      {displayTitle && (
        <h4 className="mb-4 font-semibold">{displayTitle}</h4>
      )}
      
      {value.description && (
        <p className="mb-4 text-gray-600">{value.description}</p>
      )}
      
      <div className="relative w-full aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={displayTitle || 'YouTube video'}
          className="absolute inset-0 w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      
      {/* Key moments navigation */}
      {value.keyMoments && value.keyMoments.length > 0 && (
        <div className="mt-4">
          <h5 className="font-medium mb-2">Video Chapters:</h5>
          <ul className="space-y-1">
            {value.keyMoments.map((moment, index) => {
              const minutes = Math.floor(moment.time / 60);
              const seconds = moment.time % 60;
              const timestamp = `${minutes}:${seconds.toString().padStart(2, '0')}`;
              
              return (
                <li key={index} className="text-sm">
                  <a 
                    href={`${value.url}&t=${moment.time}s`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {timestamp} - {moment.title}
                  </a>
                  {moment.description && (
                    <p className="text-gray-600 ml-4">{moment.description}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {/* Transcript for accessibility and SEO */}
      {value.transcript && (
        <details className="mt-4">
          <summary className="cursor-pointer font-medium">Video Transcript</summary>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
            {value.transcript}
          </div>
        </details>
      )}
    </div>
  );
}

// Enhanced inline image component with SEO features
function InlineImageComponent({ value }: { value: InlineImage }) {
  const imageUrl = urlFor(value.asset).url();
  
  if (!imageUrl) return null;

  // Size class mapping
  const sizeClasses = {
    full: 'w-full',
    large: 'w-3/4 mx-auto',
    medium: 'w-1/2 mx-auto',
    small: 'w-1/4 mx-auto'
  };

  const sizeClass = sizeClasses[value.size || 'full'];
  const loading = value.loading || 'lazy';

  return (
    <figure className={`my-6 ${sizeClass}`}>
      <div className={value.enableOverflow ? 'overflow-x-auto' : ''}>
        <Image
          src={imageUrl}
          alt={value.alt}
          width={800}
          height={600}
          loading={loading}
          className="rounded-lg"
          style={{ 
            width: '100%', 
            height: 'auto',
            minWidth: value.enableOverflow ? 'max-content' : undefined
          }}
        />
      </div>
      {value.caption && (
        <figcaption className="mt-2 text-sm text-gray-600 text-center italic">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function PortableTextRenderer({ content }: PortableTextRendererProps) {
  const components: PortableTextComponents = {
    types: {
      image: ({ value }) => <InlineImageComponent value={value as InlineImage} />,
      inlineImage: ({ value }) => <InlineImageComponent value={value as InlineImage} />,
      youtubeEmbed: ({ value }) => <YouTubeEmbedComponent value={value as YouTubeEmbed} />,
    },
    block: {
      h1: ({ children }) => <h1>{children}</h1>,
      h2: ({ children }) => <h2>{children}</h2>,
      h3: ({ children }) => <h3>{children}</h3>,
      h4: ({ children }) => <h4>{children}</h4>,
      normal: ({ children }) => <p>{children}</p>,
      blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    },
    marks: {
      link: ({ children, value }) => {
        const target = value?.blank ? '_blank' : undefined;
        const rel = value?.blank ? 'noopener noreferrer' : undefined;
        
        return (
          <a href={value?.href} target={target} rel={rel}>
            {children}
          </a>
        );
      },
      strong: ({ children }) => <strong>{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
      code: ({ children }) => <code>{children}</code>,
      underline: ({ children }) => <u>{children}</u>,
      'strike-through': ({ children }) => <s>{children}</s>,
    },
    list: {
      bullet: ({ children }) => <ul>{children}</ul>,
      number: ({ children }) => <ol>{children}</ol>,
    },
    listItem: {
      bullet: ({ children }) => <li>{children}</li>,
      number: ({ children }) => <li>{children}</li>,
    },
  };

  return <PortableText value={content} components={components} />;
} 