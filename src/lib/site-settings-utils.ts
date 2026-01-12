import { getSiteSettings } from './queries/site-settings-queries';
import { getBlogPageSettings } from './queries/blog-page-settings-queries';
import { getLandingPageSettings } from './queries/landing-page-settings-queries';
import { Locale } from './locale';

// Helper to extract internationalized string value
function getLocalizedValue(
  intlArray: Array<{ _key: string; value?: string }> | undefined | null,
  locale: Locale
): string {
  if (!intlArray || !Array.isArray(intlArray)) return '';

  // Try to find the exact locale
  const exactMatch = intlArray.find(item => item._key === locale);
  if (exactMatch?.value) return exactMatch.value;

  // Fallback to English
  const englishMatch = intlArray.find(item => item._key === 'en');
  if (englishMatch?.value) return englishMatch.value;

  // Return first available value
  return intlArray.find(item => item.value)?.value || '';
}

export interface NewsletterContent {
  heading: string;
  subheading: string;
  placeholder: string;
  buttonText: string;
  successMessage?: string;
  errorMessage?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  label?: string | null;
}

export async function getNewsletterContent(locale: Locale): Promise<NewsletterContent | null> {
  try {
    const settings = await getSiteSettings();

    if (!settings?.newsletter) {
      return null;
    }

    const { newsletter } = settings;

    return {
      heading: getLocalizedValue(newsletter.heading, locale),
      subheading: getLocalizedValue(newsletter.subheading, locale),
      placeholder: getLocalizedValue(newsletter.placeholder, locale),
      buttonText: getLocalizedValue(newsletter.buttonText, locale),
      successMessage: getLocalizedValue(newsletter.successMessage, locale),
      errorMessage: getLocalizedValue(newsletter.errorMessage, locale),
    };
  } catch (error) {
    console.error('Error fetching newsletter content:', error);
    return null;
  }
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const settings = await getSiteSettings();

    if (!settings?.socialLinks || !Array.isArray(settings.socialLinks)) {
      return [];
    }

    // Filter out any invalid entries and return
    return settings.socialLinks.filter((link: SocialLink) =>
      link && link.platform && link.url
    );
  } catch (error) {
    console.error('Error fetching social links:', error);
    return [];
  }
}

export interface BlogPageContent {
  title: string;
  subtitle: string;
}

export async function getBlogPageContent(locale: Locale): Promise<BlogPageContent | null> {
  try {
    const settings = await getBlogPageSettings();

    if (!settings) {
      return null;
    }

    return {
      title: getLocalizedValue(settings.title, locale),
      subtitle: getLocalizedValue(settings.subtitle, locale),
    };
  } catch (error) {
    console.error('Error fetching blog page content:', error);
    return null;
  }
}

export interface BlogCtaContent {
  heading: string;
  subheading: string;
  buttonText: string;
}

export async function getBlogCtaContent(locale: Locale): Promise<BlogCtaContent | null> {
  try {
    const settings = await getSiteSettings();

    if (!settings?.blogCta) {
      return null;
    }

    const { blogCta } = settings;

    return {
      heading: getLocalizedValue(blogCta.heading, locale),
      subheading: getLocalizedValue(blogCta.subheading, locale),
      buttonText: getLocalizedValue(blogCta.buttonText, locale),
    };
  } catch (error) {
    console.error('Error fetching blog CTA content:', error);
    return null;
  }
}

export interface LandingPageContent {
  title: string;
  subtitle: string;
  youtubeUrl: string;
}

export async function getLandingPageContent(locale: Locale): Promise<LandingPageContent | null> {
  try {
    const settings = await getLandingPageSettings();

    if (!settings) {
      return null;
    }

    return {
      title: getLocalizedValue(settings.title, locale),
      subtitle: getLocalizedValue(settings.subtitle, locale),
      youtubeUrl: settings.youtubeUrl,
    };
  } catch (error) {
    console.error('Error fetching landing page content:', error);
    return null;
  }
}
