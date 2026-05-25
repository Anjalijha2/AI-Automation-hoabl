# FSD — Admin Portal: Customers

**Source-verified:** 2026-05-24
**Backend path:** `source-code/backend/src/`
**Verified by:** Tech Lead Agent
**Scope:** Admin-portal "Customers" surface — buyer listing, customer-action master config, and per-`RegistrationUnit` admin operations (assign offline unit, swap unit, update parking, home-loan approval, allocation-transaction update, cancel units, bulk cancel by Excel, single + bulk refund, offline milestone payment).
**Excluded from scope (per project policy):** LeadSquared (LSQ), Strapi, Mavis side-effects, Kaleyra channels — documented only as observed integration points.

---

## 1. Module Overview

### Purpose
The Customers module is the admin-side console for managing a buyer's lifecycle once a `Registration` (and its child `RegistrationUnit`) exists. It does **not** create customers — those are created via the buyer / CP / Sales-Manager portals. The module governs corrective and discretionary admin actions:
- Listing/searching all buyers (KPIs + paginated table) // Source: `controllers/admin.controller.js:107`
- Configuring whether buyers may book additional registration units // Source: `controllers/admin.controller.js:1557,1579`
- Per `RegistrationUnit` operations dispatched through one polymorphic endpoint with an `event` discriminator (`unit-swap`, `update-parking`, `home-loan-approval`, `allocation_transaction_update`) // Source: `services/registration-unit.service.js:39-48`
- Assign offline unit (admin allots a `Unit` to a `RegistrationUnit` and records an offline payment) // Source: `services/registration-unit.service.js:624`
- Cancel one-or-many WINNER units // Source: `controllers/admin.controller.js:3367`
- Cancel by Excel upload (filename column is `Registration Number`) // Source: `controllers/admin.controller.js:2301`
- Single refund (`refundRegistrationUnit`) and bulk refund by Excel (`bulkRefundRegistrationUnits`) // Source: `controllers/admin.controller.js:1475, 1530`; `services/registration-unit.service.js:941, 1075`
- Submit offline milestone payment (admin records a milestone payment on the buyer's behalf, bypassing the gateway) // Source: `controllers/milestone-payment.controller.js:1063`

### Backend files that own this module
| Concern | File |
|---|---|
| HTTP routes (admin) | `source-code/backend/src/routes/admin.routes.js` |
| Customer-list & customer-actions controller | `source-code/backend/src/controllers/admin.controller.js` |
| `RegistrationUnit` event dispatcher + business logic | `source-code/backend/src/services/registration-unit.service.js` |
| Allocation pricing + notification dispatch | `source-code/backend/src/services/allocation.service.js` |
| Offline milestone payment controller | `source-code/backend/src/controllers/milestone-payment.controller.js` |
| Validation schemas | `source-code/backend/src/validations/admin.validations.js` |
| Audit-action constants & milestone keys | `source-code/backend/src/constants/global.js` |

### Auth guard
Every endpoint in this module is mounted under the admin router which applies `protect, restrictTo('admin')` at the router level // Source: `routes/admin.routes.js:53`.

### DB tables read / written
| Table | Read | Written |
|---|---|---|
| `users` (`User`) | yes | no (in this module) |
| `registrations` (`Registration`) | yes | yes — status, `availableForAllocation` // `services/registration-unit.service.js:1008-1037`, `services/registration-unit.service.js:1270-1281` |
| `registration_units` (`RegistrationUnit`) | yes | yes — status, allocation fields, KYC flags, refund timestamp |
| `units` (`Unit`) | yes | yes — `status` toggled between `AVAILABLE`/`RESERVED`/`BOOKED` |
| `unit_typologies` (`UnitTypology`) | yes | yes — `availableParkingSpots` adjusted on parking update // `services/registration-unit.service.js:331` |
| `registration_home_loans` (`RegistrationHomeLoan`) | yes | yes (upsert) // `services/registration-unit.service.js:371-382` |
| `payment_transactions` (`PaymentTransaction`) | yes | yes — created (offline assignment, allocation-txn update, offline milestone), soft-deleted on cancel // `controllers/admin.controller.js:3506` (`pt.deleted_at = NOW()`) |
| `payment_transaction_types` | yes | no |
| `milestone_payment_tracking` (`MilestonePaymentTracking`) | yes | yes — created on assignment / offline milestone; soft-deleted on cancel // `controllers/admin.controller.js:3603-3613` |
| `registration_unit_payment_schedules` | yes | yes — soft-deleted on cancel // `controllers/admin.controller.js:3624-3627` |
| `parking_inventory` | yes | yes — released on cancel // `controllers/admin.controller.js:3630-3633` |
| `registration_unit_offers` | yes | yes — soft-deleted on cancel // `controllers/admin.controller.js:3636-3639` |
| `registration_drafts` | yes | yes — `Won → Refunded`, `Lost → Open` on refund // `services/registration-unit.service.js:1020-1036`, `services/registration-unit.service.js:1295-1312` |
| `master_configs` | yes | yes (customer-actions) // `controllers/admin.controller.js:1596-1629` |
| `audit_logs` (`AuditLog`) | no | yes — every admin write goes through `audit: { action: ... }` hook or explicit `AuditLog.bulkCreate` |
| Redis (cache) | yes | yes — registration cache, unit cache, alloc keys updated/cleared best-effort |

---

## 2. Data Model

### 2.1 `Registration` (`models/registration.model.js`)
| Field | Type | Notes |
|---|---|---|
| `id` | `BIGINT UNSIGNED` PK | // Source: `models/registration.model.js:69-73` |
| `userId` | `BIGINT UNSIGNED` FK → `users.id` | cascade // Source: `models/registration.model.js:74-83` |
| `projectId` | `BIGINT UNSIGNED` FK → `projects.id` | restrict // Source: `models/registration.model.js:84-93` |
| `projectName` | `STRING(100)` | // Source: `models/registration.model.js:94-98` |
| `opportunityId` | `STRING(50)` | LSQ opportunity id (integration field) // Source: `models/registration.model.js:99-103` |
| `activityId` | `STRING(50)` | LSQ activity id // Source: `models/registration.model.js:104-108` |
| `registrationNumber` | `STRING(50)` unique | // Source: `models/registration.model.js:109-113` |
| `walkInSourceId` | `BIGINT UNSIGNED` FK | // Source: `models/registration.model.js:114-122` |
| `walkInSourceXrCode` | `STRING(50)` | // Source: `models/registration.model.js:123-126` |
| `brokerId` | `BIGINT UNSIGNED` FK → `users.id` | // Source: `models/registration.model.js:127-135` |
| `details` | `JSON` | // Source: `models/registration.model.js:136-139` |
| `purchasePurpose` | `STRING(100)` | // Source: `models/registration.model.js:140-143` |
| `homeLoanIntent` | `BOOLEAN` | // Source: `models/registration.model.js:144-147` |
| `budgetAmount` | `STRING(50)` | // Source: `models/registration.model.js:148-151` |
| `preferredFloorMin/Max` | `TINYINT` | // Source: `models/registration.model.js:152-159` |
| `status` | `ENUM('Open','Won','Lost','Refund')` NOT NULL | // Source: `models/registration.model.js:160-163` |
| `stage` | `STRING(50)` NOT NULL | // Source: `models/registration.model.js:164-167` |
| `paymentStatus` | `ENUM('pending','success','failed')` NOT NULL | // Source: `models/registration.model.js:172-175` |
| `registrationTransactionId` | `INTEGER` | quick lookup for completed payment // Source: `models/registration.model.js:176-180` |
| `availableForAllocation` | `BOOLEAN` NOT NULL default `true` | // Source: `models/registration.model.js:181-187` |
| `additionalDocuments` | `JSON` | // Source: `models/registration.model.js:188-192` |

`Registration` is `paranoid: true` (soft-deletes) and has a **default scope** that excludes `status='Refund'`. Refunded rows are reachable only via `.scope('withRefunded')` // Source: `models/registration.model.js:194-213`.

### 2.2 `RegistrationUnit` (`models/registration-unit.model.js`)
| Field | Type | Notes |
|---|---|---|
| `id` | `INTEGER UNSIGNED` PK | // `:67-72` |
| `registrationId` | `BIGINT UNSIGNED` NOT NULL | // `:73-76` |
| `registrationNumber` | `STRING(50)` | // `:77-79` |
| `confirmationNumber` | `STRING(50)` | set on assign as `<regNo>-CN` // `:80-83`, set at `services/registration-unit.service.js:804` |
| `bookingNumber` | `STRING(50)` (`booking_number`) | set on assign as `<regNo>-BKD` // `:84-88`, set at `services/registration-unit.service.js:803` |
| `kycNumber` | `STRING(50)` | // `:89-93` |
| `apartmentType` | `STRING(50)` | // `:94-97` |
| `carpetArea` | `STRING(50)` | // `:98-101` |
| `registrationAmount` | `DECIMAL(15,2)` | // `:102-105` |
| `allocationAmount` | `DECIMAL(15,2)` | // `:106-109` |
| `allocationAmountGst` | `DECIMAL(15,2)` | // `:110-116` |
| `allocationStatus` | `ENUM('confirmed','available','waiting','cancelled','refunded')` | // `:117-120` |
| `status` | `ENUM('WAITLIST','PREALLOCATED','ALLOCATED','WINNER','HOLD','REFUND')` | // `:121-124` |
| `availableForAllocation` | `BOOLEAN` NOT NULL default `true` | // `:125-130` |
| `allocatedTower / allocatedFloor / allocatedUnit` | `STRING(20)` | // `:131-142` |
| `cancellationReason` | `JSON` | // `:143-146` |
| `allocationTransactionId` | `BIGINT UNSIGNED` | // `:147-151` |
| `allocationPaymentSource` | `ENUM('gateway','admin')` | // `:152-155` |
| `hcfTransactionStatus` | `ENUM('VERIFICATION','PAID','FAILED')` | // `:156-161` |
| `hcfTransactionId` | `BIGINT UNSIGNED` | // `:162-166` |
| `isKycSubmitted` | `BOOLEAN` NOT NULL default `false` | // `:167-172` |
| `eVerificationCompleted` | `BOOLEAN` NOT NULL default `false` | // `:173-178` |
| `eVerificationCompletedAt` | `DATE` | // `:179-184` |
| `selfKycSubmitted / selfKycBookingActivitySubmitted / selfKycFinalSubmitted` | `BOOLEAN` nullable | // `:185-208` |
| `isKycPdfSubmitted` | `BOOLEAN` NOT NULL default `false` | // `:197-202` |
| `isParkingSelected` | `TINYINT(1)` NOT NULL default `0` | // `:209-215` |
| `parkingCount` | `INTEGER UNSIGNED` nullable | // `:216-222` |
| `parkingAmount` | `DECIMAL(15,2)` nullable | // `:223-229` |
| `bookingTokenActivitySubmitted / mavisBookingCreated / mavisUnitUpdated / bookingFormActivitySubmitted / bookingActivitySubmitted / mavisBookingFinalUpdated` | `BOOLEAN` nullable (tri-state — `NULL=not attempted`, `TRUE=success`, `FALSE=failed`) | // `:230-289` |
| `lsqBookingActivityId / lsqBookingFormActivityId` | `STRING(255)` | LSQ integration ids // `:270-281` |
| `typologyId / unitId` | `STRING(50)` | // `:290-299` |
| `towerId` | `STRING(50)` (`tower_id`) | // `:300-305` |
| `paymentScheduleId` | `INTEGER` | // `:306-311` |
| `lsqCurrentScheduleId` | `STRING(50)` (`lsq_current_schedule_id`) | UUID v7 for LSQ/Mavis tracking // `:312-317` |
| `isAdditionalUnit` | `BOOLEAN` default `false` | // `:318-322` |
| `holdAt` | `DATE` | offline-payment hold marker // `:323-327` |
| `refundAt` | `DATE` | // `:342-345` |

`paranoid: true`, `deletedAt: 'deleted_at'`, audit-enabled (`RegistrationUnit.auditEnabled = true`) // Source: `models/registration-unit.model.js:347-358`.

### 2.3 `User` (`models/user.model.js`) — fields touched by Customers module
- `id` BIGINT UNSIGNED PK // `:65-70`
- `roleId` BIGINT UNSIGNED FK → `roles.id` // `:71-75`
- `prospectId` STRING(100) — LSQ prospect id // `:80-83`
- `firstName / lastName` STRING(100) // `:98-103`
- `countryCode` STRING(5), `phone` STRING(15), `email` STRING(100) — used by allocation notification // `:104-118`
- `panNumber` STRING(10) // `:128-130`

### 2.4 `RegistrationHomeLoan` (`models/registration-home-loan.model.js`)
- `loanApprovalStatus` `ENUM('pending','approved','admin_rejected','admin_approved')` // Source: `models/registration-home-loan.model.js:73-75`
- `approvalSource` `ENUM('user','admin')` // Source: `models/registration-home-loan.model.js:80-82`
- `step` `ENUM('in_progress','completed')` // Source: `models/registration-home-loan.model.js:40`
- `approvalMethod` `ENUM('self','easiloan')` // Source: `models/registration-home-loan.model.js:45`
- `employmentType` `ENUM('salaried','self_employed')` // Source: `models/registration-home-loan.model.js:49`

### 2.5 `Unit` (`models/unit.model.js`)
- `status` `ENUM('AVAILABLE','HOLD','BOOKED','REFUGE','PREBOOKED','PBT','RESERVED')` // Source: `models/unit.model.js:176-177`
- `allocationCalcType` `ENUM('PERCENT','AMOUNT')` // Source: `models/unit.model.js:414`

### 2.6 `MilestonePaymentTracking` writes used in this module
- `paymentStatus = 'PAID'`, `status ∈ {'paid','partial'}`, `gstPaid ∈ {0,1}` — set in offline-milestone path // Source: `controllers/milestone-payment.controller.js:1387-1392`
- On cancel: rows for non-registration milestones are soft-deleted (`deletedAt = NOW()`, `versionId = id`), registration milestone row keeps id but `regPaymentScheduleId` is nulled // Source: `controllers/admin.controller.js:3603-3621`, `controllers/admin.controller.js:2570-2589`

### 2.7 `milestoneKey` constants (`constants/global.js:126-133`)
| Constant | Value |
|---|---|
| `REGISTRATION_AND_UNIT_ALLOCATION` | `ml-or-ual` |
| `REGISTRATION` | `ml-or` |
| `UNIT_ALLOCATION` | `ml-ual` |
| `HOME_CONFIRMATION` | `ml-hcf` |
| `TDS` | `ml-tds` |
| `SDR` | `ml-rou` |

### 2.8 `PaymentType` constants (`constants/global.js:103-109`)
| Code | Meaning |
|---|---|
| `1` | `FULL_PRINCIPAL` |
| `2` | `HALF_PRINCIPAL` |
| `3` | `GST_ONLY` |
| `4` | `FULL_PRINCIPAL_GST` |
| `5` | `HALF_PRINCIPAL_GST` |

---

## 3. State Machines

### 3.1 `RegistrationUnit.status`
Enum: `WAITLIST | PREALLOCATED | ALLOCATED | WINNER | HOLD | REFUND` // Source: `models/registration-unit.model.js:121-124`

Transitions driven from this module:
| From | To | Trigger | Source |
|---|---|---|---|
| `PREALLOCATED` (or any status not `WINNER`/`HOLD`) | `WINNER` | Admin **assign offline unit** | `services/registration-unit.service.js:805` (sets `status='WINNER'`), gated by `status: { [Op.notIn]: ['WINNER','HOLD'] }` // `:654` |
| `WINNER` | `PREALLOCATED` | Admin **cancel units** (API or Excel) | `controllers/admin.controller.js:3503` (`ru.status = 'PREALLOCATED'`), gated by `status: 'WINNER'` // `:3430`, Excel path mirror at `:2470` gated by `unit.status !== 'WINNER'` // `:2400` |
| Any status with same `WINNER` (swap) | `WINNER` (relinked to new unit) | `unit-swap` event | `services/registration-unit.service.js:69` (no status change asserted, but unit fields reset and new unit assigned) |
| Any status except `BOOKED`/`HOLD`/`REFUND` AND `unitId IS NULL` | `REFUND` | Admin **refund registration unit** | `services/registration-unit.service.js:962-975, 989-997` |
| Anything except `REFUND`, with no `unitId` and not `WINNER`/`HOLD` | `REFUND` | Admin **bulk refund** (Excel) | `services/registration-unit.service.js:1197-1212, 1239-1251` |

### 3.2 `Registration.status`
Enum: `Open | Won | Lost | Refund` // Source: `models/registration.model.js:160-163`.

| From | To | Trigger | Source |
|---|---|---|---|
| any (with active units > 0) | `Refund` (and `availableForAllocation=false`) | Single refund when **all** child `RegistrationUnit` rows are now `REFUND` | `services/registration-unit.service.js:1000-1017` |
| any (with no remaining non-refunded units) | `Refund` (and `availableForAllocation=false`) | Bulk refund's per-chunk reconciliation pass | `services/registration-unit.service.js:1253-1281` |

### 3.3 `Unit.status` (`models/unit.model.js:176`)
Driven by this module:
| From | To | Trigger | Source |
|---|---|---|---|
| `AVAILABLE` or `RESERVED` | `BOOKED` | Assign offline unit | `services/registration-unit.service.js:830-831`; pre-check uses `status: { [Op.in]: ['AVAILABLE','RESERVED'] }` // `:689` |
| `AVAILABLE` or `RESERVED` | `BOOKED` | Unit swap (new unit) | `services/registration-unit.service.js:188-189` |
| previous unit on swap | `RESERVED` (only when no other consumers) | Unit swap (old unit) | `services/registration-unit.service.js:193-206` |
| `BOOKED` | `RESERVED` | Cancel units (single/bulk/excel) | `controllers/admin.controller.js:3505` (`units.status = 'RESERVED'`), Excel path: `:2472` |

### 3.4 `ParkingInventory.status` (referenced via `ParkingInventory.update`)
| From | To | Trigger | Source |
|---|---|---|---|
| `HOLD` or `BOOKED` | `AVAILABLE` (and `registrationUnitId = NULL`, `holdAt = NULL`) | Cancel units | `controllers/admin.controller.js:3630-3633`, Excel: `:2598-2601` |

### 3.5 `RegistrationDraft.status` cascade (refund)
| From | To | Source |
|---|---|---|
| `Won` | `Refunded` | `services/registration-unit.service.js:1020-1027`, `:1295-1302` |
| `Lost` | `Open` | `services/registration-unit.service.js:1029-1036`, `:1304-1312` |

### 3.6 `RegistrationHomeLoan.loanApprovalStatus`
| To | Trigger | Source |
|---|---|---|
| `admin_approved` | `home-loan-approval` event with `enable: true` | `services/registration-unit.service.js:361` |
| `admin_rejected` | `home-loan-approval` event with `enable: false` | `services/registration-unit.service.js:361` |

---

## 4. Business Rules

### 4.1 Routing & access
- B-CUS-001 — All Customers endpoints require admin role: `router.use(protect, restrictTo('admin'))` // Source: `routes/admin.routes.js:53`.
- B-CUS-002 — `projectId` is derived from environment: `app.production ? 1 : 2` (NOT taken from request unless explicitly named in body) // Source: `controllers/admin.controller.js:111, 1559, 1584, 2324, 3388`; same default in services `services/registration-unit.service.js:71, 627, 943, 1078`.

### 4.2 Global pre-flight: active allocation campaign blocks writes
- B-CUS-010 — Cannot cancel booking when campaign is active // Source: `controllers/admin.controller.js:3394-3396` (single cancel), `:2331-2333` (excel cancel).
- B-CUS-011 — Cannot swap unit when campaign is active // Source: `services/registration-unit.service.js:77-79`.
- B-CUS-012 — Cannot assign offline unit when campaign is active // Source: `services/registration-unit.service.js:631-633`.
- B-CUS-013 — Cannot refund (single or bulk) when campaign is active // Source: `services/registration-unit.service.js:949-951`, `:1084-1086`.

### 4.3 Assign Offline Unit (`PUT /api/v1/admin/registration-units/:registrationUnitId/assign-unit`)
- B-CUS-020 — `unitId` (target), `transactionId`, `amount` (positive), `paymentMethod`, `dateOfTxn` required // Source: `validations/admin.validations.js:254-260`.
- B-CUS-021 — Registration unit must NOT already be in `WINNER` or `HOLD` // Source: `services/registration-unit.service.js:654` and `:660`.
- B-CUS-022 — Registration unit must NOT already have a `unitId`; if it does, error: "Unit already assigned. Use unit-swap instead" // Source: `services/registration-unit.service.js:663-665`.
- B-CUS-023 — Target unit must exist for the registration's project AND be in `AVAILABLE` or `RESERVED` status // Source: `services/registration-unit.service.js:686-693`.
- B-CUS-024 — Target unit's `UnitTypology` must exist // Source: `services/registration-unit.service.js:699-703` (typology lookup), throw `Requested unit not available` if not found `:695-697`.
- B-CUS-025 — `payment.amount` must be ≥ computed `pricingDetails.allocationAmount` (else `Allocation amount should be at least ${X}`) // Source: `services/registration-unit.service.js:746-748`.
- B-CUS-026 — Target unit must not be linked to any other `RegistrationUnit`; conflict throw "Unit already assigned to another registration" // Source: `services/registration-unit.service.js:750-759`.
- B-CUS-027 — `transactionId` must be unique across `payment_transactions` // Source: `services/registration-unit.service.js:562-570`.
- B-CUS-028 — Payment proof file is uploaded to Azure under `payment_proof/<userId>/<filename>`; failure aborts // Source: `services/registration-unit.service.js:596-622, 761-769`.
- B-CUS-029 — On success: `RegistrationUnit` gets `status='WINNER'`, `allocationStatus='confirmed'`, `bookingNumber=<regNo>-BKD`, `confirmationNumber=<regNo>-CN`, `allocationPaymentSource='admin'`, KYC/Mavis/LSQ flags reset to retrigger (branching by `isKycSubmitted`) // Source: `services/registration-unit.service.js:795-825`.
- B-CUS-030 — Two `MilestonePaymentTracking` rows are reconciled: `ml-ual` (UNIT_ALLOCATION, marked `status='paid'`, `paymentStatus='PAID'`) and `ml-or` (REGISTRATION) is rewired to the new schedule id // Source: `services/registration-unit.service.js:836-875`.
- B-CUS-031 — A new `PaymentTransaction` is created with `paymentSource='admin'`, `isOffline=true`, `status='completed'`, `gateway=null` // Source: `services/registration-unit.service.js:572-594`.
- B-CUS-032 — Mavis sync is fired post-commit, non-blocking // Source: `services/registration-unit.service.js:892`.
- B-CUS-033 — Redis caches (registration data, unit data, alloc keys) updated best-effort post-commit; failures are logged but do not roll back // Source: `services/registration-unit.service.js:894-936`.

### 4.4 Update Registration Unit (`PUT /api/v1/admin/registration-units/:registrationUnitId`) — event dispatcher
- B-CUS-040 — Body must include `event ∈ {'unit-swap','update-parking','home-loan-approval','allocation_transaction_update'}` // Source: `validations/admin.validations.js:262-281`.
- B-CUS-041 — `processRegistrationUnitUpdateEvent` throws "Unsupported event" if `event` is not in handler map // Source: `services/registration-unit.service.js:50-58`.

#### 4.4.1 `unit-swap`
- B-CUS-050 — `payload.unitId` required // Source: `validations/admin.validations.js:235-237`.
- B-CUS-051 — Target unit cannot equal current `unitId` // Source: `services/registration-unit.service.js:93-95`.
- B-CUS-052 — Mavis-side booking for the existing `bookingNumber` must NOT still exist; checked via `mavisService.findBookingRowId` — if found, error "Mavis booking still exists, please clear that step first" // Source: `services/registration-unit.service.js:97-105`.
- B-CUS-053 — Target unit must be `AVAILABLE` or `RESERVED` in the registration's project // Source: `services/registration-unit.service.js:118-122`.
- B-CUS-054 — Target unit's typology must exist // Source: `services/registration-unit.service.js:128-136`.
- B-CUS-055 — Target unit must not already be assigned to another registration // Source: `services/registration-unit.service.js:138-147`.
- B-CUS-056 — Previous unit returns to `RESERVED` only if no other `RegistrationUnit` still references it // Source: `services/registration-unit.service.js:193-206`.
- B-CUS-057 — On swap, `bookingTokenActivitySubmitted`, `mavisBookingCreated`, `mavisUnitUpdated`, `lsqBookingActivityId`, `lsqBookingFormActivityId`, `isKycPdfSubmitted` are reset; KYC flags branch per `isKycSubmitted` // Source: `services/registration-unit.service.js:161-184`.

#### 4.4.2 `update-parking`
- B-CUS-060 — `payload.additionalParkingEnabled: boolean` required // Source: `validations/admin.validations.js:238-242`.
- B-CUS-061 — `delta = next - current` must be non-zero, else "No change in parking count" // Source: `services/registration-unit.service.js:319-321`.
- B-CUS-062 — `unitTypology.availableParkingSpots` must be ≥ delta when delta > 0, else "Available parking count (X) is less than required (Y)" // Source: `services/registration-unit.service.js:323-327`.
- B-CUS-063 — `availableParkingSpots` is decremented (or incremented when delta < 0) by `delta` // Source: `services/registration-unit.service.js:330-333`.
- B-CUS-064 — `RegistrationUnit.isParkingSelected = Boolean(additionalParkingEnabled)`, `parkingCount = nextCount`, `parkingAmount = Number(parkingAmount) || 0` // Source: `services/registration-unit.service.js:336-338`.

#### 4.4.3 `home-loan-approval`
- B-CUS-070 — `payload.enable: boolean` required // Source: `validations/admin.validations.js:243-245`.
- B-CUS-071 — Status mapped as `enable ? 'admin_approved' : 'admin_rejected'`; `approvalSource='admin'`; `approvedBy = user.id`; `approvedAt = new Date()` // Source: `services/registration-unit.service.js:359-365`.
- B-CUS-072 — If no `RegistrationHomeLoan` row exists, a new one is created with `step: null`; else existing row is updated // Source: `services/registration-unit.service.js:367-382`.
- B-CUS-073 — **No notification, email, SMS, or WhatsApp is dispatched** for either approval or rejection (function body returns immediately after the upsert) // Source: `services/registration-unit.service.js:349-387`.

#### 4.4.4 `allocation_transaction_update`
- B-CUS-080 — `payload.transactionId`, `amount`, `paymentMethod`, `dateOfTxn` required // Source: `validations/admin.validations.js:246-251`.
- B-CUS-081 — `transactionId` must be unique across `payment_transactions`, else conflict "Transaction ID already exists" // Source: `services/registration-unit.service.js:463-470`.
- B-CUS-082 — Old `PaymentTransaction` (if any, linked via `registrationUnit.allocationTransactionId`) is soft-deleted // Source: `services/registration-unit.service.js:481-495`.
- B-CUS-083 — New `PaymentTransaction` created with `transactionType=2`, `status='completed'`, `gateway='easebuzz'` (NB: `gateway` is hardcoded to `'easebuzz'` even though this is an admin manual update) // Source: `services/registration-unit.service.js:498-515`.

### 4.5 Cancel Registration Units (`PUT /api/v1/admin/cancel-units`)
- B-CUS-100 — Request body must contain `updatedRowKeys: number[]` (non-empty); SQL-injection guard rejects any non-integer ids // Source: `controllers/admin.controller.js:3371-3385`.
- B-CUS-101 — Only `RegistrationUnit` rows whose `status='WINNER'` are considered; row count mismatch throws "Invalid record IDs provided" // Source: `controllers/admin.controller.js:3429-3448`.
- B-CUS-102 — Environment prefix is prepended to `bookingNumber` when querying Mavis: `D` for dev, `U` for UAT, none for production // Source: `controllers/admin.controller.js:3452-3456`.
- B-CUS-103 — Mavis booking must NOT exist for any selected unit, else "Mavis booking still exists, please clear that step first" // Source: `controllers/admin.controller.js:3458-3464`.
- B-CUS-104 — Raw SQL bulk-update resets ALL allocation/KYC/Mavis/LSQ/parking fields on `registration_units` (`status='PREALLOCATED'`, `available_for_allocation=1`, all flags nulled/zeroed), sets `units.status='RESERVED'`, and soft-deletes the linked `payment_transactions` row // Source: `controllers/admin.controller.js:3466-3508`.
- B-CUS-105 — Audit logs are written per unit (`RegistrationUnit`, `Unit`, `PaymentTransaction` snapshots) // Source: `controllers/admin.controller.js:3520-3599`.
- B-CUS-106 — `MilestonePaymentTracking` rows for milestones `≠ REGISTRATION` are soft-deleted; the REGISTRATION row keeps id but `regPaymentScheduleId` is nulled // Source: `controllers/admin.controller.js:3603-3621`.
- B-CUS-107 — `RegistrationUnitPaymentSchedule` rows soft-deleted // Source: `controllers/admin.controller.js:3624-3627`.
- B-CUS-108 — Parking inventory rows whose status was `HOLD` or `BOOKED` are released to `AVAILABLE` // Source: `controllers/admin.controller.js:3630-3633`.
- B-CUS-109 — Registration offers (`RegistrationUnitOffer`) are soft-deleted // Source: `controllers/admin.controller.js:3636-3639`.
- B-CUS-110 — Post-commit: Redis registration cache rewritten to `PREALLOCATED`, alloc keys deleted; unit cache rewritten to `RESERVED`; per-row failures are logged best-effort // Source: `controllers/admin.controller.js:3644-3680`.
- B-CUS-111 — Post-commit: `syncCancelledUnitsToPython(recordExists)` fired (external Python service, treated as integration point) // Source: `controllers/admin.controller.js:3695`.

### 4.6 Cancel by Excel Upload (`PUT /api/v1/admin/cancel-units-excel`)
- B-CUS-120 — File field name: `doc` (multipart `multer.single('doc')`) // Source: `routes/admin.routes.js:70`.
- B-CUS-121 — First column of each row is treated as the Registration Number (the column header label is informational only) // Source: `controllers/admin.controller.js:2315-2321`.
- B-CUS-122 — Sample download has a single column header `Registration Number` and exactly one blank row // Source: `controllers/admin.controller.js:2280-2299`.
- B-CUS-123 — Duplicate registration numbers in the file → row recorded as `FAILED — Duplicate entry`; unknown → `FAILED — Not found`; status ≠ `WINNER` → `FAILED — Not cancelable` // Source: `controllers/admin.controller.js:2381-2409`.
- B-CUS-124 — At least one valid `WINNER` unit required else `No valid units available for cancellation` // Source: `controllers/admin.controller.js:2411-2413`.
- B-CUS-125 — Same Mavis pre-check as single cancel applies // Source: `controllers/admin.controller.js:2423-2429`.
- B-CUS-126 — Same SQL reset, milestone soft-delete, parking release, offers soft-delete, cache cleanup as `cancelRegistrationUnits` // Source: `controllers/admin.controller.js:2433-2629`.

### 4.7 Refund Registration Unit (`PUT /api/v1/admin/registration-units/:registrationUnitId/refund`)
- B-CUS-130 — Admin authentication required (returns Unauthorized if `req.user` missing) // Source: `services/registration-unit.service.js:945-947`.
- B-CUS-131 — Registration unit must NOT be in `BOOKED`, `HOLD`, or `REFUND`; gated by query // Source: `services/registration-unit.service.js:959-967, 970`.
- B-CUS-132 — Registration unit must NOT have a `unitId` — error "Allocated units cannot be refunded" // Source: `services/registration-unit.service.js:973-975`.
- B-CUS-133 — Sets `RegistrationUnit.status='REFUND'`, `refundAt=now` // Source: `services/registration-unit.service.js:989-997`.
- B-CUS-134 — If no remaining non-refund units exist for this `Registration`, registration row goes `Registration.status='REFUND'`, `availableForAllocation=false`; drafts cascade (`Won → Refunded`, `Lost → Open`) // Source: `services/registration-unit.service.js:1000-1037`.
- B-CUS-135 — Best-effort Redis deletion of `registrationDataKey` and `registrationAllocKey` // Source: `services/registration-unit.service.js:1042-1057`.

### 4.8 Bulk Refund (`POST /api/v1/admin/registration-units/refund-bulk`)
- B-CUS-140 — File field name: `doc` // Source: `routes/admin.routes.js:134`.
- B-CUS-141 — File may be CSV or XLSX (auto-detected by mimetype/extension) // Source: `services/registration-unit.service.js:1098-1103`.
- B-CUS-142 — Sample file: two columns `Registration Number`, `Update (1/0)` // Source: `controllers/admin.controller.js:1513-1517`.
- B-CUS-143 — Only rows with `Update (1/0) = 1` (numeric) are processed // Source: `services/registration-unit.service.js:1117-1129`.
- B-CUS-144 — Processed in chunks of 250 with separate transactions per chunk // Source: `services/registration-unit.service.js:1135-1149`.
- B-CUS-145 — Per-row outcome buckets: `SUCCESS`, `SKIPPED` (`Already refunded`), `FAILED` (`Duplicate entry in file` / `Not found` / `Unit already allocated` / `Unit already allocated or in hold` / `System error`) // Source: `services/registration-unit.service.js:1171-1212, 1338-1348`.
- B-CUS-146 — Each successful row gets an `ADMIN_BULK_REFUND_REGISTRATION_UNIT` audit log // Source: `services/registration-unit.service.js:1213-1233`.
- B-CUS-147 — Same `Registration` rollup to `Refund` if no active units remain, with same draft cascade // Source: `services/registration-unit.service.js:1253-1312`.
- B-CUS-148 — Response is an Excel file with columns `Registration Number`, `Status`, `Reason`, `Update (1/0)` (constructed in the controller) // Source: `controllers/admin.controller.js:1534-1546`.

### 4.9 Offline Milestone Payment (`POST /api/v1/admin/milestone-payment/offline`)
- B-CUS-160 — File upload field name: `paymentProof` (mandatory by `enforceMandatoryPaymentProofRules`) // Source: `routes/admin.routes.js:175-181`.
- B-CUS-161 — Body schema: `registrationNumber`, `milestoneId`, `milestoneKey`, `amount > 0`, `paymentType ∈ {1,2,3,4,5}`, `paymentMethod ∈ {'NEFT','Cheque','Cash','CC','DC','UPI'}`, `transactionId`, `transactionDate` // Source: `validations/admin.validations.js:6-25`.
- B-CUS-162 — HCF milestones (`milestoneKey === 'ml-hcf'`) allow only `paymentType` 4 or 5 // Source: `validations/admin.validations.js:28-38`, `controllers/milestone-payment.controller.js:1092`.
- B-CUS-163 — `transactionDate` must parse strictly as `YYYY-MM-DD HH:mm:ss` via dayjs // Source: `controllers/milestone-payment.controller.js:1098-1101`.
- B-CUS-164 — `registrationNumber` must resolve to a `RegistrationUnit` with `status='WINNER'`, else "Invalid registration unit or not eligible for milestone payment" // Source: `controllers/milestone-payment.controller.js:1111-1127`.
- B-CUS-165 — `transactionId` must be unique across `payment_transactions` // Source: `controllers/milestone-payment.controller.js:1139-1148`.
- B-CUS-166 — `PaymentTransactionType` row for `milestoneKey` must exist // Source: `controllers/milestone-payment.controller.js:1151-1157`.
- B-CUS-167 — `RegistrationUnitPaymentSchedule` row for `(registrationUnitId, milestoneId)` must exist // Source: `controllers/milestone-payment.controller.js:1160-1168`.
- B-CUS-168 — If a `MilestonePaymentTracking` row exists and `status='paid'`, throw "Milestone already fully paid" // Source: `controllers/milestone-payment.controller.js:1210-1212`.
- B-CUS-169 — Outstanding-amount guards: total outstanding > tolerance else "No remaining balance to pay" // Source: `controllers/milestone-payment.controller.js:1275-1277`.
- B-CUS-170 — Non-HCF payment-type rules (`paymentType ∈ {1,2,3}`):
  - `1` (FULL_PRINCIPAL): amount must equal remaining principal outstanding within tolerance // Source: `controllers/milestone-payment.controller.js:1293-1295`.
  - `2` (HALF_PRINCIPAL): amount must be strictly less than remaining principal outstanding // Source: `controllers/milestone-payment.controller.js:1297-1299`.
  - `3` (GST_ONLY): GST must be configured, not already paid, and amount must match GST outstanding exactly // Source: `controllers/milestone-payment.controller.js:1302-1314`.
- B-CUS-171 — HCF payment-type rules (`paymentType ∈ {4,5}`): `4` requires exact full match; `5` requires strictly less than outstanding // Source: `controllers/milestone-payment.controller.js:1315-1327`.
- B-CUS-172 — `PaymentTransaction` created with `paymentSource='admin'`, `isOffline=true`, `status='completed'`, `gateway=null`, `paymentProof` blob name, `createdAt = transactionDate` // Source: `controllers/milestone-payment.controller.js:1342-1369`.
- B-CUS-173 — `MilestonePaymentTracking` upsert: `paymentStatus='PAID'`, `status='paid' | 'partial'` based on whether `finalPaidAmount >= totalAmount` within tolerance // Source: `controllers/milestone-payment.controller.js:1329-1395`.
- B-CUS-174 — For HCF milestones, `RegistrationUnit.hcfTransactionStatus='PAID'` and `hcfTransactionId=newTxnId` // Source: `controllers/milestone-payment.controller.js:1411-1419`.
- B-CUS-175 — Post-commit, for `paymentType ∈ {4,5}` AND `registration.opportunityId` present, `updateOpportunityWithMilestonePayment` is called (LSQ integration point, non-blocking) // Source: `controllers/milestone-payment.controller.js:1423-1442`.
- B-CUS-176 — `syncMavisMilestonePayment` is fired post-commit (Mavis integration point, non-blocking) // Source: `controllers/milestone-payment.controller.js:1444-1452`.

### 4.10 Customer Actions (additional registration units)
- B-CUS-180 — `GET /customer-actions` returns the two `MasterConfig` keys `allow_additional_reg_unit` and `additional_reg_units_details` scoped to `projectId` // Source: `controllers/admin.controller.js:1557-1577`.
- B-CUS-181 — `POST /customer-actions` body requires `addRegUnitsDetails` (else "Invalid request") // Source: `controllers/admin.controller.js:1586-1588`.
- B-CUS-182 — `'2 Bed Peak Home'` is force-overridden to `isAllowed: false, countAllowed: 0` regardless of input // Source: `controllers/admin.controller.js:1591-1594`.
- B-CUS-183 — If new payload is byte-equal to existing config, return 400 "No Change Detected" // Source: `controllers/admin.controller.js:1607-1615`.

### 4.11 Customer Listing (`GET /api/v1/admin/dashboard/all-buyers`)
- B-CUS-190 — KPIs computed in one aggregated `RegistrationUnit.findAll` over the project (`registeredCount`, `refundedCount`, `waitlistCount`, `kycPendingCount`, `confirmedCount`, `activeTower`) // Source: `controllers/admin.controller.js:127-209`.
- B-CUS-191 — Pagination via `limitOffset(limit, page)`; disabled when `isDownload === '1'` (download mode) // Source: `controllers/admin.controller.js:109, 125`.
- B-CUS-192 — Query filters supported: `globalSearch`, `hasHomeLoan`, `registrationNumber`, `growthPartnerHvCode`, `unitConfirmationNumber`, `unitNo`, `allotmentStatus`, `paymentStatus`, `kycStatus`, `sortKey`, `sortOrder` // Source: `controllers/admin.controller.js:212-224`.

---

## 5. Notification Dispatch

Verified across the entire Customers admin surface. **Email is never sent for any admin Customers action** in this module — no `email.service.js` import or call appears in any code path verified below.

| # | Admin Action | WhatsApp | SMS | Email | Push | Source |
|---|---|---|---|---|---|---|
| 1 | Cancel Registration Unit (single, `cancelRegistrationUnits`) | NONE | NONE | NONE | NONE | `controllers/admin.controller.js:3367-3700` — no `sendWhatsApp*`, `sendSMS`, `email*`, or `allocationNotificationService` call. Only `syncCancelledUnitsToPython` (integration sync, not a notification) at `:3695`. |
| 2 | Cancel Units by Excel (`cancelByExcelUpload`) | NONE | NONE | NONE | NONE | `controllers/admin.controller.js:2301-2689` — no notification dispatch in the function body. |
| 3 | Home Loan Approval/Rejection (`updateHomeLoanDetails`) | NONE | NONE | NONE | NONE | `services/registration-unit.service.js:349-387` — zero notification calls; function only upserts `RegistrationHomeLoan` and returns. |
| 4 | Assign Unit (offline, `assignOfflineUnit`) | YES — template `congrates_payment_success_27sept`, vars `[firstName, "<towerName> - <allocatedUnit>"]` | YES — template `ALLOTMENT_PAYMENT_SUCCESS`, **only when `countryCode === '+91'`** | NONE | NONE | Dispatched via `allocationNotificationService(true, smsData)` at `services/registration-unit.service.js:879-885`. Template ids and channel split defined at `services/allocation.service.js:1818-1832`. WhatsApp template registered at `services/api/whatsapp.service.js:71`. |
| 5 | Refund Registration Unit (single, `processRegistrationUnitRefund`) | NONE | NONE | NONE | NONE | `services/registration-unit.service.js:941-1073` — notification call is explicitly commented out at `:1059-1062` (`// allocationNotificationService(false, { ... });`). |
| 6 | Bulk Refund (`processBulkRegistrationUnitRefund`) | NONE | NONE | NONE | NONE | `services/registration-unit.service.js:1075-1358` — no notification dispatch. |
| 7 | Unit Swap (`swapRegistrationUnit`) | NONE | NONE | NONE | NONE | `services/registration-unit.service.js:69-282` — no notification call. |
| 8 | Update Parking (`updateParkingDetails`) | NONE | NONE | NONE | NONE | `services/registration-unit.service.js:285-347` — no notification call. |
| 9 | Allocation Transaction Update (`handleAllocationTransactionUpdate`) | NONE | NONE | NONE | NONE | `services/registration-unit.service.js:451-553` — no notification call. |
| 10 | Offline Milestone Payment (`submitOfflineMilestonePayment`) | NONE | NONE | NONE | NONE | `controllers/milestone-payment.controller.js:1063-1484` — no notification call. Only LSQ opportunity update (`:1423-1442`) and Mavis sync (`:1444-1452`), both integration sync — not buyer-facing notifications. |
| 11 | Customer Actions GET/POST (`getCustomerActions`, `updateCustomerActions`) | NONE | NONE | NONE | NONE | `controllers/admin.controller.js:1557-1655` — config-only, no notification. |

### Reference — `allocationNotificationService` (the only buyer-facing dispatcher reachable from admin Customers)
```
// Source: services/allocation.service.js:1796-1833
export async function allocationNotificationService(status, smsData) {
  if (status === false) {
    // sends WhatsApp 'payment_unsuccessful_27sept' + SMS 'ALLOTMENT_PAYMENT_FAILED' (+91 only)
    // NOT reachable from admin Customers module — refund call is commented out
  }
  // status === true:
  await sendWhatsAppMessage(`${countryCode}${phone}`, 'congrates_payment_success_27sept',
    [firstName, `${towerName} - ${allocatedUnit}`]);
  if (smsData.countryCode === '+91') {
    sendSMS(`${countryCode}${phone}`, 'ALLOTMENT_PAYMENT_SUCCESS');
  }
}
```

WhatsApp template metadata (Kaleyra integration):
- `ALLOTMENT_PAYMENT_SUCCESS` SMS template name // Source: `services/allocation.service.js:1831`
- `ALLOTMENT_PAYMENT_SUCCESS` WhatsApp template id `1007773493338886225`, entity `1001286607558438702` // Source: `services/api/whatsapp.service.js:71-73`
- `congrates_payment_success_27sept` is the literal template name passed to `sendWhatsAppMessage` // Source: `services/allocation.service.js:1819`

---

## 6. API Endpoints

All paths below are prefixed with `/api/v1/admin` (mounted in `routes/index.js`). Admin-only guard applied at parent router (`routes/admin.routes.js:53`).

| # | Method | Path | Controller fn | Auth | Body validator | Notes |
|---|---|---|---|---|---|---|
| 1 | GET | `/dashboard/all-buyers` | `AdminController.getAllBuyers` `admin.controller.js:107` | `protect, restrictTo('admin')` | none (query string only) | Customer-list + KPIs // route `admin.routes.js:100` |
| 2 | PUT | `/cancel-units` | `AdminController.cancelRegistrationUnits` `admin.controller.js:3367` | admin | inline (`updatedRowKeys: number[]`) | // route `admin.routes.js:69` |
| 3 | PUT | `/cancel-units-excel` | `AdminController.cancelByExcelUpload` `admin.controller.js:2301` | admin | `multer.single('doc')` (XLSX) | // route `admin.routes.js:70` |
| 4 | GET | `/bulk-cancel-sample` | `AdminController.downloadBulkCancellationSample` `admin.controller.js:2280` | admin | — | XLSX download // route `admin.routes.js:71` |
| 5 | GET | `/bulk-refund-sample` | `AdminController.downloadBulkRefundSample` `admin.controller.js:1511` | admin | — | XLSX download // route `admin.routes.js:72` |
| 6 | PUT | `/registration-units/:registrationUnitId` | `AdminController.updateRegistrationUnit` `admin.controller.js:1377` | admin | `updateRegistrationUnitSchema` (event dispatcher) `admin.validations.js:262-283` | Handles `unit-swap`, `update-parking`, `home-loan-approval`, `allocation_transaction_update` // route `admin.routes.js:110-114` |
| 7 | PUT | `/registration-units/:registrationUnitId/assign-unit` | `AdminController.registerOfflineUnit` `admin.controller.js:1425` | admin | `offlinePaymentProofUpload` + `enforceOfflinePaymentProofRules` + `validateAssignOfflineUnit` `admin.validations.js:254-260, 285-292` | Multipart with `paymentProof` file // route `admin.routes.js:116-132` |
| 8 | PUT | `/registration-units/:registrationUnitId/refund` | `AdminController.refundRegistrationUnit` `admin.controller.js:1475` | admin | — | // route `admin.routes.js:133` |
| 9 | POST | `/registration-units/refund-bulk` | `AdminController.bulkRefundRegistrationUnits` `admin.controller.js:1530` | admin | `multer.single('doc')` (CSV or XLSX) | // route `admin.routes.js:134` |
| 10 | GET | `/customer-actions` | `AdminController.getCustomerActions` `admin.controller.js:1557` | admin | — | // route `admin.routes.js:136` |
| 11 | POST | `/customer-actions` | `AdminController.updateCustomerActions` `admin.controller.js:1579` | admin | inline (`allowAddRegUnit`, `addRegUnitsDetails`) | // route `admin.routes.js:137` |
| 12 | POST | `/milestone-payment/offline` | `MilestonePaymentController.submitOfflineMilestonePayment` `milestone-payment.controller.js:1063` | admin | `offlinePaymentProofUpload` + `enforceMandatoryPaymentProofRules` + `submitOfflineMilestonePaymentSchema` `admin.validations.js:7-25` | // route `admin.routes.js:175-181` |

### Related (referenced from Customers UI but owned by other modules)
| Method | Path | Controller | Notes |
|---|---|---|---|
| GET | `/registration-units/booking-form-data/:registrationUnitId` | `getRegistrationUnitBookingFormData` (user.controller) | Booking-form data for KYC // `admin.routes.js:101` |
| GET | `/registration-status` | `getRegistrationStatus` (registration.controller) | // `admin.routes.js:103` |
| POST | `/registration/transaction/reconcile` | `reconcileApiViaReferenceNo` (registration.controller) | // `admin.routes.js:60` |

---

## 7. Known Bugs / Gaps

1. **`allocation_transaction_update` hardcodes `gateway='easebuzz'`** even though this is an explicit admin manual update of allocation payment metadata. Future audits or reconciliation reports may misattribute the channel.
   // Source: `services/registration-unit.service.js:511`.

2. **No notification on refund** — `allocationNotificationService(false, ...)` is commented out in `processRegistrationUnitRefund`, meaning a refunded buyer receives NO WhatsApp/SMS confirmation of the refund. Bulk refund similarly silent.
   // Source: `services/registration-unit.service.js:1059-1062`, `services/registration-unit.service.js:1075-1358`.

3. **`assignOfflineUnit` performs the unit-exists conflict check OUTSIDE the lock window** — it queries `RegistrationUnit.findOne({ where: { unitId: unit.unitId } })` without `transaction` or `lock`, after already locking the target unit. The `Unit.findOne` with `lock` (`:686-693`) and the conflict check (`:750-759`) are not in the same isolation pair — a race window between two parallel offline-assigns is theoretically possible.
   // Source: `services/registration-unit.service.js:750-759`.

4. **`cancelRegistrationUnits` does not filter by `projectId` in the SQL `UPDATE`** — the controller fetches `RegistrationUnit` rows scoped to `projectId` via the include, but the raw SQL bulk update only filters `WHERE ru.id IN (:ids)`. If an admin somehow supplies ids belonging to another project (only ID-based check), the update runs anyway. (Acceptable in practice because the pre-fetch enforces project scope, but the SQL alone is not project-safe.)
   // Source: `controllers/admin.controller.js:3466-3508`.

5. **`registration_units.is_kyc_pdf_submitted` is set to `0` on cancel** but the model defines it as `BOOLEAN NOT NULL default false` — should be fine, but the bulk SQL uses literal `0` which relies on MySQL TINYINT coercion.
   // Source: `controllers/admin.controller.js:3488`, model `models/registration-unit.model.js:197-202`.

6. **`updateCustomerActions` silently overrides `'2 Bed Peak Home'`** to disabled, regardless of admin input — this is hard-coded business logic with no audit log of the override.
   // Source: `controllers/admin.controller.js:1591-1594`.

7. **`updateCustomerActions` performs `customerAction.save()` without a wrapping transaction**, so if the second `.save()` fails the first one is already committed.
   // Source: `controllers/admin.controller.js:1617-1633`.

8. **Bulk Excel cancel `processedRows` only handles two specific column header variants** (`registration_number` / `registration number`) — any other header normalization (e.g., camelCase, leading/trailing spaces beyond `.trim()`) is silently dropped.
   // Source: `controllers/admin.controller.js:2315-2321` (note: this is for cancel by excel — first-column-by-position; bulk refund uses key matching at `services/registration-unit.service.js:1110-1122`).

9. **`bulkRefundRegistrationUnits` per-chunk transaction rolls back the chunk but marks ALL rows in that chunk as `FAILED — System error`** — even ones that earlier passed validation. Customers whose row was good in a chunk with one bad row get an unfair `FAILED` line in the result Excel.
   // Source: `services/registration-unit.service.js:1338-1348`.

10. **Audit-log `actorType` is inconsistent** — `cancelRegistrationUnits` and `cancelByExcelUpload` use `actorType: 'User'` (`controllers/admin.controller.js:3524, 2491`) while `processBulkRegistrationUnitRefund` uses `actorType: 'admin'` (`services/registration-unit.service.js:1214`). Downstream audit dashboards may double-count.

11. **Refund single-unit best-effort cache cleanup** does NOT clear unit-level keys (`getUnitDataKey`, `getUnitAllocKey`) — only registration keys. Stale unit cache may persist after refund if the refund was for a unit that had been provisionally linked then unlinked elsewhere.
    // Source: `services/registration-unit.service.js:1042-1057`.

---

## 8. QA Risk Areas

| # | Risk | Why | Suggested test focus |
|---|---|---|---|
| 1 | **Active-campaign guard** | Every write (cancel, swap, assign, refund) is blocked when a campaign is active. Easy to miss in regression. | Run each admin Customers action twice — once with no active campaign, once with an active campaign per project. Expect 400 "Cannot ... when campaign is active". // Sources cited in B-CUS-010..013. |
| 2 | **Notification regression — assign unit** | The only path that fires notifications. SMS suppressed unless `countryCode === '+91'`. WhatsApp template name is a string literal. | Test with `+91`, `+1`, and a buyer with missing `countryCode` (default `'+91'` per `services/registration-unit.service.js:880`). Verify exactly: 1 WhatsApp call + 1 SMS call for +91; 1 WhatsApp call + 0 SMS for non-+91; no email. |
| 3 | **Notification silence — refund** | Buyer-facing silence is product-impacting (UX bug-class) but not a code bug. Confirm whether business expects an explicit refund notification. | Cross-reference with BRD; flag if BRD says otherwise. // Source: `services/registration-unit.service.js:1059-1062`. |
| 4 | **`unit-swap` Mavis pre-check** | Booking prefix is environment-sensitive (`environmentPrefix(false, true, true)`). Misconfiguration could let stale Mavis bookings pass through. | Run swap on env=`development` (booking id prefixed `D`), `uat` (`U`), `production` (no prefix). // Source: `services/registration-unit.service.js:97`, controller mirror at `controllers/admin.controller.js:3452-3456`. |
| 5 | **Parking inventory leak** | Parking-pool delta is mutated under a row lock on `unitTypology`. Two admins editing parking on the same typology concurrently would be serialized — but a crash mid-transaction could leave `availableParkingSpots` correct or off-by-one. | Concurrent parking-update test on same typology + crash injection. // Source: `services/registration-unit.service.js:285-347`. |
| 6 | **Cancel-by-Excel duplicate detection** | Done via `seenRegs` Map — case-sensitive on registration number. Two rows that differ only in casing or trailing whitespace could both pass. | Excel with mixed-case registration numbers, leading/trailing spaces. // Source: `controllers/admin.controller.js:2381-2394`. |
| 7 | **Bulk refund chunk-level failure cascade** | One row's failure rolls back the entire chunk and marks all 250 rows as FAILED. | Excel with one deliberately-bad row in a 250-row chunk; assert the other 249 are not regressed. // Source: `services/registration-unit.service.js:1338-1348`. |
| 8 | **Soft-delete chain on cancel** | Cancel touches 5 tables (`payment_transactions`, `milestone_payment_tracking`, `registration_unit_payment_schedule`, `parking_inventory`, `registration_unit_offers`) plus `registration_units` + `units`. Partial commit risk if any single statement fails inside the transaction. | Inject a controlled failure (e.g., FK violation on `parking_inventory`) and assert nothing was committed. // Source: `controllers/admin.controller.js:3466-3700`. |
| 9 | **Offline milestone payment-type matrix** | 5 payment types × HCF/non-HCF × existing-tracking-row/no-row × GST-already-paid/not-paid = ~40 branches. Each has its own error message. | Build a matrix test on `submitOfflineMilestonePayment` covering every branch listed in B-CUS-170/171. // Source: `controllers/milestone-payment.controller.js:1279-1334`. |
| 10 | **Home-loan approval audit trail** | `updateHomeLoanDetails` writes via `Sequelize.update` without an explicit `audit:` option; relies on `RegistrationHomeLoan.auditEnabled`. Verify audit log entry exists. | Approve/reject home loan, assert an audit row appears in `audit_logs`. // Source: `services/registration-unit.service.js:371-382`. |
| 11 | **`assignOfflineUnit` ignores `isAdditionalUnit` and `homeLoanIntent`** when computing price** — `parkingAmount` is read from the registration unit's pre-existing value; if the admin assigns a unit before parking is selected, `parkingAmount=0`. | Test assign on a unit with `parkingAmount` already set, then again with `parkingAmount` null. // Source: `services/registration-unit.service.js:709`. |
| 12 | **Default scope on `Registration`** hides `status='Refund'` rows from every default query | Any controller that calls `Registration.findOne / findByPk` without `.scope('withRefunded')` will return `null` for a refunded customer, which may show as "Registration not found" instead of "Refunded". | Test single-refund, then assign-unit/swap/parking on the same registration → expect "Registration not found" wording. // Source: `models/registration.model.js:201-213`. |
| 13 | **`projectId` is environment-pinned** to `1` (prod) or `2` (non-prod) — multi-project setups won't be reachable via this module without code changes. | Document in test plan; do not attempt multi-project Customers testing in this build. // Source: B-CUS-002. |
| 14 | **`updateCustomerActions` no-transaction save** | Partial commit on the two `MasterConfig` rows. | Force the second save to fail; verify the first row was already updated (current behavior — a bug). // Source: `controllers/admin.controller.js:1617-1633`. |
| 15 | **Cancel-by-Excel uses positional first column** | If admin opens the sample and reorders columns, behavior silently changes. | Upload an Excel with the registration number in column B; expect failures (or change product spec). // Source: `controllers/admin.controller.js:2315-2317`. |
| 16 | **Mavis / LSQ / Python integration points are fire-and-forget post-commit** | If they fail, the buyer state is in DB but downstream systems lag. | Integration probe / log-scrape tests for `syncCancelledUnitsToPython`, `syncMavisMilestonesForRegistrationUnit`, `syncMavisMilestonePayment`, `updateOpportunityWithMilestonePayment`. Not in scope for unit tests; flag for QA observability. |

---

**End of FSD — Admin Portal: Customers**
