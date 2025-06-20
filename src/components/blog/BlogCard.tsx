import Link from 'next/link';
import Image from 'next/image';
import { DisplayPost } from '@/lib/blog-types';

interface BlogCardProps {
  post: DisplayPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article>
      <Link href={`/blog/${post.slug}`}>
        {post.coverImageUrl && (
          <Image 
            src={post.coverImageUrl} 
            alt={post.coverImageAlt}
            width={400}
            height={200}
            className="w-full"
          />
        )}
        
        <div>
          {post.categories.length > 0 && (
            <div>
              {post.categories.map((category, index) => (
                <span key={category._id}>
                  {category.title}
                  {index < post.categories.length - 1 && ', '}
                </span>
              ))}
            </div>
          )}
          
          <h3>{post.title}</h3>
          
          <p>{post.excerpt}</p>
          
          <div>
            <span>{post.author.name}</span>
            <span> • </span>
            <span>{post.formattedDate}</span>
            <span> • </span>
            <span>{post.readingTime}</span>
          </div>
          
          {post.tags.length > 0 && (
            <div>
              {post.tags.map(tag => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
} 