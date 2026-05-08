# Manual QA Agent — Commands

## How Commands Work
Commands map to specific actions the Manual QA Agent performs per phase. Some trigger npm scripts. Others are internal documentation or clarification actions. All phase completions are reported back to BA Agent.

---

## Category 1 — Phase 1: Discovery Commands

### /mqa:discover <module>
Run full UI discovery for a module.
```bash
npm run discover -- --module=<module>
```
```
Actions:
1. Launch Playwright headless Chromium
2. Authenticate using src/fixtures/.auth/admin.json
3. Navigate to all screens in the <module> section
4. Extract real selectors (priority: id → data-testid → aria-label → CSS → text)
5. Capture full-page screenshots per screen state
6. Write: docs/selectors/<module>.json
7. Write: discovery/reports/portal-map.json
8. Write: discovery/reports/screenshots/<module>/
9. Initialize: xr-portal-vault/002-Screens/<Module>/<Screen>.md per screen
10. Report to BA Agent: "Phase 1 complete — N selectors extracted across N screens"
```

### /mqa:discover:screen <module> <screen>
Re-run discovery for a single screen (e.g., after UI update).
```bash
npm run discover -- --module=<module> --screen=<screen>
```
```
Actions:
1. Target only the specified screen
2. Re-extract selectors for that screen only
3. Update docs/selectors/<module>.json — bump version field
4. Update screenshot for that screen
5. Flag to BA Agent: "Selector refresh complete for <screen> — version bumped"
```

### /mqa:discover:verify <module>
Verify discovery output is complete and valid before Phase 2 proceeds.
```
Actions:
1. Check docs/selectors/<module>.json exists
2. Verify JSON is valid (no syntax errors)
3. Check all major interactive elements have selectors (no gaps)
4. Check screenshots exist for all captured screens
5. Report: "Discovery output valid" or list specific gaps
```

---

## Category 2 — Phase 2: Screen Documentation Commands

### /mqa:docs:generate <module>
Generate page documentation from discovery output.
```bash
npm run docs:generate -- --module=<module>
```
```
Actions:
1. Read: docs/selectors/<module>.json
2. Read: brd/<module>.md
3. Read: screenshots from discovery/reports/screenshots/<module>/
4. Apply domain knowledge from xr-portal-vault/004-Domain-Knowledge/
5. Complete all 12 dimensions per screen in vault
6. Write: docs/pages/<MODULE>.md (for Automation QA Agent)
7. STOP on any unclear dimension — raise /mqa:clarification:raise
8. Report to BA Agent: "Phase 2 complete — N screens documented"
```

### /mqa:docs:screen <module> <screen>
Document or update a single screen.
```
Actions:
1. Open xr-portal-vault/002-Screens/<Module>/<Screen>.md
2. Complete/update all 12 dimensions
3. Update Change History in the screen doc
4. Cross-link to BRD, flows, API notes, DB mappings in vault
5. Mark status tag: #status/complete or #status/clarification-needed
```

### /mqa:docs:verify <module>
Verify all screen docs are complete before Phase 3.
```
Actions:
1. Check each screen doc in xr-portal-vault/002-Screens/<Module>/
2. Verify all 12 dimensions are filled (no empty sections marked [UNVERIFIED] without clarification)
3. Check all clarifications are resolved or flagged
4. Check docs/pages/<MODULE>.md exists
5. Report: "Screen docs complete" or list incomplete dimensions
```

---

## Category 3 — Phase 3: Test Case Commands

### /mqa:testcases:generate <module>
Generate test cases for a module across all 15 testing types.
```bash
npm run testcases:generate -- --module=<module>
```
```
Actions:
1. Read: docs/pages/<MODULE>.md
2. Read: xr-portal-vault/002-Screens/<Module>/ (all screens)
3. Read: brd/<module>.md
4. Read: xr-portal-vault/004-Domain-Knowledge/ (relevant concepts)
5. Design TCs for all 15 types (UI, VAL, FUNC, E2E, API, DB, INT, BIZ, REG, EXP, NEG, EDGE, XMOD, DC, WF)
6. Assign TC_IDs: TC_<MODULE>_<TYPE_CODE>_<NNN>
7. Assign priorities: P0 — P4
8. Write: docs/manual-test-cases/TC_<MODULE>.md
9. Write: xr-portal-vault/007-Test-Observations/<Module>-Exploratory.md
10. Report to BA Agent: "Phase 3 complete — N TCs: P0: X, P1: Y, P2: Z across N types"
```

### /mqa:testcases:addregression <module> <bug_id>
Add a regression TC after a bug is fixed.
```
Actions:
1. Read BUG_<ID> entry from bugs/BUG_TRACKER.md
2. Design regression TC covering the exact bug scenario
3. Tag the TC: [REGRESSION] BUG_<ID>
4. Append to docs/manual-test-cases/TC_<MODULE>.md
5. Assign priority P1 (regressions are always high priority)
6. Report to BA Agent: "Regression TC added for BUG_<ID>"
```

### /mqa:testcases:review <module>
Self-review TC file for completeness before submitting for user approval.
```
Actions:
1. Count TCs per testing type — verify all 15 types have coverage
2. Verify TC_ID format: TC_<MODULE>_<TYPE>_NNN
3. Verify every TC has: precondition, steps, expected result, priority
4. Flag any TC written against [UNVERIFIED] behavior
5. Report: "TC review complete — N TCs ready / N items need clarification"
```

---

## Category 4 — Phase 4: Defect Tracking Commands

### /mqa:defects:log <module>
Parse execution results and log new bugs.
```bash
npm run defects:log
```
```
Actions:
1. Read reports/results.json
2. Filter: FAIL only (SKIP = not a failure, ignore)
3. For each failure:
   a. Identify root cause layer: UI / API / DB / Integration / Business Logic
   b. Check bugs/BUG_TRACKER.md for duplicates
   c. If new: assign BUG_NNN and log full entry
   d. If duplicate (Open): add occurrence note, do not create new entry
   e. If duplicate (Closed): create new entry (regression)
4. Update bugs/BUG_TRACKER.md
5. Update xr-portal-vault/007-Test-Observations/<Module>-Exploratory.md
6. Report to BA Agent: "Phase 4 complete — N bugs logged (BUG_NNN to BUG_NNN)"
```

### /mqa:defects:update <bug_id> <status>
Update the status of an existing bug.
```
Statuses: Open → In Progress → Fixed → Verified → Closed
Actions:
1. Open bugs/BUG_TRACKER.md
2. Find BUG_<ID> entry
3. Update STATUS field
4. Add timestamp and note to Change History
5. If Closed: verify regression TC exists or add one
```

### /mqa:defects:crossmodule <bug_id>
Assess and document cross-module impact of a bug.
```
Actions:
1. Read BUG_<ID> entry
2. Analyze which other modules share the affected feature, data, or API
3. Update bug entry: Cross-Module Impact section
4. Alert BA Agent if impact is significant
5. Add XMOD test cases if cross-module behavior needs coverage
```

---

## Category 5 — Clarification Commands

### /mqa:clarification:raise <module> <screen> <question>
Stop work on an unclear area and raise a clarification.
```
Actions:
1. Document CLARIFICATION-NNN: module, screen, question, context, impact on work
2. Add to screen doc's Clarification Log
3. Notify BA Agent: "CLARIFICATION-NNN raised — [module/screen]: [question]"
4. Mark affected screen section as [BLOCKED — CLARIFICATION-NNN]
5. Stop all work on that section until resolved
```

### /mqa:clarification:apply <number> <answer>
Apply a resolved clarification to the documentation.
```
Actions:
1. Read confirmed answer from BA Agent
2. Update the blocked section in screen doc with confirmed information
3. Mark CLARIFICATION-NNN as Resolved in screen Clarification Log
4. Resume work on the previously blocked phase
5. Confirm to BA Agent: "CLARIFICATION-NNN applied. Resuming Phase [N]."
```

---

## Category 6 — Vault Commands

### /mqa:vault:observations <module>
Add exploratory testing observations to the vault.
```
Actions:
1. Open xr-portal-vault/007-Test-Observations/<Module>-Exploratory.md
2. Add new session log with: date, focus area, findings, severity, screen links
3. Tag findings with: #type/observation, #module/<name>, severity level
4. Link to affected screen docs using backlinks
```

### /mqa:vault:screen:update <module> <screen> <dimension>
Update a specific dimension of a screen doc.
```
Actions:
1. Open xr-portal-vault/002-Screens/<Module>/<Screen>.md
2. Update the specified dimension number (1-12)
3. Add entry to Change History table in the doc
4. Update status tag if dimension was previously incomplete
```

---

## Command Quick Reference

| Command | Phase | When to Use |
|---------|-------|------------|
| `/mqa:discover <module>` | P1 | BA Agent triggers — start of sprint |
| `/mqa:discover:screen <module> <screen>` | P1 | After UI update on specific screen |
| `/mqa:discover:verify <module>` | P1 | Before reporting Phase 1 complete |
| `/mqa:docs:generate <module>` | P2 | After Gate 1 passes |
| `/mqa:docs:screen <module> <screen>` | P2 | Document/update single screen |
| `/mqa:docs:verify <module>` | P2 | Before reporting Phase 2 complete |
| `/mqa:testcases:generate <module>` | P3 | After Gate 2 passes |
| `/mqa:testcases:addregression <module> <bug_id>` | P3 | After bug is fixed |
| `/mqa:testcases:review <module>` | P3 | Before submitting for user approval |
| `/mqa:defects:log <module>` | P4 | After execution failures detected |
| `/mqa:defects:update <bug_id> <status>` | P4 | Bug status change |
| `/mqa:defects:crossmodule <bug_id>` | P4 | When bug may affect other modules |
| `/mqa:clarification:raise` | Any | Any unclear logic in any phase |
| `/mqa:clarification:apply` | Any | After BA Agent confirms answer |
| `/mqa:vault:observations <module>` | P3/P4 | Exploratory findings to document |

---

## npm Scripts Reference

```bash
npm run discover                              # Full portal discovery
npm run discover -- --module=<module>         # Module-specific discovery
npm run docs:generate                         # Generate all page docs
npm run docs:generate -- --module=<module>    # Module-specific docs
npm run testcases:generate                    # Generate all TCs
npm run testcases:generate -- --module=<mod>  # Module-specific TCs
npm run defects:log                           # Parse results → BUG_TRACKER
```
