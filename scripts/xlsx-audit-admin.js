// scripts/xlsx-audit-admin.js
// Read-only audit of TestCases-AdminPortal.xlsx — no edits.
// Outputs per-sheet: prefix distribution, dup TC_IDs, suspected stale rows.
// Companion to scripts/cleanup-xlsx-stale-tcs.js.

const ExcelJS = require('exceljs');
const path = require('path');

const XLSX_PATH = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', 'TestCases-AdminPortal.xlsx');

// TC_ID prefix conventions (latest = `TC_<MODULE>_<TYPE>_NNN`).
// Stale = anything else that looks like an ID but doesn't match.
const TC_ID_RE = /^([A-Z][A-Z0-9_]*)_(\d{3,})$/;

function classifyId(raw) {
  if (!raw) return { kind: 'EMPTY' };
  const id = String(raw).trim();
  if (!id) return { kind: 'EMPTY' };
  // Section divider rows like "━━━━━━━━━━  UI TESTS  (8)  ━━━━━━━━━━"
  if (/^[━─=\-_*]{3,}/.test(id) || /━{3,}/.test(id)) return { kind: 'DIVIDER', text: id };
  if (id === 'TC ID' || id === 'TC_ID' || id === 'TCID') return { kind: 'HEADER' };
  const m = id.match(TC_ID_RE);
  if (!m) return { kind: 'OTHER', text: id };
  return { kind: 'TC', id, prefix: m[1], num: parseInt(m[2], 10) };
}

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);

  const report = [];
  let grandTotal = 0;

  wb.eachSheet((sheet) => {
    if (sheet.name === '📋 Index') return;

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
      } else if (cls.kind === 'DIVIDER') {
        dividerCount++;
      } else if (cls.kind === 'OTHER') {
        others.push({ row: r, text: cls.text.slice(0, 60) });
      }
    }

    // Determine "dominant" / "latest" prefix = highest count
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

  console.log('# Admin xlsx Inventory — TestCases-AdminPortal.xlsx');
  console.log(`Path: ${XLSX_PATH}`);
  console.log(`Total data TC rows across sheets: ${grandTotal}\n`);

  console.log('| Sheet | Total Rows | Data TCs | Dominant (latest) | Stale Prefixes | Stale Count | Dups |');
  console.log('|-------|-----------:|---------:|-------------------|----------------|------------:|-----:|');
  for (const r of report) {
    console.log(`| ${r.sheet} | ${r.totalRows} | ${r.dataRows} | ${r.dominantPrefix} (${r.dominantCount}) | ${r.stalePrefixes} | ${r.stalePrefixCount} | ${r.duplicates} |`);
  }

  console.log('\n## Duplicates (sample)\n');
  for (const r of report) {
    if (r.duplicates > 0) {
      console.log(`### ${r.sheet} — ${r.duplicates} dup TC_IDs`);
      console.log('  Sample:', r.duplicateIds.join(', '));
    }
  }

  console.log('\n## Other / unclassified column-1 values (potential data drift)\n');
  for (const r of report) {
    if (r.othersCount > 0) {
      console.log(`### ${r.sheet} — ${r.othersCount} non-TC rows`);
      for (const s of r.othersSample) console.log('  -', s);
    }
  }

  console.log('\n# End of inventory.');
})();
