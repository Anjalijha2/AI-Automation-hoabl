---
name: run-e2e
description: Execute full E2E user journey tests for a portal/module. Captures toHaveScreenshot() at each significant step. Primary test type.
---

# Skill: run-e2e

**Called by**: QA Agent
**Inputs**: portal name, module name, locator map path, automation candidates (Sheet 2)
**Outputs**: Playwright results, toHaveScreenshot() snapshots per step, step-level pass/fail log

---

## Command

```bash
npm run test:e2e:<portal>
# or specific module:
npx playwright test tests/e2e/<portal>/<module>.spec.js --config automation-repository/playwright.config.js --project=e2e --workers=1
```

---

## Execution Rules

1. Auth session must be valid: `automation-repository/fixtures/.auth/<portal>.json` must exist
2. Run `--workers=1` always
3. `toHaveScreenshot()` at every significant step (form submit, page navigation, modal open/close, state change)
4. Multi-step flows: assert state at each step before proceeding
5. Inter-portal data flows: only test if explicitly documented in BRD/FRD

---

## Coverage Requirements

Per BRD/FRD user journeys:
- Full flow from entry point to completion
- Session management (login → navigate → complete action → logout)
- State persistence: data saved persists across page reload
- Rollback on failure: cancelled action leaves no side effects

---

## ENV Skip Guard

```javascript
test.skip(process.env.ENV === 'uat', 'TC_XXX — Payment gateway skip on UAT');
```

---

## Screenshot Convention

```javascript
await expect(page).toHaveScreenshot('<module>-<step>-<state>.png', {
  maxDiffPixels: 100,
  threshold: 0.1
});
```

---

## Pass/Fail Classification

- `✅ PASS` — all assertions passed, screenshots match
- `❌ FAIL` — assertion failed (log: error message + element + timeout)
- `⏭ SKIP` — ENV guard active — expected, not a failure

---

## Constraints

- Chrome primary, `--workers=1`
- Never run with `--headed` in CI (set `HEADLESS=true`)
- E2E locator failure → call skill: `e2e-self-healer` before escalating
