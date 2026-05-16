/**
 * LOGIN PAGE OBJECT — XR Portal (https://uat-web.xrportal.in/admin)
 * =================================================================
 * Selectors confirmed via live DOM inspection.
 *
 * Login Flow:
 *   Step 1 — Enter mobile number → click "Send OTP"
 *   Step 2 — Enter 6-digit OTP (individual boxes) → click "Submit OTP"
 *   Result — Redirected to /admin/customers
 */

const { expect } = require('@playwright/test');

class LoginPage {
    constructor(page) {
        this.page = page;

        // ── Step 1: Mobile Number Screen ──────────────────────────────────────────
        this.mobileInput = page.locator('input[placeholder="Enter Mobile Number"]');
        this.sendOtpButton = page.locator('button:has-text("Send OTP")');

        // ── Step 2: OTP Screen ────────────────────────────────────────────────────
        this.otpHeading = page.locator('text=ENTER OTP').first();

        // 6 individual OTP digit boxes — confirmed aria-label attributes
        this.otpInput1 = page.locator('input[aria-label="OTP Input 1"]');
        this.otpInput2 = page.locator('input[aria-label="OTP Input 2"]');
        this.otpInput3 = page.locator('input[aria-label="OTP Input 3"]');
        this.otpInput4 = page.locator('input[aria-label="OTP Input 4"]');
        this.otpInput5 = page.locator('input[aria-label="OTP Input 5"]');
        this.otpInput6 = page.locator('input[aria-label="OTP Input 6"]');

        this.submitOtpButton = page.locator('button:has-text("Submit OTP")');
        this.resendOtpText = page.locator('text=Re-Send OTP').or(page.locator('text=Resend OTP')).first();
        this.backButton = page.locator('button.reset-btn.back-to-mobile, .common-link, .back-button').first();
        this.otpTimer = page.locator('text=/\\d+s/').or(page.locator('text=/:\\d+/')).first();

        // Error / toast messages (Ant Design)
        this.toastError = page.locator('.ant-message-notice, .ant-notification-notice').first();
    }

    get otpBoxes() {
        return [
            this.otpInput1,
            this.otpInput2,
            this.otpInput3,
            this.otpInput4,
            this.otpInput5,
            this.otpInput6,
        ];
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  NAVIGATION
    // ════════════════════════════════════════════════════════════════════════════

    async navigate() {
        await this.page.goto('https://uat-web.xrportal.in/admin', {
            waitUntil: 'domcontentloaded',
            timeout: 30_000,
        });
        // Wait for the mobile input to be ready — confirms login page loaded
        await expect(this.mobileInput).toBeVisible({ timeout: 15_000 });
        console.log('✅ Login page loaded');
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  STEP 1 — ENTER MOBILE & SEND OTP
    // ════════════════════════════════════════════════════════════════════════════

    async enterMobileNumber(mobile) {
        await this.mobileInput.click();
        await this.mobileInput.clear();
        // Use pressSequentially to simulate real typing (digit by digit)
        await this.mobileInput.pressSequentially(mobile, { delay: 80 });
        console.log(`   📱 Entered mobile: ${mobile}`);
    }

    async clickSendOtp() {
        await expect(this.sendOtpButton).toBeEnabled({ timeout: 5_000 });
        await this.sendOtpButton.click();
        console.log('   🔘 Clicked Send OTP');
    }

    /** Navigate to OTP screen: enter mobile + click Send OTP + wait for OTP UI */
    async sendOtp(mobile) {
        await this.enterMobileNumber(mobile);
        await this.clickSendOtp();
        // Wait for OTP Input 1 to appear — most reliable indicator the OTP screen loaded
        await expect(this.otpInput1).toBeVisible({ timeout: 15_000 });
        console.log('   ✅ OTP screen loaded');
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  STEP 2 — ENTER OTP & SUBMIT
    // ════════════════════════════════════════════════════════════════════════════

    /**
     * Enters 6-digit OTP into individual boxes.
     * Each box gets its own digit; the Ant Design component auto-advances focus.
     */
    async enterOtp(otp) {
        if (otp.length !== 6) {
            throw new Error(`OTP must be exactly 6 digits — received "${otp}" (${otp.length} chars)`);
        }
        const boxes = this.otpBoxes;
        for (let i = 0; i < 6; i++) {
            await boxes[i].click();
            await boxes[i].pressSequentially(otp[i], { delay: 80 });
        }
        console.log(`   🔢 Entered OTP: ${otp}`);
    }

    /** Enter partial OTP — used for negative tests */
    async enterPartialOtp(otp) {
        const boxes = this.otpBoxes;
        for (let i = 0; i < otp.length; i++) {
            await boxes[i].click();
            await boxes[i].pressSequentially(otp[i], { delay: 80 });
        }
        console.log(`   🔢 Entered partial OTP: ${otp} (${otp.length}/6 digits)`);
    }

    async clickSubmitOtp() {
        await expect(this.submitOtpButton).toBeEnabled({ timeout: 5_000 });
        await this.submitOtpButton.click();
        console.log('   🔘 Clicked Submit OTP');
    }

    /** Clear all OTP boxes (for retry scenarios) */
    async clearOtpBoxes() {
        const boxes = this.otpBoxes;
        for (let i = 5; i >= 0; i--) {
            await boxes[i].click();
            await boxes[i].press('Backspace');
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  COMPLETE LOGIN FLOW
    // ════════════════════════════════════════════════════════════════════════════

    /**
     * Full end-to-end login:
     *   1. Enter mobile → Send OTP
     *   2. Enter OTP   → Submit OTP
     *   3. Wait for /customers redirect
     */
    async login(mobile, otp) {
        await this.sendOtp(mobile);
        await this.enterOtp(otp);
        await this.clickSubmitOtp();
        await this.page.waitForURL('**/customers**', { timeout: 20_000 });
        console.log('   ✅ Login successful — now on Customers page');
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  STATE HELPERS
    // ════════════════════════════════════════════════════════════════════════════

    async isOnLoginPage() {
        return await this.mobileInput.isVisible({ timeout: 3_000 }).catch(() => false);
    }

    async isOnOtpPage() {
        return await this.otpInput1.isVisible({ timeout: 3_000 }).catch(() => false);
    }

    async isOnCustomersPage() {
        return this.page.url().includes('/customers');
    }

    async getMobileInputValue() {
        return await this.mobileInput.inputValue();
    }

    async getOtpBoxValue(boxNumber) {
        return await this.otpBoxes[boxNumber - 1].inputValue();
    }

    async getToastText() {
        try {
            await this.toastError.waitFor({ state: 'visible', timeout: 5_000 });
            return (await this.toastError.textContent()) ?? '';
        } catch {
            return '';
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  UTILITY
    // ════════════════════════════════════════════════════════════════════════════

    async clickBackButton() {
        await expect(this.backButton).toBeVisible({ timeout: 5_000 });
        await this.backButton.click();
        await expect(this.mobileInput).toBeVisible({ timeout: 8_000 });
        console.log('   ↩  Returned to mobile entry screen');
    }

    async screenshot(label) {
        const ts = Date.now();
        await this.page.screenshot({
            path: `reports/screenshots/${label}_${ts}.png`,
            fullPage: false,
        });
    }
}

module.exports = { LoginPage };
