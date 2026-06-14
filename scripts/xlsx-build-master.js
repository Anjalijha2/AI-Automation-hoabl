// scripts/xlsx-build-master.js
// Build a "<Module> - Master" sheet from a structured JSON and write it into the
// portal workbook, replacing any prior sheets for that module. Matches the XR Portal
// gold-standard format (see .claude/skills/tc-coverage-contract/xrportal-format.md):
//   notes block → blank → 12-col header → [sub-module banner → TC rows] repeated.
//
// JSON shape:
// {
//   "portal": "Admin", "module": "Login", "sheetName": "Login - Master",
//   "notes": ["1. ...", "2. [TEST_DATA_REQUIRED] = ...", ...],
//   "subModules": [
//     { "name": "Login Screen",
//       "tcs": [ { "id","scenario","description","precond","steps","testData","expected" }, ... ] },
//     ...
//   ],
//   "replaceSheets": ["Login", "Login (Exec)"]   // optional old sheets to drop
// }
//
// Usage: node scripts/xlsx-build-master.js <jsonPath>

'use strict';

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2];
if (!jsonPath) { console.error('Usage: node xlsx-build-master.js <jsonPath>'); process.exit(1); }

const PORTAL_FILE = {
  Admin: 'TestCases-AdminPortal.xlsx', SM: 'TestCases-SMPortal.xlsx',
  CP: 'TestCases-CPPortal.xlsx', Buyer: 'TestCases-BuyerPortal.xlsx',
  // full-name aliases (agents may emit either form)
  'Sales Manager': 'TestCases-SMPortal.xlsx',
  'Channel Partner': 'TestCases-CPPortal.xlsx',
};

const HEADERS = ['Testcase_ID', 'Module Name', 'Sub Module', 'Testcase_Scenario', 'Testcase Description', 'Precondition', 'Test Steps', 'Test data', 'Expected results', 'Actual result', 'Stauts: Pass/Fail', 'Pass/Fail Resource - Anjali'];

// Reference palette (matches Customers - Master). Factory functions, not constants:
// ExcelJS corrupts its style registry when one fill object is shared across many
// cells — every cell must get a fresh object.
const HDR_FILL = () => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: '00FFD24D' } });
const BANNER_FILL = () => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: '002E75B6' } });
const NOTE_FILL = () => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: '00FFF2CC' } });
const HDR_FONT = { bold: true, color: { argb: '00000000' }, size: 11, name: 'Arial' };
const BANNER_FONT = { bold: true, color: { argb: '00FFFFFF' }, size: 10, name: 'Arial' };
const TITLE_FONT = { bold: true, color: { argb: '00C00000' }, size: 11, name: 'Arial' };
const NOTE_FONT = { size: 10, name: 'Arial' };

(async () => {
  const spec = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const file = PORTAL_FILE[spec.portal];
  if (!file) { console.error('Unknown portal:', spec.portal); process.exit(1); }
  const xpath = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', file);

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(xpath);

  // Drop old sheets for this module
  const toDrop = new Set([spec.sheetName, ...(spec.replaceSheets || [])]);
  for (const ws of [...wb.worksheets]) if (toDrop.has(ws.name)) { wb.removeWorksheet(ws.id); }

  const s = wb.addWorksheet(spec.sheetName);
  s.columns = [
    { width: 18 }, { width: 14 }, { width: 22 }, { width: 32 }, { width: 50 },
    { width: 28 }, { width: 50 }, { width: 22 }, { width: 55 }, { width: 18 }, { width: 14 }, { width: 18 },
  ];

  // Notes block
  const titleRow = s.addRow(['Some points to remember of testcases']);
  s.mergeCells(1, 1, 1, 6);
  titleRow.getCell(1).font = TITLE_FONT;
  titleRow.getCell(1).fill = NOTE_FILL();
  titleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  for (const note of (spec.notes || [])) {
    const nr = s.addRow([note]);
    s.mergeCells(nr.number, 1, nr.number, 6);
    nr.getCell(1).font = NOTE_FONT;
    nr.getCell(1).fill = NOTE_FILL();
    nr.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  }
  s.addRow([]); // blank separator

  // Header
  const hRow = s.addRow(HEADERS);
  hRow.eachCell((c) => { c.font = HDR_FONT; c.fill = HDR_FILL(); c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; });

  // Sub-module groups
  let tcCount = 0;
  for (const sm of (spec.subModules || [])) {
    const banner = s.addRow([sm.name]);
    s.mergeCells(banner.number, 1, banner.number, HEADERS.length);
    banner.getCell(1).font = BANNER_FONT;
    banner.getCell(1).fill = BANNER_FILL();
    banner.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    for (const tc of (sm.tcs || [])) {
      const row = s.addRow([
        tc.id, spec.module, sm.name,
        tc.scenario || '', tc.description || '', tc.precond || '',
        tc.steps || '', tc.testData || '', tc.expected || '',
        '', '', '', // Actual result, Status, Resource — blank at authoring
      ]);
      row.alignment = { vertical: 'top', wrapText: true };
      tcCount++;
    }
  }

  await wb.xlsx.writeFile(xpath);
  console.log(`✓ Built "${spec.sheetName}" in ${file}`);
  console.log(`   Sub-modules: ${(spec.subModules || []).length} | TCs: ${tcCount}`);
})();
