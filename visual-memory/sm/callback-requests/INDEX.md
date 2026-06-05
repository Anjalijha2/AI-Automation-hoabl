# Visual Memory — Sales Manager Portal / Callback Requests

**Captured:** 2026-06-05
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/sales-manager/callback-requests)
**CAPTURE_STATUS:** FULL

---

## Route

- **URL:** `https://uat-web.xrportal.in/sales-manager/callback-requests`
- Source: `source-code/admin-sm-cp-portal/src/routes/Private/sales-manager/index.jsx` →
  ```jsx
  <Route index element={<Navigate to="callback-requests" replace />} />
  <Route path="callback-requests" element={<CallbackRequests />} />
  ```
- Default authenticated landing for SM users (entered immediately after successful OTP)
- Sidebar shows "Callback Requests" as the selected nav item (icon: phone glyph)

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `callback-loaded.png` | Callback Requests — full page with summary cards (Total SM, VC Request, Pending, Meeting Done, Feedback Done, Avg Rating) and table of 11 callback rows | Live inspection 2026-06-05 |
| `callback-table-data.png` | Table close-up showing all 16 columns and row data with status badges | Live inspection 2026-06-05 |
| `callback-filter-open.png` | "Select Sales Manager" dropdown opened — shows 10 manager options for filtering/assigning | Live inspection 2026-06-05 |
| `callback-action.png` | Action triggered (filter trigger span clicked — no modal appeared; this is a Status column filter icon, not a row action) | Live inspection 2026-06-05 |
| `screenshot-desktop.png` | Legacy stub from 2026-05-17 | preserved |

---

## Key Structural Notes

### Layout
- Left sidebar (collapsed icon menu): 3 nav items — Callback Requests (`.ant-menu-item.ant-menu-item-selected`), Towers, Allocation, plus Logout link at bottom
- Top bar (banner): "India's Biggest Growth Housing Revolution Begins On 7th April 2026."
- Main content area starts with greeting + 9 summary cards in a horizontal strip

### Greeting + Summary cards (top of page)
- Heading: `h5` "Welcome, Tester" (the logged-in SM name)
- Summary cards (each is an `h5` heading + numeric value):
  - Total SM (19)
  - Total VC Request (40 / 34 — fraction display)
  - Total VC Pending
  - Invite Sent/Re-sent (71)
  - Meeting Done (68)
  - SM Feedback Done (41)
  - Customer Feedback Done
  - Avg Rating by Customer (4.24)

### Table — 16 columns
1. (checkbox — bulk select)
2. Request ID
3. Manager
4. Customer Name
5. Customer Phone
6. Registration No
7. HV Code
8. Pincode
9. Requested At
10. Status — color-coded `ant-tag` badges
11. VC Outcome
12. Meeting
13. SM Feedback
14. Customer Rating
15. Customer Email
16. Actions

### Status badges (`<span class="ant-tag ...">`)
- `ant-tag ant-tag-yellow` — text "PENDING"
- `ant-tag ant-tag-green` — text "MEETING DONE" or "Done"
- (more values likely exist for additional outcomes; only these two seen with current data)

### Filter / Action controls (above table)
- Date range: two `input[placeholder="Start Date"]` and `input[placeholder="End Date"]` (Ant DatePicker)
- Search: `input[placeholder="Search by name, phone, email, reg no..."]`
- Search icon: separate `input[type="search"]` (Ant Search)
- "Select Sales Manager" — Ant Select dropdown (filter by manager); shown with ~10 options when opened
- `button:has-text("Assign (0)")` — bulk-assign selected rows (disabled count shown)
- `button:has-text("Create Callback Request")` — opens callback creation modal/form
- `button:has-text("Refresh")` — reloads table data
- `button:has-text("Export")` — exports table to file
- Pagination: `10 / page` selector at bottom right

### Row actions
- Each row has checkbox (multiple `input[type="checkbox"]` per row + header)
- Status column header has `.ant-dropdown-trigger.ant-table-filter-trigger` (column filter)
- Row-level action buttons not directly exposed as a single "Actions" button — instead, individual columns contain links (e.g., Customer Name appears as a green link, likely opening details)

### Component
- Source: imported in `routes/Private/sales-manager/index.jsx` as `CallbackRequests` (default route)
- Likely located at `components/sales-manager/CallbackRequests.jsx` or similar

### Empty state (not observed currently — table has 11 rows)
- Detection regex: `no.{0,15}(data|records|results|callback)` — to capture if SM has no callback requests assigned
