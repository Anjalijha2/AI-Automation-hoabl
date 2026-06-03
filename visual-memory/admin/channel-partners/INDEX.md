# Visual Memory — Admin Portal / Channel Partners

**Captured:** 2026-06-03
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/admin/channel-partners)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | Channel Partners — initial state (stub, pre-INDEX.md) | 2026-05-17 stub |
| `screenshot-ui.png` | Channel Partners — UI baseline (stub, pre-INDEX.md) | 2026-05-17 stub |
| `channel-partners-loaded.png` | Channel Partners — loaded list, 10 rows, no selection | 2026-06-03 batch script |
| `channel-partners-row-selected.png` | Channel Partners — first row selected, Map Master CP button enabled | 2026-06-03 batch script |
| `channel-partners-map-modal.png` | "Map CPs to Master" modal | 2026-06-03 batch script |
| `channel-partners-full.png` | Channel Partners — full page at 1920×900 | 2026-06-03 batch script |

---

## Key Structural Notes

### Page Heading
- `h3` "2709 Channel Partners" — dynamic count (total CPs, does NOT change on filter per BRD)

### Page Layout
Single-section list page: filter bar + table. No tabs.

### Filter / Search Bar
- Search: `input[placeholder="Search by Phone"]`
- `button:has-text("Reset Filters")` (ant-btn-text)
- `button:has-text("Refresh")` (ant-btn-text)

### Map Master CP Button
- Disabled until row(s) selected: `button[disabled]:has-text("Map")`
- Enabled after selection: `button:has-text("Map to Master")`

### Channel Partners Table Columns
Checkbox | Owner Name | Firm Name | HV Code | Master HV Code | Business Region | Pincode | Phone | CP Type | SM Name | SM Email ID | SM Mobile Number | KYC Status | Actions

**Row selection:** `label.ant-checkbox-wrapper` → `.ant-checkbox-input`

**CP Type cell:** `<span class="ant-tag ant-tag-default">Standalone</span>`

**KYC Status cell:**
- Pending: `<span class="ant-tag ant-tag-orange">Pending</span>`
- Approved: likely `ant-tag-green`

**Row Actions cell:**
- Single icon button: `button.cp-row-action` (class includes `ant-btn-icon-only cp-row-action`)
- Icon: `span[aria-label="eye"]` — View CP detail

### Map CPs to Master Modal (`channel-partners-map-modal.png`)

| Element | Selector / value |
|---------|-----------------|
| Title | `.ant-modal-title` — **"Map CPs to Master"** |
| Cancel | `.ant-modal-content button:has-text("Cancel")` |
| Confirm | `.ant-modal-content button:has-text("Map to Master")` |
