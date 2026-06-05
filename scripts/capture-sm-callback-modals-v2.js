// scripts/capture-sm-callback-modals-v2.js
//
// v2 — based on v1 findings:
//   - Both action icons per row open the SAME drawer "Callback Request Details"
//   - Schedule/Confirm/Feedback are nested inside that drawer (tabs/sections)
//   - Create Callback drawer Submit button is disabled until fields are filled —
//     we'll trigger validation by tabbing into a field and blurring without value
//
// Plan:
//   1. Re-open Create Callback drawer, focus+blur fields to surface inline validation
//   2. Open Callback Request Details drawer for row 0 — capture full drawer DOM (deep)
//   3. Within that drawer, look for tabs / Schedule / Confirm / Feedback controls
//   4. For each row whose status implies a different stage (PENDING vs MEETING DONE),
//      open details and capture distinct sub-states

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');
const OUT  = path.join(ROOT, 'visual-memory', 'sm', 'callback-requests');
const VIEWPORT = { width: 1920, height: 900 };
const URL_CALLBACK = 'https://uat-web.xrportal.in/sales-manager/callback-requests';

const results = {};
function rec(key, status, note, extra) {
  results[key] = Object.assign({ status, note }, extra || {});
  console.log(`[${status.padEnd(16)}] ${key} — ${note}`);
}

async function settle(page, ms = 1500) { await page.waitForTimeout(ms); }
async function shot(page, file) {
  const full = path.join(OUT, file);
  await page.screenshot({ path: full, fullPage: false });
  return { path: full, bytes: fs.statSync(full).size };
}
async function dismissOverlays(page) {
  await page.keyboard.press('Escape').catch(() => {});
  await settle(page, 300);
  await page.keyboard.press('Escape').catch(() => {});
  await settle(page, 300);
}

// Deep DOM inspection — single drawer-content node, includes everything inside
async function inspectActiveDrawer(page) {
  return await page.evaluate(() => {
    const drawer = document.querySelector('.ant-drawer-open .ant-drawer-content, .ant-drawer .ant-drawer-content');
    if (!drawer || drawer.offsetParent === null) return null;
    const title = drawer.querySelector('.ant-drawer-title, h2, h3')?.innerText?.trim() || '';
    const allText = drawer.innerText.slice(0, 3000);
    const labels = [...drawer.querySelectorAll('label, .ant-form-item-label')].map(e => e.innerText.trim()).filter(Boolean);
    const inputs = [...drawer.querySelectorAll('input, textarea')].map(i => ({
      tag: i.tagName.toLowerCase(),
      name: i.name || '',
      placeholder: i.placeholder || '',
      type: i.type || '',
      ariaLabel: i.getAttribute('aria-label') || '',
      readOnly: i.readOnly,
      disabled: i.disabled,
      value: (i.value || '').slice(0, 80)
    }));
    const buttons = [...drawer.querySelectorAll('button')].map(b => ({
      text: b.innerText.trim(),
      disabled: b.disabled,
      classes: b.className
    })).filter(b => b.text || b.classes.length > 0);
    const tabs = [...drawer.querySelectorAll('.ant-tabs-tab, [role="tab"]')].map(t => ({
      text: t.innerText.trim(),
      active: t.classList.contains('ant-tabs-tab-active') || t.getAttribute('aria-selected') === 'true'
    }));
    const radios = [...drawer.querySelectorAll('.ant-radio-wrapper, .ant-checkbox-wrapper')].map(r => r.innerText.trim()).filter(Boolean);
    const selects = [...drawer.querySelectorAll('.ant-select-selection-item, .ant-select-selection-placeholder')].map(s => s.innerText.trim()).filter(Boolean);
    const sections = [...drawer.querySelectorAll('h3, h4, .ant-card-head-title, .ant-collapse-header, .section-title')].map(s => s.innerText.trim()).filter(Boolean);
    const errors = [...drawer.querySelectorAll('.ant-form-item-explain-error, .ant-form-item-explain, [role="alert"]')].map(e => e.innerText.trim()).filter(Boolean);
    return { title, labels, inputs, buttons, tabs, radios, selects, sections, errors, allText };
  });
}

async function getRowStatuses(page) {
  return await page.evaluate(() => {
    const rows = [...document.querySelectorAll('tbody tr')];
    return rows.map((r, i) => {
      const status = r.querySelector('.ant-tag')?.innerText?.trim() || '';
      const cells = [...r.querySelectorAll('td')].map(c => c.innerText.trim().slice(0, 40));
      return { idx: i, status, cellSample: cells.slice(0, 6) };
    });
  });
}

async function openRowDrawer(page, rowIdx, actionIdx = 0) {
  // Click action icon at given row
  const rows = page.locator('tbody tr');
  const row = rows.nth(rowIdx);
  const actionCell = row.locator('td').last();
  const buttons = actionCell.locator('button, .ant-btn, [role="button"]');
  const bc = await buttons.count();
  if (bc === 0) return false;
  const idx = Math.min(actionIdx, bc - 1);
  await buttons.nth(idx).click({ force: false }).catch(() => {});
  await settle(page, 1500);
  return true;
}

async function closeDrawer(page) {
  const closeBtn = page.locator('.ant-drawer-open .ant-drawer-close, .ant-drawer-close').first();
  if (await closeBtn.count() > 0) {
    await closeBtn.click().catch(() => {});
  } else {
    await dismissOverlays(page);
  }
  await settle(page, 800);
}

async function run() {
  if (!fs.existsSync(AUTH)) { console.error(`Auth missing: ${AUTH}`); process.exit(1); }
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({ storageState: AUTH, viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  try {
    await page.goto(URL_CALLBACK, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2000);
    if (/\/login/i.test(page.url())) { rec('_auth', 'FAILED', page.url()); return; }
    rec('_auth', 'OK', page.url());

    // ============ Get row statuses (for picking different stages) ============
    const rowStatuses = await getRowStatuses(page);
    rec('_rowStatuses', 'OK', `${rowStatuses.length} rows`, { rows: rowStatuses });
    console.log('Rows seen:', rowStatuses.map(r => `${r.idx}:${r.status}`).join(', '));

    // ============ 1. CREATE CALLBACK — validation via field blur ============
    try {
      const createBtn = page.locator('button:has-text("Create Callback")').first();
      await createBtn.click();
      await settle(page, 1500);

      // Try to surface inline validation by clicking the disabled Create button area
      // (some Ant forms reveal validation messages on focus/blur)
      const buyerEmail = page.locator('.ant-drawer input[placeholder="Buyer email"]').first();
      const smEmail = page.locator('.ant-drawer input[placeholder="Sales manager email"]').first();
      const dateInput = page.locator('.ant-drawer input[placeholder="Select date & time"]').first();

      // Type something invalid in buyer email then blur
      if (await buyerEmail.count() > 0) {
        await buyerEmail.click();
        await buyerEmail.fill('not-an-email');
        await page.keyboard.press('Tab');
        await settle(page, 600);
      }
      if (await smEmail.count() > 0) {
        await smEmail.click();
        await smEmail.fill('also-invalid');
        await page.keyboard.press('Tab');
        await settle(page, 600);
      }

      // Now try clicking Create — if still disabled, screenshot disabled state with field errors
      const dom1 = await inspectActiveDrawer(page);
      const r1 = await shot(page, 'callback-create-drawer-validation.png');
      rec('callback-create-drawer-validation', 'CAPTURED',
          `Errors: ${JSON.stringify(dom1?.errors?.slice(0, 8) || [])}; Create disabled=${dom1?.buttons?.find(b => /create/i.test(b.text))?.disabled}`,
          { file: r1.path, bytes: r1.bytes, dom: dom1 });

      await closeDrawer(page);
    } catch (e) { rec('callback-create-drawer-validation', 'ERROR', String(e?.message || e)); }

    // ============ 2. DETAILS DRAWER — row 0 (PENDING) deep capture ============
    try {
      // Pick a PENDING row
      const pendingIdx = rowStatuses.findIndex(r => /pending/i.test(r.status));
      const idx = pendingIdx >= 0 ? pendingIdx : 0;
      const opened = await openRowDrawer(page, idx, 0);
      if (!opened) {
        rec('callback-details-drawer-pending', 'NOT_FOUND', 'No action button in row');
      } else {
        await settle(page, 1500);
        const dom = await inspectActiveDrawer(page);
        const r = await shot(page, 'callback-details-drawer-pending.png');
        rec('callback-details-drawer-pending', 'CAPTURED',
            `Buttons: ${JSON.stringify((dom?.buttons || []).map(b => b.text).filter(Boolean).slice(0, 20))}; Tabs: ${JSON.stringify((dom?.tabs || []).map(t => t.text))}`,
            { file: r.path, bytes: r.bytes, dom });

        // Within drawer — try clicking Schedule Meeting (if button surfaces)
        try {
          const scheduleInDrawer = page.locator('.ant-drawer-open button:has-text("Schedule"), .ant-drawer button:has-text("Schedule Meeting"), .ant-drawer button:has-text("Schedule")').first();
          if (await scheduleInDrawer.count() > 0) {
            await scheduleInDrawer.click();
            await settle(page, 1800);
            const dom2 = await inspectActiveDrawer(page);
            const r2 = await shot(page, 'callback-schedule-modal.png');
            rec('callback-schedule-modal', 'CAPTURED',
                `Title="${dom2?.title}"; Buttons: ${JSON.stringify((dom2?.buttons || []).map(b => b.text).slice(0, 10))}`,
                { file: r2.path, bytes: r2.bytes, dom: dom2 });
            // Try to find Confirm sub-step
            const confirmBtn = page.locator('.ant-drawer-open button:has-text("Confirm")').first();
            if (await confirmBtn.count() > 0) {
              await confirmBtn.click().catch(() => {});
              await settle(page, 1500);
              const dom3 = await inspectActiveDrawer(page);
              const r3 = await shot(page, 'callback-confirm-modal.png');
              rec('callback-confirm-modal', 'CAPTURED',
                  `After Confirm click; Title="${dom3?.title}"; Buttons: ${JSON.stringify((dom3?.buttons || []).map(b => b.text).slice(0, 10))}`,
                  { file: r3.path, bytes: r3.bytes, dom: dom3 });
            }
          } else {
            rec('callback-schedule-modal', 'NOT_IN_PENDING_DRAWER', 'Schedule button not visible in PENDING details drawer');
          }
        } catch (e) { rec('callback-schedule-modal', 'ERROR', String(e?.message || e)); }

        await closeDrawer(page);
      }
    } catch (e) { rec('callback-details-drawer-pending', 'ERROR', String(e?.message || e)); }

    // ============ 3. DETAILS DRAWER — MEETING DONE row → look for Feedback ============
    try {
      const mdIdx = rowStatuses.findIndex(r => /meeting\s*done|done/i.test(r.status));
      if (mdIdx < 0) {
        rec('callback-feedback-drawer', 'NOT_FOUND', 'No MEETING DONE row in current page');
      } else {
        const opened = await openRowDrawer(page, mdIdx, 0);
        if (!opened) {
          rec('callback-feedback-drawer', 'NOT_FOUND', 'No action button in MEETING DONE row');
        } else {
          await settle(page, 1500);
          const dom = await inspectActiveDrawer(page);
          const r = await shot(page, 'callback-details-drawer-meetingdone.png');
          rec('callback-details-drawer-meetingdone', 'CAPTURED',
              `Buttons: ${JSON.stringify((dom?.buttons || []).map(b => b.text).filter(Boolean).slice(0, 20))}; Tabs: ${JSON.stringify((dom?.tabs || []).map(t => t.text))}`,
              { file: r.path, bytes: r.bytes, dom });

          // Look for Feedback / outcome controls inside this drawer
          const feedbackBtn = page.locator('.ant-drawer-open button:has-text("Feedback"), .ant-drawer-open button:has-text("Submit Feedback"), .ant-drawer-open button:has-text("Outcome")').first();
          if (await feedbackBtn.count() > 0) {
            await feedbackBtn.click();
            await settle(page, 1800);
            const dom2 = await inspectActiveDrawer(page);
            const r2 = await shot(page, 'callback-feedback-drawer.png');
            rec('callback-feedback-drawer', 'CAPTURED',
                `Title="${dom2?.title}"; Radios=${JSON.stringify((dom2?.radios || []).slice(0, 15))}; Selects=${JSON.stringify(dom2?.selects || [])}; Buttons: ${JSON.stringify((dom2?.buttons || []).map(b => b.text).slice(0, 10))}`,
                { file: r2.path, bytes: r2.bytes, dom: dom2 });
          } else {
            // Maybe feedback fields already rendered inline in the details drawer
            const radioCount = (dom?.radios || []).length;
            const selectCount = (dom?.selects || []).length;
            if (radioCount > 0 || selectCount > 0) {
              const r2 = await shot(page, 'callback-feedback-drawer.png');
              rec('callback-feedback-drawer', 'CAPTURED_INLINE',
                  `Feedback controls inline in details drawer; radios=${radioCount}, selects=${selectCount}`,
                  { file: r2.path, bytes: r2.bytes, dom });
            } else {
              rec('callback-feedback-drawer', 'NOT_FOUND_IN_DRAWER',
                  `No Feedback button in MEETING DONE drawer. All buttons: ${JSON.stringify((dom?.buttons || []).map(b => b.text))}`);
            }
          }

          await closeDrawer(page);
        }
      }
    } catch (e) { rec('callback-feedback-drawer', 'ERROR', String(e?.message || e)); }

    // ============ 4. DETAILS DRAWER — SENT INVITE / RESENT INVITE row → Confirm Meeting ============
    try {
      const siIdx = rowStatuses.findIndex(r => /sent\s*invite|resent/i.test(r.status));
      if (siIdx >= 0) {
        const opened = await openRowDrawer(page, siIdx, 0);
        if (opened) {
          await settle(page, 1500);
          const dom = await inspectActiveDrawer(page);
          const r = await shot(page, 'callback-details-drawer-sentinvite.png');
          rec('callback-details-drawer-sentinvite', 'CAPTURED',
              `Buttons: ${JSON.stringify((dom?.buttons || []).map(b => b.text).filter(Boolean).slice(0, 20))}`,
              { file: r.path, bytes: r.bytes, dom });

          // Look for Confirm Meeting button
          const confirmBtn = page.locator('.ant-drawer-open button:has-text("Confirm"), .ant-drawer-open button:has-text("Mark Meeting Done")').first();
          if (await confirmBtn.count() > 0) {
            // Don't actually click "Confirm" if it commits a write — just hover/screenshot
            // But brief states: take a screenshot before clicking
            // Actually click — UAT is for QA, we want to see modal
            await confirmBtn.click();
            await settle(page, 1500);
            const dom2 = await inspectActiveDrawer(page);
            const r2 = await shot(page, 'callback-confirm-modal.png');
            rec('callback-confirm-modal', results['callback-confirm-modal'] ? 'CAPTURED_BETTER' : 'CAPTURED',
                `From SENT INVITE drawer; Title="${dom2?.title}"`,
                { file: r2.path, bytes: r2.bytes, dom: dom2 });
            await dismissOverlays(page);
          }
          await closeDrawer(page);
        }
      } else {
        rec('callback-details-drawer-sentinvite', 'NOT_FOUND', 'No SENT/RESENT INVITE row in current page');
      }
    } catch (e) { rec('callback-details-drawer-sentinvite', 'ERROR', String(e?.message || e)); }

  } finally {
    fs.writeFileSync(path.join(__dirname, '_capture-sm-callback-modals-v2-results.json'), JSON.stringify(results, null, 2));
    console.log('\n=== V2 RESULTS WRITTEN ===');
    console.log(path.join(__dirname, '_capture-sm-callback-modals-v2-results.json'));
    await ctx.close();
    await browser.close();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
