import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import matter from "gray-matter";

// Recursively find all .mdx files in a directory
function findMdxFiles(dir: string, baseDir: string = dir): string[] {
	const files: string[] = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...findMdxFiles(fullPath, baseDir));
		} else if (entry.isFile() && entry.name.endsWith(".mdx")) {
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

async function generateOGImage(
	title: string,
	description: string,
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
            background-color: #f8fafc;
            background-image: linear-gradient(to bottom right, #fef08a, #bfdbfe);
            font-family: 'Hind Siliguri', sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
          }

          .site-name {
            font-size: 42px;
            color: #0f172a;
            margin-bottom: 20px;
            font-weight: 600;
          }

          .title {
            font-size: 84px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.1;
            margin-bottom: 20px;
          }

          .desc {
            font-size: 42px;
            color: #475569;
            max-width: 900px;
          }
        </style>
      </head>
      <body>
        <div class="site-name">মন্টু মিয়াঁর সিস্টেম ডিজাইন</div>
        <div class="title">${escapeHtml(title)}</div>
        <div class="desc">${escapeHtml(description)}</div>
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
	console.log("Starting OG image generation...\n");

	const contentDir = path.join(process.cwd(), "content", "sd");
	const publicDir = path.join(process.cwd(), "public", "og", "sd");

	// Clean existing OG images
	if (fs.existsSync(publicDir)) {
		fs.rmSync(publicDir, { recursive: true });
	}

	// Find all MDX files
	const mdxFiles = findMdxFiles(contentDir);

	let count = 0;

	// Generate OG images for all pages
	for (const file of mdxFiles) {
		const filePath = path.join(contentDir, file);
		const content = fs.readFileSync(filePath, "utf-8");
		const { data } = matter(content);

		const title = data.title as string | undefined;
		const description = (data.description as string | undefined) || "";

		if (!title) {
			console.warn(`Skipping ${file}: no title in frontmatter`);
			continue;
		}

		// Convert file path to slug (remove .mdx extension and convert index to parent folder)
		let slug = file.replace(/\.mdx$/, "");
		if (slug.endsWith("/index")) {
			slug = slug.replace(/\/index$/, "");
		}
		if (slug === "index") {
			continue; // Skip root index
		}

		const outputPath = path.join(publicDir, slug, "image.png");
		await generateOGImage(title, description, outputPath);
		count++;
	}

	console.log(`\n✓ Generated ${count} OG images successfully!`);
}

main().catch((error) => {
	console.error("Error generating OG images:", error);
	process.exit(1);
});
