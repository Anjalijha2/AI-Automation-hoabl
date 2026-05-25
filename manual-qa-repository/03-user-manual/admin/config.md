# Admin Portal — Config / CMS Module User Guide

**Audience:** Admin / Sales Manager Admin
**URL:** `https://uat-web.xrportal.in/admin/cms`
**Sources:** ADMIN-BRD-Config-CMS.md · ADMIN-FS-Config-CMS.md
**Last Updated:** 2026-05-22

---

## Overview

Config (titled "Configurations" in the portal) is the system administration control panel — a single long-scrolling page containing **9 operational sections** that let admins make bulk changes to towers, units, registrations, sales managers, and customer-facing controls without needing engineering help. Most changes here take effect **immediately** across the live platform; only **Tower Configuration** (Section 1) requires an explicit Save click to persist.

Reach this page from the left sidebar → **Config** → `/admin/cms`.

> **Disambiguation:** The sidebar also has a **CMS** entry — that opens an external Strapi instance (`manage-uat.xrportal.in`) and is documented in `admin-cms.md`, not here. This file documents the **Config** page only.

---

## Page Layout (At a Glance)

Scroll down to find each section in order:

| # | Section | What it does |
|---|---------|--------------|
| 1 | Tower Configuration | Toggle towers Active/Inactive |
| 2 | Registration Status | Bulk allow/forbid registrations from participating in campaigns |
| 3 | Unit Status | Bulk change unit availability (AVAILABLE ↔ RESERVED) |
| 4 | Unit Cost Update | Bulk update unit pricing |
| 5 | Bulk Booking Cancellation | Cancel multiple bookings (WINNER status only) |
| 6 | Bulk Registration Cancellation | Cancel entire registrations and all sub-registrations |
| 7 | Sales Managers | Bulk add/update SM accounts |
| 8 | Customer Actions Card | Control which typologies buyers can register for |
| 9 | Max Preferences Per Unit | Cap on buyer preferences per unit |

Sections 2–7 follow the same Download Sample → Edit → Upload → Submit pattern.

---

# Feature 1 — Tower Configuration

### What it does
Activates or deactivates individual towers across the project. Active towers appear in the allocation unit grid and contribute to the Active Towers KPI; inactive towers are hidden from buyers.

### Preconditions
- Admin session.

### How to use
1. Scroll to **Tower Configuration** at the top of the page. 18 tower cards are shown.
2. Flip the **Active / Inactive** toggle on each tower card you want to change (green = Active, grey = Inactive).
3. Optionally click **View Tower >** on any card to jump directly to that tower's grid in the Towers module.
4. When all changes are made, click **Update Tower Configuration** at the bottom of this section.
5. Toast: **"Tower Status Updated Successfully"**.

### Result
- Backend hits `PUT /api/v1/admin/towers/status-update` with `[{ towerId, isActive }, ...]`.
- Active Towers KPI in Customers + Towers dashboards refreshes.
- Python WebSocket service is notified to refresh the real-time unit cache.

### Warnings
- **Changes are NOT saved** until you click Update Tower Configuration. Leaving the page discards toggle changes.
- Toggling Active during a **live allocation campaign** immediately exposes the tower's units to all buyers in session — coordinate with sales before doing this.
- **No-op toggles** (toggling to the same state) skip audit-log emission.

### Current UAT state
Tower 8 (Crest) and Tower 10 (Crown) are Active by default; the other 16 towers are Inactive.

---

# Feature 2 — Registration Status Bulk Update

### What it does
Controls which registrations are eligible to participate in upcoming allocation campaigns. Uploads a CSV that flips each row to Allow (eligible) or Forbid (blocked).

### Preconditions
- Admin session.
- **No allocation campaign is currently Active** (the endpoint is blocked during active campaigns — see Warnings).

### How to use
1. Scroll to **Section 2 — Registration Status**.
2. Click **Sample File Download** to get the current registration export.
3. Edit the CSV:
   - **Registration Number** — e.g. `GHNG-1000008563-A`
   - **Allocation Status** — `Allow` or `Forbid` (case-insensitive)
4. Click **Upload File**, select the CSV (`.xlsx` and `.csv` accepted).
5. Click **Submit**.

### Result — corrected (GAP-TL-042)
The backend performs a **dual write** per row:
- **Allow** → `RegistrationUnit.status = 'PREALLOCATED'` AND `availableForAllocation = true`
- **Forbid** → `RegistrationUnit.status = 'WAITLIST'` AND `availableForAllocation = false`

Side-effects (GAP-TL-051): Redis is synced and Python fires `/broadcast-registrations` for WebSocket fan-out.

### Validation rules
| Rule | Behaviour |
|------|-----------|
| Active campaign running | HTTP 400 "Cannot update registration-unit when campaign is active" (GAP-TL-040) |
| Row matches a WINNER or HOLD registration | Row is **skipped** (`status NOT IN ['WINNER','HOLD']` filter — GAP-TL-041) |
| Unrecognised registration number | Row skipped or flagged in result |
| **Submit without selecting a file** | Silent failure — no error shown (**Known bug BUG_010**) |

### Warning
Always select a file before clicking Submit — there is no client-side validation guard yet.

---

# Feature 3 — Unit Status Bulk Update

### What it does
Bulk change unit availability via CSV upload. Strictly `AVAILABLE ↔ RESERVED` transitions only.

### Preconditions
- Admin session.

### How to use
1. Scroll to **Section 3 — Unit Status**.
2. Click **Sample File Download**.
3. Edit the CSV columns: Tower, Floor, Unit_No, Unit_Type, **Status** (`AVAILABLE` or `RESERVED`), **Update** (`1` = apply, `0` = skip).
4. Click **Upload File** then **Submit**.

### Result
- `Unit.status` updated per row.
- Python service refreshes the real-time unit cache.
- Audit log captures per-unit changes (Unit model has `auditEnabled=true`).

### Validation rules — corrected (GAP-TL-044)
**Only `AVAILABLE ↔ RESERVED` transitions are supported.** The previously documented "BOOKED → AVAILABLE" path is NOT supported by source — rows attempting it are rejected per chunk. Do not try to release sold units via this section.

---

# Feature 4 — Unit Cost Update (Pricing Bulk Update)

### What it does
Bulk-updates unit pricing via XLSX upload. Changes are **immediate** — there is no draft or preview step.

### Preconditions
- Admin session.

### How to use
1. Scroll to **Section 4 — Unit Cost Update**.
2. Click **Available Unit Inventory Download** to get the current pricing XLSX.
3. Edit the file. Required columns (corrected — GAP-TL-045):
   - `allocationAmount`
   - `allocationPercent`
   - `allocationCalcType` — `PERCENT` or `AMOUNT`
   - PERCENT mode requires `allocationPercent`; AMOUNT mode requires `allocationAmount`.
   - `Update` — `1` to apply, `0` to skip.
4. Click **Upload File** then **Submit**.

### Result
- Processed in **chunks of 250 rows**; aborts after 2 chunk failures (GAP-TL-043).
- `Unit.agreementValue` and `Unit.earlyBirdBenefit` updated per row.
- All new unit detail requests return updated pricing immediately.

### Validation rules
| Rule | Behaviour |
|------|-----------|
| Empty submission / no rows marked `Update=1` | HTTP 400 "No rows marked for update" (GAP-TL-046) |
| Chunk fails twice | Whole upload aborted (chunked transactions) |
| Sample / Inventory download | Excludes units with status `BOOKED`, `HOLD`, `REFUGE`, `PBT` — only `AVAILABLE` and `RESERVED` appear (GAP-TL-048) |

### Warning — CRITICAL
Price changes take effect immediately, including during live allocation campaigns. Buyers viewing unit details mid-session will see new prices on next calculation; buyers who have already paid are NOT affected (booking is locked). Coordinate with the sales team before mid-campaign repricing.

### New endpoint — per-unit edit (GAP-TL-047)
`PATCH /api/v1/admin/units/:id` accepts pricing fields AND status in a single call. Useful for one-off corrections; not exposed via this section's UI.

---

# Feature 5 — Bulk Booking Cancellation

### What it does
Cancels multiple unit bookings in one operation via XLSX upload. Releases the associated units back to AVAILABLE.

### Preconditions — corrected
- Admin session.
- **No allocation campaign is currently Active** (GAP-TL-036).
- **No Mavis booking exists** for the bookingNumber being cancelled (GAP-TL-037).
- The RegistrationUnit row must be in **`WINNER`** status only (GAP-TL-038).

### How to use
1. Scroll to **Section 5 — Bulk Booking Cancellation**.
2. Click **Sample File Download**.
3. Fill the template with one row per booking to cancel.
4. Click **Upload File** then **Submit**.

### Result — corrected cascade (GAP-TL-052)
The cancellation cascades via raw SQL across at least **6 tables**:
- `registration_units` — 20+ columns cleared
- `payment_transactions` — soft-deleted
- `MilestonePaymentTracking` — soft-deleted
- `RegistrationUnitPaymentSchedule` — soft-deleted
- `RegistrationUnitOffer` — soft-deleted
- `ParkingInventory` — HOLD/BOOKED rows released to AVAILABLE
- `Unit.status` → `AVAILABLE`; Python notified.

### Warnings
- **Refund is NOT auto-triggered.** A financial refund must be initiated separately.
- Non-WINNER rows are skipped with "Not cancelable" in the result file.
- When querying Mavis, bookingNumber is prefixed `D` (dev) or `U` (uat); production uses the raw value (GAP-TL-039).
- Permanent and irreversible.

---

# Feature 6 — Bulk Registration Cancellation

### What it does
Cancels entire registrations (including all sub-registrations A, B, C, ...) in bulk.

### Preconditions
- Admin session.

### How to use
1. Scroll to **Section 6 — Bulk Registration Cancellation**.
2. Click **Sample File Download**.
3. Fill the XLSX template:
   - **Registration Number** column
   - **Update** column (`1` = cancel, `0` = skip)
4. Click **Upload File** then **Submit**.

### Result
- All `RegistrationUnit` records under each listed registration → `allocationStatus = 'cancelled'` / `'refunded'`.
- Associated units released back to inventory.
- Python service notified.

### Warnings — cascade
- CASCADE operation: one registration number cancels every sub-registration (A, B, C, D...) under it.
- Irreversible.
- **Refund is NOT auto-triggered** for paid registrations — confirm refund handling with finance.
- Known template/key typos (GAP-TL-049, GAP-TL-050):
  - Sample template column header reads `upadte` (typo of `update`).
  - Result file header reads "Registration Number" but the underlying data key is `unitNumber` — reconcile when validating output programmatically.

---

# Feature 7 — Sales Managers Bulk Upload

### What it does
Bulk creates or updates Sales Manager accounts via XLSX upload. Phone number is the upsert merge key.

### Preconditions
- Admin session.

### How to use
1. Scroll to **Section 7 — Sales Managers**.
2. Click **Sample File Download** (`.xlsx` only).
3. Fill the template — one row per SM:

| Column | Values | Notes |
|--------|--------|-------|
| Role | `Sales Manager` | Fixed value |
| First Name | Text | |
| Last Name | Text | |
| Email | Email | Not unique — duplicates allowed |
| Phone | 10-digit | **Merge key** — existing phone = update; new phone = create |
| IS_AVAILABLE | `1`/`0` | 1 = appears in customer assignment dropdowns |
| IS_ACTIVE | `1`/`0` | 1 = SM portal login enabled |

4. Click **Upload File** (`.xlsx` only — other formats rejected) then **Submit**.

### Result
- Each row upserts a User record with SM role.
- IS_AVAILABLE = 0 → SM immediately removed from customer assignment dropdowns.
- IS_ACTIVE = 0 → SM login disabled (soft deactivation; record not deleted).
- Result is a downloadable Excel showing Created / Updated / Unchanged / Error per row.
- New SMs receive Kaleyra SMS with portal login instructions (if configured).

### Validation rules
| Rule | Behaviour |
|------|-----------|
| Phone < 10 digits | Row flagged as error |
| Duplicate Email | Allowed |
| Non-XLSX upload | Rejected |

---

# Feature 8 — Customer Actions Card

### What it does
Controls whether buyers can register for **additional** unit types via the Customer Portal. Master toggle + per-typology checkboxes with count limits.

### Preconditions
- Admin session.

### How to use
1. Scroll to **Section 8 — Customer Actions**.
2. Review the **master toggle** "Allow Additional Registrations":
   - **OFF** → blocks ALL additional registrations regardless of typology settings below.
   - **ON** → per-typology controls become effective.
3. For each typology:
   - **1 Bed Growth Home** — checkbox + count limit dropdown
   - **2 Bed Growth Home** — checkbox + count limit dropdown
   - **2 Bed Rise Home** — checkbox + count limit dropdown
4. Click **Submit**.

### Result
- `POST /api/v1/admin/customer-actions` persists the configuration.
- Customer Portal immediately enforces the new settings.

### Validation rules — corrected (GAP-TL-035)
- **Submitting identical config** → HTTP 400 "No Change Detected" (not HTTP 200).
- **Master toggle OFF overrides ALL checkboxes.**
- Reducing a typology's count limit mid-campaign may inconvenience buyers already in the registration flow.

### Warning — "2 Bed Peak Home" force-disabled (GAP-TL-034)
The backend (`admin.controller.js:1591-1594`) silently coerces any input for typology **"2 Bed Peak Home"** to `isAllowed=false, countAllowed=0`. The UI may show the row but the server forces it disabled. Admin attempts to enable it will appear to succeed but persist as disabled.

### Cross-reference (GAP-DEV-021)
Backend also force-disables parking for typologies named exactly **"2 BHK Rise Home"** or **"2 BHK Peak Home"** (string match in `common.service.js:130, 517`).

### Master Configuration API surface (GAP-TL-032, GAP-TL-033)
- `storeMasterConfigs` endpoints — `projectId` is env-resolved server-side; `req.body.projectId` is ignored.
- Allowed `dataType` enum (8 values): `string`, `number`, `boolean`, `json`, `date`, `datetime`, `array`, `object`.

### Current UAT state
Master toggle: ON · 1-Bed = 15 · 2-Bed Growth = 17 · 2-Bed Rise = 20.

---

# Feature 9 — Max Preferences Per Unit

### What it does
Sets a project-wide cap on how many different buyers can express interest in the same unit during an allocation campaign.

### Preconditions
- Admin session.

### How to use
1. Scroll to the bottom of the page — **Section 9 — Max Preferences Per Unit**.
2. Select a numeric value from the dropdown (valid range 0–255; current UAT default: 6).
3. Click **Update**.

### Result
- `PUT /api/v1/admin/max-preferences-per-unit/:projectId` persists the value.
- New preference submissions are immediately gated by the new cap.

### Note
Reducing the limit does NOT retroactively invalidate existing preferences — it only prevents new preferences from being added to units that have already hit the cap.

---

## Business Rules

1. Tower Configuration changes save only on explicit click.
2. Unit Cost Update changes are immediate — including during active campaigns.
3. All bulk sections follow: Download Sample → Fill → Upload → Submit.
4. Unit Status: `Update=1` applies; `Update=0` skips.
5. Bulk Booking / Registration Cancellation do NOT auto-trigger refunds.
6. Bulk Booking Cancellation only works on `WINNER` rows; blocked during active campaigns and Mavis-present bookings.
7. Bulk Registration Cancellation cascades to all sub-registrations.
8. SM upload merge key is phone; XLSX only.
9. Customer Actions master toggle overrides per-typology checkboxes.
10. Max Preferences range 0–255; non-retroactive.
11. Bulk upload errors return HTTP 400 with an error Excel file (per-row detail), not a generic toast.
12. "2 Bed Peak Home" typology is server-side force-disabled.
13. **Registration Status (Section 2) and Bulk Booking Cancellation (Section 5) are both blocked during an active campaign.**

---

## Role Restrictions

- Admin (roleId 1) and Sales Manager Admin (roleId 4) have full access.
- No role can edit on this page without an explicit Submit / Update click on that section.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Tower toggles reverted on page reload | Update Tower Configuration not clicked | Re-toggle and click Save |
| Submit on Section 2 does nothing | File not selected (BUG_010 silent failure) | Re-attach file then Submit |
| HTTP 400 "Cannot update registration-unit when campaign is active" | A campaign is Active or in 2-min pre-start blackout | Wait for the window to clear |
| HTTP 400 "Cannot cancel booking when campaign is active" | Same — pre-start or running campaign | Wait |
| HTTP 400 "Mavis booking still exists" | Mavis booking row not cleared | Delete Mavis booking entry externally first |
| HTTP 400 "No Change Detected" (Section 8) | Submitted config identical to current | Change a value before submitting |
| HTTP 400 "No rows marked for update" (Section 4) | All rows have `Update=0` | Mark at least one row with `Update=1` |
| "2 Bed Peak Home" stays disabled | Backend force-overrides input | Known behaviour — escalate to product if you need it enabled |
| Result Excel header reads "Registration Number" but values look like unit numbers | Bulk refund result-file key mismatch (GAP-TL-050) | Read the column as unitNumber when parsing |
| Sample file header has typo `upadte` | Known issue (GAP-TL-049) | Use as-is; flag to Dev for fix |
| Unit Cost Update aborts mid-run | 2 chunk failures triggered abort | Check the error Excel for row-level errors, fix, retry |
