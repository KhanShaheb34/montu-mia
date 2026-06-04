import bn from "@/dictionaries/bn.json";
import en from "@/dictionaries/en.json";
import type { Locale } from "@/lib/constants";

// Widen JSON literal types to `string`, keeping bn.json's key structure as the contract.
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof bn>;

// Typing this as Record<Locale, Dictionary> makes a missing en.json key a compile error.
const dictionaries: Record<Locale, Dictionary> = { bn, en };

export function getDictionary(lang: string): Dictionary {
  return dictionaries[lang as Locale] ?? bn;
}
