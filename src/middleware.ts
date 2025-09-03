import { NextRequest, NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import {
  locales,
  defaultLocale,
  getLocaleFromDomain,
  getDomainForLocale,
  isValidLocale,
  type Locale,
} from "@/lib/locale";

// Enable/disable middleware logging
const ENABLE_MIDDLEWARE_LOGGING = true;

function log(...args: unknown[]) {
  if (ENABLE_MIDDLEWARE_LOGGING) {
    console.log("[MIDDLEWARE]", ...args);
  }
}

function detectUserPreferredLocale(request: NextRequest): Locale {
  // Try to get locale from Accept-Language header
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  const detectedLocale = match(
    languages,
    locales as readonly string[],
    defaultLocale,
  );

  return detectedLocale as Locale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Skip internal Next.js paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return;
  }

  log(`🌐 Request: ${hostname}${pathname}`);

  // Get the domain's default locale
  const domainDefaultLocale = getLocaleFromDomain(hostname);
  const isDevelopment =
    hostname.includes("localhost") || hostname.includes("127.0.0.1") || hostname.includes("local");
  // const isDevelopment = false

  log(
    `📍 Domain default locale: ${domainDefaultLocale}, isDev: ${isDevelopment}`,
  );

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  // Extract current locale from pathname if present
  let currentLocale: Locale | null = null;
  if (pathnameHasLocale) {
    const pathSegments = pathname.split("/");
    const potentialLocale = pathSegments[1];
    if (isValidLocale(potentialLocale)) {
      currentLocale = potentialLocale;
    }
  }

  log(`🔧 Debug: URL Path Analysis`);
  log(`   Hostname: ${hostname}`);
  log(`   Domain Default Locale: ${domainDefaultLocale}`);
  log(`   Requested Pathname: ${pathname}`);
  log(`   Path Has Locale: ${pathnameHasLocale}`);
  if (currentLocale) {
    log(`   Current Locale from Path: ${currentLocale}`);
  }


  // Case 1: Redundant locale path on correct domain
  // Example: dogbodymind.de/de/blog -> redirect to dogbodymind.de/blog
  if (currentLocale && currentLocale === domainDefaultLocale) {
    const newPathname = pathname.replace(`/${currentLocale}`, "") || "/";
    log(`📤 Case 1: Removing redundant locale, redirecting to ${newPathname}`);
    return NextResponse.redirect(new URL(newPathname, request.url));
  }

  // Case 2: Wrong domain for the requested locale (CROSS-DOMAIN REDIRECT)
  // Example: dogbodymind.de/en/blog -> redirect to dogbodymind.com/blog
  // This maintains SEO by ensuring each locale lives on its canonical domain
  if (
    currentLocale &&
    currentLocale !== domainDefaultLocale &&
    !shouldAllowCrossDomainAccess()
  ) {
    const http = isDevelopment ? "http://" : "https://"
    const targetDomain = getDomainForLocale(currentLocale, isDevelopment);
    const newPathname = pathname.replace(`/${currentLocale}`, "") || "/";
    log(
      `🔄 Case 2: Cross-domain redirect to ${http}${targetDomain}${newPathname}`,
    );
    return NextResponse.redirect(
      new URL(`${http}${targetDomain}${newPathname}`, request.url),
    );
  }

  // Case 3: No locale in path - handle domain default or auto-detection
  if (!pathnameHasLocale) {
    const userPreferredLocale = detectUserPreferredLocale(request);
    log(`🎯 Case 3: No locale in path, user prefers: ${userPreferredLocale}`);

    // If user's preferred locale doesn't match the domain's default locale
    // Only redirect on homepage to avoid redirect loops
    if (
      userPreferredLocale !== domainDefaultLocale &&
      !isDevelopment &&
      pathname === "/"
    ) {
      const targetDomain = getDomainForLocale(userPreferredLocale);
      log(
        `🏠 Case 3a: Homepage redirect to https://${targetDomain}${pathname}`,
      );
      return NextResponse.redirect(
        new URL(`https://${targetDomain}${pathname}`, request.url),
      );
    }

    // Enhanced logic to ensure proper locale handling for all content pages
    const newUrl = new URL(`/${domainDefaultLocale}${pathname}`, request.url);

    // Log the actual URL that will be used for rendering
    log(
      `✏️ Case 3b: Rewriting to ${newUrl.pathname} - ensuring domain locale "${domainDefaultLocale}"`,
    );

    // Ensure any potential locale mismatch is handled properly
    if (domainDefaultLocale !== currentLocale) {
      log(
        `🔄 Locale consistency check: domain expects "${domainDefaultLocale}", but we're using "${currentLocale}"`,
      );
    }

    return NextResponse.rewrite(newUrl);
  }

  // Case 4: Development mode OR explicitly allowing subdirectory access
  // Example: dogbodymind.de/fr/blog (allowing French content on German domain)
  // In development: all locales accessible on localhost
  // In production: this allows multilingual access within a domain (optional feature)
  if (pathnameHasLocale && currentLocale && shouldAllowCrossDomainAccess()) {
    log(`🔧 Case 4: Allowing cross-domain access, rewriting to ${pathname}`);
    return NextResponse.rewrite(new URL(pathname, request.url));
  }

  // Fallback: continue as normal
  log(`➡️ Fallback: Continuing as normal`);
  return NextResponse.next();
}

/**
 * Configuration option: Allow accessing different locales on non-canonical domains
 * Set to true if you want dogbodymind.de/fr/blog to work (showing French content on German domain)
 * Set to false for strict SEO where each locale only exists on its canonical domain
 */
function shouldAllowCrossDomainAccess(): boolean {
  // For now, let's allow it for flexibility
  // You can change this to false for stricter SEO
  return false;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static files)
    "/((?!_next|api|favicon.ico|.*\\.).*)",
  ],
};
