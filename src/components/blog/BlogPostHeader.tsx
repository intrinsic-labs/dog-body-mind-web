import Image from 'next/image';
import { BlogPost } from '@/lib/blog';

interface BlogPostHeaderProps {
  post: BlogPost;
}

const BlogPostHeader = ({ post }: BlogPostHeaderProps) => {
  return (
    <section className="relative pt-8 md:pt-12 lg:pt-16 overflow-hidden px-4 sm:px-6">
      <div className="container-custom relative z-10">

        {/* Featured image */}
        <div
            className="overflow-hidden mx-auto"
          >
            {post.coverImage && (
              <div className="aspect-w-16 aspect-h-16 md:aspect-h-12 lg:aspect-h-8 max-w-3xl mx-auto">
                <Image 
                  src={post.coverImage} 
                  alt={post.title} 
                  width={1200}
                  height={800}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            )}
          </div>
        
        <div className="max-w-4xl mx-auto md:pt-8 text-center">
          {/* Category */}
          <div
            className="flex flex-wrap gap-2 mb-6 justify-center"
          >
            {/* {post.category && (
              <Link 
                key={post.category} 
                href={`/?category=${encodeURIComponent(post.category)}`}
                className="text-sm px-3 py-1 border border-olive text-neutral-800 hover:bg-olive hover:text-secondary transition-colors duration-300"
              >
                {post.category}
              </Link>
            )} */}
          </div>
          
          {/* Title */}
          <h1
            className="text-5xl md:text-7xl mb-6 text-center"
          >
            {post.title}
          </h1>
          
          {/* Meta info */}
          <div
            className="flex flex-wrap items-center gap-2 md:gap-5 mb-10 justify-center"
          >
            <div className="text-md text-neutral-800">
              {post.author.name}
            </div>
            <span className="text-neutral-400">|</span>
            <div className="text-md text-neutral-800">
              {post.date}
            </div>
            
            <span className="text-neutral-400">|</span>
            
            <div className="text-md text-neutral-800">
              {post.readingTime}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPostHeader; 