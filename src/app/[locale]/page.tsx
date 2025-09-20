import { Locale } from "@/lib/locale";
import Image from "next/image";
// import Link from "next/link";

export default async function Home({
  // params
}: {
  params: Promise<{ locale: Locale }>
}) {
  // const { locale } = await params;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="text-center space-y-6">
        {/* Logo placeholder - replace with your actual logo */}
        <div className="mb-8">
          <Image
            src="/images/logo-alpha.png" // Update this path to your actual logo
            alt="Dog Body Mind Logo"
            width={500}
            height={300}
            className="mx-auto"
            priority
          />
        </div>
        
        <h3 className="text-blue">
          Website Coming Soon!
        </h3>
        
        <p className=" text-gray-600">
          Check back regularly for updates as we <br/>prepare to launch our full site.
        </p>
        
        {/* Blog button */}
        {/*<div className="pt-8">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Visit Our Blog
            <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>*/}
      </div>
    </div>
  );
}