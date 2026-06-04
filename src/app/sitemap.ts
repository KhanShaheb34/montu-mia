import type { MetadataRoute } from "next";
import { buildUrl } from "@/lib/constants";
import { source } from "@/lib/source";

// hreflang alternates for a given locale-agnostic path (keys match the
// per-page <link rel="alternate"> tags in generateMetadata).
function alternates(path: string) {
  return {
    languages: {
      "bn-BD": buildUrl("bn", path),
      "en-US": buildUrl("en", path),
      "x-default": buildUrl("bn", path),
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    // Homepage, one entry per locale
    {
      url: buildUrl("bn", "/"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: alternates("/"),
    },
    {
      url: buildUrl("en", "/"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: alternates("/"),
    },
  ];

  // Docs pages — one entry per locale, each with hreflang alternates. With
  // `fallbackLanguage: "bn"`, the English tree includes every page (untranslated
  // ones serve Bengali fallback content), so both locales are fully listed.
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
