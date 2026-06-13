# Coverage Matrix — Admin / Offers

**Module:** Admin / Offers
**Generated:** 2026-06-13 (BA Agent, tc-coverage-contract)
**Sources read:**
- `visual-memory/admin/offers/INDEX.md` (FULL — list states, Add drawer, Edit drawer pre-filled, delete-confirm modal; 1920×900)
- BRD `Admin-Portal/BRD/ADMIN-BRD-Offers.md` (§1-9 + §10 Backend Gap Reconciliation 2026-05-21)
- FRD `Admin-Portal/FRD/ADMIN-FRD-Offers.md` (§3 layout, §5 business rules, §10 data model, §11 API, §8 open clarifications)
- FS `Admin-Portal/FRD/ADMIN-FS-Offers.md` (Features 1-5: View / Create / Edit / Toggle / Delete + §6 validations, §8 notifications, §9 audit)

**Totals:** 76 TCs (47 preserved ADM_OFR_* + 29 new gap TC_OFR_*). Output JSON: `manual-qa-repository/07-execution/_master-json/Admin-Offers.json`.

Legend: dimensions per tc-coverage-contract §1.
1 Pos · 2 Form · 3 Valid · 4 Race · 5 Neg · 6 Ctx · 7 Notif · 8 UIvBE · 9 Auth · 10 Integ · 11 Bound

| Feature / Sub-feature | 1 Pos | 2 Form | 3 Valid | 4 Race | 5 Neg | 6 Ctx | 7 Notif | 8 UIvBE | 9 Auth | 10 Integ | 11 Bound |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Page load / landing | ADM_OFR_001 | N/A: no form on landing | N/A: no input | N/A: no submit | TC_OFR_NEG_049 (no-session redirect) | N/A: single landing state | N/A: read-only landing | N/A | TC_OFR_NEG_049; TC_OFR_NEG_073 (token) | N/A | N/A |
| Count badge | TC_OFR_FUNC_048 | N/A | N/A: derived count | N/A | N/A | N/A | N/A | N/A | N/A | TC_OFR_FUNC_048 (= active+inactive) | N/A |
| Table structure & content | ADM_OFR_002/004/009/015; TC_OFR_FUNC_050/051 | N/A: read-only grid | N/A | N/A | TC_OFR_NEG_052 (empty state) | ADM_OFR_004 (type-driven Amount/% display) | N/A: read-only | N/A | N/A | N/A | TC_OFR_FUNC_051 (non-contiguous Sr.no) |
| Refresh | TC_OFR_FUNC_076 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Pagination | ADM_OFR_034 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | ADM_OFR_034 (single-page edge; multi-page [VERIFY WITH DEV]) |
| Search / filter | ADM_OFR_035 (asserts ABSENT) | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A: feature not present (DOC_DRIFT-004; FRD Q-OFFERS-001 Open) |
| Add drawer — structure | ADM_OFR_003/007; TC_OFR_UI_053/054/055/056 | ADM_OFR_007 (full field set); TC_OFR_UI_053/055/056 | N/A | N/A | TC_OFR_FUNC_057/058 (Cancel/X discard) | ADM_OFR_043 (Amount<->% field swap) | N/A | N/A | N/A | N/A | N/A |
| Create offer (happy) | ADM_OFR_008/013/017/018/019/022 | ADM_OFR_008/013 (all fields exercised) | (see Validation row) | N/A | TC_OFR_FUNC_057/058 | ADM_OFR_018 (single typology) vs ADM_OFR_019 (all) | ADM_OFR_FSD_037 (silent) | TC_OFR_API_072 (date-order BE split, §10.6) | N/A | ADM_OFR_018/019 (typology scope) | N/A |
| Create — validation & boundary | (n/a — negative dimension) | N/A | ADM_OFR_010/011/039/042/014; TC_OFR_VAL_059/060/061/062/063 | N/A | ADM_OFR_010/011/039/042/014/016 | TC_OFR_VAL_062 (type mandatory) | N/A | TC_OFR_API_072 (UI>BE date check) | N/A | N/A | ADM_OFR_040 (100% upper); ADM_OFR_041 (decimal %); TC_OFR_VAL_059 (decimal ₹); ADM_OFR_016 (date-order); TC_OFR_VAL_060/061 (name 100 / desc 500) |
| Edit offer | TC_OFR_FUNC_075/064 | TC_OFR_FUNC_075 (pre-filled full set) | TC_OFR_VAL_066 (re-validate) | TC_OFR_RACE_067 (active edit re-prices) | TC_OFR_FUNC_065 (Cancel discards) | N/A | ADM_OFR_FSD_037 (silent) | N/A | N/A | TC_OFR_RACE_067 (live session) | N/A |
| Toggle active/inactive | ADM_OFR_023/025; TC_OFR_FUNC_068 | N/A: single control | N/A: no input | ADM_OFR_026/032 (mid-campaign / mid-payment) | N/A | TC_OFR_DC_069 (toggle vs edit/delete distinction) | ADM_OFR_FSD_037; TC_OFR_INT_074 (no audit, §10.5) | N/A | N/A | ADM_OFR_024/026 (live re-price) | N/A |
| Delete offer | ADM_OFR_027/028/029/045/046 | ADM_OFR_028/045 (modal title/body/buttons) | N/A | N/A | ADM_OFR_030; TC_OFR_FUNC_070 (Cancel/Escape no-delete); TC_OFR_NEG_071 (no FK guard, §10.4) | TC_OFR_DC_069 (delete icon routing) | ADM_OFR_FSD_037 (silent) | ADM_OFR_044 (soft vs hard, §10.4) | N/A | ADM_OFR_047 (booking unaffected) | N/A |
| Notifications | N/A | N/A | N/A | N/A | N/A | N/A | ADM_OFR_FSD_037 (NO SMS/WA/email on any action) | N/A | N/A | N/A | N/A |
| API & security | ADM_OFR_FSD_038 | N/A | TC_OFR_API_072 (date-order, §10.6) | N/A | TC_OFR_NEG_073 (401/403) | N/A | TC_OFR_INT_074 (no audit) | ADM_OFR_036 (offerCode whitelist, §10.2); ADM_OFR_044 (delete persistence, §10.4) | TC_OFR_NEG_073 (token); ADM_OFR_FSD_038 (projectId scope, §10.3) | ADM_OFR_036; TC_OFR_INT_074 | ADM_OFR_FSD_038 (page/limit params) |
| Integration / allocation pricing | ADM_OFR_005/006 (system offers); ADM_OFR_020/021/024/026/031/033 | N/A | N/A | ADM_OFR_032 (toggle-off mid-payment); ADM_OFR_026 (live toggle) | ADM_OFR_020/021 (future/expired not applied) | ADM_OFR_018/019 (typology eligibility) | N/A | N/A | N/A | ADM_OFR_005/006/020/021/024/026/031/032/033/047 (Allocation/Customers/Towers) | ADM_OFR_031 (multi-offer stacking) |

## N/A justifications (summary)
- **2 Form / read & single-control rows**: the landing page, table, refresh, pagination, toggle and notifications carry no multi-field form to enumerate. Full-form coverage is concentrated on the Add/Edit drawer (ADM_OFR_007, TC_OFR_UI_053-056, TC_OFR_FUNC_075).
- **3 Valid / read rows**: list/table/refresh/toggle/delete accept no free-text numeric input — validation applies only to the Add/Edit form and the API date path (covered in the Create-validation and API rows).
- **4 Race / non-pricing rows**: race conditions only matter where live allocation pricing is re-queried at submit — covered by ADM_OFR_026/032 (toggle) and TC_OFR_RACE_067 (edit). List/structure rows have no submit race.
- **7 Notif**: every state-changing action (create/edit/toggle/delete) is asserted silent by the single required silent-by-design case ADM_OFR_FSD_037; read rows dispatch nothing.
- **9 Auth**: enforced once at the page boundary (TC_OFR_NEG_049 no-session) and the API boundary (TC_OFR_NEG_073 token); per-feature repeats are redundant.
- **11 Bound / search & refresh**: no search input exists (DOC_DRIFT-004); refresh has no boundary surface. Numeric/length boundaries are on the form (ADM_OFR_040/041, TC_OFR_VAL_059/060/061); pagination edge on ADM_OFR_034; inventory stacking on ADM_OFR_031.

## Self-audit gate result
No unjustified-empty cell. Every dimension is covered by a TC_ID or a specific N/A. **Module coverage complete.**

## DOC_DRIFT raised (BRD/FRD/FS must be reconciled to live UI / latest backend audit)
- **DOC_DRIFT-001** — Delete persistence conflict. BRD §10.4 (latest, 2026-05-21) = HARD destroy (`offer.destroy()`, no `deletedAt`, no audit, no FK guard, permanent Sr.no gaps). FRD §10 / §11 (DELETE) and FS Feature 5 §6.4 say soft-delete (Sequelize paranoid). TCs assert observed UI removal + flag DB layer (ADM_OFR_029/044, TC_OFR_NEG_071). **Action:** correct FRD/FS to match the BRD §10.4 code audit (hard destroy) — observed/latest wins.
- **DOC_DRIFT-002** — Typology is SINGLE-select scalar (`unitTypologyId`, INDEX.md + BRD §10.1), NOT "Multi-select" as FRD §3/§4 and FS Feature 2 §5 state. TCs use single-select (ADM_OFR_018/019). **Action:** correct FRD/FS "Multi-select" → single-select; note multi-typology requires multiple offers.
- **DOC_DRIFT-003** — `offerCode` whitelist conflict. BRD §10.2 (latest) = `offerCode` read straight from `req.body`, NO whitelist (admin CAN set HOME_LOAN/VC_REQUEST). FS Feature 2 §6.8 + existing ADM_OFR_036 claim it is stripped to NULL / system-only. TC ADM_OFR_036 asserts observed + flags. **Action:** correct FS/FRD to the permissive current behaviour OR confirm a whitelist is added.
- **DOC_DRIFT-004** — No search/filter on the list page. INDEX.md + FRD §3 confirm only Refresh + Add New Offer; former ADM_OFR_035 assumed a search field. TC re-purposed to assert ABSENCE. FRD Q-OFFERS-001 ("is search planned?") remains Open. **Action:** keep FRD aligned to "no search"; resolve Q-OFFERS-001.
- **DOC_DRIFT-005** — Delete-modal text. INDEX.md confirms title 'Are you sure you want to delete this offer?' / body 'This action cannot be undone.' / buttons 'Cancel' + 'Yes, delete' — the modal does NOT echo the offer name. Former ADM_OFR_045 claimed the dialog "shows offer name by name". TC corrected to the observed text. **Action:** none for docs (FRD §3 already correct); legacy TC wording fixed.
- **DOC_DRIFT-006** — Audit-logging conflict. FRD §Feature 4 §9 / FS §9 claim create/edit/toggle are audit-logged; BRD §10.5/§10.6 (latest code audit) say toggle and create/edit emit NO service-level audit. TC_OFR_INT_074 asserts observed + flags. **Action:** correct FRD/FS audit claims to match the code audit.

## Open flags carried into TCs
- **[VERIFY WITH DEV]**: TC_OFR_VAL_059 (decimal ₹), TC_OFR_VAL_060 (name counter), TC_OFR_VAL_062 (type unset path), ADM_OFR_036 (offerCode), ADM_OFR_044 (soft/hard), ADM_OFR_040 (100% intent), ADM_OFR_043 (value-clear on swap), TC_OFR_RACE_067, TC_OFR_NEG_071/073, TC_OFR_API_072, TC_OFR_INT_074, ADM_OFR_FSD_037/038, ADM_OFR_020/021/024/026/031/032/033/047, TC_OFR_NEG_052 (empty-state text).
- **[TEST_DATA_REQUIRED]**: ADM_OFR_008/013/015/017/018/019/040/041 (disposable create offers), ADM_OFR_023/025/029/046 + TC_OFR_FUNC_064/068 (disposable toggle/edit/delete offers), ADM_OFR_005/006 (system-offer preconditions), ADM_OFR_020/021/024/026/031/032/033/047 (priced units / completed bookings), ADM_OFR_036/038/044/071/072/073/074 + ADM_OFR_FSD_037 (API token / DB / audit / log access), TC_OFR_NEG_052 (zero-offer project).

## Destructive-case discipline
All create/edit-save/toggle/delete UI cases are authored as OPEN drawer/modal → assert structure & text → CLOSE (Cancel/Escape). Actual submit/toggle/delete on UAT requires explicit user authorisation + disposable test data (CLAUDE.md Pipeline Discipline §7; BRD §8 CRITICAL — live pricing impact). Flagged inline in each TC's Expected result ("AUTHORISED-... ONLY").
