/**
 * ============================================================
 * AGENT 0 — DISCOVERY AGENT
 * ============================================================
 * Purpose : Crawl the web application UI before any testing starts.
 * 
 * Responsibilities:
 *   - Navigate all pages/modules of the portal
 *   - Extract DOM selectors (inputs, buttons, tables, filters)
 *   - Capture screenshots of each page
 *   - Output a structured portal-map.json and dom-selectors.json
 *
 * Outputs:
 *   discovery/portal-map.json
 *   discovery/dom-selectors.json
 *   discovery/screenshots/<pageName>.png
 *
 * Rules:
 *   - Do NOT generate test cases
 *   - Do NOT generate automation scripts
 *   - ONLY analyze and document UI structure
 *
 * Run:
 *   npx ts-node agents/agent0-discovery.ts
 * ============================================================
 */

import { chromium, Browser, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://uat-web.xrportal.in/admin';
const MOBILE   = '8888888888';
const OTP      = '258369';

const OUTPUT_DIR       = path.join(process.cwd(), 'discovery');
const SCREENSHOT_DIR   = path.join(OUTPUT_DIR, 'screenshots');
const PORTAL_MAP_FILE  = path.join(OUTPUT_DIR, 'portal-map.json');
const SELECTORS_FILE   = path.join(OUTPUT_DIR, 'dom-selectors.json');

// ── Modules to discover (extend this list as new pages are added) ─────────────
const MODULES = [
  { name: 'Customers',        url: '/customers' },
  { name: 'Config',           url: '/config' },
  { name: 'Allocation',       url: '/allocation' },
  { name: 'Towers',           url: '/towers' },
  { name: 'JBP Management',   url: '/jbp-management' },
  { name: 'Channel Partners',  url: '/channel-partners' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function ensureDirs() {
  [OUTPUT_DIR, SCREENSHOT_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));
}

async function loginToPortal(page: Page): Promise<void> {
  console.log('🔐 [Agent 0] Logging in...');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.fill('input[placeholder="Enter Mobile Number"]', MOBILE);
  await page.click('button:has-text("Send OTP")');

  const otpBoxes = await page.locator('input.ant-otp-input').all();
  for (let i = 0; i < OTP.length; i++) {
    await otpBoxes[i].fill(OTP[i]);
  }
  await page.click('button:has-text("Submit OTP")');
  await page.waitForURL('**/customers**', { timeout: 20_000 });
  console.log('✅ [Agent 0] Login successful');
}

async function discoverPage(page: Page, moduleName: string, url: string): Promise<Record<string, any>> {
  console.log(`\n🔍 [Agent 0] Discovering: ${moduleName}`);
  await page.goto(`${BASE_URL}${url}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Screenshot
  const screenshotPath = path.join(SCREENSHOT_DIR, `${moduleName.replace(/\s/g, '_')}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`   📸 Screenshot saved: ${screenshotPath}`);

  // Extract DOM elements
  const elements = await page.evaluate(() => {
    const result: Record<string, string[]> = {
      inputs: [], buttons: [], tables: [], selects: [], links: [],
    };

    document.querySelectorAll('input').forEach(el => {
      const id = el.id || el.name || el.placeholder || el.getAttribute('aria-label') || '';
      if (id) result.inputs.push(id);
    });
    document.querySelectorAll('button').forEach(el => {
      if (el.textContent?.trim()) result.buttons.push(el.textContent.trim().slice(0, 60));
    });
    document.querySelectorAll('table, .ant-table').forEach(el => {
      result.tables.push(el.className || 'unnamed-table');
    });
    document.querySelectorAll('select, .ant-select').forEach(el => {
      result.selects.push(el.id || el.className || 'unnamed-select');
    });
    return result;
  });

  return { module: moduleName, url, screenshot: screenshotPath, elements };
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function runDiscovery() {
  ensureDirs();
  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await loginToPortal(page);

    const portalMap: Record<string, any>[] = [];
    const domSelectors: Record<string, any> = {};

    for (const module of MODULES) {
      const discovery = await discoverPage(page, module.name, module.url);
      portalMap.push({ module: module.name, url: `${BASE_URL}${module.url}` });
      domSelectors[module.name] = discovery.elements;
    }

    fs.writeFileSync(PORTAL_MAP_FILE, JSON.stringify(portalMap, null, 2));
    fs.writeFileSync(SELECTORS_FILE, JSON.stringify(domSelectors, null, 2));

    console.log('\n✅ [Agent 0] DISCOVERY COMPLETE');
    console.log(`   📄 Portal Map  → ${PORTAL_MAP_FILE}`);
    console.log(`   📄 Selectors   → ${SELECTORS_FILE}`);
    console.log(`   📸 Screenshots → ${SCREENSHOT_DIR}`);

  } finally {
    await browser.close();
  }
}

runDiscovery().catch(console.error);
