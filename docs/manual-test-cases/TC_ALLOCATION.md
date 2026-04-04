# ALLOCATION MODULE — Manual Test Cases (Static E2E)

**Module:** Allocation (Admin + Customer Portal)
**Sprint:** 3
**Last updated:** 2026-04-04
**Source:** Static_Allocation_E2E_TestCases.pdf
**Total TCs:** 45 (3 Setup + 11 Admin + 31 Customer)
**Execution Order:** Follow phases 0 → 10 in strict order. Do NOT skip any phase.

---

## Quick Status Dashboard

| Phase | TC IDs | Count | Status |
|-------|--------|-------|--------|
| Phase 0 — Pre-Execution Setup | SETUP-01 to SETUP-03 | 3 | ✅ Automated |
| Phase 1 — Create Static Campaign (Admin) | TC-ADM-001 to TC-ADM-006 | 6 | ✅ Automated |
| Phase 2 — Customer Login & Home | TC-CST-001 to TC-CST-003 | 3 | ✅ Automated |
| Phase 3 — Allotment & Unit Selection | TC-CST-004 to TC-CST-013 | 10 | ✅ Automated (TC-CST-009, 013 ENV SKIP — UAT state) |
| Phase 4 — Payment (Rs. 27,000) | TC-CST-014 to TC-CST-016 | 3 | ✅ Automated (TC-CST-016 ENV SKIP — live gateway) |
| Phase 5 — KYC Completion | TC-CST-017 to TC-CST-023 | 7 | ✅ Automated |
| Phase 6 — Home: Booked Status & KYC Alert | TC-CST-024 | 1 | ✅ Automated |
| Phase 7 — Milestone Payments | TC-CST-025 to TC-CST-028 | 4 | ✅ Automated (TC-CST-028 manual-only — live gateway) |
| Phase 8 — Stop Campaign & Post-Stop | TC-ADM-007, TC-ADM-PHASE8, TC-CST-029, TC-CST-030 | 4 | ✅ Automated |
| Phase 9 — Auto-Completed Campaign | TC-ADM-008, TC-CST-031 | 2 | ✅ Automated (TC-ADM-008 ENV SKIP — no completed campaign on UAT) |
| Phase 10 — Final Filter & List Validation | TC-ADM-009, TC-ADM-010 | 2 | ✅ Automated (TC-ADM-010 ENV SKIP — UAT state) |
| **TOTAL** | | **45** | ✅ Sprint 3 — Allocation Complete |

---

## Test Data Reference

| Item | Value |
|------|-------|
| Admin URL | `https://uat-web.xrportal.in/admin/allocation` |
| Customer URL | `https://uat.xrportal.in` |
| Mobile | `1111111207` |
| OTP | `147258` (fixed UAT OTP) |
| Test User | Mamta Solanki |
| Project | Xanadu Test Project |
| Campaign Name | `Static Camp-Automation Test [N]` — increment N each run |
| Start Time Rule | now + 4 min (system minimum is 3 min) |
| End Time Rule | Start + 5 min |
| Tower | Crest |
| Unit | 3502 (Floor 35) |
| Agreement Value | Rs. 32,99,000 |
| Confirmation Amount | Rs. 27,000 (UAT gateway charges Rs. 100) |

---

## PHASE 0 — PRE-EXECUTION SETUP

---

### SETUP-01 — Verify Admin portal is accessible

| Field | Value |
|-------|-------|
| **TC ID** | SETUP-01 |
| **Type** | SETUP |
| **Pre-conditions** | Browser open. Admin credentials ready. |

| # | Step | Expected |
|---|------|----------|
| 1 | Open `https://uat-web.xrportal.in/admin/allocation` | Admin allocation page loads |
| 2 | Verify New Allocation Campaign form visible at top | Form visible |
| 3 | Verify left nav shows: Customers \| Config \| Allocation \| Towers \| JBP Mgmt \| Channel Partners \| Sales Managers | All menu items present |
| 4 | Verify campaign list table visible at bottom with columns: Campaign Name \| Allocation Type \| Start Time \| End Time \| Status \| Actions | Table visible with correct columns |

**Status:** ⏳ Planned

---

### SETUP-02 — Check and STOP any existing Active campaign (MANDATORY every run)

| Field | Value |
|-------|-------|
| **TC ID** | SETUP-02 |
| **Type** | SETUP |
| **Pre-conditions** | Admin page loaded. Run this MANDATORY before every test run. |

| # | Step | Expected |
|---|------|----------|
| 1 | In campaign list: set Project = Xanadu Test Project | Filter applied |
| 2 | Set Status filter = Active | Filter applied |
| 3 | Set Type = All Types | Filter applied |
| 4 | Click Refresh | List refreshes |
| 5 | **CASE A** — No Active campaign: List is empty → proceed to SETUP-03 | List empty — no action needed |
| 6 | **CASE B** — Active campaign found: Click **Stop** button in Actions column | Stop popup appears |
| 7 | Verify popup title = *Stop Allocation Now?* | Title correct |
| 8 | Verify popup message = *Campaign will move to Stopped.* | Message correct |
| 9 | Verify two buttons: Close \| **Yes, Stop Now** (red button) | Both buttons present |
| 10 | Click **Yes, Stop Now** → Click Refresh | Status = **Stopped** · Actions = View only |

**Status:** ⏳ Planned

---

### SETUP-03 — Verify Customer portal login page is accessible

| Field | Value |
|-------|-------|
| **TC ID** | SETUP-03 |
| **Type** | SETUP |
| **Pre-conditions** | Customer portal URL available. |

| # | Step | Expected |
|---|------|----------|
| 1 | Open `https://uat.xrportal.in` in a new browser tab | Login page loads |
| 2 | Verify APPLICANT LOGIN panel visible on right side | Panel visible |
| 3 | Verify Indian National and NRI tabs present | Both tabs present |
| 4 | Verify Mobile Number input field present | Input visible |
| 5 | Verify Send OTP button present | Button visible |

**Status:** ⏳ Planned

---

## PHASE 1 — CREATE STATIC ALLOCATION CAMPAIGN (Admin Portal)

---

### TC-ADM-001 — Create a new valid Static Allocation Campaign with all fields

| Field | Value |
|-------|-------|
| **TC ID** | TC-ADM-001 |
| **Type** | POSITIVE |
| **Pre-conditions** | Admin on allocation page. Test automation cancels any Upcoming + stops any Active campaign before attempting creation (handled by `createCampaignWithRetry`). |
| **Test Data** | Project: Xanadu Test Project · Campaign Name: `Static Camp-Automation Test-<timestamp>` · Type: Static · Start: now + 120 min · End: Start + 5 min · Description: Automation E2E Test |

| # | Step | Expected |
|---|------|----------|
| 1 | **[Auto pre-condition]** Cancel all Upcoming campaigns for the project | All Upcoming campaigns cancelled |
| 2 | **[Auto pre-condition]** Stop all Active campaigns for the project | All Active campaigns stopped |
| 3 | In New Allocation Campaign form: Click Project dropdown → Select Xanadu Test Project | Project selected |
| 4 | Enter Campaign Name = `Static Camp-Automation Test-<timestamp>` | Name entered |
| 5 | Verify Allocation Type = Static (default — DO NOT change) | Static shown |
| 6 | Click Start Time calendar icon → select today's date → set time = now + 120 min → click OK | Start time set |
| 7 | Click End Time calendar icon → set time = Start + 5 min → click OK | End time set |
| 8 | Enter Description = `Automation E2E Test` (optional) | Description entered |
| 9 | Click **Save Campaign** button | **Expected success:** Green toast: *Campaign created successfully* · Form resets to blank |
| | **Error case A** — *"Start time must be at least 3 minutes"* | Red banner shown → automation retries (up to 3×) |
| | **Error case B** — *"Upcoming campaign already exists"* | Red banner shown → automation cancels the blocking campaign and retries |
| | **Error case C** — *"Active campaign is currently running"* | Red banner shown → automation stops the blocking campaign and retries |
| 10 | Verify campaign visible in list with Status = Upcoming | Upcoming (grey badge) · Actions = View \| Cancel |

**Status:** ⏳ Planned

---

### TC-ADM-002 — Validate: Start time less than 3 minutes from now shows error

| Field | Value |
|-------|-------|
| **TC ID** | TC-ADM-002 |
| **Type** | NEGATIVE |
| **Pre-conditions** | Admin on allocation page. |
| **Test Data** | Start Time: now + 1 min · End Time: now + 6 min |

| # | Step | Expected |
|---|------|----------|
| 1 | Select Project = Xanadu Test Project · Enter any valid Campaign Name | Fields filled |
| 2 | Set Start Time = now + 1 minute (intentionally < 3 min) | Start time set |
| 3 | Set End Time = now + 6 minutes | End time set |
| 4 | Click Save Campaign | Red error banner: *Start time must be at least 3 minutes from now. Please select start and end time again.* |
| 5 | Verify campaign NOT created in list | Campaign absent from list |

**Status:** ⏳ Planned

---

### TC-ADM-003 — Validate: Required field validation errors on empty form submission

| Field | Value |
|-------|-------|
| **TC ID** | TC-ADM-003 |
| **Type** | NEGATIVE |
| **Pre-conditions** | Admin on allocation page. |

| # | Step | Expected |
|---|------|----------|
| 1 | Leave ALL fields empty → Click Save Campaign | Inline error shown on Project field |
| 2 | Fill Project only → Click Save | Inline error on Campaign Name field |
| 3 | Fill Project + Campaign Name → Click Save | Inline error on Start Time field |
| 4 | Fill Project + Name + Start → Click Save | Inline error: *End time is required* shown below End Time field |
| 5 | Verify campaign NOT saved in any of the above cases | Campaign absent from list |

**Status:** ⏳ Planned

---

### TC-ADM-004 — Verify newly created campaign appears in list with correct Upcoming status

| Field | Value |
|-------|-------|
| **TC ID** | TC-ADM-004 |
| **Type** | POSITIVE |
| **Pre-conditions** | Campaign created in TC-ADM-001. |

| # | Step | Expected |
|---|------|----------|
| 1 | In campaign list: set Project = Xanadu Test Project · Status = All Status (or Upcoming) | Filters set |
| 2 | Click Refresh | List reloads |
| 3 | Find the newly created campaign | Campaign visible |
| 4 | Verify Allocation Type column = STATIC | Type correct |
| 5 | Verify Start Time and End Time match entered values | Times correct |
| 6 | Verify Status = Upcoming (grey badge) | Upcoming badge shown |
| 7 | Verify Actions = View \| Cancel | Correct action buttons |

**Status:** ⏳ Planned

---

### TC-ADM-005 — Verify Status filter dropdown contains all 7 valid status options

| Field | Value |
|-------|-------|
| **TC ID** | TC-ADM-005 |
| **Type** | POSITIVE |
| **Pre-conditions** | Campaign list visible on admin page. |

| # | Step | Expected |
|---|------|----------|
| 1 | Click the Status filter dropdown in campaign list | Dropdown opens |
| 2 | Count and note all options listed | Dropdown shows exactly 7 options: 1. All Status · 2. Active · 3. Upcoming · 4. Completed · 5. Stopped · 6. Cancelled · 7. Failed |

**Status:** ⏳ Planned

---

### TC-ADM-006 — Verify campaign status transitions from Upcoming to Active after start time

| Field | Value |
|-------|-------|
| **TC ID** | TC-ADM-006 |
| **Type** | POSITIVE |
| **Pre-conditions** | Campaign in Upcoming status. Start Time ~4 minutes away. |

| # | Step | Expected |
|---|------|----------|
| 1 | Note the exact Start Time of the created campaign | Start time noted |
| 2 | Wait until that Start Time is reached | — |
| 3 | In campaign list: set Status = Active · Click Refresh every 30 seconds | — |
| 4 | Observe Status column for the campaign | Status changes from Upcoming → **Active** (green badge) · Actions = View \| Stop · Cancel button NO LONGER visible |

**Status:** ⏳ Planned

---

## PHASE 2 — CUSTOMER PORTAL: LOGIN AND HOME DASHBOARD

---

### TC-CST-001 — Login to customer portal with valid mobile and OTP

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-001 |
| **Type** | POSITIVE |
| **Pre-conditions** | Customer portal accessible. Campaign is Active. |
| **Test Data** | Mobile: `1111111207` · OTP: `147258` |

| # | Step | Expected |
|---|------|----------|
| 1 | Open `https://uat.xrportal.in` | Login page loads |
| 2 | Select nationality = **Indian National** | Tab selected |
| 3 | Enter Mobile Number = `1111111207` | Mobile entered |
| 4 | Click **Send OTP** button | OTP field appears |
| 5 | Enter OTP = `147258` | OTP entered |
| 6 | Click **Verify OTP** button | OTP accepted |
| 7 | Verify redirected to Home dashboard | Home page loads |
| 8 | Verify welcome message: *Welcome, Mamta Solanki* | Welcome message shown |
| 9 | Verify left nav visible: Home \| Registration \| Allotment \| Homeloan \| Project \| Work Progress | All nav items present |

**Status:** ⏳ Planned

---

### TC-CST-002 — Home dashboard shows correct registration statuses during Active campaign

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-002 |
| **Type** | POSITIVE |
| **Pre-conditions** | User logged in as Mamta Solanki. Campaign is Active. |

| # | Step | Expected |
|---|------|----------|
| 1 | On Home page scroll down to Details section | Table visible |
| 2 | Verify all columns present | Registration Number \| Home Loan \| Allotted Unit \| Status \| Process Status \| Payment Schedule |
| 3 | Verify GHNG-1000000063-A | Status = Available (green) · Process Status = **Proceed to Confirm** button |
| 4 | Verify GHNG-1000000063-B | Status = Waitlisted (dark badge) |
| 5 | Verify GHNG-1000000063-C, D, E | Status = Refunded (red badge) |
| 6 | Verify GHNG-1000000063-F, G | Status = Waitlisted (dark badge) |
| 7 | Verify Allotment Closing countdown timer visible | Timer visible and counting down |
| 8 | Verify Add Units button visible at top right | Button present |

**Status:** ⏳ Planned

---

### TC-CST-003 — Login with invalid OTP shows error message (Negative Test)

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-003 |
| **Type** | NEGATIVE |
| **Pre-conditions** | Customer portal login page open. |
| **Test Data** | Mobile: `1111111207` · OTP: `000000` (incorrect) |

| # | Step | Expected |
|---|------|----------|
| 1 | Select nationality = Indian National · Enter Mobile = `1111111207` · Click Send OTP | OTP field appears |
| 2 | Enter OTP = `000000` (incorrect) | OTP entered |
| 3 | Click **Verify OTP** | Error message displayed (e.g. *Invalid OTP*) |
| 4 | Verify user stays on login page | NOT redirected to Home dashboard |

**Status:** ⏳ Planned

---

## PHASE 3 — ALLOTMENT PAGE AND UNIT SELECTION

---

### TC-CST-004 — Click Proceed to Confirm redirects to Allotment page

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-004 |
| **Type** | POSITIVE |
| **Pre-conditions** | User logged in. Campaign is Active. GHNG-1000000063-A shows Available status. |

| # | Step | Expected |
|---|------|----------|
| 1 | On Home page find GHNG-1000000063-A with Status = Available | Registration found |
| 2 | Click **Proceed to Confirm** under Process Status column | Redirected to Allotment page (URL: /allotted) |
| 3 | Verify congratulations message: *Congratulations Mamta! You're Eligible to Select Your Growth Home!* | Message shown |
| 4 | Verify left panel shows registration list with status badges | Registrations listed |
| 5 | Verify GHNG-1000000063-A shows green **Book Now** badge | Book Now visible |
| 6 | Verify confirmation window timer shown at top right counting down | Timer visible |

**Status:** ⏳ Planned

---

### TC-CST-005 — Navigate to Allotment page via left navigation menu

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-005 |
| **Type** | POSITIVE |
| **Pre-conditions** | User logged in. Campaign is Active. |

| # | Step | Expected |
|---|------|----------|
| 1 | Click **Allotment** in left navigation menu | Allotment page loads |
| 2 | Verify page URL = /allotted | Correct page |
| 3 | Verify all registrations listed in left panel with correct status badges | Registrations visible |
| 4 | Verify confirmation window timer visible at top right | Timer present |

**Status:** ⏳ Planned

---

### TC-CST-006 — Click Book Now then Select Unit to open the unit selection screen

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-006 |
| **Type** | POSITIVE |
| **Pre-conditions** | User on Allotment page. GHNG-1000000063-A shows green Book Now button. |

| # | Step | Expected |
|---|------|----------|
| 1 | Click the green **Book Now** button for GHNG-1000000063-A | Center panel updates showing Registration No = GHNG-1000000063-A |
| 2 | Click **Select Unit >** button in center panel | Unit selection screen opens |
| 3 | Verify page header: *Select Unit for GHNG-1000000063-A* | Header correct |
| 4 | Verify left panel shows tower list: Crest \| Crown \| Blossom \| Pinnacle \| Bright with unit counts | Towers listed |
| 5 | Verify unit grid shown in center | Grid visible |
| 6 | Verify colour legend shown: Selected=green \| Available=white \| Sold=red \| Paying now=orange \| Refuge=grey | Legend present |

**Status:** ⏳ Planned

---

### TC-CST-007 — Tower selection updates unit grid correctly

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-007 |
| **Type** | POSITIVE |
| **Pre-conditions** | User on unit selection screen. |

| # | Step | Expected |
|---|------|----------|
| 1 | Click **Crest** tower in left panel | Crest selected and highlighted |
| 2 | Verify unit count shown below tower name (e.g. 159 Units Available) | Count visible |
| 3 | Verify grid shows floors 1 to 35 | All floors visible |
| 4 | Verify 8 unit columns per floor (Unit-1 to Unit-8) | 8 columns per row |
| 5 | Verify colour coding correct: Available=white/light border · Sold=red · Selected=green | Colours correct |
| 6 | Click another tower (e.g. Crown) and verify grid updates | Grid updates to Crown units |

**Status:** ⏳ Planned

---

### TC-CST-008 — Select an available unit and verify New Unit Details panel appears with correct data

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-008 |
| **Type** | POSITIVE |
| **Pre-conditions** | User on unit selection screen. Crest tower selected. |
| **Test Data** | Tower: Crest · Unit: 3502 · Floor: 35 |

| # | Step | Expected |
|---|------|----------|
| 1 | Select Crest tower | Crest grid shown |
| 2 | Scroll to Floor 35 | Floor 35 visible |
| 3 | Click Unit 3502 — must be white/available (NOT red) | Unit 3502 turns green (selected) |
| 4 | Verify New Unit Details panel opens on right | Panel visible |
| 5 | Verify Unit No = `3502 – Crest` | Correct |
| 6 | Verify BHK = `1 BHK Growth Home` | Correct |
| 7 | Verify Size = `323 sq.ft.` | Correct |
| 8 | Verify Agreement Value = `Rs. 32,99,000` | Correct |
| 9 | Verify Home Loan Offer Discount = `-Rs. 10,000` | Correct |
| 10 | Verify Early Bird Benefit Discount = `-Rs. 27,000` | Correct |
| 11 | Verify All Inclusive Price = `Rs. 35,52,960` | Correct |
| 12 | Verify Total Discount badge = `Rs. 37,000` | Correct |
| 13 | Verify Cancel and Add buttons visible | Both buttons present |

**Status:** ⏳ Planned

---

### TC-CST-009 — Sold unit (red) cannot be selected (Negative Test)

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-009 |
| **Type** | NEGATIVE |
| **Pre-conditions** | User on unit selection screen. Red Sold units visible in grid. |

| # | Step | Expected |
|---|------|----------|
| 1 | Identify any red coloured (Sold) unit in the grid | Sold unit found |
| 2 | Click on that red unit | Sold unit CANNOT be selected |
| 3 | Verify New Unit Details panel does NOT open | Panel absent |
| 4 | Verify no action taken | No response to click |

**Status:** ⏳ Planned

---

### TC-CST-010 — Click Add confirms unit selection and returns to Allotment page

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-010 |
| **Type** | POSITIVE |
| **Pre-conditions** | Unit 3502 selected. New Unit Details panel visible. |

| # | Step | Expected |
|---|------|----------|
| 1 | Review unit details shown in right panel | Details correct |
| 2 | Click **Add >** button | Redirected back to Allotment page |
| 3 | Verify center panel shows: `3502 – Crest` | Unit shown |
| 4 | Verify Registration No: GHNG-1000000063-A shown | Reg number correct |
| 5 | Verify **Change Unit** link visible in center panel | Change Unit present |
| 6 | Verify T&C checkbox visible (unchecked by default) | Checkbox unchecked |
| 7 | Verify *Confirmation Amount Pay Rs. 27,000* button visible but **DISABLED** | Pay button disabled |

**Status:** ⏳ Planned

---

### TC-CST-011 — Floor & Unit Plan, Cost Sheet, and Payment Schedule buttons navigate correctly

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-011 |
| **Type** | POSITIVE |
| **Pre-conditions** | Unit 3502 selected on Allotment page. |

| # | Step | Expected |
|---|------|----------|
| 1 | Click **Floor & Unit Plan >** → verify it opens → go back | Floor plan visible showing floor layout and unit positions |
| 2 | Click **Cost Sheet >** → verify it opens → go back | Cost sheet visible showing itemised pricing breakdown |
| 3 | Click **Payment Schedule >** → verify it opens | Payment schedule visible showing milestone list |

**Status:** ⏳ Planned

---

### TC-CST-012 — Pay button is disabled until T&C checkbox is ticked

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-012 |
| **Type** | POSITIVE |
| **Pre-conditions** | Unit 3502 selected on Allotment page. T&C checkbox unchecked. |

| # | Step | Expected |
|---|------|----------|
| 1 | Observe *Confirmation Amount Pay Rs. 27,000* button — should be DISABLED | Pay button DISABLED |
| 2 | Tick T&C checkbox: *I confirm to HoABL Terms & Conditions and Privacy Policy* | Checkbox ticked |
| 3 | Observe Pay button state | Pay button becomes **ENABLED** |

**Status:** ⏳ Planned

---

### TC-CST-013 — Change Unit functionality allows selecting a different unit

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-013 |
| **Type** | POSITIVE |
| **Pre-conditions** | Unit 3502 selected and confirmed on Allotment page. |

| # | Step | Expected |
|---|------|----------|
| 1 | Click **Change Unit** link in center panel | Unit selection screen opens |
| 2 | Select a different available unit from any tower | Unit selected |
| 3 | Click **Add** | Allotment page shows new unit details |
| 4 | Verify original unit 3502 is no longer shown | Original unit replaced |

**Status:** ⏳ Planned

---

## PHASE 4 — PAYMENT (Confirmation Amount Rs. 27,000)

---

### TC-CST-014 — Click Pay opens Easebuzz gateway with all 5 payment methods

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-014 |
| **Type** | POSITIVE |
| **Pre-conditions** | Unit 3502 selected. T&C checkbox ticked. Pay button enabled. |

| # | Step | Expected |
|---|------|----------|
| 1 | Verify T&C checkbox is ticked | Ticked |
| 2 | Click **Confirmation Amount Pay Rs. 27,000** button | Easebuzz gateway popup opens |
| 3 | Verify Merchant name: *Impactum Lands Private Limited* | Merchant shown |
| 4 | Verify Payment link validity timer (~15 minutes) | Timer shown |
| 5 | Verify 5 payment methods visible: Credit Card (RuPay/Mastercard/Visa) \| Debit Card \| UPI (BHIM/UPI) \| NetBanking \| Wallets | All 5 methods present |

**Status:** ⏳ Planned

---

### TC-CST-015 — Cancelling the gateway popup returns user to Allotment page (Run BEFORE actual payment)

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-015 |
| **Type** | POSITIVE |
| **Pre-conditions** | Easebuzz gateway popup open. Run this BEFORE making the real payment. |

| # | Step | Expected |
|---|------|----------|
| 1 | Click the Cancel (X) button on the gateway popup | Gateway popup closes |
| 2 | Verify user returned to Allotment page | Allotment page visible |
| 3 | Verify unit `3502 – Crest` still shown in center panel | Unit unchanged |
| 4 | Verify T&C checkbox remains checked | Checkbox still ticked |

**Status:** ⏳ Planned

---

### TC-CST-016 — Complete UPI payment and verify Payment successful screen

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-016 |
| **Type** | POSITIVE |
| **Pre-conditions** | Easebuzz gateway popup open. UAT test amount = Rs. 100. |

| # | Step | Expected |
|---|------|----------|
| 1 | Select **UPI** in gateway | UPI selected |
| 2 | Enter test UPI ID or use test payment flow available in UAT | UPI ID entered |
| 3 | Complete the payment (Note: UAT gateway shows Rs. 100 at the bottom) | Payment completes |
| 4 | Verify redirected to Payment successful screen | Screen loads |
| 5 | Verify green checkmark icon shown | Icon visible |
| 6 | Verify message: *Payment successful!* | Message shown |
| 7 | Verify sub-text: *You're just one step away from your dream home* | Sub-text shown |
| 8 | Verify Add Applicants section shows unit: *3502 – Crest – 1 Bed Growth Home (323 sq.ft.)* | Unit shown |
| 9 | Verify Mamta Solanki (Self) shown in applicant list | Primary applicant shown |
| 10 | Verify buttons visible: Verify Details \| Add Applicant \| Go to Home \| Confirm | All buttons present |

**Status:** ⏳ Planned

---

## PHASE 5 — KYC COMPLETION

---

### TC-CST-017 — Primary applicant details are auto-filled after payment

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-017 |
| **Type** | POSITIVE |
| **Pre-conditions** | Payment completed. User on KYC / Add Applicants page. |

| # | Step | Expected |
|---|------|----------|
| 1 | On payment success page click **Verify Details** for Mamta Solanki | Applicant form opens |
| 2 | Verify all fields pre-filled: Name · Mobile · Email · Full Address · Pincode | All fields auto-filled |
| 3 | Verify Relationship = Self | Relationship correct |

**Status:** ⏳ Planned

---

### TC-CST-018 — Add a valid co-applicant (blood relative) with all mandatory documents

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-018 |
| **Type** | POSITIVE |
| **Pre-conditions** | On Add Applicants page. Fewer than 4 applicants added. |
| **Test Data** | First Name: Test · Last Name: Applicant · Mobile: any 10-digit · Email: test@email.com · Address: any · Pincode: 400066 · Relationship: Father · PAN: ABCDE1234F · Aadhaar: 1234 5678 9012 |

| # | Step | Expected |
|---|------|----------|
| 1 | Click **+ Add Applicant** button | Applicant form opens |
| 2 | Fill First Name = Test · Last Name = Applicant | Names entered |
| 3 | Fill Mobile = any valid 10-digit number | Mobile entered |
| 4 | Fill Email = test@email.com | Email entered |
| 5 | Fill Full Current Address | Address entered |
| 6 | Fill Pincode = 400066 | Pincode entered |
| 7 | Select Relationship = Father (must be blood relative) | Relationship selected |
| 8 | Upload Photo (any image file) | Photo uploaded |
| 9 | Enter PAN Number = ABCDE1234F → Upload PAN Card image | PAN uploaded |
| 10 | Enter Aadhaar Number = 1234 5678 9012 → Upload Aadhaar Front image | Aadhaar Front uploaded |
| 11 | Upload Aadhaar Back image | Aadhaar Back uploaded |
| 12 | Click **Submit** button | Toast: *Applicant details saved successfully* |
| 13 | Verify co-applicant listed with Relationship = Father | Applicant listed |
| 14 | Verify Edit Details and Delete icons visible | Icons present |

**Status:** ⏳ Planned

---

### TC-CST-019 — System enforces maximum 4 applicants limit (Negative Test)

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-019 |
| **Type** | NEGATIVE |
| **Pre-conditions** | 3 co-applicants added — total of 4 including primary applicant. |

| # | Step | Expected |
|---|------|----------|
| 1 | Add 3 co-applicants to reach total of 4 applicants | 4 applicants listed |
| 2 | Attempt to click **+ Add Applicant** button again | Button is disabled or hidden |
| 3 | Verify label *Max. 4 Applicants allowed* is shown | Label visible |

**Status:** ⏳ Planned

---

### TC-CST-020 — Submit applicant form without uploading documents shows validation errors (Negative Test)

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-020 |
| **Type** | NEGATIVE |
| **Pre-conditions** | Add Applicant form is open. |

| # | Step | Expected |
|---|------|----------|
| 1 | Fill all text fields correctly (Name · Mobile · Email · Address · Pincode · Relationship) | All text fields filled |
| 2 | Skip all document uploads — do NOT upload Photo · PAN · Aadhaar Front · Aadhaar Back | Documents skipped |
| 3 | Click **Submit** button | Validation errors shown for each missing document upload |
| 4 | Verify form is NOT submitted without required documents | Submission blocked |

**Status:** ⏳ Planned

---

### TC-CST-021 — Confirm applicants loads the KYC Summary page

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-021 |
| **Type** | POSITIVE |
| **Pre-conditions** | All applicants have been filled and saved. |

| # | Step | Expected |
|---|------|----------|
| 1 | Verify all applicants listed correctly with details | Applicants listed |
| 2 | Click **Confirm >** button | KYC Summary page loads |
| 3 | Verify Summary shows: Registration Details \| Booking Number \| Selected Unit \| Applicant count | Summary complete |
| 4 | Verify T&C checkbox present (unchecked) | Checkbox visible and unchecked |
| 5 | Verify Back button available | Back button present |

**Status:** ⏳ Planned

---

### TC-CST-022 — Accept T&C on Summary and submit KYC successfully

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-022 |
| **Type** | POSITIVE |
| **Pre-conditions** | User is on KYC Summary page. |

| # | Step | Expected |
|---|------|----------|
| 1 | Tick the T&C checkbox on the Summary page | Checkbox ticked |
| 2 | Click **Confirm >** button | KYC submitted successfully page shown |
| 3 | Verify table displays: Registration No \| KYC Number \| Unit \| No. of Applicants | Table shown |
| 4 | Verify Process Status = **KYC Completed** | Status correct |
| 5 | Verify *Download your Unit Details* link visible | Link present |
| 6 | Verify *Go to Home* button visible | Button present |

**Status:** ⏳ Planned

---

### TC-CST-023 — Download Digital Booking Form after KYC submission

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-023 |
| **Type** | POSITIVE |
| **Pre-conditions** | KYC has been submitted. User on KYC success screen or Home dashboard. |

| # | Step | Expected |
|---|------|----------|
| 1 | Click *Download your Unit Details* link on KYC success screen (or from Home dashboard Process Status column) | Digital Booking Form opens in browser print preview |
| 2 | Verify form shows: Registration No · Transaction IDs · Unit Number · Tower Name | All fields shown |
| 3 | Verify all applicant details: Name · Mobile · Email · Address · Relationship · PAN · Aadhaar | Applicant details shown |
| 4 | Verify form can be printed or saved as PDF | Print/PDF option available |

**Status:** ⏳ Planned

---

## PHASE 6 — HOME DASHBOARD: BOOKED STATUS AND COMPLETE KYC ALERT

---

### TC-CST-024 — Home dashboard shows Booked status with Complete KYC alert for 063-A

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-024 |
| **Type** | POSITIVE |
| **Pre-conditions** | Unit payment completed. KYC may or may not be done yet. |

| # | Step | Expected |
|---|------|----------|
| 1 | Go to Home dashboard | Dashboard loads |
| 2 | Find GHNG-1000000063-A in the Details table | Row found |
| 3 | Check Status column | Status = **Booked** (green badge with checkmark) |
| 4 | Check Allotted Unit column | *3502-Crest \| 1 Bed Growth Home \| 323 sq.ft.* |
| 5 | Check Process Status column | Red/orange **Complete KYC** button with alert icon |
| 6 | Verify warning text below button: *Required to complete the allotment!* | Warning shown |
| 7 | Check Payment Schedule column | **Pay >** button visible |

**Status:** ⏳ Planned

---

## PHASE 7 — MILESTONE PAYMENTS

---

### TC-CST-025 — Payment Schedule page shows all milestones with correct statuses

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-025 |
| **Type** | POSITIVE |
| **Pre-conditions** | Allocation payment completed. User on Home dashboard. |

| # | Step | Expected |
|---|------|----------|
| 1 | Find GHNG-1000000063-A with Status = Booked on Home | Row found |
| 2 | Click **Pay >** button in Payment Schedule column | Payment Schedule page loads |
| 3 | Verify all columns visible: MILESTONE \| % DUE \| GST \| AMOUNT \| TOTAL AMOUNT \| TOTAL OUTSTANDING \| PAYMENT STATUS \| PAY \| TRANSACTION DETAILS | All columns present |
| 4 | Verify Online Registration → Status = **Paid** · Transaction Details = View link | Paid milestone shown |
| 5 | Verify Unit Allocation → Status = **Paid** · Transaction Details = View link | Paid milestone shown |
| 6 | Verify all remaining milestones → Status = **Pending** · Pay > button visible | Pending milestones shown |

**Status:** ⏳ Planned

---

### TC-CST-026 — View Transaction Details for a paid milestone shows correct breakdown

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-026 |
| **Type** | POSITIVE |
| **Pre-conditions** | On Payment Schedule page. At least one milestone shows Paid status. |

| # | Step | Expected |
|---|------|----------|
| 1 | Find *Unit Allocation* milestone with Status = Paid | Row found |
| 2 | Click **View** link in Transaction Details column | Transaction Details side panel opens |
| 3 | Verify panel shows: Principal Amount \| GST \| Total Amount | Amounts shown |
| 4 | Verify Outstanding Amount to Pay = Rs. 0 | Zero outstanding |
| 5 | Verify Payment Breakdown table: Transaction ID \| Type \| Amount Paid \| Mode \| Status = Paid | Table shown |

**Status:** ⏳ Planned

---

### TC-CST-027 — Pay a pending milestone using Full Payment option

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-027 |
| **Type** | POSITIVE |
| **Pre-conditions** | A pending milestone exists on Payment Schedule page. |
| **Test Data** | Milestone: Home Confirmation Fees · Principal: Rs. 2,95,929 · GST: Rs. 3,229 · Outstanding: Rs. 2,99,158 |

| # | Step | Expected |
|---|------|----------|
| 1 | Click **Pay >** for the *Home Confirmation Fees* milestone | PAY popup opens |
| 2 | Verify amounts: Principal = Rs. 2,95,929 \| GST = Rs. 3,229 \| Outstanding = Rs. 2,99,158 | Amounts correct |
| 3 | Check if due date warning shown in red at top of popup | Warning shown (if applicable) |
| 4 | Select **Full Payment** radio button | Radio selected |
| 5 | Select Payment Mode = Online | Mode selected |
| 6 | Click **Pay >** button → Complete payment on Easebuzz gateway | Gateway opens |
| 7 | Verify milestone status changes from Pending → **Paid** | Status updated |
| 8 | Verify View link appears in Transaction Details column | View link present |

**Status:** ⏳ Planned

---

### TC-CST-028 — Pay a pending milestone using Partial Payment option

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-028 |
| **Type** | POSITIVE |
| **Pre-conditions** | A pending milestone exists on Payment Schedule page. |

| # | Step | Expected |
|---|------|----------|
| 1 | Click **Pay >** for any pending milestone | PAY popup opens |
| 2 | Select **Partial Payment** radio button | Partial Payment selected |
| 3 | Enter a partial amount less than the total outstanding | Amount entered |
| 4 | Select Payment Mode = Online | Mode selected |
| 5 | Click **Pay >** button | Partial payment processed |
| 6 | Verify Total Outstanding reduces by the partial amount paid | Outstanding reduced |
| 7 | Verify milestone status may remain Pending until fully paid | Status may remain Pending |

**Status:** ⏳ Planned

---

## PHASE 8 — STOP CAMPAIGN AND VERIFY POST-STOP BEHAVIOUR

---

### TC-ADM-007 — Manually stop an Active campaign using Stop confirmation popup

| Field | Value |
|-------|-------|
| **TC ID** | TC-ADM-007 |
| **Type** | POSITIVE |
| **Pre-conditions** | Campaign is still Active and End Time has NOT been reached. Admin logged in. NOTE: If campaign already ended, Status = Completed — skip this TC and proceed to TC-ADM-008. |

| # | Step | Expected |
|---|------|----------|
| 1 | Open `https://uat-web.xrportal.in/admin/allocation` | Admin page loads |
| 2 | Set Project = Xanadu Test Project \| Status = Active \| Click Refresh | Active campaign visible |
| 3 | Find the running campaign | Campaign row found |
| 4 | Click **Stop** button in Actions column | Stop confirmation popup appears |
| 5 | Verify popup title = *Stop Allocation Now?* | Title correct |
| 6 | Verify popup message = *Campaign will move to Stopped.* | Message correct |
| 7 | Verify two buttons: Close and **Yes, Stop Now** | Both buttons present |
| 8 | Click **Yes, Stop Now** (red button) | Popup closes |
| 9 | Click Refresh and verify Status column | Status = **Stopped** · Actions = View only (Stop gone) |

> **Important:** Stopped and Completed are different statuses.

**Status:** ⏳ Planned

---

### TC-CST-029 — After campaign is stopped, Home shows Waitlisted for previously Available registrations

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-029 |
| **Type** | POSITIVE |
| **Pre-conditions** | Campaign has been Stopped or Completed. Customer is logged in. |

| # | Step | Expected |
|---|------|----------|
| 1 | Go to Customer portal Home dashboard | Dashboard loads |
| 2 | Observe the Details table and check status of each registration | — |
| 3 | Verify GHNG-1000000063-A | Status = **Booked** (unchanged — already booked and paid) |
| 4 | Verify GHNG-1000000063-B | Status = **Waitlisted** (dark badge) |
| 5 | Verify GHNG-1000000063-F | Status = **Waitlisted** (dark badge) |
| 6 | Verify GHNG-1000000063-G | Status = **Waitlisted** (dark badge) |
| 7 | Verify *Proceed to Confirm* button NOT visible for any Waitlisted row | Button absent |
| 8 | Verify no registration shows Available status | No Available status |

**Status:** ⏳ Planned

---

### TC-CST-030 — Allotment page shows "Allocation window is closed for now" after campaign ends

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-030 |
| **Type** | POSITIVE — KEY VERIFICATION CHECK |
| **Pre-conditions** | Campaign Stopped or Completed. |

| # | Step | Expected |
|---|------|----------|
| 1 | Click **Allotment** in left navigation menu | Allotment page loads |
| 2 | Observe left panel showing all registrations with status badges | Registrations listed |
| 3 | Verify left panel: GHNG-1000000063-A = **Booked** (green badge) | Booked shown |
| 4 | Verify left panel: GHNG-1000000063-B, F, G = **Waitlisted** (dark badge) | Waitlisted shown |
| 5 | Observe center panel | RED text: *Allocation window is closed for now.* |
| 6 | Verify **Select Unit** button is NOT visible anywhere | No Select Unit button |
| 7 | Verify **Book Now** button is NOT visible for Waitlisted registrations | No Book Now |
| 8 | Verify right panel shows Floor & Unit Plan \| Cost Sheet \| Payment Schedule \| Pay Now buttons (visible but inactive) | Buttons visible but inactive |

**Status:** ⏳ Planned

---

## PHASE 9 — AUTO-COMPLETED CAMPAIGN VERIFICATION

---

### TC-ADM-008 — Verify campaign auto-completes with Completed status after End Time passes

| Field | Value |
|-------|-------|
| **TC ID** | TC-ADM-008 |
| **Type** | POSITIVE |
| **Pre-conditions** | Campaign End Time has passed naturally without manual stop. |

| # | Step | Expected |
|---|------|----------|
| 1 | Wait for the campaign End Time to pass on its own | — |
| 2 | In admin: set Status filter = Completed · Click Refresh | — |
| 3 | Find the campaign in the list | Campaign found |
| 4 | Verify Status = **Completed** (note: this is NOT the same as Stopped) | Completed status shown |
| 5 | Verify Actions column = View only · No Stop or Cancel button | View only |

> **Note:** Completed = auto-ended by system. Stopped = manually stopped by admin. Both result in the same closed state on customer portal.

**Status:** ⏳ Planned

---

### TC-CST-031 — After auto-completed campaign, customer portal shows same closed state as after manual stop

| Field | Value |
|-------|-------|
| **TC ID** | TC-CST-031 |
| **Type** | POSITIVE |
| **Pre-conditions** | Campaign status = Completed (auto-ended). Customer is logged in. |

| # | Step | Expected |
|---|------|----------|
| 1 | Login to customer portal | Home dashboard loads |
| 2 | Check Home dashboard registration statuses | Booked (063-A) unchanged · All others Waitlisted |
| 3 | Click **Allotment** in left navigation menu | Allotment page loads |
| 4 | Verify center panel message | RED text: *Allocation window is closed for now.* |
| 5 | Verify Select Unit button is NOT visible | No Select Unit |

> **Confirms:** Whether campaign is Stopped (manual) or Completed (auto), customer sees the exact same closed state.

**Status:** ⏳ Planned

---

## PHASE 10 — FINAL FILTER AND LIST VALIDATION (Admin Portal)

---

### TC-ADM-009 — All campaign list filter combinations work correctly with pagination

| Field | Value |
|-------|-------|
| **TC ID** | TC-ADM-009 |
| **Type** | POSITIVE |
| **Pre-conditions** | Multiple campaigns with different statuses exist in Xanadu Test Project. |

| # | Step | Expected |
|---|------|----------|
| 1 | Set Project=Xanadu Test Project · Status=Completed · Type=Static → Refresh | Only Completed Static campaigns shown |
| 2 | Set Status=Stopped → Refresh | Only Stopped campaigns shown |
| 3 | Set Status=All Status → Refresh | All campaigns shown |
| 4 | Type partial campaign name in Search box | Matching campaigns filtered |
| 5 | Check *Total X campaigns* count label at bottom right of list | Count displayed |
| 6 | Check *10 / page* page size selector at bottom right | Page size selector visible |
| 7 | Verify status filter works correctly for all 7 status values | All 7 statuses filterable |

**Status:** ⏳ Planned

---

### TC-ADM-010 — View campaign details shows all campaign information correctly

| Field | Value |
|-------|-------|
| **TC ID** | TC-ADM-010 |
| **Type** | POSITIVE |
| **Pre-conditions** | At least one campaign exists in any status. |

| # | Step | Expected |
|---|------|----------|
| 1 | In campaign list click **View** for any campaign | Campaign detail view opens |
| 2 | Verify all details displayed: Campaign Name \| Allocation Type \| Start Time \| End Time \| Status \| Description / Notes | All fields shown correctly |

**Status:** ⏳ Planned
