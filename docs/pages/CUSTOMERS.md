# CUSTOMERS PAGE

## Description
Main dashboard after login showing customer registrations, summary stat cards, and a data table of all registration records. Includes workflows for checking KPIs, Home Loan Approvals, Cancellation, Filtering, and Downloading.

## URL
https://uat-web.xrportal.in/admin/customers

## Requires Auth
Yes. Session must be initialized via `auth.setup.ts`.

## Element Selectors
Loaded from `docs/selectors/customers.json`.
Includes new locators for: Allocation Status, Process Status, Cancellation Modals, and Home Loan Modals.

## Workflows

### 1. KPI Verification
1.  Verify table count matches 'Registered' KPI when: Booked Offline + Booked Online + Registered + Inactive are filtered.
2.  Verify table count matches 'Inactive' KPI when 'Inactive' is filtered.
3.  Verify table count matches 'Cancelled' KPI when 'Cancelled' is filtered.
4.  Verify table count matches 'KYC Pending' KPI when 'Booked' + 'KYC Pending' are filtered.
5.  Verify table count matches 'Confirmed' KPI when 'Booked' + 'KYC Completed' are filtered.

### 2. Cancel Registration
1. Find a 'Registered' record. Click Delete (trash) icon.
2. Confirm Refund modal appears validating Unit & Amount ₹999.
3. Click 'Cancel Registration' red button.
4. Verify success toast and status change to Cancelled.

### 3. Home Loan Approval
1. Click 3-dot menu and select 'Home Loan Approval'.
2. Modal shows Registration Number and Apartment Type.
3. Toggle 'Enable Home Loan' and submit.

### 4. Filtering & Pagination
1. Filter via Status dropdowns (Allocation / Process).
2. Filter via Inline Search Boxes (Registration Details, Growth Partner HV Code, Confirmation Number, Alloted Unit).
3. Reset Filters.
4. Verify Pagination sizes (10, 20, 50, 100).

### 5. Download
1. Click Download.
2. Exported xlsx must have correct columns and data.

## Page Object File
`automation/pages/customers.page.ts`

## Automation Test File
`automation/tests/customers.spec.ts`

## Changelog

| Date | Change |
|------|--------|
| 2026-03-15 | BUG_001–009 resolved. All 16 tests pass (17/17 with auth). KPI selectors switched to `getByRole+xpath`. `getTableRecordCount()` fixed to read `h3 "X Registration Records"` heading. `navigate()` adds `waitForNetworkIdle()`. Filter OK button scoped to open dropdown via `clickOpenFilterOkBtn()`. |
| 2026-03-15 | TC_CUST_006 updated — real cross-page BRD validation (Customers KPI vs Config green toggles). TC_CUST_017 added — Active Towers live update test (activate tower → verify KPI +1 → cleanup). ConfigPage created. Total: 17 automated tests. |
| 2026-03-15 | TC_CUST_015 updated — now saves file to disk, reads with xlsx, verifies all 17 actual column names + row count > 0, then deletes file. BRD column names were descriptive groupings; updated to real Excel headers from `RegistrationData.xlsx`. |
| 2026-03-15 | TC_CUST_015 close logic updated — added `taskkill /F /IM et.exe` and `taskkill /F /IM wps.exe` after the Excel COM block to also close WPS Office (default spreadsheet app on this machine). WPS processes: `et.exe` = WPS Spreadsheets, `wps.exe` = WPS Office hub. |
| 2026-03-15 | TC_CUST_016 fully rewritten — covers all BRD steps: default 10/page, all 4 page sizes (10/20/50/100), page number navigation (2,3,4), last page navigation. Added `scrollToPagination()`, `clickPageNumber()`, `navigateToLastPage()`, `getVisibleRowCount()` to CustomersPage. Key pattern: always call `scrollToPagination()` before pagination interactions. |
| 2026-03-15 | `scrollToPagination()` reverted to `scrollIntoView({ block:'end' })`. `playwright.config.ts` viewport height changed 1080 → 900. Root cause: `.ant-layout-content` height = viewport − header = 1016px at 1080px viewport; after scroll, pagination landed at y=1040 which is 100px below the physical screen edge (~940px after browser chrome). With 900px viewport, `.ant-layout-content` = 836px, pagination lands at y=860 — visibly within 940px physical area. |