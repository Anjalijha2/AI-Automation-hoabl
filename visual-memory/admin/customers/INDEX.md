# Visual Memory — Admin Portal / Customers

**Captured:** 2026-06-01 (refreshed 2026-06-02 — 4 new states for review-report.md VG-1..VG-6; re-refreshed 2026-06-02 — trash-icon trigger correction, VG-1/VG-2 now CAPTURED)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/admin/customers)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | Customers — initial loaded state with 6 stat cards + registrations table (1920×900) | Live inspection via MCP browser |
| `screenshot-ui.png` | Customers — UI/UX baseline | Live inspection via MCP browser |
| `customers-filters-expanded.png` | Customers — column-header inline filter inputs after clicking Filter (Filter button toggles to "Reset Filters") | Live inspection via MCP browser |
| `customers-booked-actions-dropdown.png` | Customers — three-dot/kebab dropdown opened on a Booked Offline row, showing 4 items: View Milestones · Unit swap · Update Parking Details · Home Loan Approval | 2026-06-02 — Playwright live capture (VG-3) |
| `customers-registered-actions-dropdown.png` | Customers — three-dot/kebab dropdown opened on a Registered row, showing 2 items: Assign Unit · Home Loan Approval | 2026-06-02 — Playwright live capture (VG-4) |
| `customers-home-loan-approval-modal.png` | Customers — Home Loan Approval modal opened from a Booked row, showing Registration Number, Apartment Type, Enable/Disable ant-switch toggle, and Submit button | 2026-06-02 — Playwright live capture (VG-5) |
| `customers-empty-search-state.png` | Customers — empty-state when search returns 0 rows (phone search `9999999000` + column-filter `ZZZNOMATCH99999`). Table title becomes "0 Registration Records", `.ant-table-placeholder` renders empty-box icon + "No data" caption | 2026-06-02 — Playwright live capture (VG-6) |
| `customers-cancel-registration-modal.png` | Customers — Cancel Registration "Confirm Refund" modal opened from a Registered row via the **trash icon** in the Actions column. Modal shows Registration No (e.g. `GHNG-1000008563-AT`) + Unit (`Not Assigned`) value rows, ₹999 offline-refund warning, bullets ("This registration-unit will be cancelled and cannot be undone", "User can register later and pay again for this project in future"), and a primary red `Cancel Registration` confirm button | 2026-06-02 — Playwright live capture (VG-2, trash-icon path) |
| `customers-cancel-unit-modal.png` | Customers — Cancel Unit confirmation modal opened from a Booked Offline row via the **trash icon** in the Actions column. Title: "Please make sure that following actions are completed ?" — two unchecked checkboxes (`Activity - Token, Form, Booking deleted`, `Mavis - Booking entry deleted`) and footer with `Cancel` (outline) + `Submit` (primary, disabled until both boxes checked) | 2026-06-02 — Playwright live capture (VG-1, trash-icon path) |

### Capture Corrections — 2026-06-02

> Previous capture (2026-06-02 morning run) classified VG-1 and VG-2 as UNREACHABLE based on probing the three-dot kebab dropdown. **That probe was on the wrong trigger.**
> Cancel Registration and Cancel Unit are wired to the dedicated **trash icon** (`button` containing `span.anticon-delete`) in the Actions column — NOT to any kebab menu item. The kebab dropdowns do not, and were never expected to, contain these actions.
> Both states have now been captured via the correct trigger and the Conditional TCs they block are unblocked at the visual layer.

---

## Key Structural Notes

### Headings & Layout
- Welcome header: `h5` "Welcome, Suyash D" (logged-in admin name)
- Main table title: `h3.table-title` "9684 Registration Records" (count is dynamic — total record count from API)
- Six stat cards (`.customer-card-wrapper > .customer-card`), each composed of `.customer-card-header` (`h5`) + `.customer-card-icon` + `.customer-card-count`:
  - Registered (8672)
  - Inactive Registrations (5)
  - Cancelled Registrations (1012)
  - KYC Pending (Booked) (124)
  - Confirmed (Paid+KYC) (98)
  - Active Towers (15)

### Main Content Container
- Layout: `main.ant-layout-content.page-content`
- Table wrapper: `.customer-table.d-flex.justify-content-between.align-items-center.mb-3` (header row above the table)
- Table itself: native `<table>` rendered by Ant Design — `<thead class="ant-table-thead">`, `<tbody class="ant-table-tbody">`

### Toolbar Buttons (top-right of table)
- Cancel Bulk Units: `button.reset-btn-green` (text "Cancel Bulk Units" + delete icon)
- Filter / Reset Filters: `button.reset-btn-green` — toggle. Default text "Filter "; after click becomes "Reset Filters " and reveals inline column-header search inputs
- Refresh: `button.reset-btn-green` (text "Refresh")
- Download: `button.reset-btn-green` (text "Download")
- Logout (sidebar): `button.reset-button` (text "Logout")

### Search & Filters
- Phone search input: `input.ant-input[type="tel"][placeholder="Search by Phone"]`
- After Filter toggle ON — inline column-header inputs appear:
  - Registration Details: `input[placeholder="Search here"]`
  - Growth Partner: `input[placeholder="Search by HV Code"]`
  - Confirmation Number: `input[placeholder="Search here"]`
  - Alloted Unit: `input[placeholder="Search here"]`
- Dropdown filters with `button "filter"` icons on column headers: Home Loan Details, Allocation Status, Confirmation, Process Status

### Table Columns (in order)
1. Registration Details — `<columnheader>` with code (e.g., `GHNG-1000008563-AT`) + datetime
2. Growth Partner — HV code + agent name (or `-`)
3. Phone — 10-digit number
4. Home Loan Details — code or `-`
5. Confirmation Number — `<TYPE>-BKD` code or `-`
6. Alloted Unit — unit number, tower name, BHK type + sqft
7. Allocation Status — `Registered` | `Booked Offline` | `Booked Online`
8. Confirmation — `Paid` | `-`
9. Process Status — `KYC Completed` | `KYC Pending` (with helper text "Required to complete KYC from Customer!")
10. Actions column — three independent buttons rendered side-by-side per row, in this order:
    1. `button "Download your Unit Details"` — KYC-completed rows only
    2. `button` containing `span.anticon-delete` (the **trash icon**) — visible on every row. Opens either the Cancel Registration "Confirm Refund" modal (Registered rows) or the Cancel Unit "Please make sure that following actions are completed ?" modal (Booked Offline / Booked Online rows). This is the ONLY trigger for those two modals — they are NOT in the kebab dropdown.
    3. `button[aria-label="more"]` (kebab / three-dot) — opens the `ant-dropdown` row-action menu (View Milestones / Unit swap / Update Parking Details / Home Loan Approval / Assign Unit, depending on status). Never contains Cancel Unit or Cancel Registration.

### Pagination Footer
- Summary text: "Showing 1-10 of 9684 items"
- Prev button: `button "left"` (disabled on page 1)
- Page items: `<li>` 1, 2, 3, 4, 5, `•••` Next-5-Pages, 969 (last)
- Next: `button "right"`
- Page size selector: `combobox "Page Size"` ("10 / page" default)

### Sidebar Navigation (shared across all admin pages)
- Container: `aside.ant-layout-sider` → `complementary` role
- Menu: `ul.ant-menu[role=menu]` vertical
- Items: Customers · Config (`/admin/cms`) · Allocation · Offers · Towers · JBP Mgmt · Channel Partners · Sales Managers · Transactions · CMS (external Strapi — excluded per CLAUDE.md)
- Logo: `img[alt="logo"]` at top
- Logout: `button.reset-button` at bottom

### API / Network Notes (inferred)
- Customer list endpoint returns paginated records keyed by composite IDs (`GHNG-NNNNNNNNNN-X`)
- Filter dropdowns suggest server-side filtering on Home Loan, Allocation Status, Confirmation, Process Status
- Phone is the primary identifier for "Search by Phone"

### Ant Design Notes
- Buttons use Ant Design `ant-btn css-17wfwcs` base, with custom variant classes `reset-btn-green`, `reset-btn-outline`, `btn-book-solid`, etc.
- All dropdown triggers use `ant-dropdown-trigger ant-btn-icon-only`
- Custom CSS-in-JS hash: `css-17wfwcs` is shared across the build — appears on all themed components

---

## Row Action Dropdowns (VG-3, VG-4 — added 2026-06-02)

### Trigger Element
- Kebab button per row inside the Actions column: `button[aria-label="more"]` (also matches `button.ant-dropdown-trigger`)
- Co-located buttons in the Actions column on the same row: `button "Download your Unit Details"` (KYC-completed rows only) and the trash-icon button (`button` containing `span.anticon-delete`). The trash icon is a separate trigger — see "Cancel Registration / Cancel Unit modals" section below.

### Dropdown Container (when open)
- Root: `.ant-dropdown:not(.ant-dropdown-hidden)` — single global container, re-targeted per open trigger
- Menu: `ul.ant-dropdown-menu` (role=menu)
- Items: `li.ant-dropdown-menu-item` (each contains a text span)
- Close: outside-click or `Escape`

### Dropdown Items — Conditional on Allocation Status

**Booked row** (Allocation Status = `Booked Offline` or `Booked Online`):
1. `View Milestones`
2. `Unit swap`
3. `Update Parking Details`
4. `Home Loan Approval`

**Registered row** (Allocation Status = `Registered`):
1. `Assign Unit`
2. `Home Loan Approval`

> Selector to target a specific item:
> `css=.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item:has-text("<exact label>")`

> NOTE — Cancel Unit and Cancel Registration are NOT in the kebab dropdown. They are triggered exclusively by the **trash icon** in the Actions column. The earlier classification (2026-06-02 morning) that flagged them as UNREACHABLE was based on probing the wrong trigger. See the "Cancel Registration / Cancel Unit Modals" section below for the actual modal selectors and behaviour.

---

## Home Loan Approval Modal (VG-5 — added 2026-06-02)

Triggered by: dropdown item `Home Loan Approval` on either Booked or Registered rows (same modal both paths).

### Modal Container
- Wrapper: `.ant-modal-wrap` (visible, no `display:none`)
- Content: `.ant-modal-content`
- Header: `.ant-modal-header` → title `.ant-modal-title` = `"Home Loan Approval"`
- Close: `button.ant-modal-close[aria-label="Close"]` (top-right `×`)
- Body: `.ant-modal-body`

### Modal Body Fields
- **Registration Number** — read-only label/value pair. Value example: `GHNG-1000008563-AS`
- **Apartment Type** — read-only label/value pair. Value example: `1 Bed Growth Home (323 sq.ft.)`
- **Enable Home Loan** — labelled `ant-switch` toggle: `button.ant-switch[role="switch"][aria-checked="false|true"]`
  - Off label: `Enable` (visible text adjacent to switch)
  - On label: `Disable`
  - Helper text below the switch (in red): `"This will be applied for all the related registration units."`
- **Submit button**: `button:has-text("Submit")` (primary green CTA)

---

## Empty Search State (VG-6 — added 2026-06-02)

Triggered by: any search filter that returns zero rows (phone search input and/or column-header filter inputs).

### Visible Elements
- Table title updates: `h3.table-title` → `"0 Registration Records"` (count is the live record count from the API)
- Table body renders Ant placeholder: `<tr class="ant-table-placeholder">` containing:
  - `.ant-empty.ant-empty-normal` wrapper
  - `.ant-empty-image` — the standard outlined inbox/tray SVG
  - `.ant-empty-description` — text `"No data"`
- Stat cards at the top remain unchanged (they reflect global counts, not filtered)
- "Reset Filters" button remains visible top-right; clicking it clears all filter inputs and reloads default page-1 results

### Selectors (for TC steps)
- Empty container: `tr.ant-table-placeholder .ant-empty`
- Empty caption: `.ant-empty-description` (text equals `"No data"`)
- Filtered count: `h3.table-title` (text matches `/^0 Registration Records$/`)

### API Endpoint Observed
- Filtered request: `GET https://uat-api.xrportal.in/api/v1/admin/dashboard/all-buyers?isDownload=0&page=1&limit=10&globalSearch=<query>&registrationDetails=<colSearch>`
- 200 response with empty record array → triggers the placeholder render

---

## Cancel Registration / Cancel Unit Modals (VG-1, VG-2 — added 2026-06-02, trash-icon path)

Both modals share the same trigger: the **trash icon** in the Actions column. The trash icon is a sibling of (not nested under) the kebab menu. The kebab dropdown does NOT contain these actions.

### Shared Trigger Selector
- `tr.ant-table-row button:has(span.anticon-delete)` — the trash icon on the row
- Alternative: `tr.ant-table-row button:has(svg[data-icon="delete"])`
- Note: in the current build the trash button does NOT carry `aria-label="delete"` — only the inner `<span class="anticon anticon-delete">` identifies it. Locator map MUST use the `:has(span.anticon-delete)` form.

### Branching Behaviour by Allocation Status
| Row status | Trash icon opens | Modal title |
|------------|------------------|-------------|
| `Registered` | Cancel Registration → "Confirm Refund" modal | `Confirm Refund` (red title) |
| `Booked Offline` / `Booked Online` | Cancel Unit → checklist modal | `Please make sure that following actions are completed ?` |

---

### VG-2 — Cancel Registration "Confirm Refund" Modal

Triggered by: trash icon on a Registered row.

**Modal container**
- Wrapper: `.ant-modal-wrap` (visible — no `display:none`)
- Content: `.ant-modal-content`
- Header: `.ant-modal-header` → title `.ant-modal-title` with inner `<span style="color: rgb(211, 32, 41);">Confirm Refund</span>` (red text — Ant `ant-modal-title` does not normally style red; the inline span is the warning indicator)
- Close: `button.ant-modal-close[aria-label="Close"]` (top-right `×`)
- Body: `.ant-modal-body`

**Modal body fields (read-only label/value pairs rendered as a 2-column block)**
- **Registration No** — value example: `GHNG-1000008563-AT`
- **Unit** — value example: `Not Assigned` (or actual unit code when registered with allotment)
- Warning text (above the value block): `"You must ensure refund of ₹999 is already handled offline for:"` — the `₹999` substring is rendered bold
- Bullet list (below value block):
  - `This registration-unit will be cancelled and cannot be undone`
  - `User can register later and pay again for this project in future`

**Confirm CTA (destructive)**
- `button:has-text("Cancel Registration")` — primary red button.
  - Full class: `ant-btn ant-btn-primary ant-btn-dangerous ant-btn-color-dangerous ant-btn-variant-solid`
  - Selector preference: `.ant-modal-content button.ant-btn-dangerous:has-text("Cancel Registration")` (using `ant-btn-dangerous` avoids any other "Cancel" text on the page)

**Selectors (for TC steps and locator map)**
- Modal container: `.ant-modal-wrap:not([style*="display: none"]) .ant-modal-content`
- Modal title: `.ant-modal-title:has-text("Confirm Refund")`
- Registration No value: scoped under `.ant-modal-body` — text follows the `Registration No` label (no stable ID — use label-anchored text traversal in POM)
- Cancel Registration confirm button: `.ant-modal-content button.ant-btn-dangerous:has-text("Cancel Registration")`
- Close X: `.ant-modal-content button.ant-modal-close`

**Footer**
- Empty — the only CTA in this modal is the in-body `Cancel Registration` button. There is no `Cancel`/`Submit` footer pair.

---

### VG-1 — Cancel Unit Modal ("Actions Completed?" Checklist)

Triggered by: trash icon on a Booked Offline / Booked Online row.

**Modal container**
- Wrapper: `.ant-modal-wrap` (visible — no `display:none`)
- Content: `.ant-modal-content`
- Header: `.ant-modal-header` → title `.ant-modal-title` with inner `<span style="font-size: 18px; font-weight: 600; color: rgb(0, 0, 0);">Please make sure that following actions are completed ?</span>`
- Close: `button.ant-modal-close[aria-label="Close"]` (top-right `×`)
- Body: `.ant-modal-body`

**Modal body fields**
Two checkboxes inside the body — both unchecked by default. Both must be checked before the `Submit` button enables.

| Label | Wrapper | Initial state |
|-------|---------|--------------|
| `Activity - Token, Form, Booking deleted` | `label.ant-checkbox-wrapper.mb-2` containing `input.ant-checkbox-input` | unchecked |
| `Mavis - Booking entry deleted` | `label.ant-checkbox-wrapper` containing `input.ant-checkbox-input` | unchecked |

**Footer buttons**
- `Cancel` — non-destructive: `button.btn-book-outline:has-text("Cancel")` (Ant: `ant-btn-default ant-btn-variant-outlined`). Dismisses the modal.
- `Submit` — destructive: `button.btn-book-solid:has-text("Submit")` (Ant: `ant-btn-primary ant-btn-variant-solid`). **`disabled=true` until both checkboxes are checked.**

**Selectors (for TC steps and locator map)**
- Modal container: `.ant-modal-wrap:not([style*="display: none"]) .ant-modal-content`
- Modal title: `.ant-modal-title:has-text("Please make sure that following actions are completed")`
- Activity checkbox: `.ant-modal-content label.ant-checkbox-wrapper:has-text("Activity - Token, Form, Booking deleted") input.ant-checkbox-input`
- Mavis checkbox: `.ant-modal-content label.ant-checkbox-wrapper:has-text("Mavis - Booking entry deleted") input.ant-checkbox-input`
- Cancel (dismiss) button: `.ant-modal-content button.btn-book-outline:has-text("Cancel")`
- Submit (confirm) button: `.ant-modal-content button.btn-book-solid:has-text("Submit")`
- Close X: `.ant-modal-content button.ant-modal-close`

---

## Automation Dependencies — Cancel Unit / LSQ Mavis

> **Cancel Unit automation dependency**: the `Submit` button on the Cancel Unit modal requires the **Mavis (LSQ) booking entry to be deleted first** before the Activity / Mavis checkboxes truthfully reflect upstream state. LSQ is excluded from this framework (see CLAUDE.md constraint #1), so we cannot programmatically delete the Mavis booking entry. **Cancel Unit cannot be fully automated end-to-end without manual LSQ cleanup.** The TC for Cancel Unit (Submit click) must:
> 1. Pause and notify the user with the exact Registration No / Unit before checking the Mavis checkbox
> 2. Wait for explicit user confirmation that Mavis cleanup is complete in LSQ
> 3. Only then check both boxes and click `Submit`
>
> A read-only TC variant (open modal → verify title, checkboxes, Submit disabled → click `Cancel` to dismiss) can run fully automated without LSQ involvement. The destructive Submit-path TC must be tagged manual-gated or skipped on UAT runs.
