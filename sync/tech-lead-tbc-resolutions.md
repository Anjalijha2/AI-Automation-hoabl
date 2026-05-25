# Tech Lead — TBC Resolutions for Admin Customers Feature Specs

**Date:** 2026-05-21
**Author:** Tech Lead Agent
**For consumption by:** BA Agent (resolve TBCs in 3 new FS files; update test cases accordingly)
**Source-of-truth basis:** application source code only (BRD/FRD considered only where source confirms)

---

## TBC #1 — Milestone Offline Payment Fields (PayDrawer)

**Status:** RESOLVED
**Source:** `source-code/admin-sm-cp-portal/src/routes/Private/admin/milestone/drawers/PayDrawer.jsx` L105–138; `MilestonePage.jsx` L142–157
**Endpoint:** `apiUrls.adminMilestonePaymentOffline` invoked via `expressPostFormData` (`multipart/form-data`)

**Multipart POST payload fields (FormData):**

| Field | Source/Form Origin | Type | Required | Notes |
|---|---|---|---|---|
| `registrationNumber` | URL query param `?rn=...` (selectedRecord) | string | yes | injected from page route, not user-editable |
| `milestoneKey` | selectedRecord | string | yes | e.g. `ml-or`, `ml-hcf` |
| `milestoneId` | selectedRecord | int | yes | |
| `amount` | Form field "Amount" (InputNumber) | number | yes | validators: >0; cannot exceed payable; GST mode must equal `gstOutstanding` exactly (tolerance 0.01) |
| `paymentType` | Computed by `calculatePaymentType()` L91–103 | int code | yes (auto) | hcf: 4 full / 5 partial; gst-only: 3; principal: 1 full / 2 partial |
| `paymentMethod` | Form field "Payment Method" Select | string | yes | options: `NEFT`, `Cheque`, `Cash`, `CC` (Credit Card), `DC` (Debit Card), `UPI` |
| `transactionId` | Form field "Transaction ID" Input | string | yes | |
| `transactionDate` | Form field "Transaction Date & Time" DatePicker | string | yes | format `YYYY-MM-DD HH:mm:ss`; disabled if after `dayjs()` (future-date guard) |
| `comments` | Form field "Comments (Optional)" TextArea | string | no | max 500 chars; sent as empty string when absent |
| `paymentProof` | Upload (single file) | File | yes | accept `.pdf,.jpg,.jpeg,.png`; max 1 file; submit blocked if empty (L106–109) |

**Additional UI logic:**
- "Payment For" radio (Principal / GST) — shown only when **not** an HCF milestone AND at least one of principal/gst outstanding > tolerance (L199–209).
- For HCF milestones (`milestoneKey === 'ml-hcf'`): no Payment-For radio; amount editable; paymentType is 4 or 5 based on whether amount ≥ total outstanding.
- GST mode: amount is auto-set and `disabled` (L252); must equal `gstOutstanding`.
- Payment Proof helper text: `Allowed formats: PDF, JPG, PNG (Max: 5MB)` (L275). Note source enforces format via `accept` but does NOT enforce 5MB size client-side — copy is informational.

---

## TBC #2 — Milestone Status Pill Logic (inverted)

**Status:** RESOLVED — BUG CONFIRMED IN SOURCE
**Source:** `source-code/admin-sm-cp-portal/src/routes/Private/admin/milestone/MilestonePage.jsx` L218–253 (PAYMENT STATUS column render)

**Actual code (L224–252):**
```js
const total = rupeeToNumber(item?.totalAmount);
const outstanding = rupeeToNumber(item?.totalOutstanding);
const balance = total - outstanding;          // balance = amount already PAID
if (!checkPaymentDate(item?.startDate)) return null;           // future milestone → blank
if (item.milestoneKey === 'ml-or' && total === 0) return '-';
else if (balance <= 0) → <span class="pending-payment-status"><IoMdTime/> Pending</span>
else if (balance < total) → <span class="partial-payment-status"><IoMdCard/> Partial Payment</span>
else → <span class="paid-payment-status"><IoMdCheckmarkCircle/> Paid</span>
```

**Definitive answer:**
- `balance` is computed as `total - outstanding`, i.e. it represents the amount **already paid**, NOT the amount remaining.
- Therefore `balance <= 0` actually means "nothing has been paid yet" → the label `Pending` is semantically **correct**.
- `balance < total` (i.e. some paid but not all) → `Partial Payment` ✓ correct.
- `balance >= total` (paid in full) → `Paid` ✓ correct.

**Conclusion:** The logic is NOT inverted. The variable name `balance` is misleading (it is actually `paid`), but the labels render correctly:
- 0 paid → "Pending" (with clock icon)
- 0 < paid < total → "Partial Payment" (with card icon)
- paid ≥ total → "Paid" (with check-circle icon)
- Future-dated milestone (`startDate` in the future) → cell renders nothing (`null`)
- `ml-or` (On-Registration) milestone with total = 0 → cell renders `-`

BA should NOT raise a code bug. Test cases must assert the labels above keyed off (paid vs. outstanding), not off a misread of the variable name.

---

## TBC #3 — Buyer Notifications for Unit Swap / Update Parking / View Milestones

**Status:** RESOLVED
**Sources scanned:**
- `source-code/backend/src/services/registration-unit.service.js` (full file, esp. `swapRegistrationUnit` L69–282, `updateParkingDetails` L285–347)
- `grep` for `kaleyra|sendSms|sendWhatsapp|sendEmail|sendNotification|allocationNotificationService` across `backend/src`

**Findings:**

| Action | Backend Endpoint | Notification Calls Found? |
|---|---|---|
| Unit Swap | `PUT /registration-unit/:id` event=`unit-swap` → `swapRegistrationUnit` | **NONE.** No Kaleyra SMS, no WhatsApp, no email. Only `logger.info` (L269) + Redis cache updates. |
| Update Parking | `PUT /registration-unit/:id` event=`update-parking` → `updateParkingDetails` | **NONE.** Pure DB writes (parking pool decrement + registrationUnit save). No notification import or call. |
| View Milestones | `navigate('/admin/milestone?...')` — front-end navigation only; calls `expressGet(apiUrls.adminUserUnitDetail)` for read. | **NONE.** Read-only GET. No mutation, no notification trigger. |

**Note:** `allocationNotificationService` is imported into `registration-unit.service.js` (L23) but is only invoked in unrelated branches (`L879` and a commented-out `L1059`) — neither sits in the unit-swap or parking flows.

**Conclusion:** No buyer-side SMS, WhatsApp, or email is dispatched for any of these three admin actions. Test cases must assert NEGATIVE on notifications (no SMS/email expectation). Audit log (`auditActions.ADMIN_UNIT_SWAP`, `ADMIN_UPDATE_PARKING`) is the only post-action artefact.

---

## TBC #4 — Unit Swap Target-Unit Dropdown Filtering

**Status:** RESOLVED
**Sources:**
- Front-end fetch: `CustomerTable.jsx` L276–305 (`fetchTowers`, `fetchUnits`)
- Backend tower handler: `tower.service.js` L17–25 `adminUnitSwapTowers()`
- Backend unit handler: `unit.service.js` L17–30 `adminUnitSwapUnits({ towerId })`
- Backend route dispatch: `common.service.js` L888, L977

**Backend query for unit dropdown (`unit.service.js` L21–28):**
```js
Unit.findAll({
  attributes: ['id', 'unitId', 'unitNo', 'status', 'frontendTypologyName'],
  where: { towerId, projectId: projectCode, status: { [Op.in]: ['AVAILABLE', 'RESERVED'] } },
  order: [['floorNumber', 'ASC'], ['unitNo', 'ASC']],
});
```

**Definitive answer:** Filter is **`towerId` + `projectId` + `status IN ('AVAILABLE', 'RESERVED')`** ONLY. There is NO typology filter, NO floor filter, NO carpet-area filter. Admin can swap to any AVAILABLE or RESERVED unit in the chosen tower, regardless of typology — including a different apartment type or carpet area.

**Implications for test cases:**
- Positive: any AVAILABLE/RESERVED unit appears in dropdown.
- Negative: units with status `BOOKED`, `SOLD`, `BLOCKED`, etc. are excluded.
- Typology-mismatch path is **valid by code**; if BRD says it should be blocked, that is a missing backend rule — raise as a gap.
- Towers list (`tower.service.js` L17–25) is unfiltered by `isActive` — admin sees ALL towers in project including inactive ones.

---

## TBC #5 — Milestone / Payment Schedule Regeneration on Unit Swap

**Status:** RESOLVED
**Source:** `source-code/backend/src/services/registration-unit.service.js` L208–211 (inside `swapRegistrationUnit`)

**Exact code:**
```js
// need to discuss if schedule needs to be changed
// await insertPaymentScheduleandUpdateMilestone(registrationUnit.id, transaction);

await transaction.commit();
```

**Definitive answer:** Backend does **NOT** auto-regenerate the milestone / payment schedule on Unit Swap. The regeneration call (`insertPaymentScheduleandUpdateMilestone`) is **commented out** with developer note "need to discuss if schedule needs to be changed".

**What DOES happen on swap (`swapRegistrationUnit` L161–189):**
- `registrationUnit.unitId`, `towerId`, `typologyId`, `allocatedTower`, `allocatedFloor`, `allocatedUnit` updated to new unit values.
- Reset flags: `bookingTokenActivitySubmitted=false`, `mavisBookingCreated=false`, `mavisUnitUpdated=false`, `lsqBookingActivityId=null`, `lsqBookingFormActivityId=null`, `isKycPdfSubmitted=false`.
- If KYC submitted: also reset `bookingFormActivitySubmitted`, `bookingActivitySubmitted`, `mavisBookingFinalUpdated`.
- If KYC not submitted (self-KYC): reset `selfKycSubmitted`, `selfKycBookingActivitySubmitted`, `selfKycFinalSubmitted`.
- New unit status → `BOOKED`; previous unit (if no other consumers) → `RESERVED`.
- Pre-condition gates (L77, L99–105): blocks swap if active campaign exists OR Mavis booking row still exists.

The admin's two attestation checkboxes ("Activity - Token, Form, Booking deleted" / "Mavis - Booking entry deleted") are **manual confirmations only** — the backend does not enforce them; it does enforce the Mavis booking check via `mavisService.findBookingRowId` (L99–105). Token/Form/Booking activity reset is automatic (the flag resets above), but the activity records themselves must be deleted by the admin via LSQ/Mavis manually before swap.

**Conclusion for test cases:** Payment schedule and milestone tracking from the original unit are preserved post-swap (potentially stale w.r.t. new unit's typology pricing — BRD gap to flag). No new schedule rows are inserted.

---

## TBC #6 — Parking Validation: Frontend vs. Backend Enforcement

**Status:** RESOLVED — DISCREPANCY CONFIRMED
**Sources:**
- Frontend: `CustomerTable.jsx` L129–142 (Formik Yup schema)
- Backend: `backend/src/validations/admin.validations.js` L234–242 (request schema)
- Backend logic: `registration-unit.service.js` L285–347 (`updateParkingDetails`)

**Frontend Yup schema (CustomerTable.jsx L129–142):**
```js
parkingCount: Yup.number('Enter valid Parking Count ').when('additionalParkingEnabled', {
  is: true,
  then: ...required(...)..min(1)..max(500)...
  otherwise: ...notRequired()...
})
parkingAmount: Yup.number('Enter valid Parking Amount').when('additionalParkingEnabled', {
  is: true,
  then: ...required(...).positive()...
  otherwise: ...notRequired()...
})
```

**Backend Yup schema (admin.validations.js L238–242):**
```js
'update-parking': object({
  additionalParkingEnabled: boolean().required('Parking settings required'),
  parkingCount: number().notRequired(),
  parkingAmount: number().notRequired(),
}),
```

**Backend business logic (`updateParkingDetails` L289–347):**
- Reads `{ additionalParkingEnabled, parkingCount, parkingAmount }` from `body.payload`.
- Computes `nextCount = Number(parkingCount) || 0`, `delta = nextCount - currentCount`.
- L319–321: throws `400 'No change in parking count'` if `delta === 0` — implicitly blocks "enable toggle without count change" and "disable when already disabled".
- L323–327: throws `400 'Available parking count (X) is less than required (Y)'` if pool insufficient.
- L336–338: writes `isParkingSelected = Boolean(additionalParkingEnabled)`, `parkingCount = nextCount`, `parkingAmount = Number(parkingAmount) || 0`.

**Definitive answer:** Only the **frontend Formik layer enforces** the "count + amount required when toggle ON" rule. The backend Yup schema marks both as `notRequired()` and the service coerces missing values to `0`. The server-side checks that DO exist are:
1. `additionalParkingEnabled` must be boolean (required).
2. Delta must be non-zero (`'No change in parking count'`).
3. Delta must not exceed `availableParkingSpots` for the typology pool.

**Implications:**
- A bypass-the-UI client could send `additionalParkingEnabled=true` with `parkingCount=0` and `parkingAmount=0` — backend would accept the boolean toggle change but throw "No change in parking count" if previous parkingCount was already 0; OR set `parkingCount=0, parkingAmount=0` if previous was non-zero (functionally equivalent to disabling).
- Backend does **not** independently validate count ≥ 1 or amount > 0 when toggle is ON. This is a server-side validation gap — BA may want to raise.
- Test cases:
  - UI-level (Formik) negative tests for empty/zero/over-500 count/amount when toggle ON are valid.
  - API-level negative test: bypassing UI with `enabled=true, count=0, amount=0` is NOT rejected by Yup; gating depends on `delta` only.

---

## TBC #7 — "Allocation Opened" Banner

**Status:** RESOLVED
**Source:** `source-code/admin-sm-cp-portal/src/routes/Private/admin/dashboard/CustomerTable.jsx` L1602

**Exact code:**
```jsx
<Table
  ...
  title={() => <div style={{ fontWeight: 600 }}>Allocation Opened</div>}
  ...
/>
```

**Definitive answer:** The text "Allocation Opened" is **static hardcoded** inline JSX. It is **not** bound to any state, prop, API field, or feature flag. It renders unconditionally as the Ant Design `<Table>` `title` slot above the Registrations table. There is no toggle, no campaign-status binding, no role-conditioned visibility.

**Implications:**
- The text is always present; tests can assert exact-text match safely.
- The label is misleading if no campaign is open — BA should flag if FS/BRD intends this to be data-driven.
- Note: A separate buyer-portal banner system uses similar text in `buyer-portal/src/components/Home/AllocationOpenedBanner copy.js` and `AllocationOpenedTable copy.js` — those are in scope of buyer portal, NOT admin, and are unrelated.

---

## TBC #8 — Unit Swap Eligibility Beyond `isBooked`

**Status:** RESOLVED
**Sources:**
- Front-end gate: `CustomerTable.jsx` L1090, L1114–1132 (menu item visibility)
- Back-end gates: `registration-unit.service.js` L77 (campaign), L93–95 (same-unit), L99–105 (Mavis), L118–125 (target unit availability), L128–135 (typology lookup), L138–147 (conflict registration)

**Front-end gate (CustomerTable.jsx L1090):**
```js
const isBooked = record.status === 'WINNER' && record.allocationTransactionId !== null;
```
Only when `isBooked === true` are the three menu items (View Milestones, Unit swap, Update Parking Details) added to the row's three-dot dropdown (L1114–1132). There are **no other front-end conditions** (no open-allocation check, no feature flag, no role check at this layer).

**Back-end runtime gates in `swapRegistrationUnit`:**

| Gate | Code Ref | Failure |
|---|---|---|
| `targetUnitId` provided | L73–75 | `400 'Target unit ID is required'` |
| **No active allocation campaign exists for project** | L77–79 `AllocationCampaignService.checkAnyActiveCampaignExists(projectId)` | `400 'Cannot swap unit when campaign is active'` |
| RegistrationUnit row exists | L84–91 | `404 'Registration unit not found'` |
| Target unit ≠ current unit | L93–95 | `400 'Registration unit is already linked to the provided unit'` |
| **No active Mavis booking row** for the registration's booking ID | L99–105 `mavisService.findBookingRowId` | `400 'Mavis booking still exists, please clear that step first'` |
| Registration row exists | L107–114 | `404 'Registration not found'` |
| Project configured | L116, `getProjectData` L60–67 | `400 'Project not configured'` |
| **Target unit is `AVAILABLE` or `RESERVED`** | L118–126 | `404 'Requested unit not found'` if status is anything else (BOOKED, SOLD, BLOCKED, etc.) |
| Target unit has a typology mapped in project | L128–136 | `404 'Requested unit typology not found'` |
| **No other registration is linked to the target unit** | L138–147 | `409 'Requested unit is already assigned to another registration'` |

**Definitive answer:** Eligibility is a 2-layer composite. The UI shows the menu **only** when `status === 'WINNER' && allocationTransactionId !== null`. The backend then independently enforces:
1. No active campaign for the project (open allocation window **blocks** swap).
2. No Mavis booking row exists yet (admin must delete it externally first).
3. Target unit status ∈ `{AVAILABLE, RESERVED}`.
4. Target unit has a valid typology mapping.
5. Target unit not already linked to another registration.

There is **no feature flag** for unit-swap. There is **no specific unit-status constraint beyond AVAILABLE/RESERVED**. The "open allocation window" condition is **inverted**: an open campaign **blocks** swap, it does not require one.

**Test cases must cover:**
- Negative: swap during an active campaign → 400.
- Negative: swap when Mavis booking still exists → 400 (cannot simulate easily in UAT without seeded Mavis row).
- Negative: target unit is BOOKED → 404.
- Negative: target unit already linked to another reg → 409.
- Positive: target unit AVAILABLE, no campaign, no Mavis row → 200 with `'Registration unit swapped successfully'`.

---

## Locator Map Updates (v1.5.0)

File: `locators/admin/locator-map.json` (under `customers.*`).

Added 19 new entries:

| Key | Group |
|---|---|
| `viewMilestonesMenuItem`, `unitSwapMenuItem`, `updateParkingMenuItem` | Three-dot menu items |
| `cancelUnitModal`, `cancelUnitAttestation1`, `cancelUnitAttestation2`, `cancelUnitConfirmBtn` | Cancel Unit modal |
| `unitSwapModal`, `unitSwapTowerDropdown`, `unitSwapUnitDropdown`, `unitSwapAttestation1`, `unitSwapAttestation2`, `unitSwapSubmitBtn` | Unit Swap modal |
| `updateParkingModal`, `parkingToggle`, `parkingCountInput`, `parkingAmountInput`, `parkingPreviewText`, `updateParkingSubmitBtn` | Update Parking modal |

Each entry carries primary + fallback selector, aria role, and source line ref in changelog. No existing entries were deleted or altered (additive only). Version bumped 1.4.0 → 1.5.0.

---

## Summary Table for BA Agent

| TBC | Verdict | Action for BA |
|---|---|---|
| 1. Offline payment fields | 11 multipart fields enumerated above | Update FS Feature §3 with full field list + validators |
| 2. Status pill inversion | Not inverted; variable name misleading but labels correct | Remove "BUG" framing from FS; document the 4 states + future-date null state |
| 3. Buyer notifications | NONE for swap/parking/view-milestones | Document explicit negative — no SMS/WA/email |
| 4. Unit-swap typology filter | NO typology filter; AVAILABLE/RESERVED only, any tower | Update test cases; flag typology-mismatch as backend gap if BRD disagrees |
| 5. Schedule regeneration | NOT regenerated; commented out in source | Document as known limitation; raise as gap if BRD requires regeneration |
| 6. Parking validation enforcement | Frontend Formik only; backend Yup is notRequired; backend only validates delta + pool capacity | Update API-layer negative tests; flag as server-side validation gap |
| 7. Allocation Opened banner | Static hardcoded text in admin portal | Document as static; assert exact text match |
| 8. Unit-swap eligibility | UI: `WINNER && allocationTransactionId !== null`. Backend: no active campaign + no Mavis row + target AVAILABLE/RESERVED + not linked elsewhere | Update eligibility section in FS; expand test matrix with 5 negative paths |
