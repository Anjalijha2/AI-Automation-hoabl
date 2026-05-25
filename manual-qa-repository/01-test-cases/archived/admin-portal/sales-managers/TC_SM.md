# TC_SM — Sales Managers Module Test Cases

**Module:** Sales Managers  
**Portal:** XR Portal Admin (`https://uat-web.xrportal.in/admin/sales-managers`)  
**BA Sign-off:** Approved (2026-05-19)  
**Total TCs:** 32  
**Selector Source:** `locators/admin/locator-map.json` (section: `sales-managers`)  
**BRD:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Sales-Managers.md`  
**FRD:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FRD-Sales-Managers.md`  
**FS:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FS-Sales-Managers.md`

---

## UI Tests

### TC_SM_UI_001
**Title:** Sales Managers list page renders header and core controls
**Priority:** High
**Pre-conditions:** Admin logged in; navigate to `/admin/sales-managers`
**Test Data:** N/A  
**Steps:**
1. Open `/admin/sales-managers`
2. Inspect page header

**Expected:** Heading "Sales Managers" visible; total count badge (e.g. "26 Sales Managers") visible; Search input, Settings button, "Add Sales Manager" button rendered
**Automatable:** Yes

---

### TC_SM_UI_002
**Title:** SM table renders all 9 columns
**Priority:** High
**Pre-conditions:** SM list page open with >=1 row
**Test Data:** N/A  
**Steps:**
1. Open `/admin/sales-managers`
2. Observe table header

**Expected:** Columns present in order — First Name, Last Name, Email, Phone, Role, Assignable, Is Active, Created At, Actions
**Automatable:** Yes

---

### TC_SM_UI_003
**Title:** Pagination defaults to 10 per page
**Priority:** Medium
**Pre-conditions:** >10 SM records exist
**Test Data:** N/A  
**Steps:**
1. Open `/admin/sales-managers`
2. Count rows in initial table

**Expected:** Max 10 rows visible; pagination control shows multiple pages
**Automatable:** Yes

---

### TC_SM_UI_004
**Title:** Add Sales Manager modal renders all 7 fields
**Priority:** High
**Pre-conditions:** SM list page open
**Test Data:** N/A  
**Steps:**
1. Click "Add Sales Manager"
2. Observe modal

**Expected:** Modal opens with First Name, Last Name, Email, Phone, Role (dropdown), Assignable (toggle, default ON), Is Active (toggle, default ON), Submit + Cancel buttons
**Automatable:** Yes

---

### TC_SM_UI_005
**Title:** Settings modal renders 3 masking toggles
**Priority:** High
**Pre-conditions:** SM list page open
**Test Data:** N/A  
**Steps:**
1. Click "Settings" button
2. Observe modal

**Expected:** Modal opens with Email Masking, Phone Masking, Cost Masking toggles
**Automatable:** Yes

---

## Functional Tests

### TC_SM_FUNC_001
**Title:** Add new SM via modal (happy path)
**Priority:** Critical
**Pre-conditions:** Admin session; unique phone available
**Test Data:** N/A  
**Steps:**
1. Click "Add Sales Manager"
2. Fill First Name=`Tester`, Last Name=`Anjali`, Email=`test1@test.com`, Phone=`9000000001`, Role=`Sales Manager`
3. Leave Assignable ON, Is Active ON
4. Click Submit

**Expected:** Success toast; modal closes; new SM appears in list; count badge increments by 1
**Automatable:** Yes

---

### TC_SM_FUNC_002
**Title:** Edit existing SM updates fields
**Priority:** High
**Pre-conditions:** Existing SM row visible
**Test Data:** N/A  
**Steps:**
1. Click Edit (pencil) on an SM row
2. Change Email from `test1@test.com` to `test2@test.com`
3. Click Update

**Expected:** Success toast; modal closes; table row reflects new email
**Automatable:** Yes

---

### TC_SM_FUNC_003
**Title:** Toggle Assignable OFF removes SM from dropdowns
**Priority:** High
**Pre-conditions:** SM with Assignable=ON exists
**Test Data:** N/A  
**Steps:**
1. Edit SM
2. Set Assignable toggle OFF
3. Click Update

**Expected:** Success toast; Assignable column shows "No" / "Off"; SM no longer appears in customer assignment dropdown (cross-check via Customers module)
**Automatable:** Yes

---

### TC_SM_FUNC_004
**Title:** Toggle Is Active OFF disables SM login
**Priority:** High
**Pre-conditions:** SM with Is Active=ON exists
**Test Data:** N/A  
**Steps:**
1. Edit SM
2. Set Is Active toggle OFF
3. Click Update

**Expected:** Success toast; Is Active column shows "No" / "Off"
**Automatable:** Yes

---

### TC_SM_FUNC_005
**Title:** Search by First Name returns matching SMs
**Priority:** High
**Pre-conditions:** SM with First Name containing "Tester" exists
**Test Data:** N/A  
**Steps:**
1. Type `Tester` in search input
2. Press Enter

**Expected:** Table filters to only rows containing "Tester" in name fields
**Automatable:** Yes

---

### TC_SM_FUNC_006
**Title:** Search by phone returns matching SM
**Priority:** High
**Pre-conditions:** SM with phone `8888888888` exists
**Test Data:** N/A  
**Steps:**
1. Type `8888888888` in search input
2. Press Enter

**Expected:** Table shows only matching SM row
**Automatable:** Yes

---

### TC_SM_FUNC_007
**Title:** Column filter on Assignable=No shows only inactive-assignable SMs
**Priority:** Medium
**Pre-conditions:** At least 1 SM with Assignable=OFF exists
**Test Data:** N/A  
**Steps:**
1. Click filter icon on Assignable column
2. Select "No"

**Expected:** Table filters to only Assignable=No rows
**Automatable:** Yes

---

### TC_SM_FUNC_008
**Title:** Column filter on Is Active=No shows only deactivated SMs
**Priority:** Medium
**Pre-conditions:** At least 1 SM with Is Active=OFF exists
**Test Data:** N/A  
**Steps:**
1. Click filter icon on Is Active column
2. Select "No"

**Expected:** Table filters to only Is Active=No rows
**Automatable:** Yes

---

### TC_SM_FUNC_009
**Title:** Bulk upload — sample file download
**Priority:** High
**Pre-conditions:** Navigate to `/admin/cms` → Section 7 "Sales Managers"
**Test Data:** N/A  
**Steps:**
1. Click "Sample File Download"

**Expected:** XLSX file downloads with correct columns: Role, First Name, Last Name, Email, Phone, IS_AVAILABLE, IS_ACTIVE
**Automatable:** Yes

---

### TC_SM_FUNC_010
**Title:** Bulk upload creates new SM records
**Priority:** Critical
**Pre-conditions:** Prepared XLSX with 1 row containing unique phone
**Test Data:** N/A  
**Steps:**
1. Navigate to `/admin/cms` → Section 7
2. Click "Upload File", select file
3. Click Submit

**Expected:** Success toast (contains "upload" or "success"); new SM appears on `/admin/sales-managers`
**Automatable:** Yes

---

### TC_SM_FUNC_011
**Title:** Bulk upload updates existing SM (matched by phone)
**Priority:** Critical
**Pre-conditions:** Existing SM with phone `8888888888`; XLSX row uses same phone with different name
**Test Data:** N/A  
**Steps:**
1. Upload XLSX in CMS Section 7
2. Click Submit

**Expected:** No duplicate row created; existing SM record updated with new values
**Automatable:** Yes

---

## Validation Tests

### TC_SM_VAL_001
**Title:** First Name required validation
**Priority:** High
**Pre-conditions:** Add SM modal open
**Test Data:** N/A  
**Steps:**
1. Leave First Name blank
2. Fill remaining mandatory fields
3. Click Submit

**Expected:** Validation error on First Name field; submission blocked
**Automatable:** Yes

---

### TC_SM_VAL_002
**Title:** Email format validation
**Priority:** High
**Pre-conditions:** Add SM modal open
**Test Data:** N/A  
**Steps:**
1. Enter Email = `invalid-email`
2. Fill other fields
3. Click Submit

**Expected:** Validation error: invalid email format; submission blocked
**Automatable:** Yes

---

### TC_SM_VAL_003
**Title:** Phone must be 10 digits
**Priority:** High
**Pre-conditions:** Add SM modal open
**Test Data:** N/A  
**Steps:**
1. Enter Phone = `123`
2. Fill other fields
3. Click Submit

**Expected:** Validation error: phone must be 10 digits; submission blocked
**Automatable:** Yes

---

### TC_SM_VAL_004
**Title:** Role dropdown is mandatory
**Priority:** High
**Pre-conditions:** Add SM modal open
**Test Data:** N/A  
**Steps:**
1. Leave Role unselected
2. Fill other fields
3. Click Submit

**Expected:** Validation error on Role; submission blocked
**Automatable:** Yes

---

### TC_SM_VAL_005
**Title:** Bulk upload — invalid phone in row is flagged
**Priority:** High
**Pre-conditions:** XLSX with row containing Phone=`123`
**Test Data:** N/A  
**Steps:**
1. Upload XLSX in CMS Section 7
2. Submit

**Expected:** Error message or flagged row indicating invalid phone; SM not created for that row
**Automatable:** Yes

---

## Negative Tests

### TC_SM_NEG_001
**Title:** Non-XLSX file upload rejected
**Priority:** Medium
**Pre-conditions:** CMS Section 7 open
**Test Data:** N/A  
**Steps:**
1. Attempt to upload a `.txt` or `.csv` file
2. Submit

**Expected:** Error: only .xlsx files accepted; upload blocked
**Automatable:** Yes

---

### TC_SM_NEG_002
**Title:** Unauthenticated access to SM page redirects to login
**Priority:** High
**Pre-conditions:** No active session
**Test Data:** N/A  
**Steps:**
1. Clear cookies / storage state
2. Navigate to `/admin/sales-managers`

**Expected:** Redirected to login page
**Automatable:** Yes

---

### TC_SM_NEG_003
**Title:** Submit empty Add SM form
**Priority:** Medium
**Pre-conditions:** Add SM modal open
**Test Data:** N/A  
**Steps:**
1. Click Submit without filling any field

**Expected:** All mandatory fields show validation errors; no API call made
**Automatable:** Yes

---

## Edge Cases

### TC_SM_EDGE_001
**Title:** Search returns zero results
**Priority:** Low
**Pre-conditions:** SM list page open
**Test Data:** N/A  
**Steps:**
1. Search for non-existent name `ZZZ_NoSuchSM`
2. Press Enter

**Expected:** Empty state shown in table; no rows; count badge still shows total system count (per FS Feature 2 §5)
**Automatable:** Yes

---

### TC_SM_EDGE_002
**Title:** Pagination navigates to last page
**Priority:** Low
**Pre-conditions:** >20 SM records exist
**Test Data:** N/A  
**Steps:**
1. Click last page in pagination control

**Expected:** Last page loads with remaining rows; navigation buttons disabled correctly
**Automatable:** Yes

---

### TC_SM_EDGE_003
**Title:** Bulk upload with empty XLSX (header row only)
**Priority:** Low
**Pre-conditions:** XLSX with only header row, no data rows
**Test Data:** N/A  
**Steps:**
1. Upload empty XLSX
2. Submit

**Expected:** Either success with 0 records or informative error; no crash; no records created
**Automatable:** Yes

---

## Business Rule Tests

### TC_SM_BIZ_001
**Title:** No Delete button on SM rows (soft-deactivation only)
**Priority:** High
**Pre-conditions:** SM list page open
**Test Data:** N/A  
**Steps:**
1. Inspect Actions column on each row

**Expected:** Only Edit button present; no Delete button (per BRD §6 BR1, FS Feature 1 §6 BR2)
**Automatable:** Yes

---

### TC_SM_BIZ_002
**Title:** Privacy masking is system-wide (single toggle affects all SMs)
**Priority:** High
**Pre-conditions:** Settings modal open
**Test Data:** N/A  
**Steps:**
1. Toggle Cost Masking ON
2. Save
3. Re-open Settings modal

**Expected:** Cost Masking persists ON; per BRD §6 BR4 + FS Feature 6 — toggle applies system-wide; no per-SM masking option exists in UI
**Automatable:** Yes

---

### TC_SM_BIZ_003
**Title:** Phone is merge key in bulk upload (no duplicate created)
**Priority:** Critical
**Pre-conditions:** Existing SM with phone `8888888888`; XLSX row with same phone
**Test Data:** N/A  
**Steps:**
1. Upload XLSX
2. Verify list count after upload

**Expected:** No new row; existing record updated; total count unchanged (per BRD §6 BR5, FS Feature 7 §5)
**Automatable:** Yes

---

### TC_SM_BIZ_004
**Title:** Total count badge reflects system-wide total, not search result
**Priority:** Medium
**Pre-conditions:** SM list page; multiple SMs exist
**Test Data:** N/A  
**Steps:**
1. Note total count badge value
2. Search for a specific SM
3. Re-check badge value

**Expected:** Badge value unchanged after search (per FS Feature 2 §5)
**Automatable:** Yes

---

## End-to-End Tests

### TC_SM_E2E_001
**Title:** Full lifecycle — Create SM → Edit → Deactivate via list page
**Priority:** Critical
**Pre-conditions:** Admin session; unique phone available
**Test Data:** N/A  
**Steps:**
1. Navigate to `/admin/sales-managers`
2. Click "Add Sales Manager", create SM with unique phone
3. Verify SM in list
4. Edit SM, change email
5. Edit SM again, toggle Assignable OFF, Is Active OFF
6. Verify columns reflect new state

**Expected:** All operations succeed; SM record updated end-to-end; row visible with deactivated flags
**Automatable:** Yes

---

## API Tests

### TC_SM_API_001
**Title:** GET sales-managers list returns paginated response
**Priority:** High
**Pre-conditions:** Admin JWT
**Test Data:** N/A  
**Steps:**
1. `GET /api/v1/admin/sales-managers?page=1&limit=10`

**Expected:** 200 OK; response contains items array (length <=10), total, page, limit
**Automatable:** Yes

---

### TC_SM_API_002
**Title:** POST sales-managers/create creates new SM
**Priority:** Critical
**Pre-conditions:** Admin JWT; unique phone in payload
**Test Data:** N/A  
**Steps:**
1. `POST /api/v1/admin/sales-managers/create` with valid SM payload

**Expected:** 200/201; response contains new SM ID; `GET` confirms presence
**Automatable:** Yes

---

### TC_SM_API_003
**Title:** PUT sales-managers/update/:id updates SM
**Priority:** High
**Pre-conditions:** Admin JWT; existing SM ID
**Test Data:** N/A  
**Steps:**
1. `PUT /api/v1/admin/sales-managers/update/:id` with updated fields

**Expected:** 200 OK; record updated; subsequent GET reflects changes
**Automatable:** Yes

---

### TC_SM_API_004
**Title:** GET sales-manager-sample returns XLSX
**Priority:** Medium
**Pre-conditions:** Admin JWT
**Test Data:** N/A  
**Steps:**
1. `GET /api/v1/admin/sales-manager-sample`

**Expected:** 200 OK; Content-Type indicates spreadsheet; binary body returned
**Automatable:** Yes

---

## Automation Coverage

| TC | Automatable | Spec |
|----|-------------|------|
| TC_SM_UI_001-005 | Yes | `tests/ui-ux/admin/sales-managers.spec.js` |
| TC_SM_FUNC_001-011 | Yes | `tests/e2e/admin/sales-managers.spec.js` |
| TC_SM_VAL_001-005 | Yes | `tests/e2e/admin/sales-managers.spec.js` |
| TC_SM_NEG_001-003 | Yes | `tests/e2e/admin/sales-managers.spec.js` |
| TC_SM_EDGE_001-003 | Yes | `tests/e2e/admin/sales-managers.spec.js` |
| TC_SM_BIZ_001-004 | Yes | `tests/regression/admin/sales-managers.spec.js` |
| TC_SM_E2E_001 | Yes | `tests/e2e/admin/sales-managers.spec.js` |
| TC_SM_API_001-004 | Yes | `tests/api/sales-managers.api.spec.js` |
