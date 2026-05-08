# BRD: CMS / Configuration Management

**Module:** CMS (Admin Configurations)  
**URL:** `https://uat-web.xrportal.in/admin/cms`  
**Sprint:** TBD  
**Author:** BA Agent  
**Created:** 2026-05-08  
**Status:** Draft

---

## 1. Purpose

The CMS (Config) module is the centralized system administration panel for the XR Portal. It consolidates all bulk operational actions and configuration toggles that affect platform-wide behavior: tower activation, registration eligibility, unit availability, unit pricing, booking cancellations, sales manager provisioning, customer registration limits by typology, and preference caps. It is the "control plane" of the portal — most changes here have immediate, system-wide impact on the customer experience.

**Business intent:** Give operations and admin teams a single screen for bulk data operations (via CSV/XLSX uploads) and system configuration toggles, without requiring developer intervention for routine tasks like updating unit prices, enabling new typology registrations, or allowing additional registrations.

> Domain Note: The nav item labeled "Config" in the left sidebar routes to `/admin/cms`. The nav item labeled "CMS" routes to an external portal at `https://manage-uat.xrportal.in/admin/auth/login`. This BRD covers only `/admin/cms`. The external CMS portal is out of scope.

---

## 2. Screens & Navigation

### 2.1 Navigation Path

Left sidebar → "Config" → `/admin/cms`

### 2.2 Screen Layout

Single long-scroll page with a top heading "Configurations" and 9 distinct functional sections:

| # | Section | Type |
|---|---------|------|
| 1 | Tower Configuration | Toggle grid + Save button |
| 2 | Registration Status | CSV/XLSX bulk upload + stats |
| 3 | Unit Status | CSV/XLSX bulk upload + stats |
| 4 | Unit Cost Update | XLSX download + upload |
| 5 | Bulk Booking Cancellation | CSV bulk upload |
| 6 | Bulk Registration Cancellation | CSV bulk upload |
| 7 | Sales Managers (bulk upload) | CSV bulk upload |
| 8 | Customer Actions Card | Toggle + typology limits |
| 9 | Max Preferences Per Unit | Numeric dropdown + Update |

---

## 3. Key Entities & Data Fields

### 3.1 Section 1: Tower Configuration

Controls which towers are visible to customers in the allocation flow.

| Element | Type | Description |
|---------|------|-------------|
| Tower card | Display | One card per tower; shows Tower Number + Tower Name |
| Active/Inactive toggle | Switch | Active = visible in customer portal; Inactive = hidden |
| "View Tower" button | Button | Navigates to that tower's detail page (`/admin/towers`) |
| "Update Tower Configuration" button | Submit | Saves all toggle changes as a batch |

**Observed Towers (UAT, 2026-05-08):** 18 towers total
- Tower 8 - Crest | Tower 9 - Triumph | Tower 10 - Crown | Tower 13 - Prestige
- Tower 14 - Horizon | Tower 15 - Radiance | Tower 6 - Aspire | Tower 7 - Blossom
- Tower 12 - Pinnacle | Tower 16 - Fortune | Tower 17 - Bright | Tower 18 - Grand
- Tower 1 - Dawn | Tower 2 - Aura | Tower 3 - Glory | Tower 4 - Pride
- Tower 5 - Grace | Tower 11 - Prime

All 18 towers are Active (checked) on UAT at time of exploration.

**Save behavior:** Toggle changes are not saved until "Update Tower Configuration" is clicked. Navigating away without saving reverts all unsaved changes.

**Success message:** "Tower Status Updated Successfully" (Ant Design message toast)

---

### 3.2 Section 2: Registration Status

Bulk upload to set individual registrations as Allowed or Forbidden for the allocation campaign.

| Element | Type | Description |
|---------|------|-------------|
| Sample File Download | Button | Downloads template CSV with required headers |
| Upload File | File input (hidden) | Accepts CSV file; triggered by "Upload File" button |
| Submit | Button | Processes the uploaded file |
| Total active registration | Stat display | Count of registrations currently in "Allow" status |
| Total inactive registration | Stat display | Count of registrations currently in "Forbid" status |

**Observed stats (UAT, 2026-05-08):**
- Total active registration: 8,675
- Total inactive registration: 5

**CSV Format (from TC_ADMIN_CMS.md):**

| Column | Required | Valid Values |
|--------|----------|-------------|
| Registration Number | Yes | Valid GHNG-XXXXXXXXXX format |
| Allocation Status | Yes | "Allow" or "Forbid" (exact case TBD) |

**Business Logic:**
- Allow = customer can participate in allocation campaign (see their registration as Available)
- Forbid = customer sees their registration as blocked from allocation
- Invalid Registration Number → error or skip (exact behavior: CLARIFICATION needed)
- Invalid Allocation Status value (e.g., "BLOCK") → error
- Wrong file format (e.g., .txt instead of .csv) → error

---

### 3.3 Section 3: Unit Status

Bulk upload to change individual unit availability status.

| Element | Type | Description |
|---------|------|-------------|
| Sample File Download | Button | Downloads template with headers |
| Upload File | File input | CSV file input |
| Submit | Button | Processes upload |
| Total active unit | Stat | Count of units currently marked AVAILABLE |
| Total inactive unit | Stat | Count of units currently RESERVED/DISABLED |

**Observed stats (UAT, 2026-05-08):**
- Total active unit: 3,778
- Total inactive unit: 737

**CSV Format (from TC_ADMIN_CMS.md):**

| Column | Required | Valid Values |
|--------|----------|-------------|
| Tower | Yes | Tower name |
| Floor | Yes | Floor number |
| Unit_No | Yes | Unit number |
| Unit_Type | Yes | Unit typology |
| Status | Yes | AVAILABLE or RESERVED (exact values: CLARIFICATION needed) |
| Update | Yes | 1 = apply this row's changes; 0 = skip this row |

**Business Logic:**
- Update = 1 → unit status changes to the specified Status value
- Update = 0 → row is skipped entirely; unit status unchanged
- This allows selective updates within a bulk file (include all units in file, set Update=0 for rows to skip)

---

### 3.4 Section 4: Unit Cost Update

Bulk update of unit pricing (Agreement Value + Early Bird discount).

| Element | Type | Description |
|---------|------|-------------|
| Available Unit Inventory Download | Button | Downloads current pricing for all available units as XLSX |
| Upload File | File input | Modified XLSX file re-uploaded |
| Submit | Button | Processes upload and updates pricing |
| Total active unit | Stat | Count of available units (same stat as Section 3) |
| Total inactive unit | Stat | Count of inactive units (same stat as Section 3) |

**XLSX Format (from TC_ADMIN_CMS.md):**

| Column | Required | Valid Values |
|--------|----------|-------------|
| Tower | Yes | Tower name |
| Floor | Yes | Floor number |
| Unit_No | Yes | Unit number |
| Agreement_Value | Yes | Positive integer (no currency symbol) |
| EarlyBird | Yes | Positive integer or 0 |
| Update | Yes | 1 = apply; 0 = skip |

**Business Logic:**
- Download gives you the current pricing snapshot (always fresh)
- Edit Agreement_Value and EarlyBird in the file; set Update=1 for changed rows
- Upload the file; system applies changes to matching units
- Invalid data type in Agreement_Value (e.g., "abc") → error; no partial update

> Domain Red Flag: Agreement Value is the base price shown to customers. Bulk update here during an active allocation campaign will immediately change what customers see in unit selection. There is no draft/preview mode. Admin must coordinate timing carefully. Flag for testing: update pricing during active campaign.

---

### 3.5 Section 5: Bulk Booking Cancellation

Bulk cancel completed bookings (allocation-confirmed + payment-received bookings).

| Element | Type | Description |
|---------|------|-------------|
| Sample File Download | Button | Downloads CSV template |
| Upload File | File input | CSV with unit registration numbers to cancel |
| Submit | Button | Processes cancellations |

**Business Logic:**
- Cancels bookings for specified unit registrations
- Status reverts from Booked/Allocated → Cancelled
- Refund trigger: CLARIFICATION needed — does system auto-trigger refund on cancellation?
- Units become available again after cancellation

> Domain Red Flag: Cancellation without refund trigger is a critical business rule violation. This must be verified: does Bulk Booking Cancellation auto-trigger the refund process?

---

### 3.6 Section 6: Bulk Registration Cancellation

Bulk cancel customer registrations (not just bookings — the registration record itself).

| Element | Type | Description |
|---------|------|-------------|
| Sample File Download | Button | Downloads CSV template |
| Upload File | File input | CSV with registration numbers to cancel |
| Submit | Button | Processes cancellations |

**Business Logic:**
- More severe than booking cancellation — cancels the entire registration record
- All unit registrations (A, B, C...) under the registration number are cancelled
- Refund eligibility: CLARIFICATION needed
- Use case: fraudulent registrations, duplicate entries, customer withdrawal pre-campaign

> Domain Red Flag: Registration cancellation affects ALL unit sub-registrations under the parent registration. A customer with 7 unit options (A through G) would lose all 7. Bulk operation here must require extra confirmation.

---

### 3.7 Section 7: Sales Managers (Bulk Upload)

Bulk creation or update of Sales Manager accounts via CSV.

| Element | Type | Description |
|---------|------|-------------|
| Sample File Download | Button | Downloads CSV template with SM fields |
| Upload File | File input | CSV with SM records to create/update |
| Submit | Button | Processes SM provisioning |

**CSV Format:** Not confirmed — sample file not downloaded during UAT exploration.

> CLARIFICATION-CMS-001: Does the SM bulk upload create new records, update existing ones (matched by email/phone?), or both? What is the merge key?

---

### 3.8 Section 8: Customer Actions Card

Controls what customers can do during the registration and allocation period.

| Element | Type | Description |
|---------|------|-------------|
| Allow Additional Registrations toggle | Switch | Active = customers can register additional units; Inactive = registration locked |
| Typology checkboxes | Checkbox (3 observed) | Controls which unit types customers can additionally register for |
| Typology limit dropdowns | Numeric dropdown | Maximum number of units of that typology a customer can add |
| Submit button | Button | Saves the current configuration |

**Observed Configuration (UAT, 2026-05-08):**

| Setting | State |
|---------|-------|
| Allow Additional Registrations | Active (checked toggle) |
| Allow 1 Bed Growth Home | Checked, limit = 15 |
| Allow 2 Bed Growth Home | Checked, limit = 17 |
| Allow 2 Bed Rise Home | Checked, limit = 20 |

**Business Logic:**
- When "Allow Additional Registrations" is Active AND a typology checkbox is checked: customers can add new registrations for that typology up to the specified limit
- When "Allow Additional Registrations" is Inactive: no typology is available regardless of checkbox state
- Limit value = maximum count of that typology a single customer account can hold
- Unchecking a typology prevents new registrations of that type even if the master toggle is Active
- Changes take effect immediately upon Submit

> Domain Red Flag: Enabling additional registrations during an active allocation campaign could allow customers to generate new unit preferences beyond what was originally allowed, potentially overwhelming the inventory pool. Must test interaction between this setting and active campaigns.

---

### 3.9 Section 9: Max Preferences Per Unit

Sets the maximum number of unit preference selections a customer can make per unit.

| Element | Type | Description |
|---------|------|-------------|
| "Max Preferences Per Unit" heading | Display | Section title |
| Description text | Display | "Set the maximum number of preferences a user can select for each unit" |
| Numeric dropdown | Combobox | Select the maximum value (observed current value: 6) |
| Update button | Button | Saves the selected limit |

**Observed value (UAT):** 6

**Business Logic:**
- During allocation campaign, when a customer opens unit selection, they can select a preference for up to N units
- If max = 6, a customer with 3 registrations can select preferences for 6 units total (2 per registration?)
- The exact relationship between preferences per registration vs. total preferences is a CLARIFICATION item

> CLARIFICATION-CMS-002: Is "Max Preferences Per Unit" a system-wide setting applied to all customers simultaneously, or per-campaign? And is the "per unit" phrasing accurate — does it mean per-unit-type, per-registration, or total preferences a customer can submit?

---

## 4. Business Workflows

### 4.1 Tower Configuration Update

```
Admin opens /admin/cms
    → Tower Configuration section shows all 18 towers with current Active/Inactive toggle state
    → Admin toggles one or more towers
    → Admin clicks "Update Tower Configuration"
    → Success toast: "Tower Status Updated Successfully"
    → Customer portal immediately reflects change (active/inactive towers visible/hidden)
```

**Gate:** Toggling without clicking Update does NOT save. Page reload reverts unsaved changes.

### 4.2 Registration Status Bulk Upload

```
Admin downloads Sample File (Registration Number | Allocation Status)
Admin prepares CSV with registrations to Allow or Forbid
Admin clicks "Upload File" → selects CSV
Admin clicks "Submit"
    → System processes each row
    → Success: stats update (Total active / inactive registration counts change)
    → Partial error: rows with invalid data skipped/rejected; report shown (TBD)
    → Full error: invalid file format rejected outright
```

### 4.3 Unit Status Bulk Upload

```
Admin downloads Sample File (Tower | Floor | Unit_No | Unit_Type | Status | Update)
Admin prepares CSV — sets Status and Update=1 for rows to change; Update=0 for rows to skip
Admin uploads and submits
    → Unit statuses update in DB
    → Tower floor/unit grid reflects new statuses
    → Stats on this page update accordingly
```

### 4.4 Unit Cost Update

```
Admin downloads "Available Unit Inventory Download" (current pricing XLSX)
Admin edits Agreement_Value and/or EarlyBird for target units; sets Update=1
Admin re-uploads the file
Admin clicks Submit
    → Unit pricing updated in DB
    → Customer portal unit detail panel reflects new pricing immediately
```

### 4.5 Bulk Booking / Registration Cancellation

```
Admin downloads Sample File
Admin prepares CSV with registration/unit registration numbers to cancel
Admin uploads and submits
    → Targeted registrations/bookings cancelled
    → Units released back to inventory (status resets)
    → Refund process triggered (assumed — CLARIFICATION needed)
```

### 4.6 Customer Actions Card Configuration

```
Admin reviews current state of Allow Additional Registrations and typology toggles
Admin adjusts as needed (master toggle, typology checkboxes, limits)
Admin clicks Submit
    → Configuration saved immediately
    → Customer portal reflects new registration eligibility
```

### 4.7 Max Preferences Per Unit Update

```
Admin selects new value from dropdown (e.g., changes from 6 to 4)
Admin clicks Update
    → System-wide preference cap updated
    → Active customer sessions that have already submitted preferences are unaffected?
       (CLARIFICATION needed — does reducing the cap retroactively invalidate existing preferences?)
```

---

## 5. Filters & Search Capabilities

No filters or search on the CMS page itself — all sections are direct configuration panels, not data tables.

---

## 6. KPIs / Dashboard Metrics

| Metric | Section | Value (UAT, 2026-05-08) |
|--------|---------|------------------------|
| Total active registration | Registration Status | 8,675 |
| Total inactive registration | Registration Status | 5 |
| Total active unit | Unit Status | 3,778 |
| Total inactive unit | Unit Status | 737 |
| Total active unit | Unit Cost Update | 3,778 (same data, same stats block) |
| Total inactive unit | Unit Cost Update | 737 (same data) |

---

## 7. Integration Points

| Module | Relationship |
|--------|-------------|
| Towers | Tower Configuration section directly controls Tower active/inactive; "View Tower" links to /admin/towers per-tower view |
| Allocation | Registration Status controls which customers can participate in campaigns; Unit Status controls which units appear in the grid; Max Preferences controls how many units a customer can select |
| Customers | Registration cancellation affects customer records; Customer Actions Card controls what customers can do in their portal |
| Sales Managers | SM bulk upload provisions SM accounts used in the Sales Managers module |
| Offers | Unit Cost Update overlaps with Offers module — both affect the pricing customers see. Agreement Value is set here; Offer discounts are managed in Offers module |
| Customer Portal | All sections on this page have direct, real-time effect on the customer-facing portal (XR Portal customer site) |

---

## 8. Acceptance Criteria (High-Level)

### AC-CMS-001: Tower Configuration
- All 18 towers displayed with correct names and current toggle state
- Toggle change + "Update Tower Configuration" → success toast + persisted state on reload
- Toggle change WITHOUT clicking Update → reload reverts to previous state
- "View Tower" button navigates to correct tower page

### AC-CMS-002: Registration Status
- Sample CSV download has correct headers: "Registration Number", "Allocation Status"
- Valid CSV with Allow/Forbid statuses → success; stat counts update
- Invalid registration number row → error or row skipped (verify error message)
- Invalid Allocation Status value → error
- Non-CSV file upload → file format error

### AC-CMS-003: Unit Status
- Sample CSV download has headers: Tower, Floor, Unit_No, Unit_Type, Status, Update
- Valid CSV with Update=1 rows → status changes reflected in unit grid
- Rows with Update=0 → skipped; unit status unchanged
- Invalid status value → error
- Stats update after successful upload

### AC-CMS-004: Unit Cost Update
- "Available Unit Inventory Download" downloads XLSX with current pricing for all available units
- Valid XLSX with updated Agreement_Value and EarlyBird → pricing updated
- Invalid data type in Agreement_Value (e.g., alphabetic) → error; no partial update
- Updated pricing immediately visible on customer portal unit detail

### AC-CMS-005: Bulk Booking Cancellation
- Sample CSV download
- Valid CSV → selected bookings cancelled; units return to available status
- Refund trigger confirmed (or documented as manual if not auto-triggered)
- Invalid booking reference → error or skip

### AC-CMS-006: Bulk Registration Cancellation
- Sample CSV download
- Valid CSV → registrations cancelled; all sub-registrations (A, B, C...) cancelled
- Invalid registration number → error or skip

### AC-CMS-007: Sales Manager Bulk Upload
- Sample CSV download reveals correct headers
- Valid CSV → SM accounts created/updated in Sales Managers module
- Duplicate records handled gracefully (no duplicate SM accounts created)

### AC-CMS-008: Customer Actions Card
- "Allow Additional Registrations" master toggle controls access
- When master toggle is Active: checked typologies with limit > 0 are available to customers
- When master toggle is Inactive: no typologies available regardless of checkbox state
- Typology limit dropdown values are selectable and saved correctly
- Submit persists configuration immediately

### AC-CMS-009: Max Preferences Per Unit
- Current value (6) displayed in dropdown
- Selecting a new value and clicking Update → value saved
- Customer preference cap reflects updated value in allocation flow
- Reducing cap below current customer preference counts: behavior must be confirmed

---

## 9. Out of Scope / UAT Limitations

1. **External CMS portal:** The nav item "CMS" linking to `https://manage-uat.xrportal.in/admin/auth/login` is a separate product. Not covered by this BRD.
2. **Bulk cancellation refund flow:** Whether refunds are automatically triggered during Bulk Booking/Registration Cancellation requires integration with the payment gateway. Cannot be safely tested on UAT without creating real transactions.
3. **Sample file column headers for SM bulk upload and cancellation sections:** Not confirmed — requires downloading each sample file.
4. **Customer portal cross-verification:** Changes to Customer Actions Card and Max Preferences require a separate customer portal session to verify impact. Not feasible in a single admin session.
5. **Partial upload error reporting:** The exact error format (toast? table? row-by-row report?) for invalid rows in bulk uploads is not confirmed.

### Open Clarifications

| ID | Question | Impact |
|----|----------|--------|
| CLARIFICATION-CMS-001 | Does SM bulk upload create new SMs, update existing, or both? What is the merge key? | SM bulk upload test |
| CLARIFICATION-CMS-002 | Is "Max Preferences Per Unit" system-wide or per-campaign? Does it mean per-registration or total per customer? | Preference cap test |
| CLARIFICATION-CMS-003 | Does Bulk Booking Cancellation auto-trigger a refund, or is refund a separate manual step? | Cancellation domain rule |
| CLARIFICATION-CMS-004 | Does Bulk Registration Cancellation auto-trigger a refund for already-paid registrations? | Cancellation domain rule |
| CLARIFICATION-CMS-005 | What are the exact valid Status values in the Unit Status CSV (AVAILABLE and what else)? | Unit Status test |
| CLARIFICATION-CMS-006 | Is Allocation Status in Registration Status CSV case-sensitive ("Allow" vs "allow")? | Validation test |
| CLARIFICATION-CMS-007 | What are the column headers in the Bulk Booking Cancellation sample CSV? | Cancellation test |
| CLARIFICATION-CMS-008 | What are the column headers in the Bulk Registration Cancellation sample CSV? | Cancellation test |
| CLARIFICATION-CMS-009 | When Max Preferences Per Unit is reduced below a customer's existing selection count, are existing preferences invalidated or preserved? | Edge case test |
| CLARIFICATION-CMS-010 | What is the exact error format for invalid rows in bulk uploads — per-row report, summary, or toast? | Error handling tests |
