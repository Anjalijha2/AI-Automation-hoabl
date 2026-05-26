# Test Cases — Sales Managers
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-Sales-Managers.md
**FSD Reference:** `manual-qa-repository/03-user-manual/admin/fsd-sales-managers.md`
**Last FSD Sync:** 2026-05-24

---

## [FSD-CORRECTION] Source-verified facts

- **SM Admin = roleId 4**, **SM = roleId 5** (backend distinction, NOT a UI tab).
- SM Admin (`roleId=4`) is FORCE-SET `isAvailable=0` — does NOT participate in ticket allocation.
- SM (`roleId=5`) `isAvailable` is admin-controllable.
- **No DELETE endpoint** — deactivation is via `isActive=false` on PUT update.
- Endpoints: GET list, GET by id, POST create, PUT update, GET sample Excel, POST bulk Excel import (`doc` field).
- Sales Managers themselves CANNOT call these admin-side endpoints — only `restrictTo('admin')`.

---

## Sales Managers List View

### ADM_SM_001 — Sales Managers page loads at /admin/sales-managers

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Sales Managers" in left sidebar<br>2. Observe URL and page |
| **Expected Result** | URL becomes /admin/sales-managers; SM list table loads |
| **Priority** | Critical |

---

### ADM_SM_002 — Page header shows total SM count and Add button

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM page loaded |
| **Test Steps** | 1. Observe page header |
| **Expected Result** | Header shows total SM count; "Add Sales Manager" button visible at top right |
| **Priority** | High |

---

### ADM_SM_003 — SM table displays core columns

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM page loaded |
| **Test Steps** | 1. Inspect table column headers |
| **Expected Result** | Columns include First Name, Last Name, Email, Phone, Role, Assignable toggle, Is Active toggle, Actions |
| **Priority** | High |

---

### ADM_SM_004 — SM row displays Assignable toggle state

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM page loaded |
| **Test Steps** | 1. Inspect Assignable column on a row |
| **Expected Result** | Toggle is shown ON (green) or OFF (grey) reflecting IS_AVAILABLE flag |
| **Priority** | High |

---

### ADM_SM_005 — SM row displays Is Active toggle state

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM page loaded |
| **Test Steps** | 1. Inspect Is Active column on a row |
| **Expected Result** | Toggle shown ON or OFF reflecting IS_ACTIVE flag |
| **Priority** | High |

---

### ADM_SM_006 — Search SM by phone filters list

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM page loaded |
| **Test Steps** | 1. Type SM phone in search field<br>2. Wait |
| **Expected Result** | Table filters to matching SM only |
| **Priority** | High |

---

### ADM_SM_007 — Search SM by email filters list

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM page loaded |
| **Test Steps** | 1. Type SM email in search field<br>2. Wait |
| **Expected Result** | Table filters to SMs matching email |
| **Priority** | Medium |

---

### ADM_SM_008 — Pagination works on SM list

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM page loaded; multiple pages |
| **Test Steps** | 1. Click Next arrow in pagination |
| **Expected Result** | Next 10 SMs loaded |
| **Priority** | Medium |

---

## Add Single Sales Manager

### ADM_SM_009 — Click Add Sales Manager opens form modal

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM page loaded |
| **Test Steps** | 1. Click "Add Sales Manager" button |
| **Expected Result** | Modal opens with fields: First Name, Last Name, Email, Phone, Role, Assignable, Is Active |
| **Priority** | Critical |

---

### ADM_SM_010 — Submit form with valid data creates new SM

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Add SM modal open |
| **Test Steps** | 1. Enter First Name "Test"<br>2. Enter Last Name "SM"<br>3. Enter Email "test.sm@hoabl.in"<br>4. Enter Phone "9876543210"<br>5. Select Role "Sales Manager"<br>6. Toggle Assignable ON, Is Active ON<br>7. Click Submit |
| **Expected Result** | Success toast appears; modal closes; new SM appears in list |
| **Priority** | Critical |

---

### ADM_SM_011 — Add SM with empty First Name rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Add SM modal open |
| **Test Steps** | 1. Leave First Name empty<br>2. Fill other fields<br>3. Click Submit |
| **Expected Result** | Validation error shown on First Name field; SM not created |
| **Priority** | High |

---

### ADM_SM_012 — Add SM with invalid email format rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Add SM modal open |
| **Test Steps** | 1. Enter Email "notanemail"<br>2. Fill other fields<br>3. Click Submit |
| **Expected Result** | Email format error shown; SM not created |
| **Priority** | High |

---

### ADM_SM_013 — Add SM with 9-digit phone rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Add SM modal open |
| **Test Steps** | 1. Enter Phone "987654321" (9 digits)<br>2. Fill other fields<br>3. Click Submit |
| **Expected Result** | Phone validation error; must be 10 digits |
| **Priority** | High |

---

### ADM_SM_014 — Newly added SM can log in to SM portal

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM just created with Is Active = ON |
| **Test Steps** | 1. Open /sales-manager portal in new window<br>2. Enter the new SM's phone<br>3. Complete OTP login |
| **Expected Result** | New SM successfully logs in to SM Portal |
| **Priority** | Critical |

---

### ADM_SM_015 — Cancel button on Add SM closes modal without saving

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Add SM modal open with partial data |
| **Test Steps** | 1. Fill some fields<br>2. Click Cancel/Close |
| **Expected Result** | Modal closes; SM list unchanged; no new SM created |
| **Priority** | Medium |

---

## SM Flag Toggles & Edit

### ADM_SM_016 — Toggle Assignable OFF immediately disables SM

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM with Assignable = ON |
| **Test Steps** | 1. Click Assignable toggle on SM row<br>2. Confirm if prompted |
| **Expected Result** | Toggle switches OFF; SM immediately removed from customer assignment dropdowns system-wide |
| **Priority** | Critical |

---

### ADM_SM_017 — Toggle Is Active OFF disables SM login

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM with Is Active = ON |
| **Test Steps** | 1. Click Is Active toggle on SM row |
| **Expected Result** | Toggle switches OFF; SM can no longer log in to SM portal |
| **Priority** | Critical |

---

### ADM_SM_018 — Re-enable Assignable restores dropdown visibility

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM with Assignable = OFF |
| **Test Steps** | 1. Click Assignable toggle to ON |
| **Expected Result** | SM appears in customer assignment dropdowns again |
| **Priority** | High |

---

### ADM_SM_019 — Re-enable Is Active restores login capability

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM with Is Active = OFF |
| **Test Steps** | 1. Click Is Active toggle to ON<br>2. Have SM attempt OTP login |
| **Expected Result** | SM can log in to SM portal again |
| **Priority** | High |

---

### ADM_SM_020 — Edit SM details via row actions

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM exists in list |
| **Test Steps** | 1. Click edit/three-dot icon on SM row<br>2. Update Last Name<br>3. Save |
| **Expected Result** | SM record updated; new Last Name displayed in list |
| **Priority** | High |

---

### ADM_SM_021 — No Delete action for SMs (deactivation only)

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM page loaded |
| **Test Steps** | 1. Inspect Actions column for any delete button |
| **Expected Result** | No delete option exists — SMs are only deactivated via Is Active = OFF |
| **Priority** | High |

---

### ADM_SM_050 — Edit SM modal pre-fills all existing fields

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Existing SM with First Name "Ravi", Last Name "Kumar", Email "ravi@hoabl.in", Phone "9123456780" |
| **Test Steps** | 1. Click edit/three-dot icon on that SM row<br>2. Inspect form fields |
| **Expected Result** | Form opens with all five fields populated with current values; Role field shown as read-only or non-editable; Assignable/Is Active toggles reflect current DB state |
| **Priority** | High |

---

### ADM_SM_051 — Toggle Assignable on SM Admin (roleId=4) row is force-overridden to OFF

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers / DB |
| **BRD/FRD Req** | FSD §1 / `sales-manager.service.js:124,155` |
| **Pre-conditions** | An SM Admin row (Role = SM Admin / roleId=4) exists in list |
| **Test Steps** | 1. Toggle Assignable to ON on that row<br>2. Refresh the page<br>3. Re-read the toggle state |
| **Expected Result** | After refresh, Assignable shows OFF; backend force-sets `isAvailable=0` for roleId=4 regardless of input; SM Admin never appears in customer assignment dropdowns |
| **Priority** | High |

---

## Privacy Masking Settings

### ADM_SM_022 — Access privacy masking settings panel

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM page loaded |
| **Test Steps** | 1. Locate and open privacy/masking settings |
| **Expected Result** | Three toggles visible: Email Masking, Phone Masking, Cost Masking |
| **Priority** | High |

---

### ADM_SM_023 — Toggle Email Masking ON hides emails from all SMs

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Masking settings open; Email Masking OFF |
| **Test Steps** | 1. Toggle Email Masking ON<br>2. Save<br>3. Log in as SM in another window |
| **Expected Result** | Customer email addresses appear masked or hidden in SM portal |
| **Priority** | Critical |

---

### ADM_SM_024 — Toggle Phone Masking ON hides phones from all SMs

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Phone Masking OFF |
| **Test Steps** | 1. Toggle Phone Masking ON<br>2. Save |
| **Expected Result** | Customer phones hidden from every SM simultaneously |
| **Priority** | Critical |

---

### ADM_SM_025 — Toggle Cost Masking ON hides unit pricing from SMs

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Cost Masking OFF |
| **Test Steps** | 1. Toggle Cost Masking ON<br>2. Save |
| **Expected Result** | Unit pricing hidden from all SMs |
| **Priority** | Critical |

---

### ADM_SM_026 — Masking applies system-wide not per-SM

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Masking settings open |
| **Test Steps** | 1. Inspect masking panel for any per-SM granularity option |
| **Expected Result** | Only system-wide toggles exist; no per-SM masking configuration |
| **Priority** | Medium |

---

### ADM_SM_027 — Toggling masking OFF reveals data to all SMs immediately

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Cost Masking currently ON |
| **Test Steps** | 1. Toggle Cost Masking OFF<br>2. Save |
| **Expected Result** | Pricing now visible to every SM immediately |
| **Priority** | High |

---

### ADM_SM_052 — Masking toggles save without confirmation dialog

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Masking panel open; Phone Masking currently OFF |
| **Test Steps** | 1. Click Phone Masking toggle to ON<br>2. Observe |
| **Expected Result** | Toggle flips immediately; success toast shown; no confirmation dialog prompted |
| **Priority** | Medium |

---

### ADM_SM_053 — Masking state persists across admin logout/login

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Email Masking just toggled ON |
| **Test Steps** | 1. Logout admin<br>2. Log back in<br>3. Reopen masking panel |
| **Expected Result** | Email Masking still ON — state persisted in master_configs table |
| **Priority** | High |

---

## Bulk SM Upload (via Config Section 7)

### ADM_SM_028 — Navigate to Config Section 7 Sales Managers

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Open /admin/cms<br>2. Scroll to Section 7 "Sales Managers" |
| **Expected Result** | Section 7 visible with Download Sample, Upload File, Submit controls |
| **Priority** | High |

---

### ADM_SM_029 — Download SM sample XLSX file

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Section 7 visible |
| **Test Steps** | 1. Click "Sample File Download" in Section 7 |
| **Expected Result** | XLSX template downloads with columns: Role, First Name, Last Name, Email, Phone, IS_AVAILABLE, IS_ACTIVE |
| **Priority** | High |

---

### ADM_SM_030 — Bulk upload creates new SMs

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Sample XLSX filled with 3 new SMs (phones not in system) |
| **Test Steps** | 1. Click Upload File, select XLSX<br>2. Click Submit |
| **Expected Result** | Result file downloads showing 3 Created entries; new SMs appear in SM list |
| **Priority** | Critical |

---

### ADM_SM_031 — Bulk upload with existing phone updates SM

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | XLSX has row with existing SM phone but new Last Name |
| **Test Steps** | 1. Upload XLSX<br>2. Submit |
| **Expected Result** | Result shows Updated for that row; SM's Last Name in list updates |
| **Priority** | Critical |

---

### ADM_SM_032 — Bulk upload with IS_AVAILABLE=0 disables assignable

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | XLSX has row with IS_AVAILABLE=0 |
| **Test Steps** | 1. Upload and submit |
| **Expected Result** | SM created/updated with Assignable toggle OFF |
| **Priority** | High |

---

### ADM_SM_033 — Bulk upload with IS_ACTIVE=0 disables login

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | XLSX has row with IS_ACTIVE=0 |
| **Test Steps** | 1. Upload and submit |
| **Expected Result** | SM created/updated with Is Active toggle OFF |
| **Priority** | High |

---

### ADM_SM_034 — Bulk upload with 9-digit phone returns row error

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | XLSX has row with 9-digit phone |
| **Test Steps** | 1. Upload and submit |
| **Expected Result** | Result XLSX shows that row flagged as Error with phone validation message |
| **Priority** | High |

---

### ADM_SM_035 — Bulk upload accepts only XLSX format

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Section 7 visible |
| **Test Steps** | 1. Try to upload a .csv file<br>2. Click Submit |
| **Expected Result** | Upload rejected with format error; only .xlsx accepted |
| **Priority** | High |

---

### ADM_SM_036 — Bulk upload result file shows per-row outcome

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Bulk upload with mixed rows submitted |
| **Test Steps** | 1. Open downloaded result XLSX |
| **Expected Result** | Each row marked Created / Updated / Unchanged / Error with message |
| **Priority** | High |

---

### ADM_SM_037 — Duplicate email in upload is allowed

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | XLSX has 2 rows with same email but different phones |
| **Test Steps** | 1. Upload and submit |
| **Expected Result** | Both rows processed successfully; email is not a uniqueness constraint |
| **Priority** | Medium |

---

## Sales Managers Negative & Edge Cases

### ADM_SM_038 — Assignable OFF does NOT auto-reassign existing customers

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM has assigned customers; toggling Assignable OFF |
| **Test Steps** | 1. Toggle Assignable OFF<br>2. Check existing customer assignments for that SM |
| **Expected Result** | Existing customer-SM relationships remain; manual reassignment required |
| **Priority** | High |

---

### ADM_SM_039 — Add SM with duplicate phone rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Add SM modal open |
| **Test Steps** | 1. Enter phone matching existing SM<br>2. Submit |
| **Expected Result** | Error shown; SM not created (phone is unique merge key) |
| **Priority** | High |

---

### ADM_SM_040 — Refresh SM list reflects external changes

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | SM list loaded; bulk upload just performed in another tab |
| **Test Steps** | 1. Click Refresh on SM page |
| **Expected Result** | New SMs from bulk upload now appear in the list |
| **Priority** | Medium |

---

### ADM_SM_054 — Add SM with email containing only spaces is rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Add SM modal open |
| **Test Steps** | 1. Enter Email "   "<br>2. Fill other fields<br>3. Submit |
| **Expected Result** | Validation error on Email (required + must be valid email format); SM not created |
| **Priority** | High |

---

### ADM_SM_055 — Add SM with mobile starting with 5 is rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Add SM modal open |
| **Test Steps** | 1. Enter Phone "5123456789"<br>2. Fill other fields<br>3. Submit |
| **Expected Result** | Validation error — Indian mobile must start with 6-9 per phone regex; SM not created |
| **Priority** | High |

---

### ADM_SM_056 — Add SM with phone containing letters is blocked at input level

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Add SM modal open |
| **Test Steps** | 1. Try typing "98abcd1234" in Phone field |
| **Expected Result** | Only digits accepted; field contains "981234" — non-digit keystrokes blocked |
| **Priority** | Medium |

---

### ADM_SM_057 — Newly added SM with Is Active = OFF cannot log in

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | New SM created with Is Active = OFF |
| **Test Steps** | 1. Open /sales-manager portal in incognito<br>2. Enter the new SM's phone<br>3. Submit Send OTP, then verify with master OTP 258369 |
| **Expected Result** | Verify-OTP returns HTTP 400 `"Your access to the portal has been revoked"`; SM cannot enter portal |
| **Priority** | Critical |

---

### ADM_SM_058 — Cancel button on Edit SM discards unsaved changes

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers |
| **Pre-conditions** | Edit SM modal open with field changes made |
| **Test Steps** | 1. Change Last Name to "Changed"<br>2. Click Cancel (do not save)<br>3. Re-locate SM in list |
| **Expected Result** | Modal closes; SM list shows the original Last Name unchanged; no PUT request fired |
| **Priority** | Medium |

---

## [FSD-CORRECTION] New TCs — SM source-verified gaps

### ADM_SM_FSD_041 — [FSD-CORRECTION] SM Admin (roleId=4) is FORCE-SET isAvailable=0

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers / DB |
| **BRD/FRD Req** | FSD §1 / `services/sales-manager.service.js:124,155` |
| **Pre-conditions** | Admin creates a new SM with roleId=4 and `isAvailable=true` in body |
| **Test Steps** | 1. POST `/api/v1/admin/sales-managers/create` with `{roleId:4, isAvailable:true, ...}`<br>2. Query DB for the new row |
| **Expected Result** | DB row has `isAvailable=0` regardless of input. SM Admins are excluded from ticket allocation rotation. |
| **Priority** | High |

---

### ADM_SM_FSD_042 — [FSD-CORRECTION] No DELETE endpoint for SM — must deactivate via PUT

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers / API |
| **BRD/FRD Req** | FSD §3.1 (no DELETE route) |
| **Pre-conditions** | Existing SM record |
| **Test Steps** | 1. DELETE `/api/v1/admin/sales-managers/<id>` |
| **Expected Result** | HTTP 404 route not found. Must use PUT `/update/:id` with `{isActive:false}` to deactivate. Document as expected limitation. |
| **Priority** | Medium |

---

### ADM_SM_FSD_043 — [FSD-CORRECTION] SM cannot call SM-admin management endpoints

| Field | Value |
|-------|-------|
| **Module** | ADM – Sales Managers / Security |
| **BRD/FRD Req** | FSD §2 (`restrictTo('admin')`) |
| **Pre-conditions** | Valid SM JWT (roleId=5) |
| **Test Steps** | 1. As SM, call `GET /api/v1/admin/sales-managers` |
| **Expected Result** | HTTP 403 Forbidden — only `admin` role allowed. SM-Admin (roleId=4) also denied. |
| **Priority** | High |

---
