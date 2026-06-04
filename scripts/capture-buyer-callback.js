// Targeted capture: callback-request (/call-feedback) with auth
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VM   = path.join(ROOT, 'visual-memory', 'buyer');
const VW   = { width: 1920, height: 900 };
const URL_BASE = 'https://uat.xrportal.in';
const MOB  = '8888888888';

async function tryLogin(page, otp, label) {
  console.log(`[${label}] Trying OTP: ${otp}`);
  await page.goto(`${URL_BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const mob = page.locator('input[placeholder*="Mobile" i], input[type="tel"]').first();
  if (!(await mob.isVisible().catch(() => false))) { console.log(`[${label}] No mobile input`); return false; }
  await mob.fill(MOB);

  await page.locator('button').filter({ hasText: /send otp/i }).first().click();
  console.log(`[${label}] Clicked Send OTP`);
  await page.waitForTimeout(4000);

  const boxes = page.locator('input[type="text"][maxlength="1"], input[autocomplete="one-time-code"]');
  const cnt = await boxes.count();
  console.log(`[${label}] OTP box count: ${cnt}`);
  if (cnt === 0) return false;

  const digits = otp.split('');
  for (let i = 0; i < Math.min(digits.length, cnt); i++) {
    await boxes.nth(i).fill(digits[i]);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1500);

  const vBtn = page.locator('button').filter({ hasText: /verify|login|submit|confirm/i }).first();
  if (await vBtn.isVisible().catch(() => false)) await vBtn.click();
  await page.waitForTimeout(6000);

  const url = page.url();
  console.log(`[${label}] URL after: ${url}`);
  return !/uat\.xrportal\.in\/?$/.test(url) || url.includes('/home');
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const ctx = await browser.newContext({ viewport: VW });
  const page = await ctx.newPage();

  // Try 258369 first, then 147258
  let ok = false;
  for (const otp of ['258369', '147258']) {
    ok = await tryLogin(page, otp, 'auth');
    if (ok) break;
    await ctx.clearCookies();
    await page.evaluate(() => sessionStorage.clear());
    await page.waitForTimeout(2000);
  }
  if (!ok) { console.error('Login failed with both OTPs'); await browser.close(); process.exit(1); }

  console.log('\n=== callback-request (/call-feedback) ===');
  await page.goto(`${URL_BASE}/call-feedback`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  console.log(`URL: ${page.url()}`);

  await page.screenshot({ path: path.join(VM, 'callback-request', 'callback-auth-loaded.png') });
  console.log('CAPTURED: callback-auth-loaded.png');

  const dom = await page.evaluate(() => {
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => `${h.tagName.toLowerCase()}: "${h.innerText.trim()}"`).slice(0, 10);
    const buttons = [...document.querySelectorAll('button:not([disabled])')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 15);
    const inputs = [...document.querySelectorAll('input[placeholder], textarea[placeholder]')].map(i => `${i.tagName.toLowerCase()}[placeholder="${i.getAttribute('placeholder')}"]`).slice(0, 10);
    const selects = [...document.querySelectorAll('.ant-select, select')].map(s => s.innerText.trim().substring(0, 60)).filter(Boolean).slice(0, 8);
    const radios = [...document.querySelectorAll('.ant-radio-button-wrapper, input[type="radio"] + label, .ant-radio-wrapper')].map(r => r.innerText.trim()).filter(Boolean).slice(0, 8);
    const pickers = [...document.querySelectorAll('.ant-picker, [class*="time-picker"], [class*="date-picker"]')].map(p => p.getAttribute('placeholder') || p.innerText.trim()).slice(0, 6);
    const labels = [...document.querySelectorAll('label, .ant-form-item-label')].map(l => l.innerText.trim()).filter(Boolean).slice(0, 12);
    const body = document.body.innerText.substring(0, 600);
    return { headings, buttons, inputs, selects, radios, pickers, labels, body };
  });

  console.log(`Headings: ${JSON.stringify(dom.headings)}`);
  console.log(`Buttons: ${JSON.stringify(dom.buttons)}`);
  console.log(`Inputs: ${JSON.stringify(dom.inputs)}`);
  console.log(`Selects: ${JSON.stringify(dom.selects)}`);
  console.log(`Radios: ${JSON.stringify(dom.radios)}`);
  console.log(`Pickers: ${JSON.stringify(dom.pickers)}`);
  console.log(`Labels: ${JSON.stringify(dom.labels)}`);
  console.log(`Body (600): ${dom.body}`);

  // Scroll states
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(VM, 'callback-request', 'callback-auth-scrolled.png') });
  console.log('CAPTURED: callback-auth-scrolled.png');

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(VM, 'callback-request', 'callback-request-full.png') });
  console.log('CAPTURED: callback-request-full.png (overwrite)');

  await browser.close();
  console.log('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
