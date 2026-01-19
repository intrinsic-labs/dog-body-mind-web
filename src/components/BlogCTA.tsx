import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi';
import { Locale } from '@domain/locale';

interface BlogCtaContent {
  heading: string;
  subheading: string;
  buttonText: string;
}

interface BlogCTAProps {
  content: BlogCtaContent;
  locale: Locale;
}

export default function BlogCTA({ content, locale }: BlogCTAProps) {
  return (
    <div className="w-full bg-blue py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Content */}
          <div className="flex-1">
            <h3 className="mb-2 text-2xl font-medium uppercase tracking-wide text-white sm:text-3xl">
              {content.heading}
            </h3>
            <p className="mb-6 text-lg uppercase tracking-wide text-white/90 sm:text-xl">
              {content.subheading}
            </p>

            {/* Button */}
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-blue transition-all hover:bg-white/90"
            >
              {content.buttonText}
              <HiArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
