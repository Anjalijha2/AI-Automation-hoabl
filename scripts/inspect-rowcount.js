const ExcelJS = require('exceljs');
const path = require('path');
(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.resolve('manual-qa-repository/07-execution/TestCases-BuyerPortal.xlsx'));
  wb.worksheets.forEach(ws => {
    console.log(`Sheet "${ws.name}": rowCount=${ws.rowCount}, actualRowCount=${ws.actualRowCount}, columnCount=${ws.columnCount}, actualColumnCount=${ws.actualColumnCount}`);
  });
})();
