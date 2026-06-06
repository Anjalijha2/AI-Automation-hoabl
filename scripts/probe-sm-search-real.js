// Try searching SM for the 3 real registrations in campaign 295.
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH_SM  = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');
const OUT      = path.join(__dirname, '_probe-sm-search-real-results.json');
const API_BASE = 'https://uat-api.xrportal.in';
const VIEWPORT = { width: 1920, height: 900 };

function tokenFrom(p) {
  const a = JSON.parse(fs.readFileSync(p, 'utf8'));
  return a.origins[0].localStorage.find(i => i.name === 'AUTH_TOKEN')?.value;
}

(async () => {
  const tok = tokenFrom(AUTH_SM);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH_SM });

  const queries = [
    'GHNG-2000000014-A',
    'GHNG-2000000024-A',
    'GHNG-2000000009-Y',
    'GHNG-2000000014',
    '2000000014',
    '2000000024',
    '2000000009',
    'GHNG-',
    '00000014',
  ];

  const results = [];
  for (const q of queries) {
    const url = `${API_BASE}/api/v1/sales-manager/physical-event/search?campaignId=295&q=${encodeURIComponent(q)}`;
    const res = await ctx.request.get(url, { headers: { Authorization: `Bearer ${tok}` } });
    const body = await res.text();
    const obj = { q, status: res.status(), bodyPreview: body.slice(0, 1500) };
    console.log(`[${res.status()}] q="${q}" -> ${body.length} chars`);
    results.push(obj);
  }

  // Also try fetching customer context for one registration directly
  for (const rid of ['GHNG-2000000014-A', 'GHNG-2000000009-Y']) {
    const url = `${API_BASE}/api/v1/sales-manager/physical-event/customer?campaignId=295&registrationId=${encodeURIComponent(rid)}`;
    const res = await ctx.request.get(url, { headers: { Authorization: `Bearer ${tok}` } });
    const body = await res.text();
    console.log(`[${res.status()}] customer context ${rid}`);
    results.push({ kind: 'customer-context', rid, status: res.status(), bodyPreview: body.slice(0, 2000) });
  }

  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log('\nWrote', OUT);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
