// scripts/capture-allocation-missing-states-v4.js
//
// Pass 4 — last attempt for Rounds / Stop / Cancel:
//   - Stopped campaign detail (read-only view should still show Rounds if Rounds is part of the model)
//   - Try the one STATIC type campaign (vs PHYSICAL_EVENT) for Rounds
//   - List ALL detail-page buttons/text on each type so BA Agent can map BRD §10.4 to UI

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'admin', 'allocation');
const URL      = 'https://uat-web.xrportal.in/admin/allocation';
const VIEWPORT = { width: 1920, height: 900 };

const results = {
  '1 (Rounds UI)':              { file: 'allocation-rounds-view.png',   status: 'PENDING', note: '' },
  '4 (Stop Allocation modal)':  { file: 'allocation-stop-modal.png',    status: 'PENDING', note: '' },
  '5 (Cancel Allocation modal)':{ file: 'allocation-cancel-modal.png',  status: 'PENDING', note: '' },
};

const domNotes = { triedPaths: [], staticDetail: {}, stoppedDetail: {}, allButtonsByCampaign: {} };

async function settle(page, ms = 1500) { await page.waitForTimeout(ms); }
async function closeAnyOpenLayer(page) {
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(200); }
  await page.mouse.click(10, 10).catch(() => {}); await page.waitForTimeout(300);
}

async function pickFirstProject(page) {
  const allSelects = page.locator('.ant-select:has(.ant-select-selection-placeholder:has-text("Select Project"))');
  if (await allSelects.count() === 0) return false;
  const target = allSelects.nth((await allSelects.count()) - 1);
  await target.click(); await settle(page, 1000);
  const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
  if (await opts.count() === 0) return false;
  await opts.first().click(); await settle(page, 2500);
  return true;
}

async function clickViewOnRowMatching(page, predicate) {
  const rows = page.locator('tbody.ant-table-tbody tr.ant-table-row');
  const n = await rows.count();
  for (let i = 0; i < n; i++) {
    const r = rows.nth(i);
    const txt = await r.innerText();
    if (predicate(txt, i)) {
      const v = r.locator(':text("View")').first();
      if (await v.count() > 0) {
        await v.scrollIntoViewIfNeeded();
        await v.click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
        await settle(page, 2500);
        return { ok: true, rowText: txt, idx: i };
      }
    }
  }
  return { ok: false };
}

async function inspectDetail(page, label) {
  const detail = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
      .map(b => ({ text: b.innerText.trim(), aria: b.getAttribute('aria-label') || '', disabled: b.disabled }))
      .filter(b => b.text || b.aria);
    const links = Array.from(document.querySelectorAll('a'))
      .map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') || '' }))
      .filter(a => a.text);
    const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab, [role="tab"]'))
      .map(t => t.innerText.trim());
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .map(h => `${h.tagName}: ${h.innerText.trim()}`);
    const body = document.body.innerText.slice(0, 4000);
    return { url: location.href, buttons, links, tabs, headings, body };
  });
  domNotes.allButtonsByCampaign[label] = detail;
  console.log(`  ${label} URL:`, detail.url);
  console.log(`  ${label} headings:`, detail.headings);
  console.log(`  ${label} tabs:`, detail.tabs);
  console.log(`  ${label} buttons:`, detail.buttons.map(b => b.text || b.aria).filter(Boolean));
  console.log(`  ${label} links (top 20):`, detail.links.slice(0, 20).map(l => `${l.text} (${l.href})`));
  return detail;
}

(async () => {
  if (!fs.existsSync(AUTH)) { console.error('No auth file.'); process.exit(1); }
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH, deviceScaleFactor: 1 });
  const page = await context.newPage();

  try {
    // PASS 1 — STATIC campaign detail
    console.log('\n========== PASS 1: STATIC campaign ==========');
    domNotes.triedPaths.push('STATIC campaign');
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);
    await pickFirstProject(page);
    await page.waitForSelector('tbody.ant-table-tbody tr.ant-table-row', { timeout: 15_000 }).catch(() => {});
    await settle(page, 1500);

    const staticClick = await clickViewOnRowMatching(page, (txt) => /STATIC/.test(txt));
    if (staticClick.ok) {
      console.log('  Found STATIC row:', staticClick.rowText.split('\n').slice(0, 3).join(' | '));
      const det = await inspectDetail(page, 'STATIC-Stopped');
      domNotes.staticDetail = det;

      // Rounds check
      if (results['1 (Rounds UI)'].status !== 'CAPTURED') {
        const rounds = page.locator(':text("Round")').first();
        if (await rounds.count() > 0) {
          await rounds.scrollIntoViewIfNeeded();
          await settle(page, 800);
          await page.screenshot({ path: path.join(OUT_DIR, results['1 (Rounds UI)'].file), fullPage: false });
          results['1 (Rounds UI)'].status = 'CAPTURED';
          results['1 (Rounds UI)'].note   = 'Captured on STATIC type campaign (inline).';
          console.log('  CAPTURED Rounds on STATIC.');
        } else {
          // body text doesn't include "Round" — log and move on
          console.log('  No "Round" text on STATIC detail.');
        }
      }

      // Stop / Cancel still — likely won't exist on Stopped, but try anyway
      const stop = page.locator('button:has-text("Stop"):not(:has-text("Stopped"))').first();
      if (await stop.count() > 0) {
        await stop.click(); await settle(page, 1500);
        await page.screenshot({ path: path.join(OUT_DIR, results['4 (Stop Allocation modal)'].file), fullPage: false });
        results['4 (Stop Allocation modal)'].status = 'CAPTURED';
        results['4 (Stop Allocation modal)'].note   = 'Captured on STATIC campaign.';
        await closeAnyOpenLayer(page);
      }
      const cancel = page.locator('button:has-text("Cancel Allocation"), button:has-text("Cancel Campaign"), button[aria-label="Cancel"]').first();
      if (await cancel.count() > 0) {
        await cancel.click(); await settle(page, 1500);
        await page.screenshot({ path: path.join(OUT_DIR, results['5 (Cancel Allocation modal)'].file), fullPage: false });
        results['5 (Cancel Allocation modal)'].status = 'CAPTURED';
        results['5 (Cancel Allocation modal)'].note   = 'Captured on STATIC campaign.';
        await closeAnyOpenLayer(page);
      }
    } else {
      console.log('  No STATIC row found.');
    }

    // Final UNREACHABLE labelling
    for (const k of Object.keys(results)) {
      if (results[k].status === 'PENDING') {
        results[k].status = 'UNREACHABLE';
        if (!results[k].note) results[k].note = 'Not present on any inspected campaign detail. Action may require Active/Upcoming status not present in UAT.';
      }
    }

    console.log('\n========== SUMMARY ==========');
    for (const [tag, r] of Object.entries(results)) {
      console.log(`${r.status.padEnd(12)} ${tag}  ->  ${r.file}  ${r.note ? '(' + r.note + ')' : ''}`);
    }

    fs.writeFileSync(
      path.join(OUT_DIR, '_allocation-capture-notes-v4.json'),
      JSON.stringify({ results, domNotes }, null, 2),
    );
  } finally {
    await context.close();
    await browser.close();
  }
})();
