import "../globals.css";
import { rubik, helvetica } from "@/fonts/fonts";
import { Locale, locales, localeToLanguageTag } from "@/lib/locale";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Revalidate all pages every hour (3600 seconds)
export const revalidate = 3600;

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Dog Body Mind",
    description: "Dog Body Mind - Expert pet care guidance and education",
    keywords: ["Dog Body Mind", "pet care", "dog health", "veterinary advice"],
    other: {
      'og:locale': localeToLanguageTag[locale]
    }
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;

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
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
} 