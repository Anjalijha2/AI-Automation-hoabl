# Admin Portal — Towers Module BRD

**Module:** Towers
**URL:** `https://uat-web.xrportal.in/admin/towers`
**Created:** 2026-05-11
**Status:** Complete — Automated (Sprint 2/3)

---

## 1. Purpose

The Towers module gives the admin team a read-only view of the entire property inventory — all 18 towers, their floors, and every individual unit. The admin can browse which units are available, sold, or reserved, and see the pricing details for any available unit. No changes can be made from this page; all modifications are done in the Config module.

---

## 2. Who Uses This

| User | What They Do Here |
|------|------------------|
| Admin | Browse tower and unit inventory, check unit pricing, verify availability |
| Sales Manager Admin | Same as Admin |

---

## 3. How to Access

Left sidebar → click **Towers** → `/admin/towers`

Can also be reached from the Config module by clicking the green **"View Tower >"** link next to any tower.

---

## 4. Screen Layout

### Zone 1 — KPI Cards

Two rows of summary cards at the top:

| Card | What It Shows |
|------|--------------|
| Total Towers | 18 (fixed — always 18 towers in the project) |
| Active Towers | Towers with the Active toggle turned on in Config |
| Inactive Towers | Towers with the Active toggle turned off |
| Total Units | All units across all 18 towers |
| Available Units | Units currently available for selection |
| Sold Units | Units that have been booked and paid for |
| Disabled Units | Units that are reserved, restricted, or otherwise unavailable |

### Zone 2 — Tower Sidebar List

Left panel listing all 18 towers by name. Each tower shows:
- The tower name
- How many units are available (e.g. "159 Units Available")
- "(Inactive)" label if the tower is currently inactive

**All 18 towers:** Crest, Crown, Blossom, Bright, Pinnacle, Triumph, Prestige, Horizon, Dawn, Aura, Glory, Pride, Grace, Aspire, Prime, Fortune, Radiance, Grand

### Zone 3 — Floor/Unit Grid

When you click a tower in the sidebar, the floor/unit grid loads in the main area.

At the top of the grid: a header bar showing that tower's totals (Total / Available / Sold / Disabled).

Below: a grid of unit cells. Each row is a floor; each column is a unit position.

**Unit color codes:**

| Color | Status | Can Be Clicked? |
|-------|--------|----------------|
| White (light border) | Available | Yes — opens unit detail panel |
| Red | Sold (booked and paid) | No |
| Orange | Being paid right now (another buyer in payment) | No |
| Grey | Reserved / Blocked / Refuge / Special allocation | No |

### Zone 4 — Unit Detail Panel

When you click an available (white) unit, a detail panel slides in from the right showing:

| Field | Example |
|-------|---------|
| Unit Number | "3502 – Crest" |
| BHK Type | "1 BHK Growth Home" |
| Size | "323 sq.ft." |
| Agreement Value | "₹32,99,000" |
| Early Bird Discount | "₹27,000" |
| All Inclusive Price | Calculated total price |

---

## 5. Feature Walkthrough

### Viewing Tower and Unit KPI Counts

1. Left sidebar → click **Towers**
2. KPI cards load at the top with the current inventory counts
3. Numbers update when tower status or unit status changes in Config

### Browsing a Specific Tower

1. On the left side, find the tower name in the list
2. Click the tower name
3. The floor/unit grid loads in the main area
4. The grid header updates to show that tower's specific stats

### Finding Available Units in a Tower

1. Select the tower from the sidebar
2. Look for white unit cells in the grid — these are available
3. Count available units from the grid header (shows "Available: N")

### Viewing Unit Pricing Details

1. Select a tower from the sidebar
2. Click any white (available) unit cell in the grid
3. The unit detail panel slides in from the right
4. Read the Agreement Value, Early Bird Discount, and All Inclusive Price

### Why Clicking a Sold Unit Does Nothing

Clicking a red (sold) unit does not open any panel. This is by design — sold units have no actionable information for the admin to view from this page.

### Navigating Here from Config

1. In Config → Tower Configuration section, find the tower
2. Click the green **"View Tower >"** link
3. The Towers page opens with that tower already selected and its grid visible

---

## 6. Business Rules

1. This page is entirely read-only — no unit status, pricing, or tower configuration can be changed here
2. To activate or deactivate a tower, go to Config → Tower Configuration
3. To change a unit's status, go to Config → Unit Status upload
4. To update unit pricing, go to Config → Unit Cost Update
5. Only white (Available) units open the detail panel on click — all other colors do nothing
6. There are always exactly 18 towers (this is fixed for the Xanadu project)
7. KPI counts on this page and on the Customers page both reflect the Config tower toggle state

---

## 7. Validations

None — this is a read-only view. No user input is accepted on this page.

---

## 8. Dependencies

| Module | Relationship |
|--------|-------------|
| [Config / CMS](BRD-Config-CMS.md) | Tower active/inactive state is controlled in Config; pricing is updated via Config |
| [Allocation](BRD-Allocation.md) | Active towers appear in the customer unit selection grid during allocation campaigns |
| [Offers](BRD-Offers.md) | Active offer discounts are applied on top of the Agreement Value shown here |

---

## 9. User Journey Map

**Standard inventory check:**

| Step | Actor | Action | System Response | Next Step |
|------|-------|--------|----------------|-----------|
| 1 | Admin | Clicks Towers in sidebar | KPI cards and tower list load | Step 2 |
| 2 | Admin | Reviews KPI cards | Sees total/available/sold/disabled counts | Step 3 |
| 3 | Admin | Clicks "Crest" in tower list | Floor/unit grid for Crest loads | Step 4 |
| 4 | Admin | Scans grid for white units | Identifies available units by white color | Step 5 |
| 5 | Admin | Clicks a white unit | Unit detail panel opens with pricing | Done |

---

## 10. Open Questions / Gaps

None. All tower module behavior confirmed through automated testing (13 tests passing).

---

## 11. Backend Gap Reconciliation (2026-05-21)

Controller (`tower.controller.js`) and service (`tower.service.js`) audit findings.

### 11.1 Hard-coded projectId (env-derived) <!-- BA correction: GAP-TL-025, GAP-DEV-001, 2026-05-21 -->
- `tower.controller.js:17, 175`: `const projectId = app.production ? 1 : 2;`. Tower list and unit-by-tower endpoints scope on this. Client cannot override.

### 11.2 `getAllTowers` accepts `isActive` filter via GET body <!-- BA correction: GAP-TL-026, 2026-05-21 -->
- The endpoint reads `req.body.isActive`, accepting only literal `true`/`false`. GET-with-body is non-standard; many HTTP clients strip the body. Document the filter but flag the anti-pattern.

### 11.3 KPI `disabledUnits` = RESERVED only (FRD previously said REFUGE+RESERVED+PBT) <!-- BA correction: GAP-TL-027, 2026-05-21 -->
- `tower.controller.js:198`: `disabledUnits: counts.reserved || 0`. The FRD Feature 1 §5 description (REFUGE / RESERVED / PBT) is incorrect — code counts RESERVED only.

### 11.4 `availableUnits` source <!-- BA correction: GAP-TL-028, 2026-05-21 -->
- `availableUnits` is computed by `common.controller.getUnitStatusCount`; verify scope (AVAILABLE only vs AVAILABLE+others) when designing KPI tests.

### 11.5 `updateTowerStatus` fires Python `/broadcast-towers` <!-- BA correction: GAP-TL-029, 2026-05-21 -->
- `tower.controller.js:135-139` issues a GET to the Python WebSocket service endpoint `/broadcast-towers`. Required for QA WebSocket mocks; not previously documented.

### 11.6 No-op toggles skipped from audit log <!-- BA correction: GAP-TL-030, 2026-05-21 -->
- If `updateTowerStatus` is called with the current state (no-op), the audit-log emission is skipped (`tower.controller.js:81-83`). QA: do not assert audit row on idempotent toggle.

### 11.7 `getUnitsByTowerId` response shape <!-- BA correction: GAP-TL-031, 2026-05-21 -->
- Returns: `id, unitName, unitId, unitNo, floorNumber, status, basicPrice, totalUnitValue, facing`.
- FRD Feature 4 §5 previously listed: Unit No, BHK Type, Size, Agreement Value, Early Bird Benefit, All Inclusive Price.
- Reconciliation: `basicPrice` and `totalUnitValue` are present in the API but were absent from the FRD drawer description; `agreementValue` and `earlyBirdBenefit` are NOT in the response. QA test data must use the actual response fields.

### 11.8 Admin unit-swap tower list NOT filtered by `isActive` <!-- BA correction: GAP-DEV-028, 2026-05-21 -->
- `tower.service.js:17-25` `adminUnitSwapTowers` returns ALL towers regardless of `isActive`. Only `userHeatmapTowers` and `fetchTowersForDropdown` filter. This is already noted in UnitSwap FRD §4.2; restated here for cross-reference.
