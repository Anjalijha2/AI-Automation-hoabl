// automation-repository/playwright.config.js
// Multi-project Playwright config — 6 test types, 5 portals, multi-session auth

const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const ROOT      = path.join(__dirname, '..');
const FIXTURES  = path.join(__dirname, 'fixtures');
const AUTH      = (portal) => path.join(FIXTURES, `.auth/${portal}.json`);

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
    baseURL:           process.env.BASE_URL || 'https://uat-web.xrportal.in/admin',
    actionTimeout:     15_000,
    navigationTimeout: 30_000,
    screenshot:        'on',
    video:             'retain-on-failure',
    trace:             'on-first-retry',
    headless:          process.env.HEADLESS === 'true',
    viewport:          { width: 1920, height: 900 },
  },

  projects: [
    // ── Auth setup ──────────────────────────────────────────────────────────
    {
      name: 'auth-setup',
      testDir: FIXTURES,
      testMatch: /.*auth\.setup\.js/,
    },

    // ── Login tests (no auth needed) ────────────────────────────────────────
    {
      name: 'login-tests',
      testMatch: /tests\/e2e\/admin\/login\.spec\.js/,
    },

    // ── E2E — per portal ────────────────────────────────────────────────────
    {
      name: 'e2e',
      testDir: path.join(ROOT, 'tests/e2e'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH('admin') },
    },

    // ── UI/UX ───────────────────────────────────────────────────────────────
    {
      name: 'ui-ux',
      testDir: path.join(ROOT, 'tests/ui-ux'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH('admin') },
    },

    // ── Regression ──────────────────────────────────────────────────────────
    {
      name: 'regression',
      testDir: path.join(ROOT, 'tests/regression'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH('admin') },
    },

    // ── API tests ───────────────────────────────────────────────────────────
    {
      name: 'api',
      testDir: path.join(ROOT, 'tests/api'),
      use: { baseURL: process.env.API_BASE_URL || 'https://uat-api.xrportal.in' },
    },

    // ── DB tests ────────────────────────────────────────────────────────────
    {
      name: 'db',
      testDir: path.join(ROOT, 'tests/db'),
    },

    // ── Smoke ───────────────────────────────────────────────────────────────
    {
      name: 'smoke',
      testDir: path.join(ROOT, 'tests/smoke'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH('admin') },
    },

    // ── Cross-browser ───────────────────────────────────────────────────────
    {
      name: 'chromium',
      testDir: path.join(ROOT, 'tests/cross-browser'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH('admin') },
    },
    {
      name: 'firefox',
      testDir: path.join(ROOT, 'tests/cross-browser'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Firefox'], storageState: AUTH('admin') },
    },
    {
      name: 'webkit',
      testDir: path.join(ROOT, 'tests/cross-browser'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Safari'], storageState: AUTH('admin') },
    },
  ],

  globalSetup: path.join(FIXTURES, 'global-setup.js'),
  outputDir: path.join(ROOT, 'test-results'),
});
