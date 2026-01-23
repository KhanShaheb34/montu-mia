import { getPageImage, source } from "@/lib/source";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

// Cache OG images for 24 hours
export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/og/sd/[...slug]">,
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  // 1. Fetch BOTH Regular (400) and Bold (700) fonts
  // Satori needs the exact weight to be available, it won't "fake" bold.
  const [regularFont, boldFont] = await Promise.all([
    fetch(
      "https://github.com/google/fonts/raw/main/ofl/hindsiliguri/HindSiliguri-Regular.ttf",
      { cache: "force-cache" },
    ).then((res) => res.arrayBuffer()),
    fetch(
      "https://github.com/google/fonts/raw/main/ofl/hindsiliguri/HindSiliguri-Bold.ttf",
      { cache: "force-cache" },
    ).then((res) => res.arrayBuffer()),
  ]);

  const siteName = "মন্টু মিয়াঁর সিস্টেম ডিজাইন";

  return new ImageResponse(
    (
      // 2. Custom Layout (Replaces DefaultImage)
      // We manually build the UI to guarantee the font-family is applied to the text nodes.
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#030712", // Dark background
          backgroundImage:
            "linear-gradient(to bottom right, #4c1d95, #030712)", // Purple gradient
          fontFamily: '"Hind Siliguri"', // Global font
        }}
      >
        {/* Site Name (Pink) */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 400, // Uses Regular Font
            color: "#e879f9", // Fuchsia-400
            marginBottom: 20,
          }}
        >
          {siteName}
        </div>

        {/* Title (White, Bold) */}
        <div
          style={{
            fontSize: 84,
            fontWeight: 700, // Uses Bold Font
            color: "white",
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          {page.data.title}
        </div>

        {/* Description (Grey) */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 400, // Uses Regular Font
            color: "#a1a1aa", // Zinc-400
            maxWidth: "900px",
          }}
        >
          {page.data.description}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // 3. Register BOTH fonts
      fonts: [
        {
          name: "Hind Siliguri",
          data: regularFont,
          style: "normal",
          weight: 400,
        },
        {
          name: "Hind Siliguri",
          data: boldFont,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
