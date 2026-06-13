# Coverage Matrix — Admin / JBP Management

**Module:** Admin Portal / JBP Management
**Generated:** 2026-06-13 (BA Agent — manual-tester + tc-coverage-contract)
**Sources read:**
- `visual-memory/admin/jbp/INDEX.md` (CAPTURE_STATUS: FULL — 6 screens incl. create-cycle modal, all 3 tabs)
- BRD `ADMIN-BRD-JBP-Management.md` §1–9
- FRD `ADMIN-FRD-JBP-Management.md` §1–11
- FS  `ADMIN-FS-JBP-Management.md` Features 1–7 (+ FSD-CORRECTION notes dated 2026-05-25)
- Existing workbook sheet `JBP` (54 TCs preserved; IDs reused, numbering continued)

**Dual-source confirmation:** YES (visual-memory FULL + BRD/FRD/FS all present).

---

## DOC_DRIFT register (use OBSERVED / FSD-corrected values)

| ID | Source contradiction | Resolution (observed wins) | TCs affected |
|----|----------------------|----------------------------|--------------|
| DOC_DRIFT-JBP-001 | BRD §7.4 + FRD §"Handling CP Edit Requests" say "Approve requires a reason". FSD-CORRECTION (workbook ADM_JBP_032/033) says **Approve requires `editWindow` (hours, integer ≥1); `adminComment` is OPTIONAL on approve**. | Use FSD: approve → `editWindow` mandatory, `adminComment` optional. BRD/FRD "reason on approve" is STALE. | ADM_JBP_032, ADM_JBP_033 |
| DOC_DRIFT-JBP-002 | BRD §7.4 / FRD §"Handling…" / FS Feature 6.5 say edit-request statuses are Pending / Approved / Rejected. FSD adds **EXPIRED, CONSUMED** and ACTIVE/EXPIRED on submissions; statuses auto-sweep on GET. | Use FSD enum: Pending→APPROVED/REJECTED→(EXPIRED on timeout / CONSUMED on CP resubmit). | ADM_JBP_054, ADM_JBP_FSD_045/046/049 |
| DOC_DRIFT-JBP-003 | BRD §6.4 "CP receives notification of the decision"; FRD §"Handling…" implies notification. FS Feature 6 §8 (FSD-CORRECTION) + ADM_JBP_033/035 say **NO notification on admin approve/reject** (CP must poll). | Use FSD: silence-by-design on approve/reject. BRD §6.4 "CP receives notification" is STALE. | ADM_JBP_033, ADM_JBP_035, TC_JBP_NEG_004 |
| DOC_DRIFT-JBP-004 | FRD §2/§3 give CP Portal URL as `https://uat-web.xrportal.in/jbp`; BRD §top + FS give `https://uat.xrportal.in/jbp`. CLAUDE.md lists CP portal at `uat-web.xrportal.in/`. | CP-side is largely out of Admin module scope; where a CP step is needed use CLAUDE.md value `https://uat-web.xrportal.in/` (login) → `/jbp`. Flag URL as `[VERIFY WITH DEV]` on CP-touching TCs. | ADM_JBP_039, ADM_JBP_044-equivalent |
| DOC_DRIFT-JBP-005 | INDEX.md create-cycle modal submit button label = **"Create Cycle"** (`.ant-modal-content button:has-text("Create Cycle")`). FRD/FS call the submit button **"Submit"**. | Use OBSERVED label "Create Cycle" (modal submit); note legacy "Submit" wording. | ADM_JBP_010, ADM_JBP_012, ADM_JBP_013 |
| DOC_DRIFT-JBP-006 | FRD §"Known test cycle" + create example uses an editable/PUT mental model; FSD ADM_JBP_FSD_048 says **no PUT/DELETE route on cycles** (404). | Use FSD: cycles are Create-or-Close only; PUT/DELETE return 404. | ADM_JBP_FSD_048 |

---

## 11-Dimension Coverage Matrix

Cell = generated Testcase_ID(s) **or** justified `N/A`.

| Feature / Sub-feature | 1 Pos | 2 Form | 3 Valid | 4 Race | 5 Neg | 6 Ctx | 7 Notif | 8 UIvBE | 9 Auth | 10 Integ | 11 Bound |
|-----------------------|-------|--------|---------|--------|-------|-------|---------|---------|--------|----------|----------|
| Page load / nav (`/admin/jbp-management`) | ADM_JBP_001 | N/A: no form on landing | N/A: no input | N/A | TC_JBP_NEG_001 (no-session redirect) | N/A | N/A: read-only landing | N/A | TC_JBP_NEG_001 | N/A | N/A |
| 3 Tabs (Cycle Mgmt / Submissions / Edit Requests) | ADM_JBP_002, ADM_JBP_003, ADM_JBP_004, ADM_JBP_005 | N/A: tabs not a form | N/A | N/A | TC_JBP_NEG_002 (deep-link to tab with no data) | TC_JBP_FUNC_001 (default-active routing) | N/A | N/A | — | N/A | N/A |
| Cycle table — structure & content | ADM_JBP_006, ADM_JBP_007 | N/A: read-only table | N/A | N/A | TC_JBP_NEG_003 (empty cycle list) | ADM_JBP_007 (OPEN vs CLOSED status render) | N/A: read view | N/A | — | TC_JBP_INT_001 (Active-cycle vs CP banner) | TC_JBP_BND_001 (cycle-list pagination / reverse-chron order) |
| Date range filter | ADM_JBP_002b→TC_JBP_FUNC_002 | TC_JBP_FUNC_002 (both pickers) | TC_JBP_VAL_001 (only one date set) | N/A | TC_JBP_NEG_004b→TC_JBP_NEG_005 (range with 0 results) | N/A | N/A | TC_JBP_API_001 (GET with date params) | — | N/A | TC_JBP_BND_002 (clear filter restores all) |
| Create Cycle (modal) | ADM_JBP_009, ADM_JBP_010 | TC_JBP_FORM_001 (every modal field+buttons), ADM_JBP_009 | ADM_JBP_012 (empty name), ADM_JBP_013 (end<start), TC_JBP_VAL_002 (Cancel discards) | ADM_JBP_011 (2nd OPEN at submit → Active Cycle Detected) | ADM_JBP_011, ADM_JBP_052 (backdated) | N/A | ADM_JBP_NOTIF_001 (silent — no notif on create, FS Feat3 §8) | TC_JBP_API_002 (POST bypass of UI date rule) | — | TC_JBP_INT_002 (new cycle visible to CP banner) | ADM_JBP_052 (date boundary) |
| Close Cycle | ADM_JBP_014, ADM_JBP_015, ADM_JBP_016 | TC_JBP_FORM_002 (confirm dialog buttons "Yes, Close"/"Cancel") | N/A | ADM_JBP_016b→TC_JBP_RACE_001 (close already-closed) | ADM_JBP_017 (cancel keeps OPEN) | ADM_JBP_018 (CLOSED row → no button) | ADM_JBP_NOTIF_002 (silent — no CP notif on close, FS Feat4 §8) | TC_JBP_API_003 (PUT /close direct) | — | ADM_JBP_038 (no financial impact — Payments) | N/A |
| Closed-cycle irreversibility | ADM_JBP_037 | N/A | N/A | N/A | TC_JBP_NEG_006 (attempt reopen) | ADM_JBP_018 | N/A | ADM_JBP_FSD_048 (no PUT/DELETE 404) | — | N/A | N/A |
| Submissions tab — list | ADM_JBP_019, ADM_JBP_024(switch) | N/A: read-only list | N/A | N/A | ADM_JBP_053 (empty submissions state) | N/A | N/A: read view | TC_JBP_API_004 (GET submissions) | — | ADM_JBP_039 (one-per-CP-per-cycle) | ADM_JBP_040 (pagination) |
| Submission detail — 14 fields | ADM_JBP_020 | ADM_JBP_021,022,023,024,025,026,027,028 (each field group) | N/A: read-only detail | N/A | TC_JBP_NEG_007 (open detail with partial/empty optional fields) | ADM_JBP_025 (Google → budget shown) | N/A | ADM_JBP_FSD_051 (updatedAt undefined) | — | N/A | N/A |
| Edit Requests tab — list | ADM_JBP_021ER→ADM_JBP_030, ADM_JBP_005(switch) | N/A: read-only list | N/A | N/A | TC_JBP_NEG_008 (empty edit-requests state) | ADM_JBP_054 (EXPIRED filter), ADM_JBP_036 (status filter) | N/A | TC_JBP_API_005 (GET edit-requests) | — | N/A | ADM_JBP_055 (pagination) |
| Edit Request review (original vs revised) | ADM_JBP_031 | N/A: read view | N/A | N/A | TC_JBP_NEG_009 (open EXPIRED/CONSUMED request) | ADM_JBP_054 (EXPIRED not actionable) | N/A | — | — | N/A | N/A |
| Approve edit request | ADM_JBP_033 | TC_JBP_FORM_003 (editWindow + optional adminComment fields) | ADM_JBP_032 (missing editWindow), TC_JBP_VAL_003 (editWindow=0/neg/decimal) | TC_JBP_RACE_002 (approve already-EXPIRED) | TC_JBP_NEG_010 (approve consumed/rejected) | ADM_JBP_FSD_047 (editableUntil clamp to endDate) | ADM_JBP_033 (NO CP notif on approve) | TC_JBP_API_006 (PUT /approve body) | — | ADM_JBP_FSD_046 (CP resubmit consumes APPROVED) | N/A |
| Reject edit request | ADM_JBP_035 | TC_JBP_FORM_004 (adminComment field) | ADM_JBP_034 (missing adminComment), TC_JBP_VAL_004 (>550 chars) | N/A | TC_JBP_NEG_011 (reject already-decided) | N/A | ADM_JBP_035 (NO CP notif on reject) | TC_JBP_API_007 (PUT /reject body) | — | N/A | TC_JBP_VAL_004 (550-char boundary) |
| Lifecycle / business rules | ADM_JBP_039, ADM_JBP_037, ADM_JBP_038 | N/A | N/A | ADM_JBP_011 | ADM_JBP_052 | N/A | ADM_JBP_NOTIF_003 (CP submit DOES fire WhatsApp `jbplaunchtwo_new`) | — | — | ADM_JBP_FSD_049 (new cycle expires PENDING/APPROVED) | N/A |
| Auto-sweep (close / expire) | ADM_JBP_FSD_044 (cycle auto-CLOSE on GET), ADM_JBP_FSD_045 (req auto-EXPIRE on GET) | N/A | N/A | TC_JBP_RACE_003 (concurrent GET sweep) | N/A | ADM_JBP_054 (EXPIRED surfaced) | N/A | ADM_JBP_FSD_044/045 (API layer) | — | N/A | N/A |
| Notifications (CP submit) | ADM_JBP_FSD_041 (WhatsApp `${+91}` bug), ADM_JBP_FSD_042 (fire-and-forget) | N/A | N/A | N/A | ADM_JBP_FSD_042 (dispatch fails → submit ok) | N/A | ADM_JBP_NOTIF_003 (channel + template) | ADM_JBP_FSD_041/042 | — | ADM_JBP_FSD_043 (LSQ outage blocks submit) | N/A |
| Role / Auth / Security | N/A | N/A | N/A | N/A | TC_JBP_NEG_001 (no session), TC_JBP_NEG_012 (expired/invalid token 401/403) | N/A | N/A | TC_JBP_API_008 (approve without admin token) | TC_JBP_NEG_001, TC_JBP_NEG_012, TC_JBP_NEG_013 (project data isolation) | N/A | N/A |
| Error handling / edge | ADM_JBP_FSD_050 (NPE on null cycle) | N/A | N/A | N/A | TC_JBP_NEG_014 (server 500 on list), TC_JBP_NEG_015 (network drop mid-create), ADM_JBP_FSD_050 | N/A | N/A | ADM_JBP_FSD_048 (404 on PUT/DELETE) | — | ADM_JBP_FSD_043 | TC_JBP_NEG_016 (very long cycle name) |

### Justified N/A summary
- "no form" / "read-only list/detail" cells: those features render data only; no input → no form/validation/notification case. Marked per-cell.
- Cross-module Integration limited to: CP-portal banner reflection, Payments (no financial impact), LSQ (event 270 + CustomObject 14-28), WhatsApp (botspice template). LSQ is excluded from credentials/automation per CLAUDE.md but its *effect on JBP submit availability* is in scope (documented, `[VERIFY WITH DEV]`).

**Self-audit gate: PASS** — no unjustified-empty cells.

---

## TC inventory

- **Preserved (reused IDs, format-converted):** 54 — ADM_JBP_001–055 (non-contiguous) + ADM_JBP_FSD_041–051.
- **New gap-TCs added this run:** 43 — see `_new-tcs-since-last-review.txt`.
- **Total in `JBP - Master`:** 97.
