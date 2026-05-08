---
type: module
module: Config CMS
url: https://uat-web.xrportal.in/admin/cms
sprint: 2
status: Automated
spec: tests/ui/config.spec.js
tcs: TC_CFG_001–053 (52 total)
tags: [module, config, cms, automated]
updated: 2026-05-08
---

# Module: Config / CMS

## Overview

Single long-scroll page with 9 functional sections. Central control plane for the entire portal — tower visibility, unit statuses, pricing, cancellations, SM provisioning, customer registration limits.

**URL:** `https://uat-web.xrportal.in/admin/cms`  
**Auth:** Required — `src/fixtures/.auth/admin.json`  
**Page Object:** `src/pages/ConfigPage.js`

> ⚠️ Nav "Config" → `/admin/cms` (THIS module). Nav "CMS" → `manage-uat.xrportal.in` (external, OUT OF SCOPE).

## 9 Sections

| # | Section | Type | TCs |
|---|---------|------|-----|
| 1 | Tower Configuration | Toggle grid + Save | TC_CFG_001–006 |
| 2 | Registration Status | CSV bulk upload | TC_CFG_020–024 |
| 3 | Unit Status | CSV bulk upload | TC_CFG_025–030 |
| 4 | Unit Cost Update | XLSX download + upload | TC_CFG_031–034 |
| 5 | Bulk Booking Cancellation | CSV bulk upload | TC_CFG_035–037 |
| 6 | Bulk Registration Cancellation | CSV bulk upload | TC_CFG_038–040 |
| 7 | Sales Managers | XLSX bulk upload | TC_CFG_041–048 |
| 8 | Customer Actions Card | Toggle + dropdowns | TC_CFG_011–013 |
| 9 | Max Preferences Per Unit | Dropdown + Update | TC_CFG_007–010 |

**Plus:** Sample downloads (TC_CFG_014–019), Customer Portal tests (TC_CFG_049–053)

## Critical Selector Patterns

- **Section scoping:** `getSectionCard('SectionName')` → XPath parent traversal from `h5[text]`. Sections do NOT use `.ant-card` — always XPath.
- **Tower toggles:** `page.evaluate()` DOM traversal via `getTowerToggleInfo('Tower N - Name')`
- **View Tower button:** `page.evaluate()` to find button index → `page.locator('button').nth(index).click()` — JS click doesn't trigger React navigation
- **Customer Actions toggle:** `page.evaluate()` from `h5 'Allow Additional Registrations:'`
- **Customer Actions dropdowns:** scope to `.ant-select-dropdown:not(.ant-select-dropdown-hidden)` — multiple hidden dropdowns in DOM

## Tower States (UAT baseline)

| Tower | Active? | Notes |
|-------|---------|-------|
| Tower 8 - Crest | ✅ Active | Reliable baseline |
| Tower 10 - Crown | ✅ Active | Reliable baseline |
| Tower 14 - Horizon | ❌ Inactive | Changed by TC_CUST_017 — do NOT rely on Active |
| All others (1-7, 9, 11-13, 15-18) | ❌ Inactive | — |

## CSV/XLSX Formats

### Registration Status
`Registration Number` | `Allocation Status` (Allow/Forbid)

### Unit Status  
`Tower` | `Floor` | `Unit_No` | `Unit_Type` | `Status` (AVAILABLE/RESERVED) | `Update` (1=apply, 0=skip)

### Unit Cost Update
`Tower` | `Floor` | `Unit_No` | `Agreement_Value` | `EarlyBird` | `Update` (1/0)

### Sales Managers
`Role` | `First Name` | `Last Name` | `Email` | `Phone` | `IS_AVAILABLE` | `IS_ACTIVE`

## UAT Stats (2026-05-08)
- Total active registrations: 8,675 | inactive: 5
- Total active units: 3,778 | inactive: 737
- Max Preferences current value: 6
- Customer Actions Card: Allow Additional Registrations = Active | 1Bed limit=15 | 2BedGrowth limit=17 | 2BedRise limit=20

## Key Technical Notes

- All upload sections: `scrollToSection()` → `setUploadFile()` → `clickSubmitInSection()` → `waitForSuccessToast()`
- `downloadFinalExcel(section)` — gets server response XLSX after upload
- `buildUploadFile()` / `buildSalesManagerFile()` helpers construct XLSX from sample
- Unit Cost Update: `Agreement_Value` col 2, `EarlyBird` col 3, `Update` col 5 — coerce to Number or validation fails
- Campaign handling required for Registration Status + Unit Cost tests (active campaign blocks upload)
- Customer Portal tests (TC_CFG_049–053): TC_CFG_049+053 ENV SKIP (Easebuzz bot detection). TC_CFG_050–052 PASS.
- Easebuzz bot detection: `navigator.webdriver`, CDP fingerprint, no browser history → payment methods never render. Anti-bot mitigations (slowMo, `--disable-blink-features`, mouse movement) insufficient.

## BUG_010 (Open)
- **Where:** Registration Status section → Submit without file selected
- **Expected:** Validation error
- **Actual:** Silent success with no feedback
- **Status:** Open — dev team fix needed

## Integration Points

| Module | Relationship |
|--------|-------------|
| [[Module - Towers]] | Tower Configuration section controls tower visibility |
| [[Module - Customers]] | Active Towers count cross-checked in TC-CST-006/017 |
| [[Module - Allocation]] | Registration Status + Unit Status gate campaign participation |
| [[Module - Sales Managers]] | Section 7 bulk upload provisions SM accounts |
| [[Module - Offers]] | Unit Cost Update overlaps — Agreement Value here, discounts in Offers |
