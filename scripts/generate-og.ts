import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({
    args: ["--enable-webgl", "--use-gl=angle"],
  });
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
    colorScheme: "dark",
  });

  // Set dark mode before navigation
  await page.addInitScript(() => {
    localStorage.setItem("theme", "dark");
  });

  await page.goto("https://recca0120.github.io/codeatlas/", {
    waitUntil: "networkidle",
  });

  // Ensure dark class is set
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
  });

  // Wait for globe WebGL to render and fade in
  await page.waitForTimeout(8000);

  // Screenshot the hero area
  await page.screenshot({
    path: "public/og.jpg",
    type: "jpeg",
    quality: 85,
    clip: { x: 0, y: 0, width: 1400, height: 735 },
  });

  await browser.close();
  console.log("Generated public/og.jpg");
}

main();
