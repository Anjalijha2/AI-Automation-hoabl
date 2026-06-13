// scripts/xlsx-apply-readable-prose.js
// Apply human-readable prose (Scenario / Preconditions / Steps / Test Data /
// Expected Result) onto a module's readable main sheet, from a JSON map.
//
// JSON shape (produced by BA Agent during the semantic rewrite pass):
//   {
//     "ADM_CUST_001": {
//       "scenario":      "Verify that ...",
//       "preconditions": "An admin is logged in.",
//       "steps":         "1. ... 2. ... 3. ...",
//       "testData":      "Phone: 8888888888",
//       "expected":      "The table shows only ..."
//     },
//     ...
//   }
//
// Only these 5 prose columns are touched: 3 Scenario, 6 Preconditions, 7 Steps,
// 8 Test Data, 9 Expected. TC ID / Module / Test Type / Layer / Priority untouched.
// Idempotent — re-applying the same JSON yields the same result.
//
// Usage: node scripts/xlsx-apply-readable-prose.js <Admin|SM|CP|Buyer> "<SheetName>" <proseJsonPath>

'use strict';

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const [portal, sheetName, jsonPath] = process.argv.slice(2);
if (!portal || !sheetName || !jsonPath) {
  console.error('Usage: node xlsx-apply-readable-prose.js <portal> "<SheetName>" <proseJsonPath>');
  process.exit(1);
}

const PORTAL_FILE = {
  Admin: 'TestCases-AdminPortal.xlsx',
  SM: 'TestCases-SMPortal.xlsx',
  CP: 'TestCases-CPPortal.xlsx',
  Buyer: 'TestCases-BuyerPortal.xlsx',
};
const XLSX_PATH = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', PORTAL_FILE[portal]);

// Readable main-sheet columns: 1 TCID 2 Module 3 Scenario 4 TestType 5 Layer
// 6 Preconditions 7 Steps 8 TestData 9 Expected 10 Priority
const COL = { tcid: 1, scenario: 3, precond: 6, steps: 7, testData: 8, expected: 9 };

(async () => {
  const prose = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);
  const sheet = wb.getWorksheet(sheetName);
  if (!sheet) { console.error('Sheet not found:', sheetName); process.exit(1); }

  let applied = 0;
  const missing = [];
  const seen = new Set();

  for (let r = 3; r <= sheet.rowCount; r++) {
    const id = (sheet.getRow(r).getCell(COL.tcid).value || '').toString().trim();
    if (!id || !prose[id]) continue;
    const p = prose[id];
    const row = sheet.getRow(r);
    if (p.scenario)      row.getCell(COL.scenario).value = p.scenario;
    if (p.preconditions) row.getCell(COL.precond).value = p.preconditions;
    if (p.steps)         row.getCell(COL.steps).value = p.steps;
    if (p.testData != null) row.getCell(COL.testData).value = p.testData;
    if (p.expected)      row.getCell(COL.expected).value = p.expected;
    row.alignment = { vertical: 'top', wrapText: true };
    seen.add(id);
    applied++;
  }

  for (const id of Object.keys(prose)) if (!seen.has(id)) missing.push(id);

  await wb.xlsx.writeFile(XLSX_PATH);
  console.log(`✓ Applied readable prose to ${applied} rows in ${PORTAL_FILE[portal]} → "${sheetName}"`);
  if (missing.length) {
    console.log(`⚠ ${missing.length} JSON TC_IDs not found in sheet:`);
    missing.slice(0, 20).forEach((id) => console.log('  -', id));
  }
})();
