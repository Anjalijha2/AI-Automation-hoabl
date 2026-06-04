// Buyer Portal visual-capture v2 — single context, login once, sessionStorage persists
// Fixes auth issue: xr_auth_token lives in sessionStorage (not captured by storageState)
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VM   = path.join(ROOT, 'visual-memory', 'buyer');
const VW   = { width: 1920, height: 900 };
const URL_BASE = 'https://uat.xrportal.in';
const MOB  = '8888888888';
const OTP  = '147258';

const MODULES = [
  { key: 'registration-login',    url: `${URL_BASE}/`,                noAuth: true },
  { key: 'home-dashboard',        url: `${URL_BASE}/home` },
  { key: 'allocation-experience', url: `${URL_BASE}/alloted` },
  { key: 'callback-request',      url: `${URL_BASE}/call-feedback`,    noAuth: true },
  { key: 'home-loan',             url: `${URL_BASE}/homeloan` },
  { key: 'kyc',                   url: `${URL_BASE}/kyc` },
  { key: 'payment-schedule',      url: `${URL_BASE}/paymentschedule` },
  { key: 'project-information',   url: `${URL_BASE}/project` },
  { key: 'support-tickets',       url: `${URL_BASE}/support-tickets` },
  { key: 'unit-details',          url: `${URL_BASE}/allotted-unit` },  // try singular
  { key: 'work-progress',         url: `${URL_BASE}/work-progress` },
];

async function inspectPage(page) {
  return page.evaluate(() => {
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .map(h => `${h.tagName.toLowerCase()}: "${h.innerText.trim()}"`)
      .filter(t => t.length < 120).slice(0, 10);

    const buttons = [...document.querySelectorAll('button:not([disabled])')]
      .map(b => { const t = b.innerText.trim(); return t ? `"${t}" (${b.className.substring(0,70)})` : null; })
      .filter(Boolean).slice(0, 15);

    const inputs = [...document.querySelectorAll('input[placeholder], textarea[placeholder]')]
      .map(i => `${i.tagName.toLowerCase()}[placeholder="${i.getAttribute('placeholder')}"]`)
      .slice(0, 10);

    const tabs = [...document.querySelectorAll('.ant-tabs-tab, [role="tab"]')]
      .map(t => t.innerText.trim()).filter(Boolean).slice(0, 8);

    const cards = [...document.querySelectorAll('.ant-card-head-title, .card-title, [class*="card"] h3, [class*="card"] h4')]
      .map(c => c.innerText.trim()).filter(Boolean).slice(0, 8);

    const rows = document.querySelectorAll('tbody tr, .ant-list-item, [class*="list-row"]').length;
    const emptyText = document.querySelector('.ant-empty-description, [class*="empty"]')?.innerText?.trim() || '';

    const navItems = [...document.querySelectorAll('nav a, .ant-menu-item, [class*="sidebar"] a, [class*="nav-item"]')]
      .map(a => a.innerText.trim()).filter(Boolean).slice(0, 12);

    const columns = [...document.querySelectorAll('th, .ant-table-column-title')]
      .map(th => th.innerText.trim()).filter(Boolean).slice(0, 15);

    const bodyText = document.body.innerText.substring(0, 400);
    const pageTitle = document.title;

    return { headings, buttons, inputs, tabs, cards, rows, emptyText, navItems, columns, bodyText, pageTitle };
  });
}

async function doLogin(page, log) {
  const note = m => { console.log(`[auth] ${m}`); log.push(`[auth] ${m}`); };
  note(`Navigating to login: ${URL_BASE}/`);
  await page.goto(`${URL_BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const mobileInput = page.locator('input[placeholder*="Mobile" i], input[type="tel"]').first();
  await mobileInput.waitFor({ state: 'visible', timeout: 10000 });
  await mobileInput.fill(MOB);
  note('Filled mobile');

  const sendBtn = page.locator('button').filter({ hasText: /send otp/i }).first();
  await sendBtn.click();
  note('Clicked Send OTP');
  await page.waitForTimeout(4000);

  const otpBoxes = page.locator(
    'input[aria-label*="OTP" i], input[type="text"][maxlength="1"], input[autocomplete="one-time-code"]'
  );
  const otpCount = await otpBoxes.count();
  note(`OTP boxes: ${otpCount}`);
  if (otpCount === 0) { note('ERROR: No OTP boxes'); return false; }

  const digits = OTP.split('');
  for (let i = 0; i < Math.min(digits.length, otpCount); i++) {
    await otpBoxes.nth(i).fill(digits[i]);
    await page.waitForTimeout(80);
  }
  note(`Filled OTP: ${OTP}`);

  await page.waitForTimeout(1500);
  const verifyBtn = page.locator('button').filter({ hasText: /verify|login|submit|confirm/i }).first();
  if (await verifyBtn.isVisible().catch(() => false)) {
    await verifyBtn.click();
    note('Clicked Verify');
  }

  await page.waitForTimeout(6000);
  const afterUrl = page.url();
  note(`URL after verify: ${afterUrl}`);

  const success = !/uat\.xrportal\.in\/?$/.test(afterUrl) || afterUrl.includes('/home');
  note(`Login ${success ? 'SUCCESS' : 'FAILED'}`);

  if (success) {
    const storage = await page.evaluate(() => ({
      authToken: sessionStorage.getItem('xr_auth_token'),
      userJson: sessionStorage.getItem('xr_user'),
    }));
    note(`xr_auth_token: ${storage.authToken ? 'PRESENT (' + storage.authToken.substring(0, 40) + '...)' : 'MISSING'}`);
    note(`xr_user: ${storage.userJson ? 'PRESENT' : 'MISSING'}`);
  }
  return success;
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const allNotes = {};

  // --- Authenticated context (single, login once) ---
  const authCtx = await browser.newContext({ viewport: VW });
  const authPage = await authCtx.newPage();
  const authLog = [];
  const loginOk = await doLogin(authPage, authLog);
  if (!loginOk) {
    console.error('Login failed — cannot capture authenticated modules');
    await browser.close();
    process.exit(1);
  }

  for (const mod of MODULES) {
    const outDir = path.join(VM, mod.key);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const log = [...(mod.noAuth ? [] : authLog.filter(l => l.startsWith('[auth]')))];
    const note = m => { console.log(`[${mod.key}] ${m}`); log.push(m); };

    let page;
    if (mod.noAuth) {
      // Fresh unauthenticated context per noAuth module
      const noAuthCtx = await browser.newContext({ viewport: VW });
      page = await noAuthCtx.newPage();
      note(`Using unauthenticated context`);
    } else {
      page = authPage;
    }

    note(`Navigating to ${mod.url}`);
    await page.goto(mod.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    note(`URL after load: ${page.url()}`);

    // Check if redirected to login (auth failed)
    if (!mod.noAuth && /uat\.xrportal\.in\/?$/.test(page.url())) {
      note('WARN: Redirected to login — session may have expired');
    }

    // Main loaded screenshot
    await page.screenshot({ path: path.join(outDir, `${mod.key}-loaded.png`) });
    note(`CAPTURED: ${mod.key}-loaded.png`);

    // DOM inspection
    const dom = await inspectPage(page);
    note(`Headings: ${JSON.stringify(dom.headings)}`);
    note(`Buttons: ${JSON.stringify(dom.buttons)}`);
    note(`Inputs: ${JSON.stringify(dom.inputs)}`);
    note(`Tabs: ${JSON.stringify(dom.tabs)}`);
    note(`Cards: ${JSON.stringify(dom.cards)}`);
    note(`Nav items: ${JSON.stringify(dom.navItems)}`);
    note(`Columns: ${JSON.stringify(dom.columns)}`);
    note(`Rows: ${dom.rows}`);
    note(`Empty: "${dom.emptyText}"`);
    note(`Body text (300): ${dom.bodyText.substring(0, 300)}`);

    // === Module-specific captures ===

    if (mod.key === 'registration-login') {
      await page.screenshot({ path: path.join(outDir, 'login-page.png') });
      note('CAPTURED: login-page.png');
      await page.goto(`${URL_BASE}/register`, { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(outDir, 'register-page.png') });
      const regDom = await inspectPage(page);
      note(`Register page URL: ${page.url()}`);
      note(`Register headings: ${JSON.stringify(regDom.headings)}`);
      note(`Register inputs: ${JSON.stringify(regDom.inputs)}`);
      note(`Register buttons: ${JSON.stringify(regDom.buttons)}`);
      note(`Register body: ${regDom.bodyText.substring(0, 300)}`);
      note('CAPTURED: register-page.png');
    }

    if (mod.key === 'home-dashboard') {
      // Check nav sidebar
      const navItems = await page.evaluate(() =>
        [...document.querySelectorAll('nav a, .ant-menu-item, [class*="menu-item"], aside a')]
          .map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') || '' }))
          .filter(a => a.text).slice(0, 15)
      );
      note(`Nav links: ${JSON.stringify(navItems)}`);

      // Scroll to see full dashboard
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, 'home-dashboard-scrolled.png') });
      note('CAPTURED: home-dashboard-scrolled.png');
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    if (mod.key === 'allocation-experience') {
      // Scroll down to see allocation content
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, 'allocation-scrolled.png') });
      note('CAPTURED: allocation-scrolled.png');

      // Check for unit selection buttons
      const unitBtns = await page.evaluate(() =>
        [...document.querySelectorAll('button, .ant-btn, [class*="unit"], [class*="floor"]')]
          .map(b => ({ text: b.innerText.trim(), cls: b.className.substring(0,60) }))
          .filter(b => b.text).slice(0, 10)
      );
      note(`Unit/floor buttons: ${JSON.stringify(unitBtns)}`);
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    if (mod.key === 'kyc') {
      // Check KYC form fields
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, 'kyc-form.png') });
      note('CAPTURED: kyc-form.png');

      const kycFields = await page.evaluate(() =>
        [...document.querySelectorAll('input, select, .ant-select, textarea')]
          .map(el => ({ tag: el.tagName, placeholder: el.getAttribute('placeholder'), id: el.id, name: el.name }))
          .filter(el => el.placeholder || el.id || el.name)
          .slice(0, 12)
      );
      note(`KYC fields: ${JSON.stringify(kycFields)}`);

      // Upload buttons
      const uploadBtns = await page.evaluate(() =>
        [...document.querySelectorAll('[class*="upload"], button:has([class*="upload"]), .ant-upload')]
          .map(el => el.innerText.trim() || el.className.substring(0,50))
          .filter(Boolean).slice(0, 8)
      );
      note(`Upload areas: ${JSON.stringify(uploadBtns)}`);
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    if (mod.key === 'payment-schedule') {
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, 'payment-schedule-table.png') });
      note('CAPTURED: payment-schedule-table.png');

      const tableData = await page.evaluate(() => {
        const headers = [...document.querySelectorAll('th')].map(th => th.innerText.trim()).filter(Boolean);
        const rows = document.querySelectorAll('tbody tr').length;
        return { headers, rows };
      });
      note(`Table headers: ${JSON.stringify(tableData.headers)}`);
      note(`Table rows: ${tableData.rows}`);
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    if (mod.key === 'support-tickets') {
      // Try sub-pages
      await page.goto(`${URL_BASE}/support-tickets`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(outDir, 'support-list.png') });
      note(`CAPTURED: support-list.png (URL: ${page.url()})`);

      // Check for Create Ticket button
      const createBtn = page.locator('button').filter({ hasText: /create|new|raise|add/i }).first();
      if (await createBtn.isVisible().catch(() => false)) {
        await createBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(outDir, 'support-create.png') });
        const createDom = await inspectPage(page);
        note(`CAPTURED: support-create.png (URL: ${page.url()})`);
        note(`Create form inputs: ${JSON.stringify(createDom.inputs)}`);
        note(`Create form buttons: ${JSON.stringify(createDom.buttons)}`);
        // Go back
        await page.goto(`${URL_BASE}/support-tickets`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
      }

      // Click first ticket if any
      const firstTicket = page.locator('tr.ant-table-row, .ant-list-item, [class*="ticket"]').first();
      if (await firstTicket.count() > 0) {
        await firstTicket.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(outDir, 'support-detail.png') });
        note(`CAPTURED: support-detail.png (URL: ${page.url()})`);
        await page.goBack();
        await page.waitForTimeout(1500);
      }
    }

    if (mod.key === 'unit-details') {
      // Try different URL patterns
      const urlsToTry = [
        `${URL_BASE}/allotted-unit`,
        `${URL_BASE}/allotted-units`,
        `${URL_BASE}/unit-details`,
        `${URL_BASE}/my-unit`,
      ];
      for (const u of urlsToTry) {
        await page.goto(u, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        const h1 = await page.locator('h1').first().innerText().catch(() => '');
        note(`URL: ${page.url()} | h1: "${h1}"`);
        if (!h1.includes('404') && page.url() !== `${URL_BASE}/`) break;
      }
    }

    if (mod.key === 'work-progress') {
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, 'work-progress-scrolled.png') });
      note('CAPTURED: work-progress-scrolled.png');
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    if (mod.key === 'home-loan') {
      const homeLoanDom = await inspectPage(page);
      note(`Home Loan tabs: ${JSON.stringify(homeLoanDom.tabs)}`);
      note(`Home Loan inputs: ${JSON.stringify(homeLoanDom.inputs)}`);
    }

    if (mod.key === 'project-information') {
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, 'project-info-scrolled.png') });
      note('CAPTURED: project-info-scrolled.png');
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    // Full-page final
    await page.goto(mod.url, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outDir, `${mod.key}-full.png`) });
    note(`CAPTURED: ${mod.key}-full.png`);

    allNotes[mod.key] = { log };

    if (mod.noAuth) {
      await page.context().close();
    }
  }

  // Save notes
  fs.writeFileSync(
    path.join(VM, '_capture-notes-buyer-v2.json'),
    JSON.stringify(allNotes, null, 2)
  );

  await browser.close();
  console.log('\nDone — all 11 buyer modules captured (v2, single-context auth).');
}

run().catch(e => { console.error(e); process.exit(1); });
