# FSD — SM Portal: Physical Allocation
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Physical Allocation module powers the in-person allocation event run by Sales Managers. Buyers walk in to a venue; SMs look them up, see the units pre-assigned to that registration plus the common pool, place selected units on a transactional HOLD, capture an offline payment (with proof upload), and on full payment finalize the booking by promoting the registration unit to `WINNER` and the underlying unit to `BOOKED`. All endpoints sit under `/api/v1/sales-manager/physical-event/*` and are guarded by `protect` + `restrictTo('sales_manager_admin', 'sales_manager')`.

Stack: Express routes → controller (`physical-event-allocation.controller.js`) → service (`physical-event-allocation.service.js`) → Sequelize models (`AllocationCampaign`, `AllocationCampaignUnit`, `InitialAllotment`, `RegistrationUnit`, `Unit`, `Tower`, `UnitTypology`, `MilestonePaymentTracking`, `PaymentTransaction`, `ParkingInventory`, `RegistrationUnitOffer`).

// Source: source-code/backend/src/routes/sales-manager/index.js:8-14
// Source: source-code/backend/src/routes/sales-manager/common.routes.js:78
// Source: source-code/backend/src/routes/sales-manager/physical-event.routes.js:1-17

---

## 2. Data Model

### `allocation_campaigns` (AllocationCampaign)
Used fields:
- `id`, `name`, `status` (`RUNNING`, etc.), `allocationType` (must equal `PHYSICAL_EVENT` for all queries here), `startTime`, `endTime`, `projectId`, `description`.
// Source: source-code/backend/src/services/physical-event-allocation.service.js:55-74, 218-225, 1401-1409

### `initial_allotments` (InitialAllotment)
Unit pre-assignment per registration in a campaign.
- `id`, `unitId`, `registrationNumber` (aliased as `registration_id`), `allocationCampaignId`, `towerId`, `towerName`, `typologyName`, `status` (`PREALLOCATED` | `ALLOCATED` | `WINNER`).
// Source: source-code/backend/src/services/physical-event-allocation.service.js:94-98, 308-342, 1881-1894

### `allocation_campaign_units` (AllocationCampaignUnit)
Common-pool inventory per campaign.
- `id`, `allocationCampaignId`, `unitId`, `status` (`AVAILABLE` | `HOLD` | `BOOKED`), `registrationUnitId`.
// Source: source-code/backend/src/services/physical-event-allocation.service.js:503-507, 1897-1909

### `registration_units` (RegistrationUnit)
Per-registration booking state.
- Fields used: `id`, `registrationNumber`, `registrationId`, `status` (`PREALLOCATED` | `ALLOCATED` | `HOLD` | `WINNER` | `WAITLIST` | `REFUND`), `unitId`, `towerId`, `apartmentType`, `typologyId`, `isKycSubmitted`, `holdAt`, `availableForAllocation`, plus booking fields (`bookingNumber`, `confirmationNumber`, `allocatedTower`, `allocatedFloor`, `allocatedUnit`, `allocationStatus`, `allocationAmount`, `allocationAmountGst`, `allocationTransactionId`, `mavisBookingCreated`, `mavisUnitUpdated`, `lsqBookingActivityId`, `lsqBookingFormActivityId`, `lsqCurrentScheduleId`, `isKycPdfSubmitted`, `parkingCount`, `parkingAmount`, `isParkingSelected`).
- Status enum values: // Source: source-code/backend/src/constants/global.js:63-70
- Field usage: // Source: source-code/backend/src/services/physical-event-allocation.service.js:1806-1864

### `units` (Unit)
Inventory level.
- `id`, `unitId`, `unitName`, `unitNo`, `status` (`AVAILABLE` | `HOLD` | `BOOKED`), `towerId`, `towerName`, `floorNumber`, `typologyId`, `agreementValue`, `earlyBirdBenefit`, `registrationCharges`, `allocationAmount`, `allocationPercent`, `allocationCalcType`, `holdAt`.
// Source: source-code/backend/src/services/physical-event-allocation.service.js:258-281, 1487-1495, 1866

### `parking_inventory` (ParkingInventory)
- `id`, `projectId`, `status` (`AVAILABLE` | `HOLD` | `BOOKED`), `registrationUnitId`, `amount`, `holdAt`.
// Source: source-code/backend/src/services/physical-event-allocation.service.js:1283-1298, 1852

### `payment_transactions` (PaymentTransaction) — offline path
- `referenceNo` (offline), `registrationId`, `userId`, `registrationUnitIds[]`, `registrationUnitId` (single), `paymentMethod`, `paymentProof` (Azure blob name), `transactionDate`, `transactionId`, `transactionType` = 2, `amount`, `overpaidAmount`, `paymentSource` = `'user'`, `status` = `'completed'`, `gateway` = `null`, `isOffline` = `true`, `metadata.formData.unitRequested`.
// Source: source-code/backend/src/services/physical-event-allocation.service.js:1673-1702

### `milestone_payment_tracking` (MilestonePaymentTracking)
Per-registration-unit per-milestone payment ledger.
- `registrationUnitId`, `milestoneKey` (`ml-ual` for unit allocation, `ml-or` for online registration), `typologyMilestoneId`, `regPaymentScheduleId`, `transactionId`, `totalAmount`, `totalPaid`, `balanceAmount`, `status` (`partial` | `paid`), `paymentStatus` (`PAID` | null).
// Source: source-code/backend/src/services/physical-event-allocation.service.js:1713-1794
// Milestone keys: source-code/backend/src/constants/global.js:126-133

### `registrations.additional_documents` (JSON)
- Merged on each `POST /additional-documents` upload.
// Source: source-code/backend/src/services/physical-event-allocation.service.js:1975-1985

---

## 3. State Machines

### Unit (`units.status`)
```
AVAILABLE ──HOLD action──► HOLD ──finalize payment──► BOOKED
   ▲                        │
   └────RELEASE action──────┘
```
- `AVAILABLE → HOLD`: `Unit.update({ status: 'HOLD', holdAt: now }, where: { status: 'AVAILABLE' })`. // Source: physical-event-allocation.service.js:1225-1231
- `HOLD → AVAILABLE`: `Unit.update({ status: 'AVAILABLE', holdAt: null }, where: { status: 'HOLD' })`. // Source: physical-event-allocation.service.js:1333-1339
- `HOLD → BOOKED`: `Unit.update({ status: 'BOOKED', holdAt: null }, where: { unitId })`. // Source: physical-event-allocation.service.js:1866

### RegistrationUnit (`registration_units.status`)
```
PREALLOCATED / ALLOCATED ──HOLD action──► HOLD ──full payment──► WINNER
        ▲                                  │
        └────────RELEASE action────────────┘
                (status reverts to PREALLOCATED, towerId/unitId cleared)
```
- Guard before HOLD: `if (!['PREALLOCATED', 'ALLOCATED'].includes(registrationUnit.status)) throw "...not eligible for hold"`. // Source: physical-event-allocation.service.js:1201-1203
- Transition to HOLD: `RegistrationUnit.update({ towerId, unitId, status: 'HOLD', holdAt: now }, where: { status: { [Op.ne]: 'HOLD' } })`. // Source: physical-event-allocation.service.js:1261-1272
- RELEASE: `RegistrationUnit.update({ towerId: null, unitId: null, status: 'PREALLOCATED', holdAt: null }, where: { status: 'HOLD' })`. // Source: physical-event-allocation.service.js:1341-1347
- Transition to WINNER: see `assignOfflineUnits` finalization block. // Source: physical-event-allocation.service.js:1803-1864

### InitialAllotment (`initial_allotments.status`)
```
PREALLOCATED / ALLOCATED ──unit finalized──► WINNER
```
// Source: physical-event-allocation.service.js:1881-1895

### AllocationCampaignUnit (pool unit) (`allocation_campaign_units.status`)
```
AVAILABLE / HOLD ──finalization──► BOOKED (registrationUnitId set)
```
// Source: physical-event-allocation.service.js:1897-1909

### ParkingInventory (`parking_inventory.status`)
```
AVAILABLE ──HOLD with parkingSelected──► HOLD ──finalize──► BOOKED
   ▲                                       │
   └───────RELEASE──────────────────────────┘
```
// Source: physical-event-allocation.service.js:1290-1298 (HOLD), 1357-1359 (RELEASE), 1852 (BOOKED)

### MilestonePaymentTracking (`ml-ual`)
```
[absent] ──first payment──► partial (if newTotalPaid < finalAllocationAmount)
                       ┬──► paid (if newTotalPaid >= finalAllocationAmount, paymentStatus='PAID')
partial ──additional payment──► partial OR paid (per accumulation)
```
// Source: physical-event-allocation.service.js:1713-1783

---

## 4. Business Rules

### Active campaign
- Only campaigns with `allocationType = 'PHYSICAL_EVENT'` are returned. // Source: physical-event-allocation.service.js:87, 220, 1403
- `projectId` defaults: prod = 1, non-prod = 2. // Source: source-code/backend/src/controllers/physical-event-allocation.controller.js:14, 69

### Search
- Min 5 characters; matches against `users.phone` (`LIKE %q%`) and `registration_units.registration_number` (`LIKE %q%`) restricted to `InitialAllotment` regs for this campaign. // Source: source-code/backend/src/controllers/physical-event-allocation.controller.js:45-46; service:104-169
- Name search is commented out (only phone + reg number). // Source: physical-event-allocation.service.js:124-128

### Customer context
- Returns `registrationUnitDetail` only if `registrationUnit.status` ∈ `['HOLD', 'WINNER']`. // Source: physical-event-allocation.service.js:289-305
- `Unit.status` normalized: `AVAILABLE | HOLD | BOOKED` (anything else → `BOOKED`). // Source: physical-event-allocation.service.js:212-216
- Offer filtering:
  - Excludes `VC_REQUEST` offers unless a `CallbackRequest` with `status='CONFIRMED'` exists for the user.
  - Excludes `HOME_LOAN` offers unless a `RegistrationHomeLoan` exists with (`status='completed'` AND `loanApprovalStatus != 'admin_rejected'`) OR `loanApprovalStatus='admin_approved'`.
  // Source: physical-event-allocation.service.js:390-434

### Update Unit Status (`PUT /update-unit-status`)
Action validation:
- `action` must be `HOLD` or `RELEASE` (uppercased). // Source: physical-event-allocation.service.js:1131-1135

HOLD guards (in order):
1. Campaign must exist. // Source: 1142-1144
2. Campaign `status` must equal `RUNNING`. // Source: 1146-1148
3. No duplicate `unitId` across submitted items. // Source: 1153-1156
4. No duplicate `registrationNumber`. // Source: 1158-1161
5. `unit` must exist; `registrationUnit` must exist. // Source: 1191-1199
6. `registrationUnit.status` ∈ `['PREALLOCATED', 'ALLOCATED']`. // Source: 1201-1203
7. If `unit.status === 'HOLD'`, the existing hold must belong to the same registration; else error `<unit> is already under payment`. // Source: 1208-1211
8. Else `unit.status` must equal `AVAILABLE`; else `<unit> is not available for payment`. // Source: 1212-1214
9. If `registrationUnit.status === 'HOLD'` with a different `unitId`, error `<reg> already has a unit under payment`. // Source: 1216-1222
10. Parking: if `parkingSelected`, find one `parking_inventory` row with `projectId = campaign.projectId, status='AVAILABLE'`, set it to HOLD; skip if reg already has a parking HOLD. If none available → `Parking slots are no longer available`. // Source: 1274-1300

RELEASE guards:
1. If reg's HOLD is on a different unit → `<reg> has a different unit under payment`. // Source: 1320-1325
2. If requested unit is HOLD but reg does not hold it → `<unit> is already under payment`. // Source: 1327-1330
3. Reverts unit → `AVAILABLE`, reg → `PREALLOCATED` (clears `towerId`/`unitId`/`holdAt`), parking → `AVAILABLE`. // Source: 1333-1361
4. Fires `pythonService.post('/update-payment-status', { payment_status: false, … })` fire-and-forget. // Source: 1363-1376

Concurrency: HOLD acquires `LOCK.UPDATE` on `Unit`, `RegistrationUnit`, `ParkingInventory`. Whole flow runs in a Sequelize transaction; any throw triggers rollback and re-throws as `ApiError.badRequest`. // Source: 1163-1187, 1379-1384

### Offline Units Assignment (`POST /offline-units-allocation`)
Pre-conditions:
1. `customer` (user) must exist. // Source: 1397-1399
2. Campaign must exist with `allocationType='PHYSICAL_EVENT'`. // Source: 1401-1409
3. `registration` for user must exist. // Source: 1436-1438
4. `payments[].registrationNumbers` non-empty. // Source: 1442-1444
5. RegistrationUnits matching `{registrationId, registrationNumber ∈ ..., status='HOLD'}` and Units `{unitId ∈ ..., status='HOLD'}` must be present; if both lists are empty → `Unit allocation time has been expired. Please try again.`. // Source: 1474-1499

Per-registration finalization (only when current payment makes `totalPaid >= finalAllocationAmount`):
- Guarded by `finalizedRegs` set (no double-finalization). // Source: 1615, 1803-1804
- Per-payment loop computes:
  - For single-reg form: `amountForThisReg = payment.amount`; `currentPaymentCompletesBooking = totalPaid >= finalAllocationAmount`.
  - For multi-reg form: `amountForThisReg = pricing.finalAllocationAmount` (each reg credited its full share).
  // Source: 1622-1638, 1709-1726
- Updates on completion: see "RegistrationUnit → WINNER" payload below.
- `Unit → BOOKED`. // Source: 1866
- `RegistrationUnitOffer.bulkCreate` if any offers selected. // Source: 1869-1879
- `InitialAllotment → WINNER` (where `status ∈ ['PREALLOCATED', 'ALLOCATED']`, ordered DESC by id). // Source: 1881-1895
- `AllocationCampaignUnit → BOOKED` (sets `registrationUnitId`). // Source: 1897-1909
- Idempotency guard: pre-existing MPT with `status='WINNER'` throws `Unit already confirmed`. // Source: 1531-1533

`RegistrationUnit → WINNER` payload:
```js
{
  unitId, towerId, typologyId,
  allocatedTower, allocatedFloor, allocatedUnit,
  allocationStatus: 'confirmed',
  allocationAmount, allocationAmountGst,
  bookingNumber: `${regNum}-BKD`,
  confirmationNumber: `${regNum}-CN`,
  allocationTransactionId: paymentTxn.id,
  status: 'WINNER',
  allocationPaymentSource: 'admin',
  // KYC sub-flags branched on isKycSubmitted (lines 1840-1848)
  // Parking adds parkingCount += 1, parkingAmount += inventory.amount, isParkingSelected = 1
  holdAt: null,
}
```
// Source: 1806-1864

### Pricing
- `calculatePricingDetails` from `allocation.service.js` is called per registration with: `agreementValue`, `earlyBirdDiscount`, `hasHomeLoan`, `homeLoanDiscount`, `carpetArea`, `parkingAmount`, `registrationCharges`, `allocationAmount`, `allocationPercent`, `allocationCalcType`, `eoiRegistrationAmount`, `offerDiscountAmount`. // Source: physical-event-allocation.service.js:1582-1595
- `finalAllocationAmount = pricingDetails.allocationAmount`; `allocationAmountGst = pricingDetails.gstOnAllocationAmount`. `allocationAmount = finalAllocationAmount - allocationAmountGst`. // Source: 1597-1599
- Offers: only active (`isActive=1`), `startDate <= endOfDay`, `endDate >= startOfDay`. PERCENTAGE → `unit.agreementValue * percentage / 100`; FIXED → `offer.amount`. `HOME_LOAN` offer routed to `homeLoanDiscountAmount`; others sum into `offerDiscountAmount`. // Source: 1558-1580

### Pool unit / tower queries
- Pool units: `AllocationCampaignUnit` where `allocationCampaignId, status='AVAILABLE'` (and optional `towerId`). // Source: 503-510
- Pool towers: derived from the same pool table. // Source: 551 onwards
- Tower 404 if `towerId` invalid. // Source: 513

---

## 5. Notification Dispatch

| Event | Channel | Provider | Template | Source |
|---|---|---|---|---|
| Bulk pre-event notification (`notifyPhysicalEventRegistrants`) | WhatsApp | Botspice | `physical_allocation_token` with `[fullName]` and media (Azure SAS URL to QR PNG generated from `phone`) | physical-event-allocation.service.js:1025-1030 |
| Allocation booking success (per finalized reg, inside `assignOfflineUnits`) | WhatsApp + SMS | Botspice + Epinet | `allocationNotificationService(true, smsData)` → WhatsApp `congrates_payment_success_27sept` + SMS `ALLOTMENT_PAYMENT_SUCCESS` (only if `countryCode === '+91'`) | physical-event-allocation.service.js:1933-1948; allocation.service.js:1796-1832; whatsapp.service.js:71-75 |
| Allocation payment failure (NOT triggered from this module's offline path) | WhatsApp + SMS | Botspice + Epinet | `allocationNotificationService(false, smsData)` — used by online allocation path only | allocation.service.js:1796-1813 |
| Python sync (payment status) | HTTP | internal `pythonService` | `POST /update-payment-status { payment_status, registration_detail[] }` — fired on RELEASE and on successful offline assignment | physical-event-allocation.service.js:1363-1376, 1918-1931 |

Notes:
- WhatsApp on QR send is fire-and-forget (no `await`). // Source: physical-event-allocation.service.js:1025
- Success notification loop swallows individual errors via `.catch(logger.error)`. // Source: 1945-1947
- No dispatch endpoint exists in routes for `notifyPhysicalEventRegistrants`; it is a service function only. // Source: NOT FOUND — no router entry in `physical-event.routes.js` exporting this handler.

---

## 6. API Endpoints

All routes are prefixed with `/api/v1/sales-manager/physical-event` and require:
1. `protect` (JWT, source: source-code/backend/src/routes/sales-manager/index.js:8), AND
2. `restrictTo('sales_manager_admin', 'sales_manager')` (source: ibid:11).

| Method | Path | Controller | Source |
|---|---|---|---|
| GET | `/campaign/active` | `getActiveCampaign` | physical-event.routes.js:23 |
| GET | `/search?campaignId&q` | `searchRegistrations` (min 5 chars) | physical-event.routes.js:29 |
| GET | `/customer?registrationNumber&campaignId&projectId?` | `getCustomerContext` | physical-event.routes.js:35 |
| GET | `/pool-units?campaignId&towerId?` | `getCampaignPoolUnits` | physical-event.routes.js:41 |
| GET | `/pool-towers?campaignId` | `getCampaignPoolTowers` | physical-event.routes.js:47 |
| POST | `/allocation-order` | `AllocationController.createAllocationOrder` (online gateway path, default `easebuzz`) | physical-event.routes.js:53-70 |
| POST | `/allocation-order/confirm` | `AllocationController.processAllocationTransaction` | physical-event.routes.js:76 |
| POST | `/allocation-order/cancel` | `AllocationController.cancelAllocationOrder` | physical-event.routes.js:82 |
| PUT | `/update-unit-status` | `updateUnitStatus` (body: `{ campaignId, units[], action }`) | physical-event.routes.js:88 |
| POST | `/offline-units-allocation` | `offlineUnitsAssignment` (multipart: proofs + `payments` JSON) | physical-event.routes.js:90-105 |
| POST | `/additional-documents` | `uploadAdditionalDocuments` (multipart images) | physical-event.routes.js:111-120 |
| GET | `/additional-documents?userId` | `getAdditionalDocuments` | physical-event.routes.js:126 |
| GET | `/registration-preferences?userId` | `getRegistrationPreference` | physical-event.routes.js:128 |
| GET | `/allocation-unit-details` | `AllocationController.getDynamicTemplateData` | physical-event.routes.js:130 |
| POST | `/kyc/registration-units/applicants` | `UserController.getRegistrationUnitWithApplicants` (forces `reqFromSm=true`) | physical-event.routes.js:132-142 |
| GET | `/kyc/applicants/:id` | `UserController.getApplicantById` (forces `reqFromSm=true`) | physical-event.routes.js:144-154 |
| POST | `/kyc/applicants` | `UserController.addApplicants` (multipart) | physical-event.routes.js:156-168 |
| POST | `/kyc/applicants/merge-to-registration-unit` | `UserController.mergeApplicantToRegistrationUnit` | physical-event.routes.js:170-181 |
| PUT | `/kyc/applicants/:id` | `UserController.updateApplicant` | physical-event.routes.js:183-195 |
| DELETE | `/kyc/applicants/:id` | `UserController.deleteApplicant` | physical-event.routes.js:197-207 |
| POST | `/kyc/send-esign-otp` | `AllocationController.sendKycEsignOtp` | physical-event.routes.js:209 |
| POST | `/kyc/verify-esign-otp` | `AllocationController.verifyKycEsignOtp` | physical-event.routes.js:211 |
| POST | `/kyc/submit` | `AllocationController.submitKyc` (forces `reqFromSm=true`) | physical-event.routes.js:213-224 |

### Key request bodies

`PUT /update-unit-status`:
```json
{
  "campaignId": 12,
  "action": "HOLD",
  "units": [
    { "registrationNumber": "REG-001", "unitId": "U-101", "towerId": "T-1", "parkingSelected": true }
  ]
}
```
// Source: physical-event-allocation.controller.js:156-169; service:1150-1151

`POST /offline-units-allocation` (multipart/form-data):
- Files: payment proof per payment slot (validated by `physicalAllocationPaymentProofRules`).
- Fields: `campaignId`, `userId`, `payments` (JSON string).
- `payments` shape:
```json
[
  {
    "registrationNumbers": ["REG-001"],
    "paymentMethod": "UPI",
    "amount": 250000,
    "transactionDate": "2026-05-24",
    "transactionId": "EXT-TXN-001",
    "parkingSelected": { "REG-001": true },
    "offerIds": { "REG-001": [12, 14] }
  }
]
```
// Source: physical-event-allocation.controller.js:219-239; service:1440-1472, 1622-1652

### Common error responses

| Code | Message | Source |
|---|---|---|
| 400 | `campaignId is required` | controller:17, 41, 75, 100, 124 |
| 400 | `Search query must be at least 5 characters` | controller:45-47 |
| 400 | `Physical event campaign not found` | service:91, 224, 559, 1408 |
| 400 | `action must be 'HOLD' or 'RELEASE'` | service:1133-1135 |
| 400 | `Allocation campaign is not running` | service:1146-1148 |
| 400 | `Same unit cannot be selected for multiple registrations` | service:1153-1156 |
| 400 | `<regNo> cannot be submitted more than once` | service:1158-1161 |
| 400 | `<reg> is not eligible for hold` | service:1201-1203 |
| 400 | `<unit> is already under payment` | service:1208-1213, 1327-1329 |
| 400 | `<unit> is not available for payment` | service:1212-1214 |
| 400 | `<reg> already has a unit under payment` | service:1216-1222 |
| 400 | `<reg> has a different unit under payment` | service:1320-1325 |
| 400 | `Parking slots are no longer available` | service:1295-1297 |
| 400 | `Unit allocation time has been expired. Please try again.` | service:1497-1499 |
| 400 | `<regNo> not found or not on hold` | service:1527-1529 |
| 400 | `Unit already confirmed` (with `confirmationNumber`) | service:1531-1533 |
| 400 | `Customer not found` / `Registration not found` / `No registration numbers provided` | service:1397, 1437, 1443 |
| 500 | `Failed to upload payment proof` | service:1669-1671 |
| 404 | `Registration not found` (customer context) | service:285-287 |
| 400 | `Tower not found for towerId: <id>` (pool units) | service:513 |

---

## 7. Known Bugs / Gaps

1. **Raw SQL CASE built from user input** — `updateUnitStatus` HOLD path builds `towerCase` / `unitCase` `CASE WHEN registration_number = '<u.registrationNumber>' THEN '<u.unitId>'` via string interpolation, not parameterized. A `registrationNumber` or `unitId` containing a `'` quote breaks the SQL or could inject. The Yup validator for this endpoint is not configured (route has no `validateRequest`). // Source: source-code/backend/src/services/physical-event-allocation.service.js:1233-1259; route lacks validator: source-code/backend/src/routes/sales-manager/physical-event.routes.js:88

2. **RELEASE has no campaign-state check** — Unlike HOLD, RELEASE is allowed even when campaign is not RUNNING or campaign missing. // Source: physical-event-allocation.service.js:1142-1147 (HOLD-only)

3. **`updateUnitStatus` parking-on-release** — RELEASE always frees parking by `registrationUnitId ∈ regUnitIds, status='HOLD'`. If the registration is RELEASED without `parkingSelected` originally, this is a no-op — but if a separate parking HOLD existed, it will still be released. // Source: physical-event-allocation.service.js:1349-1361

4. **`bookingNumber` / `confirmationNumber` are deterministic strings** — `${regNum}-BKD` / `${regNum}-CN`. If a registration is somehow finalized twice (the guard is in-memory `finalizedRegs`, not DB-level), the second update would re-issue the same strings. // Source: physical-event-allocation.service.js:1816-1817

5. **In-memory dedupe only** — `finalizedRegs = new Set()` lives in one request scope. Concurrent `offline-units-allocation` calls for the same registration are not blocked by a DB unique constraint visible here. // Source: physical-event-allocation.service.js:1615

6. **`payments` JSON not schema-validated** — Multer attaches files; `JSON.parse(payments)` is unguarded; malformed JSON throws and lands in generic 500. // Source: physical-event-allocation.controller.js:219-237

7. **`projectId` derived from `app.production`** — Hard-codes `1` (prod) or `2` (non-prod); a real multi-project env would need explicit `projectId`. // Source: physical-event-allocation.controller.js:14, 69; service:1130 (campaign.projectId for parking)

8. **`notifyPhysicalEventRegistrants` is unreachable via HTTP** — Function exists but no route binds it. Suggests it is invoked from cron or admin tooling not in this scope. // Source: NOT FOUND — no `router.*` reference to `notifyPhysicalEventRegistrants` in `physical-event.routes.js`.

9. **`getRegistrationPreference` takes `userId` from query, no auth-owner check** — Any logged-in SM can pull any user's preferences. // Source: source-code/backend/src/controllers/physical-event-allocation.controller.js:142-154

10. **`uploadAdditionalDocuments` only validates `userId` presence** — No check that the userId belongs to an SM-visible buyer. // Source: physical-event-allocation.controller.js:245-269

11. **Search name-match commented** — Phone-only or registration-number-only; SM cannot search by buyer name. // Source: physical-event-allocation.service.js:124-128

12. **No `WAITLIST` / `REFUND` state transitions in this module** — Statuses exist in constants but are never assigned by this service. // Source: source-code/backend/src/constants/global.js:63-70 vs absence of references in physical-event-allocation.service.js.

13. **`lastLogin` write in auth controller may fail silently** — see Login FSD; not a Physical Allocation defect, but every SM session this module relies on may write a column whose declaration is commented out in the model. // Source: source-code/backend/src/models/user.model.js:321 (commented), auth.controller.js:859.

---

## 8. QA Risk Areas

1. **Double-spend race** — Two SMs HOLDing the same `unitId` for different registrations simultaneously. `LOCK.UPDATE` is acquired inside a transaction, but verify isolation level on MySQL prevents two parallel HOLDs from both succeeding before either commits.
2. **Partial payment then expiry** — `MilestonePaymentTracking` accumulates `totalPaid`; if the unit HOLD is released by another process between two partial payments, the second payment may try to finalize on a non-HOLD reg — verify the `regUnit.status !== HOLD` early throw at line 1474-1498 fires.
3. **Offline split payments** — Two `payments[]` entries with `registrationNumbers: ['REG-001']` each contributing < required, then a third closing it out. Verify only one `WINNER` transition and one `Unit→BOOKED`.
4. **Multi-reg payment form** — One payment row with `registrationNumbers: ['REG-001','REG-002']` and `amount` covering both. Verify both regs finalize and `paymentTxn.milestonePaymentTrackingId` is NOT set (line 1799-1801 — only single-reg forms link it).
5. **Parking exhaustion mid-session** — Hold N units with parking, then for `unit N+1` the `parking_inventory` returns null → entire transaction rolls back, including units already HOLDed in the same call.
6. **Pool unit pulled by another SM** — Buyer A's SM is staring at unit U as `AVAILABLE`; buyer B's SM HOLDs it. A's next HOLD attempt must show `<unit> is already under payment`.
7. **HOLD-on-already-held-by-same-reg (idempotency)** — Same payload repeated should succeed without error (existing held registration matches). // Source: service:1208-1211
8. **RELEASE on non-existent HOLD** — Reg not in HOLD; verify it does not throw but also does not corrupt parking.
9. **`Math.random()` SQL injection vector for `registrationNumber`** — Submit `units[0].registrationNumber = "REG'); DROP --"` and confirm whether the literal CASE block sanitizes (it does not; only luck saves us if Yup validation is added). See bug 1.
10. **Campaign status change mid-flow** — Admin pauses campaign (`RUNNING` → other) while an SM has units on HOLD; verify RELEASE still works (it does not check status), but next HOLD attempt fails with `Allocation campaign is not running`.
11. **`isKycSubmitted` branch** — Verify both KYC-already-submitted (`bookingFormActivitySubmitted=false`) and not-yet (`selfKycSubmitted=false`) finalize correctly with the right flag set. // Source: 1840-1848
12. **WhatsApp/SMS dropout** — Stub Botspice 500 + Epinet 500. Booking must still succeed (DB committed) — notifications are non-blocking. Verify booking is visible in admin view despite no buyer notification.
13. **`pythonService` outage** — `/update-payment-status` failure is logged-only; verify no rollback.
14. **InitialAllotment with no AVAILABLE/HOLD/PREALLOCATED match** — `allocationPoolUnit` may be null in finalization; verify it is allowed (it is — no throw). Confirm that orphan `Unit→BOOKED` without corresponding `AllocationCampaignUnit→BOOKED` is acceptable business behavior.
15. **Audit log absence** — None of HOLD/RELEASE/finalize writes to the `audit_log` table visible in this module. Confirm whether audit is required by BRD and flag if not implemented.
16. **`offer.startDate`/`endDate` boundary** — Offers active exactly at `startOfDay`/`endOfDay`. Test offer expiring at the same minute as the payment.
17. **`overpaidAmount` accounting** — For single-reg with `payment.amount > finalAllocationAmount`, `overpaidAmount > 0` is stored on `PaymentTransaction` but no refund is triggered. Verify business expectation.
18. **KYC re-entry after WINNER** — Once `status='WINNER'`, KYC routes should still be reachable per the routing table. Verify `/kyc/submit` does not corrupt WINNER state.
19. **SM Admin (roleId 4) vs SM (roleId 5) parity** — The whole `/physical-event/*` tree is open to both. Validate the BRD intends this; otherwise it is over-permissive.
20. **Concurrent additional-documents uploads** — `Registration.update({ additionalDocuments: merged })` with two concurrent uploads can clobber each other (no row-level lock visible). // Source: service:1975-2025

---

*End of FSD — SM Portal: Physical Allocation*
