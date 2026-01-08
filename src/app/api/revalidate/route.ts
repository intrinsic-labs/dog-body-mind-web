import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import crypto from "crypto";

type SanityWebhookBody = {
  _type?: string;
  _id?: string;
  slug?: { current?: string } | string;
  language?: string;
  // Sanity webhooks can include many other fields; keep permissive.
  [key: string]: unknown;
};

function getSecret(): string | null {
  // Prefer a server-only env var, but allow either to reduce config friction.
  return (
    process.env.SANITY_REVALIDATE_SECRET ||
    process.env.NEXT_PUBLIC_SANITY_REVALIDATE_SECRET ||
    null
  );
}

function constantTimeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function extractProvidedSecret(request: NextRequest): string | null {
  // Allow either:
  //  - `?secret=...`
  //  - `Authorization: Bearer ...`
  //  - `X-Revalidate-Secret: ...`
  const sp = request.nextUrl.searchParams;
  const fromQuery = sp.get("secret");
  if (fromQuery) return fromQuery;

  const auth = request.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (m?.[1]) return m[1];

  const fromHeader = request.headers.get("x-revalidate-secret");
  if (fromHeader) return fromHeader;

  return null;
}

function json(
  payload: Record<string, unknown>,
  init?: { status?: number; headers?: Record<string, string> },
) {
  return NextResponse.json(payload, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  });
}

function normalizeSlug(slug: unknown): string | null {
  if (!slug) return null;
  if (typeof slug === "string") return slug.replace(/^\/+/, "");
  if (typeof slug === "object") {
    const s = (slug as any).current;
    if (typeof s === "string") return s.replace(/^\/+/, "");
  }
  return null;
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function pathForDoc(docType: string | null, slug: string | null, locale: string) {
  // Adjust these mappings to match your routes.
  // This project appears to have localized routes under `/{locale}/...`
  const base = `/${locale}`;

  if (!docType) return null;

  // Common singleton-like docs
  if (docType === "homePageSettings" || docType === "siteSettings") return base;

  // Legal pages (guessing: /{locale}/legal/{slug})
  if (docType === "legalPage" && slug) return `${base}/legal/${slug}`;

  // Blog posts (guessing: /{locale}/blog/{slug})
  if (docType === "post" && slug) return `${base}/blog/${slug}`;

  // Categories (guessing: /{locale}/blog?category=...); can't safely path-invalidate without knowing URL scheme
  // Return null so tag invalidation can handle it.
  return null;
}

function tagsForDoc(docType: string | null, docId: string | null) {
  // Tags are the "best path forward" because you can invalidate many pages that depend on a doc.
  // NOTE: These only work if your Sanity fetch calls set matching `next: { tags: [...] }`.
  // We'll still call them so adding tags later immediately enables webhook-based invalidation.
  const tags: string[] = ["sanity"];
  if (docType) tags.push(`sanity:type:${docType}`);
  if (docId) tags.push(`sanity:id:${docId}`);
  return tags;
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const requestId = crypto.randomBytes(6).toString("hex");

  // ---- Auth / verification (shared secret) ----
  const expectedSecret = getSecret();
  const providedSecret = extractProvidedSecret(request);

  if (!expectedSecret) {
    // Misconfiguration: you must set SANITY_REVALIDATE_SECRET in your deployment environment.
    return json(
      {
        ok: false,
        error: "Missing server configuration: SANITY_REVALIDATE_SECRET",
        requestId,
      },
      { status: 500 },
    );
  }

  if (!providedSecret || !constantTimeEqual(providedSecret, expectedSecret)) {
    return json(
      { ok: false, error: "Unauthorized", requestId },
      { status: 401 },
    );
  }

  // ---- Parse webhook body ----
  let body: SanityWebhookBody | null = null;
  try {
    body = (await request.json()) as SanityWebhookBody;
  } catch {
    body = null;
  }

  // Determine locale: allow query param override, body.language, else default to en
  const locale =
    asString(request.nextUrl.searchParams.get("locale")) ||
    asString(body?.language) ||
    "en";

  const docType = asString(body?._type);
  const docId = asString(body?._id);
  const slug = normalizeSlug(body?.slug);

  // Optional manual controls via querystring:
  //  - ?path=/en/blog/something (repeatable)
  //  - ?tag=sanity:type:post (repeatable)
  const extraPaths = request.nextUrl.searchParams.getAll("path").filter(Boolean);
  const extraTags = request.nextUrl.searchParams.getAll("tag").filter(Boolean);

  // ---- Perform revalidation ----
  const revalidated: { tags: string[]; paths: string[] } = { tags: [], paths: [] };

  // 1) Tags (preferred)
  const tags = Array.from(new Set([...tagsForDoc(docType, docId), ...extraTags]));
  for (const tag of tags) {
    try {
      revalidateTag(tag);
      revalidated.tags.push(tag);
    } catch (err) {
      console.error("[revalidate] revalidateTag failed", { requestId, tag, err });
    }
  }

  // 2) Paths (best-effort mapping for common routes)
  const mappedPath = pathForDoc(docType, slug, locale);
  const paths = Array.from(new Set([...(mappedPath ? [mappedPath] : []), ...extraPaths]));
  for (const p of paths) {
    try {
      revalidatePath(p);
      revalidated.paths.push(p);
    } catch (err) {
      console.error("[revalidate] revalidatePath failed", { requestId, path: p, err });
    }
  }

  // 3) As a safe fallback for "unknown doc types", revalidate the locale root.
  // This is intentionally conservative; you can remove if too aggressive.
  if (!mappedPath && paths.length === 0) {
    try {
      revalidatePath(`/${locale}`);
      revalidated.paths.push(`/${locale}`);
    } catch (err) {
      console.error("[revalidate] fallback revalidatePath failed", { requestId, err });
    }
  }

  const ms = Date.now() - startedAt;

  return json({
    ok: true,
    requestId,
    ms,
    received: {
      _type: docType,
      _id: docId,
      slug: slug ?? null,
      locale,
    },
    revalidated,
    note:
      "Tag invalidation only becomes effective once your Sanity fetch() calls add next.tags. Path invalidation is best-effort based on doc type/slug mappings in this file.",
  });
}

// Allow quick manual testing in a browser (e.g. /api/revalidate?secret=...&path=/en)
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  // Reuse the same auth mechanism for GET.
  const expectedSecret = getSecret();
  const providedSecret = extractProvidedSecret(request);

  if (!expectedSecret) {
    return json(
      { ok: false, error: "Missing server configuration: SANITY_REVALIDATE_SECRET" },
      { status: 500 },
    );
  }
  if (!providedSecret || !constantTimeEqual(providedSecret, expectedSecret)) {
    return json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const paths = sp.getAll("path").filter(Boolean);
  const tags = sp.getAll("tag").filter(Boolean);
  const locale = asString(sp.get("locale")) || "en";

  const revalidated: { tags: string[]; paths: string[] } = { tags: [], paths: [] };

  for (const tag of tags) {
    revalidateTag(tag);
    revalidated.tags.push(tag);
  }

  for (const p of paths) {
    revalidatePath(p);
    revalidated.paths.push(p);
  }

  if (paths.length === 0 && tags.length === 0) {
    revalidatePath(`/${locale}`);
    revalidated.paths.push(`/${locale}`);
  }

  return json({
    ok: true,
    revalidated,
    hint:
      "Pass ?tag=... and/or ?path=... (repeatable). For Sanity webhook, use POST with JSON body including _type/_id/slug/language.",
  });
}

// Webhooks must run on the server runtime.
export const runtime = "nodejs";
