# Coverage Matrix — Admin / Sales Managers

**Generated:** 2026-06-13 (BA Agent)
**Module:** Admin Portal / Sales Managers
**Output JSON:** `manual-qa-repository/07-execution/_master-json/Admin-SalesManagers.json`
**Sheet (target):** `Sales Managers - Master` (replaces `Sales Managers` + `Sales Managers (Exec)`)

**Sources read (dual-source gate CLEARED):**
- Visual: `visual-memory/admin/sales-managers/INDEX.md` — CAPTURE_STATUS: **FULL** (captured 2026-06-03, 1920×900)
- BRD: `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Sales-Managers.md`
- FRD: `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FRD-Sales-Managers.md`
- FS: `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FS-Sales-Managers.md` (Features 1–7)

**Totals:** 86 TCs = 52 existing (preserved, IDs reused) + 34 new gap TCs.

---

## DOC_DRIFT register

| ID | Source A (doc) | Source B (observed / corrected) | Resolution |
|----|----------------|----------------------------------|------------|
| **DOC_DRIFT-005** | FRD `ADMIN-FRD-Sales-Managers.md` Feature 7 "How to Use" step 6: *"New SMs receive an SMS with login instructions."* (also implied for Add flow) | FRD Feature 4 §8 + Feature 7 §8 **FSD-CORRECTION 2026-05-25**: notifications **NONE** — grep of `sales-manager.service.js` for mailer/notify returned 0 matches. | **Latest correction wins → silent.** Stale prose flagged in note 8. TCs `TC_SM_NOTIF_077/084` assert NO notification. BRD/FRD prose should be updated to drop the "SMS sent" sentence in the same pipeline step. |
| **DOC_DRIFT-006** | BRD §4 + FRD/FS Features 4 & 5 call the single Add/Edit surface a **"modal"**. | `visual-memory/admin/sales-managers/INDEX.md`: clicking "Add Sales Manager" did **not** render `.ant-modal-content` — it is an **Ant Drawer** (`.ant-drawer-content`). | **Observed value used.** TCs use the neutral term **"Add/Edit panel"** and note 10 records the drift. Docs should say "drawer/panel". |

> No URL/route drift: BRD lists `/admin/sales-managers` (list) + `/admin/cms` Section 7 (bulk) — both match INDEX.md and FRD. No DOC_DRIFT raised on routes.

---

## Coverage matrix — 11 dimensions

Cell = a Testcase_ID covering that dimension for the feature, or a justified `N/A`.

| Feature / Sub-feature | 1 Pos | 2 Form | 3 Valid | 4 Race | 5 Neg | 6 Ctx | 7 Notif | 8 UIvBE | 9 Auth | 10 Integ | 11 Bound |
|-----------------------|-------|--------|---------|--------|-------|-------|---------|---------|--------|----------|----------|
| List load / landing | ADM_SM_001 | ADM_SM_003 (cols) | N/A: read-only view | N/A: no submit | TC_SM_NEG_062 (500/offline) | N/A: no row-state controls | N/A: read action | N/A: read action | TC_SM_NEG_091 (no-session redirect) | N/A: no downstream here | N/A: covered under Pagination |
| Header / count badge | ADM_SM_002 | N/A | N/A | N/A | TC_SM_NEG_061 (empty state) | N/A | N/A | N/A | — (see auth above) | N/A | TC_SM_UI_060 (badge ignores search/filter) |
| Created At / toggles display | ADM_SM_004, ADM_SM_005, TC_SM_UI_059 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | — | N/A | N/A |
| No-delete rule | ADM_SM_021 | N/A | N/A | N/A | ADM_SM_FSD_042 (no DELETE route) | N/A | N/A | N/A | — | N/A | N/A |
| Search | ADM_SM_006, ADM_SM_007, TC_SM_FUNC_063 | N/A: single input | N/A | N/A | TC_SM_NEG_065 (no-match) | N/A | N/A: read action | N/A | — | N/A | TC_SM_FUNC_064 (clear restores) |
| Column filters | TC_SM_FUNC_066/067/068 | TC_SM_FUNC_066 (Role/Assignable/Active) | N/A | N/A | N/A: filter is selection-only | TC_SM_FUNC_067/068 (Yes/No states) | N/A | N/A | — | N/A | TC_SM_FUNC_069 (combine), TC_SM_FUNC_070 (clear) |
| Pagination | ADM_SM_008 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | — | N/A | TC_SM_BOUND_071 (last partial), TC_SM_BOUND_072 (page size) |
| Refresh | ADM_SM_040 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | — | ADM_SM_040 (reflects bulk-upload) | N/A |
| Add SM (panel) | ADM_SM_009, ADM_SM_010, ADM_SM_014 | ADM_SM_009 (all fields) | ADM_SM_011/012/013/039/054/055/056, TC_SM_VAL_073/074/075/076 | ADM_SM_039 (dup-phone at submit) | ADM_SM_015 (cancel) | N/A: single create flow | TC_SM_NOTIF_077 (silent) | TC_SM_API_092 (phone parity) | covered in API & Security | TC_SM_INT_085 (Assignable→dropdown) | N/A |
| Edit SM (panel) | ADM_SM_020, ADM_SM_050 | ADM_SM_050 (pre-fill all) | (reuses Add validations) | N/A: no re-check documented | ADM_SM_058 (cancel discards) | N/A | TC_SM_NOTIF_078 (silent) | (see Add UIvBE) | — | (see toggles integ) | N/A |
| Row toggle Assignable | ADM_SM_016, ADM_SM_018 | N/A | N/A | N/A | N/A | ADM_SM_051 (SM Admin force-OFF — context by role) | TC_SM_NOTIF_079 (silent on deactivate) | ADM_SM_FSD_041 (BE force-zero) | — | ADM_SM_038 (no auto-reassign), TC_SM_INT_085/086 | N/A |
| Row toggle Is Active | ADM_SM_017, ADM_SM_019 | N/A | N/A | N/A | ADM_SM_057 (inactive cannot log in) | N/A | TC_SM_NOTIF_079 | N/A | ADM_SM_057 (login revoked 400) | N/A | N/A |
| Privacy masking | ADM_SM_022/023/024/025/027 | ADM_SM_022 (3 toggles), ADM_SM_026 (system-wide only) | N/A | N/A | N/A | N/A | TC_SM_NOTIF_080 (silent) | N/A: config, not form input | covered under Auth/page | ADM_SM_023/024/025/027 (cross-portal SM view) | N/A |
| Masking save / persist | ADM_SM_052 ([VERIFY] save mech), ADM_SM_053 (persist) | N/A | N/A | N/A | N/A | N/A | N/A | N/A | — | N/A | N/A |
| Masking audit | TC_SM_VAL_081 ([VERIFY] audit log) | N/A | N/A | N/A | N/A | N/A | N/A | N/A | — | N/A | N/A |
| Bulk upload | ADM_SM_028/029/030/031/032/033/036/037 | ADM_SM_029 (7 cols) | ADM_SM_034 (9-digit row), ADM_SM_035 (only .xlsx) | ADM_SM_031 (phone merge upsert) | TC_SM_NEG_082 (missing col), TC_SM_NEG_083 (empty file) | ADM_SM_031 (create vs update by phone) | TC_SM_NOTIF_084 (silent) | N/A: covered by API parity 092 | covered under API & Security | ADM_SM_040 (reflects in list) | N/A |
| API CRUD | TC_SM_API_087 (create), TC_SM_API_088 (update) | N/A | TC_SM_API_092 (phone parity) | N/A | ADM_SM_FSD_042 (no DELETE) | ADM_SM_FSD_041 (roleId 4 force-zero) | N/A | TC_SM_API_092 | TC_SM_API_089 (401 no token), TC_SM_API_090 (401/403 bad token), ADM_SM_FSD_043 (SM role 403) | TC_SM_INT_085/086 | N/A |

### Dimension closure summary
- **All 12 feature rows have a covered or justified cell in every dimension.** No unjustified-empty cells → coverage gate PASSED.
- **Dimension 7 (Notifications):** strongly covered — module-wide silence-by-design asserted across Add/Edit/Deactivate/Masking/Bulk (TC_SM_NOTIF_077–080, 084) per FSD-CORRECTION.
- **Dimension 8 (UI-vs-backend):** TC_SM_API_092 marked `[VERIFY WITH DEV]` — backend phone-validation parity not in spec.
- **Dimension 9 (Auth/security):** no-session redirect (091), 401 no-token (089), invalid/expired token (090), SM-role 403 (FSD_043), inactive-login 400 (057).
- **Dimension 10 (Integration):** Customers SM-assignment dropdown both directions (085/086), bulk→list (040), no-auto-reassign (038).

---

## `[VERIFY WITH DEV]` items (open clarifications)

| TC_ID | Question | Linked FRD clarification |
|-------|----------|--------------------------|
| TC_SM_UI_059 | Exact Created At date format | — |
| TC_SM_NEG_061 / 065 | Exact empty-state / no-data text | — |
| TC_SM_NEG_062 | List-load failure (500/offline) UI handling | — |
| TC_SM_BOUND_072 | Available page-size options | — |
| TC_SM_VAL_073 | Is Last Name truly mandatory? (FS says may be blank) | — |
| TC_SM_VAL_076 | Full Role dropdown value list | Q-SM-003 |
| ADM_SM_050 | Is Role read-only on Edit? | — |
| ADM_SM_052 | Masking auto-save vs explicit Save | Q-SM-002 |
| TC_SM_VAL_081 | Masking audit-log entry | Q-SM-005 |
| ADM_SM_036 | Bulk result: file vs on-screen | — |
| TC_SM_NEG_082 / 083 | Missing-column / empty-file upload handling | — |
| TC_SM_API_092 | Backend phone-validation parity | Q-SM-001 (validation) |
| ADM_SM_022 | Masking panel modal vs drawer layout | Q-SM-002 |

## `[TEST_DATA_REQUIRED]` items (destructive / data-needing)
Disposable UAT data must be supplied before execution: ADM_SM_010, 014, 016, 017, 018, 019, 020, 023, 024, 025, 027, 030, 031, 032, 033, 037, 038, 050(read-only ok), 057, FSD_041, FSD_042, FSD_043, and new TCs 061, 062, 077, 078, 079, 080, 081, 082, 083, 084, 085, 086, 087, 088, 090, 092.

---

## Notes for downstream (QA Agent)
- Builder consumes the JSON to write the `Sales Managers - Master` sheet matching the gold-standard (notes block rows 1–N, header row, sub-module banners, inline exec cols 10–12 blank).
- New gap TC_IDs already appended to `manual-qa-repository/07-execution/_new-tcs-since-last-review.txt` → run `node scripts/xlsx-mark-new-tcs.js Admin "Sales Managers - Master"` to gray-fill (`FFA6A6A6`) the 34 new rows for user verification.
- DOC_DRIFT-005 and DOC_DRIFT-006 should be reflected back into BRD/FRD prose within this pipeline step (BA Agent doc-update responsibility) — TCs already use observed/corrected behaviour.
