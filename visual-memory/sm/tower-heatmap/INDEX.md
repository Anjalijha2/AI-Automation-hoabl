# Visual Memory — Sales Manager Portal / Tower Heatmap (Tower View)

**Captured:** 2026-06-05
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/sales-manager/towers)
**CAPTURE_STATUS:** FULL

---

## Route

- **URL:** `https://uat-web.xrportal.in/sales-manager/towers`
- Source: `source-code/admin-sm-cp-portal/src/routes/Private/sales-manager/index.jsx` →
  `<Route path="towers" element={<Towers />} />`
- Sidebar label: "Towers" (icon: building glyph)
- Page heading: `h5` "Tower View"

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `heatmap-loaded.png` | Tower View — initial load, default tower selected (Tower 8 - Crest, 84 units available) | Live inspection 2026-06-05 |
| `heatmap-tower-selected.png` | Tower 9 - Triumph selected — 223 units available, full grid of 35 floors × 8 units visible with color-coded status | Live inspection 2026-06-05 |
| `heatmap-unit-hover.png` | Unit 3501 hovered — first available unit on top floor (no separate tooltip rendered; hover state shown on cell border) | Live inspection 2026-06-05 |
| `heatmap-unit-click.png` | Unit 3501 clicked — "Unit Details" side panel appears showing Unit No "3501 - Triumph", BHK "1 BHK Growth Home", Size "323 sq.ft.", Agreement Value, Stamp Duty, GST, Registration Charges (values masked as ₹ xxxxxxxx) | Live inspection 2026-06-05 |
| `heatmap-filter.png` | No discrete filter dropdown found — page-level fallback capture (Tower View has no filter chrome; filtering is via tower-item selection in left rail) | Live inspection 2026-06-05 |
| `screenshot-desktop.png` | Legacy stub from 2026-05-17 | preserved |

---

## Key Structural Notes

### Layout — two-column inside main content
- **Left rail — "Select Tower" list** (`h6` "Select Tower", description "Choose a tower to view available units")
  - Each tower is a `<li class="tower-item">` with `h5` tower name + "X Units Available" count
  - Selected tower has additional class: `<li class="tower-item selected-tower">` (green background)
  - Scrollable list of all towers in the project: Tower 1 - Dawn, Tower 2 - Aura, Tower 3 - Glory, Tower 4 - Pride, Tower 5 - Grace, Tower 6 - Aspire, Tower 7 - Blossom, Tower 8 - Crest, Tower 9 - Triumph, Tower 10 - Crown, Tower 11 - Prime, Tower 13 - Prestige, Tower 15 - Radiance, Tower 16 - Fortune, Tower 18 - Grand (at least)
- **Right pane — Heatmap grid** (`h6.tower-name-title` shows "Tower: Triumph" / "Tower: Crest" etc.)
  - Top header row: per-unit configuration shown via `.unit-size-item` cards — `Unit - 1` / `323` (sq.ft.) / `1 BHK Growth`, etc. Typically 8 unit-columns per tower.
  - Floor labels column on the left (`.unit-section-box` containing `Floor` heading + numbered list)
  - Grid cells: `<div class="unit-number  ${statusClass} ">` — each cell shows the unit number (e.g., 3501)
  - Download icon (top right of grid): exports the tower view

### Unit cell status classes (from DOM inspection — see `_heatmap-unit-classes.json`)
For Tower 9 - Triumph (280 cells total):
- `unit-number available-unit` — 223 units (white background, green outline) — available to allocate
- `unit-number disabled-unit` — 29 units (gray fill) — not selectable in current campaign
- `unit-number booked-unit` — 7 units (red fill) — already booked / sold
- `unit-number refuse-area refuge-unit` — 6 cells (light gray, text "REFUGE") — refuge area (not residential)
- `unit-number pbt-unit` — 2 units (cyan/turquoise fill) — "PBT" status (likely "Promoter Block / Booking Tentative" or similar — confirm with BRD)
- `unit-number not-available-unit` — 13 units — status not exposed in current grid view

### Unit Details panel (after clicking a unit)
Appears as a right-side panel (NOT a modal — stays mounted next to the grid). Header `h5` "Unit Details" with green background bar.
Fields shown:
- **Unit No** — e.g. "3501 - Triumph"
- **BHK** — e.g. "1 BHK Growth Home"
- **Size** — e.g. "323 sq.ft."
- **Agreement Value** — ₹ value (masked as xxxxxxxx in UAT)
- **Stamp Duty** — ₹ value
- **GST** — ₹ value
- **Registration Charges** — ₹ value
- **\*All inclusive** — info icon, with total amount

### Other observed elements
- Preference count badges: `<span class="preference-count-badge">` — small green circles showing how many customers have ranked this unit as preference (values 1-4 seen). Visible on unit cells in the grid.
- Top banner (full-width gray): "India's Biggest Growth Housing Revolution Begins On 7th April 2026." (same as sidebar pages)

### Interactions
- Click `.tower-item` in left rail → loads that tower's grid in right pane (selected-tower class moves to clicked item)
- Click `.unit-number.available-unit` → opens Unit Details panel on right
- Booked / refuge / disabled units typically inert on click (no detail panel opens)
- Hover effects exist (`hover` selectors in CSS) but no separate tooltip element renders — interaction is purely visual on the cell

### Component
- Source: `routes/Private/sales-manager/towers/Towers.jsx`
- CSS likely from same folder or shared SCSS

### Heatmap not exposing a filter dropdown
The Tower View does NOT have a separate filter control (status dropdown, BHK selector, etc.) — filtering is implicit via:
- Tower selection (left rail) — switches the entire grid
- Floor labels — read-only, not clickable filters
- Unit status is rendered via CSS class only

`heatmap-filter.png` is a fallback capture of the page; future BRD changes may add explicit filters here.

### TC consumers
- Status legend mapping (color → meaning) → required for unit-allocation TCs and for cross-checking heatmap accuracy against booking DB
- Tower list completeness → may be data-driven from `/towers` API; TCs should verify all towers in BRD appear in left rail
- Preference badges → consumed by allocation experience TCs (preference ranking validation)
