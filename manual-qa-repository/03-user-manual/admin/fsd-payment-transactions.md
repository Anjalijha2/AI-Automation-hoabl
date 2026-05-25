# FSD — Payment Transactions (Admin Portal)

**Source-verified Feature Specification Document**
Portal: Admin
Module: Payment Transactions (+ Payment Gateways configuration)
Generated from: `source-code/backend/src/`
Date: 2026-05-22

> Every claim below ends with `// Source: <file>:<line>`. No claim without a source reference.

---

## 1. Module Overview

The Payment Transactions module exposes a read-only admin listing of every entry in the `payment_transactions` table, plus a milestone-type lookup endpoint and a sibling Payment Gateways configuration sub-module. There is no admin-side create, update, refund, or delete endpoint for individual transactions in this module — those operations are owned by other controllers (registration cancellation/refund, milestone-payment, gateway webhooks).

Primary backend files in scope:
- Controller: `source-code/backend/src/controllers/payment-transactions.controller.js` (104 lines) // Source: payment-transactions.controller.js:1-104
- Service: `source-code/backend/src/services/payment-transactions.service.js` (261 lines) // Source: payment-transactions.service.js:1-261
- Sibling controller (gateways): `source-code/backend/src/controllers/payment-gateway.controller.js` // Source: payment-gateway.controller.js:1-97
- Sibling service (gateways): `source-code/backend/src/services/payment-gateway.service.js` // Source: payment-gateway.service.js:1-145
- Gateway facade: `source-code/backend/src/services/payment/payment-gateway.service.js` // Source: payment/payment-gateway.service.js:1-111
- Notification service: `source-code/backend/src/services/payment/payment-notification.service.js` // Source: payment/payment-notification.service.js:1-166
- Generic payment ops (legacy / non-admin): `source-code/backend/src/controllers/payment.controller.js` // Source: payment.controller.js:1-524
- Model: `source-code/backend/src/models/payment-transaction.model.js` // Source: payment-transaction.model.js:1-215
- Lookup model: `source-code/backend/src/models/payment-transaction-type.model.js` // Source: payment-transaction-type.model.js:1-61
- Gateway model: `source-code/backend/src/models/payment-gateway.model.js` // Source: payment-gateway.model.js:1-89
- Routes: `source-code/backend/src/routes/admin.routes.js` // Source: admin.routes.js:213-216
- Gateway sub-routes: `source-code/backend/src/routes/admin/payment-gateways.routes.js` // Source: payment-gateways.routes.js:1-27

Mount path for admin router: `app.use('/api/v1', routes)` → `router.use('/admin', adminRoutes)` → base prefix `/api/v1/admin`. // Source: app.js:46 + routes/index.js:73

---

## 2. API Endpoints (Routes Cross-Reference)

All routes in this module sit behind the global admin guard:
```js
router.use(protect, restrictTo('admin'));
```
// Source: admin.routes.js:53

### 2.1 Payment Transactions endpoints

| # | Method | URL | Controller | Service Function | Auth/Role |
|---|--------|-----|------------|------------------|-----------|
| 1 | GET | `/api/v1/admin/payment-transactions` | `listPaymentTransactionsController` | `listPaymentTransactions` | `protect` + `restrictTo('admin')` |
| 2 | GET | `/api/v1/admin/payment-transactions/milestone-types` | `getMilestoneTypesController` | `getMilestoneTypes` | `protect` + `restrictTo('admin')` |
| 3 | GET *(deferred)* | `/api/v1/admin/payment-transactions/:id` | `getPaymentTransactionDetailController` | *(not implemented)* | — |

Sources:
- Route 1 definition // Source: admin.routes.js:214
- Route 2 definition // Source: admin.routes.js:215
- Route 3 deferred TODO // Source: admin.routes.js:216 + payment-transactions.controller.js:93-94 + payment-transactions.service.js:247-248
- Auth guards apply via `router.use(protect, restrictTo('admin'))` // Source: admin.routes.js:53
- No `validateRequest` middleware wraps either endpoint — query params are parsed directly inside the controller. // Source: admin.routes.js:214-215

### 2.2 Payment Gateways (configuration) endpoints

| # | Method | URL | Controller | Service Function | Validation Schema |
|---|--------|-----|------------|------------------|-------------------|
| 4 | GET | `/api/v1/admin/payment-gateways` | `getActivePaymentGateways` | `listActivePaymentGateways` | `getPaymentGatewaysSchema` (query) |
| 5 | GET | `/api/v1/admin/payment-gateways/settings` | `getPaymentGatewaySettings` | `listPaymentGatewaySettings` | `getPaymentGatewaysSchema` (query) |
| 6 | PUT | `/api/v1/admin/payment-gateways/settings` | `updatePaymentGatewaySettings` | `updatePaymentGatewayStatuses` | `updatePaymentGatewaySettingsSchema` (body) |
| 7 | PUT *(commented out)* | `/api/v1/admin/payment-gateways/:id` | `updatePaymentGatewayStatus` | *(disabled)* | — |

Sources:
- Sub-router mounted at `/payment-gateways` // Source: admin.routes.js:58
- Route 4 // Source: payment-gateways.routes.js:13
- Route 5 // Source: payment-gateways.routes.js:14
- Route 6 // Source: payment-gateways.routes.js:15-19
- Route 7 commented out // Source: payment-gateways.routes.js:20-24
- Validation schemas // Source: admin.validations.js:403-423

### 2.3 Related (non-admin) endpoints that mutate `payment_transactions`

These do not belong to this module but write the same table and explain field origin:
- `POST /api/v1/.../payment/...` initiate / verify / refund / webhook flows in `payment.controller.js` (EaseBuzz / Razorpay). // Source: payment.controller.js:21-525
- `POST /api/v1/admin/milestone-payment/offline` creates offline transactions via `MilestonePaymentController.submitOfflineMilestonePayment`. // Source: admin.routes.js:175-181
- `PUT /api/v1/admin/registration-units/:registrationUnitId/refund` & `POST /api/v1/admin/registration-units/refund-bulk` perform unit-level refunds. // Source: admin.routes.js:133-134
- `POST /api/v1/admin/registration/transaction/reconcile` reconciles via reference number. // Source: admin.routes.js:60

---

## 3. Data Model — `PaymentTransaction`

Table: `payment_transactions`, paranoid (soft delete), `underscored: true`, timestamps enabled. // Source: payment-transaction.model.js:181-188

### 3.1 Columns

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | INTEGER PK auto-inc | NO | — | // Source: payment-transaction.model.js:33-38 |
| `referenceNo` | STRING(50) UNIQUE | NO | — | // Source: payment-transaction.model.js:39-43 |
| `gatewayOrderId` | STRING(100) | YES | — | "Gateway-specific order ID (e.g. Razorpay order_id)" // Source: payment-transaction.model.js:44-48 |
| `transactionId` | STRING(100) | YES | — | Gateway-side payment id (e.g. Razorpay `payment_id` or EaseBuzz `easepayid`). // Source: payment-transaction.model.js:49-52 + payment.controller.js:259, 309, 385 |
| `transactionType` | TINYINT UNSIGNED | NO | — | FK-style → `payment_transaction_types.id` // Source: payment-transaction.model.js:53-56 |
| `registrationId` | BIGINT UNSIGNED | YES | — | // Source: payment-transaction.model.js:57-60 |
| `registrationUnitIds` | JSON | YES | — | // Source: payment-transaction.model.js:61-64 |
| `registrationUnitId` | INTEGER UNSIGNED | YES | — | // Source: payment-transaction.model.js:65-68 |
| `milestonePaymentTrackingId` | BIGINT UNSIGNED | YES | — | // Source: payment-transaction.model.js:69-72 |
| `isAdditionalUnit` | TINYINT(1) | YES | 0 | // Source: payment-transaction.model.js:73-77 |
| `isGst` | TINYINT(1) | NO | 0 | // Source: payment-transaction.model.js:78-82 |
| `userId` | BIGINT UNSIGNED | YES | — | // Source: payment-transaction.model.js:83-86 |
| `projectId` | BIGINT UNSIGNED | NO | — | // Source: payment-transaction.model.js:87-90 |
| `cpId` | BIGINT UNSIGNED | YES | — | "Denotes transaction was done via CP referral" // Source: payment-transaction.model.js:91-95 |
| `amount` | DECIMAL(10,2) | NO | — | // Source: payment-transaction.model.js:96-99 |
| `overpaidAmount` | DECIMAL(10,2) | YES | 0 | // Source: payment-transaction.model.js:100-104 |
| `currency` | STRING(3) | NO | `'INR'` | // Source: payment-transaction.model.js:105-109 |
| `paymentSource` | ENUM(`'user'`,`'admin'`) | YES | `'user'` | // Source: payment-transaction.model.js:110-114 |
| `paymentMethod` | STRING(50) | YES | — | Raw gateway code (`CC`,`UPI`,`NB`,`DC`,`MW`,`credit`,`debit`,`netbanking`,`upi`,`wallet`,`emi`). // Source: payment-transaction.model.js:115-118 + global.js:169-181 |
| `status` | ENUM | NO | `'initiated'` | Allowed values listed below in §3.2 // Source: payment-transaction.model.js:119-123 |
| `gateway` | STRING(20) | YES | `'easebuzz'` | // Source: payment-transaction.model.js:124-128 |
| `isOffline` | BOOLEAN | NO | 0 | "Flag indicating if the payment was done offline (1) or online (0)" // Source: payment-transaction.model.js:129-134 |
| `paymentProof` | STRING(1024) | YES | — | Offline proof file URL. // Source: payment-transaction.model.js:135-138 |
| `gatewayResponse` | TEXT | YES | — | Stringified JSON; auto-parsed in `toJSON()`. // Source: payment-transaction.model.js:139-142 + payment-transaction.model.js:17-26 |
| `customerName` | STRING(100) | YES | — | // Source: payment-transaction.model.js:143-146 |
| `customerEmail` | STRING(100) | YES | — | // Source: payment-transaction.model.js:147-150 |
| `customerPhone` | STRING(15) | YES | — | // Source: payment-transaction.model.js:151-154 |
| `description` | STRING(255) | YES | — | // Source: payment-transaction.model.js:155-158 |
| `metadata` | JSON | YES | — | Free-form; stores callback responses, refund details. // Source: payment-transaction.model.js:159-162 + payment.controller.js:160-173, 309-314, 386-393 |
| `createdBy` | BIGINT UNSIGNED | YES | — | "ID of the user/admin who created the payment transaction" // Source: payment-transaction.model.js:163-167 |
| `createdAt`, `updatedAt`, `deletedAt` | DATE | mixed | — | // Source: payment-transaction.model.js:168-179 |

Audit is **disabled** for this model: `PaymentTransaction.auditEnabled = false;` // Source: payment-transaction.model.js:212

### 3.2 Enum values

- `paymentSource`: `'user'` | `'admin'` (default `'user'`). The listing query also treats `NULL` and the literal string `'gateway'` as "online" — see §5.3 below. // Source: payment-transaction.model.js:110-114 + payment-transactions.service.js:42-56
- `status`: `'initiated'` | `'pending'` | `'completed'` | `'failed'` | `'cancelled'` | `'dropped'` | `'bounced'` | `'refunded'`. // Source: payment-transaction.model.js:119-123
- `isOffline`: BOOLEAN, default `0`. // Source: payment-transaction.model.js:129-134
- `gateway` string values observed: `'easebuzz'`, `'razorpay'`, legacy `'eazypay'`. // Source: payment/payment-gateway.service.js:9-12, 30
- `transactionType` IDs (constants): `REGISTRATION = 1`, `UNIT_ALLOCATION = 2`. // Source: global.js:206-209

### 3.3 Associations

```js
PaymentTransaction.belongsTo(User, { foreignKey: 'userId' });
PaymentTransaction.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
PaymentTransaction.belongsTo(Registration, { foreignKey: 'registrationId', as: 'registration' });
PaymentTransaction.belongsTo(RegistrationUnit, { foreignKey: 'registrationUnitId', as: 'RegistrationUnit' });
PaymentTransaction.belongsTo(PaymentTransactionType, { foreignKey: 'transactionType', targetKey: 'id', as: 'TransactionType' });
```
// Source: payment-transaction.model.js:191-210

### 3.4 Related models

- `PaymentTransactionType` — lookup table `payment_transaction_types` with fields `id`, `name` (unique, 100), `milestone_key` (255). Paranoid + soft-delete. // Source: payment-transaction-type.model.js:14-58
- `PaymentGateway` — `payment_gateways` table with `id`, `projectId`, `name`, `displayName`, `isActive` (default `true`), `createdBy`, `updatedBy`. Paranoid + soft-delete. Associations to `Project`, `User (creator)`, `User (updater)`. // Source: payment-gateway.model.js:14-87

---

## 4. Listing Endpoint — Full Behaviour (`GET /payment-transactions`)

### 4.1 Query parameters

Accepted directly by `listPaymentTransactionsController` (no `validateRequest` middleware):

```js
const { page, limit, search, status, milestone, paymentSource,
        paymentMethod, startDate, endDate, sortKey, sortOrder,
        export: exportFlag } = req.query;
const isExport = exportFlag === '1';
```
// Source: payment-transactions.controller.js:25-40

Defaults applied:
- `page = 1` if missing. // Source: payment-transactions.controller.js:43
- `limit = 20` if missing. // Source: payment-transactions.controller.js:44
- `isExport = true` only when raw query string `export=1` (exact match). // Source: payment-transactions.controller.js:40

### 4.2 Filters — `buildWhereClause`

| Filter | Behaviour | Source |
|--------|-----------|--------|
| `status` | Accepts single string or comma-separated/array. 1 value → equality; many → `Op.in`. | payment-transactions.service.js:31-34 |
| `milestone` | Same as above; values are coerced to `Number` and matched against `transactionType`. | payment-transactions.service.js:37-40 |
| `paymentSource` | Tokenised. Value `'online'` → matches `paymentSource IS NULL` OR `paymentSource = 'gateway'`. Value `'admin'` → matches `paymentSource = 'admin'`. Combined via `Op.or`. | payment-transactions.service.js:43-56 |
| `paymentMethod` | Single or many; equality or `Op.in`. | payment-transactions.service.js:59-62 |
| `startDate`/`endDate` | Range on `createdAt`: `>= startDate` and/or `<= endDate`. | payment-transactions.service.js:65-69 |
| `search` (global) | Trimmed; `LIKE '%kw%'` against: registration number, user first name, user last name, concatenated `first_name + ' ' + last_name`, user phone, fallback `customerName`, fallback `customerPhone`. | payment-transactions.service.js:72-91 |

Note: The `paymentSource` filter enum on the model is `'user'` | `'admin'`, but the listing accepts `'online'` (which expands to NULL OR `'gateway'`) and `'admin'`. The literal `'gateway'` and the `'user'` enum value are **not** referenced as filter tokens in the controller. // Source: payment-transactions.service.js:46-52 + payment-transaction.model.js:110-114

### 4.3 Sorting — `buildOrderClause`

```js
sortKey: 'txnId'        → ORDER BY id
sortKey: 'amount'       → ORDER BY amount
sortKey: 'paymentDate'  → ORDER BY createdAt
default                 → ORDER BY id DESC
sortOrder: 'ASC' | 'DESC' (default DESC; case-insensitive; anything else → DESC)
```
// Source: payment-transactions.service.js:9-22

### 4.4 Pagination

- Listing path uses `findAndCountAll` with `limitOffset(limit, page)` and `distinct: true`. // Source: payment-transactions.service.js:229-237
- Response includes `total`, `page`, `limit`, `rows`. // Source: payment-transactions.controller.js:81-86

### 4.5 Includes (eager loads)

Always-included relations (all `required: false`, i.e. LEFT JOIN):
1. `Registration.scope('withRefunded')` as `registration` with nested `User` (id, firstName, lastName, phone).
2. `RegistrationUnit` as `RegistrationUnit` (id, registrationNumber).
3. `PaymentTransactionType` as `TransactionType` (id, name, milestoneKey).
4. `User` as `createdByUser` (id, firstName, lastName).

// Source: payment-transactions.service.js:99-134

### 4.6 Row format — `formatTransactionRow`

Each row in the response is mapped to:

| Output Field | Derivation |
|--------------|------------|
| `txnId` | `'PT-' + id.padStart(7,'0')` |
| `id` | raw id |
| `transactionId` | raw or `'-'` |
| `registrationNumber` | `registration.registrationNumber` or `'-'` |
| `unitRegistrationNumber` | `RegistrationUnit.registrationNumber` or `'-'` |
| `customerName` | `User.firstName + ' ' + User.lastName` (trim) → fallback `customerName` → `'-'` |
| `phone` | `User.phone` → fallback `customerPhone` → `'-'` |
| `milestoneName` | `TransactionType.name` or `'-'` |
| `milestoneKey` | `TransactionType.milestoneKey` or `'-'` |
| `amount` | raw |
| `paymentMethod` | `getPaymentMethodDisplay(paymentMethod)` — maps codes to human labels (Credit Card, UPI, Net Banking, Debit Card, Mobile Wallet, EMI). |
| `paymentSource` | raw or `'-'` |
| `isOffline` | raw |
| `gateway` | raw or `'-'` |
| `status` | raw |
| `createdBy` | `createdByUser.firstName + ' ' + lastName` → fallback `'ID: <id>'` → `'-'` |
| `createdAt` | raw |

Sources: payment-transactions.service.js:139-175 + utils/helper.js:201-216 + global.js:169-181

---

## 5. Export Behaviour — Does it respect filters?

**Yes — export respects every filter.** The export flag flows through the same service function with `isExport: true`; the filter / sort / include clauses are computed **before** the branch and re-used. Only pagination is dropped. // Source: payment-transactions.service.js:196-227 + payment-transactions.controller.js:42-55

### 5.1 Trigger & switch

```js
const isExport = exportFlag === '1';   // controller:40
const result = await listPaymentTransactions({ ..., isExport });  // controller:42-55
if (isExport) { ...build excel & return... }  // controller:57-77
```
// Source: payment-transactions.controller.js:40-77

### 5.2 Service-side branching

```js
if (isExport) {
  const rows = await PaymentTransaction.findAll({ where, attributes, include, order, subQuery: false });
  return { exportRows: rows };
}
const { count, rows } = await PaymentTransaction.findAndCountAll({ ... ...limitOffset(limit, page) });
```
// Source: payment-transactions.service.js:218-237

`findAll` is used in export → no LIMIT/OFFSET → all matching rows are exported. // Source: payment-transactions.service.js:218-226

### 5.3 Excel composition

Controller maps each row through `formatTransactionRow`, then overrides two columns:
- `paymentSource` is **re-derived** for export:
  - `isOffline === 1 || isOffline === true` → `'Offline'`
  - otherwise if `gateway` truthy → `'Online - <gateway>'`
  - otherwise → `'Online'`
- `paymentDate` is set from `row.createdAt` via `toLocaleString('en-IN')`, fallback `'-'`.
// Source: payment-transactions.controller.js:58-70

Headers (column order in file):

| Key | Header |
|-----|--------|
| `txnId` | Sr. No. |
| `transactionId` | Transaction ID |
| `registrationNumber` | Registration No. |
| `unitRegistrationNumber` | Unit Reg No. |
| `customerName` | Customer Name |
| `phone` | Phone |
| `milestoneName` | Payment Type |
| `amount` | Amount Paid |
| `paymentDate` | Payment Date |
| `paymentMethod` | Payment Method |
| `paymentSource` | Payment Source |
| `status` | Status |
| `createdBy` | Created By |

// Source: payment-transactions.controller.js:7-21

### 5.4 Response headers

```http
Content-Disposition: attachment; filename="payment-transactions.xlsx"
Access-Control-Expose-Headers: Content-Disposition
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
HTTP/1.1 200 OK
```
// Source: payment-transactions.controller.js:73-76

### 5.5 Excel builder

Built via `jsonToExcelV2(rows, EXPORT_HEADERS, 'Payment Transactions')`. // Source: payment-transactions.controller.js:72

---

## 6. Milestone Types Endpoint — `GET /payment-transactions/milestone-types`

```js
export const getMilestoneTypes = async () => {
  const types = await PaymentTransactionType.findAll({
    attributes: ['id', 'name', 'milestoneKey'],
    order: [['id', 'ASC']],
  });
  return types;
};
```
// Source: payment-transactions.service.js:250-260

Controller wraps it in a 200 `ApiResponse.success('Payment transaction types fetched', types)`. // Source: payment-transactions.controller.js:96-104

No filters, no pagination, no project scoping — returns the **entire** `payment_transaction_types` table ordered by id ASC.

---

## 7. Payment Gateways Configuration — Behaviour

### 7.1 List active gateways (public-shaped for admin)

`GET /api/v1/admin/payment-gateways?projectId=<code>`:
1. Resolves project by external `projectId` → throws 404 `'Project not found'` if absent. // Source: payment-gateway.service.js:9-17
2. Returns `PaymentGateway.findAll` with attributes `['name','isActive']`, `where { projectId: <internalPk>, isActive: true }`, ordered by id ASC. // Source: payment-gateway.service.js:22-30

### 7.2 List all gateways for settings page

`GET /api/v1/admin/payment-gateways/settings?projectId=<code>`:
Returns `['id','name','displayName','isActive']` for the project, ordered by id ASC. **Includes inactive rows.** // Source: payment-gateway.service.js:35-43

### 7.3 Bulk update — `PUT /payment-gateways/settings`

Validation schema:
```js
updatePaymentGatewaySettingsSchema = {
  projectId: string().required('projectId is required'),
  gateways: array().of({
    id: number().integer().positive().required('Gateway id is required'),
    isActive: boolean().required('isActive is required'),
  }).min(1, 'At least one payment gateway is required').required('gateways is required'),
};
```
// Source: admin.validations.js:412-423

Service logic — `updatePaymentGatewayStatuses` (payment-gateway.service.js:84-138):

1. Resolve project by external code; 404 if missing. // Source: payment-gateway.service.js:85
2. Build `requestedMap = Map<id, isActive>` from the request payload. // Source: payment-gateway.service.js:87-88
3. Load all `PaymentGateway` rows for the project (`id`, `isActive`, ordered by id ASC). // Source: payment-gateway.service.js:90-94
4. **Guard:** if project has no gateways at all → throws `ApiError.badRequest('No payment gateways configured for this project')`. // Source: payment-gateway.service.js:96-98
5. **Guard:** every requested gateway id must already exist for this project → otherwise throws `ApiError.badRequest('One or more payment gateways are invalid for this project')`. // Source: payment-gateway.service.js:100-105
6. **At-least-one-active guard:** computes `activeCountAfterUpdate` by simulating the merge of requested changes with existing rows. If the resulting active count is `0`, throws `ApiError.badRequest('At least one payment gateway must remain active')`. // Source: payment-gateway.service.js:107-114
7. Inside `sequelize.transaction`, updates **only** rows whose `isActive` actually changes (skips no-op rows and rows not in request). Stamps `updatedBy = req.user?.id`. // Source: payment-gateway.service.js:116-133 + payment-gateway.controller.js:74-80
8. Logs `'Payment gateway statuses updated successfully'`. // Source: payment-gateway.service.js:135
9. Returns refreshed `listPaymentGatewaySettings({ projectId })`. // Source: payment-gateway.service.js:137

### 7.4 Disabled per-gateway endpoint

Both the per-row `PUT /:id` route and its `updatePaymentGatewayStatus` controller/service are present but **commented out**, so a single-gateway toggle is not currently exposed:
- Route // Source: payment-gateways.routes.js:20-24
- Controller // Source: payment-gateway.controller.js:48-68
- Service // Source: payment-gateway.service.js:49-78

---

## 8. Cross-Cutting Behaviour

### 8.1 Online vs Offline distinction

| Aspect | Online | Offline |
|--------|--------|---------|
| `isOffline` column | `0` / `false` | `1` / `true` |
| `paymentSource` (DB enum) | typically `'user'` or NULL or `'gateway'` | typically `'admin'` |
| Listing filter token | `'online'` → `paymentSource IS NULL OR = 'gateway'` | `'admin'` → `paymentSource = 'admin'` |
| Export display | `'Online'` or `'Online - <gateway>'` | `'Offline'` |
| Proof file | not applicable | `paymentProof` column (STRING 1024) |

Sources: payment-transaction.model.js:110-138 + payment-transactions.service.js:43-56 + payment-transactions.controller.js:62-67

### 8.2 Status state machine (observed in code)

Initial state on creation: `'initiated'` (model default). // Source: payment-transaction.model.js:122

Online transitions (driven by EaseBuzz webhook / callback handlers in `payment.controller.js`):
- success callback: `'completed'`, plus stamps `metadata.completedAt`. // Source: payment.controller.js:307-317
- success callback when `status !== 'success'`: `'failed'`. // Source: payment.controller.js:337-341
- failure callback: `'failed'`, plus stamps `metadata.failedAt` and `failureReason`. // Source: payment.controller.js:383-393
- webhook: maps `success → completed`, `failure → failed`, `pending → pending`, default → `pending`. // Source: payment.controller.js:239-262

Refund transition: `processRefund` accepts only `status === 'completed'`; otherwise throws `'Only completed transactions can be refunded'`. On refund initiation the transaction's **own** `status` is not changed — only `metadata.refund` is appended with `status: 'initiated'` or `'failed'`. // Source: payment.controller.js:140-173

**The admin listing module itself does not transition state** — it is read-only. // Source: payment-transactions.controller.js + payment-transactions.service.js (no `update`/`save` calls anywhere in the module)

### 8.3 Refund processing logic (legacy EaseBuzz path, not exposed via admin route)

`POST` to refund handler executes:
1. Validates required `referenceNo` + `refundAmount`. // Source: payment.controller.js:127-129
2. Loads transaction by `referenceNo`; 404 if missing. // Source: payment.controller.js:132-138
3. Refundable-state guard: `transaction.status === 'completed'` else 400. // Source: payment.controller.js:140-143
4. Calls `easeBuzzService.processRefund(refundData)`. // Source: payment.controller.js:155
5. Persists refund detail under `metadata.refund`: `{ amount, reason, status, refundId, refundedBy, refundedAt, response }`. // Source: payment.controller.js:160-173
6. Fires refund notification on channels `['email','sms']`. // Source: payment.controller.js:182-188

Note: The codebase comments explicitly state the existing `PaymentRefund` model is **not** written by this path — only `metadata` is updated. // Source: payment.controller.js:157-159

A dedicated `payment_refunds` model file exists (`models/payment-refund.model.js`) but no admin endpoint references it in this module's flow. // Source: models directory listing (see §1)

### 8.4 Razorpay integration points (background)

- Webhook endpoint persists every payload into `payment_webhook_logs` BEFORE signature validation for auditability. // Source: payment.controller.js:428-443
- Signature validated via `razorpayService.validateWebhookSignature`; bad signatures → 400. // Source: payment.controller.js:447-453
- Immediate 200 ACK to satisfy Razorpay's 5-second SLA, then fire-and-forget `_processRazorpayWebhook`. // Source: payment.controller.js:455-461
- Lookup precedence: `transactionId === razorpay_payment_id` first; fallback `gatewayOrderId === order_id`. // Source: payment.controller.js:474-486
- If matched and `transactionType === TransactionTypeId.UNIT_ALLOCATION (=2)`, triggers `checkAndProcessAllocationByReferenceService(referenceNo)`. // Source: payment.controller.js:507-509 + global.js:208
- Marks webhook log `isProcessed = 1, processedAt = now()` after completion. // Source: payment.controller.js:511-513

### 8.5 Gateway facade resolution

`PaymentGatewayService.resolveGateway(gatewayName)` selects the underlying SDK service by lowercased name:
- `'razorpay'` → `razorpayService`
- `'easebuzz'` or legacy `'eazypay'` → `easeBuzzService`
- anything else (including `null`) → `easeBuzzService` (safe default).

// Source: payment/payment-gateway.service.js:25-35

`verifyByReference(referenceNo)` and `updateTransactionStatus(referenceNo, transactionType, ...)` look up `gateway` from the row and delegate. // Source: payment/payment-gateway.service.js:53-85

### 8.6 Notification triggers

Centralised in `paymentNotificationService.sendNotification({ event, transaction, user, channels })`. // Source: payment/payment-notification.service.js:18-99

Templates and subjects by event:

| Event | Email template | Email subject | SMS template | WhatsApp template |
|-------|----------------|---------------|--------------|-------------------|
| `initiated` | `payment-initiated` | `Payment Initiated - Xanadu` | `payment-initiated` | `payment-initiated` |
| `completed` | `payment-success` | `Payment Successful - Xanadu` | `payment-completed` | `payment-completed` |
| `failed` | `payment-failed` | `Payment Failed - Xanadu` | `payment-failed` | `payment-failed` |
| `refunded` | `payment-refund` | `Payment Refund Processed - Xanadu` | `payment-refunded` | `payment-refunded` |

// Source: payment/payment-notification.service.js:109-128 + 138-158

Channel selection per trigger point:
- Initiated: `['email']` only. // Source: payment.controller.js:55-66
- Completed (success callback): `['email','sms']`. // Source: payment.controller.js:322-331
- Failed (failure callback): `['email']` only. // Source: payment.controller.js:398-407
- Refund initiated: `['email','sms']`. // Source: payment.controller.js:181-191

Skip rule: if neither `recipient.email` nor `recipient.phone` resolvable → notification short-circuits with `{ success: false, reason: 'No recipient details available' }`. // Source: payment/payment-notification.service.js:36-42

Notification failures **never** fail the parent payment flow — every call is wrapped in try/catch that only logs. // Source: payment.controller.js:55-66, 180-191, 321-331, 396-407

### 8.7 Role restrictions

- Every admin payment-transaction and admin payment-gateway route is gated by `protect` (JWT/session auth) **AND** `restrictTo('admin')`. // Source: admin.routes.js:53 + middleware/auth.middleware.js:23, 102
- There is no per-action sub-role check inside the controllers/services in this module — only the route-level guards.

### 8.8 Project scoping

- Admin `payment-transactions` listing has **no `projectId` filter** in `buildWhereClause`. The endpoint returns transactions across all projects to which the admin has access (limited only by `restrictTo('admin')`). // Source: payment-transactions.service.js:27-91
- Admin `payment-gateways` endpoints **require** `projectId` query/body param and 404 if the project code is unknown. // Source: payment-gateway.service.js:9-17 + admin.validations.js:403-405, 412-414

### 8.9 Error handling

- `listPaymentTransactionsController` returns HTTP 500 with `'Failed to fetch payment transactions'` on any thrown error. // Source: payment-transactions.controller.js:87-90
- `getMilestoneTypesController` returns HTTP 500 with `'Failed to fetch payment transaction types'`. // Source: payment-transactions.controller.js:100-103
- Service layer logs error then re-throws. // Source: payment-transactions.service.js:241-244, 257-260
- Gateway controllers map `ApiError` → original status; otherwise `next(err)` to global handler. // Source: payment-gateway.controller.js:18-25, 38-45, 81-89

---

## Appendix A — Files Read (verbatim)

| File | Lines | Purpose |
|------|-------|---------|
| controllers/payment-transactions.controller.js | 1-104 | Admin listing + export + milestone-types controllers |
| services/payment-transactions.service.js | 1-261 | Where/order/include builders, list, milestone-types fetch, row formatter |
| controllers/payment.controller.js | 1-524 | EaseBuzz + Razorpay (initiate, verify, refund, webhook, callbacks) |
| services/payment/payment-gateway.service.js | 1-111 | Gateway facade |
| services/payment-gateway.service.js | 1-145 | Admin gateway config (list active, list settings, bulk update) |
| services/payment/payment-notification.service.js | 1-166 | Email/SMS/WhatsApp template dispatch |
| models/payment-transaction.model.js | 1-215 | `PaymentTransaction` definition + associations |
| models/payment-transaction-type.model.js | 1-61 | Lookup table |
| models/payment-gateway.model.js | 1-89 | `PaymentGateway` definition + associations |
| controllers/payment-gateway.controller.js | 1-97 | Admin gateway endpoints |
| routes/admin.routes.js | 1-245 | Admin route registry |
| routes/admin/payment-gateways.routes.js | 1-27 | Gateway sub-routes |
| validations/admin.validations.js | 395-444 | Gateway validation schemas |
| constants/global.js | 165-209 | `PaymentMethods`, `TransactionTypeId` |
| utils/helper.js | 195-230 | `getPaymentMethodDisplay`, `generateOfflineReferenceNo` |

---

## Appendix B — Out-of-Scope / Excluded

- **Strapi**: excluded from all source scans (per project constraint).
- **LeadSquared (LSQ)**: excluded entirely from this codebase by policy.
- `getPaymentTransactionDetailController` (single-transaction detail view) is explicitly TODO/deferred. // Source: payment-transactions.controller.js:93-94
- `getPaymentTransactionById` service function is TODO/deferred. // Source: payment-transactions.service.js:247-248
- Per-row `PUT /payment-gateways/:id` toggle is disabled (route + controller + service commented out).
