# Feature Specification Document — Admin Portal: Offers

> Source-code-verified FSD. Every claim cites `// Source: path:line` against `source-code/backend/src/`. No BRD/FRD inputs.

---

## 1. Module Overview

The Offers module lets an admin define project-level discounts that buyers can opt into during the allocation/payment flow. Two related tables drive the feature:

- `offers` — admin-managed catalog of discount definitions per project. // Source: source-code/backend/src/models/offer.model.js:32-112
- `registration_unit_offers` — join table that records which offers were actually applied to a specific buyer registration unit, snapshotting the discount amount/percentage at apply-time. // Source: source-code/backend/src/models/registration-unit-offer.model.js:27-71

Two offer "shapes" exist:

- **Generic offer** — flat `AMOUNT` or `PERCENTAGE` discount. // Source: source-code/backend/src/services/offer.service.js:66-67
- **Conditional/coded offer** — offer carries an `offerCode` enum (`HOME_LOAN` or `VC_REQUEST`) that gates eligibility for the buyer at selection time. The admin **cannot set `offerCode` through the public APIs** (see Section 8, GAP-1). // Source: source-code/backend/src/models/offer.model.js:52-55, source-code/backend/src/validations/admin.validations.js:341-365

Routing base path: `/api/v1/admin/offers` — mounted via `router.use('/offers', offersRoutes)`. // Source: source-code/backend/src/routes/admin.routes.js:57

All five endpoints sit behind the admin guard chain `protect, restrictTo('admin')` applied at the parent router. // Source: source-code/backend/src/routes/admin.routes.js:53

---

## 2. API Reference Table

| # | Method | Path | Controller | Service | Validation | Auth |
|---|--------|------|------------|---------|------------|------|
| 1 | GET | `/api/v1/admin/offers` | `getOffers` // Source: source-code/backend/src/controllers/offer.controller.js:11 | `listOffers` // Source: source-code/backend/src/services/offer.service.js:9 | `getOffersSchema` (query) // Source: source-code/backend/src/validations/admin.validations.js:393-397 | `protect` + `restrictTo('admin')` // Source: source-code/backend/src/routes/admin.routes.js:53 |
| 2 | POST | `/api/v1/admin/offers` | `createOffer` // Source: source-code/backend/src/controllers/offer.controller.js:35 | `createOffer` // Source: source-code/backend/src/services/offer.service.js:39 | `createOfferSchema` (body) // Source: source-code/backend/src/validations/admin.validations.js:341-365 | `protect` + `restrictTo('admin')` |
| 3 | PUT | `/api/v1/admin/offers/:id` | `updateOffer` // Source: source-code/backend/src/controllers/offer.controller.js:80 | `editOffer` // Source: source-code/backend/src/services/offer.service.js:82 | `updateOfferSchema` (body) // Source: source-code/backend/src/validations/admin.validations.js:367-391 | `protect` + `restrictTo('admin')` |
| 4 | PATCH | `/api/v1/admin/offers/:id/toggle` | `toggleOfferStatus` // Source: source-code/backend/src/controllers/offer.controller.js:126 | `toggleOfferStatus` // Source: source-code/backend/src/services/offer.service.js:145 | **none** // Source: source-code/backend/src/routes/admin/offers.routes.js:11 | `protect` + `restrictTo('admin')` |
| 5 | DELETE | `/api/v1/admin/offers/:id` | `deleteOffer` // Source: source-code/backend/src/controllers/offer.controller.js:146 | `deleteOffer` // Source: source-code/backend/src/services/offer.service.js:129 | **none** // Source: source-code/backend/src/routes/admin/offers.routes.js:12 | `protect` + `restrictTo('admin')` |

Route file: `source-code/backend/src/routes/admin/offers.routes.js`.

---

## 3. Feature Details

### 3.1 List Offers — `GET /api/v1/admin/offers`

**Query params** (validated): // Source: source-code/backend/src/validations/admin.validations.js:393-397
- `projectId` — required string (the public/business projectId, not the numeric PK).
- `page` — integer ≥ 1, default `1`.
- `limit` — integer 1..100, default `10`.

**Flow**:
1. Pagination is parsed via `limitOffset(limit, page)`. // Source: source-code/backend/src/services/offer.service.js:10
2. `Project.findOne({ where: { projectId } })` resolves the public ID to the numeric PK. If not found → `ApiError.notFound('Project not found')`. // Source: source-code/backend/src/services/offer.service.js:13-17
3. `Offer.findAndCountAll` is run with `where: { projectId: project.id }`, ordered `id DESC`, and includes the `creator` user (`id, firstName, lastName, email`). // Source: source-code/backend/src/services/offer.service.js:19-31
4. Because the model is `paranoid: true`, soft-deleted offers are automatically excluded. // Source: source-code/backend/src/models/offer.model.js:110
5. Response shape: `{ offers, totalCount, totalPages, currentPage }` wrapped in `ApiResponse.success(...)` with HTTP 200. // Source: source-code/backend/src/services/offer.service.js:33, source-code/backend/src/controllers/offer.controller.js:21

### 3.2 Create Offer — `POST /api/v1/admin/offers`

**Body** (validated by `createOfferSchema`): `projectId` (string, required), `unitTypologyId` (string, nullable), `name` (string ≤100, required), `description` (string ≤500, nullable), `offerType` (`'AMOUNT'`|`'PERCENTAGE'`, required), `amount` (number ≥0, required when `offerType === 'AMOUNT'`), `percentage` (number 0..100, required when `offerType === 'PERCENTAGE'`), `startDate` (string, required), `endDate` (string, required), `isActive` (boolean, default `true`). // Source: source-code/backend/src/validations/admin.validations.js:341-365

**Notably NOT accepted**: `offerCode` is absent from the body schema. // Source: source-code/backend/src/validations/admin.validations.js:341-365

**Flow**: // Source: source-code/backend/src/services/offer.service.js:39-77
1. Resolve `projectId` → numeric PK via `Project.findOne`; 404 if missing.
2. `Offer.create` with these write-time normalizations:
   - `amount = offerType === 'AMOUNT' ? amount : null` — // Source: source-code/backend/src/services/offer.service.js:66
   - `percentage = offerType === 'PERCENTAGE' ? percentage : null` — // Source: source-code/backend/src/services/offer.service.js:67
   - `createdBy = req.user?.id` // Source: source-code/backend/src/controllers/offer.controller.js:63
3. `logger.info('Offer created successfully', { offerId })`. // Source: source-code/backend/src/services/offer.service.js:74
4. Response: HTTP 201, returns the created row. // Source: source-code/backend/src/controllers/offer.controller.js:66

### 3.3 Update Offer — `PUT /api/v1/admin/offers/:id`

**Body** (validated by `updateOfferSchema`) — schema is **identical** to `createOfferSchema` (all fields required again, including dates). PUT is a full replace. // Source: source-code/backend/src/validations/admin.validations.js:367-391

**Flow**: // Source: source-code/backend/src/services/offer.service.js:82-124
1. `Offer.findByPk(offerId)` → 404 if missing.
2. Validate project exists → 404 if missing.
3. `offer.update(...)` applies the same `amount`/`percentage` mutual-exclusion as create. // Source: source-code/backend/src/services/offer.service.js:114-115
4. The controller passes `updatedBy: req.user?.id` to the service, but the service signature **does not destructure or persist `updatedBy`** — so the auditing field is dropped silently. // Source: source-code/backend/src/controllers/offer.controller.js:109, source-code/backend/src/services/offer.service.js:82-95
5. `:id` path parameter is **not schema-validated** (no `params:` validator on this route). // Source: source-code/backend/src/routes/admin/offers.routes.js:10
6. Response: HTTP 200 with the updated row.

### 3.4 Toggle Active Status — `PATCH /api/v1/admin/offers/:id/toggle`

**Body**: none. **Validation**: none on this route. // Source: source-code/backend/src/routes/admin/offers.routes.js:11

**Flow**: // Source: source-code/backend/src/services/offer.service.js:145-157
1. `Offer.findByPk(offerId)` → 404 if missing.
2. `offer.isActive = !offer.isActive`; `await offer.save()`.
3. `logger.info('Offer status toggled', { offerId, isActive })`.
4. Response: HTTP 200, returns the offer with the new `isActive`.

**No actor recorded**: controller does not pass `req.user?.id`, service does not write any audit field; only the logger captures the event. // Source: source-code/backend/src/controllers/offer.controller.js:126-140, source-code/backend/src/services/offer.service.js:145-157

### 3.5 Delete Offer — `DELETE /api/v1/admin/offers/:id`

**Body**: none. **Validation**: none on this route. // Source: source-code/backend/src/routes/admin/offers.routes.js:12

**Flow**: // Source: source-code/backend/src/services/offer.service.js:129-140
1. `Offer.findByPk(offerId)` → 404 if missing.
2. `await offer.destroy()` — because `paranoid: true` on the model, this is a **soft delete** that sets `deletedAt`. // Source: source-code/backend/src/models/offer.model.js:110, source-code/backend/src/services/offer.service.js:135
3. Response: HTTP 200, `{ id: offerId }`.

**No actor recorded**: neither `deletedBy` column exists nor is any user id passed through. // Source: source-code/backend/src/services/offer.service.js:129-140, source-code/backend/src/models/offer.model.js:32-112

---

## 4. Data Models

### 4.1 `offers` (model: `Offer`) — `source-code/backend/src/models/offer.model.js`

| Field | Type | Nullable | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | BIGINT UNSIGNED | no | autoIncrement | PK // Source: source-code/backend/src/models/offer.model.js:34-39 |
| `projectId` | BIGINT UNSIGNED | no | — | FK → `projects.id` // Source: source-code/backend/src/models/offer.model.js:40-43, source-code/backend/src/migrations/20260401100001-create-offers-tables.cjs:15-19 |
| `unitTypologyId` | BIGINT UNSIGNED | yes | — | Declared in model but **NOT created by migration** (see GAP-2). // Source: source-code/backend/src/models/offer.model.js:44-47, source-code/backend/src/migrations/20260401100001-create-offers-tables.cjs:8-76 |
| `name` | STRING(100) | no | — | // Source: source-code/backend/src/models/offer.model.js:48-51 |
| `offerCode` | ENUM('HOME_LOAN','VC_REQUEST') | yes | — | Drives conditional eligibility. // Source: source-code/backend/src/models/offer.model.js:52-55 |
| `description` | STRING(500) | yes | — | // Source: source-code/backend/src/models/offer.model.js:56-59 |
| `offerType` | ENUM('AMOUNT','PERCENTAGE') | no | `'AMOUNT'` | // Source: source-code/backend/src/models/offer.model.js:60-65 |
| `amount` | DECIMAL(10,2) | yes | — | Set only when `offerType === 'AMOUNT'`; service nullifies otherwise. // Source: source-code/backend/src/services/offer.service.js:66 |
| `percentage` | DECIMAL(10,2) | yes | — | Set only when `offerType === 'PERCENTAGE'`. // Source: source-code/backend/src/services/offer.service.js:67 |
| `startDate` | DATE | no | — | // Source: source-code/backend/src/models/offer.model.js:74-77 |
| `endDate` | DATE | no | — | // Source: source-code/backend/src/models/offer.model.js:78-81 |
| `isActive` | BOOLEAN | no | `true` | // Source: source-code/backend/src/models/offer.model.js:82-86 |
| `createdBy` | BIGINT UNSIGNED | yes | — | FK → `users.id` (migration). // Source: source-code/backend/src/migrations/20260401100001-create-offers-tables.cjs:59-63 |
| `createdAt`/`updatedAt` | DATE | no | — | `timestamps: true`. // Source: source-code/backend/src/models/offer.model.js:108 |
| `deletedAt` | DATE | yes | — | `paranoid: true` → soft delete. // Source: source-code/backend/src/models/offer.model.js:99-102, 110 |

Indexes (from migration): `idx_offers_project_id` on `project_id`, `idx_offers_is_active` on `is_active`. // Source: source-code/backend/src/migrations/20260401100001-create-offers-tables.cjs:119-120

Associations: // Source: source-code/backend/src/models/offer.model.js:14-29
- `Offer.belongsTo(Project, { foreignKey: 'projectId', as: 'project' })`
- `Offer.belongsTo(User,    { foreignKey: 'createdBy', as: 'creator' })`
- `Offer.hasMany(RegistrationUnitOffer, { foreignKey: 'offerId', as: 'registrationUnitOffers' })`

### 4.2 `registration_unit_offers` (model: `RegistrationUnitOffer`)

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | INTEGER UNSIGNED | no | PK (model says INTEGER; migration says BIGINT — see GAP-3). // Source: source-code/backend/src/models/registration-unit-offer.model.js:29-34, source-code/backend/src/migrations/20260401100001-create-offers-tables.cjs:79-84 |
| `registrationUnitId` | BIGINT UNSIGNED | no | Model says non-null. Migration FK uses `INTEGER UNSIGNED` (see GAP-3). // Source: source-code/backend/src/models/registration-unit-offer.model.js:35-38, source-code/backend/src/migrations/20260401100001-create-offers-tables.cjs:85-89 |
| `offerId` | BIGINT UNSIGNED | model: no / migration: yes | FK → `offers.id` with `onDelete: 'SET NULL'`. // Source: source-code/backend/src/models/registration-unit-offer.model.js:39-42, source-code/backend/src/migrations/20260401100001-create-offers-tables.cjs:90-96 |
| `amount` | DECIMAL(10,2) | yes | Snapshot of fixed-amount discount at apply time. // Source: source-code/backend/src/models/registration-unit-offer.model.js:43-46 |
| `percentage` | DECIMAL(10,2) | yes | Snapshot of percentage at apply time. // Source: source-code/backend/src/models/registration-unit-offer.model.js:47-50 |
| `createdAt`/`updatedAt`/`deletedAt` | DATE | — | Paranoid soft-delete. // Source: source-code/backend/src/models/registration-unit-offer.model.js:51-71 |

Associations: // Source: source-code/backend/src/models/registration-unit-offer.model.js:14-24
- `RegistrationUnitOffer.belongsTo(RegistrationUnit, { foreignKey: 'registrationUnitId', as: 'registrationUnit' })`
- `RegistrationUnitOffer.belongsTo(Offer,           { foreignKey: 'offerId',           as: 'offer' })`

Indexes: `idx_ruo_registration_unit_id`, `idx_ruo_offer_id`. // Source: source-code/backend/src/migrations/20260401100001-create-offers-tables.cjs:121-122

### 4.3 Seed Data — // Source: source-code/backend/src/migrations/20260415150000-insert-offers.cjs

Seeds two `AMOUNT`-type offers per project for projects `1` and `2`:
- `Home Loan Discount` — `offerCode: 'HOME_LOAN'`, `amount: 10000.00` // lines 12-26, 44-58
- `VC Request Discount` — `offerCode: 'VC_REQUEST'`, `amount: 50000.00` // lines 28-42, 60-74

`startDate = now`, `endDate = now + 1 year`, `isActive = true`, `createdBy = null`. Skipped if `(project_id, offer_code)` already exists. // Source: source-code/backend/src/migrations/20260415150000-insert-offers.cjs:77-86

---

## 5. Role & Permission Matrix

| Action | Required Role | Enforcement |
|--------|---------------|-------------|
| Any `/api/v1/admin/offers/*` call | authenticated user with role `admin` | `router.use(protect, restrictTo('admin'))` // Source: source-code/backend/src/routes/admin.routes.js:53 |
| Per-endpoint extra role check | none | Not present in `offers.routes.js`. // Source: source-code/backend/src/routes/admin/offers.routes.js:1-15 |

`restrictTo` is defined at `source-code/backend/src/middleware/auth.middleware.js:102`. No sub-role gradations (e.g., maker/checker) for offers.

---

## 6. Offer Application Flow at Payment / Allocation Time

Offers are not applied via the offer controller — they are applied during the allocation/booking pipeline in `allocation.service.js` using the buyer-selected `offerIds`.

### 6.1 Selection & Apply — `processOffers`

// Source: source-code/backend/src/services/allocation.service.js:3955-4012

```
async function processOffers({ offerIds, registrationUnitId, agreementValue })
```

1. If `offerIds` is empty → returns `{ offerDiscountAmount: 0, homeLoanDiscountAmount: 0, offerData: [] }`. // line 3960-3962
2. Computes `startOfDay`/`endOfDay` (midnight bounds of today). // lines 3964-3965
3. Loads matching offers with `WHERE id IN (offerIds) AND isActive=1 AND startDate <= endOfDay AND endDate >= startOfDay`. // lines 3967-3975
4. For each loaded offer, computes `discount`:
   - `PERCENTAGE` → `(agreementValue * percentage) / 100` // line 3989
   - `AMOUNT` → `amount` // line 3989
5. Routes the discount based on `offerCode`:
   - `offer.offerCode === 'HOME_LOAN'` → assigned to `homeLoanDiscountAmount` (overwrites; only one home-loan offer is honored per call). // lines 3993-3994
   - any other code (including `VC_REQUEST`, `null`) → **summed** into `offerDiscountAmount`. // lines 3995-3997
6. Builds `offerData[]` rows for bulk insert into `registration_unit_offers`, snapshotting either `amount` (if AMOUNT) or `percentage` (if PERCENTAGE). // lines 3999-4004

The caller persists `offerData` via `RegistrationUnitOffer.bulkCreate(offerData, { transaction })` once units are finalized. // Source: source-code/backend/src/services/allocation.service.js:1062-1064

### 6.2 Re-reading Applied Offers — `getStoredOfferDiscounts`

// Source: source-code/backend/src/services/allocation.service.js:4014-4038

Reads all `RegistrationUnitOffer` rows for a `registrationUnitId`, joining `Offer` (paranoid: false, so soft-deleted offers still resolve their `offerCode`). For each row:
- `discount = amount || (percentage/100 * agreementValue)` // line 4028
- HOME_LOAN routes to `homeLoanDiscountAmount`; everything else aggregates into `offerDiscountAmount`. // lines 4030-4034

Used in pricing recalculations across `allocation.service.js` (lines 2629, 2792, 3260, 3625).

### 6.3 Final Pricing — `calculatePricingDetails`

// Source: source-code/backend/src/services/allocation.service.js:2532-2550

```
totalDiscount = earlyBirdDiscount
              + (hasHomeLoan ? homeLoanDiscount : 0)
              + offerDiscountAmount
finalAgreementValue = agreementValue + parkingAmount - totalDiscount
```

`hasHomeLoan = Boolean(registration.HomeLoan?.id)` — i.e., the registration record must have an associated `HomeLoan` row. The home-loan discount is silently dropped if the buyer has no home-loan registered. // lines 559, 969, 1507, 2548, 2628, 3259, 3624

### 6.4 Buyer-Side Eligibility — `common.service.js`

When the buyer/admin fetches unit details for selection (`userUnitToBuy`, `unitDetails`, etc.), the API filters the offer catalog by eligibility before exposing it: // Source: source-code/backend/src/services/common.service.js:42, 161-201, 305

- `excludedOfferCodes = []`
- If there is no `CallbackRequest` for the user → push `'VC_REQUEST'`. // lines 168-174
- If there is no `HomeLoan` on the registration (`hasHomeLoan` false) → push `'HOME_LOAN'`. // lines 176-178
- Where clause becomes: `isActive=1`, `projectId=...`, **and** `offerCode NOT IN excluded OR offerCode IS NULL` (so non-coded generic offers remain visible). // lines 180-196
- The same exclusion pattern is repeated at lines 608-624.

When the buyer commits, `homeLoanDiscount` is only applied if `hasHomeLoan && homeLoanOffer` (lines 211-218). Non-HOME_LOAN selected offers are summed (lines 220-228) — `HOME_LOAN` is explicitly skipped from the generic loop (`if (offer.offerCode === 'HOME_LOAN') continue;`, line 222) and handled separately.

### 6.5 HOME_LOAN Eligibility — relation to `loanApprovalStatus`

The "buyer has a home loan" predicate used by allocation is `Boolean(registration.HomeLoan?.id)`. // Source: source-code/backend/src/services/allocation.service.js:559, 969, 1507, 2628, 3259, 3624

Separately, registrations include a HomeLoan **only** when it satisfies one of two states (used as a `WHERE` on the `HomeLoan` include): // Source: source-code/backend/src/services/allocation.service.js:495-498, 866-868, 2071-2073
```
(status = 'completed' AND loanApprovalStatus != 'admin_rejected')
OR loanApprovalStatus = 'admin_approved'
```
So the effective rule is: a `HOME_LOAN` offer counts only when the buyer's HomeLoan is in the above admin-acceptable state and is therefore attached to the registration.

---

## 7. Integration Points

- **Admin route mount** — `/api/v1/admin/offers` is mounted by the admin router behind `protect, restrictTo('admin')`. // Source: source-code/backend/src/routes/admin.routes.js:53, 57
- **Project** — every offer is scoped by `projectId`; service requires the project to exist. // Source: source-code/backend/src/services/offer.service.js:13-17, 53-57, 101-105
- **User (admin)** — `createdBy = req.user?.id` is stamped on creation. // Source: source-code/backend/src/controllers/offer.controller.js:63
- **Allocation pipeline** — `processOffers` and `getStoredOfferDiscounts` consume `Offer` and write/read `RegistrationUnitOffer`. // Source: source-code/backend/src/services/allocation.service.js:3955, 4014
- **Buyer catalog (common.service.js)** — exposes eligible offers and computes preview discounts. // Source: source-code/backend/src/services/common.service.js:42, 305
- **HomeLoan** — gates `HOME_LOAN` offer eligibility through `registration.HomeLoan?.id`. // Source: source-code/backend/src/services/allocation.service.js:559, 969
- **CallbackRequest** — gates `VC_REQUEST` offer eligibility. // Source: source-code/backend/src/services/common.service.js:168-174
- **Notifications / cron / workers** — no offer references. // Source: grep across `source-code/backend/src/workers/` returned zero matches; offer.controller/service only emit `logger.info`/`logger.error` calls (controller lines 26, 71, 117, 137, 157; service lines 74, 121, 137, 154). No email/SMS/WhatsApp/push hooks present.

---

## 8. Edge Cases & Known Constraints (Source-Verified Gaps)

| Gap ID | Severity | Description | Source |
|--------|----------|-------------|--------|
| GAP-1 | High | `offerCode` (`HOME_LOAN`/`VC_REQUEST`) is **not in `createOfferSchema` or `updateOfferSchema`** and is **not destructured** in `createOffer`/`editOffer` services. Admins cannot create, switch, or change an offer's `offerCode` via the public API. Only the seed migration sets `offerCode`. | source-code/backend/src/validations/admin.validations.js:341-391, source-code/backend/src/services/offer.service.js:39-77, 82-124, source-code/backend/src/migrations/20260415150000-insert-offers.cjs |
| GAP-2 (scalar typology issue) | High | `unitTypologyId` is declared on the model and accepted by validation (`string().nullable()`) and persisted by services, but the migration that creates the `offers` table does **not** create this column. Persisting offers with `unitTypologyId` will fail unless a follow-up migration adds it. Additionally, the field is `BIGINT UNSIGNED` per model but the validation expects a string, so admins must pass IDs as strings. | source-code/backend/src/models/offer.model.js:44-47, source-code/backend/src/migrations/20260401100001-create-offers-tables.cjs:8-76, source-code/backend/src/validations/admin.validations.js:343, source-code/backend/src/services/offer.service.js:61, 109 |
| GAP-3 | Medium | `registration_unit_offers` model declares `id` as `INTEGER UNSIGNED` but migration creates it as `BIGINT UNSIGNED`. Same shape mismatch for `registration_unit_id` (model `BIGINT` vs migration `INTEGER`). `offerId` is `allowNull: false` in the model but `allowNull: true` in the migration. | source-code/backend/src/models/registration-unit-offer.model.js:29-42, source-code/backend/src/migrations/20260401100001-create-offers-tables.cjs:79-96 |
| GAP-DEV-023 | Info | `DELETE /offers/:id` is **soft delete** (paranoid model + `offer.destroy()`). No hard delete path exists. List/edit/delete by-PK ignores already-deleted offers (paranoid default), but `getStoredOfferDiscounts` and the buyer-side join read with `paranoid: false`, so soft-deleted offers' `offerCode` is still resolved for historical units. | source-code/backend/src/models/offer.model.js:99-110, source-code/backend/src/services/offer.service.js:135, source-code/backend/src/services/allocation.service.js:4021, source-code/backend/src/services/common.service.js:455, 781 |
| GAP-DEV-024 | High | `PATCH /offers/:id/toggle` has **no audit trail**. The controller does not pass `req.user?.id`, the service does not persist any actor, and the schema has no `updatedBy`/`toggledBy` column. Only `logger.info` records the event (in-memory log only). Same gap on `DELETE` (no `deletedBy` column). | source-code/backend/src/controllers/offer.controller.js:126-140, source-code/backend/src/services/offer.service.js:145-157, source-code/backend/src/models/offer.model.js:32-112 |
| GAP-4 | Medium | `editOffer` accepts `updatedBy` from the controller but never destructures or persists it. Sequelize will still bump `updatedAt`, but the editing admin is not recorded. | source-code/backend/src/controllers/offer.controller.js:109, source-code/backend/src/services/offer.service.js:82-95 |
| GAP-5 | Medium | `PUT /offers/:id`, `PATCH /offers/:id/toggle`, and `DELETE /offers/:id` have **no `params:` validator** for `:id`. A non-numeric id propagates to `Offer.findByPk` and may produce a 500 instead of 400. | source-code/backend/src/routes/admin/offers.routes.js:10-12 |
| GAP-6 | Medium | `createOfferSchema`/`updateOfferSchema` do **not** validate that `startDate <= endDate`, do not enforce ISO format, and do not require future-dated `endDate`. An offer can be created already expired and will simply never apply at allocation time (the `startDate/endDate` window filter in `processOffers` will exclude it). | source-code/backend/src/validations/admin.validations.js:362-363, source-code/backend/src/services/allocation.service.js:3972-3973 |
| GAP-7 | Low | `isActive=false` offers are still returned by `GET /admin/offers` (the list query has no `isActive` filter), but they are filtered out at apply-time in `processOffers` and `common.service.js`. UI must distinguish. | source-code/backend/src/services/offer.service.js:19-31, source-code/backend/src/services/allocation.service.js:3971, source-code/backend/src/services/common.service.js:182 |
| GAP-8 | Low | `processOffers` accepts a list of `offerIds` but the only conflict guard is "last HOME_LOAN wins" (sequential assignment overwrites `homeLoanDiscountAmount`). No de-dup if the same offer id appears twice; no mutual-exclusion between offers; no per-typology gating despite `unitTypologyId` column. | source-code/backend/src/services/allocation.service.js:3983-4005 |
| GAP-9 | Low | `Offer.create` sets `createdBy = req.user?.id`; if `req.user` is missing, it's stored as `null` without raising. The route is guarded by `protect`, so this should never happen, but no defensive throw. | source-code/backend/src/controllers/offer.controller.js:63, source-code/backend/src/services/offer.service.js:71 |
| GAP-10 | Low | Date filter in `processOffers` uses local server timezone (`new Date().setHours(...)`), not UTC. Offers starting/ending on the day-boundary may behave inconsistently across deployments. | source-code/backend/src/services/allocation.service.js:3964-3965 |

### Other behavioral notes
- `editOffer` re-asserts both `amount` and `percentage` based on `offerType`, so switching an existing offer from `AMOUNT` to `PERCENTAGE` (or vice versa) automatically nulls the unused column. // Source: source-code/backend/src/services/offer.service.js:114-115
- The list endpoint enforces `Math.max(Number(page) || 1, 1)` to clamp invalid pages to 1. // Source: source-code/backend/src/services/offer.service.js:11
- Order is always `id DESC` — newest first. There is no sort param. // Source: source-code/backend/src/services/offer.service.js:30
- `paranoid: true` on both `Offer` and `RegistrationUnitOffer` ensures historical pricing integrity: a deleted offer never disappears from a buyer's price breakdown. // Source: source-code/backend/src/models/offer.model.js:110, source-code/backend/src/models/registration-unit-offer.model.js:70

---

## 9. File Inventory (Sources Inspected)

- `source-code/backend/src/controllers/offer.controller.js` (full, 161 lines)
- `source-code/backend/src/services/offer.service.js` (full, 158 lines)
- `source-code/backend/src/models/offer.model.js` (full, 116 lines)
- `source-code/backend/src/models/registration-unit-offer.model.js` (full, 76 lines)
- `source-code/backend/src/routes/admin/offers.routes.js` (full, 15 lines)
- `source-code/backend/src/routes/admin.routes.js` (offer-mount and middleware lines)
- `source-code/backend/src/validations/admin.validations.js` (offer schemas, lines 341-397)
- `source-code/backend/src/migrations/20260401100001-create-offers-tables.cjs` (full, 160 lines)
- `source-code/backend/src/migrations/20260415150000-insert-offers.cjs` (full, 95 lines)
- `source-code/backend/src/services/allocation.service.js` (offer-related sections: 559, 627-707, 968-1019, 1451-1525, 2520-2550, 2627-2630, 2790-2793, 3258-3260, 3623-3625, 3955-4038)
- `source-code/backend/src/services/common.service.js` (offer-related sections: 14, 18, 42, 161-228, 277-301, 305-470, 564-654, 763-877, 1398-1422)
- `source-code/backend/src/models/index.js` (registry, lines 331-335)
- `source-code/backend/src/middleware/auth.middleware.js` (`protect`, `restrictTo`, lines 23-164)
