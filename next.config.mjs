import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/webp", "image/avif"],
  },
  // `${page.url}.mdx` serves the page's raw markdown (Copy Markdown button,
  // LLM prompts). src/proxy.ts skips dotted paths, so both locale forms are
  // mapped here explicitly. "bn" must match DEFAULT_LOCALE in constants.ts.
  async rewrites() {
    return [
      {
        source: "/sd/:path*.mdx",
        destination: "/llms.mdx/bn/:path*",
      },
      {
        source: "/:lang/sd/:path*.mdx",
        destination: "/llms.mdx/:lang/:path*",
      },
    ];
  },
};

export default withMDX(config);
