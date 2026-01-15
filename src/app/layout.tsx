import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Noto_Sans_Bengali, Outfit } from "next/font/google";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Montu Mia's System Design",
    default: "Montu Mia's System Design",
  },
  description:
    "মন্টু মিয়াঁর সিস্টেম ডিজাইন - A System Design Book in Bengali. Learn system design concepts with simple analogies.",
  metadataBase: new URL("https://montumia.com"),
  authors: [{ name: "Shakirul Hasan Khan" }],
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
    title: "Montu Mia's System Design",
    description: "Learn System Design in Bengali with fun stories!",
    url: "https://montumia.com",
    siteName: "Montu Mia's System Design",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Montu Mia's System Design",
    description: "Learn System Design in Bengali with fun stories!",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="bn"
      className={`${outfit.variable} ${notoSansBengali.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`flex flex-col min-h-screen font-sans ${outfit.className} ${notoSansBengali.className}`}
      >
        <RootProvider>{children}</RootProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
