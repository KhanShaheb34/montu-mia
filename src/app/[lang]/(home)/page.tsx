import { Github, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LanguageFlagDropdown } from "@/components/language-flag-dropdown";
import { SubscribeModal } from "@/components/subscribe-modal";
import { Button } from "@/components/ui/button";
import { LOCALES, localePath } from "@/lib/constants";
import { getDictionary } from "@/lib/dictionaries";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const t = getDictionary(lang).home;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <div className="absolute end-4 top-4 z-10">
        <LanguageFlagDropdown />
      </div>
      <div className="container max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-60 h-60 md:w-64 md:h-64 lg:w-80 lg:h-80">
            <Image
              src="/montu_hero.webp"
              alt={t.imageAlt}
              fill
              className="object-contain"
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 240px, (max-width: 1024px) 256px, 320px"
            />
          </div>

          <div className="space-y-2 max-w-4xl mx-auto">
            <h1 className="text-xl font-bold sm:text-2xl md:text-4xl text-foreground">
              {t.heroTitle}
            </h1>
            <p className="text-base text-muted-foreground md:text-lg font-medium leading-relaxed">
              {t.heroSubtitle1}
              <br className="hidden sm:inline" />
              {t.heroSubtitle2}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button asChild size="lg">
              <Link href={localePath(lang, "/sd/introduction")}>
                {t.ctaStart}
              </Link>
            </Button>

            <SubscribeModal lang={lang} />
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
