// scripts/xlsx-deepcheck-physical-allocation.js
// Deep-check SM Physical Allocation sheet: scenario overlap across 18 prefix generations.
// Read-only.

const ExcelJS = require('exceljs');
const path = require('path');

const XLSX_PATH = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', 'TestCases-SMPortal.xlsx');

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);
  const sheet = wb.getWorksheet('Physical Allocation');

  // Find Scenario column from header row 2
  const headerRow = sheet.getRow(2);
  let scenarioCol = -1;
  headerRow.eachCell((c, col) => {
    const v = (c.value || '').toString().toLowerCase();
    if (v.includes('scenario') || v.includes('description') || v.includes('title')) scenarioCol = col;
  });
  console.log('Scenario column index:', scenarioCol);

  const byPrefix = new Map();
  const all = [];

  for (let r = 3; r <= sheet.rowCount; r++) {
    const id = (sheet.getRow(r).getCell(1).value || '').toString().trim();
    const scenario = scenarioCol > 0 ? (sheet.getRow(r).getCell(scenarioCol).value || '').toString().trim() : '';
    const m = id.match(/^([A-Z][A-Z0-9_]*?)_(\d{3,}[a-z]?)$/);
    if (!m) continue;
    const prefix = m[1];
    if (!byPrefix.has(prefix)) byPrefix.set(prefix, []);
    byPrefix.get(prefix).push({ id, scenario, row: r });
    all.push({ id, scenario, prefix, row: r });
  }

  console.log(`\nTotal TCs: ${all.length}`);
  console.log(`Distinct prefixes: ${byPrefix.size}`);
  console.log('\n=== Prefix Generation Map ===');
  const sortedPrefixes = [...byPrefix.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [p, tcs] of sortedPrefixes) {
    console.log(`  ${p}: ${tcs.length} TCs`);
  }

  // Normalise scenario text for overlap detection
  function norm(s) {
    return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function firstWords(s, n = 6) {
    return s.split(' ').slice(0, n).join(' ');
  }

  // Bucket by first-6-word prefix to find scenario clusters
  const clusters = new Map();
  for (const t of all) {
    const ns = norm(t.scenario);
    if (!ns) continue;
    const key = firstWords(ns);
    if (key.length < 10) continue;
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key).push(t);
  }

  // Find clusters with >1 TC across different prefixes
  const overlaps = [];
  for (const [key, tcs] of clusters) {
    if (tcs.length < 2) continue;
    const prefixes = new Set(tcs.map((t) => t.prefix));
    if (prefixes.size < 2) continue; // intra-prefix dup is fine (same gen, sequential)
    overlaps.push({ key, count: tcs.length, prefixes: [...prefixes], tcs });
  }

  console.log(`\n=== Cross-prefix scenario clusters: ${overlaps.length} ===`);
  overlaps.slice(0, 30).forEach((o) => {
    console.log(`\n  "${o.key}..." (${o.count} TCs across ${o.prefixes.join(', ')}):`);
    o.tcs.forEach((t) => console.log(`    - ${t.id}: ${t.scenario.slice(0, 100)}`));
  });

  if (overlaps.length > 30) console.log(`\n  ... (${overlaps.length - 30} more clusters omitted)`);

  // Count rows safely removable: anything in clusters with >1 prefix → keep only the "latest" (using rule: shortest prefix name, or prefix with FSD suffix wins, else first)
  console.log(`\n=== Estimated removable rows: ${overlaps.reduce((s, o) => s + o.count - 1, 0)} (keep 1 per cluster) ===`);
})();
