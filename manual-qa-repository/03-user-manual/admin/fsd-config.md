# Feature Specification Document — Admin Portal: Config / CMS (Master Configuration)

> Source-code-verified FSD. Every claim cites `// Source: path/to/file.js:line`. No BRD/FRD used.
> Generated: 2026-05-22.

---

## 1. Module Overview

The Config / CMS module is a generic, typed **key–value Master Configuration store** (table `master_configs`) that drives runtime behaviour of the XR Portal back-end. It is **not** a CMS for rich content; it is a centrally-managed flag/parameter registry consumed by multiple downstream modules — allocation, registration, parking, buyer add-unit eligibility, Sales-Manager PII masking, and customer-action toggles.

- Model: `MasterConfig` — typed value columns (`valueText`, `valueNumber`, `valueBoolean`, `valueJson`, `valueDatetime`) selected per-row by the `dataType` enum. // Source: source-code/backend/src/models/master-config.model.js:14-90
- Table: `master_configs` — soft-deleted (`paranoid: true`), audit-enabled (`MasterConfig.auditEnabled = true`). // Source: source-code/backend/src/models/master-config.model.js:88, 92
- Project scoping: every config row is scoped by `projectId`. The active project is resolved at request time from the global `app.production` flag: production → `projectId = 1`, non-production → `projectId = 2`. There is **no user-supplied projectId** in the controller — `req.body.projectId` is explicitly ignored. // Source: source-code/backend/src/controllers/master-config.controller.js:19, 70, 126
- Surface: 3 HTTP endpoints (1 admin-write, 1 admin-read, 1 authenticated-read).
- Owner of writes: Admin only (role `admin`). // Source: source-code/backend/src/routes/admin.routes.js:53

---

## 2. API Reference Table

| # | Method | URL | Controller | Auth | Role | Validation Schema |
|---|--------|-----|-----------|------|------|------------------|
| 1 | POST | `/api/v1/admin/master-config/store` | `storeMasterConfigs` | `protect` + `restrictTo('admin')` | admin only | `storeMasterConfigSchema` |
| 2 | GET  | `/api/v1/admin/master-config`       | `getAllMasterConfigs` | `protect` + `restrictTo('admin')` | admin only | — (query params parsed in controller) |
| 3 | POST | `/api/v1/master-config/fetch`       | `retrieveMasterConfigs` | `protect` | any authenticated user | `retrieveMasterConfigSchema` |

Sources:
- Route 1: // Source: source-code/backend/src/routes/admin.routes.js:67
- Route 2: // Source: source-code/backend/src/routes/admin.routes.js:79
- Route 3: // Source: source-code/backend/src/routes/index.js:84
- Admin guard applied to all `/admin/*` routes: // Source: source-code/backend/src/routes/admin.routes.js:53
- `protect` middleware definition: // Source: source-code/backend/src/middleware/auth.middleware.js:23
- `restrictTo` middleware definition: // Source: source-code/backend/src/middleware/auth.middleware.js:102-106

Adjacent endpoints (read/write specific master-config keys via dedicated endpoints, also covered in this FSD):

| # | Method | URL | Controller | Role | Backing Master-Config Keys |
|---|--------|-----|-----------|------|---------------------------|
| 4 | GET  | `/api/v1/admin/customer-actions`  | `AdminController.getCustomerActions`    | admin | `allow_additional_reg_unit`, `additional_reg_units_details` |
| 5 | POST | `/api/v1/admin/customer-actions`  | `AdminController.updateCustomerActions` | admin | `allow_additional_reg_unit`, `additional_reg_units_details` |

Sources:
- Route 4 & 5: // Source: source-code/backend/src/routes/admin.routes.js:136-137
- Controller `getCustomerActions`: // Source: source-code/backend/src/controllers/admin.controller.js:1557
- Controller `updateCustomerActions`: // Source: source-code/backend/src/controllers/admin.controller.js:1579

---

## 3. Feature Details (Per Endpoint)

### 3.1 POST `/api/v1/admin/master-config/store` — Bulk upsert configs

**Request body**:
```json
{ "configs": [ { "key": "string", "name": "string?", "dataType": "string?", "value": <any>, "description": "string?" }, ... ] }
```

**Behaviour**:
1. Reads `configs` from body; **discards** `projectId` from body and sets `projectId = app.production ? 1 : 2`. // Source: source-code/backend/src/controllers/master-config.controller.js:17-19
2. Validates `configs` is a non-empty array. // Source: source-code/backend/src/controllers/master-config.controller.js:22-24
3. For each entry: `key` and `value` are required; `dataType`, if supplied, must be one of `['string','number','boolean','json','date','datetime','array','object']`. // Source: source-code/backend/src/controllers/master-config.controller.js:27-43
4. Delegates to service `storeConfigs(configs, projectId)`. // Source: source-code/backend/src/controllers/master-config.controller.js:45

**Service `storeConfigs` rules**:
- Iterates the array; for each config: looks up existing row by `(key, projectId)`. // Source: source-code/backend/src/services/master-config.service.js:156
- **`dataType` resolution order**: explicit `dataType` from request → existing row's `dataType` → inferred from `value` via `inferDataType`. // Source: source-code/backend/src/services/master-config.service.js:159
- `inferDataType` infers `date`/`datetime` for ISO-like strings matching `/^\d{4}-\d{2}-\d{2}/`, otherwise typeof-based mapping. // Source: source-code/backend/src/services/master-config.service.js:64-94
- Value is routed to the **type-matching column** via `prepareValueColumns`; **all other value columns are explicitly set to null** for that row. // Source: source-code/backend/src/services/master-config.service.js:28-62
- Update path: `existing.update(configData, { transaction })`. // Source: source-code/backend/src/services/master-config.service.js:187
- Insert path: `MasterConfig.create(configData, { transaction })`. // Source: source-code/backend/src/services/master-config.service.js:189
- The previously-active cascade trigger for allocation watched keys (`allocation_type`, `allocation_round_time`, `allocations_per_unit`, `dynamic_allocation_start_time`) is **commented out** in the current source and does NOT execute. // Source: source-code/backend/src/services/master-config.service.js:142-148, 179-184, 195-231

**Validation schema (Yup, more permissive than controller checks)**:
- `configs`: required array, min 1. // Source: source-code/backend/src/validations/master-config.validations.js:92-93
- Per entry: `key` required, ≤191 chars, trimmed. `name` optional, ≤255 chars. `description` optional. `dataType` optional but if present must be in the valid set. `value` is nullable but a `value-type-validation` test rejects values that don't match `dataType`; if `dataType` is omitted, any value is valid (will be inferred). // Source: source-code/backend/src/validations/master-config.validations.js:42-89
- Top-level `projectId` is accepted but ignored by the controller. // Source: source-code/backend/src/validations/master-config.validations.js:95

**Responses**:
- 200 `success`: `"Master configurations stored successfully"`. // Source: source-code/backend/src/controllers/master-config.controller.js:47
- 400: missing/empty `configs`, missing key/value at index, invalid `dataType` at index.
- 500: `"Failed to store master configurations. Please try again."` — full error logged with `userId`, `requestBody`. // Source: source-code/backend/src/controllers/master-config.controller.js:49-58

---

### 3.2 GET `/api/v1/admin/master-config` — Paginated/searchable list

**Query params**: `page` (default 1), `limit` (default 20), `search` (default `""`). // Source: source-code/backend/src/controllers/master-config.controller.js:123-125

**Behaviour**:
1. Sets `projectId = app.production ? 1 : 2` and adds to `where`. // Source: source-code/backend/src/controllers/master-config.controller.js:126, 132-134
2. If `search` (trimmed) is non-empty, builds `Op.or` over `key`, `name`, `description` with `LIKE %term%`. // Source: source-code/backend/src/controllers/master-config.controller.js:137-143
3. Issues `MasterConfig.findAndCountAll` with `limit`, `offset = (page-1)*limit`, ordered by `updatedAt DESC`. // Source: source-code/backend/src/controllers/master-config.controller.js:128, 145-150
4. Response rows **omit the typed value columns** — only metadata is returned: `id, key, name, dataType, description, projectId, createdAt, updatedAt`. To retrieve values, callers must use `/master-config/fetch`. // Source: source-code/backend/src/controllers/master-config.controller.js:153-162
5. Pagination block: `currentPage, totalPages, totalRecords, limit, hasNextPage, hasPrevPage`. // Source: source-code/backend/src/controllers/master-config.controller.js:164-177

**Responses**:
- 200: `"Master configurations retrieved successfully"`.
- 500: `"Failed to retrieve master configurations. Please try again."`.

---

### 3.3 POST `/api/v1/master-config/fetch` — Resolve config values by keys

**Auth**: `protect` only — any authenticated user role (admin, sales_manager, channel_partner, buyer, etc.). // Source: source-code/backend/src/routes/index.js:84

**Request body**: `{ "keys": "single_key" | ["key1","key2", ...] }`

**Behaviour**:
1. Sets `projectId = app.production ? 1 : 2`. // Source: source-code/backend/src/controllers/master-config.controller.js:70
2. Validates `keys` is a non-empty string or non-empty array of strings; trims and drops empties. // Source: source-code/backend/src/controllers/master-config.controller.js:72-95
3. String path: `getConfigByKey(key, projectId)` → returns `{ [key]: { id, key, name, dataType, description, value } }` or `{}` if not found. // Source: source-code/backend/src/controllers/master-config.controller.js:87-89, source-code/backend/src/services/master-config.service.js:96-107
4. Array path: `getConfigsByKeys(trimmedKeys, projectId)` → returns object keyed by `key`, each entry shaped as above. Missing keys are simply absent (no error). // Source: source-code/backend/src/controllers/master-config.controller.js:91-96, source-code/backend/src/services/master-config.service.js:109-135
5. The `value` field is **typed-cast** by `castValue` per the row's `dataType`:
   - `json`/`array`/`object` → `valueJson` (already parsed by Sequelize JSON type)
   - `number` → `Number(valueNumber)`
   - `boolean` → `Boolean(valueBoolean)` (null/undefined preserved as null)
   - `date`/`datetime` → `valueDatetime`
   - `string` (default) → `valueText`
   // Source: source-code/backend/src/services/master-config.service.js:7-26

**Responses**:
- 200: `{ message: "...", data: { configs: { <key>: {...}, ... } } }`. // Source: source-code/backend/src/controllers/master-config.controller.js:99-101
- 400: invalid keys input (string empty, array empty, wrong type).
- 500: `"Failed to retrieve master configurations. Please try again."`.

---

### 3.4 GET `/api/v1/admin/customer-actions` — Buyer add-unit toggle (read)

**Behaviour**: returns the two raw `MasterConfig` rows whose keys are in `['allow_additional_reg_unit','additional_reg_units_details']` for the active project. // Source: source-code/backend/src/controllers/admin.controller.js:1557-1568

**Response**: full row objects (including all typed value columns) — different shape from `/master-config/fetch`. UI must read `valueBoolean` / `valueJson` directly.

---

### 3.5 POST `/api/v1/admin/customer-actions` — Buyer add-unit toggle (write)

**Request body**: `{ "allowAddRegUnit": <boolean>, "addRegUnitsDetails": { "<typology>": { "isAllowed": <bool>, "countAllowed": <int> }, ... } }`. // Source: source-code/backend/src/controllers/admin.controller.js:1582-1584

**Behaviour & rules**:
1. `addRegUnitsDetails` must be present (else 400). // Source: source-code/backend/src/controllers/admin.controller.js:1586-1588
2. **Force-disable rule**: if `addRegUnitsDetails['2 Bed Peak Home']` is present, it is **forcibly overridden** with `{ isAllowed: false, countAllowed: 0 }` regardless of what the request sends. // Source: source-code/backend/src/controllers/admin.controller.js:1591-1594
3. No-op detection: if both `allowAddRegUnit` matches current `valueBoolean` AND a sorted-key JSON-stringify comparison of `addRegUnitsDetails` matches current `valueJson`, returns 400 `"No Change Detected"`. // Source: source-code/backend/src/controllers/admin.controller.js:1607-1615
4. Persists by mutating each row's `valueBoolean` / `valueJson` and calling `.save()` per row — **not** wrapped in a transaction (sequence; the `await sequelize.transaction()` line is commented out). // Source: source-code/backend/src/controllers/admin.controller.js:1580, 1617-1629
5. On any save failure: 500 `"Failed to save customer actions. Please try again."`. // Source: source-code/backend/src/controllers/admin.controller.js:1634-1645

**Risk / known limitation**: because save is not transactional, a failure between the two row saves can leave `allow_additional_reg_unit` updated while `additional_reg_units_details` is stale (or vice versa).

---

## 4. Data Models

### 4.1 `MasterConfig` (table `master_configs`)

| Field | Type | Null | Default | Notes / Source |
|-------|------|------|---------|----------------|
| `id` | BIGINT UNSIGNED, PK, auto-increment | NO | auto | // Source: master-config.model.js:16-21 |
| `projectId` | BIGINT UNSIGNED | YES | — | FK to `projects.id` per migration. // Source: 20250909125649-create_master_configs.cjs:13-20 |
| `key` | STRING(191) | NO | — | **`unique: true`** (model-level). Note: the migration created table column as STRING(255) unique; model declaration narrows to 191 with `comment: "Unique key to fetch config"`. // Source: master-config.model.js:26-31; create_master_configs.cjs:21-25 |
| `name` | STRING(255) | YES | — | Optional display label. // Source: master-config.model.js:32-36 |
| `dataType` | ENUM('string','number','boolean','json','date','datetime','array','object') | NO | — | DB column `data_type`. // Source: master-config.model.js:37-42 |
| `valueJson` | JSON | YES | — | // Source: master-config.model.js:43-46 |
| `valueText` | TEXT | YES | — | // Source: master-config.model.js:47-50 |
| `valueNumber` | DECIMAL(18,6) | YES | — | Note: migration originally DECIMAL(15,2) — model widens precision. // Source: master-config.model.js:51-54; create_master_configs.cjs:42-45 |
| `valueBoolean` | BOOLEAN | YES | — | // Source: master-config.model.js:55-58 |
| `valueDatetime` | DATE | YES | — | // Source: master-config.model.js:59-62 |
| `description` | TEXT | YES | — | // Source: master-config.model.js:63-66 |
| `createdAt` / `updatedAt` | DATE | NO | `NOW` | // Source: master-config.model.js:67-76 |
| `deletedAt` | DATE | YES | — | `paranoid: true` → soft delete. // Source: master-config.model.js:77-80, 88 |

Behaviour flags:
- `timestamps: true`, `underscored: true` (snake_case columns), `paranoid: true`. // Source: master-config.model.js:86-89
- `MasterConfig.auditEnabled = true` — audit log hook applies on write paths. // Source: master-config.model.js:92

**Uniqueness constraint**: `key` is declared unique. In practice the system writes multiple rows with the same `key` but different `projectId` (see Section 6 — `sm_email_masking` exists with `project_id=1` AND `project_id=2`). If a true composite uniqueness on `(key, projectId)` is desired, the current single-column unique on `key` would conflict; the migration `20260316084530` (and others) succeed in inserting both rows, indicating the unique constraint may be loose in the deployed DB or has been altered. **This is an inconsistency between model declaration and observed migration data — flag for verification.** // Source: master-config.model.js:29; 20260316084530-...cjs:12-53; 20260317092402-...cjs:11-32

### 4.2 `Module` (table `modules`) — adjacent model

Not part of master-config but referenced when reasoning about role-based access. Fields: `id`, `name` (STRING(100), unique). Soft-deleted. Associates `Module.hasMany(Permission, { foreignKey: 'moduleId' })`. // Source: source-code/backend/src/models/module.model.js:14-68

---

## 5. Role & Permission Matrix

| Endpoint | Anonymous | Buyer | Channel Partner | Sales Manager | Admin |
|----------|-----------|-------|-----------------|---------------|-------|
| POST `/api/v1/admin/master-config/store` | denied | denied | denied | denied | **allowed** |
| GET `/api/v1/admin/master-config` | denied | denied | denied | denied | **allowed** |
| POST `/api/v1/master-config/fetch` | denied | allowed | allowed | allowed | **allowed** |
| GET `/api/v1/admin/customer-actions` | denied | denied | denied | denied | **allowed** |
| POST `/api/v1/admin/customer-actions` | denied | denied | denied | denied | **allowed** |

Enforcement points:
- `/api/v1/admin/*` — all sub-routes pass through `router.use(protect, restrictTo('admin'))`. // Source: source-code/backend/src/routes/admin.routes.js:53
- `/api/v1/master-config/fetch` — only `protect` (authenticated session required, any role). // Source: source-code/backend/src/routes/index.js:84
- `restrictTo` rejects with 403 `Forbidden` when `req.user.role` not in allowed set. // Source: source-code/backend/src/middleware/auth.middleware.js:102-106

---

## 6. Config Section Reference — Known Keys & System Effects

The following keys are inserted via migrations and read at runtime. They form the authoritative "config sections" the admin can modify.

### 6.1 Allocation control

| Key | Type | Default | Purpose | Inserted By |
|-----|------|---------|---------|-------------|
| `allocation_enabled` | boolean | `true` | Whether allocation system is enabled | // Source: 20250928050000-bulk-insert-master-configs.cjs:18-27 |
| `allocation_round_time` | number | `1` | Minutes per allocation round | // Source: 20250928050000-...cjs:28-37 |
| `allocation_type` | string | `'first-come-first-serve'` | Allocation mode (STATIC / DYNAMIC) | // Source: 20250928050000-...cjs:38-47 |
| `allocations_per_unit` | number | `1` | Number of allocations per unit | // Source: 20250928050000-...cjs:48-57 |
| `allocation_status` | boolean | `0` | Status of allocation process | // Source: 20251111100145-insert-dynamic-allocation-keys.cjs:20-27 |
| `dynamic_allocation_start_time` | datetime | `null` | Start time for dynamic allocation | // Source: 20251111100145-...cjs:28-37 |
| `dynamic_allocation_end_time` | datetime | `null` | End time for dynamic allocation | // Source: 20251111100145-...cjs:38-47 |

**Runtime consumers**: Tower KPI / allocation services reference these keys via `MasterConfig.findOne`. Note: the previously-active push to the Python allocation orchestrator on watched-key change is **commented out** in `storeConfigs`. // Source: source-code/backend/src/services/master-config.service.js:142-148, 195-231

### 6.2 Parking

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `park_enabled` | boolean | `0` (false) | Master toggle for parking; created per project. // Source: 20260403153000-insert-park-enabled-master-config.cjs:6-26 |

**Runtime consumers** (all hard-fail if disabled):
- Buyer unit-info enrichment for booking — `parkingEnabled` flag in API response derived from `park_enabled`; also forced `false` for `'2 BHK Rise Home'` / `'2 BHK Peak Home'`. // Source: source-code/backend/src/services/common.service.js:130-155
- Buyer registration-units listing — `parkingInfo` block added per unit when `park_enabled` is true. // Source: source-code/backend/src/controllers/user.controller.js:772-803, 1095-1124
- Allocation hold step — rejects `parkingSelected` if `park_enabled` is false: `"Parking is not enabled for this project"`. // Source: source-code/backend/src/services/allocation.service.js:589-596
- Offline / admin allocation — same rejection: `"Parking is disabled for this project"`. // Source: source-code/backend/src/services/allocation.service.js:1970-1979

### 6.3 Sales-Manager PII masking

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `sm_email_masking` | boolean | `1` (true) | Mask buyer email when surfaced to SM. Per-project rows. // Source: 20260316084530-...cjs:12-53 |
| `sm_phone_masking` | boolean | `1` (true) | Mask buyer phone when surfaced to SM. Per-project rows. // Source: 20260316084530-...cjs:23-53 |
| `sm_unit_cost_masking` | boolean | `1` (true) | Mask unit cost on SM heatmap / detail. Per-project rows. // Source: 20260317092402-...cjs:11-32 |

**Runtime consumers**:
- `checkEmailMaskingStatus(projectId)` / `checkPhoneMaskingStatus(projectId)` — used inside SM callback-request service. // Source: source-code/backend/src/services/callback-request-sm.service.js:34-42
- `salesManagerHeatmapUnit({ unitId })` reads `sm_unit_cost_masking` to set `isUnitCostMasked` on the response. // Source: source-code/backend/src/services/common.service.js:661-666

### 6.4 Buyer customer-action toggles

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `allow_additional_reg_unit` | boolean | `true` | Buyer can add more registration units. // Source: 20251113123104-insert-customer-actions-keys.cjs:11-18 |
| `additional_reg_units_details` | json | per-typology map | Per-typology `{ isAllowed, countAllowed }`. Default disables all 4 typologies (`countAllowed: 0`). // Source: 20251113123104-...cjs:19-32 |

Default JSON shape:
```json
{
  "1 Bed Growth Home": { "isAllowed": false, "countAllowed": 0 },
  "2 Bed Growth Home": { "isAllowed": false, "countAllowed": 0 },
  "2 Bed Rise Home":   { "isAllowed": false, "countAllowed": 0 },
  "2 Bed Peak Home":   { "isAllowed": false, "countAllowed": 0 }
}
```

**Runtime consumers** (buyer "add additional unit" flow):
- Gate 1: `getConfigByKey('allow_additional_reg_unit', projectId)` → if value is falsy, 400 `"Registration is not enabled, Please try again later"`. // Source: source-code/backend/src/controllers/registration.controller.js:1595-1599
- Gate 2: `getConfigByKey('additional_reg_units_details', projectId)` → loaded as JSON object; for each selected apartment:
  - if `configApartments[apartmentType].isAllowed === false` → 400 generic error. // Source: registration.controller.js:1601-1613
  - existing-units count for that typology must be `< countAllowed`, else 400. // Source: registration.controller.js:1615-1622

### 6.5 Applicant limit

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `max_applicants_per_unit` | number | `4` | Max applicants per registration unit per buyer. // Source: 20250928050000-bulk-insert-master-configs.cjs:8-17 |

**Runtime consumers**: Applicant add / bulk-add endpoints. Read via `MasterConfig.findOne({ where: { key: 'max_applicants_per_unit' } })` (note: this lookup is **not project-scoped** — there's only one row). Falls back to `4` if row missing. // Source: source-code/backend/src/controllers/user.controller.js:243-256, 352-354

### 6.6 UI marquee text

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `user_top_marque_text` | string | `''` | Text rendered at top of buyer UI. // Source: 20250928050000-bulk-insert-master-configs.cjs:58-67 |

No server-side gating logic; consumed by buyer UI via `/master-config/fetch`.

---

## 7. Cascade / Side-Effect Map

Each row below documents what happens **immediately and downstream** when a given config is modified via POST `/api/v1/admin/master-config/store` (or its dedicated endpoint where applicable).

| Config Key Changed | Direct Service Behaviour | Downstream Modules Affected | Citation |
|--------------------|--------------------------|------------------------------|----------|
| `park_enabled` (false → true) | Parking surfaces in buyer unit-info, registration-unit listings, allocation hold flow. | Buyer Portal (unit booking UI shows parking), Admin Portal (offline assign accepts parking), Allocation Service. | common.service.js:132, 536; user.controller.js:772, 1095; allocation.service.js:590, 1970 |
| `park_enabled` (true → false) | Hard-rejects any `parkingSelected=true` request with 400. Existing parking selections in pending bookings will fail at hold time. | Allocation (booking break), Buyer (UI must hide parking option). | allocation.service.js:594-596, 1975-1979 |
| `allow_additional_reg_unit` (true → false) | Buyer "Add registration unit" endpoint returns 400 immediately. | Buyer Portal — registration self-service blocked. | registration.controller.js:1595-1599 |
| `additional_reg_units_details` typology change (`isAllowed: true → false`) | New add-unit requests for that typology are rejected. Already-registered units retained. | Buyer Portal. | registration.controller.js:1610-1613 |
| `additional_reg_units_details` typology `countAllowed` decrease | New adds blocked if existing count already ≥ new limit. Existing units retained. | Buyer Portal. | registration.controller.js:1615-1622 |
| `sm_email_masking` (true → false) | SM views see raw buyer email. | Sales Manager Portal — callback-request lists. | callback-request-sm.service.js:34-37 |
| `sm_phone_masking` (true → false) | SM views see raw buyer phone. | Sales Manager Portal — callback-request lists. | callback-request-sm.service.js:39-42 |
| `sm_unit_cost_masking` (true → false) | SM heatmap unit detail surfaces actual unit cost. | Sales Manager Portal — heatmap. | common.service.js:664-666 |
| `max_applicants_per_unit` decrease | New applicant additions rejected if existing count already ≥ new limit. Existing applicants retained. | Buyer Portal — applicant flow. | user.controller.js:243-256 |
| `allocation_enabled` / `allocation_round_time` / `allocation_type` / `allocations_per_unit` / `dynamic_allocation_start_time` / `dynamic_allocation_end_time` | Stored only. **No active push to Python allocation orchestrator** — that cascade is fully commented out in current source. Downstream allocation services must re-read on next request to observe changes. | Allocation Service (lazy read), Tower KPI. | master-config.service.js:142-231 (commented block); allocation.service.js refers to MasterConfig reads only. |
| `user_top_marque_text` | Pure display string. | Buyer Portal (UI re-fetch via `/master-config/fetch`). | 20250928050000-...cjs:58-67 |

### KPI recalculation triggers

There is **no explicit "KPI recalculation" hook** triggered from `storeConfigs`. Tower KPI is computed on-demand by `getTowerKpi`; it does not subscribe to config changes. // Source: source-code/backend/src/routes/admin.routes.js:102 (route definition); no observer pattern found in `master-config.service.js`.

### Chunked transaction rules

`storeConfigs` accepts an optional `transaction` parameter and uses it for `.update` / `.create`. The HTTP path (`storeMasterConfigs` controller) **does not** start a transaction — each config row save is committed independently. // Source: source-code/backend/src/services/master-config.service.js:137, 187, 189; source-code/backend/src/controllers/master-config.controller.js:45 (no `sequelize.transaction()` call).

For `updateCustomerActions`, the transaction is similarly **not active** (commented out at line 1580); the two row saves happen sequentially without rollback. // Source: source-code/backend/src/controllers/admin.controller.js:1580, 1627-1629

---

## 8. Edge Cases & Known Constraints

1. **`projectId` is server-derived, not client-supplied.** Every admin write/read of master config resolves `projectId` from `app.production` (1 for prod, 2 otherwise). The validation schema accepts `projectId` in the body but the controller ignores it. UAT and production therefore see different rows for the same key. // Source: master-config.controller.js:19, 70, 126; master-config.validations.js:95

2. **`dataType` once set is sticky.** `storeConfigs` falls back to the existing row's `dataType` when none is supplied, so a follow-up `value` write keeps the original column. To switch types, the caller **must** pass `dataType` explicitly. // Source: master-config.service.js:159

3. **Value column hygiene.** `prepareValueColumns` sets all 5 typed columns and nulls the non-matching ones, so changing `dataType` on a write correctly clears stale values from other columns. // Source: master-config.service.js:28-62

4. **Type inference quirks for date strings.** Any string starting with `YYYY-MM-DD` is auto-inferred as `date` / `datetime` even if intended as a plain string. To force a string store, pass `dataType: 'string'` explicitly. // Source: master-config.service.js:71-75

5. **GET admin list hides values.** The paginated admin list returns only metadata — no `value*` columns. Admin UI must use `/master-config/fetch` to view current values. // Source: master-config.controller.js:153-162

6. **`/master-config/fetch` silently drops missing keys.** Array-form fetch never errors on unknown keys; absent rows are simply omitted from the response. Callers must check presence per key. // Source: master-config.service.js:109-130

7. **Force-disable: '2 Bed Peak Home'.** The `updateCustomerActions` controller forcibly resets `'2 Bed Peak Home'` to `{ isAllowed: false, countAllowed: 0 }` on every write, regardless of input. Any admin attempt to enable this typology via this endpoint will be silently undone. // Source: admin.controller.js:1591-1594

8. **No-op detection on customer-actions.** If the new payload is structurally identical to the stored data (after sorted-key JSON compare), the endpoint returns 400 `"No Change Detected"` — note this uses the **400 error response** path, not a 200 idempotent acknowledgement. // Source: admin.controller.js:1607-1615

9. **Customer-actions write is non-transactional.** Save failures between the two row writes can leave the toggles out of sync. // Source: admin.controller.js:1580, 1627-1629

10. **Allocation orchestrator notification is dormant.** The `pythonService.post('/api/switch-allocation-flow', ...)` cascade for allocation-key changes is commented out. Switching `allocation_type` or `dynamic_allocation_start_time` via `/master-config/store` will NOT notify the external orchestrator in the current build. Manual coordination is required. // Source: master-config.service.js:195-231

11. **`max_applicants_per_unit` is global.** The lookup is `MasterConfig.findOne({ where: { key: 'max_applicants_per_unit' } })` — **no `projectId` filter**. Only one global row is honoured (the migration inserts it for `project_id=1`). On non-prod (project 2), the lookup returns the prod row or none → fallback `4`. // Source: user.controller.js:243; 20250928050000-...cjs:9-17

12. **`key` uniqueness vs. observed multi-project rows.** The model declares `key` as a single-column unique, yet migrations (`sm_email_masking`, `sm_phone_masking`, `sm_unit_cost_masking`, `park_enabled`) insert two rows with the same key for `project_id=1` and `project_id=2`. The deployed DB must therefore have a relaxed or composite unique constraint, otherwise these migrations would fail. **Verify actual DB constraint.** // Source: master-config.model.js:29; 20260316084530-...cjs:12-53

13. **Numeric precision drift.** Migration created `value_number` as `DECIMAL(15,2)`; model uses `DECIMAL(18,6)`. New writes through Sequelize use the model definition; raw DB schema may differ. // Source: create_master_configs.cjs:42-45; master-config.model.js:51-54

14. **No DELETE endpoint.** There is no HTTP route to remove a master-config row. Cleanup happens only via migration down-functions or direct DB access. // Source: route grep — only `/store` and `/master-config` and `/master-config/fetch` are exposed; no DELETE in admin.routes.js or routes/index.js for this controller.

15. **Audit logging.** `MasterConfig.auditEnabled = true` enables the audit hook, so all writes (`create`, `update`) emit audit-log entries. Reads do not. // Source: master-config.model.js:92

---

## File-Path Index (all sources cited above)

- `source-code/backend/src/controllers/master-config.controller.js`
- `source-code/backend/src/services/master-config.service.js`
- `source-code/backend/src/models/master-config.model.js`
- `source-code/backend/src/models/module.model.js`
- `source-code/backend/src/validations/master-config.validations.js`
- `source-code/backend/src/routes/admin.routes.js`
- `source-code/backend/src/routes/index.js`
- `source-code/backend/src/middleware/auth.middleware.js`
- `source-code/backend/src/controllers/admin.controller.js` (`getCustomerActions`, `updateCustomerActions`, `getMaxPreferencesPerUnit`, `updateMaxPreferencesPerUnit`)
- `source-code/backend/src/controllers/user.controller.js` (`max_applicants_per_unit`, `park_enabled` usages)
- `source-code/backend/src/controllers/registration.controller.js` (`allow_additional_reg_unit`, `additional_reg_units_details` usages)
- `source-code/backend/src/services/common.service.js` (`park_enabled`, `sm_unit_cost_masking` usages)
- `source-code/backend/src/services/callback-request-sm.service.js` (`sm_email_masking`, `sm_phone_masking` usages)
- `source-code/backend/src/services/allocation.service.js` (`park_enabled` checks)
- Migrations (all CommonJS):
  - `source-code/backend/src/migrations/20250909125649-create_master_configs.cjs`
  - `source-code/backend/src/migrations/20250910100000-add-applicant-limit-master-config.cjs`
  - `source-code/backend/src/migrations/20250928050000-bulk-insert-master-configs.cjs`
  - `source-code/backend/src/migrations/20251111100145-insert-dynamic-allocation-keys.cjs`
  - `source-code/backend/src/migrations/20251113123104-insert-customer-actions-keys.cjs`
  - `source-code/backend/src/migrations/20260316084530-insert-email-phone-masking-configs-into-master-configs-table.cjs`
  - `source-code/backend/src/migrations/20260317092402-insert-cost-masking-configs-into-master-configs-table.cjs`
  - `source-code/backend/src/migrations/20260403153000-insert-park-enabled-master-config.cjs`
