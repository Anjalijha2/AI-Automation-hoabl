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

import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
    readonly page: Page;

    // ── Step 1: Mobile Number Screen ──────────────────────────────────────────
    readonly mobileInput: Locator;       // input[placeholder="Enter Mobile Number"]
    readonly sendOtpButton: Locator;     // button with text "Send OTP"

    // ── Step 2: OTP Screen ────────────────────────────────────────────────────
    readonly otpHeading: Locator;        // The "ENTER OTP" heading section
    readonly otpInput1: Locator;         // 1st OTP box  aria-label="OTP Input 1"
    readonly otpInput2: Locator;         // 2nd OTP box  aria-label="OTP Input 2"
    readonly otpInput3: Locator;         // 3rd OTP box  aria-label="OTP Input 3"
    readonly otpInput4: Locator;         // 4th OTP box  aria-label="OTP Input 4"
    readonly otpInput5: Locator;         // 5th OTP box  aria-label="OTP Input 5"
    readonly otpInput6: Locator;         // 6th OTP box  aria-label="OTP Input 6"
    readonly submitOtpButton: Locator;   // button with text "Submit OTP"
    readonly resendOtpText: Locator;     // span.resend-otp-text "Re-Send OTP"
    readonly backButton: Locator;        // button.reset-btn.back-to-mobile
    readonly otpTimer: Locator;          // countdown timer e.g. "55s"

    // ── Toast / Error Messages ─────────────────────────────────────────────────
    readonly toastError: Locator;

    constructor(page: Page) {
        this.page = page;

        // Step 1
        this.mobileInput = page.locator('input[placeholder="Enter Mobile Number"]');
        this.sendOtpButton = page.locator('button:has-text("Send OTP")');

        // Step 2
        // The heading area contains "ENTER OTP" — use a broad selector that survives
        // different markup structures (div, h2, span)
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

    // ════════════════════════════════════════════════════════════════════════════
    //  NAVIGATION
    // ════════════════════════════════════════════════════════════════════════════

    async navigate(): Promise<void> {
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

    async enterMobileNumber(mobile: string): Promise<void> {
        await this.mobileInput.click();
        await this.mobileInput.clear();
        // Use pressSequentially to simulate real typing (digit by digit)
        await this.mobileInput.pressSequentially(mobile, { delay: 80 });
        console.log(`   📱 Entered mobile: ${mobile}`);
    }

    async clickSendOtp(): Promise<void> {
        await expect(this.sendOtpButton).toBeEnabled({ timeout: 5_000 });
        await this.sendOtpButton.click();
        console.log('   🔘 Clicked Send OTP');
    }

    /** Navigate to OTP screen: enter mobile + click Send OTP + wait for OTP UI */
    async sendOtp(mobile: string): Promise<void> {
        await this.enterMobileNumber(mobile);
        await this.clickSendOtp();
        // Wait for OTP Input 1 to appear — most reliable indicator the OTP screen loaded
        await expect(this.otpInput1).toBeVisible({ timeout: 15_000 });
        console.log('   ✅ OTP screen loaded');
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  STEP 2 — ENTER OTP & SUBMIT
    // ════════════════════════════════════════════════════════════════════════════

    private get otpBoxes(): Locator[] {
        return [
            this.otpInput1,
            this.otpInput2,
            this.otpInput3,
            this.otpInput4,
            this.otpInput5,
            this.otpInput6,
        ];
    }

    /**
     * Enters 6-digit OTP into individual boxes.
     * Each box gets its own digit; the Ant Design component auto-advances focus.
     */
    async enterOtp(otp: string): Promise<void> {
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
    async enterPartialOtp(otp: string): Promise<void> {
        const boxes = this.otpBoxes;
        for (let i = 0; i < otp.length; i++) {
            await boxes[i].click();
            await boxes[i].pressSequentially(otp[i], { delay: 80 });
        }
        console.log(`   🔢 Entered partial OTP: ${otp} (${otp.length}/6 digits)`);
    }

    async clickSubmitOtp(): Promise<void> {
        await expect(this.submitOtpButton).toBeEnabled({ timeout: 5_000 });
        await this.submitOtpButton.click();
        console.log('   🔘 Clicked Submit OTP');
    }

    /** Clear all OTP boxes (for retry scenarios) */
    async clearOtpBoxes(): Promise<void> {
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
    async login(mobile: string, otp: string): Promise<void> {
        await this.sendOtp(mobile);
        await this.enterOtp(otp);
        await this.clickSubmitOtp();
        await this.page.waitForURL('**/customers**', { timeout: 20_000 });
        console.log('   ✅ Login successful — now on Customers page');
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  STATE HELPERS
    // ════════════════════════════════════════════════════════════════════════════

    async isOnLoginPage(): Promise<boolean> {
        return await this.mobileInput.isVisible({ timeout: 3_000 }).catch(() => false);
    }

    async isOnOtpPage(): Promise<boolean> {
        return await this.otpInput1.isVisible({ timeout: 3_000 }).catch(() => false);
    }

    async isOnCustomersPage(): Promise<boolean> {
        return this.page.url().includes('/customers');
    }

    async getMobileInputValue(): Promise<string> {
        return await this.mobileInput.inputValue();
    }

    async getOtpBoxValue(boxNumber: 1 | 2 | 3 | 4 | 5 | 6): Promise<string> {
        return await this.otpBoxes[boxNumber - 1].inputValue();
    }

    async getToastText(): Promise<string> {
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

    async clickBackButton(): Promise<void> {
        await expect(this.backButton).toBeVisible({ timeout: 5_000 });
        await this.backButton.click();
        await expect(this.mobileInput).toBeVisible({ timeout: 8_000 });
        console.log('   ↩  Returned to mobile entry screen');
    }

    async screenshot(label: string): Promise<void> {
        const ts = Date.now();
        await this.page.screenshot({
            path: `reports/screenshots/${label}_${ts}.png`,
            fullPage: false,
        });
    }
}
