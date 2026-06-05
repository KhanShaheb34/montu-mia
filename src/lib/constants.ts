export const BASE_URL = "https://www.montumia.com";

export const DEFAULT_LOCALE = "bn" as const;
export const LOCALES = ["bn", "en"] as const;
export type Locale = (typeof LOCALES)[number];

// Per-locale metadata. To add a language, add an entry here (see TRANSLATING.md).
export const LOCALE_META: Record<
  Locale,
  {
    ogLocale: string;
    siteName: string;
    label: string;
    flag: string;
    hreflang: string;
  }
> = {
  bn: {
    ogLocale: "bn_BD",
    siteName: "মন্টু মিয়াঁর সিস্টেম ডিজাইন",
    label: "বাংলা",
    flag: "/flags/bd.svg",
    hreflang: "bn-BD",
  },
  en: {
    ogLocale: "en_US",
    siteName: "Montu Mia's System Design",
    label: "English",
    flag: "/flags/us.svg",
    hreflang: "en-US",
  },
};

// Strip a leading `/<locale>` for any locale (incl. default) so buildUrl is idempotent.
function stripLocalePrefix(path: string): string {
  for (const locale of LOCALES) {
    if (path === `/${locale}`) return "/";
    if (path.startsWith(`/${locale}/`)) return path.slice(locale.length + 1);
  }
  return path;
}

// Locale-aware relative href (for <Link>): default unprefixed, others get `/<lang>`.
export function localePath(locale: string, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

// Absolute URL for a locale + internal path. Idempotent, so a Fumadocs `page.url`
// (already locale-prefixed) can be passed straight through.
export function buildUrl(locale: string, path: string): string {
  const normalized = stripLocalePrefix(
    path.startsWith("/") ? path : `/${path}`,
  );
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  if (normalized === "/")
    return prefix ? `${BASE_URL}${prefix}` : `${BASE_URL}/`;
  return `${BASE_URL}${prefix}${normalized}`;
}

// hreflang `alternates.languages` map for a path, derived from LOCALES (+ x-default).
// Shared by generateMetadata and the sitemap so they can't drift apart.
export function hreflangAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[LOCALE_META[locale].hreflang] = buildUrl(locale, path);
  }
  languages["x-default"] = buildUrl(DEFAULT_LOCALE, path);
  return languages;
}
