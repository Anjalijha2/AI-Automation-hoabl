# Test Runs — Execution Reports

Per-sprint execution artefacts live under:
`manual-qa-repository/06-test-runs/<ENV>/sprint-<N>/`

Each sprint folder holds:

| File | Source | Purpose |
|------|--------|---------|
| `RUN_SUMMARY.md` | hand-curated | Narrative summary of the sprint run |
| `execution-report.html` | `scripts/generate-execution-report.js` | Mailable self-contained HTML report |
| `execution-report.xlsx` | same | Excel mirror — history-preserving, archival |

## Columns in the Enhanced Execution Report

| Column | Source |
|--------|--------|
| TC_ID | TC markdown heading (`### <TC_ID> — <title>`) |
| Portal | folder path under `01-test-cases/` |
| Module | folder path under `01-test-cases/<portal>/` |
| Title | text after the dash on the TC heading |
| Type | `\| **Type** \|` row of the TC table |
| Priority | `\| **Priority** \|` row of the TC table |
| **Automation Status** | `Automated` if any `tests/**/*.spec.js` contains `test('<TC_ID> — …')`; else `Not Automated` |
| **Last Run Status** | latest `results.json` outcome → `PASS / FAIL / SKIP / —` |
| **Execution Details** | append-only history; newest entry on top: `YYYY-MM-DD HH:MM · STATUS` |
| **Actual Result** | `As expected` on pass; first line of `errors[0].message` on fail; `Skipped` on skip |
| **Screenshot Link** | relative path → `test-failed-1.png` (FAIL only). XLSX renders as hyperlink |

## How to Run

```bash
# 1. Execute tests (any combination — uses Playwright JSON reporter → reports/results.json)
npm run test:e2e:admin
# … or any other test:* command

# 2. Generate the enhanced report (HTML + XLSX)
npm run report:exec                    # default --sprint 5 --env UAT
node scripts/generate-execution-report.js --sprint 6 --env UAT

# 3. Generate + email in one step
npm run report:email
```

## History Preservation

`generate-execution-report.js` reads the previous `execution-report.xlsx` (if present at the
same path) and **prepends** today's `YYYY-MM-DD HH:MM · STATUS` line to the Execution Details
column. The full history is never truncated. To start fresh, delete the XLSX before running.

## Email Delivery

`scripts/send-execution-report.js` reads SMTP credentials from `.env`. See `.env.example`
for the full key list. Defaults to Outlook 365 (`smtp.office365.com:587`, STARTTLS).
Recipient defaults to `anjali.jha@openspaceservices.com`; override with `REPORT_TO=...`.

### Local dry-run (no real SMTP needed)

Use [mailpit](https://github.com/axllent/mailpit) or [maildev](https://github.com/maildev/maildev):

```bash
# in another shell
docker run -p 1025:1025 -p 8025:8025 axllent/mailpit

# fire the mail
SMTP_HOST=localhost SMTP_PORT=1025 SMTP_IGNORE_TLS=true \
  npm run report:email

# open http://localhost:8025 to view the message + attachments
```

### Real Outlook send

```bash
# in .env:
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=<your-mailbox>@<tenant>.onmicrosoft.com
SMTP_PASS=<app-password>
SMTP_FROM=<your-mailbox>@<tenant>.onmicrosoft.com

npm run report:email
```

If your tenant has SMTP AUTH disabled (Microsoft default since 2022) you must either
(a) enable it for the service mailbox, or (b) use Microsoft Graph API instead.

## Constraints

- `.env` is gitignored — never commit SMTP credentials. Use `.env.example` for keys only.
- `scripts/generate-excel.js` (the **TC catalogue** generator) is unrelated — leave it untouched.
- `scripts/generate-report.js` (legacy `generate-report` skill) coexists alongside this report.
