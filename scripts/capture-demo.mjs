import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const OUT = "/cursor/stores/bc-a22e2c57-f718-4d88-8bc0-80bc80faec34/media/tansiq-mvp";
const BASE = "http://127.0.0.1:4327";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: "ar-SA",
});
const page = await context.newPage();

async function shot(name, path, waitMs = 1200) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(waitMs);
  const file = `${OUT}/${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log("saved", file);
  return file;
}

await shot("01-landing", "/");
await shot("02-home", "/home");
await shot("03-style-hub", "/style");
await shot("04-products", "/products");
await shot("05-product-detail", "/products/p1", 1500);
await shot("06-seller-upload", "/seller/upload");
await shot("07-orders", "/orders/TQ-10482");
await shot("08-account", "/account");

// English toggle on landing
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.getByRole("button", { name: /English|العربية/i }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/09-landing-en.png`, fullPage: false });
console.log("saved", `${OUT}/09-landing-en.png`);

// Short journey video via Playwright video
await context.close();
const videoContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  recordVideo: { dir: OUT, size: { width: 390, height: 844 } },
});
const vpage = await videoContext.newPage();
await vpage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await vpage.waitForTimeout(1000);
await vpage.getByRole("link", { name: /ادخل|Enter/i }).first().click();
await vpage.waitForTimeout(1200);
await vpage.goto(`${BASE}/style`);
await vpage.waitForTimeout(1000);
await vpage.goto(`${BASE}/products/p1`);
await vpage.waitForTimeout(1200);
await vpage.getByRole("button", { name: /أضف|Add/i }).first().click();
await vpage.waitForTimeout(800);
await vpage.goto(`${BASE}/cart`);
await vpage.waitForTimeout(1000);
await vpage.goto(`${BASE}/seller/upload`);
await vpage.waitForTimeout(800);
await vpage.getByRole("button", { name: /التقط|Capture/i }).click();
await vpage.waitForTimeout(2500);
const video = vpage.video();
await videoContext.close();
const vpath = await video.path();
const { rename, copyFile } = await import("fs/promises");
const dest = `${OUT}/walkthrough-mobile.webm`;
try {
  await rename(vpath, dest);
} catch {
  await copyFile(vpath, dest);
}
console.log("saved", dest);

await browser.close();
console.log("done");
