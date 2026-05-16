---
name: generate-report
description: Parse Playwright results.json and produce structured execution summary. Called after any test run.
---

# Skill: generate-report

**Called by**: QA Agent
**Inputs**: `reports/results.json`, portal name, sprint number
**Outputs**: `manual-qa-repository/06-test-runs/<env>/sprint-<N>/execution-summary.md`, updated `DASHBOARD.md`

---

## Command

```bash
npm run generate:report
# or:
node automation-repository/utils/generate-report.js
```

---

## Report Sections

### 1. Run Metadata
```
Portal: <portal>
Sprint: <N>
Run Date: <YYYY-MM-DD>
Environment: UAT
Executor: QA Agent
```

### 2. Summary Table

| Metric | Count |
|--------|-------|
| Total TCs | N |
| Passed | N |
| Failed | N |
| Skipped | N |
| Pass Rate | N% |

### 3. Per-Test Results

| TC_ID | Title | Status | Duration | Failure Reason |
|-------|-------|--------|----------|---------------|
| TC_XXX_001 | ... | ✅ PASS | 1.2s | — |
| TC_XXX_002 | ... | ❌ FAIL | 3.1s | Selector timeout |

### 4. Failures Detail

For each failure:
```
TC_ID: TC_XXX_002
Step: <step name>
Error: <exact error message>
Screenshot: test-results/<screenshot>.png
Root Cause: <selector stale / assertion drift / env issue>
Action: <log bug / self-heal / investigate>
```

### 5. Coverage Map

List which BRD/FRD requirements were covered vs. not covered this run.

---

## DASHBOARD.md Update

After generating report, update `manual-qa-repository/DASHBOARD.md`:
- Last run date
- Pass rate per portal
- Open bug count (from BUG_TRACKER.md)
- Sprint status

---

## Constraints

- Report path: `manual-qa-repository/06-test-runs/<env>/sprint-<N>/execution-summary.md`
- Screenshots linked by relative path from repo root
- Never delete previous run reports — append sprint number
- If results.json missing or empty, report "No results found — run was not executed"
