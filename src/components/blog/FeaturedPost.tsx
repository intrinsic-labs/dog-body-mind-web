import Link from 'next/link';
import { BlogPost } from '@/lib/blog';
import Image from 'next/image';

// Define the props interface
interface FeaturedPostProps {
  posts: BlogPost[];
}

export default function FeaturedPost({ posts }: FeaturedPostProps) {
  // If there are no featured posts, don't render anything (or render a placeholder)
  if (!posts || posts.length === 0) {
    // Optionally, return a placeholder or null
    // return <p>No featured posts available.</p>;
    return null;
  }

  // Typically, you'd feature just one post, or a select few.
  // Let's assume we feature the first post from the featured list.
  const featuredPost = posts[0];

  return (
    <section className="py-8 md:px-4 md:py-16 bg-background/30">
      <div className="container-custom">
        <div className="mb-6">
          <span className="inline-block text-primary text-md font-medium">FEATURED PAPER</span>
        </div>

        <Link href={`/blog/${featuredPost.slug}`} className="block group">
          <div 
            className="relative overflow-hidden"
          >
            {/* Image */}
            <div className="relative aspect-[3/4.5] md:aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden">
          {featuredPost.coverImage && (
                <Image 
                width={1000}
                height={1000}
                src={featuredPost.coverImage}
                  alt={featuredPost.title} 
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                />
              )}
              
              {/* Gradient overlay */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-primary to-transparent z-10 pointer-events-none"
              />
              
              {/* Content overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-12 z-20">
                <div className="max-w-3xl">
                  <div className="flex items-center space-x-1 mb-3 text-sm font-sans text-neutral-800/60 group-hover:text-orange transition-colors duration-300">
                    <span>Featured Post</span>
                    <span className="text-neutral-800/40">|</span>
                    <span>{featuredPost.readingTime}</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-heading1 font-bold text-secondary mb-4">
                    {featuredPost.title}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};
