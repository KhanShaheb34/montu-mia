import { RootProvider } from "fumadocs-ui/provider/next";
import "../global.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Noto_Sans_Bengali } from "next/font/google";
import { GoogleTag } from "@/components/analytics/google-tag";
import {
  BASE_URL,
  buildUrl,
  hreflangAlternates,
  LOCALE_META,
  type Locale,
} from "@/lib/constants";
import { provider } from "@/lib/layout.shared";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bricolage",
  display: "swap",
  preload: true,
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
  preload: true,
});

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const meta = LOCALE_META[lang as Locale] ?? LOCALE_META.bn;

  return {
    title: {
      template: `%s | ${meta.siteName}`,
      default: meta.siteName,
    },
    description:
      "মন্টু মিয়াঁর সিস্টেম ডিজাইন - A System Design Book in Bengali. Learn system design concepts with simple analogies.",
    metadataBase: new URL(BASE_URL),
    authors: [{ name: "Shakirul Hasan Khan" }],
    // Homepage alternates; doc pages set their own in [[...slug]]/page.tsx.
    alternates: {
      canonical: buildUrl(lang, "/"),
      languages: hreflangAlternates("/"),
    },
    keywords: [
      "System Design",
      "Bangla System Design",
      "Software Engineering",
      "Montu Mia",
      "Load Balancer",
      "Scaling",
      "System Design in Bengali",
    ],
    openGraph: {
      title: meta.siteName,
      description: "Learn System Design in Bengali with fun stories!",
      url: buildUrl(lang, "/"),
      siteName: meta.siteName,
      locale: meta.ogLocale,
      type: "website",
      images: ["/og.webp"],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.siteName,
      description: "Learn System Design in Bengali with fun stories!",
      images: ["/og.webp"],
    },
  };
}

export default async function Layout({
  params,
  children,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  return (
    <html
      lang={lang}
      className={`${bricolage.variable} ${notoSansBengali.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`flex flex-col min-h-screen font-sans ${bricolage.className} ${notoSansBengali.className}`}
      >
        <RootProvider
          search={{
            enabled: false,
          }}
          i18n={provider(lang)}
        >
          <GoogleTag />
          {children}
        </RootProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
