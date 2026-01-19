"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import TinifyImage from "./TinifyImage";
import { Locale } from "@domain/locale";

interface HeaderProps {
  locale: Locale;
}

const Header = ({ locale }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Disable scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <nav className="container mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center transition-opacity hover:opacity-80 relative z-[60]"
            onClick={closeMobileMenu}
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

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2 sm:gap-4">
            <Link
              href={`/${locale}/blog`}
              className="text-foreground font-bold font-rubik hover:underline hover:text-blue transition-all ease-out-200"
            >
              Blog
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden relative z-[60] text-foreground hover:text-blue transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <IoClose size={32} />
            ) : (
              <HiMenuAlt3 size={32} />
            )}
          </button>
        </nav>
      </header>

      {/* Mobile Fullscreen Menu */}
      <div
        className={`fixed top-16 left-0 right-0 bottom-0 bg-background z-[55] md:hidden transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col pt-8 px-8">
          <Link
            href={`/${locale}/blog`}
            onClick={closeMobileMenu}
            className="text-foreground font-bold font-rubik text-3xl py-6 text-left hover:text-blue transition-colors"
          >
            Blog
          </Link>
        </div>
      </div>
    </>
  );
};

export default Header;
