// scripts/xlsx-restructure-readable.js
// Restructure a portal workbook into the readable "Logistic-sample" format:
//   - Add a Cover / How-to-read sheet (once per workbook)
//   - Per module: split into a readable main sheet (10 cols) + a companion
//     "<Module> (Exec)" sheet that holds execution-tracking columns.
//   - Derive a new Test Type (Positive/Negative/Edge/Security) + Layer (UI/API/DB)
//     from the old single Type column.
//
// DETERMINISTIC structure only — it does NOT rewrite Scenario/Steps/Expected prose.
// That semantic rewrite is done separately by BA Agent per module.
//
// Idempotent: detects already-restructured workbooks (Cover sheet present +
// "(Exec)" sheets) and skips. Safe to re-run.
//
// Usage: node scripts/xlsx-restructure-readable.js <Admin|SM|CP|Buyer|all>

'use strict';

const ExcelJS = require('exceljs');
const path = require('path');

const PORTAL_FILE = {
  Admin: 'TestCases-AdminPortal.xlsx',
  SM: 'TestCases-SMPortal.xlsx',
  CP: 'TestCases-CPPortal.xlsx',
  Buyer: 'TestCases-BuyerPortal.xlsx',
};

const PORTAL_META = {
  Admin: { name: 'XR Portal — Admin', url: 'https://uat-web.xrportal.in/admin', roles: 'Admin' },
  SM:    { name: 'XR Portal — Sales Manager', url: 'https://uat-web.xrportal.in/sales-manager', roles: 'Sales Manager' },
  CP:    { name: 'XR Portal — Channel Partner', url: 'https://uat-web.xrportal.in/', roles: 'Channel Partner (Growth Partner)' },
  Buyer: { name: 'XR Portal — Buyer', url: 'https://uat.xrportal.in/', roles: 'Buyer' },
};

const EXEC_DIR = path.join(__dirname, '..', 'manual-qa-repository', '07-execution');

// ── Type → (Test Type, Layer) mapping ────────────────────────────────────────
// Old Type codes: UI FUNC VAL E2E API DB INT BIZ REG EXP NEG EDGE XMOD DC WF
function deriveTypeAndLayer(oldType, scenario) {
  const t = (oldType || '').toUpperCase().trim();
  const sc = (scenario || '').toLowerCase();

  // Layer
  let layer = 'UI';
  if (t === 'API' || t === 'INT') layer = 'API';
  else if (t === 'DB' || t === 'DC') layer = 'DB';

  // Test Type
  let testType = 'Positive';
  if (t === 'NEG' || t === 'VAL') testType = 'Negative';
  else if (t === 'EDGE') testType = 'Edge';
  // Security heuristic from scenario text
  if (/\b(sql injection|xss|injection|tamper|unauthor|403|401|role enforcement|access control|jwt|csrf|security)\b/.test(sc)) {
    testType = 'Security';
  }
  return { testType, layer };
}

// Header styling
const HDR_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E5C8A' } };
const HDR_FONT = { bold: true, color: { argb: 'FFFFFFFF' } };
const TITLE_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } };

const READABLE_HEADERS = ['TC ID', 'Module', 'Test Scenario', 'Test Type', 'Layer', 'Preconditions', 'Test Steps', 'Test Data', 'Expected Result', 'Priority'];
const EXEC_HEADERS = ['TC ID', 'Status', 'Automation Status', 'Last Run Status', 'Execution Details', 'Actual Result (Run)', 'Screenshot Link'];

// Old column indices (current 15-col format): 1 TCID 2 Feature 3 Type 4 Scenario
// 5 Precond 6 Steps 7 Expected 8 Actual 9 Status 10 Priority 11 AutoStatus
// 12 LastRun 13 ExecDetails 14 ActualRun 15 ScreenshotLink
const OLD = { tcid:1, feature:2, type:3, scenario:4, precond:5, steps:6, expected:7, actual:8, status:9, priority:10, autoStatus:11, lastRun:12, execDetails:13, actualRun:14, screenshot:15 };

function isTcId(v){ return /^[A-Z][A-Z0-9_]*_\d{3,}[a-z]?$/.test((v||'').toString().trim()); }

async function restructure(portal) {
  const file = PORTAL_FILE[portal];
  const xpath = path.join(EXEC_DIR, file);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(xpath);

  // Idempotency: skip if already has a Cover sheet AND any (Exec) sheet
  const sheetNames = wb.worksheets.map((w) => w.name);
  if (sheetNames.includes('Cover') && sheetNames.some((n) => / \(Exec\)$/.test(n))) {
    console.log(`[${portal}] already restructured — skipping.`);
    return;
  }

  const meta = PORTAL_META[portal];

  // Collect existing module sheets (skip Index)
  const moduleSheets = wb.worksheets.filter((w) => w.name !== '📋 Index' && !/index/i.test(w.name) && !/ \(Exec\)$/.test(w.name) && w.name !== 'Cover');

  const moduleSummaries = [];
  const newMainData = [];  // {name, title, rows:[ [10 cols] ]}
  const newExecData = [];  // {name, rows:[ [7 cols] ]}

  for (const sheet of moduleSheets) {
    // Capture module title row (row 1) + section text (row 2) if present
    const titleText = (sheet.getRow(1).getCell(1).value || sheet.name).toString();

    const mainRows = [];
    const execRows = [];
    let tcCount = 0;

    for (let r = 1; r <= sheet.rowCount; r++) {
      const c1 = (sheet.getRow(r).getCell(OLD.tcid).value || '').toString().trim();
      if (!isTcId(c1)) continue; // skip banners, dividers, headers
      tcCount++;
      const g = (col) => { const v = sheet.getRow(r).getCell(col).value; return v == null ? '' : (typeof v === 'object' ? (v.text || v.result || JSON.stringify(v)) : v.toString()); };
      const { testType, layer } = deriveTypeAndLayer(g(OLD.type), g(OLD.scenario));
      mainRows.push([
        c1,                       // TC ID
        sheet.name,               // Module
        g(OLD.scenario),          // Test Scenario (prose rewrite later)
        testType,                 // Test Type
        layer,                    // Layer
        g(OLD.precond),           // Preconditions
        g(OLD.steps),             // Test Steps
        '',                       // Test Data (populated by semantic pass)
        g(OLD.expected),          // Expected Result
        g(OLD.priority) || 'Medium', // Priority
      ]);
      execRows.push([
        c1,
        g(OLD.status),
        g(OLD.autoStatus),
        g(OLD.lastRun),
        g(OLD.execDetails),
        g(OLD.actualRun),
        g(OLD.screenshot),
      ]);
    }

    newMainData.push({ name: sheet.name, title: titleText, rows: mainRows });
    const execName = `${sheet.name} (Exec)`.slice(0, 31);
    newExecData.push({ name: execName, rows: execRows });
    moduleSummaries.push({ module: sheet.name, count: tcCount });
  }

  // ── Rebuild workbook: remove old module sheets + stale Index, build Cover ────
  for (const sheet of moduleSheets) wb.removeWorksheet(sheet.id);
  const oldIndex = wb.worksheets.find((w) => w.name === '📋 Index' || /index/i.test(w.name));
  if (oldIndex) wb.removeWorksheet(oldIndex.id);

  // Cover sheet (insert first)
  let cover = wb.getWorksheet('Cover');
  if (!cover) cover = wb.addWorksheet('Cover');
  cover.columns = [{ width: 24 }, { width: 90 }];
  const addCover = (a, b, opts = {}) => {
    const row = cover.addRow([a, b]);
    if (opts.title) { row.getCell(1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }; row.getCell(1).fill = TITLE_FILL; }
    if (opts.bold) row.getCell(1).font = { bold: true };
    return row;
  };
  addCover(meta.name, 'Comprehensive Test Case Document', { title: true });
  cover.addRow([]);
  addCover('Application URL', meta.url, { bold: true });
  addCover('Document Version', '3.0 (readable scenarios + plain-English steps)', { bold: true });
  addCover('Roles Covered', meta.roles, { bold: true });
  addCover('How to read', 'Each row is one self-contained test. The Test Scenario explains what is being checked in plain English; Test Steps list the exact clicks/typing a person performs; the Expected Result describes exactly what the user should see if the app works correctly. No coding knowledge needed.', { bold: true });
  cover.addRow([]);
  const modHdr = cover.addRow(['Modules / Test Suites', 'Test Count']);
  modHdr.eachCell((c) => { c.font = HDR_FONT; c.fill = HDR_FILL; });
  for (const m of moduleSummaries) cover.addRow([m.module, m.count]);
  cover.addRow([]);
  const legHdr = cover.addRow(['Test Type legend', '']);
  legHdr.getCell(1).font = { bold: true };
  addCover('Positive', 'Valid input — the app should succeed.');
  addCover('Negative', 'Invalid input — the app should reject gracefully.');
  addCover('Edge', 'Unusual but possible situations / boundaries.');
  addCover('Security', 'Access control, injection, token/role enforcement.');
  cover.addRow([]);
  const layHdr = cover.addRow(['Layer legend', '']);
  layHdr.getCell(1).font = { bold: true };
  addCover('UI', 'Tested through the screen a user sees.');
  addCover('API', 'Tested at the backend endpoint level.');
  addCover('DB', 'Tested by inspecting the database.');

  // Per-module: readable main sheet + exec sheet
  for (let i = 0; i < newMainData.length; i++) {
    const md = newMainData[i];
    const ed = newExecData[i];

    const main = wb.addWorksheet(md.name);
    main.columns = [
      { width: 18 }, { width: 16 }, { width: 55 }, { width: 12 }, { width: 8 },
      { width: 30 }, { width: 55 }, { width: 24 }, { width: 60 }, { width: 10 },
    ];
    // Title row
    const tRow = main.addRow([md.title]);
    main.mergeCells(1, 1, 1, READABLE_HEADERS.length);
    tRow.getCell(1).font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
    tRow.getCell(1).fill = TITLE_FILL;
    // Header row
    const hRow = main.addRow(READABLE_HEADERS);
    hRow.eachCell((c) => { c.font = HDR_FONT; c.fill = HDR_FILL; c.alignment = { vertical: 'middle', wrapText: true }; });
    // Data
    for (const row of md.rows) {
      const dr = main.addRow(row);
      dr.alignment = { vertical: 'top', wrapText: true };
    }

    const exec = wb.addWorksheet(ed.name);
    exec.columns = [{ width: 18 }, { width: 12 }, { width: 16 }, { width: 16 }, { width: 40 }, { width: 30 }, { width: 50 }];
    const ehRow = exec.addRow(EXEC_HEADERS);
    ehRow.eachCell((c) => { c.font = HDR_FONT; c.fill = HDR_FILL; });
    for (const row of ed.rows) exec.addRow(row);
  }

  // Reorder: Cover first
  const order = ['Cover'];
  for (const md of newMainData) { order.push(md.name); order.push(`${md.name} (Exec)`.slice(0, 31)); }
  // ExcelJS preserves add order; Cover was added before module sheets only if it
  // didn't pre-exist. Force order via worksheet.orderNo if available.
  wb.worksheets.forEach((ws) => { const idx = order.indexOf(ws.name); if (idx >= 0) ws.orderNo = idx; });

  await wb.xlsx.writeFile(xpath);

  const totalTc = moduleSummaries.reduce((s, m) => s + m.count, 0);
  console.log(`[${portal}] ✓ ${file}`);
  console.log(`   Modules: ${moduleSummaries.length} | TCs: ${totalTc}`);
  console.log(`   Sheets now: Cover + ${moduleSummaries.length} readable + ${moduleSummaries.length} (Exec)`);
}

(async () => {
  const arg = process.argv[2] || 'all';
  const portals = arg === 'all' ? ['Admin', 'SM', 'CP', 'Buyer'] : [arg];
  for (const p of portals) {
    if (!PORTAL_FILE[p]) { console.error('Unknown portal:', p); continue; }
    await restructure(p);
  }
})();
