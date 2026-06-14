# Coverage Matrix — Sales Manager / Callback Requests

**Module:** Callback Requests (`/sales-manager/callback-requests`)
**Master JSON:** `manual-qa-repository/07-execution/_master-json/SM-CallbackRequests.json`
**Sources:** visual-memory `sm/callback-requests/INDEX.md` (FULL, 2026-06-05) + SM-FS-Callback-Requests / SM-WF-Callback-Requests / SM-BRD-SM-Portal / SM-FRD-SM-Portal
**Generated:** 2026-06-13 (unattended)
**Sheet target:** `Callback Requests - Master` (replaces `Callback Requests` + `Callback Requests (Exec)`)

Cells = TC_IDs covering that feature × dimension. `—` = N/A (justified). `[VWD]` = covered but flagged [VERIFY WITH DEV].

## 11-Dimension legend
D1 Positive/Happy · D2 Full-form coverage · D3 Mandatory/Validation · D4 Submit re-check/race · D5 Negative/error · D6 Context-sensitive controls · D7 Notifications · D8 UI-vs-backend split · D9 Role/Auth/Security · D10 Integration/cross-module · D11 Boundary

| Feature | D1 Positive | D2 Full-form | D3 Validation | D4 Re-check | D5 Negative/Error | D6 Context ctrl | D7 Notification | D8 UI/BE split | D9 Role/Auth | D10 Integration | D11 Boundary |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Login & Landing | TC_CBR_UI_001, _003, _004 | TC_CBR_UI_001 | — | — | TC_CBR_FUNC_069 | — | — | — | TC_CBR_FUNC_069 | — | SM_CB_019 |
| KPI / Summary cards | SM_CB_009, TC_CBR_UI_001b, _002 | SM_CB_010-016 | — | — | SM_CB_017 | SM_CB_020 [VWD] | — | — | SM_CB_131, _132 | SM_CB_011-015 | SM_CB_018 [VWD] |
| Table structure & content | TC_CBR_UI_005, _006, _007 | TC_CBR_UI_005, FUNC_056-058 | — | — | — | TC_CBR_UI_006 | — | — | — | TC_CBR_FUNC_056 [VWD] | — |
| Sorting & column filters | TC_CBR_FUNC_009, _010, _059, _060 | TC_CBR_FUNC_009, _011 | — | — | TC_CBR_EDGE_051 | TC_CBR_FUNC_010 | — | — | — | — | TC_CBR_FUNC_059, _060 |
| Search | TC_CBR_FUNC_013 | TC_CBR_FUNC_013 | — | — | TC_CBR_FUNC_014, EDGE_053 [VWD] | — | — | — | — | — | — |
| Filters (date / SM dropdown) | TC_CBR_FUNC_012, _008 | TC_CBR_FUNC_012, _008 | TC_CBR_EDGE_052 [VWD] | — | TC_CBR_EDGE_052 | TC_CBR_FUNC_008 | — | — | SM_CB_128 | — | TC_CBR_EDGE_052 |
| Pagination | TC_CBR_FUNC_015 | TC_CBR_FUNC_015 | — | — | — | — | — | — | — | — | TC_CBR_EDGE_061, _062 [VWD] |
| Toolbar (Refresh/Export/Bulk Assign) | TC_CBR_FUNC_016, _017, _018, BIZ_064 | TC_CBR_FUNC_018 | — | TC_CBR_BIZ_064 [VWD] | TC_CBR_EDGE_063 [VWD] | TC_CBR_FUNC_018 | — | — | SM_CB_127, BIZ_064 | TC_CBR_EDGE_063 | — |
| Details drawer (3 tabs, read-only) | TC_CBR_FUNC_019-024 | TC_CBR_FUNC_022 | — | — | TC_CBR_NEG_049 | TC_CBR_FUNC_020, _021 | — | — | — | TC_CBR_FUNC_023 | — |
| More menu — Capture VC Outcome (open/display) | TC_CBR_FUNC_025-029 | TC_CBR_FUNC_029 | — | — | — | TC_CBR_FUNC_025, _026, _027, _028, EDGE_050 | — | — | — | — | TC_CBR_FUNC_029 |
| Capture VC Outcome — validation & submit | TC_CBR_FUNC_031, SM_CB_129 | TC_CBR_FUNC_031 | TC_CBR_VAL_030 | TC_CBR_NEG_047 [VWD] | TC_CBR_NEG_047, FUNC_036, TC_CBR_NEG_072 [VWD] | TC_CBR_BIZ_032, _033, _034 | SM_CB_109, _109b | SM_CB_109b [VWD] | SM_CB_129 | TC_CBR_BIZ_032, _033, _034, BIZ_055 | TC_CBR_BIZ_035, SM_CB_FSD_136 |
| Schedule/Confirm (doc-drift) | TC_CBR_FUNC_065, _066 [VWD] | — | — | — | TC_CBR_FUNC_065, _066 | — | — | — | — | SM_CB_028 [VWD] | — |
| Create Callback Request drawer | TC_CBR_FUNC_037, _038, _039, _042, BIZ_043 | TC_CBR_FUNC_039, _041, _067, VAL_030b [VWD] | TC_CBR_VAL_040, VAL_030b [VWD] | TC_CBR_NEG_048 | TC_CBR_NEG_048, FUNC_068 [VWD], FUNC_045 | TC_CBR_FUNC_067, _039 | — | — | — | TC_CBR_BIZ_043, _044 | TC_CBR_FUNC_038 |
| Empty state | TC_CBR_FUNC_046 | — | — | — | TC_CBR_FUNC_046, SM_CB_017 | — | — | — | — | — | — |
| Role / Auth / Scoping | SM_CB_125, _126, _130, TC_CBR_BIZ_054 | — | — | — | SM_CB_FSD_138, _133, TC_CBR_NEG_070 | SM_CB_127, _128 | — | SM_CB_133 [VWD] | SM_CB_125-133, _138, TC_CBR_FUNC_069, NEG_070 | — | — |
| Integration / cross-module | TC_CBR_BIZ_055 | — | — | — | SM_CB_FSD_137 | — | SM_CB_109, _FSD_139 | — | SM_CB_FSD_139 | TC_CBR_BIZ_055, SM_CB_FSD_140, _137, _139 | — |
| API & Backend | SM_CB_FSD_135, _028b | — | SM_CB_109b | — | SM_CB_109b [VWD] | — | — | SM_CB_109b | SM_CB_028b, _FSD_135, _072, _134 | SM_CB_FSD_135 | — |
| Error handling | — | — | — | TC_CBR_NEG_072 [VWD] | TC_CBR_NEG_071 [VWD], NEG_072 [VWD] | — | — | — | — | — | — |

## Counts

- **Total TCs:** 107
- **Baseline preserved (unchanged IDs):** 86 (31 `SM_CB*` + 55 `TC_CBR_*`)
- **New TCs (this pass):** 21
- **Sub-modules (banners):** 18
- **Dimensions covered:** all 11 (no dimension fully empty across the module)

### Dimension fill summary
- D1 Positive — covered every feature.
- D2 Full-form — all visible form/modal/drawer fields enumerated (Capture VC Outcome: Reg No, Customer Name, Select Outcome, Cancel, Submit; Create drawer: search, Buyer Email, SM Email, CC, Date & Time, Create, Cancel; KPI cards each).
- D3 Validation — Submit/Create disabled gates, CC format [VWD], date-range [VWD].
- D4 Re-check/race — forced-submit-while-disabled (UI gate) + outcome-submit failure rollback [VWD] + bulk-assign re-check.
- D5 Negative/error — empty states, no-match search, forced disabled actions, list-load 500 [VWD], submit failure [VWD], cross-SM access denial.
- D6 Context-sensitive — modal header bound to originating row, status-variant drawer/menu, KPI click [VWD].
- D7 Notifications — buyer feedback token URL dispatch (SMS/WhatsApp) asserted; no internal toast claims made (silent-UX rule).
- D8 UI-vs-backend split — vcOutcome required at API mirrors disabled Submit; tampered token at API.
- D9 Role/Auth — SM vs SM-Admin scoping, Assign/SM-dropdown visibility, managerId isolation, unauth redirect, tampered token, reassign-API forbidden.
- D10 Integration — VC_REQUEST offer trigger, LSQ sync (out-of-scope assertion only), Teams link column, Kaleyra click-to-call, buyer token URL, audit trail.
- D11 Boundary — pagination edges/page-size, sort toggles, 10-option dropdown count, empty/zero totals, COMPLETED-unreachable terminal state.

## New-TC IDs (21)

```
TC_CBR_UI_001b   — all summary cards render (full-card enumeration)
TC_CBR_FUNC_056  — Customer Phone masked/clickable (Kaleyra link)
TC_CBR_FUNC_057  — Request ID column shows REQ- identifier
TC_CBR_FUNC_058  — Registration No column shows GHNG- identifier
TC_CBR_FUNC_059  — Request ID column sort asc/desc
TC_CBR_FUNC_060  — Requested At column sort by date/time
TC_CBR_EDGE_061  — change page size repaginates
TC_CBR_EDGE_062  — last partial page boundary
TC_CBR_EDGE_063  — Export reflects current view
TC_CBR_BIZ_064   — bulk-assign reassigns to chosen SM (write)
TC_CBR_FUNC_065  — DOC_DRIFT: no separate Schedule Meeting surface
TC_CBR_FUNC_066  — DOC_DRIFT: no separate Confirm Meeting surface
TC_CBR_VAL_030b  — CC field email-format validation
TC_CBR_FUNC_067  — Create form fields disabled before buyer selected
TC_CBR_FUNC_068  — Create buyer search no-match empty state
TC_CBR_FUNC_069  — callback page requires authenticated SM session
TC_CBR_NEG_070   — tampered/expired SM token rejected on API
SM_CB_028b       — callback list API returns scoped requests
SM_CB_109b       — outcome-submit API requires vcOutcome
TC_CBR_NEG_071   — list-load server error graceful state
TC_CBR_NEG_072   — outcome-submit failure surfaces error, no corruption
```

## Flags

### DOC_DRIFT (live UI contradicts docs — docs to be corrected; tests grounded in live UI)
- **DOC_DRIFT-CBR-001** — FS Features 2/3/4 describe separate Schedule Meeting / Confirm Meeting / Record Outcome (FeedbackDrawer) surfaces. Live UI has ONLY a single more-menu item "Capture VC Outcome" → one modal that drives status transitions. (TC_CBR_FUNC_065, _066, NEG_049, BIZ_035.)
- **DOC_DRIFT-CBR-002** — BRD-SM 4.1 / FS 1.7 / WF item-4 say round-robin by `lastRequestAssignedAt`. Actual = least-loaded; round-robin disabled (callback-request-sm.service.js:338-349); SM-Admin create → self-assign. (SM_CB_FSD_135, TC_CBR_BIZ_043/044.)
- **DOC_DRIFT-CBR-003** — FS 5.3 Create fields (Customer/Preferred Date/Preferred Time/Notes) ≠ live drawer (two-step search→radio, readonly Buyer/SM emails, CC multi-tag, single Date&Time picker, no Notes field). (TC_CBR_FUNC_037-042, _067.)
- **DOC_DRIFT-CBR-004** — FS 5.4 "round-robin assignment" on Create ≠ least-loaded / self-assign for SM Admin. (TC_CBR_BIZ_043.)

### Documented defects referenced
- **BUG-SM-001** — round-robin disabled / SM-Admin self-assign (SM_CB_FSD_135).
- **BUG-SM-002** — COMPLETED unreachable, falls back to CONFIRMED, buyer-feedback completion never reaches COMPLETED (SM_CB_FSD_136, TC_CBR_BIZ_035).

### Scope exclusions
- **LeadSquared (LSQ):** excluded from execution. VC-outcome → LSQ activity sync (TC_CBR_BIZ_055) asserted as documented downstream only; no LSQ calls.
- **External dispatch (Teams / Kaleyra SMS+WhatsApp / buyer token URL):** assert portal-visible artefact only; actual send marked [VERIFY WITH DEV] (SM_CB_028, _109, _FSD_139, _FSD_140).

### Blockers / authorisation gates
- All WRITE TCs (Submit outcome, Create request, bulk Assign / reassign) carry `[TEST_DATA_REQUIRED]` and require explicit user authorisation before execution on UAT (stateful live accounts). Capture-only TCs are execution-safe now.
- Role-split TCs (SM vs SM Admin) require a second SM-Admin login `[TEST_DATA_REQUIRED]`.
- API/DB/log-visibility TCs require `[TEST_DATA_REQUIRED]` access (bearer token / DB read / outbound-traffic log).
- 23 TCs carry `[VERIFY WITH DEV]` for behaviour not pinned by FS/BRD/WF (KPI card filter/recompute semantics, date-range rejection, page-size options, Export scope, Refresh state-persistence, Teams link generation point, error strings, token expiry, audit format).

### No silent feature drops
Every interactive surface in `INDEX.md` is represented: list + 8 summary cards, 16 columns, status/VC-Outcome column filters, date range, SM dropdown, search, pagination, Refresh, Export, bulk Assign, eye→3-tab read-only details drawer, more→Capture VC Outcome modal (10 codes), Create drawer (two-step), empty state.
