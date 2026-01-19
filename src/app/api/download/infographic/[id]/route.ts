import { NextRequest, NextResponse } from "next/server";
import {
  getInfographicById,
  validateInfographicLanguage,
} from "@/infrastructure/sanity/queries/infographic-queries";
import {
  generateInfographicPDF,
  generatePDFFilename,
  validateInfographicData,
  validatePDFOptions,
} from "@/infrastructure/pdf/pdf-generator";

// ===== API ROUTE HANDLER =====

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Extract parameters
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const language =
      searchParams.get("lang") || searchParams.get("language") || "en";
    const blogPostUrl =
      searchParams.get("source") || searchParams.get("blogPostUrl");
    const format = searchParams.get("format") || "pdf";

    // Validate parameters
    if (!id) {
      return NextResponse.json(
        { error: "Missing infographic ID" },
        { status: 400 },
      );
    }

    // Only support PDF format for now
    if (format !== "pdf") {
      return NextResponse.json(
        { error: "Only PDF format is currently supported" },
        { status: 400 },
      );
    }

    // Validate language support
    const supportedLanguages = ["en", "uk", "de", "fr", "es", "it"];
    if (!supportedLanguages.includes(language)) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 },
      );
    }

    // Check if infographic has content in the requested language
    const hasLanguageContent = await validateInfographicLanguage(id, language);
    if (!hasLanguageContent && language !== "en") {
      console.warn(
        `Infographic ${id} has no content for language ${language}, falling back to English`,
      );
    }

    // Fetch infographic data from Sanity
    const infographic = await getInfographicById(id, language);

    if (!infographic) {
      return NextResponse.json(
        { error: "Infographic not found" },
        { status: 404 },
      );
    }

    // Validate infographic data
    if (!validateInfographicData(infographic)) {
      return NextResponse.json(
        { error: "Invalid infographic data" },
        { status: 400 },
      );
    }

    // Prepare PDF generation options
    const pdfOptions = {
      language,
      blogPostUrl: blogPostUrl || undefined,
      sourceUrl: blogPostUrl || undefined,
      organizationName: "Dog Body Mind",
      organizationUrl: "https://dogbodymind.com",
    };

    // Validate PDF options
    if (!validatePDFOptions(pdfOptions)) {
      return NextResponse.json(
        { error: "Invalid PDF generation options" },
        { status: 400 },
      );
    }

    // Generate PDF
    const pdfBuffer = await generateInfographicPDF(infographic, pdfOptions);

    // Generate filename
    const filename = generatePDFFilename(infographic, language);

    // Set response headers
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Content-Length", pdfBuffer.length.toString());
    headers.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

    // Add CORS headers if needed
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET");
    headers.set("Access-Control-Allow-Headers", "Content-Type");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Infographic not found" },
          { status: 404 },
        );
      }

      if (
        error.message.includes("Invalid") ||
        error.message.includes("Missing")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (error.message.includes("PDF generation")) {
        return NextResponse.json(
          { error: "PDF generation failed", details: error.message },
          { status: 500 },
        );
      }
    }

    // Generic server error
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to generate PDF download",
      },
      { status: 500 },
    );
  }
}

// ===== OPTIONS HANDLER FOR CORS =====

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// ===== ROUTE CONFIGURATION =====

export const runtime = "nodejs"; // Use Node.js runtime for PDF generation
export const dynamic = "force-dynamic"; // Always generate fresh PDFs
