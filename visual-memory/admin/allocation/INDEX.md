# Visual Memory — Admin Portal / Allocation

**Captured:** 2026-06-01
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/admin/allocation)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | Allocation — initial state with "New Allocation Campaign" form + filter section + empty campaign table (1920×900) | Live inspection via MCP browser |
| `screenshot-ui.png` | Allocation — UI/UX baseline | Live inspection via MCP browser |

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
