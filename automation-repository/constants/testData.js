/**
 * Test Constants — XR Portal QA Framework
 * ----------------------------------------
 * Central place for all static test values.
 * Import anywhere: const { VALID_MOBILE, VALID_OTP } = require('../../automation-repository/constants/testData.js');
 */

module.exports = {
    // ── URLs ───────────────────────────────────────────────────────────────────
    BASE_URL:          'https://uat-web.xrportal.in/admin',
    CUSTOMER_PORTAL:   'https://uat.xrportal.in',

    // ── Auth credentials (UAT static OTP) ─────────────────────────────────────
    VALID_MOBILE:      '8888888888',
    VALID_OTP:         '258369',

    // ── Browser / Viewport ────────────────────────────────────────────────────
    VIEWPORT:          { width: 1920, height: 900 },

    // ── Timeouts (ms) ─────────────────────────────────────────────────────────
    DEFAULT_TIMEOUT:   15_000,
    NAV_TIMEOUT:       30_000,
};
