import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Noto_Sans_Bengali, Outfit } from "next/font/google";
import type { Metadata } from "next";

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
  title: "Montu Mia's System Design",
  description: "মন্টু মিয়াঁর সিস্টেম ডিজাইন - A System Design Book in Bengali",
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
      </body>
    </html>
  );
}
