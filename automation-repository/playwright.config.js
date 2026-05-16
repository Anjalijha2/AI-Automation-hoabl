// automation-repository/playwright.config.js
// Multi-project Playwright config — sharding, reporters, storageState

const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const ROOT       = path.join(__dirname, '..');
const AUTH_STATE = path.join(__dirname, '01-fixtures/.auth/admin.json');

module.exports = defineConfig({
  testDir: path.join(ROOT, 'tests'),
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(ROOT, 'reports/html-report'), open: 'never' }],
    ['json', { outputFile: path.join(ROOT, 'reports/results.json') }],
  ],

  use: {
    baseURL:              process.env.BASE_URL || 'https://uat-web.xrportal.in/admin',
    actionTimeout:        15_000,
    navigationTimeout:    30_000,
    screenshot:           'on',
    video:                'retain-on-failure',
    trace:                'on-first-retry',
    headless:             process.env.HEADLESS === 'true',
    viewport:             { width: 1920, height: 900 },
  },

  projects: [
    // ── Auth setup (run once, saves storageState) ──────────────────────────
    {
      name: 'auth-setup',
      testMatch: /.*auth\.setup\.js/,
    },

    // ── Login tests (standalone — no storageState needed) ──────────────────
    {
      name: 'login-tests',
      testMatch: /tests\/e2e\/login\.spec\.js/,
    },

    // ── Smoke suite ────────────────────────────────────────────────────────
    {
      name: 'smoke',
      testDir: path.join(ROOT, 'tests/smoke'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH_STATE },
    },

    // ── Full regression ────────────────────────────────────────────────────
    {
      name: 'regression',
      testDir: path.join(ROOT, 'tests/e2e'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH_STATE },
    },

    // ── Cross-browser ──────────────────────────────────────────────────────
    {
      name: 'chromium',
      testDir: path.join(ROOT, 'tests/e2e'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH_STATE },
    },
    {
      name: 'firefox',
      testDir: path.join(ROOT, 'tests/e2e'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Firefox'], storageState: AUTH_STATE },
    },
    {
      name: 'webkit',
      testDir: path.join(ROOT, 'tests/e2e'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Safari'], storageState: AUTH_STATE },
    },
  ],

  globalSetup: path.join(__dirname, '01-fixtures/global-setup.js'),
  outputDir: path.join(ROOT, 'test-results'),
});
