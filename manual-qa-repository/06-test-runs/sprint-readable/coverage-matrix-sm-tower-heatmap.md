# Coverage Matrix — Sales Manager / Tower Heatmap

**Module:** Sales Manager / Tower Heatmap (route `/sales-manager/towers`, heading "Tower View")
**Generated:** 2026-06-13 (BA Agent, tc-coverage-contract — UNATTENDED)
**Sources read (dual-source gate satisfied):**
- `visual-memory/sm/tower-heatmap/INDEX.md` (CAPTURE_STATUS: FULL — 5 screens: loaded/tower-selected/unit-hover/unit-click/filter-fallback) + `_heatmap-unit-classes.json` (280-cell class map) + `_heatmap-dom-inspect.json` (headings, tower list, cell candidates, preference badges).
- BRD `SM-Portal/BRD/SM-BRD-SM-Portal.md` (§1-8; §4 rule 9 read-only; §2 roles).
- FRD `SM-Portal/FRD/SM-FRD-SM-Portal.md` (§5 Module 2 Tower Heatmap; §6 nav default; §7 auth; §9 error handling; §10 mobile).
- FS `SM-Portal/FRD/SM-FS-Tower-Heatmap.md` (Feature 1 §1.1-§1.7 + FSD-CORRECTION 2026-05-25 colour map + "How to Use").

**Totals:** 73 TCs = 60 preserved (IDs never renumbered) + 13 new gap. Output JSON: `manual-qa-repository/07-execution/_master-json/SM-TowerHeatmap.json` (replaces sheets `Tower Heatmap`, `Tower Heatmap (Exec)`; new master sheet `Tower Heatmap - Master`).

**Series continuation (no renumber):** SM_HMP -> 010 (kept); SM_HMP_FSD -> 011 (kept); SM_TH -> 030 (kept); TC_SMTWR_UI 020 -> 031, 033; TC_SMTWR_FUNC 029 -> 030, 031, 032; TC_SMTWR_BIZ 026 -> 027, 028; TC_SMTWR_NEG 030 -> 031; new series TC_SMTWR_API 001-003, TC_SMTWR_SEC 001, TC_SMTWR_NOTIF 001.

Legend: dimensions per tc-coverage-contract §1.
1 Pos · 2 Form · 3 Valid · 4 Race · 5 Neg · 6 Ctx · 7 Notif · 8 UIvBE · 9 Auth · 10 Integ · 11 Bound

| Feature / Sub-feature | 1 Pos | 2 Form | 3 Valid | 4 Race | 5 Neg | 6 Ctx | 7 Notif | 8 UIvBE | 9 Auth | 10 Integ | 11 Bound |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Navigation & page load | SM_HMP_001; TC_SMTWR_FUNC_029; TC_SMTWR_UI_001/002; SM_TH_016 | N/A: no form on landing | N/A: read-only, no input | N/A: no submit | SM_TH_012 (no-session redirect) | SM_TH_016 (default/last-viewed) | TC_SMTWR_NOTIF_001 (silent) | N/A | SM_TH_012; TC_SMTWR_NEG_028 | TC_SMTWR_FUNC_029 (sidebar from Callback Requests) | N/A |
| Top banner | TC_SMTWR_UI_020 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A: shared chrome | N/A |
| Loading state | SM_TH_013 | N/A | N/A | N/A | TC_SMTWR_NEG_031 (units 500) | N/A | N/A | N/A | N/A | N/A | N/A |
| Tower list (left rail) | SM_HMP_002; TC_SMTWR_FUNC_003; TC_SMTWR_UI_018; SM_TH_015 | N/A: list, no form | N/A: read-only | N/A | SM_TH_014 (empty state) | TC_SMTWR_BIZ_024 (inactive hidden) | N/A | N/A | N/A | TC_SMTWR_BIZ_024 (vs Admin /towers) | SM_TH_015 (scroll, many towers); SM_TH_014 (zero towers) |
| Tower selection / switching | SM_HMP_003; TC_SMTWR_FUNC_004; TC_SMTWR_FUNC_017 | N/A | N/A | TC_SMTWR_FUNC_017 (no stale grid) | SM_TH_030 (invalid tower path) | TC_SMTWR_FUNC_017 (exclusive selected state) | N/A | N/A | N/A | N/A | N/A |
| Grid structure (header/floors/counts) | TC_SMTWR_UI_005/006/016 | TC_SMTWR_UI_005 (per-column config set) | N/A: read-only | N/A | N/A | N/A | N/A | TC_SMTWR_API_001 (counts reconcile to grid) | N/A | TC_SMTWR_UI_016 (badge = available count) | SM_TH_027 (50+ floors); TC_SMTWR_BIZ_028 (padding); TC_SMTWR_UI_016 (35x8=280) |
| Preference badges | TC_SMTWR_UI_019 | N/A | N/A | N/A | N/A | TC_SMTWR_BIZ_027 (max-pref orange commented out) | N/A | N/A | N/A | TC_SMTWR_UI_019 (allocation pref source) | TC_SMTWR_UI_019 (values 1-4) |
| Download / export | TC_SMTWR_FUNC_021 (present) | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | TC_SMTWR_FUNC_030 (export click [VERIFY WITH DEV]) |
| Unit colour buckets (green/red/grey) | SM_HMP_004/006; TC_SMTWR_FUNC_010/011/013/014/015; SM_TH_023/024; TC_SMTWR_BIZ_028 | N/A | N/A | N/A | SM_HMP_005/007 (legacy orange/blue -> green, DOC_DRIFT-001) | TC_SMTWR_FUNC_010-015 (per-status cell variant); TC_SMTWR_FUNC_012 (PBT cyan DOC_DRIFT-002) | N/A | TC_SMTWR_FUNC_012 (visual vs source colour); SM_HMP_008 (legend vs §1.5) | N/A | N/A | N/A |
| Status legend | SM_HMP_008 (corrected map) | N/A | N/A | N/A | SM_HMP_005/007 (no orange/blue) | N/A | N/A | SM_HMP_008 (DOC_DRIFT-001) | N/A | N/A | N/A |
| Unit Details panel (available) | TC_SMTWR_FUNC_007/008; TC_SMTWR_FUNC_031/032 | TC_SMTWR_FUNC_008 (full field set); TC_SMTWR_FUNC_031 (*all-inclusive) | N/A: read-only panel | TC_SMTWR_FUNC_032 (panel replace, no stack) | TC_SMTWR_NEG_022 (non-available inert) | TC_SMTWR_FUNC_007 (panel vs inert by status); TC_SMTWR_UI_033/SM_TH_026 (hover no-tooltip DOC_DRIFT-003) | N/A | TC_SMTWR_FUNC_008 (masked ₹ values) | N/A | N/A | N/A |
| Read-only guarantee | SM_HMP_009; TC_SMTWR_BIZ_009 | N/A: no write form | N/A | N/A | TC_SMTWR_NEG_022 (inert cells); SM_TH_018 (API write 403) | TC_SMTWR_NEG_023 (no filter control) | TC_SMTWR_NOTIF_001 | SM_TH_018 (UI read vs API write block) | SM_TH_018 (SM role no write) | TC_SMTWR_BIZ_009 (routes to Physical Allocation) | N/A |
| Audit / silent behaviour | SM_TH_021; TC_SMTWR_NEG_027 | N/A | N/A | N/A | N/A | N/A | TC_SMTWR_NOTIF_001; SM_TH_021/TC_SMTWR_NEG_027 (no audit row) | N/A | N/A | N/A | N/A |
| Live updates (WebSocket) | SM_HMP_010; TC_SMTWR_BIZ_025/026; SM_TH_017/020 | N/A | N/A | SM_TH_022 (burst -> reload reconcile); SM_TH_019 (reconnect) | SM_TH_017 (no socket outside campaign) | TC_SMTWR_BIZ_025 (HOLD->green / BOOKED->red); SM_TH_020 (per-tower sub) | N/A | TC_SMTWR_BIZ_026 (DB last-known vs live) | SM_TH_028 (socket closes on logout) | SM_HMP_010/TC_SMTWR_BIZ_025 (Physical Allocation -> heatmap) | N/A |
| API & backend | SM_HMP_FSD_011; SM_TH_029; TC_SMTWR_API_001 | N/A | TC_SMTWR_API_003 (malformed/non-existent id) | N/A | TC_SMTWR_NEG_031 (500); TC_SMTWR_API_002 (401/403); TC_SMTWR_API_003 | N/A | TC_SMTWR_NOTIF_001 | SM_TH_029 (?action= shape split); SM_TH_018 (write block) | SM_HMP_FSD_011 (shared role gate); TC_SMTWR_API_002 (token) | SM_HMP_FSD_011 (shared user/admin/sm-admin/sm) | N/A |
| Auth / role / security | TC_SMTWR_NEG_028 | N/A | N/A | N/A | SM_TH_012 (no session); TC_SMTWR_NEG_030 (non-SM role); SM_TH_030 (invalid path) | TC_SMTWR_NEG_028 (post-login default landing) | N/A | TC_SMTWR_SEC_001 (tamper -> 401) | SM_TH_012; TC_SMTWR_NEG_030; TC_SMTWR_SEC_001; SM_TH_018 | N/A | N/A |
| Responsiveness | SM_TH_025 (tablet); TC_SMTWR_UI_031 (mobile) | N/A | N/A | N/A | N/A | TC_SMTWR_UI_031 (bottom-nav mobile layout) | N/A | N/A | N/A | N/A | SM_TH_025 (768x1024); TC_SMTWR_UI_031 (375x667) |

## N/A justifications (summary)
- **2 Form / most rows**: Tower Heatmap is read-only (SM-BRD §4 rule 9, SM-FS §1.2). The only "forms" are the Unit Details panel (read-only field set — TC_SMTWR_FUNC_008) and the unit-size header (TC_SMTWR_UI_005). There is no input form to validate.
- **3 Valid / UI rows**: No user input on the page (no filter, no search, no editable field — INDEX.md `filters: []`). Validation applies only at the API path (malformed towerId — TC_SMTWR_API_003).
- **4 Race**: No client submit/booking on this screen. The only meaningful races are server-pushed WebSocket ordering (SM_TH_022), reconnect (SM_TH_019) and panel-replace (TC_SMTWR_FUNC_032).
- **7 Notif**: The screen is silent by design across every interaction — asserted once positively (TC_SMTWR_NOTIF_001) and via the no-audit cases (SM_TH_021 / TC_SMTWR_NEG_027). Silence here is correct (CLAUDE.md "silent UX is not a bug").
- **11 Bound**: No pagination, no page-size control, no upload on this page. Volume edges are floor-count (SM_TH_027 50+, TC_SMTWR_UI_016 35x8) and tower-count (SM_TH_015 many / SM_TH_014 zero) and viewport (SM_TH_025 / TC_SMTWR_UI_031).

## Self-audit gate result
No unjustified-empty cell. Every dimension for every feature is either covered by a TC_ID or carries a specific N/A. **Module coverage complete.**

## DOC_DRIFT raised (BRD/FRD/FS must be corrected to match live source/UI)
- **DOC_DRIFT-001** — SM-FS §1.5 legend table (White/Green=Available, Orange=Hold, Red=Booked, Blue=Reserved) is STALE. The source FSD-CORRECTION + `common.service.js` define only GREEN (#00FF00 = AVAILABLE/HOLD/PREBOOKED/RESERVED), RED (#FF0000 = BOOKED/PBT), GREY (#808080 = REFUGE/NOT_AVAILABLE). Orange does not exist (max-pref highlight commented out); blue does not exist (folded into green). Correct the §1.5 table. TCs: SM_HMP_005/007 (re-expected to green), SM_HMP_008, SM_TH_023/024, TC_SMTWR_FUNC_010, TC_SMTWR_BIZ_027.
- **DOC_DRIFT-002** — PBT cell colour mismatch: source FSD-CORRECTION puts PBT in the RED bucket, but the UAT live capture renders `pbt-unit` cells cyan/turquoise. Visual vs source contradiction. [VERIFY WITH DEV] which is canonical. TC: TC_SMTWR_FUNC_012.
- **DOC_DRIFT-003** — Hover tooltip: legacy SM_TH_026 expects a hover tooltip/popover with unit number + status; visual-memory INDEX.md (live DOM) shows NO tooltip element renders on hover (CSS border effect only). INDEX.md is canonical; unit number is read by clicking an available cell. TCs: SM_TH_026 (re-expected), TC_SMTWR_UI_033.
- **DOC_DRIFT-004** — Post-login landing: SM-FRD §6 sets the default landing to /sales-manager/callback-requests (Towers is reached via sidebar). Any flow treating Towers as the post-login landing is wrong. TC: TC_SMTWR_NEG_028 / TC_SMTWR_FUNC_029.

## Open flags carried into TCs
- **[VERIFY WITH DEV]**: SM_TH_013 (loading component), SM_TH_014 (empty-state string), SM_TH_016 (last-viewed persistence), SM_TH_017/019/020/022/028 (WebSocket lifecycle/order), SM_TH_025 / TC_SMTWR_UI_031 (intended tablet/mobile layout), SM_TH_027 (tall tower), SM_HMP_008 (whether a legend strip is rendered at all), SM_HMP_FSD_011 (per-role payload), SM_TH_029 (per-variant field set), TC_SMTWR_FUNC_012 (PBT colour), TC_SMTWR_FUNC_030 (export contract), TC_SMTWR_FUNC_031 (info-icon breakdown), TC_SMTWR_API_002/003 (status codes/error strings), TC_SMTWR_NEG_031 (500 UI), TC_SMTWR_NOTIF_001 (side-channel), TC_SMTWR_SEC_001 (tamper detection at route), SM_TH_018/SM_TH_030 (write-block / route segment), TC_SMTWR_NEG_028 (deep-link return).
- **[TEST_DATA_REQUIRED]**: SM_HMP_005 (HOLD unit), SM_HMP_007 (RESERVED unit), SM_TH_023 (HOLD/PREBOOKED/RESERVED units), SM_TH_014 (all-towers-inactive), SM_TH_021/TC_SMTWR_NEG_027 (audit-log access), SM_HMP_010/SM_TH_017? (active campaign), SM_TH_019/020/022/028 + TC_SMTWR_BIZ_025 (active campaign), TC_SMTWR_BIZ_024 (inactive tower), SM_TH_027 (50+ floor tower), TC_SMTWR_FUNC_030 (export authorisation), SM_HMP_FSD_011 (role tokens), SM_TH_029/SM_TH_018/TC_SMTWR_API_001/002/003 (API access), TC_SMTWR_NEG_031 (fault injection), TC_SMTWR_NOTIF_001 (message-log access), TC_SMTWR_NEG_030 (non-SM mobile).

## Blockers
None. Dual-source gate satisfied (FULL visual memory + BRD + FRD + FS all present). No live-portal mutation is required to author these TCs; destructive/state-dependent cases are flagged [TEST_DATA_REQUIRED] with authorisation notes and gray-filled for user verification.

## Note — write-action setup is off-screen
Every state-changing precondition (HOLD/BOOKED/RESERVED units, active PHYSICAL_EVENT campaign, inactive tower) must be created from the Admin Portal or Physical Allocation, never from this read-only screen. Live-update TCs depend on a concurrently running campaign and a second authenticated session.
