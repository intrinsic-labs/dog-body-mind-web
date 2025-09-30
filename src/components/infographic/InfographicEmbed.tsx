'use client';

import { useState, useRef, useEffect } from 'react';
import TinifyImage from '@/components/TinifyImage';
import { FiShare2, FiDownload, FiLink, FiX } from 'react-icons/fi';
import { InfographicByIdQueryResult } from '@/lib/sanity.types';
import { Locale } from '@/lib/locale';

interface InfographicEmbedProps {
  infographic: NonNullable<InfographicByIdQueryResult>;
  language: Locale;
  blogPostUrl?: string;
}

export default function InfographicEmbed({
  infographic,
  language,
  blogPostUrl
}: InfographicEmbedProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    }

    if (isShareOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShareOpen]);

  const handleDownload = async () => {
    if (downloading) return;

    setDownloading(true);

    try {
      const params = new URLSearchParams({
        lang: language,
      });

      if (blogPostUrl) {
        params.append('source', blogPostUrl);
      }

      const downloadUrl = `/api/download/infographic/${infographic._id}?${params.toString()}`;

      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${infographic.downloadFilename || `infographic-${language}`}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsShareOpen(false);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareLink = async () => {
    if (!blogPostUrl) return;

    try {
      await navigator.clipboard.writeText(blogPostUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = blogPostUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (!infographic.image) {
    return null;
  }

  return (
    <figure className="my-8 relative group">
      {/* Share Button - positioned absolutely in top right */}
      <div className="absolute top-4 right-4 z-10" ref={dropdownRef}>
        <button
          onClick={() => setIsShareOpen(!isShareOpen)}
          className="bg-white/90 backdrop-blur-sm hover:bg-white border border-foreground/20 hover:border-foreground/30 rounded-lg p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Share infographic"
        >
          {isShareOpen ? (
            <FiX className="w-5 h-5 text-foreground" />
          ) : (
            <FiShare2 className="w-5 h-5 text-foreground" />
          )}
        </button>

        {/* Dropdown Menu */}
        {isShareOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-foreground/20 rounded-lg shadow-xl overflow-hidden z-20">
            {blogPostUrl && (
              <button
                onClick={handleShareLink}
                className="w-full px-4 py-3 text-left hover:bg-foreground/5 transition-colors flex items-center gap-3"
              >
                <FiLink className="w-4 h-4 text-foreground/70" />
                <span className="text-sm font-medium">
                  {copySuccess ? 'Link copied!' : 'Share link'}
                </span>
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full px-4 py-3 text-left hover:bg-foreground/5 transition-colors flex items-center gap-3 disabled:opacity-50"
            >
              <FiDownload className="w-4 h-4 text-foreground/70" />
              <span className="text-sm font-medium">
                {downloading ? 'Generating PDF...' : 'Download PDF'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Main Infographic Image */}
      <div className="w-full rounded-2xl overflow-hidden">
        <TinifyImage
          src={infographic.image.url || ''}
          alt={infographic.altText || ''}
          width={infographic.image.metadata?.dimensions?.width || 800}
          height={infographic.image.metadata?.dimensions?.height || 600}
          className="w-full h-auto object-cover"
          priority={false}
          placeholder={infographic.image.metadata?.lqip ? 'blur' : 'empty'}
          blurDataURL={infographic.image.metadata?.lqip || undefined}
        />
      </div>

      {/* Caption */}
      {infographic.title && (
        <figcaption className="mt-4 text-sm text-foreground/70 text-center italic leading-relaxed">
          {infographic.title}
        </figcaption>
      )}
    </figure>
  );
}
