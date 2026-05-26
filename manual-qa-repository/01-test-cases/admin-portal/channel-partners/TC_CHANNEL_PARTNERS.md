# Test Cases — Channel Partners
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-Channel-Partners.md
**FSD Reference:** `manual-qa-repository/03-user-manual/admin/fsd-channel-partners.md`
**Last FSD Sync:** 2026-05-24

---

## [FSD-CORRECTION] Source-verified facts

- CP = `users` row where `roleId = 3` AND `isCpRegistrationCompleted = true`.
- CP types derived purely from columns: Master (`isLeadCp=true`), Member (`leadCpId IS NOT NULL`), Standalone (else).
- **No admin endpoint exists for CP create / approve / reject / activate / deactivate / delete** — these features are NOT implemented in `admin-cp.controller.js`. Any TC asserting admin-side CP CRUD is INVALID.
- **No notification, email, SMS, or WhatsApp** is dispatched on any admin CP action (list, view, mark-master, map, bulk-map). Verified by grep.
- **No CP header/stats/count widget endpoint** — only `findAndCountAll.count` for paginated rows.
- SM Admin role is NOT permitted on CP admin endpoints — only `restrictTo('admin')` applies.
- Bulk-map Excel field name is `doc`.

---

## CP List & Page Layout

### ADM_CP_001 — Channel Partners page loads at /admin/channel-partners

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Channel Partners" in sidebar<br>2. Observe URL |
| **Expected Result** | URL is /admin/channel-partners; CP list table loads |
| **Priority** | Critical |

---

### ADM_CP_002 — Header shows fixed total count "N Channel Partners"

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Read header title |
| **Expected Result** | Title shows "2705 Channel Partners" (or current total); count does NOT change with filters |
| **Priority** | High |

---

### ADM_CP_003 — Header buttons: Map Master CP, Reset Filters, Refresh

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Inspect header buttons |
| **Expected Result** | Three buttons visible: "Map Master CP" (disabled by default), "Reset Filters", "Refresh" |
| **Priority** | High |

---

### ADM_CP_004 — Map Master CP button is disabled when no row selected

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | No rows selected |
| **Test Steps** | 1. Observe Map Master CP button state |
| **Expected Result** | Button is disabled/greyed out |
| **Priority** | Critical |

---

### ADM_CP_005 — CP table renders 13 columns plus Actions

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Inspect column headers |
| **Expected Result** | Columns: Owner Name, Firm Name, HV Code, Master HV Code, Business Region, Pincode, Phone, CP Type, SM Name, SM Email ID, SM Mobile Number, KYC Status, Actions |
| **Priority** | High |

---

### ADM_CP_006 — Checkbox column visible as leftmost column

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Inspect leftmost column |
| **Expected Result** | Checkbox column visible for row selection |
| **Priority** | High |

---

### ADM_CP_007 — Actions column shows eye icon and three-dot menu

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Inspect Actions column on a row |
| **Expected Result** | Eye icon (view) and three-dot (more actions) menu present |
| **Priority** | High |

---

### ADM_CP_008 — CP Type column shows Master CP or Member CP

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Read CP Type values |
| **Expected Result** | Values are "Master CP" or "Member CP" only |
| **Priority** | High |

---

### ADM_CP_009 — KYC Status shows Pending/Approved/Rejected/Verified

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Read KYC Status column values |
| **Expected Result** | Values: Pending, Approved, Rejected, or Verified |
| **Priority** | High |

---

### ADM_CP_010 — SM columns show "-" when no SM assigned

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP without assigned SM |
| **Test Steps** | 1. Inspect SM Name, SM Email ID, SM Mobile Number for that CP |
| **Expected Result** | All three columns show "-" |
| **Priority** | Medium |

---

## Search & Column Filters

### ADM_CP_011 — Phone search filters table server-side

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded; known CP phone |
| **Test Steps** | 1. Type phone number in search field at top<br>2. Wait |
| **Expected Result** | Table filters to matching CPs immediately |
| **Priority** | Critical |

---

### ADM_CP_012 — Header count does NOT change after phone search

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Phone search applied |
| **Test Steps** | 1. Observe header count after search |
| **Expected Result** | Header still shows total "2705 Channel Partners" — fixed count |
| **Priority** | High |

---

### ADM_CP_013 — Owner Name column filter via magnifying glass

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Click magnifying glass on Owner Name<br>2. Type partial name |
| **Expected Result** | Table filters to matching owner names |
| **Priority** | High |

---

### ADM_CP_014 — Firm Name column filter

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Click search icon on Firm Name<br>2. Type firm name |
| **Expected Result** | Table filters to matching firm |
| **Priority** | High |

---

### ADM_CP_015 — HV Code column filter

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Click search icon on HV Code<br>2. Type code |
| **Expected Result** | Table filters by HV Code |
| **Priority** | High |

---

### ADM_CP_016 — Pincode column filter

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Click search icon on Pincode<br>2. Type pincode |
| **Expected Result** | Table filters by pincode |
| **Priority** | Medium |

---

### ADM_CP_017 — Master HV Code dropdown filter

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Click funnel icon on Master HV Code<br>2. Select a Master from dropdown |
| **Expected Result** | Table filters to CPs mapped under selected Master |
| **Priority** | High |

---

### ADM_CP_018 — Business Region dropdown filter

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Click funnel icon on Business Region<br>2. Select a region |
| **Expected Result** | Table filters to that region |
| **Priority** | Medium |

---

### ADM_CP_019 — CP Type filter to Master CP only

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Click funnel icon on CP Type<br>2. Select Master CP |
| **Expected Result** | Table shows only Master CPs |
| **Priority** | High |

---

### ADM_CP_020 — CP Type filter to Member CP only

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Filter CP Type = Member CP |
| **Expected Result** | Table shows only Member CPs |
| **Priority** | High |

---

### ADM_CP_021 — Reset Filters clears all search and column filters

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Multiple filters applied |
| **Test Steps** | 1. Click Reset Filters |
| **Expected Result** | All inputs cleared; full CP list reloaded from server |
| **Priority** | High |

---

### ADM_CP_022 — Refresh button re-fetches data without clearing filters

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Click Refresh |
| **Expected Result** | Data reloaded; current filters preserved |
| **Priority** | Medium |

---

## CP Detail Drawer

### ADM_CP_023 — Click eye icon opens detail drawer

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Click eye icon on a CP row |
| **Expected Result** | Detail drawer slides in from right |
| **Priority** | Critical |

---

### ADM_CP_024 — Detail drawer has Basic Information section

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Detail drawer open |
| **Test Steps** | 1. Locate Basic Information section |
| **Expected Result** | Shows HV Code, CP type, KYC status fields |
| **Priority** | High |

---

### ADM_CP_025 — Detail drawer has Firm Details section

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Detail drawer open |
| **Test Steps** | 1. Locate Firm Details section |
| **Expected Result** | Shows Business name, registration details |
| **Priority** | High |

---

### ADM_CP_026 — Detail drawer has Contact Details section

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Detail drawer open |
| **Test Steps** | 1. Locate Contact Details section |
| **Expected Result** | Shows Phone, email, address |
| **Priority** | High |

---

### ADM_CP_027 — Detail drawer has Additional Details section

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Detail drawer open |
| **Test Steps** | 1. Locate Additional Details section |
| **Expected Result** | Shows additional business info |
| **Priority** | Medium |

---

### ADM_CP_028 — Close drawer with X button

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Detail drawer open |
| **Test Steps** | 1. Click X button on drawer |
| **Expected Result** | Drawer slides out; table view resumes |
| **Priority** | Medium |

---

### ADM_CP_046 — Detail drawer shows KYC documents section when CP has KYC submitted

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Detail drawer open on a CP with KYC Status = Approved/Verified |
| **Test Steps** | 1. Scroll within drawer to locate KYC section |
| **Expected Result** | KYC section shows submitted documents (or document references) — admin can view but cannot edit/approve from drawer (FSD §1: no admin KYC mutation) |
| **Priority** | Medium |

---

### ADM_CP_047 — Detail drawer for a Master CP shows mapped members count

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | A Master CP with at least 3 mapped members |
| **Test Steps** | 1. Click eye icon on the Master CP row<br>2. Inspect drawer for member count |
| **Expected Result** | Drawer displays mapped Member CP count for the Master (e.g. "3 mapped members") |
| **Priority** | Medium |

---

## Mark as Master / Map to Master

### ADM_CP_029 — Three-dot menu shows Mark as Master option for Member CP

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Row is a Member CP |
| **Test Steps** | 1. Click three-dot menu on Member CP row |
| **Expected Result** | Dropdown shows "Mark as Master" option |
| **Priority** | High |

---

### ADM_CP_030 — Mark as Master changes CP Type to Master CP

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Member CP row identified |
| **Test Steps** | 1. Open three-dot menu<br>2. Click Mark as Master<br>3. Confirm if prompted |
| **Expected Result** | CP Type changes from Member CP to Master CP in list; CP now appears in Master HV Code dropdowns |
| **Priority** | Critical |

---

### ADM_CP_031 — Select single row enables Map Master CP button

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Check checkbox on one Member CP row<br>2. Observe Map Master CP button |
| **Expected Result** | Map Master CP button becomes enabled |
| **Priority** | Critical |

---

### ADM_CP_032 — Select multiple rows enables Map Master CP

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Check 3 rows<br>2. Observe button |
| **Expected Result** | Map Master CP enabled; count "3" may show somewhere |
| **Priority** | High |

---

### ADM_CP_033 — Click Map Master CP opens modal

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | At least one row selected |
| **Test Steps** | 1. Click Map Master CP |
| **Expected Result** | Modal titled "Map CPs to Master" opens with Master HV Code dropdown |
| **Priority** | Critical |

---

### ADM_CP_034 — Map modal shows count of CPs to be mapped

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | 3 rows selected; modal open |
| **Test Steps** | 1. Inspect modal for selection count |
| **Expected Result** | Modal indicates "3 CPs will be mapped" or similar |
| **Priority** | High |

---

### ADM_CP_035 — Master HV Code dropdown lists only Master CPs

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Map modal open |
| **Test Steps** | 1. Click Master HV Code dropdown |
| **Expected Result** | Dropdown lists only CPs with CP Type = Master CP |
| **Priority** | High |

---

### ADM_CP_036 — Confirm mapping without selecting Master rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Map modal open; no Master selected |
| **Test Steps** | 1. Click Confirm |
| **Expected Result** | Validation error; Master must be selected |
| **Priority** | High |

---

### ADM_CP_037 — Confirm mapping updates Master HV Code for selected CPs

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | 2 CPs selected; Master chosen in modal |
| **Test Steps** | 1. Click Confirm |
| **Expected Result** | Master HV Code column updates for those 2 rows; modal closes; success toast |
| **Priority** | Critical |

---

## CP Integration & Negative Cases

### ADM_CP_038 — SM columns auto-populate from SM-CP assignment

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP has assigned SM in Sales Managers module |
| **Test Steps** | 1. Locate that CP in list |
| **Expected Result** | SM Name, SM Email ID, SM Mobile Number columns show that SM's details |
| **Priority** | High |

---

### ADM_CP_039 — CP appears as Growth Partner in Customers module

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP has registered buyers |
| **Test Steps** | 1. Open Customers module<br>2. Find registration registered by this CP |
| **Expected Result** | Growth Partner column shows the CP's HV Code |
| **Priority** | High |

---

### ADM_CP_040 — Search for non-existent phone returns empty table

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Type "0000000000" in phone search |
| **Expected Result** | Table empty; header count still shows total |
| **Priority** | Medium |

---

### ADM_CP_041 — Pagination on CP list

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP page loaded |
| **Test Steps** | 1. Click Next page in pagination |
| **Expected Result** | Next 10 CPs load |
| **Priority** | Medium |

---

### ADM_CP_042 — Mapping CP that is already mapped to another Master

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | CP already mapped to Master A |
| **Test Steps** | 1. Select that CP<br>2. Map to Master B<br>3. Confirm |
| **Expected Result** | Master HV Code updates from A to B; previous mapping replaced |
| **Priority** | Medium |

---

### ADM_CP_048 — Bulk Map via Excel upload uses `doc` multipart field

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners / API |
| **BRD/FRD Req** | FSD §1 — bulk-map-excel `doc` field |
| **Pre-conditions** | XLSX prepared with columns: Member HV Code, Master HV Code (rows for 5 valid pairings) |
| **Test Steps** | 1. Locate Bulk Map Excel upload control<br>2. Upload XLSX; capture network call |
| **Expected Result** | POST `/api/v1/admin/cp/bulk-map-excel` is sent with multipart field name `doc` containing the file; response returns per-row outcome |
| **Priority** | High |

---

### ADM_CP_049 — Mapping a Master CP under another Master is rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **BRD/FRD Req** | FSD §1 — CP type derivation (`isLeadCp=true` cannot also be member) |
| **Pre-conditions** | Two Master CPs exist: Master A and Master B |
| **Test Steps** | 1. Select Master B's row<br>2. Click Map Master CP<br>3. Choose Master A in dropdown<br>4. Confirm |
| **Expected Result** | Backend rejects with 400 (Master cannot be mapped under another Master); Master B's `isLeadCp` remains true |
| **Priority** | High |

---

### ADM_CP_050 — Selecting deselects when checkbox unchecked

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners |
| **Pre-conditions** | Two rows currently selected; Map Master CP enabled |
| **Test Steps** | 1. Uncheck one of the selected rows<br>2. Uncheck the second row<br>3. Observe Map Master CP button |
| **Expected Result** | After both unchecks, Map Master CP returns to disabled state; selection count drops to 0 |
| **Priority** | Medium |

---

## [FSD-CORRECTION] New TCs — CP admin source-verified gaps

### ADM_CP_FSD_043 — [FSD-CORRECTION] No admin-side CP create / approve / activate / deactivate / delete

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners / API |
| **BRD/FRD Req** | FSD §1 Out-of-Scope |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Try to find any UI/API to create, approve, reject, activate, deactivate, or delete a CP from /admin/channel-partners |
| **Expected Result** | No such UI or API exists. Verified by enumerating admin-cp routes (`routes/admin.routes.js:187-200`): only list/get/mark-master/map/bulk-map. Any BRD claim of CP CRUD from admin is INVALID. |
| **Priority** | High |

---

### ADM_CP_FSD_044 — [FSD-CORRECTION] CP admin actions dispatch NO notification

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners / Notifications |
| **BRD/FRD Req** | FSD §1 / grep verification |
| **Pre-conditions** | Admin performs `mark-master`, `map-master`, or `bulk-map-excel` |
| **Test Steps** | 1. Mark a CP as master<br>2. Map members to a master<br>3. Inspect Kaleyra/epinet/email logs and CP phone |
| **Expected Result** | NO SMS, NO WhatsApp, NO email dispatched. Only DB updates + audit log. |
| **Priority** | Medium |

---

### ADM_CP_FSD_045 — [FSD-CORRECTION] SM Admin denied on CP admin endpoints

| Field | Value |
|-------|-------|
| **Module** | ADM – Channel Partners / Security |
| **BRD/FRD Req** | FSD §2 (`restrictTo('admin')`) |
| **Pre-conditions** | Valid SM Admin JWT |
| **Test Steps** | 1. SM Admin calls `GET /api/v1/admin/cp` |
| **Expected Result** | HTTP 403 Forbidden — only `admin` role is allowed. |
| **Priority** | High |

---
