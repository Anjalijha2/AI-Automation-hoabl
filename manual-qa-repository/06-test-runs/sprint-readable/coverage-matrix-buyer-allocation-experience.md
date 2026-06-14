# Coverage Matrix — Self-Audit Gate — Buyer / Allocation Experience

Module: Buyer / Allocation Experience
Sources read (dual-source gate — BOTH present):
- visual-memory/buyer/allocation-experience/INDEX.md (Route /alloted, Page Heading, Navigation Sidebar, Registration Sidebar badge states, Center Panel — Unit Available State, Booked + Payment Completed State, Booked + KYC Completed State, right-panel links, Allotment Countdown Timer, Viewport 1920x900, re-verified WINNER_STATE)
- BRD: .claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md (§4 rules, §5 happy path, §7 WebSocket messages, §8 unit-hold rules; §3.3 DYNAMIC band-based correction)
- FRD: .claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Allocation-Experience.md (FS Features 1-4, §2.4 panels, §2.5 colours, §2.6 links, §2.7 phases, §2.8 rules) + FRD-Buyer-Portal Module 3 States 1-5, §8 real-time, §11 error handling, §12 animations
- WF: .claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-WF-Allocation.md (Workflow §5 STATIC, §6 DYNAMIC, §8 hold, §9 rules)

Legend: cell = Testcase_ID covering that dimension for that sub-module, or a justified `N/A`.
All IDs are pre-existing in the master JSON (this is a backfill self-audit — no TCs are generated or modified in this pass; nothing is marked "new"). No scenario dropped or renumbered (no-silent-drop).

Dimension columns (per dimensions-reference.md):
1 Pos · 2 Form/full-control · 3 Validation · 4 Race/re-check · 5 Neg/error · 6 Context-sensitive · 7 Notifications · 8 UI-vs-backend · 9 Role/auth/security · 10 Integration · 11 Boundary

| Sub-module | 1 Pos | 2 Form | 3 Valid | 4 Race | 5 Neg | 6 Ctx | 7 Notif | 8 UIvBE | 9 Auth | 10 Integ | 11 Bound |
|------------|-------|--------|---------|--------|-------|-------|---------|---------|--------|----------|----------|
| Page Load & Navigation | TC_ALLOC_UI_001, TC_ALLOC_UI_002 | TC_ALLOC_UI_003, TC_ALLOC_UI_021 | N/A: read-only page, no input | N/A: no submit on load | N/A: error/empty states covered in Error & Empty Handling | BYR_ALLOC_072 (pill→center binding per registration state) | N/A: no notification on page load | N/A: no form-vs-API split on load | TC_ALLOC_UI_001 (authenticated buyer renders) | N/A: integration covered in Cross-Module | N/A: no pagination/upload here |
| Auth & Access Control | N/A: no happy path beyond Page Load TC_ALLOC_UI_001 | N/A: no form | N/A: no input fields | BYR_ALLOC_057 (token re-check at protected call) | BYR_ALLOC_055 (unauth redirect), TC_ALLOC_NEG_041 (cross-tenant blocked) | N/A: single auth state | N/A: silent redirect, no notif | BYR_ALLOC_057 (UI redirect vs API 401 on tampered JWT) | BYR_ALLOC_055, BYR_ALLOC_057, TC_ALLOC_NEG_041 (multi-tenant isolation) | N/A: covered in API & Backend | N/A |
| Waiting State (Pre-Event) | BYR_ALLOC_001 (waiting screen renders) | BYR_ALLOC_002, BYR_ALLOC_003 (timer + NextChanceTime fields) | N/A: no input | BYR_ALLOC_004 (WS auto-update at campaign start) | N/A: no error path in waiting state | TC_ALLOC_FUNC_004 (no unit action while waitlisted) | N/A: WS push only, no external notif | N/A | BYR_ALLOC_001 (WAITLIST state gating) | BYR_ALLOC_004 (WebSocket campaign-start sync) | BYR_ALLOC_002 (countdown to start boundary) |
| Allocation-Open Banner & Countdown | BYR_ALLOC_005 (open banner appears) | BYR_ALLOC_006 (countdown field) | N/A: no input | BYR_ALLOC_005 (RUNNING-state transition) | N/A: closed-window in Post-Campaign | TC_ALLOC_EDGE_005 (near-zero vs running countdown state) | N/A: banner is in-app, no external notif | N/A | N/A: eligibility in API & Backend | BYR_ALLOC_005 (campaign RUNNING drives UI) | BYR_ALLOC_007 (d/h/m/s format), TC_ALLOC_EDGE_005 (countdown→00:00 boundary) |
| Book Now (Eligible Registration) | BYR_ALLOC_009, BYR_ALLOC_011, BYR_ALLOC_071 | BYR_ALLOC_008, BYR_ALLOC_009, BYR_ALLOC_010 (badge, Select Unit button, right-panel links) | N/A: no input fields pre-selection | N/A: no submit-time race here | N/A: ineligible covered in API & Backend TC_ALLOC_UI_028 | BYR_ALLOC_010 (right links greyed pre-selection vs active post-booking) | N/A: navigation only, silent | N/A | N/A: eligibility enforcement in API & Backend | BYR_ALLOC_071 (Home Dashboard → /alloted entry) | N/A |
| STATIC Unit Selection Grid | BYR_ALLOC_013, BYR_ALLOC_015 | BYR_ALLOC_012, BYR_ALLOC_014, BYR_ALLOC_016 (tower list, colour legend, unit detail panel) | N/A: grid selection, no typed input | N/A: submit-time race in Concurrency & Race | TC_ALLOC_NEG_013 (empty/sold-out grid) | BYR_ALLOC_015 (available→selectable) vs BYR_ALLOC_017 (booked→not) vs BYR_ALLOC_018 (held→not) | N/A: selection silent by design | N/A | N/A | N/A | N/A: grid not paginated (per-tower floors) |
| Unit Details Preview Links | BYR_ALLOC_019, BYR_ALLOC_020, BYR_ALLOC_022 | BYR_ALLOC_019, BYR_ALLOC_020, BYR_ALLOC_022, BYR_ALLOC_023, BYR_ALLOC_024 (each link/action) | N/A: no input | N/A | N/A: link-open is capture-only, no error path | BYR_ALLOC_023 (Cancel = deselect-keep-hold) vs BYR_ALLOC_024 (Change Unit = re-open grid) | N/A: capture-only, silent (see Notifications TC_ALLOC_FUNC_039) | BYR_ALLOC_023 (UI deselect vs BRD hold-on-payment) [VERIFY WITH DEV] | N/A | BYR_ALLOC_020 (Cost Sheet ↔ pricing), BYR_ALLOC_022 (Payment Schedule ↔ milestones) | N/A |
| Confirm Selection (Add) & T&C | BYR_ALLOC_025, BYR_ALLOC_028, BYR_ALLOC_029 | BYR_ALLOC_026 (T&C checkbox), BYR_ALLOC_028 (Pay button enabled), BYR_ALLOC_029 (amount label) | BYR_ALLOC_027 (Pay disabled until T&C), TC_ALLOC_VAL_027 (no-exception T&C gate) | N/A: re-check at Pay in Payment Flow | TC_ALLOC_VAL_027 (Pay blocked, no message dispatched) | BYR_ALLOC_027 (Pay disabled unticked) vs BYR_ALLOC_028 (enabled ticked) | TC_ALLOC_VAL_027 (no pay_now_initiated sent while unticked) | TC_ALLOC_VAL_027 (UI-disabled gate vs WS message suppression) | N/A | BYR_ALLOC_025 (Add → Allotment center panel) | BYR_ALLOC_029 (confirmation amount value) [VERIFY WITH DEV] |
| Payment Flow (Gateway) | BYR_ALLOC_030, BYR_ALLOC_031 | BYR_ALLOC_031 (gateway methods), BYR_ALLOC_033 (amount/GST breakdown) | N/A: gateway-side fields out of portal scope | BYR_ALLOC_030 (pay_now_initiated places 20-min hold), TC_ALLOC_BIZ_044 (hold timeout release) | TC_ALLOC_NEG_042 (failure releases hold) | TC_ALLOC_FUNC_010 (overlay blocks duplicate submit during processing) | BYR_ALLOC_032 (unit on-hold push to other buyers) | TC_ALLOC_FUNC_010 (UI overlay vs backend hold) [VERIFY WITH DEV] | N/A | BYR_ALLOC_030 (Easebuzz gateway integration), BYR_ALLOC_032 (cross-buyer hold sync) | TC_ALLOC_BIZ_044 (20-minute hold boundary) |
| Concurrency & Race (Submit-time) | N/A: no happy path — failure-mode sub-module | N/A: no form | N/A: no input | TC_ALLOC_BIZ_032 (two buyers same unit), TC_ALLOC_BIZ_045 (one hold per buyer), TC_ALLOC_NEG_043 (just-sold rejected at submit) | TC_ALLOC_NEG_043 (rejection message on sold unit) | TC_ALLOC_BIZ_045 (second-hold blocked vs swapped) [VERIFY WITH DEV] | N/A: race resolved server-side, silent | TC_ALLOC_BIZ_032 (server-side single-hold enforcement) | N/A | TC_ALLOC_BIZ_032 (Redis hold lock) | TC_ALLOC_BIZ_045 (max 1 concurrent hold per buyer) |
| Real-Time Notifications (unit_sold) | BYR_ALLOC_034 (unit_sold received), BYR_ALLOC_035 (tower_refresh) | N/A: no form | N/A: no input | BYR_ALLOC_035 (live state change reflected) | N/A: handled in Error & Empty Handling | BYR_ALLOC_034 (in-app push) vs TC_ALLOC_FUNC_039 (silent capture-only) | TC_ALLOC_FUNC_039 (no SMS/WhatsApp/email on view/deselect — silent by design) | TC_ALLOC_FUNC_039 (UI silent vs backend log check) | N/A | BYR_ALLOC_034, BYR_ALLOC_035 (WebSocket push integration) | N/A |
| DYNAMIC Allocation (Auto-Assigned) | BYR_ALLOC_036, BYR_ALLOC_037 | BYR_ALLOC_036 (assigned-unit fields), BYR_ALLOC_039 (missed-chances), TC_ALLOC_FUNC_046 (urgency indicator) | N/A: auto-assigned, no buyer input | BYR_ALLOC_038 (reallocation on miss/timeout) | BYR_ALLOC_038 (miss → reassign or WAITLIST), BYR_ALLOC_039 (MissedYourUnit) | BYR_ALLOC_039 (missed-chances indicators) vs BYR_ALLOC_036 (assigned-unit panel) | BYR_ALLOC_038 (reallocation_notification WS push) | BYR_ALLOC_038 (DOC_DRIFT-002 band-based vs FRD round-robin) [VERIFY WITH DEV] | N/A: eligibility in API & Backend | BYR_ALLOC_037 (proceed_to_pay → gateway), BYR_ALLOC_038 (reallocation engine) | N/A |
| Sold-Out State | BYR_ALLOC_040 (AllSoldOutUnit renders) | BYR_ALLOC_040 (sold-out message/waitlist offer) | N/A: no input | N/A: state, not a submit | BYR_ALLOC_040 (typology fully booked empty state) | N/A: single sold-out state | N/A: no notif on render | N/A | N/A | N/A | BYR_ALLOC_040 (all-units-booked boundary) |
| Post-Payment (Winner) | BYR_ALLOC_041, BYR_ALLOC_059 | BYR_ALLOC_059, BYR_ALLOC_060, BYR_ALLOC_061 (center labels, right links, Complete KYC CTA) | N/A: no input | TC_ALLOC_BIZ_036 (WINNER permanent at campaign end) | N/A: success path; failures in Payment Flow | BYR_ALLOC_059 (booked+KYC-pending shows Complete KYC) vs BYR_ALLOC_062 (booked+KYC-done hides it) | N/A: PaidYourUnit screen, no external notif documented | TC_ALLOC_BIZ_036 (UI Booked vs backend WINNER permanence) | N/A | BYR_ALLOC_061 (Complete KYC → KYC flow), BYR_ALLOC_063 (Home Dashboard sync) | N/A |
| Post-Campaign / Closed-Window State | N/A: terminal state, no happy path | BYR_ALLOC_021 (closed-window message) | N/A: no input | TC_ALLOC_FUNC_014 (campaign ends mid-payment) [VERIFY WITH DEV] | BYR_ALLOC_021 (closed-window red text), BYR_ALLOC_064 (revert to Waitlisted) | BYR_ALLOC_064 (Available→Waitlisted) vs BYR_ALLOC_066 (Booked unchanged) vs BYR_ALLOC_065 (waitlisted no-action) | N/A: state transition, silent | TC_ALLOC_FUNC_014 (UI mid-payment vs webhook-confirmed booking) | N/A | BYR_ALLOC_063→state propagation; TC_ALLOC_FUNC_014 (webhook source-of-truth) | N/A |
| Animations & Transitions | BYR_ALLOC_067, TC_ALLOC_UI_047 | BYR_ALLOC_068 (selection colour anim), TC_ALLOC_UI_048 (loading state) | N/A: no input | N/A: visual only | N/A: covered in Error & Empty Handling | TC_ALLOC_UI_048 (loading state) vs TC_ALLOC_UI_047 (success celebration) | N/A | N/A | N/A | TC_ALLOC_UI_048 (Lottie tied to towers_response load) | BYR_ALLOC_067 (1-tick-per-second cadence) [VERIFY WITH DEV] |
| Error & Empty Handling | N/A: error sub-module, no happy path | N/A: no form | TC_ALLOC_VAL_035 (session expiry mid-flow) | TC_ALLOC_NEG_038 (gateway timeout retry) | BYR_ALLOC_069 (WS disconnect/reconnect), BYR_ALLOC_070 (network error message), TC_ALLOC_NEG_038 (gateway timeout) | TC_ALLOC_NEG_038 (timeout → retry option) | N/A: friendly error UI, no external notif | TC_ALLOC_VAL_035 (UI re-login prompt vs backend 401) | TC_ALLOC_VAL_035 (session expiry → redirect to /) | BYR_ALLOC_069 (WebSocket reconnect logic) | N/A |
| E2E Allocation Journey | TC_ALLOC_E2E_015 (STATIC), TC_ALLOC_E2E_034 (DYNAMIC) | N/A: journey spans forms covered per sub-module | N/A: validation covered in Confirm & T&C | N/A: race covered in Concurrency & Race | N/A: negative covered in Error & Empty Handling | TC_ALLOC_E2E_015 (STATIC path) vs TC_ALLOC_E2E_034 (DYNAMIC path) | TC_ALLOC_E2E_015 (unit_sold broadcast on booking) | N/A | N/A: auth covered in Auth & Access Control | TC_ALLOC_E2E_015 (Home Dashboard sync), TC_ALLOC_WF_033 (post-campaign waitlist), TC_ALLOC_WF_037 (booked→KYC handoff) | N/A |
| API & Backend / Security | TC_ALLOC_FUNC_019, TC_ALLOC_FUNC_020, TC_ALLOC_FUNC_022 (WS responses) | TC_ALLOC_FUNC_020, TC_ALLOC_FUNC_022 (towers/units payload fields) | N/A: WS messages, no form input | TC_ALLOC_FUNC_023 (pay_now_initiated rejected for unavailable unit), TC_ALLOC_FUNC_024 (webhook source-of-truth), TC_ALLOC_FUNC_025 (no booking without payment) | TC_ALLOC_FUNC_023 (rejected hold), TC_ALLOC_FUNC_025 (no orphan booking) | TC_ALLOC_UI_028 (eligible vs ineligible participation), TC_ALLOC_UI_029 (single active campaign) | TC_ALLOC_FUNC_026 (reallocation_notification WS) | BYR_ALLOC_056 (JWT-scoped HTTPS), TC_ALLOC_FUNC_023 (server-side hold rejection vs UI) | BYR_ALLOC_056 (JWT-scoped data, no unscoped/forged token) | TC_ALLOC_FUNC_024 (gateway webhook → BOOKED), TC_ALLOC_FUNC_026 (reallocation engine) | TC_ALLOC_UI_029 (exactly one active campaign boundary) |
| Cross-Module Integration | BYR_ALLOC_042 (booking → dashboard) | N/A: no form | N/A: no input | N/A: covered in API & Backend | N/A: covered in Error & Empty Handling | N/A: single integration path per case | N/A: silent sync | BYR_ALLOC_043 (frozen price vs later offer recompute) [VERIFY WITH DEV] | N/A: auth in Auth & Access Control | BYR_ALLOC_042 (Home Dashboard sync), BYR_ALLOC_043 (Cost Sheet price freeze), TC_ALLOC_INT_049 (Unit Details + Payment Schedule) | N/A |
| Responsive / Viewport | BYR_ALLOC_045 (1920x900 baseline) | BYR_ALLOC_044, BYR_ALLOC_046 (mobile layout/grid render) | N/A: no input | N/A: layout, no submit | BYR_ALLOC_044 (no horizontal overflow) | BYR_ALLOC_045 (desktop 3-panel) vs BYR_ALLOC_044 (mobile stacked) | N/A | N/A | N/A | N/A | BYR_ALLOC_044 (375x667), BYR_ALLOC_045 (1920x900), BYR_ALLOC_046 (mobile grid) — viewport boundaries |
| Accessibility & Content | BYR_ALLOC_048 (assets render) | BYR_ALLOC_047 (bottom nav), BYR_ALLOC_049 (marquee/urgency copy) | N/A: no input | N/A | BYR_ALLOC_048 (no broken-asset icons) | BYR_ALLOC_047 (bottom nav switches sections) | N/A | N/A | N/A | N/A | N/A |
| Extended Coverage (existing baseline) | TC_ALLOC_UI_006, TC_ALLOC_UI_009 | TC_ALLOC_UI_007, TC_ALLOC_UI_008, TC_ALLOC_UI_018, BYR_ALLOC_054, BYR_ALLOC_058, TC_ALLOC_FUNC_030, TC_ALLOC_FUNC_031, TC_ALLOC_UI_040, TC_ALLOC_UI_011 (button/label/link styling + content) | N/A: no input | N/A: no submit | BYR_ALLOC_051 (MissedYourUnit), BYR_ALLOC_052 (UnitSoldNotification popup) | TC_ALLOC_UI_007 (green Select Unit) vs TC_ALLOC_UI_008 (red Complete KYC) vs TC_ALLOC_UI_012/_016/_017 (Waitlisted/Book Now/Booked badges) | BYR_ALLOC_052 (real-time sold popup — in-app) | BYR_ALLOC_053 (user_details_response reflects rendered state) | N/A | BYR_ALLOC_050 (WatchingUnitList), BYR_ALLOC_053 (user_details_response sync), BYR_ALLOC_054 (Pay Now → milestone payment) | N/A |

## Self-audit result

- No unjustified-empty cells. Every cell holds a Testcase_ID or a specific `N/A: <reason>`.
- This is a BACKFILL self-audit — all classified IDs are pre-existing in the master JSON. No TCs generated, renumbered, or dropped this pass.
- Two historical ID prefixes preserved per JSON note 14: `BYR_ALLOC_NNN` (baseline) and `TC_ALLOC_<TYPE>_NNN` (supplemental). No silent-drop.
- Dimensions that are structurally N/A for a state-display sub-module (no form, no submit, no pagination) are justified inline rather than forced — e.g. Validation/Boundary on read-only state panels, Notifications on silent capture-only views.

## Counts

- **Total TCs classified: 90** (across 23 sub-modules)
- Sub-modules (23): Page Load & Navigation · Auth & Access Control · Waiting State (Pre-Event) · Allocation-Open Banner & Countdown · Book Now (Eligible Registration) · STATIC Unit Selection Grid · Unit Details Preview Links · Confirm Selection (Add) & T&C · Payment Flow (Gateway) · Concurrency & Race (Submit-time) · Real-Time Notifications (unit_sold) · DYNAMIC Allocation (Auto-Assigned) · Sold-Out State · Post-Payment (Winner) · Post-Campaign / Closed-Window State · Animations & Transitions · Error & Empty Handling · E2E Allocation Journey · API & Backend / Security · Cross-Module Integration · Responsive / Viewport · Accessibility & Content · Extended Coverage (existing baseline)
- New TCs this pass: 0 (backfill classification only)

## [VERIFY WITH DEV] flags

Pulled from the JSON expected-result blocks where behaviour is not confirmed in BRD/FRD/FS/Workflow:

- BYR_ALLOC_072 — exact pill-to-center-panel binding not stated in BRD/FRD; confirm against live render.
- BYR_ALLOC_057 — exact JWT at-expiry behaviour and clock-skew tolerance not documented.
- TC_ALLOC_NEG_041 — confirm the API rejects/ignores a cross-tenant id.
- TC_ALLOC_EDGE_005 — exact countdown at-zero transition/animation to the closed-window state.
- BYR_ALLOC_014, BYR_ALLOC_018, BYR_ALLOC_032, BYR_ALLOC_068, TC_ALLOC_FUNC_022 — DOC_DRIFT-003 unit colour mapping; confirm the live legend (live UI wins).
- BYR_ALLOC_015 — whether mere selection (before Add/Pay) places a hold (BRD says hold starts at payment initiation).
- BYR_ALLOC_017 — exact non-selectable affordance for a booked/red unit.
- TC_ALLOC_NEG_013 — per-tower empty/sold-out grid message not transcribed.
- BYR_ALLOC_023 — "deselect-but-keep-hold" semantics vs BRD §8 hold-on-payment.
- BYR_ALLOC_029 — confirmation amount value may vary by unit; confirm against the live cost sheet.
- TC_ALLOC_FUNC_010 — exact overlay text/behaviour not transcribed.
- BYR_ALLOC_033 — exact payment-drawer line items not transcribed.
- TC_ALLOC_BIZ_045 — whether a second hold attempt is blocked or swaps the hold.
- TC_ALLOC_NEG_043 — exact rejection message on a just-sold unit.
- TC_ALLOC_FUNC_039 — confirm no side-channel (SMS/WhatsApp/email) notification on capture-only views.
- BYR_ALLOC_038, BYR_ALLOC_039, TC_ALLOC_E2E_034, TC_ALLOC_FUNC_026 — DOC_DRIFT-002 band-based vs round-robin; exact reallocation payload/indicator copy not transcribed.
- TC_ALLOC_FUNC_046 — HurryUnitsBookingFaster trigger/threshold and text not documented.
- BYR_ALLOC_040 — exact sold-out copy not transcribed.
- TC_ALLOC_FUNC_014 — mid-payment end-of-campaign handling and whether a webhook-confirmed payment still books.
- BYR_ALLOC_067, BYR_ALLOC_068 — exact countdown tick cadence / transition easing not documented.
- TC_ALLOC_UI_047, TC_ALLOC_UI_048 — exact Lottie celebration/loading asset/copy not captured.
- BYR_ALLOC_069, BYR_ALLOC_070, TC_ALLOC_NEG_038, TC_ALLOC_VAL_035 — exact reconnect/error/timeout/re-login copy not transcribed.
- BYR_ALLOC_056, TC_ALLOC_FUNC_019, TC_ALLOC_FUNC_020, TC_ALLOC_FUNC_022, TC_ALLOC_FUNC_023, TC_ALLOC_FUNC_024 — WebSocket/API payload schemas not transcribed; webhook-only booking + unscoped-token rejection to confirm on live build.
- TC_ALLOC_UI_028, TC_ALLOC_UI_029 — exact ineligible-state copy / multi-active-campaign behaviour not documented.
- BYR_ALLOC_043 — confirm no cost-sheet recompute after an offer change.
- TC_ALLOC_INT_049 — confirm the Unit Details / Payment Schedule link targets.
- BYR_ALLOC_044, BYR_ALLOC_046, BYR_ALLOC_047 — no mobile baseline screenshot held; confirm mobile render/bottom-nav items live.
- BYR_ALLOC_049 — exact marquee/urgency copy not transcribed in visual memory.
- BYR_ALLOC_050, BYR_ALLOC_051, BYR_ALLOC_052, BYR_ALLOC_053, BYR_ALLOC_054, TC_ALLOC_FUNC_031 — exact layout/copy/destination not captured; confirm live.

## [TEST_DATA_REQUIRED] flags

The Allocation Experience is a time-windowed, stateful flow. Most select/confirm/pay/post-payment cases require Admin-provisioned campaign + registration state before execution (JSON notes 2, 4, 5). Window-dependent / mutation TCs:

Window / campaign-state dependent:
- BYR_ALLOC_002, BYR_ALLOC_003 — scheduled (Upcoming) future campaign / next round.
- BYR_ALLOC_001, TC_ALLOC_FUNC_004 — waitlisted registration, no active campaign.
- BYR_ALLOC_004 — campaign starting imminently.
- BYR_ALLOC_005, BYR_ALLOC_006, BYR_ALLOC_007 — active campaign running.
- TC_ALLOC_EDGE_005 — near-expiry campaign window.
- BYR_ALLOC_008–BYR_ALLOC_011, BYR_ALLOC_071 — Available/Book Now registration in active window.
- BYR_ALLOC_012–BYR_ALLOC_016, TC_ALLOC_NEG_013 — active STATIC campaign / mixed-state grid / sold-out tower.
- BYR_ALLOC_036, BYR_ALLOC_037, BYR_ALLOC_039, TC_ALLOC_FUNC_046, BYR_ALLOC_050, BYR_ALLOC_051 — active DYNAMIC campaign / assigned / missed / taken unit.
- BYR_ALLOC_021, BYR_ALLOC_064, BYR_ALLOC_065, BYR_ALLOC_066, TC_ALLOC_WF_033 — ended campaign + (un)booked registration.
- BYR_ALLOC_040 — fully-booked typology.
- BYR_ALLOC_067, TC_ALLOC_UI_048, BYR_ALLOC_049, BYR_ALLOC_053, TC_ALLOC_FUNC_019/_020/_022, TC_ALLOC_UI_029 — active campaign for live WS frames.
- BYR_ALLOC_046 — active STATIC campaign + mobile viewport.

Mutation (real hold / payment / booking — requires explicit user authorisation + disposable registration, JSON note 5):
- BYR_ALLOC_030, BYR_ALLOC_031, BYR_ALLOC_032, BYR_ALLOC_033, TC_ALLOC_FUNC_010, TC_ALLOC_NEG_042, TC_ALLOC_BIZ_044 — payment flow / hold / gateway.
- TC_ALLOC_BIZ_032, TC_ALLOC_BIZ_045, TC_ALLOC_NEG_043 — concurrency (real hold by one buyer).
- BYR_ALLOC_034, BYR_ALLOC_038, BYR_ALLOC_052 — second/concurrent buyer booking.
- BYR_ALLOC_037 — DYNAMIC Proceed to Pay.
- BYR_ALLOC_041, BYR_ALLOC_059–BYR_ALLOC_063, TC_ALLOC_BIZ_036, TC_ALLOC_UI_047 — post-payment / WINNER (real booking).
- TC_ALLOC_FUNC_014, TC_ALLOC_NEG_038, TC_ALLOC_FUNC_023/_024/_025 — payment-flow edge / webhook / API mutation.
- TC_ALLOC_E2E_015, TC_ALLOC_E2E_034 — full journeys that book a real unit and set WINNER (irreversible).
- BYR_ALLOC_042, BYR_ALLOC_063 — just-booked disposable registration for dashboard sync.

Other test-data needs:
- BYR_ALLOC_057, TC_ALLOC_VAL_035 — aged/tampered/short-expiry JWT.
- TC_ALLOC_NEG_041 — buyer-B registration/unitId (cross-tenant).
- TC_ALLOC_FUNC_039 — notification-log visibility.
- BYR_ALLOC_069, BYR_ALLOC_070, TC_ALLOC_NEG_038 — network/WS fault injection.
- TC_ALLOC_UI_028 — an ineligible registration (payment not success / not available).
- BYR_ALLOC_043, BYR_ALLOC_054, BYR_ALLOC_060, TC_ALLOC_INT_049 — booked registration (capture-only, no mutation).
- BYR_ALLOC_056 — valid buyer JWT for HTTPS/scoping inspection.

Existing-state TCs that need NO provisioning (read account 8888888888 mixed states per JSON note 13): TC_ALLOC_UI_001/_002/_003/_006/_008/_009/_011/_012/_017/_018, TC_ALLOC_UI_021, BYR_ALLOC_058, BYR_ALLOC_059, BYR_ALLOC_062, BYR_ALLOC_048, TC_ALLOC_WF_037.

## DOC_DRIFT

Carried from the master JSON notes block (notes 10-12). Per BA Agent responsibility #7 these are RAISED for the same-pipeline BRD/FRD doc-update step; this pass produces the matrix only (no doc edits).

- **DOC_DRIFT-001 — ROUTE.** BRD/FS/Workflow write the Allotment route as `/allotted` (double t); the live portal and visual-memory/buyer/allocation-experience/INDEX.md use `/alloted` (single t): https://uat.xrportal.in/alloted. Live UI wins — all TCs use `/alloted`. BRD/FRD to be corrected within this pipeline step. (Also affects the Unit Details route `/kyc?unitId=<base64>` referenced in TC_ALLOC_INT_049.)
- **DOC_DRIFT-002 — DYNAMIC ALGORITHM.** FRD-Buyer-Portal Module 3 State 4 still says "round-robin logic"; FSD-CORRECTION 2026-05-25 (allocation-campaign.service.js) states DYNAMIC uses BAND-BASED assignment (round-robin refers only to callback/CB assignment). BUYER-BRD §3.3 already corrected. DYNAMIC TCs (BYR_ALLOC_036–039, TC_ALLOC_E2E_034, TC_ALLOC_FUNC_026) assume band-based. [VERIFY WITH DEV] exact band logic; FRD Module 3 State 4 to be corrected.
- **DOC_DRIFT-003 — UNIT COLOUR CODES.** FS §2.5 (White=Available, Green=Selected-by-you, Orange=another-buyer-hold, Red=Booked) conflicts with FRD-Buyer-Portal §8 heatmap (Green=Available, Orange=Selected/proceeding, Red=Booked, Blue=Reserved/admin-hold). Visual memory does not capture the live grid colours. Colour-dependent TCs (BYR_ALLOC_014, _015, _017, _018, _032, _068, TC_ALLOC_FUNC_022) are [VERIFY WITH DEV] against the live render; live UI wins once captured, then BRD/FRD reconciled.

> No blocking contradictions found between the Buyer visual-memory and the Buyer BRD/FRD/FS/Workflow beyond the three documented DOC_DRIFTs (all route/algorithm/colour, none blocking TC classification). Dual-source gate satisfied (both present). Self-audit completed unattended.
