// scripts/capture-sm-allocation-real-flow-v2.js
//
// V2 refinements after analysing the v1 captures + UnitAllocationPage source:
//   • Real customer (Anjali WhatsAppTemp, GHNG-2000000014-A) renders 3 pre-allocated units
//     visibly in the centre column: Crest 1404, Crest 1407, Aspire 2805 — all "Available".
//   • `.unit-card` is the canonical selector for pre-allocated unit tiles.
//   • Clicking a unit-card calls handleUnitClick → it ONLY selects the unit in local state
//     and fetches pricing (no PUT update-unit-status, no API allocation). This is safe.
//   • KYC link "KYC & E-Sign" is shown in the Pre Allocated Units card header ONLY when
//     registration status === 'WINNER' (i.e. unit booked & paid). For PREALLOCATED, the
//     header shows "Common Pool" button instead. Therefore reaching a populated KYC page
//     in UAT requires a complete booking + payment cycle — out of scope for visual capture.
//
// CAPTURES (overwrites previous):
//   • allocation-customer-selected.png   — Search row in viewport with Select button (clean)
//   • allocation-checkout.png            — Full checkout populated (already good, re-capture)
//   • allocation-checkout-unit-selected.png — A unit-card clicked → "Selected" badge +
//                                              right Unit Details panel populated with pricing
//
// We will NOT re-capture allocation-kyc.png — the documented blank-on-direct-nav is correct
// and the populated KYC form is gated by WINNER status which requires payment.

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'sm', 'physical-allocation');
const LOG      = path.join(__dirname, '_capture-sm-allocation-real-flow-v2-results.json');
const VIEWPORT = { width: 1920, height: 900 };
const BASE     = 'https://uat-web.xrportal.in/sales-manager';
const BUYER_PHONE = '7666470638';
const BUYER_NAME  = 'Anjali WhatsAppTemp';

const results = { steps: [], notes: [], blocked: [] };
function rec(key, status, note, extra) {
  const o = Object.assign({ key, status, note }, extra || {});
  results.steps.push(o);
  console.log(`[${String(status).padEnd(16)}] ${key} — ${note}`);
}
async function settle(p, ms = 1500) { await p.waitForTimeout(ms); }
async function shot(page, fileName, opts = {}) {
  const out = path.join(OUT_DIR, fileName);
  await page.screenshot({ path: out, fullPage: !!opts.fullPage });
  return { file: out, name: fileName, bytes: fs.statSync(out).size };
}

(async () => {
  if (!fs.existsSync(AUTH)) { console.error('No SM auth'); process.exit(1); }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx     = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH, deviceScaleFactor: 1 });
  const page    = await ctx.newPage();

  // Safety guard — block ANY destructive write
  await ctx.route('**/*', async (route, req) => {
    const url = req.url();
    const method = req.method();
    if (method === 'GET' || method === 'OPTIONS') return route.continue();
    // Allow KYC applicants-read (uses POST)
    if (/\/kyc\/registration-units\/applicants/.test(url) && method === 'POST') {
      return route.continue();
    }
    // Block destructive mutations
    if (/(update-unit-status|allocation-order|kyc\/submit|kyc\/send-esign|kyc\/verify-esign|offline-units|additional-documents|notify)/.test(url) &&
        (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
      results.blocked.push({ url, method });
      console.log(`[BLOCKED]         ${method} ${url}`);
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });

  try {
    // 1) Land + search
    console.log('\n=== 1) Land + search ===');
    await page.goto(`${BASE}/physical-allocation`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);
    if (/\/login/i.test(page.url())) throw new Error('AUTH_FAILED');

    const input = page.locator('input.search-input').first();
    await input.click(); await input.fill(''); await input.type(BUYER_PHONE, { delay: 40 });
    await settle(page, 2800);
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    await settle(page, 800);

    const rows = await page.locator('.search-card .ant-table-tbody tr.ant-table-row').count();
    rec('search-rows', rows > 0 ? 'OK' : 'EMPTY', `result rows: ${rows}`);

    // Capture customer-selected (cleaner crop — focus on the result table region)
    // Re-capture the broad allocation-customer-selected (full viewport showing row + Select btn)
    const r1 = await shot(page, 'allocation-customer-selected.png');
    rec('1-customer-selected', 'CAPTURED', `${BUYER_NAME} row visible with Select button (pre-click)`, r1);

    // 2) Click Select → navigate to checkout
    console.log('\n=== 2) Select → checkout ===');
    const sel = page.locator('button.select-action-btn').first();
    await sel.click();
    await page.waitForURL(/\/checkout/, { timeout: 15_000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 3500); // allow pricing fetches + websocket open

    rec('nav-checkout', /checkout/.test(page.url()) ? 'OK' : 'FAIL', `url: ${page.url()}`);

    // 3) Re-capture checkout viewport (the real, populated state)
    const r2 = await shot(page, 'allocation-checkout.png');
    rec('2-checkout', 'CAPTURED', 'Checkout with customer context populated', r2);
    const r2f = await shot(page, 'allocation-checkout-fullpage.png', { fullPage: true });
    rec('2b-checkout-fullpage', 'CAPTURED', 'Full-page (incl. customer preferences table)', r2f);

    // 4) Inventory the unit-card tiles
    const unitCards = page.locator('.unit-card');
    const cardCount = await unitCards.count();
    rec('unit-card-count', cardCount > 0 ? 'OK' : 'NONE', `pre-allocated unit cards present: ${cardCount}`);

    // Inspect each card's classes
    if (cardCount > 0) {
      const summary = await unitCards.evaluateAll(els => els.map(el => ({
        class: el.className,
        text: el.innerText.replace(/\s+/g, ' ').slice(0, 120),
      })));
      results.notes.push({ unit_cards_summary: summary });
      console.log('Unit cards:');
      summary.forEach((s, i) => console.log(`  [${i}] ${s.text}`));
    }

    // 5) Click first AVAILABLE (not-disabled) unit-card
    if (cardCount > 0) {
      const availableCard = page.locator('.unit-card:not(.disabled)').first();
      const ac = await availableCard.count();
      if (ac > 0) {
        try { await availableCard.scrollIntoViewIfNeeded(); } catch (e) {}
        await settle(page, 400);
        await availableCard.click({ timeout: 5000 });
        await settle(page, 2500); // pricing fetch
        await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
        await settle(page, 1500);

        // Confirm selection — check for .selected on the same card
        const selectedNow = await page.locator('.unit-card.selected').count();
        rec('unit-card-clicked', 'OK', `clicked first available card. .selected count = ${selectedNow}`);

        const r3 = await shot(page, 'allocation-checkout-unit-selected.png');
        rec('3-unit-selected', 'CAPTURED', 'Unit-card clicked → Unit Details panel populated', r3);

        // Also capture a fullpage for cost-sheet / payment-schedule sections below
        const r3f = await shot(page, 'allocation-checkout-unit-selected-fullpage.png', { fullPage: true });
        rec('3b-unit-selected-fullpage', 'CAPTURED', 'Full-page with CostSheet + PaymentSchedule', r3f);
      } else {
        rec('3-unit-selected', 'SKIP', 'All unit-cards are .disabled');
      }
    }

    // 6) Capture DOM dump of populated checkout (deeper this time)
    const domDump = await page.evaluate(() => {
      const collect = (el, depth = 0) => {
        if (!el || depth > 15) return null;
        if (el.nodeType !== 1) return null;
        const out = {
          tag: el.tagName.toLowerCase(),
          id: el.id || undefined,
          class: el.className && typeof el.className === 'string' ? el.className : undefined,
        };
        const text = (el.childElementCount === 0 && el.textContent && el.textContent.trim().length < 80)
          ? el.textContent.trim() : undefined;
        if (text) out.text = text;
        const children = [];
        for (const c of el.children) {
          const cc = collect(c, depth + 1);
          if (cc) children.push(cc);
        }
        if (children.length) out.children = children;
        return out;
      };
      const root = document.querySelector('.physical-event-container') || document.body;
      return { url: location.href, title: document.title, tree: collect(root, 0) };
    });
    fs.writeFileSync(path.join(OUT_DIR, '_allocation-active-dom-checkout-real-v2.json'),
      JSON.stringify(domDump, null, 2));
    rec('dom-dump-v2', 'WROTE', 'Deeper DOM dump of populated checkout', { file: '_allocation-active-dom-checkout-real-v2.json' });

    // 7) Document KYC reachability
    rec('kyc-gating', 'DOCUMENTED',
      'KYC link is only rendered when registration.status === "WINNER" (booked). For PREALLOCATED, header shows "Common Pool" instead. Populated KYC capture requires complete booking + payment cycle — out of scope.');

  } catch (e) {
    rec('FATAL', 'ERROR', e.message);
  } finally {
    fs.writeFileSync(LOG, JSON.stringify(results, null, 2));
    console.log('\nWrote', LOG);
    await browser.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
