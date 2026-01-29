import { source } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { ViewOptions, ShareOptions } from "@/components/ai/page-actions";
import { SubscribeModal } from "@/components/subscribe-modal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";

export default async function Page(props: PageProps<"/sd/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const gitConfig = {
    user: "KhanShaheb34",
    repo: "montu-mia",
    branch: "main",
  };
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/sd/${page.path}`;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>

      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page) as any,
          })}
        />
      </DocsBody>

      <div className="flex flex-row gap-2 items-center">
        <ViewOptions markdownUrl={`${page.url}.mdx`} githubUrl={githubUrl} />
        <ShareOptions
          url={`https://montumia.com${page.url}`}
          title={page.data.title}
        />
        <SubscribeModal
          trigger={
            <button
              type="button"
              className={cn(
                buttonVariants({
                  variant: "secondary",
                  size: "sm",
                  className: "gap-2 cursor-pointer",
                }),
              )}
            >
              <Mail className="size-3.5" />
              Subscribe
            </button>
          }
        />
      </div>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/sd/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const pageUrl = `https://montumia.com${page.url}`;
  // Use static OG image from public folder with version for cache busting
  // Guard against empty slug array to avoid paths like /og/sd//image.png
  const slugPath = page.slugs.length > 0 ? page.slugs.join("/") : "index";
  const ogImagePath = `/og/sd/${slugPath}/image.png?v=2`;
  const ogImageUrl = new URL(ogImagePath, "https://montumia.com").toString();

  // Combine default keywords with page-specific tags
  const defaultKeywords = [
    "Bangla",
    "Bengali",
    "System Design",
    "সিস্টেম ডিজাইন",
    "Montu Mia",
    "মন্টু মিয়াঁ",
    "Software Engineering",
    "সফটওয়্যার ইঞ্জিনিয়ারিং",
  ];
  const pageTags = (page.data as any).tags || [];
  const keywords = [...defaultKeywords, ...pageTags].join(", ");

  return {
    title: page.data.title,
    description: page.data.description,
    keywords,
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: pageUrl,
      siteName: "মন্টু মিয়াঁর সিস্টেম ডিজাইন",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: page.data.title,
        },
      ],
      locale: "bn_BD",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: page.data.title,
      description: page.data.description,
      images: [ogImageUrl],
    },
  };
}
