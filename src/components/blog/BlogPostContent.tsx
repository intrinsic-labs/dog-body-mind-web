"use client";

import { useEffect, useState } from 'react';
import { BlogPost } from '@/lib/blog';
import { PortableText, PortableTextComponents } from '@portabletext/react';
import Link from 'next/link';
import Image from 'next/image';
import { FiInstagram, FiFacebook } from 'react-icons/fi';
import { FaXTwitter } from "react-icons/fa6";
import ScrollableImage from './ScrollableImage';
import YouTubeEmbedSanity from './YouTubeEmbedSanity';

interface BlogPostContentProps {
  post: BlogPost;
}

const BlogPostContent = ({ post }: BlogPostContentProps) => {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch with syntax highlighting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Define components for PortableText
  const components: PortableTextComponents = {
    types: {
      image: ({ value }: { value: { url: string; alt?: string; caption?: string } }) => {
        return (
          <div className="my-8">
            <Image 
              src={value.url} 
              alt={value.alt || ''} 
              width={800}
              height={600}
              className="w-full" 
              loading="lazy"
            />
            {value.caption && (
              <p className="text-center text-neutral-400 mt-2 text-sm">{value.caption}</p>
            )}
          </div>
        );
      },
      inlineImage: ({ value }: { 
        value: {
          asset: { _ref: string; _type: string };
          alt?: string;
          caption?: string;
          enableOverflow?: boolean;
          hotspot?: { x: number; y: number; height: number; width: number };
        }
      }) => {
        return <ScrollableImage value={value} />;
      },
      youtubeEmbed: ({ value }: { value: { url: string; title?: string } }) => {
        console.log('BlogPostContent youtubeEmbed type received:', value); // Debug logging
        return <YouTubeEmbedSanity value={value} />;
      },
    },
    block: {
      h1: ({ children }) => (
        <h1 className="mt-12 mb-6 text-primary">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="mt-10 mb-4 text-primary">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="mt-8 mb-4 text-primary">{children}</h3>
      ),
      normal: ({ children }) => (
        <p className="text-primary mb-6">{children}</p>
      ),
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-black/30 pl-4 italic text-primary my-6">{children}</blockquote>
      ),
    },
    marks: {
      link: ({ children, value }) => (
        <a href={value?.href} className="text-primary hover:text-pink underline transition-colors duration-300" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      code: ({ children }) => <code className="bg-neutral-300 px-1 py-0.5 font-calling-code">{children}</code>,
    },
    list: {
      bullet: ({ children }) => <ul className="list-disc pl-6 mb-6 text-primary">{children}</ul>,
      number: ({ children }) => <ol className="list-decimal pl-6 mb-6 text-primary">{children}</ol>,
    },
    listItem: {
      bullet: ({ children }) => <li className="mb-2 text-primary">{children}</li>,
      number: ({ children }) => <li className="mb-2 text-primary">{children}</li>,
    },
  };

  if (!mounted) {
    return (
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-neutral-800/50 w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-4 md:pt-8 pb-16 px-4 sm:px-6">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="">
            <PortableText
              value={post.content}
              components={components}
            />
          </div>
          
          {/* Tags */}
          <div className="mt-16 pt-8 border-t border-neutral-800/50">
            <h3 className="mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Link 
                  key={index} 
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className="text-sm px-3 py-1 bg-olive/50 text-neutral-800 hover:bg-olive hover:text-secondary transition-colors duration-300"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Share */}
          <div className="mt-12">
            <h3 className="mb-4">Share this article</h3>
            <div className="flex space-x-4">
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-olive/50 text-neutral-800 hover:bg-olive hover:text-secondary transition-colors duration-300"
                aria-label="Share on Twitter"
              >
                <FaXTwitter />
              </a>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&hashtag=%23dogbodymind`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-olive/50 text-neutral-800 hover:bg-olive hover:text-secondary transition-colors duration-300"
                aria-label="Share on Facebook"
              >
                <FiFacebook />
              </a>
              <a 
                href={`https://instagram.com/`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-olive/50 text-neutral-800 hover:bg-olive hover:text-secondary transition-colors duration-300"
                aria-label="Share on Instagram"
              >
                <FiInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPostContent; 