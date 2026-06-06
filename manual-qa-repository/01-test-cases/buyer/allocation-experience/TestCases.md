# Test Cases — Buyer Portal / Allocation Experience

**Module:** Allocation Experience
**Portal:** Buyer
**URL:** `https://uat.xrportal.in/alloted`
**Generated:** 2026-06-03
**Last Updated:** 2026-06-04 (manual screenshots added — Book Now state + Booked/Complete KYC state)
**Visual Memory:** `visual-memory/buyer/allocation-experience/INDEX.md` (CAPTURE_STATUS: FULL)
**BRD/FRD Sources:**
- `.claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md` (Section 5: Allocation Experience — STATIC Flow; Section 4: Key Business Rules; Section 7: Real-Time Behaviour)
- `.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Allocation-Experience.md`
- `.claude/docs/hoabl-knowledge-base/Buyer-Portal/Workflows/BUYER-WF-Allocation.md`
- `.claude/docs/hoabl-knowledge-base/_Shared/Business-Flows/SHARED-BF-Allocation-Campaign-Lifecycle.md`

**Dual-Source Gate:** PASS (visual FULL + BRD/FRD present)
**Authoring Skill:** manual-tester (invoked by BA Agent)
**Status:** Conditional (QA test-case-reviewer pass 2026-06-06 — 32 Approved + 8 Conditional; see review-report.md)

---

## Coverage Map

| Scenario | TC IDs | Visual Evidence |
|----------|--------|-----------------|
| Allotment page landing — heading + congratulations text | TC_ALLOC_UI_001, TC_ALLOC_UI_002 | allocation-experience-loaded.png |
| Confirmation-window countdown timer (display, format, decrement) | TC_ALLOC_UI_003, TC_ALLOC_FUNC_004, TC_ALLOC_EDGE_005 | allocation-experience-loaded.png |
| Registration sidebar — badge states (Book Now / Booked / Waitlisted) | TC_ALLOC_UI_006, TC_ALLOC_UI_007, TC_ALLOC_UI_008 | allocation-select-unit.png, allocation-booked-complete-kyc.png, allocation-experience-full.png |
| Center panel — "Book Now" state (Select Unit button) | TC_ALLOC_UI_009, TC_ALLOC_FUNC_010, TC_ALLOC_UI_011 | allocation-select-unit.png |
| Right panel — greyed when no unit selected | TC_ALLOC_UI_012, TC_ALLOC_NEG_013 | allocation-select-unit.png |
| Select Unit click → unit selection grid | TC_ALLOC_FUNC_014, TC_ALLOC_E2E_015 | allocation-select-unit.png + STUB for downstream grid |
| Center panel — Booked + Paid + Complete KYC state | TC_ALLOC_UI_016, TC_ALLOC_UI_017, TC_ALLOC_UI_018 | allocation-booked-complete-kyc.png |
| Complete KYC red CTA → /kyc?unitId=... navigation | TC_ALLOC_FUNC_019, TC_ALLOC_FUNC_020 | allocation-booked-complete-kyc.png |
| Right panel — active when registration is Booked | TC_ALLOC_UI_021, TC_ALLOC_FUNC_022 | allocation-booked-complete-kyc.png |
| Floor & Unit Plan link → architectural plan view | TC_ALLOC_FUNC_023 | allocation-booked-complete-kyc.png |
| Cost Sheet link → itemised pricing view | TC_ALLOC_FUNC_024 | allocation-booked-complete-kyc.png |
| Payment Schedule link → milestone list view | TC_ALLOC_FUNC_025 | allocation-booked-complete-kyc.png |
| Pay Now link — active vs greyed | TC_ALLOC_FUNC_026, TC_ALLOC_VAL_027 | allocation-select-unit.png, allocation-booked-complete-kyc.png |
| Booked + KYC Completed state (no Complete KYC button) | TC_ALLOC_UI_028 | allocation-experience-full.png + structural notes |
| Waitlisted registration badge | TC_ALLOC_UI_029 | allocation-experience-full.png |
| Multi-registration card scoping | TC_ALLOC_FUNC_030, TC_ALLOC_FUNC_031 | allocation-experience-full.png |
| Countdown expiry → window closed | TC_ALLOC_BIZ_032, TC_ALLOC_WF_033 | [STUB-EVIDENCE — post-expiry not captured] |
| Unit selection grid + T&C + Pay (downstream of Select Unit) | TC_ALLOC_E2E_034, TC_ALLOC_VAL_035 | [STUB-EVIDENCE — unit grid + T&C not captured] |
| Pre-event waiting / DYNAMIC auto-assignment | TC_ALLOC_BIZ_036, TC_ALLOC_WF_037 | [STUB-EVIDENCE — pre-event / DYNAMIC not captured] |
| Authentication redirect | TC_ALLOC_NEG_038 | allocation-experience-loaded.png |
| Logout from Allotment page | TC_ALLOC_FUNC_039 | allocation-experience-loaded.png |
| Sidebar navigation | TC_ALLOC_UI_040 | allocation-experience-loaded.png |

---

## VISUAL_GAP Flags

The following BRD/FRD-driven journeys still lack live screenshots and are marked `[STUB-EVIDENCE]`:

1. **Unit Selection grid** (post-`Select Unit` click) — left tower list, floor-by-floor grid, white/green/orange/red unit colour codes, right unit-detail panel — BRD §5 steps 5-8.
2. **Add → T&C → Pay flow** — T&C checkbox + Pay button enable/disable toggle — BRD §4 rule 4 + §5 steps 10-12.
3. **Easebuzz gateway entry** — gateway page with 15-min timer — BRD §5 step 13 (out of portal automation scope; ENV skip guard applies).
4. **Payment Successful screen** — green checkmark + unit + applicant details — BRD §5 step 14.
5. **Post-Campaign "Allocation window is closed for now." state** — BRD §5 step 16.
6. **Pre-event / WAITLIST waiting screen** — WaitingForUnit, AllocationEndTimer, NextChanceTime components.
7. **DYNAMIC OpenAllottedUnit component** — auto-assigned unit display.
8. **Real-time WebSocket transitions** — unit_sold, reallocation_notification live updates — BRD §7.

→ Tech Lead Agent should extend `visual-capture` for these states before STUB TCs are released to automation.

---

## Sheet 1 — Manual Test Cases

### TC_ALLOC_UI_001 — Allotment page heading renders on authenticated load

| Field | Value |
|-------|-------|
| BRD/FRD Req | BUYER-BRD §3 (URL `/alloted`); INDEX.md "Page Heading" |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify the Allotment route loads with the documented heading for an authenticated buyer |
| Preconditions | Buyer logged in with valid session (`automation-repository/fixtures/.auth/buyer.json`); ACTIVE STATIC campaign |
| Steps | 1. Navigate to `https://uat.xrportal.in/alloted`<br>2. Wait for network idle<br>3. Inspect the page `h2` element |
| Expected Result | `h2` contains text "Allotment"; page renders without redirect to `/` |
| Visual Evidence | allocation-experience-loaded.png |
| Test Data | Mobile 8888888888 / OTP 258369 |
| Priority | High |
| Status | Approved |

### TC_ALLOC_UI_002 — Personalised congratulations heading shows firstName

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Page Heading"; BUYER-BRD §1 (centrepiece is allocation event) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify the personalised congratulations line renders with the buyer's firstName |
| Preconditions | Authenticated buyer with firstName populated (test account: ishaaaaan karnik) |
| Steps | 1. Navigate to `/alloted`<br>2. Read the text node containing "Congratulations"<br>3. Capture full string |
| Expected Result | Text matches pattern `Congratulations [firstName]! You're Eligible to Select Your Growth Home!` — example: "Congratulations ishaaaaan! You're Eligible to Select Your Growth Home!" |
| Visual Evidence | allocation-experience-loaded.png |
| Test Data | Test buyer profile with firstName set |
| Priority | High |
| Status | Approved |

### TC_ALLOC_UI_003 — Confirmation-window countdown timer text format

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Allotment Countdown Timer"; BUYER-BRD §5 (live campaign window) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify the countdown timer is visible top-right and rendered in the documented format |
| Preconditions | Buyer on `/alloted`; ACTIVE campaign with > 1 day remaining |
| Steps | 1. Navigate to `/alloted`<br>2. Locate text "Confirmation window will close in"<br>3. Capture full timer string |
| Expected Result | Text matches `Confirmation window will close in Nd :Xh :Ym :Zs` (example "4d :7h :11m :28s"); units order is d/h/m/s |
| Visual Evidence | allocation-experience-loaded.png |
| Test Data | Active campaign with > 1d remaining |
| Priority | High |
| Status | Approved |

### TC_ALLOC_FUNC_004 — Countdown timer decrements in real time

| Field | Value |
|-------|-------|
| BRD/FRD Req | BUYER-BRD §7 (WebSocket real-time behaviour); INDEX.md countdown timer |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | FUNC |
| Scenario | Verify the countdown timer decrements seconds in real time without page refresh |
| Preconditions | Buyer on `/alloted`; ACTIVE campaign |
| Steps | 1. Navigate to `/alloted`<br>2. Capture timer string T0<br>3. Wait 10 seconds (no refresh)<br>4. Capture timer string T1 |
| Expected Result | T1 seconds component is at least 5 seconds less than T0; timer continues client-side ticking |
| Visual Evidence | allocation-experience-loaded.png |
| Test Data | Same as TC_ALLOC_UI_003 |
| Priority | Medium |
| Status | Approved |

### TC_ALLOC_EDGE_005 — Countdown timer when < 1 day remaining

| Field | Value |
|-------|-------|
| BRD/FRD Req | BUYER-BRD §5 step 16 (campaign end boundary) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | EDGE |
| Scenario | Verify timer renders correctly when day component is 0 |
| Preconditions | ACTIVE campaign with end time < 24 hours away |
| Steps | 1. Navigate to `/alloted`<br>2. Read timer text |
| Expected Result | Timer renders without crash; shows `0d :Xh :Ym :Zs` OR collapses to `Xh :Ym :Zs`; exact rendering to be confirmed against live behaviour |
| Visual Evidence | [STUB-EVIDENCE — < 24h state not captured] |
| Test Data | Campaign window ending within 24h |
| Priority | Medium |
| Status | Conditional |

### TC_ALLOC_UI_006 — Registration sidebar shows all buyer registrations with badges

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Registration Sidebar (left panel)"; BUYER-BRD §5 step 2 (registrations table) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify the left sidebar lists every registration the buyer owns, each as a pill/card with a status badge |
| Preconditions | Authenticated buyer with multiple registrations (test account has -A, -C, -D, -E, -F, -G, -H, -I, -J, -K) |
| Steps | 1. Navigate to `/alloted`<br>2. Inspect the left registration list<br>3. Count entries and read each badge label |
| Expected Result | Sidebar shows one entry per registration; each entry carries a badge that reads one of: "Book Now" / "Booked" / "Waitlisted" |
| Visual Evidence | allocation-select-unit.png, allocation-booked-complete-kyc.png, allocation-experience-full.png |
| Test Data | Multi-registration test buyer |
| Priority | High |
| Status | Approved |

### TC_ALLOC_UI_007 — "Book Now" badge is a green pill on Available registrations

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md badge states: `"Book Now" — green pill`; BUYER-BRD §5 step 3 |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify the "Book Now" badge renders as a green pill on registrations eligible to select a unit |
| Preconditions | Buyer with ≥1 Available registration; ACTIVE campaign |
| Steps | 1. Navigate to `/alloted`<br>2. Locate a registration carrying the "Book Now" badge (e.g., GHNG-...-K)<br>3. Capture badge text and colour |
| Expected Result | Badge text reads exactly "Book Now"; background colour is green (per INDEX.md visual evidence) |
| Visual Evidence | allocation-select-unit.png |
| Test Data | Test buyer registration -K |
| Priority | High |
| Status | Approved |

### TC_ALLOC_UI_008 — "Booked" badge is a green check pill on booked registrations

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md badge states: `"Booked" — green check pill`; BUYER-BRD §5 step 15 (Status = Booked after payment) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify the "Booked" badge renders as a green pill with checkmark on registrations where a unit has been paid for |
| Preconditions | Buyer with ≥1 Booked registration (test account: -C, -D, -E, -F, -G, -H, -I, -J) |
| Steps | 1. Navigate to `/alloted`<br>2. Locate a registration carrying the "Booked" badge<br>3. Capture badge text and check icon |
| Expected Result | Badge text reads "Booked"; pill carries a checkmark; background colour is green |
| Visual Evidence | allocation-booked-complete-kyc.png |
| Test Data | Test buyer registration -J |
| Priority | High |
| Status | Approved |

### TC_ALLOC_UI_009 — "Book Now" registration → center panel shows Registration No. + Select Unit button

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Center Panel — Unit Available State"; BUYER-BRD §5 step 4 |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify selecting a "Book Now" registration loads the center panel with the registration number line and a green "Select Unit >" CTA |
| Preconditions | Buyer on `/alloted`; clicks/selects a "Book Now" registration in left sidebar |
| Steps | 1. Navigate to `/alloted`<br>2. Click the "Book Now" registration pill (e.g., GHNG-1000008364-K)<br>3. Read center-panel contents |
| Expected Result | Center panel shows: line `Registration No.: GHNG-1000008364-K`; green button labelled `Select Unit >` |
| Visual Evidence | allocation-select-unit.png |
| Test Data | Registration -K (Book Now) |
| Priority | High |
| Status | Approved |

### TC_ALLOC_FUNC_010 — Select Unit button is enabled and clickable

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md key selector `button filter({ hasText: /select unit/i })`; BUYER-BRD §5 step 4 |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | FUNC |
| Scenario | Verify the "Select Unit" button is enabled, displays correct text and responds to click |
| Preconditions | Buyer on `/alloted`; "Book Now" registration is the active center panel |
| Steps | 1. Locate button by `hasText: /select unit/i`<br>2. Assert enabled state<br>3. Click button<br>4. Observe navigation/UI response |
| Expected Result | Button is enabled; text matches "Select Unit"; click loads the unit selection grid per BRD §5 step 5 (tower list appears) |
| Visual Evidence | allocation-select-unit.png |
| Test Data | Test buyer with -K registration |
| Priority | High |
| Status | Approved |

### TC_ALLOC_UI_011 — Registration No. label format on Book Now center panel

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Center Panel — Unit Available State" line `text: "Registration No.: GHNG-1000008364-K"` |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify the Registration No. line uses the exact label format including colon |
| Preconditions | Buyer on `/alloted` with Book Now registration selected |
| Steps | 1. Read the Registration No. text node in the center panel |
| Expected Result | Text matches pattern `Registration No.: GHNG-[N]-[suffix]` (colon and space delimiter); registration ID is non-empty |
| Visual Evidence | allocation-select-unit.png |
| Test Data | Any Book Now registration |
| Priority | Medium |
| Status | Approved |

### TC_ALLOC_UI_012 — Right panel links rendered when Book Now state is active

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Right panel (greyed out, not yet selectable)" |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify the four right-panel links render when a "Book Now" registration is shown |
| Preconditions | Buyer on `/alloted` with Book Now registration center-panel active |
| Steps | 1. Navigate to `/alloted` with Book Now registration<br>2. Inspect right panel<br>3. Locate links: Floor & Unit Plan, Cost Sheet, Payment Schedule, Pay Now |
| Expected Result | All four links present with exact text "Floor & Unit Plan", "Cost Sheet", "Payment Schedule", "Pay Now" |
| Visual Evidence | allocation-select-unit.png |
| Test Data | Book Now registration |
| Priority | High |
| Status | Approved |

### TC_ALLOC_NEG_013 — Right panel links are greyed/disabled when no unit selected

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Right panel (greyed out, not yet selectable)"; BUYER-BRD §5 step 9 (Add precedes Pay) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | NEG |
| Scenario | Verify right-panel links are visually greyed and not actionable for a registration where no unit has been selected yet |
| Preconditions | Buyer on `/alloted` with Book Now registration (no unit held/booked) |
| Steps | 1. Navigate to `/alloted` and activate Book Now registration<br>2. Inspect right panel link styling (opacity / disabled attribute / pointer-events)<br>3. Attempt to click "Pay Now"<br>4. Observe result |
| Expected Result | Links carry greyed visual state; click does not initiate any action (Pay Now in particular does NOT open payment context) |
| Visual Evidence | allocation-select-unit.png |
| Test Data | Book Now registration with no held unit |
| Priority | High |
| Status | Approved |

### TC_ALLOC_FUNC_014 — Select Unit click navigates to unit selection grid

| Field | Value |
|-------|-------|
| BRD/FRD Req | BUYER-BRD §5 steps 5-7 (tower list → floor grid → unit) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | FUNC |
| Scenario | Verify clicking Select Unit transitions the buyer into the tower / unit selection UI |
| Preconditions | Buyer on `/alloted`; Book Now registration active |
| Steps | 1. Click "Select Unit >"<br>2. Observe the screen that loads<br>3. Verify left panel shows towers (Crest, Crown, Blossom, Pinnacle, Bright per BRD §5.5)<br>4. Verify center panel shows floor-by-floor grid layout |
| Expected Result | Unit selection screen renders per BRD §5 steps 5-6: tower list left, floor grid center, unit detail panel right |
| Visual Evidence | allocation-select-unit.png (entry state) + [STUB-EVIDENCE — tower/grid view not yet captured] |
| Test Data | ACTIVE STATIC campaign with available units |
| Priority | High |
| Status | Approved |

### TC_ALLOC_E2E_015 — Select Unit → tower → unit → Add returns to Allotment with selected unit

| Field | Value |
|-------|-------|
| BRD/FRD Req | BUYER-BRD §5 steps 4-9 |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | E2E |
| Scenario | End-to-end selection of a unit and return to Allotment page with the selection persisted |
| Preconditions | Buyer with Book Now registration; ACTIVE STATIC campaign with white (Available) units |
| Steps | 1. Click "Select Unit >"<br>2. Click a tower in left panel<br>3. Click a white (Available) unit in center grid<br>4. Verify unit turns green<br>5. Verify right panel populates with Unit No, BHK type, carpet size, agreement value, discounts, total price<br>6. Click "Add"<br>7. Verify return to Allotment page<br>8. Verify selected unit is reflected on that registration card |
| Expected Result | All transitions succeed per BRD §5 steps 5-9; unit hold begins (20-min hold per BRD §4 rule 5); Pay Now becomes the next action |
| Visual Evidence | allocation-select-unit.png (entry) + [STUB-EVIDENCE — grid + right panel + Add not captured] |
| Test Data | ACTIVE STATIC campaign + available units |
| Priority | High |
| Status | Approved |

### TC_ALLOC_UI_016 — Booked + Paid center panel shows green checkmark + "Paid" + "Allotment Process Completed"

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Center Panel — Booked + Payment Completed State"; BUYER-BRD §5 step 14-15 |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify the center panel for a Booked + Paid registration shows the documented success block |
| Preconditions | Buyer with ≥1 Booked registration (payment completed) — test registration -J |
| Steps | 1. Navigate to `/alloted`<br>2. Click a Booked registration in left sidebar (e.g., GHNG-1000008364-J)<br>3. Read center-panel content |
| Expected Result | Center panel shows: green ✓ checkmark; text "Paid"; text "Allotment Process Completed"; line `[unitNumber] - [towerName]` (e.g., "1004 - Pride"); line `Registration No. GHNG-1000008364-J` |
| Visual Evidence | allocation-booked-complete-kyc.png |
| Test Data | Registration -J (Booked, KYC required) |
| Priority | High |
| Status | Approved |

### TC_ALLOC_UI_017 — Booked + KYC-pending center panel shows red "Complete KYC >" button

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Center Panel — Booked + Payment Completed State"; BUYER-BRD §5 step 15 ("Complete KYC" warning); §4 rule 8 (KYC post-WINNER only) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify a Booked registration with KYC not yet done shows a red "Complete KYC >" button |
| Preconditions | Buyer with Booked registration where KYC is not yet completed (test: -J) |
| Steps | 1. Navigate to `/alloted` and select the Booked registration<br>2. Inspect the CTA button below the success block |
| Expected Result | Button is RED; text reads "Complete KYC >"; below the button the helper text reads "Required to complete the allotment!" in red |
| Visual Evidence | allocation-booked-complete-kyc.png |
| Test Data | Booked registration -J |
| Priority | High |
| Status | Approved |

### TC_ALLOC_UI_018 — "Required to complete the allotment!" helper text under Complete KYC button

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md center-panel booked state — `text: "Required to complete the allotment!"` |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify the red helper text appears immediately below the Complete KYC button |
| Preconditions | Buyer on Booked + KYC-pending registration |
| Steps | 1. Locate Complete KYC button<br>2. Read the next text node below it |
| Expected Result | Text reads exactly "Required to complete the allotment!"; text colour is red |
| Visual Evidence | allocation-booked-complete-kyc.png |
| Test Data | Registration -J |
| Priority | Medium |
| Status | Approved |

### TC_ALLOC_FUNC_019 — Complete KYC button is enabled and clickable

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md key selector `button filter({ hasText: /complete kyc/i })`; BUYER-BRD §4 rule 8 |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | FUNC |
| Scenario | Verify the Complete KYC button is enabled and clickable on a Booked + KYC-pending registration |
| Preconditions | Buyer on Booked + KYC-pending registration center panel |
| Steps | 1. Locate button by `hasText: /complete kyc/i`<br>2. Assert button is enabled<br>3. Click button |
| Expected Result | Button is enabled; click triggers navigation (asserted in TC_ALLOC_FUNC_020) |
| Visual Evidence | allocation-booked-complete-kyc.png |
| Test Data | Registration -J |
| Priority | High |
| Status | Approved |

### TC_ALLOC_FUNC_020 — Complete KYC click navigates to /kyc with unitId query param

| Field | Value |
|-------|-------|
| BRD/FRD Req | BUYER-BRD §3 module 4 (`/kyc`); §6 KYC flow; §4 rule 8 (KYC gated on WINNER) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | FUNC |
| Scenario | Verify clicking Complete KYC routes the buyer to the KYC module scoped to the booked unit |
| Preconditions | Buyer on Booked + KYC-pending registration |
| Steps | 1. Capture booked unit number (e.g., 1004 - Pride) and registration ID<br>2. Click "Complete KYC >"<br>3. Observe new URL<br>4. Verify KYC screen loads |
| Expected Result | URL changes to `/kyc?unitId=[unitId]` (or equivalent KYC entry route scoped by unit); KYC start screen renders per BRD §6 step 1 (Primary applicant "Verify Details") |
| Visual Evidence | allocation-booked-complete-kyc.png (entry); KYC module visual memory for destination |
| Test Data | Registration -J with booked unit |
| Priority | High |
| Status | Approved |

### TC_ALLOC_UI_021 — Right panel links rendered for Booked registration

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Right panel (active, clickable when booked)" |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify all four right-panel links render for a Booked registration |
| Preconditions | Buyer on Booked registration center panel |
| Steps | 1. Inspect right panel<br>2. Locate links: Floor & Unit Plan, Cost Sheet, Payment Schedule, Pay Now |
| Expected Result | All four links present, exact text matches |
| Visual Evidence | allocation-booked-complete-kyc.png |
| Test Data | Registration -J |
| Priority | High |
| Status | Approved |

### TC_ALLOC_FUNC_022 — Right panel links are active (not greyed) for Booked registration

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Right panel (active, clickable when booked)" |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | FUNC |
| Scenario | Verify the four right-panel links are clickable and not greyed when a registration is Booked |
| Preconditions | Buyer on Booked registration |
| Steps | 1. Inspect link styling (opacity / disabled / pointer-events)<br>2. Hover over each link<br>3. Verify cursor changes to pointer |
| Expected Result | All four links are visually active (no greyed-out styling); cursor changes to pointer on hover; each is clickable |
| Visual Evidence | allocation-booked-complete-kyc.png |
| Test Data | Registration -J |
| Priority | High |
| Status | Approved |

### TC_ALLOC_FUNC_023 — Floor & Unit Plan link opens architectural plan

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md right-panel link `Floor & Unit Plan >`; BUYER-BRD §3 module 7 (Unit Details `/allotted-units`) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | FUNC |
| Scenario | Verify clicking Floor & Unit Plan displays the architectural floor/unit plan for the booked unit |
| Preconditions | Buyer on Booked registration |
| Steps | 1. Click "Floor & Unit Plan >" in the right panel<br>2. Observe response (modal/route/section) |
| Expected Result | Floor and unit plan view opens showing the architectural plan for the booked unit |
| Visual Evidence | allocation-booked-complete-kyc.png (entry) + [STUB-EVIDENCE — destination view not captured] |
| Test Data | Booked registration -J |
| Priority | Medium |
| Status | Approved |

### TC_ALLOC_FUNC_024 — Cost Sheet link opens itemised pricing breakdown

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md right-panel link `Cost Sheet >`; BUYER-BRD §4 rule 12 (cost sheet frozen at allocation) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | FUNC |
| Scenario | Verify Cost Sheet link displays the itemised pricing breakdown for the booked unit |
| Preconditions | Buyer on Booked registration |
| Steps | 1. Click "Cost Sheet >"<br>2. Observe response |
| Expected Result | Cost sheet view opens showing: agreement value, applicable discounts (incl. HOME_LOAN per BRD §4 rule 11 if applied), total price |
| Visual Evidence | allocation-booked-complete-kyc.png (entry) + [STUB-EVIDENCE — destination view not captured] |
| Test Data | Booked registration with priced unit |
| Priority | Medium |
| Status | Approved |

### TC_ALLOC_FUNC_025 — Payment Schedule link navigates to milestone schedule

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md right-panel link `Payment Schedule >`; BUYER-BRD §3 module 6 (`/paymentschedule`); §6 step 6-7 (schedule after KYC submitted) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | FUNC |
| Scenario | Verify Payment Schedule link navigates to the milestone payment schedule view |
| Preconditions | Buyer on Booked registration; KYC ideally completed (schedule generated post-KYC per BRD §6) |
| Steps | 1. Click "Payment Schedule >"<br>2. Observe navigation/UI response |
| Expected Result | Payment schedule view loads — if KYC submitted, milestone list rendered; otherwise informational message indicating schedule pending KYC |
| Visual Evidence | allocation-booked-complete-kyc.png (entry) + [STUB-EVIDENCE — destination not captured] |
| Test Data | Booked registration |
| Priority | Medium |
| Status | Approved |

### TC_ALLOC_FUNC_026 — Pay Now link opens payment context for booked unit

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md right-panel link `Pay Now >`; BUYER-BRD §5 step 12; §7 WebSocket `pay_now_initiated` |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | FUNC |
| Scenario | Verify Pay Now link opens the payment context for the registration's booked/selected unit |
| Preconditions | Buyer on a registration that has either a selected (held) unit or an outstanding payment milestone |
| Steps | 1. Click "Pay Now >"<br>2. Observe response |
| Expected Result | Payment context opens — T&C checkbox visible (initial: unchecked) and Pay button visible (initial: disabled) per BRD §4 rule 4; WebSocket `pay_now_initiated` is sent (BRD §7); 20-min hold timer begins (BRD §4 rule 5) |
| Visual Evidence | allocation-booked-complete-kyc.png (entry) + [STUB-EVIDENCE — payment context not captured] |
| Test Data | Booked registration with payment due |
| Priority | High |
| Status | Approved |

### TC_ALLOC_VAL_027 — Pay Now is greyed/inactive on Book Now state (no unit yet)

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Right panel (greyed out, not yet selectable)"; BUYER-BRD §5 step 9 (Add precedes Pay) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | VAL |
| Scenario | Verify Pay Now is non-actionable for a Book Now registration that has not selected a unit yet |
| Preconditions | Buyer on Book Now registration center panel; no unit selected |
| Steps | 1. Inspect Pay Now link styling<br>2. Attempt to click |
| Expected Result | Link is greyed (inactive styling); click has no effect; no payment context opens |
| Visual Evidence | allocation-select-unit.png |
| Test Data | Book Now registration with no held unit |
| Priority | High |
| Status | Approved |

### TC_ALLOC_UI_028 — Booked + KYC Completed center panel hides Complete KYC button

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Center Panel — Booked + KYC Completed State" (No "Complete KYC" button — replaced by completion state); BUYER-BRD §6 step 7 (KYC Submitted Successfully) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify the center panel for a Booked + KYC-completed registration shows the completion state without the red Complete KYC button |
| Preconditions | Buyer on a registration where both payment and KYC are complete (test: -C, -D) |
| Steps | 1. Navigate to `/alloted`<br>2. Click registration with KYC completed (e.g., GHNG-1000008364-C, 1201-Glory)<br>3. Inspect center panel |
| Expected Result | Center panel shows green ✓ + "Paid" + "Allotment Process Completed" + unit details; NO red "Complete KYC >" button; NO red helper text; right panel links remain active |
| Visual Evidence | allocation-experience-full.png + INDEX.md structural notes |
| Test Data | Registration -C (1201-Glory, 1 Bed) or -D (1004-Grace, 2 Bed) |
| Priority | High |
| Status | Approved |

### TC_ALLOC_UI_029 — Waitlisted registration shows black "Waitlisted" pill

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md badge states: `"Waitlisted" — black pill`; BUYER-BRD §5 step 16 (Available → Waitlisted on campaign end) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify a Waitlisted registration carries the black "Waitlisted" pill in the sidebar |
| Preconditions | Buyer with ≥1 Waitlisted registration (test: -A) |
| Steps | 1. Navigate to `/alloted`<br>2. Locate registration -A in the sidebar<br>3. Read badge text and colour |
| Expected Result | Badge text reads "Waitlisted"; background colour is black |
| Visual Evidence | allocation-experience-full.png |
| Test Data | Registration -A |
| Priority | High |
| Status | Approved |

### TC_ALLOC_FUNC_030 — Each registration card has its own center-panel context

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md per-card structure; BUYER-BRD §5 step 2 (registrations table per registration) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | FUNC |
| Scenario | Verify clicking different registrations in the sidebar swaps the center panel content without affecting other registrations |
| Preconditions | Buyer with multiple registrations in mixed states (Book Now, Booked, Waitlisted) |
| Steps | 1. Navigate to `/alloted`<br>2. Click "Book Now" registration -K — verify center shows Select Unit state<br>3. Click Booked registration -J — verify center shows Paid + Complete KYC state<br>4. Click Booked + KYC-done registration -C — verify center shows completion state without Complete KYC button<br>5. Click Waitlisted -A — verify center reflects waitlisted state |
| Expected Result | Center panel content is correctly scoped to the active registration; switching does not affect other registrations' state |
| Visual Evidence | allocation-select-unit.png, allocation-booked-complete-kyc.png, allocation-experience-full.png |
| Test Data | Multi-registration test buyer |
| Priority | High |
| Status | Approved |

### TC_ALLOC_FUNC_031 — Right panel links are scoped per active registration

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md per-card structure |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | FUNC |
| Scenario | Verify the four right-panel links target the active registration's unit, not a sibling registration's unit |
| Preconditions | Buyer with ≥2 Booked registrations with different units (test: -C 1201-Glory, -D 1004-Grace) |
| Steps | 1. Activate registration -C<br>2. Click "Floor & Unit Plan >"<br>3. Verify content matches 1201-Glory<br>4. Return to `/alloted`, activate registration -D<br>5. Click "Floor & Unit Plan >"<br>6. Verify content matches 1004-Grace |
| Expected Result | Each registration's right-panel links open content scoped to that registration's unit |
| Visual Evidence | allocation-booked-complete-kyc.png + [STUB-EVIDENCE — destination views not captured] |
| Test Data | Registrations -C and -D |
| Priority | Medium |
| Status | Approved |

### TC_ALLOC_BIZ_032 — Countdown expiry transitions Available → Waitlisted

| Field | Value |
|-------|-------|
| BRD/FRD Req | BUYER-BRD §5 step 16 ("Allocation window is closed for now."); §4 rule 7 (WINNER permanent) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | BIZ |
| Scenario | Verify when the confirmation window reaches 0, Book Now registrations transition to Waitlisted and the Select Unit CTA disappears |
| Preconditions | Buyer on `/alloted` near campaign end; ≥1 Book Now registration; no payment yet |
| Steps | 1. Wait for countdown timer to reach 0 (or admin Stops campaign)<br>2. Observe sidebar and center panel for the previously Book Now registration |
| Expected Result | Previously "Book Now" registration now carries the "Waitlisted" black pill; center panel shows "Allocation window is closed for now." (red text per BRD §5 step 16); no Select Unit button visible; Booked registrations retain their state |
| Visual Evidence | [STUB-EVIDENCE — post-expiry state not captured] |
| Test Data | Test campaign with controlled short end time |
| Priority | High |
| Status | Conditional |

### TC_ALLOC_WF_033 — Page auto-updates via WebSocket on campaign closure (no refresh)

| Field | Value |
|-------|-------|
| BRD/FRD Req | BUYER-BRD §7 (WebSocket real-time behaviour); §5 step 16 |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | WF |
| Scenario | Verify the Allotment page auto-updates without manual refresh when the campaign transitions to Stopped/Completed |
| Preconditions | Buyer on `/alloted` during ACTIVE campaign; admin Stops campaign during test |
| Steps | 1. Open `/alloted` and remain on the page<br>2. (Coordinated) Admin Stops the campaign<br>3. Observe page within 30 seconds without refreshing |
| Expected Result | Page auto-updates to closed state per BRD §7 (WebSocket-driven); no manual refresh required |
| Visual Evidence | [STUB-EVIDENCE — live transition not captured] |
| Test Data | Coordinated admin + buyer test |
| Priority | Medium |
| Status | Conditional |

### TC_ALLOC_E2E_034 — End-to-end STATIC unit selection + T&C + Pay (up to gateway)

| Field | Value |
|-------|-------|
| BRD/FRD Req | BUYER-BRD §5 steps 4-13; §4 rule 4 (T&C before payment); §4 rule 5 (20-min hold); §7 (`pay_now_initiated`) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | E2E |
| Scenario | Full STATIC flow: Allotment → Select Unit → tower → unit → Add → T&C → Pay → Easebuzz gateway entry |
| Preconditions | Buyer with Book Now registration; ACTIVE STATIC campaign; available white units |
| Steps | 1. Navigate to `/alloted`<br>2. Activate Book Now registration<br>3. Click "Select Unit >"<br>4. Click a tower (Crest/Crown/Blossom/Pinnacle/Bright)<br>5. Click an Available (white) unit — verify turns green<br>6. Verify right panel: Unit No, BHK, carpet size, agreement value, discounts, total price<br>7. Click "Add"<br>8. Back on Allotment page, verify unit displayed for that registration<br>9. Verify T&C checkbox visible and unchecked<br>10. Verify Pay button is DISABLED<br>11. Tick T&C checkbox<br>12. Verify Pay button enables<br>13. Click "Confirmation Amount Pay Rs. [amount]"<br>14. Verify redirect to Easebuzz gateway — STOP at gateway entry (ENV skip guard for gateway interactions) |
| Expected Result | Each step succeeds per BRD §5; T&C → Pay enable toggle works (BRD §4 rule 4); 20-min hold begins on `pay_now_initiated`; Easebuzz gateway loads with ~15-min timer (BRD §5 step 13) |
| Visual Evidence | allocation-select-unit.png (entry) + [STUB-EVIDENCE — grid/T&C/Pay/gateway not captured]; `test.skip(process.env.ENV === 'uat', 'Skipped on UAT — live gateway')` from gateway onward |
| Test Data | Mobile 8888888888 / OTP 258369; live ACTIVE STATIC campaign |
| Priority | High |
| Status | Conditional |

### TC_ALLOC_VAL_035 — Pay button DISABLED until T&C checkbox ticked

| Field | Value |
|-------|-------|
| BRD/FRD Req | BUYER-BRD §4 rule 4 (Pay disabled until T&C — confirmed TC-CST-012); §5 steps 10-11 |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | VAL |
| Scenario | Validate Pay button is bound to T&C checkbox state |
| Preconditions | Buyer has selected a unit; T&C checkbox visible |
| Steps | 1. Observe Pay button (T&C unchecked) — verify DISABLED<br>2. Attempt to click Pay — verify no action<br>3. Tick T&C — verify Pay ENABLES<br>4. Un-tick T&C — verify Pay re-DISABLES |
| Expected Result | Pay button enable/disable strictly mirrors T&C checkbox state per BRD §4 rule 4 |
| Visual Evidence | [STUB-EVIDENCE — T&C state not captured] |
| Test Data | Buyer with held unit |
| Priority | High |
| Status | Conditional |

### TC_ALLOC_BIZ_036 — Pre-event WAITLIST: waiting screen shown instead of Select Unit

| Field | Value |
|-------|-------|
| BRD/FRD Req | BUYER-BRD §4 rule 7 (WAITLIST is pre-payment); Feature-Spec - Allocation Experience (Waiting for Allocation) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | BIZ |
| Scenario | Verify a buyer on WAITLIST outside an ACTIVE campaign sees the waiting screen (no Select Unit CTA) |
| Preconditions | Buyer with WAITLIST registration; no ACTIVE campaign |
| Steps | 1. Outside campaign window, navigate to `/alloted`<br>2. Observe page contents |
| Expected Result | Waiting screen rendered ("Allocation hasn't started yet" / countdown to next chance); no "Select Unit" button visible; no unit grid |
| Visual Evidence | [STUB-EVIDENCE — pre-event waiting state not captured] |
| Test Data | WAITLIST registration outside campaign window |
| Priority | Medium |
| Status | Conditional |

### TC_ALLOC_WF_037 — DYNAMIC campaign: auto-assigned unit + Proceed to Pay

| Field | Value |
|-------|-------|
| BRD/FRD Req | Feature-Spec - Allocation Experience (DYNAMIC); BUYER-BRD §7 (`proceed_to_pay`, `reallocation_notification`) |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | WF |
| Scenario | Verify during ACTIVE DYNAMIC campaign the system shows an auto-assigned unit and Proceed to Pay (no tower/grid choice) |
| Preconditions | DYNAMIC campaign ACTIVE; buyer eligible |
| Steps | 1. Navigate to `/alloted`<br>2. Observe page contents |
| Expected Result | OpenAllottedUnit component shows: assigned tower, floor, typology, price, discounts; "Proceed to Pay" button visible; no tower/grid selection UI |
| Visual Evidence | [STUB-EVIDENCE — DYNAMIC state not captured] |
| Test Data | DYNAMIC campaign + eligible buyer |
| Priority | Medium |
| Status | Conditional |

### TC_ALLOC_NEG_038 — Unauthenticated access to /alloted redirects to login

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Requires authentication — unauthenticated access redirects to `/`" |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | NEG |
| Scenario | Verify unauthenticated request to `/alloted` is redirected to login |
| Preconditions | No buyer session (cookies cleared, no storageState) |
| Steps | 1. Clear cookies/storage<br>2. Navigate directly to `https://uat.xrportal.in/alloted`<br>3. Observe URL after navigation |
| Expected Result | Browser redirects to `/` (buyer login); `/alloted` content not rendered |
| Visual Evidence | allocation-experience-loaded.png (used as authenticated contrast reference) |
| Test Data | No auth |
| Priority | High |
| Status | Approved |

### TC_ALLOC_FUNC_039 — Logout from Allotment page terminates session

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Navigation Sidebar" includes Logout |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | FUNC |
| Scenario | Verify Logout button returns user to root and clears session |
| Preconditions | Buyer authenticated on `/alloted` |
| Steps | 1. Navigate to `/alloted`<br>2. Click "Logout" in sidebar<br>3. Observe URL and session state<br>4. Attempt to navigate back to `/alloted` |
| Expected Result | URL redirects to `/`; session cleared; revisiting `/alloted` redirects to login (couples with TC_ALLOC_NEG_038) |
| Visual Evidence | allocation-experience-loaded.png |
| Test Data | Authenticated buyer session |
| Priority | Medium |
| Status | Approved |

### TC_ALLOC_UI_040 — Sidebar navigation present with Allotment active

| Field | Value |
|-------|-------|
| BRD/FRD Req | INDEX.md "Navigation Sidebar"; BUYER-BRD §3 module list |
| Portal | Buyer |
| Module | Allocation Experience |
| Type | UI |
| Scenario | Verify sidebar lists documented modules in order with Allotment active |
| Preconditions | Authenticated buyer on `/alloted` |
| Steps | 1. Navigate to `/alloted`<br>2. Read sidebar entries in order |
| Expected Result | Sidebar contains in order: Home, Registration, Allotment, Homeloan, Project, Work Progress, Logout; Allotment is highlighted as active |
| Visual Evidence | allocation-experience-loaded.png |
| Test Data | Test buyer |
| Priority | Low |
| Status | Approved |

---

## Sheet 2 — Automation Candidates

| TC_ID | Module | Type | Automatable | Complexity | Visual Evidence Status | Playwright Suite | Notes |
|-------|--------|------|-------------|------------|-----------------------|------------------|-------|
| TC_ALLOC_UI_001 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Heading assertion |
| TC_ALLOC_UI_002 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Requires firstName fixture |
| TC_ALLOC_UI_003 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Regex on timer format |
| TC_ALLOC_FUNC_004 | Allocation | FUNC | Yes | Low | FULL | tests/e2e/buyer/allocation-experience.spec.js | 10s wait + delta assertion |
| TC_ALLOC_EDGE_005 | Allocation | EDGE | Conditional | Med | STUB | tests/e2e/buyer/allocation-experience.spec.js | Needs < 24h state capture |
| TC_ALLOC_UI_006 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Sidebar enumeration |
| TC_ALLOC_UI_007 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Book Now pill colour |
| TC_ALLOC_UI_008 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Booked pill colour + check |
| TC_ALLOC_UI_009 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Center panel content on Book Now |
| TC_ALLOC_FUNC_010 | Allocation | FUNC | Yes | Low | FULL | tests/e2e/buyer/allocation-experience.spec.js | `button hasText: /select unit/i` |
| TC_ALLOC_UI_011 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Regex on Registration No. label |
| TC_ALLOC_UI_012 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Four-link presence |
| TC_ALLOC_NEG_013 | Allocation | NEG | Yes | Med | FULL | tests/e2e/buyer/allocation-experience.spec.js | Assert greyed/disabled state |
| TC_ALLOC_FUNC_014 | Allocation | FUNC | Yes | Med | FULL+STUB | tests/e2e/buyer/allocation-experience.spec.js | Entry covered; downstream grid is STUB |
| TC_ALLOC_E2E_015 | Allocation | E2E | Conditional | High | STUB | tests/e2e/buyer/allocation-experience.spec.js | Needs grid + Add capture |
| TC_ALLOC_UI_016 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Paid/Completed text block |
| TC_ALLOC_UI_017 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Red Complete KYC button |
| TC_ALLOC_UI_018 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Helper red text |
| TC_ALLOC_FUNC_019 | Allocation | FUNC | Yes | Low | FULL | tests/e2e/buyer/allocation-experience.spec.js | `button hasText: /complete kyc/i` |
| TC_ALLOC_FUNC_020 | Allocation | FUNC | Yes | Med | FULL | tests/e2e/buyer/allocation-experience.spec.js | Asserts /kyc?unitId= route |
| TC_ALLOC_UI_021 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Booked right-panel links |
| TC_ALLOC_FUNC_022 | Allocation | FUNC | Yes | Low | FULL | tests/e2e/buyer/allocation-experience.spec.js | Active styling assertion |
| TC_ALLOC_FUNC_023 | Allocation | FUNC | Conditional | Med | FULL+STUB | tests/e2e/buyer/allocation-experience.spec.js | Destination view STUB |
| TC_ALLOC_FUNC_024 | Allocation | FUNC | Conditional | Med | FULL+STUB | tests/e2e/buyer/allocation-experience.spec.js | Destination view STUB |
| TC_ALLOC_FUNC_025 | Allocation | FUNC | Conditional | Med | FULL+STUB | tests/e2e/buyer/allocation-experience.spec.js | Destination view STUB |
| TC_ALLOC_FUNC_026 | Allocation | FUNC | Conditional | Med | FULL+STUB | tests/e2e/buyer/allocation-experience.spec.js | Payment context STUB; ENV skip from gateway |
| TC_ALLOC_VAL_027 | Allocation | VAL | Yes | Med | FULL | tests/e2e/buyer/allocation-experience.spec.js | Greyed Pay Now negative test |
| TC_ALLOC_UI_028 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | KYC-done center panel |
| TC_ALLOC_UI_029 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Waitlisted black pill |
| TC_ALLOC_FUNC_030 | Allocation | FUNC | Yes | Med | FULL | tests/e2e/buyer/allocation-experience.spec.js | Multi-state navigation |
| TC_ALLOC_FUNC_031 | Allocation | FUNC | Conditional | Med | FULL+STUB | tests/e2e/buyer/allocation-experience.spec.js | Cross-registration scoping; destination STUB |
| TC_ALLOC_BIZ_032 | Allocation | BIZ | Conditional | High | STUB | tests/regression/buyer/allocation-experience.spec.js | Needs controllable end time |
| TC_ALLOC_WF_033 | Allocation | WF | Conditional | High | STUB | tests/e2e/buyer/allocation-experience.spec.js | Coordinated admin Stop |
| TC_ALLOC_E2E_034 | Allocation | E2E | Conditional | High | STUB | tests/e2e/buyer/allocation-experience.spec.js | ENV skip from gateway |
| TC_ALLOC_VAL_035 | Allocation | VAL | Conditional | Med | STUB | tests/e2e/buyer/allocation-experience.spec.js | Needs selected-unit fixture |
| TC_ALLOC_BIZ_036 | Allocation | BIZ | Conditional | High | STUB | tests/regression/buyer/allocation-experience.spec.js | Needs WAITLIST buyer outside campaign |
| TC_ALLOC_WF_037 | Allocation | WF | Conditional | High | STUB | tests/e2e/buyer/allocation-experience.spec.js | Needs DYNAMIC campaign env |
| TC_ALLOC_NEG_038 | Allocation | NEG | Yes | Low | FULL | tests/e2e/buyer/allocation-experience.spec.js | No storageState |
| TC_ALLOC_FUNC_039 | Allocation | FUNC | Yes | Low | FULL | tests/e2e/buyer/allocation-experience.spec.js | Logout flow |
| TC_ALLOC_UI_040 | Allocation | UI | Yes | Low | FULL | tests/ui-ux/buyer/allocation-experience.spec.js | Sidebar order |

---

## Sheet 3 — Bug Template

| Bug ID | TC_ID | Severity | Steps | Actual | Expected | Environment | Status |
|--------|-------|----------|-------|--------|----------|-------------|--------|
| BUG_NNN | TC_ALLOC_xxx_NNN | High/Med/Low | <steps> | <actual> | <expected> | UAT — Chrome 1920×900 | Open |

---

## Test-Case Reviewer Summary

**Reviewer:** test-case-reviewer skill (invoked post-authoring by QA Agent)
**Date:** 2026-06-04

### Visual Coverage Check

- Total TCs: 40
- TCs with FULL visual evidence (entry state mapped to a captured screenshot in INDEX.md): 32
  - TC_ALLOC_UI_001, UI_002, UI_003, FUNC_004, UI_006, UI_007, UI_008, UI_009, FUNC_010, UI_011, UI_012, NEG_013, FUNC_014 (entry), UI_016, UI_017, UI_018, FUNC_019, FUNC_020 (entry), UI_021, FUNC_022, FUNC_023 (entry), FUNC_024 (entry), FUNC_025 (entry), FUNC_026 (entry), VAL_027, UI_028, UI_029, FUNC_030, FUNC_031 (entry), NEG_038, FUNC_039, UI_040
- TCs marked [STUB-EVIDENCE] (downstream views not captured): 8
  - TC_ALLOC_EDGE_005, E2E_015, BIZ_032, WF_033, E2E_034, VAL_035, BIZ_036, WF_037
- **Visual coverage: 32 / 40 = 80%**

### LOGIC_GAP Check

- All TCs trace to BRD/FRD requirement IDs (BUYER-BRD sections, BUYER-FS-Allocation-Experience, BUYER-WF-Allocation, SHARED-BF-Allocation-Campaign-Lifecycle, or INDEX.md structural notes). No orphan TCs.
- **LOGIC_GAP count: 0**

### Traceability Matrix (sampled)

| TC_ID | Requirement Anchor |
|-------|--------------------|
| TC_ALLOC_UI_001 | BUYER-BRD §3 + INDEX Page Heading |
| TC_ALLOC_UI_007 | INDEX badge states (Book Now green pill) + BUYER-BRD §5 step 3 |
| TC_ALLOC_UI_017 | INDEX center booked-state + BUYER-BRD §5 step 15 + §4 rule 8 |
| TC_ALLOC_FUNC_020 | BUYER-BRD §3 module 4 + §6 + §4 rule 8 |
| TC_ALLOC_NEG_013 | INDEX right panel greyed + BUYER-BRD §5 step 9 |
| TC_ALLOC_VAL_035 | BUYER-BRD §4 rule 4 (TC-CST-012) |
| TC_ALLOC_BIZ_032 | BUYER-BRD §5 step 16 + §4 rule 7 |
| TC_ALLOC_WF_037 | BUYER-BRD §7 WebSocket + Feature-Spec DYNAMIC |

### Verdict

- Visual coverage 80% (meets threshold)
- LOGIC_GAP = 0
- **Status: APPROVED**

### Notes on Remaining STUB-EVIDENCE TCs

The 8 STUB TCs cover downstream states that physically cannot be captured without coordinated test infrastructure:

- TC_ALLOC_EDGE_005 — < 24h countdown boundary (requires controlled campaign end time)
- TC_ALLOC_E2E_015, E2E_034, VAL_035 — Unit selection grid + Add + T&C + Pay flow (requires walking through live ACTIVE STATIC campaign)
- TC_ALLOC_BIZ_032, WF_033 — Campaign expiry transition (requires coordinated admin Stop)
- TC_ALLOC_BIZ_036 — Pre-event WAITLIST waiting screen (requires buyer outside campaign window)
- TC_ALLOC_WF_037 — DYNAMIC campaign auto-assignment (requires DYNAMIC campaign env)

These remain CONDITIONAL for automation and should be executed manually until visual evidence is extended by Tech Lead Agent via a follow-up `visual-capture` run during a live campaign window.

### Handoff

- All 32 FULL-evidence TCs are cleared for automation scaffolding by QA Agent.
- The 8 STUB-EVIDENCE TCs remain manual-execution until the listed downstream states are captured.
- No changes required to BRD/FRD — feature logic for all 40 TCs is fully documented in BUYER-BRD §5, §7 and INDEX.md key structural notes.
