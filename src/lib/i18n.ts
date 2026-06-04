import { defineI18n } from "fumadocs-core/i18n";
import { DEFAULT_LOCALE, type Locale, LOCALES } from "@/lib/constants";

// Internationalization config for Fumadocs.
//
// - Bengali (`bn`) is the default language and stays UNPREFIXED in the URL
//   (`/sd/...`) thanks to `hideLocale: "default-locale"`, so existing URLs are
//   preserved. Other languages (e.g. English) live under `/<lang>/sd/...`.
// - `fallbackLanguage: bn` means any page without a `*.<lang>.mdx` translation
//   transparently falls back to the Bengali version — nothing ever 404s.
// - `parser` defaults to "dot", so translations are sibling files
//   (`introduction.mdx` -> `introduction.en.mdx`). Do not change it.
//
// The locale list is sourced from `constants.ts` (the single source of truth),
// so adding a language is just one edit to `LOCALES` there — never here.
export const i18n = defineI18n<Locale>({
  defaultLanguage: DEFAULT_LOCALE,
  languages: [...LOCALES],
  hideLocale: "default-locale",
  fallbackLanguage: DEFAULT_LOCALE,
});
