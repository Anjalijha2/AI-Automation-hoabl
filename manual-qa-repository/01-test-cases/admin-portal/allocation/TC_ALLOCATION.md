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
| **Test Steps** | 1. Click "Allocation" in sidebar<br>2. Observe URL |
| **Expected Result** | URL is /admin/allocation; campaigns list/form loads |
| **Priority** | Critical |

---

### ADM_ALLOC_002 — Page shows campaign list with Status column

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Allocation page loaded |
| **Test Steps** | 1. Inspect campaigns table |
| **Expected Result** | Table shows columns: Name, Type, Start Time, End Time, Status, Actions |
| **Priority** | High |

---

### ADM_ALLOC_003 — Status column values match defined campaign states

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Allocation page loaded |
| **Test Steps** | 1. Read distinct Status values |
| **Expected Result** | Values are: Upcoming, Active, Completed, Cancelled, Stopped, Failed |
| **Priority** | High |

---

### ADM_ALLOC_004 — Campaign type column shows Static / Dynamic / Physical Event

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Allocation page loaded |
| **Test Steps** | 1. Read Type column values |
| **Expected Result** | Values: Static, Dynamic, or Physical Event |
| **Priority** | High |

---

### ADM_ALLOC_005 — Create New Campaign button is visible

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Allocation page loaded |
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
| **Test Steps** | 1. Click Create Campaign / Add Campaign button |
| **Expected Result** | Form displayed with fields: Name, Type, Start Time, End Time |
| **Priority** | Critical |

---

### ADM_ALLOC_007 — Create Static campaign with valid future start time

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | At least one tower active in Config; Create Campaign form open |
| **Test Steps** | 1. Enter Name "Test Static Campaign"<br>2. Select Type = Static<br>3. Set Start Time = current time + 5 minutes<br>4. Set End Time = current time + 2 hours<br>5. Click Save Campaign |
| **Expected Result** | Campaign created with status = Upcoming; appears in list |
| **Priority** | Critical |

---

### ADM_ALLOC_008 — Create campaign with start time less than 3 minutes from now is rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create Campaign form open |
| **Test Steps** | 1. Set Start Time = current time + 1 minute<br>2. Fill other fields<br>3. Click Save Campaign |
| **Expected Result** | Validation error: "Start time must be at least 3 minutes in the future" |
| **Priority** | Critical |

---

### ADM_ALLOC_009 — Create campaign with end time before start time is rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create Campaign form open |
| **Test Steps** | 1. Set Start Time = now + 10 min<br>2. Set End Time = now + 5 min<br>3. Click Save Campaign |
| **Expected Result** | Validation error: end time must be after start time |
| **Priority** | High |

---

### ADM_ALLOC_010 — Create campaign with empty name is rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create Campaign form open |
| **Test Steps** | 1. Leave Name empty<br>2. Fill other fields<br>3. Click Save Campaign |
| **Expected Result** | Name required validation error shown |
| **Priority** | High |

---

### ADM_ALLOC_011 — Campaign Type dropdown shows three options

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create Campaign form open |
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
| **Test Steps** | 1. Enter Name "Dyn Campaign"<br>2. Select Type = Dynamic<br>3. Configure rounds<br>4. Set Start = now+5min<br>5. Save |
| **Expected Result** | Dynamic campaign created with status Upcoming |
| **Priority** | High |

---

### ADM_ALLOC_013 — Create Physical Event campaign

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create Campaign form open |
| **Test Steps** | 1. Enter Name "On-Site Event"<br>2. Select Type = Physical Event<br>3. Set times<br>4. Save |
| **Expected Result** | Physical Event campaign created; admin/SM can assign units offline |
| **Priority** | High |

---

## Campaign Lifecycle Transitions

### ADM_ALLOC_014 — Upcoming campaign auto-transitions to Active at start time

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign with status Upcoming whose start time is approaching |
| **Test Steps** | 1. Wait until campaign start time<br>2. Refresh allocation list |
| **Expected Result** | Status transitions from Upcoming to Active automatically |
| **Priority** | Critical |

---

### ADM_ALLOC_015 — Active campaign auto-transitions to Completed at end time

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Active campaign whose end time is reached |
| **Test Steps** | 1. Wait until end time<br>2. Refresh list |
| **Expected Result** | Status changes from Active to Completed |
| **Priority** | High |

---

### ADM_ALLOC_016 — Stop button stops an Active campaign

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign is currently Active |
| **Test Steps** | 1. Locate Active campaign row<br>2. Click Stop button<br>3. Confirm |
| **Expected Result** | Status changes from Active to Stopped immediately |
| **Priority** | Critical |

---

### ADM_ALLOC_017 — Cancel button cancels an Upcoming campaign

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign with Upcoming status |
| **Test Steps** | 1. Locate Upcoming campaign<br>2. Click Cancel<br>3. Confirm |
| **Expected Result** | Status changes from Upcoming to Cancelled |
| **Priority** | Critical |

---

### ADM_ALLOC_018 — Cannot Cancel an Active campaign (only Stop available)

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign is Active |
| **Test Steps** | 1. Inspect actions on Active row |
| **Expected Result** | Cancel button not shown for Active campaigns; only Stop available |
| **Priority** | High |

---

### ADM_ALLOC_019 — Cannot Stop an Upcoming campaign (only Cancel)

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign is Upcoming |
| **Test Steps** | 1. Inspect actions on Upcoming row |
| **Expected Result** | Stop button not shown; only Cancel available |
| **Priority** | High |

---

### ADM_ALLOC_020 — Stop confirmation dialog must be confirmed

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Active campaign exists |
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
| **Test Steps** | 1. Stop active campaign<br>2. Open Customers module<br>3. Inspect statuses of those buyers |
| **Expected Result** | Allocation Status = Waitlisted for non-paying buyers |
| **Priority** | Critical |

---

### ADM_ALLOC_022 — Buyers who paid remain Confirmed (Booked)

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign stopped; some buyers had paid |
| **Test Steps** | 1. Open Customers module<br>2. Inspect paid buyers |
| **Expected Result** | Allocation Status = Booked Online/Booked Offline; Confirmation = Paid |
| **Priority** | Critical |

---

### ADM_ALLOC_023 — Cancelled campaign records appear in list with Cancelled status

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign cancelled |
| **Test Steps** | 1. View allocation list |
| **Expected Result** | Cancelled campaign visible with status badge "Cancelled"; no further actions allowed |
| **Priority** | Medium |

---

### ADM_ALLOC_024 — Completed campaign has no Stop/Cancel actions

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign auto-completed |
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
| **Test Steps** | 1. Try to create campaign<br>2. Save |
| **Expected Result** | Either creation rejected OR campaign created but buyers see empty unit grid (no units to book) |
| **Priority** | High |

---

### ADM_ALLOC_026 — Only one active campaign at a time on UAT

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | One Active campaign exists |
| **Test Steps** | 1. Try to create another campaign with overlapping active window |
| **Expected Result** | System warns or prevents overlap; only one active campaign should run at a time |
| **Priority** | High |

---

## Integration Verification

### ADM_ALLOC_027 — Active campaign triggers WebSocket connection for unit grid

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign just became Active |
| **Test Steps** | 1. Open buyer portal during active campaign<br>2. Inspect browser WebSocket connections |
| **Expected Result** | WebSocket established to Python server for real-time updates |
| **Priority** | High |

---

### ADM_ALLOC_028 — Buyer sees unit grid with colour-coded availability

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Active campaign; buyer logged in |
| **Test Steps** | 1. Buyer opens unit selection page |
| **Expected Result** | Grid shows White=available, Red=sold, Orange=being paid colour codes |
| **Priority** | High |

---

### ADM_ALLOC_029 — Buyer payment via Easebuzz reflects in Payment Transactions

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Active campaign; buyer completes payment |
| **Test Steps** | 1. Buyer pays confirmation amount<br>2. Open /admin/payment-transactions |
| **Expected Result** | New transaction with Source = Online easebuzz, Type = Allocation, Status = completed |
| **Priority** | Critical |

---

### ADM_ALLOC_030 — Successful booking shown in Customers module

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Buyer just completed booking |
| **Test Steps** | 1. Open Customers module<br>2. Search by buyer phone |
| **Expected Result** | Buyer row shows Allotted Unit, Allocation Status = Booked Online, Confirmation = Paid |
| **Priority** | Critical |

---

### ADM_ALLOC_031 — Notifications sent to buyers when campaign becomes Active

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign just transitioned to Active |
| **Test Steps** | 1. Verify Kaleyra SMS log or buyer SMS history |
| **Expected Result** | Buyers eligible for campaign receive Active notification |
| **Priority** | High |

---

## Allocation Negative & Edge Cases

### ADM_ALLOC_032 — Stopping a campaign with active payments mid-flow

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign Active; buyer in payment popup |
| **Test Steps** | 1. Admin clicks Stop while buyer paying<br>2. Wait for buyer payment completion |
| **Expected Result** | Buyer's in-flight payment may still complete via webhook; campaign status = Stopped after action |
| **Priority** | High |

---

### ADM_ALLOC_033 — Create campaign with very long name (over 100 chars)

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Create form open |
| **Test Steps** | 1. Enter 150-character name<br>2. Submit |
| **Expected Result** | Name truncated or validation error if max length enforced |
| **Priority** | Medium |

---

### ADM_ALLOC_034 — Refresh list shows latest auto-status transitions

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Allocation page loaded |
| **Test Steps** | 1. Click Refresh button |
| **Expected Result** | Latest statuses fetched; any auto-transitions reflected |
| **Priority** | Medium |

---

### ADM_ALLOC_035 — Failed status indicates system error

| Field | Value |
|-------|-------|
| **Module** | ADM – Allocation |
| **Pre-conditions** | Campaign experienced backend error |
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
| **Test Steps** | 1. With SM Admin JWT, call `GET /api/v1/admin/allocation/campaigns` |
| **Expected Result** | HTTP 403 Forbidden. SM Admin role does NOT have access — admin endpoints are admin-only at this router. |
| **Priority** | Critical |

---
