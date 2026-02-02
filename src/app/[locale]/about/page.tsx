import { Metadata } from "next";
import { Locale } from "@/domain/locale";
import { getAboutPage } from "@/infrastructure/sanity/queries/about-page-queries";
import PortableTextRenderer from "@/components/blog/PortableTextRenderer";
import { PortableTextBlock } from "@portabletext/types";

interface AboutPageProps {
  params: Promise<{ locale: Locale }>;
}

async function getAboutPageWithFallback(locale: Locale) {
  const aboutContent = await getAboutPage(locale);
  if (aboutContent) return aboutContent;

  // Fallback to English if locale version doesn't exist
  if (locale !== "en") {
    return getAboutPage("en");
  }

  return null;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const aboutContent = await getAboutPageWithFallback(locale);

  if (!aboutContent) {
    return {
      title: "About",
    };
  }

  return {
    title: aboutContent.metaTitle || aboutContent.title,
    description: aboutContent.metaDescription || aboutContent.subtitle,
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const aboutContent = await getAboutPageWithFallback(locale);

  if (!aboutContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/60">About page content not configured.</p>
      </div>
    );
  }

  return (
    <main>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title and Subtitle */}
        <div className="mb-12 max-w-3xl">
          <h1 className="text-left mb-3">{aboutContent.title}</h1>
          {aboutContent.subtitle && (
            <p className="text-left text-xl text-foreground/70">
              {aboutContent.subtitle}
            </p>
          )}
        </div>

        {/* Page Content */}
        {aboutContent.content && (
          <div className="prose prose-lg max-w-5xl mx-auto">
            <PortableTextRenderer
              content={aboutContent.content as PortableTextBlock[]}
              language={locale}
            />
          </div>
        )}
      </div>
    </main>
  );
}
