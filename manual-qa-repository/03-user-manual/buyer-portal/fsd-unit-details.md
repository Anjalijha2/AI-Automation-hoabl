# FSD — Buyer Portal: Unit Details
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

Unit Details surfaces the buyer's allotted/booked unit information: physical attributes (tower, floor, unit number, typology, carpet area), pricing breakdown (cost sheet, payment schedule, milestones), allocation state, KYC/booking-form documents, and applicant data.

Two primary entities anchor the buyer view:
- **`Unit`** — master inventory row mirrored from Mavis (tower / floor / unit_no / typology / charges). Source of truth for pricing components used by the cost sheet. // Source: models/unit.model.js:11-454
- **`RegistrationUnit`** — buyer-owned allocation linking `Registration` → `Unit`, holds allocation lifecycle status, KYC flags, parking selection, booking/confirmation numbers. // Source: models/registration-unit.model.js:11-361

The buyer-facing unit view is composed dynamically by `getDynamicTemplateData` (cost sheet + payment schedule) and enriched by `getMilestoneUnitDetails` (per-milestone status overlay). // Source: controllers/allocation.controller.js:233; controllers/milestone-payment.controller.js:1486-1656

---

## 2. Data Model

### Unit (table: `units`)
Defined `models/unit.model.js:79-450`. Associations: `belongsTo(Project as Project)`, `belongsTo(Tower as towerRef)`, `belongsTo(Tower as Tower via towerId)`, `belongsTo(UnitTypology as typologyRef / as UnitTypology)`, `belongsTo(Floor as Floor)`, `belongsTo(TypologyMaster as TypologyMaster)`, `hasOne(RegistrationUnit)`, `hasMany(RegistrationPreference)`. // Source: models/unit.model.js:17-69

Buyer-visible fields:

| Field | DB Column | Type | Note |
|-------|-----------|------|------|
| `unitName` | `unit_name` | STRING(255) | // Source: models/unit.model.js:122-127 |
| `unitId` | `unit_id` | STRING(255) | Mavis identifier // Source: models/unit.model.js:128-133 |
| `towerId` | `tower_id` | STRING(255) | // Source: models/unit.model.js:134-139 |
| `towerName` | `tower_name` | TEXT | // Source: models/unit.model.js:264-269 |
| `floorId` | `floor_id` | BIGINT UNSIGNED | // Source: models/unit.model.js:140-145 |
| `floorNumber` | `floor_number` | INTEGER | // Source: models/unit.model.js:234-239 |
| `unitNo` | `unit_no` | STRING(255) | // Source: models/unit.model.js:146-151 |
| `frontendTypologyName` | `frontend_typology_name` | STRING(255) | Used as `apartmentType` in buyer responses // Source: models/unit.model.js:193-198 |
| `typologyId` | `typology_id` | TEXT | // Source: models/unit.model.js:187-192 |
| `facing` | `facing` | TEXT | // Source: models/unit.model.js:337-341 |
| `status` | `status` | ENUM(`AVAILABLE`,`HOLD`,`BOOKED`,`REFUGE`,`PREBOOKED`,`PBT`,`RESERVED`) | // Source: models/unit.model.js:176-180 |
| `basicPrice` | `basic_price` | BIGINT | // Source: models/unit.model.js:152-157 |
| `agreementValue` | `agreement_value` | INTEGER | Drives cost-sheet // Source: models/unit.model.js:252-257 |
| `allocationAmount` | `allocation_amount` | DECIMAL(15,2) | // Source: models/unit.model.js:402-406 |
| `allocationPercent` | `allocation_percent` | DECIMAL(15,2) | Percent OR amount per `allocationCalcType` // Source: models/unit.model.js:407-412 |
| `allocationCalcType` | `allocation_calc_type` | ENUM(`PERCENT`,`AMOUNT`) | // Source: models/unit.model.js:413-418 |
| `earlyBirdBenefit` | `early_bird_benefit` | DECIMAL(15,2) | // Source: models/unit.model.js:419-423 |
| `clubHouseCharge` / `societyCharge` / `possesionCharge` / `infraCharge` / `floorRise` / `premiumCharge` / `parkingCharge` / `stampDuty` / `gst` / `gstOnAmenities` / `registrationCharges` / `legalCharge` / `cutOff` / `siteHeadCutOff` / `hiddenCharges1..4` / `totalUnitValue` | various | numeric | Cost components. // Source: models/unit.model.js:158-409 (full listing) |
| `imageUrl` | `image_url` | TEXT | "Image URLs separated by `||`" — multiple images encoded as delimited string. // Source: models/unit.model.js:424-429 |
| `holdAt` | `hold_at` | DATE | Set when unit on hold during offline payment. // Source: models/unit.model.js:430-434 |

Audit enabled: `Unit.auditEnabled = true`. // Source: models/unit.model.js:452

### RegistrationUnit (table: `registration_units`)
Associations: `belongsTo(Registration as registration)`, `hasMany(Applicant as applicants)`, `belongsTo(PaymentTransaction as CompletedPaymentTransaction)`, `hasOne(InitialAllotment as InitialAllotment via registrationNumber)`, `belongsTo(Tower as Tower)`, `belongsTo(Unit as Unit via unitId)`, `belongsTo(TypologyMaster as TypologyMaster via typologyId)`, `hasMany(RegistrationUnitPaymentSchedule as paymentSchedules)`. // Source: models/registration-unit.model.js:13-62

Buyer-relevant fields:

| Field | DB Column | Type | Note |
|-------|-----------|------|------|
| `registrationNumber` | `registration_number` | STRING(50) | // Source: models/registration-unit.model.js:77-79 |
| `confirmationNumber` | `confirmation_number` | STRING(50) | Generated after successful payment // Source: models/registration-unit.model.js:80-83 |
| `bookingNumber` | `booking_number` | STRING(50) | // Source: models/registration-unit.model.js:84-88 |
| `kycNumber` | `kyc_number` | STRING(50) | // Source: models/registration-unit.model.js:89-93 |
| `apartmentType` | `apartment_type` | STRING(50) | // Source: models/registration-unit.model.js:94-97 |
| `carpetArea` | `carpet_area` | STRING(50) | // Source: models/registration-unit.model.js:98-101 |
| `registrationAmount` | `registration_amount` | DECIMAL(15,2) | // Source: models/registration-unit.model.js:102-105 |
| `allocationAmount` | `allocation_amount` | DECIMAL(15,2) | // Source: models/registration-unit.model.js:106-109 |
| `allocationAmountGst` | `allocation_amount_gst` | DECIMAL(15,2) | // Source: models/registration-unit.model.js:110-116 |
| `allocationStatus` | `allocation_status` | ENUM | See Section 3 // Source: models/registration-unit.model.js:117-120 |
| `status` | `status` | ENUM | See Section 3 // Source: models/registration-unit.model.js:121-124 |
| `allocatedTower` / `allocatedFloor` / `allocatedUnit` | STRING(20) | // Source: models/registration-unit.model.js:131-142 |
| `unitId` / `towerId` / `typologyId` | STRING(50) | Mavis IDs // Source: models/registration-unit.model.js:290-305 |
| `isKycSubmitted`, `isKycPdfSubmitted`, `selfKycSubmitted`, `selfKycFinalSubmitted`, `selfKycBookingActivitySubmitted` | bool flags | // Source: models/registration-unit.model.js:167-207 |
| `eVerificationCompleted` / `eVerificationCompletedAt` | bool/date | OTP digital verification // Source: models/registration-unit.model.js:173-184 |
| `isParkingSelected` / `parkingCount` / `parkingAmount` | TINYINT(1)/INT/DECIMAL | // Source: models/registration-unit.model.js:209-229 |
| `holdAt`, `refundAt` | DATE | // Source: models/registration-unit.model.js:323-345 |
| `lsqBookingActivityId`, `lsqBookingFormActivityId`, `lsqCurrentScheduleId` | string | LSQ tracking // Source: models/registration-unit.model.js:270-316 |
| `mavisBookingCreated`, `mavisUnitUpdated`, `mavisBookingFinalUpdated` | bool (nullable tri-state) | Mavis sync flags // Source: models/registration-unit.model.js:238-289 |
| `allocationTransactionId`, `hcfTransactionId` | BIGINT UNSIGNED | // Source: models/registration-unit.model.js:147-166 |
| `hcfTransactionStatus` | ENUM(`VERIFICATION`,`PAID`,`FAILED`) | // Source: models/registration-unit.model.js:156-161 |
| `availableForAllocation` | BOOLEAN default `true` | // Source: models/registration-unit.model.js:125-130 |
| `isAdditionalUnit` | BOOLEAN default `false` | // Source: models/registration-unit.model.js:318-322 |
| `paymentScheduleId` | INTEGER | Selected payment schedule // Source: models/registration-unit.model.js:306-311 |

Soft delete + audit: `paranoid: true`, `RegistrationUnit.auditEnabled = true`. // Source: models/registration-unit.model.js:347-358

### Related entities used in unit-detail responses
- `Applicant` — KYC documents (panDoc, aadhaarFront, aadhaarBack, photoDoc) with `blobName`. Pre-signed Azure SAS URLs are generated on read. // Source: controllers/user.controller.js:1043-1077
- `PaymentTransaction.paymentProof` (Azure blob) — also presigned on response. // Source: controllers/user.controller.js:1087 (truncated context)
- `TypologyMaster` — joined for `carpet_area`. // Source: controllers/milestone-payment.controller.js:1521, 1530
- `RegistrationUnitPaymentSchedule`, `MilestonePaymentTracking`, `TypologyMilestone` — milestone tables joined in `getMilestoneUnitDetails`. // Source: controllers/milestone-payment.controller.js:1548-1574

There is **no separate `BookingUnit` model** — booking attributes (`bookingNumber`, `kycNumber`, `confirmationNumber`) are columns on `RegistrationUnit`. // Source: models/registration-unit.model.js:80-93

---

## 3. State Machines

### `RegistrationUnit.status` (allocation lifecycle)
ENUM values: `WAITLIST`, `PREALLOCATED`, `ALLOCATED`, `WINNER`, `HOLD`, `REFUND`. // Source: models/registration-unit.model.js:121-124

Transitions observed in code:
- Buyer can act on a unit (milestone payment, booking form) **only when `status = 'WINNER'`**. Both `createOrder` (milestone) and `submitOfflineMilestonePayment` filter `where: { registrationNumber, status: 'WINNER' }`. // Source: controllers/milestone-payment.controller.js:447-456, 1122-1127
- KYC validation gate: `getDynamicTemplateData` returns 400 `KYC Incomplete` if `applicationDetails` query flag set and `!registrationUnit.isKycSubmitted`. // Source: controllers/allocation.controller.js:244-248
- `WINNER` units must have `unitId`; otherwise returns 400 `Could not fetch unit data`. // Source: controllers/allocation.controller.js:271-275

### `RegistrationUnit.allocationStatus`
ENUM: `confirmed`, `available`, `waiting`, `cancelled`, `refunded`. // Source: models/registration-unit.model.js:117-120
No transition guards found in the buyer read paths; mutated by admin/allocation controllers (not in scope of this FSD).

### `Unit.status`
ENUM: `AVAILABLE`, `HOLD`, `BOOKED`, `REFUGE`, `PREBOOKED`, `PBT`, `RESERVED`. // Source: models/unit.model.js:176-180
`holdAt` timestamp set during offline-payment hold; cleared by unrelated admin flows. // Source: models/unit.model.js:430-434

### `RegistrationUnit.hcfTransactionStatus`
ENUM: `VERIFICATION` → `PAID` | `FAILED`. // Source: models/registration-unit.model.js:156-161
- Set to `PAID` after offline HCF (`ml-hcf`) payment commit. // Source: controllers/milestone-payment.controller.js:1411-1419

### Milestone tracking status
`MilestonePaymentTracking.paymentStatus` ENUM-like: `VERIFICATION`, `PAID`, `FAILED`. `status` field: `paid` | `partial`.
- Created in `VERIFICATION` on order init. // Source: controllers/milestone-payment.controller.js:630-645
- Transitions to `PAID`/`FAILED` on `updateMileStonePaymentData` based on `isSuccess`. // Source: controllers/milestone-payment.controller.js:980-1008

### Mavis sync (tri-state booleans)
`null` (not attempted) → `true` (success) | `false` (failed) for `mavisBookingCreated`, `mavisUnitUpdated`, `mavisBookingFinalUpdated`, `bookingTokenActivitySubmitted`, `bookingFormActivitySubmitted`, `bookingActivitySubmitted`. // Source: models/registration-unit.model.js:230-289

---

## 4. Business Rules

1. **Buyer ownership enforcement.** `getRegistrationUnitBookingFormData` derives `isAdminOrSm` from `req.user.role`. Non-admin users see only units linked (via `Registration.userId`) to themselves; failure returns 500 `Something went wrong` (intentional opacity). // Source: controllers/user.controller.js:892-922
2. **WINNER lock.** All milestone-payment endpoints require `status='WINNER'`; absence → 400 `Invalid registration unit`. // Source: controllers/milestone-payment.controller.js:447-456
3. **`unitId` requirement on WINNER.** A WINNER row without `unitId` is a fatal data error returned to the client as 400. // Source: controllers/allocation.controller.js:271-275
4. **Dynamic cost sheet calculation.** `finalAgreementValue = round(agreementValue + totalParkingAmount − earlyBirdBenefit − (homeLoanDetail ? homeLoanDiscountAmount : 0) − offerDiscountAmount)`. // Source: controllers/allocation.controller.js:485-491
5. **Allocation amount calc.** `calculateAllocationAmount({ finalAgreementValue, allocationAmount, allocationPercent, allocationCalcType, eoiRegistrationAmount })` — branches on `PERCENT` vs `AMOUNT`. // Source: controllers/allocation.controller.js:493-499
6. **Parking preview.** Non-WINNER units may preview-compute parking via `?carParking=N`; WINNER units use persisted `parkingCount`/`parkingAmount`. // Source: controllers/allocation.controller.js:308-337
7. **Offer filtering window.** Offers must satisfy `isActive=1`, `startDate ≤ now`, `endDate ≥ now`, and `projectId` match. WINNER units load offers from `RegistrationUnitOffer` (already applied at allocation time); non-WINNER use `Offer` master filtered by `offerIds` query. // Source: controllers/allocation.controller.js:368-434
8. **Home-loan discount gating.** `homeLoanDiscountAmount` is subtracted only if `homeLoanDetail` exists (registration has home-loan record). // Source: controllers/allocation.controller.js:304, 489
9. **Per-applicant documents.** Documents pre-signed only when `blobName` exists; URLs presigned per request (not cached). // Source: controllers/user.controller.js:1059-1077
10. **Relation ordering.** Applicants sorted with `relation='self'` first via raw `CASE WHEN`. // Source: controllers/user.controller.js:1017-1020
11. **Relation capitalization.** Applicant `relation` is title-cased on response (`'sister' → 'Sister'`). // Source: controllers/user.controller.js:1079-1081

---

## 5. Notification Dispatch

No direct email/SMS/WhatsApp dispatch in the buyer unit-detail read endpoints. // Source: NOT FOUND — verify manually (no `communicationService`, `sendEmail`, `sendSms`, `sendWhatsapp`, `notifyUser` matches in milestone-payment.controller.js, allocation.controller.js read paths, or user.controller.js `getRegistrationUnitBookingFormData`)

Indirect side-effects on milestone payment success:
- **LSQ opportunity update** (`updateOpportunityWithMilestonePayment`) writes `mx_Custom_95` sub-fields (`mx_CustomObject_25..28`) with `PAID:DATE:AMOUNT:TRANSACTIONID` appended comma-separated values. Triggers only for `paymentType ∈ {4,5}`. // Source: controllers/milestone-payment.controller.js:1012-1042, 69-171
- **Mavis sync** (`syncMavisMilestonePayment`) inserts milestone-payment row into Mavis and updates `Paid=Yes`/`Final_Date` when fully paid. Errors logged but non-throwing. // Source: controllers/milestone-payment.controller.js:173-235
- **LSQ booking activity submission** (cron-driven via `cronPdfGenerationJob`) — out of scope for synchronous buyer view. // Source: services/kyc-booking-pdf.service.js (file head; cron job)

---

## 6. API Endpoints

All mounted under `/api/users` with `protect` + `restrictTo('user')` + injected `userType='user'`. // Source: routes/user.routes.js:47-49

| Method | Path | Handler | Purpose |
|--------|------|---------|---------|
| GET | `/api/users/registration` | `getRegistration` | Returns registration + list of units `{ apartmentType, registrationNumber, carpetArea, towerId, towerName, isAdditionalUnit }` + `transactionDate`. // Source: routes/user.routes.js:53; controllers/registration.controller.js:2406-2413 |
| GET | `/api/users/user-unit-details?registrationNumber=&unitId=` | `getMilestoneUnitDetails` | Returns `{ unitNumber: "<unit_no>-<tower_name>: <typology>", unitName: "<typology> <carpet_area> SQ.FT.", unitData: [<milestone rows>], additionalInfo }`. Mandatory query: `registrationNumber`, `unitId`. // Source: routes/user.routes.js:71; controllers/milestone-payment.controller.js:1486-1646 |
| GET | `/api/users/milestone-transaction-details?transactionId=&initialPaid=&registrationNumber=&isAllocation=` | `getMilestoneTransactionDetails` | Returns payment-transaction rows (amount, status, payment_method, transaction_id, isGst, registration_unit_ids, milestone_payment_tracking_id). Branches on allocation vs non-allocation flow. // Source: routes/user.routes.js:74; controllers/milestone-payment.controller.js:1716-1846 |
| GET | `/api/users/allocation/unit-details?registrationNumber=&unitId=&carParking=&applicationDetails=&isMethod=&offerIds=` | `getDynamicTemplateData` | Returns cost sheet + dynamic payment-schedule template for the unit. // Source: routes/user/allocation.routes.js:45; controllers/allocation.controller.js:233-512+ |
| GET | `/api/users/registration-units/booking-form-data/:registrationUnitId` | `getRegistrationUnitBookingFormData` | Returns RegistrationUnit + applicants (with pre-signed document SAS URLs), CompletedPaymentTransaction, allocationPaymentSummary, parking info. // Source: routes/user.routes.js:166; controllers/user.controller.js:888-1100+ |
| POST | `/api/users/upload-kyc-form` | `uploadKycForm` | Uploads KYC PDF document. // Source: routes/user.routes.js:167 |
| GET | `/api/users/cronPdfGenerationJob` | `cronPdfGenerationJob` | Triggers KYC/booking-form PDF generation job (mounted under user routes but functions as cron trigger). // Source: routes/user.routes.js:169 |
| POST | `/api/users/milestone-payment/order` | `createMileStoneOrder` | Initiates milestone (incl. HCF) payment for unit. Requires `registrationNumber`, `milestoneKey`, `milestoneId`, `amount`, `paymentType`. // Source: routes/user/milestone-payment.routes.js:8 |
| POST | `/api/users/milestone-payment/hcf-order/process` | `processMilestoneOrder` | Easebuzz callback for milestone payment. // Source: routes/user/milestone-payment.routes.js:10 |
| POST | `/api/users/allocation/order` | `createAllocationOrder` | Initiates allocation purchase for one/multiple units. // Source: routes/user/allocation.routes.js:17-28 |
| POST | `/api/users/allocation/submit-kyc` | `submitKyc` | Submits KYC for allocated unit(s). // Source: routes/user/allocation.routes.js:33-44 |
| POST | `/api/users/registration-units/applicants` | `getRegistrationUnitWithApplicants` | Lists applicants for the unit (overloaded as POST with body schema). // Source: routes/user.routes.js:119 |

### Endpoints NOT found
- `GET /getUnit`, `GET /unit/:id`, `GET /unitDetails`, `GET /unit-status`: no such direct buyer routes. Unit data is always nested inside a registration-context endpoint. // Source: NOT FOUND — verify manually
- **Allotment-letter download endpoint** for buyer: not found. `InitialAllotment` model exists and has association on `RegistrationUnit`, but no `GET /allotment-letter` route. PDF generation exists for KYC/booking form via cron, surfaced through Azure pre-signed URLs inside `getRegistrationUnitBookingFormData`. // Source: NOT FOUND — verify manually (no `allotment-letter` route in `routes/user.routes.js` or `routes/user/*.js`)
- **Agreement download endpoint** for buyer: not found. // Source: NOT FOUND — verify manually

### Documents the buyer can effectively download
- **Applicant KYC documents** (panDoc, aadhaarFront, aadhaarBack, photoDoc) via Azure SAS URLs returned inside `getRegistrationUnitBookingFormData`. // Source: controllers/user.controller.js:1059-1077
- **Payment proof** from `CompletedPaymentTransaction.paymentProof` via Azure SAS. // Source: controllers/user.controller.js:1087 (truncated)

---

## 7. Known Bugs / Gaps

1. **Opaque ownership-failure error.** When a buyer queries a unit they do not own, response is HTTP 500 `Something went wrong` instead of 403/404 — leaks no info but hides legitimate 500s. // Source: controllers/user.controller.js:919-922
2. **`Unit.imageUrl` is `||`-delimited string.** No JSON array; clients must split. Empty values, trailing `||`, and Unicode pipe chars in URLs will corrupt parsing. // Source: models/unit.model.js:424-429
3. **No `getMilestoneUnitDetails` permission check beyond `restrictTo('user')`.** The handler does not assert the requesting `req.user.id` owns the `registrationNumber` queried. It re-uses `getDynamicTemplateData` which itself checks ownership (line 259), so protection is transitive but indirect. // Source: controllers/milestone-payment.controller.js:1486-1511; controllers/allocation.controller.js:256-264
4. **Mock `res` injection.** `getMilestoneUnitDetails` builds a fake `res` object (`mockRes`) and passes it to `getDynamicTemplateData`. If the inner function calls `.send()` instead of returning, the response is silently discarded — fragile. // Source: controllers/milestone-payment.controller.js:1495-1511
5. **Hard-coded environment branching.** Allocation/Registration use `projectId = app.production ? 1 : 2` for buyer lookups. // Source: controllers/registration.controller.js:1170, 2337 (inherited dependency)
6. **`TypologyMaster.carpet_area` join is `required: true`** in `getMilestoneUnitDetails` — units missing a TypologyMaster row will silently be filtered out (returns null/empty `registrationUnitDetails`). // Source: controllers/milestone-payment.controller.js:1530
7. **`getMilestoneTransactionDetails` parameter ambiguity.** `transactionId` semantics flip depending on `initialPaid`: it's PT.id if `initialPaid=true`, else MilestonePaymentTracking.id. Easy for client to confuse. // Source: controllers/milestone-payment.controller.js:1822-1824
8. **Race condition in offline milestone payment.** Duplicate `transactionId` guard reads inside the transaction (good) but uses `findOne` without row lock → two concurrent submits with the same external `transactionId` can both pass the check. // Source: controllers/milestone-payment.controller.js:1138-1148
9. **`getRegistration` hides ongoing registration data.** When `paymentStatus !== 'success'`, the function returns null `registrationNumber` and only a draft (from `RegistrationDraft.draft`) by slug. Buyer cannot resume mid-flow without a valid slug. // Source: controllers/registration.controller.js:2426-2441
10. **Inconsistent `numberToRupee`/`rupeeToNumber` round-tripping.** Milestone aggregation does `numberToRupee(rupeeToNumber(...) + ...)` which can introduce tiny formatting differences (₹ symbol, locale). // Source: controllers/milestone-payment.controller.js:1585-1588
11. **`Unit.bookingDate` typed `DOUBLE`** (not DATE). Likely legacy from Mavis CSV import — date arithmetic on this column will fail. // Source: models/unit.model.js:325-330
12. **`Unit.typologyName` typed `DOUBLE`.** Same likely cause — should be STRING. // Source: models/unit.model.js:270-275
13. **`RegistrationUnit.cancellationReason` is JSON** but no schema validation in code. // Source: models/registration-unit.model.js:143-146
14. **`Unit` status `REFUGE`** is almost certainly a typo for `REFUND` or `REFUGEE`/`REFUSED` — appears in ENUM definition. // Source: models/unit.model.js:177
15. **No allotment-letter download in code** despite `InitialAllotment` model + association on `RegistrationUnit` (`as: 'InitialAllotment'`). UI may construct manually or via Mavis. // Source: NOT FOUND — verify manually (models/registration-unit.model.js:30-34 has association; no PDF endpoint)

---

## 8. QA Risk Areas

1. **Status gate fuzz.** For each `RegistrationUnit.status` value, attempt: (a) `POST /milestone-payment/order`, (b) `GET /user-unit-details`, (c) `GET /allocation/unit-details`. Confirm only `WINNER` permits payment endpoints; verify error messages match. // Source: controllers/milestone-payment.controller.js:447-456; controllers/allocation.controller.js:271
2. **Cross-tenant access attempt.** Buyer A authenticated, queries `?registrationNumber=<Buyer B's>` on `/user-unit-details` → confirm rejection via inner `getDynamicTemplateData` `userId` check returning `Invalid resource access`. // Source: controllers/allocation.controller.js:259-264
3. **Unit without typology master.** Seed Unit with `typologyId` not present in `TypologyMaster` → confirm `getMilestoneUnitDetails` returns empty/error gracefully (currently `required: true` join). // Source: controllers/milestone-payment.controller.js:1530
4. **WINNER without `unitId`.** Force inconsistency and verify 400 `Could not fetch unit data` is returned, not 500. // Source: controllers/allocation.controller.js:271-275
5. **Parking preview math.** Vary `?carParking=N` for `N ∈ {0, 1, 2, 99, -1, "abc"}` and confirm response uses parking inventory `amount * count` for >0, zero otherwise; negative/NaN should fall through (no validation present). // Source: controllers/allocation.controller.js:312-337
6. **Offer eligibility window.** Submit `offerIds` containing an offer whose `startDate > now` or `endDate < now` → confirm omitted from response (no error, silently skipped). // Source: controllers/allocation.controller.js:373-382
7. **Concurrent milestone payment.** Two concurrent `POST /milestone-payment/order` for same registrationNumber/milestoneKey → only one should succeed; second should fail with `Milestone payment already in verification`. // Source: controllers/milestone-payment.controller.js:474-481
8. **HCF status transitions.** Pay HCF offline → verify `RegistrationUnit.hcfTransactionStatus` becomes `PAID` and `hcfTransactionId` populates. // Source: controllers/milestone-payment.controller.js:1411-1419
9. **Azure SAS URL expiry.** Pre-signed URLs in applicant documents will expire — verify SAS lifetime matches expected user session and reload behavior. // Source: controllers/user.controller.js:1059-1077
10. **Applicant ordering.** Add applicants with `relation='self'`, `'spouse'`, `'sister'`, `'father'`; confirm `'self'` always returned first, then ascending by id. // Source: controllers/user.controller.js:1017-1020
11. **Image URL parsing.** Set `Unit.imageUrl = "url1||url2||"` (trailing delimiter), `"||url1"` (leading), `""` (empty), `null` — verify frontend rendering does not throw. // Source: models/unit.model.js:424-429
12. **Soft-deleted RegistrationUnit / Unit / Project.** All three are paranoid; verify no buyer endpoint returns soft-deleted rows. // Source: models/registration-unit.model.js:353-357; models/unit.model.js:447-449; models/project.model.js:279
13. **`isMethod=true` query branch.** When set, `getDynamicTemplateData` returns plain objects to callers (not `res.send()`) — exercised by `getMilestoneUnitDetails` and `createOrder`. Ensure direct HTTP callers do not accidentally set `isMethod=true` and receive nothing. // Source: controllers/allocation.controller.js:260-262
14. **Edge: REFUND status.** Confirm refunded units do not appear in `getRegistration` units list — filter is `status != 'refund'` (case-sensitive). Note enum has `REFUND` uppercase — verify case match. // Source: controllers/registration.controller.js:2389-2391 vs models/registration-unit.model.js:121-124
15. **Boundary: `paymentType` values 1–5.** Each path computes `finalPayableAmount` differently — exhaustive matrix needed including GST-already-paid edge cases. // Source: controllers/milestone-payment.controller.js:537-570
16. **Audit trail.** `Unit.auditEnabled = true` and `RegistrationUnit.auditEnabled = true` — verify audit log rows generated on every mutation. // Source: models/unit.model.js:452; models/registration-unit.model.js:358
17. **Mavis sync resilience.** Force `mavisService.insertMavisMilestonePayment` to fail — verify buyer-facing flow still succeeds and only `logger.error` fires. // Source: controllers/milestone-payment.controller.js:228-234
18. **`getRegistrationUnitBookingFormData` query is GROUP BY heavy.** Validate response correctness when applicant has multiple document-bearing rows; group keys include `applicants.id`. // Source: controllers/user.controller.js:1021-1027
