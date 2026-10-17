import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
page.on('pageerror', err => console.log('PAGEERROR', err.message));

await page.goto('http://127.0.0.1:4327/products/p1', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const addBtn = page.getByRole('button', { name: /add to cart|أضف/i }).first();
console.log('add visible', await addBtn.isVisible());
await addBtn.click();
await page.waitForTimeout(800);

const storage = await page.evaluate(() => localStorage.getItem('tansiq-cart-v1'));
console.log('localStorage cart', storage);

const added = await page.getByText(/Added|أُضيفت/).count();
console.log('added feedback count', added);

await page.goto('http://127.0.0.1:4327/cart', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const bodyText = await page.locator('body').innerText();
console.log('cart body snippet', bodyText.slice(0, 500));

await browser.close();
