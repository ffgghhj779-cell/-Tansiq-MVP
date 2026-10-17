import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const base = process.env.BASE_URL || "http://127.0.0.1:4327";
const out = "/opt/cursor/artifacts";
fs.mkdirSync(out, { recursive: true });

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function measureNav(page) {
  return page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Main"]');
    if (!nav) return null;
    const r = nav.getBoundingClientRect();
    const cs = getComputedStyle(nav);
    return {
      top: r.top,
      bottom: r.bottom,
      height: r.height,
      width: r.width,
      position: cs.position,
      left: r.left,
      right: r.right,
      vh: window.innerHeight,
      stuckToBottom: Math.abs(r.bottom - window.innerHeight) < 3,
      fullWidth: r.left <= 1 && r.width >= window.innerWidth - 4,
      innerWidth: window.innerWidth,
    };
  });
}

async function bgSample(page) {
  return page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const main = document.querySelector("main");
    const mainBg = main ? getComputedStyle(main).backgroundColor : null;
    return {
      bodyBg: body.backgroundColor,
      bodyImage: body.backgroundImage.slice(0, 80),
      mainBg,
      // pure white check on body solid color
      isPureWhite:
        body.backgroundColor === "rgb(255, 255, 255)" ||
        body.backgroundColor === "rgba(0, 0, 0, 0)",
    };
  });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
});
const page = await context.newPage();
await page.setViewportSize({ width: 390, height: 844 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

// Landing
await page.goto(`${base}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
console.log("viewport", page.viewportSize());
await page.screenshot({ path: path.join(out, "ui-landing.png"), fullPage: true });

// Home
await page.goto(`${base}/home`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const bg = await bgSample(page);
console.log("bg", bg);
assert(!bg.isPureWhite, "Body should not be flat pure white");

let nav = await measureNav(page);
console.log("nav initial", nav);
assert(nav, "Bottom nav missing");
assert(nav.position === "fixed", "Nav must be fixed");
assert(nav.stuckToBottom, `Nav not stuck to bottom: bottom=${nav.bottom} vh=${nav.vh}`);
assert(
  nav.left <= 1 && nav.width >= 380,
  `Nav width unexpected: ${JSON.stringify(nav)}`,
);

await page.screenshot({ path: path.join(out, "ui-home-top.png") });

// Scroll deeply and re-measure nav (the jump/cut bug)
for (const y of [400, 900, 1600, 2400]) {
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
  await page.waitForTimeout(250);
  const m = await measureNav(page);
  console.log(`nav @scroll ${y}`, m);
  assert(m.stuckToBottom, `Nav drifted at scroll ${y}: bottom=${m.bottom} vh=${m.vh}`);
  assert(m.position === "fixed", `Nav position changed at ${y}`);
}

await page.screenshot({ path: path.join(out, "ui-home-scrolled.png") });

// Horizontal category strip shouldn't break layout
const catOverflow = await page.evaluate(() => {
  const strip = document.querySelector(".h-scroll");
  if (!strip) return { missing: true };
  const r = strip.getBoundingClientRect();
  return {
    missing: false,
    scrollWidth: strip.scrollWidth,
    clientWidth: strip.clientWidth,
    overflows: strip.scrollWidth > strip.clientWidth + 8,
    withinViewport: r.left >= -2 && r.right <= window.innerWidth + 2,
  };
});
console.log("category strip", catOverflow);
assert(!catOverflow.missing, "Category h-scroll missing");

// PDP — dual bottom bars shouldn't overlap incorrectly
await page.goto(`${base}/products/p1`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
const pdpBars = await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Main"]');
  const cta = [...document.querySelectorAll("div.fixed")].find((el) =>
    /add to cart/i.test(el.textContent || ""),
  );
  const nr = nav.getBoundingClientRect();
  const cr = cta?.getBoundingClientRect();
  return {
    navBottom: nr.bottom,
    navTop: nr.top,
    ctaBottom: cr?.bottom ?? null,
    ctaTop: cr?.top ?? null,
    gap: cr ? nr.top - cr.bottom : null,
    overlap: cr ? !(cr.bottom <= nr.top + 1 || cr.top >= nr.bottom - 1) : false,
  };
});
console.log("pdp bars", pdpBars);
assert(!pdpBars.overlap, "PDP CTA overlaps bottom nav");
assert(pdpBars.gap !== null && pdpBars.gap >= -1, "PDP CTA should sit above nav");

await page.screenshot({ path: path.join(out, "ui-pdp.png"), fullPage: false });

// Cart / style / checkout smoke
for (const route of ["/style", "/cart", "/account", "/products"]) {
  await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  const m = await measureNav(page);
  assert(m?.stuckToBottom, `Nav broken on ${route}`);
}

await page.screenshot({ path: path.join(out, "ui-style.png") });

console.log("pageerrors", errors);
assert(errors.length === 0, `Page errors: ${errors.join("; ")}`);
console.log("UI_POLISH_OK");
await browser.close();
