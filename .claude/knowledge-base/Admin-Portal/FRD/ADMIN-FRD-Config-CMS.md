---
module: Config CMS
url: https://uat-web.xrportal.in/admin/cms
sprint: 2
status: Automated
spec: tests/ui/config.spec.js
tcs: TC_CFG_001–053 (52 total)
updated: 2026-05-10
---

# Module — Config / CMS

## 1. Overview

Centralized system administration panel. Single long-scroll page with 9 functional sections for bulk operational actions and configuration toggles: tower activation, registration eligibility, unit availability, pricing, booking cancellations, SM provisioning, customer registration limits, and preference caps.

**Business intent:** Single-screen bulk operations via CSV/XLSX and system config toggles without developer intervention.

**URL:** `https://uat-web.xrportal.in/admin/cms`
**Auth:** Required — `src/fixtures/.auth/admin.json`
**Page Object:** `src/pages/ConfigPage.js`
**Selectors:** `docs/selectors/config.json`

> **IMPORTANT disambiguation:** Left sidebar "Config" → `/admin/cms` (THIS module). Left sidebar "CMS" → `manage-uat.xrportal.in` (external portal — OUT OF SCOPE).

## 2. Navigation

Left sidebar → "Config" → `/admin/cms`

## 3. Page Layout

Single long-scroll page with 9 stacked sections:

| # | Section Heading | Type | TCs |
|---|----------------|------|-----|
| 1 | Tower Configuration | Toggle grid + Save | TC_CFG_001–006 |
| 2 | Registration Status | CSV bulk upload | TC_CFG_020–024 |
| 3 | Unit Status | CSV bulk upload | TC_CFG_025–030 |
| 4 | Unit Cost Update | XLSX download + upload | TC_CFG_031–034 |
| 5 | Bulk Booking Cancellation | CSV bulk upload | TC_CFG_035–037 |
| 6 | Bulk Registration Cancellation | CSV bulk upload | TC_CFG_038–040 |
| 7 | Sales Managers | XLSX bulk upload | TC_CFG_041–048 |
| 8 | Customer Actions Card | Toggle + dropdowns | TC_CFG_011–013 |
| 9 | Max Preferences Per Unit | Dropdown + Update button | TC_CFG_007–010 |

**Additional:** Sample downloads (TC_CFG_014–019), Customer Portal tests (TC_CFG_049–053)

### Critical Selector Patterns

- **Section scoping:** `getSectionCard('SectionName')` → XPath parent traversal from `h5[text]`. Sections do NOT use `.ant-card` — always use XPath, never `.ant-card.filter()`
- **Tower toggles:** `page.evaluate()` DOM traversal via `getTowerToggleInfo('Tower N - Name')`
- **View Tower button:** `page.evaluate()` to find button index → `page.locator('button').nth(index).click()` — JS click does not trigger React navigation
- **Customer Actions toggle:** `page.evaluate()` from `h5 'Allow Additional Registrations:'`
- **Customer Actions dropdowns:** scope to `.ant-select-dropdown:not(.ant-select-dropdown-hidden)` — multiple hidden dropdowns in DOM
- **Toast:** `.ant-message-notice` or `.ant-message-success`

### Section 1 — Tower Configuration

18 towers in a 2-column grid. Each tower card has an H5 heading, "View Tower >" green link, and Active/Inactive toggle (`.ant-switch`).

**Save button:** `button:has-text('Update Tower Configuration')` — changes are NOT saved until clicked.
**Success toast:** "Tower Status Updated Successfully"

**Tower list with names and UAT default state:**

| Tower No | Name | UAT Default |
|----------|------|-------------|
| Tower 1 | Dawn | Inactive |
| Tower 2 | Aura | Inactive |
| Tower 3 | Glory | Inactive |
| Tower 4 | Pride | Inactive |
| Tower 5 | Grace | Inactive |
| Tower 6 | Aspire | Inactive |
| Tower 7 | Blossom | Inactive |
| Tower 8 | Crest | **Active** (reliable baseline) |
| Tower 9 | Triumph | Inactive |
| Tower 10 | Crown | **Active** (reliable baseline) |
| Tower 11 | Prime | Inactive |
| Tower 12 | Pinnacle | Inactive |
| Tower 13 | Prestige | Inactive |
| Tower 14 | Horizon | Inactive (modified by TC_CUST_017 — do NOT rely on Active) |
| Tower 15 | Radiance | Inactive |
| Tower 16 | Fortune | Inactive |
| Tower 17 | Bright | Inactive |
| Tower 18 | Grand | Inactive |

### Sections 2–7 — Upload Sections

All follow the same pattern: Download sample → prepare file → Upload File → Submit.

| Section | Download Button | Accept |
|---------|----------------|--------|
| Registration Status | Sample File Download | `.xlsx,.csv` |
| Unit Status | Sample File Download | `.xlsx,.csv` |
| Unit Cost Update | Available Unit Inventory Download | `.xlsx,.csv` |
| Bulk Booking Cancellation | Sample File Download | `.xlsx` |
| Bulk Registration Cancellation | Sample File Download | `.xlsx` |
| Sales Managers | Sample File Download | `.xlsx` |

**Critical:** Multiple "Upload File" and "Submit" buttons on the page — always scope to section card using `getSectionCard('Section Name')`.

**CSV/XLSX Formats:**

| Section | Columns |
|---------|---------|
| Registration Status | `Registration Number` \| `Allocation Status` (Allow / Forbid) |
| Unit Status | `Tower` \| `Floor` \| `Unit_No` \| `Unit_Type` \| `Status` (AVAILABLE/?) \| `Update` (1=apply, 0=skip) |
| Unit Cost Update | `Tower` \| `Floor` \| `Unit_No` \| `Agreement_Value` \| `EarlyBird` \| `Update` (1/0) |
| Sales Managers | `Role` \| `First Name` \| `Last Name` \| `Email` \| `Phone` \| `IS_AVAILABLE` \| `IS_ACTIVE` |

> Note: Bulk Booking Cancellation and Bulk Registration Cancellation CSV column headers are unconfirmed (Q-CMS-007, Q-CMS-008).

### Section 8 — Customer Actions Card

Controls whether customers can add additional unit registrations from the Customer Portal.

| Element | Selector Strategy |
|---------|------------------|
| Allow Additional Registrations toggle | `page.evaluate()` from `h5 'Allow Additional Registrations:'` → `.ant-switch` |
| 1 Bed Growth Home checkbox | `h6:has-text('Allow 1 Bed Growth Home')` → nearest checkbox |
| 2 Bed Growth Home checkbox | `h6:has-text('Allow 2 Bed Growth Home')` → nearest checkbox |
| 2 Bed Rise Home checkbox | `h6:has-text('Allow 2 Bed Rise Home')` → nearest checkbox |
| Count dropdowns | `.ant-select` scoped to each bed type row |
| Submit button | `button:has-text('Submit')` scoped to Customer Actions Card |

**UAT State (2026-05-08):**
- Allow Additional Registrations: Active
- 1 Bed Growth Home: checked, limit = 15
- 2 Bed Growth Home: checked, limit = 17
- 2 Bed Rise Home: checked, limit = 20

Master toggle OFF → no typologies available regardless of individual checkboxes.

### Section 9 — Max Preferences Per Unit

| Element | Selector |
|---------|---------|
| Dropdown | `.ant-select-selector` scoped to Max Preferences Per Unit card |
| Update button | `button:has-text('Update')` scoped to Max Preferences Per Unit card |

**Current value (UAT 2026-05-08):** 6

System-wide cap on how many unit preferences a customer can submit. Whether this is per-campaign or system-wide is unconfirmed (Q-CMS-002).

## 4. Features

- Tower activation/deactivation (batch toggle + explicit save)
- Registration status bulk update (CSV)
- Unit status bulk update (CSV)
- Unit cost (pricing) bulk update (XLSX download current + re-upload)
- Bulk booking cancellation (CSV)
- Bulk registration cancellation (CSV)
- Sales Manager provisioning (XLSX bulk upload)
- Customer Actions Card (typology access control + registration limits)
- Max Preferences Per Unit cap setting
- Sample file downloads for all upload sections

## 4a. How to Use

### Accessing Config

1. Left sidebar → click **"Config"** → `/admin/cms`
2. Page is a single long scroll with 9 sections — scroll down to find the section you need

### Section 1 — Activating or Deactivating Towers

1. Scroll to **"Tower Configuration"** section
2. Each of the 18 towers has a toggle (Active / Inactive)
3. Click the toggle to flip the state (green = Active, grey = Inactive)
4. After making all changes → click **"Update Tower Configuration"**
5. Toast "Tower Status Updated Successfully" confirms the save

> Changes are **not saved** until you click the button. Leaving the page without clicking discards changes.

### Section 2 — Updating Registration Status (Bulk)

1. Click **Sample File Download** in the Registration Status section to get the template
2. Fill in: `Registration Number` | `Allocation Status` (Allow = eligible for campaign / Forbid = blocked)
3. Upload the filled file → click **Submit**
4. Toast confirms success; eligible registrations will be updated in the next campaign

### Section 3 — Updating Unit Status (Bulk)

1. Click **Sample File Download** → fill in: `Tower`, `Floor`, `Unit_No`, `Unit_Type`, `Status`, `Update` (1=apply, 0=skip)
2. Upload → Submit
3. Set `Update=0` for any rows you want to skip

### Section 4 — Updating Unit Pricing (Bulk)

1. Click **"Available Unit Inventory Download"** → get current pricing spreadsheet
2. Edit `Agreement_Value` and `EarlyBird` columns for the units you want to change; set `Update=1`
3. Upload the edited file → Submit

> **Warning:** Pricing changes take effect **immediately**, including during active allocation campaigns. Double-check before uploading.

### Section 5/6 — Bulk Booking or Registration Cancellation

1. Click **Sample File Download** → follow template format
2. Upload filled file → Submit

> **Warning:** Bulk Registration Cancellation cancels ALL sub-registrations (A, B, C…) for each matched registration. Irreversible.

### Section 7 — Adding or Updating Sales Managers (Bulk)

1. Click **Sample File Download** → fill template (Role / First Name / Last Name / Email / Phone / IS_AVAILABLE / IS_ACTIVE)
2. Upload `.xlsx` file → Submit
3. Existing SM with matching phone → Updated; new phone → Created

### Section 8 — Customer Actions Card (Typology Registration Limits)

1. Scroll to **"Customer Actions Card"** section
2. **Master toggle** (Allow Additional Registrations): ON = customers can add extra unit registrations; OFF = blocks all additional registrations regardless of typology settings
3. Check/uncheck individual typology checkboxes (1 Bed Growth Home / 2 Bed Growth Home / 2 Bed Rise Home) to control which unit types can be registered
4. Use dropdowns to set per-typology registration count limits
5. Click **Submit** to save

### Section 9 — Max Preferences Per Unit

1. Scroll to **"Max Preferences Per Unit"** section
2. Select the maximum count from the dropdown (current default: 6)
3. Click **"Update"** to save

---

## 5. Business Rules

1. Tower configuration changes are NOT saved until "Update Tower Configuration" is clicked
2. Unit Cost Update takes effect immediately during active allocation campaigns — no draft/preview
3. All bulk upload sections follow: Download sample → prepare → Upload → Submit
4. Update=1 in Unit Status CSV applies the change; Update=0 skips the row
5. Customer Actions Card master toggle OFF overrides all typology checkboxes
6. Max Preferences Per Unit is a system-wide cap (per-campaign scope unconfirmed — Q-CMS-002)
7. Bulk Booking Cancellation releases units back to inventory; refund trigger unconfirmed (Q-CMS-003)
8. Bulk Registration Cancellation cancels ALL sub-registrations (A, B, C...) for matched registrations — cascading impact (Q-CMS-004)
9. Unit Status CSV: AVAILABLE confirmed; other valid values unconfirmed (Q-CMS-005)
10. Registration Status CSV Allocation Status case-sensitivity unconfirmed (Q-CMS-006)
11. Campaign handling required for Registration Status + Unit Cost uploads when an active campaign exists

## 6. Integration Points

| Module | Relationship |
|--------|-------------|
| Towers | Tower Configuration section directly controls tower Active/Inactive state |
| Customers | Active Towers count KPI cross-checked in TC-CST-006/TC-CST-017; Registration/Booking cancellations affect customer records |
| Allocation | Registration Status controls campaign participation eligibility; Unit Status controls unit availability grid; Max Preferences controls selection count |
| Sales Managers | Section 7 bulk upload provisions SM accounts |
| Offers | Unit Cost Update sets Agreement Value — base pricing on which Offers discounts are applied |

## 7. Domain Red Flags

| Flag | Severity | Impact |
|------|----------|--------|
| Unit Cost Update immediate during active campaign | HIGH | Price changes take effect instantly with no confirmation or preview — mid-booking customers affected |
| Bulk Booking Cancellation refund trigger unconfirmed | HIGH | Cancelling bookings may or may not auto-trigger refunds — domain rule unclear |
| Bulk Registration Cancellation cascades to ALL sub-registrations | HIGH | One CSV row cancels ALL sub-registrations (A, B, C...) — irreversible bulk impact |
| Customer Actions Card change mid-campaign | MEDIUM | Reducing typology limits mid-campaign may cause inventory overflow or customer confusion |
| BUG_010 (open) | MEDIUM | Registration Status → Submit without selecting file → no validation shown (silent failure) |

## 8. Open Clarifications

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-CMS-001 | SM bulk upload — does it create new SMs, update existing, or both? What is the merge key (phone/email)? | SM bulk TC | ⏳ Open |
| Q-CMS-002 | Is "Max Preferences Per Unit" system-wide or per-campaign? Does "per unit" mean per-registration, per-unit-type, or total per customer? | Preference cap TC | ⏳ Open |
| Q-CMS-003 | Does Bulk Booking Cancellation auto-trigger a refund, or is refund a manual step? | HIGH domain rule | ⏳ Open |
| Q-CMS-004 | Does Bulk Registration Cancellation auto-trigger a refund for already-paid registrations? | HIGH domain rule | ⏳ Open |
| Q-CMS-005 | What are the valid Status values in Unit Status CSV? "AVAILABLE" confirmed — what is the other valid value? | Unit Status TC | ⏳ Open |
| Q-CMS-006 | Is Allocation Status in Registration Status CSV case-sensitive? ("Allow" vs "allow" vs "ALLOW") | Validation TC | ⏳ Open |
| Q-CMS-007 | What are the column headers in Bulk Booking Cancellation sample CSV? | Cancellation TC | ⏳ Open |
| Q-CMS-008 | What are the column headers in Bulk Registration Cancellation sample CSV? | Cancellation TC | ⏳ Open |
| Q-CMS-009 | If Max Preferences Per Unit is reduced below a customer's already-selected count, are existing preferences invalidated or preserved? | Edge case TC | ⏳ Open |
| Q-CMS-010 | What is the error format for invalid rows in bulk uploads — per-row report, summary count, or generic toast? | Error handling TC | ⏳ Open |

## 9. Test Coverage

| Coverage Area | TCs | Status |
|---------------|-----|--------|
| Tower Configuration | TC_CFG_001–006 | ✅ Full |
| Max Preferences Per Unit | TC_CFG_007–010 | ✅ Full |
| Customer Actions Card | TC_CFG_011–013 | ✅ Full |
| Sample Downloads | TC_CFG_014–019 | ✅ Full |
| Registration Status Upload | TC_CFG_020–024 | ✅ Full (2 ENV SKIP) |
| Unit Status Upload | TC_CFG_025–030 | ✅ Full |
| Unit Cost Update | TC_CFG_031–034 | ✅ Full |
| Bulk Booking Cancellation | TC_CFG_035–037 | ✅ Full |
| Bulk Registration Cancellation | TC_CFG_038–040 | ✅ Full (1 ENV SKIP) |
| Sales Managers Upload | TC_CFG_041–048 | ✅ Full |
| Customer Portal (Add Units + Payment) | TC_CFG_049–053 | ✅ Full (ENV SKIP — Easebuzz bot detection) |

**Open bug:** BUG_010 — Registration Status → Submit without file → silent failure (no validation shown). Dev fix needed.

**ENV SKIP root cause:** Easebuzz payment SDK detects automated browser (`navigator.webdriver`, CDP fingerprint) and never renders payment method options. Manual testing required for payment flows.

**UAT Stats (2026-05-08):**
- Total active registrations: 8,675 | inactive: 5
- Total active units: 3,778 | inactive: 737

---

## 10. API Reference

All endpoints require admin JWT. Prefix: `/api/v1/admin`

### Tower Configuration (Section 1)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/towers` | Get all towers with current active/inactive state |
| PUT | `/api/v1/admin/towers/status-update` | Save tower active/inactive batch (body: `{ towerIds: [], isActive: true/false }`) |

### Registration Status (Section 2)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/export-all-registrations-status` | Download current registrations CSV |
| POST | `/api/v1/admin/update-registrations-status` | Upload CSV to change allocationStatus per registration |

**CSV format:** `Registration Number` | `Allocation Status` (Allow = set available / Forbid = block from campaign)

### Unit Status (Section 3)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/export-all-units-status` | Download all units status CSV |
| POST | `/api/v1/admin/update-units-status` | Upload CSV to change unit availability |

**CSV format:** `Tower` | `Floor` | `Unit_No` | `Unit_Type` | `Status` | `Update` (1=apply, 0=skip)

### Unit Cost Update (Section 4)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/export-all-units-price` | Download current unit inventory with pricing XLSX |
| POST | `/api/v1/admin/update-units-price` | Upload XLSX to update `agreementValue` and `earlyBirdBenefit` per unit |

**Upload format:** `Tower` | `Floor` | `Unit_No` | `Agreement_Value` | `EarlyBird` | `Update` (1/0)

### Bulk Booking / Registration Cancellation (Sections 5–6)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| PUT | `/api/v1/admin/cancel-units` | Cancel booking units (JSON body) |
| POST | `/api/v1/admin/cancel-units-excel` | Cancel via Excel upload (field: `doc`) |
| GET | `/api/v1/admin/bulk-cancel-sample` | Download bulk cancellation sample |
| GET | `/api/v1/admin/bulk-refund-sample` | Download bulk refund sample |

### Sales Managers Bulk Upload (Section 7)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/sales-manager-sample` | Download SM sample XLSX |
| POST | `/api/v1/admin/sales-managers-import` | Upload XLSX to create/update SMs |

**Merge key for SM bulk upload:** Phone number — if phone matches existing record, UPDATE; otherwise CREATE.

### Customer Actions Card (Section 8)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/customer-actions` | Get current configuration |
| POST | `/api/v1/admin/customer-actions` | Update (body: `{ allowAdditionalRegistration: bool, typologies: [{id, count}] }`) |

### Max Preferences Per Unit (Section 9)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/max-preferences-per-unit` | Get current value |
| PUT | `/api/v1/admin/max-preferences-per-unit/:projectId` | Update value for project |

### MasterConfig model

Customer Actions and Max Preferences are stored in the `master_configs` table as key-value pairs. Changes are stored via `POST /master-config/store` with `{ key: 'setting_name', value: '...' }` pairs.

| Config Key | Controls |
|------------|---------|
| `allowAdditionalRegistration` | Master toggle for Customer Actions |
| `max_preferences_per_unit` | Max unit preferences per customer |
| `allowedTypologies` | Which typology registrations can be added |
