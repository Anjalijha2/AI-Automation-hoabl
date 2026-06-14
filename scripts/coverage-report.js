// scripts/coverage-report.js
// Compare TC_IDs in a portal xlsx sheet vs those covered in a spec file.
// Usage: node coverage-report.js <portal> <sheetName> <specPath>

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const [portal, sheetName, specPath] = process.argv.slice(2);
if (!portal || !sheetName || !specPath) {
  console.error('Usage: node coverage-report.js <Admin|SM|CP|Buyer> <SheetName> <specPath>');
  process.exit(1);
}

const FILENAME_MAP = {
  Admin: 'TestCases-AdminPortal.xlsx',
  SM: 'TestCases-SMPortal.xlsx',
  CP: 'TestCases-CPPortal.xlsx',
  Buyer: 'TestCases-BuyerPortal.xlsx',
};

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.join(__dirname, '..', 'manual-qa-repository', '07-execution', FILENAME_MAP[portal]));
  // Resolve sheet: try exact name → "<name> - Master" → "<name>"
  const base = sheetName.replace(/ - Master$/, '').trim();
  const sheet = wb.getWorksheet(sheetName)
    || wb.getWorksheet(`${base} - Master`)
    || wb.getWorksheet(base);
  if (!sheet) {
    console.error('Sheet not found:', sheetName);
    process.exit(1);
  }
  const resolvedName = sheet.name;

  // Find scenario column — scan from row 1 (Master sheets have a notes block before the header)
  let headerRowNum = 1;
  for (let r = 1; r <= Math.min(sheet.rowCount, 20); r++) {
    const v = ((sheet.getRow(r).getCell(1).value || '') + '').trim();
    if (v === 'Testcase_ID') { headerRowNum = r; break; }
  }
  const headerRow = sheet.getRow(headerRowNum);
  let scenarioCol = -1;
  headerRow.eachCell((c, col) => {
    const v = (c.value || '').toString().toLowerCase();
    if (v.includes('scenario') || v.includes('description') || v.includes('title')) scenarioCol = col;
  });

  const xlsxTcs = [];
  for (let r = headerRowNum + 1; r <= sheet.rowCount; r++) {
    const id = (sheet.getRow(r).getCell(1).value || '').toString().trim();
    if (/^[A-Z][A-Z0-9_]*_\d{3,}[a-z]?$/.test(id)) {
      const scenario = scenarioCol > 0 ? (sheet.getRow(r).getCell(scenarioCol).value || '').toString().trim() : '';
      xlsxTcs.push({ id, scenario });
    }
  }

  const specContent = fs.readFileSync(path.join(__dirname, '..', specPath), 'utf8');
  const specTcIds = new Set();
  const rx = /\b(TC_[A-Z][A-Z0-9_]+_\d+[a-z]?|ADM_[A-Z]+_\d+|SM_[A-Z]+_\d+|CP_[A-Z]+_\d+|BYR_[A-Z]+_\d+)\b/g;
  let m;
  while ((m = rx.exec(specContent))) specTcIds.add(m[1]);

  const xlsxIds = new Set(xlsxTcs.map((t) => t.id));
  const covered = [...specTcIds].filter((id) => xlsxIds.has(id));
  const orphanInSpec = [...specTcIds].filter((id) => !xlsxIds.has(id));
  const uncoveredInXlsx = xlsxTcs.filter((t) => !specTcIds.has(t.id));

  console.log(`# Coverage Report — ${portal} / ${resolvedName}`);
  console.log(`Spec: ${specPath}\n`);
  console.log(`xlsx TCs: ${xlsxTcs.length}`);
  console.log(`Spec TC refs: ${specTcIds.size}`);
  console.log(`✓ Covered: ${covered.length}`);
  console.log(`⚠ Orphan in spec (not in xlsx): ${orphanInSpec.length}`);
  console.log(`✗ Uncovered in xlsx (missing from spec): ${uncoveredInXlsx.length}`);
  console.log(`\nCoverage: ${((covered.length / xlsxTcs.length) * 100).toFixed(1)}%\n`);

  console.log(`## ✓ Covered (${covered.length})`);
  covered.sort().forEach((id) => console.log('  -', id));

  if (orphanInSpec.length > 0) {
    console.log(`\n## ⚠ Orphan in Spec — not in xlsx (${orphanInSpec.length})`);
    orphanInSpec.forEach((id) => console.log('  -', id));
  }

  console.log(`\n## ✗ Uncovered TCs from xlsx — needs spec implementation (${uncoveredInXlsx.length})`);
  uncoveredInXlsx.forEach((t) => console.log(`  - ${t.id}: ${t.scenario.slice(0, 100)}`));
})();
