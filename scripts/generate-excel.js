// scripts/generate-excel.js
// Parses TC_*.md files → generates portal-wise Excel workbooks.
// Layout: ONE sheet per module file. Within each sheet, TCs are grouped by
// testing type (UI / FUNC / VAL / NEG / E2E / EDGE / INT / BIZ / REG / API / DB)
// with colored banner divider rows.
//
// Markdown structure consumed:
//   ## Feature Area Name          ← becomes the "Feature Area" column value
//   ### TC_ID — Test Scenario     ← becomes one row
//   | **Module** | value |
//   | **Pre-conditions** | value |
//   | **Type** | UI/FUNC/VAL/NEG/E2E/EDGE/INT/BIZ/REG/API/DB |
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

const BANNER_FILL  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C7E7' } };  // light blue
const BANNER_FONT  = { bold: true, color: { argb: 'FF1F3864' }, size: 11 };

const CRIT_FILL    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4EC' } };  // light red
const HIGH_FILL    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3E0' } };  // light orange
// Medium/unset rows: no fill (white)

const THIN_BORDER  = {
  top:    { style: 'thin', color: { argb: 'FFDDDDDD' } },
  bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
  left:   { style: 'thin', color: { argb: 'FFDDDDDD' } },
  right:  { style: 'thin', color: { argb: 'FFDDDDDD' } },
};

// ─── 10-column schema ────────────────────────────────────────────────────────

const COLUMNS = [
  { header: 'TC ID',           key: 'tcId',       width: 22 },
  { header: 'Feature Area',    key: 'feature',    width: 32 },
  { header: 'Type',            key: 'type',       width: 8  },
  { header: 'Test Scenario',   key: 'scenario',   width: 40 },
  { header: 'Pre-conditions',  key: 'precond',    width: 28 },
  { header: 'Test Steps',      key: 'steps',      width: 46 },
  { header: 'Expected Result', key: 'expected',   width: 38 },
  { header: 'Actual Result',   key: 'actual',     width: 22 },
  { header: 'Status',          key: 'status',     width: 10 },
  { header: 'Priority',        key: 'priority',   width: 12 },
];

// ─── Type taxonomy ───────────────────────────────────────────────────────────

const TYPE_ORDER = ['UI', 'FUNC', 'VAL', 'BIZ', 'INT', 'API', 'DB', 'E2E', 'REG', 'EDGE', 'NEG'];
const TYPE_LABEL = {
  UI:   'UI TESTS',
  FUNC: 'FUNCTIONAL TESTS',
  VAL:  'VALIDATION TESTS',
  BIZ:  'BUSINESS RULE TESTS',
  INT:  'INTEGRATION TESTS',
  API:  'API TESTS',
  DB:   'DATABASE TESTS',
  E2E:  'END-TO-END TESTS',
  REG:  'REGRESSION TESTS',
  EDGE: 'EDGE CASE TESTS',
  NEG:  'NEGATIVE TESTS',
  OTHER:'UNCLASSIFIED',
};

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

const ACRONYMS = new Set(['cms', 'jbp', 'kyc', 'cp', 'sm', 'otp', 'api', 'ui', 'ux']);
function prettySlug(slug) {
  return slug.split('-').map(w => ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function safeSheetName(name) {
  return name.replace(/[\[\]:*?\/\\]/g, '-').slice(0, 31);
}

// Convert "<br>" separators back to newlines for cell rendering
function normSteps(val) {
  return (val || '').replace(/<br\s*\/?>/gi, '\n').replace(/\\n/g, '\n').trim();
}

// Normalize a Type code from markdown — accepts variants and uppercases
function normType(raw) {
  if (!raw) return '';
  const t = raw.trim().toUpperCase().replace(/[^A-Z]/g, '');
  if (TYPE_ORDER.includes(t)) return t;
  // common variants
  if (t === 'FUNCTIONAL')   return 'FUNC';
  if (t === 'VALIDATION')   return 'VAL';
  if (t === 'NEGATIVE')     return 'NEG';
  if (t === 'INTEGRATION')  return 'INT';
  if (t === 'BUSINESS')     return 'BIZ';
  if (t === 'BIZRULE')      return 'BIZ';
  if (t === 'REGRESSION')   return 'REG';
  if (t === 'BOUNDARY')     return 'EDGE';
  return '';
}

// Heuristic: infer type from feature-area name when markdown lacks Type field
function inferType(featureArea, scenario) {
  const s = (featureArea + ' ' + (scenario || '')).toLowerCase();
  if (/negative|error|invalid|expired|denied|fail/.test(s)) return 'NEG';
  if (/edge|boundary|max\s|limit|rare/.test(s))             return 'EDGE';
  if (/validation|mandatory|format|character\s*counter/.test(s)) return 'VAL';
  if (/integration|sync|refresh|cms|teams|kaleyra|gateway|lsq|leadsquared|strapi|azure|webhook/.test(s)) return 'INT';
  if (/business\s*rule|lifecycle|role|access\s*control|status\s*transition|gating/.test(s)) return 'BIZ';
  if (/api|endpoint/.test(s))    return 'API';
  if (/database|persistence|db\s/.test(s)) return 'DB';
  if (/end[-\s]*to[-\s]*end|e2e/.test(s))  return 'E2E';
  if (/regression|cross[-\s]*module/.test(s)) return 'REG';
  if (/page\s*load|rendering|layout|kpi|display|colour|color|ui\b|navigation|read[-\s]*only/.test(s)) return 'UI';
  return 'FUNC';
}

// ─── Markdown parser ─────────────────────────────────────────────────────────
// Returns an array of TC objects flat (NOT grouped by section). Each TC carries
// its containing feature-area name in `featureArea`.

function parseMd(mdPath) {
  const text  = fs.readFileSync(mdPath, 'utf8');
  const lines = text.split('\n');

  const tcs = [];
  let currentArea = null;
  let currentTc   = null;

  function flushTc() {
    if (currentTc) {
      currentTc.steps = normSteps(currentTc.steps);
      // Resolve type: explicit markdown → normalize, else infer
      currentTc.type = normType(currentTc.type) || inferType(currentTc.featureArea, currentTc.scenario);
      tcs.push(currentTc);
    }
    currentTc = null;
  }

  for (const raw of lines) {
    const l = raw.trimEnd();

    // Feature area heading — ## Foo Bar
    // FSD-corrections / changelog sections still contain real ### TC_ID blocks
    // (BA agents added new TCs under them). Relabel them rather than drop.
    const areaMatch = l.match(/^##\s+(.+)$/);
    if (areaMatch) {
      const areaName = areaMatch[1].trim();
      flushTc();
      if (/fsd.?correction|corrections applied/i.test(areaName)) {
        currentArea = 'FSD Source-Verified TCs';
      } else if (/changelog|change.?log/i.test(areaName)) {
        currentArea = null;  // genuine changelog text — drop
      } else {
        currentArea = areaName;
      }
      continue;
    }

    // TC heading — ### TC_ID — Scenario text
    const tcMatch = l.match(/^###\s+([A-Z][A-Z0-9_]{2,30})\s*(?:—|-|–)?\s*(.*)$/i);
    if (tcMatch && currentArea) {
      flushTc();
      currentTc = {
        tcId:        tcMatch[1].trim(),
        featureArea: currentArea,
        type:        '',
        scenario:    tcMatch[2].trim(),
        precond:     '',
        steps:       '',
        expected:    '',
        priority:    '',
      };
      continue;
    }

    if (!currentTc) continue;

    // Table row: | **Field** | value |
    const tableRow = l.match(/^\|\s*\*\*([^*]+)\*\*\s*\|\s*(.*?)\s*\|?\s*$/);
    if (tableRow) {
      const key = tableRow[1].trim().toLowerCase();
      const val = tableRow[2].trim();
      if      (key === 'module')                                                            { /* sheet IS module — ignore */ }
      else if (key === 'pre-conditions' || key === 'precondition' || key === 'pre-condition' || key === 'preconditions')
                                                                                            currentTc.precond  = val;
      else if (key === 'type' || key === 'test type')                                       currentTc.type     = val;
      else if (key === 'test steps' || key === 'steps')                                     currentTc.steps    = val;
      else if (key === 'expected result' || key === 'expected results' || key === 'expected')
                                                                                            currentTc.expected = val;
      else if (key === 'priority')                                                          currentTc.priority = val;
      else if (key === 'scenario' && !currentTc.scenario)                                   currentTc.scenario = val;
      continue;
    }

    // Legacy "**Field:** value" format
    const legacyField = l.match(/^\*\*([^*]+)\*\*\s*:?\s*(.*)$/);
    if (legacyField) {
      const key = legacyField[1].trim().toLowerCase();
      const val = legacyField[2].trim();
      if      (key === 'pre-conditions' || key === 'precondition' || key === 'pre-condition' || key === 'preconditions')
                                                                                            currentTc.precond  = val;
      else if (key === 'type' || key === 'test type')                                       currentTc.type     = val;
      else if (key === 'test steps' || key === 'steps')                                     currentTc.steps    = val;
      else if (key === 'expected result' || key === 'expected results' || key === 'expected')
                                                                                            currentTc.expected = val;
      else if (key === 'priority')                                                          currentTc.priority = val;
      continue;
    }
  }
  flushTc();
  return tcs;
}

// ─── Module sheet builder ────────────────────────────────────────────────────

function buildModuleSheet(wb, sheetName, tcs, portalFull) {
  const safeName = safeSheetName(sheetName);
  const ws = wb.addWorksheet(safeName, {
    views: [{ state: 'frozen', ySplit: 2 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  });

  // Row 1 — merged title
  ws.columns = COLUMNS;
  const titleRow = ws.getRow(1);
  titleRow.getCell(1).value = `${portalFull} — ${sheetName} Test Cases`;
  ws.mergeCells(1, 1, 1, COLUMNS.length);
  titleRow.getCell(1).fill      = TITLE_FILL;
  titleRow.getCell(1).font      = TITLE_FONT;
  titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  titleRow.height = 30;

  // Row 2 — column headers
  const headerRow = ws.addRow(COLUMNS.map(c => c.header));
  headerRow.eachCell(cell => {
    cell.fill      = HEADER_FILL;
    cell.font      = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border    = THIN_BORDER;
  });
  headerRow.height = 24;
  ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: COLUMNS.length } };

  // Group TCs by Type
  const byType = {};
  tcs.forEach(tc => {
    const t = TYPE_ORDER.includes(tc.type) ? tc.type : 'OTHER';
    (byType[t] = byType[t] || []).push(tc);
  });

  // Emit groups in canonical order, with banner row before each
  const orderedKeys = [...TYPE_ORDER.filter(k => byType[k]), ...(byType.OTHER ? ['OTHER'] : [])];

  orderedKeys.forEach(typeKey => {
    const group = byType[typeKey];
    if (!group || !group.length) return;

    // Sort within group: by TC ID
    group.sort((a, b) => a.tcId.localeCompare(b.tcId, undefined, { numeric: true }));

    // Banner row
    const bannerText = `━━━━━━━━━━  ${TYPE_LABEL[typeKey]}  (${group.length})  ━━━━━━━━━━`;
    const bannerRow = ws.addRow([bannerText]);
    ws.mergeCells(bannerRow.number, 1, bannerRow.number, COLUMNS.length);
    const bc = bannerRow.getCell(1);
    bc.fill      = BANNER_FILL;
    bc.font      = BANNER_FONT;
    bc.alignment = { vertical: 'middle', horizontal: 'center' };
    bc.border    = THIN_BORDER;
    bannerRow.height = 22;

    // Data rows
    group.forEach(tc => {
      const dataRow = ws.addRow([
        tc.tcId,
        tc.featureArea,
        tc.type,
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
      dataRow.getCell(3).alignment = { horizontal: 'center', vertical: 'top' };

      const stepLines = (tc.steps || '').split('\n').length;
      dataRow.height = Math.max(40, Math.min(stepLines * 16 + 12, 240));
    });
  });
}

// ─── Index sheet ─────────────────────────────────────────────────────────────

function buildIndexSheet(wb, modules, portalLabel, portalFull) {
  const ws = wb.addWorksheet('📋 Index', {
    views: [{ state: 'frozen', ySplit: 3 }],
  });

  ws.columns = [
    { key: 'num',      width: 5  },
    { key: 'module',   width: 28 },
    { key: 'count',    width: 10 },
    { key: 'types',    width: 52 },
    { key: 'priority', width: 14 },
    { key: 'desc',     width: 40 },
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

  const hdr = ws.addRow(['#', 'Module', 'TC Count', 'Type Breakdown', 'Priority Focus', 'Description']);
  hdr.eachCell(cell => {
    cell.fill      = HEADER_FILL;
    cell.font      = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border    = THIN_BORDER;
  });
  hdr.height = 22;

  modules.forEach((m, idx) => {
    const counts = {};
    m.tcs.forEach(tc => {
      const t = TYPE_ORDER.includes(tc.type) ? tc.type : 'OTHER';
      counts[t] = (counts[t] || 0) + 1;
    });
    const breakdown = [...TYPE_ORDER, 'OTHER']
      .filter(k => counts[k])
      .map(k => `${k}:${counts[k]}`)
      .join(' · ');

    const crits  = m.tcs.filter(t => (t.priority||'').toLowerCase() === 'critical').length;
    const highs  = m.tcs.filter(t => (t.priority||'').toLowerCase() === 'high').length;
    const prioFocus = crits > highs ? 'Critical' : highs > 0 ? 'High' : 'Medium';

    const row = ws.addRow([idx + 1, m.sheetName, m.tcs.length, breakdown, prioFocus, m.desc || '']);
    row.eachCell({ includeEmpty: true }, cell => {
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border    = THIN_BORDER;
      if (idx % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    });
    row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    row.height = 26;
  });

  ws.addRow([]);
  const totRow = ws.addRow(['', 'TOTAL', modules.reduce((s, e) => s + e.tcs.length, 0), '', '', '']);
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

  // One module per sheet — aggregate all TCs from all TC_*.md files in that module folder
  const modules = [];
  for (const mod of moduleDirs) {
    const modDir  = path.join(portalDir, mod);
    const mdFiles = fs.readdirSync(modDir).filter(f => f.startsWith('TC_') && f.endsWith('.md'));
    const allTcs = [];
    for (const f of mdFiles) {
      const tcs = parseMd(path.join(modDir, f));
      allTcs.push(...tcs);
    }
    if (allTcs.length > 0) {
      modules.push({
        sheetName: prettySlug(mod),
        tcs:       allTcs,
        desc:      `${prettySlug(mod)} — ${allTcs.length} TCs`,
        module:    mod,
      });
    }
  }

  if (!modules.length) {
    console.log(`  SKIP ${portalSlug} — no TCs parsed`);
    return null;
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = 'XR Portal QA Framework';
  wb.created = new Date();

  // Index sheet first
  buildIndexSheet(wb, modules, cfg.label, cfg.portalFull);

  // One sheet per module
  modules.forEach(m => buildModuleSheet(wb, m.sheetName, m.tcs, cfg.portalFull));

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, cfg.file);
  await wb.xlsx.writeFile(outPath);

  const total = modules.reduce((s, e) => s + e.tcs.length, 0);
  console.log(`  OK  ${cfg.file} — ${modules.length} module sheet(s), ${total} TC(s)`);
  modules.forEach(m => {
    const counts = {};
    m.tcs.forEach(tc => {
      const t = TYPE_ORDER.includes(tc.type) ? tc.type : 'OTHER';
      counts[t] = (counts[t] || 0) + 1;
    });
    const bd = [...TYPE_ORDER, 'OTHER'].filter(k => counts[k]).map(k => `${k}:${counts[k]}`).join(' ');
    console.log(`      ${m.sheetName.padEnd(28)} ${String(m.tcs.length).padStart(4)} TCs   [${bd}]`);
  });
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
