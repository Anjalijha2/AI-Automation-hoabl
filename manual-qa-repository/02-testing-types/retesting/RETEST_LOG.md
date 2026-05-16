# Retest Log

**Purpose:** Track retesting of fixed bugs — verify fix works, no regression introduced

---

## Retest Entries

| Bug ID | Module | Fix Date | Retested By | Retest Date | Result | Notes |
|--------|--------|----------|-------------|-------------|--------|-------|
| — | — | — | — | — | — | — |

---

## How to Retest

1. Get bug details from `04-bug-reports/BUG_TRACKER.md`
2. Run specific TC:
   ```bash
   npx playwright test --config config/playwright.config.js -g "TC_ID" --headed
   ```
3. Log result in table above
4. If pass → update BUG_TRACKER.md status to `Closed`
5. If fail → add comment to bug, escalate

---

## Retest States

- **Pass** — Bug fixed, TC passes. Close bug.
- **Fail** — Bug not fixed or regression. Reopen bug.
- **Partial** — Main scenario fixed but edge case still failing. Add new bug.
