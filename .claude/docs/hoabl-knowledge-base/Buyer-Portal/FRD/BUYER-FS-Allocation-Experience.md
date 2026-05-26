# Feature-Spec: Allocation Experience

**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/alloted`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: Waiting for Allocation (Pre-Event State)

### 1.1 Objective

Show the buyer their current waiting state before an allocation campaign starts.

### 1.2 UI Elements

| Element | Description |
|---------|-------------|
| WaitingForUnit | "Allocation hasn't started yet" message |
| AllocationEndTimer | Countdown timer to the next allocation round |
| NextChanceTime | Shows when the buyer's next opportunity is |

### 1.3 Business Rules

1. Buyer is on WAITLIST status — no unit action is available
2. Timer counts down to the scheduled campaign start time
3. When campaign starts, WebSocket broadcasts the event and the screen updates automatically

---

## How to Use: The Waiting Screen

**Who does this:** Buyer (before an allocation event starts)

---

When you click **Proceed to Confirm** on your Home Dashboard outside of an active campaign, you will see a waiting screen. This is normal — it means no allocation event is currently running.

The countdown timer shows when your next opportunity to select a unit will begin. When the event goes live, your screen will update automatically — no need to refresh.

---

## Feature 2: STATIC Allocation — Unit Selection

### 2.1 Objective

Allow buyers to browse available units in real-time during a STATIC allocation campaign and select one for booking.

### 2.2 Scope

STATIC allocation: all eligible buyers can see all available units simultaneously. First to complete payment gets the unit.

### 2.3 Preconditions

- Buyer must be logged in with status = Available
- A STATIC campaign must be ACTIVE
- Buyer must be on the Allotment page

### 2.4 Unit Selection Screen Layout

| Panel | Content |
|-------|---------|
| Left panel | All towers listed with available unit counts (e.g., Crest, Crown, Blossom, Pinnacle, Bright) |
| Center panel | Floor-by-floor unit grid, colour-coded by status |
| Right panel | Selected unit details: Unit No, BHK type, carpet area, agreement value, discounts, total price |

### 2.5 Unit Colour Codes

| Colour | Meaning |
|--------|---------|
| White | Available — can be selected |
| Green | Currently selected by you |
| Orange | Another buyer is in the payment flow (hold) |
| Red | Booked/sold |

### 2.6 Additional Actions Available Before Payment

| Action | What It Shows |
|--------|--------------|
| Floor & Unit Plan > | Architectural plan of the selected floor and unit layout |
| Cost Sheet > | Full itemised pricing breakdown |
| Payment Schedule > | Milestone payment list |
| Cancel | Deselects the unit without releasing the hold |
| Change Unit | Re-selects a different unit |

### 2.7 Step-by-Step STATIC Allocation (Confirmed from TC-CST-001 to TC-CST-016)

**Phase 1: Navigate to unit selection**

1. On Home Dashboard, find registration with Status = **Available**
2. Click **Proceed to Confirm** in Process Status column
3. Allotment page loads — click **Book Now** (green badge)
4. Click **Select Unit >** in the center panel
5. Unit Selection screen opens

**Phase 2: Choose a unit**

1. Click a tower in the left panel to see its unit grid
2. Click any **white (Available)** unit — it turns **green (Selected)**
3. Right panel shows unit details: floor, unit number, typology, carpet area, agreement value, applicable offers/discounts, total price
4. Click **Add** to confirm selection — returns to the Allotment page
5. Center panel now shows selected unit with registration number

**Phase 3: Pay**

1. T&C checkbox is visible (unchecked by default)
2. **Pay button is DISABLED until T&C checkbox is ticked** (confirmed TC-CST-012)
3. Tick the checkbox: "I confirm to HoABL Terms & Conditions and Privacy Policy"
4. **Pay button becomes ENABLED** — click "Confirmation Amount Pay Rs. 27,000"
5. Easebuzz payment gateway opens:
   - Merchant: Impactum Lands Private Limited
   - Payment validity timer (~15 minutes)
   - Payment methods: Credit Card | Debit Card | UPI | NetBanking | Wallets
6. Complete payment

**Phase 4: Payment success**

1. Redirected to Payment Successful screen
2. Green checkmark + "Payment successful!" message
3. Unit details and applicant list shown
4. Home Dashboard updates: Status = Booked, Allotted Unit = unit details, Process Status = "Complete KYC"

### 2.8 Business Rules

1. Unit HOLD lasts exactly 20 minutes from when selection is confirmed (pay_now_initiated)
2. Only one unit can be held per buyer at a time
3. If two buyers try to hold the same unit simultaneously, only one succeeds — the other sees the unit as unavailable
4. Payment must complete within the 20-minute hold window or the unit is released
5. Redis manages real-time unit state during allocation; state persisted to DB via AOF
6. T&C checkbox must be ticked before the Pay button activates — no exceptions

---

## How to Use: Selecting and Booking a Unit (STATIC Allocation)

**Who does this:** Buyer, during a live allocation event

---

**Step 1 — Find your eligible registration**

On your Home Dashboard, find the registration row showing Status = **Available** and click **Proceed to Confirm**.

**Step 2 — Click "Book Now"**

On the Allotment page, click the green **Book Now** button for your eligible registration.

**Step 3 — Open Unit Selection**

Click **Select Unit >** to open the tower and unit grid.

**Step 4 — Choose your unit**

Click a tower on the left to see its floors. Click any **white unit** in the grid — it turns green to show it's selected. The right panel will show all details including the price and any discounts applied.

You can also:
- Click **Floor & Unit Plan >** to see the architectural layout
- Click **Cost Sheet >** to see the full pricing breakdown
- Click **Change Unit** if you change your mind

**Step 5 — Confirm selection**

Click **Add** to confirm your unit choice.

**Step 6 — Accept T&C and pay**

Tick the Terms and Conditions checkbox. The Pay button will activate. Click **Confirmation Amount Pay Rs. 27,000** (or the displayed amount).

Complete payment in the Easebuzz gateway using your preferred method (Card, UPI, NetBanking, Wallet).

**Step 7 — Booking confirmed**

On success, you will see the Payment Successful screen. Your unit is now booked. Return to your Home Dashboard — the status will show **Booked** and your next step will be **Complete KYC**.

> **Important:** Once you select a unit, it is held for 20 minutes. If you do not complete payment within this window, the unit is released and becomes available to other buyers.

---

## Feature 3: DYNAMIC Allocation — Auto-Assigned Unit

### 3.1 Objective

During a DYNAMIC allocation campaign, the system auto-assigns a unit to the buyer in a round-based structure. Buyer sees their assigned unit and initiates payment.

### 3.2 How DYNAMIC Differs from STATIC

| Aspect | STATIC | DYNAMIC |
|--------|--------|---------|
| Unit selection | Buyer chooses from available grid | System assigns unit |
| Round structure | Open — all buyers compete simultaneously | Timed rounds — each buyer in their slot |
| Reassignment | Unit released if not paid in time | Buyer may receive a new unit in same typology |

### 3.3 DYNAMIC Allocation Flow

1. <!-- FSD-CORRECTION 2026-05-25: DYNAMIC allocation uses band-based assignment, not round-robin. Round-robin refers to CB assignment, not unit allocation. // Source: allocation-campaign.service.js --> System assigns units to registered buyers via band-based (DYNAMIC) allocation
2. Each round has a configurable time window (e.g., 20 minutes)
3. Buyer sees: **OpenAllottedUnit** component with their assigned unit
4. Buyer initiates payment (proceed_to_pay WebSocket message)
5. Payment must complete within the round window
6. On success → WINNER status
7. On failure/timeout → system may reallocate to next available unit in same typology
8. If no units remain → buyer placed on WAITLIST

### 3.4 DYNAMIC-Specific Components

| Component | Description |
|-----------|-------------|
| WatchingUnitList | Units buyer has seen/been assigned |
| YourMissedChances | Units missed from Redis lost_units history |
| HurryUnitsBookingFaster | Urgency indicator for fast-moving inventory |
| MissedYourUnit | Alert when an assigned unit was taken |
| UnitSoldNotification | Real-time popup when another unit is sold |

---

## How to Use: Booking During DYNAMIC Allocation

**Who does this:** Buyer, during a live DYNAMIC allocation event

---

In a DYNAMIC allocation, you do not choose your unit — the system assigns one to you based on your registration preferences. When the campaign is live:

**Step 1 — View your assigned unit**

Navigate to the Allotment section. Your assigned unit will be shown with all details — tower, floor, typology, price, and discounts.

**Step 2 — Review and proceed**

Check the unit details. If you want to proceed, click **Proceed to Pay**. The payment gateway opens.

**Step 3 — Pay within the time window**

You must complete payment within the round's time limit. If you miss it, the system may assign you a different unit.

**Step 4 — Booking confirmed**

On successful payment, you reach WINNER status. Your home dashboard updates and you can proceed to KYC.

---

## Feature 4: Post-Campaign State

### 4.1 Behaviour After Campaign Ends

- All Available registrations revert to Waitlisted status
- Allotment page center panel shows: "Allocation window is closed for now." (red text)
- No "Select Unit" or "Book Now" buttons are visible for Waitlisted registrations
- Booked status remains unchanged for completed bookings

---

## How to Use: After the Campaign Ends

**Who does this:** Buyer who did not complete a booking before the campaign ended

---

If the allocation window closes before you completed your booking, your status changes from Available to **Waitlisted**. You will see the message "Allocation window is closed for now." on the Allotment screen.

Waitlisted buyers may get another opportunity in the next allocation campaign. Watch for notifications from the team.

Your Home Dashboard will show **Waitlisted** badge in the Status column.
