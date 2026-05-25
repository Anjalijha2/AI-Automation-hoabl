# FSD — Admin Portal: CMS (Content Management System)
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

> **CRITICAL CLARIFICATION**
> The Admin Portal screen at route `/admin/cms` (labelled **"Config"** in the sidebar) is **NOT a traditional Content Management System** that manages banners, galleries, testimonials, or media uploads.
> It is an **operational Config console** that exposes:
>   1. Admin reads/writes to the `master_configs` key-value store (allocation timings, masking flags, marquee text, etc.)
>   2. Excel bulk-upload utilities for tower status, unit status/price, registration status, sales-manager import, bulk cancel/refund
>   3. Customer-action toggles and max-preferences-per-unit
>
> True headless-CMS content (project name, apartments, banners, gallery, videos, documents, amenities) is served by an **external Strapi instance** (`https://manage-dev.xrportal.in`). The XR Portal backend integrates with Strapi **read-only** via `services/strapi.service.js`, used only by the registration controller to enrich apartment data. There is **NO backend wrapper that allows the Admin Portal to create/update/delete Strapi content** — Strapi is administered in its own UI, out of scope for XR Portal QA per project Constraint #2.
>
> This FSD documents the `/admin/cms` ("Config") screen and the read-only Strapi proxy, the only two CMS-adjacent surfaces present in the source code.

---

## 1. Module Overview

### 1.1 What "CMS" means in this codebase

| Surface | Type | Owner | Scope |
|---|---|---|---|
| `/admin/cms` route in admin frontend | Operational config screen | XR Portal backend | IN SCOPE |
| `services/strapi.service.js` | Read-only Strapi client | XR Portal backend | IN SCOPE (the wrapper only) |
| Strapi headless CMS (`https://manage-dev.xrportal.in`) | External content store | Strapi admin UI | OUT OF SCOPE — Strapi excluded per project constraint |

### 1.2 RBAC / Module registration

The admin role is granted CMS permissions via migration:

```js
// Source: source-code/backend/src/migrations/20250924133656-insert-modules-and-permissions.cjs:8
const moduleNames = ['admin_cms', 'tower_view'];
const actionNames = ['add', 'view', 'edit', 'delete', 'submit'];
```

A `modules` row named `admin_cms` is created (if missing), and all five `(admin_cms, action)` permissions are inserted into `permissions`, then bound to `role_id = 1` (admin) in `role_permissions`.
// Source: source-code/backend/src/migrations/20250924133656-insert-modules-and-permissions.cjs:76-83

Frontend constant:
```js
// Source: source-code/admin-sm-cp-portal/src/constants/moduleMaster.jsx:6
ADMIN_CMS: 5,
```

Sidebar entry (label is "Config", not "CMS"):
```js
// Source: source-code/admin-sm-cp-portal/src/components/common/navs/SideBar.jsx:78-80
label: <NavLink to="/admin/cms">Config</NavLink>,
key: '/admin/cms',
icon: <CmsIcon />,
```

Route registration:
```js
// Source: source-code/admin-sm-cp-portal/src/routes/Private/admin/index.jsx:10
const Cms = lazy(() => import('./cms/Cms'));
// Source: source-code/admin-sm-cp-portal/src/routes/Private/admin/index.jsx:29
<Route path="cms" element={<Cms />} />
```

Frontend page implementation: `source-code/admin-sm-cp-portal/src/routes/Private/admin/cms/Cms.jsx` (2348 lines).

### 1.3 Backend files touched by `/admin/cms`

| File | Role |
|---|---|
| `source-code/backend/src/routes/admin.routes.js` | Mounts master-config, tower, customer-actions, bulk-upload routes |
| `source-code/backend/src/controllers/master-config.controller.js` | Store/retrieve key-value configs |
| `source-code/backend/src/services/master-config.service.js` | Master-config persistence (referenced via import at controller:1) |
| `source-code/backend/src/models/master-config.model.js` | `master_configs` table model |
| `source-code/backend/src/controllers/admin.controller.js` | Tower toggle, customer actions, bulk upload handlers |
| `source-code/backend/src/controllers/tower.controller.js` | Tower listing, status update |
| `source-code/backend/src/controllers/allocation-campaign.controller.js` | `POST /api/v1/admin/allocation-config` (campaign creation) |
| `source-code/backend/src/services/strapi.service.js` | Read-only Strapi client (NOT used by /admin/cms — used by registration flow) |
| `source-code/backend/src/utils/multerConfig.js` & `utils/upload.js` | Excel/file upload middleware |

### 1.4 DB tables in scope

| Table | Model | Purpose |
|---|---|---|
| `master_configs` | `models/master-config.model.js` | Key-value config store with typed columns |
| `modules`, `actions`, `permissions`, `role_permissions` | migration `20250924133656` | RBAC for `admin_cms` |
| `audit_logs` | `models/audit-log.model.js` | Audit trail (MasterConfig.auditEnabled = true) |

```js
// Source: source-code/backend/src/models/master-config.model.js:92
MasterConfig.auditEnabled = true;
```

---

## 2. Data Model

### 2.1 `master_configs` table (key-value store with typed columns)

// Source: source-code/backend/src/models/master-config.model.js:14-90

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, autoIncrement | line 16-21 |
| `project_id` | BIGINT UNSIGNED | nullable | line 22-25 |
| `key` | STRING(191) | NOT NULL, UNIQUE | line 26-31 |
| `name` | STRING(255) | nullable | line 32-36 — optional display name |
| `data_type` | ENUM | NOT NULL | line 37-42 — `string\|number\|boolean\|json\|date\|datetime\|array\|object` |
| `value_json` | JSON | nullable | line 43-46 |
| `value_text` | TEXT | nullable | line 47-50 |
| `value_number` | DECIMAL(18,6) | nullable | line 51-54 |
| `value_boolean` | BOOLEAN | nullable | line 55-58 |
| `value_datetime` | DATE | nullable | line 59-62 |
| `description` | TEXT | nullable | line 63-66 |
| `created_at` / `updated_at` | DATE | NOT NULL | line 67-76, timestamps:true (line 86) |
| `deleted_at` | DATE | nullable | line 77-80, paranoid:true (line 88) |

Notes:
- `tableName: 'master_configs'` // Source: line 85
- `underscored: true` // Source: line 87
- `paranoid: true` (soft delete) // Source: line 88
- Audit-enabled // Source: line 92

### 2.2 Master-config keys consumed by `/admin/cms` screen

// Source: source-code/admin-sm-cp-portal/src/utils/Urls.js:168-185
```js
export const masterConfigKeys = {
  maxApplicantsPerUnit: 'max_applicants_per_unit',
  allocationEnabled: 'allocation_enabled',
  userTopMarqueText: 'user_top_marque_text',
  allocationStatus: 'allocation_status',
  allocationType: 'allocation_type',
  allocationRoundTime: 'allocation_round_time',
  allocationsPerUnit: 'allocations_per_unit',
  allocationStartTime: 'allocation_start_time',
  allocationEndTime: 'allocation_end_time',
  dynamicAllocationStartTime: 'dynamic_allocation_start_time',
  dynamicAllocationEndTime: 'dynamic_allocation_end_time',
  staticAllocationStartTime: 'static_allocation_start_time',
  staticAllocationEndTime: 'static_allocation_end_time',
  smPhoneMasking: 'sm_phone_masking',
  smEmailMasking: 'sm_email_masking',
  smUnitCostMasking: 'sm_unit_cost_masking',
};
```

Fetched on screen mount via:
```js
// Source: source-code/admin-sm-cp-portal/src/routes/Private/admin/cms/Cms.jsx:310
const response = await expressPost(apiUrls.masterConfig + '/fetch', keys);
```

### 2.3 Customer-actions keys (stored as MasterConfig rows)

// Source: source-code/admin-sm-cp-portal/src/routes/Private/admin/cms/Cms.jsx:359-360
```js
const unitDet = data.find((item) => item.key === 'additional_reg_units_details')?.valueJson || {};
const allReg = data.find((item) => item.key === 'allow_additional_reg_unit')?.valueBoolean || false;
```

Keys:
- `additional_reg_units_details` (JSON) — per-typology `{ isAllowed, countAllowed }` for 1-Bed Growth, 2-Bed Growth/Rise/Peak
- `allow_additional_reg_unit` (boolean)

### 2.4 No CMS content models exist

The following models were searched in `source-code/backend/src/models/` and **DO NOT EXIST**:
- No `banner.model.js`
- No `gallery.model.js`
- No `testimonial.model.js`
- No `content.model.js`
- No `media.model.js`
- No `cms.model.js`

// Source: grep across `source-code/backend/src/models/` for `banner|gallery|testimonial|cms|Banner|Gallery|Testimonial|CMS` returned NO MATCHES.

---

## 3. State Machines

### 3.1 Master-config lifecycle

Master-config rows have **no explicit state machine** (no `status` / `publish_state` / `draft` columns). The model is a simple key-value store with `paranoid: true` soft-delete.
// Source: source-code/backend/src/models/master-config.model.js:14-90 — no status field defined.

States observable:
- **Present** (`deleted_at IS NULL`)
- **Soft-deleted** (`deleted_at IS NOT NULL`) — paranoid:true
// Source: source-code/backend/src/models/master-config.model.js:77-88

### 3.2 No publish/draft/archived workflow

// Source: NOT FOUND — verify manually. No `state`, `status`, `publishedAt`, `draft`, or `archived` column exists on `master_configs`.

### 3.3 Customer-action toggle (boolean only)

`allow_additional_reg_unit` is a boolean flag; toggles between `true` / `false`. No intermediate state.
// Source: source-code/admin-sm-cp-portal/src/routes/Private/admin/cms/Cms.jsx:360

---

## 4. Business Rules

### 4.1 Master-config write validations

```js
// Source: source-code/backend/src/controllers/master-config.controller.js:22-23
if (!configs || !Array.isArray(configs) || configs.length === 0) {
  return ApiResponse.error(httpStatus.BAD_REQUEST, 'configs array is required and must not be empty').send(res);
}
```

```js
// Source: source-code/backend/src/controllers/master-config.controller.js:28-31
if (!config.key || config.value === undefined) {
  return ApiResponse.error(httpStatus.BAD_REQUEST, `Invalid config at index ${i}: key and value are required`).send(res);
}
```

```js
// Source: source-code/backend/src/controllers/master-config.controller.js:35-41
const validDataTypes = ['string', 'number', 'boolean', 'json', 'date', 'datetime', 'array', 'object'];
if (!validDataTypes.includes(config.dataType)) {
  return ApiResponse.error(httpStatus.BAD_REQUEST,
    `Invalid dataType at index ${i}: must be one of ${validDataTypes.join(', ')}`).send(res);
}
```

### 4.2 Project-ID injection (environment-driven)

```js
// Source: source-code/backend/src/controllers/master-config.controller.js:19
const projectId = app.production ? 1 : 2;
```
Also at lines 70 and 126. Admin cannot override `projectId` — it is forced by `app.production`.

### 4.3 Yup schema constraints (`storeMasterConfigSchema`)

// Source: source-code/backend/src/validations/master-config.validations.js:42-89
- `key`: required, trim, max 191 chars (line 43)
- `name`: nullable, max 255 chars (line 45)
- `dataType`: nullable, must be one of 8 enum values (line 47)
- `value`: nullable, validated against `dataType` via custom `value-type-validation` test (lines 49-86)
- `description`: nullable, trim (line 88)
- `configs`: array, min 1 (line 93)
- `projectId`: nullable, positive number (line 95)

### 4.4 Master-config retrieve validations

```js
// Source: source-code/backend/src/controllers/master-config.controller.js:72-82
if (
  !keys ||
  (!Array.isArray(keys) && typeof keys !== 'string') ||
  (Array.isArray(keys) && keys.length === 0) ||
  (typeof keys === 'string' && keys.trim() === '')
) {
  return ApiResponse.error(httpStatus.BAD_REQUEST,
    'keys is required and must be a non-empty string or array of strings').send(res);
}
```

### 4.5 Pagination defaults on `GET /admin/master-config`

```js
// Source: source-code/backend/src/controllers/master-config.controller.js:123-125
const page = parseInt(req.query.page, 10) || 1;
const limit = parseInt(req.query.limit, 10) || 20;
const search = req.query.search || '';
```

Sort order: `[['updatedAt', 'DESC']]` // Source: line 149
Search scopes: `key`, `name`, `description` via `LIKE %search%` // Source: lines 138-142

### 4.6 File-upload rules (used by /admin/cms bulk operations)

All bulk uploads use `multer.memoryStorage()`.
// Source: source-code/backend/src/utils/upload.js:11

Default allowed MIME (when no per-field rule): `['application/pdf', 'image/jpeg', 'image/png']`.
// Source: source-code/backend/src/utils/upload.js:34

`/admin/cms` bulk-upload endpoints use `upload.single('doc')` (multerConfig defaults) — see Section 6 for per-endpoint flags. No CMS-specific MIME or size policy is defined in `upload.js`.
// Source: NOT FOUND — `multerConfig.js` defaults govern Excel uploads; CMS-specific size cap not in source. Verify manually.

### 4.7 Dynamic-allocation time rules (enforced in frontend only)

Minimum start = now + 15 min:
```js
// Source: source-code/admin-sm-cp-portal/src/routes/Private/admin/cms/Cms.jsx:44
const getMinDynamicAllocationMoment = () => dayjs().add(15, 'minute');
```

End must be at least `roundTimeMinutes` after start, and an exact multiple of `roundTimeMinutes`:
// Source: source-code/admin-sm-cp-portal/src/routes/Private/admin/cms/Cms.jsx:134-181

Round-time choices: 15 to 60 min in 5-min steps (10 options):
```js
// Source: source-code/admin-sm-cp-portal/src/routes/Private/admin/cms/Cms.jsx:37
const roundTimeValues = Array.from({ length: 10 }, (_, index) => 15 + index * 5);
```

Allocations-per-unit choices: 2 to 20 (19 options):
```js
// Source: source-code/admin-sm-cp-portal/src/routes/Private/admin/cms/Cms.jsx:38
const allocationsPerUnitValues = Array.from({ length: 19 }, (_, index) => index + 2);
```

> NOTE: These constraints exist **only in the frontend Cms.jsx file**. The backend `master-config` store/fetch endpoints accept arbitrary values for these keys without time-range validation.

### 4.8 Strapi proxy — single hardcoded endpoint

```js
// Source: source-code/backend/src/services/strapi.service.js:117
const response = await strapiClient.get('/api/projects/1?populate=deep', { headers: { ...getStrpiSecrets() } });
```

- Project ID is hardcoded as `1` regardless of environment.
- Bearer token from `process.env.STRAPI_BEARER_TOKEN`.
// Source: source-code/backend/src/services/strapi.service.js:111-113 + source-code/backend/src/config/api.js:36-40
- If token missing, a warning is logged at boot but the service still loads:
```js
// Source: source-code/backend/src/services/strapi.service.js:11-15
if (!config.token) {
  logger.warn('Strapi API keys not configured properly', { service: 'strapi' });
}
```

### 4.9 Tower-status bulk update validation

```js
// Source: source-code/backend/src/validations/master-config.validations.js:116-129
export const updateTowerStatusSchema = object({
  towers: array().of(object({
    id: number().integer().positive().required('Tower ID is required'),
    isActive: boolean().required('isActive status is required'),
  })).required('towers array is required').min(1, 'At least one tower must be provided'),
});
```

---

## 5. Notification Dispatch

| Action | Channel | Template | Trigger | Source |
|---|---|---|---|---|
| Store master-config | NONE | — | — | // Source: source-code/backend/src/controllers/master-config.controller.js:14-60 — no email/whatsapp/sms invocation |
| Retrieve master-config | NONE | — | — | // Source: source-code/backend/src/controllers/master-config.controller.js:67-114 |
| List master-configs | NONE | — | — | // Source: source-code/backend/src/controllers/master-config.controller.js:121-192 |
| Customer-actions update | NONE | — | — | // Source: NOT FOUND in admin.controller.js — verify by grep on `customerActions` |
| Tower status update | NONE | — | — | // Source: source-code/backend/src/routes/admin.routes.js:83 — direct DB update, no notification middleware |
| Bulk upload (cancel/refund/status/price) | NONE direct from CMS screen | — | — | Bulk handlers may emit downstream notifications inside their own workflows; the `/admin/cms` action itself does not dispatch. // Source: admin.controller.js handlers (verify per handler) |

The CMS module sends **NO notifications** of its own. Any downstream notification (e.g. refund email) originates from the underlying refund/cancel service, not from the CMS screen action.

---

## 6. API Endpoints

All routes below are protected by `protect, restrictTo('admin')` middleware applied at the router level.
// Source: source-code/backend/src/routes/admin.routes.js:53

### 6.1 Master-Config endpoints

| Method | Path | Controller fn | Auth | Source |
|---|---|---|---|---|
| POST | `/api/v1/admin/master-config/store` | `storeMasterConfigs` | admin | admin.routes.js:67 |
| GET | `/api/v1/admin/master-config` | `getAllMasterConfigs` | admin | admin.routes.js:79 |
| POST | `/api/v1/master-config/fetch` | `retrieveMasterConfigs` | any authenticated | routes/index.js:84 |

### 6.2 Tower endpoints called from /admin/cms

| Method | Path | Controller fn | Auth | Source |
|---|---|---|---|---|
| GET | `/api/v1/admin/towers` | `getAllTowers` | admin | admin.routes.js:81 |
| PUT | `/api/v1/admin/towers/status-update` | `updateTowerStatus` (validated) | admin | admin.routes.js:83 |
| GET | `/api/v1/admin/units-by-tower/:towerId` | `getUnitsByTowerId` | admin | admin.routes.js:84 |
| GET | `/api/v1/admin/tower-kpi` | `getTowerKpi` | admin | admin.routes.js:102 |

### 6.3 Customer-actions endpoints

| Method | Path | Controller fn | Auth | Source |
|---|---|---|---|---|
| GET | `/api/v1/admin/customer-actions` | `getCustomerActions` | admin | admin.routes.js:136 |
| POST | `/api/v1/admin/customer-actions` | `updateCustomerActions` | admin | admin.routes.js:137 |
| GET | `/api/v1/admin/max-preferences-per-unit` | `getMaxPreferencesPerUnit` | admin | admin.routes.js:140 |
| PUT | `/api/v1/admin/max-preferences-per-unit/:projectId` | `updateMaxPreferencesPerUnit` | admin | admin.routes.js:141 |

### 6.4 Bulk-upload endpoints invoked from /admin/cms

| Method | Path | Controller fn | Multer | Source |
|---|---|---|---|---|
| PUT | `/api/v1/admin/cancel-units-excel` | `AdminController.cancelByExcelUpload` | `upload.single('doc')` | admin.routes.js:70 |
| GET | `/api/v1/admin/bulk-cancel-sample` | `downloadBulkCancellationSample` | — | admin.routes.js:71 |
| GET | `/api/v1/admin/bulk-refund-sample` | `downloadBulkRefundSample` | — | admin.routes.js:72 |
| GET | `/api/v1/admin/export-all-units-price` | `getAllUnitsExcel` | — | admin.routes.js:106 |
| POST | `/api/v1/admin/update-units-price` | `updateUnitPrice` | `upload.single('doc')` | admin.routes.js:108 |
| POST | `/api/v1/admin/registration-units/refund-bulk` | `bulkRefundRegistrationUnits` | `upload.single('doc')` | admin.routes.js:134 |
| GET | `/api/v1/admin/export-all-units-status` | `getAllUnitsStatusExcel` | — | admin.routes.js:144 |
| POST | `/api/v1/admin/update-units-status` | `updateUnitStatusExcel` | `upload.single('doc')` | admin.routes.js:145 |
| GET | `/api/v1/admin/export-all-registrations-status` | `getAllRegistrationExcel` | — | admin.routes.js:148 |
| POST | `/api/v1/admin/update-registrations-status` | `updateRegistrationStatus` | `upload.single('doc')` | admin.routes.js:149 |
| GET | `/api/v1/admin/sales-manager-sample` | `downloadSalesManagerSample` | — | admin.routes.js:202 |
| POST | `/api/v1/admin/sales-managers-import` | `uploadSalesManagers` | `upload.single('doc')` | admin.routes.js:203 |
| GET | `/api/v1/admin/registration-status` | `getRegistrationStatus` | admin | admin.routes.js:103 |

### 6.5 Allocation-config (campaign creation, called as `apiUrls.admin.updateAllocationConfig`)

| Method | Path | Controller fn | Multer | Source |
|---|---|---|---|---|
| POST | `/api/v1/admin/allocation/campaigns` | `storeAllocationCampaign` | `upload.fields([allotmentExcel, commonPoolExcel])` | routes/admin/allocation/campaign.routes.js:43-51 |

Frontend constant points at `/api/v1/admin/allocation-config`:
// Source: source-code/admin-sm-cp-portal/src/utils/Urls.js:85
However, the controller header comment `@route POST /api/v1/admin/allocation-config` at controller line 15 is **stale**; the actual mounted path is `/api/v1/admin/allocation/campaigns`. See Section 7.

### 6.6 No Strapi-write endpoints exposed by backend

// Source: grep on `strapi` across `source-code/backend/src/routes/` returned 0 matches. The backend does not expose ANY admin endpoint to create/update/delete Strapi content. The only Strapi caller is `getStrapi()` in `controllers/registration.controller.js:1088` invoked during the buyer registration flow.

---

## 7. Known Bugs / Gaps

### 7.1 Sidebar label mismatch with module name
Sidebar shows **"Config"** for route `/admin/cms`, while RBAC module name is `admin_cms` and frontend component is `Cms`. This will confuse manual testers searching for a "CMS" link.
// Source: source-code/admin-sm-cp-portal/src/components/common/navs/SideBar.jsx:78

### 7.2 Stale @route doc on allocation-campaign controller
Controller JSDoc says `POST /api/v1/admin/allocation-config` but route is actually `POST /api/v1/admin/allocation/campaigns`. Frontend URL constant `apiUrls.admin.updateAllocationConfig = '/api/v1/admin/allocation-config'` does not match any backend route — request will 404 unless rewritten elsewhere.
// Source: source-code/backend/src/controllers/allocation-campaign.controller.js:15 vs routes/admin/allocation/campaign.routes.js:43 vs Urls.js:85

### 7.3 `master_configs.key` UNIQUE conflicts with `project_id` separation
`key` is declared `unique: true` (model line 29) but the controller forces `projectId = 1 or 2` per environment. The same logical key cannot exist for two projects in the same DB.
// Source: source-code/backend/src/models/master-config.model.js:26-31 + controller line 19

### 7.4 `projectId` is ignored on store/retrieve
Although the validation schema (`storeMasterConfigSchema`) accepts a `projectId` field (validations line 95), the controller overwrites it with `app.production ? 1 : 2` (controller line 19, 70, 126). Any client-supplied `projectId` is silently discarded.

### 7.5 `value` validation says "required" in messages but is `.nullable()`
```js
// Source: source-code/backend/src/validations/master-config.validations.js:49-57
value: mixed().nullable().test(..., function (value) {
  if (value === undefined) return false; // value is required
```
Field is declared nullable, yet the test treats `undefined` as invalid. Inconsistent and confusing.

### 7.6 Strapi token missing only warned, never enforced
If `STRAPI_BEARER_TOKEN` is unset, the service prints `warn` at boot but every `getStrapiDetails()` call will still fire with `Authorization: Bearer undefined` and 401 silently.
// Source: source-code/backend/src/services/strapi.service.js:11-15 + 111-113

### 7.7 Strapi project ID is hardcoded
`/api/projects/1?populate=deep` is hardcoded; no multi-project support, no environment indirection.
// Source: source-code/backend/src/services/strapi.service.js:117

### 7.8 No file-size / MIME validation on Excel bulk uploads
`upload.single('doc')` uses defaults from `multerConfig.js`; no per-route size cap or MIME whitelist is defined for `cancel-units-excel`, `update-units-price`, `update-units-status`, `update-registrations-status`, `sales-managers-import`, `registration-units/refund-bulk`.
// Source: source-code/backend/src/routes/admin.routes.js:70, 108, 145, 149, 203, 134 (no validation middleware chain)

### 7.9 No audit trail visible for `customer-actions` and `max-preferences-per-unit` in source
Although `MasterConfig.auditEnabled = true` exists, no source code in the CMS path explicitly asserts audit-log emission on customer-actions / max-prefs updates.
// Source: NOT FOUND — verify in admin.controller.js for `updateCustomerActions` and `updateMaxPreferencesPerUnit`.

### 7.10 Frontend allocation time rules not enforced server-side
Min-start-time (now+15min), round-time multiples, and allocations-per-unit range (2-20) live only in `Cms.jsx`. A malicious / scripted POST to `/master-config/store` can set arbitrary values bypassing all UI guards.
// Source: source-code/admin-sm-cp-portal/src/routes/Private/admin/cms/Cms.jsx:37-181 (UI) vs validations/master-config.validations.js (no business-rule layer)

### 7.11 `restrictTo('admin')` is the only authorisation
RBAC migration creates fine-grained permissions (`admin_cms.add`, `.view`, `.edit`, `.delete`, `.submit`), but routes only check the coarse role string `'admin'`. Permission rows are inserted but never enforced on the endpoints.
// Source: source-code/backend/src/routes/admin.routes.js:53 vs migration:8-83

### 7.12 No "CMS" content endpoints at all
Searched for `banner`, `gallery`, `testimonial`, `content`, `media`, `cms` route handlers — none exist in `source-code/backend/src/controllers/` or `routes/`. If BRD specifies "CMS for banners/gallery/testimonials", it must be done in Strapi UI, not in the XR Portal admin.
// Source: NOT FOUND in `source-code/backend/src/controllers/` and `routes/` — verify with product owner whether this is acceptable scope or a missing feature.

---

## 8. QA Risk Areas

### 8.1 High-risk

1. **Label/concept confusion** — testers expecting a true CMS will not find it. Document clearly that `/admin/cms` is a Config/operations console.
2. **Allocation timing & round-time validation** — server-side has zero enforcement. Add boundary tests with `POST /api/v1/admin/master-config/store` payloads that violate UI rules (negative round time, end-before-start, non-multiple end time). Expect data corruption.
3. **Bulk Excel uploads** — no MIME/size validation. Test:
   - Upload large file (>50 MB) → expect server crash or hang
   - Upload non-XLSX (PDF, .exe renamed) → expect crash inside parser
   - Upload empty Excel → expect graceful error
4. **`master_configs.key` UNIQUE clash across projects** — if production seeds and dev seeds collide, store will throw `SequelizeUniqueConstraintError`.
5. **Strapi integration silent-failure** — when token expires, registration flow at `/api/v1/user/registrations` silently returns empty `filteredStrapiApartments` and rejects valid apartments as invalid.

### 8.2 Medium-risk

6. **Customer-actions toggle persistence** — JSON parsing in `Cms.jsx:362-363` (`typeof unitDet === 'string' ? JSON.parse(unitDet) : unitDet`) assumes either string or object — corrupted JSON in DB will throw at render.
7. **Project-ID override** — `app.production ? 1 : 2` is fragile; any new environment (staging, hotfix) defaults to 2 silently.
8. **Pagination on `GET /admin/master-config`** — `limit` query has no upper bound; `?limit=100000` may OOM.
9. **Sidebar permission gating** — verify the `Rbac` helper imported into `Cms.jsx:8` actually gates the action buttons; current code uses `actionMaster`/`moduleMaster` but action-level enforcement should be tested.

### 8.3 Low-risk

10. **Stale commented-out code blocks** in `Cms.jsx` (lines 22-35, 617-687, 1132-1180) make maintenance error-prone.
11. **Audit log emission** for customer-actions / max-prefs is unverified — test by mutating these settings and querying `audit_logs`.
12. **Strapi base URL default** points to `manage-dev.xrportal.in` even in production builds if env var unset.
// Source: source-code/backend/src/config/api.js:37

### 8.4 Out-of-scope for /admin/cms QA (per project Constraint #2)

- Strapi admin UI (creating banners, projects, content) — Strapi is excluded.
- Verify only the **downstream effect** of Strapi content in buyer portal: project name, apartment list, gallery images surfacing correctly. No tests should be written against Strapi APIs directly.

---
