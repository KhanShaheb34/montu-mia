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
  let notoSansBengali: ArrayBuffer | undefined;
  try {
    const res = await fetch(
      "https://fonts.gstatic.com/s/notosansbengali/v20/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsolKudCk8izI0lc.woff",
      { cache: "force-cache" },
    );
    if (res.ok) {
      notoSansBengali = await res.arrayBuffer();
    }
  } catch {
    // Fallback to default font if remote fetch fails
    console.warn("Failed to fetch Bengali font, using default font");
  }

  return new ImageResponse(
    <DefaultImage
      title={page.data.title}
      description={page.data.description}
      site="মন্টু মিয়াঁর সিস্টেম ডিজাইন"
    />,
    {
      width: 1200,
      height: 630,
      fonts: notoSansBengali
        ? [
            {
              name: "Noto Sans Bengali",
              data: notoSansBengali,
              weight: 400,
              style: "normal",
            },
          ]
        : [],
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
