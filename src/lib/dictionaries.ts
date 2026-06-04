import bn from "@/dictionaries/bn.json";
import en from "@/dictionaries/en.json";
import type { Locale } from "@/lib/constants";

// Widen JSON string-literal types to `string` so different per-locale values
// are accepted, while keeping the key STRUCTURE of `bn.json` as the contract.
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };

// `bn.json` is the source of truth for the shape. The assignment below to
// `Record<Locale, Dictionary>` makes a missing key in `en.json` a COMPILE
// ERROR in `bun run types:check` — translation completeness is enforced.
export type Dictionary = Widen<typeof bn>;

const dictionaries: Record<Locale, Dictionary> = { bn, en };

export function getDictionary(lang: string): Dictionary {
  return dictionaries[lang as Locale] ?? bn;
}
