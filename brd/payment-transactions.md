# BRD: Payment Transactions

**Module:** Payment Transactions  
**URL:** `https://uat-web.xrportal.in/admin/payment-transactions`  
**Sprint:** TBD  
**Author:** BA Agent  
**Created:** 2026-05-08  
**Status:** Draft

---

## 1. Purpose

The Payment Transactions module provides administrators with a read-only audit ledger of all payment events processed through the XR Portal — both online (via Easebuzz and Razorpay payment gateways) and offline (cheques, RTGS, bank transfers). It also includes a Payment Gateway Configuration panel allowing admins to enable or disable specific payment gateways system-wide.

**Business intent:** Give finance and admin teams full visibility into the payment lifecycle across all customers and registrations, with export capability for reconciliation. Gateway configuration enables the business to switch between Easebuzz and Razorpay without a code deployment.

---

## 2. Screens & Navigation

### 2.1 Navigation Path

Left sidebar → "Transactions" (bank icon) → `/admin/payment-transactions`

### 2.2 Screen: Payment Transactions (`/admin/payment-transactions`)

**Page Header:**
- Heading: "Transactions"
- Tab: "Payment Transactions" (single tab — no other tabs observed)

**Tab Content Layout:**
- Summary line: "Total N Payment Transactions" (e.g., "Total 10226 Payment Transactions")
- Filter row: Date range picker (Start Date to End Date) | Search box
- Action buttons: Refresh | Export | Settings

**Transactions Table:**

| Column | Sortable | Filterable | Description |
|--------|---------|-----------|-------------|
| Sr. No. | Yes (up/down arrows) | No | System sequential number |
| Registration No. | No | No | Customer registration number (e.g., GHNG-1000008563) |
| Transaction ID | No | No | Gateway transaction ID (e.g., S260508075F9CF); "-" for cancelled/initiated |
| Source | No | Yes | Payment source: "Online easebuzz" / "Online razorpay" / "Offline" |
| Status | No | Yes | Transaction status: completed / cancelled / initiated |
| Unit Reg No. | No | No | Unit-level registration number (e.g., GHNG-1000008563-X) |
| Customer Name | No | No | Full name of the customer |
| Phone | No | No | Customer's 10-digit mobile number |
| Payment Type | No | Yes | Type of payment: "Allocation" / other types TBD |
| Amount Paid | Yes (up/down arrows) | No | Amount in INR (₹ format) |
| Payment Date | Yes (up/down arrows) | No | Date and time (DD MMM YYYY, HH:MM AM/PM) |
| Method | No | Yes | Payment method: "Mobile Wallet" / "Cheque" / "RTGS" / "NA" / "-" |
| Created By | No | No | Admin user who logged offline payment; "-" for online payments |
| Actions | No | No | Eye icon (view detail) — "Detail view coming soon" tooltip |

**Pagination:**
- Shows "1-10 of 10226 records"
- Page size selector: 10 / page (dropdown, adjustable)
- Standard prev/next page navigation
- Jump-to-last-page control visible

### 2.3 Transaction Detail View

Clicking the eye (view) icon in Actions column shows a tooltip: "Detail view coming soon". The detail view is NOT yet implemented as of UAT exploration (2026-05-08).

---

## 3. Key Entities & Data Fields

### 3.1 Transaction Entity

| Field | Description | Example Values |
|-------|-------------|----------------|
| Transaction ID (PT-NNNNNNN) | Internal XR Portal transaction ID | PT-0015304 |
| Registration No. | Parent registration (customer-level) | GHNG-1000008563 |
| External Transaction ID | Gateway-issued transaction reference | S260508075F9CF |
| Source | Payment channel + gateway | Online easebuzz, Online razorpay, Offline |
| Status | Gateway/processing status | completed, cancelled, initiated |
| Unit Reg No. | Specific unit registration within the booking | GHNG-1000008563-X |
| Customer Name | Full name | Anjali RegressionOfUAT |
| Phone | Mobile number | 7499097796 |
| Payment Type | Business payment category | Allocation |
| Amount Paid | Transaction amount in INR | ₹ 6,97,961 |
| Payment Date | Timestamp of transaction | 08 May 2026, 10:46 AM |
| Method | Instrument used | Mobile Wallet, Cheque, RTGS, NA |
| Created By | Admin who logged offline payment | Supriya manager |

### 3.2 Transaction Status Values

| Status | Meaning |
|--------|---------|
| completed | Payment successfully processed and confirmed |
| cancelled | Payment attempt initiated but abandoned or failed at gateway |
| initiated | Payment order created but gateway response not yet received |

> Domain Note: Multiple transactions may exist for the same Unit Reg No. — customer can retry after a cancelled attempt. The "completed" status is the only one that results in a locked booking. Systems must prevent double-booking by ensuring only one "completed" allocation payment per Unit Reg No.

### 3.3 Source / Gateway Values

| Source | Gateway | Use Case |
|--------|---------|----------|
| Online easebuzz | Easebuzz | Primary online payment gateway |
| Online razorpay | Razorpay | Alternative online payment gateway |
| Offline | (none) | Cheque / RTGS / bank transfer logged manually by admin |

### 3.4 Payment Method Values

| Method | Description |
|--------|-------------|
| Mobile Wallet | Digital wallet payment via Easebuzz |
| Cheque | Physical cheque — offline payment |
| RTGS | Real-time gross settlement bank transfer — offline |
| NA | Not applicable (payment attempted but no method captured — cancelled/initiated) |
| - (dash) | No method recorded |

### 3.5 Payment Gateway Configuration

Accessible via "Settings" button → Modal: "Payment Gateway Configuration"

| Gateway | Control | Default State (UAT) |
|---------|---------|---------------------|
| Easebuzz | Checkbox (enabled/disabled) | Enabled (checked) |
| Razorpay | Checkbox (enabled/disabled) | Enabled (checked) |

> Domain Red Flag: Disabling a gateway mid-campaign while customers are in the booking flow will cause payment failures. No confirmation dialog or warning about active campaigns was observed. Risk: CRITICAL. Must test the guard behavior.

---

## 4. Business Workflows

### 4.1 Browse Transactions

```
Admin navigates to /admin/payment-transactions
    → Tab "Payment Transactions" active by default
    → Table loads with most recent transactions first (sorted by Payment Date DESC — observed)
    → Summary count shown: "Total 10226 Payment Transactions"
    → Admin can scroll/paginate through records
```

### 4.2 Filter by Date Range

```
Admin selects Start Date in date picker
Admin selects End Date in date picker
    → Table filters to show only transactions within the date range
    → Summary count updates
```

### 4.3 Search Transactions

```
Admin types in search box "Search by Name, Phone, Registration No."
    → Table filters to matching records
    → Supports partial match on Customer Name, Phone, Registration No.
```

### 4.4 Filter by Column

```
Admin clicks filter icon on Source / Status / Payment Type / Method columns
    → Dropdown of filter values appears
    → Admin selects one or more values
    → Table updates to show matching rows only
```

**Known filter values per column:**

| Column | Filter Values |
|--------|-------------|
| Source | Online easebuzz, Online razorpay, Offline |
| Status | completed, cancelled, initiated |
| Payment Type | Allocation (others TBD) |
| Method | Mobile Wallet, Cheque, RTGS, NA |

### 4.5 Sort Table

```
Admin clicks on sortable column headers: Sr. No. | Amount Paid | Payment Date
    → First click: ascending order
    → Second click: descending order
    → Third click: back to default (TBD)
```

### 4.6 Export Transactions

```
Admin clicks "Export" button
    → File download initiated (assumed: CSV or XLSX export of filtered/all transactions)
    → File contains all visible columns
    → Format: TBD (CLARIFICATION needed)
```

> Note: Export was not executed during UAT exploration to avoid unnecessary network load. Format and scope (current filter vs. all records) need confirmation.

### 4.7 Configure Payment Gateways

```
Admin clicks "Settings" button
    → Modal: "Payment Gateway Configuration"
    → Two checkboxes: Easebuzz (checked) | Razorpay (checked)
    → Heading text: "Select Enabled Payment Gateways"
    → Sub-text: "Choose the payment gateways that should remain Active."
    → Admin unchecks a gateway
    → Admin clicks "Update"
    → On success: That gateway is disabled for all new payment initiations
```

> Domain Red Flag: If BOTH gateways are disabled simultaneously, no online payments can be collected. System must prevent or warn when attempting to disable the last active gateway.

### 4.8 View Transaction Detail

```
Admin clicks eye icon on any transaction row
    → Tooltip: "Detail view coming soon"
    → No action taken — feature not yet implemented
```

---

## 5. Filters & Search Capabilities

| Capability | Fields/Values |
|-----------|--------------|
| Date range filter | Start Date - End Date picker |
| Free-text search | Customer Name, Phone, Registration No. |
| Source filter | Online easebuzz / Online razorpay / Offline |
| Status filter | completed / cancelled / initiated |
| Payment Type filter | Allocation (+ others) |
| Method filter | Mobile Wallet / Cheque / RTGS / NA |
| Sort: Sr. No. | Ascending / Descending |
| Sort: Amount Paid | Ascending / Descending |
| Sort: Payment Date | Ascending / Descending |
| Page size | Dropdown: 10 / page (default), other sizes available |

---

## 6. KPIs / Dashboard Metrics

- **Total count:** "Total 10226 Payment Transactions" — updates dynamically when filters are applied
- No chart or KPI cards

---

## 7. Integration Points

| Integrated Module | Relationship |
|-------------------|-------------|
| Allocation | Every allocation payment (customer confirming unit + paying ₹27,000 confirmation amount) generates a Payment Transaction record |
| Customers | Customer Name and Phone appear in transaction records; linking to customer profile via Registration No. |
| Payment Gateways (external) | Easebuzz and Razorpay are the two integrated gateways; transaction IDs are gateway-issued |
| Milestone Payments | Subsequent milestone payments (post-allocation) generate additional transaction records with type likely different from "Allocation" |
| Config/CMS | No direct CMS link to Transactions module |

---

## 8. Acceptance Criteria (High-Level)

### AC-TXN-001: List Page
- Transactions page loads within 5 seconds (10,000+ records — performance is key)
- Total count "Total 10226 Payment Transactions" displayed accurately
- Table renders 10 records per page by default
- All columns display correct data per observed data model

### AC-TXN-002: Search & Filter
- Date range filter narrows results to matching payment dates only
- Free-text search matches Customer Name, Phone, Registration No. (partial match)
- Source filter returns only records matching the selected gateway
- Status filter returns only records with matching status
- Method filter returns only records with matching payment method
- Combined filters (date + search + column filter) work correctly

### AC-TXN-003: Sort
- Clicking Sr. No. header sorts ascending then descending
- Clicking Amount Paid header sorts ascending (lowest first) then descending
- Clicking Payment Date header sorts ascending (oldest first) then descending

### AC-TXN-004: Pagination
- Records load on page navigation (next/prev/number)
- Page size selector changes records per page (10/25/50 — exact values TBD)
- "1-10 of 10226 records" label updates correctly on page change

### AC-TXN-005: Export
- Export button triggers file download
- Exported file contains correct column headers
- Exported data matches visible table data (with active filters applied)
- File format is valid and openable (CSV/XLSX)

### AC-TXN-006: Gateway Configuration
- Settings modal opens on Settings button click
- Easebuzz and Razorpay checkboxes reflect current enabled state
- Update button saves gateway configuration changes
- Disabled gateway is no longer available as payment option for customers
- System warns or prevents disabling the last active gateway (verify guard)

### AC-TXN-007: Transaction Detail
- Eye icon click shows "Detail view coming soon" tooltip
- No broken UI or JS errors on click
- When detail view is implemented: verify all transaction fields displayed correctly

---

## 9. Out of Scope / UAT Limitations

1. **Transaction Detail View:** Feature not yet implemented ("coming soon"). Full detail view testing blocked until feature is delivered.
2. **Offline Payment Logging:** How admins log offline payments (Cheque/RTGS) is not visible from this screen alone. Likely done from the Customers module — the "Created By" field suggests admin-initiated record creation. Workflow TBD.
3. **Milestone Payment Types:** Only "Allocation" payment type observed in UAT data. Other types (Home Confirmation, Construction Linked, etc.) may exist but require data seeding or real milestone triggering.
4. **Export format verification:** Export not executed during UAT exploration. File format, delimiter, encoding need confirmation via test execution.
5. **Gateway configuration impact on live session:** Cannot safely test disabling a gateway on shared UAT environment — risk of disrupting other testers. Use a dedicated test window.
6. **10,000+ record performance:** Load testing with the full 10,226-record dataset requires performance testing infrastructure.

### Open Clarifications

| ID | Question | Impact |
|----|----------|--------|
| CLARIFICATION-TXN-001 | What is the Export file format (CSV or XLSX)? Does it export filtered records or all records? | Export test case |
| CLARIFICATION-TXN-002 | What Payment Type values exist beyond "Allocation"? (e.g., Milestone, Registration, KYC?) | Filter test scope |
| CLARIFICATION-TXN-003 | How are offline payments (Cheque/RTGS) entered into the system? Is there an admin form in this module or Customers? | Offline payment test cases |
| CLARIFICATION-TXN-004 | Does disabling a payment gateway mid-session invalidate pending payment orders? | Critical integration test |
| CLARIFICATION-TXN-005 | Is there a guard preventing both gateways being disabled simultaneously? | Critical gateway config test |
| CLARIFICATION-TXN-006 | What page size options exist in the page size dropdown (beyond 10)? | Pagination test |
| CLARIFICATION-TXN-007 | When will the Transaction Detail view be implemented? | Detail view test cases are gated |
