/**
 * Unified Buyer Portal Visual Capture — 7 modules
 *
 * CRITICAL DESIGN: Buyer portal stores JWT in sessionStorage["xr_auth_token"]
 * — NOT cookies/localStorage. So we MUST:
 *   1. Login once via OTP in a single browser context
 *   2. Keep the SAME context/page alive across ALL authenticated module navigations
 *   3. Never open a new context — sessionStorage would be gone
 *
 * Modules (priority order):
 *   1. unit-details      (WINNER URL fix)
 *   2. kyc               (pending KYC now visible)
 *   3. callback-request  (auth now working)
 *   4. allocation-experience (active campaign)
 *   5. home-loan         (sub-flows)
 *   6. support-tickets   (gap fills)
 *   7. home-dashboard    (gap fills)
 *
 * Run:  cd "D:/AI_Automation/xanadu - AI automation" && node scripts/capture-buyer-full-7modules.js
 */
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT      = path.join(__dirname, '..');
const VM_BUYER  = path.join(ROOT, 'visual-memory', 'buyer');
const VW        = { width: 1920, height: 900 };
const URL_BASE  = 'https://uat.xrportal.in';
const MOB       = '8888888888';
const OTPS      = ['258369', '147258'];

// ---- utility helpers ---------------------------------------------------
const log = (m) => { console.log(`[${new Date().toISOString().substring(11,19)}] ${m}`); };
const ensureDir = (d) => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); };
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function shot(page, moduleDir, filename) {
  ensureDir(moduleDir);
  const full = path.join(moduleDir, filename);
  await page.screenshot({ path: full, fullPage: false });
  log(`  SHOT: ${path.relative(ROOT, full)}`);
}
async function shotFull(page, moduleDir, filename) {
  ensureDir(moduleDir);
  const full = path.join(moduleDir, filename);
  await page.screenshot({ path: full, fullPage: true });
  log(`  SHOT (full): ${path.relative(ROOT, full)}`);
}

async function inspect(page) {
  return page.evaluate(() => {
    const trim = (s, n=120) => (s || '').trim().substring(0, n);
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .map(h => `${h.tagName.toLowerCase()}: "${trim(h.innerText)}"`)
      .filter(t => t.length < 160).slice(0, 14);
    const buttons = [...document.querySelectorAll('button:not([disabled])')]
      .map(b => { const t = trim(b.innerText, 60); return t ? `"${t}" (${trim(b.className, 60)})` : null; })
      .filter(Boolean).slice(0, 25);
    const inputs = [...document.querySelectorAll('input, textarea, select')]
      .map(i => {
        if (i.tagName === 'SELECT') return `select[${trim(i.name||'',20)}] options=${[...i.options].map(o=>o.text).join('|').substring(0,80)}`;
        return `${i.tagName.toLowerCase()}[type="${i.type}"][placeholder="${i.getAttribute('placeholder')||''}"][name="${i.getAttribute('name')||''}"]`;
      }).slice(0, 20);
    const radios = [...document.querySelectorAll('.ant-radio-button-wrapper, input[type="radio"]')]
      .map(r => trim(r.innerText || r.value, 40)).filter(Boolean).slice(0, 10);
    const selects = [...document.querySelectorAll('.ant-select')].map(s => trim(s.innerText, 60)).slice(0, 10);
    const uploads = [...document.querySelectorAll('.ant-upload, [class*="upload"]')]
      .map(u => trim(u.innerText, 60)).filter(Boolean).slice(0, 10);
    const links = [...document.querySelectorAll('a')].map(a => `"${trim(a.innerText,40)}"->${a.getAttribute('href')||''}`).filter(x => x.length < 120).slice(0, 25);
    const bodyText = trim(document.body.innerText, 800);
    return { url: location.href, headings, buttons, inputs, radios, selects, uploads, links, bodyText };
  });
}

async function logSession(page, label) {
  const sess = await page.evaluate(() => {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) keys.push(sessionStorage.key(i));
    return { keys, hasToken: !!sessionStorage.getItem('xr_auth_token') };
  }).catch(() => ({ keys: [], hasToken: false }));
  log(`  [session ${label}] keys=${JSON.stringify(sess.keys)} hasToken=${sess.hasToken}`);
}

// ---- LOGIN -------------------------------------------------------------
async function loginViaOtp(page) {
  log(`Navigating to ${URL_BASE}/`);
  await page.goto(`${URL_BASE}/`, { waitUntil: 'domcontentloaded' });
  await wait(3000);

  for (const otp of OTPS) {
    log(`--- Trying OTP ${otp} ---`);
    try {
      const mob = page.locator('input[type="tel"], input[placeholder*="Mobile" i], input[placeholder*="mobile" i]').first();
      if (!(await mob.isVisible().catch(() => false))) {
        // already past login?
        if (!page.url().endsWith('/') || /\/home/.test(page.url())) return true;
      } else {
        await mob.fill(MOB);
        log(`  Filled mobile: ${MOB}`);
        const sendBtn = page.locator('button').filter({ hasText: /send otp/i }).first();
        await sendBtn.click();
        log('  Clicked Send OTP');
      }

      // wait for otp boxes
      await page.waitForSelector('input[type="text"][maxlength="1"], input[autocomplete="one-time-code"], input[aria-label*="otp" i]', { timeout: 15000 });
      await wait(800);

      const boxes = page.locator('input[type="text"][maxlength="1"], input[autocomplete="one-time-code"], input[aria-label*="otp" i]');
      const n = await boxes.count();
      log(`  OTP boxes: ${n}`);
      const digits = otp.split('');
      for (let i = 0; i < Math.min(n, digits.length); i++) {
        await boxes.nth(i).fill(digits[i]);
        await wait(80);
      }
      log(`  Filled OTP ${otp}`);

      const verify = page.locator('button').filter({ hasText: /verify|login|submit/i }).first();
      if (await verify.isVisible().catch(() => false)) {
        await verify.click();
        log('  Clicked Verify');
      }
      await wait(7000);

      const u = page.url();
      log(`  URL after verify: ${u}`);
      // success heuristic — sessionStorage has token, or URL changed
      const tok = await page.evaluate(() => sessionStorage.getItem('xr_auth_token')).catch(() => null);
      if (tok || /\/home|\/alloted|\/registrations/.test(u)) {
        log(`  LOGIN SUCCESS (tokenPresent=${!!tok})`);
        return true;
      }
      log('  Login attempt failed; retrying...');
      // back to login state
      await page.goto(`${URL_BASE}/`, { waitUntil: 'domcontentloaded' });
      await wait(3000);
    } catch (e) {
      log(`  ERR during OTP attempt: ${e.message}`);
    }
  }
  return false;
}

// ---- MODULE CAPTURES ---------------------------------------------------
async function captureHomeDashboard(page) {
  log('\n=== MODULE 7: home-dashboard (gap fills) ===');
  const dir = path.join(VM_BUYER, 'home-dashboard');
  await page.goto(`${URL_BASE}/home`, { waitUntil: 'networkidle' }).catch(()=>{});
  await wait(4000);
  await logSession(page, 'home-dashboard');
  const dom = await inspect(page);
  log(`  URL: ${dom.url}`);
  log(`  Headings: ${JSON.stringify(dom.headings)}`);
  log(`  Buttons: ${JSON.stringify(dom.buttons.slice(0,12))}`);
  await shot(page, dir, 'home-dashboard-winner-state.png');
  await shotFull(page, dir, 'home-dashboard-winner-full.png');

  // Capture per-status badges/cards via inspection
  const statusBadges = await page.evaluate(() => {
    const badges = [...document.querySelectorAll('[class*="status"], [class*="badge"], .ant-tag, [class*="winner" i], [class*="allotted" i], [class*="booked" i], [class*="waitlist" i]')]
      .map(el => ({ text: el.innerText?.trim()?.substring(0, 60), cls: el.className?.substring(0, 80) }))
      .filter(b => b.text && b.text.length < 80).slice(0, 30);
    return badges;
  });
  log(`  Status-like elements found: ${JSON.stringify(statusBadges.slice(0,15))}`);

  // Try scrolling to capture all cards
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(400);
  await shot(page, dir, 'home-dashboard-top-cards.png');
  await page.evaluate(() => window.scrollTo(0, 400));
  await wait(400);
  await shot(page, dir, 'home-dashboard-mid-cards.png');
  await page.evaluate(() => window.scrollTo(0, 800));
  await wait(400);
  await shot(page, dir, 'home-dashboard-bottom-cards.png');
  await page.evaluate(() => window.scrollTo(0, 0));

  // Try clicking "Complete KYC" button if visible to capture state
  const kycBtn = page.locator('button').filter({ hasText: /complete kyc/i }).first();
  if (await kycBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    log('  "Complete KYC" button visible — capturing hover state');
    await kycBtn.scrollIntoViewIfNeeded();
    await wait(400);
    await shot(page, dir, 'home-dashboard-complete-kyc-button.png');
  }

  // Pay button
  const payBtn = page.locator('button, a').filter({ hasText: /^pay\b|pay now|pay >/i }).first();
  if (await payBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await payBtn.scrollIntoViewIfNeeded();
    await wait(400);
    await shot(page, dir, 'home-dashboard-pay-button.png');
  }
  return { dom, statusBadges };
}

async function captureSupportTickets(page) {
  log('\n=== MODULE 6: support-tickets (gap fills) ===');
  const dir = path.join(VM_BUYER, 'support-tickets');
  await page.goto(`${URL_BASE}/support-tickets`, { waitUntil: 'networkidle' }).catch(()=>{});
  await wait(4000);
  const dom = await inspect(page);
  log(`  URL: ${dom.url}`);
  log(`  Headings: ${JSON.stringify(dom.headings)}`);
  await shot(page, dir, 'support-list-current.png');
  await shotFull(page, dir, 'support-list-current-full.png');

  // Click "Select Category" dropdown if present
  const selectCat = page.locator('.ant-select').filter({ hasText: /select category|category/i }).first();
  if (await selectCat.isVisible({ timeout: 2000 }).catch(() => false)) {
    await selectCat.click();
    await wait(900);
    await shot(page, dir, 'support-category-dropdown-open.png');
    const opts = await page.evaluate(() => [...document.querySelectorAll('.ant-select-item-option')].map(o => o.innerText.trim()));
    log(`  Category options: ${JSON.stringify(opts)}`);
    // close
    await page.keyboard.press('Escape').catch(()=>{});
    await wait(400);
  } else {
    log('  Select Category dropdown not found (.ant-select)');
  }

  // Try to navigate to create ticket
  const createNav = page.locator('a, button, [class*="nav"]').filter({ hasText: /create ticket/i }).first();
  if (await createNav.isVisible({ timeout: 2000 }).catch(() => false)) {
    await createNav.click();
    await wait(3000);
    log(`  After Create Ticket click URL: ${page.url()}`);
    await shot(page, dir, 'support-create-ticket-form.png');
    await shotFull(page, dir, 'support-create-ticket-form-full.png');
    const createDom = await inspect(page);
    log(`  Create form Headings: ${JSON.stringify(createDom.headings)}`);
    log(`  Create form Inputs: ${JSON.stringify(createDom.inputs)}`);
    log(`  Create form Selects: ${JSON.stringify(createDom.selects)}`);
    // open category in create
    const sel = page.locator('.ant-select').first();
    if (await sel.isVisible({ timeout: 1500 }).catch(()=>false)) {
      await sel.click(); await wait(800);
      await shot(page, dir, 'support-create-category-open.png');
      const opts2 = await page.evaluate(() => [...document.querySelectorAll('.ant-select-item-option')].map(o => o.innerText.trim()));
      log(`  Create category options: ${JSON.stringify(opts2)}`);
      // try CANCELLATION
      const cancellation = page.locator('.ant-select-item-option').filter({ hasText: /cancel/i }).first();
      if (await cancellation.isVisible({ timeout: 1500 }).catch(()=>false)) {
        await cancellation.click();
        await wait(1500);
        await shot(page, dir, 'support-create-cancellation-selected.png');
        await shotFull(page, dir, 'support-create-cancellation-full.png');
      } else {
        await page.keyboard.press('Escape').catch(()=>{});
      }
    }
    // navigate back
    await page.goto(`${URL_BASE}/support-tickets`, { waitUntil: 'networkidle' }).catch(()=>{});
    await wait(3000);
  } else {
    log('  Create Ticket nav not visible from list');
  }

  // Try clicking first ticket row if any
  const firstRow = page.locator('tbody tr').first();
  if (await firstRow.isVisible({ timeout: 2000 }).catch(()=>false)) {
    await firstRow.click();
    await wait(3000);
    log(`  After ticket row click URL: ${page.url()}`);
    await shot(page, dir, 'support-ticket-detail.png');
    await shotFull(page, dir, 'support-ticket-detail-full.png');
  }

  return { dom };
}

async function captureAllocation(page) {
  log('\n=== MODULE 4: allocation-experience (WINNER + campaign) ===');
  const dir = path.join(VM_BUYER, 'allocation-experience');
  await page.goto(`${URL_BASE}/alloted`, { waitUntil: 'networkidle' }).catch(()=>{});
  await wait(5000);
  const dom = await inspect(page);
  log(`  URL: ${dom.url}`);
  log(`  Headings: ${JSON.stringify(dom.headings)}`);
  log(`  Buttons (first 15): ${JSON.stringify(dom.buttons.slice(0,15))}`);
  await shot(page, dir, 'allocation-winner-landing.png');
  await shotFull(page, dir, 'allocation-winner-landing-full.png');

  // Try clicking Select Unit
  const selectUnit = page.locator('button.btn-book-solid, button').filter({ hasText: /select unit/i }).first();
  if (await selectUnit.isVisible({ timeout: 3000 }).catch(()=>false)) {
    log('  "Select Unit" button visible — clicking');
    await selectUnit.scrollIntoViewIfNeeded();
    await shot(page, dir, 'allocation-select-unit-button.png');
    await selectUnit.click();
    await wait(5000);
    log(`  After Select Unit URL: ${page.url()}`);
    await shot(page, dir, 'allocation-unit-selection-grid.png');
    await shotFull(page, dir, 'allocation-unit-selection-grid-full.png');
    const gridDom = await inspect(page);
    log(`  Grid Headings: ${JSON.stringify(gridDom.headings)}`);
    log(`  Grid Buttons: ${JSON.stringify(gridDom.buttons.slice(0,15))}`);

    // Look for towers/floors/units
    const grid = await page.evaluate(() => {
      const towers = [...document.querySelectorAll('[class*="tower" i], [class*="block" i]')].map(t => t.innerText?.trim()?.substring(0,40)).filter(Boolean).slice(0,15);
      const floors = [...document.querySelectorAll('[class*="floor" i]')].map(f => f.innerText?.trim()?.substring(0,30)).filter(Boolean).slice(0,15);
      const units  = [...document.querySelectorAll('[class*="unit" i]:not([class*="select-unit-box"])')].map(u => u.innerText?.trim()?.substring(0,30)).filter(Boolean).slice(0,15);
      const legend = [...document.querySelectorAll('[class*="legend" i], [class*="color" i]')].map(l => l.innerText?.trim()?.substring(0,40)).filter(Boolean).slice(0,10);
      return { towers, floors, units, legend };
    });
    log(`  Grid layout: ${JSON.stringify(grid)}`);

    // try selecting first available unit
    const firstUnit = page.locator('[class*="available"], [class*="unit"][class*="active"], button[class*="unit"]').first();
    if (await firstUnit.isVisible({ timeout: 1500 }).catch(()=>false)) {
      await firstUnit.click().catch(()=>{});
      await wait(2000);
      await shot(page, dir, 'allocation-unit-selected.png');
      await shotFull(page, dir, 'allocation-unit-selected-full.png');
    }

    // navigate back
    await page.goto(`${URL_BASE}/alloted`, { waitUntil: 'networkidle' }).catch(()=>{});
    await wait(3000);
  } else {
    log('  "Select Unit" not visible — capturing alternate states');
  }

  // Floor & Unit Plan link
  for (const linkText of ['Floor & Unit Plan', 'Cost Sheet', 'Payment Schedule', 'Pay Now']) {
    const lk = page.locator('a, button').filter({ hasText: new RegExp(linkText, 'i') }).first();
    if (await lk.isVisible({ timeout: 1500 }).catch(()=>false)) {
      log(`  Found link: ${linkText}`);
      await lk.scrollIntoViewIfNeeded();
      await wait(300);
      const safeName = linkText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await shot(page, dir, `allocation-link-${safeName}-hover.png`);
      // attempt click — open in same context
      const before = page.url();
      await lk.click({ timeout: 5000 }).catch(() => log(`  click failed for ${linkText}`));
      await wait(4000);
      const after = page.url();
      log(`  ${linkText}: ${before} -> ${after}`);
      await shot(page, dir, `allocation-link-${safeName}-destination.png`);
      await shotFull(page, dir, `allocation-link-${safeName}-destination-full.png`);
      // back
      await page.goto(`${URL_BASE}/alloted`, { waitUntil: 'networkidle' }).catch(()=>{});
      await wait(3000);
    } else {
      log(`  Link not visible: ${linkText}`);
    }
  }

  return { dom };
}

async function captureHomeLoan(page) {
  log('\n=== MODULE 5: home-loan (sub-flows) ===');
  const dir = path.join(VM_BUYER, 'home-loan');
  await page.goto(`${URL_BASE}/homeloan`, { waitUntil: 'networkidle' }).catch(()=>{});
  await wait(4000);
  const dom = await inspect(page);
  log(`  URL: ${dom.url}`);
  log(`  Headings: ${JSON.stringify(dom.headings)}`);
  log(`  Buttons: ${JSON.stringify(dom.buttons.slice(0,12))}`);
  await shot(page, dir, 'homeloan-landing-current.png');

  // Click new-loan card
  const newLoanCard = page.locator('[class*="card"], h6, div').filter({ hasText: /apply for a new loan/i }).first();
  if (await newLoanCard.isVisible({ timeout: 3000 }).catch(()=>false)) {
    log('  Clicking "I want to apply for a new loan"');
    await newLoanCard.click().catch(()=>{});
    await wait(4000);
    log(`  After new-loan click URL: ${page.url()}`);
    await shot(page, dir, 'homeloan-new-loan-form.png');
    await shotFull(page, dir, 'homeloan-new-loan-form-full.png');
    const nl = await inspect(page);
    log(`  New loan Headings: ${JSON.stringify(nl.headings)}`);
    log(`  New loan Inputs: ${JSON.stringify(nl.inputs)}`);
    log(`  New loan Radios: ${JSON.stringify(nl.radios)}`);
    log(`  New loan Selects: ${JSON.stringify(nl.selects)}`);

    // Try selecting Salaried
    const salaried = page.locator('.ant-radio-button-wrapper, label, input[type="radio"]').filter({ hasText: /salaried/i }).first();
    if (await salaried.isVisible({ timeout: 1500 }).catch(()=>false)) {
      await salaried.click().catch(()=>{});
      await wait(1500);
      await shot(page, dir, 'homeloan-salaried-form.png');
      await shotFull(page, dir, 'homeloan-salaried-form-full.png');
    }
    // Try Self-Employed
    const selfEmp = page.locator('.ant-radio-button-wrapper, label, input[type="radio"]').filter({ hasText: /self.?employed/i }).first();
    if (await selfEmp.isVisible({ timeout: 1500 }).catch(()=>false)) {
      await selfEmp.click().catch(()=>{});
      await wait(1500);
      await shot(page, dir, 'homeloan-self-employed-form.png');
      await shotFull(page, dir, 'homeloan-self-employed-form-full.png');
    }
    // back to landing
    await page.goto(`${URL_BASE}/homeloan`, { waitUntil: 'networkidle' }).catch(()=>{});
    await wait(3000);
  } else {
    log('  "Apply for new loan" card not found');
  }

  // Pre-approved card
  const preApproved = page.locator('[class*="card"], h6, div').filter({ hasText: /pre.?approved/i }).first();
  if (await preApproved.isVisible({ timeout: 3000 }).catch(()=>false)) {
    log('  Clicking "I have a pre-approved loan"');
    await preApproved.click().catch(()=>{});
    await wait(4000);
    log(`  After pre-approved click URL: ${page.url()}`);
    await shot(page, dir, 'homeloan-preapproved-upload.png');
    await shotFull(page, dir, 'homeloan-preapproved-upload-full.png');
    const pa = await inspect(page);
    log(`  Pre-approved Headings: ${JSON.stringify(pa.headings)}`);
    log(`  Pre-approved Inputs: ${JSON.stringify(pa.inputs)}`);
    log(`  Pre-approved Uploads: ${JSON.stringify(pa.uploads)}`);
    await page.goto(`${URL_BASE}/homeloan`, { waitUntil: 'networkidle' }).catch(()=>{});
    await wait(3000);
  } else {
    log('  Pre-approved card not found');
  }

  return { dom };
}

async function captureUnitDetails(page) {
  log('\n=== MODULE 1: unit-details (WINNER URL fix) ===');
  const dir = path.join(VM_BUYER, 'unit-details');
  const urlsToTry = [
    `${URL_BASE}/allotted-units`,
    `${URL_BASE}/allotted-unit`,
    `${URL_BASE}/unit-details`,
    `${URL_BASE}/my-unit`,
    `${URL_BASE}/unit`,
  ];

  let working = null;
  for (const u of urlsToTry) {
    log(`  Trying URL: ${u}`);
    await page.goto(u, { waitUntil: 'networkidle' }).catch(()=>{});
    await wait(3500);
    const actual = page.url();
    const is404 = await page.locator('h1').filter({ hasText: /^404$/ }).isVisible({ timeout: 800 }).catch(()=>false);
    log(`    actual=${actual} is404=${is404}`);
    if (!is404 && actual !== `${URL_BASE}/`) {
      working = u;
      log(`    GOT CONTENT at ${u}`);
      break;
    }
  }

  if (!working) {
    // Try navigation via Home Dashboard "Download your Unit Details"
    log('  Direct URLs failed — trying via Home Dashboard "Download your Unit Details"');
    await page.goto(`${URL_BASE}/home`, { waitUntil: 'networkidle' }).catch(()=>{});
    await wait(4000);
    const dlBtn = page.locator('button, a').filter({ hasText: /download your unit details/i }).first();
    if (await dlBtn.isVisible({ timeout: 3000 }).catch(()=>false)) {
      log('  Found "Download your Unit Details" button — clicking');
      const before = page.url();
      await dlBtn.click().catch(()=>{});
      await wait(5000);
      const after = page.url();
      log(`  ${before} -> ${after}`);
      if (after !== before && !after.endsWith('/')) {
        working = after;
        log(`  Navigated to ${after}`);
      }
    } else {
      log('  Button not found on home dashboard');
    }
  }

  if (working) {
    await shot(page, dir, 'unit-details-loaded-WINNER.png');
    await shotFull(page, dir, 'unit-details-WINNER-full.png');
    const dom = await inspect(page);
    log(`  URL: ${dom.url}`);
    log(`  Headings: ${JSON.stringify(dom.headings)}`);
    log(`  Buttons: ${JSON.stringify(dom.buttons.slice(0,15))}`);
    log(`  Links: ${JSON.stringify(dom.links.slice(0,10))}`);
    // scroll to capture sections
    for (let y = 400; y <= 2000; y += 400) {
      await page.evaluate(s => window.scrollTo(0, s), y);
      await wait(500);
    }
    await shot(page, dir, 'unit-details-scrolled.png');
    await page.evaluate(() => window.scrollTo(0, 0));
    // tabs
    const tabs = await page.evaluate(() => [...document.querySelectorAll('.ant-tabs-tab, [role="tab"], .ant-steps-item')].map(t => t.innerText.trim()).slice(0,12));
    log(`  Tabs/Steps: ${JSON.stringify(tabs)}`);
    return { dom, foundUrl: working };
  } else {
    log('  ALL URL ATTEMPTS FAILED — capturing 404');
    await shot(page, dir, 'unit-details-still-404.png');
    return { dom: null, foundUrl: null };
  }
}

async function captureCallback(page) {
  log('\n=== MODULE 3: callback-request (auth working) ===');
  const dir = path.join(VM_BUYER, 'callback-request');
  await page.goto(`${URL_BASE}/call-feedback`, { waitUntil: 'networkidle' }).catch(()=>{});
  await wait(4500);
  const dom = await inspect(page);
  log(`  URL: ${dom.url}`);
  log(`  Headings: ${JSON.stringify(dom.headings)}`);
  log(`  Buttons: ${JSON.stringify(dom.buttons.slice(0,15))}`);
  log(`  Inputs: ${JSON.stringify(dom.inputs)}`);
  log(`  Selects: ${JSON.stringify(dom.selects)}`);
  log(`  Radios: ${JSON.stringify(dom.radios)}`);
  log(`  Body (300): ${dom.bodyText.substring(0,300)}`);

  await shot(page, dir, 'callback-form-loaded.png');
  await shotFull(page, dir, 'callback-form-full.png');

  for (let y = 300; y <= 1200; y += 300) {
    await page.evaluate(s => window.scrollTo(0, s), y);
    await wait(400);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, dir, 'callback-form-scrolled.png');

  // Try via Home Dashboard "Call Scheduled" button
  await page.goto(`${URL_BASE}/home`, { waitUntil: 'networkidle' }).catch(()=>{});
  await wait(3500);
  const callBtn = page.locator('button').filter({ hasText: /call scheduled/i }).first();
  if (await callBtn.isVisible({ timeout: 2500 }).catch(()=>false)) {
    log('  Found "Call Scheduled" button — clicking');
    const before = page.url();
    await callBtn.click().catch(()=>{});
    await wait(4500);
    log(`  ${before} -> ${page.url()}`);
    await shot(page, dir, 'callback-via-home-button.png');
    await shotFull(page, dir, 'callback-via-home-button-full.png');
  }
  return { dom };
}

async function captureKyc(page) {
  log('\n=== MODULE 2: kyc (pending KYC available) ===');
  const dir = path.join(VM_BUYER, 'kyc');

  // Try direct first
  await page.goto(`${URL_BASE}/kyc`, { waitUntil: 'networkidle' }).catch(()=>{});
  await wait(5000);
  let dom = await inspect(page);
  log(`  Direct /kyc URL: ${dom.url}`);
  log(`  Headings: ${JSON.stringify(dom.headings)}`);
  log(`  Inputs: ${JSON.stringify(dom.inputs)}`);
  log(`  Body (300): ${dom.bodyText.substring(0,300)}`);

  const hasContent = (dom.headings.length > 1) || (dom.inputs.length > 0) || /pan|aadhaar|kyc/i.test(dom.bodyText);
  await shot(page, dir, 'kyc-direct-load.png');
  await shotFull(page, dir, 'kyc-direct-full.png');

  // If empty, try via Home Dashboard "Complete KYC" button
  if (!hasContent) {
    log('  Direct /kyc empty — trying via Home Dashboard "Complete KYC"');
    await page.goto(`${URL_BASE}/home`, { waitUntil: 'networkidle' }).catch(()=>{});
    await wait(4000);
    const kycBtn = page.locator('button').filter({ hasText: /complete kyc/i }).first();
    if (await kycBtn.isVisible({ timeout: 2500 }).catch(()=>false)) {
      log('  Clicking "Complete KYC"');
      const before = page.url();
      await kycBtn.scrollIntoViewIfNeeded();
      await kycBtn.click().catch(()=>{});
      await wait(6000);
      log(`  ${before} -> ${page.url()}`);
      dom = await inspect(page);
      log(`  KYC via button Headings: ${JSON.stringify(dom.headings)}`);
      log(`  KYC via button Inputs: ${JSON.stringify(dom.inputs)}`);
      log(`  KYC via button Selects: ${JSON.stringify(dom.selects)}`);
      log(`  KYC via button Uploads: ${JSON.stringify(dom.uploads)}`);
      log(`  KYC via button Body (400): ${dom.bodyText.substring(0,400)}`);
      await shot(page, dir, 'kyc-form-via-button.png');
      await shotFull(page, dir, 'kyc-form-via-button-full.png');

      // scroll deep to capture all fields
      for (let y = 400; y <= 2000; y += 400) {
        await page.evaluate(s => window.scrollTo(0, s), y);
        await wait(500);
      }
      await shot(page, dir, 'kyc-form-scrolled.png');
      await page.evaluate(() => window.scrollTo(0, 0));

      // Detail enumeration
      const detail = await page.evaluate(() => {
        const labels = [...document.querySelectorAll('label, .ant-form-item-label')].map(l => l.innerText.trim()).filter(Boolean).slice(0, 30);
        const fields = [...document.querySelectorAll('input, textarea, select, .ant-select, .ant-upload, .ant-picker')].map(el => ({
          tag: el.tagName,
          type: el.getAttribute('type'),
          name: el.getAttribute('name'),
          id: el.id,
          placeholder: el.getAttribute('placeholder'),
          cls: (el.className || '').substring(0, 80),
        })).slice(0, 30);
        const tabs = [...document.querySelectorAll('.ant-tabs-tab, .ant-steps-item, [role="tab"]')].map(t => t.innerText.trim()).slice(0,12);
        return { labels, fields, tabs };
      });
      log(`  KYC labels: ${JSON.stringify(detail.labels)}`);
      log(`  KYC fields: ${JSON.stringify(detail.fields)}`);
      log(`  KYC tabs/steps: ${JSON.stringify(detail.tabs)}`);
    } else {
      log('  No "Complete KYC" button found on home');
    }
  }
  return { dom };
}

// ---- MAIN --------------------------------------------------------------
async function run() {
  log(`Visual Memory capture — Buyer Portal — 7 modules`);
  log(`Output base: ${path.relative(ROOT, VM_BUYER)}`);
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const ctx = await browser.newContext({ viewport: VW });
  const page = await ctx.newPage();

  // 1. Login once
  const ok = await loginViaOtp(page);
  await logSession(page, 'post-login');
  if (!ok) {
    log('LOGIN FAILED — cannot proceed with authenticated captures');
    await browser.close();
    process.exit(2);
  }

  const results = {};
  // Priority order
  try { results.unitDetails  = await captureUnitDetails(page); }  catch (e) { log(`unit-details ERR: ${e.message}`); }
  try { results.kyc          = await captureKyc(page); }          catch (e) { log(`kyc ERR: ${e.message}`); }
  try { results.callback     = await captureCallback(page); }     catch (e) { log(`callback ERR: ${e.message}`); }
  try { results.allocation   = await captureAllocation(page); }   catch (e) { log(`allocation ERR: ${e.message}`); }
  try { results.homeLoan     = await captureHomeLoan(page); }     catch (e) { log(`homeloan ERR: ${e.message}`); }
  try { results.supportTix   = await captureSupportTickets(page); } catch (e) { log(`support ERR: ${e.message}`); }
  try { results.homeDash     = await captureHomeDashboard(page); }  catch (e) { log(`home ERR: ${e.message}`); }

  fs.writeFileSync(
    path.join(ROOT, 'scripts', '_capture-buyer-7modules-results.json'),
    JSON.stringify(results, null, 2)
  );
  log('All capture phases complete — results written.');
  await browser.close();
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
