---
module: Customers
url: https://uat-web.xrportal.in/admin/customers
sprint: 1
status: Automated
spec: tests/ui/customers.spec.js
tcs: TC-CST-001–017 (17 tests)
updated: 2026-05-10
---

# Module — Customers

## 1. Overview

Main registration dashboard showing all customer registrations. Includes KPI summary cards, a data table of all registration records, and workflows for: KPI verification, filtering, Home Loan Approval, Cancel Registration, and Download.

**URL:** `https://uat-web.xrportal.in/admin/customers`
**Auth:** Required — `src/fixtures/.auth/admin.json`
**Page Object:** `src/pages/CustomersPage.js` (fixture-based — via `testFixture.js`)
**Selectors:** `docs/selectors/customers.json`

## 2. Navigation

Post-login default page. Left sidebar → "Customers" → `/admin/customers`

## 3. Page Layout

### KPI Cards (top row)

| Card | Metric Definition |
|------|------------------|
| Registered | Count of Active registrations (Booked Offline + Booked Online + Registered + Inactive) |
| Inactive | Count of Inactive registrations |
| Cancelled | Count of Cancelled registrations |
| KYC Pending | Count of Booked + KYC Pending |
| Confirmed | Count of Booked + KYC Completed |
| Active Towers | Count of towers with Active toggle in Config |

**Selector pattern:** `getByRole('heading')` + XPath sibling — NOT `.ant-statistic` (statistic values not accessible via standard class).

### Table

**Heading:** `h3 "X Registration Records"` — total count visible above table.
**`getTableRecordCount()`** reads this heading — NOT `tbody` row count.

| Column | Description |
|--------|-------------|
| Registration Number | e.g. GHNG-1000008563 |
| Status | Allocation status (Registered / Booked / Inactive / Cancelled) |
| Process Status | KYC Pending / KYC Completed / etc. |
| Home Loan | Home loan status |
| Allotted Unit | Unit number if allocated |
| Confirmation Number | Booking confirmation reference |
| Growth Partner HV Code | Channel partner HV code |

### Filters

| Filter | Type |
|--------|------|
| Allocation Status | Dropdown (Registered / Booked / Inactive / Cancelled) |
| Process Status | Dropdown (KYC Pending / KYC Completed / etc.) |
| Registration Details | Inline search |
| Growth Partner HV Code | Inline search |
| Confirmation Number | Inline search |
| Allotted Unit | Inline search |
| Reset Filters | Button — restores full list |

**Filter OK button:** Scoped to `.ant-dropdown:not(.ant-dropdown-hidden)` — avoids hidden dropdown conflict.

### Pagination

- Page size options: 10 / 20 / 50 / 100 per page
- `scrollToPagination()` must be called before pagination interactions — pagination lands below viewport at default viewport height

### Row Actions

| Action | Trigger | Notes |
|--------|---------|-------|
| Cancel Registration | Trash icon | Opens refund modal with unit + ₹999; red "Cancel Registration" button |
| Home Loan Approval | 3-dot (…) menu → "Home Loan Approval" | Modal with toggle to enable |

### Download

"Download" button → exports all records as `RegistrationData.xlsx` with 17 exact column headers (names match actual Excel output, not BRD labels).

## 4. Features

- KPI dashboard with 6 live-count cards
- Filterable, paginated registration table
- Cancel Registration flow with refund confirmation
- Home Loan Approval toggle workflow
- Bulk data download as XLSX
- Cross-module: Active Towers KPI links to Config tower toggle state

## 4a. How to Use

### Viewing the Customer Dashboard

1. After login → Customers page opens automatically
2. KPI cards at top show live counts: Registered, Inactive, Cancelled, KYC Pending, Confirmed, Active Towers
3. Table below shows all registration records (default: all, most recent first)

### Searching and Filtering

1. Use dropdown filters at top of the table to narrow by **Allocation Status** (Registered / Booked / Inactive / Cancelled) or **Process Status** (KYC Pending / KYC Completed / etc.)
2. Use inline search fields to filter by: Registration Details, Growth Partner HV Code, Confirmation Number, or Allotted Unit
3. Click filter **OK** button to apply
4. Click **Reset Filters** to clear all filters and restore the full list

### Changing Records Per Page

1. Scroll to the bottom of the page to reach the pagination bar
2. Click the page size dropdown → select 10 / 20 / 50 / 100
3. Use **Next / Previous** page buttons to navigate

### Cancelling a Registration

> **Warning:** Cancellation is irreversible. Only cancel test registrations or records confirmed as safe to cancel.

1. Find the registration row in the table
2. Click the **trash icon** in the Actions column
3. A confirmation modal shows the unit details and refund amount (₹999)
4. Click red **"Cancel Registration"** button to confirm
5. On success → toast "refunded successfully" appears; status changes to Cancelled

### Approving a Home Loan

1. Find the customer's registration row
2. Click the **three-dot (…) menu** in the Actions column
3. Select **"Home Loan Approval"**
4. Toggle the approval switch in the modal to enable
5. Save/confirm

### Downloading Registration Data

1. Click the **Download** button (top right of page)
2. File `RegistrationData.xlsx` is downloaded with all registration records (17 columns)

> Export always downloads **all records** regardless of active filters.

---

## 5. Business Rules

1. Registered KPI = sum of Booked Offline + Booked Online + Registered + Inactive (NOT just "Registered" status)
2. Active Towers KPI cross-references Config module tower toggle state in real time
3. Cancel Registration requires a confirmation modal showing unit and refund amount (₹999)
4. Cancellation success shows toast "refunded successfully" and changes status to Cancelled
5. Home Loan Approval is accessed via 3-dot menu (not a direct button)
6. KYC Pending = Booked status + KYC Pending process status combined
7. Confirmed = Booked status + KYC Completed process status combined
8. Download exports all records (not just filtered view) as XLSX with 17 columns
9. Table record count is read from `h3 "X Registration Records"` heading, not row count

## 6. Integration Points

| Module | Relationship |
|--------|-------------|
| Config CMS | TC-CST-006 and TC-CST-017 cross-check Active Towers KPI against Config tower toggles |
| Allocation | Allocation status and unit assignment are reflected in customer table columns |
| Sales Managers | Assignable SMs appear in customer SM assignment dropdowns |

## 7. Domain Red Flags

| Flag | Severity | Impact |
|------|----------|--------|
| Cancel Registration is irreversible | HIGH | Cancellation with refund trigger cannot be undone — must only act on test data |
| TC-CST-007 uses live registered record | MEDIUM | Test cancels a real registration; UAT must have a disposable "Registered" status record |
| No "Available" registration on UAT | INFO | TC-CST-013 ENV SKIPped — no Available registrations exist in current UAT data |
| No "Sold" units on UAT | INFO | TC-CST-009 ENV SKIPped — no Sold units exist in current UAT data |

## 8. Open Clarifications

No open clarifications specific to this module.

## 9. Test Coverage

| TC | Priority | Description | Result |
|----|----------|-------------|--------|
| TC-CST-001 | P1 | KPI — Registered Count matches filtered table | ✅ Pass |
| TC-CST-002 | P1 | KPI — Inactive Count | ✅ Pass |
| TC-CST-003 | P1 | KPI — Cancelled Count | ✅ Pass |
| TC-CST-004 | P1 | KPI — KYC Pending Count | ✅ Pass |
| TC-CST-005 | P1 | KPI — Confirmed Count | ✅ Pass |
| TC-CST-006 | P1 | KPI — Active Towers (cross-module with Config) | ✅ Pass |
| TC-CST-007 | P1 | Cancel Registration flow → refund toast → status = Cancelled | ✅ Pass |
| TC-CST-008 | P2 | Home Loan Approval flow (toggle enable) | ✅ Pass |
| TC-CST-009 | P2 | ENV SKIP — no Sold units in UAT | ⏭ Skip |
| TC-CST-013 | P2 | ENV SKIP — no Available registration in UAT | ⏭ Skip |
| TC-CST-014 | P1 | Reset Filters restores full count | ✅ Pass |
| TC-CST-015 | P2 | Download → Excel has correct 17 column headers | ✅ Pass |
| TC-CST-016 | P2 | Pagination: 10/20/50/100 per page + page navigation | ✅ Pass |
| TC-CST-017 | P2 | Active Towers KPI live update (activate tower → KPI +1 → cleanup) | ✅ Pass |

**Key technical notes:**
- TC-CST-015: Reads XLSX with `xlsx` library; closes WPS Office via `taskkill /F /IM et.exe` + `taskkill /F /IM wps.exe`
- TC-CST-016: Always call `scrollToPagination()` before pagination interactions
- Viewport set to 1080×900 to ensure pagination is visible within physical screen bounds

---

## 10. Data Model

### Registration (registrations table)

| Field | Type | Notes |
|-------|------|-------|
| `id` | BIGINT UNSIGNED PK | |
| `userId` | FK → users | Buyer |
| `projectId` | FK → projects | |
| `registrationNumber` | STRING(50) UNIQUE | e.g. GHNG-1000008563 |
| `status` | ENUM('Open','Won','Lost','Refund') | Backend status — maps to UI "Process Status" display |
| `stage` | STRING(50) | Stage label synced from LeadSquared |
| `paymentStatus` | ENUM('pending','success','failed') | Registration fee payment |
| `availableForAllocation` | BOOLEAN | false = blocked from campaign participation |
| `opportunityId` | STRING(50) | LeadSquared opportunity ID |
| `activityId` | STRING(50) | LeadSquared activity ID |
| `brokerId` | FK → users | Channel Partner who registered this buyer |
| `walkInSourceId` | FK → walk_in_sources | Lead source |
| `homeLoanIntent` | BOOLEAN | Buyer indicated loan interest at registration |
| `purchasePurpose` | STRING(100) | |
| `budgetAmount` | STRING(50) | |
| `preferredFloorMin/Max` | TINYINT | |
| `details` | JSON | Full registration form payload |
| `additionalDocuments` | JSON | KYC docs |
| `deletedAt` | DATE | Soft delete (paranoid: true) |

**Default scope:** Excludes `status = 'REFUND'` rows automatically.

### RegistrationUnit (registration_units table)

| Field | Type | Notes |
|-------|------|-------|
| `allocationStatus` | ENUM('confirmed','available','waiting','cancelled','refunded') | What admin Customers table shows as "Status" |
| `status` | ENUM('WAITLIST','PREALLOCATED','ALLOCATED','WINNER','HOLD','REFUND') | Internal allocation engine status |
| `isKycSubmitted` | BOOLEAN | KYC form submitted flag |
| `eVerificationCompleted` | BOOLEAN | Digital OTP verification completed |
| `selfKycSubmitted` | BOOLEAN | |
| `isKycPdfSubmitted` | BOOLEAN | |
| `isParkingSelected` | TINYINT(1) | |
| `parkingCount` | INTEGER | |
| `allocationTransactionId` | FK → payment_transactions | Payment that confirmed booking |
| `confirmationNumber` | STRING(50) | Post-payment confirmation ref |
| `bookingNumber` | STRING(50) | |
| `allocatedTower/Floor/Unit` | STRING(20) | Assigned unit details |
| `hcfTransactionStatus` | ENUM('VERIFICATION','PAID','FAILED') | Home confirmation fee |
| `mavisBookingCreated` | BOOLEAN (nullable) | Mavis CRM sync flag |
| `lsqBookingActivityId` | STRING | LeadSquared activity ref |

### KPI Computation Logic (from SQL in getAllBuyers)

```sql
-- registeredCount: not REFUND status
SUM(CASE WHEN RegistrationUnit.status != 'REFUND' AND registration.status != 'REFUND' THEN 1 ELSE 0 END)

-- waitlistCount: WAITLIST + not available for allocation
SUM(CASE WHEN RegistrationUnit.status = 'WAITLIST' AND available_for_allocation = 0 THEN 1 ELSE 0 END)
```

### allocationStatus → UI Display Mapping

| allocationStatus (DB) | UI Display | Meaning |
|----------------------|------------|---------|
| `confirmed` | Booked | Payment completed, unit locked |
| `available` | Available | Eligible for current campaign |
| `waiting` | Waitlisted | Campaign closed without selection |
| `cancelled` | Cancelled | Admin cancelled |
| `refunded` | Refunded | Refund processed |

---

## 11. API Reference

All endpoints require admin JWT (`Authorization: Bearer <token>`).

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/dashboard/all-buyers` | Paginated registration list + KPI aggregates |
| PUT | `/api/v1/admin/registration-units/:id` | Update registration unit fields |
| PUT | `/api/v1/admin/registration-units/:id/assign-unit` | Assign unit offline (with payment proof upload) |
| PUT | `/api/v1/admin/registration-units/:id/refund` | Refund single registration unit |
| POST | `/api/v1/admin/registration-units/refund-bulk` | Bulk refund via Excel upload |
| GET | `/api/v1/admin/export/:exportType` | Download export (customers, etc.) |
| GET | `/api/v1/admin/registration-status` | Get registration status summary |

**Query params for `all-buyers`:**
- `page`, `limit` — pagination
- `isDownload=1` — returns all records without pagination (for Excel export)
