# Test Cases — CP Portal / JBP Submission

**Module:** JBP (Joint Business Plan) Submission
**Portal:** Channel Partner Portal
**URL:** `https://uat-web.xrportal.in/jbp`
**Generated:** 2026-06-04
**Generator:** BA Agent (Phase 1 — dual-source TC generation)
**Sources:**
- Visual: `visual-memory/cp/jbp-submission/INDEX.md` (CAPTURE_STATUS: FULL — Closed Cycle only)
- BRD: `.claude/docs/hoabl-knowledge-base/CP-Portal/BRD/CP-BRD-CP-Portal.md`
- FRD: `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-JBP-Submission.md`
- FRD: `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FRD-CP-Portal.md`

> WARNING — Open Cycle submission form is NOT captured in visual memory. TCs marked `[STUB-EVIDENCE]` are derived from BRD/FRD only and Expected Results may not match the live UI. Full capture of Open Cycle state is required before automation candidacy.

---

## Sheet 1 — Manual Test Cases

| TC_ID | Title | Priority | Precondition | Steps | Expected Result | Visual Evidence | BRD Req ID | Status |
|-------|-------|----------|--------------|-------|-----------------|-----------------|------------|--------|
| TC_JBP_UI_001 | Verify JBP Dashboard page heading renders | High | CP logged in; session valid | 1. Navigate to `https://uat-web.xrportal.in/jbp` 2. Wait for page load 3. Inspect top of page | Page renders with heading text "JBP Dashboard" (h1 or h2) visible at top of content area | `visual-memory/cp/jbp-submission/screenshot-desktop.png` | CP-BRD §3 (Module 3), CP-FRD §5 Module 3 | Draft |
| TC_JBP_UI_002 | Verify navigation sidebar shows JBP as active item | High | CP logged in | 1. Navigate to `/jbp` 2. Inspect left navigation sidebar 3. Identify the JBP item | Sidebar lists Home (`/dashboard`), KYC (`/kyc`), JBP (active, highlighted), Leads (`/leads`), Logout. JBP item appears in active state | `visual-memory/cp/jbp-submission/screenshot-desktop.png` | CP-FRD §6 Navigation Structure | Draft |
| TC_JBP_UI_003 | Verify Current Cycle card displays cycle name and month | High | A JBP cycle exists (Open or Closed) | 1. Navigate to `/jbp` 2. Locate Current Cycle card 3. Read heading and date sub-text | Card displays heading "Current Cycle - [cycleName]" (e.g., "Current Cycle - test JBP") and date sub-text "[Month Year]" (e.g., "May 2026") | `visual-memory/cp/jbp-submission/screenshot-desktop.png` | CP-FS §1.1, CP-BRD §6 (JBP Cycle context) | Draft |
| TC_JBP_UI_004 | Verify CLOSED status badge renders on closed cycle | High | Current cycle is in CLOSED state | 1. Navigate to `/jbp` 2. Locate Current Cycle card 3. Inspect badge next to cycle title | A red/pink pill badge with text "CLOSED" is visible on the Current Cycle card | `visual-memory/cp/jbp-submission/screenshot-desktop.png` | CP-BRD Key Business Rule #6 (Cycle must be OPEN) | Draft |
| TC_JBP_UI_005 | Verify "Closes on" date displays on the cycle card | Medium | Current cycle has a close date | 1. Navigate to `/jbp` 2. Locate Current Cycle card 3. Read the "Closes on" line | Text "Closes on: [date]" is visible on the card (e.g., "Closes on: 14th May 2026") | `visual-memory/cp/jbp-submission/screenshot-desktop.png` | CP-FS §1.5 Rule #1, CP-BRD Rule #6 | Draft |
| TC_JBP_UI_006 | Verify "Your Status: Not Submitted" displays when CP has not submitted | High | CP has not submitted a JBP for current cycle | 1. Navigate to `/jbp` 2. Locate Current Cycle card 3. Read the "Your Status" line | Text "Your Status: Not Submitted" is visible on the card | `visual-memory/cp/jbp-submission/screenshot-desktop.png` | CP-FS §1.5 Rule #2 (one submission per CP per cycle) | Draft |
| TC_JBP_UI_007 | Verify all three tabs render on JBP Dashboard | High | CP logged in; page loaded | 1. Navigate to `/jbp` 2. Inspect tab strip below page heading 3. Identify all tabs | Three tabs are visible in order: "Current Cycle Entry", "JBP History", "Edit Requests". "Current Cycle Entry" is the default active tab | `visual-memory/cp/jbp-submission/screenshot-desktop.png` | CP-FS §1, §2, §3 (three features map to three tabs) | Draft |
| TC_JBP_UI_008 | Verify Current Cycle Entry tab is active by default | Medium | CP logged in; page loaded | 1. Navigate to `/jbp` 2. Observe which tab is highlighted/selected on load | "Current Cycle Entry" tab is active by default; other two tabs are inactive | `visual-memory/cp/jbp-submission/screenshot-desktop.png` | CP-FS §1 (default landing on submission entry) | Draft |
| TC_JBP_FUNC_001 | Verify JBP History tab is clickable and switches view | Medium | CP logged in; three tabs visible | 1. Navigate to `/jbp` 2. Click the "JBP History" tab 3. Observe view change | "JBP History" tab becomes active; content area updates to show submission history view | `visual-memory/cp/jbp-submission/screenshot-desktop.png` | CP-FS §3 (View Existing JBP Submission) | Draft |
| TC_JBP_FUNC_002 | Verify Edit Requests tab is clickable and switches view | Medium | CP logged in; three tabs visible | 1. Navigate to `/jbp` 2. Click the "Edit Requests" tab 3. Observe view change | "Edit Requests" tab becomes active; content area updates to show edit-request list view | `visual-memory/cp/jbp-submission/screenshot-desktop.png` | CP-FS §2 (Submit an Edit Request) | Draft |
| TC_JBP_BIZ_001 | Verify closed cycle blocks submission with informational message | High | Current cycle is CLOSED; CP did not submit | 1. Navigate to `/jbp` 2. Stay on Current Cycle Entry tab 3. Read main content area | Content area shows "Cycle has Closed" header and message "Submissions are no longer accepted for this cycle." No submission form is rendered. No "Add New JBP Entry" / submit action is available | `visual-memory/cp/jbp-submission/screenshot-desktop.png` | CP-FS §1.5 Rule #1, CP-BRD Rule #6 | Draft |
| TC_JBP_NEG_001 | Verify CP cannot submit JBP for a CLOSED cycle | High | Cycle in CLOSED state | 1. Navigate to `/jbp` on a CLOSED cycle 2. Attempt to locate any submit / new-entry button | No submit button, no submission form, no "Add New JBP Entry" control is exposed in DOM. Submission entry point is fully suppressed | `visual-memory/cp/jbp-submission/screenshot-desktop.png` | CP-FS §1.5 Rule #1, CP-BRD Rule #6 | Draft |
| TC_JBP_UI_009 | Verify page is reachable only when authenticated | High | No active session | 1. Clear cookies/storage 2. Navigate to `https://uat-web.xrportal.in/jbp` | User is redirected to `/login` (CP login page); JBP Dashboard does not render | `visual-memory/cp/jbp-submission/screenshot-desktop.png` (page heading not visible pre-auth) | CP-FS §1.3 Preconditions; CP-FRD §7 Authentication | Draft |
| TC_JBP_UI_OPEN_001 | Verify Open Cycle shows submission form in Current Cycle Entry tab | High | Cycle in OPEN state; CP has not submitted | 1. Navigate to `/jbp` 2. Observe Current Cycle card 3. Observe Current Cycle Entry tab content | Cycle card shows "OPEN" badge (instead of CLOSED). Tab content shows JBP submission form with all 14 fields per CP-FS §1.4 | [STUB-EVIDENCE] — Open Cycle UI not captured in visual-memory | CP-FS §1.1, §1.4 | Draft |
| TC_JBP_FUNC_OPEN_001 | Verify JBP form contains all 14 mandated fields | High | OPEN cycle; CP not yet submitted; form rendered | 1. Open JBP form 2. Enumerate all fields | Form contains: Brokerage to be Earned (dropdown), Net Booking Commitment Units (dropdown), Manpower to Deploy (number + slider), List of Activities (14-option multi-checkbox), Go Live on Digital (multi-checkbox), Total Investment (5 radio ranges), Inserts Required (Y/N), Standees Required (Y/N), Kiosk Required (Y/N), Tele Callers Required (Y/N), SMS Blast (Y/N), WhatsApp Blast (Y/N), Growth Hub (Y/N), Registration Commitment (number) | [STUB-EVIDENCE] | CP-FS §1.4 | Draft |
| TC_JBP_VAL_OPEN_001 | Verify required-field validation blocks submission when fields empty | High | OPEN cycle; form rendered | 1. Open JBP form 2. Leave required fields blank 3. Click Submit | Submit is blocked; validation messages appear on missing required fields; no record is created | [STUB-EVIDENCE] | CP-FS §1.5 Rule #3 | Draft |
| TC_JBP_E2E_OPEN_001 | Verify CP can submit a complete JBP and lands on Thank You page | High | OPEN cycle; CP not yet submitted; all fields valid | 1. Open JBP form 2. Fill all 14 fields with valid values 3. Click Submit | JbpSubmission record created with status=ACTIVE, version=1. CP is redirected to `/jbp/thank-you`. Thank You confirmation page renders | [STUB-EVIDENCE] | CP-FS §1.6 System Actions, CP-BRD §6 step 4 | Draft |
| TC_JBP_BIZ_OPEN_001 | Verify one-submission-per-cycle rule (Add New entry disappears after submit) | High | OPEN cycle; CP has just submitted | 1. Complete and submit a JBP 2. Navigate back to `/jbp` 3. Observe Current Cycle Entry tab | "Add New JBP Entry" / submit button is no longer present. The submitted plan is shown in read-only view. "Your Status" updates from "Not Submitted" to "Submitted" | [STUB-EVIDENCE] | CP-FS §1.5 Rule #2, CP-FS §3.2 Rule #1 | Draft |
| TC_JBP_FUNC_OPEN_002 | Verify submitted plan is shown read-only with version number | Medium | CP has an ACTIVE submission for OPEN cycle | 1. Navigate to `/jbp` 2. Stay on Current Cycle Entry tab 3. Observe form fields and version display | All 14 field values from submission are displayed in read-only mode. Submission version (e.g., "Version 1") and status are visible | [STUB-EVIDENCE] | CP-FS §3.1, §3.2 | Draft |
| TC_JBP_E2E_OPEN_002 | Verify CP can raise an Edit Request on an existing submission | High | CP has submitted JBP; cycle still OPEN | 1. Navigate to `/jbp` 2. Click control to request an edit 3. Fill "Changes requested" and "Revised values" fields 4. Submit edit request | Edit request is created and sent to admin. Request becomes visible in the "Edit Requests" tab with a pending status. Original submission remains unchanged | [STUB-EVIDENCE] | CP-FS §2.1, §2.3, §2.4 Rule #1 | Draft |
| TC_JBP_NEG_OPEN_001 | Verify second JBP submission for same cycle is rejected | High | CP has already submitted for current OPEN cycle | 1. After successful submit, attempt to submit a second JBP for same cycle (via UI or direct route) | Submission is rejected at the UI layer (no entry point) and at the backend (one-active-per-cycle rule). No duplicate JbpSubmission record is created | [STUB-EVIDENCE] | CP-FS §1.5 Rule #2, CP-BRD Rule #5 | Draft |
| TC_JBP_BIZ_OPEN_002 | Verify approved edit request increments version and EXPIRES previous version | High | CP has version 1 ACTIVE submission; admin approves an edit request | 1. CP raises edit request 2. Admin approves it 3. CP re-navigates to `/jbp` and JBP History tab | Submission updated with new field values. New version (e.g., "Version 2") is shown as ACTIVE in History. Previous version is marked EXPIRED in history | [STUB-EVIDENCE] | CP-FS §2.4 Rule #2, CP-BRD Rule #7 | Draft |
| TC_JBP_BIZ_OPEN_003 | Verify rejected edit request preserves original submission | High | CP has ACTIVE submission; admin rejects an edit request | 1. CP raises edit request 2. Admin rejects it with reason 3. CP re-navigates to `/jbp` | Original submission remains unchanged (same version, same values). Rejection notification with reason is visible to CP in Edit Requests tab | [STUB-EVIDENCE] | CP-FS §2.4 Rule #3, Rule #4, Rule #5 | Draft |
| TC_JBP_FUNC_OPEN_003 | Verify Edit Requests tab lists requests with status | Medium | CP has raised at least one edit request | 1. Navigate to `/jbp` 2. Click "Edit Requests" tab 3. Inspect list | Edit Requests tab shows list of requests with status (Pending / Approved / Rejected), date raised, and admin response (if any) | [STUB-EVIDENCE] | CP-FS §2.4 Rules #1, #5 | Draft |
| TC_JBP_FUNC_OPEN_004 | Verify JBP History tab lists all versions across cycles | Medium | CP has at least one submission in history | 1. Navigate to `/jbp` 2. Click "JBP History" tab 3. Inspect list | History tab lists submissions with cycle name, version, status (ACTIVE / EXPIRED), and submission date | [STUB-EVIDENCE] | CP-FS §3, CP-BRD Rule #7 | Draft |
| TC_JBP_NEG_OPEN_002 | Verify edit request cannot be raised once cycle is CLOSED | High | Cycle has transitioned from OPEN to CLOSED; CP had submitted during OPEN | 1. After cycle closes, navigate to `/jbp` 2. Open the submitted plan 3. Attempt to raise edit request | Edit request entry point is not available. CP cannot raise an edit request on a closed cycle | [STUB-EVIDENCE] | CP-FS §2.2 Precondition (cycle must still be OPEN) | Draft |
| TC_JBP_UI_010 | Verify "Your Status" updates to "Submitted" after submission | Medium | CP just submitted JBP successfully | 1. Submit JBP 2. Navigate back to `/jbp` 3. Read Current Cycle card | "Your Status" line on Current Cycle card reads "Submitted" (was "Not Submitted" before) | [STUB-EVIDENCE] (status transitions Submitted/Approved/Rejected not captured) | INDEX.md (Your Status enum), CP-FS §1.6 | Draft |
| TC_JBP_UI_011 | Verify "Your Status" reflects Approved when admin approves edit request | Medium | CP has submission; admin approved an edit request | 1. After approval, navigate to `/jbp` 2. Read Current Cycle card | "Your Status" reads "Approved" | [STUB-EVIDENCE] | INDEX.md (Your Status enum) | Draft |
| TC_JBP_UI_012 | Verify "Your Status" reflects Rejected when admin rejects edit request | Medium | CP has submission; admin rejected edit request | 1. After rejection, navigate to `/jbp` 2. Read Current Cycle card | "Your Status" reads "Rejected" | [STUB-EVIDENCE] | INDEX.md (Your Status enum) | Draft |

---

## Sheet 2 — Automation Candidates

| TC_ID | Module | Type | Automatable | Complexity | Visual Evidence Status | Playwright Suite | Notes |
|-------|--------|------|-------------|------------|------------------------|------------------|-------|
| TC_JBP_UI_001 | JBP Submission | UI | Yes | Low | FULL | ui-ux/cp/jbp-submission.spec.js | Assert h1/h2 text "JBP Dashboard" |
| TC_JBP_UI_002 | JBP Submission | UI | Yes | Low | FULL | ui-ux/cp/jbp-submission.spec.js | Sidebar nav assertion |
| TC_JBP_UI_003 | JBP Submission | UI | Yes | Low | FULL | ui-ux/cp/jbp-submission.spec.js | Filter regex `/current cycle/i` |
| TC_JBP_UI_004 | JBP Submission | UI | Yes | Low | FULL | ui-ux/cp/jbp-submission.spec.js | Filter regex `/closed/i` |
| TC_JBP_UI_005 | JBP Submission | UI | Yes | Low | FULL | ui-ux/cp/jbp-submission.spec.js | Filter regex `/closes on/i` |
| TC_JBP_UI_006 | JBP Submission | UI | Yes | Low | FULL | ui-ux/cp/jbp-submission.spec.js | Filter regex `/not submitted/i` |
| TC_JBP_UI_007 | JBP Submission | UI | Yes | Low | FULL | ui-ux/cp/jbp-submission.spec.js | All three role="tab" assertions |
| TC_JBP_UI_008 | JBP Submission | UI | Yes | Low | FULL | ui-ux/cp/jbp-submission.spec.js | Active-tab attribute check |
| TC_JBP_FUNC_001 | JBP Submission | FUNC | Yes | Low | FULL | e2e/cp/jbp-submission.spec.js | Click and assert active state |
| TC_JBP_FUNC_002 | JBP Submission | FUNC | Yes | Low | FULL | e2e/cp/jbp-submission.spec.js | Click and assert active state |
| TC_JBP_BIZ_001 | JBP Submission | BIZ | Yes | Low | FULL | e2e/cp/jbp-submission.spec.js | Closed-cycle text assertions |
| TC_JBP_NEG_001 | JBP Submission | NEG | Yes | Low | FULL | e2e/cp/jbp-submission.spec.js | Assert no submit button in DOM |
| TC_JBP_UI_009 | JBP Submission | UI | Yes | Low | FULL | e2e/cp/jbp-submission.spec.js | Unauthenticated redirect check |
| TC_JBP_UI_OPEN_001 | JBP Submission | UI | Blocked | Medium | STUB | — | Requires Open-cycle visual capture before automation |
| TC_JBP_FUNC_OPEN_001 | JBP Submission | FUNC | Blocked | Medium | STUB | — | Form field enumeration depends on captured DOM |
| TC_JBP_VAL_OPEN_001 | JBP Submission | VAL | Blocked | Medium | STUB | — | Requires visible validation messages mapping |
| TC_JBP_E2E_OPEN_001 | JBP Submission | E2E | Blocked | High | STUB | — | Full submission flow; needs Open cycle in UAT + field locators |
| TC_JBP_BIZ_OPEN_001 | JBP Submission | BIZ | Blocked | Medium | STUB | — | One-per-cycle assertion |
| TC_JBP_FUNC_OPEN_002 | JBP Submission | FUNC | Blocked | Medium | STUB | — | Read-only view; needs DOM capture |
| TC_JBP_E2E_OPEN_002 | JBP Submission | E2E | Blocked | High | STUB | — | Edit request flow |
| TC_JBP_NEG_OPEN_001 | JBP Submission | NEG | Blocked | High | STUB | — | Duplicate submission rejection |
| TC_JBP_BIZ_OPEN_002 | JBP Submission | BIZ | Blocked | High | STUB | — | Requires admin-side approval (cross-portal) |
| TC_JBP_BIZ_OPEN_003 | JBP Submission | BIZ | Blocked | High | STUB | — | Requires admin-side rejection (cross-portal) |
| TC_JBP_FUNC_OPEN_003 | JBP Submission | FUNC | Blocked | Medium | STUB | — | Edit Requests tab content |
| TC_JBP_FUNC_OPEN_004 | JBP Submission | FUNC | Blocked | Medium | STUB | — | History tab content |
| TC_JBP_NEG_OPEN_002 | JBP Submission | NEG | Blocked | Medium | STUB | — | Cycle-state-dependent gating |
| TC_JBP_UI_010 | JBP Submission | UI | Blocked | Low | STUB | — | Status transition after submit |
| TC_JBP_UI_011 | JBP Submission | UI | Blocked | Low | STUB | — | Status reflects Approved |
| TC_JBP_UI_012 | JBP Submission | UI | Blocked | Low | STUB | — | Status reflects Rejected |

---

## Sheet 3 — Bug Report Template

| Bug ID | TC_ID | Severity | Steps | Actual | Expected | Environment | Status |
|--------|-------|----------|-------|--------|----------|-------------|--------|
| BUG_NNN | TC_JBP_XXX_NNN | Critical / High / Medium / Low | — | — | — | UAT — https://uat-web.xrportal.in/jbp | Open |

---

## Notes

- All Open-cycle TCs are derived from BRD/FRD only and tagged `[STUB-EVIDENCE]`. They MUST not be promoted to automation until Tech Lead Agent re-runs `visual-capture` against an OPEN cycle and updates `visual-memory/cp/jbp-submission/INDEX.md` with the submission form DOM.
- Strapi and LeadSquared are out of scope; no TCs touch CMS-driven content or LSQ sync.
- Admin-side approval/rejection touchpoints (TC_JBP_BIZ_OPEN_002, TC_JBP_BIZ_OPEN_003) are CP-side observable assertions only — admin actions are covered in the Admin JBP Management module TC batch.
