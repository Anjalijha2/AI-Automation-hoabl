---
name: test-case-reviewer
description: Review test cases for coverage completeness, BRD/FRD traceability, and edge case gaps. Produces review-report.md with approval status per case and coverage %.
---

# Skill: test-case-reviewer

**Called by**: QA Agent (on BA Agent output, before any execution)
**Inputs**: `TestCases.xlsx` path, BRD/FRD section path
**Outputs**: `review-report.md` (gaps flagged, approval status per case, coverage %)

---

## Trigger Conditions

- QA Agent receiving `TestCases.xlsx` from BA Agent before execution begins
- Sync pipeline Step 3b — after test case update

---

## Execution Steps

1. Read `TestCases.xlsx` Sheet 1
2. Read corresponding BRD/FRD section from `.claude/docs/hoabl-knowledge-base/`
3. For each TC: verify BRD/FRD requirement ID exists and is valid
4. Check coverage: is every documented user journey covered by at least one TC?
5. Check negative coverage: is every documented error/edge case covered?
6. Check type distribution: is there at least 1 positive + 1 negative per journey?
7. Check TC_ID format: `TC_<MODULE>_<TYPE>_<NNN>` (underscores, sequential)
8. Produce `review-report.md` with per-case status and overall coverage %

---

## Review Checklist

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
- [ ] Expected result is observable and specific
- [ ] Test data specified (not "valid input" — actual values)
- [ ] P1 TCs cover all happy paths
- [ ] P1/P2 TCs cover all documented validation errors

### Automation Candidates (Sheet 2)
- [ ] Automation candidates are stable, non-visual, repeatable flows
- [ ] Playwright suite assignment is correct (e2e/ui-ux/regression/api/db)

---

## review-report.md Format

```markdown
# Test Case Review Report — <Module> — <Portal> — <Date>

## Summary
- Total TCs reviewed: N
- Approved: N
- Requires changes: N
- Coverage: N%

## Gaps Found
| Gap | BRD/FRD Section | Missing TC Type | Action |
|-----|----------------|-----------------|--------|

## Per-TC Status
| TC_ID | Req ID | Status | Issue |
|-------|--------|--------|-------|

## Approval
[ ] Approved — proceed to automation
[ ] Conditional — fix gaps before proceeding (listed above)
[ ] Rejected — significant coverage failure
```

---

## Constraints

- Execution cannot begin until review-report shows "Approved" or "Conditional + gaps fixed"
- Every gap must be documented — never silently skip
