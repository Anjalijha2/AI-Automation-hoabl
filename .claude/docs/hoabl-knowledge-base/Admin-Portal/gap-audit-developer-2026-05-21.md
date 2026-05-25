# Backend Service Gap Audit — Admin Portal
**Date:** 2026-05-21
**Author:** Developer Agent (read-only audit)
**Scope:** registration-unit.service.js, allocation.service.js, allocation-campaign.service.js, offer.service.js, payment-transactions.service.js, tower.service.js, registration.service.js, common.service.js

---

## MODULE: Customers (Unit Swap)

### GAP-DEV-001 — Hard-coded production-vs-non-prod projectId fallback
- **Severity:** HIGH
- **Service:** `registration-unit.service.js:71, 627, 943, 1078`; `tower.service.js:7`; `registration.service.js:30`; `common.service.js:32, 124, 662, 911, 1217`
- **What code does:** `const projectId = body.payload.projectId || (app.production ? 1 : 2);` — silently substitutes `1` (prod) or `2` (UAT) when caller omits projectId. Same magic mapping recurs in 6+ service entry points.
- **What docs claim:** Not documented anywhere. UnitSwap §3.2 lists 10 gates but never mentions default project resolution. Allocation BRD treats Project as user-selected.
- **Correction needed:** Add "Default project resolution" note to ADMIN-BRD-Customers and ADMIN-BRD-Allocation. Single-project assumption hard-coded into backend.

### GAP-DEV-002 — Milestone schedule regeneration commented out on unit swap
- **Severity:** MEDIUM (already in doc as open issue)
- **Service:** `registration-unit.service.js:208-209`
- **What code does:** `// need to discuss if schedule needs to be changed` then disabled `insertPaymentScheduleandUpdateMilestone(...)`.
- **What docs claim:** UnitSwap §6 Rule 9 already documents this as OPEN. Doc is correct.
- **Correction needed:** None for doc. Flag for engineering decision.

### GAP-DEV-003 — Previous unit always goes to RESERVED, never AVAILABLE
- **Severity:** MEDIUM
- **Service:** `registration-unit.service.js:201-204`
- **What code does:** When previous unit has no other consumers, status set to `RESERVED` (not `AVAILABLE`). Unit invisible to buyer portal until admin manually flips.
- **What docs claim:** UnitSwap §6 Rule 11 states "previous unit → RESERVED" but does not explain downstream visibility impact.
- **Correction needed:** Add note: RESERVED is not buyer-allocatable; admin must manually flip if unit should be re-offered.

### GAP-DEV-004 — KYC-branched activity-flag reset not fully detailed
- **Severity:** LOW
- **Service:** `registration-unit.service.js:174-184` and `816-825`
- **What code does:** If `isKycSubmitted=true` → reset admin-side activity flags. Else → reset self-KYC flags.
- **What docs claim:** UnitSwap §6 Rule 11 lists flags but not the branching.
- **Correction needed:** Document branching condition in UnitSwap FRD.

---

## MODULE: Customers (Parking)

### GAP-DEV-005 — Backend Yup `notRequired` on parkingCount/parkingAmount
- **Severity:** HIGH (already documented)
- **Service:** `registration-unit.service.js:285-347`
- **What code does:** Coerces to 0 via `Number(parkingCount) || 0`. Only delta-zero check rejects.
- **What docs claim:** Parking §6 Rule 1 documents this gap.
- **Correction needed:** None for doc. Engineering should harden backend validation.

### GAP-DEV-006 — Parking pool decrement keyed on `lsqTypologyId` alone, no project filter
- **Severity:** MEDIUM
- **Service:** `registration-unit.service.js:308-314`
- **What code does:** `UnitTypology.findOne({ where: { lsqTypologyId: registrationUnit.typologyId } })` — no `projectId` in where clause.
- **What docs claim:** Parking doc silent on pool scoping.
- **Correction needed:** Document pool keying; if multi-project shares same `lsqTypologyId`, pool is shared.

---

## MODULE: Allocation (Campaign Service)

### GAP-DEV-007 — Stale past campaigns auto-marked FAILED (not COMPLETED) on next create
- **Severity:** HIGH
- **Service:** `allocation-campaign.service.js:559-570`
- **What code does:** `await lastCampaign.update({ status: 'FAILED' }, { transaction });` — past-window non-terminal campaigns auto-go to FAILED.
- **What docs claim:** FRD Feature 2 shows `Active → Completed (auto)` and FAILED only for system errors.
- **Correction needed:** Doc the cleanup mechanism explicitly OR investigate as bug (comment suggests intent was COMPLETED).

### GAP-DEV-008 — 2-minute pre-start blackout in `checkAnyActiveCampaignExists`
- **Severity:** HIGH
- **Service:** `allocation-campaign.service.js:1380-1401`
- **What code does:** Returns true if RUNNING OR if NOT_STARTED with `startTime <= now + 2min`. Blocks swap/refund/assign-offline 2 min before campaign begins.
- **What docs claim:** UnitSwap §3.2 gate #2 says only "no active campaign". 2-minute window undocumented.
- **Correction needed:** Add 2-minute pre-start blackout to all gates referencing this check (UnitSwap, Cancel Unit, Assign Unit).

### GAP-DEV-009 — Dynamic-campaign membership check commented out in bulk refund
- **Severity:** HIGH
- **Service:** `registration-unit.service.js:1142-1146, 1182-1190`
- **What code does:** Per-registration `activeCampaignRegistrationSet.has(unitNumber)` block fully commented. Only global 2-min gate masks the loophole.
- **What docs claim:** No mention.
- **Correction needed:** Document the loophole OR re-enable.

### GAP-DEV-010 — Stop/Cancel status flip is async via Python
- **Severity:** LOW
- **Service:** `allocation-campaign.service.js:1042-1075`
- **What code does:** `terminateAllocationCampaign` calls Python `/campaign/stop`, writes audit log. Does NOT update `AllocationCampaign.status` in backend — relies on Python callback.
- **What docs claim:** FRD Feature 3 §7: "Campaign status → Stopped" — implies sync.
- **Correction needed:** Update FRD to state status flip is async via Python callback.

### GAP-DEV-011 — `markAllocationCampaignFailed` actually DESTROYS the row ⚠️ CRITICAL
- **Severity:** CRITICAL
- **Service:** `allocation-campaign.service.js:990-1010`
- **What code does:** Despite name, calls `AllocationCampaign.destroy(...)` and `DynamicRound.destroy(...)`. Hard/soft delete depending on model paranoid setting — NOT a status update.
- **What docs claim:** BRD §5 shows `Active → Failed` as a visible state; FRD Feature 2 status filter includes FAILED.
- **Correction needed:** Either source bug (should be `.update({status: 'FAILED'})`) OR docs must drop all FAILED references. Engineering decision required.

### GAP-DEV-012 — 20-registration-per-unit hard cap in DYNAMIC Excel undocumented
- **Severity:** MEDIUM
- **Service:** `allocation-campaign.service.js:453-458`
- **What code does:** `if (currentCountForUnit >= 20) { rowData.errors.push('Max registrations per unit exceeded (20)'); }` — hard-coded 20, separate from configurable `allocationsPerUnit`.
- **What docs claim:** FRD does not mention this cap.
- **Correction needed:** Add to DYNAMIC campaign validation rules in FRD.

### GAP-DEV-013 — PHYSICAL_EVENT typology-match check commented out
- **Severity:** MEDIUM
- **Service:** `allocation-campaign.service.js:159-164`
- **What code does:** Commented: "not checking typology match as of now". STATIC enforces (L446-451) but PHYSICAL_EVENT does not.
- **What docs claim:** Inconsistency not noted.
- **Correction needed:** Document asymmetry per allocation type in FRD.

### GAP-DEV-014 — PHYSICAL_EVENT assigned-vs-pool overlap check commented out
- **Severity:** MEDIUM
- **Service:** `allocation-campaign.service.js:261-263`
- **What code does:** Same unit may appear in both assigned mapping and common pool — no rejection.
- **What docs claim:** Not addressed.
- **Correction needed:** Document the permissive behaviour or re-enable check.

---

## MODULE: Allocation (Payment / Hold)

### GAP-DEV-015 — Hard-coded 20-minute hold-expiry window
- **Severity:** HIGH
- **Service:** `allocation.service.js:171-178`
- **What code does:** `if (timeDiff >= 20)` resets unit status to AVAILABLE.
- **What docs claim:** Hold concept exists in FRD; "20 minutes" never stated.
- **Correction needed:** Document the 20-min cap in Allocation Feature 5/6/7.

### GAP-DEV-016 — Failed-status list hard-coded `['cancelled','bounced','failed']`
- **Severity:** LOW
- **Service:** `allocation.service.js:144`
- **What code does:** These 3 statuses release unit immediately; others wait for 20-min timeout.
- **What docs claim:** Not enumerated.
- **Correction needed:** Doc which payment statuses trigger immediate release vs timeout.

### GAP-DEV-017 — STATIC InitialAllotment created retroactively at booking finalize
- **Severity:** MEDIUM
- **Service:** `allocation.service.js:1078-1095`
- **What code does:** For STATIC, InitialAllotment rows bulk-created post-payment, not at campaign start.
- **What docs claim:** Not stated.
- **Correction needed:** Add to ADMIN-FS-Allocation STATIC flow.

### GAP-DEV-018 — DYNAMIC: orphan WINNER rows possible
- **Severity:** MEDIUM
- **Service:** `allocation.service.js:1097-1152`
- **What code does:** If no PREALLOCATED/ALLOCATED row exists, falls back to last dynamicRoundId. If none, logs warning and skips — booking succeeds but no campaign trace.
- **What docs claim:** No mention.
- **Correction needed:** Document edge case in FRD.

### GAP-DEV-019 — `migrateUnassignedUnitsAfterBooking` fully commented out for PHYSICAL_EVENT ⚠️ HIGH
- **Severity:** HIGH
- **Service:** `allocation.service.js:49, 1184-1188, 1209-1213`
- **What code does:** Import and all calls commented. Business rule silently disabled.
- **What docs claim:** Not referenced.
- **Correction needed:** Investigate intent. If buyer's other assigned units should release to pool after booking one, doc AND re-enable. Otherwise remove dead code.

---

## MODULE: Allocation (Pricing)

### GAP-DEV-020 — Stamp duty hard-coded at 7%
- **Severity:** HIGH
- **Service:** `common.service.js:240, 500, 824`
- **What code does:** `const stampDuty = Math.round(finalAgreementValue * 0.07 * 100) / 100;` — 7% literal in 3 places.
- **What docs claim:** FRD shows stamp duty in pricing but never states the rate.
- **Correction needed:** Document 7% rate. Flag for engineering: should be config-driven.

### GAP-DEV-021 — 2-BHK Rise/Peak parking carve-out via string match
- **Severity:** MEDIUM
- **Service:** `common.service.js:130, 517`
- **What code does:** `is2BHKRiseOrPeakHome = unit.typologyName === '2 BHK Rise Home' || unit.typologyName === '2 BHK Peak Home'` — forces parking disabled.
- **What docs claim:** Not in parking doc.
- **Correction needed:** Document carve-out. Flag: should be a typology flag, not name match.

### GAP-DEV-022 — Buyer-side parking amount comes from `MIN(pool)`, ignores frontend
- **Severity:** LOW
- **Service:** `common.service.js:232-235`
- **What code does:** Backend reads `MIN(amount) FROM ParkingInventory` — never trusts frontend-supplied number.
- **What docs claim:** Buyer-flow price source not specified.
- **Correction needed:** Document price source for buyer flow.

---

## MODULE: Offers

### GAP-DEV-023 — `deleteOffer` is hard destroy, no audit, no FK guard
- **Severity:** HIGH
- **Service:** `offer.service.js:129-140`
- **What code does:** `await offer.destroy();` — no audit, no check for RegistrationUnitOffer references.
- **What docs claim:** Likely assumes soft-delete with audit.
- **Correction needed:** Fix source OR document actual hard-delete behaviour.

### GAP-DEV-024 — `toggleOfferStatus` emits no audit
- **Severity:** MEDIUM
- **Service:** `offer.service.js:145-157`
- **What code does:** `offer.isActive = !offer.isActive; await offer.save();` — no audit emission.
- **What docs claim:** FS-Offers Feature 4 §9 claims audit IS logged.
- **Correction needed:** Source gap — add audit OR correct doc.

### GAP-DEV-025 — `createOffer`/`editOffer` lack service-level audit + date-order validation
- **Severity:** HIGH
- **Service:** `offer.service.js:39-77, 82-124`
- **What code does:** Direct create/update. No `startDate <= endDate` check, no audit, no null-value check.
- **What docs claim:** FS-Offers documents validations and audit.
- **Correction needed:** Document that validations live in controller/validator middleware, not service layer.

### GAP-DEV-026 — `now.setHours(...)` mutates Date object — fragile
- **Severity:** LOW
- **Service:** `registration-unit.service.js:720-722`; mirrored in `common.service.js`
- **What code does:** `endDate: { [Op.gte]: new Date(now.setHours(0,0,0,0)) }` mutates `now`.
- **Correction needed:** Source-only fix recommendation.

### GAP-DEV-027 — Offline assign supports only HOME_LOAN offer (TODO in code)
- **Severity:** MEDIUM
- **Service:** `registration-unit.service.js:707-724`
- **What code does:** TODO at L707-708: "parking, home loan, and offers need to be managed from request". Only `HOME_LOAN` offer fetched.
- **What docs claim:** Not addressed.
- **Correction needed:** Document offline-assign offer limitation in FRD.

---

## MODULE: Towers

### GAP-DEV-028 — Admin unit-swap tower list NOT filtered by `isActive`
- **Severity:** HIGH
- **Service:** `tower.service.js:17-25`
- **What code does:** `adminUnitSwapTowers` returns ALL towers; only `userHeatmapTowers` and `fetchTowersForDropdown` filter by `isActive`.
- **What docs claim:** UnitSwap §4.2 already noted. Doc is correct.
- **Correction needed:** None for doc. Engineering should confirm intent.

---

## MODULE: Payment Transactions

### GAP-DEV-029 — `withRefunded` scope exposes refunded transactions
- **Severity:** MEDIUM
- **Service:** `payment-transactions.service.js:101`
- **What code does:** Include uses scope bypassing default refund filter.
- **What docs claim:** Visibility not addressed.
- **Correction needed:** Document that listing includes refunded-registration transactions.

### GAP-DEV-030 — "online" payment source filter conflates NULL with 'gateway'
- **Severity:** LOW
- **Service:** `payment-transactions.service.js:43-56`
- **What code does:** `online` = `paymentSource IS NULL OR paymentSource = 'gateway'`.
- **What docs claim:** Not addressed.
- **Correction needed:** Document the legacy NULL handling.

### GAP-DEV-031 — `getPaymentTransactionById` is deferred TODO
- **Severity:** LOW
- **Service:** `payment-transactions.service.js:247-248`
- **What code does:** Commented stub: "deferred, not yet required".
- **Correction needed:** Mark deferred in doc if BRD-Payment-Transactions implies detail view exists.

---

## MODULE: Registration (Allocation Status Derivation)

### GAP-DEV-032 — `allocationStatus` derivation tree + Redis fallback undocumented
- **Severity:** MEDIUM
- **Service:** `registration.service.js:135-167`
- **What code does:** 5-branch derivation: terminal → as-is; no campaign → WAITLIST; STATIC w/ avail-flag → CHOOSE/WAITLIST; DYNAMIC + Redis alloc-key → ALLOCATED/WAITLIST. Redis errors silently default to WAITLIST.
- **What docs claim:** Loose references to CHOOSE/ALLOCATED in BRD-Allocation; full tree not enumerated.
- **Correction needed:** Add explicit derivation table + Redis-failure semantics to FRD.

---

## MODULE: Cross-Cutting

### GAP-DEV-033 — `withRefunded` scope used inconsistently across queries
- **Severity:** MEDIUM
- **Service:** `payment-transactions.service.js:101`, `registration.service.js:46,60`, `registration-unit.service.js:1283`
- **What code does:** Some queries opt into refunded visibility, others don't. Even within bulk-refund flow, initial RegistrationUnit fetch and post-update Registration fetch differ.
- **What docs claim:** No global rule documented.
- **Correction needed:** Add SHARED-BR section listing which surfaces include vs exclude refunded rows.

### GAP-DEV-034 — No DB-level uniqueness on assigned `unit_id` — double-booking race window ⚠️ CRITICAL
- **Severity:** CRITICAL
- **Service:** `registration-unit.service.js:138-147, 192-197, 750-759`
- **What code does:** App-level `findOne` to detect conflict; no `UNIQUE` index on `unit_id WHERE status IN ('WINNER','HOLD')`. Concurrent requests can both pass the check then both write.
- **What docs claim:** UnitSwap §3.2 gate #10 describes app-level check; race window not addressed.
- **Correction needed:** Document race possibility. Engineering should add partial-unique DB index.

---

## SUMMARY TABLE

| Gap ID | Module | Severity | Description |
|--------|--------|----------|-------------|
| GAP-DEV-001 | Customers/Allocation/Towers | HIGH | Hard-coded `prod?1:2` projectId fallback undocumented |
| GAP-DEV-002 | Customers (UnitSwap) | MEDIUM | Milestone regen disabled on swap (already noted) |
| GAP-DEV-003 | Customers (UnitSwap) | MEDIUM | Previous unit → RESERVED, not AVAILABLE — visibility impact undocumented |
| GAP-DEV-004 | Customers (UnitSwap) | LOW | KYC-branched flag-reset not detailed |
| GAP-DEV-005 | Customers (Parking) | HIGH | Backend coerces count/amount to 0 — FE-only enforcement (noted) |
| GAP-DEV-006 | Customers (Parking) | MEDIUM | Parking pool decrement not project-scoped |
| GAP-DEV-007 | Allocation | HIGH | Stale campaigns auto-FAILED not COMPLETED |
| GAP-DEV-008 | Allocation | HIGH | 2-min pre-start blackout undocumented |
| GAP-DEV-009 | Allocation/Customers | HIGH | Dynamic-campaign membership commented out in bulk refund |
| GAP-DEV-010 | Allocation | LOW | Campaign stop status flip is async via Python |
| GAP-DEV-011 | Allocation | **CRITICAL** | `markAllocationCampaignFailed` DESTROYs row not status-update |
| GAP-DEV-012 | Allocation | MEDIUM | 20-reg-per-unit hard cap in DYNAMIC undocumented |
| GAP-DEV-013 | Allocation | MEDIUM | PHYSICAL_EVENT typology-match check commented out |
| GAP-DEV-014 | Allocation | MEDIUM | PHYSICAL_EVENT assigned-vs-pool overlap check commented out |
| GAP-DEV-015 | Allocation | HIGH | 20-min hold-expiry hard-coded, undocumented |
| GAP-DEV-016 | Allocation | LOW | Failed-statuses list hard-coded |
| GAP-DEV-017 | Allocation | MEDIUM | STATIC InitialAllotment created post-payment only |
| GAP-DEV-018 | Allocation | MEDIUM | DYNAMIC orphan WINNER rows possible |
| GAP-DEV-019 | Allocation | HIGH | `migrateUnassignedUnitsAfterBooking` fully disabled |
| GAP-DEV-020 | Allocation/Pricing | HIGH | Stamp duty hard-coded 7% |
| GAP-DEV-021 | Allocation/Parking | MEDIUM | 2-BHK Rise/Peak parking carve-out via name match |
| GAP-DEV-022 | Allocation/Pricing | LOW | Buyer parking amount = MIN(pool) |
| GAP-DEV-023 | Offers | HIGH | `deleteOffer` hard destroy, no audit, no FK guard |
| GAP-DEV-024 | Offers | MEDIUM | `toggleOfferStatus` no audit — doc claims otherwise |
| GAP-DEV-025 | Offers | HIGH | create/edit lack service-level audit + date-order check |
| GAP-DEV-026 | Offers | LOW | `now.setHours` mutation fragile |
| GAP-DEV-027 | Customers (Offline Assign) | MEDIUM | Offline assign supports only HOME_LOAN offer (TODO) |
| GAP-DEV-028 | Towers | HIGH | Admin swap tower list ignores `isActive` (already noted in UnitSwap doc) |
| GAP-DEV-029 | Payment Txns | MEDIUM | `withRefunded` exposes refunded txns — undocumented |
| GAP-DEV-030 | Payment Txns | LOW | "online" filter conflates NULL + 'gateway' |
| GAP-DEV-031 | Payment Txns | LOW | `getPaymentTransactionById` deferred — verify doc |
| GAP-DEV-032 | Registration | MEDIUM | `allocationStatus` derivation tree + Redis fallback undocumented |
| GAP-DEV-033 | Cross-cutting | MEDIUM | `withRefunded` scope used inconsistently |
| GAP-DEV-034 | Registration Unit | **CRITICAL** | No DB-level uniqueness on `unit_id` — double-booking race window |

---

## Commented-Out Business Logic Inventory

| File:Line | Disabled Code | Comment |
|-----------|---------------|---------|
| `registration-unit.service.js:208-209` | Milestone regen on unit swap | "need to discuss if schedule needs to be changed" |
| `registration-unit.service.js:1059-1062` | Allocation notification on refund | (none) |
| `registration-unit.service.js:1142-1190` | Dynamic-campaign membership in bulk refund | (none) |
| `allocation-campaign.service.js:159-164` | Typology-match for PHYSICAL_EVENT | "not checking typology match as of now" |
| `allocation-campaign.service.js:261-263` | Assigned-vs-pool overlap check | (none) |
| `allocation.service.js:49, 1184-1213` | `migrateUnassignedUnitsAfterBooking` | (none) |
| `allocation.service.js:842-846` | Inline TypologyMilestone lookup | superseded |
| `registration-unit.service.js:610-619` | Azure SAS-URL detailed return shape | superseded |
