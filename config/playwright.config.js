// config/playwright.config.js
// All paths resolve relative to project root (one level up from config/).
const path = require('path');
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ROOT = path.join(__dirname, '..');
const AUTH_STATE = path.join(ROOT, 'automation-repository/fixtures/.auth/admin.json');

module.exports = defineConfig({
  testDir: path.join(ROOT, 'tests'),
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,

  // --- Reporting ---
  reporter: [
    ['html', { outputFolder: path.join(ROOT, 'reports/html-report'), open: 'never' }],
    ['json', { outputFile: path.join(ROOT, 'reports/results.json') }],
    ['list'],
  ],

  outputDir: path.join(ROOT, 'test-results'),

  // --- Shared settings ---
  use: {
    baseURL: process.env.BASE_URL || 'https://uat-web.xrportal.in/admin',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
    headless: process.env.HEADLESS === 'true',
    viewport: { width: 1920, height: 900 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    launchOptions: {
      slowMo: 500,
      args: [
        '--start-maximized',
        '--window-size=1920,1080',
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check',
      ],
    },
  },

  projects: [
    // Auth setup — runs once, saves session to admin.json
    {
      name: 'auth-setup',
      testMatch: /.*\.setup\.js/,
      use: { browserName: 'chromium' },
    },

    // Login tests — standalone, no stored session needed
    {
      name: 'login-tests',
      testMatch: /tests\/e2e\/login\.spec\.js/,
      use: { browserName: 'chromium' },
    },

    // Smoke suite
    {
      name: 'smoke',
      testDir: path.join(ROOT, 'tests/smoke'),
      testMatch: /.*\.spec\.js/,
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH_STATE },
    },

    // Full regression — all e2e specs
    {
      name: 'regression',
      testDir: path.join(ROOT, 'tests/e2e'),
      testMatch: /.*\.spec\.js/,
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH_STATE },
    },

    // Cross-browser
    {
      name: 'chromium',
      testDir: path.join(ROOT, 'tests/e2e'),
      testMatch: /.*\.spec\.js/,
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH_STATE },
    },
    {
      name: 'firefox',
      testDir: path.join(ROOT, 'tests/e2e'),
      testMatch: /.*\.spec\.js/,
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Firefox'], storageState: AUTH_STATE },
    },
    {
      name: 'webkit',
      testDir: path.join(ROOT, 'tests/e2e'),
      testMatch: /.*\.spec\.js/,
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Safari'], storageState: AUTH_STATE },
    },
  ],
});
