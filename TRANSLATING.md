# Translating Montu Mia's System Design 🌍

This project is **Bengali-first**: Bengali (`bn`) is the default language and lives at the
clean URLs (`montumia.com/sd/...`). Other languages live under a path prefix
(e.g. English at `montumia.com/en/sd/...`). Anyone can translate a single chapter and
open a PR — you do **not** need to translate the whole book.

> **The golden rule:** if a translation doesn't exist yet, the page automatically falls
> back to Bengali. Nothing ever breaks, so you can translate one file at a time.

---

## How it works (30 seconds)

- Content lives in `content/sd/`. The Bengali files are the source of truth.
- A translation is just a **sibling file with a language suffix**:
  `introduction.mdx` → `introduction.en.mdx`.
- Fumadocs (`parser: "dot"`, configured in [`src/lib/i18n.ts`](src/lib/i18n.ts)) picks these
  up automatically. Missing translations fall back to Bengali via `fallbackLanguage`.
- Currently supported languages: **`bn`** (default), **`en`**. Adding a new one is a few
  lines — see [Add a new language](#c-add-a-new-language) below.

---

## ✨ The golden rule: tell the story, don't trade words

This is the most important thing on this page, so please read it before anything else.

**Do not translate word for word. Translate the _story_.** The goal is for your version to
read like it was written in your language from the very start, not like a machine ran over
the Bengali. A reader who knows nothing about Bangla or Bangladesh should laugh at the same
jokes, follow the same analogies, and never feel like they're missing an inside reference.

In practice, that means:

- **Adapt slang and forms of address; don't translate them literally.** In the Bengali, the
  senior engineer Boltu affectionately calls Montu _"Bhatija"_ (literally "nephew").
  Translated straight, "nephew" is just wrong and a little odd. The _feeling_ is an older
  mentor good-naturedly ribbing a junior, so in English it becomes "kid", "rookie", or "champ".
- **Swap idioms for your own language's idioms.** _"মৌচাকে ঢিল মারা"_ (lit. "throwing a stone
  at a beehive") becomes "kicked the hornet's nest". _"একাই একশো"_ becomes "a one-man army".
  Find the equivalent that lands; don't translate the literal picture.
- **Localize cultural and local references.** A famous Dhaka restaurant or a specific local
  market means little abroad, so reach for something globally recognizable instead (a tea
  stall scaling up "like Starbucks or KFC", "the city's computer market"). Keep a little local
  flavor where it's charming — Montu _is_ from Bangladesh — just make sure the point still
  lands for everyone.
- **Restore famous quotes to their original form.** When the Bengali is itself a translation
  of a well-known line, use the real one. For example: _"There are only two hard things in
  Computer Science: cache invalidation and naming things"_, or _"premature optimization is the
  root of all evil"_.
- **Keep the voice.** Playful, witty, story-first. Short, punchy sentences. If a line made you
  smile in Bengali, it should make the reader smile in your language too. Keep the character
  names (Montu Mia, Boltu) and the app name (BiralTube).

A simple gut check: would this sentence sound natural coming from a friend explaining the idea
over a cup of tea? If not, rewrite it until it does.

---

## A. Translate a chapter (the common case)

1. **Copy the Bengali file** and add your language suffix next to it:

   | Bengali (source) | Your translation (example: English `en`) |
   | --- | --- |
   | `content/sd/introduction.mdx` | `content/sd/introduction.en.mdx` |
   | `content/sd/scaling.mdx` | `content/sd/scaling.en.mdx` |
   | `content/sd/load-balancer/index.mdx` | `content/sd/load-balancer/index.en.mdx` |
   | `content/sd/load-balancer/types.mdx` | `content/sd/load-balancer/types.en.mdx` |

2. **Translate the frontmatter and the body.** Keep the structure identical:

   ```mdx
   ---
   title: Introduction              # translate
   description: The beginning of... # translate
   tags:                            # page-specific English SEO keywords (4-8 terms,
     - System Design Introduction   # in English even for non-English pages — they
     - System Design for Beginners  # bridge English searches to your content)
   ---

   Translate the prose here, keeping the playful, story-driven tone...
   ```

   > **Tip:** keep `tags` in English and make them specific to the chapter's topic (e.g.
   > `Round Robin`, `Cache Invalidation`, `Horizontal Scaling`), not generic words like
   > `Tutorial` or `Beginner`. They're combined with the site's default keywords to help
   > people find Bengali (and translated) content via English search queries.

3. **Don't touch the structural bits:**
   - **Image paths** stay the same (images are shared): `![Alt](/images/sd/introduction/1.png)`
     — you may translate the alt text.
   - **MDX components** (`<SubscribeModal />`, `<Mermaid />`, etc.) stay as-is.
   - **Mermaid diagrams**: translate the human-readable **labels** inside the
     ` ```mermaid ` block; leave the syntax/arrows untouched.
   - **Links** between chapters keep their Bengali slug (e.g. `/sd/scaling`) — the framework
     rewrites them to your locale automatically.

4. **(Optional) Translate the chapter ordering / section titles.** The navigation is driven
   by `meta.json` files. To translate the sidebar titles, copy them with your suffix and
   translate only the `title` fields (keep the `pages` slugs exactly the same):

   | Bengali | Translation |
   | --- | --- |
   | `content/sd/meta.json` | `content/sd/meta.en.json` |
   | `content/sd/load-balancer/meta.json` | `content/sd/load-balancer/meta.en.json` |

   If you skip this, the sidebar simply shows the Bengali titles for not-yet-translated
   sections — perfectly fine.

---

## B. Translate the site UI (buttons, modals, errors)

The non-article UI strings (homepage hero, the subscribe modal, error messages) live in
small JSON dictionaries:

- `src/dictionaries/bn.json` — Bengali (source of truth)
- `src/dictionaries/en.json` — English

> The doc-page action bar (Open / Share / Copy Link / Open in GitHub·ChatGPT·Claude /
> Subscribe) is intentionally kept in **English for every language**, so there's nothing to
> translate there.

To translate the UI into an existing language, edit that language's JSON file. **The keys
must mirror `bn.json` exactly** — a missing key is caught automatically:

```bash
bun run types:check   # fails with "Property 'x' is missing" if a key is absent
```

---

## C. Add a new language

Adding a language is **centralized**: you describe the language once in `LOCALE_META` and plug
in a dictionary. Everything derived from that list — the `/<lang>` URL prefix, routing and
Bengali fallback, the language toggle + flag dropdown, the sitemap, the `hreflang` SEO tags,
and OG-image generation — updates automatically. There are no scattered spots to remember.

Say you want to add Hindi (`hi`). **Four edits + one asset:**

1. **`src/lib/constants.ts`** — add `"hi"` to `LOCALES`, and add a matching `LOCALE_META`
   entry with **all five fields**:

   ```ts
   export const LOCALES = ["bn", "en", "hi"] as const;

   // ...add inside LOCALE_META:
   hi: {
     ogLocale: "hi_IN",     // OpenGraph og:locale
     siteName: "...",       // site title in your language
     label: "हिन्दी",        // shown in the language switcher
     flag: "/flags/hi.svg", // switcher flag (see step 2)
     hreflang: "hi-IN",     // BCP-47 hreflang tag, for SEO
   },
   ```

2. **`public/flags/hi.svg`** — drop in a small flag SVG (the `flag` path above points here).

3. **`src/dictionaries/hi.json`** — copy `src/dictionaries/bn.json` and translate the values
   (keep the keys identical). Then **register it** in `src/lib/dictionaries.ts`:

   ```ts
   import hi from "@/dictionaries/hi.json";
   // ...
   const dictionaries: Record<Locale, Dictionary> = { bn, en, hi };
   ```

4. **`src/lib/layout.shared.tsx`** — add a `hi` entry to the `defineI18nUI` translations (at
   minimum `displayName: "हिन्दी"`; optionally translate the Fumadocs chrome strings too).

Then add `*.hi.mdx` files as you translate chapters (Section A above). Run
`bun run types:check` — because `LOCALES` drives a `Record<Locale, …>`, the type-checker turns
a missing `LOCALE_META` field, `dictionaries` entry, or index-OG text (`INDEX_TEXT` in
`scripts/generate-index-og.ts`) into a **compile error** and walks you through anything you
forgot. That's it: the `/hi/...` routes, the toggle, fallback, the sitemap, and `hreflang`
tags all light up on their own.

---

## Preview your work locally

```bash
bun install
bun dev
```

- Bengali (unchanged): `http://localhost:3000/sd/<chapter>`
- Your language: `http://localhost:3000/<lang>/sd/<chapter>` (e.g. `/en/sd/introduction`)
- Use the **language toggle** in the docs sidebar footer (next to the theme toggle), or the
  flag dropdown at the top-right of the homepage, to switch between them.
- Untranslated pages will show the Bengali fallback under your language's chrome.

### (Optional) Regenerate social share images

Chapter OG/preview images are pre-generated. If you want them for your language, run
(requires Google Chrome installed locally):

```bash
bun run generate-og
```

This writes Bengali images to `public/og/sd/...` and translated images to
`public/og/<lang>/sd/...`.

---

## Before you open a PR ✅

```bash
bun run types:check   # types + translation completeness
bun run lint          # formatting / lint
```

- Check both locales render in the browser.
- Confirm untranslated siblings still fall back to Bengali (no broken pages).

---

## Scope notes

- The **email newsletter** is currently Bengali-only and not part of the translation
  workflow yet.
- Questions? Open an issue — see [CONTRIBUTING.md](CONTRIBUTING.md).

Thank you for helping more people learn system design! 💛
