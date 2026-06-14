// scripts/xlsx-regen-cover.js
// Rebuild the "Cover" sheet of a portal workbook so the module/test-count table
// reflects the live "<Module> - Master" sheets. Preserves per-portal metadata
// (title, URL, roles) read from the existing Cover; regenerates the module table
// from actual TC counts; refreshes the test-type + layer legends; bumps version.
//
// Usage: node scripts/xlsx-regen-cover.js <portalFileKey>
//        portalFileKey one of: Admin | SM | CP | Buyer  (or "all")

'use strict';

const ExcelJS = require('exceljs');
const path = require('path');

const PORTAL_FILE = {
  Admin: 'TestCases-AdminPortal.xlsx',
  SM: 'TestCases-SMPortal.xlsx',
  CP: 'TestCases-CPPortal.xlsx',
  Buyer: 'TestCases-BuyerPortal.xlsx',
};

const VERSION = '4.0 (gold-standard "- Master" format — inline execution columns, sub-module banners)';
const HOW_TO_READ = 'Each row is one self-contained test. The Test Scenario explains what is being checked in plain English; Test Steps list the exact clicks/typing a person performs; the Expected Result describes exactly what the user should see if the app works correctly. No coding knowledge needed.';
const TYPE_LEGEND = [
  ['Positive', 'Valid input — the app should succeed.'],
  ['Negative', 'Invalid input — the app should reject gracefully.'],
  ['Edge', 'Unusual but possible situations / boundaries.'],
  ['Security', 'Access control, injection, token/role enforcement.'],
];
const LAYER_LEGEND = [
  ['UI', 'Tested through the screen a user sees.'],
  ['API', 'Tested at the backend endpoint level.'],
  ['DB', 'Tested by inspecting the database.'],
];

const TITLE_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E5C8A' } };
const HDR_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } };
const LABEL_FONT = { bold: true };

function countTCs(ws) {
  let c = 0;
  ws.eachRow((r) => {
    const v = (r.getCell(1).value || '').toString().trim();
    if (/^(BYR_|TC_|ADM_|SM_|CP_)/.test(v)) c++;
  });
  return c;
}

async function regen(key) {
  const file = PORTAL_FILE[key];
  if (!file) { console.error('Unknown portal key:', key); process.exit(1); }
  const xpath = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', file);

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(xpath);

  // Preserve per-portal metadata from the existing Cover.
  const old = wb.getWorksheet('Cover');
  const titleA = old ? (old.getRow(1).getCell(1).value || '').toString() : `XR Portal — ${key}`;
  const titleB = old ? (old.getRow(1).getCell(2).value || 'Comprehensive Test Case Document').toString() : 'Comprehensive Test Case Document';
  const url = old ? (old.getRow(3).getCell(2).value || '').toString() : '';
  const roles = old ? (old.getRow(5).getCell(2).value || key).toString() : key;

  // Collect live module counts (sheet order).
  const modules = [];
  let grand = 0;
  wb.worksheets.forEach((ws) => {
    const m = ws.name.match(/^(.*) - Master$/);
    if (m) { const n = countTCs(ws); modules.push([m[1], n]); grand += n; }
  });

  // Rewrite Cover in place (preserves its first-sheet position). Clear all rows first.
  const s = old || wb.addWorksheet('Cover');
  if (s.rowCount > 0) s.spliceRows(1, s.rowCount);
  s.columns = [{ width: 32 }, { width: 70 }];

  const titleRow = s.addRow([titleA, titleB]);
  titleRow.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  titleRow.getCell(1).fill = TITLE_FILL;
  titleRow.getCell(2).fill = TITLE_FILL;
  s.addRow([]);
  const meta = [
    ['Application URL', url],
    ['Document Version', VERSION],
    ['Roles Covered', roles],
    ['How to read', HOW_TO_READ],
  ];
  for (const [a, b] of meta) {
    const r = s.addRow([a, b]);
    r.getCell(1).font = LABEL_FONT;
    r.getCell(2).alignment = { wrapText: true };
  }
  s.addRow([]);

  const mh = s.addRow(['Modules / Test Suites', 'Test Count']);
  mh.font = { bold: true };
  mh.getCell(1).fill = HDR_FILL;
  mh.getCell(2).fill = HDR_FILL;
  for (const [name, n] of modules) s.addRow([name, n]);
  const total = s.addRow(['TOTAL', grand]);
  total.font = { bold: true };
  s.addRow([]);

  const tl = s.addRow(['Test Type legend', '']);
  tl.getCell(1).font = LABEL_FONT;
  for (const [a, b] of TYPE_LEGEND) s.addRow([a, b]);
  s.addRow([]);
  const ll = s.addRow(['Layer legend', '']);
  ll.getCell(1).font = LABEL_FONT;
  for (const [a, b] of LAYER_LEGEND) s.addRow([a, b]);

  // Ensure Cover renders first: ExcelJS sorts worksheets by orderNo.
  const minOrder = Math.min(...wb.worksheets.filter((w) => w !== s).map((w) => w.orderNo));
  s.orderNo = minOrder - 1;

  await wb.xlsx.writeFile(xpath);
  console.log(`✓ ${key}: Cover regenerated — ${modules.length} modules, ${grand} TCs total (first sheet: ${wb.worksheets[0].name})`);
}

(async () => {
  const arg = process.argv[2] || 'all';
  const keys = arg === 'all' ? Object.keys(PORTAL_FILE) : [arg];
  for (const k of keys) await regen(k);
})();
