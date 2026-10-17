import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('pageerror', err => console.log('PAGEERROR', err.message));
page.on('console', msg => {
  if (msg.type() === 'error') console.log('CONSOLE error', msg.text());
});

await page.goto('http://127.0.0.1:4327/products/p1', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);

const buttons = await page.locator('button').evaluateAll(els => els.map(e => ({
  text: e.textContent?.trim().slice(0, 40),
  disabled: e.disabled,
  type: e.getAttribute('type'),
  pe: getComputedStyle(e).pointerEvents,
  z: getComputedStyle(e).zIndex,
})));
console.log('buttons', JSON.stringify(buttons, null, 2));

// Try evaluate click on data-slot=button containing Add
const result = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('[data-slot=button]')];
  const add = btns.find(b => /add to cart|أضف/i.test(b.textContent || ''));
  if (!add) return { error: 'no add button', texts: btns.map(b => b.textContent) };
  add.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  return {
    clicked: true,
    text: add.textContent,
    cart: localStorage.getItem('tansiq-cart-v1'),
  };
});
console.log('evaluate click', result);
await page.waitForTimeout(500);
console.log('after wait cart', await page.evaluate(() => localStorage.getItem('tansiq-cart-v1')));

// Check React fiber / hydration
const reactRoot = await page.evaluate(() => {
  const el = document.querySelector('[data-slot=button]');
  const keys = el ? Object.keys(el).filter(k => k.startsWith('__react')) : [];
  return { keys, html: document.body.innerHTML.includes('Added') };
});
console.log('react', reactRoot);

await browser.close();
