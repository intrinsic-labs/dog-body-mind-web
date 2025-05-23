"use client";

import { useState, useEffect } from 'react';
import PageHero from './PageHero';
import { BlogHeroData } from '@/lib/blog';

const BlogHero = () => {
  const [heroData, setHeroData] = useState<BlogHeroData | null>(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await fetch('/api/blog?action=getBlogHero');
        if (!response.ok) {
          throw new Error('Failed to fetch blog hero data');
        }
        
        const data = await response.json();
        setHeroData(data);
      } catch (error) {
        console.error('Error fetching blog hero data:', error);
      }
    };

    fetchHeroData();
  }, []);

  // Default content if nothing is in the CMS yet
  const title = heroData?.title || "Dog Body Mind";
  const description = heroData?.description || 
    "Tagline Here";

  return (
    <div className="flex flex-col gap-4 mx-4">
      <PageHero
        title={title}
        description={description}
        bottomPadding={false}
      />
      {heroData?.announcement && (
        <a href={heroData.announcementLink} 
        target="_blank"
        rel="noopener noreferrer"
        className="text-lg bg-orange text-white hover:bg-white hover:text-orange border border-orange transition-colors duration-300 px-3 py-1 flex justify-center text-center rounded-md max-w-max mx-auto"
        >
          {heroData.announcement}
        </a>
      )}
    </div>
  );
};

export default BlogHero; 