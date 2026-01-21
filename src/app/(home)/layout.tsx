import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    images: ["/og.webp"],
  },
  twitter: {
    images: ["/og.webp"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}
