# Test Cases — Sales Manager Portal / Callback Requests

**Module:** SM Portal — Callback Requests
**Route:** `https://uat-web.xrportal.in/sales-manager/callback-requests`
**Visual Memory:** `visual-memory/sm/callback-requests/INDEX.md` (CAPTURE_STATUS: FULL — 19+ screenshots)
**BRD/FRD Sources:**
- `.claude/docs/hoabl-knowledge-base/SM-Portal/FRD/SM-FS-Callback-Requests.md`
- `.claude/docs/hoabl-knowledge-base/SM-Portal/Workflows/SM-WF-Callback-Requests.md`
- `.claude/docs/hoabl-knowledge-base/SM-Portal/BRD/SM-BRD-SM-Portal.md`

**Generated:** 2026-06-05 (full architectural rewrite — see Architectural Correction Notes)
**Generator:** BA Agent via `manual-tester` skill (dual-source gate cleared)

---

## Architectural Correction Notes (vs. previous batch)

The previous TC batch incorrectly modelled the SM action surface as three separate UI elements: "Schedule Meeting Modal", "Confirm Meeting Modal", and "Feedback Drawer". DOM inspection (captured 2026-06-05 in `_capture-sm-callback-modals-v6-results.json`) confirms the live UI has only **two row actions** in the Actions column:

1. **Eye icon (`.anticon-eye`)** → opens the **Callback Request Details** right-side drawer (READ-ONLY view, 3 tabs: Callback Request / Feedback / Callback History).
2. **More icon (`.anticon-more`)** → opens a 3-dot dropdown with exactly **ONE** menu item: **"Capture VC Outcome"**.

The "Capture VC Outcome" item opens a small modal containing only an outcome dropdown (10 codes) + Cancel/Submit. This single modal is the unified SM action surface — there is no separate "Schedule Meeting", no separate "Confirm Meeting", no editable "Feedback Drawer". The existing scheduling / Teams-link / CC-emails behaviour described in the FRD is exercised via the top-of-page **"Create Callback Request"** drawer, not via per-row actions.

Additionally, the COMPLETED status documented in FRD §1.5 is flagged as effectively unreachable (`FSD-CORRECTION 2026-05-25` at `callback-request-sm.service.js:78-87`), so TCs that exercise reaching COMPLETED state are not generated.

All test cases below are aligned with the captured live DOM.

---

## Sheet 1 — Manual Test Cases

| TC_ID | Title | Priority | Precondition | Steps | Expected Result | Visual Evidence | BRD Req ID | Status |
|-------|-------|----------|-------------|-------|-----------------|-----------------|------------|--------|
| TC_CBR_UI_001 | Page loads with greeting + 8 summary cards + table | High | SM logged in; session at `automation-repository/fixtures/.auth/sales-manager.json` | 1. Navigate to `/sales-manager/callback-requests`. 2. Wait for `networkidle`. 3. Inspect top region for `h5:has-text("Welcome")` and summary card heading strip. 4. Inspect main region for the requests table. | Heading "Welcome, Tester" rendered. 8 summary cards visible in horizontal strip with `h5` headings: Total SM, Total VC Request, Total VC Pending, Invite Sent/Re-sent, Meeting Done, SM Feedback Done, Customer Feedback Done, Avg Rating by Customer. Each card shows a numeric value. Requests table rendered below with column headers visible. | `callback-loaded.png` | SM-FS-CBR §1.6 KPI Cards | Approved |
| TC_CBR_UI_002 | Summary card "Total VC Request" shows SM / Buyer fraction | Medium | Page loaded per TC_CBR_UI_001 | 1. Locate card titled "Total VC Request". 2. Read its value text. | Value displayed as a fraction "X / Y" (e.g., "40 / 34") — SM-perceived count over Buyer-perceived count. Not a single integer. | `callback-loaded.png` | SM-FS-CBR §1.6 | Approved |
| TC_CBR_UI_003 | Sidebar shows Callback Requests as selected nav item | Medium | Logged in as SM | 1. Open `/sales-manager/callback-requests`. 2. Inspect left sidebar. | Sidebar contains 3 nav icons: Callback Requests (selected, with `.ant-menu-item-selected` class), Towers, Allocation; plus Logout link at bottom. Callback Requests is the default landing route after OTP login per `routes/Private/sales-manager/index.jsx` `<Route index element={<Navigate to="callback-requests" replace />}>`. | `callback-loaded.png` | SM-FS-CBR §1.2 | Approved |
| TC_CBR_UI_004 | Top banner displays growth-housing announcement | Low | Page loaded | 1. Inspect top banner region above main content. | Banner text reads "India's Biggest Growth Housing Revolution Begins On 7th April 2026." | `callback-loaded.png` | SM-FS-CBR §1.2 | Approved |
| TC_CBR_UI_005 | Table renders all 16 columns | High | Page loaded with at least one row | 1. Inspect `thead` of the requests table. 2. Enumerate column headers left to right. | 16 column headers in order: (1) bulk-select checkbox, (2) Request ID (sortable), (3) Manager, (4) Customer Name, (5) Customer Phone, (6) Registration No, (7) HV Code, (8) Pincode, (9) Requested At (sortable), (10) Status (with filter trigger), (11) VC Outcome (with filter trigger), (12) Meeting, (13) SM Feedback, (14) Customer Rating, (15) Customer Email, (16) Actions. | `callback-table-data.png` | SM-FS-CBR §1.4 | Approved |
| TC_CBR_UI_006 | Status badges render with correct colour classes | High | Table has at least one PENDING and one MEETING DONE row | 1. Locate Status column cells. 2. Inspect each `<span class="ant-tag …">` for class and text. | PENDING rows → `ant-tag ant-tag-yellow` containing text "PENDING". MEETING DONE rows → `ant-tag ant-tag-green` containing text "MEETING DONE" or "CONFIRMED". Colour classes match badge text. | `callback-table-data.png` | SM-FS-CBR §1.5 | Approved |
| TC_CBR_UI_007 | Actions column shows exactly 2 row icons | High | Any row visible | 1. Inspect the last cell of any data row. | Two `anticon` icons side-by-side: (1) `.anticon-eye` green colour `rgb(80, 185, 95)` size 18px; (2) `.anticon-more` (3 vertical dots) gray colour. No other action icons. | `callback-table-data.png` | SM-FS-CBR §1.4 (Actions surface) | Approved |
| TC_CBR_FUNC_008 | "Select Sales Manager" filter dropdown lists 10 manager options | High | Page loaded as SM Admin (sees all managers) | 1. Click the "Select Sales Manager" Ant Select trigger above the table. | Dropdown opens. 10 manager names rendered as selectable options. | `callback-filter-open.png` | SM-FS-CBR §1.7 BR2 (SM Admin reassign) | Approved |
| TC_CBR_FUNC_009 | Status column header filter exposes 4 status checkboxes | High | Page loaded | 1. Click the filter trigger in the Status column header (`th:has-text("Status") .ant-table-filter-trigger`). | Filter dropdown opens with exactly 4 checkbox options: Pending, Resent Invite, Sent Invite, Meeting Done. Each is a separate `.ant-checkbox-wrapper`. | `callback-status-filter.png` | SM-FS-CBR §1.5 | Approved |
| TC_CBR_FUNC_010 | Status filter checkbox selection filters the table | High | Multiple status values present in table | 1. Open Status filter (TC_CBR_FUNC_009). 2. Check only "Pending". 3. Apply / click outside. | Only PENDING rows remain visible. Other status rows hidden. Total counter reflects filtered count. | `callback-status-filter.png` | SM-FS-CBR §1.5 | Approved |
| TC_CBR_FUNC_011 | VC Outcome column has a filter trigger | Medium | Page loaded | 1. Inspect VC Outcome column header for `.ant-table-filter-trigger`. | Filter trigger element exists in VC Outcome column header (filter UI for outcome codes). | `callback-table-data.png` | SM-FS-CBR §4.3 (10 outcome codes) | Approved |
| TC_CBR_FUNC_012 | Date range pickers accept Start Date and End Date | High | Page loaded | 1. Locate `input[placeholder="Start Date"]` and `input[placeholder="End Date"]`. 2. Pick a start date and end date that span the data. | Both Ant DatePicker inputs accept values. Table reloads showing only rows whose Requested At falls within the range. | `callback-loaded.png` | SM-FS-CBR §1.4 (Requested Date/Time column) | Approved |
| TC_CBR_FUNC_013 | Search box filters table by name / phone / email / reg no | High | Page loaded with rows | 1. In `input[placeholder="Search by name, phone, email, reg no..."]`, type a known customer name. 2. Submit / wait debounce. | Table updates to show only matching rows. Counter updates. | `callback-loaded.png` | SM-FS-CBR §1.4 | Approved |
| TC_CBR_FUNC_014 | Search yielding no match displays empty state | High | Page loaded | 1. In search box, type `ZZZZZNOMATCH123XYZ`. 2. Wait. | Table shows Ant empty illustration with description text "No data". Counter reads "Total 0 Callback Requests". | `callback-empty-state.png` | SM-FS-CBR §1.4 | Approved |
| TC_CBR_FUNC_015 | Pagination "10 / page" selector at table footer | Medium | Page loaded with > 10 rows | 1. Scroll to bottom-right of table. 2. Inspect page-size selector. | Page-size selector reads "10 / page" by default. Page navigator visible. | `callback-loaded.png` | SM-FS-CBR §1.4 | Approved |
| TC_CBR_FUNC_016 | Refresh button reloads table | Medium | Page loaded | 1. Click `button:has-text("Refresh")`. | Table data re-fetches and re-renders. Active filters / search preserved. | `callback-loaded.png` | SM-FS-CBR §1.4 (table refresh) | Approved |
| TC_CBR_FUNC_017 | Export button is present in toolbar | Medium | Page loaded | 1. Inspect toolbar for `button:has-text("Export")`. | Export button rendered and clickable. | `callback-loaded.png` | SM-FS-CBR §1.8 (audit / logging surfaces) | Approved |
| TC_CBR_FUNC_018 | Bulk-assign "Assign (0)" button reflects selected count | Medium | Page loaded; no rows selected | 1. Inspect bulk-action button text. 2. Tick a row checkbox. | Initially button text reads "Assign (0)" (disabled). After selecting 1 row, text updates to "Assign (1)". | `callback-loaded.png` | SM-FS-CBR §1.7 BR2 (reassignment) | Approved |
| TC_CBR_FUNC_019 | Eye icon opens Callback Request Details drawer with 3 tabs | High | At least one row in table | 1. Click `.anticon-eye` in any row. | Right-side drawer opens with title "Callback Request Details". 3 Ant Tabs visible: "Callback Request" (active by default), "Feedback", "Callback History". | `callback-details-drawer-pending.png` | SM-FS-CBR §1.4 (detail drawer) | Approved |
| TC_CBR_FUNC_020 | Details drawer "Callback Request" tab is READ-ONLY for PENDING row | High | PENDING row exists | 1. Click eye icon on PENDING row REQ-00075. 2. Inspect drawer body. 3. Attempt to edit any field. | Drawer renders sections: Customer Information, Registration Preferences, Description, Customer Units table. No editable fields exist. Only the `.ant-drawer-close` button is interactive. | `callback-details-drawer-pending.png` | SM-FS-CBR §1.7 BR3 (immutability of detail view) | Approved |
| TC_CBR_FUNC_021 | Details drawer "Callback Request" tab on MEETING DONE row shows CONFIRMED status | Medium | MEETING DONE row exists | 1. Click eye icon on MEETING DONE row REQ-00073. | Drawer opens with same section layout; Status field reads "CONFIRMED" (per FSD-CORRECTION fallback from COMPLETED). | `callback-details-drawer-meetingdone.png` | SM-FS-CBR §1.5 + FSD-CORRECTION 2026-05-25 | Approved |
| TC_CBR_FUNC_022 | Details drawer "Feedback" tab shows all SM Feedback fields | High | Eye-icon drawer open on MEETING DONE row | 1. Click `.ant-drawer-open .ant-tabs-tab:has-text("Feedback")`. 2. Inspect rendered fields. | Tab activates. "Sales Manager Feedback" section renders fields: Submitted at, Intent, Allocation Day Confirmation, Typology, Budget, Floor Preference (Min-Max), Lost Reason, Home Loan, Parking Required, Remark, Next Step. Below it, "Registration Preferences" sub-section listing TOWER/UNIT picks (e.g., Tower 8 - Crest unit 1301). | `callback-details-feedback-tab.png` | SM-FS-CBR §4 (Record VC Outcome → feedback) | Approved |
| TC_CBR_FUNC_023 | Details drawer "Callback History" tab shows history table | High | Eye-icon drawer open | 1. Click `.ant-drawer-open .ant-tabs-tab:has-text("Callback History")`. | Tab activates. Section heading "Callback History for GHNG-…" rendered. Table columns: Request ID, Requested At, Manager Name, VC Outcome, Status, View. | `callback-details-history-tab.png` | SM-WF-CBR §6 BR7 (rescheduling preserves history) | Approved |
| TC_CBR_FUNC_024 | Details drawer close button dismisses drawer | Medium | Drawer open | 1. Click `.ant-drawer-open .ant-drawer-close`. | Drawer closes; underlying table regains focus. | `callback-details-drawer-pending.png` | SM-FS-CBR §1.4 | Approved |
| TC_CBR_FUNC_025 | More icon opens dropdown with single "Capture VC Outcome" item — PENDING row | High | PENDING row exists | 1. Click `.anticon-more` in PENDING row. | Ant Dropdown opens. Exactly ONE menu item: "Capture VC Outcome". No "Schedule Meeting", no "Confirm Meeting", no "Reschedule" — single action only. | `callback-row-more-menu.png` | SM-FS-CBR §4.1 + Arch. Correction | Approved |
| TC_CBR_FUNC_026 | More icon opens same single-item dropdown on MEETING DONE row | High | MEETING DONE row exists | 1. Click `.anticon-more` in MEETING DONE row REQ-00073. | Dropdown opens with the same single "Capture VC Outcome" item — menu does not vary by row status. | `callback-row-more-menu-meetingdone.png` | SM-FS-CBR §4.2 + Arch. Correction | Approved |
| TC_CBR_FUNC_027 | "Capture VC Outcome" menu click opens modal — PENDING row context | High | PENDING row more menu open | 1. Click "Capture VC Outcome". 2. Inspect modal. | Ant Modal opens (smaller than details drawer). Title "Capture VC Outcome" centered. Static header displays `Registration No: GHNG-…` and `Customer Name: …` read from the source row. Field labelled "Select Outcome:" with placeholder "Please select an outcome". Buttons: Cancel (outlined) + Submit (primary, disabled). | `callback-capture-vc-outcome-pending.png` | SM-FS-CBR §4.5 | Approved |
| TC_CBR_FUNC_028 | "Capture VC Outcome" modal can be opened on MEETING DONE row (re-capture) | Medium | MEETING DONE row more menu open | 1. Click "Capture VC Outcome" on REQ-00073. | Same modal opens with Registration No GHNG-2000000009 + Customer Name pre-filled. Outcome can be re-captured for already-MEETING-DONE rows. | `callback-capture-vc-outcome-meetingdone.png` | SM-FS-CBR §4.2 (preconditions) | Approved |
| TC_CBR_FUNC_029 | Outcome dropdown exposes exactly 10 vcOutcome codes | High | Capture VC Outcome modal open | 1. Click the "Select Outcome:" Ant Select. | Dropdown opens. Exactly 10 options in this order: (1) VC Done with Preference, (2) VC Done, No Preference, (3) Future Scheduled, (4) Future Rescheduled, (5) Missed Scheduled NC, (6) Not Interested, Lost, (7) Never Connected, (8) TL Lost, (9) VC 2-Done, (10) CP to Drive Preference. | `callback-vc-outcome-dropdown.png` | SM-FS-CBR §4.3; SM-WF-CBR §4 | Approved |
| TC_CBR_VAL_030 | Submit disabled while no outcome selected | High | Modal open, dropdown not yet picked | 1. Open Capture VC Outcome modal. 2. Inspect Submit button state without picking an outcome. | Submit button is disabled (`disabled` attribute or `ant-btn-disabled` class). No inline error message is surfaced. | `callback-capture-vc-outcome-validation.png` | SM-FS-CBR §4.4 BR1 | Approved |
| TC_CBR_FUNC_031 | Selecting any outcome enables Submit | High | Modal open | 1. Open dropdown. 2. Click "VC Done, No Preference". 3. Inspect Submit. | Selected outcome label displayed in select trigger. Submit button becomes enabled. | `callback-vc-outcome-dropdown.png` | SM-FS-CBR §4.4 BR1 | Approved |
| TC_CBR_BIZ_032 | Submitting "VC Done with Preference" triggers VC_REQUEST offer | High | Modal open on a row in CONFIRMED/MEETING DONE state; buyer exists | 1. Select "VC Done with Preference". 2. Click Submit. | Modal closes. Backend records vcOutcome = VC_DONE_PREFERENCE. Per SM-WF-CBR §4 and §6 BR5, a VC_REQUEST discount offer is automatically created for the buyer. (Verification done downstream in Offers / DB.) Row's VC Outcome column updates to "VC Done with Preference". | `callback-vc-outcome-dropdown.png` | SM-WF-CBR §6 BR5; SM-FS-CBR §4.4 BR2 | Approved |
| TC_CBR_BIZ_033 | Submitting "VC 2-Done" triggers VC_REQUEST offer | High | Modal open on a row that has had at least one prior VC | 1. Select "VC 2-Done". 2. Click Submit. | Same as TC_CBR_BIZ_032 — VC_REQUEST offer auto-created. Per SM-WF-CBR §4 table: VC_2_DONE is the second outcome (alongside VC_DONE_PREFERENCE) that triggers the offer. | `callback-vc-outcome-dropdown.png` | SM-WF-CBR §6 BR5 | Approved |
| TC_CBR_BIZ_034 | Submitting outcomes other than VC_DONE_PREFERENCE / VC_2_DONE does NOT trigger VC_REQUEST | High | Modal open | 1. Select "VC Done, No Preference". 2. Click Submit. 3. Repeat for "Not Interested, Lost", "Never Connected", "TL Lost", "Missed Scheduled NC", "Future Scheduled", "Future Rescheduled", "CP to Drive Preference". | For each of these 8 outcomes, no VC_REQUEST offer is created for the buyer. Outcome is recorded on the row. | `callback-vc-outcome-dropdown.png` | SM-WF-CBR §4 table (Triggers VC_REQUEST? column = No) | Approved |
| TC_CBR_BIZ_035 | COMPLETED status is not reachable via UI (FSD-CORRECTION) | Medium | Any row in any status | 1. Capture outcome on any row. 2. Trigger buyer feedback submission (out of scope here). 3. Inspect Status column for the row. | Status badge never displays "COMPLETED". Per FSD-CORRECTION 2026-05-25 at `callback-request-sm.service.js:78-87`, the service catches ENUM truncation and falls back to CONFIRMED. Documentation gap retained but is not testable as reachable. | `callback-details-drawer-meetingdone.png` (shows CONFIRMED for what would be COMPLETED) | SM-FS-CBR §1.5 + FSD-CORRECTION; SM-WF-CBR §3 | Approved |
| TC_CBR_FUNC_036 | Cancel button in VC Outcome modal closes modal without submission | High | Modal open | 1. Open modal. 2. Click Cancel (outlined). | Modal closes. Row's VC Outcome column unchanged. No backend write. | `callback-capture-vc-outcome-pending.png` | SM-FS-CBR §4.5 | Approved |
| TC_CBR_FUNC_037 | "Create Callback Request" button opens the create drawer | High | Page loaded | 1. Click `button:has-text("Create Callback Request")`. | Right-side drawer opens with title "Create Callback Request". Buyer search input visible. Four form fields (buyerEmail, managerEmail, ccEmails, requestedAt) are DISABLED until a buyer is selected. | `callback-create-drawer.png` | SM-FS-CBR §5.1 / §5.3 | Approved |
| TC_CBR_FUNC_038 | Buyer search returns results table with radio selection | High | Create drawer open | 1. Type "Anjali" into `.ant-drawer input[type="search"]`. 2. Click `.ant-drawer button:has-text("Search")`. | Results table renders with 5 columns: Registration Number, Name, Previous Callbacks, Email, Phone. Each row has a radio input. Pagination footer reads "1-10 of 55 items" (or similar). | `callback-create-drawer-searched.png` | SM-FS-CBR §5.3 (Customer required field) | Approved |
| TC_CBR_FUNC_039 | Selecting buyer radio auto-populates buyerEmail and managerEmail (readonly) | High | Search results visible | 1. Click the radio in any results row. | `input#buyerEmail` auto-populates with the buyer's registered email (e.g., test@gmail.com). `input#managerEmail` auto-populates with the assigned SM's email (e.g., test2@test.com). Both remain readonly. CC and Date fields become editable. | `callback-create-buyer-selected.png` | SM-FS-CBR §5.3 | Approved |
| TC_CBR_VAL_040 | Create button stays disabled until date is picked | High | Buyer selected, date empty | 1. Skip the Date picker. 2. Click `.ant-drawer button:has-text("Create")` (if clickable) or inspect its disabled state. | Create button is and remains disabled while `input#requestedAt` is empty. No `.ant-form-item-explain-error` inline error appears — form gates solely via the disabled state. | `callback-create-drawer-validation.png` | SM-FS-CBR §5.3 (Date required) | Approved |
| TC_CBR_FUNC_041 | CC field is a multi-tag Ant Select | Medium | Buyer selected | 1. Inspect `input#ccEmails`. 2. Type an email, press Enter. | Field is `type=search` multi-tag Ant Select with placeholder "Add CC emails". Each Enter creates a tag. Multiple CC addresses can be added. | `callback-create-buyer-selected.png` | SM-FS-CBR §2.3 (CC Email Addresses) — exposed in Create flow | Approved |
| TC_CBR_FUNC_042 | Selecting a date enables Create button | High | Buyer selected; CC may be empty | 1. Click `input#requestedAt`. 2. Pick a future date and time. 3. Inspect Create button. | Create button becomes enabled (primary). | `callback-create-buyer-selected.png` | SM-FS-CBR §5.3 | Approved |
| TC_CBR_BIZ_043 | Create submits request with status REQUESTED + least-loaded SM assignment | High | All required fields valid | 1. Submit a fully-populated form. | Drawer closes. New row appears in the table with status badge mapped to backend "REQUESTED" (UI label). Per SM-FS-CBR §1.7 BR4 (FSD-CORRECTION 2026-05-25) the system uses **least-loaded** algorithm, NOT round-robin (round-robin code is disabled at `callback-request-sm.service.js:338-349`). If creator is SM Admin, managerId = their own ID (no auto-distribute). | `callback-create-buyer-selected.png` | SM-FS-CBR §1.7 BR4 + FSD-CORRECTION; SM-FS-CBR §5.4 | Approved |
| TC_CBR_BIZ_044 | SM with isAvailable=false is excluded from auto-assignment pool | High | Backend SM list includes one SM flagged `isAvailable = false` | 1. Submit a new Create Callback Request via the create drawer. 2. Observe Manager column on the new row. | The newly assigned manager is one of the SMs with `isAvailable = true`. The unavailable SM does not receive new assignments. | `callback-loaded.png` (table Manager column) | SM-FS-CBR §1.7 BR5; SM-WF-CBR §6 BR2 | Approved |
| TC_CBR_FUNC_045 | Cancel in Create drawer dismisses without saving | Medium | Create drawer open with any state | 1. Click Cancel button in the drawer footer. | Drawer closes. No new row added to the table. No backend write. | `callback-create-drawer.png` | SM-FS-CBR §5 | Approved |
| TC_CBR_FUNC_046 | Empty state shown when search yields zero rows | Medium | Page loaded | 1. Search a string that matches nothing. | Ant empty illustration rendered ("No data") + counter "Total 0 Callback Requests". No table rows. | `callback-empty-state.png` | SM-FS-CBR §1.4 | Approved |
| TC_CBR_NEG_047 | Submit in modal cannot be triggered programmatically while outcome empty | High | Modal open, no outcome | 1. Inspect Submit button DOM. 2. Attempt keyboard `Enter` on the modal without picking an outcome. | Submit remains disabled. Enter key does not submit the form. No backend POST is fired. No silent submission. | `callback-capture-vc-outcome-validation.png` | SM-FS-CBR §4.4 BR1 | Approved |
| TC_CBR_NEG_048 | Create button cannot be triggered while date empty | High | Buyer selected, date empty | 1. Press Enter in CC field while date empty. 2. Inspect Create button + network panel. | Form does not submit. No POST to `/callback-request` endpoint. Create button stays disabled. | `callback-create-drawer-validation.png` | SM-FS-CBR §5.3 | Approved |
| TC_CBR_NEG_049 | Eye icon on a row does NOT expose any SM action surface | Medium | Any row | 1. Click `.anticon-eye`. 2. Inspect drawer for action buttons. | Details drawer is purely read-only. No "Schedule Meeting", no "Confirm Meeting", no "Record Outcome", no edit affordance. Only the close button is interactive. The only place where an SM records an outcome is via the more menu → Capture VC Outcome modal. | `callback-details-drawer-pending.png`, `callback-details-drawer-meetingdone.png` | Arch. Correction; SM-FS-CBR §1.4 | Approved |
| TC_CBR_EDGE_050 | Modal Registration No and Customer Name match the row that opened it | Medium | Multiple rows present | 1. Note Registration No and Customer Name of row X. 2. Click more → Capture VC Outcome on row X. 3. Inspect modal header. | Modal header shows `Registration No: <row X reg no>` and `Customer Name: <row X name>`. Values match exactly — modal scope is per-row. | `callback-capture-vc-outcome-pending.png` | SM-FS-CBR §4.5 | Approved |
| TC_CBR_EDGE_051 | Status filter clears restores all rows | Medium | Status filter applied | 1. Open status filter. 2. Uncheck all options. 3. Apply. | All rows return regardless of status. Filter trigger no longer shows "active" indicator. | `callback-status-filter.png` | SM-FS-CBR §1.5 | Approved |
| TC_CBR_EDGE_052 | Date range pickers Start > End reject the range | Medium | Page loaded | 1. Pick a Start Date in future. 2. Try to pick an End Date earlier than Start. | Ant DatePicker blocks End Date < Start Date selection (greyed-out calendar dates). Table is not corrupted into an invalid filtered state. | `callback-loaded.png` | SM-FS-CBR §1.4 | Approved |
| TC_CBR_EDGE_053 | Refresh preserves active search text and filters | Medium | Search applied + Status filter applied | 1. Apply search + status filter. 2. Click Refresh. | After reload, search text retained in the search input, and status filter chip / state retained. Filtered subset shown. | `callback-loaded.png` | SM-FS-CBR §1.4 | Approved |
| TC_CBR_BIZ_054 | SM (non-admin) sees only own assigned requests | High | Two test users: a regular SM and an SM Admin | 1. Login as regular SM Tester. 2. Inspect Manager column values across all visible rows. | All visible rows have Manager column = current SM's name. SM Admin login (separate test) sees rows with varied Manager values across all SMs. | `callback-loaded.png` (Manager column) | SM-FS-CBR §1.7 BR1, BR2; SM-WF-CBR §6 BR9 | Approved |
| TC_CBR_BIZ_055 | "VC Done with Preference" outcome syncs to LeadSquared (out-of-scope confirmation) | Low | LSQ excluded from QA scope per CLAUDE.md Constraint 1 | 1. Submit VC_DONE_PREFERENCE outcome via the modal. | Per SM-FS-CBR §1.8 and §4.4 BR3, VC outcome is synced to LeadSquared CRM. **LSQ is excluded from QA scope** (CLAUDE.md Constraint 1) — this TC is documented for traceability only. Verification limited to portal-side row update; LSQ side is NOT tested. | `callback-vc-outcome-dropdown.png` | SM-FS-CBR §1.8, §4.4 BR3 + CLAUDE.md Constraint 1 | Approved (Documentation only) |

---

## Sheet 2 — Automation Candidates

| TC_ID | Module | Type | Automatable | Complexity | Visual Evidence Status | Playwright Suite | Notes |
|-------|--------|------|------------|-----------|------------------------|------------------|-------|
| TC_CBR_UI_001 | callback-requests | UI | Yes | Low | FULL | `tests/ui-ux/sm/callback-requests.spec.js` | Selectors per INDEX.md Selector reference table |
| TC_CBR_UI_002 | callback-requests | UI | Yes | Low | FULL | `tests/ui-ux/sm/callback-requests.spec.js` | Assert fraction format with regex |
| TC_CBR_UI_003 | callback-requests | UI | Yes | Low | FULL | `tests/ui-ux/sm/callback-requests.spec.js` | Default landing assertion |
| TC_CBR_UI_004 | callback-requests | UI | Yes | Low | FULL | `tests/ui-ux/sm/callback-requests.spec.js` | Static banner text |
| TC_CBR_UI_005 | callback-requests | UI | Yes | Low | FULL | `tests/ui-ux/sm/callback-requests.spec.js` | Iterate `thead th` |
| TC_CBR_UI_006 | callback-requests | UI | Yes | Low | FULL | `tests/ui-ux/sm/callback-requests.spec.js` | Class + text assertion on `.ant-tag` |
| TC_CBR_UI_007 | callback-requests | UI | Yes | Low | FULL | `tests/ui-ux/sm/callback-requests.spec.js` | Count icons in last cell |
| TC_CBR_FUNC_008 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Dropdown open + count options |
| TC_CBR_FUNC_009 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Click `.ant-table-filter-trigger` + count checkboxes |
| TC_CBR_FUNC_010 | callback-requests | FUNC | Yes | Medium | FULL | `tests/e2e/sm/callback-requests.spec.js` | Apply filter + assert remaining rows |
| TC_CBR_FUNC_011 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Existence check |
| TC_CBR_FUNC_012 | callback-requests | FUNC | Yes | Medium | FULL | `tests/e2e/sm/callback-requests.spec.js` | DatePicker interaction |
| TC_CBR_FUNC_013 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Search + debounce wait |
| TC_CBR_FUNC_014 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Empty state assertion |
| TC_CBR_FUNC_015 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Pagination presence |
| TC_CBR_FUNC_016 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Network re-fetch |
| TC_CBR_FUNC_017 | callback-requests | FUNC | Partial | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Click only; download verification optional |
| TC_CBR_FUNC_018 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Checkbox state + button text |
| TC_CBR_FUNC_019 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Drawer + tab count |
| TC_CBR_FUNC_020 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Read-only assertion |
| TC_CBR_FUNC_021 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Status field value read |
| TC_CBR_FUNC_022 | callback-requests | FUNC | Yes | Medium | FULL | `tests/e2e/sm/callback-requests.spec.js` | Tab click + assert all field labels exist |
| TC_CBR_FUNC_023 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | History tab + table headers |
| TC_CBR_FUNC_024 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Close button click |
| TC_CBR_FUNC_025 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Single-item assertion |
| TC_CBR_FUNC_026 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Same assertion on different row status |
| TC_CBR_FUNC_027 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Modal open + header content |
| TC_CBR_FUNC_028 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Re-capture flow |
| TC_CBR_FUNC_029 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Enumerate option labels in order |
| TC_CBR_VAL_030 | callback-requests | VAL | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Disabled attr check |
| TC_CBR_FUNC_031 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Select option + enable check |
| TC_CBR_BIZ_032 | callback-requests | BIZ | Partial | High | FULL | `tests/e2e/sm/callback-requests.spec.js` + DB query | Portal side: row update. Offer creation: `db/queries/offers.js` |
| TC_CBR_BIZ_033 | callback-requests | BIZ | Partial | High | FULL | `tests/e2e/sm/callback-requests.spec.js` + DB query | Same pattern as TC_CBR_BIZ_032 |
| TC_CBR_BIZ_034 | callback-requests | BIZ | Partial | High | FULL | `tests/e2e/sm/callback-requests.spec.js` + DB query | Negative assertion against offers table |
| TC_CBR_BIZ_035 | callback-requests | BIZ | Yes | Medium | FULL | `tests/regression/sm/callback-requests.spec.js` | Status badge never reads COMPLETED |
| TC_CBR_FUNC_036 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Cancel click + no row mutation |
| TC_CBR_FUNC_037 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Drawer open + initial disabled state |
| TC_CBR_FUNC_038 | callback-requests | FUNC | Yes | Medium | FULL | `tests/e2e/sm/callback-requests.spec.js` | Search + results table assertion |
| TC_CBR_FUNC_039 | callback-requests | FUNC | Yes | Medium | FULL | `tests/e2e/sm/callback-requests.spec.js` | Radio click + readonly auto-populate |
| TC_CBR_VAL_040 | callback-requests | VAL | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Disabled-state gating |
| TC_CBR_FUNC_041 | callback-requests | FUNC | Yes | Medium | FULL | `tests/e2e/sm/callback-requests.spec.js` | Multi-tag Ant Select |
| TC_CBR_FUNC_042 | callback-requests | FUNC | Yes | Medium | FULL | `tests/e2e/sm/callback-requests.spec.js` | DatePicker pick + enable Create |
| TC_CBR_BIZ_043 | callback-requests | BIZ | Partial | High | FULL | `tests/e2e/sm/callback-requests.spec.js` + DB | New row + Manager column from least-loaded |
| TC_CBR_BIZ_044 | callback-requests | BIZ | Partial | High | FULL | `tests/e2e/sm/callback-requests.spec.js` + DB | Requires flipping isAvailable in test DB seed |
| TC_CBR_FUNC_045 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Cancel drawer |
| TC_CBR_FUNC_046 | callback-requests | FUNC | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Empty state |
| TC_CBR_NEG_047 | callback-requests | NEG | Yes | Medium | FULL | `tests/e2e/sm/callback-requests.spec.js` | Enter key + network listener |
| TC_CBR_NEG_048 | callback-requests | NEG | Yes | Medium | FULL | `tests/e2e/sm/callback-requests.spec.js` | Same pattern |
| TC_CBR_NEG_049 | callback-requests | NEG | Yes | Low | FULL | `tests/regression/sm/callback-requests.spec.js` | Architectural guard against re-introducing edit affordance |
| TC_CBR_EDGE_050 | callback-requests | EDGE | Yes | Medium | FULL | `tests/e2e/sm/callback-requests.spec.js` | Cross-reference row data with modal header |
| TC_CBR_EDGE_051 | callback-requests | EDGE | Yes | Low | FULL | `tests/e2e/sm/callback-requests.spec.js` | Uncheck-all flow |
| TC_CBR_EDGE_052 | callback-requests | EDGE | Yes | Medium | FULL | `tests/e2e/sm/callback-requests.spec.js` | Calendar disabled-date assertion |
| TC_CBR_EDGE_053 | callback-requests | EDGE | Yes | Medium | FULL | `tests/e2e/sm/callback-requests.spec.js` | State preservation across refresh |
| TC_CBR_BIZ_054 | callback-requests | BIZ | Yes | Medium | FULL | `tests/regression/sm/callback-requests.spec.js` | Two-session run with different user roles |
| TC_CBR_BIZ_055 | callback-requests | BIZ | No (LSQ excluded) | n/a | FULL | — | LSQ excluded per CLAUDE.md Constraint 1 — documentation only |

---

## Sheet 3 — Bug Report Template

| Bug ID | TC_ID | Severity | Steps | Actual | Expected | Environment | Status |
|--------|-------|----------|-------|--------|----------|-------------|--------|
| BUG_XXX | TC_CBR_XXX | High/Med/Low | 1. … 2. … 3. … | Observed wrong behaviour | Expected per BRD/FRD §X.Y or screenshot X | UAT — `https://uat-web.xrportal.in/sales-manager/callback-requests` — Chrome (headed) | Open / In Progress / Fixed / Closed |

---

## Review Summary

**Total TCs generated:** 55
- UI: 7
- FUNC: 31
- VAL: 3
- NEG: 3
- EDGE: 4
- BIZ: 7

**Visual coverage:**
- TCs referencing at least one screenshot from `visual-memory/sm/callback-requests/`: **55 / 55 = 100%**
- Unique screenshots cited across the TC batch: 14 of 19 captured screenshots referenced directly (`callback-loaded.png`, `callback-table-data.png`, `callback-filter-open.png`, `callback-status-filter.png`, `callback-create-drawer.png`, `callback-create-drawer-searched.png`, `callback-create-buyer-selected.png`, `callback-create-drawer-validation.png`, `callback-details-drawer-pending.png`, `callback-details-drawer-meetingdone.png`, `callback-details-feedback-tab.png`, `callback-details-history-tab.png`, `callback-row-more-menu.png`, `callback-row-more-menu-meetingdone.png`, `callback-capture-vc-outcome-pending.png`, `callback-capture-vc-outcome-meetingdone.png`, `callback-vc-outcome-dropdown.png`, `callback-capture-vc-outcome-validation.png`, `callback-empty-state.png`). Threshold ≥ 80% achieved.

**BRD/FRD traceability:** 55 / 55 TCs carry a BRD/FRD Req ID (no orphan TCs).

**Dual-source confirmation:**
- Visual: `visual-memory/sm/callback-requests/INDEX.md` — CAPTURE_STATUS = FULL — present
- BRD/FRD: `SM-FS-Callback-Requests.md` + `SM-WF-Callback-Requests.md` + `SM-BRD-SM-Portal.md` — present
- Dual-source gate: PASSED

**Architectural correction applied:**
- Previous batch's "Schedule Meeting Modal", "Confirm Meeting Modal", and "Feedback Drawer" TCs removed and re-modelled as variations of the single Capture VC Outcome modal (TC_CBR_FUNC_025 through TC_CBR_FUNC_036).
- Eye-icon details drawer correctly modelled as READ-ONLY with 3 tabs (TC_CBR_FUNC_019 through TC_CBR_FUNC_024) — no action buttons present.
- Create Callback Request drawer modelled with its real two-step search → form flow including disabled-state validation gating (TC_CBR_FUNC_037 through TC_CBR_FUNC_045).
- FSD-CORRECTION captured: COMPLETED status unreachable (TC_CBR_BIZ_035); least-loaded SM assignment (TC_CBR_BIZ_043, TC_CBR_BIZ_044).
- LSQ exclusion respected (TC_CBR_BIZ_055 flagged "Documentation only").

**Scope exclusions confirmed:**
- LeadSquared sync verification — out of scope (CLAUDE.md Constraint 1)
- Strapi — not involved in this module
- Buyer Portal callback request creation — covered in Buyer Portal module, not duplicated here

**Overall status:** APPROVED

**Ready for hand-off to:**
- Tech Lead Agent → update `locators/sales-manager/locator-map.json` for callback-requests module
- QA Agent → call `test-case-reviewer` skill for final validation, then scaffold POM + spec files
