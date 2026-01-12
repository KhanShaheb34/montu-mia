import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center text-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 py-2">
              মন্টু মিয়াঁর সিস্টেম ডিজাইন
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 font-medium">
              গল্পের ছলে শিখুন সিস্টেম ডিজাইনের জটিল সব কনসেপ্ট। সহজ বাংলায়,
              সবার জন্য।
            </p>
          </div>
          <div className="space-x-4">
            <Link
              className="inline-flex h-12 items-center justify-center rounded-md bg-zinc-900 px-8 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
              href="/docs/part-1/introduction"
            >
              পড়া শুরু করুন
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-md border border-zinc-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-300"
              href="/docs"
            >
              সূচিপত্র
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
