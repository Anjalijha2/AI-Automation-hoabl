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

### BYR_ALLOC_004 — Auto-update when campaign goes live (WebSocket)

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Buyer on waiting screen at campaign start time |
| **Test Steps** | 1. Wait for campaign start without refreshing |
| **Expected Result** | Screen transitions to live allocation view via WebSocket; no manual refresh needed |
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
| **Test Steps** | 1. Click Proceed to Pay |
| **Expected Result** | Easebuzz opens for assigned unit; proceed_to_pay WebSocket event fired |
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

### BYR_ALLOC_039 — UnitSoldNotification popup when others book

| Field | Value |
|-------|-------|
| **Module** | BYR – Allocation |
| **Pre-conditions** | Buyer on Allotment during DYNAMIC campaign |
| **Test Steps** | 1. Another buyer books a unit |
| **Expected Result** | Real-time popup notifies buyer of recent sale |
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
| **Expected Result** | Status remains Booked; not converted to Waitlisted |
| **Priority** | Critical |

---
