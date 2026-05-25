# FSD — Channel Partners Module (Admin Portal)

**Source-Code-Verified Feature Specification Document**

| Attribute | Value |
|---|---|
| Module | Admin Portal — Channel Partners (CP) Management |
| Backend root | `source-code/backend/src/` |
| Primary controller | `controllers/admin-cp.controller.js` (680 lines) |
| Primary validations | `validations/admin-cp.validations.js` |
| Route mount | `routes/admin.routes.js` lines 187–200 |
| Primary model | `models/user.model.js` (CP rows = `roleId = 3`) |
| Generated | 2026-05-22 |
| Proof discipline | Every claim cites `// Source: <file>:<line>`. Claims with no source code support are marked `not found in source code`. |

---

## 1. Module Overview

The Channel Partners module in the Admin Portal lets an authenticated admin user list, search/filter, view, and group Channel Partner accounts. A CP is a `User` row with `roleId = 3` and `isCpRegistrationCompleted = true`.
Source: `controllers/admin-cp.controller.js:33-35`, `constants/global.js:18`.

Grouping is done via a Master/Member/Standalone relationship implemented as a self-referencing FK on `users`:
- `isLeadCp` (boolean) — true => Master CP. Source: `models/user.model.js:278-283`.
- `leadCpId` (BIGINT FK -> `users.id`) — pointer to the Master. Source: `models/user.model.js:284-288`.
- `masterHvCode` (string) — denormalised HV code of the Master, for fast lookup. Source: `models/user.model.js:289-293`.

CP type derivation rule (single source of truth in the controller):
```
if isLeadCp                          -> 'master'
elif leadCpId is not null            -> 'member'
else                                  -> 'standalone'
```
Source: `controllers/admin-cp.controller.js:128-134` (list) and `:418-423` (detail).

**Out of scope (not implemented in `admin-cp.controller.js`):**
- CP create / approve / reject / activate / deactivate — not found in source code.
- CP delete — not found in source code.
- Notification / email / SMS / WhatsApp triggers from CP admin actions — not found in source code (verified by grep: no `notif|email.*send|sms|whatsapp|communication|notify` references in `admin-cp.controller.js`).
- Commission management from admin perspective — not found in source code under `admin-cp.controller.js`.
- Header count widgets / CP stats endpoint — not found in source code (no `/cp/count`, `/cp/stats`, `/cp/header` route in `admin.routes.js:187-200`; `count` in controller refers only to paginated `findAndCountAll` row count at `controllers/admin-cp.controller.js:163`).

---

## 2. Endpoints (Method + URL → Controller → Auth/Role)

All routes are mounted under `/api/v1/admin` (router scope from `routes/admin.routes.js`). The router applies global middleware before any CP route:

```
router.use(protect, restrictTo('admin'));
```
Source: `routes/admin.routes.js:53`.

This means every CP admin endpoint requires:
1. Valid JWT bearer / cookie session — Source: `middleware/auth.middleware.js:23-91`.
2. Authenticated user's `roleId` resolves to `'admin'` via `roleIdNameMap` — Source: `constants/global.js:23-29`, `middleware/auth.middleware.js:61`.

**Note on role scope:** The mounted middleware is `restrictTo('admin')` only. `sales_manager_admin` is NOT permitted on these CP admin endpoints — Source: `routes/admin.routes.js:53` (single-role string `'admin'`).

| # | Method | URL | Controller fn | Validation | Auth/Role |
|---|---|---|---|---|---|
| 1 | GET | `/api/v1/admin/cp` | `adminCpController.getAllCps` | `getAllCpsSchema` (query) | `protect` + `restrictTo('admin')` |
| 2 | GET | `/api/v1/admin/cp/masters` | `adminCpController.getMasterCps` | `getMasterCpsSchema` (query) | `protect` + `restrictTo('admin')` |
| 3 | GET | `/api/v1/admin/cp/:id` | `adminCpController.getCpById` | `getCpByIdSchema` (params) | `protect` + `restrictTo('admin')` |
| 4 | PUT | `/api/v1/admin/cp/:id/mark-master` | `adminCpController.markCpAsMaster` | `markCpAsMasterSchema` (params) | `protect` + `restrictTo('admin')` |
| 5 | PUT | `/api/v1/admin/cp/map-master` | `adminCpController.mapCpsToMaster` | `mapCpsToMasterSchema` (body) | `protect` + `restrictTo('admin')` |
| 6 | POST | `/api/v1/admin/cp/bulk-map-excel` | `adminCpController.bulkMapCpsByExcel` | `upload.single('doc')` (multer) | `protect` + `restrictTo('admin')` |

Source: `routes/admin.routes.js:187-200`.

---

## 3. Data Model — User table fields used by CP module

CP rows live in the `users` table (`roleId = 3`). Module-relevant columns:

| Field | Type | Constraints / Defaults | Purpose | Source |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED, PK, autoIncrement | NOT NULL | CP primary key | `user.model.js:65-70` |
| `roleId` | BIGINT UNSIGNED, FK -> roles.id | NOT NULL | `3` for CP | `user.model.js:71-75`, `constants/global.js:18` |
| `prospectId` | STRING(100) | nullable | LeadSquared prospect ID; used as a documents-present heuristic in `getCpById` (`hasDocuments = Boolean(cp.prospectId)`) — Source: `admin-cp.controller.js:425-426` | `user.model.js:80-83` |
| `hvCode` | STRING(50) | nullable, default null | HV identifier; must match `/^HV\d{8}$/` in admin flows — Source: `validations/admin-cp.validations.js:30`, `admin-cp.controller.js:216` | `user.model.js:88-92` |
| `encryptedHvCode` | STRING(255) | nullable | Encrypted HV code | `user.model.js:93-97` |
| `firstName`, `lastName` | STRING(100) | nullable | Used in `smName` join and master autocomplete label | `user.model.js:98-103` |
| `phone` | STRING(15) | nullable | List filter | `user.model.js:107-109` |
| `phone2` | STRING(15) | nullable | Returned on detail | `user.model.js:110-112` |
| `email`, `email2` | STRING(100) | nullable | Returned on list / detail | `user.model.js:116-121` |
| `ownerName` | STRING(100) | nullable | List filter `ownerName` | `user.model.js:122-124` |
| `orgName` | STRING(100) | nullable | List filter `firmName` | `user.model.js:125-127` |
| `panNumber` | STRING(10) | nullable | List/detail attribute | `user.model.js:128-130` |
| `reraNumber` | STRING(30) | nullable | List/detail attribute | `user.model.js:131-133` |
| `address` | STRING(255) | nullable | Detail | `user.model.js:134-136` |
| `businessRegion` | STRING(100) | nullable | List filter (CSV/array) and list attribute | `user.model.js:137-139` |
| `officePincode` | STRING(100) | nullable | List filter (mapped from query `pincode`) | `user.model.js:155-157` |
| `officeSuburb`, `officeCity`, `officeState`, `officeCountry` | STRING(100) | nullable | Detail-only fields | `user.model.js:164-178` |
| `isCpRegistrationCompleted` | BOOLEAN | (no default) | Gate for every CP-admin query — must be `true` | `user.model.js:275-277`, `admin-cp.controller.js:34` |
| `isLeadCp` | BOOLEAN | nullable, defaultValue `false` | Master CP flag | `user.model.js:278-283` |
| `leadCpId` | BIGINT UNSIGNED | nullable | FK to Master CP `users.id` | `user.model.js:284-288` |
| `masterHvCode` | STRING(50) | nullable | Denormalised Master HV for lookup | `user.model.js:289-293` |
| `smUserId` | BIGINT UNSIGNED | nullable | Sales Manager mapping (users.id) — populated `smUser` belongsTo association | `user.model.js:294-298` |

### Associations relevant to CP module

| Alias | Type | Target | Definition | Source |
|---|---|---|---|---|
| `masterCp` | belongsTo | `User` via `leadCpId` | self-FK to Master | `user.model.js:54` |
| `memberCps` | hasMany | `User` via `leadCpId` | reverse of above | `user.model.js:55` |
| `smUser` | belongsTo | `User` via `smUserId` | Sales Manager assigned to CP | `user.model.js:60` |

Listing eagerly loads `smUser` via `as: 'smUser'` to project Sales Manager name/email/phone alongside each CP. Source: `admin-cp.controller.js:123`.

### Model semantics

- `paranoid: true` => soft delete via `deletedAt`. Source: `user.model.js:333-336, 344`.
- `timestamps: true, underscored: true, tableName: 'users'`. Source: `user.model.js:341-343`.
- Sensitive fields (`password`, `otp`, `otpExpires`, `createdAt`, `updatedAt`) are stripped by `toJSON()`. Source: `user.model.js:40-44`.

---

## 4. Endpoint 1 — `GET /api/v1/admin/cp` (List CPs)

### Query parameters (validated by `getAllCpsSchema`)
Source: `validations/admin-cp.validations.js:3-15`.

| Param | Type | Default | Constraint |
|---|---|---|---|
| `page` | integer | 1 | `>= 1`, nullable |
| `limit` | integer | 10 | `1..100`, nullable |
| `phone` | string | — | trim, nullable |
| `firmName` | string | — | trim, nullable (matches `orgName`) |
| `ownerName` | string | — | trim, nullable |
| `hvCode` | string | — | trim, nullable |
| `pincode` | string | — | trim, nullable (matches `officePincode`) |
| `businessRegion` | string | — | trim, nullable; CSV or repeated -> `IN (...)` |
| `cpType` | string | — | nullable; CSV; tokens `master | member | standalone` |
| `masterHvCode` | string | — | trim, nullable; partial match |
| `masterId` | integer | — | positive, nullable; exact match on `leadCpId` |

### Filter construction
Base WHERE is always:
```js
{ roleId: roleNameIdMap.cp, isCpRegistrationCompleted: true }
```
Source: `admin-cp.controller.js:32-35`.

Per-filter behaviour (all `LIKE %val%` unless noted):

| Query field | Column | Operator | Source |
|---|---|---|---|
| `firmName` | `orgName` | `LIKE %v%` | `:39-41` |
| `ownerName` | `ownerName` | `LIKE %v%` | `:43-45` |
| `hvCode` | `hvCode` | `LIKE %v%` | `:47-49` |
| `phone` | `phone` | `LIKE %v%` | `:51-53` |
| `pincode` | `officePincode` | `LIKE %v%` | `:55-57` |
| `businessRegion` | `businessRegion` | `IN (csv|array)` | `:59-62` |
| `masterHvCode` | `masterHvCode` | `LIKE %v%` | `:89-93` |
| `masterId` | `leadCpId` | `=` | `:95-97` |

#### `cpType` filter — OR group, accepts multiple tokens
Source: `admin-cp.controller.js:65-86`.

| Token | Predicate added to OR group |
|---|---|
| `master` | `{ isLeadCp: true }` |
| `member` | `isLeadCp IN (false,null) AND leadCpId IS NOT NULL` |
| `standalone` | `isLeadCp IN (false,null) AND leadCpId IS NULL` |

All non-base conditions are wrapped in `{ [Op.and]: conditions }`. Source: `:99-101`.

### Eager load
```js
include: [{ model: User, as: 'smUser', attributes: ['id','firstName','lastName','email','phone'], required: false }]
```
Source: `:123`.

### Sort & paginate
Sort: `ORDER BY createdAt DESC`. Source: `:124`.
Pagination helper: `limitOffset(limit, page)` from `utils/helper.js`. Source: `:6, :103, :125`.

### Response shape
Source: `:128-166`.
```json
{
  "success": true,
  "message": "CPs retrieved successfully",
  "data": {
    "cps": [
      {
        "id": 1, "hvCode": "...", "orgName": "...", "ownerName": "...",
        "phone": "...", "email": "...",
        "smName": "First Last" | "-",
        "smEmail": "..." | "-",
        "smMobileNumber": "..." | "-",
        "businessRegion": "..." | "-",
        "pincode": "..." | "-",
        "masterHvCode": "..." | "-",
        "cpType": "master" | "member" | "standalone",
        "kycStatus": "pending",
        "createdAt": "..."
      }
    ],
    "pagination": { "currentPage": 1, "totalPages": N, "totalRecords": N, "limit": 10 }
  }
}
```

**Hard-coded behaviour to flag in test cases:**
- `kycStatus` is the literal string `"pending"` for every row — Source: `:153`. No KYC computation is wired in.
- `smName` falls back to `"-"` when no `smUser` is joined — Source: `:136-148`.

### Errors
- `500` `"Failed to fetch CPs"` on any caught error — Source: `:170-175`.

---

## 5. Endpoint 2 — `GET /api/v1/admin/cp/masters` (Master CP autocomplete)

### Validation
`getMasterCpsSchema`: `{ search?: string }`. Source: `validations/admin-cp.validations.js:33-35`.

### Logic
Source: `admin-cp.controller.js:632-671`.

WHERE:
```js
{ roleId: 3, isCpRegistrationCompleted: true, isLeadCp: true }
```
If `search` provided, ORs `hvCode LIKE %s%` and `firstName LIKE %s%` (note: `orgName`/`ownerName` are NOT searched).

Sort: `hvCode ASC`. Limit: hard-coded `50`. Attributes returned from DB: `id, hvCode, firstName, ownerName, orgName`.

### Response shape (autocomplete-friendly)
```json
[
  {
    "id": 1,
    "hvCode": "HV00000001",
    "firstName": "Foo" | "<ownerName>",
    "orgName": "Acme",
    "label": "HV00000001 - Foo (Acme)",
    "value": "HV00000001"
  }
]
```
Source: `:653-660`.

`label` building rule: `${hvCode} - ${firstName || ownerName}${orgName ? ` (${orgName})` : ''}`. Source: `:658`.

### Errors
- `500` `"Failed to fetch Master CPs"`. Source: `:663-668`.

---

## 6. Endpoint 3 — `GET /api/v1/admin/cp/:id` (CP detail)

### Validation
`getCpByIdSchema`: `{ id: positive integer, required }`. Source: `validations/admin-cp.validations.js:17-19`.

### Logic
Source: `admin-cp.controller.js:377-468`.

WHERE: `{ id, roleId: 3, isCpRegistrationCompleted: true }`. Source: `:382-386`.

Attributes selected (DB level): `id, hvCode, orgName, ownerName, firstName, phone, phone2, email, email2, address, businessRegion, officePincode, officeSuburb, officeCity, officeState, officeCountry, panNumber, reraNumber, isLeadCp, leadCpId, masterHvCode, prospectId, createdAt`. Source: `:387-411`.

If no row matches, returns `404 "CP not found"`. Source: `:414-416`.

### Derived/hard-coded fields in response
| Field | Derivation | Source |
|---|---|---|
| `cpType` | `master` if `isLeadCp`, else `member` if `leadCpId`, else `standalone` | `:418-423` |
| `masterHvCode` | DB value or `"-"` | `:448` |
| `businessRegion` | DB value or `"-"` | `:439` |
| `kycStatus` | hard-coded `"pending"` | `:449` |
| `documents.panDoc / gstDoc / reraDoc` | hard-coded `"Yes"`/`"No"` based on `Boolean(cp.prospectId)` | `:425-426, :450-454` |

### Errors
- `404` `"CP not found"` — Source: `:415`.
- `500` `"Failed to fetch CP details"` — Source: `:459-466`.

---

## 7. Endpoint 4 — `PUT /api/v1/admin/cp/:id/mark-master` (Promote CP to Master)

### Validation
`markCpAsMasterSchema`: `{ id: positive integer, required }`. Source: `validations/admin-cp.validations.js:21-23`.

### Logic (transactional)
Source: `admin-cp.controller.js:474-528`.

1. `BEGIN` Sequelize transaction. Source: `:475`.
2. Fetch CP `WHERE id = :id AND roleId = 3 AND isCpRegistrationCompleted = true` inside the txn. Source: `:480-487`.
3. If not found -> rollback + `404 "CP not found"`. Source: `:489-492`.
4. If `cp.isLeadCp === true` -> rollback + `400 "CP is already marked as Master"`. Source: `:494-497`.
5. **Promote in-place (self-mapping):**
   ```
   cp.isLeadCp     = true
   cp.leadCpId     = cp.id          // Master points to itself
   cp.masterHvCode = cp.hvCode      // and denormalises its own HV
   ```
   Source: `:500-502`. Same self-mapping pattern is used in bulk Excel flow at `:335-339`.
6. Save under txn, then commit. Source: `:504-505`.
7. Logs `'CP marked as Master'`. Source: `:507-511`.

### Response
```json
{ "success": true, "message": "CP marked as Master successfully", "data": { "id": 1, "hvCode": "HVxxxxxxxx", "isLeadCp": true } }
```
Source: `:513-517`.

### Errors
- `404` not found — `:491`.
- `400` already a master — `:496`.
- `500` `"Failed to mark CP as Master"` — `:519-526`.

---

## 8. Endpoint 5 — `PUT /api/v1/admin/cp/map-master` (Bulk map members to a Master)

### Validation
`mapCpsToMasterSchema` (body). Source: `validations/admin-cp.validations.js:25-31`.

| Field | Constraint |
|---|---|
| `cpIds` | `array<int positive>`, `min(1)`, required (`"At least one CP ID is required"`) |
| `masterHvCode` | string, trim, required, matches `/^HV\d{8}$/` (`"Invalid HV Code format"`) |

### Logic (transactional)
Source: `admin-cp.controller.js:534-626`.

1. `BEGIN` txn. Source: `:535`.
2. Find master: `WHERE hvCode = :masterHvCode AND roleId = 3 AND isCpRegistrationCompleted = true AND isLeadCp = true` under txn. Source: `:541-549`.
3. If master not found -> rollback + `400 "Invalid Master HV Code or CP is not marked as Master"`. Source: `:551-554`.
4. Find all CPs to map: `WHERE id IN (:cpIds) AND roleId = 3 AND isCpRegistrationCompleted = true` under txn. Source: `:557-564`.
5. If zero -> rollback + `400 "No valid CPs found to map"`. Source: `:566-569`.
6. Track missing: `missing = cpIds.filter(id => !foundIds.has(id))`. Source: `:574-576`.
7. For each candidate CP:
   - If `cp.id === masterCp.id` -> push error `"Cannot map CP to itself"` and `continue`. Source: `:579-583`.
   - If `cp.isLeadCp === true` -> push error `"Master CP cannot be mapped under another master"` and `continue`. Source: `:586-589`.
   - Else: set `cp.leadCpId = masterCp.id` and `cp.masterHvCode = masterCp.hvCode` and `save({transaction})`. **Overwrite is allowed** (re-mapping a member to a different master is supported). Source: `:591-594`, comment `:591`.
   - Push success entry `{ cpId, hvCode, mappedTo: masterCp.hvCode }`. Source: `:596-600`.
8. `COMMIT`. Source: `:603`. Log success/error counts. Source: `:605-610`.

### Response (HTTP 200, even if some rows failed)
```json
{
  "success": true,
  "message": "CP mapping completed",
  "data": {
    "successful": [ { "cpId": 1, "hvCode": "HV...", "mappedTo": "HV..." } ],
    "errors":     [ { "cpId": 2, "hvCode": "HV...", "error": "..." } ],
    "missing":    [ 999 ]
  }
}
```
Source: `:612-616`.

### Errors
- `400` invalid Master HV / not a master — `:553`.
- `400` no valid CPs found — `:568`.
- `500` `"Failed to map CPs to Master"` — `:619-624`.

---

## 9. Endpoint 6 — `POST /api/v1/admin/cp/bulk-map-excel` (Excel bulk Master/Member mapping)

### Request
- `multipart/form-data` with file field `doc` — Source: `routes/admin.routes.js:200` (`upload.single('doc')`).
- No body validator; multer parses the file.

### Excel format (rows are normalised to lower-case keys)
Source: `admin-cp.controller.js:196-213`.

| Column (case-insensitive) | Required | Format |
|---|---|---|
| `hvCode` | yes | `/^HV\d{8}$/`, uppercased after trim |
| `type` | yes | `master` or `member` (lower-cased after trim) |
| `masterHvCode` | required only when `type === 'member'` | `/^HV\d{8}$/`, uppercased after trim. For `type === master`, controller forces this to `null` regardless of input — Source: `:204-205` |

`rowNumber` is computed as `index + 2` to reflect spreadsheet rows (header on row 1). Source: `:208`.

### Stage A — Per-row format validation
Source: `:215-254`.

Errors emitted (per row, joined by `'; '`):
- `"HvCode is required"`
- `"Invalid HvCode format"`
- `"Type is required"`
- `"Type must be master or member"`
- `"MasterHvCode is required for member type"` (when `type === 'member'`)
- `"Invalid MasterHvCode format"` (when `type === 'member'`)
- `"Duplicate HvCode in Excel"` (case-insensitive HvCode uniqueness across the file)

### Stage B — DB cross-reference validation
Source: `:267-317`.

Looks up all `hvCode` values plus the referenced `masterHvCode` values: `WHERE hvCode IN (...) AND roleId = 3 AND isCpRegistrationCompleted = true`. Source: `:271-278`.

Then per row:
- `"CP not found for HvCode"` if HV is missing from DB result. Source: `:288-289`.
- `"CP is already a master"` if `type=master` and DB CP already `isLeadCp`. Source: `:290-292`.
- For `type=member`:
  - `"MasterHvCode not found"` if not in DB AND not declared as `master` in this same file. Source: `:295-299`.
  - `"MasterHvCode is not a master CP"` if found in DB but not `isLeadCp` AND not declared as `master` in this same file. Source: `:300-302`. (This means an in-file `master` row can promote a CP and be referenced by `member` rows in the same upload.)
  - `"Master CP cannot be mapped as member"` if the candidate is already `isLeadCp`. Source: `:305-307`.
  - `"Cannot map CP to itself"` if `cp.id === master.id`. Source: `:308-310`.

### Error response (download Excel of errors)
If Stage A OR Stage B produces any errors, controller builds an Excel `cp-bulk-errors.xlsx` with columns `hvCode, type, masterHvCode, error` and returns `HTTP 400` with the file as attachment.
Source: `:256-265` (Stage A), `:319-328` (Stage B).

Response headers set:
```
Content-Disposition: attachment; filename="<exportResult.filename>"
Access-Control-Expose-Headers: Content-Disposition
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

### Success path — DB writes (transactional)
Source: `:330-352`.

For each valid row, in the same transaction:
- `type === 'master'`:
  ```
  cp.isLeadCp     = true
  cp.leadCpId     = cp.id
  cp.masterHvCode = cp.hvCode
  ```
  Source: `:335-339`. (Self-mapping, same as single `mark-master` endpoint.)
- `type === 'member'`:
  ```
  cp.isLeadCp     = false
  cp.leadCpId     = master.id
  cp.masterHvCode = master.hvCode
  ```
  Source: `:342-347`.

All `save` promises are awaited via `Promise.all(updates)`, then `commit`. Source: `:351-352`.
Logs `'Bulk CP mapping completed'` with `total`. Source: `:354-357`.

### Success response
```json
{ "success": true, "message": "Bulk CP mapping completed successfully", "data": { "total": <rowCount> } }
```
Source: `:359-361`.

### Error responses
- `400 "No file uploaded"` when `req.file` missing. Source: `:187-189`.
- `400 "No data found in Excel file"` when rows parse to empty. Source: `:192-194`.
- `400` + downloaded `cp-bulk-errors.xlsx` for Stage A or Stage B failures (see above).
- `500 "Failed to bulk map CPs"` on any unhandled exception (txn rolled back). Source: `:362-369`.

---

## 10. Cross-cutting business rules (verified)

| Rule | Where enforced | Source |
|---|---|---|
| Only `roleId = 3` and `isCpRegistrationCompleted = true` rows are visible to any admin CP endpoint. | Base WHERE in all queries | `admin-cp.controller.js:33-35, :273-275, :383-385, :483-485, :545-548, :559-562` |
| Admin role required to reach any CP admin endpoint. | Router-level middleware | `routes/admin.routes.js:53` |
| Master CP is self-mapped (`leadCpId = id`, `masterHvCode = hvCode`). | `markCpAsMaster` + bulk Excel master rows | `admin-cp.controller.js:500-502, :336-338` |
| Member CP gets `isLeadCp = false`, `leadCpId = master.id`, `masterHvCode = master.hvCode`. | Bulk Excel member rows + single map (single map does NOT touch `isLeadCp`) | `:344-346`; single-map only writes `leadCpId` and `masterHvCode` at `:592-593` |
| Master cannot be downgraded / mapped under another Master. | `mapCpsToMaster` rejects with per-row error; bulk Excel rejects with per-row error | `:586-589, :305-307` |
| A CP cannot be mapped to itself. | `mapCpsToMaster` and bulk Excel both block | `:580-583, :308-310` |
| Re-mapping a member to a different master is allowed (overwrite). | `mapCpsToMaster` simply overwrites; bulk Excel updates without conflict check | `:591-594` (comment `// Map to master (overwrite allowed)`) |
| HvCode must match regex `^HV\d{8}$`. | Yup schema (`masterHvCode` in body) and per-row regex in Excel flow | `validations/admin-cp.validations.js:30`, `admin-cp.controller.js:216` |
| Excel `hvCode` is uppercased and de-duplicated case-insensitively across the file. | Pre-validation | `:202, :217, :242-249` |
| In bulk Excel, an in-file `master` row counts as a valid master target for `member` rows in the same upload. | Validation special-case | `:296, :300` |

---

## 11. Role restrictions — Admin vs SM Admin

- All six CP admin endpoints are mounted under a router that calls `restrictTo('admin')` — Source: `routes/admin.routes.js:53`.
- `restrictTo` accepts a variadic role list (`(...roles)`) — Source: `middleware/auth.middleware.js:102`.
- `'sales_manager_admin'` (role id `4`) is NOT in the allow-list for these endpoints — Source: `constants/global.js:19`, `routes/admin.routes.js:53`.

Conclusion: SM Admin has no access to the admin CP management endpoints in the current source. If/when SM Admin access is required, the router-level `restrictTo` call must be widened. (Sales Manager linkage on a CP IS surfaced via the `smUser` join in `getAllCps` — Source: `admin-cp.controller.js:123` — but this is read-only and only via the admin endpoint.)

---

## 12. Items explicitly NOT in source code

These were searched for and not implemented in the Channel Partners admin scope. Mark as out-of-scope in test design or raise as gaps:

| Topic | Evidence |
|---|---|
| Static header counts (e.g., total / masters / members tiles) | No such endpoint exists in `routes/admin.routes.js:187-200` and no aggregation query in `controllers/admin-cp.controller.js`. Only `findAndCountAll`'s row count is exposed inside paginated list response — Source: `:163`. |
| CP approval / rejection / status workflow | No status field beyond `isCpRegistrationCompleted` and `isActive` (general user field) referenced from this controller. No `approve/reject` endpoint exists for CP admin. CP-side `cp.controller.js` references "approve / reject" but only in **JBP Edit Request** context (`cp.controller.js:565-680, :1862, :2057`), not CP onboarding. |
| Commission management | Not found in source code under `admin-cp.controller.js` / `admin-cp.validations.js`. |
| Notifications (email / SMS / WhatsApp) on CP master/map actions | Not found in source code; controller imports only `User`, `ApiResponse`, `logger`, `limitOffset`, `roleNameIdMap`, `sequelize`, `excel utils`, and `export.helper`. No communication service import — Source: `admin-cp.controller.js:1-10`. |
| CP create / edit / soft-delete from admin | No such routes/handlers in `admin-cp.controller.js` exports — Source: `:673-680`. |
| KYC live status | `kycStatus` is hard-coded to `"pending"` in both list and detail responses — Source: `:153, :449`. |
| Documents content / blob URLs | `documents.panDoc/gstDoc/reraDoc` are hard-coded `"Yes"`/`"No"` strings derived from `Boolean(prospectId)` — Source: `:425-426, :450-454`. |

---

## 13. Traceability map

| Capability | Controller fn | Route line | Validator |
|---|---|---|---|
| List CPs with search + filters + pagination | `getAllCps` (`:16-177`) | `routes/admin.routes.js:187` | `getAllCpsSchema` |
| Get CP detail by id | `getCpById` (`:377-468`) | `routes/admin.routes.js:189` | `getCpByIdSchema` |
| Mark single CP as Master | `markCpAsMaster` (`:474-528`) | `routes/admin.routes.js:190-194` | `markCpAsMasterSchema` |
| Bulk map members to a Master via API | `mapCpsToMaster` (`:534-626`) | `routes/admin.routes.js:195-199` | `mapCpsToMasterSchema` |
| Master CP autocomplete list | `getMasterCps` (`:632-671`) | `routes/admin.routes.js:188` | `getMasterCpsSchema` |
| Bulk Master/Member mapping via Excel upload | `bulkMapCpsByExcel` (`:183-371`) | `routes/admin.routes.js:200` | multer `upload.single('doc')` |

---

## 14. Suggested test focus areas (derived from source, no assumptions)

1. WHERE base filter: any CP row with `isCpRegistrationCompleted = false` must be invisible to every endpoint (positive + negative).
2. `cpType` query token combinations (`master,member`, `member,standalone`, etc.) must produce correct OR-grouped results — Source: `:65-86`.
3. `mark-master` idempotency — 2nd call returns `400 "CP is already marked as Master"`.
4. `map-master` partial-success behaviour — successful + errors + missing arrays in same 200 response.
5. `map-master` overwrite semantics — re-mapping an existing member to a different master succeeds.
6. `map-master` rejects when target HV is not currently a master.
7. Bulk Excel: Stage A failure returns an `xlsx` attachment, not JSON. Verify `Content-Disposition` and `Content-Type` headers.
8. Bulk Excel: in-file `master` row should be acceptable as a `masterHvCode` reference in the same file even if DB row is not yet a master.
9. Bulk Excel: duplicate HV in file is rejected case-insensitively.
10. Bulk Excel: missing `req.file` -> 400; empty parsed rows -> 400.
11. `getCpById` hard-coded `documents.*` toggles on `prospectId` presence — verify both states.
12. `kycStatus` literal `"pending"` always present in list and detail.
13. RBAC: `sales_manager_admin` and `cp` users must receive `403` from `restrictTo('admin')` at `routes/admin.routes.js:53`.

---

**End of FSD — Channel Partners (Admin Portal). All claims sourced. Items marked "not found in source code" are gaps, not implementations.**
