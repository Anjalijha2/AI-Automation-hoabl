---
module: Payment Transactions
url: https://uat-web.xrportal.in/admin/payment-transactions
sprint: 5
status: BRD Only
spec: (not yet created)
tcs: (not yet created)
updated: 2026-05-10
---

# Module — Payment Transactions

## 1. Overview

Read-only audit ledger of all payment events — online (Easebuzz, Razorpay) and offline (cheque, RTGS). Also includes a Payment Gateway Configuration panel to enable/disable gateways system-wide.

**Business intent:** Finance and admin visibility into the full payment lifecycle with export capability for reconciliation. Gateway configuration enables switching payment providers without code deployment.

**URL:** `https://uat-web.xrportal.in/admin/payment-transactions`
**Auth:** Required — `src/fixtures/.auth/admin.json`
**Page Object:** Not yet created
**Selectors:** Not yet created

## 2. Navigation

Left sidebar → "Transactions" → `/admin/payment-transactions`

## 3. Page Layout

### Header

| Element | Content |
|---------|---------|
| Page Heading | "Transactions" |
| Total Count | "Total 10226 Payment Transactions" (live count, updates with filters) |
| Date Range Filter | Start–End date picker |
| Search Box | Free-text (Customer Name, Phone, Registration No.) |
| Refresh Button | Reloads table |
| Export Button | Downloads transaction data (format unconfirmed — Q-TXN-001) |
| Settings Button | Opens Payment Gateway Configuration modal |

### Transactions Table

| Column | Sortable | Filterable | Notes |
|--------|---------|-----------|-------|
| Sr. No. | Yes | No | Auto-increment |
| Registration No. | No | No | e.g. GHNG-1000008563 |
| Transaction ID | No | No | e.g. S260508075F9CF (gateway-issued) |
| Source | No | Yes | Online easebuzz / Online razorpay / Offline |
| Status | No | Yes | completed / cancelled / initiated |
| Unit Reg No. | No | No | Internal unit reference |
| Customer Name | No | No | e.g. Anjali RegressionOfUAT |
| Phone | No | No | Customer phone |
| Payment Type | No | Yes | Allocation (+ others unconfirmed — Q-TXN-002) |
| Amount Paid | Yes | No | e.g. ₹6,97,961 |
| Payment Date | Yes | No | Date of transaction |
| Method | No | Yes | Mobile Wallet / Cheque / RTGS / NA |
| Created By | No | No | Admin or system user |
| Actions | No | No | Eye icon → "Detail view coming soon" |

**Pagination:**
- Default: 10 records per page
- Label: "1-10 of 10226 records"
- Page size dropdown: 10 default; other values unconfirmed (Q-TXN-006)

### Transaction Detail View

Eye icon on any row → tooltip: "Detail view coming soon" — **NOT YET IMPLEMENTED** (Q-TXN-007)

### Payment Gateway Configuration Modal

**Trigger:** "Settings" button in header
**Content:** Payment Gateway Configuration — 2 checkboxes (one per gateway) + "Update" button

| Gateway | UAT State |
|---------|-----------|
| Easebuzz | Enabled |
| Razorpay | Enabled |

## 4. Features

### Browse and Filter
- Navigate to page → table loads (most recent first)
- Apply date range filter (Start–End date picker)
- Apply free-text search (Customer Name, Phone, Registration No.)
- Apply column filters: Source, Status, Payment Type, Method
- Combine multiple filters simultaneously

### Sort
Click sortable column headers to cycle asc → desc:
- Sr. No.
- Amount Paid
- Payment Date

### Export
"Export" button → file download. Format (CSV vs XLSX) and whether filtered or all records export is unconfirmed (Q-TXN-001).

### Gateway Configuration
Settings → "Payment Gateway Configuration" modal → enable/disable Easebuzz and/or Razorpay checkboxes → "Update" saves configuration.

## 4a. How to Use

### Viewing Payment Transactions

1. Left sidebar → click **"Transactions"** → `/admin/payment-transactions`
2. Table loads all transactions (most recent first)
3. Total count shown in header (e.g. "Total 10226 Payment Transactions")

### Filtering Transactions

- **Date range:** Click the Start/End date pickers → select range → table updates automatically
- **Free-text search:** Type a customer name, phone number, or registration number in the search box → press Enter
- **Column filters:** Click filter icons on Source, Status, Payment Type, Method columns → select values
- Combine multiple filters together to narrow results
- Click **"Refresh"** to reset to unfiltered view

### Sorting Transactions

1. Click column headers **Sr. No.**, **Amount Paid**, or **Payment Date** to sort
2. Click again to toggle between ascending and descending

### Exporting Transaction Data

1. Click the **"Export"** button in the header
2. File downloads automatically (format and scope may vary — see Open Clarifications Q-TXN-001)

### Configuring Payment Gateways

> **Warning:** Disabling a gateway takes effect immediately system-wide. Do not change during an active allocation campaign.

1. Click the **"Settings"** button in the header
2. "Payment Gateway Configuration" modal opens
3. Check or uncheck **Easebuzz** and/or **Razorpay** checkboxes
4. Click **"Update"** to save
5. The system enforces at least one gateway active — attempting to disable both will be rejected

### Viewing Transaction Detail

- Click the **eye icon** on any row → currently shows "Detail view coming soon" — this feature is not yet implemented

---

## 5. Business Rules

1. Transactions table is read-only — no create, edit, or delete operations
2. Table loads most recent transactions first by default
3. Transaction count badge updates dynamically when filters are applied
4. Pagination defaults to 10 records per page
5. Status lifecycle: initiated → completed (confirmed payment) or cancelled (abandoned/failed)
6. "completed" status locks the booking associated with that transaction
7. Gateway changes via Settings take effect immediately system-wide
8. Online transaction IDs are gateway-issued (not internal)
9. Detail view is not yet implemented — eye icon shows "coming soon" tooltip only
10. Offline payments (Cheque/RTGS) — entry mechanism unconfirmed (Q-TXN-003)

### Transaction Status Values

| Status | Meaning |
|--------|---------|
| completed | Payment confirmed — locks associated booking |
| cancelled | Abandoned or failed at gateway |
| initiated | Order created; gateway response pending |

### Payment Source Values

| Source | Gateway |
|--------|---------|
| Online easebuzz | Easebuzz |
| Online razorpay | Razorpay |
| Offline | Cheque / RTGS / other non-gateway |

### Payment Method Values

| Method | Description |
|--------|-------------|
| Mobile Wallet | Digital wallet |
| Cheque | Offline cheque |
| RTGS | Bank transfer |
| NA | Not applicable or unknown |

## 6. Integration Points

| Module | Relationship |
|--------|-------------|
| Allocation | Allocation payment → transaction record created here; registration lock triggered on "completed" |
| Customers | Customer Name + Phone in transaction records; linked via Registration No. |
| Easebuzz / Razorpay | External payment gateways; transaction IDs are gateway-issued; gateway enable/disable controlled here |
| Milestone Payments | Post-allocation milestone payments → additional transaction records here |

## 7. Domain Red Flags

| Flag | Severity | Impact |
|------|----------|--------|
| Disabling a gateway mid-campaign | CRITICAL | Active customers with open payment sessions will fail at checkout; no confirmation dialog observed |
| No guard against disabling both gateways simultaneously | CRITICAL | If both Easebuzz and Razorpay are disabled, all online payments become impossible across entire portal |
| Gateway config change has no confirmation dialog | HIGH | Admin can accidentally disable a gateway during active booking window |
| Detail view not implemented | LOW | Eye icon raises expectation of drill-down but delivers none — potential confusion |

## 8. Open Clarifications

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-TXN-001 | Export format — CSV or XLSX? Does it export currently filtered records or all 10,000+? | Export TC | ⏳ Open |
| Q-TXN-002 | What Payment Type values exist beyond "Allocation"? (Milestone / Registration / KYC / etc.) | Filter TC scope | ⏳ Open |
| Q-TXN-003 | How are offline payments (Cheque/RTGS) entered into the system? Admin form on this page or elsewhere? | Offline TC | ⏳ Open |
| Q-TXN-004 | If a gateway is disabled while a customer has an open payment session, are pending payment orders invalidated? | CRITICAL integration TC | ⏳ Open |
| Q-TXN-005 | Is there a guard preventing both Easebuzz and Razorpay from being disabled simultaneously? | CRITICAL config TC | ⏳ Open |
| Q-TXN-006 | What page size options exist in the page size dropdown beyond 10? | Pagination TC | ⏳ Open |
| Q-TXN-007 | When will the Transaction Detail view ("coming soon") be implemented? | Detail view TCs blocked | ⏳ Open |

## 9. Test Coverage

**Status: Not yet automated. BRD written, pipeline pending.**

| Gate | Status |
|------|--------|
| BRD Written | ✅ 2026-05-08 |
| Selectors (docs/selectors/payment-transactions.json) | ❌ Not created |
| Screen Documentation | ❌ Not created |
| Manual Test Cases | ❌ Not created |
| Automation Script | ❌ Not created |
| Test Execution | ❌ Not run |

**Planned Acceptance Criteria (from BRD):**
- AC-TXN-001: Page loads in <5s for 10,000+ records; count accurate; 10/page default
- AC-TXN-002: All filter combinations work; partial text match; date range accurate
- AC-TXN-003: Sort asc/desc on Sr. No., Amount Paid, Payment Date
- AC-TXN-004: Pagination — navigation works; label "X-Y of N" updates; page size selector works
- AC-TXN-005: Export — file downloads; correct headers; matches filtered data
- AC-TXN-006: Gateway config — modal opens; checkboxes reflect current state; Update saves; disabled gateway removed from checkout
- AC-TXN-007: Eye icon → "Detail view coming soon" tooltip; no JS errors

**UAT Data (observed 2026-05-08):**

| Field | Example |
|-------|---------|
| Internal ID | PT-0015304 |
| Registration No. | GHNG-1000008563 |
| External Transaction ID | S260508075F9CF |
| Customer Name | Anjali RegressionOfUAT |
| Amount Paid | ₹6,97,961 |
| Total Records | 10,226 |

---

## 10. Data Model

### PaymentTransaction (payment_transactions table)

| Field | Type | Notes |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `referenceNo` | STRING(50) UNIQUE | Internal reference (e.g. PT-0015304) |
| `gatewayOrderId` | STRING(100) | Gateway order ID (Razorpay: `order_*`) |
| `transactionId` | STRING(100) | Gateway transaction ID (shown as "Transaction ID" in table) |
| `transactionType` | TINYINT UNSIGNED FK → payment_transaction_types | Payment type (Allocation, Milestone, etc.) |
| `registrationId` | BIGINT UNSIGNED FK → registrations | |
| `registrationUnitId` | INTEGER UNSIGNED FK → registration_units | Single unit (allocation) |
| `registrationUnitIds` | JSON | Multiple units (bulk operations) |
| `milestonePaymentTrackingId` | BIGINT UNSIGNED | Set for milestone payments |
| `userId` | BIGINT UNSIGNED FK → users | Buyer |
| `projectId` | BIGINT UNSIGNED | |
| `cpId` | BIGINT UNSIGNED | CP referral, if applicable |
| `amount` | DECIMAL(10,2) NOT NULL | Amount charged |
| `overpaidAmount` | DECIMAL(10,2) DEFAULT 0 | Overpayment tracked separately |
| `currency` | STRING(3) DEFAULT 'INR' | |
| `paymentSource` | ENUM('user','admin') | Whether initiated by buyer or admin |
| `paymentMethod` | STRING(50) | e.g. 'Mobile Wallet', 'Cheque', 'RTGS', null |
| `status` | ENUM('initiated','pending','completed','failed','cancelled','dropped','bounced','refunded') | |
| `gateway` | STRING(20) DEFAULT 'easebuzz' | 'easebuzz' or 'razorpay' |
| `isOffline` | BOOLEAN DEFAULT 0 | 1 = offline (Cheque/RTGS); 0 = online gateway |
| `isAdditionalUnit` | TINYINT(1) DEFAULT 0 | Additional unit purchase flag |
| `isGst` | TINYINT(1) DEFAULT 0 | |
| `paymentProof` | STRING(1024) | Azure Blob URL for offline payment proof |
| `gatewayResponse` | TEXT (JSON string) | Raw gateway webhook payload |
| `customerName` | STRING(100) | Denormalized buyer name |
| `customerEmail` | STRING(100) | |
| `customerPhone` | STRING(15) | |
| `description` | STRING(255) | |
| `metadata` | JSON | Additional data |
| `createdBy` | BIGINT UNSIGNED | Admin who created (for admin-initiated) |
| `deletedAt` | DATE | Soft delete (paranoid: true) |

**PaymentTransaction.auditEnabled = false** — transactions are NOT audit-logged (audit trail is the transaction record itself).

### Transaction Status Flow

```
initiated  →  pending  →  completed   (payment successful)
               │
               ├─→  failed      (gateway failure)
               ├─→  cancelled   (buyer cancelled / timed out)
               ├─→  dropped     (dropped before completing)
               ├─→  bounced     (payment bounced)
               └─→  refunded    (admin-initiated refund)
```

**"completed" status:** Locks the associated `RegistrationUnit.allocationStatus = 'confirmed'`. The registration is considered booked.

### Payment Source × Gateway Matrix

| `isOffline` | `gateway` | `paymentSource` | UI "Source" column |
|-------------|-----------|-----------------|-------------------|
| 0 | 'easebuzz' | 'user' | Online easebuzz |
| 0 | 'razorpay' | 'user' | Online razorpay |
| 1 | null | 'admin' | Offline |

---

## 11. API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/payment-transactions` | Paginated transaction list with filters |
| GET | `/api/v1/admin/payment-transactions/milestone-types` | Milestone payment type reference list |
| GET | `/api/v1/admin/payment-gateways` | Get gateway configuration (enabled/disabled) |
| PUT | `/api/v1/admin/payment-gateways` | Update gateway configuration |

**Query params for payment-transactions:**
- `page`, `limit` — pagination
- `search` — free-text (Customer Name, Phone, Registration No.)
- `startDate`, `endDate` — date range filter
- `source` — filter by Source column (easebuzz / razorpay / offline)
- `status` — filter by status
- `paymentType` — filter by Payment Type
- `method` — filter by Method

### Payment Gateway Configuration

Gateways stored in a `payment_gateways` table. At-least-one-active guard is enforced in `payment-gateway.service.js` (lines 107–114):

```js
// Guard: cannot disable last active gateway
if (activeAfterUpdate.length === 0) {
  throw new ApiError(httpStatus.BAD_REQUEST, 'At least one payment gateway must remain active');
}
```

This guard is **server-side only** — there is no UI confirmation dialog warning the admin before submission.
