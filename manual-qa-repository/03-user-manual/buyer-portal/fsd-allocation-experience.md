# FSD — Buyer Portal: Allocation Experience
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Allocation Experience is the buyer-side flow that lets a registered buyer convert an EOI/registration into a confirmed unit booking. The buyer:

1. Sees whether a project has an active or upcoming allocation campaign.
2. Selects a unit (DYNAMIC) or sees their pre-allocated unit (PHYSICAL_EVENT / STATIC).
3. Initiates an allocation payment order (places HOLD on the unit + parking).
4. Completes payment on the gateway (Easebuzz default, Razorpay supported).
5. On payment success the unit is finalised (WINNER) and the buyer is notified via WhatsApp + SMS.

The buyer reaches the flow via `/api/v1/user/allocation/...` routes mounted at `routes/user.routes.js:84`.
// Source: source-code/backend/src/routes/user.routes.js:84

There is **no real-time push** (no WebSocket / Socket.IO / SSE) — the system relies on REST polling for campaign status and post-payment notifications.
// Source: NOT FOUND — no `socket.io`, `io.emit`, `getIO`, `new Server`, `EventSource` or `sse` references found anywhere under source-code/backend/src/. Two comments at allocation.service.js:325 and 1698 say `// update websocket and notification` but no implementation exists.

---

## 2. Data Model

### 2.1 `AllocationCampaign` (allocation_campaigns)
// Source: source-code/backend/src/models/allocation-campaign.model.js:11-110

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT UNSIGNED PK | |
| `name` | STRING(255) | Campaign name |
| `projectId` | BIGINT UNSIGNED | FK projects.id |
| `allocationType` | ENUM('STATIC','DYNAMIC','PHYSICAL_EVENT') | // Source: allocation-campaign.model.js:50 |
| `startTime` / `endTime` | DATE | |
| `roundTime` | TINYINT UNSIGNED | DYNAMIC only — minutes per round // Source: allocation-campaign.model.js:71-74 |
| `usersPerUnit` | TINYINT UNSIGNED | DYNAMIC only // Source: allocation-campaign.model.js:76-79 |
| `notBookedRegistrationCount` | INTEGER UNSIGNED | Pre-computed for STATIC // Source: allocation-campaign.model.js:65-69 |
| `status` | ENUM('RUNNING','COMPLETED','NOT_STARTED','FAILED','CANCELLED','STOPPED') | // Source: allocation-campaign.model.js:81-85 |
| `stopScheduled` | BOOLEAN | // Source: allocation-campaign.model.js:86-89 |
| paranoid | true | Soft-delete enabled // Source: allocation-campaign.model.js:105 |

### 2.2 `AllocationCampaignUnit` (allocation_campaign_units) — PHYSICAL_EVENT free pool
// Source: source-code/backend/src/models/allocation-campaign-unit.model.js:11-99

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT UNSIGNED PK | |
| `allocationCampaignId` | BIGINT UNSIGNED | |
| `unitId` / `towerId` | INTEGER | FK units.id / towers.id |
| `towerName` / `unitNo` | STRING(255) | Display |
| `status` | ENUM('AVAILABLE','HOLD','BOOKED') | // Source: allocation-campaign-unit.model.js:70-75 |
| `registrationUnitId` | BIGINT UNSIGNED | Set on booking |
| `isFromAssignedMigration` | BOOLEAN | true if unit migrated from initial_allotment after a booking // Source: allocation-campaign-unit.model.js:81-86 |

### 2.3 `DynamicRound` (dynamic_rounds)
// Source: source-code/backend/src/models/dynamic-round.model.js:11-75

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT UNSIGNED PK | |
| `allocationCampaignId` | BIGINT UNSIGNED | FK allocation_campaigns.id |
| `startTime` / `endTime` | DATE | |
| `roundStatus` | ENUM('RUNNING','COMPLETED','NOT_STARTED','FAILED') | // Source: dynamic-round.model.js:51-55 |
| `isActive` | BOOLEAN | // Source: dynamic-round.model.js:57-61 |

### 2.4 `Unit` (units) status
// Source: source-code/backend/src/models/unit.model.js:176-179

`status` ENUM: `'AVAILABLE', 'HOLD', 'BOOKED', 'REFUGE', 'PREBOOKED', 'PBT', 'RESERVED'`

### 2.5 `RegistrationUnit` status
// Source: source-code/backend/src/models/registration-unit.model.js:122

`status` ENUM: `'WAITLIST', 'PREALLOCATED', 'ALLOCATED', 'WINNER', 'HOLD', 'REFUND'`
// Mirror constant: source-code/backend/src/constants/global.js:63-70

### 2.6 Status enum constants
// Source: source-code/backend/src/constants/global.js:55-61

```
allocationStatus = { confirmed, available, waiting, cancelled, refunded }
```

---

## 3. State Machines

### 3.1 AllocationCampaign status
// Source: allocation-campaign.model.js:81-85

```
NOT_STARTED ──(start)──► RUNNING ──(complete)──► COMPLETED
                                   ──(stop)─────► STOPPED
                                   ──(cancel)───► CANCELLED
                                   ──(error)────► FAILED
```

Eligibility for buyer visibility: only `RUNNING` or `NOT_STARTED` campaigns are returned from `getLatestAllocationCampaigns`.
// Source: source-code/backend/src/services/allocation-campaign.service.js:1362  
`const isEligibleStatus = latestCampaign && ['RUNNING', 'NOT_STARTED'].includes(latestCampaign.status);`

### 3.2 Unit status (buyer-flow subset)
// Source: source-code/backend/src/services/allocation.service.js:630-642, 798-805

```
AVAILABLE ──(buyer creates order)──► HOLD ──(payment success)──► BOOKED
                                          ──(payment fail/cancel)──► AVAILABLE
                                          ──(hold expires ≥20 min)──► AVAILABLE
```

### 3.3 RegistrationUnit status (buyer-flow subset)
// Source: source-code/backend/src/services/allocation.service.js:671-673, 803-806, 210-230

```
ALLOCATED ──(order created)──► HOLD ──(payment success)──► WINNER
                                    ──(failure/expiry)─────► ALLOCATED (typology kept, unit_id/tower_id NULLed)
```

### 3.4 Hold-expiry rule
A HOLD older than **20 minutes** is treated as expired by `handleExpiredHoldOrFailedPayment`.
// Source: source-code/backend/src/services/allocation.service.js:159, 174-178
`const timeDiff = (now - transactionCreatedDate) / (1000 * 60); if (timeDiff >= 20) { return await resetUnitStatuses(...); }`

---

## 4. Business Rules

| # | Rule | Source |
|---|------|--------|
| BR-AE-01 | Active campaign must be in status `RUNNING` for a buyer to create an allocation order; otherwise throw `Allotments are closed`. | allocation.service.js:519-527 |
| BR-AE-02 | Buyer can include only one logical registration in a single order — all `RegistrationUnit`s in the order must share the same `registrationId`. | allocation.service.js:475-480 |
| BR-AE-03 | If a `RegistrationUnit` is already `WINNER`, reject with `Unit already confirmed` + return `confirmationNumber` (bookingNumber). | allocation.service.js:571-574 |
| BR-AE-04 | If a `RegistrationUnit` is already `HOLD`, reject with `Your Payment is under Verification` + return `confirmationNumber`. | allocation.service.js:576-578 |
| BR-AE-05 | Unit master must be `AVAILABLE`. Otherwise reject with `{towerName} - {unitNo} is not available for booking`. | allocation.service.js:585-587 |
| BR-AE-06 | Parking selection requires per-project master config flag `park_enabled = true`. | allocation.service.js:589-596 |
| BR-AE-07 | Parking inventory must have an `AVAILABLE` row; otherwise reject with `Parking slots are no longer available`. | allocation.service.js:598-603, 678-685 |
| BR-AE-08 | The unit hold is placed via conditional `UPDATE ... WHERE status='AVAILABLE'`. If `affectedRows === 0`, the unit was raced — reject with `Unit … is already under booking`. | allocation.service.js:630-642 |
| BR-AE-09 | Final allocation amount must be > 0; otherwise reject with `Invalid confirmation amount for {tower} - {unit}`. | allocation.service.js:721-728 |
| BR-AE-10 | If payment gateway initiation fails, HOLDs on unit + registration_unit + parking are all rolled back atomically. | allocation.service.js:789-826 |
| BR-AE-11 | Hold is automatically expired after **20 minutes** from `paymentTransaction.createdAt`. | allocation.service.js:174-178 |
| BR-AE-12 | Default gateway is `easebuzz`; Razorpay is supported but only Razorpay orders can be cancelled via `cancelAllocationOrderService`. | allocation.service.js:432, 426 |
| BR-AE-13 | A `RegistrationUnit` with status `WINNER` will have its `unitId` enforced on `getDynamicTemplateData`. If missing, return `Could not fetch unit data`. | allocation.controller.js:271-279 |
| BR-AE-14 | `KYC Incomplete` is returned when `applicationDetails` is requested but `registrationUnit.isKycSubmitted` is false. | allocation.controller.js:245-247 |
| BR-AE-15 | A non-owning user cannot read `getDynamicTemplateData` for a registration unless they are admin / sales_manager / sales_manager_admin. | allocation.controller.js:257-264 |
| BR-AE-16 | On payment success, Python pricing service is notified (`POST /update-payment-status` with `payment_status: true`) — fire-and-forget. | allocation.service.js:328-342 |
| BR-AE-17 | LeadSquared booking activity is created per registration unit after success. Failures are logged but non-fatal. | allocation.service.js:367-381 |
| BR-AE-18 | Hold-expiry reset uses raw SQL that nullifies `unit_id`, `tower_id` on the registration unit and restores `typology_id` from `unit_typologies` by `apartment_type`. | allocation.service.js:210-230 |
| BR-AE-19 | Hold expiry triggers a Python notification with `payment_status: false`. | allocation.service.js:241-256 |

---

## 5. Notification Dispatch

All allocation-result notifications are dispatched by `allocationNotificationService(status, smsData)`.
// Source: source-code/backend/src/services/allocation.service.js:1796-1833

### 5.1 Payment SUCCESS (status === true)
| Channel | Recipient | Template / SMS code | Args |
|---------|-----------|---------------------|------|
| WhatsApp | `${countryCode}${phone}` | `congrates_payment_success_27sept` | `[firstName, "{towerName} - {allocatedUnit}"]` |
| SMS (only if `countryCode === '+91'`) | `${countryCode}${phone}` | `ALLOTMENT_PAYMENT_SUCCESS` | — |

// Source: source-code/backend/src/services/allocation.service.js:1819-1822 (WhatsApp success template), 1830-1832 (SMS success)

### 5.2 Payment FAILURE (status === false)
| Channel | Recipient | Template / SMS code |
|---------|-----------|---------------------|
| WhatsApp | `${countryCode}${phone}` | `payment_unsuccessful_27sept` |
| SMS (only if `countryCode === '+91'`) | `${countryCode}${phone}` | `ALLOTMENT_PAYMENT_FAILED` |

// Source: source-code/backend/src/services/allocation.service.js:1802 (WhatsApp fail), 1811 (SMS fail)

### 5.3 Trigger points
- Success path: `processAllocationTransactionService` (allocation.service.js:1615) and `checkAndProcessAllocationByReferenceService` (cron / webhook path) at allocation.service.js:352-361 iterate over each unit and call `allocationNotificationService(true, smsData)`.
- Failure path: `handleExpiredHoldOrFailedPayment` → allocation.service.js:152-154 calls `allocationNotificationService(false, smsData)` for failed statuses `['cancelled', 'bounced', 'failed']`.
// Source: allocation.service.js:143-156

### 5.4 No push notification, no email
// Source: NOT FOUND — no email sending in allocation flow; no push / Firebase / OneSignal integration found.

---

## 6. API Endpoints

All endpoints under `/api/v1/user/allocation` require JWT (protect middleware) and role `user`.
// Source: source-code/backend/src/routes/user.routes.js:49-50, 84

| Method | Path | Controller / Service | Purpose |
|--------|------|----------------------|---------|
| GET | `/api/v1/user/allocation/campaigns/latest` | `AllocationCampaignController.getLatestAllocationCampaigns` → `getLatestAllocationCampaigns(projectId)` | Returns latest `RUNNING` or `NOT_STARTED` campaign (data is `null` otherwise). Response: `{ allocationType, status, startTime, endTime }`. // Source: routes/user/allocation.routes.js:46; allocation-campaign.service.js:1343-1378 |
| GET | `/api/v1/user/allocation/unit-details` | `getDynamicTemplateData` | Returns pricing + unit template for the buyer's preview screen. Query params: `unitId, registrationNumber, carParking, applicationDetails, isMethod, offerIds`. // Source: routes/user/allocation.routes.js:45; allocation.controller.js:233-235 |
| POST | `/api/v1/user/allocation/order` | `createAllocationOrder` → `createAllocationOrderService` | Validates units, places HOLDs, initiates payment. Body schema: `allocationOrderSchema`. Wraps body as `{ items, orderFromSm: false }`. // Source: routes/user/allocation.routes.js:17-28; allocation.service.js:431 |
| POST | `/api/v1/user/allocation/transaction/process` | `processAllocationTransaction` | Payment-gateway return callback. // Source: routes/user/allocation.routes.js:31 |
| POST | `/api/v1/user/allocation/submit-kyc` | `submitKyc` | Submits KYC for allocation (mapped with `reqFromSm: false`). Body: `submitKycSchema`. // Source: routes/user/allocation.routes.js:33-44 |
| POST | `/api/v1/user/allocation/pay-intent` | `createPaymentIntent` | Creates a payment intent (Razorpay path). // Source: routes/user/allocation.routes.js:48 |

### 6.1 Response shape — `/campaigns/latest`
// Source: allocation-campaign.service.js:1374-1377
```json
{ "message": "Latest allocation campaigns retrieved successfully",
  "data": { "allocationType": "DYNAMIC", "status": "RUNNING", "startTime": "...", "endTime": "..." } | null }
```

---

## 7. Known Bugs / Gaps

| # | Severity | Description | Source |
|---|----------|-------------|--------|
| GAP-AE-01 | High | **No WebSocket / SSE infrastructure**, despite codebase comments referring to it. Buyer UI cannot receive real-time campaign-state changes or hold-released events — must poll `/campaigns/latest`. | allocation.service.js:325 and 1698 (comments only); no implementation under source-code/backend/src/ |
| GAP-AE-02 | High | **Hold expiry is lazy** — reset is triggered only when `checkAndProcessAllocationByReferenceService` is invoked (cron / webhook). A user closing the tab during HOLD leaves the unit unavailable until the cron polls the gateway. | allocation.service.js:159-178; cron at cron/allocation-payment-reconcile.cron.js |
| GAP-AE-03 | Medium | `handleExpiredHoldOrFailedPayment` uses a hard-coded 20-minute threshold; no project-level config or constant. | allocation.service.js:176 |
| GAP-AE-04 | Medium | `cancelAllocationOrderService` rejects all gateways except `razorpay` (`Only Razorpay orders can be cancelled via this endpoint`). Easebuzz cancellations are not supported via this endpoint. | allocation.service.js:418-428 |
| GAP-AE-05 | Medium | `processAllocationTransactionService` / `checkAndProcessAllocationByReferenceService` returns `success: false` with `Invalid registration details` if any of `registrationUnitRequested`, `registrationNumbers`, `requestedUnitIds` is empty — no specific 404. | allocation.service.js:320-322 |
| GAP-AE-06 | Low | LeadSquared activity errors (`processBookingOnLSQ`) are swallowed — only logged. Buyer sees success even if LSQ booking record is missing. | allocation.service.js:372-381 |
| GAP-AE-07 | Low | Comments at allocation.service.js:623 admit Redis hold mirroring is desired but not implemented (`// allocated must match DB - can check with redis if user has allocated this unit`). | allocation.service.js:623 |
| GAP-AE-08 | Low | Inconsistent country-code formatting — WhatsApp uses `${countryCode}${phone}` (varies if `+91` vs `91`), SMS guard checks `countryCode === '+91'` literal. Non-`+91` numbers silently skip SMS. | allocation.service.js:1810-1812, 1830-1832 |
| GAP-AE-09 | Low | `getDynamicTemplateData` for `WINNER` returns `Could not fetch unit data` if `unitId` is somehow missing — could leave winning buyers blocked. | allocation.controller.js:271-275 |
| GAP-AE-10 | Info | No rate-limit / throttle middleware found on `/api/v1/user/allocation/order` — a user could attempt rapid order creation. | NOT FOUND — verify manually; no `rateLimit` / `throttle` imports on allocation routes |

---

## 8. QA Risk Areas

### 8.1 Concurrency / Race Conditions
- **Hold race**: Two buyers click "Confirm" simultaneously on the same `DYNAMIC` unit. The conditional UPDATE at allocation.service.js:630-636 (`WHERE unitId=? AND status='AVAILABLE'`) is the only race-protection. Verify only one buyer succeeds, the loser gets `Unit … is already under booking`.
- **Parking race**: `ParkingInventory` is locked with `LOCK.UPDATE` at allocation.service.js:678-685. Verify two simultaneous orders with parking work correctly.
- **Hold expiry race**: A buyer pays at minute 19:58 while the cron picks up the order at 20:00. The reset SQL at allocation.service.js:210-230 only acts on rows still in `HOLD` — verify the success path's earlier UPDATE prevents accidental reset.

### 8.2 Payment Gateway Failure Paths
- Gateway timeout during `paymentGatewayService.initiatePayment` — verify all 3 statuses (`Unit`, `RegistrationUnit`, `ParkingInventory`) revert (allocation.service.js:796-823).
- Gateway returns `cancelled` / `bounced` / `failed` — verify failure WhatsApp + SMS sent and statuses reset (allocation.service.js:143-156).
- Gateway returns success but `finalizeAllocationForTransactionV2` errors — verify buyer state vs notifications consistency.

### 8.3 Campaign-status edge cases
- `NOT_STARTED` campaign visible to buyer but `createAllocationOrder` blocked with `Allotments are closed` (only `RUNNING` is accepted at allocation.service.js:521). Verify UI handles this.
- Campaign transitions from `RUNNING` → `STOPPED` mid-session — verify the buyer's order-create call is rejected.

### 8.4 Notification Reliability
- `congrates_payment_success_27sept` requires WhatsApp template approval — verify on UAT.
- Non-Indian `countryCode` skips SMS — verify by changing user `countryCode`.
- WhatsApp template `payment_unsuccessful_27sept` accepts an empty args array `[]` (allocation.service.js:1802). Verify it renders correctly.

### 8.5 KYC / Application Gating
- `getDynamicTemplateData?applicationDetails=true` returns `KYC Incomplete` when `isKycSubmitted=false`. Verify front-end blocks the buyer from proceeding.

### 8.6 Data-leak Risk
- `getDynamicTemplateData` rejects with 401 when `registration.userId !== req.user.id` and role isn't admin / SM. Verify buyer-A cannot read buyer-B unit details by guessing `registrationNumber`.

### 8.7 LeadSquared Side-Effects (out of test scope)
- Per CLAUDE.md §1, LSQ is excluded from QA. Treat LSQ errors as informational only — confirm allocation flow is independently green even when LSQ fails.

### 8.8 Multi-unit Orders
- `items` is an array; `validatedPairs` is built per item; one failed item rolls back the whole order (allocation.service.js:626-749). Verify partial failure does not leak HOLDs.

### 8.9 No real-time updates
- All time-sensitive UI (countdown to `endTime`, "{n} units left", "unit just got taken") relies on **buyer-side polling**. Verify polling intervals match `roundTime` for DYNAMIC campaigns (campaign-level field at allocation-campaign.model.js:71-74) — there is currently **no backend push**.
