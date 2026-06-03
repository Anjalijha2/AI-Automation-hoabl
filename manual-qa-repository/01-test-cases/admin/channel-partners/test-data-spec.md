# Test Data Spec — Channel Partners — Admin Portal

**Module:** Channel Partners
**Portal:** Admin
**URL:** `https://uat-web.xrportal.in/admin/channel-partners`
**BRD:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Channel-Partners.md`
**Visual Memory:** `visual-memory/admin/channel-partners/INDEX.md`

---

## Valid Inputs

| Field | Valid Values | Notes |
|-------|-------------|-------|
| Phone Search (`input[placeholder="Search by Phone"]`) | Any 10-digit phone of an existing CP in the UAT directory (e.g. one drawn from the loaded list via `channel-partners-loaded.png`) | Server-side filter; BRD §5 walkthrough. Result expected to be one row when phone is unique. |
| Row checkbox (`.ant-checkbox-input`) | Single or multiple rows | BRD §5 — "Select one or more Member CP rows" |
| Master HV Code dropdown (Map modal) | Any HV Code whose CP Type is "Master CP" | BRD §6 Rule 6 — only Master CPs appear in the dropdown |

## Invalid / Boundary Inputs

| Field | Invalid Value | Expected Behaviour |
|-------|--------------|--------------------|
| Phone Search | `0000000000` (no CP has this number) | Table renders empty/no-data state; `h3` count unchanged per BRD §6 Rule 1 |
| Phone Search | `abc` (non-numeric) | Input rejects OR table returns empty; no JS error |
| Phone Search | Empty string | Resets to full directory view (equivalent to Reset Filters effect on phone field) |
| Map Master CP button | Triggered with zero rows selected | Button remains disabled; click has no effect (BRD §6 Rule 4, §7 Validation) |
| Map modal Confirm | No Master HV Code selected | Confirm blocked — either disabled state OR validation error; no mapping persisted (BRD §7 Validation row 2) |

## Pre-conditions

- **Auth state:** Admin authenticated via OTP — `automation-repository/fixtures/.auth/admin.json` populated
- **Data state:**
  - UAT directory contains at least ~2700 CPs (header count baseline ~2709 per `channel-partners-loaded.png`)
  - At least one Master CP exists (Master HV Code dropdown must be non-empty) for TC_CP_E2E_003 / TC_CP_VAL_001
  - At least one Member/Standalone CP exists for selection scenarios
  - At least one CP with no SM assigned for TC_CP_EDGE_002 (SM columns show `-`)
  - All UAT CPs default to KYC Status "Pending" per BRD §6 Rule 9
- **Environment:** `ENV=uat`; destructive TC_CP_E2E_003 should NOT run on prod-like data

## Cleanup / Teardown

- **TC_CP_E2E_003 (destructive Map Master CP):**
  - The mapped CP's Master HV Code is now persisted server-side
  - Manual revert: locate the CP, open the Map flow again, and map back to its original Master HV Code (or null if it was originally unmapped) — only possible if reverse mapping is supported
  - Preferred: run only against disposable CP records seeded specifically for this test; do NOT use production CPs
- **Phone Search / Reset Filters:** click Reset Filters between TCs that filter the table to guarantee a clean baseline for subsequent runs
- **Map modal Cancel TCs:** ensure modal is closed (`.ant-modal-content` not present in DOM) before next TC begins
- **Row selection state:** deselect all rows at end of selection-based TCs to avoid leakage into next test (re-click the same `.ant-checkbox-input`)

## Special Notes

- LeadSquared excluded — Channel Partner data flows from XR Portal source, NOT LSQ
- Strapi excluded — no CMS interaction tested here
- SM Name / SM Email / SM Mobile values are auto-populated via FK to Sales Managers module (BRD §6 Rule 7, §10) — TCs assert presence/absence, not value correctness (that belongs to the SM module)
- KYC Status values per BRD §4 detail drawer spec: Pending / Approved / Rejected / Verified — visual evidence currently shows only Pending (UAT default per Rule 9); Approved/Rejected/Verified states not yet captured but are not required for current TC set
