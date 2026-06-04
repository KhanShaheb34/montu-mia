import { createI18nMiddleware } from "fumadocs-core/i18n/middleware";
import { i18n } from "@/lib/i18n";

// Next.js 16 uses `proxy.ts` (formerly `middleware.ts`). This rewrites
// unprefixed paths to the default locale (`bn`) and routes `/en/...` to the
// English tree. See src/lib/i18n.ts.
export default createI18nMiddleware(i18n);

export const config = {
  // Run on everything EXCEPT: API routes (server actions + /api/unsubscribe),
  // Next internals, and any path with a file extension (static assets, the
  // /og/**/*.png images, sitemap.xml, robots.txt, *.mdx raw content, etc.).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
