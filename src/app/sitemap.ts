import type { MetadataRoute } from "next";
import { buildUrl, hreflangAlternates, LOCALES } from "@/lib/constants";
import { isFallbackPage, pageHreflang, source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage, one entry per locale (UI is always translated, never a fallback).
  for (const locale of LOCALES) {
    entries.push({
      url: buildUrl(locale, "/"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: hreflangAlternates("/") },
    });
  }

  // Doc pages. Skip Bengali-fallback entries: an untranslated chapter's /en URL
  // serves duplicate Bengali content and must not be advertised to crawlers.
  for (const { language, pages } of source.getLanguages()) {
    for (const page of pages) {
      if (isFallbackPage(page, language)) continue;
      entries.push({
        url: buildUrl(language, page.url),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: pageHreflang(page.slugs, page.url) },
      });
    }
  }

  return entries;
}
