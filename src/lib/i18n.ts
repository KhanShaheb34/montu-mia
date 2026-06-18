import { defineI18n } from "fumadocs-core/i18n";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/constants";

// Fumadocs i18n: Bengali default + unprefixed (`hideLocale`); untranslated pages
// fall back to Bengali instead of 404ing. Locales come from constants.ts.
export const i18n = defineI18n<Locale>({
  defaultLanguage: DEFAULT_LOCALE,
  languages: [...LOCALES],
  hideLocale: "default-locale",
  fallbackLanguage: DEFAULT_LOCALE,
});
