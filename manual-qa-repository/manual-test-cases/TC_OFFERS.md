# TC_OFFERS — Offers Management Module Manual Test Cases

**Module:** Offers Management (`/admin/offers`)
**Sprint:** 4
**Author:** BA Agent / QA
**Last Updated:** 2026-05-08
**Total TCs:** 12 (TC-OFFERS-001 through TC-OFFERS-012)

---

## Page Overview

| Zone | Description |
|------|-------------|
| **Header** | "Offers Management" heading + "N Offers" count badge + Refresh / Add New Offer buttons |
| **Table** | Sr.no | Offer Name | Description | Amount | Percentage | Start Date | End Date | Created By | Action |
| **Action Column** | ON/OFF toggle switch + Edit (pencil) button + Delete (trash) button per row |
| **Pagination** | Previous / Next page controls (1 page in UAT) |
| **Add Offer Drawer** | Ant Design side drawer; fields: Offer Name, Offer Type, Amount, Description, Date Range, Typology |
| **Edit Offer Drawer** | Same drawer with pre-filled values; submit button changes to "Update Offer" |

---

## Section 1 — Page Load & Structure

### TC-OFFERS-001 — Page loads with correct offer count and heading
**Priority:** P1
**Type:** Smoke

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/offers` using saved admin session | Page loads within 3 seconds |
| 2 | Verify page heading | "Offers Management" text visible |
| 3 | Read offer count badge text | Shows "6 Offers" (pinned UAT baseline) |
| 4 | Verify Refresh button visible | "Refresh" button present in header |
| 5 | Verify Add New Offer button visible | "Add New Offer" button present in header |

**Pass Criteria:** Heading = "Offers Management"; badge = "6 Offers"; both header buttons present.

---

### TC-OFFERS-002 — Table displays all required columns with correct data types
**Priority:** P1
**Type:** Smoke

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/offers` | Table renders |
| 2 | Read all `<th>` column header texts | 9 columns: Sr.no, Offer Name, Description, Amount, Percentage, Start Date, End Date, Created By, Action |
| 3 | Inspect Amount column cells | Values formatted as "₹ X,XX,XXX" |
| 4 | Inspect Percentage column cells | All show "-" (all UAT offers are Amount Based) |
| 5 | Inspect Start/End Date cells | Format is "DD MMM YYYY" (e.g. "13 Apr 2026") |
| 6 | Count table body rows | 6 data rows present |

**Pass Criteria:** All 9 columns present; Amount formatted with ₹; Percentage = "-"; dates in DD MMM YYYY format; 6 rows.

---

### TC-OFFERS-003 — Sr.No values are non-contiguous (confirms hard delete behavior)
**Priority:** P2
**Type:** Business Logic

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/offers` | Table renders |
| 2 | Read all Sr.no values from table rows | Values are: 10, 9, 8, 7, 3, 1 |
| 3 | Verify gaps exist (2, 4, 5, 6 missing) | Non-contiguous values confirm hard-delete; system does not renumber |

**Pass Criteria:** Sr.no column shows 10, 9, 8, 7, 3, 1 — NOT sequential 1-6.

---

## Section 2 — Add New Offer

### TC-OFFERS-004 — Add New Offer drawer opens with correct fields
**Priority:** P1
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/offers` | Page loads |
| 2 | Click "Add New Offer" button | Drawer slides open |
| 3 | Verify drawer title | "Add New Offer" |
| 4 | Verify Offer Name field present with placeholder | Input visible; placeholder "Please enter offer name" |
| 5 | Verify character counter shows "0 / 100" | Counter present below Offer Name |
| 6 | Verify Offer Type radio buttons present | "Amount Based" and "Percentage Based" options visible |
| 7 | Verify "Amount Based" is pre-selected | Amount Based radio is checked by default |
| 8 | Verify Amount field visible | Spinbutton / number input present |
| 9 | Verify Description textarea with "0 / 500" counter | Optional field with char counter |
| 10 | Verify Offer Validity date range picker present | Start date and End date inputs visible |
| 11 | Verify Select Typology dropdown present | Dropdown with placeholder "Please select typology" |
| 12 | Verify Cancel and "Create Offer" buttons present | Both buttons in drawer footer |
| 13 | Click Cancel | Drawer closes; no offer created |

**Pass Criteria:** All 6 form fields present; Amount Based pre-selected; drawer closes on Cancel.

---

### TC-OFFERS-005 — Create offer with valid inputs succeeds
**Priority:** P1
**Type:** Functional / E2E

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/offers` | Page loads; count badge = "6 Offers" |
| 2 | Click "Add New Offer" | Drawer opens |
| 3 | Enter Offer Name: "QA Test Offer" | Name filled; counter shows "14 / 100" |
| 4 | Select Offer Type: Amount Based (already selected) | Radio checked |
| 5 | Enter Amount: "5000" | Amount field shows 5000 |
| 6 | Enter Description: "Automation test offer" | Description filled |
| 7 | Enter Start Date: today + 1 day (e.g. "09 May 2026") | Start date set |
| 8 | Enter End Date: today + 30 days (e.g. "07 Jun 2026") | End date set |
| 9 | Leave Typology blank (applies to all) | No selection |
| 10 | Click "Create Offer" | Drawer closes; success notification shown |
| 11 | Verify new row appears in table with "QA Test Offer" | Row visible with correct name and amount |
| 12 | Verify count badge increments to "7 Offers" | Badge updated |

**Pass Criteria:** Drawer closes on valid submit; new row appears; count increments.

**Post-test cleanup:** Delete the test offer to restore baseline.

---

### TC-OFFERS-006 — Create offer validation — required fields enforced
**Priority:** P1
**Type:** Validation / Negative

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/offers` | Page loads |
| 2 | Click "Add New Offer" | Drawer opens |
| 3 | Leave all fields blank | No input |
| 4 | Click "Create Offer" | Drawer remains open; validation errors appear |
| 5 | Verify Offer Name shows error | "Please enter offer name" or similar error visible |
| 6 | Verify Amount shows error | Error on Amount field |
| 7 | Verify Date range shows error | Error on date range field |
| 8 | Enter Offer Name only; click "Create Offer" | Amount and date errors still present |
| 9 | Enter Amount; leave dates blank; click "Create Offer" | Date range error still present |
| 10 | Click Cancel | Drawer closes with no side effects |

**Pass Criteria:** Drawer stays open on empty/partial submit; inline errors shown on all required fields.

---

## Section 3 — Edit Offer

### TC-OFFERS-007 — Edit offer drawer opens with pre-filled values
**Priority:** P1
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/offers` | Page loads; offer Sr.No 1 "Home Loan Discount" visible |
| 2 | Click Edit (pencil) button on "Home Loan Discount" row (Sr.No 1) | Edit drawer opens |
| 3 | Verify drawer title | "Edit Offer" |
| 4 | Verify Offer Name is pre-filled | Shows "Home Loan Discount" |
| 5 | Verify character counter shows "18 / 100" | Correct length for "Home Loan Discount" |
| 6 | Verify Amount is pre-filled | Shows ₹ 10,000 |
| 7 | Verify Description is pre-filled | Shows "Home Loan Discount" |
| 8 | Verify Start Date is pre-filled | Shows "13 Apr 2026" |
| 9 | Verify End Date is pre-filled | Shows "30 Jun 2026" |
| 10 | Verify "Update Offer" button present (not "Create Offer") | Button labeled "Update Offer" |
| 11 | Click Cancel | Drawer closes; no changes made |

**Pass Criteria:** All fields pre-filled with existing values; submit button says "Update Offer"; Cancel closes without saving.

---

### TC-OFFERS-008 — Edit offer with modified name and description succeeds
**Priority:** P1
**Type:** Functional / E2E

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/offers` | Page loads |
| 2 | Click Edit on "VK test" offer (Sr.No 10) | Drawer opens with "VK test" pre-filled |
| 3 | Clear Offer Name and enter "VK test updated" | Name field updated |
| 4 | Clear Description and enter "Updated by QA" | Description updated |
| 5 | Click "Update Offer" | Drawer closes |
| 6 | Verify table row Sr.No 10 shows "VK test updated" | Name updated in table |
| 7 | Verify description column shows "Updated by QA" | Description updated in table |
| 8 | Click Edit on Sr.No 10 again and restore original values | Reset to "VK test" and "Booking" |
| 9 | Click "Update Offer" | Original values restored |

**Pass Criteria:** Edit saves correctly; table reflects changes immediately; values can be restored.

---

## Section 4 — Toggle ON/OFF

### TC-OFFERS-009 — Toggle switches OFF offer (currently ON)
**Priority:** P1
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/offers` | Page loads; Sr.No 9 "VC request" is ON |
| 2 | Note current toggle state of Sr.No 9 | Toggle is ON (checked) |
| 3 | Click toggle on Sr.No 9 | Toggle state flips to OFF — NO confirmation dialog |
| 4 | Verify toggle shows OFF state | Toggle aria-checked="false" or OFF label active |
| 5 | Refresh the page (Refresh button) | Page reloads |
| 6 | Verify Sr.No 9 toggle is still OFF | State persisted to server |
| 7 | Click toggle on Sr.No 9 again to restore | Toggle returns to ON |
| 8 | Verify Sr.No 9 is ON after restore | State is ON |

**Pass Criteria:** Toggle flips immediately with no confirmation dialog; state persists after page refresh.

**Domain Red Flag:** HIGH RISK — No confirmation dialog. Accidental deactivation of live offer is possible.

---

### TC-OFFERS-010 — Toggle switches ON offer (currently OFF)
**Priority:** P2
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/offers` | Page loads; Sr.No 1 "Home Loan Discount" is OFF |
| 2 | Note current toggle state of Sr.No 1 | Toggle is OFF |
| 3 | Click toggle on Sr.No 1 | Toggle flips to ON |
| 4 | Verify toggle shows ON state | Toggle checked/ON |
| 5 | Click toggle on Sr.No 1 again to restore | Toggle returns to OFF |
| 6 | Verify Sr.No 1 is OFF after restore | State is OFF |

**Pass Criteria:** Toggle flips from OFF to ON and back; state visible immediately.

---

## Section 5 — Typology Scoping

### TC-OFFERS-011 — Edit offer and add typology filter
**Priority:** P2
**Type:** Functional / Business Logic

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/offers` | Page loads |
| 2 | Click Edit on "Home Loan Discount" (Sr.No 1) | Edit drawer opens |
| 3 | Click the Select Typology dropdown | Dropdown opens |
| 4 | Verify all 4 options visible | "1 Bed Growth Home", "2 Bed Growth Home", "2 Bed Peak Home", "2 Bed Rise Home" |
| 5 | Select "1 Bed Growth Home" | Option selected; appears as tag in dropdown |
| 6 | Click Cancel | Drawer closes; typology NOT saved |
| 7 | Verify "Home Loan Discount" typology unchanged | No typology tag in table row |

**Pass Criteria:** All 4 typology options present; selection works; Cancel discards selection.

---

## Section 6 — Refresh & Delete

### TC-OFFERS-012 — Refresh button reloads table without altering count
**Priority:** P2
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/offers` | Page loads; count = "6 Offers" |
| 2 | Read count badge | "6 Offers" |
| 3 | Click "Refresh" button | Page reloads table data |
| 4 | Read count badge after refresh | Still "6 Offers" |
| 5 | Verify all 6 rows still present | Table row count unchanged |

**Pass Criteria:** Count unchanged after refresh; all rows present; no side effects.

---

## Delete Offer — Confirmed Behavior

**CLARIFICATION-OFFERS-005 RESOLVED (2026-05-08):**

Delete button DOES show a confirmation dialog:
- Title: "Are you sure you want to delete this offer?"
- Body: "This action cannot be undone."
- Buttons: "Cancel" | "Yes, delete"

Delete tests use a dedicated test offer created within the same test (TC-OFFERS-005). The test offer is created, assertions run, then deleted immediately — no permanent data loss on existing offers.

---

## Test Data Summary

| Reference | Value |
|-----------|-------|
| UAT Baseline Count | 6 Offers |
| Sr.No Values | 10, 9, 8, 7, 3, 1 |
| Offer (OFF) for toggle ON test | Sr.No 1 — "Home Loan Discount" |
| Offer (ON) for toggle OFF test | Sr.No 9 — "VC request" |
| Offer for edit test | Sr.No 10 — "VK test" / Sr.No 1 — "Home Loan Discount" |
| Typology options | 1 Bed Growth Home, 2 Bed Growth Home, 2 Bed Peak Home, 2 Bed Rise Home |
| Test offer name (create/delete) | "QA Test Offer" |

---

## Coverage Summary

| TC ID | Area | Type | Priority |
|-------|------|------|----------|
| TC-OFFERS-001 | Page Load | Smoke | P1 |
| TC-OFFERS-002 | Table Structure | Smoke | P1 |
| TC-OFFERS-003 | Sr.No Non-Contiguous | Business Logic | P2 |
| TC-OFFERS-004 | Add Drawer Fields | Functional | P1 |
| TC-OFFERS-005 | Create Valid Offer | E2E | P1 |
| TC-OFFERS-006 | Create Validation | Validation/Negative | P1 |
| TC-OFFERS-007 | Edit Pre-Fill | Functional | P1 |
| TC-OFFERS-008 | Edit & Update | E2E | P1 |
| TC-OFFERS-009 | Toggle OFF | Functional | P1 |
| TC-OFFERS-010 | Toggle ON | Functional | P2 |
| TC-OFFERS-011 | Typology Dropdown | Functional/BizLogic | P2 |
| TC-OFFERS-012 | Refresh | Functional | P2 |
