# Test Cases — Payment Transactions
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-Payment-Transactions.md
**FSD Reference:** `manual-qa-repository/03-user-manual/admin/fsd-payment-transactions.md`
**Last FSD Sync:** 2026-05-24

---

## [FSD-CORRECTION] Source-verified facts

- Payment Transactions admin module is **READ-ONLY**. No admin-side create/update/refund/delete on individual transactions exists here.
- 2 active endpoints: `GET /admin/payment-transactions` (list), `GET /admin/payment-transactions/milestone-types`.
- `GET /admin/payment-transactions/:id` is declared but NOT IMPLEMENTED (controller returns TODO).
- Mutations happen elsewhere: registration cancel/refund (`admin.controller.js`), milestone-payment offline (`milestone-payment.controller.js`), payment gateway webhooks (`payment.controller.js`).
- Sibling sub-module Payment Gateways: 3 active endpoints (list active, get settings, PUT settings). `PUT /:id` is commented out.

---

## Transactions List View

### ADM_PAY_001 — Payment Transactions page loads at /admin/payment-transactions

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Admin logged in |
| **Type** | UI |
| **Test Steps** | 1. Click "Payment Transactions" in sidebar<br>2. Observe URL and page |
| **Expected Result** | URL is /admin/payment-transactions; transactions ledger table loads |
| **Priority** | Critical |

---

### ADM_PAY_002 — Page header shows total transaction count and Settings button

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | UI |
| **Test Steps** | 1. Observe page header |
| **Expected Result** | Header shows total count, Settings button, and Export button |
| **Priority** | High |

---

### ADM_PAY_003 — Transactions table renders core columns

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | UI |
| **Test Steps** | 1. Inspect table column headers |
| **Expected Result** | Columns include Transaction ID, Date, Source, Payment Type, Method, Amount, Status, Registration Number, Actions (eye icon) |
| **Priority** | High |

---

### ADM_PAY_004 — Module is read-only (no Create/Edit/Delete actions)

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | BIZ |
| **Test Steps** | 1. Inspect page for Add/Edit/Delete buttons on transactions |
| **Expected Result** | No create, edit, or delete buttons exist for transactions; only Settings (gateway config) is editable |
| **Priority** | High |

---

### ADM_PAY_005 — Source column shows online easebuzz / razorpay / offline

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | UI |
| **Test Steps** | 1. Read distinct values in Source column |
| **Expected Result** | Values are: "Online easebuzz", "Online razorpay", or "Offline" |
| **Priority** | High |

---

### ADM_PAY_006 — Payment Type column shows valid transaction types

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | UI |
| **Test Steps** | 1. Read distinct values in Payment Type column |
| **Expected Result** | Values include: Allocation, Milestone, Registration, Offline |
| **Priority** | High |

---

### ADM_PAY_007 — Status column shows all 8 valid statuses

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | UI |
| **Test Steps** | 1. Inspect distinct Status values across pages |
| **Expected Result** | Status values: initiated, pending, completed, failed, cancelled, dropped, bounced, refunded |
| **Priority** | High |

---

### ADM_PAY_008 — Amount column shows currency formatted ₹ values

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | UI |
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
| **Type** | FUNC |
| **Test Steps** | 1. Open date range filter<br>2. Select last 7 days<br>3. Apply |
| **Expected Result** | Table shows only transactions in selected date range |
| **Priority** | Critical |

---

### ADM_PAY_010 — Filter by Source = Online easebuzz

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Open Source column filter<br>2. Select "Online easebuzz"<br>3. Apply |
| **Expected Result** | Table shows only easebuzz transactions |
| **Priority** | High |

---

### ADM_PAY_011 — Filter by Status = completed

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Filter Status = completed<br>2. Apply |
| **Expected Result** | Table shows only completed transactions |
| **Priority** | High |

---

### ADM_PAY_012 — Filter by Status = failed

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Filter Status = failed<br>2. Apply |
| **Expected Result** | Table shows only failed transactions |
| **Priority** | High |

---

### ADM_PAY_013 — Filter by Payment Type = Allocation

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Filter Payment Type = Allocation<br>2. Apply |
| **Expected Result** | Table shows only Allocation type transactions |
| **Priority** | High |

---

### ADM_PAY_014 — Combine date and status filters

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Apply date range = last 30 days<br>2. Apply Status = refunded<br>3. View results |
| **Expected Result** | Table shows refunded transactions from last 30 days only |
| **Priority** | High |

---

### ADM_PAY_015 — Reset filters clears all selections

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Multiple filters applied |
| **Type** | FUNC |
| **Test Steps** | 1. Click Reset Filters |
| **Expected Result** | All filters cleared; full list re-shown |
| **Priority** | High |

---

### ADM_PAY_016 — Search by Registration Number

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded; known registration number |
| **Type** | FUNC |
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
| **Type** | FUNC |
| **Test Steps** | 1. Click Export button<br>2. Wait for download |
| **Expected Result** | File downloads (Excel/CSV) with current visible transactions |
| **Priority** | High |

---

### ADM_PAY_018 — Export respects active date filter

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Date filter applied to last 7 days |
| **Type** | FUNC |
| **Test Steps** | 1. Click Export<br>2. Open file |
| **Expected Result** | Exported file contains only transactions from filtered date range |
| **Priority** | High |

---

### ADM_PAY_019 — Export contains all relevant columns for reconciliation

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Export file downloaded |
| **Type** | UI |
| **Test Steps** | 1. Open file<br>2. Inspect columns |
| **Expected Result** | File includes Transaction ID, Date, Source, Type, Method, Amount, Status, Registration Number |
| **Priority** | High |

---

### ADM_PAY_050 — Export respects Status filter

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Status = refunded filter applied; table shows 5 refunded rows |
| **Type** | FUNC |
| **Test Steps** | 1. Click Export<br>2. Open downloaded file<br>3. Inspect Status column |
| **Expected Result** | All rows in file have Status = refunded; row count matches filtered table count (5) |
| **Priority** | High |

---

### ADM_PAY_051 — Export respects combined Source + Payment Type filter

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Source = Online easebuzz AND Payment Type = Allocation filters applied |
| **Type** | FUNC |
| **Test Steps** | 1. Click Export<br>2. Open file<br>3. Inspect Source and Payment Type columns |
| **Expected Result** | All rows have Source = Online easebuzz AND Payment Type = Allocation |
| **Priority** | High |

---

### ADM_PAY_052 — Export with zero filtered rows downloads empty file with headers only

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Filter combination producing zero results applied (e.g. Status=bounced AND today date only) |
| **Type** | EDGE |
| **Test Steps** | 1. Click Export<br>2. Open downloaded file |
| **Expected Result** | File contains only the header row; zero data rows; file is still downloadable |
| **Priority** | Medium |

---

### ADM_PAY_053 — Exported Amount values preserve precision (no rounding)

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | A transaction with amount 32,99,000.50 exists |
| **Type** | EDGE |
| **Test Steps** | 1. Apply filter that includes that transaction<br>2. Export<br>3. Inspect Amount column for that row in the file |
| **Expected Result** | Amount column shows 3299000.50 (or formatted equivalent) with no rounding loss |
| **Priority** | High |

---

### ADM_PAY_054 — Export file name includes date stamp

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Click Export<br>2. Note the filename of downloaded file |
| **Expected Result** | Filename contains date (e.g. `payment-transactions-2026-05-26.xlsx`) so multiple exports don't overwrite each other |
| **Priority** | Medium |

---

## Transaction Detail View

### ADM_PAY_020 — Click eye icon shows "Detail view coming soon" message

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Click eye icon in Actions column on any row |
| **Expected Result** | Message or modal shows "Detail view coming soon" — feature not yet implemented |
| **Priority** | Medium |

---

### ADM_PAY_055 — Eye icon visible on every row regardless of status

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded with mixed status rows |
| **Type** | UI |
| **Test Steps** | 1. Inspect Actions column on initiated, completed, failed, refunded, bounced rows |
| **Expected Result** | Eye icon appears on each row; no row hides the icon |
| **Priority** | Medium |

---

### ADM_PAY_056 — [FSD-CORRECTION] GET /payment-transactions/:id returns 501 / TODO body

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions / API |
| **BRD/FRD Req** | FSD §2.1 Route 3 / controller TODO |
| **Pre-conditions** | Admin JWT; valid transaction id |
| **Type** | API |
| **Test Steps** | 1. GET `/api/v1/admin/payment-transactions/<valid-id>` |
| **Expected Result** | Response is either 501 Not Implemented or 200 with TODO placeholder body; UI is correct to show "coming soon" rather than render data |
| **Priority** | Medium |

---

### ADM_PAY_057 — Clicking eye icon does not trigger network call to detail endpoint

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded; DevTools Network tab open |
| **Type** | API |
| **Test Steps** | 1. Click eye icon on a row<br>2. Observe Network tab |
| **Expected Result** | No GET request fires to `/payment-transactions/:id`; UI shows "coming soon" purely client-side |
| **Priority** | Low |

---

### ADM_PAY_058 — Eye icon shows tooltip on hover

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | UI |
| **Test Steps** | 1. Hover over eye icon in Actions column |
| **Expected Result** | Tooltip "View Details" (or equivalent) appears |
| **Priority** | Low |

---

### ADM_PAY_059 — Eye icon click does not navigate away from list

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded; current filters applied |
| **Type** | FUNC |
| **Test Steps** | 1. Click eye icon on row 3<br>2. Dismiss the "coming soon" message |
| **Expected Result** | URL remains /admin/payment-transactions; current filter and pagination state preserved |
| **Priority** | Medium |

---

### ADM_PAY_060 — "Detail view coming soon" message can be dismissed

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | "Coming soon" toast/modal shown |
| **Type** | FUNC |
| **Test Steps** | 1. Click X / OK / outside the message |
| **Expected Result** | Message dismisses; user returns to list view |
| **Priority** | Low |

---

### ADM_PAY_061 — Eye icon on offline transaction row also shows "coming soon"

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | An offline transaction exists in list |
| **Type** | FUNC |
| **Test Steps** | 1. Click eye icon on the offline row |
| **Expected Result** | Same "coming soon" message — detail view is not implemented for any source type |
| **Priority** | Low |

---

## Payment Gateway Configuration

### ADM_PAY_021 — Settings button opens gateway config panel

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Click "Settings" in page header |
| **Expected Result** | Gateway settings panel/modal opens with Easebuzz and Razorpay checkboxes plus Update button |
| **Priority** | Critical |

---

### ADM_PAY_022 — Gateway settings show current state of both gateways

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Gateway settings open |
| **Type** | UI |
| **Test Steps** | 1. Read state of Easebuzz and Razorpay checkboxes |
| **Expected Result** | Each checkbox reflects current gateway enabled/disabled state |
| **Priority** | High |

---

### ADM_PAY_023 — Disable Razorpay and click Update

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Both gateways currently enabled |
| **Type** | INT |
| **Test Steps** | 1. Uncheck Razorpay<br>2. Click Update |
| **Expected Result** | Settings save immediately without confirmation prompt; Razorpay disabled system-wide |
| **Priority** | Critical |

---

### ADM_PAY_024 — Disable Easebuzz when Razorpay is already disabled is blocked

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Razorpay already disabled |
| **Type** | NEG |
| **Test Steps** | 1. Uncheck Easebuzz<br>2. Click Update |
| **Expected Result** | System blocks the change; error shown "At least one gateway must remain active" |
| **Priority** | Critical |

---

### ADM_PAY_025 — Update button takes effect immediately without confirmation

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Gateway settings open |
| **Type** | FUNC |
| **Test Steps** | 1. Toggle a gateway state<br>2. Click Update |
| **Expected Result** | Change saves with no confirmation dialog; toast shows success |
| **Priority** | High |

---

### ADM_PAY_026 — Re-enable disabled gateway via Update

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Razorpay disabled |
| **Type** | INT |
| **Test Steps** | 1. Check Razorpay checkbox<br>2. Click Update |
| **Expected Result** | Razorpay re-enabled; immediately available for new buyer payments |
| **Priority** | High |

---

### ADM_PAY_062 — Cancel/Close on gateway settings modal discards unsaved changes

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Gateway settings modal open; both gateways currently enabled |
| **Type** | FUNC |
| **Test Steps** | 1. Uncheck Razorpay<br>2. Click Close/X without clicking Update<br>3. Reopen Settings |
| **Expected Result** | Razorpay checkbox is still checked (ON) — change was not persisted |
| **Priority** | High |

---

### ADM_PAY_063 — [FSD-CORRECTION] PUT /payment-gateways/:id returns 404 (route commented out)

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions / API |
| **BRD/FRD Req** | FSD §2.2 Route 7 |
| **Pre-conditions** | Admin JWT |
| **Type** | API |
| **Test Steps** | 1. PUT `/api/v1/admin/payment-gateways/1` with `{isActive:false}` |
| **Expected Result** | HTTP 404 route not found; per-gateway-id toggling is disabled at routes level — must use bulk `PUT /settings` |
| **Priority** | Medium |

---

## Payment Business Rules & Edge Cases

### ADM_PAY_027 — Webhook-driven status: completed shown even after buyer closes browser

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Buyer initiated payment but closed browser; gateway webhook arrives |
| **Type** | INT |
| **Test Steps** | 1. Find that transaction in list<br>2. Check status |
| **Expected Result** | Status reflects webhook (e.g. "completed") regardless of buyer's browser state |
| **Priority** | Critical |

---

### ADM_PAY_028 — 20-minute unit hold expires and releases unit

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payment initiated 21 minutes ago without completion |
| **Type** | BIZ |
| **Test Steps** | 1. Locate that transaction<br>2. Check status<br>3. Check unit status in Towers |
| **Expected Result** | Transaction status = dropped/cancelled; unit returns to available |
| **Priority** | High |

---

### ADM_PAY_029 — Offline transaction created via Assign Unit workflow

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Admin records offline payment via Customers → Assign Unit |
| **Type** | E2E |
| **Test Steps** | 1. Open Customers, record offline payment for a buyer<br>2. Open Payment Transactions |
| **Expected Result** | New transaction with Source = Offline, Type = Offline appears in list |
| **Priority** | High |

---

### ADM_PAY_030 — Refunded transaction status shown after admin cancellation

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Admin cancelled a paid registration with ₹999 refund |
| **Type** | BIZ |
| **Test Steps** | 1. Locate the transaction for cancelled registration |
| **Expected Result** | Status = refunded |
| **Priority** | High |

---

### ADM_PAY_031 — Pagination on transactions table

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Click Next page in pagination |
| **Expected Result** | Next set of transactions loads |
| **Priority** | Medium |

---

### ADM_PAY_032 — Change page size to 50

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Change page size dropdown to 50 |
| **Expected Result** | 50 transactions per page shown |
| **Priority** | Medium |

---

### ADM_PAY_033 — Sort by Date column descending

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Click Date column header to sort descending |
| **Expected Result** | Transactions sorted newest first |
| **Priority** | Medium |

---

### ADM_PAY_034 — Filter combinations with no results show empty state

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | EDGE |
| **Test Steps** | 1. Apply Status = bounced and date = today only |
| **Expected Result** | If no rows match, table shows "No transactions found" empty state |
| **Priority** | Medium |

---

### ADM_PAY_035 — Refresh button reloads transactions

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions |
| **Pre-conditions** | Payments page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Click Refresh button |
| **Expected Result** | Table reloads with latest data from server |
| **Priority** | Medium |

---

## [FSD-CORRECTION] New TCs — Payment Transactions source-verified gaps

### ADM_PAY_FSD_036 — [FSD-CORRECTION] No admin create/update/refund/delete endpoints for individual transactions

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions / API |
| **BRD/FRD Req** | FSD §1 / §2.1 |
| **Pre-conditions** | Admin JWT |
| **Type** | API |
| **Test Steps** | 1. POST `/api/v1/admin/payment-transactions` — expect 404<br>2. PUT `/api/v1/admin/payment-transactions/:id` — expect 404<br>3. DELETE — expect 404 |
| **Expected Result** | All return 404. The module is read-only at admin level. Mutations occur via cancel/refund/offline-milestone in other modules. |
| **Priority** | High |

---

### ADM_PAY_FSD_037 — [FSD-CORRECTION] GET /payment-transactions/:id is unimplemented (returns TODO)

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Transactions / API |
| **BRD/FRD Req** | FSD §2.1 Route 3 |
| **Pre-conditions** | Admin JWT |
| **Type** | API |
| **Test Steps** | 1. GET `/api/v1/admin/payment-transactions/123` |
| **Expected Result** | Endpoint exists in route file but controller returns TODO placeholder. UI should not render a per-transaction detail page. |
| **Priority** | Medium |

---

### ADM_PAY_FSD_038 — [FSD-CORRECTION] Payment Gateways `PUT /:id` is commented out (cannot toggle individual gateway by id)

| Field | Value |
|-------|-------|
| **Module** | ADM – Payment Gateways / API |
| **BRD/FRD Req** | FSD §2.2 Route 7 |
| **Pre-conditions** | Admin JWT |
| **Type** | API |
| **Test Steps** | 1. PUT `/api/v1/admin/payment-gateways/<id>` |
| **Expected Result** | HTTP 404 — route disabled. Use bulk `PUT /payment-gateways/settings` instead. |
| **Priority** | Medium |

---
