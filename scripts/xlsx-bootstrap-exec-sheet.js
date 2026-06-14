// scripts/xlsx-bootstrap-exec-sheet.js
// Create a "<Module> - Exec" companion sheet in the portal workbook, seeded from
// the TC IDs in the matching "<Module> - Master" sheet. Pre-populates Automation
// Status col based on whether the TC_ID appears in the spec file.
//
// Sheet layout (7 cols):
//   1  TC ID
//   2  Status            (blank at bootstrap)
//   3  Automation Status (Automated / Not Automated)
//   4  Last Run Status   (blank at bootstrap)
//   5  Execution Details (blank at bootstrap)
//   6  Actual Result (Run) (blank at bootstrap)
//   7  Screenshot Link   (blank at bootstrap)
//
// Usage: node scripts/xlsx-bootstrap-exec-sheet.js <portal> <sheetName>
//   portal    : Admin | SM | CP | Buyer
//   sheetName : module name (e.g. "Allocation") or full name ("Allocation - Master")
//
// Idempotent: skips creation if "<Module> - Exec" already exists.

'use strict';

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const [portalArg, sheetArg] = process.argv.slice(2);
if (!portalArg || !sheetArg) {
  console.error('Usage: node xlsx-bootstrap-exec-sheet.js <portal> <sheetName>');
  process.exit(1);
}

const PORTAL_FILE = {
  Admin: 'TestCases-AdminPortal.xlsx',
  SM: 'TestCases-SMPortal.xlsx',
  CP: 'TestCases-CPPortal.xlsx',
  Buyer: 'TestCases-BuyerPortal.xlsx',
};

const SPEC_DIR = {
  Admin: 'admin',
  SM: 'sales-manager',
  CP: 'cp',
  Buyer: 'buyer',
};

const file = PORTAL_FILE[portalArg];
if (!file) { console.error('Unknown portal:', portalArg); process.exit(1); }

// Normalise sheetName: strip " - Master" suffix if present
const moduleName = sheetArg.replace(/ - Master$/, '').trim();
const masterName = `${moduleName} - Master`;
const execName = `${moduleName} - Exec`;

const XLSX_PATH = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', file);

const HEADERS = ['TC ID', 'Status', 'Automation Status', 'Last Run Status', 'Execution Details', 'Actual Result (Run)', 'Screenshot Link'];
const COL_WIDTHS = [20, 14, 20, 16, 40, 45, 55];

// Reference palette (factory functions — ExcelJS style-sharing bug avoidance)
const HDR_FILL = () => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: '002E75B6' } });
const HDR_FONT = { bold: true, color: { argb: '00FFFFFF' }, size: 11, name: 'Arial' };
const AUTO_FONT = { bold: true, color: { argb: '00375623' }, size: 10, name: 'Arial' }; // dark green
const NOT_AUTO_FONT = { color: { argb: '00595959' }, size: 10, name: 'Arial' };          // mid-grey

const TC_ID_RX = /^(ADM_|SM_|CP_|BYR_|TC_)/;

// Build a reverse-alias map from xlsx-write-results.js (xlsxId → true).
// We parse the SPEC_TO_XLSX_ALIAS constant with a lightweight regex so the
// bootstrap knows which xlsx IDs are reachable from spec tests without a full
// module import (xlsx-write-results.js has process.argv side-effects).
function buildReverseAliasSet() {
  const writeResultsPath = path.join(__dirname, 'xlsx-write-results.js');
  if (!fs.existsSync(writeResultsPath)) return new Set();
  const src = fs.readFileSync(writeResultsPath, 'utf8');
  // Extract just the SPEC_TO_XLSX_ALIAS block (between the const decl and its closing };)
  const blockRx = /const SPEC_TO_XLSX_ALIAS\s*=\s*\{([\s\S]*?)\};\s*\n/;
  const blockM = blockRx.exec(src);
  if (!blockM) return new Set();
  const block = blockM[1];
  // Extract all quoted xlsx TC_ID values (single or double quoted strings)
  const valRx = /['"]((ADM|SM|CP|BYR|TC)_[A-Z0-9_]+)['"][,\s]/g;
  const set = new Set();
  let m;
  while ((m = valRx.exec(block))) set.add(m[1]);
  return set;
}

// Extract ALL TC IDs referenced anywhere in the spec (test titles, aliases, comments).
// Returns a Set of all TC_ID strings found in the file content.
function loadSpecIds(portal, module) {
  const slug = module.toLowerCase().replace(/\s+/g, '-');
  const specDir = SPEC_DIR[portal] || portal.toLowerCase();
  const specPath = path.join(__dirname, '..', 'tests', 'e2e', specDir, `${slug}.spec.js`);
  if (!fs.existsSync(specPath)) {
    console.log(`  ⚠ Spec not found: ${specPath} — all TCs marked Not Automated`);
    return new Set();
  }
  const src = fs.readFileSync(specPath, 'utf8');
  // Scan entire file for any TC_ID token (covers test() titles, alias comments, SPEC_TO_XLSX_ALIAS blocks)
  const rx = /\b((?:ADM|SM|CP|BYR|TC)(?:_[A-Z][A-Z0-9]*)+(?:_\d+[a-z]?))/g;
  const ids = new Set();
  let m;
  while ((m = rx.exec(src))) ids.add(m[1]);
  console.log(`  Spec ${specPath}: ${ids.size} TC_ID tokens found`);
  return ids;
}

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);

  // Guard: already exists
  if (wb.getWorksheet(execName)) {
    console.log(`✓ "${execName}" already exists — skipping (idempotent).`);
    return;
  }

  const master = wb.getWorksheet(masterName);
  if (!master) {
    console.error(`✘ Master sheet "${masterName}" not found in ${file}`);
    process.exit(1);
  }

  // Collect TC IDs from Master
  const tcIds = [];
  master.eachRow((row) => {
    const v = ((row.getCell(1).value || '') + '').trim();
    if (TC_ID_RX.test(v)) tcIds.push(v);
  });
  console.log(`  Master "${masterName}": ${tcIds.length} TC IDs found`);

  // Load spec to pre-classify.
  // A TC is Automated if its xlsx ID appears in the spec directly, OR if it's
  // a target in the SPEC_TO_XLSX_ALIAS map (meaning a spec test covers it via alias).
  const specIds = loadSpecIds(portalArg, moduleName);
  const aliasTargets = buildReverseAliasSet();
  console.log(`  Alias map: ${aliasTargets.size} xlsx IDs reachable via spec aliases`);

  // Create Exec sheet
  const s = wb.addWorksheet(execName);
  s.columns = COL_WIDTHS.map((w) => ({ width: w }));

  // Header row
  const hdr = s.addRow(HEADERS);
  hdr.eachCell((c) => {
    c.fill = HDR_FILL();
    c.font = HDR_FONT;
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  hdr.height = 22;

  // TC rows
  let automated = 0;
  for (const id of tcIds) {
    const isAuto = specIds.has(id) || aliasTargets.has(id);
    const row = s.addRow([id, '', isAuto ? 'Automated' : 'Not Automated', '', '', '', '']);
    row.getCell(1).alignment = { vertical: 'middle' };
    row.getCell(3).font = isAuto ? AUTO_FONT : NOT_AUTO_FONT;
    row.getCell(3).alignment = { vertical: 'middle' };
    if (isAuto) automated++;
  }

  await wb.xlsx.writeFile(XLSX_PATH);
  console.log(`✓ Created "${execName}" in ${file}`);
  console.log(`   ${tcIds.length} TCs: ${automated} Automated, ${tcIds.length - automated} Not Automated`);
})();
