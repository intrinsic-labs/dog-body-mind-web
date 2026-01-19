import Link from 'next/link';
import TinifyImage from '@/components/TinifyImage';
import { DisplayPost } from '@/components/blog/presenter-models/DisplayPost';
import { Locale } from '@/domain/locale';

interface BlogCardProps {
  post: DisplayPost;
  currentLocale: Locale;
  variant?: 'default' | 'featured' | 'compact';
}

export default function BlogCard({ post, currentLocale, variant = 'default' }: BlogCardProps) {
  const postUrl = `/${currentLocale}/blog/${post.slug}`;

  // Featured variant - large hero card
  if (variant === 'featured') {
    return (
      <article className="group h-full">
        <Link href={postUrl} className="block h-full">
          <div className="card card-elevated h-full flex flex-col overflow-hidden">
            {/* Cover Image */}
            {post.coverImageUrl && (
              <div className="aspect-[16/10] overflow-hidden">
                <TinifyImage
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt}
                  width={800}
                  height={500}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>
            )}

            <div className="p-6 flex-1 flex flex-col">
              {/* Categories */}
              {post.categories.length > 0 && (
                <div className="mb-4">
                  {post.categories.slice(0, 2).map((category) => (
                    <span
                      key={category._id}
                      className="inline-block px-3 py-1 text-xs font-medium bg-blue/10 text-blue rounded-full mr-2"
                    >
                      {category.title}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl mb-4 group-hover:text-blue transition-colors line-clamp-2">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="text-foreground/70 leading-relaxed mb-6 line-clamp-3 flex-1">
                {post.excerpt}
              </p>

              {/* Meta Info */}
              <div className="flex items-center gap-3 text-sm text-foreground/60 pt-4 border-t border-foreground/5">
                <span className="font-medium">{post.author.name}</span>
                <span>•</span>
                <span>{post.formattedDate}</span>
                <span>•</span>
                <span>{post.readingTime}</span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Compact variant - smaller cards for grid
  if (variant === 'compact') {
    return (
      <article className="group">
        <Link href={postUrl} className="block">
          <div className="card h-full flex flex-col overflow-hidden">
            {/* Cover Image */}
            {post.coverImageUrl && (
              <div className="aspect-[16/9] overflow-hidden">
                <TinifyImage
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>
            )}

            <div className="p-4 flex-1 flex flex-col">
              {/* Category - just first one */}
              {post.categories[0] && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue/10 text-blue rounded-full mb-3 self-start">
                  {post.categories[0].title}
                </span>
              )}

              {/* Title */}
              <h3 className="text-lg mb-2 group-hover:text-blue transition-colors line-clamp-2 flex-1">
                {post.title}
              </h3>

              {/* Meta Info */}
              <div className="flex items-center gap-2 text-xs text-foreground/60 pt-3 border-t border-foreground/5">
                <span>{post.formattedDate}</span>
                <span>•</span>
                <span>{post.readingTime}</span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Default variant - standard card
  return (
    <article className="group">
      <Link href={postUrl} className="block">
        <div className="card card-elevated h-full flex flex-col overflow-hidden">
          {/* Cover Image */}
          {post.coverImageUrl && (
            <div className="aspect-[16/9] overflow-hidden">
              <TinifyImage
                src={post.coverImageUrl}
                alt={post.coverImageAlt}
                width={400}
                height={225}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <div className="p-5 flex-1 flex flex-col">
            {/* Categories */}
            {post.categories.length > 0 && (
              <div className="mb-3">
                {post.categories.slice(0, 2).map((category) => (
                  <span
                    key={category._id}
                    className="inline-block px-2 py-1 text-xs font-medium bg-blue/10 text-blue rounded-full mr-2"
                  >
                    {category.title}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h3 className="text-xl mb-3 group-hover:text-blue transition-colors line-clamp-2">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-foreground/70 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
              {post.excerpt}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-2 text-xs text-foreground/60 pt-3 border-t border-foreground/5">
              <span className="font-medium">{post.author.name}</span>
              <span>•</span>
              <span>{post.formattedDate}</span>
              <span>•</span>
              <span>{post.readingTime}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
} 