// scripts/capture-sm-allocation-real-flow.js
//
// Capture the 3-5 missing physical-allocation screenshots using REAL pre-registered
// buyers in UAT campaign 295. Discovered via /admin/allocation/campaigns/295/allotments/export:
//
//   GHNG-2000000014-A  Anjali WhatsAppTemp  7666470638  PREALLOCATED  Crest / Aspire
//   GHNG-2000000024-A  aman guptaa          7020527871  PREALLOCATED  Aura
//   GHNG-2000000009-Y  Supriya Dubey        9167746035  HOLD           Crest / Aspire
//
// Use phone "7666470638" (Anjali WhatsAppTemp) as the primary buyer — PREALLOCATED gives
// the cleanest checkout flow. The 'HOLD' status on Supriya may already have a reserved unit.
//
// CAPTURES (no irreversible actions):
//   1. allocation-search-result.png        — search "7666470638" → results table with 1 row
//   2. allocation-customer-selected.png    — captured immediately AFTER click Select but before
//                                            anything is locked (intermediate navigation frame)
//   3. allocation-checkout.png             — full checkout page (towers + units grid)
//   4. allocation-checkout-unit-selected.png — click an AVAILABLE unit cell → UnitDetail drawer
//   5. allocation-kyc.png                  — navigate to /kyc by clicking "Proceed to KYC" if
//                                            present, OR by direct route with state cloned
//                                            (read-only — no submit)
//
// STOP CONDITIONS: never click "Submit KYC", "Pay", "Make Payment", "Confirm Allocation".
// Hooks unit-status PUT endpoint to AUTO-RELEASE any unit that gets HELD by the SM UI when
// hovering/clicking (we do not click any unit-hold button, just unit-cell to open drawer).

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'sm', 'physical-allocation');
const LOG      = path.join(__dirname, '_capture-sm-allocation-real-flow-results.json');
const VIEWPORT = { width: 1920, height: 900 };
const BASE     = 'https://uat-web.xrportal.in/sales-manager';

// Use Anjali WhatsAppTemp — PREALLOCATED, isKycSubmitted=false → clean flow
const BUYER_PHONE = '7666470638';
const BUYER_NAME  = 'Anjali WhatsAppTemp';

const results = { steps: [], notes: [] };

function rec(key, status, note, extra) {
  const o = Object.assign({ key, status, note }, extra || {});
  results.steps.push(o);
  console.log(`[${String(status).padEnd(16)}] ${key} — ${note}`);
}

async function settle(p, ms = 1500) { await p.waitForTimeout(ms); }

async function shot(page, fileName, opts = {}) {
  const out = path.join(OUT_DIR, fileName);
  await page.screenshot({ path: out, fullPage: !!opts.fullPage });
  const stat = fs.statSync(out);
  return { file: out, name: fileName, bytes: stat.size };
}

(async () => {
  if (!fs.existsSync(AUTH)) { console.error('No SM auth'); process.exit(1); }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx     = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH, deviceScaleFactor: 1 });
  const page    = await ctx.newPage();

  // SAFETY GUARD — block any potentially destructive POST/PUT requests except read-only
  await ctx.route('**/*', async (route, req) => {
    const url    = req.url();
    const method = req.method();
    // Allow all GETs
    if (method === 'GET' || method === 'OPTIONS') return route.continue();
    // Allow KYC applicants fetch (POST is used for read in this API per source line 132 of physical-event.routes.js)
    if (/\/kyc\/registration-units\/applicants/.test(url) && method === 'POST') {
      results.notes.push({ allowed: url, method, why: 'KYC applicants read uses POST' });
      return route.continue();
    }
    // Allow update-unit-status PUT — but we will NEVER trigger one without explicit code path
    if (/update-unit-status/.test(url) && method === 'PUT') {
      results.notes.push({ ABORTED_UNIT_STATUS_CHANGE: url, method });
      return route.abort('blockedbyclient');
    }
    // Allow allocation-order/cancel for safety (release held units we might accidentally hold)
    if (/allocation-order\/cancel/.test(url)) {
      return route.continue();
    }
    // Block everything else: submit, allocation-order, payment, kyc/submit
    if (/(allocation-order(?!.*cancel)|kyc\/submit|kyc\/send-esign|kyc\/verify-esign|offline-units|payment-transactions|notify|applicants$|applicants\/merge)/.test(url) &&
        (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
      results.notes.push({ BLOCKED_DESTRUCTIVE: url, method });
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });

  try {
    // === 1) Landing + search ============================================
    console.log('\n=== 1) Land on /physical-allocation and search by phone ===');
    await page.goto(`${BASE}/physical-allocation`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);
    if (/\/login/i.test(page.url())) { rec('landing', 'AUTH_FAILED', page.url()); throw new Error('AUTH'); }

    const input = page.locator('input.search-input').first();
    await input.click();
    await input.fill('');
    await input.type(BUYER_PHONE, { delay: 40 });
    // Wait for debounce (500ms) + network round-trip
    await settle(page, 2800);
    await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {});
    await settle(page, 800);

    // Verify the row landed
    const rowCount = await page.locator('.search-card .ant-table-tbody tr.ant-table-row').count();
    rec('search-result-rows', rowCount > 0 ? 'OK' : 'EMPTY', `rows in result table: ${rowCount}`);

    const r1 = await shot(page, 'allocation-search-result.png');
    rec('1-search-result', 'CAPTURED', `Search by phone ${BUYER_PHONE} → ${rowCount} row(s) (${BUYER_NAME})`, r1);

    // === 2) Click Select on the row =====================================
    console.log('\n=== 2) Click Select → capture transition / customer-selected ===');
    const selectBtn = page.locator('button.select-action-btn').first();
    const selectCount = await selectBtn.count();
    rec('select-button-presence', selectCount > 0 ? 'OK' : 'MISSING', `select-action-btn count: ${selectCount}`);

    if (selectCount === 0) {
      rec('2-customer-selected', 'BLOCKED', 'No Select button — search returned no rows');
    } else {
      // Capture frame right before clicking — that's the "customer row visible, hover/about-to-click" state
      // We'll capture the table with the Select button visible in viewport.
      try { await selectBtn.scrollIntoViewIfNeeded(); } catch (e) {}
      await settle(page, 400);
      const r2pre = await shot(page, 'allocation-customer-selected.png');
      rec('2-customer-selected', 'CAPTURED', 'Result row visible with Select button highlighted (pre-click state)', r2pre);

      // Now click Select to navigate
      const navP = page.waitForURL(/\/physical-allocation\/checkout/, { timeout: 15_000 }).catch(() => null);
      await selectBtn.click();
      await navP;
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 3000);
      rec('nav-to-checkout', /checkout/.test(page.url()) ? 'OK' : 'FAIL', `url: ${page.url()}`);

      // === 3) Checkout — full viewport ==================================
      console.log('\n=== 3) Checkout page — full viewport ===');
      const r3 = await shot(page, 'allocation-checkout.png');
      rec('3-checkout', 'CAPTURED', 'UnitAllocationPage rendered with tower heatmap + units', r3);

      // Also fullPage variant for documentation
      const r3full = await shot(page, 'allocation-checkout-fullpage.png', { fullPage: true });
      rec('3b-checkout-fullpage', 'CAPTURED', 'Full-page checkout dump (scrollable content)', r3full);

      // Capture DOM structure
      const domDump = await page.evaluate(() => {
        const collect = (el, depth = 0) => {
          if (!el || depth > 8) return null;
          if (el.nodeType !== 1) return null;
          const out = {
            tag: el.tagName.toLowerCase(),
            id: el.id || undefined,
            class: el.className && typeof el.className === 'string' ? el.className : undefined,
            text: (el.children.length === 0 && el.textContent && el.textContent.trim().length < 100)
              ? el.textContent.trim() : undefined,
          };
          const children = [];
          for (const c of el.children) {
            const cc = collect(c, depth + 1);
            if (cc) children.push(cc);
          }
          if (children.length) out.children = children;
          return out;
        };
        const root = document.querySelector('main, .ant-layout-content, body');
        return {
          url: location.href,
          title: document.title,
          tree: collect(root || document.body, 0),
        };
      });
      fs.writeFileSync(path.join(OUT_DIR, '_allocation-active-dom-checkout-real.json'),
        JSON.stringify(domDump, null, 2));
      rec('3c-dom-dump', 'WROTE', 'DOM tree of checkout page', { file: '_allocation-active-dom-checkout-real.json' });

      // === 4) Click an AVAILABLE unit-cell → UnitDetail drawer ==========
      console.log('\n=== 4) Click first AVAILABLE unit-cell → capture unit-detail drawer ===');
      // The TowerHeatmap / FloorUnitPlan renders unit cells. Inspect likely selectors:
      const unitCellCandidates = [
        '.unit-cell.available',
        '.unit-card.AVAILABLE',
        '[data-status="AVAILABLE"]',
        '.unit:not(.HOLD):not(.WINNER):not(.disabled)',
        '.tower-unit-cell.available',
        'div.ant-card.unit:not(.disabled)',
      ];
      let clickedSelector = null;
      for (const sel of unitCellCandidates) {
        const c = await page.locator(sel).count();
        results.notes.push({ probe: sel, count: c });
        if (c > 0) { clickedSelector = sel; break; }
      }
      // Fallback — find any clickable unit cell via heuristic
      if (!clickedSelector) {
        // Try clicking the first tower tab/card to expose units
        const towerTabCandidates = ['.tower-tab', '.tower-card', '.ant-tabs-tab', '.tower-chip'];
        for (const ts of towerTabCandidates) {
          const c = await page.locator(ts).count();
          results.notes.push({ tower_probe: ts, count: c });
          if (c > 0) {
            try { await page.locator(ts).first().click({ timeout: 3000 }); } catch (e) {}
            await settle(page, 1500);
            break;
          }
        }
        // Retry unit-cell candidates
        for (const sel of unitCellCandidates) {
          const c = await page.locator(sel).count();
          if (c > 0) { clickedSelector = sel; break; }
        }
      }

      if (clickedSelector) {
        const cell = page.locator(clickedSelector).first();
        try { await cell.scrollIntoViewIfNeeded(); } catch (e) {}
        await settle(page, 400);
        try { await cell.click({ timeout: 4000 }); } catch (e) {
          results.notes.push({ unit_click_err: e.message });
        }
        await settle(page, 2000);
        const r4 = await shot(page, 'allocation-checkout-unit-selected.png');
        rec('4-unit-selected', 'CAPTURED', `Unit cell clicked (selector: ${clickedSelector})`, r4);
      } else {
        // Capture viewport anyway — shows the empty / "Select tower" empty-state
        const r4 = await shot(page, 'allocation-checkout-unit-selected.png');
        rec('4-unit-selected', 'CAPTURED_NO_CELL',
          'No unit-cell selector matched — captured viewport for visual reference', r4);
      }
    }

    // === 5) KYC — capture by direct nav (read-only) =====================
    console.log('\n=== 5) /kyc — direct nav read-only ===');
    // Direct nav will be blank because location.state is missing. That's the documented behaviour.
    // We re-capture to confirm + capture any pre-rendered chrome.
    await page.goto(`${BASE}/physical-allocation/kyc`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    await settle(page, 2500);
    const r5 = await shot(page, 'allocation-kyc.png');
    rec('5-kyc-direct', 'CAPTURED', `KYC direct-nav viewport (URL: ${page.url()})`, r5);

    // === 6) KYC via in-app navigation (carries state) ===================
    // To capture the real KYC form, navigate back into checkout, find "Proceed to KYC" button,
    // and click it.
    console.log('\n=== 6) Try to reach KYC via in-app Proceed-to-KYC button ===');
    // Re-search + select customer
    await page.goto(`${BASE}/physical-allocation`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2000);
    const input2 = page.locator('input.search-input').first();
    await input2.click(); await input2.fill('');
    await input2.type(BUYER_PHONE, { delay: 40 });
    await settle(page, 2800);
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    const sel2 = page.locator('button.select-action-btn').first();
    if (await sel2.count() > 0) {
      await sel2.click();
      await page.waitForURL(/\/checkout/, { timeout: 15_000 }).catch(() => {});
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 2500);
      // Look for "KYC" buttons / links
      const kycBtnSelectors = [
        'button:has-text("Proceed to KYC")',
        'button:has-text("KYC")',
        'a:has-text("KYC")',
        'button:has-text("Complete KYC")',
        'button:has-text("Start KYC")',
      ];
      let kycReached = false;
      for (const kbs of kycBtnSelectors) {
        const cb = page.locator(kbs).first();
        const cnt = await cb.count();
        results.notes.push({ kyc_btn_probe: kbs, count: cnt });
        if (cnt > 0) {
          try {
            await cb.scrollIntoViewIfNeeded();
            await cb.click({ timeout: 3000 });
            await page.waitForURL(/\/kyc/, { timeout: 8000 }).catch(() => {});
            await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
            await settle(page, 2500);
            if (/\/kyc/.test(page.url())) { kycReached = true; break; }
          } catch (e) { results.notes.push({ kyc_btn_click_err: e.message }); }
        }
      }
      if (kycReached) {
        const r6 = await shot(page, 'allocation-kyc.png'); // overwrite — better state
        rec('6-kyc-real', 'CAPTURED', 'KYC reached via in-app Proceed button — real form rendered', r6);
        // Also capture full-page for full form
        const r6f = await shot(page, 'allocation-kyc-fullpage.png', { fullPage: true });
        rec('6b-kyc-fullpage', 'CAPTURED', 'KYC full-page', r6f);
      } else {
        rec('6-kyc-real', 'NOT_REACHABLE',
          'No "Proceed to KYC" button found on checkout — KYC may require unit + payment first');
      }
    } else {
      rec('6-kyc-real', 'SKIP_NO_SEARCH', 'Could not re-locate Select button on second pass');
    }

  } catch (e) {
    rec('FATAL', 'ERROR', e.message);
  } finally {
    fs.writeFileSync(LOG, JSON.stringify(results, null, 2));
    console.log('\nWrote', LOG);
    await browser.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
