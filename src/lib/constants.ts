// Single source of truth for site-wide constants that were previously
// hardcoded in 12+ places (layout, sitemap, robots, page metadata, etc.).

export const BASE_URL = "https://www.montumia.com";

export const DEFAULT_LOCALE = "bn" as const;
export const LOCALES = ["bn", "en"] as const;
export type Locale = (typeof LOCALES)[number];

// Per-locale metadata: OpenGraph locale + site name (chrome/OG), the language
// switcher's display label, and its flag (a local SVG in /public/flags). To add
// a language, add an entry here and drop a `<lang>.svg` into public/flags/.
export const LOCALE_META: Record<
  Locale,
  { ogLocale: string; siteName: string; label: string; flag: string }
> = {
  bn: {
    ogLocale: "bn_BD",
    siteName: "মন্টু মিয়াঁর সিস্টেম ডিজাইন",
    label: "বাংলা",
    flag: "/flags/bd.svg",
  },
  en: {
    ogLocale: "en_US",
    siteName: "Montu Mia's System Design",
    label: "English",
    flag: "/flags/us.svg",
  },
};

function stripLocalePrefix(path: string): string {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (path === `/${locale}`) return "/";
    if (path.startsWith(`/${locale}/`)) return path.slice(locale.length + 1);
  }
  return path;
}

/**
 * Build a locale-aware internal href (relative path, for <Link href>).
 * Bengali (default) is unprefixed; other locales get a `/<lang>` prefix.
 * e.g. localePath("bn", "/sd/about") -> "/sd/about";
 *      localePath("en", "/sd/about") -> "/en/sd/about".
 */
export function localePath(locale: string, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/**
 * Build an absolute URL for a locale + an internal path.
 *
 * Bengali (default) stays unprefixed; other locales are prefixed (`/en/...`).
 * Idempotent: accepts either an unprefixed path or a path that already carries
 * a locale prefix (e.g. a Fumadocs `page.url` for a non-default locale), so it
 * is safe to feed `page.url` directly when computing hreflang alternates.
 */
export function buildUrl(locale: string, path: string): string {
  const normalized = stripLocalePrefix(
    path.startsWith("/") ? path : `/${path}`,
  );
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  if (normalized === "/") return `${BASE_URL}${prefix}/`;
  return `${BASE_URL}${prefix}${normalized}`;
}
