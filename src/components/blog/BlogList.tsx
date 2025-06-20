import BlogCard from './BlogCard';
import { DisplayPost } from '@/lib/blog-types';

interface BlogListProps {
  posts: DisplayPost[];
  title?: string;
}

export default function BlogList({ posts, title }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <section>
        {title && <h2>{title}</h2>}
        <p>No posts found.</p>
      </section>
    );
  }

  return (
    <section>
      {title && <h2>{title}</h2>}
      <div>
        {posts.map(post => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
} 