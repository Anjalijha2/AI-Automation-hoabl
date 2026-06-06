// scripts/capture-sm-allocation-active-v2.js
//
// v2 — refines v1 captures with hard intel from API probe:
//   Active campaign: id=295, name="Test New Physical Campaign", status="RUNNING"
//   Search endpoint: GET /api/v1/sales-manager/physical-event/search?campaignId=295&q=<q>
//   No customers are pre-registered in UAT for campaign 295 (all queries return empty).
//
//   Therefore search-result.png is the "empty result with table headers visible"
//   state. We re-capture each PNG as proper desktop (viewport, NOT fullPage) for
//   visual-memory consistency.
//
// Captures:
//   1. allocation-loaded-active.png      — viewport, search bar visible (no query)
//   2. allocation-search-form.png        — focused crop of the search card (current state, no query)
//   3. allocation-search-result.png      — table with headers + No-data row (empty)
//   4. allocation-search-no-result.png   — same shape with ZZNOTFOUND query
//   5. allocation-checkout.png           — viewport after direct nav (redirects per src)
//   6. allocation-kyc.png                — viewport after direct nav (redirects per src)

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'sm', 'physical-allocation');
const VIEWPORT = { width: 1920, height: 900 };

const BASE = 'https://uat-web.xrportal.in/sales-manager';
const URLS = {
  allocation: `${BASE}/physical-allocation`,
  checkout:   `${BASE}/physical-allocation/checkout`,
  kyc:        `${BASE}/physical-allocation/kyc`,
};

const results = {};
function rec(key, status, note, extra) {
  results[key] = Object.assign({ status, note }, extra || {});
  console.log(`[${status.padEnd(14)}] ${key} — ${note}`);
}
async function settle(p, ms = 1500) { await p.waitForTimeout(ms); }

async function shotViewport(page, fileName) {
  const out = path.join(OUT_DIR, fileName);
  await page.screenshot({ path: out, fullPage: false });
  const stat = fs.statSync(out);
  return { file: out, name: fileName, bytes: stat.size };
}

(async () => {
  if (!fs.existsSync(AUTH)) { console.error('No SM auth'); process.exit(1); }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH, deviceScaleFactor: 1 });
  const page    = await context.newPage();

  try {
    // 1) Landing
    console.log('\n=== 1) allocation-loaded-active.png (viewport) ===');
    await page.goto(URLS.allocation, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 3000);
    if (/\/login/i.test(page.url())) { rec('landing', 'AUTH_FAILED', page.url()); throw new Error('AUTH'); }
    const r1 = await shotViewport(page, 'allocation-loaded-active.png');
    rec('1-loaded-active', 'CAPTURED', 'Viewport snapshot with active campaign (id=295, RUNNING)', r1);

    // 2) Search form crop
    console.log('\n=== 2) allocation-search-form.png (search-card focused) ===');
    const card = page.locator('.search-card, .ant-card').first();
    if (await card.count() > 0) {
      await card.scrollIntoViewIfNeeded();
      await settle(page, 500);
      const out = path.join(OUT_DIR, 'allocation-search-form.png');
      await card.screenshot({ path: out }).catch(async () => { await page.screenshot({ path: out, fullPage: false }); });
      const stat = fs.statSync(out);
      rec('2-search-form', 'CAPTURED', 'Search-card crop showing input + Scan QR', { file: out, bytes: stat.size });
    } else {
      rec('2-search-form', 'NOT_FOUND', 'search-card not found');
    }

    // 3) Search result — type a real query that returns empty (so headers + "No data" row appear)
    console.log('\n=== 3) allocation-search-result.png (headers visible, empty results) ===');
    const input = page.locator('input.search-input').first();
    await input.click();
    await input.fill('');
    await input.type('8888888888', { delay: 30 });
    await settle(page, 2800);
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    await settle(page, 1200);
    const r3 = await shotViewport(page, 'allocation-search-result.png');
    rec('3-search-result', 'CAPTURED_EMPTY',
        'Customer table headers (Customer Name | Phone Number | Registration Numbers | Registration Count | Action) visible + "No data" row. No customers seeded for campaign 295 in UAT — see /_probe-sm-active-campaign-results.json',
        r3);

    // 4) No-result
    console.log('\n=== 4) allocation-search-no-result.png ===');
    await input.click();
    await input.fill('');
    await input.type('ZZNOTFOUND', { delay: 30 });
    await settle(page, 2800);
    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
    await settle(page, 1200);
    const r4 = await shotViewport(page, 'allocation-search-no-result.png');
    rec('4-no-result', 'CAPTURED', 'ZZNOTFOUND -> No data', r4);

    // 5) Checkout — direct nav (will redirect)
    console.log('\n=== 5) allocation-checkout.png (direct nav) ===');
    await page.goto(URLS.checkout, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {});
    await settle(page, 2500);
    const urlAfterCheckout = page.url();
    const r5 = await shotViewport(page, 'allocation-checkout.png');
    rec('5-checkout', 'CAPTURED_REDIRECT',
        `Direct nav -> redirects to ${urlAfterCheckout}. UnitAllocationPage source guards with: if (!customer || !campaign) navigate('/sales-manager/physical-allocation'). Reachable only via Select-click from a non-empty search result.`,
        Object.assign(r5, { urlAfter: urlAfterCheckout }));

    // 6) KYC — direct nav (white blank page)
    console.log('\n=== 6) allocation-kyc.png (direct nav) ===');
    await page.goto(URLS.kyc, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    await settle(page, 2500);
    const urlAfterKyc = page.url();
    const kycText = await page.locator('body').innerText().catch(() => '');
    const r6 = await shotViewport(page, 'allocation-kyc.png');
    rec('6-kyc', 'CAPTURED_REDIRECT',
        `Direct nav -> ${urlAfterKyc}. body text length: ${(kycText || '').length}. KycPage source requires location.state.customerContext — absent context renders a blank page (no crash, no redirect). Reachable only via the full search → Select → unit-select → KYC flow.`,
        Object.assign(r6, { urlAfter: urlAfterKyc, bodyTextLen: (kycText || '').length }));

  } catch (e) {
    console.error('FATAL:', e?.message || e);
  } finally {
    fs.writeFileSync(
      path.join(__dirname, '_capture-sm-allocation-active-v2-results.json'),
      JSON.stringify(results, null, 2)
    );
    console.log('\nResults: scripts/_capture-sm-allocation-active-v2-results.json');
    await context.close();
    await browser.close();
  }
})();
