// scripts/capture-cp-login-incomplete.js
//
// Capture the CP Portal / Login "incomplete profile" state(s) to unblock TC_CP_LOGIN_BIZ_029.
//
// Per source code (admin-sm-cp-portal/src/routes/Public/Login/index.jsx, lines 222-259):
//   After verify-otp succeeds the FE inspects the returned user object:
//     - hasConsented===true && cpRegistrationCompleted===true  → navigate('/dashboard')
//     - !hasConsented                                          → show Undertaking modal
//     - !cpRegistrationCompleted                               → show RegisterCp modal
//
// New test account (provided 2026-06-06):
//   Mobile: 9999999991   OTP: 147258
// Backend response for this mobile (observed): isConsented=false, isCpRegistrationCompleted=null
// → Therefore the FE renders the Undertaking modal FIRST. After clicking "I Agree",
//   the second verify-otp call (with isConsented=1) returns the registration state and the
//   FE renders the RegisterCp modal (the real "incomplete profile / KYC" screen).
//
// We capture BOTH states:
//   1. login-undertaking-modal.png   — Consent / Undertaking modal (pre-consent gate)
//   2. login-incomplete-profile.png  — RegisterCp modal (KYC / registration completion form)
//
// Fresh context — does NOT reuse channel-partner.json storageState.

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const VM_LOGIN   = path.join(ROOT, 'visual-memory', 'cp', 'login');
const VIEWPORT   = { width: 1920, height: 900 };
const LOGIN_URL  = 'https://uat-web.xrportal.in/';
const MOBILE     = '9999999991';
const OTP        = '147258';

const results = {};
function rec(key, status, note, extra) {
  results[key] = Object.assign({ status, note, ts: new Date().toISOString() }, extra || {});
  console.log(`[${status.padEnd(14)}] ${key} — ${note}`);
}

async function settle(page, ms = 1000) { await page.waitForTimeout(ms); }

async function inspectModalDom(page) {
  return page.evaluate(() => {
    function snip(el, n=300) { return el ? (el.outerHTML || '').slice(0, n) : null; }
    // antd modals appear inside .ant-modal or .ant-modal-root, often with .ant-modal-content as wrapper
    const modalRoots = Array.from(document.querySelectorAll('.ant-modal-content, .ant-modal, [role="dialog"], [aria-modal="true"]'));
    const visibleModal = modalRoots.find(el => {
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      return r.width > 50 && r.height > 50 && st.visibility !== 'hidden' && st.display !== 'none';
    }) || modalRoots[0] || null;

    let modalInfo = null;
    if (visibleModal) {
      const headings = Array.from(visibleModal.querySelectorAll('h1,h2,h3,h4,h5,h6'))
        .map(h => ({ tag: h.tagName.toLowerCase(), text: (h.innerText||'').trim() }))
        .filter(h => h.text.length > 0);
      const buttons = Array.from(visibleModal.querySelectorAll('button, a[role="button"]'))
        .map(b => ({
          text: (b.innerText || '').trim(),
          disabled: b.disabled || b.getAttribute('aria-disabled') === 'true',
          className: (b.className || '').toString().slice(0, 200),
          html: snip(b, 220),
        }))
        .filter(b => b.text.length > 0);
      const inputs = Array.from(visibleModal.querySelectorAll('input, select, textarea'))
        .map(i => ({
          tag: i.tagName.toLowerCase(),
          type: i.getAttribute('type') || '',
          name: i.getAttribute('name') || '',
          placeholder: i.getAttribute('placeholder') || '',
          ariaLabel: i.getAttribute('aria-label') || '',
        }));
      modalInfo = {
        rootClass: visibleModal.className,
        textSnippet: (visibleModal.innerText || '').slice(0, 2000),
        headings,
        buttons,
        inputs,
        inputCount: inputs.length,
        buttonCount: buttons.length,
      };
    }

    return {
      url: location.href,
      pathname: location.pathname,
      title: document.title,
      modalCount: modalRoots.length,
      visibleModalFound: !!visibleModal,
      modal: modalInfo,
    };
  });
}

async function runCapture(browser) {
  console.log('\n=== CAPTURE: CP login incomplete-profile flow ===');
  console.log(`Mobile: ${MOBILE}   OTP: ${OTP}`);

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const urlTimeline = [];
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      urlTimeline.push({ at: Date.now(), url: frame.url() });
    }
  });

  const apiResponses = [];
  page.on('response', async (resp) => {
    const url = resp.url();
    if (/\/auth\/cp\/(send-otp|verify-otp)/i.test(url) || /cpRegister/i.test(url)) {
      let bodySnippet = null;
      try { bodySnippet = (await resp.text()).slice(0, 800); } catch (_) {}
      apiResponses.push({
        url,
        status: resp.status(),
        method: resp.request().method(),
        bodySnippet,
      });
    }
  });

  try {
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 1200);

    // 1. Mobile entry
    const mobileInput = page.getByRole('textbox', { name: /enter mobile number/i });
    await mobileInput.fill(MOBILE);
    await settle(page, 400);

    // 2. Send OTP
    await page.getByRole('button', { name: /send otp/i }).click();
    console.log('  Send OTP clicked.');
    await page.waitForSelector('text=/enter\\s*otp/i', { timeout: 15_000 }).catch(() => {});
    await settle(page, 1000);

    // 3. OTP entry
    const otpInputs = page.getByRole('textbox', { name: /otp input [1-6]/i });
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(OTP[i]);
      await settle(page, 80);
    }
    await settle(page, 300);

    // 4. Submit OTP
    await page.getByRole('button', { name: /submit otp/i }).click();
    console.log('  Submit OTP clicked. Waiting for modal or redirect...');

    // 5. Wait for ANY of: /dashboard URL change, ant-modal element, ~10s
    await Promise.race([
      page.waitForURL(/\/dashboard/, { timeout: 12_000 }).catch(() => null),
      page.waitForSelector('.ant-modal-content, [role="dialog"]', { timeout: 12_000, state: 'visible' }).catch(() => null),
    ]);
    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
    await settle(page, 1500);

    const stateAfterOtp = await inspectModalDom(page);
    console.log(`  Post-OTP URL: ${stateAfterOtp.url}   ModalVisible: ${stateAfterOtp.visibleModalFound}`);

    if (/\/dashboard/.test(stateAfterOtp.url)) {
      rec('login/login-incomplete-profile', 'ACCOUNT_ALREADY_COMPLETE',
        `Mobile ${MOBILE} landed on /dashboard — account is already fully registered, not an incomplete-profile fixture.`,
        { finalUrl: stateAfterOtp.url, urlTimeline, apiResponses });
      await context.close();
      return;
    }

    if (!stateAfterOtp.visibleModalFound) {
      const diag = path.join(VM_LOGIN, '_login-incomplete-profile-no-modal-diagnostic.png');
      await page.screenshot({ path: diag, fullPage: false });
      rec('login/login-incomplete-profile', 'NO_MODAL',
        `After Submit OTP no .ant-modal appeared and URL did not move to /dashboard (URL=${stateAfterOtp.url}). See diagnostic.`,
        { diagnosticFile: diag, urlTimeline, apiResponses, state: stateAfterOtp });
      await context.close();
      return;
    }

    // === CAPTURE 1: Undertaking modal (consent gate) ===
    const undertakingHit = stateAfterOtp.modal.textSnippet.match(/undertaking|i\s+agree|i\s+disagree|consent/i);
    if (undertakingHit) {
      const out = path.join(VM_LOGIN, 'login-undertaking-modal.png');
      await page.screenshot({ path: out, fullPage: false });
      const stat = fs.statSync(out);
      rec('login/login-undertaking-modal', 'CAPTURED', `${stat.size} bytes — Undertaking/Consent modal`, {
        file: out,
        bytes: stat.size,
        modal: stateAfterOtp.modal,
      });

      // === Now consent through to RegisterCp modal ===
      console.log('  Ticking consent checkbox and clicking "I Agree" to advance to RegisterCp...');
      // Try to tick the agreement checkbox first
      const checkbox = page.locator('.ant-modal-content input[type="checkbox"], .ant-modal-content .ant-checkbox-input').first();
      if (await checkbox.count() > 0) {
        try { await checkbox.check({ force: true, timeout: 5000 }); } catch (_) {
          try { await checkbox.click({ force: true, timeout: 5000 }); } catch (__) {}
        }
        await settle(page, 500);
      }

      // Read more expander — some flows hide checkbox until expanded
      const readMore = page.getByText(/read more/i).first();
      if (await readMore.count() > 0) {
        try { await readMore.click({ timeout: 3000 }); } catch (_) {}
        await settle(page, 400);
        if (await checkbox.count() > 0) {
          try { await checkbox.check({ force: true, timeout: 5000 }); } catch (_) {}
        }
        await settle(page, 400);
      }

      const agreeBtn = page.locator('button.btn-book-solid', { hasText: /i\s*agree/i }).first()
        .or(page.getByRole('button', { name: /^i\s*agree$/i }).first());
      let agreed = false;
      try {
        await agreeBtn.waitFor({ state: 'visible', timeout: 5000 });
        const disabled = await agreeBtn.isDisabled().catch(() => true);
        console.log(`  "I Agree" button disabled state: ${disabled}`);
        if (!disabled) {
          await agreeBtn.click({ timeout: 5000 });
          agreed = true;
          console.log('  Clicked "I Agree".');
        } else {
          console.log('  "I Agree" still disabled — checkbox may not be ticked. Trying direct click anyway.');
          try { await agreeBtn.click({ force: true, timeout: 5000 }); agreed = true; } catch (_) {}
        }
      } catch (e) {
        console.log('  Could not click "I Agree":', e?.message || e);
      }

      if (agreed) {
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
        await settle(page, 2500);
        const afterConsent = await inspectModalDom(page);
        console.log(`  Post-consent URL: ${afterConsent.url}   ModalVisible: ${afterConsent.visibleModalFound}`);

        if (/\/dashboard/.test(afterConsent.url)) {
          rec('login/login-incomplete-profile', 'CONSENT_LED_TO_DASHBOARD',
            'After consent the user was redirected to /dashboard — backend treated account as fully registered. No RegisterCp modal rendered.',
            { finalUrl: afterConsent.url, urlTimeline, apiResponses });
        } else if (afterConsent.visibleModalFound) {
          const out2 = path.join(VM_LOGIN, 'login-incomplete-profile.png');
          await page.screenshot({ path: out2, fullPage: true });
          const stat2 = fs.statSync(out2);
          rec('login/login-incomplete-profile', 'CAPTURED', `${stat2.size} bytes — RegisterCp modal (incomplete profile / KYC form)`, {
            file: out2,
            bytes: stat2.size,
            finalUrl: afterConsent.url,
            modal: afterConsent.modal,
            urlTimeline,
            apiResponses,
          });
        } else {
          const diag = path.join(VM_LOGIN, '_login-incomplete-profile-after-consent-diagnostic.png');
          await page.screenshot({ path: diag, fullPage: false });
          rec('login/login-incomplete-profile', 'POST_CONSENT_NO_MODAL',
            `After "I Agree" no further modal appeared and URL did not move to /dashboard. URL=${afterConsent.url}.`,
            { diagnosticFile: diag, urlTimeline, apiResponses, state: afterConsent });
        }
      } else {
        rec('login/login-incomplete-profile', 'CANNOT_CONSENT',
          'Could not click "I Agree" — checkbox may be unreachable or button stayed disabled.',
          { urlTimeline, apiResponses });
      }
    } else {
      // No undertaking text — the visible modal might directly be RegisterCp
      const out = path.join(VM_LOGIN, 'login-incomplete-profile.png');
      await page.screenshot({ path: out, fullPage: true });
      const stat = fs.statSync(out);
      rec('login/login-incomplete-profile', 'CAPTURED', `${stat.size} bytes — modal rendered directly (no Undertaking gate)`, {
        file: out,
        bytes: stat.size,
        finalUrl: stateAfterOtp.url,
        modal: stateAfterOtp.modal,
        urlTimeline,
        apiResponses,
      });
    }
  } catch (e) {
    rec('login/login-incomplete-profile', 'ERROR', String(e?.stack || e?.message || e), { urlTimeline, apiResponses });
  } finally {
    await context.close();
  }
}

(async () => {
  if (!fs.existsSync(VM_LOGIN)) fs.mkdirSync(VM_LOGIN, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    await runCapture(browser);
  } catch (e) {
    console.error('FATAL:', e?.message || e);
  } finally {
    const outJson = path.join(__dirname, '_capture-cp-login-incomplete-results.json');
    fs.writeFileSync(outJson, JSON.stringify(results, null, 2));
    console.log(`\nResults written: ${outJson}`);
    await browser.close();
  }
})();
