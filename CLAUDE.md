# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "মন্টু মিয়াঁর সিস্টেম ডিজাইন" (Montu Mia's System Design) - a Bengali-language system design learning platform. The project teaches system design concepts through storytelling, using simple analogies and Bengali language content.

## Commands

### Development
```bash
bun install          # Install dependencies
bun dev              # Start development server at http://localhost:3000
bun build            # Build for production
bun start            # Start production server
```

### Code Quality
```bash
bun run types:check  # Run full type checking (includes MDX processing and Next.js type generation)
bun run lint         # Run Biome linter
bun run format       # Format code with Biome
```

### Post-Install
- `fumadocs-mdx` runs automatically after `bun install` via postinstall script

## Architecture

### Content Management (Fumadocs)

The project uses **Fumadocs** - a documentation framework built on Next.js. Content workflow:

1. **Content Source**: MDX files in `content/sd/` directory
   - Example: `content/sd/introduction.mdx`, `content/sd/scaling.mdx`
   - Navigation structure defined in `content/sd/meta.json`

2. **Content Processing Pipeline**:
   - `source.config.ts` defines the docs collection pointing to `content/sd/`
   - `fumadocs-mdx` (run via postinstall) processes MDX files and generates output to `.source/` directory
   - The `.source/` directory is gitignored and regenerated on each build

3. **Content Access**:
   - Import from `"fumadocs-mdx:collections/server"` (virtual import)
   - This path maps to `.source/*` via tsconfig path alias
   - Used in `src/lib/source.ts` which exports the `source` loader

4. **Rendering**:
   - `src/app/sd/[[...slug]]/page.tsx` - Catch-all route for rendering docs pages
   - `src/app/sd/layout.tsx` - Uses Fumadocs `DocsLayout` component
   - MDX components defined in `src/mdx-components.tsx`

### App Structure (Next.js App Router)

- `src/app/(home)/` - Homepage route group
- `src/app/sd/` - System design docs section (main content)
- `src/app/api/search/` - Search API endpoint
- `src/app/og/` - Dynamic OG image generation
- `src/app/actions.ts` - Server actions (newsletter subscription via Resend)

### Key Libraries

- **Fumadocs**: Documentation framework (fumadocs-core, fumadocs-mdx, fumadocs-ui)
- **Next.js 16**: App Router with React Server Components
- **Tailwind CSS 4**: Styling via PostCSS
- **Biome**: Linting and formatting
- **Resend**: Email service for newsletter subscriptions
- **Radix UI**: Headless UI components (Dialog, Slot, etc.)
- **Vercel Analytics & Speed Insights**: Built-in tracking

### Styling

- Uses two fonts: Outfit (Latin) and Noto Sans Bengali (Bengali script)
- Font variables: `--font-outfit`, `--font-bengali`
- Tailwind configured via `@tailwindcss/postcss` plugin
- Custom component utilities in `src/lib/cn.ts` (class merging)

### Newsletter Feature

The newsletter subscription flow:
1. User clicks subscribe button (rendered via `SubscribeModal` component)
2. Modal opens with email input form
3. Form submission triggers `subscribeToNewsletter` server action in `src/app/actions.ts`
4. Server action uses Resend API to add contact to audience segment
5. Requires environment variables: `RESEND_API_KEY` and `RESEND_SEGMENT_ID`

### Environment Configuration

Required environment variables (see `src/app/actions.ts`):
- `RESEND_API_KEY` - Resend API key for email service
- `RESEND_SEGMENT_ID` - Resend audience/segment ID for newsletter

### OG Image Generation

The project uses Puppeteer with Chromium to generate dynamic OG images for each content page. Key implementation details:

1. **Technology Stack**:
   - `puppeteer-core` (v22.x) - Headless browser control
   - `@sparticuz/chromium-min` (v131.x) - Chromium binary for serverless environments
   - Configured to use Bengali web fonts (Hind Siliguri)

2. **Vercel Deployment Requirements**:

   **CRITICAL**: Add this environment variable in Vercel Dashboard (Project Settings → Environment Variables):
   - `AWS_LAMBDA_JS_RUNTIME=nodejs22.x` - Required for shared library compatibility

   This environment variable **MUST** be set in the Vercel dashboard before module loading, not in code.

3. **How It Works**:
   - Route: `/og/sd/[...slug]` (dynamic route in `src/app/og/sd/[...slug]/route.tsx`)
   - Images generated on-demand at runtime (not at build time)
   - Cached for 24 hours via `revalidate = 86400`
   - Uses Bengali fonts loaded from Google Fonts CDN

4. **Next.js Configuration**:
   - `serverExternalPackages` in `next.config.mjs` prevents bundling Puppeteer/Chromium
   - `LD_LIBRARY_PATH` set automatically to find Chromium shared libraries
   - Runtime: `nodejs` (not Edge)
   - Max duration: 60 seconds

## Important Patterns

### Adding New Content Pages

1. Create MDX file in `content/sd/` (e.g., `content/sd/new-topic.mdx`)
2. Add page reference to `content/sd/meta.json` in the `pages` array
3. Run `fumadocs-mdx` (happens automatically via postinstall) or restart dev server
4. Page will be available at `/sd/new-topic`

### Working with MDX

- Frontmatter schema defined in `source.config.ts` using `frontmatterSchema`
- Processed markdown is available via `page.data.getText("processed")`
- Custom MDX components can be added to `src/mdx-components.tsx`

### Type Checking

Always run `bun run types:check` before committing. This command:
1. Processes MDX files (`fumadocs-mdx`)
2. Generates Next.js types (`next typegen`)
3. Runs TypeScript compiler in check mode (`tsc --noEmit`)

### Path Aliases

- `@/*` → `./src/*` (e.g., `@/components/ui/button`)
- `fumadocs-mdx:collections/*` → `.source/*` (virtual imports for processed content)

## Site Configuration

- Base URL for docs: `/sd` (configured in `src/lib/source.ts`)
- Site title: "মন্টু মিয়াঁর সিস্টেম ডিজাইন" (Montu Mia's System Design)
- Primary language: Bengali (`lang="bn"`)
- Production URL: https://montumia.com
- License: CC-BY-NC-SA-4.0 (content), MIT (code snippets)
