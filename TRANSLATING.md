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
  lines — see [Add a new language](#add-a-new-language) below.

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
   tags:                            # leave English (these are SEO keywords)
     - Tutorial
     - Introduction
   ---

   Translate the prose here, keeping the playful, story-driven tone...
   ```

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

The non-article UI strings (homepage hero, the subscribe modal, share/copy buttons, error
messages) live in small JSON dictionaries:

- `src/dictionaries/bn.json` — Bengali (source of truth)
- `src/dictionaries/en.json` — English

To translate the UI into an existing language, edit that language's JSON file. **The keys
must mirror `bn.json` exactly** — a missing key is caught automatically:

```bash
bun run types:check   # fails with "Property 'x' is missing" if a key is absent
```

---

## C. Add a new language

Say you want to add Hindi (`hi`). Four small edits:

1. **`src/lib/i18n.ts`** — add `"hi"` to `languages`.
2. **`src/lib/constants.ts`** — add `"hi"` to `LOCALES` and an entry to `LOCALE_META`
   (`ogLocale`, `siteName`).
3. **`src/lib/layout.shared.tsx`** — add a `hi` entry to the `defineI18nUI` translations
   (at minimum `displayName: "हिन्दी"`; optionally translate the Fumadocs chrome).
4. **`src/dictionaries/hi.json`** — copy `bn.json` and translate the values.

Then add `*.hi.mdx` files as you translate chapters. Run `bun run types:check` — it will tell
you if anything is missing. That's it; the language toggle and routing pick it up
automatically.

---

## Preview your work locally

```bash
bun install
bun dev
```

- Bengali (unchanged): `http://localhost:3000/sd/<chapter>`
- Your language: `http://localhost:3000/<lang>/sd/<chapter>` (e.g. `/en/sd/introduction`)
- Use the **language toggle** in the top bar to switch between them.
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
