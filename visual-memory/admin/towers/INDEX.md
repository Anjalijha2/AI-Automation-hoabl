# Visual Memory — Admin Portal / Towers

**Captured:** 2026-06-01
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/admin/towers)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | Towers — initial loaded state with stat cards + tower list + heatmap for default tower "Crest" (1920×900) | Live inspection via MCP browser |
| `screenshot-ui.png` | Towers — UI/UX baseline | Live inspection via MCP browser |

---

## Key Structural Notes

### Headings & Page Structure
- Page title: `h5` "Tower View"
- Section header — Towers stats: `h5` "Towers" containing three `h6` sub-stats:
  - Total (18) · Active (15) · Inactive (3)
- Section header — Units stats: `h5` "Units" containing four `h6` sub-stats:
  - Total (4708) · Sold (238) · Available (3729) · Disabled (738)
- Tower picker section: `h6` "Select Tower" + helper "Choose a tower to view available units"
- Selected-tower header (right pane): `h6` "Tower: Crest" + inline stats (Total / Available / Sold / Paying now / Refuge (R) / Disabled / PBT)

### Main Content Container
- Page wrapper class: `.tower-page-margin`
- Stats cards container: `.towers-card.mt-4` → child `.towers-card-content`
- Tower picker (sticky tower list): `.tower-select-sticky` → `.tower-list`
- Each tower chip: `h5` (name like "Crest", "Triumph", "Crown", …) with body showing count + "Units Available" + optional `(Inactive)` tag
- Heatmap container: `.towers-card-content.units-card-content`

### Tower List (Sidebar of tower picker)
18 towers total. Names in click-order in the UI:
Crest · Triumph · Crown · Prestige · Horizon (Inactive) · Radiance · Aspire · Blossom · Pinnacle (Inactive) · Fortune · Bright (Inactive) · Grand · Dawn · Aura · Glory · Pride · Grace · Prime

Each tower card displays a "<count> Units Available" stat (e.g., Crest 84, Triumph 223, Blossom 0).

### Toolbar Buttons (selected-tower pane)
- Download unit registrations: `button "Download unit registrations"` (custom class `reset reset-refresh`)
- Pre-Booked Payments: `button "Pre-Booked Payments"` (class `reset reset-refresh`)
- Refresh icon button: `button.reset.reset-refresh` (icon-only, no text)

### Heatmap Grid (right pane, when tower selected)
- Column header row begins with text "Floor"
- Floor numbers descend from top (35, 34, … 1)
- Each row contains up to 8 unit cells per floor with unit numbers (e.g., 3501..3508)
- Some cells render literal text "REFUGE" (refuge floor units — typically position 4 on certain floors: 3304, 2804, 2304, 1804, 1304, 804)
- Unit-type legend strip (top of heatmap): "Unit - 1 / 323 / 1 BHK Growth", "Unit - 2 / 323 / 1 BHK Growth", "Unit - 3 / 621 / 2 BHK Rise", "Unit - 4 / 485 / 2 BHK Growth", "Unit - 5 / 323 / 1 BHK Growth", "Unit - 6 / 323 / 1 BHK Growth", "Unit - 7 / 485 / 2 BHK Growth", "Unit - 8 / 621 / 2 BHK Rise"

### Inputs
- No top-level search/filter input on this page (filtering is via clicking tower cards in the sticky list)

### Sidebar Navigation
Same as Customers — `Customers · Config · Allocation · Offers · Towers · JBP Mgmt · Channel Partners · Sales Managers · Transactions · CMS`. The active item is highlighted via Ant Design `ant-menu-item-selected`.

### API / Network Notes (inferred)
- Towers list and per-tower unit grid likely loaded from two separate endpoints (towers metadata + tower-detail with unit map)
- Active/Inactive flag per tower is a boolean visible in the tower-list `(Inactive)` suffix
- Unit cell statuses (sold/available/disabled/refuge) likely drive cell background colors in the heatmap — verify on next capture by hovering individual cells

### Ant Design Notes
- All buttons use the same Ant base `ant-btn css-17wfwcs`; this page uses `reset reset-refresh` for inline icon actions
