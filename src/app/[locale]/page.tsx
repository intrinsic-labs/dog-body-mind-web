import { redirect } from 'next/navigation';
import { Locale } from "@/lib/locale";

export default async function Home({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params;
  
  // Redirect to blog page
  redirect(`/${locale}/blog`);
}
