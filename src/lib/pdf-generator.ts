import { renderToStream } from "@react-pdf/renderer";
import QRCode from "qrcode";
import {
  InfographicPDF,
  type InfographicPDFData,
  type PDFGenerationOptions,
} from "./pdf-components";

// ===== QR CODE GENERATION =====

async function generateQRCode(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 120,
      margin: 1,
      color: {
        dark: "#1f2937",
        light: "#ffffff",
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return "";
  }
}

// ===== MAIN PDF GENERATION FUNCTION =====

export async function generateInfographicPDF(
  infographic: InfographicPDFData,
  options: PDFGenerationOptions,
): Promise<Buffer> {
  try {
    // Generate QR code if blog post URL is provided
    let qrCodeDataUrl: string | undefined;
    if (options.blogPostUrl) {
      qrCodeDataUrl = await generateQRCode(options.blogPostUrl);
    }

    // Create PDF document using React.createElement
    const pdfDocument = InfographicPDF({
      infographic,
      options,
      qrCodeDataUrl,
    });

    // Render to stream and convert to buffer
    const stream = await renderToStream(pdfDocument);
    const chunks: Uint8Array[] = [];

    return new Promise((resolve, reject) => {
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// ===== FILENAME GENERATION =====

export function generatePDFFilename(
  infographic: InfographicPDFData,
  language: string,
): string {
  // Use custom filename if provided
  if (infographic.downloadFilename) {
    return `${infographic.downloadFilename}.pdf`;
  }

  // Generate from title
  if (infographic.title) {
    const cleanTitle = infographic.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);

    return `${cleanTitle}-${language}.pdf`;
  }

  // Fallback to ID-based filename
  return `infographic-${infographic._id.replace("drafts.", "")}-${language}.pdf`;
}

// ===== VALIDATION FUNCTIONS =====

export function validateInfographicData(
  infographic: unknown,
): infographic is InfographicPDFData {
  if (!infographic || typeof infographic !== "object" || infographic === null) {
    console.error("❌ Validation failed: infographic is null or not an object");
    return false;
  }

  const data = infographic as Record<string, unknown>;
  console.log("🔍 Validating infographic data:");
  console.log("- _id:", data._id);
  console.log("- title:", data.title);
  console.log("- altText:", data.altText);
  console.log("- image:", data.image);

  const required = ["_id", "title", "altText"];

  for (const field of required) {
    if (!data[field]) {
      console.error(`❌ Missing required field: ${field}`);
      return false;
    }
  }

  // Check image structure - be more flexible about what we accept
  const image = data.image;
  if (!image) {
    console.error("❌ Missing image field entirely");
    console.error("Available fields:", Object.keys(data));
    return false;
  }

  if (typeof image === "object" && image !== null) {
    const imageObj = image as Record<string, unknown>;
    if (!imageObj.url) {
      console.error("❌ Image object exists but missing URL");
      console.error("Image object keys:", Object.keys(imageObj));
      console.error("Image object:", JSON.stringify(imageObj, null, 2));
      return false;
    }
  } else {
    console.error("❌ Image is not an object:", typeof image, image);
    return false;
  }

  console.log("✅ Validation passed!");
  return true;
}

export function validatePDFOptions(
  options: unknown,
): options is PDFGenerationOptions {
  if (!options || typeof options !== "object" || options === null) {
    return false;
  }

  const opts = options as Record<string, unknown>;

  if (!opts.language || typeof opts.language !== "string") {
    console.error("Missing or invalid language option");
    return false;
  }

  const supportedLanguages = ["en", "uk", "de", "fr", "es", "it"];
  if (!supportedLanguages.includes(opts.language)) {
    console.error(`Unsupported language: ${opts.language}`);
    return false;
  }

  return true;
}

// ===== ERROR HANDLING =====

export class PDFGenerationError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "PDFGenerationError";
  }
}

export function handlePDFError(error: unknown): never {
  if (error instanceof PDFGenerationError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new PDFGenerationError(
      `PDF generation failed: ${error.message}`,
      error,
    );
  }

  throw new PDFGenerationError("Unknown PDF generation error");
}

// Re-export types for convenience
export type {
  InfographicPDFData,
  PDFGenerationOptions,
} from "./pdf-components";
