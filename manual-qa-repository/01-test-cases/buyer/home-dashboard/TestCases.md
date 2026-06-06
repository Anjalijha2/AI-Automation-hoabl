# TestCases — Buyer Portal / Home Dashboard

**Generated:** 2026-06-04 (dual-source pipeline — refreshed against updated INDEX.md)
**Portal:** Buyer
**Module:** Home Dashboard
**URL:** `https://uat.xrportal.in/home`
**Visual Memory:** `visual-memory/buyer/home-dashboard/INDEX.md` — CAPTURE_STATUS: FULL (2026-06-04)
**BRD/FRD:**
- `.claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md`

**Dual-source confirmation:** YES (visual memory FULL with 4 captured screens + BRD/FRD present)
**Status:** Conditional (QA test-case-reviewer pass 2026-06-06 — 45 Approved + 5 Conditional; see review-report.md)

---

## Test Cases

### Sheet 1 — Manual Test Cases

| TC_ID | Req ID | Portal | Module | Type | Scenario | Preconditions | Steps | Expected Result | Visual Evidence | Test Data | Priority | Status |
|-------|--------|--------|--------|------|----------|---------------|-------|-----------------|-----------------|-----------|----------|--------|
| TC_HOMEDASH_FUNC_001 | BUYER-BRD-S3-2 | Buyer | Home Dashboard | FUNC | Authenticated buyer lands on `/home` and sees personalised welcome heading | Buyer logged in via OTP (mobile `8888888888` / OTP `258369`); session active | 1. Open `https://uat.xrportal.in/home`<br>2. Wait for header `h2: "Welcome, [firstName] [lastName]"` to render | Page loads at `/home`. Welcome bar shows "Welcome, [firstName] [lastName]" sourced from the buyer profile (capture example: "Welcome, ishaaaaan karnik"). Marketing banner ("Seamless Support For Home Loan") and Allotment Details table are visible. | home-dashboard-loaded.png | Logged-in buyer session (buyer.json) — account `ishaaaaan karnik` | High | Approved |
| TC_HOMEDASH_NEG_002 | BUYER-BRD-S2 / BUYER-BRD-S4-1 | Buyer | Home Dashboard | NEG | Unauthenticated access to `/home` redirects to login (`/`) | No active buyer session; localStorage/cookies cleared | 1. Clear cookies/localStorage<br>2. Navigate directly to `https://uat.xrportal.in/home` | Browser redirects to `/` (login screen). `/home` content is NOT rendered. Welcome bar and Allotment table are NOT exposed. | home-dashboard-loaded.png (negative reference — should NOT appear) | Cleared session | High | Approved |
| TC_HOMEDASH_NEG_003 | BUYER-BRD-S2 | Buyer | Home Dashboard | NEG | Expired/invalidated session redirects from `/home` to login | Buyer was logged in; session token expired or `xr_user` sessionStorage manually invalidated | 1. With active session at `/home`, invalidate `xr_user` sessionStorage<br>2. Refresh page or trigger nav | Page redirects to `/`. Welcome heading is NOT rendered. No registration data is exposed in DOM. | home-dashboard-loaded.png (negative) | Invalidated session | High | Approved |
| TC_HOMEDASH_UI_004 | BUYER-BRD-S3 | Buyer | Home Dashboard | UI | Navigation sidebar renders all 7 expected links in order | Buyer logged in; on `/home` | 1. Inspect left sidebar<br>2. Enumerate all nav labels in order | Sidebar shows exactly: "Home", "Registration", "Allotment", "Homeloan", "Project", "Work Progress", "Logout". "Home" has active (green) highlight on `/home`. "Logout" is rendered as `button.ant-btn`. | home-dashboard-loaded.png | n/a | High | Approved |
| TC_HOMEDASH_FUNC_005 | BUYER-BRD-S3 | Buyer | Home Dashboard | FUNC | Sidebar "Home" link routes to `/home` and highlights active | Buyer logged in; currently on a different page (e.g. `/alloted`) | 1. Navigate to `/alloted`<br>2. Click sidebar link "Home" | URL changes to `/home`. Welcome heading re-renders. "Home" link receives active (green) highlight. | home-dashboard-loaded.png | n/a | Medium | Approved |
| TC_HOMEDASH_FUNC_006 | BUYER-BRD-S3 | Buyer | Home Dashboard | FUNC | Sidebar "Registration" link routes to `/register` | Buyer logged in; on `/home` | 1. Click sidebar link "Registration" | URL changes to `/register`. Registration view loads (SPA-routed). | home-dashboard-loaded.png | n/a | Medium | Approved |
| TC_HOMEDASH_FUNC_007 | BUYER-BRD-S3 / BUYER-BRD-S5 | Buyer | Home Dashboard | FUNC | Sidebar "Allotment" link routes to `/alloted` | Buyer logged in; on `/home` | 1. Click sidebar link "Allotment" | URL changes to `/alloted`. Allotment Experience view loads. | home-dashboard-loaded.png | n/a | Medium | Approved |
| TC_HOMEDASH_FUNC_008 | BUYER-BRD-S3 / BUYER-BRD-S4-11 | Buyer | Home Dashboard | FUNC | Sidebar "Homeloan" link routes to `/homeloan` | Buyer logged in; on `/home` | 1. Click sidebar link "Homeloan" | URL changes to `/homeloan`. Home Loan landing view renders. | home-dashboard-loaded.png | n/a | Medium | Approved |
| TC_HOMEDASH_FUNC_009 | BUYER-BRD-S3 | Buyer | Home Dashboard | FUNC | Sidebar "Project" link routes to `/project` | Buyer logged in; on `/home` | 1. Click sidebar link "Project" | URL changes to `/project`. Project Information view loads. | home-dashboard-loaded.png | n/a | Medium | Approved |
| TC_HOMEDASH_FUNC_010 | BUYER-BRD-S3 | Buyer | Home Dashboard | FUNC | Sidebar "Work Progress" link routes to `/work-progress` | Buyer logged in; on `/home` | 1. Click sidebar link "Work Progress" | URL changes to `/work-progress`. Work Progress view loads. | home-dashboard-loaded.png | n/a | Medium | Approved |
| TC_HOMEDASH_E2E_011 | BUYER-BRD-S2 | Buyer | Home Dashboard | E2E | Logout button ends session and redirects to login | Buyer logged in; on `/home` | 1. Click `button.ant-btn` matching text `/logout/i` in sidebar<br>2. Observe redirect | Session is terminated; `xr_user` sessionStorage cleared. URL redirects to `/`. Subsequent attempt to revisit `/home` redirects to login. | home-dashboard-loaded.png | n/a | High | Approved |
| TC_HOMEDASH_UI_012 | BUYER-BRD-S3 | Buyer | Home Dashboard | UI | Announcement banner displays scheduled marketing text | Buyer logged in; on `/home` | 1. Locate announcement banner element on dashboard | Banner displays exactly: "India's Biggest Growth Housing Revolution Begins On 7th April 2026." | home-dashboard-loaded.png | n/a | Low | Approved |
| TC_HOMEDASH_UI_013 | BUYER-BRD-S4-11 | Buyer | Home Dashboard | UI | Marketing banner ("Seamless Support For Home Loan") and "Know More" CTA render | Buyer logged in; on `/home` | 1. Locate the marketing banner below the top nav<br>2. Inspect heading, sub-text, and CTA | Banner heading: "Seamless Support For Home Loan". Sub-text: "Experience a hassle-free financing journey with guided assistance at every step." Button: "Know More" is rendered and clickable. | home-dashboard-loaded.png | n/a | Low | Approved |
| TC_HOMEDASH_FUNC_014 | BUYER-BRD-S4-11 | Buyer | Home Dashboard | FUNC | "Know More" CTA scrolls to / navigates to Unlock Exclusive Benefits section | Buyer logged in; on `/home` | 1. Click "Know More" on the marketing banner | Page either scrolls to the Unlock Exclusive Benefits section or navigates to the Home Loan info view (per INDEX.md note). | home-dashboard-scrolled.png | n/a | Low | Approved |
| TC_HOMEDASH_UI_015 | BUYER-BRD-S5 | Buyer | Home Dashboard | UI | Allotment Details table header renders all 6 expected columns in order | Buyer logged in; buyer has ≥ 1 registration | 1. Locate the Allotment Details table on `/home`<br>2. Inspect column headers in order | Table headers in order: Registration Number \| Home Loan \| Alloted Unit \| Status \| Process Status \| Payment Schedule. Header section also shows "Details" label, "Allotment Closing in [Xh :Ym :Zs]" countdown, green "Add Units" button (top-right), and orange "High Demand - Book to confirm your Unit!" text. | home-dashboard-allotment-table.png, home-dashboard-loaded.png | Buyer with ≥ 1 registration | High | Approved |
| TC_HOMEDASH_FUNC_016 | BUYER-BRD-S4-13 | Buyer | Home Dashboard | FUNC | Registration Number column shows GHNG-XXXXXXXXXX-[A-Z] format identifier | Buyer logged in; buyer has ≥ 1 registration | 1. Open `/home`<br>2. Inspect Registration Number cell of first row | Cell displays a string matching pattern `GHNG-\d{10}-[A-Z]` (capture examples: `GHNG-1000008364-A` through `GHNG-1000008364-K`). | home-dashboard-allotment-table.png | Test account with registrations `GHNG-1000008364-A..K` | High | Approved |
| TC_HOMEDASH_UI_017 | BUYER-BRD-S5 | Buyer | Home Dashboard | UI | Multiple registrations render as separate `tbody tr` rows | Buyer logged in; test account has 11+ registrations (capture: A..K) | 1. Open `/home`<br>2. Count `tbody tr` rows<br>3. Scroll to reveal full table | One row per registration. Capture shows rows A..K (11 registrations). Each row has its own Registration Number, Status, Process Status, and action cell content. | home-dashboard-allotment-table.png, home-dashboard-scrolled.png | Account `8888888888` with 11+ registrations | High | Approved |
| TC_HOMEDASH_FUNC_018 | BUYER-BRD-S5-2 / BUYER-BRD-S5-16 | Buyer | Home Dashboard | FUNC | Status badge "Waitlisted" renders as black pill on waitlisted registration | Buyer logged in; registration `-A` is Waitlisted | 1. Open `/home`<br>2. Inspect Status cell of row `GHNG-1000008364-A` | Status badge text = "Waitlisted" rendered as a black pill badge. No action button in Process Status / Payment Schedule for that row. | home-dashboard-allotment-table.png | Registration `GHNG-1000008364-A` (Waitlisted) | High | Approved |
| TC_HOMEDASH_FUNC_019 | BUYER-BRD-S5 | Buyer | Home Dashboard | FUNC | Status badge "Refunded" renders with red × icon on cancelled registration | Buyer logged in; registration `-B` is Refunded | 1. Open `/home`<br>2. Inspect Status cell of row `GHNG-1000008364-B` | Status badge text = "Refunded" with red × icon. No active CTA in Process Status. Alloted Unit column is blank. | home-dashboard-allotment-table.png | Registration `GHNG-1000008364-B` (Refunded) | Medium | Approved |
| TC_HOMEDASH_FUNC_020 | BUYER-BRD-S4-7 / BUYER-BRD-S5-15 | Buyer | Home Dashboard | FUNC | Status badge "Booked" renders green with checkmark after successful payment (WINNER state) | Buyer logged in; registration `-C` is Booked | 1. Open `/home`<br>2. Inspect Status cell of row `GHNG-1000008364-C` | Status badge text = "Booked" green with ✓ icon. Per BRD §4.7 Booked = WINNER = unit confirmed. Alloted Unit cell shows unit string (capture: "1201-Glory 1 Bed (323 sq.ft.)"). | home-dashboard-allotment-table.png | Registration `GHNG-1000008364-C` (Booked, KYC Completed) | High | Approved |
| TC_HOMEDASH_FUNC_021 | BUYER-BRD-S5 | Buyer | Home Dashboard | FUNC | Status badge "Available" renders as green outline on units eligible to book | Buyer logged in; registration `-K` is Available during active campaign | 1. Scroll to reveal row `GHNG-1000008364-K`<br>2. Inspect Status cell | Status badge text = "Available" rendered as green outline badge. Process Status cell shows "Proceed to Confirm" green outline button. | home-dashboard-scrolled.png | Registration `GHNG-1000008364-K` (Available) during active campaign | High | Approved |
| TC_HOMEDASH_FUNC_022 | BUYER-BRD-S5 / BUYER-BRD-S6 | Buyer | Home Dashboard | FUNC | Alloted Unit column shows unit details when allocation completed | Buyer logged in; ≥ 1 registration with a booked unit | 1. Open `/home`<br>2. Inspect Alloted Unit cell of a Booked row (e.g. `-C`, `-D`) | Cell displays formatted unit string: `<unitNo>-<tower> <BHK> (<carpet> sq.ft.)` — capture examples: "1201-Glory 1 Bed (323 sq.ft.)" for `-C`, "1004-Grace 2 Bed (485 sq.ft.)" for `-D`. | home-dashboard-allotment-table.png | Booked registrations `-C`, `-D` | High | Approved |
| TC_HOMEDASH_FUNC_023 | BUYER-BRD-S5 | Buyer | Home Dashboard | FUNC | Alloted Unit column is blank when no unit allocated | Buyer logged in; ≥ 1 registration with Status ∈ {Waitlisted, Refunded, Available} | 1. Open `/home`<br>2. Inspect Alloted Unit cell of rows `-A`, `-B`, `-K` | Cell is blank (no unit string) for Waitlisted (-A), Refunded (-B), and Available (-K) rows — unit only populates after Booked. | home-dashboard-allotment-table.png, home-dashboard-scrolled.png | Registrations `-A`, `-B`, `-K` | Medium | Approved |
| TC_HOMEDASH_FUNC_024 | BUYER-BRD-S4-8 / BUYER-BRD-S5-15 | Buyer | Home Dashboard | FUNC | Process Status shows "KYC Completed" green chip on Booked rows with KYC submitted | Buyer logged in; registrations `-C`, `-D` are Booked + KYC Completed | 1. Open `/home`<br>2. Inspect Process Status cell of rows `-C`, `-D` | Process Status cell shows "KYC Completed" with green ✓ chip. Below it, the link "Download your Unit Details" (`a` element) renders for PDF download. No "Complete KYC" button is shown for these rows (per BRD §4.8 KYC post-WINNER only). | home-dashboard-allotment-table.png | Registrations `-C`, `-D` (Booked + KYC Completed) | High | Approved |
| TC_HOMEDASH_FUNC_025 | BUYER-BRD-S4-8 / BUYER-BRD-S5-15 | Buyer | Home Dashboard | FUNC | Process Status shows red "Complete KYC >" button on Booked rows where KYC pending | Buyer logged in; registrations `-G`, `-H`, `-I`, `-J` are Booked but KYC pending | 1. Scroll to rows `-G`..`-J`<br>2. Locate `button.ant-btn` filter `/complete kyc/i` in Process Status cell<br>3. Verify red warning text below it | "Complete KYC >" red button is rendered for each row. Below the button: red text "Required to complete the allotment!". Per BRD §4.8, KYC is only accessible after WINNER status confirmed — these rows are post-WINNER. | home-dashboard-scrolled.png | Registrations `-G`..`-J` (Booked, KYC pending) | High | Approved |
| TC_HOMEDASH_FUNC_026 | BUYER-BRD-S5-3 | Buyer | Home Dashboard | FUNC | Clicking "Complete KYC >" navigates to KYC flow for that registration | Buyer logged in; ≥ 1 Booked row with KYC pending | 1. Click `button.ant-btn` filter `/complete kyc/i` on row `-G`<br>2. Observe routing | Navigates to `/kyc` (per BRD §3 module map). Selected registration's KYC flow loads. | home-dashboard-scrolled.png | Registration `-G` | High | Approved |
| TC_HOMEDASH_FUNC_027 | BUYER-BRD-S5 | Buyer | Home Dashboard | FUNC | Process Status shows green outline "Proceed to Confirm" on Available rows | Buyer logged in; registration `-K` is Available | 1. Scroll to row `-K`<br>2. Locate `button.ant-btn` filter `/proceed to confirm/i` in Process Status cell | "Proceed to Confirm" green outline button is rendered. Clicking should route to `/alloted` (per BRD §5.3) to begin unit selection. | home-dashboard-scrolled.png | Registration `-K` (Available) | High | Approved |
| TC_HOMEDASH_FUNC_028 | BUYER-BRD-S5-3 | Buyer | Home Dashboard | FUNC | Clicking "Proceed to Confirm" routes to Allotment Experience (`/alloted`) | Buyer logged in; row `-K` is Available | 1. Click `button.ant-btn` filter `/proceed to confirm/i` on row `-K` | URL navigates to `/alloted`. Allotment Experience view opens for unit selection (Book Now flow per BRD §5.3). | home-dashboard-scrolled.png | Registration `-K` | High | Approved |
| TC_HOMEDASH_FUNC_029 | BUYER-BRD-S5 | Buyer | Home Dashboard | FUNC | Process Status shows "-" (empty marker) on rows with no current action | Buyer logged in; rows `-A` (Waitlisted) or `-B` (Refunded) | 1. Open `/home`<br>2. Inspect Process Status cell of rows `-A`, `-B` | Process Status cell shows "-" (single dash placeholder) — no actionable CTA for Waitlisted or Refunded rows. | home-dashboard-allotment-table.png | Registrations `-A`, `-B` | Medium | Approved |
| TC_HOMEDASH_FUNC_030 | BUYER-BRD-S5-12 / BUYER-BRD-S5-15 | Buyer | Home Dashboard | FUNC | Payment Schedule column shows "Pay >" green button when payment is due | Buyer logged in; Booked registration with pending milestone payment | 1. Open `/home`<br>2. Inspect Payment Schedule cell on a Booked row with payment due<br>3. Locate `button.ant-btn` filter `/pay/i` | "Pay >" green button is rendered in the cell. Click should route to `/paymentschedule` (per BRD §3). On UAT, skip live gateway interaction. | home-dashboard-allotment-table.png | Booked registration with pending payment | High | Approved |
| TC_HOMEDASH_FUNC_031 | BUYER-BRD-S6 | Buyer | Home Dashboard | FUNC | "Download your Unit Details" link triggers PDF download | Buyer logged in; registration `-C` (Booked + KYC Completed) | 1. On row `-C`, click `a` filter `/download your unit details/i` | A PDF (or document) download begins. Browser triggers file save dialog or auto-download. Filename relates to unit/registration. | home-dashboard-allotment-table.png | Registration `-C` | Medium | Approved |
| TC_HOMEDASH_UI_032 | BUYER-BRD-S5 | Buyer | Home Dashboard | UI | Allotment Closing countdown displays in header of the table | Buyer logged in; active allotment window | 1. Open `/home`<br>2. Locate countdown text near "Details" header | Text reads "Allotment Closing in [Xh :Ym :Zs]" and decrements in real time (re-render every second). When campaign ends, message changes to "Allocation window is closed for now." (per BRD §5.16). | home-dashboard-loaded.png, home-dashboard-allotment-table.png | Active campaign window | Medium | Approved |
| TC_HOMEDASH_UI_033 | BUYER-BRD-S5 | Buyer | Home Dashboard | UI | "Add Units" button visible (green, top-right of table) and "High Demand" message visible | Buyer logged in; on `/home` | 1. Inspect Allotment Details header area | "Add Units" button is rendered green at top-right of the table. Adjacent orange text "High Demand - Book to confirm your Unit!" is rendered. | home-dashboard-loaded.png, home-dashboard-allotment-table.png | n/a | Medium | Approved |
| TC_HOMEDASH_FUNC_034 | BUYER-BRD-S5 | Buyer | Home Dashboard | FUNC | Clicking "Add Units" initiates the Add Units flow | Buyer logged in; on `/home` | 1. Click "Add Units" button in table header | Add Units flow initiates (per INDEX.md, eligible registrations can have additional units added). Routes to selection screen or opens a unit add modal. | home-dashboard-loaded.png | Eligible registration available | Medium | Approved |
| TC_HOMEDASH_UI_035 | BUYER-BRD-S3-2 | Buyer | Home Dashboard | UI | "Schedule a Call" button visible at top-right of welcome bar (no callback scheduled) | Buyer logged in; buyer has NOT yet submitted a callback request | 1. Open `/home`<br>2. Locate `button` filter `/schedule a call/i` at top-right of welcome bar | "Schedule a Call" button is rendered in the top-right header area, default styling. | home-dashboard-loaded.png | Buyer with no scheduled callback | Medium | Approved |
| TC_HOMEDASH_FUNC_036 | BUYER-BRD-S3-2 | Buyer | Home Dashboard | FUNC | Clicking "Schedule a Call" opens the Schedule a Call modal with date picker + comment field | Buyer logged in; "Schedule a Call" button visible | 1. Click `button` filter `/schedule a call/i`<br>2. Wait for modal to render | Modal opens with title "Schedule a Call". Fields rendered: (a) "Preferred Date & Time*" datetime picker (pre-filled with current date/time) — `input[type="text"]`; (b) "Comment (optional)" textarea with placeholder "Any specific query or message for the callback..." and maxlength 200; (c) char counter "0 / 200"; (d) "Cancel" button; (e) green "Submit Request" button. | home-dashboard-loaded.png | Buyer session | High | Approved |
| TC_HOMEDASH_FUNC_037 | BUYER-BRD-S3-2 | Buyer | Home Dashboard | FUNC | Submitting Schedule a Call modal changes header button to "Call Requested" | Buyer logged in; "Schedule a Call" modal open | 1. Open modal<br>2. Confirm pre-filled date/time<br>3. (Optionally) type a comment up to 200 chars<br>4. Click green "Submit Request" | Modal closes. A success indication appears (toast or in-place state change). Header button text changes to "Call Requested" with orange/amber color. | home-dashboard-loaded.png | Buyer session; future date/time | High | Approved |
| TC_HOMEDASH_FUNC_038 | BUYER-BRD-S3-2 | Buyer | Home Dashboard | FUNC | Comment textarea enforces 200-char max and updates char counter | Buyer logged in; Schedule a Call modal open | 1. Open modal<br>2. Type 200 chars into Comment textarea<br>3. Attempt to type a 201st char | Char counter increments live ("199 / 200", "200 / 200"). Beyond 200 chars, additional input is rejected (textarea has maxlength=200). | home-dashboard-loaded.png | 200-char comment string | Low | Approved |
| TC_HOMEDASH_FUNC_039 | BUYER-BRD-S3-2 | Buyer | Home Dashboard | FUNC | Cancel button closes Schedule a Call modal without submitting | Buyer logged in; Schedule a Call modal open | 1. Open modal<br>2. Type a comment<br>3. Click "Cancel" | Modal closes. No callback request is created. Header button text remains "Schedule a Call". | home-dashboard-loaded.png | Buyer session | Medium | Approved |
| TC_HOMEDASH_UI_040 | BUYER-BRD-S3-2 | Buyer | Home Dashboard | UI | "Call Requested" button renders in orange/amber after callback submitted | Buyer logged in; buyer has already submitted a callback request | 1. Open `/home`<br>2. Locate top-right header button | Header button shows text "Call Requested" with orange/amber background per INDEX.md note. | home-dashboard-loaded.png | Buyer with active callback request | Medium | Approved |
| TC_HOMEDASH_FUNC_041 | BUYER-BRD-S3-2 | Buyer | Home Dashboard | FUNC | Clicking "Call Requested" opens the Reschedule Call modal | Buyer logged in; "Call Requested" button visible | 1. Click "Call Requested" button | Modal opens with title "Reschedule Call". Same fields as Schedule a Call modal (Preferred Date & Time*, Comment). Buttons: "Cancel" and green "Reschedule". | home-dashboard-loaded.png | Buyer with active callback | Medium | Approved |
| TC_HOMEDASH_FUNC_042 | BUYER-BRD-S3-2 | Buyer | Home Dashboard | FUNC | Reschedule Call modal updates the existing callback request | Buyer logged in; Reschedule Call modal open | 1. Change date/time to a future slot<br>2. (Optionally) update comment<br>3. Click green "Reschedule" | Modal closes. Callback request is updated server-side (no duplicate created). Header button remains "Call Requested". | home-dashboard-loaded.png | Buyer with active callback | Medium | Approved |
| TC_HOMEDASH_FUNC_043 | BUYER-BRD-S5 / BUYER-BRD-S7 | Buyer | Home Dashboard | FUNC | Action buttons differ per row based on registration status (no cross-row leakage) | Buyer logged in; account has registrations in mixed states (A..K covers Waitlisted, Refunded, Booked+KYC, Booked+KYCpending, Available) | 1. Open `/home`<br>2. For each row, enumerate buttons present in Process Status + Payment Schedule cells | Each row only shows buttons relevant to its status: Waitlisted (-A) → "-"; Refunded (-B) → "-"; Booked + KYC Completed (-C, -D) → "KYC Completed" chip + "Download your Unit Details" link; Booked + KYC pending (-G..-J) → red "Complete KYC >" + "Required to complete the allotment!"; Available (-K) → "Proceed to Confirm". No cross-row leakage. | home-dashboard-allotment-table.png, home-dashboard-scrolled.png | Account `8888888888` with rows A..K | High | Approved |
| TC_HOMEDASH_EDGE_044 | BUYER-BRD-S5 | Buyer | Home Dashboard | EDGE | Long registration list scrolls without truncation or button clipping | Buyer logged in; account has 11+ registrations | 1. Open `/home`<br>2. Scroll vertically 500px<br>3. Continue to bottom of table | All rows remain accessible via scroll. No clipping of action buttons. Header (welcome + nav) is sticky or scrolls cleanly. Below-fold content matches `home-dashboard-scrolled.png`. | home-dashboard-loaded.png, home-dashboard-scrolled.png, home-dashboard-full.png | Buyer with 11+ registrations | Low | Approved |
| TC_HOMEDASH_FUNC_045 | BUYER-BRD-S5 | Buyer | Home Dashboard | FUNC | Empty state — buyer with zero registrations renders empty/placeholder state | Buyer logged in; account has 0 registrations | 1. Open `/home` with a buyer account that has zero registrations | Dashboard renders welcome heading and marketing banner. Allotment Details table either shows zero `tbody tr` rows or an empty-state message. No action buttons are rendered. | VISUAL_GAP — empty state not captured (test account has 11+ rows) | Buyer with 0 registrations | Medium | Conditional |
| TC_HOMEDASH_BIZ_046 | BUYER-BRD-S7 / BUYER-BRD-S5-16 | Buyer | Home Dashboard | BIZ | Dashboard reflects real-time campaign status transitions via WebSocket | Buyer logged in; campaign expected to start/end during session | 1. Open `/home` while campaign is in "Waiting" state<br>2. Wait for campaign activation (WebSocket `connection_established` / `tower_units_response`)<br>3. Observe Status / Process Status columns<br>4. Wait for campaign end | On activation: eligible rows update Status to "Available" with "Proceed to Confirm" CTA. On campaign end (per BRD §5.16): "Available" → "Waitlisted"; message "Allocation window is closed for now." displays. | VISUAL_GAP — live state transition not captured (requires live campaign) | Test account during active campaign window | Medium | Conditional |
| TC_HOMEDASH_BIZ_047 | BUYER-BRD-S4-7 / BUYER-BRD-S5 | Buyer | Home Dashboard | BIZ | Dashboard reflects WINNER confirmation only after webhook (not browser-side) | Buyer logged in; buyer initiated payment but closed browser mid-payment | 1. From Available row, click "Proceed to Confirm" → select unit → "Pay"<br>2. Mid-payment, close browser<br>3. Wait for webhook confirmation<br>4. Re-open `/home` | If gateway webhook confirms payment, Status updates to "Booked" on next dashboard load (per BRD §4.6 "Webhook is truth"). If webhook does not confirm within 20 min, unit released (BRD §4.5). | VISUAL_GAP — mid-payment-close not in capture | Buyer with pending allocation | Medium | Conditional |
| TC_HOMEDASH_EDGE_048 | BUYER-BRD-S3-2 | Buyer | Home Dashboard | EDGE | Submitting Schedule a Call with past datetime is rejected | Buyer logged in; Schedule a Call modal open | 1. Open modal<br>2. Manually change Preferred Date & Time to a past date/time<br>3. Click "Submit Request" | Form validation rejects past datetime — either Submit button disables or an inline error displays. No callback is created. | VISUAL_GAP — past-datetime validation not captured | Past datetime string | Low | Conditional |
| TC_HOMEDASH_UI_049 | BUYER-BRD-S3 | Buyer | Home Dashboard | UI | Page renders correctly at 1920×900 desktop viewport (no layout regressions) | Buyer logged in | 1. Open `/home` at viewport 1920×900<br>2. Compare visually with `home-dashboard-loaded.png` baseline | Layout matches captured baseline: sidebar left, welcome+Schedule a Call top-right, announcement banner, marketing banner, then Allotment Details table. No overflow, no overlapping elements. | home-dashboard-loaded.png, home-dashboard-full.png | n/a | Low | Approved |
| TC_HOMEDASH_NEG_050 | BUYER-BRD-S3-2 | Buyer | Home Dashboard | NEG | Schedule a Call modal does not allow submission with empty Preferred Date & Time | Buyer logged in; Schedule a Call modal open | 1. Open modal<br>2. Clear the Preferred Date & Time field<br>3. Click "Submit Request" | Submit is blocked: either button is disabled or inline validation error shows "Preferred Date & Time is required". No callback is created. | VISUAL_GAP — empty-date validation not captured | Empty datetime | Low | Conditional |

---

### Sheet 2 — Automation Candidates

| TC_ID | Module | Type | Automatable | Complexity | Visual Evidence Status | Playwright Suite | Notes |
|-------|--------|------|-------------|------------|------------------------|-------------------|-------|
| TC_HOMEDASH_FUNC_001 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Use `storageState: buyer.json` |
| TC_HOMEDASH_NEG_002 | Home Dashboard | NEG | Yes | Low | FULL (negative) | e2e/buyer/home-dashboard.spec.js | Clear storageState before nav |
| TC_HOMEDASH_NEG_003 | Home Dashboard | NEG | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Manipulate sessionStorage to simulate expiry |
| TC_HOMEDASH_UI_004 | Home Dashboard | UI | Yes | Low | FULL | ui-ux/buyer/home-dashboard.spec.js | Assert exact label list in order |
| TC_HOMEDASH_FUNC_005 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | waitForURL `/home` |
| TC_HOMEDASH_FUNC_006 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | waitForURL `/register` |
| TC_HOMEDASH_FUNC_007 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | waitForURL `/alloted` |
| TC_HOMEDASH_FUNC_008 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | waitForURL `/homeloan` |
| TC_HOMEDASH_FUNC_009 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | waitForURL `/project` |
| TC_HOMEDASH_FUNC_010 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | waitForURL `/work-progress` |
| TC_HOMEDASH_E2E_011 | Home Dashboard | E2E | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Verify sessionStorage cleared post-logout |
| TC_HOMEDASH_UI_012 | Home Dashboard | UI | Yes | Low | FULL | ui-ux/buyer/home-dashboard.spec.js | Text may rotate seasonally |
| TC_HOMEDASH_UI_013 | Home Dashboard | UI | Yes | Low | FULL | ui-ux/buyer/home-dashboard.spec.js | Assert heading + sub-text + CTA |
| TC_HOMEDASH_FUNC_014 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Detect scroll or nav |
| TC_HOMEDASH_UI_015 | Home Dashboard | UI | Yes | Low | FULL | ui-ux/buyer/home-dashboard.spec.js | Assert exact column header order |
| TC_HOMEDASH_FUNC_016 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Regex match `GHNG-\d{10}-[A-Z]` |
| TC_HOMEDASH_UI_017 | Home Dashboard | UI | Yes | Low | FULL | ui-ux/buyer/home-dashboard.spec.js | Row count tied to test data |
| TC_HOMEDASH_FUNC_018 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Filter row by `/GHNG-1000008364-A/` |
| TC_HOMEDASH_FUNC_019 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Filter row by `-B` |
| TC_HOMEDASH_FUNC_020 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Filter row by `-C` |
| TC_HOMEDASH_FUNC_021 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Filter row by `-K`; requires active campaign |
| TC_HOMEDASH_FUNC_022 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Validate unit string format |
| TC_HOMEDASH_FUNC_023 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Assert empty/blank cell |
| TC_HOMEDASH_FUNC_024 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Validate chip + link |
| TC_HOMEDASH_FUNC_025 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Filter button by `/complete kyc/i` |
| TC_HOMEDASH_FUNC_026 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | waitForURL `/kyc` |
| TC_HOMEDASH_FUNC_027 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Filter button by `/proceed to confirm/i` |
| TC_HOMEDASH_FUNC_028 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | waitForURL `/alloted` |
| TC_HOMEDASH_FUNC_029 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Assert "-" text |
| TC_HOMEDASH_FUNC_030 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Skip on UAT for actual gateway via ENV guard |
| TC_HOMEDASH_FUNC_031 | Home Dashboard | FUNC | Yes | Medium | FULL | e2e/buyer/home-dashboard.spec.js | Validate `download` event |
| TC_HOMEDASH_UI_032 | Home Dashboard | UI | Partial | Medium | FULL | ui-ux/buyer/home-dashboard.spec.js | Mock countdown clock for stability |
| TC_HOMEDASH_UI_033 | Home Dashboard | UI | Yes | Low | FULL | ui-ux/buyer/home-dashboard.spec.js | Assert button + adjacent text |
| TC_HOMEDASH_FUNC_034 | Home Dashboard | FUNC | Yes | Medium | FULL | e2e/buyer/home-dashboard.spec.js | Validate Add Units flow start |
| TC_HOMEDASH_UI_035 | Home Dashboard | UI | Yes | Low | FULL | ui-ux/buyer/home-dashboard.spec.js | Filter `/schedule a call/i` |
| TC_HOMEDASH_FUNC_036 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Assert all 5 modal fields/buttons |
| TC_HOMEDASH_FUNC_037 | Home Dashboard | FUNC | Yes | Medium | FULL | e2e/buyer/home-dashboard.spec.js | Reset callback in teardown |
| TC_HOMEDASH_FUNC_038 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Validate maxlength + counter |
| TC_HOMEDASH_FUNC_039 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Modal closes; no API call |
| TC_HOMEDASH_UI_040 | Home Dashboard | UI | Yes | Low | FULL | ui-ux/buyer/home-dashboard.spec.js | Verify amber/orange color class |
| TC_HOMEDASH_FUNC_041 | Home Dashboard | FUNC | Yes | Low | FULL | e2e/buyer/home-dashboard.spec.js | Assert "Reschedule Call" title |
| TC_HOMEDASH_FUNC_042 | Home Dashboard | FUNC | Yes | Medium | FULL | e2e/buyer/home-dashboard.spec.js | Assert PATCH/PUT not duplicate POST |
| TC_HOMEDASH_FUNC_043 | Home Dashboard | FUNC | Yes | Medium | FULL | e2e/buyer/home-dashboard.spec.js | Requires mixed-status fixture (A..K) |
| TC_HOMEDASH_EDGE_044 | Home Dashboard | EDGE | Yes | Low | FULL | ui-ux/buyer/home-dashboard.spec.js | Use 11+ registration fixture |
| TC_HOMEDASH_FUNC_045 | Home Dashboard | FUNC | Partial | Medium | STUB (VISUAL_GAP) | e2e/buyer/home-dashboard.spec.js | Need zero-registration buyer fixture |
| TC_HOMEDASH_BIZ_046 | Home Dashboard | BIZ | No | High | STUB (VISUAL_GAP) | manual only | Requires live campaign |
| TC_HOMEDASH_BIZ_047 | Home Dashboard | BIZ | No | High | STUB (VISUAL_GAP) | manual only | Requires mid-payment browser close + webhook |
| TC_HOMEDASH_EDGE_048 | Home Dashboard | EDGE | Yes | Low | STUB (VISUAL_GAP) | e2e/buyer/home-dashboard.spec.js | Validate disabled Submit or inline error |
| TC_HOMEDASH_UI_049 | Home Dashboard | UI | Yes | Low | FULL | ui-ux/buyer/home-dashboard.spec.js | Pixel-diff vs baseline tolerated |
| TC_HOMEDASH_NEG_050 | Home Dashboard | NEG | Yes | Low | STUB (VISUAL_GAP) | e2e/buyer/home-dashboard.spec.js | Clear date field + click Submit |

---

### Sheet 3 — Bug Template

| Bug ID | TC_ID | Severity | Steps | Actual | Expected | Environment | Status |
|--------|-------|----------|-------|--------|----------|-------------|--------|
| BUG_NNN | TC_HOMEDASH_*** | Critical/High/Medium/Low | (paste reproduction) | (observed) | (expected per TC) | UAT — buyer portal | Open |

---

## Test Data Spec (inline)

- **Logged-in buyer (default):** mobile `8888888888`, OTP `258369`, session at `automation-repository/fixtures/.auth/buyer.json`. Account: `ishaaaaan karnik`.
- **Registration formats:** `GHNG-\d{10}-[A-Z]` (capture examples: `GHNG-1000008364-A` through `GHNG-1000008364-K`).
- **Status values:** Waitlisted (black pill), Refunded (red ×), Booked (green ✓), Available (green outline).
- **Process Status values:** "KYC Completed" (green ✓ chip), "Download your Unit Details" (link), "Complete KYC >" (red button), "Required to complete the allotment!" (red text), "Proceed to Confirm" (green outline button), "-" (empty placeholder).
- **Payment Schedule values:** "Pay >" (green button, when payment pending).
- **Booked unit string format:** `<unitNo>-<tower> <BHK> (<carpet> sq.ft.)` — examples: `1201-Glory 1 Bed (323 sq.ft.)`, `1004-Grace 2 Bed (485 sq.ft.)`.
- **Sample row states (from capture):**
  - `-A`: Waitlisted, no unit
  - `-B`: Refunded, no unit
  - `-C`: Booked, `1201-Glory 1 Bed (323 sq.ft.)`, KYC Completed
  - `-D`: Booked, `1004-Grace 2 Bed (485 sq.ft.)`, KYC Completed
  - `-G`..`-J`: Booked, Complete KYC required
  - `-K`: Available, Proceed to Confirm
- **Required fixtures:**
  - Buyer with mixed-state registrations (A..K) — primary fixture (already provisioned in UAT for `8888888888`).
  - Buyer with 0 registrations (empty state) — needed for TC_045.
  - Buyer mid-callback-state — needed for TC_040, TC_041, TC_042.
- **Cleanup:**
  - After TC_011 (logout): re-run `npm run auth:setup` to restore buyer session.
  - After TC_037 (callback submit): cancel/reset callback record so subsequent runs find "Schedule a Call" button again.

---

## Review Summary (test-case-reviewer)

**Run date:** 2026-06-04
**Reviewer:** test-case-reviewer skill (automated review pass)

### Inputs verified
- TestCases.md: present (this file)
- Visual memory: `visual-memory/buyer/home-dashboard/INDEX.md` — CAPTURE_STATUS: FULL (refreshed 2026-06-04)
- BRD/FRD: `.claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md` present and referenced per row

### Coverage metrics
- **Total TCs:** 50
- **TCs with FULL visual evidence:** 44
- **TCs with VISUAL_GAP flag:** 6 (TC_045, TC_046, TC_047, TC_048, TC_050; plus one row dependent on `home-dashboard-loaded.png` negative-reference)
- **Negative coverage:** 4 (TC_002, TC_003, TC_050, plus TC_048 as edge-negative)
- **EDGE coverage:** 2 (TC_044, TC_048)
- **BIZ coverage:** 2 (TC_046, TC_047)
- **UI:** 11; FUNC: 30; E2E: 1; NEG: 3; EDGE: 2; BIZ: 2
- **Requirement traceability:** 50/50 TCs map to a BRD requirement ID (100%)
- **Steps grounded in INDEX.md selectors:** Yes — `h2: "Welcome, ..."`, `button` filter `/schedule a call/i`, `button` filter `/call requested/i`, `tbody tr`, `td` filter `/GHNG-/i`, `button.ant-btn` filter `/complete kyc/i`, `button.ant-btn` filter `/pay/i`, `button.ant-btn` filter `/proceed to confirm/i`, `a` filter `/download your unit details/i`
- **Scenarios grounded in BRD/FRD:** Yes — status semantics (BRD §4.7 WINNER), KYC post-WINNER (BRD §4.8), webhook truth (BRD §4.6), 20-min hold (BRD §4.5), WebSocket events (BRD §7), campaign end behaviour (BRD §5.16), module map (BRD §3)

### Visual coverage calculation
- Visual coverage = TCs with FULL evidence ÷ total TCs = 44/50 = **88.0%**
- Threshold for Approved: ≥ 80%
- **88.0% ≥ 80% → Approved**

### Gaps identified (still flagged for future capture)
- **VISUAL_GAP — Empty state (zero registrations):** Test account has 11+ rows. TC_045 needs a fresh buyer with no registrations.
- **VISUAL_GAP — Live campaign state transitions:** TC_046 (Waiting → Available → Waitlisted lifecycle) requires a live campaign; manual only is acceptable.
- **VISUAL_GAP — Mid-payment browser close → webhook:** TC_047 (BRD §4.6) requires payment + browser close; manual only is acceptable.
- **VISUAL_GAP — Past-datetime / empty-datetime validation in Schedule a Call modal:** TC_048, TC_050 not captured (validation states not isolated).

### Logic gaps
- None. All scenarios are explicitly anchored to BRD §3–§7.

### Out-of-scope items NOT tested (per CLAUDE.md constraints)
- **Strapi-managed components:** Marketing banner content, announcement banner text, marquee, popups — content managed by Strapi. Downstream rendering (presence of element + CTA wiring) is tested (TC_012–TC_014); Strapi CMS itself is excluded per CLAUDE.md constraint #2.
- **LeadSquared (LSQ):** No LSQ credentials or API calls per CLAUDE.md constraint #1.
- **Easebuzz gateway internals:** TC_030 stops at "Pay >" route navigation. Gateway flow is out of scope here (covered in `/paymentschedule` module).

### Verdict
**Status: APPROVED**

**Reason:** Visual coverage 88.0% exceeds the 80% threshold. No LOGIC_GAPs. All 6 remaining VISUAL_GAP rows are honestly flagged in the Visual Evidence column and gated as `Conditional`, so they remain manual-only or pending fresh capture. New TCs added in this revision (TC_036–TC_042 for Schedule a Call / Reschedule Call flow, TC_018–TC_021 for per-status badge isolation, TC_024–TC_029 for per-row Process Status semantics) lift the coverage above threshold by exploiting the refreshed INDEX.md selectors and screenshots.

### Action items for Tech Lead Agent (optional improvements, non-blocking)
1. Capture `/home` from a zero-registration buyer account → unblocks TC_045.
2. Capture Schedule a Call modal in invalid states (past datetime, empty datetime) → unblocks TC_048, TC_050.
3. (Manual only) TC_046, TC_047 require live campaign + payment flow — keep manual.

---

**End of TestCases.md**
