"use client";

import { useState, useEffect } from "react";
import { getInfographicById } from "@/infrastructure/sanity/queries/infographic-queries";
import { InfographicByIdQueryResult } from "@/infrastructure/sanity/types/sanity.types";
import { Locale } from "@domain/locale";
import InfographicEmbed from "./InfographicEmbed";

interface InfographicReferenceProps {
  referenceId: string;
  language: Locale;
  blogPostUrl?: string;
}

export default function InfographicReference({
  referenceId,
  language,
  blogPostUrl,
}: InfographicReferenceProps) {
  const [infographic, setInfographic] =
    useState<InfographicByIdQueryResult>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInfographic() {
      try {
        setLoading(true);
        setError(null);

        const data = await getInfographicById(referenceId, language);

        if (!data) {
          // If not found, this might not be an infographic reference
          // Return null to render nothing instead of showing error
          setInfographic(null);
          setLoading(false);
          return;
        }

        setInfographic(data);
      } catch (err) {
        console.error("Failed to fetch infographic:", err);
        // For actual errors (not just wrong reference type), still show error
        if (err instanceof Error && err.message.includes("not found")) {
          setInfographic(null);
        } else {
          setError("Failed to load infographic");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchInfographic();
  }, [referenceId, language]);

  if (loading) {
    return (
      <div className="my-8 w-full">
        <div className="animate-pulse bg-foreground/10 rounded-2xl aspect-[4/3] w-full flex items-center justify-center">
          <div className="text-foreground/50 text-sm">
            Loading infographic...
          </div>
        </div>
      </div>
    );
  }

  // If no infographic and no error, this is likely not an infographic reference
  if (!infographic && !error) {
    return null;
  }

  // Only show error for actual errors, not missing infographics
  if (error) {
    return (
      <div className="my-8 w-full">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <div className="text-red-600 text-sm font-medium">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <InfographicEmbed
      infographic={infographic!}
      language={language}
      blogPostUrl={blogPostUrl}
    />
  );
}
