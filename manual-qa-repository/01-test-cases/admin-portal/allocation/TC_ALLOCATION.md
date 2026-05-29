# Test Cases — Allocation
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-Allocation.md
**FSD Reference:** `manual-qa-repository/03-user-manual/admin/fsd-allocation.md`
**Last FSD Sync:** 2026-05-24

---

## [FSD-CORRECTION] Source-verified facts

- Three allocation modes: **STATIC, DYNAMIC, PHYSICAL_EVENT**.
- All admin allocation endpoints sit under `restrictTo('admin')` only — SM Admin is NOT permitted.
- `POST /campaigns` supports two multipart files: `allotmentExcel` and `commonPoolExcel`.
- Manual reconcile endpoint exists: `POST /api/v1/admin/allocation/transaction/check`.
- Cron endpoint: `GET /api/v1/cron-allocation-operations`.
- Active allocation campaign **BLOCKS** all admin Customers writes (cancel, swap, assign, refund, parking).
- Notification on Assign Unit (admin) = WhatsApp `congrates_payment_success_27sept` + SMS `ALLOTMENT_PAYMENT_SUCCESS` (only for `+91`). NO email.

---

## Campaign List & Page Layout

### ADM_ALLOC_001 — Allocation page loads at /admin/allocation

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Admin logged in |
| **Type** | UI |
| **Test Steps** | 1. Click "Allocation" in sidebar<br>2. Observe URL |
| **Expected Result** | URL is /admin/allocation; campaigns list/form loads |
| **Priority** | Critical |

---

### ADM_ALLOC_002 — Page shows campaign list with Status column

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Allocation page loaded |
| **Type** | UI |
| **Test Steps** | 1. Inspect campaigns table |
| **Expected Result** | Table shows columns: Name, Type, Start Time, End Time, Status, Actions |
| **Priority** | High |

---

### ADM_ALLOC_003 — Status column values match defined campaign states

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Allocation page loaded |
| **Type** | UI |
| **Test Steps** | 1. Read distinct Status values |
| **Expected Result** | Values are: Upcoming, Active, Completed, Cancelled, Stopped, Failed |
| **Priority** | High |

---

### ADM_ALLOC_004 — Campaign type column shows Static / Dynamic / Physical Event

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Allocation page loaded |
| **Type** | UI |
| **Test Steps** | 1. Read Type column values |
| **Expected Result** | Values: Static, Dynamic, or Physical Event |
| **Priority** | High |

---

### ADM_ALLOC_005 — Create New Campaign button is visible

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Allocation page loaded |
| **Type** | UI |
| **Test Steps** | 1. Locate "Save Campaign" / "Create Campaign" form/button |
| **Expected Result** | Campaign creation form or button is visible |
| **Priority** | High |

---

## Create Campaign — Static

### ADM_ALLOC_006 — Open Create Campaign form

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Allocation page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Click Create Campaign / Add Campaign button |
| **Expected Result** | Form displayed with fields: Name, Type, Start Time, End Time |
| **Priority** | Critical |

---

### ADM_ALLOC_007 — Create Static campaign with valid future start time

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | At least one tower active in Config; Create Campaign form open |
| **Type** | FUNC |
| **Test Steps** | 1. Enter Name "Test Static Campaign"<br>2. Select Type = Static<br>3. Set Start Time = current time + 5 minutes<br>4. Set End Time = current time + 2 hours<br>5. Click Save Campaign |
| **Expected Result** | Campaign created with status = Upcoming; appears in list |
| **Priority** | Critical |

---

### ADM_ALLOC_008 — Create campaign with start time less than 3 minutes from now is rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create Campaign form open |
| **Type** | VAL |
| **Test Steps** | 1. Set Start Time = current time + 1 minute<br>2. Fill other fields<br>3. Click Save Campaign |
| **Expected Result** | Validation error: "Start time must be at least 3 minutes in the future" |
| **Priority** | Critical |

---

### ADM_ALLOC_009 — Create campaign with end time before start time is rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create Campaign form open |
| **Type** | VAL |
| **Test Steps** | 1. Set Start Time = now + 10 min<br>2. Set End Time = now + 5 min<br>3. Click Save Campaign |
| **Expected Result** | Validation error: end time must be after start time |
| **Priority** | High |

---

### ADM_ALLOC_010 — Create campaign with empty name is rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create Campaign form open |
| **Type** | VAL |
| **Test Steps** | 1. Leave Name empty<br>2. Fill other fields<br>3. Click Save Campaign |
| **Expected Result** | Name required validation error shown |
| **Priority** | High |

---

### ADM_ALLOC_011 — Campaign Type dropdown shows three options

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create Campaign form open |
| **Type** | UI |
| **Test Steps** | 1. Click Type dropdown |
| **Expected Result** | Options: Static, Dynamic, Physical Event |
| **Priority** | High |

---

## Create Campaign — Dynamic & Physical

### ADM_ALLOC_012 — Create Dynamic campaign with round configuration

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create Campaign form open; tower active |
| **Type** | FUNC |
| **Test Steps** | 1. Enter Name "Dyn Campaign"<br>2. Select Type = Dynamic<br>3. Configure rounds<br>4. Set Start = now+5min<br>5. Save |
| **Expected Result** | Dynamic campaign created with status Upcoming |
| **Priority** | High |

---

### ADM_ALLOC_013 — Create Physical Event campaign

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create Campaign form open |
| **Type** | FUNC |
| **Test Steps** | 1. Enter Name "On-Site Event"<br>2. Select Type = Physical Event<br>3. Set times<br>4. Save |
| **Expected Result** | Physical Event campaign created; admin/SM can assign units offline |
| **Priority** | High |

---

### ADM_ALLOC_039 — Dynamic campaign requires round configuration to be defined

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create Campaign form open; Type = Dynamic selected |
| **Type** | VAL |
| **Test Steps** | 1. Leave round configuration empty<br>2. Set valid Name and times<br>3. Click Save Campaign |
| **Expected Result** | Validation error: at least one round must be configured for Dynamic campaign; campaign not created |
| **Priority** | Critical |

---

### ADM_ALLOC_040 — Dynamic campaign with allotmentExcel file upload accepted

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **BRD/FRD Req** | FSD §1 — `POST /campaigns` multipart fields |
| **Pre-conditions** | Create Campaign form open; Type = Dynamic |
| **Type** | FUNC |
| **Test Steps** | 1. Fill Name, Start, End times<br>2. Configure 1 round<br>3. Upload `allotmentExcel` file<br>4. Click Save |
| **Expected Result** | Multipart POST `/admin/allocation/campaigns` includes `allotmentExcel` field; campaign created with status Upcoming |
| **Priority** | High |

---

### ADM_ALLOC_041 — Physical Event campaign supports commonPoolExcel file upload

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **BRD/FRD Req** | FSD §1 — `POST /campaigns` multipart fields |
| **Pre-conditions** | Create Campaign form open; Type = Physical Event |
| **Type** | FUNC |
| **Test Steps** | 1. Fill required fields<br>2. Upload `commonPoolExcel` file<br>3. Save |
| **Expected Result** | Multipart POST includes `commonPoolExcel` field; campaign created |
| **Priority** | High |

---

### ADM_ALLOC_042 — Physical Event campaign Notify endpoint dispatches QR codes

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation / Notifications |
| **BRD/FRD Req** | FSD §2 endpoint 7 |
| **Pre-conditions** | Physical Event campaign exists with registrants |
| **Type** | INT |
| **Test Steps** | 1. Locate the Physical Event campaign row<br>2. Click Notify action<br>3. Inspect outbound dispatch logs |
| **Expected Result** | POST `/api/v1/admin/allocation/campaigns/<id>/notify` fires; QR codes dispatched to registrants of that campaign only |
| **Priority** | High |

---

### ADM_ALLOC_043 — Dynamic campaign type cannot be changed after creation

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Dynamic campaign created with status Upcoming |
| **Type** | BIZ |
| **Test Steps** | 1. Locate the Dynamic campaign<br>2. Attempt to edit and change Type to Static |
| **Expected Result** | Type field is read-only post-creation; no PUT exists to mutate type — only Stop/Cancel/Notify actions are available |
| **Priority** | Medium |

---

### ADM_ALLOC_053 — Physical Event campaign Notify button visible only on Physical Event rows

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **BRD/FRD Req** | FSD §2 endpoint 7 |
| **Pre-conditions** | List contains one Static, one Dynamic, one Physical Event campaign |
| **Type** | UI |
| **Test Steps** | 1. Inspect Actions column on each row type |
| **Expected Result** | Notify action appears only on Physical Event campaign row; Static and Dynamic rows do not show the Notify action |
| **Priority** | High |

---

## Campaign Lifecycle Transitions

### ADM_ALLOC_014 — Upcoming campaign auto-transitions to Active at start time

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign with status Upcoming whose start time is approaching |
| **Type** | BIZ |
| **Test Steps** | 1. Wait until campaign start time<br>2. Refresh allocation list |
| **Expected Result** | Status transitions from Upcoming to Active automatically |
| **Priority** | Critical |

---

### ADM_ALLOC_015 — Active campaign auto-transitions to Completed at end time

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Active campaign whose end time is reached |
| **Type** | BIZ |
| **Test Steps** | 1. Wait until end time<br>2. Refresh list |
| **Expected Result** | Status changes from Active to Completed |
| **Priority** | High |

---

### ADM_ALLOC_016 — Stop button stops an Active campaign

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign is currently Active |
| **Type** | FUNC |
| **Test Steps** | 1. Locate Active campaign row<br>2. Click Stop button<br>3. Confirm |
| **Expected Result** | Status changes from Active to Stopped immediately |
| **Priority** | Critical |

---

### ADM_ALLOC_017 — Cancel button cancels an Upcoming campaign

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign with Upcoming status |
| **Type** | FUNC |
| **Test Steps** | 1. Locate Upcoming campaign<br>2. Click Cancel<br>3. Confirm |
| **Expected Result** | Status changes from Upcoming to Cancelled |
| **Priority** | Critical |

---

### ADM_ALLOC_018 — Cannot Cancel an Active campaign (only Stop available)

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign is Active |
| **Type** | BIZ |
| **Test Steps** | 1. Inspect actions on Active row |
| **Expected Result** | Cancel button not shown for Active campaigns; only Stop available |
| **Priority** | High |

---

### ADM_ALLOC_019 — Cannot Stop an Upcoming campaign (only Cancel)

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign is Upcoming |
| **Type** | BIZ |
| **Test Steps** | 1. Inspect actions on Upcoming row |
| **Expected Result** | Stop button not shown; only Cancel available |
| **Priority** | High |

---

### ADM_ALLOC_020 — Stop confirmation dialog must be confirmed

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Active campaign exists |
| **Type** | FUNC |
| **Test Steps** | 1. Click Stop<br>2. Click outside dialog to dismiss |
| **Expected Result** | Stop not performed; campaign still Active |
| **Priority** | High |

---

## Post-Campaign Effects

### ADM_ALLOC_021 — Buyers who didn't pay become Waitlisted post-Stop

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign just stopped with some unpaid buyers |
| **Type** | BIZ |
| **Test Steps** | 1. Stop active campaign<br>2. Open Customers module<br>3. Inspect statuses of those buyers |
| **Expected Result** | Allocation Status = Waitlisted for non-paying buyers |
| **Priority** | Critical |

---

### ADM_ALLOC_022 — Buyers who paid remain Confirmed (Booked)

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign stopped; some buyers had paid |
| **Type** | BIZ |
| **Test Steps** | 1. Open Customers module<br>2. Inspect paid buyers |
| **Expected Result** | Allocation Status = Booked Online/Booked Offline; Confirmation = Paid |
| **Priority** | Critical |

---

### ADM_ALLOC_023 — Cancelled campaign records appear in list with Cancelled status

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign cancelled |
| **Type** | UI |
| **Test Steps** | 1. View allocation list |
| **Expected Result** | Cancelled campaign visible with status badge "Cancelled"; no further actions allowed |
| **Priority** | Medium |

---

### ADM_ALLOC_024 — Completed campaign has no Stop/Cancel actions

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign auto-completed |
| **Type** | BIZ |
| **Test Steps** | 1. Inspect Completed row actions |
| **Expected Result** | No Stop/Cancel; possibly view-only actions |
| **Priority** | Medium |

---

## Prerequisites & Constraints

### ADM_ALLOC_025 — Cannot create meaningful campaign with zero active towers

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | All towers Inactive in Config |
| **Type** | EDGE |
| **Test Steps** | 1. Try to create campaign<br>2. Save |
| **Expected Result** | Either creation rejected OR campaign created but buyers see empty unit grid (no units to book) |
| **Priority** | High |

---

### ADM_ALLOC_026 — Only one active campaign at a time on UAT

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | One Active campaign exists |
| **Type** | BIZ |
| **Test Steps** | 1. Try to create another campaign with overlapping active window |
| **Expected Result** | System warns or prevents overlap; only one active campaign should run at a time |
| **Priority** | High |

---

### ADM_ALLOC_044 — Active campaign blocks single-cancel from Customers module

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation / Customers |
| **BRD/FRD Req** | FSD Customers §4.2 (B-CUS-010) |
| **Pre-conditions** | Allocation campaign is OPEN; a Booked row in the same project |
| **Type** | NEG |
| **Test Steps** | 1. Open Customers, locate Booked row<br>2. Click trash icon, tick attestations, Submit |
| **Expected Result** | Backend returns HTTP 400 `"Cannot cancel unit when campaign is active"`; row unchanged |
| **Priority** | Critical |

---

### ADM_ALLOC_045 — Active campaign blocks unit-swap from Customers module

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation / Customers |
| **BRD/FRD Req** | FSD Customers §4.2 (B-CUS-011) |
| **Pre-conditions** | Allocation campaign OPEN; Booked row in same project |
| **Type** | NEG |
| **Test Steps** | 1. Open three-dot → Unit swap, fill tower/unit, tick attestations, Submit |
| **Expected Result** | HTTP 400 `"Cannot swap unit when campaign is active"`; current unit unchanged |
| **Priority** | Critical |

---

### ADM_ALLOC_046 — Active campaign blocks update-parking from Customers module

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation / Customers |
| **BRD/FRD Req** | FSD Customers §4.2 (B-CUS-013) |
| **Pre-conditions** | Allocation campaign OPEN; Booked row with current parking config |
| **Type** | NEG |
| **Test Steps** | 1. Three-dot → Update Parking Details, toggle and Submit |
| **Expected Result** | HTTP 400 `"Cannot update parking when campaign is active"`; parking row unchanged |
| **Priority** | High |

---

### ADM_ALLOC_047 — Active campaign blocks single refund (Cancel Registration)

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation / Customers |
| **BRD/FRD Req** | FSD Customers §4.2 (B-CUS-012) |
| **Pre-conditions** | Allocation campaign OPEN; Registered/Waitlisted row in same project |
| **Type** | NEG |
| **Test Steps** | 1. Click trash icon on Registered row<br>2. Click red Cancel Registration button |
| **Expected Result** | HTTP 400 `"Cannot refund registration when campaign is active"`; row unchanged; ₹999 not refunded |
| **Priority** | Critical |

---

### ADM_ALLOC_048 — Active campaign blocks bulk-cancel via Config Section 5

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation / Config |
| **BRD/FRD Req** | FSD Customers §4.2 |
| **Pre-conditions** | Allocation campaign OPEN; XLSX with registration numbers prepared |
| **Type** | NEG |
| **Test Steps** | 1. Open /admin/cms Section 5<br>2. Upload XLSX and Submit |
| **Expected Result** | Bulk cancel rejected with campaign-active error; no rows cancelled |
| **Priority** | High |

---

### ADM_ALLOC_049 — Tower toggle in Config is still allowed during active campaign

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation / Config |
| **BRD/FRD Req** | FSD Towers §1 (no campaign gate on tower toggle) |
| **Pre-conditions** | Allocation campaign OPEN |
| **Type** | BIZ |
| **Test Steps** | 1. Open Config Section 1<br>2. Toggle a tower OFF and click Update Tower Configuration |
| **Expected Result** | Update succeeds; tower deactivated; campaign Customers writes remain blocked but tower config is independent |
| **Priority** | Medium |

---

## Integration Verification

### ADM_ALLOC_027 — Active campaign triggers WebSocket connection for unit grid

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign just became Active |
| **Type** | INT |
| **Test Steps** | 1. Open buyer portal during active campaign<br>2. Inspect browser WebSocket connections |
| **Expected Result** | WebSocket established to Python server for real-time updates |
| **Priority** | High |

---

### ADM_ALLOC_028 — Buyer sees unit grid with colour-coded availability

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Active campaign; buyer logged in |
| **Type** | UI |
| **Test Steps** | 1. Buyer opens unit selection page |
| **Expected Result** | Grid shows White=available, Red=sold, Orange=being paid colour codes |
| **Priority** | High |

---

### ADM_ALLOC_029 — Buyer payment via Easebuzz reflects in Payment Transactions

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Active campaign; buyer completes payment |
| **Type** | INT |
| **Test Steps** | 1. Buyer pays confirmation amount<br>2. Open /admin/payment-transactions |
| **Expected Result** | New transaction with Source = Online easebuzz, Type = Allocation, Status = completed |
| **Priority** | Critical |

---

### ADM_ALLOC_030 — Successful booking shown in Customers module

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Buyer just completed booking |
| **Type** | E2E |
| **Test Steps** | 1. Open Customers module<br>2. Search by buyer phone |
| **Expected Result** | Buyer row shows Allotted Unit, Allocation Status = Booked Online, Confirmation = Paid |
| **Priority** | Critical |

---

### ADM_ALLOC_031 — Notifications sent to buyers when campaign becomes Active

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign just transitioned to Active |
| **Type** | INT |
| **Test Steps** | 1. Verify Kaleyra SMS log or buyer SMS history |
| **Expected Result** | Buyers eligible for campaign receive Active notification |
| **Priority** | High |

---

### ADM_ALLOC_050 — Manual reconcile endpoint can be invoked

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation / API |
| **BRD/FRD Req** | FSD §1 — `POST /api/v1/admin/allocation/transaction/check` |
| **Pre-conditions** | Admin JWT; a transaction with pending status exists |
| **Type** | API |
| **Test Steps** | 1. POST `/api/v1/admin/allocation/transaction/check` with payload referencing the pending transaction id |
| **Expected Result** | Endpoint returns 200; manual reconcile attempts to verify status with gateway; pending may transition to completed/failed based on gateway response |
| **Priority** | High |

---

### ADM_ALLOC_051 — Cron allocation operations endpoint exists

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation / API |
| **BRD/FRD Req** | FSD §1 — `GET /api/v1/cron-allocation-operations` |
| **Pre-conditions** | Cron service credentials |
| **Type** | API |
| **Test Steps** | 1. GET `/api/v1/cron-allocation-operations` |
| **Expected Result** | Returns 200; auto-transitions Upcoming → Active → Completed are processed for campaigns whose times have passed |
| **Priority** | Medium |

---

### ADM_ALLOC_052 — Successful Assign Unit dispatches WhatsApp + SMS for +91 buyers (no email)

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation / Notifications |
| **BRD/FRD Req** | FSD §1 — `services/allocation.service.js:1816-1832` |
| **Pre-conditions** | Buyer with countryCode +91; Preallocated unit |
| **Type** | INT |
| **Test Steps** | 1. Admin completes Assign Offline Unit on the buyer<br>2. Inspect WhatsApp dispatch (`congrates_payment_success_27sept`)<br>3. Inspect SMS dispatch (`ALLOTMENT_PAYMENT_SUCCESS`)<br>4. Inspect email logs |
| **Expected Result** | 1 WhatsApp dispatched; 1 SMS dispatched; ZERO emails dispatched |
| **Priority** | Critical |

---

## Allocation Negative & Edge Cases

### ADM_ALLOC_032 — Stopping a campaign with active payments mid-flow

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign Active; buyer in payment popup |
| **Type** | EDGE |
| **Test Steps** | 1. Admin clicks Stop while buyer paying<br>2. Wait for buyer payment completion |
| **Expected Result** | Buyer's in-flight payment may still complete via webhook; campaign status = Stopped after action |
| **Priority** | High |

---

### ADM_ALLOC_033 — Create campaign with very long name (over 100 chars)

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create form open |
| **Type** | EDGE |
| **Test Steps** | 1. Enter 150-character name<br>2. Submit |
| **Expected Result** | Name truncated or validation error if max length enforced |
| **Priority** | Medium |

---

### ADM_ALLOC_034 — Refresh list shows latest auto-status transitions

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Allocation page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Click Refresh button |
| **Expected Result** | Latest statuses fetched; any auto-transitions reflected |
| **Priority** | Medium |

---

### ADM_ALLOC_035 — Failed status indicates system error

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign experienced backend error |
| **Type** | UI |
| **Test Steps** | 1. Locate campaign with Failed status |
| **Expected Result** | Status badge shows "Failed"; admin can investigate or contact support |
| **Priority** | Medium |

---

## [FSD-CORRECTION] New TCs — Allocation source-verified gaps

### ADM_ALLOC_FSD_036 — [FSD-CORRECTION] Active campaign blocks Customers cancel/swap/assign/refund/parking

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation / Customers |
| **BRD/FRD Req** | FSD Customers §4.2 (B-CUS-010..013) |
| **Pre-conditions** | An allocation campaign is OPEN |
| **Type** | NEG |
| **Test Steps** | 1. Attempt single-cancel, bulk-cancel, unit-swap, assign-offline-unit, single-refund, bulk-refund, parking-update on a buyer in the same project |
| **Expected Result** | Each call returns HTTP 400 with the exact text `"Cannot ... when campaign is active"`. RegistrationUnit unchanged. |
| **Priority** | Critical |

---

### ADM_ALLOC_FSD_037 — [FSD-CORRECTION] Notify Physical Event sends QR codes to PHYSICAL_EVENT registrants only

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation / Notifications |
| **BRD/FRD Req** | FSD §2 endpoint 7 — `POST /campaigns/:id/notify` |
| **Pre-conditions** | An allocation campaign of mode PHYSICAL_EVENT exists with registrants |
| **Type** | INT |
| **Test Steps** | 1. Call `POST /api/v1/admin/allocation/campaigns/<id>/notify`<br>2. Inspect outbound notifications |
| **Expected Result** | Only PHYSICAL_EVENT campaigns trigger QR-code notification dispatch. STATIC and DYNAMIC campaigns do NOT trigger this endpoint. |
| **Priority** | High |

---

### ADM_ALLOC_FSD_038 — [FSD-CORRECTION] SM Admin cannot access admin allocation endpoints

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation / Security |
| **BRD/FRD Req** | FSD §1 / `routes/admin.routes.js:53` (`restrictTo('admin')`) |
| **Pre-conditions** | Valid SM Admin JWT (roleId=4) |
| **Type** | NEG |
| **Test Steps** | 1. With SM Admin JWT, call `GET /api/v1/admin/allocation/campaigns` |
| **Expected Result** | HTTP 403 Forbidden. SM Admin role does NOT have access — admin endpoints are admin-only at this router. |
| **Priority** | Critical |

---
