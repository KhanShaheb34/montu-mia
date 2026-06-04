import { defineI18n } from "fumadocs-core/i18n";

// Internationalization config for Fumadocs.
//
// - Bengali (`bn`) is the default language and stays UNPREFIXED in the URL
//   (`/sd/...`) thanks to `hideLocale: "default-locale"`, so existing URLs are
//   preserved. English lives under `/en/sd/...`.
// - `fallbackLanguage: "bn"` means any page without an `.en.mdx` translation
//   transparently falls back to the Bengali version — nothing ever 404s.
// - `parser` defaults to "dot", so translations are sibling files
//   (`introduction.mdx` -> `introduction.en.mdx`). Do not change it.
export const i18n = defineI18n<"bn" | "en">({
  defaultLanguage: "bn",
  languages: ["bn", "en"],
  hideLocale: "default-locale",
  fallbackLanguage: "bn",
});
