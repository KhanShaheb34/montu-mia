import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background text-foreground animate-in fade-in duration-500">
      <div className="container max-w-4xl space-y-12">
        {/* Hero Section */}
        <div className="flex flex-col items-center space-y-8">
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 transition-all duration-700">
            <Image
              src="/montu_hero.png"
              alt="Montu Mia System Design"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-foreground">
              মন্টু মিয়াঁর সিস্টেম ডিজাইন
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl font-medium leading-relaxed">
              গল্পের ছলে শিখুন সিস্টেম ডিজাইনের জটিল সব কনসেপ্ট।{" "}
              <br className="hidden sm:inline" />
              সহজ বাংলায়, সবার জন্য।
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="rounded-full px-8 text-lg font-bold"
          >
            <Link href="/sd/introduction">পড়া শুরু করুন</Link>
          </Button>
        </div>

        {/* Newsletter Section */}
        <div className="w-full max-w-md mx-auto p-8 rounded-xl border bg-card text-card-foreground shadow-sm">
          <h3 className="text-lg font-semibold mb-2">আপডেট পেতে ইমেইল দিন</h3>
          <p className="text-sm text-muted-foreground mb-4">
            নতুন চ্যাপ্টার রিলিজ হলেই নোটিফিকেশন পাবেন।
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="আপনার ইমেইল (email@example.com)"
              required
              className="flex-1"
            />
            <Button type="submit">সাবস্ক্রাইব</Button>
          </form>
        </div>
      </div>
    </main>
  );
}
