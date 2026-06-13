# Coverage Matrix — Admin / Towers

**Module:** Admin / Towers
**Generated:** 2026-06-13 (BA Agent, tc-coverage-contract)
**Sources read:**
- `visual-memory/admin/towers/INDEX.md` (FULL — 8 screens incl. available/booked/hold panels, Config deep-link, tower toggle)
- BRD `Admin-Portal/BRD/ADMIN-BRD-Towers.md` (§1-11, incl. §11 Backend Gap Reconciliation)
- FRD `Admin-Portal/FRD/ADMIN-FRD-Towers.md` (Zones 1-4, §5 Business Rules, §10 Data Model, §11 API)
- FS `Admin-Portal/FRD/ADMIN-FS-Towers.md` (Features 1-5 + Backend Gap Reconciliation)

**Totals:** 63 TCs (45 preserved + 18 new gap). Output JSON: `manual-qa-repository/07-execution/_master-json/Admin-Towers.json`.

Legend: dimensions per tc-coverage-contract §1.
1 Pos · 2 Form · 3 Valid · 4 Race · 5 Neg · 6 Ctx · 7 Notif · 8 UIvBE · 9 Auth · 10 Integ · 11 Bound

| Feature / Sub-feature | 1 Pos | 2 Form | 3 Valid | 4 Race | 5 Neg | 6 Ctx | 7 Notif | 8 UIvBE | 9 Auth | 10 Integ | 11 Bound |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Page load / landing | ADM_TWR_001 | N/A: no form on landing | N/A: read-only, no input | N/A: no submit | ADM_TWR_NEG_057 (no-session redirect) | N/A: single landing state | N/A: read-only | N/A | ADM_TWR_NEG_057 | N/A | N/A |
| Read-only guarantee | ADM_TWR_031 | N/A | N/A | N/A | ADM_TWR_NEG_048 (reserve CTA contradicts) | N/A | N/A | ADM_TWR_NEG_048 (DOC_DRIFT-004) | N/A | N/A | N/A |
| KPI cards (Towers+Units) | ADM_TWR_002/003/004/005/006/007/008 | ADM_TWR_002b (full block) | N/A: derived counts, no input | N/A | ADM_TWR_NEG_060 (kpi fail) | N/A | N/A: read-only | ADM_TWR_008 (RESERVED-only, §11.3) | N/A | ADM_TWR_INT_046 (matches Customers); ADM_TWR_036 (Config sync) | N/A: fixed 18 |
| KPI live update | ADM_TWR_036 | N/A | N/A | N/A | N/A | N/A | ADM_TWR_FSD_042 (silent) | N/A | N/A | ADM_TWR_035 (pricing); ADM_TWR_036 (toggle) | N/A |
| Tower sidebar list | ADM_TWR_009/010/011/013/044 | N/A: list, no form | N/A | N/A | N/A | ADM_TWR_011 (Inactive label) | N/A | N/A | N/A | ADM_TWR_044 (= KPI 18) | N/A: fixed 18 rows |
| Select tower / grid | ADM_TWR_012/014/015/032/013b/002c | ADM_TWR_002c (legend strip) | N/A: read-only | ADM_TWR_013b (fresh reload) | ADM_TWR_038 (0-available) | ADM_TWR_016/017/018/019/EDGE_047/NOTAVAIL_049 (per-status cell) | N/A | N/A | N/A | N/A | ADM_TWR_037 (high inventory) |
| Unit detail panel (Available) | ADM_TWR_020/021/022/023/024/025/026 | ADM_TWR_FORM_050 (full field set) | N/A: read-only panel | N/A | ADM_TWR_028/029/030 (non-clickable) | ADM_TWR_DC_053 (owned-vs-unowned routing) | N/A | ADM_TWR_API_055 (panel fields not in API, §11.7) | N/A | ADM_TWR_034 (offer in price) | N/A |
| Panel dismiss behaviour | ADM_TWR_027/045 | N/A | N/A | N/A | N/A: no x button (DOC_DRIFT-002) | N/A | N/A | N/A | N/A | N/A | N/A |
| Booked/Hold panel (DOC_DRIFT-003) | ADM_TWR_DC_051/052 | ADM_TWR_DC_051 (customer block) | N/A | N/A | ADM_TWR_028/030 (BRD-conflict cases) | ADM_TWR_DC_053 (routing) | N/A | N/A | N/A | N/A | N/A |
| Cross-module nav (View Tower) | ADM_TWR_033 | N/A | N/A | N/A | N/A | ADM_TWR_043 (inactive tower) | N/A | N/A | N/A | ADM_TWR_033/043 (Config→Towers) | N/A |
| Tower status-update (API) | ADM_TWR_FSD_039 | N/A | ADM_TWR_FSD_040 (no-op skip, §11.6) | ADM_TWR_FSD_040 (idempotent) | ADM_TWR_NEG_058 (401/403) | N/A | ADM_TWR_FSD_042 (silent) | ADM_TWR_API_054 (GET-body filter, §11.2) | ADM_TWR_NEG_058; ADM_TWR_API_056 (projectId, §11.1) | ADM_TWR_FSD_039 (Python broadcast, §11.5) | N/A |
| Unit status sync (API) | ADM_TWR_FSD_041 | N/A | N/A | N/A | N/A | N/A | ADM_TWR_FSD_042 (silent) | N/A | N/A | ADM_TWR_FSD_041 (Python sync) | N/A |
| units-by-tower API | ADM_TWR_API_055 | N/A | N/A | N/A | ADM_TWR_NEG_059 (500); ADM_TWR_NEG_058 (401/403) | N/A | N/A | ADM_TWR_API_055 (shape, §11.7) | ADM_TWR_API_056 (env projectId) | N/A | N/A |
| Error handling | N/A | N/A | N/A | N/A | ADM_TWR_NEG_059/060 ([VERIFY WITH DEV]) | N/A | N/A | N/A | N/A | N/A | N/A |

## N/A justifications (summary)
- **3 Valid / most rows**: Towers is a read-only view — the page accepts no user input (BRD §7, FS Features 1-5 §6). Validation only applies to the API status-update path (covered by ADM_TWR_FSD_040 / ADM_TWR_API_054).
- **7 Notif / read rows**: Read actions dispatch nothing. Silent-by-design is asserted at the only state-changing surface (tower/unit status) by ADM_TWR_FSD_042.
- **11 Bound**: No pagination, no upload, no page-size control on this page (grid is full-tower, INDEX.md: no search/filter inputs). Inventory-volume edges covered by ADM_TWR_037 (high) / ADM_TWR_038 (zero).
- **4 Race**: No client submit/booking on this page (read-only). Only the idempotent no-op toggle race is meaningful → ADM_TWR_FSD_040.

## Self-audit gate result
No unjustified-empty cell. Every dimension is either covered by a TC_ID or carries a specific N/A. **Module coverage complete.**

## DOC_DRIFT raised (BRD/FRD must be corrected to match live UI)
- **DOC_DRIFT-001** — Unit detail is an inline panel `div.more-details-allocation`, NOT an `.ant-drawer`/modal as BRD/FRD §Feature 4 state. (ADM_TWR_020)
- **DOC_DRIFT-002** — No close (x) button exists; panel is dismissed by clicking another cell. BRD/FRD claim a x close control. (ADM_TWR_027)
- **DOC_DRIFT-003** — Red (BOOKED) and orange (HOLD) cells DO open the detail panel with a customer block (name/reg/phone). BRD §6 rule 5 + FRD say only white/Available cells are clickable. Major contradiction. (ADM_TWR_DC_051/052/053 assert observed; ADM_TWR_028/030 record the conflict.)
- **DOC_DRIFT-004** — Available-unit panel carries a green "Mark unit as Reserved" CTA — an action surface contradicting BRD §6 "fully read-only". (ADM_TWR_NEG_048) [VERIFY WITH DEV] scope.
- **DOC_DRIFT-005** — Tower-list order differs across sources: BRD §4 Zone 2 order ≠ INDEX.md sticky-list click order ≠ Config numeric-prefix (Tower 8…) order. Cosmetic; reconcile the canonical ordering. (ADM_TWR_009)

## Open flags carried into TCs
- **[VERIFY WITH DEV]**: ADM_TWR_024/025/034/035/037 (panel pricing source vs API §11.7), ADM_TWR_NEG_048 (reserve CTA), ADM_TWR_API_054/055/056, ADM_TWR_NEG_058/059/060, ADM_TWR_NOTAVAIL_049.
- **[TEST_DATA_REQUIRED]**: ADM_TWR_018/030 (HOLD unit), ADM_TWR_035 (re-priced unit), ADM_TWR_034 (offer unit), ADM_TWR_036 (disposable inactive tower), ADM_TWR_FSD_039/040/041/042, ADM_TWR_API_054 etc. (API access), ADM_TWR_NEG_058/059/060.

## Note — out-of-scope per current UAT build
The conditional-TC source referenced a per-unit Active/Inactive toggle inside Config. INDEX.md confirms only TOWER-level toggles exist on `/admin/cms` in the 2026-06-02 build; no unit-granularity UI. Unit-status changes are therefore tested only via the API path (ADM_TWR_FSD_041). Re-scope when a future sprint adds unit-level toggles.
