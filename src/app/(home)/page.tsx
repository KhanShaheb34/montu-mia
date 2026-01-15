import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background text-foreground animate-in fade-in duration-500">
      <div className="container max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center space-y-8">
          <div className="relative md:w-64 md:h-64 lg:w-80 lg:h-80 transition-all duration-700">
            <Image
              src="/montu_hero.png"
              alt="Montu Mia System Design"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-2 max-w-4xl mx-auto">
            <h1 className="text-xl font-bold sm:text-2xl md:text-4xl text-foreground">
              মন্টু মিয়াঁর সিস্টেম ডিজাইন
            </h1>
            <p className="text-md text-muted-foreground md:text-lg font-medium leading-relaxed">
              বিড়ালটিউবের হাজারো ইউজার সামলাতে হিমশিম খাচ্ছেন মন্টু মিয়াঁ! 🐈
              <br className="hidden sm:inline" />
              কোডিং তো শিখলেন, কিন্তু সিস্টেম ডিজাইন না জানলে কি অ্যাপ বাঁচানো
              সম্ভব?
            </p>
          </div>

          <Button asChild size="lg" className="rounded-lg px-8 text-md">
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
