# Coverage Matrix — Buyer → Project Information

**Module:** Buyer Portal / Project Information (ACTIVE module — not the deprecated CP project-information)
**Master JSON:** `manual-qa-repository/07-execution/_master-json/Buyer-ProjectInformation.json`
**Sheet (on build):** `Project Information - Master` (replaces `Project Information` + `Project Information (Exec)`)
**Sources (dual-source gate — BOTH present):**
- Visual: `visual-memory/buyer/project-information/INDEX.md` (CAPTURE_STATUS: FULL, captured 2026-06-03, re-verified 2026-06-06)
- BRD/FS/FRD: `BUYER-FS-Project-Information.md`, `BUYER-BRD-Buyer-Portal.md`, `BUYER-FRD-Buyer-Portal.md` (Module 8)

**Totals:** 76 TCs · 70 preserved baseline · 6 new · 15 sub-modules

---

## Key reality (governs the whole matrix)

The live page is a **read-only, single-scroll content page** of embedded videos + images. It has **NO tabs, NO gallery lightbox, NO downloadable documents section, NO tower-spec tables** — contradicting the FS/FRD which describe a 5-tab layout (Overview/Towers/Gallery/Documents/Videos) with downloads. See **DOC_DRIFT-001** (tabs/lightbox/tower-specs) and **DOC_DRIFT-002** (documents/downloads) in the JSON notes block. Live UI wins; legacy TCs for absent features are retained, re-scoped, and flagged `[VERIFY WITH DEV]`.

---

## Features × 11 Dimensions

Legend: ✅ covered · ⚠ covered but DOC_DRIFT / [VERIFY WITH DEV] · — N/A for a read-only content page

| Feature (live) | 1 Positive | 2 Full-form | 3 Mandatory/Val | 4 Re-check/race | 5 Negative/error | 6 Context-sensitive | 7 Notifications | 8 UI-vs-backend | 9 Role/auth | 10 Integration | 11 Boundary |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Page load & access | ✅ FUNC_001, BYR_001, BYR_030 | — | — | — | ✅ NEG_014 | ✅ BYR_002/FUNC_018 (alloc-status) | ✅ FUNC_019 | ⚠ BYR_027/029/026 | ✅ NEG_014, BYR_031, VAL_001 | ⚠ BYR_029 (env projectId) | ✅ BYR_032 (refresh) |
| Heading & RERA | ✅ UI_002, FUNC_003 | — | — | — | — | — | — | — | — | ✅ BYR_039 (RERA disclosure) | — |
| Content sections (video/img) | ✅ UI_004–008, FUNC_009, UI_017 | ✅ each section has a case | ⚠ BYR_038 (no raw markup) | — | ✅ BYR_035 (no 404) | — | — | — | — | ✅ BYR_005/036 (Strapi render) | — |
| Read-only enforcement | ✅ UI_010, UI_016, BYR_008 | ✅ scans all cards | — | — | — | — | — | — | — | — | — |
| Video playback | ⚠ BYR_019/020 (VERIFY) | ⚠ BYR_020 (controls) | — | — | — | — | ✅ FUNC_019 (silent) | — | — | — | — |
| Navigation & layout | ✅ FUNC_011/012/015, E2E_013 | — | — | — | — | — | — | — | — | — | ✅ BYR_024 (back), BYR_033 |
| Auth & security | ✅ (implicit) | — | ✅ VAL_001 | ✅ VAL_001 (expired re-check) | ✅ NEG_014, BYR_031 | — | — | — | ✅ NEG_014, BYR_031, VAL_001 | — | — |
| API & content (Strapi) | ✅ API_001, BYR_005/022 | — | — | ✅ BYR_022 (publish→reload) | ✅ BYR_023, API_002 | — | — | ✅ API_001/002 (token vs UI) | ✅ API_002 (401) | ✅ BYR_022/023/026/036/046 | ✅ BYR_046 (slow) |
| Empty / loading states | — | — | — | — | ✅ BYR_037/040/013/021 | — | — | — | — | ✅ BYR_037 (no Strapi items) | ✅ BYR_040/046 (loader) |
| Error handling | — | — | — | — | ✅ BYR_049, REG_020 | — | — | — | — | ✅ BYR_049 (500) | ✅ BYR_044 (numeric fmt) |
| Documents/brochure (DRIFT) | ⚠ BYR_016/017 | — | — | — | ⚠ BYR_048 (expired SAS) | — | — | — | — | ⚠ BYR_048 (Azure) | — |
| Tower specs (DRIFT) | ⚠ BYR_006/007/041/042 | — | — | — | ⚠ BYR_043 (empty) | — | — | — | — | — | — |
| Tabs/Gallery/Lightbox (DRIFT) | ⚠ BYR_003/004/009/010/011/012/014/034/050 | — | — | ⚠ BYR_047 (concurrent) | ⚠ BYR_014 | ⚠ BYR_010–012 (lightbox states) | — | — | — | — | ⚠ BYR_045 (mobile h-scroll) |
| Responsive & regression | ✅ EDGE_020, UI_018, REG_019 | — | — | — | — | — | — | — | — | — | ✅ EDGE_020 (1920×900), UI_018 (375×667) |
| Notifications (silent) | ✅ FUNC_019 | — | — | — | — | — | ✅ FUNC_019 (silence by design) | — | — | — | — |

### Dimension roll-up
- **1 Positive** ✅ — every live feature has a happy-path case.
- **2 Full-form** ✅ / N/A — page has no forms; "full-form" reinterpreted as every content section + control enumerated from the screenshot (each has a case).
- **3 Mandatory/validation** N/A (no inputs) — represented by content-integrity (no raw markup) + session validation (VAL_001).
- **4 Re-check/race** ✅ — Strapi publish→reload (BYR_022), expired-session re-check (VAL_001), concurrent interaction (BYR_033/047).
- **5 Negative/error** ✅ — unauthenticated (NEG_014/BYR_031), empty states, Strapi outage (BYR_023), 500 (BYR_049), API 401 (API_002).
- **6 Context-sensitive** partial/N/A — page has no row-state controls; lightbox-state cases are DOC_DRIFT.
- **7 Notifications** ✅ — silence-by-design asserted (FUNC_019).
- **8 UI-vs-backend** ✅ — content API cases (API_001/002) + env-bound projectId (BYR_029).
- **9 Role/auth** ✅ — unauth redirect, logged-out redirect, tampered/expired JWT.
- **10 Integration** ✅ — Strapi-render chain (out-of-scope authoring, in-scope render), Azure SAS (DRIFT), RERA disclosure.
- **11 Boundary** ✅ — viewport baselines (1920×900, 375×667), slow/loading boundaries, refresh/back.

---

## New TC IDs (6) — gray-fill candidates

| New TC_ID | Sub-module | Why added (gap closed) |
|---|---|---|
| `TC_PROJINFO_VAL_001` | Auth & Security | No expired/tampered-JWT case existed (dim 3/4/9). |
| `TC_PROJINFO_API_001` | API & Content | No content-API success/contract case existed (dim 8/10). |
| `TC_PROJINFO_API_002` | API & Content | No content-API auth-rejection (401/403) case existed (dim 9). |
| `TC_PROJINFO_REG_020` | Error Handling | No clean-console / no-asset-404 regression case existed (dim 5/11). |
| `TC_PROJINFO_UI_018` | Responsive & Regression | No mobile-viewport (375×667) case existed; BRD is mobile-first (dim 11). |
| `TC_PROJINFO_FUNC_019` | Notifications | No silence-by-design assertion existed (dim 7 — required case). |

Written one-per-line to `manual-qa-repository/07-execution/_new-tcs-buyer-project-information.txt` (separate file; shared tracker untouched).

---

## Flags

- **DOC_DRIFT-001 (MAJOR):** FS/FRD describe a 5-tab Project Information UI (Overview/Towers/Gallery/Documents/Videos) + lightbox + tower-spec tables; live UI has none. 19 legacy TCs re-scoped to `[VERIFY WITH DEV]` (sub-modules: Tower Specs DRIFT, Tabs/Gallery/Lightbox DRIFT, plus BYR_008/024/032/033/044/045). BUYER-FS-Project-Information §1.4 and BUYER-FRD Module 8 should be corrected to the live content-only page.
- **DOC_DRIFT-002:** FS Documents section (RERA download, approvals, brochures) and "How to Use" Step 3 (download docs) not present in live UI; only RERA-ID text is shown. TCs BYR_016/017/048 re-scoped to `[VERIFY WITH DEV]`.
- **[VERIFY WITH DEV] open items:** video player interactivity (visual-memory marks videos "not in test scope"); exact empty-state / loader / error strings (not transcribed); content-API endpoint path & shape (Strapi out of scope); Buyer-portal JWT at-expiry behaviour; mobile baseline (no 375-width screenshot captured); NODE_ENV-hardcoded projectId / Strapi id=1 (backend claims).
- **[TEST_DATA_REQUIRED] items:** pre-allocation + booked buyer mobiles; project with isActive=false; fresh Strapi publish; forced content-API failure/500/throttle; empty-content / no-image / no-video projects; expired Azure SAS URL; buyer API bearer token; tampered/expired JWT; EOI configs (BYR_025/028).
- **No blockers.** Dual-source gate satisfied (FULL capture + FS/BRD/FRD all present). Builder not run and xlsx untouched, per instructions.
