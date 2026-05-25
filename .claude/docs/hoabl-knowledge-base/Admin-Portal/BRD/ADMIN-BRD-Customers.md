# Admin Portal — Customers Module BRD

**Module:** Customers
**URL:** `https://uat-web.xrportal.in/admin/customers`
**Created:** 2026-05-11
**Updated:** 2026-05-21
**Status:** Complete — Automated (Sprint 2); three-dot menu actions (View Milestones, Unit Swap, Update Parking Details) documented separately in their own FS files.

---

## 1. Purpose

The Customers module is the main operational dashboard for the admin team. It shows every buyer registration in the system with live statistics, and provides the tools to manage individual customer records — cancelling registrations, approving home loans, and downloading data for reporting.

This is the first page the admin sees after logging in.

---

## 2. Who Uses This

| User | What They Do Here |
|------|------------------|
| Admin | Monitor all registrations, cancel registrations, approve home loans, download data |
| Sales Manager Admin | Same as Admin |

---

## 3. How to Access

This page opens automatically after login. It can also be reached from the left sidebar by clicking **Customers**, or directly at `/admin/customers`.

---

## 4. Screen Layout

### KPI Cards (Top Row — 6 Cards)

> **CORRECTED 2026-05-21:** KPI cards are computed by a SEPARATE database aggregate query that does NOT apply any active table filter, search, or sort. KPI values always show global project totals. Filtering the table will NOT change the KPI tile numbers. (Source: `admin.controller.js` lines 127–193; Tech Lead spec §4.)
>
> **CORRECTED 2026-05-21 (dead-code flag):** The `allotedCount` KPI value is commented out in source (lines 153–161, 203) and is NOT returned in the `adminKpi` response. There is no "Alloted" KPI tile — do not test or expose this value.

Six summary numbers displayed at the top of the page:

| Card | What It Shows | Definition |
|------|--------------|-----------|
| **Registered** | 8,673 (live) | Count of all active registrations (includes Booked Offline, Booked Online, Registered, and Inactive statuses) |
| **Inactive Registrations** | 5 (live) | Registrations set to inactive |
| **Cancelled Registrations** | 999 (live) | Registrations that have been cancelled |
| **KYC Pending (Booked)** | 94 (live) | Buyers who have paid and booked a unit but not yet completed KYC |
| **Confirmed (Paid + KYC)** | 84 (live) | Buyers who have both paid and completed KYC |
| **Active Towers** | 17 (live) | Number of towers currently set to Active in Config |

All numbers update in real time as the underlying data changes.

### Registration Table

Below the KPI cards, a table shows all registrations. A heading above the table shows the total count: "9,672 Registration Records."

**Table columns:**

| Column | What It Shows |
|--------|--------------|
| Registration Details | Registration number (e.g. GHNG-2000000034-F) and date created |
| Growth Partner | The channel partner (broker) who registered this buyer |
| Phone | Buyer's phone number |
| Home Loan Details | Home loan reference number and discount notice if applicable |
| Confirmation Number | Booking confirmation reference (filled after payment) |
| Allotted Unit | Unit number if a unit has been assigned (e.g. "2404-Crown") |
| Allocation Status | Current status: Registered / Booked Online / Booked Offline / Waitlisted / Cancelled |
| Confirmation | Payment confirmation status: Paid or blank |
| Process Status | KYC stage: KYC Pending / KYC Completed |
| Actions | Trash icon (context-sensitive — see below) and three-dot (…) menu for other actions |

**Trash icon (Actions column) — context-sensitive label:**
- On a **Booked** row (unit allotted, payment received): tooltip shows **"Cancel Unit"**. Cancels just the allotted unit (RegistrationUnit), not the parent Registration. On confirm, toast reads "Unit cancelled successfully". See §5 → Cancelling a Unit (Booked rows).
- On a **Registered** or **Waitlisted** row (no unit allotted yet, only registration fee paid): tooltip shows **"Cancel Registration"**. Refunds the ₹999 registration confirmation amount and cancels the registration. On confirm, toast reads "Registration refunded successfully". See §5 → Cancelling a Registration (Registered / Waitlisted rows).
- For rows in `REFUND` status, the Actions cell shows `-` (no actions available).

**Three-dot (…) menu — context-sensitive options:**

| Menu Item | When It Appears |
|-----------|----------------|
| Assign Unit | Row is Registered AND no unit allotted yet (`canAssignUnit`) — see [[ADMIN-FS-Customers]] Feature 5 |
| View Milestones | Row is Booked — see [[ADMIN-FS-Customers-Milestones]] |
| Unit swap | Row is Booked — see [[ADMIN-FS-Customers-UnitSwap]] |
| Update Parking Details | Row is Booked — see [[ADMIN-FS-Customers-Parking]] |
| Home Loan Approval | Always available — see [[ADMIN-FS-Customers]] Feature 3 |

### Table States

| State | What It Looks Like | Trigger |
|-------|--------------------|---------|
| **Allocation Opened** banner | Bold "Allocation Opened" label rendered above the table (table `title` slot) | **Known UI bug / technical debt:** the label is **statically hardcoded** in source as `title={() => <div style={{ fontWeight: 600 }}>Allocation Opened</div>}` (`CustomerTable.jsx` L1602). It is NOT bound to any state, prop, API field, or campaign-status flag. It renders unconditionally regardless of whether any allocation campaign is currently open. To be made data-driven on active campaign state — engineering task. See §6 Rule 12 and §10. |

### Filters and Controls (Above the Table)

| Control | What It Does |
|---------|-------------|
| **Cancel Bulk Units** button | Cancel multiple registrations at once |
| **Filter** button | Open filter options for the table |
| **Refresh** button | Reload table data from the server |
| **Download** button | Export all registrations as an Excel file |
| **Search by Phone** field | Filter table by customer phone number |

### Pagination (Bottom of Table)

- Shows "1–10 of 9,672 items"
- Page size options: 10, 20, 50, or 100 records per page
- Previous/Next page navigation buttons
- Direct page number navigation

---

## 5. Feature Walkthrough

### Viewing the Dashboard on Login

1. After logging in, the Customers page opens automatically
2. KPI cards show the current live counts at the top
3. The table below lists the most recently created registrations first

### Searching for a Specific Customer

> **CORRECTED 2026-05-21:** "Search by Phone" maps to the `globalSearch` query param and performs a substring match against `User.phone` ONLY. The original OR branches for first_name, last_name, registration_number, confirmation_number, unit_no, and tower_name are commented out in source (lines 288–293). Any prior text claiming this search covers name / registration / unit / tower is incorrect.

1. In the **Search by Phone** field (top right of table), type the customer's phone number
2. The table filters to show matching registrations (phone-only substring match)
3. Clear the field to see all records again

### Filtering Registrations

> **CORRECTED 2026-05-21:** Backend API param names and accepted values (Tech Lead spec §2):
> - **Allocation Status** filter sends `allotmentStatus` (NOT `allocationStatus`). Accepted comma-separated values: `alloted`, `waitlisted`, `booked_online`, `booked_offline`, `refunded`, `registered`.
>
> **UI Label → API Value mapping (Allocation Status):**
>
> | UI Label | API Value |
> |----------|-----------|
> | Registered | `registered` |
> | Booked Online | `booked_online` |
> | Booked Offline | `booked_offline` |
> | Waitlisted | `waitlisted` |
> | Cancelled/Refunded | `refunded` |
> | Alloted (campaign) | `alloted` |
> - **Payment** filter sends `paymentStatus` with case-sensitive values `Paid` or `Pending`.
> - **KYC** filter sends `kycStatus` with case-sensitive values `KYC Completed` or `KYC Pending`.
> - **Home Loan** filter sends `hasHomeLoan=true|false`. `true` evaluates `HomeLoan.status='completed'` only — the original `loan_type`/`step` branches are commented out (lines 307–315). `false` evaluates `HomeLoan.status IN ('in_progress', NULL)`.

1. Click the **Filter** button above the table
2. Select filter criteria:
   - **Allocation Status** (`allotmentStatus`): Registered / Booked Online / Booked Offline / Waitlisted / Cancelled / Alloted
   - **Home Loan Details** (`hasHomeLoan`): Yes (=completed) / No (=in_progress or null) — completion-status only
   - **Confirmation** (`paymentStatus`): Paid / Pending (case-sensitive)
   - **Process Status** (`kycStatus`): KYC Pending / KYC Completed (case-sensitive)
3. Click **OK** to apply
4. The table updates to show only matching records. **KPI tiles above the table do NOT recompute** — they remain at the global project totals.
5. Click **Reset Filters** to clear all filters and show everything again

### Changing Records Per Page

1. Scroll to the bottom of the table to find the pagination bar
2. Click the page size dropdown (shows "10 / page" by default)
3. Select 10, 20, 50, or 100
4. Use the numbered page buttons or Next/Previous arrows to move between pages

### Cancelling a Unit (Booked rows)

> **Scope clarification:** This action operates at **RegistrationUnit** level (one allotted unit / one sub-registration), not at the parent Registration level. A buyer with multiple sub-registrations can have a single allotted unit cancelled here without affecting the others. The trash-icon tooltip on Booked rows reads **"Cancel Unit"** (not "Cancel Registration").

This action is permanent and cannot be reversed. Use only for test records or confirmed cancellations.

1. Find the **booked** registration row in the table (Allocation Status = Booked Online / Booked Offline).
2. Click the **trash** icon in the Actions column. The tooltip reads "Cancel Unit".
3. A confirmation modal opens titled **"Please make sure that following actions are completed?"** with two attestation checkboxes:
   - **Activity - Token, Form, Booking deleted** (CRM cleanup)
   - **Mavis - Booking entry deleted** (ERP cleanup)
4. Both checkboxes must be ticked before the **Submit** button enables.
5. Click **Submit** to confirm. A success message **"Unit cancelled successfully"** appears.
6. The allotted unit is released and the row's allocation reflects the cancellation.

### Cancelling a Registration (Registered / Waitlisted rows)

This is a different action from "Cancel Unit". It refunds the registration confirmation amount (₹999) for buyers who have only registered (no unit allotted yet).

1. Find a **Registered** or **Waitlisted** row in the table (no unit allotted yet).
2. Click the **trash** icon in the Actions column. The tooltip reads "Cancel Registration".
3. A confirmation popup appears showing the unit details (if any) and the refund amount (₹999).
4. Click the red **Cancel Registration** button to confirm.
5. A success message **"Registration refunded successfully"** appears.
6. The registration status changes to Cancelled.

### Approving a Home Loan

1. Find the customer's registration row
2. Click the **three-dot (…)** menu in the Actions column
3. Select **Home Loan Approval** from the dropdown
4. A modal opens with a toggle switch
5. Enable the toggle to mark the home loan as approved
6. Save the change

### Downloading All Registration Data

1. Click the **Download** button (top right area)
2. A file named `RegistrationData.xlsx` downloads automatically
3. The file contains all registration records matching the current active filters (with 17 columns of data). If no filters are active, all 9,672+ records are exported.

Note (CORRECTED 2026-05-21 — export respects active filters, confirmed via backend service code): The export downloads ALL records matching the current active filters across all pages (pagination is disabled via `isDownload=1`). If no filter is active, all records are exported. If a filter is applied (e.g. Allocation Status = Cancelled), only matching records are exported. The `isDownload=1` flag only removes pagination — it does NOT bypass the `where[Op.and]` filter conditions.

### Refreshing the Table

1. Click **Refresh** to reload data from the server without navigating away

---

## 6. Business Rules

1. The **Registered** KPI card counts four different status values together: Booked Offline + Booked Online + Registered + Inactive — it is NOT just the "Registered" status alone. **CORRECTED 2026-05-21:** All KPI cards (Registered, Inactive, Cancelled, KYC Pending, Confirmed, Active Towers) are computed by a separate aggregate query that does NOT apply any active table filter, search, or sort. KPI values always reflect global project-scoped totals — filtering the table does not change the KPI tile numbers. The current implementation cannot recompute KPIs against the filtered set without a code change. (Source: `admin.controller.js` lines 127–193; Tech Lead spec §4.)
2. The **Active Towers** KPI reflects the live tower configuration in the Config module — if an admin changes tower status in Config, this number updates automatically
3. Cancelling a unit OR a registration is permanent and irreversible — always confirm before proceeding
4. The registration table heading (e.g. "9,672 Registration Records") shows the true total count — this is what should be checked, not counting visible rows
5. **CORRECTED 2026-05-21 — export respects active filters (confirmed via backend service code).** The Download button exports ALL records matching the current active filters across all pages (pagination disabled via `isDownload=1`). If no filter is active, all records are exported. If a filter is applied (e.g. Allocation Status = Cancelled), only matching records are exported. The `isDownload=1` flag does NOT bypass filter `where[Op.and]` conditions — it only removes the `limitOffset(limit, page)` pagination wrapper.
6. Each registration can have multiple sub-registrations (e.g. GHNG-2000000034-A, -B, -C) — these represent different unit preferences for the same buyer
7. The Cancel Bulk Units button can cancel multiple sub-registrations at once for bulk operations
8. **Cancel Unit vs Cancel Registration** — the trash icon performs two different actions depending on row state:
   - **Cancel Unit** (Booked rows) operates on `RegistrationUnit` only. It releases the allotted unit; the parent Registration is untouched and any sibling sub-registrations stay intact. Requires admin attestation that off-system cleanup (CRM Activity + Mavis booking entry) was done.
   - **Cancel Registration** (Registered / Waitlisted rows without an allotted unit) cancels the registration and refunds the ₹999 confirmation amount.
9. **Three-dot menu options are context-sensitive** — see §4 for the visibility matrix. Specifically, **Assign Unit** appears only for Registered rows without an allotted unit; **View Milestones**, **Unit swap**, and **Update Parking Details** appear only for Booked rows; **Home Loan Approval** is always available.
10. **View Milestones**, **Unit Swap**, and **Update Parking Details** each have their own feature specification — see [[ADMIN-FS-Customers-Milestones]], [[ADMIN-FS-Customers-UnitSwap]], and [[ADMIN-FS-Customers-Parking]].
11. **Unit Swap eligibility — two-layer gate (resolved):**
    - **UI gate:** the menu item appears only when `status === 'WINNER' && allocationTransactionId !== null` (`isBooked === true`).
    - **Backend gates** (all enforced on submit; failure of any rejects the swap):
      a. **No active allocation campaign** for the project — an open campaign **BLOCKS** swap (`400 'Cannot swap unit when campaign is active'`).
      b. **No existing Mavis booking row** — admin must clear it externally first (`400 'Mavis booking still exists…'`).
      c. **Target unit status** must be `AVAILABLE` or `RESERVED` (any other status: `404 'Requested unit not found'`).
      d. **Target unit has a typology mapped** in the project.
      e. **Target unit not already linked** to another registration (`409 'Requested unit is already assigned…'`).
    - **Typology is NOT enforced** — admin may swap into a different typology / apartment type / carpet area; the dropdown is filtered only by `towerId + projectId + status IN (AVAILABLE, RESERVED)`.
    - See [[ADMIN-FS-Customers-UnitSwap]] §3.2 for full code-level gates.
12. **Allocation Opened banner — static, known technical debt:** The "Allocation Opened" label above the registrations table is **hardcoded inline JSX** (`CustomerTable.jsx` L1602: `title={() => <div style={{ fontWeight: 600 }}>Allocation Opened</div>}`). It is NOT data-driven; it always renders regardless of campaign state. This is a known UI bug — the banner should reflect live campaign state. Flagged for engineering remediation. Test cases must assert the static text is present but should NOT assert it as a meaningful campaign-status signal.
13. **Buyer notifications on Unit Swap / Update Parking / View Milestones — NONE:** None of these three admin actions dispatches any SMS, WhatsApp, or email to the buyer. Confirmed by source scan (`registration-unit.service.js` + grep for `kaleyra|sendSms|sendWhatsapp|sendEmail|sendNotification`). The buyer sees changes only on their next portal refresh. Communicate out-of-band where business requires.
14. **Milestone schedule regeneration on Unit Swap — OPEN GAP:** The backend code path `insertPaymentScheduleandUpdateMilestone(registrationUnit.id, transaction)` is **commented out** with the note "*need to discuss if schedule needs to be changed*" (`registration-unit.service.js` L208–211). After swap, the original unit's milestone schedule and payment transactions remain attached to the registrationUnit — potentially stale if the new unit has a different typology / pricing. Pending product decision. See §10 and [[ADMIN-FS-Customers-UnitSwap]] §10.
16. **CORRECTED 2026-05-21 — globalSearch is phone-only:** The "Search by Phone" field maps to the `globalSearch` query param and currently filters by `User.phone` substring ONLY. All other OR branches (first_name, last_name, registration_number, confirmation_number, unit_no, tower_name) are commented out in source (lines 288–293). Test cases asserting global-search coverage of other fields are invalid.
17. **CORRECTED 2026-05-21 — `allotedCount` KPI is dead code:** The `allotedCount` literal in the KPI aggregate is commented out (lines 153–161, 203) and is NOT returned in `adminKpi`. Frontend reading `adminKpi.allotedCount` receives `undefined`. Do not expose, document, or test this KPI value.
18. **CORRECTED 2026-05-21 — `hasHomeLoan` is completion-status only:** `hasHomeLoan=true` strictly checks `HomeLoan.status='completed'`. The original two-branch `loan_type='self' AND step=1` OR `loan_type='easiloan' AND step=2` logic is commented out (lines 307–315). `hasHomeLoan=false` checks `HomeLoan.status IN ('in_progress', NULL)`.
19. **CORRECTED 2026-05-21 — API param naming:** The Allocation Status filter is sent as `allotmentStatus` (NOT `allocationStatus`). Accepted comma-separated values: `alloted`, `waitlisted`, `booked_online`, `booked_offline`, `refunded`, `registered`. Test fixtures and API specs must use the correct param name.
15. **Parking validation — split frontend/backend enforcement (gap):** The "count + amount required when toggle ON" rule is enforced ONLY by the frontend Formik Yup schema. The backend Yup schema marks both `parkingCount` and `parkingAmount` as `notRequired()`, and the service coerces missing values to `0`. Backend only checks (a) the `additionalParkingEnabled` boolean is present, (b) the delta vs. current count is non-zero, and (c) the typology parking pool has capacity. An API-layer client bypassing the UI can submit `enabled=true, count=0, amount=0` and have it accepted (subject to the delta check). Flagged as a server-side validation gap. See [[ADMIN-FS-Customers-Parking]] §6 Rule 1.

---

## 7. Validations

| Action | Validation |
|--------|-----------|
| Cancel Registration | Confirmation popup must be dismissed (cannot be bypassed) |
| Home Loan Approval | Toggle must be explicitly enabled; modal must be submitted |
| Download | **CORRECTED 2026-05-21** — Export respects active filters (confirmed via backend service code). Exports ALL records matching the current active filters across all pages; pagination is removed via `isDownload=1`. No filter active = full export. Filter active = filtered export. |

---

## 8. Dependencies

| Module | Relationship |
|--------|-------------|
| [Config / CMS](BRD-Config-CMS.md) | Active Towers KPI pulls from tower configuration in Config |
| [Allocation](BRD-Allocation.md) | Allocation status and allotted unit data originates from allocation campaigns |
| [Sales Managers](BRD-Sales-Managers.md) | SM assignment to buyers is shown in buyer records |
| [Channel Partners](BRD-Channel-Partners.md) | Growth Partner (broker HV code) is shown in the registrations table |
| [Payment Transactions](BRD-Payment-Transactions.md) | Payment confirmation data feeds into the Confirmation column |

---

## 9. User Journey Map

**Standard daily use:**

| Step | Actor | Action | System Response | Next Step |
|------|-------|--------|----------------|-----------|
| 1 | Admin | Opens admin portal | Customers page loads with live KPI cards | Step 2 |
| 2 | Admin | Reviews KPI cards | Sees current counts for Registered, Booked, KYC status, Active Towers | Step 3 |
| 3 | Admin | Searches for a customer by phone | Table filters to matching records | Step 4 |
| 4 | Admin | Clicks three-dot menu on a row | Action options appear | Step 5 |
| 5 | Admin | Selects Home Loan Approval | Modal opens with toggle | Step 6 |
| 6 | Admin | Enables toggle, saves | Home loan approved; row updates | Done |

**Cancel Unit flow (Booked rows):**

| Step | Actor | Action | System Response | Next Step |
|------|-------|--------|----------------|-----------|
| 1 | Admin | Finds Booked row to cancel | Row located in table | Step 2 |
| 2 | Admin | Clicks trash icon (tooltip "Cancel Unit") | Modal opens with two attestation checkboxes | Step 3 |
| 3 | Admin | Ticks both checkboxes, clicks Submit | RegistrationUnit cancelled; "Unit cancelled successfully" toast | Done |

**Cancel Registration / refund flow (Registered or Waitlisted rows):**

| Step | Actor | Action | System Response | Next Step |
|------|-------|--------|----------------|-----------|
| 1 | Admin | Finds Registered/Waitlisted row to cancel | Row located in table | Step 2 |
| 2 | Admin | Clicks trash icon (tooltip "Cancel Registration") | Confirmation popup with unit + ₹999 refund | Step 3 |
| 3 | Admin | Clicks red Cancel Registration button | Registration cancelled; "Registration refunded successfully" toast | Done |

---

## 10. Open Questions / Gaps

Closed in Sprint 2: core dashboard / cancel / home loan / download / assign-unit flows confirmed via 17 passing tests.

Re-opened on 2026-05-21 following live UI walkthrough — new three-dot menu actions discovered and documented. Tech Lead source-code review on 2026-05-21 resolved 7 of 8 TBCs; updated below.

| # | Item | Resolution | Status | Owner |
|---|------|-----------|--------|-------|
| 1 | View Milestones FS | Authored from source — all field schemas, status-pill rules, notifications, audit confirmed | **Closed** — see [[ADMIN-FS-Customers-Milestones]] | — |
| 2 | Unit Swap FS | Authored from source — eligibility gates, target-unit filter, notifications, audit confirmed | **Closed** (except item 7 below) — see [[ADMIN-FS-Customers-UnitSwap]] | — |
| 3 | Update Parking Details FS | Authored from source — validation split documented, notifications, audit confirmed | **Closed** — see [[ADMIN-FS-Customers-Parking]] | — |
| 4 | Trash icon scope correction — "Cancel Unit" (Booked) vs "Cancel Registration" (Registered/Waitlisted) | BRD §4, §5, §6 corrected | **Closed** | — |
| 5 | "Allocation Opened" banner — data-driven? | Static hardcoded JSX — known UI bug / technical debt; banner always shows regardless of campaign state. Flagged for engineering remediation. | **Closed (as known bug — fix pending)** | Engineering |
| 6 | Unit Swap eligibility beyond `isBooked` | Two-layer gate: UI on `isBooked`; backend on (no active campaign) + (no Mavis row) + (target AVAILABLE/RESERVED) + (typology mapped) + (not linked elsewhere). Open allocation campaign **blocks** swap. | **Closed** — see §6 Rule 11 | — |
| 7 | **Milestone schedule regeneration on Unit Swap** | Backend code is **commented out** with developer note "need to discuss if schedule needs to be changed". After swap, the buyer keeps the old unit's schedule — potentially stale if new typology / pricing differs. | **OPEN — product decision required** | Product + Engineering |
| 8 | Backend conditional validation for Parking when toggle ON | **Gap confirmed** — backend Yup is `notRequired()`; only frontend Formik enforces required+positive. Backend coerces to 0 and relies on delta + pool checks. | **Closed (gap documented as known server-side validation gap)** — see §6 Rule 15 | Engineering (to harden if business requires) |
| 9 | Buyer notifications on the three new actions | None for Unit Swap, Update Parking, View Milestones. Confirmed by backend grep. | **Closed** — see §6 Rule 13 | — |

**Remaining genuinely open item: #7 — Unit Swap milestone schedule regeneration.** Product input required before engineering can uncomment / implement.

**Note:** The live portal shows 9,672 registration records as of 2026-05-11. This is a live count from UAT data — the number will change as new registrations are created.

---

## Backend Gap Reconciliation (2026-05-21)

Service-layer audit findings against `registration-unit.service.js` and `common.service.js`. These notes supplement existing rules.

### Default project resolution (env-based) <!-- BA correction: GAP-DEV-001, 2026-05-21 -->
- If `projectId` is omitted from any Customer-module request payload, backend silently substitutes `1` (prod) or `2` (UAT). Same fallback repeats across 6+ service entry points. Single-project assumption is currently hard-coded.

### Unit Swap: previous unit goes to RESERVED, not AVAILABLE <!-- BA correction: GAP-DEV-003, 2026-05-21 -->
- When the swapped-from unit has no other consumers, `registration-unit.service.js:201-204` sets it to `RESERVED`, not `AVAILABLE`.
- **Downstream impact:** RESERVED units are NOT visible/allocatable on the buyer portal. Admin must manually flip to AVAILABLE in Config CMS if the unit should be re-offered. Supplements §6 Rule 11.

### Unit Swap: parking pool decrement not project-scoped <!-- BA correction: GAP-DEV-006, 2026-05-21 -->
- `UnitTypology.findOne({ where: { lsqTypologyId } })` — no `projectId` in the where clause. If multiple projects share the same `lsqTypologyId`, the parking pool is effectively shared. Documented for QA when designing multi-project test data.

### Offline Assign: HOME_LOAN-only offer support <!-- BA correction: GAP-DEV-027, 2026-05-21 -->
- TODO in `registration-unit.service.js:707-708`: "parking, home loan, and offers need to be managed from request". Currently only the `HOME_LOAN` offer is fetched. Other offer codes silently ignored on offline assign.

### Logout side-effects on customer-list view (cross-reference) <!-- BA correction: GAP-TL-019, 2026-05-21 -->
- Logout is a server-side no-op (see Login BRD §11). A user who closes the browser without clicking logout — or after clicking logout — still has a usable JWT for up to 1 day. Test data isolation between admin sessions cannot assume token revocation.
