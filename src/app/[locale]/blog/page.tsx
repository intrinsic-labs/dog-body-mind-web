import { getAllBlogPosts, getFeaturedBlogPosts, getOrganization } from "@/lib/blog-service";
import BlogList from '@/components/blog/BlogList';
import SEOHead, { generatePageHreflangUrls } from '@/components/SEOHead';
import { Locale } from "@/lib/locale";

export default async function BlogPageNew({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params;
  
  // Fetch posts and organization data
  const [allPosts, featuredPosts, organization] = await Promise.all([
    getAllBlogPosts(locale),
    getFeaturedBlogPosts(locale),
    getOrganization()
  ]);

  // SEO configuration
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dogbodymind.com';
  const hreflangUrls = generatePageHreflangUrls('/blog', baseUrl);

  return (
    <>
      {/* SEO Head for blog listing page */}
      {organization && (
        <SEOHead
          organization={organization}
          baseUrl={baseUrl}
          locale={locale}
          title={`Pet Care Blog | ${organization.name}`}
          description={`Expert advice on pet health, training, and care from certified professionals. Discover evidence-based tips for your dog's physical and mental wellbeing.`}
          type="website"
          hreflangUrls={hreflangUrls}
        />
      )}
      
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
    </>
  );
} 