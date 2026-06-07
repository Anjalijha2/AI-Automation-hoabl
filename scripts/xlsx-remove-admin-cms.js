// scripts/xlsx-remove-admin-cms.js
// Remove the "Admin CMS" sheet from TestCases-AdminPortal.xlsx (module deprecated, replaced by Config).
// Backup already taken at manual-qa-repository/07-execution/_backup-pre-cleanup-v2/.

const ExcelJS = require('exceljs');
const path = require('path');

const XLSX_PATH = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', 'TestCases-AdminPortal.xlsx');

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);

  const before = wb.worksheets.length;
  let removedSheet = null;
  let removedRows = 0;

  wb.eachSheet((sheet) => {
    if (sheet.name === 'Admin CMS') {
      removedSheet = sheet.name;
      removedRows = sheet.rowCount;
    }
  });

  if (!removedSheet) {
    console.log('No "Admin CMS" sheet found — nothing to remove.');
    process.exit(0);
  }

  wb.removeWorksheet(wb.getWorksheet('Admin CMS').id);
  await wb.xlsx.writeFile(XLSX_PATH);

  console.log(`✓ Removed sheet "${removedSheet}" (${removedRows} rows)`);
  console.log(`  Workbook now has ${wb.worksheets.length} sheets (was ${before})`);
})();
