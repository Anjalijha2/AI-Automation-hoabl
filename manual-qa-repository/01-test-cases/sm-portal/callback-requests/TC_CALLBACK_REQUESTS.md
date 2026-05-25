# Test Cases — Callback Requests Management
**Portal:** Sales Manager Portal
**BRD Reference:** SM-FS-Callback-Requests.md / SM-WF-Callback-Requests.md

---

## Login & Authentication

### SM_CB_001 — Login page reachable at /sales-manager URL

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | No active SM session |
| **Test Steps** | 1. Open browser<br>2. Navigate to https://uat-web.xrportal.in/sales-manager<br>3. Wait for render |
| **Expected Result** | Login page displays with mobile input and Send OTP button |
| **Priority** | Critical |

---

### SM_CB_002 — Send OTP succeeds for registered SM mobile

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Registered SM account with isActive = true |
| **Test Steps** | 1. Enter mobile 8888888888<br>2. Click Send OTP |
| **Expected Result** | OTP input field appears; toast confirms OTP sent via SMS/WhatsApp |
| **Priority** | Critical |

---

### SM_CB_003 — Invalid OTP rejected with error

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | OTP request initiated |
| **Test Steps** | 1. Enter incorrect 6-digit OTP<br>2. Click Verify OTP |
| **Expected Result** | Error "Invalid OTP" displayed; user stays on login page |
| **Priority** | High |

---

### SM_CB_004 — Expired OTP rejected with error

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | OTP sent and configured expiry window elapsed |
| **Test Steps** | 1. Wait for OTP to expire<br>2. Enter the now-expired OTP<br>3. Click Verify OTP |
| **Expected Result** | Error "OTP expired" displayed per FS 1.5.2; Resend OTP available |
| **Priority** | High |

---

### SM_CB_005 — Inactive account blocked even with valid OTP

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM account with isActive = false |
| **Test Steps** | 1. Enter inactive SM mobile<br>2. Receive OTP<br>3. Enter valid OTP<br>4. Click Verify OTP |
| **Expected Result** | Login rejected with "Account not active" per BR 1.5.4 |
| **Priority** | Critical |

---

### SM_CB_006 — Successful login redirects to /sales-manager/callback-requests

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | UAT credentials 8888888888 / 258369 |
| **Test Steps** | 1. Enter mobile<br>2. Send OTP<br>3. Enter OTP 258369<br>4. Click Verify OTP |
| **Expected Result** | Redirect to /sales-manager/callback-requests; JWT issued |
| **Priority** | Critical |

---

### SM_CB_007 — Rate limiting blocks repeated failed login attempts

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Login page open |
| **Test Steps** | 1. Enter wrong OTP repeatedly (5+ times)<br>2. Try Send OTP again |
| **Expected Result** | Rate limit error shown; further attempts blocked temporarily per BR 1.5.3 |
| **Priority** | High |

---

### SM_CB_008 — Session persists across page refresh

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM logged in |
| **Test Steps** | 1. Refresh the page<br>2. Inspect URL and session state |
| **Expected Result** | User remains logged in on /sales-manager/callback-requests; no redirect to login |
| **Priority** | High |

---

## KPI Dashboard

### SM_CB_009 — KPI dashboard renders at top of callback page

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM logged in on /sales-manager/callback-requests |
| **Test Steps** | 1. Inspect top section of page |
| **Expected Result** | KPI card row visible above the requests table |
| **Priority** | High |

---

### SM_CB_010 — KPI card "Total VC Requested" displays correct count

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM has assigned callback requests |
| **Test Steps** | 1. Inspect Total VC Requested card<br>2. Cross-check count with API or table row count |
| **Expected Result** | Card shows total number of callback requests assigned to SM |
| **Priority** | High |

---

### SM_CB_011 — KPI card "VC Link Sent" reflects scheduled meetings

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Some requests in SCHEDULED status |
| **Test Steps** | 1. Inspect VC Link Sent card<br>2. Verify count matches SCHEDULED/RESCHEDULED rows |
| **Expected Result** | Count equals number of requests with Teams link generated |
| **Priority** | High |

---

### SM_CB_012 — KPI card "VC Confirmed" reflects CONFIRMED status count

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Some requests in CONFIRMED status |
| **Test Steps** | 1. Inspect VC Confirmed card |
| **Expected Result** | Count equals number of requests with status = CONFIRMED |
| **Priority** | High |

---

### SM_CB_013 — KPI card "SM Feedback Submitted" reflects isSmFeedbackSubmitted flag

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | At least one request with SM feedback recorded |
| **Test Steps** | 1. Inspect SM Feedback Submitted card |
| **Expected Result** | Count equals requests where isSmFeedbackSubmitted = true |
| **Priority** | High |

---

### SM_CB_014 — KPI card "Customer Feedback Submitted" reflects buyer feedback flag

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | At least one buyer has submitted feedback |
| **Test Steps** | 1. Inspect Customer Feedback Submitted card |
| **Expected Result** | Count equals requests where isBuyerFeedbackSubmitted = true |
| **Priority** | High |

---

### SM_CB_015 — KPI card "Completed" reflects requests in COMPLETED status

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Some requests in COMPLETED status |
| **Test Steps** | 1. Inspect Completed card |
| **Expected Result** | Count equals number of requests with both feedback flags true and status COMPLETED |
| **Priority** | High |

---

### SM_CB_016 — KPI card "Avg Rating" displays computed average

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Multiple buyer ratings recorded |
| **Test Steps** | 1. Inspect Avg Rating card<br>2. Verify numeric value to 1 or 2 decimals |
| **Expected Result** | Computed average of buyer ratings displayed; updates when new feedback added |
| **Priority** | Medium |

---

### SM_CB_017 — KPI cards show 0 for empty data set

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Fresh SM account with no requests |
| **Test Steps** | 1. Inspect all 7 KPI cards |
| **Expected Result** | Each card shows 0 (or appropriate empty state) without errors |
| **Priority** | Medium |

---

### SM_CB_018 — KPI cards refresh when filters applied

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Multiple requests exist; filters available |
| **Test Steps** | 1. Apply a date range filter<br>2. Observe KPI card values |
| **Expected Result** | KPI counts re-compute to reflect the filtered subset |
| **Priority** | High |

---

### SM_CB_019 — KPI cards responsive on mobile viewport

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM page loaded on desktop |
| **Test Steps** | 1. Resize browser to 375px width<br>2. Inspect KPI card layout |
| **Expected Result** | Cards stack vertically or scroll horizontally; no content clipping |
| **Priority** | Medium |

---

### SM_CB_020 — Clicking KPI card filters table to matching subset

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | KPI cards visible with non-zero counts |
| **Test Steps** | 1. Click on "Completed" card<br>2. Observe table |
| **Expected Result** | Table filters to show only COMPLETED requests (if click-through enabled per UX) |
| **Priority** | Medium |

---

## Callback Request Table

### SM_CB_021 — Requests table renders with all 7 columns

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | At least one callback request assigned |
| **Test Steps** | 1. Inspect table header |
| **Expected Result** | Headers visible: Customer Name, Phone, Requested Date/Time, Status, Assigned SM, Meeting Link, VC Outcome per FS 1.4 |
| **Priority** | Critical |

---

### SM_CB_022 — Customer Name column shows full buyer name

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Requests exist with named buyers |
| **Test Steps** | 1. Inspect Customer Name column |
| **Expected Result** | Full name displayed for each row; no truncation in default view |
| **Priority** | High |

---

### SM_CB_023 — Phone column shows formatted mobile number

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Requests exist |
| **Test Steps** | 1. Inspect Phone column |
| **Expected Result** | 10-digit Indian mobile shown, optionally with +91 prefix |
| **Priority** | High |

---

### SM_CB_024 — Requested Date/Time column shows correct timezone

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Requests with known requested datetimes |
| **Test Steps** | 1. Inspect Requested Date/Time column<br>2. Cross-check with DB value |
| **Expected Result** | Date and time displayed in IST per portal convention |
| **Priority** | High |

---

### SM_CB_025 — Status column renders badges for all statuses

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Requests covering all 5 statuses exist |
| **Test Steps** | 1. Inspect Status column for each row |
| **Expected Result** | Badge labels REQUESTED / SCHEDULED / RESCHEDULED / CONFIRMED / COMPLETED rendered per FS 1.5 |
| **Priority** | Critical |

---

### SM_CB_026 — Status badge colour coding distinct per status

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | All statuses visible in table |
| **Test Steps** | 1. Inspect badge colours |
| **Expected Result** | Each status has a unique colour (e.g. REQUESTED yellow, SCHEDULED blue, COMPLETED green) |
| **Priority** | Medium |

---

### SM_CB_027 — Assigned SM column shows current SM name

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Requests assigned to known SMs |
| **Test Steps** | 1. Inspect Assigned SM column |
| **Expected Result** | Name of assigned SM displayed; empty/dash if unassigned |
| **Priority** | High |

---

### SM_CB_028 — Meeting Link column shows clickable Teams link when present

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request in SCHEDULED status with Teams link |
| **Test Steps** | 1. Locate Meeting Link cell<br>2. Click the link |
| **Expected Result** | Cell shows clickable Teams URL; opens Microsoft Teams in new tab |
| **Priority** | High |

---

### SM_CB_029 — Meeting Link column empty for REQUESTED rows

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request in REQUESTED status |
| **Test Steps** | 1. Locate Meeting Link cell for REQUESTED row |
| **Expected Result** | Cell shows dash, empty, or "—" indicator |
| **Priority** | Medium |

---

### SM_CB_030 — VC Outcome column shows recorded outcome label

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request with vcOutcome recorded |
| **Test Steps** | 1. Inspect VC Outcome column |
| **Expected Result** | Human-readable label displayed e.g. "VC Done with Preference" not raw code |
| **Priority** | High |

---

### SM_CB_031 — Empty state shown when SM has no requests

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM account with zero assigned requests |
| **Test Steps** | 1. Load callback page |
| **Expected Result** | Empty state message displayed e.g. "No callback requests assigned"; table headers may remain visible |
| **Priority** | Medium |

---

### SM_CB_032 — Clicking a row opens detail panel

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | At least one request in table |
| **Test Steps** | 1. Click on any request row |
| **Expected Result** | Detail drawer / side panel opens with full request data |
| **Priority** | Critical |

---

### SM_CB_033 — Table loads within acceptable latency

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | 100+ requests in DB for SM |
| **Test Steps** | 1. Load callback page<br>2. Measure time-to-render |
| **Expected Result** | Initial table render under 3 seconds; lazy load or pagination active |
| **Priority** | Medium |

---

### SM_CB_034 — Table re-fetches data on browser refresh

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Refresh browser<br>2. Inspect API call |
| **Expected Result** | Fresh GET to callback list endpoint fired; table re-populates |
| **Priority** | Medium |

---

## Filters & Search

### SM_CB_035 — Name filter returns matching requests only

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Multiple requests; one customer named "Anita" |
| **Test Steps** | 1. Enter "Anita" in name filter<br>2. Apply |
| **Expected Result** | Table shows only rows matching name |
| **Priority** | High |

---

### SM_CB_036 — Name filter is case-insensitive

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Customer "Anita Sharma" exists |
| **Test Steps** | 1. Enter "anita sharma" lowercase<br>2. Apply |
| **Expected Result** | Match returned regardless of case |
| **Priority** | Medium |

---

### SM_CB_037 — Name filter supports partial match

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Customer "Anita Sharma" exists |
| **Test Steps** | 1. Enter "Anit"<br>2. Apply |
| **Expected Result** | Partial match returns the customer |
| **Priority** | Medium |

---

### SM_CB_038 — Phone filter returns exact match

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request from phone 9000000001 |
| **Test Steps** | 1. Enter 9000000001 in phone filter<br>2. Apply |
| **Expected Result** | Single matching row returned |
| **Priority** | High |

---

### SM_CB_039 — Phone filter rejects non-numeric input

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Phone filter visible |
| **Test Steps** | 1. Try entering alphabetic chars in phone filter |
| **Expected Result** | Input strips non-numerics or shows validation error |
| **Priority** | Low |

---

### SM_CB_040 — Email filter returns matching requests

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request from buyer with email anita@example.com |
| **Test Steps** | 1. Enter "anita@example.com" in email filter<br>2. Apply |
| **Expected Result** | Matching rows returned |
| **Priority** | High |

---

### SM_CB_041 — Email filter supports partial match on domain

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Multiple requests from @example.com buyers |
| **Test Steps** | 1. Enter "@example.com"<br>2. Apply |
| **Expected Result** | All requests with that email domain returned |
| **Priority** | Medium |

---

### SM_CB_042 — Date range filter narrows by requested date

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Requests across multiple dates |
| **Test Steps** | 1. Open date range picker<br>2. Select start = 2026-05-01, end = 2026-05-15<br>3. Apply |
| **Expected Result** | Only requests within range shown |
| **Priority** | High |

---

### SM_CB_043 — Date range — end before start blocked or auto-corrected

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Date range picker open |
| **Test Steps** | 1. Set start = 2026-05-15<br>2. Try set end = 2026-05-01 |
| **Expected Result** | End date earlier than start blocked or dates auto-swapped |
| **Priority** | Medium |

---

### SM_CB_044 — Date range future date allowed

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Future-scheduled requests exist |
| **Test Steps** | 1. Pick a future date range<br>2. Apply |
| **Expected Result** | Future requests returned without error |
| **Priority** | Low |

---

### SM_CB_045 — SM dropdown filter (Admin only) filters by assigned SM

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Logged in as SM Admin |
| **Test Steps** | 1. Open SM dropdown<br>2. Select an SM<br>3. Apply |
| **Expected Result** | Table shows only that SM's requests |
| **Priority** | High |

---

### SM_CB_046 — SM dropdown not visible for standard SM role

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Logged in as standard SM (role 5) |
| **Test Steps** | 1. Inspect filter bar |
| **Expected Result** | SM dropdown filter hidden; SM sees only own requests per BR 1.7.1 |
| **Priority** | Critical |

---

### SM_CB_047 — GHNG search returns matching customer

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Customer with GHNG ID exists |
| **Test Steps** | 1. Enter GHNG number in search<br>2. Apply |
| **Expected Result** | Customer's callback request shown |
| **Priority** | Medium |

---

### SM_CB_048 — Multiple filters combine with AND logic

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Requests vary by name, phone, date |
| **Test Steps** | 1. Apply name + date range simultaneously<br>2. Inspect results |
| **Expected Result** | Rows matching all conditions returned |
| **Priority** | High |

---

### SM_CB_049 — Clear Filters resets all selections

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | At least one filter applied |
| **Test Steps** | 1. Click Clear Filters / Reset<br>2. Inspect table |
| **Expected Result** | All filters cleared; full request list restored |
| **Priority** | High |

---

### SM_CB_050 — No-match state when filter combination returns zero rows

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Filter set returns no matches |
| **Test Steps** | 1. Apply filter combination returning no data<br>2. Inspect table |
| **Expected Result** | Empty state shown "No matching requests" |
| **Priority** | Medium |

---

### SM_CB_051 — Filters persist when navigating to detail panel and back

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Filters applied |
| **Test Steps** | 1. Apply filters<br>2. Click a row to open detail<br>3. Close detail panel |
| **Expected Result** | Filters still in effect; table not reset |
| **Priority** | Medium |

---

### SM_CB_052 — Filters reset on page refresh

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Filters applied |
| **Test Steps** | 1. Refresh the page |
| **Expected Result** | Filters reset to defaults unless URL query string applied |
| **Priority** | Low |

---

## Sort & Pagination

### SM_CB_053 — Sort by Requested Date — ascending

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Multiple requests with varied dates |
| **Test Steps** | 1. Click Requested Date column header<br>2. Verify ascending order |
| **Expected Result** | Rows sorted oldest to newest |
| **Priority** | High |

---

### SM_CB_054 — Sort by Requested Date — descending toggle

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Date column sorted ascending |
| **Test Steps** | 1. Click Requested Date header again<br>2. Verify descending order |
| **Expected Result** | Rows sorted newest to oldest |
| **Priority** | High |

---

### SM_CB_055 — Sort by Customer Name alphabetical

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Multiple named customers |
| **Test Steps** | 1. Click Customer Name header<br>2. Verify A→Z order |
| **Expected Result** | Names sorted alphabetically |
| **Priority** | Medium |

---

### SM_CB_056 — Sort by Status groups by status badge

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Mixed statuses |
| **Test Steps** | 1. Click Status header<br>2. Inspect order |
| **Expected Result** | Rows grouped by status alphabetically or by defined precedence |
| **Priority** | Medium |

---

### SM_CB_057 — Default sort is most recent first

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Fresh page load |
| **Test Steps** | 1. Load callback page<br>2. Inspect default row order |
| **Expected Result** | Newest requests appear at top |
| **Priority** | High |

---

### SM_CB_058 — Pagination controls visible when result set exceeds page size

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | More requests than one page (e.g. 25+) |
| **Test Steps** | 1. Inspect bottom of table |
| **Expected Result** | Pagination controls (Prev / Next / page numbers) rendered |
| **Priority** | High |

---

### SM_CB_059 — Next page loads next set of records

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Multiple pages exist |
| **Test Steps** | 1. Click Next page<br>2. Verify table updates |
| **Expected Result** | Second page records loaded; URL or state reflects page 2 |
| **Priority** | High |

---

### SM_CB_060 — Previous page returns to earlier records

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | On page 2+ |
| **Test Steps** | 1. Click Previous<br>2. Verify table updates |
| **Expected Result** | Page 1 records re-rendered |
| **Priority** | Medium |

---

### SM_CB_061 — Page size selector changes rows per page

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Page size dropdown visible |
| **Test Steps** | 1. Change page size 10 → 50<br>2. Inspect table row count |
| **Expected Result** | Table displays 50 rows per page; total pages recalculated |
| **Priority** | Medium |

---

### SM_CB_062 — Pagination hidden when result fits one page

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM has <10 requests |
| **Test Steps** | 1. Load page<br>2. Inspect pagination area |
| **Expected Result** | Pagination controls hidden or disabled |
| **Priority** | Low |

---

## Assign to Sales Manager

### SM_CB_063 — SM Admin sees Assign button on each request row

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Logged in as SM Admin (role 4) |
| **Test Steps** | 1. Inspect requests table |
| **Expected Result** | Assign action visible on each row or in detail panel |
| **Priority** | Critical |

---

### SM_CB_064 — Standard SM does NOT see Assign button

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Logged in as standard SM (role 5) |
| **Test Steps** | 1. Inspect requests table |
| **Expected Result** | Assign action hidden per BR 1.7.1 |
| **Priority** | Critical |

---

### SM_CB_065 — Assign modal lists all active SMs

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM Admin clicks Assign on a request |
| **Test Steps** | 1. Open Assign modal<br>2. Inspect SM list |
| **Expected Result** | All active SMs (isActive = true) listed in dropdown |
| **Priority** | High |

---

### SM_CB_066 — Inactive SMs excluded from Assign dropdown

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | At least one inactive SM exists |
| **Test Steps** | 1. Open Assign modal<br>2. Verify inactive SM is absent from list |
| **Expected Result** | Inactive SMs not selectable |
| **Priority** | High |

---

### SM_CB_067 — Selecting an SM and Confirm assigns the request

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Assign modal open |
| **Test Steps** | 1. Select target SM<br>2. Click Confirm |
| **Expected Result** | Request updated with new Assigned SM; toast confirms reassignment |
| **Priority** | Critical |

---

### SM_CB_068 — Assigned SM column updates immediately after reassignment

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Successful reassignment |
| **Test Steps** | 1. Close Assign modal<br>2. Inspect Assigned SM column |
| **Expected Result** | New SM name reflected without refresh |
| **Priority** | High |

---

### SM_CB_069 — Cannot reassign a COMPLETED request

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request status = COMPLETED |
| **Test Steps** | 1. Try opening Assign on a completed row |
| **Expected Result** | Assign blocked/disabled per BR 1.7.3 (COMPLETED is final) |
| **Priority** | Critical |

---

### SM_CB_070 — Assignment respects isAvailable flag warning

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Target SM has isAvailable = false |
| **Test Steps** | 1. Open Assign modal<br>2. Try selecting unavailable SM |
| **Expected Result** | Warning shown or selection blocked per BR 1.7.5 |
| **Priority** | High |

---

### SM_CB_071 — Cancel button closes Assign modal without changes

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Assign modal open |
| **Test Steps** | 1. Select an SM<br>2. Click Cancel |
| **Expected Result** | Modal closes; original Assigned SM unchanged |
| **Priority** | Medium |

---

### SM_CB_072 — Reassignment logs audit trail entry

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Reassignment performed |
| **Test Steps** | 1. Inspect DB / audit log table |
| **Expected Result** | New row records old SM, new SM, timestamp, admin user per FS 1.8 |
| **Priority** | Medium |

---

## Meeting Invite — Send & Resend

### SM_CB_073 — Schedule Meeting button visible for REQUESTED rows

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request in REQUESTED status |
| **Test Steps** | 1. Open detail panel for REQUESTED row<br>2. Inspect actions |
| **Expected Result** | Schedule Meeting button enabled |
| **Priority** | Critical |

---

### SM_CB_074 — Schedule Meeting modal opens with all fields

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Schedule Meeting clicked |
| **Test Steps** | 1. Inspect modal |
| **Expected Result** | Modal shows Date (required), Time (required), Generate Teams Link toggle, CC emails (optional) per FS 2.3 |
| **Priority** | Critical |

---

### SM_CB_075 — Date field mandatory

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Schedule modal open |
| **Test Steps** | 1. Leave Date empty<br>2. Fill Time<br>3. Click Schedule |
| **Expected Result** | Validation error "Date required"; submission blocked per BR 2.4.1 |
| **Priority** | Critical |

---

### SM_CB_076 — Time field mandatory

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Schedule modal open |
| **Test Steps** | 1. Fill Date<br>2. Leave Time empty<br>3. Click Schedule |
| **Expected Result** | Validation error "Time required"; submission blocked per BR 2.4.1 |
| **Priority** | Critical |

---

### SM_CB_077 — Generate Teams Link toggle defaults off

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Schedule modal open |
| **Test Steps** | 1. Inspect Teams toggle state on first open |
| **Expected Result** | Toggle defaults to OFF unless org default is ON; user must opt-in |
| **Priority** | Medium |

---

### SM_CB_078 — Teams link auto-generated when toggle ON

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Date and Time filled; Teams toggle ON |
| **Test Steps** | 1. Click Schedule<br>2. Wait for system response |
| **Expected Result** | Microsoft Teams API called; meeting created; link stored on request per FS 2.5.2 |
| **Priority** | Critical |

---

### SM_CB_079 — Scheduling without Teams link allowed

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Date and Time filled; Teams toggle OFF |
| **Test Steps** | 1. Click Schedule |
| **Expected Result** | Request scheduled successfully; Meeting Link column remains empty per BR 2.4.2 |
| **Priority** | High |

---

### SM_CB_080 — CC emails optional; multiple addresses accepted

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Schedule modal open |
| **Test Steps** | 1. Add "a@x.com, b@x.com" in CC field<br>2. Submit |
| **Expected Result** | Both emails accepted; invite CC'd to both per BR 2.4.3 |
| **Priority** | Medium |

---

### SM_CB_081 — Invalid CC email format rejected

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Schedule modal open |
| **Test Steps** | 1. Enter "not-an-email" in CC field<br>2. Submit |
| **Expected Result** | Validation error on CC field; submission blocked or email skipped |
| **Priority** | Medium |

---

### SM_CB_082 — Past date selection blocked

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Schedule modal open |
| **Test Steps** | 1. Try selecting yesterday's date<br>2. Submit |
| **Expected Result** | Past date disabled in picker or validation blocks submission |
| **Priority** | High |

---

### SM_CB_083 — Status updates REQUESTED → SCHEDULED on successful schedule

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request in REQUESTED |
| **Test Steps** | 1. Complete scheduling<br>2. Inspect Status badge |
| **Expected Result** | Status changes to SCHEDULED per BR 2.4.4 |
| **Priority** | Critical |

---

### SM_CB_084 — Resend meeting invite available for SCHEDULED rows

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request in SCHEDULED |
| **Test Steps** | 1. Open detail panel<br>2. Inspect actions |
| **Expected Result** | Resend Invite button visible |
| **Priority** | High |

---

### SM_CB_085 — Resend invite delivers a fresh notification

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Resend Invite clicked |
| **Test Steps** | 1. Click Resend<br>2. Confirm action |
| **Expected Result** | Kaleyra notification re-sent to buyer; toast confirms resend |
| **Priority** | High |

---

### SM_CB_086 — Reschedule preserves original meeting history

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request SCHEDULED; user opens reschedule |
| **Test Steps** | 1. Change date/time<br>2. Submit Reschedule |
| **Expected Result** | Status → RESCHEDULED; original meeting details preserved in JSON history array per BR 6.7 |
| **Priority** | High |

---

## Meeting Done & Status Flow

### SM_CB_087 — Confirm Meeting button visible for SCHEDULED rows

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request in SCHEDULED |
| **Test Steps** | 1. Open detail panel<br>2. Inspect actions |
| **Expected Result** | Confirm Meeting button enabled per FS 3 |
| **Priority** | High |

---

### SM_CB_088 — Confirming a meeting moves status to CONFIRMED

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request SCHEDULED |
| **Test Steps** | 1. Click Confirm Meeting<br>2. Acknowledge confirmation modal |
| **Expected Result** | Status → CONFIRMED per BR 3.3.1 |
| **Priority** | High |

---

### SM_CB_089 — Confirm step is optional — calls can proceed without it

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request SCHEDULED |
| **Test Steps** | 1. Skip Confirm<br>2. Proceed directly to Record Outcome |
| **Expected Result** | Record Outcome action allowed from SCHEDULED state per BR 3.3.2 |
| **Priority** | Medium |

---

### SM_CB_090 — Record Outcome enabled after meeting time passes

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request SCHEDULED or CONFIRMED; meeting time elapsed |
| **Test Steps** | 1. Open detail panel<br>2. Inspect Record Outcome button |
| **Expected Result** | Record Outcome button enabled |
| **Priority** | Critical |

---

### SM_CB_091 — Status flow REQUESTED → SCHEDULED → CONFIRMED → COMPLETED

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | New request in REQUESTED |
| **Test Steps** | 1. Schedule meeting → SCHEDULED<br>2. Confirm → CONFIRMED<br>3. Record outcome + buyer feedback → COMPLETED |
| **Expected Result** | Each transition observed in Status badge per WF section 3 |
| **Priority** | Critical |

---

### SM_CB_092 — RESCHEDULED branch transitions back to CONFIRMED

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request SCHEDULED |
| **Test Steps** | 1. Reschedule with new time → RESCHEDULED<br>2. Confirm new time |
| **Expected Result** | Status flows RESCHEDULED → CONFIRMED per WF section 3 |
| **Priority** | High |

---

### SM_CB_093 — COMPLETED requests cannot be edited

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request COMPLETED |
| **Test Steps** | 1. Open detail panel<br>2. Inspect action buttons |
| **Expected Result** | All edit/schedule/reschedule actions disabled per BR 1.7.3 |
| **Priority** | Critical |

---

### SM_CB_094 — Status badge updates without page refresh

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Action performed in detail panel |
| **Test Steps** | 1. Perform Schedule/Confirm/Reschedule<br>2. Watch Status column |
| **Expected Result** | Badge updates live without manual refresh |
| **Priority** | High |

---

### SM_CB_095 — VC outcome recording requires meeting to have occurred

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request in REQUESTED status (no meeting yet) |
| **Test Steps** | 1. Try Record Outcome |
| **Expected Result** | Action blocked per FS 4.2 (meeting must have taken place) |
| **Priority** | High |

---

### SM_CB_096 — Both isSmFeedbackSubmitted and isBuyerFeedbackSubmitted required for COMPLETED

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM has submitted feedback only |
| **Test Steps** | 1. Check status after SM feedback submission only |
| **Expected Result** | Status not yet COMPLETED; waits for buyer feedback per BR 4.4.5 |
| **Priority** | Critical |

---

## SM Feedback Form

### SM_CB_097 — Record Outcome opens Feedback drawer

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request ready for outcome recording |
| **Test Steps** | 1. Click Record Outcome |
| **Expected Result** | FeedbackDrawer opens with outcome selector and feedback form |
| **Priority** | Critical |

---

### SM_CB_098 — vcOutcome dropdown lists all 10 options

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Feedback drawer open |
| **Test Steps** | 1. Open vcOutcome dropdown |
| **Expected Result** | All 10 codes listed: VC_DONE_PREFERENCE, VC_DONE_NO_PREFERENCE, FUTURE_SCHEDULED, FUTURE_RESCHEDULED, MISSED_SCHEDULED_NC, NOT_INTERESTED_LOST, NEVER_CONNECTED, TL_LOST, VC_2_DONE, CP_TO_DRIVE_PREFERENCE per FS 4.3 |
| **Priority** | Critical |

---

### SM_CB_099 — vcOutcome selection mandatory

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Feedback drawer open |
| **Test Steps** | 1. Leave vcOutcome unselected<br>2. Click Submit |
| **Expected Result** | Validation error "Select outcome"; submission blocked per BR 4.4.1 |
| **Priority** | Critical |

---

### SM_CB_100 — Feedback text field captures internal notes

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Feedback drawer open |
| **Test Steps** | 1. Type 200 chars in feedback text<br>2. Verify saved on submit |
| **Expected Result** | Feedback text stored verbatim on request record |
| **Priority** | High |

---

### SM_CB_101 — Rating field mandatory when applicable

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Feedback drawer open |
| **Test Steps** | 1. Leave rating unselected<br>2. Submit |
| **Expected Result** | Error displayed if rating mandatory for outcome |
| **Priority** | High |

---

### SM_CB_102 — Customer interest level field mandatory

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Feedback drawer open |
| **Test Steps** | 1. Leave interest level unset<br>2. Submit |
| **Expected Result** | Validation error; submission blocked |
| **Priority** | High |

---

### SM_CB_103 — Tower / Project preference dropdown captures buyer interest

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Feedback drawer open |
| **Test Steps** | 1. Open tower preference dropdown<br>2. Select option |
| **Expected Result** | Selection saved on submit |
| **Priority** | Medium |

---

### SM_CB_104 — Budget range field captures buyer budget

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Feedback drawer open |
| **Test Steps** | 1. Enter budget range<br>2. Submit |
| **Expected Result** | Budget stored on request record |
| **Priority** | Medium |

---

### SM_CB_105 — Selecting VC_DONE_PREFERENCE triggers VC_REQUEST offer

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Feedback drawer open; outcome = VC_DONE_PREFERENCE |
| **Test Steps** | 1. Select VC_DONE_PREFERENCE<br>2. Submit |
| **Expected Result** | VC_REQUEST offer code created automatically for buyer per WF section 4 and BR 6.5 |
| **Priority** | Critical |

---

### SM_CB_106 — VC_2_DONE also triggers VC_REQUEST offer

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Feedback drawer open |
| **Test Steps** | 1. Select VC_2_DONE<br>2. Submit |
| **Expected Result** | VC_REQUEST offer applied to buyer per WF section 4 |
| **Priority** | High |

---

### SM_CB_107 — Other outcomes do NOT trigger VC_REQUEST offer

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Outcome = NOT_INTERESTED_LOST or similar |
| **Test Steps** | 1. Submit with non-trigger outcome<br>2. Inspect offer records for buyer |
| **Expected Result** | No VC_REQUEST offer created per BR 6.5 |
| **Priority** | High |

---

### SM_CB_108 — Submit sets isSmFeedbackSubmitted = true

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Feedback drawer filled |
| **Test Steps** | 1. Click Submit<br>2. Inspect DB record |
| **Expected Result** | isSmFeedbackSubmitted flag set true per FS 4.5.5 |
| **Priority** | Critical |

---

### SM_CB_109 — Buyer feedback token URL sent on SM feedback submission

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM submits feedback |
| **Test Steps** | 1. Submit feedback<br>2. Check buyer SMS/WhatsApp |
| **Expected Result** | Unique token URL delivered to buyer for feedback submission per BR 4.4.4 |
| **Priority** | Critical |

---

### SM_CB_110 — VC outcome syncs to LeadSquared CRM

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM feedback submitted |
| **Test Steps** | 1. Submit feedback<br>2. Verify LSQ sync logs |
| **Expected Result** | VC outcome recorded in LSQ activity per BR 4.4.3 |
| **Priority** | High |

---

### SM_CB_111 — Cancel button closes drawer without saving

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Feedback drawer open with partial data |
| **Test Steps** | 1. Fill some fields<br>2. Click Cancel |
| **Expected Result** | Drawer closes; no data saved |
| **Priority** | Medium |

---

### SM_CB_112 — Feedback cannot be re-edited after submission

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM feedback already submitted |
| **Test Steps** | 1. Re-open Feedback drawer |
| **Expected Result** | Form read-only or Submit disabled; previously submitted values shown |
| **Priority** | High |

---

### SM_CB_113 — Long feedback text within character limit accepted

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Feedback drawer open |
| **Test Steps** | 1. Enter exactly the max chars allowed<br>2. Submit |
| **Expected Result** | Submission succeeds; text saved fully |
| **Priority** | Low |

---

### SM_CB_114 — Special characters and emojis in feedback handled

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Feedback drawer open |
| **Test Steps** | 1. Type emojis and special chars in feedback<br>2. Submit |
| **Expected Result** | Stored without corruption; renders back the same in detail panel |
| **Priority** | Low |

---

## View Detail Panel

### SM_CB_115 — Clicking a row opens detail side panel

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | At least one request in table |
| **Test Steps** | 1. Click a row |
| **Expected Result** | Detail panel slides in from right with full request info |
| **Priority** | Critical |

---

### SM_CB_116 — Detail panel has Callback Request tab

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Detail panel open |
| **Test Steps** | 1. Inspect tabs |
| **Expected Result** | Callback Request tab present and selected by default |
| **Priority** | High |

---

### SM_CB_117 — Detail panel has Feedback tab

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Detail panel open |
| **Test Steps** | 1. Click Feedback tab |
| **Expected Result** | Feedback tab loads with SM and buyer feedback content if submitted |
| **Priority** | High |

---

### SM_CB_118 — Callback tab shows customer info, status, requested time

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Callback tab open |
| **Test Steps** | 1. Inspect tab content |
| **Expected Result** | Customer name, phone, email, requested datetime, status, assigned SM displayed |
| **Priority** | Critical |

---

### SM_CB_119 — Callback tab shows meeting link when available

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Request SCHEDULED with Teams link |
| **Test Steps** | 1. Open Callback tab |
| **Expected Result** | Teams link rendered clickable; opens MS Teams in new tab |
| **Priority** | High |

---

### SM_CB_120 — Feedback tab shows SM-submitted outcome and notes

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM feedback submitted |
| **Test Steps** | 1. Open Feedback tab |
| **Expected Result** | vcOutcome label, notes, rating, interest level displayed |
| **Priority** | High |

---

### SM_CB_121 — Feedback tab shows buyer feedback when submitted

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Buyer has submitted feedback |
| **Test Steps** | 1. Open Feedback tab |
| **Expected Result** | Buyer rating and comments rendered alongside SM feedback |
| **Priority** | High |

---

### SM_CB_122 — Feedback tab shows pending state when buyer hasn't submitted

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM feedback only |
| **Test Steps** | 1. Open Feedback tab |
| **Expected Result** | Section indicates "Awaiting buyer feedback" or similar |
| **Priority** | Medium |

---

### SM_CB_123 — Close button closes detail panel

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Detail panel open |
| **Test Steps** | 1. Click close (X) button |
| **Expected Result** | Panel closes; table view restored |
| **Priority** | Medium |

---

### SM_CB_124 — ESC key closes detail panel

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Detail panel open |
| **Test Steps** | 1. Press ESC |
| **Expected Result** | Panel closes via keyboard |
| **Priority** | Low |

---

## Role Differences (SM Admin vs SM)

### SM_CB_125 — SM Admin sees requests across all SMs

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Logged in as SM Admin (role 4) |
| **Test Steps** | 1. Load callback requests page<br>2. Inspect Assigned SM column distinct values |
| **Expected Result** | Requests from all SMs visible per BR 1.7.2 |
| **Priority** | Critical |

---

### SM_CB_126 — Standard SM sees only own requests

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Logged in as standard SM (role 5) |
| **Test Steps** | 1. Load callback page<br>2. Inspect Assigned SM column |
| **Expected Result** | Only own name appears in Assigned SM column per BR 1.7.1 |
| **Priority** | Critical |

---

### SM_CB_127 — SM Admin has Assign action available; SM does not

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Two sessions: SM Admin and standard SM |
| **Test Steps** | 1. Compare action menus side-by-side |
| **Expected Result** | Assign visible only for SM Admin; absent for SM |
| **Priority** | Critical |

---

### SM_CB_128 — SM Admin has SM dropdown filter; SM does not

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM Admin and SM sessions |
| **Test Steps** | 1. Inspect filter bar for each role |
| **Expected Result** | SM dropdown filter visible only for SM Admin |
| **Priority** | High |

---

### SM_CB_129 — SM can Schedule, Confirm, Record outcome on own requests

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Standard SM logged in with assigned requests |
| **Test Steps** | 1. Open detail panel<br>2. Inspect available actions |
| **Expected Result** | Schedule / Confirm / Record Outcome actions all enabled per role permissions |
| **Priority** | Critical |

---

### SM_CB_130 — SM Admin can perform all SM actions plus reassignment

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM Admin logged in |
| **Test Steps** | 1. Open detail panel on any request<br>2. Inspect actions |
| **Expected Result** | All SM actions enabled plus Reassign per BR section 2 |
| **Priority** | High |

---

### SM_CB_131 — KPI cards for SM Admin aggregate across all SMs

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM Admin logged in |
| **Test Steps** | 1. Inspect KPI cards<br>2. Compare against system totals |
| **Expected Result** | KPI counts reflect all SMs combined |
| **Priority** | High |

---

### SM_CB_132 — KPI cards for standard SM scoped to own requests

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Standard SM logged in |
| **Test Steps** | 1. Inspect KPI cards |
| **Expected Result** | Counts reflect only own request set |
| **Priority** | High |

---

### SM_CB_133 — SM cannot access reassignment endpoint via direct API call

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | Standard SM JWT obtained |
| **Test Steps** | 1. Send reassignment API request using SM token<br>2. Inspect response |
| **Expected Result** | 403 Forbidden returned; role enforcement at API layer |
| **Priority** | Critical |

---

### SM_CB_134 — SM Admin reassignment audit trail records admin user

| Field | Value |
|-------|-------|
| **Module** | SM – Callback Requests |
| **Pre-conditions** | SM Admin performs reassignment |
| **Test Steps** | 1. Inspect audit log entry |
| **Expected Result** | Record includes admin user ID, timestamp, old SM, new SM per FS 1.8 |
| **Priority** | Medium |

---
