# Visual Memory — Admin Portal / Allocation

**Captured:** 2026-06-01 (base), 2026-06-02 (extended states)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/admin/allocation)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | Allocation — initial state with "New Allocation Campaign" form + filter section + empty campaign table (1920×900) | Live inspection via MCP browser |
| `screenshot-ui.png` | Allocation — UI/UX baseline | Live inspection via MCP browser |
| `allocation-form-validation-errors.png` | New Allocation Campaign form submitted blank — 4 inline red field-error messages | 2026-06-02 via `scripts/capture-allocation-missing-states.js` |
| `allocation-empty-state.png` | Campaign list with project + name-search "ZZZNOMATCH99999" applied — "No campaigns found" placeholder | 2026-06-02 via `scripts/capture-allocation-missing-states.js` |
| `allocation-export-ui.png` | Campaign detail (Completed Physical Event campaign id=288) — "Campaign Actions" card with KPI stat row + 3 action buttons (Download Bookings / Download Pending / Notify Registrants). This IS the Export UI on Admin (no separate "Export" button in this build). | 2026-06-02 via `scripts/capture-allocation-missing-states-v3.js` |
| `allocation-notify-ui.png` | Campaign detail with "Notify Registrants?" confirmation modal open ("This will generate unique QR codes and notify all registrants via SMS/WhatsApp."). Buttons: Cancel / Yes, Notify All. | 2026-06-02 via `scripts/capture-allocation-missing-states-v2.js` |
| `allocation-rounds-view.png` | **UNREACHABLE** — BRD §10.4 "Rounds UI" not surfaced on Completed or Stopped campaign detail pages, and zero Active/Upcoming campaigns existed in UAT at capture time. No "Round" text or tab on inspected detail pages. See "UNREACHABLE States" section. | not captured |
| `allocation-stop-modal.png` | **UNREACHABLE** — no "Stop" button on Completed/Stopped/Cancelled detail pages. Action expected on Active status only; zero Active rows in UAT data set. | not captured |
| `allocation-cancel-modal.png` | **UNREACHABLE** — same reason as Stop; no "Cancel Allocation" / "Cancel Campaign" button on inspected details. | not captured |

---

## Key Structural Notes

### Page Headings
- Page title: `h5` "Allocation"
- Section title (top form): `h5` "New Allocation Campaign"

### Page Layout
- Two stacked sections:
  1. **New Allocation Campaign form** — create a campaign (Formik-based)
  2. **Campaign list** — filter bar + table (empty by default; shows "Please select a project to view campaigns")

### Form: New Allocation Campaign
Container: `.form-section-wrapper.formik-section` → `form.ant-form.ant-form-vertical`
Field rows: `.ant-row.ant-form-item-row` with `.ant-form-item-label` + `.ant-form-item-control`

Required fields (marked `*`):
| Label | Selector | Component |
|-------|----------|-----------|
| Project * | `.ant-select.ant-select-lg.fix-select-input-border` placeholder "Select Project" | Ant Select (combobox) |
| Campaign Name * | `input.ant-input.ant-input-lg[placeholder="Enter campaign name..."]` | text input |
| Allocation Type * | Ant Select (combobox) default "Static" | dropdown |
| Start Time (IST) * | `input[placeholder="Select date"]` + calendar icon | Ant DatePicker |
| End Time (IST) * | `input[placeholder="Select date"][disabled]` + calendar icon | Ant DatePicker (disabled until Start chosen) |

Optional field:
- Description / Notes — `<textarea class="ant-input">` (charcount UI: "0 / 255")

Form action buttons:
- Reset: `button.btn-book-outline` (type="button")
- Save Campaign: `button.btn-book-solid.ant-btn-primary` (type="submit")

### Filter Bar (above campaign list)
Container is a horizontal row of Ant Select + Input + Refresh button:
- Project filter: `.ant-select` placeholder "Select Project"
- Status filter: `.ant-select` default "All Status" (disabled until project selected)
- Type filter: `.ant-select` default "All Types" (disabled until project selected)
- Campaign name search: `input.ant-input.ant-input-lg[placeholder="Search by campaign name..."]`
- Refresh: `button` (text "Refresh" + reload icon, disabled until project selected)

### Campaign Table (column headers visible even when empty)
Columns: `Campaign Name | Allocation Type | Start Time | End Time | Status | Actions`
Empty-state text inside body: "Please select a project to view campaigns"

### Sidebar Navigation
Same as Customers — Customers · Config · Allocation (active) · Offers · Towers · JBP Mgmt · Channel Partners · Sales Managers · Transactions · CMS

### API / Network Notes (inferred)
- Campaign creation likely `POST /api/allocation/campaigns` with body `{ projectId, campaignName, allocationType, startTime, endTime, description }`
- Campaign list endpoint requires `projectId` param (empty-state text confirms server-side guard)
- Allocation Type enum observed default: `Static` (likely other values: `Dynamic`, etc. — verify by opening dropdown in next capture)

### Ant Design Notes
- Formik wrapper around Ant Form components — class hint `formik-section`
- Form-level CSS hash: `css-17wfwcs`
- Date pickers use Ant Design DatePicker (start enables, end stays disabled until start populated — chronology guard)
- All disabled controls render with `aria-disabled="true"` and class `ant-select-disabled` / `ant-input-disabled`

---

## Extended Capture — 2026-06-02

### Status Filter (campaign list)
Status filter dropdown enumerated options (Ant Select):
- `All Status`
- `Active`
- `Upcoming`
- `Completed`
- `Stopped`
- `Cancelled`
- `Failed`

**Note**: `Approved` is NOT a campaign-list status — that is a registrant-level / buyer-side state, downstream of campaigns. Any TC requiring "Approved status" must clarify whether it refers to the buyer's allocation request status (Customers module) or to a campaign filter (does not exist).

### Allocation Types observed in table data
- `STATIC`
- `PHYSICAL_EVENT`

(Only `Static` is shown in the New-campaign form's Allocation Type default; the dropdown likely also offers Physical Event — open dropdown to confirm next pass.)

### Form Validation — required-field errors (`allocation-form-validation-errors.png`)
Triggered by clicking `Save Campaign` with all fields blank. Each error renders under its field in red within `.ant-form-item-explain-error`.

| Field | Error text |
|-------|-----------|
| Project | `Project is required` |
| Campaign Name | `Campaign name is required` |
| Start Time (IST) | `Start time is required` |
| End Time (IST) | `End time is required` |

Note: Description / Notes and Allocation Type do NOT trigger an error (optional / has default value `Static`).

### Empty Search State (`allocation-empty-state.png`)
- After typing a non-matching name in `input[placeholder="Search by campaign name..."]` and pressing Enter, the table body shows the Ant `.ant-empty` placeholder with text **"No campaigns found"**.
- Pagination footer is also hidden (no `Total N campaigns` row).
- Search input has a clear (`×`) icon visible on hover/focus inside `.ant-input-suffix`.

### Campaign Detail Page — discovered 2026-06-02
**URL pattern:** `/admin/allocation/campaigns/<campaignId>` (numeric id, e.g. `/admin/allocation/campaigns/288`)
**Reached via:** clicking the "View" text in the Actions column on a campaign row (rendered as a non-button anchor — use `:text("View")` inside the row).

**Page structure (both Physical Event and Static):**
- `h2` heading — `Physical Campaign Details` or `Static Campaign Details` (driven by allocation type)
- `h3` heading — the campaign's name
- Status / type pill row directly under the heading (e.g. `test` + `Completed` pill + `Physical Event` pill)
- "Back to Allocation Overview" button (top-left, with left-arrow icon)
- Date strip: `Start Time: YYYY-MM-DD HH:mm (IST)` and `End Time: YYYY-MM-DD HH:mm (IST)`
- **KPI stat row** (6 cards on Physical Event detail):
  - `Registrations Uploaded`
  - `Unique Assigned Units Uploaded`
  - `Common Pool Uploaded`
  - `Booked From Assigned Units` (green tint)
  - `Booked From Common Pool Units` (teal tint)
  - `Registrations Pending To Book` (orange tint)
- `h4 Campaign Actions` section — contains the action buttons.

**Campaign Actions buttons by type and status (observed UAT):**

| Type | Status | Buttons present |
|------|--------|-----------------|
| Physical Event | Completed | `Download Bookings` (primary green), `Download Pending` (outline), `Notify Registrants` (outline) |
| Static | Stopped | `Download Bookings` only |

(Inferred: `Stop`, `Cancel Allocation`, `Notify Registrants` and any Rounds UI render only while campaign is in `Active` / `Upcoming` status. No such campaign existed in UAT at capture time.)

### Notify Registrants modal (`allocation-notify-ui.png`)
Triggered by clicking `Notify Registrants` on a Physical Event campaign detail.

| Element | Selector / text |
|---------|----------------|
| Modal container | `.ant-modal-content` with warning icon (orange ⚠) |
| Title | `Notify Registrants?` (`.ant-modal-title`) |
| Body | "This will generate unique QR codes and notify all registrants via SMS/WhatsApp." |
| Buttons | `Cancel` (outline) and `Yes, Notify All` (primary blue) |

This is BRD §10.6 ("Notify UI"). Note the action is gated by the Physical Event allocation type — STATIC campaign detail does NOT expose Notify Registrants.

### Export UI (`allocation-export-ui.png`)
This is BRD §10.5 ("Export UI"). In the live UAT build there is **no button labelled `Export`** — the equivalent is the pair of buttons inside the Campaign Actions card:

| Button | Style | Inferred behaviour |
|--------|-------|--------------------|
| `Download Bookings` | primary (green solid) + download icon | downloads CSV/Excel of booked allocations for the campaign |
| `Download Pending` | outline + download icon | downloads CSV/Excel of pending/unbooked allocations |

STATIC campaign detail shows only `Download Bookings` (no `Download Pending` — see table above).

**Selectors:**
- Download Bookings: `button:has-text("Download Bookings")` (class `btn-book-solid.ant-btn-primary`)
- Download Pending: `button:has-text("Download Pending")` (class `btn-book-outline`)
- Notify Registrants: `button:has-text("Notify Registrants")` (class `btn-book-outline`)

### API / Network observations
- Detail page is reached at `/admin/allocation/campaigns/<id>` (client-side route).
- KPI stat-card numbers indicate at least these backend fields per campaign:
  `registrationsUploaded`, `uniqueAssignedUnitsUploaded`, `commonPoolUploaded`, `bookedFromAssignedUnits`, `bookedFromCommonPoolUnits`, `registrationsPendingToBook` (approximate names).
- Campaign list pagination footer shows `Total 273 campaigns` / `10 / page` for the seeded UAT data set.

---

## UNREACHABLE States — 2026-06-02

The following BRD-referenced UI states could not be captured in current UAT because the prerequisite data does not exist or the action is gated by a status that has zero rows. **These are documented, not fabricated** — BA Agent must treat related TCs as **CONDITIONAL** until a campaign is created/promoted into the required status in UAT.

| State | File (placeholder name) | Reason | What's needed to unblock |
|-------|-------------------------|--------|--------------------------|
| Rounds UI (BRD §10.4) | `allocation-rounds-view.png` | No "Round" text / tab on Completed or Stopped Physical Event campaign details, and zero `Active` or `Upcoming` rows in UAT. Rounds likely render only on Active campaigns or only on a future allocation-type variant not currently seeded. | Seed at least one campaign in `Upcoming` or `Active` status (Start Time in the future or window currently open) and re-run capture, OR confirm with Dev/BRD owner whether Rounds is a planned-but-not-built screen. |
| Stop Allocation modal | `allocation-stop-modal.png` | `Stop` button only appears on Active campaigns (logical guard — cannot stop something already stopped/completed/cancelled). Zero Active rows in UAT. | Seed one Active campaign and re-run capture. |
| Cancel Allocation modal | `allocation-cancel-modal.png` | Same as Stop — gated by Active status. The first-row `Cancel` button referenced in v1 of this script turned out to be the modal's Cancel (close) button, not a campaign-level Cancel Allocation action. | Seed one Active campaign and re-run capture. |

### Capture-attempt log (for traceability)
1. v1 — opened Allocation page, picked first project from filter, attempted modals/buttons on the Allocation overview page. Result: no action surface; "Stop"/"Cancel" buttons matched are inside the New Campaign form's Reset/Save area or the form-validation message text.
2. v2 — clicked `View` on first row (status `Completed`, id 288). Captured Notify modal. Confirmed detail-page URL pattern. Filter Active → zero rows.
3. v3 — filter Upcoming → zero rows. Filter Completed → 10 rows; captured Export UI on detail of id 288. No Rounds / Stop / Cancel on Completed.
4. v4 — clicked View on the lone STATIC row (id 282, status Stopped). Captured detail buttons: only `Download Bookings`. No Rounds, no Stop/Cancel.

Re-run any of `scripts/capture-allocation-missing-states-v2.js` / `-v3.js` / `-v4.js` after UAT receives an Active or Upcoming campaign to retry the three UNREACHABLE states.
