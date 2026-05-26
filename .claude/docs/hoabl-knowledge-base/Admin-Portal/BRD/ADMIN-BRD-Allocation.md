# Allocation — BRD

**Portal:** Admin Portal
**URL:** `https://uat-web.xrportal.in/admin/allocation`
**Created:** 2026-05-11
**Status:** Complete

---

## 1. Purpose

The Allocation module allows admins to create and manage time-bound campaigns during which registered buyers can select and book units. It is the core event-management tool for the property sales process — no unit can be booked without an allocation campaign (except via admin offline booking in the Customers module).

---

## 2. Who Uses This

| Role | Action |
|------|--------|
| Admin | Create, monitor, stop, and cancel campaigns |
| Sales Manager Admin | Monitor campaigns |
| Buyers (via Customer Portal) | Participate in active campaigns to select and book units |

---

## 3. Campaign Types

| Type | How It Works |
|------|-------------|
| **Static** | All eligible buyers see all available units simultaneously. First to pay gets the unit. |
| **Dynamic** | Round-based. System assigns buyers to rounds. Only buyers in the active round can select units. |
| **Physical Event** | Walk-in on-site event. Admin or SM assigns units to buyers offline. |

---

## 4. Key Business Rules

1. **3-minute lead time:** Campaign Start Time must be at least 3 minutes in the future.
2. **Single active campaign:** Only one campaign should run at a time on UAT.
3. **Tower prerequisite:** At least one tower must be Active in Config CMS before a campaign can be meaningful.
4. **Post-campaign status:** Buyers who didn't complete payment become Waitlisted. Buyers who paid remain Confirmed (Booked).
5. **Stop vs. Cancel:** Stop ends an Active campaign; Cancel removes an Upcoming campaign before it starts.

---

## 5. Campaign Status Flow

```
Upcoming → Active → Completed (auto, at end time)
Upcoming → Cancelled (manual, before start)
Active → Stopped (manual, before end time)
Active → Failed (system error)
```

---

## 6. Admin Workflow (Step by Step)

1. Configure towers in Config CMS → ensure at least one tower is Active
2. Go to `/admin/allocation`
3. Fill in campaign form: name, type (Static/Dynamic/Physical Event), start time (3+ min from now), end time
4. Click "Save Campaign" → status = Upcoming
5. At scheduled start time: campaign automatically goes Active; buyers can participate
6. Monitor campaign: watch the campaign list; check Towers module for real-time unit status
7. When complete: campaign auto-ends at end time (Completed) or admin clicks Stop (Stopped)
8. Review results: check Customers module for newly Booked registrations

---

## 7. Buyer Experience (Customer Portal Side)

- Buyer logs in to Customer Portal during Active campaign
- Sees tower grid with colour-coded unit availability (White = available, Red = sold, Orange = being paid)
- Clicks available unit → sees pricing with offer discounts applied
- Clicks "Proceed to Pay" → Easebuzz payment popup
- Pays confirmation amount → booking locked → unit turns Red

---

## 8. Integrations

| System | Role |
|--------|------|
| Python WebSocket Server | Real-time unit grid updates during active campaign |
| Redis | Campaign state cache and unit hold timers |
| Easebuzz | Online payment gateway for buyer booking confirmation |
| Kaleyra | WhatsApp notifications on payment success/failure. **NOT** sent on campaign activate or end (NONE in source) <!-- FSD-CORRECTION 2026-05-25 // Source: allocation-campaign.service.js:530-1075 --> |
| Epinet | OTP SMS delivery (NOT Kaleyra) <!-- FSD-CORRECTION 2026-05-25 // Source: communication.service.js --> |
| Mavis | Unit booking sync after successful payment |
| LeadSquared | Booking activity logged to CRM |

---

## 9. Related Documents

- [[Feature-Spec - Allocation]] — Full feature specifications with How to Use
- [[Config CMS]] — Tower Configuration (prerequisite)
- [[Customers]] — View resulting bookings post-campaign
- [[Realtime-Events-BRD]] — WebSocket event details

---

## 10. Backend Gap Reconciliation (2026-05-21)

Controller (`allocation-campaign.controller.js`, `allocation.controller.js`) and service (`allocation-campaign.service.js`, `allocation.service.js`, `common.service.js`) audit findings. These notes correct and supplement §4–§7.

### ⚠️ KNOWN ISSUE — CRITICAL SECURITY: `cancelUserAllocation` ownership check is broken
<!-- BA correction: GAP-TL-008, 2026-05-21 -->
- The ownership guard in `allocation.controller.js:56-62` uses `if (!RegistrationUnit.join(...).findOne(...))` — `findOne` returns a Promise; the `if` is always truthy. Guard never blocks.
- **Impact:** Any authenticated user can cancel any `registrationUnit` by ID.
- **Action:** Flagged to Developer Agent. QA must NOT write a negative test that expects a 403 on cross-user cancel — endpoint is currently undocumented and not safe to test in UAT.

### ⚠️ KNOWN ISSUE — CRITICAL: `markAllocationCampaignFailed` DESTROYS the row
<!-- BA correction: GAP-DEV-011, 2026-05-21 -->
- Despite the name, the service method in `allocation-campaign.service.js:990-1010` calls `AllocationCampaign.destroy(...)` AND `DynamicRound.destroy(...)`. It does NOT set `status='FAILED'`.
- **Impact:** The `Active → Failed` transition shown in §5 cannot leave a visible row. Any FAILED filter in admin UI will be empty.
- **Action:** Flagged to Developer Agent. Until source fix, `FAILED` status references in §5 and child FRD Feature 2 are aspirational, not observable.

### ⚠️ KNOWN ISSUE — CRITICAL: No DB-level uniqueness on assigned unit_id — double-booking race
<!-- BA correction: GAP-DEV-034, 2026-05-21 -->
- App-level `findOne` is used to detect unit conflict before write (`registration-unit.service.js:138-147, 192-197, 750-759`). No `UNIQUE` partial index exists on `unit_id WHERE status IN ('WINNER','HOLD')`.
- Two concurrent requests can both pass the check then both write — race window is the duration between the SELECT and INSERT.
- **Action:** Flagged to Developer Agent. QA may design a stress test to demonstrate the race but it is OUT OF SCOPE for functional regression.

### 10.1 Default project resolution (env-based) <!-- BA correction: GAP-TL-001, GAP-DEV-001, 2026-05-21 -->
- If the client omits `projectId`, backend silently substitutes `1` on production and `2` on UAT. The "Project ID is required" check is dead code.
- All campaign-create, registration-unit-fetch, tower-list and parking-pool service calls share this fallback.
- §4 Rule 2 ("Single active campaign") aligns with the single-project assumption.

### 10.2 PHYSICAL_EVENT requires `commonPoolExcel` <!-- BA correction: GAP-TL-002, 2026-05-21 -->
- For Physical Event campaigns, the `commonPoolExcel` file upload is MANDATORY. STATIC/DYNAMIC accept `allotmentExcel` instead.
- Missing file → HTTP 400 "Common pool units Excel is required for PHYSICAL_EVENT allocation type".

### 10.3 Excel validation errors return binary XLSX, not JSON <!-- BA correction: GAP-TL-003, 2026-05-21 -->
- When campaign-create Excel fails validation, the response is HTTP 400 with an XLSX binary body (Content-Disposition attachment). Filenames: `physical-event-allocation-errors.xlsx` or `dynamic-allocation-errors.xlsx`.

### 10.4 Dynamic-campaign rounds endpoint <!-- BA correction: GAP-TL-004, 2026-05-21 -->
- `GET /api/v1/admin/allocation/campaign/:campaignId/rounds` returns a paginated rounds list (default page=1, limit=20). Not previously documented.

### 10.5 Campaign allotments export endpoint <!-- BA correction: GAP-TL-005, 2026-05-21 -->
- `GET /api/v1/admin/allocation/campaign/:campaignId/allotments/export` streams all allotments for a campaign as Excel.

### 10.6 Notify physical-event registrants endpoint <!-- BA correction: GAP-TL-006, 2026-05-21 -->
- `POST /api/v1/admin/allocation/campaigns/:campaignId/notify` triggers Kaleyra notifications to physical-event registrants. Admin-triggered.

### 10.7 Update endpoint uses `action` field <!-- BA correction: GAP-TL-007, 2026-05-21 -->
- A single `updateAllocationCampaign` endpoint accepts an `action` field in the body. Stop/Cancel likely route through this with different action values rather than separate `/stop` and `/cancel` routes. Doc claims in child FRD of separate routes must be reconciled.

### 10.8 Tax computation rules (GST + TDS thresholds) <!-- BA correction: GAP-TL-010, GAP-DEV-020, 2026-05-21 -->
- **GST:** `gstToGovernmentPercentage = finalAgreementValue < 4,500,000 ? 1 : 5` (i.e. 1% below ₹45 lakh, 5% at or above).
- **TDS:** principal forced to ₹0 when `finalAgreementValue < ₹45 lakh`. TDS milestone suppressed entirely.
- **Stamp duty:** hard-coded at 7% of `finalAgreementValue` (`common.service.js:240, 500, 824`). Not config-driven.

### 10.9 Pricing formula (corrected) <!-- BA correction: GAP-TL-015, 2026-05-21 -->
- `finalAgreementValue = agreementValue + totalParkingAmount − earlyBirdBenefit − (homeLoanDiscountAmount if home-loan eligible) − offerDiscountAmount`
- Home-loan discount gating: `RegistrationHomeLoan.status='completed' AND loanApprovalStatus != 'admin_rejected'` OR `loanApprovalStatus='admin_approved'`.

### 10.10 RegistrationUnit status enum <!-- BA correction: GAP-TL-016, 2026-05-21 -->
- Allowed values: `WINNER`, `PREALLOCATED`, `WAITLIST`, `HOLD`, `CANCELLED`.

### 10.11 Admin-only overrides on KYC/cancel <!-- BA correction: GAP-TL-013, 2026-05-21 -->
- Admin role can pass `forcedCancel` (boolean) and `fallbackStatus` (string) to alter service behaviour during cancellation.

### 10.12 SM-on-behalf-of-buyer KYC submission <!-- BA correction: GAP-TL-012, 2026-05-21 -->
- If `req.body[0].reqFromSm` is truthy, `submitKyc` uses `req.body[0].userId` as the operating user. No caller-is-SM role check is enforced — flagged to Dev Agent.

### 10.13 KYC e-sign accepts master OTP <!-- BA correction: GAP-TL-014, 2026-05-21 -->
- `verifyKycEsignOtp` accepts `otpConfig.adminMasterOtp` as a valid OTP for any user, bypassing expiry/value checks.

### 10.14 submitKyc returns HTTP 207 on partial success <!-- BA correction: GAP-TL-011, 2026-05-21 -->
- Multi-unit KYC submission returns 207 Multi-Status when some units succeed and others fail.

### 10.15 createPaymentIntent has no validation <!-- BA correction: GAP-TL-009, 2026-05-21 -->
- Stores any string into PaymentIntent. Hard-codes `transactionType: 2`. No referential check. Either un-documented endpoint kept for backward compatibility or candidate for removal.

### 10.16 2-minute pre-start campaign blackout <!-- BA correction: GAP-DEV-008, 2026-05-21 -->
- `checkAnyActiveCampaignExists` returns true if any campaign is RUNNING OR if status is NOT_STARTED with `startTime <= now + 2 minutes`.
- This blocks Unit Swap, Cancel Unit, Assign Unit, and Bulk Refund for the 2 minutes preceding any scheduled campaign start.
- §4 Rule 2 ("Single active campaign") is supplemented by this pre-start window.

### 10.17 Stale past campaigns auto-FAILED on next create <!-- BA correction: GAP-DEV-007, 2026-05-21 -->
- When creating a new campaign, any past-window non-terminal campaign is updated to `status='FAILED'`. Contradicts §5 which shows auto-transition to Completed. Engineering decision pending; doc the current behaviour.

### 10.18 Stop/Cancel status flip is async via Python <!-- BA correction: GAP-DEV-010, 2026-05-21 -->
- `terminateAllocationCampaign` calls Python `/campaign/stop` and writes the audit log. It does NOT update `AllocationCampaign.status` synchronously — it relies on a Python callback.

### 10.19 20-minute hold-expiry window <!-- BA correction: GAP-DEV-015, 2026-05-21 -->
- Unit HOLD status auto-releases to AVAILABLE 20 minutes after the hold timestamp (`allocation.service.js:171-178`). Hard-coded.

### 10.20 Payment statuses that release unit immediately <!-- BA correction: GAP-DEV-016, 2026-05-21 -->
- Payment statuses `['cancelled','bounced','failed']` release the unit immediately. All other terminal-payment statuses wait for the 20-minute timeout.

### 10.21 STATIC InitialAllotment created retroactively <!-- BA correction: GAP-DEV-017, 2026-05-21 -->
- For STATIC campaigns, InitialAllotment rows are bulk-created post-payment at booking finalize, not at campaign start.

### 10.22 DYNAMIC orphan WINNER rows possible <!-- BA correction: GAP-DEV-018, 2026-05-21 -->
- If no PREALLOCATED/ALLOCATED row exists, the code falls back to the last `dynamicRoundId`. If still none, it logs a warning and skips — booking succeeds but with no campaign trace.

### 10.23 `migrateUnassignedUnitsAfterBooking` disabled <!-- BA correction: GAP-DEV-019, 2026-05-21 -->
- `allocation.service.js:49, 1184-1188, 1209-1213` — import and all calls fully commented out. For PHYSICAL_EVENT, a buyer's other assigned units do NOT release to the pool after they book one unit.

### 10.24 Bulk refund dynamic-campaign membership check disabled <!-- BA correction: GAP-DEV-009, 2026-05-21 -->
- Per-registration `activeCampaignRegistrationSet.has(unitNumber)` block is fully commented. Only the global 2-min gate (10.16) masks this loophole.

### 10.25 DYNAMIC Excel: 20-registration-per-unit hard cap <!-- BA correction: GAP-DEV-012, 2026-05-21 -->
- `if (currentCountForUnit >= 20) { error: 'Max registrations per unit exceeded (20)' }`. Separate from the configurable `allocationsPerUnit`.

### 10.26 PHYSICAL_EVENT validations: asymmetry <!-- BA correction: GAP-DEV-013, GAP-DEV-014, 2026-05-21 -->
- PHYSICAL_EVENT does NOT enforce typology-match (commented out at `allocation-campaign.service.js:159-164`). STATIC enforces it at L446-451.
- PHYSICAL_EVENT does NOT reject overlap between the assigned-mapping unit set and the common pool (commented out at L261-263).
