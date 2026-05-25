---
type: feature-spec
portal: Admin Portal
module: Customers
feature: Unit Swap
updated: 2026-05-21
status: complete
---

# Admin Portal — Customers Module: Unit Swap Feature Specification

**Related:** [[ADMIN-BRD-Customers]] | [[ADMIN-FS-Customers]] | [[ADMIN-FRD-Allocation]] | [[SHARED-WF-allocation-workflow]] | [[SHARED-BR-Status-Flows]]

---

# Feature: Unit Swap (from Customers Row)

## 1. Objective
Allow admins to reassign a buyer's already-allotted unit to a different unit within the project. Used when a buyer requests a change of unit after booking, or when an operational correction is required (wrong unit assigned during offline booking, tower/floor reallocation, etc.).

## 2. Scope
- Row-level action available via the three-dot (…) action menu in the Customers registration table.
- Operates at `RegistrationUnit` level (one sub-registration / one allotted unit), not on the parent Registration.
- Replaces the currently allotted unit with a new one.
- **Out of scope:** refund handling, automatic payment-schedule regeneration (intentionally NOT performed — see §6 Rule 9 and §10), and full ERP/CRM downstream sync details.

## 3. Eligibility / Preconditions

### 3.1 Front-end Gate (UI menu visibility)
The "Unit swap" menu item is rendered only when:
```js
isBooked = record.status === 'WINNER' && record.allocationTransactionId !== null
```
This is the **only** front-end condition (`CustomerTable.jsx` L1090).

### 3.2 Back-end Runtime Gates
On submit, `swapRegistrationUnit` (`registration-unit.service.js` L69–282) enforces **all** of the following — failure of any returns HTTP 4xx and the swap is rejected:

| # | Gate | Code Ref | Failure Response |
|---|------|----------|------------------|
| 1 | `targetUnitId` provided | L73–75 | `400 'Target unit ID is required'` |
| 2 | **No active allocation campaign for the project** | L77–79 (`AllocationCampaignService.checkAnyActiveCampaignExists(projectId)`) | `400 'Cannot swap unit when campaign is active'` |
| 3 | `RegistrationUnit` row exists | L84–91 | `404 'Registration unit not found'` |
| 4 | Target unit ≠ current unit | L93–95 | `400 'Registration unit is already linked to the provided unit'` |
| 5 | **No active Mavis booking row** for the registration's booking ID | L99–105 (`mavisService.findBookingRowId`) | `400 'Mavis booking still exists, please clear that step first'` |
| 6 | Registration row exists | L107–114 | `404 'Registration not found'` |
| 7 | Project is configured | L116 (`getProjectData`) | `400 'Project not configured'` |
| 8 | **Target unit status is `AVAILABLE` or `RESERVED`** | L118–126 | `404 'Requested unit not found'` |
| 9 | Target unit has a typology mapped in project | L128–136 | `404 'Requested unit typology not found'` |
| 10 | **No other registration is linked to the target unit** | L138–147 | `409 'Requested unit is already assigned to another registration'` |

> **Important:** The "open allocation campaign" condition is **inverted** relative to a naive reading — an open campaign **BLOCKS** swap. Unit Swap is only permissible OUTSIDE an open allocation window.

## 4. UI Changes

### 4.1 Menu Entry
- New entry in the row's three-dot (…) dropdown: **"Unit swap"** (key `unit-swap`).
- Selecting it opens the Unit Swap modal.

### 4.2 Unit Swap Modal

| Element | Content / Behaviour |
|---------|--------------------|
| Title | "Unit Swap" with swap icon (`AiOutlineSwap`, green) |
| Registration Number (read-only) | `selectedRecord.unitRegistrationNumber` |
| Current Unit (read-only) | `<unitNo>-<towerName>` or `-` if absent |
| Apartment Type (read-only) | If status WINNER: `<allotedApartmentType> (<allotedCarpetArea> sq.ft.)`; else `<regApartmentType> (<allotedCarpetArea> sq.ft.)` |
| Tower dropdown | Populated by `GET apiUrls.common.towers?action=unit-swap` (lazy-load on dropdown open). Returns ALL towers in the project (including inactive — `tower.service.js` L17–25 does not filter by `isActive`). |
| Unit dropdown | Populated by `GET apiUrls.common.unitsInTower/:towerId?action=unit-swap` after tower selected; resets when tower changes |
| Confirmation checkbox 1 | "Activity - Token, Form, Booking deleted" |
| Confirmation checkbox 2 | "Mavis - Booking entry deleted" |
| Submit button | Enabled only when both checkboxes are checked AND a new unit is selected |
| Close (X) | Resets all swap state (tower, unit, checkboxes, units list) |

## 5. Form Details

| Field | Type | Mandatory | Source / Validation |
|-------|------|-----------|--------------------|
| Tower | Dropdown | Yes | Server list filtered by `action=unit-swap`. All towers in project, including inactive ones. |
| Unit | Dropdown | Yes | See §5.1 — server-side filter. |
| "Activity - Token, Form, Booking deleted" | Checkbox | Yes | Admin attests external CRM cleanup was performed |
| "Mavis - Booking entry deleted" | Checkbox | Yes | Admin attests Mavis (ERP) cleanup was performed |

### 5.1 Target-Unit Dropdown Filter (resolved)

Backend query (`unit.service.js` L17–30, `adminUnitSwapUnits`):

```js
Unit.findAll({
  attributes: ['id', 'unitId', 'unitNo', 'status', 'frontendTypologyName'],
  where: {
    towerId,
    projectId: projectCode,
    status: { [Op.in]: ['AVAILABLE', 'RESERVED'] }
  },
  order: [['floorNumber', 'ASC'], ['unitNo', 'ASC']],
});
```

**Filter is `towerId + projectId + status IN (AVAILABLE, RESERVED)` ONLY.** Explicitly:
- **No typology filter** — the admin may swap into a unit of a different apartment type / carpet area than the original.
- **No floor filter.**
- **No carpet-area filter.**
- **No price-bucket filter.**
- Units in status `BOOKED`, `SOLD`, `BLOCKED`, or any other state are excluded from the dropdown.

> **Note:** A typology-mismatch swap is allowed by code. If a business rule requires same-typology swap, that is a back-end gap to raise — currently not enforced.

### 5.2 Attestation Checkboxes — Operational Note
The two checkboxes are **admin attestations only** — they do not themselves trigger any deletion. They are operational gates declaring that prerequisite cleanup tasks (CRM Activity records, Mavis booking entry) have been done manually before swap.

The backend **does** verify the Mavis side via `mavisService.findBookingRowId` (gate #5 in §3.2) — if a Mavis booking row still exists, the swap is rejected regardless of the checkbox. The CRM Activity reset is automatic on the backend (flags are reset to `false` on the registrationUnit), but the activity records in the external CRM must be deleted by the admin manually before swap.

## 6. Validations & Business Rules

1. Available only on Booked rows (`isBooked === true`).
2. Both attestation checkboxes must be ticked and a new unit must be selected before Submit is enabled.
3. **Open allocation campaign BLOCKS swap.** The backend rejects the request with `400 'Cannot swap unit when campaign is active'` if any active campaign exists for the project. This is a hard gate — there is no override. Admin must wait for the campaign to close (or close it via Allocation module) before swapping a unit.
4. **Mavis booking row must be cleared first.** If `mavisService.findBookingRowId` returns a row for the registration's booking ID, the swap is rejected with `400 'Mavis booking still exists, please clear that step first'`. The admin must delete the Mavis booking entry in the ERP **before** attempting swap.
5. **Target unit status must be `AVAILABLE` or `RESERVED`.** Any other status (`BOOKED`, `SOLD`, `BLOCKED`, etc.) returns `404 'Requested unit not found'`.
6. **Target unit must not be linked to another registration.** Returns `409 'Requested unit is already assigned to another registration'`.
7. **Typology is NOT enforced.** Admin may swap into a different typology / apartment type / carpet area — this is permitted by code (see §5.1). If business rules tighten this, it is a backend gap.
8. Tower list is unfiltered by `isActive` — admin may see (and pick from) inactive towers; consequent unit lookups still apply the AVAILABLE/RESERVED filter.
9. **Milestone / payment schedule is NOT auto-regenerated on swap.** The backend call `insertPaymentScheduleandUpdateMilestone(registrationUnit.id, transaction)` is **commented out** in source with the developer note "*need to discuss if schedule needs to be changed*" (`registration-unit.service.js` L208–211). As a consequence, after swap the original unit's milestone schedule and payment transactions remain attached to the registrationUnit — potentially stale relative to the new unit's typology pricing. This is a **known open gap** requiring product decision (see §10).
10. Operation is irreversible from the UI — there is no "undo swap" action.
11. On successful swap, the backend updates the following on the `RegistrationUnit` (L161–189):
    - `unitId`, `towerId`, `typologyId`, `allocatedTower`, `allocatedFloor`, `allocatedUnit` → new unit's values.
    - Reset flags: `bookingTokenActivitySubmitted=false`, `mavisBookingCreated=false`, `mavisUnitUpdated=false`, `lsqBookingActivityId=null`, `lsqBookingFormActivityId=null`, `isKycPdfSubmitted=false`.
    - If KYC was submitted: also reset `bookingFormActivitySubmitted`, `bookingActivitySubmitted`, `mavisBookingFinalUpdated`.
    - If self-KYC: reset `selfKycSubmitted`, `selfKycBookingActivitySubmitted`, `selfKycFinalSubmitted`.
    - New unit status → `BOOKED`; previous unit (if no other consumers) → `RESERVED`.

## 7. System Actions on Submit

1. `PUT apiUrls.admin.registrationUnitUpdate.replace(':id', registrationUnitId)` with body:
   ```json
   { "event": "unit-swap", "payload": { "unitId": "<new-unit-id>" } }
   ```
2. Backend validates body against `registrationUnitUpdateEventSchemas['unit-swap']` (Yup: `unitId` required string).
3. Backend runs the 10 runtime gates from §3.2.
4. On 2xx: toast **"Unit swapped successfully"**, modal closes, swap state resets, customer table refetches with current filters & pagination.
5. On error: toast with server `error.response.data.message` or fallback "Unit swap failed".

**Server-side side-effects on success:**
- `RegistrationUnit` field updates as enumerated in §6 Rule 11.
- New unit status → `BOOKED`, previous unit → `RESERVED` (if not consumed by another registration).
- `auditActions.ADMIN_UNIT_SWAP` audit log emitted (see §9).
- Redis cache updates for both old and new unit.
- **No** payment-schedule regeneration (see §6 Rule 9).
- **No** Kaleyra SMS, WhatsApp, or email dispatched (see §8).

## 8. Notifications

**Buyer-facing notifications: NONE.**

Source-code scan (`registration-unit.service.js` `swapRegistrationUnit` L69–282 + grep across `backend/src` for `kaleyra|sendSms|sendWhatsapp|sendEmail|sendNotification`) confirms: the unit-swap flow does NOT dispatch any SMS, WhatsApp, or email to the buyer. The only post-action artefacts are:

- Server-side `logger.info` trace (L269).
- Redis cache invalidation for old + new unit.
- Audit-log row (see §9).
- Admin-facing UI toast — success ("Unit swapped successfully") or error message.

> The buyer will only see the changed unit on their portal the next time they reload — there is no proactive notification.

## 9. Audit & Logging

- **Audit action emitted:** `auditActions.ADMIN_UNIT_SWAP` (backend-recorded on successful swap).
- **Audit payload (expected):** admin user ID, registrationUnitId, old unit (unitId, towerId, typologyId), new unit (unitId, towerId, typologyId), timestamp. Exact field set is enforced server-side; frontend does not control payload.
- **No** frontend-side audit emission; the PUT request is the sole signal.

## 10. How to Use

1. **Confirm campaign state:** Before opening the modal, ensure NO allocation campaign is currently active for the project. If one is open, close it via the Allocation module first — otherwise the backend will reject the swap with `Cannot swap unit when campaign is active`.
2. **Clear Mavis booking row:** Delete the Mavis (ERP) booking entry for this registration outside the portal. If the row still exists, the backend will reject the swap.
3. **Clear CRM activity records:** Delete the Activity records — Token, Form, and Booking — for the current allotment in the CRM. (The backend resets the related flags on the registrationUnit automatically, but the external CRM records must be cleaned manually.)
4. **Find the booked registration:** In the Customers table, locate the row whose Allocation Status is "Booked Online" or "Booked Offline" and whose allotted unit needs to change.
5. **Open the action menu:** Click the three-dot (…) icon in the Actions column. The **Unit swap** option appears only for booked rows.
6. **Review the current allotment:** The modal opens showing Registration Number, Current Unit (e.g. `2404-Crown`), and Apartment Type / carpet area. Verify this is the correct buyer and unit.
7. **Pick the new tower:** Open the Tower dropdown. Towers are fetched on first open. Select the destination tower. (Note: the list includes inactive towers; pick carefully.)
8. **Pick the new unit:** Open the Unit dropdown — populated for the chosen tower with units in status `AVAILABLE` or `RESERVED`. Select the new unit. (Typology is NOT filtered — confirm the new typology is acceptable before submit.)
9. **Attest cleanup:** Tick both checkboxes — "Activity - Token, Form, Booking deleted" and "Mavis - Booking entry deleted". Submit remains disabled until both are ticked and a new unit is selected.
10. **Submit:** Click **Submit**. On success the toast "Unit swapped successfully" appears, the modal closes, and the Customers table refreshes — the row now shows the new allotted unit.

> **Warning 1:** Unit Swap has no in-app undo. Verify the new unit and the attested cleanup before submitting.

> **Warning 2:** The buyer's milestone payment schedule is NOT automatically regenerated after swap. If the new unit's typology / pricing differs, the existing schedule remains and may be stale. This is a known open issue pending product decision.

> **Warning 3:** No SMS, WhatsApp, or email is sent to the buyer on swap. Communicate the change out-of-band if required.

---

## Open Questions / TBC

Most TBCs from the initial draft have been resolved through Tech Lead source-code review on 2026-05-21:

| # | Original TBC | Resolution | Status |
|---|--------------|-----------|--------|
| 1 | Eligible target-unit filtering (typology / FAV-equivalent / any) | `towerId + projectId + status IN (AVAILABLE, RESERVED)` — **no typology filter** (§5.1) | **Closed** |
| 2 | Old unit status transition (`BOOKED` → `AVAILABLE` vs `RESERVED`) | Previous unit → `RESERVED` (if not consumed elsewhere); new unit → `BOOKED` (§6 Rule 11) | **Closed** |
| 3 | Milestone schedule / payment transaction auto-update on swap | **NOT regenerated** — backend call is commented out with "need to discuss" note (§6 Rule 9) | **OPEN — product decision required** |
| 4 | Eligibility beyond `isBooked` — open allocation window? specific unit status? | UI: `isBooked` only. Backend: no active campaign + no Mavis row + target AVAILABLE/RESERVED + not linked elsewhere (§3.2) | **Closed** |
| 5 | Buyer notification (SMS / WhatsApp / email) on swap | None — no notification dispatch in backend flow (§8) | **Closed** |
| 6 | Audit log payload | `auditActions.ADMIN_UNIT_SWAP` emitted server-side (§9) | **Closed** |

**Remaining genuinely open item:**

| Item | Why Open | Owner |
|------|----------|-------|
| Should the milestone payment schedule be regenerated on unit swap (especially when typology / pricing differs)? | Backend developer left the regeneration call commented with "need to discuss". Tech decision pending product input. | Product + Engineering |
