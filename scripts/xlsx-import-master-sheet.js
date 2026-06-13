// scripts/xlsx-import-master-sheet.js
// Import a "<Module> - Master" sheet from an external reference workbook into a
// portal workbook, replacing any existing sheets for that module. Copies cell
// values + core styling (fills, fonts, alignment) + column widths + merges.
//
// Usage:
//   node scripts/xlsx-import-master-sheet.js <portal> "<SourceSheet>" <sourceXlsxPath> ["<OldSheetToRemove>" ...]

'use strict';

const ExcelJS = require('exceljs');
const path = require('path');

const args = process.argv.slice(2);
const [portal, srcSheetName, srcPath, ...oldSheets] = args;
if (!portal || !srcSheetName || !srcPath) {
  console.error('Usage: node xlsx-import-master-sheet.js <portal> "<SourceSheet>" <sourceXlsxPath> ["<OldSheet>" ...]');
  process.exit(1);
}

const PORTAL_FILE = {
  Admin: 'TestCases-AdminPortal.xlsx', SM: 'TestCases-SMPortal.xlsx',
  CP: 'TestCases-CPPortal.xlsx', Buyer: 'TestCases-BuyerPortal.xlsx',
};
const DEST = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', PORTAL_FILE[portal]);

(async () => {
  const srcWb = new ExcelJS.Workbook();
  await srcWb.xlsx.readFile(srcPath);
  const src = srcWb.getWorksheet(srcSheetName);
  if (!src) { console.error('Source sheet not found:', srcSheetName); process.exit(1); }

  const destWb = new ExcelJS.Workbook();
  await destWb.xlsx.readFile(DEST);

  // Remove old sheets for this module
  for (const name of [srcSheetName, ...oldSheets]) {
    const ws = destWb.getWorksheet(name);
    if (ws) { destWb.removeWorksheet(ws.id); console.log('  removed old sheet:', name); }
  }

  const dest = destWb.addWorksheet(srcSheetName);

  // Column widths
  src.columns.forEach((col, i) => { if (col.width) dest.getColumn(i + 1).width = col.width; });

  // Copy rows with style
  src.eachRow({ includeEmpty: true }, (row, rNum) => {
    const newRow = dest.getRow(rNum);
    row.eachCell({ includeEmpty: true }, (cell, cNum) => {
      const nc = newRow.getCell(cNum);
      nc.value = cell.value;
      if (cell.font) nc.font = cell.font;
      if (cell.fill) nc.fill = cell.fill;
      if (cell.alignment) nc.alignment = cell.alignment;
      if (cell.border) nc.border = cell.border;
    });
    if (row.height) newRow.height = row.height;
    newRow.commit();
  });

  // Copy merged cells
  const merges = src.model.merges || [];
  for (const m of merges) { try { dest.mergeCells(m); } catch (e) { /* ignore */ } }

  await destWb.xlsx.writeFile(DEST);
  console.log(`✓ Imported "${srcSheetName}" (${src.rowCount} rows) into ${PORTAL_FILE[portal]}`);
})();
