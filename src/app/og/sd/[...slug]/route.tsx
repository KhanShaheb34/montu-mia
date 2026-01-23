import { getPageImage, source } from "@/lib/source";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { generate as DefaultImage } from "fumadocs-ui/og";

// Cache OG images for 24 hours to reduce server load
export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/og/sd/[...slug]">,
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  // Fetch Noto Sans Bengali font for proper Bengali text rendering
  // We use the RAW TrueType file from the Google Fonts GitHub repo.
  // This file preserves the GSUB tables needed for Bengali ligatures (juktakkhor).
  // WOFF/WOFF2 fonts strip these tables, causing garbled text in Satori.
  let notoSansBengali: ArrayBuffer | undefined;
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansbengali/static/NotoSansBengali-Regular.ttf",
      { cache: "force-cache" },
    );
    if (res.ok) {
      notoSansBengali = await res.arrayBuffer();
    } else {
      console.warn(`Failed to fetch Bengali font: HTTP ${res.status}`);
    }
  } catch (e) {
    // Fallback to default font if remote fetch fails
    console.warn("Failed to fetch Bengali font, using default font", e);
  }

  // Use English site name as fallback when Bengali font isn't available
  const siteName = notoSansBengali
    ? "মন্টু মিয়াঁর সিস্টেম ডিজাইন"
    : "Montu Mia's System Design";

  return new ImageResponse(
    <DefaultImage
      title={page.data.title}
      description={page.data.description}
      site={siteName}
    />,
    {
      width: 1200,
      height: 630,
      // Only include fonts array if Bengali font loaded successfully
      // Otherwise Next.js/Satori will use default fonts
      ...(notoSansBengali && {
        fonts: [
          {
            name: "Noto Sans Bengali",
            data: notoSansBengali,
            weight: 400,
            style: "normal",
          },
        ],
      }),
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
