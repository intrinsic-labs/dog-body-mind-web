import Image from 'next/image';
import Link from 'next/link';
import { DisplayPost } from '@/lib/blog-types';
import PortableTextRenderer from './PortableTextRenderer';

interface BlogPostProps {
  post: DisplayPost;
}

export default function BlogPost({ post }: BlogPostProps) {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
      <header className="mb-12 flex flex-col items-center">
        {/* Categories */}
        {post.categories.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {post.categories.map((category: {_id: string, title: string, slug: string}) => (
                <Link 
                  key={category._id} 
                  href={`/blog/category/${category.slug}`}
                  className="inline-block px-3 py-1 text-sm bg-orange/10 text-orange rounded-full hover:bg-orange/20 transition-colors"
                >
                  {category.title}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Title */}
        <h1 className="mb-6 max-w-2xl text-center">{post.title}</h1>
        
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70 mb-8">
          <span className="font-medium">{post.author.name}</span>
          <span className="hidden sm:inline">•</span>
          <time dateTime={post.publishedAt}>{post.formattedDate}</time>
          <span className="hidden sm:inline">•</span>
          <span>{post.readingTime}</span>
        </div>
        
        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden w-full">
            <Image 
              src={post.coverImageUrl} 
              alt={post.coverImageAlt}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        )}
        
        {/* Excerpt */}
        {post.excerpt && (
          <div className="text-lg text-foreground/80 leading-relaxed border-l-4 border-orange pl-6 py-4 bg-orange/5 rounded-r-lg max-w-2xl">
            <p>{post.excerpt}</p>
          </div>
        )}
      </header>
      
      {/* Content */}
      <div className="prose prose-lg max-w-2xl">
        <PortableTextRenderer content={post.content} />
      </div>
      
      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-foreground/10">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Link 
                  key={tag} 
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="inline-block px-3 py-1 text-sm bg-foreground/5 text-foreground/70 rounded-full hover:bg-foreground/10 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Author info */}
        <div className="bg-gradient-to-br from-background to-foreground/5 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange/20 rounded-full flex items-center justify-center">
              <span className="text-orange font-bold text-xl">
                {post.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-lg">Written by {post.author.name}</h4>
              <Link 
                href={`/blog/author/${post.author.slug}`}
                className="text-orange hover:text-orange/80 transition-colors"
              >
                View all posts by {post.author.name} →
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </article>
  );
} 