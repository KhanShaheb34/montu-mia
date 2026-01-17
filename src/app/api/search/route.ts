import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

export const { GET } = createFromSource(source, {
  // Note: Orama's language support for Bengali is limited.
  // Using default language-agnostic configuration for better Bengali text handling.
  // See https://docs.orama.com/docs/orama-js/supported-languages
  // If search quality is poor, consider using a different search solution
  // that better supports Bengali text indexing.
});
