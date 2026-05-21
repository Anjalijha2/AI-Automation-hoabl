# Execution Summary — Admin Portal

## Run Metadata

| Field | Value |
|-------|-------|
| Portal | admin |
| Sprint | 1 |
| Run Date | 2026-05-21 |
| Environment | UAT |
| Duration | 238.0s |
| Executor | QA Agent |

## Summary

| Metric | Count |
|--------|-------|
| Total TCs | 31 |
| Passed | 4 |
| Failed | 27 |
| Skipped | 0 |
| Pass Rate | 13% |

## Per-Test Results

| TC_ID | Title | Project | Status | Duration | Failure Reason |
|-------|-------|---------|--------|----------|---------------|
| — | authenticate as admin | auth-setup | ✅ PASS | 8.0s | — |
| — | authenticate as sales manager | auth-setup | ✅ PASS | 6.9s | — |
| — | authenticate as channel partner | auth-setup | ✅ PASS | 6.0s | — |
| — | authenticate as buyer | auth-setup | ✅ PASS | 9.6s | — |
| TC_CUST_FUNC_001 | TC_CUST_FUNC_001 — BRD-CUST §3 — Customers page loads as default post-login | e2e | ❌ FAIL | 0.2s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_CUST_FUNC_002 | TC_CUST_FUNC_002 — BRD-CUST §3 — Sidebar navigation opens Customers module | e2e | ❌ FAIL | 0.2s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_CUST_FUNC_003 | TC_CUST_FUNC_003 — BRD-CUST §5 — Search by Phone filters registration table | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_CUST_FUNC_004 | TC_CUST_FUNC_004 — BRD-CUST §5 — Filter by Allocation Status returns matching rows | e2e | ❌ FAIL | 0.2s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_CUST_FUNC_005 | TC_CUST_FUNC_005 — BRD-CUST §5 — Reset Filters restores full record list | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_CUST_FUNC_006 | TC_CUST_FUNC_006 — BRD-CUST §5/§6 BR3 — Cancel Registration flow refunds ₹999 and updates status | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_CUST_FUNC_007 | TC_CUST_FUNC_007 — BRD-CUST §5 — Home Loan Approval toggle marks loan approved | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_CUST_FUNC_008 | TC_CUST_FUNC_008 — BRD-CUST §5/§6 BR5 — Download exports RegistrationData.xlsx | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_CUST_FUNC_009 | TC_CUST_FUNC_009 — BRD-CUST §5 — Refresh button reloads table data without navigation | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_CUST_REG_002 | TC_CUST_REG_002 — BRD-CUST §6 BR1/BR4 — KPI counts stable after filter+reset cycle | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_CUST_NEG_002 | TC_CUST_NEG_002 — BRD-CUST §5 — Search by non-existent phone returns empty result | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_FUNC_001 | TC_LOGIN_FUNC_001 — ADMIN-BRD-Login §5 — valid mobile + valid OTP → redirect to /admin/customers | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_FUNC_002 | TC_LOGIN_FUNC_002 — ADMIN-BRD-Login §5 — Send OTP transitions to OTP screen | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_FUNC_003 | TC_LOGIN_FUNC_003 — ADMIN-BRD-Login §6 rule 7 — session persists after page refresh | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_FUNC_004 | TC_LOGIN_FUNC_004 — ADMIN-FS-Login Feature3 — logout clears session and redirects to login | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_VAL_001 | TC_LOGIN_VAL_001 — ADMIN-BRD-Login §7 — empty mobile → Send OTP does nothing | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_VAL_002 | TC_LOGIN_VAL_002 — ADMIN-BRD-Login §7 — short mobile (5 digits) → OTP not sent | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_VAL_003 | TC_LOGIN_VAL_003 — ADMIN-BRD-Login §7 — empty OTP → Submit does not log in | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_VAL_004 | TC_LOGIN_VAL_004 — ADMIN-BRD-Login §7 — wrong OTP → error shown, stays on OTP screen | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_VAL_005 | TC_LOGIN_VAL_005 — ADMIN-BRD-Login §6 rule 2 — non-numeric chars blocked from mobile field | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_NEG_001 | TC_LOGIN_NEG_001 — ADMIN-BRD-Login §7 — all-zeros mobile rejected | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_NEG_002 | TC_LOGIN_NEG_002 — ADMIN-BRD-Login §7 — partial OTP (3 digits) → login rejected | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_NEG_003 | TC_LOGIN_NEG_003 — ADMIN-FS-Login Feature1 §3 — access /admin/customers without session → redirect to login | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_EDGE_001 | TC_LOGIN_EDGE_001 — ADMIN-BRD-Login §7 — mobile with spaces → trimmed or rejected | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_EDGE_002 | TC_LOGIN_EDGE_002 — ADMIN-BRD-Login §6 rule 3 — OTP box 5 digits only → login rejected | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_FUNC_BACK | TC_LOGIN_FUNC_BACK — ADMIN-BRD-Login §5 — back button returns to mobile screen | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |
| TC_LOGIN_E2E_001 | TC_LOGIN_E2E_001 — ADMIN-BRD-Login §5 — full login → navigate → logout flow | e2e | ❌ FAIL | 0.0s | Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport" |

## Failures Detail

### TC_CUST_FUNC_001

**Title:** TC_CUST_FUNC_001 — BRD-CUST §3 — Customers page loads as default post-login
**Project:** e2e
**File:** `e2e/admin/customers.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-customers-Customers--d335d-loads-as-default-post-login-e2e-retry1\trace.zip`

### TC_CUST_FUNC_002

**Title:** TC_CUST_FUNC_002 — BRD-CUST §3 — Sidebar navigation opens Customers module
**Project:** e2e
**File:** `e2e/admin/customers.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-customers-Customers--07bc9-tion-opens-Customers-module-e2e-retry1\trace.zip`

### TC_CUST_FUNC_003

**Title:** TC_CUST_FUNC_003 — BRD-CUST §5 — Search by Phone filters registration table
**Project:** e2e
**File:** `e2e/admin/customers.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-customers-Customers--5639b--filters-registration-table-e2e-retry1\trace.zip`

### TC_CUST_FUNC_004

**Title:** TC_CUST_FUNC_004 — BRD-CUST §5 — Filter by Allocation Status returns matching rows
**Project:** e2e
**File:** `e2e/admin/customers.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-customers-Customers--76aab-tatus-returns-matching-rows-e2e-retry1\trace.zip`

### TC_CUST_FUNC_005

**Title:** TC_CUST_FUNC_005 — BRD-CUST §5 — Reset Filters restores full record list
**Project:** e2e
**File:** `e2e/admin/customers.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-customers-Customers--5d822-s-restores-full-record-list-e2e-retry1\trace.zip`

### TC_CUST_FUNC_006

**Title:** TC_CUST_FUNC_006 — BRD-CUST §5/§6 BR3 — Cancel Registration flow refunds ₹999 and updates status
**Project:** e2e
**File:** `e2e/admin/customers.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-customers-Customers--eebe1-nds-₹999-and-updates-status-e2e-retry1\trace.zip`

### TC_CUST_FUNC_007

**Title:** TC_CUST_FUNC_007 — BRD-CUST §5 — Home Loan Approval toggle marks loan approved
**Project:** e2e
**File:** `e2e/admin/customers.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-customers-Customers--8b06d--toggle-marks-loan-approved-e2e-retry1\trace.zip`

### TC_CUST_FUNC_008

**Title:** TC_CUST_FUNC_008 — BRD-CUST §5/§6 BR5 — Download exports RegistrationData.xlsx
**Project:** e2e
**File:** `e2e/admin/customers.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-customers-Customers--9ea1f-ports-RegistrationData-xlsx-e2e-retry1\trace.zip`

### TC_CUST_FUNC_009

**Title:** TC_CUST_FUNC_009 — BRD-CUST §5 — Refresh button reloads table data without navigation
**Project:** e2e
**File:** `e2e/admin/customers.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-customers-Customers--081d9-ble-data-without-navigation-e2e-retry1\trace.zip`

### TC_CUST_REG_002

**Title:** TC_CUST_REG_002 — BRD-CUST §6 BR1/BR4 — KPI counts stable after filter+reset cycle
**Project:** e2e
**File:** `e2e/admin/customers.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-customers-Customers--248b0-le-after-filter-reset-cycle-e2e-retry1\trace.zip`

### TC_CUST_NEG_002

**Title:** TC_CUST_NEG_002 — BRD-CUST §5 — Search by non-existent phone returns empty result
**Project:** e2e
**File:** `e2e/admin/customers.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-customers-Customers--d4364--phone-returns-empty-result-e2e-retry1\trace.zip`

### TC_LOGIN_FUNC_001

**Title:** TC_LOGIN_FUNC_001 — ADMIN-BRD-Login §5 — valid mobile + valid OTP → redirect to /admin/customers
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--bfce0-redirect-to-admin-customers-e2e-retry1\trace.zip`

### TC_LOGIN_FUNC_002

**Title:** TC_LOGIN_FUNC_002 — ADMIN-BRD-Login §5 — Send OTP transitions to OTP screen
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--5ebd7-P-transitions-to-OTP-screen-e2e-retry1\trace.zip`

### TC_LOGIN_FUNC_003

**Title:** TC_LOGIN_FUNC_003 — ADMIN-BRD-Login §6 rule 7 — session persists after page refresh
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--7f1eb-persists-after-page-refresh-e2e-retry1\trace.zip`

### TC_LOGIN_FUNC_004

**Title:** TC_LOGIN_FUNC_004 — ADMIN-FS-Login Feature3 — logout clears session and redirects to login
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--98d16-sion-and-redirects-to-login-e2e-retry1\trace.zip`

### TC_LOGIN_VAL_001

**Title:** TC_LOGIN_VAL_001 — ADMIN-BRD-Login §7 — empty mobile → Send OTP does nothing
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--a0c0b-ile-→-Send-OTP-does-nothing-e2e-retry1\trace.zip`

### TC_LOGIN_VAL_002

**Title:** TC_LOGIN_VAL_002 — ADMIN-BRD-Login §7 — short mobile (5 digits) → OTP not sent
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--43fd0-ile-5-digits-→-OTP-not-sent-e2e-retry1\trace.zip`

### TC_LOGIN_VAL_003

**Title:** TC_LOGIN_VAL_003 — ADMIN-BRD-Login §7 — empty OTP → Submit does not log in
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--337af-TP-→-Submit-does-not-log-in-e2e-retry1\trace.zip`

### TC_LOGIN_VAL_004

**Title:** TC_LOGIN_VAL_004 — ADMIN-BRD-Login §7 — wrong OTP → error shown, stays on OTP screen
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--8a4f6-r-shown-stays-on-OTP-screen-e2e-retry1\trace.zip`

### TC_LOGIN_VAL_005

**Title:** TC_LOGIN_VAL_005 — ADMIN-BRD-Login §6 rule 2 — non-numeric chars blocked from mobile field
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--49639-s-blocked-from-mobile-field-e2e-retry1\trace.zip`

### TC_LOGIN_NEG_001

**Title:** TC_LOGIN_NEG_001 — ADMIN-BRD-Login §7 — all-zeros mobile rejected
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--adc69-—-all-zeros-mobile-rejected-e2e-retry1\trace.zip`

### TC_LOGIN_NEG_002

**Title:** TC_LOGIN_NEG_002 — ADMIN-BRD-Login §7 — partial OTP (3 digits) → login rejected
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--7baad-P-3-digits-→-login-rejected-e2e-retry1\trace.zip`

### TC_LOGIN_NEG_003

**Title:** TC_LOGIN_NEG_003 — ADMIN-FS-Login Feature1 §3 — access /admin/customers without session → redirect to login
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--7deb2-session-→-redirect-to-login-e2e-retry1\trace.zip`

### TC_LOGIN_EDGE_001

**Title:** TC_LOGIN_EDGE_001 — ADMIN-BRD-Login §7 — mobile with spaces → trimmed or rejected
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--91dac-paces-→-trimmed-or-rejected-e2e-retry1\trace.zip`

### TC_LOGIN_EDGE_002

**Title:** TC_LOGIN_EDGE_002 — ADMIN-BRD-Login §6 rule 3 — OTP box 5 digits only → login rejected
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--aba82-igits-only-→-login-rejected-e2e-retry1\trace.zip`

### TC_LOGIN_FUNC_BACK

**Title:** TC_LOGIN_FUNC_BACK — ADMIN-BRD-Login §5 — back button returns to mobile screen
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--4af52-on-returns-to-mobile-screen-e2e-retry1\trace.zip`

### TC_LOGIN_E2E_001

**Title:** TC_LOGIN_E2E_001 — ADMIN-BRD-Login §5 — full login → navigate → logout flow
**Project:** e2e
**File:** `e2e/admin/login.spec.js`
**Error:**
```
Error: browser.newContext: "deviceScaleFactor" option is not supported with null "viewport"
```
**Attachments:**
- `test-results\admin-login-Login-—-Admin--15487-in-→-navigate-→-logout-flow-e2e-retry1\trace.zip`

## Coverage Map

Specs executed this run: **31** across project(s): auth-setup, e2e

_Full BRD/FRD requirement traceability is maintained per TC_ID in the test titles above._
