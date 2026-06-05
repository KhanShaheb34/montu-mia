import type { MetadataRoute } from "next";
import { buildUrl, hreflangAlternates, LOCALES } from "@/lib/constants";
import { source } from "@/lib/source";

function alternates(path: string) {
  return { languages: hreflangAlternates(path) };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage, one entry per locale.
  for (const locale of LOCALES) {
    entries.push({
      url: buildUrl(locale, "/"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: alternates("/"),
    });
  }

  // Doc pages; with `fallbackLanguage` the en tree includes every page.
  for (const { language, pages } of source.getLanguages()) {
    for (const page of pages) {
      entries.push({
        url: buildUrl(language, page.url),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: alternates(page.url),
      });
    }
  }

  return entries;
}
