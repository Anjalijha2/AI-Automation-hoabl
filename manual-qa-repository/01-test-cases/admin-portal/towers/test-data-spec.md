# Test Data Specification — Towers Module (Admin Portal)

**Module:** Towers
**Portal:** XR Portal Admin
**Source TCs:** `TC_TOWERS.md` (27 TCs)
**Last Updated:** 2026-05-19
**Owner:** BA Agent / QA Agent

---

## 1. Authentication

| Item | Value |
|------|-------|
| Admin Mobile | `8888888888` |
| Admin OTP | `258369` |
| Storage State | `automation-repository/fixtures/.auth/admin.json` |
| ADMIN_JWT | extracted from `admin.json` |

---

## 2. Static Reference Data

### 18 Towers (fixed)
Crest, Crown, Blossom, Bright, Pinnacle, Triumph, Prestige, Horizon, Dawn, Aura, Glory, Pride, Grace, Aspire, Prime, Fortune, Radiance, Grand

### 5 Active Towers (observed UAT)
Crest, Crown, Blossom, Bright, Pinnacle

### Unit Status → Colour Mapping

| DB Status | Colour | Clickable |
|-----------|--------|-----------|
| AVAILABLE | White | Yes (opens drawer) |
| HOLD | Orange | No |
| BOOKED | Red | No |
| REFUGE / RESERVED / PBT | Grey | No |
| PREBOOKED | Red / Grey | No |

### KPI Baseline (pinned 2026-04-04 — update if UAT data changes)
- Total Towers: 18 (fixed)
- Active Towers: 5
- Available Units (Crest): ~159

---

## 3. Valid Selectors (consumed by POM)

| Element | Selector |
|---------|----------|
| Tower sidebar item | `li.tower-item` |
| Grid header stats | `.floors-index-wrap` |
| Available unit cell | `.unit-size-item.available` |
| Sold unit cell | `.unit-size-item.sold` |
| Drawer body | `.ant-drawer-body` |
| Drawer close | `.ant-drawer-close` |

---

## 4. Invalid / Edge Inputs

| Field | Invalid Value | Expected |
|-------|--------------|----------|
| URL param `towerId` | `invalid` | Page loads; no tower preselected; no crash |
| Sold unit click | — | No drawer; no error |
| Grey unit click | — | No drawer; no error |

---

## 5. Pre-conditions per TC Class

| TC Class | Required State |
|----------|----------------|
| UI / FUNC | Admin session; 18 towers in inventory |
| FUNC_006 (Sold click) | At least 1 BOOKED unit in selected tower |
| FUNC_007-008 (Inactive) | At least 1 Inactive tower (via Config) |
| FUNC_009 (View Tower) | Config CMS Tower Configuration accessible |
| EDGE_001 (zero available) | Tower with 0 available units (rare) |
| BIZ_002 (cross-module) | Admin with Config edit access |
| API | `ADMIN_JWT` populated |

---

## 6. Cleanup / Teardown

- No write operations from this module → no module-level cleanup
- BIZ_002 (toggle Active in Config): restore tower to original state in afterEach

---

## 7. Known Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| KPI baselines hardcoded in spec | UAT data drift breaks tests | Maintain `KPI_BASELINE` constant in spec |
| No Sold units in some towers | TC_TWR_FUNC_006 / EDGE_001 may skip | Use towers with known Sold units |
| Inactive tower state depends on Config | Test order matters | Snapshot tower state in beforeAll |

---

## 8. Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `ADMIN_JWT` | API auth | extracted from `admin.json` |
| `UAT_TEST_TOWER` | Tower to use for grid tests | `Crest` |
| `UAT_INACTIVE_TOWER` | Inactive tower to test | (set per-run from Config) |
