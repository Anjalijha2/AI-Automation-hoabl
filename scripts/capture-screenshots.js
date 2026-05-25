// scripts/capture-screenshots.js
// Desktop 1920x1080 screenshot capture for all portals.
// Usage:
//   node scripts/capture-screenshots.js --portal=admin
//   node scripts/capture-screenshots.js --portal=buyer
//   node scripts/capture-screenshots.js --portal=cp
//   node scripts/capture-screenshots.js --portal=sm
//
// Outputs: visual-memory/<portal>/<module>/screenshot-desktop.png

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH_DIR = path.join(ROOT, 'automation-repository', 'fixtures', '.auth');
const VM_DIR   = path.join(ROOT, 'visual-memory');

const VIEWPORT = { width: 1920, height: 1080 };

const PORTAL_CONFIG = {
  admin: {
    storageState: path.join(AUTH_DIR, 'admin.json'),
    modules: [
      { name: 'login',                url: 'https://uat-web.xrportal.in/admin',                 auth: false },
      { name: 'customers',            url: 'https://uat-web.xrportal.in/admin/customers',       auth: true  },
      { name: 'sales-managers',       url: 'https://uat-web.xrportal.in/admin/sales-managers',  auth: true  },
      { name: 'payment-transactions', url: 'https://uat-web.xrportal.in/admin/payment-transactions', auth: true },
      { name: 'allocation',           url: 'https://uat-web.xrportal.in/admin/allocations',     auth: true  },
      { name: 'towers',               url: 'https://uat-web.xrportal.in/admin/towers',          auth: true  },
      { name: 'jbp',                  url: 'https://uat-web.xrportal.in/admin/jbp',             auth: true  },
      { name: 'offers',               url: 'https://uat-web.xrportal.in/admin/offers',          auth: true  },
      { name: 'channel-partners',     url: 'https://uat-web.xrportal.in/admin/channel-partners',auth: true  },
      { name: 'admin-cms',            url: 'https://uat-web.xrportal.in/admin/cms',             auth: true  },
      { name: 'config',               url: 'https://uat-web.xrportal.in/admin/config',          auth: true  },
    ],
  },
  buyer: {
    storageState: path.join(AUTH_DIR, 'buyer.json'),
    modules: [
      { name: 'home-dashboard',       url: 'https://uat.xrportal.in/',                   auth: true  },
      { name: 'registration-login',   url: 'https://uat.xrportal.in/',                   auth: false },
      { name: 'kyc',                  url: 'https://uat.xrportal.in/profile/kyc',        auth: true  },
      { name: 'unit-details',         url: 'https://uat.xrportal.in/unit-details',       auth: true  },
      { name: 'project-information',  url: 'https://uat.xrportal.in/projects',           auth: true  },
      { name: 'payment-schedule',     url: 'https://uat.xrportal.in/payment-schedule',   auth: true  },
      { name: 'home-loan',            url: 'https://uat.xrportal.in/home-loan',          auth: true  },
      { name: 'allocation-experience',url: 'https://uat.xrportal.in/allocation',         auth: true  },
      { name: 'callback-request',     url: 'https://uat.xrportal.in/callback',           auth: true  },
      { name: 'support-tickets',      url: 'https://uat.xrportal.in/support',            auth: true  },
      { name: 'work-progress',        url: 'https://uat.xrportal.in/work-progress',      auth: true  },
    ],
  },
  cp: {
    storageState: path.join(AUTH_DIR, 'channel-partner.json'),
    modules: [
      { name: 'login',                url: 'https://uat-web.xrportal.in/',           auth: false },
      { name: 'leads-management',     url: 'https://uat-web.xrportal.in/leads',      auth: true  },
      { name: 'customer-registration',url: 'https://uat-web.xrportal.in/customers',  auth: true  },
      { name: 'kyc-assistance',       url: 'https://uat-web.xrportal.in/kyc',        auth: true  },
      { name: 'jbp-submission',       url: 'https://uat-web.xrportal.in/jbp',        auth: true  },
      { name: 'project-information',  url: 'https://uat-web.xrportal.in/projects',   auth: true  },
    ],
  },
  sm: {
    storageState: path.join(AUTH_DIR, 'sales-manager.json'),
    modules: [
      { name: 'login',                url: 'https://uat-web.xrportal.in/sales-manager',                 auth: false },
      { name: 'physical-allocation',  url: 'https://uat-web.xrportal.in/sales-manager/allocation',      auth: true  },
      { name: 'tower-heatmap',        url: 'https://uat-web.xrportal.in/sales-manager/tower-heatmap',   auth: true  },
      { name: 'callback-requests',    url: 'https://uat-web.xrportal.in/sales-manager/callbacks',       auth: true  },
    ],
  },
};

async function captureModule(browser, mod, storageState, portalKey) {
  const outDir = path.join(VM_DIR, portalKey, mod.name);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'screenshot-desktop.png');

  const contextOptions = {
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  };
  if (mod.auth && fs.existsSync(storageState)) {
    contextOptions.storageState = storageState;
  }

  const context = await browser.newContext(contextOptions);
  const page    = await context.newPage();

  try {
    await page.goto(mod.url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    // Settle UI animations
    await page.waitForTimeout(2000);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`  OK   ${mod.name.padEnd(28)} -> ${path.relative(ROOT, outPath)}`);
  } catch (err) {
    console.log(`  FAIL ${mod.name.padEnd(28)} -> ${err.message}`);
    // Still save whatever was rendered
    try { await page.screenshot({ path: outPath, fullPage: false }); } catch {}
  } finally {
    await context.close();
  }
}

(async () => {
  const arg = process.argv.find(a => a.startsWith('--portal='));
  const portalKey = arg ? arg.split('=')[1] : 'admin';

  if (!PORTAL_CONFIG[portalKey]) {
    console.error(`Unknown portal: ${portalKey}. Use admin | buyer | cp | sm`);
    process.exit(1);
  }
  const cfg = PORTAL_CONFIG[portalKey];

  console.log(`\n=== Capturing ${portalKey.toUpperCase()} portal screenshots @ 1920x1080 ===\n`);

  const browser = await chromium.launch({ headless: true });
  try {
    for (const mod of cfg.modules) {
      await captureModule(browser, mod, cfg.storageState, portalKey);
    }
  } finally {
    await browser.close();
  }
  console.log(`\nDone. Output: visual-memory/${portalKey}/\n`);
})();
