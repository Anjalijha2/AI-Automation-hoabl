# Test Cases — Allocation Experience
**Portal:** Buyer Portal
**Module:** Allocation Experience (STATIC and DYNAMIC)
**BRD Reference:** BUYER-FS-Allocation-Experience.md
**Total TCs:** 12

---

## UI Tests

### TC_ALLOC_UI_001 — Waiting screen renders when no campaign active

| Field | Value |
|-------|-------|
| **Sub Module** | Pre-Event State |
| **Scenario** | Verify WaitingForUnit message when no campaign running |
| **Precondition** | No active campaign; buyer is WAITLIST |
| **Test Steps** | 1. Click Proceed to Confirm from dashboard<br>2. Wait for allotment page |
| **Test Data** | Waitlisted buyer |
| **Expected Result** | "Allocation hasn't started yet" message; AllocationEndTimer countdown visible |

### TC_ALLOC_UI_002 — Unit selection screen renders three panels (STATIC)

| Field | Value |
|-------|-------|
| **Sub Module** | Unit Selection |
| **Scenario** | Verify left/center/right panel layout |
| **Precondition** | STATIC campaign active; buyer status Available |
| **Test Steps** | 1. Click Book Now<br>2. Click Select Unit |
| **Test Data** | Available buyer in active campaign |
| **Expected Result** | Left panel = tower list; center = unit grid; right = selected unit details |

### TC_ALLOC_UI_003 — Unit colour legend correct

| Field | Value |
|-------|-------|
| **Sub Module** | Unit States |
| **Scenario** | Verify colour codes |
| **Precondition** | Unit grid loaded |
| **Test Steps** | 1. Inspect unit grid<br>2. Identify White, Green (selected), Orange (hold), Red (booked) |
| **Test Data** | Active grid |
| **Expected Result** | White = Available, Green = Selected, Orange = another buyer in payment, Red = booked |

## Functional Positive Tests

### TC_ALLOC_FUNC_001 — Select an available unit (STATIC)

| Field | Value |
|-------|-------|
| **Sub Module** | Unit Selection |
| **Scenario** | Click an Available unit and verify it turns Selected |
| **Precondition** | STATIC campaign active |
| **Test Steps** | 1. Click any white unit<br>2. Observe color change |
| **Test Data** | Any available unit |
| **Expected Result** | Unit turns green; right panel shows unit details, agreement value, discounts, total price |

### TC_ALLOC_FUNC_002 — Add unit and accept T&C → Pay enabled

| Field | Value |
|-------|-------|
| **Sub Module** | T&C Gating |
| **Scenario** | Confirm Pay button enables only after T&C checked (TC-CST-012) |
| **Precondition** | Unit added to selection |
| **Test Steps** | 1. Click Add<br>2. Observe Pay button disabled<br>3. Tick T&C checkbox<br>4. Observe Pay button enabled |
| **Test Data** | Selected unit |
| **Expected Result** | Pay button disabled before tick; enabled after tick |

### TC_ALLOC_FUNC_003 — Complete payment via Easebuzz

| Field | Value |
|-------|-------|
| **Sub Module** | Payment |
| **Scenario** | End-to-end booking with payment confirmation |
| **Precondition** | Unit selected; T&C ticked |
| **Test Steps** | 1. Click Pay<br>2. Easebuzz gateway opens<br>3. Complete test payment<br>4. Wait for redirect |
| **Test Data** | UAT card |
| **Expected Result** | Payment Successful screen shown; status becomes Booked on dashboard |

### TC_ALLOC_FUNC_004 — DYNAMIC: view assigned unit

| Field | Value |
|-------|-------|
| **Sub Module** | DYNAMIC Allocation |
| **Scenario** | OpenAllottedUnit shows system-assigned unit |
| **Precondition** | DYNAMIC campaign running; buyer in round |
| **Test Steps** | 1. Navigate to allotment<br>2. View OpenAllottedUnit |
| **Test Data** | DYNAMIC active buyer |
| **Expected Result** | Auto-assigned unit details shown; Proceed to Pay button visible |

## Functional Negative Tests

### TC_ALLOC_NEG_001 — Pay button blocked without T&C

| Field | Value |
|-------|-------|
| **Sub Module** | T&C Gating |
| **Scenario** | Try Pay without ticking T&C |
| **Precondition** | Unit selected; T&C unchecked |
| **Test Steps** | 1. Try clicking Pay |
| **Test Data** | T&C unticked |
| **Expected Result** | Pay button stays disabled or shows blocking error |

### TC_ALLOC_NEG_002 — Booked unit cannot be selected

| Field | Value |
|-------|-------|
| **Sub Module** | Unit States |
| **Scenario** | Red (booked) unit not selectable |
| **Precondition** | Unit grid loaded; red unit visible |
| **Test Steps** | 1. Click a red unit |
| **Test Data** | Booked unit |
| **Expected Result** | Click ignored; no selection happens |

## Edge Cases

### TC_ALLOC_EDGE_001 — 20-minute hold expires releases unit

| Field | Value |
|-------|-------|
| **Sub Module** | Hold Timer |
| **Scenario** | Wait 20+ minutes without paying → unit released |
| **Precondition** | Unit selected; hold timer running |
| **Test Steps** | 1. Select unit<br>2. Wait 20 minutes<br>3. Observe state |
| **Test Data** | N/A |
| **Expected Result** | Unit hold released; unit returns to white (Available) for others |

### TC_ALLOC_EDGE_002 — Post-campaign Available reverts to Waitlisted

| Field | Value |
|-------|-------|
| **Sub Module** | Campaign End |
| **Scenario** | Verify status changes when campaign ends |
| **Precondition** | Campaign just ended |
| **Test Steps** | 1. Open allotment after campaign close<br>2. Read center panel |
| **Test Data** | Available buyer post-campaign |
| **Expected Result** | "Allocation window is closed for now." red text; Waitlisted badge on dashboard |

## API Tests

### TC_ALLOC_API_001 — Place hold endpoint

| Field | Value |
|-------|-------|
| **Sub Module** | API |
| **Scenario** | POST to place hold on a unit |
| **Precondition** | Valid JWT; active campaign |
| **Test Steps** | 1. POST hold endpoint with unit ID |
| **Test Data** | Unit ID |
| **Expected Result** | 200 OK; hold created in Redis with 20 min TTL |

## DB Tests

### TC_ALLOC_DB_001 — Booking record on payment success

| Field | Value |
|-------|-------|
| **Sub Module** | Data Persistence |
| **Scenario** | Successful payment creates booking record |
| **Precondition** | Payment complete |
| **Test Steps** | 1. Query registration_unit by registration ID<br>2. Verify status |
| **Test Data** | Registration ID |
| **Expected Result** | Status = WINNER; unit ID = paid unit |
