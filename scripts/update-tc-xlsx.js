/* eslint-disable */
// scripts/update-tc-xlsx.js
//
// Parse Sprint TC .md files and append rows into portal TestCases-*.xlsx
// + TestCases-Consolidated.xlsx.
//
// Skips any TC_ID already present in the target sheet (idempotent).
//
// Run: node scripts/update-tc-xlsx.js

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// ---------- 1. Source .md mapping (path → portal + module + xlsx sheet name) ----------
const SOURCES = [
  // Buyer
  { portal: 'Buyer',  module: 'Home Dashboard',         sheet: 'Home Dashboard',         md: 'manual-qa-repository/01-test-cases/buyer/home-dashboard/TestCases.md' },
  { portal: 'Buyer',  module: 'Callback Request',       sheet: 'Callback Request',       md: 'manual-qa-repository/01-test-cases/buyer/callback-request/TestCases.md' },
  { portal: 'Buyer',  module: 'Allocation Experience',  sheet: 'Allocation Experience',  md: 'manual-qa-repository/01-test-cases/buyer/allocation-experience/TestCases.md' },
  { portal: 'Buyer',  module: 'KYC',                    sheet: 'KYC',                    md: 'manual-qa-repository/01-test-cases/buyer/kyc/TestCases.md' },
  { portal: 'Buyer',  module: 'Home Loan',              sheet: 'Home Loan',              md: 'manual-qa-repository/01-test-cases/buyer/home-loan/TestCases.md' },
  { portal: 'Buyer',  module: 'Payment Schedule',       sheet: 'Payment Schedule',       md: 'manual-qa-repository/01-test-cases/buyer/payment-schedule/TestCases.md' },
  { portal: 'Buyer',  module: 'Registration Login',     sheet: 'Registration Login',     md: 'manual-qa-repository/01-test-cases/buyer/registration-login/TestCases.md' },
  { portal: 'Buyer',  module: 'Project Information',    sheet: 'Project Information',    md: 'manual-qa-repository/01-test-cases/buyer/project-information/TestCases.md' },
  { portal: 'Buyer',  module: 'Unit Details',           sheet: 'Unit Details',           md: 'manual-qa-repository/01-test-cases/buyer/unit-details/TestCases.md' },
  { portal: 'Buyer',  module: 'Work Progress',          sheet: 'Work Progress',          md: 'manual-qa-repository/01-test-cases/buyer/work-progress/TestCases.md' },

  // Channel Partner
  { portal: 'CP',     module: 'Login',                  sheet: 'Login',                  md: 'manual-qa-repository/01-test-cases/cp/login/TestCases.md' },
  { portal: 'CP',     module: 'Customer Registration',  sheet: 'Customer Registration',  md: 'manual-qa-repository/01-test-cases/cp/customer-registration/TestCases.md' },
  { portal: 'CP',     module: 'Leads Management',       sheet: 'Leads Management',       md: 'manual-qa-repository/01-test-cases/cp/leads-management/TestCases.md' },
  { portal: 'CP',     module: 'JBP Submission',         sheet: 'JBP Submission',         md: 'manual-qa-repository/01-test-cases/cp/jbp-submission/TestCases.md' },
  { portal: 'CP',     module: 'KYC Assistance',         sheet: 'KYC Assistance',         md: 'manual-qa-repository/01-test-cases/cp/kyc-assistance/TestCases.md' },

  // Sales Manager
  { portal: 'SM',     module: 'Login',                  sheet: 'Login',                  md: 'manual-qa-repository/01-test-cases/sm/login/TestCases.md' },
  { portal: 'SM',     module: 'Callback Requests',      sheet: 'Callback Requests',      md: 'manual-qa-repository/01-test-cases/sm/callback-requests/TestCases.md' },
  { portal: 'SM',     module: 'Physical Allocation',    sheet: 'Physical Allocation',    md: 'manual-qa-repository/01-test-cases/sm/physical-allocation/TestCases.md' },
  { portal: 'SM',     module: 'Tower Heatmap',          sheet: 'Tower Heatmap',          md: 'manual-qa-repository/01-test-cases/sm/tower-heatmap/TestCases.md' },
];

const PORTAL_TO_FILE = {
  Buyer: 'manual-qa-repository/07-execution/TestCases-BuyerPortal.xlsx',
  CP:    'manual-qa-repository/07-execution/TestCases-CPPortal.xlsx',
  SM:    'manual-qa-repository/07-execution/TestCases-SMPortal.xlsx',
};
const CONSOLIDATED = 'manual-qa-repository/07-execution/TestCases-Consolidated.xlsx';

const PORTAL_LABEL = {
  Buyer: 'XR Portal Buyer (`https://uat.xrportal.in/`)',
  CP:    'XR Portal Channel Partner (`https://uat-web.xrportal.in/`)',
  SM:    'XR Portal Sales Manager (`https://uat-web.xrportal.in/sales-manager`)',
};

// ---------- 2. Markdown table parser ----------
// Returns array of row-objects keyed by header.
// Only parses the FIRST pipe-table found AFTER a heading containing "Sheet 1" or "Manual Test Cases".
function parseMarkdownTcTable(filePath) {
  const md = fs.readFileSync(filePath, 'utf8');
  const lines = md.split(/\r?\n/);

  // Find start of the manual TC table (Sheet 1)
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/Sheet\s*1.*Manual Test Cases/i.test(lines[i])
        || /^###?\s*Manual Test Cases/i.test(lines[i])
        || /^##\s*Test Cases/i.test(lines[i])) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) startIdx = 0;

  // Locate the header row of the first pipe-table after startIdx
  let headerLineIdx = -1;
  for (let i = startIdx; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.startsWith('|') && /TC_?ID/i.test(l)) {
      headerLineIdx = i;
      break;
    }
  }
  if (headerLineIdx === -1) {
    return { headers: [], rows: [] };
  }

  const splitPipeRow = (line) => {
    let s = line.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|')) s = s.slice(0, -1);
    return s.split('|').map(c => c.trim());
  };

  const headers = splitPipeRow(lines[headerLineIdx]);
  // Skip separator row (---|---)
  let dataStart = headerLineIdx + 1;
  if (/^\|?\s*[:\-]+/.test(lines[dataStart] || '')) dataStart++;

  const rows = [];
  for (let i = dataStart; i < lines.length; i++) {
    const l = lines[i];
    if (!l || !l.trim().startsWith('|')) {
      // End of table (blank line, heading, etc.)
      if (l.trim() === '' || /^#/.test(l) || /^---\s*$/.test(l)) break;
      continue;
    }
    const cells = splitPipeRow(l);
    if (cells.length < 2) continue;
    const row = {};
    for (let h = 0; h < headers.length; h++) {
      row[headers[h]] = cells[h] !== undefined ? cells[h] : '';
    }
    if (row[headers[0]] && /^TC[_-]/i.test(row[headers[0]])) {
      rows.push(row);
    }
  }
  return { headers, rows };
}

// ---------- 2b. Per-TC section parser (Work Progress style) ----------
// Format: ### TC_<ID> — <Title>
//         | Field | Value |
//         | TC_ID | ... |
//         | BRD/FRD Req ID | ... |
//         ... (one row per attribute)
function parseMarkdownTcSections(filePath) {
  const md = fs.readFileSync(filePath, 'utf8');
  const lines = md.split(/\r?\n/);
  const rows = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Match an H3 starting with TC_
    const h3 = line.match(/^###\s+(TC[_-][A-Za-z0-9_-]+)\b/);
    if (!h3) { i++; continue; }
    // Walk forward to find the field/value table and parse k/v rows
    const row = {};
    let j = i + 1;
    while (j < lines.length && !/^###\s+TC[_-]/.test(lines[j]) && !/^---\s*$/.test(lines[j])) {
      const l = lines[j].trim();
      if (l.startsWith('|') && !/^\|?\s*[-:]+\s*\|/.test(l)) {
        const cells = l.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
        if (cells.length >= 2) {
          const key = cells[0].toLowerCase();
          const val = cells.slice(1).join(' | ').trim();
          if (key && val && key !== 'field') row[key] = val;
        }
      }
      j++;
    }
    if (row['tc_id'] || row['tc id']) {
      // Normalise keys to match pipe-table headers expected by getHeader()
      const norm = {
        'TC_ID':            row['tc_id'] || row['tc id'] || h3[1],
        'Req ID':           row['brd/frd req id'] || row['req id'] || row['brd req id'] || '',
        'Portal':           row['portal'] || '',
        'Module':           row['module'] || '',
        'Type':             row['type'] || '',
        'Scenario':         row['scenario'] || '',
        'Preconditions':    row['preconditions'] || row['precondition'] || row['pre-conditions'] || '',
        'Steps':            row['steps'] || row['test steps'] || '',
        'Expected Result':  row['expected result'] || row['expected'] || '',
        'Visual Evidence':  row['visual evidence'] || '',
        'Test Data':        row['test data'] || '',
        'Priority':         row['priority'] || '',
        'Status':           row['status'] || '',
      };
      rows.push(norm);
    }
    i = j;
  }
  const headers = ['TC_ID','Req ID','Portal','Module','Type','Scenario','Preconditions','Steps','Expected Result','Visual Evidence','Test Data','Priority','Status'];
  return { headers, rows };
}

// Wrapper that tries pipe-table first, falls back to section-based.
function parseMd(filePath) {
  let res = parseMarkdownTcTable(filePath);
  if (!res.rows.length) {
    res = parseMarkdownTcSections(filePath);
  }
  return res;
}

// ---------- 3. Helpers ----------
function cleanCellText(text) {
  if (text === undefined || text === null) return '';
  let s = String(text);
  // <br>, <br/>, <br /> → newline
  s = s.replace(/<br\s*\/?>/gi, '\n');
  // backticks: keep as-is (Excel handles fine)
  return s;
}

function getHeader(headers, ...candidates) {
  for (const c of candidates) {
    const lc = c.toLowerCase().replace(/[\s_]+/g, '');
    const match = headers.find(h => h.toLowerCase().replace(/[\s_]+/g, '') === lc);
    if (match) return match;
  }
  return null;
}

function isAutomatable(status, visualEvidence) {
  // Status === "Conditional" or visual evidence == "VISUAL_GAP..." → No
  if (/conditional/i.test(status || '')) return 'No';
  if (/VISUAL_GAP/.test(visualEvidence || '')) return 'No';
  return 'Yes';
}

// ---------- 4. Find existing TC IDs in a sheet (col 1, starting row 3) ----------
function collectExistingTcIds(ws) {
  const ids = new Set();
  const lastRow = Math.min(ws.actualRowCount || ws.rowCount, ws.rowCount);
  for (let r = 3; r <= lastRow; r++) {
    const v = ws.getRow(r).getCell(1).value;
    if (typeof v === 'string') {
      const t = v.trim();
      if (/^(TC[_-]|BYR_|CP_|SM_|ADM_)/i.test(t)) ids.add(t);
    } else if (v && typeof v === 'object' && v.richText) {
      const t = v.richText.map(r => r.text).join('').trim();
      if (/^(TC[_-]|BYR_|CP_|SM_|ADM_)/i.test(t)) ids.add(t);
    }
  }
  return ids;
}

// ---------- 5. Append rows into a portal sheet ----------
function appendIntoPortalSheet(ws, parsedRows, headers, moduleLabel) {
  const H_TCID  = getHeader(headers, 'TC_ID', 'TCID', 'TC ID');
  const H_REQ   = getHeader(headers, 'Req ID', 'ReqID', 'BRD Req ID');
  const H_TYPE  = getHeader(headers, 'Type');
  const H_SCEN  = getHeader(headers, 'Scenario', 'Title', 'Test Scenario');
  const H_PRE   = getHeader(headers, 'Preconditions', 'Pre-conditions', 'Precondition');
  const H_STEPS = getHeader(headers, 'Steps', 'Test Steps');
  const H_EXP   = getHeader(headers, 'Expected Result', 'Expected');
  const H_VIS   = getHeader(headers, 'Visual Evidence');
  const H_PRIO  = getHeader(headers, 'Priority');
  const H_STAT  = getHeader(headers, 'Status');

  const existingIds = collectExistingTcIds(ws);
  let appended = 0;
  let skipped = 0;
  let nextRow = ws.rowCount + 1;

  for (const r of parsedRows) {
    const tcId = (r[H_TCID] || '').trim();
    if (!tcId) continue;
    if (existingIds.has(tcId)) { skipped++; continue; }

    const row = ws.getRow(nextRow);
    // Columns: TC ID | Feature Area | Type | Test Scenario | Pre-conditions
    //          Test Steps | Expected Result | Actual Result | Status
    //          Priority | Automation Status | Last Run Status
    //          Execution Details | Actual Result (Run) | Screenshot Link
    row.getCell(1).value  = tcId;
    row.getCell(2).value  = moduleLabel;
    row.getCell(3).value  = cleanCellText(r[H_TYPE]);
    row.getCell(4).value  = cleanCellText(r[H_SCEN]);
    row.getCell(5).value  = cleanCellText(r[H_PRE]);
    row.getCell(6).value  = cleanCellText(r[H_STEPS]);
    row.getCell(7).value  = cleanCellText(r[H_EXP]);
    row.getCell(8).value  = '';                                      // Actual Result
    row.getCell(9).value  = 'Not Run';                               // Status (execution)
    row.getCell(10).value = cleanCellText(r[H_PRIO]);
    row.getCell(11).value = isAutomatable(r[H_STAT], r[H_VIS]) === 'Yes' ? 'Automated' : 'Manual';
    row.getCell(12).value = '';                                      // Last Run Status
    row.getCell(13).value = `BRD Req: ${cleanCellText(r[H_REQ])}`;   // Execution Details
    row.getCell(14).value = '';                                      // Actual Result (Run)
    row.getCell(15).value = cleanCellText(r[H_VIS]);                 // Screenshot Link

    row.commit();
    existingIds.add(tcId);
    appended++;
    nextRow++;
  }
  return { appended, skipped };
}

// ---------- 6. Append rows into Consolidated sheet ----------
function appendIntoConsolidated(ws, parsedRows, headers, portal, moduleLabel) {
  const H_TCID  = getHeader(headers, 'TC_ID', 'TCID', 'TC ID');
  const H_REQ   = getHeader(headers, 'Req ID', 'ReqID', 'BRD Req ID');
  const H_TYPE  = getHeader(headers, 'Type');
  const H_SCEN  = getHeader(headers, 'Scenario', 'Title', 'Test Scenario');
  const H_PRE   = getHeader(headers, 'Preconditions', 'Pre-conditions', 'Precondition');
  const H_STEPS = getHeader(headers, 'Steps', 'Test Steps');
  const H_EXP   = getHeader(headers, 'Expected Result', 'Expected');
  const H_VIS   = getHeader(headers, 'Visual Evidence');
  const H_PRIO  = getHeader(headers, 'Priority');
  const H_STAT  = getHeader(headers, 'Status');

  // Build set of existing TC IDs (col 1, starting row 2 since headers are row 1)
  const existingIds = new Set();
  const lastRow = Math.min(ws.actualRowCount || ws.rowCount, ws.rowCount);
  for (let rIdx = 2; rIdx <= lastRow; rIdx++) {
    const v = ws.getRow(rIdx).getCell(1).value;
    if (typeof v === 'string' && /^TC[_-]/i.test(v.trim())) {
      existingIds.add(v.trim());
    } else if (v && typeof v === 'object' && v.richText) {
      const t = v.richText.map(r => r.text).join('').trim();
      if (/^TC[_-]/i.test(t)) existingIds.add(t);
    }
  }

  let appended = 0;
  let skipped = 0;
  let nextRow = ws.rowCount + 1;
  const portalLabel = PORTAL_LABEL[portal] || portal;

  for (const r of parsedRows) {
    const tcId = (r[H_TCID] || '').trim();
    if (!tcId) continue;
    if (existingIds.has(tcId)) { skipped++; continue; }

    // Columns: TC ID | Portal | Module | Type | Title | Priority | Pre-conditions
    //          Steps | Expected Result | Automatable | BRD Ref | FRD Ref | Status
    //          Actual Result | Bug ID | Notes
    const row = ws.getRow(nextRow);
    row.getCell(1).value  = tcId;
    row.getCell(2).value  = portalLabel;
    row.getCell(3).value  = moduleLabel;
    row.getCell(4).value  = cleanCellText(r[H_TYPE]);
    row.getCell(5).value  = cleanCellText(r[H_SCEN]);
    row.getCell(6).value  = cleanCellText(r[H_PRIO]);
    row.getCell(7).value  = cleanCellText(r[H_PRE]);
    row.getCell(8).value  = cleanCellText(r[H_STEPS]);
    row.getCell(9).value  = cleanCellText(r[H_EXP]);
    row.getCell(10).value = isAutomatable(r[H_STAT], r[H_VIS]);
    row.getCell(11).value = cleanCellText(r[H_REQ]);
    row.getCell(12).value = '';                                      // FRD Ref
    row.getCell(13).value = 'Not Run';                               // Status
    row.getCell(14).value = '';                                      // Actual Result
    row.getCell(15).value = '';                                      // Bug ID
    row.getCell(16).value = cleanCellText(r[H_VIS]);                 // Notes (visual evidence)

    row.commit();
    existingIds.add(tcId);
    appended++;
    nextRow++;
  }
  return { appended, skipped };
}

// ---------- 7. Main orchestrator ----------
(async () => {
  // Pre-flight: check files are not locked
  for (const portalFile of [...Object.values(PORTAL_TO_FILE), CONSOLIDATED]) {
    const full = path.resolve(portalFile);
    const dir = path.dirname(full);
    const base = path.basename(full);
    const lockFile = path.join(dir, '~$' + base);
    if (fs.existsSync(lockFile)) {
      console.error(`LOCK DETECTED: ${lockFile} — close Excel before running.`);
      process.exit(2);
    }
  }

  // Group sources by portal
  const byPortal = { Buyer: [], CP: [], SM: [] };
  for (const s of SOURCES) byPortal[s.portal].push(s);

  const summary = { Buyer: {}, CP: {}, SM: {}, Consolidated: {} };
  const failures = [];

  // ---- Per-portal xlsx ----
  for (const portal of Object.keys(byPortal)) {
    const filePath = path.resolve(PORTAL_TO_FILE[portal]);
    console.log(`\n=== ${portal} → ${PORTAL_TO_FILE[portal]} ===`);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);

    for (const src of byPortal[portal]) {
      const mdPath = path.resolve(src.md);
      if (!fs.existsSync(mdPath)) {
        failures.push(`MISSING MD: ${src.md}`);
        console.log(`  [SKIP] ${src.module}: source .md missing`);
        continue;
      }
      const ws = wb.getWorksheet(src.sheet);
      if (!ws) {
        failures.push(`MISSING SHEET in ${portal}: "${src.sheet}"`);
        console.log(`  [SKIP] ${src.module}: sheet "${src.sheet}" not found`);
        continue;
      }
      const { headers, rows } = parseMd(mdPath);
      if (!rows.length) {
        failures.push(`NO TC ROWS PARSED: ${src.md}`);
        console.log(`  [WARN] ${src.module}: 0 rows parsed from md`);
        continue;
      }
      const { appended, skipped } = appendIntoPortalSheet(ws, rows, headers, src.module);
      summary[portal][src.module] = { parsed: rows.length, appended, skipped };
      console.log(`  ${src.module}: parsed=${rows.length}, appended=${appended}, skipped(dup)=${skipped}`);
    }
    await wb.xlsx.writeFile(filePath);
    console.log(`  SAVED: ${PORTAL_TO_FILE[portal]}`);
  }

  // ---- Consolidated xlsx ----
  console.log(`\n=== Consolidated → ${CONSOLIDATED} ===`);
  const consPath = path.resolve(CONSOLIDATED);
  const wbC = new ExcelJS.Workbook();
  await wbC.xlsx.readFile(consPath);
  const wsC = wbC.getWorksheet('All Test Cases');
  if (!wsC) {
    failures.push(`Consolidated sheet "All Test Cases" not found`);
  } else {
    for (const src of SOURCES) {
      const mdPath = path.resolve(src.md);
      if (!fs.existsSync(mdPath)) continue;
      const { headers, rows } = parseMd(mdPath);
      if (!rows.length) continue;
      const { appended, skipped } = appendIntoConsolidated(wsC, rows, headers, src.portal, src.module);
      summary.Consolidated[`${src.portal}/${src.module}`] = { parsed: rows.length, appended, skipped };
      console.log(`  ${src.portal}/${src.module}: parsed=${rows.length}, appended=${appended}, skipped(dup)=${skipped}`);
    }
    await wbC.xlsx.writeFile(consPath);
    console.log(`  SAVED: ${CONSOLIDATED}`);
  }

  // ---- Final report ----
  console.log('\n\n========== FINAL SUMMARY ==========');
  for (const portal of ['Buyer', 'CP', 'SM']) {
    let totalAppended = 0, totalSkipped = 0;
    console.log(`\n${portal}:`);
    for (const [mod, s] of Object.entries(summary[portal])) {
      console.log(`  ${mod.padEnd(28)} parsed=${s.parsed}  appended=${s.appended}  skipped=${s.skipped}`);
      totalAppended += s.appended;
      totalSkipped += s.skipped;
    }
    console.log(`  TOTAL: appended=${totalAppended}, skipped=${totalSkipped}`);
  }
  let cAppended = 0, cSkipped = 0;
  for (const v of Object.values(summary.Consolidated)) { cAppended += v.appended; cSkipped += v.skipped; }
  console.log(`\nConsolidated TOTAL: appended=${cAppended}, skipped=${cSkipped}`);

  if (failures.length) {
    console.log('\nFAILURES / WARNINGS:');
    failures.forEach(f => console.log(`  - ${f}`));
  } else {
    console.log('\nNo failures.');
  }
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
