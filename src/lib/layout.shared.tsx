import { defineI18nUI } from "fumadocs-ui/i18n";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { LOCALE_META, type Locale } from "@/lib/constants";
import { i18n } from "@/lib/i18n";

// Fumadocs chrome translations (TOC, prev/next, etc.) + per-locale switcher
// `displayName`. `provider(lang)` is passed to <RootProvider i18n={...}>.
export const { provider } = defineI18nUI(i18n, {
  translations: {
    bn: {
      displayName: "বাংলা",
      search: "সার্চ করুন",
      searchNoResult: "কোন ফলাফল পাওয়া যায়নি",
      toc: "এই পেজে",
      tocNoHeadings: "কোন শিরোনাম নেই",
      lastUpdate: "সর্বশেষ আপডেট",
      chooseLanguage: "ভাষা নির্বাচন করুন",
      nextPage: "পরবর্তী",
      previousPage: "পূর্ববর্তী",
      chooseTheme: "থিম",
      editOnGithub: "গিটহাবে এডিট করুন",
    },
    en: {
      displayName: "English",
    },
  },
});

export function baseOptions(lang: string): BaseLayoutProps {
  // Normalize unknown locales to the default.
  const locale: Locale = lang in LOCALE_META ? (lang as Locale) : "bn";
  const meta = LOCALE_META[locale];
  return {
    nav: {
      title: meta.siteName,
      url: locale === "bn" ? "/" : `/${locale}`,
    },
    // No `i18n: true`: we render a custom <LanguageToggle /> in the sidebar footer instead.
  };
}
