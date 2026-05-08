---
type: module
module: Customers
url: https://uat-web.xrportal.in/admin/customers
sprint: 1
status: Automated
spec: tests/ui/customers.spec.js
tcs: TC-CST-001–017
tags: [module, customers, automated]
updated: 2026-05-08
---

# Module: Customers

## Overview

Main registration dashboard showing all customer registrations. Includes KPI cards, data table, filtering, download, cancel registration, and home loan approval workflows.

**URL:** `https://uat-web.xrportal.in/admin/customers`  
**Auth:** Required — `src/fixtures/.auth/admin.json`  
**Page Object:** `src/pages/CustomersPage.js` (fixture-based — via `testFixture.js`)

## Page Structure

### KPI Cards (top)
| Card | Metric |
|------|--------|
| Registered | Count of Active registrations (Booked Offline + Booked Online + Registered + Inactive) |
| Inactive | Count of Inactive registrations |
| Cancelled | Count of Cancelled registrations |
| KYC Pending | Count of Booked + KYC Pending |
| Confirmed | Count of Booked + KYC Completed |
| Active Towers | Count of towers with Active toggle in Config |

### Table
`"X Registration Records"` heading (h3) = total count  
Columns: Registration Number | Status | Process Status | Home Loan | Allotted Unit | Confirmation Number | Growth Partner HV Code

### Filters
- Allocation Status dropdown (Registered / Booked / Inactive / Cancelled)
- Process Status dropdown (KYC Pending / KYC Completed / etc.)
- Inline search boxes: Registration Details | Growth Partner HV Code | Confirmation Number | Allotted Unit
- Pagination: 10 / 20 / 50 / 100 per page

## Automated Tests

| TC | Priority | Description |
|----|----------|-------------|
| TC-CST-001 | P1 | KPI — Registered Count matches filtered table |
| TC-CST-002 | P1 | KPI — Inactive Count |
| TC-CST-003 | P1 | KPI — Cancelled Count |
| TC-CST-004 | P1 | KPI — KYC Pending Count |
| TC-CST-005 | P1 | KPI — Confirmed Count |
| TC-CST-006 | P1 | KPI — Active Towers (cross-module with Config) |
| TC-CST-007 | P1 | Cancel Registration flow → refund toast → status = Cancelled |
| TC-CST-008 | P2 | Home Loan Approval flow (toggle enable) |
| TC-CST-009 | P2 | ENV SKIP — no Sold units in UAT |
| TC-CST-013 | P2 | ENV SKIP — no Available registration in UAT |
| TC-CST-014 | P1 | Reset Filters restores full count |
| TC-CST-015 | P2 | Download → Excel has correct 17 column headers |
| TC-CST-016 | P2 | Pagination: 10/20/50/100 per page + page navigation |
| TC-CST-017 | P2 | Active Towers KPI live update (activate tower → KPI +1 → cleanup) |

## Key Technical Notes

- KPI selectors: `getByRole('heading')` + XPath sibling — NOT `.ant-statistic`
- `getTableRecordCount()` reads `h3 "X Registration Records"` heading — NOT tbody row count
- Filter OK button scoped to `.ant-dropdown:not(.ant-dropdown-hidden)` (avoids hidden dropdown)
- `scrollToPagination()` must be called before pagination interactions — uses `scrollIntoView({block:'end'})`
- Download test: reads XLSX with `xlsx` library; expected headers = real column names from `RegistrationData.xlsx` (NOT BRD descriptions)
- TC-CST-015 closes WPS Office: `taskkill /F /IM et.exe` + `taskkill /F /IM wps.exe`
- Cancel Registration: trash icon → refund modal (unit + ₹999) → "Cancel Registration" red button → toast "refunded successfully"
- Home Loan Approval: 3-dot menu → "Home Loan Approval" → toggle enable → submit

## Download Column Headers (actual Excel)
17 columns — exact names from `RegistrationData.xlsx` (not BRD labels). Verified by TC-CST-015.

## Integration Points

| Module | Relationship |
|--------|-------------|
| [[Module - Config CMS]] | TC-CST-006 and TC-CST-017 cross-check Active Towers KPI against Config toggles |
| [[Module - Allocation]] | Allocation status and unit assignment reflected in customer table |
| [[Module - Sales Managers]] | SMs assigned to customers via SM assignment dropdown |
