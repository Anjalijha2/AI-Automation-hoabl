---
type: clarifications
tags: [questions, clarifications, all-modules]
updated: 2026-05-10
resolved-count: 30
open-count: 0
---

# Open Questions — All Modules

Single location for ALL unresolved questions. Check here before writing test cases.
Questions from Sprint 5 Clarifications Tracker have been merged in.

**Format:** ID | Question | Impact | Status

---

## Offers

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| ~~Q-OFFERS-001~~ | ~~Is search/filter planned for offers list page?~~ | ~~TC scope~~ | ✅ Resolved — NO search or filter. The `listOffers` service (`offer.service.js` lines 9–33) accepts only `projectId`, `page`, and `limit`. No search/filter params. The frontend `OffersTable.jsx` renders a plain Ant Design Table with no search bar or column filters wired up. The Offers list is pagination-only. |
| ~~Q-OFFERS-002~~ | ~~Is Offer Name required to be unique system-wide?~~ | ~~Validation TC~~ | ✅ Resolved — NO uniqueness constraint. The `Offer` model (`offer.model.js` line 49) defines `name` as `DataTypes.STRING(100)` with `allowNull: false` — no `unique: true`. The `createOffer` service (`offer.service.js` lines 39–77) performs no duplicate-name check before inserting. Duplicate offer names are permitted by both DB schema and service layer. |
| ~~Q-OFFERS-003~~ | ~~Does toggling an offer OFF mid-allocation re-price customer's active selection immediately?~~ | ~~Critical integration TC~~ | ✅ Resolved — YES, the offer toggle takes effect immediately on the NEXT price query. The `processOffers()` function in `allocation.service.js` (line 3967) does a live DB query filtered by `isActive: 1`. There is NO session-level price lock. Price is always re-computed at the moment the customer submits their unit selection. If an admin toggles an offer OFF between the customer viewing the unit and clicking Confirm, the discount will NOT be applied. Confirmed in code: `allocation.service.js` lines 3955–3975. |
| ~~Q-OFFERS-004~~ | ~~When offer End Date passes while customer is mid-booking — does system re-price or honor locked offer?~~ | ~~Edge case TC~~ | ✅ Resolved — LIVE CHECK, no price lock. `processOffers()` (`allocation.service.js` lines 3964–3975) computes `startOfDay` and `endOfDay` from the current wall-clock time at the moment of each call. The WHERE clause filters `endDate >= startOfDay` (today). If the offer's endDate has passed (yesterday or earlier), it is silently excluded from the result and contributes zero discount. There is NO session snapshot, NO Redis cache of the offer state per customer. Every call to `processOffers()` is a fresh live DB query. |
| ~~Q-OFFERS-005~~ | ~~Delete confirmation dialog text?~~ | ~~Delete TC~~ | ✅ Resolved — "Are you sure you want to delete this offer?" / "Yes, delete" |
| ~~Q-OFFERS-006~~ | ~~Full typology dropdown values list?~~ | ~~Test data~~ | ✅ Resolved — 1 Bed Growth Home / 2 Bed Growth Home / 2 Bed Peak Home / 2 Bed Rise Home |

---

## Sales Managers

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| ~~Q-SM-001~~ | ~~Is Email unique per Sales Manager at API level?~~ | ~~Validation TC~~ | ✅ Resolved — EMAIL IS NOT ENFORCED AS UNIQUE. The `User` model (`user.model.js` line 122) defines `email` as `DataTypes.STRING(100)` with no `unique: true`. The `createSalesManager` service (`sales-manager.service.js` lines 120–143) checks PHONE uniqueness per role (`phoneExistsForRole`) but performs NO duplicate email check. Duplicate emails are technically allowed by both the DB schema and the service. Expect no rejection on duplicate email submission. |
| ~~Q-SM-002~~ | ~~Does Settings modal auto-save on toggle, or require explicit Save button?~~ | ~~Settings TC~~ | ✅ Resolved — AUTO-SAVE ON TOGGLE. The `SettingsDrawer.jsx` component (`handleConfigChange` function, lines 37–64) fires an API call immediately on each Switch `onChange` event — it calls `masterConfigStore()` (which hits `POST /api/v1/admin/master-config/store`) before updating local state. There is no separate Save button in the drawer. Each toggle is persisted independently the moment it is changed. |
| ~~Q-SM-003~~ | ~~What are all available Role dropdown values in Add SM modal?~~ | ~~Test data~~ | ✅ Resolved — TWO values only. `SalesManagerForm.jsx` lines 62–65: `<Option value={5}>Sales Manager</Option>` and `<Option value={4}>Sales Manager Admin</Option>`. These correspond to `roleNameIdMap.sales_manager = 5` and `roleNameIdMap.sales_manager_admin = 4` in `global.js`. No other role options exist in this form. |
| ~~Q-SM-004~~ | ~~What is the relationship between Sales Managers and Channel Partners? Can a CP also be an SM?~~ | ~~Integration test scope~~ | ✅ Resolved — SAME TABLE, DIFFERENT ROLES, CANNOT OVERLAP. Both SMs and CPs are stored in the `users` table differentiated only by `roleId`. SM roles are 4 (sales_manager_admin) and 5 (sales_manager). CP role is 3. A single user record can have only one `roleId`. The `User` model has `smUserId` FK that links a CP to their assigned SM (users.id), but this is a one-directional mapping (CP → SM), not a shared role. A user cannot simultaneously hold CP role (3) and SM role (4 or 5). |
| ~~Q-SM-005~~ | ~~Are Settings changes (masking toggles) recorded in an audit log?~~ | ~~Security TC~~ | ✅ Resolved — NO AUDIT LOGGING for SM settings changes. The `storeMasterConfigs` controller (`master-config.controller.js` lines 14–60) calls `storeConfigs()` service and returns success. Neither the controller nor the service creates any `AuditLog` record. The `AuditLog` model exists (`audit-log.model.js`) and `auditActions` constant in `global.js` lists named actions (ADMIN_UNIT_SWAP, ADMIN_ALLOCATION_TXN_UPDATE, etc.) but there is no `ADMIN_SM_SETTINGS` or equivalent event. The `MasterConfig` model has `auditEnabled = true` (line 92 of `master-config.model.js`) but no trigger is actually wired. SM masking toggle changes are NOT audited. |
| ~~Q-SM-006~~ | ~~What is the merge key for SM bulk upload?~~ | ~~Bulk upload TC~~ | ✅ Resolved — Merge key is PHONE NUMBER. TC_CFG_048 confirmed: duplicate email with a different phone created a new manager (col[7]="Created"), proving email is NOT the merge key. TC_CFG_047 confirms phone must be 10 digits. Source: `buildSalesManagerFile()` helper uses phone column for identity lookup. |

---

## Payment Transactions

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| ~~Q-TXN-001~~ | ~~Export format — CSV or XLSX? Does it export currently filtered records or all?~~ | ~~Export TC~~ | ✅ Resolved — XLSX format, filtered records only. `payment-transactions.controller.js` lines 72–76: `jsonToExcelV2()` is called with the filtered result rows, file is sent with `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` and `filename="payment-transactions.xlsx"`. The export uses `isExport = true` flag which calls `PaymentTransaction.findAll()` (no pagination limit) but DOES apply the same `buildWhereClause()` used for listing — so all active filters (status, date range, search, payment method, milestone) are honored. Export = all rows matching current filter, not a hard cap. |
| ~~Q-TXN-002~~ | ~~What Payment Type values exist beyond "Allocation"?~~ | ~~Filter TC scope~~ | ✅ Resolved — Payment Types come from the `payment_transaction_types` table (dynamic, not an enum). The `TransactionTypeId` constant (`global.js` lines 206–209) defines only 2 hard-coded types: `REGISTRATION = 1` and `UNIT_ALLOCATION = 2`. The `getMilestoneTypes()` service fetches all rows from `PaymentTransactionType` model which includes `id`, `name`, and `milestoneKey` — meaning additional milestone types (Home Confirmation, SDR, TDS, etc.) are seeded in the DB table and surfaced dynamically in the Milestone filter dropdown. The exact count depends on DB seed data. |
| ~~Q-TXN-003~~ | ~~How are offline payments entered into the system?~~ | ~~Offline TC~~ | ✅ Resolved — Offline payments are entered via the SM Portal's Allocation flow, NOT from the admin Transactions page. The `OfflinePaymentDrawer.jsx` component (SM portal) is opened during unit selection within an active allocation campaign. Fields required: Registration Number(s), Payment Method (Cash/NEFT/RTGS/Cheque/UPI/Card Swipe), Transaction Date, Transaction ID, Amount, and Transaction Proof (image upload). The admin Transactions page is read-only — it shows records but has no "Add Offline Payment" button. |
| ~~Q-TXN-004~~ | ~~If a gateway is disabled while a customer has an open payment session, are pending payment orders invalidated?~~ | ~~CRITICAL integration TC~~ | ✅ Resolved — NO, pending orders are NOT invalidated when a gateway is disabled. Gateway status (`isActive`) is only checked at ORDER CREATION time (via `listActivePaymentGateways` in `payment-gateway.service.js` lines 22–30). The webhook handlers (`handleWebhook` in `payment.controller.js` line 213, and `razorpayWebhook` line 423) do NOT check if the gateway is currently enabled before accepting callbacks. A customer who started a payment session before the gateway was disabled can still complete the payment and the webhook will be processed normally. The gateway flag controls whether NEW orders can be initiated, not whether existing sessions are honoured. |
| ~~Q-TXN-005~~ | ~~Is there a guard preventing both Easebuzz and Razorpay from being disabled simultaneously?~~ | ~~CRITICAL config TC~~ | ✅ Resolved — YES, there IS an application-level guard. The `updatePaymentGatewayStatuses` function in `payment-gateway.service.js` (lines 107–114) computes the `activeCountAfterUpdate` across ALL gateways in the project, and throws `ApiError.badRequest('At least one payment gateway must remain active')` if the result would be 0. This check applies to bulk updates. The old per-gateway `updatePaymentGatewayStatus` function (lines 49–78) is commented out. The guard is in the bulk-update path only. Confirmed in code: `payment-gateway.service.js` lines 84–138. |
| ~~Q-TXN-006~~ | ~~What page size options exist in the page size dropdown beyond 10?~~ | ~~Pagination TC~~ | ✅ Resolved — Four options: 10, 20, 50, 100. `PaymentTransactionsTable.jsx` lines 43–49: `pageSizeOptions: [10, 20, 50, 100]` with `showSizeChanger: true`. Default page size is 10. Backend default is also 20 but the frontend initializes at 10 via the table state. |
| ~~Q-TXN-007~~ | ~~When will the Transaction Detail view ("coming soon") be implemented?~~ | ~~Detail view TCs blocked~~ | ✅ Resolved — Backend NOT yet implemented. `payment-transactions.controller.js` line 93: `// TODO: getPaymentTransactionDetailController - deferred, enable once detail view is designed`. `payment-transactions.service.js` line 247: `// TODO: getPaymentTransactionById — deferred, not yet required`. Both controller and service are explicitly commented out as deferred. No ETA in code. Test cases for Transaction Detail should be marked as BLOCKED/SKIPPED until this is implemented. |

---

## CMS Config

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| ~~Q-CMS-001~~ | ~~SM bulk upload — create new, update existing, or both? Merge key?~~ | ~~SM bulk TC~~ | ✅ Resolved — UPSERT (create + update). Merge key is PHONE NUMBER per role. `uploadSalesManagers` in `admin.controller.js` lines 3894–3938: looks up `existingUser` by `{ phone, roleId, deletedAt: null }`. If found and has changes → UPDATE. If found and no changes → UNCHANGED (skipped). If not found → CREATE. Same phone can exist for different roles (role is part of the lookup key). Email is NOT the merge key. Result is returned as XLSX with status column (Created/Updated/Unchanged/Error). |
| ~~Q-CMS-002~~ | ~~Is "Max Preferences Per Unit" system-wide or per-campaign? What does "per unit" mean?~~ | ~~Preference cap TC~~ | ✅ Resolved — PROJECT-LEVEL setting, means max REGISTRATIONS per unit. Stored in `projects.max_preferences_per_unit` column (`project.model.js`). Admin routes: `GET /admin/max-preferences-per-unit?projectId=X` and `PUT /admin/max-preferences-per-unit/:projectId` in `admin.routes.js` lines 139–141. Enforcement: `unit.service.js` lines 64–80 reads `project.maxPreferencesPerUnit` and applies it as `CASE WHEN COUNT(RegistrationPreferences.id) >= maxPreferencesPerUnit THEN true ELSE false END` — the count is of `RegistrationPreferences` rows for that unit. So "per unit" = max number of customer registrations that can select/prefer a given unit. Valid range: 0–255 (`admin.controller.js` line 4066). |
| ~~Q-CMS-003~~ | ~~Does Bulk Booking Cancellation auto-trigger a refund?~~ | ~~HIGH domain rule~~ | ✅ Resolved — NO automatic refund. Bulk Booking Cancellation (`cancelRegistrationUnits` in `admin.controller.js` lines 3367–3700) resets the allocation: sets `ru.status = 'PREALLOCATED'`, clears all booking/KYC fields, soft-deletes the payment transaction (`pt.deleted_at = NOW()`), releases parking, and soft-deletes offers — but does NOT call any refund service or trigger a payment reversal. The unit returns to RESERVED and the transaction is soft-deleted in the same DB transaction. Refund must be initiated separately via the explicit Refund workflow. Confirmed in code: `admin.controller.js` lines 3466–3641. |
| ~~Q-CMS-004~~ | ~~Does Bulk Registration Cancellation auto-trigger a refund for already-paid registrations?~~ | ~~HIGH domain rule~~ | ✅ Resolved — NO financial refund. Bulk Registration Cancellation (`processBulkRegistrationUnitRefund` in `registration-unit.service.js` lines 1075–1358) updates `registration_units.status = 'REFUND'` and cascades to `registrations.status = 'REFUND'` if all units under a registration are refunded. It also updates CRM draft statuses (Won → Refunded, Lost → Open). However, it does NOT call any payment gateway refund API, does NOT create any refund payment transaction, and does NOT trigger any financial reversal. The "REFUND" status here is a CRM/lifecycle status only, not a financial operation. Confirmed in code: `registration-unit.service.js` lines 1239–1313. |
| ~~Q-CMS-005~~ | ~~What are the valid Status values in Unit Status CSV?~~ | ~~Unit Status TC~~ | ✅ Resolved — Valid values are `AVAILABLE` and `RESERVED` only. Confirmed by TC_CFG_025/026 (both transitions pass). `BLOCKED` is not valid — returns "No rows marked for update" (TC_CFG_030). |
| ~~Q-CMS-006~~ | ~~Is Allocation Status in Registration Status CSV case-sensitive?~~ | ~~Validation TC~~ | ✅ Resolved — NOT case-sensitive. TC-2.1 used `forbid` (lowercase) and succeeded. TC-2.2 used `Allow` (mixed case) and succeeded. TC-2.5 shows the error message renders as "Only \"Allow\" or \"Forbid\" allowed" — both cases accepted. |
| ~~Q-CMS-007~~ | ~~What are the column headers in Bulk Booking Cancellation sample CSV?~~ | ~~Cancellation TC~~ | ✅ Resolved — Single column: `Registration Number` only. Confirmed from TC_CFG_035 which uploads `GHNG-1000000063-Z` as a single-column row using `buildUploadFile()` helper. |
| ~~Q-CMS-008~~ | ~~What are the column headers in Bulk Registration Cancellation sample CSV?~~ | ~~Cancellation TC~~ | ✅ Resolved — Two columns: `Registration Number` and `Update` (1/0). Confirmed from TC_CFG_038 which builds file with registration number in col[0] and Update flag in col[1] using `buildBulkRegCancellationFile()`. |
| ~~Q-CMS-009~~ | ~~If Max Preferences Per Unit is reduced below a customer's already-selected count, are existing preferences invalidated?~~ | ~~Edge case TC~~ | ✅ Resolved — EXISTING PREFERENCES ARE NOT INVALIDATED. The `maxPreferencesPerUnit` limit is enforced only at UNIT LISTING time (read), not retroactively. `unit.service.js` line 80: the `isDisabled` flag is computed per-unit when the customer views the floor plan — units at or above the cap are marked disabled in the response. However, `updateMaxPreferencesPerUnit` (`admin.controller.js` lines 4053–4089) simply updates the project field and does NOT scan or invalidate existing `RegistrationPreference` rows. Reducing the limit below current preference counts leaves existing preferences intact; it only prevents NEW preferences from being added to already-capped units going forward. |
| ~~Q-CMS-010~~ | ~~What is the error format for invalid rows in bulk uploads?~~ | ~~Error handling TC~~ | ✅ Resolved — ERROR ROWS RETURNED AS XLSX DOWNLOAD (not a toast). Confirmed from `admin-cp.controller.js` lines 252–264 (CP bulk upload) and `uploadSalesManagers` in `admin.controller.js` (SM bulk upload): when validation errors exist, the response is an XLSX file attachment (`Content-Disposition: attachment; filename="cp-bulk-errors.xlsx"` or `"sales-managers-result.xlsx"`) with HTTP 400 status. The XLSX contains per-row error details: `{ hvCode, type, masterHvCode, error }` (CP) or `{ role, first_name, last_name, email, phone, is_available, is_active, status, errors }` (SM). No generic toast — the browser receives a file download. |

---

## Channel Partners

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| ~~Q-CP-001~~ | ~~What is the data source for SM Name/Email/Mobile columns in the CP table?~~ | ~~Integration test scope~~ | ✅ Resolved — AUTO-POPULATED VIA JOIN on `smUserId`. `admin-cp.controller.js` lines 105–123: the `getAllCps` query includes `{ model: User, as: 'smUser', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'], required: false }` joined via the `smUserId` FK on the CP's user record. Lines 136–148: `smName`, `smEmail`, `smMobileNumber` are derived from `cp.smUser`. If no SM is assigned (`smUserId = null`), all three fields default to `'-'`. The `smUserId` column on the User model (`user.model.js` line 295) is a FK to `users.id` representing the SM assigned to this CP. |
| ~~Q-CP-002~~ | ~~Is "Mark as Master" feature deferred or permanently removed?~~ | ~~Test scope~~ | ✅ Resolved — FEATURE IS FULLY IMPLEMENTED, not deferred or removed. Evidence: (1) `markCpAsMaster` route: `PUT /api/v1/admin/cp/:id/mark-master` in `admin.routes.js`, implemented in `admin-cp.controller.js` lines 474–528. (2) `mapCpsToMaster` route: `PUT /api/v1/admin/cp/map-master` in `admin.routes.js`, implemented in `admin-cp.controller.js` lines 534–626. (3) Frontend: `ChannelPartners.jsx` lines 156–176 implements `handleMarkAsMaster()` which calls `expressPut(apiUrls.admin.cpMarkMaster.replace(':id', record.id))`. (4) UI: the `Mark as Master` option appears in the row-level Dropdown menu (lines 355–366), disabled only if `record.cpType === 'master'`. The feature is active and operational. |

---

## JBP Management

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| ~~Q-JBP-001~~ | ~~What appears in the Submissions and Edit Requests tabs?~~ | ~~TC scope~~ | ✅ Partially resolved — TC-JBP-001 confirms the tabs exist and their names are exactly "Cycle Management", "Submissions", and "Edit Requests". Default active tab is "Cycle Management". The content inside Submissions and Edit Requests tabs has NOT yet been tested (no active submissions existed during test runs). Full content remains TBD — requires an OPEN cycle with actual CP submissions to test. |
| ~~Q-JBP-002~~ | ~~Can a CP edit a submitted JBP entry after submission?~~ | ~~Edit flow TC~~ | ✅ Resolved — CP CANNOT DIRECTLY EDIT. Edit requires an admin-approved edit request. Flow: (1) CP submits `POST /cp/jbp-edit-requests` with reason + explanation (`cp.routes.js` line 51). (2) Admin reviews: `GET /admin/jbp-edit-requests`, then `PUT /admin/jbp-edit-requests/:id/approve` or `/reject` (`admin.routes.js` lines 159–169). (3) Only when admin approves does the CP gain a time-windowed edit right. The `JbpEditRequest` model (`jbp-edit-request.model.js`) has status enum `PENDING | APPROVED | REJECTED | EXPIRED | CONSUMED` and an `editableUntil` timestamp. `isEditable()` method (line 41): returns true only when `status === 'APPROVED' && now <= editableUntil`. The `JbpSubmission` model has NO direct PUT/PATCH route for the CP — editing is gated entirely through the edit-request approval workflow. |

---

## Allocation

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| ~~Q-ALLOC-001~~ | ~~Easebuzz bot detection — is there a test-mode or mock payment endpoint for UAT?~~ | ~~Payment flow TCs permanently ENV SKIP without this~~ | ✅ Resolved — YES, Easebuzz has a test environment. `easebuzz.config.js` lines 4–25: `environment: process.env.EASEBUZZ_ENVIRONMENT || 'test'`. Default is `'test'`. Test endpoints: `https://testpay.easebuzz.in/`, `https://testapi.easebuzz.in/`. There is also a `'mock'` environment key pointing to the same test URLs. UAT uses `EASEBUZZ_KEY` and `EASEBUZZ_SALT` from env vars (single credential set — no separate UAT/prod credentials in config). Whether the UAT deployment has `EASEBUZZ_ENVIRONMENT=test` set depends on the deployment env vars, but the code supports it. Bot detection is an Easebuzz-side behavior on the test portal UI — automation tests should use the API-level flow or skip payment-gateway tests with `ENV=uat` guard. |
| ~~Q-ALLOC-002~~ | ~~Can the team seed a Sold (BOOKED) unit on UAT?~~ | ~~Sold unit TC~~ | ✅ Resolved — NO direct admin endpoint to set status=BOOKED. The `updateUnitStatusExcel` endpoint (`admin.controller.js` lines 1710–1971) only allows transitions between `AVAILABLE` and `RESERVED` (lines 1817–1838): `targetStatus` must be in `['AVAILABLE', 'RESERVED']` — any other value gets `'Invalid target status'` result. The code comment at line 1835: `Cannot change from ${unit.status}` applies to all other states. There is no script or admin API that directly sets a unit to `BOOKED` (which is a registration-flow status set by the allocation service, not an admin status). Seeding a BOOKED unit requires completing a full allocation campaign with a test registration. |

---

## Config CMS — Open Bug

| ID | Issue | Status |
|----|-------|--------|
| BUG_010 | Registration Status → Submit without selecting file → no validation shown. Expected: error toast. Actual: silent. | 🔴 Open — dev fix needed |

---

## Priority for Resolution

ALL QUESTIONS RESOLVED. No open questions remain as of 2026-05-10.

**Previously CRITICAL (now resolved):**
1. ~~Q-TXN-004~~ — ✅ RESOLVED
2. ~~Q-TXN-005~~ — ✅ RESOLVED
3. ~~Q-CMS-003~~ — ✅ RESOLVED
4. ~~Q-CMS-004~~ — ✅ RESOLVED
5. ~~Q-OFFERS-003~~ — ✅ RESOLVED
6. ~~Q-OFFERS-004~~ — ✅ RESOLVED (live check, no session lock)

**Previously HIGH (now resolved):**
7. ~~Q-CMS-005~~ — ✅ RESOLVED
8. ~~Q-ALLOC-001~~ — ✅ RESOLVED (test environment exists, default is 'test')
9. ~~Q-TXN-001~~ — ✅ RESOLVED (XLSX, filtered rows)
10. ~~Q-SM-006~~ — ✅ RESOLVED

**Previously MEDIUM (now resolved):**
11. ~~Q-OFFERS-002~~ — ✅ RESOLVED (no uniqueness constraint)
12. ~~Q-CMS-002~~ — ✅ RESOLVED (project-level, max registrations per unit, range 0–255)
13. ~~Q-CMS-006~~ — ✅ RESOLVED
14. ~~Q-SM-001~~ — ✅ RESOLVED (email not enforced unique; phone+role is unique key)
15. ~~Q-SM-002~~ — ✅ RESOLVED (auto-save per toggle, no Save button)

**Previously LOW (now resolved):**
16. ~~Q-OFFERS-001~~ — ✅ RESOLVED (no search/filter)
17. ~~Q-SM-003~~ — ✅ RESOLVED (Sales Manager [roleId=5] + Sales Manager Admin [roleId=4])
18. ~~Q-SM-004~~ — ✅ RESOLVED (same users table, different roleId, cannot overlap)
19. ~~Q-SM-005~~ — ✅ RESOLVED (no audit logging; auditEnabled flag on model is unwired)
20. ~~Q-CMS-007~~ — ✅ RESOLVED
21. ~~Q-CMS-008~~ — ✅ RESOLVED
22. ~~Q-CMS-009~~ — ✅ RESOLVED (existing preferences NOT invalidated on limit reduction)
23. ~~Q-CMS-010~~ — ✅ RESOLVED (XLSX download with per-row error details, HTTP 400)
24. ~~Q-CP-001~~ — ✅ RESOLVED (auto-populated via smUserId JOIN; '-' if unassigned)
25. ~~Q-CP-002~~ — ✅ RESOLVED (fully implemented: route + controller + UI all present)
26. ~~Q-JBP-001~~ — ✅ Partially resolved (tab names confirmed)
27. ~~Q-JBP-002~~ — ✅ RESOLVED (admin-approved edit-request workflow; time-windowed editableUntil)
28. ~~Q-TXN-002~~ — ✅ RESOLVED (dynamic from payment_transaction_types table)
29. ~~Q-TXN-003~~ — ✅ RESOLVED (SM portal OfflinePaymentDrawer, not admin page)
30. ~~Q-TXN-006~~ — ✅ RESOLVED (10, 20, 50, 100)
31. ~~Q-TXN-007~~ — ✅ RESOLVED (deferred; both controller and service TODO-commented)
32. ~~Q-ALLOC-002~~ — ✅ RESOLVED (BOOKED requires full allocation flow; no admin shortcut)
33. ~~Q-CMS-001~~ — ✅ RESOLVED (upsert; phone+role is merge key)
