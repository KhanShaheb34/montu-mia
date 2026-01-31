import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = "https://www.montumia.com";

  return [
    {
      url: url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...source.getPages().map((page) => ({
      url: `${url}${page.url}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
