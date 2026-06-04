import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { Mail } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShareOptions, ViewOptions } from "@/components/ai/page-actions";
import { SubscribeModal } from "@/components/subscribe-modal";
import { buttonVariants } from "@/components/ui/button";
import {
  BASE_URL,
  buildUrl,
  DEFAULT_LOCALE,
  hreflangAlternates,
  LOCALE_META,
  type Locale,
} from "@/lib/constants";
import { getDictionary } from "@/lib/dictionaries";
import { source } from "@/lib/source";
import { cn } from "@/lib/utils";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: PageProps<"/[lang]/sd/[[...slug]]">) {
  const { lang, slug } = await props.params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const dict = getDictionary(lang);

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
        <ViewOptions
          markdownUrl={`${page.url}.mdx`}
          githubUrl={githubUrl}
          lang={lang}
        />
        <ShareOptions
          url={buildUrl(lang, page.url)}
          title={page.data.title}
          lang={lang}
        />
        <SubscribeModal
          lang={lang}
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
              {dict.actions.subscribe}
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
  props: PageProps<"/[lang]/sd/[[...slug]]">,
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const meta = LOCALE_META[lang as Locale] ?? LOCALE_META.bn;
  const canonical = buildUrl(lang, page.url);

  // Locale-aware OG image; guard empty slug to avoid /og/sd//image.png.
  const slugPath = page.slugs.length > 0 ? page.slugs.join("/") : "index";
  const ogImagePath =
    lang === DEFAULT_LOCALE
      ? `/og/sd/${slugPath}/image.png?v=2`
      : `/og/${lang}/sd/${slugPath}/image.png?v=2`;
  const ogImageUrl = new URL(ogImagePath, BASE_URL).toString();

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
    alternates: {
      canonical,
      languages: hreflangAlternates(page.url),
    },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: canonical,
      siteName: meta.siteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: page.data.title,
        },
      ],
      locale: meta.ogLocale,
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
