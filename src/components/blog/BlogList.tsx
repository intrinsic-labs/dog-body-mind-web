import BlogCard from './BlogCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import { DisplayPost } from '@/lib/blog-types';
import { Locale } from '@/lib/locale';
import { NewsletterContent } from '@/lib/site-settings-utils';

interface BlogListProps {
  posts: DisplayPost[];
  currentLocale: Locale;
  title?: string;
  newsletterContent?: NewsletterContent | null;
}

export default function BlogList({ posts, currentLocale, title, newsletterContent }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <section>
        {title && <h2 className="text-center mb-8">{title}</h2>}
        <div className="text-center py-16">
          <p className="text-foreground/60 text-lg">No posts found.</p>
        </div>
      </section>
    );
  }

  // Find featured post (first one marked as featured, or fallback to first post)
  const featuredPost = posts.find(post => post.featured) || posts[0];
  const remainingPosts = posts.filter(post => post._id !== featuredPost._id);

  return (
    <section>
      {title && <h2 className="text-center mb-12">{title}</h2>}

      {/* Featured + First 2 Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Featured Post - Large on left, full width on mobile */}
        <div className="lg:row-span-2">
          <BlogCard
            key={featuredPost._id}
            post={featuredPost}
            currentLocale={currentLocale}
            variant="featured"
          />
        </div>

        {/* First 2 compact posts - Right side */}
        {remainingPosts.slice(0, 2).map(post => (
          <BlogCard
            key={post._id}
            post={post}
            currentLocale={currentLocale}
            variant="compact"
          />
        ))}
      </div>

      {/* Newsletter Signup - Full Width */}
      {newsletterContent && (
        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen mb-8">
          <NewsletterSignup content={newsletterContent} />
        </div>
      )}

      {/* Next 2 Posts */}
      {remainingPosts.length > 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {remainingPosts.slice(2, 4).map(post => (
            <BlogCard
              key={post._id}
              post={post}
              currentLocale={currentLocale}
              variant="compact"
            />
          ))}
        </div>
      )}

      {/* Additional Posts - Regular Grid */}
      {remainingPosts.length > 4 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {remainingPosts.slice(4).map(post => (
            <BlogCard
              key={post._id}
              post={post}
              currentLocale={currentLocale}
            />
          ))}
        </div>
      )}

      {/* Newsletter Signup - Full Width (Bottom) */}
      {newsletterContent && (
        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
          <NewsletterSignup content={newsletterContent} />
        </div>
      )}
    </section>
  );
} 