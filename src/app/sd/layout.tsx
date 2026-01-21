import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Layout({ children }: LayoutProps<"/sd">) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={{ title: "মন্টু মিয়াঁর সিস্টেম ডিজাইন" }}
      themeSwitch={{ enabled: false }}
      sidebar={{
        footer: (
          <div className="flex items-center gap-2">
            <Link
              href="/sd/about"
              className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground transition-colors flex-1 h-9 px-2 rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              <span className="font-medium truncate self-center align-middle">
                মন্টুর কারিগর
              </span>
            </Link>
            <ThemeToggle />
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
