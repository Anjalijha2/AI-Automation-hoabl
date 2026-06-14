# Coverage Matrix — Buyer Portal / Unit Details

**Module:** Buyer → Unit Details
**Master JSON:** `manual-qa-repository/07-execution/_master-json/Buyer-UnitDetails.json`
**Sheet (on build):** `Unit Details - Master` (replaces `Unit Details` + `Unit Details (Exec)`)
**Generated:** 2026-06-14 (BA Agent, full tc-coverage-contract, unattended)
**Sources:** visual-memory/buyer/unit-details/INDEX.md (FULL) + BUYER-FS-Unit-Details.md + BUYER-FRD/BRD-Buyer-Portal.md
**Totals:** 46 TCs across 11 sub-modules — 34 baseline preserved (no renumber) + 12 new.

---

## CRITICAL — DOC_DRIFT-001 (live UI wins)

The FS/BRD describe **Unit Details** as a rich standalone page (on-screen Unit specs, Cost Sheet, Tower View, Floor & Unit Plans, Payment Schedule) at `/allotted-units` or `/my-unit`.
The **FULL** live capture shows **no such page** — all of `/allotted-units`, `/allotted-unit`, `/unit-details`, `/my-unit` return **404**. In the live build, "Unit Details" is the **"Download your Unit Details"** button on the **KYC success page** (`/kyc?unitId=<base64>`) that produces the Booking-form / Unit-details PDF.

**Resolution applied:** All UI-layer TCs describe the KYC-success page + PDF download (live UI wins). The FS rich on-page sections (cost sheet / specs / tower view rendered as a page) are retained at the **API/data layer** and explicitly flagged `[VERIFY WITH DEV]` as "FS — not on-page in live build" sub-modules. The FS/FRD/BRD already carry the `DOC_DRIFT-001` correction comment on the route (`/allotted-units` → `/kyc?unitId=<base64>`), so **no further BRD/FRD edit is required this pass** — the drift is fully reflected in the docs and re-stated in the master JSON notes block.

---

## Sub-module list (execution order)

1. Access & Routing (KYC success page = Unit Details host) — 5
2. KYC Success Page Layout & Summary Table — 6
3. Download Unit Details (PDF / Booking form) — 6
4. Cost Sheet (frozen pricing) [FS — not on-page in live build] — 3
5. Unit Specs, Floor Plan & Tower View [FS — not on-page in live build] — 3
6. Payment Schedule within Unit Details — 5
7. Role / Auth / Security — 5
8. API & Backend (booking-form-data / unit-details) — 5
9. Schema / Data Integrity (documented defects) — 2
10. Cross-module Integration — 3
11. Edge & Boundary — 3

---

## Features × 11 Coverage Dimensions

Legend: ✅ covered · ➖ N/A (justified) · ⚠ flagged `[VERIFY WITH DEV]` / DOC_DRIFT

| Feature | 1 Positive | 2 Full-form | 3 Mand/Valid | 4 Re-check/Race | 5 Neg/Error | 6 Context-ctrl | 7 Notif | 8 UI-vs-API | 9 Role/Auth | 10 Integration | 11 Boundary |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Access / routing to Unit Details | ✅ FUNC_001/002 | ➖ | ✅ NEG_002 | ➖ | ✅ NEG_001/002 ⚠ | ➖ | ➖ | ➖ | ✅ NEG_004 | ✅ FUNC_002 | ✅ FUNC_003 (base64) |
| KYC success page layout & table | ✅ UI_001/002 | ✅ UI_001-005 | ➖ | ➖ | ➖ | ✅ UI_004 ⚠ | ➖ | ➖ | ➖ | ✅ UI_003 | ✅ UI_006 (mobile) |
| Download Unit Details (PDF) | ✅ FUNC_004/005 | ✅ FUNC_004-008 | ➖ | ✅ FUNC_008 | ✅ NEG_003 ⚠ | ➖ | ✅ NEG_003 (silent-UX) | ✅ BYR_UNIT_029 (no server PDF) | ➖ | ✅ FUNC_006/007 | ➖ |
| Cost Sheet (frozen) [FS] | ✅ BIZ_001 | ✅ BIZ_003 ⚠ | ➖ | ➖ | ✅ BYR_UNIT_026 | ➖ | ➖ | ✅ API_001 ⚠ | ✅ BYR_UNIT_026 | ✅ BIZ_002/XMOD_002 | ➖ |
| Unit specs / floor plan / tower view [FS] | ⚠ VAL_001/002 (absent) | ➖ | ✅ VAL_001/002 (drift) | ➖ | ✅ BYR_UNIT_046 | ➖ | ➖ | ➖ | ➖ | ➖ | ✅ BYR_UNIT_046/060 |
| Payment Schedule in Unit Details | ✅ FUNC_009 | ✅ FUNC_009 | ➖ | ✅ BYR_UNIT_034/059 | ✅ BYR_UNIT_053 (empty) | ✅ BYR_UNIT_059 | ➖ | ✅ BYR_UNIT_034/035 | ➖ | ✅ BYR_UNIT_035 (HCF) | ✅ BYR_UNIT_053 (empty) |
| Role / Auth / Security | ✅ — | ➖ | ✅ BYR_UNIT_055 | ➖ | ✅ BYR_UNIT_028/055 | ➖ | ➖ | ✅ BYR_UNIT_026/028 | ✅ BYR_UNIT_026/054, NEG_004 | ➖ | ✅ BYR_UNIT_054 (expiry) |
| API & Backend | ✅ API_001 | ➖ | ✅ BYR_UNIT_027 | ➖ | ✅ BYR_UNIT_027/055 | ➖ | ➖ | ✅ BYR_UNIT_030 (SAS) | ✅ BYR_UNIT_028 | ✅ BYR_UNIT_031 | ✅ BYR_UNIT_030 (SAS expiry) |
| Schema / data integrity | ➖ | ➖ | ✅ BYR_UNIT_032/033 | ➖ | ✅ BYR_UNIT_032 | ➖ | ➖ | ➖ | ➖ | ➖ | ✅ BYR_UNIT_060 (pipe) |
| Cross-module consistency | ✅ XMOD_001 | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ✅ XMOD_001/002 | ➖ |
| Edge & Boundary | ✅ EDGE_001 | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ✅ EDGE_001/002, BYR_UNIT_060 |

**Dimension roll-up (≥1 case each):** 1 ✅ · 2 ✅ · 3 ✅ · 4 ✅ · 5 ✅ · 6 ✅ · 7 ✅ · 8 ✅ · 9 ✅ · 10 ✅ · 11 ✅ — all 11 dimensions have at least one TC.

**Justified N/A:** Dim 6 (context-sensitive controls) is thin — the live Unit Details surface is largely static (heading + table + one download button + Go-to-Home), so the only state-varying control is the applicant-count button (UI_004, flagged) and the Pay button during HCF verification (BYR_UNIT_059). Dim 7 (notifications) is minimal because the download/view flow is silent by design — covered as a silent-UX assertion in NEG_003.

---

## New TC IDs (12) — gray-fill on build

| TC_ID | Sub-module | Why added (gap closed) |
|---|---|---|
| TC_BUYUD_UI_003 | KYC Success Layout | Unit cell composition (no/tower/config/area) — full-form |
| TC_BUYUD_UI_004 | KYC Success Layout | Applicant-count control — context-sensitive ⚠ |
| TC_BUYUD_UI_005 | KYC Success Layout | Go to Home routing — full-form |
| TC_BUYUD_UI_006 | KYC Success Layout | Mobile viewport — boundary (mobile-first portal) |
| TC_BUYUD_BIZ_002 | Cost Sheet | Offers/discounts as deductions — integration |
| TC_BUYUD_BIZ_003 | Cost Sheet | Cost-sheet line items + total composition — full-form |
| TC_BUYUD_VAL_002 | Specs/Floor/Tower | Tower-view absence (DOC_DRIFT) ⚠ |
| TC_BUYUD_FUNC_009 | Payment Schedule | Milestone list with amounts/status — positive |
| TC_BUYUD_API_001 | API & Backend | unit-details API returns cost-sheet payload — UI-vs-API ⚠ |
| TC_BUYUD_XMOD_002 | Cross-module | HOME_LOAN/VC offer flows into cost sheet — integration |
| TC_BUYUD_EDGE_002 | Edge & Boundary | Long unit string in summary cell — boundary ⚠ |
| BYR_UNIT_060 | Edge & Boundary | imageUrl with embedded pipe — boundary defect (extends BYR_UNIT_032) |

(New-TC tracker file: `manual-qa-repository/07-execution/_new-tcs-buyer-unit-details.txt`.)

---

## Flags & blockers

- **DOC_DRIFT-001** — resolved in-doc (route correction already present in FS/FRD/BRD); re-stated in JSON notes. No new BRD/FRD write needed this pass.
- **`[VERIFY WITH DEV]` items (confirm before authoritative Pass/Fail):**
  - Missing/invalid `unitId` param behaviour (TC_BUYUD_NEG_002).
  - Applicant-count button — does it expand a list? (TC_BUYUD_UI_004).
  - Failed booking-form-data at download time — error handling (TC_BUYUD_NEG_003).
  - Whether FS on-page sections (specs/cost-sheet page/tower-view) exist in a mobile-app build or are planned (TC_BUYUD_VAL_001/002).
  - Live unit-details API response schema/field names (TC_BUYUD_API_001/BIZ_003).
  - Which live surface renders the floor plan (BYR_UNIT_046) given the page is absent.
  - Re-download restriction, long-string render, JWT lifetime exactness.
- **`[TEST_DATA_REQUIRED]` (state/disposable data needed):** WINNER+KYC-complete registration with unitId; non-WINNER token; cross-tenant registrationUnitId; expired/aged JWT; HCF order in VERIFICATION; multi-applicant (4) booking; unit with no milestones; unit with multi-image / pipe-containing imageUrl; booking with HOME_LOAN/VC offers.
- **No execution mutations required** — all TCs are read/view/download or API/DB inspection. No live-portal Submit/Delete/Save. (Pipeline discipline rule 7 respected.)

---

## Self-check (per tc-coverage-contract)

- [x] Positive happy path (FUNC_001/004/005, UI_001/002)
- [x] Every visible control on the live surface (heading, table×5 cols, Download btn, Applicant control, Go to Home — UI_001-005, FUNC_004)
- [x] Required/invalid params (NEG_002, BYR_UNIT_027/055)
- [x] Numeric/boundary (applicant max 4 EDGE_001; mobile viewport UI_006; SAS expiry BYR_UNIT_030; empty milestones BYR_UNIT_053)
- [x] Submit-time re-validation / race (BYR_UNIT_034/059)
- [x] 500 / empty-state / error strings (BYR_UNIT_028/053, NEG_001/003)
- [x] Context-sensitive control + routing (UI_004, NEG_001 routing, BYR_UNIT_059)
- [x] Silent-notification assertion (NEG_003)
- [x] API-layer behaviour where backend differs from UI (API_001, BYR_UNIT_026/030)
- [x] 401/403 / token / tenant isolation (NEG_004, BYR_UNIT_028/054)
- [x] Named downstream integrations (XMOD_001/002, BIZ_002, BYR_UNIT_035 HCF)
- [x] Pagination/upload/page-size — ➖ N/A (no list/upload/pagination on this static surface; download covered separately)
