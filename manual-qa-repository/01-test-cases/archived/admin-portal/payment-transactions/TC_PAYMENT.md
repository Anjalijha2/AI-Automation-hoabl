# TC_PAYMENT — Payment Transactions Module Test Cases

**Module:** Payment Transactions
**Portal:** XR Portal Admin (`https://uat-web.xrportal.in/admin/payment-transactions`)
**BA Sign-off:** Approved (2026-05-19)
**Total TCs:** 31
**Selector Source:** `locators/admin/locator-map.json` (section: `payment-transactions`)
**BRD:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Payment-Transactions.md`
**FRD:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FRD-Payment-Transactions.md`
**FS:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FS-Payment-Transactions.md`

---

## UI Tests

### TC_PAY_UI_001
**Title:** Payment Transactions page renders header elements
**Priority:** High
**Pre-conditions:** Admin session; navigate to `/admin/payment-transactions`
**Test Data:** N/A  
**Steps:**
1. Open `/admin/payment-transactions`
2. Inspect page header

**Expected:** Heading "Transactions"; total count label "Total N Payment Transactions"; Date range picker, Search box, Refresh, Export, Settings buttons visible
**Automatable:** Yes

---

### TC_PAY_UI_002
**Title:** Transactions table renders 14 columns
**Priority:** High
**Pre-conditions:** Page open with >=1 row
**Test Data:** N/A  
**Steps:**
1. Open transactions page
2. Inspect table header

**Expected:** Columns present — Sr. No., Registration No., Transaction ID, Source, Status, Unit Reg No., Customer Name, Phone, Payment Type, Amount Paid, Payment Date, Method, Created By, Actions
**Automatable:** Yes

---

### TC_PAY_UI_003
**Title:** Default pagination shows 10 records
**Priority:** Medium
**Pre-conditions:** >10 transactions exist
**Test Data:** N/A  
**Steps:**
1. Open transactions page
2. Count table rows; read pagination label

**Expected:** Max 10 rows displayed; label "1-10 of N records"
**Automatable:** Yes

---

### TC_PAY_UI_004
**Title:** Payment Gateway Configuration modal renders
**Priority:** High
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Click "Settings" button

**Expected:** Modal "Payment Gateway Configuration" opens with Easebuzz checkbox, Razorpay checkbox, Update button
**Automatable:** Yes

---

## Functional Tests

### TC_PAY_FUNC_001
**Title:** Table loads with most-recent-first sort by default
**Priority:** High
**Pre-conditions:** Transactions page open
**Test Data:** N/A  
**Steps:**
1. Open page
2. Inspect first 5 rows' Payment Date column

**Expected:** Payment Date descending — newest first (per FRD §11 default sort)
**Automatable:** Yes

---

### TC_PAY_FUNC_002
**Title:** Filter by Source = Online easebuzz
**Priority:** High
**Pre-conditions:** Transactions page open
**Test Data:** N/A  
**Steps:**
1. Click Source column filter
2. Select "Online easebuzz"

**Expected:** Table shows only easebuzz transactions; count badge updates
**Automatable:** Yes

---

### TC_PAY_FUNC_003
**Title:** Filter by Status = completed
**Priority:** High
**Pre-conditions:** Transactions page open
**Test Data:** N/A  
**Steps:**
1. Click Status column filter
2. Select "completed"

**Expected:** Table shows only completed transactions
**Automatable:** Yes

---

### TC_PAY_FUNC_004
**Title:** Date range filter limits results to range
**Priority:** High
**Pre-conditions:** Transactions across multiple dates exist
**Test Data:** N/A  
**Steps:**
1. Set Start Date = today - 7 days
2. Set End Date = today
3. Apply

**Expected:** Only transactions with Payment Date within range shown; count badge updates
**Automatable:** Yes

---

### TC_PAY_FUNC_005
**Title:** Free-text search by Customer Name returns matches
**Priority:** High
**Pre-conditions:** Customer "Anjali" exists in dataset
**Test Data:** N/A  
**Steps:**
1. Type `Anjali` in search box
2. Press Enter

**Expected:** Table filters to rows containing "Anjali" in Customer Name
**Automatable:** Yes

---

### TC_PAY_FUNC_006
**Title:** Free-text search by Registration No.
**Priority:** High
**Pre-conditions:** Registration `GHNG-1000008563` exists
**Test Data:** N/A  
**Steps:**
1. Type `GHNG-1000008563` in search box
2. Press Enter

**Expected:** Only matching row displayed
**Automatable:** Yes

---

### TC_PAY_FUNC_007
**Title:** Combined filters (Source + Status + Date) work together
**Priority:** Medium
**Pre-conditions:** Transactions page open
**Test Data:** N/A  
**Steps:**
1. Filter Source = easebuzz
2. Filter Status = completed
3. Set date range

**Expected:** Table shows intersection of all three filters; count badge reflects filtered subset
**Automatable:** Yes

---

### TC_PAY_FUNC_008
**Title:** Sort by Amount Paid ascending
**Priority:** Medium
**Pre-conditions:** >5 transactions
**Test Data:** N/A  
**Steps:**
1. Click Amount Paid header

**Expected:** Rows sorted ascending by amount
**Automatable:** Yes

---

### TC_PAY_FUNC_009
**Title:** Sort by Payment Date toggles asc/desc
**Priority:** Medium
**Pre-conditions:** Transactions page open
**Test Data:** N/A  
**Steps:**
1. Click Payment Date header once
2. Click again

**Expected:** First click sorts ascending; second click sorts descending
**Automatable:** Yes

---

### TC_PAY_FUNC_010
**Title:** Refresh button reloads data
**Priority:** Medium
**Pre-conditions:** Transactions page open
**Test Data:** N/A  
**Steps:**
1. Click Refresh button

**Expected:** Network request observed; table re-renders; filters remain applied
**Automatable:** Yes

---

### TC_PAY_FUNC_011
**Title:** Export button triggers file download
**Priority:** High
**Pre-conditions:** Transactions page open
**Test Data:** N/A  
**Steps:**
1. Click Export button
2. Observe browser download

**Expected:** File download triggered (CSV or XLSX per Q-TXN-001); browser receives file
**Automatable:** Yes

---

### TC_PAY_FUNC_012
**Title:** Pagination navigation moves through pages
**Priority:** Medium
**Pre-conditions:** >20 transactions
**Test Data:** N/A  
**Steps:**
1. Click next page in pagination
2. Read pagination label

**Expected:** Label updates to "11-20 of N records"; new rows shown
**Automatable:** Yes

---

## Validation Tests

### TC_PAY_VAL_001
**Title:** End date before start date rejected or normalized
**Priority:** Medium
**Pre-conditions:** Date range picker open
**Test Data:** N/A  
**Steps:**
1. Set Start Date = today
2. Set End Date = yesterday
3. Apply

**Expected:** Validation error OR picker auto-normalizes range; no invalid query sent
**Automatable:** Yes

---

### TC_PAY_VAL_002
**Title:** Empty search input returns full list
**Priority:** Low
**Pre-conditions:** Filter applied via search previously
**Test Data:** N/A  
**Steps:**
1. Clear search box
2. Press Enter

**Expected:** Table restores full unfiltered list; count reverts to total
**Automatable:** Yes

---

### TC_PAY_VAL_003
**Title:** Gateway settings — at-least-one-active guard
**Priority:** Critical
**Pre-conditions:** Both gateways currently enabled
**Test Data:** N/A  
**Steps:**
1. Open Settings modal
2. Uncheck both Easebuzz and Razorpay
3. Click Update

**Expected:** Server rejects with error "At least one payment gateway must remain active"; configuration NOT saved (per BRD §6 BR3, FS Feature 4 §6 BR1)
**Automatable:** Yes

---

## Negative Tests

### TC_PAY_NEG_001
**Title:** Unauthenticated access redirects to login
**Priority:** High
**Pre-conditions:** No session
**Test Data:** N/A  
**Steps:**
1. Clear cookies
2. Navigate to `/admin/payment-transactions`

**Expected:** Redirected to login page
**Automatable:** Yes

---

### TC_PAY_NEG_002
**Title:** Search with zero-match returns empty state
**Priority:** Low
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Search for `ZZZ_NOMATCH_XYZ`
2. Press Enter

**Expected:** Empty table state shown; no rows; count badge shows 0
**Automatable:** Yes

---

### TC_PAY_NEG_003
**Title:** No create/edit/delete operations exist
**Priority:** High
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Inspect entire page for Add/Edit/Delete buttons on rows

**Expected:** No create / edit / delete controls in Actions column or page header (read-only per BRD §2, FS Feature 1 §2)
**Automatable:** Yes

---

## Edge Cases

### TC_PAY_EDGE_001
**Title:** Page loads under 5s with 10,000+ records (AC-TXN-001)
**Priority:** High
**Pre-conditions:** Dataset of 10,000+ transactions (UAT has 10,226)
**Test Data:** N/A  
**Steps:**
1. Navigate to `/admin/payment-transactions`
2. Measure time-to-interactive

**Expected:** Page interactive within 5 seconds; pagination renders correctly
**Automatable:** Yes

---

### TC_PAY_EDGE_002
**Title:** Eye icon shows "Detail view coming soon" tooltip
**Priority:** Low
**Pre-conditions:** Page open with >=1 row
**Test Data:** N/A  
**Steps:**
1. Hover/click eye icon on a row

**Expected:** Tooltip "Detail view coming soon" shown; no navigation; no JS error (per BRD §9, AC-TXN-007)
**Automatable:** Yes

---

### TC_PAY_EDGE_003
**Title:** Date range across very large window (1 year)
**Priority:** Low
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Set Start = today - 365 days, End = today
2. Apply

**Expected:** Query completes without error; table renders; count badge updates
**Automatable:** Yes

---

## Business Rule Tests

### TC_PAY_BIZ_001
**Title:** Transactions module is read-only (no destructive operations)
**Priority:** Critical
**Pre-conditions:** Page open with >=1 row
**Test Data:** N/A  
**Steps:**
1. Inspect each row's Actions column
2. Inspect header

**Expected:** No Edit / Delete / Cancel buttons; only Eye icon (read-only ledger per BRD §2 + BR1)
**Automatable:** Yes

---

### TC_PAY_BIZ_002
**Title:** Count badge updates dynamically when filters applied
**Priority:** High
**Pre-conditions:** Total count N visible
**Test Data:** N/A  
**Steps:**
1. Apply Status=completed filter
2. Re-read count badge

**Expected:** Count badge reflects filtered subset (not original N) — per BRD/BR3
**Automatable:** Yes

---

### TC_PAY_BIZ_003
**Title:** Gateway configuration changes take effect immediately
**Priority:** Critical
**Pre-conditions:** Both gateways enabled; non-production environment
**Test Data:** N/A  
**Steps:**
1. Open Settings, disable Razorpay only
2. Click Update
3. Re-open Settings modal

**Expected:** Razorpay checkbox unchecked persists; change applied without confirmation dialog (per BRD §6 BR4, FS Feature 4 §6 BR2)
**Automatable:** Partial (requires teardown to restore)

---

### TC_PAY_BIZ_004
**Title:** "completed" status indicates locked booking
**Priority:** High
**Pre-conditions:** Transaction with status=completed exists
**Test Data:** N/A  
**Steps:**
1. Note Registration No. and Unit Reg No. of a completed transaction
2. Cross-check Allocation module: unit allocationStatus

**Expected:** Associated unit shows allocationStatus = 'confirmed' (per BRD §6 BR1 + FRD §10 status flow)
**Automatable:** Partial (cross-module)

---

## End-to-End Tests

### TC_PAY_E2E_001
**Title:** Full reconciliation workflow — filter, export, verify
**Priority:** Critical
**Pre-conditions:** Admin session
**Test Data:** N/A  
**Steps:**
1. Navigate to `/admin/payment-transactions`
2. Apply date range = last 7 days, Status = completed
3. Note count
4. Click Export, wait for download
5. Open downloaded file
6. Verify row count matches displayed count

**Expected:** Filtered data exports; downloaded file row count matches UI count badge
**Automatable:** Yes

---

## API Tests

### TC_PAY_API_001
**Title:** GET payment-transactions returns paginated list
**Priority:** High
**Pre-conditions:** Admin JWT
**Test Data:** N/A  
**Steps:**
1. `GET /api/v1/admin/payment-transactions?page=1&limit=10`

**Expected:** 200 OK; items array (<=10), total, page, limit fields present
**Automatable:** Yes

---

### TC_PAY_API_002
**Title:** GET payment-transactions with filter params
**Priority:** High
**Pre-conditions:** Admin JWT
**Test Data:** N/A  
**Steps:**
1. `GET /api/v1/admin/payment-transactions?source=easebuzz&status=completed&page=1&limit=10`

**Expected:** 200 OK; all returned items have source=easebuzz and status=completed
**Automatable:** Yes

---

### TC_PAY_API_003
**Title:** GET payment-gateways returns gateway configuration
**Priority:** High
**Pre-conditions:** Admin JWT
**Test Data:** N/A  
**Steps:**
1. `GET /api/v1/admin/payment-gateways`

**Expected:** 200 OK; response includes Easebuzz and Razorpay configuration with enabled state
**Automatable:** Yes

---

### TC_PAY_API_004
**Title:** PUT payment-gateways rejects disabling both gateways
**Priority:** Critical
**Pre-conditions:** Admin JWT
**Test Data:** N/A  
**Steps:**
1. `PUT /api/v1/admin/payment-gateways` with both Easebuzz and Razorpay disabled

**Expected:** 400 Bad Request; error message "At least one payment gateway must remain active" (per FRD §11 + FS Feature 4 §6 BR1)
**Automatable:** Yes

---

## Automation Coverage

| TC | Automatable | Spec |
|----|-------------|------|
| TC_PAY_UI_001-004 | Yes | `tests/ui-ux/admin/payment-transactions.spec.js` |
| TC_PAY_FUNC_001-012 | Yes | `tests/e2e/admin/payment-transactions.spec.js` |
| TC_PAY_VAL_001-003 | Yes | `tests/e2e/admin/payment-transactions.spec.js` |
| TC_PAY_NEG_001-003 | Yes | `tests/e2e/admin/payment-transactions.spec.js` |
| TC_PAY_EDGE_001-003 | Yes | `tests/e2e/admin/payment-transactions.spec.js` |
| TC_PAY_BIZ_001-002 | Yes | `tests/regression/admin/payment-transactions.spec.js` |
| TC_PAY_BIZ_003 | Partial | Destructive — gated |
| TC_PAY_BIZ_004 | Partial | Cross-module |
| TC_PAY_E2E_001 | Yes | `tests/e2e/admin/payment-transactions.spec.js` |
| TC_PAY_API_001-004 | Yes | `tests/api/payment-transactions.api.spec.js` |
