# FSD — Buyer Portal: Home Dashboard
**Source-verified:** 2026-05-24
**Backend path:** `source-code/backend/src/`
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Buyer Portal Home Dashboard is the post-login landing experience for an authenticated end-user (role `user`). It aggregates the buyer's project registration(s), all paid registration units, allocation status, KYC status, home-loan status, milestone payment data, and a global "registration count" ticker. There is **no single `/dashboard` endpoint**; the dashboard view is composed on the frontend from several authenticated buyer endpoints, all gated by `protect` + `restrictTo('user')` middleware. // Source: routes/user.routes.js:49-51

Composing endpoints (all mounted under the buyer router, no `/buyer` prefix at backend — frontend prefix only):

| Purpose | Method + Path | Controller |
|---|---|---|
| Get user's project registration + paid units snapshot | `GET /registration` | `getRegistration` in `controllers/registration.controller.js:2328` |
| Get all registrations (paginated, search-able) — used for "My Bookings" listing | `GET /user-registrations` | `getAllRegistrations` in `controllers/registration.controller.js:2448` |
| Global ticker count (e.g., "X buyers have registered") | `GET /registration-count` | `getTickerClock` in `controllers/registration.controller.js:2629` |
| Per-unit milestone payment view | `GET /user-unit-details` | `getMilestoneUnitDetails` in `controllers/milestone-payment.controller.js:1486` |
| Per-transaction milestone breakdown | `GET /milestone-transaction-details` | `getMilestoneTransactionDetails` in `controllers/milestone-payment.controller.js:1716` |
| Latest running allocation campaign banner | `GET /allocation/campaigns/latest` | `AllocationCampaignController.getLatestAllocationCampaigns` in `routes/user/allocation.routes.js:46` |

// Source: routes/user.routes.js:53-178

A single hard-coded `projectId` is resolved per environment: `projectId = app.production ? 1 : 2`. // Source: controllers/registration.controller.js:2337, 2593, 2631

---

## 2. Data Model

The dashboard reads from these tables (the buyer portal has **no dedicated "dashboard" model**):

### `registrations` (model: `Registration`)
- `id`, `userId`, `projectId`, `registrationNumber`, `paymentStatus`, `registrationTransactionId`, `budgetAmount`, `purchasePurpose`, `homeLoanIntent`, `preferredFloorMin`, `preferredFloorMax`, `stage`, `parkingAmount`, `walkInSourceId`, `walkInSourceXrCode`, `opportunityId` // Source: controllers/registration.controller.js:2340-2401 (field usage) and services/registration.service.js (search/include logic)

### `registration_units` (model: `RegistrationUnit`)
Primary unit-of-truth for dashboard. Significant columns:
- `id`, `registrationId`, `registrationNumber`, `confirmationNumber`, `bookingNumber`, `kycNumber` // Source: models/registration-unit.model.js:67-93
- `apartmentType`, `carpetArea`, `registrationAmount`, `allocationAmount`, `allocationAmountGst` // Source: models/registration-unit.model.js:94-116
- `allocationStatus` ENUM(`confirmed`, `available`, `waiting`, `cancelled`, `refunded`) // Source: models/registration-unit.model.js:117-120
- `status` ENUM(`WAITLIST`, `PREALLOCATED`, `ALLOCATED`, `WINNER`, `HOLD`, `REFUND`) // Source: models/registration-unit.model.js:121-124
- `availableForAllocation` BOOLEAN — used by dynamic allocation logic // Source: models/registration-unit.model.js:125-130
- `allocatedTower`, `allocatedFloor`, `allocatedUnit` // Source: models/registration-unit.model.js:131-142
- `allocationTransactionId`, `allocationPaymentSource` ENUM(`gateway`, `admin`) // Source: models/registration-unit.model.js:147-155
- `hcfTransactionStatus` ENUM(`VERIFICATION`, `PAID`, `FAILED`), `hcfTransactionId` // Source: models/registration-unit.model.js:156-166
- `isKycSubmitted`, `selfKycSubmitted`, `selfKycBookingActivitySubmitted`, `selfKycFinalSubmitted`, `isKycPdfSubmitted` // Source: models/registration-unit.model.js:167-208
- `isParkingSelected`, `parkingCount`, `parkingAmount` // Source: models/registration-unit.model.js:209-229
- `isAdditionalUnit`, `holdAt`, `refundAt`, `deletedAt` (paranoid soft-delete) // Source: models/registration-unit.model.js:318-345, 353

### `payment_transactions` (model: `PaymentTransaction`)
Dashboard joins on `CompletedPaymentTransaction` alias to compute earliest payment date. // Source: services/registration.service.js:83, 114

### `registration_home_loans` (model: `RegistrationHomeLoan`)
- LEFT JOIN where `loanApprovalStatus != 'admin_rejected'`; `homeLoanId` (registrationNumber of HL) is surfaced on dashboard. // Source: services/registration.service.js:97-102, 93

### `projects` (model: `Project`)
- `tickerClock` column is the source of truth for the registration counter widget. // Source: controllers/registration.controller.js:2637

### `allocation_campaigns` (model: `AllocationCampaign`)
- `status` (`RUNNING` flag), `allocationType` (`DYNAMIC` vs other), `startTime`, `endTime` — drives dashboard allocation banner. // Source: services/registration.service.js:127-132, 183-185

### `units`, `typology_master`, `applicants` (counted via correlated subquery)
- `applicantsCount` is calculated via raw SQL subquery: `SELECT COUNT(*) FROM applicants WHERE applicants.registration_unit_id = RegistrationUnits.id AND applicants.deleted_at IS NULL` // Source: services/registration.service.js:69-73

---

## 3. State Machines

### Registration Unit `status` lifecycle (buyer-visible)
```
WAITLIST  →  PREALLOCATED  →  ALLOCATED  →  WINNER
                                       ↘  HOLD     (offline payment hold)
                                       ↘  REFUND   (cancellation / refund)
```
// Source: models/registration-unit.model.js:121-124 (ENUM definition)

### Dashboard-derived `allocationStatus` (computed in service, not stored)
The buyer dashboard service overrides the raw DB status using runtime logic:

1. If `rawStatus ∈ {WINNER, HOLD, REFUND}` → return as-is (terminal). // Source: services/registration.service.js:133, 137-140
2. Else if **no campaign running** → force `'WAITLIST'`. // Source: services/registration.service.js:142-144
3. Else if campaign is **NOT dynamic** AND `(status==='WAITLIST' && !availableForAllocation)` → `'WAITLIST'`. Otherwise → `'CHOOSE'`. // Source: services/registration.service.js:148-153
4. Else (campaign **is dynamic**) AND `(status==='WAITLIST' && !availableForAllocation)` → `'WAITLIST'`. // Source: services/registration.service.js:155-157
5. Else dynamic + has projectKey + has registrationNumber → check Redis allocation key; if value present → `'ALLOCATED'`, else `'WAITLIST'`. // Source: services/registration.service.js:159-166

### Payment status (from `paymentStatus` on Registration)
- `getRegistration` only returns a "completed" payload when `registration.paymentStatus === 'success'`. // Source: controllers/registration.controller.js:2366

### HCF transaction status
- `VERIFICATION` → `PAID` | `FAILED`. // Source: models/registration-unit.model.js:156-161

---

## 4. Business Rules

### BR-DASH-001 — Single project per environment
`projectId` is hard-coded by env: `1` in production, `2` otherwise. The dashboard surfaces only registrations for that single project. // Source: controllers/registration.controller.js:2337, 2593, 2631

### BR-DASH-002 — Refunded units hidden from `/registration`
`getRegistration` filters out units with `status = 'refund'` (case-sensitive lowercase 'refund'). // Source: controllers/registration.controller.js:2390 `status: { [Op.ne]: 'refund' }`

### BR-DASH-003 — Successful registration prerequisite
Dashboard "completed" payload is only produced when `paymentStatus === 'success'` AND a completed `PaymentTransaction` of `transactionType: 1` exists. // Source: controllers/registration.controller.js:2366-2384

### BR-DASH-004 — Draft persistence by slug
If no completed registration and `slug` query is provided, the API returns the user's `RegistrationDraft` for that slug + projectId. // Source: controllers/registration.controller.js:2427-2438

### BR-DASH-005 — Default pagination
`getAllRegistrations` defaults to `page=1, limit=10` with optional `search`. // Source: services/registration.service.js:29 `{ page = 1, limit = 10, search = '' }`

### BR-DASH-006 — Search scope
Search matches across `User.first_name`, `User.last_name`, `RegistrationUnits.registration_number`, and `stage` (case-insensitive `LIKE`). // Source: services/registration.service.js:36-44

### BR-DASH-007 — Terminal statuses bypass campaign override
WINNER, HOLD, REFUND are returned verbatim regardless of campaign state. // Source: services/registration.service.js:133, 137-140

### BR-DASH-008 — Home-loan inclusion
Home-loan ID surfaces on dashboard row only if its `loanApprovalStatus != 'admin_rejected'`. // Source: services/registration.service.js:97-102

### BR-DASH-009 — Ticker reads `Project.tickerClock`
The "registration count" banner is whatever the `projects.ticker_clock` column holds for the active project — not a live count of `registrations` rows. // Source: controllers/registration.controller.js:2637

### BR-DASH-010 — User scoping
All dashboard queries scope by `req.user.id` from JWT — there is no `/user/:id/dashboard` pattern; the user is always derived from the auth token. // Source: routes/user.routes.js:49-51, controllers/registration.controller.js:2330

### BR-DASH-011 — Redis cache for dynamic allocation
For dynamic campaigns, allocation result is looked up via `RedisService.getRegistrationAllocKey(projectKey, registrationNumber)`. Cache MISS implies still WAITLIST. // Source: services/registration.service.js:164-166

---

## 5. Notification Dispatch

The dashboard endpoints are pure-read and **do not dispatch notifications** themselves. Notification side effects originate from upstream flows (registration submission, allocation, KYC submit) and are NOT triggered by viewing the dashboard.

// Source: NOT FOUND — no `email.service`, `sms.service`, `whatsapp.service`, or `kaleyra.service` import in `getRegistration`, `getAllRegistrations`, `getTickerClock`, `getMilestoneUnitDetails`, or `getMilestoneTransactionDetails`. Verified by direct read of controller bodies in `registration.controller.js:2328-2644` and `milestone-payment.controller.js:1486-1856`.

---

## 6. API Endpoints

All routes below require `Authorization: Bearer <jwt>` and role `user`. // Source: routes/user.routes.js:49-51

### 6.1 GET `/registration`
- **Query**: `slug?: string`
- **Returns (200, paid)**:
  ```json
  {
    "registrationNumber": "string",
    "registrationDetails": {
      "industry": "string|null",
      "budgetAmount": "decimal",
      "purchasePurpose": "string",
      "homeLoanIntent": "string",
      "preferredFloorMin": "number",
      "preferredFloorMax": "number"
    },
    "units": [{
      "apartmentType": "string",
      "registrationNumber": "string",
      "carpetArea": "string",
      "towerId": "string",
      "towerName": "string",
      "isAdditionalUnit": "boolean"
    }],
    "transactionDate": "ISODate"
  }
  ```
  // Source: controllers/registration.controller.js:2394-2415
- **Returns (200, draft)**: `{ registrationNumber: null, draft: <json>|null }` // Source: controllers/registration.controller.js:2435-2441
- **Errors**: `500` "Something went wrong" on exception. // Source: controllers/registration.controller.js:2443-2444

### 6.2 GET `/user-registrations`
- **Query**: `page?: number=1`, `limit?: number=10`, `search?: string`
- **Returns**:
  ```json
  {
    "registrations": [/* enriched dashboard rows with allocationStatus */],
    "pagination": { "currentPage": 1, "totalRecords": N, "limit": 10 },
    "isDynamic": "boolean",
    "allocationStarted": "boolean",
    "dynamicAllocationPeriod": { "dynamicAllotmentStart": "...", "dynamicAllotmentEnd": "..." }
  }
  ```
  // Source: services/registration.service.js:170-186

### 6.3 GET `/registration-count`
- **Query**: none
- **Returns**: `{ "registrationCount": <project.tickerClock value> }`
- **Errors**: `500` if Project not found / throws. // Source: controllers/registration.controller.js:2629-2643

### 6.4 GET `/user-unit-details`
- **Query**: `registrationNumber: string` (required), `unitId: string` (required)
- **Errors**: `400 "Missing required query parameters: registrationNumber and unitId"` if either missing. // Source: controllers/milestone-payment.controller.js:1491-1493
- **Returns**: `{ unitNumber, unitName, unitData: [milestone rows], additionalInfo }` // Source: controllers/milestone-payment.controller.js:1636-1645

### 6.5 GET `/milestone-transaction-details`
- **Query**: `transactionId?`, `initialPaid?: 'true'|'false'`, `registrationNumber?`, `isAllocation?: 'true'|'false'`
- **Errors**: `400 "Missing required query parameters"` if `transactionId` missing AND not allocation flow. // Source: controllers/milestone-payment.controller.js:1722-1725

### 6.6 GET `/allocation/campaigns/latest`
- Mounted at `routes/user/allocation.routes.js:46`. Returns latest campaign metadata used for dashboard allocation banner. // Source: routes/user/allocation.routes.js:46

### 6.7 GET `/payment-gateways`
- Validated with `getPaymentGatewaysSchema`; returns active gateways (used by buyer pay-from-dashboard flow). // Source: routes/user.routes.js:174-178

---

## 7. Known Bugs / Gaps

### BUG-DASH-001 — Mutating `req.query` in milestone unit details
`getMilestoneUnitDetails` constructs `mockReq` and calls `getDynamicTemplateData` directly; large block of commented-out logic in `getAllRegistrations` suggests the planned home-confirmation enrichment was disabled due to `req.query` mutation regression. // Source: controllers/registration.controller.js:2457-2483 (commented-out enrichment block referencing "tempReq instead of req to avoid mutating the original request")

### BUG-DASH-002 — `getMilestoneUnitDetails` returns 500 with leaked controller-internal error
On `templateData.unitTypologyId` missing, response is `500 "Failed to get unit details"` with original `message` logged but not returned. // Source: controllers/milestone-payment.controller.js:1648-1649

### BUG-DASH-003 — `tickerClock` is static project metadata, not live count
Despite the name `/registration-count`, the value comes from `Project.tickerClock` column — no `Registration.count()` is performed. Display can become stale if admin doesn't update the column. // Source: controllers/registration.controller.js:2637

### BUG-DASH-004 — Hard-coded project in production
`projectId = app.production ? 1 : 2` makes the buyer dashboard single-project by design. Multi-project rollout will require code change, not config. // Source: controllers/registration.controller.js:2337

### BUG-DASH-005 — Refund filter is lowercase 'refund' while `status` ENUM is uppercase 'REFUND'
`getRegistration` filters `{ status: { [Op.ne]: 'refund' } }` (lowercase) but the ENUM stores `'REFUND'` uppercase. Filter likely never matches → refunded units NOT actually hidden from the "paid" branch payload. // Source: controllers/registration.controller.js:2390 vs models/registration-unit.model.js:122

### GAP-DASH-001 — No dedicated buyer dashboard aggregator
No `/dashboard`, `/home`, `/summary`, or `/kpi` endpoint exists in `routes/user.routes.js`. The frontend must orchestrate 3-5 calls to render the home view. // Source: routes/user.routes.js (full file scanned 1-180)

### GAP-DASH-002 — No "countdown" endpoint
Searched: no `countdown`, `kpi`, or `summary` route is exposed for the buyer role.
// Source: NOT FOUND — Grep on `routes/user.routes.js` and `routes/user/` returned no matches; verify manually if a frontend timer hits a different endpoint.

---

## 8. QA Risk Areas

### RISK-DASH-001 — Dashboard depends on auth session storage
Tests must use `automation-repository/fixtures/.auth/buyer.json`; `protect` middleware will 401 otherwise. // Source: routes/user.routes.js:49

### RISK-DASH-002 — Environment-based projectId
UAT will return projectId=2 data; production projectId=1. Tests asserting unit counts MUST scope expectations to `process.env.ENV`. // Source: controllers/registration.controller.js:2337

### RISK-DASH-003 — Computed `allocationStatus` is volatile
A unit's dashboard status changes based on (a) campaign RUNNING/STOPPED, (b) campaign type DYNAMIC vs static, (c) Redis cache state. Static assertions on `allocationStatus` will flake. Tests should mock or pin the campaign state. // Source: services/registration.service.js:135-167

### RISK-DASH-004 — Redis cache dependency
Dynamic-allocation rows hit `RedisService.getValue`. If Redis is down or cache evicted, dashboard returns WAITLIST even when DB shows otherwise. // Source: services/registration.service.js:164-166

### RISK-DASH-005 — `tickerClock` static value
Smoke tests that assert "count > 0" must not assume monotonic increase — value is admin-managed via `projects.ticker_clock` column. // Source: controllers/registration.controller.js:2637

### RISK-DASH-006 — `subQuery: false` + correlated subquery
The applicants count uses raw SQL inside `attributes`; pagination interacts unusually with `subQuery: false`. Counts may double-report if RegistrationUnits joined many-to-many. // Source: services/registration.service.js:69-73, 123

### RISK-DASH-007 — Home-loan join filter
A user with an `admin_rejected` home loan will have `homeLoanId = null` on dashboard — verify this is the desired UX message vs "rejected" badge. // Source: services/registration.service.js:101

### RISK-DASH-008 — Soft-deleted units
`RegistrationUnit` is paranoid (`deletedAt`). Service queries do not explicitly include `paranoid: false` — soft-deleted units are excluded. Verify with QA whether refunded units use `deletedAt` or only `status='REFUND'`. // Source: models/registration-unit.model.js:353-354

### RISK-DASH-009 — Refund hide-filter bug (see BUG-DASH-005)
If a unit is refunded, the lowercase `'refund'` filter does NOT match the uppercase ENUM; refunded units could leak into the `units[]` array on the paid-registration branch. QA should explicitly test this case. // Source: controllers/registration.controller.js:2390

### RISK-DASH-010 — Cross-portal data dependency
Dashboard rows depend on admin-configured `allocation_campaigns`, `master_config` (max_applicants_per_unit), `parking_inventory`, and `projects.ticker_clock`. Buyer-only tests must seed/freeze these. // Source: services/registration.service.js:127, services/allocation.service.js:1970 (`master_config`)

### RISK-DASH-011 — LSQ exclusion compliance
Per `CLAUDE.md` constraint #1, LeadSquared is excluded. Dashboard reads of `lsqBookingActivityId`, `lsqBookingFormActivityId` are display-only — verify no test triggers LSQ calls. // Source: models/registration-unit.model.js:270-281
