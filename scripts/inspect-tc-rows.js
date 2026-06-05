// Inspect actual data rows from an existing sheet to understand formatting
const ExcelJS = require('exceljs');
const path = require('path');

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.resolve('manual-qa-repository/07-execution/TestCases-BuyerPortal.xlsx'));
  const ws = wb.getWorksheet('Registration Login');
  console.log('Total rowCount:', ws.rowCount);
  // print rows 1-6 then last
  for (const idx of [1, 2, 3, 4, 5, 6, ws.rowCount - 1, ws.rowCount]) {
    const row = ws.getRow(idx);
    const vals = [];
    row.eachCell({ includeEmpty: true }, (cell) => vals.push(cell.value));
    console.log(`Row ${idx}: ${JSON.stringify(vals).slice(0, 600)}`);
  }
  // Also extract existing TC IDs in column 1 starting row 3
  const ids = new Set();
  for (let r = 3; r <= ws.rowCount; r++) {
    const v = ws.getRow(r).getCell(1).value;
    if (v && typeof v === 'string' && v.startsWith('TC')) ids.add(v.trim());
  }
  console.log('Existing TC IDs in Registration Login:', Array.from(ids).slice(0, 5), '...', `(${ids.size} total)`);

  // Inspect consolidated
  console.log('\n--- Consolidated ---');
  const wb2 = new ExcelJS.Workbook();
  await wb2.xlsx.readFile(path.resolve('manual-qa-repository/07-execution/TestCases-Consolidated.xlsx'));
  const ws2 = wb2.getWorksheet('All Test Cases');
  console.log('Total rowCount:', ws2.rowCount);
  for (const idx of [1, 2, 3, 4, 5]) {
    const row = ws2.getRow(idx);
    const vals = [];
    row.eachCell({ includeEmpty: true }, (cell) => vals.push(cell.value));
    console.log(`Row ${idx}: ${JSON.stringify(vals).slice(0, 800)}`);
  }
})();
