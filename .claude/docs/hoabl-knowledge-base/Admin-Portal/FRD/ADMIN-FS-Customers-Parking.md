---
type: feature-spec
portal: Admin Portal
module: Customers
feature: Update Parking Details
updated: 2026-05-21
status: complete
---

# Admin Portal — Customers Module: Update Parking Details Feature Specification

**Related:** [[ADMIN-BRD-Customers]] | [[ADMIN-FS-Customers]] | [[SHARED-WF-milestone-payments]]

---

# Feature: Update Parking Details (from Customers Row)

## 1. Objective
Allow admins to enable or disable additional parking on a buyer's booked unit and record the parking slot count and the per-slot amount. The system uses these inputs to update the parking pool capacity for the typology and the buyer's per-unit parking allocation.

## 2. Scope
- Row-level action available via the three-dot (…) action menu in the Customers registration table.
- Operates at `RegistrationUnit` level — parking is tracked per allotted unit (sub-registration), not per parent Registration.
- **Out of scope:** how the parking amount flows into milestone schedules / demand letters / final agreement value (parking is not currently re-projected into milestone tracking on update — see §6 Rule 6).

## 3. Eligibility / Preconditions
1. **Row must be Booked:** Menu item is rendered only when `isBooked === true`, i.e. `record.status === 'WINNER'` AND `record.allocationTransactionId !== null`.
2. **Existing state pre-fills modal:** If the registration unit already has parking enabled (`isParkingSelected = 1`), the modal opens with the toggle ON and existing `parkingCount` / `parkingAmount` populated.

## 4. UI Changes

### 4.1 Menu Entry
- New entry in the row's three-dot (…) dropdown: **"Update Parking Details"** (key `update-parking`).
- Selecting it opens the Parking Details modal (width 600).

### 4.2 Parking Details Modal

| Element | Content / Behaviour |
|---------|--------------------|
| Title | "Parking Details" |
| Registration Number (read-only) | `selectedRecord.unitRegistrationNumber` |
| Apartment Type (read-only) | If status WINNER: `<allotedApartmentType> (<allotedCarpetArea> sq.ft.)`; else `<regApartmentType> (<carpetArea> sq.ft.)` |
| Additional Parking Enabled | Toggle switch (`Enable` / `Disable`) — required |
| Parking Count | Integer input, min 1, max 500, integers only — shown only when toggle ON, required when ON (frontend-enforced) |
| Parking Amount | Numeric input, decimals allowed — shown only when toggle ON, required when ON (frontend-enforced) |
| Total Parking Amount (computed) | Display only — `parkingCount × parkingAmount` |
| Submit button | Submits via Formik / Yup validation |

### 4.3 Toggle OFF behaviour
- When the admin flips the toggle from ON to OFF, both `parkingCount` and `parkingAmount` are cleared (`setFieldValue(..., null)`) immediately, before submit.

## 5. Form Details

| Field | Type | Mandatory | Validation |
|-------|------|-----------|------------|
| `additionalParkingEnabled` | Boolean (Switch) | Yes | Frontend: `required('Additional parking setting required')`. Backend: `boolean().required('Parking settings required')` |
| `parkingCount` | Number (InputNumber) | Conditional (frontend) | Frontend (Formik Yup): `required` + `min(1)` + `max(500)` + integer regex `^\d*$` when `additionalParkingEnabled === true`; `notRequired()` otherwise. Backend: `notRequired()` (see §6 Rule 1). |
| `parkingAmount` | Number (Input) | Conditional (frontend) | Frontend (Formik Yup): `required` + `positive()` + non-negative-decimal regex `^\d*\.?\d*$` when `additionalParkingEnabled === true`; `notRequired()` otherwise. Backend: `notRequired()` (see §6 Rule 1). |

### 5.1 Submission Payload
```json
{
  "event": "update-parking",
  "payload": {
    "additionalParkingEnabled": true,
    "parkingCount": 2,
    "parkingAmount": 250000
  }
}
```

## 6. Validations & Business Rules

### 6.1 Frontend vs Backend Enforcement (resolved — discrepancy documented)

**This is a known split-enforcement model. Test cases must cover both layers.**

| Rule | Frontend (Formik Yup) | Backend (Yup schema) | Backend (service logic) |
|------|----------------------|----------------------|-------------------------|
| `additionalParkingEnabled` is boolean and required | ✓ required | ✓ `boolean().required('Parking settings required')` | Used to set `isParkingSelected` |
| `parkingCount` required when toggle ON | ✓ `required` + `min(1)` + `max(500)` + integer | ✗ `notRequired()` | Coerced via `Number(parkingCount) \|\| 0` |
| `parkingAmount` required when toggle ON | ✓ `required` + `positive()` + non-negative decimal | ✗ `notRequired()` | Coerced via `Number(parkingAmount) \|\| 0` |
| Delta (`nextCount - currentCount`) must be non-zero | — | — | ✓ throws `400 'No change in parking count'` (L319–321) |
| Delta must not exceed available parking pool | — | — | ✓ throws `400 'Available parking count (X) is less than required (Y)'` (L323–327) |

**Numbered business rules:**

1. **Server-side validation gap (known):** Backend Yup marks `parkingCount` and `parkingAmount` as `notRequired()` (`admin.validations.js` L238–242). Backend business logic does NOT independently re-check that `parkingCount ≥ 1` or `parkingAmount > 0` when the toggle is ON. A bypass-the-UI client sending `{ additionalParkingEnabled: true, parkingCount: 0, parkingAmount: 0 }` will be coerced to `0/0` and rejected only if the delta is zero — otherwise accepted. This is enforced only by the **frontend Formik layer**. Test cases at the API layer must reflect this gap.
2. Available only on Booked rows (`isBooked === true`).
3. When `additionalParkingEnabled = true` via the UI: `parkingCount` must be ≥ 1, an integer, capped at 500; `parkingAmount` must be a positive number (frontend enforcement).
4. When `additionalParkingEnabled = false`: both fields are cleared client-side and not validated.
5. **Delta check (backend):** The backend computes `delta = Number(parkingCount) || 0 - currentParkingCount`. If `delta === 0`, the request is rejected with `400 'No change in parking count'`. This implicitly blocks no-op submissions and the toggle-on-without-count-change edge case.
6. **Pool capacity check (backend):** The backend reads `availableParkingSpots` for the typology pool. If `delta > availableParkingSpots`, returns `400 'Available parking count (X) is less than required (Y)'`. Pool decrements by `delta` on success.
7. Total parking amount shown in the modal is purely informational — backend computes the actual stored amount as the raw `parkingAmount` value (per-slot price). The total is not posted as a separate field.
8. The action overwrites previous parking values for the registration unit — there is no history kept in the UI.
9. Data-model anchors on `RegistrationUnit`: `isParkingSelected` (TINYINT), `parkingCount` (INTEGER), `parkingAmount` (numeric — per-slot price). On success the backend writes:
   ```js
   isParkingSelected = Boolean(additionalParkingEnabled)
   parkingCount = nextCount
   parkingAmount = Number(parkingAmount) || 0
   ```
10. **Milestone schedule is NOT regenerated** on parking update — the backend `updateParkingDetails` flow is pure DB writes (registrationUnit + parking pool); no milestone regeneration call.

## 7. System Actions on Submit

1. `PUT apiUrls.admin.registrationUnitUpdate.replace(':id', registrationUnitId)` with body per §5.1.
2. Backend validates against `registrationUnitUpdateEventSchemas['update-parking']` (boolean required; count/amount notRequired).
3. Backend service `updateParkingDetails` (L285–347) runs delta + pool checks; on pass, persists to DB.
4. On 2xx: toast **"Parking details updated successfully"**; modal closes; selected record cleared; customer table refetches with current filters & pagination.
5. On error: toast with server `error.response.data.message` if present, else "Failed to update parking details".

**Server-side side-effects:**
- `RegistrationUnit.isParkingSelected`, `parkingCount`, `parkingAmount` updated.
- Parking pool `availableParkingSpots` decremented by `delta` for the typology (or incremented if delta is negative — i.e. parking count reduced).
- `auditActions.ADMIN_UPDATE_PARKING` audit log emitted (see §9).
- **No** milestone payment schedule regeneration.
- **No** Kaleyra SMS, WhatsApp, or email dispatched (see §8).

## 8. Notifications

**Buyer-facing notifications: NONE.**

Source-code scan (`updateParkingDetails` L285–347 + grep across `backend/src` for `kaleyra|sendSms|sendWhatsapp|sendEmail|sendNotification`) confirms: the parking-update flow does NOT dispatch any SMS, WhatsApp, or email to the buyer. The flow is pure DB writes — parking pool decrement + registrationUnit save. The only post-action artefacts are:

- Audit log row (see §9).
- Admin-facing UI toast — success ("Parking details updated successfully") or error message.

> The buyer will only see the changed parking on their portal the next time they reload — there is no proactive notification.

## 9. Audit & Logging

- **Audit action emitted:** `auditActions.ADMIN_UPDATE_PARKING` (backend-recorded on successful update).
- **Audit payload (expected):** admin user ID, registrationUnitId, before state (`isParkingSelected`, `parkingCount`, `parkingAmount`), after state, delta applied to pool, timestamp. Exact field set is enforced server-side; frontend does not control payload.

## 10. How to Use

1. **Find the booked registration:** In the Customers table, locate the row whose parking needs to be enabled, updated, or removed. Allocation Status must be "Booked Online" or "Booked Offline".
2. **Open the action menu:** Click the three-dot (…) icon in the Actions column. The **Update Parking Details** option appears only for booked rows.
3. **Review header info:** The Parking Details modal opens showing Registration Number and Apartment Type / carpet area. Verify this is the correct buyer.
4. **Toggle Additional Parking:**
   - To **enable / update**: flip the toggle ON. The Parking Count and Parking Amount fields appear.
   - To **disable**: flip the toggle OFF. Both fields are hidden and cleared.
5. **Enter parking count:** Integer between 1 and 500 (e.g. `2` for two slots). The frontend rejects non-integers, values < 1, and values > 500.
6. **Enter parking amount:** Per-slot amount (e.g. `250000`). Must be a positive number. The Total Parking Amount preview updates automatically (`count × amount`).
7. **Submit:** Click **Submit**. The backend then checks:
   - The new count differs from the current count (otherwise: "No change in parking count").
   - The typology parking pool has enough free spots (otherwise: "Available parking count (X) is less than required (Y)").
8. **On success:** Toast "Parking details updated successfully" appears, the modal closes, and the Customers table refreshes. The typology's available parking pool is decremented (or incremented on reduction).

> **Note 1:** Disabling parking clears both count and amount on the registration unit. There is no in-app undo — re-enable and re-enter values to restore.

> **Note 2:** Updating parking does NOT regenerate the buyer's milestone schedule. If the parking amount feeds into demand letters or costing, those must be regenerated separately by the relevant module.

> **Note 3:** No SMS, WhatsApp, or email is sent to the buyer on parking update. Communicate the change out-of-band if required.

---

## Open Questions / TBC

All TBCs from the initial draft have been resolved through Tech Lead source-code review on 2026-05-21:

| # | Original TBC | Resolution | Status |
|---|--------------|-----------|--------|
| 1 | Whether updating parking auto-regenerates milestone schedule | **No** — pure DB writes, no regeneration call in backend flow (§6 Rule 10) | **Closed** |
| 2 | `parkingAmount` semantics — per-slot or total | Per-slot. Backend persists raw `parkingAmount` as per-slot price (§6 Rule 9) | **Closed** |
| 3 | Buyer notification on parking update | None — no notification dispatch (§8) | **Closed** |
| 4 | Backend conditional validation when toggle ON | **Gap confirmed** — backend Yup is `notRequired` and service coerces to 0; only frontend Formik enforces required+positive. Documented in §6 Rule 1 as known server-side gap. | **Closed (gap documented)** |
| 5 | Whether parking changes after first demand letter / disbursement are restricted | No such gate in source — admin can update parking at any time on a booked row | **Closed** |
| 6 | Audit log payload | `auditActions.ADMIN_UPDATE_PARKING` emitted server-side (§9) | **Closed** |

No remaining open questions for Update Parking Details.
