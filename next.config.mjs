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
  // Externalize Puppeteer and Chromium packages for serverless compatibility
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium-min"],
};

export default withMDX(config);
