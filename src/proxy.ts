import { createI18nMiddleware } from "fumadocs-core/i18n/middleware";
import { i18n } from "@/lib/i18n";

// Next.js 16 middleware file (formerly `middleware.ts`).
export default createI18nMiddleware(i18n);

export const config = {
  // Skip API routes, Next internals, and any path with a file extension (static assets).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
