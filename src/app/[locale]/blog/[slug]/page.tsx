import { Metadata } from 'next';
// import { notFound } from 'next/navigation'; // TODO: Restore when DataManager is integrated
// TODO: Replace with DataManager
// import { getBlogPost, getRawBlogPost, getRelatedBlogPosts, getOrganization } from '@/lib/blog-service';
// import BlogPost from '@/components/blog/BlogPost'; // TODO: Restore when DataManager is integrated
// import BlogList from '@/components/blog/BlogList'; // TODO: Restore when DataManager is integrated
// TODO: Replace with new schema markup system
// import SEOHead, { generateHreflangUrls } from '@/components/SEOHead';
import { Locale } from '@/lib/locale';

export async function generateMetadata({ 
  params: _params 
}: { 
  params: Promise<{ locale: Locale; slug: string }> 
}): Promise<Metadata> {
  // const { locale, slug } = await _params; // TODO: Restore when DataManager is integrated
  // TODO: Replace with DataManager
  // const post = await getBlogPost(slug, locale);
  
  // if (!post) {
  //   return { title: 'Post Not Found' };
  // }
  
  return {
    title: `Blog Post | Dog Body Mind`,
    description: 'Blog post content',
    // openGraph: {
    //   title: post.title,
    //   description: post.metaDescription || post.excerpt,
    //   images: post.coverImageUrl ? [post.coverImageUrl] : [],
    //   locale: locale,
    // },
  };
}

export default async function BlogPostPageNew({ 
  params 
}: { 
  params: Promise<{ locale: Locale; slug: string }> 
}) {
  const { locale, slug } = await params;
  
  // TODO: Replace with DataManager
  // Fetch both display post and raw post for schema generation
  // const [post, rawPost, organization, relatedPosts] = await Promise.all([
  //   getBlogPost(slug, locale),
  //   getRawBlogPost(slug, locale),
  //   getOrganization(),
  //   getRelatedBlogPosts(slug, 3, locale)
  // ]);
  
  // if (!post || !rawPost) {
  //   notFound();
  // }
  
  // Generate hreflang URLs for international SEO
  // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dogbodymind.com';
  // const hreflangUrls = generateHreflangUrls(slug, baseUrl);
  
  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <h1>Blog Post: {slug}</h1>
        <p>Language: {locale}</p>
        <p>TODO: Replace with DataManager implementation</p>
        
        {/* TODO: Restore when DataManager is integrated */}
        {/* <BlogPost post={post} /> */}
        
        {/* Related posts */}
        {/* {relatedPosts.length > 0 && (
          <BlogList 
            posts={relatedPosts} 
            title="Related Posts" 
          />
        )} */}
      </div>
    </main>
  );
} 