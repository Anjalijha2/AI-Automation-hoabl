# Payment Transactions — BRD

**Portal:** Admin Portal
**URL:** `https://uat-web.xrportal.in/admin/payment-transactions`
**Created:** 2026-05-11
**Status:** Complete

---

## 1. Purpose

The Payment Transactions module provides finance and admin teams a read-only ledger of all payment events across the platform — online (Easebuzz, Razorpay) and offline (cheque, RTGS, UPI). It supports reconciliation, audit, and operational monitoring.

It also hosts the Payment Gateway Configuration settings, allowing admins to enable or disable payment gateways without code deployment.

---

## 2. Who Uses This

| Role | Action |
|------|--------|
| Admin / Finance Team | View and filter all transactions; export for reconciliation; manage gateway settings |

No create, edit, or delete operations exist in this module. It is entirely read-only (except gateway settings).

---

## 3. Transaction Types

| Type | Description |
|------|-------------|
| Allocation | Booking confirmation fee paid during allocation campaign (e.g., ₹27,000) |
| Milestone | Construction-linked payment milestone instalments |
| Registration | Initial registration fee (where applicable) |
| Offline | Admin-recorded payments (cheque, RTGS, bank transfer, cash) |

---

## 4. Transaction Sources

| Source | Gateway Used |
|--------|-------------|
| Online easebuzz | Easebuzz payment gateway |
| Online razorpay | Razorpay payment gateway |
| Offline | No gateway — recorded manually by admin |

---

## 5. Transaction Status Values

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

## 6. Key Business Rules

1. **Webhook is truth:** Payment status is determined solely by the gateway webhook — not by what the buyer's browser reports. A buyer who closes the browser mid-payment may still be marked "completed" if the webhook arrives.
2. **20-minute hold:** Units are held for 20 minutes during payment. If payment is not completed, the unit is auto-released.
3. **At-least-one gateway:** The system prevents both gateways (Easebuzz + Razorpay) from being disabled simultaneously. At least one must remain active.
4. **No confirmation on gateway change:** The "Update" button in gateway settings takes effect immediately without a confirmation dialog.
5. **Offline transactions:** Created by admin when a buyer pays via bank transfer, cheque, or other offline method. Linked to Assign Unit workflow in Customers module.

---

## 7. Admin Workflow — Reconciliation

1. Go to `/admin/payment-transactions`
2. Apply date range filter and/or column filters (Source, Status, Payment Type, Method)
3. Review the total count and filtered results
4. Click "Export" to download a file for offline reconciliation
5. Cross-reference with booking confirmations in the Customers module

---

## 8. Admin Workflow — Gateway Configuration

1. Click "Settings" in the page header
2. Review the current gateway checkbox states (Easebuzz, Razorpay)
3. Check or uncheck as needed
4. Click "Update" — changes take effect system-wide immediately
5. Coordinate with sales team before disabling any gateway during active allocation

---

## 9. Critical Risks

> **CRITICAL:** Disabling a payment gateway takes effect immediately. Buyers mid-payment when a gateway is disabled will encounter checkout failures. Only change gateway settings when no active allocation campaign is running.

> **Note:** The Transaction Detail View (eye icon per row) is not yet implemented — it shows "Detail view coming soon".

---

## 10. Related Documents

- [[Feature-Spec - Payment Transactions]] — Full feature specifications with How to Use
- [[Allocation]] — Allocation bookings generate transaction records
- [[Customers]] — Offline bookings (Assign Unit) create offline transaction records
- [[Payment-Workflow]] — End-to-end payment flow across all types
