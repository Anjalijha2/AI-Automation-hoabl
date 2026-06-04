/**
 * Buyer Portal Visual Capture — 5 remaining modules
 * Targets: home-dashboard, support-tickets, allocation-experience, home-loan, callback-request
 *
 * AUTH FIX: sessionStorage["xr_auth_token"] clears on some navigations.
 * Solution: save full sessionStorage after login, re-inject before each module if lost.
 *
 * Run: cd "D:/AI_Automation/xanadu - AI automation" && node scripts/capture-buyer-5modules.js
 */
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const VM       = path.join(ROOT, 'visual-memory', 'buyer');
const VW       = { width: 1920, height: 900 };
const BASE     = 'https://uat.xrportal.in';
const MOB      = '8888888888';
const OTPS     = ['258369', '147258'];

const log = (m) => console.log(`[${new Date().toISOString().substring(11,19)}] ${m}`);
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const ensureDir = (d) => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); };

async function shot(page, dir, name) {
  ensureDir(dir);
  await page.screenshot({ path: path.join(dir, name), fullPage: false });
  log(`  SHOT: ${name}`);
}
async function shotFull(page, dir, name) {
  ensureDir(dir);
  await page.screenshot({ path: path.join(dir, name), fullPage: true });
  log(`  SHOT(full): ${name}`);
}

async function inspect(page) {
  return page.evaluate(() => {
    const t = (s, n=100) => (s||'').trim().substring(0, n);
    return {
      url:      location.href,
      headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h=>`${h.tagName.toLowerCase()}: "${t(h.innerText)}"`).slice(0,10),
      buttons:  [...document.querySelectorAll('button:not([disabled])')].map(b=>{ const x=t(b.innerText,60); return x?`"${x}" (${t(b.className,50)})`:null; }).filter(Boolean).slice(0,20),
      inputs:   [...document.querySelectorAll('input,textarea')].map(i=>`${i.tagName.toLowerCase()}[type="${i.type}"][placeholder="${i.getAttribute('placeholder')||''}"][name="${i.getAttribute('name')||''}"]`).slice(0,15),
      selects:  [...document.querySelectorAll('.ant-select,.ant-select-selector')].map(s=>t(s.innerText,60)).filter(Boolean).slice(0,8),
      uploads:  [...document.querySelectorAll('.ant-upload,[class*="upload"]')].map(u=>t(u.innerText,60)).filter(Boolean).slice(0,8),
      links:    [...document.querySelectorAll('a')].map(a=>`"${t(a.innerText,30)}"->${a.getAttribute('href')||''}`).filter(x=>x.length<100).slice(0,20),
      tabs:     [...document.querySelectorAll('.ant-tabs-tab,[role="tab"]')].map(x=>t(x.innerText,40)).filter(Boolean).slice(0,12),
      columns:  [...document.querySelectorAll('th,.ant-table-column-title')].map(x=>t(x.innerText,40)).filter(Boolean).slice(0,12),
      body:     t(document.body.innerText, 600),
    };
  });
}

async function getSession(page) {
  return page.evaluate(() => {
    const out = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      out[k] = sessionStorage.getItem(k);
    }
    return out;
  });
}

async function restoreSession(page, saved) {
  await page.evaluate((s) => {
    Object.entries(s).forEach(([k, v]) => sessionStorage.setItem(k, v));
  }, saved);
  log('  [AUTH] Session restored from saved copy');
}

async function checkAuth(page) {
  return page.evaluate(() => !!sessionStorage.getItem('xr_auth_token'));
}

async function navigateWithAuth(page, url, saved) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await wait(2000);

  // check if we got redirected to login
  const currentUrl = page.url();
  const isLogin = currentUrl === BASE + '/' || currentUrl === BASE;
  const hasAuth = await checkAuth(page);

  if (isLogin || !hasAuth) {
    log(`  [AUTH] Session lost navigating to ${url} — restoring...`);
    // inject session into current page context then navigate again
    await restoreSession(page, saved);
    await wait(500);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await wait(3000);

    const stillLogin = page.url() === BASE + '/' || page.url() === BASE;
    if (stillLogin) {
      log(`  [AUTH] Restore failed — page still on login. Trying page reload with session inject...`);
      // try: navigate to home first, inject, then go to target
      await page.goto(BASE + '/home', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await wait(1000);
      await restoreSession(page, saved);
      await wait(500);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await wait(3000);
    }
  }
  await wait(2000);
}

async function login(page) {
  log('[LOGIN] Navigating to login page...');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await wait(2000);

  for (const otp of OTPS) {
    log(`[LOGIN] Trying OTP: ${otp}`);
    try {
      // fill mobile
      await page.fill('input[placeholder="Enter Mobile Number"]', MOB);
      await wait(500);

      // click Send OTP
      const sendBtn = page.locator('button').filter({ hasText: /send otp/i }).first();
      await sendBtn.click();
      log('[LOGIN] Clicked Send OTP');
      await wait(3000);

      // check for OTP boxes
      const otpBoxes = await page.locator('input[maxlength="1"]').count();
      log(`[LOGIN] OTP box count: ${otpBoxes}`);

      if (otpBoxes >= 6) {
        const boxes = page.locator('input[maxlength="1"]');
        for (let i = 0; i < 6; i++) {
          await boxes.nth(i).click();
          await boxes.nth(i).type(otp[i]);
          await wait(100);
        }
        log('[LOGIN] OTP entered — waiting for verify button...');
        await wait(1000);

        const verifyBtn = page.locator('button').filter({ hasText: /verify/i }).first();
        const verifyVisible = await verifyBtn.isVisible().catch(() => false);
        if (verifyVisible) {
          await verifyBtn.click();
          log('[LOGIN] Clicked Verify');
        }

        // wait for redirect to /home
        await page.waitForURL('**/home', { timeout: 15000 }).catch(() => {});
        await wait(2000);

        const currentUrl = page.url();
        log(`[LOGIN] After verify — URL: ${currentUrl}`);
        if (currentUrl.includes('/home')) {
          log('[LOGIN] SUCCESS — on home dashboard');
          return true;
        }
      } else {
        log(`[LOGIN] OTP boxes not found with ${otp}, trying next OTP...`);
        // reload for next attempt
        await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await wait(3000);
      }
    } catch (e) {
      log(`[LOGIN] Error: ${e.message}`);
      await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await wait(3000);
    }
  }
  log('[LOGIN] FAILED with all OTPs');
  return false;
}

// ============================================================
// MODULE CAPTURE FUNCTIONS
// ============================================================

async function captureHomeDashboard(page, saved) {
  log('\n--- HOME DASHBOARD ---');
  const dir = path.join(VM, 'home-dashboard');
  await navigateWithAuth(page, `${BASE}/home`, saved);

  const dom = await inspect(page);
  log(`  URL: ${dom.url}`);
  log(`  Headings: ${JSON.stringify(dom.headings)}`);
  log(`  Buttons: ${JSON.stringify(dom.buttons)}`);
  log(`  Columns: ${JSON.stringify(dom.columns)}`);

  await shot(page, dir, 'home-dashboard-winner-state.png');
  await page.evaluate(() => window.scrollTo(0, 400));
  await wait(800);
  await shot(page, dir, 'home-dashboard-mid-cards.png');
  await page.evaluate(() => window.scrollTo(0, 800));
  await wait(800);
  await shot(page, dir, 'home-dashboard-bottom-cards.png');
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(500);
  await shotFull(page, dir, 'home-dashboard-winner-full.png');

  // try to capture top cards separately
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(500);
  await shot(page, dir, 'home-dashboard-top-cards.png');

  return dom;
}

async function captureSupportTickets(page, saved) {
  log('\n--- SUPPORT TICKETS ---');
  const dir = path.join(VM, 'support-tickets');
  await navigateWithAuth(page, `${BASE}/support-tickets`, saved);

  const dom = await inspect(page);
  log(`  URL: ${dom.url}`);
  log(`  Headings: ${JSON.stringify(dom.headings)}`);
  log(`  Buttons: ${JSON.stringify(dom.buttons)}`);
  log(`  Columns: ${JSON.stringify(dom.columns)}`);

  await shot(page, dir, 'support-list-current.png');
  await shotFull(page, dir, 'support-list-current-full.png');

  // click Select Category dropdown
  try {
    const categoryDd = page.locator('.ant-select').first();
    await categoryDd.click();
    await wait(1500);
    await shot(page, dir, 'support-categories.png');
    // close by pressing Escape
    await page.keyboard.press('Escape');
    await wait(500);
  } catch (e) { log(`  [WARN] Category dropdown: ${e.message}`); }

  // click Create Ticket if visible in nav
  try {
    const createBtn = page.locator('text=/create ticket/i').first();
    const visible = await createBtn.isVisible().catch(() => false);
    if (visible) {
      await createBtn.click();
      await wait(2000);
      await shot(page, dir, 'support-create.png');
      await shotFull(page, dir, 'support-create-full.png');
      // go back
      await page.goBack();
      await wait(2000);
    }
  } catch (e) { log(`  [WARN] Create ticket: ${e.message}`); }

  // click first ticket row if any
  try {
    const row = page.locator('tbody tr').first();
    const rowVisible = await row.isVisible().catch(() => false);
    if (rowVisible) {
      await row.click();
      await wait(2000);
      await shot(page, dir, 'support-ticket-detail.png');
      await shotFull(page, dir, 'support-ticket-detail-full.png');
      await page.goBack();
      await wait(2000);
    } else {
      log('  [INFO] No ticket rows visible (empty list)');
    }
  } catch (e) { log(`  [WARN] Ticket row: ${e.message}`); }

  return dom;
}

async function captureAllocation(page, saved) {
  log('\n--- ALLOCATION EXPERIENCE ---');
  const dir = path.join(VM, 'allocation-experience');
  await navigateWithAuth(page, `${BASE}/alloted`, saved);

  const dom = await inspect(page);
  log(`  URL: ${dom.url}`);
  log(`  Headings: ${JSON.stringify(dom.headings)}`);
  log(`  Buttons: ${JSON.stringify(dom.buttons)}`);

  await shot(page, dir, 'allocation-winner-landing.png');
  await page.evaluate(() => window.scrollTo(0, 400));
  await wait(800);
  await shot(page, dir, 'allocation-winner-scrolled.png');
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(500);
  await shotFull(page, dir, 'allocation-winner-landing-full.png');

  // try clicking Select Unit button
  try {
    const selectBtn = page.locator('button.btn-book-solid').first();
    const visible = await selectBtn.isVisible().catch(() => false);
    if (visible) {
      log('  [INFO] Select Unit button found — clicking...');
      await selectBtn.click();
      await wait(3000);
      await shot(page, dir, 'allocation-unit-selection-grid.png');
      await shotFull(page, dir, 'allocation-unit-selection-full.png');

      // try scrolling to see floor grid
      await page.evaluate(() => window.scrollTo(0, 400));
      await wait(800);
      await shot(page, dir, 'allocation-unit-grid-scrolled.png');

      // go back
      await page.goBack();
      await wait(2000);
    } else {
      log('  [INFO] Select Unit button not visible (campaign may be inactive/closed)');
    }
  } catch (e) { log(`  [WARN] Select Unit: ${e.message}`); }

  // try Floor & Unit Plan link
  try {
    const floorLink = page.locator('text=/floor.*unit plan/i').first();
    const visible = await floorLink.isVisible().catch(() => false);
    if (visible) {
      await floorLink.click();
      await wait(2000);
      await shot(page, dir, 'allocation-floor-plan.png');
      await page.goBack();
      await wait(2000);
    }
  } catch (e) { log(`  [WARN] Floor plan link: ${e.message}`); }

  return dom;
}

async function captureHomeLoan(page, saved) {
  log('\n--- HOME LOAN ---');
  const dir = path.join(VM, 'home-loan');
  await navigateWithAuth(page, `${BASE}/homeloan`, saved);

  const dom = await inspect(page);
  log(`  URL: ${dom.url}`);
  log(`  Headings: ${JSON.stringify(dom.headings)}`);
  log(`  Buttons: ${JSON.stringify(dom.buttons)}`);

  await shot(page, dir, 'homeloan-landing-current.png');
  await shotFull(page, dir, 'homeloan-landing-full.png');

  // click "I want to apply for a new loan"
  try {
    const newLoanCard = page.locator('text=/i want to apply for a new loan/i').first();
    const visible = await newLoanCard.isVisible().catch(() => false);
    if (visible) {
      log('  [INFO] New loan card found — clicking...');
      await newLoanCard.click();
      await wait(3000);
      const newLoanDom = await inspect(page);
      log(`  [NEW-LOAN] Headings: ${JSON.stringify(newLoanDom.headings)}`);
      log(`  [NEW-LOAN] Inputs: ${JSON.stringify(newLoanDom.inputs)}`);
      await shot(page, dir, 'homeloan-new-loan-form.png');
      await shotFull(page, dir, 'homeloan-new-loan-full.png');

      // try clicking Salaried option
      try {
        const salaried = page.locator('text=/salaried/i').first();
        const sv = await salaried.isVisible().catch(() => false);
        if (sv) {
          await salaried.click();
          await wait(2000);
          await shot(page, dir, 'homeloan-salaried-form.png');
          await shotFull(page, dir, 'homeloan-salaried-full.png');
        }
      } catch (e) { log(`  [WARN] Salaried: ${e.message}`); }

      // try self-employed
      try {
        const selfEmp = page.locator('text=/self.employed/i').first();
        const sv = await selfEmp.isVisible().catch(() => false);
        if (sv) {
          await selfEmp.click();
          await wait(2000);
          await shot(page, dir, 'homeloan-selfemployed-form.png');
        }
      } catch (e) { log(`  [WARN] Self-employed: ${e.message}`); }

      // go back to landing
      await navigateWithAuth(page, `${BASE}/homeloan`, saved);
      await wait(2000);
    }
  } catch (e) { log(`  [WARN] New loan card: ${e.message}`); }

  // click "I have a pre-approved loan"
  try {
    const preApproved = page.locator('text=/i have a pre.approved loan/i').first();
    const visible = await preApproved.isVisible().catch(() => false);
    if (visible) {
      log('  [INFO] Pre-approved loan card found — clicking...');
      await preApproved.click();
      await wait(3000);
      const paDom = await inspect(page);
      log(`  [PRE-APPROVED] Headings: ${JSON.stringify(paDom.headings)}`);
      log(`  [PRE-APPROVED] Inputs: ${JSON.stringify(paDom.inputs)}`);
      await shot(page, dir, 'homeloan-preapproved-form.png');
      await shotFull(page, dir, 'homeloan-preapproved-full.png');
    }
  } catch (e) { log(`  [WARN] Pre-approved card: ${e.message}`); }

  return dom;
}

async function captureCallbackRequest(page, saved) {
  log('\n--- CALLBACK REQUEST ---');
  const dir = path.join(VM, 'callback-request');

  // try direct URL first
  await navigateWithAuth(page, `${BASE}/call-feedback`, saved);

  const dom = await inspect(page);
  log(`  URL: ${dom.url}`);
  log(`  Headings: ${JSON.stringify(dom.headings)}`);
  log(`  Buttons: ${JSON.stringify(dom.buttons)}`);

  if (!dom.url.includes('call-feedback')) {
    log('  [INFO] Direct URL failed — trying via Home Dashboard "Call Scheduled" button...');
    await navigateWithAuth(page, `${BASE}/home`, saved);
    await wait(2000);

    try {
      const callBtn = page.locator('text=/call scheduled/i').first();
      const visible = await callBtn.isVisible().catch(() => false);
      if (visible) {
        await callBtn.click();
        await wait(3000);
        const dom2 = await inspect(page);
        log(`  [CALLBACK-VIA-BTN] URL: ${dom2.url}`);
        log(`  [CALLBACK-VIA-BTN] Headings: ${JSON.stringify(dom2.headings)}`);
        await shot(page, dir, 'callback-form-loaded.png');
        await shotFull(page, dir, 'callback-form-full.png');
        await page.evaluate(() => window.scrollTo(0, 400));
        await wait(800);
        await shot(page, dir, 'callback-form-scrolled.png');
        return dom2;
      } else {
        log('  [INFO] "Call Scheduled" button not visible on home dashboard');
        await shot(page, dir, 'callback-no-access.png');
      }
    } catch (e) { log(`  [WARN] Call Scheduled button: ${e.message}`); }
  } else {
    await shot(page, dir, 'callback-form-loaded.png');
    await shotFull(page, dir, 'callback-form-full.png');
    await page.evaluate(() => window.scrollTo(0, 400));
    await wait(800);
    await shot(page, dir, 'callback-form-scrolled.png');
  }

  return dom;
}

// ============================================================
// MAIN
// ============================================================

(async () => {
  const results = {};
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: VW });
  const page    = await context.newPage();

  try {
    // LOGIN
    const loginOk = await login(page);
    if (!loginOk) {
      log('LOGIN FAILED — exiting');
      await browser.close();
      process.exit(1);
    }

    await wait(2000);

    // SAVE SESSION immediately after login
    const savedSession = await getSession(page);
    const tokenPresent = !!savedSession['xr_auth_token'];
    log(`[SESSION SAVED] token present: ${tokenPresent}, keys: ${Object.keys(savedSession).join(', ')}`);

    if (!tokenPresent) {
      log('[ERROR] No auth token in sessionStorage after login — cannot proceed');
      await browser.close();
      process.exit(1);
    }

    // CAPTURE MODULES
    results.homeDash    = await captureHomeDashboard(page, savedSession);
    results.supportTix  = await captureSupportTickets(page, savedSession);
    results.allocation  = await captureAllocation(page, savedSession);
    results.homeLoan    = await captureHomeLoan(page, savedSession);
    results.callback    = await captureCallbackRequest(page, savedSession);

    // WRITE RESULTS
    const outFile = path.join(__dirname, '_capture-buyer-5modules-results.json');
    fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
    log(`\n[DONE] Results written to ${outFile}`);

  } catch (e) {
    log(`[FATAL] ${e.message}`);
    console.error(e);
  } finally {
    await wait(3000);
    await browser.close();
  }
})();
