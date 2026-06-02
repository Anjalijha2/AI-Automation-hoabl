# Visual Memory — Admin Portal / Towers

**Captured:** 2026-06-01 (initial) · 2026-06-02 (Conditional-TC states VG-1…VG-6 appended)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/admin/towers)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | Towers — initial loaded state with stat cards + tower list + heatmap for default tower "Crest" (1920×900) | Live inspection via MCP browser (2026-06-01) |
| `screenshot-ui.png` | Towers — UI/UX baseline | Live inspection via MCP browser (2026-06-01) |
| `towers-unit-detail-drawer.png` | Crest tower — unit `3405` (AVAILABLE) clicked → unit-detail side panel appears on right pane showing Unit No., BHK, Size, pricing breakdown, and **green "Mark unit as Reserved" CTA** at bottom (no customer fields because unit is unsold) | `node scripts/capture-towers-missing-states.js` (2026-06-02) |
| `towers-red-cell-clicked.png` | Crest tower — RED/booked unit `3501` clicked → unit-detail panel populated with **customer block**: First Name "Supriya", Last Name "Dubey", Registration Number `GHNG-2000000009-Z`, Phone `9167746035` + full pricing breakdown | `node scripts/capture-towers-missing-states.js` (2026-06-02) |
| `towers-orange-cell-clicked.png` | Crest tower — ORANGE/paying-hold unit `3307` (2 BHK Growth Home) clicked → unit-detail panel populated with customer block (Supriya Dubey, reg `GHNG-2000000009-Y`) + 2 BHK pricing (Agreement Value ₹49,99,000) | `node scripts/capture-towers-missing-states.js` (2026-06-02) |
| `towers-config-deeplink-landing.png` | Config landing (`/admin/cms`) — page heading "Configurations" + "Tower Configuration" table listing all 18 towers (Tower 8 – Crest, Tower 9 – Triumph, …) each with a green Active/Inactive switch and a "View Tower >" deep-link back to `/admin/towers` filtered to that tower. Also "Update Tower Configuration" + "Sample File Download" buttons. **The deep-link flow is REVERSED from the task assumption** — Config is the entry point, Towers receives the navigation. | `node scripts/capture-towers-missing-states.js` (2026-06-02) |
| `towers-unit-status-before-toggle.png` | `/admin/cms` — Tower 14 – Horizon switch in **OFF (grey "Active")** state prior to toggle action | `node scripts/capture-towers-missing-states.js` (2026-06-02) |
| `towers-unit-status-after-toggle.png` | `/admin/cms` — Tower 14 – Horizon switch flipped to **ON (green "Active")** state — confirmed by aria-checked=true and `.ant-switch-checked` class added; no confirmation dialog appeared; state was reverted by the script after capture | `node scripts/capture-towers-missing-states.js` (2026-06-02) |

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

---

## Key Structural Notes — Unit Cell Heatmap (added 2026-06-02)

### Cell wrapper / inner element pair

Each unit in the heatmap is rendered as TWO nested elements:

```
<div class="unit-select-box">
  <div class="unit-size-item <statusClass>">       <-- React onClick handler lives HERE
    <div class="unit-number <statusUnitClass>">    <-- holds the visible unit number text, cursor: pointer
      3501
    </div>
  </div>
</div>
```

**Crucial selector rule:** the click handler is on `.unit-size-item.<statusClass>`, NOT on `.unit-number`. Clicking `.unit-number` directly only adds a `selected-class` modifier to the inner div but does NOT open the unit-detail panel. POMs must click the wrapper.

### Cell status taxonomy (observed on Crest, 267 total cells)

| `.unit-size-item` class | `.unit-number` class | Background colour | Status | Count |
|-------------------------|----------------------|-------------------|--------|-------|
| `.unit-size-item.booked` | `.unit-number.booked-unit` | `rgb(214,24,32)` (red) | BOOKED | 90 |
| `.unit-size-item.available` | `.unit-number.available-unit` | `rgb(255,255,255)` (white w/ green border) | AVAILABLE | 84 |
| `.unit-size-item.reserved` | `.unit-number.disabled-unit` | `rgba(114,114,114,0.776)` (grey) | DISABLED | 84 |
| `.unit-size-item.hold` | `.unit-number.paying-hold` | `rgb(255,165,0)` (orange) | PAYING_HOLD / "3 Paying now" | 3 |
| `.unit-size-item.not_available` | `.unit-number.not-available-unit` | `rgb(255,255,255)` (white plain) | NOT_AVAILABLE | 13 |
| `.unit-size-item.refuge` | `.unit-number.refuse-area.refuge-unit` | `rgb(230,230,230)` light grey | REFUGE (literal text "REFUGE") | 6 |

Tower-header inline legend confirms the buckets: **`267 Total · 84 Available · 90 Sold · 3 Paying now · 6 Refuge (R) · 84 Disabled · 0 PBT`**.

Refuge cells at floor positions 33, 28, 23, 18, 13, 8 column 4 (e.g. 3304, 2804, 2304, 1804, 1304, 804) — should never be clicked by automation.

### Unit-detail side panel (opens after `.unit-size-item` click)

- Panel is **NOT** an `.ant-drawer` and **NOT** an `.ant-modal`. It is an inline custom panel rendered in the right pane (replacing the unit-type legend strip).
- Container selector: `div.more-details-allocation`
- Approx size when rendered: 408 × 342 (available state) or 408 × 452 (booked/hold states, taller because of customer rows)
- Field labels (left column) → values (right column):
  - **Always shown** (available, booked, hold): Unit No. · BHK · Size · Agreement Value · Final AV · Stamp Duty · GST · Registration Charges · *All inclusive (total)
  - **Only shown when unit has an owner** (booked + hold cells): First Name · Last Name · Registration Number (e.g. `GHNG-2000000009-Z`) · Phone (10-digit mobile)
- **Available cells only**: a green CTA button at the bottom labeled `Mark unit as Reserved` (text visible in the unit-detail panel's last row) — this is the action surface for the "reserve unit" workflow
- The panel is dismissible by clicking on another cell, or by navigating away. There is no explicit close (×) button observed.
- Once a cell is clicked, the clicked `.unit-number` element gains class `selected-class` (becomes `unit-number selected-class <statusUnitClass>`); the wrapper retains its status class unchanged.

### Click behaviour the original task description got wrong

- **No "tooltip on hover"** — hovering a unit does NOT produce an `.ant-tooltip` or `.ant-popover`. The side panel is the ONLY surfacing mechanism.
- **No double-click affordance** — single click on the wrapper is sufficient.
- **No `.ant-drawer` opens** — search by `.ant-drawer-open` would return zero results; POMs must wait for `div.more-details-allocation` instead.

---

## Key Structural Notes — Config Page `/admin/cms` (added 2026-06-02)

The Admin sidebar item **"Config"** routes to `/admin/cms` (slug retained from old "CMS" naming — see CLAUDE.md constraint #3). This is the **entry point for tower-level configuration**, NOT a deep-link reached from `/admin/towers`. The deep-link flow goes from Config → Towers, not the reverse.

### Page chrome
- Page heading: `h1`/`h2` "Configurations" (green-accent vertical bar marker)
- Section header: green pill banner "Tower Configuration"
- 18-tower 2-column grid layout: left column ~50% width, right column ~50% width
- Each tower row contains:
  - Bold tower label: `Tower <N> - <Name>` (e.g. "Tower 8 - Crest", "Tower 9 - Triumph"). Note: Config-page numeric prefix (Tower 8…Tower 18, Tower 1…Tower 7) DOES NOT match the `/admin/towers` sticky tower-list order. The N value is the back-end tower ID.
  - Underline link "View Tower >" — clicking navigates to `/admin/towers` (no URL query param visible — selection must be tower-aware via React state or session)
  - Active/Inactive switch on the right (AntD `.ant-switch`) — label text reads "Active" when checked (green pill) and "Active" greyed-out when off. The label string "Inactive" sits inside the same button text content but visually only the "Active" pill shows.
- Footer-area buttons:
  - **`Update Tower Configuration`** — `button.ant-btn-primary` (solid green CTA)
  - **`Sample File Download`** — `button.ant-btn-default` (outlined)

### Tower Active/Inactive switch (this is the "unit status toggle" referenced in Conditional TCs)

- Selector for any switch: `.ant-switch` (page has 19 instances — 18 tower switches + 1 likely global / config-level)
- Toggle states:
  - ON  → element has classes `ant-switch ant-switch-checked css-17wfwcs`, attribute `aria-checked="true"`, background `rgb(22,119,255)` or the project-green (visual: green pill with white handle on the right)
  - OFF → element has classes `ant-switch css-17wfwcs` (no `-checked` suffix), attribute `aria-checked="false"`, background grey (visual: grey pill with white handle on the left)
- Click toggles the state via React onClick — no confirmation dialog (`.ant-modal`, `.ant-popover`) was observed during capture. State change is immediate and persisted server-side (capture script reverted toggle and re-confirmed state).
- Observed states on Crest's environment: 5 towers OFF (Horizon, Pinnacle, Bright + 2 more), 13 towers ON.

### Important: "Unit-level status toggle" is NOT exposed in UAT

The Conditional-TC source referenced a per-unit Active/Inactive toggle in the Config section. In the **current UAT build (2026-06-02)**, the only Active/Inactive switches are at TOWER level on `/admin/cms`. There is no UI affordance to toggle individual units (no per-row switch in the heatmap, no per-unit drawer field). Conditional TCs that test "unit status toggle" should be re-scoped to test **tower-level Active/Inactive** until a future sprint adds unit-granularity.

### Locator-map suggestions (Tech Lead Agent)

To be added to `locators/admin/locator-map.json` under `towers` module:

```
"unitCell"                : ".unit-size-item",
"unitCellBooked"          : ".unit-size-item.booked",
"unitCellAvailable"       : ".unit-size-item.available",
"unitCellReserved"        : ".unit-size-item.reserved",       // = DISABLED
"unitCellHold"            : ".unit-size-item.hold",           // = PAYING_HOLD
"unitCellNotAvailable"    : ".unit-size-item.not_available",
"unitCellRefuge"          : ".unit-size-item.refuge",
"unitNumberText"          : ".unit-number",
"unitDetailPanel"         : "div.more-details-allocation",
"unitDetailMarkReservedBtn": "div.more-details-allocation button:has-text('Mark unit as Reserved')",
"preBookedPaymentsBtn"    : "button:has-text('Pre-Booked Payments')",
```

And under a new `config` module (or `towers.config` sub-key):

```
"configPageHeading"            : "text=Configurations",
"towerConfigSectionHeader"     : "text=Tower Configuration",
"towerRow"                     : ":has-text('Tower') >> ..",  // anchored per tower-id
"viewTowerLink"                : "a:has-text('View Tower'), button:has-text('View Tower')",
"towerActiveSwitch"            : ".ant-switch",
"updateTowerConfigurationBtn"  : "button:has-text('Update Tower Configuration')",
"sampleFileDownloadBtn"        : "button:has-text('Sample File Download')",
```

---

## Capture Provenance (2026-06-02 additions)

- Script: `scripts/capture-towers-missing-states.js` (preserved in repo)
- DOM-notes dump: `_capture-notes.json` (in this folder — JSON record of all element states, palette buckets, panel labels, toggle indices)
- Diagnostic / probe scripts created during discovery (kept; safe to delete in a follow-up sprint):
  - `scripts/inspect-towers-dom.js`, `inspect-towers-dom-v2.js`, `inspect-towers-dom-v3.js`, `inspect-towers-dom-v4.js`
  - `_heatmap-outer.html`, `_probe-red-clicked.png`, `_probe-pbp-clicked.png` (in this folder)
- Run command: `node scripts/capture-towers-missing-states.js`
- Auth: `automation-repository/fixtures/.auth/admin.json` (UAT mobile-OTP session, valid at capture time)
