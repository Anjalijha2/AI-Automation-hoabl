# Visual Memory — Admin Portal / Offers

**Captured:** 2026-06-03 (list states); 2026-06-06 (drawer + delete-confirm states)
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
| `offers-add-drawer.png` | Add New Offer drawer open — all form fields visible | 2026-06-06 drawer capture |
| `offers-edit-drawer.png` | Edit Offer drawer open — pre-populated with existing offer data | 2026-06-06 drawer capture |
| `offers-delete-confirm.png` | Delete confirmation (`.ant-modal-content`) open with Cancel + Yes-delete buttons | 2026-06-06 drawer capture |

---

## Key Structural Notes

### Page Heading
- `h5` "Offers Management"

### Page Layout
Single list page — no tabs, no visible search input. Header: Refresh + Add New Offer.

### Header Buttons
- `button:has-text("Refresh")` (ant-btn-default)
- `button.ant-btn-primary:has-text("Add New Offer")`

### Offers Table Columns
Sr.no | Offer Name | Description | Amount | Percentage | Start Date | End Date | Created By | Action

Sr.no is sticky-left column. Data rows: `.ant-table-tbody tr.ant-table-row` (the bare `tr` selector also matches a hidden `.ant-table-measure-row` — always qualify with `.ant-table-row`).

**Amount/Percentage pattern:**
- Amount-Based: Amount = `₹ X,XXX`, Percentage = `-`
- Percentage-Based: Amount = `-`, Percentage = `X%`

### Row Action Cell (3 controls in flex row)
1. **Active/Inactive toggle:** `button.ant-switch` — `ant-switch-checked` = Active
2. **Edit icon:** `button.ant-btn-icon-only` — 1st icon-only button in row (index 0) → opens Edit drawer
3. **Delete icon:** `button.ant-btn-icon-only` — 2nd icon-only button in row (index 1) → opens delete confirmation modal

Note: `button.ant-switch` is NOT an `ant-btn-icon-only`, so among `button.ant-btn-icon-only` inside the action cell, `nth(0)` = Edit, `nth(1)` = Delete.

### Add / Edit Offer Drawer
Confirmed: Add and Edit both use **Ant Design Drawer** (`.ant-drawer-content`), NOT modal.

| Aspect | Add New Offer | Edit Offer |
|---|---|---|
| Component | `.ant-drawer-content` | `.ant-drawer-content` |
| Title (`.ant-drawer-title`) | `Add New Offer` | `Edit Offer` |
| Close icon | `button.ant-drawer-close` (aria-label="Close") | same |
| Primary CTA | `button.ant-btn-primary:has-text("Create Offer")` | `button.ant-btn-primary:has-text("Update Offer")` |
| Secondary CTA | `button.ant-btn-default:has-text("Cancel")` | same |
| Fields pre-populated? | No | Yes — Offer Name, Amount, Description, dateRange, typology |

**Form fields (identical for Add and Edit — same `.ant-form-item-label` order):**

| # | Label | Control | Selector | Notes |
|---|---|---|---|---|
| 1 | Offer Name | text input | `input#name` (`placeholder="Please enter offer name"`) | Required |
| 2 | Offer Type | radio group (button-style) | `input[type="radio"][name="offerType"]` with values `AMOUNT` and `PERCENTAGE` | Default `AMOUNT` |
| 3 | Amount **OR** Percentage | number input (Ant InputNumber) | `input#amount` (`placeholder="Please enter amount"`, value formatted with `₹ ` prefix for AMOUNT type) | Label/control swaps based on Offer Type selection — `Amount` for `AMOUNT`, `Percentage` for `PERCENTAGE` |
| 4 | Description | textarea | `textarea#description` (`placeholder="Please enter description"`) | |
| 5 | Offer Validity (Start - End Date) | Ant range date picker | `.ant-picker.ant-picker-range` with two text inputs (`placeholder="Start date"` with `id="dateRange"`, and a second input `placeholder="End date"`) | Edit drawer renders dates like `06 May 2026` / `30 May 2026` |
| 6 | Select Typology (if applicable) | Ant Select dropdown | `.ant-select` containing `input#unitTypologyId` (search-style), placeholder `Please select typology` | Optional; Edit shows selected value e.g. `2 Bed Growth Home` |

**Offer Type radio (button-group style) values:**
- `AMOUNT` → renders "Amount" label + currency-formatted input (`₹ ` prefix)
- `PERCENTAGE` → renders "Percentage" label + percent input

**Drawer footer buttons (in order):**
- `button.ant-btn-default:has-text("Cancel")` — dismiss drawer
- `button.ant-btn-primary:has-text("Create Offer")` (Add) **or** `button.ant-btn-primary:has-text("Update Offer")` (Edit) — submit

**Close (X) icon:** `button.ant-drawer-close[aria-label="Close"]` — top-right of drawer header.

### Delete Confirmation
Confirmed: Delete uses an **Ant Modal** (`.ant-modal-content`), NOT a popconfirm or popover.

- **Component type:** `.ant-modal-content`
- **Title:** `Are you sure you want to delete this offer?`
- **Body text:** `This action cannot be undone.`
- **Cancel button:** `button.ant-btn-default:has-text("Cancel")` — class chain `ant-btn ant-btn-default ant-btn-color-default ant-btn-variant-outlined`
- **Confirm button:** `button.ant-btn-dangerous:has-text("Yes, delete")` — class chain includes `ant-btn-dangerous ant-btn-color-dangerous ant-btn-variant-outlined`
- **Dismissal:** Escape key or click `Cancel` — does NOT delete

### System-Generated Offers (per BRD)
`HOME_LOAN` offer auto-created by system on home loan approval — NOT created by admin. Appears in list.

### Offer Type Enum
`Amount Based` | `Percentage Based` (radio values: `AMOUNT` | `PERCENTAGE`)
