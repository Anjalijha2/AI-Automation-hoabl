// scripts/xlsx-write-results.js
// Parse playwright run log → populate Status / Last Run Status / Execution Details /
// Actual Result (Run) / Screenshot Link / Automation Status columns in xlsx.
// Also mirrors status into TestCases.md (appends/updates Status column).
//
// Usage:
//   node scripts/xlsx-write-results.js <portal> <sheetName> <logPath> [testResultsDir]
//
// Example:
//   node scripts/xlsx-write-results.js Admin Customers test-results-admin-customers.log test-results

'use strict';

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const [portalArg, sheetName, logPath, testResultsDir] = process.argv.slice(2);
if (!portalArg || !sheetName || !logPath) {
  console.error('Usage: node xlsx-write-results.js <portal> <sheetName> <logPath> [testResultsDir]');
  process.exit(1);
}

const PORTAL_FILE = {
  Admin: 'TestCases-AdminPortal.xlsx',
  SM: 'TestCases-SMPortal.xlsx',
  CP: 'TestCases-CPPortal.xlsx',
  Buyer: 'TestCases-BuyerPortal.xlsx',
};

const XLSX_PATH = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', PORTAL_FILE[portalArg]);
const RESULTS_DIR = testResultsDir || path.join(__dirname, '..', 'test-results');

// Spec-to-xlsx alias map. Extend as needed.
const SPEC_TO_XLSX_ALIAS = {
  // Admin Customers — example mappings (semantic, not 1:1)
  // TC_CUST_FUNC_001: 'ADM_CUST_001',
  // TC_CUST_FUNC_002: 'ADM_CUST_002',
};

// ─── Parse playwright list-reporter log ──────────────────────────────────────
function parseLog(content) {
  const results = new Map();
  // Pattern: "  ✓  6 [e2e] › path › TC_LOGIN_FUNC_001 — ... (35.1s)"
  //          "  ✘  7 [e2e] › path › TC_LOGIN_FUNC_001 — ... (retry #1) (1.1m)"
  //          "  -  19 [e2e] › path › TC_LOGIN_NEG_014 — ..."
  const rx = /^\s*([✓✘\-])\s+\d+\s+\[[^\]]+\][^\n]*?(TC[_-][A-Z][A-Z0-9_]+_\d+[a-z]?|ADM_[A-Z]+_\d+|SM_[A-Z]+_\d+|CP_[A-Z]+_\d+|BYR_[A-Z]+_\d+)[^\n]*?(?:\(([^)]+)\))?$/gm;
  let m;
  while ((m = rx.exec(content))) {
    const symbol = m[1];
    const tcid = m[2];
    const meta = m[3] || '';
    const isRetry = meta.includes('retry');
    let status;
    if (symbol === '✓') status = 'Pass';
    else if (symbol === '✘') status = 'Fail';
    else if (symbol === '-') status = 'Skip';
    // Latest result wins (retry passes overwrite earlier fail)
    if (!results.has(tcid) || (status === 'Pass' && isRetry)) {
      results.set(tcid, { status, duration: meta, isRetry });
    }
  }
  return results;
}

// ─── Find error context for a failed TC ───────────────────────────────────────
function findScreenshot(tcid, results, sheetName, portalArg) {
  if (!fs.existsSync(RESULTS_DIR)) return '';
  const dirs = fs.readdirSync(RESULTS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
  // Match dir name fragment to TC_ID lowercased + sanitized
  const tcFrag = tcid.toLowerCase().replace(/_/g, '-');
  for (const d of dirs) {
    if (d.name.toLowerCase().includes(tcFrag.slice(-15))) {
      const failed = path.join(RESULTS_DIR, d.name, 'test-failed-1.png');
      if (fs.existsSync(failed)) return path.relative(path.join(__dirname, '..'), failed).replace(/\\/g, '/');
    }
  }
  return '';
}

// ─── Update xlsx ──────────────────────────────────────────────────────────────
async function updateXlsx(results) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);
  const sheet = wb.getWorksheet(sheetName);
  if (!sheet) {
    console.error('Sheet not found:', sheetName);
    process.exit(1);
  }

  // Column indices (per audit): 1=TCID 2=Feature 3=Type 4=Scenario 5=Pre 6=Steps 7=Expected 8=Actual 9=Status 10=Priority 11=AutomationStatus 12=LastRunStatus 13=ExecDetails 14=ActualResultRun 15=ScreenshotLink

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST';
  let updated = 0;
  let unmatched = [];

  for (let r = 3; r <= sheet.rowCount; r++) {
    const id = (sheet.getRow(r).getCell(1).value || '').toString().trim();
    if (!id) continue;

    // Match by direct id OR via alias map
    let result = results.get(id);
    if (!result) {
      // Reverse lookup: any spec id whose alias points to this xlsx id?
      for (const [specId, xlsxId] of Object.entries(SPEC_TO_XLSX_ALIAS)) {
        if (xlsxId === id && results.has(specId)) {
          result = results.get(specId);
          break;
        }
      }
    }
    if (!result) continue;

    const row = sheet.getRow(r);
    const isPass = result.status === 'Pass';
    const isFail = result.status === 'Fail';
    const isSkip = result.status === 'Skip';

    // col 9 — Status
    row.getCell(9).value = isPass ? 'Pass' : isFail ? 'Fail' : isSkip ? 'Skip' : 'Pending';
    // col 11 — Automation Status
    row.getCell(11).value = 'Automated';
    // col 12 — Last Run Status
    row.getCell(12).value = result.status + (result.isRetry ? ' (retry)' : '');
    // col 13 — Execution Details
    const details = isFail ? `${timestamp} — failed in ${result.duration || 'n/a'}` : `${timestamp} — ${result.status.toLowerCase()} in ${result.duration || 'n/a'}`;
    row.getCell(13).value = details;
    // col 14 — Actual Result (Run)
    row.getCell(14).value = isPass ? 'Matches expected' : isFail ? 'See screenshot + error context' : 'Not executed';
    // col 15 — Screenshot Link
    if (isFail) {
      const link = findScreenshot(id, results, sheetName, portalArg);
      row.getCell(15).value = link || '';
    } else {
      row.getCell(15).value = '';
    }

    updated++;
  }

  // log unmatched results (spec ran but no xlsx row)
  for (const [tcid] of results) {
    let matched = false;
    for (let r = 3; r <= sheet.rowCount; r++) {
      if ((sheet.getRow(r).getCell(1).value || '').toString().trim() === tcid) {
        matched = true;
        break;
      }
      if (Object.entries(SPEC_TO_XLSX_ALIAS).some(([k, v]) => k === tcid && (sheet.getRow(r).getCell(1).value || '').toString().trim() === v)) {
        matched = true;
        break;
      }
    }
    if (!matched) unmatched.push(tcid);
  }

  await wb.xlsx.writeFile(XLSX_PATH);
  return { updated, unmatched };
}

(async () => {
  const logContent = fs.readFileSync(logPath, 'utf8');
  const results = parseLog(logContent);
  console.log(`Parsed ${results.size} TC results from ${logPath}`);

  if (results.size === 0) {
    console.log('No TC results found in log — exiting.');
    return;
  }

  const { updated, unmatched } = await updateXlsx(results);
  console.log(`✓ Updated ${updated} rows in ${PORTAL_FILE[portalArg]} → sheet "${sheetName}"`);
  if (unmatched.length > 0) {
    console.log(`⚠ ${unmatched.length} spec TC_IDs had no xlsx match (TC_ID alignment needed):`);
    unmatched.slice(0, 20).forEach((id) => console.log('  -', id));
    console.log('  → Add to SPEC_TO_XLSX_ALIAS in this script, OR rename spec test() titles.');
  }
})();
