// Targeted capture: callback-request (needs auth) + KYC detail
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VM   = path.join(ROOT, 'visual-memory', 'buyer');
const VW   = { width: 1920, height: 900 };
const URL_BASE = 'https://uat.xrportal.in';
const MOB  = '8888888888';
const OTP  = '147258';

async function inspectPage(page) {
  return page.evaluate(() => {
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .map(h => `${h.tagName.toLowerCase()}: "${h.innerText.trim()}"`)
      .filter(t => t.length < 120).slice(0, 10);
    const buttons = [...document.querySelectorAll('button:not([disabled])')]
      .map(b => { const t = b.innerText.trim(); return t ? `"${t}" (${b.className.substring(0,70)})` : null; })
      .filter(Boolean).slice(0, 15);
    const inputs = [...document.querySelectorAll('input[placeholder], textarea[placeholder], select')]
      .map(i => {
        if (i.tagName === 'SELECT') return `select (options: ${[...i.options].map(o=>o.text).join(', ')})`;
        return `${i.tagName.toLowerCase()}[placeholder="${i.getAttribute('placeholder')}"]`;
      }).slice(0, 10);
    const bodyText = document.body.innerText.substring(0, 500);
    const selects = [...document.querySelectorAll('.ant-select')].map(s => s.innerText.trim()).slice(0, 8);
    const radios  = [...document.querySelectorAll('.ant-radio-button-wrapper, input[type="radio"]')]
      .map(r => r.innerText?.trim() || r.value).filter(Boolean).slice(0, 8);
    return { headings, buttons, inputs, bodyText, selects, radios };
  });
}

async function doLogin(page) {
  await page.goto(`${URL_BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const mob = page.locator('input[placeholder*="Mobile" i], input[type="tel"]').first();
  await mob.fill(MOB);
  await page.locator('button').filter({ hasText: /send otp/i }).first().click();
  await page.waitForTimeout(4000);
  const boxes = page.locator('input[type="text"][maxlength="1"], input[autocomplete="one-time-code"]');
  const digits = OTP.split('');
  for (let i = 0; i < Math.min(digits.length, await boxes.count()); i++) {
    await boxes.nth(i).fill(digits[i]);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1500);
  const vBtn = page.locator('button').filter({ hasText: /verify|login|submit/i }).first();
  if (await vBtn.isVisible().catch(() => false)) await vBtn.click();
  await page.waitForTimeout(6000);
  console.log(`[auth] URL after login: ${page.url()}`);
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const ctx = await browser.newContext({ viewport: VW });
  const page = await ctx.newPage();

  await doLogin(page);

  // === callback-request ===
  console.log('\n=== callback-request ===');
  await page.goto(`${URL_BASE}/call-feedback`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  console.log(`URL: ${page.url()}`);
  await page.screenshot({ path: path.join(VM, 'callback-request', 'callback-loaded.png') });
  const cbDom = await inspectPage(page);
  console.log(`Headings: ${JSON.stringify(cbDom.headings)}`);
  console.log(`Buttons: ${JSON.stringify(cbDom.buttons)}`);
  console.log(`Inputs: ${JSON.stringify(cbDom.inputs)}`);
  console.log(`Selects: ${JSON.stringify(cbDom.selects)}`);
  console.log(`Radios: ${JSON.stringify(cbDom.radios)}`);
  console.log(`Body: ${cbDom.bodyText}`);

  // Scroll and capture
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(VM, 'callback-request', 'callback-scrolled.png') });
  console.log('CAPTURED: callback-scrolled.png');

  // Check for form fields (schedule call form)
  const formFields = await page.evaluate(() => {
    const fields = [...document.querySelectorAll('input, textarea, .ant-select, .ant-picker, .ant-radio-group')]
      .map(el => ({
        tag: el.tagName,
        placeholder: el.getAttribute('placeholder'),
        cls: el.className.substring(0, 50),
        text: el.innerText?.trim()?.substring(0, 50),
      })).filter(f => f.placeholder || f.text).slice(0, 12);
    return fields;
  });
  console.log(`Form fields detail: ${JSON.stringify(formFields)}`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(VM, 'callback-request', 'callback-request-full.png') });
  console.log('CAPTURED: callback-request-full.png');

  // === KYC ===
  console.log('\n=== KYC ===');
  await page.goto(`${URL_BASE}/kyc`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  console.log(`URL: ${page.url()}`);
  await page.screenshot({ path: path.join(VM, 'kyc', 'kyc-initial.png') });
  const kycDom = await inspectPage(page);
  console.log(`Headings: ${JSON.stringify(kycDom.headings)}`);
  console.log(`Buttons: ${JSON.stringify(kycDom.buttons)}`);
  console.log(`Inputs: ${JSON.stringify(kycDom.inputs)}`);
  console.log(`Body: ${kycDom.bodyText}`);

  // Check all form elements detail
  const kycElements = await page.evaluate(() => {
    const all = [...document.querySelectorAll('input, select, textarea, .ant-upload, .ant-select, .ant-picker')]
      .map(el => ({
        tag: el.tagName,
        placeholder: el.getAttribute('placeholder'),
        id: el.id,
        name: el.getAttribute('name'),
        type: el.getAttribute('type'),
        cls: el.className.substring(0, 60),
      })).filter(el => el.placeholder || el.id || el.name || el.cls.includes('upload')).slice(0, 20);

    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,label,.ant-form-item-label')]
      .map(h => h.innerText.trim()).filter(Boolean).slice(0, 20);

    const uploadAreas = [...document.querySelectorAll('.ant-upload, [class*="upload"]')]
      .map(u => u.innerText?.trim()?.substring(0, 60)).filter(Boolean).slice(0, 8);

    const fullBody = document.body.innerText.substring(0, 1000);
    return { elements: all, headings, uploadAreas, fullBody };
  });
  console.log(`KYC elements: ${JSON.stringify(kycElements.elements)}`);
  console.log(`KYC headings/labels: ${JSON.stringify(kycElements.headings)}`);
  console.log(`KYC upload areas: ${JSON.stringify(kycElements.uploadAreas)}`);
  console.log(`KYC full body: ${kycElements.fullBody}`);

  // Scroll through KYC
  for (let scroll = 200; scroll <= 1200; scroll += 200) {
    await page.evaluate(s => window.scrollTo(0, s), scroll);
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: path.join(VM, 'kyc', 'kyc-scrolled-deep.png') });
  console.log('CAPTURED: kyc-scrolled-deep.png');

  // Check for tabs or steps
  const kycTabs = await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.ant-tabs-tab, [role="tab"], .ant-steps-item')].map(t => t.innerText.trim());
    const steps = [...document.querySelectorAll('.ant-steps-item-title, .step-title')].map(s => s.innerText.trim());
    return { tabs, steps };
  });
  console.log(`KYC tabs/steps: ${JSON.stringify(kycTabs)}`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(VM, 'kyc', 'kyc-full.png') });
  console.log('CAPTURED: kyc-full.png (overwrite)');

  // === Check nav for hidden modules ===
  console.log('\n=== Nav check from home ===');
  await page.goto(`${URL_BASE}/home`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const navLinks = await page.evaluate(() => {
    return [...document.querySelectorAll('nav a, [class*="menu"] a, [class*="sidebar"] a, aside a, [class*="nav"] a')]
      .map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href'), cls: a.className.substring(0,40) }))
      .filter(a => a.text && a.href)
      .slice(0, 20);
  });
  console.log(`Nav links with hrefs: ${JSON.stringify(navLinks)}`);

  await browser.close();
  console.log('\nDone.');
}

run().catch(e => { console.error(e); process.exit(1); });
