# Regression Test Plan

**Purpose:** Full regression run covering all automated TCs  
**Frequency:** Per sprint completion, post-hotfix, pre-release  
**Command:** `npm run test:regression`

---

## Scope

All specs under `tests/e2e/`:

| Spec | Module | TCs Covered |
|------|--------|-------------|
| `login.spec.js` | Login | TC_LOGIN_* |
| _(future)_ | Customers | TC_CUSTOMERS_* |
| _(future)_ | Config | TC_CONFIG_* |
| _(future)_ | Allocation | TC_ALLOCATION_* |
| _(future)_ | Towers | TC_TOWERS_* |
| _(future)_ | Channel Partners | TC_CP_* |
| _(future)_ | JBP | TC_JBP_* |
| _(future)_ | Offers | TC_OFFERS_* |

---

## Execution Order

1. `auth-setup` (one-time session save)
2. All `tests/e2e/*.spec.js` in parallel=false, workers=1

---

## Exit Criteria

- Pass rate ≥ 95%
- No critical/P0 failures
- All P1 failures logged in `04-bug-reports/BUG_TRACKER.md`

---

## Reports

- HTML: `reports/html-report/` (`npm run report`)
- JSON: `reports/results.json`
- Screenshots: `test-results/`
