# Test Cases — Payment Transactions
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-Payment-Transactions.md

---

## Transactions List View

### ADM_PAY_001 — Payment Transactions page loads at /admin/payment-transactions

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Payment Transactions" in sidebar<br>2. Observe URL and page |
| **Expected Result** | URL is /admin/payment-transactions; transactions ledger table loads |
| **Priority** | Critical |

---

### ADM_PAY_002 — Page header shows total transaction count and Settings button

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Observe page header |
| **Expected Result** | Header shows total count, Settings button, and Export button |
| **Priority** | High |

---

### ADM_PAY_003 — Transactions table renders core columns

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Inspect table column headers |
| **Expected Result** | Columns include Transaction ID, Date, Source, Payment Type, Method, Amount, Status, Registration Number, Actions (eye icon) |
| **Priority** | High |

---

### ADM_PAY_004 — Module is read-only (no Create/Edit/Delete actions)

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Inspect page for Add/Edit/Delete buttons on transactions |
| **Expected Result** | No create, edit, or delete buttons exist for transactions; only Settings (gateway config) is editable |
| **Priority** | High |

---

### ADM_PAY_005 — Source column shows online easebuzz / razorpay / offline

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Read distinct values in Source column |
| **Expected Result** | Values are: "Online easebuzz", "Online razorpay", or "Offline" |
| **Priority** | High |

---

### ADM_PAY_006 — Payment Type column shows valid transaction types

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Read distinct values in Payment Type column |
| **Expected Result** | Values include: Allocation, Milestone, Registration, Offline |
| **Priority** | High |

---

### ADM_PAY_007 — Status column shows all 8 valid statuses

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Inspect distinct Status values across pages |
| **Expected Result** | Status values: initiated, pending, completed, failed, cancelled, dropped, bounced, refunded |
| **Priority** | High |

---

### ADM_PAY_008 — Amount column shows currency formatted ₹ values

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Inspect Amount column |
| **Expected Result** | Amounts displayed with ₹ prefix and comma-grouped (e.g. "₹27,000") |
| **Priority** | Medium |

---

## Filters & Search

### ADM_PAY_009 — Apply date range filter

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Open date range filter<br>2. Select last 7 days<br>3. Apply |
| **Expected Result** | Table shows only transactions in selected date range |
| **Priority** | Critical |

---

### ADM_PAY_010 — Filter by Source = Online easebuzz

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Open Source column filter<br>2. Select "Online easebuzz"<br>3. Apply |
| **Expected Result** | Table shows only easebuzz transactions |
| **Priority** | High |

---

### ADM_PAY_011 — Filter by Status = completed

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Filter Status = completed<br>2. Apply |
| **Expected Result** | Table shows only completed transactions |
| **Priority** | High |

---

### ADM_PAY_012 — Filter by Status = failed

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Filter Status = failed<br>2. Apply |
| **Expected Result** | Table shows only failed transactions |
| **Priority** | High |

---

### ADM_PAY_013 — Filter by Payment Type = Allocation

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Filter Payment Type = Allocation<br>2. Apply |
| **Expected Result** | Table shows only Allocation type transactions |
| **Priority** | High |

---

### ADM_PAY_014 — Combine date and status filters

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Apply date range = last 30 days<br>2. Apply Status = refunded<br>3. View results |
| **Expected Result** | Table shows refunded transactions from last 30 days only |
| **Priority** | High |

---

### ADM_PAY_015 — Reset filters clears all selections

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Multiple filters applied |
| **Test Steps** | 1. Click Reset Filters |
| **Expected Result** | All filters cleared; full list re-shown |
| **Priority** | High |

---

### ADM_PAY_016 — Search by Registration Number

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded; known registration number |
| **Test Steps** | 1. Type registration number in search<br>2. Wait |
| **Expected Result** | Table filters to transactions for that registration |
| **Priority** | High |

---

## Export & Reconciliation

### ADM_PAY_017 — Export button downloads transactions file

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Click Export button<br>2. Wait for download |
| **Expected Result** | File downloads (Excel/CSV) with current visible transactions |
| **Priority** | High |

---

### ADM_PAY_018 — Export respects active date filter

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Date filter applied to last 7 days |
| **Test Steps** | 1. Click Export<br>2. Open file |
| **Expected Result** | Exported file contains only transactions from filtered date range |
| **Priority** | High |

---

### ADM_PAY_019 — Export contains all relevant columns for reconciliation

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Export file downloaded |
| **Test Steps** | 1. Open file<br>2. Inspect columns |
| **Expected Result** | File includes Transaction ID, Date, Source, Type, Method, Amount, Status, Registration Number |
| **Priority** | High |

---

## Transaction Detail View

### ADM_PAY_020 — Click eye icon shows "Detail view coming soon" message

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Click eye icon in Actions column on any row |
| **Expected Result** | Message or modal shows "Detail view coming soon" — feature not yet implemented |
| **Priority** | Medium |

---

## Payment Gateway Configuration

### ADM_PAY_021 — Settings button opens gateway config panel

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Click "Settings" in page header |
| **Expected Result** | Gateway settings panel/modal opens with Easebuzz and Razorpay checkboxes plus Update button |
| **Priority** | Critical |

---

### ADM_PAY_022 — Gateway settings show current state of both gateways

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Gateway settings open |
| **Test Steps** | 1. Read state of Easebuzz and Razorpay checkboxes |
| **Expected Result** | Each checkbox reflects current gateway enabled/disabled state |
| **Priority** | High |

---

### ADM_PAY_023 — Disable Razorpay and click Update

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Both gateways currently enabled |
| **Test Steps** | 1. Uncheck Razorpay<br>2. Click Update |
| **Expected Result** | Settings save immediately without confirmation prompt; Razorpay disabled system-wide |
| **Priority** | Critical |

---

### ADM_PAY_024 — Disable Easebuzz when Razorpay is already disabled is blocked

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Razorpay already disabled |
| **Test Steps** | 1. Uncheck Easebuzz<br>2. Click Update |
| **Expected Result** | System blocks the change; error shown "At least one gateway must remain active" |
| **Priority** | Critical |

---

### ADM_PAY_025 — Update button takes effect immediately without confirmation

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Gateway settings open |
| **Test Steps** | 1. Toggle a gateway state<br>2. Click Update |
| **Expected Result** | Change saves with no confirmation dialog; toast shows success |
| **Priority** | High |

---

### ADM_PAY_026 — Re-enable disabled gateway via Update

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Razorpay disabled |
| **Test Steps** | 1. Check Razorpay checkbox<br>2. Click Update |
| **Expected Result** | Razorpay re-enabled; immediately available for new buyer payments |
| **Priority** | High |

---

## Payment Business Rules & Edge Cases

### ADM_PAY_027 — Webhook-driven status: completed shown even after buyer closes browser

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Buyer initiated payment but closed browser; gateway webhook arrives |
| **Test Steps** | 1. Find that transaction in list<br>2. Check status |
| **Expected Result** | Status reflects webhook (e.g. "completed") regardless of buyer's browser state |
| **Priority** | Critical |

---

### ADM_PAY_028 — 20-minute unit hold expires and releases unit

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payment initiated 21 minutes ago without completion |
| **Test Steps** | 1. Locate that transaction<br>2. Check status<br>3. Check unit status in Towers |
| **Expected Result** | Transaction status = dropped/cancelled; unit returns to available |
| **Priority** | High |

---

### ADM_PAY_029 — Offline transaction created via Assign Unit workflow

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Admin records offline payment via Customers → Assign Unit |
| **Test Steps** | 1. Open Customers, record offline payment for a buyer<br>2. Open Payment Transactions |
| **Expected Result** | New transaction with Source = Offline, Type = Offline appears in list |
| **Priority** | High |

---

### ADM_PAY_030 — Refunded transaction status shown after admin cancellation

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Admin cancelled a paid registration with ₹999 refund |
| **Test Steps** | 1. Locate the transaction for cancelled registration |
| **Expected Result** | Status = refunded |
| **Priority** | High |

---

### ADM_PAY_031 — Pagination on transactions table

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Click Next page in pagination |
| **Expected Result** | Next set of transactions loads |
| **Priority** | Medium |

---

### ADM_PAY_032 — Change page size to 50

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Change page size dropdown to 50 |
| **Expected Result** | 50 transactions per page shown |
| **Priority** | Medium |

---

### ADM_PAY_033 — Sort by Date column descending

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Click Date column header to sort descending |
| **Expected Result** | Transactions sorted newest first |
| **Priority** | Medium |

---

### ADM_PAY_034 — Filter combinations with no results show empty state

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Apply Status = bounced and date = today only |
| **Expected Result** | If no rows match, table shows "No transactions found" empty state |
| **Priority** | Medium |

---

### ADM_PAY_035 — Refresh button reloads transactions

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Test Steps** | 1. Click Refresh button |
| **Expected Result** | Table reloads with latest data from server |
| **Priority** | Medium |

---
