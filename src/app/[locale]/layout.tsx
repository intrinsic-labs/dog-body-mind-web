import "../globals.css";
import { rubik, helvetica } from "@presentation/fonts/fonts";
import { Locale, locales, localeToLanguageTag, isValidLocale } from "@domain/locale";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";

// Revalidate all pages every hour (3600 seconds)
export const revalidate = 3600;

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  // we may want to stop using params: Promise everywhere,
  // it's kind of unconventional
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : notFound();

  return {
    title: "Dog Body Mind",
    description: "Dog Body Mind - Expert pet care guidance and education",
    keywords: ["Dog Body Mind", "pet care", "dog health", "veterinary advice"],
    other: {
      "og:locale": localeToLanguageTag[locale],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : notFound();

  return (
    <html lang={localeToLanguageTag[locale]}>
      <body
        className={`
          ${rubik.variable}
          ${helvetica.variable}
          antialiased
        `}
      >
        <Header locale={locale} />
        <main className="min-h-screen">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
