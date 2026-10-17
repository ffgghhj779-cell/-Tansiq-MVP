import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const out = '/opt/cursor/artifacts';
fs.mkdirSync(out, { recursive: true });
const base = 'http://127.0.0.1:4327';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto(`${base}/products/p1`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.getByRole('button', { name: /add to cart/i }).first().click();
await page.waitForTimeout(400);
await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(out, 'phase2-checkout.png'), fullPage: true });

await page.fill('#phone', '0555123999');
await page.getByRole('button', { name: /send code/i }).click();
await page.waitForSelector('#otp');
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(out, 'phase2-otp-sent.png'), fullPage: true });

await page.fill('#otp', '1234');
await page.getByRole('button', { name: /^verify$/i }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(out, 'phase2-otp-verified.png'), fullPage: true });

await page.fill('#city', 'Riyadh');
await page.fill('#district', 'Al Narjis');
await page.fill('#shortAddress', 'RRRD2929');

await page.getByRole('button', { name: /order|pay on delivery|اطلب/i }).click();
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(out, 'phase2-order-confirmed.png'), fullPage: true });

const confirmedText = await page.locator('body').innerText();
const orderMatch = confirmedText.match(/TQ-\d+/);
const orderId = orderMatch?.[0];
console.log('orderId', orderId);
if (!orderId) throw new Error('No order id on confirmation: ' + confirmedText.slice(0, 300));

await page.getByRole('button', { name: /track|تتبع/i }).click();
await page.waitForURL(/\/orders\//);
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(out, 'phase2-order-tracking.png'), fullPage: true });

const trackText = await page.locator('body').innerText();
console.log('track has notifications', /notification|whatsapp|in_app|إشعار/i.test(trackText));
console.log('track snippet', trackText.slice(0, 500));
console.log('PHASE2_E2E_OK', orderId);
await browser.close();
