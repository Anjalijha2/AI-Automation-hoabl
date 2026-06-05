const ExcelJS = require('exceljs');
const path = require('path');
(async () => {
  // Verify Consolidated grew correctly
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.resolve('manual-qa-repository/07-execution/TestCases-Consolidated.xlsx'));
  const ws = wb.getWorksheet('All Test Cases');
  console.log(`Consolidated 'All Test Cases' rowCount: ${ws.rowCount}`);

  // Spot-check one of the new rows
  const lastRow = ws.getRow(ws.rowCount);
  const sample = [];
  lastRow.eachCell({ includeEmpty: true }, c => sample.push(c.value));
  console.log(`Last row (${ws.rowCount}):`, JSON.stringify(sample).slice(0, 500));

  // Spot-check a known new TC by scanning
  for (let r = 2; r <= ws.rowCount; r++) {
    const v = ws.getRow(r).getCell(1).value;
    if (typeof v === 'string' && v === 'TC_WP_E2E_001') {
      const vals = [];
      ws.getRow(r).eachCell({ includeEmpty: true }, c => vals.push(c.value));
      console.log(`\nTC_WP_E2E_001 at row ${r}:`, JSON.stringify(vals).slice(0, 700));
      break;
    }
  }

  // Sample a buyer portal sheet
  const wb2 = new ExcelJS.Workbook();
  await wb2.xlsx.readFile(path.resolve('manual-qa-repository/07-execution/TestCases-BuyerPortal.xlsx'));
  const ws2 = wb2.getWorksheet('Home Dashboard');
  for (let r = 3; r <= ws2.rowCount; r++) {
    const v = ws2.getRow(r).getCell(1).value;
    if (typeof v === 'string' && v === 'TC_HOMEDASH_FUNC_001') {
      const vals = [];
      ws2.getRow(r).eachCell({ includeEmpty: true }, c => vals.push(c.value));
      console.log(`\nTC_HOMEDASH_FUNC_001 (Buyer/Home Dashboard) at row ${r}:`, JSON.stringify(vals).slice(0, 700));
      break;
    }
  }
})();
