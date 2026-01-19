import { Locale } from "@/domain/locale";
import BlogCTA from "@/components/BlogCTA";
import {
  getLandingPageContent,
  getBlogCtaContent,
} from "@/application/site-settings/site-settings-utils";
import { getYouTubeId } from "@/infrastructure/youtube/youtube-utils";
import { DataManager } from "@/application/data-manager";
import { transformPostForDisplay } from "@application/mappers/transforPostForDisplay";
import { LabeledCard } from "@/components/blog/listing/ListingCards";
import PortableTextRenderer from "@/components/blog/PortableTextRenderer";
import { PortableTextBlock } from "@portabletext/types";

export default async function Landing({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  // Fetch landing page, blog CTA, and newsletter content
  const landingContent = await getLandingPageContent(locale);
  const blogCtaContent = await getBlogCtaContent(locale);

  // Fetch blog posts
  const dataManager = new DataManager(locale);
  await dataManager.initialize();
  const posts = await dataManager.getAllPosts();

  // Transform posts for display
  const displayPosts = await Promise.all(
    posts.map(async (post) => {
      const postWithReferences = await dataManager.getPost(post.slug.current);
      return transformPostForDisplay(postWithReferences);
    }),
  );

  // Find featured and most recent posts
  const featuredPost = displayPosts.find((post) => post.featured);
  const mostRecentPost = displayPosts[0]; // Posts are already sorted by publishedAt desc

  if (!landingContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/60">
          Landing page content not configured.
        </p>
      </div>
    );
  }

  const videoId = getYouTubeId(landingContent.youtubeUrl);

  return (
    <main>
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title and Subtitle */}
        <div className="mb-12 max-w-3xl">
          <h1 className="text-left mb-3">{landingContent.title}</h1>
          <p className="text-left text-xl text-foreground/70">
            {landingContent.subtitle}
          </p>
        </div>

        {/* YouTube Video */}
        {videoId && (
          <div className="relative w-full aspect-video overflow-hidden mb-12 rounded-sm">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={landingContent.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Page Content */}
        {landingContent.content && (
          <div className="prose prose-lg max-w-5xl mx-auto">
            <PortableTextRenderer
              content={landingContent.content as PortableTextBlock[]}
              language={locale}
            />
          </div>
        )}
      </div>

      {/* Blog CTA */}
      {blogCtaContent && <BlogCTA content={blogCtaContent} locale={locale} />}

      {/* Newsletter Signup - Full Width */}
      {/*{newsletterContent && (
        <NewsletterSignup content={newsletterContent} />
      )}*/}

      {/* Featured & Recent Blog Posts */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Featured Post */}
          {featuredPost && (
            <div>
              <LabeledCard
                post={featuredPost}
                currentLocale={locale}
                labelTarget="featuredPost"
              />
            </div>
          )}

          {/* Most Recent Post */}
          {mostRecentPost && mostRecentPost._id !== featuredPost?._id && (
            <div>
              <LabeledCard
                post={mostRecentPost}
                currentLocale={locale}
                labelTarget="latestPost"
              />
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Signup - Full Width (Bottom) */}
      {/*{newsletterContent && (
        <NewsletterSignup content={newsletterContent} />
      )}*/}
    </main>
  );
}
