import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Outfit, Google_Sans } from "next/font/google";
import type { Metadata } from "next";

// const outfit = Outfit({
//   subsets: ["latin"],
//   variable: "--font-outfit",
// });

const googleSans = Google_Sans({
  subsets: ["latin", "bengali"],
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
      className={`${googleSans.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`flex flex-col min-h-screen font-sans ${googleSans.className}`}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
