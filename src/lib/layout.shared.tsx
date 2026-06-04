import { defineI18nUI } from "fumadocs-ui/i18n";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { LOCALE_META, type Locale } from "@/lib/constants";
import { i18n } from "@/lib/i18n";

// Fumadocs UI translations (the framework chrome: TOC heading, prev/next,
// language toggle, etc.) + the per-locale `displayName` shown in the language
// switcher. Bengali is the default, so we translate the chrome into Bengali
// here (it previously fell back to the English defaults). `provider(lang)` is
// passed to <RootProvider i18n={...}>.
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
  // Normalize unknown locales to the default once, so metadata and nav.url stay
  // consistent (no `bn` title paired with a `/<unsupported-locale>` URL).
  const locale: Locale = lang in LOCALE_META ? (lang as Locale) : "bn";
  const meta = LOCALE_META[locale];
  return {
    nav: {
      title: meta.siteName,
      // Bengali (default) is unprefixed; other locales are /<lang>.
      url: locale === "bn" ? "/" : `/${locale}`,
    },
    // NOTE: we intentionally do NOT set `i18n: true` here. Instead we render our
    // own <LanguageToggle /> inline in the sidebar footer (see sd/layout.tsx) so
    // the language switcher sits on one row with the about link + theme toggle.
  };
}
