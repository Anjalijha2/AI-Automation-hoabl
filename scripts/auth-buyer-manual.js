// Standalone buyer auth — tries OTP 258369 first, then 147258
// Saves session to buyer.json on success
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT  = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'buyer.json');
const URL  = 'https://uat.xrportal.in/';
const MOB  = '8888888888';

async function tryLogin(page, otp, log) {
  log(`Navigating to ${URL}`);
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  log(`URL: ${page.url()}`);

  const heading = await page.locator('h1,h2,h3').first().innerText().catch(() => '');
  log(`Heading: "${heading}"`);

  // Fill mobile
  const mobileInput = page.locator(
    'input[type="tel"], input[placeholder*="Mobile" i], input[placeholder*="mobile" i], input[placeholder*="phone" i]'
  ).first();
  if (!(await mobileInput.isVisible().catch(() => false))) {
    log('No mobile input visible');
    return false;
  }
  await mobileInput.fill(MOB);
  log(`Filled mobile: ${MOB}`);

  // Click Send OTP
  const sendBtn = page.locator('button').filter({ hasText: /send otp/i }).first();
  if (!(await sendBtn.isVisible().catch(() => false))) {
    log('No Send OTP button');
    return false;
  }
  await sendBtn.click();
  log('Clicked Send OTP');
  await page.waitForTimeout(3000);

  // Wait for OTP inputs
  const otpBox = page.locator(
    'input[aria-label*="OTP" i], input[aria-label*="otp" i], input[type="text"][maxlength="1"], input[autocomplete="one-time-code"]'
  ).first();
  const otpVisible = await otpBox.isVisible().catch(() => false);
  log(`OTP box visible: ${otpVisible}`);

  if (!otpVisible) {
    const bodySnip = await page.locator('body').innerText().catch(() => '');
    log(`Body (300): ${bodySnip.substring(0, 300)}`);
    return false;
  }

  // Fill OTP digits
  const boxes = page.locator(
    'input[aria-label*="OTP" i], input[aria-label*="otp" i], input[type="text"][maxlength="1"], input[autocomplete="one-time-code"]'
  );
  const digits = otp.split('');
  for (let i = 0; i < digits.length; i++) {
    await boxes.nth(i).fill(digits[i]);
  }
  log(`Filled OTP: ${otp}`);

  // Submit
  const submitBtn = page.locator('button').filter({ hasText: /verify|login|submit/i }).first();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    log('Clicked verify');
  }

  // Wait for redirect away from login
  await page.waitForTimeout(5000);
  const afterUrl = page.url();
  log(`URL after verify: ${afterUrl}`);

  const stillOnLogin = /uat\.xrportal\.in\/$/.test(afterUrl) || afterUrl === URL;
  return !stillOnLogin;
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const ctx  = await browser.newContext({ viewport: { width: 1920, height: 900 } });
  const page = await ctx.newPage();
  const log  = [];
  const note = m => { console.log(m); log.push(m); };

  const otps = ['258369', '147258'];
  let success = false;

  for (const otp of otps) {
    note(`\n--- Trying OTP: ${otp} ---`);
    const ok = await tryLogin(page, otp, note);
    if (ok) {
      note(`SUCCESS with OTP ${otp}`);
      await ctx.storageState({ path: OUT });
      note(`Session saved to ${OUT}`);
      success = true;
      break;
    }
    note(`FAILED with OTP ${otp}`);
    // Clear cookies for retry
    await ctx.clearCookies();
    await page.waitForTimeout(1000);
  }

  if (!success) note('All OTPs failed — buyer session NOT saved');

  fs.writeFileSync(
    path.join(ROOT, 'scripts', '_auth-buyer-log.json'),
    JSON.stringify({ log, timestamp: new Date().toISOString() }, null, 2)
  );
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
