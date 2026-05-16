# BUG_010 — Registration Status Validation Skipped on Empty Submit

**ID:** BUG_010  
**Status:** Open  
**Severity:** P2 — Major  
**Module:** Registration / Customers  
**Environment:** UAT  
**Reported:** 2026-04-18  
**Sprint:** Sprint 4

---

## Summary

When submitting the customer registration form with all required fields empty, validation is skipped and the form proceeds to the next step instead of showing field-level errors.

---

## Steps to Reproduce

1. Navigate to customer registration form
2. Leave all required fields empty
3. Click "Submit" / "Next"

**Expected:** Validation errors shown for all required fields  
**Actual:** Form advances to next step / page reloads without error messages

---

## Impact

- Allows incomplete customer records to be created
- Downstream allocation may fail due to missing required data
- Data integrity risk

---

## Screenshots

_(Attach screenshots here)_

---

## Root Cause (Suspected)

Validation function not triggered on submit — likely a JavaScript event binding issue or missing `required` attribute on form fields.

---

## Fix Suggestion

- Add `required` attribute to all mandatory fields
- Ensure `onSubmit` handler calls validation before proceeding
- Add integration test: `TC_CUSTOMERS_VAL_001` (to be created)

---

## Related TCs

- TC_CUSTOMERS_VAL_001 (pending creation)

---

## Workaround

Manually fill required fields. Validation works when individual fields are touched.

---

## Activity Log

| Date | Action | By |
|------|--------|----|
| 2026-04-18 | Bug reported during exploratory testing | QA |
| 2026-04-18 | Logged in BUG_TRACKER.md | Claude |
