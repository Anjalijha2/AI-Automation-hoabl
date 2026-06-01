# Visual Memory — Admin Portal / Customers

**Captured:** 2026-06-01
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
10. Actions — `button "Download your Unit Details"` (only on KYC-completed rows) + `button "delete"` + `button "more"` (ant-dropdown-trigger)

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
