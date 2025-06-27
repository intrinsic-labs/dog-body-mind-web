import { Metadata } from 'next';
// TODO: Replace with DataManager
// import { getAllBlogPosts, getOrganization } from '@/lib/blog-service';
import BlogList from '@/components/blog/BlogList';
// TODO: Replace with new schema markup system  
// import SEOHead from '@/components/SEOHead';
import { Locale } from '@/lib/locale';

export const metadata: Metadata = {
  title: 'Blog | Dog Body Mind',
  description: 'Latest articles and insights about dog health, behavior, and well-being.',
};

export default async function BlogPage({ 
  params 
}: { 
  params: Promise<{ locale: Locale }> 
}) {
  const { locale } = await params;
  
  // TODO: Replace with DataManager
  // const [posts, organization] = await Promise.all([
  //   getAllBlogPosts(locale),
  //   getOrganization()
  // ]);
  
  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <h1>Blog</h1>
        <p>Language: {locale}</p>
        <p>TODO: Replace with DataManager implementation</p>
        
        {/* TODO: Restore when DataManager is integrated */}
        {/* <BlogList posts={posts} /> */}
      </div>
    </main>
  );
} 