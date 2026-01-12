import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      className={`${inter.variable} ${notoSansBengali.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`flex flex-col min-h-screen font-sans ${inter.className} ${notoSansBengali.className}`}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
