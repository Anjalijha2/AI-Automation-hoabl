# Feature-Spec: Unit Details

**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/kyc?unitId=<base64>` <!-- DOC_DRIFT-001 corrected 2026-06-06: /allotted-units obsolete — actual route is /kyc?unitId=<base64> per visual-memory/buyer/unit-details/INDEX.md -->
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: View Allocated Unit Details

### 1.1 Objective

Allow buyers to view comprehensive information about their allocated unit, including the full cost sheet, floor plan, tower view, and payment schedule.

### 1.2 Scope

Available only after the buyer has WINNER status (confirmed unit booking). Cost sheet reflects pricing as frozen at the time of allocation — subsequent offer changes do not affect confirmed bookings.

### 1.3 Preconditions

- Buyer must be logged in
- Buyer must have WINNER status (confirmed booking with payment)

### 1.4 Unit Details Sections

---

**Unit Details (UnitDetails)**

| Field | Description |
|-------|-------------|
| Unit number | e.g., 3502 |
| Floor | e.g., 35 |
| Tower name | e.g., Crest |
| Apartment type/configuration | e.g., 1 Bed Growth Home |
| Carpet area | e.g., 323 sq.ft. |
| Saleable area | Total area including common spaces |
| Facing direction | e.g., East, West, North |
| Floor plan image | Architectural plan for this unit's floor |

---

**Cost Sheet (CostSheet)**

Itemised pricing breakdown showing:

| Item | Description |
|------|-------------|
| Basic price | Core unit price |
| Floor rise charge | Premium for higher floors |
| Premium charge | Unit-specific premium |
| Infrastructure charge | Infrastructure cost component |
| Society charge | Society formation fee |
| Clubhouse charge | Clubhouse membership |
| Possession charge | Possession-related fee |
| GST amount | Applicable GST |
| Parking charge | Parking space cost |
| Total unit value | Sum of all above |
| Offer/discount deduction | HOME_LOAN, VC_REQUEST, or admin offers applied |
| Early bird benefit | Early registration discount (if applicable) |
| Net payable amount | Final amount after all deductions |

---

**Tower View (towerView)**

- Visual representation showing the buyer's unit position within the tower

---

**Floor and Unit Plans (FloorUnitPlans)**

- Architectural floor plan of the buyer's specific floor
- Individual unit layout showing room sizes and configuration

---

**Payment Schedule Detail (PaymentSchedule)**

- Same milestone-by-milestone breakdown as the Payment Schedule section
- Accessible directly from Unit Details for convenience

### 1.5 Business Rules

1. Unit details are visible only after WINNER status is confirmed
2. Cost sheet is frozen at the time of allocation — subsequent offer changes do not affect confirmed bookings
3. All discounts/offers applied to the unit are included in the cost sheet

---

## How to Use: Viewing Your Unit Details

**Who does this:** Buyer, after unit booking is confirmed

---

**Step 1 — Navigate to Unit Details**

From the navigation menu, click **My Unit** or navigate to the Allotted Units section. Your unit information will load.

**Step 2 — View your unit specifications**

The top section shows your unit's key details: the unit number, floor, tower, apartment type, carpet area, and facing direction.

**Step 3 — Review the cost sheet**

The cost sheet shows a full breakdown of everything that makes up your unit's price — basic price, all charges, GST, any applicable discounts, and the final net payable amount.

> **Your offers and discounts are shown here.** If you completed a home loan application or had a video call with a Sales Manager, any resulting discounts will appear as deductions in this cost sheet.

**Step 4 — View floor and unit plans**

Scroll to the floor plan section to see the architectural layout of your floor and your specific unit's dimensions and room layout.

**Step 5 — Check the tower view**

The tower visualisation shows exactly where your unit sits within the building — which floor, and its position relative to the tower structure.

**Step 6 — View payment milestones**

The payment schedule section at the bottom of Unit Details shows all your upcoming construction-linked payment milestones.
