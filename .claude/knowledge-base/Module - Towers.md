---
type: module
module: Towers
url: https://uat-web.xrportal.in/admin/towers
sprint: 3
status: Automated
spec: tests/ui/towers.spec.js
tcs: TC-TWR-001–013
tags: [module, towers, automated]
updated: 2026-05-08
---

# Module: Towers

## Overview

Read-only view of all tower and unit inventory. Three functional zones: KPI cards, tower sidebar list, floor/unit grid with unit detail drawer.

**URL:** `https://uat-web.xrportal.in/admin/towers`  
**Auth:** Required — `src/fixtures/.auth/admin.json`  
**Page Object:** `src/pages/TowersPage.js`  
**Selectors:** `docs/selectors/towers.json`

## Page Zones

| Zone | Description |
|------|-------------|
| KPI Cards | Tower summary (Total/Active/Inactive) + Unit summary (Total/Sold/Available/Disabled) |
| Tower List | Sidebar — 18 towers; Active = selectable; Inactive = labelled; shows "N Units Available" |
| Floor/Unit Grid | Selected tower's floor × unit matrix; cells colour-coded by status |
| Unit Detail Drawer | Right panel: Unit No, BHK, Size, Agreement Value, Early Bird Discount, All-inclusive Price |

## KPI Baselines (pinned 2026-04-04)

Defined in `KPI_BASELINE` constant at top of `towers.spec.js`. **Update this constant if UAT unit counts change.**

| KPI | Value (at pin date) |
|-----|---------------------|
| Total Towers | 18 |
| Active Towers | varies (check spec) |
| Inactive Towers | varies |
| Total Units | varies |
| Available Units | varies |

## Tower List — 18 Towers

Crest · Crown · Blossom · Bright · Pinnacle · Triumph · Prestige · Horizon · Dawn · Aura · Glory · Pride · Grace · Aspire · Prime · Fortune · Radiance · Grand

**Active (selectable in unit selection):** Crest, Crown, Blossom, Bright, Pinnacle (5 observed during Allocation)

## Unit Grid Cell Colours

| Colour | Status | Clickable |
|--------|--------|-----------|
| White / light border | Available | ✅ |
| Green | Selected (current session) | — |
| Red | Sold | ❌ |
| Orange | Paying now (another session) | ❌ |
| Grey | Refuge / Reserved / Blocked | ❌ |

## Unit Detail Drawer Fields

- Unit No (e.g. 3502 – Crest)
- BHK type
- Size (sq.ft.)
- Agreement Value
- Early Bird Discount
- All Inclusive Price

## Automated Tests

| TC | Priority | Description |
|----|----------|-------------|
| TC-TWR-001 | P1 Smoke | KPI cards show correct tower + unit counts; pinned baselines |
| TC-TWR-002 | P2 | Unit KPI count consistent with Crest grid Available count |
| TC-TWR-003 | P1 Smoke | All 18 towers in sidebar list |
| TC-TWR-004 | P2 | Tower item shows name + available unit count |
| TC-TWR-005 | P1 | Selecting tower loads floor/unit grid |
| TC-TWR-006 | P2 | Grid header shows correct tower stats (Total/Available/Sold/Disabled) |
| TC-TWR-007 | P1 | Clicking available unit opens detail drawer |
| TC-TWR-008 | P2 | Drawer shows correct unit fields |
| TC-TWR-009 | P2 | Sold (red) unit click — drawer does NOT open |
| TC-TWR-010 | P2 | Inactive tower has "(Inactive)" label |
| TC-TWR-011 | P2 | Inactive tower can be selected; grid still loads |
| TC-TWR-012 | P2 | "View Tower" from Config → navigates to Towers with that tower selected |
| TC-TWR-013 | P2 | Grid stat header updates when different tower selected |

## Key Technical Notes

- KPI baseline pinned at test top — update `KPI_BASELINE` constant when real data changes
- Tower list selector: `li.tower-item`
- Unit cell selector: `.unit-size-item.available` (available), `.unit-size-item.sold` (sold)
- Grid stat header: `.floors-index-wrap`
- Drawer: `.ant-drawer-body`
- TC-TWR-009: Sold unit click — verify drawer NOT visible (`.ant-drawer-body` should not be open)

## Integration Points

| Module | Relationship |
|--------|-------------|
| [[Module - Config CMS]] | Tower Configuration toggles control which towers are Active |
| [[Module - Allocation]] | Active towers appear in customer unit selection |
| [[Module - Offers]] | Typology-scoped offers apply to specific unit types shown here |
