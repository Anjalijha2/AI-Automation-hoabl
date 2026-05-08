---
type: brd
module: CMS Config
url: https://uat-web.xrportal.in/admin/cms
sprint: 5
status: Draft
author: BA Agent
created: 2026-05-08
tags: [brd, cms, config, sprint-5]
---

# BRD: CMS / Configuration Management

## 1. Purpose
Centralized system administration panel. Consolidates bulk operational actions and configuration toggles: tower activation, registration eligibility, unit availability, pricing, booking cancellations, SM provisioning, customer registration limits, preference caps.

**Business intent:** Single-screen bulk operations via CSV/XLSX + system config toggles without developer intervention.

> ⚠️ "Config" sidebar nav → `/admin/cms`. "CMS" nav → external portal `manage-uat.xrportal.in`. This BRD covers `/admin/cms` only.

## 2. Screens & Navigation
**Path:** Left sidebar → "Config" → `/admin/cms`

Single long-scroll page with 9 functional sections:

| # | Section | Type |
|---|---------|------|
| 1 | Tower Configuration | Toggle grid + Save |
| 2 | Registration Status | CSV bulk upload + stats |
| 3 | Unit Status | CSV bulk upload + stats |
| 4 | Unit Cost Update | XLSX download + upload |
| 5 | Bulk Booking Cancellation | CSV bulk upload |
| 6 | Bulk Registration Cancellation | CSV bulk upload |
| 7 | Sales Managers (bulk) | CSV bulk upload |
| 8 | Customer Actions Card | Toggles + typology limits |
| 9 | Max Preferences Per Unit | Numeric dropdown + Update |

## 3. Section Details

### S1: Tower Configuration
- 18 towers with Active/Inactive toggle per tower
- All 18 Active on UAT (2026-05-08)
- Changes NOT saved until "Update Tower Configuration" clicked
- Success toast: "Tower Status Updated Successfully"

### S2: Registration Status
CSV columns: `Registration Number` | `Allocation Status` (Allow/Forbid)

Stats: Total active = 8,675 | Total inactive = 5

### S3: Unit Status
CSV columns: `Tower` | `Floor` | `Unit_No` | `Unit_Type` | `Status` | `Update`
- Update=1 → apply; Update=0 → skip row
Stats: Total active = 3,778 | Total inactive = 737

### S4: Unit Cost Update
XLSX columns: `Tower` | `Floor` | `Unit_No` | `Agreement_Value` | `EarlyBird` | `Update`
- Download current pricing → edit → re-upload
- Takes effect immediately during active campaigns ⚠️

### S5: Bulk Booking Cancellation
CSV (headers unconfirmed) — cancels completed bookings
- Units released back to inventory
- Refund trigger: unconfirmed ⚠️

### S6: Bulk Registration Cancellation
CSV (headers unconfirmed) — cancels entire registration records
- ALL sub-registrations (A, B, C...) cancelled
- Refund trigger: unconfirmed ⚠️

### S7: Sales Managers Bulk Upload
CSV — bulk create/update SM accounts
- Merge key: unconfirmed

### S8: Customer Actions Card
Observed state (UAT 2026-05-08):
- Allow Additional Registrations: ✅ Active
- 1 Bed Growth Home: ✅ checked, limit = 15
- 2 Bed Growth Home: ✅ checked, limit = 17
- 2 Bed Rise Home: ✅ checked, limit = 20

Master toggle OFF → no typologies available regardless of checkboxes.

### S9: Max Preferences Per Unit
Current value: **6**
System-wide cap on how many units a customer can select preferences for.

## 4. Business Workflows

**Tower Config:** Toggle → "Update Tower Configuration" → immediate customer portal effect
**Bulk Uploads (S2-S7):** Download sample → prepare CSV → Upload File → Submit
**Customer Actions Card:** Adjust toggles/limits → Submit → immediate effect
**Max Preferences:** Select value → Update → immediate system-wide effect

## 5. Filters & Search
None — all sections are configuration panels, not data tables.

## 6. KPIs (Observed 2026-05-08)

| Metric | Value |
|--------|-------|
| Total active registration | 8,675 |
| Total inactive registration | 5 |
| Total active unit | 3,778 |
| Total inactive unit | 737 |

## 7. Integration Points

| Module | Relationship |
|--------|-------------|
| Towers | Tower Configuration directly controls tower visibility |
| Allocation | Registration Status controls campaign participation; Unit Status controls grid; Max Preferences controls selection count |
| Customers | Registration cancellation affects customer records; Customer Actions Card controls customer portal actions |
| [[BRD - Sales Managers]] | SM bulk upload provisions SM accounts |
| [[BRD - Offers]] | Unit Cost Update overlaps — Agreement Value here; discounts in Offers module |

## 8. Acceptance Criteria

- **AC-CMS-001:** Tower Config — 18 towers; toggle + Update saves; reload without Update reverts; "View Tower" navigates correctly
- **AC-CMS-002:** Registration Status — sample CSV correct; valid upload updates stats; invalid reg no. = error; invalid status = error
- **AC-CMS-003:** Unit Status — Update=1 applies; Update=0 skips; stats update post-upload
- **AC-CMS-004:** Unit Cost Update — download has current pricing XLSX; valid upload updates pricing immediately; invalid data type = error
- **AC-CMS-005:** Bulk Booking Cancel — valid CSV cancels bookings; units return to available; refund behavior documented
- **AC-CMS-006:** Bulk Reg Cancel — valid CSV cancels all sub-registrations; refund behavior documented
- **AC-CMS-007:** SM Bulk Upload — correct CSV headers; valid upload creates/updates SMs
- **AC-CMS-008:** Customer Actions Card — master toggle controls access; typology limits saved; Submit persists immediately
- **AC-CMS-009:** Max Preferences — current value displayed; new value saved; customer allocation reflects new cap

## 9. Out of Scope / UAT Limitations
1. External CMS portal (`manage-uat.xrportal.in`) — separate product
2. Bulk cancellation refund flow requires payment gateway integration
3. SM bulk upload CSV headers not confirmed
4. Customer portal cross-verification requires separate customer session
5. Partial upload error format not confirmed

## 🚩 Domain Red Flags
- **HIGH:** Unit Cost Update takes effect immediately during active allocation — no draft/preview
- **HIGH:** Bulk Booking Cancellation refund trigger unconfirmed
- **HIGH:** Bulk Registration Cancellation cancels ALL sub-registrations — cascading impact
- **MEDIUM:** Customer Actions Card changes mid-campaign → inventory overflow risk

## Open Clarifications
See [[Sprint 5 - Clarifications#CMS Config]]
