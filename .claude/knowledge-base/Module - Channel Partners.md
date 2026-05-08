---
type: module
module: Channel Partners
url: https://uat-web.xrportal.in/admin/channel-partners
sprint: 3
status: Automated
spec: tests/ui/channel-partners.spec.js
tcs: TC-CP-001–006, TC-CP-008–012 (13 total; TC-CP-007 removed)
tags: [module, channel-partners, automated]
updated: 2026-05-08
---

# Module: Channel Partners

## Overview

Manages channel partner (broker/agent) accounts. Large dataset (2705 CPs). Supports phone search, drawer-based detail view, Master CP mapping, and "Mark as Master" via dropdown.

**URL:** `https://uat-web.xrportal.in/admin/channel-partners`  
**Auth:** Required — `src/fixtures/.auth/admin.json`  
**Page Object:** `src/pages/ChannelPartnersPage.js`  
**Selectors:** `docs/selectors/channel-partners.json`

## Page Structure

| Zone | Description |
|------|-------------|
| Header | "2705 Channel Partners" title + Map Master CP / Reset Filters / Refresh buttons |
| Search Bar | Phone number input — filters table rows server-side |
| Table | 13 columns (see below) |
| Actions | Eye icon → CP detail drawer · … icon → Mark as Master dropdown |
| Map Master CP | Disabled until row(s) selected → opens modal with Master HV Code dropdown |

## Table Columns (13)

Owner Name | Firm Name | HV Code | Master HV Code | Business Region | Pincode | Phone | CP Type | SM Name | SM Email ID | SM Mobile Number | KYC Status | Actions

## Key Behaviours (discovered via automation)

| Behaviour | Detail |
|-----------|--------|
| Phone search filters rows but header count stays at 2705 | Header "2705 Channel Partners" does NOT update on search — it's a static total |
| Reset Filters clears input AND restores baseline count in table | But header stays at 2705 always |
| "Mark as Master" is inside … dropdown | Dropdown also contains nav-type items — filter for "Mark as Master" specifically |
| Master HV filter in TC-CP-012 | "Master HV" filter applied first, then CP portal login verified |

## Test Data

| Field | Value |
|-------|-------|
| Test CP phone | `8000000002` |
| Test CP owner | "Testing uat CP" |
| Test CP HV code | `HV00026097` |
| Baseline total | 2705 Channel Partners |
| CP Portal login phone | `8888888888` OTP `147258` |

## Automated Tests

| TC | Priority | Description |
|----|----------|-------------|
| TC-CP-001 | P1 Smoke | Page loads with "2705 Channel Partners" count |
| TC-CP-002 | P1 Smoke | Table has all 13 required columns |
| TC-CP-003 | P1 | Search by phone "8000000002" → matching row with correct owner/HV |
| TC-CP-004 | P1 | Reset Filters clears search, restores count to 2705 |
| TC-CP-005 | P1 | Eye icon opens CP detail drawer |
| TC-CP-006 | P2 | Drawer shows correct CP details |
| TC-CP-007 | REMOVED | Mark as Master — deferred |
| TC-CP-008 | P2 | … dropdown opens with options |
| TC-CP-009 | P2 | "Mark as Master" option present in dropdown |
| TC-CP-010 | P2 | Map Master CP button disabled with no selection |
| TC-CP-011 | P1 | Map Master CP modal opens on row select |
| TC-CP-012 | P2 | Master HV filter + CP portal login verification (E2E) |

## Key Technical Notes

- Search input: phone number input in header area (not a standard Ant Design `ant-input` — check selector)
- `… dropdown`: `.ant-dropdown-menu` — filter items by text; don't rely on position
- `clickResetFilters()`: clears input AND triggers re-fetch; wait for table to reload
- Drawer close: `.ant-drawer-close` button
- TC-CP-012: uses two-step flow — admin applies Master HV filter, then CP portal login verifies the filtered CP appears correctly

## Integration Points

| Module | Relationship |
|--------|-------------|
| [[Module - Sales Managers]] | SM Name / SM Email / SM Mobile columns show assigned SM; CP-SM relationship unclear |
| [[Module - Customers]] | Channel partners are assigned to customers as Growth Partners (HV Code) |

→ See [[Open Questions#Channel Partners]] for unresolved items
