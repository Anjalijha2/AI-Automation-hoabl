# Test Data Spec — Towers — Admin Portal

**Module:** Towers
**Portal:** Admin
**Environment:** UAT (`https://uat-web.xrportal.in/admin/towers`)
**Generated:** 2026-06-02 (re-run after FULL visual capture)
**Sources:**
- BRD/FRD: `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Towers.md`
- Visual memory: `visual-memory/admin/towers/INDEX.md` (CAPTURE_STATUS: FULL, 9 screenshots)

---

## Valid Inputs

This module is **read-only** on `/admin/towers` (BRD §6 Rule 1, §7). All write operations live on `/admin/cms` (Config). "Valid inputs" below are dataset preconditions in the source-of-truth DB / pre-set UI states, not form values on the Towers page itself.

| Field / Entity | Valid Values | Source / Notes |
|----------------|--------------|----------------|
| projectId | 2 (UAT non-prod) / 1 (production) | Env-derived per BRD §11.1; not client-overridable |
| Tower count | 18 (fixed) | BRD §6 Rule 6 — Xanadu project invariant |
| Tower names (click-order on Towers page) | Crest, Triumph, Crown, Prestige, Horizon, Radiance, Aspire, Blossom, Pinnacle, Fortune, Bright, Grand, Dawn, Aura, Glory, Pride, Grace, Prime | INDEX.md §"Tower List" |
| Tower names (Config page order — back-end tower-IDs) | Tower 1..7 in second column + Tower 8 - Crest, Tower 9 - Triumph, …, Tower 18 - Prime in first | INDEX.md §"Config Page" — order DIFFERS from Towers-page click-order |
| Tower active state | true / false | Toggled via `.ant-switch` on `/admin/cms`. Baseline: 15 active, 3 inactive (Horizon, Pinnacle, Bright) |
| Unit status enum (wrapper class) | `available`, `booked`, `hold`, `reserved`, `not_available`, `refuge` | INDEX.md §"Cell status taxonomy" (Crest: 84 available, 90 booked, 3 hold, 84 reserved, 13 not_available, 6 refuge = 267 total) |
| Unit status enum (inner `.unit-number`) | `available-unit`, `booked-unit`, `disabled-unit`, `paying-hold`, `not-available-unit`, `refuse-area refuge-unit` | INDEX.md §"Cell status taxonomy" |
| Unit cell positions per floor | up to 8 (positions 1..8) | INDEX.md §"Heatmap Grid" |
| Floor range | 1..35 (Crest) — descending top-to-bottom in UI | INDEX.md §"Heatmap Grid" |
| Refuge unit positions (Crest) | Floor position 4 on floors 33, 28, 23, 18, 13, 8 → unit nos 3304, 2804, 2304, 1804, 1304, 804 | INDEX.md §"Heatmap Grid" |
| Unit-type legend (Crest) | Pos 1: 323 / 1 BHK Growth · Pos 2: 323 / 1 BHK Growth · Pos 3: 621 / 2 BHK Rise · Pos 4: 485 / 2 BHK Growth · Pos 5: 323 / 1 BHK Growth · Pos 6: 323 / 1 BHK Growth · Pos 7: 485 / 2 BHK Growth · Pos 8: 621 / 2 BHK Rise | INDEX.md §"Heatmap Grid" |
| Unit detail panel container | `div.more-details-allocation` (NOT `.ant-drawer`, NOT `.ant-modal`) | INDEX.md §"Unit-detail side panel" |
| Unit detail panel size — available state | approx 408 × 342 | INDEX.md §"Unit-detail side panel" |
| Unit detail panel size — booked/hold state | approx 408 × 452 (taller — customer block adds rows) | INDEX.md §"Unit-detail side panel" |
| Unit detail panel — always-shown labels | Unit No., BHK, Size, Agreement Value, Final AV, Stamp Duty, GST, Registration Charges, *All inclusive (total) | INDEX.md §"Unit-detail side panel" |
| Unit detail panel — owner block labels (booked + hold only) | First Name, Last Name, Registration Number, Phone | INDEX.md §"Unit-detail side panel" |
| Unit detail panel — Available-only CTA | Green `Mark unit as Reserved` button at panel bottom | INDEX.md §"Unit-detail side panel" |
| Reference unit (AVAILABLE) for TC_TWR_FUNC_010, _INT_027 | 3405 — Crest | INDEX.md `towers-unit-detail-drawer.png` |
| Reference unit (BOOKED) for TC_TWR_FUNC_011 | 3501 — Crest, owner Supriya Dubey, reg `GHNG-2000000009-Z`, phone 9167746035 | INDEX.md `towers-red-cell-clicked.png` |
| Reference unit (PAYING_HOLD) for TC_TWR_FUNC_012 | 3307 — Crest, 2 BHK Growth Home, owner Supriya Dubey, reg `GHNG-2000000009-Y`, Agreement Value ₹49,99,000 | INDEX.md `towers-orange-cell-clicked.png` |
| Reference tower for TC_TWR_FUNC_024 toggle | Tower 14 - Horizon | INDEX.md `towers-unit-status-before-toggle.png` (OFF baseline), `towers-unit-status-after-toggle.png` (ON post-click) |
| Reference KPI baseline (Towers page) | Towers: Total 18 / Active 15 / Inactive 3. Units: Total 4708 / Sold 238 / Available 3729 / Disabled 738 | INDEX.md §"Headings & Page Structure" — UAT 2026-06-01 |
| Reference inline stat row (Crest tower header) | `267 Total · 84 Available · 90 Sold · 3 Paying now · 6 Refuge (R) · 84 Disabled · 0 PBT` | INDEX.md §"Cell status taxonomy" |
| `.ant-switch` ON state | classes `ant-switch ant-switch-checked css-17wfwcs`, attribute `aria-checked="true"`, background green/blue | INDEX.md §"Tower Active/Inactive switch" + `towers-unit-status-after-toggle.png` |
| `.ant-switch` OFF state | classes `ant-switch css-17wfwcs` (no `-checked` suffix), `aria-checked="false"`, background grey | INDEX.md §"Tower Active/Inactive switch" + `towers-unit-status-before-toggle.png` |

---

## Invalid / Boundary Inputs

| Field / Action | Invalid / Boundary Case | Expected Behaviour |
|----------------|--------------------------|---------------------|
| Click inner `.unit-number` (not wrapper) | Click `.unit-number` element directly | Inner div gains class `selected-class`; `div.more-details-allocation` does NOT render. (INDEX.md §"Crucial selector rule" — TC_TWR_NEG_013) |
| Hover unit cell | Hover any `.unit-size-item` | No `.ant-tooltip` and no `.ant-popover` appear. Side panel does not open on hover. (INDEX.md §"No tooltip on hover" — TC_TWR_NEG_014) |
| Click reserved/disabled cell | Click `.unit-size-item.reserved` (grey) | No panel opens. No error. (BRD §6 Rule 5 — TC_TWR_NEG_015 covers refuge edge) |
| Click refuge cell | Click `.unit-size-item.refuge` (literal text "REFUGE", e.g. unit 804 Crest) | No `div.more-details-allocation` renders. Cell visual unchanged. (INDEX.md §"Cell status taxonomy" — TC_TWR_NEG_015) |
| Click booked cell (BRD CONFLICT) | Click `.unit-size-item.booked` (red) | Panel DOES open with customer block (verified by capture). BRD §5.5 says no panel — see BRD-TWR-GAP-001. (TC_TWR_FUNC_011) |
| Click hold cell (BRD CONFLICT) | Click `.unit-size-item.hold` (orange) | Panel DOES open with customer block. BRD §6 Rule 5 says no panel — see BRD-TWR-GAP-001. (TC_TWR_FUNC_012) |
| Inactive tower selection | Click "Horizon (Inactive)" chip | Heatmap STILL loads — read-only view applies (TC_TWR_NEG_029) |
| No-op tower toggle | Call updateTowerStatus with current state (same value) | No audit row written (BRD §11.6). QA must NOT assert audit row. (TC_TWR_API_035) |
| API `isActive` non-boolean | Send `isActive: "yes"` or `isActive: 1` in GET body | Server accepts only literal `true` / `false` — other values likely ignored. Anti-pattern flagged in §11.2. (TC_TWR_API_032) |
| API isActive body stripped by HTTP client | GET tower list, HTTP client drops body | Server returns all 18 towers (no filter applied) — fragile design. (TC_TWR_API_032) |
| projectId override attempt | Send `projectId=99` in request body | Ignored — server uses env-derived value (§11.1). (TC_TWR_API_031) |
| Tower page write attempt | Any POST/PATCH originating from `/admin/towers` | None exist — page is read-only (BRD §6 Rule 1, §7 + TC_TWR_BIZ_018) |
| Per-unit toggle attempt | Look for per-unit `.ant-switch` on `/admin/cms` or `/admin/towers` | None exist — toggle is tower-level only (INDEX.md §"Important: Unit-level status toggle is NOT exposed in UAT" — TC_TWR_BIZ_023) |
| Tower toggle without confirmation expectation | Click `.ant-switch` on `/admin/cms` | NO `.ant-modal` and NO `.ant-popover` appears. Toggle is immediate. (Correction #5 — TC_TWR_FUNC_024) |

---

## Pre-conditions

### Auth
- Storage state: `automation-repository/fixtures/.auth/admin.json`
- Login: Mobile OTP — `8888888888` / `258369` (UAT)
- Role: Admin or Sales Manager Admin (BRD §2)
- API token: Bearer for admin role, scoped to projectId=2 on UAT

### Data — Towers page
- DB contains 18 towers for projectId=2
- ≥ 1 tower in Active state (default: 15)
- ≥ 1 tower in Inactive state (default: Horizon / Pinnacle / Bright)
- Crest tower: floors 1..35, 8 units per floor → 267 cells total
- At least 1 unit per status class on Crest: `available`, `booked`, `hold`, `reserved`, `not_available`, `refuge` — required for cell-class taxonomy TC_TWR_BIZ_016 and colour TC_TWR_UI_017
- Reference cells exist with the listed state:
  - 3405 (Crest, AVAILABLE) — for TC_TWR_FUNC_010, _INT_027
  - 3501 (Crest, BOOKED, owner Supriya Dubey reg GHNG-2000000009-Z) — for TC_TWR_FUNC_011
  - 3307 (Crest, PAYING_HOLD, owner Supriya Dubey reg GHNG-2000000009-Y, 2 BHK Growth Home) — for TC_TWR_FUNC_012
  - 804 (Crest, REFUGE literal text) — for TC_TWR_NEG_015 and TC_TWR_BIZ_008
  - 3502 (Crest, AVAILABLE) — for TC_TWR_INT_026 (will be flipped to RESERVED then reverted)

### Data — Config page
- Tower 14 - Horizon present in Config grid with `.ant-switch` in OFF state — for TC_TWR_FUNC_024 and TC_TWR_INT_025
- Config Unit Status upload feature enabled — for TC_TWR_INT_026
- Config Unit Cost Update feature enabled — for TC_TWR_INT_027
- "View Tower >" link present in each tower row — for TC_TWR_XMOD_022

### Environment / Network
- WebSocket Python service reachable at `/broadcast-towers` endpoint — for TC_TWR_API_035
- DB read access (Sequelize) — for TC_TWR_DB_036
- Audit log table queryable — for TC_TWR_API_035

### Cross-module fixtures
- Config write access for TC_TWR_FUNC_024, TC_TWR_INT_025 (tower toggle), TC_TWR_INT_026 (unit status), TC_TWR_INT_027 (unit cost)
- TC_TWR_XMOD_022 starts on `/admin/cms` — no Towers-page pre-state required

---

## Cleanup / Teardown

| TC group | Cleanup action |
|----------|----------------|
| TC_TWR_FUNC_024 | Re-click `.ant-switch` for Tower 14 - Horizon to return it to OFF baseline (per INDEX.md capture script which already revert-toggled and confirmed state) |
| TC_TWR_INT_025 | Same — revert Horizon switch to OFF after assertion |
| TC_TWR_INT_026 | Revert unit 3502 (Crest) back to AVAILABLE state via Config Unit Status upload |
| TC_TWR_INT_027 | Revert unit 3405 (Crest) `basicPrice` / `totalUnitValue` back to baseline via Config Unit Cost Update |
| TC_TWR_API_035 | No state revert needed for WS broadcast (fire-and-forget); audit log idempotency check is read-only |
| All UI / FUNC / NEG / BIZ on Towers page | None — page is read-only |
| All DB / API read TCs | None — read-only queries |

**Idempotency note:** Per BRD §11.6 + TC_TWR_API_035, calling `updateTowerStatus` with the current state is a no-op (no audit row). Cleanup scripts must read current state first; re-setting the same state writes no audit row.

---

## Baseline Reference (UAT capture 2026-06-01 and 2026-06-02 deltas)

```
KPI — Towers:                   Total=18  Active=15  Inactive=3
KPI — Units:                    Total=4708  Sold=238  Available=3729  Disabled=738
Default tower on landing:       Crest (auto-selected)
Crest inline stat row:          267 Total · 84 Available · 90 Sold · 3 Paying now · 6 Refuge (R) · 84 Disabled · 0 PBT
Crest units available (chip):   84
Triumph units available (chip): 223
Blossom units available (chip): 0
Inactive towers (chip suffix):  Horizon, Pinnacle, Bright
Tower 14 - Horizon (Config):    .ant-switch OFF (aria-checked=false) — baseline
Reference AVAILABLE unit:       3405 (Crest, 1 BHK Growth)
Reference BOOKED unit:          3501 (Crest, owner Supriya Dubey, reg GHNG-2000000009-Z)
Reference HOLD unit:            3307 (Crest, owner Supriya Dubey, reg GHNG-2000000009-Y, 2 BHK Growth Home, Agreement Value ₹49,99,000)
```

When live UAT data drifts from baseline, update this section + INDEX.md and re-run capture before re-assertion.

---

## Selector Reference (sourced from INDEX.md — for POM authoring)

```
Page wrapper                  .tower-page-margin
KPI cards section             .towers-card.mt-4 → .towers-card-content
Tower sidebar (sticky)        .tower-select-sticky → .tower-list
Tower chip                    h5 (e.g. "Crest", "Triumph", "Horizon (Inactive)")
Heatmap container             .towers-card-content.units-card-content
Unit wrapper (clickable)      .unit-size-item                        // React onClick is HERE
Unit wrapper — booked         .unit-size-item.booked                 // red rgb(214,24,32)
Unit wrapper — available      .unit-size-item.available              // white + green border
Unit wrapper — hold           .unit-size-item.hold                   // orange rgb(255,165,0)
Unit wrapper — reserved       .unit-size-item.reserved               // grey rgba(114,114,114,0.776)
Unit wrapper — not_available  .unit-size-item.not_available          // plain white
Unit wrapper — refuge         .unit-size-item.refuge                 // light grey + "REFUGE" text
Unit number text (inner)      .unit-number                           // click here does NOT open panel
Unit detail panel             div.more-details-allocation            // NOT .ant-drawer, NOT .ant-modal
Mark-as-Reserved CTA          div.more-details-allocation button:has-text('Mark unit as Reserved')
Toolbar — download            button:has-text('Download unit registrations')
Toolbar — PBT                 button:has-text('Pre-Booked Payments')
Toolbar — refresh             button.reset.reset-refresh             // icon-only
Selected-tower header         h6 "Tower: <name>"
Config switch (any)           .ant-switch                            // 19 instances on /admin/cms
Config — Tower X label        text=/Tower \d+ - .+/
Config — View Tower link      a:has-text('View Tower'), button:has-text('View Tower')
Config — Update Tower Conf    button:has-text('Update Tower Configuration')
Config — Sample File DL       button:has-text('Sample File Download')
Sidebar active item           li.ant-menu-item.ant-menu-item-selected:has-text('Towers')
```
