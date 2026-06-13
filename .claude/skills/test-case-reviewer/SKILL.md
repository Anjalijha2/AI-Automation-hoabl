---
name: test-case-reviewer
description: Review test cases for visual evidence coverage, dual-source quality, BRD/FRD traceability, and edge case completeness. Validates that Steps use real selectors from INDEX.md and Expected Results cite screenshots. Produces review-report.md with approval status, visual coverage %, and doc logic coverage %.
---

# Skill: test-case-reviewer

**Called by**: QA Agent (on BA Agent output, before any execution); BA Agent (preliminary pass)
**Inputs**: `TestCases.xlsx` path, BRD/FRD section path, `visual-memory/<portal>/<module>/INDEX.md` path
**Outputs**: `review-report.md` (gaps flagged, approval status per case, coverage %, visual coverage %)

---

## Trigger Conditions

- QA Agent receiving `TestCases.xlsx` from BA Agent before execution begins
- BA Agent completing Phase 1 preliminary review
- Sync pipeline Step 3b — after test case update

---

## Execution Steps

1. Read `TestCases.xlsx` Sheet 1
2. Read corresponding BRD/FRD section from `.claude/docs/hoabl-knowledge-base/`
3. Read `visual-memory/<portal>/<module>/INDEX.md` — extract all documented screenshot filenames from Screens table
4. For each TC: verify BRD/FRD requirement ID exists and is valid
5. For each TC: validate Visual Evidence column:
   a. If `[NO-VISUAL-EVIDENCE]` → flag `VISUAL_GAP`, status = Requires Changes
   b. If `[STUB-EVIDENCE]` → flag `VISUAL_WARNING`, status = Conditional
   c. If filename present → verify filename exists in INDEX.md Screens table
      - Not in INDEX.md → flag `VISUAL_MISMATCH`, status = Requires Changes
      - In INDEX.md → visual check passes
6. For each TC: verify dual-source coverage:
   a. Steps must reference selectors from INDEX.md Key Structural Notes — flag `SELECTOR_INFERRED` if not
   b. Scenario/description must reflect BRD/FRD feature purpose (not purely mechanical) — flag `LOGIC_GAP` if absent
   c. Any TC with `LOGIC_GAP` → status = Requires Changes
7. Check BRD/FRD coverage: is every documented user journey covered by at least one TC?
8. Check negative coverage: is every documented error/edge case covered?
9. Check type distribution: at least 1 positive + 1 negative per journey?
10. Check TC_ID format: `TC_<MODULE>_<TYPE>_<NNN>` (underscores, sequential)
11. Calculate: visual coverage % = (TCs with FULL visual evidence / total TCs) × 100
12. Calculate: doc logic coverage % = (TCs with BRD/FRD context in Scenario / total TCs) × 100
13. Produce `review-report.md`

---

## Review Checklist

### Visual Coverage
- [ ] Every TC has non-empty Visual Evidence column
- [ ] Every Visual Evidence filename is listed in INDEX.md Screens table
- [ ] No TC has `[NO-VISUAL-EVIDENCE]` (blocks Approved status)
- [ ] TCs with `[STUB-EVIDENCE]` are flagged — cannot automate until stub replaced
- [ ] Visual coverage % ≥ 80% for Approved status

### Documentation Logic Coverage
- [ ] Every TC Scenario references BRD/FRD feature purpose or business rule
- [ ] No TC is purely mechanical (UI click steps with no stated reason)
- [ ] Acceptance criteria in TCs traceable to BRD/FRD AC section
- [ ] No `LOGIC_GAP` flags present for Approved status

### Traceability
- [ ] Every TC has a BRD/FRD requirement ID
- [ ] Requirement ID exists in BRD/FRD document
- [ ] No orphan TCs (TCs with no requirement ID)

### Coverage
- [ ] Every user journey in BRD/FRD has at least 1 TC
- [ ] Every error state/validation in FRD has a negative TC
- [ ] Critical flows (auth, booking, payment) have E2E TCs

### Quality
- [ ] TC_ID format correct: `TC_<MODULE>_<TYPE>_<NNN>`
- [ ] Preconditions defined
- [ ] Expected result is observable and specific — cites screenshot filename
- [ ] Test data specified (actual values, not "valid input")
- [ ] P1 TCs cover all happy paths
- [ ] P1/P2 TCs cover all documented validation errors

### Automation Candidates (Sheet 2)
- [ ] No TC with `[NO-VISUAL-EVIDENCE]` appears in Sheet 2
- [ ] TCs with `[STUB-EVIDENCE]` in Sheet 2 are flagged as requiring stub upgrade before implementation
- [ ] Playwright suite assignment is correct (e2e/ui-ux/regression/api/db)

---

## review-report.md Format

```markdown
# Test Case Review Report — <Module> — <Portal> — <Date>

## Summary
- Total TCs reviewed: N
- Approved: N
- Requires changes: N
- Coverage (BRD/FRD): N%
- Visual coverage: N% (TCs with screenshot-backed expected results / total TCs)
- Doc logic coverage: N% (TCs with BRD/FRD feature context in Scenario / total TCs)
- Visual status: FULL | STUB | MIXED

## Visual Evidence Gaps
| TC_ID | Expected Result Summary | Evidence Status | Screenshot Filename | Action |
|-------|------------------------|-----------------|---------------------|--------|

## Logic Gaps
| TC_ID | Scenario Text | Missing Context | Action |
|-------|--------------|-----------------|--------|

## BRD/FRD Gaps
| Gap | BRD/FRD Section | Missing TC Type | Action |
|-----|----------------|-----------------|--------|

## Per-TC Status
| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------|--------|-----------------|----------------|--------|-------|

## Approval
[ ] Approved — proceed to automation (visual ≥ 80%, no NO-VISUAL-EVIDENCE, no LOGIC_GAP, no VISUAL_MISMATCH)
[ ] Conditional — fix gaps before proceeding (listed above)
[ ] Rejected — significant coverage failure
```

---

## Approval Gate Rules

| Condition | Maximum Status Allowed |
|-----------|----------------------|
| Visual coverage ≥ 80%, no VISUAL_GAP, no VISUAL_MISMATCH, no LOGIC_GAP | Approved |
| Visual coverage 50–79% OR any STUB-EVIDENCE present | Conditional |
| Visual coverage < 50% OR any NO-VISUAL-EVIDENCE present | Conditional (cannot be Approved) |
| Any VISUAL_MISMATCH (filename cited but not in INDEX.md) | Conditional (cannot be Approved) |
| Any LOGIC_GAP present | Conditional (cannot be Approved) |
| Visual coverage < 30% | Rejected |

---

## Constraints

- Execution cannot begin until review-report shows "Approved" or "Conditional + gaps fixed"
- Every gap must be documented — never silently skip
- Visual coverage < 80% prevents Approved status — hard gate
- Any LOGIC_GAP prevents Approved status — hard gate
- Any VISUAL_MISMATCH prevents Approved status — hard gate
- `[NO-VISUAL-EVIDENCE]` TCs are flagged for removal from Sheet 2 regardless of other status
