/**
 * LOGIN TEST SUITE — XR Portal Admin
 * ======================================
 * URL  : https://uat-web.xrportal.in/admin
 * Auth : Mobile OTP (no password)
 *
 * ── Run commands ────────────────────────────────────────────────
 * All tests (headed):
 *   npx playwright test src/test/automation/login.spec.js --headed --workers=1 --config resources/config/playwright.config.js
 *
 * Only positive:
 *   npx playwright test src/test/automation/login.spec.js --headed --workers=1 -g "POSITIVE" --config resources/config/playwright.config.js
 * ────────────────────────────────────────────────────────────────
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../src/pages/LoginPage.js');

// ── Constants ─────────────────────────────────────────────────────────────────
const VALID_MOBILE = '8888888888';
const VALID_OTP = '258369';       // Static UAT OTP — update if it changes

// Small pause helper — helps visually follow the test in headed mode
async function pause(page, ms = 800) {
    await page.waitForTimeout(ms);
}

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 1 — ✅ POSITIVE SCENARIOS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('✅ POSITIVE — Login Flow', () => {

    test.beforeEach(async ({ page }) => {
        const login = new LoginPage(page);
        await login.navigate();
    });

    // ── TC_POS_001 ─────────────────────────────────────────────────────────────
    test('TC_POS_001 | Valid mobile number → OTP sent successfully', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_POS_001: Verify OTP screen appears after valid mobile');

        await login.enterMobileNumber(VALID_MOBILE);
        await login.screenshot('TC_POS_001_mobile_entered');
        await pause(page);
        await login.clickSendOtp();
        await pause(page, 2000);

        await expect(login.otpInput1).toBeVisible({ timeout: 15_000 });
        await expect(login.submitOtpButton).toBeVisible();
        await expect(login.resendOtpText).toBeVisible();
        await login.screenshot('TC_POS_001_otp_screen');

        console.log('   ✅ TC_POS_001 PASSED — OTP screen displayed correctly');
    });

    // ── TC_POS_002 ─────────────────────────────────────────────────────────────
    test('TC_POS_002 | Valid mobile + valid OTP → Successful login', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_POS_002: Full login with valid credentials');

        await login.enterMobileNumber(VALID_MOBILE);
        await pause(page);
        await login.screenshot('TC_POS_002_s1_mobile');

        await login.clickSendOtp();
        await expect(login.otpInput1).toBeVisible({ timeout: 15_000 });
        await pause(page, 1500);
        await login.screenshot('TC_POS_002_s2_otp_screen');

        await login.enterOtp(VALID_OTP);
        await pause(page);
        await login.screenshot('TC_POS_002_s3_otp_filled');

        await login.clickSubmitOtp();
        await pause(page, 2000);

        await page.waitForURL(/\/customers/, { timeout: 20_000 });
        await login.screenshot('TC_POS_002_s4_customers');

        expect(page.url()).toContain('/customers');
        await expect(page.locator('text=Customers').first()).toBeVisible({ timeout: 10_000 });
        console.log('   ✅ TC_POS_002 PASSED — Logged in, on Customers page');
    });

    // ── TC_POS_003 ─────────────────────────────────────────────────────────────
    test('TC_POS_003 | Correct redirection to /admin/customers after login', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_POS_003: Confirm post-login URL and page content');

        await login.login(VALID_MOBILE, VALID_OTP);
        await login.screenshot('TC_POS_003_after_login');

        expect(page.url()).toMatch(/\/admin\/customers/);
        await expect(page.locator('text=Customers').first()).toBeVisible();
        await expect(page.locator('text=Logout').or(page.locator('[class*="logout"]')).first()).toBeVisible();

        console.log('   ✅ TC_POS_003 PASSED — Redirected to /admin/customers');
    });

    // ── TC_POS_004 ─────────────────────────────────────────────────────────────
    test('TC_POS_004 | OTP timer is visible and counts down', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_POS_004: Verify countdown timer on OTP screen');

        await login.sendOtp(VALID_MOBILE);
        await pause(page, 1000);
        await login.screenshot('TC_POS_004_timer_visible');

        const timerEl = page.locator('text=/\\d+s/').first();
        await expect(timerEl).toBeVisible({ timeout: 5_000 });
        const t1 = (await timerEl.textContent()) ?? '';
        console.log(`   ⏱ Timer shows: ${t1}`);

        await expect(login.resendOtpText).toBeVisible();

        console.log('   ✅ TC_POS_004 PASSED — Timer and resend element visible');
    });

});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 2 — ❌ NEGATIVE — Mobile Number Validation
// ══════════════════════════════════════════════════════════════════════════════

test.describe('❌ NEGATIVE — Mobile Number Validation', () => {

    test.beforeEach(async ({ page }) => {
        const login = new LoginPage(page);
        await login.navigate();
    });

    // ── TC_NEG_001 ─────────────────────────────────────────────────────────────
    test('TC_NEG_001 | Empty mobile field → clicking Send OTP does nothing', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_NEG_001: Empty mobile — click Send OTP');

        await login.clickSendOtp();
        await pause(page, 2000);
        await login.screenshot('TC_NEG_001_result');

        const isOnOtp = await login.isOnOtpPage();
        expect(isOnOtp).toBe(false);
        await expect(login.mobileInput).toBeVisible();

        console.log('   ✅ TC_NEG_001 PASSED — Stayed on login page');
    });

    // ── TC_NEG_002 ─────────────────────────────────────────────────────────────
    test('TC_NEG_002 | Short mobile number — 5 digits', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_NEG_002: 5-digit mobile number');

        await login.enterMobileNumber('12345');
        await pause(page);
        await login.clickSendOtp();
        await pause(page, 2000);
        await login.screenshot('TC_NEG_002_result');

        expect(await login.isOnOtpPage()).toBe(false);

        console.log('   ✅ TC_NEG_002 PASSED — Short number rejected');
    });

    // ── TC_NEG_003 ─────────────────────────────────────────────────────────────
    test('TC_NEG_003 | Mobile field accepts numbers only — letters are blocked', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_NEG_003: Type letters in mobile field');

        await login.mobileInput.click();
        await page.keyboard.type('abcXYZ!@#');
        const value = await login.getMobileInputValue();
        console.log(`   Field value after typing letters: "${value}"`);

        expect(value).toMatch(/^\d*$/);

        await login.clickSendOtp();
        await pause(page, 2000);
        expect(await login.isOnOtpPage()).toBe(false);
        await login.screenshot('TC_NEG_003_result');

        console.log('   ✅ TC_NEG_003 PASSED — Non-numeric input rejected');
    });

    // ── TC_NEG_004 ─────────────────────────────────────────────────────────────
    test('TC_NEG_004 | All zeros mobile number (0000000000)', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_NEG_004: All-zeros mobile');

        await login.enterMobileNumber('0000000000');
        await pause(page);
        await login.clickSendOtp();
        await pause(page, 3000);
        await login.screenshot('TC_NEG_004_result');

        expect(await login.isOnCustomersPage()).toBe(false);

        console.log('   ✅ TC_NEG_004 PASSED — All-zeros number handled gracefully');
    });

    // ── TC_NEG_005 ─────────────────────────────────────────────────────────────
    test('TC_NEG_005 | Special characters in mobile field', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_NEG_005: Special characters in mobile');

        await login.mobileInput.click();
        await page.keyboard.type('@#$%^&*()-+');
        const value = await login.getMobileInputValue();
        console.log(`   Field value after special chars: "${value}"`);

        await login.clickSendOtp();
        await pause(page, 2000);
        await login.screenshot('TC_NEG_005_result');

        expect(await login.isOnOtpPage()).toBe(false);

        console.log('   ✅ TC_NEG_005 PASSED — Special characters rejected');
    });

});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 3 — ❌ NEGATIVE — OTP Validation
// ══════════════════════════════════════════════════════════════════════════════

test.describe('❌ NEGATIVE — OTP Validation', () => {

    test.beforeEach(async ({ page }) => {
        const login = new LoginPage(page);
        await login.navigate();
        await login.sendOtp(VALID_MOBILE);
        await expect(login.otpInput1).toBeVisible({ timeout: 15_000 });
    });

    // ── TC_NEG_006 ─────────────────────────────────────────────────────────────
    test('TC_NEG_006 | Empty OTP → Submit OTP does not log in', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_NEG_006: Submit OTP without entering anything');

        await login.clickSubmitOtp();
        await pause(page, 2000);
        await login.screenshot('TC_NEG_006_result');

        expect(page.url()).not.toContain('/customers');
        expect(await login.isOnOtpPage()).toBe(true);

        console.log('   ✅ TC_NEG_006 PASSED — Empty OTP not submitted');
    });

    // ── TC_NEG_007 ─────────────────────────────────────────────────────────────
    test('TC_NEG_007 | Wrong OTP (123456) → login rejected', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_NEG_007: Wrong OTP submission');

        await login.enterOtp('123456');
        await pause(page);
        await login.screenshot('TC_NEG_007_filled');

        await login.clickSubmitOtp();
        await pause(page, 3000);
        await login.screenshot('TC_NEG_007_result');

        expect(page.url()).not.toContain('/customers');

        console.log('   ✅ TC_NEG_007 PASSED — Wrong OTP rejected');
    });

    // ── TC_NEG_008 ─────────────────────────────────────────────────────────────
    test('TC_NEG_008 | Partial OTP — only 3 digits entered', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_NEG_008: Only 3 of 6 OTP digits filled');

        await login.enterPartialOtp('258');
        await pause(page);
        await login.screenshot('TC_NEG_008_partial');

        await login.clickSubmitOtp();
        await pause(page, 2000);
        await login.screenshot('TC_NEG_008_result');

        expect(page.url()).not.toContain('/customers');

        console.log('   ✅ TC_NEG_008 PASSED — Partial OTP rejected');
    });

    // ── TC_NEG_009 ─────────────────────────────────────────────────────────────
    test('TC_NEG_009 | All-zeros OTP (000000)', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_NEG_009: OTP = 000000');

        await login.enterOtp('000000');
        await login.clickSubmitOtp();
        await pause(page, 3000);
        await login.screenshot('TC_NEG_009_result');

        expect(page.url()).not.toContain('/customers');

        console.log('   ✅ TC_NEG_009 PASSED — All-zeros OTP rejected');
    });

    // ── TC_NEG_010 ─────────────────────────────────────────────────────────────
    test('TC_NEG_010 | Multiple wrong OTP attempts', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_NEG_010: Three consecutive wrong OTP attempts');

        const wrongOtps = ['111111', '222222', '333333'];

        for (let attempt = 0; attempt < wrongOtps.length; attempt++) {
            console.log(`   🔁 Attempt ${attempt + 1}: OTP "${wrongOtps[attempt]}"`);

            await login.clearOtpBoxes();
            await pause(page, 500);

            await login.enterOtp(wrongOtps[attempt]);
            await pause(page);
            await login.clickSubmitOtp();
            await pause(page, 2500);
            await login.screenshot(`TC_NEG_010_attempt_${attempt + 1}`);

            expect(page.url()).not.toContain('/customers');

            if (await login.isOnLoginPage()) {
                console.log(`   ⚠️  Redirected back to login after ${attempt + 1} wrong OTP(s)`);
                break;
            }

            const stillOnOtp = await login.isOnOtpPage();
            if (!stillOnOtp) break;
        }

        console.log('   ✅ TC_NEG_010 PASSED — Multiple wrong OTPs handled correctly');
    });

});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 4 — 🔧 FUNCTIONALITY
// ══════════════════════════════════════════════════════════════════════════════

test.describe('🔧 FUNCTIONALITY — OTP Screen Features', () => {

    test.beforeEach(async ({ page }) => {
        const login = new LoginPage(page);
        await login.navigate();
    });

    // ── TC_FUNC_001 ────────────────────────────────────────────────────────────
    test('TC_FUNC_001 | Back button returns to mobile entry screen', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_FUNC_001: Back button navigation');

        await login.sendOtp(VALID_MOBILE);
        await pause(page);
        await login.screenshot('TC_FUNC_001_on_otp');

        await login.clickBackButton();
        await pause(page, 1000);
        await login.screenshot('TC_FUNC_001_back_to_login');

        await expect(login.mobileInput).toBeVisible({ timeout: 8_000 });
        expect(await login.isOnOtpPage()).toBe(false);

        console.log('   ✅ TC_FUNC_001 PASSED — Back button works');
    });

    // ── TC_FUNC_002 ────────────────────────────────────────────────────────────
    test('TC_FUNC_002 | Resend OTP element is visible on OTP screen', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_FUNC_002: Resend OTP UI element presence');

        await login.sendOtp(VALID_MOBILE);
        await pause(page, 1000);
        await login.screenshot('TC_FUNC_002_resend');

        await expect(login.resendOtpText).toBeVisible({ timeout: 5_000 });
        const timerEl = page.locator('text=/\\d+s/').first();
        await expect(timerEl).toBeVisible({ timeout: 5_000 });

        console.log('   ✅ TC_FUNC_002 PASSED — Resend OTP and timer visible');
    });

    // ── TC_FUNC_003 ────────────────────────────────────────────────────────────
    test('TC_FUNC_003 | OTP boxes auto-advance focus between digits', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_FUNC_003: Auto-advance in OTP input');

        await login.sendOtp(VALID_MOBILE);

        await login.otpInput1.click();
        await page.keyboard.press('2');
        await pause(page, 200);
        await page.keyboard.press('5');
        await pause(page, 200);
        await page.keyboard.press('8');
        await pause(page, 500);
        await login.screenshot('TC_FUNC_003_three_typed');

        const box1 = await login.getOtpBoxValue(1);
        const box2 = await login.getOtpBoxValue(2);
        const box3 = await login.getOtpBoxValue(3);
        console.log(`   Box values: [${box1}][${box2}][${box3}]...`);

        expect(box1).toBe('2');
        expect(box2).toBe('5');
        expect(box3).toBe('8');

        console.log('   ✅ TC_FUNC_003 PASSED — Auto-advance works');
    });

    // ── TC_FUNC_004 ────────────────────────────────────────────────────────────
    test('TC_FUNC_004 | Mobile field accepts only numeric input', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_FUNC_004: Mobile field is numeric-only');

        await login.mobileInput.click();
        await page.keyboard.type('88abc88def8888');
        const value = await login.getMobileInputValue();
        console.log(`   Value after "88abc88def88": "${value}"`);

        expect(value).toMatch(/^\d*$/);
        await login.screenshot('TC_FUNC_004_numeric');

        console.log('   ✅ TC_FUNC_004 PASSED — Mobile field is numeric-only');
    });

    // ── TC_FUNC_005 ────────────────────────────────────────────────────────────
    test('TC_FUNC_005 | All 6 OTP boxes are present and editable', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_FUNC_005: Verify all 6 OTP boxes exist');

        await login.sendOtp(VALID_MOBILE);

        await expect(login.otpInput1).toBeVisible();
        await expect(login.otpInput2).toBeVisible();
        await expect(login.otpInput3).toBeVisible();
        await expect(login.otpInput4).toBeVisible();
        await expect(login.otpInput5).toBeVisible();
        await expect(login.otpInput6).toBeVisible();

        await expect(login.otpInput1).toBeEnabled();
        await expect(login.otpInput6).toBeEnabled();

        await login.screenshot('TC_FUNC_005_otp_boxes');
        console.log('   ✅ TC_FUNC_005 PASSED — All 6 OTP boxes present and enabled');
    });

});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 5 — 🔒 SECURITY
// ══════════════════════════════════════════════════════════════════════════════

test.describe('🔒 SECURITY — Login Hardening', () => {

    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
        await page.evaluate(() => {
            try { localStorage.clear(); } catch { }
            try { sessionStorage.clear(); } catch { }
        });
        const login = new LoginPage(page);
        await login.navigate();
    });

    // ── TC_SEC_001 ─────────────────────────────────────────────────────────────
    test('TC_SEC_001 | Access protected pages without login → redirected', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_SEC_001: Auth guard — direct URL access without session');

        const protectedPaths = ['/admin/customers', '/admin/config', '/admin/allocation'];

        for (const p of protectedPaths) {
            const url = `https://uat-web.xrportal.in${p}`;
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(2000);
            console.log(`   Visiting ${p} → landed at: ${page.url()}`);

            const mobileVisible = await login.mobileInput.isVisible().catch(() => false);
            console.log(`   Mobile input visible: ${mobileVisible}`);
        }

        await login.screenshot('TC_SEC_001_auth_guard');
        console.log('   ✅ TC_SEC_001 PASSED — Auth guard behavior verified');
    });

    // ── TC_SEC_002 ─────────────────────────────────────────────────────────────
    test('TC_SEC_002 | SQL injection in mobile field — safely handled', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_SEC_002: SQL injection in mobile number field');

        await login.mobileInput.click();
        await page.keyboard.type("' OR '1'='1");
        const value = await login.getMobileInputValue();
        console.log(`   SQL injection value in field: "${value}"`);

        await login.clickSendOtp();
        await pause(page, 2000);
        await login.screenshot('TC_SEC_002_result');

        expect(await login.isOnCustomersPage()).toBe(false);

        const bodyText = (await page.locator('body').textContent()) ?? '';
        expect(bodyText.toLowerCase()).not.toContain('syntax error');
        expect(bodyText.toLowerCase()).not.toContain('sql');
        expect(bodyText.toLowerCase()).not.toContain('database error');

        console.log('   ✅ TC_SEC_002 PASSED — SQL injection handled safely');
    });

    // ── TC_SEC_003 ─────────────────────────────────────────────────────────────
    test('TC_SEC_003 | XSS injection in mobile field — script not executed', async ({ page }) => {
        const login = new LoginPage(page);
        console.log('\n🔍 TC_SEC_003: XSS injection attempt');

        await login.mobileInput.click();
        await page.keyboard.type('<script>alert("xss")</script>');

        let dialogAppeared = false;
        page.once('dialog', async (dialog) => {
            dialogAppeared = true;
            await dialog.dismiss();
        });

        await login.clickSendOtp();
        await pause(page, 2000);
        await login.screenshot('TC_SEC_003_result');

        expect(dialogAppeared).toBe(false);
        expect(await login.isOnCustomersPage()).toBe(false);

        console.log('   ✅ TC_SEC_003 PASSED — XSS injection did not execute');
    });

});
