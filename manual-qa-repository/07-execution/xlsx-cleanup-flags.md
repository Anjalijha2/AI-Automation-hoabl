# XLSX Cleanup Flagging Report

**Generated:** 2026-06-06
**Author:** BA Agent — analysis-only pass (no xlsx files modified)
**Scope:** Two modules across two portals
**Purpose:** Human review gate before xlsx editing begins. All flags are proposals — no rows have been deleted, changed, or archived.

---

## Modules in Scope

| Portal | Module | Sheet | Total rows (approx) | Correct-gen prefix | Stale prefixes |
|--------|--------|-------|---------------------|--------------------|----------------|
| Sales Manager | Callback Requests | SMPortal.xlsx → "Callback Requests" | 268 | `TC_CBR_*` (55) | `SM_CB_*` (all), `TC_SMCB_*` (63) |
| Buyer | Unit Details | BuyerPortal.xlsx → "Unit Details" | 107 | `TC_BUYUD_*` (19) | `BYR_UNIT_*` (59), `TC_UNIT_*` (18) |

---

---

# MODULE 1 — SM PORTAL · CALLBACK REQUESTS

## Background

Three TC generations exist. The definitive v2 set is `TC_CBR_*` (55 TCs — APPROVED, dual-source, 100% visual coverage). The two older sets are:

- **`SM_CB_*`** — oldest. Built on a wrong architecture model: assumed three separate modals (Schedule Meeting, Confirm Meeting, SM Feedback Form) that do not exist in the live UI.
- **`TC_SMCB_*`** (63 TCs) — intermediate. Generated after v1 but before the full DOM-inspection architectural correction. Likely overlaps heavily with `TC_CBR_*`.

The live architecture (confirmed via DOM capture 2026-06-05) has only:
- Eye icon → read-only Details drawer (3 tabs: Callback Request / Feedback / Callback History)
- More icon → single dropdown item "Capture VC Outcome" → modal with outcome dropdown (10 codes)

---

## SECTION 1-SM — TCs Proposed for REMOVAL

> Reason codes: `WRONG-ARCH` = tests a UI element that does not exist; `OUT-OF-SCOPE` = subject matter outside module boundary; `FULLY-DUP` = scenario 100% covered by a `TC_CBR_*` TC with identical intent.

| TC_ID | Category | Reason Code | Detail | Action |
|-------|----------|-------------|--------|--------|
| SM_CB_001 | Login & Auth | OUT-OF-SCOPE | Login flow is not in scope for the Callback Requests module. Login is covered by a dedicated Login module. | DELETE |
| SM_CB_002 | Login & Auth | OUT-OF-SCOPE | Same as SM_CB_001. | DELETE |
| SM_CB_003 | Login & Auth | OUT-OF-SCOPE | Same as SM_CB_001. | DELETE |
| SM_CB_004 | Login & Auth | OUT-OF-SCOPE | Same as SM_CB_001. | DELETE |
| SM_CB_005 | Login & Auth | OUT-OF-SCOPE | Same as SM_CB_001. | DELETE |
| SM_CB_006 | Login & Auth | OUT-OF-SCOPE | Same as SM_CB_001. | DELETE |
| SM_CB_007 | Login & Auth | OUT-OF-SCOPE | Same as SM_CB_001. | DELETE |
| SM_CB_008 | Login & Auth | OUT-OF-SCOPE | Same as SM_CB_001. | DELETE |
| SM_CB_021 | Callback Request Table | FULLY-DUP | Table column enumeration — TC_CBR_UI_005 covers all 16 columns with exact selector reference. | DELETE |
| SM_CB_022 | Callback Request Table | FULLY-DUP | Row data rendering — TC_CBR_FUNC_020 / TC_CBR_FUNC_021 cover row state inspection. | DELETE |
| SM_CB_023 | Callback Request Table | FULLY-DUP | Status badge colours — TC_CBR_UI_006 covers PENDING (yellow) and MEETING DONE (green) badge class assertions. | DELETE |
| SM_CB_024 | Callback Request Table | FULLY-DUP | Actions column icons — TC_CBR_UI_007 covers exact 2-icon assertion. | DELETE |
| SM_CB_025 | Callback Request Table | FULLY-DUP | Empty-state rendering — TC_CBR_FUNC_014 / TC_CBR_FUNC_046 both cover "No data" empty state. | DELETE |
| SM_CB_026 | Callback Request Table | FULLY-DUP | Table load / page navigation — TC_CBR_UI_001 covers page load with greeting + summary cards + table. | DELETE |
| SM_CB_027 | Callback Request Table | FULLY-DUP | Pagination — TC_CBR_FUNC_015 covers 10/page selector. | DELETE |
| SM_CB_029 | Callback Request Table | FULLY-DUP | Sort by Request ID — TC_CBR_UI_005 documents sortable columns; sort behaviour is standard Ant Table and not uniquely valuable. | DELETE |
| SM_CB_030 | Callback Request Table | FULLY-DUP | Sort by Requested At — same rationale as SM_CB_029. | DELETE |
| SM_CB_031 | Callback Request Table | FULLY-DUP | Customer Name display — subsumed by TC_CBR_FUNC_020 (drawer row data). | DELETE |
| SM_CB_032 | Callback Request Table | FULLY-DUP | Registration No display — same as SM_CB_031. | DELETE |
| SM_CB_033 | Callback Request Table | FULLY-DUP | HV Code display — same column-level assertion; subsumed by TC_CBR_UI_005. | DELETE |
| SM_CB_034 | Callback Request Table | FULLY-DUP | Manager column display — TC_CBR_BIZ_054 covers manager column for role scoping; TC_CBR_UI_005 covers column header. | DELETE |
| SM_CB_035 | Filters & Search | FULLY-DUP | SM filter dropdown — TC_CBR_FUNC_008 covers "Select Sales Manager" dropdown with 10 options. | DELETE |
| SM_CB_036 | Filters & Search | FULLY-DUP | Status filter — TC_CBR_FUNC_009 covers filter trigger + 4 checkboxes. | DELETE |
| SM_CB_037 | Filters & Search | FULLY-DUP | Status filter apply — TC_CBR_FUNC_010 covers checkbox selection → table filter. | DELETE |
| SM_CB_038 | Filters & Search | FULLY-DUP | VC Outcome filter — TC_CBR_FUNC_011 covers filter trigger existence. | DELETE |
| SM_CB_039 | Filters & Search | FULLY-DUP | Search box — TC_CBR_FUNC_013 covers search by name/phone/email/reg-no. | DELETE |
| SM_CB_040 | Filters & Search | FULLY-DUP | Search zero-results — TC_CBR_FUNC_014 covers empty state. | DELETE |
| SM_CB_041 | Filters & Search | FULLY-DUP | Date range — TC_CBR_FUNC_012 covers Start/End date pickers. | DELETE |
| SM_CB_042 | Filters & Search | FULLY-DUP | Date range — sub-case of TC_CBR_FUNC_012. | DELETE |
| SM_CB_043 | Filters & Search | FULLY-DUP | Search debounce — sub-behaviour of TC_CBR_FUNC_013. | DELETE |
| SM_CB_044 | Filters & Search | FULLY-DUP | Filter combination — covered compositionally by TC_CBR_EDGE_053 (refresh preserves filter+search). | DELETE |
| SM_CB_045 | Filters & Search | FULLY-DUP | Filter clear — TC_CBR_EDGE_051 covers uncheck-all restores all rows. | DELETE |
| SM_CB_046 | Filters & Search | FULLY-DUP | Search clear — inverse of TC_CBR_FUNC_013. | DELETE |
| SM_CB_047 | Filters & Search | FULLY-DUP | Filter persistence — TC_CBR_EDGE_053 covers refresh-preserves-filter. | DELETE |
| SM_CB_048 | Filters & Search | FULLY-DUP | VC Outcome filter apply — extension of TC_CBR_FUNC_011. | DELETE |
| SM_CB_049 | Filters & Search | FULLY-DUP | Filter + pagination interaction — sub-case of existing filter + pagination TCs. | DELETE |
| SM_CB_050 | Filters & Search | FULLY-DUP | SM filter selection effect — sub-case of TC_CBR_FUNC_008. | DELETE |
| SM_CB_051 | Filters & Search | FULLY-DUP | Multiple filters combined — see SM_CB_044. | DELETE |
| SM_CB_052 | Filters & Search | FULLY-DUP | Filter UI aesthetics — subsumed by visual coverage in TC_CBR_UI_* and screenshot-backed INDEX.md. | DELETE |
| SM_CB_053 | Sort & Pagination | FULLY-DUP | Sort ascending/descending — standard Ant Table; TC_CBR_UI_005 notes sortable columns. | DELETE |
| SM_CB_054 | Sort & Pagination | FULLY-DUP | Sort by multiple columns — sub-case; no additional BRD req. | DELETE |
| SM_CB_055 | Sort & Pagination | FULLY-DUP | Pagination next/prev — standard Ant Pagination; TC_CBR_FUNC_015 covers default state. | DELETE |
| SM_CB_056 | Sort & Pagination | FULLY-DUP | Page-size selector change — extension of TC_CBR_FUNC_015. | DELETE |
| SM_CB_057 | Sort & Pagination | FULLY-DUP | Total row counter update — TC_CBR_FUNC_014 / TC_CBR_FUNC_013 both assert counter text. | DELETE |
| SM_CB_058 | Sort & Pagination | FULLY-DUP | Sort after filter — compositional; no unique scenario. | DELETE |
| SM_CB_059 | Sort & Pagination | FULLY-DUP | Pagination with filter — sub-case. | DELETE |
| SM_CB_060 | Sort & Pagination | FULLY-DUP | Jump to page — Ant Table standard. | DELETE |
| SM_CB_061 | Sort & Pagination | FULLY-DUP | Sort reset — standard. | DELETE |
| SM_CB_062 | Sort & Pagination | FULLY-DUP | Pagination on empty state — sub-case of TC_CBR_FUNC_014 (zero results). | DELETE |
| SM_CB_063 | Assign to SM | FULLY-DUP | Bulk-assign counter display — TC_CBR_FUNC_018 covers "Assign (0)" → "Assign (1)" counter. | DELETE |
| SM_CB_064 | Assign to SM | FULLY-DUP | Checkbox selection — covered by TC_CBR_FUNC_018. | DELETE |
| SM_CB_065 | Assign to SM | FULLY-DUP | Bulk-assign open — covered by TC_CBR_FUNC_018 + TC_CBR_BIZ_043. | DELETE |
| SM_CB_066 | Assign to SM | FULLY-DUP | Assign to specific SM — TC_CBR_BIZ_043 / TC_CBR_BIZ_044 cover assignment algorithm. | DELETE |
| SM_CB_067 | Assign to SM | FULLY-DUP | Post-assign row update — TC_CBR_BIZ_043 asserts new row in table with Manager column. | DELETE |
| SM_CB_068 | Assign to SM | FULLY-DUP | Re-assign flow — sub-case of TC_CBR_BIZ_043. | DELETE |
| SM_CB_069 | Assign to SM | FULLY-DUP | SM filter after assign — compositional; no unique BRD req. | DELETE |
| SM_CB_070 | Assign to SM | FULLY-DUP | Bulk-assign multiple — extension of TC_CBR_FUNC_018. | DELETE |
| SM_CB_071 | Assign to SM | FULLY-DUP | Cancel assign — cancel/dismiss behaviour; TC_CBR_FUNC_036 / TC_CBR_FUNC_045 cover cancel patterns. | DELETE |
| SM_CB_073 | Meeting Invite — Send & Resend | WRONG-ARCH | "Send Meeting Invite" modal does not exist. There is no separate meeting invite modal or button in the live UI. The only SM action surface is "Capture VC Outcome" via the More icon. | DELETE |
| SM_CB_074 | Meeting Invite — Send & Resend | WRONG-ARCH | Same as SM_CB_073. Tests a modal that does not exist. | DELETE |
| SM_CB_075 | Meeting Invite — Send & Resend | WRONG-ARCH | Same. | DELETE |
| SM_CB_076 | Meeting Invite — Send & Resend | WRONG-ARCH | Same. | DELETE |
| SM_CB_077 | Meeting Invite — Send & Resend | WRONG-ARCH | Same. | DELETE |
| SM_CB_079 | Meeting Invite — Send & Resend | WRONG-ARCH | Same. | DELETE |
| SM_CB_080 | Meeting Invite — Send & Resend | WRONG-ARCH | Same. Resend scenario — no Resend button exists; outcome re-capture is done via More → Capture VC Outcome on an already-MEETING-DONE row (TC_CBR_FUNC_028 covers this). | DELETE |
| SM_CB_081 | Meeting Invite — Send & Resend | WRONG-ARCH | Same. | DELETE |
| SM_CB_082 | Meeting Invite — Send & Resend | WRONG-ARCH | Same. | DELETE |
| SM_CB_083 | Meeting Invite — Send & Resend | WRONG-ARCH | Same. | DELETE |
| SM_CB_084 | Meeting Invite — Send & Resend | WRONG-ARCH | Same. | DELETE |
| SM_CB_085 | Meeting Invite — Send & Resend | WRONG-ARCH | Same. INT flavour — wrong arch means the integration scenario is also invalid. | DELETE |
| SM_CB_086 | Meeting Invite — Send & Resend | WRONG-ARCH | Same. | DELETE |
| SM_CB_087 | Meeting Done & Status Flow | WRONG-ARCH | "Meeting Done" button / modal does not exist. Status transitions are driven by the Capture VC Outcome submission, not a discrete "Meeting Done" modal. | DELETE |
| SM_CB_088 | Meeting Done & Status Flow | WRONG-ARCH | Same. | DELETE |
| SM_CB_089 | Meeting Done & Status Flow | WRONG-ARCH | Same. | DELETE |
| SM_CB_090 | Meeting Done & Status Flow | WRONG-ARCH | Same. | DELETE |
| SM_CB_091 | Meeting Done & Status Flow | WRONG-ARCH | Same. | DELETE |
| SM_CB_092 | Meeting Done & Status Flow | WRONG-ARCH | Same. | DELETE |
| SM_CB_093 | Meeting Done & Status Flow | WRONG-ARCH | Same. | DELETE |
| SM_CB_094 | Meeting Done & Status Flow | WRONG-ARCH | Same. | DELETE |
| SM_CB_095 | Meeting Done & Status Flow | WRONG-ARCH | Same. | DELETE |
| SM_CB_096 | Meeting Done & Status Flow | WRONG-ARCH | Same. | DELETE |
| SM_CB_097 | SM Feedback Form | WRONG-ARCH | "SM Feedback Form" is not an editable modal. Feedback is a READ-ONLY tab inside the Details drawer. TC_CBR_FUNC_022 covers the Feedback tab correctly. | DELETE |
| SM_CB_098 | SM Feedback Form | WRONG-ARCH | Same. | DELETE |
| SM_CB_099 | SM Feedback Form | WRONG-ARCH | Same. | DELETE |
| SM_CB_100 | SM Feedback Form | WRONG-ARCH | Same. | DELETE |
| SM_CB_101 | SM Feedback Form | WRONG-ARCH | Same. | DELETE |
| SM_CB_102 | SM Feedback Form | WRONG-ARCH | Same. | DELETE |
| SM_CB_103 | SM Feedback Form | WRONG-ARCH | Same. | DELETE |
| SM_CB_104 | SM Feedback Form | WRONG-ARCH | Same. | DELETE |
| SM_CB_105 | SM Feedback Form | WRONG-ARCH | Same. | DELETE |
| SM_CB_106 | SM Feedback Form | WRONG-ARCH | Same. | DELETE |
| SM_CB_107 | SM Feedback Form | WRONG-ARCH | Same. | DELETE |
| SM_CB_108 | SM Feedback Form — API | WRONG-ARCH | API test that targets a non-existent feedback-form submission endpoint. The Capture VC Outcome modal submission is the only write path (covered by TC_CBR_BIZ_032-034). | DELETE |
| SM_CB_114 | SM Feedback Form | WRONG-ARCH | Same. | DELETE |
| SM_CB_115 | View Detail Panel | FULLY-DUP | Detail panel open via eye icon — TC_CBR_FUNC_019 covers drawer open + 3 tabs. | DELETE |
| SM_CB_116 | View Detail Panel | FULLY-DUP | Customer Information section — TC_CBR_FUNC_020 covers read-only drawer body. | DELETE |
| SM_CB_117 | View Detail Panel | FULLY-DUP | Registration Preferences section — covered by TC_CBR_FUNC_020 / TC_CBR_FUNC_022. | DELETE |
| SM_CB_118 | View Detail Panel | FULLY-DUP | Description section — covered by TC_CBR_FUNC_020. | DELETE |
| SM_CB_119 | View Detail Panel | FULLY-DUP | Customer Units table in drawer — TC_CBR_FUNC_020 covers units sub-table. | DELETE |
| SM_CB_120 | View Detail Panel | FULLY-DUP | Drawer close — TC_CBR_FUNC_024 covers close button dismissal. | DELETE |
| SM_CB_121 | View Detail Panel | FULLY-DUP | PENDING row drawer — TC_CBR_FUNC_020. | DELETE |
| SM_CB_122 | View Detail Panel | FULLY-DUP | MEETING DONE row drawer — TC_CBR_FUNC_021 covers CONFIRMED status in drawer. | DELETE |
| SM_CB_123 | View Detail Panel | FULLY-DUP | Feedback tab in drawer — TC_CBR_FUNC_022 covers all SM Feedback fields. | DELETE |
| SM_CB_124 | View Detail Panel | FULLY-DUP | Callback History tab — TC_CBR_FUNC_023 covers history table headers. | DELETE |
| **TC_SMCB_* (all 63)** | Intermediate gen | FULLY-DUP | The entire `TC_SMCB_*` batch is an intermediate generation that predates the architectural correction. All scenarios it covers are either: (a) superseded by a correct `TC_CBR_*` equivalent, or (b) based on the same wrong architecture as `SM_CB_*`. Given 55 `TC_CBR_*` TCs provide 100% visual and BRD/FRD coverage and are APPROVED, retaining `TC_SMCB_*` creates ambiguity and bloat with no coverage gain. | DELETE all 63 |

---

## SECTION 2-SM — TCs Proposed for RETENTION from Old Generations

> These rows contain unique scenarios not covered by any `TC_CBR_*` TC and are substantively correct despite the prefix.

| TC_ID | Category | Why Unique | Keep Reason |
|-------|----------|------------|-------------|
| SM_CB_009 | KPI Dashboard | KPI card-level detail: "Total SM" count. TC_CBR_UI_001 asserts all 8 card headings exist but does NOT assert the specific numeric semantics of each card. SM_CB_009 may test that "Total SM" = total count of sales managers in the system — a numeric assertion TC_CBR_UI_001 does not make. | KEEP — verify card-specific numeric assertion content; if present, port scenario to a new TC_CBR_UI_XXX with correct evidence |
| SM_CB_010 | KPI Dashboard | "Total VC Request" — TC_CBR_UI_002 asserts the X / Y fraction format exists. SM_CB_010 may assert additional semantics (e.g. what X and Y represent). | KEEP — verify whether it adds semantic depth beyond TC_CBR_UI_002 before deciding |
| SM_CB_011 | KPI Dashboard | "Total VC Pending" count semantics. Not asserted numerically in any TC_CBR_* TC. | KEEP |
| SM_CB_012 | KPI Dashboard | "Invite Sent/Re-sent" card. Not explicitly asserted in TC_CBR_UI_001 beyond heading existence. | KEEP |
| SM_CB_013 | KPI Dashboard | "Meeting Done" card numeric semantics. | KEEP |
| SM_CB_014 | KPI Dashboard | "SM Feedback Done" card numeric semantics. | KEEP |
| SM_CB_015 | KPI Dashboard | "Customer Feedback Done" card. | KEEP |
| SM_CB_016 | KPI Dashboard | "Avg Rating by Customer" card — format assertion (decimal, range 0–5, etc.). | KEEP |
| SM_CB_017 | KPI Dashboard | KPI cards refresh after table action — dynamic count update after an outcome is submitted. TC_CBR_* do not test KPI card value changes post-action. | KEEP — this is a cross-surface behaviour with real regression value |
| SM_CB_018 | KPI Dashboard | KPI card real-time accuracy — whether card counts match table row counts. Unique reconciliation test. | KEEP |
| SM_CB_019 | KPI Dashboard | KPI card loading state / skeleton — visual transient state not covered by TC_CBR_*. | KEEP (lower priority) |
| SM_CB_020 | KPI Dashboard | KPI cards responsive layout — not tested in TC_CBR_UI_001 which focuses on content. | KEEP (low priority) |
| SM_CB_028 | Callback Request Table — INT | Integration: table data sourced from backend callback-request GET endpoint. SM_CB_028 is at table-level (not tied to the wrong-arch meeting modal) and asserts that displayed rows match API response. TC_CBR_* do not have a dedicated API↔UI reconciliation TC at the table level. | KEEP — this is the one INT TC in the table category that is architecturally valid |
| SM_CB_125 | Role Differences | SM (non-admin) view: verifies row scoping to own assignments. TC_CBR_BIZ_054 covers this — check if SM_CB_125 adds any additional assertion (e.g. exact row count, Manager column value match). | CONDITIONAL KEEP — only if SM_CB_125 adds detail beyond TC_CBR_BIZ_054 |
| SM_CB_126 | Role Differences | SM Admin view: sees all managers' rows. TC_CBR_BIZ_054 references "SM Admin login (separate test)" but the TC_CBR batch only has the one BIZ_054 TC combining both roles. SM_CB_126 may be the standalone SM-Admin-only perspective. | KEEP — provides the Admin-role half of the role-diff story explicitly |
| SM_CB_127 | Role Differences | Filter visibility differences by role (SM Admin sees SM selector; regular SM does not). Not explicitly asserted in TC_CBR_FUNC_008 which only tests the SM Admin perspective. | KEEP — unique negative-path role assertion |
| SM_CB_128 | Role Differences | Bulk-assign visibility by role. | KEEP |
| SM_CB_129 | Role Differences | Create Callback Request button visibility by role. | KEEP |
| SM_CB_130 | Role Differences | Export button visibility by role. | KEEP |
| SM_CB_131 | Role Differences | Refresh button visibility by role. | KEEP |
| SM_CB_132 | Role Differences | Role-switch session test (same browser, different SM). | KEEP (medium priority) |
| SM_CB_FSD_135 | FSD-verified | API test: GET /callback-requests response shape verification. Source-verified via FSD. | KEEP — unique API coverage not in TC_CBR_* |
| SM_CB_FSD_136 | FSD-verified | API test: POST /callback-request create endpoint contract. | KEEP |
| SM_CB_FSD_137 | FSD-verified | API test: PATCH /callback-request/:id outcome update contract. | KEEP |
| SM_CB_FSD_138 | FSD-verified | DB test: callback_request table schema / ENUM values. Source-verified. | KEEP |
| SM_CB_FSD_139 | FSD-verified | DB test: isAvailable flag effect on assignment query. | KEEP |
| SM_CB_FSD_140 | FSD-verified — INT | Integration: outcome submission → vcOffer creation in DB. Note: SM_CB_FSD_140 listed in prompt as INT (partially wrong-arch for meeting flow). Verify actual TC content — if it tests the VC Outcome → VC_REQUEST offer chain (which IS valid, per TC_CBR_BIZ_032/033), keep it as an API/DB-level verification of what TC_CBR_BIZ_032 asserts at UI level. | CONDITIONAL KEEP — keep only if scenario is the outcome→offer chain; delete if it tests meeting-invite integration |
| SM_CB_133 | API/DB | API test. Verify exact subject — if testing callback-request GET/POST (valid endpoint), keep. | CONDITIONAL KEEP — verify TC content |
| SM_CB_134 | API/DB | DB test. Verify exact subject similarly. | CONDITIONAL KEEP |
| SM_CB_072 | API/DB | Listed in prompt as API/DB. Note: SM_CB_072 falls in the Meeting Invite range (073-086 are WRONG-ARCH). Verify — if SM_CB_072 is an API test for the create endpoint (not meeting invite), keep. If it tests a meeting-invite API, delete. | CONDITIONAL KEEP — verify before decision |
| SM_CB_109 | INT — SM Feedback | INT test for feedback. Feedback in the live system is READ-ONLY in the drawer (the SM records outcome via the Capture VC Outcome modal, not an editable feedback form). However: if SM_CB_109 tests the backend vcOutcome write → feedback-record creation (i.e. outcome submission triggers a feedback record), this is architecturally valid despite the mislabelled category. | CONDITIONAL KEEP — verify exact assertion |
| SM_CB_110 | INT — SM Feedback | Same conditional rationale as SM_CB_109. | CONDITIONAL KEEP |

---

## SECTION 3-SM — TCs with Potentially Wrong Expected Results

| TC_ID | Problem | Correct Expected Result |
|-------|---------|------------------------|
| SM_CB_073 through SM_CB_086 | Expected results describe a "Send Meeting Invite" modal opening with fields for meeting time, Teams link, CC emails, and a Send/Resend button. None of these UI elements exist. | Correct ER: Clicking the row's More icon opens a dropdown with a single "Capture VC Outcome" item. There is no meeting invite modal. CC emails and meeting date are entered at request-creation time via the "Create Callback Request" drawer. |
| SM_CB_087 through SM_CB_096 | Expected results describe a "Meeting Done" button and a status transition to "MEETING DONE" via a discrete modal confirmation. | Correct ER: Status transitions are a side-effect of submitting a vcOutcome via "Capture VC Outcome" modal — specifically outcomes mapped to CONFIRMED/MEETING DONE in the backend workflow (SM-WF-CBR §3). There is no standalone "Meeting Done" button or confirmation modal. |
| SM_CB_097 through SM_CB_114 | Expected results describe an editable "SM Feedback Form" modal where the SM fills in Intent, Typology, Budget, Floor Preference etc. and submits. | Correct ER: Feedback data is visible as a READ-ONLY tab ("Feedback") inside the Callback Request Details drawer opened via the eye icon. The SM does not fill in these fields via the portal UI — they are populated as part of the vcOutcome submission workflow. The tab renders: Submitted at, Intent, Allocation Day Confirmation, Typology, Budget, Floor Preference, Lost Reason, Home Loan, Parking Required, Remark, Next Step (all read-only, per TC_CBR_FUNC_022). |
| SM_CB_065 through SM_CB_071 | Expected results may describe a round-robin assignment algorithm for the bulk-assign flow. | Correct ER per FSD-CORRECTION 2026-05-25: The system uses least-loaded algorithm (not round-robin). The round-robin code is disabled at `callback-request-sm.service.js:338-349`. SM with `isAvailable = false` is excluded from the pool. |
| SM_CB_087 / SM_CB_088 | Expected results may assert that status reaches "COMPLETED" after buyer feedback is submitted. | Correct ER per FSD-CORRECTION 2026-05-25 (`callback-request-sm.service.js:78-87`): Status never displays "COMPLETED" — the service catches ENUM truncation and falls back to CONFIRMED. Max visible status in the UI is "MEETING DONE" / "CONFIRMED". |

---

---

# MODULE 2 — BUYER PORTAL · UNIT DETAILS

## Background

Three TC generations exist. The definitive v3 set is `TC_BUYUD_*` (19 TCs — APPROVED, dual-source, 94.7% visual coverage). The two older sets are:

- **`BYR_UNIT_*`** (59 TCs) — oldest. Generated when the feature was assumed to be a standalone `/allotted-units` page with embedded cost sheet, tower view, floor plan, and payment schedule components. That URL returns a Next.js 404. Some API/DB/EDGE tests in this set cover the backend independently of the wrong page context.
- **`TC_UNIT_*`** (18 TCs) — intermediate. All have EMPTY Steps and Expected Results in the xlsx. Unusable as-is regardless of architecture correctness.

The real implementation: "Download your Unit Details" is a button on the KYC success page at `/kyc?unitId=<base64-encoded-unit-id>`. There is no standalone unit details page.

---

## SECTION 1-BUYER — TCs Proposed for REMOVAL

| TC_ID | Category | Reason Code | Detail | Action |
|-------|----------|-------------|--------|--------|
| **TC_UNIT_* (all 18)** | Intermediate gen | EMPTY-CONTENT | All 18 TCs have empty Steps and Expected Results in the xlsx. They carry no testable information. The TC_BUYUD_* batch supersedes. | DELETE all 18 |
| BYR_UNIT_003 | UI/FUNC | WRONG-ARCH | Asserts URL = `/allotted-units`. That route returns 404. The real URL is `/kyc?unitId=<b64>`. TC_BUYUD_NEG_001 explicitly locks the 404 behaviour. | DELETE |
| BYR_UNIT_004 | UI | WRONG-ARCH | Tests page layout of `/allotted-units` (unit number card, floor card, cost-sheet embed, tower-view embed, payment-schedule embed). Page 404s — no such layout exists. | DELETE |
| BYR_UNIT_005 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_006 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_007 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_008 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_009 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_010 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_011 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_012 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_013 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_014 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_020 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_021 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_023 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_043 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_044 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_048 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_049 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_058 | UI | WRONG-ARCH | Same wrong page. | DELETE |
| BYR_UNIT_015 | FUNC | WRONG-ARCH | Cost sheet arithmetic on `/allotted-units`. Page 404s; cost sheet is inside the downloaded document, not the rendered page (per TC_BUYUD_FUNC_005 / RESOLVED FINDINGS GAP-002). | DELETE |
| BYR_UNIT_018 | FUNC | WRONG-ARCH | Cost sheet math — same as BYR_UNIT_015. | DELETE |
| BYR_UNIT_022 | FUNC | WRONG-ARCH | Lightbox for images on `/allotted-units`. Page 404s; no lightbox exists on the KYC success page. | DELETE |
| BYR_UNIT_024 | FUNC | WRONG-ARCH | Embedded payment schedule on `/allotted-units`. Page 404s; payment schedule is inside the downloadable document. | DELETE |
| BYR_UNIT_036 | FUNC | WRONG-ARCH | `finalAgreementValue` formula validation via UI on `/allotted-units`. Wrong page context. | DELETE |
| BYR_UNIT_040 | FUNC | WRONG-ARCH | "Navigate to Home" from `/allotted-units`. Wrong page context — TC_BUYUD_FUNC_008 covers "Go to Home" from the KYC success page correctly. | DELETE |
| BYR_UNIT_042 | FUNC | WRONG-ARCH | Page reload stability on `/allotted-units`. Wrong page. | DELETE |
| BYR_UNIT_045 | FUNC | WRONG-ARCH | Lightbox for floor plan — same as BYR_UNIT_022. | DELETE |
| BYR_UNIT_052 | FUNC | WRONG-ARCH | Embedded payment schedule interaction — same as BYR_UNIT_024. | DELETE |
| BYR_UNIT_001 | BIZ | FULLY-DUP | WINNER / Non-WINNER access control — TC_BUYUD_BIZ_001 covers this with correct URL (`/kyc?unitId=<b64>`) and data-leak assertion. BYR_UNIT_001 tested the same scenario on `/allotted-units`. | DELETE |
| BYR_UNIT_016 | BIZ | WRONG-ARCH | Discount / early-bird pricing in cost sheet on `/allotted-units`. Page 404s; cost sheet is in the downloaded document. | DELETE |
| BYR_UNIT_017 | BIZ | WRONG-ARCH | Same as BYR_UNIT_016. | DELETE |
| BYR_UNIT_019 | BIZ | WRONG-ARCH | Cost sheet values unchanged after booking — wrong page context. | DELETE |
| BYR_UNIT_037 | BIZ | WRONG-ARCH | `homeLoanDiscount` not subtracted in cost sheet — wrong page context. | DELETE |
| BYR_UNIT_039 | BIZ | FULLY-DUP | Unauthenticated redirect to login — TC_BUYUD_NEG_003 covers this with correct URL `/kyc?unitId=<b64>`. BYR_UNIT_039 tested on `/allotted-units`. | DELETE |
| BYR_UNIT_041 | BIZ | WRONG-ARCH + PARTLY-DUP | Only WINNER's unit shown — TC_BUYUD_BIZ_001 covers the no-data-leak assertion. BYR_UNIT_041 tests this in wrong page context. | DELETE |
| BYR_UNIT_050 | BIZ | WRONG-ARCH | Payment schedule BIZ rule on `/allotted-units`. Wrong page. | DELETE |
| BYR_UNIT_051 | BIZ | WRONG-ARCH | Same as BYR_UNIT_050. | DELETE |
| BYR_UNIT_025 | NEG | FULLY-DUP + WRONG-ARCH | Broken image placeholder on `/allotted-units`. Wrong page; images / floor plans are inside the downloaded document, not rendered on KYC success page. No equivalent on the real page. | DELETE |
| BYR_UNIT_047 | NEG | WRONG-ARCH | Broken floor plan image on `/allotted-units`. Same rationale as BYR_UNIT_025. | DELETE |
| BYR_UNIT_057 | NEG | WRONG-ARCH | Broken floor plan causing JS crash on `/allotted-units`. Same rationale. | DELETE |

---

## SECTION 2-BUYER — TCs Proposed for RETENTION from Old Generations

| TC_ID | Category | Why Unique | Keep Reason |
|-------|----------|------------|-------------|
| BYR_UNIT_026 | NEG | API-level: 400 response when wrong registration number is supplied to the unit-details backend endpoint. TC_BUYUD_NEG_001/002/003/004 cover front-end negative paths; none cover a 400 from the backend for a bad registration identifier. | KEEP — port to API spec `tests/api/unit-details.api.spec.js` |
| BYR_UNIT_027 | API | 400 response for missing query params on the unit-details API endpoint. TC_BUYUD_* have no API test for this path. | KEEP — unique API negative test |
| BYR_UNIT_028 | NEG/API | 500 response for wrong/expired auth token on the unit-details API. TC_BUYUD_NEG_003 covers UI-level auth guard; this covers the raw API 500 response. | KEEP — unique API auth error test |
| BYR_UNIT_029 | API | Route not found (404 at API level for a non-existent endpoint variant). Different from the Next.js 404 — this is the API server's 404 for an invalid route path. | KEEP |
| BYR_UNIT_030 | INT | Azure Blob SAS URL generation for the downloadable unit details document. Verifies that the download URL is a valid Azure Blob SAS URL. TC_BUYUD_FUNC_005 asserts a download event fires and the file extension is non-empty — it does NOT assert the URL format or the Blob storage origin. BYR_UNIT_030 fills this gap. | KEEP — unique integration assertion |
| BYR_UNIT_031 | API | SQL: `CASE WHEN` logic ensures the buyer's own unit is returned first in the query result. Source-verified DB query behaviour. No TC_BUYUD_* covers query ordering. | KEEP — unique DB/API behaviour verification |
| BYR_UNIT_032 | DB | Raw delimited string (`||`) used in SQL concatenation for the unit composite string. Verifies the backend DB query produces the correct composite format. | KEEP |
| BYR_UNIT_033 | DB | ENUM values for `hcfTransactionStatus` in the DB. Verifies correct schema. | KEEP |
| BYR_UNIT_034 | EDGE | Duplicate payment order handling — tests what happens when a buyer has two payment orders for the same unit. TC_BUYUD_EDGE_001 covers multi-applicant pluralisation only; none of the TC_BUYUD_* cover duplicate payment orders. | KEEP |
| BYR_UNIT_035 | DB | `hcfTransactionStatus = PAID` filter in the backend query — ensures only paid transactions are returned. Source-verified. | KEEP |
| BYR_UNIT_046 | EDGE | Broken image URL in the Azure Blob response — tests graceful degradation when the document download URL is malformed or returns 404 from Blob storage. Different from TC_BUYUD_NEG_004 (which tests malformed `unitId` query param). This tests a valid `unitId` but a broken Blob URL in the response. | KEEP |
| BYR_UNIT_053 | EDGE | Empty milestones array in the payment schedule data. Tests that the KYC success page (or downloaded document) does not crash when milestones are absent. | KEEP |
| BYR_UNIT_054 | NEG | 401 session expired — API returns 401 when the buyer's JWT has expired mid-session. TC_BUYUD_NEG_003 covers the no-session case (redirect to login); BYR_UNIT_054 covers the mid-session token expiry at API level. | KEEP |
| BYR_UNIT_055 | API | 400 "Could not fetch unit data" — specific backend error message for a valid unitId that maps to no data. | KEEP |
| BYR_UNIT_056 | API | 400 "Missing required query params" — specific error message variant for the API. May overlap with BYR_UNIT_027 — verify exact param set being omitted differs. | CONDITIONAL KEEP — verify non-overlap with BYR_UNIT_027 |
| BYR_UNIT_059 | EDGE | Pay button disabled state — tests that the download button (or any payment-related CTA) is disabled when the unit is not in a payable state. TC_BUYUD_FUNC_004 asserts the download button is enabled for a WINNER account; BYR_UNIT_059 asserts the disabled state for a different account state. | KEEP — covers the disabled-button path TC_BUYUD_FUNC_004 does not test |

---

## SECTION 3-BUYER — TCs with Potentially Wrong Expected Results

| TC_ID | Problem | Correct Expected Result |
|-------|---------|------------------------|
| BYR_UNIT_003 | Expected result asserts page loads at URL `/allotted-units` with unit details content. | Correct ER: URL `/allotted-units` returns a Next.js 404 page ("404 — This page could not be found."). No unit details UI is shown. (TC_BUYUD_NEG_001 captures this correctly.) |
| BYR_UNIT_004 through BYR_UNIT_014, BYR_UNIT_020 through BYR_UNIT_023, BYR_UNIT_043, BYR_UNIT_044, BYR_UNIT_048, BYR_UNIT_049, BYR_UNIT_058 | Expected results describe page components (unit number card, floor details, cost sheet, tower view image, payment schedule iframe/embed) rendered on `/allotted-units`. | Correct ER: These components do NOT exist on any rendered page. The cost sheet, tower view, floor unit plans, and payment schedule are bundled INSIDE the downloaded Unit Details PDF document (booking form). The KYC success page renders only: banner, body paragraph, summary table (5 columns), "1 Applicant" button, "Download your Unit Details" button, "Go to Home" link. |
| BYR_UNIT_015, BYR_UNIT_018 | Expected results assert cost sheet arithmetic is visible and verifiable in the rendered DOM (e.g., Total = Base Price + GST + Maintenance). | Correct ER: Cost sheet arithmetic is inside the downloaded PDF, not in the rendered DOM. Portal-side assertion is limited to: download event fires, file is non-empty, extension is `.pdf` (TC_BUYUD_FUNC_005). |
| BYR_UNIT_036 | Expected result asserts `finalAgreementValue` formula is visible in the rendered DOM and equals a sum of visible line items. | Correct ER: `finalAgreementValue` is a backend-computed field. It is not rendered as a breakout formula on the KYC success page. If it appears anywhere, it would be inside the downloaded document. |
| BYR_UNIT_001 | Expected result may reference `/allotted-units` as the gate URL where WINNER/Non-WINNER access is enforced. | Correct ER: Access enforcement is on `/kyc?unitId=<b64>`. A non-WINNER buyer navigating to that URL with a WINNER's unitId must not see the WINNER's registration data (TC_BUYUD_BIZ_001). |
| BYR_UNIT_039 | Expected result describes redirect from `/allotted-units` to login for unauthenticated user. | Correct ER: Unauthenticated redirect is enforced at `/kyc?unitId=<b64>`. An anonymous user hitting that URL is redirected to the login screen (TC_BUYUD_NEG_003). |
| BYR_UNIT_022, BYR_UNIT_045 | Expected result describes a lightbox opening when a floor plan / tower view image is clicked. | Correct ER: No image is rendered on the KYC success page. The lightbox behaviour does not exist in the live UI at all. |
| BYR_UNIT_024, BYR_UNIT_052 | Expected result describes an embedded payment schedule table/chart rendered on the page. | Correct ER: No payment schedule is rendered on the KYC success page. It is inside the downloaded document. |
| BYR_UNIT_059 | Expected result may reference a button disabled state on a wrong page (`/allotted-units`). | Correct ER: The button in question is "Download your Unit Details" on the KYC success page `/kyc?unitId=<b64>`. Verify the exact disabled-state trigger — likely: button is disabled/absent when the buyer's registration does not have WINNER status or KYC is not yet complete. This is a valid scenario but must be re-scoped to the correct page. |

---

---

# SUMMARY COUNTS

## SM Callback Requests

| Disposition | Count |
|-------------|-------|
| Proposed DELETE — WRONG-ARCH (SM_CB_073–114) | ~30 |
| Proposed DELETE — OUT-OF-SCOPE (SM_CB_001–008) | 8 |
| Proposed DELETE — FULLY-DUP (SM_CB_021–071, SM_CB_115–124) | ~50 |
| Proposed DELETE — TC_SMCB_* all | 63 |
| **Total proposed deletions (SM)** | **~151** |
| Proposed KEEP — KPI Dashboard (SM_CB_009–020) | 12 |
| Proposed KEEP — Table INT (SM_CB_028) | 1 |
| Proposed KEEP — Role Differences (SM_CB_125–132) | 8 |
| Proposed KEEP — FSD/API/DB (SM_CB_FSD_135–140) | 6 |
| Proposed CONDITIONAL KEEP | 5 |
| **Total proposed retentions from old gens (SM)** | **~32** |
| TC_CBR_* — keep untouched | 55 |

## Buyer Unit Details

| Disposition | Count |
|-------------|-------|
| Proposed DELETE — TC_UNIT_* all (empty content) | 18 |
| Proposed DELETE — WRONG-ARCH (BYR_UNIT_*) | ~37 |
| Proposed DELETE — FULLY-DUP (BYR_UNIT_001, 039, 041) | 3 |
| **Total proposed deletions (Buyer)** | **~58** |
| Proposed KEEP — API (BYR_UNIT_026–029, 031, 054–056) | 7 |
| Proposed KEEP — DB (BYR_UNIT_032, 033, 035) | 3 |
| Proposed KEEP — INT (BYR_UNIT_030) | 1 |
| Proposed KEEP — EDGE (BYR_UNIT_034, 046, 053, 059) | 4 |
| Proposed CONDITIONAL KEEP (BYR_UNIT_056) | 1 |
| **Total proposed retentions from old gens (Buyer)** | **~16** |
| TC_BUYUD_* — keep untouched | 19 |

---

# REVIEWER ACTIONS REQUIRED

1. **Verify TC_SMCB_* content** — confirm no TC_SMCB_* row contains a uniquely valid API/DB scenario before deleting all 63. The user context states "likely overlaps" but did not confirm row-by-row. Spot-check at least TC_SMCB_* rows with type = API or DB.

2. **Verify conditional SM keeps** — SM_CB_072, SM_CB_109, SM_CB_110, SM_CB_133, SM_CB_134, SM_CB_FSD_140: open each row in the xlsx and read the Steps column to determine if the test subject is an architecturally valid endpoint or the wrong-arch meeting-invite flow.

3. **Verify BYR_UNIT_056 vs BYR_UNIT_027** — both are 400 "missing query params". Check whether the missing params differ between the two TCs before deciding to retain both or collapse to one.

4. **BYR_UNIT_059 scoping** — re-read the Steps column. If it references `/allotted-units`, the scenario is still worth keeping but the Steps and Expected Result must be rewritten for the correct page before the row is retained.

5. **SM_CB_125 vs TC_CBR_BIZ_054** — read SM_CB_125 Steps to check whether it adds specific assertion depth (e.g. exact row count comparison) beyond TC_CBR_BIZ_054's role-scoping assertion.

6. **Port retained API/DB rows** — BYR_UNIT_026–035, 054–056 and SM_CB_FSD_135–139 should be migrated to the appropriate API/DB spec files (`tests/api/*.api.spec.js`, `db/queries/*.js`) after xlsx cleanup is approved.

---

*Report ends. No xlsx files have been modified. All proposed actions are pending human review.*
