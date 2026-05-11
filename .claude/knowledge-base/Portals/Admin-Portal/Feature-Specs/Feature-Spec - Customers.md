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

| Card | Metric Definition |
|------|------------------|
| Registered | Count of registrations with allocationStatus = available/confirmed/waiting (excludes cancelled/refunded) |
| Inactive | Count of Inactive registrations |
| Cancelled | Count of Cancelled registrations |
| KYC Pending | Count of Booked + KYC not yet submitted |
| Confirmed | Count of Booked + KYC Completed |
| Active Towers | Count of towers currently toggled Active in Config |

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

| Filter | Type |
|--------|------|
| Allocation Status | Dropdown (Registered / Booked / Inactive / Cancelled) |
| Process Status | Dropdown |
| Registration Details | Inline text search |
| Growth Partner HV Code | Inline text search |
| Confirmation Number | Inline text search |
| Allotted Unit | Inline text search |
| Reset Filters | Button — restores full unfiltered list |

Pagination options: 10 / 20 / 50 / 100 records per page.

## 8. System Actions
- `GET /api/v1/admin/dashboard/all-buyers` with `page`, `limit` query params.
- `isDownload=1` parameter disables pagination and returns all records (for Excel export).

## How to Use

1. **Navigate to Customers:** Log in to the Admin Portal — the Customers dashboard loads automatically as the default landing page.
2. **Read the KPI cards:** Six summary cards at the top show key counts: Registered, Inactive, Cancelled, KYC Pending, Confirmed, and Active Towers. These update in real time.
3. **Browse the registration table:** Scroll down to see the full table of buyer registrations with status, KYC, home loan, and unit details.
4. **Filter the list:** Use the Allocation Status or Process Status dropdowns, or type in the search fields (Registration Details, Growth Partner HV Code, etc.) to narrow results.
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
Single "Download" button in the Customers module header. Exports all records regardless of active filters.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- "Download" button in the page header area.

## 5. Form Details
No form — single click triggers download.

## 6. Validations & Business Rules
1. Export includes ALL records, not just the currently filtered view.
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
4. **Note:** The export always includes all records in the system — active filters on screen do not affect what is exported.

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
