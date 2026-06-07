// scripts/xlsx-audit-portal.js
// Generic read-only audit of any TestCases-<Portal>.xlsx file.
// Usage: node scripts/xlsx-audit-portal.js <portal>
// Where <portal> is one of: Admin, SM, CP, Buyer, Consolidated

const ExcelJS = require('exceljs');
const path = require('path');

const portal = process.argv[2];
if (!portal) {
  console.error('Usage: node xlsx-audit-portal.js <Admin|SM|CP|Buyer|Consolidated>');
  process.exit(1);
}

const FILENAME_MAP = {
  Admin: 'TestCases-AdminPortal.xlsx',
  SM: 'TestCases-SMPortal.xlsx',
  CP: 'TestCases-CPPortal.xlsx',
  Buyer: 'TestCases-BuyerPortal.xlsx',
  Consolidated: 'TestCases-Consolidated.xlsx',
};

const XLSX_PATH = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', FILENAME_MAP[portal]);
if (!FILENAME_MAP[portal]) {
  console.error('Unknown portal:', portal);
  process.exit(1);
}

const TC_ID_RE = /^([A-Z][A-Z0-9_]*)_(\d{3,}[a-z]?)$/;

function classifyId(raw) {
  if (!raw) return { kind: 'EMPTY' };
  const id = String(raw).trim();
  if (!id) return { kind: 'EMPTY' };
  if (/^[━─=\-_*]{3,}/.test(id) || /━{3,}/.test(id)) return { kind: 'DIVIDER', text: id };
  if (id === 'TC ID' || id === 'TC_ID' || id === 'TCID') return { kind: 'HEADER' };
  const m = id.match(TC_ID_RE);
  if (!m) return { kind: 'OTHER', text: id };
  return { kind: 'TC', id, prefix: m[1], num: m[2] };
}

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);

  const report = [];
  let grandTotal = 0;
  const globalIds = new Map(); // for cross-sheet dup detection

  wb.eachSheet((sheet) => {
    if (sheet.name === '📋 Index' || sheet.name.toLowerCase().includes('index')) return;

    const tcsById = new Map();
    const prefixCounts = new Map();
    const duplicates = [];
    const others = [];
    let dividerCount = 0;
    let dataRows = 0;

    for (let r = 1; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const c1 = row.getCell(1).value;
      const cls = classifyId(c1);
      if (cls.kind === 'TC') {
        dataRows++;
        prefixCounts.set(cls.prefix, (prefixCounts.get(cls.prefix) || 0) + 1);
        if (tcsById.has(cls.id)) {
          duplicates.push({ id: cls.id, rows: [...tcsById.get(cls.id).rows, r] });
          tcsById.get(cls.id).rows.push(r);
        } else {
          tcsById.set(cls.id, { rows: [r] });
        }
        // global dup tracking
        if (!globalIds.has(cls.id)) globalIds.set(cls.id, []);
        globalIds.get(cls.id).push(sheet.name);
      } else if (cls.kind === 'DIVIDER') {
        dividerCount++;
      } else if (cls.kind === 'OTHER') {
        others.push({ row: r, text: cls.text.slice(0, 60) });
      }
    }

    const sortedPrefixes = [...prefixCounts.entries()].sort((a, b) => b[1] - a[1]);
    const dominant = sortedPrefixes[0] || ['—', 0];
    const stalePrefixes = sortedPrefixes.slice(1);

    grandTotal += dataRows;

    report.push({
      sheet: sheet.name,
      totalRows: sheet.rowCount,
      dataRows,
      dividers: dividerCount,
      dominantPrefix: dominant[0],
      dominantCount: dominant[1],
      stalePrefixes: stalePrefixes.map(([p, c]) => `${p}(${c})`).join(', ') || '—',
      stalePrefixCount: stalePrefixes.reduce((s, [, c]) => s + c, 0),
      duplicates: duplicates.length,
      duplicateIds: duplicates.map((d) => d.id).slice(0, 5),
      othersCount: others.length,
      othersSample: others.slice(0, 3).map((o) => `r${o.row}:${o.text}`),
    });
  });

  console.log(`# ${portal} xlsx Inventory — ${FILENAME_MAP[portal]}`);
  console.log(`Total data TC rows across sheets: ${grandTotal}\n`);

  console.log('| Sheet | Rows | Data | Dominant | Supplemental | Sup# | Dups |');
  console.log('|-------|-----:|-----:|----------|--------------|-----:|-----:|');
  for (const r of report) {
    console.log(`| ${r.sheet} | ${r.totalRows} | ${r.dataRows} | ${r.dominantPrefix}(${r.dominantCount}) | ${r.stalePrefixes} | ${r.stalePrefixCount} | ${r.duplicates} |`);
  }

  // Cross-sheet duplicates
  const crossDups = [...globalIds.entries()].filter(([, sheets]) => sheets.length > 1);
  if (crossDups.length > 0) {
    console.log(`\n## Cross-sheet duplicates: ${crossDups.length}`);
    crossDups.slice(0, 10).forEach(([id, sheets]) => {
      console.log(`  - ${id}: ${sheets.join(', ')}`);
    });
  }

  console.log('\n## In-sheet duplicates\n');
  for (const r of report) {
    if (r.duplicates > 0) console.log(`### ${r.sheet}: ${r.duplicates} dups (sample: ${r.duplicateIds.join(', ')})`);
  }

  console.log('\n## Non-TC rows (col 1 noise)\n');
  for (const r of report) {
    if (r.othersCount > 1) {
      // skip the trivial r1 banner — count rows >1 means content drift
      const real = r.othersSample.filter((s) => !s.match(/r1:/));
      if (real.length > 0) {
        console.log(`### ${r.sheet} — ${r.othersCount}`);
        real.forEach((s) => console.log('  -', s));
      }
    }
  }

  console.log('\n# End.');
})();
