import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

async function generateIndexOG() {
	console.log("Generating fallback OG image for index page...");

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
          @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700&display=swap');

          body {
            margin: 0;
            padding: 0;
            width: 1200px;
            height: 630px;
            box-sizing: border-box;
            background-color: #f8fafc;
            background-image: linear-gradient(to bottom right, #fef08a, #bfdbfe);
            font-family: 'Hind Siliguri', sans-serif;
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
          <div class="site-name">মন্টু মিয়াঁর সিস্টেম ডিজাইন</div>
          <div class="title">সিস্টেম ডিজাইন</div>
          <div class="desc">বাংলায় সিস্টেম ডিজাইন শিখুন</div>
        </div>
      </body>
    </html>
  `;

		await page.setContent(htmlContent, {
			waitUntil: "networkidle0",
			timeout: 15000,
		});

		const buffer = await page.screenshot({ type: "png" });
		const outputPath = path.join(
			process.cwd(),
			"public",
			"og",
			"sd",
			"index",
			"image.png",
		);

		fs.writeFileSync(outputPath, buffer);
		console.log(`✓ Saved fallback OG image: ${outputPath}`);
	} finally {
		await browser.close();
	}
}

generateIndexOG().catch((error) => {
	console.error("Error generating fallback OG image:", error);
	process.exit(1);
});
