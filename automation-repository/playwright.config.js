// automation-repository/playwright.config.js
// Multi-project Playwright config — 6 test types, 5 portals, multi-session auth

const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const os = require('os');
const dotenv = require('dotenv');

dotenv.config();

const ROOT      = path.join(__dirname, '..');
const FIXTURES  = path.join(__dirname, 'fixtures');
const AUTH      = (portal) => path.join(FIXTURES, `.auth/${portal}.json`);

// ── agent-browser integration ────────────────────────────────────────────────
// Per the `use-agent-browser` skill, browser execution runs on the agent-browser
// Chrome when available. We auto-detect the Chrome that `agent-browser install`
// downloaded (~/.agent-browser/browsers/chrome-*/chrome[.exe]) and point Playwright
// at it via executablePath.
//
// BROWSER SELECTION (default = system Google Chrome):
//   • Default: `channel: 'chrome'` → uses the system-installed Google Chrome. No Playwright
//     download needed, renders the XR Portal app cleanly (no white screen), reliable uploads.
//     This is the default because the bundled Playwright chromium does not install in this
//     environment (extraction wedges), and agent-browser's Chrome 150 white-screens the app.
//   • PW_CHANNEL=<channel> → use a specific channel (e.g. msedge, chrome-beta).
//   • PW_CHANNEL=bundled → use Playwright's bundled chromium (if installed).
//   • USE_AGENT_BROWSER=true / AGENT_BROWSER_CHROME=<path> → run on agent-browser's Chrome.
// agent-browser itself remains the tool for interactive/diagnostic browser work.
function findAgentBrowserChrome() {
  if (process.env.AGENT_BROWSER_CHROME) return process.env.AGENT_BROWSER_CHROME;
  if (process.env.USE_AGENT_BROWSER !== 'true') return undefined;
  try {
    const base = path.join(os.homedir(), '.agent-browser', 'browsers');
    if (!fs.existsSync(base)) return undefined;
    for (const d of fs.readdirSync(base)) {
      for (const bin of ['chrome.exe', 'chrome']) {
        const exe = path.join(base, d, bin);
        if (fs.existsSync(exe)) return exe;
      }
    }
  } catch { /* fall back to system chrome */ }
  return undefined;
}
const AGENT_BROWSER_CHROME = findAgentBrowserChrome();

// Resolve the browser channel. Default: system Google Chrome. PW_CHANNEL=bundled forces
// Playwright's bundled chromium (channel undefined + no executablePath). agent-browser's
// Chrome (executablePath) takes precedence over a channel when explicitly requested.
function resolveChannel() {
  if (AGENT_BROWSER_CHROME) return undefined;            // executablePath path → no channel
  if (process.env.PW_CHANNEL === 'bundled') return undefined;
  return process.env.PW_CHANNEL || 'chrome';             // default: system Google Chrome
}
const PW_CHANNEL = resolveChannel();

module.exports = defineConfig({
  testDir: path.join(ROOT, 'tests'),
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,

  reporter: [
    [path.join(__dirname, 'reporters', 'step-reporter.js')],
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
    viewport:          process.env.HEADLESS === 'true' ? { width: 1920, height: 1080 } : null,
    // Default browser = system Google Chrome (PW_CHANNEL resolved above). No download,
    // renders the app cleanly (no white screen), reliable uploads.
    channel:           PW_CHANNEL,
    // Video defaults OFF: it needs the Playwright ffmpeg binary, which isn't available in
    // this environment (system Chrome has no bundled ffmpeg). Screenshots ('on') remain the
    // evidence source. Set VIDEO=retain-on-failure to re-enable once ffmpeg is installed.
    video:             process.env.VIDEO || 'off',
    launchOptions:     {
      args: process.env.HEADLESS === 'true'
        ? ['--headless=new', '--no-first-run', '--no-default-browser-check']
        : ['--start-maximized', '--window-size=1920,1080'],
      // channel and executablePath are mutually exclusive — executablePath (agent-browser)
      // only applies when no channel is resolved.
      ...((!PW_CHANNEL && AGENT_BROWSER_CHROME) ? { executablePath: AGENT_BROWSER_CHROME } : {}),
    },
  },

  projects: [
    // ── Auth setup (split per portal so dependents auth ONLY their portal) ─
    // Each setup() in auth.setup.js has a distinct title — we grep to scope.
    {
      name: 'auth-setup',
      testDir: FIXTURES,
      testMatch: /.*auth\.setup\.js/,
      // Default: run ALL portals when invoked explicitly (npm run auth:setup)
    },
    { name: 'auth-setup-admin',           testDir: FIXTURES, testMatch: /.*auth\.setup\.js/, grep: /authenticate as admin$/ },
    { name: 'auth-setup-sales-manager',   testDir: FIXTURES, testMatch: /.*auth\.setup\.js/, grep: /authenticate as sales manager/ },
    { name: 'auth-setup-channel-partner', testDir: FIXTURES, testMatch: /.*auth\.setup\.js/, grep: /authenticate as channel partner \(/ },
    { name: 'auth-setup-cp-incomplete',   testDir: FIXTURES, testMatch: /.*auth\.setup\.js/, grep: /channel partner.*incomplete/i },
    { name: 'auth-setup-buyer',           testDir: FIXTURES, testMatch: /.*auth\.setup\.js/, grep: /authenticate as buyer/ },

    // ── Login tests (no auth needed) ────────────────────────────────────────
    {
      name: 'login-tests',
      testMatch: /tests\/e2e\/admin\/login\.spec\.js/,
    },

    // ── E2E — per portal ────────────────────────────────────────────────────
    // 'e2e' is the legacy catch-all. Use portal-scoped projects below for
    // faster runs (only the relevant portal auth runs).
    {
      name: 'e2e',
      testDir: path.join(ROOT, 'tests/e2e'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], viewport: null, deviceScaleFactor: undefined, storageState: AUTH('admin') },
    },
    {
      name: 'e2e-admin',
      testDir: path.join(ROOT, 'tests/e2e/admin'),
      dependencies: ['auth-setup-admin'],
      use: { ...devices['Desktop Chrome'], viewport: null, deviceScaleFactor: undefined, storageState: AUTH('admin') },
    },
    {
      name: 'e2e-sales-manager',
      testDir: path.join(ROOT, 'tests/e2e/sales-manager'),
      dependencies: ['auth-setup-sales-manager'],
      use: { ...devices['Desktop Chrome'], viewport: null, deviceScaleFactor: undefined, storageState: AUTH('sales-manager') },
    },
    {
      name: 'e2e-cp',
      testDir: path.join(ROOT, 'tests/e2e/cp'),
      dependencies: ['auth-setup-channel-partner'],
      use: { ...devices['Desktop Chrome'], viewport: null, deviceScaleFactor: undefined, storageState: AUTH('channel-partner') },
    },
    {
      name: 'e2e-buyer',
      testDir: path.join(ROOT, 'tests/e2e/buyer'),
      dependencies: ['auth-setup-buyer'],
      use: { ...devices['Desktop Chrome'], viewport: null, deviceScaleFactor: undefined, storageState: AUTH('buyer') },
    },

    // ── UI/UX ───────────────────────────────────────────────────────────────
    {
      name: 'ui-ux',
      testDir: path.join(ROOT, 'tests/ui-ux'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], viewport: null, deviceScaleFactor: undefined, storageState: AUTH('admin') },
    },

    // ── Regression ──────────────────────────────────────────────────────────
    {
      name: 'regression',
      testDir: path.join(ROOT, 'tests/regression'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], viewport: null, deviceScaleFactor: undefined, storageState: AUTH('admin') },
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
      use: { ...devices['Desktop Chrome'], viewport: null, deviceScaleFactor: undefined, storageState: AUTH('admin') },
    },

    // ── Cross-browser ───────────────────────────────────────────────────────
    {
      name: 'chromium',
      testDir: path.join(ROOT, 'tests/cross-browser'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], viewport: null, deviceScaleFactor: undefined, storageState: AUTH('admin') },
    },
    {
      name: 'firefox',
      testDir: path.join(ROOT, 'tests/cross-browser'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Firefox'], viewport: null, deviceScaleFactor: undefined, storageState: AUTH('admin') },
    },
    {
      name: 'webkit',
      testDir: path.join(ROOT, 'tests/cross-browser'),
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Safari'], viewport: null, deviceScaleFactor: undefined, storageState: AUTH('admin') },
    },
  ],

  globalSetup: path.join(FIXTURES, 'global-setup.js'),
  outputDir: path.join(ROOT, 'test-results'),
});
