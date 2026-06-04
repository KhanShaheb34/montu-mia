import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import puppeteer from "puppeteer-core";
import { DEFAULT_LOCALE, LOCALE_META, LOCALES } from "../src/lib/constants";

// A locale-suffixed content file, e.g. "introduction.en.mdx" or
// "load-balancer/index.en.mdx". Base (default-locale) files do NOT match.
function isLocaleSuffixed(name: string): boolean {
	return /\.[a-z]{2}\.mdx$/.test(name);
}

// Recursively find all BASE .mdx files (Bengali default) in a directory,
// skipping locale-suffixed siblings like *.en.mdx — those are looked up per
// chapter when generating the English image.
function findMdxFiles(dir: string, baseDir: string = dir): string[] {
	const files: string[] = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...findMdxFiles(fullPath, baseDir));
		} else if (
			entry.isFile() &&
			entry.name.endsWith(".mdx") &&
			!isLocaleSuffixed(entry.name)
		) {
			files.push(path.relative(baseDir, fullPath));
		}
	}

	return files;
}

// HTML escape utility to prevent broken output
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

// Absolute output directory for a locale's OG images. Bengali (default) keeps
// the original public/og/sd path; other locales use public/og/<lang>/sd.
function ogDirForLocale(locale: string): string {
	return locale === DEFAULT_LOCALE
		? path.join(process.cwd(), "public", "og", "sd")
		: path.join(process.cwd(), "public", "og", locale, "sd");
}

async function generateOGImage(
	title: string,
	description: string,
	siteName: string,
	outputPath: string,
) {
	console.log(`Generating OG image for: ${title}`);

	// Launch browser (local Chrome)
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
          <div class="site-name">${escapeHtml(siteName)}</div>
          <div class="title">${escapeHtml(title)}</div>
          <div class="desc">${escapeHtml(description)}</div>
        </div>
      </body>
    </html>
  `;

		await page.setContent(htmlContent, {
			waitUntil: "networkidle0",
			timeout: 15000,
		});

		const buffer = await page.screenshot({ type: "png" });

		// Ensure directory exists
		const dir = path.dirname(outputPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		// Save image
		fs.writeFileSync(outputPath, buffer);
		console.log(`✓ Saved: ${outputPath}`);
	} finally {
		await browser.close();
	}
}

async function main() {
	const filterArg = process.argv[2];

	if (filterArg) {
		console.log(`Starting OG image generation with filter: "${filterArg}"...\n`);
	} else {
		console.log("Starting OG image generation for all chapters...\n");
	}

	const contentDir = path.join(process.cwd(), "content", "sd");

	// Clean existing OG images for every locale only when not filtering
	if (!filterArg) {
		for (const locale of LOCALES) {
			const dir = ogDirForLocale(locale);
			if (fs.existsSync(dir)) {
				fs.rmSync(dir, { recursive: true });
			}
		}
	}

	// Find all BASE MDX files (Bengali); these define the chapter slug set
	let mdxFiles = findMdxFiles(contentDir);

	if (filterArg) {
		const cleanFilter = path.normalize(filterArg.trim()).toLowerCase();
		mdxFiles = mdxFiles.filter((file) => {
			const fullFilePath = path.join(contentDir, file).toLowerCase();
			const relativePath = file.toLowerCase();
			const slug = relativePath.replace(/\.mdx$/, "");
			const slugWithoutIndex = slug.endsWith("/index")
				? slug.replace(/\/index$/, "")
				: slug;

			return (
				relativePath.includes(cleanFilter) ||
				slug.includes(cleanFilter) ||
				slugWithoutIndex.includes(cleanFilter) ||
				fullFilePath.includes(cleanFilter)
			);
		});

		if (mdxFiles.length === 0) {
			console.warn(`No chapters found matching filter: "${filterArg}"`);
			return;
		}
	}

	let count = 0;

	// Generate OG images for matched pages, once per locale.
	for (const file of mdxFiles) {
		// Convert file path to slug (drop .mdx, collapse folder index to parent)
		let slug = file.replace(/\.mdx$/, "");
		if (slug.endsWith("/index")) {
			slug = slug.replace(/\/index$/, "");
		}
		if (slug === "index") {
			continue; // Skip root index (handled by generate-index-og.ts)
		}

		for (const locale of LOCALES) {
			// Pick the source file for this locale: the base file for the default
			// locale, the `.<locale>.mdx` sibling when it exists, otherwise fall
			// back to the base file so /og/<locale>/sd/<slug> always resolves.
			let sourceRel = file;
			if (locale !== DEFAULT_LOCALE) {
				const localeRel = file.replace(/\.mdx$/, `.${locale}.mdx`);
				if (fs.existsSync(path.join(contentDir, localeRel))) {
					sourceRel = localeRel;
				}
			}

			const content = fs.readFileSync(
				path.join(contentDir, sourceRel),
				"utf-8",
			);
			const { data } = matter(content);

			const title = data.title as string | undefined;
			const description = (data.description as string | undefined) || "";

			if (!title) {
				console.warn(`Skipping ${sourceRel}: no title in frontmatter`);
				continue;
			}

			const outputPath = path.join(ogDirForLocale(locale), slug, "image.png");
			await generateOGImage(
				title,
				description,
				LOCALE_META[locale].siteName,
				outputPath,
			);
			count++;
		}
	}

	console.log(`\n✓ Generated ${count} OG images successfully!`);
}

main().catch((error) => {
	console.error("Error generating OG images:", error);
	process.exit(1);
});
