# Admin Portal — Customers Module User Guide

**Audience:** Admin / Sales Manager Admin
**URL:** `https://uat-web.xrportal.in/admin/customers`
**Sources:** ADMIN-BRD-Customers.md · ADMIN-FS-Customers.md · ADMIN-FS-Customers-Milestones.md · ADMIN-FS-Customers-UnitSwap.md · ADMIN-FS-Customers-Parking.md
**Last Updated:** 2026-05-21

---

## Overview

The Customers page is the main operational dashboard for the admin team. It lists every buyer registration in the system with live KPI counts at the top and a searchable, filterable registration table below. From here you can cancel units, refund registrations, approve home loans, swap units, update parking, view milestone schedules, record offline payments, assign units, run bulk cancellations, and download an Excel export of all registrations.

This page loads automatically after login. You can also reach it from the left sidebar → **Customers**, or directly at `/admin/customers`.

---

## Page Layout (At a Glance)

1. **KPI Cards** (top row, six tiles) — live counts.
2. **Controls bar** — Cancel Bulk Units, Filter, Refresh, Download, Search by Phone.
3. **"Allocation Opened" banner** — static label rendered as the table title.
4. **Registration table** — one row per sub-registration; Actions column has a trash icon + three-dot menu.
5. **Pagination** — bottom of table.

---

# Feature 1 — Registration Dashboard (KPI Cards + Table)

### What it does
Gives a real-time at-a-glance view of all buyer registrations across the active project. The six KPI cards summarise totals; the table below lists every registration record with status, KYC, home loan, and unit-allotment information.

### Preconditions
- Admin session.
- The page is the default landing route after login.

### How to use
1. Log in. The Customers dashboard loads automatically.
2. Read the six KPI tiles at the top:
   - **Registered** — sum of Booked Offline + Booked Online + Registered + Inactive statuses (NOT just "Registered" alone).
   - **Inactive Registrations**
   - **Cancelled Registrations**
   - **KYC Pending (Booked)** — buyers who paid + booked but haven't completed KYC.
   - **Confirmed (Paid + KYC)**
   - **Active Towers** — pulled live from the Config module.

   > **NOTE (CORRECTED 2026-05-21):** KPI tiles are computed by a separate aggregate query and always reflect **global project totals**. Applying a filter, search, or sort to the table below does NOT recompute the KPI numbers. (Source: `admin.controller.js` lines 127–193; Tech Lead spec §4.) The previously-defined `allotedCount` KPI is commented out in source — there is no "Alloted" tile and no `allotedCount` value in the API response.
3. Below the KPIs, the table heading shows the true total (e.g. "9,672 Registration Records").
4. Each row shows: Registration Details (number + date), Growth Partner, Phone, Home Loan Details, Confirmation Number, Allotted Unit, Allocation Status, Confirmation, Process Status, and Actions.
5. Sorted descending by created date — newest at top.

### Result
You have a live operational picture of every registration. KPI counts refresh as data changes (toggles in Config, new registrations, cancellations).

### Warning
The "Allocation Opened" label above the table is currently a static hardcoded label — it does NOT indicate whether an allocation campaign is actually open. Verify campaign state in the Allocation module if needed.

---

# Feature 2 — Search by Phone

### What it does
Filters the registration table down to records matching a buyer's phone number.

> **CORRECTED 2026-05-21 — phone-only search:** This field maps to the backend `globalSearch` query param and performs a `LIKE %value%` substring match against `User.phone` ONLY. The original OR branches that searched first_name, last_name, registration_number, confirmation_number, unit_no, and tower_name are commented out in source (lines 288–293, Tech Lead spec §7.1). Despite the broader-sounding label, the field cannot find a buyer by name, registration number, confirmation number, unit number, or tower name.

### Preconditions
- You know the buyer's phone number.

### How to use
1. Locate the **Search by Phone** field at the top right of the table.
2. Type the phone number (or any substring of it).
3. The table auto-filters to matching records (phone-only match).
4. To restore the full list, clear the field.

### Result
You can pinpoint a buyer's records by phone number. For lookups by name, registration number, confirmation number, unit, or tower, use the **Filter** panel instead — those use dedicated filter params (`registrationNumber`, `unitConfirmationNumber`, `unitNo`, `growthPartnerHvCode`).

---

# Feature 3 — Filter Registrations

### What it does
Narrows the table by Allocation Status, Home Loan, Confirmation, or KYC stage.

### Preconditions
- None.

### How to use
1. Click the **Filter** button above the table.
2. Select one or more criteria:
   - Allocation Status (API: `allotmentStatus`): Registered / Booked Online / Booked Offline / Waitlisted / Cancelled / Alloted — values are case-sensitive (`registered`, `booked_online`, `booked_offline`, `waitlisted`, `refunded`, `alloted`).
   - Home Loan Details (API: `hasHomeLoan=true|false`) — **completion-status only**. `true` means `HomeLoan.status='completed'`. `false` means `HomeLoan.status` is `in_progress` or NULL. The original loan_type/step branches are commented out (lines 307–315).
   - Confirmation (API: `paymentStatus`) — case-sensitive `Paid` / `Pending`.
   - Process Status (API: `kycStatus`) — case-sensitive `KYC Completed` / `KYC Pending`.
3. Click **OK** to apply.
4. Combine multiple filters — they intersect (AND logic).
5. Click **Reset Filters** to clear everything.

### Result
The table shows only rows matching every active filter. Total count in the table heading does not change; only the visible row set narrows.

> **CORRECTED 2026-05-21 — KPI tiles never recompute on filter:** KPI cards above the table reflect global project counts at all times. Applying any filter, search, or sort will NOT update the KPI numbers. The KPI aggregate query runs independently of the table query (Tech Lead spec §4).
>
> **CORRECTED 2026-05-21 — API param naming:** The Allocation Status filter is sent as `allotmentStatus` (NOT `allocationStatus`). Test fixtures and API specs must use the correct name. Accepted values (exact, case-sensitive, comma-separated): `alloted`, `waitlisted`, `booked_online`, `booked_offline`, `refunded`, `registered`.
>
> **UI Label → API Value mapping (Allocation Status filter):**
>
> | UI Label | API Value |
> |----------|-----------|
> | Registered | `registered` |
> | Booked Online | `booked_online` |
> | Booked Offline | `booked_offline` |
> | Waitlisted | `waitlisted` |
> | Cancelled/Refunded | `refunded` |
> | Alloted (campaign) | `alloted` |

---

# Feature 4 — Pagination

### What it does
Lets you move between pages and change how many rows show at once.

### Preconditions
- None.

### How to use
1. Scroll to the bottom of the table.
2. Adjust page size: click the dropdown ("10 / page" by default) → choose 10 / 20 / 50 / 100.
3. Navigate: click the page number, or use Previous / Next arrows.
4. Pagination text reads "1-10 of N items" (where N is the true total).

### Result
You can browse the full dataset comfortably.

---

# Feature 5 — Refresh Table

### What it does
Reloads the table data from the server without leaving the page.

### Preconditions
- None.

### How to use
1. Click **Refresh** above the table.
2. A brief loading state shows; then the table redraws.

### Result
The table reflects the latest server state — useful after another admin made a change.

---

# Feature 6 — Cancel Unit (Booked rows)

### What it does
Cancels just the allotted unit for a Booked row. Operates at **RegistrationUnit** level — the parent Registration and any sibling sub-registrations are not touched. No refund is issued through this flow.

### Preconditions / Eligibility
- Row's Allocation Status = **Booked Online** or **Booked Offline**.
- Internally: `status = WINNER` AND `allocationTransactionId` is present.
- You have completed off-system cleanup of CRM Activity (Token, Form, Booking) and the Mavis booking entry **before** triggering this — the modal requires you to attest both.

### How to use
1. Locate the Booked row in the table.
2. Hover the **trash icon** in the Actions column — the tooltip reads **"Cancel Unit"**.
3. Click the trash icon. A modal opens titled **"Please make sure that following actions are completed?"** with two attestation checkboxes:
   - **Activity - Token, Form, Booking deleted** (CRM cleanup)
   - **Mavis - Booking entry deleted** (ERP cleanup)
4. Both checkboxes must be ticked before the **Submit** button enables.
5. Click **Submit**.

### Result
- Toast: **"Unit cancelled successfully"**.
- Backend: `PUT adminCancelAllUnits` is called.
- The allotted unit is released; the row reflects the cancellation; no refund is issued.

### Warning
- Action is permanent and irreversible.
- The attestation checkboxes are admin self-declarations — the backend does NOT auto-delete the CRM Activity or Mavis booking. Failing to perform those external steps first will leave inconsistent state.

---

# Feature 7 — Cancel Registration (Registered / Waitlisted rows, ₹999 refund)

### What it does
Cancels a Registered or Waitlisted record (no unit allotted yet) and refunds the **₹999** registration confirmation amount to the buyer.

### Preconditions / Eligibility
- Row's Allocation Status = **Registered** or **Waitlisted**.
- No unit is allotted; only the ₹999 confirmation fee was paid.

### How to use
1. Locate the Registered/Waitlisted row.
2. Hover the **trash icon** — the tooltip reads **"Cancel Registration"**.
3. Click the trash icon. A confirmation popup shows the registration's unit details (if any) and the refund amount **₹999**.
4. Click the red **Cancel Registration** button.

### Result
- Toast: **"Registration refunded successfully"**.
- Backend: `PUT refundRegistrationUnit` is called.
- Row status → **Cancelled**.
- ₹999 refunded to the buyer's original payment method.

### Warning
- Permanent and irreversible. Do not use on a Booked row — that flow is "Cancel Unit" (Feature 6), which is a different action and does not refund.

---

# Feature 8 — Home Loan Approval

### What it does
Lets an admin manually approve a buyer's home loan application, making the HOME_LOAN offer discount eligible for that buyer during the next allocation campaign.

### Preconditions / Eligibility
- Buyer must have initiated a home loan application (loanType = self or easiloan).
- Current loanApprovalStatus is `pending` or `null`.
- This menu item is always available regardless of row status.

### How to use
1. Find the buyer's row.
2. Click the **three-dot (…) menu** in the Actions column.
3. Select **Home Loan Approval**.
4. In the modal, flip the toggle to **ON**.
5. Click **Save** / Submit.

### Result
- `RegistrationHomeLoan.loanApprovalStatus` → `admin_approved`; `approvalSource` → `admin`.
- HOME_LOAN offer becomes eligible for this buyer.
- **No buyer notification dispatched.** (Source-verified 2026-05-23: `updateHomeLoanDetails` in `registration-unit.service.js` lines 349–387 — zero SMS/WhatsApp/Email calls.)

---

# Feature 9 — View Milestones (Booked rows)

### What it does
Opens a dedicated milestone payment schedule page for the selected allotted unit, showing each milestone, dues, GST, principal, total amount, outstanding, payment status, and any recorded transactions. Read-and-review by design, but a payable row exposes an **Offline Payment** action so the page is not fully read-only.

### Preconditions / Eligibility
- Row's Allocation Status = Booked Online or Booked Offline (internally `status=WINNER && allocationTransactionId !== null`).
- The buyer must have submitted KYC for the schedule to exist; if KYC is pending, the milestone table will be empty.

### How to use
1. Locate the Booked row.
2. Click the **three-dot (…) menu** in Actions.
3. Select **View Milestones**. Navigates to `/admin/milestone?rn=<registrationNumber>&uid=<unitId>`.
4. The page opens with the Registration No. and Unit No. in a read-only header card, then lists every milestone in a table.
5. Read the **Payment Status** column:
   - **Pending** (clock icon) — nothing paid yet (balance ≤ 0).
   - **Partial Payment** (card icon) — some paid but not in full.
   - **Paid** (check-circle icon) — paid in full.
   - Empty cell — milestone start date is in the future.
   - `-` — special `ml-or` milestone with total = 0.
6. To view the transaction detail of a paid/partial milestone, click **View** in the DETAILS column — a right-side drawer opens classifying each payment as Full Payment / Partial Payment 1, 2, …
7. To record an offline payment on a payable row, click **Offline Payment** in the ACTION column — a drawer opens (see sub-flow below).
8. To return, click **Back to Customer Listing** (top-left). The dashboard reopens scrolled to the customer table.

### Offline Payment sub-flow
The drawer captures 11 multipart fields (one POST to `apiUrls.adminMilestonePaymentOffline`):
- Registration Number (auto-injected, read-only)
- milestoneKey, milestoneId (auto-injected)
- **Amount** — must be > 0; for GST, must equal `gstOutstanding` exactly (±0.01).
- paymentType — auto-computed (HCF full=4 / partial=5; GST-only=3; Principal full=1 / partial=2).
- **Payment Method** — NEFT / Cheque / Cash / CC (Credit Card) / DC (Debit Card) / UPI.
- **Transaction ID** — bank/cheque reference, required.
- **Transaction Date & Time** — format `YYYY-MM-DD HH:mm:ss`; cannot be in the future.
- **Comments** — optional (max 500 chars).
- **Payment Proof** — upload required; accepts PDF, JPG, PNG (helper text says max 5MB but size is not enforced client-side).
- For non-HCF milestones with both principal and GST outstanding > 0, an extra **Payment For** radio (Principal / GST) appears.

On success: toast "Offline payment submitted successfully" and the table refetches.

### Result
You have a complete view of what has been billed and paid for that unit. Offline collections can be recorded against the correct milestone.

### Warning
- View Milestones triggers **no buyer-facing notification** (no SMS, WhatsApp, or email). It is a read-only navigation.
- An empty milestone table on a Booked row almost always means KYC has not been submitted yet.

---

# Feature 10 — Unit Swap (Booked rows)

### What it does
Reassigns a buyer's already-allotted unit to a different unit within the project. Used when a buyer requests a unit change after booking, or to correct an operational error.

### Preconditions / Eligibility
- Row's Allocation Status = Booked Online / Booked Offline (`status=WINNER && allocationTransactionId !== null`).
- **No allocation campaign is currently OPEN for the project.** If a campaign is open, the backend blocks the swap with `400 "Cannot swap unit when campaign is active"` — Unit Swap is therefore **BLOCKED when allocation is open**.
- **No active Mavis booking row** exists for the buyer's booking — must be deleted externally first.
- A target unit exists in the chosen tower with status **AVAILABLE** or **RESERVED**.

### How to use
1. Before opening the modal, perform the manual off-system cleanup:
   - Delete the Activity records (Token, Form, Booking) for the current allotment.
   - Delete the corresponding Booking entry in Mavis (ERP).
2. Locate the Booked row in the table.
3. Click the **three-dot (…) menu** → **Unit swap**.
4. The Unit Swap modal opens with:
   - Read-only: Registration Number, Current Unit (e.g. `2404-Crown`), Apartment Type with carpet area.
   - **Tower** dropdown — opens the full project tower list (including inactive towers).
   - **Unit** dropdown — populated after a tower is chosen; lists units of any typology where status ∈ {AVAILABLE, RESERVED}.
   - Two attestation checkboxes: "Activity - Token, Form, Booking deleted" and "Mavis - Booking entry deleted".
5. Pick a tower → pick a new unit → tick both checkboxes. The **Submit** button enables only when all four conditions hold.
6. Click **Submit**.

### Result
- Toast: **"Unit swapped successfully"**.
- Backend: `PUT /registration-unit/:id` with body `{ event: "unit-swap", payload: { unitId: "<new>" } }`.
- Old unit's status → RESERVED; new unit's status → BOOKED.
- `RegistrationUnit.unitId`, `towerId`, `typologyId`, `allocatedTower`, `allocatedFloor`, `allocatedUnit` updated to the new unit.
- Flags reset: `bookingTokenActivitySubmitted=false`, `mavisBookingCreated=false`, `mavisUnitUpdated=false`, `lsqBookingActivityId=null`, `lsqBookingFormActivityId=null`, `isKycPdfSubmitted=false`. Self-KYC or full-KYC related flags also reset depending on prior state.
- Modal closes; the table refetches; the row shows the new unit.

### Warnings
- **Milestone schedule is NOT automatically regenerated** after a unit swap. The original milestone rows are preserved and may be stale relative to the new unit's typology pricing. This is a known backend limitation (regeneration code is commented out).
- The two attestation checkboxes are admin self-declarations — they do **not** delete anything. Failing to perform CRM Activity and Mavis cleanup first will produce inconsistent state and the backend may still reject (Mavis check is enforced server-side).
- There is **no in-app undo**. Verify the new unit and the cleanup before submitting.
- The Unit dropdown lists units of **any typology** — there is no filter on apartment type or carpet area. Triple-check the unit number before submitting.
- **No buyer SMS / WhatsApp / Email** is dispatched on a successful swap. Notify the buyer through other channels if needed.

---

# Feature 11 — Update Parking Details (Booked rows)

### What it does
Enables, updates, or disables additional parking on a buyer's booked unit and records the parking slot count and per-slot amount. The system computes the total parking amount that flows into the buyer's costing.

### Preconditions / Eligibility
- Row's Allocation Status = Booked Online / Booked Offline (`status=WINNER && allocationTransactionId !== null`).
- If parking is already enabled on the unit, the modal opens pre-filled with the current count and amount.

### How to use
1. Locate the Booked row.
2. Click the **three-dot (…) menu** → **Update Parking Details**.
3. The Parking Details modal opens (600px wide) with:
   - Read-only header: Registration Number, Apartment Type / carpet area.
   - **Additional Parking Enabled** toggle.
   - Conditional fields when toggle is ON: **Parking Count** (integer 1–500) and **Parking Amount** (decimal).
   - Live preview: **Total Parking Amount = Count × Amount**.
4. To enable / update: flip the toggle ON, enter Count and Amount, watch the preview.
5. To disable: flip the toggle OFF. Both Count and Amount are **immediately cleared** (set to null) and the input fields hide.
6. Click **Submit**.

### Result
- Toast: **"Parking details updated successfully"**.
- Backend: `PUT /registration-unit/:id` with body `{ event: "update-parking", payload: { additionalParkingEnabled, parkingCount, parkingAmount } }`.
- `RegistrationUnit.isParkingSelected`, `parkingCount`, `parkingAmount` are written.
- Parking pool for the typology is decremented or returned accordingly.
- Modal closes; table refetches.

### Validation rules
| Layer | Rule |
|-------|------|
| Frontend (Formik / Yup) | When toggle ON: parkingCount required, integer, 1–500. parkingAmount required, non-negative decimal. When OFF: both not validated. |
| Backend (Yup) | additionalParkingEnabled required boolean. parkingCount and parkingAmount are NOT required (server marks notRequired). |
| Backend (business logic) | Rejects with `400 "No change in parking count"` if delta = 0. Rejects with `400 "Available parking count (X) is less than required (Y)"` if pool insufficient. |

### Warnings
- **No buyer SMS / WhatsApp / Email** is dispatched. Audit log `ADMIN_UPDATE_PARKING` is the only post-action artefact.
- Disabling parking clears both Count and Amount on the registration unit. There is no in-app undo — re-enable and re-enter values to restore.
- Because the backend marks count and amount `notRequired`, the toggle ON + count = 0 case is enforced only by the frontend. A non-UI client could bypass that — flagged as a backend validation gap.
- Whether updating parking auto-regenerates the milestone payment schedule is not visible in source and is treated as TBC.

---

# Feature 12 — Download Export

### What it does
Exports all registration records as an Excel file named `RegistrationData.xlsx` with 17 columns.

### Preconditions
- Admin session.

### How to use
1. Click the **Download** button (top right area).
2. The file downloads automatically to your browser's default download folder.
3. Open in Excel.

### Result
You have an offline snapshot of registration data matching the current filters, suitable for reporting.

### Note (CORRECTED 2026-05-21 — confirmed via backend service code)
- Active filters ARE respected by the export. The export downloads all matching records across all pages (pagination removed via `isDownload=1`). No active filter = full export. Active filter = filtered export (e.g. Allocation Status = Cancelled → XLSX contains only Cancelled records, count equals the Cancelled KPI).

---

# Feature 13 — Assign Unit / Offline Booking (Registered rows)

### What it does
Assigns a unit to a Registered buyer and records an offline booking payment in a single transaction. Used when a buyer pays via bank transfer, cheque, UPI, or cash outside the online gateway.

### Preconditions / Eligibility
- Row Allocation Status = **Registered**.
- No unit currently allotted (`canAssignUnit`).
- Target unit's status is **AVAILABLE** or **RESERVED**.
- Registration does not already have an active unit booking.

### How to use
1. Find the eligible Registered row. The **Assign Unit** option appears in the three-dot menu only for these rows.
2. Click **Assign Unit** (three-dot menu). The offline booking modal opens.
3. Pick a **Tower** from the dropdown.
4. Pick a **Unit** — only Available/Reserved units in that tower are shown, displayed as `<UnitNo> – <Typology>` (e.g. `1203 – 2 BHK Rise Home`).
5. Fill the payment details:
   - **Transaction ID / Reference No.** — from bank, cheque, or UPI receipt.
   - **Mode of Transaction** — UPI / NEFT-RTGS / Cheque / Cash.
   - **Booking Amount** — entered exactly as per commercial terms (system does not validate against expected).
   - **Transaction Date** — defaults to today.
6. Optional: **Upload Proof** — image or PDF of cheque, transfer screenshot, or voucher.
7. Click **Submit**.

### Result
- A new `payment_transactions` row with `isOffline=1`, `paymentSource='admin'`, `status='completed'`, the chosen mode, and the uploaded proof URL.
- `RegistrationUnit.allocationStatus` → `confirmed`; `allocatedTower/Floor/Unit` set; `allocationPaymentSource` → `admin`; `allocationTransactionId` set.
- `Unit.status` → `BOOKED`; Python WebSocket cache updated.
- Mavis: booking + unit-status sync.
- LSQ: three activities created (Booking Token, Booking, Booking Form).
- Buyer receives Kaleyra WhatsApp (template: `congrates_payment_success_27sept`) + Kaleyra SMS (`ALLOTMENT_PAYMENT_SUCCESS`, +91 numbers only). No email. (Source-verified 2026-05-23: `registration-unit.service.js` lines 877–885 → `allocation.service.js` lines 1816–1832.)
- KPI counts refresh: Registered decreases, Confirmed/Booked increases.

### Validations
- Tower, Unit, Transaction ID, Mode, Booking Amount, Transaction Date all mandatory.
- Booking Amount > 0.
- **Re-check at submit:** if the unit is no longer Available/Reserved by the time you click Submit, error "Selected unit is no longer available. Please choose another unit." — no booking is created.
- If the registration already has an active booking, blocked with "This registration already has an active unit booking."

---

# Feature 14 — Bulk Cancel Units

### What it does
Cancels multiple sub-registrations at once — useful for cleanup operations on test data or bulk corrections.

### Preconditions
- Admin session.

### How to use
1. Click the **Cancel Bulk Units** button above the table.
2. The bulk cancel interface opens. Select the sub-registrations to cancel.
3. Confirm.

### Result
Selected sub-registrations are cancelled in a batch operation.

### Warning
- Permanent and irreversible. Recommended only for test records or after explicit business sign-off.

---

## Field Reference — Quick Lookup

### Trash icon (Actions column) — context-sensitive
| Row state | Tooltip | Modal | Confirm CTA | Refund | Backend endpoint | Success toast |
|-----------|---------|-------|-------------|--------|------------------|--------------|
| Booked (WINNER + allocationTransactionId) | Cancel Unit | "Please make sure that following actions are completed?" with 2 attestation checkboxes | Submit (enabled only when both checkboxes ticked) | None | PUT adminCancelAllUnits | "Unit cancelled successfully" |
| Registered / Waitlisted | Cancel Registration | Popup with unit details + ₹999 refund | Red "Cancel Registration" button | ₹999 to original method | PUT refundRegistrationUnit | "Registration refunded successfully" |
| REFUND | (cell shows `-`) | — | — | — | — | — |

### Three-dot menu item visibility
| Menu item | Visible when |
|-----------|--------------|
| Assign Unit | Row is Registered AND no unit allotted (`canAssignUnit`) |
| View Milestones | Row is Booked (`isBooked` = status=WINNER && allocationTransactionId !== null) |
| Unit swap | Row is Booked (front-end gate) — but backend additionally blocks if a campaign is active or Mavis row exists |
| Update Parking Details | Row is Booked |
| Home Loan Approval | Always available |

### Notifications dispatched — source-verified 2026-05-23

All entries verified against backend source (`admin.controller.js`, `registration-unit.service.js`, `milestone-payment.controller.js`, `allocation.service.js`).

| Action | Buyer Notification | Source evidence |
|--------|-------------------|-----------------|
| Cancel Unit | **None** ✓ | `cancelRegistrationUnits` — no notification imports; Python sync + Redis + audit only |
| Cancel Registration | **None** ✓ | Confirmed by user (actual system knowledge) |
| Home Loan Approval | **None** ✓ | `updateHomeLoanDetails` lines 349–387 — zero SMS/WA/email calls |
| Assign Unit / Offline Booking | WhatsApp (`congrates_payment_success_27sept`) + SMS (`ALLOTMENT_PAYMENT_SUCCESS`, +91 only) — **no email** ✓ | `adminAssignUnit` line 879 → `allocationNotificationService` → `allocation.service.js` lines 1816–1832 |
| View Milestones (navigation) | **None** ✓ | GET handlers read-only — zero notification grep matches in `milestone-payment.controller.js` |
| Offline Payment (milestone sub-flow) | **None** ✓ | `submitOfflineMilestonePayment` — full file grep returned zero notification matches |
| Unit Swap | **None** ✓ | `swapRegistrationUnit` lines 69–282 — returns after Redis update only |
| Update Parking | **None** ✓ | `updateParkingDetails` lines 285–347 — DB update + commit only |
| Bulk Cancel Units | **None** ✓ | `cancelByExcelUpload` lines 2301–2688 — no notification imports |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Trash tooltip says "Cancel Unit" but you expected "Cancel Registration" | Row is Booked — the trash icon performs Cancel Unit on Booked rows | Use the correct flow per row state (see Field Reference) |
| Submit button disabled on Cancel Unit modal | One or both attestation checkboxes unticked | Tick both checkboxes |
| Unit Swap submit fails with "Cannot swap unit when campaign is active" | An allocation campaign is OPEN for the project | Wait for the campaign to close, or close it in the Allocation module |
| Unit Swap submit fails with "Mavis booking still exists" | Mavis booking row not deleted externally | Delete the Mavis booking entry, then retry |
| Milestone table is empty for a Booked row | Buyer has not submitted KYC yet | Wait for KYC submission — the schedule generates then |
| After Unit Swap, milestone schedule looks wrong / stale | Backend does not auto-regenerate the schedule on swap | Escalate — known limitation |
| Update Parking fails with "No change in parking count" | Submitted count equals existing count (delta = 0) | Change the count or toggle OFF/ON-with-new-count |
| Update Parking fails with "Available parking count (X) is less than required (Y)" | Typology parking pool is exhausted | Reduce the count or wait for pool inventory to free up |
| Download contains only filtered records | Behaves by design (CORRECTED 2026-05-21 — export respects active filters) | Click Reset Filters before Download if you want all records |
| "Allocation Opened" banner is always visible regardless of state | The label is static hardcoded in the source | Check campaign state in the Allocation module — do not rely on this label |
