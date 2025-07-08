import Link from 'next/link';
import Image from 'next/image';
import { DisplayPost } from '@/lib/blog-types';

interface BlogCardProps {
  post: DisplayPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="bg-background border border-foreground/10 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-orange/20">
          {/* Cover Image */}
          {post.coverImageUrl && (
            <div className="aspect-video overflow-hidden">
              <Image 
                src={post.coverImageUrl} 
                alt={post.coverImageAlt}
                width={400}
                height={225}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          
          <div className="p-6">
            {/* Categories */}
            {post.categories.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((category: {_id: string, title: string, slug: string}) => (
                    <span 
                      key={category._id}
                      className="inline-block px-2 py-1 text-xs bg-orange/10 text-orange rounded-full"
                    >
                      {category.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Title */}
            <h3 className="mb-3 group-hover:text-orange transition-colors line-clamp-2">
              {post.title}
            </h3>
            
            {/* Excerpt */}
            <p className="text-foreground/70 text-sm leading-relaxed mb-4">
              {post.excerpt}
            </p>
            
            {/* Meta Info */}
            <div className="flex items-center gap-2 text-xs text-foreground/60 mb-4">
              <span className="font-medium">{post.author.name}</span>
              <span>•</span>
              <span>{post.formattedDate}</span>
              <span>•</span>
              <span>{post.readingTime}</span>
            </div>
            
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 3).map((tag: string) => (
                  <span 
                    key={tag}
                    className="inline-block px-2 py-1 text-xs bg-foreground/5 text-foreground/60 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs text-foreground/40">
                    +{post.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
} 