# Visual Memory — Admin Portal / Offers

**Captured:** 2026-06-03
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/admin/offers)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | Offers — initial state (stub, pre-INDEX.md) | 2026-05-17 stub |
| `screenshot-ui.png` | Offers — UI baseline (stub, pre-INDEX.md) | 2026-05-17 stub |
| `offers-loaded.png` | Offers Management — loaded list, 6 offers, ON/OFF switches in Action column | 2026-06-03 batch script |
| `offers-full.png` | Offers Management — full page at 1920×900 | 2026-06-03 batch script |

---

## Key Structural Notes

### Page Heading
- `h5` "Offers Management"

### Page Layout
Single list page — no tabs, no visible search input. Header: Refresh + Add New Offer.

### Header Buttons
- `button:has-text("Refresh")` (ant-btn-default)
- `button.ant-btn-primary:has-text("Add New Offer")`

### Add / Edit Offer Form
Clicking `Add New Offer` did **not** produce `.ant-modal-content` — likely uses **Ant Drawer** (`.ant-drawer-content`).

Wait for: `.ant-drawer-title` OR `.ant-modal-title` containing "Add" or "Edit Offer".

Form fields expected (per BRD): Offer Name, Description, Offer Type (Amount/Percentage), Amount, Percentage, Start Date, End Date.

### Offers Table Columns
Sr.no | Offer Name | Description | Amount | Percentage | Start Date | End Date | Created By | Action

Sr.no is sticky-left column.

**Amount/Percentage pattern:**
- Amount-Based: Amount = `₹ X,XXX`, Percentage = `-`
- Percentage-Based: Amount = `-`, Percentage = `X%`

### Row Action Cell (3 controls in flex row)
1. **Active/Inactive toggle:** `button.ant-switch` — `ant-switch-checked` = Active
2. **Edit icon:** `button.ant-btn-icon-only` (2nd in flex) — opens Edit form/drawer
3. **Delete icon:** `button.ant-btn-icon-only` (3rd in flex) — opens delete confirmation

### System-Generated Offers (per BRD)
`HOME_LOAN` offer auto-created by system on home loan approval — NOT created by admin. Appears in list.

### Offer Type Enum
`Amount Based` | `Percentage Based`
