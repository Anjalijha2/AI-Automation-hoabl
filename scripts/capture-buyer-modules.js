// Batch visual-capture for all 11 Buyer Portal modules
// Auth: buyer session. Captures loaded state + DOM structural notes per module.
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'buyer.json');
const VM   = path.join(ROOT, 'visual-memory', 'buyer');
const VW   = { width: 1920, height: 900 };

const MODULES = [
  { key: 'registration-login',   url: 'https://uat.xrportal.in/',              loginUrl: 'https://uat.xrportal.in/register', noAuth: true },
  { key: 'home-dashboard',       url: 'https://uat.xrportal.in/home' },
  { key: 'allocation-experience',url: 'https://uat.xrportal.in/alloted' },
  { key: 'callback-request',     url: 'https://uat.xrportal.in/call-feedback',  noAuth: true },
  { key: 'home-loan',            url: 'https://uat.xrportal.in/homeloan' },
  { key: 'kyc',                  url: 'https://uat.xrportal.in/kyc' },
  { key: 'payment-schedule',     url: 'https://uat.xrportal.in/paymentschedule' },
  { key: 'project-information',  url: 'https://uat.xrportal.in/project' },
  { key: 'support-tickets',      url: 'https://uat.xrportal.in/support-tickets' },
  { key: 'unit-details',         url: 'https://uat.xrportal.in/allotted-units' },
  { key: 'work-progress',        url: 'https://uat.xrportal.in/work-progress' },
];

async function inspectPage(page) {
  return page.evaluate(() => {
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .map(h => `${h.tagName.toLowerCase()}: "${h.innerText.trim()}"`)
      .filter(t => t.length < 120).slice(0, 10);

    const buttons = [...document.querySelectorAll('button:not([disabled])')]
      .map(b => { const t = b.innerText.trim(); return t ? `"${t}" (${b.className.substring(0,60)})` : null; })
      .filter(Boolean).slice(0, 12);

    const inputs = [...document.querySelectorAll('input[placeholder], textarea[placeholder]')]
      .map(i => `${i.tagName.toLowerCase()}[placeholder="${i.getAttribute('placeholder')}"]`)
      .slice(0, 8);

    const links = [...document.querySelectorAll('a[href]')]
      .map(a => `"${a.innerText.trim()}" → ${a.getAttribute('href')}`)
      .filter(t => t.length < 100 && !t.includes('undefined')).slice(0, 10);

    const tabs = [...document.querySelectorAll('.ant-tabs-tab, [role="tab"]')]
      .map(t => t.innerText.trim()).filter(Boolean).slice(0, 6);

    const cards = [...document.querySelectorAll('.ant-card-head-title, .card-title, [class*="card"] h3, [class*="card"] h4')]
      .map(c => c.innerText.trim()).filter(Boolean).slice(0, 8);

    const rows = document.querySelectorAll('tbody tr, .list-item, [class*="list-row"]').length;

    const emptyText = document.querySelector('.ant-empty-description, [class*="empty"]')?.innerText?.trim() || '';

    const pageTitle = document.title;
    const bodyText = document.body.innerText.substring(0, 400);

    return { headings, buttons, inputs, links, tabs, cards, rows, emptyText, pageTitle, bodyText };
  });
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const allNotes = {};

  for (const mod of MODULES) {
    const outDir = path.join(VM, mod.key);
    const log = [];
    const note = m => { console.log(`[${mod.key}] ${m}`); log.push(m); };

    // Use no-auth context for login/callback pages
    const ctxOpts = mod.noAuth ? { viewport: VW } : { storageState: AUTH, viewport: VW };
    const ctx = await browser.newContext(ctxOpts);
    const page = await ctx.newPage();
    await page.setViewportSize(VW);

    note(`Navigating to ${mod.url}`);
    await page.goto(mod.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    note(`URL after load: ${page.url()}`);

    // Main loaded screenshot
    const slug = `${mod.key}-loaded`;
    await page.screenshot({ path: path.join(outDir, `${slug}.png`) });
    note(`CAPTURED: ${slug}.png`);

    // DOM inspection
    const dom = await inspectPage(page);
    note(`Headings: ${JSON.stringify(dom.headings)}`);
    note(`Buttons: ${JSON.stringify(dom.buttons)}`);
    note(`Inputs: ${JSON.stringify(dom.inputs)}`);
    note(`Tabs: ${JSON.stringify(dom.tabs)}`);
    note(`Cards: ${JSON.stringify(dom.cards)}`);
    note(`Rows: ${dom.rows}`);
    note(`Empty: "${dom.emptyText}"`);
    note(`Body text (200): ${dom.bodyText.substring(0, 200)}`);

    // Module-specific captures

    if (mod.key === 'registration-login') {
      // Try to navigate to login page explicitly
      await page.goto('https://uat.xrportal.in/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      note(`Login page URL: ${page.url()}`);
      await page.screenshot({ path: path.join(outDir, 'login-page.png') });
      note('CAPTURED: login-page.png');

      // Register page
      await page.goto('https://uat.xrportal.in/register', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(outDir, 'register-page.png') });
      note('CAPTURED: register-page.png');
      const regDom = await inspectPage(page);
      note(`Register headings: ${JSON.stringify(regDom.headings)}`);
      note(`Register inputs: ${JSON.stringify(regDom.inputs)}`);
      note(`Register buttons: ${JSON.stringify(regDom.buttons)}`);
    }

    if (mod.key === 'home-dashboard') {
      // Scroll to capture any below-fold content
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, 'home-dashboard-scrolled.png') });
      note('CAPTURED: home-dashboard-scrolled.png');
      // Back to top
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    if (mod.key === 'support-tickets') {
      // Try categories page
      await page.goto('https://uat.xrportal.in/support-tickets/categories', { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(outDir, 'support-categories.png') });
      note(`CAPTURED: support-categories.png (URL: ${page.url()})`);

      // Try create page
      await page.goto('https://uat.xrportal.in/support-tickets/create', { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(outDir, 'support-create.png') });
      const createDom = await inspectPage(page);
      note(`CAPTURED: support-create.png`);
      note(`Create inputs: ${JSON.stringify(createDom.inputs)}`);
      note(`Create buttons: ${JSON.stringify(createDom.buttons)}`);

      // Back to list
      await page.goto('https://uat.xrportal.in/support-tickets', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Try clicking first ticket if rows exist
      const firstTicket = page.locator('tr.ant-table-row, [class*="ticket-row"], li[class*="ticket"]').first();
      if (await firstTicket.count() > 0) {
        await firstTicket.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(outDir, 'support-detail.png') });
        note(`CAPTURED: support-detail.png (URL: ${page.url()})`);
        await page.goBack();
        await page.waitForTimeout(1500);
      }
    }

    if (mod.key === 'kyc') {
      // Scroll to see form fields
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, 'kyc-scrolled.png') });
      note('CAPTURED: kyc-scrolled.png');
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    if (mod.key === 'allocation-experience') {
      // Scroll down to see unit selection grid/list
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, 'allocation-scrolled.png') });
      note('CAPTURED: allocation-scrolled.png');
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    if (mod.key === 'payment-schedule') {
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, 'payment-schedule-scrolled.png') });
      note('CAPTURED: payment-schedule-scrolled.png');
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    // Full-page final screenshot
    await page.screenshot({ path: path.join(outDir, `${mod.key}-full.png`) });
    note(`CAPTURED: ${mod.key}-full.png`);

    allNotes[mod.key] = { log, dom };
    await ctx.close();
  }

  fs.writeFileSync(
    path.join(VM, '_capture-notes-buyer.json'),
    JSON.stringify(allNotes, null, 2)
  );
  await browser.close();
  console.log('Done — all 11 buyer modules captured.');
}

run().catch(e => { console.error(e); process.exit(1); });
