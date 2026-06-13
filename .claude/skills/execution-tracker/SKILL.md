---
name: execution-tracker
description: Owns post-run xlsx + TestCases.md updates. Parses playwright run logs and populates Status / Last Run / Execution Details / Actual Result (Run) / Screenshot Link / Automation Status columns in the portal xlsx. Also applies gray fill to newly-generated post-capture TCs so the user can verify them in Excel.
---

# Skill: execution-tracker

**Called by**: QA Agent only — after every goal run in Gate D, and after every BA Agent post-capture TC generation.
**Inputs**: portal name, sheet name, playwright run log path, test-results directory path
**Outputs**: updated `manual-qa-repository/07-execution/TestCases-<Portal>Portal.xlsx`, updated `manual-qa-repository/01-test-cases/<portal>/<module>/TestCases.md`, gray-fill applied to new TC rows when applicable

---

## Trigger Conditions

- QA Agent finishes a goal-based run (Gate D step 2)
- BA Agent generates new TCs after a Tech Lead INDEX.md supplement (`_new-tcs-since-last-review.txt` has entries)
- User runs `npm run sync` and execution columns need refresh

---

## Execution Steps

### Step 1 — Verify xlsx file is not locked
1. Attempt to open `manual-qa-repository/07-execution/TestCases-<Portal>Portal.xlsx`
2. If `EBUSY` error → STOP. Ask user to close Excel for that file, then resume.

### Step 2 — Parse playwright run log
Use `scripts/xlsx-write-results.js` with:
- `<portal>` = `Admin` / `SM` / `CP` / `Buyer`
- `<sheetName>` = exact sheet name (e.g., `Login`, `Customers`, `Physical Allocation`)
- `<logPath>` = `test-results-<portal>-<module>.log` from the Gate D run
- `<testResultsDir>` = `test-results` (default)

The script parses `✓ / ✘ / -` symbols from the list-reporter output, extracts TC_IDs, maps to xlsx rows via direct match OR `SPEC_TO_XLSX_ALIAS` mapping, and updates these columns:

| Col | Name | Value Source |
|-----|------|--------------|
| 9 | Status | Pass / Fail / Skip |
| 11 | Automation Status | "Automated" (flipped from "Not Automated") |
| 12 | Last Run Status | Pass / Fail (retry) / Skip |
| 13 | Execution Details | `YYYY-MM-DD HH:MM IST — passed in Ns` or `failed in Nm` |
| 14 | Actual Result (Run) | "Matches expected" or "See screenshot + error context" |
| 15 | Screenshot Link | `test-results/<dir>/test-failed-1.png` (failures only) |

### Step 3 — Mirror to TestCases.md
For each TC updated, find the corresponding row in `manual-qa-repository/01-test-cases/<portal>/<module>/TestCases.md` and append/update Status column. If TestCases.md uses a different markdown table format, append a `## Execution Log — <date>` section at the bottom with the run summary.

### Step 4 — Apply gray fill to post-capture TCs (if file has entries)
If `manual-qa-repository/07-execution/_new-tcs-since-last-review.txt` is non-empty:
- Run `node scripts/xlsx-mark-new-tcs.js <portal> <sheet>` (auto-reads from the file)
- Script applies fill `FFA6A6A6` (White Background 1, Darker 35%) to columns 1-15 of each listed TC row
- After successful mark, the file is cleared (consumed)

### Step 5 — Report to QA Agent
- Updated row count
- Unmatched spec TC_IDs (indicates TC_ID alignment needed — extend `SPEC_TO_XLSX_ALIAS` in script OR rename spec test() titles)
- TCs marked gray (count + IDs)

---

## TC_ID Alignment Fallback

When spec uses `TC_CUST_FUNC_001` but xlsx uses `ADM_CUST_001` for the same scenario:

1. Add to `SPEC_TO_XLSX_ALIAS` constant at top of `scripts/xlsx-write-results.js`:
   ```js
   const SPEC_TO_XLSX_ALIAS = {
     TC_CUST_FUNC_001: 'ADM_CUST_001',
     TC_CUST_FUNC_002: 'ADM_CUST_002',
   };
   ```
2. Long-term fix: rename spec test() titles to use xlsx convention. Done in a dedicated cleanup pass after baseline is established.

---

## Constraints

1. NEVER overwrite Expected Result / Test Steps / Test Scenario / Pre-conditions columns — those are BA Agent owned
2. ONLY modify columns 9, 11, 12, 13, 14, 15 (status + run details)
3. NEVER skip the user-verification gray-fill step when `_new-tcs-since-last-review.txt` has entries
4. If xlsx is locked, STOP — ask user to close Excel
5. ALWAYS commit the updated xlsx + TestCases.md as part of the goal commit (`feat(<portal>-<module>): goal <N> — <feature> green`)
