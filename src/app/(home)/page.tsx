import { Github, Linkedin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const SubscribeModal = dynamic(
  () =>
    import("@/components/subscribe-modal").then((mod) => ({
      default: mod.SubscribeModal,
    })),
  {
    loading: () => (
      <Button variant="secondary" size="lg" disabled>
        সাবস্ক্রাইব করুন
      </Button>
    ),
  },
);

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <div className="container max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-60 h-60 md:w-64 md:h-64 lg:w-80 lg:h-80">
            <Image
              src="/montu_hero.webp"
              alt="Montu Mia System Design"
              fill
              className="object-contain"
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 240px, (max-width: 1024px) 256px, 320px"
            />
          </div>

          <div className="space-y-2 max-w-4xl mx-auto">
            <h1 className="text-xl font-bold sm:text-2xl md:text-4xl text-foreground">
              মন্টু মিয়াঁর সিস্টেম ডিজাইন অভিযান
            </h1>
            <p className="text-md text-muted-foreground md:text-lg font-medium leading-relaxed">
              বিড়ালটিউবের হাজারো ইউজার সামলাতে হিমশিম খাচ্ছেন মন্টু মিয়াঁ!
              <br className="hidden sm:inline" />
              কোডিং তো শিখলেন, কিন্তু সিস্টেম ডিজাইন না জানলে কি অ্যাপ বাঁচানো সম্ভব?
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button asChild size="lg">
              <Link href="/sd/introduction">পড়া শুরু করুন</Link>
            </Button>

            <SubscribeModal />
          </div>

          <div className="flex items-center gap-4 text-muted-foreground mt-4">
            <Link
              href="https://github.com/KhanShaheb34/montu-mia"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="GitHub Repository"
            >
              <Github className="w-6 h-6" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/shakirulhasan/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
