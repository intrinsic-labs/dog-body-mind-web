import { Locale } from "@/domain/locale";

// Define all UI string keys in one place
const uiStrings = {
  en: {
    featuredPost: "Featured Post",
    latestPost: "Latest Post",
    blog: "Blog",
  },
  uk: {
    featuredPost: "Featured Post",
    latestPost: "Latest Post",
    blog: "Blog",
  },
  de: {
    featuredPost: "Empfohlener Beitrag",
    latestPost: "Neuester Beitrag",
    blog: "Blog",
  },
  fr: {
    featuredPost: "Article en vedette",
    latestPost: "Dernier article",
    blog: "Blog",
  },
  es: {
    featuredPost: "Publicación destacada",
    latestPost: "Última publicación",
    blog: "Blog",
  },
  it: {
    featuredPost: "Post in evidenza",
    latestPost: "Ultimo post",
    blog: "Blog",
  },
} as const;

// Automatically derive the StringTarget type from the actual keys
type StringTarget = keyof (typeof uiStrings)[Locale];

type StringProps = {
  locale: Locale;
  target: StringTarget;
};

export function getUiString({ locale, target }: StringProps): string {
  return uiStrings[locale][target];
}

// Optional: Export for use in other files
export type { StringTarget };
