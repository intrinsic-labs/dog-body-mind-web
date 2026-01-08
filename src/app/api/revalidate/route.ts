import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import crypto from "crypto";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

type SanityWebhookBody = {
  _type?: string;
  _id?: string;
  slug?: { current?: string } | string;
  language?: string;
  // Sanity webhooks can include many other fields; keep permissive.
  [key: string]: unknown;
};

function getSecret(): string | null {
  // Server-only secret used for verifying Sanity webhook signatures.
  // NOTE: Do not expose this publicly.
  return process.env.SANITY_REVALIDATE_SECRET || null;
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

  if (typeof slug === "object" && slug !== null) {
    const maybe = (slug as { current?: unknown }).current;
    if (typeof maybe === "string") return maybe.replace(/^\/+/, "");
  }

  return null;
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function pathForDoc(
  docType: string | null,
  slug: string | null,
  locale: string,
) {
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

  const expectedSecret = getSecret();
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

  // Read raw body first so we can verify signatures (Sanity "Secret" field).
  // NOTE: Don't call request.json() before this, or you'll consume the stream.
  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch {
    rawBody = "";
  }

  // ---- Auth / verification (Sanity webhook Secret field) ----
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);

  if (!signature) {
    return json(
      {
        ok: false,
        error: "Unauthorized",
        requestId,
        detail: `Missing signature header: ${SIGNATURE_HEADER_NAME}`,
      },
      { status: 401 },
    );
  }

  const signatureOk = await isValidSignature(
    rawBody,
    signature,
    expectedSecret,
  );

  if (!signatureOk) {
    return json(
      {
        ok: false,
        error: "Unauthorized",
        requestId,
        detail: "Invalid signature",
      },
      { status: 401 },
    );
  }

  // ---- Parse webhook body (must be valid JSON) ----
  let body: SanityWebhookBody;
  try {
    body = JSON.parse(rawBody) as SanityWebhookBody;
  } catch {
    return json(
      { ok: false, error: "Bad Request", requestId, detail: "Invalid JSON" },
      { status: 400 },
    );
  }

  // Determine locale strictly from payload (no query-string overrides)
  const locale = asString(body.language) || "en";

  const docType = asString(body._type);
  const docId = asString(body._id);
  const slug = normalizeSlug(body.slug);

  // ---- Perform revalidation (derived from payload only) ----
  const revalidated: { tags: string[]; paths: string[] } = {
    tags: [],
    paths: [],
  };

  // 1) Tags (preferred). NOTE: This is a no-op until your Sanity fetch() calls add matching `next: { tags: [...] }`.
  // Use profile="max" (recommended) to avoid requiring a custom cacheLife profile in next.config.
  const tags = Array.from(new Set(tagsForDoc(docType, docId)));
  for (const tag of tags) {
    try {
      revalidateTag(tag, "max");
      revalidated.tags.push(tag);
    } catch (err) {
      console.error("[revalidate] revalidateTag failed", {
        requestId,
        tag,
        err,
      });
    }
  }

  // 2) Paths (best-effort mapping for common routes)
  const mappedPath = pathForDoc(docType, slug, locale);
  if (mappedPath) {
    try {
      // mappedPath is a concrete URL (no dynamic segments), so omit the 2nd argument.
      revalidatePath(mappedPath);
      revalidated.paths.push(mappedPath);
    } catch (err) {
      console.error("[revalidate] revalidatePath failed", {
        requestId,
        path: mappedPath,
        err,
      });
    }
  }

  // 3) Conservative fallback: if we couldn't map a path, revalidate the locale root.
  if (!mappedPath) {
    try {
      revalidatePath(`/${locale}`);
      revalidated.paths.push(`/${locale}`);
    } catch (err) {
      console.error("[revalidate] fallback revalidatePath failed", {
        requestId,
        err,
      });
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
    note: "Tag invalidation only becomes effective once your Sanity fetch() calls add next.tags. Path invalidation is best-effort based on doc type/slug mappings in this file.",
  });
}

// Manual testing endpoint.
// This route is intended to be called by Sanity webhooks (signed POSTs).
export async function GET() {
  return json(
    {
      ok: false,
      error: "Method not allowed",
      detail: "Use POST from Sanity webhook (signature-verified).",
    },
    { status: 405, headers: { Allow: "POST" } },
  );
}

// Webhooks must run on the server runtime.
export const runtime = "nodejs";
