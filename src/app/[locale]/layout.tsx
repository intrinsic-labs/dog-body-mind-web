import "../globals.css";
import { rubik, helvetica } from "@/fonts/fonts";
import { Locale, locales, localeToLanguageTag } from "@/lib/locale";
import { Metadata } from "next";

// Revalidate all pages every hour (3600 seconds)
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  
  const { locale } = await params;
  
  // Type guard to ensure locale is valid
  if (!locales.includes(locale as Locale)) {
    throw new Error(`Invalid locale: ${locale}`)
  }
  
  const validLocale = locale as Locale
  
  return {
    title: "Dog Body Mind",
    description: "Dog Body Mind - Expert pet care guidance and education",
    keywords: ["Dog Body Mind", "pet care", "dog health", "veterinary advice"],
    other: {
      'og:locale': localeToLanguageTag[validLocale]
    }
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Props) {
  
  const { locale } = await params;
  
  if (!locales.includes(locale as Locale)) {
    throw new Error(`Invalid locale: ${locale}`)
  }
  
  const validLocale = locale as Locale
  
  return (
    <html lang={localeToLanguageTag[validLocale]}>
      <body 
        className={`
          ${rubik.variable} 
          ${helvetica.variable} 
          antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
} 