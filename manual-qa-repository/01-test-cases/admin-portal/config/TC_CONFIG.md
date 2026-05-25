# Test Cases — Config / CMS
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-Config-CMS.md

---

## Config Page Layout & Tower Configuration (Section 1)

### ADM_CFG_001 — Config page loads at /admin/cms

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Config" in sidebar<br>2. Observe URL and page |
| **Expected Result** | URL becomes /admin/cms; page titled "Configurations" loads with 9 sections |
| **Priority** | Critical |

---

### ADM_CFG_002 — Page is single long-scroll with 9 sections

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Config page loaded |
| **Test Steps** | 1. Scroll from top to bottom |
| **Expected Result** | Sections visible in order: Tower Configuration, Registration Status, Unit Status, Unit Cost Update, Bulk Booking Cancellation, Bulk Registration Cancellation, Sales Managers, Customer Actions Card, Max Preferences Per Unit |
| **Priority** | High |

---

### ADM_CFG_003 — Tower Configuration section shows grid of 18 towers

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Config page loaded |
| **Test Steps** | 1. Scroll to Tower Configuration section |
| **Expected Result** | 18 tower cards visible each with a toggle (green=Active, grey=Inactive) |
| **Priority** | High |

---

### ADM_CFG_004 — Crest and Crown shown Active by default on UAT

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Default UAT state |
| **Test Steps** | 1. Inspect toggles for Crest and Crown |
| **Expected Result** | Crest and Crown toggles are ON (green) |
| **Priority** | High |

---

### ADM_CFG_005 — Toggle a tower ON does not auto-save

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Inactive tower (e.g. Pinnacle) |
| **Test Steps** | 1. Click toggle on Pinnacle (OFF→ON)<br>2. Navigate away without clicking Update |
| **Expected Result** | Change discarded; toggle reverts on return to Config page |
| **Priority** | Critical |

---

### ADM_CFG_006 — Update Tower Configuration button saves toggles

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | At least one toggle changed |
| **Test Steps** | 1. Toggle Pinnacle ON<br>2. Click Update Tower Configuration |
| **Expected Result** | Success toast "Tower Status Updated Successfully"; toggle persists; Towers page Active count updates |
| **Priority** | Critical |

---

### ADM_CFG_007 — Each tower card has "View Tower" link

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Tower Configuration section visible |
| **Test Steps** | 1. Locate green "View Tower >" link on a card |
| **Expected Result** | Link visible per tower card |
| **Priority** | Medium |

---

### ADM_CFG_008 — Click View Tower opens that tower in Towers page

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Tower Configuration section visible |
| **Test Steps** | 1. Click "View Tower >" next to Crest |
| **Expected Result** | Navigates to /admin/towers with Crest selected and grid loaded |
| **Priority** | High |

---

### ADM_CFG_009 — Toggle all 18 towers OFF and save

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Tower Configuration section visible |
| **Test Steps** | 1. Toggle all towers OFF<br>2. Click Update Tower Configuration |
| **Expected Result** | All inactive; Active Towers KPI = 0 across portal |
| **Priority** | Medium |

---

## Section 2 — Registration Status

### ADM_CFG_010 — Registration Status section has Sample Download button

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Config page loaded |
| **Test Steps** | 1. Scroll to Section 2 |
| **Expected Result** | Section shows Sample File Download, Upload File, Submit controls |
| **Priority** | High |

---

### ADM_CFG_011 — Download Registration Status sample CSV

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Section 2 visible |
| **Test Steps** | 1. Click Sample File Download in Section 2 |
| **Expected Result** | CSV downloads with columns: Registration Number, Allocation Status |
| **Priority** | High |

---

### ADM_CFG_012 — Upload Registration Status CSV with Allow values

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | CSV prepared with 3 rows: registration number + Allow |
| **Test Steps** | 1. Click Upload File<br>2. Select CSV<br>3. Click Submit |
| **Expected Result** | Success response; rows marked eligible for next campaign |
| **Priority** | Critical |

---

### ADM_CFG_013 — Upload with Forbid blocks registrations

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | CSV with Forbid values |
| **Test Steps** | 1. Upload and Submit |
| **Expected Result** | Marked rows blocked from campaign participation |
| **Priority** | Critical |

---

### ADM_CFG_014 — Allocation Status is case-insensitive

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | CSV with mixed cases "allow", "Allow", "ALLOW" |
| **Test Steps** | 1. Upload and Submit |
| **Expected Result** | All three values processed successfully — case-insensitive |
| **Priority** | Medium |

---

### ADM_CFG_015 — Submit Section 2 without file shows no validation (KNOWN BUG_010)

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Section 2 visible; no file selected |
| **Test Steps** | 1. Click Submit in Section 2 without selecting file |
| **Expected Result** | KNOWN BUG_010: System silently fails; no error message. Expected behavior: should prompt for file selection |
| **Priority** | High |

---

## Section 3 — Unit Status

### ADM_CFG_016 — Download Unit Status sample CSV

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Section 3 visible |
| **Test Steps** | 1. Click Sample File Download in Section 3 |
| **Expected Result** | CSV downloads with columns including Unit, Status, Update |
| **Priority** | High |

---

### ADM_CFG_017 — Upload Unit Status with AVAILABLE values

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | CSV with rows Status=AVAILABLE, Update=1 |
| **Test Steps** | 1. Upload and Submit |
| **Expected Result** | Units set to AVAILABLE; reflected in Towers grid as white |
| **Priority** | Critical |

---

### ADM_CFG_018 — Upload Unit Status with RESERVED values

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | CSV with Status=RESERVED, Update=1 |
| **Test Steps** | 1. Upload and Submit |
| **Expected Result** | Units set to RESERVED; reflected in Towers grid as grey |
| **Priority** | Critical |

---

### ADM_CFG_019 — Update = 0 rows are skipped

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | CSV with mix of Update=1 and Update=0 |
| **Test Steps** | 1. Upload and Submit |
| **Expected Result** | Only Update=1 rows applied; Update=0 rows ignored |
| **Priority** | High |

---

### ADM_CFG_020 — All rows Update=0 shows "No rows marked" message

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | CSV with all Update=0 |
| **Test Steps** | 1. Upload and Submit |
| **Expected Result** | Message "No rows marked for update" |
| **Priority** | Medium |

---

### ADM_CFG_021 — Invalid status value (e.g. BLOCKED) returns row error

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | CSV with one row Status=BLOCKED, Update=1 |
| **Test Steps** | 1. Upload and Submit |
| **Expected Result** | Result file shows that row flagged as Error |
| **Priority** | High |

---

## Section 4 — Unit Cost Update

### ADM_CFG_022 — Available Unit Inventory Download button

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Section 4 visible |
| **Test Steps** | 1. Click "Available Unit Inventory Download" |
| **Expected Result** | Current pricing XLSX downloads with all units, Agreement_Value, EarlyBird columns |
| **Priority** | High |

---

### ADM_CFG_023 — Upload Unit Cost XLSX with modified prices

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | XLSX edited with new Agreement_Value, Update=1 |
| **Test Steps** | 1. Upload XLSX<br>2. Submit |
| **Expected Result** | Success; new prices applied; reflected in Towers detail panel |
| **Priority** | Critical |

---

### ADM_CFG_024 — Pricing changes take effect immediately during active campaign

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Active campaign; new prices uploaded |
| **Test Steps** | 1. Upload pricing update<br>2. Refresh buyer's unit view |
| **Expected Result** | Buyer sees new Agreement Value immediately, mid-campaign |
| **Priority** | Critical |

---

### ADM_CFG_025 — EarlyBird column update reflects in unit detail

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | XLSX with new EarlyBird value, Update=1 |
| **Test Steps** | 1. Upload and Submit<br>2. Open unit in Towers |
| **Expected Result** | Early Bird Discount in unit detail panel shows new value |
| **Priority** | High |

---

### ADM_CFG_026 — Update=0 rows are skipped in pricing upload

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | XLSX with mixed Update values |
| **Test Steps** | 1. Upload and Submit |
| **Expected Result** | Only Update=1 rows applied; original price preserved on Update=0 rows |
| **Priority** | High |

---

## Section 5 — Bulk Booking Cancellation

### ADM_CFG_027 — Download bulk booking cancellation sample

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Section 5 visible |
| **Test Steps** | 1. Click Sample File Download |
| **Expected Result** | XLSX downloads with column: Registration Number |
| **Priority** | High |

---

### ADM_CFG_028 — Upload booking cancellation list

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | XLSX with 3 registration numbers |
| **Test Steps** | 1. Upload XLSX<br>2. Submit |
| **Expected Result** | Bookings cancelled for those registrations; status updates in Customers |
| **Priority** | Critical |

---

### ADM_CFG_029 — Booking cancellation does not auto-refund

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Booking cancellation just performed |
| **Test Steps** | 1. Check Payment Transactions for refund record |
| **Expected Result** | No automatic refund transaction; refund must be initiated separately |
| **Priority** | High |

---

## Section 6 — Bulk Registration Cancellation

### ADM_CFG_030 — Download registration cancellation sample

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Section 6 visible |
| **Test Steps** | 1. Click Sample File Download |
| **Expected Result** | XLSX downloads with columns: Registration Number, Update |
| **Priority** | High |

---

### ADM_CFG_031 — Upload registration cancellation cancels all sub-registrations

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | XLSX with registration GHNG-XXX (has sub-registrations -A, -B, -C), Update=1 |
| **Test Steps** | 1. Upload and Submit<br>2. Check Customers module |
| **Expected Result** | All sub-registrations (-A, -B, -C) cancelled cascadingly; irreversible |
| **Priority** | Critical |

---

### ADM_CFG_032 — Registration cancellation does not auto-refund

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Cancellation just performed |
| **Test Steps** | 1. Check Payment Transactions |
| **Expected Result** | No automatic refund created |
| **Priority** | High |

---

## Section 7 — Sales Managers Bulk Upload

### ADM_CFG_033 — Download Sales Managers sample XLSX

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Section 7 visible |
| **Test Steps** | 1. Click Sample File Download in Section 7 |
| **Expected Result** | XLSX downloads with columns: Role, First Name, Last Name, Email, Phone, IS_AVAILABLE, IS_ACTIVE |
| **Priority** | High |

---

### ADM_CFG_034 — Bulk upload creates new SMs

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | XLSX with new SM rows (phones not in system) |
| **Test Steps** | 1. Upload and Submit |
| **Expected Result** | Result XLSX shows Created entries; SMs appear in /admin/sales-managers |
| **Priority** | Critical |

---

### ADM_CFG_035 — Existing phone triggers SM update (merge key)

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | XLSX with existing SM phone + new Last Name |
| **Test Steps** | 1. Upload and Submit |
| **Expected Result** | Result shows Updated; SM record updated with new Last Name |
| **Priority** | Critical |

---

### ADM_CFG_036 — Section 7 rejects .csv format

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | A .csv file prepared |
| **Test Steps** | 1. Try to upload .csv in Section 7 |
| **Expected Result** | Upload rejected; only .xlsx accepted |
| **Priority** | High |

---

### ADM_CFG_037 — Result XLSX shows per-row status

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Mixed upload completed |
| **Test Steps** | 1. Open downloaded result file |
| **Expected Result** | Each row marked Created / Updated / Unchanged / Error |
| **Priority** | High |

---

## Section 8 — Customer Actions Card

### ADM_CFG_038 — Customer Actions Card shows master toggle and 3 checkboxes

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Section 8 visible |
| **Test Steps** | 1. Scroll to Customer Actions Card |
| **Expected Result** | Shows: Allow Additional Registrations master toggle, 1 Bed Growth Home checkbox + count, 2 Bed Growth Home checkbox + count, 2 Bed Rise Home checkbox + count, Submit button |
| **Priority** | High |

---

### ADM_CFG_039 — Verify default UAT state for typology limits

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Default UAT state |
| **Test Steps** | 1. Inspect count dropdowns |
| **Expected Result** | 1-bed = 15, 2-bed growth = 17, 2-bed rise = 20 (per BRD) |
| **Priority** | Medium |

---

### ADM_CFG_040 — Toggle master OFF overrides individual checkboxes

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Individual checkboxes ON |
| **Test Steps** | 1. Toggle "Allow Additional Registrations" OFF<br>2. Click Submit |
| **Expected Result** | All registration types blocked regardless of individual checkboxes |
| **Priority** | Critical |

---

### ADM_CFG_041 — Change typology count from 15 to 5

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | 1-bed currently set to 15 |
| **Test Steps** | 1. Select 5 from 1 Bed count dropdown<br>2. Click Submit |
| **Expected Result** | New limit saved; buyers can only register up to 5 of 1-bed units |
| **Priority** | High |

---

### ADM_CFG_042 — Uncheck a typology blocks that type only

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Master toggle ON, all checkboxes checked |
| **Test Steps** | 1. Uncheck "2 Bed Rise Home"<br>2. Submit |
| **Expected Result** | 2 Bed Rise registrations blocked; other types still allowed |
| **Priority** | High |

---

## Section 9 — Max Preferences Per Unit

### ADM_CFG_043 — Section 9 shows current Max Preferences value

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Section 9 visible |
| **Test Steps** | 1. Inspect Max Preferences Per Unit dropdown |
| **Expected Result** | Dropdown shows current limit (default 6) |
| **Priority** | High |

---

### ADM_CFG_044 — Change Max Preferences to 10 via Update button

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Section 9 visible |
| **Test Steps** | 1. Select 10 from dropdown<br>2. Click Update |
| **Expected Result** | Limit saved; new preferences capped at 10 per unit |
| **Priority** | Critical |

---

### ADM_CFG_045 — Max Preferences valid range 0-255

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Section 9 visible |
| **Test Steps** | 1. Inspect dropdown range |
| **Expected Result** | Values from 0 to 255 selectable per BRD |
| **Priority** | Medium |

---

### ADM_CFG_046 — Reducing limit does not invalidate existing preferences

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | A unit has 6 existing preferences; current limit = 6 |
| **Test Steps** | 1. Reduce limit to 3<br>2. Click Update<br>3. Check existing preferences |
| **Expected Result** | Existing 6 preferences remain valid; only new preferences blocked beyond 3 |
| **Priority** | High |

---

## Cross-Section & Edge Cases

### ADM_CFG_047 — Each section has its own Upload and Submit buttons

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Config page loaded |
| **Test Steps** | 1. Inspect each upload section |
| **Expected Result** | Each section has independent Upload File and Submit controls; clicking wrong section's Submit processes wrong section |
| **Priority** | High |

---

### ADM_CFG_048 — Bulk upload error returns Excel error file with HTTP 400

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Upload with row errors |
| **Test Steps** | 1. Upload XLSX with bad rows<br>2. Submit<br>3. Observe network response |
| **Expected Result** | HTTP 400 returned with downloadable error XLSX (not generic toast) |
| **Priority** | High |

---

### ADM_CFG_049 — Page distinguishes Config from external CMS link

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | Config page loaded |
| **Test Steps** | 1. Confirm sidebar has both Config and CMS entries |
| **Expected Result** | Config opens /admin/cms (this module); CMS opens external Strapi domain |
| **Priority** | Medium |

---

### ADM_CFG_050 — Tower Configuration Update without changes still triggers save

| Field | Value |
|-------|-------|
| **Module** | ADM – Config |
| **Pre-conditions** | No toggle changes made |
| **Test Steps** | 1. Click Update Tower Configuration |
| **Expected Result** | Save completes without errors; toast shown |
| **Priority** | Low |

---
