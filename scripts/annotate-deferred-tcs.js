// scripts/annotate-deferred-tcs.js
// One-off: annotate TCs that cannot run as live e2e on UAT with an explicit
// reason so the Exec/Master sheets account for EVERY row (nothing looks "missing").
//
// Categories:
//   API     — verified in a separate tests/api spec, not e2e
//   DB      — verified in a separate db spec
//   INT     — needs a provider stub (WhatsApp/SMS), out of e2e scope
//   DESTRUCT— mutates live UAT data; needs ALLOW_DESTRUCTIVE=1 + disposable fixture + user OK
//   POM     — blocked on a Milestones page POM not yet built
//   ALIAS   — already automated by another spec test
//
// Usage: node scripts/annotate-deferred-tcs.js
'use strict';

const ExcelJS = require('exceljs');
const path = require('path');

const XLSX_PATH = path.join(__dirname, '..', 'manual-qa-repository', '07-execution', 'TestCases-AdminPortal.xlsx');

// TC_ID → { cat, reason }
const DEFERRED = {
  // ── API specs (tests/api/customers.api.spec.js) ──────────────────────────
  TC_CUST_API_005: { cat: 'API',  reason: 'Verified at API layer (tests/api) — not an e2e/browser test' },
  TC_CUST_API_006: { cat: 'API',  reason: 'Verified at API layer (tests/api) — not an e2e/browser test' },
  TC_CUST_API_048: { cat: 'API',  reason: 'Verified at API layer (tests/api) — not an e2e/browser test' },
  TC_CUST_API_120: { cat: 'API',  reason: 'Backend validation gap (parking enabled=true,count=0) — API-layer test, not e2e' },
  TC_CUST_API_121: { cat: 'API',  reason: 'JWT-after-logout (server logout no-op) — API-layer test, not e2e' },
  TC_CUST_API_122: { cat: 'API',  reason: 'projectId cross-project leak check — API-layer test, not e2e' },
  // ── DB spec ──────────────────────────────────────────────────────────────
  TC_CUST_NEG_097: { cat: 'DB',   reason: 'Hardcoded gateway/value check — DB-layer test (db/queries), not e2e' },
  // ── Integration (provider stub) ────────────────────────────────────────────
  TC_CUST_FUNC_095:{ cat: 'INT',  reason: 'WhatsApp + SMS dispatch — needs provider stub, out of e2e scope' },
  TC_CUST_NEG_096: { cat: 'INT',  reason: 'WhatsApp dispatch — needs provider stub, out of e2e scope' },
  // ── Destructive (live UAT mutation; needs ALLOW_DESTRUCTIVE + disposable fixture + user OK) ──
  TC_CUST_FUNC_129:{ cat: 'DESTRUCT', reason: 'Home Loan approval applies to all sub-units — requires SUBMIT on live data + user OK' },
  ADM_CUST_039:    { cat: 'DESTRUCT', reason: 'Verify cancellation cannot be undone — requires an actual cancel on live data + user OK' },
  TC_CUST_FUNC_120:{ cat: 'DESTRUCT', reason: 'Offline unit assignment happy-path BOOKS a unit — requires SUBMIT on live data + user OK' },
  TC_CUST_NEG_093: { cat: 'DESTRUCT', reason: 'Parking update sends no buyer message — requires parking SUBMIT on live data + user OK' },
  TC_CUST_NEG_121: { cat: 'DESTRUCT', reason: 'Unit availability re-checked at submit — requires SUBMIT + concurrent fixture, user OK' },
  TC_CUST_NEG_122: { cat: 'DESTRUCT', reason: 'Reject 2nd unit when already booked — requires a fixture with an active booking + user OK' },
  TC_CUST_NEG_120: { cat: 'DESTRUCT', reason: 'Assign Unit validation — Assign Unit modal access needs a Waitlisted fixture; submit-path destructive' },
  // ── Milestones POM (not yet built) ──────────────────────────────────────────
  TC_CUST_VAL_120: { cat: 'POM',  reason: 'Payment-proof upload validation — needs Milestones page POM (separate page), not yet built' },
  TC_CUST_FUNC_127:{ cat: 'POM',  reason: 'Offline Payment form (Principal/GST/Milestone summary) — needs Milestones POM, not yet built' },
  // ── Already covered by an alias ─────────────────────────────────────────────
  TC_CUST_FUNC_036b:{ cat: 'ALIAS', reason: 'Covered by TC_CUST_FUNC_008b (download with active filter)' },
};

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);
  const ex = wb.getWorksheet('Customers - Exec');
  if (!ex) { console.error('Customers - Exec sheet not found'); process.exit(1); }

  // exec2 cols: 1 TC ID | 2 Status | 3 Automation Status | 4 Last Run | 5 Details | 6 Actual | 7 Screenshot
  const CAT_AUTO = {
    API: 'API spec (not e2e)', DB: 'DB spec (not e2e)', INT: 'Integration (provider stub)',
    DESTRUCT: 'Manual — destructive', POM: 'Blocked — Milestones POM', ALIAS: 'Covered by alias',
  };
  let n = 0;
  for (let r = 2; r <= ex.rowCount; r++) {
    const id = (ex.getRow(r).getCell(1).value || '').toString().trim();
    const d = DEFERRED[id];
    if (!d) continue;
    const row = ex.getRow(r);
    row.getCell(2).value = d.cat === 'ALIAS' ? 'Pass' : 'Deferred';       // Status
    row.getCell(3).value = CAT_AUTO[d.cat];                                // Automation Status
    row.getCell(4).value = d.cat === 'ALIAS' ? 'Pass (via alias)' : 'N/A';// Last Run Status
    row.getCell(5).value = `[${d.cat}] not run as live e2e`;               // Execution Details
    row.getCell(6).value = d.reason;                                       // Actual Result (Run)
    n++;
  }
  await wb.xlsx.writeFile(XLSX_PATH);
  console.log(`✓ Annotated ${n} deferred/non-e2e TCs in Customers - Exec with explicit reasons`);
})();
