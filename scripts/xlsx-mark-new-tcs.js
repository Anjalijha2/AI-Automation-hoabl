// scripts/xlsx-mark-new-tcs.js
// Apply gray fill (FFA6A6A6 — "White Background 1, Darker 35%") to rows for
// newly-generated TC_IDs so the user can quickly verify them in xlsx.
//
// Usage:
//   node scripts/xlsx-mark-new-tcs.js <portal> <sheetName> [tc_id_1 tc_id_2 ...]
//   (if no tc_ids passed, reads from manual-qa-repository/07-execution/_new-tcs-since-last-review.txt)
//
//   node scripts/xlsx-mark-new-tcs.js --clear <portal> <sheetName> [tc_id_list]
//   (removes the gray fill for given TC_IDs)

'use strict';

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const clearMode = args[0] === '--clear';
if (clearMode) args.shift();
const [portalArg, sheetName, ...tcArgs] = args;

if (!portalArg || !sheetName) {
  console.error('Usage: node xlsx-mark-new-tcs.js [--clear] <portal> <sheetName> [tc_ids...]');
  process.exit(1);
}

const PORTAL_FILE = {
  Admin: 'TestCases-AdminPortal.xlsx',
  SM: 'TestCases-SMPortal.xlsx',
  CP: 'TestCases-CPPortal.xlsx',
  Buyer: 'TestCases-BuyerPortal.xlsx',
};

const XLSX_PATH = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', PORTAL_FILE[portalArg]);
const NEW_TCS_FILE = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', '_new-tcs-since-last-review.txt');

const GRAY_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFA6A6A6' }, // White Background 1, Darker 35%
};

// Collect TC_IDs to mark
let tcIds;
if (tcArgs.length > 0) {
  tcIds = tcArgs;
} else if (fs.existsSync(NEW_TCS_FILE)) {
  tcIds = fs.readFileSync(NEW_TCS_FILE, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
} else {
  console.log('No TC_IDs provided and _new-tcs-since-last-review.txt not found — nothing to do.');
  process.exit(0);
}

if (tcIds.length === 0) {
  console.log('No TC_IDs to process.');
  process.exit(0);
}

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);
  const sheet = wb.getWorksheet(sheetName);
  if (!sheet) {
    console.error('Sheet not found:', sheetName);
    process.exit(1);
  }

  const tcSet = new Set(tcIds);
  let touched = 0;

  for (let r = 3; r <= sheet.rowCount; r++) {
    const id = (sheet.getRow(r).getCell(1).value || '').toString().trim();
    if (!tcSet.has(id)) continue;
    const row = sheet.getRow(r);
    // Apply to columns 1..15 (the TC data range)
    for (let col = 1; col <= 15; col++) {
      const cell = row.getCell(col);
      if (clearMode) {
        // Remove fill (set to no-fill)
        cell.fill = { type: 'pattern', pattern: 'none' };
      } else {
        cell.fill = GRAY_FILL;
      }
    }
    touched++;
  }

  await wb.xlsx.writeFile(XLSX_PATH);
  console.log(`${clearMode ? '✓ Cleared' : '✓ Marked'} ${touched} rows (${tcIds.length} TC_IDs requested) in ${PORTAL_FILE[portalArg]} → "${sheetName}"`);
  if (touched < tcIds.length) {
    const found = new Set();
    for (let r = 3; r <= sheet.rowCount; r++) {
      const id = (sheet.getRow(r).getCell(1).value || '').toString().trim();
      if (tcSet.has(id)) found.add(id);
    }
    const missing = tcIds.filter((id) => !found.has(id));
    console.log('⚠ TC_IDs not found in sheet:');
    missing.forEach((id) => console.log('  -', id));
  }

  // If we marked from the txt file, clear it (consumed)
  if (!clearMode && tcArgs.length === 0 && fs.existsSync(NEW_TCS_FILE)) {
    fs.writeFileSync(NEW_TCS_FILE, '');
    console.log(`✓ Cleared ${NEW_TCS_FILE} (consumed by this run)`);
  }
})();
