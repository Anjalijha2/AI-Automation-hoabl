// scripts/capture-customers-cancel-modals.js
//
// Targeted capture for Admin Portal / Customers — TWO states triggered by the
// trash-icon column in Actions (NOT the three-dot kebab menu).
//
//   VG-2: Cancel Registration "Confirm Refund" modal (Registered row)
//         -> visual-memory/admin/customers/customers-cancel-registration-modal.png
//
//   VG-1: Cancel Unit "Please make sure that following actions are completed?"
//         modal (Booked Offline / Booked Online row)
//         -> visual-memory/admin/customers/customers-cancel-unit-modal.png
//
// READ-ONLY: this script must NEVER click the destructive Submit / Cancel
// Registration confirm buttons. Each modal is captured, then dismissed via
// the modal's close (X) or its non-destructive Cancel button.
//
// Usage:
//   node scripts/capture-customers-cancel-modals.js

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'admin', 'customers');
const URL      = 'https://uat-web.xrportal.in/admin/customers';
const VIEWPORT = { width: 1920, height: 900 };

const results = {
  'VG-2 (Cancel Registration modal)': {
    file: 'customers-cancel-registration-modal.png',
    status: 'PENDING',
    note: '',
  },
  'VG-1 (Cancel Unit modal)': {
    file: 'customers-cancel-unit-modal.png',
    status: 'PENDING',
    note: '',
  },
};

const domNotes = {
  trashIconSelectorCandidates: [],
  cancelRegistrationModal: {},
  cancelUnitModal: {},
};

async function settle(page, ms = 1500) {
  await page.waitForTimeout(ms);
}

async function findRowByAllocationStatus(page, status) {
  // Returns a Locator for the FIRST row matching allocation status text.
  const rows = page.locator('tbody.ant-table-tbody tr.ant-table-row');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const text = (await row.innerText().catch(() => '')).toLowerCase();
    if (text.includes(status.toLowerCase())) {
      return { row, idx: i };
    }
  }
  return null;
}

async function clickTrashIconOnRow(page, row, label = '') {
  // The Actions column contains (in order):
  //   - "Download your Unit Details" (icon button, KYC-completed rows only)
  //   - delete (trash) icon — button[aria-label="delete"]
  //   - more (kebab) icon — button[aria-label="more"]
  //
  // We target the trash explicitly via aria-label="delete".
  const trash = row.locator('button[aria-label="delete"]');
  const trashCount = await trash.count();
  console.log(`  [${label}] trash button[aria-label="delete"] count on row =`, trashCount);
  if (trashCount === 0) {
    // Fallback — look for a button containing an anticon-delete svg
    const fallback = row.locator('button:has(span.anticon-delete), button:has(svg[data-icon="delete"])');
    const fc = await fallback.count();
    console.log(`  [${label}] fallback anticon-delete count on row =`, fc);
    if (fc === 0) {
      throw new Error('Trash icon button not found on row.');
    }
    await fallback.first().scrollIntoViewIfNeeded();
    await fallback.first().click();
  } else {
    await trash.first().scrollIntoViewIfNeeded();
    await trash.first().click();
  }
  await settle(page, 1200);
}

async function dumpModalDom(page) {
  return await page.evaluate(() => {
    // Visible modal — Ant Design renders all .ant-modal-wrap and toggles
    // display:none on hidden ones. We pick the one without display:none.
    const wraps = Array.from(document.querySelectorAll('.ant-modal-wrap'));
    const visibleWrap = wraps.find(w => w.style.display !== 'none' && w.offsetParent !== null);
    const modal = visibleWrap?.querySelector('.ant-modal-content')
                  || document.querySelector('.ant-modal-content');
    if (!modal) return { found: false };

    const titleEl  = modal.querySelector('.ant-modal-title');
    const bodyEl   = modal.querySelector('.ant-modal-body');
    const headerEl = modal.querySelector('.ant-modal-header');
    const footerEl = modal.querySelector('.ant-modal-footer');
    const closeBtn = modal.querySelector('button.ant-modal-close');

    const buttons = Array.from(modal.querySelectorAll('button')).map(b => ({
      text: (b.innerText || '').trim(),
      ariaLabel: b.getAttribute('aria-label') || '',
      className: b.className || '',
      disabled: b.disabled,
    }));

    const checkboxes = Array.from(modal.querySelectorAll('input[type="checkbox"]')).map(c => ({
      checked: c.checked,
      label: c.closest('label')?.innerText?.trim() || c.getAttribute('aria-label') || '',
      className: c.className || '',
      parentLabelClass: c.closest('label')?.className || '',
    }));

    // Any labelled fields (label + value pairs) — common Ant pattern
    const labelledFields = Array.from(modal.querySelectorAll('.ant-form-item, .form-item, .modal-field, .row'))
      .slice(0, 12)
      .map(el => (el.innerText || '').trim().slice(0, 200));

    return {
      found: true,
      title: titleEl?.innerText?.trim() || '',
      headerHtml: headerEl?.outerHTML?.slice(0, 600) || '',
      bodyText: bodyEl?.innerText?.trim() || '',
      bodySnippet: (bodyEl?.innerText || '').slice(0, 800),
      buttons,
      checkboxes,
      labelledFields,
      hasCloseX: !!closeBtn,
      footerText: footerEl?.innerText?.trim() || '',
    };
  });
}

async function closeModalSafely(page, mode) {
  // mode: 'x'  -> click the top-right close X
  //       'cancel-button' -> click the modal's Cancel button (non-destructive)
  //
  // Never click destructive labels: "Cancel Registration", "Submit", "OK", "Yes".
  try {
    if (mode === 'cancel-button') {
      // Use a strict equality match to avoid hitting "Cancel Registration"
      const cancel = page.locator(
        '.ant-modal-wrap:not([style*="display: none"]) .ant-modal-content button:has-text("Cancel")'
      );
      const n = await cancel.count();
      // Pick the cancel button whose text is exactly "Cancel"
      for (let i = 0; i < n; i++) {
        const txt = ((await cancel.nth(i).innerText().catch(() => '')) || '').trim();
        if (txt === 'Cancel') {
          await cancel.nth(i).click();
          await settle(page, 800);
          return;
        }
      }
    }
    // Fallback: top-right X
    const x = page.locator(
      '.ant-modal-wrap:not([style*="display: none"]) button.ant-modal-close, button.ant-modal-close[aria-label="Close"]'
    ).first();
    if (await x.count() > 0) {
      await x.click();
      await settle(page, 800);
      return;
    }
  } catch (_) { /* swallow */ }

  // Last resort: Escape twice + body click
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(300);
}

(async () => {
  if (!fs.existsSync(AUTH)) {
    console.error(`ERROR: Auth file not found at ${AUTH}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    storageState: AUTH,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to', URL);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await settle(page, 2500);

    const url = page.url();
    if (!url.includes('/admin/customers')) {
      console.error(`Auth failed — redirected to ${url}`);
      process.exit(2);
    }
    console.log('On Customers page.');

    await page.waitForSelector('tbody.ant-table-tbody tr.ant-table-row', { timeout: 20_000 }).catch(() => {});
    await settle(page, 1500);

    // Snapshot all delete-button selectors visible on the page (for INDEX.md)
    domNotes.trashIconSelectorCandidates = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('tbody.ant-table-tbody button[aria-label="delete"]'));
      return {
        countOnPage: btns.length,
        sampleHtml: btns[0]?.outerHTML?.slice(0, 400) || '',
      };
    });
    console.log('Trash-icon candidates on page:', domNotes.trashIconSelectorCandidates);

    // ---------------------------------------------------------------
    // VG-2 — Cancel Registration "Confirm Refund" modal (Registered row)
    // ---------------------------------------------------------------
    console.log('\n[VG-2] Cancel Registration modal (Registered row, trash icon)');
    try {
      const found = await findRowByAllocationStatus(page, 'Registered');
      if (!found) {
        results['VG-2 (Cancel Registration modal)'].status = 'UNREACHABLE';
        results['VG-2 (Cancel Registration modal)'].note  = 'No Registered row visible on default page.';
        console.log('  UNREACHABLE: no Registered row.');
      } else {
        console.log(`  Using Registered row idx=${found.idx}`);
        await clickTrashIconOnRow(page, found.row, 'VG-2');

        await page.waitForSelector('.ant-modal-content, .ant-modal-wrap', { timeout: 8_000 }).catch(() => {});
        await settle(page, 800);

        domNotes.cancelRegistrationModal = await dumpModalDom(page);
        console.log('  Modal DOM:', JSON.stringify(domNotes.cancelRegistrationModal, null, 2));

        if (domNotes.cancelRegistrationModal.found) {
          await page.screenshot({
            path: path.join(OUT_DIR, results['VG-2 (Cancel Registration modal)'].file),
            fullPage: false,
          });
          results['VG-2 (Cancel Registration modal)'].status = 'CAPTURED';
          console.log('  CAPTURED:', results['VG-2 (Cancel Registration modal)'].file);
        } else {
          results['VG-2 (Cancel Registration modal)'].status = 'UNREACHABLE';
          results['VG-2 (Cancel Registration modal)'].note  = 'Trash icon click did not surface a modal.';
        }

        // Safely dismiss — do NOT click "Cancel Registration"
        await closeModalSafely(page, 'x');
        await settle(page, 800);
      }
    } catch (e) {
      results['VG-2 (Cancel Registration modal)'].note = e.message;
      console.log('  ERROR:', e.message);
      await closeModalSafely(page, 'x');
    }

    // Make sure we're on a clean state before VG-1
    await settle(page, 1000);

    // ---------------------------------------------------------------
    // VG-1 — Cancel Unit modal (Booked Offline / Booked Online row)
    // ---------------------------------------------------------------
    console.log('\n[VG-1] Cancel Unit modal (Booked row, trash icon)');
    try {
      const found = await findRowByAllocationStatus(page, 'Booked');
      if (!found) {
        results['VG-1 (Cancel Unit modal)'].status = 'UNREACHABLE';
        results['VG-1 (Cancel Unit modal)'].note  = 'No Booked row visible on default page.';
        console.log('  UNREACHABLE: no Booked row.');
      } else {
        console.log(`  Using Booked row idx=${found.idx}`);
        await clickTrashIconOnRow(page, found.row, 'VG-1');

        await page.waitForSelector('.ant-modal-content, .ant-modal-wrap', { timeout: 8_000 }).catch(() => {});
        await settle(page, 800);

        domNotes.cancelUnitModal = await dumpModalDom(page);
        console.log('  Modal DOM:', JSON.stringify(domNotes.cancelUnitModal, null, 2));

        if (domNotes.cancelUnitModal.found) {
          await page.screenshot({
            path: path.join(OUT_DIR, results['VG-1 (Cancel Unit modal)'].file),
            fullPage: false,
          });
          results['VG-1 (Cancel Unit modal)'].status = 'CAPTURED';
          console.log('  CAPTURED:', results['VG-1 (Cancel Unit modal)'].file);
        } else {
          results['VG-1 (Cancel Unit modal)'].status = 'UNREACHABLE';
          results['VG-1 (Cancel Unit modal)'].note  = 'Trash icon click did not surface a modal.';
        }

        // Safely dismiss via the modal's own Cancel button (non-destructive)
        await closeModalSafely(page, 'cancel-button');
        await settle(page, 800);
      }
    } catch (e) {
      results['VG-1 (Cancel Unit modal)'].note = e.message;
      console.log('  ERROR:', e.message);
      await closeModalSafely(page, 'cancel-button');
    }

    // ---------------------------------------------------------------
    // Summary
    // ---------------------------------------------------------------
    console.log('\n========== SUMMARY ==========');
    for (const [vg, r] of Object.entries(results)) {
      console.log(`${r.status.padEnd(12)} ${vg}  ->  ${r.file}  ${r.note ? '(' + r.note + ')' : ''}`);
    }

    const notesPath = path.join(OUT_DIR, '_capture-notes-cancel-modals.json');
    fs.writeFileSync(notesPath, JSON.stringify({ results, domNotes }, null, 2));
    console.log('\nDOM notes written to:', path.relative(ROOT, notesPath));

  } finally {
    await context.close();
    await browser.close();
  }
})();
