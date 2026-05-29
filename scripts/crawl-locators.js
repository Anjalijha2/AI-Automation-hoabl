// scripts/crawl-locators.js
// Live-crawls XR Portal UAT URLs and extracts selectors per module.
// Writes/merges results into locators/<portal>/locator-map.json.
//
// Priority order (per .claude/skills/locator-map-builder.md):
//   1. #id              5. :text() — fallback only
//   2. [data-testid]
//   3. [aria-label]
//   4. specific CSS class + tag
//
// Output schema matches existing locators/admin/locator-map.json:
//   { "_meta": {portal, version, lastUpdated, maintainer, changelog},
//     "<module>": { "<key>": { selector, type, fallback, aria_role, deprecated, changelog: [] } } }
//
// Auth: reuses fixtures/.auth/<portal>.json sessions (refresh via `npm run auth:setup` if stale).
//
// Run:  node scripts/crawl-locators.js                  (all 4 portals)
//       node scripts/crawl-locators.js --portal=sm
//       node scripts/crawl-locators.js --portal=buyer --module=kyc

'use strict';
const { chromium } = require('playwright');
const fs   = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const AUTH_DIR   = path.join(ROOT, 'automation-repository', 'fixtures', '.auth');
const LOCATORS   = path.join(ROOT, 'locators');

// ─── Module URL map per portal ───────────────────────────────────────────────

const PORTALS = {
  admin: {
    base: 'https://uat-web.xrportal.in',
    authFile: path.join(AUTH_DIR, 'admin.json'),
    modules: {
      'login':                { path: '/admin', auth: false },
      'dashboard':            { path: '/admin/dashboard', auth: true },
      'customers':            { path: '/admin/customers', auth: true },
      'sales-managers':       { path: '/admin/sales-managers', auth: true },
      'payment-transactions': { path: '/admin/payment-transactions', auth: true },
      'allocation':           { path: '/admin/allocation', auth: true },
      'towers':               { path: '/admin/towers', auth: true },
      'jbp':                  { path: '/admin/jbp', auth: true },
      'offers':               { path: '/admin/offers', auth: true },
      'channel-partners':     { path: '/admin/channel-partners', auth: true },
      'admin-cms':            { path: '/admin/cms', auth: true },
      'config':               { path: '/admin/config', auth: true },
    },
  },
  buyer: {
    base: 'https://uat.xrportal.in',
    authFile: path.join(AUTH_DIR, 'buyer.json'),
    modules: {
      'registration-login':    { path: '/', auth: false },
      'home-dashboard':        { path: '/home', auth: true },
      'kyc':                   { path: '/kyc', auth: true },
      'unit-details':          { path: '/unit-details', auth: true },
      'project-information':   { path: '/project', auth: true },
      'payment-schedule':      { path: '/payment-schedule', auth: true },
      'home-loan':             { path: '/homeloan', auth: true },
      'allocation-experience': { path: '/allotment', auth: true },
      'callback-request':      { path: '/callback-request', auth: true },
      'support-tickets':       { path: '/support', auth: true },
      'work-progress':         { path: '/work-progress', auth: true },
    },
  },
  'channel-partner': {
    base: 'https://uat-web.xrportal.in',
    authFile: path.join(AUTH_DIR, 'channel-partner.json'),
    modules: {
      'login':                 { path: '/login', auth: false },
      'leads-management':      { path: '/leads', auth: true },
      'customer-registration': { path: '/dashboard', auth: true },
      'kyc-assistance':        { path: '/kyc', auth: true },
      'jbp-submission':        { path: '/jbp', auth: true },
      'project-information':   { path: '/project1', auth: true },
    },
  },
  'sales-manager': {
    base: 'https://uat-web.xrportal.in',
    authFile: path.join(AUTH_DIR, 'sales-manager.json'),
    modules: {
      'login':              { path: '/sales-manager', auth: false },
      'callback-requests':  { path: '/sales-manager/callback-requests', auth: true },
      'tower-heatmap':      { path: '/sales-manager/towers', auth: true },
      'physical-allocation': { path: '/sales-manager/physical-allocation', auth: true },
    },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function camelKey(s) {
  return s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
          .replace(/^[A-Z]/, c => c.toLowerCase())
          .replace(/[^a-zA-Z0-9]/g, '');
}

function uniqueKey(map, base) {
  if (!map[base]) return base;
  let i = 2;
  while (map[`${base}${i}`]) i++;
  return `${base}${i}`;
}

// ─── Page extraction — runs inside the browser context ───────────────────────

async function extractFromPage(page) {
  return await page.evaluate(() => {
    const result = [];

    function safeText(el) {
      const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
      return t.length > 0 && t.length < 60 ? t : '';
    }

    function describe(el) {
      // Build a semantic key from text/placeholder/name when available
      const tag = el.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        const t = el.getAttribute('type') || 'text';
        const ph  = el.getAttribute('placeholder');
        const nm  = el.getAttribute('name');
        const lbl = el.getAttribute('aria-label');
        if (ph)  return { key: ph + ' input',  selector: `input[placeholder="${ph}"]` };
        if (nm)  return { key: nm + ' input',  selector: `${tag}[name="${nm}"]` };
        if (lbl) return { key: lbl,            selector: `[aria-label="${lbl}"]` };
        return   { key: `${t} input`,          selector: `${tag}[type="${t}"]` };
      }
      if (tag === 'select') {
        const nm = el.getAttribute('name');
        if (nm) return { key: nm + ' select', selector: `select[name="${nm}"]` };
      }
      if (tag === 'button' || el.getAttribute('role') === 'button') {
        const txt = safeText(el);
        if (txt) return { key: txt + ' button', selector: `button:has-text("${txt}")` };
      }
      if (tag === 'a') {
        const txt = safeText(el);
        const href = el.getAttribute('href');
        if (txt) return { key: txt + ' link', selector: `a:has-text("${txt}")` };
        if (href) return { key: href + ' link', selector: `a[href="${href}"]` };
      }
      if (/^h[1-6]$/.test(tag)) {
        const txt = safeText(el);
        if (txt) return { key: txt + ' heading', selector: `${tag}:has-text("${txt}")` };
      }
      return null;
    }

    function pick(el, role) {
      if (el.id && /^[a-zA-Z][\w-]*$/.test(el.id)) {
        return { selector: `#${el.id}`, type: 'id', key: el.id, role };
      }
      const testid = el.getAttribute('data-testid');
      if (testid) {
        return { selector: `[data-testid="${testid}"]`, type: 'data-testid', key: testid, role };
      }
      const aria = el.getAttribute('aria-label');
      if (aria && aria.length < 50) {
        return { selector: `[aria-label="${aria}"]`, type: 'aria', key: aria, role };
      }
      // Semantic description via placeholder/name/text
      const desc = describe(el);
      if (desc) {
        const type = desc.selector.includes(':has-text') ? 'text'
                   : desc.selector.includes('[placeholder') ? 'css'
                   : desc.selector.includes('[name') ? 'css'
                   : desc.selector.includes('[aria-label') ? 'aria'
                   : 'css';
        return { selector: desc.selector, type, key: desc.key, role };
      }
      // CSS fallback: tag + first stable class
      const cls = Array.from(el.classList).find(c => !/^[A-Z]/.test(c) && !/^(css|sc-|tw-|jss|MuiBase|MuiInputBase-input|ant-)/i.test(c) && c.length > 2 && c.length < 30);
      if (cls) {
        return { selector: `${el.tagName.toLowerCase()}.${cls}`, type: 'css', key: cls, role };
      }
      return null;
    }

    // Interactive elements
    const selectors = [
      'button', 'a[href]', 'input', 'select', 'textarea',
      '[role="button"]', '[role="link"]', '[role="tab"]', '[role="menuitem"]',
      'h1', 'h2', 'h3',
      '[data-testid]',
    ];

    const seen = new Set();
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (seen.has(el)) return;
        seen.add(el);
        // skip hidden
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;

        const role = el.getAttribute('role') || el.tagName.toLowerCase();
        const picked = pick(el, role);
        if (picked) result.push(picked);
      });
    });

    return result;
  });
}

// ─── Merge extracted elements into module entry ──────────────────────────────

function mergeModule(existingModule, extracted) {
  const out = { ...(existingModule || {}) };
  const today = new Date().toISOString().slice(0, 10);

  for (const e of extracted) {
    let key = camelKey(e.key);
    if (!key || key.length < 2) continue;
    key = uniqueKey(out, key);
    if (out[key]) {
      // already exists — only add changelog if selector differs
      if (out[key].selector !== e.selector) {
        out[key].changelog = out[key].changelog || [];
        if (!out[key].changelog.find(c => c.includes(e.selector))) {
          out[key].changelog.push(`${today} — observed alt selector: ${e.selector}`);
        }
      }
      continue;
    }
    out[key] = {
      selector:    e.selector,
      type:        e.type,
      fallback:    '',
      aria_role:   e.role,
      deprecated:  false,
      added:       today,
      changelog:   [`${today} — added via live crawl`],
    };
  }
  return out;
}

// ─── Portal crawler ──────────────────────────────────────────────────────────

async function crawlPortal(portalSlug, opts = {}) {
  const cfg = PORTALS[portalSlug];
  if (!cfg) throw new Error(`Unknown portal: ${portalSlug}`);

  const mapDir  = path.join(LOCATORS, portalSlug);
  const mapPath = path.join(mapDir, 'locator-map.json');
  fs.mkdirSync(mapDir, { recursive: true });

  let map = { _meta: { portal: portalSlug, version: '1.0.0', lastUpdated: new Date().toISOString().slice(0, 10), maintainer: 'Tech Lead Agent — Live Crawl', changelog: [] } };
  if (fs.existsSync(mapPath)) {
    try { map = JSON.parse(fs.readFileSync(mapPath, 'utf8')); } catch (e) { console.warn(`  (existing map unparseable, starting fresh)`); }
  }

  const hasAuth = fs.existsSync(cfg.authFile);
  const browser = await chromium.launch({ headless: true });

  console.log(`\n=== ${portalSlug} ===`);
  const modules = opts.module ? { [opts.module]: cfg.modules[opts.module] } : cfg.modules;

  // Each module gets a fresh context so visiting a login URL doesn't clobber
  // the auth state for subsequent protected pages
  for (const [modName, mod] of Object.entries(modules)) {
    if (!mod) { console.log(`  skip ${modName} — no URL config`); continue; }
    const url = cfg.base + mod.path;
    const useAuth = mod.auth && hasAuth;
    const ctxOpts = useAuth ? { storageState: cfg.authFile } : {};
    const ctx = await browser.newContext({ ...ctxOpts, viewport: { width: 1920, height: 900 } });
    const page = await ctx.newPage();
    process.stdout.write(`  ${modName.padEnd(28)} ${url}${useAuth ? ' [auth]' : ''}\n`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
      await page.waitForTimeout(2500); // let lazy components mount
      const extracted = await extractFromPage(page);
      console.log(`    extracted ${extracted.length} elements`);
      map[modName] = mergeModule(map[modName], extracted);
    } catch (err) {
      console.warn(`    ERROR: ${err.message}`);
    }
    await ctx.close();
  }

  await browser.close();

  // Bump version + changelog
  const oldV = (map._meta && map._meta.version) || '1.0.0';
  const parts = oldV.split('.').map(Number);
  parts[1] = (parts[1] || 0) + 1;
  parts[2] = 0;
  const newV = parts.join('.');
  const today = new Date().toISOString().slice(0, 10);
  map._meta = map._meta || {};
  map._meta.portal = portalSlug;
  map._meta.version = newV;
  map._meta.lastUpdated = today;
  map._meta.maintainer = map._meta.maintainer || 'Tech Lead Agent — Live Crawl';
  map._meta.changelog = map._meta.changelog || [];
  map._meta.changelog.push(`${newV} — live-crawl pass on ${today} for ${Object.keys(modules).join(', ')}`);

  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
  const totalKeys = Object.values(map).filter(v => typeof v === 'object' && !v.portal).reduce((s, m) => s + Object.keys(m).length, 0);
  console.log(`  WROTE ${mapPath}  (v${newV}, ${totalKeys} total elements)`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const portalArg = args.find(a => a.startsWith('--portal='));
  const modArg    = args.find(a => a.startsWith('--module='));
  const only = portalArg ? portalArg.split('=')[1] : null;
  const mod  = modArg    ? modArg.split('=')[1]    : null;

  const targets = only ? [only] : Object.keys(PORTALS);
  for (const p of targets) {
    if (!PORTALS[p]) { console.error(`Unknown portal "${p}"`); continue; }
    await crawlPortal(p, { module: mod });
  }
  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
