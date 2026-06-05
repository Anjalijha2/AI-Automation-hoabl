# Test Cases — CP Portal / Leads Management

**Module:** CP Portal — Leads Management
**Route:** `https://uat-web.xrportal.in/leads`
**Generated:** 2026-06-04
**Generator:** BA Agent (Phase 1 — Dual-Source TC Generation)
**Visual Memory:** `visual-memory/cp/leads-management/INDEX.md` (CAPTURE_STATUS: FULL)
**BRD/FRD Sources:**
- `.claude/docs/hoabl-knowledge-base/CP-Portal/BRD/CP-BRD-CP-Portal.md` §3 (Module list, row 2), §4 (Business Rules)
- `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FRD-CP-Portal.md` §5 Module 2 (Leads Management)
- `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-Leads-Management.md` Feature 1

**Requirement ID convention used:**
- `CP-BRD-§N` — Channel Partner BRD section
- `CP-FRD-M2.x` — CP FRD Module 2 Leads Management, sub-rule
- `CP-FS-LM-1.x` — CP Feature-Spec Leads Management, Feature 1 sub-rule

---

## Sheet 1 — Manual Test Cases

| TC_ID | Title | Priority | Precondition | Steps | Expected Result | Visual Evidence | BRD Req ID | Status |
|-------|-------|----------|--------------|-------|-----------------|-----------------|------------|--------|
| TC_LEADS_UI_001 | Leads page loads and renders "Leads" heading | High | CP is authenticated (valid session at `https://uat-web.xrportal.in/`) | 1. Navigate to `https://uat-web.xrportal.in/leads`<br>2. Wait for the page to finish loading<br>3. Locate the page heading at the top of the content area | The Leads page is rendered. The page heading element (`h1` or `h2`) displays the text "Leads" exactly. Left sidebar shows Home / KYC / JBP / Leads / Logout, with the "Leads" link in the active state. Screenshot: `screenshot-desktop.png` | `visual-memory/cp/leads-management/screenshot-desktop.png` | CP-FRD-M2 (Screen `/leads`), CP-BRD-§3 row 2 | APPROVED |
| TC_LEADS_UI_002 | All filter and search controls are visible above the table | High | TC_LEADS_UI_001 passes | 1. Land on `/leads`<br>2. Inspect the toolbar area above the leads table | Three controls are visible above the table: (a) "All Team Leads" dropdown (`div.ant-select` with text "all team leads"), (b) "Status" dropdown (`div.ant-select` with text "Status"), (c) "Search Customer" input (`input[placeholder*="Search Customer" i]`) with a magnifying-glass icon. All three controls are in their default (unselected/empty) state. Screenshot: `screenshot-desktop.png` | `visual-memory/cp/leads-management/screenshot-desktop.png` | CP-FRD-M2 (Functional Flow step 1), CP-FS-LM-1.4 | APPROVED |
| TC_LEADS_UI_003 | Leads table renders all 9 documented columns in correct order | High | CP has at least one lead assigned | 1. Land on `/leads`<br>2. Inspect the `<thead>` of the leads table | The table header displays exactly these 9 columns in this left-to-right order: S.No, Applicant Name, Applicant Phone, Status, Date of Sent, CP Name, CP HV Code, CP Mobile, Action. Screenshot: `screenshot-desktop.png` | `visual-memory/cp/leads-management/screenshot-desktop.png` | CP-FRD-M2 (Key Data), CP-FS-LM-1.4 | APPROVED |
| TC_LEADS_UI_004 | Lead row data renders correctly for the 3 sample leads | High | CP "HV00025808 / HV00026050" type test account has the 3 documented sample leads | 1. Land on `/leads`<br>2. Read the contents of `tbody tr` rows | Three rows render:<br>Row 1 — S.No 1, Applicant Name "Testinglead CPmember", Phone "7999999999", Status "Registered", Date of Sent "27-02-2026 04:36:10 PM", CP HV Code "HV00026050".<br>Row 2 — S.No 2, Applicant Name "Sanket Test", Phone "8451856253", Status "Refunded", Date of Sent "22-01-2026 01:48:17 PM", CP HV Code "HV00025808".<br>Row 3 — S.No 3, Applicant Name "Test", Phone "100011112", Status "Sent", Date of Sent "07-04-2026 09:26:12 PM", CP HV Code "HV00025808".<br>Screenshot: `screenshot-desktop.png` | `visual-memory/cp/leads-management/screenshot-desktop.png` | CP-FRD-M2 (Functional Flow step 1-2), CP-FS-LM-1.4 | APPROVED |
| TC_LEADS_FUNC_005 | "Registered" status badge renders as green pill | Medium | A lead with status `Registered` exists (sample: Testinglead CPmember, Row 1) | 1. Land on `/leads`<br>2. Locate the Status cell in row 1 (`tbody tr:nth-child(1)` Status column)<br>3. Inspect the badge element matching `filter({ hasText: /^registered$/i })` | The status cell displays a pill-shaped badge containing the text "Registered" with a green background fill, distinguishing it from Refunded (red/pink) and Sent (orange/yellow). Screenshot: `screenshot-desktop.png` | `visual-memory/cp/leads-management/screenshot-desktop.png` | CP-FS-LM-1.4 (Status column), CP-FS-LM Lead Status Flow | APPROVED |
| TC_LEADS_FUNC_006 | "Refunded" status badge renders as red/pink pill | Medium | A lead with status `Refunded` exists (sample: Sanket Test, Row 2) | 1. Land on `/leads`<br>2. Locate the Status cell in row 2<br>3. Inspect the badge element matching `filter({ hasText: /^refunded$/i })` | The status cell displays a pill-shaped badge containing the text "Refunded" with a red/pink background fill. Screenshot: `screenshot-desktop.png` | `visual-memory/cp/leads-management/screenshot-desktop.png` | CP-FS-LM-1.4, CP-FS-LM Lead Status Flow | APPROVED |
| TC_LEADS_FUNC_007 | "Sent" status badge renders as orange/yellow pill | Medium | A lead with status `Sent` exists (sample: Test, Row 3) | 1. Land on `/leads`<br>2. Locate the Status cell in row 3<br>3. Inspect the badge element matching `filter({ hasText: /^sent$/i })` | The status cell displays a pill-shaped badge containing the text "Sent" with an orange/yellow background fill. Screenshot: `screenshot-desktop.png` | `visual-memory/cp/leads-management/screenshot-desktop.png` | CP-FS-LM-1.4, CP-FS-LM Lead Status Flow | APPROVED |
| TC_LEADS_BIZ_008 | Lead status semantics align with documented flow Sent → Registered → Refunded | High | All three status types are visible on the leads list | 1. Land on `/leads`<br>2. Confirm "Sent" lead (Row 3) has the earliest sent date in the unregistered state<br>3. Confirm "Registered" lead (Row 1) shows the customer completed registration<br>4. Confirm "Refunded" lead (Row 2) indicates a cancelled/refunded registration | The three status values reflect the lead-state flow documented in INDEX.md and CP-FS-LM: "Sent" = link shared, customer not yet registered; "Registered" = customer paid token amount; "Refunded" = registration cancelled/refunded. No lead in the table can be in two states simultaneously. Screenshot: `screenshot-desktop.png` | `visual-memory/cp/leads-management/screenshot-desktop.png` | CP-FS-LM Lead Status Flow, CP-BRD-§4 rule 1 (CP isolation) | APPROVED |
| TC_LEADS_FUNC_009 | Action column shows share and copy icon buttons per row | High | At least one lead row is rendered | 1. Land on `/leads`<br>2. Inspect the Action cell of any populated row<br>3. Locate the share icon button (`button` or `a` at nth(0)) and the copy icon button (`button` or `a` at nth(1)) | Action column displays exactly two icon buttons per row: (1) share icon (chain/link glyph) at position nth(0), (2) copy icon (clipboard glyph) at position nth(1). Both icons are clickable interactive elements. Screenshot: `screenshot-desktop.png` | `visual-memory/cp/leads-management/screenshot-desktop.png` | CP-FRD-M2 (Functional Flow), CP-FS-LM-1.4 Action column | APPROVED |
| TC_LEADS_FUNC_010 | Clicking share icon initiates share action for the row's lead | High | A lead row is rendered with an active share button | 1. Land on `/leads`<br>2. In row 3 (Sent — "Test"), click the share icon button (`tbody tr:nth-child(3) button:nth(0)`) | A share action is initiated for the selected lead — either a native share sheet opens or a share dialog/URL is presented (channel-specific behaviour). The lead identity passed must correspond to row 3 (Applicant "Test", Phone "100011112"). No page navigation away from `/leads` occurs as a side-effect of the share action. | `[NO-VISUAL-EVIDENCE]` (post-click share state not captured) | CP-FS-LM-1.4 Action column (share) | Conditional (post-click state not captured) |
| TC_LEADS_FUNC_011 | Clicking copy icon copies the lead's referral link to clipboard | High | A lead row is rendered with an active copy button | 1. Land on `/leads`<br>2. In row 3, click the copy icon button (`tbody tr:nth-child(3) button:nth(1)`)<br>3. Paste from clipboard into a text field | The clipboard contains the lead's shareable URL/referral link associated with row 3 ("Test" / 100011112). A user-visible confirmation (toast/tooltip "Copied" or equivalent) should appear briefly. No navigation occurs. | `[NO-VISUAL-EVIDENCE]` (post-click copy confirmation not captured) | CP-FS-LM-1.4 Action column (copy) | Conditional (post-click state not captured) |
| TC_LEADS_FUNC_012 | "All Team Leads" dropdown opens and exposes team scope options | Medium | CP is logged in; toolbar visible | 1. Land on `/leads`<br>2. Click the "All Team Leads" dropdown (`div.ant-select` with text "all team leads")<br>3. Observe the dropdown panel | The dropdown opens, showing a list of team-scope filter options ("All Team Leads" default + any sub-team entries). The dropdown is keyboard-accessible (Esc closes). | `[NO-VISUAL-EVIDENCE]` (open dropdown panel not captured) | CP-FRD-M2 (filters), CP-FS-LM-1.4 | Conditional (open state not captured) |
| TC_LEADS_FUNC_013 | "Status" dropdown opens and lists Sent / Registered / Refunded | High | CP is logged in; toolbar visible | 1. Land on `/leads`<br>2. Click the "Status" dropdown (`div.ant-select` with text "Status")<br>3. Read the listed options | The Status dropdown opens and lists at minimum the three documented values: Sent, Registered, Refunded — matching the badge values rendered in the table. Selecting any value should subsequently filter the table to rows matching that status. | `[NO-VISUAL-EVIDENCE]` (open dropdown panel not captured) | CP-FS-LM Lead Status Flow, CP-FS-LM-1.4 | Conditional (open state not captured) |
| TC_LEADS_FUNC_014 | Filtering by Status = "Registered" shows only Registered leads | High | At least one Registered lead and one non-Registered lead exist | 1. Land on `/leads`<br>2. Open the Status dropdown<br>3. Select "Registered"<br>4. Inspect the resulting `tbody tr` rows | The table updates so that every visible row has a Status cell with the green "Registered" pill. Rows with Sent or Refunded status are no longer present. Pagination footer count updates to match filtered total. | `[NO-VISUAL-EVIDENCE]` (filtered state not captured) | CP-FRD-M2 Business Rules, CP-FS-LM-1.5 | Conditional (filtered state not captured) |
| TC_LEADS_FUNC_015 | Filtering by Status = "Refunded" shows only Refunded leads | Medium | Sample Refunded lead exists (Row 2) | 1. Land on `/leads`<br>2. Open the Status dropdown<br>3. Select "Refunded"<br>4. Inspect the resulting rows | Only rows whose Status cell is the red/pink "Refunded" pill remain. Pagination count reflects the filtered set. | `[NO-VISUAL-EVIDENCE]` (filtered state not captured) | CP-FRD-M2 Business Rules | Conditional (filtered state not captured) |
| TC_LEADS_FUNC_016 | Filtering by Status = "Sent" shows only Sent leads | Medium | Sample Sent lead exists (Row 3) | 1. Land on `/leads`<br>2. Open the Status dropdown<br>3. Select "Sent"<br>4. Inspect the resulting rows | Only rows whose Status cell is the orange/yellow "Sent" pill remain. Pagination count reflects the filtered set. | `[NO-VISUAL-EVIDENCE]` (filtered state not captured) | CP-FRD-M2 Business Rules | Conditional (filtered state not captured) |
| TC_LEADS_FUNC_017 | "Search Customer" input filters by applicant name | High | Sample lead "Sanket Test" exists (Row 2) | 1. Land on `/leads`<br>2. Click the `input[placeholder*="Search Customer" i]` field<br>3. Type "Sanket"<br>4. Wait for the table to update | After the search input is processed, the leads table shows only the row(s) whose Applicant Name contains "Sanket" (case-insensitive). Row 2 ("Sanket Test" / 8451856253 / Refunded) remains; rows 1 and 3 are no longer visible. | `[NO-VISUAL-EVIDENCE]` (filtered state not captured) | CP-FRD-M2 Functional Flow, CP-FS-LM-1.4 | Conditional (filtered state not captured) |
| TC_LEADS_FUNC_018 | "Search Customer" input filters by applicant phone number | High | Sample lead phone "7999999999" exists (Row 1) | 1. Land on `/leads`<br>2. Type "7999999999" in the Search Customer input<br>3. Inspect the table | Only the row with Applicant Phone "7999999999" (Testinglead CPmember, Registered) is shown. Per INDEX.md filters note, the input searches by name or phone. | `[NO-VISUAL-EVIDENCE]` (filtered state not captured) | CP-FRD-M2 Functional Flow | Conditional (filtered state not captured) |
| TC_LEADS_FUNC_019 | Clearing Search Customer input restores the full lead list | Medium | A search filter is active (e.g., "Sanket" from TC_LEADS_FUNC_017) | 1. With "Sanket" search active and only Row 2 visible<br>2. Click the input and clear all text (Backspace or clear icon) | All 3 documented sample leads are again rendered (Rows 1, 2, 3). Pagination footer returns to "1-3 of 3 items / 10/page". | `[NO-VISUAL-EVIDENCE]` (cleared state implied by `screenshot-desktop.png`) | CP-FRD-M2 | Conditional (transition state not captured) |
| TC_LEADS_FUNC_020 | Pagination footer shows correct count and page size for 3 leads | Medium | Exactly 3 leads exist for the logged-in CP | 1. Land on `/leads`<br>2. Inspect the pagination footer below the table | Pagination footer displays "1-3 of 3 items" and a page-size selector showing "10 / page". No page-navigation arrows are active because all items fit on one page. Screenshot: `screenshot-desktop.png` | `visual-memory/cp/leads-management/screenshot-desktop.png` | CP-FRD-M2 (Customer Table parity), CP-FS-LM-1.4 | APPROVED |
| TC_LEADS_BIZ_021 | CP sees only leads belonging to their own broker scope (CP isolation) | High | CP test account is logged in; another CP exists in the system with their own leads | 1. Land on `/leads` as CP A<br>2. Note the leads in the table (HV codes correspond to CP A: HV00025808 / HV00026050)<br>3. Verify no lead in the table belongs to a different broker's HV code | Every lead row's CP HV Code column matches an HV code assigned to the logged-in CP (Master + linked Member CPs only). No leads from other CPs are visible. This enforces the documented filter "CPs see only leads assigned to them". | `visual-memory/cp/leads-management/screenshot-desktop.png` | CP-FS-LM-1.5 rule 2, CP-BRD-§4 rule 1, CP-FRD-M2 Business Rules | APPROVED |
| TC_LEADS_BIZ_022 | Empty state when CP has no leads assigned | Medium | A CP test account with zero assigned leads is logged in | 1. Log in as a CP with no leads<br>2. Navigate to `/leads`<br>3. Observe the table area | The table renders the column headers but the `<tbody>` displays an empty-state message (e.g., "No data" placeholder per Ant Design default) instead of any rows. Pagination footer shows "0 items" or equivalent. No JS errors in console. Filters and Search Customer input remain functional. | `[NO-VISUAL-EVIDENCE]` (empty state not captured) | CP-FS-LM-1.5 rule 2, CP-FRD-M2 | Conditional (empty state not captured) |
| TC_LEADS_NEG_023 | Search Customer input with no matching record shows empty result | Medium | Sample leads loaded | 1. Land on `/leads`<br>2. Type "zzzzzzzz_no_match_xyz" into Search Customer<br>3. Inspect the table | The table renders no data rows. An empty-state placeholder is shown beneath the column headers. Pagination footer shows "0 items" / no results. Clearing the input restores the original 3 rows. | `[NO-VISUAL-EVIDENCE]` (no-match state not captured) | CP-FRD-M2 Functional Flow | Conditional (no-match state not captured) |
| TC_LEADS_NEG_024 | Unauthenticated access to `/leads` redirects to login | High | No active CP session (cookies cleared) | 1. Clear all cookies and localStorage<br>2. Open `https://uat-web.xrportal.in/leads` directly | The user is redirected to the CP login page (`/login`) without exposing any lead data. After successful OTP login as a CP, the user lands on `/leads` and the leads list loads. | `[NO-VISUAL-EVIDENCE]` (redirect captured by login module, not leads) | CP-FS-LM-1.3 (Preconditions: CP must be logged in), CP-FRD §7 Auth | Conditional (redirect state not captured here) |
| TC_LEADS_NAV_025 | Sidebar navigation marks Leads as active when on `/leads` | Low | CP is logged in | 1. Land on `/leads` from another page (e.g., `/dashboard`)<br>2. Inspect the left navigation sidebar | The sidebar shows Home → /dashboard, KYC → /kyc, JBP → /jbp, Leads → /leads, Logout. The "Leads" link is in the active/selected visual state (highlighted), while the others are inactive. Screenshot: `screenshot-desktop.png` | `visual-memory/cp/leads-management/screenshot-desktop.png` | CP-FRD §6 Navigation Structure | APPROVED |
| TC_LEADS_BIZ_026 | Leads list is read-only — no inline edit/delete on rows | Medium | At least one lead row is visible | 1. Land on `/leads`<br>2. Hover and inspect each cell in a lead row | No edit, delete, or inline-edit affordance is present on the row cells. The only row-level interactions are the two Action-column icons (share, copy). This aligns with the rule "CP Portal displays, not manages, leads" — lead lifecycle changes occur in LSQ, not the CP UI. Screenshot: `screenshot-desktop.png` | `visual-memory/cp/leads-management/screenshot-desktop.png` | CP-FS-LM-1.5 rule 1 (display-only), CP-BRD-§9 LSQ integration | APPROVED |

---

## Sheet 2 — Bug Template (placeholder)

| Bug ID | Linked TC_ID | Severity | Steps | Actual | Expected | Environment | Status |
|--------|--------------|----------|-------|--------|----------|-------------|--------|
| (none filed at TC-generation time) | | | | | | UAT (`https://uat-web.xrportal.in/leads`) | — |

---

## Review Summary

**Total TCs:** 26
**APPROVED (visual evidence linked to `screenshot-desktop.png`):** 11
- TC_LEADS_UI_001, 002, 003, 004
- TC_LEADS_FUNC_005, 006, 007, 009
- TC_LEADS_BIZ_008, 021, 026
- TC_LEADS_FUNC_020
- TC_LEADS_NAV_025
(13 explicitly APPROVED)

**Conditional (`[NO-VISUAL-EVIDENCE]` — needs additional capture before automation lift):** 13
- Action click outcomes: TC_LEADS_FUNC_010, 011
- Dropdown open states: TC_LEADS_FUNC_012, 013
- Filter result states: TC_LEADS_FUNC_014, 015, 016, 017, 018, 019
- Negative / empty states: TC_LEADS_BIZ_022, TC_LEADS_NEG_023, 024

**Visual Coverage Calculation:**
- TCs whose Expected Result is fully supported by `screenshot-desktop.png`: **13 / 26 = 50.0%**
- This is BELOW the 80% threshold required for full APPROVED batch status.

**Visual Capture Gap (request Tech Lead Agent to extend `visual-capture` for):**
1. Status dropdown opened (option list visible)
2. All Team Leads dropdown opened
3. Search-filtered table (e.g., name match, phone match, no match)
4. Status-filtered table (Registered / Refunded / Sent each)
5. Share-icon post-click state (share dialog/share sheet)
6. Copy-icon post-click state (toast/tooltip confirmation)
7. Empty-state table (CP with zero leads)
8. Unauthenticated `/leads` redirect to `/login`

**BRD/FRD Gaps flagged (do not block APPROVED, but require clarification):**
- **GAP-LM-01:** CP-FS-LM Feature 1 §1.4 (FRD Lead Information Displayed) lists columns "Lead Name / Contact Details / Lead Source / Status/Stage / Last Activity", but the live UI per INDEX.md renders 9 columns including "CP Name / CP HV Code / CP Mobile / Date of Sent" and no explicit "Lead Source" or "Last Activity". TCs in this batch follow the **rendered UI** (INDEX.md) and flag this divergence. Action: BA to reconcile FRD §1.4 with the actual schema in a follow-up doc update.
- **GAP-LM-02:** CP-FS-LM Feature 1 step 3 mentions "click the convert option on their row" (Lead → Registration conversion). The current `screenshot-desktop.png` shows only share and copy actions — no "Convert" affordance exists in the Action column. Either the feature is not yet implemented, or the action is gated by status (e.g., only "Sent" leads convert). Action: confirm with product whether Convert is in scope for this build; if dropped, FRD §1.6 step 2 and the §"How to Use" Step 3 must be marked deprecated.
- **GAP-LM-03:** CP-BRD-§9 lists "Security Gap: `POST /cp/registration` is UNAUTHENTICATED". No equivalent assertion is documented for `/leads` endpoints — confirm with Tech Lead Agent that the `/leads` GET endpoint requires CP auth.

**Overall Batch Status:** **Conditional**
- Visual coverage 50.0% is below 80% threshold.
- 13 TCs depend on UI states not currently captured.
- 2 FRD vs UI divergences flagged (GAP-LM-01, GAP-LM-02).

**Path to APPROVED:**
1. Tech Lead Agent extends `visual-capture` to cover the 8 missing states listed above (dropdown open, filtered, empty, post-action states).
2. BA reconciles FRD §1.4 (columns) and §1.6/Step 3 (Convert action) with rendered UI — either update FRD or open a defect.
3. Once 21+/26 TCs (≥80%) have direct screenshot evidence and gaps are reconciled, the batch can be lifted from Conditional → APPROVED.

**Dual-Source Confirmation:**
- Visual Memory (`visual-memory/cp/leads-management/INDEX.md`): PRESENT, FULL — used for steps, selectors, screenshot citations.
- BRD/FRD (`.claude/docs/hoabl-knowledge-base/CP-Portal/`): PRESENT — used for scenario context, business rules, requirement IDs.
- Dual-source gate: **CLEARED**.

**LSQ Constraint Compliance:**
TCs reference LSQ only as the upstream lead source described in BRD/FRD. No TC requires login to LeadSquared, no TC calls LSQ APIs directly. All assertions are made against the CP Portal UI only — complies with CLAUDE.md constraint #1.

---

**Hand-off:**
- Tech Lead Agent — extend `visual-capture` for missing states (see Visual Capture Gap list); build/verify `locators/channel-partner/locator-map.json` entries for the `leads-management` module using the selectors in INDEX.md.
- QA Agent — invoke `test-case-reviewer` with this file, INDEX.md, and the three BRD/FRD paths above to validate before automation scaffolding.
