export const locales = ['en', 'uk', 'de', 'fr', 'es', 'it'] as const;
export const defaultLocale = 'en' as const;

export type Locale = typeof locales[number];

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

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
} 