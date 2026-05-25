---
type: feature-spec
portal: Admin Portal
module: Config CMS
updated: 2026-05-11
status: complete
---

# Admin Portal — Config / CMS Module Feature Specifications

**URL:** `/admin/cms` — Single long-scroll page with 9 operational sections.

> **Important disambiguation:** Left sidebar "Config" → `/admin/cms` (this module). Left sidebar "CMS" → `manage-uat.xrportal.in` (external Strapi CMS — out of scope for this document).

---

# Feature 1: Tower Configuration

## 1. Objective
Allow admins to activate or deactivate individual towers across the project, controlling which towers and their units are visible and selectable during allocation campaigns.

## 2. Scope
Section 1 of the Config page. Changes are batch-saved — a single "Update Tower Configuration" button saves all toggle changes at once.

## 3. Eligibility / Preconditions
- Admin session required.
- 18 towers are available in the system.

## 4. UI Changes
- 18 tower cards displayed in a 2-column grid.
- Each card shows: Tower Number, Tower Name, "View Tower >" link, Active/Inactive toggle.
- "Update Tower Configuration" button at the bottom of this section.

## 5. Controls

| Control | Description |
|---------|-------------|
| Active/Inactive toggle | Per tower — ON = Active, OFF = Inactive |
| "View Tower >" link | Navigates to Towers page with that tower pre-selected |
| Update Tower Configuration | Saves all toggle changes in one batch operation |

**Current tower list (18 towers):**
Dawn, Aura, Glory, Pride, Grace, Aspire, Blossom, Crest, Triumph, Crown, Prime, Pinnacle, Prestige, Horizon, Radiance, Fortune, Bright, Grand

## 6. Validations & Business Rules
1. Toggle changes are **not saved** until "Update Tower Configuration" is clicked.
2. Toggling a tower to Inactive removes it from the allocation unit grid and reduces the Active Towers KPI in the Customers dashboard.
3. Toggling Active during a live campaign exposes new units to buyers immediately.
4. No minimum number of active towers enforced.

## 7. System Actions on Save
1. `PUT /api/v1/admin/towers/status-update` with array of `{ towerId, isActive }` objects.
2. Tower records updated in database.
3. Active Towers KPI in Customers module refreshed.
4. Python WebSocket service notified to update real-time unit availability cache.
5. Toast: *"Tower Status Updated Successfully"*

## 8. Notifications
None.

## 9. Audit & Logging
- Admin user ID, list of towers changed (name + new state), timestamp logged.

## How to Use

1. **Navigate to Config CMS:** Go to `/admin/cms` from the left sidebar.
2. **Find Section 1 "Tower Configuration"** at the top of the page — 18 tower cards are displayed.
3. **Toggle towers:** Flip the Active/Inactive toggle on each tower card you want to change. Active = tower units are visible in allocation. Inactive = tower is hidden from buyers.
4. **View a tower's inventory:** Click "View Tower >" on any card to jump directly to that tower's floor/unit grid in the Towers module.
5. **Click "Update Tower Configuration"** to save all toggle changes at once. Changes are NOT saved until you click this button.
6. **Result:** Active Towers KPI in the Customers dashboard updates. The real-time unit grid for buyers reflects the change immediately.

> **Warning:** Toggling a tower Active during a live allocation campaign immediately exposes its units to all buyers currently in the allocation session.

---

# Feature 2: Registration Status Bulk Update

## 1. Objective
Allow admins to control which registrations are eligible to participate in upcoming allocation campaigns by uploading a CSV file that sets the allocation availability per registration.

## 2. Scope
Section 2 of the Config page. Bulk operation via CSV download → edit → upload.

## 3. Eligibility / Preconditions
- Admin session required.
- Admin must download the current registrations sample/export first to get the correct registration numbers.

## 4. UI Changes
- Section heading: "Registration Status"
- "Sample File Download" button
- "Upload File" input (accepts .xlsx, .csv)
- "Submit" button

## 5. CSV Format

| Column | Values | Description |
|--------|--------|-------------|
| Registration Number | e.g. GHNG-1000008563 | Registration to update |
| Allocation Status | `Allow` / `Forbid` | Allow = eligible for campaign; Forbid = blocked from campaign |

## 6. Validations & Business Rules
1. Each row is processed independently.
2. `Allow` sets `Registration.availableForAllocation = true`.
3. `Forbid` sets `Registration.availableForAllocation = false` — registration will not appear in campaign's eligible buyer pool.
4. Rows with unrecognised registration numbers are skipped or flagged in the result.
5. Submitting without selecting a file results in no action (silent failure — no validation message shown). **Known bug: BUG_010.**

## 7. System Actions on Submit
1. Download: `GET /api/v1/admin/export-all-registrations-status`
2. Upload: `POST /api/v1/admin/update-registrations-status` (multipart/form-data, field: `doc`)
3. Backend processes each row and updates `Registration.availableForAllocation`.
4. Result file may be returned showing per-row success/failure status.

## 8. Notifications
None.

## 9. Audit & Logging
- Admin user ID, filename, number of rows processed, timestamp logged.

## How to Use

1. **Navigate to Config CMS** and find Section 2 "Registration Status".
2. **Download the sample file:** Click "Sample File Download" to get the current registration list with correct registration numbers.
3. **Edit the file:** For each registration, set Allocation Status to "Allow" (eligible for the campaign) or "Forbid" (blocked from the campaign).
4. **Upload:** Click "Upload File", select your edited file (.xlsx or .csv), then click "Submit".
5. **Result:** Each registration's campaign eligibility is updated. Buyers set to "Forbid" will not appear in the allocation pool during the next campaign.

> **Known issue (BUG_010):** Clicking Submit without selecting a file produces no error message. Ensure a file is selected before submitting.

---

# Feature 3: Unit Status Bulk Update

## 1. Objective
Allow admins to change the availability status of individual units in bulk via CSV upload, enabling or blocking specific units from being selected during campaigns.

## 2. Scope
Section 3 of the Config page.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Section heading: "Unit Status"
- "Sample File Download" button
- "Upload File" input (accepts .xlsx, .csv)
- "Submit" button

## 5. CSV Format

| Column | Values | Description |
|--------|--------|-------------|
| Tower | Tower name | e.g. Crest |
| Floor | Floor number | e.g. 12 |
| Unit_No | Unit number | e.g. 1203 |
| Unit_Type | Typology name | e.g. 2 BHK Rise Home |
| Status | `AVAILABLE` | Unit status to set (AVAILABLE confirmed; other values to be verified) |
| Update | `1` / `0` | 1 = apply this row; 0 = skip this row |

## 6. Validations & Business Rules
1. Only rows with `Update = 1` are processed.
2. Changing status to AVAILABLE on a previously BOOKED unit is a high-risk operation — verify with the team before doing so.
3. Changes take effect immediately across all active sessions.

## 7. System Actions on Submit
1. Download: `GET /api/v1/admin/export-all-units-status`
2. Upload: `POST /api/v1/admin/update-units-status`
3. `Unit.status` updated per row.
4. Python service notified to refresh real-time unit cache.

## 8. Notifications
None.

## 9. Audit & Logging
- Admin user ID, filename, units changed, timestamp logged. Unit model has `auditEnabled = true`.

## How to Use

1. **Navigate to Config CMS** and find Section 3 "Unit Status".
2. **Download the sample file:** Click "Sample File Download" to get the current unit inventory with correct identifiers.
3. **Edit the file:** For each unit you want to update, set Status = "AVAILABLE" and Update = 1. Set Update = 0 for rows you want to skip.
4. **Upload:** Click "Upload File", select your edited file, then click "Submit".
5. **Result:** Unit statuses are updated immediately. The real-time unit cache is refreshed and buyers/admins see the updated status in the tower grid.

> **Warning:** Changing a BOOKED unit back to AVAILABLE is a high-risk operation that could release an already-sold unit. Verify with your team before making such changes.

---

# Feature 4: Unit Cost Update (Pricing Bulk Update)

## 1. Objective
Allow admins to update the base pricing (Agreement Value and Early Bird Benefit) for individual units in bulk by downloading the current inventory, editing prices in Excel, and re-uploading.

## 2. Scope
Section 4 of the Config page.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Section heading: "Unit Cost Update"
- "Available Unit Inventory Download" button (downloads current pricing XLSX)
- "Upload File" input (accepts .xlsx, .csv)
- "Submit" button

## 5. XLSX Format (Download + Re-upload)

| Column | Description |
|--------|-------------|
| Tower | Tower name |
| Floor | Floor number |
| Unit_No | Unit number |
| Agreement_Value | New base price (INR integer) |
| EarlyBird | New early bird benefit discount (INR) |
| Update | 1 = apply / 0 = skip |

## 6. Validations & Business Rules
1. **Price changes take effect IMMEDIATELY** — there is no draft or preview step.
2. Price changes during an active allocation campaign affect buyer-visible pricing in real-time.
3. Buyers who have already completed payment are NOT affected — their booking is locked.
4. Buyers mid-session (viewing unit details but not yet paid) will see new prices on next calculation.

> **CRITICAL WARNING:** Do not update unit prices during an active allocation campaign without notifying buyers.

## 7. System Actions on Submit
1. Download: `GET /api/v1/admin/export-all-units-price`
2. Upload: `POST /api/v1/admin/update-units-price`
3. `Unit.agreementValue` and `Unit.earlyBirdBenefit` updated per row.
4. All new unit detail requests will return updated pricing immediately.

## 8. Notifications
None — no automatic notification to buyers about price changes.

## 9. Audit & Logging
- Admin user ID, filename, units updated, old vs new price values, timestamp logged (Unit.auditEnabled = true).

## How to Use

1. **Navigate to Config CMS** and find Section 4 "Unit Cost Update".
2. **Download the inventory:** Click "Available Unit Inventory Download" to get the current pricing XLSX file with all unit prices.
3. **Edit the prices:** In the Excel file, update Agreement_Value (base price) and/or EarlyBird (early bird discount) for the units you want to change. Set Update = 1 for rows to apply, Update = 0 for rows to skip.
4. **Upload:** Click "Upload File", select your edited file, then click "Submit".
5. **Result:** Prices are updated immediately. All new unit detail views (in Towers module and Allocation sessions) reflect the updated prices.

> **Warning:** Price changes are immediate and affect live buyer sessions. Do not update pricing during an active allocation campaign without coordinating with the sales team.

---

# Feature 5: Bulk Booking Cancellation

## 1. Objective
Allow admins to cancel multiple bookings in one operation via Excel upload, releasing the associated units back to available inventory.

## 2. Scope
Section 5 of the Config page.

## 3. Eligibility / Preconditions
- Admin session required.
- Registrations in the upload must be in Booked status with a completed payment.

## 4. UI Changes
- Section heading: "Bulk Booking Cancellation"
- "Sample File Download" button
- "Upload File" input (accepts .xlsx)
- "Submit" button

## 5. File Format
Download the sample file for current column headers. Upload with registration/booking details to cancel.

## 6. Validations & Business Rules
1. Each row processed independently.
2. Cancelled bookings release the unit back to `AVAILABLE` status.
3. Python service notified to restore unit to real-time available pool.
4. Whether refund is automatically triggered: to be confirmed with the development team.

## 7. System Actions on Submit
1. Download sample: `GET /api/v1/admin/bulk-cancel-sample`
2. Upload: `POST /api/v1/admin/cancel-units-excel`
3. `RegistrationUnit.allocationStatus` → `cancelled` per row.
4. `Unit.status` → `AVAILABLE`.
5. Python unit status sync triggered.

## 8. Notifications
- Kaleyra notification to affected buyers if cancellation notification is configured.

## 9. Audit & Logging
- Admin user ID, filename, registrations cancelled, timestamp logged.

## How to Use

1. **Navigate to Config CMS** and find Section 5 "Bulk Booking Cancellation".
2. **Download the sample file:** Click "Sample File Download" to get the correct file format.
3. **Prepare your cancellation list:** Fill in the sample file with the booking/registration details for all bookings to be cancelled. Download the current bookings from the Customers module to get the correct registration numbers.
4. **Upload:** Click "Upload File", select your file (.xlsx), then click "Submit".
5. **Result:** Each booking in the file is cancelled. The associated units are released back to Available status and become selectable in future campaigns. Buyers receive cancellation notifications (if configured).

> **Warning:** Confirm with your team whether refunds are automatically triggered for each cancellation before proceeding with a bulk operation.

---

# Feature 6: Bulk Registration Cancellation

## 1. Objective
Allow admins to cancel multiple registrations in bulk, including all their associated sub-registrations, in one Excel upload operation.

## 2. Scope
Section 6 of the Config page.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Section heading: "Bulk Registration Cancellation"
- "Sample File Download" button
- "Upload File" input (accepts .xlsx)
- "Submit" button

## 5. File Format
Download the sample file for current column headers.

## 6. Validations & Business Rules
1. **CASCADE WARNING:** Each matched registration number cancels ALL its sub-registrations (A, B, C, D...). A single row in the upload can cancel many RegistrationUnit records.
2. This is an irreversible bulk operation — verify registration numbers carefully before submitting.
3. Whether refund is automatically triggered for paid registrations: to be confirmed.

## 7. System Actions on Submit
1. Download sample: `GET /api/v1/admin/bulk-refund-sample`
2. Upload: `POST /api/v1/admin/registration-units/refund-bulk`
3. All RegistrationUnit records for each registration number → `allocationStatus = 'cancelled'` or `'refunded'`.
4. Associated units released back to inventory.
5. Python service notified.

## 8. Notifications
- Kaleyra notification to affected buyers if configured.

## 9. Audit & Logging
- Admin user ID, filename, registration IDs cancelled, timestamp logged.

## How to Use

1. **Navigate to Config CMS** and find Section 6 "Bulk Registration Cancellation".
2. **Download the sample file:** Click "Sample File Download" to get the correct file format.
3. **Prepare your list:** Add one registration number per row for each registration to be cancelled.
4. **Verify carefully:** Each registration number in the file will cancel ALL sub-registrations (A, B, C, D...) under that registration. Double-check your list before uploading.
5. **Upload:** Click "Upload File", select your file (.xlsx), then click "Submit".
6. **Result:** All RegistrationUnit records under each listed registration are cancelled. Associated units are released back to inventory.

> **Warning:** This is a CASCADE operation — one registration number can cancel multiple RegistrationUnit records. This action is irreversible. Verify all registration numbers before submitting.

---

# Feature 7: Sales Managers Bulk Upload

## 1. Objective
Allow admins to create new Sales Manager accounts or update existing ones in bulk by uploading an Excel file.

## 2. Scope
Section 7 of the Config page. Provides bulk provisioning for the sales team.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Section heading: "Sales Managers"
- "Sample File Download" button (downloads XLSX with correct column headers)
- "Upload File" input (accepts .xlsx)
- "Submit" button

## 5. XLSX Format

| Column | Values | Description |
|--------|--------|-------------|
| Role | `Sales Manager` | Role designation (fixed value) |
| First Name | Text | SM's first name |
| Last Name | Text | SM's last name |
| Email | Email | SM's email address |
| Phone | 10-digit number | SM's mobile number (used as merge key) |
| IS_AVAILABLE | `1` / `0` | 1 = SM appears in customer assignment dropdowns; 0 = hidden from assignments |
| IS_ACTIVE | `1` / `0` | 1 = SM can log in to sales portal; 0 = login disabled |

**Merge key:** Phone number — if an existing SM record matches by phone, the record is UPDATED; otherwise a new SM account is CREATED.

## 6. Validations & Business Rules
1. Phone number is mandatory and is the unique merge key.
2. `IS_AVAILABLE = 0`: SM immediately removed from all customer assignment dropdowns system-wide.
3. `IS_ACTIVE = 0`: SM's sales portal login access disabled (soft deactivation — record not deleted).
4. Invalid rows (e.g., malformed phone numbers) are flagged in the result.

## 7. System Actions on Submit
1. Download sample: `GET /api/v1/admin/sales-manager-sample`
2. Upload: `POST /api/v1/admin/sales-managers-import`
3. Each row: upsert User record with SM role.
4. IS_AVAILABLE and IS_ACTIVE flags applied immediately.

## 8. Notifications
- Kaleyra SMS to new SMs: account created with portal login instructions (if configured).

## 9. Audit & Logging
- Admin user ID, filename, SMs created/updated, timestamp logged.

## How to Use

1. **Navigate to Config CMS** and find Section 7 "Sales Managers".
2. **Download the sample file:** Click "Sample File Download" to get the correctly formatted XLSX template.
3. **Fill in the Excel file:** One row per Sales Manager. Enter Role = "Sales Manager" (fixed), First Name, Last Name, Email, Phone (10 digits), IS_AVAILABLE (1 or 0), IS_ACTIVE (1 or 0).
4. **Upload:** Click "Upload File", select your file (.xlsx), then click "Submit".
5. **Result:** New SMs are created; existing SMs (matched by phone number) are updated. IS_AVAILABLE and IS_ACTIVE flags apply immediately. New SMs receive an SMS with login instructions.

---

# Feature 8: Customer Actions Card

## 1. Objective
Allow admins to control whether buyers can register for additional units through the Customer Portal, and configure which typologies and quantity limits are allowed.

## 2. Scope
Section 8 of the Config page.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Section heading: "Customer Actions"
- Master toggle: "Allow Additional Registrations" (ON/OFF)
- When master toggle is ON: per-typology checkboxes and count dropdowns appear
- "Submit" button saves the configuration

## 5. Form Details

| Control | Type | Description |
|---------|------|-------------|
| Allow Additional Registrations | Master toggle | ON = buyers can add more unit registrations; OFF = additional registrations blocked regardless of typology settings |
| 1 Bed Growth Home | Checkbox + count dropdown | Enable/disable + max additional registrations allowed |
| 2 Bed Growth Home | Checkbox + count dropdown | Enable/disable + max additional registrations allowed |
| 2 Bed Rise Home | Checkbox + count dropdown | Enable/disable + max additional registrations allowed |

**Current UAT configuration:**
- Master toggle: ON
- 1 Bed Growth Home: enabled, limit = 15
- 2 Bed Growth Home: enabled, limit = 17
- 2 Bed Rise Home: enabled, limit = 20

## 6. Validations & Business Rules
1. Master toggle OFF overrides all typology checkboxes — no additional registrations possible regardless of individual settings.
2. Reducing a typology's count limit mid-campaign may cause inconsistency for buyers already in the registration flow.
3. Changes take effect immediately system-wide.

## 7. System Actions on Submit
1. `GET /api/v1/admin/customer-actions` — loads current config on page load.
2. `POST /api/v1/admin/customer-actions` — saves updated configuration.
3. Customer Portal immediately enforces new settings.

## 8. Notifications
None.

## 9. Audit & Logging
- Admin user ID, changed settings, timestamp logged.

## How to Use

1. **Navigate to Config CMS** and find Section 8 "Customer Actions".
2. **Review the master toggle:** "Allow Additional Registrations" — if OFF, no buyers can register for additional units regardless of the typology settings below it.
3. **Configure per typology (if master toggle is ON):**
   - Check or uncheck each typology (1 Bed Growth Home, 2 Bed Growth Home, 2 Bed Rise Home).
   - Set the count limit for each enabled typology — this is the maximum number of additional registrations a buyer can add for that unit type.
4. **Click "Submit"** to save the configuration.
5. **Result:** The Customer Portal immediately enforces the new settings — buyers can (or cannot) register for additional units based on the configuration.

---

# Feature 9: Max Preferences Per Unit

## 1. Objective
Set a system-wide cap on how many unit preferences a buyer can submit during an allocation campaign, preventing buyers from selecting excessive numbers of units.

## 2. Scope
Section 9 of the Config page.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Section heading: "Max Preferences Per Unit"
- Dropdown to select a numeric value
- "Update" button saves the value

## 5. Form Details

| Control | Type | Description |
|---------|------|-------------|
| Max Preferences | Dropdown | Numeric value (current UAT setting: 6) |
| Update | Button | Saves the selected value |

## 6. Validations & Business Rules
1. Setting applies system-wide to the active project.
2. Reducing the limit below a buyer's already-submitted preference count: existing preferences may or may not be invalidated (confirm with development team).
3. Change takes effect for new preference submissions immediately.

## 7. System Actions on Save
1. `GET /api/v1/admin/max-preferences-per-unit` — loads current value on page load.
2. `PUT /api/v1/admin/max-preferences-per-unit/:projectId` — saves updated value.

## 8. Notifications
None.

## 9. Audit & Logging
- Admin user ID, old value, new value, timestamp logged.

## How to Use

1. **Navigate to Config CMS** and find Section 9 "Max Preferences Per Unit" at the bottom of the page.
2. **View the current setting:** The dropdown shows the current maximum (e.g., 6 on UAT).
3. **Change the limit:** Select a new value from the dropdown.
4. **Click "Update"** to save.
5. **Result:** The new preference limit takes effect immediately. Buyers attempting to select more units than the limit during an active allocation campaign will be blocked at the preference count limit.

---

# Backend Gap Reconciliation (2026-05-21)

Controller-layer audit findings against `admin.controller.js` and `master-config.controller.js`. See parent BRD §11 for full narrative.

### Section 2 — Registration Status corrections
- Blocked during active campaign: HTTP 400 "Cannot update registration-unit when campaign is active". <!-- BA correction: GAP-TL-040, 2026-05-21 -->
- WINNER/HOLD rows are skipped from the update. <!-- BA correction: GAP-TL-041, 2026-05-21 -->
- Dual write: ALLOW → `status=PREALLOCATED, availableForAllocation=true`; FORBID → `status=WAITLIST, availableForAllocation=false`. <!-- BA correction: GAP-TL-042, 2026-05-21 -->
- Side-effects: Redis sync + Python `/broadcast-registrations`. <!-- BA correction: GAP-TL-051, 2026-05-21 -->

### Section 3 — Unit Cost Update corrections
- Chunked in 250-row batches; abort after 2 chunk failures. <!-- BA correction: GAP-TL-043, 2026-05-21 -->
- **Unit status transitions strictly AVAILABLE ↔ RESERVED.** `BOOKED → AVAILABLE` is NOT supported (correct prior FRD claim). <!-- BA correction: GAP-TL-044, 2026-05-21 -->
- XLSX requires: `allocationAmount`, `allocationPercent`, `allocationCalcType` (PERCENT/AMOUNT). <!-- BA correction: GAP-TL-045, 2026-05-21 -->
- Empty submission → HTTP 400 "No rows marked for update". <!-- BA correction: GAP-TL-046, 2026-05-21 -->
- Sample/Inventory downloads exclude BOOKED/HOLD/REFUGE/PBT (only AVAILABLE/RESERVED). <!-- BA correction: GAP-TL-048, 2026-05-21 -->

### New Feature — Per-Unit Edit Endpoint <!-- BA correction: GAP-TL-047, 2026-05-21 -->
`PATCH /api/v1/admin/units/:id` — accepts pricing + status in one call.

### Section 5 — Bulk Booking Cancellation corrections
- Blocked during active campaign. <!-- BA correction: GAP-TL-036, 2026-05-21 -->
- Blocked by existing Mavis booking. <!-- BA correction: GAP-TL-037, 2026-05-21 -->
- Only RegistrationUnit status = `WINNER` is cancelable. <!-- BA correction: GAP-TL-038, 2026-05-21 -->
- bookingNumber prepended `D`/`U` for dev/uat when calling Mavis. <!-- BA correction: GAP-TL-039, 2026-05-21 -->
- **Cancellation cascade** (5+ models): registration_units (20+ cols cleared), payment_transactions, MilestonePaymentTracking, RegistrationUnitPaymentSchedule, RegistrationUnitOffer (soft-deletes); ParkingInventory HOLD/BOOKED released. <!-- BA correction: GAP-TL-052, 2026-05-21 -->

### Bulk Refund template/key typos <!-- BA correction: GAP-TL-049, GAP-TL-050, 2026-05-21 -->
- Sample template column-name typo: `upadte`.
- Result file header "Registration Number" maps to data key `unitNumber`.

### Section 8 — Master Configuration <!-- BA correction: GAP-TL-032, GAP-TL-033, GAP-TL-034, GAP-TL-035, GAP-DEV-021, 2026-05-21 -->
- `storeMasterConfigs` endpoints added to scope; `projectId` env-resolved.
- Allowed `dataType` enum: `string, number, boolean, json, date, datetime, array, object`.
- **"2 Bed Peak Home" force-disabled** — server silently coerces to `isAllowed=false, countAllowed=0` regardless of input.
- "No change" submission → HTTP 400 "No Change Detected".

### 2-BHK Rise/Peak parking carve-out (cross-reference) <!-- BA correction: GAP-DEV-021, 2026-05-21 -->
- Backend force-disables parking for typologies named exactly "2 BHK Rise Home" or "2 BHK Peak Home" (string match, `common.service.js:130, 517`).
