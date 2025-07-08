import BlogCard from './BlogCard';
import { DisplayPost } from '@/lib/blog-types';

interface BlogListProps {
  posts: DisplayPost[];
  title?: string;
}

export default function BlogList({ posts, title }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {title && <h2 className="text-center mb-8">{title}</h2>}
        <div className="text-center py-16">
          <p className="text-foreground/60 text-lg">No posts found.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {title && <h2 className="text-center mb-12">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
} 