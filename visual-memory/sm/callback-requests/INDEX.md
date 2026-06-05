# Visual Memory — Sales Manager Portal / Callback Requests

**Captured:** 2026-06-05 (modal/drawer coverage added)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/sales-manager/callback-requests)
**CAPTURE_STATUS:** FULL (list + all interactive overlays: details drawer with 3 tabs, Create Callback drawer with buyer search + validation, more-menu, Capture VC Outcome modal with 10 outcome codes, empty state)

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

### List view + filters

| File | Screen | When Captured |
|------|--------|--------------|
| `callback-loaded.png` | Callback Requests — full page with summary cards (Total SM, VC Request, Pending, Meeting Done, Feedback Done, Avg Rating) and table of 11 callback rows | 2026-06-05 |
| `callback-table-data.png` | Table close-up showing all 16 columns and row data with status badges | 2026-06-05 |
| `callback-filter-open.png` | "Select Sales Manager" Ant Select dropdown opened — shows 10 manager options | 2026-06-05 |
| `callback-status-filter.png` | Status column header filter opened — shows 4 status options as checkboxes: Pending, Resent Invite, Sent Invite, Meeting Done | 2026-06-05 |
| `callback-action.png` | Header filter trigger spinner state (no modal — filter trigger only) | 2026-06-05 |
| `callback-empty-state.png` | Empty state ("No data" illustration) — triggered by search "ZZZZZNOMATCH123XYZ" yielding 0 rows | 2026-06-05 |
| `screenshot-desktop.png` | Legacy stub from 2026-05-17 | preserved |

### Row actions

Each row has exactly **2 action icons** in the Actions column:
1. `anticon-eye` (green) — opens **Callback Request Details** drawer (read-only, 3 tabs)
2. `anticon-more` (3 vertical dots) — opens a small dropdown menu with one item: **"Capture VC Outcome"**

| File | Screen |
|------|--------|
| `callback-pending-action-1-more.png` | PENDING row, "more" dropdown open showing single menu item "Capture VC Outcome" |
| `callback-md-action-1-more.png` | MEETING DONE row, same single-item menu (no extra actions per status) |
| `callback-row-more-menu.png` | Direct capture of PENDING row more menu (canonical) |
| `callback-row-more-menu-meetingdone.png` | Direct capture of MEETING DONE row more menu |

### Callback Request Details drawer (eye icon → 3 tabs)

| File | Tab | Status used | Drawer content |
|------|-----|-------------|----------------|
| `callback-details-drawer-pending.png` | Callback Request (default) | PENDING row REQ-00075 | Customer Information, Registration Preferences, Description, Customer Units table |
| `callback-details-drawer-meetingdone.png` | Callback Request (default) | MEETING DONE row REQ-00073 | Same sections; Status = CONFIRMED |
| `callback-details-feedback-tab.png` | Feedback | MEETING DONE row | "Sales Manager Feedback" section + Registration Preferences with TOWER/UNIT picks |
| `callback-details-history-tab.png` | Callback History | MEETING DONE row | "Callback History for GHNG-…" table — Request ID, Requested At, Manager Name, VC Outcome, Status, View columns |

### Create Callback Request drawer (top-right "Create Callback Request" button)

| File | State |
|------|-------|
| `callback-create-drawer.png` | Drawer initial state — buyer search input visible; buyerEmail/managerEmail/CC/Date fields all DISABLED until buyer selected |
| `callback-create-drawer-searched.png` | After typing "Anjali" in search + clicking Search → result table of 10 customers with radio selection per row, pagination "1-10 of 55 items" |
| `callback-create-buyer-selected.png` | After selecting a buyer radio → buyerEmail (test@gmail.com) and managerEmail (test2@test.com) auto-populated but still readonly; Create button still disabled until Date & Time picked |
| `callback-create-drawer-validation.png` | After Create click attempt with date field empty → Create button stays disabled; no inline errors (form gates submission via disabled state, no per-field error messages on empty Date) |

### Capture VC Outcome modal (more menu → "Capture VC Outcome")

This is the unified SM Feedback / VC outcome submission UI. Replaces what was conceptually called "Schedule Meeting", "Confirm Meeting" and "Feedback" in the original ask — those flows are all driven from this single modal which captures the outcome code that determines the row's next status.

| File | State |
|------|-------|
| `callback-capture-vc-outcome-pending.png` | Modal opened from a PENDING row (REQ-00075) — shows Registration No, Customer Name, "Select Outcome" dropdown placeholder, Cancel + Submit buttons (Submit disabled until outcome selected) |
| `callback-capture-vc-outcome-meetingdone.png` | Modal opened from a MEETING DONE row (REQ-00073, GHNG-2000000009) — same modal, allows re-capturing outcome |
| `callback-vc-outcome-dropdown.png` | "Select Outcome" dropdown opened — exposes all 10 vcOutcome codes (see list below) |
| `callback-capture-vc-outcome-validation.png` | Submit with no outcome → Submit remains disabled; modal labels confirm required state |
| `callback-feedback-drawer.png` | Alias copy of the VC Outcome capture modal — kept under expected filename for downstream test code |

---

## VC Outcome Codes (captured 2026-06-05)

The "Select Outcome" dropdown in the Capture VC Outcome modal exposes exactly **10 outcome codes** (matches BRD vcOutcome enum):

1. VC Done with Preference
2. VC Done, No Preference
3. Future Scheduled
4. Future Rescheduled
5. Missed Scheduled NC
6. Not Interested, Lost
7. Never Connected
8. TL Lost
9. VC 2-Done
10. CP to Drive Preference

---

## Key Structural Notes

### Layout

- Left sidebar (collapsed icon menu): 3 nav items — Callback Requests (`.ant-menu-item.ant-menu-item-selected`), Towers, Allocation, plus Logout link at bottom
- Top bar (banner): "India's Biggest Growth Housing Revolution Begins On 7th April 2026."
- Main content area starts with greeting + 8 summary cards in a horizontal strip

### Greeting + Summary cards (top of page)

- Heading: `h5` "Welcome, Tester" (the logged-in SM name)
- Summary cards (each is an `h5` heading + numeric value):
  - Total SM (19)
  - Total VC Request (40 / 34 — fraction display, SM / Buyer)
  - Total VC Pending (3)
  - Invite Sent/Re-sent (0 / 71 in some states)
  - Meeting Done (71)
  - SM Feedback Done (68)
  - Customer Feedback Done (41)
  - Avg Rating by Customer (4.34)

### Table — 16 columns

1. (checkbox — bulk select)
2. Request ID — sortable
3. Manager
4. Customer Name
5. Customer Phone — masked / clickable link
6. Registration No (GHNG-…)
7. HV Code
8. Pincode
9. Requested At — sortable
10. Status — color-coded `ant-tag` badges with column filter
11. VC Outcome — column filter
12. Meeting
13. SM Feedback
14. Customer Rating
15. Customer Email
16. Actions — 2 icons (eye + more)

### Status badges (`<span class="ant-tag ...">`)

- `ant-tag ant-tag-yellow` — text "PENDING"
- `ant-tag ant-tag-green` — text "MEETING DONE" or "CONFIRMED"
- Other status values surfaced in filter dropdown: "Resent Invite", "Sent Invite" (not in current page data)

### Filter / Action controls (above table)

- Date range: two `input[placeholder="Start Date"]` and `input[placeholder="End Date"]` (Ant DatePicker)
- Search: `input[placeholder="Search by name, phone, email, reg no..."]`
- Search icon: separate `input[type="search"]` (Ant Search)
- "Select Sales Manager" — Ant Select dropdown (filter by manager)
- `button:has-text("Assign (0)")` — bulk-assign selected rows (disabled count shown)
- `button:has-text("Create Callback Request")` — opens Create Callback drawer
- `button:has-text("Refresh")` — reloads table data
- `button:has-text("Export")` — exports table to file
- Pagination: `10 / page` selector at bottom right

### Column header filters

- Status column has `.ant-dropdown-trigger.ant-table-filter-trigger` → opens filter dropdown with 4 checkboxes (Pending, Resent Invite, Sent Invite, Meeting Done)
- VC Outcome column also has a filter trigger (not yet enumerated — likely 10 outcome codes)

### Row actions

- 2 icons in last cell, side-by-side:
  - `.anticon-eye` — green color (`rgb(80, 185, 95)`), size 18px, opens details drawer
  - `.anticon-more.ant-dropdown-trigger` — gray color, opens dropdown menu

### Callback Request Details drawer (eye icon)

- Title: "Callback Request Details" (right-side drawer)
- 3 tabs (Ant Tabs):
  - **Callback Request** (default active) — read-only view of Customer Information, Registration Preferences, Description, Customer Units table
  - **Feedback** — "Sales Manager Feedback" section with: Submitted at, Intent, Allocation Day Confirmation, Typology, Budget, Floor Preference (Min-Max), Lost Reason, Home Loan, Parking Required, Remark, Next Step; plus "Registration Preferences" sub-section listing TOWER/UNIT picks (e.g., Tower 8 - Crest unit 1301)
  - **Callback History** — table "Callback History for GHNG-…" with columns: Request ID, Requested At, Manager Name, VC Outcome, Status, View
- Drawer is read-only — no editable fields, only a close (`.ant-drawer-close`) button

### Create Callback Request drawer

- Title: "Create Callback Request"
- Two-step workflow:
  1. **Search step**: `input[type="search"][placeholder="Search by Name, Mobile Number, GHNG Number, Email"]` + green `Search` button → results table with 5 columns (Registration Number, Name, Previous Callbacks, Email, Phone) + radio selection per row + pagination
  2. **Form step** (below search results): four fields populated after radio selection
- Form fields (all gated until buyer radio selected):
  - `input#buyerEmail` — "To (Buyer Email)" — disabled (readOnly after auto-populate)
  - `input#managerEmail` — "To (Sales Manager Email)" — disabled (readOnly)
  - `input#ccEmails` — "CC" (type=search, multi-tag Ant Select, placeholder "Add CC emails")
  - `input#requestedAt` — "Select Date & Time" (Ant DatePicker)
- Buttons: `Cancel`, `Create` (primary, disabled until all required fields valid — buyer selected + date picked)
- Validation behavior: no inline error messages on blur; the Create button stays disabled until form is valid. No `.ant-form-item-explain-error` surfaces in empty/invalid state.

### "more" dropdown (3-dot icon)

- Single menu item: **"Capture VC Outcome"** (same item for both PENDING and MEETING DONE statuses)
- Ant Dropdown — `.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item`

### Capture VC Outcome modal

- Trigger: more menu → "Capture VC Outcome"
- Modal title: "Capture VC Outcome" (centered, smaller than the details drawer)
- Static content header:
  - `Registration No: GHNG-...` (read from row)
  - `Customer Name: ...` (read from row)
- Field: "Select Outcome:" — Ant Select with placeholder "Please select an outcome", exposes the 10 outcome codes listed above
- Buttons:
  - `Cancel` (outlined)
  - `Submit` (primary, disabled when no outcome selected)
- Validation: Submit stays disabled when outcome is empty — no error messages surfaced

### Empty state

- Triggered by filter / search yielding zero rows (e.g., search text not matching any name/phone/email/reg)
- Renders Ant default empty state: greyed-out "No data" illustration with text "No data"
- Counter updates: "Total 0 Callback Requests"

### Component source

- Imported in `routes/Private/sales-manager/index.jsx` as `CallbackRequests`
- Likely located at `source-code/admin-sm-cp-portal/src/components/sales-manager/CallbackRequests/*`

---

## Selector reference (for locator-map / POM)

| Element | Selector |
|--------|----------|
| Page heading | `h5:has-text("Welcome")` |
| Create Callback button | `button:has-text("Create Callback Request")` |
| Row checkbox (header bulk) | `thead input[type="checkbox"]` |
| Row eye icon | `tr.ant-table-row td:last-child .anticon-eye` |
| Row more icon | `tr.ant-table-row td:last-child .anticon-more` |
| Status column filter | `th:has-text("Status") .ant-table-filter-trigger` |
| Status filter checkbox | `.ant-table-filter-dropdown .ant-checkbox-wrapper:has-text("Pending")` |
| Details drawer | `.ant-drawer-open .ant-drawer-content:has(.ant-drawer-title:has-text("Callback Request Details"))` |
| Details drawer Feedback tab | `.ant-drawer-open .ant-tabs-tab:has-text("Feedback")` |
| Details drawer History tab | `.ant-drawer-open .ant-tabs-tab:has-text("Callback History")` |
| Details drawer close | `.ant-drawer-open .ant-drawer-close` |
| Create drawer search | `.ant-drawer input[type="search"]` |
| Create drawer Search button | `.ant-drawer button:has-text("Search")` |
| Create drawer first buyer radio | `.ant-drawer input[type="radio"]` (first) |
| Create drawer Date picker | `.ant-drawer input#requestedAt` |
| Create drawer Create button | `.ant-drawer button:has-text("Create")` |
| more menu item | `.ant-dropdown-menu-item:has-text("Capture VC Outcome")` |
| VC Outcome modal | `.ant-modal:has(.ant-modal-title:has-text("Capture VC Outcome"))` |
| VC Outcome select | `.ant-modal .ant-select-selector` |
| VC Outcome option | `.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text("VC Done with Preference")` |
| VC Outcome Submit | `.ant-modal button:has-text("Submit")` |
| Empty state | `.ant-empty .ant-empty-description:has-text("No data")` |

---

## Capture artefacts

Inspection JSON snapshots from the capture run live at:
- `scripts/_capture-sm-callback-modals-results.json` (v1)
- `scripts/_capture-sm-callback-modals-v2-results.json` (v2)
- `scripts/_capture-sm-callback-modals-v3-results.json` (v3)
- `scripts/_capture-sm-callback-modals-v4-results.json` (v4)
- `scripts/_capture-sm-callback-modals-v5-results.json` (v5)
- `scripts/_capture-sm-callback-modals-v6-results.json` (v6)
- `_callback-dom-inspect.json` (in this folder, pre-existing)

Each contains the full DOM dump per state (titles, fields, button texts, errors, tabs, etc.) — useful for BA Agent test case generation grounding.
