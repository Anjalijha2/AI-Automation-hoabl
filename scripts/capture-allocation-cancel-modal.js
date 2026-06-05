// scripts/capture-allocation-cancel-modal.js
//
// Targeted re-capture: Cancel Allocation confirmation modal for the
// "PE QA : Camp Test 3" Upcoming campaign.
//
// Two-phase strategy (Phase B added after Phase A returned 0 rows on the
// initial Upcoming-filter attempt):
//   Phase A — pick first project, filter Status = Upcoming, search by name.
//   Phase B — clear status filter (All Status), search by name only, then
//             pick the row that contains TARGET_CAMPAIGN regardless of status.
//             Dump the row text so we know the actual status surfaced.
//
// Guard rails:
//   - Never click a button whose label matches /yes|confirm|cancel allocation/i
//     after the modal opens. Always dismiss via the safe button (Close /
//     Cancel / No) or Escape.

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'admin', 'allocation');
const URL      = 'https://uat-web.xrportal.in/admin/allocation';
const VIEWPORT = { width: 1920, height: 900 };

const TARGET_CAMPAIGN = 'PE QA : Camp Test 3';

const result = {
  campaign: TARGET_CAMPAIGN,
  file:     'allocation-cancel-modal.png',
  status:   'PENDING',
  note:     '',
  selectors: {},
};

const evidence = {
  phase:               '',
  projectsAvailable:   [],
  projectsTried:       [],
  rowCountByPhase:     {},
  matchedRowStatus:    '',
  matchedRowText:      '',
  rowActionsHtml:      '',
  rowActionsButtons:   [],
  rowActionsLinks:     [],
  allRowsSnapshot:     [],
  modal:               null,
  log:                 [],
};

function log(msg) { console.log(msg); evidence.log.push(msg); }
async function settle(page, ms = 1500) { await page.waitForTimeout(ms); }

async function closeAnyOpenLayer(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(250);
  }
  await page.mouse.click(10, 10).catch(() => {});
  await page.waitForTimeout(300);
}

async function listAllProjects(page) {
  // Open the filter-bar project select (last "Select Project" placeholder).
  const allSelects = page.locator('.ant-select:has(.ant-select-selection-placeholder:has-text("Select Project"))');
  const count = await allSelects.count();
  if (count === 0) return [];
  const target = allSelects.nth(count - 1);
  await target.click();
  await settle(page, 1000);
  const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
  const n = await opts.count();
  const list = [];
  for (let i = 0; i < n; i++) {
    list.push(((await opts.nth(i).innerText().catch(() => '')) || '').trim());
  }
  // Close the dropdown without picking.
  await closeAnyOpenLayer(page);
  return list;
}

async function pickProjectByName(page, name) {
  const allSelects = page.locator('.ant-select:has(.ant-select-selection-placeholder:has-text("Select Project")), .ant-select.ant-select-show-arrow');
  // Prefer the one that still shows the placeholder; otherwise click any.
  let target = page.locator('.ant-select:has(.ant-select-selection-placeholder:has-text("Select Project"))').last();
  if (await target.count() === 0) {
    target = allSelects.last();
  }
  await target.click();
  await settle(page, 900);
  const opt = page.locator(`.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text("${name}")`).first();
  if (await opt.count() === 0) { await closeAnyOpenLayer(page); return false; }
  await opt.click();
  await settle(page, 2500);
  log(`  project picked = "${name}"`);
  return true;
}

async function pickStatus(page, statusLabel) {
  // Open the Status filter (the Ant Select that currently shows All Status,
  // or one of the status values from a prior selection).
  const candidates = page.locator(
    '.ant-select:has(.ant-select-selection-item:has-text("All Status")), ' +
    '.ant-select:has(.ant-select-selection-placeholder:has-text("All Status")), ' +
    '.ant-select:has(.ant-select-selection-item:has-text("Active")), ' +
    '.ant-select:has(.ant-select-selection-item:has-text("Upcoming")), ' +
    '.ant-select:has(.ant-select-selection-item:has-text("Completed")), ' +
    '.ant-select:has(.ant-select-selection-item:has-text("Stopped")), ' +
    '.ant-select:has(.ant-select-selection-item:has-text("Cancelled")), ' +
    '.ant-select:has(.ant-select-selection-item:has-text("Failed"))',
  );
  if (await candidates.count() === 0) return false;
  await candidates.first().click();
  await settle(page, 800);
  const opt = page.locator(`.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text("${statusLabel}")`).first();
  if (await opt.count() === 0) { await closeAnyOpenLayer(page); return false; }
  await opt.click();
  await settle(page, 2500);
  log(`  status filter = "${statusLabel}"`);
  return true;
}

async function searchByName(page, name) {
  const search = page.locator(
    'input.ant-input[placeholder="Search by campaign name..."], ' +
    'input.ant-input[placeholder*="Search by campaign"]',
  ).first();
  if (await search.count() === 0) return false;
  await search.fill('');
  await settle(page, 300);
  await search.fill(name);
  await search.press('Enter');
  await settle(page, 2500);
  log(`  searched by name = "${name}"`);
  return true;
}

async function snapshotAllRows(page) {
  return await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody.ant-table-tbody tr.ant-table-row'));
    return rows.map(r => {
      const cells = Array.from(r.querySelectorAll('td')).map(td => (td.innerText || '').trim().slice(0, 80));
      return { cellCount: cells.length, cells };
    });
  });
}

async function findTargetRow(page) {
  const rows = page.locator('tbody.ant-table-tbody tr.ant-table-row');
  const rc = await rows.count();
  for (let i = 0; i < rc; i++) {
    const r = rows.nth(i);
    const txt = (await r.innerText().catch(() => '')) || '';
    if (txt.includes(TARGET_CAMPAIGN)) {
      evidence.matchedRowText = txt.slice(0, 800);
      // Try to extract status pill — last few short cells.
      const m = txt.match(/\b(Active|Upcoming|Completed|Stopped|Cancelled|Failed)\b/);
      if (m) evidence.matchedRowStatus = m[1];
      log(`  Matched row index ${i}. Inferred status="${evidence.matchedRowStatus}". First line="${txt.split('\n')[0]}".`);
      return r;
    }
  }
  return null;
}

async function dumpRowActions(row) {
  return await row.evaluate((el) => {
    const cells = Array.from(el.querySelectorAll('td'));
    const actionsCell = cells[cells.length - 1] || null;
    const buttons = actionsCell ? Array.from(actionsCell.querySelectorAll('button')).map(b => ({
      text: (b.innerText || '').trim(),
      aria: b.getAttribute('aria-label') || '',
      cls : b.className || '',
      disabled: b.disabled,
    })) : [];
    const links = actionsCell ? Array.from(actionsCell.querySelectorAll('a')).map(a => ({
      text: (a.innerText || '').trim(),
      href: a.getAttribute('href') || '',
      cls : a.className || '',
    })) : [];
    return {
      html: actionsCell ? actionsCell.outerHTML.slice(0, 4000) : '',
      buttons,
      links,
    };
  });
}

(async () => {
  if (!fs.existsSync(AUTH)) { console.error('No auth file at ' + AUTH); process.exit(1); }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    storageState: AUTH,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    log('Navigating to Allocation overview...');
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);

    // Enumerate available projects up-front for evidence.
    const projects = await listAllProjects(page);
    evidence.projectsAvailable = projects;
    log(`  Projects available in filter: ${JSON.stringify(projects)}`);

    let targetRow = null;
    let usedProject = '';

    // Iterate every project until we surface the target campaign.
    for (const proj of projects) {
      evidence.projectsTried.push(proj);
      log(`\n[project="${proj}"]`);

      // Reload to ensure clean filter state.
      await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 1800);

      if (!(await pickProjectByName(page, proj))) {
        log(`  Could not select project "${proj}" — skipping.`);
        continue;
      }

      // --- Phase A: Upcoming filter + search by name.
      evidence.phase = `A-Upcoming@${proj}`;
      if (!(await pickStatus(page, 'Upcoming'))) {
        log('  Status filter "Upcoming" not applied (control missing).');
      }
      await page.waitForSelector('tbody.ant-table-tbody', { timeout: 15_000 }).catch(() => {});
      await settle(page, 1200);
      await searchByName(page, TARGET_CAMPAIGN);
      let snapshot = await snapshotAllRows(page);
      evidence.rowCountByPhase[evidence.phase] = snapshot.length;
      log(`  Phase A rows (Upcoming+search): ${snapshot.length}`);
      targetRow = await findTargetRow(page);
      if (targetRow) { usedProject = proj; break; }

      // --- Phase B: All Status + search by name only.
      evidence.phase = `B-AllStatus@${proj}`;
      if (!(await pickStatus(page, 'All Status'))) {
        log('  Could not reset to "All Status" — re-loading.');
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
        await settle(page, 2000);
        await pickProjectByName(page, proj);
      }
      await settle(page, 1500);
      await searchByName(page, TARGET_CAMPAIGN);
      snapshot = await snapshotAllRows(page);
      evidence.rowCountByPhase[evidence.phase] = snapshot.length;
      evidence.allRowsSnapshot.push({ project: proj, phase: 'B-AllStatus', rows: snapshot.slice(0, 20) });
      log(`  Phase B rows (AllStatus+search): ${snapshot.length}`);
      targetRow = await findTargetRow(page);
      if (targetRow) { usedProject = proj; break; }
    }

    if (!targetRow) {
      result.status = 'UNREACHABLE';
      result.note   = `Target campaign "${TARGET_CAMPAIGN}" not found in any project. Projects tried: ${JSON.stringify(evidence.projectsTried)}. Row counts: ${JSON.stringify(evidence.rowCountByPhase)}.`;
      throw new Error(result.note);
    }

    log(`\nTarget row found under project "${usedProject}" with row status="${evidence.matchedRowStatus}".`);

    // Dump Actions column for evidence.
    const dump = await dumpRowActions(targetRow);
    evidence.rowActionsHtml    = dump?.html || '';
    evidence.rowActionsButtons = dump?.buttons || [];
    evidence.rowActionsLinks   = dump?.links || [];
    log(`  Row Actions buttons: ${JSON.stringify((dump?.buttons || []).map(b => b.text || b.aria))}`);
    log(`  Row Actions links  : ${JSON.stringify((dump?.links   || []).map(l => l.text))}`);

    // Click Cancel on the target row.
    let cancelTrigger = targetRow.locator(
      'button:has-text("Cancel Allocation"), button:has-text("Cancel Campaign"), button:has-text("Cancel")',
    ).first();
    if (await cancelTrigger.count() === 0) {
      cancelTrigger = targetRow.locator(
        'a:has-text("Cancel Allocation"), a:has-text("Cancel Campaign"), a:has-text("Cancel")',
      ).first();
    }
    if (await cancelTrigger.count() === 0) {
      cancelTrigger = targetRow.locator('[aria-label*="cancel" i]').first();
    }

    if (await cancelTrigger.count() === 0) {
      result.status = 'UNREACHABLE';
      result.note   = `No Cancel trigger found in Actions column of row "${TARGET_CAMPAIGN}". Row status detected="${evidence.matchedRowStatus}". Buttons: ${JSON.stringify((dump?.buttons || []).map(b => b.text))}. Links: ${JSON.stringify((dump?.links || []).map(l => l.text))}.`;
      throw new Error(result.note);
    }

    await cancelTrigger.scrollIntoViewIfNeeded();
    await cancelTrigger.click();
    log('  Clicked Cancel trigger on target row.');
    await settle(page, 1500);

    // Wait for confirmation modal.
    const modal = page.locator('.ant-modal-content').first();
    if (await modal.count() === 0) {
      result.status = 'UNREACHABLE';
      result.note   = 'Cancel button clicked but no `.ant-modal-content` appeared.';
      throw new Error(result.note);
    }

    await page.screenshot({
      path: path.join(OUT_DIR, result.file),
      fullPage: false,
    });
    log(`  Modal captured → ${result.file}`);

    const modalInfo = await page.evaluate(() => {
      const m = document.querySelector('.ant-modal-content');
      if (!m) return null;
      const title    = m.querySelector('.ant-modal-title')?.innerText?.trim() || '';
      const body     = m.querySelector('.ant-modal-body')?.innerText?.trim() || '';
      const closeX   = !!m.querySelector('.ant-modal-close, .ant-modal-close-x');
      const btns     = Array.from(m.querySelectorAll('button')).map(b => ({
        text: (b.innerText || '').trim(),
        aria: b.getAttribute('aria-label') || '',
        cls : b.className || '',
        type: b.getAttribute('type') || '',
      }));
      return { title, body, closeX, btns, html: m.outerHTML.slice(0, 5000) };
    });
    evidence.modal = modalInfo;
    log(`  Modal title : "${modalInfo?.title}"`);
    log(`  Modal body  : "${(modalInfo?.body || '').slice(0, 200)}"`);
    log(`  Modal btns  : ${JSON.stringify((modalInfo?.btns || []).map(b => b.text))}`);

    // Classify the buttons: confirm (destructive) vs dismiss (safe).
    const allBtns = modalInfo?.btns || [];
    const confirmRegex = /(yes|confirm|cancel allocation|cancel campaign|cancel now)/i;
    const dismissBtn = allBtns.find(b => b.text && !confirmRegex.test(b.text));
    const confirmBtn = allBtns.find(b => b.text && confirmRegex.test(b.text));

    result.status = 'CAPTURED';
    result.note   = `Captured Cancel Allocation modal for ${TARGET_CAMPAIGN} under project "${usedProject}" (row status="${evidence.matchedRowStatus}"). Title="${modalInfo?.title}". Dismissed without confirming.`;
    result.selectors = {
      modalContainer  : '.ant-modal-content',
      modalTitle      : '.ant-modal-title',
      modalBody       : '.ant-modal-body',
      modalCloseX     : '.ant-modal-close',
      confirmButton   : confirmBtn ? `.ant-modal-content button:has-text("${confirmBtn.text}")` : null,
      confirmButtonText: confirmBtn?.text || null,
      dismissButton   : dismissBtn ? `.ant-modal-content button:has-text("${dismissBtn.text}")` : null,
      dismissButtonText: dismissBtn?.text || null,
      rowCancelTrigger : `tbody.ant-table-tbody tr.ant-table-row:has-text("${TARGET_CAMPAIGN}") button:has-text("Cancel")`,
      allModalButtons : allBtns,
    };

    // Dismiss safely — never click confirm. Prefer dismiss button text, fall back
    // to ESC, but if the dismiss button label is ambiguously also a confirm
    // phrase, force ESC.
    if (dismissBtn?.text && !confirmRegex.test(dismissBtn.text)) {
      const dismissLoc = page.locator('.ant-modal-content button')
        .filter({ hasText: dismissBtn.text })
        .first();
      if (await dismissLoc.count() > 0) {
        await dismissLoc.click().catch(() => {});
        log(`  Dismissed modal via button "${dismissBtn.text}".`);
      } else {
        await page.keyboard.press('Escape').catch(() => {});
        log('  Dismissed modal via Escape (dismiss locator missed).');
      }
    } else {
      await page.keyboard.press('Escape').catch(() => {});
      log('  Dismissed modal via Escape (no safe dismiss button identified).');
    }
    await settle(page, 1500);
    await closeAnyOpenLayer(page);

    log('\n========== SUMMARY ==========');
    log(`${result.status.padEnd(12)} ${result.campaign} -> ${result.file}  (${result.note})`);
  } catch (e) {
    console.error('SCRIPT ERROR:', e?.message || e);
    if (result.status === 'PENDING') {
      result.status = 'UNREACHABLE';
      result.note   = String(e?.message || e);
    }
  } finally {
    fs.writeFileSync(
      path.join(OUT_DIR, '_allocation-capture-notes-cancel-modal.json'),
      JSON.stringify({ result, evidence }, null, 2),
    );
    log('Sidecar saved: visual-memory/admin/allocation/_allocation-capture-notes-cancel-modal.json');
    await context.close();
    await browser.close();
  }
})();
