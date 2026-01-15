import { NextRequest, NextResponse } from "next/server";
import { searchPosts } from "@/infrastructure/sanity/queries/post-queries";
import { locales, type Locale, isValidLocale } from "@/lib/locale";

function jsonError(
  message: string,
  status: number,
  debug?: Record<string, unknown>,
) {
  return NextResponse.json(
    { error: message, ...(debug ? { debug } : {}) },
    { status },
  );
}

function getLocaleFromRequest(request: NextRequest): Locale {
  const sp = request.nextUrl.searchParams;
  const maybe =
    sp.get("locale") ||
    sp.get("lang") ||
    sp.get("language") ||
    sp.get("l") ||
    "en";

  return isValidLocale(maybe) ? maybe : "en";
}

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).slice(2, 10);
  const startedAt = Date.now();

  try {
    const sp = request.nextUrl.searchParams;

    const qRaw = sp.get("q") || "";
    const q = qRaw.trim();
    const locale = getLocaleFromRequest(request);

    // Category filter: currently your UI uses category _id, so accept that.
    const categoryIdRaw = sp.get("categoryId") || sp.get("category") || "";
    const categoryId = categoryIdRaw.trim();

    const limitRaw = sp.get("limit");
    const limit = limitRaw ? Number(limitRaw) : 50;

    const debugBase = {
      requestId,
      path: request.nextUrl.pathname,
      qRaw,
      q,
      qLength: q.length,
      locale,
      categoryId: categoryId || null,
      limitRaw: limitRaw ?? null,
      limit,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || null,
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || null,
      nodeEnv: process.env.NODE_ENV || null,
    };

    // Minimal, structured logging
    console.info("[blog-search] request", debugBase);

    // Basic validation / guardrails
    if (!q) {
      console.info("[blog-search] reject: missing q", debugBase);
      return jsonError("Missing query parameter: q", 400, debugBase);
    }
    if (q.length < 2) {
      console.info("[blog-search] short query", debugBase);
      return NextResponse.json({
        query: q,
        locale,
        categoryId: categoryId || null,
        results: [],
        note: "Query too short",
        debug: debugBase,
      });
    }
    if (!Number.isFinite(limit) || limit < 1 || limit > 100) {
      console.info("[blog-search] reject: invalid limit", debugBase);
      return jsonError("Invalid limit (must be 1-100)", 400, debugBase);
    }
    if (!locales.includes(locale)) {
      console.info("[blog-search] reject: unsupported locale", debugBase);
      return jsonError(`Unsupported locale: ${locale}`, 400, debugBase);
    }

    const results = await searchPosts({
      q,
      language: locale,
      categoryId: categoryId || undefined,
      limit,
    });

    const ms = Date.now() - startedAt;
    console.info("[blog-search] response", {
      requestId,
      ms,
      resultCount: Array.isArray(results) ? results.length : null,
    });

    return NextResponse.json({
      query: q,
      locale,
      categoryId: categoryId || null,
      results,
      debug: {
        requestId,
        ms,
        resultCount: Array.isArray(results) ? results.length : null,
      },
    });
  } catch (error) {
    const ms = Date.now() - startedAt;

    const err =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { message: String(error) };

    // Log a safe, structured error (message + stack when available)
    console.error("[blog-search] error", { requestId, ms, ...err });

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to search blog posts",
        debug: { requestId, ms },
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
