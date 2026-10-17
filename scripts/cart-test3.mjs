import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const errors = [];
page.on('pageerror', err => errors.push(String(err)));
page.on('console', msg => {
  if (msg.type() === 'error') errors.push('console:' + msg.text());
});

await page.goto('http://127.0.0.1:4327/products/p1', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Use Playwright real click on the desktop Add to cart (not sticky mobile)
const add = page.locator('button', { hasText: 'Add to cart' }).nth(0);
await add.scrollIntoViewIfNeeded();
await add.click({ force: true });
await page.waitForTimeout(1000);

console.log('errors', errors);
console.log('cart', await page.evaluate(() => localStorage.getItem('tansiq-cart-v1')));
console.log('button text after', await add.textContent());

// Check if useCart throws - look for error boundary
console.log('body has error?', await page.getByText(/useCart must be|Application error|Something went/i).count());

await browser.close();
