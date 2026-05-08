# Sprint 4 — Offers Module — Completion Summary

**Date:** 2026-05-08
**Sprint:** 4
**Module:** Offers Management (`/admin/offers`)
**Status:** COMPLETE — 12/12 tests passing

---

## What Was Done

Full G2-to-G6 pipeline executed for the Offers module:

| Gate | Phase | Output | Status |
|------|-------|--------|--------|
| G2 | Manual QA Phase 1 — Discovery | `docs/selectors/offers.json` | PASSED |
| G3 | Manual QA Phase 2 — Screen Docs | `docs/pages/OFFERS.md` | PASSED |
| G4 | Manual QA Phase 3 — Test Cases | `docs/manual-test-cases/TC_OFFERS.md` | PASSED |
| G5 | Automation QA Phase 1 — Scripts | `src/pages/OffersPage.js` + `tests/ui/offers.spec.js` | PASSED |
| G6 | Automation QA Phase 2 — Execution | 12/12 tests green | PASSED |

---

## Key Technical Discoveries

### Ant Design Anticon Selector Pattern
- **Wrong:** `button:has(img[alt="edit"])` — Ant Design does NOT use `<img>` tags for icons
- **Correct:** `button:has([aria-label="edit"])` — uses `<span role="img" aria-label="edit" class="anticon anticon-edit">`
- This applies to ALL Ant Design icon buttons across all modules (edit, delete, eye, more, etc.)
- The `[role="img"]` span carries `aria-label` — target that with `:has([aria-label="..."])`

### Drawer vs Modal
- Offers module uses Ant Design **Drawer** (`.ant-drawer-body`), not Modal (`.ant-modal-body`)
- Drawer slides in from the right side of screen
- `role="dialog"` is still present — accessible via `dialog[name="Add New Offer"]`
- Page object should use `.ant-drawer-body` for content location

### Delete Confirmation Dialog (RESOLVED CLARIFICATION-OFFERS-005)
- Dialog title: "Are you sure you want to delete this offer?"
- Body: "This action cannot be undone."
- Confirm button: "Yes, delete" (NOT "OK" or "Yes")
- Cancel button: "Cancel"

### Toggle Behavior
- `role="switch"` with `aria-checked="true"/"false"`
- No confirmation dialog on toggle — HIGH risk of accidental deactivation
- State persists to server immediately (confirmed via page refresh test)

### Amount Input Placeholder
- The raw input placeholder is "Please enter amount" (NOT "₹")
- The ₹ prefix is a display wrapper rendered by Ant Design's InputNumber component
- Selector: `input[placeholder="Please enter amount"]` or `.ant-input-number-input`

### Typology Options (all 4 confirmed from live portal)
1. 1 Bed Growth Home
2. 2 Bed Growth Home
3. 2 Bed Peak Home
4. 2 Bed Rise Home

---

## Healing Events

### Round 1 Failures → Root Cause → Fix
| Test | Root Cause | Fix |
|------|-----------|-----|
| TC-005 (cleanup) | Delete selector `button:has(img[alt="delete"])` matched nothing | Changed to `button:has([aria-label="delete"])` |
| TC-005 (confirm) | Confirm button selector was generic `"OK"/"Yes"/"Confirm"` | Updated to exact text `"Yes, delete"` |
| TC-007, TC-008, TC-011 | Edit selector `button:has(img[alt="edit"])` matched nothing | Changed to `button:has([aria-label="edit"])` |
| TC-012 | Baseline count was 8 (leaked test offers from failed cleanup) | Cleaned UAT data manually; fixed underlying delete selector |

---

## Test Results (Final)

All 12 tests pass. 2.4 minutes runtime.

| TC | Name | Result |
|----|------|--------|
| TC-OFFERS-001 | Page Load + Count | PASS |
| TC-OFFERS-002 | Table Columns + Data Types | PASS |
| TC-OFFERS-003 | Sr.No Non-Contiguous | PASS |
| TC-OFFERS-004 | Add Drawer Fields | PASS |
| TC-OFFERS-005 | Create + Cleanup (with delete) | PASS |
| TC-OFFERS-006 | Validation on Empty Submit | PASS |
| TC-OFFERS-007 | Edit Pre-Fill Verification | PASS |
| TC-OFFERS-008 | Edit Round-Trip | PASS |
| TC-OFFERS-009 | Toggle OFF + Persistence | PASS |
| TC-OFFERS-010 | Toggle ON | PASS |
| TC-OFFERS-011 | Typology Dropdown Options | PASS |
| TC-OFFERS-012 | Refresh | PASS |

---

## Files Created / Modified

| File | Type | Action |
|------|------|--------|
| `docs/selectors/offers.json` | Selector map | Created |
| `docs/pages/OFFERS.md` | Screen documentation | Created |
| `docs/manual-test-cases/TC_OFFERS.md` | Manual TCs | Created |
| `src/pages/OffersPage.js` | Page Object | Created |
| `tests/ui/offers.spec.js` | Playwright spec | Created |
| `package.json` | npm scripts | Updated (added test:offers) |
| `docs/test-coverage.md` | Coverage report | Updated |
| `docs/SPRINT_LOG.md` | Sprint log | Updated |
| `docs/TASK_TRACKER.md` | Task tracker | Updated |

---

## Domain Red Flags Noted

| Flag | Severity | Action Taken |
|------|----------|-------------|
| Toggle has no confirmation dialog | HIGH | TC-OFFERS-009 tests and confirms this behavior |
| Pricing impact mid-booking when toggled OFF | HIGH | Noted in OFFERS.md; integration test scope (Allocation module) |
| Non-contiguous Sr.No = hard delete confirmed | INFO | TC-OFFERS-003 asserts expected gaps |

---

## Open Clarifications (still open at sprint close)

| ID | Question |
|----|---------|
| CLARIFICATION-OFFERS-001 | Is there a planned search/filter on offers list? |
| CLARIFICATION-OFFERS-002 | Is Offer Name required to be unique? |
| CLARIFICATION-OFFERS-003 | Does toggling OFF mid-allocation re-price customer's active selection? |
| CLARIFICATION-OFFERS-004 | What happens when offer End Date passes while customer is in booking flow? |

CLARIFICATION-OFFERS-005 (delete dialog) — RESOLVED in this sprint.

---

## Process Improvements Identified

1. **Pre-flight DOM inspection before writing POM:** Always use Playwright MCP `evaluate()` to confirm element selector patterns before coding. The Ant Design anticon pattern would have been caught immediately.
2. **Cleanup-first test design:** TC-005's create+cleanup pattern needs the cleanup path validated before the test runs. Consider a `beforeAll` or `afterAll` that deletes any leaked test offers by name.
3. **Baseline count should be dynamic not pinned:** For modules with mutable data (Offers, unlike Towers KPIs), derive `beforeCount` dynamically rather than pinning `BASELINE_COUNT = 6` — the pinned value breaks when prior test runs leak data.
