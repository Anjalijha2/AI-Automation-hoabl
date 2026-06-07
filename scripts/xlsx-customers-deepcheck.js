// scripts/xlsx-customers-deepcheck.js
// Deep-check Admin Customers sheet: do TC_CUST_* rows duplicate scenarios in ADM_CUST_*?
// Read-only — outputs analysis only.

const ExcelJS = require('exceljs');
const path = require('path');

const XLSX_PATH = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', 'TestCases-AdminPortal.xlsx');

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);
  const sheet = wb.getWorksheet('Customers');

  // Find column for Scenario (usually col 5 or 6)
  const headerRow = sheet.getRow(2);
  let scenarioCol = -1;
  headerRow.eachCell((c, col) => {
    const v = (c.value || '').toString().toLowerCase();
    if (v.includes('scenario') || v.includes('description') || v.includes('title')) scenarioCol = col;
  });
  console.log('Scenario column index:', scenarioCol);

  const ADM = [];
  const TC_ = [];

  for (let r = 3; r <= sheet.rowCount; r++) {
    const id = (sheet.getRow(r).getCell(1).value || '').toString().trim();
    const scenario = scenarioCol > 0 ? (sheet.getRow(r).getCell(scenarioCol).value || '').toString().trim() : '';
    if (id.startsWith('ADM_CUST')) ADM.push({ id, scenario });
    else if (id.startsWith('TC_CUST')) TC_.push({ id, scenario });
  }

  console.log(`\nADM_CUST_* count: ${ADM.length}`);
  console.log(`TC_CUST_* count: ${TC_.length}\n`);

  console.log('=== Sample ADM_CUST_* scenarios (first 5) ===');
  ADM.slice(0, 5).forEach((t) => console.log(' -', t.id, ':', t.scenario.slice(0, 100)));

  console.log('\n=== Sample TC_CUST_* scenarios (first 5) ===');
  TC_.slice(0, 5).forEach((t) => console.log(' -', t.id, ':', t.scenario.slice(0, 100)));

  // Simple overlap check: how many TC_CUST_* scenarios appear as substrings in ADM_CUST_*?
  const admScenarios = ADM.map((t) => t.scenario.toLowerCase());
  let overlaps = 0;
  const uniqueTC = [];
  for (const t of TC_) {
    const s = t.scenario.toLowerCase();
    if (!s) continue;
    const overlap = admScenarios.some((as) => {
      if (!as) return false;
      // shared 30+ char substring
      const firstWords = s.split(/\s+/).slice(0, 5).join(' ');
      return firstWords.length > 10 && as.includes(firstWords);
    });
    if (overlap) overlaps++;
    else uniqueTC.push(t);
  }

  console.log(`\nOverlap analysis:`);
  console.log(`  TC_CUST_* with scenario substring overlap into ADM_CUST_*: ${overlaps}/${TC_.length}`);
  console.log(`  TC_CUST_* potentially unique: ${uniqueTC.length}`);

  console.log('\n=== TC_CUST_* potentially UNIQUE (first 10) ===');
  uniqueTC.slice(0, 10).forEach((t) => console.log(' -', t.id, ':', t.scenario.slice(0, 100)));

  // also check the FSD prefix
  const FSD = ADM.filter((t) => /ADM_CUST_FSD/i.test(t.id));
  console.log(`\nADM_CUST_FSD count (gap-fill from FSD doc): ${FSD.length}`);
})();
