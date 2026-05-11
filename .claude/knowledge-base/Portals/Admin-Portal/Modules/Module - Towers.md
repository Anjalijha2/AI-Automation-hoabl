---
module: Towers
url: https://uat-web.xrportal.in/admin/towers
sprint: 3
status: Automated
spec: tests/ui/towers.spec.js
tcs: TC-TWR-001–013 (13 tests)
updated: 2026-05-10
---

# Module — Towers

## 1. Overview

Read-only inventory view of all towers and units. Three functional zones: KPI summary cards, tower sidebar list, and floor/unit grid with a unit detail drawer. Admin can browse tower and unit inventory but cannot edit it from this page — modifications are made in Config CMS.

**URL:** `https://uat-web.xrportal.in/admin/towers`
**Auth:** Required — `src/fixtures/.auth/admin.json`
**Page Object:** `src/pages/TowersPage.js`
**Selectors:** `docs/selectors/towers.json`

## 2. Navigation

Left sidebar → "Towers" → `/admin/towers`

Can also be reached via "View Tower >" link from Config CMS Tower Configuration section.

## 3. Page Layout

### Zone 1 — KPI Cards

Two sets of KPI cards:

| Card | Metric |
|------|--------|
| Total Towers | Count of all towers (18) |
| Active Towers | Towers with Active toggle in Config |
| Inactive Towers | Towers without Active toggle |
| Total Units | All units across all towers |
| Available Units | Units with Available status |
| Sold Units | Units with Sold status |
| Disabled Units | Units with Disabled/Reserved status |

**KPI baselines** are pinned in `KPI_BASELINE` constant at top of `towers.spec.js`. Update this constant when real UAT data changes.

### Zone 2 — Tower Sidebar List

- 18 towers listed
- Active towers are selectable and show "N Units Available" count
- Inactive towers show "(Inactive)" label
- Selector: `li.tower-item`

**All 18 towers:** Crest · Crown · Blossom · Bright · Pinnacle · Triumph · Prestige · Horizon · Dawn · Aura · Glory · Pride · Grace · Aspire · Prime · Fortune · Radiance · Grand

**Active during Allocation (selectable in unit selection):** Crest, Crown, Blossom, Bright, Pinnacle (5 observed)

### Zone 3 — Floor/Unit Grid

Loads when a tower is selected from sidebar.

**Grid header:** Shows tower-level stats (Total / Available / Sold / Disabled). Selector: `.floors-index-wrap`

**Unit colour coding:**

| Colour | Status | Clickable |
|--------|--------|-----------|
| White / light border | Available | Yes |
| Green | Selected (current session) | — |
| Red | Sold | No |
| Orange | Paying now (another session) | No |
| Grey | Refuge / Reserved / Blocked | No |

**Selectors:** `.unit-size-item.available` (available), `.unit-size-item.sold` (sold)

### Zone 4 — Unit Detail Drawer

**Trigger:** Click an Available unit cell in the grid
**Component:** `.ant-drawer-body` (slides from right)
**Visible on:** Available units only — Sold units do NOT open the drawer

**Drawer fields:**
- Unit No (e.g. "3502 – Crest")
- BHK type (e.g. "1 BHK Growth Home")
- Size (sq.ft.)
- Agreement Value
- Early Bird Discount
- All Inclusive Price

## 4. Features

- KPI dashboard for tower and unit inventory counts
- Tower list navigation (sidebar)
- Floor/unit availability grid (colour-coded)
- Unit detail drawer for pricing and BHK info
- Cross-module navigation: "View Tower >" from Config opens this page with tower pre-selected

## 4a. How to Use

### Viewing Tower and Unit Inventory

1. Left sidebar → click **"Towers"**
2. KPI cards at top show: Total Towers, Active Towers, Inactive Towers, Total Units, Available Units, Sold Units, Disabled Units
3. Tower sidebar on the left lists all 18 towers; each shows available unit count

### Browsing a Tower's Units

1. Click any tower name in the left sidebar
2. The floor/unit grid loads in the main area
3. Grid header shows tower-level stats (Total / Available / Sold / Disabled)
4. Unit colour codes: **White** = Available, **Red** = Sold, **Orange** = Being paid now, **Grey** = Reserved/Blocked

### Viewing Unit Details

1. Click on any **white (Available)** unit cell in the grid
2. A detail drawer slides in from the right showing:
   - Unit No. and tower name
   - BHK type and size (sq.ft.)
   - Agreement Value
   - Early Bird Discount
   - All Inclusive Price
3. Note: Clicking a **red (Sold)** unit does nothing — drawer does not open for sold units

### Navigating from Config CMS

1. In Config CMS (left sidebar → "Config"), scroll to Tower Configuration section
2. Click the green **"View Tower >"** link next to any tower
3. You are taken directly to the Towers page with that tower pre-selected

> This is a **read-only** view — to activate/deactivate towers or change unit status, use the Config CMS module.

---

## 5. Business Rules

1. This is a read-only view — no create, edit, or delete operations on this page
2. Tower active/inactive state is controlled via Config CMS Tower Configuration section
3. Only Available (white) units open the detail drawer on click
4. Sold (red) units are not clickable — detail drawer does not open
5. KPI counts update when tower/unit state changes in Config
6. KPI baseline values are pinned in the spec file — update `KPI_BASELINE` constant if UAT data changes
7. 18 towers total in the system (fixed)
8. "View Tower >" link in Config CMS navigates to this page with that tower pre-selected

## 6. Integration Points

| Module | Relationship |
|--------|-------------|
| Config CMS | Tower Configuration section controls which towers are Active (and therefore selectable) |
| Allocation | Active towers appear in customer unit selection tower panel |
| Offers | Typology-scoped offers apply to specific unit types visible in this tower grid |

## 7. Domain Red Flags

No write operations from this module — read-only view. Low domain risk.

| Flag | Severity | Impact |
|------|----------|--------|
| KPI baselines are pinned in spec | LOW | If UAT data changes (real bookings), pinned KPI values become stale and tests fail |

## 8. Open Clarifications

No open clarifications for this module.

## 9. Test Coverage

| TC | Priority | Description | Result |
|----|----------|-------------|--------|
| TC-TWR-001 | P1 Smoke | KPI cards show correct tower + unit counts (pinned baselines) | ✅ Pass |
| TC-TWR-002 | P2 | Unit KPI count consistent with Crest grid Available count | ✅ Pass |
| TC-TWR-003 | P1 Smoke | All 18 towers listed in sidebar | ✅ Pass |
| TC-TWR-004 | P2 | Tower item shows name + available unit count | ✅ Pass |
| TC-TWR-005 | P1 | Selecting tower loads floor/unit grid | ✅ Pass |
| TC-TWR-006 | P2 | Grid header shows correct tower stats (Total/Available/Sold/Disabled) | ✅ Pass |
| TC-TWR-007 | P1 | Clicking available unit opens detail drawer | ✅ Pass |
| TC-TWR-008 | P2 | Drawer shows correct unit fields (No, BHK, Size, Agreement Value, etc.) | ✅ Pass |
| TC-TWR-009 | P2 | Sold (red) unit click — drawer does NOT open | ✅ Pass |
| TC-TWR-010 | P2 | Inactive tower has "(Inactive)" label in sidebar | ✅ Pass |
| TC-TWR-011 | P2 | Inactive tower can be selected; grid still loads | ✅ Pass |
| TC-TWR-012 | P2 | "View Tower" from Config → navigates to Towers with that tower selected | ✅ Pass |
| TC-TWR-013 | P2 | Grid stat header updates when different tower selected | ✅ Pass |

**KPI baseline note:** Baselines pinned 2026-04-04. Update `KPI_BASELINE` constant in `towers.spec.js` if UAT unit counts change.

---

## 10. Data Model

### Unit (units table) — Full Schema

| Field | Type | Notes |
|-------|------|-------|
| `id` | INTEGER PK | |
| `unitId` | STRING(255) | Business identifier (used in RegistrationUnit FK) |
| `unitName` | STRING(255) | Display name |
| `unitNo` | STRING(255) | e.g. "3502" |
| `towerId` | STRING(255) | Tower business ID (joins to Tower.towerId) |
| `towerName` | TEXT | Denormalized tower name |
| `floorId` | BIGINT UNSIGNED FK → floors | |
| `floorNumber` | INTEGER | |
| `typologyId` | TEXT | Typology business ID |
| `frontendTypologyName` | STRING(255) | e.g. "1 BHK Growth Home" |
| **Pricing fields** | | |
| `agreementValue` | INTEGER | Base price (= total price for unit cost update) |
| `basicPrice` | BIGINT | |
| `societyCharge` | BIGINT | |
| `clubHouseCharge` | DECIMAL(15,2) | |
| `possesionCharge` | BIGINT | |
| `premiumCharge` | BIGINT | |
| `infraCharge` | BIGINT | |
| `infraChargeExclAv` | BIGINT | Infrastructure charge excluding Agreement Value |
| `floorRise` | BIGINT | Premium for higher floors |
| `stampDuty` | DOUBLE | |
| `gst` | BIGINT | |
| `gstOnAmenities` | BIGINT | |
| `parkingCharge` | BIGINT | |
| `registrationCharges` | INTEGER | |
| `legalCharge` | BIGINT | |
| `tds` | DOUBLE | |
| `totalUnitValue` | DOUBLE | |
| `offer` | DOUBLE | Legacy offer percentage |
| `offerAmount` | DOUBLE | Legacy offer amount |
| `earlyBirdBenefit` | DECIMAL(15,2) | Early Bird Benefit discount |
| `allocationAmount` | DECIMAL(15,2) | Confirmation amount (what buyer pays at booking) |
| `allocationPercent` | DECIMAL(15,2) | Used if `allocationCalcType = PERCENT` |
| `allocationCalcType` | ENUM('PERCENT','AMOUNT') | Whether confirmation amount is % or fixed |
| `discount` | DOUBLE | |
| `cutOff` / `siteHeadCutOff` | BIGINT | |
| `hiddenCharges1–4` | BIGINT/DOUBLE | |
| **Status** | | |
| `status` | ENUM('AVAILABLE','HOLD','BOOKED','REFUGE','PREBOOKED','PBT','RESERVED') | |
| `holdAt` | DATE | Timestamp when unit was put on hold during offline payment |
| **Other** | | |
| `facing` | TEXT | Unit facing direction |
| `view` | DOUBLE | |
| `band` | DOUBLE | |
| `imageUrl` | TEXT | Image URLs separated by `\|\|` |
| `numberOfParkings` | DOUBLE | |
| `fkProjectId` | BIGINT UNSIGNED FK → projects | |
| `fkTowerId` | INTEGER FK → towers | |
| `fkTypologyId` | BIGINT UNSIGNED FK → unit_typologies | |
| `deletedAt` | DATE | Soft delete (paranoid: true) |

**Unit.auditEnabled = true** — all unit changes are audit-logged.

### Unit Status → UI Colour Mapping

| DB Status | UI Colour | Admin Towers View | Customer Selection |
|-----------|-----------|-------------------|-------------------|
| AVAILABLE | White | Available | Selectable |
| HOLD | Orange | Paying now | Not selectable |
| BOOKED | Red | Sold | Not selectable |
| REFUGE | Grey | Refuge | Not selectable |
| PREBOOKED | Red (or Grey) | — | Not selectable |
| PBT | Grey | — | Not selectable |
| RESERVED | Grey | Reserved/Blocked | Not selectable |

---

## 11. API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/towers` | All towers with status and unit counts |
| GET | `/api/v1/admin/tower-kpi` | KPI aggregate (total/active/inactive towers, total/available/sold/disabled units) |
| GET | `/api/v1/admin/units-by-tower/:towerId` | Units for a specific tower (grid data) |
| PUT | `/api/v1/admin/towers/status-update` | Update tower active/inactive state (batch save) |

**Note:** "View Tower >" in Config CMS uses the same `/admin/towers` page with tower pre-selected via URL param or state — not a separate API call.
