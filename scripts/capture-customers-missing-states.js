// scripts/capture-customers-missing-states.js
//
// One-off capture script for Admin Portal / Customers — 6 missing UI states
// blocking 10 Conditional TCs.
//
// VG-1: Cancel Unit modal              -> customers-cancel-unit-modal.png
// VG-2: Cancel Registration popup      -> customers-cancel-registration-popup.png
// VG-3: Booked row 3-dot dropdown      -> customers-booked-actions-dropdown.png
// VG-4: Registered row 3-dot dropdown  -> customers-registered-actions-dropdown.png
// VG-5: Home Loan Approval modal       -> customers-home-loan-approval-modal.png
// VG-6: Empty search state             -> customers-empty-search-state.png
//
// Usage:
//   node scripts/capture-customers-missing-states.js

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'admin', 'customers');
const URL      = 'https://uat-web.xrportal.in/admin/customers';
const VIEWPORT = { width: 1920, height: 900 };

const results = {
  'VG-1 (Cancel Unit modal)':            { file: 'customers-cancel-unit-modal.png',          status: 'PENDING', note: '' },
  'VG-2 (Cancel Registration popup)':    { file: 'customers-cancel-registration-popup.png',  status: 'PENDING', note: '' },
  'VG-3 (Booked row dropdown)':          { file: 'customers-booked-actions-dropdown.png',    status: 'PENDING', note: '' },
  'VG-4 (Registered row dropdown)':      { file: 'customers-registered-actions-dropdown.png',status: 'PENDING', note: '' },
  'VG-5 (Home Loan Approval modal)':     { file: 'customers-home-loan-approval-modal.png',   status: 'PENDING', note: '' },
  'VG-6 (Empty search state)':           { file: 'customers-empty-search-state.png',         status: 'PENDING', note: '' },
};

const domNotes = {
  bookedDropdownItems: [],
  registeredDropdownItems: [],
  cancelUnitModal: {},
  cancelRegistrationPopup: {},
  homeLoanModal: {},
  emptyState: {},
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

async function openKebabForRow(page, row) {
  // Click "more" action button (kebab) inside the Actions column.
  const kebab = row.locator('button[aria-label="more"], button.ant-dropdown-trigger').last();
  await kebab.scrollIntoViewIfNeeded();
  await kebab.click();
  await settle(page, 800);
}

async function closeAnyOpenLayer(page) {
  // ESC to close modals/popups/dropdowns.
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(200);
  }
  await page.mouse.click(10, 10).catch(() => {});
  await page.waitForTimeout(300);
}

async function captureDropdownItems(page) {
  // Returns visible text of currently-open ant-dropdown menu items.
  const items = page.locator('.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item');
  const count = await items.count();
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push((await items.nth(i).innerText().catch(() => '')).trim());
  }
  return out;
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

    // Confirm we are on Customers (not bounced to login)
    const url = page.url();
    if (!url.includes('/admin/customers')) {
      console.error(`Auth failed — redirected to ${url}`);
      process.exit(2);
    }
    console.log('On Customers page.');

    // Wait for table rows to render
    await page.waitForSelector('tbody.ant-table-tbody tr.ant-table-row', { timeout: 20_000 }).catch(() => {});
    await settle(page, 1500);

    // ---------------------------------------------------------------
    // VG-3 — Three-dot dropdown on a Booked row
    // ---------------------------------------------------------------
    console.log('\n[VG-3] Three-dot dropdown on Booked row');
    try {
      // "Booked Offline" or "Booked Online" — search loosely for "Booked"
      const found = await findRowByAllocationStatus(page, 'Booked');
      if (!found) {
        results['VG-3 (Booked row dropdown)'].status = 'UNREACHABLE';
        results['VG-3 (Booked row dropdown)'].note   = 'No Booked customer row visible in UAT default page.';
        console.log('  UNREACHABLE: no Booked row on page.');
      } else {
        await openKebabForRow(page, found.row);
        const items = await captureDropdownItems(page);
        domNotes.bookedDropdownItems = items;
        console.log('  Dropdown items:', items);

        // Screenshot
        await page.screenshot({
          path: path.join(OUT_DIR, results['VG-3 (Booked row dropdown)'].file),
          fullPage: false,
        });
        results['VG-3 (Booked row dropdown)'].status = 'CAPTURED';
        console.log('  CAPTURED:', results['VG-3 (Booked row dropdown)'].file);

        // ---------------------------------------------------------------
        // VG-1 — Cancel Unit modal (drill down from open Booked dropdown)
        // ---------------------------------------------------------------
        console.log('\n[VG-1] Cancel Unit modal');
        const cancelUnitItem = page.locator(
          '.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item:has-text("Cancel Unit")'
        );
        if (await cancelUnitItem.count() > 0) {
          await cancelUnitItem.first().click();
          await settle(page, 1500);
          // Wait for modal
          await page.waitForSelector('.ant-modal-content, .ant-modal-wrap', { timeout: 8_000 }).catch(() => {});
          await settle(page, 800);

          // Capture modal DOM info
          domNotes.cancelUnitModal = await page.evaluate(() => {
            const modal = document.querySelector('.ant-modal-wrap:not([style*="display: none"]) .ant-modal-content, .ant-modal-content');
            if (!modal) return { found: false };
            const title  = modal.querySelector('.ant-modal-title')?.innerText || '';
            const body   = modal.querySelector('.ant-modal-body')?.innerText  || '';
            const btns   = Array.from(modal.querySelectorAll('button')).map(b => b.innerText.trim());
            const chks   = Array.from(modal.querySelectorAll('input[type="checkbox"]')).map(c => ({
              checked: c.checked,
              label:   c.closest('label')?.innerText || c.getAttribute('aria-label') || '',
            }));
            return { found: true, title, bodySnippet: body.slice(0, 400), buttons: btns, checkboxes: chks };
          });

          await page.screenshot({
            path: path.join(OUT_DIR, results['VG-1 (Cancel Unit modal)'].file),
            fullPage: false,
          });
          results['VG-1 (Cancel Unit modal)'].status = 'CAPTURED';
          console.log('  CAPTURED:', results['VG-1 (Cancel Unit modal)'].file);
          console.log('  Modal info:', domNotes.cancelUnitModal);
        } else {
          results['VG-1 (Cancel Unit modal)'].status = 'UNREACHABLE';
          results['VG-1 (Cancel Unit modal)'].note   = 'No "Cancel Unit" item in Booked row dropdown.';
          console.log('  UNREACHABLE: "Cancel Unit" not in dropdown.');
        }

        await closeAnyOpenLayer(page);
      }
    } catch (e) {
      results['VG-3 (Booked row dropdown)'].note = e.message;
      console.log('  ERROR:', e.message);
      await closeAnyOpenLayer(page);
    }

    // ---------------------------------------------------------------
    // VG-5 — Home Loan Approval modal (try from a Booked row)
    // ---------------------------------------------------------------
    console.log('\n[VG-5] Home Loan Approval modal (Booked row)');
    try {
      const found = await findRowByAllocationStatus(page, 'Booked');
      if (!found) {
        results['VG-5 (Home Loan Approval modal)'].status = 'UNREACHABLE';
        results['VG-5 (Home Loan Approval modal)'].note   = 'No Booked row to attempt Home Loan Approval from.';
        console.log('  UNREACHABLE: no Booked row.');
      } else {
        await openKebabForRow(page, found.row);
        const hl = page.locator(
          '.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item:has-text("Home Loan Approval")'
        );
        if (await hl.count() > 0) {
          await hl.first().click();
          await settle(page, 1500);
          await page.waitForSelector('.ant-modal-content, .ant-modal-wrap', { timeout: 8_000 }).catch(() => {});
          await settle(page, 800);

          domNotes.homeLoanModal = await page.evaluate(() => {
            const modal = document.querySelector('.ant-modal-wrap:not([style*="display: none"]) .ant-modal-content, .ant-modal-content');
            if (!modal) return { found: false };
            const title   = modal.querySelector('.ant-modal-title')?.innerText || '';
            const body    = modal.querySelector('.ant-modal-body')?.innerText  || '';
            const btns    = Array.from(modal.querySelectorAll('button')).map(b => b.innerText.trim());
            const toggles = Array.from(modal.querySelectorAll('.ant-switch, [role="switch"]')).map(s => ({
              ariaChecked: s.getAttribute('aria-checked'),
              cls:         s.className,
            }));
            return { found: true, title, bodySnippet: body.slice(0, 400), buttons: btns, toggles };
          });

          await page.screenshot({
            path: path.join(OUT_DIR, results['VG-5 (Home Loan Approval modal)'].file),
            fullPage: false,
          });
          results['VG-5 (Home Loan Approval modal)'].status = 'CAPTURED';
          console.log('  CAPTURED:', results['VG-5 (Home Loan Approval modal)'].file);
          console.log('  Modal info:', domNotes.homeLoanModal);
        } else {
          results['VG-5 (Home Loan Approval modal)'].status = 'UNREACHABLE';
          results['VG-5 (Home Loan Approval modal)'].note   = '"Home Loan Approval" item not in Booked dropdown.';
          console.log('  UNREACHABLE: not in dropdown.');
        }
        await closeAnyOpenLayer(page);
      }
    } catch (e) {
      results['VG-5 (Home Loan Approval modal)'].note = e.message;
      console.log('  ERROR:', e.message);
      await closeAnyOpenLayer(page);
    }

    // ---------------------------------------------------------------
    // VG-4 — Three-dot dropdown on a Registered row
    // ---------------------------------------------------------------
    console.log('\n[VG-4] Three-dot dropdown on Registered row');
    try {
      const found = await findRowByAllocationStatus(page, 'Registered');
      if (!found) {
        results['VG-4 (Registered row dropdown)'].status = 'UNREACHABLE';
        results['VG-4 (Registered row dropdown)'].note   = 'No Registered customer row visible.';
        console.log('  UNREACHABLE.');
      } else {
        await openKebabForRow(page, found.row);
        const items = await captureDropdownItems(page);
        domNotes.registeredDropdownItems = items;
        console.log('  Dropdown items:', items);

        await page.screenshot({
          path: path.join(OUT_DIR, results['VG-4 (Registered row dropdown)'].file),
          fullPage: false,
        });
        results['VG-4 (Registered row dropdown)'].status = 'CAPTURED';
        console.log('  CAPTURED:', results['VG-4 (Registered row dropdown)'].file);

        // ---------------------------------------------------------------
        // VG-2 — Cancel Registration refund popup (from Registered dropdown)
        // ---------------------------------------------------------------
        console.log('\n[VG-2] Cancel Registration refund popup');
        const cancelReg = page.locator(
          '.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item:has-text("Cancel Registration")'
        );
        if (await cancelReg.count() > 0) {
          await cancelReg.first().click();
          await settle(page, 1500);
          await page.waitForSelector('.ant-modal-content, .ant-popover, .ant-modal-wrap', { timeout: 8_000 }).catch(() => {});
          await settle(page, 800);

          domNotes.cancelRegistrationPopup = await page.evaluate(() => {
            const modal = document.querySelector('.ant-modal-wrap:not([style*="display: none"]) .ant-modal-content, .ant-modal-content, .ant-popover-inner');
            if (!modal) return { found: false };
            const title = modal.querySelector('.ant-modal-title, .ant-popover-title')?.innerText || '';
            const body  = modal.querySelector('.ant-modal-body, .ant-popover-inner-content')?.innerText  || '';
            const btns  = Array.from(modal.querySelectorAll('button')).map(b => b.innerText.trim());
            return { found: true, title, bodySnippet: body.slice(0, 500), buttons: btns };
          });

          await page.screenshot({
            path: path.join(OUT_DIR, results['VG-2 (Cancel Registration popup)'].file),
            fullPage: false,
          });
          results['VG-2 (Cancel Registration popup)'].status = 'CAPTURED';
          console.log('  CAPTURED:', results['VG-2 (Cancel Registration popup)'].file);
          console.log('  Popup info:', domNotes.cancelRegistrationPopup);
        } else {
          results['VG-2 (Cancel Registration popup)'].status = 'UNREACHABLE';
          results['VG-2 (Cancel Registration popup)'].note   = '"Cancel Registration" not in Registered dropdown.';
          console.log('  UNREACHABLE: not in dropdown.');
        }
        await closeAnyOpenLayer(page);
      }
    } catch (e) {
      results['VG-4 (Registered row dropdown)'].note = e.message;
      console.log('  ERROR:', e.message);
      await closeAnyOpenLayer(page);
    }

    // ---------------------------------------------------------------
    // VG-6 — Empty search state
    // ---------------------------------------------------------------
    console.log('\n[VG-6] Empty search state');
    try {
      const phoneSearch = page.locator('input.ant-input[placeholder="Search by Phone"]').first();
      if (await phoneSearch.count() === 0) {
        results['VG-6 (Empty search state)'].status = 'UNREACHABLE';
        results['VG-6 (Empty search state)'].note   = 'Phone search input not found.';
        console.log('  UNREACHABLE.');
      } else {
        await phoneSearch.click();
        await phoneSearch.fill('ZZZNOMATCH99999');
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
        await settle(page, 2000);

        domNotes.emptyState = await page.evaluate(() => {
          const empty   = document.querySelector('.ant-empty, .ant-table-placeholder');
          const found   = !!empty;
          const descTxt = empty?.querySelector('.ant-empty-description')?.innerText || empty?.innerText || '';
          return { found, descSnippet: descTxt.slice(0, 200) };
        });

        await page.screenshot({
          path: path.join(OUT_DIR, results['VG-6 (Empty search state)'].file),
          fullPage: false,
        });
        results['VG-6 (Empty search state)'].status = 'CAPTURED';
        console.log('  CAPTURED:', results['VG-6 (Empty search state)'].file);
        console.log('  Empty state info:', domNotes.emptyState);

        // Clear search for cleanliness
        await phoneSearch.fill('');
        await page.keyboard.press('Enter');
      }
    } catch (e) {
      results['VG-6 (Empty search state)'].note = e.message;
      console.log('  ERROR:', e.message);
    }

    // ---------------------------------------------------------------
    // Summary + DOM notes dump
    // ---------------------------------------------------------------
    console.log('\n========== SUMMARY ==========');
    for (const [vg, r] of Object.entries(results)) {
      console.log(`${r.status.padEnd(12)} ${vg}  ->  ${r.file}  ${r.note ? '(' + r.note + ')' : ''}`);
    }

    // Dump DOM notes as JSON for INDEX.md updates
    const notesPath = path.join(OUT_DIR, '_capture-notes.json');
    fs.writeFileSync(notesPath, JSON.stringify({ results, domNotes }, null, 2));
    console.log('\nDOM notes written to:', path.relative(ROOT, notesPath));

  } finally {
    await context.close();
    await browser.close();
  }
})();
