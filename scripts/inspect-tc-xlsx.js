// Inspect the structure of TC xlsx files (sheet names, headers, sample rows)
const ExcelJS = require('exceljs');
const path = require('path');

const FILES = [
  'manual-qa-repository/07-execution/TestCases-BuyerPortal.xlsx',
  'manual-qa-repository/07-execution/TestCases-CPPortal.xlsx',
  'manual-qa-repository/07-execution/TestCases-SMPortal.xlsx',
  'manual-qa-repository/07-execution/TestCases-Consolidated.xlsx',
];

(async () => {
  for (const rel of FILES) {
    const full = path.resolve(rel);
    const wb = new ExcelJS.Workbook();
    try {
      await wb.xlsx.readFile(full);
    } catch (e) {
      console.log(`\n=== ${rel} ===\nFAILED TO READ: ${e.message}`);
      continue;
    }
    console.log(`\n=== ${rel} ===`);
    wb.worksheets.forEach((ws) => {
      const headerRow = ws.getRow(1);
      const headers = [];
      headerRow.eachCell({ includeEmpty: false }, (cell) => headers.push(cell.value));
      console.log(`  Sheet: "${ws.name}" | rows: ${ws.rowCount} | cols: ${ws.columnCount}`);
      console.log(`  Headers: ${JSON.stringify(headers)}`);
      // sample first data row
      if (ws.rowCount >= 2) {
        const r2 = ws.getRow(2);
        const sample = [];
        r2.eachCell({ includeEmpty: true }, (cell) => sample.push(cell.value));
        console.log(`  Row2 sample: ${JSON.stringify(sample).slice(0, 400)}`);
      }
    });
  }
})();
