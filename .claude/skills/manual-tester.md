---
name: manual-tester
description: Generate structured test cases from BRD/FRD for a given XR Portal module. Produces TestCases.xlsx (Sheet 1: manual positive/negative per user journey, Sheet 2: automation candidates) and test-data-spec.md.
---

# Skill: manual-tester

**Called by**: BA Agent only
**Inputs**: module name, portal name, BRD/FRD section path
**Outputs**: `TestCases.xlsx`, `test-data-spec.md`

---

## Trigger Conditions

- BA Agent initiating Phase 1 for a new module
- Sync pipeline Step 3 — new module detected in change-manifest.json

---

## Execution Steps

1. Read BRD/FRD section at provided path in `.claude/docs/hoabl-knowledge-base/`
2. Extract all documented user journeys for the module
3. For each user journey: generate positive (happy path) + negative (edge/error/boundary) test cases
4. Every TC must carry a BRD/FRD requirement ID — no orphan cases
5. Classify each TC by type: `UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`
6. Mark automation candidates (Sheet 2): stable flows, non-visual, repeatable
7. Generate test-data-spec.md with all required inputs, boundary values, pre-conditions

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
| Scenario | One-line description |
| Preconditions | Auth state, data state |
| Steps | Numbered steps |
| Expected Result | Observable outcome |
| Test Data | Input values used |
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

- LeadSquared: excluded — no LSQ credentials, no LSQ API scenarios
- Strapi: excluded — test only downstream portal effects
- Never infer undocumented features
- Every TC must map to a BRD/FRD requirement ID
- Flag gaps: if BRD/FRD is ambiguous or missing for a user journey, stop and raise a GAP report
