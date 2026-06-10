import { docs } from "fumadocs-mdx:collections/server";
import { type InferPageType, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import {
  buildUrl,
  DEFAULT_LOCALE,
  LOCALE_META,
  LOCALES,
} from "@/lib/constants";
import { i18n } from "@/lib/i18n";

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/sd",
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
  i18n,
});

// True when the page served for `lang` is actually the Bengali file standing in
// for a missing `.<lang>.mdx` translation (fallbackLanguage). Such pages must
// not claim to BE the translation in canonical/hreflang/sitemap.
export function isFallbackPage(page: { path: string }, lang: string): boolean {
  return lang !== DEFAULT_LOCALE && !page.path.endsWith(`.${lang}.mdx`);
}

// hreflang `alternates.languages` map for a doc page, listing ONLY locales
// that have a real translation (plus x-default -> default locale). Shared by
// generateMetadata and the sitemap so neither can advertise a translation
// that doesn't exist yet.
export function pageHreflang(
  slugs: string[],
  pageUrl: string,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    const p = source.getPage(slugs, locale);
    if (p && !isFallbackPage(p, locale)) {
      languages[LOCALE_META[locale].hreflang] = buildUrl(locale, pageUrl);
    }
  }
  languages["x-default"] = buildUrl(DEFAULT_LOCALE, pageUrl);
  return languages;
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title}

${processed}`;
}
