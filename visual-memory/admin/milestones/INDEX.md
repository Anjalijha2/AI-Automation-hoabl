# Visual Memory — Admin Portal / Milestones (View Milestones)

**CAPTURE_STATUS:** FULL
**Captured:** 2026-06-20
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/admin)
**URL:** `/admin/milestone?rn=<regNum>&uid=<unitId>`
**FRD:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FS-Customers-Milestones.md`
**Locator map module:** `locators/admin/locator-map.json` → `milestone` (v1.9.0)

> Reached from the Customers table: row three-dot (…) menu → **View Milestones** (visible only on Booked rows, `isBooked === true`). Test account used this run: reg `GHNG-1000008364-I`, unit `1201-Pride: 1 Bed Growth Home`.

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `milestones-schedule-loaded-1920.png` | Milestone Payment Schedule — full table loaded (1920×900) | Live MCP capture 2026-06-20 |
| `offline-payment-drawer.png` | Offline Payment drawer (right side, 600px) — all fields + Milestone Summary | Live MCP capture 2026-06-20 |
| `offline-payment-method-dropdown.png` | Offline Payment drawer — Payment Method select expanded (NEFT/Cheque/Cash/Credit Card/Debit Card/UPI) | Live MCP capture 2026-06-20 |
| `transaction-details-drawer.png` | Transaction Details drawer (right side, 800px) — Payment Breakdown table | Live MCP capture 2026-06-20 |
| `screenshot-desktop.png` | Initial loaded state at 1920×900 (baseline) | Live MCP capture 2026-06-20 |
| `screenshot-ui.png` | UI/UX baseline screenshot | Live MCP capture 2026-06-20 |

---

## Screen 1 — Milestone Payment Schedule page

A read-and-review surface. Admins do not create/edit the schedule here; the only write action is **Offline Payment** on payable milestones.

- **Page heading:** `h2` "Milestone Payment Schedule" (green left bar). Selector: `pageHeading`.
- **Back link (top-left):** "Back to Customer Listing" — rendered as `button.ant-btn-link` (NOT an anchor). Navigates to `/admin/dashboard?scrollTo=customerTable` (FRD §7.4). Selector: `backToListingLink`.
- **Header card:** two read-only fields inside `div.wrap-div`:
  - "Registration No." + value (from URL `?rn=`) — selector `headerRegistrationNumber`
  - "Unit No." + value (from `fetchData.unitNumber`) — selector `headerUnitNumber`
- **Schedule table:** plain `<table>` (no class), one row per milestone (`milestoneRow` → `tbody tr.ant-table-row`). 48 rows captured this run.

### Table columns (9) — left to right

| # | Header | Source field | Selector | Notes (FRD §4.5) |
|---|--------|--------------|----------|-------------------|
| 1 | MILESTONE | `milestone` | `colMilestone` | HTML-rendered name |
| 2 | % DUE | `dues` | `colDue` | HTML-rendered |
| 3 | GST | `gst` | `colGst` | plain string |
| 4 | `<unitName>` / PRINCIPAL | `principalCollection` | `colPrincipal` | header text switches to uppercase `unitName` when present (this run: "1 BED GROWTH HOME 323 SQ.FT."), else "PRINCIPAL". Selector keyed on `nth-child(4)` because the label is dynamic |
| 5 | TOTAL AMOUNT | `totalAmount` | `colTotalAmount` | rendered only if `startDate` is past, else `-` |
| 6 | TOTAL OUTSTANDING | `totalOutstanding` | `colTotalOutstanding` | `₹ 0` for future-dated |
| 7 | PAYMENT STATUS | derived | `colPaymentStatus` | pill — see §Status pill rules |
| 8 | ACTION | derived | `colAction` | "Offline Payment" button when payable |
| 9 | DETAILS | `transactionId` | `colDetails` | "View" button when `transactionId` present |

### Status pill rules (cross-ref FRD §5.2)

Inputs: `total = totalAmount`, `outstanding = totalOutstanding`, `balance = total − outstanding` (semantically = **amount already paid**; the source variable name is misleading but labels render correctly — confirmed not inverted, FRD §5.2 resolved 2026-05-21).

| Condition | Pill | Icon | Selector |
|-----------|------|------|----------|
| `startDate` in the future | (cell renders nothing) | — | — |
| `milestoneKey === 'ml-or'` AND `total === 0` | `-` (dash, no pill) | — | — |
| `balance <= 0` (nothing paid) | **Pending** | clock | `statusPillPending` → `span.pending-payment-status` |
| `0 < balance < total` (partial) | **Partial Payment** | card | `statusPillPartial` → `span.partial-payment-status` |
| `balance >= total` (fully paid) | **Paid** | check-circle | `statusPillPaid` → `span.paid-payment-status` |

> **Observed this run:** only `Paid` and `Pending` pills. The **Partial Payment** pill (`span.partial-payment-status`) is **INFERRED from FRD §5.2** — its class follows the paid-/pending- naming convention but was not present in the live DOM dump. Marked inferred in the locator-map changelog; verify against a partially-paid milestone on the next live pass.

### Row actions

- **Offline Payment** button (ACTION column) — `button.ant-btn-primary` (`ant-btn-sm`), text "Offline Payment". Rendered when: `milestoneKey !== 'ml-or'` OR `total !== 0`, AND `startDate` is past, AND `outstanding > 0` (FRD §6.1). Selector: `offlinePaymentButton`. Opens the Offline Payment drawer.
- **View** button (DETAILS column) — `button.reset-btn-new` (ant-btn-default), text "View". Rendered when `transactionId` present (FRD §6.1). Selector: `transactionDetailsViewButton`. Opens the Transaction Details drawer.

---

## Screen 2 — Offline Payment drawer (right side, 600px)

Title: **"Offline Payment"** (`PayDrawer`). Posts multipart/form-data to `apiUrls.adminMilestonePaymentOffline` (FRD §5.1, §7.3). Mutation — **do not submit on a fixture without user OK.**

### Milestone Summary block (top of drawer)
Read-only summary of the selected milestone:
- **Total Amount** (e.g. `₹ 3,31,430`)
- **Principal Outstanding** (e.g. `Rs. 3,28,149`) — selector `drawerSummaryPrincipalOutstanding`
- **GST Outstanding** (e.g. `Rs. 3,281`) — selector `drawerSummaryGstOutstanding`
- **Total Outstanding** (e.g. `Rs. 3,31,430`) — selector `drawerSummaryTotalOutstanding`

### Form fields (11 — FRD §5.1)

| # | Field | Selector | Type | Required | Notes |
|---|-------|----------|------|----------|-------|
| 1 | Payment For — **Principal Payment** | `drawerPaymentForPrincipal` | radio (`.ant-radio-button-input`, value `principal`) | Conditional | Shown only for non-HCF milestone when both legs have outstanding (FRD §5.1 #11). Radios have no id; scoped by wrapper label text |
| 2 | Payment For — **GST Payment** | `drawerPaymentForGst` | radio (value `gst`) | Conditional | In GST mode `amount` auto-locks to `gstOutstanding` (FRD §6.2 BR7) |
| 3 | Payment Method | `drawerPaymentMethod` → `#paymentMethod` | AntD Select (searchable) | Yes | Options: NEFT, Cheque, Cash, Credit Card (CC), Debit Card (DC), UPI. Placeholder "Select payment method" |
| 4 | Amount | `drawerAmount` → `#amount` | InputNumber, placeholder "Enter amount" | Yes | Must be > 0; ≤ payable outstanding; disabled + = `gstOutstanding` in GST mode |
| 5 | Transaction ID | `drawerTransactionId` → `#transactionId` | Input, placeholder "Enter transaction ID" | Yes | — |
| 6 | Transaction Date & Time | `drawerTransactionDate` → `#transactionDate` | AntD DatePicker, placeholder "Select date and time" | Yes | Future dates disabled (FRD §6.2 BR8) |
| 7 | Comments (Optional) | `drawerComments` → `#comments` | TextArea, placeholder "Add any additional comments..." | No | Max 500 chars |
| 8 | Payment Proof (file) | `drawerPaymentProofInput` → `input[type=file][name=file]` | File, `accept=.pdf,.jpg,.jpeg,.png` | Yes | Mandatory — Submit blocked when empty (FRD §6.2 BR9). Helper text: "Allowed formats: PDF, JPG, PNG (Max: 5MB)" (size NOT enforced client-side) |
| 9 | Upload Payment Proof (button) | `drawerUploadProofButton` | button | — | Trigger for the file input above |
| 10 | Submit Payment | `drawerSubmitPaymentButton` → `button[type=submit]:has-text("Submit Payment")` | submit button | — | Posts the 11-field multipart payload |
| 11 | `paymentType` / `paymentFor` server fields | — | auto-computed | — | `paymentType` (1–5) computed by `calculatePaymentType()`; not a visible control |

> Backend payload also carries `registrationNumber` (from `?rn=`), `milestoneKey`, `milestoneId`, `paymentType` — injected, not user-editable (FRD §5.1).

---

## Screen 3 — Transaction Details drawer (right side, 800px)

Title: **"Transaction Details"** (`ViewDetails`). Triggered by the row **View** button. Read-only.

- **Payment Breakdown** table — columns: **Type · Amount Paid · Mode · Status**.
- Per-transaction classification (FRD §4.3): single non-GST entry = **Full Payment**; otherwise **Partial Payment 1, 2, …**; GST-only entries always **Full Payment**.
- Example rows captured: "Full Payment" / Principal / ₹ 1,00,000 / UPI / Paid — and Principal / ₹ 2,20,652 / RTGS / Paid.

---

## Key Structural Notes (exact selectors)

- Page heading: `h2:has-text("Milestone Payment Schedule")` (green left bar).
- Header fields live in `div.wrap-div` — "Registration No.<reg>" and "Unit No.<unit>".
- Back link is a **button**, not an anchor: `button.ant-btn-link:has-text("Back to Customer Listing")` → `/admin/dashboard?scrollTo=customerTable`.
- Table: plain `<table>` (no class); 9 columns; rows `tbody tr.ant-table-row` (48 this run).
- Column 4 header is **dynamic** (uppercase `unitName` or "PRINCIPAL") — key on `nth-child(4)`, not header text.
- Status pills: `span.paid-payment-status` ("Paid"), `span.pending-payment-status` ("Pending"), `span.partial-payment-status` ("Partial Payment" — **inferred**, not seen this run).
- Row action: `button.ant-btn-primary:has-text("Offline Payment")` (ant-btn-sm).
- Row details: `button.reset-btn-new:has-text("View")`.
- Offline Payment drawer ids: `#paymentMethod` (AntD Select search), `#amount` (InputNumber, placeholder "Enter amount"), `#transactionId` ("Enter transaction ID"), `#transactionDate` (AntD `.ant-picker`, "Select date and time"), `#comments` (textarea, "Add any additional comments...").
- Payment For radios have **no id** — `.ant-radio-button-input` inside wrappers labelled "Principal Payment" / "GST Payment" (values `principal`/`gst`).
- Payment proof: `input[type=file][name=file]` (`accept=.pdf,.jpg,.jpeg,.png`) + `button:has-text("Upload Payment Proof")`; helper "Allowed formats: PDF, JPG, PNG (Max: 5MB)".
- Submit: `button[type=submit]:has-text("Submit Payment")`.
- Milestone Summary block (in drawer): Total Amount, Principal Outstanding, GST Outstanding, Total Outstanding.
- Success toast (FRD §7.3, not fired this run): `:text("submitted successfully")` — "Offline payment submitted successfully".
- Transaction Details drawer: Payment Breakdown table — Type / Amount Paid / Mode / Status.
- **No buyer-facing notification** on offline payment submit (FRD §8) — admin UI toast only.
- This was a **capture-only** pass: no Submit / mutation fired (UAT is stateful; live mutation requires user OK).
