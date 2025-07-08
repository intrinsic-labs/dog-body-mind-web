import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DataManager } from '@/lib/data-manager';
import { generateArticleSchema } from '@/lib/schema/generators/article-schema';
import { generateArticleMetadata } from '@/lib/metadata/article-metadata';
import { transformPostForDisplay } from '@/lib/blog-types';
import BlogPost from '@/components/blog/BlogPost';
import { Locale } from '@/lib/locale';

export async function generateStaticParams() {
  // In development, don't pre-generate all params to avoid performance issues
  // In production, this will run at build time and generate all paths
  if (process.env.NODE_ENV === 'development') {
    return [];
  }
  
  // Generate static params for all locales and all posts at build time
  const locales: Locale[] = ['en', 'uk', 'de', 'fr', 'es', 'it'];
  const params = [];
  
  for (const locale of locales) {
    const dataManager = new DataManager(locale);
    await dataManager.initialize();
    const posts = await dataManager.getAllPosts();
    
    for (const post of posts) {
      params.push({
        locale,
        slug: post.slug.current
      });
    }
  }
  
  return params;
}

export async function generateMetadata({ 
  params: _params 
}: { 
  params: Promise<{ locale: Locale; slug: string }> 
}): Promise<Metadata> {
  const { locale, slug } = await _params;
  
  try {
    const dataManager = new DataManager(locale);
    await dataManager.initialize();
    const postWithReferences = await dataManager.getPost(slug);
    
    const { post, organization } = postWithReferences;
    
    if (!post || !organization) {
      throw new Error('Missing required post or organization data');
    }
    
    // Generate OpenGraph/Twitter/page metadata
    const metadata = generateArticleMetadata(postWithReferences, {
      language: locale
    });
    
    // Generate schema markup for JSON-LD
    const schema = generateArticleSchema(postWithReferences, {
      baseUrl: organization.url,
      language: locale
    });
    
    // Combine metadata with schema
    return {
      ...metadata,
      other: {
        // Add JSON-LD schema to page head
        'application/ld+json': JSON.stringify(schema, null, 2)
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Post Not Found | Dog Body Mind',
      description: 'The requested blog post could not be found.'
    };
  }
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ locale: Locale; slug: string }> 
}) {
  const { locale, slug } = await params;
  
  try {
    // All data fetching happens at build time
    const dataManager = new DataManager(locale);
    await dataManager.initialize();
    const postWithReferences = await dataManager.getPost(slug);
    
    // Transform for component consumption
    const displayPost = transformPostForDisplay(postWithReferences);
    
    return (
      <main>
        <div className="container mx-auto px-4 py-8">
          <BlogPost post={displayPost} />
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }
} 