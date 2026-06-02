// scripts/capture-towers-missing-states.js
//
// One-off capture script for Admin Portal / Towers — 6 missing UI states
// blocking Conditional TCs from Approved status.
//
// Findings from DOM inspection (see _capture-notes.json):
//   * Heatmap cells are rendered as `.unit-size-item.<status>` wrappers
//     around `.unit-number.<status-unit>` children.
//     Status modifiers observed on Crest:
//       .booked / .booked-unit            -> RED   rgb(214,24,32)  (90)
//       .available / .available-unit      -> WHITE rgb(255,255,255) bordered (84)
//       .reserved / .disabled-unit        -> GREY  rgba(114,114,114,0.776) (84)
//       .hold / .paying-hold              -> ORANGE rgb(255,165,0)  (3)
//       .not_available / .not-available-unit -> WHITE (13)
//       .refuge / .refuse-area refuge-unit -> light grey "REFUGE" (6)
//   * Clicking a `.unit-size-item` wrapper opens a UNIT-DETAIL panel inline
//     in the RIGHT PANE (replaces the unit-type legend strip).  It is NOT
//     an `.ant-drawer` or `.ant-modal` — it's a custom side panel.  React
//     onClick handler is on `.unit-size-item`.
//   * Tower page has NO "View Tower >" deep-link.  Instead, the FLOW IS
//     REVERSED: `/admin/cms` (Config) is the landing that lists all 18
//     towers, each with an Active/Inactive switch and a "View Tower"
//     button which navigates BACK to `/admin/towers` filtered to that
//     tower.  The "unit-status toggle" referenced in the task is actually
//     the TOWER-level Active/Inactive switch on the Config page — there
//     is no per-unit toggle in this UAT build.
//
// Capture targets:
//   VG-1: Unit detail panel (click a regular available cell)  -> towers-unit-detail-drawer.png
//   VG-2: Red cell clicked (booked unit, drawer populated)    -> towers-red-cell-clicked.png
//   VG-3: Orange cell clicked (paying-hold unit, drawer pop.) -> towers-orange-cell-clicked.png
//   VG-4: Config landing (/admin/cms) - the reverse deep-link -> towers-config-deeplink-landing.png
//   VG-5: Tower status toggle BEFORE                           -> towers-unit-status-before-toggle.png
//   VG-6: Tower status toggle AFTER                            -> towers-unit-status-after-toggle.png
//
// Usage:
//   node scripts/capture-towers-missing-states.js

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'admin', 'towers');
const TOWERS_URL = 'https://uat-web.xrportal.in/admin/towers';
const CONFIG_URL = 'https://uat-web.xrportal.in/admin/cms';
const VIEWPORT = { width: 1920, height: 900 };

const results = {
  'VG-1 (Unit detail drawer)':         { file: 'towers-unit-detail-drawer.png',         status: 'PENDING', note: '' },
  'VG-2 (Red cell clicked)':           { file: 'towers-red-cell-clicked.png',           status: 'PENDING', note: '' },
  'VG-3 (Orange cell clicked)':        { file: 'towers-orange-cell-clicked.png',        status: 'PENDING', note: '' },
  'VG-4 (Config deep-link landing)':   { file: 'towers-config-deeplink-landing.png',    status: 'PENDING', note: '' },
  'VG-5 (Tower status before toggle)': { file: 'towers-unit-status-before-toggle.png',  status: 'PENDING', note: '' },
  'VG-6 (Tower status after toggle)':  { file: 'towers-unit-status-after-toggle.png',   status: 'PENDING', note: '' },
};

const domNotes = {
  cellTaxonomy: {
    'unit-size-item.booked'         : { count: 90, color: 'rgb(214,24,32)',         status: 'BOOKED'        },
    'unit-size-item.available'      : { count: 84, color: 'rgb(255,255,255) border',status: 'AVAILABLE'     },
    'unit-size-item.reserved'       : { count: 84, color: 'rgba(114,114,114,0.776)',status: 'DISABLED'      },
    'unit-size-item.hold'           : { count: 3,  color: 'rgb(255,165,0)',         status: 'PAYING_HOLD'   },
    'unit-size-item.not_available'  : { count: 13, color: 'rgb(255,255,255)',       status: 'NOT_AVAILABLE' },
    'unit-size-item.refuge'         : { count: 6,  color: 'rgb(230,230,230)',       status: 'REFUGE'        },
  },
  unitDetailPanel: {},
  redCellPanel:    {},
  orangeCellPanel: {},
  configLanding:   {},
  toggle:          {},
};

async function settle(page, ms = 1500) { await page.waitForTimeout(ms); }

// Inspect the right pane after a cell click — the unit-detail panel is
// rendered inline.  We grab the rightmost large content block.
async function inspectUnitDetailPanel(page) {
  return await page.evaluate(() => {
    // Heuristic: find the rightmost visible large block whose innerText
    // contains a known unit-detail label ("Unit Code" / "Phone" / "Agreement Value").
    const all = Array.from(document.querySelectorAll('div, section, aside'));
    let best = null;
    for (const el of all) {
      const t = (el.innerText || '').trim();
      if (!t || t.length < 30) continue;
      if (!/Unit Code|Agreement Value|Registration Number|Phone/i.test(t)) continue;
      if (el.offsetWidth < 200 || el.offsetHeight < 200) continue;
      // Prefer smaller wrappers (closer to the panel itself)
      if (!best || t.length < (best.innerText || '').length) best = el;
    }
    if (!best) return { found: false };
    const labels = Array.from(best.querySelectorAll('label, dt, .field-label, .info-label, p, span'))
      .map(e => (e.innerText || '').trim())
      .filter(s => s && s.length < 40)
      .slice(0, 50);
    return {
      found: true,
      text:  (best.innerText || '').slice(0, 1200),
      cls:   (best.className && best.className.toString ? best.className.toString() : '').slice(0, 200),
      tag:   best.tagName.toLowerCase(),
      width: best.offsetWidth,
      height: best.offsetHeight,
      sampleLabels: [...new Set(labels)].slice(0, 30),
    };
  });
}

// Click a unit cell wrapper matching the given .unit-size-item modifier class.
// Returns { ok, text, cls } or { ok:false }.
async function clickFirstCellOfType(page, modifierClass) {
  const sel = `.unit-size-item.${modifierClass}`;
  const el  = page.locator(sel).first();
  const cnt = await el.count();
  if (cnt === 0) return { ok: false, sel, note: 'No cell of this type' };
  await el.scrollIntoViewIfNeeded();
  const unitText = await el.locator('.unit-number').first().innerText().catch(() => '');
  await el.click();
  return { ok: true, sel, unitText: unitText.trim() };
}

async function closeAnyOpenLayer(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(200);
  }
  await page.mouse.click(5, 5).catch(() => {});
  await page.waitForTimeout(300);
}

(async () => {
  if (!fs.existsSync(AUTH)) {
    console.error(`ERROR: Auth file not found at ${AUTH}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH });
  const page = await context.newPage();

  try {
    console.log('Navigating to', TOWERS_URL);
    await page.goto(TOWERS_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await settle(page, 2500);

    if (!page.url().includes('/admin/towers')) {
      console.error(`Auth failed — redirected to ${page.url()}`);
      process.exit(2);
    }
    console.log('On Towers page (default tower "Crest").');

    // Wait for heatmap cells to be present
    await page.waitForSelector('.unit-size-item', { timeout: 15_000 }).catch(() => {});
    await settle(page, 1500);

    // ------------------------------------------------------------------
    // VG-1 — Unit detail drawer (click an AVAILABLE cell)
    // ------------------------------------------------------------------
    console.log('\n[VG-1] Unit detail drawer — clicking an AVAILABLE cell');
    try {
      const c = await clickFirstCellOfType(page, 'available');
      console.log('  click result:', c);
      if (!c.ok) {
        results['VG-1 (Unit detail drawer)'].status = 'UNREACHABLE';
        results['VG-1 (Unit detail drawer)'].note   = 'No .unit-size-item.available cell present on default Crest tower.';
      } else {
        await settle(page, 1500);
        const panel = await inspectUnitDetailPanel(page);
        domNotes.unitDetailPanel = { clickedUnit: c.unitText, type: 'available', ...panel };
        await page.screenshot({ path: path.join(OUT_DIR, results['VG-1 (Unit detail drawer)'].file), fullPage: false });
        results['VG-1 (Unit detail drawer)'].status = panel.found ? 'CAPTURED' : 'CAPTURED_NO_PANEL';
        results['VG-1 (Unit detail drawer)'].note   = panel.found ? '' : 'Cell click recorded selected-class but no unit-detail panel labels detected.';
        console.log('  CAPTURED:', results['VG-1 (Unit detail drawer)'].file, '| panel.found =', panel.found);
        if (panel.found) console.log('  Labels:', panel.sampleLabels);
      }
    } catch (e) {
      results['VG-1 (Unit detail drawer)'].note = e.message;
      console.log('  ERROR:', e.message);
    }

    // Reload to reset the selected state for the next capture.
    await page.goto(TOWERS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await settle(page, 2500);
    await page.waitForSelector('.unit-size-item', { timeout: 15_000 }).catch(() => {});

    // ------------------------------------------------------------------
    // VG-2 — Red cell click (booked)
    // ------------------------------------------------------------------
    console.log('\n[VG-2] Red cell click — BOOKED');
    try {
      const c = await clickFirstCellOfType(page, 'booked');
      console.log('  click result:', c);
      if (!c.ok) {
        results['VG-2 (Red cell clicked)'].status = 'UNREACHABLE';
        results['VG-2 (Red cell clicked)'].note   = 'No .unit-size-item.booked cell present.';
      } else {
        await settle(page, 1500);
        const panel = await inspectUnitDetailPanel(page);
        domNotes.redCellPanel = { clickedUnit: c.unitText, type: 'booked', ...panel };
        await page.screenshot({ path: path.join(OUT_DIR, results['VG-2 (Red cell clicked)'].file), fullPage: false });
        results['VG-2 (Red cell clicked)'].status = panel.found ? 'CAPTURED' : 'CAPTURED_NO_PANEL';
        console.log('  CAPTURED:', results['VG-2 (Red cell clicked)'].file, '| panel.found =', panel.found);
        if (panel.found) console.log('  Labels:', panel.sampleLabels);
      }
    } catch (e) {
      results['VG-2 (Red cell clicked)'].note = e.message;
      console.log('  ERROR:', e.message);
    }

    // Reload again before next capture
    await page.goto(TOWERS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await settle(page, 2500);
    await page.waitForSelector('.unit-size-item', { timeout: 15_000 }).catch(() => {});

    // ------------------------------------------------------------------
    // VG-3 — Orange cell click (paying-hold / registered)
    // ------------------------------------------------------------------
    console.log('\n[VG-3] Orange cell click — PAYING_HOLD');
    try {
      const c = await clickFirstCellOfType(page, 'hold');
      console.log('  click result:', c);
      if (!c.ok) {
        results['VG-3 (Orange cell clicked)'].status = 'UNREACHABLE';
        results['VG-3 (Orange cell clicked)'].note   = 'No .unit-size-item.hold cell present on default Crest tower.';
      } else {
        await settle(page, 1500);
        const panel = await inspectUnitDetailPanel(page);
        domNotes.orangeCellPanel = { clickedUnit: c.unitText, type: 'hold', ...panel };
        await page.screenshot({ path: path.join(OUT_DIR, results['VG-3 (Orange cell clicked)'].file), fullPage: false });
        results['VG-3 (Orange cell clicked)'].status = panel.found ? 'CAPTURED' : 'CAPTURED_NO_PANEL';
        console.log('  CAPTURED:', results['VG-3 (Orange cell clicked)'].file, '| panel.found =', panel.found);
        if (panel.found) console.log('  Labels:', panel.sampleLabels);
      }
    } catch (e) {
      results['VG-3 (Orange cell clicked)'].note = e.message;
      console.log('  ERROR:', e.message);
    }

    // ------------------------------------------------------------------
    // VG-4 — Config landing (the "deep link" actually originates FROM Config)
    // ------------------------------------------------------------------
    console.log('\n[VG-4] Config landing — /admin/cms');
    try {
      await page.goto(CONFIG_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await settle(page, 2500);
      const landed = page.url();
      const inspect = await page.evaluate(() => {
        const viewTowerBtns = Array.from(document.querySelectorAll('button')).filter(b => /^view tower$/i.test((b.innerText || '').trim()));
        const switches     = Array.from(document.querySelectorAll('.ant-switch, [role="switch"]'));
        const update       = Array.from(document.querySelectorAll('button')).find(b => /update tower configuration/i.test((b.innerText || '').trim()));
        const sample       = Array.from(document.querySelectorAll('button')).find(b => /sample file download/i.test((b.innerText || '').trim()));
        const towerRows    = Array.from(document.querySelectorAll('tr, .ant-list-item, .tower-row')).filter(r => /Active/.test(r.innerText || ''));
        return {
          url: location.href,
          viewTowerCount: viewTowerBtns.length,
          switchCount:    switches.length,
          updateBtnPresent: !!update,
          sampleBtnPresent: !!sample,
          towerRowCountGuess: towerRows.length,
        };
      });
      domNotes.configLanding = { url: landed, ...inspect };
      await page.screenshot({ path: path.join(OUT_DIR, results['VG-4 (Config deep-link landing)'].file), fullPage: false });
      results['VG-4 (Config deep-link landing)'].status = 'CAPTURED';
      results['VG-4 (Config deep-link landing)'].note = `Captured /admin/cms — found ${inspect.viewTowerCount} "View Tower" buttons and ${inspect.switchCount} Active/Inactive switches. NOTE: original task assumed deep-link FROM towers TO config, but actual flow is the reverse — config IS the entry point.`;
      console.log('  CAPTURED. Inspect:', inspect);
    } catch (e) {
      results['VG-4 (Config deep-link landing)'].note = e.message;
      console.log('  ERROR:', e.message);
    }

    // ------------------------------------------------------------------
    // VG-5 + VG-6 — Tower-level Active/Inactive switch on /admin/cms
    // (no UNIT-level toggle exists in this UAT build; we document this
    //  explicitly in the INDEX.md and proceed with tower-level switch)
    // ------------------------------------------------------------------
    console.log('\n[VG-5 + VG-6] Tower Active/Inactive switch (Config page)');
    try {
      // Ensure on /admin/cms
      if (!page.url().includes('/admin/cms')) {
        await page.goto(CONFIG_URL, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
        await settle(page, 2500);
      }

      // Find an inactive (unchecked) switch we can flip to checked, so we
      // can SAFELY revert later.  Otherwise pick the first checked switch.
      const switchInfo = await page.evaluate(() => {
        const list = Array.from(document.querySelectorAll('.ant-switch'));
        return list.map((s, i) => ({
          index:   i,
          checked: s.classList.contains('ant-switch-checked'),
          aria:    s.getAttribute('aria-checked'),
          near:    (s.closest('tr')?.innerText || s.parentElement?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        }));
      });
      console.log(`  Found ${switchInfo.length} switches. First 5:`, switchInfo.slice(0, 5));
      domNotes.toggle.allSwitches = switchInfo;

      // Prefer an unchecked one so we toggle off->on->off
      let targetIdx = switchInfo.findIndex(s => !s.checked);
      let willRevertToOn = false;
      if (targetIdx === -1) {
        targetIdx = 0;
        willRevertToOn = false; // currently on, we'll flip on->off->on
      } else {
        willRevertToOn = true;
      }
      const beforeChecked = switchInfo[targetIdx]?.checked;
      console.log(`  Targeting switch index=${targetIdx} (currently ${beforeChecked ? 'ON' : 'OFF'})`);

      // Scroll target into view and capture BEFORE.
      await page.evaluate((idx) => {
        const s = document.querySelectorAll('.ant-switch')[idx];
        if (s) s.scrollIntoView({ block: 'center', inline: 'center' });
      }, targetIdx);
      await settle(page, 600);
      await page.screenshot({ path: path.join(OUT_DIR, results['VG-5 (Tower status before toggle)'].file), fullPage: false });
      results['VG-5 (Tower status before toggle)'].status = 'CAPTURED';
      console.log('  VG-5 CAPTURED (before).');

      // Toggle it
      await page.evaluate((idx) => {
        const s = document.querySelectorAll('.ant-switch')[idx];
        if (s) s.click();
      }, targetIdx);
      await settle(page, 1500);

      // If a confirmation dialog appears, accept it
      const confirm = page.locator('.ant-modal-content button:has-text("Yes"), .ant-modal-content button:has-text("Confirm"), .ant-popover button:has-text("Yes"), .ant-popover button:has-text("Confirm")').first();
      if (await confirm.count() > 0) {
        console.log('  Confirmation dialog detected — accepting.');
        await confirm.click().catch(() => {});
        await settle(page, 1500);
      }

      await page.screenshot({ path: path.join(OUT_DIR, results['VG-6 (Tower status after toggle)'].file), fullPage: false });
      results['VG-6 (Tower status after toggle)'].status = 'CAPTURED';
      console.log('  VG-6 CAPTURED (after).');

      // Read back state
      const afterState = await page.evaluate((idx) => {
        const s = document.querySelectorAll('.ant-switch')[idx];
        if (!s) return null;
        return { aria: s.getAttribute('aria-checked'), checked: s.classList.contains('ant-switch-checked') };
      }, targetIdx);
      domNotes.toggle.targetIdx     = targetIdx;
      domNotes.toggle.beforeChecked = beforeChecked;
      domNotes.toggle.afterState    = afterState;
      console.log('  Before:', beforeChecked, 'After:', afterState);

      // Revert: click the switch again to restore prior state (best-effort).
      console.log('  Reverting toggle to original state...');
      await page.evaluate((idx) => {
        const s = document.querySelectorAll('.ant-switch')[idx];
        if (s) s.click();
      }, targetIdx);
      await settle(page, 1500);
      const confirm2 = page.locator('.ant-modal-content button:has-text("Yes"), .ant-modal-content button:has-text("Confirm"), .ant-popover button:has-text("Yes"), .ant-popover button:has-text("Confirm")').first();
      if (await confirm2.count() > 0) {
        await confirm2.click().catch(() => {});
        await settle(page, 1500);
      }
      const revertedState = await page.evaluate((idx) => {
        const s = document.querySelectorAll('.ant-switch')[idx];
        if (!s) return null;
        return { aria: s.getAttribute('aria-checked'), checked: s.classList.contains('ant-switch-checked') };
      }, targetIdx);
      console.log('  Reverted state:', revertedState);
      domNotes.toggle.revertedState = revertedState;

    } catch (e) {
      results['VG-5 (Tower status before toggle)'].note = e.message;
      results['VG-6 (Tower status after toggle)'].note  = e.message;
      console.log('  ERROR:', e.message);
    }

    // ------------------------------------------------------------------
    // Summary + notes
    // ------------------------------------------------------------------
    console.log('\n========== SUMMARY ==========');
    for (const [vg, r] of Object.entries(results)) {
      console.log(`${r.status.padEnd(20)} ${vg}  ->  ${r.file}  ${r.note ? '(' + r.note + ')' : ''}`);
    }

    const notesPath = path.join(OUT_DIR, '_capture-notes.json');
    fs.writeFileSync(notesPath, JSON.stringify({ results, domNotes }, null, 2));
    console.log('\nDOM notes written to:', path.relative(ROOT, notesPath));

  } finally {
    await context.close();
    await browser.close();
  }
})();
