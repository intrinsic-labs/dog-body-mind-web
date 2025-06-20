import Image from 'next/image';
import Link from 'next/link';
import { DisplayPost } from '@/lib/blog-types';
import PortableTextRenderer from './PortableTextRenderer';

interface BlogPostProps {
  post: DisplayPost;
}

export default function BlogPost({ post }: BlogPostProps) {
  return (
    <article>
      <header>
        {/* Cover image */}
        {post.coverImageUrl && (
          <Image 
            src={post.coverImageUrl} 
            alt={post.coverImageAlt}
            width={1200}
            height={600}
            className="w-full"
            priority
          />
        )}
        
        {/* Categories */}
        {post.categories.length > 0 && (
          <div>
            {post.categories.map((category, index) => (
              <Link key={category._id} href={`/blog/category/${category.slug}`}>
                {category.title}
                {index < post.categories.length - 1 && ', '}
              </Link>
            ))}
          </div>
        )}
        
        {/* Title */}
        <h1>{post.title}</h1>
        
        {/* Meta info */}
        <div>
          <span>{post.author.name}</span>
          <span> • </span>
          <time dateTime={post.publishedAt}>{post.formattedDate}</time>
          <span> • </span>
          <span>{post.readingTime}</span>
        </div>
        
        {/* Excerpt */}
        <p>{post.excerpt}</p>
      </header>
      
      {/* Content */}
      <div>
        <PortableTextRenderer content={post.content} />
      </div>
      
      {/* Footer */}
      <footer>
        {/* Tags */}
        {post.tags.length > 0 && (
          <div>
            <h3>Tags</h3>
            <div>
              {post.tags.map(tag => (
                <Link key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`}>
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </footer>
    </article>
  );
} 