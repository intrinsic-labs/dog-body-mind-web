import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PortableTextBlock } from '@portabletext/types';
import { Locale } from '@/lib/locale';
import { getLegalPageBySlug, getAllLegalPages } from '@/lib/queries/legal-page-queries';
import PortableTextRenderer from '@/components/blog/PortableTextRenderer';

export async function generateStaticParams() {
  // In development, don't pre-generate all params to avoid performance issues
  // In production, this will run at build time and generate all paths
  if (process.env.NODE_ENV === 'development') {
    return [];
  }

  // Generate static params for all locales and all legal pages at build time
  const locales: Locale[] = ['en', 'uk', 'de', 'fr', 'es', 'it'];
  const params = [];

  for (const locale of locales) {
    const pages = await getAllLegalPages(locale);

    for (const page of pages) {
      params.push({
        locale,
        slug: page.slug.current
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
    const page = await getLegalPageBySlug(slug, locale);

    if (!page) {
      return {
        title: 'Page Not Found | Dog Body Mind',
        description: 'The requested page could not be found.'
      };
    }

    return {
      title: page.metaTitle || `${page.title} | Dog Body Mind`,
      description: page.metaDescription || page.excerpt || `${page.title} - Dog Body Mind`,
      robots: page.noIndex ? 'noindex, nofollow' : 'index, follow'
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Page Not Found | Dog Body Mind',
      description: 'The requested page could not be found.'
    };
  }
}

export default async function LegalPage({
  params
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params;

  try {
    const page = await getLegalPageBySlug(slug, locale);

    if (!page) {
      notFound();
    }

    // Format the last updated date
    const lastUpdatedDate = page.lastUpdated
      ? new Date(page.lastUpdated).toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null;

    return (
      <main>
        <article className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-12 border-b border-foreground/10 pb-8">
            <h1 className="mb-4">{page.title}</h1>
            {lastUpdatedDate && (
              <p className="text-sm text-foreground/70">
                Last updated: {lastUpdatedDate}
              </p>
            )}
            {page.excerpt && (
              <p className="mt-4 text-lg text-foreground/80">
                {page.excerpt}
              </p>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <PortableTextRenderer
              content={page.content as PortableTextBlock[]}
              language={locale}
              blogPostUrl={`/legal/${slug}`}
            />
          </div>
        </article>
      </main>
    );
  } catch (error) {
    console.error('Error fetching legal page:', error);
    notFound();
  }
}
