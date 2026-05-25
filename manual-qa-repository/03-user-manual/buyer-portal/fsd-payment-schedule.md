# FSD — Buyer Portal: Payment Schedule
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Payment Schedule module exposes a buyer's milestone-based payment plan for an allotted unit and lets the buyer initiate online (Easebuzz) payments for individual milestones. Schedules are dynamically templated from the unit's typology + agreement value + parking + offers + home-loan election, and merged with per-milestone tracking rows that record amounts paid, GST status, and partial/paid state.

The same `getDynamicTemplateData` helper that drives the buyer-facing schedule is reused by allocation, milestone order creation, KYC, and the admin allocation flow:
- Buyer entry point: `GET /api/user/allocation/unit-details` `// Source: source-code/backend/src/routes/user/allocation.routes.js:45`
- Buyer milestone-merged endpoint: `GET /api/user/user-unit-details` `// Source: source-code/backend/src/routes/user.routes.js:74`
- Buyer transaction details: `GET /api/user/milestone-transaction-details` `// Source: source-code/backend/src/routes/user.routes.js:77`
- Frontend table: `source-code/buyer-portal/src/components/common/allocation-details/PaymentSchedule.jsx` `// Source: source-code/buyer-portal/src/components/common/allocation-details/PaymentSchedule.jsx:11`

The Payment Schedule is a *read-only view + payment-initiation trigger*. Mutation of the row state happens only through milestone payment processing (see Home Loan FSD and milestone-payment controller).

---

## 2. Data Model

### 2.1 `registration_unit_payment_schedules` (template/plan rows)
Source-of-truth row for each milestone in a buyer's plan. Created once per unit at allocation time via `insertPaymentScheduleandUpdateMilestone`. `// Source: source-code/backend/src/services/registration-unit.service.js:32`

| Field | Type | Notes |
|-------|------|-------|
| `id` | BIGINT.UNSIGNED PK | `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:37` |
| `business_milestone_id` | STRING(50) | UUID v7 for Mavis tracking `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:43-47` |
| `registration_unit_id` | INT.UNSIGNED | FK to `RegistrationUnits` `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:49-53` |
| `typology_milestone_id` | BIGINT.UNSIGNED | FK to `typology_milestones` `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:54-62` |
| `milestone_key` | STRING(100) NOT NULL | `ml-or`, `ml-ual`, `ml-hcf`, `ml-tds`, `ml-rou`, etc. `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:63-67` |
| `due_amount_type` | ENUM | `BOOKING_AMOUNT`, `SDR`, `AMOUNT`, `PERCENT`, `FIRST_DISBURSEMENT`, `FIRST_DEMAND_PAYMENT` `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:68-72` |
| `version_id` | BIGINT.UNSIGNED | default 0 `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:73-78` |
| `name` | STRING(255) NOT NULL | Milestone display name `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:79-83` |
| `principal_collection` | STRING | Currency-formatted text `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:84-88` |
| `percentage_due` | STRING | `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:89-93` |
| `exlude_for_future_calculation` | BOOLEAN | `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:94-99` (sic — column typo) |
| `gst` | STRING | `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:100-104` |
| `dates` | STRING | `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:105-109` |
| `is_visible` | BOOLEAN | Frontend visibility flag `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:110-114` |
| `sequence` | INTEGER | Display order `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:115-119` |
| `start_date` / `end_date` | DATE | `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:120-129` |
| `created_at` / `updated_at` / `deleted_at` | DATE | Soft-deleted (paranoid) `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:130-154` |

### 2.2 `milestone_payment_tracking` (payment progress rows)
Tracks per-milestone payment progress. Upserted by `createOrder` and updated on Easebuzz callback. `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:630-645`

| Field | Type | Notes |
|-------|------|-------|
| `id` | BIGINT.UNSIGNED PK | `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:53-58` |
| `registration_unit_id` | INT.UNSIGNED NOT NULL | FK `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:59-66` |
| `typology_milestone_id` | BIGINT.UNSIGNED | FK to `TypologyMilestone` `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:67-75` |
| `payment_schedule_milestone_id` | BIGINT.UNSIGNED | Legacy FK `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:76-85` |
| `version_id` | BIGINT.UNSIGNED | default 0 `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:86-90` |
| `reg_payment_schedule_id` | BIGINT.UNSIGNED | FK to schedule row `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:91-98` |
| `milestone_key` | STRING(50) | Pre-mapping identifier `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:99-104` |
| `transaction_id` | BIGINT.UNSIGNED | `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:105-108` |
| `total_amount` | DECIMAL(10,2) | principal + GST `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:109-113` |
| `total_paid` | DECIMAL(10,2) | Sum across all completed payments `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:114-118` |
| `balance_amount` | DECIMAL(10,2) | `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:119-123` |
| `gst_paid` | BOOLEAN | `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:124-128` |
| `gst_paid_amount` | DECIMAL(10,2) | `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:129-133` |
| `status` | ENUM `pending` \| `partial` \| `paid` | `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:134-138` |
| `payment_status` | ENUM `VERIFICATION` \| `PAID` (nullable) | Mid-flight gateway lock `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:139-143` |
| `final_agreement_amount` | DECIMAL(10,2) | `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:144-147` |
| `principal_amount` | DECIMAL(10,2) | `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:148-151` |
| `gst_amount` | DECIMAL(10,2) | `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:152-155` |
| `parking_amount` | DECIMAL(10,2) | `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:156-159` |
| `home_loan_amount` | DECIMAL(10,2) | `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:160-163` |
| `early_bird_discount` | DECIMAL(10,2) | `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:164-167` |
| `created_at` / `updated_at` / `deleted_at` | DATE | Soft-deleted (paranoid) `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:168-191` |

### 2.3 `payment_transactions` (linked)
Linked via `milestone_payment_tracking_id`. `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:34-37`
Linked via `transaction_id` to a single "registration" payment txn. `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:39-42`

### 2.4 `payment_transaction_types` (milestone-key catalog)
Resolves milestone keys to transaction types and human-readable names. `// Source: source-code/backend/src/models/payment-transaction-type.model.js:14-49`
- `name` STRING(100) UNIQUE — display name `// Source: source-code/backend/src/models/payment-transaction-type.model.js:21-26`
- `milestone_key` STRING(255) — link to schedule milestone key `// Source: source-code/backend/src/models/payment-transaction-type.model.js:27-31`

### 2.5 Milestone Key Catalog
Defined in `constants/global.js`:
- `ml-or` — REGISTRATION `// Source: source-code/backend/src/constants/global.js:128`
- `ml-ual` — UNIT_ALLOCATION `// Source: source-code/backend/src/constants/global.js:129`
- `ml-hcf` — HOME_CONFIRMATION `// Source: source-code/backend/src/constants/global.js:130`
- `ml-tds` — TDS `// Source: source-code/backend/src/constants/global.js:131`
- `ml-rou` — Stamp Duty & Registration (SDR) `// Source: source-code/backend/src/constants/global.js:132`
- `ml-or-ual` — REGISTRATION_AND_UNIT_ALLOCATION (combined) `// Source: source-code/backend/src/constants/global.js:127`

### 2.6 PaymentType (intent at order creation)
Numeric enum that determines the slice of the milestone the buyer pays in one transaction:
- `1` FULL_PRINCIPAL `// Source: source-code/backend/src/constants/global.js:104`
- `2` HALF_PRINCIPAL `// Source: source-code/backend/src/constants/global.js:105`
- `3` GST_ONLY `// Source: source-code/backend/src/constants/global.js:106`
- `4` FULL_PRINCIPAL_GST `// Source: source-code/backend/src/constants/global.js:107`
- `5` HALF_PRINCIPAL_GST `// Source: source-code/backend/src/constants/global.js:108`

---

## 3. State Machines

### 3.1 `milestone_payment_tracking.status` (lifecycle)
ENUM: `pending` → `partial` → `paid`. `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:134-138`

Transitions on successful completed gateway callback inside `updateMileStonePaymentData`:
- `finalPaidAmount >= totalAmount` → `status = 'paid'` (also sets `isPaid` flag) `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:996-1000`
- Otherwise → `status = 'partial'` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:1000`
- Initial upsert default before any payment → `status = 'pending'` (model default) `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:137`

### 3.2 `milestone_payment_tracking.payment_status` (in-flight gateway lock)
ENUM (nullable): `VERIFICATION`, `PAID`. `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:139-143`

Transitions:
- On `createMileStoneOrder` (order initiated, payment redirect): set `paymentStatus = 'VERIFICATION'` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:635`
- On Easebuzz callback success: `paymentStatus = 'PAID'` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:999`
- On Easebuzz callback failure: `paymentStatus = 'FAILED'` (note — `'FAILED'` is written to the column but the ENUM declares only `VERIFICATION`/`PAID`; see Section 7) `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:983, 999`
- Guard: if `paymentStatus === 'VERIFICATION'` at create-time → 400 "Milestone payment already in verification" `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:474-477`

### 3.3 Per-call `payment_transactions.status`
Drives mile-stone calculations: payment is treated as effective only when `status === 'completed'` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:721-722, 1569-1572`

---

## 4. Business Rules

### 4.1 Order-creation guards
- `registrationNumber` and (`milestoneType` OR `milestoneKey`) required `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:241-243`
- `milestoneId` AND `milestoneKey` required for non-HCF `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:258-260`
- `RegistrationUnit.status === 'WINNER'` required `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:447-450`
- Ownership: `Registration.userId === req.user.id` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:458-466`
- Reject if tracking row already `paymentStatus = VERIFICATION` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:474-477`
- Reject if tracking row already `status = paid` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:478-481`
- Reject if milestone is already fully paid (post-fetch check) `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:530-533`

### 4.2 Amount calculation per `paymentType`
All math is performed by `createOrder` against the live dynamic schedule and the existing tracking row (`alreadyPaid`, `balanceAmount`, `gstPaidFlag`):
- `1` Full principal: `principalAmount + (gstPaid ? gstAmount : 0) − alreadyPaid` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:537-539`
- `2` Half principal: `max(0, principal − (alreadyPaid − (gstPaid ? gstAmount : 0))) / 2` (rejects when no balance left) `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:541-549`
- `3` GST only: `gstAmount` (rejects if `gstPaidFlag = true`) `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:551-557`
- `4` GST + Principal: `principal + gst − alreadyPaid` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:559-561`
- `5` GST + Principal + half: `(principal + gst − alreadyPaid) / 2` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:563-565`
- Default: 400 "Invalid payment type" `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:567-569`

Final guard: client `amount` must be within `±0.01` of computed `finalPayableAmount` and > 0; else 400 `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:571-575`

### 4.3 Schedule fetch
- Reuses `allocation.controller.getDynamicTemplateData` via mocked `req` with `isMethod: 'true'` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:494-505`
- Requires `paymentSchedule.paymentSchedule.rows` to be a non-empty array else 500 "Error fetching payment schedule" `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:506-512`
- Schedule access path validates `Registration.userId === req.user.id` unless user is admin/sales-manager `// Source: source-code/backend/src/controllers/allocation.controller.js:256-264`

### 4.4 Callback path (Easebuzz)
- `processMilestoneOrder` requires `txnid` and existing `PaymentTransaction.referenceNo` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:691-699`
- Returns 200 short-circuit if already completed `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:700`
- On success `updateMileStonePaymentData` recalculates `totalPaid`, `balanceAmount`, `gstPaid` flags, derives `isPaid` and `status` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:987-1008`
- `gstPaid` toggled to `1` when paymentType ∈ {3,4,5} `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:994`
- `gstPaidAmount` updated only when paymentType === 3 `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:1004`

### 4.5 Admin offline-payment override
- Endpoint: `POST /admin/milestone-payment/offline` `// Source: source-code/backend/src/routes/admin.routes.js:175-181`
- Bypasses gateway; creates `PaymentTransaction` directly with `status='completed'`, `isOffline:true`, `paymentSource:'admin'` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:1342-1369`
- Hard-validates against `principalOutstandingAmount`/`gstOutstandingAmount`, with `PAYMENT_AMOUNT_TOLERANCE = 0.01` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:53, 1275-1326`
- Special HCF branch: `paymentType ∈ {4,5}` only for `ml-hcf`; on success, `RegistrationUnit.hcfTransactionStatus='PAID'` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:1411-1419`
- Duplicate-guard on external `transactionId` → 409 `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:1139-1148`

### 4.6 Side-effect sequencing (post-payment success)
- LSQ opportunity update only when `paymentType ∈ {4,5}` (i.e. full-payment events) `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:1012-1042, 1424-1442`
- Mavis sync (`syncMavisMilestonePayment`) requires `milestoneSchedule.businessMilestoneId` AND `registrationUnit.lsqCurrentScheduleId`; sets `Paid: 'Yes'` + `Final_Date` only when fully paid `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:182-227`

---

## 5. Notification Dispatch

For Payment Schedule milestone payments specifically:

- `processMilestoneOrder` (buyer-facing callback) — `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:689-749`: **NO** WhatsApp / SMS / email / push notification is dispatched. Side effects on success are limited to LSQ opportunity update (paymentType 4/5 only) and Mavis sync.
- `updateMileStonePaymentData` — `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:948-1055`: no notification calls.
- `submitOfflineMilestonePayment` (admin path) — `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:1063-1484`: no notification calls.
- `createMileStoneOrder` / `createOrder` — `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:237-282, 443-687`: no notification calls.

There is a generic `paymentNotificationService.sendNotification` available in `services/payment/payment-notification.service.js` `// Source: source-code/backend/src/services/payment/payment-notification.service.js:161-165`, but it is **not invoked** by any milestone-payment controller path — only by `payment.controller.js` (generic flows). `// Source: source-code/backend/src/controllers/payment.controller.js:5,56,182,323,399`

Net effect: **a buyer who completes a milestone payment receives no automated notification from this module.** Verify in QA whether the gateway-side Easebuzz receipt email is intended to satisfy this gap.

---

## 6. API Endpoints

### Buyer
| Method | Path | Handler | Notes |
|--------|------|---------|-------|
| GET | `/api/user/allocation/unit-details` | `getDynamicTemplateData` | Returns `paymentSchedule = { rows, additionalInfo }` for a unit `// Source: source-code/backend/src/routes/user/allocation.routes.js:45` |
| GET | `/api/user/user-unit-details` | `getMilestoneUnitDetails` | Schedule rows merged with `MilestonePaymentTracking` + `typologyMilestone.startDate/endDate` `// Source: source-code/backend/src/routes/user.routes.js:74` + `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:1486-1656` |
| GET | `/api/user/milestone-transaction-details` | `getMilestoneTransactionDetails` | Returns completed `PaymentTransaction` rows for a milestone tracking id or single txn id; supports allocation-flow branching `// Source: source-code/backend/src/routes/user.routes.js:77` + `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:1716-1846` |
| POST | `/api/user/milestone-payment/order` | `createMileStoneOrder` | Body: `{ registrationNumber, milestoneType, milestoneKey, milestoneId, amount, paymentType }`; returns `{ paymentUrl, referenceNo }` `// Source: source-code/backend/src/routes/user/milestone-payment.routes.js:8` + `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:237` |
| POST | `/api/user/milestone-payment/hcf-order/process` | `processMilestoneOrder` | Easebuzz callback; body must contain `txnid` `// Source: source-code/backend/src/routes/user/milestone-payment.routes.js:10` + `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:689` |

Route is mounted under `/api/user` and protected by `protect` + `restrictTo('user')`. `// Source: source-code/backend/src/routes/user.routes.js:49-51, 171`

### Admin (cross-portal, included for traceability)
| Method | Path | Handler |
|--------|------|---------|
| GET | `/api/admin/user-unit-details` | `getMilestoneUnitDetails` `// Source: source-code/backend/src/routes/admin.routes.js:209` |
| GET | `/api/admin/milestone-transaction-details` | `getMilestoneTransactionDetails` `// Source: source-code/backend/src/routes/admin.routes.js:211` |
| GET | `/api/admin/payment-transactions/milestone-types` | `getMilestoneTypesController` `// Source: source-code/backend/src/routes/admin.routes.js:215` |
| POST | `/api/admin/milestone-payment/offline` | `submitOfflineMilestonePayment` (requires `paymentProof` upload) `// Source: source-code/backend/src/routes/admin.routes.js:175-181` |

### PDF / Download
- **No backend PDF generation endpoint** exists for payment-schedule download.
- Buyer-side download is handled client-side via `react-to-print` over the on-screen table; the button calls `handlePrint` (browser print → save as PDF). `// Source: source-code/buyer-portal/src/components/common/allocation-details/PaymentSchedule.jsx:1-73`
- No `payment-schedule.pdf` / `downloadSchedule` / `exportSchedule` route exists. `// Source: NOT FOUND — verified by Grep across backend/src for "payment-schedule|PaymentSchedule.*pdf|downloadSchedule|exportSchedule"`

---

## 7. Known Bugs / Gaps

1. **Enum mismatch on `payment_status='FAILED'`**
   `updateMileStonePaymentData` writes `paymentStatus: 'FAILED'` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:983` and `paymentStatus: isSuccess ? 'PAID' : 'FAILED'` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:999`, but the column ENUM is declared only `('VERIFICATION', 'PAID')`. `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:139-143` — Sequelize-level truncate/strict-mode failure risk; failed payments may silently retain `VERIFICATION` blocking retries.

2. **No buyer notification on milestone payment success or failure**
   See Section 5. Buyer gets no in-app, WhatsApp, SMS, or email confirmation from this module.

3. **PDF generation is client-side print only**
   No server-rendered PDF; print fidelity depends on browser rendering of `react-to-print`. No archival/audit copy is stored. `// Source: source-code/buyer-portal/src/components/common/allocation-details/PaymentSchedule.jsx:64-73`

4. **Dead-code / commented HCF flow drift**
   The HCF-specific buyer flow (`createHcfOrder`, `processHcfOrder`, `processHcfReconciliation`) is commented out in the controller `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:284-423, 751-858`. HCF is now handled via the unified `createOrder`/`processMilestoneOrder` plus the admin offline branch. Risk: any client still wired to the old path will silently no-op.

5. **`mileStonePaymentData?.status === 'paid'` short-circuit returns 400 with two distinct messages**
   Pre-fetch path returns "Milestone payment already completed" `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:478-481`; post-fetch path returns "Milestone already fully paid" `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:530-533`. UX inconsistency.

6. **Spelling bug in column name: `exlude_for_future_calculation`**
   `// Source: source-code/backend/src/models/registration-unit-payment-schedule.model.js:94-99` — propagates to API responses.

7. **`createOrder` doesn't filter by `milestoneEntry.isVisible`**
   A milestone hidden from the buyer UI (`is_visible = false`) is still order-payable if the client knows the `milestoneKey`. `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:516`

8. **`getMilestoneTransactionDetails` raw SQL attribute name mismatch risk**
   Uses snake_case attribute strings (`'payment_method'`, `'registration_unit_ids'`, etc.) against a Sequelize model with camelCase fields; works only because `underscored: true` translates — but skipping `raw:true` returns unmapped objects in some branches. `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:1748-1762, 1820-1834`

---

## 8. QA Risk Areas

1. **Concurrent partial payments on the same milestone** — two near-simultaneous `createMileStoneOrder` calls may both pass the `paymentStatus === 'VERIFICATION'` guard since there is no DB-level row lock on the tracking row inside the `upsert` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:469-482, 630-645`. Verify race window.

2. **`amount` tolerance bypass** — client posts amount within ±0.01 of recomputed amount `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:571-575`. Confirm gateway settlement rounding doesn't drift across paymentType 2/5 half-splits (odd-amount → half-paise residual).

3. **Stuck `VERIFICATION` state** — gateway timeout / abandoned redirect leaves `paymentStatus='VERIFICATION'` blocking all subsequent attempts. Reconciliation cron exists (`processMilestoneReconciliation`) `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:860-946` — verify cron cadence + idempotency. If reconciliation writes `'FAILED'` (see Bug #1), the column will reject it.

4. **GST-double-payment vector** — if a `paymentType=3` (GST_ONLY) order is in `VERIFICATION` and a `paymentType=4` (PRINCIPAL+GST) order is also attempted before the first resolves, the second would be blocked correctly. Re-verify after Bug #1 fix.

5. **Cross-portal admin offline payment** — admin offline submission bypasses the gateway and immediately marks `status='paid'`. QA must confirm admin role restriction on `/api/admin/milestone-payment/offline` and audit-log presence (model has `auditEnabled` not set — verify).

6. **Schedule re-versioning impact** — `version_id` on tracking row defaults 0 `// Source: source-code/backend/src/models/milestone-payment-tracking.model.js:88-90`. If `insertPaymentScheduleandUpdateMilestone` bumps the schedule version mid-cycle, in-flight tracking rows may de-reference stale `reg_payment_schedule_id`.

7. **Buyer ownership leak** — `getMilestoneTransactionDetails` queries on `registrationNumber` without joining `Registration.userId === req.user.id` `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:1728-1731`. Verify if another user's `registrationNumber` can be read.

8. **Frontend XSS surface** — schedule cell renderers use `dangerouslySetInnerHTML` for `name`, `percentageDue`, `principalCollection` `// Source: source-code/buyer-portal/src/components/common/allocation-details/PaymentSchedule.jsx:32, 47, 60`. Verify all schedule strings are sanitized upstream.

9. **`ml-or` / `ml-ual` special path inside `getMilestoneUnitDetails`** — these milestones bypass tracking-row data and look up `registration_transaction_id` / `allocation_transaction_id` instead `// Source: source-code/backend/src/controllers/milestone-payment.controller.js:1611-1622`. QA: registration-cancel / additional-unit scenarios mis-display "0 outstanding" if `transactionId` exists but is failed/refunded.

10. **No notification verification needed** — see Section 5; QA cannot test absent functionality but should formally log "no buyer notification on milestone payment success/failure" as a gap.

11. **Print-to-PDF visual regression** — confirm `react-to-print` renders header/footer images (`PaymentPlanHeader.jpg`, `PaymentPlanFooter.jpg`) and the dynamic columns title `${typology} ${carpetArea} SQ.FT.` `// Source: source-code/buyer-portal/src/components/common/allocation-details/PaymentSchedule.jsx:6-7, 55-61` across Chrome/Firefox/Safari.
