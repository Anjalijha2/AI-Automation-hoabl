# TC_CP — Channel Partners Module Test Cases

**Module:** Channel Partners
**Portal:** XR Portal Admin (`https://uat-web.xrportal.in/admin/channel-partners`)
**BA Sign-off:** Approved (2026-05-19)
**Total TCs:** 30
**Selector Source:** `locators/admin/locator-map.json` (section: `channel-partners`)
**BRD:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Channel-Partners.md`
**FRD:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FRD-Channel-Partners.md`
**FS:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FS-Channel-Partners.md`

---

## UI Tests

### TC_CP_UI_001
**Title:** Page header renders with total count and action buttons
**Priority:** High
**Pre-conditions:** Admin session
**Test Data:** N/A  
**Steps:**
1. Open `/admin/channel-partners`

**Expected:** Title "2705 Channel Partners" (or current count); Map Master CP button (disabled), Reset Filters, Refresh visible
**Automatable:** Yes

---

### TC_CP_UI_002
**Title:** CP table renders 13 columns
**Priority:** High
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Inspect table header

**Expected:** Owner Name, Firm Name, HV Code, Master HV Code, Business Region, Pincode, Phone, CP Type, SM Name, SM Email ID, SM Mobile Number, KYC Status, Actions (per TC-CP-002)
**Automatable:** Yes

---

### TC_CP_UI_003
**Title:** Search input visible in header
**Priority:** Medium
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Inspect header area

**Expected:** Phone-number search input visible
**Automatable:** Yes

---

### TC_CP_UI_004
**Title:** Filter icons present on correct columns
**Priority:** Medium
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Inspect column headers

**Expected:** Search icon on: Owner Name, Firm Name, HV Code, Pincode; Filter icon on: Master HV Code, Business Region, CP Type (per TC-CP-011)
**Automatable:** Yes

---

### TC_CP_UI_005
**Title:** CP Detail drawer renders 4 sections
**Priority:** High
**Pre-conditions:** Eye icon clicked on a row
**Test Data:** N/A  
**Steps:**
1. Click eye icon
2. Inspect drawer

**Expected:** Drawer title "Channel Partner Details"; sections: Basic Information, Firm Details, Contact Details, Additional Details (per TC-CP-006)
**Automatable:** Yes

---

## Functional Tests

### TC_CP_FUNC_001
**Title:** Search by phone returns matching Master CP
**Priority:** Critical
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Enter `8888888888` in search
2. Wait for table

**Expected:** Table filters to one row, CP Type = Master CP; correct Owner Name + HV Code (per TC-CP-003)
**Automatable:** Yes

---

### TC_CP_FUNC_002
**Title:** Search by phone returns matching Member CP
**Priority:** High
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Enter `7888888888` in search

**Expected:** Member CP row matches (per TC-CP-003b)
**Automatable:** Yes

---

### TC_CP_FUNC_003
**Title:** Reset Filters clears search and restores full list
**Priority:** High
**Pre-conditions:** Search applied
**Test Data:** N/A  
**Steps:**
1. Click Reset Filters
2. Wait for re-fetch

**Expected:** Search input cleared; table shows full baseline list; count badge unchanged (per TC-CP-004)
**Automatable:** Yes

---

### TC_CP_FUNC_004
**Title:** Eye icon opens CP detail drawer with correct fields
**Priority:** Critical
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Click eye icon on row for phone `8888888888`

**Expected:** Drawer opens with HV Code, Owner Name, Phone, KYC Status fields populated (per TC-CP-005)
**Automatable:** Yes

---

### TC_CP_FUNC_005
**Title:** Drawer close button dismisses drawer
**Priority:** Medium
**Pre-conditions:** Drawer open
**Test Data:** N/A  
**Steps:**
1. Click `.ant-drawer-close` (X)

**Expected:** Drawer closes; table remains
**Automatable:** Yes

---

### TC_CP_FUNC_006
**Title:** Selecting row enables Map Master CP button
**Priority:** Critical
**Pre-conditions:** Page open; no selection
**Test Data:** N/A  
**Steps:**
1. Check the row-level checkbox on any CP row
2. Inspect Map Master CP button

**Expected:** Button transitions disabled → enabled (per TC-CP-008)
**Automatable:** Yes

---

### TC_CP_FUNC_007
**Title:** Map Master CP modal opens with title and dropdown
**Priority:** High
**Pre-conditions:** Row selected
**Test Data:** N/A  
**Steps:**
1. Click Map Master CP button

**Expected:** Modal title "Map CPs to Master"; Master HV Code dropdown present; mapping count indicator visible (per TC-CP-009)
**Automatable:** Yes

---

### TC_CP_FUNC_008
**Title:** Confirm mapping assigns Master HV Code to selected CP
**Priority:** Critical
**Pre-conditions:** Map Master CP modal open with Member CP selected
**Test Data:** N/A  
**Steps:**
1. Select a Master HV Code from dropdown
2. Click Confirm

**Expected:** Modal closes; selected CP's Master HV Code column updates to chosen master
**Automatable:** Yes

---

### TC_CP_FUNC_009
**Title:** Refresh button reloads data without changing total
**Priority:** Medium
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Click Refresh

**Expected:** Network re-fetch; total count badge unchanged (per TC-CP-010)
**Automatable:** Yes

---

### TC_CP_FUNC_010
**Title:** Column filter by CP Type = Master CP returns only Master CPs
**Priority:** High
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Click CP Type filter icon
2. Select "Master CP"

**Expected:** Only Master CP rows shown (per TC-CP-011)
**Automatable:** Yes

---

### TC_CP_FUNC_011
**Title:** Filter by Master HV Code shows mapped Members
**Priority:** High
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Click Master HV Code filter icon
2. Select a Master HV Code

**Expected:** Table shows only CPs mapped to selected Master (per TC-CP-012 setup)
**Automatable:** Yes

---

### TC_CP_FUNC_012
**Title:** Cross-portal — CP login confirms team leads visible
**Priority:** Medium
**Pre-conditions:** Admin has filtered Master HV Code; CP credentials known
**Test Data:** N/A  
**Steps:**
1. Open CP Portal, login with mobile `8888888888`, OTP `147258`
2. Navigate to "All Team Leads" section

**Expected:** Team Leads listed matching admin-side filter (per TC-CP-012)
**Automatable:** Yes (cross-portal)

---

## Validation Tests

### TC_CP_VAL_001
**Title:** Map Master CP button disabled with no selection
**Priority:** High
**Pre-conditions:** Page open; nothing selected
**Test Data:** N/A  
**Steps:**
1. Inspect Map Master CP button state

**Expected:** Button disabled (per BRD §7, FRD §5 BR4)
**Automatable:** Yes

---

### TC_CP_VAL_002
**Title:** Map Master CP modal requires Master HV Code selection
**Priority:** High
**Pre-conditions:** Modal open
**Test Data:** N/A  
**Steps:**
1. Click Confirm without selecting Master HV Code

**Expected:** Validation error; mapping not performed (per BRD §7)
**Automatable:** Yes

---

### TC_CP_VAL_003
**Title:** Phone search with empty input restores full list
**Priority:** Low
**Pre-conditions:** Search applied previously
**Test Data:** N/A  
**Steps:**
1. Clear search input
2. Trigger search/blur

**Expected:** Full list restored
**Automatable:** Yes

---

## Negative Tests

### TC_CP_NEG_001
**Title:** Unauthenticated access redirects to login
**Priority:** High
**Pre-conditions:** No session
**Test Data:** N/A  
**Steps:**
1. Navigate to `/admin/channel-partners`

**Expected:** Redirect to login
**Automatable:** Yes

---

### TC_CP_NEG_002
**Title:** Search non-existent phone returns empty
**Priority:** Medium
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Enter `0000000000` in search

**Expected:** Table empty; count badge unchanged
**Automatable:** Yes

---

### TC_CP_NEG_003
**Title:** Map Master CP — select a Master CP (cannot map to itself)
**Priority:** Medium
**Pre-conditions:** Master CP row selected
**Test Data:** N/A  
**Steps:**
1. Open Map modal
2. Attempt to select same CP's HV code as Master

**Expected:** Either blocked or no-op; verify business behavior (per FRD §11 Master vs Member logic)
**Automatable:** Partial

---

## Edge Cases

### TC_CP_EDGE_001
**Title:** Header count badge stays static when filters applied
**Priority:** High
**Pre-conditions:** Page open with N CPs in badge
**Test Data:** N/A  
**Steps:**
1. Note count (e.g., "2705 Channel Partners")
2. Apply phone search
3. Re-read badge

**Expected:** Badge unchanged at total system count (per BRD §6 BR1, FRD §5 BR1)
**Automatable:** Yes

---

### TC_CP_EDGE_002
**Title:** Select multiple rows for bulk mapping
**Priority:** Medium
**Pre-conditions:** Page open
**Test Data:** N/A  
**Steps:**
1. Check checkboxes on 3 different CP rows
2. Open Map Master modal

**Expected:** Modal indicates "3 CP(s)" will be mapped; mapping completes for all 3
**Automatable:** Yes

---

### TC_CP_EDGE_003
**Title:** SM columns show "-" when no SM assigned
**Priority:** Low
**Pre-conditions:** CP with no assigned SM exists
**Test Data:** N/A  
**Steps:**
1. Inspect SM Name / Email / Mobile cells for that CP

**Expected:** Cells show "-" (per BRD §6 BR7, FRD §5)
**Automatable:** Yes

---

## Business Rule Tests

### TC_CP_BIZ_001
**Title:** A CP starts as Member CP by default
**Priority:** High
**Pre-conditions:** Recently-registered CP available (or use API to create test CP)
**Test Data:** N/A  
**Steps:**
1. View CP detail

**Expected:** CP Type = Member CP (per FRD §11)
**Automatable:** Partial (requires fresh CP)

---

### TC_CP_BIZ_002
**Title:** Only Master CPs appear in Map Master HV Code dropdown
**Priority:** High
**Pre-conditions:** Map Master CP modal open
**Test Data:** N/A  
**Steps:**
1. Inspect Master HV Code dropdown options

**Expected:** All options have CP Type = Master CP (per BRD §6 BR6, FRD §11)
**Automatable:** Yes

---

### TC_CP_BIZ_003
**Title:** SM columns auto-populate from assigned SM
**Priority:** Medium
**Pre-conditions:** CP with assigned SM exists
**Test Data:** N/A  
**Steps:**
1. View CP row
2. Compare SM Name/Email/Mobile to Sales Managers module record

**Expected:** Values match assigned SM record (per BRD §6 BR7, FRD §10)
**Automatable:** Partial (cross-module)

---

### TC_CP_BIZ_004
**Title:** KYC Status values constrained to enum
**Priority:** Medium
**Pre-conditions:** Multiple CP drawers viewable
**Test Data:** N/A  
**Steps:**
1. Open drawers for 5+ CPs
2. Note KYC Status values

**Expected:** Values are one of: Pending, Approved, Rejected, Verified (per BRD §4, FRD §10)
**Automatable:** Yes

---

## End-to-End Tests

### TC_CP_E2E_001
**Title:** Full workflow — Search → View → Select → Map to Master
**Priority:** Critical
**Pre-conditions:** Admin session; known Member CP and Master CP
**Test Data:** N/A  
**Steps:**
1. Open `/admin/channel-partners`
2. Search for Member CP by phone
3. Click eye icon, verify drawer; close
4. Check row checkbox
5. Click Map Master CP
6. Select Master HV Code
7. Confirm
8. Verify Master HV Code column updated for that CP

**Expected:** Full lifecycle succeeds; data persists; mapping reflected in table
**Automatable:** Yes

---

## API Tests

### TC_CP_API_001
**Title:** GET cp returns paginated list with filters
**Priority:** High
**Pre-conditions:** Admin JWT
**Test Data:** N/A  
**Steps:**
1. `GET /api/v1/admin/cp?page=1&limit=10`

**Expected:** 200 OK; items array; total = total CPs (e.g., 2705)
**Automatable:** Yes

---

### TC_CP_API_002
**Title:** GET cp/masters returns Master CPs only
**Priority:** High
**Pre-conditions:** Admin JWT
**Test Data:** N/A  
**Steps:**
1. `GET /api/v1/admin/cp/masters`

**Expected:** 200 OK; all items have CP Type = Master CP
**Automatable:** Yes

---

### TC_CP_API_003
**Title:** GET cp/:id returns single CP detail
**Priority:** Medium
**Pre-conditions:** Admin JWT; known CP ID
**Test Data:** N/A  
**Steps:**
1. `GET /api/v1/admin/cp/:id`

**Expected:** 200 OK; response with Basic, Firm, Contact, Additional sections data
**Automatable:** Yes

---

### TC_CP_API_004
**Title:** PUT cp/map-master assigns Master to CPs
**Priority:** Critical
**Pre-conditions:** Admin JWT; disposable Member CP IDs; valid Master HV Code
**Test Data:** N/A  
**Steps:**
1. `PUT /api/v1/admin/cp/map-master` with `{ cpIds: [id1], masterHvCode: 'HVxxxx' }`

**Expected:** 200 OK; subsequent GET shows masterHvCode set on those CPs
**Automatable:** Yes

---

## Automation Coverage

| TC | Automatable | Spec |
|----|-------------|------|
| TC_CP_UI_001-005 | Yes | `tests/ui-ux/admin/channel-partners.spec.js` |
| TC_CP_FUNC_001-011 | Yes | `tests/e2e/admin/channel-partners.spec.js` |
| TC_CP_FUNC_012 | Yes | `tests/e2e/admin/channel-partners.spec.js` (cross-portal) |
| TC_CP_VAL_001-003 | Yes | `tests/e2e/admin/channel-partners.spec.js` |
| TC_CP_NEG_001-002 | Yes | `tests/e2e/admin/channel-partners.spec.js` |
| TC_CP_NEG_003 | Partial | Verify business behavior |
| TC_CP_EDGE_001-003 | Yes | `tests/e2e/admin/channel-partners.spec.js` |
| TC_CP_BIZ_001 | Partial | Requires fresh CP |
| TC_CP_BIZ_002, 004 | Yes | `tests/regression/admin/channel-partners.spec.js` |
| TC_CP_BIZ_003 | Partial | Cross-module |
| TC_CP_E2E_001 | Yes | `tests/e2e/admin/channel-partners.spec.js` |
| TC_CP_API_001-004 | Yes | `tests/api/channel-partners.api.spec.js` |
