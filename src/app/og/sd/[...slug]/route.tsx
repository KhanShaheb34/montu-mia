import { source } from "@/lib/source";
import { notFound } from "next/navigation";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

// 1. Force Node.js runtime (Chrome won't run on Edge)
export const runtime = "nodejs";
// 2. Ensure dynamic rendering (never static)
export const dynamic = "force-dynamic";
// 3. Increase timeout for browser startup
export const maxDuration = 60;
// 4. Cache OG images for 24 hours
export const revalidate = 86400;

// HTML escape utility to prevent broken output
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

// Retry logic for ETXTBSY errors during chromium extraction
async function launchBrowserWithRetry(
	isLocal: boolean,
	maxRetries = 3,
	delayMs = 1000,
) {
	let lastError: Error | undefined;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const executablePath = isLocal
				? process.platform === "win32"
					? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
					: process.platform === "darwin"
						? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
						: "/usr/bin/google-chrome"
				: await chromium.executablePath(
						"https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar",
					);

			return await puppeteer.launch({
				args: isLocal ? [] : chromium.args,
				defaultViewport: chromium.defaultViewport,
				executablePath,
				headless: chromium.headless,
			});
		} catch (error) {
			lastError = error as Error;
			// ETXTBSY means chromium binary is still being extracted/written
			if (
				"code" in lastError &&
				lastError.code === "ETXTBSY" &&
				attempt < maxRetries
			) {
				// Wait before retrying to let extraction complete
				await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
				continue;
			}
			throw error;
		}
	}

	throw lastError;
}

export async function GET(
	_req: Request,
	{ params }: RouteContext<"/og/sd/[...slug]">,
) {
	const { slug } = await params;
	const page = source.getPage(slug.slice(0, -1));
	if (!page) notFound();

	// 4. Launch Browser with retry logic for ETXTBSY errors
	const isLocal = process.env.NODE_ENV === "development";
	const browser = await launchBrowserWithRetry(isLocal);

	try {
		const pageTab = await browser.newPage();

		// Set viewport size for OG Image
		await pageTab.setViewport({ width: 1200, height: 630 });

		// 5. Create Real HTML with escaped content
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
        <div class="title">${escapeHtml(page.data.title)}</div>
        <div class="desc">${escapeHtml(page.data.description ?? "")}</div>
      </body>
    </html>
  `;

		await pageTab.setContent(htmlContent, {
			waitUntil: "networkidle0",
			timeout: 15000, // 15s timeout to avoid hanging on font load
		});

		// 6. Take Screenshot
		const buffer = await pageTab.screenshot({ type: "png" });

		// Convert Buffer to Uint8Array for Response compatibility
		return new Response(new Uint8Array(buffer), {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "public, max-age=86400, immutable",
			},
		});
	} finally {
		// Always close browser to prevent resource leaks
		await browser.close();
	}
}

// Removed generateStaticParams to avoid running Puppeteer at build time
// OG images will be generated on-demand at runtime and cached via revalidate
