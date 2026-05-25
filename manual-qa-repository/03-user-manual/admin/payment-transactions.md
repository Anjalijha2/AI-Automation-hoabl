# Admin Portal — Payment Transactions Module User Guide

**Audience:** Admin / Finance Team
**URL:** `https://uat-web.xrportal.in/admin/payment-transactions`
**Sources:** ADMIN-BRD-Payment-Transactions.md · ADMIN-FS-Payment-Transactions.md
**Last Updated:** 2026-05-22

---

## Overview

The Payment Transactions module is a read-only ledger of every payment event across the platform — online (Easebuzz, Razorpay) and offline (cheque, RTGS, UPI, cash). Used by finance and admin teams for reconciliation, audit, and operational monitoring. The page also hosts the **Payment Gateway Configuration** — toggles to enable or disable Easebuzz and Razorpay system-wide without code deployment.

There are **no create / edit / delete** operations on transaction records; the only write action on this page is the Gateway Configuration Settings.

Reach the page from the left sidebar → **Payment Transactions** → `/admin/payment-transactions`.

---

## Page Layout (At a Glance)

1. **Header** — Title "Transactions", live count "Total 10,226 Payment Transactions", Date range, Search, Filter icons (Source / Status / Payment Type / Method), Refresh, **Export**, **Settings**.
2. **Transaction Table** — paginated (10 / page default), 14 columns including Sr.No, Registration No, Transaction ID, Amount, Status, Method, etc.
3. **Settings Modal** — Payment Gateway Configuration (Easebuzz + Razorpay checkboxes).
4. **Transaction Detail View** — planned; currently shows *"Detail view coming soon"*.

---

# Feature 1 — View Payment Transaction Ledger

### What it does
Provides a complete, read-only audit trail of all payment events — allocation booking fees, milestone instalments, registration fees, offline payments — across all portals.

### Preconditions
- Admin session.

### How to use
1. Go to `/admin/payment-transactions`.
2. Read the table (default sort: most recent Payment Date first):

| Column | Sortable | Filterable | Notes |
|--------|---------|-----------|-------|
| Sr. No. | Yes | No | Sequential display number |
| Registration No. | No | No | e.g. GHNG-1000008563 |
| Transaction ID | No | No | Gateway-issued ID (e.g. `S260508075F9CF`) |
| Source | No | Yes | Online easebuzz / Online razorpay / Offline |
| Status | No | Yes | initiated / pending / completed / failed / cancelled / dropped / bounced / refunded |
| Unit Reg No. | No | No | Internal unit reference |
| Customer Name | No | No | Buyer's display name |
| Phone | No | No | Buyer's registered mobile |
| Payment Type | No | Yes | Allocation / Milestone / Registration / Offline |
| Amount Paid | Yes | No | INR formatted, e.g. ₹6,97,961 |
| Payment Date | Yes | No | Transaction date |
| Method | No | Yes | Mobile Wallet / Cheque / RTGS / NEFT / UPI / Cash / Credit Card / Debit Card / NA |
| Created By | No | No | Admin or system user |
| Actions | — | — | Eye icon → "Detail view coming soon" |

3. Pagination label: "1–10 of 10,226 records".

### Result
A live, queryable ledger. The total count badge in the header is **filter-aware** — it updates dynamically when filters are applied (unlike the Customers / Channel Partners count badges which are static).

### Note
- API: `GET /api/v1/admin/payment-transactions` with filter query params.
- **Webhook is truth:** transaction status is determined by the gateway webhook, NOT by what the buyer's browser reports. A buyer who closes the browser mid-payment may still be marked `completed` if the webhook arrives.

---

# Feature 2 — Filter & Search Transactions

### What it does
Narrows the ledger by date range, free-text, or column filters. All filters can be combined.

### Preconditions
- Admin session.

### How to use
1. **Date range** — click the Start Date and End Date pickers. Only transactions with Payment Date in the range appear.
2. **Free-text search** — type a Customer Name, Phone, or Registration Number in the search input. Partial match, server-side.
3. **Column filters** — click the funnel icon on Source, Status, Payment Type, or Method and pick a value:

| Filter | Options |
|--------|---------|
| Source | Online easebuzz · Online razorpay · Offline |
| Status | initiated · pending · completed · failed · cancelled · dropped · bounced · refunded |
| Payment Type | Allocation · Milestone · Registration · Offline |
| Method | Mobile Wallet · Cheque · RTGS · NEFT · UPI · Cash · CC · DC · NA |

4. **Sort** — click Sr.No., Amount Paid, or Payment Date column headers to cycle ascending → descending → default.
5. **Refresh** — reloads the latest data without clearing filters.

### Result
A focused subset for reconciliation or investigation. The total count badge updates to reflect the filtered count.

---

# Feature 3 — Export Transactions

### What it does
Downloads a transaction file for offline reconciliation with accounting systems.

### Preconditions
- Admin session.

### How to use
1. Apply filters first if you want to export a subset.
2. Click the **Export** button in the page header.
3. The file downloads automatically to your browser's default download folder.
4. Open in Excel or your accounting tool for reconciliation.

### Result
A downloaded file of the transactions matching the current filter state.

### Note
- API: `GET /api/v1/admin/export/:exportType`.
- File format (CSV or XLSX) and whether export respects active filters: confirm with product before relying on either assumption for downstream automation.

---

# Feature 4 — Payment Gateway Configuration

### What it does
Enables or disables Easebuzz and Razorpay payment gateways system-wide. No code deploy required.

### Preconditions
- Admin session.
- **At least one gateway must remain enabled at all times** (server-side guard).

### How to use
1. Click **Settings** in the page header. The **"Payment Gateway Configuration"** modal opens.
2. Review the current checkbox states:
   - **Easebuzz** — enable or disable.
   - **Razorpay** — enable or disable.
3. Check or uncheck as needed.
4. Click **Update** to save.

### Result
- `PUT /api/v1/admin/payment-gateways` persists the configuration.
- Gateway lookup for **all new payment sessions** uses the updated configuration immediately across every portal.
- Audit log captures which gateway changed, the new state, the admin user, and the timestamp.

### Validation rules
| Rule | Behaviour |
|------|-----------|
| Both gateways unchecked + Update | Server returns error: **"At least one payment gateway must remain active."** Configuration NOT saved. |
| No UI confirmation dialog | "Are you sure?" prompt is NOT shown before save — known risk |

### Warnings — CRITICAL
- **Disabling a gateway takes effect immediately.** Buyers mid-payment when a gateway is disabled will encounter checkout failures.
- **No confirmation dialog** — the **Update** button persists changes on click without re-prompting.
- Coordinate any gateway change with the sales team and avoid during active allocation campaigns.

### Current UAT state
Both Easebuzz and Razorpay are enabled.

---

# Feature 5 — Transaction Detail View (Planned — Not Yet Implemented)

### Status
The **eye icon** on each transaction row currently displays the tooltip: ***"Detail view coming soon."***

### What it will do (when delivered)
- Show the full transaction record (all fields).
- Show the gateway response payload.
- Show linked registration and unit information.
- Show payment proof for offline transactions.

### API placeholder
`GET /api/v1/admin/payment-transactions/:id` (not yet active).

### Note
Do NOT write automated tests asserting drawer/detail content for this feature — it does not exist yet. Track delivery via the product backlog.

---

## Transaction Types

| Type | Description |
|------|-------------|
| **Allocation** | Booking confirmation fee paid during an allocation campaign (e.g. ₹27,000) |
| **Milestone** | Construction-linked payment milestone instalments |
| **Registration** | Initial registration fee (where applicable) |
| **Offline** | Admin-recorded payments (cheque, RTGS, bank transfer, UPI, cash) |

## Transaction Sources

| Source | Gateway |
|--------|---------|
| Online easebuzz | Easebuzz |
| Online razorpay | Razorpay |
| Offline | No gateway — recorded manually by admin (typically via Customers → Assign Unit) |

## Transaction Status Values

| Status | Meaning |
|--------|---------|
| `initiated` | Payment order created; awaiting gateway response |
| `pending` | Gateway processing |
| `completed` | Payment confirmed — booking locked |
| `failed` | Gateway failure |
| `cancelled` | Buyer cancelled or session timed out |
| `dropped` | Dropped before completing |
| `bounced` | Payment bounced |
| `refunded` | Admin-initiated refund processed |

---

## Business Rules

1. **Webhook is truth** — status comes from the gateway webhook, not the buyer's browser.
2. **20-minute hold** on units during payment; auto-release if not completed.
3. **At-least-one gateway** — system blocks disabling both Easebuzz and Razorpay simultaneously.
4. **No confirmation on gateway change** — Update button persists changes immediately.
5. **Offline transactions** are typically created via Customers module → Assign Unit (offline booking) flow.
6. **Payment statuses `cancelled` / `bounced` / `failed`** release the unit immediately (other terminal payment statuses wait the 20-min timeout — see Allocation manual).
7. **Read-only ledger** — no create / edit / delete on transactions. Only Gateway Settings is writable on this page.

---

## Role Restrictions

- Admin (roleId 1) — full access including Gateway Configuration.
- Finance team users (with the appropriate role) — typically read-only; Gateway Configuration should be restricted by permissions.
- No buyer-facing role can view this page.

---

## API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/payment-transactions` | Paginated ledger + filters |
| GET | `/api/v1/admin/export/:exportType` | Export current view |
| GET | `/api/v1/admin/payment-gateways` | Current gateway state (modal open) |
| PUT | `/api/v1/admin/payment-gateways` | Save gateway configuration |
| GET | `/api/v1/admin/payment-transactions/:id` | Detail view — planned, not active |

---

## Integrations

- **Easebuzz** — online payment gateway; webhook is the source of truth for status.
- **Razorpay** — alternative online gateway.
- **Allocation module** — buyer bookings during campaigns generate Allocation-type transactions.
- **Customers module** — Assign Unit (offline booking) and Offline Payment (milestones) flows create Offline-type transactions.
- **Mavis / LSQ** — downstream sync on `completed` status.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Eye icon does nothing | Detail view not yet implemented | Use the BRD / source data for now — feature pending |
| Settings → "At least one payment gateway must remain active" | Both gateways unchecked | Re-check at least one and retry Update |
| Transaction marked `completed` but buyer says they didn't finish payment | Webhook is truth; buyer closed browser after webhook arrived | Normal — verify with gateway dashboard if disputed |
| `initiated` transactions never progress | Webhook may be unreachable / gateway down | Check gateway status; reconcile via Export |
| Buyer reports checkout failure | A gateway may have been disabled mid-session | Re-enable the gateway via Settings; investigate from there |
| Export file format unclear (CSV vs XLSX) | Documentation pending product confirmation | Open the downloaded file to see actual format; do not hard-code expectations in automation |
| Total count badge doesn't change with filters | Should update — refresh if it doesn't | Click Refresh; if still stuck, escalate |
| Refund button missing | Refunds are NOT initiated from this page | Use Customers module (Cancel Registration / Bulk Refund) |
