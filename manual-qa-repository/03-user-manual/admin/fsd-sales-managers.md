# FSD — Admin Portal: Sales Managers Module

**Source-verified Feature Specification Document**
Every claim cites `// Source: file:line`. Derived exclusively from backend source code (no BRD/FRD).

Working directory: `D:\AI_Automation\xanadu - AI automation`
Backend root: `source-code/backend/src/`

API base mount: `/api/v1` (Source: `app.js:46`) → `/admin` (Source: `routes/index.js:73`) → `/sales-managers` (Source: `routes/admin.routes.js:206`).

---

## 1. Module Overview

The Sales Managers module under the Admin Portal allows users with `admin` role to manage two sub-roles of sales staff:

| Role | roleId | Name constant | Participates in ticket allocation? |
|------|--------|---------------|------------------------------------|
| Sales Manager Admin | `4` | `sales_manager_admin` | No — `isAvailable` is force-set to `0` |
| Sales Manager | `5` | `sales_manager` | Yes — controlled via `isAvailable` flag |

Sources:
- Role IDs: `constants/global.js:15-21` (`roleNameIdMap`)
- Force-zero rule: `services/sales-manager.service.js:124` and `:155`; `controllers/admin.controller.js:3878-3880`
- Module is mounted only when the requester passes `protect` then `restrictTo('admin')` (Source: `routes/admin.routes.js:53`)

There is **no `DELETE` endpoint**; deactivation is performed by setting `isActive=false` on update. The `User` model is `paranoid:true` so any soft-delete elsewhere uses `deletedAt` (Source: `models/user.model.js:343-344`).

---

## 2. Access Control & Authentication

All `/api/v1/admin/sales-managers/*` endpoints inherit two middlewares mounted at the parent router:

```js
// Source: routes/admin.routes.js:53
router.use(protect, restrictTo('admin'));
```

- `protect` — JWT auth (Source: `middleware/auth.middleware.js:23`)
- `restrictTo('admin')` — rejects any role other than `admin` with `HTTP 403 Forbidden` and body `{ message: 'Forbidden' }` (Source: `middleware/auth.middleware.js:102-109`)

Therefore: Sales Manager Admins (`roleId=4`) and Sales Managers (`roleId=5`) themselves **cannot** call these admin-side management endpoints. Only `admin` role (`roleId=1`) can manage sales managers.

---

## 3. REST API Endpoints

### 3.1 Single-record CRUD (routes file: `routes/admin/sales-manager.routes.js`)

| # | Method | Path | Controller | Validation schema | Source |
|---|--------|------|------------|-------------------|--------|
| 1 | GET | `/api/v1/admin/sales-managers/` | `getAllSalesManagers` | `getSalesManagersSchema` (query) | `routes/admin/sales-manager.routes.js:19` |
| 2 | GET | `/api/v1/admin/sales-managers/:id` | `getSalesManagerById` | `getSalesManagerByIdSchema` (params) | `routes/admin/sales-manager.routes.js:22` |
| 3 | POST | `/api/v1/admin/sales-managers/create` | `createSalesManager` | `createSalesManagerSchema` (body) | `routes/admin/sales-manager.routes.js:25` |
| 4 | PUT | `/api/v1/admin/sales-managers/update/:id` | `updateSalesManager` | `getSalesManagerByIdSchema` (params) + `updateSalesManagerSchema` (body) | `routes/admin/sales-manager.routes.js:28-32` |

### 3.2 Bulk Excel operations (declared on parent admin router)

| # | Method | Path | Controller | Notes | Source |
|---|--------|------|------------|-------|--------|
| 5 | GET | `/api/v1/admin/sales-manager-sample` | `AdminController.downloadSalesManagerSample` | Generates an Excel template seeded with existing SMs | `routes/admin.routes.js:202`; `controllers/admin.controller.js:3741` |
| 6 | POST | `/api/v1/admin/sales-managers-import` | `AdminController.uploadSalesManagers` | `multer` single file `doc` | `routes/admin.routes.js:203`; `controllers/admin.controller.js:3814` |

No `DELETE` route exists in the routes file (Source: `routes/admin/sales-manager.routes.js:1-33`).

---

## 4. Request / Response Contracts

### 4.1 `GET /api/v1/admin/sales-managers`

Query schema — `validations/sales-manager.validations.js:3-24`:

| Param | Type | Default | Constraints |
|-------|------|---------|-------------|
| `page` | integer | `1` | `min(1)`, nullable |
| `limit` | integer | `10` | `min(1)`, `max(100)`, nullable |
| `search` | string | — | trimmed, nullable |
| `isAvailable` | boolean | — | accepts `'true'`/`'false'`/`'null'` string transform |
| `isActive` | boolean | — | accepts `'true'`/`'false'`/`'null'` string transform |
| `roleId` | integer | `null` | nullable |

Service contract — `services/sales-manager.service.js:15-75`:

- Always filters to SM roles (4, 5) unless `roleId` is supplied, in which case ONLY that one role is matched (Source: `services/sales-manager.service.js:25-31`).
- `search` is a single `OR` across `firstName`, `lastName`, `email`, `phone` with `LIKE '%term%'` (Source: `services/sales-manager.service.js:34-44`).
- Returned attributes: `['id','firstName','lastName','email','phone','roleId','isAvailable','isActive','createdAt']` (Source: `services/sales-manager.service.js:61`).
- Ordering: `createdAt DESC` (Source: `services/sales-manager.service.js:62`).
- Response envelope on success:

```json
{
  "message": "Sales managers retrieved successfully",
  "data": {
    "data": [ /* user rows */ ],
    "pagination": {
      "currentPage": <int>,
      "totalPages": <int>,
      "totalRecords": <int>,
      "limit": <int>
    }
  }
}
```

Wrapper produced via `ApiResponse.success(...)` (Source: `controllers/admin-sales-manager.controller.js:23`).

### 4.2 `GET /api/v1/admin/sales-managers/:id`

- Path param `id` must be `positive integer`, required (Source: `validations/sales-manager.validations.js:26-28`).
- Lookup constrained to `roleId IN (4,5)` — if missing returns `ApiError.notFound('Sales Manager not found')` → HTTP 404 (Source: `services/sales-manager.service.js:82-95`).
- Returned attributes: `['id','firstName','lastName','email','phone','roleId','isActive','createdAt','updatedAt']` (note: `isAvailable` is NOT returned by the by-ID endpoint — verified at `services/sales-manager.service.js:88`).

### 4.3 `POST /api/v1/admin/sales-managers/create`

Body schema — `validations/sales-manager.validations.js:30-41`:

| Field | Type | Required | Rule |
|-------|------|----------|------|
| `firstName` | string trim | yes | "First name is required" |
| `lastName` | string trim | yes | "Last name is required" |
| `email` | string email | yes | "Invalid email format" / "Email is required" |
| `phone` | string trim | yes | "Phone is required" |
| `roleId` | integer | yes | `oneOf([4,5])` else "Role must be Sales Manager Admin (4) or Sales Manager (5)" |
| `isAvailable` | boolean | optional | default `true` |
| `isActive` | boolean | optional | default `true` |

Business logic (Source: `services/sales-manager.service.js:120-143`):

1. If `roleId === 4` (SM Admin) → `isAvailable` is overridden to `0` regardless of payload value (line 124).
2. Uniqueness check: `phoneExistsForRole(phone, roleId)` — same phone is allowed across different roles, but not within the same role (Source: `services/sales-manager.service.js:105-112`). On collision → `ApiError.conflict('Phone already exists for this role')` → HTTP 409.
3. `createdBy = req.user.id` captured from authenticated admin (Source: `controllers/admin-sales-manager.controller.js:72`).
4. Returns HTTP 201 with the newly created user (Source: `controllers/admin-sales-manager.controller.js:76`).

Note: `User.toJSON()` strips `password`, `otp`, `otpExpires`, `createdAt`, `updatedAt` from any serialised user (Source: `models/user.model.js:40-44`). No password is set on creation (the model allows `password: null` per `models/user.model.js:179-182`), consistent with OTP-only login.

### 4.4 `PUT /api/v1/admin/sales-managers/update/:id`

Body schema = `updateSalesManagerSchema` — identical to create schema (Source: `validations/sales-manager.validations.js:43-54`); all four name/email/phone/roleId fields remain required on update.

Business logic (Source: `services/sales-manager.service.js:151-180`):

1. Same SM-Admin force-zero rule for `isAvailable` (line 155).
2. Looked up via `User.findByPk(id)` — note this does **not** restrict to SM roles (Source: `services/sales-manager.service.js:158`). If not found → 404.
3. Phone uniqueness check fires only when phone changed: `phone !== user.phone && phoneExistsForRole(phone, roleId, id)` → HTTP 409 (Source: `services/sales-manager.service.js:165-167`). The `excludeId` clause prevents self-collision (Source: `services/sales-manager.service.js:107-109`).
4. Performs `user.update(...)` with the seven fields (firstName, lastName, email, phone, roleId, isAvailable, isActive) — no `updatedBy` written here (the bulk-import path does write it; see §6).

### 4.5 `GET /api/v1/admin/sales-manager-sample`

Source: `controllers/admin.controller.js:3741-3812`.

- Fetches all existing SMs where `roleId IN (4,5)` AND `deletedAt IS NULL`, ordered `createdAt DESC` (lines 3744-3751).
- Maps each row to: `role`, `first_name`, `last_name`, `email`, `phone`, `is_available`, `is_active` (lines 3754-3766).
- Role label resolution: roleId 4 → `'Sales Manager Admin'`, else `'Sales Manager'` (line 3757).
- `is_available` rule in template: SM Admin always `'0'`, else `'1'`/`'0'` based on stored value (line 3763).
- If no SMs exist yet, two demo rows are emitted — one SM (`is_available: '1'`) and one SM Admin (`is_available: '0'`) (lines 3769-3789).
- Output: XLSX, Content-Type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, filename `sales-managers-sample.xlsx` (lines 3805-3807).
- Excel columns: `ROLE | FIRST NAME | LAST NAME | EMAIL | PHONE | IS AVAILABLE | IS ACTIVE` (lines 3792-3800).

### 4.6 `POST /api/v1/admin/sales-managers-import`

Source: `controllers/admin.controller.js:3814-4023`.

Multipart form field name: `doc` (Source: `routes/admin.routes.js:203`).

Per-row processing rules:

1. Header keys are normalised: `toLowerCase()` and spaces → `_` (line 3839).
2. Required fields (per row): `role`, `first_name`, `last_name`, `email`, `phone`, `is_available`, `is_active` (lines 3843-3850). Missing → row error `"Missing required fields: ..."` (lines 3852-3857).
3. Role parsing (case-insensitive, trimmed, line 3862-3867):
   - `'sales manager'` → `roleId = 5`
   - `'sales manager admin'` → `roleId = 4`
   - Anything else → row error `"Invalid role: <X>. Valid roles are: Sales Manager, Sales Manager Admin"` (lines 3868-3875).
4. SM Admin force-zero override: if `roleId === 4`, the row's `is_available` is set to `0` before persistence (lines 3877-3880).
5. Phone validation: stripped to digits, must match `/^[0-9]{10}$/` else row error `"Invalid phone number format. Must be 10 digits"` (lines 3883-3891). **Note**: this is stricter than the JSON-create path, which has no phone-format constraint.
6. Existence check: `User.findOne` keyed on `(phone, roleId, deletedAt:null)` (lines 3893-3900).
7. If existing: compute `hasChanges` by comparing firstName / lastName / email / phone / isAvailable / isActive. Only `update` if any field changed; otherwise classified as `Unchanged` (lines 3914-3931).
8. If not existing: `User.create` with `createdBy = actorId` and `updatedBy = actorId` derived from `req.requestContext` (lines 3815, 3902-3912, 3932-3939).
9. Response: an XLSX result file echoing every row tagged with `status ∈ {Created, Updated, Unchanged, Error}` plus an `ERRORS` column (lines 3955-4017). Filename: `sales-managers-result.xlsx`.

Failure modes:
- Missing file → HTTP 400 `"No file uploaded"` (line 3818).
- Empty parsed sheet → HTTP 400 `"No data found in Excel file"` (line 3823).
- Top-level catch → HTTP 500 `"Failed to process sales managers upload"` (line 4021).

---

## 5. Data Model (User table, SM-relevant fields)

Source: `models/user.model.js`.

| Field | Type | Default / Constraint | SM relevance | Line |
|-------|------|----------------------|--------------|------|
| `id` | BIGINT UNSIGNED PK | autoIncrement | Primary key used in PUT/GET `:id` | 65-70 |
| `roleId` | BIGINT UNSIGNED | FK `roles.id`, NOT NULL | Discriminator between SM (5) / SM Admin (4) | 71-75 |
| `firstName` | VARCHAR(100) | nullable | Required in API | 98-100 |
| `lastName` | VARCHAR(100) | nullable | Required in API | 101-103 |
| `phone` | VARCHAR(15) | nullable | Required + uniqueness-per-role | 107-109 |
| `email` | VARCHAR(100) | nullable | Required in API | 116-118 |
| `password` | STRING | nullable | Not set during SM create (OTP-only login) | 179-182 |
| `isAvailable` | TINYINT UNSIGNED | NOT NULL, default `1`, comment `"Is available to assign tickets"` | Force-zero for SM Admin | 299-304 |
| `isActive` | BOOLEAN | default `true` | Toggled to deactivate an SM (no delete) | 305-308 |
| `lastRequestAssignedAt` | DATE | nullable, field `last_request_assigned_at`, comment `"Timestamp when this sales manager was last assigned a callback request (for round-robin)"` | Round-robin scheduling source-of-truth | 315-320 |
| `smUserId` | BIGINT UNSIGNED | nullable, comment `"Sales manager mapping for CP (users.id)"` | Self-join on User; assigns an SM to a CP | 294-298 |
| `createdBy` | INTEGER | nullable | Set to admin's `req.user.id` on create | 325-328 |
| `updatedBy` | INTEGER | nullable | Set ONLY by bulk-import path | 329-332 |
| `deletedAt` | DATE | nullable, `paranoid:true` | Used for soft-delete elsewhere; SM module doesn't trigger | 333-336, 343-344 |

Association used downstream: `User.belongsTo(User, { foreignKey: 'smUserId', as: 'smUser' })` (Source: `models/user.model.js:60`) and `User.hasMany(CallbackRequest, { foreignKey: 'managerId', as: 'CallbackRequests' })` (Source: `models/user.model.js:56-59`).

Role table (Source: `models/role.model.js`): `id`, `name` (unique, 2-50 chars), `description`, `isActive`, `createdBy`/`updatedBy`/`deletedAt`. The role module is `paranoid:true` (line 93).

---

## 6. Business Rules — Consolidated

| # | Rule | Source |
|---|------|--------|
| BR-SM-01 | Only admins (`roleId=1`) may invoke any sales-manager management endpoint. | `routes/admin.routes.js:53` + `middleware/auth.middleware.js:102-109` |
| BR-SM-02 | `roleId` must be exactly `4` (SM Admin) or `5` (SM) on both create and update. | `validations/sales-manager.validations.js:37`, `:50` |
| BR-SM-03 | An SM Admin's `isAvailable` is forcibly `0` on every write path (create, update, bulk-import). | `services/sales-manager.service.js:124`, `:155`; `controllers/admin.controller.js:3878-3880` |
| BR-SM-04 | Phone must be unique per role (same phone may belong to a SM and a SM Admin simultaneously). Collision returns 409. | `services/sales-manager.service.js:105-112`, `:127`, `:165-167` |
| BR-SM-05 | Listing always restricts to SM-family roles (4,5) — `roleId` filter narrows further but never widens. | `services/sales-manager.service.js:25-31` |
| BR-SM-06 | Listing sort is fixed: `createdAt DESC`. | `services/sales-manager.service.js:62` |
| BR-SM-07 | Pagination defaults: `page=1`, `limit=10`. `limit` capped at `100`. | `validations/sales-manager.validations.js:4-5` |
| BR-SM-08 | Search applies an `OR LIKE %term%` across `firstName`, `lastName`, `email`, `phone`. | `services/sales-manager.service.js:34-44` |
| BR-SM-09 | Bulk-import phone-format gate: 10 digits exactly after non-digit strip. | `controllers/admin.controller.js:3883-3891` |
| BR-SM-10 | Bulk-import "Unchanged" classification — row is skipped if all six comparable fields equal current values. | `controllers/admin.controller.js:3914-3931` |
| BR-SM-11 | No `DELETE` route exists; deactivation is `isActive=false` via PUT. | Absence in `routes/admin/sales-manager.routes.js` |
| BR-SM-12 | No password, no OTP, no welcome notification are dispatched on SM creation. | Absence verified in `services/sales-manager.service.js` (no notification / mailer / email imports — grep returned 0 matches) |

---

## 7. PII Masking

**No PII masking is performed by this module.** Verified:

- The service file contains no `mask`, `hide`, or `maskPii` helpers (grep on `services/sales-manager.service.js` returned 0 matches).
- `User.toJSON()` strips only `password`, `otp`, `otpExpires`, `createdAt`, `updatedAt` — phone and email are returned in full (Source: `models/user.model.js:40-44`).
- The list endpoint returns raw `email` and `phone` to admin (Source: `services/sales-manager.service.js:61`).
- The sample-download endpoint writes raw email and phone into the Excel buffer with no transformation (Source: `controllers/admin.controller.js:3759-3761`).

Implication: in this codebase the admin sees unmasked PII for all sales managers. If masking is intended, it is not yet implemented in source.

---

## 8. Cross-Module Interactions

### 8.1 Callback request round-robin assignment

The SM `isAvailable` flag and `lastRequestAssignedAt` timestamp are consumed by the callback-request assignment engine:

- **Least-recently-assigned strategy** — selects from `User WHERE roleId = sales_manager AND isActive = true AND isAvailable = true`, sorted `COALESCE(last_request_assigned_at, '1970-01-01') ASC`, then bumps `lastRequestAssignedAt = new Date()` on the chosen row. Sources: `services/callback-request.service.js:45-68`.
- **Least-loaded (capacity-based) strategy** — same WHERE clause, picks the SM with the fewest non-`CONFIRMED` callbacks; tie-broken by `lastRequestAssignedAt`. Source: `services/callback-request.service.js:78-128`.
- **Sticky reassignment** — when a previous request exists, the same SM is reused if still `isActive=true AND isAvailable=true`. Source: `services/callback-request.service.js:188-199`.

Consequence: setting an SM's `isAvailable=0` or `isActive=false` via PUT immediately removes them from the assignment pool. SM Admins (forced `isAvailable=0`) are structurally excluded.

### 8.2 SM-admin manual assignment

`PATCH /api/v1/sales-manager/admin/callback-requests/:id/assign` (Source: `controllers/callback-request-sm.controller.js:528-542`) routes to `assignCallbackRequest({ managerId, callbackRequestIds })`. The target manager must satisfy `{ id: managerId, roleId: roleNameIdMap.sales_manager }` else 404 `'Sales manager not found'` (Source: `services/callback-request-sm.service.js:1171-1176`).

`GET /api/v1/sales-manager/admin/callback-requests/assignable-users?role=<roleName>` returns SM and/or SM-Admin users (`roleId` IN [4,5] when role omitted) with attributes `id`, `role_id`, `firstName`, `lastName` (Source: `services/callback-request-sm.service.js:1158-1166`). Note this endpoint does **not** filter by `isActive` or `isAvailable`.

### 8.3 KPI exposure

`GET /api/v1/sales-manager/callback-requests/kpi` differentiates by role (Source: `controllers/callback-request-sm.controller.js:139-141`):

- SM Admin (`roleId === 4`) sees aggregated KPIs across all managers plus a `totalSM` count (`User.count({ isActive: true, roleId: 5 })`, line 302-305).
- SM (`roleId === 5`) sees KPIs filtered to their own `managerId` only (line 148-150).
- Any other role: `HTTP 403 Forbidden` "Access denied" (line 142-144).

### 8.4 CP linkage

The `User.smUserId` self-reference (Source: `models/user.model.js:294-298, 60`) is the mechanism by which Channel Partners are mapped to a sales manager. The admin-side SM module does NOT directly manage that mapping — it is consumed by CP-management flows (`controllers/admin-cp.controller.js`).

---

## Audit & Notifications (negative findings)

- No write to `AuditLog` is performed by the sales-manager service or admin-side SM controller (grep `AuditLog|audit-log|auditAction` against `services/sales-manager.service.js` returned 0 matches). The constant `auditActions` (`constants/global.js:111-124`) defines no SM-management action.
- No email, SMS, push, or in-app notification is triggered on create, update, or bulk import (grep `sendNotification|sendEmail|notify|mailer|emailService` against `services/sales-manager.service.js` returned 0 matches).
- `logger.info('Created new sales manager: ...')` / `'Updated existing sales manager: ...'` are written by the bulk-import path only (Source: `controllers/admin.controller.js:3927`, `:3930`, `:3938`).

---

## Error-Response Catalogue

| HTTP | Path(s) | Trigger | Body source |
|------|---------|---------|-------------|
| 400 | POST `/sales-managers-import` | No file uploaded | `controllers/admin.controller.js:3818` |
| 400 | POST `/sales-managers-import` | Excel empty | `controllers/admin.controller.js:3824` |
| 400 | any | Yup validation failure (e.g., `roleId` not in [4,5]) | `validations/sales-manager.validations.js:37` via `middleware/validateRequest.js` |
| 403 | any `/admin/*` | Caller role not `admin` | `middleware/auth.middleware.js:105` |
| 404 | GET `/sales-managers/:id` | No row with that id and `roleId IN (4,5)` | `services/sales-manager.service.js:91-93` |
| 404 | PUT `/sales-managers/update/:id` | No user with that id | `services/sales-manager.service.js:160-162` |
| 409 | POST `/sales-managers/create`, PUT `/sales-managers/update/:id` | Phone already used by another user in the same role | `services/sales-manager.service.js:128`, `:166` |
| 500 | any | Unhandled exception | `controllers/admin-sales-manager.controller.js:35, 62, 88, 115`; `controllers/admin.controller.js:3810, 4021` |

---

## Source File Inventory (files read for this FSD)

| Path | Lines read |
|------|-----------|
| `source-code/backend/src/controllers/admin-sales-manager.controller.js` | full (1-125) |
| `source-code/backend/src/services/sales-manager.service.js` | full (1-188) |
| `source-code/backend/src/routes/admin/sales-manager.routes.js` | full (1-33) |
| `source-code/backend/src/routes/admin.routes.js` | full (1-245) |
| `source-code/backend/src/validations/sales-manager.validations.js` | full (1-62) |
| `source-code/backend/src/constants/global.js` | full (1-210) |
| `source-code/backend/src/models/user.model.js` | full (1-360) |
| `source-code/backend/src/models/role.model.js` | full (1-98) |
| `source-code/backend/src/controllers/admin.controller.js` | bulk-import block 3741-4023 |
| `source-code/backend/src/controllers/callback-request-sm.controller.js` | full (1-657) — cross-module §8 |
| `source-code/backend/src/services/callback-request.service.js` | grep view 39-199 — round-robin §8.1 |
| `source-code/backend/src/services/callback-request-sm.service.js` | grep view 1158-1183 — §8.2 |
| `source-code/backend/src/middleware/auth.middleware.js` | grep view 95-151 — restrictTo |
| `source-code/backend/src/routes/index.js` | grep view 17,19,73 — mount path |
| `source-code/backend/src/app.js` | grep view 6,46 — API base |
