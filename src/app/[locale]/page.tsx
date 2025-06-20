import Header from "@/components/Header";
import HeroSection from "@/components/home/HeroSection";
import Footer from "@/components/Footer";
import { Locale } from "@/lib/locale";

export default async function Home({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params;
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-background">
      <Header />
      <main className="flex flex-col items-center w-full">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
