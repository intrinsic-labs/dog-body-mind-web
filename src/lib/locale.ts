import { headers } from 'next/headers';

export const locales = ['en', 'uk', 'de', 'fr', 'es', 'it'] as const;
export const defaultLocale = 'en' as const;

export type Locale = typeof locales[number];

// Domain to default locale mapping for ccTLD support
export const domainLocaleMap = {
  'dogbodymind.com': 'en',
  'dogbodymind.de': 'de', 
  'dogbodymind.fr': 'fr',
  'dogbodymind.es': 'es',
  'dogbodymind.it': 'it',
  'dogbodymind.co.uk': 'uk',
  // For local development
  'localhost:3000': 'en',
  '127.0.0.1:3000': 'en',
  'dogbodymind.local:3000': 'en',
  'dogbodymind.de.local:3000': 'de',
  'dogbodymind.fr.local:3000': 'fr',
  'dogbodymind.es.local:3000': 'es',
  'dogbodymind.it.local:3000': 'it',
  'dogbodymind.co.uk.local:3000': 'uk'
} as const;

// Map our locale codes to proper language tags for schema markup
export const localeToLanguageTag: Record<Locale, string> = {
  en: 'en-US',
  uk: 'en-GB', 
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT'
};

// Map locales to full language names for display
export const localeNames: Record<Locale, string> = {
  en: 'English',
  uk: 'English (UK)',
  de: 'German', 
  fr: 'French',
  es: 'Spanish',
  it: 'Italian'
};

// Map locales to their corresponding domains
export const localeToDomain: Record<Locale, string> = {
  en: 'dogbodymind.com',
  uk: 'dogbodymind.co.uk',
  de: 'dogbodymind.de',
  fr: 'dogbodymind.fr',
  es: 'dogbodymind.es',
  it: 'dogbodymind.it'
};

// Dev map
export const devLocaleToDomain: Record<Locale, string> = {
  en: 'dogbodymind.local:3000',
  fr: 'dogbodymind.fr.local:3000',
  de: 'dogbodymind.de.local:3000',
  es: 'dogbodymind.es.local:3000',
  it: 'dogbodymind.it.local:3000',
  uk: 'dogbodymind.co.uk.local:3000'
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get the default locale for a given domain
 */
export function getLocaleFromDomain(hostname: string): Locale {
  // Handle both with and without protocol, and normalize
  const normalizedHost = hostname.toLowerCase().replace(/^https?:\/\//, '');
  
  // Check exact match first
  if (normalizedHost in domainLocaleMap) {
    return domainLocaleMap[normalizedHost as keyof typeof domainLocaleMap];
  }
  
  // For development, handle any localhost variation
  if (normalizedHost.includes('localhost') || normalizedHost.includes('127.0.0.1')) {
    return defaultLocale;
  }
  
  // Fallback: try to match partial domain (useful for preview domains)
  for (const [domain, locale] of Object.entries(domainLocaleMap)) {
    if (normalizedHost.includes(domain.split('.')[0])) {
      return locale as Locale;
    }
  }
  
  return defaultLocale;
}

/**
 * Get the domain for a given locale
 */
 export function getDomainForLocale(locale: Locale, dev: boolean = false): string {
   if (dev) {
     return devLocaleToDomain[locale];
   } else {
     return localeToDomain[locale];
   }
 }

/**
 * Check if a hostname matches a specific locale's domain
 */
export function isDomainForLocale(hostname: string, locale: Locale): boolean {
  const normalizedHost = hostname.toLowerCase().replace(/^https?:\/\//, '');
  const expectedDomain = localeToDomain[locale];
  
  // Handle development domains
  if (normalizedHost.includes('localhost') || normalizedHost.includes('127.0.0.1')) {
    return true; // In development, all locales are accessible
  }
  
  return normalizedHost === expectedDomain || normalizedHost.includes(expectedDomain);
}

/**
 * Get the canonical URL for a given path and locale
 */
export function getCanonicalUrl(path: string, locale: Locale): string {
  const domain = getDomainForLocale(locale);
  // Remove leading slash if present since we're building full URLs
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `https://${domain}${cleanPath ? `/${cleanPath}` : ''}`;
}

/**
 * Generate hreflang alternate URLs for a given path
 */
export function generateHreflangAlternates(currentPath: string): Array<{
  hreflang: string;
  href: string;
}> {
  return locales.map(locale => ({
    hreflang: localeToLanguageTag[locale],
    href: getCanonicalUrl(currentPath, locale)
  }));
}

/**
 * Server-side function to get current domain information
 * Use this in Server Components to get domain-aware locale info
 */
export async function getDomainInfo() {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const domainLocale = getLocaleFromDomain(hostname);
  
  return {
    hostname,
    locale: domainLocale,
    domain: getDomainForLocale(domainLocale),
    isMainDomain: domainLocale === defaultLocale
  };
} 