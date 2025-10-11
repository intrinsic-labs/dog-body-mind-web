import { Metadata } from 'next';
import { DataManager } from '@/lib/data-manager';
import { generateArticleListingMetadata } from '@/lib/metadata/article-metadata';
import { transformPostForDisplay } from '@/lib/blog-types';
import BlogList from '@/components/blog/BlogList';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Locale } from '@/lib/locale';
import { getNewsletterContent } from '@/lib/site-settings-utils';


export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: Locale }> 
}): Promise<Metadata> {
  const { locale } = await params;
  
  try {
    const dataManager = new DataManager(locale);
    await dataManager.initialize();
    const organization = await dataManager.getOrganization();
    
    if (!organization) {
      throw new Error('Missing organization data');
    }
    
    return generateArticleListingMetadata(
      'Blog',
      organization.description || 'Latest articles and insights about dog health, behavior, and well-being.',
      organization,
      locale
    );
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog | Dog Body Mind',
      description: 'Latest articles and insights about dog health, behavior, and well-being.',
    };
  }
}

export default async function BlogPage({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params;

  try {
    // All data fetching happens at build time
    const dataManager = new DataManager(locale);
    await dataManager.initialize();
    const posts = await dataManager.getAllPosts();

    // Transform posts for component consumption
    const displayPosts = await Promise.all(
      posts.map(async (post) => {
        // Get full post data with references for each post
        const postWithReferences = await dataManager.getPost(post.slug.current);
        return transformPostForDisplay(postWithReferences);
      })
    );

    // Fetch newsletter content
    const newsletterContent = await getNewsletterContent(locale);

    return (
      <main>
        <div className="container mx-auto px-4 py-8 flex flex-col items-center">
          <h1>Dog Body Mind Blog</h1>
          <BlogList posts={displayPosts} currentLocale={locale} />
        </div>

        {/* Newsletter Signup */}
        {newsletterContent && (
          <div className="mt-12">
            <NewsletterSignup content={newsletterContent} />
          </div>
        )}
      </main>
    );
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return (
      <main>
        <div className="container mx-auto px-4 py-8">
          <h1>Blog</h1>
          <p>Sorry, we couldn&apos;t load the blog posts at this time.</p>
        </div>
      </main>
    );
  }
} 