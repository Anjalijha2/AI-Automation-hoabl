---
type: brd
module: Payment Transactions
url: https://uat-web.xrportal.in/admin/payment-transactions
sprint: 5
status: Draft
author: BA Agent
created: 2026-05-08
tags: [brd, payment-transactions, sprint-5]
---

# BRD: Payment Transactions

## 1. Purpose
Read-only audit ledger of all payment events — online (Easebuzz, Razorpay) and offline (cheque, RTGS). Also includes Payment Gateway Configuration panel to enable/disable gateways system-wide.

**Business intent:** Finance and admin visibility into full payment lifecycle with export for reconciliation. Gateway config enables switching payment providers without code deployment.

## 2. Screens & Navigation
**Path:** Left sidebar → "Transactions" → `/admin/payment-transactions`

**Header:** "Transactions" tab | "Total 10226 Payment Transactions" | Date range filter | Search box | Refresh | Export | Settings

**Table Columns:**

| Column | Sortable | Filterable |
|--------|---------|-----------|
| Sr. No. | ✅ | No |
| Registration No. | No | No |
| Transaction ID | No | No |
| Source | No | ✅ |
| Status | No | ✅ |
| Unit Reg No. | No | No |
| Customer Name | No | No |
| Phone | No | No |
| Payment Type | No | ✅ |
| Amount Paid | ✅ | No |
| Payment Date | ✅ | No |
| Method | No | ✅ |
| Created By | No | No |
| Actions | No | No (eye icon → "Detail view coming soon") |

**Pagination:** 10/page default; "1-10 of 10226 records"; page size dropdown

### Transaction Detail View
Eye icon → tooltip "Detail view coming soon" — **NOT YET IMPLEMENTED**

## 3. Key Entities & Data Fields

### Transaction Entity
| Field | Example |
|-------|---------|
| Internal ID | PT-0015304 |
| Registration No. | GHNG-1000008563 |
| External Transaction ID | S260508075F9CF |
| Source | Online easebuzz / Online razorpay / Offline |
| Status | completed / cancelled / initiated |
| Customer Name | Anjali RegressionOfUAT |
| Amount Paid | ₹6,97,961 |
| Method | Mobile Wallet / Cheque / RTGS / NA |

### Status Values
| Status | Meaning |
|--------|---------|
| completed | Payment confirmed — locks booking |
| cancelled | Abandoned / failed at gateway |
| initiated | Order created, gateway response pending |

### Gateway Configuration
| Gateway | UAT State |
|---------|-----------|
| Easebuzz | ✅ Enabled |
| Razorpay | ✅ Enabled |

## 4. Business Workflows

### Browse & Filter
Navigate → table loads (most recent first) → date range filter → free-text search → column filters → pagination

### Sort
Click sortable headers: Sr. No. | Amount Paid | Payment Date → asc → desc

### Export
"Export" button → file download (format unconfirmed)

### Gateway Configuration
Settings → "Payment Gateway Configuration" modal → 2 checkboxes → "Update"

## 5. Filters & Search

| Capability | Values |
|-----------|--------|
| Date range | Start–End picker |
| Free-text | Customer Name, Phone, Registration No. |
| Source | Online easebuzz / Online razorpay / Offline |
| Status | completed / cancelled / initiated |
| Payment Type | Allocation (+ others TBD) |
| Method | Mobile Wallet / Cheque / RTGS / NA |
| Sort | Sr. No. / Amount Paid / Payment Date |
| Page size | 10 default; others available |

## 6. KPIs
- "Total N Payment Transactions" — updates dynamically with filters

## 7. Integration Points

| Module | Relationship |
|--------|-------------|
| Allocation | Allocation payment → transaction record created |
| Customers | Customer Name + Phone in records; linked via Registration No. |
| Easebuzz / Razorpay | External gateways; transaction IDs are gateway-issued |
| Milestone Payments | Post-allocation milestones → additional transaction records |

## 8. Acceptance Criteria

- **AC-TXN-001:** Page loads <5s for 10,000+ records; count accurate; 10/page default
- **AC-TXN-002:** All filter combinations work; partial text match; date range accurate
- **AC-TXN-003:** Sort asc/desc on Sr. No., Amount Paid, Payment Date
- **AC-TXN-004:** Pagination — nav works; label "X-Y of N" updates; page size selector works
- **AC-TXN-005:** Export — file downloads; correct headers; matches filtered data
- **AC-TXN-006:** Gateway config — modal opens; checkboxes reflect current state; Update saves; disabled gateway removed from checkout
- **AC-TXN-007:** Eye icon → "Detail view coming soon" tooltip; no JS errors

## 9. Out of Scope / UAT Limitations
1. Transaction Detail view — blocked until implemented
2. Offline payment logging workflow — not visible from this screen
3. Milestone payment types — only "Allocation" in UAT data
4. Export format — not executed during exploration
5. Gateway disable testing — risk to shared UAT environment; use dedicated test window
6. 10,000+ record performance requires load testing infrastructure

## 🚩 Domain Red Flags
- **CRITICAL:** Disabling a gateway mid-campaign → payment failures for active customers. No confirmation dialog observed.
- **CRITICAL:** No guard preventing BOTH gateways being disabled simultaneously → all online payments fail.

## Open Clarifications
See [[Sprint 5 - Clarifications#Payment Transactions]]
