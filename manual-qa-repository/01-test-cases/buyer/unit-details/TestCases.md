# TestCases — Buyer Portal / Unit Details

**Module:** Unit Details
**Portal:** Buyer (`https://uat.xrportal.in/`)
**BRD/FRD Sources:**
- `.claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md` (Section 3 row 7, Section 4 rules 7/12)
- `.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Unit-Details.md` (Feature 1)
**Visual Memory:** `visual-memory/buyer/unit-details/INDEX.md` — **CAPTURE_STATUS: STUB**
**Generated:** 2026-06-03
**Generator:** BA Agent (manual-tester skill)

---

## VISUAL EVIDENCE WARNING

> **VISUAL EVIDENCE IS STUB** — Expected Results may not match live UI. Full capture needed before automation.
>
> All known URL patterns tried by Tech Lead Agent returned 404:
> - `/allotted-unit`, `/allotted-units` (BRD/FRD canonical URL), `/unit-details`, `/my-unit`
>
> "Unit Details" / "My Unit" not present in navigation sidebar for the captured test account.
> Observed possible access pattern: "Download your Unit Details" button on Home Dashboard cards.
>
> All TCs below carry `[STUB-EVIDENCE]` and must be re-baselined when a WINNER-status buyer is available to capture the live page.

---

## REQUIREMENT GAPS & BUG FLAGS

### POTENTIAL_BUG-001 — Documented URL returns 404
- **BRD reference:** BUYER-BRD Section 3, row 7 — `/allotted-units`
- **FRD reference:** BUYER-FS-Unit-Details Section 1 header — `https://uat.xrportal.in/allotted-units`
- **Observed:** All four URL variants return Next.js 404 ("This page could not be found.")
- **Hypothesis A (bug):** Route not deployed to UAT or has changed slug.
- **Hypothesis B (precondition):** Page is gated behind WINNER status (BRD rule 7, FRD 1.3). Test account `8888888888` may not hold WINNER status, so route is unreachable.
- **Action required:** Provide a buyer account in WINNER state, OR confirm the live route. Until then, TCs are written against FRD-documented behaviour and flagged STUB.

### GAP-001 — Navigation entry point unclear
- **FRD step 1 (line 100):** "click **My Unit** or navigate to the Allotted Units section"
- **Visual memory:** Sidebar shows Home / Registration / Allotment / Homeloan / Project / Work Progress / Logout — no "My Unit", no "Allotted Units" entry.
- **Observed alternative:** "Download your Unit Details" button on Home Dashboard card (also mentioned in BRD Section 6 step 7 as a post-KYC link).
- **Impact:** Entry-point TCs (`TC_UNIT_FUNC_001`) cannot be finalised without confirmation of the real nav element. Documented both candidate entry points below.

### GAP-002 — Tower View rendering format
- **FRD 1.4 (towerView):** "Visual representation showing the buyer's unit position within the tower" — format (image vs. SVG vs. interactive 3D) not specified, no screenshot available.

### GAP-003 — Floor plan asset source
- **FRD 1.4 (FloorUnitPlans):** Images of floor plan + unit layout — source (Strapi CMS? Azure Blob?) not specified in FRD. Not testable beyond presence/visibility until rendering mechanism is captured.

---

## SHEET 1 — MANUAL TEST CASES

Columns: TC_ID | BRD/FRD Req ID | Portal | Module | Type | Scenario | Preconditions | Steps | Expected Result | Visual Evidence | Test Data | Priority | Status

---

### TC_UNIT_FUNC_001 — Navigate to Unit Details via primary nav entry
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § How-to Step 1; BUYER-BRD § 3 row 7
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** FUNC
- **Scenario:** Buyer with WINNER status accesses Unit Details page from the main navigation.
- **Preconditions:**
  1. Buyer logged in (UAT OTP `147258`)
  2. Buyer holds WINNER status on at least one registration (booking + payment complete)
- **Steps:**
  1. Log in as a WINNER-status buyer
  2. From the navigation menu, click "My Unit" (or the "Allotted Units" entry per FRD line 100)
  3. Wait for the page route to settle
- **Expected Result:**
  - URL is `https://uat.xrportal.in/allotted-units` (per FRD § header)
  - Page renders without 404
  - Unit Details, Cost Sheet, Tower View, Floor & Unit Plans, and Payment Schedule sections are all present (per FRD § 1.4)
- **Visual Evidence:** `[STUB-EVIDENCE]` — no live capture; nav element absent in current test-account capture. See GAP-001.
- **Test Data:** WINNER-status buyer account (TBD)
- **Priority:** P1 (Critical)
- **Status:** Conditional — blocked by POTENTIAL_BUG-001 / GAP-001

---

### TC_UNIT_FUNC_002 — Access Unit Details via Home Dashboard "Download your Unit Details" button
- **BRD/FRD Req ID:** BUYER-BRD § 6 step 7 (post-KYC "Download your Unit Details" link)
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** FUNC
- **Scenario:** Buyer accesses Unit Details from the Home Dashboard card after KYC submission.
- **Preconditions:**
  1. Buyer logged in
  2. Buyer has completed KYC submission (Process Status indicates KYC submitted)
- **Steps:**
  1. Navigate to Home Dashboard (`/home`)
  2. Locate the registration card showing the buyer's booked unit
  3. Click "Download your Unit Details" on that card
- **Expected Result:**
  - Either: a Unit Details page loads (likely `/allotted-units`), OR a PDF/download of the unit detail summary is triggered (per BRD wording "Download your Unit Details")
  - All FRD § 1.4 sections are visible (page case) OR a complete unit summary PDF is downloaded (download case)
- **Visual Evidence:** `[STUB-EVIDENCE]` — button referenced in visual-memory INDEX.md "Likely Access Pattern" but not captured in action.
- **Test Data:** Buyer with completed KYC
- **Priority:** P1
- **Status:** Conditional — entry-point semantics (page vs. download) unconfirmed

---

### TC_UNIT_BIZ_001 — Unit Details inaccessible before WINNER status
- **BRD/FRD Req ID:** BUYER-BRD § 4 rule 7; BUYER-FS-Unit-Details § 1.3 & § 1.5 rule 1
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** BIZ
- **Scenario:** Buyer in non-WINNER state (ALLOCATED, PREALLOCATED, WAITLIST, or pre-payment) cannot access Unit Details.
- **Preconditions:**
  1. Buyer logged in
  2. Buyer status is one of: ALLOCATED / PREALLOCATED / WAITLIST (NOT WINNER)
- **Steps:**
  1. Log in as a non-WINNER buyer
  2. Attempt to navigate directly to `/allotted-units`
- **Expected Result:**
  - Page either: returns a friendly "Unit Details unavailable" / redirect to Home Dashboard, OR shows an empty state explaining WINNER status is required
  - Cost Sheet / Tower View / Floor Plan sections are NOT rendered
  - **Note:** Current observation is a raw 404. Whether 404 is the correct guarded behaviour or a bug requires product confirmation (linked to POTENTIAL_BUG-001).
- **Visual Evidence:** `[STUB-EVIDENCE]` — current capture shows 404 for the test account.
- **Test Data:** Non-WINNER buyer account
- **Priority:** P1
- **Status:** Conditional — expected guarded UX undefined in FRD

---

### TC_UNIT_FUNC_003 — Unit Details section renders all fields
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § 1.4 UnitDetails
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** FUNC
- **Scenario:** Verify the UnitDetails section displays all 8 documented fields.
- **Preconditions:** WINNER-status buyer on Unit Details page.
- **Steps:**
  1. Navigate to Unit Details page
  2. Inspect the top "Unit Details" section
- **Expected Result:** Section displays:
  - Unit number (e.g., 3502)
  - Floor (e.g., 35)
  - Tower name (e.g., Crest)
  - Apartment type / configuration (e.g., 1 Bed Growth Home)
  - Carpet area (e.g., 323 sq.ft.)
  - Saleable area
  - Facing direction (East / West / North / South)
  - Floor plan image for this unit's floor
- **Visual Evidence:** `[STUB-EVIDENCE]` — no live screenshot.
- **Test Data:** Sample WINNER buyer with known unit (Tower=Crest, Unit=3502 per FRD example)
- **Priority:** P1
- **Status:** Conditional

---

### TC_UNIT_FUNC_004 — Cost Sheet displays all itemised line items
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § 1.4 CostSheet
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** FUNC
- **Scenario:** Verify cost sheet shows all 13 documented line items including offers and net payable.
- **Preconditions:** WINNER-status buyer on Unit Details page.
- **Steps:**
  1. Open Unit Details page
  2. Scroll to the Cost Sheet section
  3. Verify each line item is present and shows a numeric value (or zero)
- **Expected Result:** Cost Sheet lists:
  - Basic price, Floor rise charge, Premium charge, Infrastructure charge, Society charge, Clubhouse charge, Possession charge, GST amount, Parking charge
  - **Total unit value** (sum of above)
  - Offer/discount deduction (HOME_LOAN / VC_REQUEST / admin offer if applied)
  - Early bird benefit (if applicable)
  - **Net payable amount** (final)
- **Visual Evidence:** `[STUB-EVIDENCE]`
- **Test Data:** Buyer with HOME_LOAN offer applied (to validate offer line) and one without (to validate zero/hidden state)
- **Priority:** P1
- **Status:** Conditional

---

### TC_UNIT_BIZ_002 — Cost sheet is frozen at allocation time
- **BRD/FRD Req ID:** BUYER-BRD § 4 rule 12; BUYER-FS-Unit-Details § 1.5 rule 2
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** BIZ
- **Scenario:** After a buyer reaches WINNER, subsequent admin offer changes for the project must NOT alter the buyer's frozen cost sheet.
- **Preconditions:**
  1. Buyer A is WINNER with cost sheet captured (snapshot 1)
  2. Admin modifies a project-wide offer/discount AFTER Buyer A's booking
- **Steps:**
  1. Capture Buyer A's cost sheet snapshot 1 (all line items + net payable)
  2. (Out of band) Admin updates offer percentages or amounts
  3. Reload Buyer A's Unit Details page → capture snapshot 2
  4. Compare snapshot 1 vs snapshot 2
- **Expected Result:** All cost-sheet line items and Net Payable are IDENTICAL between snapshot 1 and snapshot 2 — proving the frozen-at-allocation rule.
- **Visual Evidence:** `[STUB-EVIDENCE]`
- **Test Data:** Buyer A WINNER; admin tool access (separate session)
- **Priority:** P1
- **Status:** Conditional

---

### TC_UNIT_FUNC_005 — Offers/discounts (HOME_LOAN, VC_REQUEST) reflected in cost sheet
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § 1.4 (offer/discount line); BUYER-BRD § 4 rule 11
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** FUNC
- **Scenario:** A buyer who completed Home Loan flow or had a VC sees the corresponding discount as a deduction line.
- **Preconditions:** WINNER buyer who completed Easiloan home-loan flow (HOME_LOAN offer applied) OR who had a VC_REQUEST offer applied.
- **Steps:**
  1. Open Unit Details
  2. Locate the "Offer/discount deduction" line in Cost Sheet
- **Expected Result:**
  - Line labelled with the offer type (e.g., HOME_LOAN or VC_REQUEST or admin offer name)
  - Negative amount equal to the offer value
  - Net payable amount = Total unit value − this discount (− any early bird benefit)
- **Visual Evidence:** `[STUB-EVIDENCE]`
- **Test Data:** Buyer with `HOME_LOAN` offer applied
- **Priority:** P1
- **Status:** Conditional

---

### TC_UNIT_FUNC_006 — Tower View renders buyer's unit position
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § 1.4 towerView
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** FUNC
- **Scenario:** Tower View section highlights the buyer's unit within the tower.
- **Preconditions:** WINNER buyer on Unit Details page.
- **Steps:**
  1. Open Unit Details
  2. Scroll to Tower View section
- **Expected Result:**
  - Tower visualisation is displayed
  - The buyer's specific unit is highlighted/marked at the correct floor + position
  - Rendering format (image/SVG/3D) to be confirmed — see GAP-002
- **Visual Evidence:** `[STUB-EVIDENCE]`
- **Test Data:** Buyer with unit on a known floor (e.g., floor 35)
- **Priority:** P2
- **Status:** Conditional — GAP-002 unresolved

---

### TC_UNIT_FUNC_007 — Floor and Unit Plans render
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § 1.4 FloorUnitPlans
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** FUNC
- **Scenario:** Floor plan and individual unit layout images load.
- **Preconditions:** WINNER buyer on Unit Details page.
- **Steps:**
  1. Open Unit Details
  2. Scroll to Floor Plan / Unit Plan section
- **Expected Result:**
  - Architectural floor plan image of the buyer's floor is visible
  - Individual unit layout image showing room sizes is visible
  - Both images load (no broken-image icon, no 404 network response)
- **Visual Evidence:** `[STUB-EVIDENCE]`
- **Test Data:** Buyer with available floor plan asset
- **Priority:** P2
- **Status:** Conditional — GAP-003 unresolved

---

### TC_UNIT_FUNC_008 — Payment Schedule section mirrors Payment Schedule module
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § 1.4 PaymentSchedule
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** FUNC
- **Scenario:** Payment Schedule shown inside Unit Details matches the standalone Payment Schedule module (`/paymentschedule`).
- **Preconditions:** WINNER buyer.
- **Steps:**
  1. Note milestones shown in standalone `/paymentschedule`
  2. Open Unit Details and scroll to Payment Schedule section
  3. Compare milestone list (name, due %, amount, status)
- **Expected Result:** Both views show the same milestone breakdown — name, amount, due percentage, and status are identical row-for-row.
- **Visual Evidence:** `[STUB-EVIDENCE]`
- **Test Data:** WINNER buyer with seeded milestones
- **Priority:** P2
- **Status:** Conditional

---

### TC_UNIT_VAL_001 — Numeric values formatted as INR currency
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § 1.4 CostSheet (implicit)
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** VAL
- **Scenario:** All cost-sheet amounts use Indian number formatting (lakhs/crores grouping) with ₹ symbol.
- **Preconditions:** WINNER buyer.
- **Steps:**
  1. Open Unit Details cost sheet
  2. Inspect each amount field
- **Expected Result:** Each amount is rendered as `₹ NN,NN,NNN` style; no raw integers like `2700000`.
- **Visual Evidence:** `[STUB-EVIDENCE]`
- **Test Data:** Any WINNER buyer
- **Priority:** P3
- **Status:** Conditional

---

### TC_UNIT_NEG_001 — Direct URL access by non-logged-in user redirects to login
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § 1.3 Preconditions (login required)
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** NEG
- **Scenario:** Anonymous user navigating to `/allotted-units` is redirected to login.
- **Preconditions:** No active session (cookies cleared).
- **Steps:**
  1. Open private/incognito window
  2. Navigate to `https://uat.xrportal.in/allotted-units`
- **Expected Result:** User is redirected to the login screen (`/`); Unit Details content NOT rendered.
- **Visual Evidence:** `[STUB-EVIDENCE]` — current capture is a 404 even in authenticated context; redirect behaviour for anonymous case not captured.
- **Test Data:** No auth
- **Priority:** P2
- **Status:** Conditional

---

### TC_UNIT_NEG_002 — Buyer with no booked unit accessing the page
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § 1.3
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** NEG
- **Scenario:** Logged-in buyer who never booked a unit (status: registered only) cannot view Unit Details.
- **Preconditions:** Buyer logged in, has registration but no allocation, no booking, no WINNER status.
- **Steps:**
  1. Log in as a buyer with `Available` registration only
  2. Attempt to navigate to `/allotted-units`
- **Expected Result:** Friendly empty-state OR redirect to Home Dashboard; FRD does not document this state — flagged for product confirmation.
- **Visual Evidence:** `[STUB-EVIDENCE]`
- **Test Data:** Buyer in `Available` status
- **Priority:** P2
- **Status:** Conditional — undocumented expected UX

---

### TC_UNIT_EDGE_001 — Buyer with multiple bookings (multiple registrations → multiple WINNER units)
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § 1.4 (single-unit assumption)
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** EDGE
- **Scenario:** Buyer who booked more than one unit across multiple registrations — how Unit Details page disambiguates.
- **Preconditions:** Buyer with two or more WINNER-status registrations.
- **Steps:**
  1. Log in as multi-booking buyer
  2. Navigate to Unit Details
- **Expected Result:** Either (a) a selector lists each WINNER unit and user picks one, OR (b) the page lists each unit's details sequentially. FRD does not specify — flagged.
- **Visual Evidence:** `[STUB-EVIDENCE]`
- **Test Data:** Buyer with 2+ WINNER unit bookings
- **Priority:** P3
- **Status:** Conditional — undocumented in FRD

---

### TC_UNIT_UI_001 — Page layout matches FRD section ordering
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § 1.4 (section order)
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** UI
- **Scenario:** Sections appear in order: UnitDetails → CostSheet → towerView → FloorUnitPlans → PaymentSchedule.
- **Preconditions:** WINNER buyer.
- **Steps:**
  1. Open Unit Details
  2. Scroll top to bottom and note section order
- **Expected Result:** Order matches FRD § 1.4: Unit Details, Cost Sheet, Tower View, Floor & Unit Plans, Payment Schedule.
- **Visual Evidence:** `[STUB-EVIDENCE]`
- **Test Data:** WINNER buyer
- **Priority:** P3
- **Status:** Conditional

---

### TC_UNIT_UI_002 — Responsive layout on mobile viewport
- **BRD/FRD Req ID:** BUYER-BRD § 1 ("mobile-first")
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** UI
- **Scenario:** Page is fully usable on mobile viewport widths (per BRD: portal is mobile-first).
- **Preconditions:** WINNER buyer.
- **Steps:**
  1. Open Unit Details at viewport 375×812 (mobile)
  2. Scroll all sections
- **Expected Result:** No horizontal scroll; all sections readable; floor plan/tower view images scale; cost sheet table reflows.
- **Visual Evidence:** `[STUB-EVIDENCE]`
- **Test Data:** WINNER buyer; mobile viewport emulation
- **Priority:** P3
- **Status:** Conditional

---

### TC_UNIT_XMOD_001 — Cost-sheet net payable equals payment-schedule sum
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § 1.4 PaymentSchedule + CostSheet
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** XMOD
- **Scenario:** Net payable amount on cost sheet equals the sum of all milestone amounts in Payment Schedule.
- **Preconditions:** WINNER buyer.
- **Steps:**
  1. From Cost Sheet, read Net Payable amount
  2. From Payment Schedule (in same page or standalone module), sum all milestone amounts
  3. Compare
- **Expected Result:** Net Payable == Σ(milestone amounts), to the rupee.
- **Visual Evidence:** `[STUB-EVIDENCE]`
- **Test Data:** WINNER buyer
- **Priority:** P2
- **Status:** Conditional

---

### TC_UNIT_REG_001 — Unit Details data unchanged across re-login
- **BRD/FRD Req ID:** BUYER-FS-Unit-Details § 1.5 rule 2 (cost sheet frozen)
- **Portal:** Buyer
- **Module:** Unit Details
- **Type:** REG
- **Scenario:** After logout/login, all unit values are bit-identical.
- **Preconditions:** WINNER buyer.
- **Steps:**
  1. Capture all field values
  2. Logout
  3. Log back in, navigate to Unit Details
  4. Re-capture
- **Expected Result:** Identical values in both captures.
- **Visual Evidence:** `[STUB-EVIDENCE]`
- **Test Data:** WINNER buyer
- **Priority:** P3
- **Status:** Conditional

---

## SHEET 2 — AUTOMATION CANDIDATES

Columns: TC_ID | Module | Type | Automatable | Complexity | Visual Evidence Status | Playwright Suite | Notes

| TC_ID | Module | Type | Automatable | Complexity | Visual Evidence | Suite | Notes |
|-------|--------|------|-------------|------------|------------------|-------|-------|
| TC_UNIT_FUNC_001 | Unit Details | FUNC | Yes (after STUB→FULL) | Low | STUB | e2e | Blocked until access path confirmed |
| TC_UNIT_FUNC_002 | Unit Details | FUNC | Yes (after STUB→FULL) | Med | STUB | e2e | Branch on page vs. download response |
| TC_UNIT_BIZ_001 | Unit Details | BIZ | Yes | Med | STUB | regression | Needs non-WINNER seed data |
| TC_UNIT_FUNC_003 | Unit Details | FUNC | Yes | Low | STUB | e2e | Field-presence assertions |
| TC_UNIT_FUNC_004 | Unit Details | FUNC | Yes | Med | STUB | e2e | Iterate cost-sheet rows |
| TC_UNIT_BIZ_002 | Unit Details | BIZ | Partial | High | STUB | regression | Requires admin side-channel — manual coordination |
| TC_UNIT_FUNC_005 | Unit Details | FUNC | Yes | Med | STUB | e2e | Requires HOME_LOAN-seeded buyer |
| TC_UNIT_FUNC_006 | Unit Details | FUNC | Partial | Med | STUB | ui-ux | Highlight verification needs visual diff once GAP-002 closed |
| TC_UNIT_FUNC_007 | Unit Details | FUNC | Yes | Low | STUB | e2e | Image-load assertion |
| TC_UNIT_FUNC_008 | Unit Details | FUNC | Yes | Med | STUB | e2e | Cross-references /paymentschedule |
| TC_UNIT_VAL_001 | Unit Details | VAL | Yes | Low | STUB | ui-ux | Regex assertion on amount formatting |
| TC_UNIT_NEG_001 | Unit Details | NEG | Yes | Low | STUB | e2e | No auth state |
| TC_UNIT_NEG_002 | Unit Details | NEG | Yes | Low | STUB | e2e | Pending product confirmation |
| TC_UNIT_EDGE_001 | Unit Details | EDGE | Manual first | High | STUB | manual | Behaviour undocumented |
| TC_UNIT_UI_001 | Unit Details | UI | Yes | Low | STUB | ui-ux | DOM order assertion |
| TC_UNIT_UI_002 | Unit Details | UI | Yes | Med | STUB | ui-ux | Use Playwright device emulation |
| TC_UNIT_XMOD_001 | Unit Details | XMOD | Yes | Med | STUB | regression | Numeric reconciliation |
| TC_UNIT_REG_001 | Unit Details | REG | Yes | Low | STUB | regression | Snapshot comparison |

**Note:** All rows blocked pending STUB → FULL transition of visual memory. No automation scaffolding should begin until at least TC_UNIT_FUNC_001 and TC_UNIT_FUNC_003 have live screenshots.

---

## SHEET 3 — BUG TEMPLATE

| Bug ID | TC_ID | Severity | Steps | Actual | Expected | Environment | Status |
|--------|-------|----------|-------|--------|----------|-------------|--------|
| BUG-UNIT-001 (candidate) | TC_UNIT_FUNC_001 | High | 1. Log in to UAT as `8888888888`. 2. Navigate to `https://uat.xrportal.in/allotted-units` | Next.js 404 page ("This page could not be found.") | Either the Unit Details page renders (if test account holds WINNER), OR a graceful "Unit Details unavailable" guarded UX | UAT — `uat.xrportal.in` | Open / NEEDS_VERIFICATION — verify with a confirmed WINNER-status buyer before logging as bug |

---

## DUAL-SOURCE CONFIRMATION

| Source | Path | Status |
|--------|------|--------|
| Visual Memory | `visual-memory/buyer/unit-details/INDEX.md` | Present (STUB) |
| BRD | `.claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md` | Present |
| FRD | `.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Unit-Details.md` | Present |

Both sources confirmed: **YES** — gate cleared with STUB warning propagated to every TC.

---

## HANDOFF NOTES (for Tech Lead Agent and QA Agent)

1. **Tech Lead Agent — re-run visual-capture** with a WINNER-status buyer account. Until then, no automation specs should be generated. Capture target: full `/allotted-units` page, including each FRD § 1.4 section.
2. **QA Agent — test-case-reviewer** will fail visual coverage gate (0% FULL) until step 1 is complete. All 18 TCs are in Conditional status by design.
3. **Product clarifications needed:**
   - Confirm route slug — is `/allotted-units` correct on UAT?
   - Confirm nav element label — "My Unit" vs "Allotted Units" vs Home Dashboard download button
   - Confirm expected UX for non-WINNER access (404 vs guarded message)
   - Confirm multi-WINNER unit disambiguation (TC_UNIT_EDGE_001)
4. **POTENTIAL_BUG-001** should be re-tested with a WINNER account before being filed in `BUG_TRACKER.md`.
