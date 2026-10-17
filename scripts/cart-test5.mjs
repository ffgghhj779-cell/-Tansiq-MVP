import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const failed = [];
page.on('requestfailed', req => failed.push({ url: req.url(), err: req.failure()?.errorText }));
page.on('response', async res => {
  if (res.url().includes('/_next/') && res.status() >= 400) {
    failed.push({ url: res.url(), status: res.status() });
  }
});

await page.goto('http://127.0.0.1:4327/products/p1', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const scripts = await page.evaluate(() =>
  [...document.querySelectorAll('script[src]')].map(s => s.src)
);
console.log('scripts', scripts.slice(0, 15));
console.log('failed', failed.slice(0, 30));

const nextData = await page.evaluate(() => ({
  next: typeof window.next,
  nextF: typeof window.__next_f,
  react: typeof window.React,
}));
console.log('globals', nextData);

const fiber = await page.evaluate(() => {
  const btn = document.querySelector('button');
  return Object.keys(btn || {}).filter(k => k.toLowerCase().includes('react'));
});
console.log('fiber 127', fiber);
await browser.close();

const browser2 = await chromium.launch({ headless: true });
const page2 = await browser2.newPage();
const failed2 = [];
page2.on('requestfailed', req => failed2.push({ url: req.url(), err: req.failure()?.errorText }));
await page2.goto('http://localhost:4327/products/p1', { waitUntil: 'networkidle' });
await page2.waitForTimeout(1500);
console.log('failed localhost', failed2.slice(0, 20));
const cart2 = await page2.evaluate(async () => {
  const btn = [...document.querySelectorAll('button')].find(b => /Add to cart/i.test(b.textContent || ''));
  btn?.click();
  await new Promise(r => setTimeout(r, 300));
  return localStorage.getItem('tansiq-cart-v1');
});
console.log('localhost cart after click', cart2);
const fiber2 = await page2.evaluate(() => {
  const btn = document.querySelector('button');
  return Object.keys(btn || {}).filter(k => k.toLowerCase().includes('react'));
});
console.log('fiber localhost', fiber2);
await browser2.close();
