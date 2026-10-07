import { docs } from "fumadocs-mdx:collections/server";
import type { Item, Node } from "fumadocs-core/page-tree";
import {
  type InferPageType,
  type LoaderPlugin,
  loader,
} from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import {
  buildUrl,
  DEFAULT_LOCALE,
  LOCALE_META,
  LOCALES,
} from "@/lib/constants";
import { i18n } from "@/lib/i18n";

// True when the page served for `lang` is actually the Bengali file standing in
// for a missing `.<lang>.mdx` translation (fallbackLanguage). Such pages must
// not claim to BE the translation in canonical/hreflang/sitemap.
export function isFallbackPage(page: { path: string }, lang: string): boolean {
  return lang !== DEFAULT_LOCALE && !page.path.endsWith(`.${lang}.mdx`);
}

function pruneTree(nodes: Node[], keep: (item: Item) => boolean): Node[] {
  const out: Node[] = [];
  for (const node of nodes) {
    if (node.type === "page") {
      if (keep(node)) out.push(node);
    } else if (node.type === "folder") {
      const index = node.index && keep(node.index) ? node.index : undefined;
      const children = pruneTree(node.children, keep);
      if (index || children.length > 0) out.push({ ...node, index, children });
    } else {
      out.push(node);
    }
  }
  // A separator is only kept if something non-separator follows it.
  return out.filter(
    (node, i) =>
      node.type !== "separator" ||
      (i + 1 < out.length && out[i + 1].type !== "separator"),
  );
}

// Non-default locales list only translated pages in the sidebar (and therefore
// the prev/next footer, which Fumadocs derives from the same tree). Fallback
// pages stay reachable by direct URL; they are just not advertised.
const translatedOnlyTreePlugin: LoaderPlugin = {
  name: "translated-only-page-tree",
  transformPageTree: {
    root(root) {
      const lang = this.locale;
      if (!lang || lang === DEFAULT_LOCALE) return root;
      const isTranslated = (item: Item) => {
        const ref = item.$ref?.file;
        if (!ref) return true;
        const file = this.storage.read(ref);
        return !file || !isFallbackPage(file, lang);
      };
      return { ...root, children: pruneTree(root.children, isTranslated) };
    },
  },
};

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/sd",
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin(), translatedOnlyTreePlugin],
  i18n,
});

// hreflang `alternates.languages` map for a doc page, listing ONLY locales
// that have a real translation (plus x-default -> default locale). Shared by
// generateMetadata and the sitemap so neither can advertise a translation
// that doesn't exist yet.
export function pageHreflang(
  slugs: string[],
  pageUrl: string,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    const p = source.getPage(slugs, locale);
    if (p && !isFallbackPage(p, locale)) {
      languages[LOCALE_META[locale].hreflang] = buildUrl(locale, pageUrl);
    }
  }
  languages["x-default"] = buildUrl(DEFAULT_LOCALE, pageUrl);
  return languages;
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title}

${processed}`;
}
