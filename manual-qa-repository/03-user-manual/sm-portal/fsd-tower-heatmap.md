# FSD — SM Portal: Tower Heatmap
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Tower Heatmap is a Sales Manager (SM) facing visualization of every tower in the active project, rendering a floor-by-floor grid of unit tiles colour-coded by status. SM clicks a unit tile to fetch unit-level details (registration preferences, sold-to information, pricing, offers) before triggering a physical allocation flow.

The module is served by **shared role-dispatched services** — the same controller endpoint serves Admin, User (Buyer), and SM, switching to the SM-specific code path via `req.user.roleId`.

Backend files involved:
- `source-code/backend/src/controllers/common.controller.js` — entry-point handlers // Source: common.controller.js:33, 55, 70
- `source-code/backend/src/services/common.service.js` — role dispatch + SM heatmap implementations // Source: common.service.js:661, 882, 910, 969, 1214
- `source-code/backend/src/services/tower.service.js` — tower fetch helpers // Source: tower.service.js:42-74
- `source-code/backend/src/services/unit.service.js` — unit fetch helpers // Source: unit.service.js:32-96
- `source-code/backend/src/routes/common.routes.js` — `/towers`, `/towers/:towerId/units` // Source: common.routes.js:10-11
- `source-code/backend/src/routes/units.routes.js` — `/units/:unitId` // Source: units.routes.js:14

DB tables involved:
- `towers` // Source: tower.model.js:210
- `units` // Source: unit.model.js:445
- `floors` // Source: floor.model.js (table: `floors`, modelName: `Floor`)
- `tower_unit_details` // Source: tower-unit-detail.model.js:54
- `registration_units` // Source: common.service.js:1250 (RegistrationUnit include)
- `registrations`, `users` (for `soldTo` enrichment) // Source: common.service.js:1256-1260
- `registration_preferences` // Source: common.service.js:1265-1270
- `master_configs` (key `sm_unit_cost_masking`) // Source: common.service.js:664
- `projects` (for `maxPreferencesPerUnit`) // Source: common.service.js:1221-1226

---

## 2. Data Model

### Tower (model: `Tower`, table: `towers`)
| Field | Type | Source |
|-------|------|--------|
| `id` | INTEGER PK auto-increment | tower.model.js:53-56 |
| `towerId` | STRING(255) — business identifier | tower.model.js:68-72 |
| `towerName` | STRING(255) | tower.model.js:156-160 |
| `towerCode` | STRING(255) | tower.model.js:97-101 |
| `towerSequence` | INTEGER — sort order in heatmap | tower.model.js:194-198 |
| `projectId` | STRING(255) | tower.model.js:121-125 |
| `noOfFloors` | INTEGER | tower.model.js:162-166 |
| `isActive` | BOOLEAN, default `true` | tower.model.js:187-192 |

### Unit (model: `Unit`, table: `units`)
| Field | Type | Source |
|-------|------|--------|
| `id` | INTEGER PK | unit.model.js:81-85 |
| `unitId` | STRING(255) — business id | unit.model.js:128-132 |
| `unitNo` | STRING(255) | unit.model.js:146-150 |
| `towerId` | STRING(255) | unit.model.js:134-138 |
| `floorId` | BIGINT.UNSIGNED → `floors.id` | unit.model.js:140-144 |
| `floorNumber` | INTEGER | unit.model.js:234-238 |
| `status` | ENUM (see §3) | unit.model.js:176-180 |
| `projectId` | TEXT | unit.model.js:181-185 |
| `typologyName` | DOUBLE | unit.model.js:270-274 |
| `frontendTypologyName` | STRING(255) | unit.model.js:193-198 |
| `towerName` | TEXT | unit.model.js:264-268 |
| `agreementValue` | INTEGER | unit.model.js:252-256 |
| `earlyBirdBenefit` | DECIMAL(15,2) | unit.model.js:419-422 |
| `registrationCharges` | INTEGER | unit.model.js:258-263 |
| `allocationAmount` | DECIMAL(15,2) | unit.model.js:402-406 |
| `allocationPercent` | DECIMAL(15,2) | unit.model.js:407-412 |
| `allocationCalcType` | ENUM(`PERCENT`,`AMOUNT`) | unit.model.js:413-418 |

### Floor (model: `Floor`, table: `floors`)
| Field | Type | Source |
|-------|------|--------|
| `id` | INTEGER PK | floor.model.js:41-45 |
| `floorName` | STRING(255) | floor.model.js:46-51 |
| `towerId` | STRING(255) | floor.model.js:52-57 |
| `floorSequence` | INTEGER — sort order in heatmap rows | floor.model.js:64-69 |
| `isActive` | BOOLEAN | floor.model.js:70-75 |

### TowerUnitDetail (model: `TowerUnitDetail`, table: `tower_unit_details`)
| Field | Type | Source |
|-------|------|--------|
| `id` | BIGINT.UNSIGNED PK | tower-unit-detail.model.js:24-29 |
| `projectId` | BIGINT.UNSIGNED | tower-unit-detail.model.js:30-33 |
| `towerId` | STRING(45) | tower-unit-detail.model.js:34-37 |
| `unitNo` | STRING(45) | tower-unit-detail.model.js:38-41 |
| `areaSqFt` | STRING(45) | tower-unit-detail.model.js:42-45 |
| `typologyName` | STRING(45) | tower-unit-detail.model.js:46-49 |

### Unit Status ENUM — 7 values
```
AVAILABLE | HOLD | BOOKED | REFUGE | PREBOOKED | PBT | RESERVED
```
// Source: unit.model.js:177 — `DataTypes.ENUM('AVAILABLE', 'HOLD', 'BOOKED', 'REFUGE', 'PREBOOKED', 'PBT', 'RESERVED')`

> **NOTE — discrepancy with task hint:** The task description listed unit status values as `AVAILABLE, BOOKED, REGISTERED, ALLOTTED, BLOCKED, CANCELLED, SWAP_BLOCKED`. The actual Sequelize model at `unit.model.js:177` defines a different 7-value ENUM (above). Values `REGISTERED`, `ALLOTTED`, `BLOCKED`, `CANCELLED`, `SWAP_BLOCKED` are **NOT present** in the live model. // Source: unit.model.js:176-180 — verified against current backend.

### Synthetic `NOT_AVAILABLE` status (frontend-only)
SM heatmap padding logic produces synthetic tiles with `status: 'NOT_AVAILABLE'` for missing unit slots — this is a **render-time pseudo-status** not stored in DB. // Source: common.service.js:1378

---

## 3. State Machines

### Unit status → heatmap colour (SM view only)
| DB status | `showColour` | `showDisabled` | `unitLabel` | Notes |
|-----------|--------------|----------------|-------------|-------|
| `AVAILABLE` | `#00FF00` (green) | `false` | `unitNo` | clickable |
| `BOOKED` | `#FF0000` (red) | `true` | `unitNo` | soldTo populated when RegistrationUnit present |
| `PBT` | `#FF0000` (red) | `true` | `unitNo` | grouped with BOOKED in colour branch |
| `REFUGE` | `#808080` (grey) | `true` | literal `"REFUGE"` | non-residential slot |
| `HOLD` | `#00FF00` (green) — falls through `else` | `true` | `unitNo` | colour branch only checks BOOKED/PBT/REFUGE explicitly |
| `PREBOOKED` | `#00FF00` (green) — falls through `else` | `true` | `unitNo` | same as HOLD |
| `RESERVED` | `#00FF00` (green) — falls through `else` | `true` | `unitNo` | same as HOLD |
| `NOT_AVAILABLE` (synthetic) | `#808080` (grey) | `displayStatus: false` | unit number | padding tile, not interactive |

// Source: common.service.js:1297-1308 (colour branch), :1310-1331 (unitData), :1374-1384 (synthetic padding tile)

**Important state-machine observation:** the colour logic uses an `if / else if / else` chain that only assigns red to `BOOKED`/`PBT` and grey to `REFUGE`. **Every other status (`HOLD`, `PREBOOKED`, `RESERVED`) is painted GREEN** even though `showDisabled` is set to `true`. UI relies on `showDisabled` (not colour) to gate clicks. // Source: common.service.js:1293, 1297-1305.

There are **no state transitions performed by the heatmap module itself** — heatmap is read-only visualisation. Transitions happen via allocation/booking flows external to this module.

### RegistrationUnit status filter for `soldTo` enrichment
SM heatmap pulls a `RegistrationUnit` join only when status ∈ `['SOLD','BOOKED','PBT','RESERVED']`. // Source: common.service.js:1252.

### RegistrationUnit status filter on unit-detail call (`salesManagerHeatmapUnit`)
On `registration-preference-heatmap` action, the `RegistrationUnit` include is filtered to status ∈ `['HOLD','WINNER']`. // Source: common.service.js:698.

---

## 4. Business Rules

### Project resolution
- Project numeric id is hard-coded: `app.production ? 1 : 2`. // Source: common.service.js:662, 1217; tower.service.js:7; unit.service.js:7
- `projectCode` is resolved from `projects.projectId` via `getProjectCode()`. Invalid project → `ApiError.badRequest('Invalid project')`. // Source: common.service.js (getProjectCode definition); tower.service.js:11; unit.service.js:11

### Tower list rules (SM)
- Only towers where `isActive = 1` AND `projectId = <projectCode>` are returned. // Source: common.service.js:944
- Sort order: `towerSequence ASC`. // Source: common.service.js:945
- For each tower the response includes correlated sub-query counts:
  - `totalUnits` = `COUNT(*) FROM units WHERE tower_id = Tower.tower_id` // Source: common.service.js:923-930
  - `availableUnits` = same query with `AND status = 'AVAILABLE'` // Source: common.service.js:932-941
- `TowerUnitDetails` (areaSqFt, typologyName per unitNo) attached per tower. // Source: common.service.js:952-963

### Units-by-tower rules (SM heatmap)
- `towerId` is **mandatory**: missing → `ApiError.badRequest('towerId is required')`. // Source: common.service.js:1215
- Tower lookup also filters by `projectId`; if not found returns `{ data: [] }`. // Source: common.service.js:1229-1236
- Units sorted by `Floor.floor_sequence DESC, unitNo ASC` — top floor renders first. // Source: common.service.js:1273-1276
- Floors grouped by `Floor.floorSequence` value. // Source: common.service.js:1283-1290
- **8-unit-per-floor padding rule** (`TARGET_UNITS_PER_FLOOR = 8`):
  - If a floor has ≥ 8 real units, slice to first 8. // Source: common.service.js:1346-1349
  - If < 8, generate synthetic placeholder tiles to reach exactly 8 per floor, with unit numbers derived from `floorBaseNumber = parseInt(floorId)*100 + 1` (e.g., floor 1 → 101..108). // Source: common.service.js:1352-1384
  - Synthetic tiles get `unitId: "missing-<floorId>-<unitNo>"`, `status: 'NOT_AVAILABLE'`, `displayStatus: false`. // Source: common.service.js:1374-1384
- Final floor list is sorted `floor_id DESC`. // Source: common.service.js:1391

### Preference-count rule
- `preferenceCount` = number of `RegistrationPreference` rows joined for the unit & tower DB id. // Source: common.service.js:1265-1270, :1294
- `isMaxPrefReached` = `maxPreferencesPerUnit > 0 && preferenceCount >= maxPreferencesPerUnit`. // Source: common.service.js:1295
- `maxPreferencesPerUnit` is read from `Project.maxPreferencesPerUnit` (defaults to 0 if missing). // Source: common.service.js:1221-1226
- **The max-preferences-orange-tile rule is currently commented out** (`#FFA500`). // Source: common.service.js:1306-1308

### Unit-cost masking rule (SM only)
- `MasterConfig` key `sm_unit_cost_masking` (per project) controls whether pricing fields on the unit-detail card are returned as the literal string `"₹ xxxxxxxx"` instead of numeric values. // Source: common.service.js:664-666, 860-874
- Affected fields when masked: `agreementValue`, `earlyBirdBenefit`, `registrationCharges`, `allocationAmount`, `homeLoanDiscount`, `totalDiscount`, `stampDuty`, `gst`, `allInclusive`, `soldTo`. // Source: common.service.js:860-874

### `soldTo` enrichment rule
- `soldTo` is populated **only when** `status === 'BOOKED'` AND `RegistrationUnit.registration.User` is present. // Source: common.service.js:1319-1329
- Carries: `towerName`, `unitNo`, `buyerName` (firstName), `buyerLastName`, `phone`, `registrationNo`. // Source: common.service.js:1321-1328

### Role gating (Admin vs SM behavioural deltas on the same endpoint)
| Action | Admin path | SM path |
|--------|-----------|---------|
| `/towers?action=heatmap` | `adminHeatmapTowers()` — returns ALL towers regardless of `isActive` | `salesManagerHeatmapTowers()` — `isActive=1` only, plus totalUnits/availableUnits/TowerUnitDetails |
| `/towers/:id/units?action=heatmap` | `adminHeatmapUnits()` — flat list of `{unitId, unitNo, status}` ordered by unitNo | `salesManagerHeatmapUnits()` — floor-grouped, colour-coded, 8-unit padded, preference-counted |
| `/units/:unitId?action=registration-preference-heatmap` | not supported | `salesManagerHeatmapUnit()` — full pricing card + preferences |

// Source: common.service.js:887-902, :976-991, :1418-1423; tower.service.js:54-62; unit.service.js:33-42.

### Role restrictions enforced at route layer
- `/api/v1/towers` and `/api/v1/towers/:towerId/units` require role ∈ `{user, admin, sales_manager_admin, sales_manager}`. // Source: common.routes.js:8 (`restrictTo('user','admin','sales_manager_admin','sales_manager')`)
- `/api/v1/units/:unitId` requires same roles. // Source: units.routes.js:13
- Role-id map: `sales_manager_admin = 4`, `sales_manager = 5`. // Source: constants/global.js:19-20

### SM CANNOT (vs Admin)
- SM cannot see inactive towers (Admin can). // Source: tower.service.js:54-62 vs common.service.js:944
- SM does not get raw numeric prices when `sm_unit_cost_masking` is `true`. // Source: common.service.js:664-666
- SM cannot mutate unit price (`PUT /units/:id` restricted to `admin`). // Source: units.routes.js:18

---

## 5. Notification Dispatch

| Trigger | Channel | Recipient | Source |
|---------|---------|-----------|--------|
| **NONE** | — | — | No notification, email, SMS, or push dispatch logic exists in the heatmap code paths. // Source: grep `notification\|Notification\|notify` across `services/common.service.js` (heatmap functions span lines 661-1397) — zero matches |

The heatmap is strictly **read-only visualisation**. Side-effects such as booking confirmations / allocation notifications are dispatched by downstream booking / allocation services, not by the heatmap module.

---

## 6. API Endpoints

All endpoints require Bearer auth via `protect` middleware and role gating via `restrictTo`. Base prefix: `/api/v1`.

| # | Method | Path | Query params | Controller fn | Service path (SM role) | Auth guard | Source |
|---|--------|------|--------------|---------------|------------------------|------------|--------|
| 1 | GET | `/towers?action=heatmap` | `action=heatmap` (also accepts `drop-down`, `physical-event` for SM) | `getCommonTowers` | `salesManagerHeatmapTowers()` | `protect` + `restrictTo('user','admin','sales_manager_admin','sales_manager')` | common.routes.js:10; common.controller.js:55; common.service.js:894-898, 910 |
| 2 | GET | `/towers/:towerId/units?action=heatmap` | `action=heatmap` (also `drop-down`, `physical-event` with `campaignId`) | `getCommonUnitsByTower` | `salesManagerHeatmapUnits({towerId})` | `protect` + `restrictTo('user','admin','sales_manager_admin','sales_manager')` | common.routes.js:11; common.controller.js:70; common.service.js:983-987, 1214 |
| 3 | GET | `/units/:unitId?action=registration-preference-heatmap` | `action=registration-preference-heatmap` (SM); also `physical-allocation` with `offerIds`, `parkingAmount`, `registrationNumber` | `getCommonUnitDetails` | `salesManagerHeatmapUnit({unitId})` | `protect` + `restrictTo('user','admin','sales_manager_admin','sales_manager')` | units.routes.js:14; common.controller.js:33; common.service.js:1418-1420, 661 |

### Response envelopes
All three endpoints wrap responses via `ApiResponse.success(message, data).send(res)`. // Source: common.controller.js:36, 58, 73

### Response shape — endpoint 1 (`/towers?action=heatmap`, SM role)
```json
{
  "message": "Towers fetched successfully.",
  "data": [
    {
      "towerId": "...",
      "towerName": "...",
      "towerSequence": 1,
      "towerCode": "...",
      "isActive": 1,
      "totalUnits": 80,
      "availableUnits": 12,
      "TowerUnitDetails": [
        { "id": 1, "unitNo": "101", "areaSqFt": "650", "typologyName": "2BHK", "towerId": "..." }
      ]
    }
  ]
}
```
// Source: common.service.js:914-947, :952-966.

### Response shape — endpoint 2 (`/towers/:towerId/units?action=heatmap`, SM role)
```json
{
  "message": "Units fetched successfully",
  "data": [
    {
      "floor_id": 12,
      "units": [
        {
          "unitId": "...",
          "unitNo": "1201",
          "showDisabled": false,
          "showColour": "#00FF00",
          "unitLabel": "1201",
          "status": "AVAILABLE",
          "preferenceCount": 0,
          "isMaxPrefReached": false,
          "soldTo": null,
          "displayStatus": true
        }
      ]
    }
  ]
}
```
// Source: common.service.js:1310-1334, :1393-1396.

### Response shape — endpoint 3 (`/units/:unitId?action=registration-preference-heatmap`, SM role)
Fields: `unitId, unitNo, typologyName, agreementValue, earlyBirdBenefit, registrationCharges, carpetArea, towerName, towerId, status, allocationAmount, registrationNumber, homeLoanDiscount, totalDiscount, stampDuty, gst, allInclusive, soldTo, registrationPreferences, registrationUnitOffers`. // Source: common.service.js:856-877.

### Error responses
- Missing `towerId` on endpoint 2 → 400 `"towerId is required"`. // Source: common.service.js:1215; unit.service.js:34, 46
- Invalid `projectId` → 400 `"Invalid project"`. // Source: tower.service.js:11; unit.service.js:11; common.service.js (getProjectCode)
- Unsupported action for role → 403 `"Unsupported action for this role"`. // Source: common.service.js:903, 1427
- Generic failures wrapped via `ApiResponse.error(statusCode, message)`. // Source: common.controller.js:51-52, 65-66, 79-80 (region)

---

## 7. Known Bugs / Gaps

### B1 — Fall-through colour assignment for non-terminal statuses
`HOLD`, `PREBOOKED`, `RESERVED` units render **green** (same as `AVAILABLE`) because the colour `if/else` chain only handles `BOOKED`/`PBT`/`REFUGE` explicitly; everything else lands in the green `else`. SM relies entirely on `showDisabled=true` to know a green tile is not actually available. A UI that ignores `showDisabled` and renders by colour alone will mis-classify these as bookable. // Source: common.service.js:1297-1305.

### B2 — Synthetic-unit padding can shift real unit positions
The padding routine derives expected unit numbers from `floorBaseNumber = parseInt(floorId)*100 + 1` (i.e., assumes unit numbering scheme `<floor>01..<floor>08`). When the floor sequence does not map to that scheme, `existingUnits.splice(insertIndex, 0, ...)` inserts placeholders at indices computed from a wrong base, potentially shifting real units or producing duplicate `unitNo` collisions. // Source: common.service.js:1359-1384.

### B3 — `floorBaseNumber` uses `floorSequence`, not `floorNumber`
`floorId` in the loop is actually `Floor.floorSequence` (not the floor number). For floor sequence 0 (often the ground floor), `floorBaseNumber = 1`, generating placeholders `1..8` even when real units are `001..008` or `G01..G08`. // Source: common.service.js:1283, 1359.

### B4 — `salesManagerHeatmapUnit` returns string `"₹ xxxxxxxx"` for `soldTo` when masked
When `sm_unit_cost_masking` is enabled, `soldTo` is replaced with the masked string instead of `null` or an object — frontend code consuming `soldTo.buyerName` will throw. // Source: common.service.js:874.

### B5 — Hard-coded project resolution
`app.production ? 1 : 2` is hard-coded in three service files; supporting multi-project is impossible without code change. // Source: common.service.js:662, 1217; tower.service.js:7; unit.service.js:7.

### B6 — `userHeatmapUnits` and `adminHeatmapUnits` are byte-for-byte identical
Both functions select the same attributes with the same filter; the role split exists in dispatch only. Risk of accidental coupling on future change. // Source: unit.service.js:32-54.

### B7 — `RegistrationUnit` status filter mismatch
- Tower heatmap join filter: `['SOLD','BOOKED','PBT','RESERVED']`. // Source: common.service.js:1252
- Unit-detail join filter: `['HOLD','WINNER']`. // Source: common.service.js:698
These two endpoints would diverge for the same unit (e.g., a `RESERVED` registration shows up in heatmap soldTo but not in the unit-detail card).

### B8 — Commented-out feature: max-preference orange tile
The colour branch for `isMaxPrefReached && status === 'AVAILABLE'` → `#FFA500` is commented out. UI cannot distinguish AVAILABLE units that have hit `maxPreferencesPerUnit`. `isMaxPrefReached` is still emitted on the payload, requiring FE-side handling. // Source: common.service.js:1306-1308.

### B9 — `salesManagerHeatmapTowers` ignores the `action` for sales_manager when `campaignId` is absent
The dispatch passes `campaignId` from `req.query` only to `physicalEventPoolTowersList`; for heatmap action this is fine, but a malformed combined query (e.g., `action=heatmap&campaignId=X`) is silently accepted and `campaignId` ignored. // Source: common.service.js:894-898.

### B10 — No pagination on units endpoint
`salesManagerHeatmapUnits` loads ALL units for a tower in one query with multiple `LEFT JOIN`s (RegistrationUnit, Registration, User, RegistrationPreference). For towers with hundreds of units this can be expensive and has no upper bound or pagination. // Source: common.service.js:1239-1277.

### B11 — `subQuery: false` not set on heatmap units query
`salesManagerHeatmapUnit` uses `subQuery: false` (line 701) but `salesManagerHeatmapUnits` does not — combined with `required: false` joins this can cause Sequelize to produce sub-query plans that miscount rows in some MySQL versions. // Source: common.service.js:701 vs :1239-1277.

---

## 8. QA Risk Areas

### R1 — Status colour parity (HIGH)
Validate that every of the 7 ENUM values renders the correct tile state. Special focus on `HOLD`, `PREBOOKED`, `RESERVED` → must be visually distinguishable despite the green `else` branch (B1).

### R2 — 8-unit padding regression (HIGH)
Test towers/floors with: 0 real units, 1–7 real units, exactly 8, > 8. Verify synthetic tiles never have `displayStatus: true` and are non-clickable. Verify real units retain correct `unitId` and `unitNo` (no swaps from splice — B2, B3).

### R3 — Unit cost masking toggle (HIGH)
Toggle `master_configs.sm_unit_cost_masking` per project; verify every masked field becomes literal `"₹ xxxxxxxx"`. Confirm `soldTo` mask behaviour (B4) does not break FE.

### R4 — Role gating (HIGH)
Hit each endpoint as `admin`, `sales_manager`, `sales_manager_admin`, `user`, `cp` (channel partner). Confirm:
- Admin still hits `adminHeatmapTowers`/`adminHeatmapUnits` (NOT SM variant).
- `cp` and any unsupported role → 403.

### R5 — Inactive tower visibility (MEDIUM)
Mark a tower `isActive=false`. Verify it disappears from SM `/towers?action=heatmap` but remains visible on the Admin variant.

### R6 — Project ENV gating (MEDIUM)
Switch `app.production` flag. Verify SM heatmap honours the correct numeric project id (1 vs 2). (B5)

### R7 — `soldTo` enrichment correctness (HIGH)
Create units in states `BOOKED`, `PBT`, `SOLD`, `RESERVED`, `HOLD`. Only `BOOKED` + present `RegistrationUnit.registration.User` should populate `soldTo`. All others → `soldTo: null`.

### R8 — Preference count + max preference (MEDIUM)
For a project with `maxPreferencesPerUnit = N`, create units with 0, N-1, N, N+1 preferences. Verify `preferenceCount` matches and `isMaxPrefReached` flips correctly at boundary.

### R9 — Floor ordering (MEDIUM)
Towers with non-sequential `floorSequence` values (e.g., 1, 3, 5, 12). Verify floors are listed top-down by sequence DESC and synthetic units use the correct `floorBaseNumber` (regression for B3).

### R10 — Concurrent registration race (MEDIUM)
Two SMs view the heatmap simultaneously while a registration moves a unit from `AVAILABLE` → `HOLD`. Verify second SM's next refresh reflects the new colour. (No real-time websocket pushes observed in code paths — confirm read-stale tolerance is acceptable.)

### R11 — Endpoint 2 contract on bad `towerId` (LOW)
Send malformed/non-existent `towerId`. Expect 400 `"towerId is required"` on empty, and 200 with `data: []` when tower not found (current `if (!tower) return { data: [] }` behaviour) — verify FE handles empty array gracefully. // Source: common.service.js:1234-1236.

### R12 — Endpoint 3 unit-not-found (LOW)
Request a non-existent `unitId`; expect 200 with `data: null`. Confirm FE detail card handles null safely. // Source: common.service.js:705-707.

### R13 — Pricing math sanity (MEDIUM)
For a representative `agreementValue`, validate computed `stampDuty = round(FAV * 0.07, 2)`, `gst` per `calculateGstRate`, `allInclusive = round(FAV + stampDuty + registrationCharges + gst, 2)`. // Source: common.service.js:823-829.

### R14 — Performance on large towers (MEDIUM)
Load test SM endpoint 2 against a tower with 200+ units. Watch for slow Sequelize plans (B10, B11).

---

**End of FSD.**
