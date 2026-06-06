---
name: manual-tester
description: Generate structured test cases from both visual-memory screenshots and BRD/FRD documentation for a given XR Portal module. Dual-source mandatory — screenshots for UI structure/selectors/expected states, BRD/FRD for feature logic/purpose/business rules. Produces TestCases.xlsx and test-data-spec.md.
---

# Skill: manual-tester

**Called by**: BA Agent only
**Inputs**: module name, portal name, BRD/FRD section path, visual-memory INDEX.md path (`visual-memory/<portal>/<module>/INDEX.md`), STUB flag (if INDEX.md is a stub)
**Outputs**: `TestCases.xlsx`, `test-data-spec.md`

---

## Trigger Conditions

- BA Agent initiating Phase 1 for a new module (after visual gate cleared)
- Sync pipeline Step 3 — new module detected in change-manifest.json

---

## PRE-FLIGHT — VISUAL GATE (run before any other step)

1. Resolve path: `visual-memory/<portal>/<module>/INDEX.md`
2. Attempt to read the file.
3. **If file MISSING** → STOP immediately. Do not read BRD/FRD. Do not generate any TCs.
   Raise VISUAL_GATE_BLOCK:
   ```
   VISUAL_GATE_BLOCK: <portal>/<module>
   Reason: visual-memory/<portal>/<module>/INDEX.md does not exist
   Action required: Tech Lead Agent must run visual-capture skill for this module first
   TC generation is BLOCKED until INDEX.md is present
   ```
   Return this block to BA Agent. Do not proceed.
4. **If file exists with `CAPTURE_STATUS: STUB`** → proceed with WARNING header on all output:
   ```
   ⚠ VISUAL EVIDENCE IS STUB — Expected Results may not match live UI
   Full capture needed before automation. All TCs in this batch carry [STUB-EVIDENCE].
   ```
5. **If file exists, CAPTURE_STATUS: FULL** → proceed normally.

---

## Execution Steps

### Step 1 — Read Visual Memory (FIRST)

Read `visual-memory/<portal>/<module>/INDEX.md`. Extract:
- All captured screenshots (Screens table — filenames and descriptions)
- Key Structural Notes (exact selectors, element types, heading text, API field names)
- Viewport used for captures
- Environment URL

### Step 2 — Read BRD/FRD (SECOND)

Read BRD/FRD section at provided path in `.claude/docs/hoabl-knowledge-base/`. Extract:
- All documented user journeys for the module
- Feature purpose: what this feature is for, why it exists
- Business logic: rules, conditions, validations, workflows
- Acceptance criteria: what conditions define pass/fail

### Step 2b — DOC_DRIFT Check

After reading BRD/FRD, scan for any URL, route, endpoint, or field name mentioned:
1. Compare each URL/route in BRD/FRD against the Environment URL in visual-memory INDEX.md
2. Compare each endpoint path in BRD/FRD against API calls documented in INDEX.md (if present)
3. Compare field names in BRD/FRD against field labels in Key Structural Notes

If mismatch found → raise DOC_DRIFT flag (non-blocking — TC generation continues):
```
DOC_DRIFT-NNN: <portal>/<module>
BRD/FRD reference: [section] says [URL/field/endpoint]
Observed (INDEX.md): [actual URL/field/endpoint from live capture]
Action: BA Agent must update BRD/FRD to reflect actual implementation
TC generation: using observed (actual) values in Steps/Expected Results — not stale BRD values
```

TC generation proceeds using the **observed** (INDEX.md) values — DOC_DRIFT is a flag, not a blocker.

### Step 3 — Cross-Reference

For each BRD/FRD user journey:
- Identify which screenshots from Step 1 show the relevant UI states
- If a BRD/FRD journey has NO corresponding screenshot → add to VISUAL_GAP list (flag, do not block)
- VISUAL_GAP format:
  ```
  VISUAL_GAP: <portal>/<module>
  Journey: <BRD/FRD user journey description>
  Missing screenshot: No screenshot shows <state description>
  Impact: Expected Result for TC <TC_ID> cannot be visually validated
  Action: Tech Lead Agent should capture <state> and update INDEX.md
  TC status: Generated with [NO-VISUAL-EVIDENCE] flag — do NOT automate until evidence added
  ```

### Step 4 — Generate Test Cases (Dual-Source)

For each user journey: generate positive (happy path) + negative (edge/error/boundary) test cases.

**Source 1 — visual-memory INDEX.md (drives Steps and Expected Results):**
- Steps must reference what is VISIBLE in screenshots
- Selectors in Steps must come from Key Structural Notes — never inferred from BRD/FRD text
- Expected Results must cite the specific screenshot filename that shows the expected state

**Source 2 — BRD/FRD (drives Scenario context and business logic):**
- Scenario description must reflect the feature purpose from BRD/FRD
- Business rules, validations, and acceptance criteria come from BRD/FRD
- Every TC must carry a BRD/FRD requirement ID — no orphan cases

### Step 5 — Classify and Mark Candidates

- Classify each TC by type: `UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`
- Mark automation candidates (Sheet 2): stable flows, non-visual, repeatable
- TCs with `[NO-VISUAL-EVIDENCE]` → excluded from Sheet 2 (cannot automate without visual evidence)
- TCs with `[STUB-EVIDENCE]` → may appear in Sheet 2 but flagged; cannot implement until stub upgraded

### Step 6 — Generate test-data-spec.md

Document all data requirements: valid/invalid inputs, boundary values, pre-conditions, cleanup steps.

---

## TestCases.xlsx Schema

### Sheet 1 — Manual Test Cases
| Column | Description |
|--------|-------------|
| TC_ID | Format: `TC_<MODULE>_<TYPE>_<NNN>` |
| BRD/FRD Req ID | Traceability — mandatory |
| Portal | admin / sales-manager / channel-partner / buyer |
| Module | e.g. Login, Allocation |
| Type | UI/FUNC/VAL/E2E/NEG/EDGE/etc. |
| Scenario | One-line description — must reflect BRD/FRD feature purpose |
| Preconditions | Auth state, data state |
| Steps | Numbered steps — selectors from INDEX.md Key Structural Notes |
| Expected Result | Observable outcome — written from what screenshots show |
| Visual Evidence | Screenshot filename(s) from INDEX.md Screens table. Format: `visual-memory/<portal>/<module>/<file>.png`. Use `[NO-VISUAL-EVIDENCE]` if none exists. Use `[STUB-EVIDENCE]` if from stub INDEX.md. |
| Test Data | Actual input values |
| Priority | P1/P2/P3 |
| Status | Pending/Approved/Deprecated |

### Sheet 2 — Automation Candidates
| Column | Description |
|--------|-------------|
| TC_ID | Reference to Sheet 1 |
| Module | Same as Sheet 1 |
| Type | TC type |
| Automatable | Yes/No/Partial |
| Complexity | Low/Medium/High |
| Playwright Suite | e2e / ui-ux / regression / api / db |
| Visual Evidence Status | FULL / STUB / NO-EVIDENCE |
| Notes | Any special handling |

### Sheet 3 — Bug Template
Pre-populated template: Bug ID, TC_ID, Severity, Steps, Actual, Expected, Environment, Status

---

## test-data-spec.md Schema

```markdown
# Test Data Spec — <Module> — <Portal>

## Valid Inputs
| Field | Valid Values | Notes |
|-------|-------------|-------|

## Invalid / Boundary Inputs
| Field | Invalid Value | Expected Error |
|-------|--------------|---------------|

## Pre-conditions
- Auth: [state required]
- Data: [records required to exist]

## Cleanup / Teardown
- [what must be cleaned up after test]
```

---

## Constraints

- Visual gate non-negotiable — `visual-memory/<portal>/<module>/INDEX.md` must exist before TC generation
- BRD/FRD non-negotiable — feature logic and purpose must be read before TC generation
- Selectors in Steps must come from INDEX.md Key Structural Notes — never inferred from BRD/FRD text
- Expected Results must cite a screenshot filename — never describe assumed UI appearance
- TCs with `[NO-VISUAL-EVIDENCE]` cannot appear in Automation Candidates (Sheet 2)
- TCs with `[STUB-EVIDENCE]` can appear in Sheet 2 only after stub upgraded to FULL
- Test scenario rationale must reference BRD/FRD feature purpose — never left implicit
- LeadSquared: excluded — no LSQ credentials, no LSQ API scenarios
- Strapi: excluded — test only downstream portal effects
- Never infer undocumented features
- Every TC must map to a BRD/FRD requirement ID
- Flag gaps: if BRD/FRD is ambiguous or missing for a user journey, raise a GAP report
