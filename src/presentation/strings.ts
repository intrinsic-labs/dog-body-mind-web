import { Locale } from "@/domain/locale";

// Define all UI string keys in one place.
// These are for user interface elements throughout
// the site, so translations should be idiomatic
// for these types of contexts.
const uiStrings = {
  en: {
    featuredPost: "Featured Post",
    latestPost: "Latest Post",
    blog: "Blog",
    seeAll: "See All",
    collapse: "Collapse",
  },
  uk: { // this is for en-GB, so pretty much the same as en
    featuredPost: "Featured Post",
    latestPost: "Latest Post",
    blog: "Blog",
    seeAll: "See All",
    collapse: "Collapse",
  },
  de: {
    featuredPost: "Empfohlener Beitrag",
    latestPost: "Neuester Beitrag",
    blog: "Blog",
    seeAll: "Alle anzeigen",
    collapse: "Einklappen",
  },
  fr: {
    featuredPost: "Article en vedette",
    latestPost: "Dernier article",
    blog: "Blog",
    seeAll: "Voir tout",
    collapse: "Réduire",
  },
  es: {
    featuredPost: "Publicación destacada",
    latestPost: "Última publicación",
    blog: "Blog",
    seeAll: "Ver todo",
    collapse: "Contraer",
  },
  it: {
    featuredPost: "Post in evidenza",
    latestPost: "Ultimo post",
    blog: "Blog",
    seeAll: "Vedi tutto",
    collapse: "Comprimi",
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
