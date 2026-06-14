# Coverage Matrix — Buyer / Work Progress

**Module:** Work Progress (Buyer Portal) · **Route:** `https://uat.xrportal.in/work-progress`
**Master JSON:** `manual-qa-repository/07-execution/_master-json/Buyer-WorkProgress.json`
**Sheet (on build):** `Work Progress - Master` (replaces `Work Progress` + `Work Progress (Exec)`)
**Sources (dual-source gate — BOTH present):**
- Visual: `visual-memory/buyer/work-progress/INDEX.md` — CAPTURE_STATUS **FULL** (no VISUAL_GAP)
- BRD/FRD/FS: `BUYER-FS-Work-Progress.md` (§1.1–1.5 + How-to), `BUYER-FRD-Buyer-Portal.md` (Module 11), `BUYER-BRD-Buyer-Portal.md` (Module 11)

**Totals:** 68 TCs · 63 preserved baseline · **5 new** · 14 sub-modules.

---

## Module character

Work Progress is a **read-only informational surface** — a project banner, a "Work Progress" heading, and 7 tower tabs each holding a Swiper photo carousel with captions. No forms, tables, comments, uploads, edits, or action buttons (content is CMS-published by the developer's team). Coverage therefore weights heavily toward UI/state/read, read-only-guarantee, CMS-propagation downstream effects, and auth/security; classic form-validation/boundary dimensions are **N/A by design** and recorded as such.

---

## Features × 11 Dimensions

Legend: ✓ = covered · n/a = not applicable by design (read-only surface) · ▲ = covered but flagged `[VERIFY WITH DEV]`

| Feature \ Dimension | 1 Positive | 2 Full-form | 3 Mandatory/Valid | 4 Submit re-check | 5 Negative/Error | 6 Context-ctrl | 7 Notifications | 8 UI-vs-API | 9 Role/Auth | 10 Integration | 11 Boundary |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Navigation & Landing | ✓ (001,002,E2E_001,UI_001,004) | n/a | n/a | n/a | ✓ (NEG_001) | ✓ (UI_004 sidebar) | — | — | ✓ (NEG_001) | — | — |
| Top utility bar (strapline/RERA) | ▲ (UI_005) | n/a | n/a | n/a | — | — | — | — | — | — | — |
| Banner (media + caption) | ✓ (025,026) | n/a | n/a | n/a | — | ▲ (025 video/img) | — | — | — | ▲ (041 propagation) | — |
| Tower Tabs | ✓ (UI_002,003,FUNC_008) | ✓ (FUNC_001-007 each tower) | n/a | n/a | ▲ (UI_006 Preview drift) | ✓ (FUNC_008 routing) | — | — | — | ✓ (040 add/remove,023 all-towers) | ✓ (7-tab enumeration UI_002) |
| Tower Content (photos/captions/carousel) | ✓ (005,008,010,BIZ_001) | n/a | n/a | n/a | ✓ (006,042) | ✓ (010 nav) | — | — | — | — | ✓ (027,043 breakpoints) |
| Lightbox / Enlarged photo | ▲ (011) | n/a | n/a | n/a | ▲ (012 close) | ▲ (011) | — | — | — | — | — |
| Empty/Loading/Error states | ✓ (021 loading) | n/a | n/a | n/a | ✓ (018,019,024,042,045) | — | — | — | — | — | ✓ (018 zero-content) |
| Read-Only Guarantee | ✓ (013,BIZ_002,031,032,035) | n/a (no inputs) | n/a | n/a | ✓ (033 ctx-menu) | ✓ (030,033) | — | — | — | — | — |
| Availability across stages | ✓ (003,BIZ_003) | n/a | n/a | n/a | — | — | — | — | ✓ (BIZ_003 stage-gate) | — | — |
| CMS-driven propagation | ✓ (015,017,037,038,039) | n/a | n/a | ▲ (037 revalidate window) | ✓ (016 removal) | — | — | — | — | ✓ (015,016,017,022,037-041) | — |
| Notifications | — | n/a | n/a | n/a | — | — | ✓ (029 silence-by-design) | — | — | ✓ (029) | — |
| Responsive/Cross-viewport | ✓ (020,UI_007) | n/a | n/a | n/a | — | — | — | — | — | — | ✓ (020,043 viewports) |
| Navigation away & Logout | ✓ (UI_004,FUNC_009) | n/a | n/a | n/a | ✓ (FUNC_009 re-auth) | — | — | — | ✓ (FUNC_009) | — | — |
| Auth & Security | — | n/a | n/a | n/a | ✓ (NEG_001,NEG_002) | — | — | ✓ (034,036,014 buyer-write) | ✓ (NEG_001,NEG_002,034,036,014) | — | — |
| End-to-End | ✓ (E2E_001,E2E_002,FUNC_001-007,BIZ_001) | ✓ (FUNC_001-007) | n/a | n/a | — | ✓ (E2E_002 tab sweep) | — | — | — | ✓ (E2E_002) | — |

### Dimension roll-up
- **1 Positive** — ✓ across every visible feature.
- **2 Full-form** — re-scoped to "every control/tower on screen": all 7 tower tabs each exercised (FUNC_001-007); banner, sidebar, carousel controls covered. No data-entry forms exist (n/a).
- **3 Mandatory/Validation** & **4 Submit re-check** — **N/A by design**: no inputs/forms/submit on this surface. CMS-propagation freshness window covered as the nearest analogue (037 ▲).
- **5 Negative/Error** — ✓: unauth (NEG_001), tampered/expired JWT (NEG_002), broken image (042), empty (018), outage (019/024), content-block missing (045), buyer write rejected (034/036/014), context-menu admin actions absent (033).
- **6 Context-sensitive** — ✓: tab routing (FUNC_008), carousel nav (010), sidebar nav (UI_004).
- **7 Notifications** — ✓: explicit silence-by-design assertion (029).
- **8 UI-vs-API** — ✓: buyer read-only enforced at API (034/036/014 ▲ — backend is CMS/Strapi, out-of-scope to test directly; buyer-facing API rejection asserted).
- **9 Role/Auth/Security** — ✓: unauth redirect, token tamper, logout re-auth, stage-gate absence.
- **10 Integration** — ✓: CMS→buyer downstream propagation (015-017, 022, 037-041), all-towers visibility (023), notification absence (029).
- **11 Boundary** — ✓: 7-tab enumeration, zero-content empty state, viewport breakpoints (020/027/043), long-caption overflow (044).

---

## New TC IDs (5) — continue series, gray-fill on build

| New TC_ID | Sub-Module | Why added |
|---|---|---|
| `TC_WP_UI_005` | Navigation & Landing | Asserts top-bar strapline + RERA ID (observed live, undocumented → DOC_DRIFT-WP-002). |
| `TC_WP_UI_006` | Tower Tabs | Records that INDEX.md's 8th "Preview" tab is NOT rendered (DOC_DRIFT-WP-001); 7 tabs only. |
| `TC_WP_UI_007` | Responsive/Cross-viewport | Desktop 1920×900 baseline-match against captured screenshot. |
| `TC_WP_NEG_002` | Auth & Security | Tampered/expired JWT rejected → redirect to login (security dimension gap). |
| `TC_WP_E2E_002` | End-to-End | Full browse-all-7-towers journey (FS How-to Steps 1-2). |

New-TC tracker (module-scoped, not the shared tracker): `manual-qa-repository/07-execution/_new-tcs-buyer-work-progress.txt`.

---

## DOC_DRIFT & Flags

- **DOC_DRIFT-WP-001 (Tower tab count):** Live UI renders **7** tower tabs (Crest, Prestige, Triumph, Crown, Horizon, Radiance, Aspire). INDEX.md "Tower / Building Tabs" also lists an 8th entry **"Preview"** which does NOT render. Live UI wins — TCs cover 7 towers; `TC_WP_UI_006` records the drift. Recommend INDEX.md correction. `[VERIFY WITH DEV]` whether "Preview" is intentionally hidden/removed.
- **DOC_DRIFT-WP-002 (Top-bar strings):** Strapline "India's Biggest Growth Housing Revolution Begins On 7th April 2026." and "RERA ID: P99000080006" appear on the live page but are absent from BRD/FRD/FS. Asserted as observed; `[VERIFY WITH DEV]` for canonical wording (`TC_WP_UI_005`).
- **Implementation flags (baseline-carried, all `[VERIFY WITH DEV]`):** per-buyer tower filter appears to be dead code → every buyer sees ALL towers (`BYR_WRK_023`); `projectId` hardcoded to 1 → buyers on other projects may still see project 1's content (`BYR_WRK_022`, potential defect); content uses ~10s ISR revalidate (`BYR_WRK_037`); banner is "workBannerVideo" config (`BYR_WRK_025/026/041`); autoplay continues after swipe (`BYR_WRK_028`).
- **Potential UX gap (flagged, not asserted Pass):** `BYR_WRK_024` — content-service block reportedly leaves a "Loading tower data..." placeholder forever (no timeout/retry). Confirm acceptable vs should fall back to error/empty.
- **Lightbox uncertainty:** FS documents no lightbox; live captures show no lightbox state. `BYR_WRK_011`/`012` authored as `[VERIFY WITH DEV]` rather than dropped.
- **CMS/Strapi scope:** Strapi is out of scope (project constraint). All CMS cases verify only the **downstream buyer-portal effect**; the publish/unpublish step is a `[TEST_DATA_REQUIRED]` precondition, not an assertion target.

## Blockers
None. Dual-source gate satisfied (visual FULL + FS/FRD/BRD present). No VISUAL_GATE_BLOCK, no DOC_MISSING. Several behaviours require dev confirmation (`[VERIFY WITH DEV]`) and several destructive/state cases require disposable UAT data (`[TEST_DATA_REQUIRED]`) before they yield authoritative Pass/Fail.
