import { DocsLayout } from "fumadocs-ui/layouts/docs";
import Link from "next/link";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { localePath } from "@/lib/constants";
import { getDictionary } from "@/lib/dictionaries";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default async function Layout({
  params,
  children,
}: LayoutProps<"/[lang]/sd">) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const aboutHref = localePath(lang, "/sd/about");
  return (
    <DocsLayout
      {...baseOptions(lang)}
      tree={source.getPageTree(lang)}
      themeSwitch={{ enabled: false }}
      sidebar={{
        footer: (
          <div className="flex items-center gap-2">
            <Link
              href={aboutHref}
              className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground transition-colors flex-1 h-9 px-2 rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              <span className="font-medium truncate self-center align-middle">
                {dict.sidebar.aboutAuthor}
              </span>
            </Link>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
