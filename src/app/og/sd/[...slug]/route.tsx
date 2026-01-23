import { getPageImage, source } from "@/lib/source";
import { notFound } from "next/navigation";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

// 1. Force Node.js runtime (Chrome won't run on Edge)
export const runtime = "nodejs";
// 2. Increase timeout for browser startup
export const maxDuration = 60;
// 3. Cache OG images for 24 hours
export const revalidate = 86400;

export async function GET(
	_req: Request,
	{ params }: RouteContext<"/og/sd/[...slug]">,
) {
	const { slug } = await params;
	const page = source.getPage(slug.slice(0, -1));
	if (!page) notFound();

	// 4. Launch Browser
	// Logic to switch between local Chrome (dev) and Serverless Chromium (prod)
	const isLocal = process.env.NODE_ENV === "development";

	const browser = await puppeteer.launch({
		args: isLocal ? [] : chromium.args,
		defaultViewport: chromium.defaultViewport,
		executablePath: isLocal
			? process.platform === "win32"
				? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
				: process.platform === "darwin"
					? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
					: "/usr/bin/google-chrome"
			: await chromium.executablePath(
					"https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar",
				),
		headless: chromium.headless,
	});

	const pageTab = await browser.newPage();

	// Set viewport size for OG Image
	await pageTab.setViewport({ width: 1200, height: 630 });

	// 5. Create Real HTML
	// We can use standard CSS @import for fonts! No buffer mess.
	const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700&display=swap');

          body {
            margin: 0;
            padding: 80px;
            width: 1200px;
            height: 630px;
            box-sizing: border-box;
            background-color: #030712; /* Dark bg */
            background-image: linear-gradient(to bottom right, #4c1d95, #030712);
            font-family: 'Hind Siliguri', sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
          }

          .site-name {
            font-size: 42px;
            color: #e879f9;
            margin-bottom: 20px;
          }

          .title {
            font-size: 84px;
            font-weight: 700;
            color: white;
            line-height: 1.1;
            margin-bottom: 20px;
          }

          .desc {
            font-size: 42px;
            color: #a1a1aa;
            max-width: 900px;
          }
        </style>
      </head>
      <body>
        <div class="site-name">মন্টু মিয়াঁর সিস্টেম ডিজাইন</div>
        <div class="title">${page.data.title}</div>
        <div class="desc">${page.data.description}</div>
      </body>
    </html>
  `;

	await pageTab.setContent(htmlContent, { waitUntil: "networkidle0" });

	// 6. Take Screenshot
	const buffer = await pageTab.screenshot({ type: "png" });
	await browser.close();

	// Convert Buffer to Uint8Array for Response compatibility
	return new Response(new Uint8Array(buffer), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=86400, immutable",
		},
	});
}

export function generateStaticParams() {
	return source.getPages().map((page) => ({
		slug: getPageImage(page).segments,
	}));
}
