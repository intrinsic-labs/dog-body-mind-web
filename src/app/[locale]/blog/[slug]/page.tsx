import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPost, getRawBlogPost, getRelatedBlogPosts, getOrganization } from '@/lib/blog-service';
import BlogPost from '@/components/blog/BlogPost';
import BlogList from '@/components/blog/BlogList';
import SEOHead, { generateHreflangUrls } from '@/components/SEOHead';
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
  
  // Fetch both display post and raw post for schema generation
  const [post, rawPost, organization, relatedPosts] = await Promise.all([
    getBlogPost(slug, locale),
    getRawBlogPost(slug, locale),
    getOrganization(),
    getRelatedBlogPosts(slug, 3, locale)
  ]);
  
  if (!post || !rawPost) {
    notFound();
  }
  
  // Generate hreflang URLs for international SEO
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dogbodymind.com';
  const hreflangUrls = generateHreflangUrls(slug, baseUrl);
  
  return (
    <>
      {/* Enhanced SEO with schema markup */}
      {organization && (
        <SEOHead
          post={rawPost}
          author={rawPost.author}
          organization={organization}
          baseUrl={baseUrl}
          locale={locale}
          type="article"
          hreflangUrls={hreflangUrls}
        />
      )}
      
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
    </>
  );
} 