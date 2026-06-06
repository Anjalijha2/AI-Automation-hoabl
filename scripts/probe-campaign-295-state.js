// scripts/probe-campaign-295-state.js
// Probe admin endpoints to learn what's in campaign 295 + look at admin customers.

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT      = path.join(__dirname, '..');
const AUTH_ADM  = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const AUTH_SM   = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');
const OUT       = path.join(__dirname, '_probe-campaign-295-results.json');
const API_BASE  = 'https://uat-api.xrportal.in';
const VIEWPORT  = { width: 1920, height: 900 };

function tokenFrom(p) {
  const a = JSON.parse(fs.readFileSync(p, 'utf8'));
  return a.origins[0].localStorage.find(i => i.name === 'AUTH_TOKEN')?.value;
}

(async () => {
  const adminTok = tokenFrom(AUTH_ADM);
  const smTok    = tokenFrom(AUTH_SM);
  console.log('admin token:', !!adminTok, 'sm token:', !!smTok);

  const browser = await chromium.launch({ headless: true });
  const adminCtx = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH_ADM });
  const smCtx    = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH_SM });

  const results = { steps: [], errors: [] };

  async function call(ctx, label, method, url, body, tok) {
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (tok) headers.Authorization = `Bearer ${tok}`;
    try {
      const res = await ctx.request[method](url, { headers, data: body || undefined });
      const status = res.status();
      let text = '';
      try { text = await res.text(); } catch (e) { text = 'TEXT_FAIL'; }
      const out = { label, method, url, status, bodyPreview: text.slice(0, 2000) };
      console.log(`[${status}] ${label} ${method.toUpperCase()} ${url}`);
      results.steps.push(out);
      return out;
    } catch (e) {
      const out = { label, method, url, error: e.message };
      console.log(`[ERR] ${label}: ${e.message}`);
      results.steps.push(out);
      return out;
    }
  }

  // 1) Admin: campaign 295 detail
  await call(adminCtx, 'admin_campaign_detail', 'get',
    `${API_BASE}/api/v1/admin/allocation/campaigns/295`, null, adminTok);

  // 2) Admin: campaign 295 rounds
  await call(adminCtx, 'admin_campaign_rounds', 'get',
    `${API_BASE}/api/v1/admin/allocation/campaigns/295/rounds`, null, adminTok);

  // 3) Admin: campaign list (find PHYSICAL_EVENT)
  await call(adminCtx, 'admin_campaigns_list', 'get',
    `${API_BASE}/api/v1/admin/allocation/campaigns?page=1&limit=20`, null, adminTok);

  // 4) Admin: customers list (find registrations)
  await call(adminCtx, 'admin_customers_list', 'get',
    `${API_BASE}/api/v1/admin/customers?page=1&limit=10`, null, adminTok);

  // 5) Admin: campaign 295 allotments export (might confirm if any rows)
  await call(adminCtx, 'admin_campaign_allotments_export', 'get',
    `${API_BASE}/api/v1/admin/allocation/campaigns/295/allotments/export`, null, adminTok);

  // 6) SM: active campaign (project context — see what projectId)
  await call(smCtx, 'sm_active_campaign', 'get',
    `${API_BASE}/api/v1/sales-manager/physical-event/campaign/active`, null, smTok);

  // 7) SM: pool-towers (does the campaign have units?)
  await call(smCtx, 'sm_pool_towers', 'get',
    `${API_BASE}/api/v1/sales-manager/physical-event/pool-towers?campaignId=295`, null, smTok);

  // 8) SM: pool-units
  await call(smCtx, 'sm_pool_units', 'get',
    `${API_BASE}/api/v1/sales-manager/physical-event/pool-units?campaignId=295`, null, smTok);

  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log('\nWrote', OUT);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
