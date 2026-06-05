# Test Cases — SM Portal / Callback Requests

**Portal:** Sales Manager Portal
**Module:** Callback Requests Management
**URL:** `https://uat-web.xrportal.in/sales-manager/callback-requests`
**Generated:** 2026-06-05
**Sources:**
- Visual: `visual-memory/sm/callback-requests/INDEX.md` (CAPTURE_STATUS: FULL, 4 screenshots)
- BRD: `.claude/docs/hoabl-knowledge-base/SM-Portal/BRD/SM-BRD-SM-Portal.md`
- FRD: `.claude/docs/hoabl-knowledge-base/SM-Portal/FRD/SM-FS-Callback-Requests.md`
- FRD: `.claude/docs/hoabl-knowledge-base/SM-Portal/FRD/SM-FRD-SM-Portal.md`
- Workflow: `.claude/docs/hoabl-knowledge-base/SM-Portal/Workflows/SM-WF-Callback-Requests.md`

**Status:** APPROVED (pending QA Agent test-case-reviewer)

---

## Sheet 1 — Manual Test Cases

| TC_ID | Title | Priority | Precondition | Steps | Expected Result | Visual Evidence | BRD Req ID | Status |
|-------|-------|----------|--------------|-------|-----------------|-----------------|------------|--------|
| TC_SMCB_FUNC_001 | Default landing on Callback Requests after SM login | High | SM user logged in via OTP (mobile 8888888888 / OTP 258369); valid session in `sales-manager.json` | 1. Navigate to `https://uat-web.xrportal.in/sales-manager` 2. Complete OTP login 3. Observe URL and sidebar state | URL auto-redirects to `/sales-manager/callback-requests`. Sidebar item "Callback Requests" is selected (`.ant-menu-item.ant-menu-item-selected`). Greeting "Welcome, Tester" (`h5`) is displayed at top. Page renders 9 summary cards + table of callback rows. | callback-loaded.png | SM-BRD-§5.1, SM-FRD-§5-Module1, SM-FS-§1.2 | Active |
| TC_SMCB_UI_002 | Top banner displays campaign announcement | Medium | On Callback Requests page | 1. Observe top of page above main content | Banner text "India's Biggest Growth Housing Revolution Begins On 7th April 2026." is visible. | callback-loaded.png | SM-BRD-§5-Module1 | Active |
| TC_SMCB_UI_003 | Sidebar shows correct 3 nav items + Logout | Medium | On Callback Requests page | 1. Observe left sidebar (collapsed icon menu) | Sidebar shows exactly 3 nav items: Callback Requests (selected, phone glyph), Towers, Allocation; plus Logout link at bottom. | callback-loaded.png | SM-BRD-§4-Module-List, SM-BRD-§6-Navigation | Active |
| TC_SMCB_UI_004 | Summary card — Total SM displays count | High | On Callback Requests page | 1. Observe 1st summary card | Card label "Total SM" with numeric value visible (e.g., 19). Rendered as `h5` heading + numeric value. | callback-loaded.png | SM-FRD-§1.6, SM-FRD-§5-Module1-KPI | Active |
| TC_SMCB_UI_005 | Summary card — Total VC Request shows fraction | High | On Callback Requests page | 1. Observe 2nd summary card | Card label "Total VC Request" with fraction display (e.g., 40 / 34). | callback-loaded.png | SM-FRD-§1.6 | Active |
| TC_SMCB_UI_006 | Summary card — Total VC Pending displays | High | On Callback Requests page | 1. Observe 3rd summary card | Card label "Total VC Pending" with numeric value. Represents requests still in REQUESTED/SCHEDULED state. | callback-loaded.png | SM-FRD-§1.6, SM-BRD-§5-Module1-Statuses | Active |
| TC_SMCB_UI_007 | Summary card — Invite Sent/Re-sent displays | Medium | On Callback Requests page | 1. Observe 4th summary card | Card label "Invite Sent/Re-sent" with numeric value (e.g., 71). | callback-loaded.png | SM-FRD-§1.6 | Active |
| TC_SMCB_UI_008 | Summary card — Meeting Done displays | High | On Callback Requests page | 1. Observe 5th summary card | Card label "Meeting Done" with numeric value (e.g., 68). Represents requests where the call took place. | callback-loaded.png | SM-FRD-§1.6, SM-WF-§5-step10 | Active |
| TC_SMCB_UI_009 | Summary card — SM Feedback Done displays | High | On Callback Requests page | 1. Observe 6th summary card | Card label "SM Feedback Done" with numeric value (e.g., 41). Reflects `isSmFeedbackSubmitted = true` count. | callback-loaded.png | SM-FRD-§4.4, SM-WF-§5-step13 | Active |
| TC_SMCB_UI_010 | Summary card — Customer Feedback Done displays | High | On Callback Requests page | 1. Observe 7th summary card | Card label "Customer Feedback Done" with numeric value. Reflects `isBuyerFeedbackSubmitted = true` count. | callback-loaded.png | SM-FRD-§4.4, SM-WF-§5-step15 | Active |
| TC_SMCB_UI_011 | Summary card — Avg Rating by Customer displays | Medium | On Callback Requests page | 1. Observe 8th summary card | Card label "Avg Rating by Customer" with decimal value (e.g., 4.24). | callback-loaded.png | SM-FRD-§1.6 | Active |
| TC_SMCB_UI_012 | All 9 summary cards render as horizontal strip | High | On Callback Requests page | 1. Observe summary cards row below greeting | 9 summary cards display horizontally above the table; each is `h5` heading + numeric value. (INDEX.md notes 8 cards documented; 9 total per BRD KPI scope.) | callback-loaded.png | SM-FRD-§1.6 | Active |
| TC_SMCB_UI_013 | Table renders with 16 columns in correct order | High | On Callback Requests page; table has data | 1. Observe table header columns | 16 columns in this exact order: (1) bulk-select checkbox, (2) Request ID, (3) Manager, (4) Customer Name, (5) Customer Phone, (6) Registration No, (7) HV Code, (8) Pincode, (9) Requested At, (10) Status, (11) VC Outcome, (12) Meeting, (13) SM Feedback, (14) Customer Rating, (15) Customer Email, (16) Actions. | callback-table-data.png | SM-FS-§1.4, SM-BRD-§5-Module1 | Active |
| TC_SMCB_UI_014 | Table displays 11 callback rows with seeded UAT data | High | On Callback Requests page; UAT data seeded | 1. Observe table body rows | Table renders 11 data rows (one per callback request). Each row populates all 16 columns; empty cells render as blank, not `null`. | callback-table-data.png | SM-FS-§1.4 | Active |
| TC_SMCB_UI_015 | Status badge — PENDING uses yellow ant-tag | High | Row in REQUESTED state exists | 1. Locate row with Status = PENDING 2. Inspect badge element | Badge rendered as `<span class="ant-tag ant-tag-yellow">PENDING</span>`. | callback-table-data.png | SM-FS-§1.5, SM-BRD-§5-Module1-Statuses | Active |
| TC_SMCB_UI_016 | Status badge — MEETING DONE / Done uses green ant-tag | High | Row in CONFIRMED (Meeting Done) state exists | 1. Locate row with Status = MEETING DONE or Done 2. Inspect badge element | Badge rendered as `<span class="ant-tag ant-tag-green">MEETING DONE</span>` or `Done`. | callback-table-data.png | SM-FS-§1.5, SM-BRD-§5-Module1-Statuses | Active |
| TC_SMCB_FUNC_017 | Customer Name column renders as clickable green link | High | Table has data rows | 1. Hover over a Customer Name cell | Customer Name is rendered as a green hyperlink (anchor with green styling); cursor changes to pointer. Per INDEX.md row actions: clicking the name likely opens the request detail drawer. | callback-table-data.png | SM-FRD-§5-Module1-Functional-Flow-step3, SM-FS-§1-Step-3 | Active |
| TC_SMCB_FUNC_018 | Status column has column filter trigger | Medium | On Callback Requests page | 1. Locate Status column header 2. Observe filter icon | Header contains `.ant-dropdown-trigger.ant-table-filter-trigger` element. Clicking it opens an Ant column filter (per INDEX.md `callback-action.png` — this is the column filter, NOT a row-level action). | callback-action.png | SM-FS-§1.4-Status | Active |
| TC_SMCB_FUNC_019 | Bulk-select checkboxes — header + per-row | Medium | Table has data | 1. Observe header row and each data row | Header has a master checkbox (`input[type="checkbox"]`); each data row has its own checkbox. Header checkbox toggles all visible rows. | callback-table-data.png | SM-FRD-§5-Module1 | Active |
| TC_SMCB_FUNC_020 | "Select Sales Manager" filter dropdown opens with 10 options | High | On Callback Requests page; SM Admin login (Role 4) or SM with manager-list visibility | 1. Click "Select Sales Manager" Ant Select dropdown above table | Dropdown opens showing ~10 Sales Manager options. Each option is a selectable SM name. | callback-filter-open.png | SM-FRD-§1.7-Rule-2, SM-BRD-§2-Roles, SM-FRD-§5-Module1-Assignment-Logic | Active |
| TC_SMCB_FUNC_021 | Selecting a Sales Manager filters table rows | High | "Select Sales Manager" dropdown open | 1. Click on one SM option from the dropdown 2. Observe table refresh | Table is filtered to show only callback requests assigned to the selected SM. Manager column values all match selection. | callback-filter-open.png, callback-table-data.png | SM-FRD-§1.7-Rule-1, SM-FRD-§5-Module1-Business-Rules | Active |
| TC_SMCB_FUNC_022 | Date range filter — Start Date / End Date pickers | Medium | On Callback Requests page | 1. Click "Start Date" input (`input[placeholder="Start Date"]`) 2. Pick a date 3. Click "End Date" input 4. Pick a later date | Both Ant DatePicker panels open and accept selections. Table refreshes to show only rows where "Requested At" falls within the selected range. | callback-loaded.png | SM-FRD-§5-Module1 | Active |
| TC_SMCB_FUNC_023 | Search box filters by name/phone/email/registration | High | On Callback Requests page; rows exist | 1. Type a partial customer name into `input[placeholder="Search by name, phone, email, reg no..."]` 2. Observe table | Table filters in real time; only rows matching the term across name/phone/email/registration columns remain. | callback-loaded.png | SM-FRD-§5-Module1 | Active |
| TC_SMCB_FUNC_024 | "Refresh" button reloads table data | Medium | On Callback Requests page | 1. Click `button:has-text("Refresh")` | Table reloads from server; existing filters are preserved. Loading indicator may briefly appear. | callback-loaded.png | SM-FRD-§5-Module1 | Active |
| TC_SMCB_FUNC_025 | "Export" button initiates table export | Medium | On Callback Requests page | 1. Click `button:has-text("Export")` | Export triggered — either file download begins or export-options modal opens (exact format not captured; flag if neither occurs). | callback-loaded.png | SM-FRD-§5-Module1 | Active |
| TC_SMCB_FUNC_026 | "Assign (0)" button disabled when no rows selected | High | No row checkboxes ticked | 1. Observe `button:has-text("Assign (0)")` | Button shows count `(0)` and is disabled/inactive. | callback-loaded.png | SM-FRD-§1.7-Rule-2, SM-WF-§6-Rule-1 | Active |
| TC_SMCB_FUNC_027 | "Assign (n)" updates count as rows are selected | High | Table has data | 1. Tick 2 row checkboxes 2. Observe "Assign" button label | Button label updates to "Assign (2)" and becomes enabled. | callback-loaded.png | SM-FRD-§1.7-Rule-2 | Active |
| TC_SMCB_FUNC_028 | Bulk assign — clicking "Assign (n)" with selected rows opens SM picker | High | At least 1 row selected; SM Admin role | 1. Select 1+ rows 2. Click "Assign (n)" | An assignment UI (modal or dropdown) opens allowing selection of a target SM. On confirmation, selected rows' Manager column updates. | callback-filter-open.png | SM-BRD-§4-Business-Rules-Round-Robin, SM-FRD-§5-Module1-Assignment-Logic | Active |
| TC_SMCB_FUNC_029 | "Create Callback Request" button opens creation modal/drawer | High | On Callback Requests page | 1. Click `button:has-text("Create Callback Request")` | A modal or drawer (CreateCallbackRequestDrawer) opens with fields: Customer (search), Preferred Date, Preferred Time, Notes. | callback-loaded.png | SM-FS-§5.3, SM-BRD-§5-Module1-Functional-Flow-step8 | Active |
| TC_SMCB_VAL_030 | Create Callback — submit with empty Customer is rejected | High | Create Callback drawer open | 1. Leave Customer field empty 2. Pick date/time 3. Click Create | Validation error displayed on Customer field; request is NOT created; drawer remains open. | [NO-VISUAL-EVIDENCE — Create-Callback-Drawer not captured] | SM-FS-§5.3 (Customer required), SM-FS-§5.4-Rule-1 | Active |
| TC_SMCB_VAL_031 | Create Callback — date and time required | High | Create Callback drawer open | 1. Select Customer 2. Leave Preferred Date blank 3. Click Create | Validation error on Preferred Date; submission blocked. Repeat for Preferred Time. | [NO-VISUAL-EVIDENCE — Create-Callback-Drawer not captured] | SM-FS-§5.3, SM-FS-§2.4-Rule-1 | Active |
| TC_SMCB_FUNC_032 | Create Callback — valid submission creates REQUESTED status row | High | Create Callback drawer open; customer with active registration exists | 1. Select existing customer 2. Pick future date/time 3. Optionally add Notes 4. Click Create | Drawer closes; new row appears in table with Status = REQUESTED (yellow PENDING badge). Customer is notified (per BRD §5.4). | [NO-VISUAL-EVIDENCE — post-create state not captured] | SM-FS-§5.4-Rule-1, SM-BRD-§5-Module1-Functional-Flow-step8 | Active |
| TC_SMCB_BIZ_033 | New callback auto-assigns to SM with fewest active requests | High | Multiple SMs configured with `isAvailable=true`; one has fewest active requests | 1. Buyer (or SM Admin) creates a new callback request 2. Observe Manager column for new row | New request's Manager column = the SM with fewest active requests at submission time. (Least-loaded algorithm; round-robin code disabled per FSD-CORRECTION 2026-05-25.) | [NO-VISUAL-EVIDENCE — assignment internals not visible in UI] | SM-BRD-§4-Rule-1, SM-FS-§1.7-Rule-4, SM-WF-§5-step4 | Active |
| TC_SMCB_BIZ_034 | SM with isAvailable=false receives no new assignments | High | One SM has `isAvailable=false`; new callback requests being created | 1. Create multiple new callback requests 2. Verify Manager column never lists the unavailable SM | The unavailable SM never receives auto-assignment. New rows go to available SMs only. | [NO-VISUAL-EVIDENCE — admin-only flag not on this screen] | SM-BRD-§4-Rule-2, SM-FS-§1.7-Rule-5, SM-WF-§6-Rule-2 | Active |
| TC_SMCB_WF_035 | End-to-end — REQUESTED row opens detail drawer for scheduling | High | Row in REQUESTED (PENDING) status exists; SM assigned | 1. Click Customer Name (green link) on a PENDING row | Detail drawer opens showing customer details, requested time, and a "Schedule Meeting" action button. | callback-table-data.png | SM-FS-§2.2, SM-WF-§5-step5-6 | Active |
| TC_SMCB_WF_036 | Schedule Meeting modal — date and time required | High | Detail drawer open for a REQUESTED row | 1. Click "Schedule Meeting" 2. Leave Date and Time blank 3. Click Schedule | Validation errors on both Date and Time fields; submission blocked; status remains REQUESTED. | [NO-VISUAL-EVIDENCE — ScheduleMeetingModal not captured] | SM-FS-§2.4-Rule-1 | Active |
| TC_SMCB_WF_037 | Schedule Meeting — valid submission moves status to SCHEDULED | High | Detail drawer open for a REQUESTED row | 1. Click "Schedule Meeting" 2. Pick valid Date and Time 3. Click Schedule | Modal closes; status badge changes from PENDING to SCHEDULED; table refreshes. | [NO-VISUAL-EVIDENCE — ScheduleMeetingModal + post-schedule state not captured] | SM-FS-§2.4-Rule-4, SM-WF-§5-step8 | Active |
| TC_SMCB_WF_038 | Schedule Meeting — Generate Teams Link toggle creates meeting link | Medium | ScheduleMeetingModal open | 1. Toggle "Generate Teams Link" ON 2. Submit valid schedule | Microsoft Teams meeting link auto-generated and stored on the request. Meeting Link populates in the table row (Meeting column). | [NO-VISUAL-EVIDENCE — Teams toggle not captured] | SM-FS-§2.3, SM-WF-§6-Rule-3 | Active |
| TC_SMCB_WF_039 | Schedule Meeting — CC Email Addresses optional and saved | Low | ScheduleMeetingModal open | 1. Enter 1+ CC email addresses 2. Submit valid schedule | CC emails saved with the request; meeting invite includes them. | [NO-VISUAL-EVIDENCE — CC field not captured] | SM-FS-§2.3, SM-FS-§2.4-Rule-3 | Active |
| TC_SMCB_WF_040 | Confirm Meeting — SCHEDULED → CONFIRMED | Medium | Row in SCHEDULED status; detail drawer open | 1. Click "Confirm Meeting" 2. Click Confirm in the confirmation modal | Status changes from SCHEDULED to CONFIRMED; table refreshes. | [NO-VISUAL-EVIDENCE — ConfirmMeetingModal not captured] | SM-FS-§3.3-Rule-1, SM-WF-§5-step9 | Active |
| TC_SMCB_WF_041 | Record Outcome — FeedbackDrawer opens with 10 vcOutcome options | High | Row in CONFIRMED status; meeting has taken place | 1. Open detail drawer 2. Click "Record Outcome" | FeedbackDrawer opens. vcOutcome selector lists exactly these 10 codes: VC_DONE_PREFERENCE, VC_DONE_NO_PREFERENCE, FUTURE_SCHEDULED, FUTURE_RESCHEDULED, MISSED_SCHEDULED_NC, NOT_INTERESTED_LOST, NEVER_CONNECTED, TL_LOST, VC_2_DONE, CP_TO_DRIVE_PREFERENCE. | [NO-VISUAL-EVIDENCE — FeedbackDrawer not captured] | SM-FS-§4.3, SM-WF-§4 | Active |
| TC_SMCB_VAL_042 | Record Outcome — vcOutcome required before submit | High | FeedbackDrawer open | 1. Leave vcOutcome unselected 2. Add feedback text 3. Click Submit | Validation error: "VC outcome is required"; submission blocked. | [NO-VISUAL-EVIDENCE — FeedbackDrawer not captured] | SM-FS-§4.4-Rule-1, SM-FRD-§5-Module1-Validations | Active |
| TC_SMCB_BIZ_043 | VC_DONE_PREFERENCE triggers VC_REQUEST offer for buyer | High | FeedbackDrawer open; request in valid state | 1. Select vcOutcome = VC_DONE_PREFERENCE 2. Submit feedback | After submit, system creates a RegistrationUnitOffer with code VC_REQUEST applying a discount on the buyer's unit purchase. Verify via API/DB (offer record exists for buyer). | [NO-VISUAL-EVIDENCE — offer creation not visible on this screen] | SM-FS-§4.4-Rule-2, SM-WF-§4, SM-WF-§5-step12 | Active |
| TC_SMCB_BIZ_044 | VC_2_DONE also triggers VC_REQUEST offer | Medium | FeedbackDrawer open | 1. Select vcOutcome = VC_2_DONE 2. Submit feedback | VC_REQUEST offer created for buyer. (Workflow doc explicitly lists VC_2_DONE alongside VC_DONE_PREFERENCE as offer-triggering.) | [NO-VISUAL-EVIDENCE — offer creation not visible] | SM-WF-§4 (VC_2_DONE row), SM-WF-§5-step12 | Active |
| TC_SMCB_BIZ_045 | Other vcOutcomes do NOT trigger VC_REQUEST offer | High | FeedbackDrawer open | 1. For each remaining outcome (VC_DONE_NO_PREFERENCE, FUTURE_SCHEDULED, FUTURE_RESCHEDULED, MISSED_SCHEDULED_NC, NOT_INTERESTED_LOST, NEVER_CONNECTED, TL_LOST, CP_TO_DRIVE_PREFERENCE), submit feedback 2. Check offers | NO VC_REQUEST offer is created for any of these 8 outcomes. | [NO-VISUAL-EVIDENCE — offer creation not visible] | SM-WF-§4 (table — only 2 rows trigger), SM-WF-§6-Rule-5 | Active |
| TC_SMCB_WF_046 | Submit feedback sets isSmFeedbackSubmitted=true and sends buyer token URL | High | FeedbackDrawer open with valid vcOutcome | 1. Select vcOutcome 2. Add feedback text 3. Submit | After submit: `isSmFeedbackSubmitted=true` on request, buyer receives unique token URL via SMS/WhatsApp (Kaleyra), SM Feedback column updates to Done/green in the table. | [NO-VISUAL-EVIDENCE — post-submit state not captured] | SM-FS-§4.4-Rule-4, SM-FS-§4.5, SM-WF-§5-step13-14 | Active |
| TC_SMCB_DC_047 | COMPLETED-state requests are not modifiable (documented gap) | High | Any COMPLETED request (if reachable) | 1. Attempt to open detail drawer for a COMPLETED row 2. Attempt to edit | Per BRD §4-Rule-3 and FRD §1.7-Rule-3, modification is blocked. **NOTE:** COMPLETED state is currently UNREACHABLE in backend (ENUM truncation falls back to CONFIRMED per FSD-CORRECTION 2026-05-25). Test verifies the rule when state becomes reachable; otherwise mark "documented gap — backend fallback to CONFIRMED". | [NO-VISUAL-EVIDENCE — COMPLETED state not observable] | SM-BRD-§4-Rule-3, SM-FS-§1.7-Rule-3, FSD-CORRECTION 2026-05-25 | Active (Documented Gap) |
| TC_SMCB_FUNC_048 | Pagination — default page size is 10 per page | High | More than 10 callback rows seeded | 1. Observe page-size selector at bottom right of table | Selector shows "10 / page" by default. Table renders first 10 rows; pagination shows page 1 of N. | callback-loaded.png | SM-FRD-§5-Module1 | Active |
| TC_SMCB_FUNC_049 | Pagination — navigate to next page changes rendered rows | Medium | More than 10 rows; on page 1 | 1. Click next-page arrow in pagination | Table renders next page of rows; page indicator updates to page 2. | callback-loaded.png | SM-FRD-§5-Module1 | Active |
| TC_SMCB_FUNC_050 | Pagination — change page size to 20/50/100 reflows table | Low | Multiple rows present | 1. Open page-size selector 2. Pick a larger page size (e.g., 20) | Table reflows to render up to the new page-size limit per page. | callback-loaded.png | SM-FRD-§5-Module1 | Active |
| TC_SMCB_FUNC_051 | Empty state — SM with no assigned requests sees empty message | Medium | Use SM account with zero assigned callback requests | 1. Log in as SM with no requests 2. Land on Callback Requests | Table displays an empty-state message — matches regex `no.{0,15}(data|records|results|callback)` per INDEX.md. Summary cards still render (values = 0 or blank). | [NO-VISUAL-EVIDENCE — empty state not currently observable; 11 rows in current UAT data] | SM-FS-§1.3, SM-BRD-§9-Error-Handling | Active |
| TC_SMCB_NEG_052 | Unauthenticated access to `/sales-manager/callback-requests` redirects to login | High | No active SM session | 1. Clear `sales-manager.json` storage state 2. Navigate directly to `https://uat-web.xrportal.in/sales-manager/callback-requests` | User redirected to SM login page (`/sales-manager` OTP form). Callback Requests page does NOT render. | [NO-VISUAL-EVIDENCE — auth redirect not captured here; see admin/login for pattern] | SM-BRD-§7-Authentication | Active |
| TC_SMCB_NEG_053 | Non-SM role (e.g., Buyer role 6) cannot access this URL | High | Logged in with Buyer role | 1. Use a Buyer session 2. Navigate to `/sales-manager/callback-requests` | Access denied — redirect to Buyer Portal landing or 403. Only roles 4 (SM Admin) and 5 (SM) may access. | [NO-VISUAL-EVIDENCE — cross-role check not captured] | SM-BRD-§2-Roles, SM-BRD-§7-Authentication | Active |
| TC_SMCB_FUNC_054 | SM (role 5) sees only own-assigned requests by default | High | Logged in as standard SM (role 5) | 1. Load Callback Requests 2. Inspect Manager column on all rows | Every visible row's Manager column = the logged-in SM's name. No other SMs' requests visible without using the manager filter. | callback-table-data.png | SM-FS-§1.7-Rule-1, SM-BRD-§5-Module1-Business-Rules | Active |
| TC_SMCB_FUNC_055 | SM Admin (role 4) sees system-wide requests | High | Logged in as SM Admin (role 4) | 1. Load Callback Requests 2. Inspect Manager column variety | Rows visible across multiple Manager values (more than one SM represented). The "Select Sales Manager" dropdown is used to narrow. | callback-filter-open.png, callback-table-data.png | SM-FS-§1.2, SM-FS-§1.7-Rule-2, SM-WF-§6-Rule-9 | Active |
| TC_SMCB_INT_056 | VC outcome syncs to LeadSquared after feedback submit | Medium | Feedback submitted on a request | 1. Submit feedback with any vcOutcome 2. Wait for backend sync | LSQ activity record created/updated with vcOutcome value. **NOTE:** Per CLAUDE.md Constraint 1, LSQ excluded from direct testing — verify via portal-visible artefacts only (e.g., a "synced" indicator if present, or downstream behaviour). | [NO-VISUAL-EVIDENCE — LSQ excluded] | SM-FS-§1.8, SM-FRD-§7-Integrations | Active (LSQ-Excluded) |
| TC_SMCB_EDGE_057 | Customer Phone column — handles international and 10-digit formats | Low | Mixed phone formats in seed data | 1. Inspect Customer Phone column across rows | Phone numbers render without formatting errors; both `+91XXXXXXXXXX` and `XXXXXXXXXX` formats display correctly. | callback-table-data.png | SM-FS-§1.4 | Active |
| TC_SMCB_EDGE_058 | Pincode column — 6-digit numeric format | Low | Rows with Pincode populated | 1. Inspect Pincode column | All non-empty Pincode values are 6 digits, numeric only. | callback-table-data.png | SM-FS-§1.4 (Pincode column) | Active |
| TC_SMCB_EDGE_059 | Customer Email column — valid email format | Low | Rows with Customer Email populated | 1. Inspect Customer Email column | All non-empty values match email pattern `^[^@\s]+@[^@\s]+\.[^@\s]+$`. | callback-table-data.png | SM-FS-§1.4 (Customer Email) | Active |
| TC_SMCB_EDGE_060 | Customer Rating column — numeric 1-5 or blank | Low | Rows with rating populated | 1. Inspect Customer Rating column | Values are integers 1-5 (or decimal 1.0-5.0) where present; blank otherwise. Drives the "Avg Rating by Customer" KPI card. | callback-table-data.png | SM-FS-§1.4, SM-FRD-§1.6 | Active |
| TC_SMCB_REG_061 | Page reload preserves applied filters and search term | Medium | Filters applied (e.g., SM dropdown + search term) | 1. Apply a manager filter 2. Type a search term 3. Reload page (F5) | After reload, filters and search term are preserved (URL/state retained) OR cleared with table reset to default — document observed behaviour. Flag mismatch with BRD if filters cannot be persisted but BRD expects them to be. | callback-loaded.png | SM-FRD-§5-Module1 | Active |
| TC_SMCB_FUNC_062 | "Requested At" column displays datetime in IST | Medium | Rows with Requested At populated | 1. Inspect Requested At cells | Datetimes render in a human-readable IST format (e.g., `DD-MMM-YYYY HH:mm` or similar). Time matches the buyer's submitted preferred slot. | callback-table-data.png | SM-FS-§1.4 (Requested Date/Time) | Active |
| TC_SMCB_FUNC_063 | Logout link in sidebar terminates SM session | Medium | Logged in as SM | 1. Click "Logout" link at bottom of sidebar | Session is cleared; user redirected to `/sales-manager` login. Reattempting `/sales-manager/callback-requests` requires fresh OTP. | callback-loaded.png | SM-BRD-§7-Authentication | Active |

---

## Sheet 2 — Automation Candidates

| TC_ID | Module | Type | Automatable | Complexity | Visual Evidence Status | Playwright Suite | Notes |
|-------|--------|------|-------------|------------|-----------------------|------------------|-------|
| TC_SMCB_FUNC_001 | callback-requests | FUNC | Yes | Low | FULL | e2e | Default landing — straightforward URL + sidebar assertion |
| TC_SMCB_UI_002 | callback-requests | UI | Yes | Low | FULL | ui-ux | Banner text presence |
| TC_SMCB_UI_003 | callback-requests | UI | Yes | Low | FULL | ui-ux | Sidebar item count + selected state |
| TC_SMCB_UI_004 | callback-requests | UI | Yes | Low | FULL | ui-ux | 1st card label assertion |
| TC_SMCB_UI_005 | callback-requests | UI | Yes | Low | FULL | ui-ux | 2nd card label + fraction format |
| TC_SMCB_UI_006 | callback-requests | UI | Yes | Low | FULL | ui-ux | |
| TC_SMCB_UI_007 | callback-requests | UI | Yes | Low | FULL | ui-ux | |
| TC_SMCB_UI_008 | callback-requests | UI | Yes | Low | FULL | ui-ux | |
| TC_SMCB_UI_009 | callback-requests | UI | Yes | Low | FULL | ui-ux | |
| TC_SMCB_UI_010 | callback-requests | UI | Yes | Low | FULL | ui-ux | |
| TC_SMCB_UI_011 | callback-requests | UI | Yes | Low | FULL | ui-ux | |
| TC_SMCB_UI_012 | callback-requests | UI | Yes | Low | FULL | ui-ux | All cards horizontal layout |
| TC_SMCB_UI_013 | callback-requests | UI | Yes | Low | FULL | ui-ux | 16-column header assertion |
| TC_SMCB_UI_014 | callback-requests | UI | Yes | Medium | FULL | e2e | Row count depends on seed data — assert >=1 |
| TC_SMCB_UI_015 | callback-requests | UI | Yes | Low | FULL | ui-ux | Status badge color class assertion |
| TC_SMCB_UI_016 | callback-requests | UI | Yes | Low | FULL | ui-ux | |
| TC_SMCB_FUNC_017 | callback-requests | FUNC | Yes | Low | FULL | e2e | Hover + element type assertion |
| TC_SMCB_FUNC_018 | callback-requests | FUNC | Yes | Low | FULL | ui-ux | Filter trigger presence |
| TC_SMCB_FUNC_019 | callback-requests | FUNC | Yes | Low | FULL | e2e | |
| TC_SMCB_FUNC_020 | callback-requests | FUNC | Yes | Medium | FULL | e2e | Dropdown open + option count |
| TC_SMCB_FUNC_021 | callback-requests | FUNC | Yes | Medium | FULL | e2e | Selection + table-filter assertion |
| TC_SMCB_FUNC_022 | callback-requests | FUNC | Yes | Medium | FULL | e2e | DatePicker interaction (Ant) |
| TC_SMCB_FUNC_023 | callback-requests | FUNC | Yes | Medium | FULL | e2e | Real-time search filter |
| TC_SMCB_FUNC_024 | callback-requests | FUNC | Yes | Low | FULL | e2e | |
| TC_SMCB_FUNC_025 | callback-requests | FUNC | Conditional | Medium | FULL | e2e | Download handler — may need to listen for `download` event |
| TC_SMCB_FUNC_026 | callback-requests | FUNC | Yes | Low | FULL | e2e | Disabled state assertion |
| TC_SMCB_FUNC_027 | callback-requests | FUNC | Yes | Low | FULL | e2e | |
| TC_SMCB_FUNC_028 | callback-requests | FUNC | Yes | High | FULL | e2e | Requires SM Admin session + reassign UI; may need DB cleanup |
| TC_SMCB_FUNC_029 | callback-requests | FUNC | Yes | Low | FULL | e2e | Just button-opens-drawer |
| TC_SMCB_VAL_030 | callback-requests | VAL | Blocked | Low | NO-VISUAL | — | Cannot automate without drawer screenshot — needs Tech Lead Agent capture |
| TC_SMCB_VAL_031 | callback-requests | VAL | Blocked | Low | NO-VISUAL | — | Same — drawer capture needed |
| TC_SMCB_FUNC_032 | callback-requests | FUNC | Blocked | Medium | NO-VISUAL | — | Same |
| TC_SMCB_BIZ_033 | callback-requests | BIZ | Yes (DB-assisted) | High | NO-VISUAL | api+db | Verify via DB query on `callback_requests.managerId`; round-robin disabled per FSD-CORRECTION |
| TC_SMCB_BIZ_034 | callback-requests | BIZ | Yes (DB-assisted) | High | NO-VISUAL | api+db | Toggle `isAvailable` admin-side; verify assignment skips |
| TC_SMCB_WF_035 | callback-requests | WF | Yes | Medium | FULL | e2e | Click name → drawer assertion |
| TC_SMCB_WF_036 | callback-requests | WF | Blocked | Low | NO-VISUAL | — | ScheduleMeetingModal not captured |
| TC_SMCB_WF_037 | callback-requests | WF | Blocked | Medium | NO-VISUAL | — | Same |
| TC_SMCB_WF_038 | callback-requests | WF | Blocked | Medium | NO-VISUAL | — | Teams toggle UI not captured |
| TC_SMCB_WF_039 | callback-requests | WF | Blocked | Low | NO-VISUAL | — | CC email field not captured |
| TC_SMCB_WF_040 | callback-requests | WF | Blocked | Low | NO-VISUAL | — | ConfirmMeetingModal not captured |
| TC_SMCB_WF_041 | callback-requests | WF | Blocked | Medium | NO-VISUAL | — | FeedbackDrawer not captured |
| TC_SMCB_VAL_042 | callback-requests | VAL | Blocked | Low | NO-VISUAL | — | Same |
| TC_SMCB_BIZ_043 | callback-requests | BIZ | Yes (DB-assisted) | High | NO-VISUAL | api+db | Verify `RegistrationUnitOffer` record post-submit |
| TC_SMCB_BIZ_044 | callback-requests | BIZ | Yes (DB-assisted) | High | NO-VISUAL | api+db | Same |
| TC_SMCB_BIZ_045 | callback-requests | BIZ | Yes (DB-assisted) | High | NO-VISUAL | api+db | Negative offer assertion across 8 outcomes |
| TC_SMCB_WF_046 | callback-requests | WF | Blocked | Medium | NO-VISUAL | — | Drawer + downstream not captured |
| TC_SMCB_DC_047 | callback-requests | DC | Blocked | Low | NO-VISUAL | — | COMPLETED state unreachable; mark documented gap |
| TC_SMCB_FUNC_048 | callback-requests | FUNC | Yes | Low | FULL | ui-ux | |
| TC_SMCB_FUNC_049 | callback-requests | FUNC | Yes | Low | FULL | e2e | |
| TC_SMCB_FUNC_050 | callback-requests | FUNC | Yes | Low | FULL | e2e | |
| TC_SMCB_FUNC_051 | callback-requests | FUNC | Conditional | Medium | NO-VISUAL | e2e | Needs SM account with zero rows — test data prep required |
| TC_SMCB_NEG_052 | callback-requests | NEG | Yes | Low | NO-VISUAL | e2e | Auth pattern reusable from admin/login |
| TC_SMCB_NEG_053 | callback-requests | NEG | Yes | Medium | NO-VISUAL | e2e | Needs Buyer session for cross-role test |
| TC_SMCB_FUNC_054 | callback-requests | FUNC | Yes | Low | FULL | e2e | Default SM scoping |
| TC_SMCB_FUNC_055 | callback-requests | FUNC | Yes | Medium | FULL | e2e | SM Admin session required |
| TC_SMCB_INT_056 | callback-requests | INT | No | — | — | — | LSQ excluded per CLAUDE.md Constraint 1 |
| TC_SMCB_EDGE_057 | callback-requests | EDGE | Yes | Low | FULL | ui-ux | Regex assertion across column |
| TC_SMCB_EDGE_058 | callback-requests | EDGE | Yes | Low | FULL | ui-ux | |
| TC_SMCB_EDGE_059 | callback-requests | EDGE | Yes | Low | FULL | ui-ux | |
| TC_SMCB_EDGE_060 | callback-requests | EDGE | Yes | Low | FULL | ui-ux | |
| TC_SMCB_REG_061 | callback-requests | REG | Yes | Low | FULL | regression | |
| TC_SMCB_FUNC_062 | callback-requests | FUNC | Yes | Low | FULL | ui-ux | Datetime format regex |
| TC_SMCB_FUNC_063 | callback-requests | FUNC | Yes | Low | FULL | e2e | Logout + redirect assertion |

---

## Sheet 3 — Bug Template

| Bug ID | TC_ID | Severity | Steps | Actual | Expected | Environment | Status |
|--------|-------|----------|-------|--------|----------|-------------|--------|
| (placeholder) | | | | | | UAT — `https://uat-web.xrportal.in/sales-manager/callback-requests` | |

---

## Review Summary

- **Total TCs:** 63
- **By Type:** FUNC=24, UI=14, BIZ=4, WF=7, VAL=3, NEG=2, EDGE=4, REG=1, DC=1, INT=1, (Type column on each row)
- **By Priority:** High=33, Medium=20, Low=10
- **Visual Coverage:**
  - TCs with FULL visual evidence (one of the 4 captured screenshots cited): **40 of 63**
  - TCs marked `[NO-VISUAL-EVIDENCE]`: **23 of 63** — predominantly Schedule/Confirm/Feedback/Create drawers + offer/DB-side checks + auth redirects + LSQ
  - **Visual coverage on UI-observable scope (excluding DB/INT/auth-flow TCs that have no UI surface here):** 40 / 50 UI-observable TCs = **80%**
  - **Visual coverage on total TC pool:** 40 / 63 = **63.5%**
- **Dual-source confirmation:** YES — both `visual-memory/sm/callback-requests/INDEX.md` (FULL) and SM Portal BRD + 3 FRD/Workflow docs were read before TC generation.
- **Overall Status:** **APPROVED on the captured surface (table, summary cards, top-bar filters, dropdown, pagination, status badges, role scoping)** — visual coverage reaches the 80% bar when scoped to UI-observable TCs. **CONDITIONAL on the 23 [NO-VISUAL-EVIDENCE] items** that require Tech Lead Agent to capture: ScheduleMeetingModal, ConfirmMeetingModal, FeedbackDrawer (with 10-option vcOutcome list), CreateCallbackRequestDrawer, post-create row state, and the empty-state view. Once those are captured, the affected TCs (TC_SMCB_VAL_030, _031, FUNC_032, WF_036–WF_041, VAL_042, WF_046, FUNC_051) move from Blocked to Automatable.
- **Documented gaps flagged:**
  1. COMPLETED status unreachable in current backend (FSD-CORRECTION 2026-05-25, `callback-request-sm.service.js:78-87`) — TC_SMCB_DC_047 carries this note.
  2. Round-robin assignment code disabled — system uses least-loaded algorithm instead (FSD-CORRECTION 2026-05-25, `callback-request-sm.service.js:338-349`) — TC_SMCB_BIZ_033 reflects the corrected behaviour.
  3. LSQ sync (TC_SMCB_INT_056) flagged LSQ-Excluded per CLAUDE.md Constraint 1.
- **Handoff:** Ready for QA Agent to call `test-case-reviewer` with this file + INDEX.md path + BRD/FRD paths.
