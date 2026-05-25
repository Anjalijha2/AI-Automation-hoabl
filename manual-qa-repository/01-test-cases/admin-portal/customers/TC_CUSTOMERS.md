# Test Cases — Customers
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-Customers.md (updated 2026-05-21)
**FRD References:** ADMIN-FS-Customers.md · ADMIN-FS-Customers-Milestones.md · ADMIN-FS-Customers-UnitSwap.md · ADMIN-FS-Customers-Parking.md
**Locator Map Version:** v1.5.0
**Last Updated:** 2026-05-21

---

## Customer List & KPI Dashboard

### ADM_CUST_001 — Customers page loads as default landing after login

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §3 |
| **Pre-conditions** | Admin logged in via /admin |
| **Test Steps** | 1. Complete login flow<br>2. Observe URL and page |
| **Expected Result** | URL is /admin/customers; KPI cards row and registration table load within 5 seconds |
| **Priority** | Critical |

---

### ADM_CUST_002 — Verify all 6 KPI cards render at top of page

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 — KPI Cards |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Observe KPI card row at top of page |
| **Expected Result** | Six cards visible in order: Registered, Inactive Registrations, Cancelled Registrations, KYC Pending (Booked), Confirmed (Paid + KYC), Active Towers |
| **Priority** | High |

---

### ADM_CUST_003 — Registered KPI shows numeric count

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §6 Rule 1 |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Locate "Registered" KPI card<br>2. Read displayed count |
| **Expected Result** | Card shows a non-zero numeric count (e.g. 8,673); count is sum of Booked Offline + Booked Online + Registered + Inactive statuses |
| **Priority** | High |

---

### ADM_CUST_004 — Active Towers KPI matches Config tower count

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §6 Rule 2 |
| **Pre-conditions** | Customers page loaded; Config has 2 active towers (Crest, Crown) |
| **Test Steps** | 1. Read Active Towers card count<br>2. Compare to Config → Tower Configuration active count |
| **Expected Result** | Active Towers count equals number of toggles ON in Config |
| **Priority** | High |

---

### ADM_CUST_005 — KPI cards update in real time after tower toggle in Config

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §6 Rule 2 |
| **Pre-conditions** | Customers page loaded; current Active Towers = 2 |
| **Test Steps** | 1. Open Config, toggle one more tower active, click Update<br>2. Return to Customers page, refresh |
| **Expected Result** | Active Towers KPI now shows 3 |
| **Priority** | Medium |

---

### ADM_CUST_006 — Registration table heading shows total record count

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 — Registration Table |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Locate the heading directly above the registration table |
| **Expected Result** | Heading shows "N Registration Records" (e.g. "9,672 Registration Records") |
| **Priority** | High |

---

### ADM_CUST_007 — Registration table displays all 10 columns

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 — Registration Table |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Observe table column headers |
| **Expected Result** | Columns in order: Registration Details, Growth Partner, Phone, Home Loan Details, Confirmation Number, Allotted Unit, Allocation Status, Confirmation, Process Status, Actions |
| **Priority** | High |

---

### ADM_CUST_008 — Most recent registrations shown first

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §5 — Viewing Dashboard |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Note dates in Registration Details column from top row down |
| **Expected Result** | Registrations sorted descending by created date — most recent at top |
| **Priority** | Medium |

---

### ADM_CUST_009 — Registration Details column shows registration number and date

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Inspect a row in Registration Details column |
| **Expected Result** | Cell shows registration number (format: GHNG-NNNNNNNNNN-X) and the date created |
| **Priority** | Medium |

---

### ADM_CUST_010 — Allocation Status column shows valid status values

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Read distinct values in Allocation Status column across pages |
| **Expected Result** | Status values are one of: Registered, Booked Online, Booked Offline, Waitlisted, Cancelled |
| **Priority** | High |

---

### ADM_CUST_011 — Process Status column shows KYC stage values

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Read Process Status column values |
| **Expected Result** | Values are "KYC Pending" or "KYC Completed" |
| **Priority** | Medium |

---

### ADM_CUST_012 — Confirmation column shows "Paid" or blank

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Inspect Confirmation column |
| **Expected Result** | Cells show either "Paid" badge/text or are blank (no payment yet) |
| **Priority** | Medium |

---

### TC_CUST_UI_041 — "Allocation Opened" banner is always rendered above the table

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 (Table States) / Tech Lead TBC #7 |
| **Pre-conditions** | Customers page loaded (any data state, any role with admin access) |
| **Test Steps** | 1. Inspect the area directly above the Registrations table |
| **Expected Result** | A bold "Allocation Opened" label is rendered as the table title; it is a static hardcoded label (NOT data-driven on campaign state); exact-text match is expected |
| **Priority** | Medium |

---

## Search, Filter & Pagination

### ADM_CUST_013 — Search by phone filters table to matching record (phone-only)

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 — Filters / TechSpec §2 row 1 |
| **Pre-conditions** | Customers page loaded; valid registered phone known |
| **Test Steps** | 1. Type phone number in "Search by Phone" field<br>2. Wait for table to filter |
| **Expected Result** | Search by Phone (`globalSearch` param) filters by `User.phone` only. Name, registration number, unit number searches are NOT supported. Table shows only rows where Phone column matches the typed number. |
| **Priority** | Critical |

---

### ADM_CUST_014 — Clearing search restores full list

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §5 — Searching |
| **Pre-conditions** | Search filter applied |
| **Test Steps** | 1. Clear text from "Search by Phone" field<br>2. Wait for reload |
| **Expected Result** | Table returns to showing all records; count returns to original total |
| **Priority** | High |

---

### ADM_CUST_015 — Filter button opens filter panel

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 — Filters and Controls |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Click "Filter" button above table |
| **Expected Result** | Filter panel opens with options for Allocation Status, Home Loan Details, Confirmation, Process Status |
| **Priority** | High |

---

### ADM_CUST_016 — Apply Allocation Status = Registered filter

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers Feature 1 §7 / TechSpec §2 |
| **Pre-conditions** | Filter panel open |
| **Test Steps** | 1. Select "Registered" under Allocation Status (API param `allotmentStatus=registered`)<br>2. Click OK |
| **Expected Result** | Table filters to show only rows with `allotmentStatus=registered`. Accepted API values: `alloted`, `waitlisted`, `booked_online`, `booked_offline`, `refunded`, `registered` |
| **Priority** | High |

---

### ADM_CUST_017 — Apply Process Status = KYC Completed filter

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers Feature 1 §7 |
| **Pre-conditions** | Filter panel open |
| **Test Steps** | 1. Select "KYC Completed" under Process Status<br>2. Click OK |
| **Expected Result** | Table shows only KYC Completed rows |
| **Priority** | Medium |

---

### ADM_CUST_018 — Reset Filters clears all active filters

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers Feature 1 §7 |
| **Pre-conditions** | At least one filter applied |
| **Test Steps** | 1. Click "Reset Filters" |
| **Expected Result** | All filters clear; table reloads full record set |
| **Priority** | High |

---

### ADM_CUST_019 — Apply multiple filters together

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers Feature 1 §7 |
| **Pre-conditions** | Filter panel open |
| **Test Steps** | 1. Select Allocation Status = Booked Online<br>2. Select Confirmation = Paid<br>3. Click OK |
| **Expected Result** | Table shows only rows matching BOTH filters (intersection) |
| **Priority** | Medium |

---

### ADM_CUST_020 — Refresh button reloads table data

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Click "Refresh" button<br>2. Observe table |
| **Expected Result** | Table reloads from server; brief loading state may show; no navigation occurs |
| **Priority** | Medium |

---

### ADM_CUST_021 — Pagination shows "1-10 of N items"

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 — Pagination |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Scroll to bottom of table<br>2. Read pagination text |
| **Expected Result** | Text reads "1-10 of N items" where N is total record count |
| **Priority** | Medium |

---

### ADM_CUST_022 — Change page size to 50 per page

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 — Pagination |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Click page size dropdown (default "10 / page")<br>2. Select "50" |
| **Expected Result** | Table reloads showing 50 rows per page; pagination updates to "1-50 of N" |
| **Priority** | Medium |

---

### ADM_CUST_023 — Navigate to next page

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 — Pagination |
| **Pre-conditions** | Customers page loaded; multiple pages exist |
| **Test Steps** | 1. Click Next arrow in pagination |
| **Expected Result** | Table shows next 10 records; pagination updates to "11-20 of N" |
| **Priority** | High |

---

### ADM_CUST_024 — Navigate by direct page number

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 — Pagination |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Click page number "3" in pagination |
| **Expected Result** | Table jumps to page 3; records 21-30 visible |
| **Priority** | Medium |

---

## Customer Actions — Cancel & Home Loan

### ADM_CUST_025 — Delete (trash) icon visible per row

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 — Trash icon |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Inspect Actions column on any non-REFUND row |
| **Expected Result** | Trash icon and three-dot menu icon visible in Actions column. For REFUND rows the cell shows `-` only. |
| **Priority** | High |

---

### ADM_CUST_026 — Click trash icon opens cancel-flow popup (LEGACY — split into TC_CUST_FUNC_042 / 045)

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 §6 Rule 8 |
| **Status** | **CORRECTED 2026-05-21** — original step "shows refund amount ₹999" applies ONLY to Registered/Waitlisted rows, NOT to Booked rows. Booked rows show the Cancel Unit modal (no refund). See TC_CUST_FUNC_042 (Booked) and TC_CUST_FUNC_045 (Registered/Waitlisted). |
| **Pre-conditions** | A registration row available |
| **Test Steps** | (deprecated as a single step — use the split TCs below) |
| **Expected Result** | (deprecated) |
| **Priority** | Critical |

---

### ADM_CUST_027 — Cancel popup shows refund amount ₹999 (LEGACY — Registered/Waitlisted only)

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §6 Rule 8 |
| **Status** | **CORRECTED** — applies ONLY to Registered/Waitlisted rows. Re-targeted as TC_CUST_FUNC_046. Booked rows do NOT show a refund amount. |
| **Priority** | High |

---

### ADM_CUST_028 — Confirm cancel registration shows success toast (LEGACY — Registered/Waitlisted only)

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §6 Rule 8 |
| **Status** | **CORRECTED** — toast text "Registration refunded successfully" applies only to Registered/Waitlisted rows. Booked rows show "Unit cancelled successfully". Re-targeted as TC_CUST_FUNC_047 / TC_CUST_FUNC_044. |
| **Priority** | Critical |

---

### ADM_CUST_029 — Cancel cannot be bypassed without popup confirmation

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §7 |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Click trash icon<br>2. Click outside popup (do not confirm) |
| **Expected Result** | Popup/modal closes; no cancellation occurs; row unchanged |
| **Priority** | High |

---

### ADM_CUST_030 — Three-dot menu opens action dropdown

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 — Three-dot menu |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Click three-dot (…) menu in Actions column |
| **Expected Result** | Dropdown opens with options including "Home Loan Approval" (always) and context-sensitive items (Assign Unit / View Milestones / Unit swap / Update Parking Details) per row state |
| **Priority** | High |

---

### ADM_CUST_031 — Home Loan Approval opens modal with toggle

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers Feature 3 §4 |
| **Pre-conditions** | Three-dot menu open |
| **Test Steps** | 1. Click "Home Loan Approval" |
| **Expected Result** | Modal opens with a toggle switch for home loan approval |
| **Priority** | High |

---

### ADM_CUST_032 — Enable toggle and save approves home loan

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers Feature 3 §7 |
| **Pre-conditions** | Home Loan Approval modal open |
| **Test Steps** | 1. Enable the toggle<br>2. Click Save |
| **Expected Result** | Home loan marked approved (loanApprovalStatus=admin_approved, approvalSource=admin); HOME_LOAN offer becomes eligible for buyer; modal closes |
| **Priority** | Critical |

---

### ADM_CUST_033 — Cancel Bulk Units button opens bulk cancel flow

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §6 Rule 7 |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Click "Cancel Bulk Units" button |
| **Expected Result** | Bulk cancellation interface opens — allows cancelling multiple sub-registrations at once |
| **Priority** | Medium |

---

## Cancel Unit (Booked rows) — NEW SPLIT

### TC_CUST_FUNC_042 — Trash icon on Booked row opens "Cancel Unit" modal (not "Cancel Registration")

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 (Trash icon) + §6 Rule 8 / Tech Lead resolution: status=WINNER + allocationTransactionId !== null |
| **Pre-conditions** | Customers page loaded; locate a row where Allocation Status = Booked Online / Booked Offline (status=WINNER & allocationTransactionId present) |
| **Test Steps** | 1. Hover the trash icon on the Booked row — verify tooltip reads "Cancel Unit"<br>2. Click the trash icon |
| **Expected Result** | Modal opens titled "Please make sure that following actions are completed?" with two attestation checkboxes: "Activity - Token, Form, Booking deleted" and "Mavis - Booking entry deleted". No refund amount shown. |
| **Priority** | Critical |

---

### TC_CUST_FUNC_043 — Cancel Unit Submit is disabled until both attestation checkboxes ticked

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §5 Cancel Unit step 4 |
| **Pre-conditions** | Cancel Unit modal open |
| **Test Steps** | 1. Observe Submit button — should be disabled<br>2. Tick only "Activity - Token, Form, Booking deleted" — observe Submit still disabled<br>3. Tick "Mavis - Booking entry deleted" — observe Submit enabled<br>4. Untick the first checkbox — Submit should disable again |
| **Expected Result** | Submit enables only when BOTH attestation checkboxes are checked. Unchecking either disables Submit immediately. |
| **Priority** | High |

---

### TC_CUST_FUNC_044 — Cancel Unit success toast reads "Unit cancelled successfully"

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §5 Cancel Unit step 5 + §9 Cancel Unit flow |
| **Pre-conditions** | Cancel Unit modal open with both checkboxes ticked, valid test Booked row |
| **Test Steps** | 1. Click Submit<br>2. Observe toast and row state |
| **Expected Result** | Toast "Unit cancelled successfully" appears (NOT "Registration refunded successfully"). Backend invokes PUT adminCancelAllUnits. The allotted unit is released back to inventory. Parent Registration and sibling sub-registrations remain intact. |
| **Priority** | Critical |

---

### TC_CUST_API_048 — PUT adminCancelAllUnits invoked on Cancel Unit submit

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers / API |
| **BRD/FRD Req** | ADMIN-BRD-Customers §6 Rule 8 / Tech Lead resolution |
| **Pre-conditions** | Booked row + Cancel Unit modal submitted |
| **Test Steps** | 1. Capture network traffic on Submit |
| **Expected Result** | A PUT request is sent to `adminCancelAllUnits` endpoint. NO refund transaction is created for this flow. |
| **Priority** | High |

---

## Cancel Registration (Registered / Waitlisted rows) — NEW SPLIT

### TC_CUST_FUNC_045 — Trash icon on Registered/Waitlisted row opens "Cancel Registration" popup

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 (Trash icon) + §6 Rule 8 |
| **Pre-conditions** | Locate a row with Allocation Status = Registered or Waitlisted (no unit allotted, only ₹999 paid) |
| **Test Steps** | 1. Hover the trash icon — verify tooltip reads "Cancel Registration"<br>2. Click the trash icon |
| **Expected Result** | Confirmation popup opens displaying any unit details, refund amount **₹999**, with a red **Cancel Registration** button |
| **Priority** | Critical |

---

### TC_CUST_FUNC_046 — Cancel Registration popup shows refund amount ₹999

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers Feature 2 §5 |
| **Pre-conditions** | Cancel Registration popup open on Registered/Waitlisted row |
| **Test Steps** | 1. Read refund amount text in popup |
| **Expected Result** | Popup displays "₹999" as the refund amount |
| **Priority** | High |

---

### TC_CUST_FUNC_047 — Confirm Cancel Registration shows "Registration refunded successfully"

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §5 Cancel Registration + §9 Cancel Registration flow |
| **Pre-conditions** | Cancel Registration popup open on a test Registered/Waitlisted record |
| **Test Steps** | 1. Click red "Cancel Registration" button |
| **Expected Result** | Backend invokes PUT refundRegistrationUnit. Toast "Registration refunded successfully" appears. Row status → Cancelled. ₹999 refund issued to original payment method. |
| **Priority** | Critical |

---

### TC_CUST_NEG_049 — REFUND-status row shows `-` and no actions

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 (Trash icon) — REFUND state |
| **Pre-conditions** | A row exists with status = REFUND |
| **Test Steps** | 1. Inspect the Actions cell |
| **Expected Result** | Cell shows `-` — neither trash icon nor three-dot menu is rendered |
| **Priority** | Medium |

---

## View Milestones (Booked rows — three-dot menu)

### TC_CUST_FUNC_050 — "View Milestones" menu item visible only on Booked rows

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Milestones §3, §4.1 |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Open three-dot menu on a Registered (no unit) row — verify View Milestones NOT shown<br>2. Open three-dot menu on a Booked row (status=WINNER & allocationTransactionId !== null) — verify View Milestones IS shown |
| **Expected Result** | "View Milestones" appears only when isBooked === true |
| **Priority** | High |

---

### TC_CUST_FUNC_051 — Click View Milestones navigates to /admin/milestone with rn & uid

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Milestones §4.1 |
| **Pre-conditions** | Three-dot menu open on Booked row |
| **Test Steps** | 1. Click "View Milestones"<br>2. Observe URL |
| **Expected Result** | URL = `/admin/milestone?rn=<unitRegistrationNumber>&uid=<unitId>`. Page title "Milestone Payment Schedule" loads with green left bar; header card shows Registration No. and Unit No. read-only |
| **Priority** | Critical |

---

### TC_CUST_FUNC_052 — Milestone page is read-only navigation (no schedule edit / add / delete)

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Milestones §1, §8 Rule 2 |
| **Pre-conditions** | On /admin/milestone for a Booked unit |
| **Test Steps** | 1. Inspect controls on the milestone table |
| **Expected Result** | No buttons to create, edit, reorder, or delete milestones. Only Back link + per-row View (details) + Offline Payment action (where eligible). |
| **Priority** | High |

---

### TC_CUST_FUNC_053 — Milestone payment status pill mapping

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Milestones §5.1 / Tech Lead TBC #2 resolution |
| **Pre-conditions** | A registration unit with mixed milestone payment progress |
| **Test Steps** | 1. Find a milestone with no payments (balance=0) — verify pill<br>2. Find a milestone with partial payment — verify pill<br>3. Find a milestone fully paid — verify pill<br>4. Find a future-dated milestone — verify status cell |
| **Expected Result** | 1. "Pending" pill with clock icon<br>2. "Partial Payment" pill with card icon<br>3. "Paid" pill with check-circle icon<br>4. Status cell is empty/null for future startDate. `ml-or` with total=0 renders `-`. |
| **Priority** | High |

---

### TC_CUST_FUNC_054 — "Offline Payment" button appears on payable milestone rows (page is NOT fully read-only for write)

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Milestones §6.1 / Tech Lead resolution |
| **Pre-conditions** | A milestone row where: milestoneKey !== 'ml-or' OR total !== 0, startDate in past, totalOutstanding > 0 |
| **Test Steps** | 1. Inspect ACTION column on a past-dated milestone with outstanding > 0 |
| **Expected Result** | "Offline Payment" button renders. Future-dated rows or `ml-or` with total=0 do NOT show the button. |
| **Priority** | High |

---

### TC_CUST_FUNC_055 — Offline Payment drawer captures 11 multipart fields

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Milestones §4.4 / Tech Lead TBC #1 |
| **Pre-conditions** | Offline Payment drawer opened for a payable milestone |
| **Test Steps** | 1. Verify the form exposes: registrationNumber (read-only), milestoneKey (hidden/auto), milestoneId (hidden/auto), Amount, paymentType (auto-computed), Payment Method (NEFT/Cheque/Cash/CC/DC/UPI), Transaction ID, Transaction Date & Time, Comments (optional), Payment Proof upload<br>2. Try to submit without paymentProof |
| **Expected Result** | All 10 visible fields render; Submit is blocked when paymentProof is empty (paymentProof is required). Transaction Date disabled for future dates. |
| **Priority** | High |

---

### TC_CUST_FUNC_056 — Back to Customer Listing returns to dashboard with scrollTo

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Milestones §4.2, §7.4 |
| **Pre-conditions** | On /admin/milestone |
| **Test Steps** | 1. Click "Back to Customer Listing" link |
| **Expected Result** | Navigates to `/admin/dashboard?scrollTo=customerTable` |
| **Priority** | Medium |

---

### TC_CUST_NEG_057 — No buyer SMS / Email / WhatsApp sent for View Milestones navigation

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers / Notifications |
| **BRD/FRD Req** | Tech Lead TBC #3 resolution |
| **Pre-conditions** | A Booked registration |
| **Test Steps** | 1. Open View Milestones for the row<br>2. Inspect notification logs / buyer phone for any SMS / WhatsApp / Email |
| **Expected Result** | No buyer-facing notification is dispatched (View Milestones is a read-only navigation; no Kaleyra call) |
| **Priority** | Medium |

---

## Unit Swap (Booked rows — three-dot menu)

### TC_CUST_FUNC_060 — "Unit swap" menu item visible only on Booked rows

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-UnitSwap §3.1 |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Three-dot menu on a Registered row — verify Unit swap NOT shown<br>2. Three-dot menu on a Booked row — verify Unit swap IS shown |
| **Expected Result** | Visible only when status=WINNER && allocationTransactionId !== null |
| **Priority** | High |

---

### TC_CUST_FUNC_061 — Unit Swap modal renders all required UI elements

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-UnitSwap §4.2 |
| **Pre-conditions** | Three-dot menu open on Booked row |
| **Test Steps** | 1. Click "Unit swap"<br>2. Inspect modal |
| **Expected Result** | Modal "Unit Swap" with swap icon; read-only fields: Registration Number, Current Unit (e.g. 2404-Crown), Apartment Type with carpet area; Tower dropdown; Unit dropdown (disabled until tower chosen); two attestation checkboxes; Submit disabled by default |
| **Priority** | High |

---

### TC_CUST_FUNC_062 — Target Unit dropdown shows only AVAILABLE or RESERVED units (any typology)

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-UnitSwap §4.2 / Tech Lead TBC #4 |
| **Pre-conditions** | Unit Swap modal open; tower selected with mixed-status inventory |
| **Test Steps** | 1. Open Unit dropdown |
| **Expected Result** | Lists only units where status ∈ {AVAILABLE, RESERVED}. No BOOKED / SOLD / BLOCKED units. NO typology filter — units of any typology (different apartment type / carpet area) appear. |
| **Priority** | High |

---

### TC_CUST_FUNC_063 — Submit enabled only when tower+unit+both attestations checked

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-UnitSwap §4.2, §6.2 |
| **Pre-conditions** | Unit Swap modal open |
| **Test Steps** | 1. Select tower only — Submit disabled<br>2. Select unit — Submit still disabled<br>3. Tick checkbox 1 — Submit disabled<br>4. Tick checkbox 2 — Submit ENABLED<br>5. Untick either checkbox — Submit disables |
| **Expected Result** | Submit gated on (newUnit selected) && checkbox1 && checkbox2 |
| **Priority** | High |

---

### TC_CUST_FUNC_064 — Successful Unit Swap toast and PUT call

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-UnitSwap §7 |
| **Pre-conditions** | Unit Swap modal valid + submit clicked on a test Booked row when no allocation campaign is open AND no Mavis booking row exists |
| **Test Steps** | 1. Submit<br>2. Verify network + UI |
| **Expected Result** | PUT to `apiUrls.admin.registrationUnitUpdate/:id` with body `{event:"unit-swap", payload:{unitId:"..."}}`. Toast "Unit swapped successfully". Modal closes, swap state resets, customer table refetches; row shows new allotted unit. Old unit → RESERVED, new unit → BOOKED. |
| **Priority** | Critical |

---

### TC_CUST_NEG_065 — Unit Swap BLOCKED when an allocation campaign is active

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-UnitSwap §6 / Tech Lead TBC #8 |
| **Pre-conditions** | An allocation campaign is currently OPEN for the project; pick a Booked row in that project |
| **Test Steps** | 1. Open Unit Swap modal, fill tower/unit, tick both checkboxes, Submit |
| **Expected Result** | Backend returns 400 `"Cannot swap unit when campaign is active"`. UI toast shows the error. RegistrationUnit unchanged. Note: the UI menu item is still rendered (front-end gate is isBooked only); the block happens at backend submission. |
| **Priority** | Critical |

---

### TC_CUST_NEG_066 — Unit Swap BLOCKED when Mavis booking row still exists

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-UnitSwap §6 / Tech Lead TBC #8 |
| **Pre-conditions** | Booked row whose Mavis booking entry has NOT been deleted externally; no active campaign |
| **Test Steps** | 1. Open Unit Swap modal, fill, tick attestations, Submit |
| **Expected Result** | Backend returns 400 `"Mavis booking still exists, please clear that step first"`. Note: the attestation checkbox is admin self-declaration only; backend independently verifies via mavisService.findBookingRowId. |
| **Priority** | High |

---

### TC_CUST_NEG_067 — Unit Swap target = current unit returns 400

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-UnitSwap §6 |
| **Pre-conditions** | Booked row |
| **Test Steps** | 1. In Unit Swap modal, attempt to select the same unit as Current Unit |
| **Expected Result** | Either the dropdown excludes it (current unit's status is BOOKED, so it's already excluded by AVAILABLE/RESERVED filter) OR backend returns 400 `"Registration unit is already linked to the provided unit"` |
| **Priority** | Medium |

---

### TC_CUST_NEG_068 — Unit Swap target already linked to another registration → 409

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-UnitSwap §6 |
| **Pre-conditions** | Two registrations contend on same unit (seeded race-condition scenario) |
| **Test Steps** | 1. Submit Unit Swap targeting a unit already linked to another reg |
| **Expected Result** | 409 `"Requested unit is already assigned to another registration"` |
| **Priority** | Medium |

---

### TC_CUST_NEG_069 — Milestone schedule is NOT auto-regenerated after Unit Swap

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | Tech Lead TBC #5 (commented-out `insertPaymentScheduleandUpdateMilestone`) |
| **Pre-conditions** | A successful Unit Swap just performed on a Booked unit with an existing milestone schedule |
| **Test Steps** | 1. After swap, open View Milestones for the same registration unit |
| **Expected Result** | Milestone schedule rows are PRESERVED from the original unit (no new schedule inserted; backend regeneration is commented out). Flag this as a known limitation if BRD requires regeneration. |
| **Priority** | High |

---

### TC_CUST_NEG_070 — No buyer SMS / Email / WhatsApp sent for Unit Swap

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers / Notifications |
| **BRD/FRD Req** | Tech Lead TBC #3 |
| **Pre-conditions** | A successful Unit Swap |
| **Test Steps** | 1. Inspect Kaleyra / notification logs and buyer phone after swap |
| **Expected Result** | No Kaleyra SMS / WhatsApp / Email is dispatched. Only audit log (ADMIN_UNIT_SWAP) is written backend-side. |
| **Priority** | Medium |

---

### TC_CUST_FUNC_071 — Close (X) on Unit Swap modal resets all state

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-UnitSwap §4.2 |
| **Pre-conditions** | Unit Swap modal open with tower selected, unit selected, both checkboxes ticked |
| **Test Steps** | 1. Click X (close)<br>2. Reopen Unit Swap |
| **Expected Result** | All fields cleared — no tower preselected, no unit, both checkboxes unticked, Submit disabled |
| **Priority** | Low |

---

## Update Parking Details (Booked rows — three-dot menu)

### TC_CUST_FUNC_080 — "Update Parking Details" menu item visible only on Booked rows

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Parking §3.1 |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Three-dot menu on Registered row — verify NOT shown<br>2. Three-dot menu on Booked row — verify IS shown |
| **Expected Result** | Visible only when isBooked === true |
| **Priority** | High |

---

### TC_CUST_FUNC_081 — Parking modal opens with existing state pre-filled

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Parking §3.2 |
| **Pre-conditions** | A Booked unit with isParkingSelected=1, parkingCount=2, parkingAmount=250000 |
| **Test Steps** | 1. Open Update Parking Details |
| **Expected Result** | Modal opens with toggle ON, Parking Count = 2, Parking Amount = 250000, Total Parking Amount preview = 500000 |
| **Priority** | High |

---

### TC_CUST_FUNC_082 — Toggle ON reveals Count + Amount fields (both required on frontend)

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Parking §4.2, §5 |
| **Pre-conditions** | Modal open with toggle OFF |
| **Test Steps** | 1. Flip toggle ON<br>2. Try Submit without filling Count or Amount |
| **Expected Result** | Count + Amount fields appear; Yup validation blocks Submit with "Parking count must be at least 1" / "Parking amount required". Note: backend Yup schema marks both notRequired — this enforcement is frontend-only (Tech Lead TBC #6). |
| **Priority** | High |

---

### TC_CUST_FUNC_083 — Toggle OFF clears Count and Amount fields immediately

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Parking §4.3 |
| **Pre-conditions** | Modal open with toggle ON, Count=2, Amount=250000 entered |
| **Test Steps** | 1. Flip toggle from ON to OFF<br>2. Flip back ON |
| **Expected Result** | On toggle OFF, parkingCount and parkingAmount are immediately set to null (cleared) via setFieldValue, and the input fields are hidden. On toggling back ON, fields are blank — no retained values. |
| **Priority** | Critical |

---

### TC_CUST_VAL_084 — Parking Count must be integer 1–500

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Parking §5 |
| **Pre-conditions** | Modal toggle ON |
| **Test Steps** | 1. Enter 0 — verify error<br>2. Enter 501 — verify cap to 500 or error<br>3. Enter 2.5 — verify integer regex blocks decimal<br>4. Enter -1 — verify rejected |
| **Expected Result** | Only integers 1–500 accepted; otherwise Submit blocked with appropriate Yup error message |
| **Priority** | High |

---

### TC_CUST_VAL_085 — Parking Amount accepts non-negative decimals

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Parking §5 |
| **Pre-conditions** | Modal toggle ON, Count=2 |
| **Test Steps** | 1. Enter 250000.50 — accepted<br>2. Enter -100 — rejected<br>3. Enter empty — rejected |
| **Expected Result** | Decimals allowed; negatives rejected; empty rejected when toggle ON |
| **Priority** | Medium |

---

### TC_CUST_FUNC_086 — Total Parking Amount preview = count × amount

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Parking §4.2 |
| **Pre-conditions** | Modal toggle ON |
| **Test Steps** | 1. Enter Count = 3<br>2. Enter Amount = 250000<br>3. Observe preview |
| **Expected Result** | Preview displays 750000 (or formatted ₹7,50,000) |
| **Priority** | Medium |

---

### TC_CUST_FUNC_087 — Successful Update Parking toast and PUT call

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers-Parking §7 |
| **Pre-conditions** | Booked row, parking modal valid (toggle ON or OFF) |
| **Test Steps** | 1. Submit |
| **Expected Result** | PUT to `apiUrls.admin.registrationUnitUpdate/:id` with `{event:"update-parking", payload:{additionalParkingEnabled, parkingCount, parkingAmount}}`. Toast "Parking details updated successfully". Table refetches with current filters. |
| **Priority** | Critical |

---

### TC_CUST_NEG_088 — Backend rejects "No change in parking count"

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers / API |
| **BRD/FRD Req** | Tech Lead TBC #6 |
| **Pre-conditions** | Existing parkingCount = 2 on the registration unit |
| **Test Steps** | 1. Open modal — toggle ON, Count=2, Amount=any<br>2. Submit |
| **Expected Result** | Backend returns 400 `"No change in parking count"` because delta === 0 |
| **Priority** | High |

---

### TC_CUST_NEG_089 — Backend rejects when pool insufficient

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers / API |
| **BRD/FRD Req** | Tech Lead TBC #6 |
| **Pre-conditions** | Available parking pool = 1 for the typology |
| **Test Steps** | 1. Enter Count=5 (delta exceeds pool)<br>2. Submit |
| **Expected Result** | Backend returns 400 `"Available parking count (X) is less than required (Y)"` |
| **Priority** | High |

---

### TC_CUST_NEG_090 — No buyer SMS / Email / WhatsApp sent for Update Parking

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers / Notifications |
| **BRD/FRD Req** | Tech Lead TBC #3 |
| **Pre-conditions** | A successful parking update |
| **Test Steps** | 1. Inspect notification logs / buyer phone |
| **Expected Result** | No buyer-facing notification dispatched. Audit log ADMIN_UPDATE_PARKING is the only post-action artefact. |
| **Priority** | Medium |

---

## Download & Export

### ADM_CUST_034 — Download button exports RegistrationData.xlsx

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers Feature 4 |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Click "Download" button (top right)<br>2. Wait for download |
| **Expected Result** | File "RegistrationData.xlsx" downloads automatically |
| **Priority** | High |

---

### ADM_CUST_035 — Downloaded file contains all 17 columns

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-FS-Customers Feature 4 §6 |
| **Pre-conditions** | RegistrationData.xlsx downloaded |
| **Test Steps** | 1. Open downloaded file in Excel<br>2. Count columns |
| **Expected Result** | Excel sheet has 17 columns of registration data |
| **Priority** | Medium |

---

### ADM_CUST_036 — Download respects active filters (CORRECTED 2026-05-21)

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §6 Rule 5 / TechSpec §3 |
| **Pre-conditions** | Filter applied (e.g. Allocation Status = Cancelled) |
| **Test Steps** | 1. Apply a filter<br>2. Click Download<br>3. Open file and count rows |
| **Expected Result** | Downloaded XLSX contains only the records matching the currently active filter. If Allocation Status = Cancelled filter is active, XLSX row count equals the Cancelled KPI count. If no filter is active, XLSX contains all records. The `isDownload=1` flag removes pagination only — it does NOT bypass filter `where[Op.and]` conditions. |
| **Priority** | High |

---

### TC_CUST_FUNC_036b — Apply Allocation Status filter then download — XLSX row count = filtered count

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §6 Rule 5 / TechSpec §3 |
| **Pre-conditions** | Apply `allotmentStatus=refunded` filter (Cancelled rows visible in table) |
| **Test Steps** | 1. With filter active, click Download<br>2. Open XLSX and count data rows |
| **Expected Result** | XLSX contains only refunded/cancelled records. Row count matches Cancelled KPI value. Row count is strictly less than the unfiltered export row count. |
| **Priority** | Critical |

---

### TC_CUST_API_005 — GET all-buyers with allotmentStatus=booked_online returns only booked_online rows

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers / API |
| **BRD/FRD Req** | ADMIN-FS-Customers Feature 1 §7 / TechSpec §2 |
| **Pre-conditions** | Valid admin JWT |
| **Test Steps** | 1. GET `/api/v1/admin/dashboard/all-buyers?allotmentStatus=booked_online&isDownload=1`<br>2. Inspect response |
| **Expected Result** | 200 OK. All rows have `allocationPaymentSource != 'admin'` AND `status='WINNER'` AND `allocationTransactionId != null` (booked_online predicate set per TechSpec §2.1). |
| **Priority** | High |

---

### TC_CUST_API_006 — Filtered export row count < unfiltered export row count

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers / API |
| **BRD/FRD Req** | TechSpec §3 |
| **Pre-conditions** | Valid admin JWT; refunded rows exist in data set; refunded rows are a subset (not 100%) of total |
| **Test Steps** | 1. GET `/api/v1/admin/dashboard/all-buyers?isDownload=1&allotmentStatus=refunded` — capture body length<br>2. GET `/api/v1/admin/dashboard/all-buyers?isDownload=1` — capture body length<br>3. Compare |
| **Expected Result** | Filtered row count is strictly less than total row count — confirms `isDownload=1` does NOT bypass filter `where[Op.and]` conditions. |
| **Priority** | High |

---

### TC_CUST_NEG_010 — globalSearch with buyer name returns empty / unfiltered (phone-only)

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | TechSpec §2 row 1 / §7.1 item 1 |
| **Pre-conditions** | Customers page loaded; a known buyer exists with first name "Rahul" |
| **Test Steps** | 1. Enter the buyer's first name "Rahul" in the Search by Phone field<br>2. Wait for table to filter |
| **Expected Result** | Empty state shown OR unfiltered table — the search does NOT match on name. `globalSearch` performs LIKE %value% against `User.phone` ONLY. OR branches for first_name, last_name, registration_number, confirmation_number, unit_no, tower_name are commented out in source. |
| **Priority** | High |

---

### TC_CUST_NEG_011 — KPI counts do NOT change when table filter is applied

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | TechSpec §4 — KPI uses separate aggregate query |
| **Pre-conditions** | Customers page loaded; baseline KPI values captured |
| **Test Steps** | 1. Note all 6 KPI card values (Registered, Inactive, Cancelled, KYC Pending, Confirmed, Active Towers)<br>2. Apply `allotmentStatus=registered` filter<br>3. Re-read all 6 KPI card values |
| **Expected Result** | All 6 KPI card values are unchanged. KPIs are computed by a separate database aggregate query that does NOT apply active table filters, search, or sort. KPI values always reflect global project totals. |
| **Priority** | High |

---

## Customers Negative & Edge Cases

### ADM_CUST_037 — Search with non-existent phone shows empty table

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 — Search |
| **Pre-conditions** | Customers page loaded |
| **Test Steps** | 1. Type "1234567890" (non-existent) in search<br>2. Wait |
| **Expected Result** | Table shows empty state or "No records found"; header count unchanged |
| **Priority** | Medium |

---

### ADM_CUST_038 — Sub-registrations (A, B, C suffixes) shown as separate rows

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §6 Rule 6 |
| **Pre-conditions** | Customer with multiple sub-registrations exists |
| **Test Steps** | 1. Search for the customer phone<br>2. Inspect Registration Details column |
| **Expected Result** | Each sub-registration (GHNG-XXXX-A, -B, -C) appears as its own row |
| **Priority** | Medium |

---

### ADM_CUST_039 — Cancellation is permanent and irreversible

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §6 Rule 3 |
| **Pre-conditions** | A registration just cancelled |
| **Test Steps** | 1. Locate the now-cancelled row<br>2. Try to find an "Undo" or restore option |
| **Expected Result** | No restore mechanism; status remains Cancelled permanently |
| **Priority** | High |

---

### ADM_CUST_040 — KPI counts remain consistent after cancellation

| Field | Value |
|-------|-------|
| **Module** | ADM – Customers |
| **BRD/FRD Req** | ADMIN-BRD-Customers §4 KPI |
| **Pre-conditions** | Cancellation just performed |
| **Test Steps** | 1. Note Cancelled Registrations KPI before<br>2. Cancel one registration<br>3. Refresh and note KPI |
| **Expected Result** | Cancelled Registrations count increments by 1 |
| **Priority** | Medium |

---

## Change Log

| Date | Change |
|------|--------|
| 2026-05-11 | Initial baseline (TCs 001–040) |
| 2026-05-21 | Locator map v1.5.0 + 3 new feature specs. Added: TC_CUST_UI_041; Cancel Unit split TC_CUST_FUNC_042–044, TC_CUST_API_048; Cancel Registration split TC_CUST_FUNC_045–047; TC_CUST_NEG_049 (REFUND row); View Milestones TC_CUST_FUNC_050–056 + TC_CUST_NEG_057; Unit Swap TC_CUST_FUNC_060–064, TC_CUST_NEG_065–070, TC_CUST_FUNC_071; Update Parking TC_CUST_FUNC_080–087, TC_CUST_VAL_084–085, TC_CUST_NEG_088–090. Marked legacy TCs ADM_CUST_026/027/028 as CORRECTED (split into Booked vs Registered/Waitlisted flows). |
| 2026-05-21 (Phase 3) | Backend source audit corrections (TechSpec §2/§3/§4). INVERTED ADM_CUST_036 (export now respects filters). Corrected ADM_CUST_013 (globalSearch is phone-only). Corrected ADM_CUST_016 (param renamed allocationStatus → allotmentStatus). Added: TC_CUST_FUNC_036b (filtered XLSX row count), TC_CUST_API_005 (allotmentStatus=booked_online), TC_CUST_API_006 (filtered < unfiltered export), TC_CUST_NEG_010 (name search returns nothing — phone-only), TC_CUST_NEG_011 (KPI invariant under filter). |
