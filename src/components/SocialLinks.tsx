import {
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaPinterest,
  FaThreads,
  FaLink
} from 'react-icons/fa6';
import type { SocialLink } from '@/application/site-settings/site-settings-utils';

interface SocialLinksProps {
  links: SocialLink[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
}

// Map platform names to icons and aria labels
const platformConfig: Record<string, { Icon: React.ComponentType<{ className?: string }>, label: string }> = {
  facebook: { Icon: FaFacebook, label: 'Facebook' },
  instagram: { Icon: FaInstagram, label: 'Instagram' },
  x: { Icon: FaXTwitter, label: 'X (Twitter)' },
  linkedin: { Icon: FaLinkedin, label: 'LinkedIn' },
  youtube: { Icon: FaYoutube, label: 'YouTube' },
  tiktok: { Icon: FaTiktok, label: 'TikTok' },
  pinterest: { Icon: FaPinterest, label: 'Pinterest' },
  threads: { Icon: FaThreads, label: 'Threads' },
  custom: { Icon: FaLink, label: 'Link' }
};

const sizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
};

const containerSizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14'
};

export default function SocialLinks({
  links,
  size = 'md',
  variant = 'default'
}: SocialLinksProps) {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {links.map((link, index) => {
        const config = platformConfig[link.platform] || platformConfig.custom;
        const Icon = config.Icon;
        const ariaLabel = link.label || config.label;

        if (variant === 'minimal') {
          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ariaLabel}
              className="text-foreground/70 transition-colors hover:text-orange"
            >
              <Icon className={sizeClasses[size]} />
            </a>
          );
        }

        return (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            className={`flex items-center justify-center ${containerSizeClasses[size]} rounded-full border-2 border-foreground/10 bg-background transition-all hover:border-orange hover:bg-orange/5 hover:scale-110`}
          >
            <Icon className={`${sizeClasses[size]} text-foreground/70`} />
          </a>
        );
      })}
    </div>
  );
}
