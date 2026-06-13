---
name: goal-orchestrator
description: Group module spec tests into feature-coherent goals (Smoke → Read → Search/Filter → Actions → Modals → Negative → E2E). Execute one goal at a time. Do not advance until current goal is green or every failing test is explicitly fixme'd. Replaces single-shot full-suite runs.
---

# Skill: goal-orchestrator

**Called by**: QA Agent at start of Gate D (spec execution).
**Inputs**: portal name, module name, spec path
**Outputs**: ordered goal list with grep patterns; enforces sequential execution

---

## Why this exists

Single-shot runs of 30+ tests mean failures pile up, root causes blend, and the user can't tell which feature is broken vs which is a fixme. Goal-based execution surfaces feature health incrementally and lets us commit progress per goal.

---

## Default Goal Template

For most modules, apply this 7-goal grouping. Modules with unique surfaces (modals, drawers, deep workflows) add Goal 5b/5c.

| Goal | Name | Scope | Default grep |
|------|------|-------|--------------|
| 1 | Smoke | Page load, auth gate, sidebar nav, page heading | `UI_001\|FUNC_001\|NEG_003` |
| 2 | Read | KPI cards, table render, columns, pre-filled fields, pagination | `UI_002\|FUNC_00[2-7]` |
| 3 | Search/Filter/Sort | Search box, filter chips, column sort, reset filters | `FUNC_004\|FUNC_005\|FUNC_016\|FUNC_019\|FUNC_020` |
| 4 | Row-level Actions | Download, view detail, ⋮ menus, copy/share | `FUNC_007\|FUNC_008\|FUNC_009\|FUNC_021\|FUNC_024` |
| 5 | Modals / Drawers | Add/Edit/Delete confirmation popups, form drawers | `FUNC_modal\|NEG_modal\|FUNC_03[1-9]` |
| 5b | Module-specific surfaces | e.g., Customers → Cancel Registration, Unit Swap, Parking | `FUNC_04[6-9]\|FUNC_05[0-4]\|FUNC_06[0-9]\|FUNC_08[0-5]` |
| 6 | Negative / Validation | VAL / NEG / EDGE tests | `VAL_\|NEG_\|EDGE_` |
| 7 | E2E / Integration | Full-flow tests, business rules | `E2E_\|BIZ_\|INT_` |

---

## Execution Steps

### Step 1 — Define goals for the module
1. Read spec file `tests/e2e/<portal>/<module>.spec.js`
2. Extract all TC_IDs from `test()` and `test.fixme()` titles
3. Group into goals per default template; adjust for module-specific surfaces
4. Write goal map to `manual-qa-repository/06-test-runs/<sprint>/goals-<portal>-<module>.md`:
   ```
   # Goals — <Portal>/<Module>
   ## Goal 1 — Smoke (grep="UI_001|FUNC_001")
   - TC_LOGIN_FUNC_001
   - TC_LOGIN_UI_001
   ...
   ```

### Step 2 — Sequential execution
For each goal in order:

1. Run: `npx playwright test tests/e2e/<portal>/<module>.spec.js --grep "<goalGrep>" --config automation-repository/playwright.config.js --project=e2e --workers=1 --headed --reporter=list 2>&1 > test-results-<portal>-<module>-goal<N>.log`
2. Invoke skill: `execution-tracker` to update xlsx + TestCases.md
3. Triage failures (POM locator → spec assertion → fixme)
4. **Gate exit:** all tests in goal ✓ OR explicitly `test.fixme()` with reason
5. Commit: `feat(<portal>-<module>): goal <N>/<total> — <Feature> green (<P>/<T> passed)`

### Step 3 — After all goals green
Run full-suite smoke: `npx playwright test tests/e2e/<portal>/<module>.spec.js --headed --workers=1 --reporter=list` — confirm no regression from per-goal sequencing.

### Step 4 — Module complete
Update `manual-qa-repository/TASK_TRACKER.md` with module = Done. Move to next module per Phase 2 portal order.

---

## Stop Conditions (do NOT advance)

- Any test in current goal is failing AND not fixme'd
- xlsx is locked (Excel open)
- New post-capture TCs in `_new-tcs-since-last-review.txt` not yet user-verified
- Auth session expired and refresh failed
- Test data dependency unmet (ask user before proceeding)

---

## Constraints

1. NEVER skip a goal — even if it has only 1 test
2. NEVER run a later goal before current goal is clean
3. Commit MUST happen per goal, not at end of module — gives traceable history
4. Goal-1 is always smoke — if smoke fails, do not run any later goal
5. If a goal has zero TCs in current spec, mark it `Skipped (no TCs)` and continue
