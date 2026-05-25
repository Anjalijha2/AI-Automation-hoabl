# Admin Portal — Config / CMS Module BRD

**Module:** Config / CMS
**URL:** `https://uat-web.xrportal.in/admin/cms`
**Created:** 2026-05-11
**Status:** Complete — Automated (Sprint 2)

---

## 1. Purpose

The Config module is the system administration control panel. It is a single long page with nine functional sections that let the admin team make bulk operational changes without technical help — activating towers, updating unit pricing, cancelling bookings in bulk, adding sales managers, and controlling what types of units buyers can register for.

Everything that can be configured here affects the live platform immediately (with the exception of tower toggles, which require an explicit save click).

---

## 2. Who Uses This

| User | What They Do Here |
|------|------------------|
| Admin | Full access to all 9 sections |
| Sales Manager Admin | Same as Admin |

---

## 3. How to Access

Left sidebar → click **Config** → `/admin/cms`

The page is titled "Configurations" in the portal.

**Important:** The sidebar also shows a separate "CMS" link — that opens an entirely different external content management system at a different domain. The Config module described here is the one labeled **Config** in the sidebar.

---

## 4. Screen Layout

Single long-scrolling page. Scroll down to find each section.

| Section # | Section Name | What It Does |
|-----------|-------------|-------------|
| 1 | Tower Configuration | Turn towers on and off for allocation campaigns |
| 2 | Registration Status | Bulk update which registrations can participate in a campaign |
| 3 | Unit Status | Bulk update unit availability (Available / Reserved) |
| 4 | Unit Cost Update | Bulk update unit pricing |
| 5 | Bulk Booking Cancellation | Cancel multiple bookings at once |
| 6 | Bulk Registration Cancellation | Cancel multiple entire registrations at once |
| 7 | Sales Managers | Bulk add or update sales manager accounts |
| 8 | Customer Actions Card | Control what types of units buyers can register for |
| 9 | Max Preferences Per Unit | Set the maximum number of buyers that can prefer a single unit |

---

## 5. Feature Walkthrough

### Section 1 — Tower Configuration

This section shows a grid of all 18 towers, each with a toggle switch (Active or Inactive).

1. Scroll to the **Tower Configuration** section
2. Find the tower you want to change
3. Click its toggle (green = Active, grey = Inactive)
4. After making all changes, click **Update Tower Configuration**
5. A success message confirms the save

**Warning:** Changes are not saved until the button is clicked. Leaving the page without clicking discards all toggle changes.

**Current UAT state:** Tower 8 (Crest) and Tower 10 (Crown) are Active by default. All others are Inactive.

### Sections 2–7 — Bulk Upload Sections

All six sections follow the same three-step pattern:

**Step 1:** Click the **Sample File Download** button to get the template file
**Step 2:** Fill in the template with your data and save it
**Step 3:** Click **Upload File** to select your file, then click **Submit**

A success message confirms the upload was processed.

**Important:** Each section has its own Upload File button and Submit button. Always scroll to the correct section — clicking the wrong Submit button will process the wrong upload.

**Section 2 — Registration Status (CSV)**
Controls which registrations are eligible to participate in the next allocation campaign.
- Column 1: `Registration Number` (e.g. GHNG-1000008563-A)
- Column 2: `Allocation Status` — type `Allow` to make eligible or `Forbid` to block
- Case-insensitive: "allow", "Allow", "ALLOW" all work

**Section 3 — Unit Status (CSV)**
Bulk change unit availability.
- Valid Status values: `AVAILABLE` or `RESERVED`
- `Update` column: type `1` to apply the row, `0` to skip

**Section 4 — Unit Cost Update (XLSX)**
Update pricing for units in bulk.
- Click **Available Unit Inventory Download** to get the current pricing spreadsheet
- Edit `Agreement_Value` and `EarlyBird` columns
- Set `Update = 1` for rows to apply, `Update = 0` for rows to skip
- **Warning:** Pricing changes take effect immediately, even during active campaigns

**Section 5 — Bulk Booking Cancellation (XLSX)**
Cancel individual unit bookings for specific registrations.
- Template has one column: `Registration Number`
- Cancellation does NOT automatically trigger a financial refund — refund must be initiated separately

**Section 6 — Bulk Registration Cancellation (XLSX)**
Cancel entire registrations (all sub-registrations for a buyer).
- Template has two columns: `Registration Number` | `Update` (1=cancel, 0=skip)
- This cancels ALL sub-registrations (A, B, C...) for the matched registration — it is cascading and irreversible
- Does NOT automatically trigger a financial refund

**Section 7 — Sales Managers (XLSX)**
Add new sales managers or update existing ones in bulk.
- Template columns: Role / First Name / Last Name / Email / Phone / IS_AVAILABLE (1/0) / IS_ACTIVE (1/0)
- Merge key: the phone number — if a matching phone exists, that record is updated; new phone creates a new record
- Accepts `.xlsx` format only
- Result is returned as a downloadable Excel file showing Created / Updated / Unchanged / Error per row

### Section 8 — Customer Actions Card

Controls whether customers can register for additional unit types from the Customer Portal.

| Control | What It Does |
|---------|-------------|
| **Allow Additional Registrations** toggle (master switch) | ON = customers can add more registrations; OFF = blocks everything below |
| 1 Bed Growth Home checkbox | Allow buyers to add 1-bed registrations |
| 2 Bed Growth Home checkbox | Allow buyers to add 2-bed growth home registrations |
| 2 Bed Rise Home checkbox | Allow buyers to add 2-bed rise home registrations |
| Count dropdowns | Set the maximum number of each type that can be registered |
| **Submit** button | Save the settings |

**UAT state:** All three types are enabled with limits: 1-bed = 15, 2-bed growth = 17, 2-bed rise = 20.

**Warning:** The master toggle (Allow Additional Registrations) overrides individual checkboxes — turning it OFF blocks all types even if the individual checkboxes are ticked.

### Section 9 — Max Preferences Per Unit

Sets the maximum number of different buyers that can express interest in the same unit.

1. Find the **Max Preferences Per Unit** dropdown
2. Select the desired limit (current default: 6)
3. Click **Update**

This is a project-level setting. Reducing the limit does not retroactively invalidate existing preferences — it only prevents new preferences from being added to units that have already reached the cap.

---

## 6. Business Rules

1. Tower Configuration changes are only saved when the **Update Tower Configuration** button is clicked
2. Unit Cost Update changes take effect immediately, including during active allocation campaigns
3. All bulk upload sections use: Download Sample → Fill Template → Upload → Submit
4. In Unit Status CSV: `Update = 1` applies the row; `Update = 0` skips the row
5. Bulk Booking Cancellation does NOT auto-trigger a financial refund — refund is separate
6. Bulk Registration Cancellation cancels ALL sub-registrations for matched registrations (cascading)
7. SM bulk upload uses phone number as the merge key (phone = existing → update; new phone → create)
8. SM bulk upload accepts `.xlsx` only; other formats are rejected
9. Customer Actions Card master toggle OFF overrides all individual typology checkboxes
10. Max Preferences Per Unit: valid range is 0 to 255; setting it lower does NOT invalidate existing preferences
11. When bulk upload has errors, the system returns an error Excel file (HTTP 400) with per-row detail — not a generic error toast

---

## 7. Validations

| Section | Invalid Input | System Response |
|---------|--------------|-----------------|
| Registration Status | Submit without uploading a file | Silent failure — no error shown (known bug BUG_010) |
| Unit Status | `Update = 0` on all rows | "No rows marked for update" message |
| Unit Status | Invalid status value (e.g. "BLOCKED") | That row returns error in result file |
| SM Upload | Phone shorter than 10 digits | Row flagged as error in result file |
| SM Upload | Duplicate email | Allowed — email is not a uniqueness constraint |

---

## 8. Dependencies

| Module | Relationship |
|--------|-------------|
| [Towers](BRD-Towers.md) | Tower active/inactive state controlled here; visible in Towers module |
| [Customers](BRD-Customers.md) | Cancellations affect customer records; Active Towers KPI cross-references tower config |
| [Allocation](BRD-Allocation.md) | Registration Status controls campaign eligibility; Unit Status controls unit availability grid; Max Preferences controls selection count |
| [Sales Managers](BRD-Sales-Managers.md) | Section 7 provisions SM accounts that appear in the Sales Managers list page |
| [Offers](BRD-Offers.md) | Unit Cost Update sets the Agreement Value base price on which Offers discounts are applied |

---

## 9. User Journey Map

**Tower activation flow:**

| Step | Actor | Action | System Response | Next Step |
|------|-------|--------|----------------|-----------|
| 1 | Admin | Opens Config page | Long-scroll page with 9 sections loads | Step 2 |
| 2 | Admin | Scrolls to Tower Configuration | 18 tower cards with toggles visible | Step 3 |
| 3 | Admin | Clicks toggle on Pinnacle tower | Toggle turns green (Active) | Step 4 |
| 4 | Admin | Clicks Update Tower Configuration | Success toast "Tower Status Updated Successfully" | Done |

**Pricing update flow:**

| Step | Actor | Action | System Response | Next Step |
|------|-------|--------|----------------|-----------|
| 1 | Admin | Scrolls to Unit Cost Update section | Download button and upload area visible | Step 2 |
| 2 | Admin | Clicks Available Unit Inventory Download | Current pricing XLSX file downloads | Step 3 |
| 3 | Admin | Edits pricing in the XLSX, sets Update=1 | File saved locally | Step 4 |
| 4 | Admin | Clicks Upload File, selects the file | File attached | Step 5 |
| 5 | Admin | Clicks Submit | Prices updated immediately across the platform | Done |

---

## 10. Open Questions / Gaps

**Known Bug (BUG_010 — Open):** Registration Status section — clicking Submit without selecting a file shows no validation error. The system silently fails. Expected behavior: an error message prompting the admin to select a file first.

All other Config module questions are resolved as of 2026-05-10.

---

## 11. Backend Gap Reconciliation (2026-05-21)

Controller audit findings against `master-config.controller.js` and `admin.controller.js`.

### 11.1 Master Configuration API (Section 8) <!-- BA correction: GAP-TL-032, 2026-05-21 -->
- Section 8 master-config endpoints (`storeMasterConfigs`) were not previously documented.
- `projectId` is env-resolved server-side; the formerly-accepted `req.body.projectId` is now commented out.
- **Allowed `dataType` enum (8 values):** `string`, `number`, `boolean`, `json`, `date`, `datetime`, `array`, `object`. <!-- BA correction: GAP-TL-033, 2026-05-21 -->

### 11.2 Section 8 force-disables "2 Bed Peak Home" <!-- BA correction: GAP-TL-034, 2026-05-21 -->
- `admin.controller.js:1591-1594` silently overrides any admin input for typology "2 Bed Peak Home" to `isAllowed=false, countAllowed=0`. The UI may show the row but server enforces disabled state.
- Implications: any admin attempt to enable this typology will appear to succeed but persist as disabled.

### 11.3 Section 8 "No Change Detected" (HTTP 400) <!-- BA correction: GAP-TL-035, 2026-05-21 -->
- If the submitted configuration is identical to current state, backend returns HTTP 400 "No Change Detected". Not HTTP 200.

### 11.4 Bulk Booking Cancellation — preconditions <!-- BA correction: GAP-TL-036, GAP-TL-037, GAP-TL-038, 2026-05-21 -->
- **Blocked during active campaign** (`admin.controller.js:2331-2333`): HTTP 400 "Cannot cancel booking when campaign is active".
- **Blocked by Mavis booking** (`:2423-2429`): if a Mavis booking exists for the bookingNumber → HTTP 400 "Mavis booking still exists, please clear that step first".
- **Cancelable status:** only RegistrationUnit.status = `WINNER`. All other statuses are skipped with row error "Not cancelable" in the result file (`:2400-2406`). Doc previously implied a friendly "Booked" status; literal value is `WINNER`.

### 11.5 Mavis bookingNumber env-prefix <!-- BA correction: GAP-TL-039, 2026-05-21 -->
- When querying Mavis, the bookingNumber is prepended with `D` (dev) or `U` (uat). Production uses the raw value. QA test data must align with the runtime env prefix.

### 11.6 Bulk Cancellation cascade (5+ models) <!-- BA correction: GAP-TL-052, 2026-05-21 -->
- Cancellation cascades via raw SQL across:
  - `registration_units`: clears 20+ columns
  - `payment_transactions`: soft-deletes related rows
  - `MilestonePaymentTracking`: soft-deletes
  - `RegistrationUnitPaymentSchedule`: soft-deletes
  - `RegistrationUnitOffer`: soft-deletes
  - `ParkingInventory`: releases HOLD/BOOKED rows back to AVAILABLE
- Previous FRD §7 only mentioned RegistrationUnit + Unit + Python sync — incomplete.

### 11.7 Section 2 (Registration Status / availableForAllocation) <!-- BA correction: GAP-TL-040, GAP-TL-041, GAP-TL-042, GAP-TL-051, 2026-05-21 -->
- **Blocked during active campaign:** HTTP 400 "Cannot update registration-unit when campaign is active".
- **Skipped rows:** RegistrationUnit with status `WINNER` or `HOLD` are excluded from the update (`where: { status: { [Op.notIn]: ['WINNER','HOLD'] } }`).
- **Dual write:**
  - ALLOW → `status='PREALLOCATED', availableForAllocation=true`
  - FORBID → `status='WAITLIST', availableForAllocation=false`
  Previous FRD said only the boolean.
- **Side-effects:** Section 2 syncs Redis and triggers Python `/broadcast-registrations`.

### 11.8 Section 3 (Unit Cost Update) — chunking and validation <!-- BA correction: GAP-TL-043, GAP-TL-044, GAP-TL-045, GAP-TL-046, GAP-TL-048, 2026-05-21 -->
- **Chunked transactions:** rows processed in chunks of 250 with abort-after-2-failures (`admin.controller.js:1766-1928`).
- **Unit status transitions (strict):** ONLY `AVAILABLE ↔ RESERVED`. The previously documented `BOOKED → AVAILABLE` "high-risk operation" is NOT supported. Attempts will be rejected per chunk.
- **XLSX required columns:** `allocationAmount`, `allocationPercent`, `allocationCalcType` (`PERCENT` | `AMOUNT`). PERCENT mode requires `allocationPercent`; AMOUNT mode requires `allocationAmount`. Previous FRD §5 only listed `Agreement_Value` and `EarlyBird`.
- **Empty submission:** HTTP 400 "No rows marked for update".
- **Sample/Inventory downloads** exclude units with status BOOKED/HOLD/REFUGE/PBT — only AVAILABLE/RESERVED appear in samples (previous FRD implied "all unit prices").

### 11.9 Per-unit edit endpoint (pricing + status in one call) <!-- BA correction: GAP-TL-047, 2026-05-21 -->
- New endpoint: `PATCH /api/v1/admin/units/:id` (`updateUnitPriceByPrimaryId`). Accepts pricing fields and status in a single call. Not previously documented.

### 11.10 Bulk refund template typos and key mismatch <!-- BA correction: GAP-TL-049, GAP-TL-050, 2026-05-21 -->
- `downloadBulkRefundSample` template has a column-name typo: `upadte` (`admin.controller.js:1520`). Flag to Dev Agent.
- `bulkRefundRegistrationUnits` result file header reads "Registration Number" but the data key is `unitNumber`. Reconcile when QA validates the file.
