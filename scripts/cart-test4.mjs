import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('http://127.0.0.1:4327/products/p1', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Attach listener to see if native click fires
await page.evaluate(() => {
  window.__clicks = 0;
  document.querySelectorAll('button').forEach(b => {
    if (/Add to cart/i.test(b.textContent||'')) {
      b.addEventListener('click', () => { window.__clicks++; });
    }
  });
});

await page.locator('button', { hasText: 'Add to cart' }).first().click({ force: true });
await page.waitForTimeout(300);
console.log('native click count', await page.evaluate(() => window.__clicks));

// Try calling React props via __reactProps
const propsInfo = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find(b => /Add to cart/i.test(b.textContent||''));
  const allKeys = Object.getOwnPropertyNames(btn);
  const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(btn));
  // React 19 might store on fiber
  const fiberKey = Object.keys(btn).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance') || k.startsWith('__reactProps'));
  const keys = Object.keys(btn);
  return { fiberKey, keys, allKeys: allKeys.slice(0,20), text: btn?.textContent };
});
console.log('propsInfo', propsInfo);

await browser.close();
