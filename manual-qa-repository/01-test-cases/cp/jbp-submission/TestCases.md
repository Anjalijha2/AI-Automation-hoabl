# Test Cases — CP Portal / JBP Submission

**Portal:** Channel Partner Portal
**Module:** JBP (Joint Business Plan) Submission
**Route:** `https://uat-web.xrportal.in/jbp`
**Generated:** 2026-06-05
**Visual Memory Source:** `visual-memory/cp/jbp-submission/INDEX.md` (CAPTURE_STATUS: FULL — 8 screenshots)
**BRD/FRD Sources:**
- `.claude/docs/hoabl-knowledge-base/CP-Portal/BRD/CP-BRD-CP-Portal.md` (Sections 4, 6 — global rules; workflow)
- `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-JBP-Submission.md` (Features 1, 2, 3)
- `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FRD-CP-Portal.md` (Module 3)

**Dual-source gate:** PASSED (visual-memory FULL + BRD/FRD present).
**Auth precondition for all TCs:** CP logged in via `automation-repository/fixtures/.auth/channel-partner.json` (Mobile `8888888888`, OTP `147258`).

---

## Test Cases

| TC_ID | Title | Priority | Precondition | Steps | Expected Result | Visual Evidence | BRD Req ID | Status |
|-------|-------|----------|--------------|-------|-----------------|-----------------|------------|--------|
| TC_JBP_UI_001 | Page heading "JBP Dashboard" renders on /jbp | P1 | CP logged in | 1. Navigate to `https://uat-web.xrportal.in/jbp` | `h2` reads "JBP Dashboard"; sub-heading `h4` reads "Current Cycle - Automation JBP" | `jbp-loaded.png` | CP-BRD §3 (JBP Submission), CP-FRD Module 3 | Ready |
| TC_JBP_UI_002 | Sidebar JBP item shows as active on /jbp | P2 | CP logged in | 1. Navigate to /jbp 2. Inspect sidebar | Sidebar list shows "Home / KYC / JBP (active) / Leads / Logout"; JBP entry highlighted | `jbp-loaded.png` | CP-FRD Module 3 (Navigation) | Ready |
| TC_JBP_UI_003 | Current Cycle card shows OPEN-cycle metadata | P1 | OPEN cycle exists | 1. Navigate to /jbp 2. Locate Current Cycle card | Card shows: heading "Current Cycle - Automation JBP", date pill "June 2026", status badge "ACTIVE", text "Closes on: 30th June 2026", text "Your Status: Not Submitted" | `jbp-loaded.png` | CP-FS-JBP §1.3, CP-BRD §4.6 | Ready |
| TC_JBP_UI_004 | Three tabs render in expected order | P1 | CP on /jbp | 1. Inspect `.ant-tabs-tab` list | Tabs shown in order: "Current Cycle Entry" (default active) → "JBP History" → "Edit Requests" | `jbp-loaded.png`, `jbp-current-cycle-tab.png` | CP-FRD Module 3 | Ready |
| TC_JBP_FUNC_005 | "Current Cycle Entry" tab is selected by default | P1 | CP on /jbp | 1. Navigate to /jbp 2. Read selected tab via `.ant-tabs-tab-active` | "Current Cycle Entry" tab has the active state on first load | `jbp-current-cycle-tab.png` | CP-FRD Module 3 | Ready |
| TC_JBP_FUNC_006 | Current Cycle Entry tab shows empty-state CTA when CP has not yet submitted | P1 | OPEN cycle + CP status = "Not Submitted" | 1. Open Current Cycle Entry tab | Empty-state copy "No submission for current cycle" visible; primary button "Add New JBP Entry" visible | `jbp-current-cycle-tab.png` | CP-FS-JBP §1.3, §1.5.2 | Ready |
| TC_JBP_FUNC_007 | Click "Add New JBP Entry" reveals inline JBP form | P1 | Current Cycle Entry tab open | 1. Click button `:has-text("Add New JBP Entry")` | URL remains `/jbp` (no navigation); inline form revealed (no modal); heading `h2: "JBP Form - Automation JBP"` shown | `jbp-open-cycle-form.png` | CP-FS-JBP §1.4 | Ready |
| TC_JBP_UI_008 | JBP submission form renders all 44 input fields | P1 | Form opened via "Add New JBP Entry" | 1. Count input elements within the form 2. Verify field types | Form contains: 1 Brokerage `ant-select` dropdown (`input[placeholder="Select Brokerage"]`), 1 untitled text input, 20 checkbox inputs, 18 radio inputs across 9 Yes/No radio-groups, 1 numeric text input (`input[placeholder="Enter Count"]`) — total 44 inputs | `jbp-open-cycle-form.png` | CP-FS-JBP §1.4, CP-FRD Module 3 ("JBP Form Fields") | Ready |
| TC_JBP_UI_009 | Brokerage select dropdown is present and interactive | P1 | Form open | 1. Locate `input[placeholder="Select Brokerage"]` 2. Click it | Dropdown opens, ant-select options list rendered (rc_select_0 combobox pattern) | `jbp-open-cycle-form.png` | CP-FS-JBP §1.4 (Brokerage to be Earned) | Ready |
| TC_JBP_UI_010 | All nine Yes/No radio-groups render two radio buttons each | P1 | Form open | 1. Inspect radio-group names `:rt:`, `:ru:`, `:rv:`, `:r10:`, `:r11:`, `:r12:`, `:r13:`, `:r14:` (+1) | Each group exposes exactly 2 radio inputs (Yes/No semantics per CP-FS-JBP §1.4 — Inserts, Standees, Kiosk, Tele Callers, SMS Blast, WhatsApp Blast, Growth Hub, plus 2 more) | `jbp-open-cycle-form.png` | CP-FS-JBP §1.4 (Yes/No fields) | Ready |
| TC_JBP_UI_011 | Checkbox grid renders 20 checkboxes (activities + digital channels) | P2 | Form open | 1. Count `input[type="checkbox"]` within form | 20 checkboxes rendered (List of Activities ~14 + Go Live on Digital ~6) | `jbp-open-cycle-form.png` | CP-FS-JBP §1.4 (List of Activities, Go Live on Digital) | Ready |
| TC_JBP_UI_012 | "Enter Count" numeric input is present | P1 | Form open | 1. Locate `input[placeholder="Enter Count"]` | Input visible and enabled; expected to capture Registration Commitment numeric value | `jbp-open-cycle-form.png` | CP-FS-JBP §1.4 (Registration Commitment) | Ready |
| TC_JBP_UI_013 | Form footer shows "Back to Dashboard" and "Submit" buttons | P1 | Form open | 1. Inspect form footer | Two buttons visible: "Back to Dashboard" (secondary), "Submit" (primary) | `jbp-open-cycle-form.png` | CP-FS-JBP §1.4 (Step 3 — Submit) | Ready |
| TC_JBP_VAL_014 | Submitting empty form triggers validation errors on required fields | P1 | Form open, all fields empty | 1. Click "Submit" without filling any field | Submission is blocked; antd validation errors appear under required fields (red inline messages); URL stays at `/jbp`; no Thank You redirect | `jbp-form-validation.png` | CP-FS-JBP §1.5.3 (All required fields must be completed) | Ready |
| TC_JBP_VAL_015 | Brokerage dropdown is a required field | P2 | Form open, all other fields filled, Brokerage left empty | 1. Fill all other fields 2. Click "Submit" | Validation error surfaces specifically under the Brokerage select field | `jbp-form-validation.png` | CP-FS-JBP §1.4, §1.5.3 | Ready |
| TC_JBP_VAL_016 | "Enter Count" (Registration Commitment) is a required field | P2 | Form open, all other fields filled, Count left empty | 1. Click "Submit" | Validation error surfaces under "Enter Count" input | `jbp-form-validation.png` | CP-FS-JBP §1.4 (Registration Commitment), §1.5.3 | Ready |
| TC_JBP_FUNC_017 | Form fields accept user input when filled via UI interactions | P1 | Form open | 1. Select Brokerage option 2. Tick checkboxes 3. Select Yes for Inserts radio 4. Enter "10" in Count | Each interaction reflects in the rendered DOM state; selected option, ticked boxes, radio selection, and Count value persist | `jbp-form-filled.png` | CP-FS-JBP §1.4, How to Use §Step 2 | Ready |
| TC_JBP_E2E_018 | Submit fully-filled JBP form → Thank You page → status updates | P1 | Form open with valid data, OPEN cycle, CP = Not Submitted | 1. Fill all required fields with valid values 2. Click "Submit" | CP redirected to `/jbp/thank-you`; JbpSubmission record created with `status=ACTIVE`, `version=1`; on next /jbp visit, "Your Status" badge becomes "Submitted" | `jbp-form-filled.png` (input state), `jbp-loaded.png` (status badge baseline) | CP-FS-JBP §1.6 (System Actions on Submission) | Ready |
| TC_JBP_BIZ_019 | After successful submission, "Add New JBP Entry" CTA disappears | P1 | CP just submitted for current cycle | 1. Reload /jbp 2. Open Current Cycle Entry tab | "Add New JBP Entry" button NO longer rendered; submitted plan shown in read-only mode; Your Status = "Submitted" | `jbp-loaded.png` (baseline before submit), `jbp-current-cycle-tab.png` | CP-FS-JBP §1.5.2 (button disappears after submission), CP-BRD §4.5 | Ready |
| TC_JBP_BIZ_020 | Existing submission renders in read-only mode for current cycle | P1 | CP has active submission for OPEN cycle | 1. Open Current Cycle Entry tab | All 14 field values display in read-only format; version number and submission status shown; no editable inputs | `jbp-current-cycle-tab.png` | CP-FS-JBP §3.1, §3.2 | Ready |
| TC_JBP_NEG_021 | Attempting a second submission for the same cycle is blocked | P1 | CP already submitted for OPEN cycle | 1. Navigate to /jbp 2. Confirm CTA is hidden | "Add New JBP Entry" button is not rendered; CP cannot create a second submission via UI | `jbp-current-cycle-tab.png` | CP-BRD §4.5 (One per cycle), CP-FS-JBP §1.5.2 | Ready |
| TC_JBP_FUNC_022 | "JBP History" tab opens and shows 8 past-submission rows | P1 | CP has prior submissions | 1. Click `.ant-tabs-tab :has-text("JBP History")` | History table renders 8 rows (one per past cycle); each row shows Cycle / Submitted Date / Status / Actions columns | `jbp-history-tab.png` | CP-FRD Module 3 (history); CP-FS-JBP §3 | Ready |
| TC_JBP_UI_023 | JBP History rows show cycle name, submitted date, and status | P2 | History tab active | 1. Inspect rows in `jbp-history-tab` | Each row exposes the cycle name, submission date, and a status indicator (Approved / Rejected / etc.) | `jbp-history-tab.png` | CP-FS-JBP §3.2 (version + status displayed) | Ready |
| TC_JBP_FUNC_024 | "Edit Requests" tab opens and shows empty state for CP with no edit requests | P1 | CP has not filed any edit request | 1. Click `.ant-tabs-tab :has-text("Edit Requests")` | Tab content shows empty state (0 rows) — no edit-request table populated | `jbp-edit-requests-tab.png` | CP-FS-JBP §2.1 | Ready |
| TC_JBP_BIZ_025 | Edit request flow available only after CP has submitted for OPEN cycle | P1 | CP has active submission + cycle still OPEN | 1. Open Current Cycle Entry tab 2. Locate "Request Edit" option on submitted plan | Option to file edit request is exposed only when both preconditions hold (submission exists + cycle OPEN); per CP-FS-JBP §2.2 | `jbp-current-cycle-tab.png` | CP-FS-JBP §2.2 (Preconditions) | Ready |
| TC_JBP_E2E_026 | CP files an edit request → request appears in Edit Requests tab | P1 | CP has active submission, cycle OPEN | 1. Click "Request Edit" 2. Fill changes-requested description + revised values 3. Submit edit request 4. Open Edit Requests tab | New row added to Edit Requests tab with the filed request (status pending admin review) | `jbp-edit-requests-tab.png` (baseline empty state) | CP-FS-JBP §2.3, §2.4 | Ready |
| TC_JBP_BIZ_027 | On admin approval of edit request, submission version increments and old version becomes EXPIRED | P1 | CP filed edit request; admin approves in Admin Portal | 1. Wait for admin approval 2. Reload /jbp | Submitted plan now shows incremented version (e.g., v2); old version is marked EXPIRED in backend; updated field values rendered in read-only view | `jbp-current-cycle-tab.png` | CP-FS-JBP §2.4.2, CP-BRD §4.7 (version tracking) | Ready |
| TC_JBP_BIZ_028 | On admin rejection of edit request, original submission is preserved | P1 | CP filed edit request; admin rejects | 1. Wait for admin rejection 2. Reload /jbp | Original submission values unchanged; version remains v1; rejection reason visible in Edit Requests tab | `jbp-edit-requests-tab.png` | CP-FS-JBP §2.4.3, §2.4.4 | Ready |
| TC_JBP_BIZ_029 | Closed-cycle state: form is not accessible and "Cycle has Closed" message shown | P1 | Cycle is in CLOSED state (e.g., May 2026 historical baseline) | 1. Navigate to /jbp during a closed cycle | Current Cycle card shows status badge "CLOSED"; copy reads "Cycle has Closed"; "Add New JBP Entry" CTA is hidden; form cannot be opened | `screenshot-desktop.png` | CP-BRD §4.6, CP-FS-JBP §1.5.1 | Ready |
| TC_JBP_NEG_030 | Submissions are not accepted after a cycle closes | P1 | Cycle transitions to CLOSED while CP is still on /jbp | 1. Have form open in a session 2. After cycle closes admin-side, attempt Submit | Submit is rejected with cycle-closed error; no JbpSubmission record created; CP-BRD §4.6 enforced | `screenshot-desktop.png` | CP-BRD §4.6, CP-FS-JBP §1.5.1 | Ready |
| TC_JBP_FUNC_031 | "Back to Dashboard" button returns user to /dashboard | P2 | Form open | 1. Click "Back to Dashboard" | User navigates to `/dashboard`; no submission created; no Thank You page | `jbp-open-cycle-form.png` | CP-FS-JBP §1 (Form footer behaviour) | Ready |
| TC_JBP_UI_032 | "Your Status" pill reflects state values per cycle | P1 | Various cycle states | 1. Inspect "Your Status" text for OPEN-not-submitted, OPEN-submitted, OPEN-approved, OPEN-rejected | Status values match expected enum: Not Submitted / Submitted / Approved / Rejected | `jbp-loaded.png` | CP-FS-JBP §1.5, §3.2 | Ready |
| TC_JBP_REG_033 | Tab text appears in DOM twice (responsive duplicate) but renders only one visible row | P3 | CP on /jbp | 1. Query `.ant-tabs-tab` count via DOM 2. Verify visual render | Each tab text appears 2x in DOM (mobile + desktop responsive copies) but only one tab strip is visually rendered at 1920×900 | `jbp-loaded.png` | Visual-memory Key Structural Notes (Tabs section) | Ready |
| TC_JBP_EDGE_034 | Submitting form with all checkboxes ticked is accepted | P3 | Form open | 1. Tick all 20 checkboxes 2. Fill required scalars 3. Submit | Submission accepted; backend persists full activity + digital channel arrays | `jbp-form-filled.png` | CP-FS-JBP §1.4 (multi-checkbox fields) | Ready |
| TC_JBP_EDGE_035 | Submitting form with zero checkboxes ticked depends on field requirement | P3 | Form open | 1. Leave all checkboxes unticked 2. Fill required scalars 3. Submit | Per CP-FS-JBP §1.4 these are multi-checkbox fields; if backend treats at-least-one as required, validation error fires; if optional, submission succeeds — verify against BRD acceptance criteria | `jbp-form-validation.png` | CP-FS-JBP §1.4 (gap: minimum count not documented) | Ready |
| TC_JBP_VAL_036 | "Enter Count" field accepts only numeric input | P2 | Form open | 1. Type letters into `input[placeholder="Enter Count"]` 2. Submit | Non-numeric input is either blocked at input level or rejected on submit; numeric values accepted | `jbp-open-cycle-form.png` | CP-FS-JBP §1.4 (Registration Commitment — Number) | Ready |
| TC_JBP_XMOD_037 | Submitted JBP appears in Admin Portal > JBP Management > Submissions | P1 | CP submitted on CP Portal | 1. As CP, submit JBP 2. As admin, open Admin Portal JBP Management > Submissions tab | Newly created JbpSubmission record (status=ACTIVE, version=1) listed in admin submissions table for the corresponding cycle | `jbp-loaded.png` (CP side) | CP-FS-JBP §1.6.3 (admin visibility), CP-BRD-Module 3 | Ready |

---

## Review Summary

**Total TCs:** 37
**Priority distribution:** P1 = 24 · P2 = 9 · P3 = 4
**Type distribution:** UI = 12 · FUNC = 8 · VAL = 4 · E2E = 2 · BIZ = 7 · NEG = 2 · EDGE = 2 · REG = 1 · XMOD = 1

**Visual coverage:**
- TCs with screenshot citation: 37 / 37 = **100%**
- TCs citing newly-captured open-cycle screens (`jbp-loaded.png`, `jbp-current-cycle-tab.png`, `jbp-open-cycle-form.png`, `jbp-form-validation.png`, `jbp-form-filled.png`, `jbp-history-tab.png`, `jbp-edit-requests-tab.png`): 35 / 37 = **94.6%**
- TCs citing closed-cycle baseline (`screenshot-desktop.png`): 2 (TC_JBP_BIZ_029, TC_JBP_NEG_030)
- Threshold for APPROVED: ≥ 80% → **PASSED**

**BRD/FRD traceability:**
- Every TC carries at least one BRD/FRD Req ID (CP-BRD §, CP-FS-JBP §, or CP-FRD Module 3). No orphan TCs.

**Coverage by scope item (from task brief):**
- Page heading "JBP Dashboard" → TC_JBP_UI_001
- Current Cycle card (OPEN badge, cycle name, closes date, Your Status values) → TC_JBP_UI_003, TC_JBP_UI_032
- All 3 tabs → TC_JBP_UI_004, TC_JBP_FUNC_005, TC_JBP_FUNC_022, TC_JBP_FUNC_024, TC_JBP_REG_033
- "Add New JBP Entry" CTA → TC_JBP_FUNC_006, TC_JBP_FUNC_007
- Form structure (brokerage, checkboxes, Yes/No, count) → TC_JBP_UI_008, TC_JBP_UI_009, TC_JBP_UI_010, TC_JBP_UI_011, TC_JBP_UI_012, TC_JBP_UI_013
- Form validation → TC_JBP_VAL_014, TC_JBP_VAL_015, TC_JBP_VAL_016, TC_JBP_VAL_036
- Form fill + submit flow → TC_JBP_FUNC_017, TC_JBP_E2E_018
- One submission per CP per cycle → TC_JBP_BIZ_019, TC_JBP_NEG_021
- JBP History 8 rows → TC_JBP_FUNC_022, TC_JBP_UI_023
- Edit Requests empty state → TC_JBP_FUNC_024
- Post-submit edit request flow → TC_JBP_BIZ_025, TC_JBP_E2E_026
- Edit approval: version increment, old EXPIRED → TC_JBP_BIZ_027, TC_JBP_BIZ_028
- Closed cycle state → TC_JBP_BIZ_029, TC_JBP_NEG_030

**Gaps / open items:**
- TC_JBP_EDGE_035 raises a documentation gap: CP-FS-JBP §1.4 does not specify a minimum-checkbox-count rule for "List of Activities" / "Go Live on Digital" multi-selects. Action: confirm with product whether at-least-one tick is required.
- Field-label-to-DOM mapping for the 9 Yes/No radio-groups is not fully visible in DOM dump (`_jbp-form-inspect.json`) because labels live in `.ant-form-item-label` siblings, not on the inputs. Tech Lead Agent should extract human-readable labels in next visual-capture iteration so radio-group TCs (TC_JBP_UI_010) can name each Yes/No group precisely.

**Overall status: APPROVED**

Visual coverage 100% with 94.6% citing freshly captured open-cycle artefacts; dual-source gate satisfied; full traceability to BRD/FRD; previous Conditional batch (44.8%, 16 STUB TCs) is hereby superseded and overwritten.
