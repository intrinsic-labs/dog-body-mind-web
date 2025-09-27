import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function debugInfographic() {
  const id = 'infographic';
  const language = 'en';

  console.log('🔍 Debugging infographic query...');
  console.log('ID:', id);
  console.log('Language:', language);

  try {
    // First, let's see the raw document structure
    console.log('\n📋 Raw document structure:');
    const rawDoc = await client.fetch(`*[_type == "infographic" && _id == $id][0]`, { id });
    console.log(JSON.stringify(rawDoc, null, 2));

    // Let's check the image structure specifically
    console.log('\n🖼️ Image structure:');
    const imageStructure = await client.fetch(`
      *[_type == "infographic" && _id == $id][0] {
        "images": image[] {
          language,
          asset,
          "assetRef": asset.asset._ref,
          "resolvedAsset": asset.asset-> {
            _id,
            url,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              }
            }
          }
        }
      }
    `, { id });
    console.log(JSON.stringify(imageStructure, null, 2));

    // Test our actual query
    console.log('\n🔧 Testing our query:');
    const ourQuery = `
      *[_type == "infographic" && _id == $id][0] {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        _rev,

        "title": coalesce(
          title[language == $language][0].value,
          title[language == "en"][0].value,
          title[0].value
        ),
        "description": coalesce(
          description[language == $language][0].value,
          description[language == "en"][0].value,
          description[0].value
        ),
        "altText": coalesce(
          altText[language == $language][0].value,
          altText[language == "en"][0].value,
          altText[0].value
        ),
        "slug": coalesce(
          slug[language == $language][0].current,
          slug[language == "en"][0].current,
          slug[0].current
        ),

        "image": coalesce(
          image[language == $language][0].asset.asset,
          image[language == "en"][0].asset.asset,
          image[0].asset.asset
        ) -> {
          _id,
          url,
          metadata {
            dimensions {
              width,
              height,
              aspectRatio
            },
            lqip,
            blurHash,
            hasAlpha,
            isOpaque
          }
        },

        "downloadFilename": coalesce(
          downloadFilename[language == $language][0].value,
          downloadFilename[language == "en"][0].value,
          downloadFilename[0].value
        ),
        "pdfMetadata": coalesce(
          pdfMetadata[language == $language][0],
          pdfMetadata[language == "en"][0],
          pdfMetadata[0]
        ) {
          title,
          keywords,
          author,
          subject
        }
      }
    `;

    const result = await client.fetch(ourQuery, { id, language });
    console.log('Query result:');
    console.log(JSON.stringify(result, null, 2));

    // Validation check
    console.log('\n✅ Validation check:');
    if (result) {
      console.log('✓ Document exists');
      console.log('✓ Title:', result.title);
      console.log('✓ Alt text:', result.altText);
      console.log('✓ Image:', result.image ? 'Present' : '❌ Missing');
      if (result.image) {
        console.log('  - Image ID:', result.image._id);
        console.log('  - Image URL:', result.image.url);
      }
    } else {
      console.log('❌ No result returned');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the debug
debugInfographic().then(() => {
  console.log('\n🎉 Debug complete');
  process.exit(0);
}).catch(console.error);
