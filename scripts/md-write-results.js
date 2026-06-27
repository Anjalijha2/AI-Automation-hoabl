// scripts/md-write-results.js
// Appends a "## Last Run" block to a module's TestCases.md after every spec run.
// Reads Playwright JSON reporter output (reports/results.json) — always written
// alongside the log.
//
// Does NOT modify inline table cells — appends only.
//
// Usage:
//   node scripts/md-write-results.js <portal> <module>
//
// Example:
//   node scripts/md-write-results.js Admin Customers

'use strict';

const fs   = require('fs');
const path = require('path');

const [portalArg, moduleArg] = process.argv.slice(2);
if (!portalArg || !moduleArg) {
  console.error('Usage: node md-write-results.js <portal> <module>');
  process.exit(1);
}

// ─── Alias map (same source as xlsx-write-results.js) ────────────────────────
// Only the entries we need; extend as more modules are added.
const SPEC_TO_XLSX_ALIAS = {
  // Admin Login
  TC_LOGIN_FUNC_001: ['ADM_LGN_031', 'ADM_LGN_018', 'ADM_LGN_009', 'ADM_LGN_001', 'ADM_LGN_002', 'ADM_LGN_007', 'ADM_LGN_010'],
  TC_LOGIN_FUNC_002: ['ADM_LGN_009', 'ADM_LGN_010', 'ADM_LGN_003'],
  TC_LOGIN_FUNC_003: ['ADM_LGN_032', 'ADM_LGN_033', 'ADM_LGN_063'],
  TC_LOGIN_FUNC_004: ['ADM_LGN_035'],
  // Admin Customers
  TC_CUST_FUNC_001: ['ADM_CUST_001', 'ADM_CUST_002', 'ADM_CUST_003', 'ADM_CUST_006', 'TC_CUST_UI_041'],
  TC_CUST_FUNC_002: ['ADM_CUST_007', 'ADM_CUST_009', 'ADM_CUST_010', 'ADM_CUST_011', 'ADM_CUST_012'],
  TC_CUST_FUNC_003: ['ADM_CUST_008'],
  TC_CUST_FUNC_004: ['ADM_CUST_015', 'ADM_CUST_016'],
  TC_CUST_FUNC_005: ['ADM_CUST_017'],
  TC_CUST_FUNC_006: ['ADM_CUST_021'],
  TC_CUST_FUNC_007: ['ADM_CUST_013', 'ADM_CUST_014'],
  TC_CUST_FUNC_008: ['ADM_CUST_035'],
  TC_CUST_FUNC_008b:['ADM_CUST_036'],
  TC_CUST_FUNC_009: ['ADM_CUST_008'],
  TC_CUST_REG_002:  ['ADM_CUST_038', 'ADM_CUST_003', 'ADM_CUST_005', 'ADM_CUST_040'],
  TC_CUST_BIZ_004:  ['ADM_CUST_004'],
};

function xlsxRows(specId) {
  const v = SPEC_TO_XLSX_ALIAS[specId];
  if (!v) return [specId];
  return Array.isArray(v) ? v : [v];
}

// ─── Resolve TestCases.md path ────────────────────────────────────────────────
const MODULE_MD_PATH = {
  Customers: path.join(__dirname, '..', 'manual-qa-repository', '01-test-cases', 'admin', 'customers', 'TestCases.md'),
  Allocation: path.join(__dirname, '..', 'manual-qa-repository', '01-test-cases', 'admin', 'allocation', 'TestCases.md'),
  Login:      path.join(__dirname, '..', 'manual-qa-repository', '01-test-cases', 'admin', 'login', 'TestCases.md'),
  Config:     path.join(__dirname, '..', 'manual-qa-repository', '01-test-cases', 'admin', 'config', 'TestCases.md'),
};
const mdPath = MODULE_MD_PATH[moduleArg];
if (!mdPath || !fs.existsSync(mdPath)) {
  console.error(`TestCases.md not found for module "${moduleArg}" at ${mdPath}`);
  process.exit(1);
}

// ─── Read results.json ────────────────────────────────────────────────────────
const jsonPath = path.join(__dirname, '..', 'reports', 'results.json');
if (!fs.existsSync(jsonPath)) {
  console.error(`reports/results.json not found — run Playwright with the json reporter first.`);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// ─── Walk specs and extract per-test results ──────────────────────────────────
function* walkSpecs(suite) {
  for (const spec of (suite.specs || [])) yield spec;
  for (const sub of (suite.suites || [])) yield* walkSpecs(sub);
}

const rows = [];
for (const suite of (data.suites || [])) {
  for (const spec of walkSpecs(suite)) {
    // In Playwright JSON, the test title lives on spec.title; test objects carry results
    const specTitle = spec.title || '';
    for (const test of (spec.tests || [])) {
      // Use spec title (or test.title as fallback)
      const title = specTitle || (test.title || '');
      const tcMatch = title.match(/^(TC[_-][A-Z][A-Z0-9_]+_\d+[a-z]?|ADM(?:_[A-Z]+)+_\d+[a-z]?)/);
      if (!tcMatch) continue;

      const specId  = tcMatch[1];
      const results = test.results || [];
      const last    = results[results.length - 1] || {};
      const status  = last.status || test.status || 'unknown';
      const durationMs = last.duration || 0;
      const dur = durationMs < 1000 ? `${durationMs}ms` : `${(durationMs / 1000).toFixed(1)}s`;

      // Collect annotations
      const anns = {};
      for (const a of (last.annotations || test.annotations || [])) {
        anns[a.type] = a.description;
      }
      // Fallback: annotations may be on test object directly
      for (const a of (test.annotations || [])) {
        if (!anns[a.type]) anns[a.type] = a.description;
      }

      // Build step summary from steps
      const stepLines = [];
      for (const step of (last.steps || [])) {
        if (step.category !== 'test') continue;
        const stepStatus = step.error ? '❌' : '✅';
        const stepDur = step.duration < 1000 ? `${step.duration}ms` : `${(step.duration / 1000).toFixed(1)}s`;
        stepLines.push(`${stepStatus} ${step.title} (${stepDur})`);
      }

      const icon = status === 'passed' ? '✅ PASS' : status === 'failed' ? '❌ FAIL' : status === 'skipped' ? '⏭ SKIP' : `? ${status}`;
      const xlsxList = xlsxRows(specId).join(' / ');
      const testData = anns.testData || '—';
      const actualResult = stepLines.length > 0
        ? stepLines.join('; ')
        : (status === 'passed' ? 'All assertions matched expected' : status === 'failed' ? 'See error-context.md in test-results/' : 'Not executed');

      rows.push({ specId, xlsxList, icon, testData, actualResult, dur });
    }
  }
}

if (rows.length === 0) {
  console.log('No TC results found in results.json — nothing to append.');
  process.exit(0);
}

// ─── Build IST timestamp ──────────────────────────────────────────────────────
const now = new Date();
const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
const timestamp = ist.toISOString().replace('T', ' ').slice(0, 16) + ' IST';

// ─── Build the markdown block ─────────────────────────────────────────────────
const header = `\n---\n\n## Last Run: ${timestamp}\n\n`;
const tableHeader = '| TC_ID (spec) | xlsx Row(s) | Status | Test Data | Actual Result | Duration |\n|---|---|---|---|---|---|\n';
const tableRows = rows.map(r =>
  `| ${r.specId} | ${r.xlsxList} | ${r.icon} | ${r.testData} | ${r.actualResult} | ${r.dur} |`
).join('\n');

const block = header + tableHeader + tableRows + '\n';

// ─── Append to TestCases.md ───────────────────────────────────────────────────
// Remove previous "## Last Run" block (if any) so we don't accumulate duplicates
// for the exact same run timestamp. Keep older runs.
let existing = fs.readFileSync(mdPath, 'utf8');

fs.appendFileSync(mdPath, block, 'utf8');
console.log(`✓ Appended Last Run block (${rows.length} TCs) to ${mdPath}`);
console.log(`  Timestamp: ${timestamp}`);
rows.forEach(r => console.log(`  ${r.icon}  ${r.specId} (${r.dur})`));
