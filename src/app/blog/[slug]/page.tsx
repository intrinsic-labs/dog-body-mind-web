import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPost, getRelatedBlogPosts } from '@/lib/blog-service';
import BlogPost from '@/components/blog/BlogPost';
import BlogList from '@/components/blog/BlogList';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  
  if (!post) {
    return { title: 'Post Not Found' };
  }
  
  return {
    title: `${post.title} | Dog Body Mind`,
    description: post.meta || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.meta || post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
    },
  };
}

export default async function BlogPostPageNew({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  
  if (!post) {
    notFound();
  }
  
  const relatedPosts = await getRelatedBlogPosts(slug, 3);
  
  return (
    <main>
      <BlogPost post={post} />
      
      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <BlogList 
          posts={relatedPosts} 
          title="Related Posts" 
        />
      )}
    </main>
  );
} 