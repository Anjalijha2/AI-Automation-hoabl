# Coverage Matrix — Self-Audit Gate — Admin / Channel Partners

Module: Admin / Channel Partners
Sources read:
- visual-memory/admin/channel-partners/INDEX.md (CAPTURE_STATUS: FULL — but list + selection + map-modal only; drawer and three-dot NOT captured)
- BRD: `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Channel-Partners.md`
- FRD: `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FRD-Channel-Partners.md`
- FS:  `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FS-Channel-Partners.md`

Sheet: `Channel Partners - Master` · Total TCs: 62 · New gap TCs: 12

Dimensions key: 1 Pos · 2 Form · 3 Valid · 4 Race · 5 Neg · 6 Ctx · 7 Notif · 8 UIvBE · 9 Auth · 10 Integ · 11 Bound

| Feature / Sub-feature | 1 Pos | 2 Form | 3 Valid | 4 Race | 5 Neg | 6 Ctx | 7 Notif | 8 UIvBE | 9 Auth | 10 Integ | 11 Bound |
|-----------------------|-------|--------|---------|--------|-------|-------|---------|---------|--------|----------|----------|
| Page load / landing | ADM_CP_001 | N/A: read-only landing, no form | N/A: no input | N/A: no submit | ADM_CP_055 (500) | N/A: single layout | N/A: read-only | N/A | ADM_CP_052 (no-session redirect) | N/A | N/A |
| Header count (live total) | ADM_CP_002 | N/A | N/A | N/A | N/A | ADM_CP_012 (unchanged by search) | N/A | N/A | N/A | N/A | N/A |
| Header buttons / states | ADM_CP_003 | ADM_CP_003 | N/A | N/A | N/A | ADM_CP_004 (disabled no-sel) | N/A | N/A | N/A | N/A | N/A |
| Table columns | ADM_CP_005, _006 | N/A | N/A | N/A | N/A | ADM_CP_007 (actions cell [VWD]) | N/A | N/A | N/A | N/A | N/A |
| CP Type / KYC / SM cells | ADM_CP_008, _009 | N/A | N/A | N/A | ADM_CP_010 (dash unassigned) | ADM_CP_008/_009 (tag states) | N/A | N/A | N/A | ADM_CP_038 (SM source) | N/A |
| Search by phone | ADM_CP_011, _011b | N/A | N/A | N/A: server filter, no submit form | ADM_CP_040 (no match) | N/A | N/A | ADM_CP_054 (API > UI) | N/A | N/A | N/A |
| Column filters | ADM_CP_013–_020 | ADM_CP_013–_020 | N/A | N/A | ADM_CP_056 (zero-row) | ADM_CP_019/_020 (type variants) + ADM_CP_051 (combine) | N/A | ADM_CP_054 | N/A | N/A | N/A |
| Reset Filters / Refresh | ADM_CP_021, _022 | N/A | N/A | N/A | N/A | ADM_CP_022 ([VWD] preserve vs clear) | N/A | N/A | N/A | N/A | N/A |
| CP Detail drawer | ADM_CP_023–_028 [VWD] | ADM_CP_024–_027 (sections) | N/A | N/A | N/A | ADM_CP_027b (read-only), _046/_047 [VWD speculative] | N/A: read-only | N/A | N/A | ADM_CP_027 (Master HV in drawer) | N/A |
| Mark as Master (3-dot) | ADM_CP_030 [VWD] | N/A: no form, single action | N/A | N/A | ADM_CP_FSD_043 (no CRUD) | ADM_CP_029 (menu [VWD]) | ADM_CP_FSD_044 (silent) | N/A | N/A | ADM_CP_030 (appears in dropdown) | N/A |
| Row selection / Map btn state | ADM_CP_031, _032 | N/A | N/A | N/A | N/A | ADM_CP_004 (disabled), _050 (deselect) | N/A | N/A | N/A | N/A | N/A |
| Map to Master modal | ADM_CP_033, _037 | ADM_CP_033, _034, _035, _037b (Cancel) | ADM_CP_036 (Master required) | ADM_CP_042 (remap replaces), ADM_CP_049 (master-under-master [VWD]) | ADM_CP_036 | ADM_CP_035 (masters only) | ADM_CP_FSD_044b (silent) | N/A | N/A | ADM_CP_035 (masters endpoint) | N/A |
| Bulk Map (Excel) | ADM_CP_048 [VWD] | ADM_CP_048 (file field) | ADM_CP_048b (file type [VWD]) | N/A | ADM_CP_048b | N/A | (covered by FS §8 silent) | N/A | N/A | N/A | ADM_CP_048b (upload type/size [VWD]) |
| Pagination | ADM_CP_041 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | ADM_CP_041, _041b (last partial page) |
| Cross-module (SM / Customers) | ADM_CP_038, _039 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | ADM_CP_038 (SM), _039 (Growth Partner) | N/A |
| API & Security | — | N/A | N/A | N/A | ADM_CP_053 (invalid token) | N/A | ADM_CP_FSD_044/_044b | ADM_CP_054 | ADM_CP_052, _053, ADM_CP_FSD_045 (role) | N/A | N/A |
| Error handling | — | N/A | N/A | N/A | ADM_CP_055 (500), _056 (empty), _040 (no match) | N/A | N/A | N/A | N/A | N/A | N/A |

## Notes
- **Notifications dimension (7):** module is silent by design across all admin actions (FS §8). Asserted explicitly in ADM_CP_FSD_044 (mark-master) and ADM_CP_FSD_044b (map-master). Read-only views are justified N/A.
- **UI-vs-backend (8):** ADM_CP_054 proves API accepts cpType/masterHvCode/businessRegion params; flagged [VERIFY WITH DEV] for whether backend enforces UI constraints.
- **Boundary (11):** pagination edges covered (ADM_CP_041/_041b); file-upload type/size under bulk-map (ADM_CP_048b). No numeric form fields exist in this module, so numeric-boundary cases are N/A: module has no numeric input fields.

## DOC_DRIFT raised
- **DOC_DRIFT-CP-001** — Header count literal: BRD/FRD/FS say "2705 Channel Partners"; live UI (visual-memory 2026-06-03) shows "2709 Channel Partners". Count is a live total. BRD/FRD/FS should be updated to state the number is dynamic, not the literal 2705. TC ADM_CP_002 reads the live number.
- **DOC_DRIFT-CP-002** — Header button label: BRD/FRD/FS call it "Map Master CP"; live UI label (visual-memory) is "Map to Master" (and the modal confirm button is also "Map to Master"). Docs should be updated to the observed label.
- **DOC_DRIFT-CP-003** — Row actions: BRD §4 / FRD §3 / FS Feature 5 describe a three-dot (…) menu with "Mark as Master"; visual-memory's captured Actions cell shows ONLY a single eye icon (`button.cp-row-action`). The three-dot menu is unconfirmed. All three-dot / Mark-as-Master cases flagged [VERIFY WITH DEV].
- **DOC_DRIFT-CP-004** — CP Detail drawer not captured: FRD/FS document the drawer (title "Channel Partner Details", 4 sections) but visual-memory has no drawer screenshot. All drawer-internal cases flagged [VERIFY WITH DEV].

## Conflicts surfaced (not silently resolved)
- **Role conflict:** BRD §2 lists "Sales Manager Admin" as a user of this screen, but prior FSD-correction case ADM_CP_FSD_045 asserts SM Admin gets 403 on admin CP endpoints. Surfaced in ADM_CP_FSD_045 expected result; needs dev confirmation.
- **CP Type tag value:** visual-memory shows a CP Type tag reading "Standalone"; FRD/FS enumerate only "Master CP"/"Member CP". Surfaced in ADM_CP_008 [VERIFY WITH DEV].
- **Stale doc values:** ADM_CP_039/_038 reference FRD test CP data (7888888888 / HV00026097) — marked [TEST_DATA_REQUIRED] to confirm still valid on UAT.

## No-silent-drop confirmation
All 49 existing IDs from the prior "Channel Partners" sheet are preserved. Speculative drawer cases ADM_CP_046 (KYC docs) and ADM_CP_047 (mapped-member count) are NOT documented in FS drawer sections — retained but re-marked [VERIFY WITH DEV] rather than dropped (no replacement exists). No case was superseded/deleted.
