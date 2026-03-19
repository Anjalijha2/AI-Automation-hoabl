# CONFIG MODULE — Manual Test Cases

**Module:** Config (`/admin/cms`)
**BRD Version:** 1.0 — March 2026
**Total TCs:** 52 (19 automated Sprint 1, 33 deferred Sprint 2)

---

## Section 1 — Tower Configuration

| TC# | Type | Test Case | Steps | Expected Result | Sprint |
|-----|------|-----------|-------|-----------------|--------|
| TC_CFG_001 | POSITIVE | Deactivate an active tower | 1. Find Tower 8-Crest (Active). 2. Click toggle → Inactive. 3. Click Update Tower Configuration. 4. Verify toast. | Toggle turns gray. Success toast appears. Tower is now inactive. | S1 |
| TC_CFG_002 | POSITIVE | Activate an inactive tower | 1. Find Tower 9-Triumph (Inactive). 2. Click toggle → Active. 3. Click Update Tower Configuration. 4. Verify toast. | Toggle turns green. Success toast appears. | S1 |
| TC_CFG_003 | POSITIVE | Toggle state persists after refresh | 1. Deactivate Tower 8-Crest. 2. Click Update. 3. Reload page. 4. Check Tower 8-Crest. | Toggle stays Inactive after reload. | S1 |
| TC_CFG_004 | NEGATIVE | Toggle reverts without saving | 1. Toggle Tower 8-Crest (don't click Update). 2. Reload page. | Toggle reverts to original state. | S1 |
| TC_CFG_005 | POSITIVE | View Tower link navigates | 1. Click "View Tower >" on Tower 8-Crest. | Navigates to tower detail or opens detail view. | S1 |
| TC_CFG_006 | POSITIVE | Verify active tower count | 1. Load Config page. 2. Count active (green) toggles. | Count > 0. Active towers listed (Tower 8-Crest and Tower 10-Crown expected active). | S1 |

---

## Section 2 — Registration Status

| TC# | Type | Test Case | Steps | Expected Result | Sprint |
|-----|------|-----------|-------|-----------------|--------|
| TC_CFG_007 | POSITIVE | Forbid a registration | 1. Download sample. 2. Add: GHNG-1000000063 \| forbid. 3. Upload + Submit. | Success message. Inactive count +1. | S2 |
| TC_CFG_008 | POSITIVE | Allow a registration | 1. Download sample. 2. Add: GHNG-1000000063 \| Allow. 3. Upload + Submit. | Success. Registration allowed. | S2 |
| TC_CFG_009 | NEGATIVE | Invalid registration number | 1. Add: INVALID-999 \| Allow. 2. Upload + Submit. | Error — invalid registration format. | S2 |
| TC_CFG_010 | NEGATIVE | Invalid status value | 1. Add: GHNG-1000000063 \| BLOCK. 2. Upload + Submit. | Error — only Allow/forbid accepted. | S2 |
| TC_CFG_011 | NEGATIVE | Empty file upload | 1. Upload file with header only (no data rows). | Error or warning — no data. | S2 |
| TC_CFG_012 | NEGATIVE | Wrong file format (.txt) | 1. Upload a .txt file. | Error — invalid file format. | S2 |
| TC_CFG_013 | POSITIVE | Sample file downloads correctly | 1. Click Sample File Download. 2. Verify file opens. 3. Check columns. | File >1KB. Columns: Registration Number, Allocation Status. | S1 (→ TC_CFG_014) |

---

## Section 3 — Unit Status

| TC# | Type | Test Case | Steps | Expected Result | Sprint |
|-----|------|-----------|-------|-----------------|--------|
| TC_CFG_014 | POSITIVE | Change RESERVED to AVAILABLE (Update=1) | 1. Download sample. 2. Set Status=AVAILABLE, Update=1. 3. Upload + Submit. | Unit status changes. Active unit count +1. | S2 |
| TC_CFG_015 | POSITIVE | Change AVAILABLE to RESERVED (Update=1) | 1. Set Status=RESERVED, Update=1. 2. Upload + Submit. | Unit status changes. Inactive count +1. | S2 |
| TC_CFG_016 | NEGATIVE | Update=0 skips row | 1. Set Status=AVAILABLE, Update=0. 2. Upload + Submit. | Status NOT changed. Counts same. | S2 |
| TC_CFG_017 | NEGATIVE | Update=0 for AVAILABLE→RESERVED | 1. Set Status=RESERVED, Update=0. 2. Upload + Submit. | Status NOT changed. | S2 |
| TC_CFG_018 | POSITIVE | Sample file columns correct | 1. Download sample. 2. Verify 7 columns. | All 7 columns present with data. | S1 (→ TC_CFG_015) |
| TC_CFG_019 | NEGATIVE | Invalid status value | 1. Set Status=BLOCKED. 2. Upload + Submit. | Error — invalid status value. | S2 |

---

## Section 4 — Unit Cost Update

| TC# | Type | Test Case | Steps | Expected Result | Sprint |
|-----|------|-----------|-------|-----------------|--------|
| TC_CFG_020 | POSITIVE | Update Agreement Value (Update=1) | 1. Download inventory. 2. Pick 3 rows. 3. Set Agreement=3799999, EarlyBird=27000, Update=1. 4. Upload + Submit. | Success. Pricing updated. | S2 |
| TC_CFG_021 | POSITIVE | Mixed row updates | 1. Row1: 2799999/0.00. Row2: 3799999/15000. Row3: 3799999/15. All Update=1. 2. Upload + Submit. | All 3 rows updated. | S2 |
| TC_CFG_022 | NEGATIVE | Update=0 skips rows | 1. Modify rows, Update=0. 2. Upload + Submit. | Rows skipped. No price change. | S2 |
| TC_CFG_023 | NEGATIVE | Invalid Agreement Value (text) | 1. Set Agreement=abc. 2. Upload + Submit. | Error — invalid data type. | S2 |
| TC_CFG_024 | POSITIVE | Inventory download has correct columns | 1. Click Available Unit Inventory Download. 2. Verify 9 columns. | All 9 columns with actual data. | S1 (→ TC_CFG_016) |

---

## Section 5 — Bulk Booking Cancellation

| TC# | Type | Test Case | Steps | Expected Result | Sprint |
|-----|------|-----------|-------|-----------------|--------|
| TC_CFG_025 | POSITIVE | Cancel a booking | 1. Download sample. 2. Add: GHNG-1000000063-Z. 3. Upload + Submit. | Success. Booking cancelled. | S2 |
| TC_CFG_026 | NEGATIVE | Cancel non-existent booking | 1. Add: GHNG-INVALID-999. 2. Upload + Submit. | Error — registration not found. | S2 |
| TC_CFG_027 | NEGATIVE | Cancel already cancelled booking | 1. Re-upload GHNG-1000000063-Z. 2. Submit. | Error/warning — already cancelled. | S2 |
| TC_CFG_028 | POSITIVE | Sample file downloads correctly | 1. Click Sample File Download. 2. Verify column: Registration Number. | File downloads with correct header. | S1 (→ TC_CFG_017) |

---

## Section 6 — Bulk Registration Cancellation

| TC# | Type | Test Case | Steps | Expected Result | Sprint |
|-----|------|-----------|-------|-----------------|--------|
| TC_CFG_029 | POSITIVE | Cancel registration (Update=1) | 1. Download sample. 2. Add: GHNG-1000000063-Z \| 1. 3. Upload + Submit. | Success. Registration cancelled. | S2 |
| TC_CFG_030 | NEGATIVE | Skip with Update=0 | 1. Add: GHNG-1000000063-Z \| 0. 2. Upload + Submit. | Row skipped. Registration NOT cancelled. | S2 |
| TC_CFG_031 | NEGATIVE | Invalid registration number | 1. Add: INVALID-NUMBER \| 1. 2. Upload + Submit. | Error — invalid registration. | S2 |
| TC_CFG_032 | POSITIVE | Sample file has correct structure | 1. Download sample. 2. Verify 2 columns. | Columns: Registration Number, Update (1/0). Sheet named 'Sample'. | S1 (→ TC_CFG_018) |

---

## Section 7 — Sales Managers

| TC# | Type | Test Case | Steps | Expected Result | Sprint |
|-----|------|-----------|-------|-----------------|--------|
| TC_CFG_033 | POSITIVE | Add new sales manager | 1. Download sample. 2. Add: Sales Manager \| Tester \| Anjali \| test1@test.com \| 8888888888 \| 1 \| 1. 3. Upload + Submit. | Success. Go to Sales Managers page → search Tester → found. | S2 |
| TC_CFG_034 | POSITIVE | Make manager unavailable | 1. IS AVAILABLE=0. 2. Upload + Submit. | Manager not in assignment dropdowns. | S2 |
| TC_CFG_035 | POSITIVE | Make manager inactive | 1. IS ACTIVE=0. 2. Upload + Submit. | Manager deactivated. | S2 |
| TC_CFG_036 | POSITIVE | Update email | 1. Change email to test2@test.com. 2. Upload + Submit. | Email updated. | S2 |
| TC_CFG_037 | POSITIVE | Search by name on Sales Managers page | 1. Go to Sales Managers page. 2. Search: Tester. | Test manager found. | S2 |
| TC_CFG_038 | POSITIVE | Search by phone | 1. Search: 8888888888. | Test manager found. | S2 |
| TC_CFG_039 | NEGATIVE | Invalid phone number | 1. Use phone: 123. 2. Upload + Submit. | Error — invalid phone format. | S2 |
| TC_CFG_040 | NEGATIVE | Duplicate email | 1. Use same email as existing manager. 2. Upload + Submit. | Error or updates existing record. | S2 |
| TC_CFG_041 | POSITIVE | Sample file downloads correctly | 1. Click Sample File Download. 2. Verify 7 columns. | All 7 columns present. | S1 (→ TC_CFG_019) |

---

## Section 8 — Customer Actions Card

| TC# | Type | Test Case | Steps | Expected Result | Sprint |
|-----|------|-----------|-------|-----------------|--------|
| TC_CFG_042 | POSITIVE | Disable additional registrations | 1. Toggle Active→Inactive. 2. Submit. 3. Cross-verify on Customer Portal: Add Units button NOT visible. | Toggle Inactive. Button hidden on both Home + Registration pages. | S1 (admin toggle only) |
| TC_CFG_043 | POSITIVE | Enable additional registrations | 1. Toggle Inactive→Active. 2. Set 1 Bed=15, 2 Bed Growth=16, 2 Bed Rise=15. 3. Submit. | Success. Toggle Active. | S1 (admin only) |
| TC_CFG_044 | POSITIVE | Full Add Units + Payment flow | 1. Flow B — full steps. 2. Easebuzz Wallet. 3. Success. | Payment succeeds. New registration GHNG-XXXXXXXXX-suffix created. | S2 |
| TC_CFG_045 | POSITIVE | Change dropdown values | 1. Set 1 Bed=5, 2 Bed Growth=5, 2 Bed Rise=4. 2. Submit. 3. Refresh → verify. | Values persisted after refresh. | S1 |
| TC_CFG_046 | NEGATIVE | Payment failure flow | Easebuzz → click Failure. | Payment fails. No registration created. | S2 |
| TC_CFG_047 | NEGATIVE | Payment cancel flow | Easebuzz → click Cancel. | Payment cancelled. No registration. | S2 |
| TC_CFG_048 | NEGATIVE | Payment session timeout | Easebuzz → click Session Timeout. | Timeout error. No registration. | S2 |
| TC_CFG_049 | POSITIVE | Verify registration numbers created | After payment → Registration page. | New GHNG-XXXXXXXXX-A, -B, -C entries visible. | S2 |

---

## Section 9 — Max Preferences Per Unit

| TC# | Type | Test Case | Steps | Expected Result | Sprint |
|-----|------|-----------|-------|-----------------|--------|
| TC_CFG_050 | POSITIVE | Update max preferences | 1. Click dropdown, select 6. 2. Click Update. | Success toast: 'Max preferences per unit updated successfully'. | S1 |
| TC_CFG_051 | POSITIVE | Value persists after refresh | 1. After TC_CFG_050, reload page. 2. Check dropdown. | Dropdown shows 6. | S1 |
| TC_CFG_052 | POSITIVE | Change to different value | 1. Select 4. 2. Click Update. | Success toast. Value = 4. | S1 |
| TC_CFG_053 | NEGATIVE | Update without changing value | 1. Don't change dropdown. 2. Click Update. | Either success (same value saved) or no-change message. | S1 |

---

## Sprint 1 Automation Mapping

| Sprint 1 TC | Spec ID | Section |
|------------|---------|---------|
| TC_CFG_001 | TC_CFG_001 in config.spec.ts | Tower Configuration |
| TC_CFG_002 | TC_CFG_002 | Tower Configuration |
| TC_CFG_003 | TC_CFG_003 | Tower Configuration |
| TC_CFG_004 | TC_CFG_004 | Tower Configuration |
| TC_CFG_005 | TC_CFG_005 | Tower Configuration |
| TC_CFG_006 | TC_CFG_006 | Tower Configuration |
| TC_CFG_050 | TC_CFG_007 | Max Preferences |
| TC_CFG_051 | TC_CFG_008 | Max Preferences |
| TC_CFG_052 | TC_CFG_009 | Max Preferences |
| TC_CFG_053 | TC_CFG_010 | Max Preferences |
| TC_CFG_042 | TC_CFG_011 | Customer Actions |
| TC_CFG_043 | TC_CFG_012 | Customer Actions |
| TC_CFG_045 | TC_CFG_013 | Customer Actions |
| TC_CFG_013 | TC_CFG_014 | Reg Status download |
| TC_CFG_018 | TC_CFG_015 | Unit Status download |
| TC_CFG_024 | TC_CFG_016 | Unit Cost download |
| TC_CFG_028 | TC_CFG_017 | Bulk Booking download |
| TC_CFG_032 | TC_CFG_018 | Bulk Reg download |
| TC_CFG_041 | TC_CFG_019 | Sales Mgr download |
