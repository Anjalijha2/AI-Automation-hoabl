// Diagnose buyer portal auth — where is the JWT stored?
// Logs in, navigates to /home, dumps ALL storage (cookies, localStorage, sessionStorage)
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const URL  = 'https://uat.xrportal.in/';
const MOB  = '8888888888';
const OTP  = '147258';

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const ctx  = await browser.newContext({ viewport: { width: 1920, height: 900 } });
  const page = await ctx.newPage();
  const log  = [];
  const note = m => { console.log(m); log.push(m); };

  note('=== STEP 1: Navigate to login ===');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  note(`URL: ${page.url()}`);

  // Dump pre-login storage
  const preStorage = await page.evaluate(() => ({
    localStorage: Object.entries(localStorage),
    sessionStorage: Object.entries(sessionStorage),
  }));
  note(`Pre-login localStorage: ${JSON.stringify(preStorage.localStorage)}`);
  note(`Pre-login sessionStorage: ${JSON.stringify(preStorage.sessionStorage)}`);

  note('=== STEP 2: Fill mobile ===');
  const mobileInput = page.locator('input[placeholder*="Mobile" i], input[type="tel"]').first();
  await mobileInput.waitFor({ state: 'visible', timeout: 10000 });
  await mobileInput.fill(MOB);
  note(`Filled mobile: ${MOB}`);

  note('=== STEP 3: Click Send OTP ===');
  const sendBtn = page.locator('button').filter({ hasText: /send otp/i }).first();
  await sendBtn.click();
  await page.waitForTimeout(4000);

  // Check if OTP input appeared
  const otpBox = page.locator(
    'input[aria-label*="OTP" i], input[type="text"][maxlength="1"], input[autocomplete="one-time-code"]'
  ).first();
  const otpVisible = await otpBox.isVisible().catch(() => false);
  note(`OTP box visible: ${otpVisible}`);

  if (!otpVisible) {
    // Dump body to see what happened
    const body = await page.locator('body').innerText().catch(() => '');
    note(`Body after Send OTP: ${body.substring(0, 500)}`);
    await browser.close();
    return;
  }

  note('=== STEP 4: Fill OTP ===');
  const boxes = page.locator(
    'input[aria-label*="OTP" i], input[type="text"][maxlength="1"], input[autocomplete="one-time-code"]'
  );
  const count = await boxes.count();
  note(`OTP boxes count: ${count}`);
  const digits = OTP.split('');
  for (let i = 0; i < Math.min(digits.length, count); i++) {
    await boxes.nth(i).fill(digits[i]);
    await page.waitForTimeout(100);
  }
  note(`Filled OTP: ${OTP}`);

  // Check for auto-submit or verify button
  await page.waitForTimeout(2000);
  const currentUrl = page.url();
  note(`URL after OTP fill: ${currentUrl}`);

  const verifyBtn = page.locator('button').filter({ hasText: /verify|login|submit|confirm/i }).first();
  const verifyVisible = await verifyBtn.isVisible().catch(() => false);
  if (verifyVisible) {
    await verifyBtn.click();
    note('Clicked verify button');
  } else {
    note('No verify button visible — auto-submit or already submitted');
  }

  note('=== STEP 5: Wait for redirect ===');
  await page.waitForTimeout(6000);
  note(`URL after verify: ${page.url()}`);

  // Check for second OTP attempt (wrong OTP case)
  const stillOnLogin = /uat\.xrportal\.in\/$/.test(page.url()) && page.url() === URL;
  if (stillOnLogin) {
    const body = await page.locator('body').innerText().catch(() => '');
    note(`Still on login. Body: ${body.substring(0, 400)}`);

    // Try alternate OTP
    note('=== Trying alternate OTP: 258369 ===');
    const altOTP = '258369';
    const altDigits = altOTP.split('');
    const altBoxes = page.locator(
      'input[aria-label*="OTP" i], input[type="text"][maxlength="1"], input[autocomplete="one-time-code"]'
    );
    const altCount = await altBoxes.count();
    if (altCount > 0) {
      for (let i = 0; i < Math.min(altDigits.length, altCount); i++) {
        await altBoxes.nth(i).fill(altDigits[i]);
        await page.waitForTimeout(100);
      }
      const altVerify = page.locator('button').filter({ hasText: /verify|login|submit|confirm/i }).first();
      if (await altVerify.isVisible().catch(() => false)) await altVerify.click();
      await page.waitForTimeout(6000);
      note(`URL after alt OTP: ${page.url()}`);
    }
  }

  note('=== STEP 6: Dump ALL storage after login ===');
  const afterStorage = await page.evaluate(() => ({
    localStorage: Object.entries(localStorage),
    sessionStorage: Object.entries(sessionStorage),
    url: window.location.href,
  }));
  note(`After-login URL: ${afterStorage.url}`);
  note(`After-login localStorage (${afterStorage.localStorage.length} keys):`);
  for (const [k, v] of afterStorage.localStorage) {
    const preview = v.length > 200 ? v.substring(0, 200) + '...' : v;
    note(`  localStorage["${k}"] = ${preview}`);
  }
  note(`After-login sessionStorage (${afterStorage.sessionStorage.length} keys):`);
  for (const [k, v] of afterStorage.sessionStorage) {
    const preview = v.length > 200 ? v.substring(0, 200) + '...' : v;
    note(`  sessionStorage["${k}"] = ${preview}`);
  }

  // Dump cookies
  const cookies = await ctx.cookies('https://uat.xrportal.in');
  note(`After-login cookies (${cookies.length}):`);
  for (const c of cookies) {
    note(`  cookie: name="${c.name}" value="${c.value.substring(0,80)}" httpOnly=${c.httpOnly} secure=${c.secure} domain=${c.domain}`);
  }

  // If still on login, try navigating to /home explicitly
  if (/uat\.xrportal\.in\/$/.test(page.url())) {
    note('=== Still on login — navigating to /home explicitly ===');
    await page.goto('https://uat.xrportal.in/home', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    note(`URL after /home navigate: ${page.url()}`);

    const homeStorage = await page.evaluate(() => ({
      localStorage: Object.entries(localStorage),
      sessionStorage: Object.entries(sessionStorage),
    }));
    note(`/home localStorage (${homeStorage.localStorage.length} keys):`);
    for (const [k, v] of homeStorage.localStorage) {
      const preview = v.length > 200 ? v.substring(0, 200) + '...' : v;
      note(`  localStorage["${k}"] = ${preview}`);
    }
    note(`/home sessionStorage (${homeStorage.sessionStorage.length} keys):`);
    for (const [k, v] of homeStorage.sessionStorage) {
      const preview = v.length > 200 ? v.substring(0, 200) + '...' : v;
      note(`  sessionStorage["${k}"] = ${preview}`);
    }
  }

  // Save full storageState for inspection
  const stateFile = path.join(ROOT, 'scripts', '_buyer-auth-state-diagnostic.json');
  await ctx.storageState({ path: stateFile });
  note(`StorageState saved to: ${stateFile}`);

  // Save log
  fs.writeFileSync(
    path.join(ROOT, 'scripts', '_buyer-auth-diagnostic.json'),
    JSON.stringify({ log, timestamp: new Date().toISOString() }, null, 2)
  );
  note(`Log saved to scripts/_buyer-auth-diagnostic.json`);

  await page.waitForTimeout(3000);
  await browser.close();
  note('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
