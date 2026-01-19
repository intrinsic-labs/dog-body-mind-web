import Link from 'next/link';
import SocialLinks from './SocialLinks';
import { getSocialLinks } from '@/application/site-settings/site-settings-utils';
import { Locale } from '@/domain/locale';

interface FooterProps {
  locale: Locale;
}

export default async function Footer({ locale }: FooterProps) {
  const socialLinks = await getSocialLinks();

  return (
    <footer className="w-full border-t border-foreground/10 bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
          {/* Copyright */}
          <p className="text-sm text-foreground/70 order-2 lg:order-1">
            © {new Date().getFullYear()} Dog Body Mind. All rights reserved.
          </p>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm order-1 lg:order-2">
            <Link
              href={`/${locale}/legal/privacy-policy`}
              className="text-foreground/70 transition-colors hover:text-orange"
            >
              Privacy Policy
            </Link>
            <span className="text-foreground/30">•</span>
            <Link
              href={`/${locale}/legal/terms-and-conditions`}
              className="text-foreground/70 transition-colors hover:text-orange"
            >
              Terms & Conditions
            </Link>
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-4 order-3">
              <span className="text-sm text-foreground/70">Follow us:</span>
              <SocialLinks links={socialLinks} size="sm" variant="minimal" />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
} 