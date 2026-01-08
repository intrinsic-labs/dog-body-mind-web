Work in progress website for Dog Body Mind app.

Completed:
- ✅ SEO optimization (schema.org markup)
- ✅ Internationalization for 6 languages
- ✅ Middleware for multidomain routing (ccTLD-based)
- ✅ Dynamic sitemap with hreflang alternates
- ✅ On-demand revalidation endpoint for Sanity webhooks

Currently working on:
- UI/UX design optimization and implementation

Getting the plumbing working well first - SEO and internationalization infrastructure is solid!

---

## Sanity → Next.js on-demand revalidation (webhook)

This app exposes an API route you can call from a Sanity webhook to trigger Next.js cache invalidation / ISR.

### 1) Configure environment variables

Set a server-side secret in your hosting environment:

- `SANITY_REVALIDATE_SECRET` (required)

Do **not** expose this value publicly.

### 2) Create a webhook in Sanity

In Sanity (Project settings → API → Webhooks), create a webhook that calls:

- `POST https://<your-site-domain>/api/revalidate`

Set the **Secret** field in the webhook UI to the same value as `SANITY_REVALIDATE_SECRET`.

> The Secret is **not** appended to the URL. Sanity uses it to sign the request and includes a signature header. Our endpoint verifies that signature.

Payload: include at least `_type` and `_id` (Sanity can include these automatically). If you include `slug` and/or `language`, the endpoint can also do best-effort path revalidation.

### 3) Manual testing

This endpoint is intended to be called by Sanity webhooks and uses signature verification.
Use Sanity’s webhook attempts log to validate that delivery is succeeding.

### Notes

- Tag invalidation (`revalidateTag`) only becomes effective once Sanity `fetch()` calls include matching `next: { tags: [...] }`.
- Path invalidation (`revalidatePath`) is best-effort and depends on route mappings in `src/app/api/revalidate/route.ts`.
