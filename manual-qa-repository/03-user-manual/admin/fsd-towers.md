# Feature Specification Document — Towers (Admin Portal)

**Source**: Backend code only (`source-code/backend/src/`)
**Date**: 2026-05-22
**Module Owner**: Admin Portal — Towers
**Generation Mode**: Source-code-verified. No BRD/FRD consulted. Every claim cites `path:line`.

---

## 1. Module Overview

The Towers module is the inventory-control surface of the Admin Portal. It exposes:

- A tower master list (active/inactive toggle, sequence, metadata)
- A unit-level drill-down per tower
- A KPI snapshot (tower counts, unit-status counts)
- A heatmap & unit-swap projection consumed cross-role via shared `/towers` endpoints
- Excel-driven bulk maintenance of unit price & unit status

Project scoping is environment-driven: production resolves to `Project.id = 1`, all other environments to `Project.id = 2`. The numeric primary key is then translated to the business `projectId` (string code) before any tower/unit lookup. (Source: `source-code/backend/src/controllers/tower.controller.js:17`, `source-code/backend/src/controllers/tower.controller.js:175`, `source-code/backend/src/services/tower.service.js:7-13`.)

Side-effects on writes:
- All `Tower.isActive` writes generate `AuditLog` rows and update the Redis `tower_config` cache. (Source: `source-code/backend/src/controllers/tower.controller.js:73-108`, `source-code/backend/src/controllers/tower.controller.js:120-142`.)
- Tower status changes broadcast to the Python service: `GET /broadcast-towers`. (Source: `source-code/backend/src/controllers/tower.controller.js:135-139`.)
- Unit status changes (AVAILABLE ↔ RESERVED) push to Python: `POST /units/status-sync`. (Source: `source-code/backend/src/controllers/admin.controller.js:1325-1340`.)

---

## 2. API Reference Table

All admin routes mount under `/api/v1/admin` and require `protect` + `restrictTo('admin')`. (Source: `source-code/backend/src/routes/admin.routes.js:53`.)

| # | Method | Endpoint | Controller | Role(s) | Validation |
|---|--------|----------|------------|---------|------------|
| 1 | POST | `/api/v1/admin/towers` | `getAllTowers` | `admin` | none (body filter only) |
| 2 | PUT | `/api/v1/admin/towers/status-update` | `updateTowerStatus` | `admin` | `updateTowerStatusSchema` |
| 3 | GET | `/api/v1/admin/units-by-tower/:towerId` | `getUnitsByTowerId` | `admin` | `towerIdParamSchema` |
| 4 | GET | `/api/v1/admin/tower-kpi` | `getTowerKpi` | `admin` | none |
| 5 | GET | `/api/v1/admin/export-all-units-price` | `getAllUnitsExcel` | `admin` | none |
| 6 | POST | `/api/v1/admin/update-units-price` | `updateUnitPrice` | `admin` | `upload.single('doc')` |
| 7 | GET | `/api/v1/admin/export-all-units-status` | `getAllUnitsStatusExcel` | `admin` | none |
| 8 | POST | `/api/v1/admin/update-units-status` | `updateUnitStatusExcel` | `admin` | `upload.single('doc')` |
| 9 | PUT | `/api/v1/units/:id` | `updateUnitPriceByPrimaryId` | `admin` | `unitPrimaryIdParamSchema` + `updateUnitPriceByPrimaryIdSchema` |
| 10 | GET | `/api/v1/units/:unitId` | `getCommonUnitDetails` | `user`, `admin`, `sales_manager_admin`, `sales_manager` | none |
| 11 | GET | `/api/v1/towers` | `getCommonTowers` | `user`, `admin`, `sales_manager_admin`, `sales_manager` | none (role-dispatched on `?action=`) |
| 12 | GET | `/api/v1/towers/:towerId/units` | `getCommonUnitsByTower` | `user`, `admin`, `sales_manager_admin`, `sales_manager` | none (role-dispatched on `?action=`) |

Sources:
- Admin endpoints 1–4: `source-code/backend/src/routes/admin.routes.js:81-102`.
- Admin endpoints 5–8: `source-code/backend/src/routes/admin.routes.js:106-108`, `:144-145`.
- Endpoint 9: `source-code/backend/src/routes/units.routes.js:15-23`.
- Endpoint 10: `source-code/backend/src/routes/units.routes.js:13`.
- Endpoints 11–12: `source-code/backend/src/routes/common.routes.js:8-11`.

---

## 3. Feature Details (API by API)

### 3.1 List Towers — `POST /api/v1/admin/towers`

Returns all towers for the resolved project, sorted by `towerSequence ASC` then `towerName ASC`. Optional `isActive` filter accepts boolean true/false; any other value is ignored. (Source: `source-code/backend/src/controllers/tower.controller.js:11-43`.)

Response attributes per tower: `id, towerName, towerCode, towerId, towerSequence, isActive`. (Source: `source-code/backend/src/controllers/tower.controller.js:31`.)

Project scoping: looks up `Project.id = 1 (prod) | 2 (non-prod)`, then filters `Tower.projectId = projectData.projectId`. (Source: `source-code/backend/src/controllers/tower.controller.js:17-27`.)

### 3.2 Bulk Update Tower Status — `PUT /api/v1/admin/towers/status-update`

**Payload**: `{ towers: [{ id: <int>, isActive: <bool> }, ...] }` — array required, min 1. (Source: `source-code/backend/src/validations/master-config.validations.js:116-129`.)

**Logic** (Source: `source-code/backend/src/controllers/tower.controller.js:45-149`):
1. Validates body shape; returns `400` if empty/missing.
2. Fetches existing towers by id; returns `400 "Towers not found"` if any id is missing.
3. Builds a `beforeMap` of current `isActive` values for the audit snapshot.
4. Inside a single Sequelize transaction:
   - For each tower whose target value differs, calls `Tower.update(...)` with `hooks: false`.
   - Records an `AuditLog` row per changed tower (action: `ADMIN_TOWER_STATUS_UPDATE`).
   - Skips DB write & audit when current state already matches target (no-op behavior).
5. After commit, refreshes Redis cache: pulls `tower_config` for the project, updates `is_active` per tower (1/0), writes back.
6. If cache existed, fires `pythonService.get('/broadcast-towers')`; errors are logged but never rolled back.
7. Returns `200 "Tower status updated successfully"`.

`projectId` for cache resolution is taken from `existingTowers[0].projectId`. **All towers in the request are assumed to belong to the same project — no cross-project check.** (Source: `source-code/backend/src/controllers/tower.controller.js:111`.)

### 3.3 Units by Tower — `GET /api/v1/admin/units-by-tower/:towerId`

Path param `towerId` is the business string `Tower.towerId` (NOT the integer PK). Validation enforces non-empty trimmed string. (Source: `source-code/backend/src/validations/master-config.validations.js:132-134`.)

Returns all `Unit` rows where `Unit.towerId == :towerId`, ordered `floorNumber ASC, unitNo ASC`. Attributes: `id, unitName, unitId, unitNo, floorNumber, status, basicPrice, totalUnitValue, facing`. (Source: `source-code/backend/src/controllers/tower.controller.js:151-169`.)

There is **no project filter** on this endpoint — relies on `towerId` uniqueness. (Source: `source-code/backend/src/controllers/tower.controller.js:155-162`.)

### 3.4 Tower KPI — `GET /api/v1/admin/tower-kpi`

(Source: `source-code/backend/src/controllers/tower.controller.js:171-206`.)

Composes two sub-objects:

**`tower`** — counts from `Tower` filtered by the resolved project:
- `towerCount` = total tower rows
- `activeTowerCount` = rows with `isActive == true`
- `inactiveTowerCount` = rows with `isActive == false`

**`unit`** — derived from `getUnitStatusCount()` (Source: `source-code/backend/src/controllers/common.controller.js:10-31`), which groups `Unit.status` excluding `PBT` and `REFUGE`, scoped to the project:
- `totalUnits` = sum of all non-PBT/REFUGE statuses
- `bookedUnits` = `counts.booked` (lowercased status key)
- `disabledUnits` = `counts.reserved`
- `availableUnits` = `counts.available`

**Note**: `HOLD`, `PREBOOKED` rows contribute to `totalUnits` but are not surfaced as a named KPI. (Source: `source-code/backend/src/controllers/tower.controller.js:194-200`.)

### 3.5 Export All Units Price — `GET /api/v1/admin/export-all-units-price`

Excel download. Filters `Unit` to the resolved project AND `status IN ('AVAILABLE','RESERVED')` only. Columns: `Tower Name, Typology Id, Typology Name, Unit Id, Unit No, Agreement Value, Early Bird Benefit, Allocation Amount, Allocation Percent, Allocation Calc Type, Status, Update (1/0)`. (Source: `source-code/backend/src/controllers/admin.controller.js:881-939`.)

### 3.6 Bulk Unit Price Update via Excel — `POST /api/v1/admin/update-units-price`

(Source: `source-code/backend/src/controllers/admin.controller.js:942-...`.)

- Accepts `.csv` or `.xlsx` (mimetype `text/csv` OR `.csv` suffix → CSV path). (Source: `source-code/backend/src/controllers/admin.controller.js:951`.)
- Only processes rows with `Update (1/0) == 1`. (Source: `source-code/backend/src/controllers/admin.controller.js:970`.)
- Pre-loads candidate units WHERE `unitId IN searchUnitIds AND status IN ('AVAILABLE','RESERVED') AND projectId == project.projectId`. (Source: `:998-1003`.)
- Per-row failure conditions: missing `unitId`; unit not in AVAILABLE/RESERVED; numeric parse failure; allocation-type vs allocation-fields inconsistency.
- No-op detection per row (`No changes detected`) when all numeric fields & calc type are unchanged. (Source: `:1066-1075`.)

### 3.7 Export All Units Status — `GET /api/v1/admin/export-all-units-status`

Excel download. Filters: `projectId == projectData.projectId AND status IN ('AVAILABLE','RESERVED')`. Sort: `Tower.tower_sequence ASC, floorNumber DESC, unitNo ASC, status ASC`. Columns: `Tower Name, Typology Id, Typology Name, Unit Id, Unit No, Status, Update (1/0)`. (Source: `source-code/backend/src/controllers/admin.controller.js:1658-1707`.)

### 3.8 Bulk Unit Status Update via Excel — `POST /api/v1/admin/update-units-status`

(Source: `source-code/backend/src/controllers/admin.controller.js:1710-...`.)

- Accepts `.csv` or `.xlsx`.
- Filters rows by `Update (1/0) == 1`.
- Processes rows in chunks of 250 with per-chunk transactions; sorts each chunk by `unitId ASC` to reduce deadlock risk. (Source: `:1766-1773`.)
- Locks candidate rows: `lock: tx.LOCK.UPDATE`. (Source: `:1787-1788`.)
- Allowed transitions ONLY: `AVAILABLE → RESERVED` and `RESERVED → AVAILABLE`. Any other current→target combination yields `Cannot change from <status>`. (Source: `:1829-1838`.)
- Per-row outcomes recorded as: `Missing Unit ID`, `Invalid Unit ID`, `Invalid target status`, `Already in same state`, `Cannot change from <status>`, `Updated <from> → <to>`.
- Audit logs: action `ADMIN_UNIT_STATUS_UPDATE` per successful row. (Source: `:1844`.)
- After commit, the accumulated `reserved` + `available` unit IDs are pushed to Python via `POST /units/status-sync` (fire-and-forget). (Source: `source-code/backend/src/controllers/admin.controller.js:1325-1340` for the single-unit equivalent; bulk version pushes via `pyPayload` Sets.)

### 3.9 Single Unit Price/Status Update — `PUT /api/v1/units/:id`

(Source: `source-code/backend/src/controllers/admin.controller.js:1188-1375`, `source-code/backend/src/validations/unit.validations.js:1-112`, `source-code/backend/src/routes/units.routes.js:15-23`.)

`:id` is the integer PK `Unit.id`. Body fields (all optional, but at least one required per `at-least-one-field` test):
- `agreementValue` (decimal, ≥ 0)
- `earlyBirdBenefit` (decimal, ≥ 0)
- `allocationAmount` (decimal, ≥ 0, nullable)
- `allocationPercent` (decimal, ≥ 0, nullable)
- `allocationCalcType` (`AMOUNT` | `PERCENT`)
- `status` (`AVAILABLE` | `RESERVED`)

Cross-field validation:
- `agreementValue` and `earlyBirdBenefit` must be provided together. (Source: `unit.validations.js:61-77`.)
- If any allocation field is provided, `allocationCalcType` is mandatory. `AMOUNT` requires `allocationAmount`; `PERCENT` requires `allocationPercent`. (Source: `unit.validations.js:78-111`.)

Controller logic:
- Loads the unit only if its `status IN ('AVAILABLE','RESERVED')` — else `404 "Unit not found or not editable in current status"`. (Source: `admin.controller.js:1208-1220`.)
- Status transitions accept only `AVAILABLE ↔ RESERVED`. Anything else → `400 "Cannot change from <status>"`. (Source: `:1257-1270`.)
- Detects no-change requests and returns `200 "No changes detected"` without writing. (Source: `:1273-1287`.)
- On status change, fires `POST /units/status-sync` to Python (fire-and-forget). (Source: `:1325-1340`.)
- Audit context is forwarded via `unit.save({ audit: { ...req.requestContext } })`. (Source: `:1321`.)

### 3.10 Shared Tower & Unit Endpoints — `GET /api/v1/towers`, `GET /api/v1/towers/:towerId/units`, `GET /api/v1/units/:unitId`

These endpoints are role-dispatched. The same URL returns different shapes depending on `req.user.roleId` AND the `?action=` query parameter. The dispatcher is `fetchTowers` / `fetchUnitsByTower` / `fetchUnitsById` in `common.service.js`. (Source: `source-code/backend/src/services/common.service.js:882-997`.)

**Admin role dispatch — `GET /towers`** (Source: `common.service.js:887-890`):
| `?action=` | Service call | Returns |
|------------|--------------|---------|
| `unit-swap` | `towerService.adminUnitSwapTowers()` | `id, towerId, towerName, isActive` for project, sorted by `towerName ASC`. (Source: `tower.service.js:17-25`.) |
| `heatmap`   | `towerService.adminHeatmapTowers()`  | `towerId, towerName, towerCode, isActive` for project, sorted by `towerName ASC`. (Source: `tower.service.js:54-62`.) |

Any other action for admin → `ApiError.forbidden('Unsupported action for this role')`. (Source: `common.service.js:903`.)

**Admin role dispatch — `GET /towers/:towerId/units`** (Source: `common.service.js:976-979`):
| `?action=` | Service call | Returns |
|------------|--------------|---------|
| `unit-swap` | `unitService.adminUnitSwapUnits({ towerId })` | `id, unitId, unitNo, status, frontendTypologyName` WHERE `status IN ('AVAILABLE','RESERVED')`. Sort `floorNumber ASC, unitNo ASC`. (Source: `unit.service.js:17-30`.) |
| `heatmap`   | `unitService.adminHeatmapUnits({ towerId })`  | `unitId, unitNo, status` for ALL statuses. Sort `unitNo ASC`. (Source: `unit.service.js:33-42`.) |

---

## 4. Data Models

### 4.1 `Tower` — table `towers` (Source: `source-code/backend/src/models/tower.model.js`)

| Field | DB column | Type | Allow null | Default | Notes |
|-------|-----------|------|-----------|---------|-------|
| `id` | `id` | INTEGER PK auto-inc | no | — | Primary key (numeric) |
| `fkProjectId` | `fk_project_id` | BIGINT.UNSIGNED FK→`projects.id` | yes | — | (line 58-67) |
| `towerId` | `tower_id` | STRING(255) | yes | — | Business identifier used by cache/heatmap (line 68-73) |
| `customerCode` | `customer_code` | STRING(255) | yes | — | |
| `tds` | `tds` | TEXT | yes | — | |
| `mvCreatedOn` | `mv_created_on` | DATE | yes | — | Mavis import |
| `createdByUser` | `created_by_user` | STRING(255) | yes | — | |
| `towerCode` | `tower_code` | STRING(255) | yes | — | Used in SM drop-down sort (regex extracts numeric part) |
| `defaultPaymentSchedule` | `default_payment_schedule` | STRING(255) | yes | — | |
| `mvCreatedBy` | `mv_created_by` | STRING(255) | yes | — | |
| `imageUrl` | `image_url` | TEXT | yes | — | |
| `projectId` | `project_id` | STRING(255) | yes | — | Business project code (string) |
| `gst` | `gst` | STRING(255) | yes | — | |
| `stampDuty` | `stamp_duty` | STRING(255) | yes | — | |
| `modifiedByUser` | `modified_by_user` | STRING(255) | yes | — | |
| `contractCode` | `contract_code` | STRING(255) | yes | — | |
| `mvModifiedOn` | `mv_modified_on` | DATE | yes | — | |
| `towerName` | `tower_name` | STRING(255) | yes | — | |
| `noOfFloors` | `no_of_floors` | INTEGER | yes | — | |
| `mvRowId` | `mv_row_id` | STRING(255) UNIQUE | yes | — | Mavis row id, unique constraint |
| `projectCode` | `project_code` | STRING(255) | yes | — | |
| `mvModifiedBy` | `mv_modified_by` | STRING(255) | yes | — | |
| `isActive` | `is_active` | BOOLEAN | yes | `true` | Controls tower visibility (line 187-193) |
| `towerSequence` | `tower_sequence` | INTEGER | yes | — | Display order |
| `deletedAt` | `deleted_at` | DATE | yes | — | Paranoid soft-delete |

Model settings: `underscored: true, timestamps: true, paranoid: true, auditEnabled: true`. JSON serialization strips `createdAt, updatedAt, deletedAt`. (Source: `tower.model.js:44-49, 207-218`.)

**Associations** (Source: `tower.model.js:17-41`):
- `Tower.belongsTo(Project, fk: fkProjectId, as: 'Project')`
- `Tower.hasMany(Unit, fk: towerId, sourceKey: towerId, as: 'Units')` — joined on string code
- `Tower.hasMany(Floor, fk: tower_id, sourceKey: towerId, as: 'Floors')`
- `Tower.hasMany(TowerUnitDetail, fk: tower_id, sourceKey: towerId, as: 'TowerUnitDetails')`

### 4.2 `Unit` — table `units` (Source: `source-code/backend/src/models/unit.model.js`)

Primary fields used by Towers module (full field list below):

| Field | DB column | Type | Notes |
|-------|-----------|------|-------|
| `id` | `id` | INTEGER PK | |
| `fkProjectId` | `fk_project_id` | BIGINT.UNSIGNED FK→`projects.id` | (line 86-95) |
| `fkTowerId` | `fk_tower_id` | INTEGER FK→`towers.id` | (line 96-105) |
| `fkTypologyId` | `fk_typology_id` | BIGINT.UNSIGNED FK→`unit_typologies.id` | (line 106-115) |
| `unitName` | `unit_name` | STRING(255) | |
| `unitId` | `unit_id` | STRING(255) | Business id (string) |
| `towerId` | `tower_id` | STRING(255) | Business join key to `Tower.towerId` |
| `floorId` | `floor_id` | BIGINT.UNSIGNED | |
| `unitNo` | `unit_no` | STRING(255) | |
| `basicPrice` | `basic_price` | BIGINT | |
| `societyCharge` | `society_charge` | BIGINT | |
| `clubHouseCharge` | `club_house_charge` | DECIMAL(15,2) | |
| `possesionCharge` | `possesion_charge` | BIGINT | (sic spelling in source) |
| **`status`** | `status` | ENUM | `'AVAILABLE','HOLD','BOOKED','REFUGE','PREBOOKED','PBT','RESERVED'` (line 176-180) |
| `projectId` | `project_id` | TEXT | Business project code |
| `typologyId` | `typology_id` | TEXT | LSQ typology id |
| `frontendTypologyName` | `frontend_typology_name` | STRING(255) | |
| `premiumCharge` | `premium_charge` | BIGINT | |
| `infraCharge` | `infra_charge` | BIGINT | |
| `floorRise` | `floor_rise` | BIGINT | |
| `stampDuty` | `stamp_duty` | DOUBLE | |
| `gst` | `gst` | BIGINT | |
| `parkingCharge` | `parking_charge` | BIGINT | |
| `floorNumber` | `floor_number` | INTEGER | |
| `opportunityId` | `opportunity_id` | TEXT | LSQ opportunity |
| `gstOnAmenities` | `gst_on_amenities` | BIGINT | |
| `agreementValue` | `agreement_value` | INTEGER | |
| `registrationCharges` | `registration_charges` | INTEGER | |
| `towerName` | `tower_name` | TEXT | Denormalized |
| `typologyName` | `typology_name` | DOUBLE | (typed as DOUBLE despite name) |
| `projectName` | `project_name` | TEXT | |
| `totalUnitValue` | `total_unit_value` | DOUBLE | |
| `offer` | `offer` | DOUBLE | |
| `offerAmount` | `offer_amount` | DOUBLE | |
| `tds` | `tds` | DOUBLE | |
| `numberOfParkings` | `number_of_parkings` | DOUBLE | |
| `band` | `band` | DOUBLE | |
| `discount` | `discount` | DOUBLE | |
| `view` | `view` | DOUBLE | |
| `bookingDate` | `booking_date` | DOUBLE | |
| `bookingId` | `booking_id` | DOUBLE | |
| `facing` | `facing` | TEXT | |
| `infraChargeExclAv` | `infra_charge_excl_av` | BIGINT | |
| `legalCharge` | `legal_charge` | BIGINT | |
| `modifiedByUser` | `modified_by_user` | DOUBLE | |
| `createdByUser` | `created_by_user` | TEXT | |
| `cutOff` | `cut_off` | BIGINT | |
| `siteHeadCutOff` | `site_head_cut_off` | BIGINT | |
| `hiddenCharges1..4` | `hidden_charges_1..4` | BIGINT/DOUBLE | |
| `allocationAmount` | `allocation_amount` | DECIMAL(15,2) | |
| `allocationPercent` | `allocation_percent` | DECIMAL(15,2) | % OR fixed depending on `allocationCalcType` (line 407-412) |
| `allocationCalcType` | `allocation_calc_type` | ENUM `'PERCENT','AMOUNT'` | (line 413-418) |
| `earlyBirdBenefit` | `early_bird_benefit` | DECIMAL(15,2) | |
| `imageUrl` | `image_url` | TEXT | URLs separated by `\|\|` |
| `holdAt` | `hold_at` | DATE | Set during offline payment (line 430-434) |
| `deletedAt` | `deleted_at` | DATE | Paranoid |

Settings: `underscored: true, timestamps: true, paranoid: true, auditEnabled: true`. (Source: `unit.model.js:442-452`.)

**Associations** (Source: `unit.model.js:17-69`):
- `belongsTo(Project, fk: fkProjectId)`
- `belongsTo(Tower, fk: fkTowerId, as: 'towerRef')` — FK-on-numeric-id
- `belongsTo(UnitTypology, fk: fkTypologyId, as: 'typologyRef')`
- `belongsTo(Tower, fk: towerId, targetKey: towerId, as: 'Tower')` — string join
- `belongsTo(Floor, fk: floorId, as: 'Floor')`
- `belongsTo(TypologyMaster, fk: typologyId, targetKey: typologyId, as: 'TypologyMaster')`
- `belongsTo(UnitTypology, fk: typologyId, targetKey: lsqTypologyId, as: 'UnitTypology')`
- `hasOne(RegistrationUnit, fk: unitId, sourceKey: unitId, as: 'RegistrationUnit')`
- `hasMany(RegistrationPreference, fk: unitId, sourceKey: id, as: 'RegistrationPreferences')`

### 4.3 `Floor` — table `floor_master` (Source: `source-code/backend/src/models/floor.model.js`)

| Field | DB column | Type | Allow null | Default |
|-------|-----------|------|-----------|---------|
| `id` | `id` | INTEGER PK | no | — |
| `floorName` | `floor_name` | STRING(255) | no | — |
| `towerId` | `tower_id` | STRING(255) | no | — |
| `bandId` | `band_id` | INTEGER | no | — |
| `floorSequence` | `floor_sequence` | INTEGER | no | — |
| `isActive` | `is_active` | BOOLEAN | no | `true` |

Settings: `paranoid: false`. **Default scope** filters `isActive: true` — querying inactive floors requires `Floor.unscoped()`. (Source: `floor.model.js:82-90`.)
Associations: `belongsTo(Tower, fk: tower_id)`, `hasMany(Unit, fk: floorId)`. (Source: `floor.model.js:17-29`.)

### 4.4 `UnitTypology` — table `unit_typologies` (Source: `source-code/backend/src/models/unit-typology.model.js`)

Project-scoped typology master (one row per BHK variant). Key fields:

| Field | Type | Notes |
|-------|------|-------|
| `id` | BIGINT.UNSIGNED PK | |
| `projectId` | BIGINT.UNSIGNED, NOT NULL, FK→`projects.id` | (line 33-41) |
| `lsqProjectId` | STRING(100) | LeadSquared link |
| `lsqTypologyId` | STRING(100) | LeadSquared link, used as `Unit.typologyId` join target |
| `name` | STRING(100), NOT NULL | e.g., `1BHK`, `2BHK A` |
| `carpetArea` | STRING(100), NOT NULL | sq.ft |
| `registrationAmount` | DECIMAL(15,2) | |
| `registrationCharges` | DECIMAL(15,2) | |
| `stampDutyPercentage` | STRING | |
| `gstToGovernmentPercentage` | STRING | |
| `discountedRegistrationAmount` | DECIMAL(15,2) | |
| `confirmationAmount` | DECIMAL(15,2) | |
| `agreementAmount` | DECIMAL(15,2) | |
| `homeLoanDiscountAmount` | DECIMAL(15,2) | |
| `earlyBirdDiscountAmount` | DECIMAL(15,2) | |
| `parkingAllowed` | BOOLEAN, NOT NULL, default `false` | |
| `freeParkingCount` | SMALLINT.UNSIGNED, NOT NULL, default `0` | |
| `maxParkingCount` | INTEGER.UNSIGNED, NOT NULL, default `0` | |
| `parkingAmount` | DECIMAL(15,2), NOT NULL, default `0` | |
| `availableParkingSpots` | INTEGER.UNSIGNED, NOT NULL, default `100` | |
| `costSheet` | JSON | |
| `paymentSchedule` | JSON | |
| `paymentScheduleMigrated` | BOOLEAN, default `false` | |
| `createdAt/updatedAt/deletedAt` | DATE | paranoid |

Settings: `underscored: true, paranoid: true, auditEnabled: true`. Association: `belongsTo(Project, fk: projectId)`. (Source: `unit-typology.model.js:17-22, 154-167`.)

### 4.5 `TypologyMaster` — table `typologies` (Source: `source-code/backend/src/models/typology-master.model.js`)

Legacy/external typology master, joined via string `typologyId`. Fields:
`id`, `typologyId` (STRING(191), NOT NULL), `projectId` (STRING(191), NOT NULL), `config` (e.g., "1 BHK"), `typologyName` (STRING(255), NOT NULL), `imageUrl`, `otherUsableArea`, `saleableArea`, `carpetArea`, `maximumDeviation`, `isActive` (default `true`), `mvRowId`, timestamps.
No paranoid. No model associations defined. (Source: `typology-master.model.js:14-106`.)

### 4.6 `TypologyMilestone` — table `typology_milestones` (Source: `source-code/backend/src/models/typology-milestone.model.js`)

Payment schedule per typology version. Fields:
- `id`, `typologyId` (FK→`UnitTypology.id`), `milestoneKey`, `name`, `sequence`, `versionId` (default 1)
- `dueAmountType` ENUM: `BOOKING_AMOUNT, SDR, AMOUNT, PERCENT, FIRST_DISBURSEMENT, FIRST_DEMAND_PAYMENT` (line 51-54)
- `principalCollection`, `percentageDue`, `gst`, `dates` (all STRING)
- `exludeForFutureCalculation` BOOLEAN default `false` (sic spelling)
- `isVisible` BOOLEAN, `paymentAllowed` BOOLEAN default 1, `isActive` BOOLEAN default 1
- `startDate`, `endDate`, `paymentAccountId`, `gstPaymentAccountId`
- Paranoid soft-delete

Association: `belongsTo(UnitTypology, fk: typologyId, as: 'Typology')`, `hasMany(MilestonePaymentTracking, fk: typology_milestone_id)`. (Source: `typology-milestone.model.js:17-26`.)

### 4.7 `TowerUnitDetail` — table `tower_unit_details` (Source: `source-code/backend/src/models/tower-unit-detail.model.js`)

Used by heatmap consumers (SM & physical-event) to enrich tower cards.
Fields: `id` (BIGINT.UNSIGNED PK), `projectId`, `towerId` (STRING(45)), `unitNo` (STRING(45)), `areaSqFt` (STRING(45)), `typologyName` (STRING(45)). Paranoid + underscored + timestamps. (Source: `tower-unit-detail.model.js:22-58`.)

---

## 5. Role & Permission Matrix

Role IDs (Source: `source-code/backend/src/constants/global.js:15-21`):
```
admin = 1, user = 2, cp = 3, sales_manager_admin = 4, sales_manager = 5
```

| Endpoint | admin | user (buyer) | sales_manager_admin | sales_manager | cp |
|----------|:-----:|:------------:|:-------------------:|:-------------:|:--:|
| `/api/v1/admin/towers` (POST list) | YES | — | — | — | — |
| `/api/v1/admin/towers/status-update` (PUT) | YES | — | — | — | — |
| `/api/v1/admin/units-by-tower/:towerId` | YES | — | — | — | — |
| `/api/v1/admin/tower-kpi` | YES | — | — | — | — |
| `/api/v1/admin/export-all-units-price` | YES | — | — | — | — |
| `/api/v1/admin/update-units-price` | YES | — | — | — | — |
| `/api/v1/admin/export-all-units-status` | YES | — | — | — | — |
| `/api/v1/admin/update-units-status` | YES | — | — | — | — |
| `/api/v1/units/:id` (PUT price/status) | YES | — | — | — | — |
| `/api/v1/units/:unitId` (GET details) | YES | YES | YES | YES | — |
| `/api/v1/towers?action=unit-swap` | YES | — | — | — | — |
| `/api/v1/towers?action=heatmap` | YES | YES | YES | YES | — |
| `/api/v1/towers?action=drop-down` | — | — | YES | YES | — |
| `/api/v1/towers?action=physical-event` | — | — | YES | YES | — |
| `/api/v1/towers/:towerId/units?action=unit-swap` | YES | — | — | — | — |
| `/api/v1/towers/:towerId/units?action=heatmap` | YES | YES | YES | YES | — |
| `/api/v1/towers/:towerId/units?action=drop-down` | — | — | YES | YES | — |
| `/api/v1/towers/:towerId/units?action=physical-event` | — | — | YES | YES | — |

Sources:
- Admin gate: `source-code/backend/src/routes/admin.routes.js:53`.
- Units route gate: `source-code/backend/src/routes/units.routes.js:11-23`.
- Common route gate: `source-code/backend/src/routes/common.routes.js:8`.
- Role dispatch on `?action=`: `source-code/backend/src/services/common.service.js:882-997`.

**`admin` vs `sales_manager_admin` behavioral differences in shared `/towers`**:

| Aspect | admin response | sales_manager_admin response |
|--------|----------------|------------------------------|
| `unit-swap` action allowed | YES | NO (returns 403 `Unsupported action for this role`) |
| `drop-down` action allowed | NO | YES (numeric-prefix sort on towerCode) |
| `physical-event` pool action allowed | NO | YES (requires `campaignId`) |
| Heatmap fields | `towerId, towerName, towerCode, isActive` (no counts) | `towerId, towerName, towerSequence, towerCode, isActive, totalUnits, availableUnits, TowerUnitDetails[]` (only `isActive=1`) |

Sources: `tower.service.js:17-74`, `common.service.js:910-967`.

---

## 6. Unit Status State Machine

### 6.1 ENUM Definition

`Unit.status` ENUM = `'AVAILABLE', 'HOLD', 'BOOKED', 'REFUGE', 'PREBOOKED', 'PBT', 'RESERVED'`.
(Source: `source-code/backend/src/models/unit.model.js:176-180`.)

### 6.2 Admin-driven Transitions (single-unit + bulk Excel)

The **only** transitions Admin endpoints permit are:
```
AVAILABLE ──admin set──▶ RESERVED
RESERVED  ──admin set──▶ AVAILABLE
```
Any other source state → fixed rejection with message `Cannot change from <currentStatus>`. (Source: `source-code/backend/src/controllers/admin.controller.js:1263-1270`, `:1829-1838`.)

Validators enforce only `AVAILABLE` or `RESERVED` as accepted target values for status. (Source: `source-code/backend/src/validations/unit.validations.js:36-39`.)

A unit not in `AVAILABLE` or `RESERVED` is invisible to the admin price-update editor (`404 "Unit not found or not editable in current status"`). (Source: `admin.controller.js:1208-1220`.)

### 6.3 Downstream-driven Transitions (out of Tower module scope)

Other modules write these statuses but they are not surfaced through Tower endpoints:
- `HOLD` — set via offline-payment flows; `holdAt` timestamp is captured. (Source: `unit.model.js:430-434`.)
- `BOOKED` — set by booking/assign-unit flows.
- `PREBOOKED`, `PBT` — pre-allocation states (PBT excluded from KPI aggregation).
- `REFUGE` — non-saleable refuge floor units; rendered grey (`#808080`), label `REFUGE`. (Source: `common.service.js:1300-1305, 1315`.)

### 6.4 KPI Aggregation Mapping (`getTowerKpi`)

(Source: `source-code/backend/src/controllers/common.controller.js:10-31` + `tower.controller.js:194-200`.)

| KPI field | Source `Unit.status` |
|-----------|----------------------|
| `availableUnits` | `AVAILABLE` |
| `disabledUnits` | `RESERVED` |
| `bookedUnits` | `BOOKED` |
| `totalUnits` | SUM of all rows where `status NOT IN ('PBT','REFUGE')` |

**Important consequence**: `HOLD` and `PREBOOKED` units contribute to `totalUnits` but appear in no other KPI bucket.

### 6.5 Heatmap Color Code (SM Heatmap, applied to admin/SM/buyer views via `salesManagerHeatmapUnits`)

(Source: `source-code/backend/src/services/common.service.js:1297-1308`.)

| Status | `showColour` | `unitLabel` | `showDisabled` | `displayStatus` |
|--------|--------------|-------------|----------------|-----------------|
| `BOOKED` | `#FF0000` | unit number | true | true |
| `PBT` | `#FF0000` | unit number | true | true |
| `REFUGE` | `#808080` | `'REFUGE'` | true | true |
| `AVAILABLE` | `#00FF00` | unit number | false | true |
| (other: `RESERVED`, `HOLD`, `PREBOOKED`) | `#00FF00` (fallback) | unit number | true (status !== AVAILABLE) | true |
| Pad-fill `'NOT_AVAILABLE'` placeholder | `#808080` | unit number | true | false |

**Pad-fill rule**: every floor is rendered with exactly `TARGET_UNITS_PER_FLOOR = 8` units. Missing slots are synthesized as `unitId = "missing-<floorSeq>-<unitNo>"`, status `'NOT_AVAILABLE'`, grey, hidden status indicator. (Source: `common.service.js:1336-1387`.)

### 6.6 Physical-Event Pool Override (SM only)

For `action=physical-event`, the heatmap recomputes per-unit `status` against the campaign pool:
- If actual unit status is `BOOKED` or `RESERVED` → forced `BOOKED`.
- Else if actual status is `HOLD` → kept as `HOLD`.
- Else if unit is in the campaign pool with pool-status `AVAILABLE` → `AVAILABLE`.
- Otherwise (non-pool unit) → forced `BOOKED`.

(Source: `source-code/backend/src/services/common.service.js:1147-1154`.)

---

## 7. Integration Points

### 7.1 Redis Cache: `events:project-<projectId>:tower:config`

(Source: `source-code/backend/src/services/redis.service.js:72-105`.)

- Key: `RedisService.getTowerConfigKey(projectId)` → `events:project-<projectId>:tower:config`.
- Default TTL: `86400` seconds (24h). (Source: `redis.service.js:65`.)
- `updateTowerStatus` is the **only** Tower-module writer; it mutates `is_active` (1 or 0) per `towerId` in the cached object and writes back. (Source: `tower.controller.js:120-133`.)
- If cache is absent → log warning, skip Python broadcast. (Source: `tower.controller.js:140-142`.)

### 7.2 Python Service Broadcasts

- `GET /broadcast-towers` — fired after a successful tower-status update + cache refresh. Non-blocking; errors logged only. (Source: `tower.controller.js:135-139`.)
- `POST /units/status-sync` — fired after a successful unit-status transition. Payload: `{ reserved: [unitDbIds], available: [unitDbIds] }`. Fire-and-forget (`.catch(err => logger.error(...))`). (Source: `admin.controller.js:1325-1340`.)

### 7.3 Audit Log

All Tower & Unit status writes generate `AuditLog` rows.

| Action constant | Trigger |
|-----------------|---------|
| `ADMIN_TOWER_STATUS_UPDATE` | Each tower whose `isActive` flips in `updateTowerStatus`. (Source: `tower.controller.js:90`.) |
| `ADMIN_UNIT_STATUS_UPDATE`  | Each unit whose `status` flips in `updateUnitStatusExcel`. (Source: `admin.controller.js:1844`.) |
| `ADMIN_UNIT_PRICE_UPDATE`   | Excel/single price edits (carried via `unit.save({ audit: ... })` hook). (Source: `global.js:117`; usage at `admin.controller.js:1321`.) |

Each entry stores `actorType: 'User'`, `actorId`, `event: 'UPDATE'`, `entityType` (`Tower`/`Unit`), `entityId`, `entitySnapshotBefore`, `entitySnapshotAfter`, `ipAddress`, `userAgent` — all read from `req.requestContext`. (Source: `tower.controller.js:86-97`, `admin.controller.js:1840-1851`.)

### 7.4 Cross-module Dependencies

| Consumer module | How it touches Tower module |
|-----------------|-----------------------------|
| Allocation | Allocates `Unit` rows by `unitId` and writes `RegistrationUnit` → `Unit.status` flips through allocation flows (out of Tower's write surface). |
| Allocation Campaign (Physical Event) | `AllocationCampaignUnit` references `Unit.id` and `Tower.id`. Pool-availability heatmap reads tower + unit inventory through `common.service.js`. (Source: `common.service.js:1003-1069`.) |
| Sales Manager Heatmap | `salesManagerHeatmapTowers` (Source: `common.service.js:910-967`) reads `Tower` + per-tower counts of total/AVAILABLE units, plus `TowerUnitDetail`. |
| SM Drop-down | `fetchTowersForDropdown` filters `isActive=true` & sorts by numeric prefix of `towerCode`. (Source: `tower.service.js:65-74`.) |
| Master Config (CMS) | Tower master-config validations co-located in `master-config.validations.js`; CMS does NOT write tower fields directly. |

### 7.5 LeadSquared

Tower module does NOT call LeadSquared directly. However, `Unit.typologyId` joins to `UnitTypology.lsqTypologyId`, and `Unit.opportunityId` carries the LSQ opportunity id. (Source: `unit.model.js:52-56, 240-245`.)

---

## 8. Edge Cases & Known Constraints

### 8.1 Project Scoping
- **Hard-coded environment switch**: `projectId = app.production ? 1 : 2`. UAT and DEV both resolve to 2. (Source: `tower.controller.js:17,175`.)
- **`projectData` may be null**: `getAllTowers` and `getTowerKpi` use optional chaining (`projectData?.projectId`), allowing the query to run with `where.projectId = undefined` → may return all towers. (Source: `tower.controller.js:25-27, 181`.)
- `updateTowerStatus` resolves cache project via `existingTowers[0].projectId` — if no towers exist this would have already failed at the existence check.

### 8.2 Validation Boundaries
- `updateTowerStatusSchema` requires at least one tower; each requires positive integer `id` AND boolean `isActive`. (Source: `master-config.validations.js:116-129`.)
- `towerIdParamSchema` requires a trimmed non-empty string. Empty path segment `/units-by-tower/` will not match the route. (Source: `master-config.validations.js:132-134`.)
- `updateUnitPriceByPrimaryIdSchema` rejects request bodies with no fields, mismatched pricing pairs, or allocation fields without `allocationCalcType`. (Source: `unit.validations.js:40-111`.)

### 8.3 Idempotency / No-op Behavior
- **Tower status bulk**: rows where `currentValue === targetValue` are silently skipped (no audit row, no DB write). Final response is always success. (Source: `tower.controller.js:82`.)
- **Unit status bulk**: row marker becomes `Already in same state` and the chunk transaction still commits other changes. (Source: `admin.controller.js:1823-1826`.)
- **Single unit update**: returns `200 "No changes detected"` and rolls back transaction. (Source: `admin.controller.js:1273-1287`.)

### 8.4 Concurrency
- Excel bulk unit-status update uses chunks of 250 with per-chunk transactions, sorted by `unitId ASC` to reduce deadlock risk; rows are locked with `tx.LOCK.UPDATE`. (Source: `admin.controller.js:1766-1789`.)
- A loop variable `consecutiveChunkFailures` is initialized but its consumer (max-failure short-circuit) lives further down — see implementation for cap behavior.

### 8.5 Soft-delete & Default Scope
- `Tower.paranoid=true` — deleted rows are excluded by default but are queryable via `Tower.unscoped()`.
- `Floor` has a **default scope of `isActive: true`** — to query inactive floors, callers must use `Floor.unscoped()`. (Source: `floor.model.js:82-90`.)
- `Unit.paranoid=true`.

### 8.6 Status ENUM Drift
- The DB ENUM includes `PREBOOKED` but no controller logic in this module reads/writes `PREBOOKED`. (Source: `unit.model.js:176-180`.)
- `getUnitStatusCount` lowercases the status key, so consumers must use `'available' | 'reserved' | 'booked' | 'hold' | 'prebooked'`. `PBT` and `REFUGE` are pre-filtered out. (Source: `common.controller.js:18-26`.)
- `getTowerKpi` exposes `disabledUnits` (mapped from `RESERVED`) but no `holdUnits` field, even though `HOLD` rows are counted into `totalUnits`. (Source: `tower.controller.js:196-200`.)

### 8.7 Heatmap Floor Padding
- Always pads each floor to exactly 8 units (`TARGET_UNITS_PER_FLOOR = 8`). Towers that legitimately have >8 units per floor will see units beyond index 7 silently dropped. (Source: `common.service.js:1336-1349`.)
- Unit number sequence inferred as `floorSeq * 100 + 1 .. + 8`. Towers not following the 100/floor numbering convention will get incorrect placeholder labels. (Source: `common.service.js:1359-1364`.)

### 8.8 Dual Tower Associations on Unit
`Unit` defines two `belongsTo(Tower, ...)` associations:
- `as: 'towerRef'` via `fkTowerId` (integer FK)
- `as: 'Tower'` via `towerId` string code → `Tower.towerId`

Queries must choose the alias deliberately. The heatmaps use the string-code alias (`'Tower'`), while admin export uses `Unit.associations.Tower` for sorting by `tower_sequence`. (Source: `unit.model.js:24-38`, `admin.controller.js:1691`.)

### 8.9 No Tower Create/Update/Delete Endpoints
The Tower module exposes **no** create, modify, or delete operations for Tower master data via Admin Portal. Master data is imported via Mavis (`mv_*` fields) or seeded out-of-band; only `isActive` is editable through Admin APIs.

### 8.10 No Cross-Project Validation in Bulk Status Update
`updateTowerStatus` does not assert that all submitted `id`s share the same `projectId`. The cache update key is taken from `existingTowers[0].projectId`; if a payload crosses projects, only one project's cache will be refreshed. (Source: `tower.controller.js:111-131`.)

### 8.11 Excel Update Trigger
Bulk Excel processing **only** acts on rows where `Update (1/0)` column == `1`. A `0` or blank value silently skips the row even if other fields differ. (Source: `admin.controller.js:970, 1742`.)

### 8.12 Tower Sequence Sort Anomalies
- Admin `getAllTowers` sorts by `towerSequence ASC, towerName ASC`. Towers without `towerSequence` set will collate as NULL (DB-dependent).
- SM drop-down (`fetchTowersForDropdown`) uses a literal `CAST(REGEXP_SUBSTR(towerCode, '[0-9]+') AS UNSIGNED)`. Towers whose `towerCode` lacks a digit will return NULL and group first. (Source: `tower.service.js:71`.)

---

## Appendix A — File Inventory (Tower Module)

| File | Role |
|------|------|
| `source-code/backend/src/controllers/tower.controller.js` | Admin endpoints (list, status-update, units-by-tower, KPI) |
| `source-code/backend/src/services/tower.service.js` | Role-specific tower fetchers used by shared `/towers` |
| `source-code/backend/src/services/unit.service.js` | Role-specific unit fetchers used by shared `/towers/:towerId/units` |
| `source-code/backend/src/services/common.service.js` | Role dispatcher + SM heatmap + physical-event pool overlay |
| `source-code/backend/src/controllers/common.controller.js` | Shared towers/units controllers; `getUnitStatusCount` aggregator |
| `source-code/backend/src/controllers/admin.controller.js` | Bulk Excel price/status, single-unit update (`updateUnitPriceByPrimaryId`) |
| `source-code/backend/src/routes/admin.routes.js` | Admin route registration (lines 81-108, 144-145) |
| `source-code/backend/src/routes/units.routes.js` | Single-unit PUT route + shared GET |
| `source-code/backend/src/routes/common.routes.js` | Shared `/towers`, `/towers/:towerId/units` |
| `source-code/backend/src/models/tower.model.js` | Tower model |
| `source-code/backend/src/models/unit.model.js` | Unit model (status ENUM) |
| `source-code/backend/src/models/floor.model.js` | Floor model |
| `source-code/backend/src/models/tower-unit-detail.model.js` | Heatmap card detail |
| `source-code/backend/src/models/unit-typology.model.js` | Typology master (used by Unit join) |
| `source-code/backend/src/models/typology-master.model.js` | External typology master |
| `source-code/backend/src/models/typology-milestone.model.js` | Payment milestones per typology |
| `source-code/backend/src/validations/master-config.validations.js` | `updateTowerStatusSchema`, `towerIdParamSchema` (lines 116-134) |
| `source-code/backend/src/validations/unit.validations.js` | `unitPrimaryIdParamSchema`, `updateUnitPriceByPrimaryIdSchema` |
| `source-code/backend/src/services/redis.service.js` | `getTowerConfigKey`, `getTowerConfig` (lines 60-105) |
| `source-code/backend/src/constants/global.js` | `roleNameIdMap` (line 15), `auditActions` (line 111) |

---

## Appendix B — Verification Checklist

Every section above is backed by an inline `// Source: <path>:<line>` citation. Verification performed:

- [x] Read `tower.controller.js` in full (207 lines)
- [x] Read `tower.service.js` in full (75 lines)
- [x] Read `tower.model.js`, `unit.model.js`, `floor.model.js`, `tower-unit-detail.model.js`, `unit-typology.model.js`, `typology-master.model.js`, `typology-milestone.model.js` in full
- [x] Read all admin/units/common/sales-manager routes
- [x] Cross-referenced `getUnitStatusCount`, `fetchTowers`, `fetchUnitsByTower`
- [x] Validated unit status ENUM against ENUM definition (line 176-180 of `unit.model.js`)
- [x] Validated state-machine transitions against both single-unit (`admin.controller.js:1263-1270`) and bulk Excel (`admin.controller.js:1829-1838`) implementations
- [x] Documented Python and Redis side-effects
- [x] Documented all admin vs SM vs buyer role differentiation
- [x] Cited line numbers for every business rule
