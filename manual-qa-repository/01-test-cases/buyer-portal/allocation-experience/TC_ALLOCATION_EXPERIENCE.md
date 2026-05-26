# Test Cases — Allocation Experience
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Allocation-Experience.md

---

## Allocation — Waiting State (Pre-Event)

### BYR_ALLOC_001 — Waiting screen rendered when no campaign active

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Buyer Available, no active campaign |
| **Test Steps** | 1. Click Proceed to Confirm from dashboard |
| **Expected Result** | WaitingForUnit screen shown with "Allocation hasn't started yet" message |
| **Priority** | Critical |

---

### BYR_ALLOC_002 — Countdown timer shows next campaign start

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Future campaign scheduled |
| **Test Steps** | 1. Inspect AllocationEndTimer |
| **Expected Result** | Countdown ticks down towards scheduled start time |
| **Priority** | High |

---

### BYR_ALLOC_003 — NextChanceTime shown for buyer

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Buyer on waitlist for next round |
| **Test Steps** | 1. Inspect NextChanceTime |
| **Expected Result** | Buyer's next opportunity time/date shown |
| **Priority** | Medium |

---

### BYR_ALLOC_004 — Auto-update when campaign goes live (polling — NOT WebSocket)

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Buyer on waiting screen at campaign start time |
| **Test Steps** | 1. Wait for campaign start; monitor network tab |
| **Expected Result** | Frontend POLLS `GET /api/v1/user/allocation/campaigns/latest` periodically (NO WebSocket / SSE infrastructure exists — verified absent from backend; FSD §1 GAP-AE-01). Screen transitions on next poll cycle. Do NOT assert WebSocket events. |
| **Priority** | Critical |

---

## Allocation — STATIC Entry

### BYR_ALLOC_005 — Available buyer sees Book Now during active STATIC campaign

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | STATIC campaign active, buyer Available |
| **Test Steps** | 1. Click Proceed to Confirm<br>2. Inspect allotment page |
| **Expected Result** | Green "Book Now" badge visible |
| **Priority** | Critical |

---

### BYR_ALLOC_006 — Click Book Now reveals Select Unit CTA

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Allotment page open with Book Now |
| **Test Steps** | 1. Click Book Now |
| **Expected Result** | "Select Unit >" link visible in center panel |
| **Priority** | High |

---

### BYR_ALLOC_007 — Click Select Unit opens unit selection screen

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Select Unit visible |
| **Test Steps** | 1. Click Select Unit > |
| **Expected Result** | Unit Selection screen opens with 3-panel layout (towers / grid / details) |
| **Priority** | Critical |

---

## Allocation — STATIC Unit Selection

### BYR_ALLOC_008 — Left panel lists all towers with unit counts

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Unit selection screen open |
| **Test Steps** | 1. Inspect left panel |
| **Expected Result** | Towers (Crest, Crown, Blossom, Pinnacle, Bright) with available unit counts |
| **Priority** | High |

---

### BYR_ALLOC_009 — Click tower loads its unit grid in center

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Towers listed |
| **Test Steps** | 1. Click any tower |
| **Expected Result** | Center panel shows floor-by-floor grid for that tower |
| **Priority** | High |

---

### BYR_ALLOC_010 — White unit = Available (selectable)

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Unit grid loaded |
| **Test Steps** | 1. Inspect a white unit<br>2. Click it |
| **Expected Result** | White units selectable; click highlights them |
| **Priority** | High |

---

### BYR_ALLOC_011 — Selected unit turns green

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | White unit clicked |
| **Test Steps** | 1. Observe colour |
| **Expected Result** | Unit colour changes from white to green |
| **Priority** | High |

---

### BYR_ALLOC_012 — Orange unit = Another buyer in payment hold (not selectable)

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Another buyer holds a unit |
| **Test Steps** | 1. Try to click orange unit |
| **Expected Result** | Click ignored or tooltip "Currently in payment" shown |
| **Priority** | Critical |

---

### BYR_ALLOC_013 — Red unit = Booked (not selectable)

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Unit already booked |
| **Test Steps** | 1. Try to click red unit |
| **Expected Result** | Not selectable; tooltip "Sold" or similar |
| **Priority** | High |

---

### BYR_ALLOC_014 — Right panel populates with selected unit details

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Unit selected |
| **Test Steps** | 1. Inspect right panel |
| **Expected Result** | Unit No, BHK, carpet area, Agreement Value, offers, total price displayed |
| **Priority** | Critical |

---

### BYR_ALLOC_015 — Floor & Unit Plan link opens architectural plan

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Unit selected |
| **Test Steps** | 1. Click "Floor & Unit Plan >" |
| **Expected Result** | Plan view opens with floor layout and unit dimensions |
| **Priority** | Medium |

---

### BYR_ALLOC_016 — Cost Sheet link opens full breakdown

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Unit selected |
| **Test Steps** | 1. Click "Cost Sheet >" |
| **Expected Result** | Itemised cost sheet shown for selected unit |
| **Priority** | High |

---

### BYR_ALLOC_017 — Change Unit re-selects different unit

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Unit selected |
| **Test Steps** | 1. Click Change Unit<br>2. Pick a different white unit |
| **Expected Result** | Old unit deselected (green → white); new unit selected |
| **Priority** | Medium |

---

### BYR_ALLOC_018 — Cancel deselects without releasing hold (or releases per BR)

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Unit selected |
| **Test Steps** | 1. Click Cancel |
| **Expected Result** | Selection cleared per business rule; hold state preserved or released as configured |
| **Priority** | Medium |

---

### BYR_ALLOC_019 — Click Add confirms selection and returns to Allotment

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Unit selected in grid |
| **Test Steps** | 1. Click Add |
| **Expected Result** | Returns to Allotment page; center panel shows selected unit with reg number |
| **Priority** | Critical |

---

## Allocation — STATIC Payment

### BYR_ALLOC_020 — T&C checkbox unchecked by default

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Unit added on Allotment page |
| **Test Steps** | 1. Inspect T&C checkbox |
| **Expected Result** | Unchecked by default |
| **Priority** | High |

---

### BYR_ALLOC_021 — Pay button DISABLED until T&C ticked

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Allotment page with unit added |
| **Test Steps** | 1. Inspect Pay button<br>2. Tick T&C<br>3. Re-inspect |
| **Expected Result** | Disabled when unchecked; enabled when ticked (TC-CST-012 rule) |
| **Priority** | Critical |

---

### BYR_ALLOC_022 — T&C label is exact text

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Allotment page |
| **Test Steps** | 1. Inspect checkbox label |
| **Expected Result** | Label = "I confirm to HoABL Terms & Conditions and Privacy Policy" |
| **Priority** | Medium |

---

### BYR_ALLOC_023 — Click Pay opens Easebuzz gateway

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | T&C ticked, Pay enabled |
| **Test Steps** | 1. Click "Confirmation Amount Pay Rs. 27,000" |
| **Expected Result** | Easebuzz gateway opens with Impactum Lands Pvt Ltd as merchant |
| **Priority** | Critical |

---

### BYR_ALLOC_024 — Payment validity timer ~15 minutes

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Easebuzz opened |
| **Test Steps** | 1. Inspect validity timer |
| **Expected Result** | Approx. 15-minute countdown visible |
| **Priority** | Medium |

---

### BYR_ALLOC_025 — All payment methods available

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Easebuzz opened |
| **Test Steps** | 1. Inspect method tabs |
| **Expected Result** | Credit Card / Debit Card / UPI / NetBanking / Wallets all present |
| **Priority** | High |

---

### BYR_ALLOC_026 — Successful payment shows confirmation screen

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Valid payment completed |
| **Test Steps** | 1. Complete payment |
| **Expected Result** | "Payment successful!" screen with green checkmark, unit details, applicant list |
| **Priority** | Critical |

---

### BYR_ALLOC_027 — Dashboard updates: Status = Booked, Allotted Unit populated

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Payment success |
| **Test Steps** | 1. Return to dashboard |
| **Expected Result** | Status badge = Booked; Allotted Unit column populated; Process Status = Complete KYC |
| **Priority** | Critical |

---

## Allocation — STATIC Hold Mechanism

### BYR_ALLOC_028 — Selected unit held for 20 minutes from pay_now_initiated

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Unit selection confirmed |
| **Test Steps** | 1. Note hold start time<br>2. Wait 20 minutes without paying |
| **Expected Result** | After 20 min hold expires; unit released to others |
| **Priority** | Critical |

---

### BYR_ALLOC_029 — Only one unit hold per buyer at a time

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Buyer holds unit A |
| **Test Steps** | 1. Try to hold unit B simultaneously via API |
| **Expected Result** | Second hold rejected; only one unit reserved per buyer |
| **Priority** | High |

---

### BYR_ALLOC_030 — Concurrent hold race: only one buyer wins

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Two buyers attempt same unit simultaneously |
| **Test Steps** | 1. Both click Add at same moment |
| **Expected Result** | Only one succeeds; the other sees unit as orange/unavailable |
| **Priority** | Critical |

---

## Allocation — DYNAMIC Allocation

### BYR_ALLOC_031 — DYNAMIC campaign assigns unit automatically

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | DYNAMIC campaign active, buyer's slot |
| **Test Steps** | 1. Open Allotment page during slot |
| **Expected Result** | OpenAllottedUnit component renders system-assigned unit details |
| **Priority** | Critical |

---

### BYR_ALLOC_032 — Round time window enforced

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | DYNAMIC round configured (e.g., 20 min) |
| **Test Steps** | 1. Wait beyond window without paying |
| **Expected Result** | Round expires; buyer may receive next assignment or move to Waitlist |
| **Priority** | High |

---

### BYR_ALLOC_033 — Proceed to Pay launches gateway with assigned unit

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | OpenAllottedUnit visible |
| **Test Steps** | 1. Click Proceed to Pay<br>2. Monitor network |
| **Expected Result** | Backend hits `POST /api/v1/user/allocation/order`; Easebuzz gateway opens (default gateway per BR-AE-12). No WebSocket event fired — no socket.io / SSE infrastructure exists. |
| **Priority** | Critical |

---

### BYR_ALLOC_034 — Successful payment grants WINNER status

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Payment completes within round window |
| **Test Steps** | 1. Complete payment<br>2. Check status |
| **Expected Result** | Buyer status = WINNER; KYC flow unlocked |
| **Priority** | Critical |

---

### BYR_ALLOC_035 — WatchingUnitList shows past assignments

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Multiple rounds elapsed |
| **Test Steps** | 1. Inspect WatchingUnitList |
| **Expected Result** | All previously assigned units listed |
| **Priority** | Medium |

---

### BYR_ALLOC_036 — YourMissedChances populated from Redis history

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Buyer missed at least one assignment |
| **Test Steps** | 1. Inspect YourMissedChances |
| **Expected Result** | Missed units listed from lost_units history |
| **Priority** | Medium |

---

### BYR_ALLOC_037 — Reassignment to same typology after timeout

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | DYNAMIC round timed out without payment |
| **Test Steps** | 1. Wait for next assignment |
| **Expected Result** | New unit assigned in same typology if available |
| **Priority** | High |

---

### BYR_ALLOC_038 — Waitlist when no units remain in typology

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | All units in typology exhausted |
| **Test Steps** | 1. Trigger reallocation attempt |
| **Expected Result** | Buyer placed on Waitlist status |
| **Priority** | High |

---

### BYR_ALLOC_039 — UnitSoldNotification popup via polling (NOT real-time push)

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Buyer on Allotment during DYNAMIC campaign |
| **Test Steps** | 1. Another buyer books a unit<br>2. Wait for next polling cycle |
| **Expected Result** | Popup appears on NEXT poll of `/campaigns/latest` or unit-availability endpoint. NO backend push exists — comments in allocation.service.js:325, 1698 refer to non-existent WebSocket. Latency = polling interval (likely matches `roundTime` for DYNAMIC). |
| **Priority** | Low |

---

## Allocation — Post-Campaign State

### BYR_ALLOC_040 — Available reverts to Waitlisted at campaign end

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Campaign ended without buyer completing booking |
| **Test Steps** | 1. Refresh dashboard |
| **Expected Result** | Status changes from Available to Waitlisted |
| **Priority** | High |

---

### BYR_ALLOC_041 — "Allocation window is closed for now." message shown

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Campaign ended, buyer waitlisted |
| **Test Steps** | 1. Open Allotment page |
| **Expected Result** | Red text "Allocation window is closed for now." shown in center panel |
| **Priority** | High |

---

### BYR_ALLOC_042 — Select Unit and Book Now buttons hidden post-campaign

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Campaign ended, buyer waitlisted |
| **Test Steps** | 1. Inspect Allotment page |
| **Expected Result** | No Select Unit or Book Now buttons rendered |
| **Priority** | High |

---

### BYR_ALLOC_043 — Booked status unchanged for completed bookings

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Buyer Booked before campaign end |
| **Test Steps** | 1. Inspect dashboard |
| **Expected Result** | RegistrationUnit.status stays `WINNER` (terminal — bypasses campaign override per BR-DASH-007). |
| **Priority** | Critical |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/buyer-portal/fsd-allocation-experience.md`

### Corrections to existing TCs
- **BYR_ALLOC_004 / BYR_ALLOC_033 / BYR_ALLOC_039** — There is NO WebSocket / SSE / Socket.IO infrastructure. Two code comments reference websocket but no implementation exists (GAP-AE-01). All real-time UI MUST poll. Removed all WebSocket assertions.
- **BYR_ALLOC_023** — Default gateway is Easebuzz (BR-AE-12). Razorpay supported but ONLY Razorpay orders can be cancelled via `cancelAllocationOrderService` (GAP-AE-04).
- **BYR_ALLOC_028** — Hold expiry is 20 minutes from `paymentTransaction.createdAt`, hardcoded — no project config (GAP-AE-03). Expiry is LAZY — only fires when reconcile cron / webhook runs (GAP-AE-02). Closing the tab leaves unit unavailable until next cron tick.
- **BYR_ALLOC_034** — On success, RegistrationUnit `WINNER` + WhatsApp template `congrates_payment_success_27sept` + SMS `ALLOTMENT_PAYMENT_SUCCESS` (only if `countryCode === '+91'` literal). WhatsApp via Botspice, SMS via Epinet (NOT Kaleyra).
- **BYR_ALLOC_040** — Status revert is NOT automatic for buyer-displayed status — `RegistrationUnit.status` stays `ALLOCATED`. Dashboard recomputes display status `WAITLIST` when no campaign running (services/registration.service.js:142-144).

### New TCs added below

### BYR_ALLOC_044 — POST /allocation/order rejects when campaign not RUNNING

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Campaign status = `NOT_STARTED` or `STOPPED` |
| **Test Steps** | 1. `POST /api/v1/user/allocation/order` body with valid items |
| **Expected Result** | Error "Allotments are closed" (allocation.service.js:519-527 / BR-AE-01) |
| **Priority** | Critical |

---

### BYR_ALLOC_045 — Multi-registration order rejected

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Buyer has units in two different registrations R1 and R2 |
| **Test Steps** | 1. `POST /allocation/order` with items spanning R1 and R2 |
| **Expected Result** | Rejected — all items in one order must share same `registrationId` (BR-AE-02, allocation.service.js:475-480) |
| **Priority** | High |

---

### BYR_ALLOC_046 — Already-WINNER unit submit returns confirmationNumber

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | RegistrationUnit U is `WINNER` with `confirmationNumber` set |
| **Test Steps** | 1. `POST /allocation/order` with U in items |
| **Expected Result** | "Unit already confirmed" + `confirmationNumber` returned (BR-AE-03) |
| **Priority** | High |

---

### BYR_ALLOC_047 — In-flight HOLD returns "Payment under Verification"

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | RegistrationUnit U is `HOLD` |
| **Test Steps** | 1. Submit second order on U |
| **Expected Result** | "Your Payment is under Verification" + `confirmationNumber` (BR-AE-04) |
| **Priority** | High |

---

### BYR_ALLOC_048 — Concurrent hold race protected by conditional UPDATE

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Two buyers attempt same unit at same instant |
| **Test Steps** | 1. Both fire `POST /allocation/order`<br>2. Compare responses |
| **Expected Result** | First succeeds; second sees "Unit … is already under booking" — protected by `UPDATE ... WHERE status='AVAILABLE'` returning affectedRows=0 (BR-AE-08, allocation.service.js:630-642). |
| **Priority** | Critical |

---

### BYR_ALLOC_049 — Parking unavailable rejects with specific message

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | All parking slots BOOKED in inventory |
| **Test Steps** | 1. `POST /allocation/order` with `isParkingSelected:true` |
| **Expected Result** | "Parking slots are no longer available" (BR-AE-07, allocation.service.js:598-603) |
| **Priority** | High |

---

### BYR_ALLOC_050 — Gateway initiation failure rolls back all HOLDs atomically

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Easebuzz returns error on initiate |
| **Test Steps** | 1. `POST /allocation/order` triggering gateway fail<br>2. Inspect Unit, RegistrationUnit, ParkingInventory |
| **Expected Result** | All three revert: Unit→AVAILABLE, RegistrationUnit→ALLOCATED, Parking→AVAILABLE (BR-AE-10, allocation.service.js:789-826) |
| **Priority** | Critical |

---

### BYR_ALLOC_051 — Payment SUCCESS triggers Botspice WhatsApp + Epinet SMS

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Buyer with `countryCode='+91'` completes payment |
| **Test Steps** | 1. Complete payment<br>2. Inspect WhatsApp and SMS gateway logs |
| **Expected Result** | WhatsApp template `congrates_payment_success_27sept` with args `[firstName, "{towerName} - {allocatedUnit}"]` via Botspice; SMS code `ALLOTMENT_PAYMENT_SUCCESS` via Epinet. NOT Kaleyra. |
| **Priority** | Critical |

---

### BYR_ALLOC_052 — Payment SUCCESS for non-+91 country code skips SMS

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | NRI buyer with `countryCode='+971'` |
| **Test Steps** | 1. Complete payment<br>2. Inspect channels |
| **Expected Result** | WhatsApp fires; SMS NOT dispatched — guard `countryCode === '+91'` literal (GAP-AE-08, allocation.service.js:1830-1832). |
| **Priority** | Medium |

---

### BYR_ALLOC_053 — Payment FAILURE triggers `payment_unsuccessful_27sept` + ALLOTMENT_PAYMENT_FAILED

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Gateway returns `cancelled` / `bounced` / `failed` |
| **Test Steps** | 1. Inspect WhatsApp/SMS logs |
| **Expected Result** | WhatsApp template `payment_unsuccessful_27sept` (empty args array); SMS code `ALLOTMENT_PAYMENT_FAILED` if `+91`. Status reset to AVAILABLE / ALLOCATED. |
| **Priority** | High |

---

### BYR_ALLOC_054 — Hold expiry runs via cron, not real-time timer

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | HOLD created at T |
| **Test Steps** | 1. At T+21 min, query unit status WITHOUT triggering cron<br>2. Wait for next `allocation-payment-reconcile.cron.js` tick<br>3. Re-query |
| **Expected Result** | Before cron tick: unit still HOLD even though > 20 min elapsed. After cron tick: unit reset to AVAILABLE (GAP-AE-02). |
| **Priority** | High |

---

### BYR_ALLOC_055 — Cross-buyer unit-details access rejected with 401

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Buyer A authenticated; registrationNumber R belongs to Buyer B |
| **Test Steps** | 1. `GET /api/v1/user/allocation/unit-details?registrationNumber=R&unitId=X` |
| **Expected Result** | 401 / "Invalid resource access" (BR-AE-15, allocation.controller.js:257-264) |
| **Priority** | Critical (Security) |

---

### BYR_ALLOC_056 — getDynamicTemplateData applicationDetails returns 400 KYC Incomplete

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | RegistrationUnit U with `isKycSubmitted=false` |
| **Test Steps** | 1. `GET /allocation/unit-details?unitId=X&registrationNumber=R&applicationDetails=true` |
| **Expected Result** | 400 "KYC Incomplete" (BR-AE-14, allocation.controller.js:245-247) |
| **Priority** | High |

---

### BYR_ALLOC_057 — No rate limit on /allocation/order (security gap)

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Authenticated buyer |
| **Test Steps** | 1. Fire 50 `POST /allocation/order` in 5 seconds |
| **Expected Result** | All requests accepted (no `rateLimit`/`throttle` middleware on route — GAP-AE-10). Document as security gap; buyer could DoS gateway. |
| **Priority** | Medium (Security) |
