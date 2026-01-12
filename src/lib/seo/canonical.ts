import type { Locale } from "@/lib/locale";

export type CanonicalRoute =
  | { kind: "landing" }
  | { kind: "blogIndex" }
  | { kind: "blogPost"; slug: string }
  | { kind: "legalPage"; slug: string };