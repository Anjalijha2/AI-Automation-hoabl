// scripts/cleanup-xlsx-stale-tcs.js
// Removes stale/wrong-arch/duplicate TCs from portal xlsx files.
// Rules documented in manual-qa-repository/07-execution/xlsx-cleanup-flags.md

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const EXEC_DIR = path.join(ROOT, 'manual-qa-repository', '07-execution');

// ─── KEEP SETS ────────────────────────────────────────────────────────────────

// SM Callback Requests: explicit TC_IDs to keep from old SM_CB_* generation
const SM_CB_KEEP = new Set([
  'SM_CB_009','SM_CB_010','SM_CB_011','SM_CB_012','SM_CB_013','SM_CB_014',
  'SM_CB_015','SM_CB_016','SM_CB_017','SM_CB_018','SM_CB_019','SM_CB_020', // KPI Dashboard
  'SM_CB_028',         // INT: table↔API reconciliation
  'SM_CB_072',         // DB: SM assignment audit trail record
  'SM_CB_109',         // INT: buyer feedback token delivery
  'SM_CB_125','SM_CB_126','SM_CB_127','SM_CB_128',
  'SM_CB_129','SM_CB_130','SM_CB_131','SM_CB_132', // Role Differences
  'SM_CB_133',         // API: 403 role enforcement at API layer
  'SM_CB_134',         // DB: SM assignment record structure
  'SM_CB_FSD_135','SM_CB_FSD_136','SM_CB_FSD_137',
  'SM_CB_FSD_138','SM_CB_FSD_139','SM_CB_FSD_140', // FSD-verified + Kaleyra
]);

// Buyer Unit Details: explicit TC_IDs to keep from old BYR_UNIT_* generation
const BYR_UNIT_KEEP = new Set([
  'BYR_UNIT_026', // NEG: 400 wrong registration number
  'BYR_UNIT_027', // API: 400 missing query params (keep; 056 is duplicate)
  'BYR_UNIT_028', // NEG/API: 500 expired auth token
  'BYR_UNIT_029', // API: 404 route not found at API level
  'BYR_UNIT_030', // INT: Azure Blob SAS URL validation
  'BYR_UNIT_031', // API: SQL CASE WHEN ordering
  'BYR_UNIT_032', // DB: || concatenation format
  'BYR_UNIT_033', // DB: ENUM values hcfTransactionStatus
  'BYR_UNIT_034', // EDGE: duplicate payment order
  'BYR_UNIT_035', // DB: PAID filter in backend query
  'BYR_UNIT_046', // EDGE: broken Blob URL graceful degradation
  'BYR_UNIT_053', // EDGE: empty milestones array
  'BYR_UNIT_054', // NEG: 401 mid-session token expiry
  'BYR_UNIT_055', // API: 400 "Could not fetch unit data"
  'BYR_UNIT_059', // EDGE: disabled download button state
  // BYR_UNIT_056 EXCLUDED — exact duplicate of BYR_UNIT_027
]);

// ─── REMOVE PREDICATES ────────────────────────────────────────────────────────

function shouldRemoveSMCallback(tcId) {
  if (!tcId) return false;
  // Remove ALL TC_SMCB_* (63 intermediate gen)
  if (tcId.startsWith('TC_SMCB_')) return true;
  // Keep TC_CBR_* (v2 correct)
  if (tcId.startsWith('TC_CBR_')) return false;
  // For SM_CB_*: keep only those in SM_CB_KEEP
  if (tcId.startsWith('SM_CB_')) return !SM_CB_KEEP.has(tcId);
  // Separator rows, header duplicates, blank rows
  return false;
}

function shouldRemoveBuyerUnitDetails(tcId) {
  if (!tcId) return false;
  // Remove ALL TC_UNIT_* (18 empty-content intermediate gen)
  if (tcId.startsWith('TC_UNIT_')) return true;
  // Keep TC_BUYUD_* (v3 correct)
  if (tcId.startsWith('TC_BUYUD_')) return false;
  // For BYR_UNIT_*: keep only those in BYR_UNIT_KEEP
  if (tcId.startsWith('BYR_UNIT_')) return !BYR_UNIT_KEEP.has(tcId);
  return false;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function isSeparatorOrHeader(row) {
  const cell1 = String(row.getCell(1).value || '');
  return (
    cell1 === 'TC ID' ||
    cell1.startsWith('━') ||
    cell1.startsWith('Correction') ||
    cell1 === 'New' ||
    cell1.trim() === ''
  );
}

function cleanSheet(ws, removeFn, stats) {
  const rowsToDelete = [];
  ws.eachRow((row, i) => {
    if (i === 1) return; // keep header
    if (isSeparatorOrHeader(row)) {
      rowsToDelete.push(i);
      return;
    }
    const tcId = String(row.getCell(1).value || '').trim();
    if (removeFn(tcId)) {
      rowsToDelete.push(i);
      stats.removed++;
    } else {
      stats.kept++;
    }
  });
  // Delete in reverse order to preserve indices
  for (let i = rowsToDelete.length - 1; i >= 0; i--) {
    ws.spliceRows(rowsToDelete[i], 1);
  }
}

// ─── PROCESS PORTAL XLSX ──────────────────────────────────────────────────────

async function processPortal(filename, sheetOps) {
  const filepath = path.join(EXEC_DIR, filename);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filepath);
  const results = {};

  for (const { sheetName, removeFn, removeSheet } of sheetOps) {
    const ws = wb.getWorksheet(sheetName);
    if (!ws) {
      console.log(`  [SKIP] Sheet not found: ${sheetName}`);
      continue;
    }
    if (removeSheet) {
      wb.removeWorksheet(ws.id);
      console.log(`  [REMOVED SHEET] ${sheetName}`);
      results[sheetName] = { action: 'sheet_removed' };
      continue;
    }
    const stats = { kept: 0, removed: 0 };
    const before = ws.rowCount - 1;
    cleanSheet(ws, removeFn, stats);
    const after = ws.rowCount - 1;
    results[sheetName] = { before, after, removed: stats.removed, kept: stats.kept };
    console.log(`  [${sheetName}] ${before} → ${after} rows (removed ${stats.removed})`);
  }

  await wb.xlsx.writeFile(filepath);
  return results;
}

// ─── BUILD CONSOLIDATED FROM SCRATCH ──────────────────────────────────────────

async function rebuildConsolidated() {
  const conFile = path.join(EXEC_DIR, 'TestCases-Consolidated.xlsx');
  const conWb = new ExcelJS.Workbook();
  await conWb.xlsx.readFile(conFile);

  const allSheet = conWb.getWorksheet('All Test Cases');
  if (!allSheet) { console.log('  [SKIP] Consolidated "All Test Cases" sheet not found'); return; }

  const before = allSheet.rowCount - 1;
  const stats = { kept: 0, removed: 0 };

  // Combined predicate: remove if either SM_CB or BYR_UNIT removal rule fires,
  // OR if row belongs to deprecated sheets (cp/project-information or buyer/support-tickets)
  // We detect deprecated by checking Portal column or Feature Area column
  const headerRow = allSheet.getRow(1);
  let portalCol = 0, moduleCol = 0, tcCol = 0;
  headerRow.eachCell((cell, c) => {
    const v = String(cell.value||'').toLowerCase();
    if (v.includes('portal')) portalCol = c;
    if (v.includes('module') || v.includes('feature area')) moduleCol = c;
    if (v === 'tc id' || v === 'tc_id') tcCol = c;
  });
  // Fallback: TC_ID is col 1
  if (!tcCol) tcCol = 1;

  const toDelete = [];
  allSheet.eachRow((row, i) => {
    if (i === 1) return;
    if (isSeparatorOrHeader(row)) { toDelete.push(i); return; }
    const tcId = String(row.getCell(tcCol).value || '').trim();
    const module = moduleCol ? String(row.getCell(moduleCol).value || '').toLowerCase() : '';
    const portal = portalCol ? String(row.getCell(portalCol).value || '').toLowerCase() : '';

    // Deprecated modules
    if ((module.includes('project information') && portal.includes('cp')) ||
        (module.includes('support ticket') && portal.includes('buyer'))) {
      toDelete.push(i); stats.removed++; return;
    }
    // SM Callback
    if (shouldRemoveSMCallback(tcId)) { toDelete.push(i); stats.removed++; return; }
    // Buyer Unit Details
    if (shouldRemoveBuyerUnitDetails(tcId)) { toDelete.push(i); stats.removed++; return; }
    stats.kept++;
  });

  for (let i = toDelete.length - 1; i >= 0; i--) {
    allSheet.spliceRows(toDelete[i], 1);
  }
  const after = allSheet.rowCount - 1;
  console.log(`  [All Test Cases] ${before} → ${after} rows (removed ${stats.removed})`);
  await conWb.xlsx.writeFile(conFile);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log('\n=== XLSX Cleanup — Stale TC Removal ===\n');

  console.log('Processing TestCases-SMPortal.xlsx...');
  await processPortal('TestCases-SMPortal.xlsx', [
    { sheetName: 'Callback Requests', removeFn: shouldRemoveSMCallback },
  ]);

  console.log('\nProcessing TestCases-BuyerPortal.xlsx...');
  await processPortal('TestCases-BuyerPortal.xlsx', [
    { sheetName: 'Unit Details',    removeFn: shouldRemoveBuyerUnitDetails },
    { sheetName: 'Support Tickets', removeSheet: true },
  ]);

  console.log('\nProcessing TestCases-CPPortal.xlsx...');
  await processPortal('TestCases-CPPortal.xlsx', [
    { sheetName: 'Project Information', removeSheet: true },
  ]);

  console.log('\nRebuilding TestCases-Consolidated.xlsx...');
  await rebuildConsolidated();

  console.log('\n=== Done ===');
})().catch(e => { console.error(e); process.exit(1); });
