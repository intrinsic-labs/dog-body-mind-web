# Infographic PDF Download - Quick Reference

## 🚀 Quick Start

### Test the API
```bash
curl "http://localhost:3000/api/download/infographic/infographic?lang=en&source=https://dogbodymind.com" -o test.pdf
```

### Expected Result
- **Status:** 200 OK
- **File Size:** ~35KB
- **Content-Type:** application/pdf
- **Filename:** sample-pdf-test.pdf

---

## 📡 API Reference

### Endpoint
```
GET /api/download/infographic/[id]
```

### Parameters
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | ✅ Yes | - | Sanity document ID |
| `lang` | string | ❌ No | `en` | Language code |
| `source` | string | ❌ No | - | Blog post URL for QR code |
| `format` | string | ❌ No | `pdf` | Output format |

### Supported Languages
- `en` - English (default)
- `uk` - English (UK)
- `de` - German
- `fr` - French
- `es` - Spanish
- `it` - Italian

### Response Codes
- **200** - PDF generated successfully
- **400** - Invalid parameters/data
- **404** - Infographic not found
- **500** - Generation failed

---

## 🛠️ Development

### Run Type Generation
```bash
cd dbm-frontend
npm run typegen
```

### Start Dev Server
```bash
cd dbm-frontend
npm run dev
```

### Test Commands
```bash
# Basic download
curl "http://localhost:3000/api/download/infographic/infographic?lang=en" -o basic.pdf

# With blog link
curl "http://localhost:3000/api/download/infographic/infographic?lang=en&source=https://example.com" -o with-link.pdf

# German fallback
curl "http://localhost:3000/api/download/infographic/infographic?lang=de" -o german.pdf

# Test 404 error
curl "http://localhost:3000/api/download/infographic/nonexistent?lang=en"
```

---

## 📁 File Structure

```
dbm-sanity/schemaTypes/infographicType.ts   # Enhanced schema
dbm-frontend/src/lib/queries/infographic-queries.ts  # GROQ queries
dbm-frontend/src/lib/pdf-generator.ts       # PDF service
dbm-frontend/src/lib/pdf-components.tsx     # React PDF components
dbm-frontend/src/app/api/download/infographic/[id]/route.ts  # API endpoint
```

---

## 🔧 Schema Fields

### Required (existing)
- `title[]` - Localized titles
- `image[]` - Localized images
- `altText[]` - Localized alt text
- `slug[]` - Localized slugs

### Optional (new)
- `downloadFilename[]` - Custom PDF filenames
- `pdfMetadata[]` - SEO metadata (title, keywords, author, subject)

---

## ⚡ Common Issues

### "Infographic not found"
- Check document ID exists in Sanity
- Verify document is published (not draft)

### "Invalid infographic data"
- Ensure required fields are present
- Check image has valid asset reference

### Next.js warnings
- Already fixed: async params in Next.js 15
- Run `npm run typegen` if TypeScript errors

---

## 🎯 Production Checklist

- ✅ Environment variables set
- ✅ Sanity schema deployed
- ✅ TypeGen up to date
- ✅ API routes working
- ✅ Error handling tested
- ✅ Multi-language tested

---

**Status:** Production Ready 🚀  
**Next:** Phase 3 - React Components