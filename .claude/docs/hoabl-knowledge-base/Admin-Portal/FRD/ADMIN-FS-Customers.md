---
type: feature-spec
portal: Admin Portal
module: Customers
updated: 2026-05-11
status: complete
---

# Admin Portal — Customers Module Feature Specifications

---

# Feature 1: View Registration Dashboard

## 1. Objective
Provide admins with a real-time overview of all buyer registrations, including KPI summary cards and a searchable, filterable data table of all registration records.

## 2. Scope
Default landing page after login. Covers the KPI cards, registration table, filters, and pagination.

## 3. Eligibility / Preconditions
- Admin session required.
- All registered buyers across the active project are displayed.

## 4. UI Changes
- Top row: 6 KPI cards.
- Below: filter bar + registration data table.
- Bottom: pagination controls.

## 5. KPI Cards

> **CORRECTED 2026-05-21:** KPI cards are populated by a SEPARATE aggregate query (`RegistrationUnit.findAll` with `SUM(CASE WHEN ...)` attributes) that does NOT apply any table filter, search, or sort. KPI values always reflect global, project-scoped counts. Filtering the table does NOT recompute KPI tiles. (Source: `admin.controller.js` lines 127–193, confirmed by Tech Lead spec §4.)

| Card | Metric Definition |
|------|------------------|
| Registered | `SUM(CASE WHEN RegistrationUnit.status != 'REFUND' AND registration.status != 'REFUND' THEN 1 ELSE 0 END)` — global project total |
| Inactive (waitlistCount) | `SUM(CASE WHEN RegistrationUnit.status='WAITLIST' AND available_for_allocation=0 THEN 1 ELSE 0 END)` — global |
| Cancelled (refundedCount) | `SUM(CASE WHEN RegistrationUnit.status='REFUND' THEN 1 ELSE 0 END)` — global |
| KYC Pending | `SUM(CASE WHEN status='WINNER' AND is_kyc_submitted=0 THEN 1 ELSE 0 END)` — global |
| Confirmed | `SUM(CASE WHEN status='WINNER' AND is_kyc_submitted=1 THEN 1 ELSE 0 END)` — global |
| Active Towers | `Tower.count({ distinct: true, col: 'towerId', where: { isActive: 1 } })` — separate query, global |

> **CORRECTED 2026-05-21 (dead-code flag):** An `allotedCount` literal exists in source (lines 153–161, 203) but is commented out and NOT returned in the `adminKpi` response. Frontend reading this key receives `undefined`. Do NOT expose or test an "Alloted" KPI tile.

## 6. Table Columns

| Column | Description |
|--------|-------------|
| Registration Number | e.g. GHNG-1000008563 |
| Status | Allocation status (Registered / Booked / Inactive / Cancelled) |
| Process Status | KYC Pending / KYC Completed |
| Home Loan | Home loan approval status |
| Allotted Unit | Unit number if allocated |
| Confirmation Number | Booking confirmation reference |
| Growth Partner HV Code | Channel Partner HV code who registered this buyer |

## 7. Filters

> **CORRECTED 2026-05-21:** The "Allocation Status" filter is sent to the backend as the query param `allotmentStatus` (NOT `allocationStatus`). Accepted values are comma-separated and case-sensitive: `alloted`, `waitlisted`, `booked_online`, `booked_offline`, `refunded`, `registered`. (Source: `admin.controller.js` lines 219, 228, 381; Tech Lead spec §2 and §2.1.)
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
>
> **CORRECTED 2026-05-21 — globalSearch is phone-only:** The "Search by Phone" field maps to `globalSearch` and currently performs a `LIKE %value%` against `User.phone` ONLY. The original OR branches for first_name, last_name, registration_number, confirmation_number, unit_no, and tower_name are commented out in source (lines 288–293). Any text claiming global search covers name / registration / unit / tower is incorrect against the current implementation.
>
> **CORRECTED 2026-05-21 — hasHomeLoan semantics narrowed:** `hasHomeLoan=true` strictly evaluates `HomeLoan.status='completed'` only. The original two-branch `loan_type`/`step` logic is commented out (lines 307–315). `hasHomeLoan=false` evaluates `HomeLoan.status IN ('in_progress', NULL)`.

| Filter | API param | Backend field(s) | Accepted values |
|--------|-----------|------------------|-----------------|
| Search by Phone | `globalSearch` | `User.phone` ONLY (substring) | Free text |
| Allocation Status | `allotmentStatus` | `RegistrationUnits.status` + related (see Tech Spec §2.1) | comma-separated: `alloted`, `waitlisted`, `booked_online`, `booked_offline`, `refunded`, `registered` |
| Process Status — Payment | `paymentStatus` | `RegistrationUnits.status`, `allocation_transaction_id` | comma-separated case-sensitive: `Paid`, `Pending` |
| Process Status — KYC | `kycStatus` | `is_kyc_submitted`, `status`, `allocation_transaction_id` | comma-separated case-sensitive: `KYC Completed`, `KYC Pending` |
| Home Loan | `hasHomeLoan` | `HomeLoan.status` only | comma-separated: `true`, `false` |
| Registration Details | `registrationNumber` | `RegistrationUnits.registration_number` | Free text substring |
| Growth Partner HV Code | `growthPartnerHvCode` | `Broker.hv_code`, `first_name`, `last_name`, full-name CONCAT | Free text substring (OR across 4) |
| Confirmation Number | `unitConfirmationNumber` | `RegistrationUnits.booking_number` | Free text substring |
| Allotted Unit | `unitNo` | `Unit.unit_no`, `Unit.tower_name`, `apartment_type` or `frontend_typology_name` | Free text substring (OR across 4 conditional branches) |
| Reset Filters | — | clears all params; KPI tiles do not change (they are global) | — |

Pagination options: 10 / 20 / 50 / 100 records per page.

## 8. System Actions
- `GET /api/v1/admin/dashboard/all-buyers` with `page`, `limit` query params.
- `isDownload=1` parameter disables pagination and returns all records (for Excel export).

## How to Use

1. **Navigate to Customers:** Log in to the Admin Portal — the Customers dashboard loads automatically as the default landing page.
2. **Read the KPI cards:** Six summary cards at the top show key counts: Registered, Inactive, Cancelled, KYC Pending, Confirmed, and Active Towers. These update in real time.
3. **Browse the registration table:** Scroll down to see the full table of buyer registrations with status, KYC, home loan, and unit details.
4. **Filter the list:** Use the Allocation Status or Process Status dropdowns, or type in the search fields (Registration Details, Growth Partner HV Code, etc.) to narrow results. **Note (CORRECTED 2026-05-21):** the "Search by Phone" field filters by phone number only — it does NOT search across name, registration number, confirmation number, unit number, or tower name. KPI tiles do NOT recompute when filters are applied — they always show global project counts.
5. **Adjust pagination:** Select 10, 20, 50, or 100 records per page using the pagination control at the bottom.
6. **Reset:** Click "Reset Filters" to clear all active filters and return to the full unfiltered list.

---

# Feature 2: Cancel Registration

## 1. Objective
Allow admins to cancel an active booking and trigger a refund of the confirmation amount to the buyer.

## 2. Scope
Row-level action on the Customers registration table. Irreversible — must only be performed on test or eligible records.

## 3. Eligibility / Preconditions
- Registration must have a booked unit with a completed payment transaction.
- Confirmation amount (₹999) must have been collected.
- Action is available for registrations in "Booked" status.

## 4. UI Changes
- Trash icon (delete button) on each row in the registration table.
- Visible for eligible registrations.

## 5. Confirmation Modal

| Element | Content |
|---------|---------|
| Modal Title | Cancel Registration |
| Body | Shows unit number + refund amount (₹999) |
| Confirm Button | "Cancel Registration" (red) |
| Cancel Button | "Close" |

## 6. Validations & Business Rules
1. Refund amount shown in modal is ₹999 (registration confirmation amount).
2. Action is irreversible — no undo after confirmation.
3. Only registrations with an active unit booking can be cancelled.

## 7. System Actions on Confirm
1. RegistrationUnit.allocationStatus → `cancelled`
2. Refund transaction created for ₹999 back to buyer's original payment method.
3. Unit status → `AVAILABLE` (released back to inventory).
4. Python WebSocket service notified to update real-time unit cache.
5. Dashboard KPI counts updated immediately.
6. Toast: "refunded successfully"

## 8. Notifications
- Kaleyra SMS/WhatsApp: cancellation + refund confirmation sent to buyer's mobile.

## 9. Audit & Logging
- Admin user ID, timestamp, Registration ID (GHNG), unit ID, refund amount logged.

## How to Use

1. **Find the registration:** Use filters or search to locate the booking. Filter by Allocation Status = "Booked" to narrow the list.
2. **Click the trash icon:** Click the red delete icon on the registration row you want to cancel.
3. **Review the confirmation modal:** The popup shows the unit number and the refund amount (₹999). Verify this is the correct record.
4. **Confirm cancellation:** Click "Cancel Registration" (red button) to proceed.
5. **Result:** The registration status changes to Cancelled. The unit is released back to inventory (Available). The buyer receives an SMS/WhatsApp notification with cancellation and refund confirmation. The ₹999 refund is processed to the buyer's original payment method.

> **Warning:** This action is irreversible. Only cancel registrations that have been verified as eligible for cancellation.

---

# Feature 3: Home Loan Approval

## 1. Objective
Allow admins to manually approve a buyer's home loan application, enabling their loan to reflect as "approved" in the system.

## 2. Scope
Row-level action accessed via the 3-dot action menu on the registration table.

## 3. Eligibility / Preconditions
- Buyer must have initiated a home loan application (loanType = self or easiloan).
- Current loanApprovalStatus must be `pending` or `null`.

## 4. UI Changes
- 3-dot (…) menu on each row → "Home Loan Approval" option.
- Opens a modal with a toggle to enable approval.

## 5. Form Details

| Field | Type | Description |
|-------|------|-------------|
| Approval Toggle | Toggle switch | ON = approve the home loan |

## 6. Validations & Business Rules
1. Admin approval sets `approvalSource = 'admin'`.
2. `admin_rejected` loans are hidden from the home loan indicator in the customer list — only pending, approved, and admin_approved are shown.
3. Admin can override Easiloan's decision independently.

## 7. System Actions on Submit
1. `RegistrationHomeLoan.loanApprovalStatus` → `admin_approved`
2. `RegistrationHomeLoan.approvalSource` → `admin`
3. HOME_LOAN offer discount becomes eligible for this buyer during allocation.
4. LeadSquared (LSQ): loan approval activity synced to buyer's CRM record.

## 8. Notifications
- Kaleyra SMS/WhatsApp: home loan approval notification to buyer.

## 9. Audit & Logging
- Admin user ID, timestamp, registration ID, loan approval action logged.

## How to Use

1. **Find the registration:** Locate the buyer's registration in the Customers table (search by name, phone, or registration number).
2. **Open the action menu:** Click the 3-dot (…) menu on the row → select "Home Loan Approval".
3. **Enable approval:** In the modal, flip the toggle to ON.
4. **Submit:** Click Submit (or the confirm button).
5. **Result:** The buyer's home loan status updates to "Admin Approved". The HOME_LOAN offer discount becomes eligible for that buyer during the next allocation campaign. The buyer receives an SMS/WhatsApp notification confirming loan approval.

---

# Feature 4: Download Registrations (Export)

## 1. Objective
Allow admins to export all registration records to an Excel file for offline analysis and reporting.

## 2. Scope
Single "Download" button in the Customers module header. **CORRECTED 2026-05-21 — export respects active filters (confirmed via backend service code).** Exports ALL records matching the current active filters across all pages (pagination is disabled via `isDownload=1`). If no filter is active, all records are exported. If a filter is applied (e.g. Allocation Status = Cancelled), only matching records are exported.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- "Download" button in the page header area.

## 5. Form Details
No form — single click triggers download.

## 6. Validations & Business Rules
1. **CORRECTED 2026-05-21 — export respects active filters (confirmed via backend service code).** Export includes ALL records matching the current active filters across all pages (pagination disabled via `isDownload=1`). If no filter is active, all records are exported. If a filter is applied (e.g. Allocation Status = Cancelled), only matching records are exported. The `isDownload=1` flag does NOT bypass filter `where[Op.and]` conditions — it only removes the `limitOffset(limit, page)` pagination.
2. Downloaded file name: `RegistrationData.xlsx`.
3. File contains 17 columns covering all key registration fields.

## 7. System Actions on Click
1. `GET /api/v1/admin/dashboard/all-buyers?isDownload=1` — fetches all records without pagination.
2. Alternatively: `GET /api/v1/admin/export/registrations`.
3. Server generates XLSX file and streams it to browser for download.

## 8. Notifications
None.

## 9. Audit & Logging
- Download action logged with admin user ID and timestamp.

## How to Use

1. **Navigate to the Customers page:** The Download button is in the page header area.
2. **Click "Download":** The file downloads automatically to your browser's default download location.
3. **Open the file:** Open `RegistrationData.xlsx` in Excel or any spreadsheet application.
4. **Note (CORRECTED 2026-05-21 — export respects active filters, confirmed via backend service code):** Active filters ARE respected by the export. The export downloads all matching records across all pages (pagination removed via `isDownload=1`). No active filter = full export. Active filter = filtered export (e.g. Allocation Status = Cancelled → only Cancelled records exported).

---

# Feature 5: Assign Unit (Offline Booking)

## 1. Objective
Enable admins to assign a unit and capture an offline booking payment for registrations that are in "Registered" (available) status, bypassing the online payment gateway for buyers who pay via bank transfer, cheque, or other offline methods.

## 2. Scope
Row-level action on the Customers registration table. Covers unit assignment + offline payment recording in a single transaction.

## 3. Eligibility / Preconditions
1. **Registration Status:** Button visible only when:
   - `allocationStatus = 'available'` (Registered)
   - No unit currently allotted for that registration.
2. **Unit Eligibility:** Only units with status `AVAILABLE` or `RESERVED` are shown in the unit dropdown.

## 4. UI Changes
- "Assign Unit" action button on eligible rows in the registration table.
- Hidden or disabled for all other statuses (Booked, KYC Pending, Confirmed, Cancelled, etc.).

## 5. Form Details (Modal)

### 5.1 Unit Selection

| Field | Type | Mandatory | Notes |
|-------|------|-----------|-------|
| Tower | Dropdown | Yes | Lists all project towers |
| Unit | Dropdown | Yes | Dependent on Tower selection; shows only Available or Reserved units; display: `<Unit No> – <Typology>` (e.g., 1203 – 2 BHK Rise Home) |

### 5.2 Payment / Transaction Details

| Field | Type | Mandatory | Notes |
|-------|------|-----------|-------|
| Transaction ID / Reference No. | Text | Yes | Bank/cheque reference |
| Mode of Transaction | Dropdown | Yes | UPI / NEFT-RTGS / Cheque / Cash |
| Booking Amount | Number | Yes | Admin-entered; no validation against expected amount |
| Transaction Date | Date | Yes | Default: today |
| Upload Proof | File upload | No | Image or PDF of payment proof (cheque copy, transfer screenshot, voucher) |

> **Note shown to admin:** "System does not validate the booking amount. Please ensure the correct amount as per commercial terms."

### 5.3 Buttons

| Button | Behaviour |
|--------|-----------|
| Submit | Validates and executes booking + unit assignment |
| Cancel | Closes modal without any changes |

## 6. Validations & Business Rules
1. Tower, Unit, Transaction ID, Mode, Booking Amount, and Transaction Date are all mandatory.
2. Booking Amount must be greater than 0.
3. **Unit availability re-check at submit:** Before creating the booking, the system re-queries the unit's current status in the database.
   - If unit is no longer Available/Reserved (allotted elsewhere in the interim): error — *"Selected unit is no longer available. Please choose another unit."* — booking is NOT created.
4. **Single booking per registration:** If the registration already has an active unit booking, block with error — *"This registration already has an active unit booking."*
5. Uploaded proof file (if provided) is stored in Azure Blob Storage; URL saved to the transaction record.

## 7. System Actions on Successful Submit

### 7.1 Payment Transaction Record
- Insert into `payment_transactions`:
  - `isOffline = 1`
  - `paymentSource = 'admin'`
  - `status = 'completed'`
  - `gateway = null`
  - `paymentMethod` = selected mode
  - `paymentProof` = Azure Blob URL (if uploaded)
  - `amount` = entered booking amount
  - `createdBy` = admin user ID

### 7.2 Registration Unit Update
- `RegistrationUnit.allocationStatus` → `confirmed`
- `RegistrationUnit.allocationPaymentSource` → `admin`
- `RegistrationUnit.allocatedTower`, `allocatedFloor`, `allocatedUnit` → set from selected unit
- `RegistrationUnit.allocationTransactionId` → new transaction ID

### 7.3 Unit Status Update
- `Unit.status` → `BOOKED`
- Python WebSocket service notified: unit removed from real-time available pool

### 7.4 Mavis (ERP) Sync
1. Create booking record in Mavis Bookings table
2. Update unit status in Mavis Units table

### 7.5 LeadSquared (LSQ) Activities
Three LSQ activities created (same payload as online booking):
1. **Booking Token Activity**
2. **Booking Activity**
3. **Booking Form Activity**

### 7.6 Dashboard Update
- Customers KPI counts refreshed: Registered count decreases, Confirmed/Booked count increases.

## 8. Notifications
- Kaleyra Email + WhatsApp: booking confirmation sent to buyer with unit details and payment acknowledgement.
- Templates: to be provided by Xanadu team.

## 9. Audit & Logging
- Admin user ID
- Timestamp
- Registration ID (GHNG number)
- Unit ID assigned
- Booking amount and mode of transaction
- Payment proof file reference (if uploaded)

## How to Use

1. **Find the eligible registration:** In the Customers table, look for a registration with Allocation Status = "Registered" and no unit assigned. The "Assign Unit" button appears only for these rows.
2. **Click "Assign Unit":** The offline booking modal opens.
3. **Select a unit:** Choose the Tower first from the dropdown, then select the specific Unit. The unit dropdown shows only Available and Reserved units in that tower (format: Unit No – Typology, e.g., 1203 – 2 BHK Rise Home).
4. **Enter payment details:** Fill in:
   - Transaction ID / Reference Number (from the bank transfer, cheque, or UPI receipt)
   - Mode of Transaction (UPI / NEFT-RTGS / Cheque / Cash)
   - Booking Amount (enter the exact amount as per commercial terms — system does not validate this)
   - Transaction Date (defaults to today)
5. **Upload proof (optional):** Attach a payment proof document — cheque image, transfer screenshot, or payment voucher.
6. **Click Submit.**
7. **Result:** The unit is marked as Booked and assigned to the registration. The registration status changes to Confirmed. The buyer receives a booking confirmation via email and WhatsApp. The transaction is recorded as an offline payment.

---

# Backend Gap Reconciliation (2026-05-21)

Service-layer audit findings against `registration-unit.service.js`, `common.service.js`, `registration.service.js`. These notes override conflicting statements above.

### Default project resolution (env-based) <!-- BA correction: GAP-DEV-001, 2026-05-21 -->
If `projectId` is omitted from the request payload, backend substitutes `1` (prod) / `2` (UAT). Applies to every Customers entry-point: list, swap, parking, milestones, offline-assign.

### Unit Swap — previous unit → RESERVED <!-- BA correction: GAP-DEV-003, 2026-05-21 -->
When the swapped-from unit has no remaining consumers, status is set to `RESERVED` (not `AVAILABLE`). RESERVED is not buyer-allocatable; admin must manually flip in Config CMS to re-offer.

### Unit Swap — KYC-branched activity-flag reset <!-- BA correction: GAP-DEV-004, 2026-05-21 -->
Activity-flag reset on swap branches on `isKycSubmitted` (`registration-unit.service.js:174-184, 816-825`):
- `isKycSubmitted=true` → reset admin-side activity flags only.
- `isKycSubmitted=false` → reset self-KYC activity flags only.

### Parking — pool decrement not project-scoped <!-- BA correction: GAP-DEV-006, 2026-05-21 -->
Parking pool fetch is keyed on `lsqTypologyId` only; no `projectId` filter. If two projects share an `lsqTypologyId`, they share the pool.

### Parking — 2-BHK Rise/Peak carve-out via string match <!-- BA correction: GAP-DEV-021, 2026-05-21 -->
`common.service.js:130, 517`: `is2BHKRiseOrPeakHome = typologyName === '2 BHK Rise Home' || typologyName === '2 BHK Peak Home'` — parking is force-disabled for these two typologies. Implemented as a name string match (fragile; should be a typology flag).

### Offline Assign — HOME_LOAN-only offer support <!-- BA correction: GAP-DEV-027, 2026-05-21 -->
`registration-unit.service.js:707-724` fetches only the `HOME_LOAN` offer during offline assign. TODO comment notes parking/home-loan/offers need to be managed from request. Other offer codes are silently dropped.

### Logout cross-reference <!-- BA correction: GAP-TL-019, 2026-05-21 -->
The Customers module assumes a valid JWT throughout. Per Login Feature 3 §6, server-side logout is a no-op — tokens remain valid until 1-day expiry regardless of logout click. Do not rely on token revocation when designing data-isolation tests.
