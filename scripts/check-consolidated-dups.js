const ExcelJS = require('exceljs');
const path = require('path');
(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.resolve('manual-qa-repository/07-execution/TestCases-Consolidated.xlsx'));
  const ws = wb.getWorksheet('All Test Cases');
  const idCounts = new Map();
  for (let r = 2; r <= ws.rowCount; r++) {
    const v = ws.getRow(r).getCell(1).value;
    let s = typeof v === 'string' ? v : (v && v.richText ? v.richText.map(x => x.text).join('') : '');
    s = (s || '').trim();
    if (/^TC[_-]/i.test(s)) {
      idCounts.set(s, (idCounts.get(s) || 0) + 1);
    }
  }
  let dups = 0;
  for (const [id, c] of idCounts) {
    if (c > 1) {
      console.log(`DUP x${c}: ${id}`);
      dups++;
    }
  }
  console.log(`Total unique TC IDs: ${idCounts.size}`);
  console.log(`Duplicates: ${dups}`);
})();
