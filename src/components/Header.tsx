import Link from "next/link";
import TinifyImage from "./TinifyImage";
import { Locale } from "@/lib/locale";

interface HeaderProps {
  locale: Locale;
}

const Header = ({ locale }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="container mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <TinifyImage
            src="/images/logo-alpha.png"
            alt="Dog Body Mind Logo"
            width={180}
            height={45}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href={`/${locale}/blog`}
            className="btn btn-primary-outline btn-sm sm:btn"
          >
            Blog
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
