# Visual Memory — Admin Portal / Sales Managers

**Captured:** 2026-06-03
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/admin/sales-managers)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | Sales Managers — initial state (stub, pre-INDEX.md) | 2026-05-17 stub |
| `screenshot-ui.png` | Sales Managers — UI baseline (stub, pre-INDEX.md) | 2026-05-17 stub |
| `sales-managers-loaded.png` | Sales Managers — loaded list, 10 rows, Edit buttons visible | 2026-06-03 batch script |
| `sales-managers-full.png` | Sales Managers — full page at 1920×900 | 2026-06-03 batch script |

---

## Key Structural Notes

### Page Heading
- `h5` "Sales Managers"

### Page Layout
Single list page — no tabs. Header: Settings + Add Sales Manager + search input.

### Header
- `button.ant-btn-primary:has-text("Settings")` — privacy masking config (exact UI not captured)
- `button.ant-btn-primary:has-text("Add Sales Manager")`
- `input[placeholder="Search by name, email, or phone"]`

### Add Sales Manager / Edit SM Form
Clicking `Add Sales Manager` did **not** produce `.ant-modal-content` — likely **Ant Drawer** (`.ant-drawer-content`).

Wait for: `.ant-drawer-title` OR `.ant-modal-title` containing "Add Sales Manager" / "Edit".

Form fields (per BRD): First Name, Last Name, Email, Phone, Role, Assignable toggle, Is Active toggle.

### Sales Managers Table Columns
First Name | Last Name | Email | Phone | Role | Assignable | Is Active | Created At | Actions

**Assignable column:** `button.ant-switch` per row — controls buyer assignment dropdowns. Toggle OFF = immediate removal from all dropdowns.

**Is Active column:** `button.ant-switch` per row — controls SM portal login. Toggle OFF = immediate login disable.

**Row Actions:** `button:has-text("Edit")` (class `ant-btn-text view-action`) — opens Edit form/drawer

### Privacy Masking (Settings)
Per BRD §3: Settings button opens privacy masking configuration — exact UI not captured. Likely a modal or drawer.
