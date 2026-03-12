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

### Email & Newsletter

```bash
bun run email:preview      # Preview email template in browser at http://localhost:3001
bun run send-emails:test   # Send test email to shakirulhkhan@gmail.com
bun run send-emails:all    # Send to all subscribers (requires confirmation)
```

### OG Image Generation

```bash
bun run generate-og    # Generate OG images for all MDX content
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
- `src/app/actions.ts` - Server actions (newsletter subscription via AWS SES)

### Key Libraries

- **Fumadocs**: Documentation framework (fumadocs-core, fumadocs-mdx, fumadocs-ui)
- **Next.js 16**: App Router with React Server Components
- **Tailwind CSS 4**: Styling via PostCSS
- **Biome**: Linting and formatting
- **AWS SES**: Email service for newsletter subscriptions (eu-west-1 region)
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
4. Server action uses AWS SES `CreateContactCommand` to add contact to SES contact list
5. Requires environment variables: `AWS_REGION`, `SES_CONTACT_LIST_NAME`

### Email System (Newsletter Sending)

The project includes a complete email sending pipeline using React Email and AWS SES:

1. **Email Templates**:
   - Located in `emails/` directory
   - `newsletter-react.tsx` - Main React Email template
   - `data/past-posts.json` - List of past articles to include in emails
   - Built with `@react-email/components` for email client compatibility

2. **Template Features**:
   - Site logo/OG image at top
   - Bengali title: "মন্টু মিয়াঁর নতুন অভিযানে স্বাগতম"
   - Last episode summary (variable)
   - Current topic teaser (variable)
   - Featured article image (variable)
   - LinkedIn article link (variable)
   - Auto-generated past posts list from JSON
   - Unsubscribe link
   - Matches site theme from `global.css` (amber/yellow color scheme)

3. **Sending Emails**:

   ```bash
   # Preview email in browser (with hot reload)
   bun run email:preview    # Opens http://localhost:3001

   # Send test email to shakirulhkhan@gmail.com
   bun run send-emails:test

   # Send to all subscribers in SES contact list
   bun run send-emails:all

   # List current subscribers
   bun run subscribers [count]
   ```

4. **Customization**:
   - Edit `scripts/send-emails.ts` to update:
     - `EMAIL_CONTENT` object (subject, summary, links, images)
     - `TEST_RECIPIENT` or add multiple recipients
     - Rate limiting delay (default: 1 second between sends)
   - Edit `emails/data/past-posts.json` to update article list
   - Edit `emails/newsletter-react.tsx` to modify template design

5. **Workflow for Each Newsletter**:
   - Create/publish new article on website and LinkedIn
   - Run `bun run generate-og` to create OG image
   - Update `emails/data/past-posts.json` with new article
   - Update `EMAIL_CONTENT` in `scripts/send-emails.ts`
   - Preview: `bun run email:preview`
   - Test send: `bun run send-emails:test`
   - Check email in inbox
   - Send to all: `bun run send-emails:all`

6. **Email Client Compatibility**:
   - Template works on Gmail, Outlook, Apple Mail, Yahoo, ProtonMail
   - Uses inline styles (no external CSS)
   - Mobile-responsive design
   - Bengali font fallbacks

7. **Unsubscribe System**:
   - Each recipient gets a unique, secure unsubscribe link
   - Includes `List-Unsubscribe` and `List-Unsubscribe-Post` headers (RFC 2369 & RFC 8058)
   - Modern email clients show "Unsubscribe" button in header
   - API endpoint at `/api/unsubscribe` handles unsubscribe requests
   - Marks contacts as unsubscribed in SES contact list (via `UpdateContactCommand` with `UnsubscribeAll`)
   - Secured with HMAC-SHA256 hash verification

See `emails/README.md` for detailed documentation.

### Environment Configuration

Required environment variables:

- `AWS_REGION` - AWS region for SES (default: `eu-west-1`)
- `AWS_ACCESS_KEY_ID` - IAM access key (for Vercel; not needed locally if `~/.aws/credentials` is configured)
- `AWS_SECRET_ACCESS_KEY` - IAM secret key (for Vercel; not needed locally if `~/.aws/credentials` is configured)
- `SES_CONTACT_LIST_NAME` - SES contact list name (e.g., `montu-mia-subscribers`)
- `SES_CONFIGURATION_SET` - SES configuration set name (e.g., `montu-mia-config`)
- `UNSUBSCRIBE_SECRET` - Secret key for generating secure unsubscribe links (generate with `openssl rand -hex 32`)
- `TEST_EMAIL` - Email address for test sends

### OG Image Generation

The project uses static OG images generated locally using Puppeteer. Images are pre-generated and committed to the repository.

1. **Technology Stack**:
   - `puppeteer-core` (v22.x) - Headless browser control (dev dependency)
   - `@sparticuz/chromium` (v131.x) - Chromium binary for local generation (dev dependency)
   - `gray-matter` - For parsing MDX frontmatter
   - Bengali web fonts (Hind Siliguri) loaded from Google Fonts CDN

2. **Generating OG Images**:

   Run the generation script locally whenever you add/update content:

   ```bash
   bun run generate-og
   ```

   This script:
   - Reads all MDX files from `content/sd/`
   - Parses frontmatter (title, description)
   - Generates OG images using Puppeteer
   - Saves images to `public/og/sd/{slug}/image.png`
   - Uses light color theme (yellow-blue gradient) matching the website design

3. **How It Works**:
   - Static images served from `public/og/sd/` directory
   - Pages reference images via `/og/sd/{slug}/image.png` path
   - No serverless/runtime generation needed
   - Faster page loads (static files)
   - No Vercel deployment issues

4. **Workflow**:
   - Add or update MDX content
   - Run `bun run generate-og` locally
   - Commit generated images to git
   - Deploy to Vercel (images served as static assets)

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

**Frontmatter Fields:**

- `title` (required) - Page title in Bengali
- `description` (optional) - Page description in Bengali
- `tags` (optional) - Array of SEO keywords in English

**Example:**

```mdx
---
title: লোড ব্যালেন্সার আসলে কী?
description: ট্রাফিক ম্যানেজমেন্ট এর মূল ধারণা
tags:
  - Load Balancer
  - Load Balancing
  - Server
  - Traffic Management
---

Content goes here...
```

### SEO Tags/Keywords

The site supports SEO tags for better search engine visibility:

1. **Default Keywords** (auto-added to every page):
   - Bangla, Bengali, System Design, সিস্টেম ডিজাইন
   - Montu Mia, মন্টু মিয়াঁ
   - Software Engineering, সফটওয়্যার ইঞ্জিনিয়ারিং

2. **Page-Specific Tags**:
   - Add `tags` array to frontmatter with English keywords
   - These are combined with default keywords in the `<meta name="keywords">` tag
   - Helps search engines index Bengali content via English terms

3. **Why Tags Help SEO**:
   - Bengali content is harder to discover via English searches
   - English tags bridge the gap between English search queries and Bengali content
   - Improves discoverability on Google, Bing, etc.
   - Better indexing for technical terms (Load Balancer, Scaling, etc.)

4. **Best Practices**:
   - Use 4-8 specific, relevant keywords per page
   - Include technical terms in English
   - Mix general and specific terms (e.g., "Scaling" + "Horizontal Scaling")
   - Don't repeat default keywords in page tags

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
- Production URL: https://www.montumia.com
- License: CC-BY-NC-SA-4.0 (content), MIT (code snippets)
