# Visual Memory — Admin Portal / Allocation

**Captured:** 2026-06-01 (base), 2026-06-02 (extended + Active-row states)
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
| `allocation-stop-modal.png` | Allocation overview — "Stop Allocation Now?" confirmation modal triggered from the Active row's `Stop` action button. Body "Campaign will move to Stopped." Buttons: `Close` (outline) and `Yes, Stop Now` (red/danger). | 2026-06-02 via `scripts/capture-allocation-active-states-v2.js` |
| `allocation-rounds-view.png` | Dynamic campaign detail page (`/admin/allocation/campaigns/291`) — "Round-Wise Data" heading visible. Captured on "Test dynamic campaign" (DYNAMIC, Active). | 2026-06-02 via `scripts/capture-allocation-final-states-v5.js` |
| `allocation-cancel-modal.png` | Allocation overview — "Cancel Allocation?" modal triggered from Upcoming row Cancel action. Body: "This will cancel the upcoming campaign." Buttons: `Close` (outline) + `Yes, Cancel` (red/danger). | 2026-06-02 — manual screenshot by user on "Test" campaign (STATIC, Upcoming) |

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

## Previously Unreachable — Now Captured (2026-06-02)

Both states that were UNREACHABLE during initial capture have now been captured:

| State | File | How captured |
|-------|------|-------------|
| Rounds UI (BRD §3, §10.4) | `allocation-rounds-view.png` | "Test dynamic campaign" (DYNAMIC, Active, id 291) created in UAT; detail page captured via `scripts/capture-allocation-final-states-v5.js` |
| Cancel Allocation modal | `allocation-cancel-modal.png` | "Test" (STATIC, Upcoming) created manually by user with future start time; Cancel modal triggered and screenshot provided directly by user |

### Cancel Allocation modal (`allocation-cancel-modal.png`)
Triggered by clicking the `Cancel` action on an **Upcoming** row in the campaign list.

| Element | Selector / value |
|---------|-----------------|
| Modal container | `.ant-modal-content` |
| Title | `.ant-modal-title` text **"Cancel Allocation?"** |
| Body | `.ant-modal-body` text **"This will cancel the upcoming campaign."** |
| Dismiss button | `.ant-modal-content button:has-text("Close")` (outline) |
| Confirm button | `.ant-modal-content button:has-text("Yes, Cancel")` (red/danger) |

**Important:** Cancel is a **row-level action on Upcoming campaigns only** — the Upcoming row Actions cell exposes `View` + `Cancel`. Active rows expose `View` + `Stop`. Stopped/Completed/Cancelled rows expose `View` only.

### Upcoming row — Actions column (campaign list)

| Control | Tag | Selector | Behaviour |
|---------|-----|----------|-----------|
| View | `<a>` (anchor) | `tbody.ant-table-tbody tr.ant-table-row a:has-text("View")` | navigates to campaign detail |
| Cancel | `<button>` (Ant link-dangerous) | `tbody.ant-table-tbody tr.ant-table-row button:has-text("Cancel")` | opens Cancel Allocation? confirmation modal |

### Rounds UI (`allocation-rounds-view.png`)
Captured on Dynamic-type campaign detail page (`/admin/allocation/campaigns/291`, name "Test dynamic campaign", DYNAMIC, Active).
- Page heading: `h2 "Dynamic Campaign Details"`, `h3 "Test dynamic campaign"`
- Body text includes **"Round-Wise Data"** section heading
- Rounds UI is the Dynamic-type-exclusive UI per BRD §3 — STATIC and PHYSICAL_EVENT campaigns do NOT render Rounds

### Updated locator hints for `locators/admin/locator-map.json` (Cancel + Rounds)

```json
{
  "allocationRowActionsCancel"      : "tbody.ant-table-tbody tr.ant-table-row button:has-text(\"Cancel\")",
  "allocationCancelModalContainer"  : ".ant-modal-content",
  "allocationCancelModalTitle"      : ".ant-modal-title",
  "allocationCancelModalBody"       : ".ant-modal-body",
  "allocationCancelModalCloseBtn"   : ".ant-modal-content button:has-text(\"Close\")",
  "allocationCancelModalConfirmBtn" : ".ant-modal-content button:has-text(\"Yes, Cancel\")"
}
```

### Capture-attempt log (for traceability)
1. v1 (2026-06-02) — opened Allocation page, picked first project from filter, attempted modals/buttons on the overview. Result: no action surface found.
2. v2 (2026-06-02) — clicked `View` on first row (status `Completed`, id 288). Captured Notify modal. Confirmed detail-page URL pattern.
3. v3 (2026-06-02) — filter Upcoming → zero rows. Filter Completed → 10 rows; captured Export UI on detail of id 288.
4. v4 (2026-06-02) — clicked View on STATIC row (id 282, status Stopped). Captured detail buttons only.
5. **active-v1 / active-v2 (2026-06-02):** Active campaign found (id 289 `PE QA : Camp Test 4`, STATIC). Stop modal captured. Dynamic/Upcoming still zero rows.
6. **final-v5 (2026-06-02):** Dynamic campaign "Test dynamic campaign" (id 291, DYNAMIC, Active) created in UAT. Rounds UI captured on detail page.
7. **Cancel modal (2026-06-02):** User created "Test" (STATIC, Upcoming) campaign manually with future start time. Cancel modal triggered and screenshot provided by user directly.

---

## Active Campaign — captured 2026-06-02

Active campaign now exists in UAT under `Xanadu Test Project`:
- id `289`, name `PE QA : Camp Test 4`, allocation type `STATIC`
- Start `2026-06-02 13:48 (IST)`, End `2026-06-02 19:00 (IST)`
- Status `Active`

### Active row — Actions column (campaign list)
The Actions cell on an `Active` row contains exactly **two** controls. Confirmed from DOM (`outerHTML` captured in `_allocation-capture-notes-active-v2.json`):

| Control | Tag | Selector | Visual | Behaviour |
|---------|-----|----------|--------|-----------|
| View | `<a>` (anchor) | `tbody.ant-table-tbody tr.ant-table-row :text("View")` (or `a[href^="/admin/allocation/campaigns/"]` with `<span aria-label="eye">` icon) | black text + eye icon | navigates to `/admin/allocation/campaigns/<id>` |
| Stop | `<button>` (Ant link-dangerous) | `tbody.ant-table-tbody tr.ant-table-row button:has-text("Stop")` (class `ant-btn ant-btn-link ant-btn-dangerous`, `<span aria-label="stop">` icon) | red text + stop-sign icon | opens the **Stop Allocation Now?** confirmation modal in-place (no navigation) |

**Important:** the Stop action is on the **table row**, NOT on the campaign detail page. The Static-Active detail page (id 289) does NOT render a Stop button — only `Back to Allocation Overview` and `Download Bookings`. This contradicts an earlier assumption (in the deprecated UNREACHABLE entry) that Stop appears on the detail page.

### Stop Allocation Now? modal (`allocation-stop-modal.png`)
Triggered by clicking `Stop` on an Active row.

| Element | Selector / value |
|---------|------------------|
| Modal container | `.ant-modal-content` (with orange warning icon `⚠`) |
| Title | `.ant-modal-title` text **"Stop Allocation Now?"** |
| Body | `.ant-modal-body` text **"Campaign will move to Stopped."** |
| Dismiss / close button | `.ant-modal-content button:has-text("Close")` (Ant default outlined, `ant-btn ant-btn-default ant-btn-color-default ant-btn-variant-outlined`) |
| Confirm button | `.ant-modal-content button:has-text("Yes, Stop Now")` (Ant primary danger, `ant-btn-primary ant-btn-dangerous ant-btn-color-dangerous ant-btn-variant-solid`) |

**Note on naming:** the dismiss button label is **"Close"**, not "Cancel". Any TC step referencing "Cancel" on this modal must say "Close" instead, or it will fail.

### Static — Active campaign detail page (id 289)
Different from the Physical Event detail (id 288 in v2 / v3 capture). KPI stat row for STATIC Active = 3 cards (vs 6 on Physical Event):

| KPI card | Source value at capture |
|----------|------------------------|
| Initial Pending Registrations | 8450 |
| Total Units Sold | 0 |
| Pending Registrations | 8450 |

Detail-page interactive elements (excluding sidebar/Logout):
- `button:has-text("Back to Allocation Overview")` — left-arrow + text
- `button:has-text("Download Bookings")` — Ant primary green

Headings: `h2 "Static Campaign Details"`, `h3 "PE QA : Camp Test 4"`, `h4 "Campaign Actions"`.

No Stop, Cancel, Notify, Rounds, or any other action on this page — Stop is only on the list row.

### Updated locator hints for `locators/admin/locator-map.json` (Allocation module)

Suggested additions / updates (Tech Lead Agent will fold these into the locator map):

```json
{
  "allocationRowActionsView"     : "tbody.ant-table-tbody tr.ant-table-row a:has-text(\"View\")",
  "allocationRowActionsStop"     : "tbody.ant-table-tbody tr.ant-table-row button:has-text(\"Stop\")",
  "allocationStopModalContainer" : ".ant-modal-content",
  "allocationStopModalTitle"     : ".ant-modal-title",
  "allocationStopModalBody"      : ".ant-modal-body",
  "allocationStopModalCloseBtn"  : ".ant-modal-content button:has-text(\"Close\")",
  "allocationStopModalConfirmBtn": ".ant-modal-content button:has-text(\"Yes, Stop Now\")"
}
```

### BRD reconciliation
- BRD §4 Rule 5: "Stop ends an Active campaign; Cancel removes an Upcoming campaign before it starts." — confirmed by UI behaviour: Active row exposes only Stop, never Cancel.
- BRD §5 lifecycle: `Active → Stopped (manual, before end time)` matches the modal copy "Campaign will move to Stopped".
- BRD §10.7: single `updateAllocationCampaign` endpoint with `action` field — Stop and Cancel both likely route through this with different action values. API not observed at capture time (modal dismissed via Close before confirming).
- BRD §10.18: Stop / Cancel status flip is async via Python — the modal's "Yes, Stop Now" only triggers the request; status flip is callback-driven. Any TC checking status==Stopped immediately after click must build in a wait or poll, not a synchronous expectation.

