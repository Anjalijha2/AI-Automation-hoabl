# BA Agent — Commands

## How Commands Work
Commands are structured instructions the BA Agent issues or executes. Some trigger npm scripts on the project. Others are internal coordination actions issued to agents. All commands are logged in `docs/execution/pipeline-status.md`.

---

## Category 1 — Sprint Management Commands

### /ba:sprint:start <module>
Start a new module sprint from scratch.
```
Actions:
1. Read brd/<module>.md with domain lens
2. Extract Epics, Features, User Stories, Acceptance Criteria, Business Rules
3. Flag domain red flags and ambiguities
4. Raise clarification requests for anything unclear
5. Write docs/architecture/SPRINT_PLAN_<MODULE>.md
6. Update docs/TASK_TRACKER.md — all tasks set to Pending/Gated
7. Create xr-portal-vault/001-BRD-FRD/<Module>-BRD.md
8. Create xr-portal-vault/010-Sprints/SPRINT-<N>-PLAN.md
9. Write docs/execution/pipeline-status.md — all gates Pending
10. Trigger: Manual QA Agent — Phase 1
```

### /ba:sprint:status
Report current sprint status across all tasks and gate checks.
```
Actions:
1. Read docs/TASK_TRACKER.md
2. Read docs/execution/pipeline-status.md
3. Check each output file existence for gate validation
4. Report: task table with current status, open gates, open clarifications
```

### /ba:sprint:close
Close current sprint after all tasks complete.
```
Actions:
1. Verify all Definition of Done items are met
2. Run retrospective (see /ba:retro)
3. Update docs/SPRINT_LOG.md
4. Update docs/TASK_TRACKER.md — all tasks → Done
5. Update docs/test-coverage.md
6. Update docs/CHANGELOG.md
7. Update xr-portal-vault/008-Retrospectives/RETRO-SPRINT-<N>.md
8. Update xr-portal-vault/004-Domain-Knowledge/ with sprint learnings
9. Notify user: sprint complete with full summary
```

### /ba:retro
Run sprint retrospective.
```
Covers:
1. Tasks completed + outputs
2. Test results (pass/fail/skip + failure layer breakdown)
3. Bugs by severity and root cause layer
4. Healing events and patterns
5. Domain learnings → vault update
6. Process improvements for next sprint
7. Risk register update
Output: xr-portal-vault/008-Retrospectives/RETRO-SPRINT-<N>.md
```

---

## Category 2 — Pipeline Gate Commands

### /ba:gate:check <module>
Verify all pipeline prerequisites for the specified module.
```
Checks:
[ ] docs/selectors/<module>.json — exists? (Gate 1)
[ ] docs/pages/<MODULE>.md — exists? (Gate 2)
[ ] xr-portal-vault/002-Screens/<Module>/ — screens complete? (Gate 2)
[ ] docs/manual-test-cases/TC_<MODULE>.md — exists? (Gate 3)
[ ] User TC approval — confirmed? (Gate 3)
[ ] tests/ui/<module>.spec.js — exists and compiles? (Gate 4)
[ ] reports/results.json — execution complete? (Gate 5)
[ ] bugs/BUG_TRACKER.md — new Open bugs exist? (Gate 6)
Output: gate status table with PASS/FAIL/PENDING per gate
```

### /ba:gate:unblock <module> <gate_number>
Manually unblock a gate after verifying its prerequisite is now satisfied.
```
Actions:
1. Re-verify the specific gate condition
2. If satisfied: update pipeline-status.md — unblock
3. Trigger next pipeline step
4. If still not satisfied: report what is missing
```

---

## Category 3 — Agent Coordination Commands

### /ba:trigger:manual-qa:phase1 <module>
Issue Phase 1 instruction to Manual QA Agent.
```
Message to Manual QA Agent:
"Begin Phase 1 — Discovery for <module>.
Auth session: src/fixtures/.auth/admin.json
Target: <BASE_URL>/admin/<module>
Output required: docs/selectors/<module>.json
Report back when complete."
Update pipeline-status.md: Phase 1 → Running
```

### /ba:trigger:manual-qa:phase2 <module>
Issue Phase 2 instruction after Gate 1 passes.
```
Message to Manual QA Agent:
"Phase 1 output verified. Begin Phase 2 — Screen Documentation for <module>.
Read: docs/selectors/<module>.json, brd/<module>.md
Output required: docs/pages/<MODULE>.md + vault screen docs
Raise CLARIFICATION-NNN for any unclear dimension."
Update pipeline-status.md: Phase 2 → Running
```

### /ba:trigger:manual-qa:phase3 <module>
Issue Phase 3 instruction after Gate 2 passes.
```
Message to Manual QA Agent:
"Phase 2 output verified. Begin Phase 3 — Test Case Design for <module>.
Read: docs/pages/<MODULE>.md, vault screens, BRD, domain knowledge
Apply all 15 testing types. TC_ID format: TC_<MODULE>_<TYPE>_NNN
Output required: docs/manual-test-cases/TC_<MODULE>.md"
Update pipeline-status.md: Phase 3 → Running
```

### /ba:trigger:manual-qa:phase4 <module>
Issue Phase 4 instruction after execution failures detected.
```
Message to Manual QA Agent:
"Execution complete with failures. Begin Phase 4 — Defect Tracking for <module>.
Read: reports/results.json
Identify root cause layer per failure. Check for duplicates before logging.
Output required: updated bugs/BUG_TRACKER.md"
Update pipeline-status.md: Phase 4 → Running
```

### /ba:trigger:automation-qa:phase1 <module>
Issue Phase 1 instruction to Automation QA Agent (requires TC approval first).
```
Pre-check: confirm user has approved TCs
Message to Automation QA Agent:
"TCs approved. Begin Phase 1 — Script Generation for <module>.
Read: docs/manual-test-cases/TC_<MODULE>.md (approved)
Read: docs/selectors/<module>.json (all selectors — never hardcode)
Output required: src/pages/<Module>Page.js + tests/ui/<module>.spec.js
Self-validate before reporting complete."
Update pipeline-status.md: Automation P1 → Running
```

### /ba:trigger:automation-qa:phase2 <module>
Issue Phase 2 instruction after Gate 4 passes.
```
Message to Automation QA Agent:
"Scripts verified. Begin Phase 2 — Test Execution for <module>.
Verify auth session before running.
Classify all results: PASS / FAIL / SKIP (ENV guard ≠ failure)
Output required: reports/html-report/, reports/results.json, execution-summary.md"
Update pipeline-status.md: Automation P2 → Running
```

### /ba:trigger:automation-qa:phase3 <module>
Issue Phase 3 instruction after bugs are logged.
```
Message to Automation QA Agent:
"Defects logged. Begin Phase 3 — Healing Analysis for <module>.
Read: reports/results.json, affected spec files, docs/selectors/<module>.json
Output required: healing-reports/script-failure-analysis.md + fix-recommendations.md
Do NOT apply any fix — recommendations only."
Update pipeline-status.md: Automation P3 → Running
```

### /ba:approve:fixes <module> <fix_numbers>
Approve specific healing recommendations and trigger application.
```
Actions:
1. Review healing-reports/fix-recommendations.md
2. Approve listed fix numbers
3. Message to Automation QA Agent:
   "Apply approved fixes: [fix numbers] from fix-recommendations.md.
   Apply ONLY those items. Re-validate after. Notify when ready for re-execution."
```

---

## Category 4 — Clarification Commands

### /ba:clarification:raise <number> <module> <question>
Document and track a new clarification request.
```
Actions:
1. Write CLARIFICATION-NNN entry with: module, screen, question, context, impact
2. Update 000-MOC/MOC-Master.md — open clarifications table
3. Block dependent pipeline phases
4. Notify user: "Clarification needed before proceeding: [question]"
```

### /ba:clarification:resolve <number> <answer>
Resolve an open clarification and unblock pipeline.
```
Actions:
1. Update CLARIFICATION-NNN status → Resolved, add answer
2. Update screen's Clarification Log in vault
3. Add to xr-portal-vault/009-Decisions/DECISIONS-LOG.md
4. Update 000-MOC/MOC-Master.md — remove from open list
5. Unblock the dependent pipeline phase
6. Notify relevant agent: "Clarification resolved. Resume [phase]."
```

---

## Category 5 — Vault Management Commands

### /ba:vault:update:screen <module> <screen>
Update a screen doc in the vault.
```
Actions:
1. Open xr-portal-vault/002-Screens/<Module>/<Screen>.md
2. Update changed dimensions
3. Add to Change History table
4. Update MOC-Screens.md status table
5. Update cross-linked notes if needed
```

### /ba:vault:update:domain <concept>
Add or update a domain knowledge entry.
```
Actions:
1. Check if concept exists in DOMAIN-GLOSSARY.md
2. Add new entry or update existing
3. Update UNIT-STATUS-LIFECYCLE.md if status-related
4. Cross-link to relevant screen docs
```

### /ba:vault:update:decision <description>
Log a new architecture or business decision.
```
Actions:
1. Assign DEC_NNN (next available number)
2. Write entry: decision, rationale, trade-off, confirmed by, status
3. Add to 009-Decisions/DECISIONS-LOG.md
4. Cross-link to affected screen or feature
```

---

## Category 6 — npm Script Commands (Direct Execution)

```bash
# Sprint management
npm run sprint:status          # View current sprint status
npm run sprint:update          # Update sprint logs + task tracker + coverage
npm run sprint:plan-brd        # Plan sprint from BRD file

# Auth (run before first execution or after session expiry)
npm run auth:setup             # Save auth session → src/fixtures/.auth/admin.json
```

---

## Command Quick Reference

| Command | Trigger When |
|---------|-------------|
| `/ba:sprint:start <module>` | New module begins |
| `/ba:gate:check <module>` | Before triggering any next pipeline step |
| `/ba:trigger:manual-qa:phase1` | Sprint starts, Gate 0 clear |
| `/ba:trigger:manual-qa:phase2` | Gate 1 passes |
| `/ba:trigger:manual-qa:phase3` | Gate 2 passes |
| `/ba:trigger:automation-qa:phase1` | Gate 3 passes + user approves TCs |
| `/ba:trigger:automation-qa:phase2` | Gate 4 passes |
| `/ba:trigger:manual-qa:phase4` | Gate 5: failures exist |
| `/ba:trigger:automation-qa:phase3` | Gate 6: new bugs logged |
| `/ba:approve:fixes` | After reviewing healing recommendations |
| `/ba:sprint:close` | All tasks done, DoD met |
| `/ba:clarification:raise` | Any unclear logic detected |
| `/ba:clarification:resolve` | Answer received from stakeholder |
