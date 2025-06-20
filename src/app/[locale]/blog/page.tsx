import { getAllBlogPosts, getFeaturedBlogPosts } from "@/lib/blog-service";
import BlogList from '@/components/blog/BlogList';
import { Locale } from "@/lib/locale";

export default async function BlogPageNew({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params;
  
  // Fetch posts using our clean new service with locale
  const allPosts = await getAllBlogPosts(locale);
  const featuredPosts = await getFeaturedBlogPosts(locale);

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