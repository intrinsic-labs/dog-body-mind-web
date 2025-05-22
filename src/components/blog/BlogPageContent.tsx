
import BlogHero from './BlogHero';
import BlogPosts from './BlogPosts';
import FeaturedPost from './FeaturedPost';
import { BlogPost } from '@/lib/blog'; // Import the BlogPost type

// Define the props interface
interface BlogPageContentProps {
  allPosts: BlogPost[];
  featuredPosts: BlogPost[];
}

export default function BlogPageContent({ allPosts, featuredPosts }: BlogPageContentProps) {
  return (
    <main className="min-h-screen bg-background text-primary relative max-w-6xl mx-auto px-4 sm:px-6">
      <BlogHero />
      <FeaturedPost posts={featuredPosts} />
      <BlogPosts posts={allPosts} />
    </main>
  );
} 