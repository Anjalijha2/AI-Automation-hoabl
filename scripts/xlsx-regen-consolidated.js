// scripts/xlsx-regen-consolidated.js
// Regenerate TestCases-Consolidated.xlsx by merging the 4 per-portal xlsx files.
// Preserves per-portal cleanup (e.g., Admin CMS sheet removed).

const ExcelJS = require('exceljs');
const path = require('path');

const EXEC_DIR = path.join(__dirname, '..', 'manual-qa-repository', '07-execution');

const SOURCES = [
  { portal: 'Admin', file: 'TestCases-AdminPortal.xlsx' },
  { portal: 'SM', file: 'TestCases-SMPortal.xlsx' },
  { portal: 'CP', file: 'TestCases-CPPortal.xlsx' },
  { portal: 'Buyer', file: 'TestCases-BuyerPortal.xlsx' },
];

const OUT = path.join(EXEC_DIR, 'TestCases-Consolidated.xlsx');

(async () => {
  const out = new ExcelJS.Workbook();
  out.creator = 'xlsx-regen-consolidated';
  out.created = new Date();

  // Index sheet first
  const idx = out.addWorksheet('📋 Index');
  idx.addRow(['Portal', 'Sheet', 'Source File', 'Data TC Rows']);
  idx.getRow(1).font = { bold: true };

  let totalRows = 0;
  let totalSheets = 0;

  for (const src of SOURCES) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(path.join(EXEC_DIR, src.file));

    wb.eachSheet((sheet) => {
      if (sheet.name === '📋 Index' || sheet.name.toLowerCase().includes('index')) return;

      // Prefix sheet name with portal to keep names unique (no [], / chars allowed)
      const newName = `${src.portal} - ${sheet.name}`.slice(0, 31);
      const newSheet = out.addWorksheet(newName);

      // Copy column widths
      sheet.columns.forEach((col, i) => {
        if (col.width) newSheet.getColumn(i + 1).width = col.width;
      });

      // Copy rows
      let dataRows = 0;
      for (let r = 1; r <= sheet.rowCount; r++) {
        const srcRow = sheet.getRow(r);
        const values = [];
        srcRow.eachCell({ includeEmpty: true }, (cell, col) => {
          values[col - 1] = cell.value;
        });
        if (values.length > 0) {
          const newRow = newSheet.addRow(values);
          // copy font/fill of row 1-2 for banner/header styling
          if (r <= 2) {
            srcRow.eachCell((cell, col) => {
              const newCell = newRow.getCell(col);
              if (cell.font) newCell.font = cell.font;
              if (cell.fill) newCell.fill = cell.fill;
              if (cell.alignment) newCell.alignment = cell.alignment;
            });
          }
          // count data TC rows (col 1 looks like TC ID)
          const c1 = values[0] ? String(values[0]).trim() : '';
          if (/^[A-Z][A-Z0-9_]*_\d{3,}[a-z]?$/.test(c1)) dataRows++;
        }
      }

      idx.addRow([src.portal, sheet.name, src.file, dataRows]);
      totalRows += dataRows;
      totalSheets++;
    });
  }

  idx.addRow([]);
  idx.addRow(['TOTAL', '', '', totalRows]);
  idx.getRow(idx.rowCount).font = { bold: true };
  idx.getColumn(1).width = 12;
  idx.getColumn(2).width = 30;
  idx.getColumn(3).width = 32;
  idx.getColumn(4).width = 16;

  await out.xlsx.writeFile(OUT);
  console.log(`✓ Wrote ${OUT}`);
  console.log(`  Sheets: ${totalSheets} (plus Index)`);
  console.log(`  Total data TC rows: ${totalRows}`);
})();
