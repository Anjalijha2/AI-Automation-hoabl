---
name: generate-report
description: Use when a test run finishes and an execution report needs to be built and/or emailed. Covers HTML+XLSX generation, catalogue workbook merge, and SMTP dispatch.
---

# Skill: generate-report

**Called by**: QA Agent  
**Inputs**: `reports/results.json`, TC catalogue markdown (`manual-qa-repository/01-test-cases/**/TC_*.md`), prior sprint XLSX (for history)  
**Outputs**:
- `manual-qa-repository/06-test-runs/<env>/sprint-<N>/execution-report.html`
- `manual-qa-repository/06-test-runs/<env>/sprint-<N>/execution-report.xlsx`
- Updated `manual-qa-repository/07-execution/TestCases-*Portal.xlsx` (columns K–O)
- Email with HTML + XLSX attachments (optional)

---

## Step 1 — Generate report

```bash
node scripts/generate-execution-report.js [--sprint <N>] [--env UAT]
# defaults: --sprint 5  --env UAT
```

**What it does:**
1. Scans `tests/**/*.spec.js` → collects all TC_IDs referenced → marks Automated / Not Automated
2. Parses `manual-qa-repository/01-test-cases/**/TC_*.md` → TC catalogue rows
3. Indexes `reports/results.json` → PASS / FAIL / SKIP per TC_ID
4. Loads prior XLSX for execution history (prepend new entry, preserve prior)
5. Writes `execution-report.html` (inline-styled, mail-safe)
6. Writes `execution-report.xlsx` (Execution Report sheet + Summary sheet)
7. Merges results into `manual-qa-repository/07-execution/TestCases-*Portal.xlsx` (cols K–O)

**Column map written to catalogue workbooks:**

| Col | Field | Notes |
|-----|-------|-------|
| K | Automation Status | Automated / Not Automated — always refreshed |
| L | Last Run Status | PASS / FAIL / SKIP — colour-coded |
| M | Execution Details | Prepend `YYYY-MM-DD HH:MM · STATUS`, keep history |
| N | Actual Result (Run) | First error line or "As expected" |
| O | Screenshot Link | Relative hyperlink, FAIL only |

---

## Step 2 — Send report email (optional)

Requires `.env` with SMTP creds.

```bash
node scripts/send-execution-report.js [--sprint <N>] [--env UAT]
```

**.env keys:**

```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=<sender>
SMTP_PASS=<password>
SMTP_FROM=<sender>
SMTP_SECURE=          # leave blank for STARTTLS on 587
SMTP_IGNORE_TLS=      # true only for local maildev/mailpit :1025
REPORT_TO=            # comma-separated recipients; default: anjali.jha@openspaceservices.com
```

Mail carries HTML body (summary table inlined) + two attachments:
- `execution-report-sprint-<N>.html`
- `execution-report-sprint-<N>.xlsx`

---

## npm shortcuts (if wired in package.json)

```bash
npm run report:exec   # generate HTML + XLSX + catalogue merge
npm run report:send   # send email
```

---

## If `results.json` missing

Script proceeds — TCs without results get `Last Run Status = —`. Automation Status column still refreshed from spec corpus. Report generated with partial data; log a warning.

---

## DASHBOARD.md Update

After report generation, update `manual-qa-repository/DASHBOARD.md`:
- Last run date
- Pass rate per portal (from Summary sheet counts)
- Open bug count (from `manual-qa-repository/04-bug-reports/BUG_TRACKER.md`)
- Sprint status

---

## Constraints

- Never delete prior execution reports — new run overwrites same sprint file (history preserved in Execution Details column)
- Screenshots linked by relative path from `OUT_DIR` (`06-test-runs/<env>/sprint-<N>/`)
- Deprecated TCs in `01-test-cases/archived/` excluded from catalogue scan
- TC_IDs found in `results.json` but absent from catalogue appended as orphan rows with note `(not in TC catalogue — from spec)`
