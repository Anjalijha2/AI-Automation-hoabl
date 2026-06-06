/**
 * capture-offers-drawers.js
 *
 * Captures 3 missing screenshots for visual-memory/admin/offers/:
 *  1. offers-add-drawer.png      — Add New Offer drawer open
 *  2. offers-edit-drawer.png     — Edit Offer drawer open (pre-populated)
 *  3. offers-delete-confirm.png  — Delete confirmation (modal/popconfirm)
 *
 * Also DOM-inspects each overlay and writes findings to
 * scripts/_offers-drawer-inspection.json.
 *
 * IMPORTANT: Does NOT delete any offer — only opens the delete confirm,
 * screenshots it, then dismisses with Escape / Cancel.
 *
 * Run:  node scripts/capture-offers-drawers.js
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR = path.join(ROOT, 'visual-memory', 'admin', 'offers');
const INSPECTION_OUT = path.join(__dirname, '_offers-drawer-inspection.json');
const URL = 'https://uat-web.xrportal.in/admin/offers';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function inspectDrawer(page, label) {
  return await page.evaluate((lbl) => {
    const drawer = document.querySelector('.ant-drawer-content');
    const modal = document.querySelector('.ant-modal-content');
    const container = drawer || modal;
    if (!container) return { label: lbl, present: false };

    const componentType = drawer ? '.ant-drawer-content' : '.ant-modal-content';
    const titleEl =
      container.querySelector('.ant-drawer-title') ||
      container.querySelector('.ant-modal-title');
    const title = titleEl ? titleEl.textContent.trim() : null;

    // Form item labels
    const labels = Array.from(container.querySelectorAll('.ant-form-item-label label'))
      .map((el) => el.textContent.trim());

    // Inputs
    const inputs = Array.from(container.querySelectorAll('input')).map((i) => ({
      type: i.type,
      name: i.getAttribute('name') || null,
      id: i.id || null,
      placeholder: i.placeholder || null,
      value: i.value || null,
      className: i.className,
      ariaLabel: i.getAttribute('aria-label') || null,
    }));

    // Textareas
    const textareas = Array.from(container.querySelectorAll('textarea')).map((t) => ({
      name: t.getAttribute('name') || null,
      id: t.id || null,
      placeholder: t.placeholder || null,
      value: t.value || null,
      className: t.className,
    }));

    // Select / dropdown triggers (Ant Design)
    const selectors = Array.from(container.querySelectorAll('.ant-select')).map((s) => ({
      id: s.id || null,
      className: s.className,
      selectedText:
        (s.querySelector('.ant-select-selection-item') &&
          s.querySelector('.ant-select-selection-item').textContent.trim()) ||
        null,
      placeholder:
        (s.querySelector('.ant-select-selection-placeholder') &&
          s.querySelector('.ant-select-selection-placeholder').textContent.trim()) ||
        null,
    }));

    // Radio groups
    const radios = Array.from(container.querySelectorAll('.ant-radio-wrapper')).map((r) => ({
      label: r.textContent.trim(),
      checked: !!r.querySelector('.ant-radio-checked'),
    }));

    // Date pickers
    const datepickers = Array.from(container.querySelectorAll('.ant-picker')).map((d) => ({
      className: d.className,
      placeholderInput:
        (d.querySelector('input') && d.querySelector('input').placeholder) || null,
      value: (d.querySelector('input') && d.querySelector('input').value) || null,
    }));

    // Buttons
    const buttons = Array.from(container.querySelectorAll('button')).map((b) => ({
      text: b.textContent.trim(),
      className: b.className,
      type: b.getAttribute('type') || null,
      ariaLabel: b.getAttribute('aria-label') || null,
    }));

    return {
      label: lbl,
      present: true,
      componentType,
      title,
      labels,
      inputs,
      textareas,
      selectors,
      radios,
      datepickers,
      buttons,
    };
  }, label);
}

async function inspectConfirm(page, label) {
  return await page.evaluate((lbl) => {
    const popconfirm = document.querySelector('.ant-popconfirm');
    const popover = document.querySelector('.ant-popover:not(.ant-popover-hidden)');
    const modal = document.querySelector('.ant-modal-content');
    const container = popconfirm || popover || modal;
    if (!container) return { label: lbl, present: false };

    let componentType = 'unknown';
    if (popconfirm) componentType = '.ant-popconfirm';
    else if (popover) componentType = '.ant-popover';
    else if (modal) componentType = '.ant-modal-content';

    const titleEl =
      container.querySelector('.ant-popconfirm-title') ||
      container.querySelector('.ant-popover-title') ||
      container.querySelector('.ant-modal-title') ||
      container.querySelector('.ant-popconfirm-message-title');
    const title = titleEl ? titleEl.textContent.trim() : null;

    const messageEl =
      container.querySelector('.ant-popconfirm-message') ||
      container.querySelector('.ant-popover-inner-content') ||
      container.querySelector('.ant-modal-body');
    const message = messageEl ? messageEl.textContent.trim() : null;

    const buttons = Array.from(container.querySelectorAll('button')).map((b) => ({
      text: b.textContent.trim(),
      className: b.className,
      type: b.getAttribute('type') || null,
    }));

    return { label: lbl, present: true, componentType, title, message, buttons };
  }, label);
}

(async () => {
  console.log('[capture] starting…');
  if (!fs.existsSync(AUTH)) {
    console.error(`[capture] missing auth session: ${AUTH}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({
    storageState: AUTH,
    viewport: { width: 1920, height: 900 },
  });
  const page = await ctx.newPage();
  const results = {};

  try {
    console.log(`[capture] navigating to ${URL}`);
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(1500);

    // If we got bounced to login, re-authenticate
    if (/\/admin\/?$/.test(page.url()) || /login/i.test(page.url())) {
      const heading = await page.$('h2');
      const headingText = heading ? (await heading.textContent()) : '';
      if (/admin login/i.test(headingText || '') || (await page.$('button:has-text("Send OTP")'))) {
        console.log('[capture] session expired — re-authenticating admin…');
        // Mobile input
        const mobileInput = page.locator(
          'input[type="tel"], input[placeholder*="Mobile" i], input[name*="mobile" i], input[id*="mobile" i]'
        ).first();
        await mobileInput.waitFor({ state: 'visible', timeout: 15000 });
        await mobileInput.fill('8888888888');
        await page.getByRole('button', { name: /send otp/i }).first().click();

        const firstBox = page.locator('input[autocomplete="one-time-code"], input[type="text"][maxlength="1"], input[aria-label*="otp" i]').first();
        await firstBox.waitFor({ state: 'visible', timeout: 15000 });
        const boxes = page.locator('input[autocomplete="one-time-code"], input[type="text"][maxlength="1"], input[aria-label*="otp" i]');
        for (const [i, d] of '258369'.split('').entries()) await boxes.nth(i).fill(d);
        await page.getByRole('button', { name: /verify|login|submit/i }).first().click();
        await page.waitForURL(/\/admin\/(customers|dashboard|offers)/, { timeout: 30000 });
        console.log('[capture] re-auth done, saving session…');
        await page.context().storageState({ path: AUTH });
        // Now navigate to offers
        await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
        await sleep(1500);
      }
    }

    // Wait for page heading — fall back to looking by text in any element
    try {
      await page.waitForSelector('h5:has-text("Offers Management")', { timeout: 20000 });
    } catch (_) {
      await page.waitForSelector(':text("Offers Management")', { timeout: 15000 });
    }

    // Wait for at least 1 data row in the offers table (exclude hidden measure row)
    await page.waitForSelector('.ant-table-tbody tr.ant-table-row', { timeout: 30000 });
    await sleep(800);

    // ─────────────────────────────────────────────────────────
    // 1) ADD DRAWER
    // ─────────────────────────────────────────────────────────
    console.log('[capture] opening Add New Offer drawer…');
    await page.click('button.ant-btn-primary:has-text("Add New Offer")');
    // Wait for drawer OR modal
    await Promise.race([
      page.waitForSelector('.ant-drawer-content', { timeout: 15000 }),
      page.waitForSelector('.ant-modal-content', { timeout: 15000 }),
    ]);
    await page.waitForSelector('.ant-drawer-title, .ant-modal-title', { timeout: 15000 }).catch(() => {});
    await sleep(1200); // allow drawer animation + fields to render

    const addShot = path.join(OUT_DIR, 'offers-add-drawer.png');
    await page.screenshot({ path: addShot, fullPage: true });
    console.log(`[capture] wrote ${addShot}`);

    results.addDrawer = await inspectDrawer(page, 'add');
    console.log('[capture] add drawer inspection:', JSON.stringify(results.addDrawer, null, 2).slice(0, 600));

    // Close drawer
    console.log('[capture] closing add drawer…');
    const closeBtn = await page.$('.ant-drawer-close');
    if (closeBtn) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForSelector('.ant-drawer-content', { state: 'detached', timeout: 10000 }).catch(async () => {
      // try escape again
      await page.keyboard.press('Escape');
      await sleep(800);
    });
    await sleep(800);

    // ─────────────────────────────────────────────────────────
    // 2) EDIT DRAWER
    // ─────────────────────────────────────────────────────────
    console.log('[capture] opening Edit drawer on first row…');

    // Find the first data row's action cell, then the 2nd icon-only button (Edit)
    const firstRow = page.locator('.ant-table-tbody tr.ant-table-row').first();
    const actionButtons = firstRow.locator('button.ant-btn-icon-only');
    const actionBtnCount = await actionButtons.count();
    console.log(`[capture] first row icon-only buttons: ${actionBtnCount}`);
    if (actionBtnCount < 2) throw new Error('Could not find Edit icon (need >=2 icon-only buttons in first row)');
    await actionButtons.nth(0).click(); // 2nd icon-only — but indexing depends on whether ant-switch counts
    // Per INDEX.md: Action cell contains [1] ant-switch, [2] edit (ant-btn-icon-only), [3] delete (ant-btn-icon-only)
    // ant-switch is NOT button.ant-btn-icon-only, so the first ant-btn-icon-only IS the edit icon.
    // → nth(0) is edit, nth(1) is delete.

    await Promise.race([
      page.waitForSelector('.ant-drawer-content', { timeout: 15000 }),
      page.waitForSelector('.ant-modal-content', { timeout: 15000 }),
    ]);
    await page.waitForSelector('.ant-drawer-title, .ant-modal-title', { timeout: 15000 }).catch(() => {});
    await sleep(1500); // longer wait — edit drawer pre-populates fields via API

    const editShot = path.join(OUT_DIR, 'offers-edit-drawer.png');
    await page.screenshot({ path: editShot, fullPage: true });
    console.log(`[capture] wrote ${editShot}`);

    results.editDrawer = await inspectDrawer(page, 'edit');
    console.log('[capture] edit drawer inspection:', JSON.stringify(results.editDrawer, null, 2).slice(0, 600));

    // Close drawer
    console.log('[capture] closing edit drawer…');
    const closeBtn2 = await page.$('.ant-drawer-close');
    if (closeBtn2) {
      await closeBtn2.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForSelector('.ant-drawer-content', { state: 'detached', timeout: 10000 }).catch(async () => {
      await page.keyboard.press('Escape');
      await sleep(800);
    });
    await sleep(800);

    // ─────────────────────────────────────────────────────────
    // 3) DELETE CONFIRM
    // ─────────────────────────────────────────────────────────
    console.log('[capture] opening Delete confirm on first row…');
    const firstRow2 = page.locator('.ant-table-tbody tr.ant-table-row').first();
    const actionButtons2 = firstRow2.locator('button.ant-btn-icon-only');
    const cnt = await actionButtons2.count();
    if (cnt < 2) throw new Error('Could not find Delete icon (need >=2 icon-only buttons in first row)');
    // nth(1) = delete (per analysis above)
    await actionButtons2.nth(1).click();

    // Wait for popconfirm or modal
    await Promise.race([
      page.waitForSelector('.ant-popconfirm', { timeout: 10000 }),
      page.waitForSelector('.ant-popover:not(.ant-popover-hidden)', { timeout: 10000 }),
      page.waitForSelector('.ant-modal-content', { timeout: 10000 }),
    ]).catch(() => {});
    await sleep(1000);

    const delShot = path.join(OUT_DIR, 'offers-delete-confirm.png');
    await page.screenshot({ path: delShot, fullPage: true });
    console.log(`[capture] wrote ${delShot}`);

    results.deleteConfirm = await inspectConfirm(page, 'delete');
    console.log('[capture] delete confirm inspection:', JSON.stringify(results.deleteConfirm, null, 2).slice(0, 600));

    // Dismiss WITHOUT confirming — press Escape and/or click Cancel/No
    console.log('[capture] dismissing delete confirm (NO deletion)…');
    // Try to find a Cancel/No button
    const cancelBtn = await page.$(
      '.ant-popconfirm button:has-text("Cancel"), .ant-popconfirm button:has-text("No"), .ant-modal-content button:has-text("Cancel"), .ant-modal-content button:has-text("No")'
    );
    if (cancelBtn) {
      await cancelBtn.click();
      console.log('[capture] clicked Cancel/No');
    } else {
      await page.keyboard.press('Escape');
      console.log('[capture] pressed Escape');
    }
    await sleep(800);

    // Write inspection JSON
    fs.writeFileSync(INSPECTION_OUT, JSON.stringify(results, null, 2));
    console.log(`[capture] wrote inspection JSON: ${INSPECTION_OUT}`);

    console.log('[capture] DONE — all 3 screenshots captured.');
  } catch (err) {
    console.error('[capture] ERROR:', err);
    // Save partial results
    try {
      fs.writeFileSync(INSPECTION_OUT, JSON.stringify({ ...results, error: String(err) }, null, 2));
    } catch (_) {}
    process.exitCode = 1;
  } finally {
    await ctx.close();
    await browser.close();
  }
})();
