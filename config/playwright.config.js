/**
 * PLAYWRIGHT CONFIGURATION — XR Portal QA Framework
 * ==================================================
 * Located at: config/playwright.config.js
 * All paths use path.join(__dirname, '..') to resolve to project root.
 *
 * Run commands (from project root):
 *   npx playwright test --project=login-tests --headed --workers=1 --config config/playwright.config.js
 *   npx playwright test --project=regression --headed --workers=1 --config config/playwright.config.js
 *   npx playwright test --project=auth-setup --config config/playwright.config.js
 *   npx playwright show-report reports/html-report
 */

const path = require('path');
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: path.join(__dirname, '../tests'),
    fullyParallel: false,

    // Never allow .only in CI
    forbidOnly: !!process.env.CI,

    // Retry once on failure (helps with flaky network)
    retries: 1,

    // Always 1 worker so tests run sequentially (easy to watch in headed mode)
    workers: 1,

    // Reporters: HTML report + console list
    reporter: [
        ['html', { outputFolder: path.join(__dirname, '../reports/html-report'), open: 'never' }],
        ['json', { outputFile: path.join(__dirname, '../reports/results.json') }],
        ['list']
    ],

    outputDir: path.join(__dirname, '../test-results'),

    use: {
        baseURL: 'https://uat-web.xrportal.in/admin',

        // Capture trace on first retry (great for debugging)
        trace: 'on-first-retry',

        // Always take screenshots
        screenshot: 'on',

        // Keep video on failure
        video: 'retain-on-failure',

        // Headed by default; set HEADLESS=true env var to run headless
        headless: process.env.HEADLESS === 'true',
        viewport: { width: 1920, height: 900 },

        // Slow down all actions by 500ms so it looks like real user
        launchOptions: {
            slowMo: 500,
            args: [
                '--start-maximized',
                '--window-size=1920,1080',
                '--disable-blink-features=AutomationControlled',
                '--no-first-run',
                '--no-default-browser-check',
            ]
        },

        // Timeouts
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
    },

    projects: [
        // ── Auth Setup ──────────────────────────────────────────────
        {
            name: 'auth-setup',
            testMatch: /.*\.setup\.js/,
            use: { browserName: 'chromium' },
        },

        // ── Login Tests (standalone — no auth dependency) ───────────
        {
            name: 'login-tests',
            testMatch: /.*login\.spec\.js/,
            use: { browserName: 'chromium' },
        },

        // ── Smoke Tests ─────────────────────────────────────────────
        {
            name: 'smoke',
            testMatch: /.*smoke\.spec\.js/,
            dependencies: ['auth-setup'],
            use: {
                browserName: 'chromium',
                storageState: path.join(__dirname, '../src/fixtures/.auth/admin.json'),
            },
        },

        // ── Full Regression ─────────────────────────────────────────
        {
            name: 'regression',
            testMatch: /.*\.spec\.js/,
            testIgnore: [/.*smoke\.spec\.js/, /.*login\.spec\.js/],
            dependencies: ['auth-setup'],
            use: {
                browserName: 'chromium',
                storageState: path.join(__dirname, '../src/fixtures/.auth/admin.json'),
            },
        },

        // ── Cross-Browser: Chromium ──────────────────────────────────
        {
            name: 'chromium',
            testMatch: /.*\.spec\.js/,
            testIgnore: [/.*smoke\.spec\.js/, /.*login\.spec\.js/],
            dependencies: ['auth-setup'],
            use: {
                browserName: 'chromium',
                storageState: path.join(__dirname, '../src/fixtures/.auth/admin.json'),
            },
        },

        // ── Customer Portal Tests (No Admin Auth Dependency) ───────
        {
            name: 'customer',
            testMatch: /.*\.spec\.js/,
            testIgnore: [/.*smoke\.spec\.js/, /.*login\.spec\.js/],
            use: {
                browserName: 'chromium',
                // Customer tests use their own login flow in beforeEach
                storageState: { cookies: [], origins: [] },
            },
        },
    ],
});
