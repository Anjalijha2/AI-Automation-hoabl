// Download campaign 295 allotments Excel, parse it to find real registrations + phones.
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT     = path.join(__dirname, '..');
const AUTH_ADM = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_XL   = path.join(__dirname, '_campaign-295-allotments.xlsx');
const OUT_JSON = path.join(__dirname, '_campaign-295-allotments.json');
const VIEWPORT = { width: 1920, height: 900 };

function tokenFrom(p) {
  const a = JSON.parse(fs.readFileSync(p, 'utf8'));
  return a.origins[0].localStorage.find(i => i.name === 'AUTH_TOKEN')?.value;
}

(async () => {
  const tok = tokenFrom(AUTH_ADM);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH_ADM });

  const res = await ctx.request.get(
    'https://uat-api.xrportal.in/api/v1/admin/allocation/campaigns/295/allotments/export',
    { headers: { Authorization: `Bearer ${tok}` } }
  );
  console.log('status', res.status());
  const buf = await res.body();
  fs.writeFileSync(OUT_XL, buf);
  console.log('xlsx bytes', buf.length, '->', OUT_XL);

  const wb = XLSX.read(buf, { type: 'buffer' });
  const out = {};
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    out[name] = XLSX.utils.sheet_to_json(ws, { defval: null });
  }
  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2));
  console.log('sheets:', wb.SheetNames);
  for (const s of wb.SheetNames) console.log(' ', s, '->', out[s].length, 'rows');
  console.log('First sheet preview:');
  console.log(JSON.stringify(out[wb.SheetNames[0]].slice(0, 10), null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
