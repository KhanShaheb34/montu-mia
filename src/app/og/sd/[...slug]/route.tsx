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

  // Load Hind Siliguri font for proper Bengali ligature rendering
  // Hind Siliguri has better compatibility with Satori than Noto Sans Bengali
  // due to its simpler internal table structure that bypasses Yoga layout engine bugs.
  let fontData: ArrayBuffer | undefined;
  try {
    const res = await fetch(
      "https://github.com/google/fonts/raw/main/ofl/hindsiliguri/HindSiliguri-Regular.ttf",
      { cache: "force-cache" },
    );
    if (res.ok) {
      fontData = await res.arrayBuffer();
    } else {
      console.warn(`Failed to fetch Bengali font: HTTP ${res.status}`);
    }
  } catch (e) {
    console.warn("Failed to fetch Bengali font", e);
  }

  const siteName = "মন্টু মিয়াঁর সিস্টেম ডিজাইন";

  return new ImageResponse(
    (
      // CRITICAL: Wrap in a div to FORCE the font-family.
      // This prevents Satori from using "Inter" first and then falling back,
      // which destroys the "shaping" context needed for Bengali ligatures.
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          fontFamily: '"Hind Siliguri", sans-serif',
        }}
      >
        <DefaultImage
          title={page.data.title}
          description={page.data.description}
          site={siteName}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData
        ? [
            {
              name: "Hind Siliguri",
              data: fontData,
              style: "normal",
              weight: 400,
            },
          ]
        : undefined,
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
