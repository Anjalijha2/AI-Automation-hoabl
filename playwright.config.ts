/**
 * PLAYWRIGHT CONFIGURATION — XR Portal QA Framework
 * ==================================================
 * Run login tests:
 *   npx playwright test login.spec.ts --headed --workers=1
 *
 * Run all tests:
 *   npx playwright test --headed --workers=1
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './automation/tests',
    fullyParallel: false,

    // Never allow .only in CI
    forbidOnly: !!process.env.CI,

    // Retry once on failure (helps with flaky network)
    retries: 1,

    // Always 1 worker so tests run sequentially (easy to watch in headed mode)
    workers: 1,

    // Reporters: HTML report + console list
    reporter: [
        ['html', { outputFolder: 'reports/html-report', open: 'never' }],
        ['json', { outputFile: 'reports/results.json' }],
        ['list']
    ],

    use: {
        baseURL: 'https://uat-web.xrportal.in/admin',

        // Capture trace on first retry (great for debugging)
        trace: 'on-first-retry',

        // Always take screenshots
        screenshot: 'on',

        // Keep video on failure
        video: 'retain-on-failure',

        // Always run headed and maximized
        // Height 900 (not 1080) leaves room for browser chrome (~140px: taskbar+toolbar).
        // With 1080, .ant-layout-content extends to y=1080 which is below the ~940px
        // physical visible area — bottom elements (pagination) land off-screen.
        headless: false,
        viewport: { width: 1920, height: 900 },

        // Slow down all actions by 500ms so it looks like real user
        launchOptions: {
            slowMo: 500,
            args: ['--start-maximized', '--window-size=1920,1080']
        },

        // Timeouts
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
    },

    projects: [
        // ── Auth Setup ──────────────────────────────────────────────
        // Saves session state for other test suites.
        // Login tests handle their own auth — no dependency needed.
        {
            name: 'auth-setup',
            testMatch: /.*\.setup\.ts/,
            use: { browserName: 'chromium' },
        },

        // ── Login Tests (standalone — no auth dependency) ───────────
        {
            name: 'login-tests',
            testMatch: /.*login\.spec\.ts/,
            use: {
                browserName: 'chromium',
            },
        },

        // ── Smoke Tests ─────────────────────────────────────────────
        {
            name: 'smoke',
            testMatch: /.*\.smoke\.spec\.ts/,
            dependencies: ['auth-setup'],
            use: {
                browserName: 'chromium',
                storageState: './automation/fixtures/.auth/admin.json',
            },
        },

        // ── Full Regression ─────────────────────────────────────────
        {
            name: 'regression',
            testMatch: /.*\.spec\.ts/,
            testIgnore: [/.*\.smoke\.spec\.ts/, /.*login\.spec\.ts/],
            dependencies: ['auth-setup'],
            use: {
                browserName: 'chromium',
                storageState: './automation/fixtures/.auth/admin.json',
            },
        },
    ],
});
