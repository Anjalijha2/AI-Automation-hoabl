---
name: defect-report
description: Generate a structured defect report from Playwright test failures. Reads reports/results.json and test-results/ screenshots to summarize failures as actionable bug reports ready for Jira/Linear/Notion.
---

# Defect Report — XR Portal

Generate structured bug reports from Playwright test failures.

## Input Sources

Read in order:
1. `reports/results.json` — test results with errors and durations
2. `reports/html-report/` — HTML report metadata
3. `test-results/` — screenshots and traces for failed tests

## Steps

1. Read `reports/results.json`
2. Filter `status: "failed"` or `status: "timedOut"` entries
3. For each failure: extract test name, error message, file, line
4. Check `test-results/` for matching screenshot
5. Generate defect report entries

## Defect Entry Format

```markdown
### BUG-[N]: [Test ID] — [Short Description]

**Severity**: [Critical / High / Medium / Low]
**Module**: [derived from spec file name]
**Environment**: UAT (https://uat-web.xrportal.in/admin)
**Test File**: tests/ui/[spec].spec.js:[line]

**Steps to Reproduce**
1. [Derived from test steps]
2. ...

**Expected Result**
[From test assertion]

**Actual Result**
[Error message exact]

**Evidence**
- Screenshot: test-results/[folder]/screenshot.png
- Trace: test-results/[folder]/trace.zip

**Automation Note**
[Selector used / what changed / flaky vs consistent]
```

## Severity Classification

| Failure Pattern | Severity |
|-----------------|----------|
| Login / auth broken | Critical |
| Core CRUD operation fails | High |
| Filter / search wrong results | High |
| UI element missing | Medium |
| Styling / layout issue | Low |
| Intermittent timeout | Low (flag as flaky) |

## Output

1. Summary table: total passed / failed / skipped
2. One defect entry per failed test
3. Flaky test list (failed but passed on retry)
4. Suggested priority order for dev team

Keep entries factual. No speculation. Quote exact error messages.
