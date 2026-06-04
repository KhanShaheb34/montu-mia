import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { DEFAULT_LOCALE, LOCALE_META, LOCALES } from "../src/lib/constants";

// Index/landing hero text per locale (chapter OG text comes from frontmatter).
const INDEX_TEXT: Record<string, { title: string; desc: string }> = {
	bn: { title: "সিস্টেম ডিজাইন", desc: "বাংলায় সিস্টেম ডিজাইন শিখুন" },
	en: { title: "System Design", desc: "Learn system design through stories" },
};

// Absolute output path for a locale's index OG image. Bengali (default) keeps
// public/og/sd/index; other locales use public/og/<lang>/sd/index.
function ogIndexPath(locale: string): string {
	const segments =
		locale === DEFAULT_LOCALE
			? ["public", "og", "sd", "index", "image.png"]
			: ["public", "og", locale, "sd", "index", "image.png"];
	return path.join(process.cwd(), ...segments);
}

async function generateIndexOG(locale: string) {
	const text = INDEX_TEXT[locale] ?? INDEX_TEXT.bn;
	const siteName =
		LOCALE_META[locale as keyof typeof LOCALE_META]?.siteName ??
		LOCALE_META.bn.siteName;

	console.log(`Generating fallback OG image for index page (${locale})...`);

	const executablePath =
		process.platform === "win32"
			? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
			: process.platform === "darwin"
				? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
				: "/usr/bin/google-chrome";

	const browser = await puppeteer.launch({
		executablePath,
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	try {
		const page = await browser.newPage();
		await page.setViewport({ width: 1200, height: 630 });

		// Read and convert Montu Mia image to base64
		const montuImagePath = path.join(process.cwd(), "public", "montu_hero.png");
		const montuImageBuffer = fs.readFileSync(montuImagePath);
		const montuImageBase64 = montuImageBuffer.toString("base64");
		const montuImageDataUrl = `data:image/png;base64,${montuImageBase64}`;

		const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700&family=Outfit:wght@400;600;700&display=swap');

          body {
            margin: 0;
            padding: 0;
            width: 1200px;
            height: 630px;
            box-sizing: border-box;
            background-color: #f8fafc;
            background-image: linear-gradient(to bottom right, #fef08a, #bfdbfe);
            font-family: 'Hind Siliguri', 'Outfit', sans-serif;
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 60px 80px;
            gap: 60px;
          }

          .image-container {
            flex-shrink: 0;
            width: 300px;
            height: auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .image-container img {
            width: 100%;
            height: auto;
            object-fit: contain;
          }

          .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .site-name {
            font-size: 36px;
            color: #0f172a;
            margin-bottom: 20px;
            font-weight: 600;
          }

          .title {
            font-size: 68px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.1;
            margin-bottom: 16px;
          }

          .desc {
            font-size: 32px;
            color: #475569;
            line-height: 1.3;
          }
        </style>
      </head>
      <body>
        <div class="image-container">
          <img src="${montuImageDataUrl}" alt="Montu Mia" />
        </div>
        <div class="content">
          <div class="site-name">${siteName}</div>
          <div class="title">${text.title}</div>
          <div class="desc">${text.desc}</div>
        </div>
      </body>
    </html>
  `;

		await page.setContent(htmlContent, {
			waitUntil: "networkidle0",
			timeout: 15000,
		});

		const buffer = await page.screenshot({ type: "png" });
		const outputPath = ogIndexPath(locale);
		fs.mkdirSync(path.dirname(outputPath), { recursive: true });
		fs.writeFileSync(outputPath, buffer);
		console.log(`✓ Saved fallback OG image: ${outputPath}`);
	} finally {
		await browser.close();
	}
}

async function main() {
	for (const locale of LOCALES) {
		await generateIndexOG(locale);
	}
}

main().catch((error) => {
	console.error("Error generating fallback OG image:", error);
	process.exit(1);
});
