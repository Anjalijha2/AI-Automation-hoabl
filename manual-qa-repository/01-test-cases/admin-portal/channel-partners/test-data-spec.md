# Test Data Specification — Channel Partners Module (Admin Portal)

**Module:** Channel Partners
**Portal:** XR Portal Admin + CP Portal cross
**Source TCs:** `TC_CP.md` (30 TCs)
**Last Updated:** 2026-05-19
**Owner:** BA Agent / QA Agent

---

## 1. Authentication

| Item | Value |
|------|-------|
| Admin Mobile | `8888888888` |
| Admin OTP | `258369` |
| Storage State | `automation-repository/fixtures/.auth/admin.json` |
| CP Portal Mobile | `8888888888` |
| CP Portal OTP | `147258` |
| ADMIN_JWT | extracted |

---

## 2. Known Test CPs (UAT)

| Phone | Type | Owner | HV Code |
|-------|------|-------|---------|
| `8888888888` | Master CP | (confirmed in spec) | (in page object) |
| `7888888888` | Member CP | (confirmed in spec) | (in page object) |
| `8000000002` | Member CP | `Testing uat CP` | `HV00026097` |

Total system CPs (UAT baseline): 2705

---

## 3. Valid Filter Inputs

| Filter | Valid Values |
|--------|-------------|
| Phone (search) | 10-digit numeric |
| Owner Name search | Text (partial match) |
| Firm Name search | Text |
| HV Code search | `HVxxxxxxxx` pattern |
| Pincode search | 6-digit |
| Master HV Code filter | From Master CP HV Codes |
| Business Region filter | Dropdown values |
| CP Type filter | `Master CP`, `Member CP` |

---

## 4. KYC Status Reference

| Value | Notes |
|-------|-------|
| Pending | UAT default for all test CPs |
| Approved | — |
| Rejected | — |
| Verified | — |

---

## 5. Invalid / Boundary Inputs

| Input | Expected |
|-------|----------|
| Phone search `0000000000` | Empty result; no error |
| Map Master with no row selected | Button disabled |
| Map Master modal — no Master HV Code | Confirm blocked |

---

## 6. Pre-conditions per TC Class

| TC Class | Required State |
|----------|----------------|
| FUNC_001-002 (search) | Test CPs `8888888888` + `7888888888` exist |
| FUNC_004-005 (drawer) | Eye icon clickable on Master CP row |
| FUNC_006-008 (Map Master) | Disposable Member CP for mapping; valid Master HV Code |
| FUNC_012 (cross-portal) | CP credentials valid; OPEN Team Leads section available |
| BIZ_001 (default Member) | Newly registered CP or test fixture |
| BIZ_003 (SM auto-populate) | CP with SM assigned in Sales Managers module |
| API | `ADMIN_JWT` populated |

---

## 7. Cleanup / Teardown

- Map Master CP changes: snapshot original `masterHvCode` in beforeEach; restore via PUT in afterEach
- Mark as Master: feature deferred per Q-CP-002 — no TC currently
- No CP create/delete from this module — no record cleanup needed

---

## 8. Known Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| Header count is static (2705) | Cannot use as filter-success indicator | Use table row count instead |
| Search input not standard `.ant-input` | Selector may break | Verify from POM |
| 3-dot menu `.ant-dropdown-menu` contains nav items | Position-based clicks fail | Filter by text "Mark as Master" etc. |
| KYC Status hardcoded 'Pending' on UAT | Cannot test full KYC enum live | Validate enum via drawer reads only |
| Q-CP-001 (SM source) resolved per BRD — SM data auto-populated | Cross-module assertion needed | Pair with SM module test |
| TC-CP-007 (Mark as Master) removed | Feature deferred | Re-add when re-introduced |

---

## 9. Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `ADMIN_JWT` | API auth | extracted |
| `CP_TEST_MOBILE_MASTER` | Master CP phone | `8888888888` |
| `CP_TEST_MOBILE_MEMBER` | Member CP phone | `7888888888` |
| `UAT_CP_TOTAL_BASELINE` | Expected CP count | `2705` |
| `ALLOW_DESTRUCTIVE` | Allow map-master writes | unset |
