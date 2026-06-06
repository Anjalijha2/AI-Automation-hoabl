// scripts/capture-sm-allocation-active-campaign.js
//
// Capture SM Portal / Physical Allocation ACTIVE CAMPAIGN states.
// Previous capture (capture-sm-4modules.js, 2026-06-05) hit the "No Active
// Campaign" empty state. An active Physical Event campaign now exists in UAT
// so we can drive the customer-search → checkout → KYC flow.
//
// IMPORTANT — DO NOT COMPLETE A REAL ALLOCATION:
//   - Stop short of any irreversible Confirm/Pay/Submit action.
//   - We only capture form/state snapshots.
//
// Source code reference:
//   src/routes/Private/sales-manager/physical-event/CustomerSearchPage.jsx
//   src/routes/Private/sales-manager/physical-event/UnitAllocationPage.jsx
//   src/routes/Private/sales-manager/physical-event/KycPage.jsx
//
// Routes (BASE = https://uat-web.xrportal.in/sales-manager):
//   GET ${BASE}/physical-allocation           — CustomerSearchPage
//   GET ${BASE}/physical-allocation/checkout  — UnitAllocationPage (needs location.state.customer)
//   GET ${BASE}/physical-allocation/kyc       — KycPage (needs location.state.customerContext)
//
// Captures requested (filenames go in visual-memory/sm/physical-allocation/):
//   1. allocation-loaded-active.png
//   2. allocation-search-form.png
//   3. allocation-search-result.png
//   4. allocation-search-no-result.png
//   5. allocation-customer-selected.png   (post Select-click — should land on /checkout)
//   6. allocation-checkout.png            (direct nav fallback if customer-select path fails)
//   7. allocation-checkout-unit-selected.png
//   8. allocation-kyc.png
//   9. allocation-confirmation.png        (only if reachable safely)

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'sm', 'physical-allocation');
const VIEWPORT = { width: 1920, height: 900 };

const BASE = 'https://uat-web.xrportal.in/sales-manager';
const URLS = {
  allocation:        `${BASE}/physical-allocation`,
  checkout:          `${BASE}/physical-allocation/checkout`,
  kyc:               `${BASE}/physical-allocation/kyc`,
  login:             `${BASE}/login`,
};

const SEARCH_NO_RESULT = 'ZZNOTFOUND';
// Phone seeded for SM physical-event search in UAT. If unknown, we'll try
// generic queries: 1) '8888888888' (UAT seed), 2) numeric token grabbed from
// any visible "registration number" hint, 3) just '99999' (5+ chars triggers
// search per source: handleSearch ignores <5 chars).
const SEARCH_QUERIES_TO_TRY = ['8888888888', '9999999999', '0000099999'];

const results = {};
function rec(key, status, note, extra) {
  results[key] = Object.assign({ status, note }, extra || {});
  console.log(`[${status.padEnd(14)}] ${key} — ${note}`);
}

async function settle(page, ms = 1500) { await page.waitForTimeout(ms); }
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

async function shot(page, fileName, full = false) {
  const out = path.join(OUT_DIR, fileName);
  await page.screenshot({ path: out, fullPage: full });
  const stat = fs.statSync(out);
  return { file: out, name: fileName, bytes: stat.size };
}

async function dismissOverlays(page) {
  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(200);
  }
  await page.mouse.click(5, 5).catch(() => {});
  await page.waitForTimeout(200);
}

async function inspectAllocationPage(page) {
  return await page.evaluate(() => {
    const out = { url: location.href };
    out.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .map(h => `${h.tagName}: ${(h.innerText || '').trim()}`)
      .filter(s => s.length > 2).slice(0, 15);
    out.bodySnippet = (document.body.innerText || '').slice(0, 1600);
    out.hasNoActiveCampaign = /No Active Campaign/i.test(document.body.innerText);
    out.searchInputs = Array.from(document.querySelectorAll('input')).map(i => ({
      placeholder: i.placeholder || '',
      ariaLabel:   i.getAttribute('aria-label') || '',
      cls:         (i.className || '').toString().slice(0, 120),
      name:        i.name || '',
      type:        i.type || '',
      id:          i.id || '',
      disabled:    i.disabled,
    }));
    out.buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text:     (b.innerText || '').trim(),
      ariaLabel: b.getAttribute('aria-label') || '',
      cls:      (b.className || '').toString().slice(0, 120),
      disabled: b.disabled,
    })).filter(b => b.text || b.ariaLabel).slice(0, 30);
    out.tableHeaders = Array.from(document.querySelectorAll('thead th, .ant-table-thead th'))
      .map(th => (th.innerText || '').trim()).filter(Boolean);
    out.tableRows = document.querySelectorAll('tbody tr, .ant-table-row').length;
    // Campaign / banner text patterns
    out.campaignBannerCandidates = Array.from(document.querySelectorAll('.ant-tag, [class*="campaign" i], [class*="banner" i], .ant-alert, .ant-card-head-title, .ant-card-head'))
      .map(c => ({ text: (c.innerText || '').trim().slice(0, 200), cls: (c.className || '').toString().slice(0, 120) }))
      .filter(c => c.text && c.text.length < 300).slice(0, 15);
    return out;
  }).catch(e => ({ err: String(e?.message || e) }));
}

async function inspectCheckoutPage(page) {
  return await page.evaluate(() => {
    const out = { url: location.href };
    out.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .map(h => `${h.tagName}: ${(h.innerText || '').trim()}`)
      .filter(s => s.length > 1).slice(0, 20);
    out.tabs = Array.from(document.querySelectorAll('.ant-tabs-tab, [role="tab"]'))
      .map(t => (t.innerText || '').trim()).filter(Boolean).slice(0, 20);
    out.buttons = Array.from(document.querySelectorAll('button'))
      .map(b => ({ text: (b.innerText || '').trim(), ariaLabel: b.getAttribute('aria-label') || '', cls: (b.className || '').toString().slice(0, 120), disabled: b.disabled }))
      .filter(b => b.text || b.ariaLabel).slice(0, 30);
    // Tower / unit selectors
    out.towerCandidates = Array.from(document.querySelectorAll(
      '[class*="tower" i]:not([class*="towers"])', // tower cards
    )).map(t => ({ tag: t.tagName, cls: (t.className || '').toString().slice(0, 120), text: (t.innerText || '').trim().slice(0, 80) })).slice(0, 30);
    out.unitCellCount = document.querySelectorAll('[class*="unit-cell" i], [class*="UnitCell" i], [class*="unitCell" i], svg rect, [class*="flat" i]').length;
    out.drawersOpen = document.querySelectorAll('.ant-drawer-open, .ant-drawer:not(.ant-drawer-bottom):not(.ant-drawer-right):not(.ant-drawer-left):not(.ant-drawer-top)').length;
    out.modalsOpen = document.querySelectorAll('.ant-modal-content').length;
    out.bodySnippet = (document.body.innerText || '').slice(0, 2000);
    return out;
  }).catch(e => ({ err: String(e?.message || e) }));
}

async function inspectKycPage(page) {
  return await page.evaluate(() => {
    const out = { url: location.href };
    out.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .map(h => `${h.tagName}: ${(h.innerText || '').trim()}`)
      .filter(s => s.length > 1).slice(0, 20);
    out.formItems = Array.from(document.querySelectorAll('.ant-form-item-label')).map(l => (l.innerText || '').trim()).filter(Boolean).slice(0, 40);
    out.inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(i => ({
      tag: i.tagName, placeholder: i.placeholder || '', name: i.name || '', type: i.type || '',
      ariaLabel: i.getAttribute('aria-label') || '', id: i.id || '',
    })).slice(0, 40);
    out.buttons = Array.from(document.querySelectorAll('button'))
      .map(b => ({ text: (b.innerText || '').trim(), cls: (b.className || '').toString().slice(0, 120), disabled: b.disabled }))
      .filter(b => b.text).slice(0, 30);
    out.bodySnippet = (document.body.innerText || '').slice(0, 2000);
    return out;
  }).catch(e => ({ err: String(e?.message || e) }));
}

(async () => {
  if (!fs.existsSync(AUTH)) {
    console.error('No SM auth file at', AUTH);
    process.exit(1);
  }
  ensureDir(OUT_DIR);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH, deviceScaleFactor: 1 });
  const page = await context.newPage();

  let campaignActive = false;
  let customerSelected = false;
  let safeCustomer = null;
  let safeQuery = null;

  try {
    // ============================================================
    // 1) allocation-loaded-active.png
    // ============================================================
    console.log('\n=== 1) Landing — allocation-loaded-active.png ===');
    await page.goto(URLS.allocation, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 3000);

    if (/\/login/i.test(page.url())) {
      rec('1-allocation-loaded-active', 'AUTH_FAILED', `Redirected to ${page.url()} — SM session expired. Re-run auth:setup.`);
      throw new Error('AUTH_FAILED');
    }

    const landingDom = await inspectAllocationPage(page);
    fs.writeFileSync(path.join(OUT_DIR, '_allocation-active-dom-landing.json'), JSON.stringify(landingDom, null, 2));
    campaignActive = !landingDom.hasNoActiveCampaign && (landingDom.searchInputs || []).some(i => /Search by Phone or Registration Number/i.test(i.placeholder));
    console.log('  campaignActive =', campaignActive, '| URL:', landingDom.url);

    {
      const r = await shot(page, 'allocation-loaded-active.png', true);
      rec('1-allocation-loaded-active', campaignActive ? 'CAPTURED' : 'CAPTURED_EMPTY',
        campaignActive ? `Active campaign visible. Headings: ${JSON.stringify(landingDom.headings.slice(0,5))}` : 'Page still shows "No Active Campaign" — no active campaign exists in UAT right now',
        { file: r.name, bytes: r.bytes });
    }

    if (!campaignActive) {
      // Capture remaining screens are not possible — bail with the empty-state record
      throw new Error('NO_ACTIVE_CAMPAIGN');
    }

    // ============================================================
    // 2) allocation-search-form.png  (focused crop of search form)
    // ============================================================
    console.log('\n=== 2) Search form — allocation-search-form.png ===');
    try {
      const searchCard = page.locator('.search-card, .ant-card').first();
      if (await searchCard.count() > 0) {
        await searchCard.scrollIntoViewIfNeeded();
        await settle(page, 600);
        await searchCard.screenshot({ path: path.join(OUT_DIR, 'allocation-search-form.png') }).catch(async () => {
          await shot(page, 'allocation-search-form.png');
        });
      } else {
        await shot(page, 'allocation-search-form.png');
      }
      const stat = fs.statSync(path.join(OUT_DIR, 'allocation-search-form.png'));
      rec('2-allocation-search-form', 'CAPTURED', 'Search card with Search-input + Scan-QR button', { file: 'allocation-search-form.png', bytes: stat.size });
    } catch (e) {
      rec('2-allocation-search-form', 'ERROR', String(e?.message || e));
    }

    // ============================================================
    // 3) allocation-search-result.png  (try a real query)
    // ============================================================
    console.log('\n=== 3) Search results — allocation-search-result.png ===');
    let resultsFound = false;
    for (const q of SEARCH_QUERIES_TO_TRY) {
      console.log(`  trying query "${q}"...`);
      try {
        const input = page.locator('input.search-input, input[placeholder*="Phone or Registration" i]').first();
        if (await input.count() === 0) { rec('3-allocation-search-result', 'NOT_FOUND', 'Search input not found'); break; }
        await input.click();
        await input.fill('');
        await input.type(q, { delay: 30 });
        // Source: handleSearch has 500ms debounce + needs >=5 chars
        await settle(page, 2500);
        // Wait for table to populate or empty placeholder
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
        await settle(page, 1500);
        const rowCount = await page.locator('tbody tr.ant-table-row, .ant-table-tbody tr').count();
        const emptyShown = await page.locator('.ant-empty, [class*="empty" i]').count();
        console.log(`  query "${q}" -> rows=${rowCount}, emptyShown=${emptyShown}`);
        if (rowCount > 0) {
          // Capture results
          const r = await shot(page, 'allocation-search-result.png');
          rec('3-allocation-search-result', 'CAPTURED', `Query "${q}" returned ${rowCount} row(s)`, { file: r.name, bytes: r.bytes, query: q, rowCount });
          safeQuery = q;
          resultsFound = true;
          // Capture customer object snapshot (table row text)
          safeCustomer = await page.locator('tbody tr.ant-table-row').first().innerText().catch(() => '');
          break;
        }
      } catch (e) {
        console.log(`  query "${q}" error:`, e?.message || e);
      }
    }
    if (!resultsFound) {
      // Fall back: capture whatever state we have (likely empty result)
      const r = await shot(page, 'allocation-search-result.png');
      rec('3-allocation-search-result', 'CAPTURED_EMPTY', 'No customers matched any of the tried queries — captured the empty/loading result table', { file: r.name, bytes: r.bytes, triedQueries: SEARCH_QUERIES_TO_TRY });
    }

    // ============================================================
    // 4) allocation-search-no-result.png  (ZZNOTFOUND query)
    // ============================================================
    console.log('\n=== 4) No-result search — allocation-search-no-result.png ===');
    try {
      const input = page.locator('input.search-input, input[placeholder*="Phone or Registration" i]').first();
      if (await input.count() > 0) {
        await input.click();
        await input.fill('');
        await input.type(SEARCH_NO_RESULT, { delay: 30 });
        await settle(page, 2500);
        await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
        await settle(page, 1200);
        const r = await shot(page, 'allocation-search-no-result.png');
        const rowCount = await page.locator('tbody tr.ant-table-row').count();
        const emptyText = await page.locator('.ant-empty-description, .ant-empty').first().innerText().catch(() => '');
        rec('4-allocation-search-no-result', 'CAPTURED', `Query "${SEARCH_NO_RESULT}" -> rows=${rowCount} | empty: "${emptyText}"`, { file: r.name, bytes: r.bytes });
      } else {
        rec('4-allocation-search-no-result', 'NOT_FOUND', 'Search input not found');
      }
    } catch (e) {
      rec('4-allocation-search-no-result', 'ERROR', String(e?.message || e));
    }

    // ============================================================
    // 5) allocation-customer-selected.png — click Select on the result row
    //    (re-run safe query first if we have one)
    // ============================================================
    console.log('\n=== 5) Customer selected — allocation-customer-selected.png ===');
    if (safeQuery) {
      try {
        const input = page.locator('input.search-input, input[placeholder*="Phone or Registration" i]').first();
        await input.click();
        await input.fill('');
        await input.type(safeQuery, { delay: 30 });
        await settle(page, 2500);
        await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
        await settle(page, 1200);
        const selectBtn = page.locator('tbody tr.ant-table-row').first().locator('button:has-text("Select"), button.select-action-btn').first();
        if (await selectBtn.count() === 0) {
          rec('5-allocation-customer-selected', 'NOT_FOUND', 'Select button not present on result row');
        } else {
          // Source navigates to /physical-allocation/checkout via location.state
          const beforeUrl = page.url();
          await selectBtn.scrollIntoViewIfNeeded();
          await selectBtn.click();
          // Wait for URL change OR settled checkout page
          await page.waitForURL(/physical-allocation\/checkout/, { timeout: 12_000 }).catch(() => {});
          await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
          await settle(page, 3000);
          const r = await shot(page, 'allocation-customer-selected.png', true);
          rec('5-allocation-customer-selected', 'CAPTURED', `Clicked Select. Before: ${beforeUrl}; After: ${page.url()}`, { file: r.name, bytes: r.bytes, urlAfter: page.url() });
          if (/physical-allocation\/checkout/.test(page.url())) {
            customerSelected = true;
          }
        }
      } catch (e) {
        rec('5-allocation-customer-selected', 'ERROR', String(e?.message || e));
      }
    } else {
      rec('5-allocation-customer-selected', 'SKIPPED', 'No customer match found in earlier query attempts — Select-click path unavailable');
    }

    // ============================================================
    // 6) allocation-checkout.png — unit-allocation page
    //    Path A: we already navigated via Select-click → just capture current
    //    Path B: customerSelected=false → direct navigation will redirect back
    //            (source: UnitAllocationPage `if (!customer || !campaign) navigate('/sales-manager/physical-allocation')`)
    //            so document that this is unreachable without a real customer.
    // ============================================================
    console.log('\n=== 6) Checkout page — allocation-checkout.png ===');
    if (customerSelected) {
      // Already on /checkout from Select-click — capture full page
      try {
        const checkoutDom = await inspectCheckoutPage(page);
        fs.writeFileSync(path.join(OUT_DIR, '_allocation-active-dom-checkout.json'), JSON.stringify(checkoutDom, null, 2));
        const r = await shot(page, 'allocation-checkout.png', true);
        rec('6-allocation-checkout', 'CAPTURED', `Checkout page captured. Headings: ${JSON.stringify(checkoutDom.headings.slice(0,5))}`, { file: r.name, bytes: r.bytes });
      } catch (e) {
        rec('6-allocation-checkout', 'ERROR', String(e?.message || e));
      }
    } else {
      // Try direct nav as documentation — expect redirect
      try {
        await page.goto(URLS.checkout, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {});
        await settle(page, 2500);
        const urlNow = page.url();
        const checkoutDom = await inspectCheckoutPage(page);
        fs.writeFileSync(path.join(OUT_DIR, '_allocation-active-dom-checkout.json'), JSON.stringify(checkoutDom, null, 2));
        const r = await shot(page, 'allocation-checkout.png', true);
        const redirected = !/physical-allocation\/checkout/.test(urlNow);
        rec('6-allocation-checkout', redirected ? 'CAPTURED_REDIRECT' : 'CAPTURED',
            redirected
              ? `Direct nav to /checkout redirected to ${urlNow} (UnitAllocationPage requires location.state.customer per source). Captured the landing state.`
              : `Direct nav remained on /checkout (unexpected — captured as-is)`,
            { file: r.name, bytes: r.bytes, urlNow });
      } catch (e) {
        rec('6-allocation-checkout', 'ERROR', String(e?.message || e));
      }
    }

    // ============================================================
    // 7) allocation-checkout-unit-selected.png
    //    Only possible if we're actually on /checkout with state
    // ============================================================
    console.log('\n=== 7) Unit selected — allocation-checkout-unit-selected.png ===');
    if (customerSelected && /physical-allocation\/checkout/.test(page.url())) {
      try {
        // Click a tower card first, then a unit
        const towerCard = page.locator('[class*="tower-card" i], [class*="towerCard" i], .ant-tabs-tab, [role="tab"]').first();
        if (await towerCard.count() > 0) {
          await towerCard.scrollIntoViewIfNeeded();
          await towerCard.click({ force: true }).catch(() => {});
          await settle(page, 1500);
        }
        // Pick a unit cell — look for available-class first
        const unit = page.locator(
          '[class*="unit-cell" i][class*="AVAILABLE" i], [class*="UnitCell" i][class*="AVAILABLE" i], [class*="unit-cell" i]:not([class*="BOOKED" i]):not([class*="HOLD" i])'
        ).first();
        let unitFound = false;
        if (await unit.count() > 0) {
          await unit.scrollIntoViewIfNeeded();
          await unit.click({ force: true });
          await settle(page, 2500);
          unitFound = true;
        }
        const r = await shot(page, 'allocation-checkout-unit-selected.png', true);
        rec('7-allocation-checkout-unit-selected', unitFound ? 'CAPTURED' : 'CAPTURED_NO_UNIT_CLICKED',
            unitFound ? 'Clicked a unit; captured post-click state (likely UnitDetail drawer open)' : 'No unit cell located; captured current checkout state',
            { file: r.name, bytes: r.bytes });
        // Dismiss any drawer/modal
        await dismissOverlays(page);
      } catch (e) {
        rec('7-allocation-checkout-unit-selected', 'ERROR', String(e?.message || e));
      }
    } else {
      rec('7-allocation-checkout-unit-selected', 'UNREACHABLE', 'Cannot reach /checkout without a real customerContext (selected via search → Select). KYC and unit-selection require live state.');
    }

    // ============================================================
    // 8) allocation-kyc.png — direct nav (expect redirect per source)
    // ============================================================
    console.log('\n=== 8) KYC page — allocation-kyc.png ===');
    try {
      await page.goto(URLS.kyc, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {});
      await settle(page, 2500);
      const kycDom = await inspectKycPage(page);
      fs.writeFileSync(path.join(OUT_DIR, '_allocation-active-dom-kyc.json'), JSON.stringify(kycDom, null, 2));
      const r = await shot(page, 'allocation-kyc.png', true);
      const urlNow = page.url();
      const redirected = !/physical-allocation\/kyc/.test(urlNow);
      rec('8-allocation-kyc', redirected ? 'CAPTURED_REDIRECT' : 'CAPTURED',
          redirected
            ? `Direct nav to /kyc redirected to ${urlNow} (KycPage requires location.state.customerContext per source). Captured destination state.`
            : `KYC page captured. Headings: ${JSON.stringify(kycDom.headings.slice(0,5))}`,
          { file: r.name, bytes: r.bytes, urlNow });
    } catch (e) {
      rec('8-allocation-kyc', 'ERROR', String(e?.message || e));
    }

    // ============================================================
    // 9) allocation-confirmation.png — unreachable without real allocation
    // ============================================================
    console.log('\n=== 9) Confirmation — allocation-confirmation.png ===');
    rec('9-allocation-confirmation', 'UNREACHABLE',
        'Confirmation/success requires completing real KYC submission and payment. Per task instructions, do NOT execute irreversible actions. Not captured.');

  } catch (e) {
    console.error('CAUGHT:', e?.message || e);
  } finally {
    fs.writeFileSync(
      path.join(__dirname, '_capture-sm-allocation-active-results.json'),
      JSON.stringify({ results, campaignActive, customerSelected, safeQuery }, null, 2)
    );
    console.log('\nResults written: scripts/_capture-sm-allocation-active-results.json');
    await context.close();
    await browser.close();
  }
})();
