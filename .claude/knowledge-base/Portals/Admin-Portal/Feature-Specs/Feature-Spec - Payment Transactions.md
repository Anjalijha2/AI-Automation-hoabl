---
type: feature-spec
portal: Admin Portal
module: Payment Transactions
updated: 2026-05-11
status: complete
---

# Admin Portal — Payment Transactions Module Feature Specifications

---

# Feature 1: View Payment Transaction Ledger

## 1. Objective
Provide finance and admin teams with a complete, read-only audit trail of all payment events — online (Easebuzz, Razorpay) and offline (cheque, RTGS) — with filtering, sorting, and export capabilities for reconciliation purposes.

## 2. Scope
Read-only view at `/admin/payment-transactions`. No create, edit, or delete operations. Covers all payment types: allocation booking fee, milestone payments, and registration fees.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Page heading: "Transactions"
- Live total count: "Total 10,226 Payment Transactions" (updates when filters applied)
- Filter controls in the header area
- Paginated transaction table (10 records per page default)

## 5. Table Columns

| Column | Sortable | Filterable | Notes |
|--------|---------|-----------|-------|
| Sr. No. | Yes | No | Sequential display number |
| Registration No. | No | No | e.g. GHNG-1000008563 |
| Transaction ID | No | No | Gateway-issued ID (e.g. S260508075F9CF) |
| Source | No | Yes | Online easebuzz / Online razorpay / Offline |
| Status | No | Yes | completed / cancelled / initiated |
| Unit Reg No. | No | No | Internal unit reference |
| Customer Name | No | No | Buyer's display name |
| Phone | No | No | Buyer's registered mobile |
| Payment Type | No | Yes | Allocation / Milestone / (others) |
| Amount Paid | Yes | No | e.g. ₹6,97,961 |
| Payment Date | Yes | No | Date of transaction |
| Method | No | Yes | Mobile Wallet / Cheque / RTGS / NA |
| Created By | No | No | Admin or system user who initiated |
| Actions | No | No | Eye icon → "Detail view coming soon" |

**Pagination label:** "1–10 of 10,226 records"

## 6. Transaction Status Values

| Status | Meaning |
|--------|---------|
| `initiated` | Payment order created; awaiting gateway response |
| `pending` | Gateway processing in progress |
| `completed` | Payment confirmed — booking locked |
| `failed` | Gateway failure |
| `cancelled` | Buyer cancelled or session timed out |
| `dropped` | Dropped before completing |
| `bounced` | Payment bounced |
| `refunded` | Admin-initiated refund processed |

## 7. System Actions
- `GET /api/v1/admin/payment-transactions` with filter query params.
- Default sort: most recent payment date first.

## How to Use

1. **Navigate to Payment Transactions:** Go to `/admin/payment-transactions` from the left sidebar.
2. **View the ledger:** The table shows all payment transactions — online (Easebuzz, Razorpay) and offline (cheque, RTGS) — sorted by most recent payment date first.
3. **Read the total count:** The header shows the live total number of transactions. This count updates when filters are applied.
4. **Review transaction status:** Use the Status column to identify completed bookings, failed payments, refunds, and cancelled transactions.

---

# Feature 2: Filter & Search Transactions

## 1. Objective
Allow admins to quickly locate specific transactions using date range, free-text, and column filters.

## 2. Scope
Filter controls in the header area of the Payment Transactions page. Filters can be combined.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Date range picker (Start Date → End Date)
- Free-text search box
- Column filter icons on applicable columns (Source, Status, Payment Type, Method)
- Refresh button

## 5. Filter Details

| Filter | Type | Searches |
|--------|------|---------|
| Date Range | Date range picker | Payment Date between start and end (inclusive) |
| Free-text Search | Text input | Customer Name, Phone, Registration Number (partial match) |
| Source | Column dropdown | Online easebuzz / Online razorpay / Offline |
| Status | Column dropdown | completed / cancelled / initiated / (others) |
| Payment Type | Column dropdown | Allocation / Milestone / (others) |
| Method | Column dropdown | Mobile Wallet / Cheque / RTGS / NA |

## 6. Sort

Click column header to cycle: ascending → descending → default:
- Sr. No.
- Amount Paid
- Payment Date

## 7. System Actions
- Filter params appended to `GET /api/v1/admin/payment-transactions` as query parameters.
- Total count badge updates dynamically to reflect filtered result count.

## How to Use

1. **Filter by date range:** Click the Start Date and End Date pickers to select a date range. Only transactions with a Payment Date within that range will appear.
2. **Free-text search:** Type a customer name, phone number, or registration number in the search box. Results update to show partial matches.
3. **Column filters:** Click the filter icon on Source, Status, Payment Type, or Method columns and select a value from the dropdown.
4. **Sort:** Click a sortable column header (Sr. No., Amount Paid, Payment Date) to cycle between ascending, descending, and default sort order.
5. **Combine filters:** All filters can be used together to narrow results further.
6. **Refresh:** Click the Refresh button to reload the latest data from the server without clearing your filters.

---

# Feature 3: Export Transactions

## 1. Objective
Allow admins to download transaction data as a file for reconciliation with accounting systems.

## 2. Scope
"Export" button in the page header.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- "Export" button in the page header.

## 5. Behaviour
- Click triggers file download.
- Download format: to be confirmed (CSV or XLSX).
- Whether export reflects currently applied filters or all records: to be confirmed.

## 6. System Actions
- `GET /api/v1/admin/export/:exportType` with relevant export type parameter.

## How to Use

1. **Navigate to Payment Transactions:** Go to `/admin/payment-transactions`.
2. **Apply filters (if needed):** Set date range or other filters to narrow the data you want to export.
3. **Click "Export":** The transaction file downloads automatically to your browser's download folder.
4. **Open the file:** Open the downloaded file in Excel or your accounting system for reconciliation.

---

# Feature 4: Payment Gateway Configuration

## 1. Objective
Allow admins to enable or disable payment gateways (Easebuzz and Razorpay) system-wide without requiring code deployment.

## 2. Scope
"Settings" button in the Payment Transactions page header. Controls which gateways are available to buyers at checkout across all portals.

## 3. Eligibility / Preconditions
- Admin session required.
- At least one gateway must remain enabled at all times (server-side guard enforced).

## 4. UI Changes
- "Settings" button in header opens a modal: "Payment Gateway Configuration"

## 5. Form Details

| Element | Type | Description |
|---------|------|-------------|
| Easebuzz checkbox | Checkbox | Enable / disable Easebuzz gateway |
| Razorpay checkbox | Checkbox | Enable / disable Razorpay gateway |
| Update button | Button | Saves the configuration |

**Current UAT state:** Both Easebuzz and Razorpay enabled.

## 6. Validations & Business Rules
1. **At-least-one-active guard (server-side):** If admin attempts to disable both gateways simultaneously, server returns an error: *"At least one payment gateway must remain active."* — configuration is NOT saved.
2. **No UI confirmation dialog:** Admin can click "Update" immediately after unchecking a gateway — there is no "Are you sure?" prompt before saving. This is a known risk.
3. Gateway changes take effect system-wide immediately after "Update" is clicked.
4. Buyers with open payment sessions at the time of a gateway disable will fail at checkout.

## 7. System Actions on Update
1. `GET /api/v1/admin/payment-gateways` — fetches current state on modal open.
2. `PUT /api/v1/admin/payment-gateways` — saves updated configuration.
3. Gateway lookup for all new payment sessions uses the updated configuration immediately.

## 8. Notifications
None — no buyer notification when gateway configuration changes.

## 9. Audit & Logging
- Admin user ID, which gateway changed (enabled/disabled), timestamp logged.

## How to Use

1. **Click "Settings"** in the Payment Transactions page header.
2. **Review current gateway status:** The modal shows which gateways (Easebuzz, Razorpay) are currently enabled via checkboxes.
3. **Enable or disable a gateway:** Check or uncheck the gateway you want to change.
4. **Click "Update"** to save the configuration.
5. **Result:** The selected gateways are immediately available (or unavailable) to buyers at checkout across all portals. At least one gateway must remain enabled — the system will reject saving if both are unchecked.

> **Warning:** Disabling a gateway takes effect immediately. Any buyers mid-payment when a gateway is disabled will encounter a checkout failure. Coordinate with your team before making gateway changes during active allocation periods.

---

# Transaction Detail View (Planned — Not Yet Implemented)

## Status
The eye icon on each transaction row currently shows tooltip: *"Detail view coming soon."*

This feature is deferred. When implemented, it will show:
- Full transaction record details
- Gateway response payload
- Linked registration and unit information
- Payment proof (for offline transactions)

API placeholder: `GET /api/v1/admin/payment-transactions/:id` (not yet active)
