// scripts/capture-cp-kyc-full.js
//
// Captures full KYC Assistance page for CP portal — fills the gap where
// only above-fold screenshot existed. Targets:
//   - Full-page screenshot (above + below fold including document uploads + Submit)
//   - Business Region dropdown open state
//   - Submit-click validation state (if reachable)
//   - DOM dump of form structure

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'channel-partner.json');
const OUT  = path.join(ROOT, 'visual-memory', 'cp', 'kyc-assistance');
const URL  = 'https://uat-web.xrportal.in/kyc';
const VIEWPORT = { width: 1920, height: 900 };

const results = { module: 'kyc-assistance', captures: [] };
function rec(name, status, note, extra) {
  const r = Object.assign({ name, status, note }, extra || {});
  results.captures.push(r);
  console.log(`[${status.padEnd(14)}] ${name} — ${note}`);
}

async function shot(p, file, full = false) {
  const out = path.join(OUT, file);
  await p.screenshot({ path: out, fullPage: !!full });
  const stat = fs.statSync(out);
  return { path: out, bytes: stat.size };
}

(async () => {
  if (!fs.existsSync(AUTH)) { console.error('Missing auth session:', AUTH); process.exit(1); }
  if (!fs.existsSync(OUT))  { fs.mkdirSync(OUT, { recursive: true }); }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: AUTH, viewport: VIEWPORT });
  const page = await context.newPage();

  try {
    console.log('=== KYC Assistance — full capture ===');
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(2000);

    if (/\/login/i.test(page.url())) {
      rec('auth', 'AUTH_FAILED', 'redirected to /login — session expired');
      await browser.close();
      fs.writeFileSync(path.join(OUT, '_kyc-capture-results.json'), JSON.stringify(results, null, 2));
      process.exit(2);
    }

    // 1) DOM inspection of form structure
    const dom = await page.evaluate(() => {
      const h = (sel) => Array.from(document.querySelectorAll(sel)).map(el => (el.innerText || '').trim()).filter(Boolean);
      const inputs = Array.from(document.querySelectorAll('input')).map(el => ({
        type: el.type,
        name: el.name || '',
        placeholder: el.placeholder || '',
        ariaLabel: el.getAttribute('aria-label') || '',
        value: el.value || '',
        disabled: el.disabled,
        readOnly: el.readOnly,
      }));
      const selects = Array.from(document.querySelectorAll('.ant-select')).map(el => ({
        placeholder: (el.querySelector('.ant-select-selection-placeholder') || {}).innerText || '',
        text: (el.innerText || '').slice(0, 80),
      }));
      const uploads = Array.from(document.querySelectorAll('input[type="file"], .ant-upload')).map(el => ({
        tag: el.tagName,
        accept: el.getAttribute('accept') || '',
        cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 120),
        text: (el.innerText || '').slice(0, 80),
      }));
      const buttons = Array.from(document.querySelectorAll('button')).map(el => ({
        text: (el.innerText || '').trim().slice(0, 60),
        cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 100),
        disabled: el.disabled,
      })).filter(b => b.text);
      const sectionHeaders = h('h1, h2, h3, h4, h5, .ant-card-head-title, [class*="sectionHeader" i]');
      return {
        url: location.href,
        title: document.title,
        h1: h('h1'),
        h2: h('h2'),
        h3: h('h3'),
        sectionHeaders,
        inputs,
        selects,
        uploads,
        buttons,
        scrollHeight: document.body.scrollHeight,
        viewportHeight: window.innerHeight,
      };
    });
    fs.writeFileSync(path.join(OUT, '_kyc-dom-inspect.json'), JSON.stringify(dom, null, 2));
    rec('dom-inspect', 'OK', `inputs=${dom.inputs.length} selects=${dom.selects.length} uploads=${dom.uploads.length} btns=${dom.buttons.length}`);

    // 2) Full-page screenshot (above + below fold)
    const r1 = await shot(page, 'kyc-loaded-full.png', true);
    rec('kyc-loaded-full.png', 'CAPTURED', `full-page ${r1.bytes} bytes`);

    // 3) Above-fold viewport screenshot (refresh of screenshot-desktop)
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const r2 = await shot(page, 'kyc-above-fold.png', false);
    rec('kyc-above-fold.png', 'CAPTURED', `viewport ${r2.bytes} bytes`);

    // 4) Scroll to bottom — capture document upload + submit area
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(700);
    const r3 = await shot(page, 'kyc-below-fold-submit.png', false);
    rec('kyc-below-fold-submit.png', 'CAPTURED', `bottom-of-form viewport ${r3.bytes} bytes`);

    // 5) Scroll to mid (document uploads usually mid-page if present)
    await page.evaluate(() => window.scrollTo(0, Math.round(document.body.scrollHeight * 0.5)));
    await page.waitForTimeout(500);
    const r4 = await shot(page, 'kyc-documents-section.png', false);
    rec('kyc-documents-section.png', 'CAPTURED', `mid-page viewport ${r4.bytes} bytes`);

    // 6) Business Region dropdown — scroll back to top, click it
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    try {
      // Find ant-select whose label/placeholder mentions Business Region
      const opened = await page.evaluate(() => {
        const selects = Array.from(document.querySelectorAll('.ant-select'));
        for (const sel of selects) {
          // Check sibling label
          const item = sel.closest('.ant-form-item, div');
          const lbl = item ? (item.innerText || '').toLowerCase() : '';
          if (lbl.includes('business region') || (sel.innerText || '').toLowerCase().includes('region')) {
            sel.scrollIntoView({ block: 'center' });
            const trigger = sel.querySelector('.ant-select-selector');
            if (trigger) { trigger.click(); return true; }
          }
        }
        return false;
      });
      if (opened) {
        await page.waitForTimeout(800);
        const r5 = await shot(page, 'kyc-business-region-dropdown.png', false);
        rec('kyc-business-region-dropdown.png', 'CAPTURED', `dropdown opened, ${r5.bytes} bytes`);
        // close
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(200);
      } else {
        rec('kyc-business-region-dropdown.png', 'SKIPPED', 'Business Region select not found by label scan');
      }
    } catch (e) {
      rec('kyc-business-region-dropdown.png', 'ERROR', String(e).slice(0, 200));
    }

    // 7) Submit click — validation state
    try {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);
      const submitBtn = page.locator('button').filter({ hasText: /^submit/i }).first();
      const hasSubmit = await submitBtn.count();
      if (hasSubmit > 0) {
        await submitBtn.click({ force: true, timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(1500);
        // Scroll to first visible error
        await page.evaluate(() => {
          const err = document.querySelector('.ant-form-item-has-error, .ant-form-item-explain-error');
          if (err) err.scrollIntoView({ block: 'center' });
        });
        await page.waitForTimeout(500);
        const r6 = await shot(page, 'kyc-validation-errors.png', false);
        rec('kyc-validation-errors.png', 'CAPTURED', `post-Submit validation state, ${r6.bytes} bytes`);
        // also a full-page version
        const r7 = await shot(page, 'kyc-validation-full.png', true);
        rec('kyc-validation-full.png', 'CAPTURED', `full-page post-Submit, ${r7.bytes} bytes`);
      } else {
        rec('kyc-validation-errors.png', 'SKIPPED', 'no Submit button found');
      }
    } catch (e) {
      rec('kyc-validation-errors.png', 'ERROR', String(e).slice(0, 200));
    }

  } catch (err) {
    console.error('Capture error:', err);
    rec('fatal', 'ERROR', String(err).slice(0, 300));
  } finally {
    fs.writeFileSync(path.join(OUT, '_kyc-capture-results.json'), JSON.stringify(results, null, 2));
    await browser.close();
    console.log('\nDone. Results:', path.join(OUT, '_kyc-capture-results.json'));
  }
})();
