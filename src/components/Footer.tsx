import SocialLinks from './SocialLinks';
import { getSocialLinks } from '@/lib/site-settings-utils';

export default async function Footer() {
  const socialLinks = await getSocialLinks();

  return (
    <footer className="w-full border-t border-foreground/10 bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Copyright */}
          <p className="text-sm text-foreground/70">
            © {new Date().getFullYear()} Dog Body Mind. All rights reserved.
          </p>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground/70">Follow us:</span>
              <SocialLinks links={socialLinks} size="sm" variant="minimal" />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
} 