// Single source of truth for site-wide constants that were previously
// hardcoded in 12+ places (layout, sitemap, robots, page metadata, etc.).

export const BASE_URL = "https://www.montumia.com";

export const DEFAULT_LOCALE = "bn" as const;
export const LOCALES = ["bn", "en"] as const;
export type Locale = (typeof LOCALES)[number];

// Per-locale metadata, all sourced from this one map:
//   - ogLocale  — OpenGraph `og:locale` (chrome/OG)
//   - siteName  — site title (chrome/OG)
//   - label     — the language switcher's display label
//   - flag      — switcher flag (a local SVG in /public/flags)
//   - hreflang  — the SEO `hreflang` tag (BCP-47, e.g. `bn-BD`/`en-US`)
// To add a language: add an entry here (+ a `<lang>.svg` in public/flags/). The
// i18n config, language switcher, sitemap, and hreflang alternates are all
// derived from this map / LOCALES, so there's nothing else to wire up for SEO.
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

function stripLocalePrefix(path: string): string {
  // Strip a leading `/<locale>` for ANY locale (including the default `bn`), so
  // buildUrl is idempotent no matter what it's fed: a default-locale page.url is
  // already unprefixed (`/sd/...`), but a stray `/bn/...` collapses to `/sd/...`
  // too rather than leaking through.
  for (const locale of LOCALES) {
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
  // Root: default locale -> "https://host/", other locales -> "https://host/en"
  // (no trailing slash, matching the actual /en route).
  if (normalized === "/") return prefix ? `${BASE_URL}${prefix}` : `${BASE_URL}/`;
  return `${BASE_URL}${prefix}${normalized}`;
}

/**
 * Build the `alternates.languages` hreflang map for a locale-agnostic internal
 * path. Loops every configured locale (so a new entry in LOCALE_META/LOCALES
 * is picked up automatically) and adds an `x-default` pointing at the default
 * locale. Shared by the homepage + doc-page `generateMetadata` and the sitemap,
 * so hreflang can never silently drift out of sync with the locale list.
 *
 *   hreflangAlternates("/sd/scaling")
 *   // { "bn-BD": "https://host/sd/scaling",
 *   //   "en-US": "https://host/en/sd/scaling",
 *   //   "x-default": "https://host/sd/scaling" }
 */
export function hreflangAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[LOCALE_META[locale].hreflang] = buildUrl(locale, path);
  }
  languages["x-default"] = buildUrl(DEFAULT_LOCALE, path);
  return languages;
}
