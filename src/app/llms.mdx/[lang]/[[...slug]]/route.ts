import { notFound } from "next/navigation";
import { isLocale } from "@/lib/constants";
import { getLLMText, source } from "@/lib/source";

// Serves the processed markdown of a doc page. Reached via the
// `${page.url}.mdx` rewrites in next.config.mjs — the i18n middleware
// (src/proxy.ts) skips dotted paths, so locale resolution happens here
// through the [lang] segment instead of a middleware rewrite.
export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/llms.mdx/[lang]/[[...slug]]">,
) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const page = source.getPage(slug, lang);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
