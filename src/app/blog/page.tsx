import { getAllBlogPosts, getFeaturedBlogPosts } from "@/lib/blog-service";
import BlogList from '@/components/blog/BlogList';

export default async function BlogPageNew() {
  // Fetch posts using our clean new service
  const allPosts = await getAllBlogPosts();
  const featuredPosts = await getFeaturedBlogPosts();

  return (
    <main>
      <h1>Blog</h1>
      
      {/* Featured posts section */}
      {featuredPosts.length > 0 && (
        <BlogList 
          posts={featuredPosts} 
          title="Featured Posts" 
        />
      )}
      
      {/* All posts section */}
      <BlogList 
        posts={allPosts} 
        title="Latest Posts" 
      />
    </main>
  );
} 