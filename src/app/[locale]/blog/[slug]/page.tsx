import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPost, getRelatedBlogPosts } from '@/lib/blog-service';
import BlogPost from '@/components/blog/BlogPost';
import BlogList from '@/components/blog/BlogList';
import { Locale } from '@/lib/locale';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: Locale; slug: string }> 
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPost(slug, locale);
  
  if (!post) {
    return { title: 'Post Not Found' };
  }
  
  return {
    title: `${post.title} | Dog Body Mind`,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
      locale: locale,
    },
  };
}

export default async function BlogPostPageNew({ 
  params 
}: { 
  params: Promise<{ locale: Locale; slug: string }> 
}) {
  const { locale, slug } = await params;
  const post = await getBlogPost(slug, locale);
  
  if (!post) {
    notFound();
  }
  
  const relatedPosts = await getRelatedBlogPosts(slug, 3, locale);
  
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