// scripts/generate-excel.js
// Parses TC_*.md files → generates portal-wise Excel workbooks (9-column schema).
//
// Markdown structure consumed:
//   ## Feature Area Name          ← becomes one Excel sheet
//   ### TC_ID — Test Scenario     ← becomes one row
//   | **Module** | value |
//   | **Pre-conditions** | value |
//   | **Test Steps** | 1. ...<br>2. ... |
//   | **Expected Result** | value |
//   | **Priority** | Critical / High / Medium |
//
// Output:
//   manual-qa-repository/07-execution/TestCases-AdminPortal.xlsx
//   manual-qa-repository/07-execution/TestCases-BuyerPortal.xlsx
//   manual-qa-repository/07-execution/TestCases-CPPortal.xlsx
//   manual-qa-repository/07-execution/TestCases-SMPortal.xlsx
//
// Run:  node scripts/generate-excel.js               (all portals)
//       node scripts/generate-excel.js --portal=admin

'use strict';
const ExcelJS = require('exceljs');
const fs      = require('fs');
const path    = require('path');

const ROOT    = path.join(__dirname, '..');
const TC_BASE = path.join(ROOT, 'manual-qa-repository', '01-test-cases');
const OUT_DIR = path.join(ROOT, 'manual-qa-repository', '07-execution');

// ─── Styling ────────────────────────────────────────────────────────────────

const TITLE_FILL   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };  // dark blue
const TITLE_FONT   = { bold: true, color: { argb: 'FFFFFFFF' }, size: 13 };

const HEADER_FILL  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E75B6' } };  // mid blue
const HEADER_FONT  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

const CRIT_FILL    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4EC' } };  // light red
const HIGH_FILL    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3E0' } };  // light orange
// Medium/unset rows: no fill (white)

const THIN_BORDER  = {
  top:    { style: 'thin', color: { argb: 'FFDDDDDD' } },
  bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
  left:   { style: 'thin', color: { argb: 'FFDDDDDD' } },
  right:  { style: 'thin', color: { argb: 'FFDDDDDD' } },
};

// ─── 9-column schema ─────────────────────────────────────────────────────────

const COLUMNS = [
  { header: 'TC ID',           key: 'tcId',       width: 22 },
  { header: 'Module',          key: 'module',     width: 22 },
  { header: 'Test Scenario',   key: 'scenario',   width: 40 },
  { header: 'Pre-conditions',  key: 'precond',    width: 30 },
  { header: 'Test Steps',      key: 'steps',      width: 48 },
  { header: 'Expected Result', key: 'expected',   width: 40 },
  { header: 'Actual Result',   key: 'actual',     width: 24 },
  { header: 'Status',          key: 'status',     width: 12 },
  { header: 'Priority',        key: 'priority',   width: 12 },
];

// ─── Portal workbook config ──────────────────────────────────────────────────

const PORTAL_WORKBOOKS = {
  'admin-portal': {
    file:       'TestCases-AdminPortal.xlsx',
    label:      'Admin Portal',
    portalFull: 'ADMIN PORTAL',
    sheetOrder: [
      'login', 'customers', 'sales-managers', 'payment-transactions',
      'allocation', 'towers', 'jbp', 'offers', 'channel-partners',
      'admin-cms', 'config',
    ],
  },
  'buyer-portal': {
    file:       'TestCases-BuyerPortal.xlsx',
    label:      'Buyer (Customer) Portal',
    portalFull: 'CUSTOMER PORTAL',
    sheetOrder: [
      'registration-login', 'home-dashboard', 'kyc', 'unit-details',
      'project-information', 'payment-schedule', 'home-loan',
      'allocation-experience', 'callback-request', 'support-tickets', 'work-progress',
    ],
  },
  'cp-portal': {
    file:       'TestCases-CPPortal.xlsx',
    label:      'Channel Partner Portal',
    portalFull: 'CHANNEL PARTNER PORTAL',
    sheetOrder: [
      'login', 'leads-management', 'customer-registration',
      'kyc-assistance', 'jbp-submission', 'project-information',
    ],
  },
  'sm-portal': {
    file:       'TestCases-SMPortal.xlsx',
    label:      'Sales Manager Portal',
    portalFull: 'SALES MANAGER PORTAL',
    sheetOrder: ['login', 'physical-allocation', 'tower-heatmap', 'callback-requests'],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function prettySlug(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function safeSheetName(name) {
  return name.replace(/[\[\]:*?\/\\]/g, '-').slice(0, 31);
}

// Convert "<br>" separators back to newlines for cell rendering
function normSteps(val) {
  return (val || '').replace(/<br\s*\/?>/gi, '\n').replace(/\\n/g, '\n').trim();
}

// ─── Markdown parser ─────────────────────────────────────────────────────────
// Returns array of feature sections: { area: string, tcs: [{tcId, module, scenario, precond, steps, expected, priority}] }

function parseMd(mdPath) {
  const text  = fs.readFileSync(mdPath, 'utf8');
  const lines = text.split('\n');

  const sections = [];
  let currentArea = null;
  let currentTc   = null;

  function flushTc() {
    if (currentTc && currentArea) {
      // normalise steps
      currentTc.steps = normSteps(currentTc.steps);
      currentArea.tcs.push(currentTc);
    }
    currentTc = null;
  }

  function flushArea() {
    flushTc();
    if (currentArea && currentArea.tcs.length > 0) sections.push(currentArea);
    currentArea = null;
  }

  for (const raw of lines) {
    const l = raw.trimEnd();

    // Feature area heading — ## Foo Bar
    const areaMatch = l.match(/^##\s+(.+)$/);
    if (areaMatch) {
      flushArea();
      currentArea = { area: areaMatch[1].trim(), tcs: [] };
      continue;
    }

    // TC heading — ### TC_ID — Scenario text
    const tcMatch = l.match(/^###\s+([A-Z][A-Z0-9_]{2,30})\s*(?:—|-|–)?\s*(.*)$/i);
    if (tcMatch) {
      flushTc();
      if (!currentArea) currentArea = { area: 'General', tcs: [] };
      currentTc = {
        tcId:     tcMatch[1].trim(),
        module:   '',
        scenario: tcMatch[2].trim(),
        precond:  '',
        steps:    '',
        expected: '',
        priority: '',
      };
      continue;
    }

    if (!currentTc) continue;

    // Table row: | **Field** | value |
    const tableRow = l.match(/^\|\s*\*\*([^*]+)\*\*\s*\|\s*(.*?)\s*\|?\s*$/);
    if (tableRow) {
      const key = tableRow[1].trim().toLowerCase();
      const val = tableRow[2].trim();
      if (key === 'module')                                   currentTc.module   = val;
      else if (key === 'pre-conditions' || key === 'precondition' || key === 'pre-condition' || key === 'preconditions')
                                                              currentTc.precond  = val;
      else if (key === 'test steps' || key === 'steps')      currentTc.steps    = val;
      else if (key === 'expected result' || key === 'expected results' || key === 'expected')
                                                              currentTc.expected = val;
      else if (key === 'priority')                            currentTc.priority = val;
      else if (key === 'scenario' && !currentTc.scenario)    currentTc.scenario = val;
      continue;
    }

    // Also support legacy "**Field:** value" format
    const legacyField = l.match(/^\*\*([^*]+)\*\*\s*:?\s*(.*)$/);
    if (legacyField) {
      const key = legacyField[1].trim().toLowerCase();
      const val = legacyField[2].trim();
      if (key === 'module')                                   currentTc.module   = val;
      else if (key === 'pre-conditions' || key === 'precondition' || key === 'pre-condition' || key === 'preconditions')
                                                              currentTc.precond  = val;
      else if (key === 'test steps' || key === 'steps')      currentTc.steps    = val;
      else if (key === 'expected result' || key === 'expected results' || key === 'expected')
                                                              currentTc.expected = val;
      else if (key === 'priority')                            currentTc.priority = val;
      continue;
    }
  }
  flushArea();
  return sections;
}

// ─── Sheet builder ────────────────────────────────────────────────────────────

function buildFeatureSheet(wb, sheetName, tcs, portalFull) {
  const safeName = safeSheetName(sheetName);
  const ws = wb.addWorksheet(safeName, {
    views: [{ state: 'frozen', ySplit: 2 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  });

  // Row 1 — merged title
  ws.columns = COLUMNS;
  const titleRow = ws.getRow(1);
  // Write title in A1 then merge across all 9 cols
  titleRow.getCell(1).value = `${portalFull} — ${sheetName} Test Cases`;
  ws.mergeCells(1, 1, 1, COLUMNS.length);
  titleRow.getCell(1).fill      = TITLE_FILL;
  titleRow.getCell(1).font      = TITLE_FONT;
  titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  titleRow.height = 30;

  // Row 2 — column headers (ws.columns wrote headers into row 1 — we need to shift)
  // Rebuild: clear row 1 headers that ExcelJS auto-added, then add header row manually
  // ExcelJS sets headers in row 1 via ws.columns; we've overwritten it. Now add a real header row 2.
  const headerRow = ws.addRow(COLUMNS.map(c => c.header));
  headerRow.eachCell(cell => {
    cell.fill      = HEADER_FILL;
    cell.font      = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border    = THIN_BORDER;
  });
  headerRow.height = 24;
  ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: COLUMNS.length } };

  // Data rows
  tcs.forEach(tc => {
    const dataRow = ws.addRow([
      tc.tcId,
      tc.module,
      tc.scenario,
      tc.precond,
      tc.steps,
      tc.expected,
      '',   // Actual Result
      '',   // Status
      tc.priority,
    ]);

    const prio = (tc.priority || '').toLowerCase();
    const fill = prio === 'critical' ? CRIT_FILL
               : prio === 'high'     ? HIGH_FILL
               : null;

    dataRow.eachCell({ includeEmpty: true }, cell => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border    = THIN_BORDER;
      if (fill) cell.fill = fill;
    });
    dataRow.getCell(1).font = { bold: true };

    const stepLines = (tc.steps || '').split('\n').length;
    dataRow.height = Math.max(40, Math.min(stepLines * 16 + 12, 240));
  });
}

// ─── Index sheet ─────────────────────────────────────────────────────────────

function buildIndexSheet(wb, sheets, portalLabel, portalFull) {
  const ws = wb.addWorksheet('📋 Index', {
    views: [{ state: 'frozen', ySplit: 3 }],
  });

  // Title
  ws.columns = [
    { key: 'num',   width: 5  },
    { key: 'sheet', width: 34 },
    { key: 'count', width: 12 },
    { key: 'prio',  width: 16 },
    { key: 'portal',width: 28 },
    { key: 'desc',  width: 48 },
  ];

  const r1 = ws.getRow(1);
  r1.getCell(1).value = `${portalFull} — MASTER TEST CASE DOCUMENT`;
  ws.mergeCells(1, 1, 1, 6);
  r1.getCell(1).fill      = TITLE_FILL;
  r1.getCell(1).font      = TITLE_FONT;
  r1.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  r1.height = 30;

  const r2 = ws.getRow(2);
  r2.getCell(1).value = portalLabel;
  ws.mergeCells(2, 1, 2, 6);
  r2.getCell(1).fill      = HEADER_FILL;
  r2.getCell(1).font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  r2.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  r2.height = 20;

  const hdr = ws.addRow(['#', 'Sheet / Module', 'TC Count', 'Priority Focus', 'Portal', 'Description']);
  hdr.eachCell(cell => {
    cell.fill      = HEADER_FILL;
    cell.font      = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border    = THIN_BORDER;
  });
  hdr.height = 22;

  sheets.forEach((s, idx) => {
    const crits  = s.tcs.filter(t => (t.priority||'').toLowerCase() === 'critical').length;
    const highs  = s.tcs.filter(t => (t.priority||'').toLowerCase() === 'high').length;
    const prioFocus = crits > highs ? 'Critical' : highs > 0 ? 'High' : 'Medium';

    const row = ws.addRow([idx + 1, s.sheetName, s.tcs.length, prioFocus, portalLabel, s.desc || '']);
    row.eachCell({ includeEmpty: true }, cell => {
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border    = THIN_BORDER;
      if (idx % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    });
    row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    row.height = 20;
  });

  // Totals
  ws.addRow([]);
  const totRow = ws.addRow(['', 'TOTAL', sheets.reduce((s, e) => s + e.tcs.length, 0), '', '', '']);
  totRow.font = { bold: true };
  totRow.getCell(2).fill = HEADER_FILL;
  totRow.getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  totRow.getCell(3).fill = HEADER_FILL;
  totRow.getCell(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  totRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
}

// ─── Workbook orchestration ──────────────────────────────────────────────────

async function buildPortalWorkbook(portalSlug) {
  const cfg = PORTAL_WORKBOOKS[portalSlug];
  if (!cfg) return null;

  const portalDir = path.join(TC_BASE, portalSlug);
  if (!fs.existsSync(portalDir)) {
    console.log(`  SKIP ${portalSlug} — folder not found`);
    return null;
  }

  let moduleDirs = fs.readdirSync(portalDir)
    .filter(d => fs.statSync(path.join(portalDir, d)).isDirectory() && d !== 'archived');

  if (cfg.sheetOrder) {
    const set = new Set(moduleDirs);
    const ordered = cfg.sheetOrder.filter(m => set.has(m));
    const extras  = moduleDirs.filter(m => !cfg.sheetOrder.includes(m)).sort();
    moduleDirs = [...ordered, ...extras];
  } else {
    moduleDirs.sort();
  }

  // Collect all feature sections across all module files
  const allSheets = [];
  for (const mod of moduleDirs) {
    const modDir  = path.join(portalDir, mod);
    const mdFiles = fs.readdirSync(modDir).filter(f => f.startsWith('TC_') && f.endsWith('.md'));
    for (const f of mdFiles) {
      const sections = parseMd(path.join(modDir, f));
      sections.forEach(sec => {
        allSheets.push({
          sheetName: sec.area,
          tcs:       sec.tcs,
          desc:      `${prettySlug(mod)} — ${sec.area}`,
          module:    mod,
        });
      });
    }
  }

  if (!allSheets.length) {
    console.log(`  SKIP ${portalSlug} — no TCs parsed`);
    return null;
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = 'XR Portal QA Framework';
  wb.created = new Date();

  // Index sheet first
  buildIndexSheet(wb, allSheets, cfg.label, cfg.portalFull);

  // One sheet per feature area
  allSheets.forEach(s => buildFeatureSheet(wb, s.sheetName, s.tcs, cfg.portalFull));

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, cfg.file);
  await wb.xlsx.writeFile(outPath);

  const total = allSheets.reduce((s, e) => s + e.tcs.length, 0);
  console.log(`  OK  ${cfg.file} — ${allSheets.length} sheet(s), ${total} TC(s)`);
  allSheets.forEach(s => console.log(`      ${s.sheetName.padEnd(35)} ${s.tcs.length} TCs`));
  return outPath;
}

async function main() {
  const arg = process.argv.find(a => a.startsWith('--portal='));
  const only = arg ? arg.split('=')[1] : null;
  const targets = only
    ? [`${only}-portal`].filter(p => PORTAL_WORKBOOKS[p])
    : Object.keys(PORTAL_WORKBOOKS);

  if (only && !targets.length) {
    console.error(`Unknown portal "${only}". Valid: admin | buyer | cp | sm`);
    process.exit(1);
  }

  console.log(`Generating Excel for: ${targets.join(', ')}\n`);
  for (const p of targets) await buildPortalWorkbook(p);
  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
