# Coverage Matrix — CP Portal / JBP Submission

**Module:** Channel Partner → JBP Submission
**Master JSON:** `manual-qa-repository/07-execution/_master-json/CP-JBPSubmission.json`
**Sheet (on build):** `JBP Submission - Master` (replaces `JBP Submission` + `JBP Submission (Exec)`)
**Generated:** 2026-06-14 (BA Agent, unattended)
**Sources (dual-source gate — both present):**
- Visual: `visual-memory/cp/jbp-submission/INDEX.md` (FULL) + `_jbp-form-inspect.json` + `_jbp-dom-inspect.json` + 8 screenshots
- Docs: `CP-FS-JBP-Submission.md`, `CP-BRD-CP-Portal.md`, `CP-FRD-CP-Portal.md`

**Totals:** 93 TCs · 11 sub-modules · 11 NEW (continuing series) · 0 dropped · 0 duplicate IDs · 50 `[TEST_DATA_REQUIRED]`

---

## Feature × Dimension matrix

Cells list representative TC_IDs. `—` = not applicable to that feature. `[V]` = covered but flagged `[VERIFY WITH DEV]`.

| Feature \ Dimension | 1 Positive | 2 Full-form | 3 Mandatory/Validation | 4 Submit re-check/race | 5 Negative/error | 6 Context-sensitive | 7 Notifications | 8 UI-vs-backend | 9 Role/auth/security | 10 Integration/x-module | 11 Boundary |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Navigation & access | CP_JBP_001, TC_JBP_FUNC_038 | — | — | — | CP_JBP_002, CP_JBP_003 | TC_JBP_UI_002 (active item) | — | — | CP_JBP_003 | — | — |
| Dashboard / cycle card / tabs | TC_JBP_UI_003, UI_004, FUNC_005, FUNC_006, FUNC_022, FUNC_024 | — | — | — | TC_JBP_UI_039 [V] (empty history) | TC_JBP_UI_032 (status pill per state), TC_JBP_REG_033 | — | — | — | — | — |
| Open form — fields | TC_JBP_FUNC_007, UI_040, UI_008, UI_009, UI_010, UI_011, UI_012, UI_013, CP_JBP_005/006/007/009/010/011/012/013/014 | TC_JBP_UI_008/009/010/011/012/013 + CP_JBP_005-014 (every control) | — | — | — | CP_JBP_007 (slider↔number sync) | — | — | — | — | TC_JBP_UI_011 (20 cb), CP_JBP_012 (5 ranges) |
| Field validation & boundary | TC_JBP_VAL_036 | — | TC_JBP_VAL_014/015/016, CP_JBP_015/016/017 | — | CP_JBP_008 (neg), TC_JBP_VAL_042 | — | — | — | — | — | CP_JBP_008, TC_JBP_VAL_041 [V] (0), TC_JBP_VAL_042 [V] (dec/neg), TC_JBP_EDGE_035 [V] (0 cb) |
| Submission (live write) | CP_JBP_018, CP_JBP_019, TC_JBP_E2E_018, TC_JBP_FUNC_017, TC_JBP_EDGE_034 | TC_JBP_FUNC_017 | — | CP_JBP_020 (dup at submit) | — | — | CP_JBP_035, TC_JBP_INT_048 | — | — | TC_JBP_XMOD_037 | TC_JBP_EDGE_034 (all cb) |
| Read-only existing submission | CP_JBP_021/022/041/042/043, TC_JBP_BIZ_020 | CP_JBP_041/042/043 | — | — | — | TC_JBP_UI_032 | — | — | — | — | — |
| One-per-cycle / duplicate | CP_JBP_004, TC_JBP_BIZ_019 | — | — | CP_JBP_020 | TC_JBP_NEG_021, CP_JBP_032, CP_JBP_036 [V/BUG] | TC_JBP_BIZ_019 (CTA hides) | — | CP_JBP_020 (API) | CP_JBP_036 (ownership BUG) | — | — |
| Closed-cycle rejection | — | — | — | TC_JBP_NEG_030, CP_JBP_030 | TC_JBP_BIZ_029, CP_JBP_026, CP_JBP_039 | TC_JBP_BIZ_029 (state-routed UI) | — | CP_JBP_030 (API 400) | — | — | — |
| Edit request flow | TC_JBP_BIZ_025, CP_JBP_024/025, TC_JBP_E2E_026, TC_JBP_BIZ_027/028, CP_JBP_023/044 | CP_JBP_025 (reason+values) | — | CP_JBP_037/038 (409 conflicts) | CP_JBP_026/039 (closed), CP_JBP_027 (reject) | TC_JBP_BIZ_025 (avail only post-submit) | CP_JBP_027 (silent reject) | CP_JBP_037/038 (API) | CP_JBP_031 (403 expired window) | TC_JBP_BIZ_027/028, CP_JBP_023 (admin x-portal) | — |
| API & backend contract | CP_JBP_045 | — | CP_JBP_028 (400 no prospectId) | CP_JBP_020 | CP_JBP_029 [BUG NPE], CP_JBP_033/034 (LSQ) | — | — | TC_JBP_API_044 [V] (injection) | TC_JBP_API_043 [V] (auth) | CP_JBP_033/034 (LSQ), CP_JBP_045 | — |
| Security & auth | — | — | — | — | CP_JBP_040 [BUG] | — | — | TC_JBP_API_044 [V] | CP_JBP_031, TC_JBP_NEG_045 [V], TC_JBP_NEG_046 [V], TC_JBP_VAL_047 | CP_JBP_040 (login flag) | — |
| Integration & notifications | TC_JBP_XMOD_037 | — | — | — | — | — | CP_JBP_035, CP_JBP_027, TC_JBP_INT_048 | — | — | TC_JBP_XMOD_037 (Admin JBP Mgmt), CP_JBP_033/034 (LSQ) | — |

---

## 11-dimension self-check (module level)

- [x] **1 Positive happy path** — CP_JBP_018 / TC_JBP_E2E_018 (submit→Thank You→status).
- [x] **2 Full-form coverage** — every observed control: Brokerage select, 20-checkbox grid, Total Investment (5 radios), 7 Yes/No groups, Manpower, Net Booking, Enter Count (TC_JBP_UI_008-013, CP_JBP_005-015).
- [x] **3 Mandatory/validation** — empty form + per-field required (TC_JBP_VAL_014/015/016, CP_JBP_016/017).
- [x] **4 Submit re-check / race** — duplicate at submit (CP_JBP_020), closed-at-submit (CP_JBP_030), 409 edit conflicts (CP_JBP_037/038).
- [x] **5 Negative / error** — closed cycle, missing prospectId 400, NPE bug, LSQ failures, duplicate block.
- [x] **6 Context-sensitive controls** — CTA visible vs hidden by submission state (CP_JBP_004 / TC_JBP_BIZ_019), status pill per state (TC_JBP_UI_032), open vs closed cycle UI (TC_JBP_BIZ_029).
- [x] **7 Notifications** — Botspice WhatsApp on submit (CP_JBP_035), silent reject (CP_JBP_027), no-notification-on-blocked-submit (TC_JBP_INT_048).
- [x] **8 UI-vs-backend split** — numeric-field UI block vs API injection (TC_JBP_API_044 [V]); auth-at-API (TC_JBP_API_043 [V]).
- [x] **9 Role / auth / security** — logged-out redirect (CP_JBP_003), non-CP role (TC_JBP_NEG_045 [V]), CP-to-CP isolation (TC_JBP_NEG_046 [V]), HTTPS/no-data-in-URL (TC_JBP_VAL_047), expired edit window 403 (CP_JBP_031), known login-flag bug (CP_JBP_040).
- [x] **10 Integration / cross-module** — Admin JBP Management visibility (TC_JBP_XMOD_037), version/EXPIRED via admin approval (TC_JBP_BIZ_027, CP_JBP_023), LSQ createActivity/captureLead (CP_JBP_033/034).
- [x] **11 Boundary** — Manpower negative (CP_JBP_008), Enter Count 0/decimal/negative (TC_JBP_VAL_041/042 [V]), all/zero checkboxes (TC_JBP_EDGE_034/035), 20-checkbox & 5-range counts.

No unjustified gaps. Open items are flagged `[VERIFY WITH DEV]` (live-behaviour unconfirmed) rather than dropped.

---

## NEW TCs this pass (11) — continue series, gray-fill on build

| TC_ID | Sub-module | Why added (dimension gap closed) |
|---|---|---|
| TC_JBP_FUNC_038 | Navigation & Access | Deep-link to /jbp with valid session (auth-positive routing). |
| TC_JBP_UI_039 | Dashboard / tabs | JBP History zero-row empty state — not in visual-memory ([VERIFY WITH DEV]). |
| TC_JBP_UI_040 | Open form | Form heading 'JBP Form - <cycleName>' assertion. |
| TC_JBP_VAL_041 | Validation & boundary | Enter Count lower boundary 0 ([VERIFY WITH DEV]). |
| TC_JBP_VAL_042 | Validation & boundary | Enter Count rejects decimal/negative ([VERIFY WITH DEV]). |
| TC_JBP_API_043 | API & backend | Whether /jbp submit requires auth (CP-BRD §9 flags /cp/registration unauth — JBP unstated). |
| TC_JBP_API_044 | API & backend | API-layer injection handling (UI-vs-backend split). |
| TC_JBP_NEG_045 | Security & auth | Non-CP role cannot access /jbp ([VERIFY WITH DEV]). |
| TC_JBP_NEG_046 | Security & auth | CP-to-CP JBP data isolation ([VERIFY WITH DEV]). |
| TC_JBP_VAL_047 | Security & auth | HTTPS-only, no sensitive data in URL. |
| TC_JBP_INT_048 | Integration & notifications | No notification fires on a blocked/validation-failed submit (silent-by-design). |

---

## Flags

- **DOC_DRIFT-001 (URL):** Docs say `uat.xrportal.in/jbp`; live = `uat-web.xrportal.in/jbp`. Live wins. BRD/FRD/FS URL needs correction.
- **DOC_DRIFT-002 (form layout):** FS 14 friendly fields vs DOM 44 inputs; INDEX.md '9 radio-groups × 2 = 18' is itself inaccurate vs its own sidecar (`:rt:` = 5 radios = Total Investment; seven 2-option groups = the 7 Yes/No fields; 8 groups / 19 radios). On-screen per-field label strings are `[VERIFY WITH DEV]`.
- **DOC_DRIFT-003 (activity count):** FS 14 activities vs live 15 (CP_JBP_009). Treat 15 as observed.
- **Known BUGs carried (documented, not dropped):** CP_JBP_036 (project ownership not enforced), CP_JBP_029 (non-existent jbpCycleId → NPE), CP_JBP_040 (isJbpSubmitted counts EXPIRED rows).
- **Mutation safety:** 50 TCs marked `[TEST_DATA_REQUIRED]`; all submit/edit-create TCs additionally carry a "requires user authorisation" note (no live writes without OK).
- **Scope exclusions honoured:** LSQ tested only as downstream effect (CP_JBP_033/034) — no LSQ creds/calls; Strapi out of scope; Admin-side approval verified end-to-end via XMOD/E2E only.
- **No blockers.** Dual-source gate satisfied (visual FULL + BRD/FRD/FS present). Module ready for `test-case-reviewer`.
