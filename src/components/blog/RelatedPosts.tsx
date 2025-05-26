import Link from 'next/link';
import { BlogPost } from '@/lib/blog';
import Image from 'next/image';

interface RelatedPostsProps {
  posts: BlogPost[];
}

const RelatedPosts = ({ posts }: RelatedPostsProps) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 bg-background/30">
      <div className="container-custom">
        <div
          className="max-w-4xl mx-auto"
        >
          <h2 className="mb-12 text-center">Related Articles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <RelatedPostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

interface RelatedPostCardProps {
  post: BlogPost;
  index: number;
}

const RelatedPostCard = ({ post }: RelatedPostCardProps) => {
  return (
    <div>
      <Link href={`/${post.slug}`} className="group block h-full">
        <div className="bg-neutral-200 rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300  border border-transparent hover:border-primary/10">
          {/* Image */}
          <div className="relative overflow-hidden">
            {post.coverImage && (
              <div className="aspect-w-16 aspect-h-9">
                <Image 
                  src={post.coverImage} 
                  alt={post.title} 
                  width={400}
                  height={300}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-5 flex flex-col flex-grow">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-neutral-800 text-xs">{post.date}</span>
              <span className="text-neutral-400 text-xs">|</span>
              <span className="text-neutral-800 text-xs">{post.readingTime}</span>
            </div>
            
            <h3 className="text-lg mb-2 group-hover:text-primary transition-colors duration-300">
              {post.title}
            </h3>
            
            <div className="flex flex-wrap gap-2 mt-auto">
              {post.category && (
                <span 
                  key={post.category} 
                  className="text-xs px-2 py-1 rounded-full border border-neutral-500 text-neutral-800 group-hover:border-orange group-hover:text-orange transition-colors duration-300"
                >
                  {post.category}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RelatedPosts; 