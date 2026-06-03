# Visual Memory — Admin Portal / JBP Management

**Captured:** 2026-06-03
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/admin/jbp-management)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | JBP Management — initial state (stub, pre-INDEX.md) | 2026-05-17 stub |
| `screenshot-ui.png` | JBP Management — UI baseline (stub, pre-INDEX.md) | 2026-05-17 stub |
| `jbp-loaded.png` | JBP — loaded, Cycle Management tab active, 10 cycles visible | 2026-06-03 batch script |
| `jbp-tab-cycle-management.png` | Cycle Management tab — cycles table with Create Cycle button | 2026-06-03 batch script |
| `jbp-tab-submissions.png` | Submissions tab — CP submissions list with View actions | 2026-06-03 batch script |
| `jbp-tab-edit-requests.png` | Edit Requests tab — CP edit-request list with View actions | 2026-06-03 batch script |
| `jbp-create-cycle-modal.png` | "Create New Cycle" modal — name + start date + end date inputs | 2026-06-03 modal script |
| `jbp-full.png` | JBP Management — full page at 1920×900 | 2026-06-03 batch script |

---

## Key Structural Notes

### Page Headings
- `h5` "JBP Management"
- `h3` "Cycles" (Cycle Management tab)

### 3 Tabs
`button:has-text("Cycle Management")` | `button:has-text("Submissions")` | `button:has-text("Edit Requests")`

### Tab: Cycle Management (`jbp-tab-cycle-management.png`)

**Columns:** Cycle Name | Start Date | End Date | Status | Action

**Header:** `button:has-text("Create Cycle")` (ant-btn-default)

**Date filter:** `input[placeholder="Start Date"]` + `input[placeholder="End Date"]`

**Action cell:** "Closed" text for CLOSED cycles; inferred "Close Cycle" button for open cycles (not confirmed — no open cycles in UAT at capture time)

### Create Cycle Modal (`jbp-create-cycle-modal.png`)

| Element | Selector / value |
|---------|-----------------|
| Title | `.ant-modal-title` — **"Create New Cycle"** |
| Cycle Name | `input[placeholder="e.g., September 2026"]` |
| Start Date | `input[placeholder="Select Start Date"]` |
| End Date | `input[placeholder="Select End Date"]` |
| Submit | `.ant-modal-content button:has-text("Create Cycle")` |

### Tab: Submissions (`jbp-tab-submissions.png`)

**Columns:** CP Name | HV Code | CP Email | CP Phone | Cycle | Submitted | Version | Action

**Header:** `button:has-text("Filters")` + `button:has-text("Refresh")`

**Row action:** `button:has-text("View")` (class `ant-btn-link view-action`)

### Tab: Edit Requests (`jbp-tab-edit-requests.png`)

**Columns:** CP Name | HV Code | CP Phone | Cycle | Reason | Requested | Status | Action

**Row action:** `button:has-text("View")` (class `ant-btn-link view-action`)
