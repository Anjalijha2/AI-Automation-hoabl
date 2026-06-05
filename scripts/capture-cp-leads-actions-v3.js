// scripts/capture-cp-leads-actions-v3.js
//
// Leads action icons confirmed via DOM:
//   Icon 1: "Resend Notification" (paper-airplane SVG, button.reset-btn)
//   Icon 2: "Copy Link" (document SVG, button.reset-btn)
//
// Toast (Toastify) auto-dismisses ~3s default. Strategy:
//   - Intercept window.alert / Notification / clipboard
//   - Stub Toastify CSS to disable auto-dismiss animation
//   - Click icon, capture immediately, capture toast HTML

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'channel-partner.json');
const OUT  = path.join(ROOT, 'visual-memory', 'cp', 'leads-management');
const URL  = 'https://uat-web.xrportal.in/leads';
const VIEWPORT = { width: 1920, height: 900 };

const results = {};
function rec(k, s, n, e) { results[k] = Object.assign({ status: s, note: n }, e || {}); console.log(`[${s}] ${k} — ${n}`); }
async function settle(p, ms = 1200) { await p.waitForTimeout(ms); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH, deviceScaleFactor: 1 });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'https://uat-web.xrportal.in' }).catch(() => {});
  const page = await ctx.newPage();

  // Inject style to freeze Toastify toasts (no auto-dismiss visually)
  await page.addInitScript(() => {
    const s = document.createElement('style');
    s.textContent = `
      .Toastify__toast { animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important; }
      .Toastify__progress-bar { display: none !important; }
    `;
    s.id = '__freeze-toasts__';
    (document.head || document.documentElement).appendChild(s);
  });

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await page.waitForSelector('.ant-table-tbody .ant-table-row', { timeout: 15_000 }).catch(() => {});
    await settle(page, 1500);

    // Re-apply style after page loaded (toast container created after load)
    await page.evaluate(() => {
      if (document.getElementById('__freeze-toasts__')) return;
      const s = document.createElement('style');
      s.id = '__freeze-toasts__';
      s.textContent = `
        .Toastify__toast { animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important; }
        .Toastify__progress-bar { display: none !important; }
      `;
      document.head.appendChild(s);
    });

    // === ACTION 1: Resend Notification (share-like) ===
    // SVG <title> is a child element, not attribute → use :has(title) text match
    const resendBtn = page.locator('.ant-table-tbody .ant-table-row').first()
      .locator('button.reset-btn:has(svg:has(title:has-text("Resend Notification")))').first();
    if (await resendBtn.count() > 0) {
      // Track new pages too
      const newPagePromise = ctx.waitForEvent('page', { timeout: 2500 }).catch(() => null);
      await resendBtn.scrollIntoViewIfNeeded();
      await resendBtn.click({ force: true });
      // Quick screenshot to catch any flash UI
      await page.waitForTimeout(250);
      const out1 = path.join(OUT, 'leads-share-action.png');
      await page.screenshot({ path: out1, fullPage: false });
      const newPage = await newPagePromise;
      let toastInfo = await page.evaluate(() => {
        const toasts = Array.from(document.querySelectorAll('.Toastify__toast'));
        return toasts.map(t => ({ text: (t.innerText || '').trim(), cls: t.className }));
      }).catch(() => []);
      const modalText = await page.locator('.ant-modal-content, [role="dialog"]').first().innerText().catch(() => '');
      const sz = fs.statSync(out1).size;
      rec('leads-share-action', 'CAPTURED', `Resend Notification clicked. toast=${JSON.stringify(toastInfo)} modal="${(modalText || '').slice(0, 80)}" newTab=${newPage ? newPage.url() : 'none'}`, { file: out1, bytes: sz, toasts: toastInfo, modal: modalText, newTab: newPage ? newPage.url() : null });
      if (newPage) await newPage.close();
      // Dismiss
      await page.keyboard.press('Escape').catch(() => {});
      await page.evaluate(() => document.querySelectorAll('.Toastify__toast').forEach(t => t.remove()));
      await settle(page, 800);
    } else {
      rec('leads-share-action', 'NOT_FOUND', 'Resend Notification button not located');
    }

    // === ACTION 2: Copy Link ===
    const copyBtn = page.locator('.ant-table-tbody .ant-table-row').first()
      .locator('button.reset-btn:has(svg:has(title:has-text("Copy Link")))').first();
    if (await copyBtn.count() > 0) {
      await copyBtn.scrollIntoViewIfNeeded();
      await copyBtn.click({ force: true });
      await page.waitForTimeout(250);
      const out2 = path.join(OUT, 'leads-copy-action.png');
      await page.screenshot({ path: out2, fullPage: false });
      let toastInfo = await page.evaluate(() => {
        const toasts = Array.from(document.querySelectorAll('.Toastify__toast'));
        return toasts.map(t => ({ text: (t.innerText || '').trim(), cls: t.className }));
      }).catch(() => []);
      let clipboardContent = await page.evaluate(async () => {
        try { return await navigator.clipboard.readText(); } catch (e) { return `READ_ERR:${String(e?.message || e)}`; }
      }).catch(() => 'eval-err');
      const sz = fs.statSync(out2).size;
      rec('leads-copy-action', 'CAPTURED', `Copy Link clicked. toast=${JSON.stringify(toastInfo)} clipboard="${(clipboardContent || '').slice(0, 120)}"`, { file: out2, bytes: sz, toasts: toastInfo, clipboard: clipboardContent });
    } else {
      rec('leads-copy-action', 'NOT_FOUND', 'Copy Link button not located');
    }
  } catch (e) {
    console.error('FATAL', e?.message || e);
  } finally {
    fs.writeFileSync(path.join(__dirname, '_capture-cp-leads-v3-results.json'), JSON.stringify(results, null, 2));
    await ctx.close();
    await browser.close();
  }
})();
