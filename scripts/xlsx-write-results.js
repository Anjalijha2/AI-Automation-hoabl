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

// Spec-to-xlsx alias map. Values can be a string OR an array (1:N — one spec test
// verifies multiple xlsx TCs that describe the same observable behavior).
const SPEC_TO_XLSX_ALIAS = {
  // ── Admin Login ─────────────────────────────────────────────────────────
  // FUNC_001 (valid mobile+OTP → /admin/customers) verifies several xlsx rows
  TC_LOGIN_FUNC_001: ['ADM_LGN_031', 'ADM_LGN_018', 'ADM_LGN_009', 'ADM_LGN_001', 'ADM_LGN_002', 'ADM_LGN_007', 'ADM_LGN_010'],
  TC_LOGIN_FUNC_002: ['ADM_LGN_009', 'ADM_LGN_010', 'ADM_LGN_003'],
  TC_LOGIN_FUNC_003: ['ADM_LGN_032', 'ADM_LGN_033', 'ADM_LGN_063'],  // session persists
  TC_LOGIN_FUNC_004: ['ADM_LGN_035'],  // logout
  TC_LOGIN_VAL_001:  ['ADM_LGN_014'],
  TC_LOGIN_VAL_002:  ['ADM_LGN_015'],
  TC_LOGIN_VAL_003:  ['ADM_LGN_022'],
  TC_LOGIN_VAL_004:  ['ADM_LGN_021', 'ADM_LGN_025'],  // wrong OTP + retry behavior
  TC_LOGIN_VAL_005:  ['ADM_LGN_011', 'ADM_LGN_012', 'ADM_LGN_013', 'ADM_LGN_017'],  // non-numeric/special/digits/maxlen
  TC_LOGIN_NEG_001:  ['ADM_LGN_016'],
  TC_LOGIN_NEG_002:  ['ADM_LGN_023', 'ADM_LGN_024'],
  TC_LOGIN_NEG_003:  ['ADM_LGN_036', 'ADM_LGN_008'],  // protected route + direct URL only
  TC_LOGIN_EDGE_001: ['ADM_LGN_067'],
  TC_LOGIN_EDGE_002: ['ADM_LGN_020'],
  TC_LOGIN_FUNC_BACK:['ADM_LGN_030'],
  TC_LOGIN_E2E_001:  ['ADM_LGN_031'],  // shares with FUNC_001 (1 xlsx row tracks both)
  // ── Admin Login — new TCs (27) ──────────────────────────────────────────
  TC_LOGIN_UI_006:    ['ADM_LGN_006'],    // copyright footer
  TC_LOGIN_UI_026:    ['ADM_LGN_026'],    // OTP countdown timer
  TC_LOGIN_UI_040:    ['ADM_LGN_040'],    // responsive 375×667
  TC_LOGIN_FUNC_004b: ['ADM_LGN_004'],    // T&C link clickable
  TC_LOGIN_FUNC_005:  ['ADM_LGN_005'],    // Privacy Policy link clickable
  TC_LOGIN_FUNC_019:  ['ADM_LGN_019'],    // OTP auto-advance focus
  TC_LOGIN_FUNC_027:  ['ADM_LGN_027'],    // Re-Send disabled during timer
  TC_LOGIN_FUNC_028:  ['ADM_LGN_028'],    // Re-Send enabled after timer
  TC_LOGIN_FUNC_029:  ['ADM_LGN_029'],    // Re-Send click restarts timer
  TC_LOGIN_FUNC_068:  ['ADM_LGN_068'],    // OTP paste auto-fills
  TC_LOGIN_FUNC_069:  ['ADM_LGN_069'],    // backspace moves to previous
  TC_LOGIN_NEG_037:   ['ADM_LGN_037'],    // SQL injection sanitized
  TC_LOGIN_NEG_038:   ['ADM_LGN_038'],    // XSS injection sanitized
  TC_LOGIN_NEG_039:   ['ADM_LGN_039'],    // unregistered mobile (fixme)
  TC_LOGIN_NEG_065:   ['ADM_LGN_065'],    // tampered JWT redirect
  TC_LOGIN_NEG_066:   ['ADM_LGN_066'],    // leading-zero mobile rejected
  // ── Admin Customers ─────────────────────────────────────────────────────
  TC_CUST_FUNC_001: ['ADM_CUST_001', 'ADM_CUST_002', 'ADM_CUST_003', 'ADM_CUST_006', 'TC_CUST_UI_041'],  // page load + KPI + table heading + banner
  TC_CUST_FUNC_002: ['ADM_CUST_007', 'ADM_CUST_009', 'ADM_CUST_010', 'ADM_CUST_011', 'ADM_CUST_012'],  // table columns
  TC_CUST_FUNC_003: ['ADM_CUST_008'],
  TC_CUST_FUNC_004: ['ADM_CUST_015', 'ADM_CUST_016'],  // filter open + apply
  TC_CUST_FUNC_005: ['ADM_CUST_017'],  // reset
  TC_CUST_FUNC_006: ['ADM_CUST_021'],
  TC_CUST_FUNC_007: ['ADM_CUST_013', 'ADM_CUST_014'],  // search + clear
  TC_CUST_FUNC_008: ['ADM_CUST_035'],
  TC_CUST_FUNC_008b:['ADM_CUST_036'],
  TC_CUST_FUNC_009: ['ADM_CUST_008'],
  TC_CUST_NEG_002:  ['ADM_CUST_036'],
  TC_CUST_REG_002:  ['ADM_CUST_038'],
  TC_CUST_API_003:  ['ADM_CUST_FSD_001'],
  TC_CUST_API_003b: ['ADM_CUST_FSD_002'],
  // ── Admin Customers — Goal 2 (read/filter/pagination, implemented) ──────
  TC_CUST_FUNC_018: ['ADM_CUST_018'],
  TC_CUST_FUNC_019: ['ADM_CUST_019'],
  TC_CUST_FUNC_020: ['ADM_CUST_020'],
  TC_CUST_FUNC_022: ['ADM_CUST_022'],
  TC_CUST_FUNC_023: ['ADM_CUST_023'],
  TC_CUST_FUNC_024: ['ADM_CUST_024'],
  TC_CUST_FUNC_025: ['ADM_CUST_025'],
  TC_CUST_FUNC_030: ['ADM_CUST_030'],
  TC_CUST_FUNC_033: ['ADM_CUST_033'],
  TC_CUST_FUNC_034: ['ADM_CUST_034'],
  TC_CUST_FUNC_037: ['ADM_CUST_037'],
  // ── Admin Customers — Goal 10 (negative read-only, implemented) ─────────
  TC_CUST_NEG_010: ['ADM_CUST_010'],
  TC_CUST_NEG_011: ['ADM_CUST_011'],
  TC_CUST_NEG_049: ['ADM_CUST_049'],
  // ── Admin Customers — Goal 3 (Cancel Registration, fixme scaffolds) ─────
  TC_CUST_FUNC_026: ['ADM_CUST_026'],
  TC_CUST_FUNC_027: ['ADM_CUST_027'],
  TC_CUST_FUNC_028: ['ADM_CUST_028'],
  TC_CUST_FUNC_029: ['ADM_CUST_029'],
  TC_CUST_FUNC_044: ['ADM_CUST_044'],
  TC_CUST_FUNC_045: ['ADM_CUST_045'],
  TC_CUST_FUNC_046: ['ADM_CUST_046'],
  TC_CUST_FUNC_047: ['ADM_CUST_047'],
  TC_CUST_FUNC_102: ['ADM_CUST_102'],
  TC_CUST_FUNC_103: ['ADM_CUST_103'],
  TC_CUST_FUNC_105: ['ADM_CUST_105'],
  // ── Admin Customers — Goal 4 (Cancel Unit, fixme scaffolds) ─────────────
  TC_CUST_FUNC_042: ['ADM_CUST_042'],
  TC_CUST_FUNC_043: ['ADM_CUST_043'],
  TC_CUST_FUNC_098: ['ADM_CUST_098'],
  TC_CUST_FUNC_099: ['ADM_CUST_099'],
  TC_CUST_FUNC_100: ['ADM_CUST_100'],
  TC_CUST_FUNC_101: ['ADM_CUST_101'],
  TC_CUST_FUNC_104: ['ADM_CUST_104'],
  TC_CUST_NEG_091:  ['ADM_CUST_091'],
  // ── Admin Customers — Goal 5 (Unit Swap, fixme scaffolds) ───────────────
  TC_CUST_FUNC_060: ['ADM_CUST_060'],
  TC_CUST_FUNC_061: ['ADM_CUST_061'],
  TC_CUST_FUNC_062: ['ADM_CUST_062'],
  TC_CUST_FUNC_063: ['ADM_CUST_063'],
  TC_CUST_FUNC_064: ['ADM_CUST_064'],
  TC_CUST_FUNC_071: ['ADM_CUST_071'],
  TC_CUST_NEG_065:  ['ADM_CUST_065'],
  TC_CUST_NEG_066:  ['ADM_CUST_066'],
  TC_CUST_NEG_067:  ['ADM_CUST_067'],
  TC_CUST_NEG_068:  ['ADM_CUST_068'],
  TC_CUST_NEG_069:  ['ADM_CUST_069'],
  TC_CUST_NEG_070:  ['ADM_CUST_070'],
  // ── Admin Customers — Goal 6 (Update Parking, fixme scaffolds) ──────────
  TC_CUST_FUNC_080: ['ADM_CUST_080'],
  TC_CUST_FUNC_081: ['ADM_CUST_081'],
  TC_CUST_FUNC_082: ['ADM_CUST_082'],
  TC_CUST_FUNC_083: ['ADM_CUST_083'],
  TC_CUST_FUNC_086: ['ADM_CUST_086'],
  TC_CUST_FUNC_087: ['ADM_CUST_087'],
  TC_CUST_VAL_084:  ['ADM_CUST_084'],
  TC_CUST_VAL_085:  ['ADM_CUST_085'],
  TC_CUST_NEG_088:  ['ADM_CUST_088'],
  TC_CUST_NEG_089:  ['ADM_CUST_089'],
  TC_CUST_NEG_090:  ['ADM_CUST_090'],
  TC_CUST_FUNC_093: ['ADM_CUST_093'],
  // ── Admin Customers — Goal 7 (Offline Payment / Milestones, fixme) ──────
  TC_CUST_FUNC_050: ['ADM_CUST_050'],
  TC_CUST_FUNC_051: ['ADM_CUST_051'],
  TC_CUST_FUNC_052: ['ADM_CUST_052'],
  TC_CUST_FUNC_053: ['ADM_CUST_053'],
  TC_CUST_FUNC_054: ['ADM_CUST_054'],
  TC_CUST_FUNC_055: ['ADM_CUST_055'],
  TC_CUST_FUNC_056: ['ADM_CUST_056'],
  TC_CUST_NEG_057:  ['ADM_CUST_057'],
  TC_CUST_NEG_094:  ['ADM_CUST_094'],
  // ── Admin Customers — Goal 8 (Home Loan Approval extra, fixme) ──────────
  TC_CUST_FUNC_031: ['ADM_CUST_031'],
  TC_CUST_FUNC_032: ['ADM_CUST_032'],
  // ── Admin Customers — Goal 9 (Bulk Cancel, fixme) ───────────────────────
  TC_CUST_NEG_092:  ['ADM_CUST_092'],
};

// Normalize: ensure all alias values are arrays internally
function aliasFor(specId) {
  const v = SPEC_TO_XLSX_ALIAS[specId];
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}
function reverseAlias(xlsxId) {
  for (const [specId, targets] of Object.entries(SPEC_TO_XLSX_ALIAS)) {
    const arr = Array.isArray(targets) ? targets : [targets];
    if (arr.includes(xlsxId)) return specId;
  }
  return null;
}

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

    // Match by direct id OR via alias reverse lookup (supports 1:N)
    let result = results.get(id);
    if (!result) {
      const specId = reverseAlias(id);
      if (specId && results.has(specId)) result = results.get(specId);
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
  const sheetIds = new Set();
  for (let r = 3; r <= sheet.rowCount; r++) {
    const id = (sheet.getRow(r).getCell(1).value || '').toString().trim();
    if (id) sheetIds.add(id);
  }
  for (const [tcid] of results) {
    const directHit = sheetIds.has(tcid);
    const aliasHit = aliasFor(tcid).some((t) => sheetIds.has(t));
    if (!directHit && !aliasHit) unmatched.push(tcid);
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
