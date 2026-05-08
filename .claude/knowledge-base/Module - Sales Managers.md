---
type: module
module: Sales Managers
url: https://uat-web.xrportal.in/admin/sales-managers
sprint: 2
status: Automated
spec: tests/ui/config.spec.js
tcs: TC_CFG_041–048 + TC_CFG_019 (sample download)
tags: [module, sales-managers, automated]
updated: 2026-05-08
---

# Module: Sales Managers

## Overview

Two-surface module:
1. **`/admin/cms` → Sales Managers section** — bulk CSV upload to create/update SM records
2. **`/admin/sales-managers`** — standalone list page with search, filters, add/edit modal, settings

> Automation covers **both** surfaces. Bulk upload = TC_CFG_041–048. List page search = TC_CFG_045–046.

## Surfaces

### Surface 1 — CMS Bulk Upload (`/admin/cms` → Section 7)

**CSV Format (confirmed from `buildSalesManagerFile`):**

| Col | Header | Values |
|-----|--------|--------|
| 0 | Role | `"Sales Manager"` |
| 1 | First Name | text |
| 2 | Last Name | text |
| 3 | Email | email |
| 4 | Phone | 10-digit string |
| 5 | IS_AVAILABLE | `1` (assignable) / `0` (not assignable) |
| 6 | IS_ACTIVE | `1` (active) / `0` (inactive) |

**Sample file download button:** "Sample File Download" in Sales Managers section card  
**Upload accepts:** `.xlsx`  
**Submit:** "Submit" scoped to Sales Managers section card  
**Success:** toast containing `"upload"` or `"success|add|creat|updat"`

### Surface 2 — List Page (`/admin/sales-managers`)

**Header:** "Sales Managers" heading | "26 Sales Managers" counter | Search box | Settings | Add Sales Manager

**Table columns:** First Name | Last Name | Email | Phone | Role | Assignable | Is Active | Created At | Actions (Edit)

**Search:** `input.ant-input` → fill text → Enter → table filters

**Pagination:** 10/page, 3 pages for 26 records

**Settings modal:** Email Masking | Phone Masking | Cost Masking (system-wide toggles)

**Add/Edit SM modal:** First Name | Last Name | Email | Phone | Role (dropdown) | Assignable toggle | Is Active toggle

## Automated Tests (config.spec.js)

| TC | Type | Description | Approach |
|----|------|-------------|----------|
| TC_CFG_019 | Positive | Sample file downloads with correct SM columns | CMS download |
| TC_CFG_041 | Positive | Add new SM (Role=Sales Manager, AVAILABLE=1, ACTIVE=1) | CMS bulk upload |
| TC_CFG_042 | Positive | Make SM unavailable (IS_AVAILABLE=0) | CMS bulk upload |
| TC_CFG_043 | Positive | Make SM inactive (IS_ACTIVE=0) | CMS bulk upload |
| TC_CFG_044 | Positive | Update email (test1→test2@test.com) | CMS bulk upload |
| TC_CFG_045 | Positive | Search by name "Tester" — results > 0 | List page search |
| TC_CFG_046 | Positive | Search by phone "8888888888" — results > 0 | List page search |
| TC_CFG_047 | Negative | Invalid phone "123" — error or flagged row | CMS bulk upload |
| TC_CFG_048 | Negative | Duplicate email test2@test.com | CMS bulk upload |

**Test data used:** Role=`"Sales Manager"` | Name=`"Tester Anjali"` | Email=`test1@test.com`/`test2@test.com` | Phone=`8888888888`

## Key Technical Notes

- `buildSalesManagerFile(samplePath, rows)` helper builds the upload XLSX
- `downloadFinalExcel("Sales Managers")` gets server response file post-upload
- TC_CFG_045/046 go directly to `/admin/sales-managers` via `page.goto()` — do NOT use ConfigPage
- Server may return upload-result file OR direct toast — both paths handled in tests
- IS_AVAILABLE controls whether SM appears in customer assignment dropdowns
- IS_ACTIVE controls SM login access to sales portal

## Integration Points

| Module | Relationship |
|--------|-------------|
| [[Module - Config CMS]] | SM bulk upload lives in CMS Section 7 |
| [[Module - Customers]] | Assignable SMs appear in customer assignment dropdowns |
| [[Module - Channel Partners]] | Relationship unclear — see [[Open Questions#Sales Managers]] |

## Domain Red Flags

- **MEDIUM:** Privacy masking (email/phone/cost) in Settings is system-wide — affects ALL SMs simultaneously. No per-SM masking.
- **INFO:** Multiple SMs can share same email on UAT (load test data). Uniqueness behavior unclear.

## Not Yet Automated

| Feature | Notes |
|---------|-------|
| Add SM via modal UI | Only bulk upload tested; modal add/edit UI not automated |
| Settings masking toggles | Not automated — requires cross-portal verification |
| Column filters (Role / Assignable / Is Active) | Not automated |
| Pagination | Not automated |

→ See [[Open Questions#Sales Managers]] for unresolved clarifications
