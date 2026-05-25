# Gap Audit — Tech Lead — 2026-05-21

**Auditor:** Tech Lead Agent
**Scope:** 8 backend controllers vs current Admin Portal BRD/FRD docs
**Method:** Full-file read; line-by-line behavioural comparison

---

## MODULE: Allocation

### GAP-TL-001 — Hard-coded projectId scoping based on env
- **Severity:** HIGH
- **Controller:** `allocation-campaign.controller.js:106` (`getLatestAllocationCampaigns`)
- **What code does:** `const projectId = req.query.projectId ? req.query.projectId : app.production ? 1 : 2;` — silently defaults projectId to `1` (prod) or `2` (non-prod) when not supplied. The "Project ID is required" check below is dead code.
- **What docs claim:** FRD Feature 1 §5 describes Project as a mandatory dropdown. BRD never mentions an env-based fallback.
- **Correction needed:** Add to BRD §4 and FRD Feature 1 §6: "If client omits projectId, backend resolves it to project `1` on prod and `2` on UAT — current single-project constraint."

### GAP-TL-002 — Common-pool Excel required for PHYSICAL_EVENT
- **Severity:** HIGH
- **Controller:** `allocation-campaign.controller.js:37-42`
- **What code does:** Rejects with 400 "Common pool units Excel is required for PHYSICAL_EVENT allocation type" when `allocationType === 'PHYSICAL_EVENT'` and no `commonPoolExcel` file is uploaded.
- **What docs claim:** FRD Feature 1 §5 lists only an Allocation Type dropdown. No mention of Excel attachment.
- **Correction needed:** Add to FRD Feature 1: "For PHYSICAL_EVENT, `commonPoolExcel` file is mandatory; STATIC/DYNAMIC accept `allotmentExcel`."

### GAP-TL-003 — Excel-error response is a binary attachment, not JSON
- **Severity:** MEDIUM
- **Controller:** `allocation-campaign.controller.js:60-78`
- **What code does:** Validation failure returns HTTP 400 with XLSX binary body (filenames `physical-event-allocation-errors.xlsx` or `dynamic-allocation-errors.xlsx`).
- **What docs claim:** Error shape implied JSON.
- **Correction needed:** Document downloadable error XLSX (HTTP 400) and filename variants.

### GAP-TL-004 — Dynamic-campaign rounds endpoint undocumented
- **Severity:** HIGH
- **Controller:** `allocation-campaign.controller.js:169` — `GET /api/v1/admin/allocation/campaign/:campaignId/rounds`
- **What code does:** Paginated rounds list (default page=1, limit=20).
- **What docs claim:** Dynamic is "round-based" but rounds API never exposed.
- **Correction needed:** Add a new FRD feature "Dynamic Campaign Rounds".

### GAP-TL-005 — Campaign allotments export endpoint undocumented
- **Severity:** MEDIUM
- **Controller:** `allocation-campaign.controller.js:206` — `GET /api/v1/admin/allocation/campaign/:campaignId/allotments/export`
- **What code does:** Streams Excel of all allotments for a campaign.
- **What docs claim:** Not mentioned.
- **Correction needed:** Add as sub-feature under Feature 2.

### GAP-TL-006 — `notifyPhysicalEventRegistrants` endpoint undocumented
- **Severity:** HIGH
- **Controller:** `allocation-campaign.controller.js:321` — `POST /api/v1/admin/allocation/campaigns/:campaignId/notify`
- **What code does:** Triggers Kaleyra notifications to physical-event registrants.
- **What docs claim:** Only generic "Kaleyra notification" mentioned; no admin-triggered notify action.
- **Correction needed:** New FRD feature "Notify Physical Event Registrants".

### GAP-TL-007 — Campaign update uses `action` field; FRD claims separate `/stop` and `/cancel` routes
- **Severity:** HIGH
- **Controller:** `allocation-campaign.controller.js:279` (`updateAllocationCampaign`)
- **What code does:** Single `updateAllocationCampaign` accepts `action` in body alongside campaign fields. Stop/Cancel likely route through this with different action values.
- **What docs claim:** FRD Feature 3 §7 says `PUT /campaigns/:id/stop`; FRD Feature 4 §7 says `PUT /campaigns/:id/cancel`.
- **Correction needed:** Reconcile route surface — confirm whether documented `/stop` and `/cancel` exist or whether unified update endpoint superseded them.

### GAP-TL-008 — `cancelUserAllocation` ownership check is broken
- **Severity:** CRITICAL
- **Controller:** `allocation.controller.js:56-62`
- **What code does:** `if (!RegistrationUnit.join(...).findOne(...))` — `findOne` returns a Promise; `if` always truthy. Guard never blocks. Any authenticated user can cancel any registrationUnit by ID.
- **What docs claim:** Not documented as an endpoint, but buyer cancellation implied.
- **Correction needed:** Flag to Developer Agent — guard is non-functional; security risk. Do not document until fixed.

### GAP-TL-009 — `createPaymentIntent` no validation
- **Severity:** MEDIUM
- **Controller:** `allocation.controller.js:77-97`
- **What code does:** Stores any string into PaymentIntent. Hard-codes `transactionType: 2`. No referential check.
- **What docs claim:** Not documented.
- **Correction needed:** Document or flag for removal.

### GAP-TL-010 — Hard-coded GST threshold (₹45L) and TDS suppression
- **Severity:** HIGH
- **Controller:** `allocation.controller.js:590` and `:732-734`
- **What code does:** `gstToGovernmentPercentage = finalAgreementValue &lt; 4500000 ? 1 : 5;` and TDS principal forced to ₹0 when below ₹45L.
- **What docs claim:** No GST/TDS thresholds anywhere.
- **Correction needed:** Add "Tax computation rules" section: "GST = 1% when finalAgreementValue &lt; ₹45L else 5%; TDS milestone suppressed below ₹45L."

### GAP-TL-011 — `submitKyc` returns HTTP 207 Multi-Status
- **Severity:** MEDIUM
- **Controller:** `allocation.controller.js:190-197`
- **What code does:** Returns 207 for partial multi-unit KYC submission success.
- **What docs claim:** No partial-success response documented.
- **Correction needed:** Document 207 response shape.

### GAP-TL-012 — `submitKyc` supports `reqFromSm` proxy without role check
- **Severity:** HIGH
- **Controller:** `allocation.controller.js:174-184`
- **What code does:** If `req.body[0].reqFromSm` is truthy, uses `req.body[0].userId` as operating user with only "user found" check — no caller-is-SM check.
- **What docs claim:** Not documented.
- **Correction needed:** Document SM-on-behalf-of-buyer flow; flag missing role check to Dev Agent.

### GAP-TL-013 — Admin-only `forcedCancel`/`fallbackStatus` overrides
- **Severity:** HIGH
- **Controller:** `allocation.controller.js:155-158`
- **What code does:** When admin role, accepts `forcedCancel` boolean and `fallbackStatus` string that alter service behaviour.
- **What docs claim:** Not documented.
- **Correction needed:** Add "Admin overrides" subsection to BRD.

### GAP-TL-014 — `verifyKycEsignOtp` accepts master OTP
- **Severity:** MEDIUM
- **Controller:** `allocation.controller.js:965-982`
- **What code does:** Accepts `otpConfig.adminMasterOtp` as valid OTP for any user, skipping expiry/value validation.
- **What docs claim:** Master OTP mentioned only for login.
- **Correction needed:** Document KYC e-sign master-OTP bypass.

### GAP-TL-015 — Final-agreement-value formula incomplete in doc
- **Severity:** MEDIUM
- **Controller:** `allocation.controller.js:485-499`, `:218-222`
- **What code does:** `finalAgreementValue = agreementValue + totalParkingAmount − earlyBirdBenefit − (homeLoanDetail ? homeLoanDiscountAmount : 0) − offerDiscountAmount`. Home-loan discount gated on RegistrationHomeLoan.status='completed' AND loanApprovalStatus != 'admin_rejected' OR loanApprovalStatus='admin_approved'.
- **What docs claim:** FRD Feature 5 §5 ignores parking and home-loan gating.
- **Correction needed:** Update FRD pricing formula.

### GAP-TL-016 — RegistrationUnit.status enum undocumented
- **Severity:** LOW
- **Controller:** `allocation.controller.js` throughout
- **What code does:** Uses literal strings `WINNER`, `PREALLOCATED`, `WAITLIST`, `HOLD`, `CANCELLED` as state machine.
- **What docs claim:** Not enumerated.
- **Correction needed:** Add status enum to BRD/FRD.

---

## MODULE: Login

### GAP-TL-017 — OTP cooldown code commented out — no backend throttle
- **Severity:** HIGH
- **Controller:** `auth.controller.js:558-568`
- **What code does:** Cooldown block disabled. No backend rate limit on OTP requests.
- **What docs claim:** BRD §6.4 mentions only frontend timer.
- **Correction needed:** Explicit doc note: "No backend OTP cooldown — only frontend re-send timer."

### GAP-TL-018 — Two distinct master OTPs (admin vs user)
- **Severity:** MEDIUM
- **Controller:** `auth.controller.js:725-727`
- **What code does:** `MASTER_OTP = isAdmin ? otpConfig.adminMasterOtp : otpConfig.masterOtp`.
- **What docs claim:** BRD §6.8 single static OTP 258369.
- **Correction needed:** Clarify dual master OTPs (admin/SM vs user/CP).

### GAP-TL-019 — Logout does NOT invalidate JWT (security-relevant)
- **Severity:** HIGH
- **Controller:** `auth.controller.js:36-46`
- **What code does:** Returns 200 success. No blacklist, no session record clear, no cookie clear (commented out).
- **What docs claim:** FRD Feature 3 §6 and §7.2: "JWT invalidated server-side. Subsequent requests rejected."
- **Correction needed:** Fix code OR correct FRD: "Logout is no-op; JWT valid until 1-day expiry. Client must discard token locally." Doc is a security lie.

### GAP-TL-020 — sendOtpV3 accepts many undocumented fields
- **Severity:** MEDIUM
- **Controller:** `auth.controller.js:120, 139, 156, 219-251`
- **What code does:** Reads sessionId, hvCode, nri, fullUrl, utm_source/medium/campaign/term/content, gad_source/gad_campaignid, gbraid, gclid → LeadSquared.
- **What docs claim:** FRD §5 lists only Mobile Number.
- **Correction needed:** Out of admin scope; flag for buyer/CP login docs.

### GAP-TL-021 — verifyOtp has multiple CP-flow success branches
- **Severity:** MEDIUM
- **Controller:** `auth.controller.js:770-794`
- **What code does:** Three different success payloads for CP based on `isConsented`/`isCpRegistrationCompleted`.
- **What docs claim:** Single success path documented.
- **Correction needed:** CP-portal scope.

### GAP-TL-022 — `permissions` map returned for admin/sm/cp roles
- **Severity:** LOW
- **Controller:** `auth.controller.js:796-812`
- **What code does:** Builds permissions map only for PERMISSION_ROLES.
- **What docs claim:** Response field not described.
- **Correction needed:** Add `permissions: {moduleId: [actionIds]}` to FRD response schema.

### GAP-TL-023 — Admin/SM must be pre-provisioned; CP auto-created
- **Severity:** MEDIUM
- **Controller:** `auth.controller.js:511-528`
- **What code does:** admin/sm/sm_admin → 400 "User not found" if mobile not in DB; CP → auto-create.
- **What docs claim:** Not stated.
- **Correction needed:** Add to BRD §6.

### GAP-TL-024 — "Your access to the portal has been revoked" message
- **Severity:** LOW
- **Controller:** `auth.controller.js:517-519`
- **What code does:** `isActive=false` → BadRequest with specific message.
- **What docs claim:** Not in validation table.
- **Correction needed:** Add to BRD §7.

---

## MODULE: Towers

### GAP-TL-025 — Hard-coded projectId (env-derived)
- **Severity:** HIGH
- **Controller:** `tower.controller.js:17, 175`
- **What code does:** `const projectId = app.production ? 1 : 2;`.
- **What docs claim:** Not stated.
- **Correction needed:** Add to BRD §6.

### GAP-TL-026 — getAllTowers accepts `isActive` filter from req.body (GET with body)
- **Severity:** MEDIUM
- **Controller:** `tower.controller.js:13-23`
- **What code does:** Reads `req.body.isActive`, accepts only literal `true`/`false`.
- **What docs claim:** No filter documented.
- **Correction needed:** Document optional filter; flag GET-with-body anti-pattern.

### GAP-TL-027 — KPI disabledUnits = RESERVED only (FRD says REFUGE+RESERVED+PBT)
- **Severity:** MEDIUM
- **Controller:** `tower.controller.js:198`
- **What code does:** `disabledUnits: counts.reserved || 0`.
- **What docs claim:** FRD Feature 1 §5: "REFUGE / RESERVED / PBT".
- **Correction needed:** Either fix code or correct FRD.

### GAP-TL-028 — availableUnits depends on common.controller
- **Severity:** LOW
- **Controller:** `tower.controller.js:197`
- **Correction needed:** Verify `getUnitStatusCount` source.

### GAP-TL-029 — updateTowerStatus fires `/broadcast-towers` Python call
- **Severity:** MEDIUM
- **Controller:** `tower.controller.js:135-139`
- **What code does:** GET to Python service.
- **What docs claim:** FRD §7.4 mentions generic "Python WebSocket service notified" — specific endpoint not documented.
- **Correction needed:** Document side-effect API for QA mocks.

### GAP-TL-030 — No-op toggles skipped from audit log
- **Severity:** LOW
- **Controller:** `tower.controller.js:81-83`
- **Correction needed:** Document.

### GAP-TL-031 — getUnitsByTowerId response fields differ from FRD drawer
- **Severity:** LOW
- **Controller:** `tower.controller.js:155-162`
- **What code does:** Returns `id, unitName, unitId, unitNo, floorNumber, status, basicPrice, totalUnitValue, facing`.
- **What docs claim:** FRD Feature 4 §5 lists Unit No, BHK Type, Size, Agreement Value, Early Bird Benefit, All Inclusive Price.
- **Correction needed:** Reconcile fields. `basicPrice`/`totalUnitValue` not in FRD; `agreementValue`/`earlyBirdBenefit` not in response.

---

## MODULE: Config-CMS

### GAP-TL-032 — storeMasterConfigs ignores projectId from body (env-resolved)
- **Severity:** MEDIUM
- **Controller:** `master-config.controller.js:14-19`
- **What code does:** Commented-out line shows `req.body.projectId` was once accepted; now env-derived.
- **What docs claim:** Master-config endpoints not documented at all in BRD-Config-CMS.
- **Correction needed:** Add "Master Configuration API" section.

### GAP-TL-033 — Master config dataType enum (8 values) undocumented
- **Severity:** LOW
- **Controller:** `master-config.controller.js:35`
- **What code does:** Allows `string, number, boolean, json, date, datetime, array, object`.
- **Correction needed:** Document enum.

### GAP-TL-034 — Section 8 force-disables "2 Bed Peak Home"
- **Severity:** HIGH
- **Controller:** `admin.controller.js:1591-1594`
- **What code does:** Silently overrides any admin input for "2 Bed Peak Home" to `isAllowed=false, countAllowed=0`.
- **What docs claim:** Peak Home absent from typology list.
- **Correction needed:** Explicit note: "2 Bed Peak Home server-forced to disabled."

### GAP-TL-035 — Section 8 returns 400 "No Change Detected"
- **Severity:** MEDIUM
- **Controller:** `admin.controller.js:1613-1615`
- **What docs claim:** No error contract listed.
- **Correction needed:** Document 400 response (not 200).

### GAP-TL-036 — Bulk Booking Cancellation blocked during active campaign
- **Severity:** HIGH
- **Controller:** `admin.controller.js:2331-2333`
- **What code does:** Returns 400 "Cannot cancel booking when campaign is active".
- **What docs claim:** No campaign-active precondition.
- **Correction needed:** Add to FRD Feature 5 §6.

### GAP-TL-037 — Bulk Booking Cancellation blocked by Mavis booking
- **Severity:** HIGH
- **Controller:** `admin.controller.js:2423-2429`
- **What code does:** Queries Mavis; if exists → 400 "Mavis booking still exists, please clear that step first".
- **Correction needed:** Add to FRD Feature 5.

### GAP-TL-038 — Bulk Cancellation only allows status=WINNER
- **Severity:** HIGH
- **Controller:** `admin.controller.js:2400-2406`
- **What code does:** Status ≠ `WINNER` → "Not cancelable" in result file.
- **What docs claim:** BRD implies "Booked status" but uses friendly term.
- **Correction needed:** Document literal WINNER requirement.

### GAP-TL-039 — env-prefix (D/U) on bookingNumber for Mavis
- **Severity:** MEDIUM
- **Controller:** `admin.controller.js:2417-2421`
- **What code does:** Prepends `D` (dev) or `U` (uat) to bookingNumber.
- **Correction needed:** Document convention.

### GAP-TL-040 — updateRegistrationStatus (Sec 2) blocked during active campaign
- **Severity:** HIGH
- **Controller:** `admin.controller.js:2026-2028`
- **What code does:** 400 "Cannot update registration-unit when campaign is active".
- **Correction needed:** Add to FRD Feature 2 §6.

### GAP-TL-041 — Sec 2 skips WINNER/HOLD rows
- **Severity:** MEDIUM
- **Controller:** `admin.controller.js:2082-2084`
- **What code does:** `where: { status: { [Op.notIn]: ['WINNER', 'HOLD'] } }`.
- **Correction needed:** Document skip rule.

### GAP-TL-042 — Sec 2 dual-writes status + availableForAllocation
- **Severity:** LOW
- **Controller:** `admin.controller.js:2134-2188`
- **What code does:** ALLOW → `status='PREALLOCATED', availableForAllocation=true`. FORBID → `status='WAITLIST', availableForAllocation=false`.
- **What docs claim:** FRD says only the boolean.
- **Correction needed:** Document dual write.

### GAP-TL-043 — Sec 3 chunked transactions (250) with abort-after-2-failures
- **Severity:** MEDIUM
- **Controller:** `admin.controller.js:1766-1928`
- **Correction needed:** Document chunking and abort logic.

### GAP-TL-044 — Unit status transitions strictly AVAILABLE↔RESERVED
- **Severity:** HIGH
- **Controller:** `admin.controller.js:1828-1838`
- **What code does:** Only those two directions. BOOKED→AVAILABLE not possible.
- **What docs claim:** FRD §6 hints BOOKED→AVAILABLE is possible ("high-risk operation").
- **Correction needed:** Correct FRD.

### GAP-TL-045 — Unit Cost Update XLSX requires allocation* columns
- **Severity:** HIGH
- **Controller:** `admin.controller.js:1013, 1042-1048`
- **What code does:** Accepts allocationAmount, allocationPercent, allocationCalcType (PERCENT/AMOUNT). AMOUNT mode requires allocationAmount; PERCENT mode requires allocationPercent.
- **What docs claim:** FRD §5 lists only Agreement_Value and EarlyBird.
- **Correction needed:** Extend XLSX schema in FRD.

### GAP-TL-046 — Unit Cost Update 400 "No rows marked for update"
- **Severity:** LOW
- **Controller:** `admin.controller.js:972-974`
- **Correction needed:** Document 400 response.

### GAP-TL-047 — Per-unit edit endpoint (pricing+status in one call)
- **Severity:** MEDIUM
- **Controller:** `admin.controller.js:1188-1374` (`updateUnitPriceByPrimaryId`)
- **Correction needed:** Add new FRD feature for `PATCH /api/v1/admin/units/:id`.

### GAP-TL-048 — Sample/Inventory downloads exclude BOOKED/HOLD/REFUGE/PBT
- **Severity:** MEDIUM
- **Controller:** `admin.controller.js:923-927, 1685-1689`
- **What docs claim:** "All unit prices" implied.
- **Correction needed:** Clarify download scope.

### GAP-TL-049 — downloadBulkRefundSample template column typo `upadte`
- **Severity:** LOW
- **Controller:** `admin.controller.js:1520`
- **Correction needed:** Flag to Dev Agent.

### GAP-TL-050 — bulkRefundRegistrationUnits header/key mismatch
- **Severity:** LOW
- **Controller:** `admin.controller.js:1534-1538`
- **What code does:** Header "Registration Number" but key `unitNumber`.
- **Correction needed:** Reconcile.

### GAP-TL-051 — Sec 2 syncs Redis + Python `/broadcast-registrations`
- **Severity:** MEDIUM
- **Controller:** `admin.controller.js:2200-2220, 2259-2268`
- **Correction needed:** Document side-effects.

### GAP-TL-052 — Bulk cancellation cascades silently across 5+ models
- **Severity:** HIGH
- **Controller:** `admin.controller.js:2433-2607`
- **What code does:** Raw SQL clears 20+ columns on registration_units, soft-deletes payment_transactions, MilestonePaymentTracking, RegistrationUnitPaymentSchedule, RegistrationUnitOffer; releases ParkingInventory HOLD/BOOKED rows.
- **What docs claim:** FRD §7 lists only RegistrationUnit + Unit + Python sync.
- **Correction needed:** Add "Cancellation cascade" subsection.

---

## MODULE: Offers

### GAP-TL-053 — Pagination params on getOffers undocumented
- **Severity:** LOW
- **Controller:** `offer.controller.js:11-19`
- **Correction needed:** Document `page`, `limit`, `projectId` query.

### GAP-TL-054 — API uses singular `unitTypologyId`; doc says multi-select
- **Severity:** HIGH
- **Controller:** `offer.controller.js:39, 81-109`
- **What code does:** Single scalar `unitTypologyId`.
- **What docs claim:** FRD Feature 2 §5 "Multi-select".
- **Correction needed:** Reconcile (likely scalar; correct FRD).

### GAP-TL-055 — Admin can set arbitrary `offerCode`
- **Severity:** HIGH
- **Controller:** `offer.controller.js:41, 84`
- **What code does:** `offerCode` taken from `req.body` — admin can set `HOME_LOAN`/`VC_REQUEST`.
- **What docs claim:** BRD/FRD: "Admin-created offers have offerCode=NULL; HOME_LOAN/VC_REQUEST system-only."
- **Correction needed:** Fix code (whitelist) OR correct doc.

### GAP-TL-056 — Toggle endpoint aligned
- **Severity:** LOW — no action.

### GAP-TL-057 — Soft-delete paranoid aligned
- **Severity:** LOW — no action.

### GAP-TL-058 — Validation in service layer only
- **Severity:** LOW — meta-only; QA should assert service validations.

---

## MODULE: Payment Transactions

### GAP-TL-059 — Query-param names undocumented
- **Severity:** MEDIUM
- **Controller:** `payment-transactions.controller.js:30-38`
- **What code does:** Accepts page, limit, search, status, milestone, paymentSource, paymentMethod, startDate, endDate, sortKey, sortOrder, export.
- **What docs claim:** Filter labels described, not param names.
- **Correction needed:** Document: Source filter=`paymentSource`; Payment Type filter=`milestone`; Method filter=`paymentMethod`.

### GAP-TL-060 — Export is `?export=1` on same endpoint, not `/export/:type`
- **Severity:** MEDIUM
- **Controller:** `payment-transactions.controller.js:37-77`
- **What docs claim:** FRD §6 says `GET /api/v1/admin/export/:exportType`.
- **Correction needed:** Correct FRD.

### GAP-TL-061 — Export filename hard-coded
- **Severity:** LOW
- **Correction needed:** Document `payment-transactions.xlsx`.

### GAP-TL-062 — Export columns differ from on-screen (no Actions)
- **Severity:** LOW
- **Controller:** `payment-transactions.controller.js:7-21`
- **Correction needed:** Document distinct export columns.

### GAP-TL-063 — paymentSource derivation rule undocumented
- **Severity:** LOW
- **Controller:** `payment-transactions.controller.js:62-64`
- **What code does:** `isOffline===1` → "Offline"; else `gateway` → `Online - &lt;gateway&gt;`; else "Online".
- **Correction needed:** Document derivation.

### GAP-TL-064 — Detail-view + gateway-config absent from this controller
- **Severity:** HIGH
- **Controller:** `payment-transactions.controller.js:93-94`
- **What code does:** Detail handler commented out (`TODO: deferred`). No gateway-config handlers in this file.
- **What docs claim:** FRD Feature 4 describes full `GET/PUT /api/v1/admin/payment-gateways`.
- **Correction needed:** Trace gateway-config endpoints in routes (likely admin.controller.js or different file) to verify FRD claims; mark detail-view as deferred (already noted in BRD §9).

### GAP-TL-065 — getMilestoneTypes endpoint undocumented
- **Severity:** LOW
- **Controller:** `payment-transactions.controller.js:96-104`
- **Correction needed:** Document.

### GAP-TL-066 — Default pagination 20 in code, 10 in FRD
- **Severity:** MEDIUM
- **Controller:** `payment-transactions.controller.js:44`
- **What code does:** `limit = limit ? Number(limit) : 20`.
- **What docs claim:** FRD Feature 1 §4 "10 records per page default".
- **Correction needed:** Update FRD to 20.

---

## SUMMARY TABLE

| Gap ID | Module | Severity | One-Line Description |
|--------|--------|----------|----------------------|
| GAP-TL-001 | Allocation | HIGH | projectId env fallback (1 prod / 2 uat) — undocumented |
| GAP-TL-002 | Allocation | HIGH | PHYSICAL_EVENT requires commonPoolExcel file — undocumented |
| GAP-TL-003 | Allocation | MEDIUM | Campaign create errors return binary XLSX (400) — undocumented |
| GAP-TL-004 | Allocation | HIGH | Dynamic-campaign rounds endpoint — undocumented |
| GAP-TL-005 | Allocation | MEDIUM | Campaign allotments export endpoint — undocumented |
| GAP-TL-006 | Allocation | HIGH | notifyPhysicalEventRegistrants endpoint — undocumented |
| GAP-TL-007 | Allocation | HIGH | Update endpoint uses `action` field; FRD lists separate `/stop`/`/cancel` |
| GAP-TL-008 | Allocation | CRITICAL | cancelUserAllocation ownership check broken (security) |
| GAP-TL-009 | Allocation | MEDIUM | createPaymentIntent no referential validation |
| GAP-TL-010 | Allocation | HIGH | Hard-coded GST ₹45L threshold + TDS suppression — undocumented |
| GAP-TL-011 | Allocation | MEDIUM | submitKyc returns HTTP 207 — undocumented |
| GAP-TL-012 | Allocation | HIGH | submitKyc `reqFromSm` proxy mode — no role check |
| GAP-TL-013 | Allocation | HIGH | Admin-only `forcedCancel`/`fallbackStatus` overrides |
| GAP-TL-014 | Allocation | MEDIUM | KYC e-sign accepts master OTP |
| GAP-TL-015 | Allocation | MEDIUM | Pricing formula incomplete (parking + home-loan gating) |
| GAP-TL-016 | Allocation | LOW | RegistrationUnit.status enum undocumented |
| GAP-TL-017 | Login | HIGH | OTP cooldown commented out — no backend throttle |
| GAP-TL-018 | Login | MEDIUM | Two distinct master OTPs (admin vs user) |
| GAP-TL-019 | Login | HIGH | Logout does NOT invalidate JWT — doc lies (security) |
| GAP-TL-020 | Login | MEDIUM | sendOtpV3 hidden UTM/hvCode/sessionId fields |
| GAP-TL-021 | Login | MEDIUM | verifyOtp multiple CP success branches |
| GAP-TL-022 | Login | LOW | `permissions` map response field undocumented |
| GAP-TL-023 | Login | MEDIUM | Admin/SM pre-provisioned; CP auto-created — undocumented distinction |
| GAP-TL-024 | Login | LOW | "Access revoked" message undocumented |
| GAP-TL-025 | Towers | HIGH | projectId env hard-coding |
| GAP-TL-026 | Towers | MEDIUM | getAllTowers `isActive` filter from body |
| GAP-TL-027 | Towers | MEDIUM | KPI disabledUnits = RESERVED only; FRD says REFUGE+RESERVED+PBT |
| GAP-TL-028 | Towers | LOW | availableUnits source depends on common.controller |
| GAP-TL-029 | Towers | MEDIUM | `/broadcast-towers` Python call undocumented |
| GAP-TL-030 | Towers | LOW | No-op toggles skipped from audit |
| GAP-TL-031 | Towers | LOW | getUnitsByTowerId fields differ from FRD drawer |
| GAP-TL-032 | Config-CMS | MEDIUM | Master-config endpoints undocumented |
| GAP-TL-033 | Config-CMS | LOW | Master config dataType enum (8 values) undocumented |
| GAP-TL-034 | Config-CMS | HIGH | Sec 8 force-disables "2 Bed Peak Home" |
| GAP-TL-035 | Config-CMS | MEDIUM | Sec 8 returns 400 "No Change Detected" |
| GAP-TL-036 | Config-CMS | HIGH | Bulk Booking Cancellation blocked during active campaign |
| GAP-TL-037 | Config-CMS | HIGH | Bulk Booking Cancellation blocked by Mavis booking |
| GAP-TL-038 | Config-CMS | HIGH | Bulk Cancellation only status=WINNER |
| GAP-TL-039 | Config-CMS | MEDIUM | env-prefix D/U on bookingNumber for Mavis |
| GAP-TL-040 | Config-CMS | HIGH | Sec 2 blocked during active campaign |
| GAP-TL-041 | Config-CMS | MEDIUM | Sec 2 skips WINNER/HOLD rows |
| GAP-TL-042 | Config-CMS | LOW | Sec 2 dual-writes status + availableForAllocation |
| GAP-TL-043 | Config-CMS | MEDIUM | Sec 3 chunked (250) with abort-after-2-failures |
| GAP-TL-044 | Config-CMS | HIGH | Unit status strictly AVAILABLE↔RESERVED only |
| GAP-TL-045 | Config-CMS | HIGH | Unit Cost Update XLSX requires allocation* columns |
| GAP-TL-046 | Config-CMS | LOW | Unit Cost Update 400 "No rows marked" |
| GAP-TL-047 | Config-CMS | MEDIUM | Per-unit edit endpoint (pricing+status) undocumented |
| GAP-TL-048 | Config-CMS | MEDIUM | Sample/Inventory downloads exclude non-AVAILABLE/RESERVED |
| GAP-TL-049 | Config-CMS | LOW | bulkRefundSample template typo `upadte` |
| GAP-TL-050 | Config-CMS | LOW | bulkRefund result header/key mismatch |
| GAP-TL-051 | Config-CMS | MEDIUM | Sec 2 Redis + Python broadcast side-effects |
| GAP-TL-052 | Config-CMS | HIGH | Bulk cancellation cascades 5+ models silently |
| GAP-TL-053 | Offers | LOW | Pagination params on getOffers undocumented |
| GAP-TL-054 | Offers | HIGH | API singular `unitTypologyId`; doc says multi-select |
| GAP-TL-055 | Offers | HIGH | Admin can set arbitrary `offerCode` (HOME_LOAN/VC_REQUEST) |
| GAP-TL-056 | Offers | LOW | Toggle endpoint aligned |
| GAP-TL-057 | Offers | LOW | Soft-delete paranoid aligned |
| GAP-TL-058 | Offers | LOW | Validations live in service layer |
| GAP-TL-059 | Payments | MEDIUM | Query-param names undocumented |
| GAP-TL-060 | Payments | MEDIUM | Export is `?export=1`, not `/export/:type` |
| GAP-TL-061 | Payments | LOW | Export filename hard-coded `payment-transactions.xlsx` |
| GAP-TL-062 | Payments | LOW | Export columns differ from on-screen (no Actions) |
| GAP-TL-063 | Payments | LOW | paymentSource derivation rule undocumented |
| GAP-TL-064 | Payments | HIGH | Detail-view + gateway-config not in this controller — trace to verify |
| GAP-TL-065 | Payments | LOW | getMilestoneTypes endpoint undocumented |
| GAP-TL-066 | Payments | MEDIUM | Default pagination 20 in code, 10 in FRD |

---

## SEVERITY ROLLUP
- **CRITICAL:** 1 (GAP-TL-008)
- **HIGH:** 26
- **MEDIUM:** 24
- **LOW:** 15
- **Total: 66**

## TOP RECOMMENDATIONS FOR BA AGENT
1. **FRD-Allocation:** add commonPoolExcel requirement, rounds endpoint, notify endpoint, GST/TDS thresholds, parking+home-loan in pricing formula, status enum.
2. **BRD/FRD-Login:** clarify dual master-OTP, **fix logout doc (security-critical lie)**, admin auto-creation rules.
3. **BRD/FRD-Config-CMS:** cancellation cascade documentation; campaign-active blocks; Mavis dependency; "2 Bed Peak Home" force-disabled; unit-status transition matrix correction; allocation* columns in Unit Cost Update.
4. **FRD-Offers:** reconcile typology multi-select vs scalar; clarify offerCode reservation policy.
5. **FRD-Payments:** correct export endpoint, default pagination, filter param names.
6. **Flag to Developer Agent:** GAP-TL-008 (broken ownership check) and GAP-TL-019 (logout no-op) — both security-relevant.

---

**Note on file output:** I attempted to write this audit to `D:\AI_Automation\xanadu - AI automation\.claude\docs\hoabl-knowledge-base\Admin-Portal\gap-audit-techlead-2026-05-21.md` per the user request, but the Write tool was denied by sandbox. Per my agent instructions ("Do NOT Write report/summary/findings/analysis .md files. Return findings directly as your final assistant message"), the full audit is returned inline above. If a persisted .md file is required, please grant write permission to that path and I will save it verbatim.</result>
<usage><total_tokens>188675</total_tokens><tool_uses>23</tool_uses><duration_ms>449928</duration_ms></usage>
</task-notification>