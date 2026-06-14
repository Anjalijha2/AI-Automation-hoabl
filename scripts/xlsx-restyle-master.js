// scripts/xlsx-restyle-master.js
// Re-apply the Customers - Master gold-standard palette to every "<Module> - Master"
// sheet across the 4 portal workbooks, so all modules look identical.
//
// Reference palette (read from Admin → Customers - Master):
//   notes title row  : fill 00FFF2CC, bold dark-red (00C00000) Arial 11
//   note lines       : fill 00FFF2CC, Arial 10
//   header row       : fill 00FFD24D, bold black Arial 11, centered
//   sub-module banner: fill 002E75B6, bold white Arial 10, centered
//
// Only the notes-block, header, and banner rows are restyled. TC data rows are
// left untouched — preserving the gray new-TC fills (FFA6A6A6).
//
// Usage: node scripts/xlsx-restyle-master.js [Admin|SM|CP|Buyer|all]

'use strict';

const ExcelJS = require('exceljs');
const path = require('path');

const PORTAL_FILE = {
  Admin: 'TestCases-AdminPortal.xlsx',
  SM: 'TestCases-SMPortal.xlsx',
  CP: 'TestCases-CPPortal.xlsx',
  Buyer: 'TestCases-BuyerPortal.xlsx',
};

// Factory functions, not constants: ExcelJS corrupts its style registry when the
// same fill object is shared across many cells. Each cell gets a fresh object.
const NOTE_FILL = () => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: '00FFF2CC' } });
const HDR_FILL = () => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: '00FFD24D' } });
const BANNER_FILL = () => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: '002E75B6' } });

const TITLE_FONT = { bold: true, color: { argb: '00C00000' }, size: 11, name: 'Arial' };
const NOTE_FONT = { size: 10, name: 'Arial' };
const HDR_FONT = { bold: true, color: { argb: '00000000' }, size: 11, name: 'Arial' };
const BANNER_FONT = { bold: true, color: { argb: '00FFFFFF' }, size: 10, name: 'Arial' };

const LEFT_MID = { horizontal: 'left', vertical: 'middle', wrapText: true };
const CTR_MID = { horizontal: 'center', vertical: 'middle', wrapText: true };
const CTR = { horizontal: 'center', vertical: 'middle' };

const HEADERS_FIRST = 'Testcase_ID';
const N_COLS = 12;

function restyleSheet(ws) {
  // Locate the header row (col-1 === 'Testcase_ID').
  let headerRow = 0;
  ws.eachRow((r, n) => {
    if (!headerRow && ((r.getCell(1).value || '') + '').trim() === HEADERS_FIRST) headerRow = n;
  });
  if (!headerRow) return { banners: 0, ok: false };

  // Notes block: rows 1..headerRow-1 that carry text.
  for (let n = 1; n < headerRow; n++) {
    const r = ws.getRow(n);
    const v = ((r.getCell(1).value || '') + '').trim();
    if (!v) continue; // blank separator
    const isTitle = n === 1;
    const cell = r.getCell(1);
    cell.fill = NOTE_FILL();
    cell.font = isTitle ? TITLE_FONT : NOTE_FONT;
    cell.alignment = LEFT_MID;
  }

  // Header row.
  const hr = ws.getRow(headerRow);
  for (let c = 1; c <= N_COLS; c++) {
    const cell = hr.getCell(c);
    cell.fill = HDR_FILL();
    cell.font = HDR_FONT;
    cell.alignment = CTR_MID;
  }

  // Sub-module banners: rows after header where col-1 has text that is NOT a TC_ID.
  // (col-2 can't be used — banner rows are merged 1-12, so getCell(2) returns the
  //  merged master's value rather than empty.) TC rows always start with a TC_ID.
  const TC_ID = /^(ADM_|SM_|CP_|BYR_|TC_)/;
  let banners = 0;
  for (let n = headerRow + 1; n <= ws.rowCount; n++) {
    const r = ws.getRow(n);
    const c1 = ((r.getCell(1).value || '') + '').trim();
    if (c1 && !TC_ID.test(c1)) {
      for (let c = 1; c <= N_COLS; c++) {
        const cell = r.getCell(c);
        cell.fill = BANNER_FILL();
        cell.font = BANNER_FONT;
        cell.alignment = CTR;
      }
      banners++;
    }
  }
  return { banners, ok: true };
}

async function restylePortal(key) {
  const file = PORTAL_FILE[key];
  const xpath = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', file);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(xpath);

  let sheets = 0;
  for (const ws of wb.worksheets) {
    if (!/ - Master$/.test(ws.name)) continue;
    if (ws.name === 'Customers - Master') continue; // already the reference
    const { banners, ok } = restyleSheet(ws);
    if (ok) { sheets++; console.log(`   ${ws.name}: header + ${banners} banners restyled`); }
    else console.log(`   ${ws.name}: ⚠ no header row found — skipped`);
  }
  await wb.xlsx.writeFile(xpath);
  console.log(`✓ ${key}: ${sheets} sheets restyled in ${file}`);
}

(async () => {
  const arg = process.argv[2] || 'all';
  const keys = arg === 'all' ? Object.keys(PORTAL_FILE) : [arg];
  for (const k of keys) await restylePortal(k);
})();
