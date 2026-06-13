# Coverage Matrix — Admin / Allocation

**Self-audit gate (tc-coverage-contract §4).** Rows = every feature/sub-feature found across
the dual sources. Columns = the 11 mandatory dimensions. Each cell = a generated `Testcase_ID`
or a justified `N/A`.

**Sources read:**
- Visual: `visual-memory/admin/allocation/INDEX.md` (FULL — captured 2026-06-01/02; Static-Active id 289, Physical id 288, Dynamic id 291, Upcoming "Test", validation + empty + Stop + Cancel + Notify + Rounds + Export screens)
- BRD: `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Allocation.md` §1–§10 (incl. backend gap reconciliation §10.1–§10.26)
- FRD: `ADMIN-FRD-Allocation.md` §1–§11
- FS: `ADMIN-FS-Allocation.md` Features 1–5 + Backend Gap Reconciliation
- Existing: TestCases-AdminPortal.xlsx → `Allocation` sheet (53 TCs preserved, IDs reused)
- Spec ref: `tests/e2e/admin/allocation.spec.js` (48 automated tests — sub-module grouping borrowed)

**ID scheme:** existing baseline `ADM_ALLOC_NNN` + `ADM_ALLOC_FSD_NNN` preserved/reused. New
gap TCs use the supplemental `TC_ALLOC_<TYPE>_NNN` series (FUNC/VAL/NEG/UI/API/SEC/INT/EDGE/DC),
each type starting at 001 (none existed for this module before this batch).

Legend: cell holds the **primary** TC for that feature×dimension; some dimensions share a TC.

| Feature / Sub-feature | 1 Pos | 2 Form | 3 Valid | 4 Race | 5 Neg | 6 Ctx | 7 Notif | 8 UIvBE | 9 Auth | 10 Integ | 11 Bound |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Page load / landing (`/admin/allocation`) | ADM_ALLOC_001 | N/A: landing has no form | N/A: read-only landing | N/A | TC_ALLOC_SEC_001 (no-session redirect) | N/A | N/A: silent page load | N/A | TC_ALLOC_SEC_001 | TC_ALLOC_INT_005 (sidebar links) | N/A |
| Page headings (Allocation + New Allocation Campaign) | TC_ALLOC_UI_001 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Campaign list table — columns/structure | ADM_ALLOC_002 | N/A: read | N/A | N/A | TC_ALLOC_NEG_001 (empty before project) | N/A | N/A | N/A | — | — | TC_ALLOC_UI_004 (6 headers) |
| Status column values (6 states) | ADM_ALLOC_003 | N/A | N/A | N/A | ADM_ALLOC_035 (Failed absent — see note 6) | TC_ALLOC_DC_001 (actions per status) | N/A | N/A | — | — | N/A |
| Type column values (Static/Dynamic/Physical) | ADM_ALLOC_004 | N/A | N/A | N/A | — | N/A | N/A | N/A | — | — | N/A |
| Cancelled rows display | ADM_ALLOC_023 | N/A | N/A | N/A | — | TC_ALLOC_DC_001 | N/A | N/A | — | — | N/A |
| Failed status display | ADM_ALLOC_035 | N/A | N/A | N/A | TC_ALLOC_NEG_007 (FAILED filter empty — §10) | N/A | N/A | N/A | — | — | N/A |
| Refresh button | ADM_ALLOC_034 | N/A | N/A | N/A | — | TC_ALLOC_UI_002 (disabled pre-project) | N/A | N/A | — | — | N/A |
| Project filter | TC_ALLOC_FUNC_001 | N/A | N/A | N/A | — | N/A | N/A | N/A | — | — | N/A |
| Status filter (enable + options) | TC_ALLOC_FUNC_002 | N/A | N/A | N/A | — | TC_ALLOC_UI_002 (disabled until project) | N/A | TC_ALLOC_API_006 ("Approved" not a status — note) | — | — | N/A |
| Type filter | TC_ALLOC_FUNC_003 | N/A | N/A | N/A | — | TC_ALLOC_UI_002 | N/A | N/A | — | — | N/A |
| Search by campaign name | TC_ALLOC_FUNC_004 | N/A | N/A | N/A | TC_ALLOC_FUNC_004 ("No campaigns found") | N/A | N/A | N/A | — | — | N/A |
| Search clear (× icon) | TC_ALLOC_FUNC_005 | N/A | N/A | N/A | — | N/A | N/A | N/A | — | — | N/A |
| Pagination footer | TC_ALLOC_UI_003 | N/A | N/A | N/A | — | N/A | N/A | N/A | — | — | TC_ALLOC_UI_003 (Total N / 10 per page) |
| Create form — required fields render | ADM_ALLOC_006 | ADM_ALLOC_006 | — | N/A | — | N/A | N/A | N/A | — | — | N/A |
| Create form — Allocation Type dropdown (3 options) | ADM_ALLOC_011 | ADM_ALLOC_011 | — | N/A | — | TC_ALLOC_DC_002 (type drives upload + buyer flow) | N/A | N/A | — | — | N/A |
| Create form — Project field | TC_ALLOC_FUNC_006 | TC_ALLOC_FUNC_006 | ADM_ALLOC_N_blank→TC_ALLOC_VAL_001 | N/A | TC_ALLOC_VAL_001 (required) | N/A | N/A | TC_ALLOC_API_001 (env-default projectId — §10.1) | — | — | N/A |
| Create form — Campaign Name | ADM_ALLOC_007 | TC_ALLOC_FUNC_007 | ADM_ALLOC_010 | TC_ALLOC_VAL_005 (dup name) | ADM_ALLOC_010 | N/A | N/A | N/A | — | — | ADM_ALLOC_033 (>100 chars) |
| Create form — Allocation Type select (Static) | ADM_ALLOC_C_001→TC_ALLOC_FUNC_008 | TC_ALLOC_FUNC_008 | — | N/A | — | N/A | N/A | N/A | — | — | N/A |
| Create form — Description textarea + char count | TC_ALLOC_FUNC_009 | TC_ALLOC_FUNC_009 | TC_ALLOC_VAL_006 (255 cap) | N/A | — | N/A | N/A | N/A | — | — | TC_ALLOC_VAL_006 (0/255 boundary) |
| Create form — Start Time picker (3-min lead) | ADM_ALLOC_007 | TC_ALLOC_FUNC_010 | ADM_ALLOC_008 | N/A | ADM_ALLOC_008 | N/A | N/A | N/A | — | — | TC_ALLOC_VAL_002 (exactly 3 min) |
| Create form — End Time picker (after start + disabled-until-start) | ADM_ALLOC_007 | TC_ALLOC_FUNC_011 | ADM_ALLOC_009 | N/A | ADM_ALLOC_009 | TC_ALLOC_FUNC_011 (disabled until start) | N/A | N/A | — | — | N/A |
| Create form — Reset button | ADM_ALLOC_C_003→TC_ALLOC_FUNC_012 | TC_ALLOC_FUNC_012 | — | N/A | — | N/A | N/A | N/A | — | — | N/A |
| Create form — Save Campaign (Static, valid) | ADM_ALLOC_007 | ADM_ALLOC_007 | — | TC_ALLOC_API_007 (stale-campaign auto-FAILED — §10.17) | — | N/A | TC_ALLOC_NEG_002 (silent — no notif on create) | N/A | — | — | N/A |
| Create — fully blank submit (4 errors) | — | — | TC_ALLOC_VAL_001 | N/A | TC_ALLOC_VAL_001 | N/A | N/A | N/A | — | — | N/A |
| Create — Dynamic campaign | ADM_ALLOC_012 | ADM_ALLOC_040 | ADM_ALLOC_039 | N/A | ADM_ALLOC_039 | TC_ALLOC_DC_002 | N/A | TC_ALLOC_API_002 (allotmentExcel; 20/unit cap §10.25) | — | — | N/A |
| Create — Dynamic allotmentExcel upload | ADM_ALLOC_040 | ADM_ALLOC_040 | TC_ALLOC_API_002 | N/A | TC_ALLOC_API_004 (Excel err → XLSX body §10.3) | N/A | N/A | TC_ALLOC_API_002 | — | — | TC_ALLOC_API_002 (file type/size [VERIFY WITH DEV]) |
| Create — Physical Event campaign | ADM_ALLOC_013 | ADM_ALLOC_041 | TC_ALLOC_API_003 (commonPoolExcel mandatory §10.2) | N/A | TC_ALLOC_API_003 | TC_ALLOC_DC_002 | N/A | TC_ALLOC_API_003 | — | — | N/A |
| Create — Physical commonPoolExcel upload | ADM_ALLOC_041 | ADM_ALLOC_041 | TC_ALLOC_API_003 | N/A | TC_ALLOC_API_004 | N/A | N/A | TC_ALLOC_API_003 | — | — | TC_ALLOC_API_003 |
| Campaign detail — Static (id 289) | TC_ALLOC_FUNC_013 | N/A: read | N/A | N/A | — | TC_ALLOC_DC_003 (3 KPI cards / no Notify/Rounds) | N/A | N/A | — | TC_ALLOC_INT_001 | N/A |
| Campaign detail — Physical Event (id 288) | TC_ALLOC_FUNC_014 | N/A: read | N/A | N/A | — | TC_ALLOC_DC_003 (6 KPI cards + Notify + Download Pending) | N/A | N/A | — | TC_ALLOC_INT_001 | N/A |
| Campaign detail — Dynamic Rounds UI (id 291) | ADM_ALLOC_D_006→TC_ALLOC_FUNC_015 | N/A: read | N/A | N/A | — | TC_ALLOC_DC_003 (Round-Wise Data only on Dynamic) | N/A | TC_ALLOC_API_005 (rounds endpoint §10.4) | — | — | TC_ALLOC_API_005 (page=1,limit=20) |
| Campaign detail — Back to Overview | TC_ALLOC_FUNC_016 | N/A | N/A | N/A | — | N/A | N/A | N/A | — | — | N/A |
| Campaign detail — View navigation (row → /campaigns/id) | TC_ALLOC_FUNC_017 | N/A | N/A | N/A | — | N/A | N/A | N/A | — | — | N/A |
| Stop Active campaign — modal + confirm | ADM_ALLOC_016 | ADM_ALLOC_016 (Close/Confirm btns) | N/A | TC_ALLOC_FUNC_019 (async flip §10.18 — poll not sync) | TC_ALLOC_NEG_003 (Close = no mutation) | TC_ALLOC_DC_001 (Stop on Active only) | TC_ALLOC_NEG_004 (silent — no buyer notif §FS-F3.8) | TC_ALLOC_API_008 (action field §10.7) | TC_ALLOC_SEC_002 | TC_ALLOC_INT_002 (post-Stop Waitlist) | N/A |
| Stop — confirmation required (Close dismisses) | ADM_ALLOC_020 | — | N/A | N/A | ADM_ALLOC_020 | — | — | — | — | — | N/A |
| Stop — button label "Close" not "Cancel" | TC_ALLOC_UI_005 | TC_ALLOC_UI_005 | N/A | N/A | — | — | N/A | N/A | — | — | N/A |
| Cancel Upcoming campaign — modal + confirm | ADM_ALLOC_017 | ADM_ALLOC_017 | N/A | N/A | TC_ALLOC_NEG_005 (Close = no mutation) | TC_ALLOC_DC_001 (Cancel on Upcoming only) | TC_ALLOC_NEG_006 (silent — never went live §FS-F4.8) | TC_ALLOC_API_008 | TC_ALLOC_SEC_002 | N/A | N/A |
| Stop vs Cancel routing (Active→Stop, Upcoming→Cancel) | ADM_ALLOC_018 / ADM_ALLOC_019 | — | N/A | N/A | — | TC_ALLOC_DC_001 (routing case) | N/A | N/A | — | — | N/A |
| Completed/Stopped/Cancelled rows — View only | ADM_ALLOC_024 | — | N/A | N/A | — | TC_ALLOC_DC_001 | N/A | N/A | — | — | N/A |
| Notify Registrants (Physical Event) — modal | TC_ALLOC_FUNC_018→ADM_ALLOC_S_001 | TC_ALLOC_FUNC_018 (Cancel/Yes,Notify All btns) | N/A | N/A | TC_ALLOC_NEG_008 (Cancel = no dispatch) | ADM_ALLOC_053 (Notify on Physical only) / ADM_ALLOC_D_005→TC_ALLOC_DC_004 (Static has none) | ADM_ALLOC_042 (QR + SMS/WhatsApp dispatch — Kaleyra) | TC_ALLOC_API_009 (notify endpoint §10.6) | TC_ALLOC_SEC_002 | ADM_ALLOC_FSD_037 (PHYSICAL_EVENT only) | N/A |
| Export — Download Bookings | TC_ALLOC_FUNC_020 | TC_ALLOC_FUNC_020 | N/A | N/A | — | TC_ALLOC_DC_005 (Static = Bookings only; Physical = both) | N/A | TC_ALLOC_API_010 (allotments export §10.5) | TC_ALLOC_SEC_002 | — | TC_ALLOC_API_010 (file = all allotments) |
| Export — Download Pending (Physical only) | TC_ALLOC_FUNC_021 | TC_ALLOC_FUNC_021 | N/A | N/A | — | TC_ALLOC_DC_005 | N/A | N/A | — | — | N/A |
| Lifecycle — Upcoming→Active auto | ADM_ALLOC_014 | N/A | N/A | TC_ALLOC_API_011 (cron timing) | — | N/A | TC_ALLOC_NEG_002 (no notif on activate §FS-F1.8) | N/A | — | ADM_ALLOC_027 (WebSocket) | N/A |
| Lifecycle — Active→Completed auto | ADM_ALLOC_015 | N/A | N/A | ADM_ALLOC_051 (cron endpoint) | TC_ALLOC_NEG_007 (FAILED never observable §10) | N/A | N/A | N/A | — | — | N/A |
| Lifecycle — single active campaign + 2-min blackout | ADM_ALLOC_026 | N/A | N/A | TC_ALLOC_API_012 (2-min pre-start blackout §10.16) | — | N/A | N/A | TC_ALLOC_API_012 | — | ADM_ALLOC_044/045/046/047/048 (blocks Customers ops) | N/A |
| Lifecycle — type immutable post-create | ADM_ALLOC_043 | N/A | N/A | N/A | — | N/A | N/A | N/A | — | — | N/A |
| Notifications — silent on create/activate/stop/cancel | — | — | N/A | N/A | — | N/A | TC_ALLOC_NEG_002 / TC_ALLOC_NEG_004 / TC_ALLOC_NEG_006 | N/A | — | — | N/A |
| Notifications — booking dispatches WhatsApp+SMS (no email) | ADM_ALLOC_052 | N/A | N/A | N/A | — | N/A | ADM_ALLOC_052 (Epinet SMS / Kaleyra WA; +91 only) | N/A | — | ADM_ALLOC_052 | N/A |
| Integration — booking lands in Customers | ADM_ALLOC_030 | N/A | N/A | N/A | — | N/A | N/A | N/A | — | ADM_ALLOC_030 | N/A |
| Integration — Easebuzz payment → Transactions | ADM_ALLOC_029 | N/A | N/A | N/A | — | N/A | N/A | N/A | — | ADM_ALLOC_029 | N/A |
| Integration — WebSocket on Active | ADM_ALLOC_027 | N/A | N/A | N/A | — | N/A | N/A | N/A | — | ADM_ALLOC_027 | N/A |
| Integration — Active blocks Customers cancel/swap/parking/refund/bulk | ADM_ALLOC_FSD_036 | N/A | N/A | TC_ALLOC_API_012 | ADM_ALLOC_044/045/046/047/048 | N/A | N/A | TC_ALLOC_API_013 (cancel ownership broken §10 — do NOT 403-test) | — | ADM_ALLOC_FSD_036 | N/A |
| Integration — Config tower prerequisite | ADM_ALLOC_025 | N/A | N/A | N/A | ADM_ALLOC_025 (zero active towers) | N/A | N/A | N/A | — | ADM_ALLOC_049 (tower toggle during active) | N/A |
| Buyer-side unit grid (downstream) | ADM_ALLOC_028 | N/A | N/A | N/A | — | N/A | N/A | N/A | — | ADM_ALLOC_028 | N/A |
| Post-campaign — Waitlist / Confirmed states | ADM_ALLOC_021 / ADM_ALLOC_022 | N/A | N/A | N/A | — | N/A | N/A | N/A | — | TC_ALLOC_INT_002 | N/A |
| API — manual reconcile / cron ops endpoints | ADM_ALLOC_050 / ADM_ALLOC_051 | N/A | N/A | N/A | — | N/A | N/A | N/A | — | — | N/A |
| Role / Auth — no session redirect | — | N/A | N/A | N/A | TC_ALLOC_SEC_001 | N/A | N/A | N/A | TC_ALLOC_SEC_001 | — | N/A |
| Role / Auth — SM Admin cannot hit admin endpoints | — | N/A | N/A | N/A | ADM_ALLOC_FSD_038 | N/A | N/A | N/A | ADM_ALLOC_FSD_038 | — | N/A |
| Role / Auth — expired/invalid token (401/403) | — | N/A | N/A | N/A | TC_ALLOC_SEC_002 | N/A | N/A | N/A | TC_ALLOC_SEC_002 | — | N/A |
| Error handling — empty / no-data states | TC_ALLOC_NEG_001 | N/A | N/A | N/A | TC_ALLOC_NEG_001 ("Please select a project") / TC_ALLOC_FUNC_004 ("No campaigns found") | N/A | N/A | N/A | — | — | N/A |
| Error handling — server 500 / network | — | N/A | N/A | N/A | TC_ALLOC_NEG_009 ([VERIFY WITH DEV] — no documented 500 copy) | N/A | N/A | N/A | — | — | N/A |

## Justified N/A summary
- **Form (dim 2)** is N/A for all read-only surfaces (landing, list, detail pages, filters) — they contain no editable form.
- **Race (dim 4)** is N/A everywhere except Stop (async status flip §10.18) and lifecycle/blackout cron timing — the create form has no submit-time server re-validation against shared state beyond duplicate-name (covered) and stale-campaign cleanup (covered).
- **Notif (dim 7)** silence-by-design is an explicit REQUIRED assertion for create/activate/stop/cancel (TC_ALLOC_NEG_002/004/006) per FS Feature 1/3/4 §8; page-load and read actions are genuinely N/A.
- **UIvBE (dim 8)** applies where backend is more permissive than UI (env-default projectId §10.1, Excel-required asymmetry §10.2, action-field routing §10.7, 2-min blackout §10.16) — all covered.

## Known-issue exclusions (do NOT write pass/fail expectations)
- §10 GAP-TL-008: `cancelUserAllocation` ownership check broken → TC_ALLOC_API_013 documents it as `[VERIFY WITH DEV]`; do NOT assert a 403 on cross-user cancel.
- §10 GAP-DEV-011: `markAllocationCampaignFailed` destroys the row → FAILED status is not observable; TC_ALLOC_NEG_007 asserts the FAILED filter returns empty (documented behaviour), NOT a visible Failed row.
- §10 GAP-DEV-034: double-booking race → out of scope for functional regression (stress test only, noted).
- §10.15 `createPaymentIntent` → no functional test (candidate for removal).

## Result
All 11 dimensions covered for every feature row, or a specific justified `N/A`. No
unjustified-empty cell. **Module: DONE per coverage contract §4.**
