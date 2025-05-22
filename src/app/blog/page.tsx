import { getAllBlogPosts, getFeaturedBlogPosts } from "@/lib/blog";
import BlogPageContent from '@/components/blog/BlogPageContent';

// Removed the direct query and client usage
// const POSTS_QUERY = `*[
//   _type == "post"
//   && defined(slug.current)
// ]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt, coverImage}`;

// const options = { next: { revalidate: 30 } }; // Revalidation is handled within the lib functions

export default async function BlogPage() {
  // Fetch all posts and featured posts using functions from lib/blog.ts
  const allPosts = await getAllBlogPosts();
  const featuredPosts = await getFeaturedBlogPosts();

  // Pass both sets of posts to the content component
  return <BlogPageContent allPosts={allPosts} featuredPosts={featuredPosts} />;
} 